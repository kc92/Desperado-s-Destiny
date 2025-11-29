import {
  HorseEquipmentSlot,
  HorseRarity,
  HorseBreed
} from '@desperados/shared';

// ============================================================================
// HORSE EQUIPMENT DEFINITIONS
// ============================================================================

export interface HorseEquipmentDefinition {
  id: string;
  type: HorseEquipmentSlot;
  name: string;
  description: string;
  rarity: HorseRarity;
  price: number;
  bonuses: {
    speed?: number;
    stamina?: number;
    health?: number;
    bravery?: number;
    carryCapacity?: number;
    combatBonus?: number;
  };
  requirements?: {
    minHorseLevel?: number;
    breeds?: HorseBreed[];
  };
  maxDurability: number;
}

// ============================================================================
// SADDLES
// ============================================================================

export const SADDLES: HorseEquipmentDefinition[] = [
  // Common Saddles
  {
    id: 'basic_saddle',
    type: HorseEquipmentSlot.SADDLE,
    name: 'Basic Saddle',
    description: 'Simple leather saddle. Gets the job done.',
    rarity: HorseRarity.COMMON,
    price: 50,
    bonuses: {},
    maxDurability: 100
  },
  {
    id: 'work_saddle',
    type: HorseEquipmentSlot.SADDLE,
    name: 'Work Saddle',
    description: 'Reinforced for ranch work. Extra rings for rope and equipment.',
    rarity: HorseRarity.COMMON,
    price: 80,
    bonuses: {
      carryCapacity: 10
    },
    maxDurability: 150
  },

  // Quality Saddles
  {
    id: 'racing_saddle',
    type: HorseEquipmentSlot.SADDLE,
    name: 'Racing Saddle',
    description: 'Lightweight design for maximum speed. English-style, minimal padding.',
    rarity: HorseRarity.QUALITY,
    price: 200,
    bonuses: {
      speed: 5,
      stamina: -5
    },
    maxDurability: 120
  },
  {
    id: 'endurance_saddle',
    type: HorseEquipmentSlot.SADDLE,
    name: 'Endurance Saddle',
    description: 'Ergonomic design distributes weight evenly. Both rider and horse travel farther.',
    rarity: HorseRarity.QUALITY,
    price: 250,
    bonuses: {
      stamina: 8
    },
    maxDurability: 200
  },
  {
    id: 'cavalry_saddle',
    type: HorseEquipmentSlot.SADDLE,
    name: 'Cavalry Saddle',
    description: 'Military-grade with high pommel and cantle. Secure seating for mounted combat.',
    rarity: HorseRarity.QUALITY,
    price: 300,
    bonuses: {
      combatBonus: 10,
      bravery: 3
    },
    maxDurability: 180
  },

  // Rare Saddles
  {
    id: 'vaquero_saddle',
    type: HorseEquipmentSlot.SADDLE,
    name: 'Vaquero Saddle',
    description: 'Handcrafted Mexican saddle with silver conchos. Beautiful and functional.',
    rarity: HorseRarity.RARE,
    price: 500,
    bonuses: {
      speed: 3,
      stamina: 5,
      carryCapacity: 15
    },
    maxDurability: 250
  },
  {
    id: 'war_saddle',
    type: HorseEquipmentSlot.SADDLE,
    name: 'War Saddle',
    description: 'Heavy reinforced saddle designed for armored combat. Inspires confidence.',
    rarity: HorseRarity.RARE,
    price: 600,
    bonuses: {
      combatBonus: 20,
      bravery: 5,
      speed: -3
    },
    maxDurability: 300
  },
  {
    id: 'legendary_saddle',
    type: HorseEquipmentSlot.SADDLE,
    name: 'Legendary Saddle',
    description: 'Masterwork saddle of unknown origin. Said to be blessed by the spirits.',
    rarity: HorseRarity.LEGENDARY,
    price: 2000,
    bonuses: {
      speed: 5,
      stamina: 10,
      health: 5,
      combatBonus: 15,
      carryCapacity: 20
    },
    maxDurability: 500
  }
];

// ============================================================================
// SADDLEBAGS
// ============================================================================

