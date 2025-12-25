/**
 * Workshop Controller
 * Handles all workshop-related HTTP requests
 */

import { Response } from 'express';
import { CharacterRequest } from '../middleware/characterOwnership.middleware';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import * as WorkshopService from '../services/workshop.service';
import { MasterworkService } from '../services/masterwork.service';
import { DollarService } from '../services/dollar.service';
import { CraftedItem } from '../models/CraftedItem.model';
import logger from '../utils/logger';

/**
 * GET /api/workshops/:workshopId
 * Get detailed information about a specific workshop
 */
export async function getWorkshopInfo(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const { workshopId } = req.params;

    if (!workshopId) {
      res.status(400).json({
        success: false,
        error: 'Workshop ID required'
      });
      return;
    }

    const info = WorkshopService.getWorkshopInfo(workshopId);

    if (!info) {
      res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: info
    });
  } catch (error: any) {
    logger.error('Error fetching workshop info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workshop info'
    });
  }
}

/**
 * GET /api/workshops/location/:locationId
 * Get all workshops at a specific location
 */
export async function getLocationWorkshops(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const { locationId } = req.params;

    if (!locationId) {
      res.status(400).json({
        success: false,
        error: 'Location ID required'
      });
      return;
    }

    const workshops = WorkshopService.getLocationWorkshops(locationId as any);

    res.status(200).json({
      success: true,
      data: {
        locationId,
        workshops,
        count: workshops.length
      }
    });
  } catch (error: any) {
    logger.error('Error fetching location workshops:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location workshops'
    });
  }
}

/**
 * GET /api/workshops/profession/:professionId
 * Get workshops that support a specific profession
 */
export async function getWorkshopsByProfession(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { professionId } = req.params;
    const { minTier, location } = req.query;

    if (!professionId) {
      res.status(400).json({
        success: false,
        error: 'Profession ID required'
      });
      return;
    }

    // Get character data for accessibility check
    let accessibleBy;
    if (characterId) {
      const character = await Character.findById(characterId);
      if (character) {
        accessibleBy = {
          level: character.level,
          reputation: character.reputation || {},
          faction: character.faction,
          completedQuests: character.completedQuests || [],
          gold: character.gold,
          inventory: character.inventory
        };
      }
    }

    const workshops = WorkshopService.findWorkshopsForProfession(professionId as any, {
      minTier: minTier ? parseInt(minTier as string) : undefined,
      location: location as any,
      accessibleBy
    });

    res.status(200).json({
      success: true,
      data: {
        professionId,
        workshops,
        count: workshops.length
      }
    });
  } catch (error: any) {
    logger.error('Error fetching workshops by profession:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workshops by profession'
    });
  }
}

/**
 * POST /api/workshops/access
 * Request access to a workshop
 * Body: { workshopId, duration?, membershipType? }
 */
export async function requestAccess(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { workshopId, duration, membershipType } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!workshopId) {
      res.status(400).json({
        success: false,
        error: 'Workshop ID required'
      });
      return;
    }

    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    const accessRequest = {
      workshopId,
      characterId: characterId as any, // ObjectId type
      duration,
      membershipType
    };

    // Build reputation object as Record<string, number>
    const reputationRecord: Record<string, number> = {};
    if (character.reputation?.outlaws) reputationRecord.outlaws = character.reputation.outlaws;
    if (character.reputation?.coalition) reputationRecord.coalition = character.reputation.coalition;
    if (character.reputation?.settlers) reputationRecord.settlers = character.reputation.settlers;

    const characterData = {
      level: character.level,
      reputation: reputationRecord,
      faction: character.faction as string,
      completedQuests: character.completedQuests || [],
      gold: character.gold,
      inventory: character.inventory.map(item => ({ itemId: item.itemId }))
    };

    const response = await WorkshopService.requestWorkshopAccess(accessRequest, characterData);

    if (response.accessGranted && response.cost && response.cost > 0) {
      // Deduct gold if access was granted and has a cost
      await DollarService.deductDollars(
        characterId,
        response.cost,
        TransactionSource.WORKSHOP_ACCESS,
        { workshopId }
      );
      logger.info(`Character ${characterId} gained access to workshop ${workshopId} for ${response.cost} gold`);
    }

    res.status(200).json({
      success: response.success,
      data: response
    });
  } catch (error: any) {
    logger.error('Error requesting workshop access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to request workshop access'
    });
  }
}

