/**
 * Chinese Diaspora Item Catalog
 *
 * Complete catalog of all items, organized by category and trust level
 */

import type {
  DiasporaItemCatalog,
  TrustLevelItemCollection,
  DiasporaWeapon,
  DiasporaArmor,
  DiasporaConsumable,
  DiasporaItem
} from '@desperados/shared';

// Import weapons
import {
  JIAN_SWORD,
  THROWING_STARS,
  DAO_SABER,
  STAFF_GUN,
  ROPE_DART,
  BUTTERFLY_SWORDS,
  DRAGONS_BREATH_PISTOL,
  CELESTIAL_DRAGON_SWORD,
} from './items';

// Import armor
import {
  SILK_UNDERCLOTHING,
  WORKERS_DISGUISE,
  MARTIAL_ARTISTS_GI,
  MERCHANTS_ROBES,
  SILK_ARMOR_LEGENDARY,
  DRAGON_MASK,
  EMPERORS_SILK,
} from './items';

// Import consumables and tools
import {
  DIASPORA_CONSUMABLES,
  DIASPORA_TOOLS,
  DIASPORA_UNIQUE_CONSUMABLES,
} from './items-consumables';

// Import intelligence
import {
  ALL_INTELLIGENCE,
  TRUST_LEVEL_2_INTEL,
  TRUST_LEVEL_3_INTEL,
  TRUST_LEVEL_4_INTEL,
  TRUST_LEVEL_5_INTEL,
} from './intelligence';

// ============================================================================
// COMPLETE CATALOG
// ============================================================================

export const DIASPORA_ITEM_CATALOG: DiasporaItemCatalog = {
  weapons: [
    // Trust 2
    JIAN_SWORD,
    THROWING_STARS,
    // Trust 3
    DAO_SABER,
    STAFF_GUN,
    ROPE_DART,
    // Trust 4
    BUTTERFLY_SWORDS,
    DRAGONS_BREATH_PISTOL,
    // Trust 5
    CELESTIAL_DRAGON_SWORD,
  ],
  armor: [
    // Trust 2
    SILK_UNDERCLOTHING,
    WORKERS_DISGUISE,
    // Trust 3
    MARTIAL_ARTISTS_GI,
    MERCHANTS_ROBES,
    // Trust 4
    SILK_ARMOR_LEGENDARY,
    DRAGON_MASK,
    // Trust 5
    EMPERORS_SILK,
  ],
  consumables: DIASPORA_CONSUMABLES,
  tools: DIASPORA_TOOLS,
  intelligence: ALL_INTELLIGENCE,
  unique: [],  // Unique items are already marked with unique:true in their respective arrays
};

// ============================================================================
// BY TRUST LEVEL
// ============================================================================

export const TRUST_LEVEL_2_ITEMS: TrustLevelItemCollection = {
  trustLevel: 2,
  weapons: [JIAN_SWORD, THROWING_STARS],
  armor: [SILK_UNDERCLOTHING, WORKERS_DISGUISE],
  consumables: DIASPORA_CONSUMABLES.filter(c => c.trustRequired === 2),
  tools: DIASPORA_TOOLS.filter(t => t.trustRequired === 2),
  intelligence: TRUST_LEVEL_2_INTEL,
};

export const TRUST_LEVEL_3_ITEMS: TrustLevelItemCollection = {
  trustLevel: 3,
  weapons: [DAO_SABER, STAFF_GUN, ROPE_DART],
  armor: [MARTIAL_ARTISTS_GI, MERCHANTS_ROBES],
  consumables: DIASPORA_CONSUMABLES.filter(c => c.trustRequired === 3),
  tools: DIASPORA_TOOLS.filter(t => t.trustRequired === 3),
  intelligence: TRUST_LEVEL_3_INTEL,
};

export const TRUST_LEVEL_4_ITEMS: TrustLevelItemCollection = {
  trustLevel: 4,
  weapons: [BUTTERFLY_SWORDS, DRAGONS_BREATH_PISTOL],
  armor: [SILK_ARMOR_LEGENDARY, DRAGON_MASK],
  consumables: DIASPORA_CONSUMABLES.filter(c => c.trustRequired === 4),
  tools: DIASPORA_TOOLS.filter(t => t.trustRequired === 4),
  intelligence: TRUST_LEVEL_4_INTEL,
};

