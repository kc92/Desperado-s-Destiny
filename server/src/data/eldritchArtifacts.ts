/**
 * Eldritch Artifacts Data - Phase 14, Wave 14.1
 *
 * Cursed and powerful items from beyond reality
 */

import { EldritchArtifact, ForbiddenKnowledgeType } from '@desperados/shared';

/**
 * All eldritch artifacts (12+)
 */
export const ELDRITCH_ARTIFACTS: EldritchArtifact[] = [
  {
    id: 'void_crystal',
    name: 'Void Crystal',
    description: 'A perfectly black crystal that seems to absorb light. It feels impossibly heavy and impossibly light at the same time.',
    horrorDescription: 'When you hold it, you can see into the spaces between spaces. The void looks back.',

    abilities: [
      {
        id: 'void_bolt',
        name: 'Void Bolt',
        description: 'Fire a lance of pure nothing that erases what it touches',
        type: 'active',
        energyCost: 15,
        cooldown: 5,
        damage: 75,
        damageType: 'void',
        sanityLoss: 5,
        corruptionGain: 3,
        horrorDescription: 'Reality screams as you tear a hole in existence'
      },
      {
        id: 'void_sight',
        name: 'Void Sight',
        description: 'See through illusions and into other dimensions',
        type: 'active',
        energyCost: 10,
        cooldown: 10,
        sanityLoss: 3,
        corruptionGain: 1,
        horrorDescription: 'You see too much. You see everything. You wish you could unsee.'
      }
    ],

    passiveEffects: [
      {
        id: 'cosmic_awareness',
        name: 'Cosmic Awareness',
        description: 'Always know when reality distortions occur nearby',
        statBonus: { 'spirit': 5 },
        specialEffect: 'Detect all cosmic entities within 100 yards',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 3,
    sanityPerUse: 5,
    permanentCost: {
      type: 'physical_change',
      description: 'Your eyes turn completely black',
      effect: { eyeColor: 'void-black', visionType: 'void-sight' }
    },

    curseEffect: {
      id: 'void_hunger',
      name: 'Void Hunger',
      description: 'The crystal hungers. It feeds on your life force.',
      trigger: 'always',
      effect: {
        type: 'health_drain',
        severity: 5,
        description: 'Lose 5 HP per day while carrying this'
      },
      removable: false
    },

    curseTrigger: 'While equipped',
    canRemove: true,
    origin: 'Found in the deepest part of The Scar, where reality is thinnest',
    entityLinked: 'void_that_hungers',
    acquisition: 'Complete the ritual "Piercing the Veil"',

    corruptionRequired: 40,
    levelRequired: 15,
    knowledgeRequired: [ForbiddenKnowledgeType.VOID_SPEECH],

    rarity: 'abyssal',
    goldValue: 0
  },

  {
    id: 'eye_of_the_deep',
    name: 'Eye of the Deep',
    description: 'A preserved eye the size of a fist. It never blinks. It never stops watching.',
    horrorDescription: 'When you hold it to your forehead, you can see everything. Every secret. Every sin. Every horror. And they can see you.',

    abilities: [
      {
        id: 'true_sight',
        name: 'True Sight',
        description: 'See all hidden things, invisible entities, and lies',
        type: 'active',
        energyCost: 20,
        cooldown: 15,
        buffs: [
          { stat: 'duel_instinct', amount: 50, duration: 10 }
        ],
        sanityLoss: 10,
        corruptionGain: 5,
        horrorDescription: 'You see through everything. Flesh. Stone. Time. Truth.'
      },
      {
        id: 'gaze_of_madness',
        name: 'Gaze of Madness',
        description: 'Force a target to see what you have seen',
        type: 'active',
        energyCost: 25,
        cooldown: 30,
        damage: 0,
        sanityLoss: 15,
        corruptionGain: 8,
        horrorDescription: 'They see. They see too much. They cannot unsee.'
      }
    ],

    passiveEffects: [
      {
        id: 'omniscient_vision',
        name: 'Omniscient Vision',
        description: 'Cannot be ambushed, detect all hidden things',
        statBonus: { 'cunning': 10 },
        specialEffect: 'Immune to surprise attacks',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 5,
    sanityPerUse: 10,
    permanentCost: {
      type: 'physical_change',
      description: 'Your natural eyes cloud over and go blind',
      effect: { naturalVision: 'blind', eldritchVision: true }
    },

    curseEffect: {
      id: 'endless_visions',
      name: 'Endless Visions',
      description: 'You cannot stop seeing. Sleep becomes impossible.',
      trigger: 'always',
      effect: {
        type: 'permanent_insomnia',
        severity: 10,
        description: 'Cannot rest normally. -20 max energy.'
      },
      removable: true,
      removalMethod: 'Destroy the Eye or remove both your natural eyes'
    },

    curseTrigger: 'After first use',
    canRemove: true,
    origin: 'Torn from a Deep One in the drowned catacombs',
    entityLinked: 'dagon',
    acquisition: 'Defeat a Deep One matriarch or trade with the Drowned Merchants',

    corruptionRequired: 50,
    levelRequired: 18,
    knowledgeRequired: [ForbiddenKnowledgeType.SOUL_SIGHT],

    rarity: 'void-touched',
    goldValue: 0
  },

  {
    id: 'tongue_of_stars',
    name: 'Tongue of Stars',
    description: 'A silver amulet in the shape of a speaking mouth. Words shimmer around it.',
    horrorDescription: 'It replaces your tongue while worn. You speak in the language of the cosmos. You cannot lie. You cannot be silent.',

    abilities: [
      {
        id: 'command_reality',
        name: 'Command Reality',
        description: 'Speak truth and make it so',
        type: 'active',
        energyCost: 40,
        cooldown: 60,
        sanityLoss: 20,
        corruptionGain: 10,
        horrorDescription: 'Your words reshape existence. Reality bends. But the cosmos remembers.'
      },
      {
        id: 'speak_true_name',
        name: 'Speak True Name',
        description: 'Learn and speak the true name of any entity, gaining power over it',
        type: 'active',
        energyCost: 30,
        cooldown: 120,
        sanityLoss: 15,
        corruptionGain: 8,
        horrorDescription: 'To know a thing\'s true name is to have power over it. But it also has power over you.'
      }
    ],

    passiveEffects: [
      {
        id: 'cannot_lie',
        name: 'Curse of Truth',
        description: 'You speak only truth. All hear and believe.',
        statBonus: { 'spirit': 15 },
        specialEffect: 'All NPCs believe your words. Cannot lie or deceive.',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 10,
    sanityPerUse: 15,
    permanentCost: {
      type: 'physical_change',
      description: 'Your tongue is replaced by the artifact. You speak in harmonics.',
      effect: { voice: 'harmonic', truthbound: true }
    },

    curseEffect: {
      id: 'compelled_speech',
      name: 'Compelled Speech',
      description: 'You must speak any truth you know when asked directly',
      trigger: 'always',
      effect: {
        type: 'compulsion',
        severity: 10,
        description: 'Cannot refuse to answer direct questions truthfully'
      },
      removable: true,
      removalMethod: 'Cut out your tongue'
    },

    curseTrigger: 'When first equipped',
    canRemove: false,
    origin: 'Gift from the Star Spawn to a prophet who asked too many questions',
    entityLinked: 'azathoth_dreamer',
    acquisition: 'Find in the Observatory after reading the Astronomer\'s Journal',

    corruptionRequired: 60,
    levelRequired: 20,
    knowledgeRequired: [ForbiddenKnowledgeType.VOID_SPEECH, ForbiddenKnowledgeType.REALITY_SHAPING],

    rarity: 'star-forged',
    goldValue: 0
  },

  {
    id: 'heart_of_nothing',
    name: 'Heart of Nothing',
    description: 'A crystallized heart that beats with no rhythm. Each pulse echoes in the void.',
    horrorDescription: 'When implanted, it replaces your heart. You become immortal. You become empty. You become nothing.',

    abilities: [
      {
        id: 'deathless',
        name: 'Deathless',
        description: 'You cannot die. When HP reaches 0, you continue at 1 HP.',
        type: 'passive',
        sanityLoss: 0,
        corruptionGain: 0,
        horrorDescription: 'Death rejects you. You are an affront to the natural order.'
      },
      {
        id: 'drain_life',
        name: 'Drain Life',
        description: 'Steal life force from others to heal yourself',
        type: 'active',
        energyCost: 20,
        cooldown: 10,
        healing: 50,
        sanityLoss: 10,
        corruptionGain: 5,
        horrorDescription: 'Their life becomes yours. Their screams fuel you.'
      }
    ],

    passiveEffects: [
      {
        id: 'undying_body',
        name: 'Undying Body',
        description: 'Immune to disease, poison, aging, and death',
        statBonus: { 'combat': 20 },
        resistanceBonus: { 'poison': 100, 'disease': 100, 'death': 100 },
        specialEffect: 'Cannot die permanently',
        alwaysActive: true
      },
      {
        id: 'empty_inside',
        name: 'Empty Inside',
        description: 'You feel nothing. No joy. No sorrow. Nothing.',
        statBonus: { 'spirit': -20 },
        specialEffect: 'Immune to fear and emotion-based effects',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 0,
    sanityPerUse: 0,
    permanentCost: {
      type: 'soul_damage',
      description: 'Your soul is destroyed. You are an empty vessel.',
      effect: { soul: 'destroyed', emotions: 'none', redemption: 'impossible' }
    },

    curseEffect: {
      id: 'eternal_void',
      name: 'Eternal Void',
      description: 'You are immortal but empty. You cannot feel. You cannot die. You cannot escape.',
      trigger: 'always',
      effect: {
        type: 'soul_destruction',
        severity: 10,
        description: 'Cannot experience emotions. Cannot truly die. Cannot be saved.'
      },
      removable: false
    },

    curseTrigger: 'When implanted',
    canRemove: false,
    origin: 'Created by the Void Surgeons in the Hospital of the Damned',
    entityLinked: 'void_surgeons',
    acquisition: 'Accept the offer of the Void Surgeons after dying 5 times',

    corruptionRequired: 80,
    levelRequired: 25,
    knowledgeRequired: [ForbiddenKnowledgeType.SOUL_SIGHT],

    rarity: 'damned',
    goldValue: 0
  },

  {
    id: 'mask_of_faces',
    name: 'Mask of a Thousand Faces',
    description: 'A pale mask that shows no features. When worn, it shows whatever face the viewer expects to see.',
    horrorDescription: 'It has no face. You have no face. You are everyone. You are no one.',

    abilities: [
      {
        id: 'perfect_disguise',
        name: 'Perfect Disguise',
        description: 'Become anyone you have seen',
        type: 'active',
        energyCost: 15,
        cooldown: 5,
        sanityLoss: 5,
        corruptionGain: 2,
        horrorDescription: 'You wear their face. Their voice. Their memories. Are you still you?'
      },
      {
        id: 'steal_identity',
        name: 'Steal Identity',
        description: 'Permanently steal someone\'s identity, erasing them from existence',
        type: 'active',
        energyCost: 50,
        cooldown: 720,
        sanityLoss: 40,
        corruptionGain: 25,
        horrorDescription: 'They never existed. You were always them. Reality adjusts.'
      }
    ],

    passiveEffects: [
      {
        id: 'faceless',
        name: 'Faceless',
        description: 'No one can remember your true face',
        statBonus: { 'cunning': 15 },
        specialEffect: 'Perfect disguise ability. NPCs forget you immediately.',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 2,
    sanityPerUse: 5,
    permanentCost: {
      type: 'physical_change',
      description: 'Your real face is erased. You have no identity.',
      effect: { face: 'none', identity: 'fluid', self: 'forgotten' }
    },

    curseEffect: {
      id: 'identity_loss',
      name: 'Loss of Self',
      description: 'The more you use it, the less you remember who you were',
      trigger: 'combat',
      effect: {
        type: 'memory_loss',
        severity: 8,
        description: 'Lose memories each time used. Eventually forget yourself entirely.'
      },
      removable: true,
      removalMethod: 'Burn the mask and all mirrors that have seen you'
    },

    curseTrigger: 'After using Steal Identity',
    canRemove: true,
    origin: 'Created by the Identity Thief, a creature that steals faces',
    entityLinked: 'the_faceless_one',
    acquisition: 'Kill the Identity Thief and claim its mask',

    corruptionRequired: 45,
    levelRequired: 12,
    knowledgeRequired: [ForbiddenKnowledgeType.REALITY_SHAPING],

    rarity: 'cursed',
    goldValue: 0
  },

  {
    id: 'bone_flute',
    name: 'Bone Flute of the Screaming Dead',
    description: 'A flute carved from the femur of something that should not have bones. It plays itself at night.',
    horrorDescription: 'Its music calls the dead. They come. They dance. They remember.',

    abilities: [
      {
        id: 'summon_dead',
        name: 'Summon the Dead',
        description: 'Call forth spirits of the dead to fight for you',
        type: 'active',
        energyCost: 25,
        cooldown: 30,
        sanityLoss: 12,
        corruptionGain: 6,
        horrorDescription: 'They rise from grave and memory. They obey. For now.'
      },
      {
        id: 'dirge_of_madness',
        name: 'Dirge of Madness',
        description: 'Play a song that drives all who hear it insane',
        type: 'active',
        energyCost: 35,
        cooldown: 60,
        sanityLoss: 15,
        corruptionGain: 8,
        horrorDescription: 'The song never ends. It echoes in their minds forever.'
      }
    ],

    passiveEffects: [
      {
        id: 'speak_with_dead',
        name: 'Communion with the Dead',
        description: 'Can communicate with spirits',
        statBonus: { 'spirit': 12 },
        specialEffect: 'Communicate with ghosts and undead',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 6,
    sanityPerUse: 12,

    curseEffect: {
      id: 'haunted',
      name: 'Forever Haunted',
      description: 'The dead follow you. They whisper constantly.',
      trigger: 'night',
      effect: {
        type: 'haunting',
        severity: 7,
        description: 'Cannot sleep peacefully. Ghosts appear. -10 max energy.'
      },
      removable: true,
      removalMethod: 'Bury the flute in consecrated ground with a priest\'s blessing'
    },

    curseTrigger: 'Every night at midnight',
    canRemove: true,
    origin: 'Carved by a necromancer from the bones of a dying god',
    entityLinked: 'the_chorus_of_the_dead',
    acquisition: 'Complete the quest "Symphony of Bones"',

    corruptionRequired: 35,
    levelRequired: 14,
    knowledgeRequired: [ForbiddenKnowledgeType.SOUL_SIGHT],

    rarity: 'cursed',
    goldValue: 0
  },

  {
    id: 'clock_of_eternity',
    name: 'Clock of Eternity',
    description: 'A pocket watch that ticks backwards. Time moves strangely around it.',
    horrorDescription: 'It shows you when you will die. The date gets closer every time you look.',

    abilities: [
      {
        id: 'rewind_time',
        name: 'Rewind Time',
        description: 'Undo the last minute of time',
        type: 'active',
        energyCost: 30,
        cooldown: 120,
        sanityLoss: 15,
        corruptionGain: 10,
        horrorDescription: 'Time screams as you tear it backwards. Others remember both timelines.'
      },
      {
        id: 'see_future',
        name: 'Glimpse Tomorrow',
        description: 'See 10 seconds into the future',
        type: 'active',
        energyCost: 20,
        cooldown: 30,
        sanityLoss: 8,
        corruptionGain: 4,
        horrorDescription: 'You see what will be. Can you change it? Should you?'
      }
    ],

    passiveEffects: [
      {
        id: 'time_awareness',
        name: 'Time Awareness',
        description: 'Always know the exact time. Sense time distortions.',
        statBonus: { 'cunning': 10 },
        specialEffect: 'Cannot be surprised. Always act first in combat.',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 10,
    sanityPerUse: 15,
    permanentCost: {
      type: 'stat_loss',
      description: 'Each use ages you by one year',
      effect: { aging: '+1 year per use' }
    },

    curseEffect: {
      id: 'death_clock',
      name: 'Your Death Awaits',
      description: 'You know exactly when you will die. The date gets closer.',
      trigger: 'always',
      effect: {
        type: 'doomed',
        severity: 9,
        description: 'Constant awareness of your death date. Each use brings it closer.'
      },
      removable: true,
      removalMethod: 'Stop the clock at the moment of someone else\'s death'
    },

    curseTrigger: 'When first wound',
    canRemove: true,
    origin: 'Stolen from the Keeper of Hours in the Timeless Library',
    entityLinked: 'chronos_unchained',
    acquisition: 'Complete the temporal paradox quest chain',

    corruptionRequired: 50,
    levelRequired: 17,
    knowledgeRequired: [ForbiddenKnowledgeType.TIME_SIGHT],

    rarity: 'void-touched',
    goldValue: 0
  },

  {
    id: 'lantern_of_souls',
    name: 'Lantern of Lost Souls',
    description: 'A lantern that burns with cold blue flame. Faces scream silently in the fire.',
    horrorDescription: 'It burns souls for fuel. Each flame is a person who no longer exists.',

    abilities: [
      {
        id: 'soul_fire',
        name: 'Soul Fire',
        description: 'Burn a soul to deal massive damage',
        type: 'active',
        energyCost: 20,
        cooldown: 20,
        damage: 100,
        damageType: 'soul',
        sanityLoss: 10,
        corruptionGain: 8,
        horrorDescription: 'The flame hungers. Feed it souls. Feed it everything.'
      },
      {
        id: 'illuminate_truth',
        name: 'Illuminate Truth',
        description: 'The light reveals all deceptions and hidden things',
        type: 'active',
        energyCost: 15,
        cooldown: 15,
        sanityLoss: 5,
        corruptionGain: 3,
        horrorDescription: 'In its light, nothing can hide. Not even yourself.'
      }
    ],

    passiveEffects: [
      {
        id: 'soul_sight',
        name: 'Soul Sight',
        description: 'See the souls of living things',
        statBonus: { 'spirit': 10 },
        specialEffect: 'See through disguises and illusions',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 8,
    sanityPerUse: 10,
    permanentCost: {
      type: 'soul_damage',
      description: 'The lantern slowly consumes your soul to stay lit',
      effect: { soulBurn: '1% per day' }
    },

    curseEffect: {
      id: 'soul_hunger',
      name: 'The Lantern Hungers',
      description: 'Must feed it souls or it feeds on yours',
      trigger: 'always',
      effect: {
        type: 'soul_drain',
        severity: 8,
        description: 'Lose 5 max HP per day unless you kill something'
      },
      removable: true,
      removalMethod: 'Extinguish it with holy water while saying the Prayer of Souls'
    },

    curseTrigger: 'If not used for 3 days',
    canRemove: true,
    origin: 'Created by the Soul Merchants of the Black Market',
    entityLinked: 'the_collector',
    acquisition: 'Purchase from the Soul Market for your firstborn\'s name',

    corruptionRequired: 40,
    levelRequired: 16,
    knowledgeRequired: [ForbiddenKnowledgeType.SOUL_SIGHT],

    rarity: 'damned',
    goldValue: 0
  },

  {
    id: 'book_of_flesh',
    name: 'Book of Flesh',
    description: 'A tome bound in human skin. It bleeds when opened. The pages are made of tattoed flesh.',
    horrorDescription: 'Each page is a person. Each word is a scream. Each spell costs blood.',

    abilities: [
      {
        id: 'blood_magic',
        name: 'Blood Magic',
        description: 'Cast spells using your own blood as fuel',
        type: 'active',
        energyCost: 0,
        cooldown: 5,
        damage: 80,
        damageType: 'blood',
        sanityLoss: 8,
        corruptionGain: 5,
        horrorDescription: 'Your blood becomes power. How much will you spend?'
      },
      {
        id: 'flesh_craft',
        name: 'Flesh Crafting',
        description: 'Reshape flesh, yours or others',
        type: 'active',
        energyCost: 25,
        cooldown: 60,
        sanityLoss: 20,
        corruptionGain: 15,
        horrorDescription: 'Flesh is clay. Bones are suggestions. Pain is irrelevant.'
      }
    ],

    passiveEffects: [
      {
        id: 'blood_sense',
        name: 'Blood Sense',
        description: 'Sense all living things nearby by their blood',
        statBonus: { 'combat': 8 },
        specialEffect: 'Detect all living creatures within 50 yards',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 5,
    sanityPerUse: 8,
    permanentCost: {
      type: 'physical_change',
      description: 'Your veins become visible, pulsing darkly beneath your skin',
      effect: { appearance: 'veined', bloodColor: 'black' }
    },

    curseEffect: {
      id: 'blood_addiction',
      name: 'Blood Addiction',
      description: 'You hunger for blood. Must drink it regularly.',
      trigger: 'combat',
      effect: {
        type: 'addiction',
        severity: 7,
        description: 'Must drink blood once per day or suffer -20 to all stats'
      },
      removable: true,
      removalMethod: 'Burn the book and purge your blood through transfusion'
    },

    curseTrigger: 'After first use of Flesh Crafting',
    canRemove: true,
    origin: 'Written by the Fleshcrafter in human skin',
    entityLinked: 'the_surgeon',
    acquisition: 'Complete the quest "The Surgeon\'s Apprentice"',

    corruptionRequired: 55,
    levelRequired: 19,
    knowledgeRequired: [ForbiddenKnowledgeType.BLOOD_MAGIC],

    rarity: 'abyssal',
    goldValue: 0
  },

  {
    id: 'mirror_of_truth',
    name: 'Mirror of Truth',
    description: 'A hand mirror that shows no reflection. It shows what you truly are.',
    horrorDescription: 'Look into it and see your true self. The monster you are becoming.',

    abilities: [
      {
        id: 'reflection_prison',
        name: 'Reflection Prison',
        description: 'Trap someone in the mirror',
        type: 'active',
        energyCost: 30,
        cooldown: 60,
        sanityLoss: 15,
        corruptionGain: 10,
        horrorDescription: 'They are trapped in glass. Forever looking out. Forever screaming.'
      },
      {
        id: 'true_self',
        name: 'See True Self',
        description: 'See anyone\'s true nature and secrets',
        type: 'active',
        energyCost: 15,
        cooldown: 20,
        sanityLoss: 8,
        corruptionGain: 4,
        horrorDescription: 'You see what they hide. You see their sins. You see their truth.'
      }
    ],

    passiveEffects: [
      {
        id: 'truth_sense',
        name: 'Truth Sense',
        description: 'Know when anyone lies to you',
        statBonus: { 'cunning': 12 },
        specialEffect: 'Cannot be deceived by lies or illusions',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 4,
    sanityPerUse: 8,
    permanentCost: {
      type: 'max_sanity_reduction',
      description: 'Each use reduces max sanity by 1 as you see too much truth',
      effect: { maxSanityLoss: 1 }
    },

    curseEffect: {
      id: 'truth_burden',
      name: 'Burden of Truth',
      description: 'You cannot look away from truth, no matter how horrible',
      trigger: 'always',
      effect: {
        type: 'compulsion',
        severity: 6,
        description: 'Must investigate all deceptions. Cannot ignore lies.'
      },
      removable: true,
      removalMethod: 'Break the mirror, but you\'ll remain trapped in your reflection'
    },

    curseTrigger: 'After first use',
    canRemove: true,
    origin: 'Created by the Truth Seeker who went mad from too much knowledge',
    entityLinked: 'the_all_seeing',
    acquisition: 'Find in the ruins of the Truth Seeker\'s tower',

    corruptionRequired: 30,
    levelRequired: 13,
    knowledgeRequired: [ForbiddenKnowledgeType.SOUL_SIGHT],

    rarity: 'cursed',
    goldValue: 0
  },

  {
    id: 'crown_of_whispers',
    name: 'Crown of Whispers',
    description: 'A circlet of tarnished silver. Voices whisper from it constantly.',
    horrorDescription: 'Every thought ever thought. Every secret ever kept. Every truth ever hidden. They all whisper to you.',

    abilities: [
      {
        id: 'mind_read',
        name: 'Read Thoughts',
        description: 'Hear the surface thoughts of anyone nearby',
        type: 'active',
        energyCost: 15,
        cooldown: 10,
        sanityLoss: 5,
        corruptionGain: 3,
        horrorDescription: 'Their thoughts become yours. Can you tell them apart?'
      },
      {
        id: 'mental_domination',
        name: 'Dominate Mind',
        description: 'Take control of someone\'s mind completely',
        type: 'active',
        energyCost: 40,
        cooldown: 120,
        sanityLoss: 25,
        corruptionGain: 18,
        horrorDescription: 'They are a puppet. You are the puppeteer. Are you still you?'
      }
    ],

    passiveEffects: [
      {
        id: 'whisper_network',
        name: 'Whisper Network',
        description: 'Hear whispers and rumors from across the region',
        statBonus: { 'cunning': 15, 'spirit': -10 },
        specialEffect: 'Know all rumors and news instantly',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 3,
    sanityPerUse: 5,
    permanentCost: {
      type: 'max_sanity_reduction',
      description: 'The constant whispers erode your sanity',
      effect: { maxSanityLoss: 20 }
    },

    curseEffect: {
      id: 'endless_whispers',
      name: 'The Whispers Never Stop',
      description: 'Constant voices in your head. You can never have silence.',
      trigger: 'always',
      effect: {
        type: 'madness',
        severity: 8,
        description: 'Permanent noise in your mind. -15 to spirit. Cannot meditate or rest fully.'
      },
      removable: true,
      removalMethod: 'Destroy the crown and undergo ritual silence for 7 days'
    },

    curseTrigger: 'When first worn',
    canRemove: true,
    origin: 'Worn by the Whispering King before his madness',
    entityLinked: 'the_mind_beyond',
    acquisition: 'Complete the quest "Silence the King"',

    corruptionRequired: 45,
    levelRequired: 16,
    knowledgeRequired: [ForbiddenKnowledgeType.VOID_SPEECH],

    rarity: 'void-touched',
    goldValue: 0
  },

  {
    id: 'glove_of_reality',
    name: 'Glove of Unmaking',
    description: 'A black glove that seems to not quite exist. Things it touches cease to be.',
    horrorDescription: 'It erases what it touches from reality. Not destroyed. Not moved. Never was.',

    abilities: [
      {
        id: 'unmake',
        name: 'Unmake',
        description: 'Erase something from existence',
        type: 'active',
        energyCost: 50,
        cooldown: 180,
        damage: 999,
        damageType: 'existence',
        sanityLoss: 30,
        corruptionGain: 25,
        horrorDescription: 'It never existed. It never will. Reality adjusts. Only you remember.'
      },
      {
        id: 'phase_touch',
        name: 'Phase Touch',
        description: 'Touch things that are not quite real',
        type: 'active',
        energyCost: 15,
        cooldown: 10,
        sanityLoss: 5,
        corruptionGain: 3,
        horrorDescription: 'You reach into the spaces between. What reaches back?'
      }
    ],

    passiveEffects: [
      {
        id: 'partially_unreal',
        name: 'Partially Unreal',
        description: 'You are harder to perceive and remember',
        statBonus: { 'cunning': 20 },
        specialEffect: 'Take 50% less damage. NPCs forget you quickly.',
        alwaysActive: true
      }
    ],

    corruptionPerUse: 25,
    sanityPerUse: 30,
    permanentCost: {
      type: 'physical_change',
      description: 'Your hand begins to fade from reality',
      effect: { handVisibility: 'fading', existenceIntegrity: 'compromised' }
    },

    curseEffect: {
      id: 'fading_existence',
      name: 'You Are Fading',
      description: 'Each use makes you less real. Eventually, you will never have existed.',
      trigger: 'always',
      effect: {
        type: 'existence_erosion',
        severity: 10,
        description: 'Each use: -1 to all stats permanently. At 0, you cease to have ever existed.'
      },
      removable: false
    },

    curseTrigger: 'Every use',
    canRemove: false,
    origin: 'Taken from a creature that exists outside of reality',
    entityLinked: 'the_eraser',
    acquisition: 'Defeat the Un-Thing in the Void Between Worlds',

    corruptionRequired: 90,
    levelRequired: 30,
    knowledgeRequired: [
      ForbiddenKnowledgeType.REALITY_SHAPING,
      ForbiddenKnowledgeType.VOID_WALKING
    ],

    rarity: 'abyssal',
    goldValue: 0
  }
];

/**
 * Get artifact by ID
 */
export function getArtifactById(id: string): EldritchArtifact | undefined {
  return ELDRITCH_ARTIFACTS.find(a => a.id === id);
}

/**
 * Get artifacts by corruption requirement
 */
export function getArtifactsForCorruption(corruption: number): EldritchArtifact[] {
  return ELDRITCH_ARTIFACTS.filter(a => a.corruptionRequired <= corruption);
}

/**
 * Get artifacts by rarity
 */
export function getArtifactsByRarity(rarity: string): EldritchArtifact[] {
  return ELDRITCH_ARTIFACTS.filter(a => a.rarity === rarity);
}
