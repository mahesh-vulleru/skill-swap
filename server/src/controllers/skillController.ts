import { Request, Response } from 'express';
import { Skill } from '../models/Skill';
import { SkillCategory } from '../models/SkillCategory';
import { escapeRegex, isValidObjectId } from '../utils/security';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await SkillCategory.find().sort({ skillCount: -1 });
    res.status(200).json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching categories.' });
  }
};

export const getSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, level } = req.query;
    const andClauses: any[] = [];

    if (category && typeof category === 'string' && category !== 'All' && category !== 'all') {
      const sanitizedCat = escapeRegex(category.trim());
      andClauses.push({ category: new RegExp(`^${sanitizedCat}$`, 'i') });
    }

    if (level && typeof level === 'string' && level !== 'All') {
      andClauses.push({ level });
    }

    if (search && typeof search === 'string' && search.trim()) {
      const sanitizedSearch = escapeRegex(search.trim());
      const regex = new RegExp(sanitizedSearch, 'i');
      andClauses.push({
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex },
        ],
      });
    }

    const filter = andClauses.length > 0 ? { $and: andClauses } : {};

    const skills = await Skill.find(filter).sort({ learnerCount: -1 });
    res.status(200).json({ success: true, count: skills.length, skills });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching skills.' });
  }
};

export const getSkillById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid skill ID format.' });
      return;
    }

    const skill = await Skill.findById(id);
    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found.' });
      return;
    }

    res.status(200).json({ success: true, skill });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching skill.' });
  }
};
