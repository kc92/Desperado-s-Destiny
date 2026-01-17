/**
 * Action-Deck Integration Service
 * Orchestrates the connection between actions and deck games
 */

import mongoose from 'mongoose';
import { Action, ActionType } from '../models/Action.model';
import { ActionResult, SuitBonuses, RewardsGained } from '../models/ActionResult.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { ActionDeckSession } from '../models/ActionDeckSession.model';
import {
  initGame,
  processAction,
  resolveGame,
  getGameTypeForAction,
  GameState,
  GameResult,
  PlayerAction,
  Suit,
  calculateEffectivenessV2,
  calculateHybridRewards,
  getEffectivenessSpecialEffect
} from './deckGames';
import { EffectivenessResult, EFFECTIVENESS_CAPS } from '@desperados/shared';
import { EnergyService } from './energy.service';
import logger from '../utils/logger';

// Interface for backward compatibility
interface PendingAction {
  actionId: string;
  characterId: string;
  action: any;
  character: any;
  startedAt: Date;
}

// Suit mapping based on action type
const ACTION_TYPE_SUITS: Record<string, Suit> = {
  [ActionType.CRIME]: 'spades',
  [ActionType.COMBAT]: 'clubs',
  [ActionType.SOCIAL]: 'hearts',
  [ActionType.CRAFT]: 'diamonds'
};

/**
 * Calculate job rewards based on game performance
 *
 * NEW EFFECTIVENESS SYSTEM V2:
 * - Uses hand rank as base damage/effectiveness (50-500)
 * - Suit matches add +10% per matching card (up to +50%)
 * - Skills provide percentage boost (up to +50%)
 * - Formula: effectiveness = baseHandValue * suitMultiplier * skillMultiplier
 * - Gold scales with effectiveness, XP scales with suit matches (hybrid)
 */
function calculateJobRewardsV2(
  gameResult: GameResult,
  jobData: {
    rewards: { goldMin: number; goldMax: number; xp: number };
    name: string;
  },
  characterSuitBonus: number = 0
): { gold: number; xp: number; effectiveness: number; effectivenessBreakdown: any } {
  const { goldMin, goldMax, xp: baseXP } = jobData.rewards;
  const goldRange = goldMax - goldMin;

  // Calculate effectiveness using the new V2 system
  // We use gameResult data: handName, suitMatches, and characterSuitBonus
  const handName = gameResult.handName || 'High Card';
  const suitMatches = gameResult.suitMatches || 0;

  // Map hand name to base value (from HAND_BASE_VALUES)
  const handBaseValues: Record<string, number> = {
    'Royal Flush': 500,
    'Straight Flush': 300,
    'Four of a Kind': 250,
    'Full House': 200,
    'Flush': 175,
    'Straight': 150,
    'Three of a Kind': 125,
    'Two Pair': 100,
    'One Pair': 75,
    'Pair': 75,
    'High Card': 50
  };
  const baseValue = handBaseValues[handName] || 50;

  // Calculate suit multiplier (+10% per matching card)
  const suitMultiplier = 1.0 + Math.min(suitMatches, 5) * 0.10;

  // Calculate skill boost (average of matching suit skills, capped at 50%)
  const avgSkillLevel = characterSuitBonus / 5; // Assume 5 skills per category
  const skillBoostPercent = Math.min(avgSkillLevel, 50);
  const skillMultiplier = 1 + (skillBoostPercent / 100);

  // Calculate final effectiveness
  const effectiveness = Math.round(baseValue * suitMultiplier * skillMultiplier);

  // Build effectiveness breakdown for UI
  const effectivenessBreakdown = {
    handName,
    baseValue,
    suitMatches,
    suitMultiplier,
    skillBoostPercent,
    skillMultiplier
  };

  // Calculate gold based on effectiveness
  // Baseline: 200 effectiveness = 100% of gold range (goldMax)
  // Lower effectiveness = less gold, higher = more gold (up to 2x)
  const effectivenessRatio = effectiveness / EFFECTIVENESS_CAPS.REWARD_BASELINE;
  const goldMultiplier = Math.min(effectivenessRatio, EFFECTIVENESS_CAPS.JOB_GOLD_MULTIPLIER);
  const finalGold = Math.floor(goldMin + (goldRange * goldMultiplier));

  // Calculate XP using hybrid system (suit matches affect XP)
  // +10% XP per suit match
  const xpMultiplier = 1 + (suitMatches * 0.10);
  const finalXP = Math.floor(baseXP * Math.min(xpMultiplier, 1.5));

  logger.info(`[calculateJobRewardsV2] Job: ${jobData.name}`);
  logger.info(`[calculateJobRewardsV2] Hand: ${handName} (base ${baseValue}), Suits: ${suitMatches} (${suitMultiplier.toFixed(2)}x), Skill: ${skillBoostPercent.toFixed(0)}% (${skillMultiplier.toFixed(2)}x)`);
  logger.info(`[calculateJobRewardsV2] Effectiveness: ${effectiveness}, Gold: ${goldMin}-${goldMax} → ${finalGold}, XP: ${baseXP} → ${finalXP}`);

  return { gold: finalGold, xp: finalXP, effectiveness, effectivenessBreakdown };
}

