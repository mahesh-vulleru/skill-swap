import { Response } from 'express';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { CreditTransaction } from '../models/CreditTransaction';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const { status } = req.query;

    let filter: any = {};
    if (userRole === 'mentor') {
      // Mentors strictly retrieve only sessions they are teaching
      filter = { mentor: userId };
    } else if (userRole === 'learner') {
      // Learners strictly retrieve only sessions they are attending
      filter = { learner: userId };
    } else if (userRole === 'admin') {
      // Admins can see all platform sessions
      filter = {};
    } else {
      filter = { $or: [{ mentor: userId }, { learner: userId }] };
    }

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
    const { partnerId, skill, topic, date, time, durationMinutes, mode, notes, exchangeId } = req.body;

    if (!partnerId || !skill || !topic || !date || !time) {
      res.status(400).json({ success: false, message: 'Partner, skill, topic, date, and time are required.' });
      return;
    }

    if (currentUserId && currentUserId.toString() === partnerId.toString()) {
      res.status(400).json({ success: false, message: 'Cannot schedule a session with yourself.' });
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
      exchangeId: exchangeId || undefined,
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
    const currentUserId = req.user?._id?.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status.' });
      return;
    }

    const session = await Session.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }

    const mentorId = session.mentor.toString();
    const learnerId = session.learner.toString();

    // Authorization: Only participants or admin can update status
    if (currentUserId !== mentorId && currentUserId !== learnerId && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Only session participants or administrators can update session status.',
      });
      return;
    }

    // Business Rules: Prevent invalid status transitions
    if (session.status === 'cancelled' && status === 'completed') {
      res.status(400).json({
        success: false,
        message: 'Cannot complete a session that has been cancelled.',
      });
      return;
    }

    if (session.status === 'completed' && status === 'completed') {
      res.status(400).json({
        success: false,
        message: 'Session is already marked as completed.',
      });
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

      // Notify both participants
      await Notification.create({
        user: session.mentor,
        title: 'Session Completed (+10 Credits)',
        message: `You earned 10 credits for completing your mentorship session on '${session.skill}'!`,
        type: 'session_completed',
        link: '/credits',
      });

      await Notification.create({
        user: session.learner,
        title: 'Session Completed',
        message: `Your learning session on '${session.skill}' is marked completed. Leave a review for your mentor!`,
        type: 'session_completed',
        link: `/reviews?sessionId=${session._id}&partnerId=${session.mentor}`,
      });
    }

    res.status(200).json({ success: true, message: `Session status updated to ${status}!`, session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating session.' });
  }
};
