/**
 * Progression Service
 * Phase 6: Progression Depth System
 *
 * Provides:
 * - Skill Trees with branching talent choices
 * - Build Synergies that reward focused playstyles
 * - Prestige System for endgame replayability
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { SkillService } from './skill.service';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Talent Node - A single node in a skill tree
 */
export interface TalentNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;                    // 1-5, determines position in tree
  skillId: string;                 // Which skill this talent belongs to
  requiredLevel: number;           // Skill level required to unlock
  prerequisites: string[];         // Other talent IDs that must be unlocked first
  maxRanks: number;                // How many times this can be upgraded (1-3)
  effects: TalentEffect[];         // What bonuses this talent provides
  exclusiveWith?: string[];        // Talents that can't be taken with this one
}

/**
 * Effect types for talents
 */
export interface TalentEffect {
  type: 'stat_bonus' | 'ability_unlock' | 'deck_bonus' | 'special';
  stat?: string;                   // For stat_bonus: which stat
  value: number;                   // Bonus amount (per rank)
  valuePerRank?: number;           // Additional value per rank beyond first
  description: string;             // Human-readable effect description
  abilityId?: string;              // For ability_unlock: which ability
}

/**
 * Player's progress in a talent tree
 */
export interface PlayerTalent {
  talentId: string;
  ranks: number;
  unlockedAt: Date;
}

/**
 * Build Synergy - Bonuses for focusing on specific combinations
 */
export interface BuildSynergy {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: SynergyRequirement[];
  bonuses: SynergyBonus[];
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
}

export interface SynergyRequirement {
  type: 'skill_level' | 'talent_count' | 'talent_specific' | 'suit_total';
  skillId?: string;
  minLevel?: number;
  talentIds?: string[];
  suit?: string;
  count?: number;
}

export interface SynergyBonus {
  type: 'deck_multiplier' | 'special_ability' | 'stat_boost' | 'unique_effect';
  stat?: string;
  value: number;
  description: string;
}

/**
 * Prestige System - Reset for permanent bonuses
 */
export interface PrestigeRank {
  rank: number;
  name: string;
  requiredLevel: number;            // Character level needed to prestige
  permanentBonuses: PrestigeBonus[];
  unlocks: string[];                // Special unlocks (titles, cosmetics, etc.)
}

export interface PrestigeBonus {
  type: 'xp_multiplier' | 'gold_multiplier' | 'skill_cap_increase' | 'starting_bonus';
  value: number;
  description: string;
}

export interface PlayerPrestige {
  currentRank: number;
  totalPrestiges: number;
  permanentBonuses: PrestigeBonus[];
  prestigeHistory: {
    rank: number;
    achievedAt: Date;
    levelAtPrestige: number;
  }[];
}

// =============================================================================
// SKILL TREES - TALENT DEFINITIONS
// =============================================================================

/**
 * Combat Skill Tree (Clubs suit)
 * Two paths: Berserker (offense) vs Guardian (defense)
 */
