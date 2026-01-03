/**
 * SaloonActivityZones Component
 * Grid layout organizing saloon activities into themed zones
 *
 * Part of the Saloon Location UI Redesign.
 * Inspired by Darkest Dungeon's zone-based activity layout.
 */

import React from 'react';
import { Beer, Users, Bath, Sparkles } from 'lucide-react';
import { WesternPanel } from '@/components/ui/WesternPanel';
import { TavernActivity } from '@/hooks/useTavern';
import { SALOON_BONUSES } from '@shared/constants/tavern.constants';

/**
 * Zone types for activity grouping
 */
export type ActivityZoneType = 'bar' | 'gambling' | 'rest';

/**
 * Activity zone configuration
 */
interface ZoneConfig {
  id: ActivityZoneType;
  title: string;
  icon: React.ReactNode;
  activityIds: string[];
  description: string;
}

/**
 * Zone configurations
 */
const ZONE_CONFIGS: ZoneConfig[] = [
  {
    id: 'bar',
    title: 'The Bar',
    icon: <Beer className="w-5 h-5" />,
    activityIds: ['tavern_drink', 'tavern_socialize'],
    description: 'Drinks and conversation'
  },
  {
    id: 'gambling',
    title: 'Gambling Corner',
    icon: <span className="text-lg">🃏</span>,
    activityIds: ['tavern_cards'],
    description: 'Cards and games of chance'
  },
  {
    id: 'rest',
    title: 'Rest Area',
    icon: <Bath className="w-5 h-5" />,
    activityIds: ['tavern_bath', 'tavern_rest'],
    description: 'Relaxation and recovery'
  }
];

/**
 * SaloonActivityZones props
 */
export interface SaloonActivityZonesProps {
  /** Location ID for bonus lookup */
  locationId: string;
  /** Activities to display */
  activities: TavernActivity[];
  /** Computed theme (unused but passed for future use) */
  theme: { panelClass: string };
  /** Handler for performing activity */
  onPerformActivity: (activityId: string) => void;
  /** Whether activity is currently being performed */
  isPerforming: boolean;
  /** Format cooldown time for display */
  formatCooldown: (ms: number) => string;
  /** Additional class names */
  className?: string;
  /** Render slot for gambling zone (TavernTables) */
  gamblingSlot?: React.ReactNode;
  /** Render slot for NPCs zone */
  npcSlot?: React.ReactNode;
}

/**
 * Activity Card within a zone
 */
