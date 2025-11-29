/**
 * Content Statistics Generator
 *
 * Generates comprehensive statistics about game content distribution,
 * balance, and coverage across all systems.
 *
 * Phase 15, Wave 15.2 - CONTENT AUDIT
 */

import { ContentRegistry, STATIC_CONTENT_MANIFEST } from '../data/contentRegistry';

export interface ContentStatistics {
  overview: ContentOverview;
  distribution: ContentDistribution;
  balance: ContentBalance;
  coverage: ContentCoverage;
  quality: QualityMetrics;
}

export interface ContentOverview {
  totalContent: number;
  byCategory: Record<string, number>;
  completionPercentage: number;
  lastUpdated: Date;
}

export interface ContentDistribution {
  byRegion: Record<string, RegionStats>;
  byLevel: LevelDistribution[];
  byFaction: Record<string, FactionStats>;
  byRarity: Record<string, number>;
}

export interface RegionStats {
  locationCount: number;
  npcCount: number;
  questCount: number;
  jobCount: number;
  dangerLevel: number;
}

export interface LevelDistribution {
  levelRange: string;
  quests: number;
  items: number;
  jobs: number;
  bosses: number;
  contentDensity: number;
}

export interface FactionStats {
  locations: number;
  npcs: number;
  quests: number;
  uniqueBosses: number;
  influence: number;
}

export interface ContentBalance {
  factionEquity: number; // 0-100, higher is more balanced
  levelCoverage: number; // 0-100, percentage of levels with content
  rarityDistribution: Record<string, number>;
  questTypeBalance: Record<string, number>;
}

export interface ContentCoverage {
  locationsWithNPCs: number;
  locationsWithQuests: number;
  locationsWithShops: number;
  npcUtilization: number; // Percentage of NPCs with quests/shops
  itemSourceCoverage: Record<string, number>;
}

export interface QualityMetrics {
  averageQuestObjectives: number;
  itemsPerShop: number;
  questsPerNPC: number;
  dropsPerBoss: number;
  contentDensityScore: number; // Overall quality score 0-100
}

export class ContentStatsGenerator {
  private registry: ContentRegistry;

  constructor() {
    this.registry = ContentRegistry.getInstance();
  }

  /**
   * Generate full content statistics
   */
  public generateStatistics(): ContentStatistics {
    return {
      overview: this.generateOverview(),
      distribution: this.generateDistribution(),
      balance: this.generateBalance(),
      coverage: this.generateCoverage(),
      quality: this.generateQualityMetrics()
    };
  }

  // ========================================
  // OVERVIEW GENERATION
  // ========================================

  private generateOverview(): ContentOverview {
    const counts = this.registry.getTotalCounts();
    const totalContent = Object.values(counts).reduce((sum, count) => sum + count, 0);

    // Estimate completion based on expected content targets
    const expectedContent = {
      locations: 15,
      npcs: 100,
      jobs: 50,
      crimes: 20,
      shops: 25,
      items: 200,
      quests: 100,
      bosses: 25,
      achievements: 100,
      recipes: 50,
      encounters: 100
    };

    const totalExpected = Object.values(expectedContent).reduce((sum, count) => sum + count, 0);
    const completionPercentage = (totalContent / totalExpected) * 100;

    return {
      totalContent,
      byCategory: counts,
      completionPercentage: Math.min(completionPercentage, 100),
      lastUpdated: new Date()
    };
  }

  // ========================================
  // DISTRIBUTION GENERATION
  // ========================================

  private generateDistribution(): ContentDistribution {
    return {
      byRegion: this.calculateRegionStats(),
      byLevel: this.calculateLevelDistribution(),
      byFaction: this.calculateFactionStats(),
      byRarity: this.calculateRarityDistribution()
    };
  }

