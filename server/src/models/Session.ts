import mongoose, { Document, Schema } from 'mongoose';

export type SessionStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface ISession extends Document {
  exchangeId?: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  learner: mongoose.Types.ObjectId;
  skill: string;
  topic: string;
  date: string;
  time: string;
  durationMinutes: number;
  mode: 'Google Meet' | 'Zoom' | 'SkillSwap Live Video';
  meetingLink: string;
  notes?: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    exchangeId: { type: Schema.Types.ObjectId, ref: 'ExchangeRequest' },
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    learner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    skill: { type: String, required: true },
    topic: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    durationMinutes: { type: Number, default: 60 },
    mode: {
      type: String,
      enum: ['Google Meet', 'Zoom', 'SkillSwap Live Video'],
      default: 'Google Meet',
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/swap-learn-skill',
    },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
  },
  { timestamps: true }
);

export const Session = mongoose.model<ISession>('Session', SessionSchema);

