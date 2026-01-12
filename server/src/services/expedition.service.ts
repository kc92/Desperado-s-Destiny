/**
 * Expedition Service
 *
 * Handles expedition planning, execution, and completion for offline progression
 */

import mongoose from 'mongoose';
import { Expedition, IExpedition } from '../models/Expedition.model';
import { Character } from '../models/Character.model';
import {
  ExpeditionType,
  ExpeditionStatus,
  ExpeditionDurationTier,
  ExpeditionOutcome,
  ExpeditionEventType,
  ExpeditionResourceType,
  IExpeditionResult,
  IExpeditionEvent,
  IExpeditionResource,
  IExpeditionDTO,
  IExpeditionAvailability,
  IStartExpeditionRequest,
  EXPEDITION_CONFIGS,
  EXPEDITION_SUCCESS_RATES,
  EXPEDITION_REWARD_MULTIPLIERS,
  EXPEDITION_OUTCOME_MULTIPLIERS,
  EXPEDITION_OUTCOME_THRESHOLDS,
  EXPEDITION_MOUNT_BONUSES,
  EXPEDITION_COOLDOWNS,
  EXPEDITION_MAX_OFFLINE_BONUS_HOURS,
} from '@desperados/shared';
import { Queues, JOB_TYPES } from '../jobs/queues';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';

/**
 * Result of processing completed expeditions
 */
export interface ExpeditionProcessingResult {
  processed: number;
  failed: number;
  totalGoldAwarded: number;
  totalXpAwarded: number;
}

export class ExpeditionService {
  /**
   * Check expedition availability for a character at their current location
   * PERFORMANCE FIX: Uses batched query to avoid N+1 problem
   */
  static async checkAvailability(
    characterId: string,
    locationId: string
  ): Promise<IExpeditionAvailability[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const availabilities: IExpeditionAvailability[] = [];
    const charObjectId = new mongoose.Types.ObjectId(characterId);
    const expeditionTypes = Object.keys(EXPEDITION_CONFIGS) as ExpeditionType[];

    // BATCH QUERY: Get active expedition and all last completed expeditions in parallel
    const [activeExpedition, lastExpeditionsByType] = await Promise.all([
      // Query 1: Check for active expedition
      Expedition.findOne({
        characterId: charObjectId,
        status: ExpeditionStatus.IN_PROGRESS,
      }),

      // Query 2: Get the most recent completed/failed expedition for EACH type in one aggregation
      Expedition.aggregate<{ _id: ExpeditionType; completedAt: Date }>([
        {
          $match: {
            characterId: charObjectId,
            type: { $in: expeditionTypes },
            status: { $in: [ExpeditionStatus.COMPLETED, ExpeditionStatus.FAILED] },
          },
        },
        {
          $sort: { completedAt: -1 },
        },
        {
          $group: {
            _id: '$type',
            completedAt: { $first: '$completedAt' },
          },
        },
      ]),
    ]);

    // Build a map for O(1) lookup of last expedition by type
    const lastExpeditionMap = new Map<ExpeditionType, Date>();
    for (const exp of lastExpeditionsByType) {
      lastExpeditionMap.set(exp._id, exp.completedAt);
    }

    // Now process all expedition types without additional queries
    for (const [type, config] of Object.entries(EXPEDITION_CONFIGS)) {
      const expeditionType = type as ExpeditionType;

      // Check if location is valid for this expedition type
      const isAtValidLocation = config.validStartLocations.includes(locationId);

      // Check level requirement
      const meetsLevelRequirement = !config.minLevel || (character.totalLevel || 1) >= config.minLevel;

      // Check skill requirements
      let meetsSkillRequirements = true;
      if (config.skillRequirements) {
        for (const [skillId, requiredLevel] of Object.entries(config.skillRequirements)) {
          const skill = character.skills?.find((s: any) => s.skillId === skillId);
          if (!skill || skill.level < requiredLevel) {
            meetsSkillRequirements = false;
            break;
          }
        }
      }

      // Check energy
      const hasEnoughEnergy = character.energy >= config.energyCost;

      // Check gold (using dollars)
      const goldCost = config.goldCost || 0;
      const hasEnoughGold = character.dollars >= goldCost;

      // Check cooldown using pre-fetched data (no additional query!)
      const lastCompletedAt = lastExpeditionMap.get(expeditionType);
      let isOnCooldown = false;
      let cooldownEndsAt: Date | undefined;
      if (lastCompletedAt) {
        const cooldownEnd = new Date(
          lastCompletedAt.getTime() + EXPEDITION_COOLDOWNS.SAME_TYPE_COOLDOWN_MS
        );
        if (cooldownEnd > new Date()) {
          isOnCooldown = true;
          cooldownEndsAt = cooldownEnd;
        }
      }

      // Determine if can start
      const canStart =
        isAtValidLocation &&
        meetsLevelRequirement &&
        meetsSkillRequirements &&
        hasEnoughEnergy &&
        hasEnoughGold &&
        !activeExpedition &&
        !isOnCooldown;

      let reason: string | undefined;
      if (!canStart) {
        if (activeExpedition) {
          reason = 'You already have an active expedition';
        } else if (!isAtValidLocation) {
          reason = `Must be at one of: ${config.validStartLocations.join(', ')}`;
        } else if (!meetsLevelRequirement) {
          reason = `Requires level ${config.minLevel}`;
        } else if (!meetsSkillRequirements) {
          reason = 'Skill requirements not met';
        } else if (!hasEnoughEnergy) {
          reason = `Requires ${config.energyCost} energy`;
        } else if (!hasEnoughGold) {
          reason = `Requires $${goldCost}`;
        } else if (isOnCooldown) {
          reason = `On cooldown until ${cooldownEndsAt?.toLocaleString()}`;
        }
      }

      availabilities.push({
        type: expeditionType,
        canStart,
        reason,
        meetsLevelRequirement,
        meetsSkillRequirements,
        meetsItemRequirements: true, // Items not yet required
        hasEnoughEnergy,
        hasEnoughGold,
        isAtValidLocation,
        hasActiveExpedition: !!activeExpedition,
        activeExpeditionId: activeExpedition?._id?.toString(),
        isOnCooldown,
        cooldownEndsAt,
      });
    }

    return availabilities;
  }

