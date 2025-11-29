/**
 * Legendary Animal Bosses - Phase 14, Wave 14.2
 *
 * Legendary creatures that roam the wilderness of Sangre Territory
 * These are the ultimate hunting challenges
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
 * OLD RED - The Demon Bear (L25)
 * A massive grizzly bear corrupted by proximity to The Scar
 * Known for brutal strength and unstoppable rage
 */
export const OLD_RED: BossEncounter = {
  id: 'boss_old_red',
  name: 'Old Red',
  title: 'The Demon Bear',
  category: BossCategory.LEGENDARY_ANIMAL,
  tier: BossTier.EPIC,
  level: 25,

  description: 'A massive grizzly bear with crimson-stained fur and eyes that burn with unnatural fury.',
  backstory: 'Old Red was once a normal grizzly bear until it wandered too close to The Scar. The cosmic energies twisted it into something far more dangerous - a creature of rage and hunger that has claimed dozens of lives. Nahi elders speak of it as a warning of what lurks in the corrupted lands.',
  defeatDialogue: 'The great beast falls with a thunderous crash, its crimson fur stained darker with blood. For a moment, its eyes clear, and you see only a tortured animal seeking release.',
  victoryNarrative: 'Old Red is dead. The wilderness breathes a sigh of relief, but you wonder how many more creatures have been twisted by the corruption to the west.',

  location: 'Deep Wilderness',
  alternateLocations: ['Mountain Trail', 'Pine Forest'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 20,
      description: 'Must be level 20 or higher',
    },
    {
      type: BossSpawnConditionType.TIME_OF_DAY,
      value: 'dusk',
      description: 'Only spawns at dusk (6pm-8pm)',
    },
  ],
  respawnCooldown: 48, // 2 days

  health: 3500,
  damage: 120,
  defense: 60,
  criticalChance: 0.15,
  evasion: 0.05,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Hunt',
      description: 'Old Red sizes you up, circling with predatory patience.',
      dialogue: '*A deep growl rumbles from the massive bear\'s chest as it locks eyes with you*',
      abilities: ['bear_swipe', 'roar'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 66,
      name: 'Enraged',
      description: 'Wounded, Old Red becomes a whirlwind of claws and fury.',
      dialogue: '*Old Red roars with primordial rage, its eyes burning crimson*',
      abilities: ['bear_swipe', 'roar', 'rampage', 'bleeding_strike'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.25,
          description: '+25% damage',
        },
        {
          type: 'speed',
          multiplier: 1.2,
          description: '+20% speed',
        },
      ],
    },
    {
      phaseNumber: 3,
      healthThreshold: 33,
      name: 'Demon Unleashed',
      description: 'The corruption fully manifests. Old Red becomes a nightmare made flesh.',
      dialogue: '*The bear\'s fur ripples with unnatural energy. This is no longer just an animal.*',
      abilities: ['bear_swipe', 'roar', 'rampage', 'bleeding_strike', 'corrupted_fury'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage',
        },
        {
          type: 'defense',
          multiplier: 0.8,
          description: '-20% defense (reckless)',
        },
      ],
      environmentalHazard: {
        name: 'Corrupted Aura',
        description: 'The corruption emanating from Old Red damages you each turn',
        damagePerTurn: 15,
        avoidable: false,
      },
    },
  ],

  abilities: [
    {
      id: 'bear_swipe',
      name: 'Bear Swipe',
      description: 'A powerful claw strike',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 100,
      damageType: BossDamageType.PHYSICAL,
      avoidable: false,
      priority: 5,
      targetType: 'single',
    },
    {
      id: 'roar',
      name: 'Terrifying Roar',
      description: 'A deafening roar that strikes fear',
      type: BossAbilityType.DEBUFF,
      cooldown: 3,
      effect: {
        type: StatusEffect.FEAR,
        duration: 2,
        power: 20,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'High Spirit stat resists',
      telegraphMessage: 'Old Red takes a deep breath...',
      priority: 3,
      targetType: 'all',
    },
    {
      id: 'rampage',
      name: 'Rampage',
      description: 'A wild charging attack',
      type: BossAbilityType.AOE,
      cooldown: 4,
      damage: 80,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Dodge with high Combat skill',
      telegraphMessage: 'Old Red lowers its head and prepares to charge!',
      priority: 7,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'bleeding_strike',
      name: 'Bleeding Strike',
      description: 'Vicious claws that cause bleeding',
      type: BossAbilityType.DOT,
      cooldown: 3,
      damage: 60,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.BLEED,
        duration: 3,
        power: 25,
        stackable: true,
        maxStacks: 3,
        appliedAt: new Date(),
      },
      avoidable: false,
      priority: 6,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'corrupted_fury',
      name: 'Corrupted Fury',
      description: 'Unleashes the full power of the corruption',
      type: BossAbilityType.ULTIMATE,
      cooldown: 5,
      damage: 150,
      damageType: BossDamageType.CORRUPTION,
      effect: {
        type: StatusEffect.WEAKNESS,
        duration: 3,
        power: 30,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: false,
      telegraphMessage: 'Crimson energy erupts from Old Red\'s body!',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.FIRE,
      multiplier: 1.3,
      description: 'Vulnerable to fire damage',
    },
  ],
  immunities: [BossDamageType.POISON],

  specialMechanics: [
    {
      id: 'bear_trap',
      name: 'Set Trap',
      description: 'Place a bear trap before the fight for bonus damage',
      type: 'unique',
      instructions: 'Use a Bear Trap item during combat to deal 200 damage and stun for 1 turn',
      successReward: 'Massive damage and breathing room',
    },
  ],

  environmentEffects: [
    {
      id: 'forest_cover',
      name: 'Dense Forest',
      description: 'The thick trees provide some cover',
      triggersAt: 'start',
      effect: {
        type: 'buff',
        target: 'player',
        power: 10,
      },
      counterplay: 'Stay near trees to reduce damage taken',
    },
  ],

  playerLimit: {
    min: 1,
    max: 3,
    recommended: 2,
  },

  scaling: {
    healthPerPlayer: 50,
    damagePerPlayer: 15,
  },

  guaranteedDrops: [
    {
      itemId: 'old_red_pelt',
      name: 'Old Red\'s Crimson Pelt',
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'bear_fang_necklace',
      name: 'Bear Fang Necklace',
      description: 'A powerful charm made from Old Red\'s fangs',
      rarity: 'epic',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'corrupted_claw',
      name: 'Corrupted Bear Claw',
      description: 'A claw infused with dark energy',
      rarity: 'rare',
      dropChance: 0.6,
      minQuantity: 1,
      maxQuantity: 3,
    },
    {
      itemId: 'demon_bear_meat',
      name: 'Demon Bear Meat',
      description: 'Surprisingly edible, though it glows faintly',
      rarity: 'uncommon',
      dropChance: 0.8,
      minQuantity: 3,
      maxQuantity: 8,
    },
  ],

  goldReward: {
    min: 800,
    max: 1500,
  },
  experienceReward: 3000,

  achievements: ['legendary_hunter', 'demon_slayer'],
  titles: ['Demon Slayer', 'Bear Hunter'],
  firstKillBonus: {
    title: 'Slayer of Old Red',
    item: 'old_red_trophy',
    gold: 500,
  },

  difficulty: 7,
  canFlee: true,
  fleeConsequence: 'Old Red will remember you and be more aggressive on next encounter',
};

