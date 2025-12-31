/**
 * Combat Service
 *
 * Handles turn-based HP combat logic, damage calculation, and loot distribution
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { NPC, INPC } from '../models/NPC.model';
import { CombatEncounter, ICombatEncounter, ICombatRound, ILootAwarded, ICurrentRound, ICombatAbilities } from '../models/CombatEncounter.model';
import { EnergyService } from './energy.service';
import { DollarService } from './dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { CombatStatus, HandRank, CombatTurnResult, DeathType, COMBAT_CONSTANTS } from '@desperados/shared';
import { shuffleDeck, drawCards, evaluateHand, Card } from '@desperados/shared';
import { calculateCategoryMultiplier, SkillCategory, SKILLS } from '@desperados/shared';
// Sprint 2: Hold/Discard Combat System imports
import {
  PlayerTurnPhase,
  CombatAbilities,
  CombatAction,
  CombatActionResult,
  COMBAT_TIMING,
  COMBAT_SKILL_THRESHOLDS
} from '@desperados/shared';
import logger from '../utils/logger';
import { QuestService } from './quest.service';
import { DeathService } from './death.service';
import { JailService } from './jail.service';
import { SecureRNG } from './base/SecureRNG';
import { withLock } from '../utils/distributedLock';
import karmaService from './karma.service';
import karmaEffectsService from './karmaEffects.service';
import { safeAchievementUpdate, safeAchievementBatch } from '../utils/achievementUtils';
import { TerritoryBonusService } from './territoryBonus.service';
import { CombatContractTrackerService, NPCCombatType } from './combatContractTracker.service';
import { getBossById } from '../data/bosses';

/**
 * Legendary drop rates for bosses
 * Maps boss name to item drops with their chances
 */
const LEGENDARY_DROP_RATES: Record<string, Record<string, number>> = {
  'The Warden of Perdition': { 'wardens-lantern': 0.15 },
  'El Carnicero': { 'carniceros-cleaver': 0.12 },
  'The Pale Rider': { 'pale-riders-pistol': 0.10, 'el-muerto': 0.05 },
  'The Wendigo': { 'wendigo-fang': 0.12 },
  'General Sangre': { 'widowmaker': 0.08, 'generals-saber': 0.15 }
};

export class CombatService {
  /**
   * Energy cost to start combat
   */
  static readonly COMBAT_ENERGY_COST = 10;

  /**
   * Maximum flee rounds
   */
  static readonly MAX_FLEE_ROUNDS = 3;

  /**
   * Death penalty: 10% of character's dollars
   */
  static readonly DEATH_PENALTY_PERCENT = 0.1;

  /**
   * Calculate character's maximum HP
   * Formula: Base 100 + (level * 5) + combat skill bonus (with diminishing returns) + (premium bonus)
   *
   * BALANCE FIX: Now uses same diminishing returns as damage calculation
   * This ensures HP and damage scale consistently with skill investment
   */
  static async getCharacterMaxHP(character: ICharacter): Promise<number> {
    const baseHP = 100;
    const levelBonus = character.level * 5;

    // Use the same diminishing returns calculation as damage
    // This ensures HP scales consistently with skill investment
    const combatSkillBonus = this.getCombatSkillBonus(character);

    const baseTotal = baseHP + levelBonus + combatSkillBonus;

    // Apply premium HP bonus using PremiumUtils
    const { PremiumUtils } = await import('../utils/premium.utils');
    const totalHP = await PremiumUtils.calculateHPWithBonus(baseTotal, character._id.toString());

    return totalHP;
  }

  /**
   * Calculate skill bonus with diminishing returns
   * BALANCE FIX: Prevents overpowered damage stacking from high-level skills
   *
   * Formula:
   * - Levels 1-10: +1.0 per level = +10 total
   * - Levels 11-25: +0.5 per level = +7.5 total
   * - Levels 26-50: +0.25 per level = +6.25 total
   * - Max per skill: +24 (hard cap)
   *
   * @param skillLevel - The skill level (1-50)
   * @returns Bonus value with diminishing returns applied
   */
  static calculateSkillBonusWithDiminishingReturns(skillLevel: number): number {
    const { SKILL_BONUS } = COMBAT_CONSTANTS;
    let bonus = 0;

    // Tier 1: Levels 1-10 at full rate
    const tier1Levels = Math.min(skillLevel, SKILL_BONUS.TIER1_END);
    bonus += tier1Levels * SKILL_BONUS.TIER1_RATE;

    // Tier 2: Levels 11-25 at half rate
    if (skillLevel > SKILL_BONUS.TIER1_END) {
      const tier2Levels = Math.min(skillLevel - SKILL_BONUS.TIER1_END, SKILL_BONUS.TIER2_END - SKILL_BONUS.TIER1_END);
      bonus += tier2Levels * SKILL_BONUS.TIER2_RATE;
    }

    // Tier 3: Levels 26-50 at quarter rate
    if (skillLevel > SKILL_BONUS.TIER2_END) {
      const tier3Levels = skillLevel - SKILL_BONUS.TIER2_END;
      bonus += tier3Levels * SKILL_BONUS.TIER3_RATE;
    }

    // Apply per-skill cap
    return Math.min(Math.floor(bonus), SKILL_BONUS.MAX_PER_SKILL);
  }

  /**
   * Calculate combat skill damage bonuses with diminishing returns
   * BALANCE FIX: Total bonus capped at 120 (previously could reach 250+)
   *
   * Old formula: Each combat skill level = +1 damage (no cap)
   * New formula: Diminishing returns per skill + total cap
   */
  static getCombatSkillBonus(character: ICharacter): number {
    const { SKILL_BONUS } = COMBAT_CONSTANTS;
    let totalBonus = 0;

    for (const skill of character.skills) {
      // Use SkillCategory for type-safe skill detection
      const skillDef = SKILLS[skill.skillId.toUpperCase()];
      if (skillDef && skillDef.category === SkillCategory.COMBAT) {
        totalBonus += this.calculateSkillBonusWithDiminishingReturns(skill.level);
      }
    }

    // Apply total cap across all skills
    return Math.min(totalBonus, SKILL_BONUS.MAX_TOTAL);
  }

  /**
   * Get the highest combat skill level for a character
   * Used to determine the category multiplier unlock tier
   *
   * BALANCE FIX (Phase 4.1): Skill unlock bonuses are now multiplicative
   */
  static getHighestCombatSkillLevel(character: ICharacter): number {
    let highestLevel = 0;

    for (const skill of character.skills) {
      // Check if this is a COMBAT category skill
      const skillDef = SKILLS[skill.skillId.toUpperCase()];
      if (skillDef && skillDef.category === SkillCategory.COMBAT) {
        highestLevel = Math.max(highestLevel, skill.level);
      }
    }

    return highestLevel;
  }

  /**
   * Get the combat category multiplier for a character
   * Based on their highest combat skill level
   *
   * BALANCE FIX (Phase 4.1): Multiplicative bonuses
   * - Level 15: ×1.05 (Combat Stance)
   * - Level 30: ×1.10 (Veteran Fighter)
   * - Level 45: ×1.15 (Deadly Force)
   * - Combined: ×1.328 at level 45+
   */
  static getCombatCategoryMultiplier(character: ICharacter): number {
    const highestLevel = this.getHighestCombatSkillLevel(character);
    return calculateCategoryMultiplier(highestLevel, 'COMBAT');
  }

  /**
   * Calculate damage from a hand rank
   * Returns (base damage + skill bonuses + difficulty + variance) × category multiplier
   *
   * BALANCE FIX (Phase 4.1): Added category multiplier for skill unlock bonuses
   *
   * @param handRank - The poker hand rank
   * @param skillBonuses - Additive bonus from combat skill levels (with diminishing returns)
   * @param difficultyModifier - Bonus/penalty from enemy difficulty
   * @param categoryMultiplier - Multiplicative bonus from skill unlocks (default 1.0)
   */
  static calculateDamage(
    handRank: HandRank,
    skillBonuses: number,
    difficultyModifier: number = 0,
    categoryMultiplier: number = 1.0
  ): number {
    // Base damage by hand rank
    const baseDamage: Record<HandRank, number> = {
      [HandRank.ROYAL_FLUSH]: 50,
      [HandRank.STRAIGHT_FLUSH]: 40,
      [HandRank.FOUR_OF_A_KIND]: 35,
      [HandRank.FULL_HOUSE]: 30,
      [HandRank.FLUSH]: 25,
      [HandRank.STRAIGHT]: 20,
      [HandRank.THREE_OF_A_KIND]: 15,
      [HandRank.TWO_PAIR]: 10,
      [HandRank.PAIR]: 8,
      [HandRank.HIGH_CARD]: 5
    };

    const base = baseDamage[handRank] || 5;
    // SECURITY FIX: Use SecureRNG for damage variance
    const variance = SecureRNG.range(0, 5); // 0-5 random damage

    // Apply base formula then multiply by category bonus
    const rawDamage = base + skillBonuses + difficultyModifier + variance;
    return Math.floor(rawDamage * categoryMultiplier);
  }

  /**
   * Simulate NPC card draw based on difficulty
   * Higher difficulty = chance to redraw for better hand
   */
  static drawNPCCards(difficulty: number): Card[] {
    const deck = shuffleDeck();
    const { drawn } = drawCards(deck, 5);

    // Difficulty-based redraw chance
    let redrawChance = 0;
    if (difficulty >= 1 && difficulty <= 3) {
      redrawChance = 0;
    } else if (difficulty >= 4 && difficulty <= 6) {
      redrawChance = 0.3;
    } else if (difficulty >= 7 && difficulty <= 9) {
      redrawChance = 0.5;
    } else {
      redrawChance = 0.7; // Difficulty 10+
    }

    // SECURITY FIX: Use SecureRNG for redraw chance
    // Check if NPC gets a redraw
    if (SecureRNG.chance(redrawChance)) {
      const deck2 = shuffleDeck();
      const { drawn: redrawn } = drawCards(deck2, 5);

      // Compare hands and keep the better one
      const eval1 = evaluateHand(drawn);
      const eval2 = evaluateHand(redrawn);

      return eval2.score > eval1.score ? redrawn : drawn;
    }

    return drawn;
  }

  /**
   * Initiate combat with an NPC
   */
  static async initiateCombat(
    character: ICharacter,
    npcId: string
  ): Promise<ICombatEncounter> {
    // PHASE 3 FIX: Add distributed lock to prevent race conditions
    const characterId = typeof character._id === 'string' ? character._id : character._id.toString();
    return withLock(`lock:combat:${characterId}`, async () => {
      // Check if character already in active combat
      const existingCombat = await CombatEncounter.findActiveByCharacter(characterId);

      if (existingCombat) {
        throw new Error('Character is already in combat');
      }

      // Fetch NPC
      const npc = await NPC.findById(npcId);
      if (!npc) {
        throw new Error('NPC not found');
      }

      // Check character has enough energy
      const hasEnergy = await EnergyService.spendEnergy(
        characterId,
        this.COMBAT_ENERGY_COST
      );

      if (!hasEnergy) {
        throw new Error('Insufficient energy to start combat');
      }

      // Calculate HP values
      const playerMaxHP = await this.getCharacterMaxHP(character);

      // Create combat encounter
      const encounter = new CombatEncounter({
        characterId: character._id,
        npcId: npc._id,
        playerHP: playerMaxHP,
        playerMaxHP,
        npcHP: npc.maxHP,
        npcMaxHP: npc.maxHP,
        turn: 0, // Player goes first
        roundNumber: 1,
        rounds: [],
        status: CombatStatus.ACTIVE,
        startedAt: new Date()
      });

      await encounter.save();

      logger.info(
        `Combat initiated: Character ${character.name} vs NPC ${npc.name} (Level ${npc.level})`
      );

      return encounter;
    }, { ttl: 30, retries: 10 });
  }

  // =============================================================================
  // SPRINT 2: HOLD/DISCARD COMBAT SYSTEM
  // =============================================================================

