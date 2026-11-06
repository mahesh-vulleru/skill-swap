import { Router } from 'express';
import { getPlatformAnalytics } from '../controllers/analyticsController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Protect platform analytics: requires authentication and administrator privilege
router.use(authenticate);
router.use(requireRole(['admin']));
router.get('/platform', getPlatformAnalytics);

export default router;
