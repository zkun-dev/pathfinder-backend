import { Router } from 'express';
import {
  getLearnings,
  getLearning,
  createLearning,
  updateLearning,
  deleteLearning,
} from '../controllers/learningController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getLearnings);
router.get('/:id', getLearning);
router.post('/', authenticate, createLearning);
router.put('/:id', authenticate, updateLearning);
router.delete('/:id', authenticate, deleteLearning);

export default router;
