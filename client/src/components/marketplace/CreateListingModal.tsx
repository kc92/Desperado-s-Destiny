/**
 * CreateListingModal Component
 * Form for creating a new marketplace listing
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Card } from '@/components/ui';
import {
  ListingType,
  ListingDuration,
  MarketItem,
  ItemRarity,
  MARKETPLACE_TAX_RATE,
  DURATION_HOURS,
} from '@/hooks/useMarketplace';
import { InventoryItemWithDetails } from '@/hooks/useShop';
import { formatGold } from '@/utils/format';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItems: InventoryItemWithDetails[];
  onCreateListing: (data: {
    itemId: string;
    quantity?: number;
    listingType: ListingType;
    startingPrice: number;
    buyoutPrice?: number;
    duration: ListingDuration;
  }) => Promise<{ success: boolean; message: string }>;
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

// Duration labels
const durationLabels: Record<ListingDuration, string> = {
  '12h': '12 Hours',
  '24h': '24 Hours',
  '48h': '48 Hours',
  '7d': '7 Days',
};

// Listing type descriptions
const listingTypeDescriptions: Record<ListingType, string> = {
  auction: 'Players bid against each other. Highest bid wins when time expires.',
  buyout: 'Fixed price. First player to pay gets the item instantly.',
  both: 'Auction with instant purchase option. Bid or buy immediately.',
};

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  inventoryItems,
  onCreateListing,
  isProcessing = false,
}) => {
  // Form state
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [listingType, setListingType] = useState<ListingType>('both');
  const [startingPrice, setStartingPrice] = useState<string>('');
  const [buyoutPrice, setBuyoutPrice] = useState<string>('');
  const [duration, setDuration] = useState<ListingDuration>('24h');
  const [error, setError] = useState<string>('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedItemId('');
      setQuantity(1);
      setListingType('both');
      setStartingPrice('');
      setBuyoutPrice('');
      setDuration('24h');
      setError('');
    }
  }, [isOpen]);

  // Get selected item details
  const selectedItem = useMemo(() => {
    return inventoryItems.find((inv) => inv.item.itemId === selectedItemId);
  }, [inventoryItems, selectedItemId]);

  // Calculate fees
  const startingPriceNum = parseInt(startingPrice, 10) || 0;
  const buyoutPriceNum = parseInt(buyoutPrice, 10) || 0;

  const listingFee = useMemo(() => {
    const price = listingType === 'auction' ? startingPriceNum : buyoutPriceNum || startingPriceNum;
    return Math.ceil(price * MARKETPLACE_TAX_RATE);
  }, [listingType, startingPriceNum, buyoutPriceNum]);

  const potentialEarnings = useMemo(() => {
    if (listingType === 'buyout') {
      return buyoutPriceNum - listingFee;
    }
    // For auction, show based on starting price (actual depends on final bid)
    const salePrice = buyoutPriceNum || startingPriceNum;
    return salePrice - Math.ceil(salePrice * MARKETPLACE_TAX_RATE);
  }, [listingType, startingPriceNum, buyoutPriceNum, listingFee]);

  // Validate form
  const validateForm = (): boolean => {
    setError('');

    if (!selectedItemId) {
      setError('Please select an item to list');
      return false;
    }

    if (selectedItem && selectedItem.item.isStackable && quantity > selectedItem.quantity) {
      setError(`You only have ${selectedItem.quantity} of this item`);
      return false;
    }

    if (listingType === 'auction' || listingType === 'both') {
      if (startingPriceNum <= 0) {
        setError('Starting price must be greater than 0');
        return false;
      }
    }

    if (listingType === 'buyout') {
      if (buyoutPriceNum <= 0) {
        setError('Buyout price must be greater than 0');
        return false;
      }
    }

    if (listingType === 'both') {
      if (buyoutPriceNum <= 0) {
        setError('Buyout price must be greater than 0 for combined listings');
        return false;
      }
      if (buyoutPriceNum <= startingPriceNum) {
        setError('Buyout price must be higher than starting price');
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const result = await onCreateListing({
      itemId: selectedItemId,
      quantity: selectedItem?.item.isStackable ? quantity : undefined,
      listingType,
      startingPrice: startingPriceNum,
      buyoutPrice: listingType !== 'auction' ? buyoutPriceNum : undefined,
      duration,
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Listing" size="lg">
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-blood-red/20 border border-blood-red/50 rounded-lg p-3">
            <p className="text-blood-red text-sm">{error}</p>
          </div>
        )}

        {/* Item Selection */}
        <div>
          <label className="block text-sm font-semibold text-desert-sand mb-2">
            Select Item
          </label>
          {inventoryItems.length === 0 ? (
            <p className="text-desert-stone text-sm">
              You don't have any items to sell.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-2 bg-wood-darker rounded-lg">
              {inventoryItems.map((inv) => {
                const rarity = (inv.item.rarity || 'common') as ItemRarity;
                return (
                  <button
                    key={inv.item.itemId}
                    onClick={() => {
                      setSelectedItemId(inv.item.itemId);
                      setQuantity(1);
                    }}
                    className={`
                      p-2 rounded-lg border-2 transition-all text-center
                      ${selectedItemId === inv.item.itemId
                        ? `${rarityBorders[rarity]} bg-wood-dark scale-105`
                        : 'border-wood-grain/30 hover:border-wood-grain/50'
                      }
                    `}
                  >
                    <span className="text-2xl block">{inv.item.icon}</span>
                    <p className={`text-xs truncate ${rarityColors[rarity]}`}>
                      {inv.item.name}
                    </p>
                    {inv.quantity > 1 && (
                      <p className="text-xs text-desert-stone">x{inv.quantity}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Item Preview */}
        {selectedItem && (
          <Card variant="wood" padding="md">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{selectedItem.item.icon}</span>
              <div className="flex-1">
                <h4 className={`font-western ${rarityColors[(selectedItem.item.rarity || 'common') as ItemRarity]}`}>
                  {selectedItem.item.name}
                </h4>
                <p className="text-xs text-desert-stone capitalize">
                  {selectedItem.item.rarity} {selectedItem.item.type}
                </p>
              </div>
              {selectedItem.item.isStackable && selectedItem.quantity > 1 && (
                <div className="text-right">
                  <label className="block text-xs text-desert-stone mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedItem.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value, 10) || 1, selectedItem.quantity))}
                    className="input-western w-20 text-center text-sm"
                  />
                  <p className="text-xs text-desert-stone mt-1">
                    Max: {selectedItem.quantity}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Listing Type */}
        <div>
          <label className="block text-sm font-semibold text-desert-sand mb-2">
            Listing Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['auction', 'buyout', 'both'] as ListingType[]).map((type) => (
              <button
                key={type}
                onClick={() => setListingType(type)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${listingType === type
                    ? 'border-gold-light bg-gold-dark/20'
                    : 'border-wood-grain/30 hover:border-gold-light/50'
                  }
                `}
              >
                <p className="font-western text-sm capitalize text-desert-sand">
                  {type === 'both' ? 'Auction + Buyout' : type}
                </p>
                <p className="text-xs text-desert-stone mt-1">
                  {type === 'auction' && 'Bidding only'}
                  {type === 'buyout' && 'Fixed price'}
                  {type === 'both' && 'Both options'}
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-desert-stone mt-2 italic">
            {listingTypeDescriptions[listingType]}
          </p>
        </div>

        {/* Price Settings */}
        <div className="grid grid-cols-2 gap-4">
          {/* Starting Price (for auction types) */}
          {(listingType === 'auction' || listingType === 'both') && (
            <div>
              <label className="block text-sm font-semibold text-desert-sand mb-2">
                Starting Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="Enter amount..."
                  className="input-western w-full pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-light">
                  G
                </span>
              </div>
            </div>
          )}

          {/* Buyout Price */}
          {(listingType === 'buyout' || listingType === 'both') && (
            <div>
              <label className="block text-sm font-semibold text-desert-sand mb-2">
                {listingType === 'buyout' ? 'Price' : 'Buyout Price'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={listingType === 'both' ? startingPriceNum + 1 : 1}
                  value={buyoutPrice}
                  onChange={(e) => setBuyoutPrice(e.target.value)}
                  placeholder="Enter amount..."
                  className="input-western w-full pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-light">
                  G
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-desert-sand mb-2">
            Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(DURATION_HOURS) as ListingDuration[]).map((dur) => (
              <button
                key={dur}
                onClick={() => setDuration(dur)}
                className={`
                  py-2 px-3 rounded-lg border-2 transition-all text-center text-sm
                  ${duration === dur
                    ? 'border-gold-light bg-gold-dark/20 text-gold-light'
                    : 'border-wood-grain/30 hover:border-gold-light/50 text-desert-stone'
                  }
                `}
              >
                {durationLabels[dur]}
              </button>
            ))}
          </div>
        </div>

        {/* Fee Preview */}
        <Card variant="parchment" padding="md">
          <h4 className="text-sm font-western text-wood-dark mb-3">
            Fee Preview
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-wood-grain">Marketplace Tax (5%):</span>
              <span className="text-blood-red font-semibold">
                -{formatGold(listingFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-wood-grain/30 pt-2">
              <span className="text-wood-dark font-semibold">
                {listingType === 'auction' ? 'Min. Earnings (if sold at start)' : 'Your Earnings'}:
              </span>
              <span className="text-green-600 font-bold">
                {formatGold(Math.max(0, potentialEarnings))}
              </span>
            </div>
          </div>
          <p className="text-xs text-wood-grain mt-2 italic">
            * Tax is deducted when the item sells
          </p>
        </Card>

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
            onClick={handleSubmit}
            disabled={!selectedItemId || isProcessing}
            isLoading={isProcessing}
            loadingText="Creating..."
            className="flex-1"
          >
            Create Listing
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateListingModal;
