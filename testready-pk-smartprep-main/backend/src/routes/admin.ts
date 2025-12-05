import { Router } from 'express';
import { 
  getDashboardStats,
  getStudents,
  createTest,
  getTests,
  updateTest,
  deleteTest,
  exportStudents,
  importStudents,
  createTestValidation
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import multer from 'multer';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Student management
router.get('/students', getStudents);
router.get('/students/export', exportStudents);
router.post('/students/import', multer({ dest: 'uploads/' }).single('csv'), importStudents);

// Test management
router.get('/tests', getTests);
router.post('/tests', createTestValidation, validateRequest, createTest);
router.put('/tests/:testId', updateTest);
router.delete('/tests/:testId', deleteTest);

export default router;