  /**
   * Start a new expedition
   */
  static async startExpedition(
    characterId: string,
    locationId: string,
    request: IStartExpeditionRequest
  ): Promise<IExpedition> {
    const lockKey = `lock:expedition:start:${characterId}`;

    return withLock(
      lockKey,
      async () => {
        const session = await mongoose.startSession();

        try {
          await session.startTransaction();

          const character = await Character.findById(characterId).session(session);
          if (!character) {
            throw new Error('Character not found');
          }

          const config = EXPEDITION_CONFIGS[request.type];
          if (!config) {
            throw new Error('Invalid expedition type');
          }

          // Validate location
          if (!config.validStartLocations.includes(locationId)) {
            throw new Error(`Cannot start ${config.name} from this location`);
          }

          // Check for active expedition
          const activeExpedition = await Expedition.findOne({
            characterId: new mongoose.Types.ObjectId(characterId),
            status: ExpeditionStatus.IN_PROGRESS,
          }).session(session);

          if (activeExpedition) {
            throw new Error('You already have an active expedition');
          }

          // Check level
          if (config.minLevel && (character.totalLevel || 1) < config.minLevel) {
            throw new Error(`Requires level ${config.minLevel}`);
          }

          // Check energy
          if (character.energy < config.energyCost) {
            throw new Error(`Requires ${config.energyCost} energy`);
          }

          // Check gold
          const goldCost = config.goldCost || 0;
          if (character.dollars < goldCost) {
            throw new Error(`Requires $${goldCost}`);
          }

          // Calculate duration
          const durationConfig = config.durations[request.durationTier];
          let durationMs = durationConfig.defaultMs;
          if (request.customDurationMs) {
            durationMs = Math.max(
              durationConfig.minMs,
              Math.min(durationConfig.maxMs, request.customDurationMs)
            );
          }

          // Apply mount speed bonus if mount provided
          if (request.mountId) {
            durationMs = Math.floor(durationMs * (1 - EXPEDITION_MOUNT_BONUSES.SPEED_BONUS));
          }

          // Deduct costs
          character.energy -= config.energyCost;
          character.dollars -= goldCost;
          await character.save({ session });

          // Create expedition
          const now = new Date();
          const estimatedCompletionAt = new Date(now.getTime() + durationMs);

          const expedition = await Expedition.create(
            [
              {
                characterId: new mongoose.Types.ObjectId(characterId),
                type: request.type,
                status: ExpeditionStatus.IN_PROGRESS,
                durationTier: request.durationTier,
                startLocationId: locationId,
                startLocationName: locationId, // Would fetch actual name in production
                startedAt: now,
                estimatedCompletionAt,
                durationMs,
                mountId: request.mountId ? new mongoose.Types.ObjectId(request.mountId) : undefined,
                suppliesUsed: request.suppliesItemIds,
                gangMemberIds: request.gangMemberIds?.map((id) => new mongoose.Types.ObjectId(id)),
                energySpent: config.energyCost,
                goldSpent: goldCost,
                eventsEncountered: [],
                currentEventIndex: 0,
              },
            ],
            { session }
          );

          // Schedule completion job
          const delayMs = durationMs;
          const job = await Queues.expeditionComplete.add(
            JOB_TYPES.EXPEDITION_COMPLETE,
            {
              expeditionId: expedition[0]._id.toString(),
              characterId,
            },
            {
              delay: delayMs,
              jobId: `expedition-${expedition[0]._id}`,
              removeOnComplete: true,
              removeOnFail: false,
            }
          );

          // Store job ID on expedition
          expedition[0].jobId = job.id?.toString();
          await expedition[0].save({ session });

          await session.commitTransaction();

          logger.info(
            `Character ${character.name} started ${config.name} expedition, ` +
              `completing at ${estimatedCompletionAt.toISOString()}`
          );

          return expedition[0];
        } catch (error) {
          await session.abortTransaction();
          logger.error('Error starting expedition:', error);
          throw error;
        } finally {
          session.endSession();
        }
      },
      { ttl: 30, retries: 3 }
    );
  }

