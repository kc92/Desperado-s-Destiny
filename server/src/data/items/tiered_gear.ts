/**
 * Tiered Gear Sets
 * Craftable gear sets for player progression.
 */

import { IItem } from '../../models/Item.model';

export const tieredGear: Partial<IItem>[] = [
  // ========================================
  // TIER 1: ROUGH IRON (LEVEL 5-10)
  // ========================================
  {
    itemId: 'rough-iron-helmet',
    name: 'Rough Iron Helmet',
    description: 'A simple, sturdy helmet made from roughly forged iron.',
    type: 'armor',
    rarity: 'common',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 5,
    icon: '⛑️',
    equipSlot: 'head',
    isEquippable: true,
    effects: [{ type: 'stat', stat: 'hp', value: 20, description: '+20 HP' }]
  },
  {
    itemId: 'rough-iron-cuirass',
    name: 'Rough Iron Cuirass',
    description: 'A breastplate made of crudely hammered iron plates.',
    type: 'armor',
    rarity: 'common',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 5,
    icon: '🥋',
    equipSlot: 'body',
    isEquippable: true,
    effects: [{ type: 'stat', stat: 'hp', value: 40, description: '+40 HP' }]
  },
  {
    itemId: 'rough-iron-boots',
    name: 'Rough Iron Boots',
    description: 'Heavy boots with iron plates over the shins.',
    type: 'armor',
    rarity: 'common',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 5,
    icon: '👢',
    equipSlot: 'feet',
    isEquippable: true,
    effects: [{ type: 'stat', stat: 'hp', value: 15, description: '+15 HP' }]
  },
  {
    itemId: 'rough-iron-sword',
    name: 'Rough Iron Sword',
    description: 'A simple, reliable sword forged from iron.',
    type: 'weapon',
    rarity: 'common',
    price: 200,
    sellPrice: 100,
    inShop: false,
    levelRequired: 5,
    icon: '⚔️',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [{ type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' }]
  },

  // ========================================
  // TIER 2: HARDENED STEEL (LEVEL 15-20)
  // ========================================
  {
    itemId: 'hardened-steel-helmet',
    name: 'Hardened Steel Helmet',
    description: 'A well-crafted steel helmet that offers excellent protection.',
    type: 'armor',
    rarity: 'uncommon',
    price: 450,
    sellPrice: 225,
    inShop: false,
    levelRequired: 15,
    icon: '⛑️',
    equipSlot: 'head',
    isEquippable: true,
    effects: [{ type: 'stat', stat: 'hp', value: 45, description: '+45 HP' }, { type: 'special', value: 5, description: '+5% Physical Resistance' }]
  },
  {
    itemId: 'hardened-steel-cuirass',
    name: 'Hardened Steel Cuirass',
    description: 'A polished steel breastplate, expertly shaped to deflect blows.',
    type: 'armor',
    rarity: 'uncommon',
    price: 900,
    sellPrice: 450,
    inShop: false,
    levelRequired: 15,
    icon: '🥋',
    equipSlot: 'body',
    isEquippable: true,
    effects: [{ type: 'stat', stat: 'hp', value: 90, description: '+90 HP' }, { type: 'special', value: 5, description: '+5% Physical Resistance' }]
  },
  {
    itemId: 'hardened-steel-boots',
    name: 'Hardened Steel Boots',
    description: 'Steel-plated boots that are surprisingly flexible.',
    type: 'armor',
    rarity: 'uncommon',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 15,
    icon: '👢',
    equipSlot: 'feet',
    isEquippable: true,
    effects: [{ type: 'stat', stat: 'hp', value: 35, description: '+35 HP' }, { type: 'special', value: 5, description: '+5% Physical Resistance' }]
  },
  {
    itemId: 'hardened-steel-greatsword',
    name: 'Hardened Steel Greatsword',
    description: 'A large, two-handed sword made of hardened steel.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 600,
    sellPrice: 300,
    inShop: false,
    levelRequired: 15,
    icon: '⚔️',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [{ type: 'stat', stat: 'combat', value: 20, description: '+20 Combat' }]
  },
];
