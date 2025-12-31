/**
 * Divine Struggle Bosses - Angels & Demons System
 *
 * Celestial and demonic entities from The Rift and beyond
 * These bosses represent the eternal struggle between Heaven and Hell
 * Rebranded from cosmicBosses.ts (cosmic horror → angels & demons)
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
 * THE DEVOURER - Zone Boss (L32)
 * A demon of hunger that tears at the fabric of reality
 * First major divine struggle encounter
 */
export const THE_DEVOURER: BossEncounter = {
  id: 'boss_the_devourer',
  name: 'The Devourer',
  title: 'Demon of Endless Hunger',
  category: BossCategory.COSMIC_HORROR, // Keep for compatibility
  tier: BossTier.LEGENDARY,
  level: 32,

  description: 'A writhing mass of darkness and teeth, a demon that consumes souls and faith alike.',
  backstory: 'The Devourer emerged from The Rift fifteen years ago. It feeds on souls, faith, and hope. Those who approach feel their very being drawn into its maw.',
  defeatDialogue: '*The demon collapses with a howl of rage. For a moment, you glimpse Hell itself - and wish you hadn\'t.*',
  victoryNarrative: 'The Devourer is banished, but you know it wasn\'t destroyed. In Hell, it still hungers. It always will.',

  location: 'The Rift - Outer Waste',
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 30,
      description: 'Must be level 30 or higher',
    },
    {
      type: BossSpawnConditionType.LOCATION,
      value: 'the_rift',
      description: 'Must be within The Rift',
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
      description: 'The Devourer reaches for your soul.',
      dialogue: '*A voice of grinding bones: "Your faith... give it to me."*',
      abilities: ['soul_pull', 'consume', 'faith_drain'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 75,
      name: 'The Feast',
      description: 'The demon opens its maw wider, reality distorting.',
      dialogue: '*The air itself screams as the veil thins*',
      abilities: ['soul_pull', 'consume', 'faith_drain', 'hellfire_rift', 'soul_erasure'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage',
        },
      ],
      environmentalHazard: {
        name: 'Hellish Corruption',
        description: 'The boundary between worlds weakens',
        damagePerTurn: 25,
        avoidable: false,
      },
    },
    {
      phaseNumber: 3,
      healthThreshold: 50,
      name: 'The Abyss',
      description: 'The Devourer attempts to fully manifest.',
      dialogue: '*Colors of hellfire bleed into your vision. Your soul trembles.*',
      abilities: ['consume', 'faith_drain', 'hellfire_rift', 'soul_erasure', 'consume_faith'],
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
      description: 'The boundary between Hell and Earth crumbles.',
      dialogue: '*There are no words for what you witness. Only screams.*',
      abilities: ['consume', 'soul_erasure', 'consume_faith', 'hellgate_collapse'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 2.0,
          description: '+100% damage',
        },
      ],
      summonMinions: {
        type: 'lesser_demon',
        count: 5,
        spawnMessage: 'Lesser demons claw their way from the rift!',
      },
    },
    {
      phaseNumber: 5,
      healthThreshold: 10,
      name: 'Desperation',
      description: 'The Devourer makes one final attempt to consume everything.',
      dialogue: '*HUNGER HUNGER HUNGER HUNGER*',
      abilities: ['hellgate_collapse', 'ultimate_consumption'],
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
      id: 'soul_pull',
      name: 'Soul Pull',
      description: 'Pulls at your very soul',
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
      avoidMechanic: 'Anchor your faith',
      priority: 5,
      targetType: 'all',
    },
    {
      id: 'consume',
      name: 'Consume',
      description: 'Devours a portion of your soul',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 120,
      damageType: BossDamageType.VOID,
      avoidable: false,
      priority: 6,
      targetType: 'single',
    },
    {
      id: 'faith_drain',
      name: 'Faith Drain',
      description: 'Looking at the demon shakes your faith',
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
      avoidMechanic: 'Pray and look away',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'hellfire_rift',
      name: 'Hellfire Rift',
      description: 'Tears open portals to Hell',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 180,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Avoid the hellfire',
      telegraphMessage: 'Hell itself reaches through...',
      priority: 8,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'soul_erasure',
      name: 'Soul Erasure',
      description: 'Attempts to consume your soul entirely',
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
      telegraphMessage: 'You feel your soul slipping away...',
      priority: 10,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'consume_faith',
      name: 'Consume Faith',
      description: 'Devours the faith around you',
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
      id: 'hellgate_collapse',
      name: 'Hellgate Collapse',
      description: 'The barrier between worlds fails',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 8,
      damage: 400,
      damageType: BossDamageType.REALITY,
      avoidable: true,
      avoidMechanic: 'Flee to consecrated ground',
      telegraphMessage: 'THE GATES OF HELL OPEN',
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
      telegraphMessage: 'THE DEVOURER OPENS COMPLETELY',
      priority: 10,
      requiresPhase: 5,
      targetType: 'all',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.4,
      description: 'Holy weapons harm it greatly',
    },
    {
      damageType: BossDamageType.REALITY,
      multiplier: 1.3,
      description: 'Faith-anchoring attacks effective',
    },
  ],
  immunities: [BossDamageType.PHYSICAL, BossDamageType.POISON, BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'holy_anchors',
      name: 'Place Holy Anchors',
      description: 'Anchor the veil to prevent collapse',
      type: 'puzzle',
      instructions: 'Place 4 blessed anchors around The Devourer to seal the rift',
      successReward: 'Massively reduced hellfire damage',
      failureConsequence: 'Hell breaks through, instant death',
    },
    {
      id: 'faith_management',
      name: 'Maintain Faith',
      description: 'Keep your faith above critical levels',
      type: 'unique',
      instructions: 'Use prayer and blessed items when faith wavers',
      failureConsequence: 'Permanent spiritual wounds',
    },
  ],

  environmentEffects: [
    {
      id: 'rift_corruption',
      name: 'Rift Corruption',
      description: 'The Rift itself damages your soul',
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
      itemId: 'demon_heart',
      name: 'Heart of the Devourer',
      rarity: 'mythic',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'infernal_fragment',
      name: 'Infernal Fragment',
      description: 'A piece of Hell itself',
      rarity: 'legendary',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 3,
    },
    {
      itemId: 'demon_essence',
      name: 'Demonic Essence',
      description: 'Pure malevolence made manifest',
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

  achievements: ['demon_slayer', 'faith_anchor', 'devourer_banisher'],
  titles: ['Demon Slayer', 'Anchor of Faith', 'Banisher of The Devourer'],
  firstKillBonus: {
    title: 'The One Who Sealed The Devourer',
    item: 'devourer_trophy',
    gold: 2000,
  },

  difficulty: 10,
  enrageTimer: 30,
  canFlee: true,
  fleeConsequence: 'Permanent spiritual damage from what you witnessed',
};

/**
 * THE FALLEN SERAPH - Event Boss (L40)
 * A fallen angel who serves The Bound One
 * Appears during major divine events
 */
export const THE_FALLEN_SERAPH: BossEncounter = {
  id: 'boss_fallen_seraph',
  name: 'The Fallen Seraph',
  title: 'Voice of The Bound One',
  category: BossCategory.COSMIC_HORROR,
  tier: BossTier.MYTHIC,
  level: 40,

  description: 'Once an angel of the highest order, now twisted by service to the imprisoned demon lord.',
  backstory: 'The Fallen Seraph is the mouthpiece of The Bound One. It speaks prophecies of damnation, offers dark bargains, and prepares the world for its master\'s freedom. It cannot be killed, only banished.',
  defeatDialogue: '"I am eternal. I am inevitable. My master stirs, and when it breaks free, you will all kneel... or burn." *It dissolves into shadows and feathers*',
  victoryNarrative: 'The Seraph is banished, but its words echo in your mind. "This changes nothing," it said. You fear it might be right.',

  location: 'The Rift - The Abyss',
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 38,
      description: 'Must be level 38 or higher',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'divine_quest_act4_finale',
      description: 'Reach Act 4 of the divine path',
    },
  ],
  respawnCooldown: 336,

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
      description: 'The Seraph delivers its master\'s words.',
      dialogue: '"My master speaks. Will you listen, or will you perish in ignorance?"',
      abilities: ['divine_strike', 'whispers_of_damnation', 'form_shift'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 80,
      name: 'The Temptation',
      description: 'The Seraph offers power in exchange for your soul.',
      dialogue: '"Join us. Serve the inevitable. Be spared what is to come."',
      abilities: ['divine_strike', 'whispers_of_damnation', 'form_shift', 'dark_covenant', 'veil_tear'],
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
      name: 'The Revelation',
      description: 'Refused, The Seraph shows glimpses of damnation.',
      dialogue: '"Then witness what awaits. See Hell. Despair."',
      abilities: ['whispers_of_damnation', 'form_shift', 'dark_covenant', 'veil_tear', 'hellfire_vision', 'summon_demons'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.4,
          description: '+40% damage',
        },
      ],
      summonMinions: {
        type: 'nightmare_demon',
        count: 3,
        spawnMessage: 'Your deepest sins manifest as demons!',
      },
    },
    {
      phaseNumber: 4,
      healthThreshold: 40,
      name: 'The Wrath',
      description: 'Angered by resistance, The Seraph unleashes divine fury.',
      dialogue: '"You dare? You DARE?! My master will DEVOUR your soul!"',
      abilities: ['veil_tear', 'hellfire_vision', 'summon_demons', 'seraph_wrath', 'divine_annihilation'],
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
      description: 'The Seraph channels its master\'s power directly.',
      dialogue: '"IT STIRS. IT WAKES. IT COMES."',
      abilities: ['divine_annihilation', 'channel_below', 'apocalypse'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 2.5,
          description: '+150% damage',
        },
      ],
      environmentalHazard: {
        name: 'Master\'s Presence',
        description: 'The Bound One reaches through The Seraph',
        damagePerTurn: 100,
        avoidable: false,
      },
    },
  ],

  abilities: [
    {
      id: 'divine_strike',
      name: 'Corrupted Divine Strike',
      description: 'The Seraph knows where your soul is weakest',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 180,
      damageType: BossDamageType.PSYCHIC,
      avoidable: false,
      priority: 5,
      targetType: 'single',
    },
    {
      id: 'whispers_of_damnation',
      name: 'Whispers of Damnation',
      description: 'Forbidden truths corrupt your soul',
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
      avoidMechanic: 'High Spirit and prayer resist',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'form_shift',
      name: 'Angelic/Demonic Shift',
      description: 'Shifts between angelic beauty and demonic horror',
      type: BossAbilityType.BUFF,
      cooldown: 4,
      avoidable: false,
      telegraphMessage: 'The Seraph\'s form ripples between grace and horror...',
      priority: 6,
      targetType: 'single',
    },
    {
      id: 'dark_covenant',
      name: 'Dark Covenant',
      description: 'Offers power at the cost of your soul',
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
      avoidMechanic: 'Refuse the bargain',
      telegraphMessage: '"Accept my gift... what is your soul worth?"',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'veil_tear',
      name: 'Tear the Veil',
      description: 'Rips holes between Heaven, Hell, and Earth',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 250,
      damageType: BossDamageType.REALITY,
      avoidable: true,
      avoidMechanic: 'Avoid the tears',
      telegraphMessage: 'The veil between worlds tears!',
      priority: 9,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'hellfire_vision',
      name: 'Vision of Damnation',
      description: 'Shows you your own damnation',
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
      avoidMechanic: 'Close your mind through prayer',
      telegraphMessage: 'You see your soul burning in Hell...',
      priority: 8,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'summon_demons',
      name: 'Summon Demons',
      description: 'Manifests demons from your sins',
      type: BossAbilityType.SUMMON,
      cooldown: 8,
      avoidable: false,
      telegraphMessage: 'Your sins take demonic form!',
      priority: 7,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'seraph_wrath',
      name: 'Seraph\'s Wrath',
      description: 'Unleashes tremendous corrupted divine power',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 400,
      damageType: BossDamageType.CORRUPTION,
      avoidable: false,
      telegraphMessage: 'The Seraph glows with hellish light!',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all',
    },
    {
      id: 'divine_annihilation',
      name: 'Divine Annihilation',
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
      name: 'Channel The Bound One',
      description: 'Becomes a conduit for the imprisoned demon lord',
      type: BossAbilityType.BUFF,
      cooldown: 10,
      avoidable: false,
      telegraphMessage: 'The Seraph\'s eyes become pits of hellfire...',
      priority: 10,
      requiresPhase: 5,
      targetType: 'single',
    },
    {
      id: 'apocalypse',
      name: 'Apocalypse',
      description: 'The end of all souls',
      type: BossAbilityType.ULTIMATE,
      cooldown: 15,
      damage: 999,
      damageType: BossDamageType.REALITY,
      avoidable: true,
      avoidMechanic: 'Banish The Seraph before cast completes',
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
      description: 'Pure holy power still harms it',
    },
  ],
  immunities: [BossDamageType.PHYSICAL, BossDamageType.POISON],

  specialMechanics: [
    {
      id: 'covenant_choice',
      name: 'The Dark Covenant',
      description: 'Choose whether to accept The Seraph\'s offer',
      type: 'unique',
      instructions: 'Accept = massive power + sin. Refuse = harder fight',
      successReward: 'Infernal power (if accepted)',
      failureConsequence: 'Soul corruption (if accepted)',
    },
    {
      id: 'sin_manifestation',
      name: 'Personal Sins',
      description: 'Face your character\'s deepest sins as demons',
      type: 'puzzle',
      instructions: 'Overcome manifested sins to remove debuffs',
      successReward: 'Cleansed of fear effects',
    },
  ],

  environmentEffects: [
    {
      id: 'abyss_corruption',
      name: 'The Abyss',
      description: 'The deepest part of The Rift corrupts everything',
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
      itemId: 'seraphs_halo',
      name: 'Corrupted Halo of the Seraph',
      rarity: 'mythic',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'prophecy_scroll',
      name: 'Scroll of Dark Prophecy',
      description: 'Contains terrible knowledge of damnation',
      rarity: 'legendary',
      dropChance: 0.5,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'sin_crystal',
      name: 'Crystallized Sin',
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

  achievements: ['seraph_banisher', 'refused_covenant', 'veil_defender'],
  titles: ['Banisher of The Seraph', 'One Who Refused', 'Defender of the Veil'],
  firstKillBonus: {
    title: 'The One Who Banished The Fallen Seraph',
    item: 'seraphs_mask',
    gold: 5000,
  },

  difficulty: 10,
  enrageTimer: 40,
  canFlee: false,
  fleeConsequence: 'The Seraph will haunt your soul forever',
};

/**
 * THE BOUND ONE - Ultimate Boss (L40)
 * The imprisoned demon lord beneath The Rift
 * Final boss of the divine struggle storyline
 */
export const THE_BOUND_ONE: BossEncounter = {
  id: 'boss_bound_one',
  name: 'The Bound One',
  title: 'The Imprisoned God of Damnation',
  category: BossCategory.ULTIMATE,
  tier: BossTier.ULTIMATE,
  level: 40,

  description: 'The demon lord made manifest. Reality bends around it. Faith shatters in its presence. It is damnation given form.',
  backstory: 'For eons it was bound beneath Sangre Territory by angels who sacrificed everything. Now, through cult ritual or weakening seals, it stirs. This is but an Avatar - a fraction of its true power, yet more than enough to damn the world.',
  defeatDialogue: '*It does not scream or rage. It simply... returns to slumber. The silence is deafening. For now.*',
  victoryNarrative: 'The Bound One retreats into imprisonment once more. But you know the truth - this was only a delay. One day, the seals will break. And next time, you might not be there to stop it.',

  location: 'The Rift - The Heart',
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 40,
      description: 'Must be level 40',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'divine_quest_finale',
      description: 'Complete the entire divine path',
    },
  ],
  respawnCooldown: 720,

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
      dialogue: '*A voice like thunder from Hell: "AT LAST"*',
      abilities: ['infernal_strike', 'reality_warp', 'faith_obliteration'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 80,
      name: 'The Recognition',
      description: 'It notices you. You wish it hadn\'t.',
      dialogue: '*"MORTAL. WORM. BRAVE WORM."*',
      abilities: ['infernal_strike', 'reality_warp', 'faith_obliteration', 'hellfire_cascade', 'soul_prison'],
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
      dialogue: '*"YOU AMUSE ME. SHOW ME MORE."*',
      abilities: ['reality_warp', 'faith_obliteration', 'hellfire_cascade', 'soul_prison', 'time_fracture', 'summon_legion'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage',
        },
      ],
      summonMinions: {
        type: 'lesser_demon_lord',
        count: 4,
        spawnMessage: 'Hell tears open and demons pour through!',
      },
    },
    {
      phaseNumber: 4,
      healthThreshold: 40,
      name: 'The Anger',
      description: 'You\'ve hurt it. It is... surprised.',
      dialogue: '*"IMPOSSIBLE. YOU... HURT... ME?"*',
      abilities: ['hellfire_cascade', 'soul_prison', 'time_fracture', 'veil_collapse', 'infernal_devastation'],
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
      description: 'It fights for its freedom now.',
      dialogue: '*"NO. I WILL NOT RETURN TO THE CHAINS. I WILL NOT SLEEP AGAIN."*',
      abilities: ['time_fracture', 'veil_collapse', 'infernal_devastation', 'apocalyptic_fury', 'damnation_eternal'],
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
        description: 'The boundary between Hell and Earth collapses',
        damagePerTurn: 200,
        avoidable: false,
      },
    },
  ],

  abilities: [
    {
      id: 'infernal_strike',
      name: 'Infernal Strike',
      description: 'A blow from the depths of Hell',
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
      description: 'Bends the laws of existence',
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
      avoidMechanic: 'Anchor yourself through prayer',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'faith_obliteration',
      name: 'Faith Obliteration',
      description: 'Your soul cannot process its presence',
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
      id: 'hellfire_cascade',
      name: 'Hellfire Cascade',
      description: 'Unleashes waves of hellfire',
      type: BossAbilityType.AOE,
      cooldown: 4,
      damage: 400,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Find blessed ground',
      telegraphMessage: 'Waves of hellfire cascade outward!',
      priority: 9,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'soul_prison',
      name: 'Soul Prison',
      description: 'Traps your soul between worlds',
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
      avoidMechanic: 'Break free through faith',
      telegraphMessage: 'Your soul is being imprisoned!',
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
      id: 'summon_legion',
      name: 'Summon Legion',
      description: 'Calls its demonic servants',
      type: BossAbilityType.SUMMON,
      cooldown: 10,
      avoidable: false,
      telegraphMessage: 'The Bound One calls its legion!',
      priority: 7,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'veil_collapse',
      name: 'Localized Veil Collapse',
      description: 'Destroys the barrier in a targeted area',
      type: BossAbilityType.ULTIMATE,
      cooldown: 8,
      damage: 800,
      damageType: BossDamageType.REALITY,
      avoidable: true,
      avoidMechanic: 'Flee to consecrated ground',
      telegraphMessage: 'THE VEIL IS COLLAPSING',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all',
    },
    {
      id: 'infernal_devastation',
      name: 'Infernal Devastation',
      description: 'Pure demonic power',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 600,
      damageType: BossDamageType.CORRUPTION,
      avoidable: false,
      telegraphMessage: 'The Bound One unleashes its full power!',
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
      avoidMechanic: 'Coordinated group prayer and defense',
      telegraphMessage: 'THE BOUND ONE RAGES',
      priority: 10,
      requiresPhase: 5,
      targetType: 'all',
    },
    {
      id: 'damnation_eternal',
      name: 'Damnation Eternal',
      description: 'Final desperate gambit to damn all souls',
      type: BossAbilityType.ULTIMATE,
      cooldown: 20,
      damage: 9999,
      damageType: BossDamageType.REALITY,
      avoidable: true,
      avoidMechanic: 'Seal The Bound One before cast completes (10 turns)',
      telegraphMessage: 'DAMNATION HAS COME',
      priority: 10,
      requiresPhase: 5,
      targetType: 'all',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 2.0,
      description: 'Holy weapons blessed by true faith are the only reliable way to harm it',
    },
  ],
  immunities: [BossDamageType.PHYSICAL, BossDamageType.POISON, BossDamageType.PSYCHIC, BossDamageType.FROST],

  specialMechanics: [
    {
      id: 'seal_anchors',
      name: 'Maintain the Seals',
      description: 'Keep the divine seals active or all is lost',
      type: 'coordination',
      instructions: 'All players must maintain blessed seal anchors',
      failureConsequence: 'Total party damnation from seal failure',
    },
    {
      id: 'faith_battle',
      name: 'Battle of Souls',
      description: 'Fight on the spiritual plane as well as physical',
      type: 'unique',
      instructions: 'Use prayer and blessed items constantly',
      failureConsequence: 'Permanent spiritual wounds',
    },
    {
      id: 'final_judgment',
      name: 'The Final Judgment',
      description: 'At 5% health, choose The Bound One\'s fate',
      type: 'puzzle',
      instructions: 'Seal forever, destroy utterly, make covenant, or free completely',
      successReward: 'Different rewards and endings',
    },
  ],

  environmentEffects: [
    {
      id: 'rift_heart',
      name: 'Heart of The Rift',
      description: 'The source of all corruption in this land',
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
        mechanics: ['hellfire_storm'],
      },
    ],
  },

  guaranteedDrops: [
    {
      itemId: 'bound_ones_chain',
      name: 'Chain of The Bound One',
      rarity: 'mythic',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'infernal_essence',
      name: 'Infernal Essence',
      description: 'The power of a demon lord',
      rarity: 'mythic',
      dropChance: 0.8,
      minQuantity: 5,
      maxQuantity: 10,
    },
    {
      itemId: 'seal_fragment',
      name: 'Divine Seal Fragment',
      description: 'A piece of the ancient seals',
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

  achievements: ['demon_lord_sealer', 'faith_savior', 'ultimate_victory'],
  titles: ['Sealer of Demon Lords', 'Savior of Faith', 'The Ultimate'],
  firstKillBonus: {
    title: 'The One Who Sealed The Bound One',
    item: 'crown_of_salvation',
    gold: 10000,
  },

  difficulty: 10,
  enrageTimer: 60,
  canFlee: false,
  fleeConsequence: 'The world is damned if you flee',
};

/**
 * Export all divine struggle bosses
 */
export const DIVINE_STRUGGLE_BOSSES: BossEncounter[] = [
  THE_DEVOURER,
  THE_FALLEN_SERAPH,
  THE_BOUND_ONE,
];

// Backwards compatibility - export with old names
export const THE_MAW = THE_DEVOURER;
export const THE_HERALD = THE_FALLEN_SERAPH;
export const AVATAR = THE_BOUND_ONE;
export const COSMIC_HORROR_BOSSES = DIVINE_STRUGGLE_BOSSES;
