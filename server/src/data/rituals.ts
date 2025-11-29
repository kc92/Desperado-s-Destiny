/**
 * Rituals Data - Phase 14, Wave 14.1
 *
 * Dark rituals that can be performed in The Scar
 */

import { Ritual, RitualType, ForbiddenKnowledgeType, MadnessType } from '@desperados/shared';

/**
 * All rituals (12+)
 */
export const RITUALS: Ritual[] = [
  {
    id: 'circle_of_salt',
    name: 'Circle of Salt',
    type: RitualType.PROTECTION,
    description: 'Draw a protective circle with consecrated salt to ward off cosmic horrors',
    horrorDescription: 'The salt glows faintly. The whispers quiet. For a moment, you are safe. But they are waiting.',

    location: 'Any location in The Scar',
    components: [
      { itemId: 'consecrated_salt', name: 'Consecrated Salt', quantity: 5, consumed: true, description: 'Salt blessed by a priest' },
      { itemId: 'silver_dust', name: 'Silver Dust', quantity: 1, consumed: true, description: 'Ground silver' }
    ],
    participantsRequired: 1,
    timeRequired: 5,

    energyCost: 15,
    sanityCost: 5,
    corruptionCost: 0,

    difficulty: 2,
    successChance: 0.9,
    canFail: true,
    failureConsequence: {
      type: 'corruption',
      description: 'The circle breaks. Something notices.',
      effect: {
        sanityLoss: 10,
        corruptionGain: 5,
        otherEffect: 'Hostile entity spawns nearby'
      }
    },

    successResults: [
      {
        type: 'protection',
        description: 'A protective barrier forms, repelling cosmic entities',
        effect: {
          duration: 60,
          immuneToCosmicEntities: true,
          corruptionStopped: true,
          radius: 20
        },
        duration: 60
      }
    ],

    cooldown: 6,
    corruptionRequired: 0,
    knowledgeRequired: [],

    origin: 'Ancient protective ritual used by frontier priests',
    discoveryMethod: 'Learn from any priest for 50 gold'
  },

  {
    id: 'summoning_lesser_horror',
    name: 'Summon Lesser Horror',
    type: RitualType.SUMMONING,
    description: 'Call forth a minor cosmic entity to serve you',
    horrorDescription: 'Reality tears. Something comes through. It is small. It is hungry. It will obey. For now.',

    location: 'The Scar - Deep Region',
    components: [
      { itemId: 'void_crystal_shard', name: 'Void Crystal Shard', quantity: 1, consumed: true, description: 'Fragment of void crystal' },
      { itemId: 'blood_offering', name: 'Blood Offering', quantity: 1, consumed: true, description: 'Your own blood' },
      { itemId: 'ritual_candles', name: 'Black Candles', quantity: 7, consumed: true, description: 'Candles made from corpse wax' }
    ],
    participantsRequired: 1,
    timeRequired: 15,

    energyCost: 30,
    sanityCost: 15,
    corruptionCost: 10,

    difficulty: 5,
    successChance: 0.7,
    canFail: true,
    failureConsequence: {
      type: 'summon_hostile',
      description: 'You called something. The wrong something.',
      effect: {
        entitySummoned: 'hostile_void_spawn',
        sanityLoss: 20,
        corruptionGain: 15,
        damage: 50
      }
    },

    successResults: [
      {
        type: 'summon',
        description: 'A lesser horror manifests and obeys your commands',
        effect: {
          entityType: 'lesser_horror',
          duration: 120,
          combat_power: 30,
          loyalty: 0.8
        },
        duration: 120
      }
    ],

    criticalSuccess: [
      {
        type: 'summon',
        description: 'The entity is unusually powerful and completely loyal',
        effect: {
          entityType: 'lesser_horror_elite',
          duration: 180,
          combat_power: 50,
          loyalty: 1.0
        },
        duration: 180
      }
    ],

    cooldown: 24,
    corruptionRequired: 30,
    knowledgeRequired: [ForbiddenKnowledgeType.SUMMONING],

    origin: 'Discovered in the Black Grimoire',
    discoveryMethod: 'Read the Black Grimoire (found in The Scar)'
  },

  {
    id: 'binding_ritual',
    name: 'Ritual of Binding',
    type: RitualType.BINDING,
    description: 'Trap a cosmic entity in a prison of will and silver',
    horrorDescription: 'You speak the Words. Reality constricts. The entity screams. It is bound. It will not forgive.',

    location: 'Any location',
    components: [
      { itemId: 'silver_chains', name: 'Silver Chains', quantity: 1, consumed: false, description: 'Chains of pure silver' },
      { itemId: 'binding_sigil', name: 'Binding Sigil', quantity: 1, consumed: true, description: 'Complex magical sigil' },
      { itemId: 'entity_true_name', name: 'Entity\'s True Name', quantity: 1, consumed: true, description: 'The entity\'s true name, written' }
    ],
    participantsRequired: 1,
    timeRequired: 20,

    energyCost: 40,
    sanityCost: 20,
    corruptionCost: 5,

    difficulty: 7,
    successChance: 0.6,
    canFail: true,
    failureConsequence: {
      type: 'backlash',
      description: 'The binding fails. The entity is enraged.',
      effect: {
        sanityLoss: 30,
        corruptionGain: 20,
        damage: 75,
        otherEffect: 'Entity becomes permanently hostile'
      }
    },

    successResults: [
      {
        type: 'power',
        description: 'The entity is bound to your will',
        effect: {
          boundEntity: true,
          canCommand: true,
          duration: -1
        }
      }
    ],

    cooldown: 48,
    corruptionRequired: 40,
    knowledgeRequired: [ForbiddenKnowledgeType.VOID_SPEECH, ForbiddenKnowledgeType.SUMMONING],

    origin: 'Ancient binding technique from the First Age',
    discoveryMethod: 'Learn from the Entity Binder in the Occult Library'
  },

  {
    id: 'revelation_ritual',
    name: 'Ritual of Terrible Revelation',
    type: RitualType.REVELATION,
    description: 'Open your mind to cosmic truth',
    horrorDescription: 'You see. You see EVERYTHING. The universe laid bare. Your place in it. How insignificant. How doomed.',

    location: 'The Observatory',
    components: [
      { itemId: 'mind_opening_herbs', name: 'Mind-Opening Herbs', quantity: 3, consumed: true, description: 'Psychotropic herbs' },
      { itemId: 'star_chart', name: 'Star Chart', quantity: 1, consumed: false, description: 'Map of impossible constellations' },
      { itemId: 'meditation_incense', name: 'Void Incense', quantity: 5, consumed: true, description: 'Incense that opens the third eye' }
    ],
    participantsRequired: 1,
    timeRequired: 30,

    energyCost: 25,
    sanityCost: 40,
    corruptionCost: 20,

    difficulty: 6,
    successChance: 0.7,
    canFail: true,
    failureConsequence: {
      type: 'madness',
      description: 'You see too much. Your mind breaks.',
      effect: {
        sanityLoss: 60,
        corruptionGain: 10,
        madnessGained: MadnessType.DELUSION
      }
    },

    successResults: [
      {
        type: 'knowledge',
        description: 'Forbidden knowledge floods your mind',
        effect: {
          knowledgeGained: 'random_forbidden_knowledge',
          statBonus: { spirit: 10 },
          permanentVision: true
        }
      }
    ],

    criticalSuccess: [
      {
        type: 'knowledge',
        description: 'Perfect clarity. You understand the cosmos.',
        effect: {
          knowledgeGained: 'all_knowledge_one_type',
          statBonus: { spirit: 20, cunning: 10 },
          cosmicAwareness: true
        }
      }
    ],

    cooldown: 72,
    corruptionRequired: 25,
    knowledgeRequired: [],

    origin: 'Used by the Seers of the Void',
    discoveryMethod: 'Complete the quest "Eyes Wide Open"'
  },

  {
    id: 'blood_sacrifice',
    name: 'Blood Sacrifice',
    type: RitualType.SACRIFICE,
    description: 'Sacrifice blood for cosmic power',
    horrorDescription: 'Blood spills. Power rises. The Things Beyond taste it. They are pleased. They grant you a fraction of their might.',

    location: 'The Altar of Sacrifice',
    components: [
      { itemId: 'sacrificial_dagger', name: 'Sacrificial Dagger', quantity: 1, consumed: false, description: 'Ritual dagger' },
      { itemId: 'offering_bowl', name: 'Offering Bowl', quantity: 1, consumed: false, description: 'Stone bowl for blood' }
    ],
    participantsRequired: 1,
    timeRequired: 10,

    energyCost: 20,
    sanityCost: 10,
    corruptionCost: 15,
    goldCost: 0,
    permanentCost: 'Lose 10 max HP permanently',

    difficulty: 4,
    successChance: 0.85,
    canFail: true,
    failureConsequence: {
      type: 'backlash',
      description: 'They reject your offering. They take more.',
      effect: {
        damage: 50,
        sanityLoss: 20,
        corruptionGain: 10,
        otherEffect: 'Lose 20 max HP instead'
      }
    },

    successResults: [
      {
        type: 'power',
        description: 'Cosmic power flows into you',
        effect: {
          statBonus: { combat: 15, spirit: 10 },
          damageBonus: 25,
          duration: 180
        },
        duration: 180
      }
    ],

    cooldown: 24,
    maxUsesPerCharacter: 10,
    corruptionRequired: 35,
    knowledgeRequired: [ForbiddenKnowledgeType.BLOOD_MAGIC],

    origin: 'Ancient ritual from the Blood Cults',
    discoveryMethod: 'Learn from the Blood Priest in the Hidden Temple'
  },

  {
    id: 'banishment',
    name: 'Greater Banishment',
    type: RitualType.BANISHMENT,
    description: 'Banish a cosmic entity back to the void',
    horrorDescription: 'You speak the Counter-Words. Reality closes. The entity is torn away, screaming, back to the dark between stars.',

    location: 'Any location',
    components: [
      { itemId: 'holy_water', name: 'Holy Water', quantity: 5, consumed: true, description: 'Water blessed by a priest' },
      { itemId: 'silver_circle', name: 'Silver Circle', quantity: 1, consumed: false, description: 'Circle of pure silver' },
      { itemId: 'banishment_scroll', name: 'Banishment Scroll', quantity: 1, consumed: true, description: 'Scroll with counter-words' }
    ],
    participantsRequired: 1,
    timeRequired: 15,

    energyCost: 35,
    sanityCost: 15,
    corruptionCost: -10,

    difficulty: 7,
    successChance: 0.65,
    canFail: true,
    failureConsequence: {
      type: 'backlash',
      description: 'The entity resists. It is very angry.',
      effect: {
        damage: 100,
        sanityLoss: 25,
        otherEffect: 'Entity gains power'
      }
    },

    successResults: [
      {
        type: 'power',
        description: 'The entity is banished back to the void',
        effect: {
          entityBanished: true,
          corruptionReduction: 10,
          sanityRestoration: 20
        }
      }
    ],

    cooldown: 48,
    corruptionRequired: 0,
    knowledgeRequired: [ForbiddenKnowledgeType.BANISHMENT],

    origin: 'Developed by the Order of the Silver Dawn',
    discoveryMethod: 'Learn from Sister Abigail at the Church'
  },

  {
    id: 'communion_ritual',
    name: 'Communion with the Beyond',
    type: RitualType.COMMUNION,
    description: 'Speak directly with cosmic entities',
    horrorDescription: 'You open your mind. They enter. Their thoughts become yours. Your thoughts become... different.',

    location: 'The Communication Chamber',
    components: [
      { itemId: 'communication_crystal', name: 'Communication Crystal', quantity: 1, consumed: false, description: 'Crystal attuned to the void' },
      { itemId: 'mind_link_herbs', name: 'Mind-Link Herbs', quantity: 3, consumed: true, description: 'Herbs that open telepathic channels' },
      { itemId: 'protective_sigils', name: 'Protective Sigils', quantity: 3, consumed: true, description: 'To protect your mind' }
    ],
    participantsRequired: 1,
    timeRequired: 20,

    energyCost: 30,
    sanityCost: 25,
    corruptionCost: 15,

    difficulty: 6,
    successChance: 0.7,
    canFail: true,
    failureConsequence: {
      type: 'madness',
      description: 'The contact overwhelms you. They are too much.',
      effect: {
        sanityLoss: 40,
        corruptionGain: 20,
        madnessGained: MadnessType.DELUSION,
        otherEffect: 'Entity learns your thoughts'
      }
    },

    successResults: [
      {
        type: 'knowledge',
        description: 'You commune successfully. Secrets are shared.',
        effect: {
          entityDialogue: true,
          bargainOpportunity: true,
          knowledgeGained: 'entity_specific'
        }
      }
    ],

    cooldown: 72,
    corruptionRequired: 45,
    knowledgeRequired: [ForbiddenKnowledgeType.VOID_SPEECH],

    origin: 'Technique used by the Void Listeners',
    discoveryMethod: 'Find the Communion Chamber in The Scar'
  },

  {
    id: 'flesh_transformation',
    name: 'Ritual of Flesh Transformation',
    type: RitualType.TRANSFORMATION,
    description: 'Reshape your body using cosmic power',
    horrorDescription: 'Flesh melts. Bones crack. You scream. But you emerge... changed. Better? Different? No longer entirely human.',

    location: 'The Flesh Laboratory',
    components: [
      { itemId: 'transformation_serum', name: 'Transformation Serum', quantity: 1, consumed: true, description: 'Alchemical body modifier' },
      { itemId: 'flesh_catalyst', name: 'Flesh Catalyst', quantity: 3, consumed: true, description: 'Accelerates mutation' },
      { itemId: 'stabilization_runes', name: 'Stabilization Runes', quantity: 5, consumed: true, description: 'Prevents total dissolution' }
    ],
    participantsRequired: 1,
    timeRequired: 45,

    energyCost: 50,
    sanityCost: 35,
    corruptionCost: 30,
    permanentCost: 'Permanent physical mutation',

    difficulty: 8,
    successChance: 0.6,
    canFail: true,
    failureConsequence: {
      type: 'corruption',
      description: 'The transformation goes wrong. Horribly wrong.',
      effect: {
        damage: 100,
        sanityLoss: 50,
        corruptionGain: 40,
        otherEffect: 'Random horrible mutation'
      }
    },

    successResults: [
      {
        type: 'transformation',
        description: 'Your body transforms as intended',
        effect: {
          chosenMutation: true,
          statBonus: { combat: 20 },
          newAbility: true
        }
      }
    ],

    cooldown: 168,
    maxUsesPerCharacter: 5,
    corruptionRequired: 60,
    knowledgeRequired: [ForbiddenKnowledgeType.BLOOD_MAGIC, ForbiddenKnowledgeType.REALITY_SHAPING],

    origin: 'Developed by the Flesh Sculptors',
    discoveryMethod: 'Complete the quest "Reshaping Reality"'
  },

  {
    id: 'time_loop',
    name: 'Create Time Loop',
    type: RitualType.PROTECTION,
    description: 'Create a localized time loop for protection',
    horrorDescription: 'Time folds. A moment repeats. You are trapped. But so is everything else. Perfect safety. Perfect prison.',

    location: 'The Temporal Anchor Point',
    components: [
      { itemId: 'temporal_crystal', name: 'Temporal Crystal', quantity: 1, consumed: true, description: 'Crystal that holds time' },
      { itemId: 'clock_parts', name: 'Ancient Clock Parts', quantity: 7, consumed: true, description: 'From a clock that stopped' },
      { itemId: 'paradox_resolver', name: 'Paradox Resolver', quantity: 1, consumed: true, description: 'Prevents timeline collapse' }
    ],
    participantsRequired: 1,
    timeRequired: 30,

    energyCost: 45,
    sanityCost: 30,
    corruptionCost: 25,

    difficulty: 9,
    successChance: 0.5,
    canFail: true,
    failureConsequence: {
      type: 'reality_tear',
      description: 'Time breaks. Past, present, future collide.',
      effect: {
        sanityLoss: 50,
        corruptionGain: 30,
        damage: 80,
        otherEffect: 'Temporal anomaly persists'
      }
    },

    successResults: [
      {
        type: 'protection',
        description: 'A time loop forms around you',
        effect: {
          duration: 30,
          immuneToAllDamage: true,
          cannotAct: true,
          cannotBeTargeted: true
        },
        duration: 30
      }
    ],

    cooldown: 168,
    corruptionRequired: 70,
    knowledgeRequired: [ForbiddenKnowledgeType.TIME_SIGHT, ForbiddenKnowledgeType.REALITY_SHAPING],

    origin: 'Discovered in the ruins of the Timekeepers',
    discoveryMethod: 'Solve the Temporal Paradox quest chain'
  },

  {
    id: 'soul_transfer',
    name: 'Soul Transfer Ritual',
    type: RitualType.TRANSFORMATION,
    description: 'Transfer your soul to a new body',
    horrorDescription: 'Your soul tears free. You see your body fall. You float. You find a new vessel. You enter. You are... someone else now.',

    location: 'The Soul Forge',
    components: [
      { itemId: 'soul_gem', name: 'Soul Gem', quantity: 1, consumed: false, description: 'Gem that holds souls' },
      { itemId: 'target_body', name: 'Target Body', quantity: 1, consumed: true, description: 'The body you will inhabit' },
      { itemId: 'soul_anchor', name: 'Soul Anchor', quantity: 1, consumed: true, description: 'Anchors soul to new body' }
    ],
    participantsRequired: 1,
    timeRequired: 60,

    energyCost: 60,
    sanityCost: 50,
    corruptionCost: 40,
    permanentCost: 'Your original body dies',

    difficulty: 10,
    successChance: 0.4,
    canFail: true,
    failureConsequence: {
      type: 'reality_tear',
      description: 'The transfer fails. Your soul is lost.',
      effect: {
        otherEffect: 'Permanent death. Character deleted.'
      }
    },

    successResults: [
      {
        type: 'transformation',
        description: 'Your soul successfully inhabits the new body',
        effect: {
          bodyChange: true,
          appearanceChange: true,
          memoryRetention: 0.8,
          identityCrisis: true
        }
      }
    ],

    cooldown: 720,
    maxUsesPerCharacter: 3,
    corruptionRequired: 85,
    knowledgeRequired: [
      ForbiddenKnowledgeType.SOUL_SIGHT,
      ForbiddenKnowledgeType.BLOOD_MAGIC,
      ForbiddenKnowledgeType.REALITY_SHAPING
    ],

    origin: 'Forbidden technique of the Soul Thieves',
    discoveryMethod: 'Complete the quest "The Body Snatcher"'
  },

  {
    id: 'void_gate',
    name: 'Open Void Gate',
    type: RitualType.SUMMONING,
    description: 'Open a portal to the void between worlds',
    horrorDescription: 'Reality tears. A door opens. Through it, you see the void. The nothing. The everything. Things are coming through.',

    location: 'The Scar - Void Nexus',
    components: [
      { itemId: 'gate_crystal', name: 'Gate Crystal', quantity: 1, consumed: true, description: 'Crystal that tears reality' },
      { itemId: 'void_anchor', name: 'Void Anchor', quantity: 4, consumed: false, description: 'Anchors gate in place' },
      { itemId: 'reality_stabilizer', name: 'Reality Stabilizer', quantity: 5, consumed: true, description: 'Prevents total collapse' }
    ],
    participantsRequired: 3,
    timeRequired: 45,

    energyCost: 70,
    sanityCost: 40,
    corruptionCost: 50,

    difficulty: 10,
    successChance: 0.5,
    canFail: true,
    failureConsequence: {
      type: 'reality_tear',
      description: 'The gate opens uncontrolled. Everything comes through.',
      effect: {
        sanityLoss: 80,
        corruptionGain: 60,
        damage: 150,
        otherEffect: 'Void breach. Multiple hostile entities spawn.'
      }
    },

    successResults: [
      {
        type: 'power',
        description: 'A stable void gate opens',
        effect: {
          gateOpened: true,
          duration: 60,
          canTravel: true,
          canSummon: true
        },
        duration: 60
      }
    ],

    criticalSuccess: [
      {
        type: 'power',
        description: 'A perfect gate opens to your chosen destination',
        effect: {
          gateOpened: true,
          duration: 120,
          canTravel: true,
          canSummon: true,
          stable: true
        },
        duration: 120
      }
    ],

    cooldown: 168,
    corruptionRequired: 75,
    knowledgeRequired: [
      ForbiddenKnowledgeType.VOID_WALKING,
      ForbiddenKnowledgeType.SUMMONING,
      ForbiddenKnowledgeType.REALITY_SHAPING
    ],

    origin: 'Ancient ritual from before The Scar existed',
    discoveryMethod: 'Find all four fragments of the Gate Codex'
  },

  {
    id: 'invoke_great_old_one',
    name: 'Invoke the Great Old One',
    type: RitualType.SUMMONING,
    description: 'Attempt to contact one of the Great Old Ones',
    horrorDescription: 'You speak the Name. Reality SCREAMS. It HEARS. It LOOKS. At you. Into you. Through you. Pray it finds you interesting.',

    location: 'The Scar - Central Altar',
    components: [
      { itemId: 'elder_sign', name: 'Elder Sign', quantity: 1, consumed: false, description: 'Protection from the Old Ones' },
      { itemId: 'star_stone', name: 'Star Stone', quantity: 1, consumed: true, description: 'Stone that fell from stars' },
      { itemId: 'sacrifice_major', name: 'Major Sacrifice', quantity: 1, consumed: true, description: 'Significant blood offering' },
      { itemId: 'true_name_tablet', name: 'True Name Tablet', quantity: 1, consumed: false, description: 'Tablet with the entity\'s name' }
    ],
    participantsRequired: 5,
    timeRequired: 120,

    energyCost: 100,
    sanityCost: 80,
    corruptionCost: 75,
    goldCost: 1000,
    permanentCost: 'Permanent corruption gain of 25',

    difficulty: 10,
    successChance: 0.3,
    canFail: true,
    failureConsequence: {
      type: 'reality_tear',
      description: 'It came. It is ANGRY. Everyone dies.',
      effect: {
        otherEffect: 'TPK. All participants die. Scar corruption increases by 50.'
      }
    },

    successResults: [
      {
        type: 'knowledge',
        description: 'The Great Old One acknowledges you',
        effect: {
          entityContact: true,
          bargainOpportunity: true,
          cosmicPower: true,
          knowledgeGained: 'ultimate'
        }
      }
    ],

    criticalSuccess: [
      {
        type: 'knowledge',
        description: 'The Great Old One is pleased. It grants a boon.',
        effect: {
          entityContact: true,
          bargainOpportunity: true,
          cosmicPower: true,
          knowledgeGained: 'ultimate',
          artifactGranted: true,
          blessing: 'cosmic_champion'
        }
      }
    ],

    cooldown: 720,
    maxUsesPerCharacter: 1,
    corruptionRequired: 90,
    knowledgeRequired: [
      ForbiddenKnowledgeType.VOID_SPEECH,
      ForbiddenKnowledgeType.SUMMONING,
      ForbiddenKnowledgeType.REALITY_SHAPING,
      ForbiddenKnowledgeType.SOUL_SIGHT
    ],

    origin: 'The most forbidden ritual. Never meant to be performed.',
    discoveryMethod: 'Achieve 90+ corruption and find all Fragments of the Final Knowledge'
  }
];

/**
 * Get ritual by ID
 */
export function getRitualById(id: string): Ritual | undefined {
  return RITUALS.find(r => r.id === id);
}

/**
 * Get rituals by type
 */
export function getRitualsByType(type: RitualType): Ritual[] {
  return RITUALS.filter(r => r.type === type);
}

/**
 * Get rituals available at corruption level
 */
export function getRitualsForCorruption(corruption: number): Ritual[] {
  return RITUALS.filter(r => r.corruptionRequired <= corruption);
}

/**
 * Get rituals that require specific knowledge
 */
export function getRitualsRequiringKnowledge(knowledge: ForbiddenKnowledgeType): Ritual[] {
  return RITUALS.filter(r => r.knowledgeRequired.includes(knowledge));
}
