/**
 * Specialization Service
 * Handles specialization selection and bonus calculations
 * Phase 7, Wave 7.1 - Crafting Overhaul
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import {
  PlayerSpecialization,
  SpecializationPath,
  AvailableSpecializationsResponse,
  ChooseSpecializationResponse,
  MasteryProgressResponse,
  SpecializationDisplayInfo
} from '@desperados/shared';
import {
  SPECIALIZATION_PATHS,
  getSpecializationsByProfession,
  getSpecializationById,
  isValidSpecializationForProfession
} from '../data/specializationPaths';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';

export class SpecializationService {
  /**
   * Get all available specializations for a character
   */
  static async getAvailableSpecializations(
    characterId: string
  ): Promise<AvailableSpecializationsResponse> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get character's profession levels
    const professionLevels: Record<string, number> = {};
    const professionSkills = [
      'blacksmithing',
      'leatherworking',
      'alchemy',
      'cooking',
      'tailoring',
      'gunsmithing'
    ];

    for (const skillId of professionSkills) {
      const skill = character.skills.find(s => s.skillId === skillId);
      professionLevels[skillId] = skill?.level || 0;
    }

    // Get player's current specializations (if stored on character)
    const playerSpecializations: PlayerSpecialization[] =
      (character as any).specializations || [];

    return {
      paths: SPECIALIZATION_PATHS,
      playerSpecializations,
      professionLevels
    };
  }

  /**
   * Get specializations for a specific profession
   */
  static async getSpecializationsForProfession(
    characterId: string,
    professionId: string
  ): Promise<SpecializationDisplayInfo[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const paths = getSpecializationsByProfession(professionId);
    const playerSpecializations: PlayerSpecialization[] =
      (character as any).specializations || [];

    const professionSkill = character.skills.find(s => s.skillId === professionId);
    const professionLevel = professionSkill?.level || 0;

    return paths.map(path => {
      const playerSpec = playerSpecializations.find(ps => ps.pathId === path.id);
      const isChosen = !!playerSpec;
      const meetsLevelReq = professionLevel >= path.requirements.professionLevel;
      const hasDollars = character.dollars >= (path.requirements.goldCost || 0);
      const canChoose = !isChosen && meetsLevelReq && hasDollars;

      let reason: string | undefined;
      if (!meetsLevelReq) {
        reason = `Requires ${path.professionId} level ${path.requirements.professionLevel}`;
      } else if (!hasDollars) {
        reason = `Requires ${path.requirements.goldCost} dollars`;
      } else if (isChosen) {
        reason = 'Already chosen';
      }

      return {
        path,
        isChosen,
        canChoose,
        reason,
        masteryProgress: playerSpec?.masteryProgress,
        unlockedRecipesCount: playerSpec?.uniqueRecipesUnlocked.length
      };
    });
  }

  /**
   * Choose a specialization path
   */
  static async chooseSpecialization(
    characterId: string,
    specializationId: string
  ): Promise<ChooseSpecializationResponse> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new AppError('Character not found', 404);
      }

      const path = getSpecializationById(specializationId);
      if (!path) {
        throw new AppError('Specialization path not found', 404);
      }

      // Initialize specializations array if it doesn't exist
      if (!(character as any).specializations) {
        (character as any).specializations = [];
      }

      const playerSpecializations: PlayerSpecialization[] =
        (character as any).specializations;

      // Check if already chosen
      const existing = playerSpecializations.find(
        ps => ps.pathId === specializationId
      );
      if (existing) {
        throw new AppError('You have already chosen this specialization', 400);
      }

      // Check if already specialized in this profession
      const existingProfession = playerSpecializations.find(
        ps => ps.professionId === path.professionId
      );
      if (existingProfession) {
        throw new AppError(
          'You can only choose one specialization per profession',
          400
        );
      }

      // Check profession level requirement
      const professionSkill = character.skills.find(
        s => s.skillId === path.professionId
      );
      const professionLevel = professionSkill?.level || 0;

      if (professionLevel < path.requirements.professionLevel) {
        throw new AppError(
          `Requires ${path.professionId} level ${path.requirements.professionLevel}`,
          400
        );
      }

      // Check dollar requirement
      const dollarCost = path.requirements.goldCost || 0;
      if (character.dollars < dollarCost) {
        throw new AppError(`Requires ${dollarCost} dollars`, 400);
      }

      // Deduct dollars
      if (dollarCost > 0) {
        await DollarService.deductDollars(
          character._id.toString(),
          dollarCost,
          TransactionSource.SHOP_PURCHASE,
          { specializationId, specializationName: path.name, professionId: path.professionId },
          session
        );
      }

      // Create new specialization
      const newSpecialization: PlayerSpecialization = {
        pathId: specializationId,
        professionId: path.professionId,
        unlockedAt: new Date(),
        masteryProgress: 0,
        uniqueRecipesUnlocked: []
      };

      // Refetch character to get latest state after DollarService update
      const updatedCharacter = await Character.findById(character._id).session(session);
      if (!updatedCharacter) {
        throw new AppError('Character not found after dollar deduction', 500);
      }

      // Ensure specializations array exists
      if (!(updatedCharacter as any).specializations) {
        (updatedCharacter as any).specializations = [];
      }

      const updatedSpecializations: PlayerSpecialization[] = (updatedCharacter as any).specializations;
      updatedSpecializations.push(newSpecialization);
      (updatedCharacter as any).specializations = updatedSpecializations;

      await updatedCharacter.save({ session });
      await session.commitTransaction();

      logger.info(
        `Character ${characterId} chose specialization ${specializationId}`
      );

      return {
        specialization: newSpecialization,
        message: `You are now a ${path.name}!`,
        recipesUnlocked: path.uniqueRecipes
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Update mastery progress for a specialization
   * Called when player crafts items from their specialization
   */
  static async updateMasteryProgress(
    characterId: string,
    specializationId: string,
    progressAmount: number
  ): Promise<MasteryProgressResponse> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const playerSpecializations: PlayerSpecialization[] =
      (character as any).specializations || [];

    const specialization = playerSpecializations.find(
      ps => ps.pathId === specializationId
    );

    if (!specialization) {
      throw new AppError('Specialization not found for this character', 404);
    }

    const oldProgress = specialization.masteryProgress;
    const newProgress = Math.min(100, oldProgress + progressAmount);
    const masteryAchieved = oldProgress < 100 && newProgress >= 100;

    specialization.masteryProgress = newProgress;
    (character as any).specializations = playerSpecializations;

    await character.save();

    const response: MasteryProgressResponse = {
      pathId: specializationId,
      oldProgress,
      newProgress,
      masteryAchieved
    };

    if (masteryAchieved) {
      const path = getSpecializationById(specializationId);
      if (path) {
        response.masteryReward = path.masteryReward;
        logger.info(
          `Character ${characterId} achieved mastery in ${specializationId}`
        );
      }
    }

    return response;
  }

  /**
   * Get bonus multiplier for a specific bonus type from character's specializations
   */
  static async getSpecializationBonus(
    character: ICharacter,
    bonusType: string,
    context?: string
  ): Promise<number> {
    const playerSpecializations: PlayerSpecialization[] =
      (character as any).specializations || [];

    let totalBonus = 0;

    for (const playerSpec of playerSpecializations) {
      const path = getSpecializationById(playerSpec.pathId);
      if (!path) continue;

      for (const bonus of path.bonuses) {
        if (bonus.type === bonusType) {
          // Optionally check context if provided
          if (!context || bonus.appliesTo.toLowerCase().includes(context.toLowerCase())) {
            totalBonus += bonus.value;
          }
        }
      }
    }

    return totalBonus;
  }

  /**
   * Check if character has a specific passive effect
   */
  static hasPassiveEffect(
    character: ICharacter,
    effectId: string
  ): boolean {
    const playerSpecializations: PlayerSpecialization[] =
      (character as any).specializations || [];

    for (const playerSpec of playerSpecializations) {
      const path = getSpecializationById(playerSpec.pathId);
      if (!path) continue;

      const hasEffect = path.passiveEffects.some(effect => effect.id === effectId);
      if (hasEffect) return true;
    }

    return false;
  }

  /**
   * Get all unique recipes available to character from specializations
   */
  static getUniqueRecipes(character: ICharacter): string[] {
    const playerSpecializations: PlayerSpecialization[] =
      (character as any).specializations || [];

    const recipes = new Set<string>();

    for (const playerSpec of playerSpecializations) {
      const path = getSpecializationById(playerSpec.pathId);
      if (!path) continue;

      // Add all unique recipes from the path
      path.uniqueRecipes.forEach(recipeId => recipes.add(recipeId));

      // Add unlocked recipes from mastery progress
      playerSpec.uniqueRecipesUnlocked.forEach(recipeId => recipes.add(recipeId));
    }

    return Array.from(recipes);
  }

  /**
   * Check if character has mastered a specialization
   */
  static hasMastery(
    character: ICharacter,
    specializationId: string
  ): boolean {
    const playerSpecializations: PlayerSpecialization[] =
      (character as any).specializations || [];

    const specialization = playerSpecializations.find(
      ps => ps.pathId === specializationId
    );

    return specialization ? specialization.masteryProgress >= 100 : false;
  }

  /**
   * Get all character specializations with full details
   */
  static getCharacterSpecializations(
    character: ICharacter
  ): Array<{ specialization: PlayerSpecialization; path: SpecializationPath }> {
    const playerSpecializations: PlayerSpecialization[] =
      (character as any).specializations || [];

    return playerSpecializations
      .map(playerSpec => {
        const path = getSpecializationById(playerSpec.pathId);
        if (!path) return null;
        return { specialization: playerSpec, path };
      })
      .filter((item): item is { specialization: PlayerSpecialization; path: SpecializationPath } =>
        item !== null
      );
  }

  /**
   * Award mastery progress based on crafting activity
   * Called by crafting service when items are crafted
   */
  static async awardMasteryProgressForCrafting(
    characterId: string,
    recipeId: string,
    professionId: string
  ): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) return;

    const playerSpecializations: PlayerSpecialization[] =
      (character as any).specializations || [];

    // Find specialization for this profession
    const specialization = playerSpecializations.find(
      ps => ps.professionId === professionId
    );

    if (!specialization || specialization.masteryProgress >= 100) {
      return; // No specialization or already mastered
    }

    const path = getSpecializationById(specialization.pathId);
    if (!path) return;

    // Award more progress for unique recipes from this specialization
    const isUniqueRecipe = path.uniqueRecipes.includes(recipeId);
    const progressAmount = isUniqueRecipe ? 0.5 : 0.1; // 0.5% for unique, 0.1% for regular

    await this.updateMasteryProgress(characterId, specialization.pathId, progressAmount);
  }
}
