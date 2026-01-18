/**
 * Crafting Service
 * Phase 7, Wave 7.1 - Desperados Destiny
 *
 * Core crafting logic: XP calculation, quality determination, recipe management
 */

import mongoose from 'mongoose';
import {
  ProfessionId,
  CraftingSkillTier,
  CraftingQuality,
  CraftingToolQuality,
  CharacterStat,
  CraftItemRequest,
  CraftItemResponse,
  CraftedItem,
  XPCalculation,
  QualityCalculation,
  CraftingValidation,
  ProfessionLevelUp,
  LearnRecipeRequest,
  LearnRecipeResponse,
  SpecializationRequest,
  SpecializationResponse,
  CraftingRecipe,
  RecipeDiscovery,
  SkillCategory,
  calculateCategoryMultiplier,
  SKILLS,
  LocationCraftingFacility,
  CraftingFacilityType,
} from '@desperados/shared';
import { Location } from '../models/Location.model';
import { UnlockEnforcementService } from './unlockEnforcement.service';
import { DollarService } from './dollar.service';
import CraftingProfile, { ICraftingProfile } from '../models/CraftingProfile.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { getProfession, SKILL_TIERS } from '../data/professionDefinitions';
import { ALL_RECIPES } from '../data/recipes';
import { SecureRNG } from './base/SecureRNG';
import { safeAchievementUpdate } from '../utils/achievementUtils';

// ============================================================================
// HELPER: Normalize recipe ingredients/materials to common format
// ============================================================================

interface NormalizedIngredient {
  itemId: string;
  quantity: number;
}

/**
 * Normalizes recipe materials/ingredients to a common format
 * Handles both old schema (ingredients) and new schema (materials)
 */
function normalizeRecipeIngredients(recipe: any): NormalizedIngredient[] {
  // If recipe has ingredients array (old schema / MongoDB Recipe model)
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    return recipe.ingredients.map((ing: any) => ({
      itemId: ing.itemId,
      quantity: ing.quantity
    }));
  }

  // If recipe has materials array (new schema / CraftingRecipe type)
  if (recipe.materials && Array.isArray(recipe.materials)) {
    return recipe.materials.map((mat: any) => ({
      itemId: mat.materialId || mat.itemId,
      quantity: mat.quantity
    }));
  }

  return [];
}

// ============================================================================
// CRAFTING SERVICE CLASS
// ============================================================================

export class CraftingService {
  /**
   * Get the highest craft skill level for a character
   * Used to determine the craft category multiplier
   *
   * BALANCE FIX (Phase 4.1): Skill unlock bonuses are now multiplicative
   */
  static getHighestCraftSkillLevel(character: any): number {
    if (!character.skills) return 0;

    let highestLevel = 0;

    for (const skill of character.skills) {
      // Check if this is a CRAFT category skill
      const skillDef = SKILLS[skill.skillId.toUpperCase()];
      if (skillDef && skillDef.category === SkillCategory.CRAFT) {
        highestLevel = Math.max(highestLevel, skill.level);
      }
    }

    return highestLevel;
  }

  /**
   * Get the craft category multiplier for a character
   * Higher multiplier = better quality items
   *
   * BALANCE FIX (Phase 4.1): Multiplicative bonuses
   * - Level 15: ×1.05 (Efficient Crafter)
   * - Level 30: ×1.10 (Master Efficiency)
   * - Level 45: ×1.15 (Expert Craftsman)
   * - Combined: ×1.328 at level 45+
   */
  static getCraftCategoryMultiplier(character: any): number {
    const highestLevel = this.getHighestCraftSkillLevel(character);
    return calculateCategoryMultiplier(highestLevel, 'CRAFT');
  }

  /**
   * Map recipe minimum level to crafting tier name
   * Used for CRAFT skill unlock enforcement
   */
  private static getRecipeTier(minLevel: number): string {
    if (minLevel >= 50) return 'legendary';
    if (minLevel >= 45) return 'epic';
    if (minLevel >= 40) return 'rare';
    if (minLevel >= 25) return 'weapon'; // Covers weapon/armor tier
    if (minLevel >= 10) return 'intermediate';
    return 'basic';
  }

  /**
   * Validate that the player's current location has the required crafting facility
   * Returns { valid, facility?, error? }
   */
  static async validateLocationFacility(
    characterLocationId: string,
    requiredFacility?: { type: CraftingFacilityType; tier: number; optional?: boolean }
  ): Promise<{
    valid: boolean;
    facility?: LocationCraftingFacility;
    error?: string;
    locationName?: string;
  }> {
    // If no facility required, always valid
    if (!requiredFacility || requiredFacility.optional) {
      return { valid: true };
    }

    // Get the character's current location
    const location = await Location.findById(characterLocationId);
    if (!location) {
      return {
        valid: false,
        error: 'Could not determine your current location',
      };
    }

    // Check if location has craftingFacilities
    if (!location.craftingFacilities || location.craftingFacilities.length === 0) {
      return {
        valid: false,
        error: `${location.name} has no crafting facilities`,
        locationName: location.name,
      };
    }

    // Find a matching facility of the required type
    const matchingFacility = location.craftingFacilities.find(
      (f) => f.type === requiredFacility.type
    );

    if (!matchingFacility) {
      return {
        valid: false,
        error: `${location.name} does not have a ${requiredFacility.type}. Travel to a location with the required facility.`,
        locationName: location.name,
      };
    }

    // Check tier requirement
    if (matchingFacility.tier < requiredFacility.tier) {
      return {
        valid: false,
        error: `${location.name}'s ${matchingFacility.name} is tier ${matchingFacility.tier}, but this recipe requires tier ${requiredFacility.tier}`,
        locationName: location.name,
        facility: matchingFacility,
      };
    }

    // Valid facility found
    return {
      valid: true,
      facility: matchingFacility,
      locationName: location.name,
    };
  }

