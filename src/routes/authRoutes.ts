import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router: Router = Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);

export default router;