const COMBAT_TALENTS: TalentNode[] = [
  // Tier 1 - Basic talents (level 5+)
  {
    id: 'combat_precision',
    name: 'Precision Strikes',
    description: 'Your attacks are more accurate and hit harder',
    icon: '🎯',
    tier: 1,
    skillId: 'melee_combat',
    requiredLevel: 5,
    prerequisites: [],
    maxRanks: 3,
    effects: [
      { type: 'deck_bonus', value: 2, valuePerRank: 1, description: '+2 score per rank in combat games' }
    ]
  },
  {
    id: 'combat_resilience',
    name: 'Thick Skin',
    description: 'You shrug off damage more easily',
    icon: '🛡️',
    tier: 1,
    skillId: 'defensive_tactics',
    requiredLevel: 5,
    prerequisites: [],
    maxRanks: 3,
    effects: [
      { type: 'stat_bonus', stat: 'damage_reduction', value: 5, valuePerRank: 3, description: '+5% damage reduction per rank' }
    ]
  },

  // Tier 2 - Branching point (level 15+)
  {
    id: 'berserker_fury',
    name: 'Berserker Fury',
    description: 'Deal more damage when injured',
    icon: '😤',
    tier: 2,
    skillId: 'melee_combat',
    requiredLevel: 15,
    prerequisites: ['combat_precision'],
    maxRanks: 2,
    effects: [
      { type: 'special', value: 10, valuePerRank: 5, description: '+10% damage per rank when below 50% HP' }
    ],
    exclusiveWith: ['guardian_stance']
  },
  {
    id: 'guardian_stance',
    name: 'Guardian Stance',
    description: 'Greatly increased defense at cost of offense',
    icon: '🏰',
    tier: 2,
    skillId: 'defensive_tactics',
    requiredLevel: 15,
    prerequisites: ['combat_resilience'],
    maxRanks: 2,
    effects: [
      { type: 'stat_bonus', stat: 'defense', value: 15, valuePerRank: 10, description: '+15% defense per rank, -10% attack' }
    ],
    exclusiveWith: ['berserker_fury']
  },

  // Tier 3 - Advanced (level 25+)
  {
    id: 'critical_mastery',
    name: 'Critical Mastery',
    description: 'Higher chance for critical hits in deck games',
    icon: '💥',
    tier: 3,
    skillId: 'melee_combat',
    requiredLevel: 25,
    prerequisites: ['berserker_fury'],
    maxRanks: 3,
    effects: [
      { type: 'deck_bonus', value: 5, description: 'Face cards deal 5 extra damage per rank' }
    ]
  },
  {
    id: 'counter_strike',
    name: 'Counter Strike',
    description: 'Chance to counter-attack when blocking',
    icon: '↩️',
    tier: 3,
    skillId: 'defensive_tactics',
    requiredLevel: 25,
    prerequisites: ['guardian_stance'],
    maxRanks: 2,
    effects: [
      { type: 'special', value: 15, valuePerRank: 10, description: '15% chance per rank to counter-attack' }
    ]
  },

  // Tier 4 - Expert (level 35+)
  {
    id: 'execute',
    name: 'Execute',
    description: 'Massive damage to low-health targets',
    icon: '⚔️',
    tier: 4,
    skillId: 'melee_combat',
    requiredLevel: 35,
    prerequisites: ['critical_mastery'],
    maxRanks: 1,
    effects: [
      { type: 'special', value: 50, description: '+50% damage to targets below 25% HP' }
    ]
  },
  {
    id: 'last_stand',
    name: 'Last Stand',
    description: 'Become invulnerable briefly when near death',
    icon: '🌟',
    tier: 4,
    skillId: 'defensive_tactics',
    requiredLevel: 35,
    prerequisites: ['counter_strike'],
    maxRanks: 1,
    effects: [
      { type: 'ability_unlock', value: 1, abilityId: 'last_stand', description: 'Survive one killing blow per combat' }
    ]
  },

  // Tier 5 - Master (level 45+)
  {
    id: 'warlord',
    name: 'Warlord',
    description: 'Ultimate offensive mastery',
    icon: '👑',
    tier: 5,
    skillId: 'melee_combat',
    requiredLevel: 45,
    prerequisites: ['execute'],
    maxRanks: 1,
    effects: [
      { type: 'deck_bonus', value: 10, description: '+10 to all combat deck scores' },
      { type: 'special', value: 1, description: 'Can execute Turn 1 in combat duels' }
    ]
  },
  {
    id: 'immortal',
    name: 'Immortal',
    description: 'Ultimate defensive mastery',
    icon: '🏛️',
    tier: 5,
    skillId: 'defensive_tactics',
    requiredLevel: 45,
    prerequisites: ['last_stand'],
    maxRanks: 1,
    effects: [
      { type: 'stat_bonus', stat: 'max_hp', value: 50, description: '+50% maximum HP' },
      { type: 'special', value: 1, description: 'Regenerate 5% HP per turn in combat' }
    ]
  }
];

/**
 * Cunning Skill Tree (Spades suit)
 * Two paths: Infiltrator (stealth) vs Mastermind (planning)
 */
