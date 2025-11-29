/**
 * MyPropertiesPage
 * View and manage owned properties
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useProperties } from '@/hooks/useProperties';
import { useShop, InventoryItemWithDetails } from '@/hooks/useShop';
import { useToast } from '@/store/useToastStore';
import { Card, Button, Modal, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import {
  PropertyCard,
  PropertyDetails,
  WorkerManagement,
  StorageInventory,
  LoanTracker,
  UpgradePanel,
} from '@/components/properties';
import { formatGold } from '@/utils/format';
import type { Property, PropertyType, WorkerType } from '@desperados/shared';

/**
 * Get available worker types for a property type
 */
function getAvailableWorkerTypes(propertyType: PropertyType): WorkerType[] {
  const workerMap: Record<PropertyType, WorkerType[]> = {
    ranch: ['farmhand', 'stable_hand', 'security', 'manager'],
    shop: ['shopkeeper', 'security', 'manager'],
    workshop: ['craftsman', 'security', 'manager'],
    homestead: ['security', 'manager'],
    mine: ['miner', 'security', 'manager'],
    saloon: ['bartender', 'security', 'manager'],
    stable: ['stable_hand', 'security', 'manager'],
  };
  return workerMap[propertyType] || ['manager'];
}

/**
 * View modes
 */
type ViewMode = 'grid' | 'details' | 'workers' | 'storage' | 'upgrades' | 'loans';

/**
 * MyPropertiesPage component
 */
