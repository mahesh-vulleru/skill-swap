import { Response } from 'express';
import { Session, SessionStatus } from '../models/Session';
import { User } from '../models/User';
import { CreditTransaction } from '../models/CreditTransaction';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';
import { isValidObjectId } from '../utils/security';

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { status } = req.query;

    const filter: any = { $or: [{ mentor: userId }, { learner: userId }] };
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
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { partnerId, skill, topic, date, time, durationMinutes, mode, notes, exchangeId } = req.body;

    if (!partnerId || !skill || !topic || !date || !time) {
      res.status(400).json({ success: false, message: 'Partner, skill, topic, date, and time are required.' });
      return;
    }

    if (!isValidObjectId(partnerId)) {
      res.status(400).json({ success: false, message: 'Invalid partner ID format.' });
      return;
    }

    if (currentUserId.toString() === partnerId.toString()) {
      res.status(400).json({ success: false, message: 'You cannot schedule a learning session with yourself.' });
      return;
    }

    const partner = await User.findById(partnerId);
    if (!partner || partner.status === 'inactive') {
      res.status(404).json({ success: false, message: 'Session partner not found or inactive.' });
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(String(date).trim())) {
      res.status(400).json({ success: false, message: 'Invalid date format. Expected YYYY-MM-DD.' });
      return;
    }

    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid date provided.' });
      return;
    }

    // Validate mode
    const allowedModes = ['Google Meet', 'Zoom', 'SkillSwap Live Video'];
    const chosenMode = allowedModes.includes(mode) ? mode : 'Google Meet';

    const cleanSkill = String(skill).trim();
    const cleanTopic = String(topic).trim();
    const cleanTime = String(time).trim();
    const cleanDuration = Number(durationMinutes) > 0 && Number(durationMinutes) <= 300 ? Number(durationMinutes) : 60;

    const randomRoomId = Math.random().toString(36).substring(2, 7);
    const meetingLink = `https://meet.google.com/ss-${randomRoomId}`;

    const session = await Session.create({
      mentor: currentUserId,
      learner: partnerId,
      skill: cleanSkill,
      topic: cleanTopic,
      date: String(date).trim(),
      time: cleanTime,
      durationMinutes: cleanDuration,
      mode: chosenMode,
      meetingLink,
      notes: notes ? String(notes).trim() : '',
      status: 'upcoming',
      ...(exchangeId && isValidObjectId(exchangeId) ? { exchangeId } : {}),
    });

    // Notify partner
    await Notification.create({
      user: partnerId,
      title: 'New Session Scheduled',
      message: `${req.user?.name || 'A partner'} scheduled a '${cleanSkill}' session for ${date} at ${cleanTime}.`,
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
    const currentUserId = req.user?._id;
    if (!currentUserId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid session ID format.' });
      return;
    }

    const allowedStatuses: SessionStatus[] = ['upcoming', 'ongoing', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}.`,
      });
      return;
    }

    const session = await Session.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }

    const isMentor = session.mentor.toString() === currentUserId.toString();
    const isLearner = session.learner.toString() === currentUserId.toString();

    // IDOR Check: user must be participant or admin
    if (!isMentor && !isLearner && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You are not a participant in this session.',
      });
      return;
    }

    // State transition rules
    if (session.status === 'completed' || session.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: `Cannot change status of a session that is already '${session.status}'.`,
      });
      return;
    }

    const previousStatus = session.status;
    session.status = status;
    await session.save();

    // If marked as completed, transfer / award credits & record transactions with strict idempotency
    if (status === 'completed') {
      // Check if rewards were already recorded for this session ID
      const existingTx = await CreditTransaction.findOne({
        referenceId: session._id.toString(),
        type: 'earned',
      });

      if (!existingTx) {
        // Award mentor 10 credits, +1 session, +15 reputation
        await User.findByIdAndUpdate(session.mentor, {
          $inc: { credits: 10, sessionsCompleted: 1, reputationScore: 15 },
        });

        // Record mentor transaction
        await CreditTransaction.create({
          user: session.mentor,
          amount: 10,
          type: 'earned',
          description: `Taught skill '${session.skill}' session with learner`,
          referenceId: session._id.toString(),
        });

        // Award learner +1 session, +5 reputation
        await User.findByIdAndUpdate(session.learner, {
          $inc: { sessionsCompleted: 1, reputationScore: 5 },
        });

        // Notify both parties of credit completion
        await Notification.create({
          user: session.mentor,
          title: 'Session Completed (+10 Credits)',
          message: `Your session on '${session.skill}' is completed! 10 credits and 15 reputation awarded.`,
          type: 'credits_awarded',
          link: '/credits',
        });
      }
    }

    // If cancelled, notify the other participant
    if (status === 'cancelled') {
      const otherUserId = isMentor ? session.learner : session.mentor;
      await Notification.create({
        user: otherUserId,
        title: 'Session Cancelled',
        message: `The session on '${session.topic}' scheduled for ${session.date} was cancelled by ${req.user?.name || 'partner'}.`,
        type: 'session_scheduled',
        link: '/my-sessions',
      });
    }

    const populated = await Session.findById(session._id)
      .populate('mentor', 'name avatar role location rating reputationScore')
      .populate('learner', 'name avatar role location rating reputationScore');

    res.status(200).json({ success: true, message: `Session status updated to ${status}!`, session: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating session.' });
  }
};
