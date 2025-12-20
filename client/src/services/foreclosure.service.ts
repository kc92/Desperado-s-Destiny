/**
 * Foreclosure Service
 * API client for property foreclosure, auctions, and bankruptcy operations
 */

import { apiCall } from './api';
import type {
  PropertyAuction,
  AuctionBid,
  AuctionStatus,
  TaxDelinquencyRecord,
  BankruptcyStatus,
} from '@shared/types/propertyTax.types';

// ===== Request Types =====

export interface PlaceBidRequest {
  bidderId: string;
  amount: number;
}

export interface CancelAuctionRequest {
  reason: string;
}

export interface DeclareBankruptcyRequest {
  declarerId: string;
}

export interface ResolveBankruptcyRequest {
  success: boolean;
  paidAmount?: number;
}

// ===== Response Types =====

export interface GetActiveAuctionsResponse {
  success: boolean;
  auctions: PropertyAuction[];
  message?: string;
}

export interface GetAuctionResponse {
  success: boolean;
  auction: PropertyAuction;
  delinquency: TaxDelinquencyRecord;
  canBid: boolean;
  minimumNextBid: number;
  message?: string;
}

export interface PlaceBidResponse {
  success: boolean;
  auction: PropertyAuction;
  bid: AuctionBid;
  previousBidderId?: string;
  characterGold: number;
  message: string;
}

export interface CancelAuctionResponse {
  success: boolean;
  auction: PropertyAuction;
  debtPaid: number;
  characterGold: number;
  message: string;
}

export interface CreateAuctionResponse {
  success: boolean;
  auction: PropertyAuction;
  delinquency: TaxDelinquencyRecord;
  noticeEndTime: Date;
  auctionStartTime: Date;
  message: string;
}

export interface DeclareBankruptcyResponse {
  success: boolean;
  delinquency: TaxDelinquencyRecord;
  bankruptcyEndsDate: Date;
  freezePeriodDays: number;
  reputationPenalty: number;
  message: string;
}

export interface ResolveBankruptcyResponse {
  success: boolean;
  delinquency: TaxDelinquencyRecord;
  outcome: 'resolved' | 'failed';
  amountPaid?: number;
  propertyRetained: boolean;
  forcedSaleAmount?: number;
  reputationChange: number;
  message: string;
}

export interface ProcessEndedAuctionsResponse {
  success: boolean;
  processed: number;
  completed: Array<{
    auctionId: string;
    propertyId: string;
    winnerId?: string;
    winnerName?: string;
    finalPrice?: number;
    outcome: 'sold' | 'failed';
  }>;
  message: string;
}

export interface ProcessBankruptciesResponse {
  success: boolean;
  processed: number;
  results: Array<{
    delinquencyId: string;
    propertyId: string;
    ownerId: string;
    outcome: 'resolved' | 'forced_sale';
    forcedSaleAmount?: number;
  }>;
  message: string;
}

// ===== Foreclosure Service =====

/**
 * Get all active property auctions
 */
export async function getActiveAuctions(): Promise<GetActiveAuctionsResponse> {
  return apiCall<GetActiveAuctionsResponse>('get', '/foreclosure/auctions');
}

/**
 * Get specific auction details
 */
export async function getAuction(auctionId: string): Promise<GetAuctionResponse> {
  return apiCall<GetAuctionResponse>('get', `/foreclosure/auctions/${auctionId}`);
}

/**
 * Place a bid on an auction
 */
export async function placeBid(
  auctionId: string,
  request: PlaceBidRequest
): Promise<PlaceBidResponse> {
  return apiCall<PlaceBidResponse>('post', `/foreclosure/auctions/${auctionId}/bid`, request);
}

/**
 * Cancel an auction (owner pays debt)
 */
export async function cancelAuction(
  auctionId: string,
  request: CancelAuctionRequest
): Promise<CancelAuctionResponse> {
  return apiCall<CancelAuctionResponse>('post', `/foreclosure/auctions/${auctionId}/cancel`, request);
}

/**
 * Create an auction for a delinquent property
 */
export async function createAuction(delinquencyId: string): Promise<CreateAuctionResponse> {
  return apiCall<CreateAuctionResponse>('post', `/foreclosure/delinquency/${delinquencyId}/auction`);
}

