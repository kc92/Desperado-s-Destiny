/**
 * PlaceBidModal Component
 * Quick bidding interface for marketplace listings
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button } from '@/components/ui';
import { MarketListing, ItemRarity } from '@/hooks/useMarketplace';
import { formatDollars } from '@/utils/format';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: MarketListing | null;
  currentGold: number;
  onPlaceBid: (listingId: string, amount: number) => Promise<{ success: boolean; message: string }>;
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
function getTimeRemaining(expiresAt: string): string {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

export const PlaceBidModal: React.FC<PlaceBidModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentGold,
  onPlaceBid,
  isProcessing = false,
}) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Calculate minimum bid
  const minimumBid = useMemo(() => {
    if (!listing) return 0;
    const currentBid = listing.currentBid || listing.startingPrice;
    // Minimum increment is 5% or 1 gold, whichever is higher
    const increment = Math.max(Math.ceil(currentBid * 0.05), 1);
    return currentBid + increment;
  }, [listing]);

  // Reset form when listing changes
  useEffect(() => {
    if (listing) {
      setBidAmount(minimumBid.toString());
      setError('');
    }
  }, [listing, minimumBid]);

  if (!listing) return null;

  const bidAmountNum = parseInt(bidAmount, 10) || 0;
  const canAfford = currentGold >= bidAmountNum;
  const isBidValid = bidAmountNum >= minimumBid;
  const currentBidDisplay = listing.currentBid || listing.startingPrice;
  const goldAfterBid = currentGold - bidAmountNum;

  // Quick bid amounts
  const quickBidAmounts = [
    { label: 'Min', amount: minimumBid },
    { label: '+10%', amount: Math.ceil(minimumBid * 1.1) },
    { label: '+25%', amount: Math.ceil(minimumBid * 1.25) },
    { label: '+50%', amount: Math.ceil(minimumBid * 1.5) },
  ];

  const handlePlaceBid = async () => {
    setError('');

    if (!isBidValid) {
      setError(`Bid must be at least ${formatDollars(minimumBid)}`);
      return;
    }

    if (!canAfford) {
      setError('Not enough gold');
      return;
    }

    const result = await onPlaceBid(listing._id, bidAmountNum);

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Place Bid" size="md">
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-blood-red/20 border border-blood-red/50 rounded-lg p-3">
            <p className="text-blood-red text-sm">{error}</p>
          </div>
        )}

        {/* Item Preview */}
        <div
          className={`flex items-center gap-4 p-4 rounded-lg border-2 bg-wood-darker ${rarityBorders[listing.item.rarity]}`}
        >
          <span className="text-5xl">{listing.item.icon}</span>
          <div className="flex-1">
            <h3 className={`font-western text-lg ${rarityColors[listing.item.rarity]}`}>
              {listing.item.name}
            </h3>
            <p className="text-xs text-desert-stone capitalize">
              {listing.item.rarity} - Seller: {listing.sellerName}
            </p>
            <p className="text-xs text-desert-stone mt-1">
              {getTimeRemaining(listing.expiresAt)}
            </p>
          </div>
        </div>

        {/* Current Bid Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-wood-darker/50 rounded-lg p-4 text-center">
            <p className="text-xs text-desert-stone mb-1">
              {listing.currentBid ? 'Current Bid' : 'Starting Price'}
            </p>
            <p className="text-2xl font-bold text-gold-light">
              {formatDollars(currentBidDisplay)}
            </p>
            {listing.currentBidderName && (
              <p className="text-xs text-desert-stone mt-1">
                by {listing.currentBidderName}
              </p>
            )}
          </div>
          <div className="bg-wood-darker/50 rounded-lg p-4 text-center">
            <p className="text-xs text-desert-stone mb-1">Minimum Bid</p>
            <p className="text-2xl font-bold text-emerald-400">
              {formatDollars(minimumBid)}
            </p>
            <p className="text-xs text-desert-stone mt-1">
              +{Math.ceil(currentBidDisplay * 0.05)} increment
            </p>
          </div>
        </div>

        {/* Quick Bid Buttons */}
        <div>
          <p className="text-sm text-desert-stone mb-2">Quick Bid:</p>
          <div className="grid grid-cols-4 gap-2">
            {quickBidAmounts.map(({ label, amount }) => (
              <button
                key={label}
                onClick={() => setBidAmount(amount.toString())}
                disabled={amount > currentGold}
                className={`
                  py-2 px-3 rounded-lg border transition-all text-sm font-semibold
                  ${bidAmountNum === amount
                    ? 'border-gold-light bg-gold-dark/30 text-gold-light'
                    : amount > currentGold
                      ? 'border-wood-grain/20 text-desert-stone/50 cursor-not-allowed'
                      : 'border-wood-grain/30 hover:border-gold-light/50 text-desert-sand'
                  }
                `}
              >
                {label}
                <span className="block text-xs">
                  {formatDollars(amount)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Bid Input */}
        <div>
          <label className="block text-sm font-semibold text-desert-sand mb-2">
            Your Bid
          </label>
          <div className="relative">
            <input
              type="number"
              min={minimumBid}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="input-western w-full pr-10 text-xl text-center"
              disabled={isProcessing}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-light font-bold">
              G
            </span>
          </div>

          {/* Validation Messages */}
          {!isBidValid && bidAmountNum > 0 && (
            <p className="text-xs text-blood-red mt-1">
              Bid must be at least {formatDollars(minimumBid)}
            </p>
          )}
          {!canAfford && bidAmountNum > 0 && (
            <p className="text-xs text-blood-red mt-1">
              You need {formatDollars(bidAmountNum - currentGold)} more gold
            </p>
          )}
        </div>

        {/* Gold Balance */}
        <div className="bg-wood-darker/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-desert-stone">Your Dollars:</span>
            <span className="text-lg font-western text-gold-light">
              {formatDollars(currentGold)}
            </span>
          </div>
          {canAfford && bidAmountNum > 0 && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-wood-grain/30">
              <span className="text-sm text-desert-stone">After Bid:</span>
              <span
                className={`text-lg font-western ${goldAfterBid >= 0 ? 'text-emerald-400' : 'text-blood-red'}`}
              >
                {formatDollars(goldAfterBid)}
              </span>
            </div>
          )}
        </div>

        {/* Important Note */}
        <p className="text-xs text-desert-stone italic text-center">
          Your gold will be held until the auction ends. If outbid, it will be returned.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-wood-grain/30">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handlePlaceBid}
            disabled={!isBidValid || !canAfford || isProcessing}
            isLoading={isProcessing}
            loadingText="Placing Bid..."
            className="flex-1"
          >
            Place Bid - {formatDollars(bidAmountNum)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PlaceBidModal;