  /**
   * Cancel an active expedition (partial refund)
   */
  static async cancelExpedition(
    characterId: string,
    expeditionId: string
  ): Promise<void> {
    const lockKey = `lock:expedition:${expeditionId}`;

    await withLock(
      lockKey,
      async () => {
        const session = await mongoose.startSession();

        try {
          await session.startTransaction();

          const expedition = await Expedition.findById(expeditionId).session(session);
          if (!expedition) {
            throw new Error('Expedition not found');
          }

          if (expedition.characterId.toString() !== characterId) {
            throw new Error('Expedition does not belong to this character');
          }

          if (expedition.status !== ExpeditionStatus.IN_PROGRESS) {
            throw new Error('Can only cancel in-progress expeditions');
          }

          // Calculate refund (50% if cancelled in first half, 25% otherwise)
          const now = new Date();
          const elapsed = now.getTime() - expedition.startedAt.getTime();
          const progress = elapsed / expedition.durationMs;

          let refundPercent = 0;
          if (progress < 0.25) {
            refundPercent = 0.75; // 75% refund if cancelled early
          } else if (progress < 0.5) {
            refundPercent = 0.5; // 50% refund
          } else {
            refundPercent = 0.25; // 25% refund if cancelled late
          }

          const energyRefund = Math.floor(expedition.energySpent * refundPercent);
          const goldRefund = Math.floor(expedition.goldSpent * refundPercent);

          // Refund character
          const character = await Character.findById(characterId).session(session);
          if (character) {
            character.energy = Math.min(character.energy + energyRefund, character.maxEnergy);
            character.dollars += goldRefund;
            await character.save({ session });
          }

          // Update expedition
          expedition.status = ExpeditionStatus.CANCELLED;
          expedition.cancelledAt = now;
          await expedition.save({ session });

          // Remove scheduled job if exists
          if (expedition.jobId) {
            try {
              const job = await Queues.expeditionComplete.getJob(expedition.jobId);
              if (job) {
                await job.remove();
              }
            } catch (e) {
              // Job might already be removed, ignore
            }
          }

          await session.commitTransaction();

          logger.info(
            `Expedition ${expeditionId} cancelled. Refunded ${energyRefund} energy, $${goldRefund}`
          );
        } catch (error) {
          await session.abortTransaction();
          logger.error('Error cancelling expedition:', error);
          throw error;
        } finally {
          session.endSession();
        }
      },
      { ttl: 30, retries: 3 }
    );
  }