/**
 * GET /api/workshops/recommendations
 * Get workshop recommendations for the character
 */
export async function getRecommendations(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    // Build reputation object as Record<string, number>
    const reputationRecord: Record<string, number> = {};
    if (character.reputation?.outlaws) reputationRecord.outlaws = character.reputation.outlaws;
    if (character.reputation?.coalition) reputationRecord.coalition = character.reputation.coalition;
    if (character.reputation?.settlers) reputationRecord.settlers = character.reputation.settlers;

    const characterData = {
      level: character.level,
      reputation: reputationRecord,
      faction: character.faction as string,
      completedQuests: character.completedQuests || [],
      gold: character.gold,
      inventory: character.inventory.map(item => ({ itemId: item.itemId })),
      professions: (character.professions as any) || undefined
    };

    const recommendations = WorkshopService.getWorkshopRecommendations(characterData);

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error: any) {
    logger.error('Error getting workshop recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workshop recommendations'
    });
  }
}

/**
 * GET /api/workshops/best/:professionId
 * Find the best workshop for a profession that the character can access
 */
export async function findBestWorkshop(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { professionId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!professionId) {
      res.status(400).json({
        success: false,
        error: 'Profession ID required'
      });
      return;
    }

    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found'
      });
      return;
    }

    const characterData = {
      level: character.level,
      reputation: character.reputation || {},
      faction: character.faction,
      completedQuests: character.completedQuests || [],
      gold: character.gold,
      inventory: character.inventory
    };

    const bestWorkshop = WorkshopService.findBestWorkshop(professionId as any, characterData);

    if (!bestWorkshop) {
      res.status(404).json({
        success: false,
        error: 'No accessible workshop found for this profession'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { workshop: bestWorkshop }
    });
  } catch (error: any) {
    logger.error('Error finding best workshop:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find best workshop'
    });
  }
}

/**
 * GET /api/workshops/summary
 * Get a summary of all workshops in the game
 */
export async function getAllWorkshopsSummary(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const summary = WorkshopService.getAllWorkshopsSummary();

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    logger.error('Error fetching workshops summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workshops summary'
    });
  }
}

/**
 * GET /api/workshops/quality-tiers
 * Get all quality tier information for masterwork crafting
 */
export async function getQualityTiers(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const tiers = MasterworkService.getAllQualityTiers();

    res.status(200).json({
      success: true,
      data: { tiers }
    });
  } catch (error: any) {
    logger.error('Error fetching quality tiers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quality tiers'
    });
  }
}

/**
 * POST /api/workshops/masterwork/rename
 * Rename a masterwork item
 * Body: { itemId, newName }
 */
export async function renameMasterwork(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { itemId, newName } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!itemId) {
      res.status(400).json({
        success: false,
        error: 'Item ID required'
      });
      return;
    }

    if (!newName || newName.trim().length < 3) {
      res.status(400).json({
        success: false,
        error: 'New name required (minimum 3 characters)'
      });
      return;
    }

    const item = await MasterworkService.renameMasterwork(itemId, characterId, newName);

    logger.info(`Character ${characterId} renamed masterwork item ${itemId} to "${newName}"`);

    res.status(200).json({
      success: true,
      data: { item }
    });
  } catch (error: any) {
    logger.error('Error renaming masterwork:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to rename masterwork item'
    });
  }
}

/**
 * GET /api/workshops/repair/cost/:itemId
 * Calculate repair cost for an item
 */
