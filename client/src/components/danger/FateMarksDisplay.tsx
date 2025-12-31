/**
 * FateMarksDisplay Component
 * Displays fate marks (skull icons) near the energy bar in PlayerSidebar
 *
 * Fate marks indicate accumulated bad luck that increases death risk:
 * - 0 marks: No display
 * - 1-2 marks: Faint gray skulls
 * - 3-4 marks: Orange warning skulls with subtle glow
 * - 5 marks: Red pulsing skulls with "Death awaits" tooltip
 */

import React from 'react';
import { Tooltip } from '@/components/ui';
import { useFateMarks, getFateMarkTooltip } from '@/hooks/useFateMarks';
import { FATE_MARK_CONFIG as SHARED_CONFIG } from '@desperados/shared';

// Fallback config in case shared package build fails
const FATE_MARK_CONFIG = SHARED_CONFIG || {
  maxMarks: 5,
  decayHours: 24,
  churchCleanse: { min: 1, max: 2 },
  cleanseCostPerMark: 100,
  destinyDeckCriticalThreshold: 0.10
};

interface FateMarksDisplayProps {
  /** Optional additional CSS classes */
  className?: string;
  /** Whether to show in compact mode */
  compact?: boolean;
}

/**
 * Single skull icon component
 */
const SkullIcon: React.FC<{
  filled: boolean;
  danger: 'low' | 'medium' | 'critical';
  index: number;
}> = ({ filled, danger, index }) => {
  if (!filled) return null;

  const baseClasses = 'text-sm transition-all duration-300';

  const dangerClasses = {
    low: 'text-gray-500/50',
    medium: 'text-orange-500 drop-shadow-[0_0_3px_rgba(249,115,22,0.5)]',
    critical: 'text-red-500 animate-pulse drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]',
  };

  return (
    <span
      className={`${baseClasses} ${dangerClasses[danger]}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      💀
    </span>
  );
};

/**
 * Format time remaining until decay
 */
const formatDecayTime = (ms: number | null): string => {
  if (ms === null || ms <= 0) return '';

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m until mark fades`;
  }
  return `${minutes}m until mark fades`;
};

export const FateMarksDisplay: React.FC<FateMarksDisplayProps> = ({
  className = '',
  compact = false,
}) => {
  const { fateMarks } = useFateMarks();
  const { count, isMaxed, timeToDecay } = fateMarks;

  // Don't render if no marks
  if (count === 0) {
    return null;
  }

  // Determine danger level for styling
  const getDangerLevel = (): 'low' | 'medium' | 'critical' => {
    if (count >= 5) return 'critical';
    if (count >= 3) return 'medium';
    return 'low';
  };

  const dangerLevel = getDangerLevel();
  const tooltip = getFateMarkTooltip(count);
  const decayText = formatDecayTime(timeToDecay);

  // Container styling based on danger level
  const containerClasses = {
    low: 'bg-gray-900/30 border-gray-700/30',
    medium: 'bg-orange-900/30 border-orange-700/40',
    critical: 'bg-red-900/40 border-red-700/50 animate-[pulse_2s_ease-in-out_infinite]',
  };

  if (compact) {
    return (
      <Tooltip content={`${tooltip}${decayText ? ` - ${decayText}` : ''}`}>
        <div className={`flex items-center gap-0.5 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <SkullIcon
              key={i}
              filled={true}
              danger={dangerLevel}
              index={i}
            />
          ))}
        </div>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      content={
        <div className="text-center">
          <div className="font-bold text-red-400">{tooltip}</div>
          {decayText && (
            <div className="text-xs text-desert-sand/70 mt-1">{decayText}</div>
          )}
          {isMaxed && (
            <div className="text-xs text-red-300 mt-1 italic">
              Your next failure may be your last...
            </div>
          )}
        </div>
      }
    >
      <div
        className={`
          flex items-center gap-1 px-2 py-1 rounded border
          ${containerClasses[dangerLevel]}
          transition-all duration-300
          ${className}
        `}
      >
        {/* Skull icons */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: FATE_MARK_CONFIG.maxMarks }).map((_, i) => (
            <SkullIcon
              key={i}
              filled={i < count}
              danger={dangerLevel}
              index={i}
            />
          ))}
        </div>

        {/* Count label for critical danger */}
        {dangerLevel === 'critical' && (
          <span className="text-xs text-red-400 font-bold ml-1">
            MAX
          </span>
        )}
      </div>
    </Tooltip>
  );
};

/**
 * Inline version for use in smaller UI areas
 */
export const FateMarksInline: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { fateMarks } = useFateMarks();
  const { count } = fateMarks;

  if (count === 0) return null;

  const dangerLevel = count >= 5 ? 'critical' : count >= 3 ? 'medium' : 'low';
  const tooltip = getFateMarkTooltip(count);

  return (
    <Tooltip content={tooltip}>
      <div className={`flex items-center ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkullIcon
            key={i}
            filled={true}
            danger={dangerLevel}
            index={i}
          />
        ))}
      </div>
    </Tooltip>
  );
};

export default FateMarksDisplay;
