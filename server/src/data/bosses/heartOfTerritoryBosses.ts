/**
 * Heart of the Territory Bosses - Phase 19.4
 * Four bosses for L26-35 content pack representing the Silverado Strike
 *
 * 1. The Claim Jumper Gang (L28) - Dutch McCready's gang fight
 * 2. Cornelius Whitmore (L30) - The Silver Baron (robber baron)
 * 3. War Chief Iron Wolf (L32) - Apache War Band leader
 * 4. The Claim King (L35) - Territory domination pack boss
 *
 * Design Philosophy:
 * - L28: Multi-target gang fight with rescue mechanics
 * - L30: Gilded Age industrial villain with environmental hazards
 * - L32: Honorable warrior with duel/negotiation paths
 * - L35: Dynamic boss identity based on player choices
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
// THE CLAIM JUMPER GANG (L28) - Dutch McCready's Outlaws
// Multi-target gang fight in abandoned mine
// =============================================================================

export const CLAIM_JUMPER_GANG: BossEncounter = {
  id: 'boss_claim_jumper_gang',
  name: 'The Claim Jumper Gang',
  title: 'Dutch McCready\'s Outlaws',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.RARE,
  level: 28,

  description:
    'A gang of claim jumpers terrorizing the Silverado Valley. Led by "Dutch" McCready, a smooth-talking killer.',
  backstory:
    'The Silverado Strike brought fortune-seekers from across the frontier. It also brought Dutch McCready ' +
    'and his gang of claim jumpers. They don\'t bother with the hard work of mining - they wait for others ' +
    'to strike silver, then take it. McCready ran three crews out of business in the first month. ' +
    'Now he\'s got a network of informants, a fortified hideout in an abandoned mine, and a reputation ' +
    'that makes prospectors abandon their claims at the mere rumor of his approach.',
  defeatDialogue:
    '"Well, I\'ll be damned... You actually did it. Guess there\'s always someone faster, right?"',
  victoryNarrative:
    'Dutch McCready goes down swinging, his gang scattered and broken. The abandoned mine ' +
    'falls silent save for the groans of wounded outlaws. The prospectors of Silverado can breathe easier tonight.',

  location: 'Abandoned Mine - Jumper Hideout',
  alternateLocations: ['Eastern Claims Tunnels', 'McCready\'s Camp'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 26,
      description: 'Must be level 26 or higher'
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'territory:the-jumper-king',
      description: 'Must have tracked down the Claim Jumpers'
    }
  ],
  respawnCooldown: 24,

  // Combined gang health - split across targets
  health: 6000,
  damage: 95,
  defense: 55,
  criticalChance: 0.20,
  evasion: 0.18,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Ambush',
      description: 'The gang springs their trap from multiple positions.',
      dialogue: 'Dutch: "Welcome to my parlor, friend. Boys, show \'em how we greet visitors!"',
      abilities: ['crossfire_ambush', 'gang_coordination', 'flashbang_toss', 'tunnel_trap'],
      modifiers: [],
      summonMinions: {
        type: 'claim_jumper',
        count: 4,
        spawnMessage: 'Jumpers emerge from the shadows with weapons drawn!'
      }
    },
    {
      phaseNumber: 2,
      healthThreshold: 60,
      name: 'Dutch Takes Command',
      description: 'With his men falling, Dutch joins the fight personally.',
      dialogue: '"Fine, you want something done right... Time to earn my reputation."',
      abilities: ['quickdraw_duel', 'gang_coordination', 'smokescreen', 'hostage_miner'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage (Dutch is dangerous)'
        }
      ],
      transitionNarrative:
        'Dutch steps forward, twin revolvers gleaming. "Alright, now you\'re dealing with me."'
    },
    {
      phaseNumber: 3,
      healthThreshold: 25,
      name: 'Collapse the Mine',
      description: 'Desperate, Dutch tries to bring the mine down on everyone.',
      dialogue: '"If I can\'t have this silver, NOBODY gets it! Light the charges!"',
      abilities: ['quickdraw_duel', 'demolition_charges', 'last_stand_gang', 'escape_attempt'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage (nothing to lose)'
        },
        {
          type: 'defense',
          multiplier: 0.7,
          description: '-30% defense (reckless)'
        }
      ],
      environmentalHazard: {
        name: 'Collapsing Tunnels',
        description: 'The mine is rigged to blow!',
        damagePerTurn: 20,
        avoidable: true
      }
    }
  ],

  abilities: [
    {
      id: 'crossfire_ambush',
      name: 'Crossfire Ambush',
      description: 'Gang members attack from multiple angles',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 75,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Find cover before they open fire',
      telegraphMessage: 'You hear clicks of hammers being cocked from all around!',
      priority: 8,
      targetType: 'all'
    },
    {
      id: 'gang_coordination',
      name: 'Gang Coordination',
      description: 'The jumpers work together to flank you',
      type: BossAbilityType.BUFF,
      cooldown: 4,
      effect: {
        type: StatusEffect.SLOW,
        duration: 2,
        power: 25,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: false,
      telegraphMessage: 'Dutch signals his men with a hand gesture...',
      priority: 6,
      targetType: 'all'
    },
    {
      id: 'flashbang_toss',
      name: 'Flashbang Toss',
      description: 'A makeshift blinding device',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      damageType: BossDamageType.FIRE,
      effect: {
        type: StatusEffect.BLIND,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Close your eyes when you see the fuse lit',
      telegraphMessage: 'A jumper lights something that sizzles and sparks!',
      priority: 7,
      targetType: 'all'
    },
    {
      id: 'tunnel_trap',
      name: 'Tunnel Trap',
      description: 'Pre-placed traps trigger throughout the mine',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 6,
      damage: 50,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Watch for tripwires and disturbed ground',
      priority: 5,
      targetType: 'single'
    },
    {
      id: 'quickdraw_duel',
      name: 'Dutch\'s Quickdraw',
      description: 'Dutch challenges you to a quick-draw',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 90,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Draw faster than Dutch',
      telegraphMessage: 'Dutch\'s hand hovers over his holster, eyes narrowing...',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'smokescreen',
      name: 'Smokescreen',
      description: 'Dutch uses smoke to reposition',
      type: BossAbilityType.BUFF,
      cooldown: 5,
      effect: {
        type: StatusEffect.BLIND,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: false,
      telegraphMessage: 'Dutch drops a smoke bomb and vanishes into the haze!',
      priority: 4,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'hostage_miner',
      name: 'Hostage Miner',
      description: 'Dutch grabs a captured miner as a shield',
      type: BossAbilityType.DEBUFF,
      cooldown: 0,
      avoidable: true,
      avoidMechanic: 'Precision shot or Persuasion to free the hostage',
      telegraphMessage: 'Dutch pulls a terrified miner in front of him! "Drop the guns or he gets it!"',
      priority: 10,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'demolition_charges',
      name: 'Demolition Charges',
      description: 'Dutch detonates pre-placed explosives',
      type: BossAbilityType.AOE,
      cooldown: 4,
      damage: 100,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Run toward the blast - debris falls away from the explosion',
      telegraphMessage: '"Fire in the hole!" Dutch pulls a detonator!',
      priority: 9,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'last_stand_gang',
      name: 'Last Stand',
      description: 'Remaining gang members make a desperate charge',
      type: BossAbilityType.ULTIMATE,
      cooldown: 0,
      damage: 130,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Pick them off as they charge',
      telegraphMessage: '"All or nothing, boys! CHARGE!"',
      priority: 8,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'escape_attempt',
      name: 'Escape Attempt',
      description: 'Dutch tries to flee through a secret tunnel',
      type: BossAbilityType.DEBUFF,
      cooldown: 0,
      avoidable: true,
      avoidMechanic: 'Block the escape route or chase him down',
      telegraphMessage: 'Dutch backs toward a hidden passage! "This ain\'t over!"',
      priority: 3,
      requiresPhase: 3,
      targetType: 'single'
    }
  ],

  weaknesses: [
    {
      damageType: BossDamageType.FIRE,
      multiplier: 1.25,
      description: 'Fire in the mines is every jumper\'s nightmare'
    }
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'rescue_miners',
      name: 'Rescue the Miners',
      description: 'Save captured miners before the collapse',
      type: 'coordination',
      instructions: 'Find and free 3 miners held hostage throughout the mine',
      successReward: 'Miners provide map to hidden silver cache, +reputation',
      failureConsequence: 'Miners perish, -reputation'
    },
    {
      id: 'capture_dutch',
      name: 'Capture Dutch Alive',
      description: 'Take Dutch alive for interrogation',
      type: 'unique',
      instructions: 'Reduce Dutch to 5% HP and use restraints',
      successReward: 'Dutch reveals Silver Baron\'s network, bonus intel',
      failureConsequence: 'Standard kill, no intel'
    },
    {
      id: 'disable_charges',
      name: 'Disable Demolition',
      description: 'Find and disable the explosive charges',
      type: 'puzzle',
      instructions: 'Locate 4 charge locations before Phase 3',
      successReward: 'Collapse hazard disabled, full loot',
      failureConsequence: 'Must escape collapsing mine, reduced loot'
    }
  ],

  environmentEffects: [
    {
      id: 'dark_tunnels',
      name: 'Dark Tunnels',
      description: 'Poor visibility in the abandoned mine',
      triggersAt: 'periodic',
      interval: 4,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 10
      },
      duration: 2,
      counterplay: 'Use torches or light sources'
    },
    {
      id: 'ambush_positions',
      name: 'Hidden Jumpers',
      description: 'Gang members hide throughout the mine',
      triggersAt: 'phase_change',
      threshold: 60,
      effect: {
        type: 'damage',
        target: 'player',
        power: 40
      },
      counterplay: 'Check corners and elevated positions'
    }
  ],

  playerLimit: {
    min: 1,
    max: 4,
    recommended: 2
  },

  scaling: {
    healthPerPlayer: 40,
    damagePerPlayer: 15
  },

  guaranteedDrops: [
    {
      itemId: 'dutchs-dual-pistols',
      name: 'Dutch\'s Dual Pistols',
      rarity: 'epic',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'claim-jumpers-map',
      name: 'Claim Jumpers\' Map',
      description: 'Shows locations of all valuable claims in the valley',
      rarity: 'rare',
      dropChance: 0.50,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'silver-ore-cache',
      name: 'Silver Ore Cache',
      description: 'Stolen silver from dozens of claims',
      rarity: 'uncommon',
      dropChance: 1.0,
      minQuantity: 80,
      maxQuantity: 250
    },
    {
      itemId: 'gang-war-armor',
      name: 'Gang War Armor',
      description: 'Reinforced leather for outlaw warfare',
      rarity: 'rare',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'demolition-kit',
      name: 'Demolition Kit',
      description: 'Dutch\'s collection of explosives and fuses',
      rarity: 'uncommon',
      dropChance: 0.45,
      minQuantity: 1,
      maxQuantity: 1
    }
  ],

  goldReward: {
    min: 1200,
    max: 2200
  },
  experienceReward: 4200,

  achievements: ['jumper_slayer', 'miner_savior', 'dutch_captured', 'demolition_expert'],
  titles: ['Claim Defender', 'Jumper\'s Bane', 'Silverado\'s Guardian'],
  firstKillBonus: {
    title: 'The One Who Stopped the Jumpers',
    item: 'dutchs-lucky-coin',
    gold: 600
  },

  difficulty: 6,
  canFlee: true,
  fleeConsequence: 'Dutch escapes with stolen claims, gang reforms elsewhere'
};

// =============================================================================
// CORNELIUS WHITMORE (L30) - The Silver Baron
// Gilded Age robber baron with industrial hazards
// =============================================================================

export const SILVER_BARON: BossEncounter = {
  id: 'boss_silver_baron',
  name: 'Cornelius Whitmore',
  title: 'The Silver Baron',
  category: BossCategory.FACTION_LEADER,
  tier: BossTier.EPIC,
  level: 30,

  description:
    'A Gilded Age robber baron who bought half of Silverado Valley. The silver flows through his smelters - and so does blood.',
  backstory:
    'Cornelius Whitmore came West with Eastern capital and Eastern ruthlessness. Within six months of the ' +
    'Silverado Strike, he owned the processing facility, the supply stores, and half the town council. ' +
    'Miners who struck rich on their claims found themselves in debt to Whitmore within a year - company ' +
    'store prices, processing fees, "protection" costs. Those who complained had accidents. Those who ' +
    'organized disappeared. Whitmore doesn\'t carry a gun - he doesn\'t need to. He owns everyone who does.',
  defeatDialogue:
    '"You think this changes anything? I have lawyers, accountants, politicians... You\'ve merely postponed the inevitable."',
  victoryNarrative:
    'Cornelius Whitmore goes down in his own processing facility, surrounded by the silver that ' +
    'bought his empire. The contracts in his safe will free dozens of indentured miners. ' +
    'His fall echoes across the territory - even tycoons can bleed.',

  location: 'Whitmore Mansion / Silver Processing Facility',
  alternateLocations: ['Silverado Processing Facility', 'Baron\'s Private Rail Car'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 28,
      description: 'Must be level 28 or higher'
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'territory:silver-barons-empire',
      description: 'Must have exposed the Baron\'s corruption'
    }
  ],
  respawnCooldown: 48,

  health: 8500,
  damage: 105,
  defense: 65,
  criticalChance: 0.18,
  evasion: 0.10,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Negotiation',
      description: 'Whitmore tries to buy you off while his guards attack.',
      dialogue: '"Everyone has a price. Let\'s discuss yours while my men handle this... unpleasantness."',
      abilities: ['bribe_attempt', 'call_pinkertons', 'contract_threat', 'vault_trap'],
      modifiers: [],
      summonMinions: {
        type: 'pinkerton_agent',
        count: 3,
        spawnMessage: 'Pinkerton agents burst from the shadows!'
      }
    },
    {
      phaseNumber: 2,
      healthThreshold: 65,
      name: 'Gloves Come Off',
      description: 'Whitmore reveals his hidden fighting skills.',
      dialogue: '"I didn\'t build an empire by being soft. You want to see what I really am?"',
      abilities: ['cane_sword_strike', 'derringer_surprise', 'industrial_sabotage', 'financial_ruin'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.4,
          description: '+40% damage (surprisingly lethal)'
        }
      ],
      transitionNarrative:
        'Whitmore pulls a sword from his cane, his eyes going cold. "I killed my first man at fifteen. A business rival. Father was so proud."'
    },
    {
      phaseNumber: 3,
      healthThreshold: 35,
      name: 'Processing Plant',
      description: 'The fight moves to the smelter - industrial hazards everywhere.',
      dialogue: '"Let\'s take this somewhere more... appropriate. I built this place. I\'ll DESTROY you in it."',
      abilities: ['cane_sword_strike', 'molten_silver_pour', 'steam_vent_blast', 'machinery_crush'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage'
        }
      ],
      environmentalHazard: {
        name: 'Active Smelter',
        description: 'Molten silver and industrial machinery threaten all!',
        damagePerTurn: 15,
        avoidable: true
      }
    },
    {
      phaseNumber: 4,
      healthThreshold: 15,
      name: 'The Fall',
      description: 'Whitmore makes his desperate last stand.',
      dialogue: '"I will NOT be brought down by some... some NOBODY! I AM THE SILVER BARON!"',
      abilities: ['final_gambit', 'burn_contracts', 'golden_cage'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.8,
          description: '+80% damage (desperate rage)'
        },
        {
          type: 'defense',
          multiplier: 0.5,
          description: '-50% defense (lost composure)'
        }
      ]
    }
  ],

  abilities: [
    {
      id: 'bribe_attempt',
      name: 'Bribe Attempt',
      description: 'Whitmore offers you money to walk away',
      type: BossAbilityType.DEBUFF,
      cooldown: 0,
      avoidable: true,
      avoidMechanic: 'Refuse the bribe (Spirit check) or pretend to accept',
      telegraphMessage: '"Ten thousand dollars. Cash. Walk away now and it\'s yours."',
      priority: 5,
      targetType: 'single'
    },
    {
      id: 'call_pinkertons',
      name: 'Call Pinkertons',
      description: 'Whitmore summons his private security',
      type: BossAbilityType.SUMMON,
      cooldown: 6,
      avoidable: false,
      telegraphMessage: 'Whitmore rings a bell on his desk - heavy footsteps approach!',
      priority: 6,
      targetType: 'all'
    },
    {
      id: 'contract_threat',
      name: 'Contract Threat',
      description: 'Whitmore threatens someone you care about',
      type: BossAbilityType.DEBUFF,
      cooldown: 8,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.FEAR,
        duration: 3,
        power: 20,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'High Spirit or call his bluff',
      telegraphMessage: '"I know where your family is. One word from me and..."',
      priority: 7,
      targetType: 'single'
    },
    {
      id: 'vault_trap',
      name: 'Vault Trap',
      description: 'Hidden traps in Whitmore\'s office',
      type: BossAbilityType.DAMAGE,
      cooldown: 5,
      damage: 60,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Watch for pressure plates and tripwires',
      priority: 4,
      targetType: 'single'
    },
    {
      id: 'cane_sword_strike',
      name: 'Cane Sword Strike',
      description: 'Whitmore attacks with his hidden blade',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 85,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.BLEED,
        duration: 3,
        power: 10,
        stackable: true,
        maxStacks: 3,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Parry or dodge the thrust',
      telegraphMessage: 'Whitmore twirls his cane with practiced grace...',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'derringer_surprise',
      name: 'Derringer Surprise',
      description: 'Whitmore fires a hidden derringer',
      type: BossAbilityType.DAMAGE,
      cooldown: 6,
      damage: 100,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Watch his off-hand',
      telegraphMessage: 'Whitmore\'s left hand moves toward his vest pocket...',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'industrial_sabotage',
      name: 'Industrial Sabotage',
      description: 'Whitmore damages equipment to create hazards',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 5,
      damage: 70,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Move away from marked machinery',
      telegraphMessage: 'Whitmore pulls a lever - machinery screams in protest!',
      priority: 6,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'financial_ruin',
      name: 'Financial Ruin',
      description: 'Whitmore threatens to bankrupt the territory',
      type: BossAbilityType.DEBUFF,
      cooldown: 0,
      damageType: BossDamageType.PSYCHIC,
      avoidable: true,
      avoidMechanic: 'Call his bluff or find leverage',
      telegraphMessage: '"I\'ll close every mine. Everyone will starve. Is that what you want?"',
      priority: 4,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'molten_silver_pour',
      name: 'Molten Silver Pour',
      description: 'Whitmore dumps molten silver on the floor',
      type: BossAbilityType.AOE,
      cooldown: 4,
      damage: 110,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Get to high ground',
      telegraphMessage: 'Whitmore reaches for the smelter controls!',
      priority: 9,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'steam_vent_blast',
      name: 'Steam Vent Blast',
      description: 'Superheated steam erupts from pipes',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 75,
      damageType: BossDamageType.FIRE,
      effect: {
        type: StatusEffect.BURN,
        duration: 2,
        power: 15,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Watch the pipe pressure gauges',
      priority: 7,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'machinery_crush',
      name: 'Machinery Crush',
      description: 'Heavy machinery falls or swings into combat',
      type: BossAbilityType.DAMAGE,
      cooldown: 5,
      damage: 130,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Listen for the creaking of chains',
      telegraphMessage: 'A massive ore-crusher groans overhead!',
      priority: 8,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'final_gambit',
      name: 'Final Gambit',
      description: 'Whitmore attacks with everything he has left',
      type: BossAbilityType.ULTIMATE,
      cooldown: 3,
      damage: 150,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'He\'s sloppy now - exploit his openings',
      telegraphMessage: '"I WILL NOT BE BEATEN BY YOU!"',
      priority: 10,
      requiresPhase: 4,
      targetType: 'single'
    },
    {
      id: 'burn_contracts',
      name: 'Burn Contracts',
      description: 'Whitmore tries to destroy evidence',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 0,
      avoidable: true,
      avoidMechanic: 'Reach the safe before he does',
      telegraphMessage: 'Whitmore staggers toward a wall safe, torch in hand!',
      priority: 5,
      requiresPhase: 4,
      targetType: 'all'
    },
    {
      id: 'golden_cage',
      name: 'Golden Cage',
      description: 'Whitmore activates security locks',
      type: BossAbilityType.DEBUFF,
      cooldown: 0,
      avoidable: true,
      avoidMechanic: 'Find the manual release',
      telegraphMessage: 'Whitmore pulls a chain - iron bars begin descending!',
      priority: 3,
      requiresPhase: 4,
      targetType: 'all'
    }
  ],

  weaknesses: [
    {
      damageType: BossDamageType.FIRE,
      multiplier: 1.2,
      description: 'Fear of fire in his own facility'
    }
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'save_contracts',
      name: 'Save the Contracts',
      description: 'Prevent Whitmore from destroying miner contracts',
      type: 'coordination',
      instructions: 'Reach the safe before Phase 4 burn attempt',
      successReward: 'Contracts returned to miners, freed from debt, major reputation boost',
      failureConsequence: 'Contracts destroyed, miners remain indentured'
    },
    {
      id: 'expose_corruption',
      name: 'Expose Corruption',
      description: 'Find the bribery ledger',
      type: 'puzzle',
      instructions: 'Search the office during Phase 1-2',
      successReward: 'Evidence to prosecute corrupt officials, bonus rewards',
      failureConsequence: 'No additional prosecutions'
    },
    {
      id: 'accept_bribe',
      name: 'Accept the Bribe',
      description: 'Take Whitmore\'s money and betray him anyway',
      type: 'unique',
      instructions: 'Accept bribe in Phase 1, continue fighting',
      successReward: '+10,000 gold, -reputation, outlaw path bonus',
      failureConsequence: 'Standard fight if refused'
    }
  ],

  environmentEffects: [
    {
      id: 'smelter_heat',
      name: 'Smelter Heat',
      description: 'The facility is dangerously hot',
      triggersAt: 'phase_change',
      threshold: 35,
      effect: {
        type: 'debuff',
        target: 'both',
        power: 10
      },
      duration: 0,
      counterplay: 'Stay near ventilation shafts'
    },
    {
      id: 'pinkerton_reinforcements',
      name: 'Pinkerton Reinforcements',
      description: 'More agents arrive periodically',
      triggersAt: 'periodic',
      interval: 6,
      effect: {
        type: 'buff',
        target: 'boss',
        power: 1
      },
      duration: 0,
      counterplay: 'Bar the entrances or eliminate quickly'
    }
  ],

  playerLimit: {
    min: 1,
    max: 4,
    recommended: 3
  },

  scaling: {
    healthPerPlayer: 55,
    damagePerPlayer: 18
  },

  guaranteedDrops: [
    {
      itemId: 'silver-barons-cane',
      name: 'Silver Baron\'s Cane-Sword',
      rarity: 'epic',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'barons-top-hat',
      name: 'Baron\'s Top Hat',
      description: 'A symbol of Gilded Age excess',
      rarity: 'epic',
      dropChance: 0.40,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'stock-certificates',
      name: 'Stock Certificates',
      description: 'Ownership in legitimate businesses',
      rarity: 'rare',
      dropChance: 0.50,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'bribery-ledger',
      name: 'Bribery Ledger',
      description: 'Records of every official Whitmore bought',
      rarity: 'epic',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'silver-bar-pile',
      name: 'Refined Silver Bars',
      description: 'Pure silver from Whitmore\'s smelter',
      rarity: 'rare',
      dropChance: 1.0,
      minQuantity: 100,
      maxQuantity: 350
    }
  ],

  goldReward: {
    min: 2000,
    max: 4000
  },
  experienceReward: 5500,

  achievements: ['baron_breaker', 'contract_savior', 'gilded_age_ender', 'corruption_exposed'],
  titles: ['Tycoon Slayer', 'Liberator of Silverado', 'The Baron Breaker'],
  firstKillBonus: {
    title: 'The One Who Broke the Baron',
    item: 'barons-signet-ring',
    gold: 1000
  },

  difficulty: 7,
  enrageTimer: 12,
  canFlee: false,
  fleeConsequence: 'The facility is locked down - no escape'
};

// =============================================================================
// WAR CHIEF IRON WOLF (L32) - Apache War Band Leader
// Honorable warrior with duel and negotiation paths
// =============================================================================

export const WAR_CHIEF_IRON_WOLF: BossEncounter = {
  id: 'boss_war_chief_iron_wolf',
  name: 'War Chief Iron Wolf',
  title: 'Leader of the Apache War Band',
  category: BossCategory.FACTION_LEADER,
  tier: BossTier.EPIC,
  level: 32,

  description:
    'The fierce leader of the Apache War Band. He fights to reclaim sacred lands desecrated by silver mining.',
  backstory:
    'Iron Wolf watched his father die defending their sacred mountain from the first wave of miners. ' +
    'He was fifteen. Now he leads the fiercest war band in the territory, and he has sworn a blood oath: ' +
    'no more sacred ground will fall to the miners. He doesn\'t hate the settlers as people - he hates what ' +
    'they do. He has spared those who showed respect. He has also killed dozens who didn\'t. ' +
    'The other tribes call him extreme. Even the Comanche Raiders think twice before crossing him. ' +
    'But Iron Wolf knows something they don\'t: if the mountain falls, so does everything the tribes hold sacred.',
  defeatDialogue:
    '"You fight with honor. Perhaps... perhaps there is another way. My people... they deserve better than endless war."',
  victoryNarrative:
    'War Chief Iron Wolf falls to one knee, his war band scattered but not destroyed. ' +
    'His eyes, fierce until now, hold something unexpected: hope. Perhaps this enemy is not ' +
    'like the others. Perhaps there can be peace.',

  location: 'Sacred Mountain - War Camp',
  alternateLocations: ['Sacred Mountain Approach', 'Hidden Canyon Stronghold'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 30,
      description: 'Must be level 30 or higher'
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'territory:blood-for-silver',
      description: 'Must have confronted Iron Wolf\'s ultimatum'
    }
  ],
  respawnCooldown: 48,

  health: 10000,
  damage: 120,
  defense: 75,
  criticalChance: 0.22,
  evasion: 0.20,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Challenge',
      description: 'Iron Wolf offers honorable single combat.',
      dialogue: '"You come to my mountain with weapons. Very well. I offer you a warrior\'s death. Face me alone, if you have honor."',
      abilities: ['tomahawk_throw', 'war_cry', 'honorable_duel_offer'],
      modifiers: []
    },
    {
      phaseNumber: 2,
      healthThreshold: 60,
      name: 'The War Band',
      description: 'If the duel is refused, Iron Wolf summons his warriors.',
      dialogue: '"You have no honor. Then face the full fury of my people!"',
      abilities: ['tomahawk_throw', 'warband_coordination', 'guerrilla_tactics', 'spirit_guidance'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage (commanding presence)'
        }
      ],
      summonMinions: {
        type: 'apache_warrior',
        count: 4,
        spawnMessage: 'War cries echo from all directions as warriors emerge!'
      }
    },
    {
      phaseNumber: 3,
      healthThreshold: 30,
      name: 'Spirit Walk',
      description: 'Iron Wolf channels the power of his ancestors.',
      dialogue: '"Ancestors! Lend me your strength! The sacred mountain must not fall!"',
      abilities: ['spirit_tomahawk', 'ancestor_vision', 'storm_of_spirits', 'final_stand_warrior'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage (ancestral power)'
        },
        {
          type: 'evasion',
          multiplier: 1.5,
          description: '+50% evasion (spirit guidance)'
        }
      ],
      environmentalHazard: {
        name: 'Spirit Storm',
        description: 'Ghostly warriors assault all who stand against Iron Wolf',
        damagePerTurn: 25,
        avoidable: false
      }
    }
  ],

  abilities: [
    {
      id: 'tomahawk_throw',
      name: 'Tomahawk Throw',
      description: 'Iron Wolf hurls his war tomahawk with deadly precision',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 90,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Dodge to the side - the tomahawk returns to him',
      telegraphMessage: 'Iron Wolf\'s arm draws back, tomahawk gleaming!',
      priority: 8,
      targetType: 'single'
    },
    {
      id: 'war_cry',
      name: 'War Cry',
      description: 'A terrifying cry that shakes your resolve',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.FEAR,
        duration: 3,
        power: 25,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Steel your nerves (Spirit check)',
      telegraphMessage: 'Iron Wolf throws his head back and HOWLS!',
      priority: 6,
      targetType: 'all'
    },
    {
      id: 'honorable_duel_offer',
      name: 'Honorable Duel',
      description: 'Iron Wolf offers one-on-one combat',
      type: BossAbilityType.BUFF,
      cooldown: 0,
      avoidable: true,
      avoidMechanic: 'Accept or refuse the duel',
      telegraphMessage: '"Face me alone. Win, and my people will retreat. Lose, and you die with honor."',
      priority: 10,
      targetType: 'single'
    },
    {
      id: 'warband_coordination',
      name: 'War Band Coordination',
      description: 'Iron Wolf directs his warriors tactically',
      type: BossAbilityType.BUFF,
      cooldown: 4,
      avoidable: false,
      telegraphMessage: 'Iron Wolf signals his warriors with hand gestures!',
      priority: 5,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'guerrilla_tactics',
      name: 'Guerrilla Tactics',
      description: 'Warriors strike from hiding and vanish',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 70,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Watch the shadows and strike first',
      priority: 7,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'spirit_guidance',
      name: 'Spirit Guidance',
      description: 'Ancestral spirits aid Iron Wolf\'s movements',
      type: BossAbilityType.BUFF,
      cooldown: 6,
      effect: {
        type: StatusEffect.SLOW, // Applies slow to enemies, effectively speeding Iron Wolf
        duration: 4,
        power: 30,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: false,
      telegraphMessage: 'A ghostly aura surrounds Iron Wolf...',
      priority: 4,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'spirit_tomahawk',
      name: 'Spirit Tomahawk',
      description: 'Iron Wolf\'s tomahawk burns with ethereal fire',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 130,
      damageType: BossDamageType.DIVINE,
      effect: {
        type: StatusEffect.BURN,
        duration: 3,
        power: 20,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'The spirit fire follows - keep moving',
      telegraphMessage: 'His tomahawk blazes with ghostly light!',
      priority: 9,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'ancestor_vision',
      name: 'Ancestor Vision',
      description: 'Iron Wolf sees your moves before you make them',
      type: BossAbilityType.BUFF,
      cooldown: 8,
      effect: {
        type: StatusEffect.CONFUSION, // Applies confusion to enemies - they can't predict his moves
        duration: 4,
        power: 50,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: false,
      telegraphMessage: 'Iron Wolf\'s eyes glow with ancient wisdom...',
      priority: 5,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'storm_of_spirits',
      name: 'Storm of Spirits',
      description: 'Ghostly warriors assault from all directions',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 100,
      damageType: BossDamageType.DIVINE,
      avoidable: false,
      telegraphMessage: 'The air fills with the cries of the honored dead!',
      priority: 8,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'final_stand_warrior',
      name: 'Warrior\'s Final Stand',
      description: 'Iron Wolf fights with everything he has',
      type: BossAbilityType.ULTIMATE,
      cooldown: 4,
      damage: 160,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'He is powerful but predictable - find the pattern',
      telegraphMessage: '"For my father! For my people! FOR THE SACRED MOUNTAIN!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single'
    }
  ],

  weaknesses: [
    {
      damageType: BossDamageType.PSYCHIC,
      multiplier: 1.15,
      description: 'His rigid honor can be used against him'
    }
  ],
  immunities: [], // Iron Wolf is fearless, but this is handled via weakness instead

  specialMechanics: [
    {
      id: 'accept_duel',
      name: 'Accept the Duel',
      description: 'Face Iron Wolf alone in honorable combat',
      type: 'unique',
      instructions: 'Accept in Phase 1 for a one-on-one fight',
      successReward: 'Win = war band retreats, Iron Wolf\'s respect, best rewards',
      failureConsequence: 'Lose = instant death, must retry full fight'
    },
    {
      id: 'negotiate_peace',
      name: 'Negotiate Peace',
      description: 'At low health, Iron Wolf may be willing to talk',
      type: 'unique',
      instructions: 'Use Persuasion at <10% HP to end the fight peacefully',
      successReward: 'Alliance with Apache War Band, territory becomes neutral',
      failureConsequence: 'Standard kill, ongoing hostility'
    },
    {
      id: 'protect_totem',
      name: 'Protect the Spirit Totem',
      description: 'A sacred totem powers Iron Wolf\'s spirit abilities',
      type: 'puzzle',
      instructions: 'Destroy or protect the totem during the fight',
      successReward: 'Protect = +reputation with tribes. Destroy = Spirit Storm disabled',
      failureConsequence: 'N/A - player choice'
    },
    {
      id: 'spare_iron_wolf',
      name: 'Spare Iron Wolf',
      description: 'Let the War Chief live',
      type: 'unique',
      instructions: 'Choose to capture rather than kill at 5% HP',
      successReward: 'Iron Wolf becomes potential ally, major story impact',
      failureConsequence: 'Standard kill'
    }
  ],

  environmentEffects: [
    {
      id: 'sacred_ground',
      name: 'Sacred Ground',
      description: 'The mountain itself seems to resist intruders',
      triggersAt: 'periodic',
      interval: 5,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 15
      },
      duration: 2,
      counterplay: 'Show respect to reduce the effect'
    },
    {
      id: 'warrior_ambush',
      name: 'Hidden Warriors',
      description: 'War band members strike from concealment',
      triggersAt: 'phase_change',
      threshold: 60,
      effect: {
        type: 'damage',
        target: 'player',
        power: 50
      },
      counterplay: 'Scout the area or accept the duel'
    }
  ],

  playerLimit: {
    min: 1,
    max: 4,
    recommended: 2
  },

  scaling: {
    healthPerPlayer: 60,
    damagePerPlayer: 20
  },

  guaranteedDrops: [
    {
      itemId: 'spirit-tomahawk',
      name: 'Spirit Tomahawk',
      rarity: 'epic',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'iron-wolfs-war-bonnet',
      name: 'Iron Wolf\'s War Bonnet',
      description: 'A symbol of his authority and connection to the spirits',
      rarity: 'epic',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'war-chiefs-medicine-bag',
      name: 'War Chief\'s Medicine Bag',
      description: 'Contains sacred herbs and totems',
      rarity: 'rare',
      dropChance: 0.45,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'sacred-silver-ore',
      name: 'Sacred Silver Ore',
      description: 'Silver from the sacred mountain - spiritually charged',
      rarity: 'rare',
      dropChance: 0.60,
      minQuantity: 50,
      maxQuantity: 150
    },
    {
      itemId: 'apache-war-paint',
      name: 'Apache War Paint',
      description: 'Traditional war paint with mystical properties',
      rarity: 'uncommon',
      dropChance: 0.70,
      minQuantity: 3,
      maxQuantity: 10
    }
  ],

  goldReward: {
    min: 1500,
    max: 3500
  },
  experienceReward: 6000,

  achievements: ['duel_accepted', 'duel_victor', 'peacemaker', 'spirit_survivor', 'war_chief_slayer'],
  titles: ['Duel Victor', 'Peacemaker', 'Spirit Walker', 'Friend of the Apache'],
  firstKillBonus: {
    title: 'The One Who Faced the Wolf',
    item: 'iron-wolf-feather',
    gold: 800
  },

  difficulty: 8,
  enrageTimer: 10,
  canFlee: false,
  fleeConsequence: 'Iron Wolf blocks the only path down the mountain'
};

// =============================================================================
// THE CLAIM KING (L35) - Territory Domination Pack Boss
// Dynamic boss identity based on player choices throughout the pack
// =============================================================================

export const CLAIM_KING: BossEncounter = {
  id: 'boss_claim_king',
  name: 'The Claim King',
  title: 'Ruler of Silverado',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.LEGENDARY,
  level: 35,

  description:
    'The ultimate power in Silverado Valley. The Claim King rules from a silver throne, their identity shaped by the chaos you\'ve created.',
  backstory:
    'In the vacuum left by the Railroad\'s defeat, someone had to rise. The Claim King emerged from ' +
    'the chaos - a figure who united the remaining claim jumpers, bought out the corrupt, and broke ' +
    'anyone who resisted. Now they sit on a throne of pure silver in the heart of Silverado, ' +
    'controlling every claim, every mine, every life in the valley. Their identity is a mystery - ' +
    'some say they were there from the beginning, watching, waiting. Others say they rose from nothing. ' +
    'What matters is this: the Claim King will not give up their empire without a war.',
  defeatDialogue:
    '"You... you\'ve taken everything. My empire... my silver... But you can\'t take what I\'ve learned. ' +
    'Power... power always rises again. Remember that."',
  victoryNarrative:
    'The Claim King falls from their silver throne, the crown of Silverado clattering to the floor. ' +
    'The valley is free - or will be, once the dust settles. You\'ve broken the last great power ' +
    'in the territory. What rises next... that depends on what you do with your victory.',

  location: 'Heart of Silverado - The Silver Throne',
  alternateLocations: ['Central Claims Fortress', 'Claim King\'s Palace'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 33,
      description: 'Must be level 33 or higher'
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'territory:heart-of-territory',
      description: 'Must have completed the pack climax quest'
    }
  ],
  respawnCooldown: 72,

  // Pack boss - highest stats in Phase 19.4
  health: 15000,
  damage: 140,
  defense: 85,
  criticalChance: 0.25,
  evasion: 0.15,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Throne Room',
      description: 'The Claim King commands from their silver throne, protected by elite guards.',
      dialogue: '"You dare enter my throne room? I\'ve crushed empires. You are NOTHING."',
      abilities: ['royal_decree', 'call_elite_guard', 'silver_throne_aura', 'crown_authority'],
      modifiers: [],
      summonMinions: {
        type: 'claim_king_elite',
        count: 4,
        spawnMessage: 'Elite guards form a protective wall around the throne!'
      }
    },
    {
      phaseNumber: 2,
      healthThreshold: 70,
      name: 'The Gang War',
      description: 'The Claim King activates full gang warfare protocols.',
      dialogue: '"You want a war? I\'LL GIVE YOU A WAR! All forces - CONVERGE!"',
      abilities: ['gang_war_command', 'reinforcement_waves', 'territory_control', 'silver_bribe'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage (war footing)'
        }
      ],
      summonMinions: {
        type: 'gang_soldier',
        count: 6,
        spawnMessage: 'Gang soldiers pour in from all entrances!'
      }
    },
    {
      phaseNumber: 3,
      healthThreshold: 40,
      name: 'Empire Crumbles',
      description: 'With their army falling, the Claim King enters berserker rage.',
      dialogue: '"NO! I didn\'t come this far to lose to YOU! I am the KING! I AM SILVERADO!"',
      abilities: ['berserker_rage', 'scorched_earth_king', 'desperate_alliance', 'kings_judgment'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.6,
          description: '+60% damage (berserk)'
        },
        {
          type: 'speed',
          multiplier: 1.4,
          description: '+40% attack speed'
        }
      ],
      environmentalHazard: {
        name: 'Crumbling Throne Room',
        description: 'The Claim King is destroying their own palace!',
        damagePerTurn: 20,
        avoidable: true
      }
    },
    {
      phaseNumber: 4,
      healthThreshold: 15,
      name: 'Fall of the King',
      description: 'The final confrontation - one-on-one.',
      dialogue: '"Fine. No more games. No more armies. Just you and me. Let\'s end this."',
      abilities: ['crown_strike', 'final_decree', 'kings_sacrifice', 'empire_curse'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 2.0,
          description: '+100% damage (all or nothing)'
        },
        {
          type: 'defense',
          multiplier: 0.6,
          description: '-40% defense (exposed)'
        }
      ]
    }
  ],

  abilities: [
    {
      id: 'royal_decree',
      name: 'Royal Decree',
      description: 'The Claim King issues commands that empower their forces',
      type: BossAbilityType.BUFF,
      cooldown: 4,
      effect: {
        type: StatusEffect.WEAKNESS, // Applies weakness to enemies via intimidation
        duration: 3,
        power: 25,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: false,
      telegraphMessage: 'The Claim King raises a silver scepter!',
      priority: 5,
      targetType: 'all'
    },
    {
      id: 'call_elite_guard',
      name: 'Call Elite Guard',
      description: 'Summons the Claim King\'s personal guard',
      type: BossAbilityType.SUMMON,
      cooldown: 6,
      avoidable: false,
      telegraphMessage: '"Guards! Defend your King!"',
      priority: 6,
      targetType: 'all'
    },
    {
      id: 'silver_throne_aura',
      name: 'Silver Throne Aura',
      description: 'The silver throne radiates oppressive power',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.WEAKNESS,
        duration: 3,
        power: 20,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Break line of sight with the throne',
      priority: 4,
      targetType: 'all'
    },
    {
      id: 'crown_authority',
      name: 'Crown Authority',
      description: 'The Claim King\'s presence demands submission',
      type: BossAbilityType.DEBUFF,
      cooldown: 6,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.FEAR,
        duration: 2,
        power: 30,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'High Spirit or defy with conviction',
      telegraphMessage: 'The Claim King rises from the throne, crown gleaming!',
      priority: 7,
      targetType: 'all'
    },
    {
      id: 'gang_war_command',
      name: 'Gang War Command',
      description: 'The Claim King coordinates a full assault',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 110,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Use cover and eliminate flankers',
      telegraphMessage: '"Pincer formation! Crush them!"',
      priority: 8,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'reinforcement_waves',
      name: 'Reinforcement Waves',
      description: 'Fresh gang members arrive',
      type: BossAbilityType.SUMMON,
      cooldown: 5,
      avoidable: false,
      telegraphMessage: 'More gang soldiers pour through the doors!',
      priority: 6,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'territory_control',
      name: 'Territory Control',
      description: 'The Claim King uses knowledge of the terrain',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 6,
      damage: 80,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Watch for traps and chokepoints',
      telegraphMessage: 'The Claim King pulls a lever - the floor shifts!',
      priority: 5,
      requiresPhase: 2,
      targetType: 'all'
    },
    {
      id: 'silver_bribe',
      name: 'Silver Bribe',
      description: 'The Claim King offers you unimaginable wealth',
      type: BossAbilityType.DEBUFF,
      cooldown: 0,
      avoidable: true,
      avoidMechanic: 'Refuse the bribe or pretend to accept',
      telegraphMessage: '"One million dollars in silver. Walk away. Take it. You\'ve earned it."',
      priority: 3,
      requiresPhase: 2,
      targetType: 'single'
    },
    {
      id: 'berserker_rage',
      name: 'Berserker Rage',
      description: 'The Claim King loses control',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 130,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'They\'re faster but sloppy - wait for openings',
      priority: 9,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'scorched_earth_king',
      name: 'Scorched Earth',
      description: 'The Claim King begins destroying their own palace',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 100,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Move to stable areas of the room',
      telegraphMessage: '"If I can\'t have it, NO ONE WILL!"',
      priority: 8,
      requiresPhase: 3,
      targetType: 'all'
    },
    {
      id: 'desperate_alliance',
      name: 'Desperate Alliance',
      description: 'The Claim King offers a temporary truce',
      type: BossAbilityType.DEBUFF,
      cooldown: 0,
      avoidable: true,
      avoidMechanic: 'Accept or refuse - both have consequences',
      telegraphMessage: '"Wait! We can share this! You and me - rule together!"',
      priority: 2,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'kings_judgment',
      name: 'King\'s Judgment',
      description: 'A devastating attack powered by silver',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 170,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Perfect dodge timing',
      telegraphMessage: '"BY THE POWER OF SILVERADO, I JUDGE YOU UNWORTHY!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single'
    },
    {
      id: 'crown_strike',
      name: 'Crown Strike',
      description: 'The Claim King attacks with their crown as a weapon',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 150,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.BLEED,
        duration: 4,
        power: 20,
        stackable: true,
        maxStacks: 3,
        appliedAt: new Date()
      },
      avoidable: true,
      avoidMechanic: 'Parry or dodge',
      priority: 9,
      requiresPhase: 4,
      targetType: 'single'
    },
    {
      id: 'final_decree',
      name: 'Final Decree',
      description: 'The Claim King issues one last command',
      type: BossAbilityType.ULTIMATE,
      cooldown: 0,
      damage: 200,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Counter at the perfect moment',
      telegraphMessage: '"This is my FINAL DECREE - YOUR DEATH!"',
      priority: 10,
      requiresPhase: 4,
      targetType: 'single'
    },
    {
      id: 'kings_sacrifice',
      name: 'King\'s Sacrifice',
      description: 'The Claim King attempts to take you with them',
      type: BossAbilityType.AOE,
      cooldown: 0,
      damage: 250,
      damageType: BossDamageType.FIRE,
      avoidable: true,
      avoidMechanic: 'Escape the blast radius',
      telegraphMessage: '"If I die, I take you to HELL with me!"',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all'
    },
    {
      id: 'empire_curse',
      name: 'Empire Curse',
      description: 'With their dying breath, the Claim King curses you',
      type: BossAbilityType.DEBUFF,
      cooldown: 0,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.CORRUPTION, // Corruption represents the curse
        duration: 10,
        power: 25,
        stackable: false,
        appliedAt: new Date()
      },
      avoidable: false,
      telegraphMessage: '"You... you will know what it means to rule... and to lose everything..."',
      priority: 1,
      requiresPhase: 4,
      targetType: 'single'
    }
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.3,
      description: 'Righteous judgment pierces their ego'
    }
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'control_points',
      name: 'Control Point Battle',
      description: 'Capture three control points to weaken the Claim King',
      type: 'coordination',
      instructions: 'Hold positions at three locations in the throne room',
      successReward: 'Claim King loses 20% of remaining health, minions stop spawning',
      failureConsequence: 'Claim King heals 10% when you lose a point'
    },
    {
      id: 'claim_throne',
      name: 'Claim the Throne',
      description: 'After victory, choose what to do with the throne',
      type: 'unique',
      instructions: 'Ending choice: take the throne, destroy it, or give it to the people',
      successReward: 'Take = massive wealth, -reputation. Destroy = +reputation, territory freed. Give = alliance options',
      failureConsequence: 'N/A - player choice'
    },
    {
      id: 'gang_alliance',
      name: 'Gang Alliances',
      description: 'Previous bosses\' dispositions affect this fight',
      type: 'unique',
      instructions: 'Allies from previous quests may join you',
      successReward: 'Captured Dutch provides intel. Peaceful Iron Wolf may send warriors.',
      failureConsequence: 'No allies if previous bosses were killed'
    },
    {
      id: 'identity_reveal',
      name: 'The King\'s Identity',
      description: 'Learn who the Claim King really is',
      type: 'puzzle',
      instructions: 'Investigate clues during the fight or force confession at low HP',
      successReward: 'Narrative revelation, bonus achievement',
      failureConsequence: 'Identity remains mysterious'
    }
  ],

  environmentEffects: [
    {
      id: 'silver_throne_power',
      name: 'Silver Throne',
      description: 'The throne amplifies the Claim King\'s power',
      triggersAt: 'periodic',
      interval: 4,
      effect: {
        type: 'buff',
        target: 'boss',
        power: 10
      },
      duration: 3,
      counterplay: 'Damage the throne to reduce its power'
    },
    {
      id: 'palace_collapse',
      name: 'Palace Collapse',
      description: 'The battle is destroying the palace',
      triggersAt: 'phase_change',
      threshold: 40,
      effect: {
        type: 'damage',
        target: 'both',
        power: 30
      },
      counterplay: 'Move to structurally sound areas'
    }
  ],

  playerLimit: {
    min: 1,
    max: 5,
    recommended: 4
  },

  scaling: {
    healthPerPlayer: 70,
    damagePerPlayer: 22,
    unlockMechanics: [
      {
        playerCount: 4,
        mechanics: ['control_points', 'gang_alliance']
      }
    ]
  },

  guaranteedDrops: [
    {
      itemId: 'claim-kings-revolver',
      name: 'Claim King\'s Revolver',
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true
    }
  ],

  lootTable: [
    {
      itemId: 'crown-of-silverado',
      name: 'Crown of Silverado',
      description: 'The symbol of territorial dominance',
      rarity: 'legendary',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'territory-deed-bundle',
      name: 'Territory Deed Bundle',
      description: 'Ownership papers for the entire valley',
      rarity: 'legendary',
      dropChance: 0.40,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'claim-kings-vest',
      name: 'Claim King\'s Vest',
      description: 'Reinforced armor worn by the ruler of Silverado',
      rarity: 'epic',
      dropChance: 0.45,
      minQuantity: 1,
      maxQuantity: 1
    },
    {
      itemId: 'silver-throne-fragment',
      name: 'Silver Throne Fragment',
      description: 'A piece of the legendary silver throne',
      rarity: 'rare',
      dropChance: 0.70,
      minQuantity: 1,
      maxQuantity: 3
    },
    {
      itemId: 'kings-treasury',
      name: 'King\'s Treasury',
      description: 'The Claim King\'s personal fortune',
      rarity: 'epic',
      dropChance: 1.0,
      minQuantity: 500,
      maxQuantity: 2500
    }
  ],

  goldReward: {
    min: 4000,
    max: 8000
  },
  experienceReward: 8500,

  achievements: [
    'claim_king_slain',
    'silverado_liberated',
    'throne_claimed',
    'throne_destroyed',
    'throne_given',
    'identity_revealed',
    'alliance_victory'
  ],
  titles: [
    'King Slayer',
    'Liberator of Silverado',
    'The New Claim King',
    'Champion of the People',
    'Heart of the Territory'
  ],
  firstKillBonus: {
    title: 'The One Who Conquered Silverado',
    item: 'kings-sigil',
    gold: 2500
  },

  difficulty: 9,
  enrageTimer: 15,
  canFlee: false,
  fleeConsequence: 'The throne room is sealed - there is no escape for either of you'
};

// =============================================================================
// EXPORTS
// =============================================================================

export const HEART_OF_TERRITORY_BOSSES: BossEncounter[] = [
  CLAIM_JUMPER_GANG,
  SILVER_BARON,
  WAR_CHIEF_IRON_WOLF,
  CLAIM_KING
];

/**
 * Get Heart of Territory boss by ID
 */
export function getHeartOfTerritoryBossById(bossId: string): BossEncounter | undefined {
  return HEART_OF_TERRITORY_BOSSES.find(b => b.id === bossId);
}

/**
 * Get Heart of Territory bosses by level range
 */
export function getHeartOfTerritoryBossesByLevel(
  minLevel: number,
  maxLevel: number
): BossEncounter[] {
  return HEART_OF_TERRITORY_BOSSES.filter(
    b => b.level >= minLevel && b.level <= maxLevel
  );
}

/**
 * Get bosses that have honorable duel mechanics
 */
export function getBossesWithDuelMechanic(): BossEncounter[] {
  return HEART_OF_TERRITORY_BOSSES.filter(b =>
    b.specialMechanics?.some(m =>
      m.id === 'accept_duel' || m.id.includes('duel')
    )
  );
}

/**
 * Get bosses with negotiation/spare mechanics
 */
export function getBossesWithPeacefulResolution(): BossEncounter[] {
  return HEART_OF_TERRITORY_BOSSES.filter(b =>
    b.specialMechanics?.some(m =>
      m.id === 'negotiate_peace' ||
      m.id === 'spare_iron_wolf' ||
      m.id === 'capture_dutch'
    )
  );
}
