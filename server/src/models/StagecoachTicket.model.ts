/**
 * Stagecoach Ticket Model
 *
 * Mongoose schema for stagecoach tickets
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Stagecoach ticket status
 */
export type TicketStatus = 'booked' | 'boarding' | 'traveling' | 'completed' | 'cancelled';

/**
 * Stagecoach ticket document interface
 */
export interface IStagecoachTicket extends Document {
  characterId: mongoose.Types.ObjectId;
  routeId: string;
  stagecoachId: string;
  departureLocation: string;
  destinationLocation: string;
  departureTime: Date;
  estimatedArrival: Date;
  fare: number;
  seatNumber: number;
  luggageWeight: number;
  weaponDeclared: boolean;
  status: TicketStatus;
  purchaseTime: Date;
  completedTime?: Date;
  refunded: boolean;
  refundAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stagecoach ticket static methods
 */
export interface IStagecoachTicketModel extends Model<IStagecoachTicket> {
  findActiveByCharacter(characterId: string): Promise<IStagecoachTicket | null>;
  findByStagecoach(stagecoachId: string): Promise<IStagecoachTicket[]>;
  findCompletedByCharacter(characterId: string): Promise<IStagecoachTicket[]>;
}

/**
 * Stagecoach ticket schema
 */
const StagecoachTicketSchema = new Schema<IStagecoachTicket>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    routeId: {
      type: String,
      required: true,
      index: true,
    },
    stagecoachId: {
      type: String,
      required: true,
      index: true,
    },
    departureLocation: {
      type: String,
      required: true,
    },
    destinationLocation: {
      type: String,
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
      index: true,
    },
    estimatedArrival: {
      type: Date,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
    },
    seatNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    luggageWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    weaponDeclared: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['booked', 'boarding', 'traveling', 'completed', 'cancelled'],
      default: 'booked',
      index: true,
    },
    purchaseTime: {
      type: Date,
      default: Date.now,
    },
    completedTime: {
      type: Date,
    },
    refunded: {
      type: Boolean,
      default: false,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
StagecoachTicketSchema.index({ characterId: 1, status: 1 });
StagecoachTicketSchema.index({ stagecoachId: 1, status: 1 });
StagecoachTicketSchema.index({ routeId: 1, departureTime: 1 });

/**
 * Static method: Find active ticket for character
 */
StagecoachTicketSchema.statics.findActiveByCharacter = async function (
  characterId: string
): Promise<IStagecoachTicket | null> {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: { $in: ['booked', 'boarding', 'traveling'] },
  }).sort({ departureTime: 1 });
};

/**
 * Static method: Find all tickets for a stagecoach
 */
StagecoachTicketSchema.statics.findByStagecoach = async function (
  stagecoachId: string
): Promise<IStagecoachTicket[]> {
  return this.find({
    stagecoachId,
    status: { $in: ['booked', 'boarding', 'traveling'] },
  }).sort({ seatNumber: 1 });
};

/**
 * Static method: Find completed tickets for character (travel history)
 */
StagecoachTicketSchema.statics.findCompletedByCharacter = async function (
  characterId: string
): Promise<IStagecoachTicket[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: 'completed',
  })
    .sort({ completedTime: -1 })
    .limit(50);
};

/**
 * Virtual for duration
 */
StagecoachTicketSchema.virtual('travelDuration').get(function (this: IStagecoachTicket) {
  return this.estimatedArrival.getTime() - this.departureTime.getTime();
});

/**
 * Virtual for elapsed time
 */
StagecoachTicketSchema.virtual('elapsedTime').get(function (this: IStagecoachTicket) {
  if (this.status !== 'traveling') return 0;
  return Date.now() - this.departureTime.getTime();
});

/**
 * Virtual for progress percentage
 */
StagecoachTicketSchema.virtual('progressPercent').get(function (this: IStagecoachTicket) {
  if (this.status === 'completed') return 100;
  if (this.status === 'booked' || this.status === 'boarding') return 0;

  const totalDuration = this.estimatedArrival.getTime() - this.departureTime.getTime();
  const elapsed = Date.now() - this.departureTime.getTime();
  return Math.min(100, Math.floor((elapsed / totalDuration) * 100));
});

/**
 * Virtual for is refundable
 */
StagecoachTicketSchema.virtual('isRefundable').get(function (this: IStagecoachTicket) {
  if (this.refunded || this.status === 'completed') return false;
  if (this.status === 'cancelled') return false;

  // Can refund up to 1 hour before departure
  const oneHourBeforeDeparture = this.departureTime.getTime() - 60 * 60 * 1000;
  return Date.now() < oneHourBeforeDeparture;
});

/**
 * Ensure virtuals are included in JSON
 */
StagecoachTicketSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

/**
 * Stagecoach ticket model
 */
export const StagecoachTicket = mongoose.model<IStagecoachTicket, IStagecoachTicketModel>(
  'StagecoachTicket',
  StagecoachTicketSchema
);
