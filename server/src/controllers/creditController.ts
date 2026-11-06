import { Response } from 'express';
import { CreditTransaction } from '../models/CreditTransaction';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';
import { PERK_CATALOG } from '../utils/security';

export const getBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const user = await User.findById(userId).select('credits reputationScore badges');
    const transactions = await CreditTransaction.find({ user: userId }).sort({ createdAt: -1 });

    const totalEarned = transactions
      .filter((t) => t.type === 'earned' || t.type === 'bonus' || t.type === 'refund')
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
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { perkName } = req.body;

    if (!perkName || typeof perkName !== 'string') {
      res.status(400).json({ success: false, message: 'Reward perk name is required.' });
      return;
    }

    // Security Hardening: Never trust client-supplied cost! Look up server-authoritative cost.
    const perkDef = PERK_CATALOG[perkName.trim()];
    if (!perkDef) {
      res.status(400).json({
        success: false,
        message: `Invalid perk '${perkName}'. Available perks: ${Object.keys(PERK_CATALOG).join(', ')}.`,
      });
      return;
    }

    const authorizedCost = perkDef.cost;

    // Atomic update to eliminate race condition / double-spending / negative balance
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, credits: { $gte: authorizedCost } },
      {
        $inc: { credits: -authorizedCost },
        ...(perkDef.badge ? { $addToSet: { badges: perkDef.badge } } : {}),
      },
      { new: true }
    );

    if (!updatedUser) {
      // Check if user exists or if balance is insufficient
      const userExists = await User.findById(userId);
      if (!userExists) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }
      res.status(400).json({
        success: false,
        message: `Insufficient credit balance. You need ${authorizedCost} credits, but currently have ${userExists.credits}.`,
      });
      return;
    }

    // Record immutable audit transaction
    await CreditTransaction.create({
      user: userId,
      amount: authorizedCost,
      type: 'spent',
      description: `Redeemed reward: ${perkDef.title}`,
      referenceId: `perk_${Date.now()}`,
    });

    // Notify user
    await Notification.create({
      user: userId,
      title: 'Reward Redeemed',
      message: `You successfully redeemed '${perkDef.title}' for ${authorizedCost} credits.`,
      type: 'credits_awarded',
      link: '/credits',
    });

    res.status(200).json({
      success: true,
      message: `Successfully redeemed '${perkDef.title}'!`,
      credits: updatedUser.credits,
      badges: updatedUser.badges,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error redeeming credits.' });
  }
};
