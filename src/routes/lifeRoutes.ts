import { Router } from 'express';
import {
  getLifePosts,
  getLifePost,
  createLifePost,
  updateLifePost,
  deleteLifePost,
} from '../controllers/lifeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getLifePosts);
router.get('/:id', getLifePost);
router.post('/', authenticate, createLifePost);
router.put('/:id', authenticate, updateLifePost);
router.delete('/:id', authenticate, deleteLifePost);

export default router;
