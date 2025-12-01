/**
 * Diaspora Weapons
 * Weapons specific to the Chinese Diaspora faction
 */

import { IItem } from '../../models/Item.model';

export const diasporaWeapons: Partial<IItem>[] = [
  // ========== MELEE WEAPONS (UNCOMMON) ==========
  {
    itemId: 'meteor-hammer',
    name: 'Meteor Hammer',
    description: 'A flexible weapon with two weights at either end. Used to trip, disarm, and bludgeon. Requires significant skill to wield effectively.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 280,
    sellPrice: 140,
    inShop: false, // Faction-specific item
    levelRequired: 7,
    icon: '⛓️',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' },
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'special', value: 10, description: '+10% Chance to Disarm opponent' }
    ]
  },

  // ========== MELEE WEAPONS (COMMON) ==========
  {
    itemId: 'repurposed-farming-tool',
    name: 'Repurposed Farming Tool',
    description: 'A sturdy hoe or sickle, sharpened and reinforced for a fight. A weapon of necessity.',
    type: 'weapon',
    rarity: 'common',
    price: 30,
    sellPrice: 15,
    inShop: false,
    levelRequired: 1,
    icon: '⛏️',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat' },
      { type: 'stat', stat: 'craft', value: 1, description: '+1 Craft' }
    ]
  }
];