/**
 * Declare bankruptcy for a delinquent property
 */
export async function declareBankruptcy(
  delinquencyId: string,
  request: DeclareBankruptcyRequest
): Promise<DeclareBankruptcyResponse> {
  return apiCall<DeclareBankruptcyResponse>(
    'post',
    `/foreclosure/delinquency/${delinquencyId}/bankruptcy`,
    request
  );
}

/**
 * Resolve bankruptcy (success or failure)
 */
export async function resolveBankruptcy(
  delinquencyId: string,
  request: ResolveBankruptcyRequest
): Promise<ResolveBankruptcyResponse> {
  return apiCall<ResolveBankruptcyResponse>(
    'post',
    `/foreclosure/delinquency/${delinquencyId}/resolve-bankruptcy`,
    request
  );
}

/**
 * Process all ended auctions (Admin/System)
 */
export async function processEndedAuctions(): Promise<ProcessEndedAuctionsResponse> {
  return apiCall<ProcessEndedAuctionsResponse>('post', '/foreclosure/process-ended-auctions');
}

/**
 * Process expired bankruptcies (Admin/System)
 */
export async function processBankruptcyExpirations(): Promise<ProcessBankruptciesResponse> {
  return apiCall<ProcessBankruptciesResponse>('post', '/foreclosure/process-bankruptcies');
}

// ===== Service Object =====

