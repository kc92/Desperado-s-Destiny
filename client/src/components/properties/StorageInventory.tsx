/**
 * StorageInventory Component
 * Manages property storage - deposit and withdraw items
 */

import React, { useState } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import type { PropertyStorage, PropertyStorageItem } from '@desperados/shared';

interface InventoryItem {
  itemId: string;
  name: string;
  icon: string;
  quantity: number;
  type: string;
}

interface StorageInventoryProps {
  storage: PropertyStorage;
  characterInventory: InventoryItem[];
  onDeposit: (
    itemId: string,
    quantity: number
  ) => Promise<{ success: boolean; message: string }>;
  onWithdraw: (
    itemId: string,
    quantity: number
  ) => Promise<{ success: boolean; message: string }>;
  onClose?: () => void;
}

/**
 * Storage capacity bar
 */
const StorageCapacityBar: React.FC<{
  current: number;
  max: number;
}> = ({ current, max }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  let barColor = 'bg-green-500';
  if (percentage >= 90) barColor = 'bg-red-500';
  else if (percentage >= 70) barColor = 'bg-orange-500';
  else if (percentage >= 50) barColor = 'bg-yellow-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-desert-stone">Storage</span>
        <span className={percentage >= 90 ? 'text-red-400' : 'text-desert-sand'}>
          {current}/{max} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="h-3 bg-wood-dark rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

/**
 * Storage item component
 */
const StorageItemCard: React.FC<{
  item: PropertyStorageItem;
  onWithdraw: (quantity: number) => void;
  isLoading: boolean;
}> = ({ item, onWithdraw, isLoading }) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(1);

  const handleWithdraw = () => {
    onWithdraw(withdrawAmount);
    setShowWithdrawModal(false);
    setWithdrawAmount(1);
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-wood-dark/50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <p className="text-desert-sand font-semibold">{item.itemName}</p>
            <p className="text-xs text-desert-stone">
              Qty: {item.quantity} | Added:{' '}
              {new Date(item.addedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowWithdrawModal(true)}
          disabled={isLoading}
        >
          Withdraw
        </Button>
      </div>

      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title={`Withdraw ${item.itemName}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-desert-stone text-sm">
            Available: {item.quantity}
          </p>

          <div>
            <label className="block text-sm text-desert-stone mb-2">
              Amount to Withdraw
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWithdrawAmount(Math.max(1, withdrawAmount - 1))}
                disabled={withdrawAmount <= 1}
              >
                -
              </Button>
              <input
                type="number"
                min={1}
                max={item.quantity}
                value={withdrawAmount}
                onChange={(e) =>
                  setWithdrawAmount(
                    Math.min(item.quantity, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="w-20 text-center bg-wood-dark border border-wood-grain/30 rounded-lg p-2 text-desert-sand"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setWithdrawAmount(Math.min(item.quantity, withdrawAmount + 1))
                }
                disabled={withdrawAmount >= item.quantity}
              >
                +
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWithdrawAmount(item.quantity)}
              >
                Max
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="primary" fullWidth onClick={handleWithdraw}>
              Withdraw
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowWithdrawModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * Inventory item for deposit
 */
const InventoryItemCard: React.FC<{
  item: InventoryItem;
  onDeposit: (quantity: number) => void;
  isLoading: boolean;
  storageAvailable: number;
}> = ({ item, onDeposit, isLoading, storageAvailable }) => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(1);

  const maxDeposit = Math.min(item.quantity, storageAvailable);

  const handleDeposit = () => {
    onDeposit(depositAmount);
    setShowDepositModal(false);
    setDepositAmount(1);
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 bg-wood-dark/50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{item.icon || '📦'}</span>
          <div>
            <p className="text-desert-sand font-semibold">{item.name}</p>
            <p className="text-xs text-desert-stone">
              In inventory: {item.quantity}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDepositModal(true)}
          disabled={isLoading || storageAvailable <= 0}
        >
          Deposit
        </Button>
      </div>

      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title={`Deposit ${item.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-desert-stone">
            <span>In Inventory: {item.quantity}</span>
            <span>Storage Available: {storageAvailable}</span>
          </div>

          <div>
            <label className="block text-sm text-desert-stone mb-2">
              Amount to Deposit
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDepositAmount(Math.max(1, depositAmount - 1))}
                disabled={depositAmount <= 1}
              >
                -
              </Button>
              <input
                type="number"
                min={1}
                max={maxDeposit}
                value={depositAmount}
                onChange={(e) =>
                  setDepositAmount(
                    Math.min(maxDeposit, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="w-20 text-center bg-wood-dark border border-wood-grain/30 rounded-lg p-2 text-desert-sand"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDepositAmount(Math.min(maxDeposit, depositAmount + 1))}
                disabled={depositAmount >= maxDeposit}
              >
                +
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDepositAmount(maxDeposit)}
              >
                Max
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={handleDeposit}
              disabled={maxDeposit <= 0}
            >
              Deposit
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowDepositModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * StorageInventory component
 */
export const StorageInventory: React.FC<StorageInventoryProps> = ({
  storage,
  characterInventory,
  onDeposit,
  onWithdraw,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'storage' | 'inventory'>('storage');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  const storageAvailable = storage.capacity - storage.currentUsage;

  const handleDeposit = async (itemId: string, quantity: number) => {
    setIsLoading(true);
    const result = await onDeposit(itemId, quantity);
    setActionMessage({ text: result.message, success: result.success });
    setTimeout(() => setActionMessage(null), 3000);
    setIsLoading(false);
  };

  const handleWithdraw = async (itemId: string, quantity: number) => {
    setIsLoading(true);
    const result = await onWithdraw(itemId, quantity);
    setActionMessage({ text: result.message, success: result.success });
    setTimeout(() => setActionMessage(null), 3000);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-western text-desert-sand">Property Storage</h3>
          <p className="text-sm text-desert-stone">
            Store items safely in your property
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-desert-stone hover:text-desert-sand transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Action message */}
      {actionMessage && (
        <div
          className={`rounded-lg p-3 text-center ${
            actionMessage.success
              ? 'bg-green-900/50 border border-green-500/50'
              : 'bg-red-900/50 border border-red-500/50'
          }`}
        >
          <p className="text-desert-sand text-sm">{actionMessage.text}</p>
        </div>
      )}

      {/* Storage capacity */}
      <Card variant="leather" className="p-4">
        <StorageCapacityBar current={storage.currentUsage} max={storage.capacity} />
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('storage')}
          className={`flex-1 py-2 px-4 rounded-lg font-serif transition-colors ${
            activeTab === 'storage'
              ? 'bg-gold-light text-wood-dark'
              : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
          }`}
        >
          In Storage ({storage.items.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 px-4 rounded-lg font-serif transition-colors ${
            activeTab === 'inventory'
              ? 'bg-gold-light text-wood-dark'
              : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
          }`}
        >
          My Inventory ({characterInventory.length})
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'storage' && (
        <div className="space-y-2">
          {storage.items.length > 0 ? (
            storage.items.map((item) => (
              <StorageItemCard
                key={item.itemId}
                item={item}
                onWithdraw={(qty) => handleWithdraw(item.itemId, qty)}
                isLoading={isLoading}
              />
            ))
          ) : (
            <Card variant="leather" className="p-6 text-center">
              <span className="text-4xl mb-2 block">📦</span>
              <p className="text-desert-stone">Storage is empty</p>
              <p className="text-xs text-desert-stone mt-1">
                Deposit items from your inventory to store them safely
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-2">
          {storageAvailable <= 0 && (
            <div className="p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg text-center">
              <p className="text-orange-400 text-sm">
                Storage is full! Withdraw items or upgrade storage capacity.
              </p>
            </div>
          )}

          {characterInventory.length > 0 ? (
            characterInventory.map((item) => (
              <InventoryItemCard
                key={item.itemId}
                item={item}
                onDeposit={(qty) => handleDeposit(item.itemId, qty)}
                isLoading={isLoading}
                storageAvailable={storageAvailable}
              />
            ))
          ) : (
            <Card variant="leather" className="p-6 text-center">
              <span className="text-4xl mb-2 block">🎒</span>
              <p className="text-desert-stone">Inventory is empty</p>
              <p className="text-xs text-desert-stone mt-1">
                Acquire items through gameplay to deposit them here
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default StorageInventory;
