/**
 * MyBids Component
 * Track active bids on marketplace listings
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { MarketListing, ItemRarity } from '@/hooks/useMarketplace';
import { formatDollars } from '@/utils/format';

interface MyBidsProps {
  listings: MarketListing[];
  currentCharacterId?: string;
  onViewListing: (listing: MarketListing) => void;
  onPlaceBid: (listing: MarketListing) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

// Rarity color mappings
const rarityColors: Record<ItemRarity, string> = {
  common: 'text-gray-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-orange-400',
};

const rarityBorders: Record<ItemRarity, string> = {
  common: 'border-gray-500',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-orange-400',
};

/**
 * Calculate time remaining from expiration date
 */
function getTimeRemaining(expiresAt: string): {
  display: string;
  isExpired: boolean;
  isUrgent: boolean;
} {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return { display: 'Ended', isExpired: true, isUrgent: false };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const isUrgent = hours < 1;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return { display: `${days}d ${hours % 24}h`, isExpired: false, isUrgent };
  }
  if (hours > 0) {
    return { display: `${hours}h ${minutes}m`, isExpired: false, isUrgent };
  }
  return { display: `${minutes}m ${seconds}s`, isExpired: false, isUrgent };
}

/**
 * Get bid status for current user
 */
function getBidStatus(
  listing: MarketListing,
  currentCharacterId?: string
): 'winning' | 'outbid' | 'ended_won' | 'ended_lost' | 'unknown' {
  if (!currentCharacterId) return 'unknown';

  const isHighestBidder = listing.currentBidderId === currentCharacterId;
  const isExpired = new Date(listing.expiresAt).getTime() < Date.now();

  if (isExpired) {
    return isHighestBidder ? 'ended_won' : 'ended_lost';
  }

  return isHighestBidder ? 'winning' : 'outbid';
}

/**
 * Status badge component
 */
