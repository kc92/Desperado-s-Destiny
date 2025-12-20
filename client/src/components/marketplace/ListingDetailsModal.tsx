/**
 * ListingDetailsModal Component
 * Full listing information modal with bid history and price chart
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Card } from '@/components/ui';
import { PriceChart } from './PriceChart';
import {
  MarketListing,
  PriceHistory,
  ItemRarity,
  Bid,
} from '@/hooks/useMarketplace';
import { formatDollars, formatTimeAgo } from '@/utils/format';

interface ListingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: MarketListing | null;
  priceHistory: PriceHistory | null;
  onPlaceBid: (listing: MarketListing, amount: number) => void;
  onBuyNow: (listing: MarketListing) => void;
  currentCharacterId?: string;
  currentGold?: number;
  isProcessing?: boolean;
}

// Rarity color mappings
const rarityColors: Record<ItemRarity, string> = {
  common: 'text-gray-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-orange-400',
};

const rarityBadgeBg: Record<ItemRarity, string> = {
  common: 'bg-gray-600',
  uncommon: 'bg-green-600',
  rare: 'bg-blue-600',
  epic: 'bg-purple-600',
  legendary: 'bg-gradient-to-r from-orange-500 to-yellow-500',
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
    return { display: 'Expired', isExpired: true, isUrgent: false };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const isUrgent = hours < 1;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return { display: `${days}d ${hours % 24}h remaining`, isExpired: false, isUrgent };
  }
  if (hours > 0) {
    return { display: `${hours}h ${minutes}m remaining`, isExpired: false, isUrgent };
  }
  return { display: `${minutes}m ${seconds}s remaining`, isExpired: false, isUrgent };
}

export const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  isOpen,
  onClose,
  listing,
  priceHistory,
  onPlaceBid,
  onBuyNow,
  currentCharacterId,
  currentGold = 0,
  isProcessing = false,
}) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'bids' | 'history'>('details');
  const [timeRemaining, setTimeRemaining] = useState(() =>
    listing ? getTimeRemaining(listing.expiresAt) : { display: '', isExpired: false, isUrgent: false }
  );

  // Update time remaining
  useEffect(() => {
    if (!listing) return;

    const updateTime = () => {
      setTimeRemaining(getTimeRemaining(listing.expiresAt));
    };

    updateTime();
    const interval = setInterval(updateTime, timeRemaining.isUrgent ? 1000 : 60000);

    return () => clearInterval(interval);
  }, [listing, timeRemaining.isUrgent]);

  // Calculate minimum bid
  const minimumBid = useMemo(() => {
    if (!listing) return 0;
    const currentBid = listing.currentBid || listing.startingPrice;
    // Minimum increment is 5% or 1 gold, whichever is higher
    const increment = Math.max(Math.ceil(currentBid * 0.05), 1);
    return currentBid + increment;
  }, [listing]);

  // Reset bid amount when listing changes
  useEffect(() => {
    setBidAmount(minimumBid.toString());
  }, [minimumBid]);

  if (!listing) return null;

  const isOwnListing = currentCharacterId === listing.sellerId;
  const hasCurrentBid = listing.currentBid !== undefined && listing.currentBid > 0;
  const canBuyNow =
    listing.buyoutPrice && !isOwnListing && !timeRemaining.isExpired;
  const canBid =
    (listing.listingType === 'auction' || listing.listingType === 'both') &&
    !isOwnListing &&
    !timeRemaining.isExpired;

  const bidAmountNum = parseInt(bidAmount, 10) || 0;
  const canAffordBid = currentGold >= bidAmountNum;
  const canAffordBuyout = listing.buyoutPrice ? currentGold >= listing.buyoutPrice : false;
  const isBidValid = bidAmountNum >= minimumBid;

  const handlePlaceBid = () => {
    if (canBid && isBidValid && canAffordBid) {
      onPlaceBid(listing, bidAmountNum);
    }
  };

  const handleBuyNow = () => {
    if (canBuyNow && canAffordBuyout) {
      onBuyNow(listing);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={listing.item.name} size="xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex gap-6">
          {/* Item Display */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-wood-darker rounded-lg flex items-center justify-center border-2 border-wood-grain/30">
              <span className="text-7xl">{listing.item.icon}</span>
            </div>
            <div className="mt-2 text-center">
              <span
                className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded text-white ${rarityBadgeBg[listing.item.rarity]}`}
              >
                {listing.item.rarity}
              </span>
            </div>
          </div>

          {/* Item Info */}
          <div className="flex-1 space-y-3">
            <h3 className={`text-2xl font-western ${rarityColors[listing.item.rarity]}`}>
              {listing.item.name}
            </h3>
            {listing.item.quantity && listing.item.quantity > 1 && (
              <p className="text-desert-stone">Quantity: x{listing.item.quantity}</p>
            )}
            <p className="text-desert-sand font-serif italic">
              "{listing.item.description}"
            </p>

            {/* Item Effects */}
            {listing.item.effects.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm text-desert-stone">Effects:</h4>
                {listing.item.effects.map((effect, i) => (
                  <p key={i} className="text-sm text-gold-light">
                    + {effect.description}
                  </p>
                ))}
              </div>
            )}

            {/* Seller Info */}
            <p className="text-sm text-desert-stone">
              Seller:{' '}
              <span className="text-desert-sand font-semibold">{listing.sellerName}</span>
            </p>

            {/* Time Remaining */}
            <p
              className={`text-sm font-semibold ${
                timeRemaining.isExpired
                  ? 'text-blood-red'
                  : timeRemaining.isUrgent
                    ? 'text-gold-light'
                    : 'text-desert-stone'
              }`}
            >
              {timeRemaining.isUrgent && !timeRemaining.isExpired && (
                <span className="mr-1">🔥</span>
              )}
              {timeRemaining.display}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-wood-grain/30">
          {(['details', 'bids', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 text-sm font-semibold uppercase transition-colors
                ${activeTab === tab
                  ? 'text-gold-light border-b-2 border-gold-light'
                  : 'text-desert-stone hover:text-desert-sand'
                }
              `}
            >
              {tab === 'details' && 'Details'}
              {tab === 'bids' && `Bids (${listing.bidCount})`}
              {tab === 'history' && 'Price History'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Price Information */}
              <Card variant="wood" padding="md">
                <h4 className="text-sm font-western text-desert-sand mb-3">
                  Price Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Current/Starting Bid */}
                  <div>
                    <p className="text-xs text-desert-stone">
                      {hasCurrentBid ? 'Current Bid' : 'Starting Price'}
                    </p>
                    <p className="text-xl font-bold text-gold-light">
                      {formatDollars(listing.currentBid || listing.startingPrice)}
                    </p>
                  </div>

                  {/* Buyout Price */}
                  {listing.buyoutPrice && (
                    <div>
                      <p className="text-xs text-desert-stone">Buy Now Price</p>
                      <p className="text-xl font-bold text-emerald-400">
                        {formatDollars(listing.buyoutPrice)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Current Bidder */}
                {listing.currentBidderName && (
                  <p className="text-sm text-desert-stone mt-3">
                    Highest Bidder:{' '}
                    <span className="text-gold-light font-semibold">
                      {listing.currentBidderName}
                    </span>
                  </p>
                )}
              </Card>

              {/* Item Stats */}
              {listing.item.levelRequired > 1 && (
                <Card variant="wood" padding="md">
                  <h4 className="text-sm font-western text-desert-sand mb-2">
                    Requirements
                  </h4>
                  <p className="text-sm text-desert-stone">
                    Level Required:{' '}
                    <span className="text-desert-sand">{listing.item.levelRequired}</span>
                  </p>
                  {listing.item.equipSlot && (
                    <p className="text-sm text-desert-stone">
                      Equip Slot:{' '}
                      <span className="text-desert-sand capitalize">{listing.item.equipSlot}</span>
                    </p>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Bids Tab */}
          {activeTab === 'bids' && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {listing.bidHistory.length === 0 ? (
                <p className="text-center text-desert-stone py-8">
                  No bids yet. Be the first to bid!
                </p>
              ) : (
                listing.bidHistory
                  .sort((a: Bid, b: Bid) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((bid: Bid, index: number) => (
                    <div
                      key={index}
                      className={`
                        flex justify-between items-center p-3 rounded-lg
                        ${index === 0 ? 'bg-gold-dark/20 border border-gold-dark/50' : 'bg-wood-darker/50'}
                      `}
                    >
                      <div>
                        <p className="text-sm font-semibold text-desert-sand">
                          {bid.bidderName}
                          {index === 0 && (
                            <span className="ml-2 text-xs text-gold-light">Highest</span>
                          )}
                        </p>
                        <p className="text-xs text-desert-stone">
                          {formatTimeAgo(new Date(bid.timestamp))}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-gold-light">
                        {formatDollars(bid.amount)}
                      </p>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Price History Tab */}
          {activeTab === 'history' && (
            <div>
              {priceHistory ? (
                <div className="space-y-4">
                  {/* Stats Summary */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-desert-stone">Average</p>
                      <p className="text-lg font-bold text-gold-light">
                        {formatDollars(priceHistory.averagePrice)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-desert-stone">Lowest</p>
                      <p className="text-lg font-bold text-green-400">
                        {formatDollars(priceHistory.lowestPrice)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-desert-stone">Highest</p>
                      <p className="text-lg font-bold text-blood-red">
                        {formatDollars(priceHistory.highestPrice)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-desert-stone">Total Sold</p>
                      <p className="text-lg font-bold text-desert-sand">
                        {priceHistory.totalSold}
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-[200px]">
                    <PriceChart priceHistory={priceHistory} />
                  </div>
                </div>
              ) : (
                <p className="text-center text-desert-stone py-8">
                  No price history available for this item.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Section */}
        {!isOwnListing && !timeRemaining.isExpired && (
          <div className="border-t border-wood-grain/30 pt-4 space-y-4">
            {/* Your Dollars */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-desert-stone">Your Dollars:</span>
              <span className="text-lg font-western text-gold-light">
                {formatDollars(currentGold)}
              </span>
            </div>

            {/* Bid Section */}
            {canBid && (
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-desert-stone mb-1">
                    Your Bid (min: {formatDollars(minimumBid)})
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={minimumBid}
                    className="input-western w-full"
                    disabled={isProcessing}
                  />
                  {!isBidValid && bidAmountNum > 0 && (
                    <p className="text-xs text-blood-red mt-1">
                      Bid must be at least {formatDollars(minimumBid)}
                    </p>
                  )}
                  {!canAffordBid && bidAmountNum > 0 && (
                    <p className="text-xs text-blood-red mt-1">
                      Not enough gold
                    </p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  onClick={handlePlaceBid}
                  disabled={!isBidValid || !canAffordBid || isProcessing}
                  isLoading={isProcessing}
                  loadingText="Bidding..."
                >
                  Place Bid
                </Button>
              </div>
            )}

            {/* Buy Now Button */}
            {canBuyNow && (
              <Button
                variant="primary"
                fullWidth
                onClick={handleBuyNow}
                disabled={!canAffordBuyout || isProcessing}
                isLoading={isProcessing}
                loadingText="Processing..."
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-700"
              >
                Buy Now for {formatDollars(listing.buyoutPrice!)}
              </Button>
            )}

            {/* Cannot Afford Warning */}
            {canBuyNow && !canAffordBuyout && (
              <p className="text-center text-sm text-blood-red">
                You need {formatDollars(listing.buyoutPrice! - currentGold)} more gold
              </p>
            )}
          </div>
        )}

        {/* Own Listing Message */}
        {isOwnListing && (
          <div className="text-center py-4 bg-leather-brown/20 rounded-lg">
            <p className="text-desert-sand">This is your listing</p>
          </div>
        )}

        {/* Expired Message */}
        {timeRemaining.isExpired && (
          <div className="text-center py-4 bg-blood-red/20 rounded-lg">
            <p className="text-blood-red">This listing has expired</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ListingDetailsModal;
