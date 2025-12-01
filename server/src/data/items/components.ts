/**
 * Crafting Components
 * Intermediate items crafted from raw/refined materials.
 */

import { IItem } from '../../models/Item.model';

export const components: Partial<IItem>[] = [
  // ========================================
  // BLACKSMITHING / GUNSMITHING COMPONENTS
  // ========================================
  {
    itemId: 'blade-blank',
    name: 'Blade Blank',
    description: 'A shaped and tempered piece of metal, ready to be honed into a finished blade.',
    type: 'material',
    rarity: 'common',
    price: 50,
    sellPrice: 25,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '🗡️',
    effects: []
  },
  {
    itemId: 'axe-head',
    name: 'Axe Head',
    description: 'A heavy, sharpened axe head. Needs a handle.',
    type: 'material',
    rarity: 'common',
    price: 60,
    sellPrice: 30,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '🪓',
    effects: []
  },
  {
    itemId: 'rifle-barrel',
    name: 'Rifle Barrel',
    description: 'A rifled barrel for a firearm. The core component of any accurate gun.',
    type: 'material',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '🔩',
    effects: []
  },
  {
    itemId: 'gun-stock',
    name: 'Gun Stock',
    description: 'A carved wooden stock for a rifle or shotgun.',
    type: 'material',
    rarity: 'common',
    price: 40,
    sellPrice: 20,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '🪵',
    effects: []
  },
  {
    itemId: 'nails',
    name: 'Bag of Nails',
    description: 'Hand-forged iron nails. Always useful.',
    type: 'material',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: true,
    levelRequired: 1,
    icon: '🔩',
    effects: []
  },
  {
    itemId: 'iron-fittings',
    name: 'Iron Fittings',
    description: 'A collection of iron bits and bobs - buckles, rings, and plates.',
    type: 'material',
    rarity: 'common',
    price: 30,
    sellPrice: 15,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '⚙️',
    effects: []
  },

  // ========================================
  // LEATHERWORKING / TAILORING COMPONENTS
  // ========================================
  {
    itemId: 'boot-sole',
    name: 'Boot Sole',
    description: 'A tough leather sole, ready to be attached to a boot.',
    type: 'material',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '👞',
    effects: []
  },
  {
    itemId: 'buckle',
    name: 'Iron Buckle',
    description: 'A simple iron buckle for straps and belts.',
    type: 'material',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '🔗',
    effects: []
  },
  {
    itemId: 'padding',
    name: 'Quilted Padding',
    description: 'Thick, quilted cloth used for lining armor and providing comfort.',
    type: 'material',
    rarity: 'common',
    price: 30,
    sellPrice: 15,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: ' quilted_square',
    effects: []
  },
  {
    itemId: 'reinforced-stitching',
    name: 'Reinforced Stitching',
    description: 'Waxed thread that has been magically reinforced. Creates exceptionally durable seams.',
    type: 'material',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 50,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '🧵',
    effects: []
  },

  // ========================================
  // ALCHEMY / GENERAL COMPONENTS
  // ========================================
  {
    itemId: 'empty-vial',
    name: 'Empty Vial',
    description: 'A small glass vial, ready to be filled with a potion or poison.',
    type: 'material',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: true,
    levelRequired: 1,
    icon: '🧪',
    effects: []
  },
  {
    itemId: 'distilled-water',
    name: 'Distilled Water',
    description: 'Pure water, the base for many alchemical concoctions.',
    type: 'material',
    rarity: 'common',
    price: 10,
    sellPrice: 5,
    inShop: true,
    levelRequired: 1,
    icon: '💧',
    effects: []
  },
  {
    itemId: 'lens',
    name: 'Ground Lens',
    description: 'A carefully ground piece of glass, used in eyepieces and other fine optics.',
    type: 'material',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '렌즈',
    effects: []
  },
  {
    itemId: 'binding',
    name: 'Binding',
    description: 'A versatile binding made from leather and cloth. Used to hold things together.',
    type: 'material',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false, // Crafted only
    levelRequired: 1,
    icon: '🩹',
    effects: []
  }
];
