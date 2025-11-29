/**
 * Notification Model
 *
 * Mongoose schema for in-game notifications
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Notification type enum
 */
export enum NotificationType {
  MAIL_RECEIVED = 'MAIL_RECEIVED',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIEND_ACCEPTED = 'FRIEND_ACCEPTED',
  GANG_INVITATION = 'GANG_INVITATION',
  GANG_WAR_UPDATE = 'GANG_WAR_UPDATE',
  COMBAT_DEFEAT = 'COMBAT_DEFEAT',
  JAIL_RELEASED = 'JAIL_RELEASED',
  SKILL_TRAINED = 'SKILL_TRAINED'
}

/**
 * Notification document interface
 */
export interface INotification extends Document {
  characterId: mongoose.Types.ObjectId;

  type: NotificationType;
  title: string;
  message: string;
  link: string;

  isRead: boolean;
  createdAt: Date;

  markAsRead(): Promise<void>;
}

/**
 * Notification schema definition
 */
const NotificationSchema = new Schema<INotification>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true
    },

    title: {
      type: String,
      required: true,
      maxlength: 200
    },

    message: {
      type: String,
      required: true,
      maxlength: 500
    },

    link: {
      type: String,
      required: true,
      maxlength: 200
    },

    isRead: {
      type: Boolean,
      default: false
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

/**
 * Indexes for efficient querying
 */
NotificationSchema.index({ characterId: 1, isRead: 1, createdAt: -1 });

/**
 * Instance method: Mark notification as read
 */
NotificationSchema.methods.markAsRead = async function(this: INotification): Promise<void> {
  if (!this.isRead) {
    this.isRead = true;
    await this.save();
  }
};

/**
 * Notification model
 */
export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);
