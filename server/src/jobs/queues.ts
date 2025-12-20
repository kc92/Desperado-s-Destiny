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

    queue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} in queue ${name} failed:`, {
        jobId: job.id,
        jobName: job.name,
        error: error.message,
        attempts: job.attemptsMade,
      });
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
};

/**
 * Helper to wrap job execution with timing and error handling
 */
export async function executeJob<T>(
  jobName: string,
  executor: () => Promise<T>
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

    logger.error(`Job ${jobName} failed after ${duration}ms:`, error);

    return {
      success: false,
      message: `${jobName} failed: ${errorMessage}`,
      duration,
    };
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
      }).select('itemId');

      let updated = 0;
      for (const history of recentHistories) {
        try {
          await (PriceHistory as any).updateStats(history.itemId);
          updated++;
        } catch (error) {
          logger.error(`Error updating price history for ${history.itemId}:`, error);
        }
      }
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
      const playerGangs = await Gang.find({ isActive: true });
      let attackCount = 0;

      for (const playerGang of playerGangs) {
        // Cast to any to avoid ObjectId type mismatch issues
        const gangId = playerGang._id as any;
        const relationships = await NPCGangRelationship.findByPlayerGang(gangId);

        for (const relationship of relationships) {
          if (
            relationship.attitude === RelationshipAttitude.HOSTILE ||
            relationship.activeConflict
          ) {
            if (SecureRNG.chance(0.7)) {
              const npcGang = ALL_NPC_GANGS.find((g) => g.id === relationship.npcGangId);
              if (!npcGang) continue;

              const attackPattern = SecureRNG.select(npcGang.attackPatterns);

              try {
                await NPCGangConflictService.processNPCAttack(
                  gangId,
                  npcGang.id,
                  attackPattern.type
                );
                attackCount++;
              } catch (error) {
                logger.error(`Error processing attack from ${npcGang.name}:`, error);
              }
            }
          }
        }
      }

      return { attacksProcessed: attackCount };
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
      const relationships = await NPCGangRelationship.find({
        'challengeProgress.expiresAt': { $lt: now },
      });

      for (const relationship of relationships) {
        if (relationship.challengeProgress) {
          relationship.challengeProgress = undefined;
          await relationship.save();
        }
      }

      return { expiredCount: relationships.length };
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
 */
export async function shutdownJobSystem(): Promise<void> {
  logger.info('Shutting down Bull job system...');

  const closePromises: Promise<void>[] = [];

  for (const [name, queue] of queues) {
    closePromises.push(
      queue.close().then(() => {
        logger.debug(`Queue ${name} closed`);
      })
    );
  }

  await Promise.all(closePromises);
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
