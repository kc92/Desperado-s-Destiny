/**
 * KarmaPanel Component
 * Full karma dimension display panel for profile/stats page
 *
 * DEITY SYSTEM - Phase 4
 */

import React, { useMemo } from 'react';
import { Tooltip } from '@/components/ui';
import { useKarma } from '@/hooks/useKarma';
import type { KarmaDimensions } from '@/services/karma.service';

// ============================================================================
// PROPS
// ============================================================================

interface KarmaPanelProps {
  variant?: 'compact' | 'full';
  className?: string;
}

// ============================================================================
// DIMENSION DATA
// ============================================================================

interface DimensionInfo {
  key: keyof KarmaDimensions;
  label: string;
  category: 'virtue' | 'vice' | 'neutral';
  description: string;
}

const DIMENSION_INFO: DimensionInfo[] = [
  // Virtues
  { key: 'mercy', label: 'Mercy', category: 'virtue', description: 'Compassion and forgiveness towards others' },
  { key: 'charity', label: 'Charity', category: 'virtue', description: 'Generosity and helping those in need' },
  { key: 'justice', label: 'Justice', category: 'virtue', description: 'Upholding law and fairness' },
  { key: 'honor', label: 'Honor', category: 'virtue', description: 'Personal integrity and keeping your word' },
  { key: 'loyalty', label: 'Loyalty', category: 'virtue', description: 'Faithfulness to allies and causes' },
  // Vices
  { key: 'cruelty', label: 'Cruelty', category: 'vice', description: 'Causing suffering for its own sake' },
  { key: 'greed', label: 'Greed', category: 'vice', description: 'Excessive desire for wealth' },
  { key: 'chaos', label: 'Chaos', category: 'vice', description: 'Disruption and anarchy' },
  { key: 'deception', label: 'Deception', category: 'vice', description: 'Lies and manipulation' },
  // Neutral
  { key: 'survival', label: 'Survival', category: 'neutral', description: 'Self-preservation at any cost' },
];

// ============================================================================
// DIMENSION BAR COMPONENT
// ============================================================================

interface DimensionBarProps {
  info: DimensionInfo;
  value: number;
  showValue?: boolean;
}

const DimensionBar: React.FC<DimensionBarProps> = ({ info, value, showValue = true }) => {
  // Calculate bar width (value is -100 to +100, convert to 0-100%)
  const percentage = Math.abs(value);

  // Get color based on category and value
  const getBarColor = () => {
    if (info.category === 'virtue') {
      return value >= 0
        ? 'bg-gradient-to-r from-green-600 to-green-400'
        : 'bg-gradient-to-r from-red-600 to-red-400';
    }
    if (info.category === 'vice') {
      return value >= 0
        ? 'bg-gradient-to-r from-red-600 to-red-400'
        : 'bg-gradient-to-r from-green-600 to-green-400';
    }
    return 'bg-gradient-to-r from-amber-600 to-amber-400';
  };

  const getValueColor = () => {
    if (info.category === 'virtue') {
      return value >= 0 ? 'text-green-400' : 'text-red-400';
    }
    if (info.category === 'vice') {
      return value >= 0 ? 'text-red-400' : 'text-green-400';
    }
    return 'text-amber-400';
  };

  return (
    <Tooltip content={info.description}>
      <div className="group">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-desert-sand capitalize group-hover:text-gold-light transition-colors">
            {info.label}
          </span>
          {showValue && (
            <span className={`text-sm font-medium ${getValueColor()}`}>
              {value >= 0 ? '+' : ''}{value}
            </span>
          )}
        </div>
        <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Tooltip>
  );
};

// ============================================================================
// COMPACT VARIANT
// ============================================================================

interface CompactVariantProps {
  dimensions: KarmaDimensions;
  dominantTrait: { trait: string; value: number } | null;
}

const CompactVariant: React.FC<CompactVariantProps> = ({ dimensions, dominantTrait }) => {
  // Get top 3 absolute values
  const topTraits = useMemo(() => {
    return DIMENSION_INFO
      .map((info) => ({
        ...info,
        value: dimensions[info.key],
        absValue: Math.abs(dimensions[info.key]),
      }))
      .sort((a, b) => b.absValue - a.absValue)
      .slice(0, 3);
  }, [dimensions]);

  return (
    <div className="space-y-2">
      {dominantTrait && (
        <div className="text-sm text-gray-400 mb-2">
          Dominant:{' '}
          <span className="font-medium text-gold-light capitalize">
            {dominantTrait.trait} {dominantTrait.value >= 0 ? '+' : ''}{dominantTrait.value}
          </span>
        </div>
      )}
      {topTraits.map((trait) => (
        <DimensionBar
          key={trait.key}
          info={trait}
          value={trait.value}
        />
      ))}
    </div>
  );
};

