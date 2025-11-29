/**
 * MarketListingCard Component
 * Compact listing card for marketplace grid display
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MarketListing, ItemRarity } from '@/hooks/useMarketplace';
import { formatGold } from '@/utils/format';

interface MarketListingCardProps {
  listing: MarketListing;
  onSelect: (listing: MarketListing) => void;
  onBuyNow?: (listing: MarketListing) => void;
  onBid?: (listing: MarketListing) => void;
  currentCharacterId?: string;
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

const rarityGlow: Record<ItemRarity, string> = {
  common: '',
  uncommon: 'shadow-green-500/20',
  rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/40',
  legendary: 'shadow-orange-400/50 animate-pulse',
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
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isUrgent: boolean;
} {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, isUrgent: false };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const isUrgent = hours < 1;

  return { hours, minutes, seconds, isExpired: false, isUrgent };
}

/**
 * Format time remaining for display
 */
function formatTimeRemaining(time: ReturnType<typeof getTimeRemaining>): string {
  if (time.isExpired) return 'Expired';
  if (time.hours >= 24) {
    const days = Math.floor(time.hours / 24);
    return `${days}d ${time.hours % 24}h`;
  }
  if (time.hours > 0) {
    return `${time.hours}h ${time.minutes}m`;
  }
  return `${time.minutes}m ${time.seconds}s`;
}

export const MarketListingCard: React.FC<MarketListingCardProps> = ({
  listing,
  onSelect,
  onBuyNow,
  onBid,
  currentCharacterId,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(listing.expiresAt));

  // Update countdown every second for urgent listings, every minute otherwise
  useEffect(() => {
    const interval = setInterval(
      () => {
        const newTime = getTimeRemaining(listing.expiresAt);
        setTimeRemaining(newTime);
        if (newTime.isExpired) {
          clearInterval(interval);
        }
      },
      timeRemaining.isUrgent ? 1000 : 60000
    );

    return () => clearInterval(interval);
  }, [listing.expiresAt, timeRemaining.isUrgent]);

  const isOwnListing = currentCharacterId === listing.sellerId;
  const hasCurrentBid = listing.currentBid !== undefined && listing.currentBid > 0;
  const displayPrice = hasCurrentBid ? listing.currentBid : listing.startingPrice;
  const canBuyNow = listing.buyoutPrice && !isOwnListing && !timeRemaining.isExpired;
  const canBid =
    (listing.listingType === 'auction' || listing.listingType === 'both') &&
    !isOwnListing &&
    !timeRemaining.isExpired;

  // Memoize price display
  const priceDisplay = useMemo(() => formatGold(displayPrice || 0), [displayPrice]);
  const buyoutDisplay = useMemo(
    () => (listing.buyoutPrice ? formatGold(listing.buyoutPrice) : null),
    [listing.buyoutPrice]
  );

  return (
    <div
      className={`
        bg-wood-dark rounded-lg border-2 cursor-pointer transition-all duration-200
        hover:shadow-lg hover:scale-[1.02] group
        ${rarityBorders[listing.item.rarity]}
        ${rarityGlow[listing.item.rarity]}
        ${timeRemaining.isExpired ? 'opacity-60' : ''}
      `}
      onClick={() => onSelect(listing)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(listing);
        }
      }}
      aria-label={`${listing.item.name} - ${priceDisplay}`}
    >
      {/* Item Icon and Rarity Badge */}
      <div className="relative p-4 pb-2">
        {/* Rarity Badge */}
        <span
          className={`
            absolute top-2 left-2 px-2 py-0.5 text-xs font-bold uppercase rounded
            text-white ${rarityBadgeBg[listing.item.rarity]}
          `}
        >
          {listing.item.rarity}
        </span>

        {/* Listing Type Badge */}
        {listing.listingType === 'auction' && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold uppercase rounded bg-gold-dark text-wood-dark">
            Auction
          </span>
        )}
        {listing.listingType === 'buyout' && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold uppercase rounded bg-emerald-600 text-white">
            Buy Now
          </span>
        )}
        {listing.listingType === 'both' && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold uppercase rounded bg-gradient-to-r from-gold-dark to-emerald-600 text-white">
            Both
          </span>
        )}

        {/* Item Icon */}
        <div className="text-center pt-4">
          <span className="text-5xl group-hover:scale-110 transition-transform inline-block">
            {listing.item.icon}
          </span>
        </div>
      </div>

      {/* Item Info */}
      <div className="px-4 pb-2">
        <h3
          className={`font-western text-sm truncate ${rarityColors[listing.item.rarity]}`}
          title={listing.item.name}
        >
          {listing.item.name}
        </h3>
        {listing.item.quantity && listing.item.quantity > 1 && (
          <p className="text-xs text-desert-stone">x{listing.item.quantity}</p>
        )}
        <p className="text-xs text-desert-stone mt-1">
          Seller: <span className="text-desert-sand">{listing.sellerName}</span>
        </p>
      </div>

      {/* Price Section */}
      <div className="px-4 py-2 bg-wood-darker/50 border-t border-wood-grain/30">
        {/* Current Bid / Starting Price */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-desert-stone">
            {hasCurrentBid ? 'Current Bid' : 'Starting'}
          </span>
          <span className="font-bold text-gold-light">{priceDisplay}</span>
        </div>

        {/* Buyout Price */}
        {buyoutDisplay && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-desert-stone">Buy Now</span>
            <span className="font-semibold text-emerald-400">{buyoutDisplay}</span>
          </div>
        )}

        {/* Bid Count */}
        {canBid && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-desert-stone">Bids</span>
            <span className="text-sm text-desert-sand">{listing.bidCount}</span>
          </div>
        )}
      </div>

      {/* Time Remaining */}
      <div
        className={`
          px-4 py-2 text-center text-sm font-semibold
          ${timeRemaining.isExpired ? 'bg-blood-red/30 text-blood-red' : ''}
          ${timeRemaining.isUrgent && !timeRemaining.isExpired ? 'bg-gold-dark/30 text-gold-light animate-pulse' : ''}
          ${!timeRemaining.isUrgent && !timeRemaining.isExpired ? 'text-desert-stone' : ''}
        `}
      >
        <span className="mr-1" aria-hidden="true">
          {timeRemaining.isExpired ? '⏱️' : timeRemaining.isUrgent ? '🔥' : '⏰'}
        </span>
        {formatTimeRemaining(timeRemaining)}
      </div>

      {/* Action Buttons */}
      {!isOwnListing && !timeRemaining.isExpired && (
        <div className="px-4 py-3 flex gap-2 border-t border-wood-grain/30">
          {canBid && onBid && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBid(listing);
              }}
              className="flex-1 py-2 px-3 bg-gold-dark hover:bg-gold-medium text-wood-dark text-sm font-bold uppercase rounded transition-colors"
            >
              Place Bid
            </button>
          )}
          {canBuyNow && onBuyNow && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuyNow(listing);
              }}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase rounded transition-colors"
            >
              Buy Now
            </button>
          )}
        </div>
      )}

      {/* Own Listing Indicator */}
      {isOwnListing && (
        <div className="px-4 py-2 bg-leather-brown/30 text-center text-xs text-desert-sand border-t border-wood-grain/30">
          Your Listing
        </div>
      )}
    </div>
  );
};

export default MarketListingCard;
