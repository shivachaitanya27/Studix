import { Router } from 'express';
import { supportController } from '../controllers/supportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Student authenticated routes
router.post('/tickets', authMiddleware, supportController.createTicket);
router.get('/my-tickets', authMiddleware, supportController.getMyTickets);
router.get('/tickets/:id', authMiddleware, supportController.getTicketDetails);
router.post('/tickets/:id/messages', authMiddleware, supportController.addMessage);

// Admin-only support oversight & response routes
router.get('/admin/tickets', authMiddleware, adminMiddleware, supportController.getAdminTickets);
router.patch('/admin/tickets/:id/status', authMiddleware, adminMiddleware, supportController.updateTicketStatus);

export default router;
