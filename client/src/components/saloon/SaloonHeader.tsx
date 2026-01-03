/**
 * SaloonHeader Component
 * Atmospheric header with saloon name, danger meter, and faction indicators
 *
 * Part of the Saloon Location UI Redesign.
 */

import React from 'react';
import { AlertTriangle, Shield, Skull, Users } from 'lucide-react';
import { WesternPanel } from '@/components/ui/WesternPanel';
import {
  SaloonTheme,
  getDangerDescription,
  getSaloonStyleDescription
} from './SaloonTheme';

/**
 * Faction influence for display
 */
interface FactionInfluence {
  settlerAlliance: number;
  nahiCoalition: number;
  frontera: number;
}

/**
 * SaloonHeader props
 */
export interface SaloonHeaderProps {
  /** Saloon name */
  name: string;
  /** Short description */
  shortDescription?: string;
  /** Saloon icon */
  icon?: string;
  /** Danger level (1-10) */
  dangerLevel: number;
  /** Faction influence values */
  factionInfluence: FactionInfluence;
  /** Computed theme */
  theme: SaloonTheme;
  /** Additional class names */
  className?: string;
}

/**
 * Danger meter component
 */
const DangerMeter: React.FC<{ level: number }> = ({ level }) => {
  const getColor = () => {
    if (level <= 2) return 'bg-green-500';
    if (level <= 4) return 'bg-yellow-500';
    if (level <= 6) return 'bg-orange-500';
    if (level <= 8) return 'bg-red-500';
    return 'bg-red-700';
  };

  const getIcon = () => {
    if (level <= 2) return <Shield className="w-4 h-4" />;
    if (level <= 6) return <AlertTriangle className="w-4 h-4" />;
    return <Skull className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`${getColor()} p-1.5 rounded`}>
        {getIcon()}
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-desert-stone uppercase tracking-wide">Danger</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-wood-darker rounded-full overflow-hidden">
            <div
              className={`h-full ${getColor()} transition-all duration-500`}
              style={{ width: `${level * 10}%` }}
            />
          </div>
          <span className="text-sm text-desert-sand font-medium">{level}/10</span>
        </div>
        <span className="text-xs text-desert-stone">{getDangerDescription(level)}</span>
      </div>
    </div>
  );
};

/**
 * Faction influence bar
 */
const FactionInfluenceBar: React.FC<{ influence: FactionInfluence }> = ({ influence }) => {
  const total = influence.settlerAlliance + influence.nahiCoalition + influence.frontera;
  if (total === 0) return null;

  const settlerWidth = (influence.settlerAlliance / 100) * 100;
  const nahiWidth = (influence.nahiCoalition / 100) * 100;
  const fronteraWidth = (influence.frontera / 100) * 100;

  return (
    <div className="flex items-center gap-3">
      <Users className="w-4 h-4 text-desert-stone" />
      <div className="flex flex-col flex-1">
        <span className="text-xs text-desert-stone uppercase tracking-wide mb-1">Faction Influence</span>
        <div className="flex gap-0.5 h-2 w-full max-w-xs">
          {influence.settlerAlliance > 0 && (
            <div
              className="h-full bg-[#4169E1] rounded-l first:rounded-l last:rounded-r"
              style={{ width: `${settlerWidth}%` }}
              title={`Settler Alliance: ${influence.settlerAlliance}%`}
            />
          )}
          {influence.nahiCoalition > 0 && (
            <div
              className="h-full bg-[#32CD32]"
              style={{ width: `${nahiWidth}%` }}
              title={`Nahi Coalition: ${influence.nahiCoalition}%`}
            />
          )}
          {influence.frontera > 0 && (
            <div
              className="h-full bg-[#DC143C] rounded-r first:rounded-l last:rounded-r"
              style={{ width: `${fronteraWidth}%` }}
              title={`Frontera: ${influence.frontera}%`}
            />
          )}
        </div>
        <div className="flex gap-4 mt-1 text-xs">
          {influence.settlerAlliance > 0 && (
            <span className="text-[#4169E1]">Settler {influence.settlerAlliance}%</span>
          )}
          {influence.nahiCoalition > 0 && (
            <span className="text-[#32CD32]">Nahi {influence.nahiCoalition}%</span>
          )}
          {influence.frontera > 0 && (
            <span className="text-[#DC143C]">Frontera {influence.frontera}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * SaloonHeader Component
 */
export const SaloonHeader: React.FC<SaloonHeaderProps> = ({
  name,
  shortDescription,
  icon = '🍺',
  dangerLevel,
  factionInfluence,
  theme,
  className = ''
}) => {
  return (
    <WesternPanel
      variant="wood"
      padding="lg"
      className={`relative overflow-hidden ${theme.headerClass} ${className}`}
    >
      {/* Danger-based ambient overlay */}
      {theme.dangerCategory === 'dangerous' && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
      )}
      {theme.dangerCategory === 'lawless' && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-red-900/10 pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* Top row: Icon, name, and danger meter */}
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Saloon identity */}
          <div className="flex items-center gap-4">
            {/* Icon with glow */}
            <div className="relative">
              <span
                className="text-5xl filter drop-shadow-lg"
                style={{
                  textShadow: theme.dangerCategory === 'lawless'
                    ? '0 0 20px rgba(139, 0, 0, 0.5)'
                    : '0 0 10px rgba(184, 134, 11, 0.3)'
                }}
              >
                {icon}
              </span>
            </div>

            {/* Name and description */}
            <div>
              <h1 className="text-2xl md:text-3xl font-western text-gold-light tracking-wide">
                {name}
              </h1>
              {shortDescription && (
                <p className="text-sm text-desert-stone mt-1">
                  {shortDescription}
                </p>
              )}
              <p className="text-xs text-desert-stone/70 mt-1 italic">
                {getSaloonStyleDescription(theme.saloonStyle)}
              </p>
            </div>
          </div>

          {/* Danger meter */}
          <DangerMeter level={dangerLevel} />
        </div>

        {/* Faction influence bar */}
        <FactionInfluenceBar influence={factionInfluence} />

        {/* Faction territory indicator */}
        {theme.dominantFaction !== 'neutral' && (
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: theme.accentColor }}
          />
        )}
      </div>
    </WesternPanel>
  );
};

export default SaloonHeader;
