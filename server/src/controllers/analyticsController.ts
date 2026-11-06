import { Request, Response } from 'express';
import { User } from '../models/User';
import { ExchangeRequest } from '../models/ExchangeRequest';
import { Session } from '../models/Session';
import { Skill } from '../models/Skill';
import { SkillCategory } from '../models/SkillCategory';
import { Review } from '../models/Review';

export const getPlatformAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalExchanges,
      completedExchanges,
      totalSessions,
      activeSessions,
      completedSessions,
      totalSkills,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      ExchangeRequest.countDocuments(),
      ExchangeRequest.countDocuments({ status: 'completed' }),
      Session.countDocuments(),
      Session.countDocuments({ status: { $in: ['upcoming', 'ongoing'] } }),
      Session.countDocuments({ status: 'completed' }),
      Skill.countDocuments(),
    ]);

    // Real Credit Circulation from database
    const creditAgg = await User.aggregate([
      { $group: { _id: null, totalCredits: { $sum: '$credits' } } },
    ]);
    const totalCreditsCirculation = creditAgg.length > 0 ? creditAgg[0].totalCredits : 0;

    // Real Average Rating
    const reviewAgg = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    const avgRating = reviewAgg.length > 0 ? Number(reviewAgg[0].avgRating.toFixed(2)) : 5.0;

    // Real Monthly Activity for the past 6 calendar months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyActivity = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLabel = monthNames[monthDate.getMonth()];

      const [exchanges, sessions, newUsers] = await Promise.all([
        ExchangeRequest.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        }),
        Session.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        }),
        User.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        }),
      ]);

      monthlyActivity.push({
        month: monthLabel,
        exchanges,
        sessions,
        newUsers,
      });
    }

    // Real Category Distribution from Skills catalog
    const categoryCounts = await Skill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const categoryCountMap = new Map<string, number>();
    categoryCounts.forEach((c) => {
      if (c._id) categoryCountMap.set(String(c._id).toLowerCase(), c.count);
    });

    const categories = await SkillCategory.find();
    const sumSkills = totalSkills > 0 ? totalSkills : 1;

    const categoryDistribution = categories.map((cat) => {
      const skillCount = categoryCountMap.get(cat.name.toLowerCase()) || cat.skillCount || 0;
      const share = Math.round((skillCount / sumSkills) * 100);
      return {
        name: cat.name,
        skills: skillCount,
        share,
      };
    });

    // Top Skills by Learner Count
    const topSkills = await Skill.find().sort({ learnerCount: -1 }).limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalExchanges,
        completedExchanges,
        totalSessions,
        activeSessions,
        completedSessions,
        totalSkills,
        avgRating,
        totalCreditsCirculation,
      },
      monthlyActivity,
      categoryDistribution,
      topSkills,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching analytics.' });
  }
};