  /**
   * Calculate combat abilities based on character's combat skill level
   * Rerolls: 1 per 30 skill levels (30, 60, 90...)
   * Peek: Unlocked at skill 50+
   * Quick Draw: Unlocked at skill 60+ (draw 6 cards instead of 5)
   * Deadly Aim: Unlocked at skill 75+ (1.5x crit damage)
   */
  static calculateAbilities(character: ICharacter): ICombatAbilities {
    const combatSkillLevel = this.getHighestCombatSkillLevel(character);

    // Calculate rerolls: 1 per 30 skill levels
    const rerollsAvailable = Math.floor(combatSkillLevel / COMBAT_SKILL_THRESHOLDS.REROLL_INTERVAL);

    // Peek available if skill >= 50
    const peeksAvailable = combatSkillLevel >= COMBAT_SKILL_THRESHOLDS.PEEK_UNLOCK ? 1 : 0;

    // Quick draw unlocked at skill 60+
    const quickDrawUnlocked = combatSkillLevel >= COMBAT_SKILL_THRESHOLDS.QUICK_DRAW_UNLOCK;

    // Deadly aim unlocked at skill 75+
    const deadlyAimUnlocked = combatSkillLevel >= COMBAT_SKILL_THRESHOLDS.DEADLY_AIM_UNLOCK;

    return {
      rerollsAvailable,
      peeksAvailable,
      rerollsUsed: 0,
      peeksUsed: 0,
      peekedCard: undefined,
      quickDrawUnlocked,
      deadlyAimUnlocked
    };
  }

  /**
   * Start a player's turn - draws cards and sets up hold phase
   * Sprint 2: This is the new entry point for combat turns
   *
   * @param encounterId - The combat encounter ID
   * @param characterId - The character's ID
   * @returns The current round state with cards to hold/discard
   */
  static async startPlayerTurn(
    encounterId: string,
    characterId: string
  ): Promise<CombatActionResult> {
    return withLock(`lock:combat:${characterId}`, async () => {
      try {
        // Fetch encounter
        const encounter = await CombatEncounter.findById(encounterId)
          .populate('npcId');

        if (!encounter) {
          return { success: false, error: 'Combat encounter not found' };
        }

        // Verify ownership
        if (encounter.characterId.toString() !== characterId) {
          return { success: false, error: 'You do not own this combat encounter' };
        }

        // Verify combat is active
        if (encounter.status !== CombatStatus.ACTIVE) {
          return { success: false, error: 'Combat is not active' };
        }

        // Check if there's already an active round in progress
        if (encounter.currentRound && encounter.currentRound.phase !== PlayerTurnPhase.COMPLETE) {
          // Return the existing round state
          return {
            success: true,
            roundState: this.convertToRoundState(encounter.currentRound)
          };
        }

        // Fetch character for abilities
        const character = await Character.findById(characterId);
        if (!character) {
          return { success: false, error: 'Character not found' };
        }

        // Calculate abilities based on combat skill
        const abilities = this.calculateAbilities(character);

        // Create deck and draw initial hand
        const deck = shuffleDeck();
        const cardsToDraw = abilities.quickDrawUnlocked ? 6 : 5;
        const { drawn: playerHand, remaining: remainingDeck } = drawCards(deck, cardsToDraw);

        // Calculate timeout
        const now = new Date();
        const timeoutAt = new Date(now.getTime() + COMBAT_TIMING.HOLD_TIMEOUT_SECONDS * 1000);

        // Create current round state
        const currentRound: ICurrentRound = {
          phase: PlayerTurnPhase.HOLD,
          deck: remainingDeck,
          playerHand,
          heldCardIndices: [],
          abilities,
          phaseStartedAt: now,
          timeoutAt
        };

        // Save to encounter
        encounter.currentRound = currentRound;
        await encounter.save();

        logger.info(
          `Combat turn started: Character ${character.name} drew ${cardsToDraw} cards (Round ${encounter.roundNumber})`
        );

        return {
          success: true,
          roundState: this.convertToRoundState(currentRound),
          encounter: encounter as any
        };
      } catch (error) {
        logger.error('Error starting player turn:', error);
        return { success: false, error: (error as Error).message };
      }
    }, { ttl: 30, retries: 10 });
  }

  /**
   * Process a player action during combat
   * Handles: hold, confirm_hold, reroll, peek, flee
   *
   * @param encounterId - The combat encounter ID
   * @param characterId - The character's ID
   * @param action - The action to perform
   * @returns The result of the action
   */
  static async processPlayerAction(
    encounterId: string,
    characterId: string,
    action: CombatAction
  ): Promise<CombatActionResult> {
    return withLock(`lock:combat:${characterId}`, async () => {
      try {
        // Fetch encounter
        const encounter = await CombatEncounter.findById(encounterId)
          .populate('npcId');

        if (!encounter) {
          return { success: false, error: 'Combat encounter not found' };
        }

        // Verify ownership
        if (encounter.characterId.toString() !== characterId) {
          return { success: false, error: 'You do not own this combat encounter' };
        }

        // Verify combat is active
        if (encounter.status !== CombatStatus.ACTIVE) {
          return { success: false, error: 'Combat is not active' };
        }

        // Verify there's an active round
        if (!encounter.currentRound) {
          return { success: false, error: 'No active round. Call startPlayerTurn first.' };
        }

        // Fetch character
        const character = await Character.findById(characterId);
        if (!character) {
          return { success: false, error: 'Character not found' };
        }

        // Route to specific action handler
        switch (action.type) {
          case 'hold':
            return await this.processHoldAction(encounter, action.cardIndices);

          case 'confirm_hold':
            return await this.processConfirmHold(encounter, character);

          case 'reroll':
            return await this.processRerollAction(encounter, action.cardIndex);

          case 'peek':
            return await this.processPeekAction(encounter);

          case 'flee':
            return await this.processFleeAction(encounter, character);

          default:
            return { success: false, error: 'Unknown action type' };
        }
      } catch (error) {
        logger.error('Error processing player action:', error);
        return { success: false, error: (error as Error).message };
      }
    }, { ttl: 30, retries: 10 });
  }

  /**
   * Process hold action - select which cards to keep
   */
  private static async processHoldAction(
    encounter: ICombatEncounter,
    cardIndices: number[]
  ): Promise<CombatActionResult> {
    const currentRound = encounter.currentRound!;

    // Verify we're in hold phase
    if (currentRound.phase !== PlayerTurnPhase.HOLD) {
      return { success: false, error: 'Not in hold phase' };
    }

    // Validate indices
    const maxIndex = currentRound.playerHand.length - 1;
    for (const idx of cardIndices) {
      if (idx < 0 || idx > maxIndex) {
        return { success: false, error: `Invalid card index: ${idx}` };
      }
    }

    // Update held card indices
    currentRound.heldCardIndices = [...new Set(cardIndices)]; // Remove duplicates

    await encounter.save();

    return {
      success: true,
      roundState: this.convertToRoundState(currentRound)
    };
  }

  /**
   * Process confirm hold - finalize selection, draw replacements, evaluate hand
   */
  private static async processConfirmHold(
    encounter: ICombatEncounter,
    character: ICharacter
  ): Promise<CombatActionResult> {
    const currentRound = encounter.currentRound!;
    const npc = encounter.npcId as unknown as INPC;

    // Verify we're in hold phase
    if (currentRound.phase !== PlayerTurnPhase.HOLD) {
      return { success: false, error: 'Not in hold phase' };
    }

    // Get held and discarded cards
    const heldCards: Card[] = [];
    const discardedCards: Card[] = [];

    currentRound.playerHand.forEach((card, idx) => {
      if (currentRound.heldCardIndices.includes(idx)) {
        heldCards.push(card);
      } else {
        discardedCards.push(card);
      }
    });

    // Draw replacement cards
    const cardsNeeded = currentRound.playerHand.length - heldCards.length;
    const { drawn: replacementCards, remaining: newDeck } = drawCards(
      currentRound.deck,
      cardsNeeded
    );

    // Build final hand
    const finalHand = [...heldCards, ...replacementCards];
    const playerEval = evaluateHand(finalHand);

    // Calculate player damage
    const skillBonus = this.getCombatSkillBonus(character);
    const categoryMultiplier = this.getCombatCategoryMultiplier(character);

    // Check for deadly aim critical hit (1.5x on royal flush/straight flush)
    let critMultiplier = 1.0;
    if (currentRound.abilities.deadlyAimUnlocked) {
      if (playerEval.rank === HandRank.ROYAL_FLUSH || playerEval.rank === HandRank.STRAIGHT_FLUSH) {
        critMultiplier = 1.5;
        logger.info(`Deadly Aim critical hit! ${critMultiplier}x damage`);
      }
    }

    let playerDamage = Math.floor(
      this.calculateDamage(playerEval.rank, skillBonus, 0, categoryMultiplier) * critMultiplier
    );

    // Apply karma effects
    try {
      const karmaEffects = await karmaEffectsService.getActiveEffects(character._id.toString());
      if (karmaEffects.blessingCount > 0 || karmaEffects.curseCount > 0) {
        playerDamage = karmaEffectsService.applyCombatDamageModifier(playerDamage, karmaEffects);
      }
    } catch (karmaError) {
      logger.warn('Failed to apply karma combat effects:', karmaError);
    }

    // Apply damage to NPC
    encounter.npcHP = Math.max(0, encounter.npcHP - playerDamage);

    // Update current round
    currentRound.deck = newDeck;
    currentRound.discardedCards = discardedCards;
    currentRound.finalHand = finalHand;
    currentRound.handRank = playerEval.rank;
    currentRound.playerDamage = playerDamage;
    currentRound.phase = PlayerTurnPhase.REVEAL;

    // Check for NPC defeat
    if (encounter.npcHP <= 0) {
      return await this.handlePlayerVictory(encounter, character, currentRound);
    }

    // NPC turn
    currentRound.phase = PlayerTurnPhase.NPC_TURN;
    const npcResult = await this.playNPCHoldDiscardTurn(encounter, npc, currentRound);

    // Update round with NPC result
    currentRound.npcHand = npcResult.npcHand;
    currentRound.npcHandRank = npcResult.npcHandRank;
    currentRound.npcDamage = npcResult.npcDamage;

    // Apply NPC damage
    encounter.playerHP = Math.max(0, encounter.playerHP - npcResult.npcDamage);

    // Check for player defeat
    if (encounter.playerHP <= 0) {
      return await this.handlePlayerDefeat(encounter, character, currentRound);
    }

    // Round complete - record and prepare for next round
    currentRound.phase = PlayerTurnPhase.COMPLETE;

    // Add round to history
    const roundRecord: ICombatRound = {
      roundNum: encounter.roundNumber,
      playerCards: currentRound.finalHand!,
      playerHandRank: currentRound.handRank!,
      playerDamage: currentRound.playerDamage!,
      npcCards: currentRound.npcHand!,
      npcHandRank: currentRound.npcHandRank!,
      npcDamage: currentRound.npcDamage!,
      playerHPAfter: encounter.playerHP,
      npcHPAfter: encounter.npcHP
    };
    encounter.rounds.push(roundRecord);

    // Increment round and clear current round
    encounter.roundNumber += 1;
    encounter.currentRound = undefined;

    await encounter.save();

    logger.info(
      `Round ${roundRecord.roundNum} complete: Player dealt ${playerDamage}, NPC dealt ${npcResult.npcDamage}`
    );

    return {
      success: true,
      roundState: null, // Round complete - client should call startTurn for next round
      encounter: encounter as any,
      combatEnded: false
    };
  }

