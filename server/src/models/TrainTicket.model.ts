/**
 * Train Ticket Model
 *
 * Mongoose model for train tickets
 */

import mongoose, { Schema, Document } from 'mongoose';
import { TicketClass, TicketStatus } from '@desperados/shared';

/**
 * Train Ticket Document Interface
 */
export interface ITrainTicket extends Document {
  _id: mongoose.Types.ObjectId;
  passengerId: mongoose.Types.ObjectId;
  passengerName: string;
  trainId: string;
  routeId: string;
  ticketClass: TicketClass;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  status: TicketStatus;
  seatNumber?: string;
  perks: string[];
  purchasedAt: Date;
  usedAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  canUse(): boolean;
  canRefund(): boolean;
  use(): void;
  refund(): void;
  isExpired(): boolean;
}

/**
 * Train Ticket Schema
 */
const TrainTicketSchema = new Schema<ITrainTicket>(
  {
    passengerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    passengerName: {
      type: String,
      required: true,
    },
    trainId: {
      type: String,
      required: true,
      index: true,
    },
    routeId: {
      type: String,
      required: true,
      index: true,
    },
    ticketClass: {
      type: String,
      required: true,
      enum: Object.values(TicketClass),
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
      index: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TicketStatus),
      default: TicketStatus.VALID,
      index: true,
    },
    seatNumber: {
      type: String,
    },
    perks: {
      type: [String],
      default: [],
    },
    purchasedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    usedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
TrainTicketSchema.index({ passengerId: 1, status: 1 });
TrainTicketSchema.index({ trainId: 1, departureTime: 1 });
TrainTicketSchema.index({ departureTime: 1, status: 1 });

/**
 * Virtual for id
 */
TrainTicketSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

/**
 * Instance method: Check if ticket can be used
 */
TrainTicketSchema.methods.canUse = function (this: ITrainTicket): boolean {
  if (this.status !== TicketStatus.VALID) {
    return false;
  }

  // Can only use ticket within 1 hour before departure
  const now = new Date();
  const oneHourBefore = new Date(this.departureTime.getTime() - 60 * 60 * 1000);

  return now >= oneHourBefore && now <= this.departureTime;
};

/**
 * Instance method: Check if ticket can be refunded
 */
TrainTicketSchema.methods.canRefund = function (this: ITrainTicket): boolean {
  if (this.status !== TicketStatus.VALID) {
    return false;
  }

  // Can only refund if departure is more than 2 hours away
  const now = new Date();
  const twoHoursBefore = new Date(this.departureTime.getTime() - 2 * 60 * 60 * 1000);

  return now < twoHoursBefore;
};

/**
 * Instance method: Use the ticket
 */
TrainTicketSchema.methods.use = function (this: ITrainTicket): void {
  if (!this.canUse()) {
    throw new Error('Ticket cannot be used at this time');
  }

  this.status = TicketStatus.USED;
  this.usedAt = new Date();
};

/**
 * Instance method: Refund the ticket
 */
TrainTicketSchema.methods.refund = function (this: ITrainTicket): void {
  if (!this.canRefund()) {
    throw new Error('Ticket cannot be refunded at this time');
  }

  this.status = TicketStatus.REFUNDED;
  this.refundedAt = new Date();
};

/**
 * Instance method: Check if ticket is expired
 */
TrainTicketSchema.methods.isExpired = function (this: ITrainTicket): boolean {
  const now = new Date();
  return now > this.departureTime && this.status === TicketStatus.VALID;
};

/**
 * Pre-save hook: Auto-expire old tickets
 */
TrainTicketSchema.pre('save', function (next) {
  if (this.isExpired() && this.status === TicketStatus.VALID) {
    this.status = TicketStatus.EXPIRED;
  }
  next();
});

/**
 * Ensure virtuals are included in JSON
 */
TrainTicketSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

/**
 * Train Ticket Model
 */
export const TrainTicket = mongoose.model<ITrainTicket>('TrainTicket', TrainTicketSchema);
export default TrainTicket;
