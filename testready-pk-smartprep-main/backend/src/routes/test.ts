import { Router } from 'express';
import { 
  getTests, 
  getTest, 
  startTest, 
  submitTest, 
  getTestHistory,
  submitTestValidation 
} from '../controllers/testController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Public routes (no authentication required for viewing tests)
router.get('/', getTests);
router.get('/:testId', getTest);

// Protected routes (authentication required)
router.use(authenticate);

router.post('/:testId/start', startTest);
router.post('/submit', submitTestValidation, validateRequest, submitTest);
router.get('/history/all', getTestHistory);

export default router;
