/**
 * PropertyListingsPage
 * Browse and purchase available properties
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useProperties } from '@/hooks/useProperties';
import { useToast } from '@/store/useToastStore';
import { Card, Button, Modal, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { PropertyCard } from '@/components/properties';
import { formatDollars } from '@/utils/format';
import { PropertyType, LOAN_CONFIG, type PropertyListing } from '@desperados/shared';

/**
 * Property type filter options
 */
const PROPERTY_TYPES: { value: PropertyType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All Properties', icon: '🏠' },
  { value: PropertyType.RANCH, label: 'Ranches', icon: '🌾' },
  { value: PropertyType.SHOP, label: 'Shops', icon: '🏪' },
  { value: PropertyType.WORKSHOP, label: 'Workshops', icon: '🔨' },
  { value: PropertyType.HOMESTEAD, label: 'Homesteads', icon: '🏡' },
  { value: PropertyType.MINE, label: 'Mines', icon: '⛏️' },
  { value: PropertyType.SALOON, label: 'Saloons', icon: '🍺' },
  { value: PropertyType.STABLE, label: 'Stables', icon: '🐴' },
];

/**
 * Purchase modal component
 */
const PurchaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  listing: PropertyListing | null;
  onPurchase: (useLoan: boolean, downPayment?: number) => void;
  characterGold: number;
  isPurchasing: boolean;
}> = ({ isOpen, onClose, listing, onPurchase, characterGold, isPurchasing }) => {
  const [useLoan, setUseLoan] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(LOAN_CONFIG.MIN_DOWN_PAYMENT);

  if (!listing) return null;

  const canBuyOutright = characterGold >= listing.price;
  const allowsLoan = listing.requirements?.allowsLoan !== false;

  const downPaymentAmount = Math.ceil((listing.price * downPaymentPercent) / 100);
  const loanAmount = listing.price - downPaymentAmount;
  const canAffordDownPayment = characterGold >= downPaymentAmount;

  // Estimate monthly payment (simple calculation)
  const estimatedInterest = 10; // Middle of range
  const totalWithInterest = loanAmount * (1 + estimatedInterest / 100);
  const weeklyPayment = Math.ceil(totalWithInterest / 52);

  const handlePurchase = () => {
    if (useLoan) {
      onPurchase(true, downPaymentPercent);
    } else {
      onPurchase(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Purchase ${listing.name}`} size="lg">
      <div className="space-y-6">
        {/* Property summary */}
        <Card variant="leather" className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">
              {listing.propertyType === 'ranch' && '🏠'}
              {listing.propertyType === 'shop' && '🏪'}
              {listing.propertyType === 'workshop' && '🔨'}
              {listing.propertyType === 'homestead' && '🏡'}
              {listing.propertyType === 'mine' && '⛏️'}
              {listing.propertyType === 'saloon' && '🍺'}
              {listing.propertyType === 'stable' && '🐴'}
            </span>
            <div>
              <h3 className="font-western text-lg text-desert-sand">{listing.name}</h3>
              <p className="text-sm text-desert-stone">{listing.locationName}</p>
              <p className="text-gold-light font-western text-xl mt-1">
                {formatDollars(listing.price)}
              </p>
            </div>
          </div>
        </Card>

        {/* Your funds */}
        <div className="flex justify-between items-center p-3 bg-wood-dark/50 rounded-lg">
          <span className="text-desert-stone">Your Dollars:</span>
          <span className="text-gold-light font-western text-lg">
            {formatDollars(characterGold)}
          </span>
        </div>

        {/* Payment method selection */}
        <div className="space-y-3">
          <p className="text-desert-sand font-semibold">Payment Method</p>

          {/* Cash option */}
          <button
            onClick={() => setUseLoan(false)}
            disabled={!canBuyOutright}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              !useLoan
                ? 'border-gold-light bg-gold-dark/20'
                : 'border-wood-grain/30 hover:border-wood-grain/50'
            } ${!canBuyOutright ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-western text-desert-sand">Pay Cash</p>
                <p className="text-xs text-desert-stone">
                  Full payment - no interest
                </p>
              </div>
              <span
                className={`font-western ${
                  canBuyOutright ? 'text-gold-light' : 'text-red-400'
                }`}
              >
                {formatDollars(listing.price)}
              </span>
            </div>
          </button>

          {/* Loan option */}
          {allowsLoan && (
            <button
              onClick={() => setUseLoan(true)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                useLoan
                  ? 'border-gold-light bg-gold-dark/20'
                  : 'border-wood-grain/30 hover:border-wood-grain/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-western text-desert-sand">Bank Loan</p>
                  <p className="text-xs text-desert-stone">
                    Down payment + weekly installments
                  </p>
                </div>
                <span className="text-gold-light/70 font-western">
                  {LOAN_CONFIG.MIN_INTEREST_RATE}-{LOAN_CONFIG.MAX_INTEREST_RATE}% interest
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Loan configuration */}
        {useLoan && (
          <Card variant="leather" className="p-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-desert-stone">Down Payment:</span>
                <span className="text-gold-light">{downPaymentPercent}%</span>
              </div>
              <input
                type="range"
                min={LOAN_CONFIG.MIN_DOWN_PAYMENT}
                max={LOAN_CONFIG.MAX_DOWN_PAYMENT}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
                className="w-full accent-gold-light"
              />
              <div className="flex justify-between text-xs text-desert-stone mt-1">
                <span>{LOAN_CONFIG.MIN_DOWN_PAYMENT}%</span>
                <span>{LOAN_CONFIG.MAX_DOWN_PAYMENT}%</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-desert-stone">Down Payment:</span>
                <span
                  className={canAffordDownPayment ? 'text-gold-light' : 'text-red-400'}
                >
                  {formatDollars(downPaymentAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-desert-stone">Loan Amount:</span>
                <span className="text-desert-sand">{formatDollars(loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-desert-stone">Est. Weekly Payment:</span>
                <span className="text-gold-light">{formatDollars(weeklyPayment)}</span>
              </div>
            </div>

            <p className="text-xs text-desert-stone italic">
              * Interest rate varies based on your reputation (
              {LOAN_CONFIG.MIN_INTEREST_RATE}-{LOAN_CONFIG.MAX_INTEREST_RATE}%)
            </p>
          </Card>
        )}

        {/* Requirements check */}
        {listing.requirements && (
          <Card variant="leather" className="p-4">
            <h4 className="text-sm font-western text-desert-sand mb-2">Requirements</h4>
            <ul className="space-y-1 text-sm">
              {listing.requirements.minLevel && (
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-desert-stone">
                    Level {listing.requirements.minLevel}+
                  </span>
                </li>
              )}
              {listing.requirements.minReputation && (
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-desert-stone">
                    Reputation {listing.requirements.minReputation}+
                  </span>
                </li>
              )}
              {listing.requirements.requiredFaction && (
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-desert-stone">
                    {listing.requirements.requiredFaction} faction (
                    {listing.requirements.factionStanding})
                  </span>
                </li>
              )}
            </ul>
          </Card>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={handlePurchase}
            disabled={
              isPurchasing ||
              (useLoan ? !canAffordDownPayment : !canBuyOutright)
            }
            isLoading={isPurchasing}
            loadingText="Processing..."
          >
            {useLoan
              ? `Purchase with ${formatDollars(downPaymentAmount)} Down`
              : `Purchase for ${formatDollars(listing.price)}`}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose} disabled={isPurchasing}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/**
 * PropertyListingsPage component
 */
export const PropertyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const {
    listings,
    foreclosedListings,
    isLoading,
    error,
    fetchListings,
    fetchForeclosedListings,
    purchaseProperty,
  } = useProperties();
  const { success, error: showError } = useToast();

  const [selectedType, setSelectedType] = useState<PropertyType | 'all'>('all');
  const [showForeclosed, setShowForeclosed] = useState(false);
  const [selectedListing, setSelectedListing] = useState<PropertyListing | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Fetch listings on mount and filter change
  useEffect(() => {
    if (showForeclosed) {
      fetchForeclosedListings();
    } else {
      fetchListings(selectedType === 'all' ? undefined : { type: selectedType });
    }
  }, [selectedType, showForeclosed, fetchListings, fetchForeclosedListings]);

  const handlePurchaseClick = (listing: PropertyListing) => {
    setSelectedListing(listing);
    setShowPurchaseModal(true);
  };

  const handlePurchase = async (useLoan: boolean, downPayment?: number) => {
    if (!selectedListing) return;

    setIsPurchasing(true);
    const result = await purchaseProperty(selectedListing._id, useLoan, downPayment);

    if (result.success) {
      success('Property Purchased!', result.message);
      setShowPurchaseModal(false);
      setSelectedListing(null);
      // Refresh listings
      if (showForeclosed) {
        fetchForeclosedListings();
      } else {
        fetchListings(selectedType === 'all' ? undefined : { type: selectedType });
      }
    } else {
      showError('Purchase Failed', result.message);
    }

    setIsPurchasing(false);
  };

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

  const displayListings = showForeclosed ? foreclosedListings : listings;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-western text-wood-dark text-shadow-gold mb-2">
            Property Listings
          </h1>
          <p className="text-lg text-wood-grain">
            Invest in the frontier's finest real estate
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
            onClick={() => navigate('/game/properties')}
          >
            My Properties
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowForeclosed(false)}
          className={`px-4 py-2 rounded-lg font-serif transition-colors ${
            !showForeclosed
              ? 'bg-gold-light text-wood-dark'
              : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
          }`}
        >
          Available Properties
        </button>
        <button
          onClick={() => setShowForeclosed(true)}
          className={`px-4 py-2 rounded-lg font-serif transition-colors flex items-center gap-2 ${
            showForeclosed
              ? 'bg-orange-500 text-wood-dark'
              : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-orange-500/50'
          }`}
        >
          <span>🏚️</span>
          Foreclosed (Discounted!)
        </button>
      </div>

      {/* Property type filter */}
      {!showForeclosed && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-lg font-serif whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedType === type.value
                  ? 'bg-gold-light text-wood-dark'
                  : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div aria-busy="true" aria-live="polite">
          <CardGridSkeleton count={9} columns={3} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && displayListings.length === 0 && (
        <EmptyState
          icon={showForeclosed ? '🏚️' : '🏠'}
          title={showForeclosed ? 'No Foreclosed Properties' : 'No Properties Available'}
          description={
            showForeclosed
              ? 'There are no foreclosed properties available at this time. Check back later!'
              : 'No properties match your filters. Try changing your selection.'
          }
          variant="default"
          size="lg"
        />
      )}

      {/* Property grid */}
      {!isLoading && displayListings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayListings.map((listing) => (
            <PropertyCard
              key={listing._id}
              property={listing}
              variant={showForeclosed ? 'foreclosed' : 'listing'}
              onPurchase={() => handlePurchaseClick(listing)}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Purchase modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
        onPurchase={handlePurchase}
        characterGold={currentCharacter.gold}
        isPurchasing={isPurchasing}
      />
    </div>
  );
};

export default PropertyListingsPage;
