import express from 'express';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/recipes — list all with filters + pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, cuisine, category, difficulty, search, sort = '-createdAt' } = req.query;
    const filter = { isPublic: true };
    if (cuisine) filter.cuisine = cuisine;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.$text = { $search: search };

    const total = await Recipe.countDocuments(filter);
    const recipes = await Recipe.find(filter)
      .sort(sort).skip((page - 1) * limit).limit(Number(limit))
      .populate('author', 'name');

    res.json({ success: true, data: recipes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/recipes/search?ingredients=tomato,onion&mode=any
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { ingredients, mode = 'any', dietary, cuisine, difficulty } = req.query;
    if (!ingredients) return res.json({ success: true, data: [] });

    const ingList = ingredients.split(',').map(i => i.trim().toLowerCase()).filter(Boolean);
    if (!ingList.length) return res.json({ success: true, data: [] });

    const filter = { isPublic: true };
    filter.ingredientNames = mode === 'all' ? { $all: ingList } : { $in: ingList };
    if (dietary) filter.dietaryInfo = { $in: dietary.split(',') };
    if (cuisine) filter.cuisine = cuisine;
    if (difficulty) filter.difficulty = difficulty;

    const recipes = await Recipe.find(filter).populate('author', 'name').sort('-averageRating');

    const annotated = recipes.map(r => {
      const obj = r.toObject();
      obj.matchedIngredients = obj.ingredientNames.filter(n => ingList.includes(n));
      obj.missingIngredients = obj.ingredientNames.filter(n => !ingList.includes(n));
      obj.matchScore = obj.matchedIngredients.length;
      obj.matchPercent = Math.round((obj.matchedIngredients.length / obj.ingredientNames.length) * 100);
      return obj;
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, data: annotated, searched: ingList });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/recipes/suggestions — based on pantry
router.get('/suggestions', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('pantry dietaryPreferences cookingLevel');
    const pantryNames = user.pantry.map(i => i.name.toLowerCase());
    if (!pantryNames.length) return res.json({ success: true, data: [], message: 'Add items to your pantry first' });

    const filter = { isPublic: true, ingredientNames: { $in: pantryNames } };
    if (user.cookingLevel === 'beginner') filter.difficulty = 'easy';

    const recipes = await Recipe.find(filter).sort('-averageRating').limit(20);
    const scored = recipes.map(r => {
      const obj = r.toObject();
      obj.matchedIngredients = obj.ingredientNames.filter(n => pantryNames.includes(n));
      obj.missingIngredients = obj.ingredientNames.filter(n => !pantryNames.includes(n));
      obj.matchPercent = Math.round((obj.matchedIngredients.length / obj.ingredientNames.length) * 100);
      return obj;
    }).sort((a, b) => b.matchPercent - a.matchPercent);

    res.json({ success: true, data: scored });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/recipes/trending
router.get('/trending', async (req, res) => {
  try {
    const recipes = await Recipe.find({ isPublic: true }).sort('-viewCount -averageRating').limit(8).populate('author', 'name');
    res.json({ success: true, data: recipes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/recipes/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, byCuisine, byDifficulty, topRated] = await Promise.all([
      Recipe.countDocuments({ isPublic: true }),
      Recipe.aggregate([{ $match: { isPublic: true } }, { $group: { _id: '$cuisine', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Recipe.aggregate([{ $match: { isPublic: true } }, { $group: { _id: '$difficulty', count: { $sum: 1 } } }]),
      Recipe.find({ isPublic: true }).sort('-averageRating').limit(5).select('name averageRating totalRatings')
    ]);
    res.json({ success: true, data: { total, byCuisine, byDifficulty, topRated } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/recipes/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name');
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    await Recipe.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json({ success: true, data: recipe });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/recipes/:id/scale?servings=8
router.get('/:id/scale', async (req, res) => {
  try {
    const targetServings = Number(req.query.servings) || 4;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Not found' });
    const factor = targetServings / (recipe.servings || 4);
    const scaled = recipe.toObject();
    scaled.ingredients = scaled.ingredients.map(ing => {
      const n = parseFloat(ing.quantity);
      if (!isNaN(n)) ing.quantity = (n * factor).toFixed(2).replace(/\.?0+$/, '');
      return ing;
    });
    if (scaled.nutrition) {
      Object.keys(scaled.nutrition).forEach(k => {
        if (scaled.nutrition[k]) scaled.nutrition[k] = Math.round(scaled.nutrition[k] * factor);
      });
    }
    scaled.servings = targetServings;
    res.json({ success: true, data: scaled });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/recipes
router.post('/', protect, async (req, res) => {
  try {
    const recipe = new Recipe({ ...req.body, author: req.user._id, authorName: req.user.name });
    await recipe.save();
    res.status(201).json({ success: true, data: recipe });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PUT /api/recipes/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Not found' });
    if (recipe.author?.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// DELETE /api/recipes/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Not found' });
    if (recipe.author?.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await recipe.deleteOne();
    res.json({ success: true, message: 'Recipe deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/recipes/:id/review
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating 1-5 required' });
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Not found' });
    recipe.reviews = recipe.reviews.filter(r => r.userId?.toString() !== req.user._id.toString());
    recipe.reviews.push({ userId: req.user._id, userName: req.user.name, rating, comment });
    const total = recipe.reviews.reduce((s, r) => s + r.rating, 0);
    recipe.averageRating = Math.round((total / recipe.reviews.length) * 10) / 10;
    recipe.totalRatings = recipe.reviews.length;
    await recipe.save();
    res.json({ success: true, data: recipe });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/recipes/:id/favorite (toggle)
router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const recipeId = req.params.id;
    const isFav = user.favorites.map(f => f.toString()).includes(recipeId);
    if (isFav) {
      user.favorites = user.favorites.filter(f => f.toString() !== recipeId);
      await Recipe.findByIdAndUpdate(recipeId, { $inc: { favoriteCount: -1 } });
    } else {
      user.favorites.push(recipeId);
      await Recipe.findByIdAndUpdate(recipeId, { $inc: { favoriteCount: 1 } });
    }
    await user.save();
    res.json({ success: true, isFavorite: !isFav });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

export default router;
