import { Response } from 'express';
import { ExchangeRequest } from '../models/ExchangeRequest';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

export const getExchanges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const filter = userId ? { $or: [{ sender: userId }, { receiver: userId }] } : {};

    const exchanges = await ExchangeRequest.find(filter)
      .populate('sender', 'name avatar role location rating reputationScore skillsOffered skillsWanted')
      .populate('receiver', 'name avatar role location rating reputationScore skillsOffered skillsWanted')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: exchanges.length, exchanges });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching exchanges.' });
  }
};

export const createExchange = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user?._id;
    const { receiverId, skillOffered, skillWanted, message } = req.body;

    if (!receiverId || !skillOffered || !skillWanted) {
      res.status(400).json({ success: false, message: 'Receiver, skill offered, and skill wanted are required.' });
      return;
    }

    if (senderId && senderId.toString() === receiverId.toString()) {
      res.status(400).json({ success: false, message: 'Cannot propose a skill exchange to yourself.' });
      return;
    }

    // Prevent duplicate pending requests for the same skill pairing
    const existingPending = await ExchangeRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      skillWanted,
      status: 'pending',
    });

    if (existingPending) {
      res.status(400).json({
        success: false,
        message: 'An active pending exchange request for this skill is already awaiting response from this partner.',
      });
      return;
    }

    const exchange = await ExchangeRequest.create({
      sender: senderId,
      receiver: receiverId,
      skillOffered,
      skillWanted,
      message: message || '',
      status: 'pending',
    });

    // Notify receiver
    await Notification.create({
      user: receiverId,
      title: 'New Skill Exchange Request',
      message: `${req.user?.name || 'A user'} wants to exchange '${skillOffered}' for your '${skillWanted}'!`,
      type: 'exchange_request',
      link: '/exchange-requests',
    });

    const populated = await ExchangeRequest.findById(exchange._id)
      .populate('sender', 'name avatar role location rating reputationScore')
      .populate('receiver', 'name avatar role location rating reputationScore');

    res.status(201).json({ success: true, message: 'Exchange request sent successfully!', exchange: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating exchange request.' });
  }
};

export const updateExchangeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const currentUserId = req.user?._id?.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status.' });
      return;
    }

    const exchange = await ExchangeRequest.findById(id);
    if (!exchange) {
      res.status(404).json({ success: false, message: 'Exchange request not found.' });
      return;
    }

    const senderId = exchange.sender.toString();
    const receiverId = exchange.receiver.toString();

    // Business Rules:
    // Only the intended recipient can accept or reject an incoming request
    if (['accepted', 'rejected'].includes(status)) {
      if (currentUserId !== receiverId && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Only the intended recipient can accept or reject this exchange request.',
        });
        return;
      }
    }

    // Only participants (or admin) can cancel or complete
    if (['cancelled', 'completed'].includes(status)) {
      if (currentUserId !== senderId && currentUserId !== receiverId && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'You are not authorized to modify this exchange request.',
        });
        return;
      }
    }

    // Prevent modifying already completed or cancelled requests
    if (exchange.status === 'completed' || exchange.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: `Cannot change status of an exchange that is already ${exchange.status}.`,
      });
      return;
    }

    exchange.status = status;
    await exchange.save();

    // Create notification for the other participant
    const notifyTarget = currentUserId === senderId ? receiverId : senderId;
    await Notification.create({
      user: notifyTarget,
      title: `Exchange Request ${status.toUpperCase()}`,
      message: `The exchange request for '${exchange.skillWanted}' was marked as ${status}.`,
      type: 'exchange_request',
      link: '/exchange-requests',
    });

    res.status(200).json({ success: true, message: `Exchange request ${status}!`, exchange });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating exchange request.' });
  }
};
