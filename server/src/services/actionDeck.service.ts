/**
 * Action-Deck Integration Service
 * Orchestrates the connection between actions and deck games
 */

import mongoose from 'mongoose';
import { Action, ActionType } from '../models/Action.model';
import { ActionResult, SuitBonuses, RewardsGained } from '../models/ActionResult.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
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
import logger from '../utils/logger';

// Store pending actions (in production, use Redis)
interface PendingAction {
  actionId: string;
  characterId: string;
  action: any;
  character: any;
  startedAt: Date;
}

const pendingActions = new Map<string, PendingAction>();
const activeGames = new Map<string, GameState>();

// Cleanup stale games older than 5 minutes
const STALE_GAME_TIMEOUT_MS = 300000; // 5 minutes

function cleanupStaleGames(): void {
  const now = Date.now();
  for (const [gameId, state] of activeGames) {
    if (now - state.startedAt.getTime() > STALE_GAME_TIMEOUT_MS) {
      activeGames.delete(gameId);
      pendingActions.delete(gameId);
      logger.info(`[cleanupStaleGames] Removed stale game: ${gameId}`);
    }
  }
}

// Suit mapping based on action type
const ACTION_TYPE_SUITS: Record<string, Suit> = {
  [ActionType.CRIME]: 'spades',
  [ActionType.COMBAT]: 'clubs',
  [ActionType.SOCIAL]: 'hearts',
  [ActionType.CRAFT]: 'diamonds'
};

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

  // Store pending action
  pendingActions.set(gameState.gameId, {
    actionId: action._id.toString(),
    characterId,
    action: action.toObject(),
    character: character.toObject(),
    startedAt: new Date()
  });

  // Store game state
  activeGames.set(gameState.gameId, gameState);

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
export function processGameAction(
  gameId: string,
  action: PlayerAction
): GameState {
  const gameState = activeGames.get(gameId);
  if (!gameState) {
    throw new Error('Game not found or expired');
  }

  const newState = processAction(gameState, action);
  activeGames.set(gameId, newState);

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
  const gameState = activeGames.get(gameId);
  if (!gameState) {
    throw new Error('Game not found');
  }

  const pendingAction = pendingActions.get(gameId);
  if (!pendingAction) {
    throw new Error('Pending action not found');
  }

  // Resolve the deck game
  const gameResult = resolveGame(gameState);

  // Use mongoose transaction for data consistency
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Reload character with session
    const character = await Character.findById(pendingAction.characterId).session(session);
    if (!character) {
      throw new Error('Character not found');
    }

    const action = pendingAction.action;
    const success = gameResult.success;

    // Use rewards from game engine if available, otherwise calculate
    const multiplier = gameResult.suitBonus.multiplier || 1;

    // Handle crime resolution BEFORE awarding rewards
    let crimeResolution = null;
    if (action.type === ActionType.CRIME) {
      const { CrimeService } = await import('./crime.service');
      crimeResolution = await CrimeService.resolveCrimeAttempt(action, character, success);
    }

    let rewardsGained: RewardsGained;
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
          },
          session
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

    // Deduct energy
    const energyBefore = character.energy;
    character.spendEnergy(action.energyCost);
    logger.info(`[Energy Debug] Before: ${energyBefore}, Cost: ${action.energyCost}, After: ${character.energy}`);
    character.lastActive = new Date();
    await character.save({ session });

    // Create action result record
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

    await actionResultDoc.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Clean up after successful commit
    activeGames.delete(gameId);
    pendingActions.delete(gameId);

    logger.info(
      `Action resolved: ${action.name} by character ${character.name} - ${success ? 'SUCCESS' : 'FAILURE'} (${gameResult.suitBonus.multiplier.toFixed(1)}x)`
    );

    return {
      gameResult,
      actionResult: {
        actionName: action.name,
        actionType: action.type,
        success,
        rewardsGained,
        energyRemaining: Math.floor(character.energy),
        crimeResolution
      }
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get game state
 */
export function getGameState(gameId: string): GameState | undefined {
  // Cleanup stale games on each access
  cleanupStaleGames();
  return activeGames.get(gameId);
}

/**
 * Get pending action info
 */
export function getPendingAction(gameId: string): PendingAction | undefined {
  return pendingActions.get(gameId);
}

/**
 * Cancel/forfeit a pending action
 */
export function cancelAction(gameId: string): void {
  activeGames.delete(gameId);
  pendingActions.delete(gameId);
}

/**
 * Check if game is resolved
 */
export function isGameResolved(gameId: string): boolean {
  const state = activeGames.get(gameId);
  return state?.status === 'resolved';
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