const CUNNING_TALENTS: TalentNode[] = [
  // Tier 1
  {
    id: 'quick_fingers',
    name: 'Quick Fingers',
    description: 'Faster and more reliable lockpicking',
    icon: '🔓',
    tier: 1,
    skillId: 'lockpicking',
    requiredLevel: 5,
    prerequisites: [],
    maxRanks: 3,
    effects: [
      { type: 'deck_bonus', value: 3, valuePerRank: 2, description: '+3 score in crime mini-games per rank' }
    ]
  },
  {
    id: 'silver_tongue',
    name: 'Silver Tongue',
    description: 'Better at talking your way out of trouble',
    icon: '🗣️',
    tier: 1,
    skillId: 'persuasion',
    requiredLevel: 5,
    prerequisites: [],
    maxRanks: 3,
    effects: [
      { type: 'stat_bonus', stat: 'bribe_reduction', value: 10, valuePerRank: 5, description: '-10% bribe costs per rank' }
    ]
  },

  // Tier 2 - Branching
  {
    id: 'shadow_step',
    name: 'Shadow Step',
    description: 'Move unseen through dangerous areas',
    icon: '👤',
    tier: 2,
    skillId: 'stealth',
    requiredLevel: 15,
    prerequisites: ['quick_fingers'],
    maxRanks: 2,
    effects: [
      { type: 'special', value: 20, valuePerRank: 10, description: '-20% detection chance per rank' }
    ],
    exclusiveWith: ['mastermind_planning']
  },
  {
    id: 'mastermind_planning',
    name: 'Mastermind Planning',
    description: 'Plan heists more effectively',
    icon: '🧠',
    tier: 2,
    skillId: 'strategy',
    requiredLevel: 15,
    prerequisites: ['silver_tongue'],
    maxRanks: 2,
    effects: [
      { type: 'special', value: 1, description: 'See one extra card in Press Your Luck before drawing' }
    ],
    exclusiveWith: ['shadow_step']
  },

  // Tier 3
  {
    id: 'ghost',
    name: 'Ghost',
    description: 'Become nearly undetectable',
    icon: '👻',
    tier: 3,
    skillId: 'stealth',
    requiredLevel: 25,
    prerequisites: ['shadow_step'],
    maxRanks: 2,
    effects: [
      { type: 'stat_bonus', stat: 'escape_chance', value: 25, valuePerRank: 15, description: '+25% escape success per rank' }
    ]
  },
  {
    id: 'perfect_crime',
    name: 'Perfect Crime',
    description: 'Crimes have much lower detection chance',
    icon: '🎭',
    tier: 3,
    skillId: 'strategy',
    requiredLevel: 25,
    prerequisites: ['mastermind_planning'],
    maxRanks: 2,
    effects: [
      { type: 'special', value: 30, valuePerRank: 15, description: '-30% crime detection chance per rank' }
    ]
  },

  // Tier 4
  {
    id: 'assassin',
    name: 'Assassin',
    description: 'Strike from the shadows for massive damage',
    icon: '🗡️',
    tier: 4,
    skillId: 'stealth',
    requiredLevel: 35,
    prerequisites: ['ghost'],
    maxRanks: 1,
    effects: [
      { type: 'special', value: 100, description: 'First attack from stealth deals double damage' }
    ]
  },
  {
    id: 'kingpin',
    name: 'Kingpin',
    description: 'Run a criminal empire',
    icon: '🎩',
    tier: 4,
    skillId: 'strategy',
    requiredLevel: 35,
    prerequisites: ['perfect_crime'],
    maxRanks: 1,
    effects: [
      { type: 'stat_bonus', stat: 'crime_gold', value: 50, description: '+50% gold from all crimes' }
    ]
  },

  // Tier 5
  {
    id: 'legend_shadows',
    name: 'Legend of the Shadows',
    description: 'Ultimate infiltrator mastery',
    icon: '🌑',
    tier: 5,
    skillId: 'stealth',
    requiredLevel: 45,
    prerequisites: ['assassin'],
    maxRanks: 1,
    effects: [
      { type: 'ability_unlock', value: 1, abilityId: 'vanish', description: 'Can vanish mid-combat once per day' },
      { type: 'deck_bonus', value: 15, description: '+15 to all crime mini-game scores' }
    ]
  },
  {
    id: 'legend_crime',
    name: 'Legend of Crime',
    description: 'Ultimate mastermind mastery',
    icon: '🏆',
    tier: 5,
    skillId: 'strategy',
    requiredLevel: 45,
    prerequisites: ['kingpin'],
    maxRanks: 1,
    effects: [
      { type: 'special', value: 1, description: 'Can attempt any crime regardless of requirements' },
      { type: 'stat_bonus', stat: 'gang_influence', value: 100, description: '+100% gang influence gain' }
    ]
  }
];

/**
 * Social Skill Tree (Hearts suit)
 * Two paths: Charmer (romance/friendship) vs Leader (gang/influence)
 */
const SOCIAL_TALENTS: TalentNode[] = [
  // Tier 1
  {
    id: 'friendly_face',
    name: 'Friendly Face',
    description: 'NPCs like you more quickly',
    icon: '😊',
    tier: 1,
    skillId: 'charm',
    requiredLevel: 5,
    prerequisites: [],
    maxRanks: 3,
    effects: [
      { type: 'stat_bonus', stat: 'reputation_gain', value: 10, valuePerRank: 5, description: '+10% reputation gain per rank' }
    ]
  },
  {
    id: 'natural_leader',
    name: 'Natural Leader',
    description: 'Gang members follow you more loyally',
    icon: '👥',
    tier: 1,
    skillId: 'leadership',
    requiredLevel: 5,
    prerequisites: [],
    maxRanks: 3,
    effects: [
      { type: 'stat_bonus', stat: 'gang_loyalty', value: 5, valuePerRank: 3, description: '+5% gang loyalty per rank' }
    ]
  },

  // Tier 2
  {
    id: 'smooth_talker',
    name: 'Smooth Talker',
    description: 'Better outcomes in social situations',
    icon: '💬',
    tier: 2,
    skillId: 'charm',
    requiredLevel: 15,
    prerequisites: ['friendly_face'],
    maxRanks: 2,
    effects: [
      { type: 'deck_bonus', value: 4, valuePerRank: 2, description: '+4 score in blackjack social games per rank' }
    ],
    exclusiveWith: ['iron_will']
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Your gang is more effective in wars',
    icon: '⚒️',
    tier: 2,
    skillId: 'leadership',
    requiredLevel: 15,
    prerequisites: ['natural_leader'],
    maxRanks: 2,
    effects: [
      { type: 'stat_bonus', stat: 'gang_combat', value: 15, valuePerRank: 10, description: '+15% gang combat effectiveness per rank' }
    ],
    exclusiveWith: ['smooth_talker']
  },

  // Tier 3
  {
    id: 'heartbreaker',
    name: 'Heartbreaker',
    description: 'Romance relationships progress faster',
    icon: '💕',
    tier: 3,
    skillId: 'charm',
    requiredLevel: 25,
    prerequisites: ['smooth_talker'],
    maxRanks: 2,
    effects: [
      { type: 'stat_bonus', stat: 'romance_speed', value: 25, valuePerRank: 15, description: '+25% romance progression per rank' }
    ]
  },
  {
    id: 'warlord_social',
    name: 'Gang Warlord',
    description: 'Command larger gangs',
    icon: '🏴',
    tier: 3,
    skillId: 'leadership',
    requiredLevel: 25,
    prerequisites: ['iron_will'],
    maxRanks: 2,
    effects: [
      { type: 'stat_bonus', stat: 'gang_size', value: 5, valuePerRank: 3, description: '+5 max gang members per rank' }
    ]
  },

  // Tier 4
  {
    id: 'beloved',
    name: 'Beloved',
    description: 'Maximum reputation with all factions',
    icon: '🌹',
    tier: 4,
    skillId: 'charm',
    requiredLevel: 35,
    prerequisites: ['heartbreaker'],
    maxRanks: 1,
    effects: [
      { type: 'stat_bonus', stat: 'max_reputation', value: 20, description: '+20 to maximum faction reputation' }
    ]
  },
  {
    id: 'emperor',
    name: 'Emperor',
    description: 'Your gang is feared throughout the land',
    icon: '👑',
    tier: 4,
    skillId: 'leadership',
    requiredLevel: 35,
    prerequisites: ['warlord_social'],
    maxRanks: 1,
    effects: [
      { type: 'special', value: 1, description: 'Can declare war on any gang regardless of size' }
    ]
  },

  // Tier 5
  {
    id: 'legend_hearts',
    name: 'Legend of Hearts',
    description: 'Ultimate social mastery',
    icon: '❤️',
    tier: 5,
    skillId: 'charm',
    requiredLevel: 45,
    prerequisites: ['beloved'],
    maxRanks: 1,
    effects: [
      { type: 'ability_unlock', value: 1, abilityId: 'charm_anyone', description: 'Can befriend even hostile NPCs' },
      { type: 'deck_bonus', value: 20, description: '+20 to all social mini-game scores' }
    ]
  },
  {
    id: 'legend_empire',
    name: 'Legend of the Empire',
    description: 'Ultimate leadership mastery',
    icon: '🏛️',
    tier: 5,
    skillId: 'leadership',
    requiredLevel: 45,
    prerequisites: ['emperor'],
    maxRanks: 1,
    effects: [
      { type: 'stat_bonus', stat: 'gang_size', value: 20, description: '+20 max gang members' },
      { type: 'stat_bonus', stat: 'territory_control', value: 50, description: '+50% territory control speed' }
    ]
  }
];

