/**
 * Combat Service Module
 *
 * Modular combat system with 6 focused sub-services.
 * Import from 'services/combat' for the CombatService facade,
 * or import specific services directly.
 *
 * Architecture:
 * - CombatCalculationService: Pure damage/HP calculations
 * - CombatNPCService: NPC AI and card strategy
 * - CombatRewardService: Loot and achievement distribution
 * - CombatTurnService: Player turn lifecycle
 * - CombatInitiationService: Session creation and queries
 * - BossMechanicsService: 11 boss-specific mechanics
 */

// Sub-services - class exports
export { CombatCalculationService } from './combatCalculation.service';
export { CombatNPCService } from './combatNPC.service';
export { CombatRewardService } from './combatReward.service';
export { CombatTurnService } from './combatTurn.service';
export { CombatInitiationService, COMBAT_ENERGY_COST, MAX_FLEE_ROUNDS } from './combatInitiation.service';
export { BossMechanicsService } from './bossMechanics.service';

// Type exports
export type { DamageCalculationResult } from './combatCalculation.service';
export type { NPCTurnResult } from './combatNPC.service';
export type { DeathPenaltyResult } from './combatReward.service';
export type { CanFightBossResult, BossStatsResult, CombatHistoryResult } from './combatInitiation.service';
export type {
  PreCombatChallenge,
  PreCombatChallengeResult,
  DialogueChoice,
  DialogueChoiceResult,
  SpiritRotationResult,
  ColdStacksResult,
  CorruptionStacksResult,
  OxygenDepletionResult,
  PokerRoundResult,
  GuiltVisionResult,
  AltarActivationResult,
  AltarPurificationResult,
  BluffRoundResult,
  PokerShowdownResult,
  SpiritTrailResult,
  Altar
} from './bossMechanics.service';

// Facade - maintains the original CombatService API
export { CombatService } from './combatFacade.service';
export { CombatService as default } from './combatFacade.service';
