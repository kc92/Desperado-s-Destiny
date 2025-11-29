/**
 * Horse Controller
 * Handles all horse-related HTTP requests for ownership, care, training, and breeding
 */

import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import * as HorseService from '../services/horse.service';
import * as HorseBondService from '../services/horseBond.service';
import * as HorseBreedingService from '../services/horseBreeding.service';
import logger from '../utils/logger';

/**
 * GET /api/horses
 * Get all horses owned by the character
 */
export async function getHorses(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const result = await HorseService.getHorsesByOwner(new ObjectId(characterId));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching horses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch horses'
    });
  }
}

/**
 * GET /api/horses/:horseId
 * Get a specific horse by ID
 */
export async function getHorse(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const { horseId } = req.params;

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    const horse = await HorseService.getHorseById(new ObjectId(horseId));

    if (!horse) {
      res.status(404).json({
        success: false,
        error: 'Horse not found'
      });
      return;
    }

    // Verify ownership
    const characterId = req.characterId || req.character?._id.toString();
    if (horse.ownerId.toString() !== characterId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this horse'
      });
      return;
    }

    const careNeeds = HorseService.assessCareNeeds(horse);

    res.status(200).json({
      success: true,
      data: {
        horse: horse.toObject(),
        careNeeds,
        bondLevel: HorseBondService.getBondLevel(horse.bond.level),
        bondBenefits: HorseBondService.getBondBenefits(HorseBondService.getBondLevel(horse.bond.level))
      }
    });
  } catch (error) {
    logger.error('Error fetching horse:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch horse'
    });
  }
}

/**
 * POST /api/horses/purchase
 * Purchase a new horse
 * Body: { breed: HorseBreed, gender?: HorseGender, name: string }
 */
export async function purchaseHorse(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const locationId = req.character?.currentLocation;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!locationId) {
      res.status(400).json({
        success: false,
        error: 'Character location required'
      });
      return;
    }

    const { breed, gender, name } = req.body;

    if (!breed || !name) {
      res.status(400).json({
        success: false,
        error: 'Breed and name are required'
      });
      return;
    }

    const horse = await HorseService.purchaseHorse(
      new ObjectId(characterId),
      new ObjectId(locationId),
      { breed, gender, name }
    );

    logger.info(`Character ${characterId} purchased horse: ${horse.name} (${horse.breed})`);

    res.status(201).json({
      success: true,
      data: {
        horse: horse.toObject(),
        message: `Successfully purchased ${horse.name}!`
      }
    });
  } catch (error: any) {
    logger.error('Error purchasing horse:', error);
    res.status(error.message?.includes('cannot be purchased') ? 400 : 500).json({
      success: false,
      error: error.message || 'Failed to purchase horse'
    });
  }
}

/**
 * POST /api/horses/:horseId/activate
 * Set a horse as the active mount
 */
export async function activateHorse(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    const horse = await HorseService.setActiveHorse(
      new ObjectId(characterId),
      new ObjectId(horseId)
    );

    res.status(200).json({
      success: true,
      data: {
        horse: horse.toObject(),
        message: `${horse.name} is now your active mount.`
      }
    });
  } catch (error: any) {
    logger.error('Error activating horse:', error);
    res.status(error.message === 'Horse not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to activate horse'
    });
  }
}

/**
 * PATCH /api/horses/:horseId/rename
 * Rename a horse
 * Body: { newName: string }
 */
export async function renameHorse(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;
    const { newName } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    if (!newName || newName.length < 2 || newName.length > 30) {
      res.status(400).json({
        success: false,
        error: 'Name must be 2-30 characters'
      });
      return;
    }

    const horse = await HorseService.renameHorse(
      new ObjectId(characterId),
      { horseId: new ObjectId(horseId), newName }
    );

    res.status(200).json({
      success: true,
      data: {
        horse: horse.toObject(),
        message: `Horse renamed to ${newName}.`
      }
    });
  } catch (error: any) {
    logger.error('Error renaming horse:', error);
    res.status(error.message === 'Horse not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to rename horse'
    });
  }
}

/**
 * POST /api/horses/:horseId/feed
 * Feed a horse
 * Body: { foodQuality: 'basic' | 'quality' | 'premium' }
 */