const BidStatusBadge: React.FC<{ status: ReturnType<typeof getBidStatus> }> = ({ status }) => {
  const styles = {
    winning: 'bg-emerald-600/30 text-emerald-400 border-emerald-500',
    outbid: 'bg-blood-red/30 text-blood-red border-blood-red animate-pulse',
    ended_won: 'bg-gold-dark/30 text-gold-light border-gold-dark',
    ended_lost: 'bg-desert-stone/30 text-desert-stone border-desert-stone',
    unknown: 'bg-wood-dark/30 text-desert-stone border-wood-grain',
  };

  const labels = {
    winning: 'Winning',
    outbid: 'Outbid!',
    ended_won: 'Won',
    ended_lost: 'Lost',
    unknown: 'Unknown',
  };

  return (
    <span className={`px-3 py-1 text-sm font-bold rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export const MyBids: React.FC<MyBidsProps> = ({
  listings,
  currentCharacterId,
  onViewListing,
  onPlaceBid,
  onRefresh,
  isLoading = false,
}) => {
  const [timeRemainings, setTimeRemainings] = useState<Record<string, ReturnType<typeof getTimeRemaining>>>({});

  // Update time remaining every second for urgent listings
  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, ReturnType<typeof getTimeRemaining>> = {};
      listings.forEach((listing) => {
        newTimes[listing._id] = getTimeRemaining(listing.expiresAt);
      });
      setTimeRemainings(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [listings]);

  // Separate active and ended bids
  const activeBids = listings.filter((l) => {
    const time = timeRemainings[l._id];
    return time && !time.isExpired;
  });

  const endedBids = listings.filter((l) => {
    const time = timeRemainings[l._id];
    return time && time.isExpired;
  });

  // Sort: outbid first, then by time remaining
  const sortedActiveBids = [...activeBids].sort((a, b) => {
    const statusA = getBidStatus(a, currentCharacterId);
    const statusB = getBidStatus(b, currentCharacterId);

    // Outbid items first
    if (statusA === 'outbid' && statusB !== 'outbid') return -1;
    if (statusA !== 'outbid' && statusB === 'outbid') return 1;

    // Then by time remaining
    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
  });

  // Show loading skeleton while fetching data
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-western text-gold-light mb-4">My Bids</h3>
        <CardGridSkeleton count={6} columns={2} />
      </div>
    );
  }

  // Show empty state if no bids
  if (listings.length === 0) {
    return (
      <EmptyState
        icon="🎯"
        title="No Active Bids"
        description="You haven't placed any bids yet. Browse the marketplace to find items to bid on!"
        variant="default"
        size="lg"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Outbid Warning */}
      {sortedActiveBids.some((l) => getBidStatus(l, currentCharacterId) === 'outbid') && (
        <Card variant="leather" padding="md" className="border-blood-red/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div className="flex-1">
              <p className="font-western text-blood-red">You've been outbid!</p>
              <p className="text-sm text-desert-stone">
                Place a higher bid to stay in the running.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Active Bids */}
      {sortedActiveBids.length > 0 && (
        <div>
          <h3 className="text-lg font-western text-gold-light mb-4">
            Active Bids ({sortedActiveBids.length})
          </h3>

          <div className="space-y-3">
            {sortedActiveBids.map((listing) => {
              const timeRemaining = timeRemainings[listing._id] || getTimeRemaining(listing.expiresAt);
              const bidStatus = getBidStatus(listing, currentCharacterId);

              // Find user's bid in history
              const userBid = listing.bidHistory.find(
                (bid) => bid.bidderId === currentCharacterId
              );

              return (
                <Card
                  key={listing._id}
                  variant="wood"
                  padding="none"
                  className={`
                    overflow-hidden border-l-4
                    ${bidStatus === 'winning' ? 'border-l-emerald-500' : ''}
                    ${bidStatus === 'outbid' ? 'border-l-blood-red' : ''}
                  `}
                >
                  <div className="flex items-center p-4 gap-4">
                    {/* Item Icon */}
                    <div
                      className={`
                        w-16 h-16 flex items-center justify-center rounded-lg border-2 bg-wood-darker
                        ${rarityBorders[listing.item.rarity]}
                      `}
                    >
                      <span className="text-3xl">{listing.item.icon}</span>
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-western truncate ${rarityColors[listing.item.rarity]}`}
                        >
                          {listing.item.name}
                        </h4>
                        <BidStatusBadge status={bidStatus} />
                      </div>

                      <div className="flex gap-6 text-sm">
                        {/* Your Bid */}
                        <div>
                          <span className="text-desert-stone">Your Bid: </span>
                          <span className="font-bold text-desert-sand">
                            {userBid ? formatDollars(userBid.amount) : 'N/A'}
                          </span>
                        </div>

                        {/* Current Bid */}
                        <div>
                          <span className="text-desert-stone">Current: </span>
                          <span
                            className={`font-bold ${
                              bidStatus === 'winning' ? 'text-emerald-400' : 'text-gold-light'
                            }`}
                          >
                            {formatDollars(listing.currentBid || listing.startingPrice)}
                          </span>
                        </div>

                        {/* Bid Count */}
                        <div>
                          <span className="text-desert-stone">Bids: </span>
                          <span className="text-desert-sand">{listing.bidCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Time & Actions */}
                    <div className="text-right flex flex-col items-end gap-2">
                      {/* Time Remaining */}
                      <div
                        className={`
                          text-sm font-semibold
                          ${timeRemaining.isUrgent ? 'text-gold-light animate-pulse' : 'text-desert-stone'}
                        `}
                      >
                        {timeRemaining.isUrgent && '🔥 '}
                        {timeRemaining.display}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewListing(listing)}
                        >
                          View
                        </Button>
                        {bidStatus === 'outbid' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onPlaceBid(listing)}
                            className="bg-gold-dark hover:bg-gold-medium"
                          >
                            Raise Bid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buyout Option */}
                  {listing.buyoutPrice && bidStatus === 'outbid' && (
                    <div className="px-4 py-2 bg-wood-darker/50 border-t border-wood-grain/30 flex items-center justify-between">
                      <span className="text-sm text-desert-stone">
                        Buy now for {formatDollars(listing.buyoutPrice)} and win instantly
                      </span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onViewListing(listing)}
                        className="bg-emerald-600 hover:bg-emerald-500 border-emerald-700"
                      >
                        Buy Now
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Ended Bids */}
      {endedBids.length > 0 && (
        <div>
          <h3 className="text-lg font-western text-desert-sand mb-4">
            Ended Auctions ({endedBids.length})
          </h3>

          <div className="space-y-2">
            {endedBids.slice(0, 10).map((listing) => {
              const bidStatus = getBidStatus(listing, currentCharacterId);
              const userBid = listing.bidHistory.find(
                (bid) => bid.bidderId === currentCharacterId
              );

              return (
                <Card
                  key={listing._id}
                  variant="wood"
                  padding="sm"
                  className="flex items-center gap-4 opacity-75"
                >
                  <span className="text-2xl">{listing.item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${rarityColors[listing.item.rarity]}`}>
                      {listing.item.name}
                    </p>
                    <p className="text-xs text-desert-stone">
                      Your bid: {userBid ? formatDollars(userBid.amount) : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <BidStatusBadge status={bidStatus} />
                    {bidStatus === 'ended_won' && (
                      <p className="text-xs text-emerald-400 mt-1">
                        Final: {formatDollars(listing.currentBid || 0)}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={onRefresh}
          disabled={isLoading}
          isLoading={isLoading}
          loadingText="Refreshing..."
        >
          Refresh Bids
        </Button>
      </div>
    </div>
  );
};

export default MyBids;
