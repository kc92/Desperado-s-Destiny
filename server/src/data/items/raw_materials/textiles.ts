/**
 * Textiles Database
 * Phase 7.2 Crafting Expansion - Fabrics, threads, and fiber materials
 * 9 items: Tailoring, Native Crafts, Leadership inputs
 */

import { IItem } from '../../../models/Item.model';

export const textiles: Partial<IItem>[] = [
  // ========== COMMON TEXTILES (Level 1-30) ==========
  {
    itemId: 'raw-cotton',
    name: 'Raw Cotton',
    description: 'Unprocessed cotton bolls. Needs carding and spinning.',
    type: 'material',
    rarity: 'common',
    price: 5,
    sellPrice: 2,
    inShop: false,
    levelRequired: 1,
    icon: '☁️',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'wool-raw',
    name: 'Raw Wool',
    description: 'Freshly sheared wool. Lanolin-rich and needs cleaning.',
    type: 'material',
    rarity: 'common',
    price: 8,
    sellPrice: 4,
    inShop: false,
    levelRequired: 5,
    icon: '🐑',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'hemp-fiber',
    name: 'Hemp Fiber',
    description: 'Strong natural fiber. Used for rope, canvas, and sturdy cloth.',
    type: 'material',
    rarity: 'common',
    price: 10,
    sellPrice: 5,
    inShop: false,
    levelRequired: 10,
    icon: '🌿',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'flax-bundle',
    name: 'Flax Bundle',
    description: 'Plant fibers for linen production. Soft and breathable when processed.',
    type: 'material',
    rarity: 'common',
    price: 12,
    sellPrice: 6,
    inShop: false,
    levelRequired: 15,
    icon: '🌾',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },

  // ========== PROCESSED TEXTILES (Level 31-60) ==========
  {
    itemId: 'denim-bolt',
    name: 'Denim Bolt',
    description: 'Tough twill cotton fabric. The foundation of frontier work wear.',
    type: 'material',
    rarity: 'uncommon',
    price: 35,
    sellPrice: 17,
    inShop: true,
    levelRequired: 32,
    icon: '👖',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    effects: []
  },
  {
    itemId: 'canvas-bolt',
    name: 'Canvas Bolt',
    description: 'Heavy-duty woven fabric. Essential for tents, bags, and sails.',
    type: 'material',
    rarity: 'uncommon',
    price: 40,
    sellPrice: 20,
    inShop: true,
    levelRequired: 38,
    icon: '🏕️',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    effects: []
  },
  {
    itemId: 'silk-bundle',
    name: 'Chinese Silk',
    description: 'Imported luxury fabric. Brought by railroad from San Francisco.',
    type: 'material',
    rarity: 'rare',
    price: 120,
    sellPrice: 60,
    inShop: false,
    levelRequired: 55,
    icon: '🎀',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 25,
    effects: []
  },

  // ========== SUPERNATURAL TEXTILES (Level 80-100) ==========
  {
    itemId: 'spirit-thread',
    name: 'Spirit Thread',
    description: 'Luminous thread spun from moonlight. Holds supernatural enchantments.',
    type: 'material',
    rarity: 'legendary',
    price: 250,
    sellPrice: 125,
    inShop: false,
    levelRequired: 85,
    icon: '✨',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 25,
    effects: []
  },
  {
    itemId: 'void-silk',
    name: 'Void Silk',
    description: 'Fabric woven from shadow. Absorbs light and muffles sound.',
    type: 'material',
    rarity: 'legendary',
    price: 350,
    sellPrice: 175,
    inShop: false,
    levelRequired: 95,
    icon: '🕳️',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 10,
    effects: []
  }
];
