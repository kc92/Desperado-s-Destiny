/**
 * Content Gap Analysis
 *
 * Identifies specific gaps in game content including level ranges with
 * sparse content, underserved locations, faction imbalances, and missing
 * progression elements.
 *
 * Phase 15, Wave 15.2 - CONTENT AUDIT
 */

import { ContentRegistry } from '../data/contentRegistry';

export interface ContentGap {
  type: 'level_gap' | 'location_gap' | 'faction_gap' | 'item_tier_gap' | 'progression_gap';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedRange: string;
  currentContent: number;
  recommendedContent: number;
  specificRecommendations: string[];
}

export interface GapAnalysisReport {
  timestamp: Date;
  totalGaps: number;
  criticalGaps: number;
  gaps: ContentGap[];
  priorityList: string[];
  estimatedWorkHours: number;
}

export class ContentGapAnalyzer {
  private registry: ContentRegistry;
  private gaps: ContentGap[] = [];

  constructor() {
    this.registry = ContentRegistry.getInstance();
  }

  /**
   * Run complete gap analysis
   */
  public analyzeGaps(): GapAnalysisReport {
    this.gaps = [];

    this.analyzeLevelGaps();
    this.analyzeLocationGaps();
    this.analyzeFactionGaps();
    this.analyzeItemTierGaps();
    this.analyzeProgressionGaps();

    return this.generateReport();
  }

  // ========================================
  // GAP ANALYSIS METHODS
  // ========================================

  /**
   * Analyze level range content gaps
   */
  private analyzeLevelGaps(): void {
    const maxLevel = 50;
    const questsPerLevel = 2; // Target average
    const itemsPerLevelRange = 3; // Per 5-level range

    for (let level = 1; level <= maxLevel; level += 5) {
      const rangeStart = level;
      const rangeEnd = level + 4;
      const rangeLabel = `${rangeStart}-${rangeEnd}`;

      // Check quests in range
      const quests = this.registry.getQuestsByLevel(rangeStart, rangeEnd);
      const expectedQuests = questsPerLevel * 5;

      if (quests.length < expectedQuests * 0.5) {
        const severity = quests.length === 0 ? 'critical' :
                        quests.length < expectedQuests * 0.3 ? 'high' : 'medium';

        this.gaps.push({
          type: 'level_gap',
          severity,
          title: `Quest Drought in Level ${rangeLabel}`,
          description: `Only ${quests.length} quests available for levels ${rangeLabel}, expected ${expectedQuests}`,
          affectedRange: rangeLabel,
          currentContent: quests.length,
          recommendedContent: expectedQuests,
          specificRecommendations: [
            `Add ${Math.ceil((expectedQuests - quests.length) / 2)} main/side quests`,
            `Add ${Math.floor((expectedQuests - quests.length) / 2)} daily/repeatable quests`,
            `Ensure quests span full level range`,
            `Include variety of quest types (combat, social, exploration)`
          ]
        });
      }

      // Check items in range
      const items = Array.from(this.registry.items.values())
        .filter(i => i.levelRequired >= rangeStart && i.levelRequired <= rangeEnd);

      if (items.length < itemsPerLevelRange) {
        this.gaps.push({
          type: 'item_tier_gap',
          severity: items.length === 0 ? 'high' : 'medium',
          title: `Insufficient Items for Level ${rangeLabel}`,
          description: `Only ${items.length} items for levels ${rangeLabel}, recommended ${itemsPerLevelRange}`,
          affectedRange: rangeLabel,
          currentContent: items.length,
          recommendedContent: itemsPerLevelRange,
          specificRecommendations: [
            'Add weapons appropriate for level range',
            'Add armor pieces with progression stats',
            'Include consumables for level-appropriate challenges'
          ]
        });
      }

      // Check jobs in range
      const jobs = Array.from(this.registry.jobs.values())
        .filter(j => j.levelRequired >= rangeStart && j.levelRequired <= rangeEnd);

      if (jobs.length === 0 && level <= 30) {
        this.gaps.push({
          type: 'level_gap',
          severity: 'medium',
          title: `No Jobs Available for Level ${rangeLabel}`,
          description: `Players have no job options in level range ${rangeLabel}`,
          affectedRange: rangeLabel,
          currentContent: 0,
          recommendedContent: 2,
          specificRecommendations: [
            'Add 1-2 jobs appropriate for skill level',
            'Ensure job rewards scale with level',
            'Include variety (combat, social, crafting jobs)'
          ]
        });
      }
    }
  }

