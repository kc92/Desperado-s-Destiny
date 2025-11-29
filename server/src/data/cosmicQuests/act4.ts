/**
 * Act 4: Confrontation (Level 36-40)
 * The Final Choice and Multiple Endings
 *
 * The player makes their final choice and experiences one of four
 * different endings based on their corruption level and decisions.
 */

import {
  CosmicQuest,
  CosmicAct,
  LoreCategory,
  CosmicNPC,
  CosmicEnding,
  Faction
} from '@desperados/shared';

export const ACT_4_QUESTS: CosmicQuest[] = [
  // Quest 16: Preparations
  {
    id: 'cosmic_16_preparations',
    act: CosmicAct.CONFRONTATION,
    questNumber: 16,
    name: 'Preparations',
    description: 'Make final preparations for the confrontation',
    briefing: `The cosmic alignment is tomorrow. Whatever path you've chosen - renewal, destruction, bargaining, or awakening - you must prepare. Gather the final components. Perform the preliminary rituals. Say your goodbyes. After tomorrow, nothing will be the same.`,
    previousQuest: 'cosmic_15_deep_temple',

    lore: [],

    dialogues: [
      {
        id: 'dialog_16_final_words',
        speaker: 'Narrator',
        text: `You stand at the precipice of the most important decision of your life. Your allies are gathered. Your path is chosen. The stars begin to align. Tomorrow, you will face What-Waits-Below and determine the fate of the world. How does that make you feel?`,
        responses: [
          {
            id: 'resp_16_ready',
            text: 'I\'m ready. Whatever comes, I\'ll face it.',
            nextDialogue: 'dialog_16_strength'
          },
          {
            id: 'resp_16_afraid',
            text: 'Terrified. But I have to do this.',
            nextDialogue: 'dialog_16_courage'
          },
          {
            id: 'resp_16_certain',
            text: 'Certain. This is what I was meant to do.',
            nextDialogue: 'dialog_16_destiny'
          }
        ]
      },
      {
        id: 'dialog_16_strength',
        speaker: 'Narrator',
        text: `Strength is good. You'll need it for what comes next.`
      },
      {
        id: 'dialog_16_courage',
        speaker: 'Narrator',
        text: `Courage isn't the absence of fear. It's acting despite it. You have courage.`
      },
      {
        id: 'dialog_16_destiny',
        speaker: 'Narrator',
        text: `Perhaps you're right. Perhaps this WAS your destiny all along.`
      }
    ],

    journals: [
      {
        id: 'journal_16_eve',
        questId: 'cosmic_16_preparations',
        timestamp: new Date(),
        title: 'The Eve of Destiny',
        content: 'Tomorrow, everything changes. I\'ve made my choice. I\'ve gathered my allies. I\'ve prepared as much as possible. Now all that remains is to see it through. Whatever happens, I won\'t back down.',
        category: 'objective'
      }
    ],

    levelRequirement: 36,

    objectives: [
      {
        id: 'obj_16_gather_components',
        type: 'collect',
        description: 'Gather the final ritual components',
        target: 'item_final_components',
        required: 7,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_16_speak_allies',
        type: 'speak',
        description: 'Speak with your allies one final time',
        required: 3,
        current: 0,
        isOptional: true
      },
      {
        id: 'obj_16_meditate',
        type: 'perform_ritual',
        description: 'Perform a final meditation',
        required: 1,
        current: 0,
        isOptional: true
      }
    ],

    sanityEvents: [],
    visions: [],
    corruptionGain: 5,

    atmosphericDescriptions: [
      'The stars begin their fateful alignment.',
      'You can feel the cosmic forces gathering.',
      'Your allies prepare in their own ways.',
      'This is the calm before the storm.'
    ],

    baseRewards: [
      {
        type: 'xp',
        amount: 4500
      }
    ],

    estimatedDuration: 60,
    difficulty: 'normal',
    canAbandon: false
  },

  // Quest 17: The Final Descent
  {
    id: 'cosmic_17_final_descent',
    act: CosmicAct.CONFRONTATION,
    questNumber: 17,
    name: 'The Final Descent',
    description: 'Journey to the Temple for the final confrontation',
    briefing: `The stars have aligned. The time is now. With your allies at your side (or cultists, depending on your choice), you descend to the Temple one final time. What-Waits-Below knows you're coming. The seals tremble on the edge of breaking. Reality itself holds its breath.`,
    previousQuest: 'cosmic_16_preparations',

    lore: [],

    dialogues: [],

    journals: [
      {
        id: 'journal_17_descent',
        questId: 'cosmic_17_final_descent',
        timestamp: new Date(),
        title: 'The Final Descent',
        content: 'We descend into The Scar for the last time. By the time we emerge, the world will be different. One way or another, this ends today.',
        category: 'objective'
      }
    ],

    levelRequirement: 38,

    objectives: [
      {
        id: 'obj_17_enter_scar',
        type: 'descend',
        description: 'Enter The Scar with your allies',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_17_reach_temple',
        type: 'investigate',
        description: 'Reach the Deep Temple',
        target: 'location_deep_temple',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_17_position_allies',
        type: 'perform_ritual',
        description: 'Position allies at the three seals',
        required: 1,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_17_entity_wakes',
        trigger: 'Entering the Temple',
        description: `The entity knows you're here. Its vast consciousness turns its full attention to you for the first time. You feel the weight of its gaze - 2,000 years of imprisonment, eons of memory, cosmic wisdom beyond measure. It speaks, and the very stones tremble: "At last. The dreamer who will choose. Show me, little one. What future will you create?"`,
        corruptionGain: 20
      }
    ],

    visions: [],
    corruptionGain: 20,

    atmosphericDescriptions: [
      'The descent feels different this time - final, irrevocable.',
      'Your allies are tense, ready for anything.',
      'The entity\'s power radiates from below like heat from a furnace.',
      'The moment of truth has arrived.'
    ],

    baseRewards: [
      {
        type: 'xp',
        amount: 5000
      }
    ],

    estimatedDuration: 45,
    difficulty: 'very_hard',
    canAbandon: false
  },

  // Quest 18: Avatar of the Deep
  {
    id: 'cosmic_18_avatar',
    act: CosmicAct.CONFRONTATION,
    questNumber: 18,
    name: 'Avatar of the Deep',
    description: 'Face the entity\'s manifestation',
    briefing: `What-Waits-Below cannot fully interact with you while bound, so it creates an Avatar - a fragment of itself given temporary form. This Avatar will test you, question you, and ultimately accept or oppose your chosen path. Depending on your choice, this will be a negotiation, a battle, or a communion.`,
    previousQuest: 'cosmic_17_final_descent',

    lore: [],

    dialogues: [
      {
        id: 'dialog_18_avatar',
        speaker: 'Avatar of What-Waits-Below',
        text: `I am a fragment of the Whole, given form to speak with you directly. You have descended far, dreamer. You have learned much. You stand now at the crossroads of destiny. What is your choice? Will you free me? Bind me tighter? Destroy me? Or perhaps... make a bargain?`,
        responses: [
          {
            id: 'resp_18_banish',
            text: 'I choose to renew the seals. You must remain bound.',
            nextDialogue: 'dialog_18_banishment'
          },
          {
            id: 'resp_18_destroy',
            text: 'I choose to destroy you. The world isn\'t ready for you.',
            nextDialogue: 'dialog_18_destruction'
          },
          {
            id: 'resp_18_bargain',
            text: 'I propose a bargain. Limited freedom in exchange for restraint.',
            nextDialogue: 'dialog_18_negotiation',
            requirements: {
              corruption: 30
            }
          },
          {
            id: 'resp_18_awaken',
            text: 'I will help you wake. Transform the world.',
            nextDialogue: 'dialog_18_awakening',
            requirements: {
              corruption: 60
            }
          }
        ]
      },
      {
        id: 'dialog_18_banishment',
        speaker: 'Avatar of What-Waits-Below',
        text: `So be it. You choose the path of the Guardians. I am... disappointed. But I understand. Your species clings to the familiar. Very well. Renew your seals. But know this: they will weaken again. In another 2,000 years, another dreamer will come. Perhaps they will choose differently. I am patient. I can wait.`
      },
      {
        id: 'dialog_18_destruction',
        speaker: 'Avatar of What-Waits-Below',
        text: `Destruction? Ambitious. But to destroy me, you must sacrifice much. Are you willing to pay the price? So be it. Come then. Try to end what has existed since before your world was born. I will defend myself, but I will not hate you for trying. You do what you think is right.`
      },
      {
        id: 'dialog_18_negotiation',
        speaker: 'Avatar of What-Waits-Below',
        text: `A bargain? Interesting. You seek a middle path. Wisdom, perhaps, or cowardice. I will hear your terms. But know: I do not negotiate as humans do. If we make a bargain, it will be bound by cosmic forces neither of us can break. Choose your words carefully.`
      },
      {
        id: 'dialog_18_awakening',
        speaker: 'Avatar of What-Waits-Below',
        text: `Yes! Finally, one who understands! You have felt my touch, seen my truth, accepted the corruption that is really transformation. Together, we will remake this world into something beautiful. You will be my herald, my voice, my hand in the world above. Come. Let us break the seals and begin the new age!`
      }
    ],

    journals: [
      {
        id: 'journal_18_choice',
        questId: 'cosmic_18_avatar',
        timestamp: new Date(),
        title: 'The Choice Is Made',
        content: 'I\'ve made my choice and spoken it to the entity itself. Now comes the consequence. Whatever happens next, I chose this path willingly.',
        category: 'revelation'
      }
    ],

    levelRequirement: 39,

    objectives: [
      {
        id: 'obj_18_face_avatar',
        type: 'speak',
        description: 'Face the Avatar',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_18_make_choice',
        type: 'choose',
        description: 'Make your final choice',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_18_defend_or_join',
        type: 'perform_ritual',
        description: 'Defend your choice or join the entity',
        required: 1,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [],
    visions: [],
    corruptionGain: 10,

    atmosphericDescriptions: [
      'The Avatar shimmers with impossible power.',
      'Reality bends around it like light around a black hole.',
      'Your choice will echo through eternity.',
      'This is the moment everything has been leading to.'
    ],

    baseRewards: [
      {
        type: 'xp',
        amount: 5500
      }
    ],

    estimatedDuration: 60,
    difficulty: 'extreme',
    canAbandon: false
  },

  // Quest 19: The Choice
  {
    id: 'cosmic_19_the_choice',
    act: CosmicAct.CONFRONTATION,
    questNumber: 19,
    name: 'The Choice',
    description: 'Execute your chosen ending',
    briefing: `The moment has come. Based on your choice, you will now:\n- Perform the seal renewal ritual (Banishment)\n- Activate the destruction mechanism (Destruction)\n- Negotiate terms with the entity (Bargain)\n- Break the seals and wake What-Waits-Below (Awakening)\n\nThere is no turning back from this point.`,
    previousQuest: 'cosmic_18_avatar',

    lore: [],
    dialogues: [],
    journals: [],

    levelRequirement: 40,

    objectives: [
      {
        id: 'obj_19_execute',
        type: 'perform_ritual',
        description: 'Execute your chosen path',
        required: 1,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [],
    visions: [],
    corruptionGain: 0,

    atmosphericDescriptions: [
      'The cosmic forces converge.',
      'This is the point of no return.',
      'History will remember this moment.',
      'The fate of the world hangs in the balance.'
    ],

    baseRewards: [],

    choiceRewards: [
      // Banishment Ending
      {
        choiceId: 'ending_banishment',
        choiceName: 'Renew the Seals',
        rewards: [
          {
            type: 'xp',
            amount: 10000
          },
          {
            type: 'artifact',
            artifactId: 'artifact_guardian_legacy'
          },
          {
            type: 'reputation',
            faction: Faction.NAHI_COALITION,
            amount: 200
          }
        ],
        consequences: [
          'The seals are renewed for another age',
          'What-Waits-Below remains imprisoned',
          'The Coalition honors you as a Guardian',
          'The cult is defeated but not destroyed',
          'Peace is maintained, but the entity will never forgive this',
          'Your corruption is purged through the ritual'
        ],
        endingPath: CosmicEnding.BANISHMENT,
        worldEffects: [
          {
            id: 'effect_banishment',
            type: 'environmental',
            description: 'The Scar stabilizes. The entity sleeps once more. The world continues.',
            affectedArea: 'all',
            isPermanent: true
          }
        ]
      },
      // Destruction Ending
      {
        choiceId: 'ending_destruction',
        choiceName: 'Destroy the Entity',
        rewards: [
          {
            type: 'xp',
            amount: 10000
          },
          {
            type: 'artifact',
            artifactId: 'artifact_slayers_mark'
          }
        ],
        consequences: [
          'What-Waits-Below is destroyed in a cataclysmic working',
          'The Scar becomes a lifeless wasteland',
          'Three of your allies die in the ritual',
          'You bear the mark of deicide forever',
          'The entity\'s dying scream echoes across dimensions',
          'You have ended something ancient and irreplaceable'
        ],
        endingPath: CosmicEnding.DESTRUCTION,
        worldEffects: [
          {
            id: 'effect_destruction',
            type: 'environmental',
            description: 'The Scar is purified but dead. The entity is gone forever. Reality stabilizes but something precious is lost.',
            affectedArea: 'all',
            isPermanent: true
          }
        ]
      },
      // Bargain Ending
      {
        choiceId: 'ending_bargain',
        choiceName: 'Make a Bargain',
        rewards: [
          {
            type: 'xp',
            amount: 10000
          },
          {
            type: 'power',
            powerId: 'power_herald_authority'
          },
          {
            type: 'artifact',
            artifactId: 'artifact_covenant_stone'
          }
        ],
        consequences: [
          'You broker a deal between the entity and humanity',
          'The entity is partially freed but bound by oath',
          'You become the Herald - bridge between two worlds',
          'Reality slowly transforms in subtle ways',
          'You gain cosmic power but at the cost of your full humanity',
          'Neither side trusts you completely, but both need you'
        ],
        endingPath: CosmicEnding.BARGAIN,
        worldEffects: [
          {
            id: 'effect_bargain',
            type: 'environmental',
            description: 'The Scar becomes a place of power. The entity influences the world but is restrained. A new age begins.',
            affectedArea: 'all',
            isPermanent: true
          }
        ]
      },
      // Awakening Ending
      {
        choiceId: 'ending_awakening',
        choiceName: 'Wake the Entity',
        rewards: [
          {
            type: 'xp',
            amount: 10000
          },
          {
            type: 'power',
            powerId: 'power_transformed_one'
          },
          {
            type: 'artifact',
            artifactId: 'artifact_dreamers_crown'
          }
        ],
        consequences: [
          'The seals shatter. What-Waits-Below wakes fully.',
          'Reality transforms according to the entity\'s will',
          'You become one of its chosen, transcended beyond humanity',
          'The world is remade - beautiful and terrible',
          'Humanity is elevated but loses much of what made it human',
          'You are worshipped and feared as a demigod'
        ],
        endingPath: CosmicEnding.AWAKENING,
        worldEffects: [
          {
            id: 'effect_awakening',
            type: 'environmental',
            description: 'The Scar becomes a temple city. The entity walks the world. Reality is forever changed.',
            affectedArea: 'all',
            isPermanent: true
          }
        ]
      }
    ],

    estimatedDuration: 90,
    difficulty: 'extreme',
    canAbandon: false
  },

  // Quest 20: Aftermath
  {
    id: 'cosmic_20_aftermath',
    act: CosmicAct.CONFRONTATION,
    questNumber: 20,
    name: 'Aftermath',
    description: 'Experience the consequences of your choice',
    briefing: `It's done. Your choice has been made and executed. Now you must live with the consequences. The world has changed, and so have you. This is the epilogue to your cosmic journey.`,
    previousQuest: 'cosmic_19_the_choice',

    lore: [],

    dialogues: [
      {
        id: 'dialog_20_narrator',
        speaker: 'Narrator',
        text: `You have made your choice. The world continues, transformed by your decision. In the years to come, people will tell stories of the dreamer who descended into The Scar and changed the fate of the world. Some will call you hero. Some will call you villain. Some will call you something else entirely. But you know the truth: you did what you thought was right, with the knowledge you had. History will judge whether you chose wisely.`,
        responses: []
      }
    ],

    journals: [
      {
        id: 'journal_20_end',
        questId: 'cosmic_20_aftermath',
        timestamp: new Date(),
        title: 'The Story Ends',
        content: 'My journey into The Scar is complete. I\'ve made my choice and changed the world forever. I don\'t know if I chose correctly. Maybe there was no "correct" choice. But I chose, and I\'ll live with the consequences. The story of What-Waits-Below has reached its conclusion. Now begins the story of what comes after.',
        category: 'revelation'
      }
    ],

    levelRequirement: 40,

    objectives: [
      {
        id: 'obj_20_witness',
        type: 'witness',
        description: 'Witness the world after your choice',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_20_speak_survivors',
        type: 'speak',
        description: 'Speak with surviving allies',
        required: 1,
        current: 0,
        isOptional: true
      },
      {
        id: 'obj_20_reflect',
        type: 'witness',
        description: 'Reflect on your journey',
        required: 1,
        current: 0,
        isOptional: false
      }
    ],

    sanityEvents: [],
    visions: [],
    corruptionGain: 0,

    atmosphericDescriptions: [
      'The world is different now. You can feel it.',
      'Your allies look at you with new eyes.',
      'The Scar has changed, reflecting your choice.',
      'This is the beginning of a new chapter.'
    ],

    baseRewards: [
      {
        type: 'xp',
        amount: 15000
      },
      {
        type: 'gold',
        amount: 5000
      }
    ],

    estimatedDuration: 30,
    difficulty: 'normal',
    canAbandon: false
  }
];

// Export ending epilogues
export const ENDING_EPILOGUES: Record<CosmicEnding, string> = {
  [CosmicEnding.BANISHMENT]: `The seals are renewed, fed by the blood of new Guardians. What-Waits-Below sinks back into deep slumber, its dreams once again contained. The Scar stabilizes, the corruption recedes. The Coalition honors you as the greatest Guardian of this age.

But you know the truth: you've only delayed the inevitable. The seals will weaken again. In another 2,000 years, another dreamer will face the same choice. Perhaps they will choose differently.

The entity whispers to you sometimes in your dreams. Not angry, just... patient. It has waited eons. It can wait longer. "Until next time, little dreamer," it says. "Until next time."

The world continues as it was. Safe. Familiar. Unchanged.

And you wonder, late at night, if that was the right choice.`,

  [CosmicEnding.DESTRUCTION]: `The ritual is terrible and beautiful. You channel forces that mortals were never meant to touch. Three of your allies give their lives willingly. Their sacrifice fuels the working that tears What-Waits-Below from existence.

The entity's death scream echoes across dimensions. For a moment, you feel its pain, its confusion, its sadness at being destroyed rather than understood. Then... nothing. It's gone. Truly, permanently gone.

The Scar becomes a wasteland, but a safe one. No corruption spreads. No dreams invade sleeping minds. The threat is ended forever.

You bear the mark of deicide - the only mortal to kill a cosmic entity. Some revere you. Others fear you. You've saved the world, but you've also destroyed something ancient and irreplaceable.

In quiet moments, you wonder: did you save humanity from transcendence? Or did you rob them of it?`,

  [CosmicEnding.BARGAIN]: `You broker an impossible deal. What-Waits-Below accepts limited freedom in exchange for sworn restraint. You become the Herald - the bridge between the cosmic entity and humanity.

The entity influences the world, but subtly. Dreams become more vivid. Creativity flourishes. Some people report moments of cosmic insight. Reality shifts in small ways, becoming stranger but also more wonderful.

But there's a cost. You're neither fully human nor fully other. You understand things mortals shouldn't know. You carry the entity's power within you. People look at you and see something that makes them uncomfortable.

The Coalition doesn't trust you. The cult sees you as a traitor who limited their god. The military watches you warily. But you hold the balance between two worlds, and that's a burden only you can carry.

Some nights, you speak with the entity in your dreams. It's almost like having a friend. An alien, incomprehensible friend who could unmake reality if it wanted to. But a friend nonetheless.`,

  [CosmicEnding.AWAKENING]: `The seals shatter like glass. What-Waits-Below rises, and reality reshapes around it. The transformation is instantaneous and total.

The Scar becomes a temple city of impossible architecture. The entity walks the world in a form humans can barely perceive. Those who accept its influence are elevated - transcended beyond mortality into something greater.

You are one of the first. The corruption that built up in you transforms into power. You become a demigod, a herald of the new age. The entity speaks through you, teaches through you, acts through you.

Humanity is remade. Some resist and are left behind. Others embrace the transformation and become something new - no longer quite human, but not suffering for it. The entity keeps its promise: it guides, it teaches, it elevates.

But the cost is everything familiar. The old world is gone. Humanity as it was ceases to exist. Those who resisted call you the great betrayer. Those who accepted call you the liberator.

You stand between the entity and the transformed humanity, wondering: did you save your species? Damn them? Or give them exactly what they needed?

The entity tells you: "You chose growth over stagnation. Evolution over preservation. You chose correctly."

But late at night, when you remember what it was like to be fully human, you're not so sure.`
};
