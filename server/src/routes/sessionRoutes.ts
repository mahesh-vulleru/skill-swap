import { Router } from 'express';
import { getSessions, createSession, updateSessionStatus } from '../controllers/sessionController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.get('/', getSessions);
router.post('/', createSession);
router.put('/:id/status', updateSessionStatus);

export default router;

