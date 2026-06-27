// routes/journal.routes.js
import { Router } from 'express';
import { 
  createJournal, 
  getJournals, 
  getJournal, 
  updateJournal, 
  deleteJournal, 
  searchJournals,
  exportJournals
} from '../controllers/journal.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { 
  validateCreateJournal, 
  validateUpdateJournal, 
  validateSearchQuery 
} from '../validations/journal.validation.js';

const router = Router();

// Protect all routes under /api/journals
router.use(requireAuth);

// 1. Static query and export routes
// WARNING: These must be defined before the dynamic /:id parameter route.
router.get('/search', validateSearchQuery, searchJournals);
router.get('/export', exportJournals);

// 2. Collection routes
router.post('/', validateCreateJournal, createJournal);
router.get('/', getJournals);

// 3. Document-specific routes
router.get('/:id', getJournal);
router.patch('/:id', validateUpdateJournal, updateJournal);
router.delete('/:id', deleteJournal);

export default router;
