import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { User } from '../models/User';
import { CreditTransaction } from '../models/CreditTransaction';
import { AuthRequest } from '../middleware/authMiddleware';

export const getReviewsForUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
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
    const { revieweeId, rating, feedback, skillSwapped, sessionId } = req.body;

    if (!revieweeId || !rating || !feedback) {
      res.status(400).json({ success: false, message: 'Reviewee, rating, and feedback are required.' });
      return;
    }

    if (reviewerId && reviewerId.toString() === revieweeId.toString()) {
      res.status(400).json({ success: false, message: 'Cannot submit a peer review for yourself.' });
      return;
    }

    // Prevent duplicate reviews for the same session by the same reviewer
    if (sessionId) {
      const existing = await Review.findOne({ reviewer: reviewerId, sessionId });
      if (existing) {
        res.status(400).json({
          success: false,
          message: 'You have already submitted a review for this session.',
        });
        return;
      }
    }

    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating: Number(rating),
      feedback,
      skillSwapped: skillSwapped || 'Skill Exchange',
      sessionId: sessionId || undefined,
    });

    // Update reviewee's average rating and reputation
    const allUserReviews = await Review.find({ reviewee: revieweeId });
    const avgRating = allUserReviews.reduce((sum, r) => sum + r.rating, 0) / allUserReviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      $set: { rating: Number(avgRating.toFixed(1)) },
      $inc: { reviewCount: 1, reputationScore: Number(rating) * 5 },
    });

    // Award +2 bonus credits to the reviewer for contributing feedback to the platform
    if (reviewerId) {
      await User.findByIdAndUpdate(reviewerId, {
        $inc: { credits: 2, reputationScore: 2 },
      });

      await CreditTransaction.create({
        user: reviewerId,
        amount: 2,
        type: 'bonus',
        description: `Review bonus for evaluating session partner`,
        referenceId: review._id.toString(),
      });
    }

    const populated = await Review.findById(review._id).populate('reviewer', 'name avatar role');
    res.status(201).json({ success: true, message: 'Review submitted successfully! (+2 bonus credits earned)', review: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error submitting review.' });
  }
};
