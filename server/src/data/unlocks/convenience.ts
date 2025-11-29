/**
 * Convenience Permanent Unlocks
 * Quality of life features that make the game easier to play
 */

import {
  PermanentUnlock,
  UnlockCategory,
  UnlockRequirementType
} from '@desperados/shared';

export const convenienceUnlocks: PermanentUnlock[] = [
  // AUTO-LOOT
  {
    id: 'auto_loot',
    name: 'Auto-Loot',
    description: 'Automatically collect loot from defeated enemies',
    category: UnlockCategory.CONVENIENCE,
    icon: 'feature_autoloot',
    rarity: 'epic',
    order: 2000,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 5
    },
    effects: {
      autoLoot: true
    }
  },

  // FAST TRAVEL POINTS
  {
    id: 'fast_travel_saloon',
    name: 'Saloon Fast Travel',
    description: 'Unlock fast travel to any saloon',
    category: UnlockCategory.CONVENIENCE,
    icon: 'travel_saloon',
    rarity: 'uncommon',
    order: 2100,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'visit_all_saloons'
    },
    effects: {
      fastTravelPoints: ['saloons']
    }
  },
  {
    id: 'fast_travel_bank',
    name: 'Bank Fast Travel',
    description: 'Unlock fast travel to any bank',
    category: UnlockCategory.CONVENIENCE,
    icon: 'travel_bank',
    rarity: 'uncommon',
    order: 2101,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 50000
    },
    effects: {
      fastTravelPoints: ['banks']
    }
  },
  {
    id: 'fast_travel_train',
    name: 'Train Station Fast Travel',
    description: 'Unlock fast travel to train stations',
    category: UnlockCategory.CONVENIENCE,
    icon: 'travel_train',
    rarity: 'rare',
    order: 2102,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'rail_baron'
    },
    effects: {
      fastTravelPoints: ['train_stations']
    }
  },
  {
    id: 'fast_travel_hideout',
    name: 'Hideout Fast Travel',
    description: 'Unlock fast travel to gang hideouts',
    category: UnlockCategory.CONVENIENCE,
    icon: 'travel_hideout',
    rarity: 'rare',
    order: 2103,
    requirements: {
      type: UnlockRequirementType.GANG_RANK,
      minValue: 3
    },
    effects: {
      fastTravelPoints: ['gang_hideouts']
    }
  },
  {
    id: 'fast_travel_anywhere',
    name: 'Universal Fast Travel',
    description: 'Unlock fast travel to any discovered location',
    category: UnlockCategory.CONVENIENCE,
    icon: 'travel_universal',
    rarity: 'legendary',
    order: 2104,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 12
    },
    effects: {
      fastTravelPoints: ['universal']
    }
  },

  // INVENTORY EXPANSION
  {
    id: 'inventory_expand_1',
    name: 'Expanded Saddlebags I',
    description: '+10 inventory slots',
    category: UnlockCategory.CONVENIENCE,
    icon: 'inventory_1',
    rarity: 'uncommon',
    order: 2200,
    requirements: {
      type: UnlockRequirementType.CHARACTER_LEVEL,
      minValue: 10
    },
    effects: {
      inventorySlots: 10
    }
  },
  {
    id: 'inventory_expand_2',
    name: 'Expanded Saddlebags II',
    description: '+20 inventory slots',
    category: UnlockCategory.CONVENIENCE,
    icon: 'inventory_2',
    rarity: 'rare',
    order: 2201,
    requirements: {
      type: UnlockRequirementType.CHARACTER_LEVEL,
      minValue: 25
    },
    effects: {
      inventorySlots: 20
    }
  },
  {
    id: 'inventory_expand_3',
    name: 'Expanded Saddlebags III',
    description: '+30 inventory slots',
    category: UnlockCategory.CONVENIENCE,
    icon: 'inventory_3',
    rarity: 'epic',
    order: 2202,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 6
    },
    effects: {
      inventorySlots: 30
    }
  },
  {
    id: 'inventory_expand_4',
    name: 'Legendary Saddlebags',
    description: '+50 inventory slots',
    category: UnlockCategory.CONVENIENCE,
    icon: 'inventory_4',
    rarity: 'legendary',
    order: 2203,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 10
    },
    effects: {
      inventorySlots: 50
    }
  },

  // BANK VAULT EXPANSION
  {
    id: 'bank_expand_1',
    name: 'Bank Vault I',
    description: '+25 bank storage slots',
    category: UnlockCategory.CONVENIENCE,
    icon: 'bank_1',
    rarity: 'uncommon',
    order: 2300,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 10000
    },
    effects: {
      bankVaultSlots: 25
    }
  },
  {
    id: 'bank_expand_2',
    name: 'Bank Vault II',
    description: '+50 bank storage slots',
    category: UnlockCategory.CONVENIENCE,
    icon: 'bank_2',
    rarity: 'rare',
    order: 2301,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 50000
    },
    effects: {
      bankVaultSlots: 50
    }
  },
  {
    id: 'bank_expand_3',
    name: 'Bank Vault III',
    description: '+100 bank storage slots',
    category: UnlockCategory.CONVENIENCE,
    icon: 'bank_3',
    rarity: 'epic',
    order: 2302,
    requirements: {
      type: UnlockRequirementType.GOLD_EARNED,
      minValue: 250000
    },
    effects: {
      bankVaultSlots: 100
    }
  },

  // MAIL ATTACHMENTS
  {
    id: 'mail_attach_1',
    name: 'Mail Attachments I',
    description: '+2 mail attachment slots',
    category: UnlockCategory.CONVENIENCE,
    icon: 'mail_1',
    rarity: 'common',
    order: 2400,
    requirements: {
      type: UnlockRequirementType.CHARACTER_LEVEL,
      minValue: 5
    },
    effects: {
      mailAttachmentSlots: 2
    }
  },
  {
    id: 'mail_attach_2',
    name: 'Mail Attachments II',
    description: '+5 mail attachment slots',
    category: UnlockCategory.CONVENIENCE,
    icon: 'mail_2',
    rarity: 'uncommon',
    order: 2401,
    requirements: {
      type: UnlockRequirementType.ACHIEVEMENT,
      achievementId: 'social_butterfly'
    },
    effects: {
      mailAttachmentSlots: 5
    }
  },
  {
    id: 'mail_attach_3',
    name: 'Mail Attachments III',
    description: '+10 mail attachment slots',
    category: UnlockCategory.CONVENIENCE,
    icon: 'mail_3',
    rarity: 'rare',
    order: 2402,
    requirements: {
      type: UnlockRequirementType.LEGACY_TIER,
      legacyTier: 4
    },
    effects: {
      mailAttachmentSlots: 10
    }
  }
];
