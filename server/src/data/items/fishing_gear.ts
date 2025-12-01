/**
 * Fishing Gear
 * Items for the Fishing profession
 */

import { IItem } from '../../models/Item.model';

export const fishingGear: Partial<IItem>[] = [
  // ========================================
  // FISHING TOOLS
  // ========================================
  {
    itemId: 'reinforced-fishing-rod',
    name: 'Reinforced Fishing Rod',
    description: 'A fishing rod made with a sturdy oak shaft and a reel forged from steel. It can handle the biggest monsters of the deep.',
    type: 'weapon', // Using 'weapon' as there is no 'tool' type
    rarity: 'uncommon',
    price: 600,
    sellPrice: 300,
    inShop: true,
    levelRequired: 10,
    icon: '🎣',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'craft', value: 8, description: '+8 Craft' },
      { type: 'special', value: 15, description: '+15% chance to attract larger and rarer fish' }
    ]
  },

  // ========================================
  // FISHING ARMOR
  // ========================================
  {
    itemId: 'fishermans-waders',
    name: "Fisherman's Waders",
    description: 'Tall, waterproof boots that reach the chest. They let you wade into deeper water to reach the best fishing spots.',
    type: 'armor',
    rarity: 'uncommon',
    price: 350,
    sellPrice: 175,
    inShop: true,
    levelRequired: 8,
    icon: '👖',
    equipSlot: 'feet',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 10, description: '+10 HP' },
      { type: 'special', value: 1, description: 'Allows access to deep water fishing spots.' }
    ]
  },

  // ========================================
  // FISHING CONSUMABLES
  // ========================================
  {
    itemId: 'river-lure',
    name: 'River Lure',
    description: 'A lure designed to mimic the insects and small fish found in rivers. More effective in flowing water.',
    type: 'consumable',
    rarity: 'common',
    price: 40,
    sellPrice: 20,
    inShop: true,
    levelRequired: 5,
    icon: '🦟',
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 20, description: '+20% chance to attract fish in rivers for 30 minutes.' }
    ]
  },
  {
    itemId: 'lake-lure',
    name: 'Lake Lure',
    description: 'A shiny, wobbling lure that works best in the still, deep waters of a lake.',
    type: 'consumable',
    rarity: 'common',
    price: 40,
    sellPrice: 20,
    inShop: true,
    levelRequired: 5,
    icon: '✨',
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'special', value: 20, description: '+20% chance to attract fish in lakes for 30 minutes.' }
    ]
  }
];
