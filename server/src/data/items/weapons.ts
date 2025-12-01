/**
 * Weapons Database
 * All weapons in Desperados Destiny
 * Balance Formula: PowerScore = (Damage * Accuracy) / 10
 */

import { IItem } from '../../models/Item.model';

export const weapons: Partial<IItem>[] = [
  // ========== REVOLVERS (COMMON) ==========
  {
    itemId: 'rusty-revolver',
    name: 'Rusty Revolver',
    description: 'A weathered six-shooter that\'s seen better days. Prone to jamming, but it shoots straight enough for close-range work.',
    type: 'weapon',
    rarity: 'common',
    price: 50,
    sellPrice: 25,
    inShop: true,
    levelRequired: 1,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' }
    ]
  },
  {
    itemId: 'peacemaker',
    name: 'Peacemaker',
    description: 'The classic frontier sidearm. Reliable, accurate, and deadly in the right hands.',
    type: 'weapon',
    rarity: 'common',
    price: 120,
    sellPrice: 60,
    inShop: true,
    levelRequired: 3,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' }
    ]
  },

  // ========== REVOLVERS (UNCOMMON) ==========
  {
    itemId: 'navy-issue',
    name: 'Navy Issue Revolver',
    description: 'Military-grade sidearm with superior craftsmanship. Favored by lawmen and ex-soldiers.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 300,
    sellPrice: 150,
    inShop: true,
    levelRequired: 8,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 12, description: '+12 Combat' },
      { type: 'special', value: 5, description: '+5% Critical Chance' }
    ]
  },
  {
    itemId: 'schofield-revolver',
    name: 'Schofield Revolver',
    description: 'Fast-loading top-break design. Quick on the draw, quicker to reload.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 350,
    sellPrice: 175,
    inShop: true,
    levelRequired: 10,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 13, description: '+13 Combat' },
      { type: 'stat', stat: 'cunning', value: 3, description: '+3 Cunning (Quick Draw)' }
    ]
  },

  // ========== REVOLVERS (RARE) ==========
  {
    itemId: 'volcanic-pistol',
    name: 'Volcanic Pistol',
    description: 'Experimental lever-action repeating pistol. High capacity, devastating firepower.',
    type: 'weapon',
    rarity: 'rare',
    price: 800,
    sellPrice: 400,
    inShop: true,
    levelRequired: 15,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 18, description: '+18 Combat' },
      { type: 'special', value: 10, description: '+10% Multi-Shot Chance' }
    ]
  },

  // ========== REVOLVERS (LEGENDARY) ==========
  {
    itemId: 'widowmaker',
    name: 'The Widowmaker',
    description: 'Custom-engraved revolver said to have claimed over a hundred souls. The hammer falls with the weight of destiny itself.',
    type: 'weapon',
    rarity: 'legendary',
    price: 5000,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 25,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 30, description: '+30 Combat' },
      { type: 'special', value: 20, description: '+20% Critical Chance' },
      { type: 'special', value: 15, description: '+15% Critical Damage' }
    ]
  },

  // ========== RIFLES (COMMON) ==========
  {
    itemId: 'varmint-rifle',
    name: 'Varmint Rifle',
    description: 'Small-caliber hunting rifle. Good for small game and target practice.',
    type: 'weapon',
    rarity: 'common',
    price: 80,
    sellPrice: 40,
    inShop: true,
    levelRequired: 1,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat' },
      { type: 'special', value: 10, description: '+10% Accuracy (Long Range)' }
    ]
  },
  {
    itemId: 'lever-action-rifle',
    name: 'Lever-Action Rifle',
    description: 'Classic frontier repeater. Fast cycling, moderate stopping power.',
    type: 'weapon',
    rarity: 'common',
    price: 150,
    sellPrice: 75,
    inShop: true,
    levelRequired: 4,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' }
    ]
  },

  // ========== RIFLES (UNCOMMON) ==========
  {
    itemId: 'springfield-rifle',
    name: 'Springfield Rifle',
    description: 'Military surplus single-shot rifle. Accurate and powerful, but slow to reload.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 280,
    sellPrice: 140,
    inShop: true,
    levelRequired: 7,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 14, description: '+14 Combat' },
      { type: 'special', value: 15, description: '+15% Accuracy' }
    ]
  },
  {
    itemId: 'repeating-carbine',
    name: 'Repeating Carbine',
    description: 'Compact repeating rifle favored by cavalry. Quick handling in close quarters.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 320,
    sellPrice: 160,
    inShop: true,
    levelRequired: 9,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 13, description: '+13 Combat' },
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning' }
    ]
  },

  // ========== RIFLES (RARE) ==========
  {
    itemId: 'buffalo-gun',
    name: 'Buffalo Gun',
    description: 'Heavy-caliber big game rifle. Can drop a buffalo at 300 yards - or a man at twice that.',
    type: 'weapon',
    rarity: 'rare',
    price: 900,
    sellPrice: 450,
    inShop: true,
    levelRequired: 16,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 22, description: '+22 Combat' },
      { type: 'special', value: 25, description: '+25% Damage vs Large Enemies' }
    ]
  },
  {
    itemId: 'rolling-block-rifle',
    name: 'Rolling Block Rifle',
    description: 'Precision long-range rifle. A marksman\'s dream.',
    type: 'weapon',
    rarity: 'rare',
    price: 850,
    sellPrice: 425,
    inShop: true,
    levelRequired: 14,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 19, description: '+19 Combat' },
      { type: 'special', value: 30, description: '+30% Critical Chance (Long Range)' }
    ]
  },

  // ========== SHOTGUNS (COMMON) ==========
  {
    itemId: 'double-barrel-shotgun',
    name: 'Double-Barrel Shotgun',
    description: 'Simple, brutal, effective. Two barrels of buckshot solve most problems at close range.',
    type: 'weapon',
    rarity: 'common',
    price: 100,
    sellPrice: 50,
    inShop: true,
    levelRequired: 2,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 9, description: '+9 Combat' },
      { type: 'special', value: 20, description: '+20% Damage (Close Range)' }
    ]
  },

  // ========== SHOTGUNS (UNCOMMON) ==========
  {
    itemId: 'pump-action-shotgun',
    name: 'Pump-Action Shotgun',
    description: 'Modern repeating shotgun. The distinctive slide-action strikes fear into hearts.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 400,
    sellPrice: 200,
    inShop: true,
    levelRequired: 11,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'special', value: 25, description: '+25% Damage (Close Range)' }
    ]
  },

  // ========== MELEE WEAPONS (COMMON) ==========
  {
    itemId: 'bowie-knife',
    name: 'Bowie Knife',
    description: 'Large fighting knife. A classic tool of the frontier, equally useful for skinning game or settling disputes.',
    type: 'weapon',
    rarity: 'common',
    price: 40,
    sellPrice: 20,
    inShop: true,
    levelRequired: 1,
    icon: '🔪',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 4, description: '+4 Combat' },
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning (Stealth Kill)' }
    ]
  },
  {
    itemId: 'tomahawk',
    name: 'Tomahawk',
    description: 'Native war axe. Can be thrown or used in close combat.',
    type: 'weapon',
    rarity: 'common',
    price: 60,
    sellPrice: 30,
    inShop: true,
    levelRequired: 2,
    icon: '🪓',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 6, description: '+6 Combat' },
      { type: 'special', value: 15, description: '+15% Chance to Throw' }
    ]
  },

  // ========== MELEE WEAPONS (UNCOMMON) ==========
  {
    itemId: 'cavalry-saber',
    name: 'Cavalry Saber',
    description: 'Military-issue sword. Gleaming steel and deadly grace.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 250,
    sellPrice: 125,
    inShop: true,
    levelRequired: 8,
    icon: '⚔️',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 11, description: '+11 Combat' },
      { type: 'special', value: 10, description: '+10% Parry Chance' }
    ]
  },
  {
    itemId: 'machete',
    name: 'Machete',
    description: 'Heavy brush-clearing blade. Crude but devastatingly effective in combat.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 180,
    sellPrice: 90,
    inShop: true,
    levelRequired: 6,
    icon: '🔪',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 10, description: '+10 Combat' },
      { type: 'special', value: 15, description: '+15% Bleed Damage' }
    ]
  },

  // ========== MELEE WEAPONS (RARE) ==========
  {
    itemId: 'officers-sword',
    name: 'Officer\'s Sword',
    description: 'Ceremonial blade carried by Confederate officers. Beautiful, deadly, and haunted by memories of a lost cause.',
    type: 'weapon',
    rarity: 'rare',
    price: 600,
    sellPrice: 300,
    inShop: true,
    levelRequired: 13,
    icon: '⚔️',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'stat', stat: 'combat', value: 16, description: '+16 Combat' },
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit (Duelist\'s Pride)' },
      { type: 'special', value: 15, description: '+15% Parry Chance' }
    ]
  }
];
