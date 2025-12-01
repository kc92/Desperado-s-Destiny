/**
 * Armor Database
 * All armor and clothing in Desperados Destiny
 */

import { IItem } from '../../models/Item.model';

export const armor: Partial<IItem>[] = [
  // ========== HATS (HEAD SLOT) ==========
  {
    itemId: 'worn-hat',
    name: 'Worn Hat',
    description: 'A battered felt hat. Keeps the sun off, barely.',
    type: 'armor',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: true,
    levelRequired: 1,
    icon: '🎩',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 1, description: '+1 Spirit' }
    ]
  },
  {
    itemId: 'stetson',
    name: 'Stetson',
    description: 'Classic frontier hat. Wide-brimmed, weather-resistant, and stylish.',
    type: 'armor',
    rarity: 'common',
    price: 80,
    sellPrice: 40,
    inShop: true,
    levelRequired: 1,
    icon: '🤠',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit' },
      { type: 'special', value: 5, description: '+5% Heat Resistance' }
    ]
  },
  {
    itemId: 'cavalry-cap',
    name: 'Cavalry Cap',
    description: 'Military-issue kepi. Shows you\'ve served - or at least killed someone who did.',
    type: 'armor',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: true,
    levelRequired: 5,
    icon: '🎓',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' }
    ]
  },
  {
    itemId: 'lawman-hat',
    name: 'Lawman\'s Hat',
    description: 'Wide-brimmed marshal\'s hat. The badge helps, but the hat commands respect.',
    type: 'armor',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 100,
    inShop: true,
    levelRequired: 8,
    icon: '🤠',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 5, description: '+5 Spirit' },
      { type: 'special', value: 10, description: '+10% Reputation Gain (Law)' }
    ]
  },
  {
    itemId: 'desperado-hat',
    name: 'Desperado\'s Hat',
    description: 'Low-crowned, shadowy brimmed. The kind of hat that says "I\'ve got nothing to lose."',
    type: 'armor',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: true,
    levelRequired: 12,
    icon: '🎩',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'cunning', value: 6, description: '+6 Cunning' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'special', value: 10, description: '+10% Crime Success Rate' }
    ]
  },
  {
    itemId: 'buffalo-headdress',
    name: 'Buffalo Headdress',
    description: 'Sacred ceremonial headdress. Grants the wisdom and strength of the buffalo spirit.',
    type: 'armor',
    rarity: 'epic',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 18,
    icon: '👑',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'spirit', value: 12, description: '+12 Spirit' },
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'special', value: 15, description: '+15% Max HP' }
    ]
  },

  // ========== BODY ARMOR ==========
  {
    itemId: 'cotton-shirt',
    name: 'Cotton Shirt',
    description: 'Simple work shirt. Comfortable, but offers no protection.',
    type: 'armor',
    rarity: 'common',
    price: 15,
    sellPrice: 7,
    inShop: true,
    levelRequired: 1,
    icon: '👔',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 5, description: '+5 HP' }
    ]
  },
  {
    itemId: 'leather-vest',
    name: 'Leather Vest',
    description: 'Thick leather vest. Stops knives and claws, not much else.',
    type: 'armor',
    rarity: 'common',
    price: 60,
    sellPrice: 30,
    inShop: true,
    levelRequired: 1,
    icon: '🦺',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 10, description: '+10 HP' },
      { type: 'special', value: 5, description: '+5% Physical Resistance' }
    ]
  },
  {
    itemId: 'duster-coat',
    name: 'Duster Coat',
    description: 'Long canvas coat. Classic outlaw wear - protects from dust, wind, and prying eyes.',
    type: 'armor',
    rarity: 'uncommon',
    price: 180,
    sellPrice: 90,
    inShop: true,
    levelRequired: 4,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 15, description: '+15 HP' },
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning' },
      { type: 'special', value: 10, description: '+10% Cold Resistance' }
    ]
  },
  {
    itemId: 'cavalry-jacket',
    name: 'Cavalry Jacket',
    description: 'Military-issue wool jacket. Reinforced shoulders, brass buttons.',
    type: 'armor',
    rarity: 'uncommon',
    price: 220,
    sellPrice: 110,
    inShop: true,
    levelRequired: 6,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 18, description: '+18 HP' },
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat' }
    ]
  },
  {
    itemId: 'reinforced-vest',
    name: 'Reinforced Leather Vest',
    description: 'Heavy leather with metal studs. Practical protection without sacrificing mobility.',
    type: 'armor',
    rarity: 'uncommon',
    price: 250,
    sellPrice: 125,
    inShop: true,
    levelRequired: 7,
    icon: '🦺',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 20, description: '+20 HP' },
      { type: 'special', value: 10, description: '+10% Physical Resistance' }
    ]
  },
  {
    itemId: 'buffalo-hide-coat',
    name: 'Buffalo Hide Coat',
    description: 'Massive coat made from buffalo hide. Warm, tough, and imposing.',
    type: 'armor',
    rarity: 'rare',
    price: 500,
    sellPrice: 250,
    inShop: true,
    levelRequired: 11,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 30, description: '+30 HP' },
      { type: 'special', value: 15, description: '+15% Physical Resistance' },
      { type: 'special', value: 20, description: '+20% Cold Resistance' }
    ]
  },
  {
    itemId: 'ballistic-vest',
    name: 'Experimental Ballistic Vest',
    description: 'Prototype armor using layers of silk and steel plate. Expensive, rare, and potentially life-saving.',
    type: 'armor',
    rarity: 'epic',
    price: 2000,
    sellPrice: 1000,
    inShop: false,
    levelRequired: 20,
    icon: '🦺',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 50, description: '+50 HP' },
      { type: 'special', value: 25, description: '+25% Bullet Resistance' },
      { type: 'special', value: 15, description: '+15% Physical Resistance' }
    ]
  },
  {
    itemId: 'ghost-dancer-robe',
    name: 'Ghost Dancer\'s Robe',
    description: 'Sacred ceremonial robe worn in the Ghost Dance. Said to make the wearer untouchable by bullets.',
    type: 'armor',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 25,
    icon: '👘',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 40, description: '+40 HP' },
      { type: 'stat', stat: 'spirit', value: 15, description: '+15 Spirit' },
      { type: 'special', value: 20, description: '+20% Dodge Chance' },
      { type: 'special', value: 30, description: '+30% Spiritual Resistance' }
    ]
  },

  // ========== BOOTS (FEET SLOT) ==========
  {
    itemId: 'worn-boots',
    name: 'Worn Boots',
    description: 'Scuffed leather boots. They\'ve walked many miles.',
    type: 'armor',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: true,
    levelRequired: 1,
    icon: '👢',
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 5, description: '+5 HP' }
    ]
  },
  {
    itemId: 'riding-boots',
    name: 'Riding Boots',
    description: 'Sturdy boots with spurs. Made for long days in the saddle.',
    type: 'armor',
    rarity: 'common',
    price: 70,
    sellPrice: 35,
    inShop: true,
    levelRequired: 2,
    icon: '👢',
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 8, description: '+8 HP' },
      { type: 'special', value: 5, description: '+5% Mount Speed' }
    ]
  },
  {
    itemId: 'cavalry-boots',
    name: 'Cavalry Boots',
    description: 'Military-issue riding boots. Polished leather, reinforced heels.',
    type: 'armor',
    rarity: 'uncommon',
    price: 160,
    sellPrice: 80,
    inShop: true,
    levelRequired: 5,
    icon: '👢',
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 12, description: '+12 HP' },
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat (Mounted)' }
    ]
  },
  {
    itemId: 'snakeskin-boots',
    name: 'Snakeskin Boots',
    description: 'Exotic boots made from rattlesnake hide. Flashy and functional.',
    type: 'armor',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: true,
    levelRequired: 10,
    icon: '👢',
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 18, description: '+18 HP' },
      { type: 'stat', stat: 'cunning', value: 4, description: '+4 Cunning' },
      { type: 'special', value: 15, description: '+15% Poison Resistance' }
    ]
  },
  {
    itemId: 'moccasins',
    name: 'Hand-Crafted Moccasins',
    description: 'Traditional native footwear. Silent as a ghost, comfortable as a dream.',
    type: 'armor',
    rarity: 'uncommon',
    price: 140,
    sellPrice: 70,
    inShop: true,
    levelRequired: 4,
    icon: '👞',
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'hp', value: 10, description: '+10 HP' },
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning (Stealth)' }
    ]
  }
];
