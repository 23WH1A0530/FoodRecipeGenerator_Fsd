import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  cookingLevel: { type: String, enum: ['beginner','intermediate','advanced'], default: 'beginner' },
  dietaryPreferences: [String],
  allergies: [String],
  pantry: [{
    name: String,
    quantity: String,
    unit: String,
    expiresAt: Date,
    addedAt: { type: Date, default: Date.now }
  }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  shoppingList: [{
    name: String,
    quantity: String,
    unit: String,
    checked: { type: Boolean, default: false },
    addedAt: { type: Date, default: Date.now }
  }],
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function(pw) {
  return bcrypt.compare(pw, this.password);
};

UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', UserSchema);
