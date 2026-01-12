/**
 * Location Shops Component
 * Displays shops and handles purchases
 */

import React from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { useLocationStore } from '@/store/useLocationStore';
import { useCharacterStore } from '@/store/useCharacterStore';

interface LocationShopsProps {
  onRefresh?: () => void;
}

export const LocationShops: React.FC<LocationShopsProps> = ({ onRefresh }) => {
  const { currentCharacter, refreshCharacter } = useCharacterStore();
  const {
    location,
    selectedShop,
    purchaseResult,
    setSelectedShop,
    handlePurchase,
    clearPurchaseResult,
  } = useLocationStore();

  if (!location || location.shops.length === 0) {
    return null;
  }

  const playerGold = currentCharacter?.gold || 0;

  const onPurchase = async (shopId: string, itemId: string) => {
    await handlePurchase(shopId, itemId);
    refreshCharacter();
    if (onRefresh) {
      onRefresh();
    }
  };

  const closeShopModal = () => {
    setSelectedShop(null);
    clearPurchaseResult();
  };

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-bold text-amber-400 mb-4">🏪 Shops</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {location.shops.map(shop => (
            <div key={shop.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-amber-300">{shop.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{shop.description}</p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => setSelectedShop(shop)}
              >
                Browse ({shop.items.length} items)
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Shop Modal */}
      {selectedShop && (
        <Modal
          isOpen={true}
          onClose={closeShopModal}
          title={selectedShop.name}
        >
          <div className="space-y-4">
            <p className="text-gray-400">{selectedShop.description}</p>

            {purchaseResult && (
              <div className={`p-3 rounded ${purchaseResult.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                {purchaseResult.message}
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedShop.items.map(item => (
                <div key={item.itemId} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                  <div>
                    <p className="font-semibold text-amber-300">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                    {item.requiredLevel && item.requiredLevel > 1 && (
                      <p className="text-xs text-orange-400">Requires level {item.requiredLevel}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-semibold">${item.price}</p>
                    <Button
                      size="sm"
                      onClick={() => onPurchase(selectedShop.id, item.itemId)}
                      disabled={playerGold < item.price}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default LocationShops;
