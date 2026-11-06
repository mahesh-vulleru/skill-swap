import { Response } from 'express';
import { ExchangeRequest, ExchangeStatus } from '../models/ExchangeRequest';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { isValidObjectId } from '../utils/security';

export const getExchanges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const filter = { $or: [{ sender: userId }, { receiver: userId }] };

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
    if (!senderId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { receiverId, skillOffered, skillWanted, message } = req.body;

    if (!receiverId || !skillOffered || !skillWanted) {
      res.status(400).json({ success: false, message: 'Receiver, skill offered, and skill wanted are required.' });
      return;
    }

    if (!isValidObjectId(receiverId)) {
      res.status(400).json({ success: false, message: 'Invalid receiver user ID.' });
      return;
    }

    if (senderId.toString() === receiverId.toString()) {
      res.status(400).json({ success: false, message: 'You cannot propose a skill exchange to yourself.' });
      return;
    }

    const receiver = await User.findById(receiverId);
    if (!receiver || receiver.status === 'inactive') {
      res.status(404).json({ success: false, message: 'Recipient user not found or inactive.' });
      return;
    }

    const cleanOffered = String(skillOffered).trim();
    const cleanWanted = String(skillWanted).trim();
    const cleanMessage = message ? String(message).trim() : '';

    if (cleanOffered.length < 2 || cleanWanted.length < 2) {
      res.status(400).json({ success: false, message: 'Skill names must be at least 2 characters long.' });
      return;
    }

    // Check if an existing pending exchange already exists between these two users
    const existingPending = await ExchangeRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'pending',
    });

    if (existingPending) {
      res.status(400).json({
        success: false,
        message: 'You already have an active pending exchange request with this partner.',
      });
      return;
    }

    const exchange = await ExchangeRequest.create({
      sender: senderId,
      receiver: receiverId,
      skillOffered: cleanOffered,
      skillWanted: cleanWanted,
      message: cleanMessage,
      status: 'pending',
    });

    // Notify receiver
    await Notification.create({
      user: receiverId,
      title: 'New Skill Exchange Request',
      message: `${req.user?.name || 'A user'} wants to exchange '${cleanOffered}' for your '${cleanWanted}'!`,
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
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid exchange ID format.' });
      return;
    }

    const allowedStatuses: ExchangeStatus[] = ['accepted', 'rejected', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}.`,
      });
      return;
    }

    const exchange = await ExchangeRequest.findById(id);
    if (!exchange) {
      res.status(404).json({ success: false, message: 'Exchange request not found.' });
      return;
    }

    const isSender = exchange.sender.toString() === currentUserId.toString();
    const isReceiver = exchange.receiver.toString() === currentUserId.toString();

    // IDOR Prevention: Only participants may modify the exchange
    if (!isSender && !isReceiver && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You are not an authorized participant in this exchange.',
      });
      return;
    }

    // Finite State Machine Rules:
    // 1. Cannot transition if already completed, cancelled, or rejected
    if (['completed', 'cancelled', 'rejected'].includes(exchange.status)) {
      res.status(400).json({
        success: false,
        message: `Cannot update an exchange that is already '${exchange.status}'.`,
      });
      return;
    }

    // 2. Acceptance & Rejection: ONLY the recipient may accept or reject
    if ((status === 'accepted' || status === 'rejected') && !isReceiver && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only the recipient of the exchange request can accept or decline it.',
      });
      return;
    }

    // 3. Acceptance/Rejection only from pending
    if ((status === 'accepted' || status === 'rejected') && exchange.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: `Cannot transition from '${exchange.status}' to '${status}'.`,
      });
      return;
    }

    // 4. Cancellation: Sender can cancel pending request; either participant can cancel accepted request
    if (status === 'cancelled') {
      if (exchange.status === 'pending' && !isSender && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Only the sender can cancel a pending proposal.',
        });
        return;
      }
    }

    // 5. Completion: Only allowed from accepted state
    if (status === 'completed' && exchange.status !== 'accepted') {
      res.status(400).json({
        success: false,
        message: 'Only accepted exchanges can be marked as completed.',
      });
      return;
    }

    exchange.status = status;
    await exchange.save();

    // Notify the other participant
    const notifyTarget = isSender ? exchange.receiver : exchange.sender;
    const actorName = req.user?.name || 'A user';

    await Notification.create({
      user: notifyTarget,
      title: `Exchange Request ${status.toUpperCase()}`,
      message: `${actorName} has ${status} the exchange request for '${exchange.skillWanted}'.`,
      type: 'exchange_request',
      link: '/exchange-requests',
    });

    const populated = await ExchangeRequest.findById(exchange._id)
      .populate('sender', 'name avatar role location rating reputationScore')
      .populate('receiver', 'name avatar role location rating reputationScore');

    res.status(200).json({ success: true, message: `Exchange request ${status}!`, exchange: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating exchange request.' });
  }
};