/**
 * Trade Skill Tree (Diamonds suit)
 * Two paths: Crafter (making items) vs Merchant (buying/selling)
 */
const TRADE_TALENTS: TalentNode[] = [
  // Tier 1
  {
    id: 'skilled_hands',
    name: 'Skilled Hands',
    description: 'Craft items more efficiently',
    icon: '🔧',
    tier: 1,
    skillId: 'blacksmithing',
    requiredLevel: 5,
    prerequisites: [],
    maxRanks: 3,
    effects: [
      { type: 'stat_bonus', stat: 'crafting_speed', value: 10, valuePerRank: 5, description: '-10% crafting time per rank' }
    ]
  },
  {
    id: 'keen_eye',
    name: 'Keen Eye',
    description: 'Better at spotting deals',
    icon: '👁️',
    tier: 1,
    skillId: 'appraisal',
    requiredLevel: 5,
    prerequisites: [],
    maxRanks: 3,
    effects: [
      { type: 'stat_bonus', stat: 'shop_discount', value: 5, valuePerRank: 3, description: '-5% shop prices per rank' }
    ]
  },

  // Tier 2
  {
    id: 'master_craftsman',
    name: 'Master Craftsman',
    description: 'Higher chance of quality crafts',
    icon: '⚒️',
    tier: 2,
    skillId: 'blacksmithing',
    requiredLevel: 15,
    prerequisites: ['skilled_hands'],
    maxRanks: 2,
    effects: [
      { type: 'stat_bonus', stat: 'craft_quality', value: 15, valuePerRank: 10, description: '+15% masterwork chance per rank' }
    ],
    exclusiveWith: ['silver_tongue_trade']
  },
  {
    id: 'silver_tongue_trade',
    name: 'Merchant Prince',
    description: 'Better prices when buying and selling',
    icon: '💰',
    tier: 2,
    skillId: 'appraisal',
    requiredLevel: 15,
    prerequisites: ['keen_eye'],
    maxRanks: 2,
    effects: [
      { type: 'stat_bonus', stat: 'sell_bonus', value: 10, valuePerRank: 5, description: '+10% sell prices per rank' }
    ],
    exclusiveWith: ['master_craftsman']
  },

  // Tier 3
  {
    id: 'legendary_smith',
    name: 'Legendary Smith',
    description: 'Can craft legendary items',
    icon: '🗡️',
    tier: 3,
    skillId: 'blacksmithing',
    requiredLevel: 25,
    prerequisites: ['master_craftsman'],
    maxRanks: 2,
    effects: [
      { type: 'ability_unlock', value: 1, abilityId: 'craft_legendary', description: 'Can craft legendary tier items' }
    ]
  },
  {
    id: 'trade_network',
    name: 'Trade Network',
    description: 'Access to exclusive merchants',
    icon: '🌐',
    tier: 3,
    skillId: 'appraisal',
    requiredLevel: 25,
    prerequisites: ['silver_tongue_trade'],
    maxRanks: 2,
    effects: [
      { type: 'special', value: 1, description: 'Unlocks secret merchant with rare items' }
    ]
  },

  // Tier 4
  {
    id: 'artisan',
    name: 'Artisan Supreme',
    description: 'Crafted items have bonus effects',
    icon: '✨',
    tier: 4,
    skillId: 'blacksmithing',
    requiredLevel: 35,
    prerequisites: ['legendary_smith'],
    maxRanks: 1,
    effects: [
      { type: 'special', value: 1, description: 'All crafted items gain +1 random enchantment' }
    ]
  },
  {
    id: 'mogul',
    name: 'Business Mogul',
    description: 'Passive gold generation',
    icon: '🏦',
    tier: 4,
    skillId: 'appraisal',
    requiredLevel: 35,
    prerequisites: ['trade_network'],
    maxRanks: 1,
    effects: [
      { type: 'stat_bonus', stat: 'passive_gold', value: 100, description: '+100 gold per real-world hour' }
    ]
  },

  // Tier 5
  {
    id: 'legend_forge',
    name: 'Legend of the Forge',
    description: 'Ultimate crafting mastery',
    icon: '🔥',
    tier: 5,
    skillId: 'blacksmithing',
    requiredLevel: 45,
    prerequisites: ['artisan'],
    maxRanks: 1,
    effects: [
      { type: 'special', value: 1, description: 'Can craft unique named items' },
      { type: 'deck_bonus', value: 25, description: '+25 to all crafting mini-game scores' }
    ]
  },
  {
    id: 'legend_gold',
    name: 'Legend of Gold',
    description: 'Ultimate merchant mastery',
    icon: '💎',
    tier: 5,
    skillId: 'appraisal',
    requiredLevel: 45,
    prerequisites: ['mogul'],
    maxRanks: 1,
    effects: [
      { type: 'stat_bonus', stat: 'gold_multiplier', value: 25, description: '+25% gold from all sources' },
      { type: 'special', value: 1, description: 'Can buy items from any NPC, even quest items' }
    ]
  }
];

