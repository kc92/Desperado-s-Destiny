/**
 * Stagecoach Ambush Service
 *
 * Handles ambush mechanics - both attacking and defending stagecoaches
 */

import mongoose from 'mongoose';
import {
  AmbushSpot,
  AmbushPlan,
  AmbushResult,
  DefenseResult,
  AmbushLocationType,
  StagecoachCargoItem,
  LootDistribution,
} from '@desperados/shared';
import { Character, ICharacter } from '../models/Character.model';
import { Gang } from '../models/Gang.model';
import { AmbushPlanModel } from '../models/AmbushPlan.model';
import { DollarService } from './dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { getRouteById } from '../data/stagecoachRoutes';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

/**
 * Ambush spots database (pre-defined good ambush locations)
 */
const AMBUSH_SPOTS: AmbushSpot[] = [
  // Red Gulch - Longhorn Ranch Line
  {
    id: 'ambush_copper_canyon',
    name: 'Copper Canyon Narrows',
    routeId: 'route_red_gulch_longhorn',
    locationType: 'canyon_pass',
    position: 35,
    coverQuality: 9,
    visibilityRange: 100,
    escapeRoutes: 2,
    description: 'Narrow canyon pass with excellent cover on both sides. Classic ambush site.',
    terrainAdvantages: ['High ground', 'Cover rocks', 'Multiple escape routes'],
  },
  {
    id: 'ambush_copper_river',
    name: 'Copper River Crossing',
    routeId: 'route_red_gulch_longhorn',
    locationType: 'river_crossing',
    position: 60,
    coverQuality: 7,
    visibilityRange: 200,
    escapeRoutes: 3,
    description: 'River ford where stagecoaches slow to cross. Good visibility but coach is vulnerable.',
    terrainAdvantages: ['Coach slows down', 'Open sight lines', 'Easy escape'],
  },

  // Longhorn - Kaiowa Mesa Line
  {
    id: 'ambush_grassland_hill',
    name: 'Grassland Hill Road',
    routeId: 'route_longhorn_kaiowa',
    locationType: 'hill_road',
    position: 45,
    coverQuality: 6,
    visibilityRange: 150,
    escapeRoutes: 2,
    description: 'Winding hill road with limited visibility around corners.',
    terrainAdvantages: ['Surprise factor', 'Uphill slows coach', 'Cover from trees'],
  },

  // Whiskey Bend - Spirit Springs
  {
    id: 'ambush_canyon_bridge',
    name: 'Canyon Bridge',
    routeId: 'route_whiskey_spirit',
    locationType: 'bridge',
    position: 50,
    coverQuality: 8,
    visibilityRange: 120,
    escapeRoutes: 1,
    description: 'Wooden bridge over deep canyon. Block the bridge and they can\'t escape.',
    terrainAdvantages: ['Trapped on bridge', 'No escape routes for target', 'Controlled bottleneck'],
  },
  {
    id: 'ambush_canyon_rest',
    name: 'Canyon Rest Station',
    routeId: 'route_whiskey_spirit',
    locationType: 'way_station',
    position: 55,
    coverQuality: 7,
    visibilityRange: 80,
    escapeRoutes: 3,
    description: 'Hit them at the rest stop when passengers are disembarking.',
    terrainAdvantages: ['Passengers vulnerable', 'Guards relaxed', 'Multiple entry points'],
  },

  // Frontera - Wastes (Dangerous Route)
  {
    id: 'ambush_dead_mans_gulch',
    name: 'Dead Man\'s Gulch Ravine',
    routeId: 'route_frontera_wastes',
    locationType: 'canyon_pass',
    position: 40,
    coverQuality: 10,
    visibilityRange: 80,
    escapeRoutes: 4,
    description: 'The most infamous ambush site in the territory. Countless coaches robbed here.',
    terrainAdvantages: ['Perfect cover', 'Zero visibility', 'Multiple escape canyons', 'Legendary spot'],
  },

  // Fort Ashford Circuit
  {
    id: 'ambush_forest_path',
    name: 'Dark Forest Path',
    routeId: 'route_fort_ashford_circuit',
    locationType: 'forest_path',
    position: 30,
    coverQuality: 8,
    visibilityRange: 60,
    escapeRoutes: 2,
    description: 'Dense forest on both sides. Easy to hide, hard to be seen.',
    terrainAdvantages: ['Forest cover', 'Limited visibility', 'Natural concealment'],
  },

  // Spirit Springs - Thunderbird's Perch
  {
    id: 'ambush_oak_grove',
    name: 'Ancient Oak Grove Approach',
    routeId: 'route_spirit_thunderbird',
    locationType: 'forest_path',
    position: 55,
    coverQuality: 7,
    visibilityRange: 100,
    escapeRoutes: 2,
    description: 'Sacred grove approach. High risk - Coalition will respond.',
    terrainAdvantages: ['Tree cover', 'Sacred ground confusion'],
  },

  // Goldfinger's Mining Circuit
  {
    id: 'ambush_mountain_pass',
    name: 'Silver Creek Mountain Pass',
    routeId: 'route_goldfingers_circuit',
    locationType: 'canyon_pass',
    position: 45,
    coverQuality: 9,
    visibilityRange: 90,
    escapeRoutes: 3,
    description: 'Narrow mountain pass. Gold shipments vulnerable here.',
    terrainAdvantages: ['High ground', 'Rocky cover', 'Known gold route'],
  },

  // Wastes - Scar Route
  {
    id: 'ambush_bone_valley',
    name: 'Bone Valley',
    routeId: 'route_wastes_scar',
    locationType: 'narrow_trail',
    position: 60,
    coverQuality: 10,
    visibilityRange: 50,
    escapeRoutes: 1,
    description: 'Cursed ambush site. High reward, high danger from supernatural threats.',
    terrainAdvantages: ['Perfect cover', 'Supernatural confusion', 'Extreme isolation'],
  },
];

