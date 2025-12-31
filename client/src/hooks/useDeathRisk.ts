/**
 * useDeathRisk Hook
 * Calculates and tracks death risk for dangerous actions
 * Provides immersive UI feedback based on danger level
 */

import { useState, useCallback, useMemo } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useFateMarks } from './useFateMarks';

// Define DangerLevel locally to avoid shared package build issues
export enum DangerLevel {
  SAFE = 'safe',
  UNEASY = 'uneasy',
  DANGEROUS = 'dangerous',
  PERILOUS = 'perilous',
  DEADLY = 'deadly',
  CERTAIN_DOOM = 'certain_doom'
}

// Define configs locally to avoid shared package build issues
const DEATH_RISK_CONFIG = {
  overSkilledCap: 1.5,
  healthVulnerabilityFactor: 0.5,
  wantedRiskPerLevel: 0.15,
  equipmentProtection: { min: 0.7, max: 1.0 },
  fateMarkRiskPerMark: 0.1,
  maxRisk: 0.95
};

const DANGER_LEVEL_CONFIG: Record<DangerLevel, { minRisk: number; maxRisk: number; tooltip: string; uiClass: string }> = {
  [DangerLevel.SAFE]: { minRisk: 0, maxRisk: 0.10, tooltip: '', uiClass: 'danger-safe' },
  [DangerLevel.UNEASY]: { minRisk: 0.11, maxRisk: 0.25, tooltip: 'The spirits stir...', uiClass: 'danger-uneasy' },
  [DangerLevel.DANGEROUS]: { minRisk: 0.26, maxRisk: 0.50, tooltip: 'Something watches from beyond...', uiClass: 'danger-dangerous' },
  [DangerLevel.PERILOUS]: { minRisk: 0.51, maxRisk: 0.75, tooltip: "Death's shadow falls upon you...", uiClass: 'danger-perilous' },
  [DangerLevel.DEADLY]: { minRisk: 0.76, maxRisk: 0.90, tooltip: 'The reaper draws near...', uiClass: 'danger-deadly' },
  [DangerLevel.CERTAIN_DOOM]: { minRisk: 0.91, maxRisk: 1.0, tooltip: 'This path leads to the grave...', uiClass: 'danger-doom' }
};

// Types that match shared package (if available, use those, otherwise use local)
interface DeathRiskFactors {
  skillRatio: number;
  healthRatio: number;
  wantedLevel: number;
  actionDanger: number;
  equipmentTier: number;
  fateMarks: number;
}

interface DeathRiskResult {
  risk: number;
  dangerLevel: DangerLevel;
  factors: {
    skillSurvival: number;
    healthVulnerability: number;
    wantedMultiplier: number;
    equipmentProtection: number;
    fateMultiplier: number;
  };
}

export interface DeathRiskState {
  /** Current calculated death risk */
  risk: DeathRiskResult | null;
  /** Whether death risk is being tracked */
  isTracking: boolean;
  /** Current action being evaluated */
  currentAction: string | null;
}

interface UseDeathRiskReturn {
  deathRisk: DeathRiskState;
  calculateRisk: (actionDanger: number, requiredSkill?: number, characterSkill?: number) => DeathRiskResult;
  getDangerLevel: (risk: number) => DangerLevel;
  getDangerConfig: (level: DangerLevel) => typeof DANGER_LEVEL_CONFIG[DangerLevel];
  startTracking: (actionName: string) => void;
  stopTracking: () => void;
  /** Get CSS classes for death risk styling */
  getRiskClasses: (risk: number) => {
    border: string;
    glow: string;
    vignette: string;
    skull: string;
  };
  /** Whether to show vignette effect (76%+ risk) */
  shouldShowVignette: boolean;
  /** Whether to play ominous audio (51%+ risk) */
  shouldPlayAudio: boolean;
  /** Whether screen should desaturate (91%+ risk) */
  shouldDesaturate: boolean;
}

/**
 * Calculate death risk based on various factors
 */
const calculateDeathRiskInternal = (factors: DeathRiskFactors): DeathRiskResult => {
  // Base survival from skill match
  const skillSurvival = Math.min(factors.skillRatio, DEATH_RISK_CONFIG.overSkilledCap);

  // Health vulnerability (wounded = more risk)
  const healthVulnerability = 1 + (1 - factors.healthRatio) * DEATH_RISK_CONFIG.healthVulnerabilityFactor;

  // Wanted level multiplier (bounty makes everything deadlier)
  const wantedMultiplier = 1 + (factors.wantedLevel * DEATH_RISK_CONFIG.wantedRiskPerLevel);

  // Equipment protection
  const equipmentRange = DEATH_RISK_CONFIG.equipmentProtection;
  const equipmentProtection = equipmentRange.min + (factors.equipmentTier * (equipmentRange.max - equipmentRange.min) / 5);

  // Fate marks accumulation
  const fateMultiplier = 1 + (factors.fateMarks * DEATH_RISK_CONFIG.fateMarkRiskPerMark);

  // Final death risk
  const baseRisk = factors.actionDanger * (1 / Math.max(skillSurvival, 0.1));
  const finalRisk = Math.min(
    baseRisk * healthVulnerability * wantedMultiplier * fateMultiplier / equipmentProtection,
    DEATH_RISK_CONFIG.maxRisk
  );

  // Determine danger level
  let dangerLevel = DangerLevel.SAFE;
  for (const [level, config] of Object.entries(DANGER_LEVEL_CONFIG)) {
    if (finalRisk >= config.minRisk && finalRisk <= config.maxRisk) {
      dangerLevel = level as DangerLevel;
      break;
    }
  }

  return {
    risk: finalRisk,
    dangerLevel,
    factors: {
      skillSurvival,
      healthVulnerability,
      wantedMultiplier,
      equipmentProtection,
      fateMultiplier,
    },
  };
};

