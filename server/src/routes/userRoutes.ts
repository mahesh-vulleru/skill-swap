import { Router } from 'express';
import { getUsers, getUserById, updateProfile, getRecommendedPartners } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getUsers);
router.get('/recommended', getRecommendedPartners);
router.get('/:id', getUserById);
router.put('/profile', authenticate, updateProfile);

export default router;