interface ActivityCardProps {
  activity: TavernActivity;
  locationBonus: number;
  onPerform: () => void;
  isPerforming: boolean;
  formatCooldown: (ms: number) => string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  locationBonus,
  onPerform,
  isPerforming,
  formatCooldown
}) => {
  const canPerform = !activity.onCooldown && activity.canAfford && activity.hasEnergy && !isPerforming;
  const totalBonus = activity.regenBonus + locationBonus;

  return (
    <button
      onClick={onPerform}
      disabled={!canPerform}
      className={`
        w-full text-left p-3 rounded-lg border transition-all
        ${canPerform
          ? 'saloon-activity-available bg-wood-dark/40 border-gold-dark/30 hover:bg-wood-dark/60 hover:border-gold-medium/50 cursor-pointer'
          : activity.onCooldown
            ? 'saloon-activity-cooldown bg-wood-darker/30 border-wood-dark/30 cursor-not-allowed'
            : 'saloon-activity-locked bg-wood-darker/20 border-wood-darker/30 cursor-not-allowed'
        }
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`font-medium ${canPerform ? 'text-desert-sand' : 'text-desert-stone'}`}>
          {activity.name}
        </span>
        <span className={`text-sm ${canPerform ? 'text-green-400' : 'text-desert-stone'}`}>
          +{totalBonus}%
          {locationBonus > 0 && (
            <span className="text-gold-light ml-1">(+{locationBonus}%)</span>
          )}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-desert-stone">
          {activity.cost > 0 ? `$${activity.cost}` : 'Free'}
          {activity.energyCost > 0 && ` • ${activity.energyCost}⚡`}
        </span>

        {activity.onCooldown ? (
          <span className="text-amber-400 text-xs">
            {formatCooldown(activity.cooldownRemainingMs)}
          </span>
        ) : !activity.canAfford ? (
          <span className="text-red-400 text-xs">Need ${activity.cost}</span>
        ) : !activity.hasEnergy ? (
          <span className="text-red-400 text-xs">Need energy</span>
        ) : (
          <span className="text-green-400 text-xs">Available</span>
        )}
      </div>
    </button>
  );
};

/**
 * Zone Panel Component
 */
interface ZonePanelProps {
  config: ZoneConfig;
  activities: TavernActivity[];
  locationBonuses: Record<string, number>;
  onPerformActivity: (activityId: string) => void;
  isPerforming: boolean;
  formatCooldown: (ms: number) => string;
  hasBonus: boolean;
  children?: React.ReactNode;
}

const ZonePanel: React.FC<ZonePanelProps> = ({
  config,
  activities,
  locationBonuses,
  onPerformActivity,
  isPerforming,
  formatCooldown,
  hasBonus,
  children
}) => {
  const zoneActivities = activities.filter(a => config.activityIds.includes(a.id));
  const zoneBonusActivities = config.activityIds.filter(id => locationBonuses[id]);

  return (
    <WesternPanel
      variant="wood"
      padding="md"
      className="saloon-zone"
    >
      {/* Zone Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gold-dark/20">
        <div className="flex items-center gap-2">
          <span className="text-gold-light">{config.icon}</span>
          <h3 className="font-western text-gold-light">{config.title}</h3>
        </div>
        {hasBonus && zoneBonusActivities.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-gold-dark/20 text-gold-light text-xs">
            <Sparkles className="w-3 h-3" />
            <span>House Specialty</span>
          </div>
        )}
      </div>

      <p className="text-sm text-desert-stone mb-3">{config.description}</p>

      {/* Activity Cards */}
      <div className="space-y-2">
        {zoneActivities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            locationBonus={Math.round((locationBonuses[activity.id] || 0) * 100)}
            onPerform={() => onPerformActivity(activity.id)}
            isPerforming={isPerforming}
            formatCooldown={formatCooldown}
          />
        ))}
      </div>

      {/* Additional slot content (e.g., TavernTables) */}
      {children && (
        <div className="mt-4 pt-3 border-t border-gold-dark/20">
          {children}
        </div>
      )}
    </WesternPanel>
  );
};

/**
 * SaloonActivityZones Component
 */
export const SaloonActivityZones: React.FC<SaloonActivityZonesProps> = ({
  locationId,
  activities,
  onPerformActivity,
  isPerforming,
  formatCooldown,
  className = '',
  gamblingSlot,
  npcSlot
}) => {
  // Get location-specific bonuses (cast to correct type)
  const rawBonuses = SALOON_BONUSES[locationId];
  const locationBonuses: Record<string, number> = rawBonuses
    ? Object.fromEntries(
        Object.entries(rawBonuses).filter((entry): entry is [string, number] => entry[1] !== undefined)
      )
    : {};
  const hasBonuses = Object.keys(locationBonuses).length > 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Left Column: Bar + Rest */}
      <div className="space-y-4">
        <ZonePanel
          config={ZONE_CONFIGS[0]} // Bar
          activities={activities}
          locationBonuses={locationBonuses}
          onPerformActivity={onPerformActivity}
          isPerforming={isPerforming}
          formatCooldown={formatCooldown}
          hasBonus={hasBonuses}
        />
        <ZonePanel
          config={ZONE_CONFIGS[2]} // Rest
          activities={activities}
          locationBonuses={locationBonuses}
          onPerformActivity={onPerformActivity}
          isPerforming={isPerforming}
          formatCooldown={formatCooldown}
          hasBonus={hasBonuses}
        />
      </div>

      {/* Right Column: Gambling + NPCs */}
      <div className="space-y-4">
        <ZonePanel
          config={ZONE_CONFIGS[1]} // Gambling
          activities={activities}
          locationBonuses={locationBonuses}
          onPerformActivity={onPerformActivity}
          isPerforming={isPerforming}
          formatCooldown={formatCooldown}
          hasBonus={hasBonuses}
        >
          {gamblingSlot}
        </ZonePanel>

        {/* NPC Zone */}
        {npcSlot && (
          <WesternPanel
            variant="wood"
            padding="md"
            className="saloon-zone"
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gold-dark/20">
              <Users className="w-5 h-5 text-gold-light" />
              <h3 className="font-western text-gold-light">People Here</h3>
            </div>
            {npcSlot}
          </WesternPanel>
        )}
      </div>
    </div>
  );
};

export default SaloonActivityZones;
