/**
 * MyListings Component
 * Manage own marketplace listings
 */

import React, { useState, useEffect } from 'react';
import { Button, Card, EmptyState, ConfirmDialog } from '@/components/ui';
import { MarketListing, ItemRarity } from '@/hooks/useMarketplace';
import { formatGold, formatTimeAgo } from '@/utils/format';

interface MyListingsProps {
  listings: MarketListing[];
  onCancel: (listingId: string) => Promise<{ success: boolean; message: string }>;
  onUpdatePrice: (listingId: string, newPrice: number) => Promise<{ success: boolean; message: string }>;
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

// Status badge colors
const statusColors: Record<string, string> = {
  active: 'bg-emerald-600',
  sold: 'bg-gold-dark',
  expired: 'bg-desert-stone',
  cancelled: 'bg-blood-red',
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
  const isUrgent = hours < 1;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return { display: `${days}d ${hours % 24}h`, isExpired: false, isUrgent };
  }
  if (hours > 0) {
    return { display: `${hours}h ${minutes}m`, isExpired: false, isUrgent };
  }
  return { display: `${minutes}m`, isExpired: false, isUrgent };
}

export const MyListings: React.FC<MyListingsProps> = ({
  listings,
  onCancel,
  onUpdatePrice,
  onRefresh,
  isLoading = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [cancelConfirm, setCancelConfirm] = useState<MarketListing | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  // Separate active and completed listings
  const activeListings = listings.filter((l) => l.status === 'active');
  const completedListings = listings.filter((l) => l.status !== 'active');

  // Handle cancel listing
  const handleCancel = async () => {
    if (!cancelConfirm) return;

    setProcessingId(cancelConfirm._id);
    setError('');

    const result = await onCancel(cancelConfirm._id);

    if (result.success) {
      setCancelConfirm(null);
      onRefresh();
    } else {
      setError(result.message);
    }

    setProcessingId(null);
  };

  // Handle price update
  const handleUpdatePrice = async (listingId: string) => {
    const priceNum = parseInt(newPrice, 10);

    if (!priceNum || priceNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setProcessingId(listingId);
    setError('');

    const result = await onUpdatePrice(listingId, priceNum);

    if (result.success) {
      setEditingId(null);
      setNewPrice('');
      onRefresh();
    } else {
      setError(result.message);
    }

    setProcessingId(null);
  };

  // Start editing price
  const startEditing = (listing: MarketListing) => {
    setEditingId(listing._id);
    setNewPrice(listing.buyoutPrice?.toString() || listing.startingPrice.toString());
    setError('');
  };

  if (listings.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No Listings"
        description="You haven't listed any items for sale yet. Create a listing to start trading!"
        variant="default"
        size="lg"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-blood-red/20 border border-blood-red/50 rounded-lg p-3">
          <p className="text-blood-red text-sm">{error}</p>
        </div>
      )}

      {/* Active Listings */}
      {activeListings.length > 0 && (
        <div>
          <h3 className="text-lg font-western text-gold-light mb-4">
            Active Listings ({activeListings.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-wood-grain/30">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-desert-stone">
                    Item
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-desert-stone">
                    Type
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-desert-stone">
                    Price
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-desert-stone">
                    Bids
                  </th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-desert-stone">
                    Time Left
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-desert-stone">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeListings.map((listing) => {
                  const timeRemaining = getTimeRemaining(listing.expiresAt);
                  const isEditing = editingId === listing._id;
                  const isProcessing = processingId === listing._id;

                  return (
                    <tr
                      key={listing._id}
                      className="border-b border-wood-grain/20 hover:bg-wood-darker/30"
                    >
                      {/* Item */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{listing.item.icon}</span>
                          <div>
                            <p
                              className={`font-semibold ${rarityColors[listing.item.rarity]} truncate max-w-[150px]`}
                            >
                              {listing.item.name}
                            </p>
                            <p className="text-xs text-desert-stone capitalize">
                              {listing.item.rarity}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Listing Type */}
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`
                            px-2 py-1 text-xs font-semibold rounded capitalize
                            ${listing.listingType === 'auction'
                              ? 'bg-gold-dark/30 text-gold-light'
                              : listing.listingType === 'buyout'
                                ? 'bg-emerald-600/30 text-emerald-400'
                                : 'bg-purple-600/30 text-purple-400'
                            }
                          `}
                        >
                          {listing.listingType === 'both' ? 'Both' : listing.listingType}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-2 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="input-western w-24 text-sm text-right"
                              min={1}
                              disabled={isProcessing}
                            />
                            <button
                              onClick={() => handleUpdatePrice(listing._id)}
                              disabled={isProcessing}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setNewPrice('');
                              }}
                              disabled={isProcessing}
                              className="text-blood-red hover:text-blood-dark"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div>
                            {listing.currentBid ? (
                              <>
                                <p className="font-bold text-gold-light">
                                  {formatGold(listing.currentBid)}
                                </p>
                                <p className="text-xs text-desert-stone">Current Bid</p>
                              </>
                            ) : listing.buyoutPrice ? (
                              <>
                                <p className="font-bold text-emerald-400">
                                  {formatGold(listing.buyoutPrice)}
                                </p>
                                <p className="text-xs text-desert-stone">Buy Now</p>
                              </>
                            ) : (
                              <>
                                <p className="font-bold text-gold-light">
                                  {formatGold(listing.startingPrice)}
                                </p>
                                <p className="text-xs text-desert-stone">Starting</p>
                              </>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Bids */}
                      <td className="py-3 px-2 text-center">
                        <span className="text-desert-sand">{listing.bidCount}</span>
                      </td>

                      {/* Time Left */}
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`
                            ${timeRemaining.isExpired ? 'text-blood-red' : ''}
                            ${timeRemaining.isUrgent && !timeRemaining.isExpired ? 'text-gold-light' : ''}
                            ${!timeRemaining.isUrgent && !timeRemaining.isExpired ? 'text-desert-sand' : ''}
                          `}
                        >
                          {timeRemaining.display}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Price (only for buyout-only listings with no bids) */}
                          {listing.listingType === 'buyout' && listing.bidCount === 0 && !isEditing && (
                            <button
                              onClick={() => startEditing(listing)}
                              className="text-sm text-desert-sand hover:text-gold-light transition-colors"
                              disabled={isProcessing}
                            >
                              Edit
                            </button>
                          )}

                          {/* Cancel (only if no bids) */}
                          {listing.bidCount === 0 && (
                            <button
                              onClick={() => setCancelConfirm(listing)}
                              className="text-sm text-blood-red hover:text-blood-dark transition-colors"
                              disabled={isProcessing}
                            >
                              Cancel
                            </button>
                          )}

                          {/* Cannot cancel with bids */}
                          {listing.bidCount > 0 && (
                            <span className="text-xs text-desert-stone italic">
                              Has bids
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Listings */}
      {completedListings.length > 0 && (
        <div>
          <h3 className="text-lg font-western text-desert-sand mb-4">
            Completed Listings ({completedListings.length})
          </h3>

          <div className="space-y-2">
            {completedListings.slice(0, 10).map((listing) => (
              <Card
                key={listing._id}
                variant="wood"
                padding="sm"
                className="flex items-center gap-4 opacity-75"
              >
                <span className="text-2xl">{listing.item.icon}</span>
                <div className="flex-1">
                  <p className={`font-semibold ${rarityColors[listing.item.rarity]}`}>
                    {listing.item.name}
                  </p>
                  <p className="text-xs text-desert-stone">
                    {formatTimeAgo(new Date(listing.createdAt))}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded text-white capitalize ${statusColors[listing.status]}`}
                >
                  {listing.status}
                </span>
                {listing.status === 'sold' && listing.currentBid && (
                  <span className="font-bold text-gold-light">
                    {formatGold(listing.currentBid)}
                  </span>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        onConfirm={handleCancel}
        title="Cancel Listing"
        message={`Are you sure you want to cancel your listing for "${cancelConfirm?.item.name}"? The item will be returned to your inventory.`}
        confirmText="Cancel Listing"
        cancelText="Keep Listing"
        variant="danger"
        isLoading={processingId === cancelConfirm?._id}
      />
    </div>
  );
};

export default MyListings;
