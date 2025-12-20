/**
 * MerchantInventory Component
 * Displays a merchant's inventory with buy/sell functionality
 */

import React, { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import type { MerchantItem, ItemRarity } from '@/hooks/useMerchants';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';

interface MerchantInventoryProps {
  inventory: MerchantItem[];
  playerTrustLevel: number;
  onBuyItem?: (item: MerchantItem) => Promise<{ success: boolean; message: string }>;
  isLoading?: boolean;
}

const rarityColors: Record<ItemRarity, string> = {
  common: 'text-gray-300 border-gray-500',
  uncommon: 'text-green-400 border-green-500',
  rare: 'text-blue-400 border-blue-500',
  epic: 'text-purple-400 border-purple-500',
  legendary: 'text-gold-light border-gold-dark',
};

const rarityBgColors: Record<ItemRarity, string> = {
  common: 'bg-gray-900/50',
  uncommon: 'bg-green-900/30',
  rare: 'bg-blue-900/30',
  epic: 'bg-purple-900/30',
  legendary: 'bg-yellow-900/30',
};

const typeIcons: Record<string, string> = {
  weapon: '🗡️',
  armor: '🛡️',
  consumable: '🧪',
  mount: '🐴',
  material: '📦',
  quest: '📜',
};

export const MerchantInventory: React.FC<MerchantInventoryProps> = ({
  inventory,
  playerTrustLevel,
  onBuyItem,
  isLoading = false,
}) => {
  const { currentCharacter } = useCharacterStore();
  const { success, error: showError } = useToast();
  const [selectedItem, setSelectedItem] = useState<MerchantItem | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  const playerGold = currentCharacter?.gold || 0;

  // Get available and locked items
  const availableItems = inventory.filter(
    (item) => (item.trustRequired || 0) <= playerTrustLevel
  );
  const lockedItems = inventory.filter(
    (item) => (item.trustRequired || 0) > playerTrustLevel
  );

  // Filter by type
  const filteredItems = selectedType === 'all'
    ? availableItems
    : availableItems.filter((item) => item.type === selectedType);

  // Get unique item types for filter
  const itemTypes = ['all', ...Array.from(new Set(inventory.map((item) => item.type)))];

  const handlePurchase = async () => {
    if (!selectedItem || !onBuyItem || isPurchasing) return;

    setIsPurchasing(true);
    const result = await onBuyItem(selectedItem);

    if (result.success) {
      success('Purchase Complete!', `You bought ${selectedItem.name}`);
      setSelectedItem(null);
    } else {
      showError('Purchase Failed', result.message);
    }

    setIsPurchasing(false);
  };

  const canAfford = (item: MerchantItem) => playerGold >= item.price;
  const meetsRequirements = (item: MerchantItem) => (item.trustRequired || 0) <= playerTrustLevel;

  return (
    <div className="space-y-4">
      {/* Player Gold Display */}
      <div className="flex justify-between items-center p-3 bg-wood-dark/50 rounded-lg">
        <span className="text-desert-stone">Your Dollars</span>
        <span className="text-xl font-western text-gold-light">{formatDollars(playerGold)}</span>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {itemTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-lg font-serif capitalize whitespace-nowrap transition-colors text-sm ${
              selectedType === type
                ? 'bg-gold-light text-wood-dark'
                : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
            }`}
          >
            {type === 'all' ? 'All Items' : `${typeIcons[type] || ''} ${type}s`}
          </button>
        ))}
      </div>

      {/* Available Items Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-2 border-gold-light border-t-transparent rounded-full animate-spin" />
          <p className="text-desert-stone mt-2">Loading inventory...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const affordable = canAfford(item);
            const available = !item.quantity || item.quantity > 0;

            return (
              <div
                key={item.itemId}
                onClick={() => setSelectedItem(item)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  rarityColors[item.rarity]
                } ${rarityBgColors[item.rarity]} ${
                  affordable && available ? 'hover:scale-105' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{typeIcons[item.type] || '📦'}</span>
                  {item.isExclusive && (
                    <span className="text-xs px-1.5 py-0.5 bg-purple-600/50 text-purple-200 rounded">
                      Exclusive
                    </span>
                  )}
                </div>
                <h4 className={`font-western text-sm ${rarityColors[item.rarity]}`}>
                  {item.name}
                </h4>
                <p className="text-xs text-desert-stone capitalize">{item.rarity}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className={`font-bold ${affordable ? 'text-gold-light' : 'text-red-500'}`}>
                    {item.price}g
                  </span>
                  {item.quantity !== undefined && (
                    <span className="text-xs text-desert-stone">
                      {item.quantity} left
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="text-4xl">🏜️</span>
          <p className="text-desert-sand mt-2">No items of this type available</p>
        </div>
      )}

      {/* Locked Items Section */}
      {lockedItems.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm text-desert-stone mb-3 flex items-center gap-2">
            <span>🔒</span>
            Trust-Locked Items ({lockedItems.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {lockedItems.map((item) => (
              <div
                key={item.itemId}
                className="p-2 rounded-lg bg-wood-dark/30 border border-wood-grain/30 opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <div className="min-w-0">
                    <p className="text-xs text-desert-stone truncate">{item.name}</p>
                    <p className="text-xs text-yellow-600">
                      Trust {item.trustRequired} required
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.name}
          size="md"
        >
          <div className="space-y-4">
            {/* Icon and Rarity */}
            <div className="text-center">
              <span className="text-6xl">{typeIcons[selectedItem.type] || '📦'}</span>
              <p className={`mt-2 font-western capitalize ${rarityColors[selectedItem.rarity]}`}>
                {selectedItem.rarity} {selectedItem.type}
              </p>
            </div>

            {/* Description */}
            <p className="text-desert-sand text-center font-serif italic">
              "{selectedItem.description}"
            </p>

            {/* Item Details */}
            <Card variant="wood" padding="sm">
              <div className="space-y-2">
                {selectedItem.isExclusive && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">★</span>
                    <span className="text-sm text-purple-400">Exclusive - Only this merchant sells it</span>
                  </div>
                )}
                {selectedItem.quantity !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-desert-stone">📊</span>
                    <span className="text-sm text-desert-sand">
                      {selectedItem.quantity} remaining in stock
                    </span>
                  </div>
                )}
                {selectedItem.trustRequired && selectedItem.trustRequired > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gold-light">🤝</span>
                    <span className="text-sm text-desert-sand">
                      Requires Trust Level {selectedItem.trustRequired}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Purchase Section */}
            <div className="flex justify-between items-center pt-4 border-t border-wood-grain/30">
              <div>
                <p className="text-sm text-desert-stone">Price</p>
                <p className={`text-2xl font-western ${
                  canAfford(selectedItem) ? 'text-gold-light' : 'text-red-500'
                }`}>
                  {selectedItem.price}g
                </p>
              </div>
              {onBuyItem && (
                <Button
                  onClick={handlePurchase}
                  disabled={!canAfford(selectedItem) || !meetsRequirements(selectedItem) || isPurchasing}
                  isLoading={isPurchasing}
                  loadingText="Buying..."
                >
                  Purchase
                </Button>
              )}
            </div>

            {/* Affordability Warning */}
            {!canAfford(selectedItem) && (
              <p className="text-center text-sm text-red-400">
                You need {selectedItem.price - playerGold} more gold
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MerchantInventory;
