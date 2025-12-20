/**
 * Sanity Service
 * API client for Sanity, Corruption, and Reality Distortion systems
 */

import api from './api';
import type {
  SanityTracker,
  SanityState,
  Hallucination,
  Trauma,
  SanityCheck,
  SanityRestoration,
} from '@desperados/shared';
import type {
  CharacterCorruption,
  CorruptionLevel,
  MadnessEffect,
  MadnessType,
  ForbiddenKnowledgeType,
  RealityDistortion,
  DistortionType,
} from '@desperados/shared';

// ===== Request Types =====

export interface LoseSanityRequest {
  amount: number;
  source?: string;
}

export interface RestoreSanityRequest {
  methodId: string;
}

export interface PerformSanityCheckRequest {
  difficulty: number; // 1-10
}

export interface GainCorruptionRequest {
  amount: number;
  source?: string;
  location?: string;
}

export interface PurgeCorruptionRequest {
  amount: number;
  method?: string;
}

export interface CureMadnessRequest {
  method: string;
}

export interface LearnKnowledgeRequest {
  knowledge: ForbiddenKnowledgeType;
  sanityCost?: number;
  corruptionCost?: number;
}

export interface RollForDistortionRequest {
  location?: string;
}

export interface ForceDistortionRequest {
  distortionId: string;
}

// ===== Response Types =====

export interface SanityStatusResponse {
  sanity: SanityTracker;
  currentState: SanityState;
  combatPenalty: number;
}

export interface CorruptionStatusResponse {
  corruption: CharacterCorruption;
  currentLevel: CorruptionLevel;
  effects: {
    damageBonus: number;
    cosmicResistance: number;
    voidSight: boolean;
    healingPenalty: number;
    npcReactionPenalty: number;
    transformationRisk: number;
  };
}

export interface MadnessResponse {
  active: MadnessEffect[];
  permanent: MadnessType[];
  totalCount: number;
}

export interface TransformationRiskResponse {
  risk: number;
  corruptionLevel: CorruptionLevel;
  daysUntilTransformation?: number;
  warnings: string[];
}

export interface NPCReactionResponse {
  modifier: number;
  corruptionLevel: CorruptionLevel;
  description: string;
}

export interface CombatModifiersResponse {
  damageBonus: number;
  cosmicResistance: number;
  healingPenalty: number;
  sanityPenalty: number;
  specialAbilities: string[];
}

export interface ActiveDistortionsResponse {
  distortions: RealityDistortion[];
  count: number;
}

export interface AllDistortionsResponse {
  distortions: Array<{
    id: string;
    type: DistortionType;
    name: string;
    description: string;
    severity: number;
  }>;
}

export interface LocationStabilityResponse {
  location: string;
  stability: number; // 0-100
  distortionChance: number;
  corruptionLevel: number;
  warnings: string[];
}

// ===== Sanity Service =====

