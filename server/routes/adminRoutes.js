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
router.post('/resources/bulk-delete', adminController.bulkDelete);
router.post('/resources/stream-delete', adminController.deleteStream);
router.patch('/resources/:id/stream', adminController.updateStream);


// AI auto-rejection audit logs
router.get('/moderation/logs', adminController.getAiLogs);

// Real-time Platform Analytics
router.get('/analytics', adminController.getAnalytics);

// User & Scholar Management across all departments
router.get('/users', adminController.getUsers);
router.patch('/users/:id/stream', adminController.updateUserStream);

export default router;
