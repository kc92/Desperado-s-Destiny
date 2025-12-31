/**
 * DeathRiskIndicator Component
 * Wraps action cards with "Full Immersive Effect" death risk visualization
 *
 * Effects based on danger level:
 * - Card border progressively darkens from green -> yellow -> orange -> blood-red
 * - Skull watermark fades in behind action card at danger levels
 * - Hover triggers ominous visual effects for high-risk actions
 * - Screen vignette and desaturation for extreme risk (handled by DeathRiskOverlay)
 */

import React, { useState, useRef, useMemo } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';

// Define DangerLevel locally to avoid shared package build issues
export enum DangerLevel {
  SAFE = 'safe',
  UNEASY = 'uneasy',
  DANGEROUS = 'dangerous',
  PERILOUS = 'perilous',
  DEADLY = 'deadly',
  CERTAIN_DOOM = 'certain_doom'
}

// Config defined locally to avoid shared package build issues
const DANGER_LEVEL_CONFIG: Record<DangerLevel, { minRisk: number; maxRisk: number; tooltip: string; uiClass: string }> = {
  [DangerLevel.SAFE]: { minRisk: 0, maxRisk: 0.10, tooltip: '', uiClass: 'danger-safe' },
  [DangerLevel.UNEASY]: { minRisk: 0.11, maxRisk: 0.25, tooltip: 'The spirits stir...', uiClass: 'danger-uneasy' },
  [DangerLevel.DANGEROUS]: { minRisk: 0.26, maxRisk: 0.50, tooltip: 'Something watches from beyond...', uiClass: 'danger-dangerous' },
  [DangerLevel.PERILOUS]: { minRisk: 0.51, maxRisk: 0.75, tooltip: "Death's shadow falls upon you...", uiClass: 'danger-perilous' },
  [DangerLevel.DEADLY]: { minRisk: 0.76, maxRisk: 0.90, tooltip: 'The reaper draws near...', uiClass: 'danger-deadly' },
  [DangerLevel.CERTAIN_DOOM]: { minRisk: 0.91, maxRisk: 1.0, tooltip: 'This path leads to the grave...', uiClass: 'danger-doom' }
};

// Pure function to get danger level from risk value
const getDangerLevelFromRisk = (risk: number): DangerLevel => {
  if (risk <= 0.10) return DangerLevel.SAFE;
  if (risk <= 0.25) return DangerLevel.UNEASY;
  if (risk <= 0.50) return DangerLevel.DANGEROUS;
  if (risk <= 0.75) return DangerLevel.PERILOUS;
  if (risk <= 0.90) return DangerLevel.DEADLY;
  return DangerLevel.CERTAIN_DOOM;
};

// Pure function to calculate death risk (simplified, no side effects)
const calculateSimpleRisk = (
  actionDanger: number,
  skillRatio: number,
  healthRatio: number
): number => {
  const skillSurvival = Math.min(skillRatio, 1.5);
  const healthVulnerability = 1 + (1 - healthRatio) * 0.5;
  const baseRisk = actionDanger * (1 / Math.max(skillSurvival, 0.1));
  return Math.min(baseRisk * healthVulnerability, 0.95);
};

interface DeathRiskIndicatorProps {
  /** The danger rating of this action (0.0 - 1.0) */
  actionDanger: number;
  /** Required skill level for the action */
  requiredSkill?: number;
  /** Character's relevant skill level */
  characterSkill?: number;
  /** Child content (typically an ActionCard) */
  children: React.ReactNode;
  /** Whether the action is currently hovered */
  onHoverChange?: (isHovered: boolean, dangerLevel: DangerLevel) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skull watermark SVG component
 */
const SkullWatermark: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
    style={{ opacity }}
  >
    <svg
      viewBox="0 0 100 100"
      className="w-32 h-32 text-red-900/30 transform rotate-12"
      fill="currentColor"
    >
      {/* Simplified skull shape */}
      <ellipse cx="50" cy="40" rx="35" ry="30" />
      <ellipse cx="35" cy="35" rx="8" ry="10" className="fill-black" />
      <ellipse cx="65" cy="35" rx="8" ry="10" className="fill-black" />
      <path d="M45 55 L50 65 L55 55 Z" className="fill-black" />
      <rect x="35" y="70" width="30" height="20" rx="3" />
      <rect x="40" y="70" width="3" height="20" className="fill-black" />
      <rect x="48" y="70" width="3" height="20" className="fill-black" />
      <rect x="56" y="70" width="3" height="20" className="fill-black" />
    </svg>
  </div>
);