  /**
   * Get crafting facilities available at a location
   */
  static async getLocationFacilities(
    locationId: string
  ): Promise<LocationCraftingFacility[]> {
    const location = await Location.findById(locationId);
    if (!location) {
      return [];
    }
    return location.craftingFacilities || [];
  }

  /**
   * Get or create crafting profile for a character
   */
  static async getProfile(characterId: mongoose.Types.ObjectId): Promise<ICraftingProfile> {
    let profile = await CraftingProfile.findOne({ characterId });

    if (!profile) {
      profile = await CraftingProfile.create({
        characterId,
        professions: new Map(),
        specializations: [],
        craftingStats: {
          totalCrafts: 0,
          totalCriticals: 0,
          totalMasterworks: 0,
          totalLegendaries: 0,
          goldEarned: 0,
          goldSpent: 0,
          materialsUsed: new Map()
        },
        unlockedRecipes: [],
        facilities: [],
        reputation: new Map()
      });
    }

    return profile;
  }

  /**
   * Validate if a character can craft a recipe
   */
  static async validateCrafting(
    characterId: mongoose.Types.ObjectId,
    recipe: CraftingRecipe,
    quantity: number
  ): Promise<CraftingValidation> {
    const validation: CraftingValidation = {
      canCraft: true,
      errors: [],
      warnings: [],
      requirements: {
        hasProfession: false,
        meetsLevelRequirement: false,
        hasMaterials: false,
        hasFacility: false,
        hasEnergy: false,
        hasInventorySpace: false
      }
    };

    try {
      // Get character and profile
      const character = await Character.findById(characterId);
      if (!character) {
        validation.errors.push('Character not found');
        validation.canCraft = false;
        return validation;
      }

      const profile = await this.getProfile(characterId);

      // Check profession and level
      const profession = profile.professions.get(recipe.professionId);
      if (!profession) {
        validation.errors.push(`You don't have the ${recipe.professionId} profession`);
        validation.canCraft = false;
      } else {
        validation.requirements.hasProfession = true;

        if (profession.level < recipe.requirements.minLevel) {
          validation.errors.push(
            `Requires ${recipe.professionId} level ${recipe.requirements.minLevel} (you are ${profession.level})`
          );
          validation.canCraft = false;
        } else {
          validation.requirements.meetsLevelRequirement = true;
        }
      }

      // Check CRAFT skill level requirement based on recipe tier
      // Map recipe minLevel to CRAFT skill tiers: 1=basic, 10=intermediate, 25=weapon, 40=rare, 50=legendary
      const recipeTier = this.getRecipeTier(recipe.requirements.minLevel);
      const craftCheck = UnlockEnforcementService.checkCraftTierForCharacter(character, recipeTier);
      if (!craftCheck.allowed) {
        validation.errors.push(craftCheck.error || `Requires higher CRAFT skill level`);
        validation.canCraft = false;
      }

      // Check recipe learned
      if (!profile.hasRecipe(recipe.id)) {
        validation.errors.push('You have not learned this recipe');
        validation.canCraft = false;
      }

      // PHASE 4 FIX: Actually check materials in inventory (was hardcoded to true)
      // Use normalized ingredients to handle both schema formats
      const normalizedIngredients = normalizeRecipeIngredients(recipe);
      const missingMaterials: string[] = [];
      for (const ingredient of normalizedIngredients) {
        const totalNeeded = ingredient.quantity * quantity;
        const inventoryItem = character.inventory.find(i => i.itemId === ingredient.itemId);
        if (!inventoryItem || inventoryItem.quantity < totalNeeded) {
          missingMaterials.push(
            `${ingredient.itemId}: need ${totalNeeded}, have ${inventoryItem?.quantity || 0}`
          );
        }
      }

      if (missingMaterials.length > 0) {
        validation.errors.push(`Missing materials: ${missingMaterials.join('; ')}`);
        validation.canCraft = false;
      } else {
        validation.requirements.hasMaterials = true;
      }

      // Check facility requirements - now validates against current location's facilities
      if (recipe.requirements.facility && !recipe.requirements.facility.optional) {
        // First check if character's profile has the facility (personal crafting station)
        const personalFacility = profile.getFacility(recipe.requirements.facility.type);

        // Also check if the current location has the required facility
        const locationValidation = await this.validateLocationFacility(
          character.currentLocation,
          recipe.requirements.facility
        );

        if (personalFacility) {
          // Player has personal facility
          if (personalFacility.tier >= recipe.requirements.facility.tier) {
            validation.requirements.hasFacility = true;
          } else {
            validation.errors.push(
              `Your ${recipe.requirements.facility.type} is tier ${personalFacility.tier}, but this recipe requires tier ${recipe.requirements.facility.tier}`
            );
            validation.canCraft = false;
          }
        } else if (locationValidation.valid) {
          // Location has the facility
          validation.requirements.hasFacility = true;
          if (locationValidation.facility?.usageFee) {
            validation.warnings.push(
              `Using ${locationValidation.facility.name} at ${locationValidation.locationName} - usage fee: $${locationValidation.facility.usageFee}`
            );
          }
        } else {
          // Neither personal nor location facility available
          validation.errors.push(
            locationValidation.error || `Requires ${recipe.requirements.facility.type} (tier ${recipe.requirements.facility.tier})`
          );
          validation.canCraft = false;
        }
      } else {
        validation.requirements.hasFacility = true;
      }

      // PHASE 4 FIX: Energy check - crafting doesn't have energy cost in recipe schema
      // Mark as true since it's not a crafting requirement
      validation.requirements.hasEnergy = true;

      // PHASE 4 FIX: Check inventory space for output items
      const outputQuantity = (recipe.output?.baseQuantity || 1) * quantity;
      const existingItem = character.inventory.find(i => i.itemId === recipe.output?.itemId);
      const MAX_STACK_SIZE = 999; // Maximum stack size per item
      const MAX_INVENTORY_SLOTS = 100; // Maximum inventory slots

      if (existingItem) {
        // Check if adding to existing stack would exceed max
        if (existingItem.quantity + outputQuantity > MAX_STACK_SIZE) {
          validation.errors.push(
            `Not enough inventory space: ${recipe.output.itemName || recipe.output.itemId} stack would exceed ${MAX_STACK_SIZE}`
          );
          validation.canCraft = false;
        } else {
          validation.requirements.hasInventorySpace = true;
        }
      } else {
        // Check if we have room for a new slot
        if (character.inventory.length >= MAX_INVENTORY_SLOTS) {
          validation.errors.push('Inventory is full - no room for new item');
          validation.canCraft = false;
        } else {
          validation.requirements.hasInventorySpace = true;
        }
      }

      // Warnings
      if (profession && profession.level > recipe.difficulty + 20) {
        validation.warnings.push(
          'This recipe is too easy for your skill level - you will gain minimal XP'
        );
      }

    } catch (error) {
      validation.errors.push(`Validation error: ${error}`);
      validation.canCraft = false;
    }

    return validation;
  }

