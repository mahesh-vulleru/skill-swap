import mongoose, { Document, Schema } from 'mongoose';

export type ExchangeStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface IExchangeRequest extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  skillOffered: string;
  skillWanted: string;
  message?: string;
  status: ExchangeStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeRequestSchema = new Schema<IExchangeRequest>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    skillOffered: { type: String, required: true },
    skillWanted: { type: String, required: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export const ExchangeRequest = mongoose.model<IExchangeRequest>('ExchangeRequest', ExchangeRequestSchema);

