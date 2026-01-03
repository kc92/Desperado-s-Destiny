/**
 * Legendary Animals Data
 *
 * Definitions for all 12 legendary animals - rare, powerful creatures
 * that provide ultimate hunting challenges with unique rewards
 */

import {
  LegendaryAnimal,
  LegendaryCategory,
  LegendaryTier,
  LegendarySpawnCondition,
  LegendaryAbility,
  CombatPhase,
  LegendaryDrop,
} from '@desperados/shared';

/**
 * All legendary animals in the game
 */
export const LEGENDARY_ANIMALS: LegendaryAnimal[] = [
  // ==================== LEGENDARY PREDATORS ====================
  {
    id: 'old_red',
    name: 'Old Red',
    title: 'The Demon Bear',
    category: LegendaryCategory.PREDATOR,
    tier: LegendaryTier.LEGENDARY,
    description: 'A massive grizzly with scarred red fur, terror of The Wastes.',
    lore: 'Old Red has haunted the mountain caves of The Wastes for over a decade. His distinctive red-scarred hide earned from countless battles makes him unmistakable. Local prospectors speak in hushed tones of the twenty-seven hunters who tried and failed to claim his pelt. Some say the bear is possessed by a demon spirit; others claim he feeds on the souls of the wicked. Whatever the truth, Old Red remains the apex predator of the western mountains.',
    location: 'The Wastes - Mountain Caves',
    alternateLocations: ['The Wastes - Northern Ridge', 'The Wastes - Bear Creek Canyon'],

    levelRequirement: 30,
    spawnConditions: [LegendarySpawnCondition.TIME_DUSK, LegendarySpawnCondition.TIME_NIGHT],
    spawnChance: 0.15,
    respawnCooldown: 48,

    health: 8000,
    attackPower: 250,
    defensePower: 180,
    criticalChance: 0.25,
    accuracy: 0.85,
    evasion: 0.10,

    specialAbilities: [
      {
        id: 'demon_roar',
        name: 'Demon Roar',
        description: 'Terrifying roar that strikes fear into all who hear it',
        type: 'debuff',
        effect: {
          type: 'fear',
          duration: 2,
          power: 30,
        },
        cooldown: 3,
        priority: 8,
      },
      {
        id: 'crushing_maul',
        name: 'Crushing Maul',
        description: 'Massive overhead strike that breaks armor',
        type: 'attack',
        damage: 350,
        effect: {
          type: 'armor_break',
          duration: 3,
          power: 40,
        },
        cooldown: 4,
        priority: 7,
      },
      {
        id: 'frenzy',
        name: 'Berserker Frenzy',
        description: 'Enters a rage state, attacking with increased speed',
        type: 'buff',
        cooldown: 5,
        priority: 9,
      },
      {
        id: 'cave_collapse',
        name: 'Cave Collapse',
        description: 'Slams the ground, causing rocks to fall',
        type: 'environmental',
        damage: 200,
        cooldown: 6,
        priority: 6,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'Old Red stalks cautiously, testing your strength',
        attackPowerMultiplier: 1.0,
        defensePowerMultiplier: 1.0,
        specialAbilities: ['demon_roar'],
      },
      {
        phase: 2,
        healthThreshold: 60,
        description: 'The Demon Bear becomes aggressive, attacking relentlessly',
        attackPowerMultiplier: 1.3,
        defensePowerMultiplier: 0.9,
        specialAbilities: ['demon_roar', 'crushing_maul'],
      },
      {
        phase: 3,
        healthThreshold: 30,
        description: 'Old Red enters a berserker rage, fighting with desperate fury',
        attackPowerMultiplier: 1.6,
        defensePowerMultiplier: 0.7,
        specialAbilities: ['demon_roar', 'crushing_maul', 'frenzy', 'cave_collapse'],
        environmentalHazard: 'Falling rocks deal 50 damage per turn',
      },
    ],

    immunities: ['fear', 'stun'],
    weaknesses: ['fire'],

    guaranteedDrops: [
      {
        itemId: 'demon_bear_pelt',
        name: 'Demon Bear Pelt',
        description: 'Legendary scarred red hide from Old Red',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Legendary Armor Crafting', 'Gang Banner Material'],
      },
      {
        itemId: 'bear_claw_necklace',
        name: 'Bear Claw Necklace',
        description: 'Massive claws strung together, grants combat prowess',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Permanent +15 Combat Stat'],
      },
    ],

    possibleDrops: [
      {
        itemId: 'demon_heart',
        name: 'Demon Heart',
        description: 'Still-beating heart of the demon bear',
        rarity: 'mythic',
        dropChance: 0.1,
        quantity: { min: 1, max: 1 },
        usedFor: ['Ultimate Alchemy', 'Supernatural Crafting'],
      },
    ],

    goldReward: { min: 5000, max: 8000 },
    experienceReward: 10000,
    achievementId: 'demon_slayer',
    titleUnlocked: 'Demon Slayer',
    permanentBonus: {
      type: 'combat_power',
      amount: 10,
      description: 'Defeating Old Red grants +10 Combat Power permanently',
    },

    clueLocations: [
      {
        location: 'The Wastes - Mining Camp',
        clueType: 'witness',
        description: 'Terrified prospectors describe a massive red bear',
      },
      {
        location: 'The Wastes - Mountain Trail',
        clueType: 'tracks',
        description: 'Enormous bear tracks, far larger than normal',
        requiresSkill: { skill: 'tracking', level: 5 },
      },
      {
        location: 'The Wastes - Bear Creek',
        clueType: 'remains',
        description: 'Mauled remains of previous hunters',
      },
      {
        location: 'The Wastes - Cave Entrance',
        clueType: 'warning',
        description: 'Crude warnings carved into rocks by survivors',
      },
    ],

    rumorsFromNPCs: ['miner_jack', 'old_prospector', 'mountain_guide', 'bounty_hunter_sarah'],
    newspaperHeadline: 'DEMON SLAIN! Legendary Hunter Defeats Old Red After Decade of Terror',

    recommendedGear: {
      weapons: ['Sharps Rifle', 'Buffalo Gun', 'Elephant Gun'],
      armor: ['Reinforced Leather Armor', 'Bear-Proof Vest'],
      consumables: ['Strong Whiskey', 'Courage Tonic', 'Healing Poultice'],
      special: ['Fire Rounds', 'Bear Trap'],
    },

    strategyHints: [
      'Old Red is weak to fire damage - use fire rounds if available',
      'Stay mobile during Phase 3 to avoid falling rocks',
      'Save healing items for the berserker phase',
      'The cave provides cover but limits movement',
      'Armor-breaking attacks are less effective due to thick hide',
    ],

    difficulty: 9,
    canFlee: false,
    companions: {
      helpful: ['hunting_dog', 'wolf'],
      hindering: ['horse', 'mule'],
    },
  },

  {
    id: 'ghost_cat',
    name: 'Ghost Cat',
    title: 'The Phantom Cougar',
    category: LegendaryCategory.PREDATOR,
    tier: LegendaryTier.EPIC,
    description: 'A white mountain lion with supernatural stealth abilities.',
    lore: 'The Nahi Coalition speaks of a spirit guardian that watches over Spirit Springs - a white cougar that appears and vanishes like morning mist. Settlers claim it is merely an albino mountain lion with exceptional hunting skills, but those who have encountered the Ghost Cat swear it can become nearly invisible, moving through the cliffs without sound. Some hunters have spent years tracking this phantom predator, only to find themselves being hunted in return.',
    location: 'Spirit Springs - Mountain Cliffs',
    alternateLocations: ['Spirit Springs - Sacred Grove', 'Spirit Springs - Crystal Falls'],

    levelRequirement: 25,
    spawnConditions: [LegendarySpawnCondition.TIME_DAWN, LegendarySpawnCondition.TIME_DUSK, LegendarySpawnCondition.WEATHER_FOG],
    spawnChance: 0.20,
    respawnCooldown: 36,

    health: 5500,
    attackPower: 200,
    defensePower: 120,
    criticalChance: 0.40,
    accuracy: 0.95,
    evasion: 0.45,

    specialAbilities: [
      {
        id: 'phantom_strike',
        name: 'Phantom Strike',
        description: 'Strikes from invisibility with deadly precision',
        type: 'attack',
        damage: 400,
        cooldown: 3,
        priority: 9,
      },
      {
        id: 'vanish',
        name: 'Vanish',
        description: 'Becomes nearly invisible, greatly increasing evasion',
        type: 'defense',
        cooldown: 4,
        priority: 8,
      },
      {
        id: 'spirit_howl',
        name: 'Spirit Howl',
        description: 'Eerie howl that reduces accuracy',
        type: 'debuff',
        effect: {
          type: 'speed_reduction',
          duration: 3,
          power: 25,
        },
        cooldown: 5,
        priority: 6,
      },
      {
        id: 'pounce',
        name: 'Devastating Pounce',
        description: 'Leaps from above with crushing force',
        type: 'attack',
        damage: 300,
        effect: {
          type: 'stun',
          duration: 1,
          power: 50,
        },
        cooldown: 4,
        priority: 7,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'Ghost Cat circles warily, testing your awareness',
        attackPowerMultiplier: 1.0,
        defensePowerMultiplier: 1.2,
        specialAbilities: ['vanish', 'spirit_howl'],
      },
      {
        phase: 2,
        healthThreshold: 50,
        description: 'The Phantom Cougar becomes aggressive, striking from shadows',
        attackPowerMultiplier: 1.4,
        defensePowerMultiplier: 1.0,
        specialAbilities: ['phantom_strike', 'vanish', 'pounce'],
      },
      {
        phase: 3,
        healthThreshold: 20,
        description: 'Ghost Cat fights desperately, fully utilizing its phantom abilities',
        attackPowerMultiplier: 1.7,
        defensePowerMultiplier: 0.8,
        specialAbilities: ['phantom_strike', 'vanish', 'spirit_howl', 'pounce'],
      },
    ],

    immunities: [],
    weaknesses: ['duel_instinct'],

    guaranteedDrops: [
      {
        itemId: 'ghost_pelt',
        name: 'Ghost Pelt',
        description: 'Pure white cougar pelt that shimmers like mist',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Stealth Armor Crafting', 'Permanent +20% Stealth'],
      },
      {
        itemId: 'spirit_fang',
        name: 'Spirit Fang',
        description: 'Ethereal white fang with mysterious properties',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Spirit Alchemy', 'Supernatural Crafting'],
      },
    ],

    goldReward: { min: 3500, max: 6000 },
    experienceReward: 7500,
    achievementId: 'ghost_hunter',
    titleUnlocked: 'Ghost Hunter',
    permanentBonus: {
      type: 'cunning_power',
      amount: 8,
      description: 'Defeating Ghost Cat grants +8 Cunning Power permanently',
    },

    clueLocations: [
      {
        location: 'Spirit Springs - Trading Post',
        clueType: 'witness',
        description: 'Coalition members speak of the sacred white guardian',
      },
      {
        location: 'Spirit Springs - Cliff Trail',
        clueType: 'tracks',
        description: 'Faint white paw prints that seem to disappear',
        requiresSkill: { skill: 'tracking', level: 6 },
      },
      {
        location: 'Spirit Springs - Sacred Grove',
        clueType: 'remains',
        description: 'Deer carcass with no signs of struggle',
      },
    ],

    rumorsFromNPCs: ['elder_white_feather', 'coalition_scout', 'spirit_guide', 'mountain_hermit'],
    newspaperHeadline: 'PHANTOM CAPTURED: Legendary White Cougar Finally Hunted',

    recommendedGear: {
      weapons: ['Winchester Rifle', 'Scoped Hunting Rifle'],
      armor: ['Scout Leathers', 'Tracker\'s Garb'],
      consumables: ['Eagle Eye Tonic', 'Tracking Powder'],
      special: ['Night Vision Goggles', 'Motion Detector'],
    },

    strategyHints: [
      'High perception helps counter its stealth abilities',
      'Watch for shimmer in the air when it vanishes',
      'Stay in open areas to prevent ambush pounces',
      'Eagle Eye Tonic greatly helps track its movements',
      'Fog makes the fight much harder - wait for clear weather if possible',
    ],

    difficulty: 7,
    canFlee: false,
    companions: {
      helpful: ['eagle', 'hunting_dog'],
      hindering: ['horse'],
    },
  },

  {
    id: 'lobo_grande',
    name: 'Lobo Grande',
    title: 'The Wolf King',
    category: LegendaryCategory.PREDATOR,
    tier: LegendaryTier.LEGENDARY,
    description: 'A massive black wolf that commands a pack of over twenty.',
    lore: 'In the Longhorn Range, ranchers have lost countless cattle to a pack led by an enormous black wolf. Lobo Grande, as the locals call him, is said to be twice the size of a normal wolf with intelligence that borders on human. He coordinates his pack with tactical precision, setting ambushes and escape routes. Many bounty hunters have tried to collect the substantial reward on his head, but those who survive speak of facing not just one wolf, but a coordinated army.',
    location: 'Longhorn Range - Wolf Territory',
    alternateLocations: ['Longhorn Range - Cattle Grazing Lands', 'Longhorn Range - Pack Den'],

    levelRequirement: 28,
    spawnConditions: [LegendarySpawnCondition.TIME_NIGHT, LegendarySpawnCondition.MOON_FULL],
    spawnChance: 0.18,
    respawnCooldown: 42,

    health: 6500,
    attackPower: 220,
    defensePower: 140,
    criticalChance: 0.30,
    accuracy: 0.88,
    evasion: 0.25,

    specialAbilities: [
      {
        id: 'alpha_howl',
        name: 'Alpha\'s Howl',
        description: 'Rallying cry that summons pack members',
        type: 'summon',
        cooldown: 5,
        priority: 10,
      },
      {
        id: 'pack_tactics',
        name: 'Pack Tactics',
        description: 'Coordinates pack for devastating combined attack',
        type: 'attack',
        damage: 350,
        cooldown: 4,
        priority: 9,
      },
      {
        id: 'savage_bite',
        name: 'Savage Bite',
        description: 'Vicious bite that causes heavy bleeding',
        type: 'attack',
        damage: 280,
        effect: {
          type: 'bleed',
          duration: 4,
          power: 40,
        },
        cooldown: 3,
        priority: 8,
      },
      {
        id: 'tactical_retreat',
        name: 'Tactical Retreat',
        description: 'Pack scatters and regroups, confusing the enemy',
        type: 'defense',
        cooldown: 6,
        priority: 7,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'Lobo Grande circles with his pack, probing for weakness',
        attackPowerMultiplier: 0.8,
        defensePowerMultiplier: 1.0,
        specialAbilities: ['alpha_howl'],
        summonMinions: {
          type: 'alpha_wolf',
          count: 3,
        },
      },
      {
        phase: 2,
        healthThreshold: 60,
        description: 'The Wolf King coordinates his pack for coordinated strikes',
        attackPowerMultiplier: 1.2,
        defensePowerMultiplier: 0.9,
        specialAbilities: ['alpha_howl', 'pack_tactics', 'savage_bite'],
        summonMinions: {
          type: 'alpha_wolf',
          count: 2,
        },
      },
      {
        phase: 3,
        healthThreshold: 25,
        description: 'Lobo Grande fights with primal fury alongside remaining pack',
        attackPowerMultiplier: 1.6,
        defensePowerMultiplier: 0.7,
        specialAbilities: ['alpha_howl', 'pack_tactics', 'savage_bite', 'tactical_retreat'],
      },
    ],

    immunities: [],
    weaknesses: [],

    guaranteedDrops: [
      {
        itemId: 'alpha_pelt',
        name: 'Alpha Wolf Pelt',
        description: 'Jet black pelt from the legendary Wolf King',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Legendary Armor Crafting', 'Pack Leader Cloak'],
      },
      {
        itemId: 'pack_leader_fang',
        name: 'Pack Leader\'s Fang',
        description: 'Massive fang that radiates alpha presence',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Companion Bonding Bonus', 'Leadership Talisman'],
      },
    ],

    goldReward: { min: 4500, max: 7500 },
    experienceReward: 9000,
    achievementId: 'pack_breaker',
    titleUnlocked: 'Pack Breaker',
    permanentBonus: {
      type: 'spirit_power',
      amount: 10,
      description: 'Defeating Lobo Grande grants +10 Spirit Power permanently',
    },

    clueLocations: [
      {
        location: 'Longhorn Range - Ranch',
        clueType: 'witness',
        description: 'Ranchers describe coordinated wolf attacks',
      },
      {
        location: 'Longhorn Range - Kill Site',
        clueType: 'remains',
        description: 'Cattle carcasses showing pack hunting patterns',
      },
      {
        location: 'Longhorn Range - Forest Trail',
        clueType: 'tracks',
        description: 'Multiple wolf tracks led by enormous paw prints',
        requiresSkill: { skill: 'tracking', level: 5 },
      },
      {
        location: 'Longhorn Range - Watering Hole',
        clueType: 'warning',
        description: 'Other predators avoid this area entirely',
      },
    ],

    rumorsFromNPCs: ['rancher_johnson', 'cattle_driver', 'bounty_hunter_jim', 'tracker_maria'],
    newspaperHeadline: 'WOLF KING FALLS: Legendary Pack Leader Defeated After Years of Terror',

    recommendedGear: {
      weapons: ['Repeating Rifle', 'Dual Revolvers', 'Shotgun'],
      armor: ['Reinforced Leather', 'Wolf-Proof Boots'],
      consumables: ['Healing Poultice', 'Bleeding Stop Powder'],
      special: ['Fire Grenades', 'Silver Bullets', 'Pack Whistle'],
    },

    strategyHints: [
      'Focus on reducing pack numbers first before engaging Lobo Grande',
      'Silver bullets deal extra damage to wolves',
      'Area effect weapons help control the pack',
      'Watch for coordinated attacks from multiple directions',
      'Full moon makes the pack more aggressive',
    ],

    difficulty: 8,
    canFlee: false,
    companions: {
      helpful: ['dog', 'hunting_dog'],
      hindering: ['cat', 'bird'],
    },
  },

  // ==================== LEGENDARY PREY ====================
  {
    id: 'thunder',
    name: 'Thunder',
    title: 'The White Buffalo',
    category: LegendaryCategory.PREY,
    tier: LegendaryTier.MYTHIC,
    description: 'Sacred white buffalo with deep spiritual significance.',
    lore: 'The Nahi Coalition holds Thunder sacred - a pure white buffalo that appears on Kaiowa Mesa during times of great change. According to prophecy, Thunder carries the spirits of ancestors and brings blessings to the land. To kill Thunder is to invite catastrophe, yet the hide and horns would be worth a fortune to unscrupulous traders. Those who hunt Thunder must be prepared not only for a challenging hunt but for the wrath of the entire Coalition and possible supernatural consequences.',
    location: 'Kaiowa Mesa - Sacred Grounds',

    levelRequirement: 35,
    reputationRequirement: {
      faction: 'nahiCoalition',
      reputation: -50,
      warning: 'Hunting Thunder will make you an enemy of the Nahi Coalition permanently',
    },
    spawnConditions: [LegendarySpawnCondition.TIME_DAWN, LegendarySpawnCondition.WEATHER_CLEAR],
    spawnChance: 0.10,
    respawnCooldown: 72,

    health: 10000,
    attackPower: 280,
    defensePower: 200,
    criticalChance: 0.15,
    accuracy: 0.75,
    evasion: 0.05,

    specialAbilities: [
      {
        id: 'thunder_charge',
        name: 'Thunder Charge',
        description: 'Devastating charge that shakes the earth',
        type: 'attack',
        damage: 500,
        effect: {
          type: 'stun',
          duration: 2,
          power: 60,
        },
        cooldown: 4,
        priority: 9,
      },
      {
        id: 'ancestors_wrath',
        name: 'Ancestors\' Wrath',
        description: 'Spiritual energy strikes the attacker',
        type: 'environmental',
        damage: 250,
        cooldown: 5,
        priority: 8,
      },
      {
        id: 'sacred_presence',
        name: 'Sacred Presence',
        description: 'Divine aura that reduces incoming damage',
        type: 'defense',
        cooldown: 6,
        priority: 10,
      },
      {
        id: 'earth_stomp',
        name: 'Earth Stomp',
        description: 'Powerful stomp that knocks enemies back',
        type: 'attack',
        damage: 300,
        cooldown: 3,
        priority: 7,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'Thunder stands defiant, surrounded by sacred energy',
        attackPowerMultiplier: 1.0,
        defensePowerMultiplier: 1.5,
        specialAbilities: ['sacred_presence'],
        environmentalHazard: 'Ancestral spirits reduce accuracy by 20%',
      },
      {
        phase: 2,
        healthThreshold: 60,
        description: 'The White Buffalo fights back with primal fury',
        attackPowerMultiplier: 1.3,
        defensePowerMultiplier: 1.2,
        specialAbilities: ['thunder_charge', 'sacred_presence', 'earth_stomp'],
      },
      {
        phase: 3,
        healthThreshold: 30,
        description: 'Ancestors\' wrath manifests as Thunder fights desperately',
        attackPowerMultiplier: 1.5,
        defensePowerMultiplier: 1.0,
        specialAbilities: ['thunder_charge', 'ancestors_wrath', 'sacred_presence', 'earth_stomp'],
        environmentalHazard: 'Spirit lightning strikes for 150 damage per turn',
      },
    ],

    immunities: ['fear', 'poison'],
    weaknesses: [],

    guaranteedDrops: [
      {
        itemId: 'sacred_hide',
        name: 'Sacred Buffalo Hide',
        description: 'Pure white hide blessed by ancestral spirits',
        rarity: 'mythic',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Ultimate Armor Crafting', 'Sacred Rituals'],
      },
      {
        itemId: 'thunder_horn',
        name: 'Thunder Horn',
        description: 'Massive horn crackling with spiritual energy',
        rarity: 'mythic',
        dropChance: 1.0,
        quantity: { min: 2, max: 2 },
        usedFor: ['Legendary Weapons', 'Spirit Channeling'],
      },
    ],

    goldReward: { min: 10000, max: 15000 },
    experienceReward: 20000,
    achievementId: 'sacrilege',
    titleUnlocked: 'Sacrilege',
    permanentBonus: {
      type: 'max_energy',
      amount: 50,
      description: 'Defeating Thunder grants +50 Max Energy (but Coalition hostility)',
    },

    clueLocations: [
      {
        location: 'Kaiowa Mesa - Coalition Village',
        clueType: 'witness',
        description: 'Elders speak of the sacred white buffalo with reverence',
      },
      {
        location: 'Kaiowa Mesa - Sacred Grounds',
        clueType: 'tracks',
        description: 'Massive buffalo tracks glowing with faint light',
        requiresSkill: { skill: 'tracking', level: 8 },
      },
      {
        location: 'Kaiowa Mesa - Spirit Circle',
        clueType: 'warning',
        description: 'Ancient warnings against disturbing Thunder',
      },
    ],

    rumorsFromNPCs: ['elder_white_feather', 'shaman_walks_with_spirits', 'coalition_chief'],
    newspaperHeadline: 'SACRED BUFFALO SLAIN: Hunter Condemned by Nahi Coalition',

    recommendedGear: {
      weapons: ['Buffalo Gun', 'Elephant Gun', 'Sharps Rifle'],
      armor: ['Blessed Leather', 'Spirit Ward Talisman'],
      consumables: ['Divine Protection Tonic', 'Spirit Resistance'],
      special: ['Sacred Bullets', 'Lightning Rod'],
    },

    strategyHints: [
      'This hunt will permanently damage Coalition reputation',
      'Sacred Presence makes him extremely tough - bring heavy weapons',
      'Spirit lightning in Phase 3 requires constant healing',
      'Be prepared for Coalition retaliation after the hunt',
      'Consider if the rewards are worth becoming an outcast',
    ],

    difficulty: 10,
    canFlee: true,
    companions: {
      helpful: [],
      hindering: ['all'],
    },
  },

  {
    id: 'crown',
    name: 'Crown',
    title: 'The Monarch Elk',
    category: LegendaryCategory.PREY,
    tier: LegendaryTier.EPIC,
    description: 'Majestic elk with a 40-point antler rack.',
    lore: 'On Thunderbird Peak roams an elk of such magnificence that hunters speak of it in reverent whispers. Crown, named for his spectacular 40-point antler rack, is the largest elk ever recorded. His incredible wariness and keen senses make him nearly impossible to approach. Trophy hunters have offered fortunes for his head, but Crown has eluded every attempt at capture for over eight years. Those who have seen him describe an animal of almost supernatural beauty and grace.',
    location: 'Thunderbird Peak - High Meadows',
    alternateLocations: ['Thunderbird Peak - Forest Edge', 'Thunderbird Peak - Valley'],

    levelRequirement: 26,
    spawnConditions: [LegendarySpawnCondition.TIME_DAWN, LegendarySpawnCondition.WEATHER_CLEAR],
    spawnChance: 0.25,
    respawnCooldown: 30,

    health: 4500,
    attackPower: 180,
    defensePower: 100,
    criticalChance: 0.20,
    accuracy: 0.70,
    evasion: 0.60,

    specialAbilities: [
      {
        id: 'antler_gore',
        name: 'Antler Gore',
        description: 'Powerful antler strike if cornered',
        type: 'attack',
        damage: 300,
        effect: {
          type: 'bleed',
          duration: 3,
          power: 30,
        },
        cooldown: 3,
        priority: 7,
      },
      {
        id: 'majestic_leap',
        name: 'Majestic Leap',
        description: 'Incredible jumping ability to escape',
        type: 'defense',
        cooldown: 2,
        priority: 10,
      },
      {
        id: 'thundering_charge',
        name: 'Thundering Charge',
        description: 'Desperate charge when wounded',
        type: 'attack',
        damage: 400,
        cooldown: 5,
        priority: 8,
      },
      {
        id: 'forest_fade',
        name: 'Forest Fade',
        description: 'Uses terrain to break line of sight',
        type: 'defense',
        cooldown: 4,
        priority: 9,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'Crown is alert and ready to flee at any moment',
        attackPowerMultiplier: 0.5,
        defensePowerMultiplier: 1.0,
        specialAbilities: ['majestic_leap', 'forest_fade'],
      },
      {
        phase: 2,
        healthThreshold: 50,
        description: 'The Monarch Elk becomes defensive, preparing to fight or flee',
        attackPowerMultiplier: 1.0,
        defensePowerMultiplier: 0.8,
        specialAbilities: ['antler_gore', 'majestic_leap'],
      },
      {
        phase: 3,
        healthThreshold: 25,
        description: 'Crown fights desperately with primal fury',
        attackPowerMultiplier: 1.5,
        defensePowerMultiplier: 0.6,
        specialAbilities: ['antler_gore', 'thundering_charge'],
      },
    ],

    immunities: [],
    weaknesses: [],

    guaranteedDrops: [
      {
        itemId: 'monarch_antlers',
        name: 'Monarch Antlers',
        description: 'Magnificent 40-point antler rack',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Legendary Trophy', 'Antler Crafting', 'Trophy Room'],
      },
      {
        itemId: 'royal_hide',
        name: 'Royal Elk Hide',
        description: 'Perfect hide from the legendary Monarch',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Premium Leather Crafting', 'Royal Armor'],
      },
    ],

    goldReward: { min: 3000, max: 5500 },
    experienceReward: 6500,
    achievementId: 'trophy_master',
    titleUnlocked: 'Trophy Master',
    permanentBonus: {
      type: 'cunning_power',
      amount: 7,
      description: 'Defeating Crown grants +7 Cunning Power permanently',
    },

    clueLocations: [
      {
        location: 'Thunderbird Peak - Lodge',
        clueType: 'witness',
        description: 'Trophy hunters discuss the legendary elk',
      },
      {
        location: 'Thunderbird Peak - Meadow',
        clueType: 'tracks',
        description: 'Large elk tracks with distinctive gait pattern',
        requiresSkill: { skill: 'tracking', level: 5 },
      },
      {
        location: 'Thunderbird Peak - Rubbing Tree',
        clueType: 'remains',
        description: 'Tree marked by massive antler scrapes',
      },
    ],

    rumorsFromNPCs: ['trophy_hunter_bill', 'mountain_guide', 'lodge_keeper', 'tracker_pete'],
    newspaperHeadline: 'MONARCH FELLED: Legendary Elk Finally Brought Down',

    recommendedGear: {
      weapons: ['Scoped Hunting Rifle', 'Bow with Broadheads'],
      armor: ['Camouflage Gear', 'Silent Boots'],
      consumables: ['Scent Eliminator', 'Steadying Tonic'],
      special: ['Elk Call', 'Binoculars', 'Rangefinder'],
    },

    strategyHints: [
      'Perfect shot placement is crucial - Crown will flee if wounded',
      'Approach from downwind to avoid detection',
      'Dawn provides best visibility and calmest winds',
      'High perception helps track his movements',
      'Be patient - rushing the shot will fail',
    ],

    difficulty: 6,
    canFlee: true,
    companions: {
      helpful: ['dog'],
      hindering: ['horse', 'noisy_companions'],
    },
  },

  {
    id: 'desert_king',
    name: 'Desert King',
    title: 'The Golden Pronghorn',
    category: LegendaryCategory.PREY,
    tier: LegendaryTier.EPIC,
    description: 'Golden-furred pronghorn of impossible speed.',
    lore: 'In the vast expanse of The Wastes, a pronghorn with golden fur appears only at dawn. Local legends claim Desert King is the fastest creature in the territory - faster even than the wind itself. Scientists dismiss such claims, but those who have pursued him know the truth. The Golden Pronghorn can accelerate to breathtaking speeds and maintain them for miles, leaving even the finest horses gasping in his dust. Only a marksman of supreme skill could hope to claim this prize.',
    location: 'The Wastes - Golden Valley',
    alternateLocations: ['The Wastes - Salt Flats', 'The Wastes - Desert Plain'],

    levelRequirement: 24,
    spawnConditions: [LegendarySpawnCondition.TIME_DAWN],
    spawnChance: 0.30,
    respawnCooldown: 24,

    health: 3500,
    attackPower: 120,
    defensePower: 80,
    criticalChance: 0.10,
    accuracy: 0.65,
    evasion: 0.75,

    specialAbilities: [
      {
        id: 'lightning_sprint',
        name: 'Lightning Sprint',
        description: 'Incredible burst of speed',
        type: 'defense',
        cooldown: 2,
        priority: 10,
      },
      {
        id: 'defensive_kick',
        name: 'Defensive Kick',
        description: 'Powerful kick if cornered',
        type: 'attack',
        damage: 180,
        cooldown: 3,
        priority: 6,
      },
      {
        id: 'dust_cloud',
        name: 'Dust Cloud',
        description: 'Kicks up blinding dust while fleeing',
        type: 'debuff',
        effect: {
          type: 'speed_reduction',
          duration: 2,
          power: 40,
        },
        cooldown: 4,
        priority: 8,
      },
      {
        id: 'mirage_run',
        name: 'Mirage Run',
        description: 'So fast it creates afterimages',
        type: 'defense',
        cooldown: 5,
        priority: 9,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'Desert King is alert and ready to sprint away',
        attackPowerMultiplier: 0.3,
        defensePowerMultiplier: 1.0,
        specialAbilities: ['lightning_sprint', 'dust_cloud'],
      },
      {
        phase: 2,
        healthThreshold: 40,
        description: 'The Golden Pronghorn runs at maximum speed',
        attackPowerMultiplier: 0.8,
        defensePowerMultiplier: 0.7,
        specialAbilities: ['lightning_sprint', 'mirage_run', 'dust_cloud'],
      },
      {
        phase: 3,
        healthThreshold: 15,
        description: 'Desert King turns to fight when escape is impossible',
        attackPowerMultiplier: 1.5,
        defensePowerMultiplier: 0.5,
        specialAbilities: ['defensive_kick'],
      },
    ],

    immunities: [],
    weaknesses: [],

    guaranteedDrops: [
      {
        itemId: 'golden_pelt',
        name: 'Golden Pronghorn Pelt',
        description: 'Shimmering golden fur that catches the light',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Legendary Leather Crafting', 'Speed Boots'],
      },
      {
        itemId: 'speed_essence',
        name: 'Essence of Speed',
        description: 'Mystical essence of pure velocity',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Permanent +10% Movement Speed', 'Speed Alchemy'],
      },
    ],

    goldReward: { min: 2800, max: 4800 },
    experienceReward: 5500,
    achievementId: 'speed_demon',
    titleUnlocked: 'Speed Demon',
    permanentBonus: {
      type: 'critical_chance',
      amount: 5,
      description: 'Defeating Desert King grants +5% Critical Chance permanently',
    },

    clueLocations: [
      {
        location: 'The Wastes - Trading Post',
        clueType: 'witness',
        description: 'Travelers describe a golden blur at dawn',
      },
      {
        location: 'The Wastes - Salt Flats',
        clueType: 'tracks',
        description: 'Tracks spaced impossibly far apart',
        requiresSkill: { skill: 'tracking', level: 4 },
      },
      {
        location: 'The Wastes - Watering Hole',
        clueType: 'remains',
        description: 'Golden hairs caught on desert brush',
      },
    ],

    rumorsFromNPCs: ['desert_trader', 'prospector_sam', 'nomad_runner', 'stable_master'],
    newspaperHeadline: 'GOLDEN GHOST CAUGHT: Legendary Pronghorn\'s Speed Finally Matched',

    recommendedGear: {
      weapons: ['Long Range Rifle', 'Scoped Springfield'],
      armor: ['Light Scout Gear'],
      consumables: ['Steady Hand Tonic', 'Eagle Eye Potion'],
      special: ['Fastest Horse Available', 'Rangefinder'],
    },

    strategyHints: [
      'Only appears at dawn - timing is everything',
      'Take the shot from extreme range before it detects you',
      'Chasing on horseback is futile - it will outrun anything',
      'Open terrain required for clear shot',
      'Wind direction affects accuracy at long range',
    ],

    difficulty: 5,
    canFlee: true,
    companions: {
      helpful: [],
      hindering: ['all'],
    },
  },

  // ==================== LEGENDARY BIRDS ====================
  {
    id: 'screamer',
    name: 'Screamer',
    title: 'The Giant Eagle',
    category: LegendaryCategory.BIRD,
    tier: LegendaryTier.LEGENDARY,
    description: 'Massive eagle with 15-foot wingspan that attacks horses.',
    lore: 'Soaring above Thunderbird Peak is a eagle of monstrous proportions. With a wingspan exceeding fifteen feet, Screamer earned his name from the blood-curdling cry that precedes his attacks. He has developed a taste for horse flesh, swooping down to snatch riders from their saddles or cripple their mounts. The Coalition considers him a manifestation of the Thunderbird spirit, making him both feared and revered. Settlers just want him dead before he ruins another roundup.',
    location: 'Thunderbird Peak - Summit',
    alternateLocations: ['Thunderbird Peak - Cliff Face', 'Thunderbird Peak - Sky Valley'],

    levelRequirement: 32,
    spawnConditions: [LegendarySpawnCondition.TIME_DAY, LegendarySpawnCondition.WEATHER_CLEAR],
    spawnChance: 0.15,
    respawnCooldown: 40,

    health: 5000,
    attackPower: 240,
    defensePower: 100,
    criticalChance: 0.35,
    accuracy: 0.92,
    evasion: 0.50,

    specialAbilities: [
      {
        id: 'dive_strike',
        name: 'Diving Strike',
        description: 'Devastating attack from above',
        type: 'attack',
        damage: 450,
        cooldown: 3,
        priority: 10,
      },
      {
        id: 'talon_grab',
        name: 'Talon Grab',
        description: 'Grabs and lifts target, then drops them',
        type: 'attack',
        damage: 350,
        effect: {
          type: 'stun',
          duration: 2,
          power: 50,
        },
        cooldown: 4,
        priority: 9,
      },
      {
        id: 'wing_buffet',
        name: 'Wing Buffet',
        description: 'Powerful wing beat that knocks back enemies',
        type: 'attack',
        damage: 200,
        cooldown: 2,
        priority: 7,
      },
      {
        id: 'thunder_cry',
        name: 'Thunder Cry',
        description: 'Deafening screech that reduces accuracy',
        type: 'debuff',
        effect: {
          type: 'speed_reduction',
          duration: 3,
          power: 30,
        },
        cooldown: 5,
        priority: 8,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'Screamer circles high above, assessing the threat',
        attackPowerMultiplier: 1.0,
        defensePowerMultiplier: 1.3,
        specialAbilities: ['dive_strike', 'thunder_cry'],
        environmentalHazard: 'Fighting on cliff edge - dodge or fall',
      },
      {
        phase: 2,
        healthThreshold: 55,
        description: 'The Giant Eagle becomes aggressive, striking repeatedly',
        attackPowerMultiplier: 1.4,
        defensePowerMultiplier: 1.0,
        specialAbilities: ['dive_strike', 'talon_grab', 'wing_buffet'],
      },
      {
        phase: 3,
        healthThreshold: 25,
        description: 'Screamer fights with primal fury, using all abilities',
        attackPowerMultiplier: 1.7,
        defensePowerMultiplier: 0.8,
        specialAbilities: ['dive_strike', 'talon_grab', 'wing_buffet', 'thunder_cry'],
        environmentalHazard: 'Storm winds reduce accuracy by 25%',
      },
    ],

    immunities: ['poison'],
    weaknesses: [],

    guaranteedDrops: [
      {
        itemId: 'giant_feathers',
        name: 'Giant Eagle Feathers',
        description: 'Massive primary feathers from Screamer',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 5, max: 8 },
        usedFor: ['Legendary Arrow Crafting', 'Feather Headdress', 'Flight Alchemy'],
      },
      {
        itemId: 'eagle_eye_talisman',
        name: 'Eagle Eye Talisman',
        description: 'Carved from Screamer\'s talon, grants incredible vision',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Permanent +15% Accuracy', 'Vision Enhancement'],
      },
    ],

    goldReward: { min: 4200, max: 7000 },
    experienceReward: 8500,
    achievementId: 'sky_hunter',
    titleUnlocked: 'Sky Hunter',
    permanentBonus: {
      type: 'critical_chance',
      amount: 8,
      description: 'Defeating Screamer grants +8% Critical Chance permanently',
    },

    clueLocations: [
      {
        location: 'Thunderbird Peak - Ranch',
        clueType: 'witness',
        description: 'Ranchers describe horses being attacked from above',
      },
      {
        location: 'Thunderbird Peak - Cliff Trail',
        clueType: 'remains',
        description: 'Horse carcass on mountain ledge',
      },
      {
        location: 'Thunderbird Peak - Nest Site',
        clueType: 'warning',
        description: 'Massive nest containing horse bones',
      },
    ],

    rumorsFromNPCs: ['rancher_johnson', 'coalition_scout', 'mountain_guide', 'horse_breeder'],
    newspaperHeadline: 'THUNDERBIRD SLAIN: Giant Eagle Finally Brought Down',

    recommendedGear: {
      weapons: ['Shotgun with Birdshot', 'Repeating Rifle'],
      armor: ['Leather Armor', 'Reinforced Hat'],
      consumables: ['Eagle Eye Tonic', 'Steady Shot Whiskey'],
      special: ['Grappling Hook', 'Safety Rope'],
    },

    strategyHints: [
      'Aerial combat requires leading your shots',
      'Watch the sky - dive attacks come from directly above',
      'Shotgun effective when eagle is close',
      'Cliff positioning is crucial - don\'t get knocked off',
      'Clear weather required for consistent visibility',
    ],

    difficulty: 8,
    canFlee: false,
    companions: {
      helpful: ['dog'],
      hindering: ['horse', 'bird'],
    },
  },

  {
    id: 'el_gallo_diablo',
    name: 'El Gallo Diablo',
    title: 'The Hell Turkey',
    category: LegendaryCategory.BIRD,
    tier: LegendaryTier.RARE,
    description: 'Enormous, aggressive turkey with venomous spurs.',
    lore: 'In the badlands of The Frontera roams a turkey of such size and ferocity that locals have dubbed it El Gallo Diablo - the Devil Rooster. Standing four feet tall and weighing over eighty pounds, this monster turkey is no laughing matter. His spurs secrete a venom that causes excruciating pain, and his aggressive territorial nature means he attacks first and asks questions never. Many a tough outlaw has been humiliated by being chased off by a turkey, making El Gallo both a dangerous hunt and a source of comedic legend.',
    location: 'The Frontera - Badlands',
    alternateLocations: ['The Frontera - Scrubland', 'The Frontera - Canyon'],

    levelRequirement: 20,
    spawnConditions: [LegendarySpawnCondition.TIME_DAY],
    spawnChance: 0.35,
    respawnCooldown: 20,

    health: 3000,
    attackPower: 150,
    defensePower: 90,
    criticalChance: 0.25,
    accuracy: 0.80,
    evasion: 0.30,

    specialAbilities: [
      {
        id: 'venom_spur',
        name: 'Venomous Spur',
        description: 'Spur attack that injects painful venom',
        type: 'attack',
        damage: 180,
        effect: {
          type: 'poison',
          duration: 4,
          power: 35,
        },
        cooldown: 3,
        priority: 9,
      },
      {
        id: 'gobble_rage',
        name: 'Gobbling Rage',
        description: 'Enraging gobble that increases attack power',
        type: 'buff',
        cooldown: 4,
        priority: 8,
      },
      {
        id: 'wing_slap',
        name: 'Wing Slap',
        description: 'Powerful wing strike',
        type: 'attack',
        damage: 120,
        cooldown: 2,
        priority: 7,
      },
      {
        id: 'charging_peck',
        name: 'Charging Peck',
        description: 'Runs forward with beak extended',
        type: 'attack',
        damage: 200,
        cooldown: 3,
        priority: 8,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'El Gallo Diablo puffs up aggressively',
        attackPowerMultiplier: 1.0,
        defensePowerMultiplier: 1.0,
        specialAbilities: ['gobble_rage', 'wing_slap'],
      },
      {
        phase: 2,
        healthThreshold: 50,
        description: 'The Hell Turkey attacks with increased fury',
        attackPowerMultiplier: 1.4,
        defensePowerMultiplier: 0.8,
        specialAbilities: ['venom_spur', 'charging_peck', 'wing_slap'],
      },
      {
        phase: 3,
        healthThreshold: 20,
        description: 'El Gallo fights with desperate aggression',
        attackPowerMultiplier: 1.8,
        defensePowerMultiplier: 0.6,
        specialAbilities: ['venom_spur', 'gobble_rage', 'charging_peck'],
      },
    ],

    immunities: ['poison'],
    weaknesses: [],

    guaranteedDrops: [
      {
        itemId: 'diablo_feathers',
        name: 'Diablo Feathers',
        description: 'Dark, iridescent feathers with fire resistance',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 8, max: 12 },
        usedFor: ['Fire Resistance Gear', 'Headdress Crafting'],
      },
      {
        itemId: 'spur_daggers',
        name: 'Venomous Spur Daggers',
        description: 'Wicked spurs that can be fashioned into weapons',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 2, max: 2 },
        usedFor: ['Poison Dagger Crafting', 'Venom Extraction'],
      },
    ],

    goldReward: { min: 1500, max: 3000 },
    experienceReward: 4000,
    achievementId: 'turkey_terror',
    titleUnlocked: 'Turkey Terror',

    clueLocations: [
      {
        location: 'The Frontera - Saloon',
        clueType: 'witness',
        description: 'Outlaws laugh about giant turkey attacks',
      },
      {
        location: 'The Frontera - Badlands Trail',
        clueType: 'tracks',
        description: 'Massive three-toed turkey tracks',
        requiresSkill: { skill: 'tracking', level: 3 },
      },
      {
        location: 'The Frontera - Scrubland',
        clueType: 'remains',
        description: 'Coyote killed by venomous spurs',
      },
    ],

    rumorsFromNPCs: ['outlaw_pete', 'desert_trader', 'frontera_scout', 'badlands_hermit'],
    newspaperHeadline: 'DIABLO DEFEATED: Legendary Turkey Finally Roasted',

    recommendedGear: {
      weapons: ['Shotgun', 'Repeater'],
      armor: ['Leather Chaps', 'Reinforced Boots'],
      consumables: ['Antivenom', 'Healing Poultice'],
      special: ['Turkey Call (for comedy)', 'Thick Gloves'],
    },

    strategyHints: [
      'Don\'t underestimate him - the venom is serious',
      'Shotgun at close range is most effective',
      'Keep antivenom ready for spur attacks',
      'He\'s surprisingly fast for a turkey',
      'Completing this hunt earns comedic respect in Frontera saloons',
    ],

    difficulty: 4,
    canFlee: true,
    companions: {
      helpful: ['dog'],
      hindering: ['bird'],
    },
  },

  // ==================== LEGENDARY UNIQUE ====================
  {
    id: 'ironhide',
    name: 'Ironhide',
    title: 'The Armored Boar',
    category: LegendaryCategory.UNIQUE,
    tier: LegendaryTier.EPIC,
    description: 'Massive boar with hide that deflects bullets.',
    lore: 'In the forests around Red Gulch lives a boar of legendary toughness. Ironhide has survived countless hunting expeditions, mining explosions, and even a dynamite blast that would have killed a lesser creature. His hide, scarred and thickened by years of trauma, deflects most bullets like armor plating. Hunters must aim for specific weak points or risk simply annoying an already temperamental and extremely dangerous animal. Those who have faced Ironhide and lived speak of his relentless charges and frightening intelligence.',
    location: 'Red Gulch - Forest',
    alternateLocations: ['Red Gulch - Mining Area', 'Red Gulch - River Bottom'],

    levelRequirement: 22,
    spawnConditions: [LegendarySpawnCondition.TIME_DUSK, LegendarySpawnCondition.TIME_NIGHT],
    spawnChance: 0.28,
    respawnCooldown: 28,

    health: 6000,
    attackPower: 200,
    defensePower: 250,
    criticalChance: 0.20,
    accuracy: 0.75,
    evasion: 0.05,

    specialAbilities: [
      {
        id: 'armored_hide',
        name: 'Armored Hide',
        description: 'Thick hide reduces all damage',
        type: 'defense',
        cooldown: 1,
        priority: 10,
      },
      {
        id: 'crushing_charge',
        name: 'Crushing Charge',
        description: 'Devastating charge attack',
        type: 'attack',
        damage: 350,
        effect: {
          type: 'armor_break',
          duration: 2,
          power: 30,
        },
        cooldown: 3,
        priority: 9,
      },
      {
        id: 'tusk_gore',
        name: 'Tusk Gore',
        description: 'Vicious tusk attack causing severe bleeding',
        type: 'attack',
        damage: 280,
        effect: {
          type: 'bleed',
          duration: 4,
          power: 40,
        },
        cooldown: 4,
        priority: 8,
      },
      {
        id: 'ground_shake',
        name: 'Ground Shake',
        description: 'Stomps violently, destabilizing enemies',
        type: 'attack',
        damage: 150,
        effect: {
          type: 'stun',
          duration: 1,
          power: 40,
        },
        cooldown: 5,
        priority: 7,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'Ironhide snorts aggressively, hide deflecting most attacks',
        attackPowerMultiplier: 0.9,
        defensePowerMultiplier: 1.5,
        specialAbilities: ['armored_hide'],
      },
      {
        phase: 2,
        healthThreshold: 60,
        description: 'The Armored Boar becomes enraged, charging relentlessly',
        attackPowerMultiplier: 1.3,
        defensePowerMultiplier: 1.3,
        specialAbilities: ['armored_hide', 'crushing_charge', 'tusk_gore'],
      },
      {
        phase: 3,
        healthThreshold: 30,
        description: 'Ironhide fights with desperate fury, using all abilities',
        attackPowerMultiplier: 1.6,
        defensePowerMultiplier: 1.0,
        specialAbilities: ['armored_hide', 'crushing_charge', 'tusk_gore', 'ground_shake'],
      },
    ],

    immunities: ['poison'],
    weaknesses: ['precision_shots'],

    guaranteedDrops: [
      {
        itemId: 'ironhide_leather',
        name: 'Ironhide Leather',
        description: 'Incredibly tough boar hide',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Ultimate Armor Crafting', 'Damage Reduction Gear'],
      },
      {
        itemId: 'tusks_of_fortitude',
        name: 'Tusks of Fortitude',
        description: 'Massive tusks radiating protective energy',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 2, max: 2 },
        usedFor: ['Defense Talisman', 'Fortitude Alchemy'],
      },
    ],

    goldReward: { min: 2500, max: 4500 },
    experienceReward: 5000,
    achievementId: 'armor_breaker',
    titleUnlocked: 'Armor Breaker',
    permanentBonus: {
      type: 'damage_reduction',
      amount: 5,
      description: 'Defeating Ironhide grants +5% Damage Reduction permanently',
    },

    clueLocations: [
      {
        location: 'Red Gulch - Mining Camp',
        clueType: 'witness',
        description: 'Miners describe boar surviving dynamite blast',
      },
      {
        location: 'Red Gulch - Forest Trail',
        clueType: 'tracks',
        description: 'Deep hoof prints and scarred trees',
        requiresSkill: { skill: 'tracking', level: 4 },
      },
      {
        location: 'Red Gulch - Wallowing Pit',
        clueType: 'remains',
        description: 'Area destroyed by powerful charges',
      },
    ],

    rumorsFromNPCs: ['miner_jack', 'forest_hunter', 'red_gulch_sheriff', 'prospector_sam'],
    newspaperHeadline: 'IRONHIDE FELLED: Legendary Armored Boar Finally Defeated',

    recommendedGear: {
      weapons: ['High-Caliber Rifle', 'Armor-Piercing Rounds'],
      armor: ['Reinforced Leather', 'Thick Boots'],
      consumables: ['Steady Hand Tonic', 'Bleeding Stop Powder'],
      special: ['Precision Scope', 'Weak Point Guide'],
    },

    strategyHints: [
      'Aim for weak spots: eyes, ears, belly, joints',
      'Body shots are largely ineffective',
      'Armor-piercing rounds help but precision is key',
      'Dodge charges - getting hit is devastating',
      'Bleeding damage is effective once hide is breached',
    ],

    difficulty: 6,
    canFlee: false,
    companions: {
      helpful: ['hunting_dog'],
      hindering: ['horse'],
    },
  },

  {
    id: 'nightstalker',
    name: 'Nightstalker',
    title: 'The Black Panther',
    category: LegendaryCategory.UNIQUE,
    tier: LegendaryTier.LEGENDARY,
    description: 'Melanistic jaguar that hunts only at night.',
    lore: 'Spirit Springs holds a secret terror - a black panther of such stealth and lethality that it seems more shadow than substance. Nightstalker, as terrified locals call it, appears only under cover of darkness to hunt. This melanistic jaguar possesses the perfect combination of power, speed, and stealth. Victims are often found with no warning of the attack, just the devastating result. Coalition shamans claim Nightstalker is a spirit guardian testing the worthy. Settlers just want to survive the night.',
    location: 'Spirit Springs - Deep Forest',
    alternateLocations: ['Spirit Springs - Jungle Ruins', 'Spirit Springs - River Gorge'],

    levelRequirement: 30,
    spawnConditions: [LegendarySpawnCondition.TIME_NIGHT, LegendarySpawnCondition.MOON_NEW],
    spawnChance: 0.12,
    respawnCooldown: 48,

    health: 7000,
    attackPower: 260,
    defensePower: 140,
    criticalChance: 0.50,
    accuracy: 0.98,
    evasion: 0.55,

    specialAbilities: [
      {
        id: 'shadow_ambush',
        name: 'Shadow Ambush',
        description: 'Strikes from complete darkness',
        type: 'attack',
        damage: 500,
        cooldown: 3,
        priority: 10,
      },
      {
        id: 'night_vision',
        name: 'Night Vision',
        description: 'Perfect vision in darkness, player is blind',
        type: 'buff',
        cooldown: 1,
        priority: 9,
      },
      {
        id: 'throat_bite',
        name: 'Throat Bite',
        description: 'Lethal bite to the throat',
        type: 'attack',
        damage: 400,
        effect: {
          type: 'bleed',
          duration: 5,
          power: 50,
        },
        cooldown: 4,
        priority: 9,
      },
      {
        id: 'fade_to_black',
        name: 'Fade to Black',
        description: 'Becomes completely invisible in shadows',
        type: 'defense',
        cooldown: 5,
        priority: 8,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'Nightstalker stalks from the shadows, barely visible',
        attackPowerMultiplier: 1.2,
        defensePowerMultiplier: 1.3,
        specialAbilities: ['night_vision', 'shadow_ambush'],
        environmentalHazard: 'Pitch darkness reduces accuracy by 40%',
      },
      {
        phase: 2,
        healthThreshold: 55,
        description: 'The Black Panther attacks with surgical precision',
        attackPowerMultiplier: 1.5,
        defensePowerMultiplier: 1.1,
        specialAbilities: ['night_vision', 'shadow_ambush', 'throat_bite'],
      },
      {
        phase: 3,
        healthThreshold: 25,
        description: 'Nightstalker uses full stealth capabilities, striking from darkness',
        attackPowerMultiplier: 1.8,
        defensePowerMultiplier: 0.9,
        specialAbilities: ['night_vision', 'shadow_ambush', 'throat_bite', 'fade_to_black'],
        environmentalHazard: 'Complete darkness - can only fight by sound',
      },
    ],

    immunities: ['fear'],
    weaknesses: ['light'],

    guaranteedDrops: [
      {
        itemId: 'shadow_pelt',
        name: 'Shadow Panther Pelt',
        description: 'Jet black pelt that seems to absorb light',
        rarity: 'mythic',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Ultimate Stealth Armor', 'Shadow Cloak'],
      },
      {
        itemId: 'night_vision_essence',
        name: 'Night Vision Essence',
        description: 'Mystical essence granting perfect night vision',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Permanent Night Vision', 'Vision Alchemy'],
      },
    ],

    goldReward: { min: 6000, max: 9000 },
    experienceReward: 12000,
    achievementId: 'night_hunter',
    titleUnlocked: 'Night Hunter',
    permanentBonus: {
      type: 'critical_chance',
      amount: 10,
      description: 'Defeating Nightstalker grants +10% Critical Chance permanently',
    },

    clueLocations: [
      {
        location: 'Spirit Springs - Village',
        clueType: 'witness',
        description: 'Survivors describe attacks from the darkness',
      },
      {
        location: 'Spirit Springs - Forest Trail',
        clueType: 'tracks',
        description: 'Large cat tracks found only at night',
        requiresSkill: { skill: 'tracking', level: 7 },
      },
      {
        location: 'Spirit Springs - Kill Site',
        clueType: 'remains',
        description: 'Victim with no signs of struggle, perfect kill',
      },
    ],

    rumorsFromNPCs: ['shaman_walks_with_spirits', 'night_watchman', 'coalition_scout', 'survivor_jane'],
    newspaperHeadline: 'SHADOW SLAIN: Legendary Night Predator Finally Defeated',

    recommendedGear: {
      weapons: ['Shotgun', 'Revolver with Flashlight'],
      armor: ['Dark Leather', 'Silent Boots'],
      consumables: ['Night Vision Tonic', 'Light Grenades'],
      special: ['Lantern', 'Flare Gun', 'Motion Detector'],
    },

    strategyHints: [
      'Light sources are essential - lantern, flares, fire',
      'New moon makes the fight nearly impossible',
      'Listen for sounds - purring, breathing, movement',
      'Shadow Pelt provides ultimate stealth capabilities',
      'Fighting at night is mandatory - prepare accordingly',
    ],

    difficulty: 9,
    canFlee: false,
    companions: {
      helpful: ['dog'],
      hindering: ['all_others'],
    },
  },

  {
    id: 'old_gator',
    name: 'Old Gator',
    title: 'The River Terror',
    category: LegendaryCategory.UNIQUE,
    tier: LegendaryTier.LEGENDARY,
    description: 'Massive 25-foot alligator that destroys boats.',
    lore: 'The swamps of Rio Frontera hide an apex predator from another age. Old Gator, estimated at over fifty years old and twenty-five feet long, rules the waterways with absolute authority. River traders speak in hushed tones of boats crushed, swimmers vanished, and rival predators torn apart. His scarred hide tells the story of decades of dominance. Some claim he was here when the first settlers arrived and will be here when the last one leaves. Hunting Old Gator requires careful planning - you must fight him on land or risk being dragged into the water.',
    location: 'Rio Frontera - Swamp',
    alternateLocations: ['Rio Frontera - Deep Water', 'Rio Frontera - River Delta'],

    levelRequirement: 28,
    spawnConditions: [LegendarySpawnCondition.TIME_DAY, LegendarySpawnCondition.TIME_DUSK, LegendarySpawnCondition.WEATHER_RAIN],
    spawnChance: 0.18,
    respawnCooldown: 40,

    health: 7500,
    attackPower: 270,
    defensePower: 200,
    criticalChance: 0.25,
    accuracy: 0.85,
    evasion: 0.15,

    specialAbilities: [
      {
        id: 'death_roll',
        name: 'Death Roll',
        description: 'Grabs victim and rolls violently',
        type: 'attack',
        damage: 450,
        effect: {
          type: 'stun',
          duration: 2,
          power: 60,
        },
        cooldown: 4,
        priority: 10,
      },
      {
        id: 'tail_sweep',
        name: 'Tail Sweep',
        description: 'Massive tail strike',
        type: 'attack',
        damage: 320,
        cooldown: 3,
        priority: 8,
      },
      {
        id: 'crushing_bite',
        name: 'Crushing Bite',
        description: 'Legendary bite force',
        type: 'attack',
        damage: 400,
        effect: {
          type: 'armor_break',
          duration: 3,
          power: 50,
        },
        cooldown: 3,
        priority: 9,
      },
      {
        id: 'swamp_dive',
        name: 'Swamp Dive',
        description: 'Dives into water, becoming harder to hit',
        type: 'defense',
        cooldown: 5,
        priority: 7,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'Old Gator floats menacingly, waiting to strike',
        attackPowerMultiplier: 1.0,
        defensePowerMultiplier: 1.4,
        specialAbilities: ['crushing_bite', 'swamp_dive'],
        environmentalHazard: 'Swamp water limits movement',
      },
      {
        phase: 2,
        healthThreshold: 60,
        description: 'The River Terror becomes aggressive, attacking relentlessly',
        attackPowerMultiplier: 1.4,
        defensePowerMultiplier: 1.1,
        specialAbilities: ['death_roll', 'crushing_bite', 'tail_sweep'],
      },
      {
        phase: 3,
        healthThreshold: 30,
        description: 'Old Gator fights with primal fury, using all abilities',
        attackPowerMultiplier: 1.7,
        defensePowerMultiplier: 0.9,
        specialAbilities: ['death_roll', 'crushing_bite', 'tail_sweep', 'swamp_dive'],
        environmentalHazard: 'Risk of being dragged underwater',
      },
    ],

    immunities: ['poison', 'fear'],
    weaknesses: ['belly'],

    guaranteedDrops: [
      {
        itemId: 'prehistoric_hide',
        name: 'Prehistoric Gator Hide',
        description: 'Ancient, incredibly tough alligator hide',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Ultimate Armor Crafting', 'Waterproof Gear'],
      },
      {
        itemId: 'gator_teeth',
        name: 'Old Gator\'s Teeth',
        description: 'Massive teeth worn from decades of hunting',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 8, max: 12 },
        usedFor: ['Weapon Crafting', 'Tooth Necklace', 'Trophy'],
      },
    ],

    goldReward: { min: 5000, max: 8000 },
    experienceReward: 10000,
    achievementId: 'river_conqueror',
    titleUnlocked: 'River Conqueror',
    permanentBonus: {
      type: 'combat_power',
      amount: 8,
      description: 'Defeating Old Gator grants +8 Combat Power permanently',
    },

    clueLocations: [
      {
        location: 'Rio Frontera - Trading Post',
        clueType: 'witness',
        description: 'River traders describe boat-destroying monster',
      },
      {
        location: 'Rio Frontera - Riverbank',
        clueType: 'tracks',
        description: 'Massive slide marks entering the water',
        requiresSkill: { skill: 'tracking', level: 5 },
      },
      {
        location: 'Rio Frontera - Boat Wreckage',
        clueType: 'remains',
        description: 'Destroyed boats with massive bite marks',
      },
    ],

    rumorsFromNPCs: ['river_trader', 'swamp_guide', 'fisherman_jose', 'frontera_scout'],
    newspaperHeadline: 'ANCIENT TERROR DEFEATED: Legendary Alligator Finally Killed',

    recommendedGear: {
      weapons: ['Buffalo Gun', 'Shotgun', 'Harpoon'],
      armor: ['Waterproof Boots', 'Reinforced Leather'],
      consumables: ['Healing Poultice', 'Armor Repair Kit'],
      special: ['Boat', 'Rope', 'Grappling Hook'],
    },

    strategyHints: [
      'Fight on land if possible - water gives huge advantage to gator',
      'Aim for belly when he rolls - only weak spot',
      'Death roll is devastating - avoid at all costs',
      'Rain makes the swamp more dangerous',
      'Heavy weapons are essential for penetrating thick hide',
    ],

    difficulty: 8,
    canFlee: false,
    companions: {
      helpful: ['dog'],
      hindering: ['horse', 'cat'],
    },
  },

  {
    id: 'jackalope',
    name: 'The Jackalope',
    title: 'The Impossible Beast',
    category: LegendaryCategory.UNIQUE,
    tier: LegendaryTier.RARE,
    description: 'Rabbit with antlers - proof of the supernatural.',
    lore: 'Does it exist? Drunken prospectors swear they\'ve seen it - a jackrabbit with antlers like a miniature deer. Scientists scoff, rational minds dismiss it as myth, yet sightings persist across the territories. The Jackalope appears randomly, as if testing the boundaries of reality itself. Those lucky or unlucky enough to encounter one face a choice: pursue proof of the impossible or let it hop away into legend. Capturing evidence of the Jackalope would make a hunter famous... or the laughingstock of the territory.',
    location: 'Anywhere',
    alternateLocations: ['Everywhere and Nowhere'],

    levelRequirement: 15,
    spawnConditions: [],
    spawnChance: 0.01,
    respawnCooldown: 24,

    health: 500,
    attackPower: 50,
    defensePower: 20,
    criticalChance: 0.10,
    accuracy: 0.50,
    evasion: 0.90,

    specialAbilities: [
      {
        id: 'impossible_dodge',
        name: 'Impossible Dodge',
        description: 'Dodges with reality-defying agility',
        type: 'defense',
        cooldown: 1,
        priority: 10,
      },
      {
        id: 'antler_headbutt',
        name: 'Antler Headbutt',
        description: 'Tiny antlers, surprising impact',
        type: 'attack',
        damage: 80,
        cooldown: 2,
        priority: 5,
      },
      {
        id: 'luck_aura',
        name: 'Luck Aura',
        description: 'Reality seems to bend around it',
        type: 'buff',
        cooldown: 3,
        priority: 8,
      },
      {
        id: 'dimension_hop',
        name: 'Dimension Hop',
        description: 'Seems to teleport short distances',
        type: 'defense',
        cooldown: 4,
        priority: 9,
      },
    ],

    phases: [
      {
        phase: 1,
        healthThreshold: 100,
        description: 'The Jackalope hops around, seemingly amused',
        attackPowerMultiplier: 1.0,
        defensePowerMultiplier: 1.0,
        specialAbilities: ['impossible_dodge', 'luck_aura'],
      },
      {
        phase: 2,
        healthThreshold: 50,
        description: 'The Impossible Beast uses all its abilities',
        attackPowerMultiplier: 1.5,
        defensePowerMultiplier: 0.8,
        specialAbilities: ['impossible_dodge', 'antler_headbutt', 'dimension_hop'],
      },
    ],

    immunities: [],
    weaknesses: [],

    guaranteedDrops: [
      {
        itemId: 'jackalope_trophy',
        name: 'Jackalope Trophy',
        description: 'Mounted head of the Impossible Beast - proof it exists',
        rarity: 'legendary',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Trophy Room', 'Permanent +5% Luck', 'Bragging Rights'],
      },
      {
        itemId: 'mystery_essence',
        name: 'Mystery Essence',
        description: 'Glowing essence of pure impossibility',
        rarity: 'mythic',
        dropChance: 1.0,
        quantity: { min: 1, max: 1 },
        usedFor: ['Reality-Bending Alchemy', 'Supernatural Crafting'],
      },
    ],

    goldReward: { min: 5000, max: 10000 },
    experienceReward: 15000,
    achievementId: 'myth_hunter',
    titleUnlocked: 'Myth Hunter',
    permanentBonus: {
      type: 'critical_chance',
      amount: 15,
      description: 'Catching the Jackalope grants +15% Critical Chance permanently (and eternal fame)',
    },

    clueLocations: [
      {
        location: 'Any Saloon',
        clueType: 'witness',
        description: 'Drunk prospector swears he saw a rabbit with antlers',
      },
      {
        location: 'Random Locations',
        clueType: 'tracks',
        description: 'Rabbit tracks that seem... wrong somehow',
      },
    ],

    rumorsFromNPCs: ['any_drunk', 'old_prospector', 'crazy_hermit', 'storyteller'],
    newspaperHeadline: 'IMPOSSIBLE MADE REAL: Hunter Captures Legendary Jackalope',

    recommendedGear: {
      weapons: ['Net', 'Tranquilizer Darts', 'Your Hands'],
      armor: ['Lucky Charms', 'Rabbit\'s Foot'],
      consumables: ['Whiskey (for courage)', 'Carrot'],
      special: ['Camera', 'Cage', 'Disbelief Suspension'],
    },

    strategyHints: [
      'Extremely rare spawn - may never encounter it',
      'Nearly impossible to hit with its evasion',
      'Consider capturing alive for more fame',
      'Don\'t blink or it might vanish',
      'Most people won\'t believe you even with proof',
    ],

    difficulty: 3,
    canFlee: true,
    companions: {
      helpful: ['none - scares it away'],
      hindering: ['all'],
    },
  },
];

/**
 * Get legendary animal by ID
 */
export function getLegendaryById(id: string): LegendaryAnimal | undefined {
  return LEGENDARY_ANIMALS.find((legendary) => legendary.id === id);
}

/**
 * Get legendaries by category
 */
export function getLegendariesByCategory(category: LegendaryCategory): LegendaryAnimal[] {
  return LEGENDARY_ANIMALS.filter((legendary) => legendary.category === category);
}

/**
 * Get legendaries by tier
 */
export function getLegendariesByTier(tier: LegendaryTier): LegendaryAnimal[] {
  return LEGENDARY_ANIMALS.filter((legendary) => legendary.tier === tier);
}

/**
 * Get legendaries by location
 */
export function getLegendariesByLocation(location: string): LegendaryAnimal[] {
  return LEGENDARY_ANIMALS.filter(
    (legendary) =>
      legendary.location === location ||
      legendary.alternateLocations?.includes(location)
  );
}

export default LEGENDARY_ANIMALS;
