import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// ── Inline models ──────────────────────────────────────────────────────────────
const RecipeSchema = new mongoose.Schema({
  name: String, description: String, cuisine: String, category: String,
  difficulty: String, prepTime: Number, cookTime: Number, servings: Number,
  tags: [String], dietaryInfo: [String], imageUrl: { type: String, default: '' },
  ingredients: [{ name: String, quantity: String, unit: String, notes: String, isOptional: { type: Boolean, default: false } }],
  ingredientNames: [String],
  steps: [{ stepNumber: Number, instruction: String, duration: Number, tip: String }],
  nutrition: { calories: Number, protein: Number, carbs: Number, fat: Number, fiber: Number },
  substitutions: [{ original: String, alternatives: [String], note: String }],
  reviews: [{ userName: String, rating: Number, comment: String, createdAt: { type: Date, default: Date.now } }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  authorName: { type: String, default: 'RecipeVault' },
  isPublic: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
RecipeSchema.pre('save', function(next) {
  this.ingredientNames = this.ingredients.map(i => i.name.toLowerCase().trim());
  next();
});
const Recipe = mongoose.model('Recipe', RecipeSchema);

const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  cookingLevel: { type: String, default: 'intermediate' },
  dietaryPreferences: [String],
  pantry: [{ name: String, quantity: String, unit: String, expiresAt: Date }],
  favorites: [mongoose.Schema.Types.ObjectId], shoppingList: [],
  role: { type: String, default: 'user' }
});
const User = mongoose.model('User', UserSchema);

// ── Recipe Data ────────────────────────────────────────────────────────────────
const RECIPES = [
  {
    name: 'Butter Chicken (Murgh Makhani)',
    description: 'Rich, creamy tomato-based curry with tender chicken. The king of Indian restaurant dishes.',
    cuisine: 'indian', category: 'dinner', difficulty: 'medium',
    prepTime: 20, cookTime: 40, servings: 4,
    tags: ['curry', 'creamy', 'spicy', 'popular', 'chicken'],
    dietaryInfo: ['halal'],
    ingredients: [
      { name: 'Chicken', quantity: '600', unit: 'g', notes: 'boneless thighs preferred' },
      { name: 'Butter', quantity: '3', unit: 'tbsp' },
      { name: 'Onion', quantity: '2', unit: 'medium', notes: 'finely chopped' },
      { name: 'Tomato puree', quantity: '1', unit: 'cup' },
      { name: 'Heavy cream', quantity: '200', unit: 'ml' },
      { name: 'Garam masala', quantity: '2', unit: 'tsp' },
      { name: 'Ginger garlic paste', quantity: '2', unit: 'tbsp' },
      { name: 'Red chilli powder', quantity: '1', unit: 'tsp' },
      { name: 'Kasuri methi', quantity: '1', unit: 'tsp', isOptional: true },
      { name: 'Salt', quantity: '1', unit: 'tsp' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Marinate chicken in yogurt, chilli powder, ginger garlic paste and salt for at least 30 minutes.', duration: 30, tip: 'Overnight marination gives the best flavour.' },
      { stepNumber: 2, instruction: 'Grill or pan-fry marinated chicken until charred on edges. Set aside.', duration: 12 },
      { stepNumber: 3, instruction: 'Melt butter in a heavy pan. Sauté onions until golden brown — about 8 minutes.', duration: 8, tip: 'Don\'t rush this step. Caramelised onions are the key.' },
      { stepNumber: 4, instruction: 'Add ginger garlic paste, cook 2 minutes. Add tomato puree and spices. Simmer 15 minutes until oil separates.', duration: 17 },
      { stepNumber: 5, instruction: 'Blend the sauce smooth. Return to pan, add grilled chicken and cream. Simmer 10 minutes.', duration: 10 },
      { stepNumber: 6, instruction: 'Crush and add kasuri methi. Adjust salt. Serve with naan or rice.', duration: 2, tip: 'Kasuri methi is the secret restaurant flavour.' }
    ],
    nutrition: { calories: 480, protein: 38, carbs: 14, fat: 30, fiber: 3 },
    substitutions: [
      { original: 'Heavy cream', alternatives: ['Coconut cream', 'Cashew paste', 'Full fat yogurt'], note: 'Coconut cream works great for dairy-free' },
      { original: 'Kasuri methi', alternatives: ['Fresh fenugreek leaves', 'Skip it'], note: 'Available in Indian grocery stores' }
    ],
    reviews: [
      { userName: 'Priya S', rating: 5, comment: 'Better than restaurant quality!' },
      { userName: 'Rahul M', rating: 5, comment: 'Made it twice already. Family loves it.' },
      { userName: 'Sneha K', rating: 4, comment: 'Excellent. I reduced the cream to make it lighter.' }
    ],
    averageRating: 4.7, totalRatings: 3, viewCount: 284
  },
  {
    name: 'Maggi Masala Noodles Upgrade',
    description: 'The classic 2-minute noodles elevated with fresh vegetables and a spice boost.',
    cuisine: 'indian', category: 'snack', difficulty: 'easy',
    prepTime: 5, cookTime: 10, servings: 1,
    tags: ['quick', 'comfort food', 'student meal', '15 minutes'],
    dietaryInfo: ['vegetarian'],
    ingredients: [
      { name: 'Maggi noodles', quantity: '1', unit: 'packet' },
      { name: 'Onion', quantity: '1', unit: 'small', notes: 'finely chopped' },
      { name: 'Tomato', quantity: '1', unit: 'medium', notes: 'chopped' },
      { name: 'Green chilli', quantity: '1', unit: '' },
      { name: 'Egg', quantity: '1', unit: '', isOptional: true },
      { name: 'Oil', quantity: '1', unit: 'tsp' },
      { name: 'Water', quantity: '1.5', unit: 'cups' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Heat oil in a pan. Sauté onion and green chilli for 2 minutes.', duration: 2 },
      { stepNumber: 2, instruction: 'Add tomato and cook until soft, about 2 minutes.', duration: 2 },
      { stepNumber: 3, instruction: 'Add water and bring to boil. Add noodles and tastemaker sachet.', duration: 2 },
      { stepNumber: 4, instruction: 'Crack egg in, stir gently to mix into noodles.', duration: 1, tip: 'Adding egg makes it much more filling.' },
      { stepNumber: 5, instruction: 'Cook 2 minutes until water is mostly absorbed. Serve hot.', duration: 2, tip: 'Leave a little moisture — dry noodles are sad.' }
    ],
    nutrition: { calories: 320, protein: 9, carbs: 48, fat: 11, fiber: 2 },
    substitutions: [
      { original: 'Maggi noodles', alternatives: ['Any instant noodles', 'Ramen', 'Hakka noodles'] },
      { original: 'Egg', alternatives: ['Paneer cubes', 'Tofu', 'Extra vegetables'] }
    ],
    reviews: [
      { userName: 'Arjun T', rating: 5, comment: 'This is exactly how hostel meals should be made.' },
      { userName: 'Divya R', rating: 4, comment: 'Added extra cheese on top — 10/10.' }
    ],
    averageRating: 4.5, totalRatings: 2, viewCount: 412
  },
  {
    name: 'Dal Tadka',
    description: 'Comforting yellow lentil curry with a smoky tempered spice oil poured on top.',
    cuisine: 'indian', category: 'lunch', difficulty: 'easy',
    prepTime: 10, cookTime: 30, servings: 4,
    tags: ['lentils', 'vegan', 'comfort', 'protein', 'healthy'],
    dietaryInfo: ['vegetarian', 'vegan', 'gluten-free'],
    ingredients: [
      { name: 'Yellow lentils', quantity: '1', unit: 'cup', notes: 'toor dal' },
      { name: 'Onion', quantity: '1', unit: 'large', notes: 'chopped' },
      { name: 'Tomato', quantity: '2', unit: 'medium', notes: 'chopped' },
      { name: 'Garlic', quantity: '6', unit: 'cloves', notes: 'minced' },
      { name: 'Ginger', quantity: '1', unit: 'inch piece' },
      { name: 'Cumin seeds', quantity: '1', unit: 'tsp' },
      { name: 'Turmeric', quantity: '0.5', unit: 'tsp' },
      { name: 'Red chilli powder', quantity: '1', unit: 'tsp' },
      { name: 'Ghee', quantity: '2', unit: 'tbsp' },
      { name: 'Coriander leaves', quantity: '2', unit: 'tbsp', notes: 'for garnish' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Wash lentils and pressure cook with turmeric and 2.5 cups water for 3 whistles.', duration: 25 },
      { stepNumber: 2, instruction: 'Heat 1 tbsp ghee. Sauté onions until golden. Add ginger, garlic, cook 2 min.', duration: 10 },
      { stepNumber: 3, instruction: 'Add tomatoes and all spices except cumin. Cook until tomatoes break down.', duration: 8 },
      { stepNumber: 4, instruction: 'Mix masala into cooked dal. Simmer 5 min.', duration: 5 },
      { stepNumber: 5, instruction: 'For tadka: heat remaining ghee until smoking. Add cumin seeds — splutter. Pour over dal.', duration: 2, tip: 'The hot tadka poured at the end is what makes this dish.' },
      { stepNumber: 6, instruction: 'Garnish with coriander. Serve with rice or roti.', duration: 1 }
    ],
    nutrition: { calories: 280, protein: 16, carbs: 42, fat: 7, fiber: 9 },
    substitutions: [
      { original: 'Yellow lentils', alternatives: ['Red lentils (masoor)', 'Moong dal'], note: 'Each gives slightly different texture' },
      { original: 'Ghee', alternatives: ['Butter', 'Oil (for vegan)'] }
    ],
    reviews: [
      { userName: 'Meena V', rating: 5, comment: 'Tastes just like mom\'s!' },
      { userName: 'Kiran P', rating: 5, comment: 'Made this for my family and they were impressed.' }
    ],
    averageRating: 5.0, totalRatings: 2, viewCount: 189
  },
  {
    name: 'Aloo Paratha',
    description: 'Stuffed Indian flatbread with spiced mashed potato filling — a Punjabi breakfast favourite.',
    cuisine: 'indian', category: 'breakfast', difficulty: 'medium',
    prepTime: 30, cookTime: 20, servings: 4,
    tags: ['bread', 'potato', 'breakfast', 'punjabi'],
    dietaryInfo: ['vegetarian'],
    ingredients: [
      { name: 'Whole wheat flour', quantity: '2', unit: 'cups' },
      { name: 'Potato', quantity: '3', unit: 'large', notes: 'boiled and mashed' },
      { name: 'Onion', quantity: '1', unit: 'medium', notes: 'finely chopped' },
      { name: 'Green chilli', quantity: '2', unit: '' },
      { name: 'Coriander leaves', quantity: '3', unit: 'tbsp' },
      { name: 'Cumin seeds', quantity: '1', unit: 'tsp' },
      { name: 'Butter', quantity: '4', unit: 'tbsp', notes: 'for cooking' },
      { name: 'Salt', quantity: '1.5', unit: 'tsp' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Mix flour with salt and water to make a soft dough. Rest 20 minutes.', duration: 20, tip: 'Rested dough rolls much more evenly.' },
      { stepNumber: 2, instruction: 'Mix mashed potato with onion, chilli, coriander, cumin and salt.', duration: 5 },
      { stepNumber: 3, instruction: 'Flatten a dough ball, place filling in centre, fold edges up and seal.', duration: 5, tip: 'Make sure there are no gaps or the filling bursts while rolling.' },
      { stepNumber: 4, instruction: 'Gently roll stuffed ball into a 7-inch circle using light pressure.', duration: 3 },
      { stepNumber: 5, instruction: 'Cook on hot tawa 2 min per side until brown spots appear. Apply generous butter.', duration: 5, tip: 'Don\'t be shy with the ghee — it\'s what makes it special.' }
    ],
    nutrition: { calories: 340, protein: 8, carbs: 56, fat: 10, fiber: 5 },
    reviews: [
      { userName: 'Gurpreet S', rating: 5, comment: 'My grandmother would approve!' },
      { userName: 'Ananya D', rating: 5, comment: 'Perfect for Sunday mornings with yogurt and pickle.' }
    ],
    averageRating: 5.0, totalRatings: 2, viewCount: 203
  },
  {
    name: 'Egg Fried Rice',
    description: 'Quick, flavourful fried rice with scrambled egg, vegetables and soy sauce.',
    cuisine: 'chinese', category: 'lunch', difficulty: 'easy',
    prepTime: 10, cookTime: 12, servings: 2,
    tags: ['rice', 'eggs', 'quick', '20 minutes', 'leftover rice'],
    dietaryInfo: ['vegetarian'],
    ingredients: [
      { name: 'Cooked rice', quantity: '2', unit: 'cups', notes: 'day-old rice works best' },
      { name: 'Egg', quantity: '3', unit: '' },
      { name: 'Onion', quantity: '1', unit: 'small', notes: 'chopped' },
      { name: 'Carrot', quantity: '1', unit: 'medium', notes: 'diced small' },
      { name: 'Green peas', quantity: '0.25', unit: 'cup' },
      { name: 'Soy sauce', quantity: '2', unit: 'tbsp' },
      { name: 'Sesame oil', quantity: '1', unit: 'tsp' },
      { name: 'Garlic', quantity: '3', unit: 'cloves', notes: 'minced' },
      { name: 'Oil', quantity: '2', unit: 'tbsp' },
      { name: 'Spring onion', quantity: '2', unit: 'stalks', notes: 'garnish' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Break up rice clumps. Beat eggs with a pinch of salt.', duration: 2, tip: 'Cold day-old rice is essential — fresh rice becomes mushy.' },
      { stepNumber: 2, instruction: 'Heat oil in wok on HIGH heat until smoking. Scramble eggs quickly. Remove to plate.', duration: 2, tip: 'High heat is the secret to restaurant-style fried rice.' },
      { stepNumber: 3, instruction: 'Same wok, add oil. Stir-fry garlic, onion, carrot and peas 2 minutes.', duration: 2 },
      { stepNumber: 4, instruction: 'Add rice. Spread across wok, let sit 30 seconds, then toss. Repeat 3 times.', duration: 4, tip: 'Don\'t stir continuously — let it sit and crisp between tosses.' },
      { stepNumber: 5, instruction: 'Add egg back, soy sauce, and sesame oil. Toss 1 minute.', duration: 1 },
      { stepNumber: 6, instruction: 'Garnish with spring onion and serve immediately.', duration: 1 }
    ],
    nutrition: { calories: 420, protein: 16, carbs: 58, fat: 14, fiber: 3 },
    reviews: [
      { userName: 'Chen W', rating: 5, comment: 'The high heat tip changed everything. Proper wok hei!' },
      { userName: 'Ritika M', rating: 4, comment: 'Added chilli sauce — highly recommend.' }
    ],
    averageRating: 4.5, totalRatings: 2, viewCount: 317
  },
  {
    name: 'Paneer Tikka',
    description: 'Marinated and grilled cottage cheese cubes with peppers — vegetarian tandoor classic.',
    cuisine: 'indian', category: 'appetizer', difficulty: 'easy',
    prepTime: 30, cookTime: 15, servings: 3,
    tags: ['paneer', 'grilled', 'starter', 'vegetarian', 'barbecue'],
    dietaryInfo: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Paneer', quantity: '300', unit: 'g', notes: '1-inch cubes' },
      { name: 'Yogurt', quantity: '200', unit: 'g', notes: 'thick' },
      { name: 'Bell pepper', quantity: '1', unit: 'large', notes: 'cut into pieces' },
      { name: 'Onion', quantity: '1', unit: 'large', notes: 'quartered' },
      { name: 'Red chilli powder', quantity: '1.5', unit: 'tsp' },
      { name: 'Garam masala', quantity: '1', unit: 'tsp' },
      { name: 'Tandoori masala', quantity: '1', unit: 'tbsp' },
      { name: 'Ginger garlic paste', quantity: '1', unit: 'tbsp' },
      { name: 'Lemon juice', quantity: '1', unit: 'tbsp' },
      { name: 'Oil', quantity: '1', unit: 'tbsp' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Whisk yogurt with all spices, ginger garlic paste, lemon juice and oil into a marinade.', duration: 5 },
      { stepNumber: 2, instruction: 'Coat paneer, pepper and onion in marinade. Refrigerate 30 minutes minimum.', duration: 30, tip: 'Overnight marination = maximum flavour.' },
      { stepNumber: 3, instruction: 'Thread alternating pieces of paneer, pepper, onion onto skewers.', duration: 5 },
      { stepNumber: 4, instruction: 'Grill on high heat turning once, until charred spots appear — about 12 minutes.', duration: 12, tip: 'Let each side char before turning.' },
      { stepNumber: 5, instruction: 'Serve hot with mint chutney and lemon wedges.', duration: 1 }
    ],
    nutrition: { calories: 290, protein: 18, carbs: 12, fat: 20, fiber: 2 },
    reviews: [
      { userName: 'Neha R', rating: 5, comment: 'Nailed it on the first try! Party hit.' },
      { userName: 'Vikram S', rating: 4, comment: 'Oven grill works perfectly for this.' }
    ],
    averageRating: 4.5, totalRatings: 2, viewCount: 245
  },
  {
    name: 'Chicken Biryani',
    description: 'Fragrant layered rice and chicken slow-cooked with whole spices — a celebration in a pot.',
    cuisine: 'indian', category: 'dinner', difficulty: 'hard',
    prepTime: 45, cookTime: 60, servings: 6,
    tags: ['rice', 'chicken', 'celebration', 'spices', 'special occasion'],
    dietaryInfo: ['halal', 'gluten-free'],
    ingredients: [
      { name: 'Basmati rice', quantity: '3', unit: 'cups' },
      { name: 'Chicken', quantity: '800', unit: 'g', notes: 'bone-in pieces' },
      { name: 'Onion', quantity: '3', unit: 'large', notes: 'thinly sliced' },
      { name: 'Yogurt', quantity: '200', unit: 'g' },
      { name: 'Tomato', quantity: '2', unit: 'medium', notes: 'chopped' },
      { name: 'Biryani masala', quantity: '2', unit: 'tbsp' },
      { name: 'Ginger garlic paste', quantity: '3', unit: 'tbsp' },
      { name: 'Saffron', quantity: '1', unit: 'pinch', notes: 'soaked in 3 tbsp warm milk', isOptional: true },
      { name: 'Fresh mint', quantity: '0.5', unit: 'cup' },
      { name: 'Ghee', quantity: '4', unit: 'tbsp' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Soak basmati rice 30 minutes. Marinate chicken in yogurt, biryani masala, ginger garlic paste for 1 hour.', duration: 60 },
      { stepNumber: 2, instruction: 'Deep fry sliced onions until golden-brown and crispy (birista). Drain and set aside.', duration: 20, tip: 'The fried onions add the signature biryani sweetness.' },
      { stepNumber: 3, instruction: 'Cook marinated chicken with tomatoes and whole spices until 70% done.', duration: 20 },
      { stepNumber: 4, instruction: 'Parboil rice in boiling salted water until 70% cooked. Drain immediately.', duration: 7, tip: 'Slightly undercooking rice is key — it finishes in the dum step.' },
      { stepNumber: 5, instruction: 'Layer: chicken at bottom, rice on top, scatter fried onions, mint, saffron milk over rice.', duration: 5 },
      { stepNumber: 6, instruction: 'Seal pot with foil then lid. Cook on very low heat (dum) 25 minutes. Rest 10 minutes before opening.', duration: 35, tip: 'Don\'t peek! The steam is what makes the magic.' }
    ],
    nutrition: { calories: 580, protein: 36, carbs: 68, fat: 16, fiber: 2 },
    reviews: [
      { userName: 'Aziz K', rating: 5, comment: 'Best biryani recipe I\'ve found. The dum step makes it perfect.' },
      { userName: 'Fatima R', rating: 4, comment: 'Takes time but so worth it.' }
    ],
    averageRating: 4.5, totalRatings: 2, viewCount: 521
  },
  {
    name: 'Spaghetti Carbonara',
    description: 'Classic Roman pasta with eggs, pecorino, guanciale and black pepper. No cream ever.',
    cuisine: 'italian', category: 'dinner', difficulty: 'medium',
    prepTime: 10, cookTime: 20, servings: 2,
    tags: ['pasta', 'eggs', 'cheese', 'roman', 'quick'],
    dietaryInfo: [],
    ingredients: [
      { name: 'Spaghetti', quantity: '200', unit: 'g' },
      { name: 'Guanciale', quantity: '150', unit: 'g', notes: 'or pancetta, diced' },
      { name: 'Egg yolks', quantity: '4', unit: '' },
      { name: 'Whole egg', quantity: '1', unit: '' },
      { name: 'Pecorino Romano', quantity: '80', unit: 'g', notes: 'finely grated' },
      { name: 'Black pepper', quantity: '2', unit: 'tsp', notes: 'freshly cracked' },
      { name: 'Pasta water', quantity: '1', unit: 'cup', notes: 'reserved from boiling' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Whisk egg yolks, whole egg and grated pecorino with black pepper into a thick paste.', duration: 3, tip: 'The mixture must be thick and creamy before touching heat.' },
      { stepNumber: 2, instruction: 'Boil spaghetti until 1 minute before al dente. Reserve 1 cup pasta water before draining.', duration: 10 },
      { stepNumber: 3, instruction: 'Cook guanciale in a cold pan slowly until crispy. Remove from heat.', duration: 8, tip: 'Start cold so the fat renders gradually without burning.' },
      { stepNumber: 4, instruction: 'Add drained pasta to guanciale pan OFF THE HEAT. Toss with the fat.', duration: 1 },
      { stepNumber: 5, instruction: 'Add egg mixture and pasta water. Toss vigorously 2 minutes until silky.', duration: 2, tip: 'Residual heat cooks the egg. If it scrambles, pan was too hot.' },
      { stepNumber: 6, instruction: 'Add more pasta water if too thick. Serve with extra pecorino and pepper.', duration: 1 }
    ],
    nutrition: { calories: 680, protein: 34, carbs: 72, fat: 28, fiber: 3 },
    reviews: [
      { userName: 'Marco B', rating: 5, comment: 'Finally a recipe that respects the original. No cream, perfetto!' }
    ],
    averageRating: 5.0, totalRatings: 1, viewCount: 156
  },
  {
    name: 'Banana Smoothie',
    description: 'Thick, creamy banana smoothie — ready in 2 minutes. Great for breakfast or post-workout.',
    cuisine: 'american', category: 'drinks', difficulty: 'easy',
    prepTime: 2, cookTime: 0, servings: 1,
    tags: ['smoothie', 'breakfast', 'quick', 'healthy', 'no cook'],
    dietaryInfo: ['vegetarian', 'gluten-free'],
    ingredients: [
      { name: 'Banana', quantity: '2', unit: '', notes: 'ripe, frozen works best' },
      { name: 'Milk', quantity: '200', unit: 'ml' },
      { name: 'Yogurt', quantity: '2', unit: 'tbsp', isOptional: true },
      { name: 'Honey', quantity: '1', unit: 'tsp', isOptional: true },
      { name: 'Ice cubes', quantity: '4', unit: '', isOptional: true }
    ],
    steps: [
      { stepNumber: 1, instruction: 'Peel and chop bananas. Frozen bananas give a thicker smoothie.', duration: 1 },
      { stepNumber: 2, instruction: 'Add all ingredients to blender. Blend on high 60 seconds until smooth.', duration: 1, tip: 'Start on low then high to avoid splashing.' },
      { stepNumber: 3, instruction: 'Taste and adjust sweetness. Serve immediately.', duration: 1 }
    ],
    nutrition: { calories: 260, protein: 7, carbs: 54, fat: 3, fiber: 4 },
    reviews: [{ userName: 'Pooja M', rating: 5, comment: 'My morning staple! I add peanut butter too.' }],
    averageRating: 5.0, totalRatings: 1, viewCount: 98
  },
  {
    name: 'Chocolate Mug Cake',
    description: 'Rich, fudgy chocolate cake in a mug in the microwave — 5 minutes to dessert happiness.',
    cuisine: 'american', category: 'dessert', difficulty: 'easy',
    prepTime: 3, cookTime: 2, servings: 1,
    tags: ['chocolate', 'microwave', 'quick', 'dessert', 'single serving'],
    dietaryInfo: ['vegetarian'],
    ingredients: [
      { name: 'All-purpose flour', quantity: '4', unit: 'tbsp' },
      { name: 'Cocoa powder', quantity: '2', unit: 'tbsp' },
      { name: 'Sugar', quantity: '4', unit: 'tbsp' },
      { name: 'Egg', quantity: '1', unit: '' },
      { name: 'Milk', quantity: '3', unit: 'tbsp' },
      { name: 'Oil', quantity: '3', unit: 'tbsp' },
      { name: 'Vanilla extract', quantity: '0.25', unit: 'tsp', isOptional: true },
      { name: 'Chocolate chips', quantity: '2', unit: 'tbsp', isOptional: true, notes: 'for molten centre' }
    ],
    steps: [
      { stepNumber: 1, instruction: 'In a large microwave-safe mug, mix flour, cocoa powder and sugar.', duration: 1 },
      { stepNumber: 2, instruction: 'Add egg, milk, oil and vanilla. Mix until smooth — no dry pockets.', duration: 1, tip: 'Mix from the bottom of the mug.' },
      { stepNumber: 3, instruction: 'Push chocolate chips into the centre for a molten middle.', duration: 0 },
      { stepNumber: 4, instruction: 'Microwave on HIGH for 60-90 seconds. Done when top is just set but moist.', duration: 2, tip: 'Start at 60s and add 15s if needed. Overcooking = dry cake.' },
      { stepNumber: 5, instruction: 'Cool 1 minute. Eat directly from the mug.', duration: 1 }
    ],
    nutrition: { calories: 520, protein: 9, carbs: 62, fat: 28, fiber: 4 },
    reviews: [
      { userName: 'Isha G', rating: 5, comment: '5 minutes to chocolate heaven. Made it 3 times this week.' },
      { userName: 'Dev S', rating: 4, comment: 'Molten chocolate chip centre is everything.' }
    ],
    averageRating: 4.5, totalRatings: 2, viewCount: 388
  }
];

const DEMO_USER = {
  name: 'Demo Chef',
  email: 'demo@recipevault.com',
  password: 'demo1234',
  cookingLevel: 'intermediate',
  dietaryPreferences: ['vegetarian'],
  pantry: [
    { name: 'Onion', quantity: '5', unit: 'pcs' },
    { name: 'Tomato', quantity: '4', unit: 'pcs' },
    { name: 'Garlic', quantity: '1', unit: 'head' },
    { name: 'Rice', quantity: '2', unit: 'cups' },
    { name: 'Egg', quantity: '6', unit: 'pcs' },
    { name: 'Oil', quantity: '500', unit: 'ml' },
    { name: 'Salt', quantity: '1', unit: 'pack' },
    { name: 'Butter', quantity: '100', unit: 'g' }
  ]
};

async function seed() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   RecipeVault Pro — Database Seeder  ║');
  console.log('╚══════════════════════════════════════╝\n');

  if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'YOUR_MONGODB_ATLAS_URI_HERE') {
    console.error('❌  ERROR: Set your MONGODB_URI in backend/.env first!\n');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  Connected to MongoDB Atlas\n');

    await Recipe.deleteMany({});
    await User.deleteMany({});
    console.log('🗑   Cleared existing data\n');

    const hashedPw = await bcrypt.hash(DEMO_USER.password, 12);
    const user = await User.create({ ...DEMO_USER, password: hashedPw });
    console.log('👤  Demo user created:');
    console.log(`    Email:    ${DEMO_USER.email}`);
    console.log(`    Password: ${DEMO_USER.password}\n`);

    for (const r of RECIPES) {
      const recipe = new Recipe({ ...r, author: user._id });
      await recipe.save();
      console.log(`🍽   Added: ${r.name}  (${r.averageRating}★  ${r.viewCount} views)`);
    }

    console.log(`\n✅  Seeded ${RECIPES.length} recipes successfully!\n`);
    console.log('─────────────────────────────────────────');
    console.log('🚀  Now run: npm start');
    console.log('🌐  Open:    http://localhost:3000');
    console.log('🔑  Login:   demo@recipevault.com / demo1234');
    console.log('─────────────────────────────────────────\n');
  } catch (err) {
    console.error('\n❌  Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
