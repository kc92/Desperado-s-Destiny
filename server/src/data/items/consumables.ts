/**
 * Consumables Database
 * Healing items, buffs, and temporary effect items
 */

import { IItem } from '../../models/Item.model';

export const consumables: Partial<IItem>[] = [
  // ========== HEALING ITEMS ==========
  {
    itemId: 'snake-oil',
    name: 'Snake Oil',
    description: 'Dubious tonic sold by traveling merchants. Tastes awful, but it does something.',
    type: 'consumable',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: true,
    levelRequired: 1,
    icon: '🧪',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'health', value: 20, description: 'Restores 20 HP' }
    ]
  },
  {
    itemId: 'whiskey',
    name: 'Whiskey',
    description: 'Frontier medicine in a bottle. Burns going down, but dulls the pain.',
    type: 'consumable',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: true,
    levelRequired: 1,
    icon: '🥃',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'health', value: 30, description: 'Restores 30 HP' },
      { type: 'special', value: -2, description: '-2 Accuracy for 1 hour' }
    ]
  },
  {
    itemId: 'bandages',
    name: 'Bandages',
    description: 'Clean cloth bandages. Basic but effective field medicine.',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: true,
    levelRequired: 1,
    icon: '🩹',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'health', value: 40, description: 'Restores 40 HP' }
    ]
  },
  {
    itemId: 'medicine',
    name: 'Medicine',
    description: 'Proper pharmaceutical medicine from back East. Expensive but reliable.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 80,
    sellPrice: 40,
    inShop: true,
    levelRequired: 5,
    icon: '💊',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'health', value: 75, description: 'Restores 75 HP' }
    ]
  },
  {
    itemId: 'health-cure',
    name: 'Health Cure',
    description: 'Premium tonic from a reputable apothecary. Guaranteed effective or your money back.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: true,
    levelRequired: 8,
    icon: '🧪',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'health', value: 100, description: 'Restores 100 HP' }
    ]
  },
  {
    itemId: 'miracle-tonic',
    name: 'Miracle Tonic',
    description: 'A rare and potent concoction. Rumored to contain ingredients from the Old World.',
    type: 'consumable',
    rarity: 'rare',
    price: 300,
    sellPrice: 150,
    inShop: true,
    levelRequired: 12,
    icon: '🧪',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'health', value: 200, description: 'Restores 200 HP' },
      { type: 'special', value: 10, description: '+10% Max HP for 1 hour' }
    ]
  },

  // ========== ENERGY ITEMS ==========
  {
    itemId: 'coffee',
    name: 'Coffee',
    description: 'Strong frontier coffee. Black as night, hot as hell.',
    type: 'consumable',
    rarity: 'common',
    price: 10,
    sellPrice: 5,
    inShop: true,
    levelRequired: 1,
    icon: '☕',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'energy', value: 10, description: 'Restores 10 Energy' }
    ]
  },
  {
    itemId: 'coca-wine',
    name: 'Coca Wine',
    description: 'Medicinal wine infused with coca leaves. Highly stimulating.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 50,
    sellPrice: 25,
    inShop: true,
    levelRequired: 5,
    icon: '🍷',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'energy', value: 20, description: 'Restores 20 Energy' },
      { type: 'special', value: 5, description: '+5% Action Speed for 30 min' }
    ]
  },
  {
    itemId: 'peyote',
    name: 'Peyote',
    description: 'Sacred cactus used in native ceremonies. Opens the mind... and other things.',
    type: 'consumable',
    rarity: 'rare',
    price: 150,
    sellPrice: 75,
    inShop: false,
    levelRequired: 10,
    icon: '🌵',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'energy', value: 30, description: 'Restores 30 Energy' },
      { type: 'stat', stat: 'spirit', value: 10, description: '+10 Spirit for 1 hour' },
      { type: 'special', value: -5, description: 'Vision Quest: Random hallucination' }
    ]
  },

  // ========== FOOD ==========
  {
    itemId: 'jerky',
    name: 'Beef Jerky',
    description: 'Dried, salted meat. Tough as leather but it keeps forever.',
    type: 'consumable',
    rarity: 'common',
    price: 8,
    sellPrice: 4,
    inShop: true,
    levelRequired: 1,
    icon: '🥩',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'health', value: 15, description: 'Restores 15 HP' },
      { type: 'energy', value: 5, description: 'Restores 5 Energy' }
    ]
  },
  {
    itemId: 'canned-beans',
    name: 'Canned Beans',
    description: 'Tinned beans from the general store. Not fancy, but filling.',
    type: 'consumable',
    rarity: 'common',
    price: 12,
    sellPrice: 6,
    inShop: true,
    levelRequired: 1,
    icon: '🥫',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'health', value: 25, description: 'Restores 25 HP' },
      { type: 'energy', value: 8, description: 'Restores 8 Energy' }
    ]
  },
  {
    itemId: 'stew',
    name: 'Hearty Stew',
    description: 'Hot bowl of meat and vegetables. Comfort in a bowl.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 35,
    sellPrice: 17,
    inShop: true,
    levelRequired: 1,
    icon: '🍲',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'health', value: 50, description: 'Restores 50 HP' },
      { type: 'energy', value: 15, description: 'Restores 15 Energy' },
      { type: 'special', value: 5, description: '+5% HP Regen for 1 hour' }
    ]
  },

  // ========== BUFF ITEMS ==========
  {
    itemId: 'cigarette',
    name: 'Cigarette',
    description: 'Hand-rolled tobacco. Calms the nerves.',
    type: 'consumable',
    rarity: 'common',
    price: 5,
    sellPrice: 2,
    inShop: true,
    levelRequired: 1,
    icon: '🚬',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit for 30 min' }
    ]
  },
  {
    itemId: 'cigar',
    name: 'Premium Cigar',
    description: 'Fine Cuban cigar. A luxury item in the frontier.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 25,
    sellPrice: 12,
    inShop: true,
    levelRequired: 5,
    icon: '🚬',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit for 1 hour' },
      { type: 'special', value: 10, description: '+10% Charisma' }
    ]
  },
  {
    itemId: 'lucky-charm',
    name: 'Lucky Charm',
    description: 'A rabbit\'s foot, four-leaf clover, or other trinket. Probably doesn\'t work, but you feel luckier.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 40,
    sellPrice: 20,
    inShop: true,
    levelRequired: 1,
    icon: '🍀',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'special', value: 10, description: '+10% Critical Chance for 1 hour' }
    ]
  },
  {
    itemId: 'war-paint',
    name: 'War Paint',
    description: 'Traditional native war paint. Strikes fear into enemies and courage into allies.',
    type: 'consumable',
    rarity: 'rare',
    price: 100,
    sellPrice: 50,
    inShop: false,
    levelRequired: 8,
    icon: '🎨',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat for 2 hours' },
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit for 2 hours' },
      { type: 'special', value: 15, description: '+15% Intimidation' }
    ]
  },
  {
    itemId: 'laudanum',
    name: 'Laudanum',
    description: 'Opium tincture. Dulls all pain... and all sensation. Use with caution.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 60,
    sellPrice: 30,
    inShop: true,
    levelRequired: 6,
    icon: '💉',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    effects: [
      { type: 'health', value: 60, description: 'Restores 60 HP' },
      { type: 'stat', stat: 'combat', value: -5, description: '-5 Combat for 1 hour' },
      { type: 'stat', stat: 'cunning', value: -5, description: '-5 Cunning for 1 hour' }
    ]
  }
];