export async function getRepairCost(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const { itemId } = req.params;
    const { targetPercentage } = req.query;

    if (!itemId) {
      res.status(400).json({
        success: false,
        error: 'Item ID required'
      });
      return;
    }

    const item = await CraftedItem.findById(itemId);
    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Item not found'
      });
      return;
    }

    const percentage = targetPercentage ? parseInt(targetPercentage as string) : 100;
    const cost = MasterworkService.calculateRepairCost(item, percentage);

    res.status(200).json({
      success: true,
      data: {
        itemId,
        currentDurability: item.durability.current,
        maxDurability: item.durability.max,
        targetPercentage: percentage,
        cost
      }
    });
  } catch (error: any) {
    logger.error('Error calculating repair cost:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate repair cost'
    });
  }
}

/**
 * GET /api/workshops/repair/check/:itemId
 * Check if character can repair an item
 */
export async function checkCanRepair(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { itemId } = req.params;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!itemId) {
      res.status(400).json({
        success: false,
        error: 'Item ID required'
      });
      return;
    }

    const result = await MasterworkService.canRepair(characterId, itemId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Error checking repair eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check repair eligibility'
    });
  }
}

/**
 * POST /api/workshops/repair/:itemId
 * Repair an item at a workshop
 * Body: { targetPercentage? }
 */
export async function repairItem(req: CharacterRequest, res: Response): Promise<void> {
  try {
    const characterId = req.characterId || req.character?._id.toString();
    const { itemId } = req.params;
    const { targetPercentage } = req.body;

    if (!characterId) {
      res.status(400).json({
        success: false,
        error: 'Character ID required'
      });
      return;
    }

    if (!itemId) {
      res.status(400).json({
        success: false,
        error: 'Item ID required'
      });
      return;
    }

    // Check if character can repair
    const canRepairResult = await MasterworkService.canRepair(characterId, itemId);
    if (!canRepairResult.canRepair) {
      res.status(400).json({
        success: false,
        error: canRepairResult.reason || 'Cannot repair this item'
      });
      return;
    }

    // Get item and character
    const item = await CraftedItem.findById(itemId);
    const character = await Character.findById(characterId);

    if (!item || !character) {
      res.status(404).json({
        success: false,
        error: 'Item or character not found'
      });
      return;
    }

    // Calculate repair cost
    const percentage = targetPercentage || 100;
    const repairCost = MasterworkService.calculateRepairCost(item, percentage);

    // Check gold
    const currentBalance = character.dollars ?? character.gold ?? 0;
    if (currentBalance < repairCost.gold) {
      res.status(400).json({
        success: false,
        error: `Insufficient gold. Need ${repairCost.gold}, have ${currentBalance}`
      });
      return;
    }

    // Check materials
    for (const material of repairCost.materials) {
      const invItem = character.inventory.find(i => i.itemId === material.itemId);
      if (!invItem || invItem.quantity < material.quantity) {
        res.status(400).json({
          success: false,
          error: `Insufficient ${material.itemId}. Need ${material.quantity}, have ${invItem?.quantity || 0}`
        });
        return;
      }
    }

    // Deduct gold using DollarService
    if (repairCost.gold > 0) {
      await DollarService.deductDollars(
        characterId,
        repairCost.gold,
        TransactionSource.ITEM_REPAIR,
        { itemId }
      );
    }

    // Deduct materials
    for (const material of repairCost.materials) {
      const invItem = character.inventory.find(i => i.itemId === material.itemId);
      if (invItem) {
        invItem.quantity -= material.quantity;
        if (invItem.quantity <= 0) {
          character.inventory = character.inventory.filter(i => i.itemId !== material.itemId);
        }
      }
    }

    // Repair item
    const repairAmount = Math.floor((item.durability.max * percentage) / 100);
    item.durability.current = Math.min(item.durability.max, repairAmount);
    if (item.isBroken && item.durability.current > 0) {
      item.isBroken = false;
    }

    await character.save();
    await item.save();

    logger.info(`Character ${characterId} repaired item ${itemId} to ${percentage}%`);

    res.status(200).json({
      success: true,
      data: {
        item,
        goldSpent: repairCost.gold,
        materialsUsed: repairCost.materials
      }
    });
  } catch (error: any) {
    logger.error('Error repairing item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to repair item'
    });
  }
}