/**
 * Stagecoach Ambush Service
 */
export class StagecoachAmbushService {

  /**
   * Get all ambush spots for a route
   */
  static getAmbushSpotsForRoute(routeId: string): AmbushSpot[] {
    return AMBUSH_SPOTS.filter(spot => spot.routeId === routeId);
  }

  /**
   * Get ambush spot by ID
   */
  static getAmbushSpot(spotId: string): AmbushSpot | undefined {
    return AMBUSH_SPOTS.find(spot => spot.id === spotId);
  }

  /**
   * Calculate ambush success chance
   */
  static calculateAmbushChance(
    spot: AmbushSpot,
    attackerLevel: number,
    attackerCount: number,
    targetDangerLevel: number,
    guardCount: number
  ): number {
    // Base chance from cover quality
    let chance = spot.coverQuality * 10; // 10-100%

    // Attacker level bonus
    chance += attackerLevel * 2;

    // Numbers advantage
    const numberAdvantage = attackerCount - guardCount;
    chance += numberAdvantage * 10;

    // Target danger level (more dangerous = better guards)
    chance -= targetDangerLevel * 3;

    // Location type bonuses
    const locationBonuses: Record<AmbushLocationType, number> = {
      canyon_pass: 15,
      river_crossing: 10,
      hill_road: 5,
      bridge: 20,
      way_station: 10,
      forest_path: 12,
      narrow_trail: 18,
    };
    chance += locationBonuses[spot.locationType] || 0;

    // Clamp between 10-95%
    return Math.max(10, Math.min(95, chance));
  }

