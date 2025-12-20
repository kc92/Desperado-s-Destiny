/**
 * Gang Permission Middleware
 *
 * Middleware for checking gang membership and permissions
 */

import { Request, Response, NextFunction } from 'express';
import { Gang, IGang } from '../models/Gang.model';
import { GangPermission } from '@desperados/shared';
import { AuthRequest } from './auth.middleware';
import logger from '../utils/logger';

/**
 * Extended request interface with gang data
 */
export interface GangRequest extends AuthRequest {
  gang?: IGang;
  characterId?: string;
}

/**
 * Middleware to require gang membership
 * Fetches gang and attaches to request
 */
export function requireGangMember(
  req: GangRequest,
  res: Response,
  next: NextFunction
): void {
  const gangId = req.params.id || req.params.gangId;
  const characterId = req.params.characterId || req.body.characterId || req.characterId;

  if (!characterId) {
    res.status(400).json({
      success: false,
      error: 'Character ID required',
    });
    return;
  }

  Gang.findById(gangId)
    .then((gang) => {
      if (!gang) {
        res.status(404).json({
          success: false,
          error: 'Gang not found',
        });
        return;
      }

      if (!gang.isMember(characterId)) {
        res.status(403).json({
          success: false,
          error: 'You are not a member of this gang',
        });
        return;
      }

      req.gang = gang;
      next();
    })
    .catch((error) => {
      logger.error('Error in requireGangMember middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify gang membership',
      });
    });
}

/**
 * Middleware to require gang officer or leader role
 */
export function requireGangOfficer(
  req: GangRequest,
  res: Response,
  next: NextFunction
): void {
  const gangId = req.params.id || req.params.gangId;
  const characterId = req.params.characterId || req.body.characterId || req.characterId;

  if (!characterId) {
    res.status(400).json({
      success: false,
      error: 'Character ID required',
    });
    return;
  }

  Gang.findById(gangId)
    .then((gang) => {
      if (!gang) {
        res.status(404).json({
          success: false,
          error: 'Gang not found',
        });
        return;
      }

      if (!gang.isOfficer(characterId)) {
        res.status(403).json({
          success: false,
          error: 'You must be an officer or leader to perform this action',
        });
        return;
      }

      req.gang = gang;
      next();
    })
    .catch((error) => {
      logger.error('Error in requireGangOfficer middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify gang permissions',
      });
    });
}

/**
 * Middleware to require gang leader role
 */
export function requireGangLeader(
  req: GangRequest,
  res: Response,
  next: NextFunction
): void {
  const gangId = req.params.id || req.params.gangId;
  const characterId = req.params.characterId || req.body.characterId || req.characterId;

  if (!characterId) {
    res.status(400).json({
      success: false,
      error: 'Character ID required',
    });
    return;
  }

  Gang.findById(gangId)
    .then((gang) => {
      if (!gang) {
        res.status(404).json({
          success: false,
          error: 'Gang not found',
        });
        return;
      }

      if (!gang.isLeader(characterId)) {
        res.status(403).json({
          success: false,
          error: 'You must be the gang leader to perform this action',
        });
        return;
      }

      req.gang = gang;
      next();
    })
    .catch((error) => {
      logger.error('Error in requireGangLeader middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify gang leadership',
      });
    });
}

/**
 * Check if character has specific gang permission
 *
 * @param gangId - Gang ID
 * @param characterId - Character ID
 * @param permission - Permission to check
 * @returns True if character has permission
 */
export async function hasGangPermission(
  gangId: string,
  characterId: string,
  permission: GangPermission
): Promise<boolean> {
  try {
    const gang = await Gang.findById(gangId);
    if (!gang) {
      return false;
    }

    return gang.hasPermission(characterId, permission);
  } catch (error) {
    logger.error('Error checking gang permission:', error);
    return false;
  }
}
