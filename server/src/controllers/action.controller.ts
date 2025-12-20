/**
 * Action Controller
 *
 * Handles all action-related HTTP requests for the Destiny Deck challenge system
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Action, ActionType } from '../models/Action.model';
import { ActionResult, SuitBonuses, RewardsGained } from '../models/ActionResult.model';
import { Character } from '../models/Character.model';
import { Location } from '../models/Location.model';
import {
  shuffleDeck,
  drawCards,
  evaluateHand,
  Suit,
  Card,
  COMBAT_CONSTANTS,
  SkillCategory
} from '@desperados/shared';
import { UnlockEnforcementService } from '../services/unlockEnforcement.service';
import logger from '../utils/logger';
import mongoose from 'mongoose';
import { CrimeService } from '../services/crime.service';
import { DollarService } from '../services/dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';

/**
 * Calculate skill bonuses from character stats to suit scores
 * Maps character stats to poker suit bonuses
 */
function calculateSuitBonuses(character: any): SuitBonuses {
  const stats = character.stats;

  return {
    spades: stats.cunning * 2,    // Cunning affects Spades (crime/deception)
    hearts: stats.spirit * 2,      // Spirit affects Hearts (social/willpower)
    clubs: stats.combat * 2,       // Combat affects Clubs (fighting)
    diamonds: stats.craft * 2      // Craft affects Diamonds (creation)
  };
}

/**
 * Calculate total score including hand evaluation and suit bonuses
 */
function calculateTotalScore(
  handScore: number,
  cardsDrawn: Card[],
  suitBonuses: SuitBonuses
): number {
  // Count cards of each suit
  const suitCounts = {
    [Suit.SPADES]: 0,
    [Suit.HEARTS]: 0,
    [Suit.CLUBS]: 0,
    [Suit.DIAMONDS]: 0
  };

  for (const card of cardsDrawn) {
    suitCounts[card.suit]++;
  }

  // Apply bonuses based on how many cards of each suit were drawn
  const bonusScore =
    (suitCounts[Suit.SPADES] * suitBonuses.spades) +
    (suitCounts[Suit.HEARTS] * suitBonuses.hearts) +
    (suitCounts[Suit.CLUBS] * suitBonuses.clubs) +
    (suitCounts[Suit.DIAMONDS] * suitBonuses.diamonds);

  return handScore + bonusScore;
}

/**
 * Calculate regenerated energy based on time elapsed
 * This mirrors the Character model's regenerateEnergy method but returns the calculated value
 */
function calculateRegeneratedEnergy(
  currentEnergy: number,
  lastEnergyUpdate: Date,
  maxEnergy: number,
  regenRate: number
): number {
  const now = new Date();
  const timeSinceLastUpdate = now.getTime() - lastEnergyUpdate.getTime();
  const minutesElapsed = timeSinceLastUpdate / (1000 * 60);
  const energyToAdd = minutesElapsed * regenRate;
  return Math.min(currentEnergy + energyToAdd, maxEnergy);
}

/**
 * POST /api/actions/challenge
 * Perform a Destiny Deck challenge action
 * Uses atomic energy deduction to prevent race conditions
 */
