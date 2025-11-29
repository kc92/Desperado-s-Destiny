/**
 * BuildingCard Component
 * Individual building card for town grid display
 */

import React from 'react';
import { BuildingWithStatus, BuildingRequirements } from '../../services/building.service';
import { Card } from '../ui/Card';

interface BuildingCardProps {
  building: BuildingWithStatus;
  characterLevel: number;
  characterWantedLevel: number;
  isInGang: boolean;
  onEnter: (buildingId: string) => void;
  playerCount?: number;
}

// Building type icons
const BUILDING_ICONS: Record<string, string> = {
  saloon: '🍺',
  sheriff_office: '⭐',
  bank: '🏦',
  general_store: '🛒',
  blacksmith: '⚒️',
  doctors_office: '💊',
  hotel: '🏨',
  church: '⛪',
  stables: '🐴',
  telegraph_office: '📬',
  // Settler faction
  assay_office: '⚖️',
  railroad_station: '🚂',
  newspaper_office: '📰',
  // Nahi faction
  spirit_lodge: '🪶',
  council_fire: '🔥',
  medicine_lodge: '🌿',
  // Frontera faction
  cantina: '🥃',
  fighting_pit: '⚔️',
  smugglers_den: '🗝️',
  shrine: '🕯️',
  // Default
  default: '🏠',
};

// Faction colors
const FACTION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  settler: {
    bg: 'bg-faction-settler/20',
    border: 'border-faction-settler',
    text: 'text-faction-settler',
  },
  nahi: {
    bg: 'bg-faction-nahi/20',
    border: 'border-faction-nahi',
    text: 'text-faction-nahi',
  },
  frontera: {
    bg: 'bg-faction-frontera/20',
    border: 'border-faction-frontera',
    text: 'text-faction-frontera',
  },
  neutral: {
    bg: 'bg-wood-light/20',
    border: 'border-wood-medium',
    text: 'text-wood-dark',
  },
};

