/**
 * Bull Queue Registry
 *
 * Centralized job queue management using Bull for distributed job processing.
 * All cron jobs are migrated to Bull queues for:
 * - Distributed processing across multiple server instances
 * - Job persistence across server restarts
 * - Built-in retry logic and failure handling
 * - Monitoring via Bull Board or similar tools
 *
 * Phase 5 - Production Hardening Refactor
 */

import Bull, { Queue, Job, JobOptions } from 'bull';
import * as Sentry from '@sentry/node';
import { config } from '../config';
import logger from '../utils/logger';

/**
 * Job result type for standardized responses
 */
export interface JobResult {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
  duration?: number;
}

/**
 * Queue names as const for type safety
 */
export const QUEUE_NAMES = {
  WAR_RESOLUTION: 'war-resolution',
  TERRITORY_MAINTENANCE: 'territory-maintenance',
  BOUNTY_CLEANUP: 'bounty-cleanup',
  MARKETPLACE: 'marketplace',
  INFLUENCE_DECAY: 'influence-decay',
  PRODUCTION: 'production',
  GOSSIP_SPREAD: 'gossip-spread',
  NEWSPAPER_PUBLISHER: 'newspaper-publisher',
  TAX_COLLECTION: 'tax-collection',
  GANG_ECONOMY: 'gang-economy',
  CALENDAR_TICK: 'calendar-tick',
  EVENT_SPAWNER: 'event-spawner',
  HUNTER_TRACKING: 'hunter-tracking',
  NPC_GANG_EVENTS: 'npc-gang-events',
  WAR_EVENT_SCHEDULER: 'war-event-scheduler',
  HORSE_BOND_DECAY: 'horse-bond-decay',
  COMPANION_BOND_DECAY: 'companion-bond-decay',
  DIVINE_MESSAGE: 'divine-message',
  KARMA_EFFECTS: 'karma-effects',
  DEITY_TICK: 'deity-tick',
  COMBAT_TIMEOUT: 'combat-timeout',
  WAR_SCHEDULE: 'war-schedule',
  AUTO_TOURNAMENT: 'auto-tournament',
  POWER_RATING: 'power-rating',
  RAID_EXECUTION: 'raid-execution',
  INVESTMENT_MATURITY: 'investment-maturity',
  WORKER_TASK_PROCESSING: 'worker-task-processing',
  CUSTOMER_TRAFFIC: 'customer-traffic',
  MINING_INSPECTION: 'mining-inspection',
  ASSET_DECAY: 'asset-decay', // Phase 14: Risk Simulation
  INCIDENT_SPAWNER: 'incident-spawner', // Phase 14.2: Incident System
  COMPETITION_UPDATE: 'competition-update', // Phase 14.3: Competition System
  PROTECTION_PAYMENT: 'protection-payment', // Phase 15: Gang Businesses
  ECONOMY_TICK: 'economy-tick', // Phase R2: Economy Foundation
  // PRODUCTION FIX: Dead Letter Queue for permanently failed jobs
  DEAD_LETTER: 'dead-letter-queue',
  // Expedition System - Offline progression
  EXPEDITION_COMPLETE: 'expedition-complete',
  // Training Auto-Complete - Skill training
  TRAINING_COMPLETE: 'training-complete',
  // Orphan Cleanup - Data integrity maintenance
  ORPHAN_CLEANUP: 'orphan-cleanup',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/**
 * Job types for each queue
 */
export const JOB_TYPES = {
  // War Resolution
  AUTO_RESOLVE: 'auto-resolve',

  // Territory
  DAILY_MAINTENANCE: 'daily-maintenance',

  // Bounty
  BOUNTY_EXPIRATION: 'bounty-expiration',
  BOUNTY_DECAY: 'bounty-decay',

  // Marketplace
  ORDER_EXPIRY: 'order-expiry',
  AUCTION_CHECK: 'auction-check',
  PRICE_UPDATE: 'price-update',
  LISTING_CLEANUP: 'listing-cleanup',

  // Influence
  DAILY_DECAY: 'daily-decay',

  // Production
  PRODUCTION_TICK: 'production-tick',
  WEEKLY_WAGES: 'weekly-wages',
  DAILY_WORKER_MAINTENANCE: 'daily-worker-maintenance',

  // Gossip
  HOURLY_SPREAD: 'hourly-spread',
  DAILY_SPREAD: 'daily-spread',

  // Newspaper
  PUBLISH: 'publish',

  // Tax
  DAILY_TAX: 'daily-tax',
  WEEKLY_TAX: 'weekly-tax',

  // Gang Economy
  DAILY_ECONOMY: 'daily-economy',
  WEEKLY_ECONOMY: 'weekly-economy',

  // Calendar
  TICK: 'tick',

  // Events
  SPAWN_EVENTS: 'spawn-events',

  // Hunter
  UPDATE_POSITIONS: 'update-positions',

  // NPC Gang
  NPC_ATTACKS: 'npc-attacks',
  WORLD_EVENTS: 'world-events',
  TRIBUTE_RESET: 'tribute-reset',
  EXPIRE_CHALLENGES: 'expire-challenges',

  // War Event
  SCHEDULE_EVENTS: 'schedule-events',

  // Horse Bond
  BOND_DECAY: 'bond-decay',

  // Companion Bond
  COMPANION_BOND_DECAY: 'companion-bond-decay',

  // Divine Message (Deity System)
  DIVINE_MESSAGE_DELIVERY: 'divine-message-delivery',
  DIVINE_MESSAGE_CLEANUP: 'divine-message-cleanup',

  // Karma Effects (Deity System)
  KARMA_EFFECT_EXPIRATION: 'karma-effect-expiration',
  KARMA_RECORD_CLEANUP: 'karma-record-cleanup',

  // Deity Tick (Phase 5 - Deity AI Engine)
  DEITY_TICK: 'deity-tick',
  DEITY_ATTENTION_CLEANUP: 'deity-attention-cleanup',

  // Combat Timeout (Phase 1 - Tech Debt Fix)
  COMBAT_TIMEOUT_CHECK: 'combat-timeout-check',
  COMBAT_TIMEOUT_WARNING: 'combat-timeout-warning',

  // War Schedule (Phase 2.1 - Weekly War Schedule)
  WAR_PHASE_TRANSITION: 'war-phase-transition',
  WAR_SEASON_CHECK: 'war-season-check',

  // Auto Tournament (Phase 2.1 - Weekly War Schedule)
  BRACKET_GENERATION: 'bracket-generation',

  // Power Rating (Phase 2.1 - Weekly War Schedule)
  POWER_RATING_REFRESH: 'power-rating-refresh',
  POWER_RATING_INITIALIZE: 'power-rating-initialize',

  // Raid Execution (Phase 2.3 - Full Raid System)
  RAID_EXECUTE: 'raid-execute',
  RAID_SCHEDULE_CHECK: 'raid-schedule-check',
  RAID_CLEANUP: 'raid-cleanup',

  // Investment Maturity (Phase 10 - Banking System)
  INVESTMENT_MATURITY: 'investment-maturity',

  // Worker Task Processing (Phase 11 - Full Worker Tasks)
  WORKER_TASK_PROCESS: 'worker-task-process',
  WORKER_STAMINA_REGEN: 'worker-stamina-regen',

  // Customer Traffic (Phase 12 - Business Ownership)
  CUSTOMER_TRAFFIC_PROCESS: 'customer-traffic-process',
  REPUTATION_DECAY: 'reputation-decay',
  DAILY_TRAFFIC_RESET: 'daily-traffic-reset',
  WEEKLY_TRAFFIC_RESET: 'weekly-traffic-reset',
  MONTHLY_TRAFFIC_RESET: 'monthly-traffic-reset',

  // Mining Inspection (Phase 13 - Deep Mining)
  INSPECTOR_PATROL: 'inspector-patrol',
  SUSPICION_DECAY: 'suspicion-decay',
  GANG_PROTECTION_PROCESS: 'gang-protection-process',

  // Incident Spawner (Phase 14.2 - Incident System)
  INCIDENT_SPAWN_CHECK: 'incident-spawn-check',
  INCIDENT_EXPIRE_CHECK: 'incident-expire-check',
  INCIDENT_REMINDER: 'incident-reminder',

  // Competition Update (Phase 14.3 - Competition System)
  COMPETITION_UPDATE_CYCLE: 'competition-update-cycle',
  NPC_BEHAVIOR_PROCESS: 'npc-behavior-process',
  RESOURCE_REGENERATION: 'resource-regeneration',
  NPC_REVENUE_SIMULATION: 'npc-revenue-simulation',

  // Protection Payment (Phase 15 - Gang Businesses)
  WEEKLY_PROTECTION_PAYMENT: 'weekly-protection-payment',

  // Economy Tick (Phase R2 - Economy Foundation)
  ECONOMY_TICK: 'economy-tick',
  ECONOMY_CLEANUP: 'economy-cleanup',

  // Expedition System - Offline progression
  EXPEDITION_COMPLETE: 'expedition-complete',
  EXPEDITION_CHECK: 'expedition-check',

  // Training Auto-Complete - Skill training
  TRAINING_COMPLETE: 'training-complete',

  // Orphan Cleanup - Data integrity maintenance
  ORPHAN_CLEANUP_GANG_REFS: 'orphan-cleanup-gang-refs',
  ORPHAN_CLEANUP_CHARACTER_REFS: 'orphan-cleanup-character-refs',
  ORPHAN_CLEANUP_FULL: 'orphan-cleanup-full',
} as const;

/**
 * Default Bull queue options
 */
const defaultQueueOptions: Bull.QueueOptions = {
  redis: {
    host: new URL(config.database.redisUrl).hostname || 'localhost',
    port: parseInt(new URL(config.database.redisUrl).port || '6379', 10),
    password: config.database.redisPassword || undefined,
  },
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

/**
 * Queue registry - all queues stored here
 */
const queues: Map<QueueName, Queue> = new Map();

/**
 * Create or get a queue by name
 */
function getOrCreateQueue(name: QueueName): Queue {
  if (!queues.has(name)) {
    const queue = new Bull(name, defaultQueueOptions);

    // Add event listeners for logging
    queue.on('error', (error) => {
      logger.error(`Queue ${name} error:`, error);
    });

    queue.on('failed', async (job, error) => {
      const maxAttempts = job.opts.attempts || 1;
      const isPermamentFailure = job.attemptsMade >= maxAttempts;

      // PHASE 5 FIX: Enhanced job failure logging with full context
      logger.error(`Job ${job.id} in queue ${name} failed:`, {
        jobId: job.id,
        jobName: job.name,
        queueName: name,
        error: error.message,
        stack: error.stack,
        attempts: job.attemptsMade,
        maxAttempts,
        isPermanentFailure: isPermamentFailure,
        inputData: job.data,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        returnvalue: job.returnvalue,
        timestamp: new Date(job.timestamp).toISOString(),
      });

      // PRODUCTION FIX: Move permanently failed jobs to Dead Letter Queue
      if (isPermamentFailure && name !== QUEUE_NAMES.DEAD_LETTER) {
        try {
          const dlq = getDeadLetterQueue();
          await dlq.add('failed-job', {
            originalQueue: name,
            originalJobId: job.id,
            originalJobName: job.name,
            originalData: job.data,
            error: error.message,
            stack: error.stack,
            attempts: job.attemptsMade,
            failedAt: new Date().toISOString(),
          }, {
            removeOnComplete: false, // Keep DLQ jobs for review
            removeOnFail: false,
            attempts: 1, // Don't retry DLQ entries
          });
          logger.warn(`Moved permanently failed job ${job.id} to Dead Letter Queue`);

          // Report to Sentry for critical job failures
          Sentry.captureException(error, {
            tags: {
              component: 'job-queue',
              queue: name,
              jobName: job.name || 'unknown',
              severity: 'critical'
            },
            extra: {
              jobId: job.id,
              attempts: job.attemptsMade,
              inputData: job.data,
              message: 'Job moved to Dead Letter Queue after exhausting all retries'
            }
          });
        } catch (dlqError) {
          logger.error('Failed to move job to Dead Letter Queue:', dlqError);
        }
      }
    });

    queue.on('completed', (job, result) => {
      logger.debug(`Job ${job.id} in queue ${name} completed`, {
        jobId: job.id,
        jobName: job.name,
        duration: result?.duration,
      });
    });

    queue.on('stalled', (job) => {
      logger.warn(`Job ${job.id} in queue ${name} stalled`);
    });

    queues.set(name, queue);
  }

  return queues.get(name)!;
}

/**
 * PRODUCTION FIX: Get the Dead Letter Queue for failed jobs
 * This queue stores jobs that failed all retry attempts for later review
 */
function getDeadLetterQueue(): Queue {
  return getOrCreateQueue(QUEUE_NAMES.DEAD_LETTER);
}

/**
 * All queues - created lazily on first access
 */
export const Queues = {
  get warResolution() {
    return getOrCreateQueue(QUEUE_NAMES.WAR_RESOLUTION);
  },
  get territoryMaintenance() {
    return getOrCreateQueue(QUEUE_NAMES.TERRITORY_MAINTENANCE);
  },
  get bountyCleanup() {
    return getOrCreateQueue(QUEUE_NAMES.BOUNTY_CLEANUP);
  },
  get marketplace() {
    return getOrCreateQueue(QUEUE_NAMES.MARKETPLACE);
  },
  get influenceDecay() {
    return getOrCreateQueue(QUEUE_NAMES.INFLUENCE_DECAY);
  },
  get production() {
    return getOrCreateQueue(QUEUE_NAMES.PRODUCTION);
  },
  get gossipSpread() {
    return getOrCreateQueue(QUEUE_NAMES.GOSSIP_SPREAD);
  },
  get newspaperPublisher() {
    return getOrCreateQueue(QUEUE_NAMES.NEWSPAPER_PUBLISHER);
  },
  get taxCollection() {
    return getOrCreateQueue(QUEUE_NAMES.TAX_COLLECTION);
  },
  get gangEconomy() {
    return getOrCreateQueue(QUEUE_NAMES.GANG_ECONOMY);
  },
  get calendarTick() {
    return getOrCreateQueue(QUEUE_NAMES.CALENDAR_TICK);
  },
  get eventSpawner() {
    return getOrCreateQueue(QUEUE_NAMES.EVENT_SPAWNER);
  },
  get hunterTracking() {
    return getOrCreateQueue(QUEUE_NAMES.HUNTER_TRACKING);
  },
  get npcGangEvents() {
    return getOrCreateQueue(QUEUE_NAMES.NPC_GANG_EVENTS);
  },
  get warEventScheduler() {
    return getOrCreateQueue(QUEUE_NAMES.WAR_EVENT_SCHEDULER);
  },
  get horseBondDecay() {
    return getOrCreateQueue(QUEUE_NAMES.HORSE_BOND_DECAY);
  },
  get companionBondDecay() {
    return getOrCreateQueue(QUEUE_NAMES.COMPANION_BOND_DECAY);
  },
  get divineMessage() {
    return getOrCreateQueue(QUEUE_NAMES.DIVINE_MESSAGE);
  },
  get karmaEffects() {
    return getOrCreateQueue(QUEUE_NAMES.KARMA_EFFECTS);
  },
  get deityTick() {
    return getOrCreateQueue(QUEUE_NAMES.DEITY_TICK);
  },
  get combatTimeout() {
    return getOrCreateQueue(QUEUE_NAMES.COMBAT_TIMEOUT);
  },
  get warSchedule() {
    return getOrCreateQueue(QUEUE_NAMES.WAR_SCHEDULE);
  },
  get autoTournament() {
    return getOrCreateQueue(QUEUE_NAMES.AUTO_TOURNAMENT);
  },
  get powerRating() {
    return getOrCreateQueue(QUEUE_NAMES.POWER_RATING);
  },
  get raidExecution() {
    return getOrCreateQueue(QUEUE_NAMES.RAID_EXECUTION);
  },
  get investmentMaturity() {
    return getOrCreateQueue(QUEUE_NAMES.INVESTMENT_MATURITY);
  },
  get workerTaskProcessing() {
    return getOrCreateQueue(QUEUE_NAMES.WORKER_TASK_PROCESSING);
  },
  get customerTraffic() {
    return getOrCreateQueue(QUEUE_NAMES.CUSTOMER_TRAFFIC);
  },
  get miningInspection() {
    return getOrCreateQueue(QUEUE_NAMES.MINING_INSPECTION);
  },
  // Phase 14: Risk Simulation - Asset Decay
  get assetDecay() {
    return getOrCreateQueue(QUEUE_NAMES.ASSET_DECAY);
  },
  // Phase 14.2: Incident System
  get incidentSpawner() {
    return getOrCreateQueue(QUEUE_NAMES.INCIDENT_SPAWNER);
  },
  // Phase 14.3: Competition System
  get competitionUpdate() {
    return getOrCreateQueue(QUEUE_NAMES.COMPETITION_UPDATE);
  },
  // Phase 15: Gang Businesses - Protection Payment
  get protectionPayment() {
    return getOrCreateQueue(QUEUE_NAMES.PROTECTION_PAYMENT);
  },
  // Phase R2: Economy Foundation - Economy Tick
  get economyTick() {
    return getOrCreateQueue(QUEUE_NAMES.ECONOMY_TICK);
  },
  // PRODUCTION FIX: Dead Letter Queue for failed jobs
  get deadLetter() {
    return getDeadLetterQueue();
  },
  // Expedition System - Offline progression
  get expeditionComplete() {
    return getOrCreateQueue(QUEUE_NAMES.EXPEDITION_COMPLETE);
  },
  // Training Auto-Complete - Skill training
  get trainingComplete() {
    return getOrCreateQueue(QUEUE_NAMES.TRAINING_COMPLETE);
  },
  // Orphan Cleanup - Data integrity maintenance
  get orphanCleanup() {
    return getOrCreateQueue(QUEUE_NAMES.ORPHAN_CLEANUP);
  },
};

/**
 * Helper to wrap job execution with timing and error handling
 *
 * PHASE 5 FIX: Enhanced error logging with full context
 */
export async function executeJob<T>(
  jobName: string,
  executor: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<JobResult> {
  const startTime = Date.now();

  try {
    const result = await executor();
    const duration = Date.now() - startTime;

    logger.info(`Job ${jobName} completed in ${duration}ms`);

    return {
      success: true,
      message: `${jobName} completed successfully`,
      data: result as Record<string, unknown>,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Enhanced error logging with full context
    logger.error(`Job ${jobName} failed after ${duration}ms:`, {
      jobName,
      duration,
      error: errorMessage,
      stack: errorStack,
      context: context || {},
      timestamp: new Date().toISOString(),
    });

    // Re-throw to let Bull handle retry logic
    throw error;
  }
}

/**
 * Register all job processors
 * This should be called once during server startup
 */
export async function registerProcessors(): Promise<void> {
  logger.info('Registering Bull queue processors...');

  // War Resolution - Every 5 minutes
  Queues.warResolution.process(JOB_TYPES.AUTO_RESOLVE, async () => {
    const { GangWarService } = await import('../services/gangWar.service');
    return executeJob('War Resolution', () => GangWarService.autoResolveWars());
  });

  // Territory Maintenance - Daily at midnight
  Queues.territoryMaintenance.process(JOB_TYPES.DAILY_MAINTENANCE, async () => {
    const { runTerritoryMaintenanceNow } = await import('./territoryMaintenance');
    return executeJob('Territory Maintenance', () => runTerritoryMaintenanceNow());
  });

  // Bounty Cleanup - Two jobs
  Queues.bountyCleanup.process(JOB_TYPES.BOUNTY_EXPIRATION, async () => {
    const { BountyService } = await import('../services/bounty.service');
    return executeJob('Bounty Expiration', () => BountyService.expireOldBounties());
  });

  Queues.bountyCleanup.process(JOB_TYPES.BOUNTY_DECAY, async () => {
    const { BountyService } = await import('../services/bounty.service');
    return executeJob('Bounty Decay', () => BountyService.decayBounties());
  });

  // Marketplace - Multiple jobs
  Queues.marketplace.process(JOB_TYPES.ORDER_EXPIRY, async () => {
    const { MarketplaceService } = await import('../services/marketplace.service');
    return executeJob('Order Expiry Check', async () => {
      // Process both ended auctions and expired listings
      const auctionsProcessed = await MarketplaceService.processEndedAuctions();
      const expiredProcessed = await MarketplaceService.processExpiredListings();
      return { auctionsProcessed, expiredProcessed };
    });
  });

  Queues.marketplace.process(JOB_TYPES.AUCTION_CHECK, async () => {
    const { MarketplaceService } = await import('../services/marketplace.service');
    return executeJob('Auction Check', () => MarketplaceService.processEndedAuctions());
  });

  Queues.marketplace.process(JOB_TYPES.PRICE_UPDATE, async () => {
    const { PriceHistory } = await import('../models/PriceHistory.model');
    return executeJob('Price History Update', async () => {
      // Get all price histories that need updating (have sales in last 24h)
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentHistories = await PriceHistory.find({
        lastSaleAt: { $gte: cutoff }
      }).select('itemId').lean();

      if (recentHistories.length === 0) {
        return { itemsUpdated: 0 };
      }

      // Use batch update to avoid N+1 query issue
      const itemIds = recentHistories.map(h => h.itemId);
      const updated = await PriceHistory.batchUpdateStats(itemIds);
      return { itemsUpdated: updated };
    });
  });

  // Marketplace - Listing cleanup hourly
  Queues.marketplace.process(JOB_TYPES.LISTING_CLEANUP, async () => {
    const { MarketplaceService } = await import('../services/marketplace.service');
    return executeJob('Listing Cleanup', async () => {
      const deleted = await MarketplaceService.cleanupOldListings(30);
      return { deletedListings: deleted };
    });
  });

  // Influence Decay - Daily at 3 AM
  Queues.influenceDecay.process(JOB_TYPES.DAILY_DECAY, async () => {
    const { runInfluenceDecay } = await import('./influenceDecay.job');
    return executeJob('Influence Decay', () => runInfluenceDecay());
  });

  // Production - Multiple schedules
  Queues.production.process(JOB_TYPES.PRODUCTION_TICK, async () => {
    const { productionTick } = await import('./productionTick.job');
    return executeJob('Production Tick', () => productionTick());
  });

  Queues.production.process(JOB_TYPES.WEEKLY_WAGES, async () => {
    const { weeklyWagePayment } = await import('./productionTick.job');
    return executeJob('Weekly Wages', () => weeklyWagePayment());
  });

  Queues.production.process(JOB_TYPES.DAILY_WORKER_MAINTENANCE, async () => {
    const { dailyMaintenance } = await import('./productionTick.job');
    return executeJob('Worker Maintenance', () => dailyMaintenance());
  });

  // Gossip Spread
  Queues.gossipSpread.process(JOB_TYPES.HOURLY_SPREAD, async () => {
    const { GossipSpreadJob } = await import('./gossipSpread.job');
    return executeJob('Hourly Gossip Spread', () => GossipSpreadJob.runHourlySpread());
  });

  Queues.gossipSpread.process(JOB_TYPES.DAILY_SPREAD, async () => {
    const { GossipSpreadJob } = await import('./gossipSpread.job');
    return executeJob('Daily Gossip Spread', () => GossipSpreadJob.runDailySpread());
  });

  // Newspaper Publisher - Daily at 6 AM
  Queues.newspaperPublisher.process(JOB_TYPES.PUBLISH, async () => {
    const { newspaperPublisherJob } = await import('./newspaperPublisher.job');
    return executeJob('Newspaper Publisher', () => newspaperPublisherJob.run());
  });

  // Tax Collection
  Queues.taxCollection.process(JOB_TYPES.DAILY_TAX, async () => {
    const { runDailyTaxJobs } = await import('./weeklyTaxCollection.job');
    return executeJob('Daily Tax Jobs', () => runDailyTaxJobs());
  });

  Queues.taxCollection.process(JOB_TYPES.WEEKLY_TAX, async () => {
    const { runWeeklyTaxCollection } = await import('./weeklyTaxCollection.job');
    return executeJob('Weekly Tax Collection', () => runWeeklyTaxCollection());
  });

  // Gang Economy
  Queues.gangEconomy.process(JOB_TYPES.DAILY_ECONOMY, async () => {
    const { runDailyEconomyJobs } = await import('./gangEconomyJobs');
    return executeJob('Daily Gang Economy', () => runDailyEconomyJobs());
  });

  Queues.gangEconomy.process(JOB_TYPES.WEEKLY_ECONOMY, async () => {
    const { runWeeklyEconomyJobs } = await import('./gangEconomyJobs');
    return executeJob('Weekly Gang Economy', () => runWeeklyEconomyJobs());
  });

  // Calendar Tick - Daily at midnight
  Queues.calendarTick.process(JOB_TYPES.TICK, async () => {
    const { calendarTickJob } = await import('./calendarTick.job');
    return executeJob('Calendar Tick', () => calendarTickJob.run());
  });

  // Event Spawner - Hourly
  Queues.eventSpawner.process(JOB_TYPES.SPAWN_EVENTS, async () => {
    const { spawnEvents } = await import('./eventSpawner.job');
    return executeJob('Event Spawner', () => spawnEvents());
  });

  // Hunter Tracking - Hourly
  Queues.hunterTracking.process(JOB_TYPES.UPDATE_POSITIONS, async () => {
    const { BountyHunterService } = await import('../services/bountyHunter.service');
    return executeJob('Hunter Tracking', () => BountyHunterService.updateHunterPositions());
  });

  // NPC Gang Events - Multiple jobs
  Queues.npcGangEvents.process(JOB_TYPES.NPC_ATTACKS, async () => {
    const { Gang } = await import('../models/Gang.model');
    const { NPCGangRelationship } = await import('../models/NPCGangRelationship.model');
    const { NPCGangConflictService } = await import('../services/npcGangConflict.service');
    const { ALL_NPC_GANGS } = await import('../data/npcGangs');
    const { RelationshipAttitude } = await import('@desperados/shared');
    const { SecureRNG } = await import('../services/base/SecureRNG');

    return executeJob('NPC Gang Attacks', async () => {
      // Get all active gang IDs first
      const playerGangs = await Gang.find({ isActive: true }).select('_id').lean();
      if (playerGangs.length === 0) {
        return { attacksProcessed: 0 };
      }

      const gangIds = playerGangs.map(g => g._id);

      // Batch fetch ALL hostile/conflict relationships in one query
      const hostileRelationships = await NPCGangRelationship.find({
        playerGangId: { $in: gangIds },
        $or: [
          { attitude: RelationshipAttitude.HOSTILE },
          { activeConflict: true }
        ]
      }).lean();

      if (hostileRelationships.length === 0) {
        return { attacksProcessed: 0 };
      }

      // Build NPC gang lookup map for efficiency
      const npcGangMap = new Map(ALL_NPC_GANGS.map(g => [g.id, g]));

      // Build list of attacks to process
      const attacksToProcess: Array<{gangId: unknown; npcGangId: string; attackType: string; npcGangName: string}> = [];

      for (const relationship of hostileRelationships) {
        if (!SecureRNG.chance(0.7)) continue;

        const npcGang = npcGangMap.get(relationship.npcGangId);
        if (!npcGang) continue;

        const attackPattern = SecureRNG.select(npcGang.attackPatterns);
        attacksToProcess.push({
          gangId: relationship.playerGangId,
          npcGangId: npcGang.id,
          attackType: attackPattern.type,
          npcGangName: npcGang.name
        });
      }

      // PRODUCTION FIX: Process attacks in batches with controlled concurrency
      // This prevents server crash from 1000s of simultaneous attack operations
      const BATCH_SIZE = 10; // Max 10 concurrent attack operations
      let attackCount = 0;

      for (let i = 0; i < attacksToProcess.length; i += BATCH_SIZE) {
        const batch = attacksToProcess.slice(i, i + BATCH_SIZE);

        const batchResults = await Promise.allSettled(
          batch.map(attack =>
            NPCGangConflictService.processNPCAttack(attack.gangId, attack.npcGangId, attack.attackType)
              .then(() => true)
              .catch(error => {
                logger.error(`Error processing attack from ${attack.npcGangName}:`, error);
                return false;
              })
          )
        );

        // Count successful attacks
        attackCount += batchResults.filter(r => r.status === 'fulfilled' && r.value === true).length;
      }

      return { attacksProcessed: attackCount, totalAttempted: attacksToProcess.length };
    });
  });

  Queues.npcGangEvents.process(JOB_TYPES.TRIBUTE_RESET, async () => {
    const { NPCGangRelationship } = await import('../models/NPCGangRelationship.model');
    return executeJob('Tribute Reset', async () => {
      const result = await NPCGangRelationship.updateMany(
        { tributePaid: true },
        {
          $set: { tributePaid: false },
          $inc: { tributeStreak: -1 },
        }
      );
      return { resetCount: result.modifiedCount };
    });
  });

  Queues.npcGangEvents.process(JOB_TYPES.EXPIRE_CHALLENGES, async () => {
    const { NPCGangRelationship } = await import('../models/NPCGangRelationship.model');
    return executeJob('Expire Challenges', async () => {
      const now = new Date();

      // Use updateMany with $unset for efficient batch update
      const result = await NPCGangRelationship.updateMany(
        { 'challengeProgress.expiresAt': { $lt: now } },
        { $unset: { challengeProgress: 1 } }
      );

      return { expiredCount: result.modifiedCount };
    });
  });

  // War Event Scheduler - Hourly
  Queues.warEventScheduler.process(JOB_TYPES.SCHEDULE_EVENTS, async () => {
    const { scheduleWarEvents } = await import('./warEventScheduler.job');
    return executeJob('War Event Scheduler', () => scheduleWarEvents());
  });

  // Horse Bond Decay - Daily
  Queues.horseBondDecay.process(JOB_TYPES.BOND_DECAY, async () => {
    const { processHorseBondDecay } = await import('./horseBondDecay.job');
    return executeJob('Horse Bond Decay', () => processHorseBondDecay());
  });

  // Companion Bond Decay - Daily
  Queues.companionBondDecay.process(JOB_TYPES.COMPANION_BOND_DECAY, async () => {
    const { processCompanionBondDecay } = await import('./companionBondDecay.job');
    return executeJob('Companion Bond Decay', () => processCompanionBondDecay());
  });

  // Divine Message Delivery - Every 30 seconds
  Queues.divineMessage.process(JOB_TYPES.DIVINE_MESSAGE_DELIVERY, async () => {
    const { processDivineMessages } = await import('./divineMessageDelivery.job');
    return executeJob('Divine Message Delivery', () => processDivineMessages());
  });

  // Divine Message Cleanup - Daily
  Queues.divineMessage.process(JOB_TYPES.DIVINE_MESSAGE_CLEANUP, async () => {
    const { cleanupOldManifestations } = await import('./divineMessageDelivery.job');
    return executeJob('Divine Message Cleanup', () => cleanupOldManifestations());
  });

  // Karma Effect Expiration - Hourly
  Queues.karmaEffects.process(JOB_TYPES.KARMA_EFFECT_EXPIRATION, async () => {
    const { processExpiredEffects } = await import('./karmaEffectExpiration.job');
    return executeJob('Karma Effect Expiration', () => processExpiredEffects());
  });

  // Karma Record Cleanup - Daily
  Queues.karmaEffects.process(JOB_TYPES.KARMA_RECORD_CLEANUP, async () => {
    const { cleanupStaleKarmaRecords } = await import('./karmaEffectExpiration.job');
    return executeJob('Karma Record Cleanup', () => cleanupStaleKarmaRecords());
  });

  // Deity Tick - Every 10 minutes (Phase 5 - Deity AI Engine)
  Queues.deityTick.process(JOB_TYPES.DEITY_TICK, async () => {
    const { processDeityTick } = await import('./deityTick.job');
    return executeJob('Deity Tick', () => processDeityTick());
  });

  // Deity Attention Cleanup - Daily
  Queues.deityTick.process(JOB_TYPES.DEITY_ATTENTION_CLEANUP, async () => {
    const { cleanupStaleAttention } = await import('./deityTick.job');
    return executeJob('Deity Attention Cleanup', () => cleanupStaleAttention());
  });

  // Combat Timeout Check - Every 30 seconds (Phase 1 Tech Debt)
  Queues.combatTimeout.process(JOB_TYPES.COMBAT_TIMEOUT_CHECK, async () => {
    const { processTimedOutEncounters } = await import('./combatTimeout.job');
    return executeJob('Combat Timeout Check', () => processTimedOutEncounters());
  });

  // Combat Timeout Warning - Every 10 seconds (Phase 1 Tech Debt)
  Queues.combatTimeout.process(JOB_TYPES.COMBAT_TIMEOUT_WARNING, async () => {
    const { sendTimeoutWarnings } = await import('./combatTimeout.job');
    return executeJob('Combat Timeout Warning', () => sendTimeoutWarnings(30));
  });

  // War Schedule Phase Transition - Hourly (Phase 2.1 Weekly War Schedule)
  Queues.warSchedule.process(JOB_TYPES.WAR_PHASE_TRANSITION, async () => {
    const { processPhaseTransition } = await import('./warSchedulePhase.job');
    return executeJob('War Phase Transition', () => processPhaseTransition());
  });

  // War Season Check - Weekly (Phase 2.1 Weekly War Schedule)
  Queues.warSchedule.process(JOB_TYPES.WAR_SEASON_CHECK, async () => {
    const { checkSeasonTransition } = await import('./warSchedulePhase.job');
    return executeJob('War Season Check', () => checkSeasonTransition());
  });

  // Auto Tournament Bracket Generation - Thursday 23:30 UTC (Phase 2.1)
  Queues.autoTournament.process(JOB_TYPES.BRACKET_GENERATION, async () => {
    const { generateTournamentBrackets } = await import('./warSchedulePhase.job');
    return executeJob('Tournament Bracket Generation', () => generateTournamentBrackets());
  });

  // Power Rating Refresh - Every 4 hours (Phase 2.1)
  Queues.powerRating.process(JOB_TYPES.POWER_RATING_REFRESH, async () => {
    const { refreshStalePowerRatings } = await import('./warSchedulePhase.job');
    return executeJob('Power Rating Refresh', () => refreshStalePowerRatings());
  });

  // Power Rating Initialize - On startup (Phase 2.1)
  Queues.powerRating.process(JOB_TYPES.POWER_RATING_INITIALIZE, async () => {
    const { WarTierService } = await import('../services/warTier.service');
    return executeJob('Power Rating Initialize', () => WarTierService.initializeRatings());
  });

  // Raid Execution - Execute scheduled raids (Phase 2.3)
  Queues.raidExecution.process(JOB_TYPES.RAID_EXECUTE, async (job) => {
    const { RaidService } = await import('../services/raid.service');
    const { raidId } = job.data;
    return executeJob('Raid Execute', async () => {
      if (raidId) {
        // Execute specific raid
        const result = await RaidService.executeRaid(raidId);
        return { raidId: raidId.toString(), result };
      }
      return { skipped: true, reason: 'No raidId provided' };
    });
  });

  // Raid Schedule Check - Check for scheduled raids to execute (Phase 2.3)
  Queues.raidExecution.process(JOB_TYPES.RAID_SCHEDULE_CHECK, async () => {
    const { Raid } = await import('../models/Raid.model');
    const { RaidService } = await import('../services/raid.service');
    return executeJob('Raid Schedule Check', async () => {
      const readyRaids = await (Raid as any).findReadyForExecution();
      let executed = 0;

      for (const raid of readyRaids) {
        try {
          await RaidService.executeRaid(raid._id);
          executed++;
        } catch (error) {
          logger.error(`Failed to execute raid ${raid._id}:`, error);
        }
      }

      return { raidsExecuted: executed };
    });
  });

  // Raid Cleanup - Clean old cancelled/planning raids (Phase 2.3)
  Queues.raidExecution.process(JOB_TYPES.RAID_CLEANUP, async () => {
    const { Raid } = await import('../models/Raid.model');
    const { RaidStatus } = await import('@desperados/shared');
    return executeJob('Raid Cleanup', async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Delete old cancelled raids
      const cancelledResult = await Raid.deleteMany({
        status: RaidStatus.CANCELLED,
        updatedAt: { $lt: weekAgo },
      });

      // Auto-cancel stale planning raids (older than 24h)
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const staleResult = await Raid.updateMany(
        {
          status: RaidStatus.PLANNING,
          plannedAt: { $lt: dayAgo },
        },
        {
          status: RaidStatus.CANCELLED,
          completedAt: new Date(),
        }
      );

      return {
        deletedCancelled: cancelledResult.deletedCount || 0,
        autoCancelled: staleResult.modifiedCount || 0,
      };
    });
  });

  // Investment Maturity - Daily (Phase 10 - Banking System)
  Queues.investmentMaturity.process(JOB_TYPES.INVESTMENT_MATURITY, async () => {
    const { processMaturedInvestments } = await import('./investmentMaturity.job');
    return executeJob('Investment Maturity', () => processMaturedInvestments());
  });

  // Worker Task Processing (Phase 11 - Full Worker Tasks)
  Queues.workerTaskProcessing.process(JOB_TYPES.WORKER_TASK_PROCESS, async () => {
    const { processWorkerTasks } = await import('./workerTaskProcessor.job');
    return executeJob('Worker Task Processing', () => processWorkerTasks());
  });

  Queues.workerTaskProcessing.process(JOB_TYPES.WORKER_STAMINA_REGEN, async () => {
    const { regenerateWorkerStamina } = await import('./workerTaskProcessor.job');
    return executeJob('Worker Stamina Regeneration', () => regenerateWorkerStamina());
  });

  // Customer Traffic Processing (Phase 12 - Business Ownership)
  Queues.customerTraffic.process(JOB_TYPES.CUSTOMER_TRAFFIC_PROCESS, async () => {
    const { processCustomerTraffic } = await import('./customerTraffic.job');
    return executeJob('Customer Traffic Processing', () => processCustomerTraffic());
  });

  Queues.customerTraffic.process(JOB_TYPES.REPUTATION_DECAY, async () => {
    const { processReputationDecay } = await import('./customerTraffic.job');
    return executeJob('Business Reputation Decay', () => processReputationDecay());
  });

  Queues.customerTraffic.process(JOB_TYPES.DAILY_TRAFFIC_RESET, async () => {
    const { resetDailyTrafficStats } = await import('./customerTraffic.job');
    return executeJob('Daily Traffic Stats Reset', () => resetDailyTrafficStats());
  });

  Queues.customerTraffic.process(JOB_TYPES.WEEKLY_TRAFFIC_RESET, async () => {
    const { resetWeeklyTrafficStats } = await import('./customerTraffic.job');
    return executeJob('Weekly Traffic Stats Reset', () => resetWeeklyTrafficStats());
  });

  Queues.customerTraffic.process(JOB_TYPES.MONTHLY_TRAFFIC_RESET, async () => {
    const { resetMonthlyTrafficStats } = await import('./customerTraffic.job');
    return executeJob('Monthly Traffic Stats Reset', () => resetMonthlyTrafficStats());
  });

  // Mining Inspection (Phase 13 - Deep Mining)
  Queues.miningInspection.process(JOB_TYPES.INSPECTOR_PATROL, async () => {
    const { runInspectorPatrol } = await import('./miningInspection.job');
    return executeJob('Mining Inspector Patrol', () => runInspectorPatrol());
  });

  Queues.miningInspection.process(JOB_TYPES.SUSPICION_DECAY, async () => {
    const { runSuspicionDecay } = await import('./miningInspection.job');
    return executeJob('Suspicion Decay', () => runSuspicionDecay());
  });

  Queues.miningInspection.process(JOB_TYPES.GANG_PROTECTION_PROCESS, async () => {
    const { runGangProtectionProcessing } = await import('./miningInspection.job');
    return executeJob('Gang Protection Processing', () => runGangProtectionProcessing());
  });

  // Asset Decay (Phase 14 - Risk Simulation)
  Queues.assetDecay.process(JOB_TYPES.DAILY_DECAY, async () => {
    const { runDecayProcessor } = await import('./decayProcessor.job');
    return executeJob('Asset Decay Processing', () => runDecayProcessor());
  });

  // Incident Spawner (Phase 14.2 - Incident System)
  Queues.incidentSpawner.process(JOB_TYPES.INCIDENT_SPAWN_CHECK, async () => {
    const { runIncidentSpawner } = await import('./incidentSpawner.job');
    return executeJob('Incident Spawn Check', () => runIncidentSpawner());
  });

  // Competition Update (Phase 14.3 - Competition System)
  Queues.competitionUpdate.process(JOB_TYPES.COMPETITION_UPDATE_CYCLE, async () => {
    const { runCompetitionUpdate } = await import('./competitionUpdate.job');
    return executeJob('Competition Update Cycle', () => runCompetitionUpdate());
  });

  Queues.competitionUpdate.process(JOB_TYPES.NPC_REVENUE_SIMULATION, async () => {
    const { runNPCRevenueSimulation } = await import('./competitionUpdate.job');
    return executeJob('NPC Revenue Simulation', () => runNPCRevenueSimulation());
  });

  // Protection Payment (Phase 15 - Gang Businesses)
  Queues.protectionPayment.process(JOB_TYPES.WEEKLY_PROTECTION_PAYMENT, async () => {
    const { runWeeklyProtectionPayments } = await import('./protectionPayment.job');
    return executeJob('Weekly Protection Payments', () => runWeeklyProtectionPayments());
  });

  // Economy Tick (Phase R2 - Economy Foundation)
  Queues.economyTick.process(JOB_TYPES.ECONOMY_TICK, async () => {
    const { processEconomyTick } = await import('./economyTick.job');
    return executeJob('Economy Tick', () => processEconomyTick());
  });

  Queues.economyTick.process(JOB_TYPES.ECONOMY_CLEANUP, async () => {
    const { cleanupStaleEconomyData } = await import('./economyTick.job');
    return executeJob('Economy Cleanup', () => cleanupStaleEconomyData());
  });

  // Orphan Cleanup - Weekly data integrity checks
  Queues.orphanCleanup.process(JOB_TYPES.ORPHAN_CLEANUP_FULL, async () => {
    const { runFullOrphanCleanup } = await import('./orphanCleanup.job');
    return executeJob('Full Orphan Cleanup', () => runFullOrphanCleanup());
  });

  Queues.orphanCleanup.process(JOB_TYPES.ORPHAN_CLEANUP_GANG_REFS, async () => {
    const { cleanupOrphanedGangReferences } = await import('./orphanCleanup.job');
    return executeJob('Gang Orphan Cleanup', () => cleanupOrphanedGangReferences());
  });

  Queues.orphanCleanup.process(JOB_TYPES.ORPHAN_CLEANUP_CHARACTER_REFS, async () => {
    const { cleanupOrphanedCharacterReferences } = await import('./orphanCleanup.job');
    return executeJob('Character Orphan Cleanup', () => cleanupOrphanedCharacterReferences());
  });

  logger.info('All Bull queue processors registered');
}

/**
 * Schedule all recurring jobs
 * Uses Bull's repeat option for cron-like scheduling
 */
export async function scheduleRecurringJobs(): Promise<void> {
  logger.info('Scheduling recurring Bull jobs...');

  // Remove any existing repeatable jobs first to prevent duplicates
  await cleanupExistingSchedules();

  const repeatableJobOptions: JobOptions = {
    removeOnComplete: true,
    removeOnFail: false,
  };

  // War Resolution - Every 5 minutes
  await Queues.warResolution.add(
    JOB_TYPES.AUTO_RESOLVE,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '*/5 * * * *' },
      jobId: 'war-resolution-recurring',
    }
  );

  // Territory Maintenance - Daily at midnight UTC
  await Queues.territoryMaintenance.add(
    JOB_TYPES.DAILY_MAINTENANCE,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * *', tz: 'UTC' },
      jobId: 'territory-maintenance-recurring',
    }
  );

  // Bounty Cleanup - Every 15 minutes for expiration
  await Queues.bountyCleanup.add(
    JOB_TYPES.BOUNTY_EXPIRATION,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '*/15 * * * *' },
      jobId: 'bounty-expiration-recurring',
    }
  );

  // Bounty Decay - Daily at midnight UTC
  await Queues.bountyCleanup.add(
    JOB_TYPES.BOUNTY_DECAY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * *', tz: 'UTC' },
      jobId: 'bounty-decay-recurring',
    }
  );

  // Marketplace - Order expiry every minute
  await Queues.marketplace.add(
    JOB_TYPES.ORDER_EXPIRY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '* * * * *' },
      jobId: 'marketplace-expiry-recurring',
    }
  );

  // Marketplace - Auction check every 5 minutes
  await Queues.marketplace.add(
    JOB_TYPES.AUCTION_CHECK,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '*/5 * * * *' },
      jobId: 'marketplace-auction-recurring',
    }
  );

  // Marketplace - Price update hourly
  await Queues.marketplace.add(
    JOB_TYPES.PRICE_UPDATE,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 * * * *' },
      jobId: 'marketplace-price-recurring',
    }
  );

  // Marketplace - Listing cleanup hourly
  await Queues.marketplace.add(
    JOB_TYPES.LISTING_CLEANUP,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '30 * * * *' }, // At minute 30 of every hour
      jobId: 'marketplace-cleanup-recurring',
    }
  );

  // Influence Decay - Daily at 3 AM UTC
  await Queues.influenceDecay.add(
    JOB_TYPES.DAILY_DECAY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 3 * * *', tz: 'UTC' },
      jobId: 'influence-decay-recurring',
    }
  );

  // Production Tick - Every 5 minutes
  await Queues.production.add(
    JOB_TYPES.PRODUCTION_TICK,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '*/5 * * * *' },
      jobId: 'production-tick-recurring',
    }
  );

  // Production - Daily worker maintenance at 1 AM UTC
  await Queues.production.add(
    JOB_TYPES.DAILY_WORKER_MAINTENANCE,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 1 * * *', tz: 'UTC' },
      jobId: 'production-maintenance-recurring',
    }
  );

  // Production - Weekly wages on Sundays at midnight UTC
  await Queues.production.add(
    JOB_TYPES.WEEKLY_WAGES,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * 0', tz: 'UTC' },
      jobId: 'production-wages-recurring',
    }
  );

  // Gossip Spread - Hourly
  await Queues.gossipSpread.add(
    JOB_TYPES.HOURLY_SPREAD,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 * * * *' },
      jobId: 'gossip-hourly-recurring',
    }
  );

  // Gossip Spread - Daily at 2 AM UTC
  await Queues.gossipSpread.add(
    JOB_TYPES.DAILY_SPREAD,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 2 * * *', tz: 'UTC' },
      jobId: 'gossip-daily-recurring',
    }
  );

  // Newspaper Publisher - Daily at 6 AM UTC
  await Queues.newspaperPublisher.add(
    JOB_TYPES.PUBLISH,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 6 * * *', tz: 'UTC' },
      jobId: 'newspaper-publish-recurring',
    }
  );

  // Tax Collection - Daily at 1 AM UTC
  await Queues.taxCollection.add(
    JOB_TYPES.DAILY_TAX,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 1 * * *', tz: 'UTC' },
      jobId: 'tax-daily-recurring',
    }
  );

  // Tax Collection - Weekly on Sunday at midnight UTC
  await Queues.taxCollection.add(
    JOB_TYPES.WEEKLY_TAX,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * 0', tz: 'UTC' },
      jobId: 'tax-weekly-recurring',
    }
  );

  // Gang Economy - Daily at midnight UTC
  await Queues.gangEconomy.add(
    JOB_TYPES.DAILY_ECONOMY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * *', tz: 'UTC' },
      jobId: 'gang-economy-daily-recurring',
    }
  );

  // Gang Economy - Weekly on Sunday at midnight UTC
  await Queues.gangEconomy.add(
    JOB_TYPES.WEEKLY_ECONOMY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * 0', tz: 'UTC' },
      jobId: 'gang-economy-weekly-recurring',
    }
  );

  // Calendar Tick - Daily at midnight UTC
  await Queues.calendarTick.add(
    JOB_TYPES.TICK,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * *', tz: 'UTC' },
      jobId: 'calendar-tick-recurring',
    }
  );

  // Event Spawner - Hourly
  await Queues.eventSpawner.add(
    JOB_TYPES.SPAWN_EVENTS,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 * * * *' },
      jobId: 'event-spawner-recurring',
    }
  );

  // Hunter Tracking - Hourly
  await Queues.hunterTracking.add(
    JOB_TYPES.UPDATE_POSITIONS,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 * * * *' },
      jobId: 'hunter-tracking-recurring',
    }
  );

  // NPC Gang Attacks - Daily at midnight UTC
  await Queues.npcGangEvents.add(
    JOB_TYPES.NPC_ATTACKS,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * *', tz: 'UTC' },
      jobId: 'npc-attacks-recurring',
    }
  );

  // NPC Tribute Reset - Weekly on Monday at midnight UTC
  await Queues.npcGangEvents.add(
    JOB_TYPES.TRIBUTE_RESET,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * 1', tz: 'UTC' },
      jobId: 'npc-tribute-reset-recurring',
    }
  );

  // NPC Expire Challenges - Daily at 3 AM UTC
  await Queues.npcGangEvents.add(
    JOB_TYPES.EXPIRE_CHALLENGES,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 3 * * *', tz: 'UTC' },
      jobId: 'npc-expire-challenges-recurring',
    }
  );

  // War Event Scheduler - Hourly
  await Queues.warEventScheduler.add(
    JOB_TYPES.SCHEDULE_EVENTS,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 * * * *' },
      jobId: 'war-event-scheduler-recurring',
    }
  );

  // Horse Bond Decay - Daily at 3 AM UTC
  await Queues.horseBondDecay.add(
    JOB_TYPES.BOND_DECAY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 3 * * *', tz: 'UTC' },
      jobId: 'horse-bond-decay-recurring',
    }
  );

  // Companion Bond Decay - Daily at 3:30 AM UTC
  await Queues.companionBondDecay.add(
    JOB_TYPES.COMPANION_BOND_DECAY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '30 3 * * *', tz: 'UTC' },
      jobId: 'companion-bond-decay-recurring',
    }
  );

  // Divine Message Delivery - Every 30 seconds
  await Queues.divineMessage.add(
    JOB_TYPES.DIVINE_MESSAGE_DELIVERY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '*/1 * * * *' }, // Every minute (closest to 30s with cron)
      jobId: 'divine-message-delivery-recurring',
    }
  );

  // Divine Message Cleanup - Daily at 4 AM UTC
  await Queues.divineMessage.add(
    JOB_TYPES.DIVINE_MESSAGE_CLEANUP,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 4 * * *', tz: 'UTC' },
      jobId: 'divine-message-cleanup-recurring',
    }
  );

  // Karma Effect Expiration - Hourly
  await Queues.karmaEffects.add(
    JOB_TYPES.KARMA_EFFECT_EXPIRATION,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 * * * *' },
      jobId: 'karma-effect-expiration-recurring',
    }
  );

  // Karma Record Cleanup - Daily at 4:30 AM UTC
  await Queues.karmaEffects.add(
    JOB_TYPES.KARMA_RECORD_CLEANUP,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '30 4 * * *', tz: 'UTC' },
      jobId: 'karma-record-cleanup-recurring',
    }
  );

  // Deity Tick - Every 10 minutes (Phase 5 - Deity AI Engine)
  await Queues.deityTick.add(
    JOB_TYPES.DEITY_TICK,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '*/10 * * * *' },
      jobId: 'deity-tick-recurring',
    }
  );

  // Deity Attention Cleanup - Daily at 5 AM UTC
  await Queues.deityTick.add(
    JOB_TYPES.DEITY_ATTENTION_CLEANUP,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 5 * * *', tz: 'UTC' },
      jobId: 'deity-attention-cleanup-recurring',
    }
  );

  // Combat Timeout Check - Every 15 seconds (increased frequency to reduce exploitation window)
  // Using every: 15000 for sub-minute scheduling
  await Queues.combatTimeout.add(
    JOB_TYPES.COMBAT_TIMEOUT_CHECK,
    {},
    {
      ...repeatableJobOptions,
      repeat: { every: 15000 }, // Every 15 seconds (reduced from 30s to prevent stalling)
      jobId: 'combat-timeout-check-recurring',
    }
  );

  // Combat Timeout Warning - Every 10 seconds (Phase 1 Tech Debt)
  await Queues.combatTimeout.add(
    JOB_TYPES.COMBAT_TIMEOUT_WARNING,
    {},
    {
      ...repeatableJobOptions,
      repeat: { every: 10000 }, // Every 10 seconds
      jobId: 'combat-timeout-warning-recurring',
    }
  );

  // War Schedule Phase Transition - Hourly (Phase 2.1)
  await Queues.warSchedule.add(
    JOB_TYPES.WAR_PHASE_TRANSITION,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 * * * *' }, // Every hour at minute 0
      jobId: 'war-phase-transition-recurring',
    }
  );

  // War Season Check - Weekly on Sunday at 23:55 UTC (Phase 2.1)
  await Queues.warSchedule.add(
    JOB_TYPES.WAR_SEASON_CHECK,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '55 23 * * 0', tz: 'UTC' }, // Sunday at 23:55 UTC
      jobId: 'war-season-check-recurring',
    }
  );

  // Auto Tournament Bracket Generation - Thursday at 23:30 UTC (Phase 2.1)
  await Queues.autoTournament.add(
    JOB_TYPES.BRACKET_GENERATION,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '30 23 * * 4', tz: 'UTC' }, // Thursday at 23:30 UTC
      jobId: 'bracket-generation-recurring',
    }
  );

  // Power Rating Refresh - Every 4 hours (Phase 2.1)
  await Queues.powerRating.add(
    JOB_TYPES.POWER_RATING_REFRESH,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 */4 * * *' }, // Every 4 hours
      jobId: 'power-rating-refresh-recurring',
    }
  );

  // Raid Schedule Check - Every 5 minutes (Phase 2.3)
  await Queues.raidExecution.add(
    JOB_TYPES.RAID_SCHEDULE_CHECK,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '*/5 * * * *' }, // Every 5 minutes
      jobId: 'raid-schedule-check-recurring',
    }
  );

  // Raid Cleanup - Daily at 4 AM UTC (Phase 2.3)
  await Queues.raidExecution.add(
    JOB_TYPES.RAID_CLEANUP,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 4 * * *', tz: 'UTC' }, // Daily at 4 AM UTC
      jobId: 'raid-cleanup-recurring',
    }
  );

  // Investment Maturity - Daily at 2 AM UTC (Phase 10 - Banking System)
  await Queues.investmentMaturity.add(
    JOB_TYPES.INVESTMENT_MATURITY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 2 * * *', tz: 'UTC' }, // Daily at 2 AM UTC
      jobId: 'investment-maturity-recurring',
    }
  );

  // Worker Task Processing - Every 5 minutes (Phase 11 - Full Worker Tasks)
  await Queues.workerTaskProcessing.add(
    JOB_TYPES.WORKER_TASK_PROCESS,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '*/5 * * * *', tz: 'UTC' }, // Every 5 minutes
      jobId: 'worker-task-process-recurring',
    }
  );

  // Worker Stamina Regeneration - Hourly (Phase 11 - Full Worker Tasks)
  await Queues.workerTaskProcessing.add(
    JOB_TYPES.WORKER_STAMINA_REGEN,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 * * * *', tz: 'UTC' }, // Every hour at minute 0
      jobId: 'worker-stamina-regen-recurring',
    }
  );

  // Customer Traffic Processing - Every 5 minutes (Phase 12 - Business Ownership)
  await Queues.customerTraffic.add(
    JOB_TYPES.CUSTOMER_TRAFFIC_PROCESS,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '*/5 * * * *', tz: 'UTC' }, // Every 5 minutes
      jobId: 'customer-traffic-process-recurring',
    }
  );

  // Business Reputation Decay - Daily at midnight UTC (Phase 12)
  await Queues.customerTraffic.add(
    JOB_TYPES.REPUTATION_DECAY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * *', tz: 'UTC' }, // Daily at midnight
      jobId: 'reputation-decay-recurring',
    }
  );

  // Daily Traffic Stats Reset - Daily at midnight UTC (Phase 12)
  await Queues.customerTraffic.add(
    JOB_TYPES.DAILY_TRAFFIC_RESET,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '5 0 * * *', tz: 'UTC' }, // Daily at 00:05 (after reputation decay)
      jobId: 'daily-traffic-reset-recurring',
    }
  );

  // Weekly Traffic Stats Reset - Monday at midnight UTC (Phase 12)
  await Queues.customerTraffic.add(
    JOB_TYPES.WEEKLY_TRAFFIC_RESET,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '10 0 * * 1', tz: 'UTC' }, // Monday at 00:10
      jobId: 'weekly-traffic-reset-recurring',
    }
  );

  // Monthly Traffic Stats Reset - 1st of each month at midnight UTC (Phase 12)
  await Queues.customerTraffic.add(
    JOB_TYPES.MONTHLY_TRAFFIC_RESET,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '15 0 1 * *', tz: 'UTC' }, // 1st of month at 00:15
      jobId: 'monthly-traffic-reset-recurring',
    }
  );

  // Mining Inspector Patrol - Every 2 hours (Phase 13 - Deep Mining)
  await Queues.miningInspection.add(
    JOB_TYPES.INSPECTOR_PATROL,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 */2 * * *', tz: 'UTC' }, // Every 2 hours
      jobId: 'inspector-patrol-recurring',
    }
  );

  // Suspicion Decay - Daily at 5 AM UTC (Phase 13 - Deep Mining)
  await Queues.miningInspection.add(
    JOB_TYPES.SUSPICION_DECAY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 5 * * *', tz: 'UTC' }, // Daily at 5 AM UTC
      jobId: 'suspicion-decay-recurring',
    }
  );

  // Gang Protection Processing - Daily at 6 AM UTC (Phase 13 - Deep Mining)
  await Queues.miningInspection.add(
    JOB_TYPES.GANG_PROTECTION_PROCESS,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 6 * * *', tz: 'UTC' }, // Daily at 6 AM UTC
      jobId: 'gang-protection-process-recurring',
    }
  );

  // Asset Decay - Daily at 4 AM UTC (Phase 14 - Risk Simulation)
  await Queues.assetDecay.add(
    JOB_TYPES.DAILY_DECAY,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 4 * * *', tz: 'UTC' }, // Daily at 4 AM UTC
      jobId: 'asset-decay-recurring',
    }
  );

  // Incident Spawner (Phase 14.2) - Every 30 minutes
  await Queues.incidentSpawner.add(
    JOB_TYPES.INCIDENT_SPAWN_CHECK,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '*/30 * * * *', tz: 'UTC' }, // Every 30 minutes
      jobId: 'incident-spawner-recurring',
    }
  );

  // Competition Update (Phase 14.3) - Every hour for NPC behavior
  await Queues.competitionUpdate.add(
    JOB_TYPES.COMPETITION_UPDATE_CYCLE,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 * * * *', tz: 'UTC' }, // Every hour at minute 0
      jobId: 'competition-update-recurring',
    }
  );

  // NPC Revenue Simulation (Phase 14.3) - Weekly on Sundays at midnight
  await Queues.competitionUpdate.add(
    JOB_TYPES.NPC_REVENUE_SIMULATION,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 0 * * 0', tz: 'UTC' }, // Every Sunday at midnight
      jobId: 'npc-revenue-simulation-recurring',
    }
  );

  // Protection Payment (Phase 15) - Weekly on Sundays at noon UTC
  await Queues.protectionPayment.add(
    JOB_TYPES.WEEKLY_PROTECTION_PAYMENT,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 12 * * 0', tz: 'UTC' }, // Every Sunday at noon UTC
      jobId: 'weekly-protection-payment-recurring',
    }
  );

  // Economy Tick (Phase R2) - Hourly at minute 0
  await Queues.economyTick.add(
    JOB_TYPES.ECONOMY_TICK,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 * * * *', tz: 'UTC' }, // Every hour at minute 0
      jobId: 'economy-tick-recurring',
    }
  );

  // Economy Cleanup (Phase R2) - Daily at 5:30 AM UTC
  await Queues.economyTick.add(
    JOB_TYPES.ECONOMY_CLEANUP,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '30 5 * * *', tz: 'UTC' }, // Daily at 5:30 AM UTC
      jobId: 'economy-cleanup-recurring',
    }
  );

  // Orphan Cleanup - Weekly on Sunday at 2 AM UTC (low-traffic time)
  await Queues.orphanCleanup.add(
    JOB_TYPES.ORPHAN_CLEANUP_FULL,
    {},
    {
      ...repeatableJobOptions,
      repeat: { cron: '0 2 * * 0', tz: 'UTC' }, // Every Sunday at 2 AM UTC
      jobId: 'orphan-cleanup-full-recurring',
    }
  );

  logger.info('All recurring Bull jobs scheduled');
}

