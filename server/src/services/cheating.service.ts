/**
 * Cheating Service
 * Phase 13, Wave 13.1 - High Stakes Gambling Events
 *
 * Handles cheating mechanics, detection, and consequences
 */

import { Character, ICharacter } from '../models/Character.model';
import { GamblingSession, IGamblingSession } from '../models/GamblingSession.model';
import { GamblingHistory } from '../models/GamblingHistory.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  CheatMethod,
  CheatResult,
  CheatAttempt,
  GamblingSessionStatus
} from '@desperados/shared';
import { getGamblingGameById } from '../data/gamblingGames';
import logger from '../utils/logger';

/**
 * Attempt to cheat in a gambling game
 */
export async function attemptCheat(
  sessionId: string,
  characterId: string,
  method: CheatMethod,
  targetAmount?: number
): Promise<{
  attempt: CheatAttempt;
  sessionEnded: boolean;
  message: string;
}> {
  const session = await GamblingSession.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.characterId.toString() !== characterId) {
    throw new Error('Not your session');
  }

  if (session.status !== GamblingSessionStatus.ACTIVE) {
    throw new Error('Session is not active');
  }

  const character = await Character.findById(characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  const game = getGamblingGameById(session.gameId);
  if (!game) {
    throw new Error('Game not found');
  }

  const history = await GamblingHistory.findByCharacter(characterId);

  // Check cheat attempt limit per session
  if (session.cheatAttempts >= 3) {
    throw new Error('Maximum cheat attempts per session reached');
  }

  // Calculate success and detection chances
  const skillLevel = getRelevantSkillLevel(character, method);
  const itemBonus = 0; // TODO: Check for gambling items equipped

  // Base detection chance
  let detectionChance = game.cheatDetectionBase;

  // Modifiers
  detectionChance -= skillLevel * 2; // -2% per skill level
  detectionChance -= itemBonus;
  detectionChance += session.dealerSkillLevel * 3; // +3% per dealer skill
  detectionChance += (history?.knownCheater ? 20 : 0); // Known cheaters watched closely

  // Clamp detection chance
  detectionChance = Math.max(5, Math.min(95, detectionChance));

  // Calculate success chance (separate from detection)
  let successChance = 50 + skillLevel * 3 + itemBonus;
  successChance = Math.max(10, Math.min(90, successChance));

  // Roll for success
  const successRoll = Math.random() * 100;
  const success = successRoll < successChance;

  // Roll for detection
  const detectionRoll = Math.random() * 100;
  const detected = detectionRoll < detectionChance;

  // Determine who detected (if detected)
  let detectedBy: 'DEALER' | 'PLAYER' | 'SECURITY' | 'NONE' = 'NONE';
  if (detected) {
    const detectorRoll = Math.random() * 100;
    if (detectorRoll < 60) {
      detectedBy = 'DEALER';
    } else if (detectorRoll < 85) {
      detectedBy = 'SECURITY';
    } else {
      detectedBy = 'PLAYER';
    }
  }

  // Calculate gold bonus if successful
  const goldBonus = success ? (targetAmount || session.gameState?.bet || 100) * 0.5 : 0;

  // Create cheat attempt record
  const cheatAttempt: CheatAttempt = {
    characterId,
    sessionId,
    method,
    skillLevel,
    itemBonus,
    baseDetectionChance: game.cheatDetectionBase,
    dealerSkillModifier: session.dealerSkillLevel * 3,
    locationSecurityModifier: 0,
    reputationModifier: history?.knownCheater ? 20 : 0,
    success,
    detected,
    detectedBy,
    goldBonus,
    ejected: detected,
    reputationLoss: detected ? 10 : 0,
    bannedFromLocation: detectedBy === 'SECURITY',
    jailTime: detectedBy === 'SECURITY' ? 30 : undefined,
    fine: detected ? 500 : undefined
  };

  // Update session
  session.recordCheatAttempt(method, success, detected);
  await session.save();

  // Update history
  if (history) {
    (history as any).recordCheat(success, detected);
    if (cheatAttempt.bannedFromLocation) {
      (history as any).banFromLocation(session.location);
    }
    await history.save();
  }

  // Apply consequences
  let sessionEnded = false;
  let message = '';

  if (detected) {
    sessionEnded = true;

    // Reputation loss
    if (character.factionReputation) {
      Object.keys(character.factionReputation).forEach(faction => {
        if (character.factionReputation[faction as keyof typeof character.factionReputation] !== undefined) {
          character.factionReputation[faction as keyof typeof character.factionReputation] = Math.max(
            -100,
            character.factionReputation[faction as keyof typeof character.factionReputation] - cheatAttempt.reputationLoss
          );
        }
      });
    }

    // Fine
    if (cheatAttempt.fine) {
      if (character.hasGold(cheatAttempt.fine)) {
        await character.deductGold(cheatAttempt.fine, TransactionSource.GAMBLING_CHEAT_FINE);
      }
    }

    // Jail time
    if (cheatAttempt.jailTime) {
      character.sendToJail(cheatAttempt.jailTime);
    }

    await character.save();

    // Generate message
    message = `CAUGHT CHEATING by ${detectedBy}! You've been ejected from the game`;
    if (cheatAttempt.fine) {
      message += `, fined ${cheatAttempt.fine} gold`;
    }
    if (cheatAttempt.jailTime) {
      message += `, and sent to jail for ${cheatAttempt.jailTime} minutes`;
    }
    if (cheatAttempt.bannedFromLocation) {
      message += `. You are now BANNED from ${session.location}`;
    }
    message += '. Your reputation has been severely damaged.';

    logger.warn(`Cheat detected: ${character.name} caught using ${method} at ${session.location}`);
  } else {
    if (success) {
      // Award bonus gold
      if (goldBonus > 0) {
        await character.addGold(goldBonus, TransactionSource.GAMBLING_WIN);
        await character.save();
      }

      message = `Cheat successful! You gained an extra ${Math.floor(goldBonus)} gold without detection.`;
      logger.info(`Successful cheat: ${character.name} used ${method} and won ${goldBonus} gold`);
    } else {
      message = `Your cheat attempt failed, but you weren't caught. The dealer seemed suspicious though...`;
    }
  }

  return {
    attempt: cheatAttempt,
    sessionEnded,
    message
  };
}

