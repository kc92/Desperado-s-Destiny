/**
 * DeityRelationship Component
 * Display relationship with both deities (HUD or panel variant)
 *
 * DEITY SYSTEM - Phase 4
 */

import React from 'react';
import { Tooltip } from '@/components/ui';
import { useKarma } from '@/hooks/useKarma';
import { karmaService, DeityName } from '@/services/karma.service';

// ============================================================================
// PROPS
// ============================================================================

interface DeityRelationshipProps {
  variant?: 'hud' | 'panel' | 'minimal';
  showTooltips?: boolean;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color classes based on affinity value
 */
const getAffinityColor = (affinity: number): string => {
  if (affinity >= 50) return 'text-green-400';
  if (affinity >= 25) return 'text-emerald-400';
  if (affinity >= 0) return 'text-gray-400';
  if (affinity >= -25) return 'text-orange-400';
  if (affinity >= -50) return 'text-red-400';
  return 'text-red-500';
};

/**
 * Get bar fill color based on affinity
 */
const getBarColor = (affinity: number): string => {
  if (affinity >= 50) return 'bg-gradient-to-r from-green-600 to-green-400';
  if (affinity >= 25) return 'bg-gradient-to-r from-emerald-600 to-emerald-400';
  if (affinity >= 0) return 'bg-gradient-to-r from-gray-600 to-gray-400';
  if (affinity >= -25) return 'bg-gradient-to-r from-orange-600 to-orange-400';
  if (affinity >= -50) return 'bg-gradient-to-r from-red-600 to-red-400';
  return 'bg-gradient-to-r from-red-700 to-red-500';
};

/**
 * Get relationship badge color
 */
const getRelationshipBadgeColor = (relationship: string): string => {
  const r = relationship.toLowerCase();
  if (r.includes('blessed')) return 'bg-green-900/50 text-green-300 border-green-500/50';
  if (r.includes('favored') || r.includes('highly')) return 'bg-emerald-900/50 text-emerald-300 border-emerald-500/50';
  if (r.includes('neutral') || r.includes('noticed')) return 'bg-gray-800/50 text-gray-300 border-gray-500/50';
  if (r.includes('watched') || r.includes('disfavored')) return 'bg-orange-900/50 text-orange-300 border-orange-500/50';
  if (r.includes('scorned') || r.includes('cursed')) return 'bg-red-900/50 text-red-300 border-red-500/50';
  return 'bg-gray-800/50 text-gray-300 border-gray-500/50';
};

// ============================================================================
// AFFINITY BAR COMPONENT
// ============================================================================

interface AffinityBarProps {
  affinity: number;
  size?: 'sm' | 'md' | 'lg';
}

const AffinityBar: React.FC<AffinityBarProps> = ({ affinity, size = 'md' }) => {
  // Convert -100 to +100 range to 0-100% for bar width
  const percentage = ((affinity + 100) / 200) * 100;

  const heightClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  return (
    <div className={`w-full ${heightClass} bg-gray-700 rounded-full overflow-hidden`}>
      <div
        className={`${heightClass} ${getBarColor(affinity)} transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// ============================================================================
// DEITY CARD COMPONENT
// ============================================================================

interface DeityCardProps {
  deity: DeityName;
  affinity: number;
  relationship: string;
  showBar?: boolean;
  compact?: boolean;
}

const DeityCard: React.FC<DeityCardProps> = ({
  deity,
  affinity,
  relationship,
  showBar = true,
  compact = false,
}) => {
  const icon = karmaService.getDeityIcon(deity);
  const name = karmaService.getDeityDisplayName(deity);
  const affinityColor = getAffinityColor(affinity);
  const badgeColor = getRelationshipBadgeColor(relationship);

  const tooltipContent = (
    <div className="text-sm max-w-xs">
      <div className="font-bold mb-1">{name}</div>
      <div className="text-gray-300 text-xs mb-2">
        {deity === 'GAMBLER'
          ? 'Values honor, justice, and fair play. Despises chaos and deception.'
          : 'Values chaos, survival, and freedom. Scorns rigid justice and honor.'}
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">Affinity:</span>
        <span className={affinityColor}>{affinity >= 0 ? '+' : ''}{Math.round(affinity)}</span>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-gray-400">Status:</span>
        <span>{relationship}</span>
      </div>
    </div>
  );

  if (compact) {
    return (
      <Tooltip content={tooltipContent}>
        <div className="flex items-center gap-2 cursor-default">
          <span className={`text-lg ${deity === 'GAMBLER' ? 'text-amber-400' : 'text-red-400'}`}>
            {icon}
          </span>
          <span className={`text-sm font-medium ${affinityColor}`}>
            {affinity >= 0 ? '+' : ''}{Math.round(affinity)}
          </span>
        </div>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={tooltipContent}>
      <div
        className={`
          p-3 rounded-lg border cursor-default
          bg-gradient-to-br from-wood-dark/50 to-transparent
          border-wood-grain/30 hover:border-wood-grain/50
          transition-all duration-200
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xl ${deity === 'GAMBLER' ? 'text-amber-400' : 'text-red-400'}`}>
              {icon}
            </span>
            <span className="font-medium text-desert-sand">{name}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded border ${badgeColor}`}>
            {relationship}
          </span>
        </div>

        {/* Affinity bar */}
        {showBar && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Affinity</span>
              <span className={affinityColor}>
                {affinity >= 0 ? '+' : ''}{Math.round(affinity)}
              </span>
            </div>
            <AffinityBar affinity={affinity} size="sm" />
          </div>
        )}
      </div>
    </Tooltip>
  );
};