  private calculateRegionStats(): Record<string, RegionStats> {
    const regions = ['town', 'dusty_flats', 'devils_canyon', 'sangre_mountains', 'border_territories',
                     'ghost_towns', 'sacred_lands', 'outlaw_territory', 'frontier'];

    const stats: Record<string, RegionStats> = {};

    regions.forEach(region => {
      const locations = this.registry.getLocationsByRegion(region);
      const locationIds = locations.map(l => l.id);

      const npcs = Array.from(this.registry.npcs.values())
        .filter(n => locationIds.includes(n.location));

      const jobs = Array.from(this.registry.jobs.values())
        .filter(j => locationIds.includes(j.location));

      const quests = Array.from(this.registry.quests.values())
        .filter(q => q.location && locationIds.includes(q.location));

      const avgDanger = locations.length > 0
        ? locations.reduce((sum, l) => sum + l.dangerLevel, 0) / locations.length
        : 0;

      stats[region] = {
        locationCount: locations.length,
        npcCount: npcs.length,
        questCount: quests.length,
        jobCount: jobs.length,
        dangerLevel: Math.round(avgDanger)
      };
    });

    return stats;
  }

  private calculateLevelDistribution(): LevelDistribution[] {
    const distribution: LevelDistribution[] = [];
    const maxLevel = 50;

    for (let level = 1; level <= maxLevel; level += 5) {
      const range = `${level}-${level + 4}`;
      const quests = this.registry.getQuestsByLevel(level, level + 4);

      const items = Array.from(this.registry.items.values())
        .filter(i => i.levelRequired >= level && i.levelRequired <= level + 4);

      const jobs = Array.from(this.registry.jobs.values())
        .filter(j => j.levelRequired >= level && j.levelRequired <= level + 4);

      const bosses = Array.from(this.registry.bosses.values())
        .filter(b => b.level >= level && b.level <= level + 4);

      const contentTotal = quests.length + items.length + jobs.length + bosses.length;
      const contentDensity = contentTotal / 5; // Content per level

      distribution.push({
        levelRange: range,
        quests: quests.length,
        items: items.length,
        jobs: jobs.length,
        bosses: bosses.length,
        contentDensity: Math.round(contentDensity * 10) / 10
      });
    }

    return distribution;
  }

  private calculateFactionStats(): Record<string, FactionStats> {
    const factions = ['settler', 'nahi', 'frontera', 'neutral'];
    const stats: Record<string, FactionStats> = {};

    factions.forEach(faction => {
      const locations = Array.from(this.registry.locations.values())
        .filter(l => l.faction === faction);

      const npcs = Array.from(this.registry.npcs.values())
        .filter(n => n.faction === faction);

      const quests = Array.from(this.registry.quests.values())
        .filter(q => q.faction === faction);

      const bosses = Array.from(this.registry.bosses.values())
        .filter(b => {
          // Faction bosses would be marked somehow - placeholder logic
          return false;
        });

      // Calculate influence as a score
      const influence = locations.length * 10 + npcs.length * 5 + quests.length * 3;

      stats[faction] = {
        locations: locations.length,
        npcs: npcs.length,
        quests: quests.length,
        uniqueBosses: bosses.length,
        influence
      };
    });

    return stats;
  }

  private calculateRarityDistribution(): Record<string, number> {
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const distribution: Record<string, number> = {};

    rarities.forEach(rarity => {
      const items = this.registry.getItemsByRarity(rarity);
      distribution[rarity] = items.length;
    });

    return distribution;
  }

  // ========================================
  // BALANCE GENERATION
  // ========================================

  private generateBalance(): ContentBalance {
    return {
      factionEquity: this.calculateFactionEquity(),
      levelCoverage: this.calculateLevelCoverage(),
      rarityDistribution: this.calculateRarityBalance(),
      questTypeBalance: this.calculateQuestTypeBalance()
    };
  }