/**
 * GHOST CAT - The Phantom Cougar (L28)
 * An ethereal mountain lion that phases in and out of reality
 * Known for stealth and supernatural abilities
 */
export const GHOST_CAT: BossEncounter = {
  id: 'boss_ghost_cat',
  name: 'Ghost Cat',
  title: 'The Phantom Cougar',
  category: BossCategory.LEGENDARY_ANIMAL,
  tier: BossTier.EPIC,
  level: 28,

  description: 'A spectral mountain lion that flickers between visibility and invisibility, leaving only whispers and corpses in its wake.',
  backstory: 'No one knows if Ghost Cat was always supernatural or if it died and returned. Nahi shamans claim it guards a sacred site and punishes trespassers. Settlers just know it\'s a ghost story that kills.',
  defeatDialogue: '*The phantom form solidifies for the first time in decades, revealing a scarred but majestic cougar. It purrs softly before fading into light.*',
  victoryNarrative: 'The Ghost Cat is no more. The mountain feels emptier now, as if something ancient and beautiful has departed forever.',

  location: 'Rocky Cliffs',
  alternateLocations: ['Mountain Trail', 'Deep Wilderness'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 25,
      description: 'Must be level 25 or higher',
    },
    {
      type: BossSpawnConditionType.TIME_OF_DAY,
      value: 'night',
      description: 'Only spawns at night (8pm-5am)',
    },
    {
      type: BossSpawnConditionType.MOON_PHASE,
      value: 'full_moon',
      description: 'Only during full moon',
    },
  ],
  respawnCooldown: 72, // 3 days

  health: 3000,
  damage: 140,
  defense: 40,
  criticalChance: 0.30,
  evasion: 0.35,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Stalker',
      description: 'Ghost Cat watches from the shadows, testing your awareness.',
      dialogue: '*You hear a low growl, but when you turn, there\'s nothing there*',
      abilities: ['phantom_strike', 'vanish'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 66,
      name: 'Phase Shift',
      description: 'The cougar begins phasing rapidly between dimensions.',
      dialogue: '*The Ghost Cat splits into multiple afterimages, each one ready to strike*',
      abilities: ['phantom_strike', 'vanish', 'mirror_images', 'bleeding_pounce'],
      modifiers: [
        {
          type: 'evasion',
          multiplier: 1.5,
          description: '+50% evasion',
        },
      ],
    },
    {
      phaseNumber: 3,
      healthThreshold: 33,
      name: 'Fully Manifested',
      description: 'Desperate, Ghost Cat becomes fully corporeal but terrifyingly fast.',
      dialogue: '*The phantom form solidifies, revealing a creature of pure predatory perfection*',
      abilities: ['phantom_strike', 'bleeding_pounce', 'death_from_above', 'spectral_rend'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.4,
          description: '+40% damage',
        },
        {
          type: 'speed',
          multiplier: 1.6,
          description: '+60% speed',
        },
        {
          type: 'evasion',
          multiplier: 0.7,
          description: '-30% evasion (more tangible)',
        },
      ],
    },
  ],

  abilities: [
    {
      id: 'phantom_strike',
      name: 'Phantom Strike',
      description: 'Attacks from stealth',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 110,
      damageType: BossDamageType.PHYSICAL,
      avoidable: false,
      priority: 5,
      targetType: 'single',
    },
    {
      id: 'vanish',
      name: 'Vanish',
      description: 'Becomes invisible for one turn',
      type: BossAbilityType.BUFF,
      cooldown: 4,
      avoidable: false,
      priority: 8,
      targetType: 'single',
    },
    {
      id: 'mirror_images',
      name: 'Mirror Images',
      description: 'Creates phantom duplicates',
      type: BossAbilityType.SUMMON,
      cooldown: 5,
      avoidable: false,
      telegraphMessage: 'The air shimmers as Ghost Cat splits into three!',
      priority: 7,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'bleeding_pounce',
      name: 'Bleeding Pounce',
      description: 'A devastating leap attack that causes bleeding',
      type: BossAbilityType.DOT,
      cooldown: 3,
      damage: 90,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.BLEED,
        duration: 4,
        power: 20,
        stackable: true,
        maxStacks: 5,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Dodge or block with shield',
      telegraphMessage: 'Ghost Cat crouches, ready to pounce!',
      priority: 6,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'death_from_above',
      name: 'Death From Above',
      description: 'Drops from above for massive damage',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 180,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Watch the sky and dodge',
      telegraphMessage: 'You hear a screech from above!',
      priority: 9,
      requiresPhase: 3,
      targetType: 'single',
    },
    {
      id: 'spectral_rend',
      name: 'Spectral Rend',
      description: 'Supernatural claws that ignore armor',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 200,
      damageType: BossDamageType.PSYCHIC,
      avoidable: false,
      telegraphMessage: 'Ghost Cat\'s eyes glow with ethereal light!',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.5,
      description: 'Vulnerable to blessed weapons',
    },
  ],
  immunities: [BossDamageType.POISON, BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'track_by_sound',
      name: 'Track By Sound',
      description: 'When invisible, listen for Ghost Cat\'s movements',
      type: 'unique',
      instructions: 'High Cunning allows you to predict where Ghost Cat will strike',
      successReward: 'Chance to counter-attack when invisible',
    },
  ],

  environmentEffects: [
    {
      id: 'moonlight',
      name: 'Moonlight',
      description: 'Full moon makes Ghost Cat more visible',
      triggersAt: 'start',
      effect: {
        type: 'debuff',
        target: 'boss',
        power: 15,
      },
      duration: undefined,
    },
  ],

  playerLimit: {
    min: 1,
    max: 2,
    recommended: 1,
  },

  scaling: {
    healthPerPlayer: 40,
    damagePerPlayer: 10,
  },

  guaranteedDrops: [
    {
      itemId: 'ghost_cat_pelt',
      name: 'Phantom Pelt',
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'spectral_whiskers',
      name: 'Spectral Whiskers',
      description: 'Whiskers that glow faintly in moonlight',
      rarity: 'epic',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'phantom_claws',
      name: 'Phantom Claws',
      description: 'Claws that phase through solid matter',
      rarity: 'rare',
      dropChance: 0.5,
      minQuantity: 2,
      maxQuantity: 4,
    },
    {
      itemId: 'moonlight_essence',
      name: 'Moonlight Essence',
      description: 'A vial of captured moonlight',
      rarity: 'rare',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 2,
    },
  ],

  goldReward: {
    min: 1000,
    max: 1800,
  },
  experienceReward: 3500,

  achievements: ['ghost_hunter', 'phantom_killer'],
  titles: ['Ghost Hunter', 'Phantom Stalker'],
  firstKillBonus: {
    title: 'Vanquisher of Ghost Cat',
    item: 'ghost_cat_trophy',
    gold: 600,
  },

  difficulty: 8,
  canFlee: true,
  fleeConsequence: 'Ghost Cat will hunt you - random ambushes for 24 hours',
};

