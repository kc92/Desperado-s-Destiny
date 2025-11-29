/**
 * Prestige Permanent Unlocks
 * Exclusive features that show off accomplishments
 */

import {
  PermanentUnlock,
  UnlockCategory,
  UnlockRequirementType
} from '@desperados/shared';

export const prestigeUnlocks: PermanentUnlock[] = [
  // FACTION ACCESS
  {
    id: 'faction_shadow_council',
    name: 'Shadow Council Access',
    description: 'Gain access to the secretive Shadow Council faction',
    category: UnlockCategory.PRESTIGE,
    icon: 'faction_shadow',
    rarity: 'legendary',
    order: 3000,
    hidden: true,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'master_of_shadows'
    },
    effects: {
      factionAccess: ['shadow_council']
    }
  },
  {
    id: 'faction_golden_circle',
    name: 'Golden Circle Access',
    description: 'Join the elite Golden Circle of wealthy tycoons',
    category: UnlockCategory.PRESTIGE,
    icon: 'faction_golden',
    rarity: 'legendary',
    order: 3001,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 1000000
    },
    effects: {
      factionAccess: ['golden_circle']
    }
  },
  {
    id: 'faction_iron_marshals',
    name: 'Iron Marshals Access',
    description: 'Become one of the legendary Iron Marshals',
    category: UnlockCategory.PRESTIGE,
    icon: 'faction_marshal',
    rarity: 'legendary',
    order: 3002,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'legendary_lawman'
    },
    effects: {
      factionAccess: ['iron_marshals']
    }
  },

  // VIP AREAS
  {
    id: 'vip_high_stakes_room',
    name: 'High Stakes Room',
    description: 'Access exclusive high-roller gambling rooms',
    category: UnlockCategory.PRESTIGE,
    icon: 'vip_gambling',
    rarity: 'epic',
    order: 3100,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 100000
    },
    effects: {
      vipAreas: ['high_stakes_rooms']
    }
  },
  {
    id: 'vip_governors_mansion',
    name: 'Governor\'s Mansion',
    description: 'Gain entrance to the Governor\'s private estate',
    category: UnlockCategory.PRESTIGE,
    icon: 'vip_mansion',
    rarity: 'epic',
    order: 3101,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'political_influence'
    },
    effects: {
      vipAreas: ['governors_mansion']
    }
  },
  {
    id: 'vip_secret_speakeasy',
    name: 'Secret Speakeasy',
    description: 'Discover the password to hidden underground bars',
    category: UnlockCategory.PRESTIGE,
    icon: 'vip_speakeasy',
    rarity: 'rare',
    order: 3102,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'underworld_connections'
    },
    effects: {
      vipAreas: ['secret_speakeasies']
    }
  },
  {
    id: 'vip_ghost_canyon',
    name: 'Ghost Canyon',
    description: 'Access to the mystical Ghost Canyon',
    category: UnlockCategory.PRESTIGE,
    icon: 'vip_ghost',
    rarity: 'legendary',
    order: 3103,
    hidden: true,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'spiritual_journey'
    },
    effects: {
      vipAreas: ['ghost_canyon']
    }
  },

  // SPECIAL NPC DIALOGUES
  {
    id: 'npc_legendary_gunslinger',
    name: 'Legendary Gunslinger Dialogues',
    description: 'Unlock special conversations with legendary gunslingers',
    category: UnlockCategory.PRESTIGE,
    icon: 'npc_gunslinger',
    rarity: 'epic',
    order: 3200,
    requirements: {
      type: UnlockRequirementType.DUELS_WON,
      minValue: 250
    },
    effects: {
      npcDialogues: ['legendary_gunslingers']
    }
  },
  {
    id: 'npc_native_elders',
    name: 'Native Elder Dialogues',
    description: 'Earn the trust to speak with native elders',
    category: UnlockCategory.PRESTIGE,
    icon: 'npc_elder',
    rarity: 'epic',
    order: 3201,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'native_honor'
    },
    effects: {
      npcDialogues: ['native_elders']
    }
  },
  {
    id: 'npc_ghost_npcs',
    name: 'Spectral Dialogues',
    description: 'Communicate with the spirits of the dead',
    category: UnlockCategory.PRESTIGE,
    icon: 'npc_ghost',
    rarity: 'legendary',
    order: 3202,
    hidden: true,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'see_beyond_veil'
    },
    effects: {
      npcDialogues: ['ghost_npcs']
    }
  },

  // LEGACY TITLES
  {
    id: 'title_first_pioneer',
    name: 'First Pioneer',
    description: 'One of the first to explore the frontier',
    category: UnlockCategory.PRESTIGE,
    icon: 'title_pioneer',
    rarity: 'legendary',
    order: 3300,
    exclusive: true,
    requirements: {
      type: UnlockRequirementType.EVENT,
      eventId: 'launch_week'
    },
    effects: {
      titles: ['First Pioneer'],
      hallOfFameEntry: true
    }
  },
  {
    id: 'title_founding_outlaw',
    name: 'Founding Outlaw',
    description: 'Among the first to walk the path of the outlaw',
    category: UnlockCategory.PRESTIGE,
    icon: 'title_founding',
    rarity: 'legendary',
    order: 3301,
    exclusive: true,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'early_adopter_criminal'
    },
    effects: {
      titles: ['Founding Outlaw'],
      hallOfFameEntry: true
    }
  },
  {
    id: 'title_apex_predator',
    name: 'Apex Predator',
    description: 'Reached the pinnacle of the duel rankings',
    category: UnlockCategory.PRESTIGE,
    icon: 'title_apex',
    rarity: 'legendary',
    order: 3302,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'rank_1_duelist'
    },
    effects: {
      titles: ['Apex Predator'],
      hallOfFameEntry: true
    }
  },
  {
    id: 'title_gold_emperor',
    name: 'Gold Emperor',
    description: 'Amassed a fortune beyond imagination',
    category: UnlockCategory.PRESTIGE,
    icon: 'title_emperor',
    rarity: 'legendary',
    order: 3303,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 10000000
    },
    effects: {
      titles: ['Gold Emperor'],
      hallOfFameEntry: true
    }
  },
  {
    id: 'title_eternal_legend',
    name: 'Eternal Legend',
    description: 'Your legacy transcends time itself',
    category: UnlockCategory.PRESTIGE,
    icon: 'title_eternal',
    rarity: 'legendary',
    order: 3304,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 20
    },
    effects: {
      titles: ['Eternal Legend'],
      hallOfFameEntry: true
    }
  },

  // HALL OF FAME
  {
    id: 'hall_of_fame_bronze',
    name: 'Hall of Fame - Bronze',
    description: 'Earn a bronze plaque in the Hall of Fame',
    category: UnlockCategory.PRESTIGE,
    icon: 'hof_bronze',
    rarity: 'rare',
    order: 3400,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 5
    },
    effects: {
      hallOfFameEntry: true
    }
  },
  {
    id: 'hall_of_fame_silver',
    name: 'Hall of Fame - Silver',
    description: 'Earn a silver plaque in the Hall of Fame',
    category: UnlockCategory.PRESTIGE,
    icon: 'hof_silver',
    rarity: 'epic',
    order: 3401,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 10
    },
    effects: {
      hallOfFameEntry: true
    }
  },
  {
    id: 'hall_of_fame_gold',
    name: 'Hall of Fame - Gold',
    description: 'Earn a golden plaque in the Hall of Fame',
    category: UnlockCategory.PRESTIGE,
    icon: 'hof_gold',
    rarity: 'legendary',
    order: 3402,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 15
    },
    effects: {
      hallOfFameEntry: true
    }
  }
];
