import express from 'express';
import cors from 'cors';
import * as authController from './controllers/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running on Vercel' });
});

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// For local development only (Vercel uses the export)
if (process.env.NODE_ENV !== 'production' && (process.argv[1].includes('api/index.js') || process.argv[1].includes('api\\index.js'))) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Local API server running on http://localhost:${PORT}`);
  });
}

export default app;
