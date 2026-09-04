import { Router } from 'express';
import { academicController } from '../controllers/academicController.js';
import { onboardingValidation } from '../validations/authValidation.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Read academic hierarchy endpoints
router.get('/colleges', academicController.getColleges);
router.get('/departments/:collegeId', academicController.getDepartments);
router.get('/departments', academicController.getDepartments);
router.get('/subjects', academicController.getSubjects);

// Protected onboarding endpoint
router.post('/onboarding', authMiddleware, onboardingValidation, academicController.saveOnboarding);

export default router;
