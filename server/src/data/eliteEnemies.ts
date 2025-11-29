/**
 * Elite Enemy Definitions - End-Game Enemies (Level 30-40)
 *
 * Defines elite enemies found in The Scar, including corrupted
 * legendary variants and unique void entities
 */

import {
  EndGameEnemy,
  EliteEnemyType,
  EnemyAbility,
  LootDrop,
} from '@desperados/shared';

/**
 * CORRUPTED LEGENDARY VARIANTS
 * These are corrupted versions of the legendary animals from the base game
 */

export const VOID_BEAR: EndGameEnemy = {
  id: 'void_bear',
  name: 'The Void Bear',
  level: 31,
  type: EliteEnemyType.VOID_BEAR,
  description: 'Old Red, corrupted beyond recognition. Its fur is midnight black, eyes glow with void energy, and reality distorts around it.',
  lore: 'Once the legendary Demon Bear, Old Red wandered too deep into The Scar. What-Waits-Below claimed it, transforming terror into nightmare. It remembers its old hunting grounds and seeks to return, spreading corruption.',

  health: 8500,
  damage: 180,
  defense: 120,
  criticalChance: 0.25,

  abilities: [
    {
      id: 'void_maul',
      name: 'Void Maul',
      description: 'Strikes with claws wreathed in void energy',
      damage: 280,
      damageType: 'void',
      sanityDamage: 15,
      cooldown: 3,
    },
    {
      id: 'reality_roar',
      name: 'Reality-Shattering Roar',
      description: 'Roars with such force that reality itself cracks',
      damage: 150,
      damageType: 'psychic',
      sanityDamage: 25,
      cooldown: 5,
      effects: [
        {
          type: 'fear',
          duration: 3,
          power: 30,
        },
        {
          type: 'reality_distortion',
          duration: 4,
          power: 20,
        },
      ],
    },
    {
      id: 'void_regeneration',
      name: 'Void Regeneration',
      description: 'Draws power from the void to regenerate',
      damage: 0,
      damageType: 'void',
      cooldown: 8,
      effects: [
        {
          type: 'heal',
          duration: 1,
          power: 500,
        },
      ],
    },
  ],

  sanityDamage: 10,
  corruptionOnKill: 5,
  fearLevel: 8,

  lootTable: [
    {
      itemId: 'void_bear_pelt',
      name: 'Void Bear Pelt',
      rarity: 'legendary',
      dropChance: 1.0,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'corrupted_bear_claw',
      name: 'Corrupted Bear Claw',
      rarity: 'epic',
      dropChance: 0.8,
      minQuantity: 2,
      maxQuantity: 4,
    },
    {
      itemId: 'void_touched_fang',
      name: 'Void-Touched Fang',
      rarity: 'rare',
      dropChance: 0.6,
      minQuantity: 1,
      maxQuantity: 2,
    },
    {
      itemId: 'reality_shard',
      name: 'Reality Shard',
      rarity: 'epic',
      dropChance: 0.3,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  xpReward: 2500,
  goldReward: { min: 150, max: 300 },

  isElite: true,
  canPhase: false,
};

export const PHASE_COUGAR: EndGameEnemy = {
  id: 'phase_cougar',
  name: 'The Phase Cougar',
  level: 33,
  type: EliteEnemyType.PHASE_COUGAR,
  description: 'The Ghost Cat, now truly ghostly. It phases between dimensions, existing in multiple realities at once.',
  lore: 'The legendary Ghost Cat was already elusive. Corruption granted it mastery over reality itself. It can step between dimensions at will, striking from impossible angles.',

  health: 6500,
  damage: 220,
  defense: 80,
  criticalChance: 0.4,

  abilities: [
    {
      id: 'phase_strike',
      name: 'Phase Strike',
      description: 'Phases through reality to strike from behind',
      damage: 320,
      damageType: 'physical',
      cooldown: 2,
      effects: [
        {
          type: 'armor_break',
          duration: 3,
          power: 25,
        },
      ],
    },
    {
      id: 'dimensional_leap',
      name: 'Dimensional Leap',
      description: 'Leaps through dimensions, becoming untargetable',
      damage: 0,
      damageType: 'void',
      cooldown: 6,
      effects: [
        {
          type: 'phase',
          duration: 2,
          power: 100,
        },
      ],
    },
    {
      id: 'reality_rake',
      name: 'Reality Rake',
      description: 'Claws tear through reality itself',
      damage: 280,
      damageType: 'reality',
      sanityDamage: 20,
      cooldown: 4,
      effects: [
        {
          type: 'bleed',
          duration: 5,
          power: 40,
        },
      ],
    },
  ],

  sanityDamage: 12,
  corruptionOnKill: 6,
  fearLevel: 7,

  lootTable: [
    {
      itemId: 'phase_cougar_hide',
      name: 'Phase Cougar Hide',
      rarity: 'legendary',
      dropChance: 1.0,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'dimensional_claw',
      name: 'Dimensional Claw',
      rarity: 'epic',
      dropChance: 0.75,
      minQuantity: 1,
      maxQuantity: 3,
    },
    {
      itemId: 'phase_essence',
      name: 'Phase Essence',
      rarity: 'epic',
      dropChance: 0.5,
      minQuantity: 1,
      maxQuantity: 2,
    },
  ],

  xpReward: 3000,
  goldReward: { min: 180, max: 350 },

  isElite: true,
  canPhase: true,
};

export const HOLLOW_WOLF: EndGameEnemy = {
  id: 'hollow_wolf',
  name: 'The Hollow Wolf',
  level: 30,
  type: EliteEnemyType.HOLLOW_WOLF,
  description: 'Lobo Grande, now a hollow shell filled with void. Its howl echoes across dimensions.',
  lore: 'The Great Wolf that terrorized the frontier is now hollow—literally. Corruption consumed its essence, leaving only a shell animated by void energy. Its pack follows, equally hollow.',

  health: 7000,
  damage: 160,
  defense: 100,
  criticalChance: 0.3,

  abilities: [
    {
      id: 'void_bite',
      name: 'Void Bite',
      description: 'Bites with jaws that leak void energy',
      damage: 240,
      damageType: 'void',
      sanityDamage: 10,
      cooldown: 2,
    },
    {
      id: 'dimensional_howl',
      name: 'Dimensional Howl',
      description: 'Howls across dimensions, calling void wolves',
      damage: 100,
      damageType: 'psychic',
      sanityDamage: 20,
      cooldown: 8,
      effects: [
        {
          type: 'summon',
          duration: 0,
          power: 2,
        },
      ],
    },
    {
      id: 'pack_tactics',
      name: 'Pack Tactics',
      description: 'Coordinates with summoned wolves for devastating attacks',
      damage: 200,
      damageType: 'physical',
      cooldown: 5,
    },
  ],

  sanityDamage: 8,
  corruptionOnKill: 4,
  fearLevel: 6,

  lootTable: [
    {
      itemId: 'hollow_wolf_pelt',
      name: 'Hollow Wolf Pelt',
      rarity: 'epic',
      dropChance: 1.0,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'void_wolf_fang',
      name: 'Void Wolf Fang',
      rarity: 'rare',
      dropChance: 0.7,
      minQuantity: 2,
      maxQuantity: 4,
    },
    {
      itemId: 'void_essence',
      name: 'Void Essence',
      rarity: 'rare',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  xpReward: 2200,
  goldReward: { min: 120, max: 250 },

  isElite: true,
  canPhase: false,
  summonMinions: {
    type: 'void_wolf',
    count: 2,
    cooldown: 8,
  },
};

export const STAR_TOUCHED_BUFFALO: EndGameEnemy = {
  id: 'star_touched_buffalo',
  name: 'The Star-Touched Buffalo',
  level: 36,
  type: EliteEnemyType.STAR_TOUCHED_BUFFALO,
  description: 'Thunder Buffalo, touched by the stars beyond. Constellations move beneath its hide, and cosmic energy crackles around it.',
  lore: 'Thunder Buffalo was sacred to the Nahi. When corruption reached it, something different happened—it connected with the void beyond the stars. Now it channels cosmic horror, a bridge between earth and the infinite dark.',

  health: 12000,
  damage: 200,
  defense: 150,
  criticalChance: 0.2,

  abilities: [
    {
      id: 'cosmic_charge',
      name: 'Cosmic Charge',
      description: 'Charges wreathed in starlight and void',
      damage: 350,
      damageType: 'physical',
      sanityDamage: 15,
      cooldown: 4,
      effects: [
        {
          type: 'stun',
          duration: 2,
          power: 100,
        },
      ],
    },
    {
      id: 'stellar_storm',
      name: 'Stellar Storm',
      description: 'Summons a storm of void stars',
      damage: 180,
      damageType: 'void',
      sanityDamage: 25,
      cooldown: 6,
      effects: [
        {
          type: 'area_damage',
          duration: 4,
          power: 60,
        },
      ],
    },
    {
      id: 'constellation_shield',
      name: 'Constellation Shield',
      description: 'Stars orbit the buffalo, absorbing damage',
      damage: 0,
      damageType: 'void',
      cooldown: 10,
      effects: [
        {
          type: 'shield',
          duration: 5,
          power: 1000,
        },
      ],
    },
  ],

  sanityDamage: 15,
  corruptionOnKill: 8,
  fearLevel: 9,

  lootTable: [
    {
      itemId: 'star_touched_hide',
      name: 'Star-Touched Hide',
      rarity: 'legendary',
      dropChance: 1.0,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'cosmic_horn',
      name: 'Cosmic Horn',
      rarity: 'legendary',
      dropChance: 0.6,
      minQuantity: 1,
      maxQuantity: 2,
    },
    {
      itemId: 'void_star_fragment',
      name: 'Void Star Fragment',
      rarity: 'epic',
      dropChance: 0.8,
      minQuantity: 2,
      maxQuantity: 4,
    },
    {
      itemId: 'primordial_fragment',
      name: 'Primordial Fragment',
      rarity: 'mythic',
      dropChance: 0.15,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  xpReward: 4000,
  goldReward: { min: 250, max: 450 },

  isElite: true,
  canPhase: false,
};

/**
 * UNIQUE SCAR ENTITIES
 * These are original creatures born from corruption
 */

export const REALITY_SHREDDER: EndGameEnemy = {
  id: 'reality_shredder',
  name: 'Reality Shredder',
  level: 33,
  type: EliteEnemyType.REALITY_SHREDDER,
  description: 'A creature that exists partially outside reality. Where it moves, space tears and bleeds.',
  lore: 'Born from concentrated corruption, Reality Shredders are void given form. They exist simultaneously in multiple dimensions, their very presence tearing holes in the fabric of reality.',

  health: 7500,
  damage: 240,
  defense: 70,
  criticalChance: 0.35,

  abilities: [
    {
      id: 'reality_tear',
      name: 'Reality Tear',
      description: 'Tears a hole in reality itself',
      damage: 300,
      damageType: 'reality',
      sanityDamage: 30,
      cooldown: 5,
      effects: [
        {
          type: 'reality_distortion',
          duration: 6,
          power: 40,
        },
      ],
    },
    {
      id: 'dimensional_slash',
      name: 'Dimensional Slash',
      description: 'Slashes through multiple dimensions at once',
      damage: 260,
      damageType: 'void',
      cooldown: 3,
    },
    {
      id: 'space_collapse',
      name: 'Space Collapse',
      description: 'Collapses space around target',
      damage: 220,
      damageType: 'reality',
      sanityDamage: 20,
      cooldown: 6,
      effects: [
        {
          type: 'movement_lock',
          duration: 4,
          power: 100,
        },
      ],
    },
  ],

  sanityDamage: 18,
  corruptionOnKill: 7,
  fearLevel: 8,

  lootTable: [
    {
      itemId: 'reality_shard',
      name: 'Reality Shard',
      rarity: 'epic',
      dropChance: 0.9,
      minQuantity: 2,
      maxQuantity: 4,
    },
    {
      itemId: 'dimensional_blade_fragment',
      name: 'Dimensional Blade Fragment',
      rarity: 'legendary',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'void_essence',
      name: 'Void Essence',
      rarity: 'rare',
      dropChance: 0.6,
      minQuantity: 1,
      maxQuantity: 2,
    },
  ],

  xpReward: 3200,
  goldReward: { min: 200, max: 380 },

  isElite: true,
  canPhase: true,
};

export const MIND_FLAYER: EndGameEnemy = {
  id: 'mind_flayer',
  name: 'Mind Flayer',
  level: 34,
  type: EliteEnemyType.MIND_FLAYER,
  description: 'An entity that feeds on thoughts and memories. Looking at it causes psychic pain.',
  lore: 'Mind Flayers are parasites of consciousness. They drift through The Scar, hunting for minds to consume. Victims are left as empty shells, their memories and personality devoured.',

  health: 6000,
  damage: 180,
  defense: 90,
  criticalChance: 0.25,

  abilities: [
    {
      id: 'psychic_lance',
      name: 'Psychic Lance',
      description: 'Pierces the mind with pure thought',
      damage: 280,
      damageType: 'psychic',
      sanityDamage: 35,
      cooldown: 3,
    },
    {
      id: 'memory_drain',
      name: 'Memory Drain',
      description: 'Drains memories, healing itself',
      damage: 150,
      damageType: 'psychic',
      sanityDamage: 25,
      cooldown: 6,
      effects: [
        {
          type: 'heal',
          duration: 1,
          power: 400,
        },
        {
          type: 'confusion',
          duration: 4,
          power: 30,
        },
      ],
    },
    {
      id: 'mind_blast',
      name: 'Mind Blast',
      description: 'Explosive psychic attack affecting all nearby',
      damage: 200,
      damageType: 'psychic',
      sanityDamage: 40,
      cooldown: 8,
    },
  ],

  sanityDamage: 22,
  corruptionOnKill: 6,
  fearLevel: 9,

  lootTable: [
    {
      itemId: 'psychic_residue',
      name: 'Psychic Residue',
      rarity: 'epic',
      dropChance: 0.8,
      minQuantity: 1,
      maxQuantity: 3,
    },
    {
      itemId: 'memory_fragment',
      name: 'Memory Fragment',
      rarity: 'legendary',
      dropChance: 0.5,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'mind_shield_charm',
      name: 'Mind Shield Charm',
      rarity: 'rare',
      dropChance: 0.3,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  xpReward: 3400,
  goldReward: { min: 210, max: 400 },

  isElite: true,
  canPhase: false,
};

export const VOID_WALKER: EndGameEnemy = {
  id: 'void_walker',
  name: 'Void Walker',
  level: 35,
  type: EliteEnemyType.VOID_WALKER,
  description: 'A humanoid figure made of living void. It walks between worlds as easily as breathing.',
  lore: 'No one knows if Void Walkers were once human or if they were always void given form. They move through dimensions, observing, occasionally intervening, always inscrutable.',

  health: 8000,
  damage: 210,
  defense: 110,
  criticalChance: 0.3,

  abilities: [
    {
      id: 'void_step',
      name: 'Void Step',
      description: 'Steps through the void to appear anywhere',
      damage: 0,
      damageType: 'void',
      cooldown: 4,
      effects: [
        {
          type: 'teleport',
          duration: 0,
          power: 100,
        },
      ],
    },
    {
      id: 'void_blade',
      name: 'Void Blade',
      description: 'Strikes with a blade of pure void',
      damage: 290,
      damageType: 'void',
      sanityDamage: 15,
      cooldown: 2,
    },
    {
      id: 'dimensional_prison',
      name: 'Dimensional Prison',
      description: 'Traps target in pocket dimension',
      damage: 180,
      damageType: 'void',
      sanityDamage: 25,
      cooldown: 7,
      effects: [
        {
          type: 'banish',
          duration: 3,
          power: 100,
        },
      ],
    },
  ],

  sanityDamage: 16,
  corruptionOnKill: 9,
  fearLevel: 8,

  lootTable: [
    {
      itemId: 'void_essence',
      name: 'Void Essence',
      rarity: 'epic',
      dropChance: 1.0,
      minQuantity: 2,
      maxQuantity: 3,
    },
    {
      itemId: 'void_walker_cloak',
      name: 'Void Walker Cloak Fragment',
      rarity: 'legendary',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'dimensional_key',
      name: 'Dimensional Key',
      rarity: 'rare',
      dropChance: 0.5,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  xpReward: 3600,
  goldReward: { min: 230, max: 420 },

  isElite: true,
  canPhase: true,
};

export const CORRUPTION_ELEMENTAL: EndGameEnemy = {
  id: 'corruption_elemental',
  name: 'Corruption Elemental',
  level: 36,
  type: EliteEnemyType.CORRUPTION_ELEMENTAL,
  description: 'Pure corruption given physical form. It radiates madness and decay.',
  lore: 'When corruption concentrates, it can achieve sentience. These elementals are corruption\'s immune system, attacking anything that resists the spread.',

  health: 9000,
  damage: 190,
  defense: 130,
  criticalChance: 0.2,

  abilities: [
    {
      id: 'corruption_blast',
      name: 'Corruption Blast',
      description: 'Fires concentrated corruption',
      damage: 250,
      damageType: 'corruption',
      corruptionDamage: 10,
      cooldown: 3,
    },
    {
      id: 'corruption_aura',
      name: 'Corruption Aura',
      description: 'Radiates corruption, damaging all nearby',
      damage: 120,
      damageType: 'corruption',
      corruptionDamage: 5,
      sanityDamage: 10,
      cooldown: 5,
    },
    {
      id: 'void_regeneration',
      name: 'Void Regeneration',
      description: 'Absorbs corruption to heal',
      damage: 0,
      damageType: 'corruption',
      cooldown: 8,
      effects: [
        {
          type: 'heal',
          duration: 1,
          power: 600,
        },
      ],
    },
  ],

  sanityDamage: 14,
  corruptionOnKill: 12,
  fearLevel: 7,

  lootTable: [
    {
      itemId: 'pure_corruption',
      name: 'Pure Corruption',
      rarity: 'epic',
      dropChance: 0.9,
      minQuantity: 2,
      maxQuantity: 4,
    },
    {
      itemId: 'corruption_heart',
      name: 'Corruption Heart',
      rarity: 'legendary',
      dropChance: 0.3,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'corrupted_crystal',
      name: 'Corrupted Crystal',
      rarity: 'rare',
      dropChance: 0.7,
      minQuantity: 1,
      maxQuantity: 3,
    },
  ],

  xpReward: 3800,
  goldReward: { min: 240, max: 440 },

  isElite: true,
  canPhase: false,
};

export const DREAM_STALKER: EndGameEnemy = {
  id: 'dream_stalker',
  name: 'Dream Stalker',
  level: 37,
  type: EliteEnemyType.DREAM_STALKER,
  description: 'It exists in the space between waking and sleeping. You can\'t quite focus on it.',
  lore: 'Dream Stalkers hunt through visions and nightmares. They can attack through dreams, killing without ever being physically present. The Scar\'s reality distortion lets them manifest partially.',

  health: 7000,
  damage: 260,
  defense: 85,
  criticalChance: 0.4,

  abilities: [
    {
      id: 'nightmare_strike',
      name: 'Nightmare Strike',
      description: 'Strikes from within nightmares',
      damage: 310,
      damageType: 'psychic',
      sanityDamage: 30,
      cooldown: 3,
    },
    {
      id: 'dream_walk',
      name: 'Dream Walk',
      description: 'Phases between dream and reality',
      damage: 0,
      damageType: 'psychic',
      cooldown: 5,
      effects: [
        {
          type: 'phase',
          duration: 3,
          power: 100,
        },
      ],
    },
    {
      id: 'sleep_paralysis',
      name: 'Sleep Paralysis',
      description: 'Paralyzes target with waking nightmares',
      damage: 200,
      damageType: 'psychic',
      sanityDamage: 40,
      cooldown: 7,
      effects: [
        {
          type: 'paralysis',
          duration: 4,
          power: 100,
        },
      ],
    },
  ],

  sanityDamage: 25,
  corruptionOnKill: 7,
  fearLevel: 9,

  lootTable: [
    {
      itemId: 'nightmare_essence',
      name: 'Nightmare Essence',
      rarity: 'epic',
      dropChance: 0.85,
      minQuantity: 1,
      maxQuantity: 2,
    },
    {
      itemId: 'dream_catcher',
      name: 'Corrupted Dream Catcher',
      rarity: 'legendary',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'memory_fragment',
      name: 'Memory Fragment',
      rarity: 'legendary',
      dropChance: 0.25,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  xpReward: 4200,
  goldReward: { min: 260, max: 470 },

  isElite: true,
  canPhase: true,
};

export const THE_FORGOTTEN: EndGameEnemy = {
  id: 'the_forgotten',
  name: 'The Forgotten',
  level: 38,
  type: EliteEnemyType.THE_FORGOTTEN,
  description: 'Once human, now... other. They remember being human but can\'t recall their names.',
  lore: 'Those who spend too long in The Scar sometimes forget who they were. The corruption fills the gaps, creating beings that are neither human nor void—The Forgotten. They attack the living with desperate fury, as if trying to remember.',

  health: 10000,
  damage: 230,
  defense: 140,
  criticalChance: 0.28,

  abilities: [
    {
      id: 'desperate_strike',
      name: 'Desperate Strike',
      description: 'Attacks with the fury of lost identity',
      damage: 330,
      damageType: 'physical',
      sanityDamage: 20,
      cooldown: 2,
    },
    {
      id: 'forgotten_scream',
      name: 'Forgotten Scream',
      description: 'Screams with the anguish of lost memories',
      damage: 220,
      damageType: 'psychic',
      sanityDamage: 45,
      cooldown: 6,
      effects: [
        {
          type: 'fear',
          duration: 5,
          power: 40,
        },
      ],
    },
    {
      id: 'corruption_embrace',
      name: 'Corruption Embrace',
      description: 'Attempts to share its corruption with target',
      damage: 180,
      damageType: 'corruption',
      corruptionDamage: 15,
      sanityDamage: 25,
      cooldown: 8,
      effects: [
        {
          type: 'corruption_spread',
          duration: 10,
          power: 30,
        },
      ],
    },
  ],

  sanityDamage: 20,
  corruptionOnKill: 10,
  fearLevel: 10,

  lootTable: [
    {
      itemId: 'forgotten_memento',
      name: 'Forgotten Memento',
      rarity: 'legendary',
      dropChance: 0.7,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'identity_fragment',
      name: 'Identity Fragment',
      rarity: 'epic',
      dropChance: 0.8,
      minQuantity: 1,
      maxQuantity: 2,
    },
    {
      itemId: 'humanity_shard',
      name: 'Shard of Lost Humanity',
      rarity: 'mythic',
      dropChance: 0.2,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  xpReward: 4500,
  goldReward: { min: 280, max: 500 },

  isElite: true,
  canPhase: false,
};

/**
 * All elite enemies export
 */
export const ELITE_ENEMIES: Record<string, EndGameEnemy> = {
  void_bear: VOID_BEAR,
  phase_cougar: PHASE_COUGAR,
  hollow_wolf: HOLLOW_WOLF,
  star_touched_buffalo: STAR_TOUCHED_BUFFALO,
  reality_shredder: REALITY_SHREDDER,
  mind_flayer: MIND_FLAYER,
  void_walker: VOID_WALKER,
  corruption_elemental: CORRUPTION_ELEMENTAL,
  dream_stalker: DREAM_STALKER,
  the_forgotten: THE_FORGOTTEN,
};

/**
 * Get elite enemy by ID
 */
export function getEliteEnemy(enemyId: string): EndGameEnemy | undefined {
  return ELITE_ENEMIES[enemyId];
}

/**
 * Get elites by level range
 */
export function getElitesByLevel(minLevel: number, maxLevel: number): EndGameEnemy[] {
  return Object.values(ELITE_ENEMIES).filter(
    enemy => enemy.level >= minLevel && enemy.level <= maxLevel
  );
}

/**
 * Get corrupted legendary variants
 */
export function getCorruptedLegendaries(): EndGameEnemy[] {
  return [VOID_BEAR, PHASE_COUGAR, HOLLOW_WOLF, STAR_TOUCHED_BUFFALO];
}

/**
 * Get unique Scar entities
 */
export function getUniqueScarEntities(): EndGameEnemy[] {
  return [
    REALITY_SHREDDER,
    MIND_FLAYER,
    VOID_WALKER,
    CORRUPTION_ELEMENTAL,
    DREAM_STALKER,
    THE_FORGOTTEN,
  ];
}
