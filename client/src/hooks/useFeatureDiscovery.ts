/**
 * useFeatureDiscovery Hook
 * Track feature availability, unlock status, and "new" badges for navigation
 *
 * Phase 1: UI Polish - Foundation & Design System
 *
 * @example
 * ```tsx
 * const { getFeatureStatus, markAsVisited, isFeatureNew } = useFeatureDiscovery();
 *
 * // Check feature availability
 * const heistStatus = getFeatureStatus('heists');
 * // Returns: { available: true, isNew: true, lockReason: null }
 *
 * // Mark as visited when user clicks
 * markAsVisited('heists');
 * ```
 */

import { useCallback, useMemo } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';

// =============================================================================
// TYPES
// =============================================================================

export type FeatureId =
  // Combat & Activities
  | 'combat'
  | 'duels'
  | 'hunting'
  | 'legendary-hunts'
  | 'bounty-hunting'
  | 'expeditions'
  | 'fishing'
  // Gang & Social
  | 'gang'
  | 'heists'
  | 'raids'
  | 'organized-crime'
  | 'territory-warfare'
  | 'gang-wars'
  // Economy & Production
  | 'crafting'
  | 'workshop'
  | 'mining'
  | 'properties'
  | 'marketplace'
  | 'gambling'
  // Progression
  | 'skills'
  | 'quests'
  | 'achievements'
  | 'divine-paths'
  | 'legendary-creatures'
  // Social
  | 'chat'
  | 'mail'
  | 'player-search'
  | 'leaderboard'
  // Advanced
  | 'prestige'
  | 'mentors'
  | 'rituals'
  | 'cosmic';

export type FeatureStatus = 'locked' | 'available' | 'new';

export interface FeatureInfo {
  id: FeatureId;
  /** Whether the feature is available to the player */
  available: boolean;
  /** Whether the feature is newly available (not yet visited) */
  isNew: boolean;
  /** Current status for UI display */
  status: FeatureStatus;
  /** Reason why feature is locked (if locked) */
  lockReason: string | null;
  /** Level at which feature unlocks (if applicable) */
  unlockLevel?: number;
  /** Progress towards unlock (0-1) */
  unlockProgress?: number;
}

export interface FeatureRequirement {
  /** Minimum total level required */
  minLevel?: number;
  /** Minimum skill level required (skillId: level) */
  minSkillLevel?: { skill: string; level: number };
  /** Must be in a gang */
  requiresGang?: boolean;
  /** Gang role required */
  requiresGangRole?: 'member' | 'officer' | 'leader';
  /** Must have property */
  requiresProperty?: boolean;
  /** Custom check function */
  customCheck?: (character: CharacterData) => boolean;
}

interface CharacterData {
  level: number;
  totalLevel: number;
  gangId?: string | null;
  gangRole?: string;
  skills?: Record<string, number>;
  hasProperty?: boolean;
  isPremium?: boolean;
}

// =============================================================================
// FEATURE REQUIREMENTS DEFINITION
// =============================================================================

const FEATURE_REQUIREMENTS: Record<FeatureId, FeatureRequirement> = {
  // Combat & Activities - mostly available early
  'combat': { minLevel: 1 },
  'duels': { minLevel: 5 },
  'hunting': { minLevel: 10 },
  'legendary-hunts': { minLevel: 25 },
  'bounty-hunting': { minLevel: 15 },
  'expeditions': { minLevel: 10 },
  'fishing': { minLevel: 5 },

  // Gang & Social - require gang membership
  'gang': { minLevel: 10 },
  'heists': { minLevel: 25, requiresGang: true },
  'raids': { minLevel: 30, requiresGang: true },
  'organized-crime': { minLevel: 20, requiresGang: true },
  'territory-warfare': { minLevel: 35, requiresGang: true, requiresGangRole: 'officer' },
  'gang-wars': { minLevel: 40, requiresGang: true, requiresGangRole: 'leader' },

  // Economy & Production
  'crafting': { minLevel: 5 },
  'workshop': { minLevel: 15 },
  'mining': { minLevel: 20 },
  'properties': { minLevel: 25 },
  'marketplace': { minLevel: 10 },
  'gambling': { minLevel: 5 },

  // Progression - mostly available
  'skills': { minLevel: 1 },
  'quests': { minLevel: 1 },
  'achievements': { minLevel: 1 },
  'divine-paths': { minLevel: 30 },
  'legendary-creatures': { minLevel: 20 },

  // Social - available early
  'chat': { minLevel: 1 },
  'mail': { minLevel: 5 },
  'player-search': { minLevel: 5 },
  'leaderboard': { minLevel: 1 },

  // Advanced features
  'prestige': { minLevel: 100 },
  'mentors': { minLevel: 15 },
  'rituals': { minLevel: 40 },
  'cosmic': { minLevel: 50 },
};

