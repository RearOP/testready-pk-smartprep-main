import { Router } from 'express';
import { register, login, logout, getMe, registerValidation, loginValidation } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/logout', authenticate, logout); 

// Protected routes
router.get('/me', authenticate, getMe);

export default router;
