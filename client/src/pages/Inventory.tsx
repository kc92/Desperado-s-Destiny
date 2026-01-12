/**
 * Inventory Page
 * Display character inventory items with western theme
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useShop, InventoryItemWithDetails, ItemRarity, Equipment } from '@/hooks/useShop';
import { Card, Button, Modal } from '@/components/ui';
import { StateView } from '@/components/ui/StateView';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { useTutorialStore } from '@/store/useTutorialStore';
import { completeTutorialAction } from '@/utils/tutorialActionHandlers';

/**
 * Equipment slot display names
 */
const SLOT_NAMES: Record<string, string> = {
  weapon: 'Weapon',
  head: 'Hat',
  body: 'Vest',
  feet: 'Boots',
  mount: 'Mount',
  accessory: 'Accessory'
};

/**
 * Item rarity colors for western theme
 */
const RARITY_COLORS: Record<ItemRarity, string> = {
  common: 'text-desert-stone',
  uncommon: 'text-green-500',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-gold-light'
};

/**
 * Item rarity backgrounds
 */
const RARITY_BACKGROUNDS: Record<ItemRarity, string> = {
  common: 'bg-desert-stone/10 border-desert-stone',
  uncommon: 'bg-green-600/10 border-green-600',
  rare: 'bg-blue-600/10 border-blue-600',
  epic: 'bg-purple-600/10 border-purple-600',
  legendary: 'bg-gold-light/10 border-gold-light'
};

/**
 * Inventory page component
 */
