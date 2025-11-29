/**
 * Content Registry
 *
 * Master registry of ALL game content across Desperados Destiny.
 * This is the single source of truth for content audit and validation.
 *
 * Phase 15, Wave 15.2 - CONTENT AUDIT
 */

import mongoose from 'mongoose';

// ========================================
// CONTENT TYPE DEFINITIONS
// ========================================

export interface LocationEntry {
  id: string;
  name: string;
  type: string;
  region: string;
  dangerLevel: number;
  buildingCount: number;
  npcCount: number;
  jobCount: number;
  shopCount: number;
  faction: string;
}

export interface NPCEntry {
  id: string;
  name: string;
  title: string;
  location: string;
  role: 'vendor' | 'quest_giver' | 'lore' | 'faction_leader' | 'enemy' | 'wandering';
  faction: string;
  questsOffered: string[];
}

export interface JobEntry {
  id: string;
  name: string;
  location: string;
  levelRequired: number;
  energyCost: number;
  goldReward: { min: number; max: number };
  xpReward: number;
}

export interface CrimeEntry {
  id: string;
  name: string;
  type: 'theft' | 'burglary' | 'robbery' | 'violence' | 'fraud';
  difficulty: number;
  levelRequired: number;
  goldReward: { min: number; max: number };
  riskLevel: number;
}

export interface ShopEntry {
  id: string;
  name: string;
  location: string;
  type: 'general' | 'weapons' | 'armor' | 'medicine' | 'black_market' | 'specialty';
  itemCount: number;
  npcVendor?: string;
}

export interface ItemEntry {
  id: string;
  name: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  price: number;
  levelRequired: number;
  source: 'shop' | 'quest' | 'boss_drop' | 'craft' | 'find';
  equipSlot?: string;
}

export interface QuestEntry {
  id: string;
  name: string;
  type: 'main' | 'side' | 'daily' | 'weekly' | 'event';
  levelRequired: number;
  questGiver?: string;
  location?: string;
  chain?: string;
  faction?: string;
  objectives: number;
}

export interface BossEntry {
  id: string;
  name: string;
  type: 'outlaw' | 'faction' | 'legendary' | 'cosmic';
  level: number;
  location?: string;
  uniqueDrops: string[];
}

export interface AchievementEntry {
  id: string;
  name: string;
  category: 'combat' | 'crime' | 'social' | 'economy' | 'exploration' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
  target: number;
}

export interface RecipeEntry {
  id: string;
  name: string;
  profession: string;
  levelRequired: number;
  ingredients: number;
  product: string;
}

export interface EncounterEntry {
  id: string;
  name: string;
  type: 'combat' | 'event' | 'discovery' | 'story';
  dangerRange: { min: number; max: number };
  regions: string[];
}

// ========================================
// CONTENT REGISTRY CLASS
// ========================================

export class ContentRegistry {
  private static instance: ContentRegistry;

