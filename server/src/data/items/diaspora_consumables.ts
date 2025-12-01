/**
 * Diaspora Consumables
 * Consumables specific to the Chinese Diaspora faction
 */

import { IItem } from '../../models/Item.model';

export const diasporaConsumables: Partial<IItem>[] = [
  // ========== RARE CONSUMABLE ==========
  {
    itemId: 'ginseng-root',
    name: 'Ginseng Root',
    description: 'A rare, potent root that boosts vitality and focus. Highly prized for its restorative properties.',
    type: 'consumable',
    rarity: 'rare',
    price: 250,
    sellPrice: 125,
    inShop: false, // Faction-specific item
    levelRequired: 10,
    icon: '🌿',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'health', value: 100, description: 'Restores 100 HP' },
      { type: 'energy', value: 30, description: 'Restores 30 Energy' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit for 1 hour' }
    ]
  },

  // ========== COMMON CONSUMABLE ==========
  {
    itemId: 'rice-wine',
    name: 'Rice Wine',
    description: 'A strong, clear spirit. A taste of home for some, a potent drink for all.',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: false, // Faction-specific item
    levelRequired: 1,
    icon: '🍶',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    effects: [
      { type: 'health', value: 25, description: 'Restores 25 HP' },
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit for 30 min' },
      { type: 'stat', stat: 'cunning', value: -1, description: '-1 Cunning for 30 min' }
    ]
  }
];
