/**
 * Train Robbery Service
 *
 * Handles train robbery mechanics including planning, scouting, execution, and consequences
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import {
  TrainType,
  TrainSchedule,
  RobberyApproach,
  RobberyPhase,
  LootType,
  PursuitLevel,
  TrainRobberyPlan,
  TrainRobberyResult,
  RobberyIntelligence,
  RobberyGangMember,
  RobberyEquipment,
  RobberyLoot,
  RobberyCasualty,
  RobberyConsequence,
  PinkertonPursuit,
  PinkertonAgent,
  TrainScoutRequest,
  TRAIN_CONSTANTS,
} from '@desperados/shared';
import { getTrainSchedule, getNextDeparture } from '../data/trainSchedules';
import { getTrainRoute } from '../data/trainRoutes';
import { EnergyService } from './energy.service';
import logger from '../utils/logger';
import { robberyStateManager, pursuitStateManager } from './base/StateManager';
import { SecureRNG } from './base/SecureRNG';
import { SkillService } from './skill.service';

export class TrainRobberyService {
  /**
   * Scout a train to gather intelligence
   */
  static async scoutTrain(request: TrainScoutRequest): Promise<RobberyIntelligence> {
    const character = await Character.findById(request.characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Check energy cost
    if (!character.canAffordAction(TRAIN_CONSTANTS.SCOUTING.ENERGY_COST)) {
      throw new Error('Insufficient energy to scout train');
    }

    // Check cunning requirement
    const effectiveCunning = SkillService.getEffectiveStat(character, 'cunning');
    if (effectiveCunning < TRAIN_CONSTANTS.SCOUTING.CUNNING_REQUIRED) {
      throw new Error(
        `Scouting requires at least ${TRAIN_CONSTANTS.SCOUTING.CUNNING_REQUIRED} Cunning`
      );
    }

    // Get train schedule
    const schedule = getTrainSchedule(request.trainId);
    if (!schedule) {
      throw new Error('Train not found');
    }

    // Spend energy
    await EnergyService.spendEnergy(character._id.toString(), TRAIN_CONSTANTS.SCOUTING.ENERGY_COST, 'scout_train');

    // Generate intelligence based on character's cunning
    const cunningBonus = effectiveCunning / 10;
    const baseAccuracy = 0.6 + cunningBonus * 0.1;

    // Determine guard count (with some randomness)
    const guardVariance = SecureRNG.range(-1, 1);
    const guardCount = Math.max(1, schedule.guards + guardVariance);

    // Estimate cargo value
    const valueAccuracy = SecureRNG.chance(baseAccuracy);
    const estimatedValue = valueAccuracy
      ? schedule.cargoValue || 0
      : Math.floor(((schedule.cargoValue || 0) * SecureRNG.float(0.7, 1.3, 2)));

    // Determine cargo types
    const cargoTypes: LootType[] = this.determineCargoTypes(schedule);

    // Generate vulnerabilities based on cunning
    const vulnerabilities: string[] = [];
    if (effectiveCunning >= 7) {
      vulnerabilities.push('Guard rotation pattern identified at 2-hour intervals');
    }
    if (effectiveCunning >= 5) {
      vulnerabilities.push('Safe located in second-to-last car');
    }
    if (schedule.securityLevel < 5) {
      vulnerabilities.push('Minimal security on rear cars');
    }

    const intelligence: RobberyIntelligence = {
      scouted: true,
      scoutedAt: new Date(),
      guardCount,
      securityLevel: schedule.securityLevel,
      cargoTypes,
      estimatedValue,
      passengerCount: schedule.passengerCount,
      wealthyPassengers:
        schedule.trainType === TrainType.VIP_EXPRESS
          ? schedule.passengerCount
          : Math.floor((schedule.passengerCount || 0) * 0.2),
      safeLocation: 'Second-to-last car',
      guardPatterns: [
        'Two guards patrol passenger cars',
        'One guard stationed at strongbox',
        'Remaining guards in crew car',
      ],
      vulnerabilities,
    };

    logger.info(`Character ${character.name} scouted train ${request.trainId}`);

    return intelligence;
  }

  /**
   * Plan a train robbery
   */
  static async planRobbery(
    plannerId: string,
    trainId: string,
    departureTime: Date,
    approach: RobberyApproach,
    targetLocation: string,
    gangMemberIds: string[],
    equipment: RobberyEquipment[]
  ): Promise<TrainRobberyPlan> {
    const planner = await Character.findById(plannerId);
    if (!planner) {
      throw new Error('Character not found');
    }

    // Validate gang size
    if (
      gangMemberIds.length < TRAIN_CONSTANTS.PLANNING.MIN_GANG_SIZE ||
      gangMemberIds.length > TRAIN_CONSTANTS.PLANNING.MAX_GANG_SIZE
    ) {
      throw new Error(
        `Gang size must be between ${TRAIN_CONSTANTS.PLANNING.MIN_GANG_SIZE} and ${TRAIN_CONSTANTS.PLANNING.MAX_GANG_SIZE} members`
      );
    }

    // Load all gang members
    const gangMembers: RobberyGangMember[] = [];
    let totalCut = 0;

    for (const memberId of gangMemberIds) {
      const member = await Character.findById(memberId);
      if (!member) {
        throw new Error(`Gang member ${memberId} not found`);
      }

      // Assign roles based on stats
      const role = this.assignRole(member, gangMembers);
      const cut = role === 'leader' ? 30 : 15; // Leader gets 30%, others get 15%
      totalCut += cut;

      gangMembers.push({
        characterId: member._id as any,
        characterName: member.name,
        role,
        cut,
        status: 'ready',
      });
    }

    // Ensure total cut doesn't exceed 100%
    if (totalCut > 100) {
      const reduction = totalCut / 100;
      gangMembers.forEach((m) => (m.cut = Math.floor(m.cut / reduction)));
    }

    // Get train schedule
    const schedule = getTrainSchedule(trainId);
    if (!schedule) {
      throw new Error('Train not found');
    }

    // Estimate loot and risk
    const estimatedLoot = schedule.cargoValue || 5000;
    const estimatedRisk = this.calculateRobberyRisk(schedule, approach, gangMembers.length);

    // Create robbery plan
    const plan: TrainRobberyPlan = {
      _id: new mongoose.Types.ObjectId() as any,
      plannerId: planner._id as any,
      plannerName: planner.name,
      targetTrainId: trainId,
      targetRouteName: schedule.trainName,
      targetDepartureTime: departureTime,
      approach,
      targetLocation,
      gangMembers,
      equipment,
      intelligence: {
        scouted: false,
        guardCount: schedule.guards,
        securityLevel: schedule.securityLevel,
        cargoTypes: this.determineCargoTypes(schedule),
        estimatedValue: estimatedLoot,
      },
      estimatedLoot,
      estimatedRisk,
      phase: RobberyPhase.PLANNING,
      createdAt: new Date(),
    };

    // Store plan (3 hour TTL)
    await robberyStateManager.set(plan._id!.toString(), plan, { ttl: 10800 });

    logger.info(
      `Character ${planner.name} planned robbery of train ${trainId} with ${gangMembers.length} gang members`
    );

    return plan;
  }

  /**
   * Execute a train robbery
   */
  static async executeRobbery(robberyId: string): Promise<TrainRobberyResult> {
    const plan = await robberyStateManager.get<TrainRobberyPlan>(robberyId);
    if (!plan) {
      throw new Error('Robbery plan not found');
    }

    if (plan.phase !== RobberyPhase.PLANNING) {
      throw new Error('Robbery has already been executed');
    }

    // Update phase
    plan.phase = RobberyPhase.APPROACH;

    const schedule = getTrainSchedule(plan.targetTrainId);
    if (!schedule) {
      throw new Error('Train not found');
    }

    // Load all gang members
    const gangCharacters: ICharacter[] = [];
    for (const member of plan.gangMembers) {
      const char = await Character.findById(member.characterId);
      if (!char) {
        throw new Error(`Gang member ${member.characterId} not found`);
      }
      gangCharacters.push(char);
    }

    // Calculate success chance
    const successChance = this.calculateSuccessChance(
      schedule,
      plan,
      gangCharacters
    );

    const success = SecureRNG.chance(successChance);

    // Execute robbery phases
    const loot: RobberyLoot[] = [];
    const casualties: RobberyCasualty[] = [];
    const consequences: RobberyConsequence[] = [];
    const gangMembersFate: TrainRobberyResult['gangMembersFate'] = [];
    const narrative: string[] = [];

    narrative.push(
      `Your gang approaches the train using the ${plan.approach.toLowerCase().replace('_', ' ')} method...`
    );

    // Approach Phase
    plan.phase = RobberyPhase.APPROACH;
    if (this.rollPhaseSuccess(successChance * 1.2)) {
      narrative.push('The approach is successful! You reach the train undetected.');
    } else {
      narrative.push('Guards spot you during the approach! Alarm raised!');
      consequences.push({
        type: 'wanted_level',
        severity: 'moderate',
        description: 'Spotted during approach',
        value: 1,
      });
    }

    // Boarding Phase
    plan.phase = RobberyPhase.BOARDING;
    if (this.rollPhaseSuccess(successChance)) {
      narrative.push('You successfully board the train.');
    } else {
      narrative.push('Boarding is contested! Guards engage!');
      plan.phase = RobberyPhase.COMBAT;
    }

    // Combat Phase (if necessary)
    if (plan.phase === RobberyPhase.COMBAT || !success) {
      plan.phase = RobberyPhase.COMBAT;
      const combatResult = this.resolveCombat(
        gangCharacters,
        schedule.guards,
        schedule.securityLevel
      );

      casualties.push(...combatResult.casualties);
      narrative.push(combatResult.narrative);

      if (!combatResult.gangVictory) {
        // Robbery failed
        plan.phase = RobberyPhase.FAILED;
        narrative.push('The guards overwhelm your gang! You must retreat!');

        // Apply consequences to all gang members
        for (let i = 0; i < plan.gangMembers.length; i++) {
          const member = plan.gangMembers[i];
          const character = gangCharacters[i];

          const captured = SecureRNG.chance(0.3);
          const injured = !captured && SecureRNG.chance(0.4);

          gangMembersFate.push({
            characterId: member.characterId.toString(),
            escaped: !captured,
            captured,
            injured,
            killed: false,
            lootShare: 0,
          });

          if (captured) {
            character.sendToJail(180, 500, 'Train Robbery'); // 3 hours, $500 bail
            character.increaseWantedLevel(2);
          } else if (injured) {
            // Apply injury effects (simplified)
            narrative.push(`${character.name} is injured in the fight!`);
          }

          await character.save();
        }

        const result: TrainRobberyResult = {
          robberyId: plan._id as any,
          success: false,
          phase: RobberyPhase.FAILED,
          lootCollected: [],
          totalValue: 0,
          casualties,
          witnessCount: schedule.passengerCount || 0,
          bountyIncrease: TRAIN_CONSTANTS.BOUNTY_INCREASES[schedule.trainType],
          pursuitLevel: PursuitLevel.FEDERAL_MARSHALS,
          gangMembersFate,
          consequences,
          narrative,
          completedAt: new Date(),
        };

        plan.phase = RobberyPhase.FAILED;
        await robberyStateManager.set(robberyId, plan, { ttl: 10800 });

        return result;
      }

      narrative.push('Your gang defeats the guards!');
    }

    // Looting Phase
    plan.phase = RobberyPhase.LOOTING;
    narrative.push('You begin looting the train...');

    // Collect loot based on train type
    const trainLoot = this.generateLoot(schedule, plan.intelligence);
    loot.push(...trainLoot);

    const totalValue = loot.reduce((sum, l) => sum + (l.gold || 0), 0);

    narrative.push(`Total loot collected: $${totalValue}`);

    // Escape Phase
    plan.phase = RobberyPhase.ESCAPE;
    const escapeSuccess = this.rollPhaseSuccess(successChance * 0.9);

    if (escapeSuccess) {
      narrative.push('Your gang escapes successfully!');
    } else {
      narrative.push('Pursuit is close! Some gang members are captured!');
    }

    // Distribute loot and apply consequences
    for (let i = 0; i < plan.gangMembers.length; i++) {
      const member = plan.gangMembers[i];
      const character = gangCharacters[i];

      const escaped = escapeSuccess || SecureRNG.chance(0.7);
      const captured = !escaped;
      const lootShare = escaped ? Math.floor((totalValue * member.cut) / 100) : 0;

      gangMembersFate.push({
        characterId: member.characterId.toString(),
        escaped,
        captured,
        injured: false,
        killed: false,
        lootShare,
      });

      if (escaped && lootShare > 0) {
        character.dollars += lootShare;
      }

      if (captured) {
        character.sendToJail(240, 1000, 'Train Robbery'); // 4 hours, $1000 bail
        character.increaseWantedLevel(TRAIN_CONSTANTS.WANTED_INCREASES[schedule.trainType]);
      } else {
        // Not captured but still increase wanted level
        character.increaseWantedLevel(
          Math.ceil(TRAIN_CONSTANTS.WANTED_INCREASES[schedule.trainType] / 2)
        );
      }

      await character.save();
    }

    // Add consequences
    consequences.push({
      type: 'bounty',
      severity: this.getSeverityForTrainType(schedule.trainType),
      description: `Robbed ${schedule.trainName}`,
      value: TRAIN_CONSTANTS.BOUNTY_INCREASES[schedule.trainType],
    });

    consequences.push({
      type: 'wanted_level',
      severity: this.getSeverityForTrainType(schedule.trainType),
      description: `Train robbery`,
      value: TRAIN_CONSTANTS.WANTED_INCREASES[schedule.trainType],
    });

    // Determine pursuit level
    const pursuitLevel = this.determinePursuitLevel(schedule.trainType, totalValue);

    if (pursuitLevel !== PursuitLevel.NONE) {
      consequences.push({
        type: 'pursuit',
        severity: this.getPursuitSeverity(pursuitLevel),
        description: `${pursuitLevel.replace('_', ' ')} dispatched`,
      });

      // Start Pinkerton pursuit for high-value robberies
      if (
        pursuitLevel === PursuitLevel.PINKERTON_AGENTS ||
        pursuitLevel === PursuitLevel.MILITARY
      ) {
        await this.startPinkertonPursuit(plan, schedule, totalValue);
      }
    }

    // Complete robbery
    plan.phase = RobberyPhase.COMPLETE;
    plan.completedAt = new Date();
    plan.executedAt = new Date();
    await robberyStateManager.set(robberyId, plan, { ttl: 10800 });

    const result: TrainRobberyResult = {
      robberyId: plan._id as any,
      success: true,
      phase: RobberyPhase.COMPLETE,
      lootCollected: loot,
      totalValue,
      casualties,
      witnessCount: schedule.passengerCount || 0,
      bountyIncrease: TRAIN_CONSTANTS.BOUNTY_INCREASES[schedule.trainType],
      pursuitLevel,
      gangMembersFate,
      consequences,
      narrative,
      completedAt: new Date(),
    };

    logger.info(
      `Train robbery ${robberyId} completed. Success: ${success}, Loot: $${totalValue}`
    );

    return result;
  }

  /**
   * Helper: Determine cargo types based on train type
   */
  private static determineCargoTypes(schedule: TrainSchedule): LootType[] {
    const types: LootType[] = [];

    switch (schedule.trainType) {
      case TrainType.PASSENGER:
      case TrainType.VIP_EXPRESS:
        types.push(LootType.PASSENGER_VALUABLES);
        if (schedule.trainType === TrainType.VIP_EXPRESS) {
          types.push(LootType.STRONGBOX);
        }
        break;
      case TrainType.FREIGHT:
        types.push(LootType.CARGO);
        break;
      case TrainType.MILITARY:
        types.push(LootType.MILITARY_PAYROLL, LootType.WEAPONS_SHIPMENT);
        break;
      case TrainType.GOLD_TRAIN:
        types.push(LootType.GOLD_BARS, LootType.STRONGBOX);
        break;
      case TrainType.MAIL_EXPRESS:
        types.push(LootType.MAIL_BAGS);
        break;
      case TrainType.SUPPLY_RUN:
        types.push(LootType.SUPPLIES);
        break;
    }

    return types;
  }

  /**
   * Helper: Assign role to gang member based on stats
   */
  private static assignRole(
    character: ICharacter,
    existingMembers: RobberyGangMember[]
  ): RobberyGangMember['role'] {
    // First member is always leader
    if (existingMembers.length === 0) {
      return 'leader';
    }

    // Assign based on highest stat
    const { combat, cunning, craft } = character.stats;

    if (combat >= cunning && combat >= craft) {
      return 'gunslinger';
    } else if (cunning >= combat && cunning >= craft) {
      const hasLockpick = existingMembers.some((m) => m.role === 'lockpick');
      return hasLockpick ? 'lookout' : 'lockpick';
    } else {
      const hasExplosives = existingMembers.some((m) => m.role === 'explosives');
      return hasExplosives ? 'driver' : 'explosives';
    }
  }

  /**
   * Helper: Calculate robbery risk
   */
  private static calculateRobberyRisk(
    schedule: TrainSchedule,
    approach: RobberyApproach,
    gangSize: number
  ): number {
    let risk = schedule.securityLevel * 10;
    risk += schedule.guards * 5;
    risk *= TRAIN_CONSTANTS.ROBBERY_DIFFICULTY[approach];
    risk -= gangSize * 3;

    return Math.max(10, Math.min(100, risk));
  }

  /**
   * Helper: Calculate success chance
   */
  private static calculateSuccessChance(
    schedule: TrainSchedule,
    plan: TrainRobberyPlan,
    gangCharacters: ICharacter[]
  ): number {
    // Base chance
    let chance = 0.5;

    // Gang size bonus
    chance += plan.gangMembers.length * 0.05;

    // Average gang stats
    const avgCombat =
      gangCharacters.reduce((sum, c) => sum + c.stats.combat, 0) / gangCharacters.length;
    const avgCunning =
      gangCharacters.reduce((sum, c) => sum + c.stats.cunning, 0) / gangCharacters.length;

    chance += avgCombat / 100;
    chance += avgCunning / 100;

    // Approach modifier
    chance *= TRAIN_CONSTANTS.ROBBERY_DIFFICULTY[plan.approach];

    // Security penalty
    chance -= schedule.securityLevel / 100;
    chance -= schedule.guards / 50;

    // Scouting bonus
    if (plan.intelligence.scouted) {
      chance += 0.15;
    }

    return Math.max(0.1, Math.min(0.9, chance));
  }

  /**
   * Helper: Roll for phase success
   */
  private static rollPhaseSuccess(chance: number): boolean {
    return SecureRNG.chance(chance);
  }

  /**
   * Helper: Resolve combat
   */
  private static resolveCombat(
    gangCharacters: ICharacter[],
    guardCount: number,
    securityLevel: number
  ): {
    gangVictory: boolean;
    casualties: RobberyCasualty[];
    narrative: string;
  } {
    const gangPower = gangCharacters.reduce((sum, c) => sum + c.stats.combat, 0);
    const guardPower = guardCount * securityLevel * 5;

    const gangVictory = gangPower > guardPower * 0.8;

    const casualties: RobberyCasualty[] = [];

    // Guard casualties
    const guardsKilled = gangVictory
      ? Math.floor(guardCount * 0.6)
      : Math.floor(guardCount * 0.3);
    for (let i = 0; i < guardsKilled; i++) {
      casualties.push({
        type: 'guard',
        status: SecureRNG.chance(0.5) ? 'killed' : 'injured',
      });
    }

    const narrative = gangVictory
      ? `A fierce gunfight erupts! Your gang's superior firepower prevails. ${guardsKilled} guards fall.`
      : `The guards are well-prepared! Your gang is outmatched.`;

    return { gangVictory, casualties, narrative };
  }

  /**
   * Helper: Generate loot
   */
  private static generateLoot(
    schedule: TrainSchedule,
    intelligence: RobberyIntelligence
  ): RobberyLoot[] {
    const loot: RobberyLoot[] = [];
    const baseValue = schedule.cargoValue || 5000;

    for (const lootType of intelligence.cargoTypes) {
      switch (lootType) {
        case LootType.PASSENGER_VALUABLES:
          loot.push({
            type: LootType.PASSENGER_VALUABLES,
            gold: Math.floor(baseValue * 0.3),
            description: 'Valuables taken from passengers',
          });
          break;
        case LootType.STRONGBOX:
          loot.push({
            type: LootType.STRONGBOX,
            gold: Math.floor(baseValue * 0.5),
            description: 'Contents of the strongbox',
          });
          break;
        case LootType.MILITARY_PAYROLL:
          loot.push({
            type: LootType.MILITARY_PAYROLL,
            gold: Math.floor(baseValue * 0.8),
            description: 'Military payroll chest',
          });
          break;
        case LootType.GOLD_BARS:
          loot.push({
            type: LootType.GOLD_BARS,
            gold: Math.floor(baseValue * 0.9),
            description: 'Gold bars from the reserve car',
          });
          break;
        default:
          loot.push({
            type: lootType,
            gold: Math.floor(baseValue * 0.4),
            description: `${lootType.toLowerCase().replace('_', ' ')}`,
          });
      }
    }

    return loot;
  }

  /**
   * Helper: Determine pursuit level
   */
  private static determinePursuitLevel(trainType: TrainType, lootValue: number): PursuitLevel {
    if (
      trainType === TrainType.GOLD_TRAIN ||
      trainType === TrainType.MILITARY ||
      lootValue > 50000
    ) {
      return trainType === TrainType.MILITARY
        ? PursuitLevel.MILITARY
        : PursuitLevel.PINKERTON_AGENTS;
    }

    if (trainType === TrainType.VIP_EXPRESS || lootValue > 20000) {
      return PursuitLevel.FEDERAL_MARSHALS;
    }

    if (lootValue > 5000) {
      return PursuitLevel.LOCAL_SHERIFF;
    }

    return PursuitLevel.NONE;
  }

  /**
   * Helper: Get severity for train type
   */
  private static getSeverityForTrainType(
    trainType: TrainType
  ): RobberyConsequence['severity'] {
    switch (trainType) {
      case TrainType.GOLD_TRAIN:
      case TrainType.MILITARY:
        return 'extreme';
      case TrainType.VIP_EXPRESS:
      case TrainType.PRISON_TRANSPORT:
        return 'severe';
      case TrainType.FREIGHT:
      case TrainType.SUPPLY_RUN:
        return 'moderate';
      default:
        return 'minor';
    }
  }

  /**
   * Helper: Get pursuit severity
   */
  private static getPursuitSeverity(level: PursuitLevel): RobberyConsequence['severity'] {
    switch (level) {
      case PursuitLevel.MILITARY:
        return 'extreme';
      case PursuitLevel.PINKERTON_AGENTS:
        return 'severe';
      case PursuitLevel.FEDERAL_MARSHALS:
        return 'moderate';
      default:
        return 'minor';
    }
  }

  /**
   * Start Pinkerton pursuit
   */
  private static async startPinkertonPursuit(
    plan: TrainRobberyPlan,
    schedule: TrainSchedule,
    lootValue: number
  ): Promise<void> {
    const duration = TRAIN_CONSTANTS.PURSUIT_DURATION[schedule.trainType];

    // Generate Pinkerton agents based on robbery severity
    const agentCount = Math.min(5, Math.floor(lootValue / 10000) + 1);
    const agents: PinkertonAgent[] = [];

    for (let i = 0; i < agentCount; i++) {
      agents.push({
        name: this.generateAgentName(),
        level: 5 + SecureRNG.range(0, 4),
        specialty: this.randomSpecialty(),
        stats: {
          combat: 50 + SecureRNG.range(0, 29),
          cunning: 50 + SecureRNG.range(0, 29),
          tracking: 60 + SecureRNG.range(0, 39),
        },
      });
    }

    // Create pursuit for each gang member
    for (const member of plan.gangMembers) {
      const pursuit: PinkertonPursuit = {
        _id: new mongoose.Types.ObjectId() as any,
        targetCharacterId: member.characterId,
        targetName: member.characterName,
        robberyId: plan._id as any,
        pursuers: agents,
        startedAt: new Date(),
        endsAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        status: 'active',
        intensity: Math.min(10, Math.floor(lootValue / 10000)),
        encounterChance: 0.2,
        createdAt: new Date(),
      };

      await pursuitStateManager.set(member.characterId.toString(), pursuit, { ttl: 7200 });
    }

    logger.info(
      `Started Pinkerton pursuit for robbery ${plan._id} with ${agentCount} agents for ${duration} days`
    );
  }

  /**
   * Helper: Generate agent name
   */
  private static generateAgentName(): string {
    const firstNames = ['John', 'James', 'William', 'Thomas', 'Robert', 'Charles'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'];
    return `${SecureRNG.select(firstNames)} ${SecureRNG.select(lastNames)}`;
  }

  /**
   * Helper: Random specialty
   */
  private static randomSpecialty(): PinkertonAgent['specialty'] {
    const specialties: PinkertonAgent['specialty'][] = [
      'tracker',
      'gunfighter',
      'detective',
      'negotiator',
    ];
    return SecureRNG.select(specialties);
  }

  /**
   * Get active pursuit for a character
   */
  static async getActivePursuit(characterId: string): Promise<PinkertonPursuit | null> {
    return await pursuitStateManager.get<PinkertonPursuit>(characterId);
  }

  /**
   * Get robbery plan by ID
   */
  static async getRobberyPlan(robberyId: string): Promise<TrainRobberyPlan | null> {
    return await robberyStateManager.get<TrainRobberyPlan>(robberyId);
  }

  /**
   * Get all robbery plans for a character
   */
  static async getCharacterRobberyPlans(characterId: string): Promise<TrainRobberyPlan[]> {
    const plans: TrainRobberyPlan[] = [];
    const allKeys = await robberyStateManager.keys('*');

    for (const key of allKeys) {
      const plan = await robberyStateManager.get<TrainRobberyPlan>(key);
      if (plan && plan.plannerId.toString() === characterId) {
        plans.push(plan);
      }
    }
    return plans;
  }
}
