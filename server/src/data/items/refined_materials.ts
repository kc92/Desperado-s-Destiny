/**
 * Refined Materials
 * Materials processed from raw resources, used in crafting.
 */

import { IItem } from '../../models/Item.model';

export const refinedMaterials: Partial<IItem>[] = [
  // ========================================
  // BLACKSMITHING - REFINED METALS
  // ========================================
  {
    itemId: 'silver-ingot',
    name: 'Silver Ingot',
    description: 'A bar of refined silver, gleaming brightly. Used for decorative work and crafting special items.',
    type: 'material',
    rarity: 'uncommon',
    price: 80,
    sellPrice: 40,
    inShop: true,
    levelRequired: 1,
    icon: '🥈',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'gold-ingot',
    name: 'Gold Ingot',
    description: 'A bar of pure, refined gold. The standard for wealth and luxury crafting.',
    type: 'material',
    rarity: 'rare',
    price: 200,
    sellPrice: 100,
    inShop: true,
    levelRequired: 1,
    icon: '🥇',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'starmetal-ingot',
    name: 'Starmetal Ingot',
    description: 'An ingot of a strange, otherworldly metal that faintly glows. It is incredibly light and durable.',
    type: 'material',
    rarity: 'epic',
    price: 1000,
    sellPrice: 500,
    inShop: false, // Crafted or rare drop
    levelRequired: 1,
    icon: '✨',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'glass-pane',
    name: 'Glass Pane',
    description: 'A clear sheet of glass, ready to be shaped into vials or lenses.',
    type: 'material',
    rarity: 'common',
    price: 35,
    sellPrice: 17,
    inShop: true,
    levelRequired: 1,
    icon: '🪟',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },

  // ========================================
  // LEATHERWORKING - REFINED LEATHERS
  // ========================================
  {
    itemId: 'cured-leather',
    name: 'Cured Leather',
    description: 'Basic leather, cured and ready for crafting. Flexible and moderately durable.',
    type: 'material',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: true,
    levelRequired: 1,
    icon: '🟫',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'treated-leather',
    name: 'Treated Leather',
    description: 'Heavy leather that has been treated with oils and tannins to make it exceptionally tough.',
    type: 'material',
    rarity: 'uncommon',
    price: 75,
    sellPrice: 37,
    inShop: true,
    levelRequired: 1,
    icon: '🟫',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'exotic-leather',
    name: 'Exotic Leather',
    description: 'Leather crafted from the hides of rare and dangerous creatures. It often retains some of the creature\'s properties.',
    type: 'material',
    rarity: 'rare',
    price: 250,
    sellPrice: 125,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '🐍',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },

  // ========================================
  // TAILORING - REFINED CLOTHS
  // ========================================
  {
    itemId: 'linen-cloth',
    name: 'Linen Cloth',
    description: 'A bolt of simple, sturdy cloth woven from flax.',
    type: 'material',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: true,
    levelRequired: 1,
    icon: '📜',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  },
  {
    itemId: 'wool-bolt',
    name: 'Wool Bolt',
    description: 'A bolt of thick, warm wool fabric. Excellent for making coats and blankets.',
    type: 'material',
    rarity: 'common',
    price: 30,
    sellPrice: 15,
    inShop: true,
    levelRequired: 1,
    icon: '🧣',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    effects: []
  }
];
