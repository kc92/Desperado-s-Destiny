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
  Suit
} from './deckGames';
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
 * Uses score-based scaling: poor play = goldMin, great play = goldMax with 1.5x bonus
 */
function calculateJobRewards(
  gameResult: GameResult,
  jobData: {
    rewards: { goldMin: number; goldMax: number; xp: number };
    name: string;
  }
): { gold: number; xp: number } {
  const { goldMin, goldMax, xp: baseXP } = jobData.rewards;
  const goldRange = goldMax - goldMin;

  // Normalize score to 0-100 range
  const normalizedScore = Math.min(100, Math.max(0, gameResult.score));

  // Score-based multiplier:
  // - Score < 30: multiplier = 0 (goldMin)
  // - Score 30-70: multiplier = 0→1 (linear from goldMin to goldMax)
  // - Score > 70: multiplier = 1→1.5 (bonus range)
  let goldMultiplier: number;
  if (normalizedScore < 30) {
    goldMultiplier = 0;
  } else if (normalizedScore < 70) {
    goldMultiplier = (normalizedScore - 30) / 40; // 0 to 1
  } else {
    goldMultiplier = 1.0 + ((normalizedScore - 70) / 30) * 0.5; // 1 to 1.5
  }

  // Apply suit bonus multiplier on top
  const suitMultiplier = gameResult.suitBonus?.multiplier || 1.0;

  // Calculate final gold
  const baseGold = goldMin + Math.floor(goldRange * goldMultiplier);
  const finalGold = Math.floor(baseGold * suitMultiplier);

  // XP also scales with performance (50% to 150%)
  const xpMultiplier = 0.5 + (normalizedScore / 100);
  const finalXP = Math.floor(baseXP * xpMultiplier * suitMultiplier);

  logger.info(`[calculateJobRewards] Job: ${jobData.name}`);
  logger.info(`[calculateJobRewards] Score: ${normalizedScore}, GoldMult: ${goldMultiplier.toFixed(2)}, SuitMult: ${suitMultiplier.toFixed(2)}`);
  logger.info(`[calculateJobRewards] Gold: ${goldMin}-${goldMax} → ${finalGold}, XP: ${baseXP} → ${finalXP}`);

  return { gold: finalGold, xp: finalXP };
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
  await ActionDeckSession.create({
    sessionId: gameState.gameId,
    characterId,
    actionId: action._id.toString(),
    action: action.toObject(),
    character: character.toObject(),
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
  const pendingAction: PendingAction = {
    actionId: deckSession.actionId,
    characterId: deckSession.characterId.toString(),
    action: deckSession.action,
    character: deckSession.character,
    startedAt: deckSession.startedAt
  };

  // Resolve the deck game
  const gameResult = resolveGame(gameState);

  // Load character for updates
  const character = await Character.findById(pendingAction.characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  const action = pendingAction.action;
  const success = gameResult.success;
  const isJob = action.isJob === true;

  // Use rewards from game engine if available, otherwise calculate
  const multiplier = gameResult.suitBonus.multiplier || 1;

  let rewardsGained: RewardsGained;
  let crimeResolution = null;

  // JOB HANDLING - Uses score-based reward scaling
  if (isJob) {
    logger.info(`[resolveActionGame] Processing JOB: ${action.name}`);

    // Calculate job rewards based on game performance
    const jobRewards = calculateJobRewards(gameResult, action);

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
      // Use game engine rewards if available
      let goldReward = gameResult.rewards?.gold ?? Math.round((30 + (action.difficulty * 15)) * multiplier);
      const xpReward = gameResult.rewards?.experience ?? Math.round((20 + (action.difficulty * 8)) * multiplier);

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
    const actionResultDoc = new ActionResult({
      characterId: character._id,
      actionId: action._id,
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

  return {
    actionId: session.actionId,
    characterId: session.characterId.toString(),
    action: session.action,
    character: session.character,
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
