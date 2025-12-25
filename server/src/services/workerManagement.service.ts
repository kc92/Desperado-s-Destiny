/**
 * Worker Management Service
 *
 * Handles hiring, firing, and managing property workers
 */

import mongoose from 'mongoose';
import { PropertyWorker, IPropertyWorker, WorkerQuality, WORKER_QUALITY_STATS } from '../models/PropertyWorker.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { WorkerSpecialization, WorkerTrait, WorkerListing } from '@desperados/shared';
import { SecureRNG } from './base/SecureRNG';
import { v4 as uuidv4 } from 'uuid';
import { DollarService } from './dollar.service';
import { TaskType, TASK_STAMINA_COSTS } from '../models/WorkerTask.model';
import { Property } from '../models/Property.model';
import { TerritoryBonusService } from './territoryBonus.service';
import logger from '../utils/logger';

/**
 * Worker name pool for generation
 */
const WORKER_FIRST_NAMES = [
  'Jack', 'Tom', 'Bill', 'Sam', 'Joe', 'Dan', 'Ben', 'Jim', 'Pete', 'Luke',
  'Mary', 'Kate', 'Rose', 'Emma', 'Lucy', 'Anna', 'Beth', 'Sarah', 'Jane', 'Grace',
  'Carlos', 'Juan', 'Miguel', 'Diego', 'Pablo', 'Maria', 'Sofia', 'Elena',
  'Chen', 'Wei', 'Li', 'Zhang', 'Wang', 'Mei', 'Ling', 'Hui',
  'Running Bear', 'Swift Eagle', 'Gray Wolf', 'White Deer', 'Red Hawk',
];

const WORKER_LAST_NAMES = [
  'Smith', 'Jones', 'Brown', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson',
  'Garcia', 'Martinez', 'Rodriguez', 'Lopez', 'Gonzalez', 'Hernandez',
  'Lee', 'Chen', 'Liu', 'Wang', 'Yang', 'Wu', 'Huang', 'Zhao',
  'O\'Brien', 'Murphy', 'Kelly', 'Sullivan', 'McCarthy',
];

/**
 * Worker trait definitions
 */
const WORKER_TRAITS: Record<string, WorkerTrait> = {
  hard_worker: {
    traitId: 'hard_worker',
    name: 'Hard Worker',
    description: 'Works tirelessly and efficiently',
    effects: [
      { type: 'speed', value: 0.15 },
      { type: 'morale', value: -5 }, // Gets tired
    ],
  },
  perfectionist: {
    traitId: 'perfectionist',
    name: 'Perfectionist',
    description: 'Produces higher quality work',
    effects: [
      { type: 'quality', value: 0.2 },
      { type: 'speed', value: -0.1 }, // Takes longer
    ],
  },
  efficient: {
    traitId: 'efficient',
    name: 'Efficient',
    description: 'Gets more done with less waste',
    effects: [
      { type: 'yield', value: 0.15 },
      { type: 'speed', value: 0.1 },
    ],
  },
  loyal: {
    traitId: 'loyal',
    name: 'Loyal',
    description: 'Extremely loyal and trustworthy',
    effects: [
      { type: 'loyalty', value: 20 },
      { type: 'morale', value: 10 },
    ],
  },
  greedy: {
    traitId: 'greedy',
    name: 'Greedy',
    description: 'Demands higher wages',
    effects: [
      { type: 'wage', value: 0.5 }, // 50% higher wage
      { type: 'loyalty', value: -10 },
    ],
  },
  cheerful: {
    traitId: 'cheerful',
    name: 'Cheerful',
    description: 'Always in good spirits',
    effects: [
      { type: 'morale', value: 15 },
    ],
  },
  skilled: {
    traitId: 'skilled',
    name: 'Highly Skilled',
    description: 'Expert in their field',
    effects: [
      { type: 'quality', value: 0.15 },
      { type: 'yield', value: 0.1 },
      { type: 'wage', value: 0.3 }, // Costs more
    ],
  },
  lazy: {
    traitId: 'lazy',
    name: 'Lazy',
    description: 'Tends to slack off',
    effects: [
      { type: 'speed', value: -0.2 },
      { type: 'morale', value: 5 }, // Happier doing less
      { type: 'wage', value: -0.2 }, // Cheaper
    ],
  },
  innovative: {
    traitId: 'innovative',
    name: 'Innovative',
    description: 'Finds creative solutions',
    effects: [
      { type: 'yield', value: 0.2 },
      { type: 'quality', value: 0.1 },
    ],
  },
  experienced: {
    traitId: 'experienced',
    name: 'Experienced',
    description: 'Years of experience',
    effects: [
      { type: 'speed', value: 0.1 },
      { type: 'quality', value: 0.15 },
      { type: 'wage', value: 0.25 },
    ],
  },
};

