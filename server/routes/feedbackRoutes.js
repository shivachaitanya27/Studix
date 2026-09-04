import { Router } from 'express';
import { feedbackController } from '../controllers/feedbackController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// First-time exit feedback (authenticated or guest with optional token)
router.post('/', optionalAuthMiddleware, feedbackController.submitFeedback);

// Admin feedback view and satisfaction analytics
router.get('/admin', authMiddleware, adminMiddleware, feedbackController.getAdminFeedbacks);

export default router;
