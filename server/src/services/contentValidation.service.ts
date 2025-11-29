/**
 * Content Validation Service
 *
 * Validates game content for integrity, consistency, and completeness.
 * Identifies missing references, orphaned content, and broken chains.
 *
 * Phase 15, Wave 15.2 - CONTENT AUDIT
 */

import { ContentRegistry, LocationEntry, NPCEntry, QuestEntry, ItemEntry, BossEntry } from '../data/contentRegistry';
import logger from '../utils/logger';

export interface ValidationIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'missing_reference' | 'orphaned_content' | 'level_gap' | 'balance' | 'broken_chain' | 'unreachable';
  type: string;
  description: string;
  affectedContent: string[];
  recommendation: string;
}

export interface ValidationReport {
  timestamp: Date;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  issues: ValidationIssue[];
  summary: string;
}

export class ContentValidationService {
  private registry: ContentRegistry;
  private issues: ValidationIssue[] = [];

  constructor() {
    this.registry = ContentRegistry.getInstance();
  }

  /**
   * Run full content validation
   */
  public async validateAllContent(): Promise<ValidationReport> {
    logger.info('Starting full content validation...');
    this.issues = [];

    // Run all validation checks
    this.validateLocationReferences();
    this.validateNPCReferences();
    this.validateQuestChains();
    this.validateItemSources();
    this.validateBossDrops();
    this.validateLevelProgression();
    this.validateFactionBalance();
    this.validateShopInventories();
    this.validateQuestRewards();
    this.validateLocationConnections();

    // Generate report
    return this.generateReport();
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  /**
   * Validate location references
   */
  private validateLocationReferences(): void {
    const npcs = Array.from(this.registry.npcs.values());
    const jobs = Array.from(this.registry.jobs.values());
    const quests = Array.from(this.registry.quests.values());

    // Check NPCs reference valid locations
    npcs.forEach(npc => {
      if (npc.location && !this.registry.locations.has(npc.location)) {
        this.addIssue({
          severity: 'high',
          category: 'missing_reference',
          type: 'npc_location_invalid',
          description: `NPC "${npc.name}" references non-existent location "${npc.location}"`,
          affectedContent: [npc.id],
          recommendation: 'Update NPC location to valid location ID or create missing location'
        });
      }
    });

    // Check jobs reference valid locations
    jobs.forEach(job => {
      if (!this.registry.locations.has(job.location)) {
        this.addIssue({
          severity: 'high',
          category: 'missing_reference',
          type: 'job_location_invalid',
          description: `Job "${job.name}" references non-existent location "${job.location}"`,
          affectedContent: [job.id],
          recommendation: 'Update job location to valid location ID'
        });
      }
    });

    // Check quests with location requirements
    quests.forEach(quest => {
      if (quest.location && !this.registry.locations.has(quest.location)) {
        this.addIssue({
          severity: 'medium',
          category: 'missing_reference',
          type: 'quest_location_invalid',
          description: `Quest "${quest.name}" references non-existent location "${quest.location}"`,
          affectedContent: [quest.id],
          recommendation: 'Update quest location reference'
        });
      }
    });
  }

  /**
   * Validate NPC references
   */
  private validateNPCReferences(): void {
    const quests = Array.from(this.registry.quests.values());
    const shops = Array.from(this.registry.shops.values());

    // Check quest givers exist
    quests.forEach(quest => {
      if (quest.questGiver && !this.registry.npcs.has(quest.questGiver)) {
        this.addIssue({
          severity: 'high',
          category: 'missing_reference',
          type: 'quest_giver_missing',
          description: `Quest "${quest.name}" has non-existent quest giver "${quest.questGiver}"`,
          affectedContent: [quest.id],
          recommendation: 'Create NPC or update quest to reference valid NPC'
        });
      }
    });

    // Check shop vendors exist
    shops.forEach(shop => {
      if (shop.npcVendor && !this.registry.npcs.has(shop.npcVendor)) {
        this.addIssue({
          severity: 'medium',
          category: 'missing_reference',
          type: 'vendor_missing',
          description: `Shop "${shop.name}" has non-existent vendor "${shop.npcVendor}"`,
          affectedContent: [shop.id],
          recommendation: 'Create vendor NPC or remove vendor reference'
        });
      }
    });

    // Check for NPCs with no quests or shops
    const npcs = Array.from(this.registry.npcs.values());
    npcs.forEach(npc => {
      if (npc.role === 'quest_giver' && (!npc.questsOffered || npc.questsOffered.length === 0)) {
        this.addIssue({
          severity: 'low',
          category: 'orphaned_content',
          type: 'npc_no_quests',
          description: `NPC "${npc.name}" is marked as quest giver but offers no quests`,
          affectedContent: [npc.id],
          recommendation: 'Add quests to NPC or change role designation'
        });
      }
    });
  }

  /**
   * Validate quest chains
   */
  private validateQuestChains(): void {
    const quests = Array.from(this.registry.quests.values());

    // Group quests by chain
    const chains = new Map<string, QuestEntry[]>();
    quests.forEach(quest => {
      if (quest.chain) {
        const chainQuests = chains.get(quest.chain) || [];
        chainQuests.push(quest);
        chains.set(quest.chain, chainQuests);
      }
    });

    // Validate each chain
    chains.forEach((chainQuests, chainId) => {
      // Check for level progression in chain
      const sortedByLevel = chainQuests.sort((a, b) => a.levelRequired - b.levelRequired);
      for (let i = 1; i < sortedByLevel.length; i++) {
        const levelGap = sortedByLevel[i].levelRequired - sortedByLevel[i - 1].levelRequired;
        if (levelGap > 10) {
          this.addIssue({
            severity: 'medium',
            category: 'level_gap',
            type: 'quest_chain_level_gap',
            description: `Quest chain "${chainId}" has large level gap (${levelGap} levels) between quests`,
            affectedContent: [sortedByLevel[i - 1].id, sortedByLevel[i].id],
            recommendation: 'Add intermediate quests or adjust level requirements'
          });
        }
      }

      // Check chain has reasonable size
      if (chainQuests.length === 1) {
        this.addIssue({
          severity: 'low',
          category: 'broken_chain',
          type: 'single_quest_chain',
          description: `Quest chain "${chainId}" contains only one quest`,
          affectedContent: chainQuests.map(q => q.id),
          recommendation: 'Add more quests to chain or remove chain designation'
        });
      }
    });
  }

  /**
   * Validate item sources
   */
  private validateItemSources(): void {
    const items = Array.from(this.registry.items.values());

    // Check for items with no source
    const orphanedItems = items.filter(item => !item.source || item.source === 'find');
    if (orphanedItems.length > 0) {
      this.addIssue({
        severity: 'medium',
        category: 'orphaned_content',
        type: 'items_no_source',
        description: `${orphanedItems.length} items have no defined source or are marked as "find"`,
        affectedContent: orphanedItems.map(i => i.id),
        recommendation: 'Define clear sources (shop, quest, boss, craft) for all items'
      });
    }

    // Check legendary items
    const legendaryItems = items.filter(i => i.rarity === 'legendary');
    legendaryItems.forEach(item => {
      if (item.source === 'shop') {
        this.addIssue({
          severity: 'high',
          category: 'balance',
          type: 'legendary_in_shop',
          description: `Legendary item "${item.name}" is available in shop (should be quest/boss drop)`,
          affectedContent: [item.id],
          recommendation: 'Change source to quest reward or boss drop'
        });
      }
    });
  }

  /**
   * Validate boss drops
   */
  private validateBossDrops(): void {
    const bosses = Array.from(this.registry.bosses.values());

    // Check each boss has unique drops
    bosses.forEach(boss => {
      if (!boss.uniqueDrops || boss.uniqueDrops.length === 0) {
        this.addIssue({
          severity: 'medium',
          category: 'balance',
          type: 'boss_no_drops',
          description: `Boss "${boss.name}" has no unique drops defined`,
          affectedContent: [boss.id],
          recommendation: 'Add unique legendary or epic drops for boss encounters'
        });
      }

      // Validate drops exist as items
      boss.uniqueDrops.forEach(dropId => {
        if (!this.registry.items.has(dropId)) {
          this.addIssue({
            severity: 'high',
            category: 'missing_reference',
            type: 'boss_drop_missing',
            description: `Boss "${boss.name}" drops non-existent item "${dropId}"`,
            affectedContent: [boss.id],
            recommendation: 'Create item or update boss drop table'
          });
        }
      });
    });
  }

  /**
   * Validate level progression
   */
  private validateLevelProgression(): void {
    const quests = Array.from(this.registry.quests.values());
    const items = Array.from(this.registry.items.values());
    const jobs = Array.from(this.registry.jobs.values());

    // Check for level gaps in content
    const maxLevel = 50; // Assuming max level 50
    const levelRanges: { start: number; end: number }[] = [];

    for (let level = 1; level <= maxLevel; level += 5) {
      levelRanges.push({ start: level, end: level + 4 });
    }

    levelRanges.forEach(range => {
      const questsInRange = quests.filter(
        q => q.levelRequired >= range.start && q.levelRequired <= range.end
      );
      const itemsInRange = items.filter(
        i => i.levelRequired >= range.start && i.levelRequired <= range.end
      );
      const jobsInRange = jobs.filter(
        j => j.levelRequired >= range.start && j.levelRequired <= range.end
      );

      // Check for content deserts
      if (questsInRange.length < 2) {
        this.addIssue({
          severity: 'high',
          category: 'level_gap',
          type: 'quest_desert',
          description: `Level range ${range.start}-${range.end} has insufficient quests (${questsInRange.length})`,
          affectedContent: [],
          recommendation: `Add more quests for levels ${range.start}-${range.end}`
        });
      }

      if (itemsInRange.length === 0) {
        this.addIssue({
          severity: 'medium',
          category: 'level_gap',
          type: 'item_gap',
          description: `Level range ${range.start}-${range.end} has no items available`,
          affectedContent: [],
          recommendation: `Add items for level ${range.start}-${range.end}`
        });
      }
    });
  }

  /**
   * Validate faction balance
   */
  private validateFactionBalance(): void {
    const quests = Array.from(this.registry.quests.values());
    const npcs = Array.from(this.registry.npcs.values());
    const locations = Array.from(this.registry.locations.values());

    const factions = ['settler', 'nahi', 'frontera'];

    factions.forEach(faction => {
      const factionQuests = quests.filter(q => q.faction === faction);
      const factionNPCs = npcs.filter(n => n.faction === faction);
      const factionLocations = locations.filter(l => l.faction === faction);

      // Check for faction content balance
      const avgQuests = quests.filter(q => q.faction).length / factions.length;
      if (factionQuests.length < avgQuests * 0.7) {
        this.addIssue({
          severity: 'medium',
          category: 'balance',
          type: 'faction_quest_imbalance',
          description: `Faction "${faction}" has significantly fewer quests (${factionQuests.length}) than average (${avgQuests.toFixed(1)})`,
          affectedContent: [],
          recommendation: `Add more ${faction} faction quests to improve balance`
        });
      }

      // Check each faction has a home base
      if (factionLocations.length === 0) {
        this.addIssue({
          severity: 'critical',
          category: 'missing_reference',
          type: 'faction_no_home',
          description: `Faction "${faction}" has no home location defined`,
          affectedContent: [],
          recommendation: `Create home base location for ${faction} faction`
        });
      }
    });
  }

  /**
   * Validate shop inventories
   */
  private validateShopInventories(): void {
    const shops = Array.from(this.registry.shops.values());

    shops.forEach(shop => {
      if (shop.itemCount === 0) {
        this.addIssue({
          severity: 'high',
          category: 'orphaned_content',
          type: 'empty_shop',
          description: `Shop "${shop.name}" has no items in inventory`,
          affectedContent: [shop.id],
          recommendation: 'Add items to shop or remove shop'
        });
      }

      if (shop.itemCount > 50) {
        this.addIssue({
          severity: 'low',
          category: 'balance',
          type: 'oversized_shop',
          description: `Shop "${shop.name}" has excessive items (${shop.itemCount})`,
          affectedContent: [shop.id],
          recommendation: 'Consider splitting into multiple shops by category'
        });
      }
    });
  }

  /**
   * Validate quest rewards
   */
  private validateQuestRewards(): void {
    const quests = Array.from(this.registry.quests.values());

    quests.forEach(quest => {
      // Check main quests have substantial rewards
      if (quest.type === 'main') {
        // Placeholder - would check actual reward data if available
        // For now just ensure main quests exist
      }

      // Check daily/weekly quests are repeatable in name
      if ((quest.type === 'daily' || quest.type === 'weekly') && quest.objectives === 0) {
        this.addIssue({
          severity: 'medium',
          category: 'broken_chain',
          type: 'quest_no_objectives',
          description: `${quest.type} quest "${quest.name}" has no objectives defined`,
          affectedContent: [quest.id],
          recommendation: 'Add objectives to make quest completable'
        });
      }
    });
  }

  /**
   * Validate location connections
   */
  private validateLocationConnections(): void {
    const locations = Array.from(this.registry.locations.values());

    // Check for isolated locations
    locations.forEach(location => {
      // Placeholder - would check connection graph
      // For now just ensure locations exist
    });
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private addIssue(issue: ValidationIssue): void {
    this.issues.push(issue);
  }

  private generateReport(): ValidationReport {
    const critical = this.issues.filter(i => i.severity === 'critical').length;
    const high = this.issues.filter(i => i.severity === 'high').length;
    const medium = this.issues.filter(i => i.severity === 'medium').length;
    const low = this.issues.filter(i => i.severity === 'low').length;

    let summary = `Content validation complete. Found ${this.issues.length} issues: `;
    summary += `${critical} critical, ${high} high, ${medium} medium, ${low} low priority.`;

    if (critical > 0) {
      summary += ' CRITICAL ISSUES REQUIRE IMMEDIATE ATTENTION.';
    } else if (high > 0) {
      summary += ' High priority issues should be addressed soon.';
    } else {
      summary += ' Content is in good shape!';
    }

    return {
      timestamp: new Date(),
      totalIssues: this.issues.length,
      criticalIssues: critical,
      highIssues: high,
      mediumIssues: medium,
      lowIssues: low,
      issues: this.issues,
      summary
    };
  }

  /**
   * Export validation report as JSON
   */
  public exportReport(report: ValidationReport): string {
    return JSON.stringify(report, null, 2);
  }
}

export default ContentValidationService;