/**
 * Worker Management Service
 */
export class WorkerManagementService {
  /**
   * Generate worker listings for hiring pool
   */
  static generateWorkerListings(
    count: number,
    propertyLevel: number = 1
  ): WorkerListing[] {
    const listings: WorkerListing[] = [];

    for (let i = 0; i < count; i++) {
      const specializations = Object.values(WorkerSpecialization);
      const specialization = SecureRNG.select(specializations);

      // Skill level based on property level
      const baseSkill = 10 + propertyLevel * 5;
      const skillLevel = Math.min(
        100,
        baseSkill + SecureRNG.range(-10, 10)
      );

      // Generate traits (0-2 traits)
      const traitRoll = SecureRNG.float(0, 1);
      const traitCount = traitRoll < 0.3 ? 2 : traitRoll < 0.6 ? 1 : 0;
      const traits: WorkerTrait[] = [];
      const availableTraits = Object.values(WORKER_TRAITS);

      for (let j = 0; j < traitCount; j++) {
        const trait = SecureRNG.select(availableTraits);
        if (!traits.find((t) => t.traitId === trait.traitId)) {
          traits.push(trait);
        }
      }

      // Calculate wage based on skill and traits
      let baseWage = 20 + skillLevel * 2;
      for (const trait of traits) {
        const wageEffect = trait.effects.find((e) => e.type === 'wage');
        if (wageEffect) {
          baseWage *= 1 + wageEffect.value;
        }
      }

      const weeklyWage = Math.floor(baseWage);

      // Generate name
      const firstName = SecureRNG.select(WORKER_FIRST_NAMES);
      const lastName = SecureRNG.select(WORKER_LAST_NAMES);
      const name = `${firstName} ${lastName}`;

      // Base stats
      const loyalty = SecureRNG.range(40, 80);
      const efficiency = 0.8 + SecureRNG.float(0, 1) * 0.6; // 0.8 to 1.4

      // Apply loyalty from traits
      let finalLoyalty = loyalty;
      for (const trait of traits) {
        const loyaltyEffect = trait.effects.find((e) => e.type === 'loyalty');
        if (loyaltyEffect) {
          finalLoyalty += loyaltyEffect.value;
        }
      }

      listings.push({
        listingId: uuidv4(),
        specialization,
        skillLevel,
        weeklyWage,
        traits,
        availableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        name,
        loyalty: Math.max(0, Math.min(100, finalLoyalty)),
        efficiency,
      });
    }

    return listings;
  }

  /**
   * Hire a worker with quality-based system
   */
  static async hireWorker(
    propertyId: string,
    characterId: string,
    listing: WorkerListing
  ): Promise<IPropertyWorker> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Roll for worker quality based on spawn rates
      const roll = SecureRNG.float(0, 100);
      let quality: WorkerQuality;
      let cumulativeRate = 0;