  /**
   * Process reroll action - replace one card (requires skill 30+)
   */
  private static async processRerollAction(
    encounter: ICombatEncounter,
    cardIndex: number
  ): Promise<CombatActionResult> {
    const currentRound = encounter.currentRound!;

    // Verify we're in hold phase
    if (currentRound.phase !== PlayerTurnPhase.HOLD) {
      return { success: false, error: 'Not in hold phase' };
    }

    // Check if rerolls available
    const availableRerolls = currentRound.abilities.rerollsAvailable - currentRound.abilities.rerollsUsed;
    if (availableRerolls <= 0) {
      return { success: false, error: 'No rerolls available' };
    }

    // Validate index
    if (cardIndex < 0 || cardIndex >= currentRound.playerHand.length) {
      return { success: false, error: 'Invalid card index' };
    }

    // Draw new card
    if (currentRound.deck.length === 0) {
      return { success: false, error: 'No cards left in deck' };
    }

    const { drawn: [newCard], remaining: newDeck } = drawCards(currentRound.deck, 1);

    // Replace card
    currentRound.playerHand[cardIndex] = newCard;
    currentRound.deck = newDeck;
    currentRound.abilities.rerollsUsed += 1;

    // Remove from held if it was held
    currentRound.heldCardIndices = currentRound.heldCardIndices.filter(idx => idx !== cardIndex);

    await encounter.save();

    logger.info(`Reroll used: Card ${cardIndex} replaced (${availableRerolls - 1} rerolls remaining)`);

    return {
      success: true,
      roundState: this.convertToRoundState(currentRound)
    };
  }

  /**
   * Process peek action - see the next card (requires skill 50+)
   */
  private static async processPeekAction(
    encounter: ICombatEncounter
  ): Promise<CombatActionResult> {
    const currentRound = encounter.currentRound!;

    // Verify we're in hold phase
    if (currentRound.phase !== PlayerTurnPhase.HOLD) {
      return { success: false, error: 'Not in hold phase' };
    }

    // Check if peeks available
    const availablePeeks = currentRound.abilities.peeksAvailable - currentRound.abilities.peeksUsed;
    if (availablePeeks <= 0) {
      return { success: false, error: 'No peeks available' };
    }

    // Check deck has cards
    if (currentRound.deck.length === 0) {
      return { success: false, error: 'No cards left in deck to peek' };
    }

    // Peek at top card
    currentRound.abilities.peekedCard = currentRound.deck[0];
    currentRound.abilities.peeksUsed += 1;

    await encounter.save();

    logger.info(`Peek used: Revealed next card`);

    return {
      success: true,
      roundState: this.convertToRoundState(currentRound)
    };
  }

  /**
   * Process flee action - attempt to escape (rounds 1-3 only)
   */
  private static async processFleeAction(
    encounter: ICombatEncounter,
    character: ICharacter
  ): Promise<CombatActionResult> {
    // Check if can flee
    if (!encounter.canFlee()) {
      return { success: false, error: 'Cannot flee after round 3' };
    }

    // Set status to fled
    encounter.status = CombatStatus.FLED;
    encounter.endedAt = new Date();
    encounter.currentRound = undefined;

    await encounter.save();

    // Record karma for fleeing
    try {
      const npc = encounter.npcId as unknown as INPC;
      await karmaService.recordAction(
        character._id.toString(),
        'COMBAT_FLED',
        `Fled from combat with ${npc?.name || 'enemy'} after ${encounter.roundNumber} rounds`
      );
    } catch (karmaError) {
      logger.warn('Failed to record karma for fleeing:', karmaError);
    }

    logger.info(`Character ${character.name} fled from combat (Round ${encounter.roundNumber})`);

    return {
      success: true,
      encounter: encounter as any,
      combatEnded: true
    };
  }

  /**
   * NPC plays their turn using hold/discard strategy based on difficulty
   */
  private static async playNPCHoldDiscardTurn(
    encounter: ICombatEncounter,
    npc: INPC,
    _currentRound: ICurrentRound
  ): Promise<{ npcHand: Card[]; npcHandRank: HandRank; npcDamage: number }> {
    // Draw initial NPC hand
    const npcDeck = shuffleDeck();
    const { drawn: initialHand, remaining: remainingDeck } = drawCards(npcDeck, 5);

    // Determine NPC hold strategy based on difficulty
    let finalHand: Card[];

    if (npc.difficulty <= 3) {
      // Easy: Hold random 0-2 cards
      const holdCount = SecureRNG.range(0, 2);
      const heldIndices = this.getRandomIndices(5, holdCount);
      finalHand = this.applyHoldStrategy(initialHand, remainingDeck, heldIndices);
    } else if (npc.difficulty <= 6) {
      // Medium: Basic strategy - hold pairs and high cards
      const heldIndices = this.calculateBasicNPCHoldStrategy(initialHand);
      finalHand = this.applyHoldStrategy(initialHand, remainingDeck, heldIndices);
    } else if (npc.difficulty <= 9) {
      // Hard: Optimal hold + 20% redraw chance
      const heldIndices = this.calculateOptimalNPCHoldStrategy(initialHand);
      finalHand = this.applyHoldStrategy(initialHand, remainingDeck, heldIndices);

      // 20% chance to redraw for better hand
      if (SecureRNG.chance(0.2)) {
        const altDeck = shuffleDeck();
        const { drawn: altHand, remaining: altRemaining } = drawCards(altDeck, 5);
        const altHeld = this.calculateOptimalNPCHoldStrategy(altHand);
        const altFinal = this.applyHoldStrategy(altHand, altRemaining, altHeld);

        if (evaluateHand(altFinal).score > evaluateHand(finalHand).score) {
          finalHand = altFinal;
        }
      }
    } else {
      // Extreme (10+): Optimal hold + 40% redraw + bonus damage
      const heldIndices = this.calculateOptimalNPCHoldStrategy(initialHand);
      finalHand = this.applyHoldStrategy(initialHand, remainingDeck, heldIndices);

      // 40% chance to redraw
      if (SecureRNG.chance(0.4)) {
        const altDeck = shuffleDeck();
        const { drawn: altHand, remaining: altRemaining } = drawCards(altDeck, 5);
        const altHeld = this.calculateOptimalNPCHoldStrategy(altHand);
        const altFinal = this.applyHoldStrategy(altHand, altRemaining, altHeld);

        if (evaluateHand(altFinal).score > evaluateHand(finalHand).score) {
          finalHand = altFinal;
        }
      }
    }

    // Evaluate final hand
    const npcEval = evaluateHand(finalHand);

    // Calculate damage (difficulty 10+ gets +5 bonus)
    const difficultyBonus = npc.difficulty >= 10 ? 5 : 0;
    const npcDamage = this.calculateDamage(npcEval.rank, 0, npc.difficulty + difficultyBonus);

    return {
      npcHand: finalHand,
      npcHandRank: npcEval.rank,
      npcDamage
    };
  }

  /**
   * Get random indices from a range
   */
  private static getRandomIndices(max: number, count: number): number[] {
    const indices: number[] = [];
    const available = Array.from({ length: max }, (_, i) => i);

    for (let i = 0; i < Math.min(count, max); i++) {
      const randomIdx = SecureRNG.range(0, available.length - 1);
      indices.push(available[randomIdx]);
      available.splice(randomIdx, 1);
    }

    return indices;
  }

  /**
   * Calculate basic NPC hold strategy - keep pairs and high cards
   */
  private static calculateBasicNPCHoldStrategy(hand: Card[]): number[] {
    const held: number[] = [];

    // Find pairs
    const rankCounts: Record<number, number[]> = {};
    hand.forEach((card, idx) => {
      if (!rankCounts[card.rank]) rankCounts[card.rank] = [];
      rankCounts[card.rank].push(idx);
    });

    // Hold all pairs
    for (const indices of Object.values(rankCounts)) {
      if (indices.length >= 2) {
        held.push(...indices);
      }
    }

    // If no pairs, hold high cards (10+)
    if (held.length === 0) {
      hand.forEach((card, idx) => {
        if (card.rank >= 10) {
          held.push(idx);
        }
      });
    }

    // Limit to 3 cards for medium difficulty
    return held.slice(0, 3);
  }

  /**
   * Calculate optimal NPC hold strategy - poker optimal play
   */
  private static calculateOptimalNPCHoldStrategy(hand: Card[]): number[] {
    const eval_ = evaluateHand(hand);

    // If already have a strong hand (three of a kind or better), hold all
    if (eval_.rank >= HandRank.THREE_OF_A_KIND) {
      return [0, 1, 2, 3, 4];
    }

    // Find the cards that make up the current hand
    const held: number[] = [];

    // Count ranks and suits
    const rankCounts: Record<number, number[]> = {};
    const suitCounts: Record<string, number[]> = {};

    hand.forEach((card, idx) => {
      if (!rankCounts[card.rank]) rankCounts[card.rank] = [];
      rankCounts[card.rank].push(idx);

      if (!suitCounts[card.suit]) suitCounts[card.suit] = [];
      suitCounts[card.suit].push(idx);
    });

    // Priority 1: Hold four of same suit (going for flush)
    for (const indices of Object.values(suitCounts)) {
      if (indices.length >= 4) {
        return indices;
      }
    }

    // Priority 2: Hold pairs/three of a kind
    const pairs: number[][] = [];
    for (const indices of Object.values(rankCounts)) {
      if (indices.length >= 2) {
        pairs.push(indices);
      }
    }

    if (pairs.length > 0) {
      // Hold all matching cards
      for (const pair of pairs) {
        held.push(...pair);
      }
      return held;
    }

    // Priority 3: Check for straight draw (4 consecutive)
    const sortedRanks = [...new Set(hand.map(c => c.rank))].sort((a, b) => a - b);
    for (let i = 0; i <= sortedRanks.length - 4; i++) {
      if (sortedRanks[i + 3] - sortedRanks[i] === 3) {
        // Found 4 consecutive, hold them
        const consecutiveRanks = sortedRanks.slice(i, i + 4);
        hand.forEach((card, idx) => {
          if (consecutiveRanks.includes(card.rank)) {
            held.push(idx);
          }
        });
        return held;
      }
    }

    // Priority 4: Hold high cards (10+)
    hand.forEach((card, idx) => {
      if (card.rank >= 10) {
        held.push(idx);
      }
    });

    return held;
  }

  /**
   * Apply hold strategy - keep held cards, draw replacements
   */
  private static applyHoldStrategy(
    hand: Card[],
    deck: Card[],
    heldIndices: number[]
  ): Card[] {
    const finalHand: Card[] = [];
    let deckIdx = 0;

    for (let i = 0; i < hand.length; i++) {
      if (heldIndices.includes(i)) {
        finalHand.push(hand[i]);
      } else {
        // Draw replacement
        if (deckIdx < deck.length) {
          finalHand.push(deck[deckIdx]);
          deckIdx++;
        } else {
          // Deck exhausted, keep original
          finalHand.push(hand[i]);
        }
      }
    }

    return finalHand;
  }

