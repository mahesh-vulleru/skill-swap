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

    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status.' });
      return;
    }

    const exchange = await ExchangeRequest.findById(id);
    if (!exchange) {
      res.status(404).json({ success: false, message: 'Exchange request not found.' });
      return;
    }

    exchange.status = status;
    await exchange.save();

    // Create notification for sender
    await Notification.create({
      user: exchange.sender,
      title: `Exchange Request ${status.toUpperCase()}`,
      message: `Your exchange request for '${exchange.skillWanted}' was ${status}.`,
      type: 'exchange_request',
      link: '/exchange-requests',
    });

    res.status(200).json({ success: true, message: `Exchange request ${status}!`, exchange });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating exchange request.' });
  }
};