export async function performChallenge(req: AuthRequest, res: Response): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?._id;

    if (!userId) {
      await session.abortTransaction();
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { actionId, characterId } = req.body;

    // Validate input
    if (!actionId || !characterId) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'Missing required fields: actionId and characterId'
      });
      return;
    }

    // Find and validate action
    const action = await Action.findById(actionId);
    if (!action || !action.isActive) {
      await session.abortTransaction();
      res.status(404).json({
        success: false,
        error: 'Action not found'
      });
      return;
    }

    // First, get character info for validation and ownership check
    const characterCheck = await Character.findById(characterId)
      .select('userId name energy lastEnergyUpdate maxEnergy stats level experience')
      .session(session);

    if (!characterCheck) {
      await session.abortTransaction();
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    // Verify character ownership
    if (characterCheck.userId.toString() !== userId) {
      await session.abortTransaction();
      res.status(403).json({
        success: false,
        error: 'You do not own this character'
      });
      return;
    }

    // Calculate regenerated energy
    const regenRate = 1; // Base regen rate: 1 energy per minute
    const regeneratedEnergy = calculateRegeneratedEnergy(
      characterCheck.energy,
      characterCheck.lastEnergyUpdate || new Date(),
      characterCheck.maxEnergy,
      regenRate
    );

    // Quick check if we have enough energy (this is a soft check, atomic update does the real check)
    if (Math.floor(regeneratedEnergy) < action.energyCost) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'Insufficient energy',
        details: {
          required: action.energyCost,
          current: Math.floor(regeneratedEnergy),
          maxEnergy: characterCheck.maxEnergy
        }
      });
      return;
    }

    // ATOMIC OPERATION: Deduct energy BEFORE doing game logic
    // This prevents race conditions where two actions could both pass the energy check
    // We calculate the new energy value (regenerated - cost) and set it atomically
    const newEnergy = Math.max(0, regeneratedEnergy - action.energyCost);
    const now = new Date();

    // Atomic update: Set energy to the calculated value, but only if it results in non-negative energy
    // We also update lastEnergyUpdate to now so future calculations are correct
    const energyUpdateResult = await Character.findOneAndUpdate(
      {
        _id: characterId,
        userId: userId  // Extra safety: verify ownership in the query
      },
      {
        $set: {
          energy: newEnergy,
          lastEnergyUpdate: now,
          lastActive: now
        }
      },
      {
        new: true,
        session
      }
    );

    if (!energyUpdateResult) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'Failed to deduct energy. Please try again.'
      });
      return;
    }

    // Energy has been atomically deducted - now proceed with game logic
    const character = energyUpdateResult;

    // Draw 5 cards from shuffled deck
    const deck = shuffleDeck();
    const { drawn: cardsDrawn } = drawCards(deck, 5);

    // Evaluate the poker hand
    const handEvaluation = evaluateHand(cardsDrawn);

    // Calculate suit bonuses based on character stats
    const suitBonuses = calculateSuitBonuses(character);

    // Calculate total score with bonuses
    const totalScore = calculateTotalScore(
      handEvaluation.score,
      cardsDrawn,
      suitBonuses
    );

    // Determine success based on difficulty
    // Success if total score exceeds difficulty threshold
    // Difficulty is scaled from 1-10, we normalize using COMBAT_CONSTANTS.DIFFICULTY_MULTIPLIER
    // CRITICAL FIX: Was * 100000, should be * 100 (using constant for maintainability)
    const difficultyThreshold = action.difficulty * COMBAT_CONSTANTS.DIFFICULTY_MULTIPLIER;
    const success = totalScore >= difficultyThreshold;

    // Determine rewards
    let rewardsGained: RewardsGained;
    if (success) {
      rewardsGained = {
        xp: action.rewards.xp,
        gold: action.rewards.gold,
        items: action.rewards.items || []
      };

      // Award XP using atomic operation
      if (rewardsGained.xp > 0) {
        await Character.findByIdAndUpdate(
          characterId,
          { $inc: { experience: rewardsGained.xp } },
          { session }
        );
      }

      // Award dollars using DollarService (transaction-safe)
      if (rewardsGained.gold > 0) {
        const source = action.type === ActionType.CRIME
          ? TransactionSource.CRIME_SUCCESS
          : TransactionSource.QUEST_REWARD;

        await DollarService.addDollars(
          character._id as any,
          rewardsGained.gold,
          source,
          {
            actionId: action._id,
            actionName: action.name,
            actionType: action.type,
            description: `Earned ${rewardsGained.gold} dollars from successful ${action.name}`,
            currencyType: CurrencyType.DOLLAR,
          },
          session
        );
      }

      // TODO: Add items to inventory when item system is implemented
    } else {
      // No rewards on failure
      rewardsGained = {
        xp: 0,
        gold: 0,
        items: []
      };
    }

    // Create action result record
    const actionResult = new ActionResult({
      characterId: character._id,
      actionId: action._id,
      cardsDrawn,
      handRank: handEvaluation.rank,
      handScore: handEvaluation.score,
      handDescription: handEvaluation.description,
      suitBonuses,
      totalScore,
      success,
      rewardsGained,
      timestamp: new Date()
    });

    await actionResult.save({ session });

    // Commit transaction
    await session.commitTransaction();

    logger.info(
      `Action performed: ${action.name} by character ${character.name} (${character._id}) - ${success ? 'SUCCESS' : 'FAILURE'}`
    );

    // If this is a crime action, resolve crime consequences
    let crimeResolution = null;
    if (action.type === ActionType.CRIME) {
      // Reload character to get fresh data after transaction commit
      const freshCharacter = await Character.findById(character._id);
      if (freshCharacter) {
        crimeResolution = await CrimeService.resolveCrimeAttempt(action, freshCharacter, success);
      }
    }

    // Return result
    res.status(200).json({
      success: true,
      data: {
        result: {
          actionName: action.name,
          actionType: action.type,
          cardsDrawn,
          handRank: handEvaluation.rank,
          handDescription: handEvaluation.description,
          handScore: handEvaluation.score,
          suitBonuses,
          totalScore,
          difficultyThreshold,
          challengeSuccess: success,
          rewardsGained,
          energyRemaining: Math.floor(character.energy),
          characterLevel: character.level,
          characterXP: character.experience,
          crimeResolution
        }
      }
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error performing action challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform action'
    });
  } finally {
    session.endSession();
  }
}

