/**
 * Action Influence Middleware
 *
 * Middleware to automatically apply influence effects after actions
 * Hooks into action completion to trigger faction influence changes
 * Phase 11, Wave 11.1
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './requireAuth';
import { ActionCategory, ActionFactionId, TerritoryFactionId } from '@desperados/shared';
import { actionFactionToTerritoryFaction } from '@desperados/shared';
import { ActionEffectsService } from '../services/actionEffects.service';
import logger from '../utils/logger';

/**
 * Extended request interface with action result data
 */
export interface ActionInfluenceRequest extends AuthRequest {
  actionResult?: {
    success: boolean;
    actionId: string;
    actionCategory?: ActionCategory;
    targetFaction?: ActionFactionId;
    territoryId?: string;
    characterId: string;
  };
}

/**
 * Middleware to apply influence effects after action completion
 *
 * Attach this middleware after action processing to automatically
 * calculate and apply influence changes based on the action performed.
 *
 * Usage:
 * ```typescript
 * router.post('/actions/:actionId/perform',
 *   requireAuth,
 *   performAction, // Action handler sets req.actionResult
 *   applyActionInfluence // This middleware applies influence
 * );
 * ```
 */
export async function applyActionInfluence(
  req: ActionInfluenceRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Only apply influence if action was successful
    if (!req.actionResult || !req.actionResult.success) {
      return next();
    }

    const {
      actionCategory,
      targetFaction,
      territoryId,
      characterId,
    } = req.actionResult;

    // Skip if no action category (not influence-affecting action)
    if (!actionCategory) {
      return next();
    }

    // Apply influence effect
    try {
      // Convert ActionFactionId to TerritoryFactionId if needed
      let territoryFaction: TerritoryFactionId | undefined;
      if (targetFaction) {
        const converted = actionFactionToTerritoryFaction(targetFaction);
        if (!converted) {
          logger.warn(`Cannot convert action faction ${targetFaction} to territory faction, skipping influence`);
          return next();
        }
        territoryFaction = converted;
      }

      const influenceResult = await ActionEffectsService.applyActionInfluence(
        characterId as any,
        actionCategory,
        territoryId,
        territoryFaction
      );

      // Attach influence result to response (optional)
      if (res.locals) {
        res.locals.influenceResult = influenceResult;
      }

      logger.info(
        `Influence applied: ${actionCategory} by ${characterId} - ` +
        `${influenceResult.primaryInfluenceChange > 0 ? '+' : ''}${influenceResult.primaryInfluenceChange} ` +
        `to ${influenceResult.primaryFaction}`
      );

      // Check if milestone was reached
      if (influenceResult.milestoneReached) {
        logger.info(
          `Milestone reached: ${characterId} achieved ${influenceResult.milestoneReached} ` +
          `for ${influenceResult.primaryFaction}`
        );

        // You could trigger notifications here
        // await NotificationService.sendMilestoneNotification(...)
      }
    } catch (influenceError) {
      // Log error but don't fail the request
      logger.error('Error applying action influence:', influenceError);
      // Continue to next middleware - action succeeded even if influence failed
    }

    next();
  } catch (error) {
    logger.error('Error in action influence middleware:', error);
    next(); // Continue despite error
  }
}

/**
 * Helper function to set action result for influence tracking
 *
 * Call this in your action handlers to mark the action for influence processing:
 * ```typescript
 * setActionInfluenceData(req, {
 *   success: true,
 *   actionId: 'rob-bank',
 *   actionCategory: ActionCategory.CRIMINAL_ROB_TERRITORY,
 *   targetFaction: ActionFactionId.SETTLER_ALLIANCE,
 *   territoryId: 'red-gulch',
 *   characterId: character._id.toString(),
 * });
 * ```
 */
export function setActionInfluenceData(
  req: ActionInfluenceRequest,
  data: {
    success: boolean;
    actionId: string;
    actionCategory?: ActionCategory;
    targetFaction?: ActionFactionId;
    territoryId?: string;
    characterId: string;
  }
): void {
  req.actionResult = data;
}

/**
 * Map standard action types to influence action categories
 * This helps bridge existing action system with new influence system
 */
