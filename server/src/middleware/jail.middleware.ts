/**
 * Jail Middleware
 *
 * Prevents jailed characters from performing any actions
 * Enhanced with auto-release and comprehensive blocking
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Middleware to prevent actions while jailed
 * Checks if the character is currently in jail and blocks the request if so
 */
export async function preventActionsWhileJailed(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Get character ID from request (could be in params, body, or query)
    const characterId = req.params['characterId'] || req.body.characterId || req.query['characterId'];

    if (!characterId) {
      // No character ID provided, skip jail check
      next();
      return;
    }

    // Fetch character
    const character = await Character.findById(characterId);

    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    // Verify ownership
    if (character.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this character'
      });
      return;
    }

    // Check if character is jailed
    if (character.isCurrentlyJailed()) {
      const remainingMinutes = character.getRemainingJailTime();
      const bailCost = character.wantedLevel * 50;

      logger.debug(`Character ${characterId} attempted action while jailed (${remainingMinutes}m remaining)`);

      res.status(403).json({
        success: false,
        error: "You're in jail!",
        jail: {
          isJailed: true,
          remainingMinutes,
          bailCost,
          message: `You're locked up in the county jail! ${remainingMinutes} minutes until release, or pay $${bailCost} to post bail.`,
          flavorText: getJailFlavorText(character.wantedLevel)
        }
      });
      return;
    }

    // If jailed time has expired, auto-release
    if (character.isJailed && character.jailedUntil && new Date() >= character.jailedUntil) {
      character.releaseFromJail();
      await character.save();
      logger.info(`Character ${characterId} automatically released from jail`);
    }

    // Not jailed, proceed
    next();
  } catch (error) {
    logger.error('Jail middleware error:', error);
    next(error);
  }
}

/**
 * Get flavor text based on wanted level
 */
function getJailFlavorText(wantedLevel: number): string {
  const flavorTexts: string[] = [
    "The deputy gives you a stern look through the bars.",
    "Time passes slowly in the cramped cell. The smell of stale beans and regret fills the air.",
    "You hear the sheriff whistling outside. He seems quite pleased with himself.",
    "Another prisoner in the next cell over is loudly proclaiming his innocence. Sure, pal.",
    "The jail cat wanders by, completely indifferent to your predicament."
  ];

  if (wantedLevel >= 4) {
    return "The sheriff posted extra guards. You're not getting out of here easy.";
  } else if (wantedLevel >= 3) {
    return "You can hear wanted posters being printed with your name on them.";
  } else {
    return SecureRNG.select(flavorTexts);
  }
}

/**
 * Auto-release check middleware
 * Checks if jail sentence has expired and automatically releases player
 * Should be used on authenticated routes
 */
export async function autoReleaseCheck(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const character = (req as any).character;

    if (!character) {
      next();
      return;
    }

    // Check if character is marked as jailed but sentence has expired
    if (character.isJailed && !character.isCurrentlyJailed()) {
      // Sentence expired, auto-release
      character.releaseFromJail();
      await character.save();

      logger.info(`Auto-released: ${character.name} sentence expired`);
    }

    next();
  } catch (error) {
    logger.error('Error in auto-release middleware:', error);
    // Don't block request on auto-release error
    next();
  }
}

/**
 * Block jailed players from performing actions
 * Use this on routes that jailed players should not access
 */
export async function blockJailedPlayers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const character = (req as any).character;

    if (!character) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Check if character is currently jailed
    if (character.isCurrentlyJailed()) {
      const remainingTime = character.getRemainingJailTime();

      logger.info(
        `Jailed player blocked: ${character.name} attempted to access ${req.path} ` +
        `(${remainingTime} minutes remaining)`
      );

      res.status(403).json({
        success: false,
        error: 'You cannot perform this action while in jail',
        jailed: true,
        remainingTime,
        bailAmount: character.lastBailCost,
        message: `You are in jail for ${remainingTime} more minutes. Pay $${character.lastBailCost} bail or wait it out.`
      });
      return;
    }

    // Player is not jailed, allow action
    next();
  } catch (error) {
    logger.error('Error in jail middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * List of allowed routes while jailed
 */
const JAILED_ALLOWED_ROUTES = [
  '/api/jail',
  '/api/characters/current',
  '/api/notifications',
  '/api/mail',
  '/api/friends',
  '/api/chat',
  '/api/profiles',
  '/api/leaderboard',
  '/api/auth/logout'
];

/**
 * Smart jail middleware that auto-blocks most routes but allows jail-specific ones
 */
export function smartJailBlock(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const character = (req as any).character;

  if (!character) {
    next();
    return;
  }

  // Check if jailed
  if (!character.isCurrentlyJailed()) {
    next();
    return;
  }

  // Check if route is allowed
  const path = req.path;
  const isAllowed = JAILED_ALLOWED_ROUTES.some(route => path.startsWith(route));

  if (isAllowed) {
    next();
    return;
  }

  // Block the action
  const remainingTime = character.getRemainingJailTime();

  logger.info(
    `Jailed player blocked: ${character.name} attempted to access ${path} ` +
    `(${remainingTime} minutes remaining)`
  );

  res.status(403).json({
    success: false,
    error: 'You cannot perform this action while in jail',
    jailed: true,
    remainingTime,
    bailAmount: character.lastBailCost,
    message: `You are in jail for ${remainingTime} more minutes. Pay $${character.lastBailCost} bail or wait it out.`
  });
}

export default {
  preventActionsWhileJailed,
  autoReleaseCheck,
  blockJailedPlayers,
  smartJailBlock
};