// Combine all talent trees
export const ALL_TALENTS: TalentNode[] = [
  ...COMBAT_TALENTS,
  ...CUNNING_TALENTS,
  ...SOCIAL_TALENTS,
  ...TRADE_TALENTS
];

// =============================================================================
// BUILD SYNERGIES
// =============================================================================

export const BUILD_SYNERGIES: BuildSynergy[] = [
  // === BRONZE TIER - Easy to achieve ===
  {
    id: 'warrior_initiate',
    name: 'Warrior Initiate',
    description: 'Focused on combat skills',
    icon: '⚔️',
    tier: 'bronze',
    requirements: [
      { type: 'skill_level', skillId: 'melee_combat', minLevel: 15 },
      { type: 'skill_level', skillId: 'ranged_combat', minLevel: 15 }
    ],
    bonuses: [
      { type: 'deck_multiplier', value: 1.05, description: '+5% combat deck score' }
    ]
  },
  {
    id: 'thief_initiate',
    name: 'Thief Initiate',
    description: 'Starting down the criminal path',
    icon: '🔓',
    tier: 'bronze',
    requirements: [
      { type: 'skill_level', skillId: 'lockpicking', minLevel: 15 },
      { type: 'skill_level', skillId: 'stealth', minLevel: 15 }
    ],
    bonuses: [
      { type: 'deck_multiplier', value: 1.05, description: '+5% crime deck score' }
    ]
  },
  {
    id: 'diplomat_initiate',
    name: 'Diplomat Initiate',
    description: 'Social skills are improving',
    icon: '🤝',
    tier: 'bronze',
    requirements: [
      { type: 'skill_level', skillId: 'charm', minLevel: 15 },
      { type: 'skill_level', skillId: 'persuasion', minLevel: 15 }
    ],
    bonuses: [
      { type: 'deck_multiplier', value: 1.05, description: '+5% social deck score' }
    ]
  },

  // === SILVER TIER - Moderate investment ===
  {
    id: 'berserker_path',
    name: 'Path of the Berserker',
    description: 'Offensive combat mastery',
    icon: '😤',
    tier: 'silver',
    requirements: [
      { type: 'skill_level', skillId: 'melee_combat', minLevel: 30 },
      { type: 'talent_specific', talentIds: ['berserker_fury', 'critical_mastery'] }
    ],
    bonuses: [
      { type: 'stat_boost', stat: 'attack_power', value: 15, description: '+15% attack power' },
      { type: 'deck_multiplier', value: 1.1, description: '+10% combat deck score' }
    ]
  },
  {
    id: 'guardian_path',
    name: 'Path of the Guardian',
    description: 'Defensive combat mastery',
    icon: '🛡️',
    tier: 'silver',
    requirements: [
      { type: 'skill_level', skillId: 'defensive_tactics', minLevel: 30 },
      { type: 'talent_specific', talentIds: ['guardian_stance', 'counter_strike'] }
    ],
    bonuses: [
      { type: 'stat_boost', stat: 'defense', value: 20, description: '+20% defense' },
      { type: 'deck_multiplier', value: 1.1, description: '+10% defense deck score' }
    ]
  },
  {
    id: 'shadow_path',
    name: 'Path of Shadows',
    description: 'Stealth mastery',
    icon: '👤',
    tier: 'silver',
    requirements: [
      { type: 'skill_level', skillId: 'stealth', minLevel: 30 },
      { type: 'talent_specific', talentIds: ['shadow_step', 'ghost'] }
    ],
    bonuses: [
      { type: 'stat_boost', stat: 'stealth', value: 25, description: '+25% stealth effectiveness' },
      { type: 'special_ability', value: 1, description: 'Can attempt stealth in daylight' }
    ]
  },

  // === GOLD TIER - Significant investment ===
  {
    id: 'warlord_supreme',
    name: 'Supreme Warlord',
    description: 'Master of all combat',
    icon: '👑',
    tier: 'gold',
    requirements: [
      { type: 'suit_total', suit: 'clubs', count: 150 },
      { type: 'talent_count', count: 5 }
    ],
    bonuses: [
      { type: 'deck_multiplier', value: 1.2, description: '+20% all combat deck scores' },
      { type: 'stat_boost', stat: 'combat_xp', value: 25, description: '+25% combat XP' },
      { type: 'unique_effect', value: 1, description: 'Intimidate enemies before combat' }
    ]
  },
  {
    id: 'criminal_mastermind',
    name: 'Criminal Mastermind',
    description: 'Master of all crime',
    icon: '🎭',
    tier: 'gold',
    requirements: [
      { type: 'suit_total', suit: 'spades', count: 150 },
      { type: 'talent_count', count: 5 }
    ],
    bonuses: [
      { type: 'deck_multiplier', value: 1.2, description: '+20% all crime deck scores' },
      { type: 'stat_boost', stat: 'crime_gold', value: 30, description: '+30% crime gold' },
      { type: 'unique_effect', value: 1, description: 'Never detected for minor crimes' }
    ]
  },

  // === LEGENDARY TIER - Endgame achievement ===
  {
    id: 'legend_west',
    name: 'Legend of the West',
    description: 'Master of all disciplines',
    icon: '🌟',
    tier: 'legendary',
    requirements: [
      { type: 'suit_total', suit: 'clubs', count: 100 },
      { type: 'suit_total', suit: 'spades', count: 100 },
      { type: 'suit_total', suit: 'hearts', count: 100 },
      { type: 'suit_total', suit: 'diamonds', count: 100 }
    ],
    bonuses: [
      { type: 'deck_multiplier', value: 1.15, description: '+15% ALL deck scores' },
      { type: 'stat_boost', stat: 'xp', value: 20, description: '+20% all XP' },
      { type: 'stat_boost', stat: 'gold', value: 20, description: '+20% all gold' },
      { type: 'unique_effect', value: 1, description: 'Unique "Legend" title and golden name' }
    ]
  }
];

