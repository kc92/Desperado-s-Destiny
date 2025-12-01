/**
 * NPCs for The Frontier
 */

import { INPC } from '../../models/NPC.model';
import { NPCType } from '@desperados/shared';

export const frontierNPCs: Partial<INPC>[] = [
  // ========================================
  // AMBIENT WILDLIFE
  // ========================================
  {
    name: 'Vulture',
    type: NPCType.WILDLIFE,
    level: 1,
    maxHP: 20,
    difficulty: 1,
    lootTable: {
      goldMin: 0,
      goldMax: 1,
      xpReward: 5,
      items: [
        { name: 'feathers', chance: 0.5, rarity: 'common' },
      ]
    },
    location: 'The Frontier',
    respawnTime: 5,
    description: 'A scavenger bird that circles high above, waiting for death.',
    isActive: true
  },
  {
    name: 'Jackrabbit',
    type: NPCType.WILDLIFE,
    level: 1,
    maxHP: 10,
    difficulty: 1,
    lootTable: {
      goldMin: 0,
      goldMax: 1,
      xpReward: 10,
      items: [
        { name: 'raw-meat', chance: 0.8, rarity: 'common' }, // Assuming a generic raw-meat item
      ]
    },
    location: 'The Frontier',
    respawnTime: 2,
    description: 'A fast-moving rabbit, difficult to catch.',
    isActive: true
  },
  {
    name: 'Diamondback Rattlesnake',
    type: NPCType.WILDLIFE,
    level: 2,
    maxHP: 30,
    difficulty: 3,
    lootTable: {
      goldMin: 2,
      goldMax: 5,
      xpReward: 25,
      items: [
        { name: 'rattlesnake-skin', chance: 0.6, rarity: 'uncommon' },
        { name: 'snake-venom', chance: 0.3, rarity: 'uncommon' },
      ]
    },
    location: 'The Frontier',
    respawnTime: 10,
    description: 'A venomous snake that lies in wait for its prey.',
    isActive: true
  },
  // ========================================
  // HUMAN NPCS
  // ========================================
  {
    name: 'Petty Thief',
    type: NPCType.OUTLAW,
    level: 1,
    maxHP: 40,
    difficulty: 1,
    lootTable: {
      goldMin: 1,
      goldMax: 5,
      xpReward: 15,
      items: [
        { name: 'stolen-trinket', chance: 0.2, rarity: 'common' }, // Assuming a generic junk item
      ]
    },
    location: 'The Frontier',
    respawnTime: 5,
    description: 'A desperate individual with sticky fingers.',
    isActive: true
  },
  {
    name: 'Lone Rider',
    type: NPCType.LAWMAN, // Using LAWMAN as a proxy for a non-hostile human
    level: 5,
    maxHP: 100,
    difficulty: 2,
    lootTable: { // Empty loot table to discourage attacks
      goldMin: 0,
      goldMax: 0,
      xpReward: 0,
      items: []
    },
    location: 'The Frontier',
    respawnTime: 60, // Doesn't need to respawn often
    description: 'A lone rider on the dusty trail, minding their own business.',
    isActive: true
  },
  {
    name: 'Canyon Scavenger',
    type: NPCType.OUTLAW,
    level: 3,
    maxHP: 60,
    difficulty: 4,
    lootTable: {
      goldMin: 10,
      goldMax: 25,
      xpReward: 40,
      items: [
        { name: 'metal-scrap', chance: 0.7, rarity: 'common' },
        { name: 'cured-leather', chance: 0.3, rarity: 'common' },
      ]
    },
    location: 'The Frontier',
    respawnTime: 15,
    description: 'A territorial scavenger who guards their findings with their life.',
    isActive: true
  },
  // ========================================
  // VARIETY NPCS
  // ========================================
  {
    name: '"One-Eyed" Jack',
    type: NPCType.BOSS,
    level: 7,
    maxHP: 150,
    difficulty: 7,
    lootTable: {
      goldMin: 50,
      goldMax: 100,
      xpReward: 200,
      items: [
        { name: 'one-eyes-revenge', chance: 1, rarity: 'rare' },
        { name: 'gold-nugget', chance: 0.5, rarity: 'rare' },
      ]
    },
    location: 'The Frontier', // Specific location TBD
    respawnTime: 120, // 2 hours
    description: 'A grizzled outlaw leader with a nasty scar and a custom revolver.',
    isActive: true
  },
  {
    name: 'Grumpy Prospector',
    type: NPCType.LAWMAN, // Non-hostile
    level: 5,
    maxHP: 100,
    difficulty: 1,
    lootTable: { goldMin: 0, goldMax: 0, xpReward: 0, items: [] },
    location: 'The Frontier', // Specific location TBD
    respawnTime: 1440, // 24 hours
    description: 'An old prospector who seems to know the lay of the land. Maybe he has some tips, for a price.',
    isActive: true
  },
  {
    name: 'Nahi Scout',
    type: NPCType.LAWMAN, // Non-hostile
    level: 8,
    maxHP: 120,
    difficulty: 5,
    lootTable: { goldMin: 0, goldMax: 0, xpReward: 0, items: [] },
    location: 'The Frontier', // Specific location TBD
    respawnTime: 1440, // 24 hours
    description: 'A silent scout, observing from a distance. Their purpose here is unknown.',
    isActive: true
  },
];
