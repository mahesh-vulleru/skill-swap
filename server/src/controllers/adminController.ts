import { Request, Response } from 'express';
import { User } from '../models/User';
import { ExchangeRequest } from '../models/ExchangeRequest';
import { Session } from '../models/Session';
import { Skill } from '../models/Skill';
import { Review } from '../models/Review';

export const getAllUsersAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, status } = req.query;
    const filter: any = {};

    if (search) {
      const regex = new RegExp(String(search), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { location: regex }];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching users for admin.' });
  }
};

export const updateUserStatusAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, role, credits } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (status) user.status = status;
    if (role) user.role = role;
    if (credits !== undefined) user.credits = Number(credits);

    await user.save();
    res.status(200).json({ success: true, message: 'User updated successfully!', user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating user.' });
  }
};

export const deleteUserAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting user.' });
  }
};