export const foreclosureService = {
  getActiveAuctions,
  getAuction,
  placeBid,
  cancelAuction,
  createAuction,
  declareBankruptcy,
  resolveBankruptcy,
  processEndedAuctions,
  processBankruptcyExpirations,

  // ===== Convenience Methods =====

  /**
   * Filter auctions by status
   */
  filterByStatus(auctions: PropertyAuction[], status: AuctionStatus): PropertyAuction[] {
    return auctions.filter(auction => auction.status === status);
  },

  /**
   * Filter auctions by property type
   */
  filterByPropertyType(
    auctions: PropertyAuction[],
    propertyType: 'gang_base' | 'business' | 'ranch' | 'mine' | 'other'
  ): PropertyAuction[] {
    return auctions.filter(auction => auction.propertyType === propertyType);
  },

  /**
   * Sort auctions by end time (soonest first)
   */
  sortByEndTime(auctions: PropertyAuction[]): PropertyAuction[] {
    return [...auctions].sort(
      (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
    );
  },

  /**
   * Sort auctions by current bid (highest first)
   */
  sortByCurrentBid(auctions: PropertyAuction[], descending: boolean = true): PropertyAuction[] {
    return [...auctions].sort((a, b) =>
      descending ? b.currentBid - a.currentBid : a.currentBid - b.currentBid
    );
  },

  /**
   * Calculate time remaining in auction
   */
  getTimeRemaining(auction: PropertyAuction): number {
    const now = Date.now();
    const end = new Date(auction.endTime).getTime();
    return Math.max(0, end - now);
  },

  /**
   * Check if auction is ending soon (less than 1 hour)
   */
  isEndingSoon(auction: PropertyAuction): boolean {
    const remaining = this.getTimeRemaining(auction);
    const oneHour = 60 * 60 * 1000;
    return remaining > 0 && remaining <= oneHour;
  },

  /**
   * Check if auction has ended
   */
  hasEnded(auction: PropertyAuction): boolean {
    return this.getTimeRemaining(auction) === 0;
  },

  /**
   * Calculate minimum next bid amount
   */
  calculateMinimumNextBid(auction: PropertyAuction, bidIncrementPercent: number = 0.05): number {
    const currentBid = auction.currentBid || auction.minimumBid;
    return Math.ceil(currentBid * (1 + bidIncrementPercent));
  },

  /**
   * Get auction status display text
   */
  getAuctionStatusText(status: AuctionStatus): string {
    const statusText: Record<AuctionStatus, string> = {
      [AuctionStatus.PENDING]: 'Pending',
      [AuctionStatus.ACTIVE]: 'Active',
      [AuctionStatus.COMPLETED]: 'Completed',
      [AuctionStatus.CANCELLED]: 'Cancelled',
      [AuctionStatus.FAILED]: 'Failed',
    };
    return statusText[status] || 'Unknown';
  },

  /**
   * Get bankruptcy status display text
   */
  getBankruptcyStatusText(status: BankruptcyStatus): string {
    const statusText: Record<BankruptcyStatus, string> = {
      [BankruptcyStatus.NONE]: 'None',
      [BankruptcyStatus.ACTIVE]: 'Active',
      [BankruptcyStatus.RESOLVED]: 'Resolved',
      [BankruptcyStatus.FAILED]: 'Failed',
    };
    return statusText[status] || 'Unknown';
  },

  /**
   * Calculate potential profit from auction
   */
  calculatePotentialProfit(auction: PropertyAuction): number {
    // Final price minus debt owed = proceeds to original owner
    if (auction.finalPrice) {
      return Math.max(0, auction.finalPrice - auction.debtOwed);
    }
    // Estimate based on current bid
    const currentBid = auction.currentBid || auction.minimumBid;
    return Math.max(0, currentBid - auction.debtOwed);
  },

  /**
   * Calculate property discount percentage
   */
  calculateDiscountPercentage(auction: PropertyAuction): number {
    const currentBid = auction.currentBid || auction.minimumBid;
    const discount = ((auction.propertyValue - currentBid) / auction.propertyValue) * 100;
    return Math.max(0, Math.round(discount));
  },

  /**
   * Check if user is current highest bidder
   */
  isCurrentBidder(auction: PropertyAuction, userId: string): boolean {
    return auction.currentBidderId === userId;
  },

  /**
   * Check if user has bid on auction
   */
  hasBidOnAuction(auction: PropertyAuction, userId: string): boolean {
    return auction.bids.some(bid => bid.bidderId === userId);
  },

  /**
   * Get user's highest bid on auction
   */
  getUserHighestBid(auction: PropertyAuction, userId: string): number {
    const userBids = auction.bids.filter(bid => bid.bidderId === userId);
    if (userBids.length === 0) return 0;
    return Math.max(...userBids.map(bid => bid.bidAmount));
  },

  /**
   * Format time remaining as human-readable string
   */
  formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) return 'Ended';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },

  /**
   * Check if can afford bid
   */
  canAffordBid(characterGold: number, bidAmount: number): boolean {
    return characterGold >= bidAmount;
  },

  /**
   * Validate bid amount
   */
  isValidBidAmount(
    auction: PropertyAuction,
    bidAmount: number,
    bidIncrementPercent: number = 0.05
  ): { valid: boolean; message: string } {
    // Check minimum bid
    if (bidAmount < auction.minimumBid) {
      return {
        valid: false,
        message: `Bid must be at least ${auction.minimumBid} gold (minimum bid)`,
      };
    }

    // Check bid increment
    const minimumNextBid = this.calculateMinimumNextBid(auction, bidIncrementPercent);
    if (auction.currentBid > 0 && bidAmount < minimumNextBid) {
      return {
        valid: false,
        message: `Bid must be at least ${minimumNextBid} gold (5% more than current bid)`,
      };
    }

    return { valid: true, message: 'Valid bid' };
  },

  /**
   * Get auction property type display name
   */
  getPropertyTypeDisplayName(
    propertyType: 'gang_base' | 'business' | 'ranch' | 'mine' | 'other'
  ): string {
    const typeNames: Record<string, string> = {
      gang_base: 'Gang Base',
      business: 'Business',
      ranch: 'Ranch',
      mine: 'Mine',
      other: 'Property',
    };
    return typeNames[propertyType] || 'Property';
  },

  /**
   * Calculate bankruptcy freeze period remaining
   */
  getBankruptcyTimeRemaining(delinquency: TaxDelinquencyRecord): number {
    if (!delinquency.bankruptcyEndsDate) return 0;
    const now = Date.now();
    const end = new Date(delinquency.bankruptcyEndsDate).getTime();
    return Math.max(0, end - now);
  },

  /**
   * Check if bankruptcy protection is active
   */
  isBankruptcyActive(delinquency: TaxDelinquencyRecord): boolean {
    return (
      delinquency.bankruptcyStatus === BankruptcyStatus.ACTIVE &&
      this.getBankruptcyTimeRemaining(delinquency) > 0
    );
  },
};

export default foreclosureService;
