/**
 * Greenhorn Bosses - Phase 19.2
 * Three bosses for L1-15 content pack representing different threat types
 *
 * 1. Rattlesnake Pete (L5) - Grounded wildlife/survival threat
 * 2. The Debt Collector (L10) - Semi-legendary economic enforcer
 * 3. The Bandit King (L15) - Truly legendary outlaw king
 *
 * Design Philosophy:
 * - L5: Grounded, realistic enemy - tutorial boss
 * - L10: Semi-legendary, mysterious figure - bridge boss
 * - L15: Legendary figure with multi-phase epic battle - pack climax
 */

import {
  BossEncounter,
  BossCategory,
  BossTier,
  BossDamageType,
  StatusEffect,
  BossAbilityType,
  BossSpawnConditionType
} from '@desperados/shared';

// =============================================================================
// RATTLESNAKE PETE (L5) - Grounded Wildlife Threat
// Tutorial-level boss, teaches basic combat mechanics
// =============================================================================

export const RATTLESNAKE_PETE: BossEncounter = {
  id: 'boss_rattlesnake_pete',
  name: 'Rattlesnake Pete',
  title: 'The Snake Handler',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.RARE,
  level: 5,

  description:
    'A grizzled hermit who lives in Serpent Canyon with his "children" - dozens of trained rattlesnakes.',
  backstory:
    'Pete was once a traveling snake oil salesman until his cart was overturned by bandits. ' +
    'Stranded in the desert, he nearly died until a rattlesnake spared his life. Now he believes ' +
    'he has a mystical connection to serpents. Some say he\'s crazy. Others say he\'s dangerous. ' +
    'Everyone agrees he smells terrible.',
  defeatDialogue:
    '"Ssssso... you\'ve beaten me... but my children will remember you..." *hissing laughter*',
  victoryNarrative:
    'Rattlesnake Pete collapses among his serpents, who slither away into the rocks. ' +
    'The canyon is safe again - for now.',

  location: 'Serpent Canyon',
  alternateLocations: ['Desert Wastes', 'Abandoned Mine'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 3,
      description: 'Must be level 3 or higher'
    }
  ],
  respawnCooldown: 12, // 12 hours

  // Combat Stats - Entry level boss
  health: 400,
  damage: 35,
  defense: 15,
  criticalChance: 0.10,
  evasion: 0.15,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Snake Charmer',
      description: 'Pete commands his snakes from a safe distance.',
      dialogue: '"Come closer, friend... my children are hungry..."',
      abilities: ['snake_swarm', 'venomous_bite'],
      modifiers: []
    },
    {
      phaseNumber: 2,
      healthThreshold: 40,
      name: 'Cornered Serpent',
      description: 'Pete becomes desperate and fights personally.',
      dialogue: '"You\'ve killed my babies! NOW YOU DIE!"',
      abilities: ['snake_swarm', 'venomous_bite', 'desperate_stab', 'final_swarm'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage (enraged)'
        },
        {
          type: 'speed',
          multiplier: 1.2,
          description: '+20% attack speed'
        }
      ]
    }
  ],

  abilities: [
    {
      id: 'snake_swarm',
      name: 'Snake Swarm',
      description: 'Pete releases a swarm of rattlesnakes',
      type: BossAbilityType.SUMMON,
      cooldown: 3,
      damage: 15,
      damageType: BossDamageType.POISON,
      avoidable: true,
      avoidMechanic: 'Keep moving to avoid the snakes',
      priority: 6,
      targetType: 'all'
    },
    {
      id: 'venomous_bite',
      name: 'Venomous Bite',
      description: 'Commands a snake to deliver a poisonous bite',
      type: BossAbilityType.DOT,
      cooldown: 2,
      damage: 20,
      damageType: BossDamageType.POISON,
      effect: {
        type: StatusEffect.POISON,
        duration: 3,
        power: 8,
        stackable: true,
        maxStacks: 3,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Dodge the striking snake',
      telegraphMessage: 'A large rattlesnake coils to strike!',
      priority: 7,
      targetType: 'single'
    },
    {
      id: 'desperate_stab',
      name: 'Desperate Stab',
      description: 'Pete attacks with a rusty knife',
      type: BossAbilityType.DAMAGE,
      cooldown: 1,
      damage: 30,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Block or dodge',
      priority: 5,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'final_swarm',
      name: 'Final Swarm',
      description: 'Pete releases ALL his remaining snakes',
      type: BossAbilityType.ULTIMATE,
      cooldown: 0, // One-time use
      damage: 40,
      damageType: BossDamageType.POISON,
      avoidable: true,
      avoidMechanic: 'Find high ground or clear the area',
      telegraphMessage: 'Pete screams and opens every cage!',
      priority: 10,
      requiresPhase: 2,
      targetType: 'all'
    }
  ],

  weaknesses: [
    {
      damageType: BossDamageType.FIRE,
      multiplier: 1.5,
      description: 'Snakes fear fire - Pete is no exception'
    }
  ],
  immunities: [BossDamageType.POISON],

  specialMechanics: [
    {
      id: 'snake_cages',
      name: 'Snake Cages',
      description: 'Destroy the cages to prevent Pete from summoning more snakes',
      type: 'unique',
      instructions: 'Attack the cages around the arena (3 total)',
      successReward: 'Pete cannot use Snake Swarm ability',
      failureConsequence: 'Continuous snake spawning'
    }
  ],

  environmentEffects: [
    {
      id: 'slithering_ground',
      name: 'Slithering Ground',
      description: 'Snakes cover the arena floor',
      triggersAt: 'periodic',
      interval: 4,
      effect: {
        type: 'damage',
        target: 'player',
        power: 5
      },
      duration: 2,
      counterplay: 'Stay on rocks to avoid floor snakes'
    }
  ],

  playerLimit: {
    min: 1,
    max: 2,
    recommended: 1
  },

  scaling: {
    healthPerPlayer: 25,
    damagePerPlayer: 10
  },

  guaranteedDrops: [
    {
      itemId: 'antivenom-recipe',
      name: 'Antivenom Recipe',
      rarity: 'uncommon',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'snakeskin-boots',
      name: 'Snakeskin Boots',
      description: 'Boots made from rattlesnake hide',
      rarity: 'rare',
      dropChance: 0.25,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'rattlesnake-fang',
      name: 'Rattlesnake Fang',
      description: 'A venomous fang - useful for poison crafting',
      rarity: 'uncommon',
      dropChance: 0.6,
      minQuantity: 1,
      maxQuantity: 3
    }
  ],

  goldReward: {
    min: 150,
    max: 300
  },
  experienceReward: 500,

  achievements: ['snake_slayer', 'first_boss'],
  titles: ['Snake Handler'],
  firstKillBonus: {
    title: 'Serpent\'s Bane',
    item: 'snakeskin-hat',
    gold: 100
  },

  difficulty: 3,
  canFlee: true,
  fleeConsequence: 'Pete laughs as you run from his snakes'
};