  private calculateFactionEquity(): number {
    const factionStats = this.calculateFactionStats();
    const factions = Object.values(factionStats).filter(f => f.influence > 0);

    if (factions.length === 0) return 0;

    const avgInfluence = factions.reduce((sum, f) => sum + f.influence, 0) / factions.length;

    // Calculate variance
    const variance = factions.reduce((sum, f) => {
      const diff = f.influence - avgInfluence;
      return sum + (diff * diff);
    }, 0) / factions.length;

    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = better balance
    // Convert to 0-100 score where 100 is perfect balance
    const coefficientOfVariation = stdDev / avgInfluence;
    const equityScore = Math.max(0, 100 - (coefficientOfVariation * 100));

    return Math.round(equityScore);
  }

  private calculateLevelCoverage(): number {
    const maxLevel = 50;
    let levelsWithContent = 0;

    for (let level = 1; level <= maxLevel; level++) {
      const quests = this.registry.getQuestsByLevel(level, level);
      const items = Array.from(this.registry.items.values())
        .filter(i => i.levelRequired === level);
      const jobs = Array.from(this.registry.jobs.values())
        .filter(j => j.levelRequired === level);

      if (quests.length > 0 || items.length > 0 || jobs.length > 0) {
        levelsWithContent++;
      }
    }

    return Math.round((levelsWithContent / maxLevel) * 100);
  }

  private calculateRarityBalance(): Record<string, number> {
    const distribution = this.calculateRarityDistribution();
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

    const percentages: Record<string, number> = {};
    Object.entries(distribution).forEach(([rarity, count]) => {
      percentages[rarity] = total > 0 ? Math.round((count / total) * 100) : 0;
    });

    return percentages;
  }

  private calculateQuestTypeBalance(): Record<string, number> {
    const quests = Array.from(this.registry.quests.values());
    const types = ['main', 'side', 'daily', 'weekly', 'event'];

    const distribution: Record<string, number> = {};
    types.forEach(type => {
      distribution[type] = quests.filter(q => q.type === type).length;
    });

    return distribution;
  }

  // ========================================
  // COVERAGE GENERATION
  // ========================================

  private generateCoverage(): ContentCoverage {
    const locations = Array.from(this.registry.locations.values());
    const npcs = Array.from(this.registry.npcs.values());
    const shops = Array.from(this.registry.shops.values());
    const items = Array.from(this.registry.items.values());

    const locationsWithNPCs = locations.filter(l => l.npcCount > 0).length;
    const locationsWithShops = locations.filter(l => l.shopCount > 0).length;

    // Count locations referenced in quests
    const questLocations = new Set(
      Array.from(this.registry.quests.values())
        .filter(q => q.location)
        .map(q => q.location!)
    );

    // Calculate NPC utilization
    const npcsWithQuests = npcs.filter(n => n.questsOffered && n.questsOffered.length > 0).length;
    const npcsWithShops = shops.filter(s => s.npcVendor).length;
    const utilizedNPCs = new Set([...Array(npcsWithQuests), ...Array(npcsWithShops)]).size;
    const npcUtilization = npcs.length > 0 ? Math.round((utilizedNPCs / npcs.length) * 100) : 0;

    // Item source coverage
    const sources = ['shop', 'quest', 'boss_drop', 'craft', 'find'];
    const sourceCoverage: Record<string, number> = {};
    sources.forEach(source => {
      sourceCoverage[source] = items.filter(i => i.source === source).length;
    });

    return {
      locationsWithNPCs,
      locationsWithQuests: questLocations.size,
      locationsWithShops,
      npcUtilization,
      itemSourceCoverage: sourceCoverage
    };
  }

  // ========================================
  // QUALITY METRICS GENERATION
  // ========================================

