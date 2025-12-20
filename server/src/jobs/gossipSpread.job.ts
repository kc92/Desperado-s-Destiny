import { GossipItemModel } from '../models/GossipItem.model';
import { NPCKnowledge } from '../models/NPCKnowledge.model';
import { withLock } from '../utils/distributedLock';
import logger from '../utils/logger';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * GOSSIP SPREAD JOB
 * Daily job to spread gossip through the NPC network
 *
 * PERFORMANCE FIX: Refactored to use batch queries instead of N+1 loops
 */

interface SpreadReport {
  totalGossip: number;
  gossipSpread: number;
  newVersions: number;
  npcsInformed: number;
  gossipExpired: number;
}

// Cache for batch-loaded NPC knowledge
interface KnowledgeCache {
  byNpcId: Map<string, any>;
  allNpcIds: string[];
}

export class GossipSpreadJob {
  /**
   * Run the daily gossip spread cycle
   * PERFORMANCE FIX: Uses batch queries and caching to avoid N+1 patterns
   */
  static async runDailySpread(): Promise<SpreadReport> {
    const lockKey = 'job:gossip-daily-spread';

    const report: SpreadReport = {
      totalGossip: 0,
      gossipSpread: 0,
      newVersions: 0,
      npcsInformed: 0,
      gossipExpired: 0
    };

    try {
      await withLock(lockKey, async () => {
        logger.info('[GossipSpread] Starting daily gossip spread...');
      // BATCH LOAD: Get all active gossip in one query
      const activeGossip = await GossipItemModel.find({
        expiresAt: { $gt: new Date() },
        currentVersion: { $lt: 5 } // Don't spread if too distorted
      }).lean();

      report.totalGossip = activeGossip.length;

      if (activeGossip.length === 0) {
        logger.info('[GossipSpread] No active gossip to spread');
        return report;
      }

      // BATCH LOAD: Get all NPC knowledge in one query
      const allKnowledge = await NPCKnowledge.find({}).lean();
      const knowledgeCache: KnowledgeCache = {
        byNpcId: new Map(allKnowledge.map(k => [k.npcId.toString(), k])),
        allNpcIds: allKnowledge.map(k => k.npcId.toString())
      };

      // Collect all gossip updates to batch save
      const gossipUpdates: Map<string, Set<string>> = new Map(); // gossipId -> Set of new knower IDs

      // For each gossip item
      for (const gossip of activeGossip) {
        const knowers = gossip.knownBy?.map((id: any) => id.toString()) || [];
        if (knowers.length === 0) continue;

        // For each knower, determine spread targets (using cached data)
        for (const npcId of knowers) {
          const spreadResults = this.calculateSpread(npcId, gossip, knowledgeCache);

          if (spreadResults.length > 0) {
            const gossipId = gossip._id!.toString();
            if (!gossipUpdates.has(gossipId)) {
              gossipUpdates.set(gossipId, new Set());
            }

            // Get existing knowers as strings
            const existingKnowers = new Set(knowers);

            for (const targetId of spreadResults) {
              if (!existingKnowers.has(targetId)) {
                gossipUpdates.get(gossipId)!.add(targetId);
                report.npcsInformed++;
              }
            }
          }
        }

        report.gossipSpread++;
      }

      // BATCH SAVE: Update all gossip items with new knowers
      if (gossipUpdates.size > 0) {
        const bulkOps = Array.from(gossipUpdates.entries()).map(([gossipId, newKnowers]) => ({
          updateOne: {
            filter: { _id: gossipId },
            update: {
              $addToSet: { knownBy: { $each: Array.from(newKnowers) } }
            }
          }
        }));

        await GossipItemModel.bulkWrite(bulkOps);
      }

      // Clean up expired gossip
      const expired = await this.cleanupExpiredGossip();
      report.gossipExpired = expired;

      // Clean up old NPC knowledge (batch operation)
      await this.cleanupOldKnowledge();

        logger.info('[GossipSpread] Daily spread complete', report);
      }, {
        ttl: 1800, // 30 minute lock TTL
        retries: 0 // Don't retry - skip if locked
      });

      return report;
    } catch (error) {
      if ((error as Error).message?.includes('lock')) {
        logger.debug('[GossipSpread] Daily gossip spread already running on another instance, skipping');
        return report;
      }
      logger.error('[GossipSpread] Error in daily spread:', error);
      throw error;
    }
  }