/**
 * GET /api/actions
 * Get all active actions, grouped by type
 * Optional query param: locationId - filter crimes to those available at the location
 */
export async function getActions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { locationId } = req.query;
    const actions = await Action.findActiveActions();

    let crimes = actions.filter(a => a.type === ActionType.CRIME);

    // Filter crimes by location if locationId provided
    if (locationId && typeof locationId === 'string') {
      // locationId can be either an ObjectId or a string slug like "red-gulch"
      let location;
      if (mongoose.Types.ObjectId.isValid(locationId)) {
        location = await Location.findById(locationId);
      } else {
        location = await Location.findOne({ id: locationId });
      }
      if (location && location.availableCrimes && location.availableCrimes.length > 0) {
        crimes = crimes.filter(crime =>
          location.availableCrimes.includes(crime.name)
        );
      }
    }

    // Filter crimes by CUNNING skill level if character is available
    if (req.user?.activeCharacterId) {
      try {
        const character = await Character.findById(req.user.activeCharacterId);
        if (character) {
          // Filter crimes using the UnlockEnforcementService
          crimes = UnlockEnforcementService.filterAvailableCrimes(character, crimes);
        }
      } catch (err) {
        // If we can't get character skills, show all crimes (graceful degradation)
        logger.debug('Could not filter crimes by skill level:', err);
      }
    }

    // Group by type
    const groupedActions = {
      [ActionType.CRIME]: crimes.map(a => a.toSafeObject()),
      [ActionType.COMBAT]: actions.filter(a => a.type === ActionType.COMBAT).map(a => a.toSafeObject()),
      [ActionType.CRAFT]: actions.filter(a => a.type === ActionType.CRAFT).map(a => a.toSafeObject()),
      [ActionType.SOCIAL]: actions.filter(a => a.type === ActionType.SOCIAL).map(a => a.toSafeObject())
    };

    res.status(200).json({
      success: true,
      data: {
        actions: groupedActions,
        total: actions.length,
        locationFiltered: !!locationId
      }
    });
  } catch (error) {
    logger.error('Error fetching actions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch actions'
    });
  }
}

/**
 * GET /api/actions/:id
 * Get a single action by ID
 */
export async function getAction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id;

    const action = await Action.findById(id);

    if (!action || !action.isActive) {
      res.status(404).json({
        success: false,
        error: 'Action not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        action: action.toSafeObject()
      }
    });
  } catch (error) {
    logger.error('Error fetching action:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch action'
    });
  }
}

/**
 * GET /api/actions/history/:characterId
 * Get action history for a character
 */
export async function getActionHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const characterId = req.params.characterId;
    const page = parseInt((req.query['page'] as string) || '1');
    const limit = parseInt((req.query['limit'] as string) || '50');
    const offset = (page - 1) * limit;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this character'
      });
      return;
    }

    // Get action history
    const results = await ActionResult.findByCharacter(characterId, limit, offset);

    // Get character stats
    const stats = await ActionResult.getCharacterStats(characterId);

    res.status(200).json({
      success: true,
      data: {
        history: results.map(r => r.toSafeObject()),
        stats,
        pagination: {
          page,
          limit,
          total: stats.totalActions
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching action history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch action history'
    });
  }
}
