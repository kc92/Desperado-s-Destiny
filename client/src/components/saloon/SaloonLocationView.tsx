/**
 * SaloonLocationView Component
 * Main orchestrator for saloon location UI
 *
 * Replaces generic location rendering with immersive saloon experience.
 * Part of the Saloon Location UI Redesign.
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { LocationNPC } from '@shared/types/location.types';
import { useTavern } from '@/hooks/useTavern';
import { WesternPanel } from '@/components/ui/WesternPanel';
import { Button } from '@/components/ui/Button';
import { SaloonHeader } from './SaloonHeader';
import { SaloonAtmosphere } from './SaloonAtmosphere';
import { SaloonActivityZones } from './SaloonActivityZones';
import { SaloonNPCBar } from './SaloonNPCBar';
import { computeSaloonTheme, SaloonTheme } from './SaloonTheme';

/**
 * Check if location type is a saloon type
 */
export function isSaloonLocation(locationType: string): boolean {
  const saloonTypes = ['saloon', 'worker_tavern', 'cantina', 'tavern'];
  return saloonTypes.includes(locationType.toLowerCase());
}

/**
 * Simplified connection data for saloon view
 */
interface SaloonConnection {
  targetId: string;
  targetName?: string;
  travelCost: number;
  isLocked?: boolean;
}

/**
 * Simplified location data for saloon view
 */
export interface SaloonLocationData {
  id: string;
  name: string;
  type: string;
  shortDescription?: string;
  description?: string;
  icon?: string;
  atmosphere?: string;
  dangerLevel: number;
  factionInfluence: {
    settlerAlliance: number;
    nahiCoalition: number;
    frontera: number;
  };
  features?: string[];
  npcs: LocationNPC[];
  connections?: SaloonConnection[];
}

/**
 * SaloonLocationView props
 */
export interface SaloonLocationViewProps {
  /** Location data */
  location: SaloonLocationData;
  /** Handler for refreshing location */
  onRefresh?: () => void;
  /** Handler for traveling to another location */
  onTravel?: (locationId: string) => void;
  /** Handler for NPC interaction */
  onNPCInteract?: (npcId: string) => void;
  /** Handler for going back */
  onBack?: () => void;
  /** Additional class names */
  className?: string;
  /** Slot for gambling tables component */
  gamblingTablesSlot?: React.ReactNode;
}

/**
 * SaloonLocationView Component
 */
export const SaloonLocationView: React.FC<SaloonLocationViewProps> = ({
  location,
  onTravel,
  onNPCInteract,
  onBack,
  className = '',
  gamblingTablesSlot
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Compute theme from location data
  const theme: SaloonTheme = computeSaloonTheme({
    id: location.id,
    type: location.type,
    dangerLevel: location.dangerLevel,
    factionInfluence: location.factionInfluence
  });

  // Tavern activities
  const {
    activities,
    totalRegenBonus,
    inTavernBonusActive,
    isLoading,
    isPerforming,
    error,
    fetchActivities,
    fetchBuffs,
    performActivity,
    formatCooldown,
    clearError
  } = useTavern();

  // Fetch data on mount
  useEffect(() => {
    fetchActivities();
    fetchBuffs();
  }, [fetchActivities, fetchBuffs]);

  // Handle activity performance
  const handlePerformActivity = async (activityId: string) => {
    const result = await performActivity(activityId);
    if (result) {
      setSuccessMessage(result.message);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Check for entertainment feature
  const hasEntertainment = location.features?.some((f: string) =>
    f.toLowerCase().includes('entertainment') || f.toLowerCase().includes('stage')
  );

  // Determine if peak hours (simplified - would need actual game time)
  const isPeakHours = false; // TODO: Hook into game time system

  return (
    <div className={`${theme.panelClass} ${className}`}>
      {/* Header with danger meter and faction indicators */}
      <SaloonHeader
        name={location.name}
        shortDescription={location.shortDescription}
        icon={location.icon}
        dangerLevel={location.dangerLevel}
        factionInfluence={location.factionInfluence}
        theme={theme}
      />

      {/* Atmosphere section */}
      <SaloonAtmosphere
        atmosphere={location.atmosphere}
        locationId={location.id}
        theme={theme}
        hasEntertainment={hasEntertainment}
        isPeakHours={isPeakHours}
        className="mt-4"
      />

      {/* Active buffs summary */}
      {totalRegenBonus > 0 && (
        <WesternPanel
          variant="wood"
          padding="sm"
          className="mt-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-400">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Energy Regeneration Bonus</span>
            </div>
            <div className="text-lg font-bold text-green-400">
              +{totalRegenBonus}%
              {inTavernBonusActive && (
                <span className="text-sm text-gold-light ml-2">(includes in-tavern bonus)</span>
              )}
            </div>
          </div>
        </WesternPanel>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="mt-4 p-3 rounded-lg bg-green-900/30 border border-green-500/30 text-green-400">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-300 hover:text-red-100 ml-2"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="mt-6 flex items-center justify-center py-12 text-desert-stone">
          <div className="animate-spin w-8 h-8 border-2 border-gold-light border-t-transparent rounded-full mr-4" />
          <span className="text-lg">Loading saloon...</span>
        </div>
      ) : (
        /* Activity Zones */
        <SaloonActivityZones
          locationId={location.id}
          activities={activities}
          theme={theme}
          onPerformActivity={handlePerformActivity}
          isPerforming={isPerforming}
          formatCooldown={formatCooldown}
          className="mt-6"
          gamblingSlot={gamblingTablesSlot}
          npcSlot={
            location.npcs && location.npcs.length > 0 ? (
              <SaloonNPCBar
                npcs={location.npcs}
                onInteract={onNPCInteract}
              />
            ) : undefined
          }
        />
      )}

      {/* Travel/Exit options */}
      {(location.connections && location.connections.length > 0) && (
        <WesternPanel
          variant="wood"
          padding="md"
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gold-dark/20">
            <MapPin className="w-5 h-5 text-gold-light" />
            <h3 className="font-western text-gold-light">Nearby Locations</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {onBack && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            {location.connections.map(conn => (
              <Button
                key={conn.targetId}
                variant="secondary"
                size="sm"
                onClick={() => onTravel?.(conn.targetId)}
                disabled={conn.isLocked}
              >
                {conn.targetName || conn.targetId}
                {conn.travelCost > 0 && ` ($${conn.travelCost})`}
              </Button>
            ))}
          </div>
        </WesternPanel>
      )}
    </div>
  );
};

export default SaloonLocationView;