  /**
   * Calculate spread targets for an NPC (uses cached data, no DB calls)
   */
  private static calculateSpread(
    npcId: string,
    gossip: any,
    cache: KnowledgeCache
  ): string[] {
    const knowledge = cache.byNpcId.get(npcId);
    if (!knowledge) return [];

    // Check if NPC should spread gossip today
    const gossipiness = (knowledge as any).gossipiness || 50;
    if (gossipiness < 30) {
      return []; // Not gossipy enough
    }

    // Roll to see if they gossip today
    const gossipChance = gossipiness / 100;
    if (!SecureRNG.chance(gossipChance)) {
      return []; // Not gossiping today
    }

    // Find potential targets (all other NPCs for simplicity)
    const targets = cache.allNpcIds.filter(id => id !== npcId);

    if (targets.length === 0) return [];

    // Spread to 1-3 random targets
    const spreadCount = Math.min(targets.length, SecureRNG.range(1, 3));
    const shuffled = SecureRNG.shuffle(targets);

    return shuffled.slice(0, spreadCount);
  }

  /**
   * Clean up expired gossip
   */
  private static async cleanupExpiredGossip(): Promise<number> {
    const result = await GossipItemModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    return result.deletedCount || 0;
  }

  /**
   * Clean up old NPC knowledge
   * PERFORMANCE FIX: Uses bulkWrite instead of individual saves
   */
  private static async cleanupOldKnowledge(): Promise<void> {
    const now = new Date();
    const defaultMemoryDuration = 30; // days
    const defaultExpirationDate = new Date(
      now.getTime() - defaultMemoryDuration * 24 * 60 * 60 * 1000
    );

    // Use updateMany with $pull to remove old events in one operation
    await NPCKnowledge.updateMany(
      {},
      {
        $pull: {
          events: { learnedAt: { $lt: defaultExpirationDate } }
        }
      }
    );
  }