  /**
   * Setup an ambush
   */
  static async setupAmbush(
    characterId: string,
    routeId: string,
    ambushSpotId: string,
    scheduledTime: Date,
    gangMemberIds?: string[],
    strategy: 'roadblock' | 'canyon_trap' | 'bridge_sabotage' | 'surprise_attack' = 'surprise_attack'
  ): Promise<{
    success: boolean;
    plan?: AmbushPlan;
    estimatedSetupTime: number;
    message: string;
  }> {
    try {
      // Get character
      const character = await Character.findById(characterId);
      if (!character) {
        return {
          success: false,
          estimatedSetupTime: 0,
          message: 'Character not found',
        };
      }

      // Check if character is jailed
      if (character.isCurrentlyJailed()) {
        return {
          success: false,
          estimatedSetupTime: 0,
          message: 'Cannot plan ambush while in jail',
        };
      }

      // Validate route
      const route = getRouteById(routeId);
      if (!route) {
        return {
          success: false,
          estimatedSetupTime: 0,
          message: 'Invalid route',
        };
      }

      // Validate ambush spot
      const spot = this.getAmbushSpot(ambushSpotId);
      if (!spot || spot.routeId !== routeId) {
        return {
          success: false,
          estimatedSetupTime: 0,
          message: 'Invalid ambush spot for this route',
        };
      }

      // Check if character already has an active ambush plan
      const existingPlan = await AmbushPlanModel.findOne({
        characterId: new mongoose.Types.ObjectId(characterId),
        status: { $in: ['planning', 'setup', 'ready'] }
      });

      if (existingPlan) {
        return {
          success: false,
          estimatedSetupTime: 0,
          message: 'You already have an active ambush plan',
        };
      }

      // Validate gang members if provided
      let validatedGangMembers: string[] = [];
      if (gangMemberIds && gangMemberIds.length > 0) {
        if (!character.gangId) {
          return {
            success: false,
            estimatedSetupTime: 0,
            message: 'You must be in a gang to invite gang members',
          };
        }

        // Verify all gang members
        const gang = await Gang.findById(character.gangId);
        if (!gang) {
          return {
            success: false,
            estimatedSetupTime: 0,
            message: 'Gang not found',
          };
        }

        validatedGangMembers = gangMemberIds.filter(memberId =>
          gang.members.some(m => m.characterId.toString() === memberId)
        );
      }

      // Calculate setup time based on strategy
      const setupTimes = {
        roadblock: 30,
        canyon_trap: 45,
        bridge_sabotage: 60,
        surprise_attack: 20,
      };
      const setupTime = setupTimes[strategy];

      // Create ambush plan in database
      const dbPlan = await AmbushPlanModel.create({
        characterId: new mongoose.Types.ObjectId(characterId),
        routeId,
        ambushSpotId,
        scheduledTime,
        setupTime,
        gangMembers: validatedGangMembers,
        strategy,
        objectives: ['cargo', 'strongbox'],
        escapeRoute: `escape_${ambushSpotId}`,
        status: 'planning',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
      });

      // Convert to AmbushPlan interface for return
      const plan: AmbushPlan = {
        characterId,
        routeId,
        ambushSpotId,
        scheduledTime,
        setupTime,
        gangMembers: validatedGangMembers,
        strategy,
        objectives: ['cargo', 'strongbox'],
        escapeRoute: `escape_${ambushSpotId}`,
        status: 'planning',
      };

      logger.info(
        `Character ${character.name} planning ambush at ${spot.name} on route ${route.name}`
      );

      return {
        success: true,
        plan,
        estimatedSetupTime: setupTime,
        message: `Ambush planned at ${spot.name}. Setup time: ${setupTime} minutes`,
      };
    } catch (error) {
      logger.error('Error setting up ambush:', error);
      throw error;
    }
  }