/**
 * Get danger level from risk percentage
 */
const getDangerLevelFromRisk = (risk: number): DangerLevel => {
  if (risk <= 0.10) return DangerLevel.SAFE;
  if (risk <= 0.25) return DangerLevel.UNEASY;
  if (risk <= 0.50) return DangerLevel.DANGEROUS;
  if (risk <= 0.75) return DangerLevel.PERILOUS;
  if (risk <= 0.90) return DangerLevel.DEADLY;
  return DangerLevel.CERTAIN_DOOM;
};

export const useDeathRisk = (): UseDeathRiskReturn => {
  const [deathRisk, setDeathRisk] = useState<DeathRiskState>({
    risk: null,
    isTracking: false,
    currentAction: null,
  });

  const { currentCharacter } = useCharacterStore();
  const { fateMarks } = useFateMarks();

  // Calculate risk for a given action (pure function - no state updates)
  const calculateRisk = useCallback((
    actionDanger: number,
    requiredSkill: number = 10,
    characterSkill?: number
  ): DeathRiskResult => {
    // Get character stats with fallbacks
    // Note: health/maxHealth may not be in SafeCharacter type, use combat defaults
    const health = (currentCharacter as { health?: number })?.health || 100;
    const maxHealth = (currentCharacter as { maxHealth?: number })?.maxHealth || 100;
    const wantedLevel = currentCharacter?.wantedLevel || 0;
    const equipmentTier = 2; // TODO: Calculate from equipped items

    // Calculate skill ratio
    const skill = characterSkill ?? (currentCharacter?.stats?.combat || 10);
    const skillRatio = skill / Math.max(requiredSkill, 1);

    const factors: DeathRiskFactors = {
      skillRatio,
      healthRatio: health / maxHealth,
      wantedLevel,
      actionDanger,
      equipmentTier,
      fateMarks: fateMarks.count,
    };

    return calculateDeathRiskInternal(factors);
  }, [currentCharacter, fateMarks.count]);

  // Get danger level from risk value
  const getDangerLevel = useCallback((risk: number): DangerLevel => {
    return getDangerLevelFromRisk(risk);
  }, []);

  // Get danger config for a level
  const getDangerConfig = useCallback((level: DangerLevel) => {
    return DANGER_LEVEL_CONFIG[level];
  }, []);

  // Start tracking death risk for an action
  const startTracking = useCallback((actionName: string) => {
    setDeathRisk(prev => ({
      ...prev,
      isTracking: true,
      currentAction: actionName,
    }));
  }, []);

  // Stop tracking death risk
  const stopTracking = useCallback(() => {
    setDeathRisk({
      risk: null,
      isTracking: false,
      currentAction: null,
    });
  }, []);

  // Get CSS classes for death risk styling (Full Immersive Effect)
  const getRiskClasses = useCallback((risk: number): {
    border: string;
    glow: string;
    vignette: string;
    skull: string;
  } => {
    const level = getDangerLevelFromRisk(risk);

    switch (level) {
      case DangerLevel.SAFE:
        return {
          border: 'border-green-600',
          glow: '',
          vignette: '',
          skull: '',
        };
      case DangerLevel.UNEASY:
        return {
          border: 'border-yellow-500',
          glow: 'shadow-yellow-500/20',
          vignette: '',
          skull: 'opacity-10',
        };
      case DangerLevel.DANGEROUS:
        return {
          border: 'border-orange-500',
          glow: 'shadow-orange-500/30',
          vignette: '',
          skull: 'opacity-20',
        };
      case DangerLevel.PERILOUS:
        return {
          border: 'border-red-500',
          glow: 'shadow-red-500/40',
          vignette: 'vignette-danger',
          skull: 'opacity-30 animate-pulse',
        };
      case DangerLevel.DEADLY:
        return {
          border: 'border-red-700',
          glow: 'shadow-red-700/50 shadow-lg',
          vignette: 'vignette-deadly',
          skull: 'opacity-50 animate-pulse',
        };
      case DangerLevel.CERTAIN_DOOM:
        return {
          border: 'border-red-900',
          glow: 'shadow-red-900/60 shadow-xl',
          vignette: 'vignette-doom',
          skull: 'opacity-70 animate-pulse',
        };
      default:
        return {
          border: 'border-wood-medium',
          glow: '',
          vignette: '',
          skull: '',
        };
    }
  }, []);

  // Computed values for immersive effects
  const currentRisk = deathRisk.risk?.risk || 0;

  const shouldShowVignette = useMemo(() => currentRisk >= 0.76, [currentRisk]);
  const shouldPlayAudio = useMemo(() => currentRisk >= 0.51, [currentRisk]);
  const shouldDesaturate = useMemo(() => currentRisk >= 0.91, [currentRisk]);

  return {
    deathRisk,
    calculateRisk,
    getDangerLevel,
    getDangerConfig,
    startTracking,
    stopTracking,
    getRiskClasses,
    shouldShowVignette,
    shouldPlayAudio,
    shouldDesaturate,
  };
};

export default useDeathRisk;
