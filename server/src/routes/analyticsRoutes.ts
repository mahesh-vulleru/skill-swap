import { Router } from 'express';
import { getPlatformAnalytics } from '../controllers/analyticsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Protect platform analytics with authentication
router.use(authenticate);
router.get('/platform', getPlatformAnalytics);

export default router;