// ============================================================================
// FULL VARIANT
// ============================================================================

interface FullVariantProps {
  dimensions: KarmaDimensions;
  dominantTrait: { trait: string; value: number; isPositive: boolean } | null;
  moralConflict: string | null;
}

const FullVariant: React.FC<FullVariantProps> = ({
  dimensions,
  dominantTrait,
  moralConflict,
}) => {
  const virtues = DIMENSION_INFO.filter((d) => d.category === 'virtue');
  const vices = DIMENSION_INFO.filter((d) => d.category === 'vice');
  const neutral = DIMENSION_INFO.filter((d) => d.category === 'neutral');

  return (
    <div className="space-y-6">
      {/* Header with dominant trait */}
      {dominantTrait && (
        <div className="p-3 rounded-lg border bg-wood-dark/50 border-wood-grain/30">
          <div className="text-sm text-gray-400 mb-1">Dominant Trait</div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gold-light capitalize">
              {dominantTrait.trait}
            </span>
            <span
              className={`text-lg font-bold ${
                dominantTrait.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {dominantTrait.value >= 0 ? '+' : ''}{dominantTrait.value}
            </span>
          </div>
        </div>
      )}

      {/* Moral conflict warning */}
      {moralConflict && (
        <div className="p-3 rounded-lg border bg-amber-900/20 border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400">
            <span>⚠</span>
            <span className="font-medium">Moral Conflict</span>
          </div>
          <p className="text-sm text-amber-400/80 mt-1">{moralConflict}</p>
        </div>
      )}

      {/* Virtues Section */}
      <div>
        <h4 className="text-sm font-medium text-green-400/80 mb-3 flex items-center gap-2">
          <span className="w-8 h-px bg-green-500/30" />
          <span>Virtue</span>
          <span className="flex-1 h-px bg-green-500/30" />
        </h4>
        <div className="space-y-3">
          {virtues.map((info) => (
            <DimensionBar
              key={info.key}
              info={info}
              value={dimensions[info.key]}
            />
          ))}
        </div>
      </div>

      {/* Vices Section */}
      <div>
        <h4 className="text-sm font-medium text-red-400/80 mb-3 flex items-center gap-2">
          <span className="w-8 h-px bg-red-500/30" />
          <span>Vice</span>
          <span className="flex-1 h-px bg-red-500/30" />
        </h4>
        <div className="space-y-3">
          {vices.map((info) => (
            <DimensionBar
              key={info.key}
              info={info}
              value={dimensions[info.key]}
            />
          ))}
        </div>
      </div>

      {/* Neutral Section */}
      <div>
        <h4 className="text-sm font-medium text-amber-400/80 mb-3 flex items-center gap-2">
          <span className="w-8 h-px bg-amber-500/30" />
          <span>Neutral</span>
          <span className="flex-1 h-px bg-amber-500/30" />
        </h4>
        <div className="space-y-3">
          {neutral.map((info) => (
            <DimensionBar
              key={info.key}
              info={info}
              value={dimensions[info.key]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const KarmaPanel: React.FC<KarmaPanelProps> = ({
  variant = 'full',
  className = '',
}) => {
  const { karma, isLoading } = useKarma();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-12 bg-gray-700 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!karma) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        <span className="text-2xl mb-2 block">☯</span>
        <p>No karma data available</p>
      </div>
    );
  }

  return (
    <div
      className={`
        p-4 rounded-lg border
        bg-gradient-to-br from-wood-dark/80 to-wood-dark/40
        border-wood-grain/40
        ${className}
      `}
    >
      {/* Panel Header */}
      <h3 className="text-lg font-bold text-gold-light mb-4 flex items-center gap-2">
        <span>☯</span>
        <span>Moral Profile</span>
      </h3>

      {/* Content based on variant */}
      {variant === 'compact' ? (
        <CompactVariant
          dimensions={karma.karma}
          dominantTrait={karma.dominantTrait}
        />
      ) : (
        <FullVariant
          dimensions={karma.karma}
          dominantTrait={karma.dominantTrait}
          moralConflict={karma.moralConflict}
        />
      )}
    </div>
  );
};

export default KarmaPanel;