// =============================================================================
// THE DEBT COLLECTOR (L10) - Semi-Legendary Economic Threat
// Bridge boss, introduces more complex mechanics
// =============================================================================

export const DEBT_COLLECTOR: BossEncounter = {
  id: 'boss_debt_collector',
  name: 'The Debt Collector',
  title: 'The Man Who Never Forgets',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.RARE,
  level: 10,

  description:
    'A mysterious figure in black who works for eastern banks. No one who owes money escapes him.',
  backstory:
    'No one knows his real name. He appeared in the territory five years ago, collecting debts ' +
    'for the First National Bank of New York. He never fails. He never forgives. And he always ' +
    'gets his money - or takes something more valuable. Rumors say he\'s not entirely human, ' +
    'that he sold his soul for supernatural patience and tracking abilities.',
  defeatDialogue:
    '"The debt... is cleared... But there are always... more debts..." *collapses*',
  victoryNarrative:
    'The Debt Collector falls, his ledger spilling open. Inside are hundreds of names, ' +
    'some crossed out. You add your own to the list of survivors.',

  location: "Debtor's Gulch",
  alternateLocations: ['Red Gulch Bank', 'Frontier Saloon'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 8,
      description: 'Must be level 8 or higher'
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'newcomers-trail:08-gangs-all-here',
      description: 'Must have encountered the gang system'
    }
  ],
  respawnCooldown: 24,

  health: 1200,
  damage: 65,
  defense: 40,
  criticalChance: 0.15,
  evasion: 0.20,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Accounting',
      description: 'The Collector calculates your debt - with interest.',
      dialogue: '"Let me check my records... ah yes, you owe quite a bit."',
      abilities: ['intimidating_presence', 'interest_accumulation', 'hired_muscle'],
      modifiers: []
    },
    {
      phaseNumber: 2,
      healthThreshold: 60,
      name: 'Aggressive Collection',
      description: 'The Collector decides to collect personally.',
      dialogue: '"Payment in blood will suffice. The bank always collects."',
      abilities: [
        'intimidating_presence',
        'interest_accumulation',
        'hired_muscle',
        'collectors_mark',
        'foreclosure'
      ],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.4,
          description: '+40% damage (personal collection)'
        }
      ]
    },
    {
      phaseNumber: 3,
      healthThreshold: 25,
      name: 'Final Audit',
      description: 'The Collector reveals his true nature.',
      dialogue: '"You want to know my secret? I\'ve been dead for twenty years. But the debt lives on."',
      abilities: [
        'intimidating_presence',
        'final_demand',
        'soul_collection'
      ],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.6,
          description: '+60% damage'
        },
        {
          type: 'defense',
          multiplier: 0.7,
          description: '-30% defense (desperate)'
        }
      ]
    }
  ],

  abilities: [
    {
      id: 'intimidating_presence',
      name: 'Intimidating Presence',
      description: 'The Collector\'s aura saps your will to fight',
      type: BossAbilityType.DEBUFF,
      cooldown: 4,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.WEAKNESS,
        duration: 3,
        power: 15,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'High Spirit stat resists the effect',
      priority: 6,
      targetType: 'all'
    },
    {
      id: 'interest_accumulation',
      name: 'Interest Accumulation',
      description: 'Your "debt" grows, dealing increasing damage over time',
      type: BossAbilityType.DOT,
      cooldown: 3,
      damage: 10,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.CORRUPTION,
        duration: 10,
        power: 5,
        stackable: true,
        maxStacks: 5,
        appliedAt: new Date()
      },
      avoidable: false,
      priority: 5,
      targetType: 'single'
    },
    {
      id: 'hired_muscle',
      name: 'Hired Muscle',
      description: 'The Collector calls in enforcers',
      type: BossAbilityType.SUMMON,
      cooldown: 6,
      avoidable: false,
      priority: 4,
      targetType: 'all'
    },
    {
      id: 'collectors_mark',
      name: "Collector's Mark",
      description: 'Marks a target for death - increased damage taken',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.ARMOR_BREAK,
        duration: 4,
        power: 25,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: false,
      telegraphMessage: 'The Collector marks your name in his ledger...',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'foreclosure',
      name: 'Foreclosure',
      description: 'Massive damage attack',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Interrupt or dodge',
      telegraphMessage: 'The Collector draws his revolver with deadly intent...',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'final_demand',
      name: 'Final Demand',
      description: 'Ultimate attack that hits everyone',
      type: BossAbilityType.AOE,
      cooldown: 6,
      damage: 80,
      damageType: BossDamageType.PSYCHIC,
      avoidable: true,
      avoidMechanic: 'Break line of sight',
      telegraphMessage: '"PAYMENT IS DUE!" The Collector\'s eyes glow...',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'soul_collection',
      name: 'Soul Collection',
      description: 'The Collector attempts to claim your soul',
      type: BossAbilityType.ULTIMATE,
      cooldown: 0,
      damage: 200,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Quick-time event: Resist the darkness',
      telegraphMessage: 'The Collector reaches toward your chest with a spectral hand...',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single'
    }
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 2.0,
      description: 'Holy items and prayers harm his corrupted soul'
    }
  ],
  immunities: [BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'debt_ledger',
      name: 'The Ledger',
      description: 'Destroying his ledger weakens the Collector',
      type: 'unique',
      instructions: 'Attack the ledger he carries (appears in Phase 2)',
      successReward: 'Collector takes 50% more damage for 30 seconds',
      failureConsequence: 'Collector regains health'
    },
    {
      id: 'enforcers',
      name: 'Hired Enforcers',
      description: 'Kill the enforcers before they overwhelm you',
      type: 'coordination',
      instructions: 'Prioritize the summoned enforcers or they stack damage',
      failureConsequence: 'Enforcers deal increasing damage over time'
    }
  ],

  environmentEffects: [
    {
      id: 'oppressive_dread',
      name: 'Oppressive Dread',
      description: 'The Collector\'s presence drains your will',
      triggersAt: 'periodic',
      interval: 5,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 10
      },
      duration: 2,
      counterplay: 'Stay near light sources'
    }
  ],

  playerLimit: {
    min: 1,
    max: 3,
    recommended: 2
  },

  scaling: {
    healthPerPlayer: 35,
    damagePerPlayer: 15
  },

  guaranteedDrops: [
    {
      itemId: 'collectors-ledger',
      name: "Collector's Ledger",
      rarity: 'rare',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'debt-collectors-hat',
      name: "Debt Collector's Hat",
      description: 'His distinctive black bowler',
      rarity: 'rare',
      dropChance: 0.30,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'collectors-revolver',
      name: "Collector's Revolver",
      description: 'A cold, black revolver',
      rarity: 'rare',
      dropChance: 0.20,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'bank-bonds',
      name: 'Bank Bonds',
      description: 'Valuable financial instruments',
      rarity: 'uncommon',
      dropChance: 0.8,
      minQuantity: 3,
      maxQuantity: 10
    }
  ],

  goldReward: {
    min: 500,
    max: 1000
  },
  experienceReward: 1500,

  achievements: ['debt_cleared', 'soul_keeper'],
  titles: ['Debt Free', 'The Auditor'],
  firstKillBonus: {
    title: 'The One Who Paid in Full',
    item: 'collectors-coat',
    gold: 300
  },

  difficulty: 5,
  canFlee: true,
  fleeConsequence: 'The Collector notes your cowardice. Your debt increases.'
};

