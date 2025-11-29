/**
 * Property Auction Model
 *
 * Mongoose schema for foreclosure auctions in Desperados Destiny
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { AuctionStatus, AuctionBid, TAX_CONSTANTS } from '@desperados/shared';

/**
 * Property Auction document interface
 */
export interface IPropertyAuction extends Document {
  propertyId: mongoose.Types.ObjectId;
  propertyType: 'gang_base' | 'business' | 'ranch' | 'mine' | 'other';
  propertyName: string;
  originalOwnerId: mongoose.Types.ObjectId;
  originalOwnerName: string;
  ownerType: 'gang' | 'character';
  delinquencyId: mongoose.Types.ObjectId;
  propertyValue: number;
  propertyTier: number;
  location: string;
  minimumBid: number;
  currentBid: number;
  currentBidderId?: mongoose.Types.ObjectId;
  currentBidderName?: string;
  bids: AuctionBid[];
  status: AuctionStatus;
  startTime: Date;
  endTime: Date;
  noticePostedTime: Date;
  completedTime?: Date;
  winnerId?: mongoose.Types.ObjectId;
  winnerName?: string;
  finalPrice?: number;
  debtOwed: number;
  proceedsToOwner: number;
  reputationImpact: number;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  placeBid(bidderId: mongoose.Types.ObjectId, bidderName: string, bidAmount: number): AuctionBid;
  isValidBid(bidAmount: number, bidderId: mongoose.Types.ObjectId): boolean;
  getMinimumNextBid(): number;
  isActive(): boolean;
  canBid(bidderId: mongoose.Types.ObjectId): boolean;
  hasEnded(): boolean;
  completeAuction(): void;
  cancelAuction(reason: string): void;
  failAuction(): void;
  calculateProceeds(): { toOwner: number; toBank: number };
  notifyBidders(event: 'outbid' | 'won' | 'lost'): void;
  toSafeObject(): Record<string, unknown>;
}

/**
 * Property Auction model interface
 */
export interface IPropertyAuctionModel extends Model<IPropertyAuction> {
  findByPropertyId(propertyId: string | mongoose.Types.ObjectId): Promise<IPropertyAuction | null>;
  findByOwnerId(ownerId: string | mongoose.Types.ObjectId): Promise<IPropertyAuction[]>;
  findActiveAuctions(): Promise<IPropertyAuction[]>;
  findEndedAuctions(): Promise<IPropertyAuction[]>;
  findByStatus(status: AuctionStatus): Promise<IPropertyAuction[]>;
  createAuction(
    propertyId: mongoose.Types.ObjectId,
    propertyType: string,
    propertyName: string,
    ownerId: mongoose.Types.ObjectId,
    ownerType: 'gang' | 'character',
    ownerName: string,
    delinquencyId: mongoose.Types.ObjectId,
    propertyValue: number,
    propertyTier: number,
    location: string,
    debtOwed: number
  ): Promise<IPropertyAuction>;
}

/**
 * Auction bid subdocument schema
 */