/**
 * Get skull opacity based on danger level
 */
const getSkullOpacity = (level: DangerLevel): number => {
  switch (level) {
    case DangerLevel.SAFE:
      return 0;
    case DangerLevel.UNEASY:
      return 0.05;
    case DangerLevel.DANGEROUS:
      return 0.1;
    case DangerLevel.PERILOUS:
      return 0.2;
    case DangerLevel.DEADLY:
      return 0.35;
    case DangerLevel.CERTAIN_DOOM:
      return 0.5;
    default:
      return 0;
  }
};

/**
 * Get border color based on danger level
 */
const getBorderColor = (level: DangerLevel): string => {
  switch (level) {
    case DangerLevel.SAFE:
      return 'border-green-600';
    case DangerLevel.UNEASY:
      return 'border-yellow-500';
    case DangerLevel.DANGEROUS:
      return 'border-orange-500';
    case DangerLevel.PERILOUS:
      return 'border-red-500';
    case DangerLevel.DEADLY:
      return 'border-red-700';
    case DangerLevel.CERTAIN_DOOM:
      return 'border-red-900';
    default:
      return 'border-wood-medium';
  }
};

/**
 * Get glow effect based on danger level
 */
const getGlowEffect = (level: DangerLevel): string => {
  switch (level) {
    case DangerLevel.SAFE:
      return '';
    case DangerLevel.UNEASY:
      return 'shadow-yellow-500/20 shadow-md';
    case DangerLevel.DANGEROUS:
      return 'shadow-orange-500/30 shadow-md';
    case DangerLevel.PERILOUS:
      return 'shadow-red-500/40 shadow-lg';
    case DangerLevel.DEADLY:
      return 'shadow-red-700/50 shadow-xl';
    case DangerLevel.CERTAIN_DOOM:
      return 'shadow-red-900/60 shadow-2xl animate-[pulse_2s_ease-in-out_infinite]';
    default:
      return '';
  }
};

/**
 * Get background tint based on danger level
 */
const getBackgroundTint = (level: DangerLevel): string => {
  switch (level) {
    case DangerLevel.SAFE:
      return '';
    case DangerLevel.UNEASY:
      return 'bg-yellow-900/5';
    case DangerLevel.DANGEROUS:
      return 'bg-orange-900/10';
    case DangerLevel.PERILOUS:
      return 'bg-red-900/15';
    case DangerLevel.DEADLY:
      return 'bg-red-900/20';
    case DangerLevel.CERTAIN_DOOM:
      return 'bg-red-900/30';
    default:
      return '';
  }
};