  /**
   * Analyze location content density
   */
  private analyzeLocationGaps(): void {
    const locations = Array.from(this.registry.locations.values());

    locations.forEach(location => {
      // Check for locations with no NPCs
      if (location.npcCount === 0 && location.dangerLevel < 8) {
        this.gaps.push({
          type: 'location_gap',
          severity: 'medium',
          title: `${location.name} Has No NPCs`,
          description: `Location "${location.name}" feels empty without any NPCs`,
          affectedRange: location.id,
          currentContent: 0,
          recommendedContent: 2,
          specificRecommendations: [
            'Add vendor NPC for basic supplies',
            'Add lore NPC with local knowledge',
            'Consider quest giver for location-specific content'
          ]
        });
      }

      // Check for locations with no quests
      const locationQuests = Array.from(this.registry.quests.values())
        .filter(q => q.location === location.id);

      if (locationQuests.length === 0 && location.dangerLevel < 8 && location.npcCount > 0) {
        this.gaps.push({
          type: 'location_gap',
          severity: 'low',
          title: `${location.name} Has No Quests`,
          description: `Location has NPCs but no quests, missing content opportunity`,
          affectedRange: location.id,
          currentContent: 0,
          recommendedContent: 2,
          specificRecommendations: [
            'Add location-specific side quest',
            'Create encounter quest using location as setting',
            'Add daily quest tied to location jobs'
          ]
        });
      }

      // Check for locations with no jobs
      if (location.jobCount === 0 && location.dangerLevel < 6 && location.type === 'settlement') {
        this.gaps.push({
          type: 'location_gap',
          severity: 'low',
          title: `${location.name} Has No Job Opportunities`,
          description: `Settlement has no available jobs for players`,
          affectedRange: location.id,
          currentContent: 0,
          recommendedContent: 2,
          specificRecommendations: [
            'Add 1-2 jobs fitting location theme',
            'Ensure job difficulty matches location danger level',
            'Include variety of job types'
          ]
        });
      }

      // Check for shops
      if (location.shopCount === 0 && location.type === 'settlement') {
        this.gaps.push({
          type: 'location_gap',
          severity: 'medium',
          title: `${location.name} Has No Shops`,
          description: `Settlement lacks merchant services`,
          affectedRange: location.id,
          currentContent: 0,
          recommendedContent: 1,
          specificRecommendations: [
            'Add general store for basic supplies',
            'Consider specialty shop based on location theme',
            'Ensure shop inventory matches location faction/culture'
          ]
        });
      }
    });
  }

