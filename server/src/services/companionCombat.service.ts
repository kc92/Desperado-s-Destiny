/**
 * Companion Combat Service - Phase 9, Wave 9.2
 *
 * Handles companion integration into combat system
 */

import mongoose from 'mongoose';
import { AnimalCompanion, IAnimalCompanion } from '../models/AnimalCompanion.model';
import { Character, ICharacter } from '../models/Character.model';
import { CombatEncounter, ICombatEncounter } from '../models/CombatEncounter.model';
import {
  CompanionCombatContribution,
  CombatRole,
  CompanionAbilityId,
  HandRank
} from '@desperados/shared';
import { getAbilityById } from '../data/companionAbilities';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

export class CompanionCombatService {
  /**
   * Get active companion for combat
   */
  static async getActiveCompanion(characterId: string): Promise<IAnimalCompanion | null> {
    return await AnimalCompanion.findActiveByOwner(characterId);
  }

  /**
   * Apply companion combat bonuses to player damage
   */
  static calculateCompanionDamageBonus(
    companion: IAnimalCompanion,
    baseDamage: number,
    handRank: HandRank
  ): number {
    if (!companion.isActive) {
      return 0;
    }

    let bonus = 0;

    switch (companion.combatRole) {
      case CombatRole.ATTACKER:
        // Attackers add direct damage
        bonus = Math.floor(companion.attackPower * 0.5);

        // Extra bonus for high hands
        if (handRank >= HandRank.FLUSH) {
          bonus = Math.floor(bonus * 1.3);
        }
        break;

      case CombatRole.DEFENDER:
        // Defenders add less damage but are tanky
        bonus = Math.floor(companion.attackPower * 0.3);
        break;

      case CombatRole.SUPPORT:
        // Support companions boost percentage-based
        bonus = Math.floor(baseDamage * 0.15);
        break;

      case CombatRole.SCOUT:
        // Scouts help with critical hits
        if (handRank >= HandRank.FOUR_OF_A_KIND) {
          bonus = Math.floor(companion.attackPower * 0.4);
        } else {
          bonus = Math.floor(companion.attackPower * 0.2);
        }
        break;
    }

    // Bond modifier
    const bondModifier = 1 + (companion.bondLevel / 200); // Up to +50% at max bond
    bonus = Math.floor(bonus * bondModifier);

    return bonus;
  }

  /**
   * Apply companion defense to reduce incoming damage
   */
  static calculateCompanionDefenseReduction(
    companion: IAnimalCompanion,
    incomingDamage: number
  ): { reducedDamage: number; companionDamageTaken: number } {
    if (!companion.isActive) {
      return { reducedDamage: incomingDamage, companionDamageTaken: 0 };
    }

    let reduction = 0;
    let companionDamage = 0;

    switch (companion.combatRole) {
      case CombatRole.DEFENDER:
        // Defenders absorb a portion of damage
        const absorbPercent = Math.min(0.5, companion.defensePower / 100);
        reduction = Math.floor(incomingDamage * absorbPercent);
        companionDamage = Math.floor(reduction * 0.8); // Companion takes 80% of absorbed damage
        break;

      case CombatRole.SUPPORT:
        // Support reduces damage through buffs
        reduction = Math.floor(companion.defensePower * 0.3);
        companionDamage = 0; // Support doesn't take damage
        break;

      case CombatRole.ATTACKER:
      case CombatRole.SCOUT:
        // Small reduction for other roles
        reduction = Math.floor(companion.defensePower * 0.15);
        companionDamage = 0;
        break;
    }

    // Bond modifier
    const bondModifier = 1 + (companion.bondLevel / 200);
    reduction = Math.floor(reduction * bondModifier);

    // Check if companion can handle the damage
    const actualDamageTaken = Math.min(companionDamage, companion.currentHealth);
    const actualReduction = Math.floor(reduction * (actualDamageTaken / companionDamage || 1));

    return {
      reducedDamage: Math.max(0, incomingDamage - actualReduction),
      companionDamageTaken: actualDamageTaken
    };
  }