export const MyPropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const {
    myProperties,
    selectedProperty,
    loans,
    isLoading,
    error,
    fetchMyProperties,
    fetchPropertyDetails,
    fetchLoans,
    upgradeTier,
    addUpgrade,
    hireWorker,
    fireWorker,
    depositItem,
    withdrawItem,
    makeLoanPayment,
    transferProperty,
    clearSelectedProperty,
  } = useProperties();
  const { inventory, fetchInventory } = useShop();
  const { success, error: showError } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferPrice, setTransferPrice] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);

  // Fetch properties on mount
  useEffect(() => {
    fetchMyProperties();
    fetchLoans();
  }, [fetchMyProperties, fetchLoans]);

  // Fetch inventory when storage view is opened
  useEffect(() => {
    if (viewMode === 'storage') {
      fetchInventory();
    }
  }, [viewMode, fetchInventory]);

  // Fetch property details when a property is selected
  useEffect(() => {
    if (selectedPropertyId) {
      fetchPropertyDetails(selectedPropertyId);
    }
  }, [selectedPropertyId, fetchPropertyDetails]);

  const handlePropertySelect = (property: Property) => {
    setSelectedPropertyId(property._id);
    setViewMode('details');
  };

  const handleBackToGrid = () => {
    setViewMode('grid');
    setSelectedPropertyId(null);
    clearSelectedProperty();
  };

  const handleUpgradeTier = async () => {
    if (!selectedPropertyId) return { success: false, message: 'No property selected' };
    const result = await upgradeTier(selectedPropertyId);
    if (result.success) {
      success('Tier Upgraded!', result.message);
    } else {
      showError('Upgrade Failed', result.message);
    }
    return result;
  };

  const handleAddUpgrade = async (upgradeType: string) => {
    if (!selectedPropertyId) return { success: false, message: 'No property selected' };
    const result = await addUpgrade(selectedPropertyId, upgradeType);
    if (result.success) {
      success('Upgrade Added!', result.message);
    } else {
      showError('Upgrade Failed', result.message);
    }
    return result;
  };

  const handleHireWorker = async (workerType: WorkerType, skill: number) => {
    if (!selectedPropertyId) return { success: false, message: 'No property selected' };
    const result = await hireWorker(selectedPropertyId, workerType, skill);
    if (result.success) {
      success('Worker Hired!', result.message);
    } else {
      showError('Hiring Failed', result.message);
    }
    return result;
  };

  const handleFireWorker = async (workerId: string) => {
    if (!selectedPropertyId) return { success: false, message: 'No property selected' };
    const result = await fireWorker(selectedPropertyId, workerId);
    if (result.success) {
      success('Worker Fired', result.message);
    } else {
      showError('Action Failed', result.message);
    }
    return result;
  };

  const handleDeposit = async (itemId: string, quantity: number) => {
    if (!selectedPropertyId) return { success: false, message: 'No property selected' };
    const result = await depositItem(selectedPropertyId, itemId, quantity);
    if (result.success) {
      success('Item Deposited!', result.message);
      fetchInventory(); // Refresh inventory
    } else {
      showError('Deposit Failed', result.message);
    }
    return result;
  };

  const handleWithdraw = async (itemId: string, quantity: number) => {
    if (!selectedPropertyId) return { success: false, message: 'No property selected' };
    const result = await withdrawItem(selectedPropertyId, itemId, quantity);
    if (result.success) {
      success('Item Withdrawn!', result.message);
      fetchInventory(); // Refresh inventory
    } else {
      showError('Withdrawal Failed', result.message);
    }
    return result;
  };

  const handleMakePayment = async (loanId: string, amount?: number) => {
    const result = await makeLoanPayment(loanId, amount);
    if (result.success) {
      success('Payment Made!', result.message);
    } else {
      showError('Payment Failed', result.message);
    }
    return result;
  };

  const handleTransfer = async () => {
    if (!selectedPropertyId || !transferTargetId) return;

    setIsTransferring(true);
    const result = await transferProperty(
      selectedPropertyId,
      transferTargetId,
      transferPrice > 0 ? transferPrice : undefined
    );

    if (result.success) {
      success('Property Transferred!', result.message);
      setShowTransferModal(false);
      handleBackToGrid();
    } else {
      showError('Transfer Failed', result.message);
    }

    setIsTransferring(false);
  };

  // Convert inventory to format expected by StorageInventory
  const characterInventoryItems = inventory.map((inv: InventoryItemWithDetails) => ({
    itemId: inv.item.itemId,
    name: inv.item.name,
    icon: inv.item.icon,
    quantity: inv.quantity,
    type: inv.item.type,
  }));

  if (!currentCharacter) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-light mx-auto"></div>
          <p className="text-desert-sand font-serif">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalWeeklyIncome = myProperties.reduce((sum, p) => {
    const tierMultiplier = p.tier;
    const conditionMultiplier = p.condition / 100;
    const baseIncome: Record<PropertyType, number> = {
      ranch: 50,
      shop: 75,
      workshop: 60,
      homestead: 0,
      mine: 100,
      saloon: 120,
      stable: 70,
    };
    return sum + Math.floor((baseIncome[p.propertyType] || 0) * tierMultiplier * conditionMultiplier);
  }, 0);

  const totalWeeklyExpenses = myProperties.reduce(
    (sum, p) => sum + p.weeklyTaxes + p.weeklyUpkeep,
    0
  );

  const totalLoanDebt = loans
    .filter((l) => l.isActive)
    .reduce((sum, l) => sum + l.remainingBalance, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          {viewMode === 'grid' ? (
            <>
              <h1 className="text-4xl font-western text-wood-dark text-shadow-gold mb-2">
                My Properties
              </h1>
              <p className="text-lg text-wood-grain">
                Manage your frontier empire
              </p>
            </>
          ) : (
            <Button variant="ghost" onClick={handleBackToGrid}>
              ← Back to Properties
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-desert-stone">Your Gold</p>
            <p className="text-2xl font-western text-gold-light">
              {formatGold(currentCharacter.gold)}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/game/property-listings')}
          >
            Buy Properties
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card variant="leather" className="p-4 text-center">
              <p className="text-xs text-desert-stone uppercase">Properties</p>
              <p className="text-2xl font-western text-gold-light">
                {myProperties.length}
              </p>
            </Card>
            <Card variant="leather" className="p-4 text-center">
              <p className="text-xs text-desert-stone uppercase">Weekly Income</p>
              <p className="text-2xl font-western text-green-400">
                +{formatGold(totalWeeklyIncome)}
              </p>
            </Card>
            <Card variant="leather" className="p-4 text-center">
              <p className="text-xs text-desert-stone uppercase">Weekly Expenses</p>
              <p className="text-2xl font-western text-red-400">
                -{formatGold(totalWeeklyExpenses)}
              </p>
            </Card>
            <Card
              variant="leather"
              className="p-4 text-center cursor-pointer hover:bg-wood-dark/70 transition-colors"
              onClick={() => setViewMode('loans')}
            >
              <p className="text-xs text-desert-stone uppercase">Loan Debt</p>
              <p className={`text-2xl font-western ${totalLoanDebt > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                {totalLoanDebt > 0 ? formatGold(totalLoanDebt) : 'None'}
              </p>
            </Card>
          </div>

          {/* Quick access to loans */}
          {loans.filter((l) => l.isActive).length > 0 && (
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setViewMode('loans')}
                className="w-full md:w-auto"
              >
                Manage Loans ({loans.filter((l) => l.isActive).length} active)
              </Button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div aria-busy="true" aria-live="polite">
              <CardGridSkeleton count={6} columns={3} />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && myProperties.length === 0 && (
            <EmptyState
              icon="🏠"
              title="No Properties Owned"
              description="You don't own any properties yet. Visit the listings to purchase your first property and start building your empire!"
              actionText="Browse Listings"
              onAction={() => navigate('/game/property-listings')}
              variant="default"
              size="lg"
            />
          )}

          {/* Property grid */}
          {!isLoading && myProperties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  variant="owned"
                  onManage={() => handlePropertySelect(property)}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Details view */}
      {viewMode === 'details' && selectedProperty && (
        <div className="max-w-3xl mx-auto">
          <PropertyDetails
            property={selectedProperty}
            onUpgradeTier={handleUpgradeTier}
            onManageWorkers={() => setViewMode('workers')}
            onManageStorage={() => setViewMode('storage')}
            onManageUpgrades={() => setViewMode('upgrades')}
            onTransfer={() => setShowTransferModal(true)}
            onClose={handleBackToGrid}
            characterGold={currentCharacter.gold}
          />
        </div>
      )}

      {/* Workers view */}
      {viewMode === 'workers' && selectedProperty && (
        <div className="max-w-3xl mx-auto">
          <WorkerManagement
            workers={selectedProperty.workers || []}
            maxWorkers={selectedProperty.maxWorkers}
            availableWorkerTypes={getAvailableWorkerTypes(selectedProperty.propertyType)}
            onHireWorker={handleHireWorker}
            onFireWorker={handleFireWorker}
            onClose={() => setViewMode('details')}
            characterGold={currentCharacter.gold}
          />
        </div>
      )}

      {/* Storage view */}
      {viewMode === 'storage' && selectedProperty && (
        <div className="max-w-3xl mx-auto">
          <StorageInventory
            storage={selectedProperty.storage || { capacity: 0, currentUsage: 0, items: [] }}
            characterInventory={characterInventoryItems}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            onClose={() => setViewMode('details')}
          />
        </div>
      )}

      {/* Upgrades view */}
      {viewMode === 'upgrades' && selectedProperty && (
        <div className="max-w-4xl mx-auto">
          <UpgradePanel
            propertyType={selectedProperty.propertyType}
            currentTier={selectedProperty.tier}
            currentUpgrades={selectedProperty.upgrades || []}
            maxUpgrades={selectedProperty.maxUpgrades}
            onAddUpgrade={handleAddUpgrade}
            onClose={() => setViewMode('details')}
            characterGold={currentCharacter.gold}
          />
        </div>
      )}

      {/* Loans view */}
      {viewMode === 'loans' && (
        <div className="max-w-3xl mx-auto">
          <LoanTracker
            loans={loans}
            onMakePayment={handleMakePayment}
            onClose={() => setViewMode('grid')}
            characterGold={currentCharacter.gold}
          />
        </div>
      )}

      {/* Transfer modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Transfer Property"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-desert-stone">
            Transfer <strong className="text-desert-sand">{selectedProperty?.name}</strong> to
            another player.
          </p>

          <div>
            <label className="block text-sm text-desert-stone mb-2">
              Recipient Character ID
            </label>
            <input
              type="text"
              value={transferTargetId}
              onChange={(e) => setTransferTargetId(e.target.value)}
              placeholder="Enter character ID"
              className="w-full bg-wood-dark border border-wood-grain/30 rounded-lg p-3 text-desert-sand placeholder-desert-stone/50"
            />
          </div>

          <div>
            <label className="block text-sm text-desert-stone mb-2">
              Sale Price (0 for gift)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-light">
                $
              </span>
              <input
                type="number"
                min={0}
                value={transferPrice}
                onChange={(e) => setTransferPrice(parseInt(e.target.value) || 0)}
                className="w-full bg-wood-dark border border-wood-grain/30 rounded-lg p-3 pl-8 text-desert-sand"
              />
            </div>
          </div>

          <div className="p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg">
            <p className="text-orange-400 text-sm">
              ⚠️ Property transfers are permanent and cannot be undone!
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="danger"
              fullWidth
              onClick={handleTransfer}
              disabled={!transferTargetId || isTransferring}
              isLoading={isTransferring}
              loadingText="Transferring..."
            >
              {transferPrice > 0
                ? `Sell for ${formatGold(transferPrice)}`
                : 'Gift Property'}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowTransferModal(false)}
              disabled={isTransferring}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyPropertiesPage;
