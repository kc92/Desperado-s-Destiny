/**
 * Worker Management Service
 *
 * Handles hiring, firing, and managing property workers
 */

import mongoose from 'mongoose';
import { PropertyWorker, IPropertyWorker } from '../models/PropertyWorker.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { WorkerSpecialization, WorkerTrait, WorkerListing } from '@desperados/shared';
import { v4 as uuidv4 } from 'uuid';

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
      const specialization =
        specializations[Math.floor(Math.random() * specializations.length)];

      // Skill level based on property level
      const baseSkill = 10 + propertyLevel * 5;
      const skillLevel = Math.min(
        100,
        baseSkill + Math.floor(Math.random() * 20) - 10
      );

      // Generate traits (0-2 traits)
      const traitCount = Math.random() < 0.3 ? 2 : Math.random() < 0.6 ? 1 : 0;
      const traits: WorkerTrait[] = [];
      const availableTraits = Object.values(WORKER_TRAITS);

      for (let j = 0; j < traitCount; j++) {
        const trait = availableTraits[Math.floor(Math.random() * availableTraits.length)];
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
      const firstName =
        WORKER_FIRST_NAMES[Math.floor(Math.random() * WORKER_FIRST_NAMES.length)];
      const lastName =
        WORKER_LAST_NAMES[Math.floor(Math.random() * WORKER_LAST_NAMES.length)];
      const name = `${firstName} ${lastName}`;

      // Base stats
      const loyalty = 40 + Math.floor(Math.random() * 40);
      const efficiency = 0.8 + Math.random() * 0.6; // 0.8 to 1.4

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
   * Hire a worker
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

      // Check if can afford
      const hiringCost = listing.weeklyWage; // First week upfront
      if (!character.hasGold(hiringCost)) {
        throw new Error(`Insufficient gold (need ${hiringCost})`);
      }

      // Deduct gold
      await character.deductGold(hiringCost, TransactionSource.WORKER_HIRE, {
        workerName: listing.name,
        specialization: listing.specialization,
      });

      // Calculate morale based on traits
      let morale = 75;
      for (const trait of listing.traits) {
        const moraleEffect = trait.effects.find((e) => e.type === 'morale');
        if (moraleEffect) {
          morale += moraleEffect.value;
        }
      }

      // Create worker
      const worker = new PropertyWorker({
        workerId: uuidv4(),
        propertyId: new mongoose.Types.ObjectId(propertyId),
        characterId: new mongoose.Types.ObjectId(characterId),
        name: listing.name,
        specialization: listing.specialization,
        skillLevel: listing.skillLevel,
        loyalty: listing.loyalty,
        efficiency: listing.efficiency,
        morale: Math.max(0, Math.min(100, morale)),
        weeklyWage: listing.weeklyWage,
        hiredDate: new Date(),
        lastPaidDate: new Date(),
        traits: listing.traits,
      });

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
          await character.deductGold(severancePay, TransactionSource.WORKER_SEVERANCE, {
            workerName: worker.name,
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
          ? `Fired ${worker.name} and paid ${severancePay} gold severance`
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

        if (character.hasGold(wage)) {
          await character.deductGold(wage, TransactionSource.WORKER_WAGE, {
            workerName: worker.name,
            workerId: worker.workerId,
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

      if (!character.hasGold(trainingCost)) {
        throw new Error(`Insufficient gold (need ${trainingCost})`);
      }

      await character.deductGold(trainingCost, TransactionSource.WORKER_TRAINING, {
        workerName: worker.name,
        workerId: worker.workerId,
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

        if (!character.hasGold(bonus)) {
          throw new Error(`Insufficient gold for bonus (need ${bonus})`);
        }

        await character.deductGold(bonus, TransactionSource.STRIKE_RESOLUTION, {
          workerName: worker.name,
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
}
