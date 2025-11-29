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
import { GoldService } from './gold.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { getRouteById } from '../data/stagecoachRoutes';
import logger from '../utils/logger';

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
   * Active ambush plans (in-memory for now)
   */
  private static activePlans: Map<string, AmbushPlan> = new Map();

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
      const existingPlan = this.activePlans.get(characterId);
      if (existingPlan && existingPlan.status !== 'executed' && existingPlan.status !== 'failed') {
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

      // Create ambush plan
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

      this.activePlans.set(characterId, plan);

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

      // Get ambush plan
      const plan = this.activePlans.get(characterId);
      if (!plan || plan.status !== 'ready') {
        await session.abortTransaction();
        session.endSession();
        throw new Error('No ready ambush plan found');
      }

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
      const roll = Math.random() * 100;
      const success = roll <= successChance;

      // Generate loot based on success
      const lootGained: StagecoachCargoItem[] = [];
      let goldGained = 0;

      if (success) {
        // Success! Get loot
        const mailLoot = Math.floor(Math.random() * 150) + 50;
        lootGained.push({
          type: 'mail',
          description: 'Stolen mail',
          value: mailLoot,
          weight: 30,
          protected: true,
        });
        goldGained += mailLoot;

        // Parcels
        const parcelCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < parcelCount; i++) {
          const value = Math.floor(Math.random() * 75) + 25;
          lootGained.push({
            type: 'parcel',
            description: 'Stolen goods',
            value,
            weight: 15,
            protected: false,
          });
          goldGained += value;
        }

        // Strongbox (if objectives include it and route has one)
        if (plan.objectives.includes('strongbox') && route.dangerLevel >= 6) {
          const strongboxRoll = Math.random();
          if (strongboxRoll > 0.4) {
            const strongboxValue = Math.floor(Math.random() * 1500) + 500;
            lootGained.push({
              type: 'strongbox',
              description: 'Wells Fargo Strongbox',
              value: strongboxValue,
              weight: 100,
              protected: true,
            });
            goldGained += strongboxValue;
          }
        }
      }

      // Calculate casualties
      const casualties = {
        guards: success ? Math.floor(Math.random() * guardCount) : 0,
        passengers: success ? Math.floor(Math.random() * 2) : 0,
        attackers: success ? 0 : Math.floor(Math.random() * attackerCount),
      };

      // Calculate witnesses
      const witnesses = success ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 6) + 2;

      // Calculate bounty increase
      const bountyIncrease = Math.floor(goldGained / 10) + casualties.guards * 50 + casualties.passengers * 100;

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

      // Add gold to character
      if (goldGained > 0) {
        await GoldService.addGold(
          character._id as any,
          goldGained,
          TransactionSource.CRIME_PROFIT,
          {
            crimeType: 'stagecoach_robbery',
            location: spot.name,
            description: `Stagecoach ambush loot`,
          },
          session
        );
      }

      // Increase wanted level
      character.increaseWantedLevel(Math.floor(bountyIncrease / 200));
      character.criminalReputation = Math.min(100, character.criminalReputation + Math.floor(goldGained / 50));

      await character.save({ session });

      // Update plan status
      plan.status = success ? 'executed' : 'failed';
      this.activePlans.set(characterId, plan);

      await session.commitTransaction();
      session.endSession();

      const result: AmbushResult = {
        success,
        lootGained,
        goldGained,
        casualties,
        witnesses,
        bountyIncrease,
        heatLevel,
        escapedClean,
        consequences,
      };

      logger.info(
        `Character ${character.name} ${success ? 'successfully' : 'failed to'} ambush stagecoach. Gained ${goldGained} gold`
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
      const attackerStrength = Math.floor(Math.random() * 20) + 10;

      const success = defendSkill > attackerStrength;

      // Calculate rewards
      const goldReward = success ? Math.floor(Math.random() * 200) + 100 : 0;
      const xpReward = success ? Math.floor(Math.random() * 150) + 100 : 50;
      const reputationGain = success ? Math.floor(Math.random() * 20) + 10 : 0;

      // Casualties
      const ambushersDefeated = success ? Math.floor(Math.random() * 3) + 1 : 0;
      const injuredPassengers = success ? 0 : Math.floor(Math.random() * 2);
      const damageToStagecoach = success ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 50) + 20;

      // Cargo lost
      const cargoLost: StagecoachCargoItem[] = [];
      if (!success) {
        const lostValue = Math.floor(Math.random() * 300) + 100;
        cargoLost.push({
          type: 'parcel',
          description: 'Lost cargo',
          value: lostValue,
          weight: 20,
          protected: false,
        });
      }

      // Award gold for successful defense
      if (goldReward > 0) {
        await GoldService.addGold(
          character._id as any,
          goldReward,
          TransactionSource.BOUNTY_REWARD,
          {
            description: `Defended stagecoach from ambush`,
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
        goldReward,
        xpReward,
        reputationGain,
        injuredPassengers,
      };

      logger.info(
        `Character ${character.name} ${success ? 'successfully defended' : 'failed to defend'} stagecoach. Gained ${goldReward} gold, ${xpReward} XP`
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
  static getActivePlan(characterId: string): AmbushPlan | undefined {
    return this.activePlans.get(characterId);
  }

  /**
   * Cancel ambush plan
   */
  static cancelPlan(characterId: string): boolean {
    const plan = this.activePlans.get(characterId);
    if (!plan || plan.status === 'executed') {
      return false;
    }

    this.activePlans.delete(characterId);
    return true;
  }
}
