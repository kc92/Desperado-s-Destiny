/**
 * Gameplay Permanent Unlocks
 * Features that affect how you play the game
 */

import {
  PermanentUnlock,
  UnlockCategory,
  UnlockRequirementType
} from '@desperados/shared';

export const gameplayUnlocks: PermanentUnlock[] = [
  // CHARACTER SLOTS
  {
    id: 'character_slot_3',
    name: 'Third Character Slot',
    description: 'Unlock a third character slot (total: 3)',
    category: UnlockCategory.GAMEPLAY,
    icon: 'slot_3',
    rarity: 'uncommon',
    order: 1000,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 2
    },
    effects: {
      extraCharacterSlots: 1
    }
  },
  {
    id: 'character_slot_4',
    name: 'Fourth Character Slot',
    description: 'Unlock a fourth character slot (total: 4)',
    category: UnlockCategory.GAMEPLAY,
    icon: 'slot_4',
    rarity: 'rare',
    order: 1001,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 5
    },
    effects: {
      extraCharacterSlots: 1
    }
  },
  {
    id: 'character_slot_5',
    name: 'Fifth Character Slot',
    description: 'Unlock the maximum fifth character slot (total: 5)',
    category: UnlockCategory.GAMEPLAY,
    icon: 'slot_5',
    rarity: 'epic',
    order: 1002,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 10
    },
    effects: {
      extraCharacterSlots: 1
    }
  },

  // STARTING LOCATIONS
  {
    id: 'start_ghost_town',
    name: 'Ghost Town Start',
    description: 'Begin your journey in the mysterious Ghost Town',
    category: UnlockCategory.GAMEPLAY,
    icon: 'location_ghost',
    rarity: 'rare',
    order: 1100,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'explore_ghost_town'
    },
    effects: {
      unlockedStartingLocations: ['ghost_town']
    }
  },
  {
    id: 'start_native_village',
    name: 'Native Village Start',
    description: 'Begin among the indigenous peoples',
    category: UnlockCategory.GAMEPLAY,
    icon: 'location_native',
    rarity: 'rare',
    order: 1101,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'native_alliance'
    },
    effects: {
      unlockedStartingLocations: ['native_village']
    }
  },
  {
    id: 'start_mountain_hideout',
    name: 'Mountain Hideout Start',
    description: 'Begin in a secluded mountain hideout',
    category: UnlockCategory.GAMEPLAY,
    icon: 'location_mountain',
    rarity: 'epic',
    order: 1102,
    requirements: {
      type: UnlockRequirementType.CRIMES_COMMITTED,
      minValue: 500
    },
    effects: {
      unlockedStartingLocations: ['mountain_hideout']
    }
  },
  {
    id: 'start_fort',
    name: 'Military Fort Start',
    description: 'Begin at the heavily guarded military fort',
    category: UnlockCategory.GAMEPLAY,
    icon: 'location_fort',
    rarity: 'epic',
    order: 1103,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'military_rank'
    },
    effects: {
      unlockedStartingLocations: ['military_fort']
    }
  },

  // STARTING BONUSES
  {
    id: 'start_bonus_gold_small',
    name: 'Prospector\'s Cache',
    description: 'Start new characters with +100 gold',
    category: UnlockCategory.GAMEPLAY,
    icon: 'bonus_gold_1',
    rarity: 'uncommon',
    order: 1200,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 25000
    },
    effects: {
      startingGold: 100
    }
  },
  {
    id: 'start_bonus_gold_medium',
    name: 'Banker\'s Fortune',
    description: 'Start new characters with +250 gold',
    category: UnlockCategory.GAMEPLAY,
    icon: 'bonus_gold_2',
    rarity: 'rare',
    order: 1201,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 100000
    },
    effects: {
      startingGold: 250
    }
  },
  {
    id: 'start_bonus_gold_large',
    name: 'Tycoon\'s Inheritance',
    description: 'Start new characters with +500 gold',
    category: UnlockCategory.GAMEPLAY,
    icon: 'bonus_gold_3',
    rarity: 'epic',
    order: 1202,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 500000
    },
    effects: {
      startingGold: 500
    }
  },
  {
    id: 'start_bonus_strength',
    name: 'Born Strong',
    description: 'Start new characters with +2 Strength',
    category: UnlockCategory.GAMEPLAY,
    icon: 'bonus_str',
    rarity: 'rare',
    order: 1203,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'strength_master'
    },
    effects: {
      startingStats: {
        strength: 2
      }
    }
  },
  {
    id: 'start_bonus_speed',
    name: 'Born Fast',
    description: 'Start new characters with +2 Speed',
    category: UnlockCategory.GAMEPLAY,
    icon: 'bonus_spd',
    rarity: 'rare',
    order: 1204,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'speed_master'
    },
    effects: {
      startingStats: {
        speed: 2
      }
    }
  },
  {
    id: 'start_bonus_cunning',
    name: 'Born Clever',
    description: 'Start new characters with +2 Cunning',
    category: UnlockCategory.GAMEPLAY,
    icon: 'bonus_cun',
    rarity: 'rare',
    order: 1205,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'cunning_master'
    },
    effects: {
      startingStats: {
        cunning: 2
      }
    }
  },
  {
    id: 'start_bonus_charisma',
    name: 'Born Charming',
    description: 'Start new characters with +2 Charisma',
    category: UnlockCategory.GAMEPLAY,
    icon: 'bonus_cha',
    rarity: 'rare',
    order: 1206,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'charisma_master'
    },
    effects: {
      startingStats: {
        charisma: 2
      }
    }
  },

  // SPECIAL ABILITIES
  {
    id: 'ability_lucky_draw',
    name: 'Lucky Draw',
    description: '+5% chance for favorable Destiny Deck outcomes',
    category: UnlockCategory.GAMEPLAY,
    icon: 'ability_luck',
    rarity: 'epic',
    order: 1300,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'destiny_master'
    },
    effects: {
      abilities: ['lucky_draw']
    }
  },
  {
    id: 'ability_quick_recovery',
    name: 'Quick Recovery',
    description: 'Reduce jail time by 10%',
    category: UnlockCategory.GAMEPLAY,
    icon: 'ability_recovery',
    rarity: 'rare',
    order: 1301,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'escape_artist'
    },
    effects: {
      abilities: ['quick_recovery']
    }
  },
  {
    id: 'ability_silver_tongue',
    name: 'Silver Tongue',
    description: '+10% better prices when trading',
    category: UnlockCategory.GAMEPLAY,
    icon: 'ability_trade',
    rarity: 'rare',
    order: 1302,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'master_trader'
    },
    effects: {
      abilities: ['silver_tongue']
    }
  },
  {
    id: 'ability_eagle_eye',
    name: 'Eagle Eye',
    description: '+10% chance to find rare items',
    category: UnlockCategory.GAMEPLAY,
    icon: 'ability_vision',
    rarity: 'epic',
    order: 1303,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'treasure_hunter'
    },
    effects: {
      abilities: ['eagle_eye']
    }
  },
  {
    id: 'ability_iron_will',
    name: 'Iron Will',
    description: 'Resist negative status effects 15% longer',
    category: UnlockCategory.GAMEPLAY,
    icon: 'ability_resist',
    rarity: 'epic',
    order: 1304,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 8
    },
    effects: {
      abilities: ['iron_will']
    }
  },

  // HORSE BREEDS
  {
    id: 'horse_mustang',
    name: 'Wild Mustang',
    description: 'Unlock the wild mustang horse breed',
    category: UnlockCategory.GAMEPLAY,
    icon: 'horse_mustang',
    rarity: 'uncommon',
    order: 1400,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'horse_tamer'
    },
    effects: {
      horseBreeds: ['mustang']
    }
  },
  {
    id: 'horse_appaloosa',
    name: 'Appaloosa',
    description: 'Unlock the spotted appaloosa breed',
    category: UnlockCategory.GAMEPLAY,
    icon: 'horse_appaloosa',
    rarity: 'rare',
    order: 1401,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'native_trust'
    },
    effects: {
      horseBreeds: ['appaloosa']
    }
  },
  {
    id: 'horse_arabian',
    name: 'Arabian Stallion',
    description: 'Unlock the swift Arabian breed',
    category: UnlockCategory.GAMEPLAY,
    icon: 'horse_arabian',
    rarity: 'epic',
    order: 1402,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 250000
    },
    effects: {
      horseBreeds: ['arabian']
    }
  },
  {
    id: 'horse_midnight',
    name: 'Midnight Phantom',
    description: 'Unlock the legendary black stallion',
    category: UnlockCategory.GAMEPLAY,
    icon: 'horse_phantom',
    rarity: 'legendary',
    order: 1403,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'legendary_rider'
    },
    effects: {
      horseBreeds: ['midnight_phantom']
    }
  },

  // COMPANION TYPES
  {
    id: 'companion_coyote',
    name: 'Coyote Companion',
    description: 'Befriend a clever coyote',
    category: UnlockCategory.GAMEPLAY,
    icon: 'companion_coyote',
    rarity: 'rare',
    order: 1500,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'beast_whisperer'
    },
    effects: {
      companionTypes: ['coyote']
    }
  },
  {
    id: 'companion_hawk',
    name: 'Hawk Companion',
    description: 'Bond with a sharp-eyed hawk',
    category: UnlockCategory.GAMEPLAY,
    icon: 'companion_hawk',
    rarity: 'rare',
    order: 1501,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'sky_watcher'
    },
    effects: {
      companionTypes: ['hawk']
    }
  },
  {
    id: 'companion_wolf',
    name: 'Wolf Companion',
    description: 'Earn the loyalty of a lone wolf',
    category: UnlockCategory.GAMEPLAY,
    icon: 'companion_wolf',
    rarity: 'epic',
    order: 1502,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 7
    },
    effects: {
      companionTypes: ['wolf']
    }
  },
  {
    id: 'companion_spirit_animal',
    name: 'Spirit Animal',
    description: 'Summon a mystical spirit companion',
    category: UnlockCategory.GAMEPLAY,
    icon: 'companion_spirit',
    rarity: 'legendary',
    order: 1503,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'spiritual_awakening'
    },
    effects: {
      companionTypes: ['spirit_animal']
    }
  }
];
