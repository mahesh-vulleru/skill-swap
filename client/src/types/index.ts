export type UserRole = 'learner' | 'mentor' | 'learner_mentor' | 'admin';

export interface ISkillItem {
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description?: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  location: string;
  role: UserRole;
  credits: number;
  rating: number;
  reputationScore: number;
  reviewCount: number;
  sessionsCompleted: number;
  skillsOffered: ISkillItem[];
  skillsWanted: ISkillItem[];
  availability: string;
  status: 'active' | 'inactive';
  badges: string[];
  createdAt: string;
}

export interface ISkillCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  skillCount: number;
}

export interface ISkill {
  _id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  learnerCount: number;
  mentorCount: number;
  rating: number;
  icon: string;
}

export interface IMatchResult {
  user: IUser;
  matchPercentage: number;
  matchType: 'Best Match' | 'Nearby' | 'Same Interests';
  matchedOfferSkill: string;
  matchedWantedSkill: string;
}

export interface IExchangeRequest {
  _id: string;
  sender: IUser;
  receiver: IUser;
  skillOffered: string;
  skillWanted: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ISession {
  _id: string;
  exchangeId?: string;
  mentor: IUser;
  learner: IUser;
  skill: string;
  topic: string;
  date: string;
  time: string;
  durationMinutes: number;
  mode: 'Google Meet' | 'Zoom' | 'SkillSwap Live Video';
  meetingLink: string;
  notes?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface IMessage {
  _id: string;
  sender: IUser | { _id: string; name: string; avatar: string };
  receiver: IUser | { _id: string; name: string; avatar: string };
  content: string;
  attachmentUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface IConversation {
  partner: IUser;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online: boolean;
}

export interface IReview {
  _id: string;
  reviewer: IUser;
  reviewee: IUser | string;
  rating: number;
  feedback: string;
  skillSwapped: string;
  createdAt: string;
}

export interface ICreditTransaction {
  _id: string;
  user: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus' | 'refund';
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: 'exchange_request' | 'session_scheduled' | 'message_received' | 'review_received' | 'credits_awarded';
  link: string;
  read: boolean;
  createdAt: string;
}

export interface IAnalyticsData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalExchanges: number;
    completedExchanges: number;
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    totalSkills: number;
    avgRating: number;
    totalCreditsCirculation?: number;
  };
  monthlyActivity: Array<{ month: string; exchanges: number; sessions: number; newUsers: number }>;
  categoryDistribution: Array<{ name: string; skills: number; share: number }>;
  topSkills: ISkill[];
}

