import { Router } from 'express';
import { getExchanges, createExchange, updateExchangeStatus } from '../controllers/exchangeController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.get('/', getExchanges);
router.post('/', createExchange);
router.put('/:id/status', updateExchangeStatus);

export default router;

