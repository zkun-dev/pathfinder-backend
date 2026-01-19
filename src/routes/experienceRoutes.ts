import { Router } from 'express';
import {
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/experienceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getExperiences);
router.get('/:id', getExperience);
router.post('/', authenticate, createExperience);
router.put('/:id', authenticate, updateExperience);
router.delete('/:id', authenticate, deleteExperience);

export default router;
