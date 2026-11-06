import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
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

const SkillSchema = new Schema<ISkill>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    tags: { type: [String], default: [] },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels',
    },
    learnerCount: { type: Number, default: 0 },
    mentorCount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    icon: { type: String, default: 'Sparkles' },
  },
  { timestamps: true }
);

export const Skill = mongoose.model<ISkill>('Skill', SkillSchema);

