/**
 * The Contested Lands PvP Gear
 * Powerful, high-level gear obtainable only from the PvP zone.
 */

import { IItem } from '../../models/Item.model';

export const contestedLandsGear: Partial<IItem>[] = [
  // ========================================
  // THE WARLORD'S SET (EPIC)
  // ========================================
  {
    itemId: 'warlords-helm',
    name: 'Warlord\'s Helm',
    description: 'A grim, iron helmet forged in the fires of conflict. Scratched and dented, but never broken. Part of the Warlord\'s set.',
    type: 'armor',
    rarity: 'epic',
    price: 3000,
    sellPrice: 1500,
    inShop: false, // PvP reward
    levelRequired: 25,
    icon: '👹',
    equipSlot: 'head',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 40, description: '+40 HP' },
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'special', value: 10, description: '+10% resistance to critical hits from players.' },
      { type: 'special', value: 1, description: 'Set Bonus (2/3): +10% Damage vs. Players' }
    ]
  },
  {
    itemId: 'warlords-plate',
    name: 'Warlord\'s Plate',
    description: 'Heavy plate armor, reinforced with salvaged metal from a dozen different battles. Part of the Warlord\'s set.',
    type: 'armor',
    rarity: 'epic',
    price: 5000,
    sellPrice: 2500,
    inShop: false, // PvP reward
    levelRequired: 25,
    icon: '🛡️',
    equipSlot: 'body',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 80, description: '+80 HP' },
      { type: 'special', value: 10, description: '+10% damage reduction from players.' },
      { type: 'special', value: 1, description: 'Set Bonus (3/3): Grants "Warlord\'s Fury" ability, increasing damage by 30% for 10 seconds after being critically hit.' }
    ]
  },
  {
    itemId: 'warlords-greaves',
    name: 'Warlord\'s Greaves',
    description: 'Iron-plated boots that have trod upon countless battlefields. Part of the Warlord\'s set.',
    type: 'armor',
    rarity: 'epic',
    price: 2500,
    sellPrice: 1250,
    inShop: false, // PvP reward
    levelRequired: 25,
    icon: '👢',
    equipSlot: 'feet',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'hp', value: 30, description: '+30 HP' },
      { type: 'special', value: 10, description: '+10% movement speed in combat.' },
      { type: 'special', value: 1, description: 'Set Bonus (1/3): Cannot be slowed or immobilized by player abilities.' }
    ]
  },
  {
    itemId: 'warlords-blade',
    name: 'Warlord\'s Blade',
    description: 'A brutal, heavy sword, notched and stained from a hundred duels. It hums with a thirst for battle.',
    type: 'weapon',
    rarity: 'epic',
    price: 6000,
    sellPrice: 3000,
    inShop: false, // PvP reward
    levelRequired: 25,
    icon: '⚔️',
    equipSlot: 'weapon',
    isEquippable: true,
    effects: [
      { type: 'stat', stat: 'combat', value: 25, description: '+25 Combat' },
      { type: 'special', value: 10, description: '+10% damage to players below 50% health.' }
    ]
  }
];