  // Content collections
  public locations: Map<string, LocationEntry> = new Map();
  public npcs: Map<string, NPCEntry> = new Map();
  public jobs: Map<string, JobEntry> = new Map();
  public crimes: Map<string, CrimeEntry> = new Map();
  public shops: Map<string, ShopEntry> = new Map();
  public items: Map<string, ItemEntry> = new Map();
  public quests: Map<string, QuestEntry> = new Map();
  public bosses: Map<string, BossEntry> = new Map();
  public achievements: Map<string, AchievementEntry> = new Map();
  public recipes: Map<string, RecipeEntry> = new Map();
  public encounters: Map<string, EncounterEntry> = new Map();

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): ContentRegistry {
    if (!ContentRegistry.instance) {
      ContentRegistry.instance = new ContentRegistry();
    }
    return ContentRegistry.instance;
  }

  // ========================================
  // REGISTRATION METHODS
  // ========================================

  public registerLocation(location: LocationEntry): void {
    this.locations.set(location.id, location);
  }

  public registerNPC(npc: NPCEntry): void {
    this.npcs.set(npc.id, npc);
  }

  public registerJob(job: JobEntry): void {
    this.jobs.set(job.id, job);
  }

  public registerCrime(crime: CrimeEntry): void {
    this.crimes.set(crime.id, crime);
  }

  public registerShop(shop: ShopEntry): void {
    this.shops.set(shop.id, shop);
  }

  public registerItem(item: ItemEntry): void {
    this.items.set(item.id, item);
  }

  public registerQuest(quest: QuestEntry): void {
    this.quests.set(quest.id, quest);
  }

  public registerBoss(boss: BossEntry): void {
    this.bosses.set(boss.id, boss);
  }

  public registerAchievement(achievement: AchievementEntry): void {
    this.achievements.set(achievement.id, achievement);
  }

  public registerRecipe(recipe: RecipeEntry): void {
    this.recipes.set(recipe.id, recipe);
  }

  public registerEncounter(encounter: EncounterEntry): void {
    this.encounters.set(encounter.id, encounter);
  }

  // ========================================
  // QUERY METHODS
  // ========================================

  public getLocationsByRegion(region: string): LocationEntry[] {
    return Array.from(this.locations.values()).filter(l => l.region === region);
  }

  public getNPCsByLocation(locationId: string): NPCEntry[] {
    return Array.from(this.npcs.values()).filter(n => n.location === locationId);
  }

  public getJobsByLocation(locationId: string): JobEntry[] {
    return Array.from(this.jobs.values()).filter(j => j.location === locationId);
  }

  public getQuestsByLevel(minLevel: number, maxLevel: number): QuestEntry[] {
    return Array.from(this.quests.values()).filter(
      q => q.levelRequired >= minLevel && q.levelRequired <= maxLevel
    );
  }

  public getItemsByRarity(rarity: string): ItemEntry[] {
    return Array.from(this.items.values()).filter(i => i.rarity === rarity);
  }

  public getBossesByType(type: string): BossEntry[] {
    return Array.from(this.bosses.values()).filter(b => b.type === type);
  }

  // ========================================
  // STATISTICS METHODS
  // ========================================

  public getTotalCounts(): Record<string, number> {
    return {
      locations: this.locations.size,
      npcs: this.npcs.size,
      jobs: this.jobs.size,
      crimes: this.crimes.size,
      shops: this.shops.size,
      items: this.items.size,
      quests: this.quests.size,
      bosses: this.bosses.size,
      achievements: this.achievements.size,
      recipes: this.recipes.size,
      encounters: this.encounters.size
    };
  }

  public getContentByCategory(): Record<string, any> {
    return {
      locations: {
        byRegion: this.groupBy(Array.from(this.locations.values()), 'region'),
        byType: this.groupBy(Array.from(this.locations.values()), 'type'),
        byFaction: this.groupBy(Array.from(this.locations.values()), 'faction')
      },
      npcs: {
        byRole: this.groupBy(Array.from(this.npcs.values()), 'role'),
        byFaction: this.groupBy(Array.from(this.npcs.values()), 'faction')
      },
      quests: {
        byType: this.groupBy(Array.from(this.quests.values()), 'type'),
        byFaction: this.groupBy(Array.from(this.quests.values()), 'faction')
      },
      items: {
        byRarity: this.groupBy(Array.from(this.items.values()), 'rarity'),
        byType: this.groupBy(Array.from(this.items.values()), 'type'),
        bySource: this.groupBy(Array.from(this.items.values()), 'source')
      },
      bosses: {
        byType: this.groupBy(Array.from(this.bosses.values()), 'type')
      }
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key] || 'undefined');
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // ========================================
  // EXPORT METHODS
  // ========================================

  public exportToJSON(): string {
    return JSON.stringify({
      locations: Array.from(this.locations.values()),
      npcs: Array.from(this.npcs.values()),
      jobs: Array.from(this.jobs.values()),
      crimes: Array.from(this.crimes.values()),
      shops: Array.from(this.shops.values()),
      items: Array.from(this.items.values()),
      quests: Array.from(this.quests.values()),
      bosses: Array.from(this.bosses.values()),
      achievements: Array.from(this.achievements.values()),
      recipes: Array.from(this.recipes.values()),
      encounters: Array.from(this.encounters.values())
    }, null, 2);
  }

  public clear(): void {
    this.locations.clear();
    this.npcs.clear();
    this.jobs.clear();
    this.crimes.clear();
    this.shops.clear();
    this.items.clear();
    this.quests.clear();
    this.bosses.clear();
    this.achievements.clear();
    this.recipes.clear();
    this.encounters.clear();
  }
}

// ========================================
// STATIC CONTENT DATA
// ========================================

/**
 * Hardcoded content registry from seed files and data files
 * This represents all content created across Phases 1-15
 */
