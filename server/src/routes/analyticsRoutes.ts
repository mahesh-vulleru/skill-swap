import { Router } from 'express';
import { getPlatformAnalytics } from '../controllers/analyticsController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Strictly enforce authentication and admin authorization for platform analytics
router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/platform', getPlatformAnalytics);

export default router;