export function mapActionToInfluenceCategory(
  actionType: string,
  actionId: string
): ActionCategory | null {
  // Map based on action ID patterns
  const actionIdLower = actionId.toLowerCase();

  // Criminal actions
  if (actionIdLower.includes('rob') || actionIdLower.includes('steal')) {
    return ActionCategory.CRIMINAL_ROB_TERRITORY;
  }
  if (actionIdLower.includes('smuggle')) {
    return ActionCategory.CRIMINAL_SMUGGLE;
  }
  if (actionIdLower.includes('protection')) {
    return ActionCategory.CRIMINAL_PROTECTION_RACKET;
  }
  if (actionIdLower.includes('contraband')) {
    return ActionCategory.CRIMINAL_CONTRABAND;
  }

  // Combat actions
  if (actionIdLower.includes('bounty')) {
    return ActionCategory.COMBAT_BOUNTY_CLAIM;
  }
  if (actionIdLower.includes('duel')) {
    return ActionCategory.COMBAT_DUEL_WIN;
  }
  if (actionIdLower.includes('defend')) {
    return ActionCategory.COMBAT_DEFEND_TERRITORY;
  }
  if (actionIdLower.includes('raid')) {
    return ActionCategory.COMBAT_RAID_TERRITORY;
  }
  if (actionIdLower.includes('escort')) {
    return ActionCategory.COMBAT_ESCORT_MISSION;
  }

  // Economic actions
  if (actionIdLower.includes('job') || actionIdLower.includes('work')) {
    return ActionCategory.ECONOMIC_FACTION_JOB;
  }
  if (actionIdLower.includes('trade')) {
    return ActionCategory.ECONOMIC_TRADE;
  }
  if (actionIdLower.includes('invest')) {
    return ActionCategory.ECONOMIC_INVEST;
  }
  if (actionIdLower.includes('sabotage')) {
    return ActionCategory.ECONOMIC_SABOTAGE;
  }

  // Social actions
  if (actionIdLower.includes('quest') || actionIdLower.includes('reputation')) {
    return ActionCategory.SOCIAL_REPUTATION_QUEST;
  }
  if (actionIdLower.includes('recruit')) {
    return ActionCategory.SOCIAL_RECRUIT;
  }
  if (actionIdLower.includes('propaganda')) {
    return ActionCategory.SOCIAL_PROPAGANDA;
  }
  if (actionIdLower.includes('diplomacy')) {
    return ActionCategory.SOCIAL_DIPLOMACY;
  }

  // Special actions
  if (actionIdLower.includes('train') && actionIdLower.includes('heist')) {
    return ActionCategory.SPECIAL_TRAIN_HEIST;
  }
  if (actionIdLower.includes('bank') && actionIdLower.includes('rob')) {
    return ActionCategory.SPECIAL_BANK_ROBBERY;
  }
  if (actionIdLower.includes('artifact')) {
    return ActionCategory.SPECIAL_ARTIFACT_RECOVERY;
  }
  if (actionIdLower.includes('ritual')) {
    return ActionCategory.SPECIAL_RITUAL_COMPLETION;
  }
  if (actionIdLower.includes('legendary') || actionIdLower.includes('hunt')) {
    return ActionCategory.SPECIAL_LEGENDARY_HUNT;
  }

  // Default: no influence effect
  return null;
}

/**
 * Determine target faction from action context
 */
export function determineTargetFaction(
  actionId: string,
  territoryId?: string,
  npcFaction?: string
): ActionFactionId | undefined {
  // If NPC faction is provided, use that
  if (npcFaction) {
    return mapNpcFactionToFactionId(npcFaction);
  }

  // Try to infer from action ID
  const actionIdLower = actionId.toLowerCase();

  if (actionIdLower.includes('settler')) {
    return ActionFactionId.SETTLER_ALLIANCE;
  }
  if (actionIdLower.includes('nahi') || actionIdLower.includes('coalition')) {
    return ActionFactionId.NAHI_COALITION;
  }
  if (actionIdLower.includes('frontera') || actionIdLower.includes('cartel')) {
    return ActionFactionId.FRONTERA_CARTEL;
  }
  if (actionIdLower.includes('law') || actionIdLower.includes('sheriff')) {
    return ActionFactionId.LAW_ENFORCEMENT;
  }
  if (actionIdLower.includes('outlaw') || actionIdLower.includes('bandit')) {
    return ActionFactionId.OUTLAW_FACTION;
  }
  if (actionIdLower.includes('railroad') || actionIdLower.includes('train')) {
    return ActionFactionId.RAILROAD_CORP;
  }
  if (actionIdLower.includes('military') || actionIdLower.includes('fort')) {
    return ActionFactionId.MILITARY;
  }

  // Try to infer from territory
  if (territoryId) {
    return mapTerritoryToFaction(territoryId);
  }

  return undefined;
}

/**
 * Map NPC faction string to ActionFactionId
 */
function mapNpcFactionToFactionId(npcFaction: string): ActionFactionId {
  const factionMap: Record<string, ActionFactionId> = {
    'SETTLER': ActionFactionId.SETTLER_ALLIANCE,
    'NAHI': ActionFactionId.NAHI_COALITION,
    'FRONTERA': ActionFactionId.FRONTERA_CARTEL,
    'LAW': ActionFactionId.LAW_ENFORCEMENT,
    'OUTLAW': ActionFactionId.OUTLAW_FACTION,
    'RAILROAD': ActionFactionId.RAILROAD_CORP,
    'MILITARY': ActionFactionId.MILITARY,
    'CHINESE': ActionFactionId.CHINESE_TONG,
  };

  return factionMap[npcFaction.toUpperCase()] || ActionFactionId.SETTLER_ALLIANCE;
}

/**
 * Map territory to controlling faction
 */
function mapTerritoryToFaction(territoryId: string): ActionFactionId {
  const territoryMap: Record<string, ActionFactionId> = {
    'fort-ashford': ActionFactionId.MILITARY,
    'red-gulch': ActionFactionId.OUTLAW_FACTION,
    'the-frontera': ActionFactionId.FRONTERA_CARTEL,
    'coalition-lands': ActionFactionId.NAHI_COALITION,
    'silver-springs': ActionFactionId.SETTLER_ALLIANCE,
    'railroad-junction': ActionFactionId.RAILROAD_CORP,
  };

  return territoryMap[territoryId] || ActionFactionId.SETTLER_ALLIANCE;
}