  /**
   * Analyze faction content balance
   */
  private analyzeFactionGaps(): void {
    const factions = ['settler', 'nahi', 'frontera'];
    const factionData: Record<string, any> = {};

    // Gather faction statistics
    factions.forEach(faction => {
      const locations = Array.from(this.registry.locations.values())
        .filter(l => l.faction === faction);
      const npcs = Array.from(this.registry.npcs.values())
        .filter(n => n.faction === faction);
      const quests = Array.from(this.registry.quests.values())
        .filter(q => q.faction === faction);

      factionData[faction] = {
        locations: locations.length,
        npcs: npcs.length,
        quests: quests.length,
        total: locations.length + npcs.length + quests.length
      };
    });

    // Calculate averages
    const avgTotal = Object.values(factionData)
      .reduce((sum: number, data: any) => sum + data.total, 0) / factions.length;

    // Check for imbalanced factions
    factions.forEach(faction => {
      const data = factionData[faction];
      const percentOfAvg = (data.total / avgTotal) * 100;

      if (percentOfAvg < 70) {
        this.gaps.push({
          type: 'faction_gap',
          severity: percentOfAvg < 50 ? 'high' : 'medium',
          title: `${faction} Faction Underrepresented`,
          description: `${faction} has ${data.total} content pieces vs average of ${avgTotal.toFixed(1)} (${percentOfAvg.toFixed(1)}% of average)`,
          affectedRange: faction,
          currentContent: data.total,
          recommendedContent: Math.ceil(avgTotal),
          specificRecommendations: [
            `Add ${Math.ceil(avgTotal * 0.3 - data.quests)} quests for ${faction}`,
            `Add ${Math.ceil(avgTotal * 0.4 - data.npcs)} NPCs for ${faction}`,
            `Consider new ${faction} location if needed`,
            `Expand ${faction} storyline and lore`
          ]
        });
      }

      // Check for faction without home location
      if (data.locations === 0) {
        this.gaps.push({
          type: 'faction_gap',
          severity: 'critical',
          title: `${faction} Faction Has No Home Location`,
          description: `Critical: ${faction} faction lacks a dedicated home base`,
          affectedRange: faction,
          currentContent: 0,
          recommendedContent: 1,
          specificRecommendations: [
            `Create primary ${faction} settlement/stronghold`,
            `Add faction leader NPC`,
            `Create faction-specific shops and services`,
            `Design faction introduction quest chain`
          ]
        });
      }
    });
  }

  /**
   * Analyze item tier gaps
   */
  private analyzeItemTierGaps(): void {
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const expectedDistribution = {
      common: 0.40,
      uncommon: 0.25,
      rare: 0.20,
      epic: 0.10,
      legendary: 0.05
    };

    const items = Array.from(this.registry.items.values());
    const total = items.length;

    rarities.forEach(rarity => {
      const count = items.filter(i => i.rarity === rarity).length;
      const percentage = total > 0 ? count / total : 0;
      const expected = expectedDistribution[rarity as keyof typeof expectedDistribution];

      if (percentage < expected * 0.7) {
        const expectedCount = Math.ceil(total * expected);
        const deficit = expectedCount - count;

        this.gaps.push({
          type: 'item_tier_gap',
          severity: deficit > 10 ? 'high' : 'medium',
          title: `Insufficient ${rarity} Items`,
          description: `Only ${count} ${rarity} items (${(percentage * 100).toFixed(1)}%), expected ~${(expected * 100).toFixed(1)}%`,
          affectedRange: rarity,
          currentContent: count,
          recommendedContent: expectedCount,
          specificRecommendations: [
            `Add ${deficit} ${rarity} items across categories`,
            `Ensure ${rarity} items span level ranges`,
            `Include variety: weapons, armor, consumables`,
            `Balance stats appropriate for ${rarity} tier`
          ]
        });
      }
    });

    // Check for legendary items without acquisition path
    const legendaries = items.filter(i => i.rarity === 'legendary');
    const legendariesInShops = legendaries.filter(i => i.source === 'shop');

    if (legendariesInShops.length > 0) {
      this.gaps.push({
        type: 'item_tier_gap',
        severity: 'high',
        title: 'Legendary Items in Shops',
        description: `${legendariesInShops.length} legendary items available in shops - should be quest/boss rewards`,
        affectedRange: 'legendary',
        currentContent: legendariesInShops.length,
        recommendedContent: 0,
        specificRecommendations: [
          'Move legendary items to quest rewards',
          'Assign legendary items to boss drops',
          'Create quest chains for legendary acquisition',
          'Ensure legendaries feel earned, not bought'
        ]
      });
    }
  }

