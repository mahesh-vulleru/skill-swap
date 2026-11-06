import { Router } from 'express';
import { getPlatformAnalytics, getMentorAnalytics, getLearnerAnalytics } from '../controllers/analyticsController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Enforce authentication on all analytics routes
router.use(authenticate);

// Role-isolated analytics endpoints: each role can ONLY access their own analytics
router.get('/platform', requireRole(['admin']), getPlatformAnalytics);
router.get('/mentor', requireRole(['mentor']), getMentorAnalytics);
router.get('/learner', requireRole(['learner', 'learner_mentor']), getLearnerAnalytics);

export default router;