/**
 * Legacy job rewards calculation (for backward compatibility)
 * @deprecated Use calculateJobRewardsV2 for new effectiveness system
 */
function calculateJobRewards(
  gameResult: GameResult,
  jobData: {
    rewards: { goldMin: number; goldMax: number; xp: number };
    name: string;
  }
): { gold: number; xp: number } {
  // Use V2 with default skill bonus of 0
  const result = calculateJobRewardsV2(gameResult, jobData, 0);
  return { gold: result.gold, xp: result.xp };
}

/**
 * Start an action with a deck game
 */
export async function startActionWithDeck(
  characterId: string,
  actionId: string
): Promise<{
  gameState: GameState;
  actionInfo: {
    name: string;
    type: string;
    difficulty: number;
    energyCost: number;
    rewards: any;
  };
}> {
  logger.info(`[startActionWithDeck] Starting action ${actionId} for character ${characterId}`);

  // Find and validate action
  const action = await Action.findById(actionId);
  if (!action || !action.isActive) {
    logger.error(`[startActionWithDeck] Action not found: ${actionId}`);
    throw new Error('Action not found');
  }

  // Find and validate character
  const character = await Character.findById(characterId);
  if (!character) {
    logger.error(`[startActionWithDeck] Character not found: ${characterId}`);
    throw new Error('Character not found');
  }

  // Regenerate energy
  character.regenerateEnergy();

  // Check energy
  if (!character.canAffordAction(action.energyCost)) {
    logger.error(`[startActionWithDeck] Insufficient energy: ${Math.floor(character.energy)}/${action.energyCost}`);
    throw new Error(`Insufficient energy. Required: ${action.energyCost}, Current: ${Math.floor(character.energy)}`);
  }

  // Check criminal skill requirements for crime actions
  if (action.type === ActionType.CRIME) {
    const { CrimeService } = await import('./crime.service');
    const canAttempt = CrimeService.canAttemptCrime(action, character);
    if (!canAttempt.canAttempt) {
      logger.error(`[startActionWithDeck] Criminal skill too low: ${canAttempt.reason}`);
      throw new Error(canAttempt.reason || 'Criminal skill level too low for this crime');
    }
  }

  logger.info(`[startActionWithDeck] Initializing game for action type: ${action.type}`);

  // Determine game type based on action type
  const gameType = getGameTypeForAction(action.type);

  // Determine relevant suit
  const relevantSuit = ACTION_TYPE_SUITS[action.type] || 'spades';

  // Get character's skill bonus for this suit
  // THIS IS THE KEY TO MAKING STATS MATTER!
  // Higher skill = better success rates in deck games
  const characterSuitBonus = character.getSkillBonusForSuit(relevantSuit);
  logger.info(`[startActionWithDeck] Character skill bonus for ${relevantSuit}: ${characterSuitBonus}`);

  // Initialize deck game with character skills
  const gameState = initGame({
    gameType,
    playerId: characterId,
    difficulty: action.difficulty,
    relevantSuit,
    timeLimit: 60, // 60 seconds for actions
    characterSuitBonus // NEW: Pass character skill level to affect success rates
  });

  // Store session in database
  // NOTE: We only store IDs, not full objects - reduces storage by ~81% (600KB → 100KB)
  await ActionDeckSession.create({
    sessionId: gameState.gameId,
    characterId,
    actionId: action._id.toString(),
    gameState,
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  });

  logger.info(`[startActionWithDeck] Created session ${gameState.gameId}`);

  return {
    gameState,
    actionInfo: {
      name: action.name,
      type: action.type,
      difficulty: action.difficulty,
      energyCost: action.energyCost,
      rewards: action.rewards
    }
  };
}