  /**
   * Analyze progression gaps
   */
  private analyzeProgressionGaps(): void {
    const bosses = Array.from(this.registry.bosses.values());

    // Check boss level distribution
    const bossLevelRanges = {
      early: { min: 1, max: 15, name: 'Early Game (1-15)' },
      mid: { min: 16, max: 30, name: 'Mid Game (16-30)' },
      late: { min: 31, max: 45, name: 'Late Game (31-45)' },
      endgame: { min: 46, max: 50, name: 'End Game (46-50)' }
    };

    Object.entries(bossLevelRanges).forEach(([key, range]) => {
      const bossesInRange = bosses.filter(b => b.level >= range.min && b.level <= range.max);
      const expectedBosses = key === 'endgame' ? 3 : 5;

      if (bossesInRange.length < expectedBosses) {
        this.gaps.push({
          type: 'progression_gap',
          severity: bossesInRange.length === 0 ? 'critical' : 'medium',
          title: `Insufficient Bosses for ${range.name}`,
          description: `Only ${bossesInRange.length} bosses in level range ${range.min}-${range.max}`,
          affectedRange: `${range.min}-${range.max}`,
          currentContent: bossesInRange.length,
          recommendedContent: expectedBosses,
          specificRecommendations: [
            `Add ${expectedBosses - bossesInRange.length} bosses in level ${range.min}-${range.max}`,
            'Ensure boss variety (outlaw, faction, legendary)',
            'Create unique loot tables for each boss',
            'Design memorable boss encounters with mechanics'
          ]
        });
      }
    });

    // Check for main story progression
    const mainQuests = Array.from(this.registry.quests.values())
      .filter(q => q.type === 'main');

    if (mainQuests.length < 10) {
      this.gaps.push({
        type: 'progression_gap',
        severity: 'critical',
        title: 'Insufficient Main Story Content',
        description: `Only ${mainQuests.length} main story quests - needs expansion`,
        affectedRange: 'main-story',
        currentContent: mainQuests.length,
        recommendedContent: 15,
        specificRecommendations: [
          `Add ${15 - mainQuests.length} main story quests`,
          'Create clear story arc from level 1-50',
          'Integrate faction conflicts into main story',
          'Build to climactic end-game conclusion',
          'Include choice points that affect faction standings'
        ]
      });
    }
  }

  // ========================================
  // REPORT GENERATION
  // ========================================

  private generateReport(): GapAnalysisReport {
    // Sort gaps by severity
    this.gaps.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    const critical = this.gaps.filter(g => g.severity === 'critical').length;

    // Generate priority list
    const priorityList = this.gaps
      .filter(g => g.severity === 'critical' || g.severity === 'high')
      .map(g => g.title);

    // Estimate work hours
    const hoursPerGap = {
      critical: 8,
      high: 4,
      medium: 2,
      low: 1
    };

    const estimatedHours = this.gaps.reduce((sum, gap) => {
      return sum + hoursPerGap[gap.severity];
    }, 0);

    return {
      timestamp: new Date(),
      totalGaps: this.gaps.length,
      criticalGaps: critical,
      gaps: this.gaps,
      priorityList,
      estimatedWorkHours: estimatedHours
    };
  }

  /**
   * Export report as JSON
   */
  public exportReport(report: GapAnalysisReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report as formatted text
   */
  public exportAsText(report: GapAnalysisReport): string {
    let output = 'CONTENT GAP ANALYSIS REPORT\n';
    output += '='.repeat(60) + '\n\n';

    output += `Generated: ${report.timestamp.toISOString()}\n`;
    output += `Total Gaps Found: ${report.totalGaps}\n`;
    output += `Critical Gaps: ${report.criticalGaps}\n`;
    output += `Estimated Work: ${report.estimatedWorkHours} hours\n\n`;

    output += 'PRIORITY ACTION ITEMS\n';
    output += '-'.repeat(60) + '\n';
    report.priorityList.forEach((item, index) => {
      output += `${index + 1}. ${item}\n`;
    });
    output += '\n';

    output += 'DETAILED GAP ANALYSIS\n';
    output += '-'.repeat(60) + '\n\n';

    report.gaps.forEach((gap, index) => {
      output += `[${gap.severity.toUpperCase()}] ${gap.title}\n`;
      output += `  ${gap.description}\n`;
      output += `  Current: ${gap.currentContent} | Recommended: ${gap.recommendedContent}\n`;
      output += `  Recommendations:\n`;
      gap.specificRecommendations.forEach(rec => {
        output += `    - ${rec}\n`;
      });
      output += '\n';
    });

    return output;
  }
}

export default ContentGapAnalyzer;
