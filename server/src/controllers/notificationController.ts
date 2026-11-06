import { Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching notifications.' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ user: req.user?._id }, { $set: { read: true } });
      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
      return;
    }

    await Notification.findByIdAndUpdate(id, { $set: { read: true } });
    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating notification.' });
  }
};

