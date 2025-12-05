import { Router } from 'express';
import { 
  completeProfile, 
  getProfile, 
  updateProfile, 
  getProgress,
  profileValidation,
  updateProfileValidation 
} from '../controllers/studentController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile management
router.post('/profile/complete', profileValidation, validateRequest, completeProfile);
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validateRequest, updateProfile);

// Progress tracking
router.get('/progress', getProgress);

export default router;
