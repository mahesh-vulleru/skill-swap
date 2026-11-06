import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'learner' | 'mentor' | 'learner_mentor' | 'admin';

export interface ISkillItem {
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80',
    },
    bio: { type: String, default: 'Passionate about learning and exchanging skills on SkillSwap!' },
    location: { type: String, default: 'San Francisco, CA' },
    role: {
      type: String,
      enum: ['learner', 'mentor', 'learner_mentor', 'admin'],
      default: 'learner_mentor',
    },
    credits: { type: Number, default: 30 },
    rating: { type: Number, default: 4.9 },
    reputationScore: { type: Number, default: 120 },
    reviewCount: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    skillsOffered: [
      {
        name: { type: String, required: true },
        category: { type: String, required: true },
        level: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          default: 'Intermediate',
        },
        description: { type: String },
      },
    ],
    skillsWanted: [
      {
        name: { type: String, required: true },
        category: { type: String, required: true },
        level: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          default: 'Beginner',
        },
        description: { type: String },
      },
    ],
    availability: { type: String, default: 'Weekdays after 6 PM, Weekends' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    badges: { type: [String], default: ['Top Mentor', 'Active Learner', 'Community Star'] },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

