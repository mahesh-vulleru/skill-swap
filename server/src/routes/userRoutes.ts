import { Router } from 'express';
import { getUsers, getUserById, updateProfile, getRecommendedPartners } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Specific routes before parameterized :id route
router.get('/', getUsers);
router.get('/recommended', getRecommendedPartners);
router.put('/profile', authenticate, updateProfile);
router.get('/:id', getUserById);

export default router;