  /**
   * Craft an item - simplified version using recipeId from database
   */
  static async craftItem(characterId: string, recipeId: string): Promise<any>;
  /**
   * Craft an item - full version with CraftItemRequest and CraftingRecipe
   */
  static async craftItem(
    characterId: mongoose.Types.ObjectId,
    request: CraftItemRequest,
    recipe: CraftingRecipe
  ): Promise<CraftItemResponse>;
  /**
   * Craft an item - implementation
   */
  static async craftItem(
    characterId: string | mongoose.Types.ObjectId,
    requestOrRecipeId: CraftItemRequest | string,
    recipe?: CraftingRecipe
  ): Promise<CraftItemResponse | any> {
    // Handle the simplified version (characterId, recipeId)
    if (typeof requestOrRecipeId === 'string') {
      const Character = (await import('../models/Character.model')).Character;

      // FIX: Look up recipe from static ALL_RECIPES data instead of MongoDB
      // The static recipes use 'id' field, not 'recipeId'
      const recipeDoc = ALL_RECIPES.find(r => r.id === requestOrRecipeId);
      if (!recipeDoc) {
        return {
          success: false,
          error: 'Recipe not found'
        };
      }

      const character = await Character.findById(characterId);
      if (!character) {
        return {
          success: false,
          error: 'Character not found'
        };
      }

      // Check if can craft
      const canCraftResult = await this.canCraft(characterId as string, requestOrRecipeId);
      if (!canCraftResult.canCraft) {
        return {
          success: false,
          error: canCraftResult.reason
        };
      }

      // Check materials in inventory
      for (const mat of recipeDoc.materials) {
        const inventoryItem = character.inventory.find(i => i.itemId === mat.materialId);
        if (!inventoryItem || inventoryItem.quantity < mat.quantity) {
          return {
            success: false,
            error: `Insufficient materials: ${mat.materialId} (need ${mat.quantity}, have ${inventoryItem?.quantity || 0})`
          };
        }
      }

      // Deduct materials from inventory
      for (const mat of recipeDoc.materials) {
        const inventoryItem = character.inventory.find(i => i.itemId === mat.materialId);
        if (inventoryItem) {
          inventoryItem.quantity -= mat.quantity;
          if (inventoryItem.quantity <= 0) {
            character.inventory = character.inventory.filter(i => i.itemId !== mat.materialId);
          }
        }
      }

      // Add crafted item to inventory
      const outputQuantity = recipeDoc.output.baseQuantity || 1;
      const existingItem = character.inventory.find(i => i.itemId === recipeDoc.output.itemId);
      if (existingItem) {
        existingItem.quantity += outputQuantity;
      } else {
        character.inventory.push({
          itemId: recipeDoc.output.itemId,
          quantity: outputQuantity,
          acquiredAt: new Date()
        });
      }

      // Save character - try with transaction first, fall back to direct save for non-replica MongoDB
      try {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          await character.save({ session });
          await session.commitTransaction();
        } catch (txError: any) {
          await session.abortTransaction();
          // If transaction fails due to non-replica set, save without transaction
          if (txError.message?.includes('Transaction numbers are only allowed')) {
            await character.save();
          } else {
            throw txError;
          }
        } finally {
          session.endSession();
        }
      } catch (sessionError: any) {
        // If session creation fails, save without transaction
        if (sessionError.message?.includes('Transaction') || sessionError.message?.includes('replica')) {
          await character.save();
        } else {
          return {
            success: false,
            error: `Crafting failed: ${sessionError}`
          };
        }
      }

      return {
        success: true,
        itemsCrafted: [{
          itemId: recipeDoc.output.itemId,
          quantity: outputQuantity,
          quality: 'common'
        }],
        xpGained: recipeDoc.xpGain || 10,
        timeTaken: recipeDoc.baseCraftTime || 5
      };
    }

