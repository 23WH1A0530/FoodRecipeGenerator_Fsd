import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, cookingLevel, dietaryPreferences } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, cookingLevel, dietaryPreferences });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: user.toJSON() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const token = signToken(user._id);
    res.json({ success: true, token, user: user.toJSON() });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites', 'name imageUrl averageRating cuisine');
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/auth/preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const { dietaryPreferences, allergies, cookingLevel } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { dietaryPreferences, allergies, cookingLevel }, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/auth/pantry
router.get('/pantry', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('pantry');
  res.json({ success: true, data: user.pantry });
});

// POST /api/auth/pantry
router.post('/pantry', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { pantry: req.body } }, { new: true });
    res.json({ success: true, data: user.pantry });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/auth/pantry/:itemId
router.delete('/pantry/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { pantry: { _id: req.params.itemId } } }, { new: true });
    res.json({ success: true, data: user.pantry });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/auth/shopping-list
router.get('/shopping-list', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('shoppingList');
  res.json({ success: true, data: user.shoppingList });
});

// POST /api/auth/shopping-list
router.post('/shopping-list', protect, async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { shoppingList: { $each: items } } }, { new: true });
    res.json({ success: true, data: user.shoppingList });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PATCH /api/auth/shopping-list/:itemId/toggle
router.patch('/shopping-list/:itemId/toggle', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const item = user.shoppingList.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.checked = !item.checked;
    await user.save();
    res.json({ success: true, data: user.shoppingList });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/auth/shopping-list/clear
router.delete('/shopping-list/clear', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { shoppingList: [] } });
  res.json({ success: true, data: [] });
});

export default router;
