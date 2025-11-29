/**
 * Companion Controller
 * Handles all animal companion-related HTTP requests for ownership, care, training, taming, and combat
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { CompanionService } from '../services/companion.service';
import { CompanionCombatService } from '../services/companionCombat.service';
import { TamingService } from '../services/taming.service';
import logger from '../utils/logger';

/**
 * GET /api/companions
 * Get all companions owned by the character
 */
export async function getCompanions(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const result = await CompanionService.getCharacterCompanions(characterId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching companions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companions'
    });
  }
}

/**
 * GET /api/companions/shop
 * Get available companions for purchase
 */
export async function getCompanionShop(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const listings = await CompanionService.getShop(characterId);

    res.status(200).json({
      success: true,
      data: {
        listings,
        count: listings.length
      }
    });
  } catch (error) {
    logger.error('Error fetching companion shop:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companion shop'
    });
  }
}

/**
 * POST /api/companions/purchase
 * Purchase a new companion
 * Body: { species: CompanionSpecies, name: string, gender: 'male' | 'female' }
 */
export async function purchaseCompanion(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const { species, name, gender } = req.body;

    if (!species || !name || !gender) {
      res.status(400).json({
        success: false,
        error: 'Species, name, and gender are required'
      });
      return;
    }

    if (gender !== 'male' && gender !== 'female') {
      res.status(400).json({
        success: false,
        error: 'Gender must be male or female'
      });
      return;
    }

    const companion = await CompanionService.purchaseCompanion(characterId, species, name, gender);

    logger.info(`Character ${characterId} purchased companion: ${name} (${species})`);

    res.status(201).json({
      success: true,
      data: {
        companion: companion.toSafeObject(),
        message: `Successfully purchased ${name}!`
      }
    });
  } catch (error: any) {
    logger.error('Error purchasing companion:', error);
    const status = error.statusCode || (error.message?.includes('Insufficient') ? 400 : 500);
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to purchase companion'
    });
  }
}

/**
 * POST /api/companions/:companionId/activate
 * Set a companion as active
 */
export async function activateCompanion(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { companionId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!companionId || !companionId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid companion ID required'
      });
      return;
    }

    const companion = await CompanionService.setActiveCompanion(characterId, companionId);

    res.status(200).json({
      success: true,
      data: {
        companion: companion.toSafeObject(),
        message: `${companion.name} is now your active companion.`
      }
    });
  } catch (error: any) {
    logger.error('Error activating companion:', error);
    const status = error.statusCode || (error.message?.includes('not found') ? 404 : 500);
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to activate companion'
    });
  }
}

/**
 * PATCH /api/companions/:companionId/rename
 * Rename a companion
 * Body: { newName: string }
 */
export async function renameCompanion(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { companionId } = req.params;
    const { newName } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!companionId || !companionId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid companion ID required'
      });
      return;
    }

    if (!newName || newName.length < 2 || newName.length > 20) {
      res.status(400).json({
        success: false,
        error: 'Name must be 2-20 characters'
      });
      return;
    }

    const companion = await CompanionService.renameCompanion(characterId, companionId, newName);

    res.status(200).json({
      success: true,
      data: {
        companion: companion.toSafeObject(),
        message: `Companion renamed to ${newName}.`
      }
    });
  } catch (error: any) {
    logger.error('Error renaming companion:', error);
    const status = error.statusCode || (error.message?.includes('not found') ? 404 : 500);
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to rename companion'
    });
  }
}

/**
 * POST /api/companions/:companionId/feed
 * Feed a companion
 */
export async function feedCompanion(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { companionId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!companionId || !companionId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid companion ID required'
      });
      return;
    }

    const result = await CompanionService.feedCompanion(characterId, companionId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error feeding companion:', error);
    const status = error.statusCode || (error.message?.includes('not found') ? 404 : 500);
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to feed companion'
    });
  }
}

/**
 * POST /api/companions/:companionId/heal
 * Heal a companion
 */
export async function healCompanion(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { companionId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!companionId || !companionId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid companion ID required'
      });
      return;
    }

    const result = await CompanionService.healCompanion(characterId, companionId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error healing companion:', error);
    const status = error.statusCode || (error.message?.includes('not found') ? 404 : 500);
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to heal companion'
    });
  }
}

/**
 * POST /api/companions/:companionId/train
 * Start training an ability
 * Body: { abilityId: CompanionAbilityId }
 */
export async function startTraining(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { companionId } = req.params;
    const { abilityId } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!companionId || !companionId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid companion ID required'
      });
      return;
    }

    if (!abilityId) {
      res.status(400).json({
        success: false,
        error: 'Ability ID required'
      });
      return;
    }

    const result = await CompanionService.startTraining(characterId, companionId, abilityId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error starting training:', error);
    const status = error.statusCode || (error.message?.includes('not found') ? 404 : 500);
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to start training'
    });
  }
}

/**
 * POST /api/companions/:companionId/complete-training
 * Complete training and learn the ability
 */
