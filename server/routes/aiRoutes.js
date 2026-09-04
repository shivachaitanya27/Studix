import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth middleware to all AI endpoints
router.use(authMiddleware);

// Repository-aware RAG search
router.post('/repository-search', aiController.repositorySearch);

// Multi-turn exam solver & paper analysis
router.post('/paper-analysis', aiController.paperAnalysis);

// Private AI Chat sessions (RLS Enforced)
router.get('/sessions', aiController.getSessions);
router.post('/sessions', aiController.createSession);
router.get('/sessions/:id', aiController.getSessionMessages);
router.post('/sessions/:id/messages', aiController.sendMessage);
router.delete('/sessions/:id', aiController.deleteSession);

export default router;
