import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import recipeRoutes from './routes/recipes.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => res.status(500).json({ success: false, message: err.message }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('\n✅  MongoDB Atlas connected successfully');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀  Backend running  →  http://localhost:${process.env.PORT || 5000}`);
      console.log(`📋  Health check     →  http://localhost:${process.env.PORT || 5000}/api/health\n`);
    });
  })
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message);
    console.error('    Check your MONGODB_URI in backend/.env\n');
    process.exit(1);
  });
