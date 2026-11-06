import { Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';
import { isValidObjectId } from '../utils/security';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching notifications.' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid notification ID format.' });
      return;
    }

    // IDOR Prevention: strictly enforce user ownership
    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Notification not found or access denied.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Notification marked as read.', notification: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating notification.' });
  }
};
