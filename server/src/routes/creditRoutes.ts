import { Router } from 'express';
import { getBalance, redeemCredits } from '../controllers/creditController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.get('/balance', getBalance);
router.post('/redeem', redeemCredits);

export default router;

