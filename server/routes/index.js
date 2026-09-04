import { Router } from 'express';
import authRoutes from './authRoutes.js';
import academicRoutes from './academicRoutes.js';
import resourceRoutes from './resourceRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Studix Academic Platform Engine'
  });
});

// Modular Routes
router.use('/auth', authRoutes);
router.use('/academic', academicRoutes);
router.use('/resources', resourceRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

export default router;



