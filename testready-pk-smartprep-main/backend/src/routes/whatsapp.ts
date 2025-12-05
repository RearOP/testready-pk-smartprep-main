import { Router } from 'express';
import { 
  sendWhatsAppMessage,
  sendTestResultNotification,
  processPendingNotifications,
  getNotificationLogs
} from '../controllers/whatsappController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Admin routes for WhatsApp management
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/send', sendWhatsAppMessage);
router.post('/test-result/:attemptId', sendTestResultNotification);
router.post('/process-pending', processPendingNotifications);
router.get('/logs', getNotificationLogs);

export default router;
