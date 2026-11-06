import { Router } from 'express';
import { getConversations, getMessagesWithUser, sendMessage } from '../controllers/messageController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.get('/conversations', getConversations);
router.get('/:userId', getMessagesWithUser);
router.post('/', sendMessage);

export default router;