export const DeathRiskIndicator: React.FC<DeathRiskIndicatorProps> = ({
  actionDanger,
  requiredSkill = 10,
  characterSkill,
  children,
  onHoverChange,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentCharacter } = useCharacterStore();

  // Calculate risk using pure functions (no hooks/effects to avoid re-render loops)
  const { dangerLevel, config } = useMemo(() => {
    // Get character stats with fallbacks
    // Note: SafeCharacter doesn't have health/maxHealth - use combat defaults
    const health = (currentCharacter as { health?: number })?.health || 100;
    const maxHealth = (currentCharacter as { maxHealth?: number })?.maxHealth || 100;
    const skill = characterSkill ?? (currentCharacter?.stats?.combat || 10);
    const skillRatio = skill / Math.max(requiredSkill, 1);
    const healthRatio = health / maxHealth;

    // Calculate risk
    const risk = calculateSimpleRisk(actionDanger, skillRatio, healthRatio);
    const level = getDangerLevelFromRisk(risk);

    return {
      dangerLevel: level,
      config: DANGER_LEVEL_CONFIG[level]
    };
  }, [actionDanger, requiredSkill, characterSkill, currentCharacter]);

  // Get styling
  const borderColor = getBorderColor(dangerLevel);
  const glowEffect = getGlowEffect(dangerLevel);
  const backgroundTint = getBackgroundTint(dangerLevel);
  const skullOpacity = getSkullOpacity(dangerLevel);

  // Handle hover changes
  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true, dangerLevel);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange?.(false, dangerLevel);
  };

  // Determine if we should show the tooltip warning
  const showWarning = dangerLevel !== DangerLevel.SAFE;
  const tooltip = config.tooltip;

  return (
    <div
      ref={containerRef}
      className={`
        relative
        transition-all duration-300 ease-out
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background tint overlay */}
      <div
        className={`
          absolute inset-0 rounded-lg pointer-events-none
          transition-opacity duration-300
          ${backgroundTint}
          ${isHovered ? 'opacity-100' : 'opacity-70'}
        `}
      />

      {/* Skull watermark */}
      {skullOpacity > 0 && (
        <SkullWatermark opacity={isHovered ? skullOpacity * 1.5 : skullOpacity} />
      )}

      {/* Danger warning tooltip on hover */}
      {showWarning && isHovered && (
        <div
          className={`
            absolute -top-8 left-1/2 transform -translate-x-1/2
            px-3 py-1 rounded-full text-xs font-bold
            bg-red-900/90 text-red-100 border border-red-700
            whitespace-nowrap z-10 animate-fade-in
            ${dangerLevel === DangerLevel.CERTAIN_DOOM ? 'animate-pulse' : ''}
          `}
        >
          {tooltip}
        </div>
      )}

      {/* Death risk border and glow wrapper */}
      <div
        className={`
          relative
          rounded-lg
          border-4 ${borderColor}
          ${glowEffect}
          transition-all duration-300
        `}
      >
        {/* Child content (ActionCard) */}
        {children}
      </div>

      {/* Danger level indicator badge */}
      {dangerLevel !== DangerLevel.SAFE && (
        <div
          className={`
            absolute -top-2 -right-2
            px-2 py-0.5 rounded-full text-xs font-bold uppercase
            ${dangerLevel === DangerLevel.CERTAIN_DOOM
              ? 'bg-red-900 text-red-100 animate-pulse'
              : dangerLevel === DangerLevel.DEADLY
                ? 'bg-red-800 text-red-100'
                : dangerLevel === DangerLevel.PERILOUS
                  ? 'bg-red-700 text-red-100'
                  : dangerLevel === DangerLevel.DANGEROUS
                    ? 'bg-orange-600 text-orange-100'
                    : 'bg-yellow-600 text-yellow-100'
            }
            border border-black/30
            shadow-lg
          `}
        >
          {dangerLevel === DangerLevel.CERTAIN_DOOM ? '☠️ DOOM' :
           dangerLevel === DangerLevel.DEADLY ? '💀 DEADLY' :
           dangerLevel === DangerLevel.PERILOUS ? '⚠️ PERILOUS' :
           dangerLevel === DangerLevel.DANGEROUS ? '⚠️ DANGER' :
           '👁️ RISKY'}
        </div>
      )}
    </div>
  );
};

/**
 * Simpler version for inline use
 */
export const DeathRiskBadge: React.FC<{
  dangerLevel: DangerLevel;
  className?: string;
}> = ({ dangerLevel, className = '' }) => {
  if (dangerLevel === DangerLevel.SAFE) return null;

  const config = DANGER_LEVEL_CONFIG[dangerLevel];

  const bgColor = {
    [DangerLevel.SAFE]: '',
    [DangerLevel.UNEASY]: 'bg-yellow-600',
    [DangerLevel.DANGEROUS]: 'bg-orange-600',
    [DangerLevel.PERILOUS]: 'bg-red-600',
    [DangerLevel.DEADLY]: 'bg-red-800',
    [DangerLevel.CERTAIN_DOOM]: 'bg-red-900 animate-pulse',
  }[dangerLevel];

  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5 rounded text-xs font-bold
        ${bgColor} text-white
        ${className}
      `}
      title={config.tooltip}
    >
      💀 {dangerLevel.toUpperCase().replace('_', ' ')}
    </span>
  );
};

export default DeathRiskIndicator;
