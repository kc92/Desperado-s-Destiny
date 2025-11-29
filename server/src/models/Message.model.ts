/**
 * Message Model
 *
 * Mongoose schema for chat messages in Desperados Destiny
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Chat room types
 */
export enum RoomType {
  GLOBAL = 'GLOBAL',
  FACTION = 'FACTION',
  GANG = 'GANG',
  WHISPER = 'WHISPER'
}

/**
 * Message document interface
 */
export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  roomType: RoomType;
  roomId: string;
  content: string;
  timestamp: Date;
  isSystemMessage: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message model interface
 */
export interface IMessageModel extends Model<IMessage> {
  getMessageHistory(
    roomType: RoomType,
    roomId: string,
    limit: number,
    offset: number
  ): Promise<IMessage[]>;
  deleteOldMessages(daysOld: number): Promise<number>;
}

/**
 * Message schema definition
 */
const MessageSchema = new Schema<IMessage, IMessageModel>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: [true, 'Sender ID is required'],
      index: true
    },
    senderName: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
      minlength: [3, 'Sender name must be at least 3 characters'],
      maxlength: [20, 'Sender name must not exceed 20 characters']
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      enum: {
        values: Object.values(RoomType),
        message: 'Room type must be GLOBAL, FACTION, GANG, or WHISPER'
      },
      index: true
    },
    roomId: {
      type: String,
      required: [true, 'Room ID is required'],
      trim: true,
      index: true,
      validate: {
        validator: function(roomId: string) {
          return roomId.length > 0 && roomId.length <= 100;
        },
        message: 'Room ID must be between 1 and 100 characters'
      }
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      minlength: [1, 'Message must be at least 1 character'],
      maxlength: [500, 'Message must not exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    isSystemMessage: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'messages'
  }
);

/**
 * Compound indexes for efficient querying
 * Primary query pattern: Get messages for a specific room, sorted by timestamp
 */
MessageSchema.index({ roomType: 1, roomId: 1, timestamp: -1 });
MessageSchema.index({ senderId: 1, timestamp: -1 });
MessageSchema.index({ timestamp: -1 });
MessageSchema.index({ isSystemMessage: 1, timestamp: -1 });

/**
 * Static method: Get message history for a room
 */
MessageSchema.statics.getMessageHistory = async function(
  roomType: RoomType,
  roomId: string,
  limit: number = 50,
  offset: number = 0
): Promise<IMessage[]> {
  // Validate limit
  const validLimit = Math.min(Math.max(1, limit), 100);
  const validOffset = Math.max(0, offset);

  return this.find({
    roomType,
    roomId
  })
    .sort({ timestamp: -1 })
    .skip(validOffset)
    .limit(validLimit)
    .lean()
    .exec() as unknown as IMessage[];
};

/**
 * Static method: Delete old messages (cleanup utility)
 */
MessageSchema.statics.deleteOldMessages = async function(
  daysOld: number = 30
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });

  return result.deletedCount || 0;
};

/**
 * Pre-save hook: Validate room ID format
 */
MessageSchema.pre('save', function(next) {
  const message = this as IMessage;

  // Validate room ID based on room type
  switch (message.roomType) {
    case RoomType.GLOBAL:
      if (message.roomId !== 'global') {
        return next(new Error('Global room ID must be "global"'));
      }
      break;

    case RoomType.FACTION:
      const validFactions = ['SETTLER_ALLIANCE', 'NAHI_COALITION', 'FRONTERA'];
      if (!validFactions.includes(message.roomId)) {
        return next(new Error('Invalid faction room ID'));
      }
      break;

    case RoomType.GANG:
      if (!mongoose.Types.ObjectId.isValid(message.roomId)) {
        return next(new Error('Gang room ID must be a valid ObjectId'));
      }
      break;

    case RoomType.WHISPER:
      if (!message.roomId.startsWith('whisper-')) {
        return next(new Error('Whisper room ID must start with "whisper-"'));
      }
      break;

    default:
      return next(new Error('Invalid room type'));
  }

  next();
});

/**
 * Export Message model
 */
export const Message = mongoose.model<IMessage, IMessageModel>('Message', MessageSchema);

export default Message;
