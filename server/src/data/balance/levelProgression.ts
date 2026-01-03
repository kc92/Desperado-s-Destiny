/**
 * Level Progression Table
 *
 * Defines character progression from level 1 to 50.
 * Includes XP requirements, stat points, skill unlocks, and content gates.
 */

import { calculateXPForLevel, calculateTotalXPToLevel, LevelTier, getLevelTier } from '../../config/economy.config';

/**
 * Skill unlock definitions
 */
export interface SkillUnlock {
  skillId: string;
  name: string;
  description: string;
}

/**
 * Content unlock definitions
 */
export interface ContentUnlock {
  type: 'location' | 'quest' | 'feature' | 'crime' | 'job' | 'crafting';
  id: string;
  name: string;
  description: string;
}

/**
 * Level progression entry
 */
export interface LevelProgression {
  level: number;
  xpRequired: number;
  xpTotal: number;
  tier: LevelTier;
  statPoints: number;
  skillUnlocks: SkillUnlock[];
  contentUnlocks: ContentUnlock[];
  milestoneBonus?: {
    gold?: number;
    items?: string[];
    title?: string;
  };
}

/**
 * Complete level progression table (1-50)
 */
export const LEVEL_PROGRESSION_TABLE: Record<number, LevelProgression> = {
  1: {
    level: 1,
    xpRequired: 0,
    xpTotal: 0,
    tier: LevelTier.NOVICE,
    statPoints: 0,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'feature', id: 'character_creation', name: 'Character Creation', description: 'Create your first character' },
      { type: 'feature', id: 'basic_actions', name: 'Basic Actions', description: 'Perform crimes, combat, and social actions' },
      { type: 'crime', id: 'pickpocket', name: 'Pickpocketing', description: 'Steal from drunks and unsuspecting victims' }
    ]
  },
  2: {
    level: 2,
    xpRequired: 100,
    xpTotal: 100,
    tier: LevelTier.NOVICE,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'job', id: 'mining_basic', name: 'Mining Work', description: 'Earn gold through honest labor' }
    ]
  },
  3: {
    level: 3,
    xpRequired: 115,
    xpTotal: 215,
    tier: LevelTier.NOVICE,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'lockpicking', name: 'Lockpicking', description: 'Pick locks to access restricted areas' }
    ],
    contentUnlocks: [
      { type: 'crime', id: 'break_enter', name: 'Breaking & Entering', description: 'Burglarize homes and businesses' }
    ]
  },
  4: {
    level: 4,
    xpRequired: 132,
    xpTotal: 347,
    tier: LevelTier.NOVICE,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'feature', id: 'mail_system', name: 'Mail System', description: 'Send and receive mail from other players' }
    ]
  },
  5: {
    level: 5,
    xpRequired: 152,
    xpTotal: 499,
    tier: LevelTier.NOVICE,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'hunting', name: 'Hunting', description: 'Track and hunt wildlife' }
    ],
    contentUnlocks: [
      { type: 'feature', id: 'friends', name: 'Friends List', description: 'Add friends and form alliances' }
    ],
    milestoneBonus: {
      gold: 500,
      items: ['basic_weapon', 'basic_armor'],
      title: 'Greenhorn'
    }
  },
  6: {
    level: 6,
    xpRequired: 175,
    xpTotal: 674,
    tier: LevelTier.NOVICE,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'job', id: 'courier', name: 'Courier Work', description: 'Deliver packages across the territory' }
    ]
  },
  7: {
    level: 7,
    xpRequired: 201,
    xpTotal: 875,
    tier: LevelTier.NOVICE,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'card_counting', name: 'Card Counting', description: 'Improve your odds at card games' }
    ],
    contentUnlocks: [
      { type: 'feature', id: 'gambling', name: 'Gambling', description: 'Test your luck at card games' }
    ]
  },
  8: {
    level: 8,
    xpRequired: 231,
    xpTotal: 1106,
    tier: LevelTier.NOVICE,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'crafting', id: 'basic_crafting', name: 'Basic Crafting', description: 'Craft simple items and consumables' }
    ]
  },
  9: {
    level: 9,
    xpRequired: 266,
    xpTotal: 1372,
    tier: LevelTier.NOVICE,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'intimidation', name: 'Intimidation', description: 'Use fear to get what you want' }
    ],
    contentUnlocks: []
  },
  10: {
    level: 10,
    xpRequired: 306,
    xpTotal: 1678,
    tier: LevelTier.NOVICE,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'feature', id: 'gang_creation', name: 'Gang Creation', description: 'Form or join a gang' },
      { type: 'crime', id: 'burglary', name: 'Burglary', description: 'Rob stores and warehouses' }
    ],
    milestoneBonus: {
      gold: 2000,
      items: ['horse_common', 'upgraded_weapon'],
      title: 'Outlaw'
    }
  },
  11: {
    level: 11,
    xpRequired: 352,
    xpTotal: 2030,
    tier: LevelTier.JOURNEYMAN,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'marksmanship', name: 'Marksmanship', description: 'Improved accuracy with firearms' }
    ],
    contentUnlocks: []
  },
  12: {
    level: 12,
    xpRequired: 405,
    xpTotal: 2435,
    tier: LevelTier.JOURNEYMAN,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'location', id: 'canyon_outpost', name: 'Canyon Outpost', description: 'Access remote frontier locations' }
    ]
  },
  13: {
    level: 13,
    xpRequired: 466,
    xpTotal: 2901,
    tier: LevelTier.JOURNEYMAN,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'blacksmithing', name: 'Blacksmithing', description: 'Forge weapons and tools' }
    ],
    contentUnlocks: [
      { type: 'crafting', id: 'weapon_crafting', name: 'Weapon Crafting', description: 'Craft your own weapons' }
    ]
  },
  14: {
    level: 14,
    xpRequired: 536,
    xpTotal: 3437,
    tier: LevelTier.JOURNEYMAN,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  15: {
    level: 15,
    xpRequired: 616,
    xpTotal: 4053,
    tier: LevelTier.JOURNEYMAN,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'horse_riding', name: 'Horse Riding', description: 'Ride horses more effectively' }
    ],
    contentUnlocks: [
      { type: 'feature', id: 'property_ownership', name: 'Property Ownership', description: 'Purchase and manage properties' }
    ],
    milestoneBonus: {
      gold: 10000,
      items: ['rare_weapon', 'rare_armor'],
      title: 'Desperado'
    }
  },
  16: {
    level: 16,
    xpRequired: 708,
    xpTotal: 4761,
    tier: LevelTier.JOURNEYMAN,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'crime', id: 'cattle_rustling', name: 'Cattle Rustling', description: 'Steal valuable livestock' }
    ]
  },
  17: {
    level: 17,
    xpRequired: 814,
    xpTotal: 5575,
    tier: LevelTier.JOURNEYMAN,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'tracking', name: 'Tracking', description: 'Track animals and people through the wilderness' }
    ],
    contentUnlocks: []
  },
  18: {
    level: 18,
    xpRequired: 936,
    xpTotal: 6511,
    tier: LevelTier.JOURNEYMAN,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'feature', id: 'dueling', name: 'Dueling', description: 'Challenge other players to duels' }
    ]
  },
  19: {
    level: 19,
    xpRequired: 1076,
    xpTotal: 7587,
    tier: LevelTier.JOURNEYMAN,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'alchemy', name: 'Alchemy', description: 'Create potions and identify medicinal herbs' }
    ],
    contentUnlocks: [
      { type: 'crafting', id: 'alchemy', name: 'Alchemy', description: 'Brew potions and tonics' }
    ]
  },
  20: {
    level: 20,
    xpRequired: 1237,
    xpTotal: 8824,
    tier: LevelTier.JOURNEYMAN,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'feature', id: 'gang_wars', name: 'Gang Wars', description: 'Wage war against rival gangs' },
      { type: 'crime', id: 'stagecoach_robbery', name: 'Stagecoach Robbery', description: 'Rob wealthy travelers' }
    ],
    milestoneBonus: {
      gold: 25000,
      items: ['epic_weapon', 'horse_uncommon'],
      title: 'Gunslinger'
    }
  },
  21: {
    level: 21,
    xpRequired: 1423,
    xpTotal: 10247,
    tier: LevelTier.VETERAN,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'advanced_combat', name: 'Advanced Combat', description: 'Master combat techniques' }
    ],
    contentUnlocks: []
  },
  22: {
    level: 22,
    xpRequired: 1636,
    xpTotal: 11883,
    tier: LevelTier.VETERAN,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'location', id: 'ghost_town', name: 'Ghost Town', description: 'Explore abandoned settlements' }
    ]
  },
  23: {
    level: 23,
    xpRequired: 1881,
    xpTotal: 13764,
    tier: LevelTier.VETERAN,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'disguise', name: 'Disguise', description: 'Adopt false identities' }
    ],
    contentUnlocks: [
      { type: 'feature', id: 'disguise_system', name: 'Disguise System', description: 'Use disguises to evade law' }
    ]
  },
  24: {
    level: 24,
    xpRequired: 2163,
    xpTotal: 15927,
    tier: LevelTier.VETERAN,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  25: {
    level: 25,
    xpRequired: 2488,
    xpTotal: 18415,
    tier: LevelTier.VETERAN,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'master_crafting', name: 'Master Crafting', description: 'Craft exceptional items' }
    ],
    contentUnlocks: [
      { type: 'feature', id: 'tournaments', name: 'Tournaments', description: 'Compete in organized tournaments' }
    ],
    milestoneBonus: {
      gold: 75000,
      items: ['legendary_weapon', 'epic_armor'],
      title: 'Legend of the West'
    }
  },
  26: {
    level: 26,
    xpRequired: 2861,
    xpTotal: 21276,
    tier: LevelTier.VETERAN,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'crime', id: 'counterfeiting', name: 'Counterfeiting', description: 'Create fake currency' }
    ]
  },
  27: {
    level: 27,
    xpRequired: 3290,
    xpTotal: 24566,
    tier: LevelTier.VETERAN,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'leadership', name: 'Leadership', description: 'Lead gangs more effectively' }
    ],
    contentUnlocks: []
  },
  28: {
    level: 28,
    xpRequired: 3784,
    xpTotal: 28350,
    tier: LevelTier.VETERAN,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'feature', id: 'territory_wars', name: 'Territory Wars', description: 'Fight for control of regions' }
    ]
  },
  29: {
    level: 29,
    xpRequired: 4351,
    xpTotal: 32701,
    tier: LevelTier.VETERAN,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'explosives', name: 'Explosives', description: 'Use dynamite and explosives' }
    ],
    contentUnlocks: []
  },
  30: {
    level: 30,
    xpRequired: 5004,
    xpTotal: 37705,
    tier: LevelTier.VETERAN,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'crime', id: 'train_robbery', name: 'Train Robbery', description: 'Rob the iron horse itself' },
      { type: 'feature', id: 'bounty_hunting', name: 'Bounty Hunting', description: 'Hunt wanted criminals for rewards' }
    ],
    milestoneBonus: {
      gold: 150000,
      items: ['legendary_armor', 'horse_rare'],
      title: 'Scourge of the Frontier'
    }
  },
  31: {
    level: 31,
    xpRequired: 5755,
    xpTotal: 43460,
    tier: LevelTier.EXPERT,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'supernatural_awareness', name: 'Supernatural Awareness', description: 'Sense otherworldly presences' }
    ],
    contentUnlocks: [
      { type: 'feature', id: 'weird_west', name: 'Weird West Content', description: 'Encounter supernatural elements' }
    ]
  },
  32: {
    level: 32,
    xpRequired: 6618,
    xpTotal: 50078,
    tier: LevelTier.EXPERT,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  33: {
    level: 33,
    xpRequired: 7611,
    xpTotal: 57689,
    tier: LevelTier.EXPERT,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'spirit_walking', name: 'Spirit Walking', description: 'Commune with the spirit world' }
    ],
    contentUnlocks: []
  },
  34: {
    level: 34,
    xpRequired: 8752,
    xpTotal: 66441,
    tier: LevelTier.EXPERT,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'location', id: 'cursed_canyon', name: 'Cursed Canyon', description: 'Face supernatural horrors' }
    ]
  },
  35: {
    level: 35,
    xpRequired: 10065,
    xpTotal: 76506,
    tier: LevelTier.EXPERT,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'legendary_crafting', name: 'Legendary Crafting', description: 'Craft legendary items' }
    ],
    contentUnlocks: [
      { type: 'crafting', id: 'legendary_items', name: 'Legendary Crafting', description: 'Create the finest equipment' }
    ],
    milestoneBonus: {
      gold: 300000,
      items: ['legendary_mount', 'artifact_weapon'],
      title: 'Living Legend'
    }
  },
  36: {
    level: 36,
    xpRequired: 11575,
    xpTotal: 88081,
    tier: LevelTier.EXPERT,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  37: {
    level: 37,
    xpRequired: 13311,
    xpTotal: 101392,
    tier: LevelTier.EXPERT,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'destiny_mastery', name: 'Destiny Mastery', description: 'Master the Destiny Deck' }
    ],
    contentUnlocks: []
  },
  38: {
    level: 38,
    xpRequired: 15308,
    xpTotal: 116700,
    tier: LevelTier.EXPERT,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'quest', id: 'legendary_quest_1', name: 'The Pale Rider', description: 'Face death itself' }
    ]
  },
  39: {
    level: 39,
    xpRequired: 17604,
    xpTotal: 134304,
    tier: LevelTier.EXPERT,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'final_stand', name: 'Final Stand', description: 'Never surrender' }
    ],
    contentUnlocks: []
  },
  40: {
    level: 40,
    xpRequired: 20245,
    xpTotal: 154549,
    tier: LevelTier.EXPERT,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'crime', id: 'bank_heist', name: 'Bank Heist', description: 'The ultimate score' },
      { type: 'quest', id: 'legendary_quest_2', name: 'General Sangre', description: 'Face the tyrant himself' }
    ],
    milestoneBonus: {
      gold: 600000,
      items: ['ultimate_weapon', 'ultimate_armor'],
      title: 'Myth of the West'
    }
  },
  41: {
    level: 41,
    xpRequired: 23282,
    xpTotal: 177831,
    tier: LevelTier.MASTER,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  42: {
    level: 42,
    xpRequired: 26774,
    xpTotal: 204605,
    tier: LevelTier.MASTER,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'immortal_legend', name: 'Immortal Legend', description: 'Your legend becomes immortal' }
    ],
    contentUnlocks: []
  },
  43: {
    level: 43,
    xpRequired: 30790,
    xpTotal: 235395,
    tier: LevelTier.MASTER,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  44: {
    level: 44,
    xpRequired: 35409,
    xpTotal: 270804,
    tier: LevelTier.MASTER,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  45: {
    level: 45,
    xpRequired: 40720,
    xpTotal: 311524,
    tier: LevelTier.MASTER,
    statPoints: 2,
    skillUnlocks: [
      { skillId: 'perfect_draw', name: 'Perfect Draw', description: 'The cards always favor you' }
    ],
    contentUnlocks: [
      { type: 'feature', id: 'legacy_system', name: 'Legacy System', description: 'Build a lasting legacy' }
    ],
    milestoneBonus: {
      gold: 1000000,
      items: ['mythic_weapon', 'mythic_armor'],
      title: 'Immortal of Sangre Territory'
    }
  },
  46: {
    level: 46,
    xpRequired: 46828,
    xpTotal: 358352,
    tier: LevelTier.MASTER,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  47: {
    level: 47,
    xpRequired: 53852,
    xpTotal: 412204,
    tier: LevelTier.MASTER,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  48: {
    level: 48,
    xpRequired: 61930,
    xpTotal: 474134,
    tier: LevelTier.MASTER,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  49: {
    level: 49,
    xpRequired: 71219,
    xpTotal: 545353,
    tier: LevelTier.MASTER,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: []
  },
  50: {
    level: 50,
    xpRequired: 81902,
    xpTotal: 627255,
    tier: LevelTier.MASTER,
    statPoints: 2,
    skillUnlocks: [],
    contentUnlocks: [
      { type: 'feature', id: 'endgame_content', name: 'Endgame Content', description: 'The final frontier' },
      { type: 'quest', id: 'final_quest', name: 'The Cosmic Truth', description: 'Discover the terrible truth' }
    ],
    milestoneBonus: {
      gold: 2000000,
      items: ['cosmic_weapon', 'cosmic_armor', 'cosmic_mount'],
      title: 'God of the West'
    }
  }
};

/**
 * Generate complete progression table programmatically
 * This ensures all levels have entries even if not manually defined
 */
export function generateCompleteProgressionTable(): Record<number, LevelProgression> {
  const table: Record<number, LevelProgression> = {};

  for (let level = 1; level <= 50; level++) {
    const existing = LEVEL_PROGRESSION_TABLE[level];

    if (existing) {
      table[level] = existing;
    } else {
      // Generate entry for levels not manually defined
      table[level] = {
        level,
        xpRequired: calculateXPForLevel(level),
        xpTotal: calculateTotalXPToLevel(level),
        tier: getLevelTier(level),
        statPoints: level > 1 ? 2 : 0,
        skillUnlocks: [],
        contentUnlocks: []
      };
    }
  }

  return table;
}

/**
 * Get progression data for a specific level
 */
export function getLevelProgression(level: number): LevelProgression | null {
  if (level < 1 || level > 50) return null;
  const table = generateCompleteProgressionTable();
  return table[level] || null;
}

/**
 * Get all skill unlocks up to a level
 */
export function getSkillUnlocksUpToLevel(level: number): SkillUnlock[] {
  const unlocks: SkillUnlock[] = [];
  const table = generateCompleteProgressionTable();

  for (let l = 1; l <= level; l++) {
    const progression = table[l];
    if (progression && progression.skillUnlocks) {
      unlocks.push(...progression.skillUnlocks);
    }
  }

  return unlocks;
}

/**
 * Get all content unlocks up to a level
 */
export function getContentUnlocksUpToLevel(level: number): ContentUnlock[] {
  const unlocks: ContentUnlock[] = [];
  const table = generateCompleteProgressionTable();

  for (let l = 1; l <= level; l++) {
    const progression = table[l];
    if (progression && progression.contentUnlocks) {
      unlocks.push(...progression.contentUnlocks);
    }
  }

  return unlocks;
}

/**
 * Check if a specific content is unlocked at a level
 */
export function isContentUnlocked(level: number, contentId: string): boolean {
  const unlocks = getContentUnlocksUpToLevel(level);
  return unlocks.some(unlock => unlock.id === contentId);
}

/**
 * Get total stat points earned up to a level
 */
export function getTotalStatPoints(level: number): number {
  let total = 0;
  const table = generateCompleteProgressionTable();

  for (let l = 1; l <= level; l++) {
    const progression = table[l];
    if (progression) {
      total += progression.statPoints;
    }
  }

  return total;
}

/**
 * Export progression utilities
 */
export const LevelProgressionUtils = {
  LEVEL_PROGRESSION_TABLE,
  generateCompleteProgressionTable,
  getLevelProgression,
  getSkillUnlocksUpToLevel,
  getContentUnlocksUpToLevel,
  isContentUnlocked,
  getTotalStatPoints
} as const;

export default LevelProgressionUtils;
