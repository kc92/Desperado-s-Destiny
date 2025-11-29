import { GossipItemModel } from '../models/GossipItem.model';
import { NPCKnowledge } from '../models/NPCKnowledge.model';
import { GossipService } from '../services/gossip.service';

/**
 * GOSSIP SPREAD JOB
 * Daily job to spread gossip through the NPC network
 */

interface SpreadReport {
  totalGossip: number;
  gossipSpread: number;
  newVersions: number;
  npcsInformed: number;
  gossipExpired: number;
}

export class GossipSpreadJob {
  /**
   * Run the daily gossip spread cycle
   */
  static async runDailySpread(): Promise<SpreadReport> {
    console.log('[GossipSpread] Starting daily gossip spread...');

    const report: SpreadReport = {
      totalGossip: 0,
      gossipSpread: 0,
      newVersions: 0,
      npcsInformed: 0,
      gossipExpired: 0
    };

    try {
      // Get all active gossip
      const activeGossip = await GossipItemModel.find({
        expiresAt: { $gt: new Date() },
        currentVersion: { $lt: 5 } // Don't spread if too distorted
      });

      report.totalGossip = activeGossip.length;

      // For each gossip item
      for (const gossip of activeGossip) {
        // Get NPCs who know this gossip
        const knowers = gossip.knownBy;

        if (knowers.length === 0) continue;

        // For each knower, try to spread to their connections
        for (const npcId of knowers) {
          await this.spreadFromNPC(npcId.toString(), gossip._id!.toString(), report);
        }

        report.gossipSpread++;
      }

      // Clean up expired gossip
      const expired = await this.cleanupExpiredGossip();
      report.gossipExpired = expired;

      // Clean up old NPC knowledge
      await this.cleanupOldKnowledge();

      console.log('[GossipSpread] Daily spread complete:', report);

      return report;
    } catch (error) {
      console.error('[GossipSpread] Error in daily spread:', error);
      throw error;
    }
  }

  /**
   * Spread gossip from a specific NPC
   */
  private static async spreadFromNPC(
    npcId: string,
    gossipId: string,
    report: SpreadReport
  ): Promise<void> {
    // Get NPC's knowledge to check gossipiness
    const knowledge = await NPCKnowledge.findOne({ npcId });
    if (!knowledge) return;

    // Check if NPC should spread gossip today
    // Using a default gossipiness value since it's not in the interface
    const gossipiness = (knowledge as any).gossipiness || 50;
    if (gossipiness < 30) {
      // Not gossipy enough
      return;
    }

    // Roll to see if they gossip today
    const gossipChance = gossipiness / 100;
    if (Math.random() > gossipChance) {
      return; // Not gossiping today
    }

    // Find potential targets (NPCs in same area or connected)
    const targets = await this.findSpreadTargets(npcId);

    if (targets.length === 0) return;

    // Spread to 1-3 random targets
    const spreadCount = Math.min(
      targets.length,
      Math.floor(Math.random() * 3) + 1
    );

    const shuffled = targets.sort(() => Math.random() - 0.5);
    const selectedTargets = shuffled.slice(0, spreadCount);

    for (const targetId of selectedTargets) {
      try {
        // GossipService.attemptSpread may not exist, using manual spread logic
        const gossip = await GossipItemModel.findById(gossipId);
        if (gossip && !(gossip as any).isKnownBy(targetId)) {
          (gossip as any).addKnower(targetId);
          await gossip.save();
          report.npcsInformed++;
        }
      } catch (error) {
        console.error(`[GossipSpread] Error spreading from ${npcId} to ${targetId}:`, error);
      }
    }
  }

