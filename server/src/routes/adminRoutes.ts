import { Router } from 'express';
import { getAllUsersAdmin, updateUserStatusAdmin, deleteUserAdmin } from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Enforce authentication and administrative privilege on all admin routes
router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/users', getAllUsersAdmin);
router.put('/users/:id', updateUserStatusAdmin);
router.delete('/users/:id', deleteUserAdmin);

export default router;