export const TRUST_LEVEL_5_ITEMS: TrustLevelItemCollection = {
  trustLevel: 5,
  weapons: [CELESTIAL_DRAGON_SWORD],
  armor: [EMPERORS_SILK],
  consumables: DIASPORA_CONSUMABLES.filter(c => c.trustRequired === 5),
  tools: DIASPORA_TOOLS.filter(t => t.trustRequired === 5),
  intelligence: TRUST_LEVEL_5_INTEL,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all items available at a specific trust level
 */
export function getItemsByTrustLevel(trustLevel: number): TrustLevelItemCollection {
  const collections = [
    TRUST_LEVEL_2_ITEMS,
    TRUST_LEVEL_3_ITEMS,
    TRUST_LEVEL_4_ITEMS,
    TRUST_LEVEL_5_ITEMS,
  ];

  // Return cumulative items (everything up to and including this level)
  const availableWeapons = DIASPORA_ITEM_CATALOG.weapons.filter(w => w.trustRequired <= trustLevel);
  const availableArmor = DIASPORA_ITEM_CATALOG.armor.filter(a => a.trustRequired <= trustLevel);
  const availableConsumables = DIASPORA_CONSUMABLES.filter(c => c.trustRequired <= trustLevel);
  const availableTools = DIASPORA_TOOLS.filter(t => t.trustRequired <= trustLevel);
  const availableIntel = ALL_INTELLIGENCE.filter(i => i.trustRequired <= trustLevel);

  return {
    trustLevel,
    weapons: availableWeapons,
    armor: availableArmor,
    consumables: availableConsumables,
    tools: availableTools,
    intelligence: availableIntel,
  };
}

/**
 * Get item by ID
 */
export function getItemById(itemId: string): DiasporaWeapon | DiasporaArmor | DiasporaConsumable | DiasporaItem | null {
  // Search weapons
  const weapon = DIASPORA_ITEM_CATALOG.weapons.find(w => w.id === itemId);
  if (weapon) return weapon;

  // Search armor
  const armor = DIASPORA_ITEM_CATALOG.armor.find(a => a.id === itemId);
  if (armor) return armor;

  // Search consumables
  const consumable = DIASPORA_CONSUMABLES.find(c => c.id === itemId);
  if (consumable) return consumable;

  // Search tools
  const tool = DIASPORA_TOOLS.find(t => t.id === itemId);
  if (tool) return tool;

  return null;
}

/**
 * Get intelligence by ID
 */
export function getIntelligenceById(intelId: string) {
  return ALL_INTELLIGENCE.find(i => i.id === intelId);
}

/**
 * Check if item is unique (only one exists)
 */
export function isUniqueItem(itemId: string): boolean {
  return DIASPORA_ITEM_CATALOG.unique.some(u => u.id === itemId);
}

/**
 * Get all legendary items
 */
export function getLegendaryItems() {
  const legendaryWeapons = DIASPORA_ITEM_CATALOG.weapons.filter(w => w.rarity === 'legendary' || w.rarity === 'unique');
  const legendaryArmor = DIASPORA_ITEM_CATALOG.armor.filter(a => a.rarity === 'legendary' || a.rarity === 'unique');
  const legendaryConsumables = DIASPORA_CONSUMABLES.filter(c => c.rarity === 'legendary' || c.rarity === 'unique');

  return {
    weapons: legendaryWeapons,
    armor: legendaryArmor,
    consumables: legendaryConsumables,
  };
}

/**
 * Get items by source NPC
 */
export function getItemsByNPC(npcId: string) {
  const weapons = DIASPORA_ITEM_CATALOG.weapons.filter(w => w.sourceNPC === npcId);
  const armor = DIASPORA_ITEM_CATALOG.armor.filter(a => a.sourceNPC === npcId);
  const consumables = DIASPORA_CONSUMABLES.filter(c => c.sourceNPC === npcId);
  const tools = DIASPORA_TOOLS.filter(t => t.sourceNPC === npcId);
  const intel = ALL_INTELLIGENCE.filter(i => i.sourceNPC === npcId);

  return {
    weapons,
    armor,
    consumables,
    tools,
    intelligence: intel,
  };
}

// ============================================================================
// STATISTICS
// ============================================================================

export const CATALOG_STATS = {
  totalWeapons: DIASPORA_ITEM_CATALOG.weapons.length,
  totalArmor: DIASPORA_ITEM_CATALOG.armor.length,
  totalConsumables: DIASPORA_CONSUMABLES.length,
  totalTools: DIASPORA_TOOLS.length,
  totalIntelligence: ALL_INTELLIGENCE.length,
  totalUnique: DIASPORA_ITEM_CATALOG.unique.length,
  totalItems:
    DIASPORA_ITEM_CATALOG.weapons.length +
    DIASPORA_ITEM_CATALOG.armor.length +
    DIASPORA_CONSUMABLES.length +
    DIASPORA_TOOLS.length,
  byTrustLevel: {
    2: {
      weapons: TRUST_LEVEL_2_ITEMS.weapons.length,
      armor: TRUST_LEVEL_2_ITEMS.armor.length,
      consumables: TRUST_LEVEL_2_ITEMS.consumables.length,
      tools: TRUST_LEVEL_2_ITEMS.tools.length,
      intelligence: TRUST_LEVEL_2_ITEMS.intelligence.length,
    },
    3: {
      weapons: TRUST_LEVEL_3_ITEMS.weapons.length,
      armor: TRUST_LEVEL_3_ITEMS.armor.length,
      consumables: TRUST_LEVEL_3_ITEMS.consumables.length,
      tools: TRUST_LEVEL_3_ITEMS.tools.length,
      intelligence: TRUST_LEVEL_3_ITEMS.intelligence.length,
    },
    4: {
      weapons: TRUST_LEVEL_4_ITEMS.weapons.length,
      armor: TRUST_LEVEL_4_ITEMS.armor.length,
      consumables: TRUST_LEVEL_4_ITEMS.consumables.length,
      tools: TRUST_LEVEL_4_ITEMS.tools.length,
      intelligence: TRUST_LEVEL_4_ITEMS.intelligence.length,
    },
    5: {
      weapons: TRUST_LEVEL_5_ITEMS.weapons.length,
      armor: TRUST_LEVEL_5_ITEMS.armor.length,
      consumables: TRUST_LEVEL_5_ITEMS.consumables.length,
      tools: TRUST_LEVEL_5_ITEMS.tools.length,
      intelligence: TRUST_LEVEL_5_ITEMS.intelligence.length,
    },
  },
};
