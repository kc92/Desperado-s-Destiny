/**
 * Grit of the Frontier Gear
 * Items for the iconic archetypes of the West
 */

import { IItem } from '../../models/Item.model';

export const frontierGear: Partial<IItem>[] = [
  // ========================================
  // PROSPECTOR'S GEAR (MINING FOCUS)
  // ========================================
  {
    itemId: 'geologists-loupe',
    name: 'Geologist\'s Loupe',
    description: 'A high-quality magnifying glass, essential for identifying promising mineral veins. Increases the chance of finding rare gems.',
    type: 'armor',
    rarity: 'uncommon',
    price: 450,
    sellPrice: 225,
    inShop: true,
    levelRequired: 8,
    icon: '🧐',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'craft', value: 5, description: '+5 Craft' },
      { type: 'special', value: 10, description: '+10% chance to find rare gems while mining' }
    ]
  },
  {
    itemId: 'reinforced-mining-helmet',
    name: 'Reinforced Mining Helmet',
    description: 'A sturdy helmet with a metal plate bolted to the front. It might just save your skull from a falling rock.',
    type: 'armor',
    rarity: 'uncommon',
    price: 320,
    sellPrice: 160,
    inShop: true,
    levelRequired: 8,
    icon: '⛑️',
    equipSlot: 'head',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 15, description: '+15 HP' },
      { type: 'special', value: 5, description: '+5% Physical Resistance' },
      { type: 'special', value: 20, description: '20% chance to ignore damage from mine collapses' }
    ]
  },
  {
    itemId: 'canteen-of-special-water',
    name: 'Canteen of \'Special\' Water',
    description: 'The label is mostly peeled off, but it smells faintly of ozone and regret. Restores a significant amount of energy, but leaves you feeling... wobbly.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 60,
    sellPrice: 30,
    inShop: true,
    levelRequired: 8,
    icon: '💧',
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    effects: [
      { type: 'energy', value: 50, description: 'Restores 50 Energy' },
      { type: 'stat', stat: 'cunning', value: -5, description: '-5 Cunning for 15 minutes (Dizziness)' }
    ]
  },

  // ========================================
  // LAWMAN'S EQUIPMENT (DEFENSE & AUTHORITY)
  // ========================================
  {
    itemId: 'heavy-badge-of-authority',
    name: 'Heavy Badge of Authority',
    description: 'An impressively large and shiny badge. It carries the weight of the law, inspiring allies and intimidating foes.',
    type: 'armor',
    rarity: 'rare',
    price: 1200,
    sellPrice: 600,
    inShop: false, // Faction reward
    levelRequired: 12,
    icon: '🛡️',
    equipSlot: 'accessory',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'spirit', value: 8, description: '+8 Spirit' },
      { type: 'special', value: 5, description: '+5% damage resistance from Outlaw enemies' },
      { type: 'special', value: 10, description: '10% chance for low-level Outlaws to flee at the start of combat' }
    ]
  },
  {
    itemId: 'standard-issue-repeater',
    name: 'Standard Issue Repeater',
    description: 'A reliable and sturdy repeating rifle issued to lawmen across the territory. Unremarkable on its own, but devastating in a posse.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 380,
    sellPrice: 190,
    inShop: false, // Faction reward
    levelRequired: 10,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 14, description: '+14 Combat' },
      { type: 'special', value: 5, description: '+5% damage for each other friendly Lawman in the fight (max +15%)' }
    ]
  },

  // ========================================
  // BOUNTY HUNTER'S TOOLS (TRACKING & COMBAT)
  // ========================================
  {
    itemId: 'tracking-bolas',
    name: 'Tracking Bolas',
    description: 'Weighted ropes designed to entangle the legs of a fleeing target. Deals minimal damage but is excellent for capturing bounties alive.',
    type: 'weapon',
    rarity: 'uncommon',
    price: 250,
    sellPrice: 125,
    inShop: true,
    levelRequired: 6,
    icon: '🪢',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat' },
      { type: 'special', value: 1, description: 'On hit, has a high chance to immobilize the target for 1 turn.' }
    ]
  },
  {
    itemId: 'notched-duster',
    name: 'Notched Duster',
    description: 'A rugged duster with a growing number of notches on the leather collar. Each one tells a story of a bounty brought to justice.',
    type: 'armor',
    rarity: 'rare',
    price: 1500,
    sellPrice: 750,
    inShop: false, // Reputation reward
    levelRequired: 15,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 25, description: '+25 HP' },
      { type: 'special', value: 1, description: '+1 Combat for every 5 bounties turned in (max +10)' }
    ]
  },
  {
    itemId: 'manacles',
    name: 'Manacles',
    description: 'Heavy iron cuffs. Necessary for bringing in a bounty alive and claiming the full reward.',
    type: 'quest',
    rarity: 'uncommon',
    price: 100,
    sellPrice: 50,
    inShop: true,
    levelRequired: 1,
    icon: '⛓️',
    isConsumable: true,
    isStackable: true,
    maxStack: 10,
    effects: [
      { type: 'special', value: 1, description: 'Allows capture of a bounty with less than 10% health. Consumed on use.' }
    ]
  },

  // ========================================
  // UNIQUE FRONTIER ITEMS
  // ========================================
  {
    itemId: 'one-eyes-revenge',
    name: 'One-Eye\'s Revenge',
    description: 'The personal, pearl-handled revolver of "One-Eyed" Jack. It seems to have a thirst for vengeance.',
    type: 'weapon',
    rarity: 'rare',
    price: 1000,
    sellPrice: 500,
    inShop: false, // Unique drop
    levelRequired: 7,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 15, description: '+15 Combat' },
      { type: 'special', value: 10, description: '+10% critical hit chance.' }
    ]
  }
];
