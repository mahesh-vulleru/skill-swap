import mongoose, { Document, Schema } from 'mongoose';

export type CreditTransactionType = 'earned' | 'spent' | 'bonus' | 'refund';

export interface ICreditTransaction extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  type: CreditTransactionType;
  description: string;
  referenceId?: string;
  createdAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['earned', 'spent', 'bonus', 'refund'],
      required: true,
    },
    description: { type: String, required: true },
    referenceId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CreditTransaction = mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);