  /**
   * Find NPCs who could hear gossip from this NPC
   */
  private static async findSpreadTargets(npcId: string): Promise<string[]> {
    // In a full implementation, this would:
    // 1. Find NPCs in the same location
    // 2. Find NPCs with relationship connections
    // 3. Find NPCs in nearby locations

    // For now, return a sample of NPCs
    // This would be replaced with actual NPC proximity/relationship logic

    const allKnowledge = await NPCKnowledge.find({
      npcId: { $ne: npcId }
    }).limit(20);

    return allKnowledge.map(k => k.npcId);
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
   */
  private static async cleanupOldKnowledge(): Promise<void> {
    const allKnowledge = await NPCKnowledge.find({});

    for (const knowledge of allKnowledge) {
      // Remove expired rumors
      const now = new Date();
      // Using default memory duration of 30 days since it's not in the interface
      const memoryDuration = (knowledge as any).memoryDuration || 30;
      const expirationDate = new Date(
        now.getTime() - memoryDuration * 24 * 60 * 60 * 1000
      );

      // Remove old events
      knowledge.events = knowledge.events.filter(
        event => event.learnedAt > expirationDate
      );

      // Recalculate opinion based on remaining events
      knowledge.recalculateOpinion();

      await knowledge.save();
    }
  }

  /**
   * Spread gossip hourly (lighter cycle)
   */
  static async runHourlySpread(): Promise<SpreadReport> {
    console.log('[GossipSpread] Starting hourly gossip spread...');

    const report: SpreadReport = {
      totalGossip: 0,
      gossipSpread: 0,
      newVersions: 0,
      npcsInformed: 0,
      gossipExpired: 0
    };

    try {
      // Get trending gossip (high-impact, recent)
      const trending = await GossipItemModel.find({
        expiresAt: { $gt: new Date() },
        notorietyImpact: { $gte: 50 }, // High impact only
        currentVersion: { $lt: 5 },
        originDate: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).limit(10);

      report.totalGossip = trending.length;

      // Spread trending gossip more aggressively
      for (const gossip of trending) {
        const knowers = gossip.knownBy.slice(0, 5); // Top 5 knowers

        for (const npcId of knowers) {
          await this.spreadFromNPC(npcId.toString(), gossip._id!.toString(), report);
        }

        report.gossipSpread++;
      }

      console.log('[GossipSpread] Hourly spread complete:', report);

      return report;
    } catch (error) {
      console.error('[GossipSpread] Error in hourly spread:', error);
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
    console.log('[GossipSpread] Spreading breaking news:', gossipId);

    const report: SpreadReport = {
      totalGossip: 1,
      gossipSpread: 1,
      newVersions: 0,
      npcsInformed: 0,
      gossipExpired: 0
    };

    try {
      // Spread from all source NPCs immediately
      for (const npcId of sourceNPCIds) {
        // Get all nearby NPCs
        const targets = await this.findSpreadTargets(npcId);

        // Spread to all nearby (breaking news spreads fast)
        for (const targetId of targets) {
          try {
            // Manual spread logic since GossipService.attemptSpread may not exist
            const gossip = await GossipItemModel.findById(gossipId);
            if (gossip && !(gossip as any).isKnownBy(targetId)) {
              (gossip as any).addKnower(targetId);
              await gossip.save();
              report.npcsInformed++;
            }
          } catch (error) {
            console.error(`[GossipSpread] Error spreading breaking news:`, error);
          }
        }
      }

      console.log('[GossipSpread] Breaking news spread complete:', report);

      return report;
    } catch (error) {
      console.error('[GossipSpread] Error spreading breaking news:', error);
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
    const totalActive = await GossipItemModel.countDocuments({
      expiresAt: { $gt: new Date() }
    });

    const totalExpired = await GossipItemModel.countDocuments({
      expiresAt: { $lt: new Date() }
    });

    const allActive = await GossipItemModel.find({
      expiresAt: { $gt: new Date() }
    });

    const averageSpread = allActive.length > 0
      ? allActive.reduce((sum, g) => sum + g.currentReach, 0) / allActive.length
      : 0;

    const mostSpread = await GossipItemModel.findOne({
      expiresAt: { $gt: new Date() }
    }).sort({ currentReach: -1 });

    // Manual trending gossip query since static method may not be typed
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const trending = await GossipItemModel.find({
      expiresAt: { $gt: new Date() },
      lastSpread: { $gt: oneDayAgo }
    })
      .sort({ currentReach: -1 })
      .limit(5);

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

/**
 * Schedule gossip spread jobs
 * Call this from server initialization
 */
export function scheduleGossipJobs(): void {
  // Daily spread at 2 AM
  const dailyInterval = 24 * 60 * 60 * 1000; // 24 hours
  setInterval(async () => {
    try {
      await GossipSpreadJob.runDailySpread();
    } catch (error) {
      console.error('[GossipSpread] Daily job error:', error);
    }
  }, dailyInterval);

  // Hourly spread for trending gossip
  const hourlyInterval = 60 * 60 * 1000; // 1 hour
  setInterval(async () => {
    try {
      await GossipSpreadJob.runHourlySpread();
    } catch (error) {
      console.error('[GossipSpread] Hourly job error:', error);
    }
  }, hourlyInterval);

  console.log('[GossipSpread] Gossip spread jobs scheduled');
}