/**
 * Clean up existing repeatable jobs to prevent duplicates on restart
 */
async function cleanupExistingSchedules(): Promise<void> {
  for (const [name, queue] of queues) {
    try {
      const repeatableJobs = await queue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        await queue.removeRepeatableByKey(job.key);
      }
      if (repeatableJobs.length > 0) {
        logger.debug(`Cleaned up ${repeatableJobs.length} repeatable jobs from ${name}`);
      }
    } catch (error) {
      logger.warn(`Error cleaning up repeatable jobs for ${name}:`, error);
    }
  }
}

/**
 * Initialize the job system
 * Call this during server startup
 */
export async function initializeJobSystem(): Promise<void> {
  logger.info('Initializing Bull job system...');

  try {
    // Register all processors
    await registerProcessors();

    // Schedule recurring jobs
    await scheduleRecurringJobs();

    logger.info('Bull job system initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Bull job system:', error);
    throw error;
  }
}

/**
 * Graceful shutdown of all queues
 * Call this during server shutdown
 *
 * PHASE 5 FIX: Added queue pause, wait for active jobs, and timeout protection
 */
export async function shutdownJobSystem(): Promise<void> {
  logger.info('Shutting down Bull job system...');

  const SHUTDOWN_TIMEOUT = 30000; // 30 seconds max wait per queue

  // Step 1: Pause all queues to stop accepting new jobs
  logger.info('Pausing all queues...');
  const pausePromises: Promise<void>[] = [];
  for (const [name, queue] of queues) {
    pausePromises.push(
      queue.pause(true).then(() => {
        logger.debug(`Queue ${name} paused`);
      }).catch(err => {
        logger.warn(`Failed to pause queue ${name}:`, err);
      })
    );
  }
  await Promise.allSettled(pausePromises);

  // Step 2: Wait for active jobs to complete (with timeout)
  logger.info('Waiting for active jobs to complete...');
  const waitPromises: Promise<void>[] = [];
  for (const [name, queue] of queues) {
    waitPromises.push(
      (async () => {
        const startTime = Date.now();
        while (Date.now() - startTime < SHUTDOWN_TIMEOUT) {
          const counts = await queue.getJobCounts();
          if (counts.active === 0) {
            logger.debug(`Queue ${name} has no active jobs`);
            return;
          }
          logger.debug(`Queue ${name} has ${counts.active} active jobs, waiting...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        logger.warn(`Queue ${name} still has active jobs after timeout, forcing close`);
      })()
    );
  }
  await Promise.allSettled(waitPromises);

  // Step 3: Close all queues with timeout protection
  logger.info('Closing all queues...');
  const closePromises: Promise<void>[] = [];

  for (const [name, queue] of queues) {
    closePromises.push(
      Promise.race([
        queue.close().then(() => {
          logger.debug(`Queue ${name} closed`);
        }),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout closing queue ${name}`)), SHUTDOWN_TIMEOUT)
        )
      ]).catch(err => {
        logger.warn(`Failed to close queue ${name}:`, err);
      })
    );
  }

  await Promise.allSettled(closePromises);
  queues.clear();

  logger.info('Bull job system shut down complete');
}

/**
 * Get all queues for monitoring purposes
 */
export function getAllQueues(): Map<QueueName, Queue> {
  // Ensure all queues are created
  Object.values(QUEUE_NAMES).forEach((name) => getOrCreateQueue(name));
  return queues;
}

/**
 * Job statistics interface
 */
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

/**
 * Get job statistics for all queues
 */
export async function getJobStatistics(): Promise<Record<string, QueueStats>> {
  const stats: Record<string, QueueStats> = {};

  for (const [name, queue] of getAllQueues()) {
    const counts = await queue.getJobCounts();
    stats[name] = {
      waiting: counts.waiting || 0,
      active: counts.active || 0,
      completed: counts.completed || 0,
      failed: counts.failed || 0,
      delayed: counts.delayed || 0,
    };
  }

  return stats;
}

export default {
  Queues,
  QUEUE_NAMES,
  JOB_TYPES,
  initializeJobSystem,
  shutdownJobSystem,
  getAllQueues,
  getJobStatistics,
};