  /**
   * Handle player victory - award loot and end combat
   */
  private static async handlePlayerVictory(
    encounter: ICombatEncounter,
    character: ICharacter,
    currentRound: ICurrentRound
  ): Promise<CombatActionResult> {
    const npc = encounter.npcId as unknown as INPC;

    encounter.status = CombatStatus.PLAYER_VICTORY;
    encounter.endedAt = new Date();
    currentRound.phase = PlayerTurnPhase.COMPLETE;

    // Roll loot
    // For bosses, use the boss data loot tables from the boss registry
    const bossId = npc.type === 'BOSS' ? (npc._id as mongoose.Types.ObjectId).toString() : undefined;
    const isFirstKill = bossId
      ? await this.isFirstBossKill(character._id.toString(), bossId)
      : false;
    const loot = this.rollLoot(npc, isFirstKill, bossId);
    encounter.lootAwarded = loot;

    // Add round to history
    const roundRecord: ICombatRound = {
      roundNum: encounter.roundNumber,
      playerCards: currentRound.finalHand!,
      playerHandRank: currentRound.handRank!,
      playerDamage: currentRound.playerDamage!,
      npcCards: [],
      npcHandRank: HandRank.HIGH_CARD,
      npcDamage: 0,
      playerHPAfter: encounter.playerHP,
      npcHPAfter: 0
    };
    encounter.rounds.push(roundRecord);
    encounter.currentRound = undefined;

    await encounter.save();

    // Award loot
    await this.awardLoot(character, npc, loot, undefined, encounter);

    // Update quest progress
    await QuestService.onEnemyDefeated(character._id.toString(), npc.type || 'enemy');

    // Phase 3: Track combat contract progress
    try {
      // Calculate combat stats from rounds
      const totalDamageDealt = encounter.rounds.reduce((sum, r) => sum + (r.playerDamage || 0), 0);
      const totalDamageTaken = encounter.rounds.reduce((sum, r) => sum + (r.npcDamage || 0), 0);
      const roundsPlayed = encounter.rounds.length;

      // Map NPC type to combat type
      const npcCombatType = CombatContractTrackerService.getNPCCombatType(npc.type || 'any');
      const characterObjId = character._id as mongoose.Types.ObjectId;

      await CombatContractTrackerService.onCombatVictory({
        characterId: characterObjId,
        npcId: (npc._id as mongoose.Types.ObjectId).toString(),
        npcType: npcCombatType,
        npcName: npc.name,
        totalDamageDealt,
        totalDamageTaken,
        roundsPlayed,
        winningHandRank: currentRound.handRank?.toString(),
        isBossKill: npc.type === 'BOSS',
        bossId: npc.type === 'BOSS' ? (npc._id as mongoose.Types.ObjectId).toString() : undefined,
        isFirstBossKill: isFirstKill,
      });

      // Check for quick victory (3 rounds or less)
      if (roundsPlayed <= 3) {
        await CombatContractTrackerService.checkQuickVictory(characterObjId, roundsPlayed);
      }

      // Update combat streak
      await CombatContractTrackerService.updateCombatStreak(characterObjId, true);
    } catch (contractError) {
      logger.warn('Failed to track combat contract progress:', contractError);
    }

    // Record karma
    try {
      const karmaActionType = npc.type === 'LAWMAN' ? 'COMBAT_EXECUTE_ENEMY' : 'COMBAT_FAIR_DUEL';
      await karmaService.recordAction(
        character._id.toString(),
        karmaActionType,
        `Defeated ${npc.name} in combat`
      );
    } catch (karmaError) {
      logger.warn('Failed to record karma for combat victory:', karmaError);
    }

    logger.info(`Combat victory: ${character.name} defeated ${npc.name}`);

    return {
      success: true,
      roundState: this.convertToRoundState(currentRound),
      encounter: encounter as any,
      combatEnded: true,
      lootAwarded: loot
    };
  }

  /**
   * Handle player defeat - apply death penalty
   */
  private static async handlePlayerDefeat(
    encounter: ICombatEncounter,
    character: ICharacter,
    currentRound: ICurrentRound
  ): Promise<CombatActionResult> {
    const npc = encounter.npcId as unknown as INPC;

    encounter.status = CombatStatus.PLAYER_DEFEAT;
    encounter.endedAt = new Date();
    currentRound.phase = PlayerTurnPhase.COMPLETE;

    // Add round to history
    const roundRecord: ICombatRound = {
      roundNum: encounter.roundNumber,
      playerCards: currentRound.finalHand!,
      playerHandRank: currentRound.handRank!,
      playerDamage: currentRound.playerDamage!,
      npcCards: currentRound.npcHand!,
      npcHandRank: currentRound.npcHandRank!,
      npcDamage: currentRound.npcDamage!,
      playerHPAfter: 0,
      npcHPAfter: encounter.npcHP
    };
    encounter.rounds.push(roundRecord);
    encounter.currentRound = undefined;

    await encounter.save();

    // Check if should jail instead of death penalty
    let deathPenalty: { goldLost: number; respawned: boolean } | undefined;

    if (npc.type === 'LAWMAN' && await DeathService.shouldSendToJail(character, 'lawful_npc')) {
      const jailMinutes = DeathService.calculateJailSentence(character.wantedLevel);
      await JailService.jailPlayer(
        character._id.toString(),
        jailMinutes,
        'bounty_collection' as any,
        undefined,
        true,
        undefined
      );
      logger.info(`Player jailed: ${character.name} sent to jail for ${jailMinutes} minutes`);
    } else {
      deathPenalty = await this.applyDeathPenalty(character, undefined as any);
    }

    // Phase 3: Reset combat streak on defeat
    try {
      await CombatContractTrackerService.updateCombatStreak(character._id as mongoose.Types.ObjectId, false);
    } catch (contractError) {
      logger.warn('Failed to reset combat streak:', contractError);
    }

    logger.info(`Combat defeat: ${character.name} was defeated by ${npc.name}`);

    return {
      success: true,
      roundState: this.convertToRoundState(currentRound),
      encounter: encounter as any,
      combatEnded: true,
      deathPenalty
    };
  }

  /**
   * Convert internal ICurrentRound to CombatRoundState for API response
   */
  private static convertToRoundState(round: ICurrentRound): any {
    return {
      phase: round.phase,
      deck: [], // Don't expose deck to client
      playerHand: round.playerHand,
      heldCardIndices: round.heldCardIndices,
      finalHand: round.finalHand,
      handRank: round.handRank,
      playerDamage: round.playerDamage,
      npcHand: round.npcHand,
      npcHandRank: round.npcHandRank,
      npcDamage: round.npcDamage,
      abilities: {
        rerollsAvailable: round.abilities.rerollsAvailable,
        peeksAvailable: round.abilities.peeksAvailable,
        rerollsUsed: round.abilities.rerollsUsed,
        peeksUsed: round.abilities.peeksUsed,
        peekedCard: round.abilities.peekedCard,
        quickDrawUnlocked: round.abilities.quickDrawUnlocked,
        deadlyAimUnlocked: round.abilities.deadlyAimUnlocked
      },
      phaseStartedAt: round.phaseStartedAt,
      timeoutAt: round.timeoutAt,
      discardedCards: round.discardedCards
    };
  }

  /**
   * Get current round state for an encounter
   */
  static async getRoundState(
    encounterId: string,
    characterId: string
  ): Promise<CombatActionResult> {
    const encounter = await CombatEncounter.findById(encounterId)
      .populate('npcId');

    if (!encounter) {
      return { success: false, error: 'Combat encounter not found' };
    }

    if (encounter.characterId.toString() !== characterId) {
      return { success: false, error: 'You do not own this combat encounter' };
    }

    if (!encounter.currentRound) {
      return {
        success: true,
        encounter: encounter as any,
        roundState: undefined
      };
    }

    return {
      success: true,
      encounter: encounter as any,
      roundState: this.convertToRoundState(encounter.currentRound)
    };
  }

  // =============================================================================
  // END SPRINT 2: HOLD/DISCARD COMBAT SYSTEM
  // =============================================================================

  /**
   * Roll loot from NPC's loot table
   * For bosses, uses boss data loot tables instead of NPC loot table
   */
  static rollLoot(npc: INPC, isFirstKill: boolean = false, bossId?: string): ILootAwarded {
    // Check if this is a boss with defined boss data
    const bossData = bossId ? getBossById(bossId) : null;

    if (bossData) {
      // Use boss data loot tables for proper boss encounters
      return this.rollBossLoot(bossData, isFirstKill);
    }

    // Fall back to NPC loot table for non-boss or undefined boss encounters
    const { lootTable } = npc;

    // SECURITY FIX: Use SecureRNG for dollars roll
    const gold = SecureRNG.range(lootTable.goldMin, lootTable.goldMax);
    const xp = lootTable.xpReward;

    // SECURITY FIX: Use SecureRNG for item drop chances
    const items: string[] = [];
    for (const item of lootTable.items) {
      if (SecureRNG.chance(item.chance)) {
        items.push(item.name);
      }
    }

    // SECURITY FIX: Use SecureRNG for legendary drop chances
    // Legacy: Roll for legendary boss drops from hardcoded table
    if (npc.type === 'BOSS' && LEGENDARY_DROP_RATES[npc.name]) {
      const legendaryDrops = LEGENDARY_DROP_RATES[npc.name];

      for (const [itemId, dropChance] of Object.entries(legendaryDrops)) {
        if (isFirstKill && Object.keys(legendaryDrops)[0] === itemId) {
          items.push(itemId);
          logger.info(`First kill bonus: Guaranteed ${itemId} drop from ${npc.name}`);
        } else if (SecureRNG.chance(dropChance)) {
          items.push(itemId);
          logger.info(`Legendary drop: ${itemId} from ${npc.name} (${(dropChance * 100).toFixed(1)}% chance)`);
        }
      }
    }

    return { gold, xp, items };
  }

  /**
   * Roll loot from boss data loot tables
   * Uses the structured loot table from boss definitions
   */
  private static rollBossLoot(bossData: any, isFirstKill: boolean): ILootAwarded {
    const items: string[] = [];

    // Roll gold from boss gold reward range
    const gold = SecureRNG.range(bossData.goldReward.min, bossData.goldReward.max);
    const xp = bossData.experienceReward;

    // Add guaranteed drops
    if (bossData.guaranteedDrops && bossData.guaranteedDrops.length > 0) {
      for (const drop of bossData.guaranteedDrops) {
        // Only add if it's not first-kill-only, or if it is first kill
        if (!drop.guaranteedFirstKill || isFirstKill) {
          for (let i = 0; i < drop.quantity; i++) {
            items.push(drop.itemId);
          }
          logger.info(`Boss guaranteed drop: ${drop.quantity}x ${drop.name} from ${bossData.name}`);
        }
      }
    }

    // Roll loot table entries
    if (bossData.lootTable && bossData.lootTable.length > 0) {
      for (const loot of bossData.lootTable) {
        // Skip first-kill-only items if not first kill
        if (loot.requiresFirstKill && !isFirstKill) {
          continue;
        }

        if (SecureRNG.chance(loot.dropChance)) {
          const quantity = SecureRNG.range(loot.minQuantity, loot.maxQuantity);
          for (let i = 0; i < quantity; i++) {
            items.push(loot.itemId);
          }
          logger.info(
            `Boss loot drop: ${quantity}x ${loot.name} from ${bossData.name} ` +
            `(${(loot.dropChance * 100).toFixed(1)}% chance)`
          );
        }
      }
    }

    // First kill bonus
    if (isFirstKill && bossData.firstKillBonus) {
      if (bossData.firstKillBonus.item) {
        items.push(bossData.firstKillBonus.item);
        logger.info(`First kill bonus item: ${bossData.firstKillBonus.item} from ${bossData.name}`);
      }
      // Note: firstKillBonus.gold and title are handled separately
    }

    logger.info(
      `Boss loot rolled for ${bossData.name}: $${gold}, ${xp} XP, ${items.length} items`
    );

    return { gold, xp, items };
  }

