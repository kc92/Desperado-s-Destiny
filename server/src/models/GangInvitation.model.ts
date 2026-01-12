/**
 * Gang Invitation Model
 *
 * Mongoose schema for gang invitation system
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { GangInvitationStatus } from '@desperados/shared';

/**
 * Gang Invitation document interface
 */
export interface IGangInvitation extends Document {
  gangId: mongoose.Types.ObjectId;
  gangName: string;
  inviterId: mongoose.Types.ObjectId;
  inviterName: string;
  recipientId: mongoose.Types.ObjectId;
  recipientName: string;
  status: GangInvitationStatus;
  createdAt: Date;
  respondedAt: Date | null;

  accept(): void;
  reject(): void;
  isPending(): boolean;
}

/**
 * Gang Invitation static methods interface
 */
export interface IGangInvitationModel extends Model<IGangInvitation> {
  findPendingByRecipient(recipientId: mongoose.Types.ObjectId): Promise<IGangInvitation[]>;
  findByGang(gangId: mongoose.Types.ObjectId): Promise<IGangInvitation[]>;
  hasPendingInvitation(
    gangId: mongoose.Types.ObjectId,
    recipientId: mongoose.Types.ObjectId
  ): Promise<boolean>;
}

/**
 * Gang Invitation schema definition
 */
const GangInvitationSchema = new Schema<IGangInvitation>(
  {
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      // Note: covered by composite indexes below
    },
    gangName: {
      type: String,
      required: true,
    },
    inviterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    },
    inviterName: {
      type: String,
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      // Note: covered by composite indexes below
    },
    recipientName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(GangInvitationStatus),
      default: GangInvitationStatus.PENDING,
      // Note: covered by composite indexes below
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 * Note: gangId + recipientId index is defined below with unique partial filter
 */
GangInvitationSchema.index({ recipientId: 1, status: 1 });
GangInvitationSchema.index({ gangId: 1, status: 1 });

/**
 * Unique index: One pending invitation per gang-recipient pair
 */
GangInvitationSchema.index(
  { gangId: 1, recipientId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: GangInvitationStatus.PENDING },
  }
);

/**
 * Instance method: Accept invitation
 */
GangInvitationSchema.methods.accept = function (this: IGangInvitation): void {
  if (this.status !== GangInvitationStatus.PENDING) {
    throw new Error('Invitation is not pending');
  }
  this.status = GangInvitationStatus.ACCEPTED;
  this.respondedAt = new Date();
};

/**
 * Instance method: Reject invitation
 */
GangInvitationSchema.methods.reject = function (this: IGangInvitation): void {
  if (this.status !== GangInvitationStatus.PENDING) {
    throw new Error('Invitation is not pending');
  }
  this.status = GangInvitationStatus.REJECTED;
  this.respondedAt = new Date();
};

/**
 * Instance method: Check if invitation is pending
 */
GangInvitationSchema.methods.isPending = function (this: IGangInvitation): boolean {
  return this.status === GangInvitationStatus.PENDING;
};

/**
 * Static method: Find all pending invitations for a recipient
 */
GangInvitationSchema.statics.findPendingByRecipient = async function (
  recipientId: mongoose.Types.ObjectId
): Promise<IGangInvitation[]> {
  return this.find({
    recipientId,
    status: GangInvitationStatus.PENDING,
  }).sort({ createdAt: -1 });
};

/**
 * Static method: Find all invitations for a gang
 */
GangInvitationSchema.statics.findByGang = async function (
  gangId: mongoose.Types.ObjectId
): Promise<IGangInvitation[]> {
  return this.find({ gangId }).sort({ createdAt: -1 });
};

/**
 * Static method: Check if pending invitation exists
 */
GangInvitationSchema.statics.hasPendingInvitation = async function (
  gangId: mongoose.Types.ObjectId,
  recipientId: mongoose.Types.ObjectId
): Promise<boolean> {
  const invitation = await this.findOne({
    gangId,
    recipientId,
    status: GangInvitationStatus.PENDING,
  });
  return !!invitation;
};

/**
 * Gang Invitation model
 */
export const GangInvitation = mongoose.model<IGangInvitation, IGangInvitationModel>(
  'GangInvitation',
  GangInvitationSchema
);
