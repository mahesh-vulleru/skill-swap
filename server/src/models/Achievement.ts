import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  title: string;
  badge: string;
  description: string;
  category: 'mentorship' | 'learning' | 'community' | 'consistency';
  criteria: string;
  icon: string;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true },
    badge: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['mentorship', 'learning', 'community', 'consistency'],
      default: 'community',
    },
    criteria: { type: String, default: '' },
    icon: { type: String, default: 'Award' },
  },
  { timestamps: true }
);

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);

