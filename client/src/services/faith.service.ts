/**
 * Faith Service - Divine Struggle System
 *
 * API client for Faith, Sin, and Divine Intervention systems
 * This is a facade/alias for sanity.service.ts (cosmic horror -> angels & demons rebrand)
 */

// api available but service delegates to sanity.service
import type {
  SanityTracker as FaithTracker,
  SanityState as FaithState,
  Hallucination as DivineVision,
  Trauma as SpiritualWound,
  SanityCheck as FaithCheck,
  SanityRestoration as FaithRestoration,
} from '@desperados/shared';
import type {
  CharacterCorruption as CharacterSin,
  CorruptionLevel as SinLevel,
  MadnessEffect as TormentEffect,
  MadnessType as TormentType,
  ForbiddenKnowledgeType as SacredKnowledgeType,
  RealityDistortion as DivineIntervention,
} from '@desperados/shared';

// Re-export everything from sanity.service for backward compatibility
export {
  sanityService,
  // Request types
  type LoseSanityRequest,
  type RestoreSanityRequest,
  type PerformSanityCheckRequest,
  type GainCorruptionRequest,
  type PurgeCorruptionRequest,
  type CureMadnessRequest,
  type LearnKnowledgeRequest,
  type RollForDistortionRequest,
  type ForceDistortionRequest,
  // Response types
  type SanityStatusResponse,
  type CorruptionStatusResponse,
  type MadnessResponse,
  type TransformationRiskResponse,
  type NPCReactionResponse,
  type CombatModifiersResponse,
  type ActiveDistortionsResponse,
  type AllDistortionsResponse,
  type LocationStabilityResponse,
} from './sanity.service';

// Import for aliasing
import { sanityService } from './sanity.service';
import type {
  LoseSanityRequest,
  RestoreSanityRequest,
  PerformSanityCheckRequest,
  GainCorruptionRequest,
  PurgeCorruptionRequest,
  CureMadnessRequest,
  LearnKnowledgeRequest,
  // Types below available but not used in current aliases:
  // RollForDistortionRequest, ForceDistortionRequest,
  // SanityStatusResponse, CorruptionStatusResponse,
  // MadnessResponse, TransformationRiskResponse,
  NPCReactionResponse,
  CombatModifiersResponse,
  ActiveDistortionsResponse,
  AllDistortionsResponse,
  LocationStabilityResponse,
} from './sanity.service';

// ===== Divine Terminology Type Aliases =====

export interface LoseFaithRequest {
  amount: number;
  source?: string;
}

export interface RestoreFaithRequest {
  methodId: string;
}

export interface PerformFaithCheckRequest {
  difficulty: number;
}

export interface GainSinRequest {
  amount: number;
  source?: string;
  location?: string;
}

export interface AbsolveSinRequest {
  amount: number;
  method?: string;
}

export interface HealTormentRequest {
  method: string;
}

export interface LearnSacredKnowledgeRequest {
  knowledge: SacredKnowledgeType;
  faithCost?: number;
  sinCost?: number;
}

export interface FaithStatusResponse {
  faith: FaithTracker;
  currentState: FaithState;
  combatPenalty: number;
}

export interface SinStatusResponse {
  sin: CharacterSin;
  currentLevel: SinLevel;
  effects: {
    damageBonus: number;
    divineResistance: number;
    infernalSight: boolean;
    healingPenalty: number;
    npcReactionPenalty: number;
    damnationRisk: number;
  };
}

export interface TormentResponse {
  active: TormentEffect[];
  permanent: TormentType[];
  totalCount: number;
}

export interface DamnationRiskResponse {
  risk: number;
  sinLevel: SinLevel;
  daysUntilDamnation?: number;
  warnings: string[];
}

// ===== Faith Service =====