  /**
   * Check if this is the character's first kill of a specific boss
   */
  static async isFirstBossKill(characterId: string, bossId: string): Promise<boolean> {
    const previousKill = await CombatEncounter.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      npcId: bossId,
      status: CombatStatus.PLAYER_VICTORY
    });

    return !previousKill;
  }

  /**
   * Award loot to character
   */
  private static async awardLoot(
    character: ICharacter,
    npc: INPC,
    loot: ILootAwarded,
    session: mongoose.ClientSession | undefined,
    encounter: ICombatEncounter
  ): Promise<void> {
    // TERRITORY BONUS: Apply gang territory gold and XP bonuses (Phase 2.2)
    let goldAmount = loot.gold;
    let xpAmount = loot.xp;
    try {
      const combatBonuses = await TerritoryBonusService.getCombatBonuses(
        character._id as mongoose.Types.ObjectId
      );
      if (combatBonuses.hasBonuses) {
        goldAmount = Math.floor(goldAmount * combatBonuses.bonuses.gold);
        xpAmount = Math.floor(xpAmount * combatBonuses.bonuses.xp);
        logger.debug(`Territory combat loot bonus: gold ${combatBonuses.bonuses.gold}x, xp ${combatBonuses.bonuses.xp}x`);
      }
    } catch (territoryError) {
      logger.warn('Failed to apply territory combat loot bonus:', territoryError);
    }

    // Award dollars using DollarService (transaction-safe)
    if (goldAmount > 0) {
      await DollarService.addDollars(
        character._id as string,
        goldAmount,
        TransactionSource.COMBAT_VICTORY,
        {
          npcId: npc._id,
          npcName: npc.name,
          npcLevel: npc.level,
          description: `Defeated ${npc.name} (Level ${npc.level}) and looted ${goldAmount} dollars`,
          currencyType: CurrencyType.DOLLAR,
        }
      );
    }

    // Award XP
    await character.addExperience(xpAmount);

    // Award items
    for (const itemName of loot.items) {
      const existingItem = character.inventory.find(i => i.itemId === itemName);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        character.inventory.push({
          itemId: itemName,
          quantity: 1,
          acquiredAt: new Date()
        });
      }

      // Trigger quest progress for item collected
      try {
        await QuestService.onItemCollected(character._id.toString(), itemName, 1);
      } catch (questError) {
        // Don't fail loot if quest update fails
        logger.error('Failed to update quest progress for combat loot:', questError);
      }
    }

    // Update combat stats
    if (!character.combatStats) {
      character.combatStats = {
        wins: 0,
        losses: 0,
        totalDamage: 0,
        kills: 0,
        totalDeaths: 0
      };
    }

    character.combatStats.wins += 1;
    character.combatStats.kills += 1;

    // Track total damage dealt in this combat
    const totalDamageDealt = encounter.rounds.reduce((sum, r) => sum + r.playerDamage, 0);
    character.combatStats.totalDamage += totalDamageDealt;

    // Achievement tracking: Combat wins (first_blood, gunslinger_10/50/100)
    const characterIdStr = character._id.toString();
    const totalWins = character.combatStats.wins;

    // Track progress for combat win achievements
    safeAchievementBatch(characterIdStr, [
      { type: 'first_blood' },
      { type: 'gunslinger_10' },
      { type: 'gunslinger_50' },
      { type: 'gunslinger_100' }
    ], 'combat:victory');

    // Boss achievements
    if (npc.type === 'BOSS') {
      safeAchievementBatch(characterIdStr, [
        { type: 'boss_slayer' },
        { type: 'boss_hunter_5' }
      ], 'combat:boss_victory');
    }

    // Flawless victory: Check if player took no damage
    const totalDamageReceived = encounter.rounds.reduce((sum, r) => sum + r.npcDamage, 0);
    if (totalDamageReceived === 0 && encounter.playerHP === encounter.playerMaxHP) {
      safeAchievementUpdate(characterIdStr, 'flawless_victory', 1, 'combat:flawless');
    }

    // Mark NPC as defeated
    npc.lastDefeated = new Date();
    npc.isActive = false;

    await character.save();
    await npc.save();

    logger.info(
      `Loot awarded to ${character.name}: ${loot.gold} dollars, ${loot.xp} XP, ${loot.items.length} items`
    );
  }

  /**
   * Apply death penalty: lose 10% dollars, respawn at full HP
   * Enhanced to use new Death Service
   */
  private static async applyDeathPenalty(
    character: ICharacter,
    session: mongoose.ClientSession
  ): Promise<{ goldLost: number; respawned: boolean }> {
    // Use Death Service for comprehensive death handling
    const deathPenalty = await DeathService.handleDeath(
      character._id.toString(),
      DeathType.COMBAT,
      session
    );

    logger.info(
      `Death penalty applied to ${character.name}: lost ${deathPenalty.goldLost} dollars, ` +
      `${deathPenalty.xpLost} XP, ${deathPenalty.itemsDropped.length} items`
    );

    return {
      goldLost: deathPenalty.goldLost,
      respawned: deathPenalty.respawned
    };
  }

  /**
   * Flee from combat (only allowed in first 3 rounds)
   */
  static async fleeCombat(
    encounterId: string,
    characterId: string
  ): Promise<ICombatEncounter> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const encounter = await CombatEncounter.findById(encounterId)
        .populate('npcId')
        .session(session);

      if (!encounter) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Combat encounter not found');
      }

      // Verify ownership
      if (encounter.characterId.toString() !== characterId) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('You do not own this combat encounter');
      }

      // Verify can flee
      if (!encounter.canFlee()) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Cannot flee after round 3');
      }

      // Set status to fled
      encounter.status = CombatStatus.FLED;
      encounter.endedAt = new Date();

      await encounter.save({ session });
      await session.commitTransaction();
      session.endSession();

      // DEITY SYSTEM: Record karma for fleeing combat
      // Fleeing shows survival instinct but slight dishonor
      try {
        const npc = encounter.npcId as unknown as INPC;
        await karmaService.recordAction(
          characterId,
          'COMBAT_FLED',
          `Fled from combat with ${npc?.name || 'enemy'} after ${encounter.roundNumber} rounds`
        );
        logger.debug('Karma recorded for fleeing: COMBAT_FLED');
      } catch (karmaError) {
        logger.warn('Failed to record karma for fleeing combat:', karmaError);
      }

      logger.info(
        `Character ${characterId} fled from combat encounter ${encounterId}`
      );

      return encounter;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get all active NPCs grouped by type
   */
  static async getActiveNPCs(): Promise<any> {
    const npcs = await NPC.findActiveNPCs();
    return npcs;
  }

  /**
   * Get available bosses for a character based on their combat level
   * Bosses have 24-hour respawn cooldowns per character
   */
  static async getAvailableBosses(characterId: string): Promise<INPC[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get character's combat skill level
    let combatLevel = character.level;
    for (const skill of character.skills) {
      const skillDef = SKILLS[skill.skillId.toUpperCase()];
      if (skillDef && skillDef.category === SkillCategory.COMBAT) {
        combatLevel = Math.max(combatLevel, skill.level);
      }
    }

    // Find all boss NPCs
    const allBosses = await NPC.find({
      type: 'BOSS',
      level: { $lte: combatLevel + 5 } // Can fight bosses up to 5 levels above
    }).sort({ level: 1 });

    // H8 FIX: Batch query instead of N+1 individual queries
    // Get all boss IDs and query recent defeats in a single database call
    const now = new Date();
    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
    const cooldownThreshold = new Date(now.getTime() - cooldownMs);
    const bossIds = allBosses.map(boss => boss._id);

    // Single query to get all recent defeats against any of these bosses
    const recentDefeats = await CombatEncounter.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      npcId: { $in: bossIds },
      status: CombatStatus.PLAYER_VICTORY,
      endedAt: { $gte: cooldownThreshold }
    }).select('npcId').lean();

    // Create a Set of defeated boss IDs for O(1) lookup
    const defeatedBossIds = new Set(
      recentDefeats.map(defeat => defeat.npcId.toString())
    );

    // Filter bosses not recently defeated
    const availableBosses = allBosses.filter(
      boss => !defeatedBossIds.has(boss._id.toString())
    );

    return availableBosses;
  }

  /**
   * Check if a character can fight a specific boss
   */
  static async canFightBoss(characterId: string, bossId: string): Promise<{
    canFight: boolean;
    reason?: string;
    cooldownRemaining?: number;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      return { canFight: false, reason: 'Character not found' };
    }

    const boss = await NPC.findById(bossId);
    if (!boss || boss.type !== 'BOSS') {
      return { canFight: false, reason: 'Boss not found' };
    }

    // Check level requirement
    let combatLevel = character.level;
    for (const skill of character.skills) {
      const skillDef = SKILLS[skill.skillId.toUpperCase()];
      if (skillDef && skillDef.category === SkillCategory.COMBAT) {
        combatLevel = Math.max(combatLevel, skill.level);
      }
    }

    if (boss.level > combatLevel + 5) {
      return {
        canFight: false,
        reason: `Requires combat level ${boss.level - 5}. Current: ${combatLevel}`
      };
    }

    // Check cooldown
    const now = new Date();
    const cooldownMs = 24 * 60 * 60 * 1000;

    const recentDefeat = await CombatEncounter.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      npcId: boss._id,
      status: CombatStatus.PLAYER_VICTORY,
      endedAt: { $gte: new Date(now.getTime() - cooldownMs) }
    });

    if (recentDefeat && recentDefeat.endedAt) {
      const cooldownEnd = new Date(recentDefeat.endedAt.getTime() + cooldownMs);
      const remaining = cooldownEnd.getTime() - now.getTime();
      return {
        canFight: false,
        reason: 'Boss on cooldown',
        cooldownRemaining: Math.ceil(remaining / 60000) // minutes
      };
    }

    return { canFight: true };
  }

  /**
   * Get boss defeat statistics for a character
   */
  static async getBossStats(characterId: string): Promise<{
    totalBossKills: number;
    uniqueBossesDefeated: number;
    bossHistory: Array<{
      bossName: string;
      bossLevel: number;
      defeatedAt: Date;
      lootEarned: any;
    }>;
  }> {
    const bossEncounters = await CombatEncounter.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: CombatStatus.PLAYER_VICTORY
    }).populate('npcId');

    // Filter to only boss encounters
    const bossKills = bossEncounters.filter(enc => {
      const npc = enc.npcId as unknown as INPC;
      return npc && npc.type === 'BOSS';
    });

    const uniqueBosses = new Set(
      bossKills.map(enc => (enc.npcId as any)._id.toString())
    );

    const bossHistory = bossKills.map(enc => {
      const npc = enc.npcId as unknown as INPC;
      return {
        bossName: npc.name,
        bossLevel: npc.level,
        defeatedAt: enc.endedAt || enc.createdAt,
        lootEarned: enc.lootAwarded
      };
    }).sort((a, b) => b.defeatedAt.getTime() - a.defeatedAt.getTime());

    return {
      totalBossKills: bossKills.length,
      uniqueBossesDefeated: uniqueBosses.size,
      bossHistory
    };
  }

  /**
   * Get combat history for a character
   */
  static async getCombatHistory(
    characterId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const encounters = await CombatEncounter.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: { $ne: CombatStatus.ACTIVE }
    })
      .populate('npcId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CombatEncounter.countDocuments({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: { $ne: CombatStatus.ACTIVE }
    });

    // Calculate stats
    const character = await Character.findById(characterId);
    const stats = character.combatStats || {
      wins: 0,
      losses: 0,
      totalDamage: 0,
      kills: 0,
      totalDeaths: 0
    };

    const history = encounters.map(enc => {
      const npc = enc.npcId as unknown as INPC;
      const damageDealt = enc.rounds.reduce((sum, r) => sum + r.playerDamage, 0);

      return {
        _id: enc._id,
        npcName: npc?.name || 'Unknown',
        npcLevel: npc?.level || 0,
        status: enc.status,
        rounds: enc.rounds.length,
        damageDealt,
        dollarsEarned: enc.lootAwarded?.gold || 0,
        xpEarned: enc.lootAwarded?.xp || 0,
        date: enc.createdAt
      };
    });

    return {
      total,
      stats,
      encounters: history,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // =============================================================================
  // PHASE 19.5: Boss Mechanic Handlers
  // =============================================================================

  /**
   * Handle pre-combat challenge (e.g., Billy's quick-draw)
   * Returns modifiers to apply before combat starts
   */
  static async handlePreCombatChallenge(
    characterId: string,
    bossId: string,
    challenge: {
      type: 'quick_draw' | 'dialogue' | 'puzzle' | 'skill_check';
      timeLimit?: number;
      skillCheck?: { skill: string; difficulty: number };
      successEffect: { bossHpPenalty?: number; playerBonus?: string };
      failureEffect: { playerHpPenalty?: number; bossBonus?: string };
    },
    playerResponse: { timeTaken?: number; skillResult?: number; choice?: string }
  ): Promise<{
    success: boolean;
    bossHpModifier: number;
    playerHpModifier: number;
    narrative: string;
    bonusApplied?: string;
  }> {
    let success = false;

    switch (challenge.type) {
      case 'quick_draw':
        // Success if player reacted within time limit
        success = (playerResponse.timeTaken || Infinity) <= (challenge.timeLimit || 2) * 1000;
        break;

      case 'skill_check':
        // Success if player's skill roll beats difficulty
        if (challenge.skillCheck && playerResponse.skillResult !== undefined) {
          success = playerResponse.skillResult >= challenge.skillCheck.difficulty;
        }
        break;

      case 'dialogue':
      case 'puzzle':
        // These are handled by processDialogueChoice
        success = playerResponse.choice === 'correct';
        break;
    }

    if (success) {
      return {
        success: true,
        bossHpModifier: -(challenge.successEffect.bossHpPenalty || 0),
        playerHpModifier: 0,
        narrative: 'Your quick reflexes give you the advantage!',
        bonusApplied: challenge.successEffect.playerBonus
      };
    } else {
      return {
        success: false,
        bossHpModifier: 0,
        playerHpModifier: -(challenge.failureEffect.playerHpPenalty || 0),
        narrative: 'Your opponent was faster...',
        bonusApplied: challenge.failureEffect.bossBonus
      };
    }
  }

  /**
   * Process dialogue choice during boss phase (e.g., Judge Bean's trial)
   */
  static async processDialogueChoice(
    characterId: string,
    choice: {
      id: string;
      skillCheck?: { skill: string; difficulty: number };
      successEffect?: { bossHpReduction?: number; playerBuff?: string };
      failureEffect?: { playerDebuff?: string; bossHeal?: number };
      effect?: { skipToPhase?: number; endDialogue?: boolean };
    },
    characterSkills: { skillId: string; level: number }[]
  ): Promise<{
    success: boolean;
    bossHpModifier: number;
    playerDebuff?: string;
    playerBuff?: string;
    skipToPhase?: number;
    narrative: string;
  }> {
    // If no skill check, just apply the direct effect
    if (!choice.skillCheck) {
      return {
        success: true,
        bossHpModifier: 0,
        skipToPhase: choice.effect?.skipToPhase,
        narrative: 'You make your choice...'
      };
    }

    // Find relevant skill
    const relevantSkill = characterSkills.find(
      s => s.skillId.toLowerCase().includes(choice.skillCheck!.skill.toLowerCase())
    );
    const skillLevel = relevantSkill?.level || 0;

    // Roll skill check: skill level + random(1-20) vs difficulty
    const roll = SecureRNG.range(1, 20) + skillLevel;
    const success = roll >= choice.skillCheck.difficulty;

    if (success) {
      return {
        success: true,
        bossHpModifier: -(choice.successEffect?.bossHpReduction || 0),
        playerBuff: choice.successEffect?.playerBuff,
        narrative: `Your ${choice.skillCheck.skill} succeeds!`
      };
    } else {
      return {
        success: false,
        bossHpModifier: choice.failureEffect?.bossHeal || 0,
        playerDebuff: choice.failureEffect?.playerDebuff,
        narrative: `Your ${choice.skillCheck.skill} fails...`
      };
    }
  }

  /**
   * Check spirit rotation for Tombstone Specter
   * Returns damage multiplier based on weapon match
   */
  static checkSpiritRotation(
    currentForm: 'wyatt' | 'doc' | 'clanton',
    playerWeaponType: string
  ): { damageMultiplier: number; healsInstead: boolean; narrative: string } {
    // Form-to-weapon mapping
    const validWeapons: Record<string, string[]> = {
      wyatt: ['revolver', 'pistol', 'handgun'],
      doc: ['cards', 'throwing', 'gambler'],
      clanton: ['shotgun', 'scatter', 'rifle']
    };

    const weaponLower = playerWeaponType.toLowerCase();
    const isValid = validWeapons[currentForm]?.some(w => weaponLower.includes(w)) || false;

    if (isValid) {
      return {
        damageMultiplier: 1.0,
        healsInstead: false,
        narrative: `Your ${playerWeaponType} strikes true against ${currentForm}'s spirit!`
      };
    } else {
      return {
        damageMultiplier: -0.5, // Negative = heals
        healsInstead: true,
        narrative: `The wrong weapon against ${currentForm}'s spirit - your attack heals the Specter!`
      };
    }
  }

  /**
   * Process cold stacks for Wendigo fight
   * Returns damage to apply and updated stack count
   */
  static processColdStacks(
    currentStacks: number,
    usedFire: boolean,
    reachedTorch: boolean
  ): {
    newStacks: number;
    coldDamage: number;
    narrative: string;
  } {
    let newStacks = currentStacks;

    // Fire reduces stacks by 2
    if (usedFire) {
      newStacks = Math.max(0, newStacks - 2);
    }

    // Torch resets to 0
    if (reachedTorch) {
      newStacks = 0;
      return {
        newStacks: 0,
        coldDamage: 0,
        narrative: 'The torch\'s warmth drives away the supernatural cold!'
      };
    }

    // Otherwise, add 1 stack
    if (!usedFire) {
      newStacks = Math.min(10, newStacks + 1);
    }

    // Calculate damage: 5 per stack
    const coldDamage = newStacks * 5;

    let narrative = '';
    if (newStacks >= 8) {
      narrative = 'The cold is unbearable! Find warmth immediately!';
    } else if (newStacks >= 5) {
      narrative = 'The supernatural cold seeps into your bones...';
    } else if (newStacks > 0) {
      narrative = 'The Wendigo\'s presence chills you.';
    } else {
      narrative = 'You maintain your warmth against the cold.';
    }

    return {
      newStacks,
      coldDamage,
      narrative
    };
  }

  /**
   * Process gold corruption stacks for Conquistador fight
   * Returns effects and whether player is corrupted
   */
  static processCorruptionStacks(
    currentStacks: number,
    pickedUpGold: boolean
  ): {
    newStacks: number;
    damageReduction: number;
    isFullyCorrupted: boolean;
    narrative: string;
  } {
    let newStacks = currentStacks;

    if (pickedUpGold) {
      newStacks = Math.min(10, newStacks + 1);
    }

    // 5% damage reduction per stack
    const damageReduction = newStacks * 0.05;

    // At 10 stacks, player joins the Conquistador's army (instant death)
    const isFullyCorrupted = newStacks >= 10;

    let narrative = '';
    if (isFullyCorrupted) {
      narrative = 'The curse consumes you! Your soul belongs to the Conquistador now...';
    } else if (newStacks >= 7) {
      narrative = 'The cursed gold\'s power overwhelms your will!';
    } else if (newStacks >= 4) {
      narrative = 'The gold whispers promises of power...';
    } else if (newStacks > 0) {
      narrative = 'The cursed gold taints your spirit.';
    } else {
      narrative = 'You resist the gold\'s temptation.';
    }

    return {
      newStacks,
      damageReduction,
      isFullyCorrupted,
      narrative
    };
  }

  /**
   * Apply boss mechanic modifiers to damage calculation
   * Call this before finalizing damage in boss fights
   */
  static applyBossMechanicModifiers(
    baseDamage: number,
    mechanicId: string,
    mechanicState: Record<string, unknown>
  ): { finalDamage: number; narrative?: string } {
    switch (mechanicId) {
      case 'spirit_rotation': {
        const result = this.checkSpiritRotation(
          mechanicState.currentForm as 'wyatt' | 'doc' | 'clanton',
          mechanicState.weaponType as string
        );
        if (result.healsInstead) {
          return {
            finalDamage: -Math.floor(baseDamage * 0.5),
            narrative: result.narrative
          };
        }
        return { finalDamage: baseDamage, narrative: result.narrative };
      }

      case 'gold_corruption': {
        const stacks = (mechanicState.corruptionStacks as number) || 0;
        const reduction = stacks * 0.05;
        return {
          finalDamage: Math.floor(baseDamage * (1 - reduction)),
          narrative: stacks > 0 ? `Corruption reduces your damage by ${Math.floor(reduction * 100)}%` : undefined
        };
      }

      default:
        return { finalDamage: baseDamage };
    }
  }

  // =============================================================================
  // PHASE 19.5: Ghost Town Mini-Boss Handlers
  // =============================================================================

  /**
   * Process oxygen depletion for Mine Foreman Ghost (Fading Breath)
   * Returns hand size modifier, damage, and updated oxygen level
   */
  static processOxygenDepletion(
    currentOxygen: number,
    foundAirPocket: boolean,
    handRank: HandRank
  ): {
    newOxygen: number;
    handSizeModifier: number;
    suffocationDamage: number;
    isDefeated: boolean;
    narrative: string;
  } {
    let newOxygen = currentOxygen;

    // Air pocket restores 20% if player drew Pair or better
    if (foundAirPocket && handRank >= HandRank.PAIR) {
      newOxygen = Math.min(100, newOxygen + 20);
      return {
        newOxygen,
        handSizeModifier: this.getHandSizeModifierForOxygen(newOxygen),
        suffocationDamage: 0,
        isDefeated: false,
        narrative: 'You find a pocket of fresh air and catch your breath!'
      };
    }

    // Oxygen decreases 10% per round
    newOxygen = Math.max(0, newOxygen - 10);

    const handSizeModifier = this.getHandSizeModifierForOxygen(newOxygen);
    const suffocationDamage = newOxygen <= 30 ? 20 : 0;
    const isDefeated = newOxygen <= 0;

    let narrative = '';
    if (isDefeated) {
      narrative = 'You collapse from lack of air... the mine claims another victim.';
    } else if (newOxygen <= 30) {
      narrative = `Oxygen critical (${newOxygen}%)! You gasp for air, taking 20 damage!`;
    } else if (newOxygen <= 50) {
      narrative = `The air grows thin (${newOxygen}%). You can only draw 3 cards.`;
    } else if (newOxygen <= 70) {
      narrative = `The bad air affects you (${newOxygen}%). You can only draw 4 cards.`;
    } else {
      narrative = `Oxygen at ${newOxygen}%. The mine air is stale but breathable.`;
    }

    return { newOxygen, handSizeModifier, suffocationDamage, isDefeated, narrative };
  }

  private static getHandSizeModifierForOxygen(oxygen: number): number {
    if (oxygen <= 50) return -2; // Draw 3 cards
    if (oxygen <= 70) return -1; // Draw 4 cards
    return 0; // Draw 5 cards
  }

  /**
   * Process poker round for Wild Bill's Echo (Eternal Game)
   * Alternates between combat and poker every 2 rounds
   */
  static processPokerRound(
    roundNumber: number,
    playerHand: Card[],
    billHand: Card[]
  ): {
    isPokerRound: boolean;
    result?: 'player_win_1' | 'player_win_2' | 'tie' | 'bill_win_1' | 'bill_win_2';
    damageModifier?: number;
    skipBossAttack?: boolean;
    forcedNextHand?: 'high_card';
    psychicDamage?: number;
    isDeadMansHand?: boolean;
    narrative: string;
  } {
    // Only every 2nd round is a poker round
    if (roundNumber % 2 !== 0) {
      return {
        isPokerRound: false,
        narrative: 'Combat round - the cards wait...'
      };
    }

    const { evaluateHand } = require('@desperados/shared');
    const playerEval = evaluateHand(playerHand);
    const billEval = evaluateHand(billHand);

    // Check for Dead Man's Hand (Aces and Eights)
    const isPlayerDeadMansHand = this.isDeadMansHand(playerHand);
    const isBillDeadMansHand = this.isDeadMansHand(billHand);

    if (isPlayerDeadMansHand) {
      return {
        isPokerRound: true,
        result: 'player_win_2',
        damageModifier: 1.25, // Instant 25% damage to boss
        psychicDamage: 100, // But take psychic damage
        isDeadMansHand: true,
        narrative: 'Dead Man\'s Hand! The legendary cards strike Wild Bill, but the curse touches you too!'
      };
    }

    if (isBillDeadMansHand) {
      return {
        isPokerRound: true,
        result: 'bill_win_2',
        psychicDamage: 150,
        isDeadMansHand: true,
        narrative: 'Wild Bill draws his famous hand... Aces and Eights! The curse empowers him!'
      };
    }

    const rankDiff = playerEval.score - billEval.score;

    if (rankDiff > 100) {
      return {
        isPokerRound: true,
        result: 'player_win_2',
        skipBossAttack: true,
        narrative: 'You dominate the poker hand! Wild Bill is stunned and skips his attack!'
      };
    } else if (rankDiff > 0) {
      return {
        isPokerRound: true,
        result: 'player_win_1',
        damageModifier: 1.2,
        narrative: 'You win the poker round! +20% damage next combat round.'
      };
    } else if (rankDiff === 0) {
      return {
        isPokerRound: true,
        result: 'tie',
        psychicDamage: 50,
        narrative: 'A tie! The supernatural tension damages both of you.'
      };
    } else if (rankDiff > -100) {
      return {
        isPokerRound: true,
        result: 'bill_win_1',
        psychicDamage: 80,
        narrative: 'Wild Bill wins the hand. The cards cut deep - you take 80 damage.'
      };
    } else {
      return {
        isPokerRound: true,
        result: 'bill_win_2',
        forcedNextHand: 'high_card',
        psychicDamage: 80,
        narrative: 'Wild Bill crushes you at poker! Your next hand is forced to High Card.'
      };
    }
  }

  private static isDeadMansHand(hand: Card[]): boolean {
    // Aces and Eights: Two aces, two eights
    const { Rank } = require('@desperados/shared');
    const ranks = hand.map(c => c.rank);
    const aceCount = ranks.filter((r: number) => r === Rank.ACE).length;
    const eightCount = ranks.filter((r: number) => r === Rank.EIGHT).length;
    return aceCount >= 2 && eightCount >= 2;
  }

  /**
   * Process guilt vision for The Avenger (Guilt Mirror)
   * Every 3 rounds, player must confront their guilt
   */
  static processGuiltVision(
    currentGuilt: number,
    roundNumber: number,
    playerHand: Card[],
    handRank: HandRank
  ): {
    isVisionRound: boolean;
    newGuilt: number;
    powerModifier: number;
    guiltTier: 'innocent' | 'questionable' | 'guilty' | 'damned';
    peacefulResolution: boolean;
    narrative: string;
  } {
    // Vision every 3 rounds
    if (roundNumber % 3 !== 0) {
      return {
        isVisionRound: false,
        newGuilt: currentGuilt,
        powerModifier: this.getGuiltPowerModifier(currentGuilt),
        guiltTier: this.getGuiltTier(currentGuilt),
        peacefulResolution: false,
        narrative: ''
      };
    }

    let guiltReduction = 0;

    // Base reduction from hand strength
    if (handRank >= HandRank.FOUR_OF_A_KIND) {
      // Four of a Kind+ skips the vision entirely
      return {
        isVisionRound: true,
        newGuilt: currentGuilt,
        powerModifier: this.getGuiltPowerModifier(currentGuilt),
        guiltTier: this.getGuiltTier(currentGuilt),
        peacefulResolution: currentGuilt <= 0,
        narrative: 'Your unwavering resolve repels the vision!'
      };
    } else if (handRank >= HandRank.FULL_HOUSE) {
      guiltReduction = 15;
    } else if (handRank >= HandRank.FLUSH) {
      guiltReduction = 10;
    } else if (handRank >= HandRank.STRAIGHT) {
      guiltReduction = 8;
    } else if (handRank >= HandRank.THREE_OF_A_KIND) {
      guiltReduction = 5;
    } else if (handRank >= HandRank.TWO_PAIR) {
      guiltReduction = 3;
    } else if (handRank >= HandRank.PAIR) {
      guiltReduction = 1;
    }

    // HEARTS hands double the reduction
    const { Suit } = require('@desperados/shared');
    const heartsCount = playerHand.filter(c => c.suit === Suit.HEARTS).length;
    if (heartsCount >= 3) {
      guiltReduction *= 2;
    }

    const newGuilt = Math.max(0, currentGuilt - guiltReduction);
    const peacefulResolution = newGuilt <= 0;

    let narrative = '';
    if (peacefulResolution) {
      narrative = 'Your guilt dissolves completely. The Avenger sees your redemption and releases you peacefully.';
    } else if (guiltReduction > 0) {
      narrative = `You confront your past. Guilt reduced by ${guiltReduction} to ${newGuilt}.`;
    } else {
      narrative = 'The vision overwhelms you. Your guilt remains unchanged.';
    }

    return {
      isVisionRound: true,
      newGuilt,
      powerModifier: this.getGuiltPowerModifier(newGuilt),
      guiltTier: this.getGuiltTier(newGuilt),
      peacefulResolution,
      narrative
    };
  }

  private static getGuiltPowerModifier(guilt: number): number {
    if (guilt <= 20) return 0.7;
    if (guilt <= 50) return 1.0;
    if (guilt <= 80) return 1.3;
    return 1.5;
  }

  private static getGuiltTier(guilt: number): 'innocent' | 'questionable' | 'guilty' | 'damned' {
    if (guilt <= 20) return 'innocent';
    if (guilt <= 50) return 'questionable';
    if (guilt <= 80) return 'guilty';
    return 'damned';
  }

  /**
   * Process altar activation for Undead Priest (Corrupted Sacraments)
   * Dominant suit in hand triggers corresponding altar effect
   */
  static processAltarActivation(
    playerHand: Card[],
    altars: { id: 'spades' | 'hearts' | 'clubs' | 'diamonds'; purified: boolean }[]
  ): {
    dominantSuit: 'spades' | 'hearts' | 'clubs' | 'diamonds';
    effect: 'root' | 'boss_heal' | 'double_damage' | 'corruption_dot' | 'none';
    isPurified: boolean;
    isMonochrome: boolean;
    damageModifier: number;
    bossHealPercent: number;
    rootDuration: number;
    corruptionDamage: number;
    narrative: string;
  } {
    const { Suit } = require('@desperados/shared');

    // Map Suit enum to lowercase string for altar matching
    const suitToString: Record<string, 'spades' | 'hearts' | 'clubs' | 'diamonds'> = {
      [Suit.SPADES]: 'spades',
      [Suit.HEARTS]: 'hearts',
      [Suit.CLUBS]: 'clubs',
      [Suit.DIAMONDS]: 'diamonds'
    };

    // Count suits
    const suitCounts = { spades: 0, hearts: 0, clubs: 0, diamonds: 0 };
    playerHand.forEach(c => {
      const suitStr = suitToString[c.suit];
      if (suitStr && suitCounts[suitStr] !== undefined) {
        suitCounts[suitStr]++;
      }
    });

    // Check for monochrome hand (all black or all red)
    const blackCount = suitCounts.spades + suitCounts.clubs;
    const redCount = suitCounts.hearts + suitCounts.diamonds;
    const isMonochrome = blackCount === 5 || redCount === 5;

    // Find dominant suit
    let dominantSuit: 'spades' | 'hearts' | 'clubs' | 'diamonds' = 'spades';
    let maxCount = 0;
    for (const [suit, count] of Object.entries(suitCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantSuit = suit as 'spades' | 'hearts' | 'clubs' | 'diamonds';
      }
    }

    // Check if this altar is purified
    const altar = altars.find(a => a.id === dominantSuit);
    const isPurified = altar?.purified || false;

    // If purified, no negative effects
    if (isPurified) {
      return {
        dominantSuit,
        effect: 'none',
        isPurified: true,
        isMonochrome,
        damageModifier: isMonochrome ? 1.3 : 1.0,
        bossHealPercent: 0,
        rootDuration: 0,
        corruptionDamage: 0,
        narrative: `The purified Altar of ${dominantSuit.charAt(0).toUpperCase() + dominantSuit.slice(1)} provides no power to the priest.`
      };
    }

    // Apply altar effect
    let effect: 'root' | 'boss_heal' | 'double_damage' | 'corruption_dot' = 'root';
    let damageModifier = isMonochrome ? 1.3 : 1.0;
    let bossHealPercent = 0;
    let rootDuration = 0;
    let corruptionDamage = 0;
    let narrative = '';

    switch (dominantSuit) {
      case 'spades':
        effect = 'root';
        rootDuration = 1;
        narrative = 'The Altar of Confession binds you! Rooted for 1 turn.';
        break;
      case 'hearts':
        effect = 'boss_heal';
        bossHealPercent = 5;
        narrative = 'The Altar of Communion pulses! The priest heals 5%.';
        break;
      case 'clubs':
        effect = 'double_damage';
        damageModifier *= 2;
        narrative = 'The Altar of Unction empowers your strike! Double damage this round!';
        break;
      case 'diamonds':
        effect = 'corruption_dot';
        corruptionDamage = 15;
        narrative = 'The Altar of Baptism curses you! Corruption deals 15 damage.';
        break;
    }

    return {
      dominantSuit,
      effect,
      isPurified,
      isMonochrome,
      damageModifier,
      bossHealPercent,
      rootDuration,
      corruptionDamage,
      narrative
    };
  }

  /**
   * Process altar purification for Undead Priest
   * Player uses "Target Altar" action and draws matching suit
   */
  static processAltarPurification(
    targetAltar: 'spades' | 'hearts' | 'clubs' | 'diamonds',
    playerHand: Card[],
    altars: { id: 'spades' | 'hearts' | 'clubs' | 'diamonds'; purified: boolean }[]
  ): {
    success: boolean;
    newAltars: { id: 'spades' | 'hearts' | 'clubs' | 'diamonds'; purified: boolean }[];
    purifiedCount: number;
    trueFormWeakened: boolean;
    narrative: string;
  } {
    const { Suit } = require('@desperados/shared');

    // Map altar string to Suit enum
    const stringToSuit: Record<string, string> = {
      spades: Suit.SPADES,
      hearts: Suit.HEARTS,
      clubs: Suit.CLUBS,
      diamonds: Suit.DIAMONDS
    };

    const targetSuitEnum = stringToSuit[targetAltar];

    // Check if hand has majority of target suit
    const targetSuitCount = playerHand.filter(
      c => c.suit === targetSuitEnum
    ).length;

    const success = targetSuitCount >= 3;

    const newAltars = altars.map(a => ({
      ...a,
      purified: a.id === targetAltar ? (a.purified || success) : a.purified
    }));

    const purifiedCount = newAltars.filter(a => a.purified).length;
    const trueFormWeakened = purifiedCount >= 4;

    let narrative = '';
    if (success) {
      if (trueFormWeakened) {
        narrative = `All 4 altars purified! Father Maldonado's True Form is weakened to 60% power!`;
      } else {
        narrative = `The Altar of ${targetAltar.charAt(0).toUpperCase() + targetAltar.slice(1)} is purified! (${purifiedCount}/4)`;
      }
    } else {
      narrative = `Not enough ${targetAltar} cards to purify the altar. Need 3+, you had ${targetSuitCount}.`;
    }

    return { success, newAltars, purifiedCount, trueFormWeakened, narrative };
  }

  // =============================================================================
  // LEGENDARY BOUNTY BOSS HANDLERS (Phase 19.5)
  // =============================================================================

  /**
   * Process Jesse James bluff round
   * Every 2 rounds, Jesse claims an attack type - player must call or fold
   */
  static processBluffRound(
    round: number,
    playerHand: Card[],
    playerAction: 'call' | 'fold'
  ): {
    bluffClaim: { claimedAttack: string; actualAttack: string; isBluff: boolean };
    result: 'correct_call' | 'incorrect_call' | 'fold';
    jesseVulnerable: boolean;
    playerVulnerable: boolean;
    surrendered: boolean;
    narrative: string;
  } {
    const { HandRank, Rank } = require('@desperados/shared');

    // Generate Jesse's bluff
    const attacks = ['physical', 'special', 'ultimate'];
    const claimedAttack = SecureRNG.select(attacks);
    const actualAttack = SecureRNG.select(attacks);
    const isBluff = claimedAttack !== actualAttack;

    // Evaluate player's hand for detection bonuses
    const handRank = this.evaluateHandRank(playerHand);
    const hasPairOrBetter = handRank >= HandRank.PAIR;
    const hasRoyalFlush = handRank === HandRank.ROYAL_FLUSH;

    // Check for special hand conditions
    const { Suit } = require('@desperados/shared');
    const spadeCount = playerHand.filter(c => c.suit === Suit.SPADES).length;
    const hasSpadesMajority = spadeCount >= 3;

    let result: 'correct_call' | 'incorrect_call' | 'fold' = 'fold';
    let jesseVulnerable = false;
    let playerVulnerable = false;
    let surrendered = false;
    let narrative = '';

    // Royal Flush = instant surrender
    if (hasRoyalFlush) {
      surrendered = true;
      narrative = 'You draw a Royal Flush! Jesse tips his hat. "You\'re better than me, partner. I surrender."';
      return {
        bluffClaim: { claimedAttack, actualAttack, isBluff },
        result: 'correct_call',
        jesseVulnerable: true,
        playerVulnerable: false,
        surrendered: true,
        narrative
      };
    }

    if (playerAction === 'fold') {
      narrative = `Jesse claimed a ${claimedAttack} attack. You fold - playing it safe. ${isBluff ? 'He was bluffing!' : 'He was telling the truth.'}`;
    } else {
      // Call - check if correct
      // Pair+ automatically beats bluff
      if (hasPairOrBetter && isBluff) {
        result = 'correct_call';
        jesseVulnerable = true;
        narrative = `Your ${HandRank[handRank]} sees through Jesse's bluff! He claimed ${claimedAttack} but was planning ${actualAttack}. Jesse takes 50% more damage next round!`;
      } else if (isBluff) {
        // Spades give accuracy bonus
        const detectChance = hasSpadesMajority ? 0.75 : 0.5;
        if (SecureRNG.chance(detectChance)) {
          result = 'correct_call';
          jesseVulnerable = true;
          narrative = `You read Jesse correctly! ${hasSpadesMajority ? 'Your spades revealed his intentions. ' : ''}He was bluffing - claimed ${claimedAttack} but planned ${actualAttack}. +50% damage!`;
        } else {
          result = 'incorrect_call';
          playerVulnerable = true;
          narrative = `Wrong call! Jesse was bluffing, but you guessed wrong. He claimed ${claimedAttack} but planned ${actualAttack}. You take 30% more damage!`;
        }
      } else {
        // Not a bluff - calling it is incorrect
        result = 'incorrect_call';
        playerVulnerable = true;
        narrative = `Jesse wasn't bluffing! He said ${claimedAttack} and meant it. Your wrong call costs you - take 30% more damage!`;
      }
    }

    return {
      bluffClaim: { claimedAttack, actualAttack, isBluff },
      result,
      jesseVulnerable,
      playerVulnerable,
      surrendered,
      narrative
    };
  }

  /**
   * Process Doc Holliday poker showdown
   * Every 3 rounds, combat pauses for a poker hand
   */
  static processPokerShowdown(
    round: number,
    playerHand: Card[],
    docHandRank: HandRank
  ): {
    playerHandRank: HandRank;
    docHandRank: HandRank;
    winner: 'player' | 'doc' | 'tie';
    margin: number;
    playerDamageBonus: number;
    docDamageBonus: number;
    docSkipsAttack: boolean;
    playerHandCapped: boolean;
    deadMansHand: boolean;
    fourAces: boolean;
    royalFlush: boolean;
    narrative: string;
  } {
    const { HandRank, Rank } = require('@desperados/shared');

    const playerHandRank = this.evaluateHandRank(playerHand);
    const margin = playerHandRank - docHandRank;
    const winner = margin > 0 ? 'player' : margin < 0 ? 'doc' : 'tie';

    // Check for special hands
    const isDeadMansHand = this.isDeadMansHand(playerHand);
    const hasFourAces = playerHandRank === HandRank.FOUR_OF_A_KIND &&
      playerHand.filter(c => c.rank === Rank.ACE).length >= 4;
    const hasRoyalFlush = playerHandRank === HandRank.ROYAL_FLUSH;

    let playerDamageBonus = 0;
    let docDamageBonus = 0;
    let docSkipsAttack = false;
    let playerHandCapped = false;
    let narrative = '';

    // Handle special hands first
    if (hasRoyalFlush) {
      narrative = 'ROYAL FLUSH! Doc tips his hat and walks away. "Well played, friend." Instant victory!';
      return {
        playerHandRank, docHandRank, winner: 'player', margin: 10,
        playerDamageBonus: 100, docDamageBonus: 0, docSkipsAttack: true,
        playerHandCapped: false, deadMansHand: false, fourAces: false, royalFlush: true, narrative
      };
    }

    if (hasFourAces) {
      narrative = 'Four Aces! Doc looks at your hand with respect. "I know when I\'m beat. Let me buy you a drink." Peaceful resolution offered.';
      return {
        playerHandRank, docHandRank, winner: 'player', margin: 5,
        playerDamageBonus: 50, docDamageBonus: 0, docSkipsAttack: true,
        playerHandCapped: false, deadMansHand: false, fourAces: true, royalFlush: false, narrative
      };
    }

    if (isDeadMansHand) {
      narrative = 'Dead Man\'s Hand - Aces and Eights! Both you and Doc take 100 damage as the spirits of Deadwood stir. Doc coughs blood.';
      return {
        playerHandRank, docHandRank, winner: 'tie', margin: 0,
        playerDamageBonus: 0, docDamageBonus: 0, docSkipsAttack: false,
        playerHandCapped: false, deadMansHand: true, fourAces: false, royalFlush: false, narrative
      };
    }

    // Regular poker results
    if (winner === 'player') {
      if (margin >= 2) {
        docSkipsAttack = true;
        playerDamageBonus = 0.15;
        narrative = `You win big with ${HandRank[playerHandRank]} vs Doc's ${HandRank[docHandRank]}! Doc skips his next attack and you gain +15% damage!`;
      } else {
        playerDamageBonus = 0.15;
        narrative = `You win with ${HandRank[playerHandRank]} vs Doc's ${HandRank[docHandRank]}! +15% damage for 2 rounds!`;
      }
    } else if (winner === 'doc') {
      if (Math.abs(margin) >= 2) {
        playerHandCapped = true;
        docDamageBonus = 0.15;
        narrative = `Doc wins big with ${HandRank[docHandRank]} vs your ${HandRank[playerHandRank]}! Your next hand is capped at Three of a Kind and Doc gains +15% damage!`;
      } else {
        docDamageBonus = 0.15;
        narrative = `Doc wins with ${HandRank[docHandRank]} vs your ${HandRank[playerHandRank]}. Doc gains +15% damage!`;
      }
    } else {
      narrative = `Push! Both hands are ${HandRank[playerHandRank]}. You and Doc both heal 5%.`;
    }

    return {
      playerHandRank, docHandRank, winner, margin,
      playerDamageBonus, docDamageBonus, docSkipsAttack, playerHandCapped,
      deadMansHand: false, fourAces: false, royalFlush: false, narrative
    };
  }

  /**
   * Process Ghost Rider spirit trail matching
   * In spirit phase, player must match suit trail to deal damage
   */
  static processSpiritTrail(
    playerHand: Card[],
    spiritTrail: ('spades' | 'hearts' | 'clubs' | 'diamonds')[],
    currentRealm: 'physical' | 'spirit'
  ): {
    matched: number;
    damageMultiplier: number;
    vengeanceAttack: boolean;
    spiritEscaped: boolean;
    escapeBlocked: boolean;
    flushBonus: boolean;
    straightBonus: boolean;
    suitDamageBonus: 'hearts' | 'diamonds' | null;
    narrative: string;
  } {
    const { HandRank, Suit } = require('@desperados/shared');

    // Map string suits to enum
    const stringToSuit: Record<string, string> = {
      spades: Suit.SPADES,
      hearts: Suit.HEARTS,
      clubs: Suit.CLUBS,
      diamonds: Suit.DIAMONDS
    };

    // Count suits in player's hand
    const suitCounts: Record<string, number> = {
      spades: 0,
      hearts: 0,
      clubs: 0,
      diamonds: 0
    };

    for (const card of playerHand) {
      if (card.suit === Suit.SPADES) suitCounts.spades++;
      else if (card.suit === Suit.HEARTS) suitCounts.hearts++;
      else if (card.suit === Suit.CLUBS) suitCounts.clubs++;
      else if (card.suit === Suit.DIAMONDS) suitCounts.diamonds++;
    }

    // Check how many trail suits are matched (at least 1 card of that suit)
    let matched = 0;
    for (const trailSuit of spiritTrail) {
      if (suitCounts[trailSuit] > 0) {
        matched++;
        suitCounts[trailSuit]--; // Use up one card per match
      }
    }

    // Check for hand bonuses
    const handRank = this.evaluateHandRank(playerHand);
    const isFlush = handRank === HandRank.FLUSH || handRank === HandRank.STRAIGHT_FLUSH || handRank === HandRank.ROYAL_FLUSH;
    const isStraight = handRank === HandRank.STRAIGHT || handRank === HandRank.STRAIGHT_FLUSH;

    // Determine damage and effects based on matches
    let damageMultiplier = 0;
    let vengeanceAttack = false;
    let spiritEscaped = false;
    let escapeBlocked = isStraight;
    let narrative = '';

    // Realm-specific suit bonuses
    let suitDamageBonus: 'hearts' | 'diamonds' | null = null;
    const heartCount = playerHand.filter(c => c.suit === Suit.HEARTS).length;
    const diamondCount = playerHand.filter(c => c.suit === Suit.DIAMONDS).length;

    if (currentRealm === 'spirit' && heartCount >= 3) {
      suitDamageBonus = 'hearts';
    } else if (currentRealm === 'physical' && diamondCount >= 3) {
      suitDamageBonus = 'diamonds';
    }

    // Flush = double damage regardless of matching
    if (isFlush) {
      damageMultiplier = 2.0;
      narrative = `Perfect synchronization! Your Flush allows you to hit Rising Moon for DOUBLE damage!`;
    } else if (matched === 3) {
      damageMultiplier = 1.0;
      narrative = `You match all 3 trail suits (${spiritTrail.join('-')})! Full damage and the spirit is stunned!`;
    } else if (matched === 2) {
      damageMultiplier = 0.5;
      narrative = `You match 2 of 3 trail suits. Half damage, but the chase continues.`;
    } else if (matched === 1) {
      damageMultiplier = 0;
      vengeanceAttack = true;
      narrative = `Only 1 suit matched! No damage dealt. Rising Moon attacks with vengeance (+50% damage)!`;
    } else {
      damageMultiplier = 0;
      if (escapeBlocked) {
        narrative = `No suits matched, but your Straight cuts off his retreat! He cannot escape this round.`;
      } else {
        spiritEscaped = true;
        narrative = `No suits matched! The spirit escapes through the veil. You lose a round of progress.`;
      }
    }

    if (suitDamageBonus) {
      damageMultiplier += 0.25;
      narrative += ` Your ${suitDamageBonus === 'hearts' ? 'HEARTS connect to his pain' : 'DIAMONDS anchor you'} for +25% bonus damage!`;
    }

    return {
      matched,
      damageMultiplier,
      vengeanceAttack,
      spiritEscaped,
      escapeBlocked,
      flushBonus: isFlush,
      straightBonus: isStraight,
      suitDamageBonus,
      narrative
    };
  }

  /**
   * Generate a random spirit trail for Ghost Rider
   */
  static generateSpiritTrail(): ('spades' | 'hearts' | 'clubs' | 'diamonds')[] {
    const suits: ('spades' | 'hearts' | 'clubs' | 'diamonds')[] = ['spades', 'hearts', 'clubs', 'diamonds'];
    const trail: ('spades' | 'hearts' | 'clubs' | 'diamonds')[] = [];
    for (let i = 0; i < 3; i++) {
      trail.push(SecureRNG.select(suits));
    }
    return trail;
  }

  /**
   * Generate Doc Holliday's hand rank for poker showdown
   * Doc is a skilled gambler - weighted toward better hands
   */
  static generateDocHand(): HandRank {
    const { HandRank } = require('@desperados/shared');

    // Weighted distribution favoring better hands
    const roll = SecureRNG.float(0, 1, 4);
    if (roll < 0.05) return HandRank.HIGH_CARD;
    if (roll < 0.20) return HandRank.PAIR;
    if (roll < 0.40) return HandRank.TWO_PAIR;
    if (roll < 0.60) return HandRank.THREE_OF_A_KIND;
    if (roll < 0.75) return HandRank.STRAIGHT;
    if (roll < 0.85) return HandRank.FLUSH;
    if (roll < 0.92) return HandRank.FULL_HOUSE;
    if (roll < 0.97) return HandRank.FOUR_OF_A_KIND;
    if (roll < 0.99) return HandRank.STRAIGHT_FLUSH;
    return HandRank.ROYAL_FLUSH; // 1% chance
  }

  /**
   * Helper to evaluate hand rank from cards
   */
  private static evaluateHandRank(hand: Card[]): HandRank {
    const { HandRank, evaluateHand } = require('@desperados/shared');
    try {
      const result = evaluateHand(hand);
      return result.rank;
    } catch {
      return HandRank.HIGH_CARD;
    }
  }
}