export const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const { inventory, equipment, isLoading, error, fetchInventory, fetchEquipment, sellItem, useItem, equipItem, unequipItem } = useShop();
  const [selectedItem, setSelectedItem] = useState<InventoryItemWithDetails | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  // Ref for action message auto-hide timer (prevents memory leaks on unmount)
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup message timer on unmount
  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  const { isActive, getCurrentStep } = useTutorialStore();

  useEffect(() => {
    fetchInventory();
    fetchEquipment();

    // Tutorial action: open-inventory
    if (isActive && getCurrentStep()?.requiresAction === 'open-inventory') {
        completeTutorialAction('open-inventory');
    }
  }, [fetchInventory, fetchEquipment, isActive, getCurrentStep]);

  const handleUse = async (invItem: InventoryItemWithDetails) => {
    if (isActioning) return;
    setIsActioning(true);
    const result = await useItem(invItem.item.itemId);
    setActionMessage({ text: result.message, success: result.success });
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setActionMessage(null), 3000);
    setIsActioning(false);
    if (result.success) {
      setSelectedItem(null);
      // Tutorial action: use-item-predator-scent-gland
      if (isActive && getCurrentStep()?.requiresAction === 'use-item-predator-scent-gland' && invItem.item.itemId === 'predator-scent-gland') {
          completeTutorialAction('use-item-predator-scent-gland');
      }
    }
  };

  const handleSell = async (invItem: InventoryItemWithDetails, quantity: number = 1) => {
    if (isActioning) return;
    setIsActioning(true);
    const result = await sellItem(invItem.item.itemId, quantity);
    setActionMessage({ text: result.message, success: result.success });
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setActionMessage(null), 3000);
    setIsActioning(false);
    if (result.success) {
      setSelectedItem(null);
    }
  };

  const handleEquip = async (invItem: InventoryItemWithDetails) => {
    if (isActioning) return;
    setIsActioning(true);
    const result = await equipItem(invItem.item.itemId);
    setActionMessage({ text: result.message, success: result.success });
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setActionMessage(null), 3000);
    setIsActioning(false);
    if (result.success) {
      setSelectedItem(null);
    }
  };

  const handleUnequip = async (slot: string) => {
    if (isActioning) return;
    setIsActioning(true);
    const result = await unequipItem(slot);
    setActionMessage({ text: result.message, success: result.success });
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setActionMessage(null), 3000);
    setIsActioning(false);
  };

  if (!currentCharacter) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-light mx-auto"></div>
          <p className="text-desert-sand font-serif">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-western text-wood-dark text-shadow-gold mb-2">
          Inventory & Equipment
        </h1>
        <p className="text-lg text-wood-grain">
          {currentCharacter.name}'s Belongings
        </p>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className={`rounded-lg p-4 mb-6 text-center ${
          actionMessage.success
            ? 'bg-green-900/50 border border-green-500/50'
            : 'bg-red-900/50 border border-red-500/50'
        }`}>
          <p className="text-desert-sand">{actionMessage.text}</p>
        </div>
      )}

      {/* Inventory Stats */}
      <Card variant="leather" className="mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-light">
                {inventory.length}
              </div>
              <div className="text-sm text-desert-stone uppercase">Unique Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-light">
                {inventory.reduce((sum, inv) => sum + inv.quantity, 0)}
              </div>
              <div className="text-sm text-desert-stone uppercase">Total Quantity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-light">
                ${currentCharacter.gold}
              </div>
              <div className="text-sm text-desert-stone uppercase">Dollars</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Equipment Section */}
      <Card variant="wood" className="mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-western text-desert-sand mb-4">Equipment</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(SLOT_NAMES).map(([slot, name]) => {
              const equippedItem = equipment[slot as keyof Equipment];
              return (
                <div
                  key={slot}
                  className="bg-wood-dark/50 border border-wood-grain/30 rounded-lg p-3 text-center"
                >
                  <div className="text-xs text-desert-stone uppercase mb-2">{name}</div>
                  {equippedItem ? (
                    <>
                      <div className="text-3xl mb-1">{equippedItem.icon}</div>
                      <div className="text-sm text-desert-sand truncate">{equippedItem.name}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnequip(slot)}
                        disabled={isActioning}
                        className="mt-2 text-xs"
                      >
                        Unequip
                      </Button>
                    </>
                  ) : (
                    <div className="text-4xl text-desert-stone/30 py-2">—</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Inventory Grid */}
      <StateView
        isLoading={isLoading}
        loadingComponent={
          <div aria-busy="true" aria-live="polite">
            <CardGridSkeleton count={9} columns={3} />
          </div>
        }
        error={error}
        onRetry={() => fetchInventory()}
        isEmpty={inventory.length === 0}
        emptyProps={{
          icon: '🎒',
          title: 'Empty Saddlebags',
          description: 'Visit the General Store to stock up on supplies, or defeat enemies in combat to collect loot.',
          actionText: 'Visit Shop',
          onAction: () => navigate('/game/shop')
        }}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((invItem, index) => {
            const { item, quantity, acquiredAt: _acquiredAt } = invItem;
            const rarityColor = RARITY_COLORS[item.rarity];
            const rarityBg = RARITY_BACKGROUNDS[item.rarity];

            return (
              <Card
                key={`${item.itemId}-${index}`}
                variant="wood"
                className={`border-2 ${rarityBg} transition-all hover:scale-105 cursor-pointer`}
                onClick={() => setSelectedItem(invItem)}
              >
                <div className="p-6">
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{item.icon}</div>
                      <div>
                        <h3 className="text-lg font-western text-desert-sand capitalize">
                          {item.name}
                        </h3>
                        <p className={`text-sm font-bold uppercase ${rarityColor}`}>
                          {item.rarity}
                        </p>
                      </div>
                    </div>
                    {quantity > 1 && (
                      <div className="bg-gold-dark text-wood-dark font-bold px-2 py-1 rounded text-sm">
                        x{quantity}
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-desert-stone">Type:</span>
                      <span className="text-desert-sand capitalize">{item.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-desert-stone">Sell Value:</span>
                      <span className="text-gold-light">${item.sellPrice}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    {item.isEquippable && (
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquip(invItem);
                        }}
                        disabled={isActioning}
                      >
                        Equip
                      </Button>
                    )}
                    {item.isConsumable && (
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUse(invItem);
                        }}
                        disabled={isActioning}
                      >
                        Use
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSell(invItem);
                      }}
                      disabled={isActioning}
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </StateView>

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.item.name}
        >
          <div className="space-y-4">
            {/* Icon and Rarity */}
            <div className="text-center">
              <span className="text-6xl">{selectedItem.item.icon}</span>
              <p className={`mt-2 font-western ${RARITY_COLORS[selectedItem.item.rarity]} capitalize`}>
                {selectedItem.item.rarity} {selectedItem.item.type}
              </p>
              {selectedItem.quantity > 1 && (
                <p className="text-desert-stone">Quantity: {selectedItem.quantity}</p>
              )}
            </div>

            {/* Description */}
            <p className="text-desert-sand text-center font-serif italic">
              "{selectedItem.item.description}"
            </p>

            {/* Effects */}
            <Card variant="wood" className="p-3">
              <h4 className="text-sm font-western text-desert-sand mb-2">Effects</h4>
              <ul className="space-y-1">
                {selectedItem.item.effects.map((effect, i) => (
                  <li key={i} className="text-sm text-gold-light">
                    • {effect.description}
                  </li>
                  ))}
              </ul>
            </Card>

            {/* Sell Value */}
            <div className="flex justify-between text-sm">
              <span className="text-desert-stone">Sell Value:</span>
              <span className="text-gold-light">${selectedItem.item.sellPrice} each</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-wood-grain/30">
              {selectedItem.item.isEquippable && (
                <Button
                  onClick={() => handleEquip(selectedItem)}
                  disabled={isActioning}
                  fullWidth
                >
                  {isActioning ? 'Equipping...' : 'Equip'}
                </Button>
              )}
              {selectedItem.item.isConsumable && (
                <Button
                  onClick={() => handleUse(selectedItem)}
                  disabled={isActioning}
                  fullWidth
                >
                  {isActioning ? 'Using...' : 'Use Item'}
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => handleSell(selectedItem)}
                disabled={isActioning}
                fullWidth
              >
                {isActioning ? 'Selling...' : `Sell for $${selectedItem.item.sellPrice}`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Inventory;