export const STATIC_CONTENT_MANIFEST = {
  // Core locations from locations.seed.ts
  locations: [
    { id: 'red-gulch', name: 'Red Gulch', type: 'settlement', region: 'town', dangerLevel: 3, buildingCount: 45, npcCount: 12, jobCount: 3, shopCount: 2, faction: 'settler' },
    { id: 'the-frontera', name: 'The Frontera', type: 'settlement', region: 'outlaw_territory', dangerLevel: 6, buildingCount: 30, npcCount: 8, jobCount: 2, shopCount: 1, faction: 'frontera' },
    { id: 'fort-ashford', name: 'Fort Ashford', type: 'fort', region: 'town', dangerLevel: 4, buildingCount: 15, npcCount: 4, jobCount: 2, shopCount: 1, faction: 'settler' },
    { id: 'kaiowa-mesa', name: 'Kaiowa Mesa', type: 'mesa', region: 'sacred_lands', dangerLevel: 5, buildingCount: 20, npcCount: 10, jobCount: 2, shopCount: 1, faction: 'nahi' },
    { id: 'sangre-canyon', name: 'Sangre Canyon', type: 'canyon', region: 'devils_canyon', dangerLevel: 7, buildingCount: 5, npcCount: 2, jobCount: 2, shopCount: 0, faction: 'neutral' },
    { id: 'goldfingers-mine', name: "Goldfinger's Mine", type: 'mine', region: 'sangre_mountains', dangerLevel: 6, buildingCount: 8, npcCount: 3, jobCount: 2, shopCount: 1, faction: 'settler' },
    { id: 'thunderbirds-perch', name: "Thunderbird's Perch", type: 'sacred_site', region: 'sacred_lands', dangerLevel: 9, buildingCount: 2, npcCount: 1, jobCount: 0, shopCount: 0, faction: 'nahi' },
    { id: 'the-scar', name: 'The Scar', type: 'canyon', region: 'devils_canyon', dangerLevel: 10, buildingCount: 0, npcCount: 0, jobCount: 0, shopCount: 0, faction: 'nahi' },
    { id: 'dusty-trail', name: 'Dusty Trail', type: 'wilderness', region: 'dusty_flats', dangerLevel: 7, buildingCount: 3, npcCount: 0, jobCount: 2, shopCount: 0, faction: 'neutral' },
    { id: 'longhorn-ranch', name: 'Longhorn Ranch', type: 'ranch', region: 'dusty_flats', dangerLevel: 4, buildingCount: 6, npcCount: 2, jobCount: 2, shopCount: 0, faction: 'settler' },
    { id: 'spirit-springs', name: 'Spirit Springs', type: 'springs', region: 'sacred_lands', dangerLevel: 1, buildingCount: 3, npcCount: 1, jobCount: 1, shopCount: 1, faction: 'neutral' },
    { id: 'whiskey-bend', name: 'Whiskey Bend', type: 'settlement', region: 'frontier', dangerLevel: 5, buildingCount: 12, npcCount: 3, jobCount: 3, shopCount: 1, faction: 'neutral' },
    { id: 'the-wastes', name: 'The Wastes', type: 'wasteland', region: 'dusty_flats', dangerLevel: 8, buildingCount: 0, npcCount: 0, jobCount: 0, shopCount: 0, faction: 'frontera' }
  ],

  // Total building count from building seed files
  buildingCounts: {
    redGulch: 45,
    frontera: 30,
    kaiowaMesa: 20,
    fortAshford: 15,
    goldfingersMine: 8,
    longhorn: 6,
    whiskey: 12,
    other: 10
  },

  // Actions from actions.seed.ts
  actions: 10,

  // Items from items.seed.ts
  items: {
    weapons: { common: 5, uncommon: 4, rare: 3, legendary: 10 },
    armor: { common: 4, uncommon: 3, rare: 2, legendary: 8 },
    consumables: { common: 3, uncommon: 2, rare: 1 },
    mounts: { common: 1, uncommon: 1, rare: 1 },
    bossDrops: 5,
    questRewards: 10
  },

  // Quests from quests.seed.ts
  quests: {
    main: 3,
    side: 40,
    daily: 8,
    weekly: 3,
    event: 5
  },

  // Encounters from encounters.seed.ts
  encounters: {
    combat: 20,
    event: 20,
    discovery: 20,
    story: 20
  },

  // NPCs from seed files
  npcs: {
    questGivers: 25,
    vendors: 15,
    factionLeaders: 10,
    wandering: 30,
    lore: 20
  },

  // Bosses from data/bosses/*
  bosses: {
    outlaw: 8,
    faction: 6,
    legendary: 5,
    cosmic: 3
  },

  // Recipes from recipes.seed.ts
  recipes: {
    weaponCrafting: 10,
    armorCrafting: 8,
    cooking: 12,
    alchemy: 15
  },

  // Additional systems
  systems: {
    achievementDefinitions: 50,
    crimes: 15,
    skills: 12,
    professions: 8,
    gangs: 'unlimited_player_created',
    territoryZones: 24,
    weatherPatterns: 12,
    moonPhases: 8,
    seasonalEvents: 6
  }
};

export default ContentRegistry;
