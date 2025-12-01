/**
 * Crafting Gear
 * Items for Crafting professions
 */

import { IItem } from '../../models/Item.model';

export const craftingGear: Partial<IItem>[] = [
  // ========================================
  // CRAFTING ARMOR
  // ========================================
  {
    itemId: 'blacksmiths-apron',
    name: 'Blacksmith\'s Apron',
    description: 'A heavy leather apron, stained with soot and sweat. It has numerous pockets for tools and provides some protection from the heat of the forge.',
    type: 'armor',
    rarity: 'uncommon',
    price: 500,
    sellPrice: 250,
    inShop: false, // Crafting recipe
    levelRequired: 10,
    icon: '🥼',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'craft', value: 10, description: '+10 Craft' },
      { type: 'special', value: 5, description: 'Reduces the material cost of blacksmithing recipes by 5%.' }
    ]
  },
  {
    itemId: 'jewelers-eyepiece',
    name: 'Jeweler\'s Eyepiece',
    description: 'A delicate monocle with multiple magnifying lenses. Essential for the intricate work of setting gems and engraving.',
    type: 'armor',
    rarity: 'rare',
    price: 1200,
    sellPrice: 600,
    inShop: false, // Crafting recipe
    levelRequired: 15,
    icon: '🧐',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'craft', value: 5, description: '+5 Craft' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' },
      { type: 'special', value: 10, description: '+10% chance to add an extra gem socket when crafting.' }
    ]
  },

  // ========================================
  // CRAFTING CONSUMABLES
  // ========================================
  {
    itemId: 'grindstone',
    name: 'Grindstone',
    description: 'A high-quality stone wheel for putting a razor-sharp edge on blades and tools. Crumbles after one use.',
    type: 'consumable',
    rarity: 'common',
    price: 100,
    sellPrice: 50,
    inShop: true,
    levelRequired: 5,
    icon: '⚙️',
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 10, description: '+10% quality for the next weapon crafting attempt.' }
    ]
  }
];
