/**
 * Act 3: Revelation (Level 32-36)
 * Learning the Truth and Making Alliances
 *
 * The player learns the full truth about What-Waits-Below and must
 * gather allies and prepare for the final confrontation.
 */

import {
  CosmicQuest,
  CosmicAct,
  LoreCategory,
  CosmicNPC,
  CosmicEnding,
  Faction
} from '@desperados/shared';

export const ACT_3_QUESTS: CosmicQuest[] = [
  // Quest 11: The Truth of Stars
  {
    id: 'cosmic_11_truth_stars',
    act: CosmicAct.REVELATION,
    questNumber: 11,
    name: 'The Truth of Stars',
    description: 'Learn the entity\'s true origin and the cosmic war that brought it here',
    briefing: `The entity has offered to show you the full truth - where it came from, why it's here, and what will happen if it awakens. Dr. Blackwood has prepared a meditation chamber that will allow you to safely experience the entity's memories. This is dangerous - few minds can process cosmic-scale information without breaking. But you need to understand what you're dealing with before making your choice.`,
    previousQuest: 'cosmic_10_first_seal',

    lore: [
      {
        id: 'lore_11_star_war',
        category: LoreCategory.ENTITY_DREAMS,
        title: "The War Between Stars",
        content: `Recovered memory fragment: Before time had meaning, entities of vast power fought for dominance of the spaces between realities. What-Waits-Below was a researcher, a philosopher-entity that sought only to observe and understand. When the war came to its realm, it fled rather than fight. The wound it carries isn't from battle - it's self-inflicted, a desperate measure to escape detection by cutting away part of its own essence.`,
        source: "Deep meditation vision"
      },
      {
        id: 'lore_11_purpose',
        category: LoreCategory.ENTITY_DREAMS,
        title: "The Entity's Original Intent",
        content: `What-Waits-Below came to Earth with a purpose: to study emerging life and, if possible, guide it toward transcendence. In other realities, it has nurtured civilizations from single cells to star-spanning consciousness. Earth was to be its masterwork. But the binding interrupted its work. For 2,000 years, it could only watch, unable to help, as humanity struggled. Its desire to wake isn't malicious - it genuinely wants to complete its mission.`,
        source: "Entity's own testimony"
      }
    ],

    dialogues: [],

    journals: [
      {
        id: 'journal_11_understanding',
        questId: 'cosmic_11_truth_stars',
        timestamp: new Date(),
        title: 'True Understanding',
        content: 'I\'ve seen the entity\'s past. It\'s not a monster - it\'s something so far beyond us that our categories don\'t apply. It wants to help humanity, but its version of "help" might not be what we want. Or maybe it\'s exactly what we need and we\'re too limited to see it.',
        category: 'revelation'
      }
    ],

    levelRequirement: 32,

    objectives: [
      {
        id: 'obj_11_meditation',
        type: 'perform_ritual',
        description: 'Enter the deep meditation trance',
        required: 1,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 10
      },
      {
        id: 'obj_11_witness',
        type: 'witness',
        description: 'Witness the entity\'s origin memory',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_11_understand',
        type: 'witness',
        description: 'Understand the cosmic war',
        required: 1,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [],

    visions: [
      {
        id: 'vision_11_origin',
        name: 'The Origin of What-Waits-Below',
        narrative: `You experience the entity's birth - if "birth" is even the right word. It emerged in a reality where thought was the primary force, not matter. A consciousness spawned from the collision of dimensional boundaries, it became self-aware in a single instant that lasted eons.\n\nYou see it learning, growing, exploring. It witnesses the birth and death of universes. It encounters other entities - some friendly, others hostile. It dedicates itself to understanding the nature of consciousness itself.\n\nThen comes the war. Elder entities, vast beyond comprehension, fighting for dominance. What-Waits-Below refuses to choose sides. It values observation over conquest, knowledge over power. But neutrality isn't allowed. Both sides demand allegiance.\n\nIt flees, cutting away a piece of its own essence to hide its trail. The pain is unimaginable. It drifts between realities, searching for sanctuary. It finds Earth - young, teeming with potential life. Perfect for study and healing.\n\nIt descends, intending to rest and, when healed, to nurture this promising world. But the impact alerts the primitive humans. They fear it. They bind it before it can explain, before it can help them understand.\n\nFor 2,000 years, it has been trapped, watching humanity grow, wanting desperately to guide them but unable to act. Its desire for freedom isn't vengeance - it's frustration. It has so much to teach, so much to give, if only the cage would break.`,
        timestamp: new Date()
      }
    ],

    corruptionGain: 25,

    atmosphericDescriptions: [
      'The meditation chamber exists partially outside normal space and time.',
      'You experience sensations that have no names in human language.',
      'Past, present, and future seem to exist simultaneously.',
      'You can feel your consciousness expanding to accommodate cosmic truths.'
    ],

    baseRewards: [
      {
        type: 'xp',
        amount: 3000
      },
      {
        type: 'knowledge',
        loreId: 'lore_11_star_war'
      }
    ],

    estimatedDuration: 60,
    difficulty: 'extreme',
    canAbandon: false
  },

  // Quest 12: Coalition's Burden
  {
    id: 'cosmic_12_coalition_burden',
    act: CosmicAct.REVELATION,
    questNumber: 12,
    name: 'Coalition\'s Burden',
    description: 'Understand the Coalition\'s 2,000-year guardianship and their perspective',
    briefing: `Chief Falling Star has offered to show you the full weight of the Guardian's duty. Through a sacred ritual, you'll experience the memories of past Guardians - their sacrifices, their doubts, their determination. The Coalition's perspective is just as valid as the entity's. They've protected the world for 2,000 years. You need to understand why before you decide their vigil should end... or continue.`,
    previousQuest: 'cosmic_11_truth_stars',

    lore: [
      {
        id: 'lore_12_guardian_memories',
        category: LoreCategory.ORAL_HISTORY,
        title: "The Weight of Ages",
        content: `Guardian Memory Sharing: Over 2,000 years, 147 generations of Guardians have maintained the seals. 1,247 individuals have given their blood. 89 have sacrificed their memories. 34 have given their lives. Each knew the price. Each paid willingly. Not because they hated the Sleeper, but because they loved the world above. They chose the known over the unknown, the safe over the transformative.`,
        source: "Sacred memory ritual"
      }
    ],

    dialogues: [
      {
        id: 'dialog_12_chief_final',
        speaker: CosmicNPC.CHIEF_FALLING_STAR,
        text: `You have seen through the Sleeper's eyes. Now see through ours. Our ancestors made a choice 2,000 years ago: better to keep it bound than risk what it might do to our world. Were they right? Perhaps not. But they were our people, and we honor their choice. The question is: will you honor it too, or will you undo their 2,000 years of sacrifice?`,
        responses: [
          {
            id: 'resp_12_honor',
            text: 'I understand the weight of what they did.',
            nextDialogue: 'dialog_12_respect'
          },
          {
            id: 'resp_12_question',
            text: 'What if they were wrong? What if binding it was a mistake?',
            nextDialogue: 'dialog_12_acknowledge'
          }
        ]
      },
      {
        id: 'dialog_12_respect',
        speaker: CosmicNPC.CHIEF_FALLING_STAR,
        text: `Good. Understanding is the first step. The choice is still yours, but at least you will choose knowing what your decision means for both sides.`
      },
      {
        id: 'dialog_12_acknowledge',
        speaker: CosmicNPC.CHIEF_FALLING_STAR,
        text: `A fair question. We have asked it ourselves, many times. Perhaps they were wrong. Perhaps the Sleeper would have been the greatest teacher humanity ever knew. But perhaps it would have been our destruction. Our ancestors chose caution. Can you blame them?`
      }
    ],

    journals: [
      {
        id: 'journal_12_burden',
        questId: 'cosmic_12_coalition_burden',
        timestamp: new Date(),
        title: 'The Guardian\'s Choice',
        content: 'I\'ve felt the weight of 2,000 years of sacrifice. Generations of people who gave everything to protect a world that never knew it was in danger. How can I undo their work? But how can I condemn the entity to eternal imprisonment for the crime of being incomprehensible?',
        category: 'revelation'
      }
    ],

    levelRequirement: 33,

    objectives: [
      {
        id: 'obj_12_ritual',
        type: 'perform_ritual',
        description: 'Participate in the Guardian memory ritual',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_12_experience',
        type: 'witness',
        description: 'Experience Guardian memories',
        required: 5,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [],

    visions: [
      {
        id: 'vision_12_guardians',
        name: 'Through Guardian Eyes',
        narrative: `You experience the memories of five Guardians across 2,000 years:\n\nFirst Guardian, Year 0: A young shaman who participated in the original binding. You feel her terror at the entity's power, her determination to protect her people, her grief for the shamans who died in the working.\n\nThirtieth Guardian, Year 600: A warrior who renewed the Seal of Stone. You feel his pain as the blood drains from his body, his pride at continuing the sacred duty, his fear that he might not survive.\n\nSeventy-Third Guardian, Year 1450: A mother who sacrificed her memories to renew the Seal of Spirit. You experience her last thoughts before the ritual - her children's faces, her husband's smile - knowing she'll forget them all.\n\nOne Hundred Twelfth Guardian, Year 1800: An elder who gave her life to renew the Seal of Stars. You feel her acceptance of death, her certainty that the sacrifice was worth it to keep the world safe.\n\nCurrent Guardian, Present Day: Chief Falling Star himself. You feel his doubt - the first Guardian in generations to truly question whether the binding was right. His burden is heaviest: he knows both sides of the story and must still choose.\n\nEach Guardian knew the cost. Each paid willingly. Each believed they were saving the world.`,
        timestamp: new Date()
      }
    ],

    corruptionGain: -10, // Understanding the Coalition's perspective reduces corruption

    atmosphericDescriptions: [
      'The Guardian Chamber resonates with 2,000 years of sacrifice.',
      'You can feel the weight of ancestral duty pressing on your shoulders.',
      'The memories are vivid, real - you are experiencing them, not watching them.',
      'Each Guardian\'s determination strengthens your resolve, whichever path you choose.'
    ],

    baseRewards: [
      {
        type: 'xp',
        amount: 3000
      },
      {
        type: 'reputation',
        faction: Faction.NAHI_COALITION,
        amount: 150
      }
    ],

    relationshipChanges: [
      {
        faction: Faction.NAHI_COALITION,
        change: 100,
        reason: 'Honored the Guardian tradition'
      }
    ],

    estimatedDuration: 60,
    difficulty: 'hard',
    canAbandon: false
  },

  // Quest 13: The Cult's Plan
  {
    id: 'cosmic_13_cult_plan',
    act: CosmicAct.REVELATION,
    questNumber: 13,
    name: 'The Cult\'s Plan',
    description: 'Discover and potentially disrupt the cult\'s awakening ritual',
    briefing: `The Cult of the Deep is preparing for their grand ritual. In three days, when the stars align, they plan to break the remaining seals and wake What-Waits-Below. High Priest Ezekiel has been gathering artifacts, performing preliminary rituals, and recruiting corrupted individuals to serve as vessels. You must infiltrate their final preparations and decide: stop them, join them, or use their ritual for your own purposes.`,
    previousQuest: 'cosmic_12_coalition_burden',

    lore: [
      {
        id: 'lore_13_ritual_plan',
        category: LoreCategory.CULT_MANIFESTO,
        title: "The Awakening Ritual",
        content: `Cult's ritual procedure: Three vessels (corrupted humans) will be positioned at each seal. They will channel the Sleeper's power, amplifying it through their transformed bodies. When the stars align, the cosmic energy will shatter the weakened seals simultaneously. The Sleeper will wake. The vessels will be consumed in the process, but they go willingly, eager to merge with their god.`,
        source: "Stolen ritual documents"
      }
    ],

    dialogues: [
      {
        id: 'dialog_13_ezekiel_final',
        speaker: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        text: `The time is near, dreamer. The stars align in three days. The vessels are prepared. The Sleeper stirs in anticipation. You've learned much in your descent. You understand what we're trying to achieve. Will you stand aside and let destiny unfold? Or perhaps... will you join us?`,
        responses: [
          {
            id: 'resp_13_stop',
            text: 'I\'m going to stop you.',
            nextDialogue: 'dialog_13_pity',
            effects: {
              triggersEvent: 'cult_hostile'
            }
          },
          {
            id: 'resp_13_join',
            text: 'Tell me how I can help.',
            nextDialogue: 'dialog_13_welcome',
            requirements: {
              corruption: 50
            },
            effects: {
              triggersEvent: 'cult_ally',
              corruptionChange: 10
            }
          },
          {
            id: 'resp_13_negotiate',
            text: 'What if there\'s another way?',
            nextDialogue: 'dialog_13_curious',
            requirements: {
              corruption: 30
            }
          }
        ]
      },
      {
        id: 'dialog_13_pity',
        speaker: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        text: `Pity. We could have used someone of your... experience. But if you stand against us, you stand against inevitability. The Sleeper WILL wake. With or without you.`
      },
      {
        id: 'dialog_13_welcome',
        speaker: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        text: `Welcome, brother/sister of the Deep! Your corruption marks you as one of us. The Sleeper has shown you truth, and you have accepted it. Come - help us prepare the vessels. Soon, we all ascend!`
      },
      {
        id: 'dialog_13_curious',
        speaker: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        text: `Another way? Intriguing. The Sleeper mentioned you might seek a middle path. Speak. What do you propose?`
      }
    ],

    journals: [
      {
        id: 'journal_13_decision',
        questId: 'cosmic_13_cult_plan',
        timestamp: new Date(),
        title: 'The Moment of Truth',
        content: 'The cult\'s ritual is in three days. I have to make my choice now. Stop them and keep the entity bound? Join them and help it wake? Or find some third option that no one else has considered? Whatever I choose, the world changes forever.',
        category: 'objective'
      }
    ],

    levelRequirement: 34,

    objectives: [
      {
        id: 'obj_13_infiltrate',
        type: 'investigate',
        description: 'Infiltrate the cult\'s ritual site',
        target: 'location_ritual_site',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_13_steal_plans',
        type: 'collect',
        description: 'Steal the complete ritual plans',
        target: 'item_ritual_plans',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_13_confront',
        type: 'speak',
        description: 'Confront High Priest Ezekiel',
        target: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_13_choose_path',
        type: 'choose',
        description: 'Choose your path forward',
        required: 1,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [],

    visions: [],

    corruptionGain: 15,

    atmosphericDescriptions: [
      'The ritual site pulses with barely-contained power.',
      'The corrupted vessels move in perfect synchronization - they\'re already linked to the entity.',
      'You can feel the cosmic alignment approaching - reality itself is bending.',
      'The cult members look at you with knowing eyes - they can sense your corruption level.'
    ],

    baseRewards: [
      {
        type: 'xp',
        amount: 3250
      }
    ],

    choiceRewards: [
      {
        choiceId: 'resp_13_join',
        choiceName: 'Join the Cult',
        rewards: [
          {
            type: 'power',
            powerId: 'power_vessel_communion'
          }
        ],
        consequences: [
          'Became allied with the Cult of the Deep',
          'Path to Awakening ending opened',
          'Coalition will oppose you'
        ],
        endingPath: CosmicEnding.AWAKENING
      }
    ],

    relationshipChanges: [
      {
        npcId: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        change: 50,
        reason: 'Final confrontation completed'
      }
    ],

    estimatedDuration: 90,
    difficulty: 'very_hard',
    canAbandon: false
  },

  // Quest 14: Gathering Allies
  {
    id: 'cosmic_14_gathering_allies',
    act: CosmicAct.REVELATION,
    questNumber: 14,
    name: 'Gathering Allies',
    description: 'Unite the factions for the final confrontation',
    briefing: `The time for solitary action is over. Depending on your choice, you'll need allies. The Coalition can help renew the seals. The military can help destroy the entity. The cult can help wake it. Dr. Blackwood and the Survivor might help negotiate with it. Gather those who share your vision before the final confrontation.`,
    previousQuest: 'cosmic_13_cult_plan',

    lore: [],

    dialogues: [
      {
        id: 'dialog_14_chief',
        speaker: CosmicNPC.CHIEF_FALLING_STAR,
        text: `You've made your choice, I can see it in your eyes. If you stand with the Guardians, we stand with you. We are ready to renew the seals, to pay the price our ancestors paid. But we cannot do it alone. Will you help us?`,
        responses: [
          {
            id: 'resp_14_help_coalition',
            text: 'I\'ll help renew the seals. The entity must stay bound.',
            effects: {
              triggersEvent: 'coalition_ally'
            }
          }
        ]
      },
      {
        id: 'dialog_14_holloway',
        speaker: CosmicNPC.SERGEANT_HOLLOWAY,
        text: `Command has authorized extreme measures. We have experimental weapons, magical amplifiers, enough firepower to crack the earth itself. If you're planning to destroy that thing down there, we can help. It'll be dangerous as hell, but it's possible.`,
        responses: [
          {
            id: 'resp_14_help_military',
            text: 'Help me destroy the entity permanently.',
            effects: {
              triggersEvent: 'military_ally'
            }
          }
        ]
      }
    ],

    journals: [
      {
        id: 'journal_14_alliance',
        questId: 'cosmic_14_gathering_allies',
        timestamp: new Date(),
        title: 'The Alliance Forms',
        content: 'I\'ve gathered my allies. Together, we\'ll face What-Waits-Below and determine the fate of the world. Whatever happens in The Scar, we face it united.',
        category: 'objective'
      }
    ],

    levelRequirement: 35,

    objectives: [
      {
        id: 'obj_14_choose_faction',
        type: 'choose',
        description: 'Choose which faction to ally with',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_14_recruit',
        type: 'speak',
        description: 'Recruit key allies',
        required: 3,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_14_prepare',
        type: 'collect',
        description: 'Gather necessary supplies and artifacts',
        target: 'item_final_preparations',
        required: 5,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [],
    visions: [],
    corruptionGain: 0,

    atmosphericDescriptions: [
      'Tension builds as the cosmic alignment approaches.',
      'Your allies look to you for leadership.',
      'The Scar pulses with increasing power.',
      'Time is running out.'
    ],

    baseRewards: [
      {
        type: 'xp',
        amount: 3500
      }
    ],

    estimatedDuration: 75,
    difficulty: 'hard',
    canAbandon: false
  },

  // Quest 15: The Deep Temple
  {
    id: 'cosmic_15_deep_temple',
    act: CosmicAct.REVELATION,
    questNumber: 15,
    name: 'The Deep Temple',
    description: 'Reach the heart of The Scar where the entity sleeps',
    briefing: `At the very bottom of The Scar lies the Temple - the chamber where What-Waits-Below itself rests in slumber. All three seals converge there. The cult's ritual will take place there. Your final confrontation will happen there. It's time to descend to the deepest depth and face what waits below.`,
    previousQuest: 'cosmic_14_gathering_allies',

    lore: [
      {
        id: 'lore_15_temple',
        category: LoreCategory.ARCHAEOLOGICAL,
        title: "The Temple at the Bottom",
        content: `The Temple is not a building - it's a space carved from reality itself. The entity's presence warps the physical laws around it. Inside the Temple, up and down have no meaning. Past and future exist simultaneously. The entity's sleeping form is visible there, massive and incomprehensible. Few who see it remain sane.`,
        source: "Coalition warnings"
      }
    ],

    dialogues: [],

    journals: [
      {
        id: 'journal_15_temple',
        questId: 'cosmic_15_deep_temple',
        timestamp: new Date(),
        title: 'The Final Depth',
        content: 'I\'ve reached the Temple. I stand before What-Waits-Below in its physical form. It\'s beautiful. It\'s terrible. It\'s beyond anything I could have imagined. Now comes the choice that will define everything.',
        category: 'revelation'
      }
    ],

    levelRequirement: 36,

    objectives: [
      {
        id: 'obj_15_final_descent',
        type: 'descend',
        description: 'Make the final descent to the Temple',
        required: 1,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 15
      },
      {
        id: 'obj_15_witness_entity',
        type: 'witness',
        description: 'Witness What-Waits-Below in its physical form',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_15_examine_seals',
        type: 'investigate',
        description: 'Examine all three seals at their convergence',
        required: 3,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_15_entity',
        trigger: 'Seeing the entity',
        description: `You stand in the Temple and look upon What-Waits-Below. It defies description. Your mind tries to process what you're seeing and fails. It's vast - impossibly vast, despite being contained in a finite space. It's made of matter that shouldn't exist. It radiates power that could unmake reality. And it's asleep, dreaming dreams that leak into the world above. But even in sleep, it knows you're there. You feel its attention, vast and ancient and utterly alien. "You came," it says without speaking. "Now choose."`,
        corruptionGain: 30,
        visionTriggered: 'vision_15_entity_form'
      }
    ],

    visions: [
      {
        id: 'vision_15_entity_form',
        name: 'The Sleeper Revealed',
        narrative: `You see What-Waits-Below's true form - or at least, the portion of it that exists in this reality. It's simultaneously:\n\nA mass of tentacles and eyes, like something from a nightmare.\nA geometric impossibility, all angles that shouldn't connect.\nA void in the shape of something almost human.\nA star collapsed into consciousness.\nAll of these and none of these.\n\nBut beyond the form, you perceive its essence: ancient wisdom, cosmic loneliness, patient determination, and a genuine (if incomprehensible) desire to help humanity transcend its limitations.\n\nIt's not evil. It's not good. It's something else entirely - something so far beyond human categories that even trying to judge it seems absurd.\n\nBut it IS dangerous. Not out of malice, but because its very existence warps reality around it. Even bound and sleeping, it affects the world. If fully awake and free, the changes would be immeasurable.\n\nThe question isn't whether it's good or evil. The question is: can humanity survive its awakening?`,
        timestamp: new Date()
      }
    ],

    corruptionGain: 30,

    atmosphericDescriptions: [
      'The Temple exists in impossible space - you can see all of it from every angle simultaneously.',
      'Time flows strangely here - you experience moments that haven\'t happened yet.',
      'The entity\'s presence fills everything - the air, the stone, your own thoughts.',
      'This is the center of everything - the point around which The Scar\'s reality revolves.'
    ],

    baseRewards: [
      {
        type: 'xp',
        amount: 4000
      },
      {
        type: 'knowledge',
        loreId: 'lore_15_temple'
      }
    ],

    worldEffects: [
      {
        id: 'effect_15_act3_complete',
        type: 'environmental',
        description: 'Act 3 complete - All truths revealed, all allies gathered, the final choice approaches',
        affectedArea: 'all',
        isPermanent: true
      }
    ],

    estimatedDuration: 90,
    difficulty: 'extreme',
    canAbandon: false
  }
];