  /**
   * Process expedition completion - calculate results and award rewards
   */
  static async completeExpedition(expeditionId: string): Promise<IExpeditionResult> {
    const lockKey = `lock:expedition:${expeditionId}`;

    return withLock(
      lockKey,
      async () => {
        const session = await mongoose.startSession();

        try {
          await session.startTransaction();

          const expedition = await Expedition.findById(expeditionId).session(session);
          if (!expedition) {
            throw new Error('Expedition not found');
          }

          if (expedition.status !== ExpeditionStatus.IN_PROGRESS) {
            throw new Error('Expedition is not in progress');
          }

          const character = await Character.findById(expedition.characterId).session(session);
          if (!character) {
            throw new Error('Character not found');
          }

          const config = EXPEDITION_CONFIGS[expedition.type];

          // Calculate outcome
          const outcome = this.calculateOutcome(expedition);

          // Generate events that occurred during expedition
          const events = this.generateEvents(expedition, config);

          // Calculate rewards
          const rewardMultiplier =
            EXPEDITION_REWARD_MULTIPLIERS[expedition.durationTier] *
            EXPEDITION_OUTCOME_MULTIPLIERS[outcome];

          // Apply mount cargo bonus for trade caravans
          let cargoBonus = 1;
          if (expedition.type === ExpeditionType.TRADE_CARAVAN && expedition.mountId) {
            cargoBonus = 1 + EXPEDITION_MOUNT_BONUSES.CARGO_BONUS;
          }

          const totalGold = Math.floor(config.baseGoldReward * rewardMultiplier * cargoBonus);
          const totalXp = Math.floor(config.baseXpReward * rewardMultiplier);

          // Generate resources based on expedition type
          const resources = this.generateResources(expedition, config, rewardMultiplier);

          // Build result
          const result: IExpeditionResult = {
            outcome,
            totalGold,
            totalXp,
            resources,
            events,
            skillXp: [{ skillId: config.primarySkill, amount: totalXp }],
          };

          // Apply rewards to character
          character.dollars += totalGold;

          // Apply skill XP
          const skill = character.skills?.find((s: any) => s.skillId === config.primarySkill);
          if (skill) {
            skill.experience = (skill.experience || 0) + totalXp;
            skill.totalXpEarned = (skill.totalXpEarned || 0) + totalXp;
          }

          // Handle failure penalties (energy cost only - no health system)
          if (outcome === ExpeditionOutcome.FAILURE || outcome === ExpeditionOutcome.CRITICAL_FAILURE) {
            const energyPenalty = outcome === ExpeditionOutcome.CRITICAL_FAILURE ? 20 : 10;
            result.energyLost = energyPenalty;
            character.energy = Math.max(0, (character.energy || 0) - energyPenalty);
          }

          // Handle special discoveries for scouting missions
          if (expedition.type === ExpeditionType.SCOUTING_MISSION && outcome === ExpeditionOutcome.CRITICAL_SUCCESS) {
            // Could discover a new location
            result.locationDiscovered = 'hidden-valley'; // Placeholder
          }

          await character.save({ session });

          // Update expedition
          expedition.status =
            outcome === ExpeditionOutcome.CRITICAL_FAILURE
              ? ExpeditionStatus.FAILED
              : ExpeditionStatus.COMPLETED;
          expedition.completedAt = new Date();
          expedition.result = result;
          expedition.eventsEncountered = events as any;
          await expedition.save({ session });

          await session.commitTransaction();

          logger.info(
            `Expedition ${expeditionId} completed with ${outcome}. ` +
              `Awarded $${totalGold}, ${totalXp} XP`
          );

          return result;
        } catch (error) {
          await session.abortTransaction();
          logger.error('Error completing expedition:', error);
          throw error;
        } finally {
          session.endSession();
        }
      },
      { ttl: 60, retries: 3 }
    );
  }

  /**
   * Calculate expedition outcome based on tier success rate and bonuses
   */
  private static calculateOutcome(expedition: IExpedition): ExpeditionOutcome {
    const baseSuccessRate = EXPEDITION_SUCCESS_RATES[expedition.durationTier];

    // Apply bonuses
    let successRate = baseSuccessRate;
    if (expedition.mountId) {
      successRate += EXPEDITION_MOUNT_BONUSES.SUCCESS_BONUS;
    }

    // Roll for outcome
    const roll = Math.random() * 100;

    // Check thresholds
    if (roll >= EXPEDITION_OUTCOME_THRESHOLDS.CRITICAL_SUCCESS) {
      return ExpeditionOutcome.CRITICAL_SUCCESS;
    }

    // Adjust success threshold based on success rate
    const successThreshold = 100 - successRate * 100;

    if (roll >= successThreshold) {
      return ExpeditionOutcome.SUCCESS;
    }

    if (roll >= EXPEDITION_OUTCOME_THRESHOLDS.PARTIAL_SUCCESS) {
      return ExpeditionOutcome.PARTIAL_SUCCESS;
    }

    if (roll >= EXPEDITION_OUTCOME_THRESHOLDS.FAILURE) {
      return ExpeditionOutcome.FAILURE;
    }

    return ExpeditionOutcome.CRITICAL_FAILURE;
  }