/**
 * Process a player action in the deck game
 */
export async function processGameAction(
  gameId: string,
  action: PlayerAction
): Promise<GameState> {
  const session = await ActionDeckSession.findOne({ sessionId: gameId });
  if (!session) {
    throw new Error('Game not found or expired');
  }

  const newState = processAction(session.gameState, action);

  // Update game state in database
  session.gameState = newState;
  await session.save();

  return newState;
}

/**
 * Resolve the deck game and apply action results
 */
export async function resolveActionGame(
  gameId: string
): Promise<{
  gameResult: GameResult;
  actionResult: {
    actionName: string;
    actionType: string;
    success: boolean;
    rewardsGained: RewardsGained;
    energyRemaining: number;
    crimeResolution?: any;
  };
}> {
  const deckSession = await ActionDeckSession.findOne({ sessionId: gameId });
  if (!deckSession) {
    throw new Error('Game session not found or expired');
  }

  const gameState = deckSession.gameState;

  // Check if this is a job session (job data is stored directly in session.action)
  const isJobSession = deckSession.action?.isJob === true;

  // For jobs, action data is already stored in session
  // For regular actions, fetch from Action collection
  let action: any;
  let character: any;

  if (isJobSession) {
    // Job session - use stored action data, only fetch character
    action = deckSession.action;
    character = await Character.findById(deckSession.characterId);
    if (!character) {
      throw new Error('Character not found');
    }
    logger.info(`[resolveActionGame] Using stored job data for: ${action.name}`);
  } else {
    // Regular action - fetch both from database
    const [actionDoc, charDoc] = await Promise.all([
      Action.findById(deckSession.actionId),
      Character.findById(deckSession.characterId)
    ]);

    if (!actionDoc) {
      throw new Error('Action not found');
    }
    if (!charDoc) {
      throw new Error('Character not found');
    }

    action = actionDoc.toObject();
    character = charDoc;
  }

  // Build pending action info for compatibility
  const pendingAction: PendingAction = {
    actionId: deckSession.actionId,
    characterId: deckSession.characterId.toString(),
    action,
    character: character.toObject(),
    startedAt: deckSession.startedAt
  };

  // Resolve the deck game
  const gameResult = resolveGame(gameState);
  const success = gameResult.success;
  const isJob = action.isJob === true;

  // Use rewards from game engine if available, otherwise calculate
  // Cap multiplier at 1.2x to prevent XP inflation
  const rawMultiplier = gameResult.suitBonus.multiplier || 1;
  const multiplier = Math.min(1.2, rawMultiplier);

  let rewardsGained: RewardsGained;
  let crimeResolution = null;

  // JOB HANDLING - Uses NEW effectiveness system V2
  if (isJob) {
    logger.info(`[resolveActionGame] Processing JOB: ${action.name}`);

    // Get the relevant suit for this job (jobs are typically 'labor' which uses clubs/Combat)
    const relevantSuit = gameState.relevantSuit || ACTION_TYPE_SUITS[action.type] || 'clubs';

    // Get character's skill bonus for this suit - THIS MAKES SKILLS MATTER!
    const characterSuitBonus = character.getSkillBonusForSuit(relevantSuit);
    logger.info(`[resolveActionGame] Character ${relevantSuit} skill bonus: ${characterSuitBonus}`);

    // Calculate job rewards using NEW effectiveness system
    const jobRewards = calculateJobRewardsV2(gameResult, action, characterSuitBonus);

    // Enhance gameResult with effectiveness data for UI
    (gameResult as any).effectiveness = jobRewards.effectiveness;
    (gameResult as any).effectivenessBreakdown = jobRewards.effectivenessBreakdown;

    rewardsGained = {
      xp: jobRewards.xp,
      gold: jobRewards.gold,
      items: action.rewards?.items || []
    };

    // Award XP
    await character.addExperience(rewardsGained.xp);

    // Award gold
    if (rewardsGained.gold > 0) {
      const { GoldService } = await import('./gold.service');
      await GoldService.addGold(
        character._id as any,
        rewardsGained.gold,
        TransactionSource.JOB_INCOME,
        {
          jobId: action.id,
          jobName: action.name,
          locationId: action.locationId,
          description: `Earned ${rewardsGained.gold} gold from ${action.name} (Score: ${gameResult.score})`,
        },
      );
    }

    // Set job cooldown
    const cooldowns = (character.jobCooldowns as Map<string, Date>) || new Map();
    cooldowns.set(action.id, new Date());
    character.jobCooldowns = cooldowns;
  } else {
    // ACTION HANDLING - Original logic for actions

    // Handle crime resolution BEFORE awarding rewards
    if (action.type === ActionType.CRIME) {
      const { CrimeService } = await import('./crime.service');
      crimeResolution = await CrimeService.resolveCrimeAttempt(action, character, success);
    }

    if (success) {
      // Use game engine rewards if available, or calculate from action's defined rewards
      // IMPORTANT: Use action.rewards.xp as base, not difficulty-based formula (prevents XP inflation)
      const baseGold = action.rewards?.gold || (30 + (action.difficulty * 15));
      const baseXP = action.rewards?.xp || 20;

      let goldReward = gameResult.rewards?.gold ?? Math.round(baseGold * multiplier);
      const xpReward = gameResult.rewards?.experience ?? Math.round(baseXP * multiplier);

      // Reduce gold if witnessed (you dropped some escaping)
      if (crimeResolution?.wasWitnessed) {
        goldReward = Math.round(goldReward * 0.5);
      }

      rewardsGained = {
        xp: xpReward,
        gold: goldReward,
        items: action.rewards.items || []
      };

      // Award XP (full even if witnessed - you learned from it)
      await character.addExperience(rewardsGained.xp);

      // Award criminal skill XP for crime actions
      if (action.type === ActionType.CRIME) {
        const { CrimeService } = await import('./crime.service');
        const skillXpResult = await CrimeService.awardCriminalSkillXP(
          character,
          action,
          rewardsGained.xp
        );
        if (skillXpResult) {
          logger.info(`[resolveActionGame] Awarded ${skillXpResult.xpGained} ${skillXpResult.skillId} XP`);
          // Include in response for frontend notification
          (rewardsGained as any).criminalSkillXp = skillXpResult;
        }
      }

      // Award gold
      if (rewardsGained.gold > 0) {
        const source = action.type === ActionType.CRIME
          ? TransactionSource.CRIME_SUCCESS
          : TransactionSource.QUEST_REWARD;

        const { GoldService } = await import('./gold.service');
        await GoldService.addGold(
          character._id as any,
          rewardsGained.gold,
          source,
          {
            actionId: action._id,
            actionName: action.name,
            actionType: action.type,
            description: `Earned ${rewardsGained.gold} gold from ${action.name} (${multiplier.toFixed(1)}x bonus)${crimeResolution?.wasWitnessed ? ' - reduced due to witness' : ''}`,
          }
        );
      }
    } else {
      // Failure - use game engine mitigation rewards if available
      const mitigationXP = gameResult.rewards?.experience ?? Math.round(5 * (1 + (gameResult.mitigation?.damageReduction || 0)));
      rewardsGained = {
        xp: mitigationXP,
        gold: 0,
        items: []
      };

      await character.addExperience(rewardsGained.xp);
    }
  }

  // Deduct energy
  const energyBefore = character.energy;
  const energyType = isJob ? `job_${action.jobCategory || 'labor'}` : `action_${action.type?.toLowerCase() || 'unknown'}`;
  await EnergyService.spendEnergy(character._id.toString(), action.energyCost, energyType);
  logger.info(`[Energy Debug] Before: ${energyBefore}, Cost: ${action.energyCost}`);
  character.lastActive = new Date();
  await character.save();

  // Create action result record (only for actions, not jobs)
  if (!isJob) {
    // Determine gameMode based on gameType for proper validation
    // Both pressYourLuck and blackjack have variable card counts (1-10 cards)
    const gameMode = (gameState.gameType === 'pressYourLuck' || gameState.gameType === 'blackjack')
      ? 'press_your_luck'
      : 'poker';

    const actionResultDoc = new ActionResult({
      characterId: character._id,
      actionId: action._id,
      gameMode,
      cardsDrawn: gameState.hand,
      handRank: gameResult.handName || 'custom',
      handScore: gameResult.score,
      handDescription: `${gameResult.handName || 'Game'} with ${gameResult.suitMatches} suit matches`,
      suitBonuses: {
        spades: 0,
        hearts: 0,
        clubs: 0,
        diamonds: 0,
        [gameState.relevantSuit || 'spades']: gameResult.suitMatches * 10
      },
      totalScore: gameResult.score,
      success,
      rewardsGained,
      timestamp: new Date()
    });

    await actionResultDoc.save();
  }

  // Clean up session from database
  await ActionDeckSession.deleteOne({ sessionId: gameId });

  logger.info(
    `${isJob ? 'Job' : 'Action'} resolved: ${action.name} by character ${character.name} - Score: ${gameResult.score} (${gameResult.suitBonus.multiplier.toFixed(1)}x)`
  );

  return {
    gameResult,
    actionResult: {
      actionName: action.name,
      actionType: isJob ? 'job' : action.type,
      success: isJob ? true : success, // Jobs always "succeed" - rewards just vary
      rewardsGained,
      energyRemaining: Math.floor(character.energy),
      crimeResolution
    }
  };
}