// ============================================================================
// MINIMAL VARIANT
// ============================================================================

interface MinimalVariantProps {
  gamblerAffinity: number;
  outlawKingAffinity: number;
}

const MinimalVariant: React.FC<MinimalVariantProps> = ({
  gamblerAffinity,
  outlawKingAffinity,
}) => {
  return (
    <div className="flex items-center gap-3">
      <DeityCard
        deity="GAMBLER"
        affinity={gamblerAffinity}
        relationship=""
        showBar={false}
        compact
      />
      <DeityCard
        deity="OUTLAW_KING"
        affinity={outlawKingAffinity}
        relationship=""
        showBar={false}
        compact
      />
    </div>
  );
};

// ============================================================================
// HUD VARIANT
// ============================================================================

interface HudVariantProps {
  gamblerAffinity: number;
  gamblerRelationship: string;
  outlawKingAffinity: number;
  outlawKingRelationship: string;
}

const HudVariant: React.FC<HudVariantProps> = ({
  gamblerAffinity,
  gamblerRelationship,
  outlawKingAffinity,
  outlawKingRelationship,
}) => {
  return (
    <div className="space-y-2">
      <DeityCard
        deity="GAMBLER"
        affinity={gamblerAffinity}
        relationship={gamblerRelationship}
        showBar
      />
      <DeityCard
        deity="OUTLAW_KING"
        affinity={outlawKingAffinity}
        relationship={outlawKingRelationship}
        showBar
      />
    </div>
  );
};

// ============================================================================
// PANEL VARIANT
// ============================================================================

interface PanelVariantProps {
  gamblerAffinity: number;
  gamblerRelationship: string;
  outlawKingAffinity: number;
  outlawKingRelationship: string;
}

const PanelVariant: React.FC<PanelVariantProps> = ({
  gamblerAffinity,
  gamblerRelationship,
  outlawKingAffinity,
  outlawKingRelationship,
}) => {
  return (
    <div
      className={`
        p-4 rounded-lg border
        bg-gradient-to-br from-wood-dark/80 to-wood-dark/40
        border-wood-grain/40
      `}
    >
      <h3 className="text-lg font-bold text-gold-light mb-4 flex items-center gap-2">
        <span>☯</span>
        <span>Divine Relationships</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* The Gambler */}
        <div
          className={`
            p-4 rounded-lg border
            bg-gradient-to-br from-amber-900/20 to-transparent
            border-amber-500/30
          `}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl text-amber-400">♠</span>
            <div>
              <h4 className="font-bold text-amber-300">The Gambler</h4>
              <span className={`text-xs px-2 py-0.5 rounded border ${getRelationshipBadgeColor(gamblerRelationship)}`}>
                {gamblerRelationship}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Affinity</span>
              <span className={getAffinityColor(gamblerAffinity)}>
                {gamblerAffinity >= 0 ? '+' : ''}{Math.round(gamblerAffinity)}
              </span>
            </div>
            <AffinityBar affinity={gamblerAffinity} size="md" />
          </div>

          <p className="text-xs text-gray-400">
            The Gambler watches those who play fair and act with honor.
            He rewards the just and punishes cheaters and liars.
          </p>
        </div>

        {/* The Outlaw King */}
        <div
          className={`
            p-4 rounded-lg border
            bg-gradient-to-br from-red-900/20 to-transparent
            border-red-500/30
          `}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl text-red-400">★</span>
            <div>
              <h4 className="font-bold text-red-400">The Outlaw King</h4>
              <span className={`text-xs px-2 py-0.5 rounded border ${getRelationshipBadgeColor(outlawKingRelationship)}`}>
                {outlawKingRelationship}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Affinity</span>
              <span className={getAffinityColor(outlawKingAffinity)}>
                {outlawKingAffinity >= 0 ? '+' : ''}{Math.round(outlawKingAffinity)}
              </span>
            </div>
            <AffinityBar affinity={outlawKingAffinity} size="md" />
          </div>

          <p className="text-xs text-gray-400">
            The Outlaw King embraces chaos and survival above all.
            He favors those who live free and scorns rigid law-followers.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DeityRelationship: React.FC<DeityRelationshipProps> = ({
  variant = 'hud',
  className = '',
}) => {
  const { karma, isLoading } = useKarma();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {variant === 'minimal' ? (
          <div className="flex gap-3">
            <div className="w-12 h-6 bg-gray-700 rounded" />
            <div className="w-12 h-6 bg-gray-700 rounded" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-16 bg-gray-700 rounded-lg" />
            <div className="h-16 bg-gray-700 rounded-lg" />
          </div>
        )}
      </div>
    );
  }

  if (!karma) {
    return null;
  }

  const { gambler, outlawKing } = karma.deityRelationships;

  return (
    <div className={className}>
      {variant === 'minimal' && (
        <MinimalVariant
          gamblerAffinity={gambler.affinity}
          outlawKingAffinity={outlawKing.affinity}
        />
      )}
      {variant === 'hud' && (
        <HudVariant
          gamblerAffinity={gambler.affinity}
          gamblerRelationship={gambler.relationship}
          outlawKingAffinity={outlawKing.affinity}
          outlawKingRelationship={outlawKing.relationship}
        />
      )}
      {variant === 'panel' && (
        <PanelVariant
          gamblerAffinity={gambler.affinity}
          gamblerRelationship={gambler.relationship}
          outlawKingAffinity={outlawKing.affinity}
          outlawKingRelationship={outlawKing.relationship}
        />
      )}
    </div>
  );
};

export default DeityRelationship;