export const SADDLEBAGS: HorseEquipmentDefinition[] = [
  // Common
  {
    id: 'small_saddlebags',
    type: HorseEquipmentSlot.SADDLEBAGS,
    name: 'Small Saddlebags',
    description: 'Basic canvas bags. Better than nothing.',
    rarity: HorseRarity.COMMON,
    price: 20,
    bonuses: {
      carryCapacity: 10
    },
    maxDurability: 80
  },
  {
    id: 'leather_saddlebags',
    type: HorseEquipmentSlot.SADDLEBAGS,
    name: 'Leather Saddlebags',
    description: 'Sturdy leather construction. Weather-resistant.',
    rarity: HorseRarity.COMMON,
    price: 45,
    bonuses: {
      carryCapacity: 20
    },
    maxDurability: 120
  },

  // Quality
  {
    id: 'reinforced_saddlebags',
    type: HorseEquipmentSlot.SADDLEBAGS,
    name: 'Reinforced Saddlebags',
    description: 'Double-stitched with brass fittings. Holds heavy loads.',
    rarity: HorseRarity.QUALITY,
    price: 100,
    bonuses: {
      carryCapacity: 35
    },
    maxDurability: 180
  },
  {
    id: 'expedition_saddlebags',
    type: HorseEquipmentSlot.SADDLEBAGS,
    name: 'Expedition Saddlebags',
    description: 'Multi-pocket design with waterproof lining. Explorer\'s choice.',
    rarity: HorseRarity.QUALITY,
    price: 150,
    bonuses: {
      carryCapacity: 50,
      stamina: -2 // Weight penalty
    },
    maxDurability: 200
  },

  // Rare
  {
    id: 'merchants_saddlebags',
    type: HorseEquipmentSlot.SADDLEBAGS,
    name: 'Merchant\'s Saddlebags',
    description: 'Enormous capacity with balanced weight distribution. Hardly slows the horse.',
    rarity: HorseRarity.RARE,
    price: 350,
    bonuses: {
      carryCapacity: 75,
      stamina: -1
    },
    maxDurability: 250
  }
];

// ============================================================================
// HORSESHOES
// ============================================================================

export const HORSESHOES: HorseEquipmentDefinition[] = [
  // Common
  {
    id: 'basic_horseshoes',
    type: HorseEquipmentSlot.HORSESHOES,
    name: 'Basic Horseshoes',
    description: 'Standard iron shoes. Protects hooves from wear.',
    rarity: HorseRarity.COMMON,
    price: 15,
    bonuses: {
      health: 2
    },
    maxDurability: 100
  },

  // Quality
  {
    id: 'steel_horseshoes',
    type: HorseEquipmentSlot.HORSESHOES,
    name: 'Steel Horseshoes',
    description: 'High-quality steel holds up better. Smoother ride.',
    rarity: HorseRarity.QUALITY,
    price: 40,
    bonuses: {
      health: 3,
      speed: 2
    },
    maxDurability: 150
  },
  {
    id: 'mountain_horseshoes',
    type: HorseEquipmentSlot.HORSESHOES,
    name: 'Mountain Horseshoes',
    description: 'Special grip design for rocky terrain. Extra durability.',
    rarity: HorseRarity.QUALITY,
    price: 60,
    bonuses: {
      health: 5,
      stamina: 3
    },
    maxDurability: 200
  },

  // Rare
  {
    id: 'racing_horseshoes',
    type: HorseEquipmentSlot.HORSESHOES,
    name: 'Racing Horseshoes',
    description: 'Lightweight aluminum design. Every ounce counts in a race.',
    rarity: HorseRarity.RARE,
    price: 150,
    bonuses: {
      speed: 5,
      health: 1
    },
    maxDurability: 100
  },
  {
    id: 'enchanted_horseshoes',
    type: HorseEquipmentSlot.HORSESHOES,
    name: 'Enchanted Horseshoes',
    description: 'Mysterious symbols etched into the metal. Horse never seems to tire.',
    rarity: HorseRarity.LEGENDARY,
    price: 800,
    bonuses: {
      speed: 5,
      stamina: 10,
      health: 5
    },
    maxDurability: 300
  }
];

// ============================================================================
// BARDING (ARMOR)
// ============================================================================