export const sanityService = {
  // ============================================
  // SANITY ENDPOINTS
  // ============================================

  /**
   * Get sanity status and statistics
   * GET /api/sanity
   */
  async getSanityStatus(): Promise<SanityStatusResponse> {
    const response = await api.get<{ data: SanityStatusResponse }>('/sanity');
    return response.data.data;
  },

  /**
   * Lose sanity (triggered by events or admin)
   * POST /api/sanity/lose
   */
  async loseSanity(request: LoseSanityRequest): Promise<SanityTracker> {
    const response = await api.post<{ data: { sanity: SanityTracker } }>(
      '/sanity/lose',
      request
    );
    return response.data.data.sanity;
  },

  /**
   * Use a sanity restoration method
   * POST /api/sanity/restore
   */
  async restoreSanity(request: RestoreSanityRequest): Promise<SanityTracker> {
    const response = await api.post<{ data: { sanity: SanityTracker } }>(
      '/sanity/restore',
      request
    );
    return response.data.data.sanity;
  },

  /**
   * Perform a sanity check
   * POST /api/sanity/check
   */
  async performSanityCheck(request: PerformSanityCheckRequest): Promise<SanityCheck> {
    const response = await api.post<{ data: { check: SanityCheck } }>(
      '/sanity/check',
      request
    );
    return response.data.data.check;
  },

  /**
   * Get active hallucinations
   * GET /api/sanity/hallucinations
   */
  async getHallucinations(): Promise<Hallucination[]> {
    const response = await api.get<{ data: { hallucinations: Hallucination[] } }>(
      '/sanity/hallucinations'
    );
    return response.data.data.hallucinations;
  },

  /**
   * Get permanent traumas
   * GET /api/sanity/traumas
   */
  async getTraumas(): Promise<Trauma[]> {
    const response = await api.get<{ data: { traumas: Trauma[] } }>(
      '/sanity/traumas'
    );
    return response.data.data.traumas;
  },

  /**
   * Get combat penalty from low sanity
   * GET /api/sanity/combat-penalty
   */
  async getCombatPenalty(): Promise<number> {
    const response = await api.get<{ data: { penalty: number } }>(
      '/sanity/combat-penalty'
    );
    return response.data.data.penalty;
  },

  // ============================================
  // CORRUPTION ENDPOINTS
  // ============================================

  /**
   * Get corruption status and effects
   * GET /api/sanity/corruption
   */
  async getCorruptionStatus(): Promise<CorruptionStatusResponse> {
    const response = await api.get<{ data: CorruptionStatusResponse }>(
      '/sanity/corruption'
    );
    return response.data.data;
  },

  /**
   * Gain corruption (triggered by events or admin)
   * POST /api/sanity/corruption/gain
   */
  async gainCorruption(request: GainCorruptionRequest): Promise<CharacterCorruption> {
    const response = await api.post<{ data: { corruption: CharacterCorruption } }>(
      '/sanity/corruption/gain',
      request
    );
    return response.data.data.corruption;
  },

  /**
   * Purge corruption
   * POST /api/sanity/corruption/purge
   */
  async purgeCorruption(request: PurgeCorruptionRequest): Promise<CharacterCorruption> {
    const response = await api.post<{ data: { corruption: CharacterCorruption } }>(
      '/sanity/corruption/purge',
      request
    );
    return response.data.data.corruption;
  },

  /**
   * Get active and permanent madness effects
   * GET /api/sanity/madness
   */
  async getMadness(): Promise<MadnessResponse> {
    const response = await api.get<{ data: MadnessResponse }>('/sanity/madness');
    return response.data.data;
  },

  /**
   * Attempt to cure a madness effect
   * POST /api/sanity/madness/:madnessId/cure
   */
  async cureMadness(madnessId: string, request: CureMadnessRequest): Promise<MadnessEffect> {
    const response = await api.post<{ data: { madness: MadnessEffect } }>(
      `/sanity/madness/${madnessId}/cure`,
      request
    );
    return response.data.data.madness;
  },

  /**
   * Learn forbidden knowledge
   * POST /api/sanity/knowledge/learn
   */
  async learnKnowledge(request: LearnKnowledgeRequest): Promise<CharacterCorruption> {
    const response = await api.post<{ data: { corruption: CharacterCorruption } }>(
      '/sanity/knowledge/learn',
      request
    );
    return response.data.data.corruption;
  },

  /**
   * Check transformation risk from high corruption
   * GET /api/sanity/transformation-risk
   */
  async checkTransformationRisk(): Promise<TransformationRiskResponse> {
    const response = await api.get<{ data: TransformationRiskResponse }>(
      '/sanity/transformation-risk'
    );
    return response.data.data;
  },

  /**
   * Get NPC reaction modifiers from corruption
   * GET /api/sanity/npc-reaction
   */
  async getNPCReaction(): Promise<NPCReactionResponse> {
    const response = await api.get<{ data: NPCReactionResponse }>(
      '/sanity/npc-reaction'
    );
    return response.data.data;
  },

  /**
   * Get combat modifiers from corruption
   * GET /api/sanity/combat-modifiers
   */
  async getCombatModifiers(): Promise<CombatModifiersResponse> {
    const response = await api.get<{ data: CombatModifiersResponse }>(
      '/sanity/combat-modifiers'
    );
    return response.data.data;
  },

  // ============================================
  // REALITY DISTORTION ENDPOINTS
  // ============================================

  /**
   * Get active reality distortions affecting character
   * GET /api/sanity/distortions
   */
  async getActiveDistortions(): Promise<ActiveDistortionsResponse> {
    const response = await api.get<{ data: ActiveDistortionsResponse }>(
      '/sanity/distortions'
    );
    return response.data.data;
  },

  /**
   * Roll for a reality distortion at current location
   * POST /api/sanity/distortions/roll
   */
  async rollForDistortion(request: RollForDistortionRequest = {}): Promise<RealityDistortion | null> {
    const response = await api.post<{ data: { distortion: RealityDistortion | null } }>(
      '/sanity/distortions/roll',
      request
    );
    return response.data.data.distortion;
  },

  /**
   * Get all possible distortion types
   * GET /api/sanity/distortions/all
   */
  async getAllDistortions(): Promise<AllDistortionsResponse> {
    const response = await api.get<{ data: AllDistortionsResponse }>(
      '/sanity/distortions/all'
    );
    return response.data.data;
  },

  /**
   * Get reality stability of a location
   * GET /api/sanity/location-stability
   * @param location - Optional location name (defaults to character's current location)
   */
  async getLocationStability(location?: string): Promise<LocationStabilityResponse> {
    const params = location ? { location } : {};
    const response = await api.get<{ data: LocationStabilityResponse }>(
      '/sanity/location-stability',
      { params }
    );
    return response.data.data;
  },

  /**
   * Force a specific distortion (admin/testing)
   * POST /api/sanity/distortions/force
   */
  async forceDistortion(request: ForceDistortionRequest): Promise<RealityDistortion> {
    const response = await api.post<{ data: { distortion: RealityDistortion } }>(
      '/sanity/distortions/force',
      request
    );
    return response.data.data.distortion;
  },

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get sanity state from numeric value
   */
  getSanityState(sanity: number): SanityState {
    if (sanity >= 75) return 'stable' as SanityState;
    if (sanity >= 50) return 'rattled' as SanityState;
    if (sanity >= 25) return 'shaken' as SanityState;
    if (sanity >= 10) return 'breaking' as SanityState;
    return 'shattered' as SanityState;
  },

  /**
   * Get corruption level from numeric value
   */
  getCorruptionLevel(corruption: number): CorruptionLevel {
    if (corruption <= 20) return 'clean' as CorruptionLevel;
    if (corruption <= 40) return 'touched' as CorruptionLevel;
    if (corruption <= 60) return 'tainted' as CorruptionLevel;
    if (corruption <= 80) return 'corrupted' as CorruptionLevel;
    return 'lost' as CorruptionLevel;
  },

  /**
   * Check if sanity is critically low
   */
  isCriticalSanity(sanity: number): boolean {
    return sanity < 25;
  },

  /**
   * Check if corruption is dangerous
   */
  isDangerousCorruption(corruption: number): boolean {
    return corruption >= 60;
  },

  /**
   * Format sanity value for display
   */
  formatSanity(sanity: number): string {
    return `${Math.round(sanity)}/100`;
  },

  /**
   * Format corruption value for display
   */
  formatCorruption(corruption: number): string {
    return `${Math.round(corruption)}/100`;
  },

  /**
   * Get sanity state color for UI
   */
  getSanityColor(sanity: number): string {
    if (sanity >= 75) return 'green';
    if (sanity >= 50) return 'yellow';
    if (sanity >= 25) return 'orange';
    return 'red';
  },

  /**
   * Get corruption level color for UI
   */
  getCorruptionColor(corruption: number): string {
    if (corruption <= 20) return 'white';
    if (corruption <= 40) return 'gray';
    if (corruption <= 60) return 'purple';
    if (corruption <= 80) return 'darkpurple';
    return 'black';
  },

  /**
   * Get available restoration methods
   */
  getRestorationMethods(): SanityRestoration[] {
    // This would ideally come from the backend, but for now return the shared constants
    return [
      {
        methodId: 'spirit_springs',
        name: 'Spirit Springs',
        description: 'Sacred healing waters that cleanse the mind and restore sanity.',
        location: 'Spirit Springs',
        sanityRestored: 50,
        energyCost: 10,
        cooldown: 60,
      },
      {
        methodId: 'church_prayer',
        name: 'Prayer at Church',
        description: 'Seek solace in prayer. Faith can be a shield against darkness.',
        location: 'Church',
        sanityRestored: 15,
        cost: 5,
        energyCost: 5,
        cooldown: 30,
      },
      {
        methodId: 'medicine_lodge',
        name: 'Medicine Lodge Ceremony',
        description: 'Nahi shamans perform a cleansing ritual with sage and chanting.',
        location: 'Medicine Lodge',
        sanityRestored: 30,
        cost: 25,
        energyCost: 15,
        cooldown: 45,
        requirements: {
          minLevel: 5,
        },
      },
      {
        methodId: 'doctors_sedation',
        name: "Doctor's Sedation",
        description: 'A strong sedative and medical care. Not ideal, but it works.',
        location: "Doctor's Office",
        sanityRestored: 20,
        cost: 30,
        energyCost: 0,
      },
      {
        methodId: 'safe_rest',
        name: 'Safe Rest',
        description: 'Rest in a safe, well-lit location. Time heals all wounds.',
        location: 'Any Safe Town',
        sanityRestored: 10,
        energyCost: 5,
        cooldown: 15,
      },
    ];
  },

  /**
   * Calculate effective sanity after hallucinations
   */
  calculateEffectiveSanity(
    baseSanity: number,
    hallucinations: Hallucination[]
  ): number {
    const totalSeverity = hallucinations.reduce((sum, h) => sum + h.severity, 0);
    return Math.max(0, baseSanity - totalSeverity * 2);
  },

  /**
   * Calculate effective max sanity after traumas
   */
  calculateEffectiveMaxSanity(baseMax: number, traumas: Trauma[]): number {
    const totalReduction = traumas.reduce(
      (sum, t) => sum + t.maxSanityReduction,
      0
    );
    return Math.max(50, baseMax - totalReduction);
  },

  /**
   * Check if character can use a restoration method
   */
  canUseRestoration(
    method: SanityRestoration,
    characterLevel: number,
    currentEnergy: number,
    currentGold: number
  ): { canUse: boolean; reason?: string } {
    if (method.requirements?.minLevel && characterLevel < method.requirements.minLevel) {
      return {
        canUse: false,
        reason: `Requires level ${method.requirements.minLevel}`,
      };
    }

    if (method.energyCost && currentEnergy < method.energyCost) {
      return {
        canUse: false,
        reason: `Requires ${method.energyCost} energy`,
      };
    }

    if (method.cost && currentGold < method.cost) {
      return {
        canUse: false,
        reason: `Requires ${method.cost} gold`,
      };
    }

    return { canUse: true };
  },
};

export default sanityService;
