import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { ExchangeRequest } from '../models/ExchangeRequest';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';
import { isValidObjectId } from '../utils/security';

export const getReviewsForUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID format.' });
      return;
    }

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name avatar role location')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching reviews.' });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviewerId = req.user?._id;
    if (!reviewerId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { revieweeId, rating, feedback, skillSwapped, sessionId } = req.body;

    if (!revieweeId || rating === undefined || !feedback) {
      res.status(400).json({ success: false, message: 'Reviewee, rating, and feedback are required.' });
      return;
    }

    if (!isValidObjectId(revieweeId)) {
      res.status(400).json({ success: false, message: 'Invalid reviewee user ID format.' });
      return;
    }

    // 1. Prevent self-reviews
    if (reviewerId.toString() === revieweeId.toString()) {
      res.status(400).json({ success: false, message: 'You cannot submit a review for yourself.' });
      return;
    }

    // 2. Validate rating range (1-5)
    const numericRating = Math.round(Number(rating));
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
      return;
    }

    const targetUser = await User.findById(revieweeId);
    if (!targetUser || targetUser.status === 'inactive') {
      res.status(404).json({ success: false, message: 'Reviewee user not found or inactive.' });
      return;
    }

    // 3. Eligibility and Duplicate Check
    if (sessionId) {
      if (!isValidObjectId(sessionId)) {
        res.status(400).json({ success: false, message: 'Invalid session ID format.' });
        return;
      }

      const session = await Session.findById(sessionId);
      if (!session) {
        res.status(404).json({ success: false, message: 'Associated session not found.' });
        return;
      }

      if (session.status !== 'completed') {
        res.status(400).json({
          success: false,
          message: 'Reviews may only be submitted for completed sessions.',
        });
        return;
      }

      const isParticipant =
        (session.mentor.toString() === reviewerId.toString() && session.learner.toString() === revieweeId.toString()) ||
        (session.learner.toString() === reviewerId.toString() && session.mentor.toString() === revieweeId.toString());

      if (!isParticipant) {
        res.status(403).json({
          success: false,
          message: 'You were not a participant with this user in the specified session.',
        });
        return;
      }

      // Check duplicate review for session
      const existingSessionReview = await Review.findOne({
        sessionId,
        reviewer: reviewerId,
      });

      if (existingSessionReview) {
        res.status(400).json({
          success: false,
          message: 'You have already submitted a review for this session.',
        });
        return;
      }
    } else {
      // General peer review: verify mutual completed exchange or session eligibility
      const hasCompletedSession = await Session.exists({
        status: 'completed',
        $or: [
          { mentor: reviewerId, learner: revieweeId },
          { learner: reviewerId, mentor: revieweeId },
        ],
      });

      const hasCompletedExchange = await ExchangeRequest.exists({
        status: 'completed',
        $or: [
          { sender: reviewerId, receiver: revieweeId },
          { receiver: reviewerId, sender: revieweeId },
        ],
      });

      if (!hasCompletedSession && !hasCompletedExchange) {
        res.status(403).json({
          success: false,
          message: 'Review eligibility required: You can only review partners with whom you have completed a session or skill exchange.',
        });
        return;
      }
    }

    const cleanFeedback = String(feedback).trim();
    if (cleanFeedback.length < 5) {
      res.status(400).json({ success: false, message: 'Feedback must be at least 5 characters long.' });
      return;
    }

    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating: numericRating,
      feedback: cleanFeedback,
      skillSwapped: skillSwapped ? String(skillSwapped).trim() : 'Skill Exchange',
      ...(sessionId ? { sessionId } : {}),
    });

    // Recalculate reviewee average rating and reputation
    const allUserReviews = await Review.find({ reviewee: revieweeId });
    const avgRating = allUserReviews.length > 0
      ? Number((allUserReviews.reduce((sum, r) => sum + r.rating, 0) / allUserReviews.length).toFixed(1))
      : numericRating;

    await User.findByIdAndUpdate(revieweeId, {
      $set: { rating: avgRating, reviewCount: allUserReviews.length },
      $inc: { reputationScore: numericRating * 5 },
    });

    // Notify reviewee
    await Notification.create({
      user: revieweeId,
      title: 'New Review Received',
      message: `${req.user?.name || 'A partner'} left you a ${numericRating}-star review: "${cleanFeedback.slice(0, 50)}..."`,
      type: 'review_received',
      link: '/reviews',
    });

    const populated = await Review.findById(review._id).populate('reviewer', 'name avatar role');
    res.status(201).json({ success: true, message: 'Review submitted successfully!', review: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error submitting review.' });
  }
};
