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
  RecipeDiscovery
} from '@desperados/shared';
import CraftingProfile, { ICraftingProfile } from '../models/CraftingProfile.model';
import { Character } from '../models/Character.model';
import { getProfession, SKILL_TIERS } from '../data/professionDefinitions';

// ============================================================================
// CRAFTING SERVICE CLASS
// ============================================================================

export class CraftingService {
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

      // Check recipe learned
      if (!profile.hasRecipe(recipe.id)) {
        validation.errors.push('You have not learned this recipe');
        validation.canCraft = false;
      }

      // Check materials (simplified - would check inventory in real implementation)
      validation.requirements.hasMaterials = true; // Assume true for now

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

      // Check energy (simplified)
      validation.requirements.hasEnergy = true;

      // Check inventory space (simplified)
      validation.requirements.hasInventorySpace = true;

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

      // TODO: Actually craft the item, deduct materials, add to inventory
      // For now, return a success response with placeholder data
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

      await profile.save();

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

      // Check cost (simplified - would deduct gold in real implementation)
      if (recipe.learningCost && recipe.learningCost > 0) {
        // Would check and deduct gold here
      }

      // Learn the recipe
      await profile.learnRecipe(recipe.id);

      response.success = true;
      response.message = `You have learned how to craft ${recipe.name}`;

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

    // Critical chance
    const criticalChance = Math.min(25, profession.level / 4); // Max 25%

    // Final roll (1-1000)
    const finalRoll = Math.floor(
      baseChance +
      skillModifier +
      statModifier +
      toolModifier +
      facilityModifier +
      specializationBonus
    );

    // Determine quality
    let resultingQuality: CraftingQuality;
    let statMultiplier: number;

    // Critical success check
    const critRoll = Math.random() * 100;
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

    // TODO: Check materials in inventory
    // For now, assume materials are available

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

    const profession = profile.professions.get(recipe.professionId);
    if (!profession) return false;

    // Must be within 10 levels of recipe difficulty
    const levelDiff = Math.abs(profession.level - recipe.difficulty);
    return levelDiff <= 10;
  }

  /**
   * Attempt to discover a recipe through crafting
   */
  static async attemptRecipeDiscovery(
    profile: ICraftingProfile,
    professionId: ProfessionId
  ): Promise<RecipeDiscovery | null> {
    // This would check for discoverable recipes and roll for discovery
    // Placeholder implementation
    return null;
  }
}

export default CraftingService;