  /**
   * Use companion ability in combat
   */
  static async useCompanionAbility(
    characterId: string,
    companionId: string,
    abilityId: CompanionAbilityId,
    encounterId: string,
    session?: mongoose.ClientSession
  ): Promise<{
    success: boolean;
    message: string;
    effect?: {
      damageBonus?: number;
      defenseBonus?: number;
      healAmount?: number;
      specialEffect?: string;
    };
  }> {
    const useSession = session || await mongoose.startSession();
    const shouldCommit = !session;

    if (shouldCommit) {
      useSession.startTransaction();
    }

    try {
      const companion = await AnimalCompanion.findById(companionId).session(useSession);
      if (!companion) {
        throw new AppError('Companion not found', 404);
      }

      if (companion.ownerId.toString() !== characterId) {
        throw new AppError('You do not own this companion', 403);
      }

      if (!companion.isActive) {
        throw new AppError('Companion must be active', 400);
      }

      // Check if can use ability
      if (!companion.canUseAbility(abilityId)) {
        throw new AppError('Cannot use this ability right now', 400);
      }

      const ability = getAbilityById(abilityId);
      if (!ability) {
        throw new AppError('Invalid ability', 400);
      }

      // Apply cooldown
      companion.useAbility(abilityId);

      // Calculate effect based on ability type
      let effect: any = {};

      switch (ability.effectType) {
        case 'COMBAT_DAMAGE':
          effect.damageBonus = Math.floor(ability.power * (companion.attackPower / 50));
          break;

        case 'COMBAT_DEFENSE':
          effect.defenseBonus = Math.floor(ability.power * (companion.defensePower / 50));
          break;

        case 'SUPPORT_BUFF':
          effect.damageBonus = Math.floor(ability.power * 0.5);
          effect.defenseBonus = Math.floor(ability.power * 0.5);
          break;

        case 'INTIMIDATION':
          effect.specialEffect = 'Enemy morale reduced';
          break;

        case 'DETECTION':
          effect.specialEffect = 'Reveals enemy information';
          break;

        default:
          effect.specialEffect = ability.description;
          break;
      }

      // Gain bond from using ability in combat
      companion.gainBond(1);

      await companion.save({ session: useSession });

      if (shouldCommit) {
        await useSession.commitTransaction();
        useSession.endSession();
      }

      return {
        success: true,
        message: `${companion.name} used ${ability.name}!`,
        effect
      };
    } catch (error) {
      if (shouldCommit) {
        await useSession.abortTransaction();
        useSession.endSession();
      }
      throw error;
    }
  }

  /**
   * Apply companion damage to NPC or player
   */
  static async applyCompanionDamage(
    companion: IAnimalCompanion,
    encounter: ICombatEncounter,
    baseDamage: number,
    handRank: HandRank,
    session?: mongoose.ClientSession
  ): Promise<number> {
    const damageBonus = this.calculateCompanionDamageBonus(companion, baseDamage, handRank);

    // Companion gains experience from combat
    companion.encountersHelped += 1;

    // Small chance to find items after combat
    if (SecureRNG.chance(0.1)) {
      companion.itemsFound += 1;
    }

    // Gain bond from participating in combat
    companion.gainBond(1);

    // Update companion state
    if (session) {
      await companion.save({ session });
    } else {
      await companion.save();
    }

    return damageBonus;
  }

  /**
   * Apply damage to companion during combat
   */
  static async damageCompanion(
    companion: IAnimalCompanion,
    damage: number,
    session?: mongoose.ClientSession
  ): Promise<{ survived: boolean; actualDamage: number }> {
    const actualDamage = Math.min(damage, companion.currentHealth);
    const survived = companion.takeDamage(actualDamage);

    if (!survived) {
      // Companion knocked out
      companion.isActive = false;
      companion.currentHealth = 0;
      logger.warn(
        `Companion ${companion.name} (${companion.species}) was knocked out in combat`
      );
    }

    if (session) {
      await companion.save({ session });
    } else {
      await companion.save();
    }

    return { survived, actualDamage };
  }