// =============================================================================
// PRESTIGE SYSTEM
// =============================================================================

export const PRESTIGE_RANKS: PrestigeRank[] = [
  {
    rank: 1,
    name: 'Outlaw',
    requiredLevel: 50,
    permanentBonuses: [
      { type: 'xp_multiplier', value: 1.05, description: '+5% XP gain permanently' },
      { type: 'starting_bonus', value: 100, description: 'Start with 100 gold after prestige' }
    ],
    unlocks: ['title_outlaw', 'border_bronze']
  },
  {
    rank: 2,
    name: 'Desperado',
    requiredLevel: 50,
    permanentBonuses: [
      { type: 'xp_multiplier', value: 1.10, description: '+10% XP gain permanently' },
      { type: 'gold_multiplier', value: 1.05, description: '+5% gold gain permanently' },
      { type: 'starting_bonus', value: 250, description: 'Start with 250 gold after prestige' }
    ],
    unlocks: ['title_desperado', 'border_silver', 'emote_tip_hat']
  },
  {
    rank: 3,
    name: 'Gunslinger',
    requiredLevel: 50,
    permanentBonuses: [
      { type: 'xp_multiplier', value: 1.15, description: '+15% XP gain permanently' },
      { type: 'gold_multiplier', value: 1.10, description: '+10% gold gain permanently' },
      { type: 'skill_cap_increase', value: 5, description: '+5 max skill level' },
      { type: 'starting_bonus', value: 500, description: 'Start with 500 gold after prestige' }
    ],
    unlocks: ['title_gunslinger', 'border_gold', 'horse_skin_black']
  },
  {
    rank: 4,
    name: 'Legend',
    requiredLevel: 50,
    permanentBonuses: [
      { type: 'xp_multiplier', value: 1.20, description: '+20% XP gain permanently' },
      { type: 'gold_multiplier', value: 1.15, description: '+15% gold gain permanently' },
      { type: 'skill_cap_increase', value: 10, description: '+10 max skill level' },
      { type: 'starting_bonus', value: 1000, description: 'Start with 1000 gold after prestige' }
    ],
    unlocks: ['title_legend', 'border_platinum', 'weapon_skin_gold', 'unique_npc_dialogue']
  },
  {
    rank: 5,
    name: 'Mythic',
    requiredLevel: 50,
    permanentBonuses: [
      { type: 'xp_multiplier', value: 1.25, description: '+25% XP gain permanently' },
      { type: 'gold_multiplier', value: 1.20, description: '+20% gold gain permanently' },
      { type: 'skill_cap_increase', value: 15, description: '+15 max skill level' },
      { type: 'starting_bonus', value: 2500, description: 'Start with 2500 gold after prestige' }
    ],
    unlocks: ['title_mythic', 'border_mythic', 'aura_legendary', 'global_leaderboard_badge']
  }
];

