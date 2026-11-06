import { Router } from 'express';
import { getMatches } from '../controllers/matchController';
import { optionalAuthenticate } from '../middleware/authMiddleware';

const router = Router();

// Extract authenticated user profile when token is present
router.get('/', optionalAuthenticate, getMatches);

export default router;

