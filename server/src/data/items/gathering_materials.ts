/**
 * New Gathering Materials
 * Raw materials for crafting professions.
 */

import { IItem } from '../../models/Item.model';

export const gatheringMaterials: Partial<IItem>[] = [
  // ========================================
  // TAILORING RAW MATERIALS
  // ========================================
  {
    itemId: 'raw-cotton',
    name: 'Raw Cotton',
    description: 'A soft, fluffy fiber harvested from the cotton plant. Can be spun into thread.',
    type: 'material',
    rarity: 'common',
    price: 8,
    sellPrice: 4,
    inShop: false, // Gathered
    levelRequired: 1,
    icon: '☁️',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'raw-flax',
    name: 'Raw Flax',
    description: 'Stalks from the flax plant. Can be processed and woven into linen.',
    type: 'material',
    rarity: 'common',
    price: 10,
    sellPrice: 5,
    inShop: false, // Gathered
    levelRequired: 1,
    icon: '🌿',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'raw-wool',
    name: 'Raw Wool',
    description: 'Thick, shaggy wool sheared from a sheep. Can be spun into yarn.',
    type: 'material',
    rarity: 'common',
    price: 12,
    sellPrice: 6,
    inShop: false, // Gathered
    levelRequired: 1,
    icon: '🐑',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'sand',
    name: 'Pile of Sand',
    description: 'Fine-grain sand, suitable for making glass.',
    type: 'material',
    rarity: 'common',
    price: 5,
    sellPrice: 2,
    inShop: false, // Gathered
    levelRequired: 1,
    icon: '⏳',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  }
];
