import { Router } from 'express';
import { getCategories, getSkills, getSkillById } from '../controllers/skillController';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getSkills);
router.get('/:id', getSkillById);

export default router;

