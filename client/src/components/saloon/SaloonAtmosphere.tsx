/**
 * SaloonAtmosphere Component
 * Displays atmospheric text and ambient indicators for saloons
 *
 * Part of the Saloon Location UI Redesign.
 */

import React from 'react';
import { Music, Moon, Sparkles, Star } from 'lucide-react';
import { SaloonTheme } from './SaloonTheme';
import { SALOON_BONUSES } from '@shared/constants/tavern.constants';

/**
 * SaloonAtmosphere props
 */
export interface SaloonAtmosphereProps {
  /** Atmospheric flavor text */
  atmosphere?: string;
  /** Location ID for bonus lookup */
  locationId: string;
  /** Computed theme */
  theme: SaloonTheme;
  /** Whether location has entertainment stage */
  hasEntertainment?: boolean;
  /** Whether it's currently peak hours */
  isPeakHours?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Get activity name from ID for display
 */
function getActivityDisplayName(activityId: string): string {
  switch (activityId) {
    case 'tavern_drink':
      return 'Drinks';
    case 'tavern_socialize':
      return 'Socializing';
    case 'tavern_cards':
      return 'Gambling';
    case 'tavern_bath':
      return 'Baths';
    case 'tavern_rest':
      return 'Rest';
    default:
      return activityId;
  }
}

/**
 * Ambient indicator pill
 */
interface AmbientIndicatorProps {
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
}

const AmbientIndicator: React.FC<AmbientIndicatorProps> = ({ icon, label, highlight }) => (
  <span
    className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm
      ${highlight
        ? 'bg-gold-dark/20 text-gold-light border border-gold-medium/30'
        : 'bg-wood-darker/50 text-desert-stone'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </span>
);

/**
 * SaloonAtmosphere Component
 */
export const SaloonAtmosphere: React.FC<SaloonAtmosphereProps> = ({
  atmosphere,
  locationId,
  theme,
  hasEntertainment = false,
  isPeakHours = false,
  className = ''
}) => {
  // Get location-specific bonuses
  const locationBonuses = SALOON_BONUSES[locationId] || {};
  const bonusEntries = Object.entries(locationBonuses);

  // Don't render if no atmosphere text and no indicators
  if (!atmosphere && !hasEntertainment && !isPeakHours && bonusEntries.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        py-6 px-4 text-center
        border-y border-gold-dark/20
        bg-gradient-to-b ${theme.backgroundGradient}
        ${className}
      `}
    >
      {/* Decorative side borders */}
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gold-dark/30 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gold-dark/30 to-transparent" />

        {/* Atmosphere text */}
        {atmosphere && (
          <p className="text-lg text-desert-sand italic font-serif leading-relaxed px-8 mb-4">
            "{atmosphere}"
          </p>
        )}

        {/* Ambient indicators */}
        <div className="flex flex-wrap justify-center gap-3">
          {hasEntertainment && (
            <AmbientIndicator
              icon={<Music className="w-4 h-4" />}
              label="Live Music"
            />
          )}

          {isPeakHours && (
            <AmbientIndicator
              icon={<Moon className="w-4 h-4" />}
              label="Peak Hours"
            />
          )}

          {/* Location-specific bonuses */}
          {bonusEntries.map(([activityId, bonus]) => (
            <AmbientIndicator
              key={activityId}
              icon={<Sparkles className="w-4 h-4" />}
              label={`+${Math.round((bonus as number) * 100)}% ${getActivityDisplayName(activityId)}`}
              highlight
            />
          ))}

          {/* Show "House Specialty" badge if has bonuses */}
          {bonusEntries.length > 0 && (
            <AmbientIndicator
              icon={<Star className="w-4 h-4" />}
              label="House Specialty"
              highlight
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SaloonAtmosphere;
