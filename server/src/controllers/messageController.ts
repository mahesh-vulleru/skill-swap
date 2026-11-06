import { Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).sort({ createdAt: -1 });

    const partnerIds = new Set<string>();
    messages.forEach((m) => {
      if (m.sender.toString() !== currentUserId.toString()) partnerIds.add(m.sender.toString());
      if (m.receiver.toString() !== currentUserId.toString()) partnerIds.add(m.receiver.toString());
    });

    const partners = await User.find({ _id: { $in: Array.from(partnerIds) } }).select('name avatar role status rating location');

    const conversations = partners.map((partner) => {
      const lastMsg = messages.find(
        (m) =>
          (m.sender.toString() === partner._id.toString() && m.receiver.toString() === currentUserId.toString()) ||
          (m.receiver.toString() === partner._id.toString() && m.sender.toString() === currentUserId.toString())
      );
      const unreadCount = messages.filter(
        (m) => m.sender.toString() === partner._id.toString() && m.receiver.toString() === currentUserId.toString() && !m.read
      ).length;

      return {
        partner,
        lastMessage: lastMsg?.content || 'Started conversation',
        timestamp: lastMsg?.createdAt || new Date(),
        unreadCount,
        online: true,
      };
    });

    res.status(200).json({ success: true, conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching conversations.' });
  }
};

export const getMessagesWithUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?._id;
    const { userId } = req.params;

    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Mark incoming messages as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching messages.' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user?._id;
    const { receiverId, content, attachmentUrl } = req.body;

    if (!receiverId || !content) {
      res.status(400).json({ success: false, message: 'Receiver ID and content are required.' });
      return;
    }

    if (senderId && senderId.toString() === receiverId.toString()) {
      res.status(400).json({ success: false, message: 'Cannot send messages to yourself.' });
      return;
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      attachmentUrl,
      read: false,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.status(201).json({ success: true, message: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error sending message.' });
  }
};
