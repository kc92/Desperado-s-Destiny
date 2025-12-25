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
  SKILLS
} from '@desperados/shared';
import { UnlockEnforcementService } from './unlockEnforcement.service';
import { DollarService } from './dollar.service';
import CraftingProfile, { ICraftingProfile } from '../models/CraftingProfile.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { getProfession, SKILL_TIERS } from '../data/professionDefinitions';
import { SecureRNG } from './base/SecureRNG';
import { safeAchievementUpdate } from '../utils/achievementUtils';

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
      const missingMaterials: string[] = [];
      for (const material of recipe.materials) {
        const totalNeeded = material.quantity * quantity;
        const inventoryItem = character.inventory.find(i => i.itemId === material.materialId);
        if (!inventoryItem || inventoryItem.quantity < totalNeeded) {
          missingMaterials.push(
            `${material.materialName || material.materialId}: need ${totalNeeded}, have ${inventoryItem?.quantity || 0}`
          );
        }
      }

      if (missingMaterials.length > 0) {
        validation.errors.push(`Missing materials: ${missingMaterials.join('; ')}`);
        validation.canCraft = false;
      } else {
        validation.requirements.hasMaterials = true;
      }

      // Check facility requirements
      if (recipe.requirements.facility && !recipe.requirements.facility.optional) {
        const facility = profile.getFacility(recipe.requirements.facility.type);
        if (!facility) {
          validation.errors.push(
            `Requires ${recipe.requirements.facility.type} (tier ${recipe.requirements.facility.tier})`
          );
          validation.canCraft = false;
        } else if (facility.tier < recipe.requirements.facility.tier) {
          validation.errors.push(
            `Requires ${recipe.requirements.facility.type} tier ${recipe.requirements.facility.tier} (you have tier ${facility.tier})`
          );
          validation.canCraft = false;
        } else {
          validation.requirements.hasFacility = true;
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
      const Recipe = (await import('../models/Recipe.model')).Recipe;
      const Character = (await import('../models/Character.model')).Character;

      const recipeDoc = await Recipe.findOne({ recipeId: requestOrRecipeId });
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
      for (const ingredient of recipeDoc.ingredients) {
        const inventoryItem = character.inventory.find(i => i.itemId === ingredient.itemId);
        if (!inventoryItem || inventoryItem.quantity < ingredient.quantity) {
          return {
            success: false,
            error: `Insufficient materials: ${ingredient.itemId} (need ${ingredient.quantity}, have ${inventoryItem?.quantity || 0})`
          };
        }
      }

      // Deduct materials from inventory
      for (const ingredient of recipeDoc.ingredients) {
        const inventoryItem = character.inventory.find(i => i.itemId === ingredient.itemId);
        if (inventoryItem) {
          inventoryItem.quantity -= ingredient.quantity;
          if (inventoryItem.quantity <= 0) {
            character.inventory = character.inventory.filter(i => i.itemId !== ingredient.itemId);
          }
        }
      }

      // Add crafted item to inventory
      const existingItem = character.inventory.find(i => i.itemId === recipeDoc.output.itemId);
      if (existingItem) {
        existingItem.quantity += recipeDoc.output.quantity;
      } else {
        character.inventory.push({
          itemId: recipeDoc.output.itemId,
          quantity: recipeDoc.output.quantity,
          acquiredAt: new Date()
        });
      }

      // Save character with updated inventory
      await character.save();

      return {
        success: true,
        itemsCrafted: [{
          itemId: recipeDoc.output.itemId,
          quantity: recipeDoc.output.quantity,
          quality: 'common'
        }],
        xpGained: recipeDoc.xpReward,
        timeTaken: recipeDoc.craftTime
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

      // Check materials in inventory
      for (const material of craftingRecipe.materials) {
        const totalNeeded = material.quantity * request.quantity;
        const inventoryItem = character.inventory.find(i => i.itemId === material.materialId);
        if (!inventoryItem || inventoryItem.quantity < totalNeeded) {
          response.message = `Insufficient materials: ${material.materialId} (need ${totalNeeded}, have ${inventoryItem?.quantity || 0})`;
          return response;
        }
      }

      // Deduct materials from inventory
      for (const material of craftingRecipe.materials) {
        const totalNeeded = material.quantity * request.quantity;
        const inventoryItem = character.inventory.find(i => i.itemId === material.materialId);
        if (inventoryItem) {
          inventoryItem.quantity -= totalNeeded;
          if (inventoryItem.quantity <= 0) {
            character.inventory = character.inventory.filter(i => i.itemId !== material.materialId);
          }
        }
      }

      // Calculate quality
      const qualityCalc = this.calculateQuality(
        character,
        profile,
        craftingRecipe,
        request.toolQuality || CraftingToolQuality.BASIC
      );

      // Calculate XP
      const xpCalc = this.calculateXP(
        profile,
        craftingRecipe,
        profession.level,
        request.toolQuality || CraftingToolQuality.BASIC
      );

      // Create crafted items
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

      // Add XP to profession
      const totalXP = xpCalc.totalXP * request.quantity;
      const oldLevel = profession.level;
      const oldTier = profession.tier;

      await profile.addProfessionXP(craftingRecipe.professionId, totalXP);

      // Reload to get updated profession
      await profile.save();
      const updatedProfession = profile.professions.get(craftingRecipe.professionId);
      const newLevel = updatedProfession?.level || oldLevel;
      const newTier = updatedProfession?.tier || oldTier;

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
      for (const material of craftingRecipe.materials) {
        const currentUsed = profile.craftingStats.materialsUsed.get(material.materialId) || 0;
        profile.craftingStats.materialsUsed.set(
          material.materialId,
          currentUsed + (material.quantity * request.quantity)
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

      // Save character with updated inventory
      await character.save();

      await profile.save();

      // Achievement tracking: Crafting achievements
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

      // Build response
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
   * Returns recipes from the Recipe model (database)
   */
  static async getAvailableRecipes(characterId: string): Promise<any[]> {
    const Recipe = (await import('../models/Recipe.model')).Recipe;

    // For now, return all unlocked recipes
    // TODO: Filter by character's skill levels and unlocked recipes
    const recipes = await Recipe.find({ isUnlocked: true });
    return recipes;
  }

  /**
   * Get recipes by category
   */
  static async getRecipesByCategory(category: string): Promise<any[]> {
    const Recipe = (await import('../models/Recipe.model')).Recipe;

    const recipes = await Recipe.find({
      category,
      isUnlocked: true
    });
    return recipes;
  }

  /**
   * Check if a character can craft a specific recipe
   * This is a simplified version that checks recipe from database
   */
  static async canCraft(characterId: string, recipeId: string): Promise<any> {
    const Recipe = (await import('../models/Recipe.model')).Recipe;
    const Character = (await import('../models/Character.model')).Character;

    const recipe = await Recipe.findOne({ recipeId });
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

    // Check skill requirement
    const skillRequired = recipe.skillRequired;
    const characterSkill = (character as any)[skillRequired.skillId] || 0;

    if (characterSkill < skillRequired.level) {
      return {
        canCraft: false,
        reason: `Requires ${skillRequired.skillId} level ${skillRequired.level}`,
        currentLevel: characterSkill,
        requiredLevel: skillRequired.level
      };
    }

    // PHASE 4 FIX: Actually check materials in inventory (was hardcoded to true)
    const missingMaterials: Array<{ ingredientId: string; needed: number; have: number }> = [];

    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      for (const ingredient of recipe.ingredients) {
        const ingredientId = ingredient.itemId || ingredient.ingredientId;
        const quantityNeeded = ingredient.quantity || 1;

        const inventoryItem = character.inventory.find(
          (i: any) => i.itemId === ingredientId
        );
        const quantityHave = inventoryItem?.quantity || 0;

        if (quantityHave < quantityNeeded) {
          missingMaterials.push({
            ingredientId,
            needed: quantityNeeded,
            have: quantityHave
          });
        }
      }
    }

    if (missingMaterials.length > 0) {
      return {
        canCraft: false,
        reason: 'Missing materials',
        missingMaterials,
        recipe: {
          recipeId: recipe.recipeId,
          name: recipe.name,
          ingredients: recipe.ingredients,
          output: recipe.output,
          craftTime: recipe.craftTime
        }
      };
    }

    return {
      canCraft: true,
      recipe: {
        recipeId: recipe.recipeId,
        name: recipe.name,
        ingredients: recipe.ingredients,
        output: recipe.output,
        craftTime: recipe.craftTime
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