  /**
   * Generate random events that occurred during the expedition
   */
  private static generateEvents(
    expedition: IExpedition,
    config: typeof EXPEDITION_CONFIGS[ExpeditionType]
  ): IExpeditionEvent[] {
    const events: IExpeditionEvent[] = [];
    const eventChance = config.eventChanceByTier[expedition.durationTier];

    // Calculate number of potential events based on duration
    const hours = expedition.durationMs / (60 * 60 * 1000);
    const maxEvents = Math.floor(hours);

    for (let i = 0; i < maxEvents; i++) {
      if (Math.random() < eventChance) {
        const event = this.generateRandomEvent(expedition, i);
        events.push(event);
      }
    }

    return events;
  }

  /**
   * Generate a single random event
   */
  private static generateRandomEvent(expedition: IExpedition, index: number): IExpeditionEvent {
    const eventTypes = Object.values(ExpeditionEventType);
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const outcomeRoll = Math.random();
    const outcome = outcomeRoll > 0.6 ? 'positive' : outcomeRoll > 0.3 ? 'neutral' : 'negative';

    const occurredAt = new Date(
      expedition.startedAt.getTime() +
        (index + 1) * (expedition.durationMs / (Math.floor(expedition.durationMs / (60 * 60 * 1000)) + 1))
    );

    const eventTemplates: Record<ExpeditionEventType, { title: string; description: string }[]> = {
      [ExpeditionEventType.COMBAT]: [
        { title: 'Bandit Ambush', description: 'You were ambushed by bandits on the trail.' },
        { title: 'Wild Animal Attack', description: 'A wild animal attacked your camp.' },
      ],
      [ExpeditionEventType.DISCOVERY]: [
        { title: 'Hidden Cache', description: 'You discovered a hidden cache of supplies.' },
        { title: 'Ancient Artifact', description: 'You found an unusual artifact.' },
      ],
      [ExpeditionEventType.NPC_ENCOUNTER]: [
        { title: 'Traveling Merchant', description: 'You met a traveling merchant.' },
        { title: 'Lost Traveler', description: 'You encountered a lost traveler.' },
      ],
      [ExpeditionEventType.SKILL_CHECK]: [
        { title: 'Treacherous Path', description: 'You navigated a treacherous path.' },
        { title: 'Broken Bridge', description: 'You had to find a way across a broken bridge.' },
      ],
      [ExpeditionEventType.WEATHER]: [
        { title: 'Sudden Storm', description: 'A sudden storm forced you to take shelter.' },
        { title: 'Scorching Heat', description: 'Intense heat slowed your progress.' },
      ],
      [ExpeditionEventType.AMBUSH]: [
        { title: 'Outlaw Trap', description: 'You stumbled into an outlaw trap.' },
        { title: 'Native Warriors', description: 'You encountered hostile native warriors.' },
      ],
    };

    const templates = eventTemplates[type];
    const template = templates[Math.floor(Math.random() * templates.length)];

    const event: IExpeditionEvent = {
      eventId: `event-${expedition._id}-${index}`,
      type,
      title: template.title,
      description: template.description,
      occurredAt,
      outcome,
    };

    // Add rewards/losses based on outcome
    if (outcome === 'positive') {
      event.goldGained = Math.floor(Math.random() * 50) + 10;
      event.xpGained = Math.floor(Math.random() * 20) + 5;
    } else if (outcome === 'negative') {
      event.goldLost = Math.floor(Math.random() * 30) + 5;
      event.healthLost = Math.floor(Math.random() * 10) + 1;
    }

    return event;
  }

  /**
   * Generate resources based on expedition type
   */
  private static generateResources(
    expedition: IExpedition,
    config: typeof EXPEDITION_CONFIGS[ExpeditionType],
    multiplier: number
  ): IExpeditionResource[] {
    const resources: IExpeditionResource[] = [];
    const resourceTypes = config.resourceTypes;

    // Generate 1-3 resource types
    const numResources = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numResources; i++) {
      const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      const quantity = Math.floor((Math.random() * 5 + 1) * multiplier);

      resources.push({
        type,
        quantity,
        itemName: this.getResourceName(type),
      });
    }

