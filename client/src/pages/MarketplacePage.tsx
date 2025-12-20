/**
 * MarketplacePage
 * The Frontier Exchange - Player-to-player marketplace
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
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
import { formatDollars } from '@/utils/format';
import type { Listing, ListingsFilter } from '@/services/marketplace.service';
import type { PriceHistoryEntry } from '@/services/marketplace.service';
import { marketplaceService } from '@/services/marketplace.service';
// Import old types for component compatibility
import type { MarketListing } from '@/hooks/useMarketplace';

// Tab types
type MarketTab = 'browse' | 'my-listings' | 'my-bids' | 'history';

export const MarketplacePage: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const {
    listings,
    myListings,
    myBids,
    categories,
    pagination,
    purchaseHistory,
    salesHistory,
    isLoading,
    error,
    fetchListings,
    fetchMyListings,
    fetchMyBids,
    fetchCategories,
    fetchPurchaseHistory,
    fetchSalesHistory,
    createListing,
    placeBid,
    buyNow,
    cancelListing,
    updateListing,
    clearError,
  } = useMarketplaceStore();

  const { inventory, fetchInventory } = useShop();
  const { success, error: showError } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<MarketTab>('browse');
  const [filters, setFilters] = useState<ListingsFilter>({ page: 1, limit: 20 });
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [bidListing, setBidListing] = useState<Listing | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[] | null>(null);
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
      fetchPurchaseHistory();
      fetchSalesHistory();
    }
  }, [activeTab, fetchMyListings, fetchMyBids, fetchPurchaseHistory, fetchSalesHistory]);

  // Fetch inventory when create modal opens
  useEffect(() => {
    if (showCreateModal) {
      fetchInventory();
    }
  }, [showCreateModal, fetchInventory]);

  // Combine purchase and sales history into transactions for the TransactionHistory component
  // Map TransactionHistoryEntry to the Transaction type expected by the component
  const transactions = useMemo(() => {
    const mapped = [
      ...purchaseHistory.map(p => ({
        _id: p._id,
        type: 'purchase' as const,
        item: p.item as any, // Types are compatible
        price: p.price,
        buyerId: currentCharacter?._id || '',
        buyerName: currentCharacter?.name || '',
        sellerId: p.otherParty.characterId,
        sellerName: p.otherParty.characterName,
        timestamp: p.timestamp,
        fee: 0, // Fee is already included in purchase price
      })),
      ...salesHistory.map(s => ({
        _id: s._id,
        type: 'sale' as const,
        item: s.item as any, // Types are compatible
        price: s.price,
        buyerId: s.otherParty.characterId,
        buyerName: s.otherParty.characterName,
        sellerId: currentCharacter?._id || '',
        sellerName: currentCharacter?.name || '',
        timestamp: s.timestamp,
        fee: Math.ceil(s.price * 0.05), // Marketplace fee is 5%
      })),
    ];
    return mapped.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [purchaseHistory, salesHistory, currentCharacter]);

  // Handle selecting a listing
  const handleSelectListing = useCallback(
    async (listing: Listing) => {
      setSelectedListing(listing);
      // Fetch price history for the item
      try {
        const history = await marketplaceService.getPriceHistory(listing.item.itemId);
        setPriceHistory(history);
      } catch (error) {
        console.error('Failed to fetch price history:', error);
        setPriceHistory(null);
      }
    },
    []
  );

  // Handle closing listing details
  const handleCloseDetails = useCallback(() => {
    setSelectedListing(null);
    setPriceHistory(null);
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: ListingsFilter) => {
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
      try {
        await createListing(data);
        success('Listing Created', `Your item has been listed on the marketplace!`);
        setShowCreateModal(false);
        fetchListings(filters);
        fetchMyListings();
        setIsProcessing(false);
        return { success: true, message: 'Listing created successfully' };
      } catch (err: any) {
        showError('Failed to Create Listing', err.message || 'An error occurred');
        setIsProcessing(false);
        return { success: false, message: err.message || 'An error occurred' };
      }
    },
    [createListing, fetchListings, fetchMyListings, filters, success, showError]
  );

  // Handle placing a bid
  const handlePlaceBid = useCallback(
    async (listing: Listing, amount: number) => {
      setIsProcessing(true);
      try {
        await placeBid(listing._id, amount);
        success('Bid Placed', `Your bid of ${formatDollars(amount)} has been placed!`);
        handleCloseDetails();
        setBidListing(null);
        fetchListings(filters);
        fetchMyBids();
        setIsProcessing(false);
        return { success: true, message: 'Bid placed successfully' };
      } catch (err: any) {
        showError('Failed to Place Bid', err.message || 'An error occurred');
        setIsProcessing(false);
        return { success: false, message: err.message || 'An error occurred' };
      }
    },
    [placeBid, fetchListings, fetchMyBids, filters, success, showError, handleCloseDetails]
  );

  // Handle place bid modal
  const handlePlaceBidModal = useCallback(
    async (listingId: string, amount: number) => {
      setIsProcessing(true);
      try {
        await placeBid(listingId, amount);
        success('Bid Placed', `Your bid of ${formatDollars(amount)} has been placed!`);
        setBidListing(null);
        fetchListings(filters);
        fetchMyBids();
        setIsProcessing(false);
        return { success: true, message: 'Bid placed successfully' };
      } catch (err: any) {
        showError('Failed to Place Bid', err.message || 'An error occurred');
        setIsProcessing(false);
        return { success: false, message: err.message || 'An error occurred' };
      }
    },
    [placeBid, fetchListings, fetchMyBids, filters, success, showError]
  );

  // Handle buy now
  const handleBuyNow = useCallback(
    async (listing: Listing) => {
      setIsProcessing(true);
      try {
        await buyNow(listing._id);
        success('Purchase Complete', `You bought ${listing.item.name}!`);
        handleCloseDetails();
        fetchListings(filters);
        fetchPurchaseHistory();
        setIsProcessing(false);
      } catch (err: any) {
        showError('Purchase Failed', err.message || 'An error occurred');
        setIsProcessing(false);
      }
    },
    [buyNow, fetchListings, fetchPurchaseHistory, filters, success, showError, handleCloseDetails]
  );

  // Handle cancel listing
  const handleCancelListing = useCallback(
    async (listingId: string) => {
      try {
        await cancelListing(listingId);
        success('Listing Cancelled', 'Your item has been returned to your inventory.');
        fetchMyListings();
        fetchListings(filters);
        return { success: true, message: 'Listing cancelled successfully' };
      } catch (err: any) {
        showError('Failed to Cancel', err.message || 'An error occurred');
        return { success: false, message: err.message || 'An error occurred' };
      }
    },
    [cancelListing, fetchMyListings, fetchListings, filters, success, showError]
  );

  // Handle update listing price
  const handleUpdatePrice = useCallback(
    async (listingId: string, newPrice: number) => {
      try {
        await updateListing(listingId, { buyoutPrice: newPrice });
        success('Price Updated', 'Your listing price has been updated.');
        fetchMyListings();
        fetchListings(filters);
        return { success: true, message: 'Price updated successfully' };
      } catch (err: any) {
        showError('Failed to Update Price', err.message || 'An error occurred');
        return { success: false, message: err.message || 'An error occurred' };
      }
    },
    [updateListing, fetchMyListings, fetchListings, filters, success, showError]
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
            <p className="text-sm text-desert-stone">Your Dollars</p>
            <p className="text-2xl font-western text-gold-light">
              {formatDollars(currentCharacter.gold)}
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
                  categories={categories as any}
                  selectedCategory={filters.category as any}
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
                categories={categories as any}
                currentFilters={filters as any}
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
                          listing={listing as unknown as MarketListing}
                          onSelect={(l) => handleSelectListing(l as unknown as Listing)}
                          onBuyNow={(l) => handleBuyNow(l as unknown as Listing)}
                          onBid={(l) => setBidListing(l as unknown as Listing)}
                          currentCharacterId={currentCharacter._id}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
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
                          disabled={!pagination.hasPrev}
                        >
                          Previous
                        </Button>
                        <span className="text-desert-sand">
                          Page {pagination.page} of {pagination.totalPages}
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
                          disabled={!pagination.hasNext}
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
            listings={myListings as unknown as MarketListing[]}
            onCancel={handleCancelListing}
            onUpdatePrice={handleUpdatePrice}
            onRefresh={fetchMyListings}
            isLoading={isLoading}
          />
        )}

        {/* My Bids Tab */}
        {activeTab === 'my-bids' && (
          <MyBids
            listings={myBids.map(bid => bid.listing) as unknown as MarketListing[]}
            currentCharacterId={currentCharacter._id}
            onViewListing={(l) => handleSelectListing(l as unknown as Listing)}
            onPlaceBid={(l) => setBidListing(l as unknown as Listing)}
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
        listing={selectedListing as unknown as MarketListing}
        priceHistory={priceHistory as any}
        onPlaceBid={(l, amount) => handlePlaceBid(l as unknown as Listing, amount)}
        onBuyNow={(l) => handleBuyNow(l as unknown as Listing)}
        currentCharacterId={currentCharacter._id}
        currentGold={currentCharacter.gold}
        isProcessing={isProcessing}
      />

      {/* Place Bid Modal */}
      <PlaceBidModal
        isOpen={!!bidListing}
        onClose={() => setBidListing(null)}
        listing={bidListing as unknown as MarketListing}
        currentGold={currentCharacter.gold}
        onPlaceBid={handlePlaceBidModal}
        isProcessing={isProcessing}
      />

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        inventoryItems={sellableInventory}
        onCreateListing={handleCreateListing as any}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default MarketplacePage;
