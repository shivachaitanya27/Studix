import { Router } from 'express';
import { resourceController } from '../controllers/resourceController.js';
import { adminController } from '../controllers/adminController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = Router();

// Upload resource with Multer + SHA-256 duplicate check + OpenRouter AI validation
router.post('/upload', authMiddleware, uploadSingle, resourceController.upload);

// Query shared repository (with strict college isolation)
router.get('/', optionalAuthMiddleware, resourceController.getResources);


// User bookmarks
router.get('/user/bookmarks', authMiddleware, resourceController.getUserBookmarks);

// Single resource details
router.get('/:id', resourceController.getResourceById);

// Toggle bookmark
router.post('/:id/bookmark', authMiddleware, resourceController.toggleBookmark);

// Admin resource purge / removal
router.delete('/:id', authMiddleware, adminController.deleteResource);

export default router;
