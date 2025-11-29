/**
 * Mail Model
 *
 * Mongoose schema for player-to-player mail system with gold attachments
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Mail document interface
 */
export interface IMail extends Document {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  recipientId: mongoose.Types.ObjectId;
  recipientName: string;

  subject: string;
  body: string;

  goldAttachment: number;
  goldClaimed: boolean;

  isRead: boolean;
  readAt: Date | null;

  sentAt: Date;

  deletedBySender: boolean;
  deletedByRecipient: boolean;

  markAsRead(): Promise<void>;
  claimGoldAttachment(characterId: mongoose.Types.ObjectId): Promise<number>;
  softDelete(characterId: mongoose.Types.ObjectId, role: 'sender' | 'recipient'): void;
}

/**
 * Mail schema definition
 */
const MailSchema = new Schema<IMail>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    senderName: {
      type: String,
      required: true
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    recipientName: {
      type: String,
      required: true
    },

    subject: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
      trim: true
    },
    body: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 2000,
      trim: true
    },

    goldAttachment: {
      type: Number,
      default: 0,
      min: 0
    },
    goldClaimed: {
      type: Boolean,
      default: false
    },

    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },

    sentAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    deletedBySender: {
      type: Boolean,
      default: false
    },
    deletedByRecipient: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
MailSchema.index({ recipientId: 1, isRead: 1, sentAt: -1 });
MailSchema.index({ recipientId: 1, deletedByRecipient: 1 });
MailSchema.index({ senderId: 1, sentAt: -1 });
MailSchema.index({ senderId: 1, deletedBySender: 1 });

/**
 * Validation: Prevent self-mailing
 */
MailSchema.pre('validate', function(next) {
  if (this.senderId.toString() === this.recipientId.toString()) {
    next(new Error('Cannot send mail to yourself'));
  } else {
    next();
  }
});

/**
 * Instance method: Mark mail as read
 */
MailSchema.methods.markAsRead = async function(this: IMail): Promise<void> {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

/**
 * Instance method: Claim gold attachment
 * This method is called within a service transaction
 */
MailSchema.methods.claimGoldAttachment = async function(
  this: IMail,
  characterId: mongoose.Types.ObjectId
): Promise<number> {
  if (this.recipientId.toString() !== characterId.toString()) {
    throw new Error('Only the recipient can claim the gold attachment');
  }

  if (this.goldAttachment <= 0) {
    throw new Error('No gold attachment to claim');
  }

  if (this.goldClaimed) {
    throw new Error('Gold attachment already claimed');
  }

  const goldAmount = this.goldAttachment;
  this.goldClaimed = true;
  await this.save();

  return goldAmount;
};

/**
 * Instance method: Soft delete mail
 * If both sender and recipient delete, actually remove document
 */
MailSchema.methods.softDelete = function(
  this: IMail,
  characterId: mongoose.Types.ObjectId,
  role: 'sender' | 'recipient'
): void {
  if (role === 'sender') {
    if (this.senderId.toString() !== characterId.toString()) {
      throw new Error('You are not the sender of this mail');
    }
    this.deletedBySender = true;
  } else if (role === 'recipient') {
    if (this.recipientId.toString() !== characterId.toString()) {
      throw new Error('You are not the recipient of this mail');
    }
    this.deletedByRecipient = true;
  }
};

/**
 * Mail model
 */
export const Mail: Model<IMail> = mongoose.model<IMail>('Mail', MailSchema);
