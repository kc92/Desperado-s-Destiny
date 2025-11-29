/**
 * Cosmetic Permanent Unlocks
 * Visual customization options that don't affect gameplay
 */

import {
  PermanentUnlock,
  UnlockCategory,
  UnlockRequirementType
} from '@desperados/shared';

export const cosmeticUnlocks: PermanentUnlock[] = [
  // PORTRAIT FRAMES
  {
    id: 'portrait_frame_bronze',
    name: 'Bronze Portrait Frame',
    description: 'A simple bronze frame for your character portrait',
    category: UnlockCategory.COSMETIC,
    icon: 'frame_bronze',
    rarity: 'common',
    order: 100,
    requirements: {
      type: UnlockRequirementType.CHARACTER_LEVEL,
      minValue: 5
    },
    effects: {
      portraitFrames: ['bronze']
    }
  },
  {
    id: 'portrait_frame_silver',
    name: 'Silver Portrait Frame',
    description: 'A polished silver frame showing your experience',
    category: UnlockCategory.COSMETIC,
    icon: 'frame_silver',
    rarity: 'uncommon',
    order: 101,
    requirements: {
      type: UnlockRequirementType.CHARACTER_LEVEL,
      minValue: 15
    },
    effects: {
      portraitFrames: ['silver']
    }
  },
  {
    id: 'portrait_frame_gold',
    name: 'Gold Portrait Frame',
    description: 'A luxurious gold frame for seasoned outlaws',
    category: UnlockCategory.COSMETIC,
    icon: 'frame_gold',
    rarity: 'rare',
    order: 102,
    requirements: {
      type: UnlockRequirementType.CHARACTER_LEVEL,
      minValue: 30
    },
    effects: {
      portraitFrames: ['gold']
    }
  },
  {
    id: 'portrait_frame_wanted',
    name: 'Wanted Poster Frame',
    description: 'Your portrait appears on a weathered wanted poster',
    category: UnlockCategory.COSMETIC,
    icon: 'frame_wanted',
    rarity: 'epic',
    order: 103,
    requirements: {
      type: UnlockRequirementType.CRIMES_COMMITTED,
      minValue: 100
    },
    effects: {
      portraitFrames: ['wanted_poster']
    }
  },
  {
    id: 'portrait_frame_sheriff',
    name: 'Sheriff Badge Frame',
    description: 'A prestigious frame adorned with a sheriff\'s star',
    category: UnlockCategory.COSMETIC,
    icon: 'frame_sheriff',
    rarity: 'epic',
    order: 104,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'lawman_legend'
    },
    effects: {
      portraitFrames: ['sheriff_badge']
    }
  },
  {
    id: 'portrait_frame_legendary',
    name: 'Legendary Frame',
    description: 'An ornate frame that marks you as a legend of the West',
    category: UnlockCategory.COSMETIC,
    icon: 'frame_legendary',
    rarity: 'legendary',
    order: 105,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 10
    },
    effects: {
      portraitFrames: ['legendary']
    }
  },

  // NAME COLORS
  {
    id: 'nameplate_desert_orange',
    name: 'Desert Orange Name',
    description: 'Display your name in warm desert orange',
    category: UnlockCategory.COSMETIC,
    icon: 'color_orange',
    rarity: 'common',
    order: 200,
    requirements: {
      type: UnlockRequirementType.TIME_PLAYED,
      minValue: 86400 // 1 day in seconds
    },
    effects: {
      nameplateColors: ['#D97706']
    }
  },
  {
    id: 'nameplate_cactus_green',
    name: 'Cactus Green Name',
    description: 'Display your name in sharp cactus green',
    category: UnlockCategory.COSMETIC,
    icon: 'color_green',
    rarity: 'common',
    order: 201,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 5000
    },
    effects: {
      nameplateColors: ['#10B981']
    }
  },
  {
    id: 'nameplate_blood_red',
    name: 'Blood Red Name',
    description: 'Display your name in menacing blood red',
    category: UnlockCategory.COSMETIC,
    icon: 'color_red',
    rarity: 'uncommon',
    order: 202,
    requirements: {
      type: UnlockRequirementType.DUELS_WON,
      minValue: 25
    },
    effects: {
      nameplateColors: ['#DC2626']
    }
  },
  {
    id: 'nameplate_midnight_black',
    name: 'Midnight Black Name',
    description: 'Display your name in mysterious midnight black',
    category: UnlockCategory.COSMETIC,
    icon: 'color_black',
    rarity: 'rare',
    order: 203,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'shadow_master'
    },
    effects: {
      nameplateColors: ['#111827']
    }
  },
  {
    id: 'nameplate_gold_rush',
    name: 'Gold Rush Name',
    description: 'Display your name in shimmering gold',
    category: UnlockCategory.COSMETIC,
    icon: 'color_gold',
    rarity: 'epic',
    order: 204,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 50000
    },
    effects: {
      nameplateColors: ['#F59E0B']
    }
  },
  {
    id: 'nameplate_rainbow',
    name: 'Rainbow Name',
    description: 'Display your name with a mesmerizing rainbow gradient',
    category: UnlockCategory.COSMETIC,
    icon: 'color_rainbow',
    rarity: 'legendary',
    order: 205,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'complete_all_achievements'
    },
    effects: {
      nameplateColors: ['rainbow_gradient']
    }
  },

  // TITLES
  {
    id: 'title_greenhorn',
    name: 'Greenhorn',
    description: 'Everyone starts somewhere',
    category: UnlockCategory.COSMETIC,
    icon: 'title_greenhorn',
    rarity: 'common',
    order: 300,
    requirements: {
      type: UnlockRequirementType.CHARACTER_LEVEL,
      minValue: 1
    },
    effects: {
      titles: ['Greenhorn']
    }
  },
  {
    id: 'title_gunslinger',
    name: 'Gunslinger',
    description: 'Quick on the draw',
    category: UnlockCategory.COSMETIC,
    icon: 'title_gunslinger',
    rarity: 'uncommon',
    order: 301,
    requirements: {
      type: UnlockRequirementType.DUELS_WON,
      minValue: 10
    },
    effects: {
      titles: ['Gunslinger']
    }
  },
  {
    id: 'title_outlaw',
    name: 'Outlaw',
    description: 'Wanted in three territories',
    category: UnlockCategory.COSMETIC,
    icon: 'title_outlaw',
    rarity: 'rare',
    order: 302,
    requirements: {
      type: UnlockRequirementType.CRIMES_COMMITTED,
      minValue: 50
    },
    effects: {
      titles: ['Outlaw']
    }
  },
  {
    id: 'title_legend',
    name: 'Legend of the West',
    description: 'Your name is known far and wide',
    category: UnlockCategory.COSMETIC,
    icon: 'title_legend',
    rarity: 'epic',
    order: 303,
    requirements: {
      type: UnlockRequirementType.CHARACTER_LEVEL,
      minValue: 50
    },
    effects: {
      titles: ['Legend of the West']
    }
  },
  {
    id: 'title_immortal',
    name: 'The Immortal',
    description: 'Death cannot claim you',
    category: UnlockCategory.COSMETIC,
    icon: 'title_immortal',
    rarity: 'legendary',
    order: 304,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 15
    },
    effects: {
      titles: ['The Immortal']
    }
  },

  // CHAT BADGES
  {
    id: 'badge_founder',
    name: 'Founder Badge',
    description: 'You were here from the beginning',
    category: UnlockCategory.COSMETIC,
    icon: 'badge_founder',
    rarity: 'legendary',
    order: 400,
    exclusive: true,
    requirements: {
      type: UnlockRequirementType.EVENT,
      eventId: 'founding_period'
    },
    effects: {
      chatBadges: ['founder']
    }
  },
  {
    id: 'badge_veteran',
    name: 'Veteran Badge',
    description: 'A seasoned player of the frontier',
    category: UnlockCategory.COSMETIC,
    icon: 'badge_veteran',
    rarity: 'epic',
    order: 401,
    requirements: {
      type: UnlockRequirementType.TIME_PLAYED,
      minValue: 2592000 // 30 days
    },
    effects: {
      chatBadges: ['veteran']
    }
  },
  {
    id: 'badge_gang_leader',
    name: 'Gang Leader Badge',
    description: 'Shows you lead a gang',
    category: UnlockCategory.COSMETIC,
    icon: 'badge_gang_leader',
    rarity: 'rare',
    order: 402,
    requirements: {
      type: UnlockRequirementType.GANG_RANK,
      minValue: 5 // Leader rank
    },
    effects: {
      chatBadges: ['gang_leader']
    }
  },
  {
    id: 'badge_duelist',
    name: 'Master Duelist Badge',
    description: 'Undefeated in the art of the duel',
    category: UnlockCategory.COSMETIC,
    icon: 'badge_duelist',
    rarity: 'epic',
    order: 403,
    requirements: {
      type: UnlockRequirementType.DUELS_WON,
      minValue: 100
    },
    effects: {
      chatBadges: ['duelist']
    }
  },

  // PROFILE BACKGROUNDS
  {
    id: 'bg_desert_sunset',
    name: 'Desert Sunset Background',
    description: 'A beautiful desert sunset for your profile',
    category: UnlockCategory.COSMETIC,
    icon: 'bg_sunset',
    rarity: 'common',
    order: 500,
    requirements: {
      type: UnlockRequirementType.CHARACTER_LEVEL,
      minValue: 10
    },
    effects: {
      profileBackgrounds: ['desert_sunset']
    }
  },
  {
    id: 'bg_saloon',
    name: 'Saloon Background',
    description: 'The interior of a dusty saloon',
    category: UnlockCategory.COSMETIC,
    icon: 'bg_saloon',
    rarity: 'uncommon',
    order: 501,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 10000
    },
    effects: {
      profileBackgrounds: ['saloon_interior']
    }
  },
  {
    id: 'bg_wanted_office',
    name: 'Sheriff Office Background',
    description: 'The sheriff\'s office wall covered in wanted posters',
    category: UnlockCategory.COSMETIC,
    icon: 'bg_sheriff',
    rarity: 'rare',
    order: 502,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'lawman_badge'
    },
    effects: {
      profileBackgrounds: ['sheriff_office']
    }
  },
  {
    id: 'bg_hideout',
    name: 'Outlaw Hideout Background',
    description: 'A secret cave hideout in the mountains',
    category: UnlockCategory.COSMETIC,
    icon: 'bg_hideout',
    rarity: 'epic',
    order: 503,
    requirements: {
      type: UnlockRequirementType.CRIMES_COMMITTED,
      minValue: 200
    },
    effects: {
      profileBackgrounds: ['outlaw_hideout']
    }
  },

  // DEATH ANIMATIONS
  {
    id: 'death_standard',
    name: 'Standard Death',
    description: 'The classic fall to the ground',
    category: UnlockCategory.COSMETIC,
    icon: 'death_standard',
    rarity: 'common',
    order: 600,
    requirements: {
      type: UnlockRequirementType.CHARACTER_LEVEL,
      minValue: 1
    },
    effects: {
      deathAnimations: ['standard_fall']
    }
  },
  {
    id: 'death_dramatic',
    name: 'Dramatic Death',
    description: 'A slow-motion dramatic fall',
    category: UnlockCategory.COSMETIC,
    icon: 'death_dramatic',
    rarity: 'uncommon',
    order: 601,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 3
    },
    effects: {
      deathAnimations: ['dramatic_fall']
    }
  },
  {
    id: 'death_ghost',
    name: 'Ghost Rising',
    description: 'Your spirit rises as a ghost',
    category: UnlockCategory.COSMETIC,
    icon: 'death_ghost',
    rarity: 'epic',
    order: 602,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'die_100_times'
    },
    effects: {
      deathAnimations: ['ghost_rising']
    }
  },
  {
    id: 'death_tumblesweed',
    name: 'Tumbleweed Death',
    description: 'You transform into a tumbleweed and blow away',
    category: UnlockCategory.COSMETIC,
    icon: 'death_tumbleweed',
    rarity: 'legendary',
    order: 603,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'desert_master'
    },
    effects: {
      deathAnimations: ['tumbleweed_transform']
    }
  }
];