  private generateQualityMetrics(): QualityMetrics {
    const quests = Array.from(this.registry.quests.values());
    const shops = Array.from(this.registry.shops.values());
    const npcs = Array.from(this.registry.npcs.values());
    const bosses = Array.from(this.registry.bosses.values());

    // Average quest objectives
    const avgObjectives = quests.length > 0
      ? quests.reduce((sum, q) => sum + q.objectives, 0) / quests.length
      : 0;

    // Items per shop
    const avgItemsPerShop = shops.length > 0
      ? shops.reduce((sum, s) => sum + s.itemCount, 0) / shops.length
      : 0;

    // Quests per NPC (quest givers only)
    const questGivers = npcs.filter(n => n.role === 'quest_giver');
    const avgQuestsPerNPC = questGivers.length > 0
      ? questGivers.reduce((sum, n) => sum + (n.questsOffered?.length || 0), 0) / questGivers.length
      : 0;

    // Drops per boss
    const avgDropsPerBoss = bosses.length > 0
      ? bosses.reduce((sum, b) => sum + b.uniqueDrops.length, 0) / bosses.length
      : 0;

    // Content density score (0-100)
    const densityFactors = [
      avgObjectives >= 3 ? 20 : (avgObjectives / 3) * 20,
      avgItemsPerShop >= 10 ? 20 : (avgItemsPerShop / 10) * 20,
      avgQuestsPerNPC >= 2 ? 20 : (avgQuestsPerNPC / 2) * 20,
      avgDropsPerBoss >= 3 ? 20 : (avgDropsPerBoss / 3) * 20,
      quests.length >= 50 ? 20 : (quests.length / 50) * 20
    ];
    const contentDensityScore = Math.round(densityFactors.reduce((sum, f) => sum + f, 0));

    return {
      averageQuestObjectives: Math.round(avgObjectives * 10) / 10,
      itemsPerShop: Math.round(avgItemsPerShop * 10) / 10,
      questsPerNPC: Math.round(avgQuestsPerNPC * 10) / 10,
      dropsPerBoss: Math.round(avgDropsPerBoss * 10) / 10,
      contentDensityScore
    };
  }

  // ========================================
  // EXPORT METHODS
  // ========================================

  /**
   * Export statistics as formatted text
   */
  public exportAsText(stats: ContentStatistics): string {
    let output = 'DESPERADOS DESTINY - CONTENT STATISTICS REPORT\n';
    output += '='.repeat(60) + '\n\n';

    // Overview
    output += 'OVERVIEW\n';
    output += '-'.repeat(60) + '\n';
    output += `Total Content Pieces: ${stats.overview.totalContent}\n`;
    output += `Completion: ${stats.overview.completionPercentage.toFixed(1)}%\n`;
    output += `Generated: ${stats.overview.lastUpdated.toISOString()}\n\n`;

    // Distribution
    output += 'DISTRIBUTION\n';
    output += '-'.repeat(60) + '\n';
    output += 'By Category:\n';
    Object.entries(stats.overview.byCategory).forEach(([category, count]) => {
      output += `  ${category}: ${count}\n`;
    });
    output += '\n';

    // Balance
    output += 'BALANCE\n';
    output += '-'.repeat(60) + '\n';
    output += `Faction Equity Score: ${stats.balance.factionEquity}/100\n`;
    output += `Level Coverage: ${stats.balance.levelCoverage}%\n`;
    output += '\n';

    // Quality
    output += 'QUALITY METRICS\n';
    output += '-'.repeat(60) + '\n';
    output += `Content Density Score: ${stats.quality.contentDensityScore}/100\n`;
    output += `Avg Quest Objectives: ${stats.quality.averageQuestObjectives}\n`;
    output += `Avg Items Per Shop: ${stats.quality.itemsPerShop}\n`;
    output += `Avg Drops Per Boss: ${stats.quality.dropsPerBoss}\n`;
    output += '\n';

    return output;
  }

  /**
   * Export statistics as JSON
   */
  public exportAsJSON(stats: ContentStatistics): string {
    return JSON.stringify(stats, null, 2);
  }
}

export default ContentStatsGenerator;