const AuctionBidSchema = new Schema<AuctionBid>(
  {
    bidderId: {
      type: String,
      required: true,
    },
    bidderName: {
      type: String,
      required: true,
    },
    bidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    bidTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

/**
 * Property Auction schema definition
 */
const PropertyAuctionSchema = new Schema<IPropertyAuction>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    propertyType: {
      type: String,
      enum: ['gang_base', 'business', 'ranch', 'mine', 'other'],
      required: true,
    },
    propertyName: {
      type: String,
      required: true,
    },
    originalOwnerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    originalOwnerName: {
      type: String,
      required: true,
    },
    ownerType: {
      type: String,
      enum: ['gang', 'character'],
      required: true,
    },
    delinquencyId: {
      type: Schema.Types.ObjectId,
      ref: 'TaxDelinquency',
      required: true,
    },
    propertyValue: {
      type: Number,
      required: true,
      min: 0,
    },
    propertyTier: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    location: {
      type: String,
      required: true,
    },
    minimumBid: {
      type: Number,
      required: true,
      min: 0,
    },
    currentBid: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentBidderId: {
      type: Schema.Types.ObjectId,
    },
    currentBidderName: {
      type: String,
    },
    bids: {
      type: [AuctionBidSchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(AuctionStatus),
      default: AuctionStatus.PENDING,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    noticePostedTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedTime: {
      type: Date,
    },
    winnerId: {
      type: Schema.Types.ObjectId,
    },
    winnerName: {
      type: String,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    debtOwed: {
      type: Number,
      required: true,
      min: 0,
    },
    proceedsToOwner: {
      type: Number,
      default: 0,
      min: 0,
    },
    reputationImpact: {
      type: Number,
      default: -50,
      max: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
PropertyAuctionSchema.index({ propertyId: 1, status: 1 });
PropertyAuctionSchema.index({ originalOwnerId: 1, status: 1 });
PropertyAuctionSchema.index({ status: 1, endTime: 1 });
PropertyAuctionSchema.index({ startTime: 1, endTime: 1 });

/**
 * Instance method: Place a bid
 */
PropertyAuctionSchema.methods.placeBid = function (
  this: IPropertyAuction,
  bidderId: mongoose.Types.ObjectId,
  bidderName: string,
  bidAmount: number
): AuctionBid {
  if (!this.isValidBid(bidAmount, bidderId)) {
    throw new Error('Invalid bid');
  }

  // Notify previous bidder they were outbid
  if (this.currentBidderId) {
    this.notifyBidders('outbid');
  }

  const bid: AuctionBid = {
    bidderId: bidderId.toString(),
    bidderName,
    bidAmount,
    bidTime: new Date(),
    isValid: true,
  };

  this.bids.push(bid);
  this.currentBid = bidAmount;
  this.currentBidderId = bidderId;
  this.currentBidderName = bidderName;

  return bid;
};

/**
 * Instance method: Check if bid is valid
 */
PropertyAuctionSchema.methods.isValidBid = function (
  this: IPropertyAuction,
  bidAmount: number,
  bidderId: mongoose.Types.ObjectId
): boolean {
  // Auction must be active
  if (!this.isActive()) {
    return false;
  }

  // Bid must meet minimum
  if (bidAmount < this.getMinimumNextBid()) {
    return false;
  }

  // Original owner cannot bid (or can they? Let's allow it but no discount)
  // They can bid to buy back their property at market rate

  // Bidder cannot outbid themselves
  if (this.currentBidderId && this.currentBidderId.equals(bidderId)) {
    return false;
  }

  return true;
};

/**
 * Instance method: Get minimum next bid
 */
PropertyAuctionSchema.methods.getMinimumNextBid = function (this: IPropertyAuction): number {
  if (this.currentBid === 0) {
    return this.minimumBid;
  }

  // Must bid at least 5% more than current bid
  const increment = Math.ceil(this.currentBid * TAX_CONSTANTS.BID_INCREMENT_PERCENT);
  return this.currentBid + increment;
};

/**
 * Instance method: Check if auction is active
 */
PropertyAuctionSchema.methods.isActive = function (this: IPropertyAuction): boolean {
  if (this.status !== AuctionStatus.ACTIVE) {
    return false;
  }

  const now = new Date();
  return now >= this.startTime && now < this.endTime;
};

/**
 * Instance method: Check if bidder can bid
 */
PropertyAuctionSchema.methods.canBid = function (
  this: IPropertyAuction,
  bidderId: mongoose.Types.ObjectId
): boolean {
  return this.isActive() && !this.currentBidderId?.equals(bidderId);
};

/**
 * Instance method: Check if auction has ended
 */
PropertyAuctionSchema.methods.hasEnded = function (this: IPropertyAuction): boolean {
  return new Date() >= this.endTime;
};

/**
 * Instance method: Complete auction
 */
PropertyAuctionSchema.methods.completeAuction = function (this: IPropertyAuction): void {
  if (this.status === AuctionStatus.COMPLETED) {
    return;
  }

  if (!this.hasEnded()) {
    throw new Error('Auction has not ended yet');
  }

  if (this.currentBid > 0 && this.currentBidderId) {
    // Auction successful
    this.status = AuctionStatus.COMPLETED;
    this.winnerId = this.currentBidderId;
    this.winnerName = this.currentBidderName;
    this.finalPrice = this.currentBid;
    this.completedTime = new Date();

    // Calculate proceeds
    const { toOwner, toBank } = this.calculateProceeds();
    this.proceedsToOwner = toOwner;

    // Notify winner and losers
    this.notifyBidders('won');
  } else {
    // No bids - auction failed
    this.failAuction();
  }
};

/**
 * Instance method: Cancel auction (owner paid debt)
 */
PropertyAuctionSchema.methods.cancelAuction = function (
  this: IPropertyAuction,
  reason: string
): void {
  this.status = AuctionStatus.CANCELLED;
  this.completedTime = new Date();

  // Notify all bidders
  this.notifyBidders('lost');
};

/**
 * Instance method: Fail auction (no bids)
 */
PropertyAuctionSchema.methods.failAuction = function (this: IPropertyAuction): void {
  this.status = AuctionStatus.FAILED;
  this.completedTime = new Date();
  this.finalPrice = 0;
  this.proceedsToOwner = 0;

  // Property goes to bank/government
  // Will be handled by foreclosure service
};

/**
 * Instance method: Calculate proceeds distribution
 */
PropertyAuctionSchema.methods.calculateProceeds = function (this: IPropertyAuction): {
  toOwner: number;
  toBank: number;
} {
  if (!this.finalPrice) {
    return { toOwner: 0, toBank: 0 };
  }

  // Pay off debt first
  const remaining = this.finalPrice - this.debtOwed;

  if (remaining > 0) {
    // Owner gets remaining proceeds
    return {
      toOwner: remaining,
      toBank: this.debtOwed,
    };
  } else {
    // Debt not fully paid
    return {
      toOwner: 0,
      toBank: this.finalPrice,
    };
  }
};

/**
 * Instance method: Notify bidders of auction events
 */
PropertyAuctionSchema.methods.notifyBidders = function (
  this: IPropertyAuction,
  event: 'outbid' | 'won' | 'lost'
): void {
  // TODO: Create notifications via NotificationService
  // - 'outbid': Notify previous high bidder they were outbid
  // - 'won': Notify winner they won the auction
  // - 'lost': Notify all losing bidders
};

/**
 * Instance method: Convert to safe object
 */
PropertyAuctionSchema.methods.toSafeObject = function (
  this: IPropertyAuction
): Record<string, unknown> {
  return {
    id: this._id.toString(),
    propertyId: this.propertyId.toString(),
    propertyType: this.propertyType,
    propertyName: this.propertyName,
    originalOwnerId: this.originalOwnerId.toString(),
    originalOwnerName: this.originalOwnerName,
    ownerType: this.ownerType,
    propertyValue: this.propertyValue,
    propertyTier: this.propertyTier,
    location: this.location,
    minimumBid: this.minimumBid,
    currentBid: this.currentBid,
    currentBidderId: this.currentBidderId?.toString(),
    currentBidderName: this.currentBidderName,
    bidCount: this.bids.length,
    bids: this.bids.map((bid) => ({
      bidderName: bid.bidderName,
      bidAmount: bid.bidAmount,
      bidTime: bid.bidTime,
    })),
    status: this.status,
    startTime: this.startTime,
    endTime: this.endTime,
    completedTime: this.completedTime,
    winnerId: this.winnerId?.toString(),
    winnerName: this.winnerName,
    finalPrice: this.finalPrice,
    debtOwed: this.debtOwed,
    proceedsToOwner: this.proceedsToOwner,
    timeRemaining: this.hasEnded() ? 0 : this.endTime.getTime() - Date.now(),
    isActive: this.isActive(),
    minimumNextBid: this.getMinimumNextBid(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/**
 * Static method: Find auction by property ID
 */
PropertyAuctionSchema.statics.findByPropertyId = async function (
  propertyId: string | mongoose.Types.ObjectId
): Promise<IPropertyAuction | null> {
  const id = typeof propertyId === 'string' ? new mongoose.Types.ObjectId(propertyId) : propertyId;
  return this.findOne({ propertyId: id }).sort({ createdAt: -1 });
};

/**
 * Static method: Find auctions by owner ID
 */
PropertyAuctionSchema.statics.findByOwnerId = async function (
  ownerId: string | mongoose.Types.ObjectId
): Promise<IPropertyAuction[]> {
  const id = typeof ownerId === 'string' ? new mongoose.Types.ObjectId(ownerId) : ownerId;
  return this.find({ originalOwnerId: id }).sort({ createdAt: -1 });
};

/**
 * Static method: Find all active auctions
 */
PropertyAuctionSchema.statics.findActiveAuctions = async function (): Promise<IPropertyAuction[]> {
  const now = new Date();
  return this.find({
    status: AuctionStatus.ACTIVE,
    startTime: { $lte: now },
    endTime: { $gt: now },
  }).sort({ endTime: 1 });
};

/**
 * Static method: Find ended auctions needing completion
 */
PropertyAuctionSchema.statics.findEndedAuctions = async function (): Promise<IPropertyAuction[]> {
  const now = new Date();
  return this.find({
    status: AuctionStatus.ACTIVE,
    endTime: { $lte: now },
  }).sort({ endTime: 1 });
};

/**
 * Static method: Find auctions by status
 */
PropertyAuctionSchema.statics.findByStatus = async function (
  status: AuctionStatus
): Promise<IPropertyAuction[]> {
  return this.find({ status }).sort({ createdAt: -1 });
};

/**
 * Static method: Create a new auction
 */
PropertyAuctionSchema.statics.createAuction = async function (
  propertyId: mongoose.Types.ObjectId,
  propertyType: string,
  propertyName: string,
  ownerId: mongoose.Types.ObjectId,
  ownerType: 'gang' | 'character',
  ownerName: string,
  delinquencyId: mongoose.Types.ObjectId,
  propertyValue: number,
  propertyTier: number,
  location: string,
  debtOwed: number
): Promise<IPropertyAuction> {
  // Calculate minimum bid (50% of property value)
  const minimumBid = Math.floor(propertyValue * TAX_CONSTANTS.MINIMUM_BID_PERCENT);

  // Calculate start and end times
  const noticeTime = new Date();
  const startTime = new Date();
  startTime.setHours(startTime.getHours() + TAX_CONSTANTS.AUCTION_NOTICE_HOURS);

  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + TAX_CONSTANTS.AUCTION_DURATION_HOURS);

  const auction = new this({
    propertyId,
    propertyType,
    propertyName,
    originalOwnerId: ownerId,
    originalOwnerName: ownerName,
    ownerType,
    delinquencyId,
    propertyValue,
    propertyTier,
    location,
    minimumBid,
    currentBid: 0,
    bids: [],
    status: AuctionStatus.PENDING,
    startTime,
    endTime,
    noticePostedTime: noticeTime,
    debtOwed,
    proceedsToOwner: 0,
    reputationImpact: TAX_CONSTANTS.FORECLOSURE_REPUTATION_PENALTY,
  });

  await auction.save();
  return auction;
};

/**
 * Pre-save hook: Update status based on time
 */
PropertyAuctionSchema.pre('save', function (next) {
  const now = new Date();

  // Auto-update status from PENDING to ACTIVE when start time arrives
  if (this.status === AuctionStatus.PENDING && now >= this.startTime) {
    this.status = AuctionStatus.ACTIVE;
  }

  next();
});

/**
 * Property Auction model
 */
export const PropertyAuction = mongoose.model<IPropertyAuction, IPropertyAuctionModel>(
  'PropertyAuction',
  PropertyAuctionSchema
);
