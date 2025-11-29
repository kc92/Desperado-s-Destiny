/**
 * Outlaw Legend Bosses - Phase 14, Wave 14.2
 *
 * Legendary outlaws and gunfighters of Sangre Territory
 * These bosses represent the deadliest humans in the west
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
 * "BLACK" BILL THORNTON - Legendary Outlaw (L25)
 * The fastest gun in the west
 * Known for lightning-quick draws and dead-eye accuracy
 */
export const BLACK_BILL: BossEncounter = {
  id: 'boss_black_bill',
  name: '"Black" Bill Thornton',
  title: 'The Fastest Gun',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.EPIC,
  level: 25,

  description: 'A ghost of a man dressed all in black, with eyes like flint and hands faster than thought.',
  backstory: 'Bill Thornton earned his name and reputation through fifty documented duels - all victories. He claims to have made a deal with the devil for his speed. Witnesses swear they\'ve never seen him miss.',
  defeatDialogue: '"Fastest gun in the west... finally met someone faster..." *He smiles grimly* "Good."',
  victoryNarrative: 'Black Bill falls, his guns clattering to the dust. The legend dies, but the stories will live forever.',

  location: 'Dusty Crossroads',
  alternateLocations: ['Saloon Row', 'High Noon Square'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 20,
      description: 'Must be level 20 or higher',
    },
    {
      type: BossSpawnConditionType.TIME_OF_DAY,
      value: 'noon',
      description: 'Only spawns at high noon (12pm)',
    },
  ],
  respawnCooldown: 72,

  health: 2800,
  damage: 180,
  defense: 50,
  criticalChance: 0.40,
  evasion: 0.30,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Duel',
      description: 'A classic gunfighter\'s duel - hand to hand.',
      dialogue: '"Draw when you\'re ready. I\'ll wait." *His hand hovers over his holster*',
      abilities: ['quick_draw', 'dead_eye'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 50,
      name: 'Desperation',
      description: 'Bill pulls out all his tricks.',
      dialogue: '"You\'re good. Real good. Let\'s see how you handle THIS!" *He pulls a second gun*',
      abilities: ['quick_draw', 'dead_eye', 'dual_wielding', 'ricochet_shot'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage (dual guns)',
        },
        {
          type: 'speed',
          multiplier: 1.4,
          description: '+40% speed',
        },
      ],
    },
  ],

  abilities: [
    {
      id: 'quick_draw',
      name: 'Quick Draw',
      description: 'Lightning-fast pistol shot',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 150,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Match his speed',
      priority: 5,
      targetType: 'single',
    },
    {
      id: 'dead_eye',
      name: 'Dead Eye',
      description: 'Perfect aim for critical hit',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 250,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Dodge at exact right moment',
      telegraphMessage: 'Bill\'s eyes narrow with deadly focus...',
      priority: 9,
      targetType: 'single',
    },
    {
      id: 'dual_wielding',
      name: 'Dual Wielding',
      description: 'Fires both guns simultaneously',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      avoidable: false,
      priority: 7,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'ricochet_shot',
      name: 'Ricochet Shot',
      description: 'Bullet bounces to hit from unexpected angle',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 180,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Watch the environment',
      telegraphMessage: 'Bill aims at a nearby metal surface...',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
  ],

  weaknesses: [],
  immunities: [BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'high_noon_duel',
      name: 'Classic Duel',
      description: 'A true western duel at high noon',
      type: 'unique',
      instructions: 'Quick-time event: Draw faster than Bill',
      successReward: 'Instant victory if you draw first and hit',
      failureConsequence: 'Take massive damage',
    },
  ],

  environmentEffects: [],

  playerLimit: {
    min: 1,
    max: 1,
    recommended: 1,
  },

  scaling: {
    healthPerPlayer: 0,
    damagePerPlayer: 0,
  },

  guaranteedDrops: [
    {
      itemId: 'black_bills_pistols',
      name: 'Black Bill\'s Matched Pistols',
      rarity: 'legendary',
      quantity: 2,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'quick_draw_holster',
      name: 'Quick-Draw Holster',
      description: 'Allows faster weapon draws',
      rarity: 'epic',
      dropChance: 0.5,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'devils_contract',
      name: 'Devil\'s Contract',
      description: 'A strange document in Bill\'s pocket',
      rarity: 'rare',
      dropChance: 0.3,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  goldReward: {
    min: 1000,
    max: 2000,
  },
  experienceReward: 4000,

  achievements: ['quick_draw_master', 'gunslinger'],
  titles: ['Faster Than Black Bill', 'Dead-Eye Duelist'],
  firstKillBonus: {
    title: 'The One Who Outdrew Black Bill',
    item: 'black_bills_hat',
    gold: 500,
  },

  difficulty: 8,
  canFlee: false,
  fleeConsequence: 'Cannot flee from a duel',
};

/**
 * THE DALTON BROTHERS - Gang of Outlaws (L28)
 * Three brothers who fight as one
 * Requires coordination to defeat them all
 */
export const DALTON_BROTHERS: BossEncounter = {
  id: 'boss_dalton_brothers',
  name: 'The Dalton Brothers',
  title: 'The Terrible Three',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.EPIC,
  level: 28,

  description: 'Frank, Jesse, and Cole Dalton - three brothers who have robbed every bank and train in the territory.',
  backstory: 'The Dalton Brothers are infamous for their daring robberies and brutal efficiency. They\'ve never been caught, never been separated, and never left a witness alive.',
  defeatDialogue: '"Brothers... together... to the... end..." *They fall in unison, still standing side by side*',
  victoryNarrative: 'The Dalton Brothers are dead. Their reign of terror ends, but their legend will grow.',

  location: 'Dalton Hideout',
  alternateLocations: ['Train Depot', 'Bank Row'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 25,
      description: 'Must be level 25 or higher',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'quest_dalton_trail',
      description: 'Track down the Daltons',
    },
  ],
  respawnCooldown: 120,

  health: 9000, // Split between 3 brothers (3000 each)
  damage: 100,
  defense: 60,
  criticalChance: 0.20,
  evasion: 0.15,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'Three Against One',
      description: 'All three brothers attack together.',
      dialogue: '"Frank: You take left. Jesse: Center. Cole: Right. Let\'s end this quick, boys."',
      abilities: ['coordinated_fire', 'covering_fire'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 66,
      name: 'One Falls',
      description: 'With one brother down, the others become enraged.',
      dialogue: '"You killed Frank! You\'re gonna pay for that!"',
      abilities: ['coordinated_fire', 'covering_fire', 'vengeance_shot', 'brothers_fury'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage (enraged)',
        },
      ],
    },
    {
      phaseNumber: 3,
      healthThreshold: 33,
      name: 'Last Brother Standing',
      description: 'The final Dalton fights with nothing to lose.',
      dialogue: '"I\'ll kill you for them. I\'ll kill you for both of them!"',
      abilities: ['desperate_assault', 'brothers_fury', 'last_stand_grenade'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.6,
          description: '+60% damage (desperate)',
        },
        {
          type: 'defense',
          multiplier: 0.6,
          description: '-40% defense (reckless)',
        },
      ],
    },
  ],

  abilities: [
    {
      id: 'coordinated_fire',
      name: 'Coordinated Fire',
      description: 'All living brothers fire together',
      type: BossAbilityType.AOE,
      cooldown: 2,
      damage: 90,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Take cover',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'covering_fire',
      name: 'Covering Fire',
      description: 'One brother provides covering fire while others move',
      type: BossAbilityType.BUFF,
      cooldown: 3,
      avoidable: false,
      priority: 5,
      targetType: 'all',
    },
    {
      id: 'vengeance_shot',
      name: 'Vengeance Shot',
      description: 'Empowered by rage for fallen brother',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 180,
      damageType: BossDamageType.PHYSICAL,
      avoidable: false,
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'brothers_fury',
      name: 'Brothers\' Fury',
      description: 'Unleashes all remaining firepower',
      type: BossAbilityType.ULTIMATE,
      cooldown: 5,
      damage: 220,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Stay in cover',
      telegraphMessage: 'The remaining brothers load all their weapons!',
      priority: 10,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'desperate_assault',
      name: 'Desperate Assault',
      description: 'Reckless charge with guns blazing',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 150,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Dodge the charge',
      priority: 7,
      requiresPhase: 3,
      targetType: 'single',
    },
    {
      id: 'last_stand_grenade',
      name: 'Last Stand Grenade',
      description: 'Final desperate grenade throw',
      type: BossAbilityType.AOE,
      cooldown: 6,
      damage: 200,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Get away quickly',
      telegraphMessage: '"If I\'m going down, you\'re coming with me!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all',
    },
  ],

  weaknesses: [],
  immunities: [],

  specialMechanics: [
    {
      id: 'divide_conquer',
      name: 'Divide and Conquer',
      description: 'Separate the brothers to reduce their effectiveness',
      type: 'coordination',
      instructions: 'Focus fire on one brother at a time',
      successReward: 'Reduced damage when brothers are separated',
    },
    {
      id: 'brotherhood_bond',
      name: 'Brotherhood Bond',
      description: 'Brothers fight better when together',
      type: 'unique',
      instructions: 'Each living brother buffs the others by 15%',
      failureConsequence: 'Fighting all three is extremely dangerous',
    },
  ],

  environmentEffects: [],

  playerLimit: {
    min: 1,
    max: 3,
    recommended: 3,
  },

  scaling: {
    healthPerPlayer: 45,
    damagePerPlayer: 10,
  },

  guaranteedDrops: [
    {
      itemId: 'dalton_bandana',
      name: 'Dalton Brothers\' Bandanas',
      rarity: 'epic',
      quantity: 3,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'bank_loot',
      name: 'Stolen Bank Money',
      description: 'Money from countless robberies',
      rarity: 'rare',
      dropChance: 1.0,
      minQuantity: 50,
      maxQuantity: 200,
    },
    {
      itemId: 'wanted_posters',
      name: 'Dalton Wanted Posters',
      description: 'Original wanted posters',
      rarity: 'uncommon',
      dropChance: 0.8,
      minQuantity: 1,
      maxQuantity: 3,
    },
  ],

  goldReward: {
    min: 1500,
    max: 2800,
  },
  experienceReward: 4500,

  achievements: ['brother_killer', 'gang_breaker'],
  titles: ['Dalton Slayer', 'Gang Destroyer'],
  firstKillBonus: {
    title: 'The One Who Ended the Daltons',
    item: 'dalton_rifles',
    gold: 700,
  },

  difficulty: 8,
  enrageTimer: 20,
  canFlee: true,
  fleeConsequence: 'The brothers will ambush you later',
};

/**
 * Export all outlaw legend bosses
 */
export const OUTLAW_LEGEND_BOSSES: BossEncounter[] = [
  BLACK_BILL,
  DALTON_BROTHERS,
];
