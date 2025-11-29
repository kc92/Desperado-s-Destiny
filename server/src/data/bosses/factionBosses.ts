/**
 * Faction Leader Bosses - Phase 14, Wave 14.2
 *
 * Leaders of major factions in Sangre Territory
 * These bosses represent political and military power
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
 * EL REY - The Cartel King (L30)
 * Leader of the Frontera Cartel
 * Master tactician who uses hostages and psychological warfare
 */
export const EL_REY: BossEncounter = {
  id: 'boss_el_rey',
  name: 'El Rey',
  title: 'The Cartel King',
  category: BossCategory.FACTION_LEADER,
  tier: BossTier.LEGENDARY,
  level: 30,

  description: 'A shrewd and ruthless man who built an empire on blood and gold. El Rey never fights fair.',
  backstory: 'Juan "El Rey" Cortez rose from nothing to become the most powerful cartel leader in Sangre Territory. He controls trade, smuggling, and violence with an iron fist. Those who cross him simply disappear.',
  defeatDialogue: '"You think this ends anything? Ten more will rise to take my place. The Frontera is eternal..." *He laughs bitterly as blood pools beneath him*',
  victoryNarrative: 'El Rey is dead, but his empire remains. The power vacuum will lead to bloodshed for years to come.',

  location: 'Cartel Fortress',
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 28,
      description: 'Must be level 28 or higher',
    },
    {
      type: BossSpawnConditionType.REPUTATION,
      value: { faction: 'frontera', amount: -50 },
      description: 'Must be hostile with Frontera Cartel',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'quest_cartel_war_final',
      description: 'Complete "The Cartel War" questline',
    },
  ],
  respawnCooldown: 168, // 7 days

  health: 3800,
  damage: 150,
  defense: 80,
  criticalChance: 0.25,
  evasion: 0.20,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Negotiation',
      description: 'El Rey attempts to buy you off or intimidate you.',
      dialogue: '"You don\'t have to die today, amigo. Name your price. Everyone has one."',
      abilities: ['dual_pistols', 'bribe_attempt'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 66,
      name: 'The Hostage',
      description: 'El Rey takes a hostage to complicate your attack.',
      dialogue: '"Muchachos! Bring me insurance!" *Cartel guards drag a hostage into the room*',
      abilities: ['dual_pistols', 'hostage_shield', 'execute_hostage', 'called_shot'],
      modifiers: [
        {
          type: 'defense',
          multiplier: 1.3,
          description: '+30% defense (behind hostage)',
        },
      ],
      transitionNarrative: 'El Rey grabs a terrified civilian, using them as a human shield.',
    },
    {
      phaseNumber: 3,
      healthThreshold: 33,
      name: 'The King\'s Desperation',
      description: 'Wounded and desperate, El Rey fights with everything he has.',
      dialogue: '"If I die, the entire fortress goes with me! Kill the gringo!" *He triggers emergency alarms*',
      abilities: ['dual_pistols', 'called_shot', 'grenade_toss', 'last_stand'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage',
        },
        {
          type: 'aggression',
          multiplier: 2.0,
          description: 'Attacks every turn',
        },
      ],
      summonMinions: {
        type: 'elite_cartel_guard',
        count: 4,
        spawnMessage: 'Elite guards burst through all doors!',
      },
    },
  ],

  abilities: [
    {
      id: 'dual_pistols',
      name: 'Dual Pistols',
      description: 'Fires both revolvers',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 130,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Take cover',
      priority: 5,
      targetType: 'single',
    },
    {
      id: 'bribe_attempt',
      name: 'Bribery',
      description: 'Attempts to bribe you with gold',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      effect: {
        type: StatusEffect.CONFUSION,
        duration: 2,
        power: 15,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'High Spirit resists',
      telegraphMessage: '"I can make you rich beyond your dreams..."',
      priority: 3,
      targetType: 'single',
    },
    {
      id: 'hostage_shield',
      name: 'Hostage Shield',
      description: 'Uses hostage as cover, making him harder to hit',
      type: BossAbilityType.BUFF,
      cooldown: 0,
      avoidable: false,
      priority: 4,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'execute_hostage',
      name: 'Execute Hostage',
      description: 'Kills the hostage to demoralize you',
      type: BossAbilityType.DEBUFF,
      cooldown: 10,
      effect: {
        type: StatusEffect.FEAR,
        duration: 3,
        power: 30,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Rescue hostage first',
      telegraphMessage: 'El Rey aims his gun at the hostage\'s head...',
      priority: 9,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'called_shot',
      name: 'Called Shot',
      description: 'Precision shot to a vital area',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 180,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Dodge or take cover',
      telegraphMessage: 'El Rey takes careful aim...',
      priority: 7,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'grenade_toss',
      name: 'Grenade Toss',
      description: 'Throws a dynamite stick',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 120,
      damageType: BossDamageType.FIRE,
      effect: {
        type: StatusEffect.BURN,
        duration: 3,
        power: 25,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Get away from grenade',
      telegraphMessage: 'El Rey pulls the pin on a grenade!',
      priority: 8,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'last_stand',
      name: 'Last Stand',
      description: 'Desperate final attack',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 250,
      damageType: BossDamageType.PHYSICAL,
      avoidable: false,
      telegraphMessage: '"If I die, you die with me!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single',
    },
  ],

  weaknesses: [],
  immunities: [BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'hostage_rescue',
      name: 'Hostage Rescue',
      description: 'Save the hostage during phase 2',
      type: 'puzzle',
      instructions: 'Choose to shoot El Rey (risk killing hostage) or disarm him (skill check)',
      failureConsequence: 'Hostage dies, morale penalty',
      successReward: 'Bonus reputation and moral high ground',
    },
    {
      id: 'fortress_escape',
      name: 'Fortress Escape',
      description: 'Escape before reinforcements arrive',
      type: 'unique',
      instructions: 'Defeat El Rey within 15 rounds or face endless reinforcements',
      failureConsequence: 'Overwhelmed by cartel forces',
    },
  ],

  environmentEffects: [
    {
      id: 'cover_system',
      name: 'Fortress Cover',
      description: 'The fortress has good cover positions',
      triggersAt: 'start',
      effect: {
        type: 'buff',
        target: 'both',
        power: 20,
      },
      counterplay: 'Use cover to reduce damage taken',
    },
  ],

  playerLimit: {
    min: 1,
    max: 3,
    recommended: 2,
  },

  scaling: {
    healthPerPlayer: 45,
    damagePerPlayer: 15,
  },

  guaranteedDrops: [
    {
      itemId: 'el_rey_revolver',
      name: 'El Rey\'s Custom Revolver',
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'cartel_ledger',
      name: 'Cartel Ledger',
      description: 'Records of the cartel\'s operations',
      rarity: 'epic',
      dropChance: 0.5,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'blood_gold',
      name: 'Blood Gold',
      description: 'El Rey\'s personal fortune',
      rarity: 'rare',
      dropChance: 1.0,
      minQuantity: 100,
      maxQuantity: 300,
    },
    {
      itemId: 'cartel_map',
      name: 'Cartel Territory Map',
      description: 'Shows all cartel hideouts',
      rarity: 'rare',
      dropChance: 0.6,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  goldReward: {
    min: 2000,
    max: 3500,
  },
  experienceReward: 5000,

  achievements: ['kingslayer', 'cartel_breaker'],
  titles: ['El Rey Slayer', 'Cartel Breaker'],
  firstKillBonus: {
    title: 'The One Who Killed the King',
    item: 'el_rey_portrait',
    gold: 1000,
  },

  difficulty: 8,
  enrageTimer: 25,
  canFlee: false,
  fleeConsequence: 'Cannot flee - the fortress is sealed',
};

/**
 * GENERAL HAWKINS - Corrupt Military Commander (L32)
 * Leader of the corrupt military forces
 * Uses tactics, artillery, and overwhelming firepower
 */
export const GENERAL_HAWKINS: BossEncounter = {
  id: 'boss_general_hawkins',
  name: 'General Cornelius Hawkins',
  title: 'The Iron General',
  category: BossCategory.FACTION_LEADER,
  tier: BossTier.LEGENDARY,
  level: 32,

  description: 'A decorated Civil War veteran turned tyrant. Hawkins rules his territory with military precision and brutal efficiency.',
  backstory: 'General Hawkins was once a hero, but the war never left him. He sees Sangre Territory as his personal fiefdom and crushes any who challenge his authority. His men follow him out of fear and loyalty in equal measure.',
  defeatDialogue: '"The Union... the Confederacy... they\'re both dead. I was building something... NEW..." *He clutches his medals as he falls*',
  victoryNarrative: 'General Hawkins is dead. His soldiers stand in shock - some salute his body, others simply walk away, finally free.',

  location: 'Military Fort',
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 30,
      description: 'Must be level 30 or higher',
    },
    {
      type: BossSpawnConditionType.REPUTATION,
      value: { faction: 'settlerAlliance', amount: -60 },
      description: 'Must be hostile with Settler Alliance',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'quest_military_uprising',
      description: 'Complete "The Military Uprising" questline',
    },
  ],
  respawnCooldown: 168, // 7 days

  health: 4200,
  damage: 140,
  defense: 100,
  criticalChance: 0.15,
  evasion: 0.10,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'Opening Salvo',
      description: 'Hawkins directs his troops with military precision.',
      dialogue: '"Soldiers! Show this insurgent the price of rebellion!"',
      abilities: ['rifle_shot', 'command_volley'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 66,
      name: 'Artillery Barrage',
      description: 'Hawkins calls in artillery support.',
      dialogue: '"Artillery! Target coordinates: my position! Danger close!"',
      abilities: ['rifle_shot', 'command_volley', 'artillery_strike', 'defensive_formation'],
      modifiers: [
        {
          type: 'defense',
          multiplier: 1.4,
          description: '+40% defense',
        },
      ],
      summonMinions: {
        type: 'veteran_soldier',
        count: 3,
        spawnMessage: 'Veteran soldiers take defensive positions!',
      },
    },
    {
      phaseNumber: 3,
      healthThreshold: 33,
      name: 'Last Stand',
      description: 'Hawkins personally leads the charge.',
      dialogue: '"CHARGE! For glory! For EMPIRE!" *He draws his saber*',
      abilities: ['saber_strike', 'command_volley', 'artillery_strike', 'generals_fury'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.6,
          description: '+60% damage',
        },
        {
          type: 'defense',
          multiplier: 0.7,
          description: '-30% defense (reckless charge)',
        },
      ],
    },
  ],

  abilities: [
    {
      id: 'rifle_shot',
      name: 'Rifle Shot',
      description: 'Precise military rifle fire',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Take cover',
      priority: 5,
      targetType: 'single',
    },
    {
      id: 'command_volley',
      name: 'Command: Volley Fire',
      description: 'Orders all soldiers to fire simultaneously',
      type: BossAbilityType.AOE,
      cooldown: 4,
      damage: 80,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Stay in cover',
      telegraphMessage: '"All units: FIRE!"',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'artillery_strike',
      name: 'Artillery Strike',
      description: 'Calls down a devastating artillery shell',
      type: BossAbilityType.AOE,
      cooldown: 6,
      damage: 200,
      damageType: BossDamageType.FIRE,
      effect: {
        type: StatusEffect.STUN,
        duration: 1,
        power: 100,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Move away from targeting area',
      telegraphMessage: 'You hear a whistle growing louder...',
      priority: 10,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'defensive_formation',
      name: 'Defensive Formation',
      description: 'Soldiers form a protective shield wall',
      type: BossAbilityType.BUFF,
      cooldown: 5,
      avoidable: false,
      priority: 6,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'saber_strike',
      name: 'Saber Strike',
      description: 'A powerful cavalry saber attack',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 160,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.BLEED,
        duration: 3,
        power: 30,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: false,
      priority: 8,
      requiresPhase: 3,
      targetType: 'single',
    },
    {
      id: 'generals_fury',
      name: 'General\'s Fury',
      description: 'A devastating series of attacks',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 300,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Perfect parry required',
      telegraphMessage: 'Hawkins\' eyes burn with battle-fury!',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.FIRE,
      multiplier: 1.2,
      description: 'Ammunition supplies can be ignited',
    },
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'military_tactics',
      name: 'Military Tactics',
      description: 'Soldiers fight with coordinated tactics',
      type: 'coordination',
      instructions: 'Disrupt formation to reduce effectiveness',
      failureConsequence: 'Pinned down by coordinated fire',
    },
    {
      id: 'ammunition_depot',
      name: 'Destroy Ammunition',
      description: 'Destroy the ammo depot to weaken the general',
      type: 'puzzle',
      instructions: 'Target explosive barrels to disable artillery',
      successReward: 'Artillery strikes disabled',
    },
  ],

  environmentEffects: [
    {
      id: 'fortifications',
      name: 'Fort Defenses',
      description: 'The fort provides excellent cover',
      triggersAt: 'start',
      effect: {
        type: 'buff',
        target: 'boss',
        power: 30,
      },
      counterplay: 'Destroy fortifications for bonus damage',
    },
    {
      id: 'smoke',
      name: 'Battle Smoke',
      description: 'Gunsmoke reduces visibility',
      triggersAt: 'periodic',
      interval: 3,
      effect: {
        type: 'debuff',
        target: 'both',
        power: 15,
      },
      duration: 2,
    },
  ],

  playerLimit: {
    min: 1,
    max: 4,
    recommended: 3,
  },

  scaling: {
    healthPerPlayer: 50,
    damagePerPlayer: 12,
    unlockMechanics: [
      {
        playerCount: 3,
        mechanics: ['reinforcement_wave'],
      },
    ],
  },

  guaranteedDrops: [
    {
      itemId: 'generals_saber',
      name: 'General Hawkins\' Saber',
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'military_uniform',
      name: 'General\'s Uniform',
      description: 'A pristine military dress uniform',
      rarity: 'epic',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'war_medals',
      name: 'War Medals',
      description: 'Medals from the Civil War',
      rarity: 'rare',
      dropChance: 0.7,
      minQuantity: 1,
      maxQuantity: 5,
    },
    {
      itemId: 'military_orders',
      name: 'Secret Military Orders',
      description: 'Classified documents',
      rarity: 'epic',
      dropChance: 0.5,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  goldReward: {
    min: 2200,
    max: 4000,
  },
  experienceReward: 5500,

  achievements: ['general_killer', 'military_justice'],
  titles: ['General Slayer', 'Fort Breaker'],
  firstKillBonus: {
    title: 'The One Who Broke the Iron General',
    item: 'generals_banner',
    gold: 1200,
  },

  difficulty: 9,
  enrageTimer: 30,
  canFlee: true,
  fleeConsequence: 'Branded as a deserter - bounty placed on your head',
};

/**
 * Export all faction leader bosses
 */
export const FACTION_LEADER_BOSSES: BossEncounter[] = [
  EL_REY,
  GENERAL_HAWKINS,
];
