// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import moodRouter from './routes/mood.routes.js';
import journalRouter from './routes/journal.routes.js';
import { globalErrorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Bind routes
app.use('/api/moods', moodRouter);
app.use('/api/journals', journalRouter);

// Base Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Centralized error handler
app.use(globalErrorHandler);

// Do not start listening if we are running in a test environment (Jest imports app directly)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
