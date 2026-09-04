import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Enforce both authentication and administrator role access
router.use(authMiddleware);
router.use(adminMiddleware);

// Moderation queue & Content Purge
router.get('/moderation/queue', adminController.getModerationQueue);
router.post('/moderation/:id/approve', adminController.approve);
router.post('/moderation/:id/reject', adminController.reject);
router.delete('/resources/:id', adminController.deleteResource);


// AI auto-rejection audit logs
router.get('/moderation/logs', adminController.getAiLogs);

// Real-time Platform Analytics
router.get('/analytics', adminController.getAnalytics);

export default router;
