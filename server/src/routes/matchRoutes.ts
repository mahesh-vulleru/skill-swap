import { Router } from 'express';
import { getMatches } from '../controllers/matchController';

const router = Router();

// Allow optional auth header extraction
router.get('/', getMatches);

export default router;