  /**
   * Generate combat contribution summary
   */
  static async generateCombatContribution(
    companion: IAnimalCompanion,
    encounter: ICombatEncounter,
    totalDamageDealt: number,
    totalDamagePrevented: number,
    abilitiesUsed: CompanionAbilityId[]
  ): Promise<CompanionCombatContribution> {
    return {
      companionId: companion._id.toString(),
      companionName: companion.name,
      species: companion.species,
      damageDealt: totalDamageDealt,
      damagePrevented: totalDamagePrevented,
      abilitiesUsed,
      healthRemaining: companion.currentHealth,
      bondGained: Math.min(5, Math.floor(totalDamageDealt / 20) + abilitiesUsed.length)
    };
  }

  /**
   * Check if companion should automatically use an ability
   */
  static shouldAutoUseAbility(
    companion: IAnimalCompanion,
    playerHP: number,
    playerMaxHP: number,
    npcHP: number
  ): CompanionAbilityId | null {
    // Low player health - use defensive abilities
    if (playerHP < playerMaxHP * 0.3) {
      const defensiveAbilities = [
        CompanionAbilityId.LOYAL_DEFENSE,
        CompanionAbilityId.PHASE_SHIFT
      ];

      for (const abilityId of defensiveAbilities) {
        if (companion.abilities.includes(abilityId) && companion.canUseAbility(abilityId)) {
          return abilityId;
        }
      }
    }

    // High NPC health - use offensive abilities
    if (npcHP > playerMaxHP && companion.combatRole === CombatRole.ATTACKER) {
      const offensiveAbilities = [
        CompanionAbilityId.FERAL_RAGE,
        CompanionAbilityId.POUNCE,
        CompanionAbilityId.MAUL,
        CompanionAbilityId.THUNDER_STRIKE
      ];

      for (const abilityId of offensiveAbilities) {
        if (companion.abilities.includes(abilityId) && companion.canUseAbility(abilityId)) {
          return abilityId;
        }
      }
    }

    return null;
  }

  /**
   * Award companion kill credit
   */
  static async awardKillCredit(
    companion: IAnimalCompanion,
    session?: mongoose.ClientSession
  ): Promise<void> {
    companion.kills += 1;

    // Significant bond gain for defeating enemies together
    companion.gainBond(3);

    if (session) {
      await companion.save({ session });
    } else {
      await companion.save();
    }

    logger.info(
      `Companion ${companion.name} awarded kill credit. Total kills: ${companion.kills}`
    );
  }

  /**
   * Get companion combat stats
   */
  static getCompanionCombatStats(companion: IAnimalCompanion): {
    effectiveAttack: number;
    effectiveDefense: number;
    combatPower: number;
  } {
    // Factor in bond level
    const bondMultiplier = 1 + (companion.bondLevel / 100);

    // Factor in condition
    const conditionMultiplier = companion.currentHealth / companion.maxHealth;

    const effectiveAttack = Math.floor(
      companion.attackPower * bondMultiplier * conditionMultiplier
    );

    const effectiveDefense = Math.floor(
      companion.defensePower * bondMultiplier * conditionMultiplier
    );

    const combatPower = effectiveAttack + effectiveDefense;

    return {
      effectiveAttack,
      effectiveDefense,
      combatPower
    };
  }

  /**
   * Restore companion health after combat
   */
  static async restoreAfterCombat(
    companion: IAnimalCompanion,
    victory: boolean,
    session?: mongoose.ClientSession
  ): Promise<void> {
    // Restore some health after victory
    if (victory) {
      const healAmount = Math.floor(companion.maxHealth * 0.2);
      companion.heal(healAmount);

      // Reduce hunger from combat exertion
      companion.hunger = Math.max(0, companion.hunger - 10);
    } else {
      // Reduce hunger and happiness after defeat
      companion.hunger = Math.max(0, companion.hunger - 15);
      companion.happiness = Math.max(0, companion.happiness - 10);
    }

    if (session) {
      await companion.save({ session });
    } else {
      await companion.save();
    }
  }
}
