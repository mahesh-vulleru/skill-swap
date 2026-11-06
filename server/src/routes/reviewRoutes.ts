import { Router } from 'express';
import { getReviewsForUser, createReview } from '../controllers/reviewController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/user/:userId', getReviewsForUser);
router.post('/', authenticate, createReview);

export default router;