      if (roll < (cumulativeRate += WORKER_QUALITY_STATS[WorkerQuality.LEGENDARY].spawnRate * 100)) {
        quality = WorkerQuality.LEGENDARY;
      } else if (roll < (cumulativeRate += WORKER_QUALITY_STATS[WorkerQuality.VETERAN].spawnRate * 100)) {
        quality = WorkerQuality.VETERAN;
      } else if (roll < (cumulativeRate += WORKER_QUALITY_STATS[WorkerQuality.EXPERIENCED].spawnRate * 100)) {
        quality = WorkerQuality.EXPERIENCED;
      } else if (roll < (cumulativeRate += WORKER_QUALITY_STATS[WorkerQuality.REGULAR].spawnRate * 100)) {
        quality = WorkerQuality.REGULAR;
      } else {
        quality = WorkerQuality.GREENHORN;
      }

      const qualityStats = WORKER_QUALITY_STATS[quality];

      // Check if can afford (hire cost based on quality)
      const hiringCost = qualityStats.hireCost;
      if (!character.hasDollars(hiringCost)) {
        throw new Error(`Insufficient dollars (need ${hiringCost})`);
      }

      // Deduct dollars
      await character.deductDollars(hiringCost, TransactionSource.WORKER_HIRE, {
        workerName: listing.name,
        specialization: listing.specialization,
        quality: quality,
        currencyType: 'DOLLAR',
      });

      // Calculate morale based on traits
      let morale = 75;
      for (const trait of listing.traits) {
        const moraleEffect = trait.effects.find((e) => e.type === 'morale');
        if (moraleEffect) {
          morale += moraleEffect.value;
        }
      }

      // Create worker with quality-based stats
      const worker = new PropertyWorker({
        workerId: uuidv4(),
        propertyId: new mongoose.Types.ObjectId(propertyId),
        characterId: new mongoose.Types.ObjectId(characterId),
        name: listing.name,
        specialization: listing.specialization,
        skillLevel: listing.skillLevel,
        loyalty: listing.loyalty,
        efficiency: qualityStats.efficiency, // Use quality-based efficiency
        morale: Math.max(0, Math.min(100, morale)),
        weeklyWage: listing.weeklyWage,
        hiredDate: new Date(),
        lastPaidDate: new Date(),
        traits: listing.traits,
        // Quality & Stamina fields
        quality: quality,
        stamina: qualityStats.stamina,
        maxStamina: qualityStats.stamina,
        lastFed: new Date(),
        feedingCost: Math.floor(qualityStats.hireCost / 10), // 10% of hire cost daily
      });

      await worker.save({ session });
      await character.save({ session });

      await session.commitTransaction();

      logger.info(`Hired ${quality} worker "${listing.name}" for property ${propertyId}`);

      return worker;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Fire a worker
   */
  static async fireWorker(
    workerId: string,
    characterId: string
  ): Promise<{ success: boolean; severancePay: number; message: string }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get worker
      const worker = await PropertyWorker.findOne({ workerId }).session(session);
      if (!worker) {
        throw new Error('Worker not found');
      }

      // Verify ownership
      if (worker.characterId.toString() !== characterId) {
        throw new Error('You do not own this worker');
      }

      // Can't fire assigned worker
      if (worker.isAssigned) {
        throw new Error('Cannot fire worker who is currently assigned to production');
      }

      // Calculate severance pay (1 week wage if high loyalty)
      let severancePay = 0;
      if (worker.loyalty > 70) {
        severancePay = worker.weeklyWage;

        const character = await Character.findById(characterId).session(session);
        if (character) {
          await character.deductDollars(severancePay, TransactionSource.WORKER_SEVERANCE, {
            workerName: worker.name,
            currencyType: 'DOLLAR',
          });
          await character.save({ session });
        }
      }

      // Delete worker
      await PropertyWorker.deleteOne({ workerId }).session(session);

      await session.commitTransaction();