    return resources;
  }

  /**
   * Get display name for resource type
   */
  private static getResourceName(type: ExpeditionResourceType): string {
    const names: Record<ExpeditionResourceType, string> = {
      [ExpeditionResourceType.PELT]: 'Animal Pelt',
      [ExpeditionResourceType.MEAT]: 'Fresh Meat',
      [ExpeditionResourceType.HIDE]: 'Leather Hide',
      [ExpeditionResourceType.RARE_HIDE]: 'Rare Hide',
      [ExpeditionResourceType.TROPHY]: 'Animal Trophy',
      [ExpeditionResourceType.ORE]: 'Raw Ore',
      [ExpeditionResourceType.GEM]: 'Gemstone',
      [ExpeditionResourceType.GOLD_NUGGET]: 'Gold Nugget',
      [ExpeditionResourceType.RARE_MINERAL]: 'Rare Mineral',
      [ExpeditionResourceType.GOLD]: 'Gold Coins',
      [ExpeditionResourceType.TRADE_GOODS]: 'Trade Goods',
      [ExpeditionResourceType.RARE_ITEM]: 'Rare Item',
      [ExpeditionResourceType.REPUTATION]: 'Reputation',
      [ExpeditionResourceType.INTEL]: 'Intelligence',
      [ExpeditionResourceType.MAP_FRAGMENT]: 'Map Fragment',
      [ExpeditionResourceType.SHORTCUT]: 'Trail Shortcut',
      [ExpeditionResourceType.LOCATION_DISCOVERY]: 'New Location',
    };
    return names[type] || type;
  }

  /**
   * Get active expedition for a character
   */
  static async getActiveExpedition(characterId: string): Promise<IExpedition | null> {
    return Expedition.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: ExpeditionStatus.IN_PROGRESS,
    });
  }

  /**
   * Get expedition history for a character
   */
  static async getExpeditionHistory(
    characterId: string,
    limit: number = 10
  ): Promise<IExpedition[]> {
    return Expedition.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: { $in: [ExpeditionStatus.COMPLETED, ExpeditionStatus.FAILED, ExpeditionStatus.CANCELLED] },
    })
      .sort({ completedAt: -1 })
      .limit(limit);
  }

  /**
   * Convert expedition to DTO
   */
  static toDTO(expedition: IExpedition): IExpeditionDTO {
    const config = EXPEDITION_CONFIGS[expedition.type];

    return {
      expeditionId: expedition._id.toString(),
      characterId: expedition.characterId.toString(),
      type: expedition.type,
      typeName: config.name,
      status: expedition.status,
      durationTier: expedition.durationTier,
      startLocationId: expedition.startLocationId,
      startLocationName: expedition.startLocationName,
      destinationInfo: expedition.destinationInfo,
      startedAt: expedition.startedAt,
      estimatedCompletionAt: expedition.estimatedCompletionAt,
      completedAt: expedition.completedAt,
      mountId: expedition.mountId?.toString(),
      suppliesUsed: expedition.suppliesUsed,
      gangMemberIds: expedition.gangMemberIds?.map((id) => id.toString()),
      result: expedition.result,
      progressPercent: expedition.progressPercent,
      eventsEncountered: expedition.eventsEncountered.length,
      currentEventDescription: expedition.eventsEncountered[expedition.currentEventIndex]?.description,
    };
  }

  /**
   * Process all due expeditions (called by job processor)
   */
  static async processDueExpeditions(): Promise<ExpeditionProcessingResult> {
    const result: ExpeditionProcessingResult = {
      processed: 0,
      failed: 0,
      totalGoldAwarded: 0,
      totalXpAwarded: 0,
    };

    // Find expeditions that should have completed
    const dueExpeditions = await Expedition.find({
      status: ExpeditionStatus.IN_PROGRESS,
      estimatedCompletionAt: { $lte: new Date() },
    });

    logger.info(`[ExpeditionService] Found ${dueExpeditions.length} due expeditions`);

    for (const expedition of dueExpeditions) {
      try {
        const completionResult = await this.completeExpedition(expedition._id.toString());
        result.processed++;
        result.totalGoldAwarded += completionResult.totalGold;
        result.totalXpAwarded += completionResult.totalXp;
      } catch (error) {
        logger.error(`Error processing expedition ${expedition._id}:`, error);
        result.failed++;
      }
    }

    return result;
  }
}