  /**
   * Spread gossip hourly (lighter cycle)
   */
  static async runHourlySpread(): Promise<SpreadReport> {
    const lockKey = 'job:gossip-hourly-spread';

    const report: SpreadReport = {
      totalGossip: 0,
      gossipSpread: 0,
      newVersions: 0,
      npcsInformed: 0,
      gossipExpired: 0
    };

    try {
      await withLock(lockKey, async () => {
        logger.info('[GossipSpread] Starting hourly gossip spread...');
      // Get trending gossip (high-impact, recent)
      const trending = await GossipItemModel.find({
        expiresAt: { $gt: new Date() },
        notorietyImpact: { $gte: 50 }, // High impact only
        currentVersion: { $lt: 5 },
        originDate: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).limit(10).lean();

      report.totalGossip = trending.length;

      if (trending.length === 0) {
        return report;
      }

      // BATCH LOAD: Get all NPC knowledge in one query
      const allKnowledge = await NPCKnowledge.find({}).lean();
      const knowledgeCache: KnowledgeCache = {
        byNpcId: new Map(allKnowledge.map(k => [k.npcId.toString(), k])),
        allNpcIds: allKnowledge.map(k => k.npcId.toString())
      };

      // Collect all gossip updates to batch save
      const gossipUpdates: Map<string, Set<string>> = new Map();

      // Spread trending gossip more aggressively
      for (const gossip of trending) {
        const knowers = (gossip.knownBy?.slice(0, 5) || []).map((id: any) => id.toString());

        for (const npcId of knowers) {
          const spreadResults = this.calculateSpread(npcId, gossip, knowledgeCache);

          if (spreadResults.length > 0) {
            const gossipId = gossip._id!.toString();
            if (!gossipUpdates.has(gossipId)) {
              gossipUpdates.set(gossipId, new Set());
            }

            const existingKnowers = new Set(knowers);

            for (const targetId of spreadResults) {
              if (!existingKnowers.has(targetId)) {
                gossipUpdates.get(gossipId)!.add(targetId);
                report.npcsInformed++;
              }
            }
          }
        }

        report.gossipSpread++;
      }

      // BATCH SAVE: Update all gossip items with new knowers
      if (gossipUpdates.size > 0) {
        const bulkOps = Array.from(gossipUpdates.entries()).map(([gossipId, newKnowers]) => ({
          updateOne: {
            filter: { _id: gossipId },
            update: {
              $addToSet: { knownBy: { $each: Array.from(newKnowers) } }
            }
          }
        }));

        await GossipItemModel.bulkWrite(bulkOps);
      }

        logger.info('[GossipSpread] Hourly spread complete', report);
      }, {
        ttl: 3600, // 60 minute lock TTL
        retries: 0 // Don't retry - skip if locked
      });

      return report;
    } catch (error) {
      if ((error as Error).message?.includes('lock')) {
        logger.debug('[GossipSpread] Hourly gossip spread already running on another instance, skipping');
        return report;
      }
      logger.error('[GossipSpread] Error in hourly spread:', error);
      throw error;
    }
  }

  /**
   * Handle immediate spread for breaking news
   */
  static async spreadBreakingNews(
    gossipId: string,
    sourceNPCIds: string[]
  ): Promise<SpreadReport> {
    logger.info('[GossipSpread] Spreading breaking news:', { gossipId });

    const report: SpreadReport = {
      totalGossip: 1,
      gossipSpread: 1,
      newVersions: 0,
      npcsInformed: 0,
      gossipExpired: 0
    };

    try {
      // BATCH LOAD: Get all NPC knowledge in one query
      const allKnowledge = await NPCKnowledge.find({}).limit(100).lean();
      const allNpcIds = allKnowledge.map(k => k.npcId.toString());

      // Get gossip to check existing knowers
      const gossip = await GossipItemModel.findById(gossipId).lean();
      if (!gossip) {
        logger.warn('[GossipSpread] Gossip not found for breaking news:', { gossipId });
        return report;
      }

      const existingKnowers = new Set((gossip.knownBy || []).map((id: any) => id.toString()));
      const newKnowers: string[] = [];

      // Spread from all source NPCs immediately
      for (const npcId of sourceNPCIds) {
        // Get all nearby NPCs (all others for simplicity)
        const targets = allNpcIds.filter(id => id !== npcId && !existingKnowers.has(id));

        for (const targetId of targets) {
          if (!newKnowers.includes(targetId)) {
            newKnowers.push(targetId);
            report.npcsInformed++;
          }
        }
      }

      // BATCH SAVE: Update gossip with all new knowers at once
      if (newKnowers.length > 0) {
        await GossipItemModel.updateOne(
          { _id: gossipId },
          { $addToSet: { knownBy: { $each: newKnowers } } }
        );
      }

      logger.info('[GossipSpread] Breaking news spread complete', report);

      return report;
    } catch (error) {
      logger.error('[GossipSpread] Error spreading breaking news:', error);
      throw error;
    }
  }

  /**
   * Get gossip statistics
   */
  static async getGossipStats(): Promise<{
    totalActive: number;
    totalExpired: number;
    averageSpread: number;
    mostSpread: any;
    trending: any[];
  }> {
    const [totalActive, totalExpired, allActive, mostSpread, trending] = await Promise.all([
      GossipItemModel.countDocuments({ expiresAt: { $gt: new Date() } }),
      GossipItemModel.countDocuments({ expiresAt: { $lt: new Date() } }),
      GossipItemModel.find({ expiresAt: { $gt: new Date() } }).select('currentReach').lean(),
      GossipItemModel.findOne({ expiresAt: { $gt: new Date() } }).sort({ currentReach: -1 }).lean(),
      GossipItemModel.find({
        expiresAt: { $gt: new Date() },
        lastSpread: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).sort({ currentReach: -1 }).limit(5).lean()
    ]);

    const averageSpread = allActive.length > 0
      ? allActive.reduce((sum, g) => sum + (g.currentReach || 0), 0) / allActive.length
      : 0;

    return {
      totalActive,
      totalExpired,
      averageSpread: Math.round(averageSpread),
      mostSpread: mostSpread ? {
        headline: mostSpread.headline,
        reach: mostSpread.currentReach,
        topic: mostSpread.topic
      } : null,
      trending: trending.map(g => ({
        headline: g.headline,
        reach: g.currentReach,
        topic: g.topic,
        truthfulness: g.truthfulness
      }))
    };
  }
}

// NOTE: Scheduling is handled by Bull queues in queues.ts
// Use GossipSpreadJob.runDailySpread() and GossipSpreadJob.runHourlySpread() for direct execution
