/**
 * Gold Sink Items Database
 * Intermediate purchasable items for L5-15 to address gold accumulation
 *
 * Sprint 7: Mid-Game Content System
 * These items give new players meaningful purchases before L15 properties unlock
 */

import { IItem } from '../../models/Item.model';

export const goldSinkItems: Partial<IItem>[] = [
  // ========== MOUNTS (L5+) ==========
  {
    itemId: 'horse-upgrade-swift',
    name: 'Swift Mare',
    description: 'A speedy mare with excellent endurance. Faster than the standard workhorse you started with.',
    type: 'mount',
    rarity: 'uncommon',
    price: 500,
    sellPrice: 250,
    inShop: true,
    levelRequired: 5,
    icon: '🐴',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'mount',
    effects: [
      { type: 'travel_speed', value: 0.20, description: '+20% travel speed' }
    ],
    flavorText: 'She may not look like much, but she has heart.'
  },

  // ========== WEAPONS (L7+) ==========
  {
    itemId: 'quality-revolver',
    name: 'Quality Revolver',
    description: 'A well-crafted Colt revolver with improved accuracy. Better than standard issue.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 1500,
    sellPrice: 750,
    inShop: true,
    levelRequired: 7,
    icon: '🔫',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'weapon',
    stats: {
      combat: 3
    },
    effects: [
      { type: 'combat_score', value: 0.05, description: '+5% combat score' }
    ],
    flavorText: 'Handcrafted by a gunsmith who takes pride in his work.'
  },

  // ========== CLOTHING (L8+) ==========
  {
    itemId: 'fine-clothes',
    name: 'Fine Town Clothes',
    description: 'A tailored suit and polished boots. Makes a good impression in social situations.',
    type: 'armor',
    rarity: 'uncommon',
    price: 2000,
    sellPrice: 1000,
    inShop: true,
    levelRequired: 8,
    icon: '👔',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'body',
    stats: {
      spirit: 2
    },
    effects: [
      { type: 'social_success', value: 0.10, description: '+10% social success rate' }
    ],
    flavorText: 'Looking respectable opens doors that brute force cannot.'
  },

  // ========== TOOLS (L10+) ==========
  {
    itemId: 'professional-lockpicks',
    name: 'Professional Lockpick Set',
    description: 'A complete set of precision lockpicks made by a master safecracker. Includes torsion wrenches and rake picks.',
    type: 'tool',
    rarity: 'uncommon',
    price: 3000,
    sellPrice: 1500,
    inShop: true,
    levelRequired: 10,
    icon: '🔓',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'accessory',
    effects: [
      { type: 'crime_success', value: 0.15, description: '+15% crime success rate' }
    ],
    flavorText: 'The best tools for the worst deeds.'
  },

  // ========== CONSUMABLES (L12+) ==========
  {
    itemId: 'skill-manual',
    name: 'Advanced Skill Manual',
    description: 'A comprehensive training manual written by experts. Temporarily accelerates skill learning.',
    type: 'consumable',
    rarity: 'rare',
    price: 5000,
    sellPrice: 2500,
    inShop: true,
    levelRequired: 12,
    icon: '📚',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 5,
    effects: [
      { type: 'skill_training_speed', value: 0.50, description: '+50% skill training speed for 24 hours' }
    ],
    flavorText: 'Knowledge is power, and this knowledge was expensive.'
  },

  // ========== MOUNTS (L14+) ==========
  {
    itemId: 'premium-saddle',
    name: 'Premium Saddle',
    description: 'A reinforced leather saddle with silver trim. Improves riding comfort and control.',
    type: 'mount',
    rarity: 'rare',
    price: 7500,
    sellPrice: 3750,
    inShop: true,
    levelRequired: 14,
    icon: '🏇',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'mount',
    effects: [
      { type: 'travel_speed', value: 0.30, description: '+30% travel speed' },
      { type: 'ambush_chance', value: -0.10, description: '-10% chance of ambush while traveling' }
    ],
    flavorText: 'Worth every penny when bandits are on your trail.'
  },

  // ========== ADDITIONAL GOLD SINKS ==========
  {
    itemId: 'reinforced-holster',
    name: 'Reinforced Holster',
    description: 'A quick-draw holster with steel reinforcement. Allows faster weapon access in combat.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 1200,
    sellPrice: 600,
    inShop: true,
    levelRequired: 6,
    icon: '🔧',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'accessory',
    stats: {
      combat: 2
    },
    effects: [
      { type: 'initiative', value: 0.10, description: '+10% initiative in combat' }
    ],
    flavorText: 'Speed is life out here.'
  },

  {
    itemId: 'frontier-first-aid-kit',
    name: 'Frontier First Aid Kit',
    description: 'A leather satchel containing bandages, antiseptic, and basic medical supplies.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 800,
    sellPrice: 400,
    inShop: true,
    levelRequired: 5,
    icon: '🩹',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'health', value: 60, description: 'Restores 60 HP' },
      { type: 'special', value: 5, description: 'Removes bleeding status' }
    ],
    flavorText: 'Prevention is better than cure, but this helps too.'
  },

  {
    itemId: 'trail-rations-pack',
    name: 'Trail Rations Pack',
    description: 'A week\'s worth of preserved food for long journeys. Includes jerky, hardtack, and dried fruit.',
    type: 'consumable',
    rarity: 'common',
    price: 350,
    sellPrice: 175,
    inShop: true,
    levelRequired: 3,
    icon: '🍖',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'health', value: 30, description: 'Restores 30 HP' },
      { type: 'energy', value: 15, description: 'Restores 15 Energy' }
    ],
    flavorText: 'Not gourmet, but it keeps you alive.'
  },

  {
    itemId: 'sturdy-saddlebags',
    name: 'Sturdy Saddlebags',
    description: 'Reinforced leather saddlebags that increase carrying capacity.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 2500,
    sellPrice: 1250,
    inShop: true,
    levelRequired: 9,
    icon: '👜',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'accessory',
    effects: [
      { type: 'inventory_slots', value: 10, description: '+10 inventory slots' }
    ],
    flavorText: 'More room for loot.'
  },

  {
    itemId: 'gamblers-deck',
    name: "Gambler's Deck",
    description: 'A slightly marked deck of cards. Gives a subtle edge at the poker table.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 1800,
    sellPrice: 900,
    inShop: true,
    levelRequired: 11,
    icon: '🃏',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'accessory',
    effects: [
      { type: 'gambling', value: 0.10, description: '+10% gambling success' }
    ],
    flavorText: 'The house always wins. Now so do you.'
  },

  {
    itemId: 'desert-canteen',
    name: 'Large Desert Canteen',
    description: 'An oversized canteen that holds extra water for long desert crossings.',
    type: 'accessory',
    rarity: 'uncommon',
    price: 600,
    sellPrice: 300,
    inShop: true,
    levelRequired: 4,
    icon: '🫗',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'accessory',
    effects: [
      { type: 'energy_regen', value: 0.10, description: '+10% energy regeneration' }
    ],
    flavorText: 'Water is life in the desert.'
  }
];
