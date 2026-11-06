import { Response } from 'express';
import { CreditTransaction } from '../models/CreditTransaction';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const getBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId).select('credits reputationScore badges');
    const transactions = await CreditTransaction.find({ user: userId }).sort({ createdAt: -1 });

    const totalEarned = transactions
      .filter((t) => t.type === 'earned' || t.type === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = transactions
      .filter((t) => t.type === 'spent')
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      balance: user?.credits || 0,
      reputationScore: user?.reputationScore || 100,
      badges: user?.badges || [],
      totalEarned,
      totalSpent,
      transactions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching credits.' });
  }
};

export const redeemCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { perkName, cost } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user.credits < cost) {
      res.status(400).json({ success: false, message: 'Insufficient credit balance.' });
      return;
    }

    user.credits -= cost;
    if (perkName === 'Verified Mentor Badge' && !user.badges.includes('Verified Mentor')) {
      user.badges.push('Verified Mentor');
    }
    await user.save();

    await CreditTransaction.create({
      user: userId,
      amount: cost,
      type: 'spent',
      description: `Redeemed reward: ${perkName}`,
    });

    res.status(200).json({
      success: true,
      message: `Successfully redeemed '${perkName}'!`,
      credits: user.credits,
      badges: user.badges,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error redeeming credits.' });
  }
};

