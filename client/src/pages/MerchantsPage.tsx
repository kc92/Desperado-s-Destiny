/**
 * Merchants Page
 * View wandering merchants, their schedules, and trade with them
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useMerchants, WanderingMerchant, MerchantState } from '@/hooks/useMerchants';
import { Card, Button, Modal, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import {
  MerchantCard,
  MerchantInventory,
  MerchantSchedule,
  UpcomingMerchantsList,
  TrustMeter,
} from '@/components/merchants';
import { useToast } from '@/store/useToastStore';

type ViewTab = 'available' | 'all' | 'upcoming';

export const MerchantsPage: React.FC = () => {
  const { currentCharacter, currentLocation } = useCharacterStore();
  const { success, error: showError } = useToast();
  const {
    merchants,
    availableMerchants,
    selectedMerchant,
    merchantState,
    merchantInventory,
    trustInfo,
    upcomingMerchants,
    isLoading,
    error,
    fetchAllMerchants,
    fetchAvailableMerchants,
    fetchMerchantDetails,
    fetchMerchantState,
    fetchMerchantInventory,
    fetchMerchantTrust,
    fetchUpcomingMerchants,
    discoverMerchant,
    buyItem,
    searchMerchants,
    clearSelectedMerchant,
  } = useMerchants();

  const [activeTab, setActiveTab] = useState<ViewTab>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WanderingMerchant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMerchantDetail, setShowMerchantDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<'inventory' | 'schedule' | 'trust'>('inventory');

  // Load initial data
  useEffect(() => {
    fetchAvailableMerchants();
    fetchAllMerchants();
    if (currentLocation) {
      fetchUpcomingMerchants(currentLocation);
    }
  }, [fetchAvailableMerchants, fetchAllMerchants, fetchUpcomingMerchants, currentLocation]);

  // Search handler with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchMerchants(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMerchants]);

  const handleMerchantClick = useCallback(
    async (merchant: WanderingMerchant) => {
      await Promise.all([
        fetchMerchantDetails(merchant.id),
        fetchMerchantState(merchant.id),
        fetchMerchantInventory(merchant.id),
        fetchMerchantTrust(merchant.id),
      ]);
      setShowMerchantDetail(true);
      setDetailTab('inventory');
    },
    [fetchMerchantDetails, fetchMerchantState, fetchMerchantInventory, fetchMerchantTrust]
  );

  const handleCloseMerchantDetail = useCallback(() => {
    setShowMerchantDetail(false);
    clearSelectedMerchant();
  }, [clearSelectedMerchant]);

  const handleDiscover = useCallback(
    async (merchantId: string) => {
      const result = await discoverMerchant(merchantId);
      if (result.success) {
        success('Merchant Discovered!', result.message);
        fetchAvailableMerchants();
      } else {
        showError('Discovery Failed', result.message);
      }
    },
    [discoverMerchant, fetchAvailableMerchants, success, showError]
  );

  const handleBuyItem = useCallback(
    async (item: any) => {
      if (!selectedMerchant) {
        return { success: false, message: 'No merchant selected' };
      }

      const result = await buyItem(selectedMerchant.id, item.itemId, 1);
      return { success: result.success, message: result.message };
    },
    [selectedMerchant, buyItem]
  );

  // Get merchants to display based on active tab and search
  const getDisplayMerchants = () => {
    if (searchQuery.trim()) {
      return searchResults;
    }

    switch (activeTab) {
      case 'available':
        // Map available merchant states to full merchant data
        return availableMerchants
          .map((state) => merchants.find((m) => m.id === state.merchantId))
          .filter((m): m is WanderingMerchant => m !== undefined);
      case 'all':
        return merchants;
      default:
        return [];
    }
  };

  const displayMerchants = getDisplayMerchants();

  // Get state for a merchant
  const getMerchantStateById = (merchantId: string) => {
    return availableMerchants.find((s) => s.merchantId === merchantId);
  };

  if (!currentCharacter) {
    return (
      <div className="text-center py-12 text-desert-sand">
        Loading character...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-western text-gold-light flex items-center gap-3">
            <span>🛒</span>
            Wandering Merchants
          </h1>
          <p className="text-desert-stone mt-1">
            Traveling traders with exotic goods and rare items
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search merchants or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 pl-10 bg-wood-dark border border-wood-grain rounded-lg
                text-desert-sand placeholder-desert-stone focus:outline-none focus:border-gold-light"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-desert-stone">
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-wood-grain/30 pb-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'available'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          Available Now ({availableMerchants.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'all'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          All Merchants ({merchants.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          Coming Soon
        </button>
      </div>

      {/* Loading State */}
      {isLoading && !showMerchantDetail && (
        <div aria-busy="true" aria-live="polite">
          <CardGridSkeleton count={6} columns={3} />
        </div>
      )}

      {/* Search Results Info */}
      {searchQuery.trim() && !isSearching && (
        <p className="text-desert-stone">
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
        </p>
      )}

      {/* Upcoming Merchants Tab */}
      {activeTab === 'upcoming' && !isLoading && (
        <UpcomingMerchantsList
          upcoming={upcomingMerchants}
          locationName={currentLocation || 'your location'}
        />
      )}

      {/* Merchants Grid */}
      {activeTab !== 'upcoming' && !isLoading && displayMerchants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayMerchants.map((merchant) => (
            <MerchantCard
              key={merchant.id}
              merchant={merchant}
              state={getMerchantStateById(merchant.id)}
              onClick={() => handleMerchantClick(merchant)}
            />
          ))}
        </div>
      )}

      {/* Empty States */}
      {activeTab !== 'upcoming' && !isLoading && displayMerchants.length === 0 && (
        <EmptyState
          icon={activeTab === 'available' ? '🏜️' : '🔍'}
          title={
            searchQuery.trim()
              ? 'No Merchants Found'
              : activeTab === 'available'
              ? 'No Merchants Available'
              : 'No Merchants Yet'
          }
          description={
            searchQuery.trim()
              ? `No merchants or items match "${searchQuery}"`
              : activeTab === 'available'
              ? 'No traveling merchants are open for trade right now. Check the schedule or try again later.'
              : 'Wandering merchants have not been discovered yet.'
          }
          variant={searchQuery.trim() ? 'search' : 'default'}
          size="lg"
          actionText={activeTab === 'available' ? 'View All Merchants' : undefined}
          onAction={activeTab === 'available' ? () => setActiveTab('all') : undefined}
        />
      )}

      {/* Merchant Detail Modal */}
      {showMerchantDetail && selectedMerchant && (
        <Modal
          isOpen={true}
          onClose={handleCloseMerchantDetail}
          title={selectedMerchant.name}
          size="xl"
        >
          <div className="space-y-6">
            {/* Merchant Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-wood-grain/30">
              <div className="text-5xl">{selectedMerchant.barter ? '🔄' : '🛒'}</div>
              <div className="flex-1">
                <p className="text-desert-stone">{selectedMerchant.title}</p>
                <p className="text-sm text-desert-sand mt-1">{selectedMerchant.description}</p>
                {merchantState && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg">📍</span>
                    <span className="text-sm text-desert-sand">
                      Currently at {merchantState.currentLocationName}
                    </span>
                    {merchantState.isAvailableForTrade ? (
                      <span className="px-2 py-0.5 text-xs bg-green-600/80 text-white rounded-full">
                        Open
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-gray-600/80 text-white rounded-full">
                        Closed
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex gap-2 border-b border-wood-grain/30 pb-2">
              <button
                onClick={() => setDetailTab('inventory')}
                className={`px-3 py-1.5 rounded-t-lg font-serif text-sm transition-colors ${
                  detailTab === 'inventory'
                    ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
                    : 'text-desert-stone hover:text-desert-sand'
                }`}
              >
                Inventory
              </button>
              <button
                onClick={() => setDetailTab('schedule')}
                className={`px-3 py-1.5 rounded-t-lg font-serif text-sm transition-colors ${
                  detailTab === 'schedule'
                    ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
                    : 'text-desert-stone hover:text-desert-sand'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setDetailTab('trust')}
                className={`px-3 py-1.5 rounded-t-lg font-serif text-sm transition-colors ${
                  detailTab === 'trust'
                    ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
                    : 'text-desert-stone hover:text-desert-sand'
                }`}
              >
                Trust & Benefits
              </button>
            </div>

            {/* Tab Content */}
            {detailTab === 'inventory' && (
              <MerchantInventory
                inventory={merchantInventory}
                playerTrustLevel={trustInfo?.trustLevel || 0}
                onBuyItem={handleBuyItem}
                isLoading={isLoading}
              />
            )}

            {detailTab === 'schedule' && (
              <MerchantSchedule
                route={selectedMerchant.route}
                currentStop={merchantState?.currentStop}
                nextStop={merchantState?.nextStop}
              />
            )}

            {detailTab === 'trust' && trustInfo && (
              <div className="space-y-6">
                <TrustMeter
                  currentLevel={trustInfo.trustLevel}
                  currentStatus={trustInfo.current}
                  nextUnlock={trustInfo.next}
                  unlockedBenefits={trustInfo.unlocked}
                />

                {/* Dialogue Preview */}
                <Card variant="wood" padding="sm">
                  <h4 className="text-sm text-desert-stone mb-2">Merchant Dialogue</h4>
                  <p className="text-desert-sand italic">
                    "{selectedMerchant.dialogue.greeting[0]}"
                  </p>
                </Card>

                {/* Special Features */}
                {selectedMerchant.specialFeatures.length > 0 && (
                  <div>
                    <h4 className="text-sm text-desert-stone mb-2">Special Features</h4>
                    <div className="space-y-2">
                      {selectedMerchant.specialFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-wood-dark/50 rounded"
                        >
                          <span className="text-gold-light">★</span>
                          <span className="text-sm text-desert-sand">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MerchantsPage;
