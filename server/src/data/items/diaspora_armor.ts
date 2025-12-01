/**
 * Diaspora Armor
 * Armor and clothing specific to the Chinese Diaspora faction
 */

import { IItem } from '../../models/Item.model';

export const diasporaArmor: Partial<IItem>[] = [
  // ========== BODY (UNCOMMON) ==========
  {
    itemId: 'silk-tunic',
    name: 'Silk Tunic',
    description: 'An embroidered silk tunic. Not much for protection, but it is lightweight and allows for fluid movement.',
    type: 'armor',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false, // Faction-specific item
    levelRequired: 4,
    icon: '👘',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 10, description: '+10 HP' },
      { type: 'stat', stat: 'cunning', value: 4, description: '+4 Cunning' },
      { type: 'special', value: 5, description: '+5% Dodge Chance' }
    ]
  },

  // ========== FEET (COMMON) ==========
  {
    itemId: 'steel-toed-work-boots',
    name: 'Steel-Toed Work Boots',
    description: 'Heavy leather boots with a hidden steel cap. For long days of hard labor, and for crushing the foot of an unsuspecting foe.',
    type: 'armor',
    rarity: 'common',
    price: 80,
    sellPrice: 40,
    inShop: false, // Faction-specific item
    levelRequired: 2,
    icon: '👢',
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 10, description: '+10 HP' },
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat' }
    ]
  }
];
