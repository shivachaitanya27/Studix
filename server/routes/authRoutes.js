import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import {
  signupValidation,
  loginValidation,
  forgotPasswordValidation
} from '../validations/authValidation.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { handleAvatarUpload } from '../middleware/avatarUploadMiddleware.js';

const router = Router();

// Public auth endpoints
router.post('/signup', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/google/callback', authController.googleCallback);


// Protected auth endpoints
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/avatar', authMiddleware, handleAvatarUpload, authController.uploadAvatar);
router.post('/logout', authMiddleware, authController.logout);

export default router;

