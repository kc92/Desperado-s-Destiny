/**
 * Control/Debuffer Gear
 * Items for the Control/Debuffer combat role.
 */

import { IItem } from '../../models/Item.model';

export const debufferGear: Partial<IItem>[] = [
  // ========================================
  // DEBUFFER CONSUMABLES
  // ========================================
  {
    itemId: 'vipers-kiss-darts',
    name: 'Viper\'s Kiss Darts',
    description: 'A set of small, easily concealed darts coated in a fast-acting neurotoxin. They don\'t do much damage on their own, but the poison is debilitating.',
    type: 'consumable',
    rarity: 'rare',
    price: 600,
    sellPrice: 300,
    inShop: false, // Crafted only
    levelRequired: 22,
    icon: '🎯',
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 1, description: 'Thrown weapon. Applies \'Viper\'s Kiss\' to the target, reducing their Combat and Cunning by 15 for 1 minute.' }
    ]
  },
  {
    itemId: 'smoke-bombs',
    name: 'Smoke Bombs',
    description: 'A clay pot filled with a chemical mixture that produces a thick cloud of smoke when shattered.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 100,
    inShop: true,
    levelRequired: 12,
    icon: '💨',
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 1, description: 'Creates a smoke cloud for 30 seconds, reducing the accuracy of all characters within it by 25%.' }
    ]
  },

  // ========================================
  // DEBUFFER ARMOR
  // ========================================
  {
    itemId: 'plague-doctors-mask',
    name: 'Plague Doctor\'s Mask',
    description: 'A strange, beaked mask filled with aromatic herbs. While its medical efficacy is questionable, it provides an unsettling appearance and some protection from toxins.',
    type: 'armor',
    rarity: 'rare',
    price: 1800,
    sellPrice: 900,
    inShop: false, // Quest reward
    levelRequired: 20,
    icon: '👺',
    equipSlot: 'head',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'special', value: 25, description: '+25% resistance to poison and disease debuffs.' },
      { type: 'special', value: 10, description: 'Increases the duration of debuffs you apply by 10%.' }
    ]
  }
];
