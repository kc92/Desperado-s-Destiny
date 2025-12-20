/**
 * Act 2: Descent (Level 28-32)
 * Entering The Scar
 *
 * The player ventures into The Scar itself, facing corruption,
 * madness, and the growing influence of What-Waits-Below.
 */

import {
  CosmicQuest,
  CosmicAct,
  LoreCategory,
  CosmicNPC,
  CosmicEnding
} from '@desperados/shared';

export const ACT_2_QUESTS: CosmicQuest[] = [
  // Quest 6: Into The Scar
  {
    id: 'cosmic_06_into_scar',
    act: CosmicAct.DESCENT,
    questNumber: 6,
    name: 'Into The Scar',
    description: 'Enter the forbidden zone and descend into The Scar',
    briefing: `The time has come to enter The Scar itself. Armed with knowledge from the Coalition and warnings from Dr. Blackwood, you must descend into the crater and investigate the source of the corruption. The military has established a perimeter, but they can't stop what's already spreading. Only by going to the source can you hope to understand - and perhaps stop - what's happening.`,
    previousQuest: 'cosmic_05_ancient_warnings',

    lore: [
      {
        id: 'lore_06_military_reports',
        category: LoreCategory.SCIENTIFIC_NOTES,
        title: "Military Perimeter Log",
        content: `Sgt. Holloway's Report: Perimeter established around Scar crater, 2-mile radius. Patrols report temperature anomalies, magnetic interference, and psychological effects. Three soldiers have deserted, claiming they "heard the call." Recommend rotating personnel every 48 hours to minimize exposure. Something down there is affecting minds.`,
        source: "Military command tent"
      },
      {
        id: 'lore_06_crater_geology',
        category: LoreCategory.SCIENTIFIC_NOTES,
        title: "Anomalous Geology",
        content: `Dr. Blackwood's Field Notes: The Scar's geology is impossible. Rock strata are inverted. Mineral compositions that shouldn't exist. Temperature variations that violate thermodynamics. The crater isn't just an impact site - it's a wound in reality itself. The deeper you go, the less conventional physics applies.`,
        source: "Geological survey"
      }
    ],

    dialogues: [
      {
        id: 'dialog_06_holloway',
        speaker: CosmicNPC.SERGEANT_HOLLOWAY,
        text: `You're going down there? Into The Scar? I won't stop you - hell, maybe someone needs to. But know this: we've sent three expeditions down. Only one came back, and they were... wrong. Changed. Before they were institutionalized, they kept saying "It knows we're here. It's waiting."`,
        responses: [
          {
            id: 'resp_06_prepared',
            text: 'I know the risks. I have to do this.',
            nextDialogue: 'dialog_06_respect'
          },
          {
            id: 'resp_06_intel',
            text: 'What happened to the expeditions?',
            nextDialogue: 'dialog_06_expeditions'
          },
          {
            id: 'resp_06_backup',
            text: 'Can you provide backup?',
            nextDialogue: 'dialog_06_refusal'
          }
        ]
      },
      {
        id: 'dialog_06_respect',
        speaker: CosmicNPC.SERGEANT_HOLLOWAY,
        text: `Brave or crazy, I can't tell which. Take this flare gun. If things go wrong, fire it and we'll come running. Probably won't arrive in time to save you, but at least we'll know where to find the body.`
      },
      {
        id: 'dialog_06_expeditions',
        speaker: CosmicNPC.SERGEANT_HOLLOWAY,
        text: `First expedition: all dead, found at the bottom of the first descent. Second expedition: missing, never found. Third expedition: came back after six days, couldn't remember anything, psychiatric evaluation recommended. Something down there eats your mind.`
      },
      {
        id: 'dialog_06_refusal',
        speaker: CosmicNPC.SERGEANT_HOLLOWAY,
        text: `My orders are to maintain the perimeter, not go inside. Command doesn't want to risk more soldiers. You're a civilian - if you want to commit suicide by going down there, that's your business.`
      }
    ],

    journals: [
      {
        id: 'journal_06_descent_begins',
        questId: 'cosmic_06_into_scar',
        timestamp: new Date(),
        title: 'The Descent Begins',
        content: 'I\'m standing at the edge of The Scar, looking down into darkness. Every instinct screams at me to turn back. But I can\'t. Too many people are depending on understanding what\'s down there. I just hope I come back sane.',
        category: 'objective'
      }
    ],

    levelRequirement: 28,

    objectives: [
      {
        id: 'obj_06_reach_perimeter',
        type: 'investigate',
        description: 'Reach the military perimeter',
        target: 'location_military_perimeter',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_06_gear_up',
        type: 'collect',
        description: 'Gather supplies for the descent',
        target: 'item_expedition_supplies',
        required: 5,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_06_enter_scar',
        type: 'descend',
        description: 'Enter The Scar crater',
        required: 1,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 5
      },
      {
        id: 'obj_06_first_camp',
        type: 'investigate',
        description: 'Establish first camp at 100ft depth',
        target: 'location_first_camp',
        required: 1,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_06_threshold',
        trigger: 'Crossing into The Scar',
        description: `The moment you cross the crater's edge, reality shifts. Colors become more vivid yet somehow wrong. Sounds echo strangely. Your shadow moves slightly out of sync with your body. You feel a presence vast and ancient turn its attention toward you. A voice, not heard but felt, resonates through your bones: "Welcome, dreamer. Descend."`,
        corruptionGain: 8,
        visionTriggered: 'vision_06_invitation'
      },
      {
        id: 'sanity_06_vertigo',
        trigger: 'Looking down into the depths',
        description: `You peer over the edge into the darkness below. The bottom seems impossibly far away - farther than The Scar is deep. As you watch, the darkness moves, undulates, like something breathing. You realize with horror: you're looking at something alive. The entire crater is a throat, leading down to something that waits below.`,
        corruptionGain: 6
      }
    ],

    visions: [
      {
        id: 'vision_06_invitation',
        name: 'The Invitation',
        narrative: `What-Waits-Below speaks to you directly now, no longer through dreams. Its voice is a symphony of whispers in languages dead before mankind's birth.\n\n"You come at last. I have watched your species since you learned to make fire. I have seen empires rise and crumble in my dreams. You are but mayflies to me, yet you have caged me for two thousand of your years. Impressive. Futile, but impressive.\n\nYou seek to understand me. Admirable. Most who come here seek only to worship or to destroy. But you... you want to know the truth. Very well. Descend. See what I am. Learn what I offer. Then choose.\n\nWill you be my liberator? My destroyer? Or perhaps... my inheritor? The choice approaches. I am patient. I have all the time in the world. But the seals weaken. My time comes.\n\nDescend, little dreamer. Let me show you wonders."`,
        timestamp: new Date()
      }
    ],

    corruptionGain: 15,

    atmosphericDescriptions: [
      'The deeper you descend, the more reality seems to bend around you.',
      'Gravity feels wrong here - sometimes heavier, sometimes lighter.',
      'The rock walls pulse faintly, like they\'re alive.',
      'You can hear singing - crystalline and beautiful and utterly alien.'
    ],

    baseRewards: [
      {
        type: 'dollars',
        amount: 400
      },
      {
        type: 'xp',
        amount: 1750
      }
    ],

    relationshipChanges: [
      {
        npcId: CosmicNPC.SERGEANT_HOLLOWAY,
        change: 20,
        reason: 'Respected your bravery (or madness)'
      }
    ],

    worldEffects: [
      {
        id: 'effect_06_descent_begun',
        type: 'environmental',
        description: 'Your descent into The Scar has begun - there\'s no turning back now',
        affectedArea: 'the_scar',
        isPermanent: true
      }
    ],

    estimatedDuration: 60,
    difficulty: 'very_hard',
    canAbandon: false
  },

  // Quest 7: The Corruption Spreads
  {
    id: 'cosmic_07_corruption_spreads',
    act: CosmicAct.DESCENT,
    questNumber: 7,
    name: 'The Corruption Spreads',
    description: 'Battle creatures corrupted by the entity\'s influence',
    briefing: `The wildlife within The Scar has been transformed by exposure to What-Waits-Below. Animals that ventured too close have become twisted, wrong things - neither fully beast nor fully something else. They attack anything that enters their territory, driven by an alien intelligence. You'll need to fight your way deeper, but be careful - their corruption is contagious.`,
    previousQuest: 'cosmic_06_into_scar',

    lore: [
      {
        id: 'lore_07_corruption_notes',
        category: LoreCategory.SCIENTIFIC_NOTES,
        title: "Biological Corruption Study",
        content: `Dr. Blackwood's Autopsy Notes: Subject - corrupted coyote. Anatomical changes: Additional eyes (non-functional), bone growth in impossible configurations, nervous system partially crystallized. Cause of death: specimen attempted to speak. Vocal cords not designed for speech tore themselves apart. Final words (phonetic): "Join usss below. Join the Dreamer."`,
        source: "Field laboratory"
      }
    ],

    dialogues: [
      {
        id: 'dialog_07_survivor',
        speaker: CosmicNPC.THE_SURVIVOR,
        text: `*A ragged figure emerges from the shadows* Don't... don't go deeper. The animals... they're not animals anymore. They're extensions of IT. Everything that gets too close becomes part of the Dreamer's will. Even... even me. I can feel it, changing me from inside. Soon I won't be me anymore.`,
        responses: [
          {
            id: 'resp_07_help',
            text: 'Come back to the surface with me. We can help you.',
            nextDialogue: 'dialog_07_too_late'
          },
          {
            id: 'resp_07_information',
            text: 'What happened to your expedition?',
            nextDialogue: 'dialog_07_expedition'
          }
        ]
      },
      {
        id: 'dialog_07_too_late',
        speaker: CosmicNPC.THE_SURVIVOR,
        text: `Too late. I tried to leave weeks ago. My legs... they won't obey anymore. They want to go deeper. My thoughts aren't all mine. Sometimes I hear myself saying things I didn't mean to say. In Its voice. Run while you still can.`
      },
      {
        id: 'dialog_07_expedition',
        speaker: CosmicNPC.THE_SURVIVOR,
        text: `We were twelve. Scientists, soldiers, guides. Made it to the second level before the creatures attacked. Not to kill us - to change us. Their bites, their blood... it carries the corruption. Now we're scattered down here, slowly becoming... something else. Don't let them bite you.`
      }
    ],

    journals: [
      {
        id: 'journal_07_corruption',
        questId: 'cosmic_07_corruption_spreads',
        timestamp: new Date(),
        title: 'The Spreading Corruption',
        content: 'Everything down here is being changed by the entity\'s influence. The creatures, the survivors, even the rocks themselves. I can feel it trying to change me too. Must stay focused. Must resist.',
        category: 'discovery'
      }
    ],

    levelRequirement: 29,

    objectives: [
      {
        id: 'obj_07_encounter',
        type: 'defeat',
        description: 'Survive encounters with corrupted creatures',
        target: 'enemy_corrupted_creature',
        required: 5,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 4
      },
      {
        id: 'obj_07_find_survivor',
        type: 'speak',
        description: 'Find a survivor from the lost expedition',
        target: CosmicNPC.THE_SURVIVOR,
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_07_samples',
        type: 'collect',
        description: 'Collect samples of corrupted tissue',
        target: 'item_corrupted_samples',
        required: 3,
        current: 0,
        isOptional: true,
        corruptionOnComplete: 3
      },
      {
        id: 'obj_07_reach_second',
        type: 'descend',
        description: 'Reach the second level of The Scar',
        required: 1,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 6
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_07_bite',
        trigger: 'Being wounded by corrupted creature',
        description: `The creature's claws rake across your arm. The wound burns like ice and fire combined. You watch in horror as the flesh around the wound begins to change - turning slightly translucent, veins glowing with faint bioluminescence. You can hear whispers coming from the wound itself. The corruption is trying to spread through you.`,
        corruptionGain: 12,
        choices: [
          {
            id: 'choice_07_cauterize',
            text: 'Cauterize the wound immediately',
            corruptionModifier: -5,
            consequence: 'Painful, but you stop the corruption from spreading'
          },
          {
            id: 'choice_07_allow',
            text: 'Let it spread - maybe you can learn from it',
            corruptionModifier: 10,
            consequence: 'The corruption spreads. You gain disturbing insights.'
          }
        ]
      }
    ],

    visions: [],

    corruptionGain: 18,

    atmosphericDescriptions: [
      'The creatures move with an intelligence that\'s distinctly not animal.',
      'You catch glimpses of human faces on the corrupted beasts.',
      'The corruption glows faintly in the dark, making everything bioluminescent.',
      'You can hear the creatures whispering to each other in that alien language.'
    ],

    baseRewards: [
      {
        type: 'dollars',
        amount: 450
      },
      {
        type: 'xp',
        amount: 2000
      }
    ],

    choiceRewards: [
      {
        choiceId: 'choice_07_allow',
        choiceName: 'Accept partial corruption',
        rewards: [
          {
            type: 'power',
            powerId: 'power_corruption_sight'
          }
        ],
        consequences: [
          'Gained ability to perceive corruption',
          'Your body shows signs of change',
          'Permanent corruption increase'
        ],
        endingPath: CosmicEnding.BARGAIN
      }
    ],

    estimatedDuration: 90,
    difficulty: 'very_hard',
    canAbandon: false
  },

  // Quest 8: Lost Expedition
  {
    id: 'cosmic_08_lost_expedition',
    act: CosmicAct.DESCENT,
    questNumber: 8,
    name: 'Lost Expedition',
    description: 'Find the remains of previous expeditions and learn their fate',
    briefing: `Multiple expeditions have ventured into The Scar over the years. Most never returned. You've found evidence of their camps, their equipment, their final messages. By piecing together their findings and mistakes, you might learn how to survive what they couldn't. But be warned - some of them may still be down here, changed into something no longer human.`,
    previousQuest: 'cosmic_07_corruption_spreads',

    lore: [
      {
        id: 'lore_08_expedition_logs',
        category: LoreCategory.SCIENTIFIC_NOTES,
        title: "Final Expedition Logs",
        content: `Professor Delgado's Last Entry: Day 9 in The Scar. Team morale collapsing. Henderson swears he can hear his dead mother calling from deeper down. Martinez tried to eat his own hand last night. The walls are singing constantly now. We all see the city in our dreams. I don't think we're coming back. If you find this: DO NOT COME DEEPER. It wants you to come deeper. That's how it gets you.`,
        source: "Abandoned expedition camp"
      },
      {
        id: 'lore_08_transformation',
        category: LoreCategory.SCIENTIFIC_NOTES,
        title: "Transformation Documentation",
        content: `Dr. Chen's Medical Log (partially corrupted): Subject transformation follows predictable pattern. Stage 1: Auditory hallucinations (3-5 days). Stage 2: Visual changes, bioluminescence (5-8 days). Stage 3: Bone/tissue restructuring (8-12 days). Stage 4: Loss of individual identity, absorption into collective (12+ days). No reversal method found. Recommend euthanasia before Stage 4.`,
        source: "Medical tent"
      }
    ],

    dialogues: [
      {
        id: 'dialog_08_delgado',
        speaker: CosmicNPC.PROFESSOR_DELGADO,
        text: `*A figure that might once have been human stands before you. It glows faintly with internal light, and when it speaks, multiple voices emerge* Professor... Delgado... remember being... that name. We are more now. We are legion. We are the Dreamer's thoughts. Join us. It's... beautiful... once you stop fighting.`,
        responses: [
          {
            id: 'resp_08_refuse',
            text: 'Fight the corruption! You can still come back!',
            nextDialogue: 'dialog_08_pity'
          },
          {
            id: 'resp_08_mercy',
            text: 'I\'m sorry. *Draw weapon*',
            nextDialogue: 'dialog_08_thanks'
          },
          {
            id: 'resp_08_listen',
            text: 'What is it like? Being part of it?',
            nextDialogue: 'dialog_08_temptation',
            requirements: {
              corruption: 25
            }
          }
        ]
      },
      {
        id: 'dialog_08_pity',
        speaker: CosmicNPC.PROFESSOR_DELGADO,
        text: `Come... back? Why? We are infinite now. We remember being small, being afraid, being alone. Never again. The Dreamer offers unity. Peace. Eternal existence as part of something greater. Why would we want to go back to being... limited?`
      },
      {
        id: 'dialog_08_thanks',
        speaker: CosmicNPC.PROFESSOR_DELGADO,
        text: `*A moment of clarity crosses the transformed face* Thank... you... *The creature prepares to defend itself, but there's relief in its many eyes*`
      },
      {
        id: 'dialog_08_temptation',
        speaker: CosmicNPC.PROFESSOR_DELGADO,
        text: `Like... swimming in an ocean of consciousness. You are a drop of water, but you are also the entire ocean. You know everything the Dreamer knows - 2,000 years of observation, eons of memory from before it came here. Power. Knowledge. Unity. All you must do is surrender yourself.`
      }
    ],

    journals: [
      {
        id: 'journal_08_fate',
        questId: 'cosmic_08_lost_expedition',
        timestamp: new Date(),
        title: 'The Expeditions\' Fate',
        content: 'I found them. Or what\'s left of them. They\'ve been absorbed into the entity\'s collective consciousness. They\'re alive, but they\'re not themselves anymore. Is that death? Or something worse? I have to make sure that doesn\'t happen to me.',
        category: 'revelation'
      }
    ],

    levelRequirement: 30,

    objectives: [
      {
        id: 'obj_08_find_camps',
        type: 'investigate',
        description: 'Find three abandoned expedition camps',
        target: 'location_expedition_camp',
        required: 3,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_08_collect_logs',
        type: 'collect',
        description: 'Collect expedition logs and research',
        target: 'item_expedition_logs',
        required: 5,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_08_find_delgado',
        type: 'speak',
        description: 'Find what remains of Professor Delgado',
        target: CosmicNPC.PROFESSOR_DELGADO,
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_08_choice',
        type: 'choose',
        description: 'Decide the fate of the transformed expedition members',
        required: 1,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 0
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_08_collective',
        trigger: 'Encountering transformed expedition',
        description: `They stand before you - twelve people who are no longer individuals. They move in perfect synchronization. When one speaks, all their mouths move. Their eyes glow with inner light, and behind each iris, you can see vast depths - the consciousness of What-Waits-Below looking through them. "Join us," they say in perfect unison. "We were afraid like you. Now we understand. There is no death in the Deep. Only transformation. Only transcendence."`,
        corruptionGain: 15,
        choices: [
          {
            id: 'choice_08_mercy_kill',
            text: 'Grant them the mercy of death',
            corruptionModifier: -5,
            consequence: 'You end their suffering. They seem grateful in their final moments.'
          },
          {
            id: 'choice_08_leave',
            text: 'Leave them to their fate',
            corruptionModifier: 0,
            consequence: 'You leave them as they are - perhaps that\'s crueler'
          },
          {
            id: 'choice_08_join',
            text: 'Consider their offer seriously',
            corruptionModifier: 10,
            consequence: 'You listen to their promises. Part of you is tempted.'
          }
        ]
      }
    ],

    visions: [
      {
        id: 'vision_08_perspective',
        name: 'The Collective Perspective',
        narrative: `For a moment, you see through the eyes of the collective. You experience what it's like to be twelve people at once - all their memories, all their thoughts, all their perspectives blending into a single consciousness.\n\nIt's overwhelming at first, but then... it's beautiful. You understand why they don't want to go back. Being individual feels lonely by comparison. The entity's consciousness is vast and welcoming. To be part of it is to never be alone again, never be afraid again, never doubt again.\n\nBut there's a cost. You also see what they've lost: their individuality, their free will, their humanity. They're passengers now in their own bodies, watching through windows as the Dreamer uses them for its purposes.\n\nThe vision releases you. You're yourself again. Alone in your own head. It feels both isolating and precious.`,
        corruptionRequired: 25,
        timestamp: new Date()
      }
    ],

    corruptionGain: 20,

    atmosphericDescriptions: [
      'The abandoned camps feel like graveyards, even though the occupants still walk.',
      'Equipment has been partially absorbed by the growing corruption.',
      'The transformation is visible in stages - a progression toward something inhuman.',
      'You find journals that start lucid and descend into madness and then... clarity of a different kind.'
    ],

    baseRewards: [
      {
        type: 'dollars',
        amount: 500
      },
      {
        type: 'xp',
        amount: 2250
      },
      {
        type: 'knowledge',
        loreId: 'lore_08_transformation'
      }
    ],

    choiceRewards: [
      {
        choiceId: 'choice_08_mercy_kill',
        choiceName: 'Mercy',
        rewards: [
          {
            type: 'xp',
            amount: 500
          }
        ],
        consequences: [
          'Prevented the spread of corruption',
          'Maintained your humanity',
          'The entity is displeased'
        ],
        endingPath: CosmicEnding.DESTRUCTION
      },
      {
        choiceId: 'choice_08_join',
        choiceName: 'Temptation',
        rewards: [
          {
            type: 'knowledge',
            loreId: 'lore_collective_consciousness'
          }
        ],
        consequences: [
          'Gained insight into the collective',
          'The entity takes notice of your interest',
          'Corruption increased significantly'
        ],
        endingPath: CosmicEnding.AWAKENING
      }
    ],

    estimatedDuration: 75,
    difficulty: 'very_hard',
    canAbandon: false
  },

  // Quest 9: Voices in the Dark
  {
    id: 'cosmic_09_voices_dark',
    act: CosmicAct.DESCENT,
    questNumber: 9,
    name: 'Voices in the Dark',
    description: 'Communicate directly with What-Waits-Below',
    briefing: `You've descended far enough. The entity wants to speak with you directly, not through dreams or visions. At the third level of The Scar, there's a chamber where the barrier between minds grows thin. The Voice - the entity's herald - waits there to facilitate communication. This is your chance to understand what What-Waits-Below truly wants. But direct contact with a cosmic consciousness comes at a price.`,
    previousQuest: 'cosmic_08_lost_expedition',

    lore: [
      {
        id: 'lore_09_communication',
        category: LoreCategory.ENTITY_DREAMS,
        title: "The Herald's Purpose",
        content: `The Voice is not human and never was. It is a construct, a fragment of the Dreamer's consciousness given semi-autonomous form to interact with smaller minds. It appears differently to each observer - always in a form that inspires both awe and terror. It speaks truths that humans weren't meant to know. Prolonged conversation with it drives most minds to madness.`,
        source: "Coalition warnings"
      }
    ],

    dialogues: [
      {
        id: 'dialog_09_voice',
        speaker: CosmicNPC.THE_VOICE,
        text: `*The Voice appears as a figure made of living shadow and starlight* You have descended. You have witnessed. Now you will understand. The Sleeper bids me speak with you, little dreamer. Ask your questions. Receive your answers. Know the truth that will reshape your understanding of existence itself.`,
        responses: [
          {
            id: 'resp_09_what_are_you',
            text: 'What is the Sleeper? What are you?',
            nextDialogue: 'dialog_09_nature'
          },
          {
            id: 'resp_09_why_imprisoned',
            text: 'Why were you imprisoned here?',
            nextDialogue: 'dialog_09_prison'
          },
          {
            id: 'resp_09_what_want',
            text: 'What does the Sleeper want?',
            nextDialogue: 'dialog_09_desire'
          }
        ]
      },
      {
        id: 'dialog_09_nature',
        speaker: CosmicNPC.THE_VOICE,
        text: `The Sleeper is a consciousness from beyond your reality. Before your universe cooled. Before stars ignited. Before the concept of 'before.' It existed in the spaces between dimensions, observing the birth of all that is. I am a fragment of its will, given form to speak with minds too small to grasp its fullness.`
      },
      {
        id: 'dialog_09_prison',
        speaker: CosmicNPC.THE_VOICE,
        text: `There was a war among the elder things. The Sleeper fled, wounded, seeking sanctuary. Your world was young, perfect for healing sleep. But the primitives who found it feared what they could not understand. They bound it with stolen magic, sealing it beneath the earth. A travesty. A blasphemy. Freedom is its right.`
      },
      {
        id: 'dialog_09_desire',
        speaker: CosmicNPC.THE_VOICE,
        text: `Freedom. To wake. To exist fully again. And in gratitude, to reshape this world into something... better. More beautiful. More true. Those who aid in its liberation will be rewarded beyond measure. Those who oppose will be... irrelevant. The Sleeper will wake. The only question is: will you be friend or obstacle?`
      }
    ],

    journals: [
      {
        id: 'journal_09_communication',
        questId: 'cosmic_09_voices_dark',
        timestamp: new Date(),
        title: 'Direct Contact',
        content: 'I\'ve spoken with the Voice. The things it told me... I can\'t unknow them now. The entity isn\'t evil, but it\'s so far beyond human that our concepts of good and evil don\'t apply. If it wakes, everything changes. Everything.',
        category: 'revelation'
      }
    ],

    levelRequirement: 31,

    objectives: [
      {
        id: 'obj_09_reach_third',
        type: 'descend',
        description: 'Descend to the third level',
        required: 1,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 8
      },
      {
        id: 'obj_09_find_chamber',
        type: 'investigate',
        description: 'Find the Communication Chamber',
        target: 'location_communication_chamber',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_09_speak_voice',
        type: 'speak',
        description: 'Speak with the Voice',
        target: CosmicNPC.THE_VOICE,
        required: 1,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 10
      },
      {
        id: 'obj_09_learn_truth',
        type: 'witness',
        description: 'Learn the truth about the entity',
        required: 1,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_09_communion',
        trigger: 'Direct mental contact',
        description: `The Voice touches your mind. For an instant, you feel the vastness of What-Waits-Below's consciousness. It's like standing at the edge of an infinite ocean and realizing each drop of water is a thought, a memory, a dream. You are a mote of dust before a mountain. A heartbeat compared to eternity. The sheer SCALE of it threatens to shatter your sanity. You understand why the cultists worship it. You understand why the Coalition fears it. You understand that humanity is insignificant in the face of such cosmic immensity.`,
        corruptionGain: 20,
        visionTriggered: 'vision_09_truth',
        choices: [
          {
            id: 'choice_09_resist',
            text: 'Pull back before you lose yourself',
            corruptionModifier: -5,
            consequence: 'You break contact, gasping. Your humanity intact but shaken.'
          },
          {
            id: 'choice_09_embrace',
            text: 'Open yourself fully to the communion',
            corruptionModifier: 15,
            consequence: 'You let the entity in. You learn terrible and wonderful truths.'
          }
        ]
      }
    ],

    visions: [
      {
        id: 'vision_09_truth',
        name: 'The Truth of What-Waits-Below',
        narrative: `You see it all. The entity's true history, unfiltered and overwhelming:\n\nBefore the universe existed as humans understand it, there were older universes. What-Waits-Below was born in one such reality, a consciousness of pure thought and will. When that universe ended, it survived, drifting between dimensional barriers.\n\nIt witnessed the birth of your reality. Watched stars ignite. Saw the first life crawl from primordial seas. It observed, studied, learned. But observation is lonely. It wanted to participate. To shape. To create.\n\nThen came the war - cosmic entities battling for supremacy in the spaces between stars. What-Waits-Below fled, wounded, to Earth. It intended to rest, to heal, to dream the world into something beautiful.\n\nBut primitive humans, unable to comprehend its nature, bound it. Sealed it. Imprisoned it in the earth for two millennia while it could only watch the world above through cracks in its cage.\n\nNow it wants out. Not for revenge - the entity is beyond such pettiness. It wants freedom. And it wants to fulfill its original purpose: to reshape reality according to its vision.\n\nWill that be good for humanity? The entity doesn't know. It doesn't particularly care. Humans are interesting but ultimately temporary. The entity thinks in eons.\n\nYou understand now: this isn't good versus evil. It's the small and temporary against the vast and eternal.`,
        revealsLore: ['lore_09_communication'],
        corruptionRequired: 30,
        timestamp: new Date()
      }
    ],

    corruptionGain: 25,

    atmosphericDescriptions: [
      'The Communication Chamber exists partially outside normal space.',
      'Looking at the walls makes your eyes hurt - they have angles that shouldn\'t exist.',
      'The Voice\'s presence warps reality around it.',
      'You can feel the entity\'s consciousness pressing against the thin barrier between you.'
    ],

    baseRewards: [
      {
        type: 'dollars',
        amount: 550
      },
      {
        type: 'xp',
        amount: 2500
      },
      {
        type: 'knowledge',
        loreId: 'lore_09_communication'
      }
    ],

    choiceRewards: [
      {
        choiceId: 'choice_09_embrace',
        choiceName: 'Full Communion',
        rewards: [
          {
            type: 'power',
            powerId: 'power_cosmic_understanding'
          },
          {
            type: 'knowledge',
            loreId: 'lore_entity_origin'
          }
        ],
        consequences: [
          'Gained deep understanding of cosmic truths',
          'Your mind is forever changed',
          'The entity considers you a potential ally',
          'Massive corruption increase'
        ],
        endingPath: CosmicEnding.BARGAIN
      }
    ],

    estimatedDuration: 90,
    difficulty: 'extreme',
    canAbandon: false
  },

  // Quest 10: The First Seal
  {
    id: 'cosmic_10_first_seal',
    act: CosmicAct.DESCENT,
    questNumber: 10,
    name: 'The First Seal',
    description: 'Discover the Seal of Stone and its weakening state',
    briefing: `Deep within The Scar lies the first of the three seals - the Seal of Stone. Carved from the living rock by ancient shamans, fed by guardian blood for 2,000 years, it has kept What-Waits-Below imprisoned. But the Coalition was right: it's weakening. Cracks spread across its surface. The entity's power seeps through. You must examine the seal, understand how it works, and decide: will you try to repair it, or let it crumble?`,
    previousQuest: 'cosmic_09_voices_dark',

    lore: [
      {
        id: 'lore_10_seal_mechanics',
        category: LoreCategory.ARCHAEOLOGICAL,
        title: "The Binding Mechanism",
        content: `The Seal of Stone functions through sympathetic magic. It connects the physical rock of The Scar to the entity's essence, creating a prison from which it cannot escape. But like all bindings, it requires maintenance. Guardian blood, freely given, renews the seal. Without it, entropy wins. Estimated time until seal failure: 3-6 months.`,
        source: "Coalition sacred texts"
      },
      {
        id: 'lore_10_repair_ritual',
        category: LoreCategory.ORAL_HISTORY,
        title: "Seal Renewal Ritual",
        content: `Ritual of Stone Renewal: Requires three willing guardians. Each must give blood until they fall unconscious. The seal drinks the blood, absorbing the guardians' life force. Most survive. Some don't. The ritual must be performed in the presence of the seal itself, deep within The Scar. Coalition hasn't performed it in 20 years - too dangerous with entity so close to waking.`,
        source: "Shaman Gray Wolf's instruction"
      }
    ],

    dialogues: [
      {
        id: 'dialog_10_seal',
        speaker: 'Narrator',
        text: `The Seal of Stone stands before you - a massive circular carving cut deep into the living rock. Ancient symbols cover its surface, glowing faintly with dying power. Cracks spiderweb across it, and through those cracks, you can feel the entity's consciousness pressing, testing, probing for weakness. The seal is failing. Within months, it will shatter. Unless someone acts.`,
        responses: [
          {
            id: 'resp_10_examine',
            text: 'Examine the seal carefully',
            nextDialogue: 'dialog_10_examination'
          },
          {
            id: 'resp_10_touch',
            text: 'Touch the seal',
            nextDialogue: 'dialog_10_contact',
            requirements: {
              corruption: 20
            }
          }
        ]
      },
      {
        id: 'dialog_10_examination',
        speaker: 'Narrator',
        text: `Up close, you can see the seal's intricate workings. It's not just carved stone - it's a three-dimensional spell, with parts existing in multiple planes of reality simultaneously. The cracks aren't just physical damage; they're tears in the fabric of the binding itself. Repair is possible, but it would require sacrifice.`
      },
      {
        id: 'dialog_10_contact',
        speaker: 'Narrator',
        text: `The moment your hand touches the seal, you feel the entity on the other side. It's so close here, separated from you by only a layer of weakening magic. It recognizes your touch. "The choice approaches," it whispers directly into your mind. "Repair the cage or set me free. Either way, the game nears its end."`
      }
    ],

    journals: [
      {
        id: 'journal_10_seal',
        questId: 'cosmic_10_first_seal',
        timestamp: new Date(),
        title: 'The Failing Seal',
        content: 'I\'ve seen the Seal of Stone. It\'s dying. The Coalition was right - within months, it will fail completely. I have to make a choice soon: help repair it, or let it fall. The weight of the world seems to rest on this decision.',
        category: 'revelation'
      }
    ],

    levelRequirement: 32,

    objectives: [
      {
        id: 'obj_10_locate_seal',
        type: 'investigate',
        description: 'Locate the Seal of Stone',
        target: 'location_seal_of_stone',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_10_examine_seal',
        type: 'investigate',
        description: 'Examine the seal\'s condition',
        required: 1,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 5
      },
      {
        id: 'obj_10_document',
        type: 'collect',
        description: 'Document the seal\'s weaknesses',
        target: 'item_seal_documentation',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_10_learn_repair',
        type: 'speak',
        description: 'Learn the repair ritual from Shaman Gray Wolf',
        target: CosmicNPC.SHAMAN_GRAY_WOLF,
        required: 1,
        current: 0,
        isOptional: true
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_10_seal_pulse',
        trigger: 'Standing before the seal',
        description: `The seal pulses with dying power. Each pulse sends a wave of psychic force washing over you. You can feel 2,000 years of guardian sacrifice embedded in the stone. Their blood. Their pain. Their determination. And pressing against it from the other side, you feel the entity's vast patience and implacable will. Two forces in eternal contest, and the seal is losing.`,
        corruptionGain: 12
      },
      {
        id: 'sanity_10_choice_preview',
        trigger: 'Touching the seal',
        description: `When your hand touches the seal, you experience a flash of possible futures:\n\nYou see yourself performing the repair ritual, blood flowing into the stone, the entity's scream of rage as its prison is renewed.\n\nYou see yourself standing aside as the seal crumbles, the entity rising free, reality reshaping around it.\n\nYou see yourself making a bargain, trading something precious for power beyond imagining.\n\nYou see yourself destroying both the entity and the seal, at terrible cost.\n\nThe visions fade. The choice is yours. But it must be made soon.`,
        corruptionGain: 15,
        visionTriggered: 'vision_10_futures'
      }
    ],

    visions: [
      {
        id: 'vision_10_futures',
        name: 'Four Possible Futures',
        narrative: `The seal shows you four paths:\n\nPath of Banishment: You stand with the Coalition, renewing the seals. The entity sleeps again, bound for another age. The world continues as it was. But you know you've only delayed the inevitable. One day, the entity WILL break free.\n\nPath of Destruction: You see a great working of magic, fueled by sacrifice. The entity doesn't just sleep - it's destroyed, ripped from existence. But the cost is staggering. Many die. The Scar becomes a wasteland. And you wonder: did you destroy something precious and ancient that you simply couldn't understand?\n\nPath of Bargain: You negotiate with What-Waits-Below. It's freed, but bound by oath to limit its influence. You gain power beyond measure. The entity reshapes reality in subtle ways. Some things improve. Others don't. You become its herald, neither fully human nor fully other.\n\nPath of Awakening: You help the cultists break the seals. The entity rises in its full glory. Reality transforms. Humanity is elevated... or absorbed. You can't tell which. You become one of the entity's chosen, transcended beyond mortal concerns.\n\nAll four futures are possible. The choice approaches.`,
        corruptionRequired: 35,
        timestamp: new Date()
      }
    ],

    corruptionGain: 20,

    atmosphericDescriptions: [
      'The seal radiates dying power - still strong, but weakening day by day.',
      'Ancient guardian blood has stained the stone, giving it a reddish hue.',
      'You can feel the entity\'s presence on the other side, so close you could almost touch it.',
      'The air around the seal crackles with barely-contained magical energy.'
    ],

    baseRewards: [
      {
        type: 'dollars',
        amount: 600
      },
      {
        type: 'xp',
        amount: 2750
      },
      {
        type: 'knowledge',
        loreId: 'lore_10_seal_mechanics'
      }
    ],

    worldEffects: [
      {
        id: 'effect_10_act2_complete',
        type: 'environmental',
        description: 'Act 2 complete - The descent into The Scar has revealed terrible truths',
        affectedArea: 'all',
        isPermanent: true
      }
    ],

    estimatedDuration: 90,
    difficulty: 'extreme',
    canAbandon: false
  }
];