// =============================================================================
// THE BANDIT KING (L15) - Truly Legendary Crime Threat
// Pack climax boss, full multi-phase epic battle
// =============================================================================

export const BANDIT_KING: BossEncounter = {
  id: 'boss_bandit_king',
  name: 'The Bandit King',
  title: 'Lord of Outlaws',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.EPIC,
  level: 15,

  description:
    'A legendary outlaw who united every gang in the southern territory under his banner. ' +
    'Former Confederate officer, current criminal mastermind.',
  backstory:
    'Colonel Marcus "The King" Reeves fought for the Confederacy until the bitter end. ' +
    'When the war ended, he refused to surrender. Instead, he gathered other ex-soldiers ' +
    'and built a criminal empire that spans three territories. From his throne at Crown Rock, ' +
    'he rules with iron fist and silver tongue. They say he\'s never lost a fight, never ' +
    'broken his word to an ally, and never shown mercy to an enemy.',
  defeatDialogue:
    '"A king... should die... on his throne..." *reaches for his crown* "Long live... the next..."',
  victoryNarrative:
    'The Bandit King falls from his makeshift throne, crown clattering to the stone floor. ' +
    'His empire dies with him - or does it? Already, his lieutenants are sizing each other up. ' +
    'But that\'s a problem for another day. Today, you\'ve slain a legend.',

  location: 'Crown Rock Hideout',
  alternateLocations: ['Outlaw Canyon', 'The Bandit Fortress'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 13,
      description: 'Must be level 13 or higher'
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'war-prologue:choosing-allegiances',
      description: 'Must have chosen a faction in the war'
    }
  ],
  respawnCooldown: 48,

  health: 3500,
  damage: 95,
  defense: 55,
  criticalChance: 0.25,
  evasion: 0.15,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Court of Thieves',
      description: 'The King commands from his throne, sending waves of bandits.',
      dialogue: '"Another challenger? Very well. Let\'s see what you\'re made of."',
      abilities: ['command_attack', 'rally_the_troops', 'sniper_lieutenant'],
      modifiers: [],
      summonMinions: {
        type: 'bandit_soldier',
        count: 3,
        spawnMessage: 'Bandits rush to defend their king!'
      }
    },
    {
      phaseNumber: 2,
      healthThreshold: 65,
      name: 'The King Descends',
      description: 'The Bandit King joins the battle personally.',
      dialogue: '"Impressive. You\'ve earned the right to face me yourself."',
      abilities: [
        'command_attack',
        'cavalry_charge',
        'kings_revolver',
        'tactical_retreat'
      ],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage'
        },
        {
          type: 'defense',
          multiplier: 1.2,
          description: '+20% defense (battle-hardened)'
        }
      ],
      transitionNarrative:
        'The Bandit King rises from his throne, drawing his legendary revolver.'
    },
    {
      phaseNumber: 3,
      healthThreshold: 30,
      name: 'Last Stand of the King',
      description: 'Desperate and wounded, the King fights with everything he has.',
      dialogue: '"I\'ve survived a war. I\'ve built an empire. I will NOT fall to the likes of you!"',
      abilities: [
        'kings_revolver',
        'crown_of_thorns',
        'dynamite_throne',
        'final_order'
      ],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.6,
          description: '+60% damage (desperate fury)'
        },
        {
          type: 'speed',
          multiplier: 1.4,
          description: '+40% attack speed'
        },
        {
          type: 'defense',
          multiplier: 0.8,
          description: '-20% defense (reckless)'
        }
      ],
      environmentalHazard: {
        name: 'Collapsing Hideout',
        description: 'The King has rigged explosives. The cave is collapsing!',
        damagePerTurn: 15,
        avoidable: true
      }
    }
  ],

  abilities: [
    {
      id: 'command_attack',
      name: 'Command Attack',
      description: 'Orders his men to focus fire',
      type: BossAbilityType.AOE,
      cooldown: 2,
      damage: 40,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Take cover from the volley',
      priority: 5,
      targetType: 'all'
    },
    {
      id: 'rally_the_troops',
      name: 'Rally the Troops',
      description: 'Summons more bandits and heals existing ones',
      type: BossAbilityType.SUMMON,
      cooldown: 5,
      avoidable: false,
      telegraphMessage: 'The King raises his sword: "To me, boys!"',
      priority: 7,
      targetType: 'all'
    },
    {
      id: 'sniper_lieutenant',
      name: 'Sniper Lieutenant',
      description: 'The King\'s best marksman takes aim',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 80,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Break line of sight with the sniper',
      telegraphMessage: 'A red glint appears from the shadows...',
      priority: 8,
      targetType: 'single'
    },
    {
      id: 'cavalry_charge',
      name: 'Cavalry Charge',
      description: 'The King charges on horseback',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 100,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Dodge to the side at the last moment',
      telegraphMessage: 'The King mounts his warhorse and lowers his saber!',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'kings_revolver',
      name: "King's Revolver",
      description: 'Six perfect shots from a legendary weapon',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 60,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Quick-time dodge for each shot',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'tactical_retreat',
      name: 'Tactical Retreat',
      description: 'The King retreats to heal and summon more troops',
      type: BossAbilityType.HEAL,
      cooldown: 8,
      avoidable: false,
      priority: 6,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'crown_of_thorns',
      name: 'Crown of Thorns',
      description: 'The King\'s crown grants temporary invulnerability',
      type: BossAbilityType.BUFF,
      cooldown: 10,
      avoidable: false,
      telegraphMessage: 'The King clutches his crown, which begins to glow...',
      priority: 9,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'dynamite_throne',
      name: 'Dynamite Throne',
      description: 'The King detonates explosives hidden in the throne',
      type: BossAbilityType.AOE,
      cooldown: 0, // One-time use
      damage: 150,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Get as far from the throne as possible',
      telegraphMessage: '"If I can\'t have my kingdom, NEITHER CAN YOU!" The King pulls a detonator...',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'final_order',
      name: 'Final Order',
      description: 'All remaining bandits attack in a suicide rush',
      type: BossAbilityType.ULTIMATE,
      cooldown: 0,
      damage: 200,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Kill the rushing bandits before they reach you',
      telegraphMessage: '"KILL THEM! KILL THEM ALL! NO RETREAT!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all'
    }
  ],

  weaknesses: [],
  immunities: [BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'throne_protection',
      name: 'Throne Protection',
      description: 'In Phase 1, the King is protected while on his throne',
      type: 'unique',
      instructions: 'Kill his guards to force him off the throne',
      successReward: 'Phase 2 begins, King takes full damage',
      failureConsequence: 'Endless bandit spawns while King is protected'
    },
    {
      id: 'lieutenant_priority',
      name: 'Kill the Lieutenants',
      description: 'The King\'s lieutenants provide buffs',
      type: 'coordination',
      instructions: 'Eliminate the sniper and cavalry lieutenant to weaken the King',
      successReward: '-20% King damage per lieutenant killed'
    },
    {
      id: 'escape_route',
      name: 'Block the Escape',
      description: 'In Phase 3, block the King\'s escape tunnels',
      type: 'puzzle',
      instructions: 'Collapse the tunnels before the King can flee',
      failureConsequence: 'King escapes at 5% health, encounter fails'
    }
  ],

  environmentEffects: [
    {
      id: 'cave_collapse',
      name: 'Cave Collapse',
      description: 'Rocks fall from the ceiling',
      triggersAt: 'phase_change',
      threshold: 30,
      effect: {
        type: 'damage',
        target: 'both',
        power: 20
      },
      counterplay: 'Stay near the cave walls'
    }
  ],

  playerLimit: {
    min: 1,
    max: 4,
    recommended: 3
  },

  scaling: {
    healthPerPlayer: 40,
    damagePerPlayer: 12,
    unlockMechanics: [
      {
        playerCount: 3,
        mechanics: ['escape_route']
      }
    ]
  },

  guaranteedDrops: [
    {
      itemId: 'crown-of-the-bandit-king',
      name: 'Crown of the Bandit King',
      rarity: 'epic',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'bandit-kings-revolver',
      name: "Bandit King's Revolver",
      description: 'The legendary weapon of the outlaw lord',
      rarity: 'epic',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'kings-war-saber',
      name: "King's War Saber",
      description: 'Confederate officer\'s saber with notched edge',
      rarity: 'rare',
      dropChance: 0.40,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'crown-rock-gold',
      name: 'Crown Rock Treasury Gold',
      description: 'Gold coins from the bandit treasury',
      rarity: 'uncommon',
      dropChance: 1.0,
      minQuantity: 100,
      maxQuantity: 500
    },
    {
      itemId: 'bandit-insignia',
      name: 'Bandit Insignia',
      description: 'The King\'s personal insignia - proof of the kill',
      rarity: 'rare',
      dropChance: 0.8,
      minQuantity: 1,
      maxQuantity: 1
    }
  ],

  goldReward: {
    min: 1500,
    max: 3000
  },
  experienceReward: 4000,

  achievements: ['king_slayer', 'empire_breaker', 'crown_taker'],
  titles: ['Kingslayer', 'The New Law', 'Crown Breaker'],
  firstKillBonus: {
    title: 'The One Who Dethroned the King',
    item: 'kings-throne-fragment',
    gold: 1000
  },

  difficulty: 7,
  enrageTimer: 15,
  canFlee: false,
  fleeConsequence: 'The King blocks all exits - there is no escape'
};

// =============================================================================
// EXPORTS
// =============================================================================

export const GREENHORN_BOSSES: BossEncounter[] = [
  RATTLESNAKE_PETE,
  DEBT_COLLECTOR,
  BANDIT_KING
];

/**
 * Get greenhorn boss by ID
 */
export function getGreenhornBossById(bossId: string): BossEncounter | undefined {
  return GREENHORN_BOSSES.find(b => b.id === bossId);
}

/**
 * Get greenhorn bosses by level range
 */
export function getGreenhornBossesByLevel(
  minLevel: number,
  maxLevel: number
): BossEncounter[] {
  return GREENHORN_BOSSES.filter(
    b => b.level >= minLevel && b.level <= maxLevel
  );
}
