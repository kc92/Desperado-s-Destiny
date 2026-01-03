/**
 * Combat Service Facade
 *
 * Maintains backwards compatibility with the original CombatService API.
 * All methods delegate to the appropriate sub-service.
 *
 * External consumers can continue using:
 *   import { CombatService } from './services/combat.service';
 *
 * REFACTOR: This facade replaces the original 3,029-line combat.service.ts
 */

import { ICharacter } from '../../models/Character.model';
import { INPC } from '../../models/NPC.model';
import { ICombatEncounter, ICurrentRound, ILootAwarded, ICombatAbilities } from '../../models/CombatEncounter.model';
import { HandRank, CombatAction, CombatActionResult, Card } from '@desperados/shared';
import mongoose from 'mongoose';

// Import sub-services
import { CombatCalculationService, DamageCalculationResult } from './combatCalculation.service';
import { CombatNPCService, NPCTurnResult } from './combatNPC.service';
import { CombatRewardService, DeathPenaltyResult } from './combatReward.service';
import { CombatTurnService } from './combatTurn.service';
import {
  CombatInitiationService,
  CanFightBossResult,
  BossStatsResult,
  CombatHistoryResult,
  COMBAT_ENERGY_COST,
  MAX_FLEE_ROUNDS
} from './combatInitiation.service';
import {
  BossMechanicsService,
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

/**
 * Combat Service Facade
 *
 * This class provides the original CombatService API by delegating
 * to focused sub-services. Maintains full backwards compatibility.
 */
export class CombatService {
  // ============================================================================
  // CONSTANTS (for backwards compatibility)
  // ============================================================================

  static readonly COMBAT_ENERGY_COST = COMBAT_ENERGY_COST;
  static readonly MAX_FLEE_ROUNDS = MAX_FLEE_ROUNDS;
  static readonly DEATH_PENALTY_PERCENT = 0.1;

  // ============================================================================
  // CALCULATION METHODS (delegated to CombatCalculationService)
  // ============================================================================

  static getCharacterMaxHP(character: ICharacter): Promise<number> {
    return CombatCalculationService.getCharacterMaxHP(character);
  }

  static calculateSkillBonusWithDiminishingReturns(skillLevel: number): number {
    return CombatCalculationService.calculateSkillBonusWithDiminishingReturns(skillLevel);
  }

  static getCombatSkillBonus(character: ICharacter): number {
    return CombatCalculationService.getCombatSkillBonus(character);
  }

  static getHighestCombatSkillLevel(character: ICharacter): number {
    return CombatCalculationService.getHighestCombatSkillLevel(character);
  }

  static getCombatCategoryMultiplier(character: ICharacter): number {
    return CombatCalculationService.getCombatCategoryMultiplier(character);
  }

  static calculateDamage(
    handRank: HandRank,
    skillBonuses: number,
    difficultyModifier?: number,
    categoryMultiplier?: number
  ): number {
    return CombatCalculationService.calculateDamage(
      handRank,
      skillBonuses,
      difficultyModifier,
      categoryMultiplier
    );
  }

  static calculateDamageV2(
    handRank: HandRank,
    hand: Card[],
    combatSkillLevel?: number,
    relevantSuit?: string
  ): DamageCalculationResult {
    return CombatCalculationService.calculateDamageV2(
      handRank,
      hand,
      combatSkillLevel,
      relevantSuit
    );
  }

  static calculateAbilities(character: ICharacter): ICombatAbilities {
    return CombatCalculationService.calculateAbilities(character);
  }

  // ============================================================================
  // NPC METHODS (delegated to CombatNPCService)
  // ============================================================================

  static drawNPCCards(difficulty: number): Card[] {
    return CombatNPCService.drawNPCCards(difficulty);
  }

  static playNPCHoldDiscardTurn(
    encounter: ICombatEncounter,
    npc: INPC,
    currentRound: ICurrentRound
  ): Promise<NPCTurnResult> {
    return CombatNPCService.playNPCHoldDiscardTurn(encounter, npc, currentRound);
  }

  // ============================================================================
  // REWARD METHODS (delegated to CombatRewardService)
  // ============================================================================

  static rollLoot(npc: INPC, isFirstKill?: boolean, bossId?: string): ILootAwarded {
    return CombatRewardService.rollLoot(npc, isFirstKill, bossId);
  }

  static isFirstBossKill(characterId: string, bossId: string): Promise<boolean> {
    return CombatRewardService.isFirstBossKill(characterId, bossId);
  }

  static awardLoot(
    character: ICharacter,
    npc: INPC,
    loot: ILootAwarded,
    session: mongoose.ClientSession | undefined,
    encounter: ICombatEncounter
  ): Promise<void> {
    return CombatRewardService.awardLoot(character, npc, loot, session, encounter);
  }

  static applyDeathPenalty(
    character: ICharacter,
    session: mongoose.ClientSession
  ): Promise<DeathPenaltyResult> {
    return CombatRewardService.applyDeathPenalty(character, session);
  }

  // ============================================================================
  // TURN METHODS (delegated to CombatTurnService)
  // ============================================================================

  static startPlayerTurn(
    encounterId: string,
    characterId: string
  ): Promise<CombatActionResult> {
    return CombatTurnService.startPlayerTurn(encounterId, characterId);
  }

  static processPlayerAction(
    encounterId: string,
    characterId: string,
    action: CombatAction
  ): Promise<CombatActionResult> {
    return CombatTurnService.processPlayerAction(encounterId, characterId, action);
  }

  static getRoundState(
    encounterId: string,
    characterId: string
  ): Promise<CombatActionResult> {
    return CombatTurnService.getRoundState(encounterId, characterId);
  }

  // ============================================================================
  // INITIATION METHODS (delegated to CombatInitiationService)
  // ============================================================================

  static initiateCombat(
    character: ICharacter,
    npcId: string
  ): Promise<ICombatEncounter> {
    return CombatInitiationService.initiateCombat(character, npcId);
  }

  static fleeCombat(
    encounterId: string,
    characterId: string
  ): Promise<ICombatEncounter> {
    return CombatInitiationService.fleeCombat(encounterId, characterId);
  }

  static getActiveNPCs(): Promise<any> {
    return CombatInitiationService.getActiveNPCs();
  }

  static getAvailableBosses(characterId: string): Promise<INPC[]> {
    return CombatInitiationService.getAvailableBosses(characterId);
  }

  static canFightBoss(characterId: string, bossId: string): Promise<CanFightBossResult> {
    return CombatInitiationService.canFightBoss(characterId, bossId);
  }

  static getBossStats(characterId: string): Promise<BossStatsResult> {
    return CombatInitiationService.getBossStats(characterId);
  }

  static getCombatHistory(
    characterId: string,
    page?: number,
    limit?: number
  ): Promise<CombatHistoryResult> {
    return CombatInitiationService.getCombatHistory(characterId, page, limit);
  }

  // ============================================================================
  // BOSS MECHANICS (delegated to BossMechanicsService)
  // ============================================================================

  static handlePreCombatChallenge(
    characterId: string,
    bossId: string,
    challenge: PreCombatChallenge,
    playerResponse: { timeTaken?: number; skillResult?: number; choice?: string }
  ): PreCombatChallengeResult {
    return BossMechanicsService.handlePreCombatChallenge(
      characterId,
      bossId,
      challenge,
      playerResponse
    );
  }

  static processDialogueChoice(
    characterId: string,
    choice: DialogueChoice,
    characterSkills: { skillId: string; level: number }[]
  ): DialogueChoiceResult {
    return BossMechanicsService.processDialogueChoice(characterId, choice, characterSkills);
  }

  static checkSpiritRotation(
    currentForm: 'wyatt' | 'doc' | 'clanton',
    playerWeaponType: string
  ): SpiritRotationResult {
    return BossMechanicsService.checkSpiritRotation(currentForm, playerWeaponType);
  }

  static processColdStacks(
    currentStacks: number,
    usedFire: boolean,
    reachedTorch: boolean
  ): ColdStacksResult {
    return BossMechanicsService.processColdStacks(currentStacks, usedFire, reachedTorch);
  }

  static processCorruptionStacks(
    currentStacks: number,
    pickedUpGold: boolean
  ): CorruptionStacksResult {
    return BossMechanicsService.processCorruptionStacks(currentStacks, pickedUpGold);
  }

  static applyBossMechanicModifiers(
    baseDamage: number,
    mechanicId: string,
    mechanicState: Record<string, unknown>
  ): { finalDamage: number; narrative?: string } {
    return BossMechanicsService.applyBossMechanicModifiers(baseDamage, mechanicId, mechanicState);
  }

  static processOxygenDepletion(
    currentOxygen: number,
    foundAirPocket: boolean,
    handRank: HandRank
  ): OxygenDepletionResult {
    return BossMechanicsService.processOxygenDepletion(currentOxygen, foundAirPocket, handRank);
  }

  static processPokerRound(
    roundNumber: number,
    playerHand: Card[],
    billHand: Card[]
  ): PokerRoundResult {
    return BossMechanicsService.processPokerRound(roundNumber, playerHand, billHand);
  }

  static isDeadMansHand(hand: Card[]): boolean {
    return BossMechanicsService.isDeadMansHand(hand);
  }

  static processGuiltVision(
    currentGuilt: number,
    roundNumber: number,
    playerHand: Card[],
    handRank: HandRank
  ): GuiltVisionResult {
    return BossMechanicsService.processGuiltVision(currentGuilt, roundNumber, playerHand, handRank);
  }

  static processAltarActivation(
    playerHand: Card[],
    altars: Altar[]
  ): AltarActivationResult {
    return BossMechanicsService.processAltarActivation(playerHand, altars);
  }

  static processAltarPurification(
    targetAltar: 'spades' | 'hearts' | 'clubs' | 'diamonds',
    playerHand: Card[],
    altars: Altar[]
  ): AltarPurificationResult {
    return BossMechanicsService.processAltarPurification(targetAltar, playerHand, altars);
  }

  static processBluffRound(
    round: number,
    playerHand: Card[],
    playerAction: 'call' | 'fold'
  ): BluffRoundResult {
    return BossMechanicsService.processBluffRound(round, playerHand, playerAction);
  }

  static processPokerShowdown(
    round: number,
    playerHand: Card[],
    docHandRank: HandRank
  ): PokerShowdownResult {
    return BossMechanicsService.processPokerShowdown(round, playerHand, docHandRank);
  }

  static generateDocHand(): HandRank {
    return BossMechanicsService.generateDocHand();
  }

  static processSpiritTrail(
    playerHand: Card[],
    spiritTrail: ('spades' | 'hearts' | 'clubs' | 'diamonds')[],
    currentRealm: 'physical' | 'spirit'
  ): SpiritTrailResult {
    return BossMechanicsService.processSpiritTrail(playerHand, spiritTrail, currentRealm);
  }

  static generateSpiritTrail(): ('spades' | 'hearts' | 'clubs' | 'diamonds')[] {
    return BossMechanicsService.generateSpiritTrail();
  }
}

export default CombatService;