  /**
   * Execute an ambush
   */
  static async executeAmbush(
    characterId: string,
    stagecoachId: string
  ): Promise<AmbushResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Character not found');
      }

      // Get ambush plan from database
      const dbPlan = await AmbushPlanModel.findOne({
        characterId: new mongoose.Types.ObjectId(characterId),
        status: 'ready'
      }).session(session);

      if (!dbPlan) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('No ready ambush plan found');
      }

      // Convert to AmbushPlan interface for processing
      const plan: AmbushPlan = {
        characterId: dbPlan.characterId.toString(),
        routeId: dbPlan.routeId,
        ambushSpotId: dbPlan.ambushSpotId,
        scheduledTime: dbPlan.scheduledTime,
        setupTime: dbPlan.setupTime,
        gangMembers: dbPlan.gangMembers,
        strategy: dbPlan.strategy,
        objectives: dbPlan.objectives,
        escapeRoute: dbPlan.escapeRoute,
        status: dbPlan.status,
      };

      // Get ambush spot
      const spot = this.getAmbushSpot(plan.ambushSpotId);
      if (!spot) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Ambush spot not found');
      }

      // Get route
      const route = getRouteById(plan.routeId);
      if (!route) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Route not found');
      }

      // Simulate stagecoach guards (would normally fetch from stagecoach instance)
      const guardCount = Math.floor(route.dangerLevel / 3);
      const guardLevel = Math.floor(route.dangerLevel / 2) + 3;

      // Get gang members count
      const attackerCount = 1 + (plan.gangMembers?.length || 0);

      // Calculate success chance
      const successChance = this.calculateAmbushChance(
        spot,
        character.level,
        attackerCount,
        route.dangerLevel,
        guardCount
      );

      // Roll for success
      const roll = SecureRNG.d100();
      const success = roll <= successChance;

      // Generate loot based on success
      const lootGained: StagecoachCargoItem[] = [];
      let dollarsGained = 0;

      if (success) {
        // Success! Get loot
        const mailLoot = SecureRNG.range(50, 199);
        lootGained.push({
          type: 'mail',
          description: 'Stolen mail',
          value: mailLoot,
          weight: 30,
          protected: true,
        });
        dollarsGained += mailLoot;

        // Parcels
        const parcelCount = SecureRNG.range(1, 3);
        for (let i = 0; i < parcelCount; i++) {
          const value = SecureRNG.range(25, 99);
          lootGained.push({
            type: 'parcel',
            description: 'Stolen goods',
            value,
            weight: 15,
            protected: false,
          });
          dollarsGained += value;
        }

        // Strongbox (if objectives include it and route has one)
        if (plan.objectives.includes('strongbox') && route.dangerLevel >= 6) {
          const strongboxRoll = SecureRNG.float(0, 1);
          if (strongboxRoll > 0.4) {
            const strongboxValue = SecureRNG.range(500, 1999);
            lootGained.push({
              type: 'strongbox',
              description: 'Wells Fargo Strongbox',
              value: strongboxValue,
              weight: 100,
              protected: true,
            });
            dollarsGained += strongboxValue;
          }
        }
      }

      // Calculate casualties
      const casualties = {
        guards: success ? SecureRNG.range(0, guardCount - 1) : 0,
        passengers: success ? SecureRNG.range(0, 1) : 0,
        attackers: success ? 0 : SecureRNG.range(0, attackerCount - 1),
      };

      // Calculate witnesses
      const witnesses = success ? SecureRNG.range(0, 2) : SecureRNG.range(2, 7);

      // Calculate bounty increase
      const bountyIncrease = Math.floor(dollarsGained / 10) + casualties.guards * 50 + casualties.passengers * 100;

      // Heat level (law response)
      const heatLevel = Math.min(10, Math.floor(route.dangerLevel / 2) + casualties.guards + casualties.passengers);

      // Escaped clean?
      const escapedClean = success && witnesses === 0 && spot.escapeRoutes >= 2;

      // Consequences
      const consequences: string[] = [];
      if (casualties.guards > 0) {
        consequences.push(`Killed ${casualties.guards} guards - major crime`);
      }
      if (casualties.passengers > 0) {
        consequences.push(`Civilian casualties: ${casualties.passengers}`);
      }
      if (witnesses > 0) {
        consequences.push(`${witnesses} witnesses can identify you`);
      }
      if (lootGained.some(l => l.protected)) {
        consequences.push('Stole Wells Fargo property - federal crime');
      }
      if (!escapedClean) {
        consequences.push('Left evidence at scene');
      }

      // Add dollars to character
      if (dollarsGained > 0) {
        await DollarService.addDollars(
          character._id as any,
          dollarsGained,
          TransactionSource.CRIME_PROFIT,
          {
            crimeType: 'stagecoach_robbery',
            location: spot.name,
            description: `Stagecoach ambush loot`,
            currencyType: CurrencyType.DOLLAR,
          },
          session
        );
      }

      // Increase wanted level
      character.increaseWantedLevel(Math.floor(bountyIncrease / 200));
      character.criminalReputation = Math.min(100, character.criminalReputation + Math.floor(dollarsGained / 50));

      await character.save({ session });

      // Update plan status in database
      dbPlan.status = success ? 'executed' : 'failed';
      await dbPlan.save({ session });

      await session.commitTransaction();
      session.endSession();

      const result: AmbushResult = {
        success,
        lootGained,
        goldGained: dollarsGained,
        casualties,
        witnesses,
        bountyIncrease,
        heatLevel,
        escapedClean,
        consequences,
      };

      logger.info(
        `Character ${character.name} ${success ? 'successfully' : 'failed to'} ambush stagecoach. Gained $${dollarsGained}`
      );

      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error executing ambush:', error);
      throw error;
    }
  }

  /**
   * Defend against ambush (as passenger)
   */
  static async defendStagecoach(
    characterId: string,
    stagecoachId: string
  ): Promise<DefenseResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Character not found');
      }

      // Simulate defense (simplified)
      const defendSkill = character.stats.combat + character.getSkillLevel('gunslinger');
      const attackerStrength = SecureRNG.range(10, 29);

      const success = defendSkill > attackerStrength;

      // Calculate rewards
      const dollarsReward = success ? SecureRNG.range(100, 299) : 0;
      const xpReward = success ? SecureRNG.range(100, 249) : 50;
      const reputationGain = success ? SecureRNG.range(10, 29) : 0;

      // Casualties
      const ambushersDefeated = success ? SecureRNG.range(1, 3) : 0;
      const injuredPassengers = success ? 0 : SecureRNG.range(0, 1);
      const damageToStagecoach = success ? SecureRNG.range(0, 19) : SecureRNG.range(20, 69);

      // Cargo lost
      const cargoLost: StagecoachCargoItem[] = [];
      if (!success) {
        const lostValue = SecureRNG.range(100, 399);
        cargoLost.push({
          type: 'parcel',
          description: 'Lost cargo',
          value: lostValue,
          weight: 20,
          protected: false,
        });
      }

      // Award dollars for successful defense
      if (dollarsReward > 0) {
        await DollarService.addDollars(
          character._id as any,
          dollarsReward,
          TransactionSource.BOUNTY_REWARD,
          {
            description: `Defended stagecoach from ambush`,
            currencyType: CurrencyType.DOLLAR,
          },
          session
        );
      }

      // Award XP
      await character.addExperience(xpReward);
      await character.save({ session });

      await session.commitTransaction();
      session.endSession();

      const result: DefenseResult = {
        success,
        ambushersDefeated,
        damageToStagecoach,
        cargoLost,
        goldReward: dollarsReward,
        xpReward,
        reputationGain,
        injuredPassengers,
      };

      logger.info(
        `Character ${character.name} ${success ? 'successfully defended' : 'failed to defend'} stagecoach. Gained $${dollarsReward}, ${xpReward} XP`
      );

      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Error defending stagecoach:', error);
      throw error;
    }
  }

  /**
   * Distribute loot among gang members
   */
  static calculateLootDistribution(
    totalValue: number,
    loot: StagecoachCargoItem[],
    leaderId: string,
    gangMemberIds: string[]
  ): LootDistribution {
    const totalMembers = 1 + gangMemberIds.length; // Leader + members
    const leaderBonus = 0.15; // Leader gets 15% bonus

    // Calculate shares
    const baseShare = (totalValue * (1 - leaderBonus)) / totalMembers;
    const leaderShare = baseShare + (totalValue * leaderBonus);

    const shares = [
      {
        characterId: leaderId,
        characterName: 'Leader',
        sharePercent: Math.floor(((leaderShare / totalValue) * 100)),
        goldAmount: Math.floor(leaderShare),
        items: [], // Leader picks first
      },
    ];

    gangMemberIds.forEach(memberId => {
      shares.push({
        characterId: memberId,
        characterName: 'Gang Member',
        sharePercent: Math.floor(((baseShare / totalValue) * 100)),
        goldAmount: Math.floor(baseShare),
        items: [],
      });
    });

    return {
      totalValue,
      shares,
      leaderBonus: Math.floor(totalValue * leaderBonus),
    };
  }

  /**
   * Get active plan for character
   */
  static async getActivePlan(characterId: string): Promise<AmbushPlan | null> {
    const dbPlan = await AmbushPlanModel.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: { $in: ['planning', 'setup', 'ready'] }
    });

    if (!dbPlan) {
      return null;
    }

    // Convert to AmbushPlan interface
    return {
      characterId: dbPlan.characterId.toString(),
      routeId: dbPlan.routeId,
      ambushSpotId: dbPlan.ambushSpotId,
      scheduledTime: dbPlan.scheduledTime,
      setupTime: dbPlan.setupTime,
      gangMembers: dbPlan.gangMembers,
      strategy: dbPlan.strategy,
      objectives: dbPlan.objectives,
      escapeRoute: dbPlan.escapeRoute,
      status: dbPlan.status,
    };
  }

  /**
   * Cancel ambush plan
   */
  static async cancelPlan(characterId: string): Promise<boolean> {
    const result = await AmbushPlanModel.findOneAndUpdate(
      {
        characterId: new mongoose.Types.ObjectId(characterId),
        status: { $in: ['planning', 'setup', 'ready'] }
      },
      {
        status: 'cancelled'
      }
    );

    return result !== null;
  }
}