    // Handle the full version (characterId, request, recipe)
    const request = requestOrRecipeId as CraftItemRequest;
    const craftingRecipe = recipe as CraftingRecipe;
    const charId = characterId as mongoose.Types.ObjectId;
    const response: CraftItemResponse = {
      success: false,
      itemsCrafted: [],
      xpGained: 0,
      materialCosts: craftingRecipe.materials,
      goldCost: 0,
      timeTaken: 0,
      criticalSuccess: false,
      message: ''
    };

    try {
      // Validate crafting
      const validation = await this.validateCrafting(charId, craftingRecipe, request.quantity);
      if (!validation.canCraft) {
        response.message = validation.errors.join(', ');
        return response;
      }

      // Get character and profile
      const character = await Character.findById(charId);
      if (!character) {
        response.message = 'Character not found';
        return response;
      }

      const profile = await this.getProfile(charId);
      const profession = profile.professions.get(craftingRecipe.professionId);
      if (!profession) {
        response.message = 'Profession not found';
        return response;
      }

      // Check materials in inventory (normalized for both schema formats)
      const normalizedMaterials = normalizeRecipeIngredients(craftingRecipe);
      for (const ingredient of normalizedMaterials) {
        const totalNeeded = ingredient.quantity * request.quantity;
        const inventoryItem = character.inventory.find(i => i.itemId === ingredient.itemId);
        if (!inventoryItem || inventoryItem.quantity < totalNeeded) {
          response.message = `Insufficient materials: ${ingredient.itemId} (need ${totalNeeded}, have ${inventoryItem?.quantity || 0})`;
          return response;
        }
      }

      // Calculate quality (before transaction - no DB writes)
      const qualityCalc = this.calculateQuality(
        character,
        profile,
        craftingRecipe,
        request.toolQuality || CraftingToolQuality.BASIC
      );

      // Calculate XP (before transaction - no DB writes)
      const xpCalc = this.calculateXP(
        profile,
        craftingRecipe,
        profession.level,
        request.toolQuality || CraftingToolQuality.BASIC
      );

      // Create crafted items (before transaction - no DB writes)
      const items: CraftedItem[] = [];
      for (let i = 0; i < request.quantity; i++) {
        const item: CraftedItem = {
          itemId: craftingRecipe.output.itemId,
          itemName: craftingRecipe.output.itemName,
          quantity: craftingRecipe.output.baseQuantity,
          quality: qualityCalc.resultingQuality,
          statModifier: qualityCalc.statMultiplier,
          durability: 100,
          createdBy: charId,
          createdDate: new Date()
        };

        // Add signature for masters
        if (profession.tier === CraftingSkillTier.MASTER || profession.tier === CraftingSkillTier.GRANDMASTER) {
          item.signature = character.name;
        }

        items.push(item);
      }

      // ===== BEGIN TRANSACTION: All DB writes are atomic =====
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Deduct materials from inventory
        for (const ingredient of normalizedMaterials) {
          const totalNeeded = ingredient.quantity * request.quantity;
          const inventoryItem = character.inventory.find(i => i.itemId === ingredient.itemId);
          if (inventoryItem) {
            inventoryItem.quantity -= totalNeeded;
            if (inventoryItem.quantity <= 0) {
              character.inventory = character.inventory.filter(i => i.itemId !== ingredient.itemId);
            }
          }
        }

        // Add XP to profession
        const totalXP = xpCalc.totalXP * request.quantity;
        const oldLevel = profession.level;
        const oldTier = profession.tier;

        await profile.addProfessionXP(craftingRecipe.professionId, totalXP);

        // Update crafting stats
        profile.craftingStats.totalCrafts += request.quantity;
        if (qualityCalc.resultingQuality === CraftingQuality.MASTERWORK) {
          profile.craftingStats.totalMasterworks += request.quantity;
        }
        if (qualityCalc.resultingQuality === CraftingQuality.LEGENDARY) {
          profile.craftingStats.totalLegendaries += request.quantity;
        }
        if (qualityCalc.criticalChance > 0) {
          profile.craftingStats.totalCriticals += 1;
          response.criticalSuccess = true;
        }

        // Track materials used
        for (const ingredient of normalizedMaterials) {
          const currentUsed = profile.craftingStats.materialsUsed.get(ingredient.itemId) || 0;
          profile.craftingStats.materialsUsed.set(
            ingredient.itemId,
            currentUsed + (ingredient.quantity * request.quantity)
          );
        }

        // Add crafted items to character inventory
        const totalItemsToAdd = craftingRecipe.output.baseQuantity * request.quantity;
        const existingItem = character.inventory.find(i => i.itemId === craftingRecipe.output.itemId);
        if (existingItem) {
          existingItem.quantity += totalItemsToAdd;
        } else {
          character.inventory.push({
            itemId: craftingRecipe.output.itemId,
            quantity: totalItemsToAdd,
            acquiredAt: new Date()
          });
        }

        // Save both character and profile within transaction
        await character.save({ session });
        await profile.save({ session });

        // Commit the transaction
        await session.commitTransaction();

        // Get updated profession data (after commit)
        const updatedProfession = profile.professions.get(craftingRecipe.professionId);
        const newLevel = updatedProfession?.level || oldLevel;
        const newTier = updatedProfession?.tier || oldTier;

        // Achievement tracking (outside transaction - fire-and-forget)
        const characterIdStr = charId.toString();
        safeAchievementUpdate(characterIdStr, 'first_craft', request.quantity, 'crafting:craft');
        safeAchievementUpdate(characterIdStr, 'crafter_10', request.quantity, 'crafting:craft');
        safeAchievementUpdate(characterIdStr, 'crafter_50', request.quantity, 'crafting:craft');
        safeAchievementUpdate(characterIdStr, 'crafter_100', request.quantity, 'crafting:craft');

        // Track high-quality crafts (masterwork or legendary)
        if (qualityCalc.resultingQuality === CraftingQuality.MASTERWORK ||
            qualityCalc.resultingQuality === CraftingQuality.LEGENDARY) {
          safeAchievementUpdate(characterIdStr, 'quality_crafter', request.quantity, 'crafting:quality');
        }

        // Calculate time
        const baseTime = craftingRecipe.baseCraftTime;
        const toolMultiplier = this.getToolSpeedMultiplier(request.toolQuality || CraftingToolQuality.BASIC);
        const timeTaken = (baseTime / toolMultiplier) * request.quantity;

        // Build success response
        response.success = true;
        response.itemsCrafted = items;
        response.xpGained = totalXP;
        response.timeTaken = timeTaken;
        response.message = `Successfully crafted ${request.quantity}x ${craftingRecipe.name}`;

        if (newLevel > oldLevel) {
          response.newLevel = newLevel;
          response.message += ` - Level up! You are now ${craftingRecipe.professionId} level ${newLevel}`;
        }

        if (newTier !== oldTier) {
          response.newTier = newTier;
          response.message += ` - You are now a ${newTier}!`;
        }
      } catch (txError) {
        // Abort transaction on any error - no materials lost, no items created
        await session.abortTransaction();
        response.message = `Crafting failed (transaction rolled back): ${txError}`;
      } finally {
        session.endSession();
      }
      // ===== END TRANSACTION =====

    } catch (error) {
      response.message = `Crafting failed: ${error}`;
    }

    return response;
  }

  /**
   * Learn a new recipe
   */
  static async learnRecipe(
    characterId: mongoose.Types.ObjectId,
    request: LearnRecipeRequest,
    recipe: CraftingRecipe
  ): Promise<LearnRecipeResponse> {
    const response: LearnRecipeResponse = {
      success: false,
      recipeId: request.recipeId,
      recipeName: recipe.name,
      message: ''
    };

    try {
      const profile = await this.getProfile(characterId);

      // Check if already known
      if (profile.hasRecipe(recipe.id)) {
        response.message = 'You already know this recipe';
        return response;
      }

      // Check profession level
      const profession = profile.professions.get(recipe.professionId);
      if (!profession) {
        response.message = `You need to learn ${recipe.professionId} first`;
        return response;
      }

      if (profession.level < recipe.requirements.minLevel) {
        response.message = `Requires ${recipe.professionId} level ${recipe.requirements.minLevel}`;
        return response;
      }

      // PHASE 4 FIX: Deduct learning cost if applicable
      if (recipe.learningCost && recipe.learningCost > 0) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          await DollarService.deductDollars(
            characterId.toString(),
            recipe.learningCost,
            TransactionSource.RECIPE_LEARNING,
            {
              recipeId: recipe.id,
              recipeName: recipe.name,
              professionId: recipe.professionId
            },
            session
          );

          // Learn the recipe only after successful payment
          await profile.learnRecipe(recipe.id);
          await session.commitTransaction();

          response.success = true;
          response.message = `You have learned how to craft ${recipe.name}`;
        } catch (costError) {
          await session.abortTransaction();
          response.message = `Insufficient funds to learn this recipe (costs $${recipe.learningCost})`;
          return response;
        } finally {
          session.endSession();
        }
      } else {
        // Free recipe - no cost
        await profile.learnRecipe(recipe.id);

        response.success = true;
        response.message = `You have learned how to craft ${recipe.name}`;
      }

    } catch (error) {
      response.message = `Failed to learn recipe: ${error}`;
    }

    return response;
  }

  /**
   * Add or change specialization
   */
  static async setSpecialization(
    characterId: mongoose.Types.ObjectId,
    request: SpecializationRequest
  ): Promise<SpecializationResponse> {
    const response: SpecializationResponse = {
      success: false,
      specializations: [],
      message: ''
    };

    try {
      const profile = await this.getProfile(characterId);

      if (!request.confirm) {
        const existing = profile.specializations[request.slot];
        if (existing) {
          response.warning = `This will replace your ${existing} specialization. Set confirm: true to proceed.`;
          response.specializations = profile.specializations;
          return response;
        }
      }

      // Check if can specialize
      if (!profile.canSpecialize(request.professionId)) {
        response.message = 'Requires profession level 50 or higher to specialize';
        return response;
      }

      // Add specialization
      await profile.addSpecialization(request.professionId, request.slot);

      response.success = true;
      response.specializations = profile.specializations;
      response.message = `You are now specialized in ${request.professionId}!`;

    } catch (error) {
      response.message = `Failed to set specialization: ${error}`;
    }

    return response;
  }

  // ============================================================================
  // CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate XP gained from crafting
   */
  private static calculateXP(
    profile: ICraftingProfile,
    recipe: CraftingRecipe,
    currentLevel: number,
    toolQuality: CraftingToolQuality
  ): XPCalculation {
    const baseXP = recipe.xpGain;

    // Difficulty modifier
    const levelDiff = recipe.difficulty - currentLevel;
    let difficultyModifier = 1.0;

    if (levelDiff > 10) {
      // Orange - hard recipe
      difficultyModifier = 1.5;
    } else if (levelDiff > 0) {
      // Yellow - appropriate
      difficultyModifier = 1.2;
    } else if (levelDiff > -10) {
      // Green - easy
      difficultyModifier = 1.0;
    } else {
      // Gray - trivial
      difficultyModifier = 0.1;
    }

    // Green penalty (crafting below level)
    const greenModifier = levelDiff < -10 ? 0.1 : 1.0;

    // Orange bonus (crafting above level)
    const orangeModifier = levelDiff > 10 ? 1.5 : 1.0;

    // Specialization bonus
    const isSpecialized = profile.isSpecialized(recipe.professionId);
    const specializationBonus = isSpecialized ? 1.25 : 1.0;

    // Tool bonus
    const toolBonus = this.getToolXPMultiplier(toolQuality);

    // Facility bonus (simplified)
    const facilityBonus = 1.0;

    // Calculate total
    const totalXP = Math.floor(
      baseXP *
      difficultyModifier *
      specializationBonus *
      toolBonus *
      facilityBonus
    );

    return {
      baseXP,
      difficultyModifier,
      greenModifier,
      orangeModifier,
      specializationBonus,
      toolBonus,
      facilityBonus,
      totalXP
    };
  }

  /**
   * Calculate item quality from crafting
   */
  private static calculateQuality(
    character: any,
    profile: ICraftingProfile,
    recipe: CraftingRecipe,
    toolQuality: CraftingToolQuality
  ): QualityCalculation {
    const profession = profile.professions.get(recipe.professionId);
    if (!profession) {
      throw new Error('Profession not found');
    }

    // Get profession definition
    const professionDef = getProfession(recipe.professionId);
    if (!professionDef) {
      throw new Error('Profession definition not found');
    }

    // Base chance (50% for common quality)
    const baseChance = 500; // Out of 1000

    // Skill modifier (higher level = better quality)
    const skillModifier = profession.level * 3; // +3 per level, max +300

    // Primary stat modifier
    const primaryStatValue = character[professionDef.primaryStat] || 10;
    const statModifier = (primaryStatValue - 10) * 5; // +5 per point above 10

    // Tool modifier
    const toolModifier = this.getToolQualityBonus(toolQuality);

    // Facility modifier (simplified)
    const facilityModifier = 0;

    // Specialization bonus
    const isSpecialized = profile.isSpecialized(recipe.professionId);
    const specializationBonus = isSpecialized ? 100 : 0; // +10% if specialized

    // BALANCE FIX (Phase 4.1): Apply craft category multiplier
    // Higher CRAFT skills = better quality items
    // Multiplier is converted to a bonus: (1.328 - 1) * 1000 = +328 points
    const craftMultiplier = this.getCraftCategoryMultiplier(character);
    const categoryBonus = Math.floor((craftMultiplier - 1) * 1000);

    // Critical chance
    const criticalChance = Math.min(25, profession.level / 4); // Max 25%

    // Final roll (1-1000)
    const finalRoll = Math.floor(
      baseChance +
      skillModifier +
      statModifier +
      toolModifier +
      facilityModifier +
      specializationBonus +
      categoryBonus
    );

    // Determine quality
    let resultingQuality: CraftingQuality;
    let statMultiplier: number;

    // Critical success check
    const critRoll = SecureRNG.d100();
    const isCritical = critRoll < criticalChance;

    if (finalRoll >= 900 || isCritical) {
      resultingQuality = CraftingQuality.LEGENDARY;
      statMultiplier = 1.5;
    } else if (finalRoll >= 800) {
      resultingQuality = CraftingQuality.MASTERWORK;
      statMultiplier = 1.3;
    } else if (finalRoll >= 700) {
      resultingQuality = CraftingQuality.EXCELLENT;
      statMultiplier = 1.1;
    } else if (finalRoll >= 600) {
      resultingQuality = CraftingQuality.GOOD;
      statMultiplier = 0.95;
    } else if (finalRoll >= 400) {
      resultingQuality = CraftingQuality.COMMON;
      statMultiplier = 0.8;
    } else {
      resultingQuality = CraftingQuality.POOR;
      statMultiplier = 0.6;
    }

    return {
      baseChance,
      skillModifier,
      statModifier,
      toolModifier,
      facilityModifier,
      specializationBonus,
      criticalChance,
      finalRoll,
      resultingQuality,
      statMultiplier
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get speed multiplier for tool quality
   */
  private static getToolSpeedMultiplier(quality: CraftingToolQuality): number {
    switch (quality) {
      case CraftingToolQuality.LEGENDARY: return 3.0;
      case CraftingToolQuality.MASTERWORK: return 2.0;
      case CraftingToolQuality.FINE: return 1.5;
      case CraftingToolQuality.GOOD: return 1.2;
      case CraftingToolQuality.BASIC:
      default: return 1.0;
    }
  }

  /**
   * Get XP multiplier for tool quality
   */
  private static getToolXPMultiplier(quality: CraftingToolQuality): number {
    switch (quality) {
      case CraftingToolQuality.LEGENDARY: return 1.3;
      case CraftingToolQuality.MASTERWORK: return 1.2;
      case CraftingToolQuality.FINE: return 1.1;
      case CraftingToolQuality.GOOD: return 1.05;
      case CraftingToolQuality.BASIC:
      default: return 1.0;
    }
  }

  /**
   * Get quality bonus for tool quality (in points)
   */
  private static getToolQualityBonus(quality: CraftingToolQuality): number {
    switch (quality) {
      case CraftingToolQuality.LEGENDARY: return 300; // +30%
      case CraftingToolQuality.MASTERWORK: return 200; // +20%
      case CraftingToolQuality.FINE: return 100; // +10%
      case CraftingToolQuality.GOOD: return 50; // +5%
      case CraftingToolQuality.BASIC:
      default: return 0;
    }
  }

  /**
   * Get tier for a given level
   */
  static getTierForLevel(level: number): CraftingSkillTier {
    const tier = SKILL_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel);
    return tier?.tier || CraftingSkillTier.NOVICE;
  }

  /**
   * Calculate XP required for a specific level
   */
  static calculateXPForLevel(level: number): number {
    if (level >= 100) return 0;

    const tier = this.getTierForLevel(level);
    const tierDef = SKILL_TIERS.find(t => t.tier === tier);
    const multiplier = tierDef?.xpMultiplier || 1.0;

    // Base formula: 100 * level^1.5 * tier multiplier
    return Math.floor(100 * Math.pow(level, 1.5) * multiplier);
  }

  /**
   * Get all recipes for a profession up to a certain level
   */
  static getAvailableRecipesForProfession(
    professionId: ProfessionId,
    level: number
  ): string[] {
    // This would query a recipe database
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Get all available recipes for a character
   * Uses static ALL_RECIPES data instead of database queries
   */
  static async getAvailableRecipes(characterId: string): Promise<any[]> {
    const Character = (await import('../models/Character.model')).Character;

    const character = await Character.findById(characterId);
    if (!character) {
      return [];
    }

    // Use static ALL_RECIPES from data files
    // Filter by character's skill levels and profession requirements
    return ALL_RECIPES.filter(recipe => {
      const minLevel = recipe.requirements?.minLevel ?? 0;

      // Get the profession skill level for this recipe
      const professionId = recipe.professionId;
      if (professionId) {
        // Map profession to skill ID (professions use same IDs as skills)
        const characterSkillLevel = character.getSkillLevel(professionId);
        return characterSkillLevel >= minLevel;
      }

      // No profession requirement - available to all
      return true;
    }).map(recipe => ({
      // Transform to match expected API response format
      recipeId: recipe.id,
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      profession: recipe.professionId,
      ingredients: recipe.materials.map(m => ({
        itemId: m.materialId,
        quantity: m.quantity
      })),
      output: {
        itemId: recipe.output.itemId,
        quantity: recipe.output.baseQuantity
      },
      skillRequired: {
        skillId: recipe.professionId,
        level: recipe.requirements?.minLevel ?? 1
      },
      craftTime: recipe.baseCraftTime,
      xpReward: recipe.xpGain ?? 10,
      isUnlocked: true
    }));
  }

  /**
   * Get recipes by category
   * Uses static ALL_RECIPES data
   */
  static async getRecipesByCategory(category: string): Promise<any[]> {
    return ALL_RECIPES.filter(recipe => recipe.category === category).map(recipe => ({
      recipeId: recipe.id,
      name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      profession: recipe.professionId,
      ingredients: recipe.materials.map(m => ({
        itemId: m.materialId,
        quantity: m.quantity
      })),
      output: {
        itemId: recipe.output.itemId,
        quantity: recipe.output.baseQuantity
      },
      skillRequired: {
        skillId: recipe.professionId,
        level: recipe.requirements?.minLevel ?? 1
      },
      craftTime: recipe.baseCraftTime,
      xpReward: recipe.xpGain ?? 10,
      isUnlocked: true
    }));
  }

  /**
   * Check if a character can craft a specific recipe
   * This is a simplified version that checks recipe from static data
   */
  static async canCraft(characterId: string, recipeId: string): Promise<any> {
    const Character = (await import('../models/Character.model')).Character;

    // FIX: Look up recipe from static ALL_RECIPES data instead of MongoDB
    const recipe = ALL_RECIPES.find(r => r.id === recipeId);
    if (!recipe) {
      return {
        canCraft: false,
        reason: 'Recipe not found'
      };
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return {
        canCraft: false,
        reason: 'Character not found'
      };
    }

    // Check skill requirement - use profession level from static recipe schema
    const requiredLevel = recipe.requirements?.minLevel || 1;
    const professionId = recipe.professionId;
    const characterSkillEntry = character.skills?.find(
      (s: any) => s.skillId === professionId
    );
    const characterSkill = characterSkillEntry?.level || 0;

    if (characterSkill < requiredLevel) {
      return {
        canCraft: false,
        reason: `Requires ${professionId} level ${requiredLevel}`,
        currentLevel: characterSkill,
        requiredLevel: requiredLevel
      };
    }

    // PHASE 4 FIX: Actually check materials in inventory (was hardcoded to true)
    // Use normalized ingredients to handle both schema formats
    const normalizedIngredients = normalizeRecipeIngredients(recipe);
    const missingMaterials: Array<{ ingredientId: string; needed: number; have: number }> = [];

    for (const ingredient of normalizedIngredients) {
      const inventoryItem = character.inventory.find(
        (i: any) => i.itemId === ingredient.itemId
      );
      const quantityHave = inventoryItem?.quantity || 0;

      if (quantityHave < ingredient.quantity) {
        missingMaterials.push({
          ingredientId: ingredient.itemId,
          needed: ingredient.quantity,
          have: quantityHave
        });
      }
    }

    if (missingMaterials.length > 0) {
      return {
        canCraft: false,
        reason: 'Missing materials',
        missingMaterials,
        recipe: {
          recipeId: recipe.id,
          name: recipe.name,
          ingredients: recipe.materials,
          output: recipe.output,
          craftTime: recipe.baseCraftTime
        }
      };
    }

    // Check facility requirement - validate against current location
    const facilityReq = recipe.requirements?.facility;
    if (facilityReq && facilityReq.type) {
      const facilityValidation = await this.validateLocationFacility(
        character.currentLocation,
        {
          type: facilityReq.type as CraftingFacilityType,
          tier: facilityReq.tier || 1,
          optional: facilityReq.optional,
        }
      );

      if (!facilityValidation.valid) {
        return {
          canCraft: false,
          reason: facilityValidation.error || 'Missing required crafting facility',
          facilityRequired: facilityReq,
          currentLocation: facilityValidation.locationName,
          recipe: {
            recipeId: recipe.id,
            name: recipe.name,
            ingredients: recipe.materials,
            output: recipe.output,
            craftTime: recipe.baseCraftTime
          }
        };
      }
    }

    return {
      canCraft: true,
      recipe: {
        recipeId: recipe.id,
        name: recipe.name,
        ingredients: recipe.materials,
        output: recipe.output,
        craftTime: recipe.baseCraftTime
      }
    };
  }

  /**
   * Check if recipe can be discovered through experimentation
   */
  static canDiscoverRecipe(
    profile: ICraftingProfile,
    recipe: CraftingRecipe
  ): boolean {
    if (!recipe.discoveryChance) return false;

    // Already know this recipe
    if (profile.hasRecipe(recipe.id)) return false;

    const profession = profile.professions.get(recipe.professionId);
    if (!profession) return false;

    // Must be within 10 levels of recipe difficulty
    const levelDiff = Math.abs(profession.level - recipe.difficulty);
    return levelDiff <= 10;
  }

  /**
   * Attempt to discover a recipe through crafting
   * AAA BALANCE: Actually implements recipe discovery instead of returning null
   */
  static async attemptRecipeDiscovery(
    profile: ICraftingProfile,
    professionId: ProfessionId
  ): Promise<RecipeDiscovery | null> {
    const profession = profile.professions.get(professionId);
    if (!profession) return null;

    // Get all discoverable recipes for this profession from the database
    const Recipe = (await import('../models/Recipe.model')).Recipe;

    // Find recipes that:
    // 1. Match this profession (via category or skill requirement)
    // 2. Have discovery enabled (not already unlocked by default)
    // 3. Player doesn't already know
    // 4. Within level range
    const allRecipes = await Recipe.find({
      isUnlocked: false, // Recipes that must be discovered
      'skillRequired.level': {
        $gte: Math.max(1, profession.level - 10),
        $lte: profession.level + 10
      }
    });

    // Filter to ones not already known
    const unknownRecipes = allRecipes.filter(recipe =>
      !profile.hasRecipe(recipe.recipeId)
    );

    if (unknownRecipes.length === 0) {
      return null;
    }

    // Roll for discovery - base 5% chance, increases with level
    const discoveryChance = 0.05 + (profession.level * 0.002); // 5% + 0.2% per level
    const roll = SecureRNG.float(0, 1);

    if (roll > discoveryChance) {
      return null; // No discovery this time
    }

    // Pick a random recipe from discoverable ones
    const discoveredRecipe = SecureRNG.select(unknownRecipes);
    if (!discoveredRecipe) return null;

    // Mark the recipe as learned for this player
    await profile.learnRecipe(discoveredRecipe.recipeId);
    await profile.save();

    // Log the discovery
    const logger = (await import('../utils/logger')).default;
    logger.info(
      `Recipe discovered: Character learned ${discoveredRecipe.name} through experimentation`
    );

    // Return discovery result
    return {
      recipeId: discoveredRecipe.recipeId,
      recipeName: discoveredRecipe.name,
      discoveredBy: profile.characterId,
      discoveryDate: new Date(),
      discoveryMethod: 'experimentation',
      firstDiscovery: false, // Would need to track server-wide first discoveries
      rewardBonus: {
        gold: 50, // Bonus gold for discovering a recipe
        reputation: 10
      }
    };
  }

  /**
   * Get all discoverable recipes for a profession
   * Returns recipes that the player can potentially discover
   */
  static async getDiscoverableRecipes(
    profile: ICraftingProfile,
    professionId: ProfessionId
  ): Promise<any[]> {
    const profession = profile.professions.get(professionId);
    if (!profession) return [];

    const Recipe = (await import('../models/Recipe.model')).Recipe;

    const discoverableRecipes = await Recipe.find({
      isUnlocked: false,
      'skillRequired.level': {
        $gte: Math.max(1, profession.level - 5),
        $lte: profession.level + 10
      }
    });

    // Filter out already known recipes
    return discoverableRecipes.filter(recipe =>
      !profile.hasRecipe(recipe.recipeId)
    );
  }
}

export default CraftingService;
