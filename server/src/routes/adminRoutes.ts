import { Router } from 'express';
import { getAllUsersAdmin, updateUserStatusAdmin, deleteUserAdmin } from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// In development, allow access for admin demonstration
router.get('/users', getAllUsersAdmin);
router.put('/users/:id', updateUserStatusAdmin);
router.delete('/users/:id', deleteUserAdmin);

export default router;