/**
 * Get game state
 */
export async function getGameState(gameId: string): Promise<GameState | null> {
  const session = await ActionDeckSession.findOne({ sessionId: gameId });
  return session ? session.gameState : null;
}

/**
 * Get pending action info
 */
export async function getPendingAction(gameId: string): Promise<PendingAction | null> {
  const session = await ActionDeckSession.findOne({ sessionId: gameId });
  if (!session) {
    return null;
  }

  // Fetch action and character on-demand (not stored in session to save ~500KB)
  const [action, character] = await Promise.all([
    Action.findById(session.actionId),
    Character.findById(session.characterId)
  ]);

  if (!action || !character) {
    return null;
  }

  return {
    actionId: session.actionId,
    characterId: session.characterId.toString(),
    action: action.toObject(),
    character: character.toObject(),
    startedAt: session.startedAt
  };
}

/**
 * Cancel/forfeit a pending action
 */
export async function cancelAction(gameId: string): Promise<void> {
  await ActionDeckSession.deleteOne({ sessionId: gameId });
  logger.info(`[cancelAction] Cancelled session ${gameId}`);
}

/**
 * Check if game is resolved
 */
export async function isGameResolved(gameId: string): Promise<boolean> {
  const session = await ActionDeckSession.findOne({ sessionId: gameId });
  return session?.gameState?.status === 'resolved';
}

export default {
  startActionWithDeck,
  processGameAction,
  resolveActionGame,
  getGameState,
  getPendingAction,
  cancelAction,
  isGameResolved
};
