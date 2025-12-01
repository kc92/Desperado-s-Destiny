/**
 * Native Tribes Gear
 * Items for the Native Tribes faction
 */

import { IItem } from '../../models/Item.model';

export const nativeGear: Partial<IItem>[] = [
  // ========================================
  // NATIVE ARMOR
  // ========================================
  {
    itemId: 'spirit-guides-headdress',
    name: 'Spirit Guide\'s Headdress',
    description: 'A sacred headdress adorned with eagle feathers and intricate beadwork. It is said to bridge the gap between the physical and spirit worlds.',
    type: 'armor',
    rarity: 'rare',
    price: 1300,
    sellPrice: 650,
    inShop: false, // Faction reward
    levelRequired: 16,
    icon: '🪶',
    equipSlot: 'head',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 12, description: '+12 Spirit' },
      { type: 'special', value: 15, description: '+15% resistance to spiritual damage' }
    ]
  },
  {
    itemId: 'hunters-garb',
    name: 'Hunter\'s Garb',
    description: 'Clothing made from deer and wolf hides, designed to blend seamlessly into the forest and plains.',
    type: 'armor',
    rarity: 'uncommon',
    price: 600,
    sellPrice: 300,
    inShop: false, // Faction reward
    levelRequired: 12,
    icon: '🐺',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'cunning', value: 8, description: '+8 Cunning' },
      { type: 'special', value: 15, description: '+15% stealth in natural environments' }
    ]
  },

  // ========================================
  // NATIVE WEAPONS & CONSUMABLES
  // ========================================
  {
    itemId: 'ceremonial-war-club',
    name: 'Ceremonial War Club',
    description: 'A heavy, carved club used in rituals and for defending tribal lands. It hits with the force of an angry ancestor.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 550,
    sellPrice: 275,
    inShop: false, // Faction reward
    levelRequired: 11,
    icon: '🪵',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'special', value: 10, description: '10% chance to stun on hit.' }
    ]
  },
  {
    itemId: 'bone-tipped-arrows',
    name: 'Bone-Tipped Arrows',
    description: 'A bundle of arrows tipped with sharpened bone. The enchantments laid upon them cause wounds that are slow to heal.',
    type: 'consumable',
    rarity: 'common',
    price: 150,
    sellPrice: 75,
    inShop: false, // Faction crafting
    levelRequired: 8,
    icon: '🏹',
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'special', value: 1, description: 'Applies a bleeding effect to your next 5 bow shots.' }
    ]
  }
];
