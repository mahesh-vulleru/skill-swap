import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, role } = req.query;
    const filter: any = { status: 'active' };

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [
        { name: searchRegex },
        { bio: searchRegex },
        { 'skillsOffered.name': searchRegex },
        { 'skillsWanted.name': searchRegex },
      ];
    }

    if (category && category !== 'All') {
      filter.$or = [
        { 'skillsOffered.category': category },
        { 'skillsWanted.category': category },
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password').sort({ reputationScore: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching users.' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
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

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...(name && { name }),
          ...(bio !== undefined && { bio }),
          ...(avatar && { avatar }),
          ...(coverImage && { coverImage }),
          ...(location && { location }),
          ...(availability && { availability }),
          ...(skillsOffered && { skillsOffered }),
          ...(skillsWanted && { skillsWanted }),
        },
      },
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

