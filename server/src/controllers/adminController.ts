import { Request, Response } from 'express';
import { User, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { escapeRegex, isValidObjectId } from '../utils/security';

export const getAllUsersAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, status } = req.query;
    const andClauses: any[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      const regex = new RegExp(sanitized, 'i');
      andClauses.push({
        $or: [{ name: regex }, { email: regex }, { location: regex }],
      });
    }

    if (role && typeof role === 'string' && role !== 'all') {
      andClauses.push({ role });
    }

    if (status && typeof status === 'string' && status !== 'all') {
      andClauses.push({ status });
    }

    const filter = andClauses.length > 0 ? { $and: andClauses } : {};

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching users for admin.' });
  }
};

export const updateUserStatusAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentAdminId = req.user?._id?.toString();
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid user ID format.' });
      return;
    }

    const { status, role, credits } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Security Hardening: Prevent self-lockout
    if (id === currentAdminId) {
      if (status === 'inactive') {
        res.status(400).json({
          success: false,
          message: 'Operation rejected: You cannot deactivate your own administrator account.',
        });
        return;
      }
      if (role && role !== 'admin') {
        res.status(400).json({
          success: false,
          message: 'Operation rejected: You cannot revoke your own administrator role.',
        });
        return;
      }
    }

    if (status) {
      if (!['active', 'inactive'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status value.' });
        return;
      }
      user.status = status;
    }

    if (role) {
      const validRoles: UserRole[] = ['learner', 'mentor', 'learner_mentor', 'admin'];
      if (!validRoles.includes(role)) {
        res.status(400).json({ success: false, message: 'Invalid role value.' });
        return;
      }
      user.role = role;
    }

    if (credits !== undefined) {
      const numCredits = Number(credits);
      if (isNaN(numCredits) || numCredits < 0) {
        res.status(400).json({ success: false, message: 'Credits must be a non-negative number.' });
        return;
      }
      user.credits = numCredits;
    }

    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({ success: true, message: 'User updated successfully!', user: safeUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating user.' });
  }
};

export const deleteUserAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentAdminId = req.user?._id?.toString();
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid user ID format.' });
      return;
    }

    // Prevent self-deletion
    if (id === currentAdminId) {
      res.status(400).json({
        success: false,
        message: 'Operation rejected: You cannot delete your own administrator account.',
      });
      return;
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting user.' });
  }
};
