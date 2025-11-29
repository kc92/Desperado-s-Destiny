/**
 * Act 1: Whispers (Level 25-28)
 * Investigation and Discovery
 *
 * The player begins investigating strange disappearances and rumors,
 * slowly uncovering the existence of something ancient beneath The Scar.
 */

import {
  CosmicQuest,
  CosmicAct,
  LoreCategory,
  CosmicNPC,
  CosmicEnding
} from '@desperados/shared';

export const ACT_1_QUESTS: CosmicQuest[] = [
  // Quest 1: Strange Happenings
  {
    id: 'cosmic_01_strange_happenings',
    act: CosmicAct.WHISPERS,
    questNumber: 1,
    name: 'Strange Happenings',
    description: 'Investigate mysterious disappearances near The Scar',
    briefing: `The saloon keeper in Dustfall has been spreading unsettling tales. Miners who ventured too close to The Scar have gone missing. Some returned... changed. Others never came back at all. The town is growing nervous, and someone needs to look into these disappearances before panic sets in.`,

    lore: [
      {
        id: 'lore_01_missing_miners',
        category: LoreCategory.MINERS_JOURNAL,
        title: "Missing Persons Report",
        content: `Sheriff's Report, Dustfall - Three miners failed to return from prospecting expedition near The Scar's edge. Last seen heading toward old McGraw claim. Personal effects found at campsite, but no bodies. Lanterns still lit, food uneaten. No signs of struggle. Temperature around camp notably colder than surroundings.`,
        source: "Sheriff's office bulletin board"
      }
    ],

    dialogues: [
      {
        id: 'dialog_01_saloon_keeper',
        speaker: 'Saloon Keeper',
        text: `You looking into those disappearances? Good. Business is suffering with folks too scared to leave town. But I'll tell you something strange - the miners who came back, they ain't right. They stare at nothing, mutter about voices in the rocks. One of 'em tried to walk back out there in the middle of the night before his wife stopped him.`,
        responses: [
          {
            id: 'resp_01_investigate',
            text: 'I\'ll look into it. Where should I start?',
            nextDialogue: 'dialog_01_directions'
          },
          {
            id: 'resp_01_skeptical',
            text: 'Sounds like drunk miners to me.',
            nextDialogue: 'dialog_01_warning',
            effects: {
              corruptionChange: -2
            }
          }
        ]
      },
      {
        id: 'dialog_01_directions',
        speaker: 'Saloon Keeper',
        text: `Head east to the old McGraw claim. That's where most of the trouble's been. And stranger? Keep your wits about you out there. The Scar... it does things to people.`
      },
      {
        id: 'dialog_01_warning',
        speaker: 'Saloon Keeper',
        text: `That's what the sheriff said. Until his own deputy went missing. Now he's not so sure. Take a look for yourself if you don't believe me.`
      }
    ],

    journals: [
      {
        id: 'journal_01_start',
        questId: 'cosmic_01_strange_happenings',
        timestamp: new Date(),
        title: 'Investigation Begins',
        content: 'I\'ve agreed to investigate the disappearances near The Scar. Something about this feels wrong - not just outlaws or wild animals. The fear in people\'s eyes is real.',
        category: 'objective'
      }
    ],

    levelRequirement: 25,

    objectives: [
      {
        id: 'obj_01_visit_claim',
        type: 'investigate',
        description: 'Investigate the McGraw mining claim',
        target: 'location_mcgraw_claim',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_01_examine_camp',
        type: 'find',
        description: 'Examine the abandoned campsite',
        target: 'location_abandoned_camp',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_01_talk_survivor',
        type: 'speak',
        description: 'Speak with a surviving miner',
        target: CosmicNPC.MINER_MCGRAW,
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_01_collect_evidence',
        type: 'collect',
        description: 'Collect evidence from the sites',
        target: 'item_strange_evidence',
        required: 3,
        current: 0,
        isOptional: true
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_01_cold_spot',
        trigger: 'Entering abandoned camp',
        description: `As you approach the camp, the temperature plummets. Your breath mists in the air, despite the desert heat. The campfire still burns, but provides no warmth. You feel... watched.`,
        corruptionGain: 2,
        duration: 30000
      },
      {
        id: 'sanity_01_whisper',
        trigger: 'Examining miners\' belongings',
        description: `For a moment, you swear you hear whispers - not in any language you know, but somehow you understand the meaning: "Come deeper. We are waiting." The voice seems to come from inside your own skull.`,
        corruptionGain: 3,
        choices: [
          {
            id: 'choice_01_resist',
            text: 'Shake it off and focus on the investigation',
            corruptionModifier: -1,
            consequence: 'You force yourself to concentrate, pushing the whispers away'
          },
          {
            id: 'choice_01_listen',
            text: 'Listen more carefully to the whispers',
            corruptionModifier: 2,
            consequence: 'The whispers grow clearer, promising knowledge and power'
          }
        ]
      }
    ],

    visions: [],

    corruptionGain: 5,

    atmosphericDescriptions: [
      'The air near The Scar feels heavy, oppressive, as if the very atmosphere resists your presence.',
      'Strange shadows move at the edge of your vision, but when you turn to look, nothing is there.',
      'The ground seems to pulse faintly beneath your feet, like a slow, massive heartbeat.',
      'Birds refuse to fly over this area. An unnatural silence hangs over the landscape.'
    ],

    baseRewards: [
      {
        type: 'gold',
        amount: 150
      },
      {
        type: 'xp',
        amount: 500
      },
      {
        type: 'reputation',
        faction: 'settlerAlliance' as any,
        amount: 50
      }
    ],

    worldEffects: [
      {
        id: 'effect_01_town_concern',
        type: 'npc_appearance',
        description: 'Townsfolk begin discussing the investigation',
        affectedArea: 'dustfall',
        isPermanent: false,
        duration: 86400000 // 24 hours
      }
    ],

    estimatedDuration: 30,
    difficulty: 'normal',
    canAbandon: true
  },

  // Quest 2: The Old Miner's Tale
  {
    id: 'cosmic_02_miners_tale',
    act: CosmicAct.WHISPERS,
    questNumber: 2,
    name: 'The Old Miner\'s Tale',
    description: 'Learn what the old miner discovered in the depths',
    briefing: `Old McGraw survived his expedition into The Scar, but he hasn't been the same since. He speaks of "singing stones" and "doors that shouldn't be opened." Most dismiss him as mad, but you've seen the evidence. There's truth in his ravings, if you can piece it together.`,
    previousQuest: 'cosmic_01_strange_happenings',

    lore: [
      {
        id: 'lore_02_mcgraw_journal',
        category: LoreCategory.MINERS_JOURNAL,
        title: "McGraw's Final Journal Entry",
        content: `Day 47 - We found it. God help us, we found it. Twenty feet down, past the silver vein, there's a chamber. Not natural. The walls are smooth, covered in markings that hurt to look at. Jenkins touched one and... he changed. Started speaking in that language. Tried to make us stay. We sealed the tunnel, but I can still hear it calling. Always calling. The ground remembers. The stones sing.`,
        source: "Found in McGraw's shack"
      },
      {
        id: 'lore_02_ancient_warnings',
        category: LoreCategory.PETROGLYPHS,
        title: "Warning Glyphs",
        content: `Symbols carved into rock face near The Scar's edge. Coalition elder identifies them as ancient warnings: "What fell from sky must not wake. Guardians watch. Dreamers sleep. To wake them is to end the world as it is." The glyphs are estimated to be over 2,000 years old.`,
        source: "Rock face examination"
      }
    ],

    dialogues: [
      {
        id: 'dialog_02_mcgraw',
        speaker: CosmicNPC.MINER_MCGRAW,
        text: `You... you're here about the singing, aren't you? They all think I'm mad, but you've felt it too, haven't you? The pull. The Scar wants us down there. It's been waiting so long...`,
        responses: [
          {
            id: 'resp_02_what_found',
            text: 'What did you find down there, McGraw?',
            nextDialogue: 'dialog_02_chamber'
          },
          {
            id: 'resp_02_sealed',
            text: 'You said you sealed the tunnel. Where is it?',
            nextDialogue: 'dialog_02_location'
          },
          {
            id: 'resp_02_reassure',
            text: 'Easy now. You\'re safe. Just tell me what happened.',
            nextDialogue: 'dialog_02_story',
            requirements: {
              corruption: 0
            }
          }
        ]
      },
      {
        id: 'dialog_02_chamber',
        speaker: CosmicNPC.MINER_MCGRAW,
        text: `A chamber! Not made by human hands. The walls... they're alive. I know how that sounds, but they pulse like flesh. And the carvings - looking at them makes your eyes hurt, makes your head fill with voices. We should have left it alone!`
      },
      {
        id: 'dialog_02_location',
        speaker: CosmicNPC.MINER_MCGRAW,
        text: `Southeast of my main claim, where the ground turns black and glassy. You'll know it when you see it - nothing grows there anymore. But don't open it! For the love of God, don't open it!`,
        nextDialogue: 'dialog_02_warning'
      },
      {
        id: 'dialog_02_story',
        speaker: CosmicNPC.MINER_MCGRAW,
        text: `It started with dreams. Dreams of a city beneath the earth, older than mankind. Then we found the chamber. Jenkins went in first. When he came out... it wasn't Jenkins anymore. The thing wearing his face tried to convince us to go deeper. We ran.`
      },
      {
        id: 'dialog_02_warning',
        speaker: CosmicNPC.MINER_MCGRAW,
        text: `What's down there... it's been sleeping for eons. But it's starting to wake. I can feel it in my bones. Sometimes, when I close my eyes, I see through ITS eyes. Vast. Ancient. Hungry.`
      }
    ],

    journals: [
      {
        id: 'journal_02_revelation',
        questId: 'cosmic_02_miners_tale',
        timestamp: new Date(),
        title: 'The Chamber Below',
        content: 'McGraw\'s story is terrifying, but consistent with the evidence. There\'s something beneath The Scar - something old and unnatural. The question is: what do I do with this knowledge?',
        category: 'revelation'
      }
    ],

    levelRequirement: 25,

    objectives: [
      {
        id: 'obj_02_find_mcgraw',
        type: 'speak',
        description: 'Find and speak with Old McGraw',
        target: CosmicNPC.MINER_MCGRAW,
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_02_retrieve_journal',
        type: 'collect',
        description: 'Retrieve McGraw\'s journal from his shack',
        target: 'item_mcgraw_journal',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_02_find_chamber',
        type: 'investigate',
        description: 'Locate the sealed chamber entrance',
        target: 'location_sealed_chamber',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_02_examine_glyphs',
        type: 'investigate',
        description: 'Examine the warning glyphs near The Scar',
        target: 'location_warning_glyphs',
        required: 1,
        current: 0,
        isOptional: true,
        corruptionOnComplete: 1
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_02_jenkins',
        trigger: 'Finding Jenkins\' body',
        description: `You find Jenkins' corpse near the sealed entrance. He's been dead for weeks, but his eyes are still open - and they follow you as you move. When you check his pulse, his lips move: "Join us below." Then, nothing.`,
        corruptionGain: 5,
        visionTriggered: 'vision_02_first_glimpse'
      }
    ],

    visions: [
      {
        id: 'vision_02_first_glimpse',
        name: 'First Glimpse',
        narrative: `You see it for the first time - vast and terrible beyond comprehension. A consciousness older than the earth itself, trapped in slumber beneath countless tons of rock. It dreams, and its dreams leak into the world above. You see civilizations rise and fall in its sleep. You see the impact that created The Scar - not a meteor, but a prison. The entity fell from between the stars, and the ancient peoples of this land bound it here with powerful magic.\n\nBut the binding weakens. The seals decay. And IT knows you now. You feel its attention turn toward you like the gaze of a god. It speaks without words: "At last... one who listens."\n\nYou wake screaming.`,
        revealsLore: ['lore_02_ancient_warnings'],
        timestamp: new Date()
      }
    ],

    corruptionGain: 8,

    atmosphericDescriptions: [
      'McGraw\'s shack is covered in chalk markings - protective symbols from a dozen different cultures.',
      'The sealed chamber entrance radiates wrongness. Your instincts scream at you to leave.',
      'The warning glyphs seem to shift and move when you\'re not looking directly at them.',
      'You can hear it now - a faint singing, like crystalline chimes deep underground.'
    ],

    baseRewards: [
      {
        type: 'gold',
        amount: 200
      },
      {
        type: 'xp',
        amount: 750
      },
      {
        type: 'knowledge',
        loreId: 'lore_02_mcgraw_journal'
      }
    ],

    relationshipChanges: [
      {
        npcId: CosmicNPC.MINER_MCGRAW,
        change: 25,
        reason: 'Took his warnings seriously'
      }
    ],

    estimatedDuration: 45,
    difficulty: 'normal',
    canAbandon: true
  },

  // Quest 3: Dreams of the Deep
  {
    id: 'cosmic_03_dreams_deep',
    act: CosmicAct.WHISPERS,
    questNumber: 3,
    name: 'Dreams of the Deep',
    description: 'Experience and interpret the visions plaguing your sleep',
    briefing: `Since finding the chamber, you've been having dreams. Vivid, terrible dreams of an underground city and something vast that sleeps within it. Dr. Blackwood, a researcher from back East, has been studying similar phenomena. She might be able to help you understand what's happening.`,
    previousQuest: 'cosmic_02_miners_tale',

    lore: [
      {
        id: 'lore_03_blackwood_research',
        category: LoreCategory.SCIENTIFIC_NOTES,
        title: "Oneiric Phenomenon Study",
        content: `Dr. Blackwood's Research Notes - Subject group near The Scar exhibits shared dream patterns. Common themes: underground cities, non-Euclidean architecture, massive sleeping entity. Dream intensity correlates with proximity to The Scar and time spent in area. Subjects report feeling "called" or "summoned." Recommend psychological evaluation and relocation of affected individuals.`,
        source: "Dr. Blackwood's field notes"
      },
      {
        id: 'lore_03_dream_symbols',
        category: LoreCategory.ENTITY_DREAMS,
        title: "Recurring Dream Imagery",
        content: `Common symbols in Scar-related dreams: Black stars in wrong constellations. Angles that hurt to perceive. Doors that open inward infinitely. Cities built by no human hand. The Sleeper in the Dark. The Dreaming God. What-Waits-Below. All dreamers report the same final image: eyes opening in the deep.`,
        source: "Compiled from dream journals"
      }
    ],

    dialogues: [
      {
        id: 'dialog_03_blackwood',
        speaker: CosmicNPC.DR_BLACKWOOD,
        text: `Ah, another dreamer. You have the look - the shadows under your eyes, the way you keep glancing at corners. Tell me, in your dreams, do you see the city? The one with architecture that shouldn't be possible?`,
        responses: [
          {
            id: 'resp_03_describe',
            text: 'Yes. How do you know about it?',
            nextDialogue: 'dialog_03_study'
          },
          {
            id: 'resp_03_concerned',
            text: 'This is happening to others?',
            nextDialogue: 'dialog_03_epidemic'
          },
          {
            id: 'resp_03_dismissive',
            text: 'They\'re just dreams. Nothing more.',
            nextDialogue: 'dialog_03_warning',
            requirements: {
              corruption: 0
            }
          }
        ]
      },
      {
        id: 'dialog_03_study',
        speaker: CosmicNPC.DR_BLACKWOOD,
        text: `I've been studying the phenomenon for months. The dreams aren't random - they're communication. Something down there is reaching out through our sleeping minds. The closer you get to The Scar, the stronger the connection becomes.`
      },
      {
        id: 'dialog_03_epidemic',
        speaker: CosmicNPC.DR_BLACKWOOD,
        text: `Over forty documented cases in the past year alone. All with the same symptoms: vivid dreams, auditory hallucinations, compulsive behavior. Some try to walk into The Scar while sleepwalking. We've had to post guards.`
      },
      {
        id: 'dialog_03_warning',
        speaker: CosmicNPC.DR_BLACKWOOD,
        text: `That's what the first subjects said. Then they stopped sleeping. Then they stopped eating. Then they just... walked into The Scar and never came back. Don't underestimate this.`
      }
    ],

    journals: [
      {
        id: 'journal_03_dreams',
        questId: 'cosmic_03_dreams_deep',
        timestamp: new Date(),
        title: 'The Dreams Intensify',
        content: 'Every night, the dreams grow more vivid. I can remember the layout of the underground city now, as clearly as I know the streets of home. This isn\'t natural. Something is reaching into my mind.',
        category: 'discovery'
      }
    ],

    levelRequirement: 26,

    objectives: [
      {
        id: 'obj_03_meet_blackwood',
        type: 'speak',
        description: 'Meet with Dr. Blackwood at her research camp',
        target: CosmicNPC.DR_BLACKWOOD,
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_03_record_dreams',
        type: 'witness',
        description: 'Record three dream sequences',
        required: 3,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 3
      },
      {
        id: 'obj_03_compare_notes',
        type: 'collect',
        description: 'Compare notes with other dreamers',
        target: 'item_dream_journals',
        required: 4,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_03_meditation',
        type: 'perform_ritual',
        description: 'Attempt guided meditation with Dr. Blackwood',
        required: 1,
        current: 0,
        isOptional: true,
        corruptionOnComplete: 5
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_03_waking_dream',
        trigger: 'Meditation session',
        description: `During meditation, you slip into a waking dream. You're standing in the underground city. The architecture defies physics - stairs that lead up and down simultaneously, doors that open to reveal more doors, halls that twist back on themselves. And at the center, you see IT. The Dreaming God. What-Waits-Below. Its form is incomprehensible, constantly shifting. You feel its consciousness brush against yours like a mountain falling on an ant.`,
        corruptionGain: 8,
        visionTriggered: 'vision_03_city',
        choices: [
          {
            id: 'choice_03_retreat',
            text: 'Pull yourself back to consciousness',
            corruptionModifier: 0,
            consequence: 'You wrench yourself awake, gasping'
          },
          {
            id: 'choice_03_explore',
            text: 'Explore deeper into the vision',
            corruptionModifier: 5,
            consequence: 'You venture further, learning terrible truths'
          }
        ]
      }
    ],

    visions: [
      {
        id: 'vision_03_city',
        name: 'The Impossible City',
        narrative: `R'lyeh. Kadath. The City of the Sleeper. It has many names across many cultures. You walk its black stone streets in your dreams. The buildings tower impossibly high, built according to alien geometry. There are no right angles here - every corner is wrong, every surface unsettling to perceive.\n\nYou see other dreamers, phantoms walking these same streets across time. Some are recent - prospectors and settlers. Others are ancient - priests in ceremonial garb, warriors with bronze weapons. All are drawn to the center, to the great temple where IT sleeps.\n\nAs you approach, you understand the truth: this city is not beneath The Scar. The city IS The Scar. The impact crater is just the visible portion of something far larger, most of which exists in dimensions your mind cannot properly perceive.\n\nThe temple doors stand open. Beyond them, darkness absolute. And in that darkness, something stirs.`,
        revealsLore: ['lore_03_dream_symbols'],
        corruptionRequired: 5,
        timestamp: new Date()
      }
    ],

    corruptionGain: 12,

    atmosphericDescriptions: [
      'You\'ve stopped being able to tell when you\'re dreaming and when you\'re awake.',
      'The boundary between sleep and waking grows thin and permeable.',
      'Sometimes you catch yourself speaking in a language you don\'t know.',
      'Your reflection in mirrors doesn\'t quite match your movements anymore.'
    ],

    baseRewards: [
      {
        type: 'gold',
        amount: 250
      },
      {
        type: 'xp',
        amount: 1000
      },
      {
        type: 'knowledge',
        loreId: 'lore_03_blackwood_research'
      }
    ],

    choiceRewards: [
      {
        choiceId: 'choice_03_explore',
        choiceName: 'Embrace the visions',
        rewards: [
          {
            type: 'power',
            powerId: 'power_dream_sight'
          }
        ],
        consequences: [
          'Gained ability to perceive hidden truths',
          'Corruption increased significantly',
          'Dreams will be more intense'
        ]
      }
    ],

    relationshipChanges: [
      {
        npcId: CosmicNPC.DR_BLACKWOOD,
        change: 30,
        reason: 'Participated in research'
      }
    ],

    estimatedDuration: 60,
    difficulty: 'hard',
    canAbandon: false
  },

  // Quest 4: The Cult Revealed
  {
    id: 'cosmic_04_cult_revealed',
    act: CosmicAct.WHISPERS,
    questNumber: 4,
    name: 'The Cult Revealed',
    description: 'Discover the cult that worships What-Waits-Below',
    briefing: `Not everyone fears what lies beneath The Scar. Some worship it. A cult has been operating in secret, preparing for something they call "The Awakening." They're gathering artifacts, performing rituals, and recruiting new members among the dreamers. You need to infiltrate them and learn their plans.`,
    previousQuest: 'cosmic_03_dreams_deep',

    lore: [
      {
        id: 'lore_04_cult_manifesto',
        category: LoreCategory.CULT_MANIFESTO,
        title: "The Book of the Deep",
        content: `The Cult of the Deep's central text: "What sleeps beneath is not evil, but beyond such mortal concepts. It dreams the world into being. When It wakes, reality will be remade according to Its will. We, the faithful, shall be Its heralds and priests in the new age. The Sleeper stirs. The stars align. The seals weaken. Soon, the Awakening."`,
        source: "Confiscated cult literature"
      },
      {
        id: 'lore_04_ritual_calendar',
        category: LoreCategory.CULT_MANIFESTO,
        title: "The Awakening Schedule",
        content: `Cult calendar recovered from hidden shrine: Three seals bind What-Waits-Below. Seal of Stone (weakening). Seal of Spirit (intact). Seal of Stars (damaged). Required for Awakening: Break all three seals. Open the Temple Gates. Perform the Summoning at planetary alignment (six months). The Dreaming God will rise.`,
        source: "Hidden shrine beneath Dustfall"
      }
    ],

    dialogues: [
      {
        id: 'dialog_04_ezekiel',
        speaker: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        text: `Welcome, dreamer. Yes, I know what you are - I can see the shadow of the Deep in your eyes. You've heard the call, haven't you? The song of What-Waits-Below. You can join us. Help usher in the new age.`,
        responses: [
          {
            id: 'resp_04_pretend',
            text: 'Tell me more about this "new age."',
            nextDialogue: 'dialog_04_sermon'
          },
          {
            id: 'resp_04_refuse',
            text: 'You\'re insane. That thing needs to stay asleep.',
            nextDialogue: 'dialog_04_pity'
          },
          {
            id: 'resp_04_tempted',
            text: 'What would happen if it awakens?',
            nextDialogue: 'dialog_04_promise',
            requirements: {
              corruption: 15
            }
          }
        ]
      },
      {
        id: 'dialog_04_sermon',
        speaker: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        text: `The world as we know it is an illusion, sustained by the Dreamer's slumber. When It wakes, truth will be revealed. Those who serve faithfully will be elevated beyond mortality, beyond flesh, to exist as thoughts in the mind of god.`
      },
      {
        id: 'dialog_04_pity',
        speaker: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        text: `Pity. You've been touched by the Deep but lack the vision to understand. You'll see, when the Awakening comes. Everyone will see. The Sleeper will not be denied Its freedom.`
      },
      {
        id: 'dialog_04_promise',
        speaker: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        text: `Ah, you feel it, don't you? The pull. The promise. What-Waits-Below offers transcendence. Power beyond imagining. Knowledge of all that was and all that will be. All it asks is that we free it from its prison.`
      }
    ],

    journals: [
      {
        id: 'journal_04_infiltration',
        questId: 'cosmic_04_cult_revealed',
        timestamp: new Date(),
        title: 'Inside the Cult',
        content: 'I\'ve infiltrated the Cult of the Deep. Their beliefs are disturbing, but what\'s worse is that part of me understands their reasoning. The entity\'s influence is strong among them. I must be careful not to fall under its sway.',
        category: 'objective'
      }
    ],

    levelRequirement: 27,

    objectives: [
      {
        id: 'obj_04_find_cult',
        type: 'investigate',
        description: 'Locate the cult\'s meeting place',
        target: 'location_cult_shrine',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_04_attend_meeting',
        type: 'witness',
        description: 'Attend a cult gathering',
        required: 1,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 4
      },
      {
        id: 'obj_04_speak_ezekiel',
        type: 'speak',
        description: 'Speak with High Priest Ezekiel',
        target: CosmicNPC.HIGH_PRIEST_EZEKIEL,
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_04_steal_documents',
        type: 'collect',
        description: 'Steal cult documents and ritual items',
        target: 'item_cult_documents',
        required: 5,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_04_observe_ritual',
        type: 'witness',
        description: 'Observe a cult ritual',
        required: 1,
        current: 0,
        isOptional: true,
        corruptionOnComplete: 6
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_04_ritual',
        trigger: 'Witnessing cult ritual',
        description: `The cultists form a circle around a dark pool. They chant in that language you've heard in dreams. The water begins to glow with a sickly green light. For a moment, you see a reflection in the pool - but it's not the ceiling above. It's something else. Somewhere else. The Temple. And looking back at you from the depths is an eye. Vast. Ancient. Aware. It sees you. It KNOWS you.`,
        corruptionGain: 10,
        visionTriggered: 'vision_04_recognition',
        choices: [
          {
            id: 'choice_04_flee',
            text: 'Break away and flee the shrine',
            corruptionModifier: -2,
            consequence: 'You escape, but the cult is now aware of your infiltration'
          },
          {
            id: 'choice_04_watch',
            text: 'Continue watching the ritual',
            corruptionModifier: 5,
            consequence: 'You learn the ritual\'s true purpose - and the entity learns more about you'
          }
        ]
      }
    ],

    visions: [
      {
        id: 'vision_04_recognition',
        name: 'Recognition',
        narrative: `The entity recognizes you now. In your vision, you stand before it in the Temple beneath the world. It has many forms, all existing simultaneously: a mass of writhing tentacles, a void in the shape of something almost human, a geometric impossibility, a star collapsed into anti-light.\n\nBut what terrifies you most is the intelligence you perceive. This is not some mindless monster. What-Waits-Below is ancient beyond reckoning, wise beyond measure, and it has been watching humanity since before we climbed down from the trees.\n\nIt speaks, and its voice is the sound of stars dying: "You are the key. You will choose. Servant or obstacle. Herald or victim. The choice approaches. I have seen all possible futures. In most, you free me. In some, you try to stop me. The outcome is the same. I. Will. Wake."\n\nYou wake, and for hours afterward, you can still feel its attention on you.`,
        revealsLore: ['lore_04_cult_manifesto'],
        corruptionRequired: 15,
        timestamp: new Date()
      }
    ],

    corruptionGain: 15,

    atmosphericDescriptions: [
      'The cult shrine is decorated with symbols that hurt to look at directly.',
      'You can feel the entity\'s presence here, stronger than anywhere else you\'ve been.',
      'Some of the cultists have physical changes - extra fingers, eyes in wrong places.',
      'The air in the shrine tastes like copper and ozone.'
    ],

    baseRewards: [
      {
        type: 'gold',
        amount: 300
      },
      {
        type: 'xp',
        amount: 1250
      },
      {
        type: 'knowledge',
        loreId: 'lore_04_ritual_calendar'
      }
    ],

    choiceRewards: [
      {
        choiceId: 'choice_04_watch',
        choiceName: 'Learn the ritual',
        rewards: [
          {
            type: 'knowledge',
            loreId: 'lore_04_cult_manifesto'
          }
        ],
        consequences: [
          'Learned the cult\'s ritual techniques',
          'The entity is now aware of you',
          'Corruption increased'
        ],
        endingPath: CosmicEnding.BARGAIN
      }
    ],

    worldEffects: [
      {
        id: 'effect_04_cult_aware',
        type: 'npc_appearance',
        description: 'Cult members are now aware of your presence',
        affectedArea: 'all',
        isPermanent: true
      }
    ],

    estimatedDuration: 75,
    difficulty: 'hard',
    canAbandon: false
  },

  // Quest 5: Ancient Warnings
  {
    id: 'cosmic_05_ancient_warnings',
    act: CosmicAct.WHISPERS,
    questNumber: 5,
    name: 'Ancient Warnings',
    description: 'Learn the Coalition\'s ancient knowledge of What-Waits-Below',
    briefing: `The Nahi Coalition has known about What-Waits-Below for generations. Chief Falling Star, the eldest of the Coalition elders, guards knowledge passed down for two thousand years. The Coalition has been protecting the world from the entity's awakening since long before settlers arrived. It's time you learned the truth they've kept hidden.`,
    previousQuest: 'cosmic_04_cult_revealed',

    lore: [
      {
        id: 'lore_05_oral_history',
        category: LoreCategory.ORAL_HISTORY,
        title: "The Star-Fall Story",
        content: `Coalition oral history, as told by Chief Falling Star: "In the time of the ancestors, before the first people walked this land, the stars fought a war. One of the defeated fell to earth, creating The Scar. Our people found it sleeping in the crater, dreaming. The wisest shamans bound it with three seals: Stone, Spirit, and Stars. We have guarded these seals for 2,000 winters. The Sleeper must never wake."`,
        source: "Chief Falling Star's testimony"
      },
      {
        id: 'lore_05_guardian_duty',
        category: LoreCategory.ORAL_HISTORY,
        title: "The Guardian's Burden",
        content: `From the Coalition's sacred texts: "Each generation must renew the seals. The Seal of Stone requires blood of the guardians. The Seal of Spirit requires sacrifice of memory. The Seal of Stars requires the death of a star-touched one. The price is heavy, but the alternative is the end of the world. We are the Guardians. This is our sacred duty."`,
        source: "Coalition sacred chamber"
      },
      {
        id: 'lore_05_weakening',
        category: LoreCategory.PROPHECY,
        title: "The Prophecy of Awakening",
        content: `Ancient prophecy carved in the Guardian Chamber: "When the earth-breakers come (miners), when the binding-ignorant arrive (settlers), the seals will weaken. In the time of the sixth generation, a dreamer will come who walks both paths. They will choose: strengthen the binding or break the final seal. On their choice hangs the fate of all that lives."`,
        source: "Prophecy stone, Guardian Chamber"
      }
    ],

    dialogues: [
      {
        id: 'dialog_05_chief',
        speaker: CosmicNPC.CHIEF_FALLING_STAR,
        text: `You have been marked by the Sleeper. I see its touch upon your spirit. You are the one from the prophecy - the dreamer who will choose. I will tell you what my people have guarded for 2,000 years, though the knowledge is a burden you may not wish to carry.`,
        responses: [
          {
            id: 'resp_05_ready',
            text: 'I need to know the truth. All of it.',
            nextDialogue: 'dialog_05_history'
          },
          {
            id: 'resp_05_prophecy',
            text: 'What prophecy? What choice?',
            nextDialogue: 'dialog_05_prophecy'
          },
          {
            id: 'resp_05_seals',
            text: 'The cult spoke of seals. Can they be strengthened?',
            nextDialogue: 'dialog_05_seals'
          }
        ]
      },
      {
        id: 'dialog_05_history',
        speaker: CosmicNPC.CHIEF_FALLING_STAR,
        text: `The Sleeper is older than this world. It came from between the stars, fleeing a war we cannot comprehend. It fell here, wounded, and entered a healing sleep. But its dreams are dangerous - they reshape reality. Our ancestors bound it to protect the world from its influence.`
      },
      {
        id: 'dialog_05_prophecy',
        speaker: CosmicNPC.CHIEF_FALLING_STAR,
        text: `The prophecy says that in our time, a dreamer will come who has been touched by the Sleeper but not consumed by it. This dreamer will face a choice: help the Guardians renew the seals, or help the worshippers break them. You are that dreamer. The choice will be yours alone.`
      },
      {
        id: 'dialog_05_seals',
        speaker: CosmicNPC.CHIEF_FALLING_STAR,
        text: `The seals can be renewed, but the price is terrible. The Seal of Stone requires guardian blood. The Seal of Spirit requires a sacrifice of memory - those who perform it forget everything they love. The Seal of Stars requires a death. These prices have been paid for 2,000 years.`
      }
    ],

    journals: [
      {
        id: 'journal_05_burden',
        questId: 'cosmic_05_ancient_warnings',
        timestamp: new Date(),
        title: 'The Guardian\'s Burden',
        content: 'The Coalition has been protecting the world from What-Waits-Below for millennia. They\'ve paid terrible prices to keep it sleeping. Now, apparently, the choice falls to me. I\'m not sure I\'m worthy of such responsibility.',
        category: 'revelation'
      }
    ],

    levelRequirement: 28,

    objectives: [
      {
        id: 'obj_05_find_chief',
        type: 'speak',
        description: 'Speak with Chief Falling Star',
        target: CosmicNPC.CHIEF_FALLING_STAR,
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_05_guardian_chamber',
        type: 'investigate',
        description: 'Visit the Coalition\'s Guardian Chamber',
        target: 'location_guardian_chamber',
        required: 1,
        current: 0,
        isOptional: false
      },
      {
        id: 'obj_05_examine_seals',
        type: 'investigate',
        description: 'Examine the three binding seals',
        required: 3,
        current: 0,
        isOptional: false,
        corruptionOnComplete: 3
      },
      {
        id: 'obj_05_learn_renewal',
        type: 'speak',
        description: 'Learn the seal renewal rituals',
        target: CosmicNPC.SHAMAN_GRAY_WOLF,
        required: 1,
        current: 0,
        isOptional: true
      }
    ],

    sanityEvents: [
      {
        id: 'sanity_05_seal_vision',
        trigger: 'Examining the seals',
        description: `When you touch the Seal of Stone, you see visions of all those who have bled to maintain it. Thousands of guardians across two millennia, each giving their blood to keep the world safe. You feel their determination, their fear, their love for the world above. Then you feel something else - the Sleeper's rage at being imprisoned. It batters against the seals like an ocean against a dam. The seals are weakening.`,
        corruptionGain: 5,
        visionTriggered: 'vision_05_binding'
      }
    ],

    visions: [
      {
        id: 'vision_05_binding',
        name: 'The First Binding',
        narrative: `You witness the moment of the first binding, 2,000 years ago. The entity has just fallen from the sky, creating The Scar. It is wounded, disoriented, but still unimaginably powerful. Shamans from a dozen tribes gather, performing the greatest working of magic the world has ever seen.\n\nThey weave the three seals: Stone from the earth itself, Spirit from their own life force, Stars from the cosmic alignment overhead. The entity fights them, lashing out with psychic force that kills half the assembled shamans instantly. But the survivors hold firm.\n\nThe seals snap into place. The entity's scream of rage and pain shakes the earth for a thousand miles. It sinks into forced slumber, still raging, still aware, but bound.\n\nThe surviving shamans know they've saved the world. They also know they've made an enemy that will never forgive, never forget, and never stop trying to break free.\n\nThe vision ends, and you understand: the entity has been planning its escape for 2,000 years. And it has plans for those who imprisoned it.`,
        revealsLore: ['lore_05_guardian_duty'],
        timestamp: new Date()
      }
    ],

    corruptionGain: 10,

    atmosphericDescriptions: [
      'The Guardian Chamber is covered in protective symbols from floor to ceiling.',
      'You can feel the power of the seals thrumming through the earth.',
      'The air here feels sacred, heavy with the weight of ancient duty.',
      'Coalition guardians watch you with eyes that have seen too much.'
    ],

    baseRewards: [
      {
        type: 'gold',
        amount: 350
      },
      {
        type: 'xp',
        amount: 1500
      },
      {
        type: 'reputation',
        faction: 'nahiCoalition' as any,
        amount: 100
      },
      {
        type: 'knowledge',
        loreId: 'lore_05_oral_history'
      }
    ],

    relationshipChanges: [
      {
        npcId: CosmicNPC.CHIEF_FALLING_STAR,
        change: 50,
        reason: 'Entrusted with sacred knowledge'
      },
      {
        faction: 'nahiCoalition' as any,
        change: 75,
        reason: 'Learned the Guardian secrets'
      }
    ],

    worldEffects: [
      {
        id: 'effect_05_guardian_trust',
        type: 'faction_war',
        description: 'Coalition recognizes you as a potential Guardian',
        affectedArea: 'all',
        isPermanent: true
      }
    ],

    estimatedDuration: 90,
    difficulty: 'hard',
    canAbandon: false
  }
];