export const BuildingCard: React.FC<BuildingCardProps> = ({
  building,
  characterLevel,
  characterWantedLevel,
  isInGang,
  onEnter,
  playerCount = 0,
}) => {
  const icon = BUILDING_ICONS[building.type] || BUILDING_ICONS.default;
  const factionColors = FACTION_COLORS[building.dominantFaction || 'neutral'];

  // Check if building is accessible
  const accessCheck = checkAccess(building.requirements, characterLevel, characterWantedLevel, isInGang);
  const isAccessible = accessCheck.canAccess && building.isOpen;

  return (
    <Card
      variant="wood"
      padding="none"
      hover={isAccessible}
      onClick={() => isAccessible && onEnter(building._id)}
      className={`
        relative overflow-hidden transition-all duration-300
        ${!isAccessible ? 'opacity-60' : 'cursor-pointer hover:scale-105'}
        border-2 ${isAccessible ? factionColors.border : 'border-wood-dark'}
      `}
    >
      {/* Background gradient based on building type */}
      <div
        className={`
          absolute inset-0 opacity-30
          ${getBuildingGradient(building.type)}
        `}
      />

      {/* Content */}
      <div className="relative p-4">
        {/* Header with icon and status badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{icon}</span>
            <div>
              <h3 className="font-western text-lg text-desert-sand leading-tight">
                {building.name}
              </h3>
              {building.dominantFaction && building.dominantFaction !== 'neutral' && (
                <span className={`text-xs uppercase ${factionColors.text}`}>
                  {building.dominantFaction}
                </span>
              )}
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-col gap-1 items-end">
            {/* Open/Closed badge */}
            <span
              className={`
                px-2 py-0.5 rounded text-xs font-bold
                ${building.isOpen
                  ? 'bg-green-600/80 text-white'
                  : 'bg-blood-red/80 text-white'
                }
              `}
            >
              {building.isOpen ? 'OPEN' : 'CLOSED'}
            </span>

            {/* Level requirement badge */}
            {building.requirements?.minLevel && (
              <span
                className={`
                  px-2 py-0.5 rounded text-xs font-bold
                  ${characterLevel >= building.requirements.minLevel
                    ? 'bg-gold-medium/80 text-wood-dark'
                    : 'bg-blood-red/80 text-white'
                  }
                `}
              >
                LV {building.requirements.minLevel}
              </span>
            )}

            {/* Player count */}
            {playerCount > 0 && (
              <span className="px-2 py-0.5 rounded text-xs bg-wood-dark/80 text-desert-sand">
                👤 {playerCount}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-desert-clay mb-3 line-clamp-2">
          {building.shortDescription}
        </p>

        {/* Lock overlay for inaccessible buildings */}
        {!isAccessible && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center p-4">
              <span className="text-4xl mb-2 block">🔒</span>
              <p className="text-sm text-desert-sand font-semibold">
                {!building.isOpen ? 'Closed' : accessCheck.reason}
              </p>
            </div>
          </div>
        )}

        {/* Danger level indicator */}
        {building.dangerLevel > 3 && (
          <div className="absolute bottom-2 right-2">
            <span className="text-blood-red text-xs">
              {'⚠️'.repeat(Math.min(building.dangerLevel - 3, 3))}
            </span>
          </div>
        )}
      </div>

      {/* Tooltip on hover - shows full requirements */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-wood-dark rounded-lg shadow-lg text-xs">
          <p className="text-desert-sand mb-2">{building.description}</p>
          {building.requirements && (
            <div className="space-y-1 text-desert-clay">
              {building.requirements.minLevel && (
                <p>Level: {building.requirements.minLevel}+</p>
              )}
              {building.requirements.maxWanted !== undefined && (
                <p>Max Wanted: {building.requirements.maxWanted}</p>
              )}
              {building.requirements.gangMember && (
                <p>Gang Members Only</p>
              )}
            </div>
          )}
          {building.operatingHours && (
            <p className="text-desert-clay mt-1">
              Hours: {building.operatingHours.open}:00 - {building.operatingHours.close}:00
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// Helper function to check access requirements
function checkAccess(
  requirements: BuildingRequirements | undefined,
  level: number,
  wantedLevel: number,
  isInGang: boolean
): { canAccess: boolean; reason: string } {
  if (!requirements) {
    return { canAccess: true, reason: '' };
  }

  if (requirements.minLevel && level < requirements.minLevel) {
    return { canAccess: false, reason: `Requires Level ${requirements.minLevel}` };
  }

  if (requirements.maxWanted !== undefined && wantedLevel > requirements.maxWanted) {
    return { canAccess: false, reason: `Wanted level too high` };
  }

  if (requirements.gangMember && !isInGang) {
    return { canAccess: false, reason: 'Gang members only' };
  }

  return { canAccess: true, reason: '' };
}

// Helper function to get building gradient based on type
function getBuildingGradient(type: string): string {
  const gradients: Record<string, string> = {
    saloon: 'bg-gradient-to-br from-amber-900 to-yellow-800',
    sheriff_office: 'bg-gradient-to-br from-blue-900 to-slate-700',
    bank: 'bg-gradient-to-br from-yellow-700 to-amber-600',
    general_store: 'bg-gradient-to-br from-green-800 to-emerald-700',
    blacksmith: 'bg-gradient-to-br from-orange-800 to-red-700',
    doctors_office: 'bg-gradient-to-br from-white to-gray-200',
    hotel: 'bg-gradient-to-br from-purple-800 to-indigo-700',
    church: 'bg-gradient-to-br from-white to-yellow-100',
    // Nahi buildings
    spirit_lodge: 'bg-gradient-to-br from-teal-800 to-cyan-700',
    council_fire: 'bg-gradient-to-br from-orange-600 to-red-500',
    medicine_lodge: 'bg-gradient-to-br from-green-700 to-teal-600',
    // Frontera buildings
    cantina: 'bg-gradient-to-br from-red-900 to-orange-800',
    fighting_pit: 'bg-gradient-to-br from-gray-800 to-red-900',
    smugglers_den: 'bg-gradient-to-br from-gray-900 to-purple-900',
    shrine: 'bg-gradient-to-br from-purple-900 to-black',
    default: 'bg-gradient-to-br from-wood-medium to-wood-dark',
  };

  return gradients[type] || gradients.default;
}

export default BuildingCard;
