/**
 * NPCs for The Contested Lands
 */

import { INPC } from '../../models/NPC.model';
import { NPCType } from '@desperados/shared';

export const contestedLandsNPCs: Partial<INPC>[] = [
  // ========================================
  // OUTLAWS
  // ========================================
  {
    name: 'Warlord\'s Lieutenant',
    type: NPCType.BOSS,
    level: 25,
    maxHP: 500,
    difficulty: 9,
    lootTable: {
      goldMin: 200,
      goldMax: 400,
      xpReward: 1500,
      items: [
        { name: 'warlords-helm', chance: 0.1, rarity: 'epic' },
        { name: 'starmetal-ingot', chance: 0.3, rarity: 'epic' },
      ]
    },
    location: 'The Contested Lands',
    respawnTime: 180, // 3 hours
    description: 'A heavily armored enforcer of the local warlord, brutal and unforgiving.',
    isActive: true
  },
  {
    name: 'Renegade Sharpshooter',
    type: NPCType.OUTLAW,
    level: 22,
    maxHP: 200,
    difficulty: 8,
    lootTable: {
      goldMin: 100,
      goldMax: 200,
      xpReward: 800,
      items: [
        { name: 'fine-gunsmiths-tools', chance: 0.2, rarity: 'rare' },
        { name: 'rifle-barrel', chance: 0.5, rarity: 'uncommon' },
      ]
    },
    location: 'The Contested Lands',
    respawnTime: 30,
    description: 'A sniper who has abandoned their post. High damage, but can\'t take a punch.',
    isActive: true
  },
  // ========================================
  // WILDLIFE
  // ========================================
  {
    name: 'Contested Lands Stalker',
    type: NPCType.WILDLIFE,
    level: 28,
    maxHP: 400,
    difficulty: 8,
    lootTable: {
      goldMin: 50,
      goldMax: 100,
      xpReward: 1000,
      items: [
        { name: 'exotic-leather', chance: 0.5, rarity: 'rare' },
        { name: 'predator-claws', chance: 0.8, rarity: 'rare' }, // Assuming this item exists
      ]
    },
    location: 'The Contested Lands',
    respawnTime: 60,
    description: 'A monstrous, mutated cat-like creature that has thrived in the harsh environment of the Contested Lands.',
    isActive: true
  },
];
