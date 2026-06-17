// routes/mood.routes.js
import { Router } from 'express';
import { 
  createMood, 
  getMoods, 
  getMood, 
  updateMood, 
  deleteMood, 
  getMoodAnalytics,
  getMoodTrend,
  getMoodTags
} from '../controllers/mood.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateCreateMood, validateUpdateMood } from '../validations/mood.validation.js';

const router = Router();

// Protect all routes under /api/moods
router.use(requireAuth);

// 1. Static analytical and tag autocomplete routes
// WARNING: These MUST be defined before the /:id parameter route.
router.get('/analytics', getMoodAnalytics);
router.get('/trend', getMoodTrend);
router.get('/tags', getMoodTags);

// 2. Collection routes
router.post('/', validateCreateMood, createMood);
router.get('/', getMoods);

// 3. Document-specific routes
router.get('/:id', getMood);
router.patch('/:id', validateUpdateMood, updateMood);
router.delete('/:id', deleteMood);

export default router;