/**
 * LOBO GRANDE - The Wolf King (L30)
 * The alpha of all alphas, a massive dire wolf
 * Commands a pack and uses pack tactics
 */
export const LOBO_GRANDE: BossEncounter = {
  id: 'boss_lobo_grande',
  name: 'Lobo Grande',
  title: 'The Wolf King',
  category: BossCategory.LEGENDARY_ANIMAL,
  tier: BossTier.LEGENDARY,
  level: 30,

  description: 'A colossal black wolf the size of a horse, with silver scars and eyes that gleam with cunning intelligence.',
  backstory: 'Lobo Grande has ruled the wolf packs of Sangre Territory for over a decade. Hunters who have faced him and lived speak of his tactical genius - he fights like a general, not an animal. The Nahi respect him as a spirit of the wild itself.',
  defeatDialogue: '*The great wolf lies still, its pack howling mournfully in the distance. As its eyes close, you swear you see respect in them.*',
  victoryNarrative: 'Lobo Grande is dead. The howling continues for hours, echoing across the mountains - a funeral song for a king.',

  location: 'Pine Forest',
  alternateLocations: ['Deep Wilderness', 'Mountain Trail'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 28,
      description: 'Must be level 28 or higher',
    },
    {
      type: BossSpawnConditionType.WEATHER,
      value: 'snow',
      description: 'Only spawns during snowfall',
    },
  ],
  respawnCooldown: 96, // 4 days

  health: 4500,
  damage: 130,
  defense: 70,
  criticalChance: 0.20,
  evasion: 0.15,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Challenge',
      description: 'Lobo Grande faces you alone, testing your worth.',
      dialogue: '*The massive wolf regards you with intelligent eyes, then howls - accepting your challenge*',
      abilities: ['alpha_bite', 'pack_howl'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 66,
      name: 'Call the Pack',
      description: 'Wounded, Lobo Grande summons his wolves.',
      dialogue: '*A commanding howl rings out. In the distance, dozens of wolves answer the call*',
      abilities: ['alpha_bite', 'pack_howl', 'coordinated_strike', 'hamstring'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.2,
          description: '+20% damage',
        },
      ],
      summonMinions: {
        type: 'dire_wolf',
        count: 3,
        spawnMessage: 'Three dire wolves burst from the treeline!',
      },
    },
    {
      phaseNumber: 3,
      healthThreshold: 33,
      name: 'King\'s Fury',
      description: 'Desperate and enraged, Lobo Grande fights with savage abandon.',
      dialogue: '*Blood-soaked and furious, Lobo Grande charges with the full weight of his pack behind him*',
      abilities: ['alpha_bite', 'pack_howl', 'coordinated_strike', 'hamstring', 'kings_wrath'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage',
        },
        {
          type: 'speed',
          multiplier: 1.3,
          description: '+30% speed',
        },
      ],
      summonMinions: {
        type: 'dire_wolf',
        count: 2,
        spawnMessage: 'More wolves join the fray!',
      },
    },
  ],

  abilities: [
    {
      id: 'alpha_bite',
      name: 'Alpha Bite',
      description: 'A powerful bite attack',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      avoidable: false,
      priority: 5,
      targetType: 'single',
    },
    {
      id: 'pack_howl',
      name: 'Pack Howl',
      description: 'Rallying howl that buffs all wolves',
      type: BossAbilityType.BUFF,
      cooldown: 4,
      avoidable: false,
      telegraphMessage: 'Lobo Grande throws his head back and howls!',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'coordinated_strike',
      name: 'Coordinated Strike',
      description: 'Wolves attack in perfect unison',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 100,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Separate the wolves',
      telegraphMessage: 'The pack circles, preparing to strike as one!',
      priority: 8,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'hamstring',
      name: 'Hamstring',
      description: 'Bites your leg, reducing movement',
      type: BossAbilityType.DEBUFF,
      cooldown: 3,
      damage: 80,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.SLOW,
        duration: 3,
        power: 40,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: false,
      priority: 6,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'kings_wrath',
      name: 'King\'s Wrath',
      description: 'A devastating finishing move',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 250,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Perfect dodge timing required',
      telegraphMessage: 'Lobo Grande\'s eyes burn with primal fury!',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.FIRE,
      multiplier: 1.2,
      description: 'Wolves fear fire',
    },
  ],
  immunities: [BossDamageType.FROST],

  specialMechanics: [
    {
      id: 'pack_coordination',
      name: 'Pack Tactics',
      description: 'Must defeat pack wolves to reduce Lobo Grande\'s power',
      type: 'coordination',
      instructions: 'Each wolf alive grants Lobo Grande +10% damage',
      failureConsequence: 'Overwhelmed by coordinated pack attacks',
    },
    {
      id: 'alpha_respect',
      name: 'Alpha\'s Respect',
      description: 'Defeating wolves earns Lobo Grande\'s respect',
      type: 'unique',
      instructions: 'Kill all pack wolves before dealing final blow for bonus loot',
      successReward: 'Legendary wolf pelt and special title',
    },
  ],

  environmentEffects: [
    {
      id: 'snow_terrain',
      name: 'Deep Snow',
      description: 'Snow slows movement',
      triggersAt: 'start',
      effect: {
        type: 'debuff',
        target: 'player',
        power: 10,
      },
      duration: undefined,
      counterplay: 'Winter gear reduces penalty',
    },
  ],

  playerLimit: {
    min: 1,
    max: 4,
    recommended: 3,
  },

  scaling: {
    healthPerPlayer: 55,
    damagePerPlayer: 12,
    unlockMechanics: [
      {
        playerCount: 3,
        mechanics: ['double_pack_summon'],
      },
    ],
  },

  guaranteedDrops: [
    {
      itemId: 'lobo_grande_pelt',
      name: 'Wolf King\'s Pelt',
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'alpha_fang',
      name: 'Alpha Fang',
      description: 'A massive canine tooth',
      rarity: 'epic',
      dropChance: 0.45,
      minQuantity: 1,
      maxQuantity: 2,
    },
    {
      itemId: 'wolf_king_crown',
      name: 'Crown of the Wolf King',
      description: 'A headpiece made from Lobo Grande\'s skull',
      rarity: 'legendary',
      dropChance: 0.15,
      minQuantity: 1,
      maxQuantity: 1,
      requiresFirstKill: true,
    },
    {
      itemId: 'dire_wolf_meat',
      name: 'Dire Wolf Meat',
      description: 'Prime wolf meat',
      rarity: 'uncommon',
      dropChance: 0.9,
      minQuantity: 5,
      maxQuantity: 10,
    },
  ],

  goldReward: {
    min: 1200,
    max: 2200,
  },
  experienceReward: 4500,

  achievements: ['wolf_slayer', 'pack_leader', 'alpha_killer'],
  titles: ['Wolf Slayer', 'Alpha Hunter', 'King Killer'],
  firstKillBonus: {
    title: 'Conqueror of the Wolf King',
    item: 'lobo_grande_trophy',
    gold: 800,
  },

  difficulty: 9,
  enrageTimer: 20,
  canFlee: true,
  fleeConsequence: 'The pack will hunt you relentlessly',
};

/**
 * Export all legendary animal bosses
 */
export const LEGENDARY_ANIMAL_BOSSES: BossEncounter[] = [
  OLD_RED,
  GHOST_CAT,
  LOBO_GRANDE,
];
