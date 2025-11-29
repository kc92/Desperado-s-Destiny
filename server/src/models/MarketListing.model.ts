/**
 * Market Listing Model
 *
 * Mongoose schema for player marketplace listings (Frontier Exchange)
 * Supports both auction-style bidding and fixed-price buyout listings
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Item rarity levels
 */
export type MarketItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Listing types
 */
export type ListingType = 'auction' | 'buyout' | 'both';

/**
 * Listing status
 */
export type ListingStatus = 'active' | 'sold' | 'expired' | 'cancelled';

/**
 * Market item data stored in listing
 */
export interface MarketItemData {
  itemId: string;
  name: string;
  type: string;
  rarity: MarketItemRarity;
  quantity: number;
  stats?: Record<string, number>;
  durability?: number;
  description?: string;
  icon?: string;
}

/**
 * Bid history entry
 */
export interface BidEntry {
  bidderId: mongoose.Types.ObjectId;
  bidderName: string;
  amount: number;
  bidAt: Date;
}

/**
 * Market Listing document interface
 */
export interface IMarketListing extends Document {
  // Seller info
  sellerId: mongoose.Types.ObjectId;
  sellerName: string;

  // Item details
  item: MarketItemData;

  // Listing configuration
  listingType: ListingType;
  startingPrice: number;
  buyoutPrice?: number;

  // Current bid state
  currentBid?: number;
  currentBidderId?: mongoose.Types.ObjectId;
  currentBidderName?: string;
  bidHistory: BidEntry[];
  reservedBids: Map<string, number>; // Map of bidderId -> reserved amount

  // Categorization
  category: string;
  subcategory?: string;

  // Status tracking
  status: ListingStatus;
  listedAt: Date;
  expiresAt: Date;
  soldAt?: Date;
  soldTo?: mongoose.Types.ObjectId;
  soldToName?: string;
  finalPrice?: number;
  taxPaid?: number;

  // Features
  featured?: boolean;
  searchKeywords?: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Market Listing model static methods
 */
export interface IMarketListingModel extends Model<IMarketListing> {
  findActiveByCategory(category: string): Promise<IMarketListing[]>;
  findBySeller(sellerId: string): Promise<IMarketListing[]>;
  findActiveBidsByBidder(bidderId: string): Promise<IMarketListing[]>;
  findExpiredListings(): Promise<IMarketListing[]>;
  findEndedAuctions(): Promise<IMarketListing[]>;
}

/**
 * Market Listing schema definition
 */
const MarketListingSchema = new Schema<IMarketListing>(
  {
    // Seller info
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    sellerName: {
      type: String,
      required: true
    },

    // Item details (embedded document)
    item: {
      itemId: {
        type: String,
        required: true,
        index: true
      },
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      rarity: {
        type: String,
        required: true,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      stats: {
        type: Schema.Types.Mixed
      },
      durability: {
        type: Number
      },
      description: {
        type: String
      },
      icon: {
        type: String
      }
    },

    // Listing configuration
    listingType: {
      type: String,
      required: true,
      enum: ['auction', 'buyout', 'both'],
      default: 'buyout'
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 1
    },
    buyoutPrice: {
      type: Number,
      min: 1
    },

    // Current bid state
    currentBid: {
      type: Number,
      min: 0
    },
    currentBidderId: {
      type: Schema.Types.ObjectId,
      ref: 'Character'
    },
    currentBidderName: {
      type: String
    },
    bidHistory: [{
      bidderId: {
        type: Schema.Types.ObjectId,
        ref: 'Character',
        required: true
      },
      bidderName: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      bidAt: {
        type: Date,
        default: Date.now
      }
    }],
    reservedBids: {
      type: Map,
      of: Number,
      default: new Map()
    },

    // Categorization
    category: {
      type: String,
      required: true,
      index: true
    },
    subcategory: {
      type: String,
      index: true
    },

    // Status tracking
    status: {
      type: String,
      required: true,
      enum: ['active', 'sold', 'expired', 'cancelled'],
      default: 'active',
      index: true
    },
    listedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    soldAt: {
      type: Date
    },
    soldTo: {
      type: Schema.Types.ObjectId,
      ref: 'Character'
    },
    soldToName: {
      type: String
    },
    finalPrice: {
      type: Number
    },
    taxPaid: {
      type: Number
    },

    // Features
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    searchKeywords: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
// Compound indexes for common queries
MarketListingSchema.index({ status: 1, category: 1, listedAt: -1 });
MarketListingSchema.index({ status: 1, 'item.rarity': 1, listedAt: -1 });
MarketListingSchema.index({ status: 1, 'item.itemId': 1 });
MarketListingSchema.index({ status: 1, expiresAt: 1 });
MarketListingSchema.index({ status: 1, listingType: 1, expiresAt: 1 });
MarketListingSchema.index({ currentBidderId: 1, status: 1 });

// Text index for search
MarketListingSchema.index({
  'item.name': 'text',
  'item.description': 'text',
  sellerName: 'text',
  searchKeywords: 'text'
});

/**
 * Pre-save hook to generate search keywords
 */
MarketListingSchema.pre('save', function(next) {
  // Generate search keywords from item name
  if (this.item?.name) {
    const keywords = this.item.name.toLowerCase().split(/\s+/);
    this.searchKeywords = keywords;
  }
  next();
});

/**
 * Static: Find active listings by category
 */
MarketListingSchema.statics.findActiveByCategory = async function(
  category: string
): Promise<IMarketListing[]> {
  return this.find({
    status: 'active',
    category,
    expiresAt: { $gt: new Date() }
  }).sort({ listedAt: -1 });
};

/**
 * Static: Find all listings by seller
 */
MarketListingSchema.statics.findBySeller = async function(
  sellerId: string
): Promise<IMarketListing[]> {
  return this.find({
    sellerId: new mongoose.Types.ObjectId(sellerId)
  }).sort({ listedAt: -1 });
};

/**
 * Static: Find active bids by bidder
 */
MarketListingSchema.statics.findActiveBidsByBidder = async function(
  bidderId: string
): Promise<IMarketListing[]> {
  return this.find({
    status: 'active',
    currentBidderId: new mongoose.Types.ObjectId(bidderId),
    expiresAt: { $gt: new Date() }
  }).sort({ expiresAt: 1 });
};

/**
 * Static: Find expired listings that need processing
 */
MarketListingSchema.statics.findExpiredListings = async function(): Promise<IMarketListing[]> {
  return this.find({
    status: 'active',
    listingType: 'buyout',
    expiresAt: { $lte: new Date() }
  });
};

/**
 * Static: Find auctions that have ended and need resolution
 */
MarketListingSchema.statics.findEndedAuctions = async function(): Promise<IMarketListing[]> {
  return this.find({
    status: 'active',
    listingType: { $in: ['auction', 'both'] },
    expiresAt: { $lte: new Date() }
  });
};

/**
 * Market Listing model
 */
export const MarketListing = mongoose.model<IMarketListing, IMarketListingModel>(
  'MarketListing',
  MarketListingSchema
);
