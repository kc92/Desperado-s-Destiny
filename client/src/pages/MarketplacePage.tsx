/**
 * MarketplacePage
 * The Frontier Exchange - Player-to-player marketplace
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useMarketplace, MarketListing, PriceHistory, MarketFilters as Filters } from '@/hooks/useMarketplace';
import { useShop, InventoryItemWithDetails } from '@/hooks/useShop';
import { useToast } from '@/store/useToastStore';
import { Card, Button, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import {
  MarketListingCard,
  ListingDetailsModal,
  CreateListingModal,
  PlaceBidModal,
  CategorySidebar,
  MarketFilters,
  MyListings,
  MyBids,
  TransactionHistory,
} from '@/components/marketplace';
import { formatGold } from '@/utils/format';

// Tab types
type MarketTab = 'browse' | 'my-listings' | 'my-bids' | 'history';

export const MarketplacePage: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const {
    listings,
    myListings,
    myBids,
    transactions,
    categories,
    pagination,
    isLoading,
    error,
    fetchListings,
    fetchListing,
    fetchMyListings,
    fetchMyBids,
    fetchTransactions,
    fetchCategories,
    createListing,
    placeBid,
    buyNow,
    cancelListing,
    updateListingPrice,
    getPriceHistory,
    clearError,
  } = useMarketplace();

  const { inventory, fetchInventory } = useShop();
  const { success, error: showError } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<MarketTab>('browse');
  const [filters, setFilters] = useState<Filters>({ page: 1, limit: 20 });
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [bidListing, setBidListing] = useState<MarketListing | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchListings(filters);
  }, [fetchCategories, fetchListings, filters]);

  // Fetch tab-specific data
  useEffect(() => {
    if (activeTab === 'my-listings') {
      fetchMyListings();
    } else if (activeTab === 'my-bids') {
      fetchMyBids();
    } else if (activeTab === 'history') {
      fetchTransactions();
    }
  }, [activeTab, fetchMyListings, fetchMyBids, fetchTransactions]);

  // Fetch inventory when create modal opens
  useEffect(() => {
    if (showCreateModal) {
      fetchInventory();
    }
  }, [showCreateModal, fetchInventory]);

  // Handle selecting a listing
  const handleSelectListing = useCallback(
    async (listing: MarketListing) => {
      setSelectedListing(listing);
      // Fetch price history for the item
      const history = await getPriceHistory(listing.item.itemId);
      setPriceHistory(history);
    },
    [getPriceHistory]
  );

  // Handle closing listing details
  const handleCloseDetails = useCallback(() => {
    setSelectedListing(null);
    setPriceHistory(null);
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, search: query, page: 1 }));
  }, []);

  // Handle creating a listing
  const handleCreateListing = useCallback(
    async (data: Parameters<typeof createListing>[0]) => {
      setIsProcessing(true);
      const result = await createListing(data);

      if (result.success) {
        success('Listing Created', `Your item has been listed on the marketplace!`);
        setShowCreateModal(false);
        fetchListings(filters);
        fetchMyListings();
      } else {
        showError('Failed to Create Listing', result.message);
      }

      setIsProcessing(false);
      return result;
    },
    [createListing, fetchListings, fetchMyListings, filters, success, showError]
  );

  // Handle placing a bid
  const handlePlaceBid = useCallback(
    async (listing: MarketListing, amount: number) => {
      setIsProcessing(true);
      const result = await placeBid(listing._id, amount);

      if (result.success) {
        success('Bid Placed', `Your bid of ${formatGold(amount)} has been placed!`);
        handleCloseDetails();
        setBidListing(null);
        fetchListings(filters);
        fetchMyBids();
      } else {
        showError('Failed to Place Bid', result.message);
      }

      setIsProcessing(false);
      return result;
    },
    [placeBid, fetchListings, fetchMyBids, filters, success, showError, handleCloseDetails]
  );

  // Handle place bid modal
  const handlePlaceBidModal = useCallback(
    async (listingId: string, amount: number) => {
      setIsProcessing(true);
      const result = await placeBid(listingId, amount);

      if (result.success) {
        success('Bid Placed', `Your bid of ${formatGold(amount)} has been placed!`);
        setBidListing(null);
        fetchListings(filters);
        fetchMyBids();
      } else {
        showError('Failed to Place Bid', result.message);
      }

      setIsProcessing(false);
      return result;
    },
    [placeBid, fetchListings, fetchMyBids, filters, success, showError]
  );

  // Handle buy now
  const handleBuyNow = useCallback(
    async (listing: MarketListing) => {
      setIsProcessing(true);
      const result = await buyNow(listing._id);

      if (result.success) {
        success('Purchase Complete', `You bought ${listing.item.name}!`);
        handleCloseDetails();
        fetchListings(filters);
        fetchTransactions();
      } else {
        showError('Purchase Failed', result.message);
      }

      setIsProcessing(false);
    },
    [buyNow, fetchListings, fetchTransactions, filters, success, showError, handleCloseDetails]
  );

  // Handle cancel listing
  const handleCancelListing = useCallback(
    async (listingId: string) => {
      const result = await cancelListing(listingId);

      if (result.success) {
        success('Listing Cancelled', 'Your item has been returned to your inventory.');
        fetchMyListings();
        fetchListings(filters);
      } else {
        showError('Failed to Cancel', result.message);
      }

      return result;
    },
    [cancelListing, fetchMyListings, fetchListings, filters, success, showError]
  );

  // Handle update listing price
  const handleUpdatePrice = useCallback(
    async (listingId: string, newPrice: number) => {
      const result = await updateListingPrice(listingId, newPrice);

      if (result.success) {
        success('Price Updated', 'Your listing price has been updated.');
        fetchMyListings();
        fetchListings(filters);
      } else {
        showError('Failed to Update Price', result.message);
      }

      return result;
    },
    [updateListingPrice, fetchMyListings, fetchListings, filters, success, showError]
  );

  // Calculate sellable inventory items
  const sellableInventory = useMemo((): InventoryItemWithDetails[] => {
    // Filter out equipped items and quest items
    return inventory.filter(
      (inv) => !inv.item.equipSlot || inv.item.type !== 'quest'
    );
  }, [inventory]);

  if (!currentCharacter) {
    return <div className="text-center py-12 text-desert-sand">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-western text-gold-light flex items-center gap-3">
            <span className="text-4xl">🏪</span>
            The Frontier Exchange
          </h1>
          <p className="text-desert-stone">
            Buy, sell, and trade with other desperados
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-desert-stone">Your Gold</p>
            <p className="text-2xl font-western text-gold-light">
              {formatGold(currentCharacter.gold)}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="mr-2">+</span>
            Sell Item
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-red-300">{error}</p>
          <button onClick={clearError} className="text-red-300 hover:text-red-200">
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-wood-grain/30 pb-2 overflow-x-auto">
        {([
          { id: 'browse', label: 'Browse', icon: '🔍' },
          { id: 'my-listings', label: 'My Listings', icon: '📦' },
          { id: 'my-bids', label: 'My Bids', icon: '🎯' },
          { id: 'history', label: 'History', icon: '📜' },
        ] as { id: MarketTab; label: string; icon: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 rounded-t-lg font-western text-sm uppercase tracking-wider transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-gold-dark/20 text-gold-light border-b-2 border-gold-light -mb-[2px]'
                : 'text-desert-stone hover:text-desert-sand'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Category Filter */}
            <aside className="lg:w-56 flex-shrink-0">
              <Card variant="wood" padding="md" className="sticky top-4">
                <CategorySidebar
                  categories={categories}
                  selectedCategory={filters.category}
                  onCategoryChange={(category) =>
                    setFilters((prev) => ({ ...prev, category, page: 1 }))
                  }
                  isLoading={isLoading}
                />
              </Card>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Filters */}
              <MarketFilters
                categories={categories}
                currentFilters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
                isLoading={isLoading}
              />

              {/* Listings Grid */}
              <div className="mt-6">
                {isLoading && (
                  <div aria-busy="true" aria-live="polite">
                    <CardGridSkeleton count={12} columns={3} />
                  </div>
                )}

                {!isLoading && listings.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {listings.map((listing) => (
                        <MarketListingCard
                          key={listing._id}
                          listing={listing}
                          onSelect={handleSelectListing}
                          onBuyNow={handleBuyNow}
                          onBid={(l) => setBidListing(l)}
                          currentCharacterId={currentCharacter._id}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 mt-8">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              page: Math.max(1, (prev.page || 1) - 1),
                            }))
                          }
                          disabled={pagination.currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-desert-sand">
                          Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              page: Math.min(pagination.totalPages, (prev.page || 1) + 1),
                            }))
                          }
                          disabled={!pagination.hasMore}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {!isLoading && listings.length === 0 && (
                  <EmptyState
                    icon="🏜️"
                    title="No Listings Found"
                    description="The marketplace is empty for your search. Try different filters or check back later!"
                    variant="default"
                    size="lg"
                  />
                )}
              </div>
            </main>
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === 'my-listings' && (
          <MyListings
            listings={myListings}
            onCancel={handleCancelListing}
            onUpdatePrice={handleUpdatePrice}
            onRefresh={fetchMyListings}
            isLoading={isLoading}
          />
        )}

        {/* My Bids Tab */}
        {activeTab === 'my-bids' && (
          <MyBids
            listings={myBids}
            currentCharacterId={currentCharacter._id}
            onViewListing={handleSelectListing}
            onPlaceBid={(l) => setBidListing(l)}
            onRefresh={fetchMyBids}
            isLoading={isLoading}
          />
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <TransactionHistory
            transactions={transactions}
            currentCharacterId={currentCharacter._id}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Listing Details Modal */}
      <ListingDetailsModal
        isOpen={!!selectedListing}
        onClose={handleCloseDetails}
        listing={selectedListing}
        priceHistory={priceHistory}
        onPlaceBid={handlePlaceBid}
        onBuyNow={handleBuyNow}
        currentCharacterId={currentCharacter._id}
        currentGold={currentCharacter.gold}
        isProcessing={isProcessing}
      />

      {/* Place Bid Modal */}
      <PlaceBidModal
        isOpen={!!bidListing}
        onClose={() => setBidListing(null)}
        listing={bidListing}
        currentGold={currentCharacter.gold}
        onPlaceBid={handlePlaceBidModal}
        isProcessing={isProcessing}
      />

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        inventoryItems={sellableInventory}
        onCreateListing={handleCreateListing}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default MarketplacePage;
