/**
 * Frontier Justice Bosses - Phase 19.3
 * Four bosses for L16-25 content pack representing the escalating faction war
 *
 * 1. Sheriff James Barnes (L18) - The Corrupt Lawman
 * 2. The McCray Twins (L20) - Legendary Train Robbers (duo fight)
 * 3. "The Hammer" Heinrich Volkov (L22) - The Mining Enforcer
 * 4. Colonel Augustus Blackwood (L25) - The Railroad Champion (pack boss)
 *
 * Design Philosophy:
 * - L18: Moral complexity - corrupt law vs player justice
 * - L20: Duo mechanics - unique train battle encounter
 * - L22: Redemption path - boss can be spared
 * - L25: Adaptive difficulty based on player choices throughout pack
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
// SHERIFF JAMES BARNES (L18) - The Corrupt Lawman
// Moral complexity boss - a fallen hero turned Railroad enforcer
// =============================================================================

export const SHERIFF_BARNES: BossEncounter = {
  id: 'boss_sheriff_barnes',
  name: 'Sheriff James Barnes',
  title: 'The Corrupt Lawman',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.RARE,
  level: 18,

  description:
    'Once the most respected lawman in three counties. Now the Railroad Tycoons\' attack dog in a badge.',
  backstory:
    'James Barnes cleaned up Dusty Creek, Red Mesa, and Ironwood Crossing. Three towns that owed ' +
    'him their peace. Then the cattle baron came with Railroad money and a simple offer: look the ' +
    'other way, get rich. Barnes told himself he\'d only bend the rules a little. That was five ' +
    'years ago. Now he evicts farmers at gunpoint, silences witnesses, and still wears that ' +
    'tarnished star. Some say he hates himself. Others say he\'s just another outlaw with a badge.',
  defeatDialogue:
    '"Maybe... maybe this is what I deserved all along. The law... the real law... I forgot what it meant..."',
  victoryNarrative:
    'Sheriff Barnes collapses, his badge clattering to the dusty floor. The symbol of law, ' +
    'so corrupted, now lies in the dirt. Perhaps the next person to wear it will remember what it means.',

  location: 'Dry Gulch Town Hall',
  alternateLocations: ['Courthouse', 'Sheriff\'s Office'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 16,
      description: 'Must be level 16 or higher'
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'settler:the-cattle-baron',
      description: 'Must have exposed the cattle baron\'s treachery'
    }
  ],
  respawnCooldown: 24,

  // Combat Stats - Experienced lawman
  health: 2800,
  damage: 85,
  defense: 50,
  criticalChance: 0.22,
  evasion: 0.18,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Badge',
      description: 'Barnes fights with the authority of the law behind him.',
      dialogue: '"I\'m still the law around here. And the law says you\'re under arrest."',
      abilities: ['quickdraw', 'call_deputies', 'intimidation_aura'],
      modifiers: [],
      summonMinions: {
        type: 'deputy',
        count: 2,
        spawnMessage: 'Barnes blows his whistle - deputies burst through the doors!'
      }
    },
    {
      phaseNumber: 2,
      healthThreshold: 60,
      name: 'The Truth',
      description: 'Deputies dead, Barnes shows his true colors.',
      dialogue: '"Alright, no more pretending. Let\'s do this the dirty way."',
      abilities: ['quickdraw', 'desperate_shot', 'dirty_fighting', 'bribe_attempt'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage (fighting dirty)'
        },
        {
          type: 'evasion',
          multiplier: 0.8,
          description: '-20% evasion (no longer hiding)'
        }
      ],
      transitionNarrative:
        'Barnes tears off his badge and throws it aside. "Never was worth the metal anyway."'
    },
    {
      phaseNumber: 3,
      healthThreshold: 25,
      name: 'The Reckoning',
      description: 'Cornered and desperate, Barnes threatens to destroy the evidence.',
      dialogue: '"You want justice? I\'ll BURN this whole town\'s secrets with me!"',
      abilities: ['desperate_shot', 'dirty_fighting', 'explosive_evidence', 'final_stand'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage (nothing to lose)'
        },
        {
          type: 'speed',
          multiplier: 1.3,
          description: '+30% attack speed (adrenaline)'
        },
        {
          type: 'defense',
          multiplier: 0.6,
          description: '-40% defense (reckless)'
        }
      ],
      environmentalHazard: {
        name: 'Burning Documents',
        description: 'Barnes has set the evidence room on fire!',
        damagePerTurn: 12,
        avoidable: true
      }
    }
  ],

  abilities: [
    {
      id: 'quickdraw',
      name: 'Quickdraw',
      description: 'Barnes is one of the fastest draws in the West',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 70,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Quick-time event: Draw faster',
      telegraphMessage: 'Barnes\' hand hovers over his holster...',
      priority: 8,
      targetType: 'single'
    },
    {
      id: 'call_deputies',
      name: 'Call Deputies',
      description: 'Summons corrupt deputies to assist',
      type: BossAbilityType.SUMMON,
      cooldown: 6,
      avoidable: false,
      telegraphMessage: 'Barnes whistles sharply - footsteps approach!',
      priority: 6,
      targetType: 'all'
    },
    {
      id: 'intimidation_aura',
      name: 'Intimidation Aura',
      description: 'The weight of corrupted authority saps your resolve',
      type: BossAbilityType.DEBUFF,
      cooldown: 4,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.WEAKNESS,
        duration: 3,
        power: 12,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'High Spirit or Marshal reputation resists',
      priority: 5,
      targetType: 'all'
    },
    {
      id: 'desperate_shot',
      name: 'Desperate Shot',
      description: 'A wild, powerful shot',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 95,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Dodge roll',
      priority: 7,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'dirty_fighting',
      name: 'Dirty Fighting',
      description: 'Barnes fights without honor - throws dirt, uses hidden weapons',
      type: BossAbilityType.DEBUFF,
      cooldown: 4,
      damage: 45,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.BLIND,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Close your eyes at the right moment',
      priority: 6,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'bribe_attempt',
      name: 'Bribe Attempt',
      description: 'Barnes offers you money to walk away',
      type: BossAbilityType.DEBUFF,
      cooldown: 0, // One-time
      avoidable: true,
      avoidMechanic: 'Refuse the bribe (Spirit check) or accept (ends combat)',
      telegraphMessage: '"What\'s it gonna take? A thousand? Five thousand? Name your price!"',
      priority: 4,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'explosive_evidence',
      name: 'Explosive Evidence',
      description: 'Barnes detonates dynamite near the evidence room',
      type: BossAbilityType.AOE,
      cooldown: 0, // One-time
      damage: 120,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Take cover behind the heavy desks',
      telegraphMessage: 'Barnes pulls out a stick of dynamite - "If I go down, the truth goes with me!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'final_stand',
      name: 'Final Stand',
      description: 'Barnes empties his revolver in a desperate barrage',
      type: BossAbilityType.ULTIMATE,
      cooldown: 0,
      damage: 150,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Take cover and wait for the reload',
      telegraphMessage: '"COME ON THEN! LET\'S END THIS!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single'
    }
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.3,
      description: 'Righteous judgment hits harder against the corrupt'
    }
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'badge_of_shame',
      name: 'Badge of Shame',
      description: 'Picking up Barnes\' discarded badge empowers you',
      type: 'unique',
      instructions: 'Grab the badge when he throws it in Phase 2',
      successReward: '+15% damage, Barnes takes +10% damage (shamed)',
      failureConsequence: 'Deputies gain bonus morale if badge is left'
    },
    {
      id: 'evidence_room',
      name: 'Save the Evidence',
      description: 'Prevent Barnes from destroying the baron\'s ledgers',
      type: 'coordination',
      instructions: 'In Phase 3, reach the evidence room before Barnes detonates',
      successReward: 'Quest item: Baron\'s Ledger, bonus gold',
      failureConsequence: 'Evidence destroyed, reduced rewards'
    },
    {
      id: 'confession',
      name: 'Force a Confession',
      description: 'With high Persuasion, make Barnes confess',
      type: 'puzzle',
      instructions: 'Use dialogue options during Bribe Attempt phase',
      successReward: 'Barnes surrenders peacefully, maximum rewards'
    }
  ],

  environmentEffects: [
    {
      id: 'deputies_reinforcements',
      name: 'Deputy Reinforcements',
      description: 'More deputies arrive from the town',
      triggersAt: 'periodic',
      interval: 5,
      effect: {
        type: 'buff',
        target: 'boss',
        power: 1
      },
      duration: 1,
      counterplay: 'Block the doors with furniture'
    }
  ],

  playerLimit: {
    min: 1,
    max: 3,
    recommended: 2
  },

  scaling: {
    healthPerPlayer: 35,
    damagePerPlayer: 12
  },

  guaranteedDrops: [
    {
      itemId: 'badge-of-false-authority',
      name: 'Badge of False Authority',
      rarity: 'rare',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'deputies-revolver',
      name: 'Deputy\'s Revolver',
      description: 'Barnes\' personal sidearm - well-maintained despite its owner',
      rarity: 'rare',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'barons-ledger',
      name: 'Baron\'s Ledger',
      description: 'Evidence of corruption reaching high places',
      rarity: 'rare',
      dropChance: 0.5,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'lawmans-duster',
      name: 'Lawman\'s Duster',
      description: 'A long coat that once meant justice',
      rarity: 'uncommon',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 1
    }
  ],

  goldReward: {
    min: 800,
    max: 1500
  },
  experienceReward: 2500,

  achievements: ['true_justice', 'badge_breaker', 'anti_corruption'],
  titles: ['True Law', 'Badge Breaker', 'Corruption Hunter'],
  firstKillBonus: {
    title: 'The One Who Remembered Justice',
    item: 'true-lawmans-badge',
    gold: 500
  },

  difficulty: 5,
  canFlee: true,
  fleeConsequence: 'Barnes escapes - the evidence is destroyed, the baron protected'
};

// =============================================================================
// THE McCRAY TWINS (L20) - Legendary Train Robbers
// Unique duo fight mechanics on a moving train
// =============================================================================

export const MCCRAY_TWINS: BossEncounter = {
  id: 'boss_mccray_twins',
  name: 'The McCray Twins',
  title: 'Legends of the Iron Horse',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.EPIC,
  level: 20,

  description:
    'Jesse and Frank McCray - the most successful train robbers in frontier history. Legends in their own time.',
  backstory:
    'Born to a preacher and a seamstress, the McCray boys turned to crime after their family ' +
    'farm was seized by the Railroad for "unpaid taxes." They\'ve robbed seventeen trains, killed ' +
    'twenty-three Pinkerton agents, and given away most of their loot to poor families facing ' +
    'foreclosure. Some call them heroes. The Railroad calls them the biggest threat to western ' +
    'expansion. The bounty on their heads, combined, is $50,000.',
  defeatDialogue:
    'Jesse: "Well, Frank... looks like our luck ran out..." ' +
    'Frank: "Was a hell of a ride though, wasn\'t it, brother?"',
  victoryNarrative:
    'The McCray brothers stand over their fallen plans, the train slowing to a stop. ' +
    'Whether captured or killed, the legend of the McCray Twins ends here - or does it?',

  location: 'The Deadman\'s Express',
  alternateLocations: ['Moving Train', 'Railroad Bridge'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 18,
      description: 'Must be level 18 or higher'
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'bounty_board:mccray_bounty',
      description: 'Must have accepted the McCray bounty'
    }
  ],
  respawnCooldown: 48,

  // Combat Stats - Two bosses, shared health pool
  health: 4500, // Combined health
  damage: 75,
  defense: 40,
  criticalChance: 0.25,
  evasion: 0.25,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Heist',
      description: 'Fight on the train roof. The brothers work in perfect sync.',
      dialogue: 'Jesse: "Company, Frank!" Frank: "I see \'em. Let\'s dance!"',
      abilities: ['jesse_trick_shot', 'frank_dynamite', 'twin_coordination', 'smoke_bomb'],
      modifiers: [],
      environmentalHazard: {
        name: 'Train Roof',
        description: 'The wind and motion of the train make fighting treacherous',
        damagePerTurn: 0,
        avoidable: true
      }
    },
    {
      phaseNumber: 2,
      healthThreshold: 50,
      name: 'Inside the Cars',
      description: 'The fight moves inside the train. Close quarters favor Frank.',
      dialogue: 'Frank: "Inside, Jesse! Make \'em pay for every car!"',
      abilities: ['jesse_trick_shot', 'frank_grapple', 'frank_dynamite', 'cover_fire', 'hostage_threat'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.2,
          description: '+20% damage (close quarters)'
        }
      ],
      transitionNarrative:
        'The brothers dive through a window, disappearing into the passenger car.'
    },
    {
      phaseNumber: 3,
      healthThreshold: 30,
      name: 'Final Stand',
      description: 'Engine car - the train is about to crash!',
      dialogue: 'Jesse: "If we\'re going down, we\'re going down fighting!" Frank: "For the family we never had!"',
      abilities: [
        'jesse_rapid_fire',
        'frank_last_charge',
        'train_brake_sabotage',
        'brothers_sacrifice'
      ],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage (nothing to lose)'
        },
        {
          type: 'speed',
          multiplier: 1.3,
          description: '+30% attack speed'
        }
      ],
      environmentalHazard: {
        name: 'Runaway Train',
        description: 'The train is accelerating toward a cliff!',
        damagePerTurn: 20,
        avoidable: false
      }
    }
  ],

  abilities: [
    {
      id: 'jesse_trick_shot',
      name: 'Jesse\'s Trick Shot',
      description: 'Jesse ricochets a bullet to hit from unexpected angles',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 60,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Watch for the bullet trajectory and move',
      priority: 7,
      targetType: 'single'
    },
    {
      id: 'frank_dynamite',
      name: 'Frank\'s Dynamite',
      description: 'Frank throws dynamite - explosive chaos',
      type: BossAbilityType.AOE,
      cooldown: 4,
      damage: 80,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Jump off the train car before explosion',
      telegraphMessage: 'Frank lights a stick of dynamite with a grin!',
      priority: 8,
      targetType: 'all'
    },
    {
      id: 'twin_coordination',
      name: 'Twin Coordination',
      description: 'The brothers attack in perfect unison',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 100,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Focus on one twin to break their coordination',
      telegraphMessage: 'The twins exchange a knowing glance...',
      priority: 9,
      targetType: 'single'
    },
    {
      id: 'smoke_bomb',
      name: 'Smoke Bomb',
      description: 'Frank drops a smoke bomb for cover',
      type: BossAbilityType.BUFF,
      cooldown: 5,
      effect: {
        type: StatusEffect.BLIND, // Smoke blinds attackers
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: false,
      priority: 5,
      targetType: 'all' // Affects everyone in the area
    },
    {
      id: 'frank_grapple',
      name: 'Frank\'s Grapple',
      description: 'Frank grabs you for a close-quarters brawl',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 55,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.STUN,
        duration: 1,
        power: 1,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Break the grapple with Strength check',
      priority: 7,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'cover_fire',
      name: 'Cover Fire',
      description: 'Jesse provides suppressing fire while Frank moves',
      type: BossAbilityType.DEBUFF,
      cooldown: 4,
      damage: 30,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.SLOW,
        duration: 2,
        power: 30,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Find hard cover',
      priority: 6,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'hostage_threat',
      name: 'Hostage Threat',
      description: 'Frank grabs a civilian hostage',
      type: BossAbilityType.DEBUFF, // Mechanically a debuff that forces player to act
      cooldown: 0, // One-time
      avoidable: true,
      avoidMechanic: 'Persuasion check or precision shot to disarm',
      telegraphMessage: 'Frank grabs a terrified passenger! "Drop your guns or they get it!"',
      priority: 10,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'jesse_rapid_fire',
      name: 'Jesse\'s Rapid Fire',
      description: 'Jesse fans the hammer for a devastating barrage',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Weave between the shots',
      priority: 8,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'frank_last_charge',
      name: 'Frank\'s Last Charge',
      description: 'Frank charges with a knife - all or nothing',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 90,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.BLEED,
        duration: 3,
        power: 15,
        stackable: true,
        maxStacks: 3,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Sidestep and counter',
      priority: 9,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'train_brake_sabotage',
      name: 'Train Brake Sabotage',
      description: 'The brothers destroy the train brakes',
      type: BossAbilityType.ENVIRONMENTAL, // Environmental hazard
      cooldown: 0,
      avoidable: false,
      telegraphMessage: 'Frank shoots the brake line! "If we can\'t have it, nobody can!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'brothers_sacrifice',
      name: 'Brothers\' Sacrifice',
      description: 'One brother shields the other - ultimate defense',
      type: BossAbilityType.BUFF,
      cooldown: 0, // One-time
      avoidable: false,
      telegraphMessage: 'Jesse steps in front of Frank: "NOT MY BROTHER!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single'
    }
  ],

  weaknesses: [
    {
      damageType: BossDamageType.PSYCHIC,
      multiplier: 1.4,
      description: 'Breaking their bond weakens them both'
    }
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'focus_fire',
      name: 'Focus Fire',
      description: 'Focusing damage on one twin disrupts their coordination',
      type: 'unique',
      instructions: 'Deal 25% of total HP to one twin without damaging the other',
      successReward: 'Twin Coordination ability disabled, -20% boss damage',
      failureConsequence: 'They heal each other when you split focus'
    },
    {
      id: 'save_hostage',
      name: 'Hostage Rescue',
      description: 'Save the hostage Frank grabs in Phase 2',
      type: 'coordination',
      instructions: 'Precision shot or Persuasion to free the hostage',
      successReward: 'Hostage provides healing item, +reputation',
      failureConsequence: 'Hostage injured, -reputation'
    },
    {
      id: 'stop_train',
      name: 'Stop the Train',
      description: 'In Phase 3, you must stop the runaway train',
      type: 'puzzle',
      instructions: 'Reach the engine and manually brake before the cliff',
      successReward: 'Train stops, full loot',
      failureConsequence: 'Train crashes, reduced loot, potential death'
    },
    {
      id: 'spare_twins',
      name: 'Spare the McCrays',
      description: 'Let the brothers live - they may be useful allies',
      type: 'unique', // Moral choice mechanic
      instructions: 'Choose to capture rather than kill at 5% HP',
      successReward: 'McCrays become contacts, appear as allies in later content',
      failureConsequence: 'Standard ending, +50% bounty reward'
    }
  ],

  environmentEffects: [
    {
      id: 'train_sway',
      name: 'Train Sway',
      description: 'The moving train throws off your aim',
      triggersAt: 'periodic',
      interval: 3,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 10
      },
      duration: 1,
      counterplay: 'Time your shots with the train rhythm'
    },
    {
      id: 'tunnel_darkness',
      name: 'Tunnel Passage',
      description: 'The train enters a tunnel - reduced visibility',
      triggersAt: 'phase_change',
      threshold: 50,
      effect: {
        type: 'debuff',
        target: 'both',
        power: 20
      },
      counterplay: 'Use the darkness to your advantage'
    }
  ],

  playerLimit: {
    min: 1,
    max: 4,
    recommended: 2
  },

  scaling: {
    healthPerPlayer: 45,
    damagePerPlayer: 15,
    unlockMechanics: [
      {
        playerCount: 2,
        mechanics: ['focus_fire']
      }
    ]
  },

  guaranteedDrops: [
    {
      itemId: 'mccray-trick-revolver',
      name: 'McCray Trick Revolver',
      rarity: 'epic',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'dynamite-bandolier',
      name: 'Dynamite Bandolier',
      description: 'Frank\'s explosives kit',
      rarity: 'rare',
      dropChance: 0.40,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'legendary-duster-coat',
      name: 'Legendary Duster Coat',
      description: 'The McCrays\' trademark long coat',
      rarity: 'epic',
      dropChance: 0.25,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'train-heist-loot',
      name: 'Train Heist Loot',
      description: 'Gold and valuables from the baggage car',
      rarity: 'uncommon',
      dropChance: 1.0,
      minQuantity: 200,
      maxQuantity: 800
    },
    {
      itemId: 'mccray-wanted-poster',
      name: 'McCray Wanted Poster',
      description: 'Proof of capture - worth the bounty',
      rarity: 'rare',
      dropChance: 0.8,
      minQuantity: 1,
      maxQuantity: 1
    }
  ],

  goldReward: {
    min: 1200,
    max: 2500
  },
  experienceReward: 3500,

  achievements: ['train_stopper', 'legend_ender', 'robin_hood_caught', 'twin_slayer'],
  titles: ['Train Stopper', 'Legend Hunter', 'The One Who Stopped the McCrays'],
  firstKillBonus: {
    title: 'End of an Era',
    item: 'mccray-brothers-photo',
    gold: 800
  },

  difficulty: 7,
  enrageTimer: 12,
  canFlee: false,
  fleeConsequence: 'On a moving train? There\'s nowhere to run.'
};

// =============================================================================
// "THE HAMMER" HEINRICH VOLKOV (L22) - The Mining Enforcer
// Tragic brute with redemption path
// =============================================================================

export const HAMMER_VOLKOV: BossEncounter = {
  id: 'boss_hammer_volkov',
  name: '"The Hammer" Heinrich Volkov',
  title: 'The Mining Enforcer',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.EPIC,
  level: 22,

  description:
    'A Russian immigrant turned strike-breaker. He hates what he\'s become, but sees no way out.',
  backstory:
    'Heinrich Volkov came to America chasing the same dream as millions of others - a better life. ' +
    'What he found was exploitation in the silver mines of Colorado. When his wife died of lung ' +
    'disease and his son starved, something broke in Heinrich. The Railroad offered him work: ' +
    'breaking the spirits of miners who dared to organize. Now he IS the exploitation. He knows ' +
    'he\'s become a monster. Every night he prays for death. Every morning he picks up his hammer.',
  defeatDialogue:
    '"Finally... finally it ends. Tell them... tell the miners... I am sorry. I was too weak to stop..."',
  victoryNarrative:
    'The Hammer falls, his massive frame crashing to the mine floor. In his pocket, ' +
    'a photograph of a woman and child - the family he lost, the humanity he sold.',

  location: 'Silverado Mine Complex',
  alternateLocations: ['Deep Mine Shaft', 'Mining Camp'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 20,
      description: 'Must be level 20 or higher'
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'nahi:the-last-buffalo',
      description: 'Must have completed the Nahi coalition arc'
    }
  ],
  respawnCooldown: 36,

  health: 5000,
  damage: 110,
  defense: 70,
  criticalChance: 0.15,
  evasion: 0.08,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Enforcer',
      description: 'Volkov attacks with brutal efficiency.',
      dialogue: '"You should not have come here. Now I must break you, like I break everything."',
      abilities: ['sledgehammer_smash', 'mine_cart_throw', 'summon_strikebreakers'],
      modifiers: []
    },
    {
      phaseNumber: 2,
      healthThreshold: 50,
      name: 'Tunnel Collapse',
      description: 'Volkov starts collapsing the mine around you.',
      dialogue: '"If I cannot defeat you, the mountain will. We will ALL be buried here!"',
      abilities: ['sledgehammer_smash', 'structural_destruction', 'desperate_charge', 'dust_cloud'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.4,
          description: '+40% damage (desperate)'
        }
      ],
      transitionNarrative:
        'Volkov roars and slams his hammer into a support beam. The mine begins to shake...',
      environmentalHazard: {
        name: 'Collapsing Tunnels',
        description: 'Rocks fall from above!',
        damagePerTurn: 15,
        avoidable: true
      }
    },
    {
      phaseNumber: 3,
      healthThreshold: 20,
      name: 'Buried Alive',
      description: 'Volkov speaks during combat - there may be another way.',
      dialogue: '"Why... why do you fight so hard? What do you believe in? I... I have forgotten..."',
      abilities: ['final_swing', 'confession', 'sacrifice_play'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.6,
          description: '+60% damage (nothing left)'
        },
        {
          type: 'defense',
          multiplier: 0.5,
          description: '-50% defense (resigned to fate)'
        }
      ]
    }
  ],

  abilities: [
    {
      id: 'sledgehammer_smash',
      name: 'Sledgehammer Smash',
      description: 'Volkov brings down his massive hammer',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 100,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.STUN,
        duration: 1,
        power: 1,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Dodge roll - the hammer is slow but deadly',
      telegraphMessage: 'Volkov raises his hammer high above his head!',
      priority: 8,
      targetType: 'single'
    },
    {
      id: 'mine_cart_throw',
      name: 'Mine Cart Throw',
      description: 'Volkov hurls an entire mine cart at you',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 80,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Jump on the rails - the cart follows them',
      telegraphMessage: 'Volkov grabs a loaded mine cart with both hands!',
      priority: 7,
      targetType: 'all'
    },
    {
      id: 'summon_strikebreakers',
      name: 'Summon Strikebreakers',
      description: 'Volkov calls his crew of enforcers',
      type: BossAbilityType.SUMMON,
      cooldown: 6,
      avoidable: false,
      telegraphMessage: 'Volkov whistles - heavy footsteps approach from the tunnels!',
      priority: 5,
      targetType: 'all'
    },
    {
      id: 'structural_destruction',
      name: 'Structural Destruction',
      description: 'Volkov destroys mine supports',
      type: BossAbilityType.AOE,
      cooldown: 4,
      damage: 70,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Read the cracks - move to stable ground',
      telegraphMessage: 'Volkov targets a support beam with his hammer!',
      priority: 8,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'desperate_charge',
      name: 'Desperate Charge',
      description: 'Volkov charges like a locomotive',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Sidestep - his momentum carries him past',
      telegraphMessage: 'Volkov lowers his head and charges!',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'dust_cloud',
      name: 'Dust Cloud',
      description: 'Volkov creates a blinding cloud of mine dust',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.BLIND,
        duration: 3,
        power: 1,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Hold your breath and cover your eyes',
      priority: 6,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'final_swing',
      name: 'Final Swing',
      description: 'One last devastating blow',
      type: BossAbilityType.ULTIMATE,
      cooldown: 4,
      damage: 180,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Time the dodge perfectly',
      telegraphMessage: '"This... ends... NOW!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'confession',
      name: 'Confession',
      description: 'Volkov can be talked down with high Persuasion',
      type: BossAbilityType.DEBUFF, // Mechanically a debuff on the boss
      cooldown: 0,
      avoidable: true,
      avoidMechanic: 'Persuasion skill check to make him stand down',
      telegraphMessage: '"Tell me... is there redemption for a man like me?"',
      priority: 1,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'sacrifice_play',
      name: 'Sacrifice Play',
      description: 'Volkov offers to bring down the mine on himself',
      type: BossAbilityType.ENVIRONMENTAL, // Creates environmental hazard
      cooldown: 0,
      avoidable: false,
      telegraphMessage: '"Let me do one good thing. Let me end this."',
      priority: 2,
      requiresPhase: 3,
      targetType: 'single'
    }
  ],

  weaknesses: [
    {
      damageType: BossDamageType.FIRE,
      multiplier: 1.3,
      description: 'Fear of mine fires makes him flinch'
    }
  ],
  immunities: [BossDamageType.PHYSICAL],

  specialMechanics: [
    {
      id: 'redemption_path',
      name: 'Redemption',
      description: 'Volkov can be convinced to surrender',
      type: 'unique', // Moral choice mechanic
      instructions: 'In Phase 3, use Persuasion during his Confession ability',
      successReward: 'Volkov becomes an informant, provides Railroad intel',
      failureConsequence: 'Standard kill, no ally gained'
    },
    {
      id: 'save_miners',
      name: 'Save the Miners',
      description: 'Trapped miners are in the collapse zone',
      type: 'coordination',
      instructions: 'Rescue 3 miners before the tunnels fully collapse',
      successReward: 'Miners provide bonus loot and reputation',
      failureConsequence: 'Miners die, -reputation'
    },
    {
      id: 'collapse_timer',
      name: 'Beat the Collapse',
      description: 'The mine is collapsing - finish the fight fast',
      type: 'unique',
      instructions: 'Win before the 10-minute timer expires',
      successReward: 'Normal completion',
      failureConsequence: 'Buried alive - encounter fails'
    }
  ],

  environmentEffects: [
    {
      id: 'falling_rocks',
      name: 'Falling Rocks',
      description: 'The ceiling is unstable',
      triggersAt: 'periodic',
      interval: 4,
      effect: {
        type: 'damage',
        target: 'both',
        power: 25
      },
      duration: 1,
      counterplay: 'Watch the ceiling and move when you see dust fall'
    },
    {
      id: 'mine_gas',
      name: 'Mine Gas',
      description: 'Pockets of dangerous gas',
      triggersAt: 'phase_change',
      threshold: 50,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 15
      },
      duration: 3,
      counterplay: 'Stay low - gas rises'
    }
  ],

  playerLimit: {
    min: 1,
    max: 4,
    recommended: 3
  },

  scaling: {
    healthPerPlayer: 50,
    damagePerPlayer: 18
  },

  guaranteedDrops: [
    {
      itemId: 'volkovs-hammer',
      name: 'Volkov\'s Hammer',
      rarity: 'epic',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'mining-foreman-coat',
      name: 'Mining Foreman Coat',
      description: 'Heavy leather coat reinforced for mine work',
      rarity: 'rare',
      dropChance: 0.40,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'russian-cross-pendant',
      name: 'Russian Cross Pendant',
      description: 'His wife\'s cross - the only memento of his past',
      rarity: 'rare',
      dropChance: 0.30,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'silver-ore-pile',
      name: 'Silver Ore',
      description: 'High-grade silver from the mine',
      rarity: 'uncommon',
      dropChance: 1.0,
      minQuantity: 50,
      maxQuantity: 200
    },
    {
      itemId: 'strikebreaker-contracts',
      name: 'Strikebreaker Contracts',
      description: 'Evidence of Railroad labor violations',
      rarity: 'rare',
      dropChance: 0.6,
      minQuantity: 1,
      maxQuantity: 1
    }
  ],

  goldReward: {
    min: 1500,
    max: 3000
  },
  experienceReward: 4000,

  achievements: ['union_avenger', 'redemption_given', 'mine_survivor', 'hammer_taker'],
  titles: ['The Hammer Breaker', 'Mine Savior', 'Union\'s Friend'],
  firstKillBonus: {
    title: 'Justice for the Miners',
    item: 'miner-solidarity-badge',
    gold: 700
  },

  difficulty: 7,
  enrageTimer: 10,
  canFlee: false,
  fleeConsequence: 'The tunnels are collapsing - there\'s no escape'
};

// =============================================================================
// COLONEL AUGUSTUS BLACKWOOD (L25) - The Railroad Champion
// Pack boss with adaptive difficulty based on player choices
// =============================================================================

export const COLONEL_BLACKWOOD: BossEncounter = {
  id: 'boss_colonel_blackwood',
  name: 'Colonel Augustus Blackwood',
  title: 'The Railroad Champion',
  category: BossCategory.FACTION_LEADER,
  tier: BossTier.LEGENDARY,
  level: 25,

  description:
    'Civil War hero turned Railroad Tycoons\' military commander. He believes in Manifest Destiny with religious fervor.',
  backstory:
    'Colonel Augustus Blackwood was a Union hero - his cavalry charge at Gettysburg saved an entire ' +
    'division. When the war ended, he couldn\'t stop. The frontier needed "civilizing," and the ' +
    'Railroad offered him the chance to continue his crusade. He doesn\'t see natives, settlers, ' +
    'or outlaws - he sees obstacles to Progress. He\'s not evil in the traditional sense. He\'s ' +
    'worse: he\'s righteous. Every atrocity is justified by the greater good. Every death is ' +
    '"necessary for the future." His armored command train, The Manifest, is his mobile fortress.',
  defeatDialogue:
    '"Manifest... Destiny... cannot... be... stopped..." *looks at the frontier* "What have I... what have I done?"',
  victoryNarrative:
    'Colonel Blackwood falls, his dreams of empire crumbling with him. The Manifest sits ' +
    'silent on the tracks, its reign of terror ended. The frontier will heal - but the ' +
    'scars of his crusade will remain for generations.',

  location: 'The Manifest (Armored Command Train)',
  alternateLocations: ['Railroad Headquarters', 'Final Junction'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 23,
      description: 'Must be level 23 or higher'
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'justice:the-iron-horse-gambit',
      description: 'Must have completed the pack climax quest'
    }
  ],
  respawnCooldown: 72,

  // High stats - this is the pack boss
  health: 8000,
  damage: 130,
  defense: 80,
  criticalChance: 0.20,
  evasion: 0.12,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Command Car',
      description: 'Blackwood commands from the rear, protected by his elite troops.',
      dialogue: '"Another rebel. Another obstacle. You will be removed."',
      abilities: ['tactical_command', 'artillery_strike', 'call_reinforcements'],
      modifiers: [],
      summonMinions: {
        type: 'railroad_elite',
        count: 4,
        spawnMessage: 'Blackwood\'s elite guard takes defensive positions!'
      }
    },
    {
      phaseNumber: 2,
      healthThreshold: 70,
      name: 'Personal Combat',
      description: 'Blackwood joins the fight personally.',
      dialogue: '"If you want something done right... You\'ve earned my personal attention."',
      abilities: ['officers_saber', 'cavalry_charge', 'inspiring_presence', 'tactical_retreat_buff'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage (elite soldier)'
        },
        {
          type: 'defense',
          multiplier: 1.2,
          description: '+20% defense (battle-hardened)'
        }
      ],
      transitionNarrative:
        'Blackwood draws his saber, the blade gleaming. "At Gettysburg, I killed fifty men with this sword."'
    },
    {
      phaseNumber: 3,
      healthThreshold: 40,
      name: 'The Manifest Destiny',
      description: 'Blackwood offers an honorable duel.',
      dialogue: '"You fight with honor. Let us end this as soldiers - one on one."',
      abilities: ['officers_saber', 'honorable_duel', 'last_stand_order', 'scorched_earth'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage'
        }
      ]
    },
    {
      phaseNumber: 4,
      healthThreshold: 15,
      name: 'Desperate Measures',
      description: 'Blackwood will destroy the train to kill you.',
      dialogue: '"If I cannot have this land... NEITHER CAN YOU!"',
      abilities: ['train_destruction', 'final_charge', 'martyrdom'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 2.0,
          description: '+100% damage (suicidal)'
        },
        {
          type: 'defense',
          multiplier: 0.5,
          description: '-50% defense (reckless)'
        }
      ],
      environmentalHazard: {
        name: 'Self-Destruct',
        description: 'The Manifest is set to explode!',
        damagePerTurn: 30,
        avoidable: false
      }
    }
  ],

  abilities: [
    {
      id: 'tactical_command',
      name: 'Tactical Command',
      description: 'Blackwood coordinates his troops with devastating efficiency',
      type: BossAbilityType.BUFF,
      cooldown: 4,
      effect: {
        type: StatusEffect.FEAR, // Troops become terrifying to face
        duration: 3,
        power: 25,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: false,
      telegraphMessage: 'Blackwood raises his hand - his troops snap to attention!',
      priority: 6,
      targetType: 'all'
    },
    {
      id: 'artillery_strike',
      name: 'Artillery Strike',
      description: 'The train\'s mounted guns open fire',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 100,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Get inside the train cars for cover',
      telegraphMessage: 'The train\'s artillery turrets rotate toward you!',
      priority: 8,
      targetType: 'all'
    },
    {
      id: 'call_reinforcements',
      name: 'Call Reinforcements',
      description: 'More Railroad soldiers arrive',
      type: BossAbilityType.SUMMON,
      cooldown: 6,
      avoidable: false,
      telegraphMessage: '"All hands to the command car! Hostiles aboard!"',
      priority: 5,
      targetType: 'all'
    },
    {
      id: 'officers_saber',
      name: 'Officer\'s Saber',
      description: 'Blackwood attacks with his legendary blade',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 90,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.BLEED,
        duration: 3,
        power: 12,
        stackable: true,
        maxStacks: 3,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Parry or dodge the slash',
      priority: 7,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'cavalry_charge',
      name: 'Cavalry Charge',
      description: 'Blackwood charges with the fury of Gettysburg',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 130,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Sidestep at the last moment',
      telegraphMessage: 'Blackwood lowers his saber and charges! "FOR THE UNION!"',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'inspiring_presence',
      name: 'Inspiring Presence',
      description: 'Blackwood\'s mere presence bolsters his troops',
      type: BossAbilityType.BUFF,
      cooldown: 5,
      avoidable: false,
      priority: 4,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'tactical_retreat_buff',
      name: 'Tactical Retreat',
      description: 'Blackwood falls back to heal and regroup',
      type: BossAbilityType.HEAL,
      cooldown: 8,
      avoidable: false,
      telegraphMessage: 'Blackwood retreats behind his guards!',
      priority: 3,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'honorable_duel',
      name: 'Honorable Duel',
      description: 'Blackwood offers one-on-one combat',
      type: BossAbilityType.DEBUFF, // Forces a choice/debuffs party
      cooldown: 0,
      avoidable: true,
      avoidMechanic: 'Accept or refuse the duel',
      telegraphMessage: '"Face me alone, and I\'ll let your allies live. Soldier\'s honor."',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'last_stand_order',
      name: 'Last Stand Order',
      description: 'All remaining troops attack in a coordinated assault',
      type: BossAbilityType.ULTIMATE,
      cooldown: 0,
      damage: 150,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Use cover and eliminate threats one by one',
      telegraphMessage: '"All units, final assault! Leave no one standing!"',
      priority: 9,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'scorched_earth',
      name: 'Scorched Earth',
      description: 'Blackwood orders the burning of supplies',
      type: BossAbilityType.AOE,
      cooldown: 0,
      damage: 80,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Move away from supply crates',
      telegraphMessage: '"If I can\'t have these supplies, no one will!" Torches are lit!',
      priority: 7,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'train_destruction',
      name: 'Train Destruction',
      description: 'Blackwood sets The Manifest to explode',
      type: BossAbilityType.ENVIRONMENTAL, // Environmental hazard
      cooldown: 0,
      avoidable: false,
      telegraphMessage: 'Blackwood pulls a detonator from his coat. "This is the end for both of us!"',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all'
    },
    {
      id: 'final_charge',
      name: 'Final Charge',
      description: 'Blackwood\'s last attack - all or nothing',
      type: BossAbilityType.ULTIMATE,
      cooldown: 0,
      damage: 200,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Counter at the perfect moment',
      telegraphMessage: '"CHARGE!" Blackwood runs at you with his saber raised!',
      priority: 10,
      requiresPhase: 4,
      targetType: 'single'
    },
    {
      id: 'martyrdom',
      name: 'Martyrdom',
      description: 'Blackwood attempts to take you with him',
      type: BossAbilityType.ULTIMATE,
      cooldown: 0,
      damage: 300,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Reach the escape hatch before detonation',
      telegraphMessage: '"History will remember me as a MARTYR!"',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all'
    }
  ],

  weaknesses: [
    {
      damageType: BossDamageType.PSYCHIC,
      multiplier: 1.25,
      description: 'His rigid beliefs can be shaken'
    }
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'adaptive_difficulty',
      name: 'Adaptive Difficulty',
      description: 'Difficulty based on player choices throughout the pack',
      type: 'unique',
      instructions: 'Your faction choices affect this battle',
      successReward: 'United factions = fewer troops, more allies',
      failureConsequence: 'Fractured factions = more troops, fighting alone'
    },
    {
      id: 'duel_choice',
      name: 'Accept the Duel',
      description: 'Honorable one-on-one combat with Blackwood',
      type: 'unique', // Moral choice mechanic
      instructions: 'Accept in Phase 3 for a harder but more rewarding fight',
      successReward: 'Win duel = his troops stand down, bonus rewards',
      failureConsequence: 'Lose duel = instant death, must retry'
    },
    {
      id: 'escape_manifest',
      name: 'Escape the Manifest',
      description: 'In Phase 4, escape before the train explodes',
      type: 'puzzle',
      instructions: 'Find the escape route while fighting Blackwood',
      successReward: 'Survive with full loot',
      failureConsequence: 'Die in explosion'
    },
    {
      id: 'negotiation_path',
      name: 'Negotiate with Blackwood',
      description: 'Very high Persuasion can make Blackwood defect',
      type: 'unique', // Moral choice mechanic
      instructions: 'Exceptional dialogue choices + Persuasion 40+',
      successReward: 'Blackwood becomes a secret ally in future content',
      failureConsequence: 'Standard kill'
    }
  ],

  environmentEffects: [
    {
      id: 'moving_train',
      name: 'Moving Train',
      description: 'The train is moving at full speed',
      triggersAt: 'periodic',
      interval: 3,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 8
      },
      duration: 1,
      counterplay: 'Time your attacks with the train rhythm'
    },
    {
      id: 'armored_plating',
      name: 'Armored Plating',
      description: 'The train\'s armor provides cover for enemies',
      triggersAt: 'phase_change',
      threshold: 70,
      effect: {
        type: 'buff',
        target: 'boss',
        power: 20
      },
      counterplay: 'Flank to avoid the armored sections'
    }
  ],

  playerLimit: {
    min: 1,
    max: 5,
    recommended: 4
  },

  scaling: {
    healthPerPlayer: 60,
    damagePerPlayer: 20,
    unlockMechanics: [
      {
        playerCount: 4,
        mechanics: ['escape_manifest', 'negotiation_path']
      }
    ]
  },

  guaranteedDrops: [
    {
      itemId: 'blackwoods-saber',
      name: 'Blackwood\'s Saber',
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'union-officers-coat',
      name: 'Union Officer\'s Coat',
      description: 'Blackwood\'s decorated uniform coat',
      rarity: 'epic',
      dropChance: 0.40,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'command-train-deed',
      name: 'Command Train Deed',
      description: 'Ownership papers for The Manifest',
      rarity: 'legendary',
      dropChance: 0.25,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'railroad-shares',
      name: 'Railroad Shares',
      description: 'Stock in the Railroad company - passive income',
      rarity: 'epic',
      dropChance: 0.50,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'manifest-treasury',
      name: 'Manifest Treasury',
      description: 'Gold from the command train\'s vault',
      rarity: 'rare',
      dropChance: 1.0,
      minQuantity: 500,
      maxQuantity: 2000
    },
    {
      itemId: 'war-medals',
      name: 'War Medals',
      description: 'Blackwood\'s collection of Civil War decorations',
      rarity: 'rare',
      dropChance: 0.60,
      minQuantity: 1,
      maxQuantity: 5
    }
  ],

  goldReward: {
    min: 3000,
    max: 6000
  },
  experienceReward: 6000,

  achievements: [
    'railroad_champion_slain',
    'manifest_destroyed',
    'duel_victor',
    'war_ender',
    'blackwood_negotiator'
  ],
  titles: [
    'Champion Slayer',
    'End of the Line',
    'Duel Victor',
    'The One Who Stopped Manifest Destiny'
  ],
  firstKillBonus: {
    title: 'Liberator of the Frontier',
    item: 'manifest-destiny-trophy',
    gold: 2000
  },

  difficulty: 9,
  enrageTimer: 15,
  canFlee: false,
  fleeConsequence: 'Blackwood locks down the train - there is no escape'
};

// =============================================================================
// EXPORTS
// =============================================================================

export const FRONTIER_JUSTICE_BOSSES: BossEncounter[] = [
  SHERIFF_BARNES,
  MCCRAY_TWINS,
  HAMMER_VOLKOV,
  COLONEL_BLACKWOOD
];

/**
 * Get frontier justice boss by ID
 */
export function getFrontierBossById(bossId: string): BossEncounter | undefined {
  return FRONTIER_JUSTICE_BOSSES.find(b => b.id === bossId);
}

/**
 * Get frontier justice bosses by level range
 */
export function getFrontierBossesByLevel(
  minLevel: number,
  maxLevel: number
): BossEncounter[] {
  return FRONTIER_JUSTICE_BOSSES.filter(
    b => b.level >= minLevel && b.level <= maxLevel
  );
}

/**
 * Get bosses that can be spared (have redemption paths)
 */
export function getBossesWithRedemptionPath(): BossEncounter[] {
  return FRONTIER_JUSTICE_BOSSES.filter(b =>
    b.specialMechanics?.some(m => m.id === 'redemption_path' || m.id === 'spare_twins')
  );
}

/**
 * Get boss by moral alignment requirement
 */
export function getBossesForMoralAlignment(
  alignment: 'marshal' | 'outlaw' | 'neutral'
): BossEncounter[] {
  // All frontier bosses are available to all alignments
  // but have different rewards based on alignment
  return FRONTIER_JUSTICE_BOSSES;
}
