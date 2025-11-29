/**
 * Shop Page
 * The General Store - Buy weapons, armor, and supplies
 */

import React, { useState, useEffect } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useShop, ShopItem, ItemType, ItemRarity } from '@/hooks/useShop';
import { Card, Button, Modal, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/store/useToastStore';
import { formatGold } from '@/utils/format';

const rarityColors: Record<ItemRarity, string> = {
  common: 'text-gray-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-gold-light',
};

const rarityBorders: Record<ItemRarity, string> = {
  common: 'border-gray-500',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-gold-light',
};

export const Shop: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const { items, isLoading, error, fetchShopItems, buyItem } = useShop();
  const { success, error: showError } = useToast();
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    fetchShopItems(selectedType === 'all' ? undefined : selectedType);
  }, [selectedType, fetchShopItems]);

  const handlePurchase = async (item: ShopItem) => {
    if (!currentCharacter || isPurchasing) return;

    setIsPurchasing(true);
    const result = await buyItem(item.itemId);

    if (result.success) {
      success('Purchase Complete!', `You bought ${item.name}`);
      setSelectedItem(null);
    } else {
      showError('Purchase Failed', result.message);
    }

    setIsPurchasing(false);
  };

  if (!currentCharacter) {
    return <div className="text-center py-12 text-desert-sand">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-western text-gold-light">The General Store</h1>
          <p className="text-desert-stone">Everything a frontier wanderer needs</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-desert-stone">Your Gold</p>
          <p className="text-2xl font-western text-gold-light">
            {formatGold(currentCharacter.gold)}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'weapon', 'armor', 'consumable', 'mount'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg font-serif capitalize whitespace-nowrap transition-colors ${
              selectedType === type
                ? 'bg-gold-light text-wood-dark'
                : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
            }`}
          >
            {type === 'all' ? 'All Items' : `${type}s`}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div aria-busy="true" aria-live="polite">
          <CardGridSkeleton count={12} columns={4} />
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const canAfford = currentCharacter.gold >= item.price;
            const meetsLevel = currentCharacter.level >= item.levelRequired;

            return (
              <div
                key={item.itemId}
                onClick={() => setSelectedItem(item)}
                className={`bg-wood-dark rounded-lg p-4 border-2 cursor-pointer transition-all hover:shadow-lg ${
                  rarityBorders[item.rarity]
                } ${!canAfford || !meetsLevel ? 'opacity-60' : 'hover:scale-105'}`}
              >
                <div className="text-center mb-3">
                  <span className="text-4xl">{item.icon}</span>
                </div>
                <h3 className={`font-western text-sm ${rarityColors[item.rarity]} truncate`}>
                  {item.name}
                </h3>
                <p className="text-xs text-desert-stone capitalize">{item.rarity}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className={`font-bold ${canAfford ? 'text-gold-light' : 'text-red-500'}`}>
                    {item.price}g
                  </span>
                  {item.levelRequired > 1 && (
                    <span className={`text-xs ${meetsLevel ? 'text-desert-stone' : 'text-red-500'}`}>
                      Lvl {item.levelRequired}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <EmptyState
          icon="🏪"
          title="Nothing in Stock"
          description="The shopkeeper hasn't restocked yet. Check back later for new wares!"
          variant="default"
          size="lg"
        />
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.name}
        >
          <div className="space-y-4">
            {/* Icon and Rarity */}
            <div className="text-center">
              <span className="text-6xl">{selectedItem.icon}</span>
              <p className={`mt-2 font-western ${rarityColors[selectedItem.rarity]} capitalize`}>
                {selectedItem.rarity} {selectedItem.type}
              </p>
            </div>

            {/* Description */}
            <p className="text-desert-sand text-center font-serif italic">
              "{selectedItem.description}"
            </p>

            {/* Effects */}
            <Card variant="wood" className="p-3">
              <h4 className="text-sm font-western text-desert-sand mb-2">Effects</h4>
              <ul className="space-y-1">
                {selectedItem.effects.map((effect, i) => (
                  <li key={i} className="text-sm text-gold-light">
                    • {effect.description}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Requirements */}
            <div className="flex justify-between text-sm">
              <span className="text-desert-stone">Level Required:</span>
              <span className={currentCharacter.level >= selectedItem.levelRequired ? 'text-green-500' : 'text-red-500'}>
                {selectedItem.levelRequired}
              </span>
            </div>

            {/* Price */}
            <div className="flex justify-between items-center pt-4 border-t border-wood-grain/30">
              <div>
                <p className="text-sm text-desert-stone">Price</p>
                <p className={`text-2xl font-western ${
                  currentCharacter.gold >= selectedItem.price ? 'text-gold-light' : 'text-red-500'
                }`}>
                  {selectedItem.price}g
                </p>
              </div>
              <Button
                onClick={() => handlePurchase(selectedItem)}
                disabled={
                  currentCharacter.gold < selectedItem.price ||
                  currentCharacter.level < selectedItem.levelRequired ||
                  isPurchasing
                }
              >
                {isPurchasing ? 'Purchasing...' : 'Purchase'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Shop;
