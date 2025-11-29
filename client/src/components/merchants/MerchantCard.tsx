/**
 * MerchantCard Component
 * Displays a wandering merchant with their status and basic info
 */

import React from 'react';
import { Card } from '@/components/ui';
import type { WanderingMerchant, MerchantState } from '@/hooks/useMerchants';

interface MerchantCardProps {
  merchant: WanderingMerchant;
  state?: MerchantState;
  onClick?: () => void;
  compact?: boolean;
}

const factionColors: Record<string, string> = {
  SETTLER_ALLIANCE: 'text-blue-400 border-blue-500/30 bg-blue-900/10',
  FRONTERA: 'text-orange-400 border-orange-500/30 bg-orange-900/10',
  NAHI_COALITION: 'text-green-400 border-green-500/30 bg-green-900/10',
  neutral: 'text-gray-400 border-gray-500/30 bg-gray-900/10',
};

const factionIcons: Record<string, string> = {
  SETTLER_ALLIANCE: '🏛️',
  FRONTERA: '🌵',
  NAHI_COALITION: '🦅',
  neutral: '⚖️',
};

export const MerchantCard: React.FC<MerchantCardProps> = ({
  merchant,
  state,
  onClick,
  compact = false,
}) => {
  const isAvailable = state?.isAvailableForTrade ?? false;
  const isHidden = merchant.hidden && !state;
  const factionStyle = factionColors[merchant.faction] || factionColors.neutral;
  const factionIcon = factionIcons[merchant.faction] || factionIcons.neutral;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-lg bg-wood-dark/50 border border-wood-grain/30
          transition-all cursor-pointer hover:border-gold-light/50 hover:bg-wood-dark
          ${isAvailable ? 'opacity-100' : 'opacity-60'}`}
      >
        <div className="text-3xl">{merchant.barter ? '🔄' : '🛒'}</div>
        <div className="flex-1 min-w-0">
          <p className="font-western text-gold-light truncate">{merchant.name}</p>
          <p className="text-xs text-desert-stone truncate">{merchant.title}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${factionStyle}`}>
            {factionIcon} {merchant.faction.replace('_', ' ')}
          </span>
          {isAvailable ? (
            <span className="text-xs text-green-400">Open</span>
          ) : (
            <span className="text-xs text-desert-stone">Away</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      variant="wood"
      hover={!!onClick}
      onClick={onClick}
      className={`relative ${isAvailable ? '' : 'opacity-70'}`}
    >
      {/* Hidden Merchant Overlay */}
      {isHidden && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <span className="text-4xl">❓</span>
            <p className="text-desert-sand mt-2">Hidden Merchant</p>
            <p className="text-xs text-desert-stone">Discover to reveal</p>
          </div>
        </div>
      )}

      {/* Availability Badge */}
      <div className="absolute top-3 right-3">
        {isAvailable ? (
          <span className="px-2 py-1 text-xs bg-green-600/80 text-white rounded-full">
            Open for Trade
          </span>
        ) : (
          <span className="px-2 py-1 text-xs bg-gray-600/80 text-white rounded-full">
            Traveling
          </span>
        )}
      </div>

      {/* Merchant Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-5xl">{merchant.barter ? '🔄' : '🛒'}</div>
        <div className="flex-1">
          <h3 className="font-western text-xl text-gold-light">{merchant.name}</h3>
          <p className="text-desert-stone">{merchant.title}</p>
          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${factionStyle}`}>
            {factionIcon} {merchant.faction.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-desert-sand mb-4 line-clamp-2">{merchant.description}</p>

      {/* Current Location */}
      {state && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-wood-dark/50 rounded">
          <span className="text-lg">📍</span>
          <div>
            <p className="text-xs text-desert-stone">Current Location</p>
            <p className="text-sm text-desert-sand">{state.currentLocationName}</p>
          </div>
        </div>
      )}

      {/* Special Features */}
      {merchant.specialFeatures.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-desert-stone">Special Features:</p>
          <div className="flex flex-wrap gap-1">
            {merchant.specialFeatures.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-gold-dark/20 text-gold-light rounded"
              >
                {feature}
              </span>
            ))}
            {merchant.specialFeatures.length > 2 && (
              <span className="text-xs px-2 py-0.5 text-desert-stone">
                +{merchant.specialFeatures.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Inventory Preview */}
      <div className="mt-4 pt-4 border-t border-wood-grain/30">
        <div className="flex justify-between items-center">
          <span className="text-sm text-desert-stone">
            {merchant.inventory.length} items available
          </span>
          {onClick && (
            <span className="text-sm text-gold-light">View Details &rarr;</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MerchantCard;