export async function feedHorse(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;
    const { foodQuality } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    if (!foodQuality) {
      res.status(400).json({
        success: false,
        error: 'Food quality required'
      });
      return;
    }

    const horse = await HorseService.feedHorse(
      new ObjectId(characterId),
      { horseId: new ObjectId(horseId), foodQuality }
    );

    // Update bond
    const activityKey = foodQuality === 'premium' ? 'FEED_PREMIUM' :
                        foodQuality === 'quality' ? 'FEED_QUALITY' : 'FEED_BASIC';
    await HorseBondService.updateBond(new ObjectId(horseId), activityKey);

    res.status(200).json({
      success: true,
      data: {
        horse: horse.toObject(),
        message: `Fed ${horse.name} with ${foodQuality} food.`
      }
    });
  } catch (error: any) {
    logger.error('Error feeding horse:', error);
    res.status(error.message === 'Horse not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to feed horse'
    });
  }
}

/**
 * POST /api/horses/:horseId/groom
 * Groom a horse
 */
export async function groomHorse(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    const horse = await HorseService.groomHorse(
      new ObjectId(characterId),
      { horseId: new ObjectId(horseId) }
    );

    // Update bond
    await HorseBondService.updateBond(new ObjectId(horseId), 'GROOM');

    res.status(200).json({
      success: true,
      data: {
        horse: horse.toObject(),
        message: `Groomed ${horse.name}. Cleanliness improved!`
      }
    });
  } catch (error: any) {
    logger.error('Error grooming horse:', error);
    res.status(error.message === 'Horse not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to groom horse'
    });
  }
}

/**
 * POST /api/horses/:horseId/rest
 * Rest a horse to restore stamina
 * Body: { hours: number }
 */
export async function restHorse(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;
    const { hours } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    if (!hours || hours < 1 || hours > 24) {
      res.status(400).json({
        success: false,
        error: 'Hours must be between 1 and 24'
      });
      return;
    }

    const horse = await HorseService.restHorse(
      new ObjectId(characterId),
      new ObjectId(horseId),
      hours
    );

    res.status(200).json({
      success: true,
      data: {
        horse: horse.toObject(),
        message: `${horse.name} rested for ${hours} hour(s). Stamina restored!`
      }
    });
  } catch (error: any) {
    logger.error('Error resting horse:', error);
    res.status(error.message === 'Horse not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to rest horse'
    });
  }
}

/**
 * POST /api/horses/:horseId/heal
 * Heal a horse
 * Body: { healthAmount: number }
 */
export async function healHorse(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;
    const { healthAmount } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    if (!healthAmount || healthAmount < 1) {
      res.status(400).json({
        success: false,
        error: 'Health amount required and must be positive'
      });
      return;
    }

    const horse = await HorseService.healHorse(
      new ObjectId(characterId),
      new ObjectId(horseId),
      healthAmount
    );

    res.status(200).json({
      success: true,
      data: {
        horse: horse.toObject(),
        message: `${horse.name} healed for ${healthAmount} health.`
      }
    });
  } catch (error: any) {
    logger.error('Error healing horse:', error);
    res.status(error.message === 'Horse not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to heal horse'
    });
  }
}

/**
 * POST /api/horses/:horseId/train
 * Train a horse skill
 * Body: { skill: HorseSkill }
 */
export async function trainHorse(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;
    const { skill } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    if (!skill) {
      res.status(400).json({
        success: false,
        error: 'Skill required'
      });
      return;
    }

    const result = await HorseService.trainHorseSkill(
      new ObjectId(characterId),
      { horseId: new ObjectId(horseId), skill }
    );

    // Update bond from training
    await HorseBondService.updateBond(new ObjectId(horseId), 'TRAIN');

    res.status(200).json({
      success: true,
      data: {
        horse: result.horse.toObject(),
        progress: result.progress,
        completed: result.completed,
        message: result.completed
          ? `${result.horse.name} learned ${skill}!`
          : `Training progress: ${result.progress}%`
      }
    });
  } catch (error: any) {
    logger.error('Error training horse:', error);
    const status = error.message?.includes('already knows') ||
                   error.message?.includes('maximum number') ? 400 :
                   error.message === 'Horse not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to train horse'
    });
  }
}

/**
 * GET /api/horses/:horseId/bond
 * Get bond status and recommendations
 */
