import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'exchange_request' | 'session_scheduled' | 'session_completed' | 'message_received' | 'review_received' | 'credits_awarded';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['exchange_request', 'session_scheduled', 'session_completed', 'message_received', 'review_received', 'credits_awarded'],
      required: true,
    },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

