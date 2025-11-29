/**
 * Cosmic Horror Bosses - Phase 14, Wave 14.2
 *
 * Eldritch entities from The Scar and beyond
 * These bosses represent existential cosmic threats
 */

import {
  BossEncounter,
  BossCategory,
  BossTier,
  BossDamageType,
  StatusEffect,
  BossAbilityType,
  BossSpawnConditionType,
} from '@desperados/shared';

/**
 * THE MAW - Zone Boss (L32)
 * A living tear in reality that hungers endlessly
 * First major cosmic horror encounter
 */
export const THE_MAW: BossEncounter = {
  id: 'boss_the_maw',
  name: 'The Maw',
  title: 'Devourer of Worlds',
  category: BossCategory.COSMIC_HORROR,
  tier: BossTier.LEGENDARY,
  level: 32,

  description: 'A writhing aperture in space itself, ringed with impossible teeth and emanating soul-crushing hunger.',
  backstory: 'The Maw appeared in The Scar fifteen years ago. It consumes everything - matter, energy, even memories. Those who approach too close feel their very existence being erased.',
  defeatDialogue: '*The tear collapses with a sound like reality screaming. For a moment, you glimpse something beyond - and wish you hadn\'t.*',
  victoryNarrative: 'The Maw is sealed, but you know it wasn\'t destroyed. Somewhere, in some dimension, it still hungers. It always will.',

  location: 'Outer Waste',
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 30,
      description: 'Must be level 30 or higher',
    },
    {
      type: BossSpawnConditionType.LOCATION,
      value: 'the_scar',
      description: 'Must be within The Scar',
    },
  ],
  respawnCooldown: 168,

  health: 8000,
  damage: 150,
  defense: 40,
  criticalChance: 0.10,
  evasion: 0.05,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Hunger',
      description: 'The Maw pulls at your reality.',
      dialogue: '*A voice that is not a voice whispers: "Feed me."*',
      abilities: ['reality_pull', 'consume', 'sanity_drain'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 75,
      name: 'The Feast',
      description: 'The Maw opens wider, reality warping around it.',
      dialogue: '*The air itself screams as spacetime buckles*',
      abilities: ['reality_pull', 'consume', 'sanity_drain', 'dimensional_rift', 'existence_erasure'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage',
        },
      ],
      environmentalHazard: {
        name: 'Reality Distortion',
        description: 'The fabric of reality is tearing',
        damagePerTurn: 25,
        avoidable: false,
      },
    },
    {
      phaseNumber: 3,
      healthThreshold: 50,
      name: 'The Void',
      description: 'The Maw attempts to fully manifest.',
      dialogue: '*Colors you\'ve never seen bleed into your vision. Your mind cannot process what you\'re seeing.*',
      abilities: ['consume', 'sanity_drain', 'dimensional_rift', 'existence_erasure', 'consume_reality'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.6,
          description: '+60% damage',
        },
      ],
    },
    {
      phaseNumber: 4,
      healthThreshold: 25,
      name: 'The End',
      description: 'Reality itself begins to unravel.',
      dialogue: '*There are no words for what you witness. Language itself becomes meaningless.*',
      abilities: ['consume', 'existence_erasure', 'consume_reality', 'reality_collapse'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 2.0,
          description: '+100% damage',
        },
      ],
      summonMinions: {
        type: 'void_spawn',
        count: 5,
        spawnMessage: 'Things that should not exist crawl from the rift!',
      },
    },
    {
      phaseNumber: 5,
      healthThreshold: 10,
      name: 'Desperation',
      description: 'The Maw makes one final attempt to consume everything.',
      dialogue: '*HUNGER HUNGER HUNGER HUNGER*',
      abilities: ['reality_collapse', 'ultimate_consumption'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 3.0,
          description: '+200% damage',
        },
      ],
    },
  ],

  abilities: [
    {
      id: 'reality_pull',
      name: 'Reality Pull',
      description: 'Pulls you toward The Maw',
      type: BossAbilityType.DEBUFF,
      cooldown: 2,
      effect: {
        type: StatusEffect.ROOT,
        duration: 2,
        power: 50,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Anchor yourself to reality',
      priority: 5,
      targetType: 'all',
    },
    {
      id: 'consume',
      name: 'Consume',
      description: 'Devours a portion of your existence',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 120,
      damageType: BossDamageType.VOID,
      avoidable: false,
      priority: 6,
      targetType: 'single',
    },
    {
      id: 'sanity_drain',
      name: 'Sanity Drain',
      description: 'Looking at The Maw damages your mind',
      type: BossAbilityType.DOT,
      cooldown: 3,
      effect: {
        type: StatusEffect.MADNESS,
        duration: 4,
        power: 30,
        stackable: true,
        maxStacks: 5,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Don\'t look directly at it',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'dimensional_rift',
      name: 'Dimensional Rift',
      description: 'Tears open portals to nowhere',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 180,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Avoid the tears in space',
      telegraphMessage: 'Space itself begins to tear...',
      priority: 8,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'existence_erasure',
      name: 'Existence Erasure',
      description: 'Attempts to erase you from reality',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 300,
      damageType: BossDamageType.REALITY,
      effect: {
        type: StatusEffect.WEAKNESS,
        duration: 5,
        power: 50,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: false,
      telegraphMessage: 'You feel yourself beginning to fade...',
      priority: 10,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'consume_reality',
      name: 'Consume Reality',
      description: 'Devours the fabric of space around you',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 250,
      damageType: BossDamageType.VOID,
      avoidable: false,
      priority: 9,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'reality_collapse',
      name: 'Reality Collapse',
      description: 'The local reality structure fails',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 8,
      damage: 400,
      damageType: BossDamageType.REALITY,
      avoidable: true,
      avoidMechanic: 'Flee to stable ground',
      telegraphMessage: 'THE WORLD IS ENDING',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all',
    },
    {
      id: 'ultimate_consumption',
      name: 'Ultimate Consumption',
      description: 'Attempts to devour EVERYTHING',
      type: BossAbilityType.ULTIMATE,
      cooldown: 10,
      damage: 500,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Deal final damage before this completes',
      telegraphMessage: 'THE MAW OPENS COMPLETELY',
      priority: 10,
      requiresPhase: 5,
      targetType: 'all',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.4,
      description: 'Sacred weapons harm it',
    },
    {
      damageType: BossDamageType.REALITY,
      multiplier: 1.3,
      description: 'Reality-anchoring attacks effective',
    },
  ],
  immunities: [BossDamageType.PHYSICAL, BossDamageType.POISON, BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'reality_anchors',
      name: 'Place Reality Anchors',
      description: 'Anchor reality to prevent collapse',
      type: 'puzzle',
      instructions: 'Place 4 anchors around The Maw to stabilize space',
      successReward: 'Massively reduced reality damage',
      failureConsequence: 'Reality collapses, instant death',
    },
    {
      id: 'sanity_management',
      name: 'Manage Sanity',
      description: 'Keep your sanity above critical levels',
      type: 'unique',
      instructions: 'Use sanity-restoring items when madness stacks high',
      failureConsequence: 'Permanent madness effects',
    },
  ],

  environmentEffects: [
    {
      id: 'the_scar_corruption',
      name: 'Scar Corruption',
      description: 'The Scar itself damages you',
      triggersAt: 'start',
      effect: {
        type: 'damage',
        target: 'player',
        power: 15,
      },
      duration: undefined,
    },
  ],

  playerLimit: {
    min: 1,
    max: 5,
    recommended: 4,
  },

  scaling: {
    healthPerPlayer: 60,
    damagePerPlayer: 15,
  },

  guaranteedDrops: [
    {
      itemId: 'void_shard',
      name: 'Shard of the Void',
      rarity: 'mythic',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'reality_fragment',
      name: 'Broken Reality Fragment',
      description: 'A piece of shattered spacetime',
      rarity: 'legendary',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 3,
    },
    {
      itemId: 'void_essence',
      name: 'Void Essence',
      description: 'Pure nothingness made manifest',
      rarity: 'epic',
      dropChance: 0.6,
      minQuantity: 2,
      maxQuantity: 5,
    },
  ],

  goldReward: {
    min: 3000,
    max: 5000,
  },
  experienceReward: 8000,

  achievements: ['void_walker', 'reality_anchor', 'maw_closer'],
  titles: ['Void Walker', 'Reality Anchor', 'One Who Closed The Maw'],
  firstKillBonus: {
    title: 'The One Who Sealed The Maw',
    item: 'maw_trophy',
    gold: 2000,
  },

  difficulty: 10,
  enrageTimer: 30,
  canFlee: true,
  fleeConsequence: 'Permanent sanity damage from what you witnessed',
};

/**
 * THE HERALD - Event Boss (L40)
 * The voice and agent of What-Waits-Below
 * Appears during major cosmic events
 */
export const THE_HERALD: BossEncounter = {
  id: 'boss_the_herald',
  name: 'The Herald',
  title: 'Voice of What-Waits-Below',
  category: BossCategory.COSMIC_HORROR,
  tier: BossTier.MYTHIC,
  level: 40,

  description: 'A being that shifts between forms - human, animal, nightmare, and things without names.',
  backstory: 'The Herald is the mouthpiece of the entity beneath The Scar. It speaks prophecies, makes offers, and prepares the world for its master\'s awakening. It cannot be killed, only banished - and it always returns.',
  defeatDialogue: '"I am eternal. I am inevitable. My master stirs, and when it wakes, you will all kneel... or cease." *It dissolves into shadows and whispers*',
  victoryNarrative: 'The Herald is banished, but its words echo in your mind. "This changes nothing," it said. You fear it might be right.',

  location: 'The Abyss',
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 38,
      description: 'Must be level 38 or higher',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'cosmic_quest_act4_finale',
      description: 'Reach Act 4 of the cosmic storyline',
    },
  ],
  respawnCooldown: 336, // 2 weeks

  health: 15000,
  damage: 200,
  defense: 80,
  criticalChance: 0.25,
  evasion: 0.25,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Message',
      description: 'The Herald delivers its master\'s words.',
      dialogue: '"My master speaks. Will you listen, or will you perish in ignorance?"',
      abilities: ['prophetic_strike', 'whispers_of_madness', 'shape_shift'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 80,
      name: 'The Offer',
      description: 'The Herald offers power in exchange for service.',
      dialogue: '"Join us. Serve what is inevitable. Be spared what is to come."',
      abilities: ['prophetic_strike', 'whispers_of_madness', 'shape_shift', 'dark_bargain', 'reality_tear'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.2,
          description: '+20% damage',
        },
      ],
    },
    {
      phaseNumber: 3,
      healthThreshold: 60,
      name: 'The Warning',
      description: 'Refused, The Herald shows glimpses of what\'s coming.',
      dialogue: '"Then witness what awaits. See the future. Despair."',
      abilities: ['whispers_of_madness', 'shape_shift', 'dark_bargain', 'reality_tear', 'future_vision', 'summon_nightmares'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.4,
          description: '+40% damage',
        },
      ],
      summonMinions: {
        type: 'nightmare_spawn',
        count: 3,
        spawnMessage: 'Your deepest fears manifest!',
      },
    },
    {
      phaseNumber: 4,
      healthThreshold: 40,
      name: 'The Wrath',
      description: 'Angered by resistance, The Herald unleashes power.',
      dialogue: '"You dare? You DARE?! My master will DEVOUR you!"',
      abilities: ['reality_tear', 'future_vision', 'summon_nightmares', 'heralds_wrath', 'cosmic_annihilation'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.7,
          description: '+70% damage',
        },
        {
          type: 'speed',
          multiplier: 1.5,
          description: '+50% speed',
        },
      ],
    },
    {
      phaseNumber: 5,
      healthThreshold: 20,
      name: 'The Awakening',
      description: 'The Herald channels its master\'s power directly.',
      dialogue: '"IT STIRS. IT WAKES. IT COMES."',
      abilities: ['cosmic_annihilation', 'channel_below', 'apocalypse'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 2.5,
          description: '+150% damage',
        },
      ],
      environmentalHazard: {
        name: 'Master\'s Presence',
        description: 'The entity below reaches through The Herald',
        damagePerTurn: 100,
        avoidable: false,
      },
    },
  ],

  abilities: [
    {
      id: 'prophetic_strike',
      name: 'Prophetic Strike',
      description: 'The Herald knows where you\'ll be',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 180,
      damageType: BossDamageType.PSYCHIC,
      avoidable: false,
      priority: 5,
      targetType: 'single',
    },
    {
      id: 'whispers_of_madness',
      name: 'Whispers of Madness',
      description: 'Forbidden knowledge damages your mind',
      type: BossAbilityType.DOT,
      cooldown: 3,
      damage: 0,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.MADNESS,
        duration: 5,
        power: 40,
        stackable: true,
        maxStacks: 10,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'High Spirit resists',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'shape_shift',
      name: 'Shape Shift',
      description: 'Changes form to confuse and terrify',
      type: BossAbilityType.BUFF,
      cooldown: 4,
      avoidable: false,
      telegraphMessage: 'The Herald\'s form ripples and changes...',
      priority: 6,
      targetType: 'single',
    },
    {
      id: 'dark_bargain',
      name: 'Dark Bargain',
      description: 'Offers power at terrible cost',
      type: BossAbilityType.DEBUFF,
      cooldown: 6,
      effect: {
        type: StatusEffect.CORRUPTION,
        duration: 10,
        power: 50,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Refuse the offer',
      telegraphMessage: '"Accept my gift... what is your soul worth?"',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'reality_tear',
      name: 'Reality Tear',
      description: 'Rips holes in the fabric of existence',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 250,
      damageType: BossDamageType.REALITY,
      avoidable: true,
      avoidMechanic: 'Avoid the tears',
      telegraphMessage: 'Reality begins to unravel!',
      priority: 9,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'future_vision',
      name: 'Vision of the Future',
      description: 'Shows you the apocalypse to come',
      type: BossAbilityType.DEBUFF,
      cooldown: 7,
      effect: {
        type: StatusEffect.FEAR,
        duration: 4,
        power: 70,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Close your mind',
      telegraphMessage: 'You see the end of all things...',
      priority: 8,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'summon_nightmares',
      name: 'Summon Nightmares',
      description: 'Manifests your personal fears',
      type: BossAbilityType.SUMMON,
      cooldown: 8,
      avoidable: false,
      telegraphMessage: 'Your nightmares take form!',
      priority: 7,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'heralds_wrath',
      name: 'Herald\'s Wrath',
      description: 'Unleashes tremendous cosmic power',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 400,
      damageType: BossDamageType.CORRUPTION,
      avoidable: false,
      telegraphMessage: 'The Herald glows with eldritch power!',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all',
    },
    {
      id: 'cosmic_annihilation',
      name: 'Cosmic Annihilation',
      description: 'Channels pure destructive force',
      type: BossAbilityType.ULTIMATE,
      cooldown: 7,
      damage: 500,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Perfect dodge timing',
      telegraphMessage: 'ANNIHILATION IMMINENT',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all',
    },
    {
      id: 'channel_below',
      name: 'Channel What-Waits-Below',
      description: 'Becomes a conduit for the entity itself',
      type: BossAbilityType.BUFF,
      cooldown: 10,
      avoidable: false,
      telegraphMessage: 'The Herald\'s eyes become infinite voids...',
      priority: 10,
      requiresPhase: 5,
      targetType: 'single',
    },
    {
      id: 'apocalypse',
      name: 'Apocalypse',
      description: 'The end of everything',
      type: BossAbilityType.ULTIMATE,
      cooldown: 15,
      damage: 999,
      damageType: BossDamageType.REALITY,
      avoidable: true,
      avoidMechanic: 'Kill The Herald before cast completes',
      telegraphMessage: 'THE END IS HERE',
      priority: 10,
      requiresPhase: 5,
      targetType: 'all',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.5,
      description: 'Holy power harms it',
    },
  ],
  immunities: [BossDamageType.PHYSICAL, BossDamageType.POISON],

  specialMechanics: [
    {
      id: 'bargain_choice',
      name: 'The Dark Bargain',
      description: 'Choose whether to accept The Herald\'s offer',
      type: 'unique',
      instructions: 'Accept = massive power + corruption. Refuse = harder fight',
      successReward: 'Cosmic power (if accepted)',
      failureConsequence: 'Soul corruption (if accepted)',
    },
    {
      id: 'nightmare_manifestation',
      name: 'Personal Nightmares',
      description: 'Face your character\'s deepest fears',
      type: 'puzzle',
      instructions: 'Overcome manifested fears to remove debuffs',
      successReward: 'Cleansed of fear effects',
    },
  ],

  environmentEffects: [
    {
      id: 'abyss_corruption',
      name: 'The Abyss',
      description: 'The deepest part of The Scar corrupts everything',
      triggersAt: 'start',
      effect: {
        type: 'damage',
        target: 'player',
        power: 30,
      },
      duration: undefined,
    },
  ],

  playerLimit: {
    min: 1,
    max: 5,
    recommended: 5,
  },

  scaling: {
    healthPerPlayer: 80,
    damagePerPlayer: 20,
  },

  guaranteedDrops: [
    {
      itemId: 'heralds_crown',
      name: 'Crown of the Herald',
      rarity: 'mythic',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'prophecy_scroll',
      name: 'Scroll of Dark Prophecy',
      description: 'Contains terrible knowledge',
      rarity: 'legendary',
      dropChance: 0.5,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'corruption_crystal',
      name: 'Corruption Crystal',
      description: 'Solidified corruption energy',
      rarity: 'epic',
      dropChance: 0.7,
      minQuantity: 3,
      maxQuantity: 7,
    },
  ],

  goldReward: {
    min: 5000,
    max: 10000,
  },
  experienceReward: 15000,

  achievements: ['herald_banisher', 'refused_bargain', 'reality_defender'],
  titles: ['Banisher of The Herald', 'One Who Refused', 'Reality Defender'],
  firstKillBonus: {
    title: 'The One Who Banished The Herald',
    item: 'heralds_mask',
    gold: 5000,
  },

  difficulty: 10,
  enrageTimer: 40,
  canFlee: false,
  fleeConsequence: 'The Herald will haunt your nightmares forever',
};

/**
 * AVATAR OF WHAT-WAITS-BELOW - Ultimate Boss (L40)
 * The physical manifestation of the cosmic entity
 * Final boss of the cosmic storyline
 */
export const AVATAR: BossEncounter = {
  id: 'boss_avatar',
  name: 'Avatar of What-Waits-Below',
  title: 'The Awakened God',
  category: BossCategory.ULTIMATE,
  tier: BossTier.ULTIMATE,
  level: 40,

  description: 'The entity made flesh. Reality bends around it. Sanity shatters in its presence. It should not exist, yet it does.',
  backstory: 'For eons it slumbered beneath Sangre Territory, dreaming of stars and the end of all things. Now, through cult ritual or cosmic alignment or sheer will, it wakes. This is the Avatar - a fraction of its true power, yet more than enough to end the world.',
  defeatDialogue: '*It does not scream or rage. It simply... stops. The silence is deafening. Reality slowly reasserts itself. For now.*',
  victoryNarrative: 'The Avatar is defeated. What-Waits-Below retreats into slumber once more. But you know the truth - this was only a delay. One day, it will wake again. And next time, you might not be there to stop it.',

  location: 'The Heart of The Scar',
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 40,
      description: 'Must be level 40',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'cosmic_quest_finale',
      description: 'Complete the entire cosmic storyline',
    },
  ],
  respawnCooldown: 720, // 30 days

  health: 50000,
  damage: 300,
  defense: 120,
  criticalChance: 0.30,
  evasion: 0.20,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Awakening',
      description: 'It opens its eyes for the first time in millennia.',
      dialogue: '*A sound that is not sound reverberates through your bones: "AT LAST"*',
      abilities: ['cosmic_strike', 'reality_warp', 'sanity_obliteration'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 80,
      name: 'The Recognition',
      description: 'It notices you. You wish it hadn\'t.',
      dialogue: '*"MORTAL. INSECT. BRAVE INSECT."*',
      abilities: ['cosmic_strike', 'reality_warp', 'sanity_obliteration', 'void_cascade', 'dimensional_prison'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage',
        },
      ],
    },
    {
      phaseNumber: 3,
      healthThreshold: 60,
      name: 'The Interest',
      description: 'It finds you... entertaining.',
      dialogue: '*"YOU AMUSE US. SHOW US MORE."*',
      abilities: ['reality_warp', 'sanity_obliteration', 'void_cascade', 'dimensional_prison', 'time_fracture', 'summon_heralds'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage',
        },
      ],
      summonMinions: {
        type: 'lesser_herald',
        count: 4,
        spawnMessage: 'Reality tears open and heralds pour through!',
      },
    },
    {
      phaseNumber: 4,
      healthThreshold: 40,
      name: 'The Anger',
      description: 'You\'ve hurt it. It is... surprised.',
      dialogue: '*"IMPOSSIBLE. YOU... HURT... US?"*',
      abilities: ['void_cascade', 'dimensional_prison', 'time_fracture', 'reality_collapse', 'cosmic_devastation'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 2.0,
          description: '+100% damage',
        },
        {
          type: 'aggression',
          multiplier: 2.0,
          description: 'Attacks much more frequently',
        },
      ],
    },
    {
      phaseNumber: 5,
      healthThreshold: 20,
      name: 'The Desperation',
      description: 'It fights for its existence now.',
      dialogue: '*"NO. WE WILL NOT RETURN TO THE DARK. WE WILL NOT SLEEP AGAIN."*',
      abilities: ['time_fracture', 'reality_collapse', 'cosmic_devastation', 'apocalyptic_fury', 'end_of_all_things'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 3.0,
          description: '+200% damage',
        },
        {
          type: 'speed',
          multiplier: 2.0,
          description: '+100% speed',
        },
      ],
      environmentalHazard: {
        name: 'Reality Breakdown',
        description: 'Reality itself is collapsing',
        damagePerTurn: 200,
        avoidable: false,
      },
    },
  ],

  abilities: [
    {
      id: 'cosmic_strike',
      name: 'Cosmic Strike',
      description: 'A blow from beyond the stars',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 250,
      damageType: BossDamageType.CORRUPTION,
      avoidable: false,
      priority: 5,
      targetType: 'single',
    },
    {
      id: 'reality_warp',
      name: 'Reality Warp',
      description: 'Bends the laws of physics',
      type: BossAbilityType.DEBUFF,
      cooldown: 3,
      effect: {
        type: StatusEffect.CONFUSION,
        duration: 3,
        power: 60,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Anchor yourself to reality',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'sanity_obliteration',
      name: 'Sanity Obliteration',
      description: 'Your mind cannot process what it sees',
      type: BossAbilityType.DOT,
      cooldown: 2,
      effect: {
        type: StatusEffect.MADNESS,
        duration: 6,
        power: 100,
        stackable: true,
        maxStacks: 999,
        appliedAt: new Date(),
      },
      avoidable: false,
      priority: 8,
      targetType: 'all',
    },
    {
      id: 'void_cascade',
      name: 'Void Cascade',
      description: 'Unleashes waves of nothingness',
      type: BossAbilityType.AOE,
      cooldown: 4,
      damage: 400,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Find safe zones',
      telegraphMessage: 'Waves of void energy cascade outward!',
      priority: 9,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'dimensional_prison',
      name: 'Dimensional Prison',
      description: 'Traps you between dimensions',
      type: BossAbilityType.DEBUFF,
      cooldown: 6,
      damage: 200,
      damageType: BossDamageType.REALITY,
      effect: {
        type: StatusEffect.ROOT,
        duration: 4,
        power: 100,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Break free quickly',
      telegraphMessage: 'Reality folds around you!',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'time_fracture',
      name: 'Time Fracture',
      description: 'Breaks the flow of time',
      type: BossAbilityType.DEBUFF,
      cooldown: 7,
      effect: {
        type: StatusEffect.SLOW,
        duration: 5,
        power: 80,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: false,
      telegraphMessage: 'Time itself stutters and breaks...',
      priority: 9,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'summon_heralds',
      name: 'Summon Heralds',
      description: 'Calls its servants',
      type: BossAbilityType.SUMMON,
      cooldown: 10,
      avoidable: false,
      telegraphMessage: 'The Avatar calls for aid!',
      priority: 7,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'reality_collapse',
      name: 'Localized Reality Collapse',
      description: 'Destroys reality in a targeted area',
      type: BossAbilityType.ULTIMATE,
      cooldown: 8,
      damage: 800,
      damageType: BossDamageType.REALITY,
      avoidable: true,
      avoidMechanic: 'Flee the collapse zone',
      telegraphMessage: 'REALITY IS ENDING',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all',
    },
    {
      id: 'cosmic_devastation',
      name: 'Cosmic Devastation',
      description: 'Pure cosmic power',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 600,
      damageType: BossDamageType.CORRUPTION,
      avoidable: false,
      telegraphMessage: 'The Avatar unleashes its full power!',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all',
    },
    {
      id: 'apocalyptic_fury',
      name: 'Apocalyptic Fury',
      description: 'Desperate unleashing of all power',
      type: BossAbilityType.ULTIMATE,
      cooldown: 5,
      damage: 1000,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Coordinated group defense',
      telegraphMessage: 'THE AVATAR RAGES',
      priority: 10,
      requiresPhase: 5,
      targetType: 'all',
    },
    {
      id: 'end_of_all_things',
      name: 'End of All Things',
      description: 'Final desperate gambit to destroy everything',
      type: BossAbilityType.ULTIMATE,
      cooldown: 20,
      damage: 9999,
      damageType: BossDamageType.REALITY,
      avoidable: true,
      avoidMechanic: 'Kill the Avatar before cast completes (10 turns)',
      telegraphMessage: 'THE END HAS COME',
      priority: 10,
      requiresPhase: 5,
      targetType: 'all',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 2.0,
      description: 'Sacred weapons are the only reliable way to harm it',
    },
  ],
  immunities: [BossDamageType.PHYSICAL, BossDamageType.POISON, BossDamageType.PSYCHIC, BossDamageType.FROST],

  specialMechanics: [
    {
      id: 'reality_anchors_ultimate',
      name: 'Maintain Reality',
      description: 'Keep reality anchored or die',
      type: 'coordination',
      instructions: 'All players must maintain reality anchors',
      failureConsequence: 'Total party wipe from reality collapse',
    },
    {
      id: 'sanity_battle',
      name: 'Battle of Minds',
      description: 'Fight on the mental plane as well as physical',
      type: 'unique',
      instructions: 'Use sanity-restoring items and abilities constantly',
      failureConsequence: 'Permanent madness',
    },
    {
      id: 'final_choice',
      name: 'The Final Choice',
      description: 'At 5% health, choose the Avatar\'s fate',
      type: 'puzzle',
      instructions: 'Banish, destroy, bargain, or awaken fully',
      successReward: 'Different rewards and endings',
    },
  ],

  environmentEffects: [
    {
      id: 'scar_heart',
      name: 'Heart of The Scar',
      description: 'The source of all corruption',
      triggersAt: 'start',
      effect: {
        type: 'damage',
        target: 'player',
        power: 50,
      },
      duration: undefined,
    },
  ],

  playerLimit: {
    min: 5,
    max: 10,
    recommended: 8,
  },

  scaling: {
    healthPerPlayer: 100,
    damagePerPlayer: 25,
    unlockMechanics: [
      {
        playerCount: 8,
        mechanics: ['reality_storm'],
      },
    ],
  },

  guaranteedDrops: [
    {
      itemId: 'avatars_heart',
      name: 'Heart of the Avatar',
      rarity: 'mythic',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'cosmic_essence',
      name: 'Cosmic Essence',
      description: 'The power of a god',
      rarity: 'mythic',
      dropChance: 0.8,
      minQuantity: 5,
      maxQuantity: 10,
    },
    {
      itemId: 'reality_core',
      name: 'Reality Core',
      description: 'The fabric of existence made solid',
      rarity: 'legendary',
      dropChance: 1.0,
      minQuantity: 3,
      maxQuantity: 5,
    },
  ],

  goldReward: {
    min: 10000,
    max: 20000,
  },
  experienceReward: 50000,

  achievements: ['god_slayer', 'reality_savior', 'ultimate_victory'],
  titles: ['God Slayer', 'Savior of Reality', 'The Ultimate'],
  firstKillBonus: {
    title: 'The One Who Defeated a God',
    item: 'crown_of_eternity',
    gold: 10000,
  },

  difficulty: 10,
  enrageTimer: 60,
  canFlee: false,
  fleeConsequence: 'The world ends if you flee',
};

/**
 * Export all cosmic horror bosses
 */
export const COSMIC_HORROR_BOSSES: BossEncounter[] = [
  THE_MAW,
  THE_HERALD,
  AVATAR,
];
