import { Request, Response } from 'express';
import { User, ISkillItem } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { escapeRegex, isValidObjectId } from '../utils/security';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, role } = req.query;
    const andClauses: any[] = [{ status: 'active' }];

    if (search && typeof search === 'string' && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      andClauses.push({
        $or: [
          { name: searchRegex },
          { bio: searchRegex },
          { location: searchRegex },
          { 'skillsOffered.name': searchRegex },
          { 'skillsWanted.name': searchRegex },
        ],
      });
    }

    if (category && typeof category === 'string' && category !== 'All' && category !== 'all') {
      const sanitizedCat = escapeRegex(category.trim());
      const catRegex = new RegExp(`^${sanitizedCat}$`, 'i');
      andClauses.push({
        $or: [
          { 'skillsOffered.category': catRegex },
          { 'skillsWanted.category': catRegex },
        ],
      });
    }

    if (role && typeof role === 'string' && role !== 'all') {
      const validRoles = ['learner', 'mentor', 'learner_mentor', 'admin'];
      if (validRoles.includes(role)) {
        andClauses.push({ role });
      }
    }

    const filter = andClauses.length === 1 ? andClauses[0] : { $and: andClauses };

    const users = await User.find(filter)
      .select('-password')
      .sort({ reputationScore: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching users.' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid user ID format.' });
      return;
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching user profile.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { name, bio, avatar, coverImage, location, availability, skillsOffered, skillsWanted } = req.body;

    const updates: Record<string, any> = {};

    if (name && typeof name === 'string') {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        res.status(400).json({ success: false, message: 'Name must be at least 2 characters long.' });
        return;
      }
      updates.name = trimmed;
    }

    if (bio !== undefined && typeof bio === 'string') {
      updates.bio = bio.trim();
    }

    if (avatar && typeof avatar === 'string') {
      updates.avatar = avatar.trim();
    }

    if (coverImage && typeof coverImage === 'string') {
      updates.coverImage = coverImage.trim();
    }

    if (location && typeof location === 'string') {
      updates.location = location.trim();
    }

    if (availability && typeof availability === 'string') {
      updates.availability = availability.trim();
    }

    if (skillsOffered && Array.isArray(skillsOffered)) {
      const cleanOffers: ISkillItem[] = skillsOffered
        .filter((s: any) => s && typeof s.name === 'string' && s.name.trim())
        .map((s: any) => ({
          name: String(s.name).trim(),
          category: s.category ? String(s.category).trim() : 'General',
          level: ['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(s.level) ? s.level : 'Intermediate',
          description: s.description ? String(s.description).trim() : '',
        }));
      updates.skillsOffered = cleanOffers;
    }

    if (skillsWanted && Array.isArray(skillsWanted)) {
      const cleanWants: ISkillItem[] = skillsWanted
        .filter((s: any) => s && typeof s.name === 'string' && s.name.trim())
        .map((s: any) => ({
          name: String(s.name).trim(),
          category: s.category ? String(s.category).trim() : 'General',
          level: ['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(s.level) ? s.level : 'Beginner',
          description: s.description ? String(s.description).trim() : '',
        }));
      updates.skillsWanted = cleanWants;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating profile.' });
  }
};

export const getRecommendedPartners = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const filter: any = { status: 'active' };
    if (currentUserId) {
      filter._id = { $ne: currentUserId };
    }

    const recommended = await User.find(filter)
      .select('-password')
      .sort({ rating: -1, reputationScore: -1 })
      .limit(6);

    res.status(200).json({ success: true, users: recommended });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching recommended partners.' });
  }
};
