/**
 * World Boss Definitions - End-Game Raid Bosses
 *
 * Defines the four major world bosses of The Scar region
 * that require groups or extreme preparation to defeat
 */

import {
  WorldBoss,
  WorldBossType,
  ScarZone,
  BossPhase,
  EnemyAbility,
  LootDrop,
} from '@desperados/shared';

/**
 * THE MAW - Level 32 Zone Boss (Outer Waste)
 *
 * A massive tentacled horror that emerges weekly
 */
export const THE_MAW: WorldBoss = {
  id: WorldBossType.THE_MAW,
  name: 'The Maw',
  title: 'Devourer of the Waste',
  level: 32,
  description: 'A colossal tentacled horror that rises from the corrupted earth. Its mouth is a portal to somewhere else—somewhere hungry.',
  lore: 'The Maw first appeared three years ago, swallowing an entire settlement. It rises weekly now, consuming anything nearby. Scholars theorize it\'s a feeding appendage of What-Waits-Below, reaching up to feed.',

  zone: ScarZone.OUTER_WASTE,
  spawnType: 'weekly',
  spawnDay: 6, // Saturday
  spawnTime: 20, // 8 PM
  announceBeforeSpawn: 60,

  health: 50000,
  damage: 220,
  defense: 180,

  phases: [
    {
      phase: 1,
      healthThreshold: 100,
      name: 'Surface Phase',
      description: 'The Maw emerges, tentacles lashing',
      attackPowerMultiplier: 1.0,
      newAbilities: [],
      environmentalChanges: ['Ground cracks open', 'Corrupted pools form'],
      specialMechanics: ['Tentacle adds spawn every 30 seconds'],
    },
    {
      phase: 2,
      healthThreshold: 66,
      name: 'Feeding Frenzy',
      description: 'The Maw opens wider, attempting to swallow players',
      attackPowerMultiplier: 1.25,
      newAbilities: [
        {
          id: 'swallow',
          name: 'Swallow',
          description: 'Attempts to swallow a player whole',
          damage: 400,
          damageType: 'void',
          sanityDamage: 40,
          cooldown: 15,
          effects: [
            {
              type: 'swallowed',
              duration: 20,
              power: 100,
            },
          ],
        },
      ],
      environmentalChanges: ['Suction pulls players toward Maw'],
      specialMechanics: ['Swallowed players must escape or die', 'Rescue mechanics available'],
    },
    {
      phase: 3,
      healthThreshold: 33,
      name: 'Desperate Hunger',
      description: 'The Maw thrashes wildly, reality breaking around it',
      attackPowerMultiplier: 1.5,
      newAbilities: [
        {
          id: 'reality_collapse',
          name: 'Reality Collapse',
          description: 'The area around the Maw collapses into the void',
          damage: 500,
          damageType: 'reality',
          sanityDamage: 60,
          cooldown: 20,
        },
      ],
      environmentalChanges: ['Ground constantly crumbling', 'Safe zones shrinking'],
      specialMechanics: ['Enrage at 10 minutes', 'Area becomes increasingly dangerous'],
    },
  ],

  abilities: [
    {
      id: 'tentacle_slam',
      name: 'Tentacle Slam',
      description: 'Slams massive tentacles into the ground',
      damage: 280,
      damageType: 'physical',
      cooldown: 5,
    },
    {
      id: 'corruption_spray',
      name: 'Corruption Spray',
      description: 'Sprays corrupted fluid across the battlefield',
      damage: 180,
      damageType: 'corruption',
      corruptionDamage: 15,
      sanityDamage: 20,
      cooldown: 8,
    },
    {
      id: 'void_pulse',
      name: 'Void Pulse',
      description: 'Pulses void energy from its maw',
      damage: 220,
      damageType: 'void',
      sanityDamage: 25,
      cooldown: 10,
    },
  ],

  requiresGroup: true,
  recommendedGroupSize: 5,
  enrageTimer: 15,

  specialMechanics: [
    'Players can be swallowed and must escape',
    'Tentacle adds must be controlled',
    'Safe zones exist but shrink over time',
    'Corrupted pools deal damage over time',
  ],

  sanityDamage: 15,
  corruptionAura: 2,
  fearLevel: 8,

  guaranteedDrops: [
    {
      itemId: 'maw_tentacle',
      name: 'Maw Tentacle',
      rarity: 'legendary',
      dropChance: 1.0,
      minQuantity: 2,
      maxQuantity: 4,
    },
    {
      itemId: 'void_touched_essence',
      name: 'Void-Touched Essence',
      rarity: 'epic',
      dropChance: 1.0,
      minQuantity: 3,
      maxQuantity: 6,
    },
  ],

  rareDrops: [
    {
      itemId: 'maw_tooth',
      name: 'Maw Tooth',
      rarity: 'legendary',
      dropChance: 0.3,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'devourer_heart',
      name: 'Devourer\'s Heart',
      rarity: 'mythic',
      dropChance: 0.05,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  firstKillBonus: {
    gold: 1000,
    item: 'maw_slayer_trophy',
    title: 'Maw Slayer',
  },

  leaderboardRewards: [
    { rank: 1, reward: 'Top DPS: Legendary Weapon Schematic' },
    { rank: 2, reward: 'Top Healer: Legendary Armor Schematic' },
    { rank: 3, reward: 'Top Tank: Legendary Shield Schematic' },
  ],

  damageContributionRequired: 5,
  maxParticipants: 20,
};

/**
 * THE COLLECTOR - Level 35 Zone Boss (Twisted Lands)
 *
 * A bizarre entity that steals items and abilities
 */
export const THE_COLLECTOR: WorldBoss = {
  id: WorldBossType.THE_COLLECTOR,
  name: 'The Collector',
  title: 'Thief of Realities',
  level: 35,
  description: 'A reality-warping entity covered in stolen objects, weapons, and memories. It exists to take, never to give.',
  lore: 'The Collector is obsessed with acquisition. It phases through The Scar, stealing anything it finds interesting—weapons, artifacts, even memories and identities. Its hoard exists in a pocket dimension, and players must fight to retrieve their stolen goods.',

  zone: ScarZone.TWISTED_LANDS,
  spawnType: 'weekly',
  spawnDay: 3, // Wednesday
  spawnTime: 21, // 9 PM
  announceBeforeSpawn: 90,

  health: 75000,
  damage: 260,
  defense: 150,

  phases: [
    {
      phase: 1,
      healthThreshold: 100,
      name: 'Acquisitive Phase',
      description: 'The Collector evaluates and steals from players',
      attackPowerMultiplier: 1.0,
      newAbilities: [],
      environmentalChanges: ['Items float around The Collector'],
      specialMechanics: ['Can steal player items temporarily', 'Stolen items power up The Collector'],
    },
    {
      phase: 2,
      healthThreshold: 60,
      name: 'Defensive Hoard',
      description: 'The Collector creates barriers from stolen items',
      attackPowerMultiplier: 1.2,
      newAbilities: [
        {
          id: 'hoard_barrier',
          name: 'Hoard Barrier',
          description: 'Creates a barrier of stolen items',
          damage: 0,
          damageType: 'void',
          cooldown: 25,
          effects: [
            {
              type: 'shield',
              duration: 15,
              power: 5000,
            },
          ],
        },
      ],
      environmentalChanges: ['Barriers must be destroyed to damage boss'],
      specialMechanics: ['Barriers reflect damage', 'Must retrieve items to weaken barriers'],
    },
    {
      phase: 3,
      healthThreshold: 30,
      name: 'Desperate Hoarding',
      description: 'The Collector summons its entire hoard to defend itself',
      attackPowerMultiplier: 1.4,
      newAbilities: [
        {
          id: 'summon_hoard',
          name: 'Summon Hoard',
          description: 'Summons animated objects from the hoard',
          damage: 200,
          damageType: 'physical',
          cooldown: 30,
        },
      ],
      environmentalChanges: ['Pocket dimension begins collapsing'],
      specialMechanics: ['Multiple animated object adds', 'Environment becomes hazardous'],
    },
  ],

  abilities: [
    {
      id: 'theft',
      name: 'Theft',
      description: 'Steals an equipped item from target',
      damage: 150,
      damageType: 'void',
      cooldown: 12,
      effects: [
        {
          type: 'item_theft',
          duration: 60,
          power: 1,
        },
      ],
    },
    {
      id: 'memory_steal',
      name: 'Memory Steal',
      description: 'Steals player abilities temporarily',
      damage: 200,
      damageType: 'psychic',
      sanityDamage: 30,
      cooldown: 15,
      effects: [
        {
          type: 'ability_lock',
          duration: 30,
          power: 1,
        },
      ],
    },
    {
      id: 'stolen_power',
      name: 'Stolen Power',
      description: 'Uses stolen abilities against players',
      damage: 300,
      damageType: 'void',
      cooldown: 10,
    },
  ],

  requiresGroup: true,
  recommendedGroupSize: 6,
  enrageTimer: 20,

  specialMechanics: [
    'Items are stolen and must be retrieved',
    'Stolen items power up The Collector',
    'Players can loot their items from barrier destruction',
    'Coordination required to manage item retrieval',
  ],

  sanityDamage: 18,
  corruptionAura: 3,
  fearLevel: 7,

  guaranteedDrops: [
    {
      itemId: 'collector_fragment',
      name: 'Collector Fragment',
      rarity: 'legendary',
      dropChance: 1.0,
      minQuantity: 2,
      maxQuantity: 3,
    },
    {
      itemId: 'stolen_reality',
      name: 'Stolen Reality',
      rarity: 'epic',
      dropChance: 1.0,
      minQuantity: 4,
      maxQuantity: 7,
    },
  ],

  rareDrops: [
    {
      itemId: 'pocket_dimension_key',
      name: 'Pocket Dimension Key',
      rarity: 'legendary',
      dropChance: 0.25,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'collector_eye',
      name: 'The Collector\'s Eye',
      rarity: 'mythic',
      dropChance: 0.08,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  firstKillBonus: {
    gold: 1500,
    item: 'reality_thief_trophy',
    title: 'Reality Thief',
  },

  leaderboardRewards: [
    { rank: 1, reward: 'Most Items Stolen: Legendary Thief\'s Tools' },
    { rank: 2, reward: 'Most Items Retrieved: Legendary Recovery Kit' },
    { rank: 3, reward: 'Highest Burst Damage: Legendary Offense Charm' },
  ],

  damageContributionRequired: 7,
  maxParticipants: 25,
};

/**
 * THE MIRROR - Level 38 Zone Boss (Deep Scar)
 *
 * An entity that copies and reflects player abilities
 */
export const THE_MIRROR: WorldBoss = {
  id: WorldBossType.THE_MIRROR,
  name: 'The Mirror',
  title: 'Reflection of the Void',
  level: 38,
  description: 'A perfect mirror that reflects not light, but possibility. It shows you what you could become, and makes it fight you.',
  lore: 'The Mirror is terrifying because it\'s you. It creates perfect copies of players, matching their abilities, strengths, and even strategies. To defeat The Mirror, you must defeat yourself.',

  zone: ScarZone.DEEP_SCAR,
  spawnType: 'biweekly',
  spawnDay: 15, // 15th of month
  spawnTime: 22, // 10 PM
  announceBeforeSpawn: 120,

  health: 100000,
  damage: 0, // Doesn't attack directly
  defense: 200,

  phases: [
    {
      phase: 1,
      healthThreshold: 100,
      name: 'Observation',
      description: 'The Mirror studies all participants',
      attackPowerMultiplier: 1.0,
      newAbilities: [],
      environmentalChanges: ['Mirror surface ripples, showing reflections'],
      specialMechanics: ['Mirror copies all player abilities', 'No direct damage yet'],
    },
    {
      phase: 2,
      healthThreshold: 75,
      name: 'Reflection',
      description: 'The Mirror creates copies of players',
      attackPowerMultiplier: 1.0,
      newAbilities: [
        {
          id: 'create_reflection',
          name: 'Create Reflection',
          description: 'Creates a perfect copy of a player',
          damage: 0,
          damageType: 'void',
          cooldown: 20,
        },
      ],
      environmentalChanges: ['Player reflections emerge from mirror'],
      specialMechanics: ['Fight your own reflection', 'Reflections have same abilities'],
    },
    {
      phase: 3,
      healthThreshold: 50,
      name: 'Dark Reflection',
      description: 'Reflections become stronger, corrupted versions',
      attackPowerMultiplier: 1.3,
      newAbilities: [
        {
          id: 'corrupted_reflection',
          name: 'Corrupted Reflection',
          description: 'Creates enhanced, void-touched copies',
          damage: 0,
          damageType: 'void',
          cooldown: 25,
        },
      ],
      environmentalChanges: ['Reflections gain void powers'],
      specialMechanics: ['Reflections are 130% player strength', 'Coordination crucial'],
    },
    {
      phase: 4,
      healthThreshold: 25,
      name: 'Shattered Self',
      description: 'The Mirror shatters, releasing all reflections at once',
      attackPowerMultiplier: 1.5,
      newAbilities: [
        {
          id: 'shatter',
          name: 'Shatter',
          description: 'Releases all stored reflections simultaneously',
          damage: 400,
          damageType: 'reality',
          sanityDamage: 50,
          cooldown: 30,
        },
      ],
      environmentalChanges: ['Mirror fragments everywhere', 'Multiple reflections active'],
      specialMechanics: ['All players face multiple copies', 'Overwhelming chaos'],
    },
  ],

  abilities: [
    {
      id: 'reflect_damage',
      name: 'Reflect Damage',
      description: 'Reflects all damage back to attackers',
      damage: 0,
      damageType: 'physical',
      cooldown: 15,
      effects: [
        {
          type: 'damage_reflection',
          duration: 5,
          power: 50,
        },
      ],
    },
    {
      id: 'ability_copy',
      name: 'Ability Copy',
      description: 'Copies and uses player abilities against them',
      damage: 250,
      damageType: 'void',
      cooldown: 8,
    },
    {
      id: 'perfect_counter',
      name: 'Perfect Counter',
      description: 'Perfectly counters the last ability used',
      damage: 300,
      damageType: 'reality',
      cooldown: 12,
    },
  ],

  requiresGroup: true,
  recommendedGroupSize: 8,
  enrageTimer: 25,

  specialMechanics: [
    'Fight reflections of yourself',
    'Reflections copy all abilities and stats',
    'Coordination required to manage multiple copies',
    'Mirror reflects damage periodically',
    'Strategic ability usage crucial',
  ],

  sanityDamage: 22,
  corruptionAura: 4,
  fearLevel: 9,

  guaranteedDrops: [
    {
      itemId: 'mirror_shard',
      name: 'Mirror Shard',
      rarity: 'legendary',
      dropChance: 1.0,
      minQuantity: 3,
      maxQuantity: 5,
    },
    {
      itemId: 'reflection_essence',
      name: 'Reflection Essence',
      rarity: 'epic',
      dropChance: 1.0,
      minQuantity: 5,
      maxQuantity: 8,
    },
  ],

  rareDrops: [
    {
      itemId: 'perfect_mirror',
      name: 'Perfect Mirror Fragment',
      rarity: 'legendary',
      dropChance: 0.2,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'self_mastery_crystal',
      name: 'Crystal of Self Mastery',
      rarity: 'mythic',
      dropChance: 0.1,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  firstKillBonus: {
    gold: 2000,
    item: 'mirror_breaker_trophy',
    title: 'Mirror Breaker',
  },

  leaderboardRewards: [
    { rank: 1, reward: 'Fastest Reflection Kill: Legendary Self-Mastery Charm' },
    { rank: 2, reward: 'Most Reflections Defeated: Legendary Multi-Target Ring' },
    { rank: 3, reward: 'Best Coordination: Legendary Team Buff Totem' },
  ],

  damageContributionRequired: 10,
  maxParticipants: 30,
};

/**
 * THE HERALD - Level 40 Event Boss (The Abyss)
 *
 * Avatar of What-Waits-Below, the ultimate challenge
 */
export const THE_HERALD: WorldBoss = {
  id: WorldBossType.THE_HERALD,
  name: 'The Herald',
  title: 'Voice of What-Waits-Below',
  level: 40,
  description: 'The Herald of What-Waits-Below. To look upon it is to glimpse the infinite void. It speaks in your mind, promising power and oblivion.',
  lore: 'The Herald is not What-Waits-Below, but its voice, its hand, its will made manifest. It appears only when the entity below stirs, testing those who dare challenge its domain. The Herald has never been defeated—only driven back.',

  zone: ScarZone.THE_ABYSS,
  spawnType: 'event',
  announceBeforeSpawn: 180,

  health: 200000,
  damage: 350,
  defense: 250,

  phases: [
    {
      phase: 1,
      healthThreshold: 100,
      name: 'The Announcement',
      description: 'The Herald declares the will of What-Waits-Below',
      attackPowerMultiplier: 1.0,
      newAbilities: [],
      environmentalChanges: ['The void pulses with energy', 'Whispers fill the air'],
      specialMechanics: ['Herald announces its intentions', 'Sanity drain begins'],
    },
    {
      phase: 2,
      healthThreshold: 80,
      name: 'The Judgment',
      description: 'The Herald judges the worthy from the unworthy',
      attackPowerMultiplier: 1.2,
      newAbilities: [
        {
          id: 'judgment',
          name: 'Judgment',
          description: 'Targets weakest players with instant kill mechanics',
          damage: 999999,
          damageType: 'void',
          sanityDamage: 100,
          cooldown: 30,
        },
      ],
      environmentalChanges: ['Void rifts open', 'Platforms become unstable'],
      specialMechanics: ['Weak players targeted', 'Must protect vulnerable members'],
    },
    {
      phase: 3,
      healthThreshold: 60,
      name: 'The Temptation',
      description: 'The Herald offers power to those who would join',
      attackPowerMultiplier: 1.3,
      newAbilities: [
        {
          id: 'temptation',
          name: 'Temptation',
          description: 'Offers corruption-based power, attempt to turn players',
          damage: 0,
          damageType: 'psychic',
          sanityDamage: 80,
          cooldown: 45,
          effects: [
            {
              type: 'charm',
              duration: 15,
              power: 100,
            },
          ],
        },
      ],
      environmentalChanges: ['Players may turn against each other if charmed'],
      specialMechanics: ['Charm mechanics', 'PvP possible', 'Sanity crucial'],
    },
    {
      phase: 4,
      healthThreshold: 40,
      name: 'The Manifestation',
      description: 'What-Waits-Below partially manifests through The Herald',
      attackPowerMultiplier: 1.5,
      newAbilities: [
        {
          id: 'avatar_manifestation',
          name: 'Avatar Manifestation',
          description: 'The Herald channels What-Waits-Below directly',
          damage: 600,
          damageType: 'void',
          sanityDamage: 100,
          corruptionDamage: 50,
          cooldown: 20,
        },
      ],
      environmentalChanges: ['Reality breaks down', 'Void floods the arena'],
      specialMechanics: ['Extreme difficulty spike', 'All stats debuffed severely'],
    },
    {
      phase: 5,
      healthThreshold: 20,
      name: 'The Desperation',
      description: 'The Herald fights to maintain its form',
      attackPowerMultiplier: 1.8,
      newAbilities: [
        {
          id: 'void_collapse',
          name: 'Void Collapse',
          description: 'Attempts to drag everyone into the void',
          damage: 800,
          damageType: 'reality',
          sanityDamage: 100,
          cooldown: 15,
        },
      ],
      environmentalChanges: ['Platform collapsing into void', 'Time limit imposed'],
      specialMechanics: ['Enrage state', 'Must finish quickly or wipe'],
    },
  ],

  abilities: [
    {
      id: 'void_strike',
      name: 'Void Strike',
      description: 'Strikes with pure void energy',
      damage: 450,
      damageType: 'void',
      sanityDamage: 30,
      cooldown: 3,
    },
    {
      id: 'reality_warp',
      name: 'Reality Warp',
      description: 'Warps reality, teleporting and confusing players',
      damage: 300,
      damageType: 'reality',
      sanityDamage: 40,
      cooldown: 8,
      effects: [
        {
          type: 'confusion',
          duration: 10,
          power: 50,
        },
        {
          type: 'teleport',
          duration: 0,
          power: 100,
        },
      ],
    },
    {
      id: 'whispers_of_the_deep',
      name: 'Whispers of the Deep',
      description: 'What-Waits-Below whispers, draining sanity',
      damage: 200,
      damageType: 'psychic',
      sanityDamage: 60,
      cooldown: 12,
    },
  ],

  requiresGroup: true,
  recommendedGroupSize: 20,
  enrageTimer: 30,

  specialMechanics: [
    'Server-wide event, all max-level players can participate',
    'Extreme sanity drain throughout fight',
    'Charm mechanics can turn players against each other',
    'Platform collapse mechanics',
    'Multiple one-shot mechanics requiring coordination',
    'Resurrection limited',
  ],

  sanityDamage: 30,
  corruptionAura: 10,
  fearLevel: 10,

  guaranteedDrops: [
    {
      itemId: 'herald_essence',
      name: 'Herald Essence',
      rarity: 'mythic',
      dropChance: 1.0,
      minQuantity: 1,
      maxQuantity: 2,
    },
    {
      itemId: 'void_crystal',
      name: 'Void Crystal',
      rarity: 'legendary',
      dropChance: 1.0,
      minQuantity: 5,
      maxQuantity: 10,
    },
  ],

  rareDrops: [
    {
      itemId: 'herald_weapon',
      name: 'Herald\'s Weapon Fragment',
      rarity: 'mythic',
      dropChance: 0.15,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'avatar_armor_piece',
      name: 'Avatar Armor Piece',
      rarity: 'mythic',
      dropChance: 0.1,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'void_walker_token',
      name: 'Void Walker Token',
      rarity: 'mythic',
      dropChance: 0.05,
      minQuantity: 1,
      maxQuantity: 1,
      requiresCorruptionMastery: 75,
    },
  ],

  firstKillBonus: {
    gold: 5000,
    item: 'herald_slayer_crown',
    title: 'Herald Slayer',
  },

  leaderboardRewards: [
    { rank: 1, reward: 'Top DPS: Mythic Weapon of Choice' },
    { rank: 2, reward: 'Top Healer: Mythic Restoration Artifact' },
    { rank: 3, reward: 'Top Tank: Mythic Shield of the Abyss' },
    { rank: 1, reward: 'First Kill Group: Special Void Walker Title' },
  ],

  damageContributionRequired: 3,
  maxParticipants: 100,
};

/**
 * All world bosses export
 */
export const WORLD_BOSSES: Record<WorldBossType, WorldBoss> = {
  [WorldBossType.THE_MAW]: THE_MAW,
  [WorldBossType.THE_COLLECTOR]: THE_COLLECTOR,
  [WorldBossType.THE_MIRROR]: THE_MIRROR,
  [WorldBossType.THE_HERALD]: THE_HERALD,
};

/**
 * Get world boss by ID
 */
export function getWorldBoss(bossId: WorldBossType): WorldBoss | undefined {
  return WORLD_BOSSES[bossId];
}

/**
 * Get world bosses by zone
 */
export function getWorldBossesByZone(zone: ScarZone): WorldBoss[] {
  return Object.values(WORLD_BOSSES).filter(boss => boss.zone === zone);
}

/**
 * Get next boss spawn time
 */
export function getNextBossSpawn(bossId: WorldBossType): Date | null {
  const boss = WORLD_BOSSES[bossId];
  if (!boss || boss.spawnType === 'event') return null;

  const now = new Date();
  const nextSpawn = new Date(now);

  if (boss.spawnType === 'weekly' && boss.spawnDay !== undefined) {
    // Calculate next occurrence of spawn day
    const currentDay = now.getDay();
    const daysUntilSpawn = (boss.spawnDay - currentDay + 7) % 7 || 7;
    nextSpawn.setDate(now.getDate() + daysUntilSpawn);
  } else if (boss.spawnType === 'biweekly' && boss.spawnDay !== undefined) {
    // 15th of current or next month
    nextSpawn.setDate(boss.spawnDay);
    if (nextSpawn < now) {
      nextSpawn.setMonth(nextSpawn.getMonth() + 1);
    }
  }

  if (boss.spawnTime !== undefined) {
    nextSpawn.setHours(boss.spawnTime, 0, 0, 0);
  }

  return nextSpawn;
}
