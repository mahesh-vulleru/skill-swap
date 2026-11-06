import { Request, Response } from 'express';
import { computeMatches } from '../services/matchingService';
import { AuthRequest } from '../middleware/authMiddleware';

export const getMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user ? req.user._id.toString() : undefined;
    const matches = await computeMatches(currentUserId);
    res.status(200).json({ success: true, count: matches.length, matches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error computing matches.' });
  }
};

