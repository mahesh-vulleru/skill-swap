import { Router } from 'express';
import { getCategories } from '../controllers/skillController';

const router = Router();

// GET /api/categories - List all categories with skill counts
router.get('/', getCategories);

export default router;
