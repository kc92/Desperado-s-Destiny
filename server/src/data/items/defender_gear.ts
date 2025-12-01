/**
 * Defender (Tank) Gear
 * Items for the Tank/Defender combat role.
 */

import { IItem } from '../../models/Item.model';

export const defenderGear: Partial<IItem>[] = [
  // ========================================
  // DEFENDER WEAPON (SHIELD)
  // ========================================
  {
    itemId: 'bulwarks-shield',
    name: 'Bulwark\'s Shield',
    description: 'A massive, heavy shield made of iron-banded oak. It\'s more of a portable wall than a weapon, but nothing is getting past it.',
    type: 'weapon',
    rarity: 'rare',
    price: 1800,
    sellPrice: 900,
    inShop: false, // Faction reward / Boss drop
    levelRequired: 20,
    icon: '🛡️',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 100, description: '+100 HP' },
      { type: 'special', value: 20, description: '+20% Physical Resistance' },
      { type: 'special', value: 50, description: 'Generates a high amount of threat when struck.' },
      { type: 'stat', stat: 'combat', value: -10, description: '-10 Combat (Unwieldy)' }
    ]
  },

  // ========================================
  // DEFENDER ARMOR
  // ========================================
  {
    itemId: 'aegis-heavy-armor',
    name: 'Aegis Heavy Armor',
    description: 'Forged plate armor so thick it can stop a buffalo rifle round. What it lacks in mobility, it makes up for in sheer resilience.',
    type: 'armor',
    rarity: 'rare',
    price: 2200,
    sellPrice: 1100,
    inShop: false, // Faction reward / Boss drop
    levelRequired: 22,
    icon: '🥋',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 150, description: '+150 HP' },
      { type: 'special', value: 10, description: 'Redirects 10% of damage taken by nearby allies to yourself.' }
    ]
  },

  // ========================================
  // DEFENDER CONSUMABLE
  // ========================================
  {
    itemId: 'challenging-horn',
    name: 'Challenging Horn',
    description: 'A war horn that emits a deep, resonant blast. All nearby enemies will be enraged and focus their attacks on you.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: true,
    levelRequired: 15,
    icon: '📯',
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 1, description: 'Taunts all enemies in a small radius, forcing them to attack you for 15 seconds.' }
    ]
  }
];