export const faithService = {
  // ============================================
  // FAITH ENDPOINTS (was SANITY)
  // ============================================

  /**
   * Get faith status and statistics
   */
  async getFaithStatus(): Promise<FaithStatusResponse> {
    const response = await sanityService.getSanityStatus();
    return {
      faith: response.sanity as unknown as FaithTracker,
      currentState: response.currentState as unknown as FaithState,
      combatPenalty: response.combatPenalty,
    };
  },

  /**
   * Lose faith (triggered by demonic encounters)
   */
  async loseFaith(request: LoseFaithRequest): Promise<FaithTracker> {
    return sanityService.loseSanity(request as LoseSanityRequest) as unknown as FaithTracker;
  },

  /**
   * Restore faith through prayer or holy rituals
   */
  async restoreFaith(request: RestoreFaithRequest): Promise<FaithTracker> {
    return sanityService.restoreSanity(request as RestoreSanityRequest) as unknown as FaithTracker;
  },

  /**
   * Perform a faith check (test of spiritual fortitude)
   */
  async performFaithCheck(request: PerformFaithCheckRequest): Promise<FaithCheck> {
    return sanityService.performSanityCheck(request as PerformSanityCheckRequest) as unknown as FaithCheck;
  },

  /**
   * Get active divine visions (was hallucinations)
   */
  async getDivineVisions(): Promise<DivineVision[]> {
    return sanityService.getHallucinations() as unknown as DivineVision[];
  },

  /**
   * Get permanent spiritual wounds (was traumas)
   */
  async getSpiritualWounds(): Promise<SpiritualWound[]> {
    return sanityService.getTraumas() as unknown as SpiritualWound[];
  },

  /**
   * Get combat penalty from wavering faith
   */
  async getFaithCombatPenalty(): Promise<number> {
    return sanityService.getCombatPenalty();
  },

  // ============================================
  // SIN ENDPOINTS (was CORRUPTION)
  // ============================================

  /**
   * Get sin status and effects
   */
  async getSinStatus(): Promise<SinStatusResponse> {
    const response = await sanityService.getCorruptionStatus();
    return {
      sin: response.corruption as unknown as CharacterSin,
      currentLevel: response.currentLevel as unknown as SinLevel,
      effects: {
        damageBonus: response.effects.damageBonus,
        divineResistance: response.effects.cosmicResistance,
        infernalSight: response.effects.voidSight,
        healingPenalty: response.effects.healingPenalty,
        npcReactionPenalty: response.effects.npcReactionPenalty,
        damnationRisk: response.effects.transformationRisk,
      },
    };
  },

  /**
   * Gain sin (triggered by infernal encounters or choices)
   */
  async gainSin(request: GainSinRequest): Promise<CharacterSin> {
    return sanityService.gainCorruption(request as GainCorruptionRequest) as unknown as CharacterSin;
  },

  /**
   * Absolve sin through holy rituals
   */
  async absolveSin(request: AbsolveSinRequest): Promise<CharacterSin> {
    return sanityService.purgeCorruption(request as PurgeCorruptionRequest) as unknown as CharacterSin;
  },

  /**
   * Get active and permanent torments (was madness)
   */
  async getTorment(): Promise<TormentResponse> {
    const response = await sanityService.getMadness();
    return {
      active: response.active as unknown as TormentEffect[],
      permanent: response.permanent as unknown as TormentType[],
      totalCount: response.totalCount,
    };
  },

  /**
   * Attempt to heal a torment effect
   */
  async healTorment(tormentId: string, request: HealTormentRequest): Promise<TormentEffect> {
    return sanityService.cureMadness(tormentId, request as CureMadnessRequest) as unknown as TormentEffect;
  },

  /**
   * Learn sacred knowledge (was forbidden knowledge)
   */
  async learnSacredKnowledge(request: LearnSacredKnowledgeRequest): Promise<CharacterSin> {
    const mappedRequest: LearnKnowledgeRequest = {
      knowledge: request.knowledge,
      sanityCost: request.faithCost,
      corruptionCost: request.sinCost,
    };
    return sanityService.learnKnowledge(mappedRequest) as unknown as CharacterSin;
  },

  /**
   * Check damnation risk from high sin (was transformation risk)
   */
  async checkDamnationRisk(): Promise<DamnationRiskResponse> {
    const response = await sanityService.checkTransformationRisk();
    return {
      risk: response.risk,
      sinLevel: response.corruptionLevel as unknown as SinLevel,
      daysUntilDamnation: response.daysUntilTransformation,
      warnings: response.warnings,
    };
  },

  /**
   * Get NPC reaction modifiers from sin
   */
  async getNPCSinReaction(): Promise<NPCReactionResponse> {
    return sanityService.getNPCReaction();
  },

  /**
   * Get combat modifiers from sin
   */
  async getSinCombatModifiers(): Promise<CombatModifiersResponse> {
    return sanityService.getCombatModifiers();
  },

  // ============================================
  // DIVINE INTERVENTION ENDPOINTS (was REALITY DISTORTION)
  // ============================================

  /**
   * Get active divine interventions affecting character
   */
  async getActiveDivineInterventions(): Promise<ActiveDistortionsResponse> {
    return sanityService.getActiveDistortions();
  },

  /**
   * Roll for a divine intervention at current location
   */
  async rollForDivineIntervention(location?: string): Promise<DivineIntervention | null> {
    return sanityService.rollForDistortion({ location }) as unknown as DivineIntervention | null;
  },

  /**
   * Get all possible intervention types
   */
  async getAllDivineInterventions(): Promise<AllDistortionsResponse> {
    return sanityService.getAllDistortions();
  },

  /**
   * Get divine stability of a location (how strongly the veil holds)
   */
  async getLocationDivineStability(location?: string): Promise<LocationStabilityResponse> {
    return sanityService.getLocationStability(location);
  },

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get faith state from numeric value
   */
  getFaithState(faith: number): FaithState {
    return sanityService.getSanityState(faith) as unknown as FaithState;
  },

  /**
   * Get sin level from numeric value
   */
  getSinLevel(sin: number): SinLevel {
    return sanityService.getCorruptionLevel(sin) as unknown as SinLevel;
  },

  /**
   * Check if faith is critically low
   */
  isCriticalFaith(faith: number): boolean {
    return sanityService.isCriticalSanity(faith);
  },

  /**
   * Check if sin level is dangerous
   */
  isDangerousSin(sin: number): boolean {
    return sanityService.isDangerousCorruption(sin);
  },

  /**
   * Format faith value for display
   */
  formatFaith(faith: number): string {
    return sanityService.formatSanity(faith);
  },

  /**
   * Format sin value for display
   */
  formatSin(sin: number): string {
    return sanityService.formatCorruption(sin);
  },

  /**
   * Get faith state color for UI
   */
  getFaithColor(faith: number): string {
    return sanityService.getSanityColor(faith);
  },

  /**
   * Get sin level color for UI
   */
  getSinColor(sin: number): string {
    // Override with divine-themed colors
    if (sin <= 20) return 'gold';     // Pure - blessed
    if (sin <= 40) return 'silver';   // Tempted - tarnished
    if (sin <= 60) return 'orange';   // Stained - burning
    if (sin <= 80) return 'crimson';  // Fallen - bleeding
    return 'black';                    // Damned - consumed
  },

  /**
   * Get faith restoration methods (prayer, holy rituals)
   */
  getFaithRestorationMethods(): FaithRestoration[] {
    const methods = sanityService.getRestorationMethods();
    // Map to divine terminology
    return methods.map(method => ({
      ...method,
      name: method.name.replace('Sanity', 'Faith'),
      description: method.description.replace('sanity', 'faith').replace('mind', 'soul'),
    })) as unknown as FaithRestoration[];
  },

  /**
   * Get divine faith state descriptions
   */
  getFaithStateDescription(faith: number): string {
    if (faith >= 75) return 'Your faith burns brightly. Angels watch over you.';
    if (faith >= 50) return 'Your faith wavers but holds. Stay vigilant.';
    if (faith >= 25) return 'Your faith weakens. Demons sense your doubt.';
    if (faith >= 10) return 'Your faith crumbles. The darkness closes in.';
    return 'Your faith is shattered. You stand at the threshold of damnation.';
  },

  /**
   * Get divine sin level descriptions
   */
  getSinLevelDescription(sin: number): string {
    if (sin <= 20) return 'Your soul remains pure. The faithful welcome you.';
    if (sin <= 40) return 'Temptation has touched you. Demons whisper at the edge of hearing.';
    if (sin <= 60) return 'Sin stains your soul. You walk between light and darkness.';
    if (sin <= 80) return 'You have fallen far. Redemption grows distant.';
    return 'Your soul is damned. Only divine miracle could save you now.';
  },
};

// Default export
export default faithService;

/**
 * Terminology mapping reference:
 *
 * Old (Cosmic Horror)         ->  New (Divine Struggle)
 * ----------------------------------------------------------
 * Sanity                     ->  Faith
 * SanityTracker              ->  FaithTracker
 * SanityState                ->  FaithState
 * Hallucination              ->  Divine Vision
 * Trauma                     ->  Spiritual Wound
 * SanityCheck                ->  Faith Check
 * SanityRestoration          ->  Faith Restoration
 * Corruption                 ->  Sin
 * CorruptionLevel            ->  SinLevel
 * MadnessEffect              ->  TormentEffect
 * MadnessType                ->  TormentType
 * ForbiddenKnowledge         ->  SacredKnowledge
 * RealityDistortion          ->  DivineIntervention
 * DistortionType             ->  InterventionType
 * Transformation Risk        ->  Damnation Risk
 */
