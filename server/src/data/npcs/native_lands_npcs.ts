/**
 * NPCs for the Native Lands
 */

import { INPC } from '../../models/NPC.model';
import { NPCType } from '@desperados/shared';

export const nativeLandsNPCs: Partial<INPC>[] = [
  // ========================================
  // WILDLIFE
  // ========================================
  {
    name: 'Great Horned Owl',
    type: NPCType.WILDLIFE,
    level: 10,
    maxHP: 80,
    difficulty: 4,
    lootTable: {
      goldMin: 5,
      goldMax: 15,
      xpReward: 60,
      items: [
        { name: 'feathers', chance: 0.8, rarity: 'uncommon' },
      ]
    },
    location: 'Native Lands',
    respawnTime: 15,
    description: 'A silent and powerful nocturnal hunter.',
    isActive: true
  },
  {
    name: 'Pronghorn Antelope',
    type: NPCType.WILDLIFE,
    level: 12,
    maxHP: 100,
    difficulty: 3,
    lootTable: {
      goldMin: 0,
      goldMax: 0,
      xpReward: 80,
      items: [
        { name: 'hide-good', chance: 0.7, rarity: 'common' },
        { name: 'raw-meat', chance: 0.9, rarity: 'common' },
      ]
    },
    location: 'Native Lands',
    respawnTime: 10,
    description: 'The fastest land animal in the West, difficult to catch.',
    isActive: true
  },
  {
    name: 'Mountain Boar',
    type: NPCType.WILDLIFE,
    level: 15,
    maxHP: 150,
    difficulty: 6,
    lootTable: {
      goldMin: 15,
      goldMax: 30,
      xpReward: 120,
      items: [
        { name: 'hide-good', chance: 0.6, rarity: 'common' },
        { name: 'boar-tusk', chance: 0.4, rarity: 'uncommon' },
      ]
    },
    location: 'Native Lands',
    respawnTime: 20,
    description: 'A large, aggressive boar with sharp tusks.',
    isActive: true
  },
  // ========================================
  // NAHI TRIBESPEOPLE
  // ========================================
  {
    name: 'Nahi Hunter',
    type: NPCType.LAWMAN, // Using LAWMAN as a proxy for non-hostile
    level: 14,
    maxHP: 130,
    difficulty: 5,
    lootTable: { goldMin: 10, goldMax: 20, xpReward: 90, items: [{ name: 'bone-tipped-arrows', chance: 0.5, rarity: 'common' }] },
    location: 'Native Lands',
    respawnTime: 20,
    description: 'A skilled hunter of the Nahi tribe, master of the bow and tracking.',
    isActive: true
  },
  {
    name: 'Nahi Shaman',
    type: NPCType.LAWMAN, // Using LAWMAN as a proxy for non-hostile
    level: 18,
    maxHP: 150,
    difficulty: 7,
    lootTable: { goldMin: 20, goldMax: 40, xpReward: 150, items: [{ name: 'ginseng', chance: 0.5, rarity: 'uncommon' }] },
    location: 'Native Lands',
    respawnTime: 30,
    description: 'A spiritual leader of the Nahi, in tune with the spirits of the land.',
    isActive: true
  },
  {
    name: 'Nahi Warrior',
    type: NPCType.LAWMAN, // Using LAWMAN as a proxy for non-hostile
    level: 16,
    maxHP: 180,
    difficulty: 8,
    lootTable: { goldMin: 15, goldMax: 35, xpReward: 130, items: [{ name: 'ceremonial-war-club', chance: 0.2, rarity: 'uncommon' }] },
    location: 'Native Lands',
    respawnTime: 25,
    description: 'A proud warrior dedicated to defending the Nahi lands.',
    isActive: true
  },
];