export async function getHorseBond(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    const horse = await HorseService.getHorseById(new ObjectId(horseId));

    if (!horse) {
      res.status(404).json({
        success: false,
        error: 'Horse not found'
      });
      return;
    }

    // Verify ownership
    if (horse.ownerId.toString() !== characterId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this horse'
      });
      return;
    }

    // Check for bond decay
    await HorseBondService.checkBondDecay(horseId);

    const bondLevel = HorseBondService.getBondLevel(horse.bond.level);
    const bondBenefits = HorseBondService.getBondBenefits(bondLevel);
    const recommendations = HorseBondService.getBondRecommendations(horse);

    res.status(200).json({
      success: true,
      data: {
        bondLevel: horse.bond.level,
        bondLevelName: bondLevel,
        trust: horse.bond.trust,
        loyalty: horse.bond.loyalty,
        benefits: bondBenefits,
        recommendations,
        lastInteraction: horse.bond.lastInteraction
      }
    });
  } catch (error) {
    logger.error('Error fetching horse bond:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch horse bond'
    });
  }
}

/**
 * POST /api/horses/:horseId/whistle
 * Whistle to call your horse from a distance
 * Body: { distance: number }
 */
export async function whistleForHorse(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;
    const { distance } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    if (distance === undefined || distance < 0) {
      res.status(400).json({
        success: false,
        error: 'Valid distance required'
      });
      return;
    }

    const result = await HorseBondService.whistleForHorse(
      new ObjectId(characterId),
      new ObjectId(horseId),
      distance
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error whistling for horse:', error);
    res.status(error.message === 'Horse not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to whistle for horse'
    });
  }
}

/**
 * GET /api/horses/:horseId/combat-bonus
 * Get mounted combat bonuses for a horse
 */
export async function getHorseCombatBonus(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    const horse = await HorseService.getHorseById(new ObjectId(horseId));

    if (!horse) {
      res.status(404).json({
        success: false,
        error: 'Horse not found'
      });
      return;
    }

    // Verify ownership
    if (horse.ownerId.toString() !== characterId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this horse'
      });
      return;
    }

    const combatBonus = HorseService.getMountedCombatBonus(horse);

    res.status(200).json({
      success: true,
      data: {
        horse: {
          id: horse._id,
          name: horse.name,
          isActive: horse.isActive
        },
        combatBonus
      }
    });
  } catch (error) {
    logger.error('Error fetching horse combat bonus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch horse combat bonus'
    });
  }
}

// ============================================================================
// BREEDING ENDPOINTS
// ============================================================================

/**
 * POST /api/horses/breed
 * Breed two horses together
 * Body: { stallionId: string, mareId: string }
 */
export async function breedHorses(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { stallionId, mareId } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!stallionId || !mareId) {
      res.status(400).json({
        success: false,
        error: 'Stallion ID and Mare ID required'
      });
      return;
    }

    const result = await HorseBreedingService.breedHorses(
      new ObjectId(characterId),
      { stallionId, mareId }
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error breeding horses:', error);
    const status = error.message?.includes('must be') ||
                   error.message?.includes('cannot breed') ? 400 :
                   error.message?.includes('not found') ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to breed horses'
    });
  }
}

/**
 * GET /api/horses/:horseId/lineage
 * Get breeding lineage for a horse
 */
export async function getHorseLineage(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const { horseId } = req.params;

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    const lineage = await HorseBreedingService.getBreedingLineage(new ObjectId(horseId));

    res.status(200).json({
      success: true,
      data: {
        horse: lineage.horse.toObject(),
        sire: lineage.sire?.toObject(),
        dam: lineage.dam?.toObject(),
        foals: lineage.foals.map(f => f.toObject()),
        grandparents: lineage.grandparents
      }
    });
  } catch (error: any) {
    logger.error('Error fetching horse lineage:', error);
    res.status(error.message === 'Horse not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to fetch horse lineage'
    });
  }
}

/**
 * GET /api/horses/:horseId/breeding-recommendations
 * Get breeding recommendations for a horse
 */
export async function getBreedingRecommendations(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { horseId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!horseId || !horseId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        error: 'Valid horse ID required'
      });
      return;
    }

    const recommendations = await HorseBreedingService.getBreedingRecommendations(
      new ObjectId(characterId),
      new ObjectId(horseId)
    );

    res.status(200).json({
      success: true,
      data: {
        targetHorse: recommendations.targetHorse.toObject(),
        bestMatches: recommendations.bestMatches.map(match => ({
          horse: match.horse.toObject(),
          compatibilityScore: match.compatibilityScore,
          predictedStats: match.predictedStats,
          reasons: match.reasons
        }))
      }
    });
  } catch (error: any) {
    logger.error('Error fetching breeding recommendations:', error);
    const status = error.message?.includes('cannot breed') ? 400 :
                   error.message === 'Horse not found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to fetch breeding recommendations'
    });
  }
}