// =============================================================================
// SERVICE CLASS
// =============================================================================

export class ProgressionService {
  /**
   * Get all available talents for a character
   */
  static async getAvailableTalents(characterId: string): Promise<{
    talents: TalentNode[];
    playerTalents: PlayerTalent[];
    talentPoints: number;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    // Get player's current talents (stored on character)
    const playerTalents: PlayerTalent[] = (character as any).talents || [];

    // Calculate available talent points
    // 1 point per 5 character levels + 1 per 10 skill levels
    const levelPoints = Math.floor(character.level / 5);
    const skillPoints = character.skills.reduce((sum, skill) => sum + Math.floor(skill.level / 10), 0);
    const spentPoints = playerTalents.reduce((sum, t) => sum + t.ranks, 0);
    const talentPoints = levelPoints + skillPoints - spentPoints;

    return {
      talents: ALL_TALENTS,
      playerTalents,
      talentPoints: Math.max(0, talentPoints)
    };
  }

  /**
   * Unlock or upgrade a talent
   */
  static async unlockTalent(
    characterId: string,
    talentId: string
  ): Promise<{ success: boolean; talent?: PlayerTalent; error?: string }> {
    const character = await Character.findById(characterId);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    const talent = ALL_TALENTS.find(t => t.id === talentId);
    if (!talent) {
      return { success: false, error: 'Talent not found' };
    }

    // Get current talent state
    const playerTalents: PlayerTalent[] = (character as any).talents || [];
    const existingTalent = playerTalents.find(t => t.talentId === talentId);

    // Check if already maxed
    if (existingTalent && existingTalent.ranks >= talent.maxRanks) {
      return { success: false, error: 'Talent already at max rank' };
    }

    // Check skill level requirement
    const skill = character.skills.find(s => s.skillId === talent.skillId);
    const skillLevel = skill?.level || 0;
    if (skillLevel < talent.requiredLevel) {
      return { success: false, error: `Requires ${talent.skillId} level ${talent.requiredLevel}` };
    }

    // Check prerequisites
    for (const prereq of talent.prerequisites) {
      const hasPrereq = playerTalents.find(t => t.talentId === prereq && t.ranks > 0);
      if (!hasPrereq) {
        const prereqTalent = ALL_TALENTS.find(t => t.id === prereq);
        return { success: false, error: `Requires ${prereqTalent?.name || prereq} first` };
      }
    }

    // Check exclusivity
    if (talent.exclusiveWith) {
      for (const exclusive of talent.exclusiveWith) {
        const hasExclusive = playerTalents.find(t => t.talentId === exclusive && t.ranks > 0);
        if (hasExclusive) {
          const exclusiveTalent = ALL_TALENTS.find(t => t.id === exclusive);
          return { success: false, error: `Cannot take with ${exclusiveTalent?.name || exclusive}` };
        }
      }
    }

    // Check talent points
    const { talentPoints } = await this.getAvailableTalents(characterId);
    if (talentPoints < 1) {
      return { success: false, error: 'Not enough talent points' };
    }

    // Unlock/upgrade talent
    if (existingTalent) {
      existingTalent.ranks += 1;
    } else {
      playerTalents.push({
        talentId,
        ranks: 1,
        unlockedAt: new Date()
      });
    }

    // Save to character
    (character as any).talents = playerTalents;
    await character.save();

    const updatedTalent = playerTalents.find(t => t.talentId === talentId)!;
    logger.info(`Character ${characterId} unlocked talent ${talentId} rank ${updatedTalent.ranks}`);

    return { success: true, talent: updatedTalent };
  }

  /**
   * Calculate total bonuses from talents
   */
  static calculateTalentBonuses(playerTalents: PlayerTalent[]): Record<string, number> {
    const bonuses: Record<string, number> = {};

    for (const pt of playerTalents) {
      const talent = ALL_TALENTS.find(t => t.id === pt.talentId);
      if (!talent) continue;

      for (const effect of talent.effects) {
        if (effect.type === 'stat_bonus' && effect.stat) {
          const baseValue = effect.value;
          const perRank = effect.valuePerRank || 0;
          const totalValue = baseValue + (perRank * (pt.ranks - 1));
          bonuses[effect.stat] = (bonuses[effect.stat] || 0) + totalValue;
        }
        if (effect.type === 'deck_bonus') {
          const baseValue = effect.value;
          const perRank = effect.valuePerRank || 0;
          const totalValue = baseValue + (perRank * (pt.ranks - 1));
          bonuses['deck_score'] = (bonuses['deck_score'] || 0) + totalValue;
        }
      }
    }

    return bonuses;
  }

  /**
   * Get active build synergies for a character
   */
  static async getActiveSynergies(characterId: string): Promise<BuildSynergy[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      return [];
    }

    const playerTalents: PlayerTalent[] = (character as any).talents || [];
    const activeSynergies: BuildSynergy[] = [];

    // Calculate suit totals
    const suitTotals: Record<string, number> = {
      clubs: 0,
      spades: 0,
      hearts: 0,
      diamonds: 0
    };
    // Note: Would need to import SKILLS to properly calculate suit totals
    // For now, using a simplified approach

