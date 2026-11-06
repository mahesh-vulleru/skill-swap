import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillCategory extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  skillCount: number;
}

const SkillCategorySchema = new Schema<ISkillCategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Code' },
    color: { type: String, default: 'emerald' },
    skillCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SkillCategory = mongoose.model<ISkillCategory>('SkillCategory', SkillCategorySchema);

