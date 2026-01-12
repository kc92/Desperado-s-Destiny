/**
 * Combat Turn Service
 *
 * Core combat turn lifecycle including:
 * - Player turn start and card drawing
 * - Hold/discard mechanics
 * - Reroll and peek abilities
 * - Victory and defeat handling
 *
 * REFACTOR: Extracted from combat.service.ts to follow single responsibility principle
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../../models/Character.model';
import { INPC } from '../../models/NPC.model';
import {
  CombatEncounter,
  ICombatEncounter,
  ICombatRound,
  ICurrentRound,
  ILootAwarded
} from '../../models/CombatEncounter.model';
import {
  CombatStatus,
  HandRank,
  PlayerTurnPhase,
  CombatAction,
  CombatActionResult,
  COMBAT_TIMING,
  shuffleDeck,
  drawCards,
  evaluateHand,
  Card
} from '@desperados/shared';
import { withLock } from '../../utils/distributedLock';
import logger from '../../utils/logger';

// Import sub-services
import { CombatCalculationService } from './combatCalculation.service';
import { CombatNPCService } from './combatNPC.service';
import { CombatRewardService } from './combatReward.service';

// ============================================================================
// COMBAT TURN SERVICE
// ============================================================================

export class CombatTurnService {
  /**
   * Start a player's turn - draws cards and sets up hold phase
   * This is the entry point for combat turns
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
          // SECURITY FIX: Check if timeout has expired before returning round state
          // This prevents players from stalling combat indefinitely
          const now = new Date();
          if (encounter.currentRound.timeoutAt && now > encounter.currentRound.timeoutAt) {
            // Timeout expired - auto-confirm with current held cards
            logger.info(
              `Combat turn timeout enforced on poll: Encounter ${encounterId}, expired ${now.getTime() - encounter.currentRound.timeoutAt.getTime()}ms ago`
            );

            // Force confirm the current state - player loses their action
            const fetchedCharacter = await Character.findById(characterId);
            if (fetchedCharacter) {
              return await this.processConfirmHold(encounter, fetchedCharacter);
            }
          }

          // Return the existing round state (not expired yet)
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
        const abilities = CombatCalculationService.calculateAbilities(character);

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

        // SECURITY FIX: Check if timeout has already expired
        // This prevents players from submitting actions after their turn timer runs out
        const now = new Date();
        if (encounter.currentRound.timeoutAt && now > encounter.currentRound.timeoutAt) {
          const gracePeriodMs = 100; // 100ms for network latency (reduced from 1s to prevent exploitation)
          const expiredBy = now.getTime() - encounter.currentRound.timeoutAt.getTime();

          if (expiredBy > gracePeriodMs) {
            logger.info(
              `Combat action rejected - timeout expired ${expiredBy}ms ago for encounter ${encounterId}`
            );
            return {
              success: false,
              error: 'Your turn has timed out. The round is being processed automatically.'
            };
          }
          // Within grace period - allow the action but log it
          logger.debug(
            `Combat action accepted within grace period (${expiredBy}ms) for encounter ${encounterId}`
          );
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

  // ============================================================================
  // PRIVATE ACTION HANDLERS
  // ============================================================================

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
    // Lazy load services to prevent circular dependencies
    const karmaEffectsService = (await import('../karmaEffects.service')).default;
    const karmaService = (await import('../karma.service')).default;
    const { SkillService } = await import('../skill.service');
    const { CharacterProgressionService } = await import('../characterProgression.service');
    const { QuestService } = await import('../quest.service');
    const { CombatContractTrackerService } = await import('../combatContractTracker.service');

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

    // Calculate player damage using EFFECTIVENESS SYSTEM V2
    const rawSkillBonus = CombatCalculationService.getCombatSkillBonus(character);
    const combatSkillLevel = Math.min(rawSkillBonus * 0.42, 50); // Convert 0-120 range to 0-50

    // Use V2 effectiveness-based damage
    const damageResult = CombatCalculationService.calculateDamageV2(
      playerEval.rank,
      finalHand,
      combatSkillLevel,
      'clubs' // Combat uses clubs suit
    );

    logger.info(`[Combat V2] ${damageResult.breakdown.handName}: base ${damageResult.breakdown.baseValue}, ` +
      `suits ${damageResult.breakdown.suitMatches}/5 (${damageResult.breakdown.suitMultiplier}x), ` +
      `skill ${damageResult.breakdown.skillBoostPercent.toFixed(0)}% (${damageResult.breakdown.skillMultiplier}x), ` +
      `effectiveness ${damageResult.effectiveness} → damage ${damageResult.damage}`);

    // Check for deadly aim critical hit (1.5x on royal flush/straight flush)
    let critMultiplier = 1.0;
    if (currentRound.abilities.deadlyAimUnlocked) {
      if (playerEval.rank === HandRank.ROYAL_FLUSH || playerEval.rank === HandRank.STRAIGHT_FLUSH) {
        critMultiplier = 1.5;
        logger.info(`Deadly Aim critical hit! ${critMultiplier}x damage`);
      }
    }

    let playerDamage = Math.floor(damageResult.damage * critMultiplier);

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

    // Store effectiveness breakdown for UI
    (currentRound as any).effectiveness = damageResult.effectiveness;
    (currentRound as any).effectivenessBreakdown = damageResult.breakdown;

    // Check for NPC defeat
    if (encounter.npcHP <= 0) {
      return await this.handlePlayerVictory(
        encounter, character, currentRound,
        { karmaService, SkillService, CharacterProgressionService, QuestService, CombatContractTrackerService }
      );
    }

    // NPC turn
    currentRound.phase = PlayerTurnPhase.NPC_TURN;
    const npcResult = await CombatNPCService.playNPCHoldDiscardTurn(encounter, npc, currentRound);

    // Update round with NPC result
    currentRound.npcHand = npcResult.npcHand;
    currentRound.npcHandRank = npcResult.npcHandRank;
    currentRound.npcDamage = npcResult.npcDamage;

    // Apply NPC damage
    encounter.playerHP = Math.max(0, encounter.playerHP - npcResult.npcDamage);

    // Check for player defeat
    if (encounter.playerHP <= 0) {
      return await this.handlePlayerDefeat(encounter, character, currentRound, { CombatContractTrackerService });
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
    const karmaService = (await import('../karma.service')).default;

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

  // ============================================================================
  // VICTORY/DEFEAT HANDLERS
  // ============================================================================

  /**
   * Handle player victory - award loot and end combat
   */
  private static async handlePlayerVictory(
    encounter: ICombatEncounter,
    character: ICharacter,
    currentRound: ICurrentRound,
    services: {
      karmaService: any;
      SkillService: any;
      CharacterProgressionService: any;
      QuestService: any;
      CombatContractTrackerService: any;
    }
  ): Promise<CombatActionResult> {
    const { karmaService, SkillService, CharacterProgressionService, QuestService, CombatContractTrackerService } = services;
    const npc = encounter.npcId as unknown as INPC;

    encounter.status = CombatStatus.PLAYER_VICTORY;
    encounter.endedAt = new Date();
    currentRound.phase = PlayerTurnPhase.COMPLETE;

    // Roll loot
    const bossId = npc.type === 'BOSS' ? (npc._id as mongoose.Types.ObjectId).toString() : undefined;
    const isFirstKill = bossId
      ? await CombatRewardService.isFirstBossKill(character._id.toString(), bossId)
      : false;
    const loot = CombatRewardService.rollLoot(npc, isFirstKill, bossId);
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
    await CombatRewardService.awardLoot(character, npc, loot, undefined, encounter);

    // Award Combat XP based on NPC level
    try {
      const npcLevel = npc.level || 1;
      const pveXP = SkillService.calculatePvECombatXP(npcLevel);
      const combatResult = await SkillService.awardCombatXP(
        character._id.toString(),
        pveXP,
        'pve'
      );

      // Check Combat Level milestones if leveled up
      if (combatResult.leveledUp) {
        await CharacterProgressionService.checkCombatLevelMilestones(
          character._id.toString(),
          combatResult.newCombatLevel,
          combatResult.totalCombatXp
        );
      }
    } catch (combatXpError) {
      logger.warn('Failed to award combat XP:', combatXpError);
    }

    // Update quest progress
    await QuestService.onEnemyDefeated(character._id.toString(), npc.type || 'enemy');

    // Track combat contract progress
    try {
      const totalDamageDealt = encounter.rounds.reduce((sum, r) => sum + (r.playerDamage || 0), 0);
      const totalDamageTaken = encounter.rounds.reduce((sum, r) => sum + (r.npcDamage || 0), 0);
      const roundsPlayed = encounter.rounds.length;

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

      if (roundsPlayed <= 3) {
        await CombatContractTrackerService.checkQuickVictory(characterObjId, roundsPlayed);
      }

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
    currentRound: ICurrentRound,
    services: { CombatContractTrackerService: any }
  ): Promise<CombatActionResult> {
    const { DeathService } = await import('../death.service');
    const { JailService } = await import('../jail.service');
    const { CombatContractTrackerService } = services;

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
      // Start a session for death penalty
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        deathPenalty = await CombatRewardService.applyDeathPenalty(character, session);
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        logger.error('Failed to apply death penalty:', err);
      } finally {
        session.endSession();
      }
    }

    // Reset combat streak on defeat
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

  // ============================================================================
  // HELPERS
  // ============================================================================

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
}

export default CombatTurnService;