    for (const synergy of BUILD_SYNERGIES) {
      let meetsAllRequirements = true;

      for (const req of synergy.requirements) {
        switch (req.type) {
          case 'skill_level': {
            const skill = character.skills.find(s => s.skillId === req.skillId);
            if (!skill || skill.level < (req.minLevel || 0)) {
              meetsAllRequirements = false;
            }
            break;
          }
          case 'talent_count': {
            if (playerTalents.length < (req.count || 0)) {
              meetsAllRequirements = false;
            }
            break;
          }
          case 'talent_specific': {
            const hasAll = req.talentIds?.every(tid =>
              playerTalents.some(pt => pt.talentId === tid && pt.ranks > 0)
            );
            if (!hasAll) {
              meetsAllRequirements = false;
            }
            break;
          }
          case 'suit_total': {
            // Simplified check - would need full skill data
            break;
          }
        }

        if (!meetsAllRequirements) break;
      }

      if (meetsAllRequirements) {
        activeSynergies.push(synergy);
      }
    }

    return activeSynergies;
  }

  /**
   * Get prestige info for a character
   */
  static async getPrestigeInfo(characterId: string): Promise<{
    currentRank: PlayerPrestige;
    nextRank: PrestigeRank | null;
    canPrestige: boolean;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new AppError('Character not found', 404);
    }

    const playerPrestige: PlayerPrestige = (character as any).prestige || {
      currentRank: 0,
      totalPrestiges: 0,
      permanentBonuses: [],
      prestigeHistory: []
    };

    const nextRankIndex = playerPrestige.currentRank;
    const nextRank = nextRankIndex < PRESTIGE_RANKS.length ? PRESTIGE_RANKS[nextRankIndex] : null;

    // NEW PRESTIGE REQUIREMENTS (replacing old character.level check):
    // - Total Level >= 1000
    // - Combat Level >= 75
    // - At least 5 skills at level 50+
    const totalLevel = character.totalLevel || 30;
    const combatLevel = character.combatLevel || 1;
    const skillsAt50Plus = character.skills.filter(s => s.level >= 50).length;

    const canPrestige = nextRank !== null &&
      totalLevel >= 1000 &&
      combatLevel >= 75 &&
      skillsAt50Plus >= 5;

    return {
      currentRank: playerPrestige,
      nextRank,
      canPrestige
    };
  }

  /**
   * Perform prestige - reset character for permanent bonuses
   */
  static async performPrestige(characterId: string): Promise<{
    success: boolean;
    newRank?: PrestigeRank;
    error?: string;
  }> {
    // Pre-flight checks before starting transaction
    const { canPrestige, nextRank } = await this.getPrestigeInfo(characterId);
    if (!canPrestige || !nextRank) {
      return { success: false, error: 'Cannot prestige - requirements not met' };
    }

    // Wrap entire prestige operation in a transaction for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character not found' };
      }

      // Get/create prestige data
      const playerPrestige: PlayerPrestige = (character as any).prestige || {
        currentRank: 0,
        totalPrestiges: 0,
        permanentBonuses: [],
        prestigeHistory: []
      };

      // Record prestige (use totalLevel instead of old character.level)
      playerPrestige.prestigeHistory.push({
        rank: nextRank.rank,
        achievedAt: new Date(),
        levelAtPrestige: character.totalLevel || 30
      });

      // Add permanent bonuses
      playerPrestige.permanentBonuses.push(...nextRank.permanentBonuses);
      playerPrestige.currentRank = nextRank.rank;
      playerPrestige.totalPrestiges += 1;

      // Calculate starting dollars from bonuses
      const startingDollars = nextRank.permanentBonuses
        .filter(b => b.type === 'starting_bonus')
        .reduce((sum, b) => sum + b.value, 0);

      // Reset character but keep prestige
      character.level = 1;  // Kept for backward compatibility
      character.experience = 0;
      character.dollars = startingDollars;

      // Reset skills to level 1
      for (const skill of character.skills) {
        skill.level = 1;
        skill.experience = 0;
      }

      // Reset Total Level system using consistent calculation
      SkillService.updateTotalLevel(character);

      // Reset Combat XP and Combat Level
      character.combatXp = 0;
      character.combatLevel = 1;

      // Clear talents (but keep prestige)
      (character as any).talents = [];
      (character as any).prestige = playerPrestige;

      await character.save({ session });
      await session.commitTransaction();
      session.endSession();

      logger.info(`Character ${characterId} prestiged to rank ${nextRank.rank} (${nextRank.name})`);

      return { success: true, newRank: nextRank };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error(`Prestige failed for ${characterId}:`, error);
      throw error;
    }
  }

  /**
   * Apply prestige bonuses to a value
   */
  static applyPrestigeBonuses(
    baseValue: number,
    bonusType: 'xp_multiplier' | 'gold_multiplier',
    playerPrestige: PlayerPrestige
  ): number {
    let multiplier = 1.0;

    for (const bonus of playerPrestige.permanentBonuses) {
      if (bonus.type === bonusType) {
        multiplier *= bonus.value;
      }
    }

    return Math.floor(baseValue * multiplier);
  }
}

export default ProgressionService;