export const BARDING: HorseEquipmentDefinition[] = [
  // Quality
  {
    id: 'leather_barding',
    type: HorseEquipmentSlot.BARDING,
    name: 'Leather Barding',
    description: 'Boiled leather plates protect vital areas. Some protection without too much weight.',
    rarity: HorseRarity.QUALITY,
    price: 200,
    bonuses: {
      health: 10,
      combatBonus: 5,
      speed: -3
    },
    maxDurability: 150
  },

  // Rare
  {
    id: 'chainmail_barding',
    type: HorseEquipmentSlot.BARDING,
    name: 'Chainmail Barding',
    description: 'Interlocking rings cover the horse\'s body. Excellent protection.',
    rarity: HorseRarity.RARE,
    price: 500,
    bonuses: {
      health: 20,
      bravery: 5,
      combatBonus: 10,
      speed: -5
    },
    maxDurability: 200
  },
  {
    id: 'plate_barding',
    type: HorseEquipmentSlot.BARDING,
    name: 'Plate Barding',
    description: 'Full plate armor for your mount. Only the strongest horses can carry this.',
    rarity: HorseRarity.RARE,
    price: 800,
    bonuses: {
      health: 30,
      bravery: 10,
      combatBonus: 20,
      speed: -8
    },
    requirements: {
      minHorseLevel: 10
    },
    maxDurability: 250
  },

  // Legendary
  {
    id: 'conquistador_barding',
    type: HorseEquipmentSlot.BARDING,
    name: 'Conquistador Barding',
    description: 'Spanish war armor adorned with gold. Intimidates enemies, inspires allies.',
    rarity: HorseRarity.LEGENDARY,
    price: 2500,
    bonuses: {
      health: 25,
      bravery: 15,
      combatBonus: 30,
      speed: -5
    },
    maxDurability: 400
  },
  {
    id: 'spirit_barding',
    type: HorseEquipmentSlot.BARDING,
    name: 'Spirit Barding',
    description: 'Ethereal armor that seems to shimmer between worlds. Light as air, strong as steel.',
    rarity: HorseRarity.LEGENDARY,
    price: 3000,
    bonuses: {
      health: 20,
      bravery: 10,
      combatBonus: 25,
      speed: 5, // Actually increases speed!
      stamina: 5
    },
    maxDurability: 500
  }
];

// ============================================================================
// LOOKUP UTILITIES
// ============================================================================

export const ALL_HORSE_EQUIPMENT = [
  ...SADDLES,
  ...SADDLEBAGS,
  ...HORSESHOES,
  ...BARDING
];

export function getEquipmentById(id: string): HorseEquipmentDefinition | undefined {
  return ALL_HORSE_EQUIPMENT.find(eq => eq.id === id);
}

export function getEquipmentByType(type: HorseEquipmentSlot): HorseEquipmentDefinition[] {
  return ALL_HORSE_EQUIPMENT.filter(eq => eq.type === type);
}

export function getEquipmentByRarity(rarity: HorseRarity): HorseEquipmentDefinition[] {
  return ALL_HORSE_EQUIPMENT.filter(eq => eq.rarity === rarity);
}

export function getShopEquipment(): HorseEquipmentDefinition[] {
  // All equipment can be bought except legendary items (must be found/earned)
  return ALL_HORSE_EQUIPMENT.filter(eq => eq.rarity !== HorseRarity.LEGENDARY);
}

// ============================================================================
// FOOD DEFINITIONS
// ============================================================================

export interface HorseFoodDefinition {
  quality: 'basic' | 'quality' | 'premium';
  name: string;
  description: string;
  cost: number;
  hungerRestored: number;
  bondBonus: number;
  staminaBonus?: number;
  healthBonus?: number;
}

export const HORSE_FOOD: HorseFoodDefinition[] = [
  {
    quality: 'basic',
    name: 'Hay',
    description: 'Basic dried grass. Fills the belly.',
    cost: 1,
    hungerRestored: 30,
    bondBonus: 2
  },
  {
    quality: 'basic',
    name: 'Oats',
    description: 'Standard feed. Good energy.',
    cost: 2,
    hungerRestored: 40,
    bondBonus: 3,
    staminaBonus: 5
  },
  {
    quality: 'quality',
    name: 'Mixed Grain',
    description: 'Blend of oats, corn, and barley. Nutritious and tasty.',
    cost: 5,
    hungerRestored: 60,
    bondBonus: 5,
    staminaBonus: 10
  },
  {
    quality: 'quality',
    name: 'Alfalfa',
    description: 'High-quality hay. Horses love it.',
    cost: 4,
    hungerRestored: 50,
    bondBonus: 4,
    healthBonus: 5
  },
  {
    quality: 'premium',
    name: 'Premium Mix',
    description: 'Top-grade feed with molasses. The good stuff.',
    cost: 10,
    hungerRestored: 80,
    bondBonus: 8,
    staminaBonus: 15,
    healthBonus: 5
  },
  {
    quality: 'premium',
    name: 'Apple Treats',
    description: 'Fresh apples and sugar cubes. Pure happiness.',
    cost: 8,
    hungerRestored: 40,
    bondBonus: 10
  },
  {
    quality: 'premium',
    name: 'Champion Feed',
    description: 'Racing stable secret recipe. Peak performance.',
    cost: 15,
    hungerRestored: 100,
    bondBonus: 10,
    staminaBonus: 20,
    healthBonus: 10
  }
];

export function getFoodByQuality(quality: 'basic' | 'quality' | 'premium'): HorseFoodDefinition[] {
  return HORSE_FOOD.filter(food => food.quality === quality);
}
