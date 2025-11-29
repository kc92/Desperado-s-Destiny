/**
 * Legacy Milestone Definitions
 * Comprehensive set of 50+ milestones across all game systems
 */

import {
  LegacyMilestone,
  LegacyMilestoneCategory,
  LegacyBonusType,
} from '@desperados/shared';

export const LEGACY_MILESTONES: LegacyMilestone[] = [
  // ===== COMBAT MILESTONES (15) =====
  {
    id: 'combat_rookie',
    name: 'First Blood',
    description: 'Defeat your first 10 enemies',
    category: LegacyMilestoneCategory.COMBAT,
    requirement: 10,
    statKey: 'totalEnemiesDefeated',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.02,
        description: '+2% XP from combat',
        displayName: 'Combat XP Boost I',
      },
    ],
    icon: 'crossed-swords',
  },
  {
    id: 'combat_veteran',
    name: 'Seasoned Fighter',
    description: 'Defeat 100 enemies',
    category: LegacyMilestoneCategory.COMBAT,
    requirement: 100,
    statKey: 'totalEnemiesDefeated',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.05,
        description: '+5% XP from combat',
        displayName: 'Combat XP Boost II',
      },
      {
        type: LegacyBonusType.STARTING_ITEMS,
        value: ['iron_revolver'],
        description: 'Start with Iron Revolver',
        displayName: 'Veteran\'s Sidearm',
      },
    ],
    icon: 'medal',
  },
  {
    id: 'combat_master',
    name: 'Legendary Gunslinger',
    description: 'Defeat 1000 enemies',
    category: LegacyMilestoneCategory.COMBAT,
    requirement: 1000,
    statKey: 'totalEnemiesDefeated',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.1,
        description: '+10% XP from combat',
        displayName: 'Combat XP Boost III',
      },
      {
        type: LegacyBonusType.STARTING_ITEMS,
        value: ['steel_revolver', 'leather_duster'],
        description: 'Start with Steel Revolver and Leather Duster',
        displayName: 'Gunslinger\'s Kit',
      },
    ],
    icon: 'star-badge',
  },
  {
    id: 'boss_hunter',
    name: 'Boss Hunter',
    description: 'Defeat 10 boss enemies',
    category: LegacyMilestoneCategory.COMBAT,
    requirement: 10,
    statKey: 'totalBossesKilled',
    rewards: [
      {
        type: LegacyBonusType.STARTING_GOLD,
        value: 100,
        description: 'Start with +100 gold',
        displayName: 'Boss Bounty',
      },
    ],
    icon: 'skull',
  },
  {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    description: 'Defeat 50 boss enemies',
    category: LegacyMilestoneCategory.COMBAT,
    requirement: 50,
    statKey: 'totalBossesKilled',
    rewards: [
      {
        type: LegacyBonusType.STARTING_ITEMS,
        value: ['boss_hunter_trophy'],
        description: 'Cosmetic trophy item',
        displayName: 'Trophy Hunter',
      },
    ],
    icon: 'trophy',
  },
  {
    id: 'duel_initiate',
    name: 'Duelist',
    description: 'Win 10 duels',
    category: LegacyMilestoneCategory.COMBAT,
    requirement: 10,
    statKey: 'totalDuelsWon',
    rewards: [
      {
        type: LegacyBonusType.FAME_BONUS,
        value: 0.05,
        description: '+5% Fame from duels',
        displayName: 'Duel Fame Boost',
      },
    ],
    icon: 'duel-pistols',
  },
  {
    id: 'duel_master',
    name: 'Duel Master',
    description: 'Win 100 duels',
    category: LegacyMilestoneCategory.COMBAT,
    requirement: 100,
    statKey: 'totalDuelsWon',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'quick_duel_challenge',
        description: 'Unlock quick duel challenges',
        displayName: 'Quick Draw',
      },
    ],
    icon: 'lightning',
  },
  {
    id: 'damage_dealer',
    name: 'Heavy Hitter',
    description: 'Deal 10,000 total damage',
    category: LegacyMilestoneCategory.COMBAT,
    requirement: 10000,
    statKey: 'totalDamageDealt',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.03,
        description: '+3% all XP',
        displayName: 'Battle-Hardened',
      },
    ],
    icon: 'explosion',
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Take 10,000 total damage and survive',
    category: LegacyMilestoneCategory.COMBAT,
    requirement: 10000,
    statKey: 'totalDamageTaken',
    rewards: [
      {
        type: LegacyBonusType.STARTING_ITEMS,
        value: ['reinforced_vest'],
        description: 'Start with better armor',
        displayName: 'Survivor\'s Gear',
      },
    ],
    icon: 'shield',
  },
  {
    id: 'combat_legend',
    name: 'Legend of the West',
    description: 'Defeat 5000 enemies',
    category: LegacyMilestoneCategory.COMBAT,
    requirement: 5000,
    statKey: 'totalEnemiesDefeated',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_CLASS,
        value: 'legendary_gunslinger',
        description: 'Unlock Legendary Gunslinger class',
        displayName: 'Legendary Class',
      },
      {
        type: LegacyBonusType.COSMETIC,
        value: 'legendary_hat',
        description: 'Exclusive legendary hat',
        displayName: 'Legend\'s Hat',
      },
    ],
    icon: 'crown',
    hidden: true,
  },

  // ===== ECONOMIC MILESTONES (12) =====
  {
    id: 'first_fortune',
    name: 'First Fortune',
    description: 'Earn 1,000 gold total',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 1000,
    statKey: 'totalGoldEarned',
    rewards: [
      {
        type: LegacyBonusType.GOLD_MULTIPLIER,
        value: 0.02,
        description: '+2% gold earned',
        displayName: 'Prospector I',
      },
    ],
    icon: 'coin',
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    description: 'Earn 10,000 gold total',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 10000,
    statKey: 'totalGoldEarned',
    rewards: [
      {
        type: LegacyBonusType.GOLD_MULTIPLIER,
        value: 0.05,
        description: '+5% gold earned',
        displayName: 'Prospector II',
      },
      {
        type: LegacyBonusType.STARTING_GOLD,
        value: 250,
        description: 'Start with +250 gold',
        displayName: 'Starting Capital',
      },
    ],
    icon: 'money-bag',
  },
  {
    id: 'tycoon',
    name: 'Business Tycoon',
    description: 'Earn 100,000 gold total',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 100000,
    statKey: 'totalGoldEarned',
    rewards: [
      {
        type: LegacyBonusType.GOLD_MULTIPLIER,
        value: 0.1,
        description: '+10% gold earned',
        displayName: 'Prospector III',
      },
      {
        type: LegacyBonusType.STARTING_GOLD,
        value: 500,
        description: 'Start with +500 gold',
        displayName: 'Investor\'s Fund',
      },
    ],
    icon: 'bank',
  },
  {
    id: 'property_owner',
    name: 'Property Owner',
    description: 'Own 5 properties total',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 5,
    statKey: 'totalPropertiesOwned',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'property_discount',
        description: '5% discount on property purchases',
        displayName: 'Real Estate Expert',
      },
    ],
    icon: 'building',
  },
  {
    id: 'trade_novice',
    name: 'Merchant',
    description: 'Complete 50 trades',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 50,
    statKey: 'totalTradesCompleted',
    rewards: [
      {
        type: LegacyBonusType.GOLD_MULTIPLIER,
        value: 0.03,
        description: '+3% gold from trading',
        displayName: 'Trader\'s Luck',
      },
    ],
    icon: 'handshake',
  },
  {
    id: 'trade_master',
    name: 'Trade Master',
    description: 'Complete 500 trades',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 500,
    statKey: 'totalTradesCompleted',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'trade_network',
        description: 'Unlock trade network feature',
        displayName: 'Trade Network',
      },
    ],
    icon: 'network',
  },
  {
    id: 'craftsman',
    name: 'Craftsman',
    description: 'Craft 100 items',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 100,
    statKey: 'totalItemsCrafted',
    rewards: [
      {
        type: LegacyBonusType.STARTING_ITEMS,
        value: ['crafting_tools'],
        description: 'Start with basic crafting tools',
        displayName: 'Craftsman\'s Tools',
      },
    ],
    icon: 'hammer',
  },
  {
    id: 'master_craftsman',
    name: 'Master Craftsman',
    description: 'Craft 1000 items',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 1000,
    statKey: 'totalItemsCrafted',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'master_recipes',
        description: 'Unlock master crafting recipes',
        displayName: 'Master Recipes',
      },
    ],
    icon: 'book',
  },
  {
    id: 'shopper',
    name: 'Big Spender',
    description: 'Spend 10,000 gold total',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 10000,
    statKey: 'totalGoldSpent',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'vip_shop_access',
        description: 'Access to VIP shop items',
        displayName: 'VIP Status',
      },
    ],
    icon: 'star',
  },
  {
    id: 'item_buyer',
    name: 'Collector',
    description: 'Buy 200 items',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 200,
    statKey: 'totalItemsBought',
    rewards: [
      {
        type: LegacyBonusType.STARTING_ITEMS,
        value: ['starter_pack'],
        description: 'Start with item starter pack',
        displayName: 'Starter Collection',
      },
    ],
    icon: 'chest',
  },
  {
    id: 'item_seller',
    name: 'Salesman',
    description: 'Sell 200 items',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 200,
    statKey: 'totalItemsSold',
    rewards: [
      {
        type: LegacyBonusType.GOLD_MULTIPLIER,
        value: 0.05,
        description: '+5% gold from selling',
        displayName: 'Salesman\'s Touch',
      },
    ],
    icon: 'chart-up',
  },
  {
    id: 'economic_empire',
    name: 'Economic Empire',
    description: 'Earn 1,000,000 gold total',
    category: LegacyMilestoneCategory.ECONOMIC,
    requirement: 1000000,
    statKey: 'totalGoldEarned',
    rewards: [
      {
        type: LegacyBonusType.GOLD_MULTIPLIER,
        value: 0.15,
        description: '+15% gold earned',
        displayName: 'Golden Touch',
      },
      {
        type: LegacyBonusType.COSMETIC,
        value: 'golden_outfit',
        description: 'Exclusive golden outfit',
        displayName: 'Midas\' Threads',
      },
    ],
    icon: 'crown-gold',
    hidden: true,
  },

  // ===== SOCIAL MILESTONES (8) =====
  {
    id: 'gang_member',
    name: 'Gang Member',
    description: 'Reach Gang Rank 5',
    category: LegacyMilestoneCategory.SOCIAL,
    requirement: 5,
    statKey: 'highestGangRank',
    rewards: [
      {
        type: LegacyBonusType.FAME_BONUS,
        value: 0.05,
        description: '+5% Fame earned',
        displayName: 'Gang Reputation',
      },
    ],
    icon: 'people',
  },
  {
    id: 'gang_leader',
    name: 'Gang Leader',
    description: 'Reach Gang Rank 10',
    category: LegacyMilestoneCategory.SOCIAL,
    requirement: 10,
    statKey: 'highestGangRank',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'gang_leadership',
        description: 'Unlock gang leadership perks',
        displayName: 'Natural Leader',
      },
    ],
    icon: 'crown',
  },
  {
    id: 'socialite',
    name: 'Socialite',
    description: 'Make 25 friends',
    category: LegacyMilestoneCategory.SOCIAL,
    requirement: 25,
    statKey: 'totalFriendsMade',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'friend_bonus',
        description: '+5% XP when playing with friends',
        displayName: 'Camaraderie',
      },
    ],
    icon: 'heart',
  },
  {
    id: 'correspondent',
    name: 'Correspondent',
    description: 'Send 100 mail messages',
    category: LegacyMilestoneCategory.SOCIAL,
    requirement: 100,
    statKey: 'totalMailSent',
    rewards: [
      {
        type: LegacyBonusType.STARTING_GOLD,
        value: 50,
        description: 'Start with +50 gold',
        displayName: 'Network Connections',
      },
    ],
    icon: 'envelope',
  },
  {
    id: 'reputation_earned',
    name: 'Reputable',
    description: 'Earn 10,000 reputation total',
    category: LegacyMilestoneCategory.SOCIAL,
    requirement: 10000,
    statKey: 'totalReputationEarned',
    rewards: [
      {
        type: LegacyBonusType.STARTING_REPUTATION,
        value: 100,
        description: 'Start with +100 reputation',
        displayName: 'Known Name',
      },
    ],
    icon: 'medal',
  },
  {
    id: 'famous',
    name: 'Famous',
    description: 'Earn 50,000 reputation total',
    category: LegacyMilestoneCategory.SOCIAL,
    requirement: 50000,
    statKey: 'totalReputationEarned',
    rewards: [
      {
        type: LegacyBonusType.STARTING_REPUTATION,
        value: 500,
        description: 'Start with +500 reputation',
        displayName: 'Famous Lineage',
      },
      {
        type: LegacyBonusType.FAME_BONUS,
        value: 0.1,
        description: '+10% Fame earned',
        displayName: 'Celebrity Status',
      },
    ],
    icon: 'star-shine',
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Make 100 friends',
    category: LegacyMilestoneCategory.SOCIAL,
    requirement: 100,
    statKey: 'totalFriendsMade',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'friend_network',
        description: 'Unlock friend network bonuses',
        displayName: 'Friend Network',
      },
    ],
    icon: 'network-people',
  },
  {
    id: 'legendary_reputation',
    name: 'Legendary Reputation',
    description: 'Earn 200,000 reputation total',
    category: LegacyMilestoneCategory.SOCIAL,
    requirement: 200000,
    statKey: 'totalReputationEarned',
    rewards: [
      {
        type: LegacyBonusType.STARTING_REPUTATION,
        value: 1000,
        description: 'Start with +1000 reputation',
        displayName: 'Legacy Name',
      },
      {
        type: LegacyBonusType.COSMETIC,
        value: 'legendary_title',
        description: 'Exclusive legendary title',
        displayName: 'The Legendary',
      },
    ],
    icon: 'diamond',
    hidden: true,
  },

  // ===== EXPLORATION MILESTONES (6) =====
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Discover 10 locations',
    category: LegacyMilestoneCategory.EXPLORATION,
    requirement: 10,
    statKey: 'totalLocationsDiscovered',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.02,
        description: '+2% XP from exploration',
        displayName: 'Explorer\'s Instinct',
      },
    ],
    icon: 'map',
  },
  {
    id: 'cartographer',
    name: 'Cartographer',
    description: 'Discover 50 locations',
    category: LegacyMilestoneCategory.EXPLORATION,
    requirement: 50,
    statKey: 'totalLocationsDiscovered',
    rewards: [
      {
        type: LegacyBonusType.STARTING_ITEMS,
        value: ['detailed_map'],
        description: 'Start with detailed map',
        displayName: 'Master Map',
      },
    ],
    icon: 'compass',
  },
  {
    id: 'secret_finder',
    name: 'Secret Finder',
    description: 'Find 25 secrets',
    category: LegacyMilestoneCategory.EXPLORATION,
    requirement: 25,
    statKey: 'totalSecretsFound',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'secret_sense',
        description: 'Increased chance to find secrets',
        displayName: 'Secret Sense',
      },
    ],
    icon: 'eye',
  },
  {
    id: 'rare_witness',
    name: 'Rare Witness',
    description: 'Witness 10 rare events',
    category: LegacyMilestoneCategory.EXPLORATION,
    requirement: 10,
    statKey: 'totalRareEventsWitnessed',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.05,
        description: '+5% XP from events',
        displayName: 'Event Hunter',
      },
    ],
    icon: 'sparkle',
  },
  {
    id: 'territory_conqueror',
    name: 'Territory Conqueror',
    description: 'Control 10 territories total',
    category: LegacyMilestoneCategory.EXPLORATION,
    requirement: 10,
    statKey: 'totalTerritoriesControlled',
    rewards: [
      {
        type: LegacyBonusType.FAME_BONUS,
        value: 0.05,
        description: '+5% Fame from territories',
        displayName: 'Territorial',
      },
    ],
    icon: 'flag',
  },
  {
    id: 'master_explorer',
    name: 'Master Explorer',
    description: 'Discover 100 locations',
    category: LegacyMilestoneCategory.EXPLORATION,
    requirement: 100,
    statKey: 'totalLocationsDiscovered',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_CLASS,
        value: 'pathfinder',
        description: 'Unlock Pathfinder class',
        displayName: 'Pathfinder',
      },
      {
        type: LegacyBonusType.COSMETIC,
        value: 'explorer_outfit',
        description: 'Exclusive explorer outfit',
        displayName: 'Explorer\'s Garb',
      },
    ],
    icon: 'mountain',
    hidden: true,
  },

  // ===== QUEST MILESTONES (7) =====
  {
    id: 'quest_starter',
    name: 'Quest Starter',
    description: 'Complete 10 quests',
    category: LegacyMilestoneCategory.QUEST,
    requirement: 10,
    statKey: 'totalQuestsCompleted',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.02,
        description: '+2% XP from quests',
        displayName: 'Quest Seeker',
      },
    ],
    icon: 'scroll',
  },
  {
    id: 'quest_veteran',
    name: 'Quest Veteran',
    description: 'Complete 50 quests',
    category: LegacyMilestoneCategory.QUEST,
    requirement: 50,
    statKey: 'totalQuestsCompleted',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.05,
        description: '+5% XP from quests',
        displayName: 'Questmaster I',
      },
    ],
    icon: 'book-open',
  },
  {
    id: 'quest_master',
    name: 'Quest Master',
    description: 'Complete 200 quests',
    category: LegacyMilestoneCategory.QUEST,
    requirement: 200,
    statKey: 'totalQuestsCompleted',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.1,
        description: '+10% XP from quests',
        displayName: 'Questmaster II',
      },
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'epic_quests',
        description: 'Unlock epic quest line',
        displayName: 'Epic Quester',
      },
    ],
    icon: 'crown-quest',
  },
  {
    id: 'legendary_quester',
    name: 'Legendary Quester',
    description: 'Complete 5 legendary quests',
    category: LegacyMilestoneCategory.QUEST,
    requirement: 5,
    statKey: 'totalLegendaryQuestsCompleted',
    rewards: [
      {
        type: LegacyBonusType.STARTING_ITEMS,
        value: ['legendary_token'],
        description: 'Start with legendary quest token',
        displayName: 'Legendary Token',
      },
    ],
    icon: 'gem',
  },
  {
    id: 'story_seeker',
    name: 'Story Seeker',
    description: 'Complete 25 story quests',
    category: LegacyMilestoneCategory.QUEST,
    requirement: 25,
    statKey: 'totalStoryQuestsCompleted',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'story_insights',
        description: 'Unlock additional story choices',
        displayName: 'Story Master',
      },
    ],
    icon: 'book-story',
  },
  {
    id: 'side_quest_enthusiast',
    name: 'Side Quest Enthusiast',
    description: 'Complete 100 side quests',
    category: LegacyMilestoneCategory.QUEST,
    requirement: 100,
    statKey: 'totalSideQuestsCompleted',
    rewards: [
      {
        type: LegacyBonusType.GOLD_MULTIPLIER,
        value: 0.05,
        description: '+5% gold from quests',
        displayName: 'Quest Rewards',
      },
    ],
    icon: 'path',
  },
  {
    id: 'ultimate_quester',
    name: 'Ultimate Quester',
    description: 'Complete 500 quests total',
    category: LegacyMilestoneCategory.QUEST,
    requirement: 500,
    statKey: 'totalQuestsCompleted',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_CLASS,
        value: 'chronicle_keeper',
        description: 'Unlock Chronicle Keeper class',
        displayName: 'Chronicle Keeper',
      },
      {
        type: LegacyBonusType.COSMETIC,
        value: 'quest_master_cape',
        description: 'Exclusive quest master cape',
        displayName: 'Master\'s Cape',
      },
    ],
    icon: 'scroll-golden',
    hidden: true,
  },

  // ===== SKILL MILESTONES (5) =====
  {
    id: 'skill_learner',
    name: 'Skill Learner',
    description: 'Max out 3 skills',
    category: LegacyMilestoneCategory.SKILL,
    requirement: 3,
    statKey: 'totalSkillsMaxed',
    rewards: [
      {
        type: LegacyBonusType.STARTING_SKILLS,
        value: 5,
        description: 'Start with +5 skill points',
        displayName: 'Head Start',
      },
    ],
    icon: 'brain',
  },
  {
    id: 'skill_master',
    name: 'Skill Master',
    description: 'Max out 10 skills',
    category: LegacyMilestoneCategory.SKILL,
    requirement: 10,
    statKey: 'totalSkillsMaxed',
    rewards: [
      {
        type: LegacyBonusType.STARTING_SKILLS,
        value: 10,
        description: 'Start with +10 skill points',
        displayName: 'Expert Training',
      },
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.05,
        description: '+5% skill XP',
        displayName: 'Fast Learner',
      },
    ],
    icon: 'graduation-cap',
  },
  {
    id: 'profession_apprentice',
    name: 'Profession Apprentice',
    description: 'Master 2 professions',
    category: LegacyMilestoneCategory.SKILL,
    requirement: 2,
    statKey: 'totalProfessionsMastered',
    rewards: [
      {
        type: LegacyBonusType.STARTING_ITEMS,
        value: ['profession_kit'],
        description: 'Start with profession starter kit',
        displayName: 'Professional Kit',
      },
    ],
    icon: 'tools',
  },
  {
    id: 'profession_master',
    name: 'Master of Trades',
    description: 'Master 5 professions',
    category: LegacyMilestoneCategory.SKILL,
    requirement: 5,
    statKey: 'totalProfessionsMastered',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'master_professions',
        description: 'Unlock master profession abilities',
        displayName: 'Master Tradesman',
      },
    ],
    icon: 'master-tools',
  },
  {
    id: 'skill_points_earned',
    name: 'Dedicated Student',
    description: 'Earn 500 skill points total',
    category: LegacyMilestoneCategory.SKILL,
    requirement: 500,
    statKey: 'totalSkillPointsEarned',
    rewards: [
      {
        type: LegacyBonusType.STARTING_SKILLS,
        value: 20,
        description: 'Start with +20 skill points',
        displayName: 'Wisdom of Ages',
      },
    ],
    icon: 'scroll-skill',
  },

  // ===== TIME MILESTONES (5) =====
  {
    id: 'week_played',
    name: 'One Week In',
    description: 'Play for 7 days',
    category: LegacyMilestoneCategory.TIME,
    requirement: 7,
    statKey: 'totalDaysPlayed',
    rewards: [
      {
        type: LegacyBonusType.STARTING_GOLD,
        value: 100,
        description: 'Start with +100 gold',
        displayName: 'Loyalty Bonus I',
      },
    ],
    icon: 'calendar',
  },
  {
    id: 'month_played',
    name: 'One Month Strong',
    description: 'Play for 30 days',
    category: LegacyMilestoneCategory.TIME,
    requirement: 30,
    statKey: 'totalDaysPlayed',
    rewards: [
      {
        type: LegacyBonusType.STARTING_GOLD,
        value: 500,
        description: 'Start with +500 gold',
        displayName: 'Loyalty Bonus II',
      },
      {
        type: LegacyBonusType.ENERGY_BONUS,
        value: 0.05,
        description: '+5% max energy',
        displayName: 'Veteran Stamina',
      },
    ],
    icon: 'calendar-check',
  },
  {
    id: 'active_player',
    name: 'Active Player',
    description: 'Log in 100 times',
    category: LegacyMilestoneCategory.TIME,
    requirement: 100,
    statKey: 'totalLoginsCount',
    rewards: [
      {
        type: LegacyBonusType.ENERGY_BONUS,
        value: 0.1,
        description: '+10% max energy',
        displayName: 'Increased Stamina',
      },
    ],
    icon: 'door-enter',
  },
  {
    id: 'seasonal_participant',
    name: 'Seasonal Veteran',
    description: 'Participate in 5 seasonal events',
    category: LegacyMilestoneCategory.TIME,
    requirement: 5,
    statKey: 'totalSeasonalEventsParticipated',
    rewards: [
      {
        type: LegacyBonusType.COSMETIC,
        value: 'seasonal_badge',
        description: 'Exclusive seasonal badge',
        displayName: 'Season Veteran',
      },
    ],
    icon: 'snowflake',
  },
  {
    id: 'year_played',
    name: 'Year of the Gun',
    description: 'Play for 365 days',
    category: LegacyMilestoneCategory.TIME,
    requirement: 365,
    statKey: 'totalDaysPlayed',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.1,
        description: '+10% all XP',
        displayName: 'Veteran\'s Wisdom',
      },
      {
        type: LegacyBonusType.COSMETIC,
        value: 'anniversary_outfit',
        description: 'Exclusive anniversary outfit',
        displayName: 'Old Timer',
      },
    ],
    icon: 'birthday-cake',
    hidden: true,
  },

  // ===== SPECIAL MILESTONES (6) =====
  {
    id: 'achievement_hunter',
    name: 'Achievement Hunter',
    description: 'Unlock 50 achievements',
    category: LegacyMilestoneCategory.SPECIAL,
    requirement: 50,
    statKey: 'totalAchievementsUnlocked',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.05,
        description: '+5% all XP',
        displayName: 'Overachiever',
      },
    ],
    icon: 'trophy-star',
  },
  {
    id: 'achievement_completionist',
    name: 'Completionist',
    description: 'Unlock 200 achievements',
    category: LegacyMilestoneCategory.SPECIAL,
    requirement: 200,
    statKey: 'totalAchievementsUnlocked',
    rewards: [
      {
        type: LegacyBonusType.COSMETIC,
        value: 'completionist_title',
        description: 'Exclusive completionist title',
        displayName: 'The Complete',
      },
    ],
    icon: 'star-full',
  },
  {
    id: 'character_creator',
    name: 'Character Creator',
    description: 'Create 5 characters',
    category: LegacyMilestoneCategory.SPECIAL,
    requirement: 5,
    statKey: 'totalCharactersCreated',
    rewards: [
      {
        type: LegacyBonusType.UNLOCK_FEATURE,
        value: 'character_slots',
        description: 'Unlock additional character slots',
        displayName: 'Extra Slots',
      },
    ],
    icon: 'person-plus',
  },
  {
    id: 'character_veteran',
    name: 'Veteran of Many Lives',
    description: 'Create 10 characters',
    category: LegacyMilestoneCategory.SPECIAL,
    requirement: 10,
    statKey: 'totalCharactersCreated',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.15,
        description: '+15% all XP',
        displayName: 'Reincarnation Master',
      },
    ],
    icon: 'infinity',
  },
  {
    id: 'high_level',
    name: 'High Roller',
    description: 'Reach level 50',
    category: LegacyMilestoneCategory.SPECIAL,
    requirement: 50,
    statKey: 'highestLevelReached',
    rewards: [
      {
        type: LegacyBonusType.XP_MULTIPLIER,
        value: 0.1,
        description: '+10% XP',
        displayName: 'Experienced',
      },
    ],
    icon: 'level-up',
  },
  {
    id: 'max_fame',
    name: 'Maximum Fame',
    description: 'Reach 10,000 fame',
    category: LegacyMilestoneCategory.SPECIAL,
    requirement: 10000,
    statKey: 'highestFameReached',
    rewards: [
      {
        type: LegacyBonusType.FAME_BONUS,
        value: 0.1,
        description: '+10% Fame',
        displayName: 'Famous Lineage',
      },
      {
        type: LegacyBonusType.STARTING_REPUTATION,
        value: 500,
        description: 'Start with +500 reputation',
        displayName: 'Born Famous',
      },
    ],
    icon: 'crown-fame',
  },
];

/**
 * Get milestone by ID
 */
export function getMilestoneById(id: string): LegacyMilestone | undefined {
  return LEGACY_MILESTONES.find((m) => m.id === id);
}

/**
 * Get milestones by category
 */
export function getMilestonesByCategory(
  category: LegacyMilestoneCategory
): LegacyMilestone[] {
  return LEGACY_MILESTONES.filter((m) => m.category === category);
}

/**
 * Get all visible milestones
 */
export function getVisibleMilestones(): LegacyMilestone[] {
  return LEGACY_MILESTONES.filter((m) => !m.hidden);
}

/**
 * Get all hidden milestones
 */
export function getHiddenMilestones(): LegacyMilestone[] {
  return LEGACY_MILESTONES.filter((m) => m.hidden === true);
}
