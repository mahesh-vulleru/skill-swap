import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  sessionId?: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewee: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  feedback: string;
  skillSwapped: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reviewee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, required: true },
    skillSwapped: { type: String, required: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ sessionId: 1, reviewer: 1 });
ReviewSchema.index({ reviewee: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

