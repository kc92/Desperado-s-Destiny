/**
 * Gambling Gear
 * Items for the Gambling social system.
 */

import { IItem } from '../../models/Item.model';

export const gamblingGear: Partial<IItem>[] = [
  // ========================================
  // GAMBLING CONSUMABLE
  // ========================================
  {
    itemId: 'loaded-dice',
    name: 'Loaded Dice',
    description: 'A pair of dice, expertly weighted to favor certain numbers. Using them is cheating, and getting caught has serious consequences.',
    type: 'consumable',
    rarity: 'rare',
    price: 1000,
    sellPrice: 500,
    inShop: false, // Black market only
    levelRequired: 10,
    icon: '🎲',
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'special', value: 1, description: 'Consumed on use. Slightly increases odds of winning the next dice game.' },
      { type: 'special', value: 2, description: 'Has a 10% chance of being discovered, resulting in a fine and reputation loss.' }
    ]
  },

  // ========================================
  // GAMBLING ARMOR
  // ========================================
  {
    itemId: 'cardsharps-vest',
    name: 'Cardsharp\'s Vest',
    description: 'A gentleman\'s vest with hidden pockets inside for concealing cards. Requires a steady hand and a quick wrist.',
    type: 'armor',
    rarity: 'uncommon',
    price: 700,
    sellPrice: 350,
    inShop: false, // Black market only
    levelRequired: 12,
    icon: '🃏',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'cunning', value: 8, description: '+8 Cunning' },
      { type: 'special', value: 10, description: '+10% chance to successfully bluff in Poker.' }
    ]
  },
  {
    itemId: 'gentlemans-pocket-watch',
    name: 'Gentleman\'s Pocket Watch',
    description: 'An ornate gold pocket watch. It doesn\'t just tell time, it tells people you\'re a person of status and means.',
    type: 'armor',
    rarity: 'rare',
    price: 1500,
    sellPrice: 750,
    inShop: true,
    levelRequired: 15,
    icon: '🕰️',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit' },
      { type: 'special', value: 1, description: 'Unlocks access to high-stakes gambling tables.' }
    ]
  }
];
