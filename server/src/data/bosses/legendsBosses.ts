/**
 * Legends of the West Bosses - Phase 19.5
 *
 * 5 main bosses with supernatural progression:
 * - Billy the Kid's Ghost (L38) - Grounded, theatrical tricks
 * - Judge Roy Bean's Curse (L40) - Transitional supernatural
 * - Tombstone Specter (L42) - Full supernatural
 * - Wendigo Spirit (L44) - Cosmic horror
 * - The Conquistador's Return (L45) - Pack boss, ancient evil
 *
 * Plus 4 mini-bosses for ghost towns:
 * - Mine Foreman Ghost (Prosperity)
 * - Wild Bill's Echo (Deadwood's Shadow)
 * - The Avenger (Wrath's Hollow)
 * - Undead Priest (Mission San Muerte)
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

// =============================================================================
// BILLY THE KID'S GHOST (L38) - Grounded / Theatrical
// =============================================================================

export const BILLY_THE_KID: BossEncounter = {
  id: 'boss_billy_the_kid',
  name: "Billy the Kid's Ghost",
  title: 'The Kid Lives',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.EPIC,
  level: 38,

  description:
    'William Bonney - the most famous outlaw in American history. They say he died in 1881. They were wrong.',
  backstory:
    'Pat Garrett claims to have killed Billy the Kid in Fort Sumner. But the body was never shown to the ' +
    'public. Billy faked his death, fled to Mexico, and lived in hiding for decades. Now old grievances ' +
    'have drawn him back. He\'s not a ghost - just a legend who never died. But his reputation is supernatural.',
  defeatDialogue:
    '"Guess I really am dead now... Tell \'em... tell \'em the Kid went down fighting..."',
  victoryNarrative:
    'Billy Bonney falls, the fastest draw finally outdrawn. Was he a ghost? A legend who refused to die? ' +
    'Perhaps some questions are better left unanswered.',

  location: 'Fort Sumner Ruins',
  alternateLocations: ['Lincoln County', 'Stinking Springs'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 36,
      description: 'Must be level 36 or higher',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'legends:billys-trail',
      description: 'Must have completed the investigation',
    },
  ],
  respawnCooldown: 48,

  health: 12000,
  damage: 130,
  defense: 55,
  criticalChance: 0.30,
  evasion: 0.35,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'Mirror Images',
      description: 'Multiple "Billys" appear - theatrical tricks confuse the senses.',
      dialogue: '"You see one of me? I see a dozen of you. Let\'s dance, friend."',
      abilities: ['trick_shot', 'mirror_image', 'smoke_and_mirrors', 'taunting_laugh'],
      modifiers: [],
      summonMinions: {
        type: 'billy_decoy',
        count: 3,
        spawnMessage: 'Shadows shift - suddenly there are multiple Billys!',
      },
    },
    {
      phaseNumber: 2,
      healthThreshold: 60,
      name: 'The Fastest Draw',
      description: 'Billy challenges you to a speed duel.',
      dialogue: '"Enough games. Let\'s see who\'s really faster."',
      abilities: ['quickdraw_duel', 'fan_the_hammer', 'ricochet_shot'],
      modifiers: [
        {
          type: 'speed',
          multiplier: 1.4,
          description: '+40% attack speed',
        },
        {
          type: 'damage',
          multiplier: 1.25,
          description: '+25% damage (serious now)',
        },
      ],
      transitionNarrative:
        'The decoys fade. Billy steps into the moonlight, hand hovering over his holster.',
    },
    {
      phaseNumber: 3,
      healthThreshold: 25,
      name: 'The Real Kid',
      description: 'No more tricks. Just the fastest gun alive.',
      dialogue: '"You\'re good. Better than most. But I\'m Billy the Kid."',
      abilities: ['final_draw', 'legendary_reload', 'last_stand'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage',
        },
        {
          type: 'evasion',
          multiplier: 0.7,
          description: '-30% evasion (standing his ground)',
        },
      ],
    },
  ],

  abilities: [
    {
      id: 'trick_shot',
      name: 'Trick Shot',
      description: 'Billy ricochets a bullet to hit from impossible angles',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 95,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Watch for the bullet trajectory',
      priority: 7,
      targetType: 'single',
    },
    {
      id: 'mirror_image',
      name: 'Mirror Image',
      description: 'Billy creates decoys using theatrical tricks',
      type: BossAbilityType.SUMMON,
      cooldown: 8,
      avoidable: false,
      telegraphMessage: 'Billy throws something on the ground - smoke rises!',
      priority: 6,
      targetType: 'all',
    },
    {
      id: 'smoke_and_mirrors',
      name: 'Smoke and Mirrors',
      description: 'A flash of light blinds everyone',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      effect: {
        type: StatusEffect.BLIND,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Close your eyes before the flash',
      priority: 5,
      targetType: 'all',
    },
    {
      id: 'taunting_laugh',
      name: 'Taunting Laugh',
      description: 'Billy\'s mocking laughter affects your focus',
      type: BossAbilityType.DEBUFF,
      cooldown: 6,
      effect: {
        type: StatusEffect.CONFUSION,
        duration: 2,
        power: 15,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'High Spirit resists',
      priority: 4,
      targetType: 'single',
    },
    {
      id: 'quickdraw_duel',
      name: 'Quickdraw Duel',
      description: 'Billy challenges you to draw - reaction time is everything',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 150,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Quick-time event: Draw faster than Billy',
      telegraphMessage: '"On three. One... two..."',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'fan_the_hammer',
      name: 'Fan the Hammer',
      description: 'Billy fires all six shots in rapid succession',
      type: BossAbilityType.DAMAGE,
      cooldown: 5,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Roll behind cover',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'ricochet_shot',
      name: 'Ricochet Shot',
      description: 'A bullet bounces off multiple surfaces to hit',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 85,
      damageType: BossDamageType.PHYSICAL,
      avoidable: false,
      priority: 6,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'final_draw',
      name: 'Final Draw',
      description: 'Billy\'s ultimate quickdraw - can you match it?',
      type: BossAbilityType.ULTIMATE,
      cooldown: 6,
      damage: 200,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Perfect timing required',
      telegraphMessage: 'Billy\'s eyes narrow. This is it.',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single',
    },
    {
      id: 'legendary_reload',
      name: 'Legendary Reload',
      description: 'Billy reloads impossibly fast',
      type: BossAbilityType.BUFF,
      cooldown: 8,
      avoidable: false,
      priority: 5,
      requiresPhase: 3,
      targetType: 'single',
    },
    {
      id: 'last_stand',
      name: 'Last Stand',
      description: 'Billy empties his gun in a final barrage',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 180,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Take cover and wait for the reload',
      telegraphMessage: '"This is how Billy the Kid goes out!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.2,
      description: 'The truth cuts through the legend',
    },
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'identify_real_billy',
      name: 'Find the Real Billy',
      description: 'Identify which Billy is real among the decoys',
      type: 'puzzle',
      instructions: 'Watch for tells - the real Billy slightly hesitates before tricks',
      successReward: 'Decoys instantly destroyed, bonus damage window',
      failureConsequence: 'Wasted attacks on decoys',
    },
    {
      id: 'quickdraw_mechanic',
      name: 'Quickdraw Duel',
      description: 'Win the quick-draw contest in Phase 2',
      type: 'coordination',
      instructions: 'React to the visual cue faster than Billy',
      successReward: 'Counter-attack dealing double damage',
      failureConsequence: 'Take massive damage',
    },
  ],

  environmentEffects: [
    {
      id: 'moonlit_night',
      name: 'Moonlit Night',
      description: 'The full moon casts strange shadows',
      triggersAt: 'start',
      effect: {
        type: 'debuff',
        target: 'player',
        power: 10,
      },
      duration: -1,
      counterplay: 'Stay in the lit areas',
    },
  ],

  // Phase 19.5: Pre-combat quick-draw challenge
  preCombatChallenge: {
    type: 'quick_draw',
    name: 'The Quick Draw',
    description: 'Billy challenges you to a quick-draw before the real fight begins',
    timeLimit: 2,
    successEffect: {
      bossHpPenalty: 20,
      playerBonus: 'first_strike',
      narrative: 'Your bullet finds its mark before Billy can react. He staggers, wounded but impressed.',
    },
    failureEffect: {
      playerHpPenalty: 15,
      bossBonus: 'initiative',
      narrative: 'Billy\'s shot grazes you as his legendary speed proves itself. "Too slow, friend."',
    },
  },

  playerLimit: { min: 1, max: 4, recommended: 2 },
  scaling: { healthPerPlayer: 45, damagePerPlayer: 15 },

  guaranteedDrops: [
    {
      itemId: 'billys-colt',
      name: "Billy's Colt",
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'kids-bandana',
      name: "The Kid's Bandana",
      description: 'A faded red bandana from the legend himself',
      rarity: 'epic',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'outlaw-legend-duster',
      name: 'Outlaw Legend Duster',
      description: 'The coat of a true outlaw legend',
      rarity: 'epic',
      dropChance: 0.3,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  goldReward: { min: 3000, max: 5500 },
  experienceReward: 6500,

  achievements: ['killed_the_kid', 'quickdraw_master', 'legend_hunter'],
  titles: ['Kid Killer', 'Faster Than Lightning', 'Legend Hunter'],
  firstKillBonus: {
    title: 'The One Who Finally Got Billy',
    item: 'billy-wanted-poster',
    gold: 2000,
  },

  difficulty: 7,
  enrageTimer: 12,
  canFlee: true,
  fleeConsequence: 'Billy escapes into the night - the legend continues',
};

// =============================================================================
// JUDGE ROY BEAN'S CURSE (L40) - Transitional Supernatural
// =============================================================================

export const JUDGE_ROY_BEAN: BossEncounter = {
  id: 'boss_judge_roy_bean',
  name: "Judge Roy Bean's Curse",
  title: 'Law West of the Pecos',
  category: BossCategory.FACTION_LEADER,
  tier: BossTier.EPIC,
  level: 40,

  description:
    'The hanging judge who called himself "The Law West of the Pecos." Death didn\'t end his jurisdiction.',
  backstory:
    'Judge Roy Bean was a self-appointed arbiter of frontier justice, famous for kangaroo courts ' +
    'and quick hangings. When he died in 1903, dozens of wrongfully executed ghosts dragged him ' +
    'to hell. But he escaped - or was sent back. Now his spirit haunts his old courthouse, ' +
    'still passing judgment on any who enter.',
  defeatDialogue:
    '"Verdict... overturned... the sentence... was always... my own..."',
  victoryNarrative:
    'The Judge\'s gavel falls for the last time. The courthouse grows silent as the wrongfully ' +
    'condemned finally rest. Justice, at long last, has been served.',

  location: 'Jersey Lilly Courthouse',
  alternateLocations: ['Langtry Ruins', 'Pecos Crossing'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 38,
      description: 'Must be level 38 or higher',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'legends:the-hanging-tree',
      description: 'Must have investigated the hanging tree',
    },
  ],
  respawnCooldown: 48,

  health: 14000,
  damage: 145,
  defense: 65,
  criticalChance: 0.18,
  evasion: 0.12,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'Court in Session',
      description: 'The Judge presides, declaring all who enter guilty.',
      dialogue: '"This court is now in session! All present are charged with crimes against the Law!"',
      // Phase 19.5: Interactive trial dialogue choices
      dialogueChoices: [
        {
          id: 'plead_innocent',
          text: 'I plead not guilty, Your Honor',
          skillCheck: { skill: 'persuasion', difficulty: 40 },
          successEffect: {
            bossHpReduction: 10,
            narrative: 'Your eloquent defense shakes the Judge\'s conviction. The jury murmurs uncertainly.',
          },
          failureEffect: {
            playerDebuff: 'guilty_verdict',
            narrative: '"Silence! Your lies only add to your crimes!"',
          },
        },
        {
          id: 'challenge_authority',
          text: 'You have no jurisdiction here, Bean!',
          skillCheck: { skill: 'intimidation', difficulty: 50 },
          successEffect: {
            bossHpReduction: 15,
            narrative: 'The Judge recoils as if struck. "How DARE you... but... the law..." His form flickers.',
          },
          failureEffect: {
            playerDebuff: 'contempt_of_court',
            narrative: '"CONTEMPT! You will hang for this insolence!"',
          },
        },
        {
          id: 'accept_guilt',
          text: 'I throw myself on the mercy of the court',
          effect: { skipToPhase: 2 },
        },
      ],
      abilities: ['declare_guilty', 'gavel_strike', 'call_the_jury'],
      modifiers: [],
      summonMinions: {
        type: 'ghost_jury',
        count: 6,
        spawnMessage: 'Spectral jurors materialize in the gallery - all with nooses around their necks!',
      },
    },
    {
      phaseNumber: 2,
      healthThreshold: 65,
      name: 'The Sentencing',
      description: 'The Judge passes sentence - death by hanging.',
      dialogue: '"Guilty! The sentence is death! Take them to the hanging tree!"',
      abilities: ['noose_summon', 'contempt_of_court', 'executioner_call', 'gavel_strike'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.35,
          description: '+35% damage (passing judgment)',
        },
      ],
      environmentalHazard: {
        name: 'Hanging Nooses',
        description: 'Spectral nooses descend from above',
        damagePerTurn: 15,
        avoidable: true,
      },
    },
    {
      phaseNumber: 3,
      healthThreshold: 35,
      name: 'The Curse Revealed',
      description: 'The Judge\'s true form manifests - a horror of injustice.',
      dialogue: '"I am the LAW! I am JUDGE, JURY, and EXECUTIONER!"',
      abilities: ['true_form', 'mass_sentencing', 'final_judgment', 'the_condemned_rise'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.6,
          description: '+60% damage (supernatural fury)',
        },
        {
          type: 'defense',
          multiplier: 0.8,
          description: '-20% defense (incorporeal instability)',
        },
      ],
      visualChange: 'The Judge\'s form warps, revealing dozens of faces screaming from within',
    },
  ],

  abilities: [
    {
      id: 'declare_guilty',
      name: 'Declare Guilty',
      description: 'The Judge declares you guilty, applying a stacking debuff',
      type: BossAbilityType.DEBUFF,
      cooldown: 4,
      effect: {
        type: StatusEffect.WEAKNESS,
        duration: 5,
        power: 15,
        stackable: true,
        maxStacks: 3,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Present evidence of innocence (high Persuasion)',
      telegraphMessage: '"How do you plead? GUILTY!"',
      priority: 6,
      targetType: 'single',
    },
    {
      id: 'gavel_strike',
      name: 'Gavel Strike',
      description: 'The Judge brings down his massive spectral gavel',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      effect: {
        type: StatusEffect.STUN,
        duration: 1,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Dodge the overhead swing',
      priority: 8,
      targetType: 'single',
    },
    {
      id: 'call_the_jury',
      name: 'Call the Jury',
      description: 'Summons ghost jurors - his former victims',
      type: BossAbilityType.SUMMON,
      cooldown: 10,
      avoidable: false,
      telegraphMessage: '"The jury will now deliberate!"',
      priority: 5,
      targetType: 'all',
    },
    {
      id: 'noose_summon',
      name: 'Noose Summon',
      description: 'A spectral noose attempts to wrap around your neck',
      type: BossAbilityType.DAMAGE,
      cooldown: 5,
      damage: 100,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.ROOT,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Cut the rope before it tightens',
      telegraphMessage: 'A noose descends from above!',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'contempt_of_court',
      name: 'Contempt of Court',
      description: 'The Judge\'s fury manifests as psychic damage',
      type: BossAbilityType.AOE,
      cooldown: 6,
      damage: 80,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.FEAR,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Strong Spirit resists',
      telegraphMessage: '"You DARE defy the court?!"',
      priority: 7,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'executioner_call',
      name: 'Call the Executioner',
      description: 'Summons a spectral hangman',
      type: BossAbilityType.SUMMON,
      cooldown: 0,
      avoidable: false,
      telegraphMessage: 'A hooded figure materializes beside the gallows!',
      priority: 6,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'true_form',
      name: 'True Form',
      description: 'The Judge reveals his horrific true nature',
      type: BossAbilityType.AOE,
      cooldown: 0,
      damage: 100,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.MADNESS,
        duration: 3,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Look away from the transformation',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'mass_sentencing',
      name: 'Mass Sentencing',
      description: 'The Judge condemns everyone present',
      type: BossAbilityType.DEBUFF,
      cooldown: 8,
      effect: {
        type: StatusEffect.WEAKNESS,
        duration: 10,
        power: 25,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Appeal the verdict (high Persuasion + Spirit)',
      telegraphMessage: '"I find ALL of you... GUILTY!"',
      priority: 9,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'final_judgment',
      name: 'Final Judgment',
      description: 'The ultimate sentence',
      type: BossAbilityType.ULTIMATE,
      cooldown: 10,
      damage: 250,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Present true justice to counter',
      telegraphMessage: '"THE SENTENCE IS DEATH!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single',
    },
    {
      id: 'the_condemned_rise',
      name: 'The Condemned Rise',
      description: 'All who the Judge wrongfully executed attack',
      type: BossAbilityType.SUMMON,
      cooldown: 0,
      avoidable: false,
      telegraphMessage: 'The ground cracks open as the condemned claw their way up!',
      priority: 8,
      requiresPhase: 3,
      targetType: 'all',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.4,
      description: 'True justice burns the false judge',
    },
  ],
  immunities: [BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'prove_innocence',
      name: 'Prove Your Innocence',
      description: 'Collect evidence during the fight to reduce debuff stacks',
      type: 'puzzle',
      instructions: 'Find and present evidence items scattered in the courthouse',
      successReward: 'Remove all Guilty stacks, deal bonus damage',
      failureConsequence: 'Stacks continue building',
    },
    {
      id: 'free_the_jury',
      name: 'Free the Jury',
      description: 'The ghost jury are victims - free them instead of fighting',
      type: 'coordination',
      instructions: 'Use Spirit-based attacks to release the jurors peacefully',
      successReward: 'Jurors assist you against the Judge',
      failureConsequence: 'Jurors remain hostile',
    },
  ],

  environmentEffects: [
    {
      id: 'spectral_courthouse',
      name: 'Spectral Courthouse',
      description: 'The building phases between living and dead',
      triggersAt: 'phase_change',
      threshold: 65,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 15,
      },
      duration: -1,
      counterplay: 'Stay in areas with more light',
    },
  ],

  playerLimit: { min: 1, max: 4, recommended: 3 },
  scaling: { healthPerPlayer: 50, damagePerPlayer: 18 },

  guaranteedDrops: [
    {
      itemId: 'judges-gavel',
      name: "Judge's Gavel",
      rarity: 'epic',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'hanging-rope',
      name: 'The Hanging Rope',
      description: 'The noose that claimed countless lives',
      rarity: 'epic',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'courtroom-coat',
      name: 'Courtroom Coat',
      description: 'The Judge\'s formal attire',
      rarity: 'epic',
      dropChance: 0.30,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  goldReward: { min: 3500, max: 6000 },
  experienceReward: 7500,

  achievements: ['justice_served', 'freed_the_jury', 'judge_slayer'],
  titles: ['True Justice', 'Jury Liberator', 'Judge Breaker'],
  firstKillBonus: {
    title: 'Verdict: Innocent',
    item: 'scales-of-true-justice',
    gold: 2500,
  },

  difficulty: 8,
  enrageTimer: 15,
  canFlee: true,
  fleeConsequence: 'The Judge cackles - "You are SENTENCED to return!"',
};

// =============================================================================
// TOMBSTONE SPECTER (L42) - Full Supernatural
// =============================================================================

export const TOMBSTONE_SPECTER: BossEncounter = {
  id: 'boss_tombstone_specter',
  name: 'The Tombstone Specter',
  title: 'Ghosts of the O.K. Corral',
  category: BossCategory.COSMIC_HORROR,
  tier: BossTier.LEGENDARY,
  level: 42,

  description:
    'The spirits of the O.K. Corral shootout, trapped in eternal conflict. Earps and Clantons, fighting forever.',
  backstory:
    'On October 26, 1881, the most famous gunfight in Western history took place at the O.K. Corral. ' +
    'The violence was so intense, so charged with hatred, that the spirits of all involved remained ' +
    'anchored to Tombstone. Now they fight endlessly, drawing in anyone foolish enough to visit.',
  defeatDialogue:
    '"Finally... finally it ends... we can rest..."',
  victoryNarrative:
    'The spirits of Tombstone finally dissipate, their eternal conflict resolved. The Earps and ' +
    'Clantons fade into the desert wind, finally at peace after more than a century of battle.',

  location: 'O.K. Corral - Tombstone',
  alternateLocations: ['Bird Cage Theatre', 'Boothill Graveyard'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 40,
      description: 'Must be level 40 or higher',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'legends:tombstone-calling',
      description: 'Must have answered Tombstone\'s call',
    },
  ],
  respawnCooldown: 72,

  health: 16000,
  damage: 155,
  defense: 70,
  criticalChance: 0.22,
  evasion: 0.25,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Duel Begins',
      description: 'A single spirit manifests - Wyatt Earp\'s wrathful ghost.',
      dialogue: '"You\'ve come to Tombstone. Now you\'ll never leave."',
      abilities: ['spectral_shot', 'ghostly_dodge', 'earp_fury'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 60,
      name: 'All Rise',
      description: 'More spirits join the battle - both Earps and Clantons.',
      dialogue: '"Brothers! The living trespass! RISE!"',
      abilities: ['spectral_shot', 'clanton_charge', 'brotherly_vengeance', 'crossfire'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.3,
          description: '+30% damage (multiple spirits)',
        },
      ],
      summonMinions: {
        type: 'gunfight_ghost',
        count: 4,
        spawnMessage: 'The air grows cold as more spirits materialize from both sides!',
      },
      transitionNarrative: 'The ground trembles as more figures rise from the dust...',
    },
    {
      phaseNumber: 3,
      healthThreshold: 30,
      name: 'Spirit Realm',
      description: 'You\'re pulled into the spirit world. The rules change.',
      dialogue: '"Now you see what we see. Now you feel what we feel. FOREVER."',
      abilities: ['spirit_realm_shift', 'eternal_gunfight', 'all_against_one', 'final_showdown'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.5,
          description: '+50% damage (spirit realm)',
        },
        {
          type: 'evasion',
          multiplier: 1.3,
          description: '+30% evasion (ethereal)',
        },
      ],
      environmentalHazard: {
        name: 'Spirit Realm',
        description: 'The living world fades - you\'re fighting on their terms now',
        damagePerTurn: 20,
        avoidable: false,
      },
    },
  ],

  abilities: [
    {
      id: 'spirit_cycle',
      name: 'Spirit Cycle',
      description: 'The Specter shifts between the spirits of fallen gunslingers',
      type: BossAbilityType.TRANSFORMATION,
      cooldown: 2,
      avoidable: false,
      effect: {
        type: StatusEffect.MARKED,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      telegraphMessage: 'The spirits shift... a new gunslinger takes the fore...',
      priority: 9,
      targetType: 'single',
      narrative:
        'The Specter flickers between forms: Wyatt\'s steely determination, Doc\'s sardonic grin, Clanton\'s fury.',
    },
    {
      id: 'spectral_shot',
      name: 'Spectral Shot',
      description: 'A ghost bullet that passes through cover',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 110,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Phase-dodge at the right moment',
      priority: 7,
      targetType: 'single',
    },
    {
      id: 'ghostly_dodge',
      name: 'Ghostly Dodge',
      description: 'The specter becomes momentarily intangible',
      type: BossAbilityType.BUFF,
      cooldown: 5,
      avoidable: false,
      priority: 4,
      targetType: 'single',
    },
    {
      id: 'earp_fury',
      name: 'Earp\'s Fury',
      description: 'Wyatt\'s vengeful spirit attacks with righteous anger',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 140,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.FEAR,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Stand your ground with high Spirit',
      telegraphMessage: '"For my brothers!"',
      priority: 8,
      targetType: 'single',
    },
    {
      id: 'clanton_charge',
      name: 'Clanton Charge',
      description: 'The Clanton brothers rush forward',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Sidestep the ethereal charge',
      priority: 7,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'brotherly_vengeance',
      name: 'Brotherly Vengeance',
      description: 'Spirits attack together for bonus damage',
      type: BossAbilityType.DAMAGE,
      cooldown: 6,
      damage: 160,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Break their coordination',
      telegraphMessage: 'The spirits coordinate their attack!',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'crossfire',
      name: 'Crossfire',
      description: 'Caught between Earps and Clantons',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 100,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Get out of the middle',
      priority: 8,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'spirit_realm_shift',
      name: 'Spirit Realm Shift',
      description: 'Pulls you fully into the spirit world',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 0,
      avoidable: false,
      telegraphMessage: 'The world fades... you\'re crossing over...',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'eternal_gunfight',
      name: 'Eternal Gunfight',
      description: 'The never-ending battle engulfs you',
      type: BossAbilityType.AOE,
      cooldown: 4,
      damage: 130,
      damageType: BossDamageType.VOID,
      avoidable: false,
      priority: 8,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'all_against_one',
      name: 'All Against One',
      description: 'Every spirit turns on you',
      type: BossAbilityType.DAMAGE,
      cooldown: 6,
      damage: 200,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Become ethereal yourself (Spirit ability)',
      priority: 9,
      requiresPhase: 3,
      targetType: 'single',
    },
    {
      id: 'final_showdown',
      name: 'Final Showdown',
      description: 'The O.K. Corral replays one last time',
      type: BossAbilityType.ULTIMATE,
      cooldown: 0,
      damage: 250,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'End the cycle by showing them peace',
      telegraphMessage: '"It\'s October 26th again... and again... and AGAIN!"',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.5,
      description: 'Holy light disrupts the spirits',
    },
  ],
  immunities: [BossDamageType.PHYSICAL],

  specialMechanics: [
    {
      id: 'phase_between_worlds',
      name: 'Phase Between Worlds',
      description: 'Learn to shift between physical and spiritual realms',
      type: 'unique',
      instructions: 'Use the Spirit Spurs or similar items to phase-shift',
      successReward: 'Can damage spirits and avoid spirit attacks',
      failureConsequence: 'Stuck in one realm, vulnerable to the other',
    },
    {
      id: 'end_the_feud',
      name: 'End the Feud',
      description: 'Make peace between the Earps and Clantons',
      type: 'puzzle',
      instructions: 'Present artifacts from both families showing their humanity',
      successReward: 'Spirits stop fighting each other, focus weakens',
      failureConsequence: 'The feud intensifies',
    },
    {
      id: 'spirit_rotation',
      name: 'Shifting Spirits',
      type: 'coordination',
      description: 'The Specter cycles between Wyatt, Doc, and Clanton spirits',
      instructions:
        'Attack when the spirit matches your weapon type: Wyatt=Revolver, Doc=Cards, Clanton=Shotgun',
      successReward: 'Full damage dealt to the specter',
      failureConsequence: 'Attack heals the Specter for 50% of intended damage',
    },
  ],

  environmentEffects: [
    {
      id: 'eternal_october',
      name: 'Eternal October',
      description: 'It\'s always October 26, 1881 in Tombstone',
      triggersAt: 'start',
      effect: {
        type: 'debuff',
        target: 'player',
        power: 10,
      },
      duration: -1,
      counterplay: 'Accept that you\'re in their time now',
    },
  ],

  playerLimit: { min: 1, max: 5, recommended: 4 },
  scaling: { healthPerPlayer: 55, damagePerPlayer: 20 },

  guaranteedDrops: [
    {
      itemId: 'tombstone-revolver',
      name: 'Tombstone Revolver',
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'spirit-spurs',
      name: 'Spirit Spurs',
      description: 'Spurs that let you walk between worlds',
      rarity: 'epic',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  goldReward: { min: 4500, max: 7500 },
  experienceReward: 9000,

  achievements: ['eternal_peace', 'ok_corral_survivor', 'spirit_walker'],
  titles: ['Peace Bringer', 'O.K. Corral Survivor', 'Spirit Walker'],
  firstKillBonus: {
    title: 'The One Who Ended the Feud',
    item: 'tombstone-peace-medal',
    gold: 3500,
  },

  difficulty: 8,
  enrageTimer: 18,
  canFlee: false,
  fleeConsequence: 'You cannot flee the spirit realm once entered',
};

// =============================================================================
// WENDIGO SPIRIT (L44) - Cosmic Horror
// =============================================================================

export const WENDIGO_SPIRIT: BossEncounter = {
  id: 'boss_wendigo_spirit',
  name: 'The Wendigo Spirit',
  title: 'The Old Hunger',
  category: BossCategory.COSMIC_HORROR,
  tier: BossTier.LEGENDARY,
  level: 44,

  description:
    'An ancient evil from Native legend made terrifyingly real. The embodiment of hunger, cold, and cannibalism.',
  backstory:
    'The Nahi warned of the Wendigo for generations - a spirit that possesses those who taste human ' +
    'flesh in desperation. During the harsh winter of 1847, a group of settlers became trapped. ' +
    'What emerged from those mountains was no longer human. The Wendigo has claimed many hosts since, ' +
    'each one adding to its power. Now it hunts freely, the eternal hunger given form.',
  defeatDialogue:
    '(An inhuman shriek that sounds like hundreds of voices screaming in unison)',
  victoryNarrative:
    'The Wendigo collapses, its form dissolving into frost and shadow. But the cold lingers. ' +
    'The hunger... the hunger never truly dies. It will find another host. Someday.',

  location: 'Frozen Peaks',
  alternateLocations: ['Donner\'s Pass', 'Frost Hollow'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 42,
      description: 'Must be level 42 or higher',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'legends:the-old-hunger',
      description: 'Must have tracked the Wendigo',
    },
  ],
  respawnCooldown: 96,

  health: 20000,
  damage: 170,
  defense: 75,
  criticalChance: 0.25,
  evasion: 0.20,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Hunt',
      description: 'The Wendigo stalks you, appearing and vanishing in the blizzard.',
      dialogue: '(No words - only the wind carrying whispers of hunger)',
      abilities: ['stalking_presence', 'hit_and_run', 'freezing_wind', 'terror_aura'],
      modifiers: [],
      environmentalHazard: {
        name: 'Blizzard',
        description: 'Visibility is near zero, cold seeps into your bones',
        damagePerTurn: 10,
        avoidable: false,
      },
    },
    {
      phaseNumber: 2,
      healthThreshold: 55,
      name: 'Transformation',
      description: 'The Wendigo\'s true form begins to manifest.',
      dialogue: '(The whispers become screams - a hundred voices crying for food)',
      abilities: ['partial_manifestation', 'hunger_curse', 'frost_claws', 'devour_attempt'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.4,
          description: '+40% damage (manifesting)',
        },
        {
          type: 'defense',
          multiplier: 1.2,
          description: '+20% defense (supernatural form)',
        },
      ],
      transitionNarrative:
        'The blizzard parts. What stands before you is wrong. Impossibly tall, impossibly thin, ' +
        'with antlers like dead trees and eyes that are windows to an endless void.',
    },
    {
      phaseNumber: 3,
      healthThreshold: 25,
      name: 'The Hunger Manifest',
      description: 'The Wendigo reveals its full cosmic horror.',
      dialogue: '"HUNGRY... ALWAYS HUNGRY... YOU WILL FEED ME..."',
      abilities: ['full_manifestation', 'reality_tear', 'eternal_winter', 'consume_soul'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.8,
          description: '+80% damage (full power)',
        },
      ],
      visualChange:
        'The creature grows larger, its form flickering between realities. You glimpse something ' +
        'vast and ancient behind it - the true Wendigo, of which this is merely an avatar.',
    },
  ],

  abilities: [
    {
      id: 'stalking_presence',
      name: 'Stalking Presence',
      description: 'You know it\'s there. You just can\'t see it.',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      effect: {
        type: StatusEffect.FEAR,
        duration: 3,
        power: 20,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Stay near fire to resist the fear',
      priority: 6,
      targetType: 'all',
    },
    {
      id: 'hit_and_run',
      name: 'Hit and Run',
      description: 'The Wendigo strikes from nowhere and vanishes',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 130,
      damageType: BossDamageType.FROST,
      effect: {
        type: StatusEffect.BLEED,
        duration: 3,
        power: 15,
        stackable: true,
        maxStacks: 3,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Listen for its approach',
      priority: 8,
      targetType: 'single',
    },
    {
      id: 'freezing_wind',
      name: 'Freezing Wind',
      description: 'A supernatural cold that saps your strength',
      type: BossAbilityType.AOE,
      cooldown: 4,
      damage: 80,
      damageType: BossDamageType.FROST,
      effect: {
        type: StatusEffect.SLOW,
        duration: 3,
        power: 30,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Find shelter or use fire',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'terror_aura',
      name: 'Terror Aura',
      description: 'Its mere presence induces primal terror',
      type: BossAbilityType.DEBUFF,
      cooldown: 6,
      effect: {
        type: StatusEffect.MADNESS,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Extremely high Spirit resists',
      priority: 5,
      targetType: 'all',
    },
    {
      id: 'partial_manifestation',
      name: 'Partial Manifestation',
      description: 'The Wendigo partially enters our reality',
      type: BossAbilityType.BUFF,
      cooldown: 0,
      avoidable: false,
      priority: 10,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'hunger_curse',
      name: 'Hunger Curse',
      description: 'You feel an insatiable hunger - for human flesh',
      type: BossAbilityType.DEBUFF,
      cooldown: 8,
      effect: {
        type: StatusEffect.CORRUPTION,
        duration: 5,
        power: 25,
        stackable: true,
        maxStacks: 4,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Strong willpower resists the curse',
      telegraphMessage: 'The hunger... it\'s inside you now...',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'frost_claws',
      name: 'Frost Claws',
      description: 'Claws of supernatural ice tear through armor',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 160,
      damageType: BossDamageType.FROST,
      effect: {
        type: StatusEffect.ARMOR_BREAK,
        duration: 4,
        power: 30,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Parry or dodge',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'devour_attempt',
      name: 'Devour',
      description: 'The Wendigo attempts to consume you',
      type: BossAbilityType.DAMAGE,
      cooldown: 6,
      damage: 200,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Struggle free (high Strength)',
      telegraphMessage: 'Its jaws unhinge impossibly wide!',
      priority: 10,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'full_manifestation',
      name: 'Full Manifestation',
      description: 'The Wendigo\'s true form enters our world',
      type: BossAbilityType.BUFF,
      cooldown: 0,
      avoidable: false,
      priority: 10,
      requiresPhase: 3,
      targetType: 'single',
    },
    {
      id: 'reality_tear',
      name: 'Reality Tear',
      description: 'The Wendigo tears a hole between worlds',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 180,
      damageType: BossDamageType.REALITY,
      effect: {
        type: StatusEffect.MADNESS,
        duration: 3,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Don\'t look into the tear',
      telegraphMessage: 'Reality screams...',
      priority: 9,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'eternal_winter',
      name: 'Eternal Winter',
      description: 'The cold of the void itself',
      type: BossAbilityType.AOE,
      cooldown: 6,
      damage: 150,
      damageType: BossDamageType.FROST,
      effect: {
        type: StatusEffect.ROOT,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: false,
      priority: 8,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'consume_soul',
      name: 'Consume Soul',
      description: 'The Wendigo attempts to devour your very essence',
      type: BossAbilityType.ULTIMATE,
      cooldown: 10,
      damage: 300,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Combined Spirit check from all party members',
      telegraphMessage: '"YOUR SOUL... WILL FEED ME... FOREVER..."',
      priority: 10,
      requiresPhase: 3,
      targetType: 'single',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.FIRE,
      multiplier: 1.6,
      description: 'Fire disrupts its cold essence',
    },
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.4,
      description: 'Sacred power of the Nahi traditions',
    },
  ],
  immunities: [BossDamageType.FROST, BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'fire_resistance',
      name: 'Keep the Fires Burning',
      description: 'Fire is your only reliable defense',
      type: 'coordination',
      instructions: 'Maintain fire sources throughout the fight',
      successReward: 'Resist fear and cold effects, bonus damage',
      failureConsequence: 'Fear and cold overwhelm you',
    },
    {
      id: 'nahi_blessing',
      name: 'Nahi Blessing',
      description: 'Two Ravens can provide a blessing against the Wendigo',
      type: 'unique',
      instructions: 'Bring Two Ravens as a faction representative',
      successReward: 'Major damage boost, resist corruption',
      failureConsequence: 'Fight without spiritual protection',
    },
    {
      id: 'hunger_meter',
      name: 'Resist the Hunger',
      description: 'Don\'t let the corruption stacks reach maximum',
      type: 'puzzle',
      instructions: 'Manage corruption by eating normal food during fight',
      successReward: 'Avoid transformation',
      failureConsequence: 'At 4 stacks: temporarily attack allies',
    },
    {
      id: 'warmth_sources',
      name: 'Find Warmth',
      type: 'coordination',
      description: 'Torches around the arena can reset your cold stacks',
      instructions:
        'Spend a turn to reach a torch (skips your attack). Cold stacks reset to 0.',
      successReward: 'Cold stacks reset to 0, brief immunity to cold',
      failureConsequence: null,
    },
  ],

  environmentEffects: [
    {
      id: 'supernatural_blizzard',
      name: 'Supernatural Blizzard',
      description: 'This is no normal storm',
      triggersAt: 'start',
      effect: {
        type: 'damage',
        target: 'player',
        power: 10,
      },
      duration: -1,
      counterplay: 'Fire reduces the effect',
    },
    {
      id: 'bitter_cold',
      name: 'Bitter Cold',
      description: 'The Wendigo\'s presence brings supernatural cold',
      triggersAt: 'periodic',
      interval: 1,
      effect: {
        type: 'debuff',
        target: 'player',
        statusEffect: 'cold_exposure',
        stackable: true,
        maxStacks: 10,
        power: 1,
      },
      duration: -1,
      counterplay: 'Use fire abilities or find warmth sources to reset stacks',
    },
    {
      id: 'cold_damage',
      name: 'Frostbite',
      description: 'Cold stacks deal increasing damage each turn',
      triggersAt: 'periodic',
      interval: 1,
      effect: {
        type: 'damage',
        target: 'player',
        power: 5,
        scaling: 'cold_exposure_stacks',
      },
      duration: -1,
      counterplay: 'Keep cold stacks below 5 to survive',
    },
  ],

  playerLimit: { min: 1, max: 5, recommended: 4 },
  scaling: { healthPerPlayer: 60, damagePerPlayer: 22 },

  guaranteedDrops: [
    {
      itemId: 'wendigo-claws',
      name: 'Wendigo Claws',
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'spirit-totem',
      name: 'Spirit Totem',
      description: 'A protective totem blessed by the Nahi',
      rarity: 'epic',
      dropChance: 0.30,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  goldReward: { min: 5500, max: 9000 },
  experienceReward: 11000,

  achievements: ['wendigo_slayer', 'hunger_defeated', 'fire_keeper', 'spirit_protector'],
  titles: ['Wendigo Slayer', 'Hunger Breaker', 'Fire Keeper', 'Spirit Guardian'],
  firstKillBonus: {
    title: 'The One Who Silenced the Hunger',
    item: 'wendigo-trophy',
    gold: 4500,
  },

  difficulty: 9,
  enrageTimer: 20,
  canFlee: true,
  fleeConsequence: 'The Wendigo lets you go - it prefers to hunt prey that runs',
};

// =============================================================================
// THE CONQUISTADOR'S RETURN (L45) - Pack Boss
// =============================================================================

export const CONQUISTADOR_RETURN: BossEncounter = {
  id: 'boss_conquistador_return',
  name: "The Conquistador's Return",
  title: 'The First Evil',
  category: BossCategory.COSMIC_HORROR,
  tier: BossTier.ULTIMATE,
  level: 45,

  description:
    'An ancient conquistador who made a dark pact for immortality. He has waited centuries for the right moment to return.',
  backstory:
    'In 1542, a conquistador named Hernán de Sombra led an expedition into the desert seeking gold. ' +
    'What he found was older than humanity - an entity from before the world had a name. He made a pact: ' +
    'immortality in exchange for servitude. For centuries he waited in Mission San Muerte, gathering power. ' +
    'The Railroad\'s expansion, the Silverado Strike, the faction wars - all have weakened the barriers. ' +
    'Now he rises, and behind him, something vast stirs in the darkness between worlds.',
  defeatDialogue:
    '"The pact... is broken... but my master... my master will find... another..."',
  victoryNarrative:
    'Hernán de Sombra crumbles to dust, his centuries of dark existence finally ended. The entity ' +
    'behind him retreats, for now. But something this old, this patient, never truly dies. ' +
    'It will wait. It has eternity.',

  location: 'Mission San Muerte - The Crypt',
  alternateLocations: ['Heart of Darkness', 'The First Altar'],
  spawnConditions: [
    {
      type: BossSpawnConditionType.LEVEL,
      value: 43,
      description: 'Must be level 43 or higher',
    },
    {
      type: BossSpawnConditionType.QUEST,
      value: 'legends:the-conquistadors-return',
      description: 'Must have started the pack climax quest',
    },
  ],
  respawnCooldown: 168,

  health: 25000,
  damage: 185,
  defense: 85,
  criticalChance: 0.20,
  evasion: 0.15,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Army Rises',
      description: 'The Conquistador commands his undead soldiers.',
      dialogue: '"After five centuries, you are the first to reach me. A pity you will not leave."',
      abilities: ['command_undead', 'conquistador_blade', 'dark_authority'],
      modifiers: [],
      summonMinions: {
        type: 'undead_conquistador',
        count: 6,
        spawnMessage: 'Ancient soldiers claw their way from centuries-old graves!',
      },
    },
    {
      phaseNumber: 2,
      healthThreshold: 70,
      name: 'Gold and Blood',
      description: 'The Conquistador reveals his cursed power.',
      dialogue: '"I came for gold. I found something far more valuable. POWER."',
      abilities: ['cursed_gold_rain', 'blood_pact', 'undead_surge', 'conquistador_blade'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.35,
          description: '+35% damage (dark power)',
        },
      ],
      environmentalHazard: {
        name: 'Cursed Gold',
        description: 'Gold coins rain from above - each one corrupts what it touches',
        damagePerTurn: 15,
        avoidable: true,
      },
    },
    {
      phaseNumber: 3,
      healthThreshold: 40,
      name: 'The Dark Pact',
      description: 'The entity behind the Conquistador begins to manifest.',
      dialogue: '"You want to see my master? LOOK UPON IT AND DESPAIR!"',
      abilities: ['reveal_patron', 'void_tendrils', 'reality_corruption', 'dark_blessing'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 1.6,
          description: '+60% damage (channeling entity)',
        },
        {
          type: 'defense',
          multiplier: 1.3,
          description: '+30% defense (supernatural shield)',
        },
      ],
      visualChange:
        'Behind the Conquistador, the shadows coalesce into something vast. Eyes that are not eyes ' +
        'open in the darkness. You glimpse geometry that should not exist.',
    },
    {
      phaseNumber: 4,
      healthThreshold: 15,
      name: 'The First Sin',
      description: 'Desperate, the Conquistador attempts to fully summon his master.',
      dialogue: '"MASTER! I OFFER THIS WORLD AS SACRIFICE! TAKE WHAT IS YOURS!"',
      abilities: ['final_summoning', 'last_crusade', 'desperate_pact', 'oblivion'],
      modifiers: [
        {
          type: 'damage',
          multiplier: 2.0,
          description: '+100% damage (final form)',
        },
        {
          type: 'defense',
          multiplier: 0.6,
          description: '-40% defense (channeling everything)',
        },
      ],
      environmentalHazard: {
        name: 'Reality Collapse',
        description: 'The walls between worlds are failing',
        damagePerTurn: 30,
        avoidable: false,
      },
    },
  ],

  abilities: [
    {
      id: 'command_undead',
      name: 'Command the Dead',
      description: 'The Conquistador orders his undead army to attack',
      type: BossAbilityType.SUMMON,
      cooldown: 8,
      avoidable: false,
      telegraphMessage: '"Rise, my soldiers! Serve your captain once more!"',
      priority: 6,
      targetType: 'all',
    },
    {
      id: 'conquistador_blade',
      name: "Conquistador's Blade",
      description: 'An ancient sword that has tasted countless lives',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 140,
      damageType: BossDamageType.CORRUPTION,
      effect: {
        type: StatusEffect.CORRUPTION,
        duration: 4,
        power: 15,
        stackable: true,
        maxStacks: 5,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Parry or dodge',
      priority: 8,
      targetType: 'single',
    },
    {
      id: 'dark_authority',
      name: 'Dark Authority',
      description: 'The weight of centuries of command',
      type: BossAbilityType.DEBUFF,
      cooldown: 6,
      effect: {
        type: StatusEffect.WEAKNESS,
        duration: 4,
        power: 20,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'High Leadership or Spirit resists',
      telegraphMessage: '"Kneel before your conqueror!"',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'cursed_gold_rain',
      name: 'Cursed Gold Rain',
      description: 'Corrupted gold coins fall from above',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 100,
      damageType: BossDamageType.CORRUPTION,
      effect: {
        type: StatusEffect.CORRUPTION,
        duration: 3,
        power: 10,
        stackable: true,
        maxStacks: 5,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Find cover from the rain',
      priority: 8,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'blood_pact',
      name: 'Blood Pact',
      description: 'The Conquistador heals by sacrificing his undead',
      type: BossAbilityType.HEAL,
      cooldown: 10,
      avoidable: false,
      telegraphMessage: '"Your deaths serve me still!"',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'undead_surge',
      name: 'Undead Surge',
      description: 'All undead attack simultaneously',
      type: BossAbilityType.DAMAGE,
      cooldown: 6,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'AoE attack to thin the ranks',
      priority: 7,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'reveal_patron',
      name: 'Reveal the Patron',
      description: 'The entity behind the Conquistador manifests partially',
      type: BossAbilityType.AOE,
      cooldown: 0,
      damage: 150,
      damageType: BossDamageType.VOID,
      effect: {
        type: StatusEffect.MADNESS,
        duration: 3,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Don\'t look directly at it',
      telegraphMessage: 'Something vast shifts in the darkness...',
      priority: 10,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'void_tendrils',
      name: 'Void Tendrils',
      description: 'Tendrils of pure nothing reach for you',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 180,
      damageType: BossDamageType.VOID,
      effect: {
        type: StatusEffect.ROOT,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Cut the tendrils with blessed weapons',
      priority: 9,
      requiresPhase: 3,
      targetType: 'single',
    },
    {
      id: 'reality_corruption',
      name: 'Reality Corruption',
      description: 'The laws of physics begin to break down',
      type: BossAbilityType.AOE,
      cooldown: 6,
      damage: 130,
      damageType: BossDamageType.REALITY,
      avoidable: false,
      priority: 8,
      requiresPhase: 3,
      targetType: 'all',
    },
    {
      id: 'dark_blessing',
      name: 'Dark Blessing',
      description: 'The entity empowers its servant',
      type: BossAbilityType.BUFF,
      cooldown: 8,
      avoidable: false,
      priority: 7,
      requiresPhase: 3,
      targetType: 'single',
    },
    {
      id: 'final_summoning',
      name: 'Final Summoning',
      description: 'The Conquistador attempts to fully summon his master',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 0,
      avoidable: false,
      telegraphMessage: 'The barrier between worlds is failing!',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all',
    },
    {
      id: 'last_crusade',
      name: 'Last Crusade',
      description: 'The Conquistador channels everything into one attack',
      type: BossAbilityType.DAMAGE,
      cooldown: 5,
      damage: 250,
      damageType: BossDamageType.CORRUPTION,
      avoidable: true,
      avoidMechanic: 'United defense from all party members',
      priority: 10,
      requiresPhase: 4,
      targetType: 'single',
    },
    {
      id: 'desperate_pact',
      name: 'Desperate Pact',
      description: 'The Conquistador offers his remaining army for power',
      type: BossAbilityType.BUFF,
      cooldown: 0,
      avoidable: false,
      telegraphMessage: '"Take them all! Give me the POWER!"',
      priority: 9,
      requiresPhase: 4,
      targetType: 'single',
    },
    {
      id: 'oblivion',
      name: 'Oblivion',
      description: 'The ultimate attack - a glimpse of the void',
      type: BossAbilityType.ULTIMATE,
      cooldown: 12,
      damage: 350,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Combined effort: Alliance Banner + Spirit abilities',
      telegraphMessage: '"WITNESS... THE... END..."',
      priority: 10,
      requiresPhase: 4,
      targetType: 'all',
    },
  ],

  weaknesses: [
    {
      damageType: BossDamageType.DIVINE,
      multiplier: 1.8,
      description: 'Holy power is anathema to his dark pact',
    },
    {
      damageType: BossDamageType.FIRE,
      multiplier: 1.3,
      description: 'Fire purifies the corruption',
    },
  ],
  immunities: [BossDamageType.CORRUPTION, BossDamageType.VOID],

  specialMechanics: [
    {
      id: 'faction_unity',
      name: 'Faction Unity',
      description: 'Difficulty scales based on faction alliances',
      type: 'unique',
      instructions:
        'Solo faction: +50% boss stats. Two factions: +25%. All three: Standard difficulty.',
      successReward: 'Alliance abilities become available',
      failureConsequence: 'Fight alone against overwhelming odds',
    },
    {
      id: 'seal_the_portal',
      name: 'Seal the Portal',
      description: 'Prevent the full summoning in Phase 4',
      type: 'coordination',
      instructions: 'Use The First Bible or equivalent holy item on the altar',
      successReward: 'Entity retreats, boss loses buffs',
      failureConsequence: 'Entity partially manifests, adds attacks',
    },
    {
      id: 'destroy_gold',
      name: 'Destroy the Cursed Gold',
      description: 'The gold is the source of his power',
      type: 'puzzle',
      instructions: 'Find and destroy the gold pile in Phase 2',
      successReward: 'Reduces boss defense and healing',
      failureConsequence: 'Gold continues to empower him',
    },
    {
      id: 'alliance_abilities',
      name: 'Alliance Abilities',
      description: 'Faction representatives unlock special attacks',
      type: 'unique',
      instructions: 'If all factions are allied, their champions combine for ultimate attacks',
      successReward: 'Massive damage phases',
      failureConsequence: 'Miss the coordinated attack windows',
    },
    {
      id: 'gold_corruption',
      name: "The Conquistador's Curse",
      type: 'unique',
      description: 'Each gold pile picked up adds 1 corruption stack',
      instructions:
        'Corruption stacks reduce your damage by 5% each. At 10 stacks, you join the Conquistador\'s army (instant death). Ignoring gold keeps you pure - bonus loot at victory.',
      successReward: 'Ignoring all gold grants bonus rewards and a special achievement',
      failureConsequence: 'Death at 10 stacks, reduced rewards per stack collected',
    },
  ],

  environmentEffects: [
    {
      id: 'corrupted_ground',
      name: 'Corrupted Ground',
      description: 'The crypt floor is tainted by centuries of dark worship',
      triggersAt: 'start',
      effect: {
        type: 'damage',
        target: 'player',
        power: 5,
      },
      duration: -1,
      counterplay: 'Stand in blessed areas',
    },
    {
      id: 'failing_reality',
      name: 'Failing Reality',
      description: 'The barriers between worlds are thin here',
      triggersAt: 'phase_change',
      threshold: 40,
      effect: {
        type: 'debuff',
        target: 'both',
        power: 20,
      },
      counterplay: 'Use holy items to stabilize reality',
    },
    {
      id: 'cursed_gold_drops',
      name: 'Cursed Gold',
      description: 'Cursed gold coins scatter across the battlefield on phase transitions',
      triggersAt: 'phase_change',
      effect: {
        type: 'hazard',
        target: 'player',
        statusEffect: 'gold_corruption',
        stackable: true,
        maxStacks: 10,
        power: 1,
      },
      duration: -1,
      counterplay: 'Ignore the gold to avoid corruption - greed is fatal',
    },
  ],

  playerLimit: { min: 1, max: 5, recommended: 5 },
  scaling: {
    healthPerPlayer: 65,
    damagePerPlayer: 25,
    unlockMechanics: [
      {
        playerCount: 4,
        mechanics: ['seal_the_portal', 'alliance_abilities'],
      },
    ],
  },

  guaranteedDrops: [
    {
      itemId: 'conquistadors-armor',
      name: "Conquistador's Armor",
      rarity: 'legendary',
      quantity: 1,
      guaranteedFirstKill: true,
    },
  ],

  lootTable: [
    {
      itemId: 'cursed-medallion',
      name: 'Cursed Medallion',
      description: 'The symbol of the dark pact',
      rarity: 'epic',
      dropChance: 0.4,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'ancient-blade',
      name: 'Ancient Blade',
      description: 'The Conquistador\'s centuries-old sword',
      rarity: 'legendary',
      dropChance: 0.25,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'the-first-bible',
      name: 'The First Bible',
      description: 'Recovered from the mission altar',
      rarity: 'legendary',
      dropChance: 0.20,
      minQuantity: 1,
      maxQuantity: 1,
    },
    {
      itemId: 'alliance-banner',
      name: 'Alliance Banner',
      description: 'A symbol of the united factions',
      rarity: 'epic',
      dropChance: 0.30,
      minQuantity: 1,
      maxQuantity: 1,
      requiresFirstKill: true,
    },
  ],

  goldReward: { min: 8000, max: 15000 },
  experienceReward: 15000,

  achievements: [
    'conquistador_slain',
    'portal_sealed',
    'factions_united',
    'first_evil_defeated',
    'gold_destroyer',
  ],
  titles: [
    'Conquistador Slayer',
    'Portal Sealer',
    'Unifier',
    'First Evil Vanquisher',
    'Curse Breaker',
  ],
  firstKillBonus: {
    title: 'The One Who Closed the Door',
    item: 'dimensional-seal',
    gold: 8000,
  },

  difficulty: 10,
  enrageTimer: 25,
  canFlee: false,
  fleeConsequence: 'The entity does not allow escape',
};

// =============================================================================
// MINI-BOSSES (4)
// =============================================================================

export const MINE_FOREMAN_GHOST: BossEncounter = {
  id: 'boss_mine_foreman_ghost',
  name: 'Mine Foreman Ghost',
  title: 'The Betrayed Overseer',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.RARE,
  level: 36,

  description: 'The foreman who died trying to save his men. His guilt keeps him trapped.',
  backstory:
    'When the Prosperity mine collapsed, Foreman O\'Brien tried to lead his men to safety. ' +
    'He failed. Now he walks the tunnels forever, still trying to save miners who are already dead.',
  defeatDialogue: '"The men... did the men make it out...?"',
  victoryNarrative:
    'The Foreman finally stops. For a moment, he sees the light. Then he fades, finally at peace.',

  location: 'Prosperity Mine - Deep Shaft',
  spawnConditions: [
    { type: BossSpawnConditionType.LEVEL, value: 35, description: 'Level 35+' },
  ],
  respawnCooldown: 24,

  health: 6000,
  damage: 95,
  defense: 45,
  criticalChance: 0.15,
  evasion: 0.10,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'Eternal Rescue',
      description: 'The Foreman mistakes you for a trapped miner.',
      dialogue: '"This way! Follow me! I know the tunnels!"',
      abilities: ['pickaxe_swing', 'lantern_flash', 'cave_in_warning'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 40,
      name: 'Realization',
      description: 'The Foreman realizes the truth.',
      dialogue: '"Wait... you\'re not... they\'re all... I COULDN\'T SAVE THEM!"',
      abilities: ['rage_of_guilt', 'collapse_trigger', 'final_rescue'],
      modifiers: [
        { type: 'damage', multiplier: 1.5, description: '+50% damage (grief)' },
      ],
    },
  ],

  abilities: [
    {
      id: 'pickaxe_swing',
      name: 'Pickaxe Swing',
      description: 'A heavy swing with his mining pick',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 75,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Sidestep',
      priority: 7,
      targetType: 'single',
    },
    {
      id: 'lantern_flash',
      name: 'Lantern Flash',
      description: 'A blinding flash from his spirit lantern',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      effect: {
        type: StatusEffect.BLIND,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Look away',
      priority: 5,
      targetType: 'all',
    },
    {
      id: 'cave_in_warning',
      name: 'Cave-In Warning',
      description: 'The Foreman triggers a partial collapse',
      type: BossAbilityType.AOE,
      cooldown: 6,
      damage: 60,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Watch for dust and move',
      priority: 6,
      targetType: 'all',
    },
    {
      id: 'rage_of_guilt',
      name: 'Rage of Guilt',
      description: 'Overwhelming guilt manifests as rage',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 100,
      damageType: BossDamageType.PSYCHIC,
      avoidable: true,
      avoidMechanic: 'High Spirit',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'collapse_trigger',
      name: 'Collapse Trigger',
      description: 'The Foreman triggers a major collapse',
      type: BossAbilityType.AOE,
      cooldown: 8,
      damage: 120,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Find cover in side tunnels',
      priority: 9,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'final_rescue',
      name: 'Final Rescue Attempt',
      description: 'One last desperate attempt to save someone',
      type: BossAbilityType.DAMAGE,
      cooldown: 0,
      damage: 150,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Show him peace, not violence',
      priority: 10,
      requiresPhase: 2,
      targetType: 'single',
    },
  ],

  weaknesses: [
    { damageType: BossDamageType.DIVINE, multiplier: 1.3, description: 'Peace releases him' },
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'peaceful_resolution',
      name: 'Peaceful Resolution',
      description: 'You can end this fight without violence',
      type: 'puzzle',
      instructions: 'Use Spirit abilities to show him his men are at peace',
      successReward: 'Fight ends, full rewards, bonus item',
      failureConsequence: 'Must defeat him conventionally',
    },
    // Phase 19.5: Fading Breath Mechanic
    {
      id: 'fading_breath',
      name: 'Fading Breath',
      description: 'The mine\'s bad air depletes your oxygen. An alternative action can restore it.',
      type: 'unique',
      instructions:
        'Oxygen starts at 100% and decreases 10% per round. ' +
        'At 70%: Draw 4 cards instead of 5. At 50%: Draw 3 cards. At 30%: Take 20 damage/round. At 0%: Defeat. ' +
        'Use "Find Air Pocket" action (skip attack, draw Pair+ to restore 20%).',
      successReward: 'Maintain oxygen above critical levels',
      failureConsequence: 'Suffocation damage and hand size reduction',
    },
    {
      id: 'destiny_deck_integration_foreman',
      name: 'Mine Collapse Hands',
      description: 'Card suits affect the environment',
      type: 'unique',
      instructions:
        'DIAMONDS hands reveal structural weakness (bonus damage). ' +
        'CLUBS trigger falling debris (both take damage). ' +
        'Full House+ triggers "Tunnel Collapse" (massive damage but -30% air).',
    },
  ],

  environmentEffects: [
    // Phase 19.5: Oxygen System
    {
      id: 'fading_breath_environment',
      name: 'Bad Air',
      description: 'The mine\'s air grows thin. Your breathing becomes labored.',
      triggersAt: 'periodic',
      interval: 1, // Every round
      effect: {
        type: 'debuff',
        target: 'player',
        power: 10, // 10% oxygen loss per round
        statusEffect: 'oxygen_depletion',
        stackable: true,
        maxStacks: 10, // 10 rounds to 0%
        scaling: 'oxygen_level',
      },
      counterplay: 'Find Air Pocket action: Skip attack, draw Pair+ to restore 20% oxygen',
    },
    {
      id: 'oxygen_critical',
      name: 'Suffocation',
      description: 'At 30% oxygen or below, you take damage each round.',
      triggersAt: 'health_threshold',
      threshold: 30, // Triggers when oxygen <= 30%
      effect: {
        type: 'damage',
        target: 'player',
        power: 20,
      },
      duration: -1, // Until oxygen restored
      counterplay: 'Find an air pocket before it\'s too late',
    },
  ],

  playerLimit: { min: 1, max: 3, recommended: 2 },
  scaling: { healthPerPlayer: 35, damagePerPlayer: 10 },

  guaranteedDrops: [
    { itemId: 'prosperity-miners-helmet', name: "Miner's Helmet", rarity: 'rare', quantity: 1 },
  ],
  lootTable: [],

  goldReward: { min: 1000, max: 1800 },
  experienceReward: 3000,

  achievements: ['foreman_freed', 'breath_master'], // Phase 19.5: New achievement
  titles: ['Miner\'s Friend', 'Last Breath'], // Phase 19.5: New title
  difficulty: 5,
  canFlee: true,
  fleeConsequence: 'The Foreman wanders on, alone',
};

export const WILD_BILL_ECHO: BossEncounter = {
  id: 'boss_wild_bill_echo',
  name: "Wild Bill's Echo",
  title: 'The Gambler\'s Ghost',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.EPIC,
  level: 38,

  description: 'An echo of Wild Bill Hickok, forever playing his last hand.',
  backstory:
    'Wild Bill was shot in the back holding aces and eights - the Dead Man\'s Hand. In Deadwood\'s ' +
    'Shadow, his ghost still plays, still holding those cards, still waiting for the shot.',
  defeatDialogue: '"Aces and eights... always aces and eights..."',
  victoryNarrative: 'Wild Bill\'s ghost folds his cards and fades, finally free of the eternal game.',

  location: "Deadwood's Shadow - Wild Bill's Rest",
  spawnConditions: [
    { type: BossSpawnConditionType.LEVEL, value: 37, description: 'Level 37+' },
  ],
  respawnCooldown: 36,

  health: 8000,
  damage: 110,
  defense: 50,
  criticalChance: 0.25,
  evasion: 0.20,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Game',
      description: 'Wild Bill invites you to play.',
      dialogue: '"Take a seat, friend. Let\'s play some cards."',
      abilities: ['card_throw', 'poker_face', 'all_in'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 50,
      name: 'Dead Man\'s Hand',
      description: 'Wild Bill realizes what\'s happening.',
      dialogue: '"Wait... I know this hand... I know what comes NEXT!"',
      abilities: ['dead_mans_hand', 'ghost_shot', 'eternal_game'],
      modifiers: [
        { type: 'damage', multiplier: 1.4, description: '+40% damage' },
      ],
    },
  ],

  abilities: [
    {
      id: 'card_throw',
      name: 'Card Throw',
      description: 'Wild Bill throws spectral cards',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 80,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Dodge the cards',
      priority: 7,
      targetType: 'single',
    },
    {
      id: 'poker_face',
      name: 'Poker Face',
      description: 'You can\'t read his intentions',
      type: BossAbilityType.BUFF,
      cooldown: 6,
      avoidable: false,
      priority: 5,
      targetType: 'single',
    },
    {
      id: 'all_in',
      name: 'All In',
      description: 'Wild Bill bets everything on one shot',
      type: BossAbilityType.DAMAGE,
      cooldown: 5,
      damage: 130,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Call his bluff',
      priority: 8,
      targetType: 'single',
    },
    {
      id: 'dead_mans_hand',
      name: 'Dead Man\'s Hand',
      description: 'Aces and eights curse you',
      type: BossAbilityType.DEBUFF,
      cooldown: 8,
      effect: {
        type: StatusEffect.CORRUPTION,
        duration: 5,
        power: 20,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Fold your hand',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'ghost_shot',
      name: 'Ghost Shot',
      description: 'The shot that killed him, replayed',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 150,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Don\'t turn your back',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'eternal_game',
      name: 'Eternal Game',
      description: 'The game never ends',
      type: BossAbilityType.DEBUFF,
      cooldown: 10,
      effect: {
        type: StatusEffect.ROOT,
        duration: 3,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Win the hand',
      priority: 8,
      requiresPhase: 2,
      targetType: 'all',
    },
  ],

  weaknesses: [
    { damageType: BossDamageType.DIVINE, multiplier: 1.4, description: 'Peace frees the gambler' },
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'beat_wild_bill',
      name: 'Beat Wild Bill at Cards',
      description: 'Win a poker hand against the legend',
      type: 'puzzle',
      instructions: 'High Gambling skill allows you to play and win',
      successReward: 'Wild Bill concedes, bonus rewards',
      failureConsequence: 'Must fight conventionally',
    },
    // Phase 19.5: The Eternal Game Mechanic
    {
      id: 'eternal_game_mechanic',
      name: 'The Eternal Game',
      description: 'Combat alternates with poker rounds every 2 turns',
      type: 'unique',
      instructions:
        'Every 2 rounds, a Poker Round occurs. Both sides draw hands. ' +
        'Player wins by +1 rank: +20% damage next round. ' +
        'Player wins by +2 ranks: Skip Wild Bill\'s attack. ' +
        'Tie: Both take 50 psychic damage. ' +
        'Wild Bill wins by +1: Player takes 80 damage. ' +
        'Wild Bill wins by +2: Player\'s next hand forced to High Card.',
      successReward: 'Poker victories grant combat advantages',
      failureConsequence: 'Poker losses result in damage and debuffs',
    },
    {
      id: 'dead_mans_hand_special',
      name: 'Dead Man\'s Hand',
      description: 'Aces and Eights have dramatic effects',
      type: 'unique',
      instructions:
        'If either party draws Aces & Eights (Dead Man\'s Hand): ' +
        'Player: Instant 25% damage to Wild Bill, but take 100 psychic damage. ' +
        'Wild Bill: Triggers phase change, heals 10%, rage mode.',
    },
  ],

  environmentEffects: [
    // Phase 19.5: Eternal Game Round Tracker
    {
      id: 'poker_round_counter',
      name: 'The Cards Call',
      description: 'Wild Bill deals the cards for a poker showdown.',
      triggersAt: 'periodic',
      interval: 2, // Every 2 rounds
      effect: {
        type: 'debuff', // Special handling - triggers poker mechanic
        target: 'both',
        power: 0, // No damage, just triggers poker round
        statusEffect: 'poker_round_active',
      },
      counterplay: 'Win the poker hand for combat advantages',
    },
  ],

  playerLimit: { min: 1, max: 3, recommended: 2 },
  scaling: { healthPerPlayer: 40, damagePerPlayer: 12 },

  guaranteedDrops: [
    { itemId: 'docs-cards', name: "Doc's Cards", rarity: 'rare', quantity: 1 },
  ],
  lootTable: [],

  goldReward: { min: 1500, max: 2500 },
  experienceReward: 4000,

  achievements: ['beat_wild_bill'],
  titles: ['Card Sharp'],
  difficulty: 6,
  canFlee: true,
  fleeConsequence: 'Wild Bill chuckles - "Come back when you\'re ready to play"',
};

export const THE_AVENGER: BossEncounter = {
  id: 'boss_the_avenger',
  name: 'The Avenger',
  title: 'Wrath Incarnate',
  category: BossCategory.COSMIC_HORROR,
  tier: BossTier.EPIC,
  level: 42,

  description: 'The collective rage of the Wrath\'s Hollow massacre, given form.',
  backstory:
    'When the cavalry massacred the peaceful village, the dying curse created something new. ' +
    'The Avenger is not one spirit but many - all the rage, all the grief, fused into vengeance.',
  defeatDialogue: '(The screaming stops. For the first time in over a century, there is silence.)',
  victoryNarrative:
    'The Avenger dissipates, the bound spirits finally released. Wrath\'s Hollow grows warmer.',

  location: "Wrath's Hollow - Heart of Wrath",
  spawnConditions: [
    { type: BossSpawnConditionType.LEVEL, value: 41, description: 'Level 41+' },
  ],
  respawnCooldown: 48,

  health: 10000,
  damage: 140,
  defense: 60,
  criticalChance: 0.22,
  evasion: 0.15,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'Judgment',
      description: 'The Avenger tests your guilt.',
      dialogue: '"You walk on blood-soaked ground. What crimes do YOU carry?"',
      abilities: ['guilt_probe', 'wrath_strike', 'blood_memory'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 50,
      name: 'Vengeance',
      description: 'The Avenger passes judgment.',
      dialogue: '"GUILTY! ALL OF YOU! GUILTY!"',
      abilities: ['mass_vengeance', 'ancestor_fury', 'final_judgment'],
      modifiers: [
        { type: 'damage', multiplier: 1.6, description: '+60% damage' },
      ],
    },
  ],

  abilities: [
    {
      id: 'guilt_probe',
      name: 'Guilt Probe',
      description: 'The Avenger reads your sins',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      effect: {
        type: StatusEffect.WEAKNESS,
        duration: 4,
        power: 25,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Clear conscience (positive Nahi reputation)',
      priority: 7,
      targetType: 'single',
    },
    {
      id: 'wrath_strike',
      name: 'Wrath Strike',
      description: 'Pure rage made manifest',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 120,
      damageType: BossDamageType.PSYCHIC,
      avoidable: true,
      avoidMechanic: 'Stand firm with righteous purpose',
      priority: 8,
      targetType: 'single',
    },
    {
      id: 'blood_memory',
      name: 'Blood Memory',
      description: 'Experience the massacre firsthand',
      type: BossAbilityType.AOE,
      cooldown: 6,
      damage: 100,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.FEAR,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Bear witness without breaking',
      priority: 7,
      targetType: 'all',
    },
    {
      id: 'mass_vengeance',
      name: 'Mass Vengeance',
      description: 'All wrongs will be punished',
      type: BossAbilityType.AOE,
      cooldown: 5,
      damage: 150,
      damageType: BossDamageType.VOID,
      avoidable: false,
      priority: 9,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'ancestor_fury',
      name: 'Ancestor Fury',
      description: 'The spirits of the dead attack',
      type: BossAbilityType.SUMMON,
      cooldown: 8,
      avoidable: false,
      priority: 8,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'final_judgment',
      name: 'Final Judgment',
      description: 'The Avenger passes sentence',
      type: BossAbilityType.ULTIMATE,
      cooldown: 10,
      damage: 200,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'Show genuine remorse and respect',
      priority: 10,
      requiresPhase: 2,
      targetType: 'single',
    },
  ],

  weaknesses: [
    { damageType: BossDamageType.DIVINE, multiplier: 1.5, description: 'Peace and respect calm the wrath' },
  ],
  immunities: [BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'righteous_path',
      name: 'Walk the Righteous Path',
      description: 'Your moral reputation affects this fight significantly',
      type: 'unique',
      instructions: 'Positive Nahi reputation and honoring the dead reduces damage',
      successReward: 'The Avenger is calmed, fight is easier',
      failureConsequence: 'Full wrath is directed at you',
    },
    // Phase 19.5: Guilt Mirror Mechanic
    {
      id: 'guilt_mirror',
      name: 'Guilt Mirror',
      description: 'Your Guilt Score (0-100) determines boss power',
      type: 'unique',
      instructions:
        'Guilt Score calculated from your gameplay karma: crimes committed, innocents harmed, promises broken. ' +
        '0-20 (Innocent): Boss at 70% power. ' +
        '21-50 (Questionable): Boss at 100% power. ' +
        '51-80 (Guilty): Boss at 130% power. ' +
        '81-100 (Damned): Boss at 150% power + permanent enrage.',
      successReward: 'Low guilt = significantly easier fight',
      failureConsequence: 'High guilt = brutal difficulty increase',
    },
    {
      id: 'vision_of_guilt',
      name: 'Vision of Guilt',
      description: 'Every 3 rounds, face a vision. Beat the threshold to reduce guilt.',
      type: 'unique',
      instructions:
        'HEARTS hands double guilt reduction. ' +
        'Four of a Kind+ skips the next Vision. ' +
        'Reaching 0 guilt = peaceful resolution (no combat needed).',
    },
  ],

  environmentEffects: [
    // Phase 19.5: Guilt System
    {
      id: 'guilt_vision_trigger',
      name: 'Vision of Guilt',
      description: 'The Avenger forces you to confront your past.',
      triggersAt: 'periodic',
      interval: 3, // Every 3 rounds
      effect: {
        type: 'debuff',
        target: 'player',
        power: 0, // Triggers guilt check mechanic
        statusEffect: 'guilt_vision_active',
      },
      counterplay: 'Draw strong hands to reduce guilt. HEARTS hands are doubly effective.',
    },
    {
      id: 'guilt_power_scaling',
      name: 'Wrath Scales with Sin',
      description: 'The Avenger\'s power reflects your guilt.',
      triggersAt: 'start',
      effect: {
        type: 'buff',
        target: 'boss',
        power: 0, // Calculated from guilt score
        scaling: 'player_guilt_score',
      },
      counterplay: 'Live righteously before this fight, or reduce guilt during Visions',
    },
  ],

  playerLimit: { min: 1, max: 4, recommended: 3 },
  scaling: { healthPerPlayer: 50, damagePerPlayer: 18 },

  guaranteedDrops: [
    { itemId: 'wraths-hollow-memento', name: 'Memento', rarity: 'rare', quantity: 1 },
  ],
  lootTable: [
    {
      itemId: 'medicine-bundle',
      name: 'Medicine Bundle',
      description: 'Blessed by the spirits',
      rarity: 'epic',
      dropChance: 0.35,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],

  goldReward: { min: 2500, max: 4000 },
  experienceReward: 5500,

  achievements: ['avenger_calmed', 'wrath_resolved', 'guilt_absolved'], // Phase 19.5: New achievement
  titles: ['Peace Maker', 'Wrath Calmer', 'Redeemed'], // Phase 19.5: New title
  difficulty: 7,
  canFlee: true,
  fleeConsequence: 'The Avenger lets you go - running only delays judgment',
};

export const UNDEAD_PRIEST: BossEncounter = {
  id: 'boss_undead_priest',
  name: 'Father Maldonado',
  title: 'The Corrupted Shepherd',
  category: BossCategory.COSMIC_HORROR,
  tier: BossTier.EPIC,
  level: 41,

  description: 'The head priest of Mission San Muerte, corrupted by what he tried to fight.',
  backstory:
    'Father Maldonado was a good man who came to save souls. When he discovered the ancient evil ' +
    'beneath the mission, he tried to seal it. He failed. Now he serves the very thing he opposed.',
  defeatDialogue: '"Forgive me, Lord... I was not strong enough..."',
  victoryNarrative:
    'Father Maldonado crumbles, his corrupted form finally at rest. A faint golden light ' +
    'surrounds his remains - perhaps absolution, even now.',

  location: 'Mission San Muerte - Chapel',
  spawnConditions: [
    { type: BossSpawnConditionType.LEVEL, value: 40, description: 'Level 40+' },
  ],
  respawnCooldown: 48,

  health: 9000,
  damage: 130,
  defense: 55,
  criticalChance: 0.18,
  evasion: 0.12,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'False Blessing',
      description: 'The priest still tries to perform his duties, twisted.',
      dialogue: '"Come, child. Receive the blessing of... the true god..."',
      abilities: ['corrupted_blessing', 'dark_sermon', 'summon_congregation'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 45,
      name: 'True Form',
      description: 'The corruption fully manifests.',
      dialogue: '"The old god RISES! Bow before the FIRST TRUTH!"',
      abilities: ['unholy_rite', 'blood_communion', 'final_sermon'],
      modifiers: [
        { type: 'damage', multiplier: 1.5, description: '+50% damage' },
      ],
    },
  ],

  abilities: [
    {
      id: 'corrupted_blessing',
      name: 'Corrupted Blessing',
      description: 'A blessing that burns',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 100,
      damageType: BossDamageType.CORRUPTION,
      effect: {
        type: StatusEffect.CORRUPTION,
        duration: 3,
        power: 15,
        stackable: true,
        maxStacks: 4,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Counter with true faith',
      priority: 7,
      targetType: 'single',
    },
    {
      id: 'dark_sermon',
      name: 'Dark Sermon',
      description: 'Words that twist the mind',
      type: BossAbilityType.AOE,
      cooldown: 6,
      damage: 80,
      damageType: BossDamageType.PSYCHIC,
      effect: {
        type: StatusEffect.CONFUSION,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Recite true scripture to counter',
      priority: 6,
      targetType: 'all',
    },
    {
      id: 'summon_congregation',
      name: 'Summon Congregation',
      description: 'The corrupted faithful answer',
      type: BossAbilityType.SUMMON,
      cooldown: 8,
      avoidable: false,
      priority: 5,
      targetType: 'all',
    },
    {
      id: 'unholy_rite',
      name: 'Unholy Rite',
      description: 'A perversion of sacred ceremony',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 160,
      damageType: BossDamageType.CORRUPTION,
      avoidable: true,
      avoidMechanic: 'Interrupt with holy items',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'blood_communion',
      name: 'Blood Communion',
      description: 'Heals by consuming the congregation',
      type: BossAbilityType.HEAL,
      cooldown: 10,
      avoidable: false,
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'final_sermon',
      name: 'Final Sermon',
      description: 'The ultimate corruption',
      type: BossAbilityType.ULTIMATE,
      cooldown: 12,
      damage: 200,
      damageType: BossDamageType.VOID,
      avoidable: true,
      avoidMechanic: 'The First Bible blocks this attack',
      priority: 10,
      requiresPhase: 2,
      targetType: 'all',
    },
  ],

  weaknesses: [
    { damageType: BossDamageType.DIVINE, multiplier: 2.0, description: 'True faith burns the corruption' },
  ],
  immunities: [BossDamageType.CORRUPTION],

  specialMechanics: [
    {
      id: 'redeem_priest',
      name: 'Redeem Father Maldonado',
      description: 'Use holy items to break the corruption\'s hold',
      type: 'puzzle',
      instructions: 'Use The First Bible or San Muerte Rosary during Final Sermon',
      successReward: 'Father Maldonado helps seal the crypt',
      failureConsequence: 'Must destroy him completely',
    },
    // Phase 19.5: Corrupted Sacraments Mechanic
    {
      id: 'corrupted_sacraments',
      name: 'Corrupted Sacraments',
      description: 'Four corrupted altars activate based on your hand\'s dominant suit.',
      type: 'unique',
      instructions:
        '4 Altars in the chapel are activated by the dominant suit in your hand: ' +
        'SPADES: Binding Confession (root 1 turn). ' +
        'HEARTS: Dark Communion (priest heals 5%). ' +
        'CLUBS: Final Unction (double damage that round). ' +
        'DIAMONDS: False Baptism (corruption DoT).',
      successReward: 'Avoid triggering harmful altars',
      failureConsequence: 'Altars empower the priest or harm you',
    },
    {
      id: 'altar_purification',
      name: 'Altar Purification',
      description: 'Purify altars to weaken the priest\'s True Form.',
      type: 'unique',
      instructions:
        'Use "Target Altar" action: Draw a hand with matching suit to purify that altar. ' +
        'Purify all 4 = weakened True Form phase (priest at 60% power). ' +
        'Monochrome hands (all black or all red) deal +30% damage.',
    },
  ],

  environmentEffects: [
    // Phase 19.5: Altar System
    {
      id: 'altar_activation',
      name: 'Corrupted Altar',
      description: 'Your hand\'s dominant suit activates a corrupted altar.',
      triggersAt: 'periodic',
      interval: 1, // Every round
      effect: {
        type: 'debuff', // Triggers altar mechanic based on dominant suit
        target: 'player',
        power: 0,
        statusEffect: 'altar_trigger',
      },
      counterplay: 'Balance your suits or purify altars with the Target Altar action',
    },
    {
      id: 'spades_altar',
      name: 'Altar of Confession',
      description: 'SPADES hands trigger Binding Confession.',
      triggersAt: 'periodic',
      interval: 1,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 0,
        statusEffect: 'root', // Root 1 turn
      },
      duration: 1,
      counterplay: 'Avoid SPADES-heavy hands or purify this altar',
    },
    {
      id: 'hearts_altar',
      name: 'Altar of Communion',
      description: 'HEARTS hands trigger Dark Communion.',
      triggersAt: 'periodic',
      interval: 1,
      effect: {
        type: 'heal',
        target: 'boss',
        power: 5, // Heals priest 5%
      },
      counterplay: 'Avoid HEARTS-heavy hands or purify this altar',
    },
    {
      id: 'clubs_altar',
      name: 'Altar of Unction',
      description: 'CLUBS hands trigger Final Unction.',
      triggersAt: 'periodic',
      interval: 1,
      effect: {
        type: 'buff', // Damage multiplier
        target: 'player',
        power: 200, // 200% damage = double
      },
      duration: 1,
      counterplay: 'Use CLUBS strategically for massive damage, but risky',
    },
    {
      id: 'diamonds_altar',
      name: 'Altar of Baptism',
      description: 'DIAMONDS hands trigger False Baptism.',
      triggersAt: 'periodic',
      interval: 1,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 15, // Corruption DoT
        statusEffect: 'corruption',
        stackable: true,
        maxStacks: 5,
      },
      duration: 3,
      counterplay: 'Avoid DIAMONDS-heavy hands or purify this altar',
    },
  ],

  playerLimit: { min: 1, max: 4, recommended: 3 },
  scaling: { healthPerPlayer: 45, damagePerPlayer: 15 },

  guaranteedDrops: [
    { itemId: 'san-muerte-rosary', name: 'San Muerte Rosary', rarity: 'epic', quantity: 1 },
  ],
  lootTable: [],

  goldReward: { min: 2000, max: 3500 },
  experienceReward: 5000,

  achievements: ['priest_redeemed', 'corruption_purged', 'altar_master'], // Phase 19.5: New achievement
  titles: ['Redeemer', 'Corruption Cleanser', 'Sanctifier'], // Phase 19.5: New title
  difficulty: 7,
  canFlee: true,
  fleeConsequence: 'The chapel doors seal behind you as you flee',
};

// =============================================================================
// LEGENDARY BOUNTY BOSSES - Phase 19.5
// Multi-phase bounty targets with unique Destiny Deck mechanics
// =============================================================================

export const JESSE_JAMES: BossEncounter = {
  id: 'boss_jesse_james',
  name: 'Jesse James',
  title: 'The Immortal Outlaw',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.EPIC,
  level: 38,

  description: 'The most famous outlaw in American history - neither fully alive nor fully dead.',
  backstory:
    'Jesse Woodson James was shot by Bob Ford in 1882. Or so the story goes. ' +
    'Sustained by the power of his own legend, Jesse exists in a state between life and death. ' +
    'He plays mind games with his pursuers, bluffing and deceiving until they doubt their own senses.',
  defeatDialogue: '"Tell them Jesse James is dead. Again."',
  victoryNarrative:
    'Jesse tips his hat as he fades. Was he ever really there? The legend persists, ' +
    'regardless of what happened in this canyon today.',

  location: 'Canyon Hideout',
  spawnConditions: [
    { type: BossSpawnConditionType.QUEST, value: 'bounty:jesse-james-confrontation', description: 'Quest active' },
  ],
  respawnCooldown: 72,

  health: 7500,
  damage: 110,
  defense: 45,
  criticalChance: 0.25,
  evasion: 0.20,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Bluff',
      description: 'Jesse tests you with mind games.',
      dialogue: '"Let\'s see if you\'re smarter than Pat Garrett. He thought he killed me too."',
      abilities: ['quick_draw', 'bluff_attack', 'mirror_image'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 40,
      name: 'The Real Deal',
      description: 'Jesse drops the games and fights for real.',
      dialogue: '"Alright, partner. You earned this. Let\'s dance."',
      abilities: ['legendary_shot', 'gang_call', 'last_stand'],
      modifiers: [
        { type: 'damage', multiplier: 1.4, description: '+40% damage' },
        { type: 'evasion', multiplier: 1.3, description: '+30% evasion' },
      ],
    },
  ],

  abilities: [
    {
      id: 'quick_draw',
      name: 'Quick Draw',
      description: 'Lightning fast shot',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 90,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Draw faster with high-rank hands',
      priority: 7,
      targetType: 'single',
    },
    {
      id: 'bluff_attack',
      name: 'Jesse\'s Bluff',
      description: 'Jesse claims an attack type - is he telling the truth?',
      type: BossAbilityType.DEBUFF,
      cooldown: 2,
      avoidable: true,
      avoidMechanic: 'Call his bluff with the right cards',
      priority: 8,
      targetType: 'single',
    },
    {
      id: 'mirror_image',
      name: 'Mirror Image',
      description: 'Creates illusory copies',
      type: BossAbilityType.BUFF,
      cooldown: 6,
      avoidable: false,
      priority: 6,
      targetType: 'single',
    },
    {
      id: 'legendary_shot',
      name: 'Legendary Shot',
      description: 'The shot that made him famous',
      type: BossAbilityType.DAMAGE,
      cooldown: 5,
      damage: 180,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Only avoidable with Pair+ hands',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'gang_call',
      name: 'Call the Gang',
      description: 'Summons James Gang members',
      type: BossAbilityType.SUMMON,
      cooldown: 8,
      avoidable: false,
      priority: 5,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'last_stand',
      name: 'Last Stand',
      description: 'Desperate final assault',
      type: BossAbilityType.ULTIMATE,
      cooldown: 10,
      damage: 220,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Royal Flush causes instant surrender',
      priority: 10,
      requiresPhase: 2,
      targetType: 'all',
    },
  ],

  weaknesses: [
    { damageType: BossDamageType.DIVINE, multiplier: 1.3, description: 'Truth pierces deception' },
  ],
  immunities: [BossDamageType.PSYCHIC],

  specialMechanics: [
    {
      id: 'deception_duel',
      name: 'The Deception Duel',
      description: 'Jesse plays mind games during combat.',
      type: 'unique',
      instructions:
        'Every 2 rounds: "Jesse\'s Bluff" - he claims an attack type. ' +
        'Player must draw cards to "call the bluff" or "fold". ' +
        'Call correctly: Jesse takes 50% more damage next round. ' +
        'Call incorrectly: Player takes 30% more damage. ' +
        'Fold: No bonus/penalty, safe play.',
      successReward: 'Calling bluffs correctly devastates Jesse',
      failureConsequence: 'Wrong calls hurt you badly',
    },
    {
      id: 'bluff_detection',
      name: 'Reading Jesse',
      description: 'Certain hands help detect bluffs.',
      type: 'unique',
      instructions:
        'SPADES reveal Jesse\'s true intentions (+25% call accuracy). ' +
        'HEARTS let you read his emotions (shows bluff probability). ' +
        'Pair+ beats his bluff automatically. ' +
        'Royal Flush: Jesse surrenders ("You\'re better than me, partner").',
    },
  ],

  environmentEffects: [
    {
      id: 'bluff_round',
      name: 'Jesse\'s Bluff',
      description: 'Jesse claims an attack type every 2 rounds.',
      triggersAt: 'periodic',
      interval: 2,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 0,
        statusEffect: 'bluff_active',
      },
      counterplay: 'Call or fold based on your cards',
    },
  ],

  playerLimit: { min: 1, max: 2, recommended: 1 },
  scaling: { healthPerPlayer: 40, damagePerPlayer: 15 },

  guaranteedDrops: [
    { itemId: 'jesses-saddlebag', name: 'Jesse\'s Saddlebag', rarity: 'epic', quantity: 1 },
  ],
  lootTable: [],

  goldReward: { min: 2500, max: 4000 },
  experienceReward: 4500,

  achievements: ['jesse_called', 'master_bluffer', 'legend_hunter'],
  titles: ['Bluff Caller', 'Legend Hunter'],
  difficulty: 6,
  canFlee: true,
  fleeConsequence: 'Jesse escapes to rob another day',
};

export const DOC_HOLLIDAY: BossEncounter = {
  id: 'boss_doc_holliday',
  name: 'Doc Holliday',
  title: 'The Huckleberry',
  category: BossCategory.OUTLAW_LEGEND,
  tier: BossTier.EPIC,
  level: 41,

  description: 'The deadliest gambler in the West - still playing even after death.',
  backstory:
    'John Henry "Doc" Holliday died of tuberculosis in 1887. Yet here he sits, pale as death, ' +
    'coughing blood, dealing cards. He knows things now - things from beyond. ' +
    'He offers wisdom to those who can beat him at his own game.',
  defeatDialogue: '"This is funny..." *coughs* "...I always said I\'d die with my boots on."',
  victoryNarrative:
    'Doc tips his hat, cards scattering like leaves. "I\'m your huckleberry," he whispers, ' +
    'and fades into the smoke of his final cigar.',

  location: 'Private Gambling Club',
  spawnConditions: [
    { type: BossSpawnConditionType.QUEST, value: 'bounty:doc-holliday-choice', description: 'Quest active' },
  ],
  respawnCooldown: 72,

  health: 8000,
  damage: 100,
  defense: 40,
  criticalChance: 0.30,
  evasion: 0.15,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'The Game',
      description: 'Doc deals cards and trades shots.',
      dialogue: '"I know why you\'re here. Let\'s make it interesting."',
      abilities: ['card_throw', 'poker_round', 'consumptive_cough'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 35,
      name: 'All In',
      description: 'Doc pushes all his chips to the center.',
      dialogue: '"All in, friend. Let\'s see what you\'ve got."',
      abilities: ['dead_mans_hand', 'final_draw', 'huckleberry'],
      modifiers: [
        { type: 'damage', multiplier: 1.5, description: '+50% damage' },
        { type: 'evasion', multiplier: 1.3, description: '+30% evasion (deadly accuracy)' },
      ],
    },
  ],

  abilities: [
    {
      id: 'card_throw',
      name: 'Card Throw',
      description: 'Razor-sharp playing cards',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 70,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Match his suit to deflect',
      priority: 6,
      targetType: 'single',
    },
    {
      id: 'poker_round',
      name: 'Poker Round',
      description: 'Combat pauses for a hand of poker',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 3,
      avoidable: false,
      priority: 9,
      targetType: 'single',
    },
    {
      id: 'consumptive_cough',
      name: 'Consumptive Cough',
      description: 'Doc\'s illness weakens him but frightens foes',
      type: BossAbilityType.DEBUFF,
      cooldown: 5,
      effect: {
        type: StatusEffect.FEAR,
        duration: 2,
        power: 1,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Stand your ground',
      priority: 4,
      targetType: 'all',
    },
    {
      id: 'dead_mans_hand',
      name: 'Dead Man\'s Hand',
      description: 'Aces and Eights - the hand that killed Wild Bill',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 0, // Triggers on specific card draw
      damage: 100,
      damageType: BossDamageType.PSYCHIC,
      avoidable: false,
      priority: 10,
      requiresPhase: 2,
      targetType: 'all',
    },
    {
      id: 'final_draw',
      name: 'Final Draw',
      description: 'One last hand decides everything',
      type: BossAbilityType.ULTIMATE,
      cooldown: 8,
      damage: 200,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Beat his hand to counter',
      priority: 10,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'huckleberry',
      name: 'I\'m Your Huckleberry',
      description: 'Doc\'s signature move',
      type: BossAbilityType.DAMAGE,
      cooldown: 6,
      damage: 160,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Four of a Kind or better',
      priority: 9,
      requiresPhase: 2,
      targetType: 'single',
    },
  ],

  weaknesses: [
    { damageType: BossDamageType.DIVINE, multiplier: 1.2, description: 'Mercy touches his weary soul' },
  ],
  immunities: [],

  specialMechanics: [
    {
      id: 'high_stakes_showdown',
      name: 'High Stakes Showdown',
      description: 'Full poker duel with combat stakes.',
      type: 'unique',
      instructions:
        'Combat pauses every 3 rounds for a poker hand. ' +
        'Best hand wins the "pot" (combat advantage). ' +
        'Player by 1 rank: +15% damage for 2 rounds. ' +
        'Player by 2+ ranks: Doc skips his next attack. ' +
        'Tie: "Push" - both heal 5%. ' +
        'Doc by 1 rank: Doc gains +15% damage. ' +
        'Doc by 2+ ranks: Player\'s next hand capped at Three of a Kind.',
      successReward: 'Winning poker rounds gives major combat advantages',
      failureConsequence: 'Losing poker rounds empowers Doc',
    },
    {
      id: 'special_hands',
      name: 'Legendary Hands',
      description: 'Certain hands trigger special events.',
      type: 'unique',
      instructions:
        'Dead Man\'s Hand (Aces & Eights): Both take 100 damage, Doc coughs blood (TB reference). ' +
        'Four Aces: Doc respects you - offers peaceful resolution even mid-combat. ' +
        'Royal Flush: Instant victory, Doc tips his hat and walks away.',
    },
  ],

  environmentEffects: [
    {
      id: 'poker_stakes',
      name: 'Poker Round',
      description: 'Every 3 rounds, a poker hand is played.',
      triggersAt: 'periodic',
      interval: 3,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 0,
        statusEffect: 'poker_round_active',
      },
      counterplay: 'Draw the best hand you can',
    },
  ],

  playerLimit: { min: 1, max: 2, recommended: 1 },
  scaling: { healthPerPlayer: 45, damagePerPlayer: 12 },

  guaranteedDrops: [
    { itemId: 'docs-cards', name: 'Doc\'s Cards', rarity: 'epic', quantity: 1 },
  ],
  lootTable: [],

  goldReward: { min: 2200, max: 3800 },
  experienceReward: 5000,

  achievements: ['doc_beaten', 'poker_master', 'huckleberry_found'],
  titles: ['Card Sharp', 'Huckleberry'],
  difficulty: 7,
  canFlee: true,
  fleeConsequence: 'Doc lets you go - he has all eternity to wait',
};

export const GHOST_RIDER_RISING_MOON: BossEncounter = {
  id: 'boss_ghost_rider',
  name: 'Rising Moon',
  title: 'The Ghost Rider',
  category: BossCategory.COSMIC_HORROR,
  tier: BossTier.EPIC,
  level: 43,

  description: 'A spectral warrior seeking justice for atrocities committed against his people.',
  backstory:
    'Rising Moon was a Nahi warrior whose village was massacred by cavalry in 1867. ' +
    'He died seeking revenge, and death did not stop him. His remains were disturbed, ' +
    'preventing his spirit from resting. Now he hunts the descendants of his killers.',
  defeatDialogue: '"At last... peace..."',
  victoryNarrative:
    'Rising Moon\'s spectral form wavers. Whether through combat or compassion, ' +
    'the wronged spirit finally finds release from his eternal hunt.',

  location: 'Disturbed Burial Site',
  spawnConditions: [
    { type: BossSpawnConditionType.QUEST, value: 'bounty:native-raider-justice', description: 'Quest active' },
  ],
  respawnCooldown: 72,

  health: 9000,
  damage: 125,
  defense: 50,
  criticalChance: 0.22,
  evasion: 0.25,

  phases: [
    {
      phaseNumber: 1,
      healthThreshold: 100,
      name: 'Physical Hunt',
      description: 'Rising Moon attacks from the physical realm.',
      dialogue: '"You\'ve come to destroy me. Like they destroyed my people."',
      abilities: ['spirit_arrow', 'phantom_charge', 'war_cry'],
      modifiers: [],
    },
    {
      phaseNumber: 2,
      healthThreshold: 50,
      name: 'Spirit Realm',
      description: 'Rising Moon retreats to the spirit world.',
      dialogue: '"You cannot follow where I go. But I can still reach you."',
      abilities: ['spirit_trail', 'ethereal_strike', 'ancestral_wrath'],
      modifiers: [
        { type: 'evasion', multiplier: 2.0, description: 'Phases between realms' },
      ],
    },
  ],

  abilities: [
    {
      id: 'spirit_arrow',
      name: 'Spirit Arrow',
      description: 'Arrows that burn with spectral fire',
      type: BossAbilityType.DAMAGE,
      cooldown: 2,
      damage: 90,
      damageType: BossDamageType.PSYCHIC,
      avoidable: true,
      avoidMechanic: 'HEARTS hands connect to his pain',
      priority: 7,
      targetType: 'single',
    },
    {
      id: 'phantom_charge',
      name: 'Phantom Charge',
      description: 'Charges through on his spectral horse',
      type: BossAbilityType.DAMAGE,
      cooldown: 4,
      damage: 130,
      damageType: BossDamageType.PHYSICAL,
      avoidable: true,
      avoidMechanic: 'Match his trail to dodge',
      priority: 8,
      targetType: 'all',
    },
    {
      id: 'war_cry',
      name: 'War Cry',
      description: 'A cry of generations of rage',
      type: BossAbilityType.DEBUFF,
      cooldown: 6,
      effect: {
        type: StatusEffect.FEAR,
        duration: 2,
        power: 2,
        stackable: false,
        appliedAt: new Date(),
      },
      avoidable: true,
      avoidMechanic: 'Straight or better stands firm',
      priority: 6,
      targetType: 'all',
    },
    {
      id: 'spirit_trail',
      name: 'Spirit Trail',
      description: 'Leaves a trail through the spirit realm',
      type: BossAbilityType.ENVIRONMENTAL,
      cooldown: 1,
      avoidable: false,
      priority: 9,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'ethereal_strike',
      name: 'Ethereal Strike',
      description: 'Attacks from the spirit realm',
      type: BossAbilityType.DAMAGE,
      cooldown: 3,
      damage: 150,
      damageType: BossDamageType.PSYCHIC,
      avoidable: true,
      avoidMechanic: 'Match 2/3 of his trail suits',
      priority: 8,
      requiresPhase: 2,
      targetType: 'single',
    },
    {
      id: 'ancestral_wrath',
      name: 'Ancestral Wrath',
      description: 'Summons the spirits of his fallen tribe',
      type: BossAbilityType.ULTIMATE,
      cooldown: 10,
      damage: 200,
      damageType: BossDamageType.PSYCHIC,
      avoidable: true,
      avoidMechanic: 'Flush of any suit achieves synchronization',
      priority: 10,
      requiresPhase: 2,
      targetType: 'all',
    },
  ],

  weaknesses: [
    { damageType: BossDamageType.DIVINE, multiplier: 1.4, description: 'Peace and respect calm him' },
  ],
  immunities: [BossDamageType.PHYSICAL], // In phase 2

  specialMechanics: [
    {
      id: 'spirit_chase',
      name: 'Spirit Chase',
      description: 'Track Rising Moon through the spirit realm.',
      type: 'unique',
      instructions:
        'Combat alternates between Physical and Spirit phases. ' +
        'In Spirit Phase: Standard damage doesn\'t work. ' +
        'Must match the spirit\'s "trail" with card suits. ' +
        'Ghost Rider leaves a 3-card trail each Spirit Phase (e.g., SPADE-HEART-CLUB). ' +
        'Player draws 5 cards, must match at least 2 of 3 suits.',
      successReward: 'Matching suits allows damage in spirit realm',
      failureConsequence: 'Poor matching means no damage and vengeance attacks',
    },
    {
      id: 'trail_matching',
      name: 'Trail Matching Results',
      description: 'How well you match the trail determines damage.',
      type: 'unique',
      instructions:
        'Match 3/3: Full damage, spirit stunned. ' +
        'Match 2/3: Half damage, continue chase. ' +
        'Match 1/3: No damage, spirit attacks with vengeance (+50%). ' +
        'Match 0/3: Spirit escapes, lose 1 round of progress.',
    },
    {
      id: 'suit_bonuses',
      name: 'Suit Synergies',
      description: 'Certain suit combinations have special effects.',
      type: 'unique',
      instructions:
        'HEARTS connect to the spirit\'s pain (bonus damage in Spirit Phase). ' +
        'DIAMONDS anchor you to the physical (bonus damage in Physical Phase). ' +
        'Flush of any suit: Perfect synchronization, double damage. ' +
        'Straight: "Cut off the retreat" - spirit can\'t escape next round.',
    },
  ],

  environmentEffects: [
    {
      id: 'realm_shift',
      name: 'Realm Shift',
      description: 'Combat alternates between physical and spirit realms.',
      triggersAt: 'periodic',
      interval: 2,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 0,
        statusEffect: 'realm_shifting',
      },
      counterplay: 'Match the spirit trail to damage in spirit phase',
    },
    {
      id: 'spirit_trail_effect',
      name: 'Spirit Trail',
      description: 'Rising Moon leaves a 3-card suit trail.',
      triggersAt: 'periodic',
      interval: 1,
      effect: {
        type: 'debuff',
        target: 'player',
        power: 0,
        statusEffect: 'spirit_trail_active',
      },
      counterplay: 'Match 2+ suits in your hand to track him',
    },
  ],

  playerLimit: { min: 1, max: 3, recommended: 2 },
  scaling: { healthPerPlayer: 50, damagePerPlayer: 18 },

  guaranteedDrops: [
    { itemId: 'geronimos-bow', name: 'Geronimo\'s Bow', rarity: 'legendary', quantity: 1 },
  ],
  lootTable: [],

  goldReward: { min: 2800, max: 4500 },
  experienceReward: 5500,

  achievements: ['ghost_rider_peace', 'spirit_tracker', 'wronged_avenged'],
  titles: ['Spirit Walker', 'Peace Bringer', 'Ghost Rider Slayer'],
  difficulty: 8,
  canFlee: true,
  fleeConsequence: 'Rising Moon lets you go - he has other prey to hunt',
};

// =============================================================================
// EXPORTS
// =============================================================================

export const LEGENDS_BOSSES: BossEncounter[] = [
  BILLY_THE_KID,
  JUDGE_ROY_BEAN,
  TOMBSTONE_SPECTER,
  WENDIGO_SPIRIT,
  CONQUISTADOR_RETURN,
];

export const LEGENDS_MINI_BOSSES: BossEncounter[] = [
  MINE_FOREMAN_GHOST,
  WILD_BILL_ECHO,
  THE_AVENGER,
  UNDEAD_PRIEST,
];

export const LEGENDARY_BOUNTY_BOSSES: BossEncounter[] = [
  JESSE_JAMES,
  DOC_HOLLIDAY,
  GHOST_RIDER_RISING_MOON,
];

export const ALL_LEGENDS_BOSSES: BossEncounter[] = [
  ...LEGENDS_BOSSES,
  ...LEGENDS_MINI_BOSSES,
  ...LEGENDARY_BOUNTY_BOSSES,
];

/**
 * Get legends boss by ID
 */
export function getLegendsBossById(bossId: string): BossEncounter | undefined {
  return ALL_LEGENDS_BOSSES.find(b => b.id === bossId);
}

/**
 * Get main story bosses
 */
export function getLegendsMainBosses(): BossEncounter[] {
  return LEGENDS_BOSSES;
}

/**
 * Get ghost town mini-bosses
 */
export function getLegendsMiniBosses(): BossEncounter[] {
  return LEGENDS_MINI_BOSSES;
}

/**
 * Get legendary bounty bosses (Phase 19.5)
 */
export function getLegendaryBountyBosses(): BossEncounter[] {
  return LEGENDARY_BOUNTY_BOSSES;
}
