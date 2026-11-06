import { Request, Response } from 'express';
import { Skill } from '../models/Skill';
import { SkillCategory } from '../models/SkillCategory';

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
    const filter: any = {};

    if (category && category !== 'All' && category !== 'all') {
      filter.category = category;
    }

    if (level && level !== 'All') {
      filter.level = level;
    }

    if (search) {
      const regex = new RegExp(String(search), 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    const skills = await Skill.find(filter).sort({ learnerCount: -1 });
    res.status(200).json({ success: true, count: skills.length, skills });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching skills.' });
  }
};

export const getSkillById = async (req: Request, res: Response): Promise<void> => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found.' });
      return;
    }
    res.status(200).json({ success: true, skill });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching skill.' });
  }
};

