/**
 * LocationGraveyard Component
 * Displays gravestones at a location with "Souls Lost Here" counter
 *
 * User preference: Cities have graveyard districts, option to view players who died
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Gravestone, InheritanceClaimResult } from '@desperados/shared';
import { GravestoneCard } from '@/components/gravestone/GravestoneCard';
import { GravestoneVisit } from '@/components/gravestone/GravestoneVisit';
import { gravestoneService } from '@/services/gravestone.service';
import { Tooltip } from '@/components/ui';

interface LocationGraveyardProps {
  /** Location ID */
  locationId: string;
  /** Location name for display */
  locationName: string;
  /** Whether the current user can claim gravestones here */
  canClaim?: boolean;
  /** Maximum gravestones to show in preview */
  previewLimit?: number;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Souls Lost Counter component
 */
const SoulsLostCounter: React.FC<{
  count: number;
  onClick: () => void;
}> = ({ count, onClick }) => (
  <Tooltip content="View the fallen souls at this location">
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2
        bg-gray-900/60 hover:bg-gray-900/80
        border border-gray-700/50 hover:border-red-900/50
        rounded-lg transition-all duration-200
        group
      `}
    >
      <span className="text-xl group-hover:animate-pulse">💀</span>
      <span className="text-desert-sand/70 text-sm">
        <span className="text-red-400 font-bold">{count}</span> souls lost here
      </span>
    </button>
  </Tooltip>
);

export const LocationGraveyard: React.FC<LocationGraveyardProps> = ({
  locationId,
  locationName,
  canClaim = false,
  previewLimit = 3,
  compact = false,
  className = '',
}) => {
  const [gravestones, setGravestones] = useState<Gravestone[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedGravestone, setSelectedGravestone] = useState<Gravestone | null>(null);

  // Fetch gravestones at this location
  const fetchGravestones = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await gravestoneService.getGravestonesAtLocation(
        locationId,
        isExpanded ? 20 : previewLimit
      );

      if (result.success) {
        setGravestones(result.gravestones);
        setTotalCount(result.total);
      } else {
        setError(result.message || 'Failed to load gravestones');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load gravestones');
    } finally {
      setIsLoading(false);
    }
  }, [locationId, isExpanded, previewLimit]);

  // Fetch on mount and when expanded changes
  useEffect(() => {
    fetchGravestones();
  }, [fetchGravestones]);

  // Handle gravestone selection
  const handleSelectGravestone = useCallback((gravestone: Gravestone) => {
    setSelectedGravestone(gravestone);
  }, []);

  // Handle close visit
  const handleCloseVisit = useCallback(() => {
    setSelectedGravestone(null);
    fetchGravestones(); // Refresh to update claimed status
  }, [fetchGravestones]);

  // Handle claim inheritance
  const handleClaimInheritance = useCallback(async (): Promise<InheritanceClaimResult> => {
    if (!selectedGravestone) {
      return {
        success: false,
        tier: 'meager' as any,
        goldReceived: 0,
        heirlooms: [],
        skillBoosts: {},
        destinyHand: [],
        message: 'No gravestone selected',
      };
    }

    try {
      return await gravestoneService.claimInheritance(selectedGravestone._id);
    } catch (err: any) {
      return {
        success: false,
        tier: 'meager' as any,
        goldReceived: 0,
        heirlooms: [],
        skillBoosts: {},
        destinyHand: [],
        message: err.message || 'Failed to claim inheritance',
      };
    }
  }, [selectedGravestone]);

  // Toggle expanded view
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Don't render if no gravestones
  if (totalCount === 0 && !isLoading) {
    return null;
  }

  // Compact view - just the counter
  if (compact) {
    return (
      <div className={className}>
        <SoulsLostCounter count={totalCount} onClick={toggleExpanded} />

        {/* Expanded modal */}
        {isExpanded && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto bg-wood-darker border-2 border-gray-700 rounded-lg">
              {/* Header */}
              <div className="sticky top-0 z-10 p-4 border-b border-gray-700 bg-wood-dark flex items-center justify-between">
                <h3 className="font-western text-xl text-gold-light">
                  💀 Souls Lost at {locationName}
                </h3>
                <button
                  onClick={toggleExpanded}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Gravestones grid */}
              <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gravestones.map((gravestone) => (
                  <GravestoneCard
                    key={gravestone._id}
                    gravestone={gravestone}
                    canClaim={canClaim && !gravestone.claimed}
                    onVisit={handleSelectGravestone}
                    compact
                  />
                ))}
              </div>

              {/* Load more */}
              {gravestones.length < totalCount && (
                <div className="p-4 text-center border-t border-gray-700">
                  <span className="text-desert-sand/50 text-sm">
                    Showing {gravestones.length} of {totalCount} gravestones
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visit modal */}
        {selectedGravestone && (
          <GravestoneVisit
            isOpen={!!selectedGravestone}
            gravestone={selectedGravestone}
            canClaim={canClaim && !selectedGravestone.claimed}
            onClose={handleCloseVisit}
            onClaim={handleClaimInheritance}
          />
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className={`bg-gray-900/60 rounded-lg border border-gray-700/50 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700/30 flex items-center justify-between">
        <h3 className="font-western text-lg text-gold-light flex items-center gap-2">
          <span>💀</span>
          <span>The Fallen</span>
        </h3>
        <span className="text-sm text-red-400/70">
          {totalCount} souls lost here
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading && (
          <div className="text-center py-4">
            <span className="text-desert-sand/50">Loading gravestones...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && gravestones.length > 0 && (
          <div className="space-y-2">
            {gravestones.map((gravestone) => (
              <GravestoneCard
                key={gravestone._id}
                gravestone={gravestone}
                canClaim={canClaim && !gravestone.claimed}
                onVisit={handleSelectGravestone}
                compact
              />
            ))}
          </div>
        )}

        {/* View more / collapse */}
        {totalCount > previewLimit && (
          <button
            onClick={toggleExpanded}
            className="w-full mt-3 py-2 text-sm text-desert-sand/70 hover:text-gold-light transition-colors border border-gray-700/30 hover:border-gray-600/50 rounded"
          >
            {isExpanded ? 'Show Less' : `View All ${totalCount} Gravestones`}
          </button>
        )}
      </div>

      {/* Visit modal */}
      {selectedGravestone && (
        <GravestoneVisit
          isOpen={!!selectedGravestone}
          gravestone={selectedGravestone}
          canClaim={canClaim && !selectedGravestone.claimed}
          onClose={handleCloseVisit}
          onClaim={handleClaimInheritance}
        />
      )}
    </div>
  );
};

export default LocationGraveyard;
