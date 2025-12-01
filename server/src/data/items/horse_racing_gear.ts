/**
 * Horse Racing Gear
 * Items for the Horse Racing social system.
 */

import { IItem } from '../../models/Item.model';

export const horseRacingGear: Partial<IItem>[] = [
  // ========================================
  // HORSE RACING ARMOR/ACCESSORIES
  // ========================================
  {
    itemId: 'lightweight-racing-saddle',
    name: 'Lightweight Racing Saddle',
    description: 'A minimalist saddle built for speed, not comfort. It reduces weight and allows the horse more freedom of movement.',
    type: 'armor',
    rarity: 'uncommon',
    price: 800,
    sellPrice: 400,
    inShop: true,
    levelRequired: 10,
    icon: '🏇',
    equipSlot: 'accessory', // Using accessory as a proxy for 'saddle'
    isEquippable: true,
    effects: [
      { type: 'special', value: 10, description: '+10% mount speed during races.' }
    ]
  },
  {
    itemId: 'jockeys-silks',
    name: 'Jockey\'s Silks',
    description: 'A colorful, lightweight silk shirt. Wearing it makes both you and your horse feel a little faster.',
    type: 'armor',
    rarity: 'uncommon',
    price: 500,
    sellPrice: 250,
    inShop: true,
    levelRequired: 10,
    icon: '👕',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'special', value: 5, description: '+5% mount stamina during races.' }
    ]
  },

  // ========================================
  // HORSE RACING CONSUMABLE
  // ========================================
  {
    itemId: 'triple-crown-oats',
    name: '"Triple Crown" Oats',
    description: 'A bag of specially treated oats, mixed with stimulants and secret ingredients. Provides a powerful, temporary boost to a horse\'s performance.',
    type: 'consumable',
    rarity: 'rare',
    price: 750,
    sellPrice: 375,
    inShop: false, // Reward from racing
    levelRequired: 15,
    icon: '🌾',
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 1, description: 'Feed to your horse before a race to grant +20% speed for 30 seconds.' }
    ]
  }
];