export async function completeTraining(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { companionId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!companionId || !companionId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid companion ID required'
      });
      return;
    }

    const result = await CompanionService.completeTraining(characterId, companionId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error completing training:', error);
    const status = error.statusCode || (error.message?.includes('not found') ? 404 : 500);
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to complete training'
    });
  }
}

/**
 * GET /api/companions/care-tasks
 * Get pending care tasks for all companions
 */
export async function getCareTasks(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const tasks = await CompanionService.getCareTasks(characterId);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length
      }
    });
  } catch (error) {
    logger.error('Error fetching care tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch care tasks'
    });
  }
}

/**
 * DELETE /api/companions/:companionId
 * Release a companion back to the wild
 */
export async function releaseCompanion(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { companionId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!companionId || !companionId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid companion ID required'
      });
      return;
    }

    const result = await CompanionService.releaseCompanion(characterId, companionId);

    logger.info(`Character ${characterId} released companion ${companionId}`);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error releasing companion:', error);
    const status = error.statusCode || (error.message?.includes('not found') ? 404 : 500);
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to release companion'
    });
  }
}

// ============================================================================
// TAMING ENDPOINTS
// ============================================================================

/**
 * GET /api/companions/wild-encounters
 * Get available wild animals to tame at current location
 */
export async function getWildEncounters(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const location = req.character?.currentLocation || 'wilderness';

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const encounters = await TamingService.getWildEncounters(characterId, location);

    res.status(200).json({
      success: true,
      data: {
        encounters,
        count: encounters.length,
        location
      }
    });
  } catch (error) {
    logger.error('Error fetching wild encounters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wild encounters'
    });
  }
}

/**
 * POST /api/companions/tame
 * Attempt to tame a wild animal
 * Body: { species: CompanionSpecies }
 */
export async function attemptTaming(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const location = req.character?.currentLocation || 'wilderness';
    const { species } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!species) {
      res.status(400).json({
        success: false,
        error: 'Species required'
      });
      return;
    }

    const result = await TamingService.attemptTaming(characterId, species, location);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error attempting taming:', error);
    const status = error.statusCode || (error.message?.includes('Requires') ? 400 : 500);
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to attempt taming'
    });
  }
}

/**
 * GET /api/companions/taming-progress/:species
 * Get current taming progress for a species
 */
export async function getTamingProgress(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { species } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!species) {
      res.status(400).json({
        success: false,
        error: 'Species required'
      });
      return;
    }

    const progress = TamingService.getTamingProgress(characterId, species as any);

    res.status(200).json({
      success: true,
      data: {
        species,
        progress: progress?.progress || 0,
        attempts: progress?.attempts || 0,
        hasActiveAttempt: progress !== null
      }
    });
  } catch (error) {
    logger.error('Error fetching taming progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch taming progress'
    });
  }
}

/**
 * POST /api/companions/abandon-taming
 * Abandon current taming attempt
 * Body: { species: CompanionSpecies }
 */
export async function abandonTaming(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { species } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!species) {
      res.status(400).json({
        success: false,
        error: 'Species required'
      });
      return;
    }

    TamingService.abandonTaming(characterId, species);

    res.status(200).json({
      success: true,
      data: {
        message: `Abandoned taming attempt for ${species}.`
      }
    });
  } catch (error) {
    logger.error('Error abandoning taming:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to abandon taming'
    });
  }
}

// ============================================================================
// COMBAT ENDPOINTS
// ============================================================================

/**
 * GET /api/companions/active/combat-stats
 * Get combat stats for the active companion
 */
export async function getActiveCompanionCombatStats(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const companion = await CompanionCombatService.getActiveCompanion(characterId);

    if (!companion) {
      res.status(200).json({
        success: true,
        data: {
          hasActiveCompanion: false,
          message: 'No active companion'
        }
      });
      return;
    }

    const combatStats = CompanionCombatService.getCompanionCombatStats(companion);

    res.status(200).json({
      success: true,
      data: {
        hasActiveCompanion: true,
        companion: companion.toSafeObject(),
        combatStats
      }
    });
  } catch (error) {
    logger.error('Error fetching companion combat stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companion combat stats'
    });
  }
}

/**
 * POST /api/companions/:companionId/use-ability
 * Use a companion ability in combat
 * Body: { abilityId: CompanionAbilityId, encounterId: string }
 */
export async function useCompanionAbility(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { companionId } = req.params;
    const { abilityId, encounterId } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!companionId || !companionId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid companion ID required'
      });
      return;
    }

    if (!abilityId || !encounterId) {
      res.status(400).json({
        success: false,
        error: 'Ability ID and Encounter ID required'
      });
      return;
    }

    const result = await CompanionCombatService.useCompanionAbility(
      characterId,
      companionId,
      abilityId,
      encounterId
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error using companion ability:', error);
    const status = error.statusCode || (error.message?.includes('not found') ? 404 : 500);
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to use companion ability'
    });
  }
}
