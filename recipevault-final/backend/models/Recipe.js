import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  quantity: { type: String, default: '' },
  unit: { type: String, default: '' },
  notes: { type: String, default: '' },
  isOptional: { type: Boolean, default: false }
});

const StepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  instruction: { type: String, required: true },
  duration: { type: Number, default: 0 },
  tip: { type: String, default: '' }
});

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  cuisine: {
    type: String,
    enum: ['indian','italian','chinese','mexican','american','mediterranean','japanese','thai','french','other'],
    default: 'other'
  },
  category: {
    type: String,
    enum: ['breakfast','lunch','dinner','snack','dessert','drinks','appetizer'],
    default: 'dinner'
  },
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  prepTime: { type: Number, default: 0 },
  cookTime: { type: Number, default: 0 },
  servings: { type: Number, default: 4 },
  tags: [String],
  dietaryInfo: [String],
  imageUrl: { type: String, default: '' },
  ingredients: [IngredientSchema],
  ingredientNames: [{ type: String, lowercase: true }],
  steps: [StepSchema],
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 }
  },
  substitutions: [{
    original: String,
    alternatives: [String],
    note: String
  }],
  reviews: [ReviewSchema],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: 'RecipeVault' },
  isPublic: { type: Boolean, default: true },
  favoriteCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

RecipeSchema.index({ ingredientNames: 1 });
RecipeSchema.index({ name: 'text', description: 'text', tags: 'text' });
RecipeSchema.index({ cuisine: 1, category: 1, difficulty: 1 });

RecipeSchema.pre('save', function(next) {
  this.ingredientNames = this.ingredients.map(i => i.name.toLowerCase().trim());
  next();
});

export default mongoose.model('Recipe', RecipeSchema);