      return {
        success: true,
        severancePay,
        message: severancePay > 0
          ? `Fired ${worker.name} and paid ${severancePay} dollars severance`
          : `Fired ${worker.name}`,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Pay worker wages (should be called weekly)
   */
  static async payWorkerWages(characterId: string): Promise<{
    workersPaid: number;
    totalCost: number;
    unpaidWorkers: string[];
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Get all workers needing payment
      const workers = await PropertyWorker.findByCharacter(characterId);
      const workersDue = workers.filter((w) => w.isWageDue());

      let workersPaid = 0;
      let totalCost = 0;
      const unpaidWorkers: string[] = [];

      for (const worker of workersDue) {
        const wage = worker.weeklyWage;

        if (character.hasDollars(wage)) {
          await character.deductDollars(wage, TransactionSource.WORKER_WAGE, {
            workerName: worker.name,
            workerId: worker.workerId,
            currencyType: 'DOLLAR',
          });

          worker.payWage();
          await worker.save({ session });

          workersPaid++;
          totalCost += wage;
        } else {
          // Can't pay - worker morale and loyalty drop
          worker.updateMorale(-20);
          worker.loyalty = Math.max(0, worker.loyalty - 10);
          await worker.save({ session });

          unpaidWorkers.push(worker.name);

          // Very low loyalty may cause worker to quit
          if (worker.loyalty < 10) {
            await PropertyWorker.deleteOne({ workerId: worker.workerId }).session(
              session
            );
          }
        }
      }

      await character.save({ session });
      await session.commitTransaction();

      return {
        workersPaid,
        totalCost,
        unpaidWorkers,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Train worker to increase skill
   */
  static async trainWorker(
    workerId: string,
    characterId: string
  ): Promise<IPropertyWorker> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const worker = await PropertyWorker.findOne({ workerId }).session(session);
      if (!worker) {
        throw new Error('Worker not found');
      }

      if (worker.characterId.toString() !== characterId) {
        throw new Error('You do not own this worker');
      }

      if (worker.isAssigned) {
        throw new Error('Cannot train worker who is currently assigned');
      }

      // Training cost
      const trainingCost = worker.skillLevel * 5;

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      if (!character.hasDollars(trainingCost)) {
        throw new Error(`Insufficient dollars (need ${trainingCost})`);
      }

      await character.deductDollars(trainingCost, TransactionSource.WORKER_TRAINING, {
        workerName: worker.name,
        workerId: worker.workerId,
        currencyType: 'DOLLAR',
      });

      // Increase skill (1-5 points based on current level)
      const skillGain = Math.max(1, Math.floor(5 - worker.skillLevel / 25));
      worker.skillLevel = Math.min(100, worker.skillLevel + skillGain);

      // Training boosts morale
      worker.updateMorale(10);

      // Increase loyalty
      worker.loyalty = Math.min(100, worker.loyalty + 5);

      await worker.save({ session });
      await character.save({ session });

      await session.commitTransaction();

      return worker;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get all workers for a property
   */
  static async getPropertyWorkers(propertyId: string): Promise<IPropertyWorker[]> {
    return PropertyWorker.findByProperty(propertyId);
  }

  /**
   * Get available workers for assignment
   */
  static async getAvailableWorkers(propertyId: string): Promise<IPropertyWorker[]> {
    return PropertyWorker.findAvailableWorkers(propertyId);
  }

  /**
   * Get worker details
   */
  static async getWorkerDetails(workerId: string): Promise<IPropertyWorker | null> {
    return PropertyWorker.findOne({ workerId });
  }

  /**
   * Restore worker morale (rest action)
   */
  static async restWorker(
    workerId: string,
    characterId: string
  ): Promise<IPropertyWorker> {
    const worker = await PropertyWorker.findOne({ workerId });
    if (!worker) {
      throw new Error('Worker not found');
    }

    if (worker.characterId.toString() !== characterId) {
      throw new Error('You do not own this worker');
    }

    if (worker.isAssigned) {
      throw new Error('Worker is currently assigned');
    }

    // Resting restores morale
    worker.updateMorale(25);

    // Clear sick status if present
    if (worker.isSick && worker.sickUntil && new Date() > worker.sickUntil) {
      worker.isSick = false;
      worker.sickUntil = undefined;
    }

    await worker.save();

    return worker;
  }

  /**
   * Resolve worker strike
   */
  static async resolveStrike(
    workerId: string,
    characterId: string,
    bonus: number = 0
  ): Promise<IPropertyWorker> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const worker = await PropertyWorker.findOne({ workerId }).session(session);
      if (!worker) {
        throw new Error('Worker not found');
      }

      if (worker.characterId.toString() !== characterId) {
        throw new Error('You do not own this worker');
      }

      if (!worker.isOnStrike) {
        throw new Error('Worker is not on strike');
      }

      // Pay bonus if offered
      if (bonus > 0) {
        const character = await Character.findById(characterId).session(session);
        if (!character) {
          throw new Error('Character not found');
        }

        if (!character.hasDollars(bonus)) {
          throw new Error(`Insufficient dollars for bonus (need ${bonus})`);
        }

        await character.deductDollars(bonus, TransactionSource.STRIKE_RESOLUTION, {
          workerName: worker.name,
          currencyType: 'DOLLAR',
        });

        // Bonus greatly improves morale and loyalty
        worker.updateMorale(30);
        worker.loyalty = Math.min(100, worker.loyalty + 15);

        await character.save({ session });
      } else {
        // No bonus - moderate improvement
        worker.updateMorale(15);
        worker.loyalty = Math.min(100, worker.loyalty + 5);
      }

      // End strike
      worker.isOnStrike = false;
      worker.strikeReason = undefined;

      await worker.save({ session });
      await session.commitTransaction();

      return worker;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // =============================================================================
  // STAMINA SYSTEM METHODS
  // =============================================================================

  /**
   * Deplete worker stamina after task completion
   *
   * @param workerId - Worker ID
   * @param amount - Amount of stamina to deplete
   */
  static async depleteStamina(workerId: string, amount: number): Promise<void> {
    const worker = await PropertyWorker.findOne({ workerId });
    if (!worker) {
      throw new Error('Worker not found');
    }

    worker.stamina = Math.max(0, worker.stamina - amount);
    await worker.save();

    logger.debug(`Worker ${worker.name} stamina depleted by ${amount}. Current: ${worker.stamina}/${worker.maxStamina}`);
  }

  /**
   * Regenerate stamina for idle workers
   * Regenerates 1 stamina per hour when not working
   *
   * @param workerId - Worker ID
   */
  static async regenerateIdleStamina(workerId: string): Promise<void> {
    const worker = await PropertyWorker.findOne({ workerId });
    if (!worker) {
      throw new Error('Worker not found');
    }

    // Only regenerate if worker is idle
    if (worker.isAssigned) {
      return;
    }

    // Calculate hours since last update (using lastFed as last update time)
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - worker.lastFed.getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate >= 1) {
      const staminaToRegenerate = Math.floor(hoursSinceUpdate);
      worker.stamina = Math.min(worker.maxStamina, worker.stamina + staminaToRegenerate);
      worker.lastFed = now; // Update last update time
      await worker.save();

      logger.debug(`Worker ${worker.name} regenerated ${staminaToRegenerate} stamina. Current: ${worker.stamina}/${worker.maxStamina}`);
    }
  }

  /**
   * Feed worker to restore stamina
   * Restores 50% of max stamina
   *
   * @param characterId - Character feeding the worker
   * @param workerId - Worker to feed
   * @returns Stamina restored and cost
   */
  static async feedWorker(
    characterId: string,
    workerId: string
  ): Promise<{ staminaRestored: number; cost: number }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const worker = await PropertyWorker.findOne({ workerId }).session(session);
      if (!worker) {
        throw new Error('Worker not found');
      }

      if (worker.characterId.toString() !== characterId) {
        throw new Error('You do not own this worker');
      }

      // Check if already at max stamina
      if (worker.stamina >= worker.maxStamina) {
        throw new Error('Worker already at max stamina');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const feedCost = worker.feedingCost;

      if (!character.hasDollars(feedCost)) {
        throw new Error(`Insufficient dollars (need ${feedCost})`);
      }

      // Deduct feeding cost
      await character.deductDollars(feedCost, TransactionSource.WORKER_FEED, {
        workerName: worker.name,
        workerId: worker.workerId,
        currencyType: 'DOLLAR',
      });

      // Restore 50% of max stamina
      const staminaToRestore = Math.floor(worker.maxStamina * 0.5);
      const oldStamina = worker.stamina;
      worker.stamina = Math.min(worker.maxStamina, worker.stamina + staminaToRestore);
      worker.lastFed = new Date();

      // Feeding slightly improves morale
      worker.updateMorale(5);

      const actualRestored = worker.stamina - oldStamina;

      await worker.save({ session });
      await character.save({ session });

      await session.commitTransaction();

      logger.info(`Fed worker ${worker.name}, restored ${actualRestored} stamina (cost: ${feedCost})`);

      return {
        staminaRestored: actualRestored,
        cost: feedCost,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Check if worker can perform a task (has enough stamina)
   *
   * @param workerId - Worker ID
   * @param taskType - Type of task to perform
   * @returns Whether worker can perform the task
   */
  static async canPerformTask(workerId: string, taskType?: TaskType): Promise<boolean> {
    const worker = await PropertyWorker.findOne({ workerId });
    if (!worker) {
      return false;
    }

    // Use canWork() which checks stamina, morale, etc.
    if (!worker.canWork()) {
      return false;
    }

    // If specific task type provided, check stamina requirement
    if (taskType) {
      const staminaCost = TASK_STAMINA_COSTS[taskType];
      if (worker.stamina < staminaCost) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get effective worker efficiency with territory bonuses applied
   *
   * @param workerId - Worker ID
   * @returns Effective efficiency multiplier
   */
  static async getEffectiveEfficiency(workerId: string): Promise<number> {
    const worker = await PropertyWorker.findOne({ workerId });
    if (!worker) {
      throw new Error('Worker not found');
    }

    // Get base efficiency from worker
    let efficiency = worker.calculateEfficiency();

    try {
      // Get property to find location and gang
      const property = await Property.findById(worker.propertyId);
      if (property && property.ownerId) {
        const character = await Character.findById(property.ownerId).select('gangId');

        if (character && character.gangId) {
          // Get territory bonuses for the property location
          const territoryBonuses = await TerritoryBonusService.getPropertyBonuses(
            property.locationId,
            character.gangId
          );

          if (territoryBonuses.hasBonuses) {
            // Apply worker efficiency bonus from territory
            efficiency *= territoryBonuses.bonuses.workerEfficiency;

            logger.debug(
              `Territory bonus applied to worker ${worker.name}: ` +
              `${territoryBonuses.bonuses.workerEfficiency}x efficiency`
            );
          }
        }
      }
    } catch (error) {
      logger.error('Failed to apply territory bonuses to worker efficiency:', error);
      // Continue with base efficiency if territory bonus fails
    }

    return efficiency;
  }

  /**
   * Get worker stamina info
   *
   * @param workerId - Worker ID
   */
  static async getWorkerStaminaInfo(workerId: string): Promise<{
    current: number;
    max: number;
    percentage: number;
    canWork: boolean;
    feedingCost: number;
    quality: WorkerQuality;
  }> {
    const worker = await PropertyWorker.findOne({ workerId });
    if (!worker) {
      throw new Error('Worker not found');
    }

    return {
      current: worker.stamina,
      max: worker.maxStamina,
      percentage: (worker.stamina / worker.maxStamina) * 100,
      canWork: worker.canWork(),
      feedingCost: worker.feedingCost,
      quality: worker.quality,
    };
  }
}
