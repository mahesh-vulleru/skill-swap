import { Response } from 'express';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { CreditTransaction } from '../models/CreditTransaction';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { status } = req.query;

    const filter: any = userId ? { $or: [{ mentor: userId }, { learner: userId }] } : {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const sessions = await Session.find(filter)
      .populate('mentor', 'name avatar role location rating reputationScore')
      .populate('learner', 'name avatar role location rating reputationScore')
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching sessions.' });
  }
};

export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?._id;
    const { partnerId, skill, topic, date, time, durationMinutes, mode, notes } = req.body;

    if (!partnerId || !skill || !topic || !date || !time) {
      res.status(400).json({ success: false, message: 'Partner, skill, topic, date, and time are required.' });
      return;
    }

    const session = await Session.create({
      mentor: currentUserId,
      learner: partnerId,
      skill,
      topic,
      date,
      time,
      durationMinutes: durationMinutes || 60,
      mode: mode || 'Google Meet',
      meetingLink: `https://meet.google.com/ss-${Math.random().toString(36).substring(2, 7)}`,
      notes: notes || '',
      status: 'upcoming',
    });

    // Notify partner
    await Notification.create({
      user: partnerId,
      title: 'New Session Scheduled',
      message: `${req.user?.name || 'A partner'} scheduled a '${skill}' session for ${date} at ${time}.`,
      type: 'session_scheduled',
      link: '/my-sessions',
    });

    const populated = await Session.findById(session._id)
      .populate('mentor', 'name avatar role location rating reputationScore')
      .populate('learner', 'name avatar role location rating reputationScore');

    res.status(201).json({ success: true, message: 'Session scheduled successfully!', session: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error scheduling session.' });
  }
};

export const updateSessionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status.' });
      return;
    }

    const session = await Session.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }

    const previousStatus = session.status;
    session.status = status;
    await session.save();

    // If marked as completed, transfer / award credits & record transactions
    if (status === 'completed' && previousStatus !== 'completed') {
      await User.findByIdAndUpdate(session.mentor, {
        $inc: { credits: 10, sessionsCompleted: 1, reputationScore: 15 },
      });

      await CreditTransaction.create({
        user: session.mentor,
        amount: 10,
        type: 'earned',
        description: `Taught skill '${session.skill}' session with learner`,
        referenceId: session._id.toString(),
      });

      await User.findByIdAndUpdate(session.learner, {
        $inc: { sessionsCompleted: 1, reputationScore: 5 },
      });
    }

    res.status(200).json({ success: true, message: `Session status updated to ${status}!`, session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating session.' });
  }
};

