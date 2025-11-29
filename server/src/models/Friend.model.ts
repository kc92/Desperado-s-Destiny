/**
 * Friend Model
 *
 * Mongoose schema for friend relationships and requests
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Friend status enum
 */
export enum FriendStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED'
}

/**
 * Friend document interface
 */
export interface IFriend extends Document {
  requesterId: mongoose.Types.ObjectId;
  requesterName: string;
  recipientId: mongoose.Types.ObjectId;
  recipientName: string;

  status: FriendStatus;

  requestedAt: Date;
  respondedAt: Date | null;

  accept(): Promise<void>;
  reject(): Promise<void>;
  block(): Promise<void>;
}

/**
 * Friend static methods interface
 */
export interface IFriendModel extends Model<IFriend> {
  areFriends(char1Id: mongoose.Types.ObjectId, char2Id: mongoose.Types.ObjectId): Promise<boolean>;
  isFriendRequestPending(requesterId: mongoose.Types.ObjectId, recipientId: mongoose.Types.ObjectId): Promise<boolean>;
  findExistingRelationship(char1Id: mongoose.Types.ObjectId, char2Id: mongoose.Types.ObjectId): Promise<IFriend | null>;
}

/**
 * Friend schema definition
 */
const FriendSchema = new Schema<IFriend>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    requesterName: {
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

    status: {
      type: String,
      enum: Object.values(FriendStatus),
      default: FriendStatus.PENDING,
      required: true
    },

    requestedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
FriendSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });
FriendSchema.index({ recipientId: 1, status: 1 });
FriendSchema.index({ requesterId: 1, status: 1 });

/**
 * Validation: Prevent self-friending
 */
FriendSchema.pre('validate', function(next) {
  if (this.requesterId.toString() === this.recipientId.toString()) {
    next(new Error('Cannot send friend request to yourself'));
  } else {
    next();
  }
});

/**
 * Instance method: Accept friend request
 */
FriendSchema.methods.accept = async function(this: IFriend): Promise<void> {
  this.status = FriendStatus.ACCEPTED;
  this.respondedAt = new Date();
  await this.save();
};

/**
 * Instance method: Reject friend request
 */
FriendSchema.methods.reject = async function(this: IFriend): Promise<void> {
  this.status = FriendStatus.REJECTED;
  this.respondedAt = new Date();
  await this.save();
};

/**
 * Instance method: Block user
 */
FriendSchema.methods.block = async function(this: IFriend): Promise<void> {
  this.status = FriendStatus.BLOCKED;
  this.respondedAt = new Date();
  await this.save();
};

/**
 * Static method: Check if two characters are friends
 */
FriendSchema.statics.areFriends = async function(
  char1Id: mongoose.Types.ObjectId,
  char2Id: mongoose.Types.ObjectId
): Promise<boolean> {
  const friendship = await this.findOne({
    $or: [
      { requesterId: char1Id, recipientId: char2Id },
      { requesterId: char2Id, recipientId: char1Id }
    ],
    status: FriendStatus.ACCEPTED
  });

  return !!friendship;
};

/**
 * Static method: Check if friend request is pending
 */
FriendSchema.statics.isFriendRequestPending = async function(
  requesterId: mongoose.Types.ObjectId,
  recipientId: mongoose.Types.ObjectId
): Promise<boolean> {
  const request = await this.findOne({
    $or: [
      { requesterId, recipientId },
      { requesterId: recipientId, recipientId: requesterId }
    ],
    status: FriendStatus.PENDING
  });

  return !!request;
};

/**
 * Static method: Find existing relationship (any status)
 */
FriendSchema.statics.findExistingRelationship = async function(
  char1Id: mongoose.Types.ObjectId,
  char2Id: mongoose.Types.ObjectId
): Promise<IFriend | null> {
  return this.findOne({
    $or: [
      { requesterId: char1Id, recipientId: char2Id },
      { requesterId: char2Id, recipientId: char1Id }
    ]
  });
};

/**
 * Friend model
 */
export const Friend = mongoose.model<IFriend, IFriendModel>('Friend', FriendSchema);