/**
 * Get relevant skill level for cheating method
 */
function getRelevantSkillLevel(character: ICharacter, method: CheatMethod): number {
  // Map cheat methods to skills
  const skillMap: Record<CheatMethod, string> = {
    [CheatMethod.CARD_MANIPULATION]: 'sleight_of_hand',
    [CheatMethod.MARKED_CARDS]: 'observation',
    [CheatMethod.LOADED_DICE]: 'sleight_of_hand',
    [CheatMethod.COLLUSION]: 'cunning',
    [CheatMethod.CARD_COUNTING]: 'mathematics',
    [CheatMethod.MIRROR_SIGNAL]: 'observation',
    [CheatMethod.DEALER_COLLUSION]: 'cunning'
  };

  const skillId = skillMap[method];
  return character.getSkillLevel(skillId);
}

/**
 * Check if character has gambling item equipped
 */
export async function hasGamblingItemBonus(
  characterId: string,
  itemType: 'cheat' | 'winRate' | 'detection'
): Promise<{ hasItem: boolean; bonus: number; itemId?: string }> {
  const character = await Character.findById(characterId);
  if (!character) {
    return { hasItem: false, bonus: 0 };
  }

  // TODO: Check character's inventory and equipment for gambling items
  // This would integrate with the item system

  return { hasItem: false, bonus: 0 };
}

/**
 * Calculate overall cheat success rate
 */
export async function calculateCheatSuccessRate(
  characterId: string,
  method: CheatMethod,
  gameId: string,
  location: string
): Promise<{
  successChance: number;
  detectionChance: number;
  warnings: string[];
}> {
  const character = await Character.findById(characterId);
  if (!character) {
    throw new Error('Character not found');
  }

  const history = await GamblingHistory.findByCharacter(characterId);
  const game = getGamblingGameById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }

  const skillLevel = getRelevantSkillLevel(character, method);
  const warnings: string[] = [];

  // Calculate success chance
  let successChance = 50 + skillLevel * 3;

  // Calculate detection chance
  let detectionChance = game.cheatDetectionBase;
  detectionChance -= skillLevel * 2;

  if (history?.knownCheater) {
    detectionChance += 20;
    warnings.push('You are a KNOWN CHEATER - security watches you closely');
  }

  if (history?.isBannedFrom(location)) {
    warnings.push('You are BANNED from this location');
    return { successChance: 0, detectionChance: 100, warnings };
  }

  if (history && history.timesCaughtCheating >= 5) {
    warnings.push('Your reputation as a cheater precedes you - very high risk');
  }

  // Clamp values
  successChance = Math.max(10, Math.min(90, successChance));
  detectionChance = Math.max(5, Math.min(95, detectionChance));

  return {
    successChance,
    detectionChance,
    warnings
  };
}

export const CheatingService = {
  attemptCheat,
  hasGamblingItemBonus,
  calculateCheatSuccessRate
};
