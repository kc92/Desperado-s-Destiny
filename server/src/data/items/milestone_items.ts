/**
 * Milestone Items Database
 * Unique items awarded at level milestones
 *
 * Sprint 7: Mid-Game Content System
 * These items are NOT purchasable - only earned through milestones
 */

import { IItem } from '../../models/Item.model';

export const milestoneItems: Partial<IItem>[] = [
  // ========== LEVEL 20 - BOUNTY HUNTER ==========
  {
    itemId: 'bounty-hunters-spyglass',
    name: "Bounty Hunter's Spyglass",
    description: 'A brass telescope etched with wanted posters. Increases tracking ability and reveals bounty locations on the map.',
    type: 'accessory',
    rarity: 'rare',
    price: 0,         // Not for sale
    sellPrice: 500,
    inShop: false,
    levelRequired: 20,
    icon: '🔭',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% Bounty tracking speed' },
      { type: 'special', value: 10, description: '+10% Bounty reward bonus' }
    ],
    flavorText: 'The marshal only gives these to hunters he trusts.',
    milestoneLevel: 20
  },

  // ========== LEVEL 25 - PROSPECTOR ==========
  {
    itemId: 'mining-claim-deed',
    name: 'Mining Claim Deed',
    description: 'Official documentation granting you the right to stake one free mining claim. This deed cannot be forged.',
    type: 'consumable',
    rarity: 'rare',
    price: 0,
    sellPrice: 1000,
    inShop: false,
    levelRequired: 25,
    icon: '📜',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 3,
    effects: [
      { type: 'special', value: 5000, description: 'Free Tier 1 mining claim stake' }
    ],
    flavorText: 'Signed by the territorial surveyor himself.',
    milestoneLevel: 25
  },

  // ========== LEVEL 30 - TRAIL BOSS ==========
  {
    itemId: 'ranchers-lasso',
    name: "Rancher's Lasso",
    description: 'A well-worn lasso blessed by a priest in Tombstone. Cattle seem to follow your lead more willingly.',
    type: 'weapon',
    rarity: 'rare',
    price: 0,
    sellPrice: 1500,
    inShop: false,
    levelRequired: 30,
    icon: '🪢',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'accessory',
    effects: [
      { type: 'special', value: 15, description: '+15% Cattle drive success rate' },
      { type: 'special', value: 10, description: '-10% Cattle lost to events' }
    ],
    flavorText: 'The leather has absorbed decades of trail dust.',
    milestoneLevel: 30
  },

  // ========== LEVEL 35 - THE FIXER ==========
  {
    itemId: 'fixers-coat',
    name: "Fixer's Coat",
    description: 'A long black duster with hidden pockets and reinforced lining. Worn by those who solve problems.',
    type: 'armor',
    rarity: 'epic',
    price: 0,
    sellPrice: 2500,
    inShop: false,
    levelRequired: 35,
    icon: '🧥',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'body',
    stats: {
      cunning: 5,
      spirit: 3
    },
    effects: [
      { type: 'special', value: 15, description: '+15% Contract reward bonus' },
      { type: 'special', value: 10, description: '+10% Crime success rate' }
    ],
    flavorText: 'The lining is stained with secrets.',
    milestoneLevel: 35
  },

  // ========== LEVEL 40 - VIP ==========
  {
    itemId: 'vip-saloon-key',
    name: 'VIP Saloon Key',
    description: 'A golden key granting access to exclusive back rooms in every saloon across the frontier.',
    type: 'accessory',
    rarity: 'epic',
    price: 0,
    sellPrice: 5000,
    inShop: false,
    levelRequired: 40,
    icon: '🗝️',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '+20% Social success rate' },
      { type: 'special', value: 15, description: '+15% Gambling winnings' },
      { type: 'special', value: 10, description: '+10% Shop discounts' }
    ],
    flavorText: 'Doors open for those who carry this key.',
    milestoneLevel: 40
  },

  // ========== LEVEL 45 - SCAR WALKER ==========
  {
    itemId: 'scar-expedition-map',
    name: 'Scar Expedition Map',
    description: 'A hand-drawn map showing safe passages through the corrupted Scar zones. The ink seems to pulse with dark energy.',
    type: 'accessory',
    rarity: 'epic',
    price: 0,
    sellPrice: 7500,
    inShop: false,
    levelRequired: 45,
    icon: '🗺️',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    effects: [
      { type: 'special', value: 20, description: '-20% Corruption gain in Scar zones' },
      { type: 'special', value: 10, description: '+10% Scar zone loot quality' },
      { type: 'special', value: 5, description: '+5% Combat damage in Scar zones' }
    ],
    flavorText: 'Those who drew this map never returned.',
    milestoneLevel: 45
  },

  // ========== LEVEL 50 - LEGEND ==========
  {
    itemId: 'legendary-duster',
    name: 'Legendary Duster',
    description: 'A coat worn by the greatest outlaws and lawmen of the Old West. The fabric seems to shimmer with destiny.',
    type: 'armor',
    rarity: 'legendary',
    price: 0,
    sellPrice: 15000,
    inShop: false,
    levelRequired: 50,
    icon: '✨',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    equipSlot: 'body',
    stats: {
      cunning: 5,
      spirit: 5,
      combat: 5,
      craft: 5
    },
    effects: [
      { type: 'special', value: 5, description: '+5% to all stats' },
      { type: 'special', value: 10, description: '+10% XP gain' },
      { type: 'special', value: 10, description: '+10% Gold find' }
    ],
    flavorText: 'They will write songs about you.',
    milestoneLevel: 50
  }
];
