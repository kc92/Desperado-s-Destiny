/**
 * Support (Healer) Gear
 * Items for the Support/Healer combat role.
 */

import { IItem } from '../../models/Item.model';

export const supportGear: Partial<IItem>[] = [
  // ========================================
  // SUPPORT ACCESSORY
  // ========================================
  {
    itemId: 'doctors-bag',
    name: 'Doctor\'s Bag',
    description: 'A leather bag filled with bandages, salves, and surgical tools. Just carrying it makes you feel more proficient at patching up wounds.',
    type: 'armor',
    rarity: 'rare',
    price: 1500,
    sellPrice: 750,
    inShop: false, // Faction or quest reward
    levelRequired: 18,
    icon: '⚕️',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' },
      { type: 'stat', stat: 'craft', value: 5, description: '+5 Craft' },
      { type: 'special', value: 25, description: '+25% effectiveness of healing items on other players.' }
    ]
  },

  // ========================================
  // SUPPORT ARMOR
  // ========================================
  {
    itemId: 'field-surgeons-coat',
    name: 'Field Surgeon\'s Coat',
    description: 'A long, canvas coat with numerous inside pockets for medical supplies. Somehow, you never seem to run out of bandages.',
    type: 'armor',
    rarity: 'uncommon',
    price: 800,
    sellPrice: 400,
    inShop: true,
    levelRequired: 14,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 20, description: '+20 HP' },
      { type: 'special', value: 15, description: '15% chance to not consume a healing item on use.' }
    ]
  },

  // ========================================
  // SUPPORT CONSUMABLE
  // ========================================
  {
    itemId: 'adrenal-syringe',
    name: 'Adrenal Syringe',
    description: 'A syringe filled with a potent, unstable chemical cocktail. Provides a massive, temporary boost at a dangerous cost.',
    type: 'consumable',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: false, // Crafted only
    levelRequired: 20,
    icon: '💉',
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 1, description: 'Can be used on another player. Grants +20 Combat and +50 Energy for 1 minute.' },
      { type: 'special', value: 2, description: 'After the effect expires, the target loses 50% of their current health.' }
    ]
  }
];