// =============================================================================
// LOCAL STORAGE KEYS
// =============================================================================

const VISITED_FEATURES_KEY = 'desperados_visited_features';

/**
 * Get visited features from localStorage
 */
const getVisitedFeatures = (): Set<FeatureId> => {
  try {
    const stored = localStorage.getItem(VISITED_FEATURES_KEY);
    if (stored) {
      return new Set(JSON.parse(stored) as FeatureId[]);
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
};

/**
 * Save visited features to localStorage
 */
const saveVisitedFeatures = (visited: Set<FeatureId>): void => {
  try {
    localStorage.setItem(VISITED_FEATURES_KEY, JSON.stringify([...visited]));
  } catch {
    // Ignore storage errors
  }
};

// =============================================================================
// REQUIREMENT CHECK HELPER
// =============================================================================

const checkRequirement = (
  requirement: FeatureRequirement,
  character: CharacterData | null
): { met: boolean; reason: string | null; progress?: number } => {
  if (!character) {
    return { met: false, reason: 'No character selected' };
  }

  // Check minimum level
  if (requirement.minLevel && character.totalLevel < requirement.minLevel) {
    return {
      met: false,
      reason: `Requires Total Level ${requirement.minLevel}`,
      progress: character.totalLevel / requirement.minLevel,
    };
  }

  // Check skill level
  if (requirement.minSkillLevel) {
    const { skill, level } = requirement.minSkillLevel;
    const currentLevel = character.skills?.[skill] || 0;
    if (currentLevel < level) {
      return {
        met: false,
        reason: `Requires ${skill} Level ${level}`,
        progress: currentLevel / level,
      };
    }
  }

  // Check gang membership
  if (requirement.requiresGang && !character.gangId) {
    return { met: false, reason: 'Requires gang membership' };
  }

  // Check gang role
  if (requirement.requiresGangRole) {
    const roleHierarchy = { member: 1, officer: 2, leader: 3 };
    const requiredLevel = roleHierarchy[requirement.requiresGangRole];
    const currentLevel = roleHierarchy[(character.gangRole as keyof typeof roleHierarchy) || 'member'] || 0;

    if (currentLevel < requiredLevel) {
      return {
        met: false,
        reason: `Requires gang ${requirement.requiresGangRole} role`,
      };
    }
  }

  // Check property ownership
  if (requirement.requiresProperty && !character.hasProperty) {
    return { met: false, reason: 'Requires property ownership' };
  }

  // Custom check
  if (requirement.customCheck && !requirement.customCheck(character)) {
    return { met: false, reason: 'Requirements not met' };
  }

  return { met: true, reason: null };
};

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export interface UseFeatureDiscoveryReturn {
  /** Get detailed status for a specific feature */
  getFeatureStatus: (featureId: FeatureId) => FeatureInfo;
  /** Mark a feature as visited (removes "new" badge) */
  markAsVisited: (featureId: FeatureId) => void;
  /** Check if a feature is new (available but not visited) */
  isFeatureNew: (featureId: FeatureId) => boolean;
  /** Check if a feature is available */
  isFeatureAvailable: (featureId: FeatureId) => boolean;
  /** Check if a feature is locked */
  isFeatureLocked: (featureId: FeatureId) => boolean;
  /** Get all features with "new" status */
  getNewFeatures: () => FeatureId[];
  /** Get count of new features (for badge display) */
  newFeatureCount: number;
  /** Clear all visited features (for testing) */
  clearVisitedFeatures: () => void;
}

/**
 * Hook for tracking feature availability and discovery state
 */
export function useFeatureDiscovery(): UseFeatureDiscoveryReturn {
  const currentCharacter = useCharacterStore((state) => state.currentCharacter);

  // Convert character to simplified data structure
  const characterData: CharacterData | null = useMemo(() => {
    if (!currentCharacter) return null;

    // Calculate total level from skills
    const skills = (currentCharacter as any).skills || {};
    const totalLevel = Object.values(skills as Record<string, number>).reduce(
      (sum, level) => sum + (level || 0),
      0
    );

    return {
      level: (currentCharacter as any).level || 1,
      totalLevel: Math.max(totalLevel, 30), // Minimum 30 (base skills)
      gangId: (currentCharacter as any).gangId,
      gangRole: (currentCharacter as any).gangRole,
      skills,
      hasProperty: (currentCharacter as any).properties?.length > 0,
      isPremium: (currentCharacter as any).isPremium,
    };
  }, [currentCharacter]);

  /**
   * Get feature status
   */
  const getFeatureStatus = useCallback(
    (featureId: FeatureId): FeatureInfo => {
      const requirement = FEATURE_REQUIREMENTS[featureId];
      const { met, reason, progress } = checkRequirement(requirement, characterData);
      const visited = getVisitedFeatures();
      const isNew = met && !visited.has(featureId);

      return {
        id: featureId,
        available: met,
        isNew,
        status: !met ? 'locked' : isNew ? 'new' : 'available',
        lockReason: reason,
        unlockLevel: requirement.minLevel,
        unlockProgress: progress,
      };
    },
    [characterData]
  );

  /**
   * Mark feature as visited
   */
  const markAsVisited = useCallback((featureId: FeatureId): void => {
    const visited = getVisitedFeatures();
    if (!visited.has(featureId)) {
      visited.add(featureId);
      saveVisitedFeatures(visited);
    }
  }, []);

  /**
   * Check if feature is new
   */
  const isFeatureNew = useCallback(
    (featureId: FeatureId): boolean => {
      return getFeatureStatus(featureId).isNew;
    },
    [getFeatureStatus]
  );

  /**
   * Check if feature is available
   */
  const isFeatureAvailable = useCallback(
    (featureId: FeatureId): boolean => {
      return getFeatureStatus(featureId).available;
    },
    [getFeatureStatus]
  );

  /**
   * Check if feature is locked
   */
  const isFeatureLocked = useCallback(
    (featureId: FeatureId): boolean => {
      return !getFeatureStatus(featureId).available;
    },
    [getFeatureStatus]
  );

  /**
   * Get all new features
   */
  const getNewFeatures = useCallback((): FeatureId[] => {
    return (Object.keys(FEATURE_REQUIREMENTS) as FeatureId[]).filter((id) =>
      isFeatureNew(id)
    );
  }, [isFeatureNew]);

  /**
   * Count of new features
   */
  const newFeatureCount = useMemo(() => {
    return getNewFeatures().length;
  }, [getNewFeatures]);

  /**
   * Clear visited features (for testing)
   */
  const clearVisitedFeatures = useCallback((): void => {
    localStorage.removeItem(VISITED_FEATURES_KEY);
  }, []);

  return {
    getFeatureStatus,
    markAsVisited,
    isFeatureNew,
    isFeatureAvailable,
    isFeatureLocked,
    getNewFeatures,
    newFeatureCount,
    clearVisitedFeatures,
  };
}

export default useFeatureDiscovery;
