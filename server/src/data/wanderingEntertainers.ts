/**
 * Wandering Entertainers
 *
 * Phase 4, Wave 4.1 - Traveling entertainer NPCs who bring life and color to the world
 * They perform at various locations, share stories, provide entertainment, and can be sources of information
 */

import { NPCActivity, NPCSchedule, ScheduleEntry, PersonalityType, MoodType } from '@desperados/shared';

/**
 * Performance types available
 */
export enum PerformanceType {
  PIANO = 'piano',
  MAGIC = 'magic',
  SINGING = 'singing',
  STORYTELLING = 'storytelling',
  DANCING = 'dancing',
  HARMONICA = 'harmonica',
  WILD_WEST_SHOW = 'wild_west_show',
  FORTUNE_TELLING = 'fortune_telling',
  GOSPEL = 'gospel',
  COMEDY = 'comedy'
}

/**
 * Route stop for wandering entertainers
 */
export interface RouteStop {
  locationId: string;
  locationName: string;
  arrivalDay: number;      // Day of week (0-6)
  stayDuration: number;    // Days at this location
  performanceVenue: string; // Specific venue at location
}

/**
 * Performance definition
 */
export interface Performance {
  id: string;
  name: string;
  description: string;
  performanceType: PerformanceType;
  duration: number;        // Minutes
  energyCost: number;      // Energy to watch
  moodEffect: {
    mood: string;
    duration: number;      // Minutes
    intensity: number;
  };
  rewards?: {
    experience?: number;
    gold?: number;
    item?: string;
    buff?: {
      stat: string;
      modifier: number;
      duration: number;    // Minutes
    };
  };
}

/**
 * Teachable skill from entertainer
 */
export interface TeachableSkill {
  skillId: string;
  skillName: string;
  trustRequired: number;   // 0-100
  energyCost: number;
  goldCost: number;
  description: string;
  effect: {
    stat: string;
    modifier: number;
    permanent: boolean;
  };
}

/**
 * Entertainer dialogue
 */
export interface EntertainerDialogue {
  greeting: string[];
  aboutPerformance: string[];
  sharingGossip: string[];
  teachingSkill: string[];
  farewell: string[];
  duringPerformance: string[];
}

/**
 * Complete wandering entertainer definition
 */
export interface WanderingEntertainer {
  id: string;
  name: string;
  title: string;
  performanceType: PerformanceType;
  description: string;
  personality: PersonalityType;
  baseMood: MoodType;
  route: RouteStop[];
  schedule: NPCSchedule;
  performances: Performance[];
  dialogue: EntertainerDialogue;
  specialAbilities?: string[];
  teachableSkills?: TeachableSkill[];
  gossipAccess?: string[];  // What categories of gossip they can share
  trustLevel: number;       // Current trust with player (0-100)
}

/**
 * All 10 Wandering Entertainers
 */
export const WANDERING_ENTERTAINERS: WanderingEntertainer[] = [
  // ============================================
  // 1. "PIANO PETE" PATTERSON
  // ============================================
  {
    id: 'entertainer_piano_pete',
    name: 'Pete Patterson',
    title: 'Piano Pete',
    performanceType: PerformanceType.PIANO,
    description: 'A jovial saloon pianist with a repertoire of drinking songs and a knack for collecting gossip from drunk patrons.',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.HAPPY,
    route: [
      {
        locationId: 'red_gulch_saloon',
        locationName: 'Red Gulch Saloon',
        arrivalDay: 0,
        stayDuration: 2,
        performanceVenue: 'main_stage'
      },
      {
        locationId: 'whiskey_bend_saloon',
        locationName: 'Whiskey Bend Saloon',
        arrivalDay: 2,
        stayDuration: 2,
        performanceVenue: 'piano_corner'
      },
      {
        locationId: 'frontera_cantina',
        locationName: 'La Frontera Cantina',
        arrivalDay: 4,
        stayDuration: 3,
        performanceVenue: 'bar_area'
      }
    ],
    schedule: {
      npcId: 'entertainer_piano_pete',
      npcName: 'Piano Pete Patterson',
      homeLocation: 'traveling',
      personality: 'Jovial, heavy drinker, gossip collector',
      faction: 'neutral',
      defaultSchedule: [
        {
          hour: 0,
          endHour: 3,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Playing piano energetically)'
        },
        {
          hour: 3,
          endHour: 5,
          activity: NPCActivity.DRINKING,
          interruptible: true,
          dialogue: 'After-hours drink! Pull up a stool, friend.'
        },
        {
          hour: 5,
          endHour: 13,
          activity: NPCActivity.SLEEPING,
          interruptible: false,
          dialogue: '(Sleeping off last night)'
        },
        {
          hour: 13,
          endHour: 15,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Late breakfast. Or early dinner? I lose track.'
        },
        {
          hour: 15,
          endHour: 19,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'Gathering material for tonight. Got any good stories?'
        },
        {
          hour: 19,
          endHour: 20,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Pre-show meal. Show starts at 8!'
        },
        {
          hour: 20,
          endHour: 24,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Tickling the ivories)'
        }
      ]
    },
    performances: [
      {
        id: 'ragtime_revelry',
        name: 'Ragtime Revelry',
        description: 'Upbeat ragtime piano that gets the whole saloon stomping their feet',
        performanceType: PerformanceType.PIANO,
        duration: 30,
        energyCost: 5,
        moodEffect: {
          mood: 'excited',
          duration: 60,
          intensity: 2
        },
        rewards: {
          experience: 50,
          buff: {
            stat: 'luck',
            modifier: 5,
            duration: 60
          }
        }
      },
      {
        id: 'melancholy_melody',
        name: 'Melancholy Melody',
        description: 'Slow, sad ballads that bring tears to even the toughest cowboy',
        performanceType: PerformanceType.PIANO,
        duration: 20,
        energyCost: 3,
        moodEffect: {
          mood: 'melancholic',
          duration: 45,
          intensity: 1
        }
      }
    ],
    dialogue: {
      greeting: [
        "Well hello there! Come to hear some tunes?",
        "Always happy to see a music lover!",
        "Pull up a chair, let me play you something."
      ],
      aboutPerformance: [
        "I've been playing these keys for twenty years. Know every song ever written!",
        "Music's the universal language, friend. Brings people together.",
        "Best part of my job? Free drinks from happy customers!"
      ],
      sharingGossip: [
        "You'd be surprised what drunk folks tell the piano player...",
        "I hear things. People forget I'm here when they're drinking.",
        "Between songs, I listen. Learn all sorts of interesting things."
      ],
      teachingSkill: [
        "Want to learn some piano? I can show you the basics.",
        "Music's not just entertainment - it's a skill that opens doors.",
        "I could teach you a thing or two about reading a crowd."
      ],
      farewell: [
        "May your days be merry and your nights full of music!",
        "Come back anytime. I'll be here, playing away!",
        "Safe travels, friend!"
      ],
      duringPerformance: [
        "(Playing energetically)",
        "(Fingers dancing across the keys)",
        "(Too focused to talk)"
      ]
    },
    teachableSkills: [
      {
        skillId: 'music_appreciation',
        skillName: 'Music Appreciation',
        trustRequired: 20,
        energyCost: 10,
        goldCost: 50,
        description: 'Learn to appreciate music, increasing your mood benefits from performances',
        effect: {
          stat: 'performance_bonus',
          modifier: 25,
          permanent: true
        }
      },
      {
        skillId: 'gossip_gathering',
        skillName: 'Gossip Gathering',
        trustRequired: 50,
        energyCost: 15,
        goldCost: 100,
        description: 'Learn how to gather gossip from drunk patrons',
        effect: {
          stat: 'gossip_access',
          modifier: 1,
          permanent: true
        }
      }
    ],
    gossipAccess: ['CRIMINAL', 'ROMANCE', 'PERSONAL', 'BUSINESS', 'RUMOR'],
    trustLevel: 0,
    specialAbilities: [
      'Can teach music skill',
      'Knows secrets from drunk patrons',
      'Access to saloon gossip network'
    ]
  },

  // ============================================
  // 2. THE AMAZING ALONZO (MAGICIAN)
  // ============================================
  {
    id: 'entertainer_alonzo',
    name: 'Alfonso Magnifico',
    title: 'The Amazing Alonzo',
    performanceType: PerformanceType.MAGIC,
    description: 'A flamboyant stage magician with sleight of hand skills. Secretly observes everything while appearing to perform mere tricks.',
    personality: PersonalityType.VOLATILE,
    baseMood: MoodType.EXCITED,
    route: [
      {
        locationId: 'whiskey_bend_theater',
        locationName: 'Whiskey Bend Theater',
        arrivalDay: 0,
        stayDuration: 3,
        performanceVenue: 'main_stage'
      },
      {
        locationId: 'red_gulch_town_square',
        locationName: 'Red Gulch Town Square',
        arrivalDay: 3,
        stayDuration: 2,
        performanceVenue: 'outdoor_stage'
      },
      {
        locationId: 'frontera_plaza',
        locationName: 'Frontera Plaza',
        arrivalDay: 5,
        stayDuration: 2,
        performanceVenue: 'fountain_area'
      }
    ],
    schedule: {
      npcId: 'entertainer_alonzo',
      npcName: 'The Amazing Alonzo',
      homeLocation: 'traveling',
      personality: 'Flamboyant, secretly observant',
      faction: 'neutral',
      defaultSchedule: [
        {
          hour: 0,
          endHour: 8,
          activity: NPCActivity.SLEEPING,
          interruptible: false,
          dialogue: '(Resting)'
        },
        {
          hour: 8,
          endHour: 10,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Breakfast! Want to see a card trick?'
        },
        {
          hour: 10,
          endHour: 14,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Performing matinee show)'
        },
        {
          hour: 14,
          endHour: 16,
          activity: NPCActivity.RESTING,
          interruptible: true,
          dialogue: 'Between shows. The magic never stops, though.'
        },
        {
          hour: 16,
          endHour: 17,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Light meal before the evening show.'
        },
        {
          hour: 17,
          endHour: 18,
          activity: NPCActivity.CRAFTING,
          interruptible: true,
          dialogue: 'Preparing props and illusions.'
        },
        {
          hour: 18,
          endHour: 22,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Grand evening performance)'
        },
        {
          hour: 22,
          endHour: 24,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'Meet and greet after the show!'
        }
      ]
    },
    performances: [
      {
        id: 'grand_illusion',
        name: 'The Grand Illusion',
        description: 'Spectacular magic show with card tricks, disappearing acts, and audience participation',
        performanceType: PerformanceType.MAGIC,
        duration: 45,
        energyCost: 8,
        moodEffect: {
          mood: 'amazed',
          duration: 90,
          intensity: 3
        },
        rewards: {
          experience: 75,
          gold: 5,
          buff: {
            stat: 'duel_instinct',
            modifier: 10,
            duration: 120
          }
        }
      },
      {
        id: 'street_magic',
        name: 'Street Magic',
        description: 'Impromptu close-up magic tricks with cards and coins',
        performanceType: PerformanceType.MAGIC,
        duration: 15,
        energyCost: 3,
        moodEffect: {
          mood: 'intrigued',
          duration: 30,
          intensity: 1
        }
      }
    ],
    dialogue: {
      greeting: [
        "Ah! Prepare to be amazed!",
        "Welcome, welcome! The show is about to begin!",
        "Is this your card? No? Well, it should be!"
      ],
      aboutPerformance: [
        "Magic is all about misdirection. People see what I want them to see.",
        "I've performed for kings and outlaws alike. The tricks work on everyone.",
        "The real magic? Watching people's faces light up with wonder."
      ],
      sharingGossip: [
        "People talk freely around a magician. They think I'm focused on my tricks...",
        "I see things while I perform. People forget a magician is always watching.",
        "Magic reveals more than it conceals, if you know what to look for."
      ],
      teachingSkill: [
        "Interested in sleight of hand? I could teach you the basics.",
        "These tricks aren't just for show - they're useful skills.",
        "A little misdirection can be very... profitable."
      ],
      farewell: [
        "Remember - nothing is as it seems!",
        "Until we meet again, keep wondering!",
        "The magic continues, even when I'm gone!"
      ],
      duringPerformance: [
        "(Flourishing cards dramatically)",
        "(Making a coin disappear)",
        "(Too focused on the illusion)"
      ]
    },
    teachableSkills: [
      {
        skillId: 'sleight_of_hand',
        skillName: 'Sleight of Hand',
        trustRequired: 40,
        energyCost: 15,
        goldCost: 150,
        description: 'Learn basic sleight of hand tricks that improve pickpocket success',
        effect: {
          stat: 'pickpocket_success',
          modifier: 15,
          permanent: true
        }
      },
      {
        skillId: 'misdirection',
        skillName: 'Misdirection',
        trustRequired: 60,
        energyCost: 20,
        goldCost: 250,
        description: 'Master the art of misdirection to avoid detection',
        effect: {
          stat: 'stealth',
          modifier: 20,
          permanent: true
        }
      }
    ],
    gossipAccess: ['SECRET', 'CRIMINAL', 'POLITICAL', 'BUSINESS'],
    trustLevel: 0,
    specialAbilities: [
      'Can teach sleight of hand (pickpocket bonus)',
      'Observes without being noticed',
      'Access to high-society secrets'
    ]
  },

  // ============================================
  // 3. ROSA "LA CANTANTE" VELAZQUEZ
  // ============================================
  {
    id: 'entertainer_rosa',
    name: 'Rosa Velazquez',
    title: 'La Cantante',
    performanceType: PerformanceType.SINGING,
    description: 'A passionate singer of traditional Mexican songs and ballads. Her songs contain coded messages for the Frontera resistance.',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    route: [
      {
        locationId: 'frontera_cantina',
        locationName: 'La Frontera Cantina',
        arrivalDay: 0,
        stayDuration: 3,
        performanceVenue: 'main_stage'
      },
      {
        locationId: 'whiskey_bend_plaza',
        locationName: 'Whiskey Bend Plaza',
        arrivalDay: 3,
        stayDuration: 2,
        performanceVenue: 'central_stage'
      },
      {
        locationId: 'settlers_festival',
        locationName: 'Settler Festival Grounds',
        arrivalDay: 5,
        stayDuration: 2,
        performanceVenue: 'special_events'
      }
    ],
    schedule: {
      npcId: 'entertainer_rosa',
      npcName: 'Rosa "La Cantante" Velazquez',
      homeLocation: 'frontera_hidden_safehouse',
      personality: 'Passionate, proud, hidden revolutionary',
      faction: 'frontera',
      defaultSchedule: [
        {
          hour: 0,
          endHour: 2,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Singing passionately)'
        },
        {
          hour: 2,
          endHour: 9,
          activity: NPCActivity.SLEEPING,
          interruptible: false,
          dialogue: '(Resting her voice)'
        },
        {
          hour: 9,
          endHour: 11,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Morning. Would you like to hear a song?'
        },
        {
          hour: 11,
          endHour: 13,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'Meeting with... friends. What do you need?'
        },
        {
          hour: 13,
          endHour: 16,
          activity: NPCActivity.RESTING,
          interruptible: true,
          dialogue: 'Resting my voice. Singing is demanding work.'
        },
        {
          hour: 16,
          endHour: 18,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Pre-show meal. The voice must be strong.'
        },
        {
          hour: 18,
          endHour: 19,
          activity: NPCActivity.WORKING,
          interruptible: true,
          dialogue: 'Warming up. The show must be perfect.'
        },
        {
          hour: 19,
          endHour: 24,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Singing for the crowd)'
        }
      ]
    },
    performances: [
      {
        id: 'songs_of_homeland',
        name: 'Songs of the Homeland',
        description: 'Traditional Mexican songs filled with passion, pride, and hidden revolutionary messages',
        performanceType: PerformanceType.SINGING,
        duration: 40,
        energyCost: 6,
        moodEffect: {
          mood: 'inspired',
          duration: 90,
          intensity: 3
        },
        rewards: {
          experience: 80,
          buff: {
            stat: 'frontera_reputation',
            modifier: 10,
            duration: 180
          }
        }
      },
      {
        id: 'ballad_of_freedom',
        name: 'Ballad of Freedom',
        description: 'A powerful ballad about freedom and resistance',
        performanceType: PerformanceType.SINGING,
        duration: 25,
        energyCost: 5,
        moodEffect: {
          mood: 'determined',
          duration: 60,
          intensity: 2
        }
      }
    ],
    dialogue: {
      greeting: [
        "Hola, amigo. Have you come to hear the old songs?",
        "Welcome. My voice carries the soul of my people.",
        "Buenos días. Music is life, life is struggle."
      ],
      aboutPerformance: [
        "Every song tells a story. Some stories are hidden between the words.",
        "I sing of love, loss, and liberation. Those who listen carefully understand.",
        "My grandmother taught me these songs. They carry power beyond beauty."
      ],
      sharingGossip: [
        "I hear things... whispers in the night. Messages in the wind.",
        "The resistance speaks through many voices. Mine is one of them.",
        "Some information is sung, not spoken. Those who know, understand."
      ],
      teachingSkill: [
        "You wish to learn our songs? You must first understand our struggle.",
        "I can teach you to sing with passion. But passion must be earned.",
        "Music is a weapon. I could show you how to wield it."
      ],
      farewell: [
        "Vaya con Dios. May the songs guide you.",
        "Until we meet again. Stay strong.",
        "Remember what you heard here."
      ],
      duringPerformance: [
        "(Singing with passion)",
        "(Voice soaring)",
        "(Lost in the music)"
      ]
    },
    teachableSkills: [
      {
        skillId: 'coded_messages',
        skillName: 'Coded Messages',
        trustRequired: 70,
        energyCost: 20,
        goldCost: 200,
        description: 'Learn to recognize and interpret coded messages in songs and speech',
        effect: {
          stat: 'message_decoding',
          modifier: 1,
          permanent: true
        }
      }
    ],
    gossipAccess: ['POLITICAL', 'SECRET', 'CONFLICT', 'NEWS'],
    trustLevel: 0,
    specialAbilities: [
      'Songs contain coded messages for Frontera',
      'Access to revolutionary network',
      'Can boost Frontera faction reputation'
    ]
  },

  // ============================================
  // 4. OLD EZEKIEL (STORYTELLER)
  // ============================================
  {
    id: 'entertainer_ezekiel',
    name: 'Ezekiel',
    title: 'Old Ezekiel',
    performanceType: PerformanceType.STORYTELLING,
    description: 'An ancient storyteller who knows Western legends, Native myths, and horror tales. May be immortal. His stories contain real lore hints.',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.NEUTRAL,
    route: [
      {
        locationId: 'all_locations',
        locationName: 'Various Campfires and Saloons',
        arrivalDay: 0,
        stayDuration: 7,
        performanceVenue: 'wherever_there_are_listeners'
      }
    ],
    schedule: {
      npcId: 'entertainer_ezekiel',
      npcName: 'Old Ezekiel',
      homeLocation: 'unknown',
      personality: 'Ancient, knows too much, may be immortal',
      faction: 'neutral',
      defaultSchedule: [
        {
          hour: 0,
          endHour: 6,
          activity: NPCActivity.RESTING,
          interruptible: true,
          dialogue: 'I don\'t sleep much anymore. Too many stories to tell.'
        },
        {
          hour: 6,
          endHour: 8,
          activity: NPCActivity.TRAVELING,
          interruptible: true,
          dialogue: 'Wandering. Always wandering.'
        },
        {
          hour: 8,
          endHour: 12,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'Looking for an audience. Have you heard the tale of...?'
        },
        {
          hour: 12,
          endHour: 14,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'A meal, a story, and good company. That\'s all I need.'
        },
        {
          hour: 14,
          endHour: 18,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Telling stories to gathered listeners)'
        },
        {
          hour: 18,
          endHour: 20,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Supper. Care to share your story with me?'
        },
        {
          hour: 20,
          endHour: 24,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Speaking of ancient times)'
        }
      ]
    },
    performances: [
      {
        id: 'legend_of_the_west',
        name: 'Legends of the West',
        description: 'Ancient stories of famous gunslingers, outlaws, and lawmen',
        performanceType: PerformanceType.STORYTELLING,
        duration: 60,
        energyCost: 4,
        moodEffect: {
          mood: 'contemplative',
          duration: 120,
          intensity: 2
        },
        rewards: {
          experience: 100,
          buff: {
            stat: 'lore_knowledge',
            modifier: 20,
            duration: 240
          }
        }
      },
      {
        id: 'native_myths',
        name: 'Native Myths',
        description: 'Stories of spirits, creatures, and the old ways',
        performanceType: PerformanceType.STORYTELLING,
        duration: 45,
        energyCost: 5,
        moodEffect: {
          mood: 'uneasy',
          duration: 90,
          intensity: 2
        },
        rewards: {
          experience: 85,
          buff: {
            stat: 'supernatural_awareness',
            modifier: 15,
            duration: 180
          }
        }
      },
      {
        id: 'horror_tales',
        name: 'Horror Tales',
        description: 'Dark stories of the frontier that make even brave men shudder',
        performanceType: PerformanceType.STORYTELLING,
        duration: 30,
        energyCost: 3,
        moodEffect: {
          mood: 'fearful',
          duration: 60,
          intensity: 3
        }
      }
    ],
    dialogue: {
      greeting: [
        "Ah, a new face. Or... have we met before? I forget sometimes.",
        "Sit, sit. I have stories older than these mountains.",
        "You look like you've got a story or two yourself."
      ],
      aboutPerformance: [
        "I've been telling stories since... well, longer than I care to remember.",
        "Every tale has a grain of truth. Sometimes more than a grain.",
        "Listen carefully. My stories contain more than entertainment."
      ],
      sharingGossip: [
        "I know things. Things that happened long ago, things yet to come.",
        "The past echoes in the present. I hear those echoes.",
        "Stories reveal truths that facts cannot."
      ],
      teachingSkill: [
        "Want to learn the art of storytelling? It's not just words, you know.",
        "I could teach you to see the stories hidden in everything.",
        "The old ways of knowing... I could share them, if you're ready."
      ],
      farewell: [
        "Safe travels. May your story have a good ending.",
        "We'll meet again. Or have we? Time is strange...",
        "Remember what I told you. You'll need it."
      ],
      duringPerformance: [
        "(Speaking in an ancient, hypnotic voice)",
        "(Lost in the tale)",
        "(Eyes gleaming with otherworldly knowledge)"
      ]
    },
    teachableSkills: [
      {
        skillId: 'lore_master',
        skillName: 'Lore Master',
        trustRequired: 50,
        energyCost: 15,
        goldCost: 150,
        description: 'Gain deep knowledge of the world\'s lore and hidden secrets',
        effect: {
          stat: 'lore_knowledge',
          modifier: 25,
          permanent: true
        }
      },
      {
        skillId: 'storytelling',
        skillName: 'Storytelling',
        trustRequired: 30,
        energyCost: 10,
        goldCost: 75,
        description: 'Learn to tell compelling stories that influence others',
        effect: {
          stat: 'charisma',
          modifier: 10,
          permanent: true
        }
      }
    ],
    gossipAccess: ['SUPERNATURAL', 'SECRET', 'NEWS', 'RUMOR', 'POLITICAL'],
    trustLevel: 0,
    specialAbilities: [
      'His stories contain real lore hints and quest clues',
      'Knows ancient secrets',
      'May provide cryptic prophecies'
    ]
  },

  // ============================================
  // 5. THE CRIMSON DANCERS (TROUPE)
  // ============================================
  {
    id: 'entertainer_crimson_dancers',
    name: 'The Crimson Dancers',
    title: 'Dance Troupe',
    performanceType: PerformanceType.DANCING,
    description: 'A professional dance troupe performing can-can and exotic dances. Tight-knit group with an information network across all venues.',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.EXCITED,
    route: [
      {
        locationId: 'whiskey_bend_theater',
        locationName: 'Whiskey Bend Theater',
        arrivalDay: 0,
        stayDuration: 2,
        performanceVenue: 'main_stage'
      },
      {
        locationId: 'red_gulch_saloon',
        locationName: 'Red Gulch Saloon',
        arrivalDay: 2,
        stayDuration: 2,
        performanceVenue: 'stage'
      },
      {
        locationId: 'frontera_cantina',
        locationName: 'La Frontera Cantina',
        arrivalDay: 4,
        stayDuration: 2,
        performanceVenue: 'dance_floor'
      },
      {
        locationId: 'settlers_hall',
        locationName: 'Settlers Grand Hall',
        arrivalDay: 6,
        stayDuration: 1,
        performanceVenue: 'ballroom'
      }
    ],
    schedule: {
      npcId: 'entertainer_crimson_dancers',
      npcName: 'The Crimson Dancers',
      homeLocation: 'traveling',
      personality: 'Professional, tight-knit group',
      faction: 'neutral',
      defaultSchedule: [
        {
          hour: 0,
          endHour: 3,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Dancing energetically on stage)'
        },
        {
          hour: 3,
          endHour: 11,
          activity: NPCActivity.SLEEPING,
          interruptible: false,
          dialogue: '(Resting after the show)'
        },
        {
          hour: 11,
          endHour: 13,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Brunch with the troupe. Join us?'
        },
        {
          hour: 13,
          endHour: 17,
          activity: NPCActivity.WORKING,
          interruptible: true,
          dialogue: 'Practice makes perfect! Rehearsing new routines.'
        },
        {
          hour: 17,
          endHour: 19,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Pre-show meal together. Tradition!'
        },
        {
          hour: 19,
          endHour: 20,
          activity: NPCActivity.WORKING,
          interruptible: false,
          dialogue: 'Getting into costume. Show starts soon!'
        },
        {
          hour: 20,
          endHour: 24,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Performing for the audience)'
        }
      ]
    },
    performances: [
      {
        id: 'crimson_cancan',
        name: 'Crimson Can-Can',
        description: 'High-energy can-can performance that thrills the crowd',
        performanceType: PerformanceType.DANCING,
        duration: 35,
        energyCost: 7,
        moodEffect: {
          mood: 'thrilled',
          duration: 90,
          intensity: 3
        },
        rewards: {
          experience: 70,
          gold: 10,
          buff: {
            stat: 'energy_regen',
            modifier: 10,
            duration: 120
          }
        }
      },
      {
        id: 'exotic_performance',
        name: 'Exotic Performance',
        description: 'Mysterious and alluring dance from distant lands',
        performanceType: PerformanceType.DANCING,
        duration: 30,
        energyCost: 6,
        moodEffect: {
          mood: 'mesmerized',
          duration: 75,
          intensity: 2
        }
      }
    ],
    dialogue: {
      greeting: [
        "Hello darling! Come to see the show?",
        "We're the Crimson Dancers! Have you seen our performance?",
        "Welcome! We perform every night at 8!"
      ],
      aboutPerformance: [
        "We've been dancing together for five years. Perfect synchronization!",
        "Dancing is our life. We live for the applause!",
        "Each performance is unique. The crowd's energy changes everything."
      ],
      sharingGossip: [
        "We hear everything. Dancers are invisible when men are drinking.",
        "We travel to every major venue. News travels with us.",
        "Gossip? Oh honey, we swim in it every night!"
      ],
      teachingSkill: [
        "Want to learn some dance moves? We could teach you!",
        "Dancing improves grace and agility. Useful for more than just entertainment!",
        "We could show you how to move with confidence."
      ],
      farewell: [
        "Come see us perform! You won't regret it!",
        "Until next time, darling!",
        "May your steps be light and your spirits high!"
      ],
      duringPerformance: [
        "(Dancing in perfect synchronization)",
        "(Too focused on the routine)",
        "(Swirling skirts and high kicks)"
      ]
    },
    teachableSkills: [
      {
        skillId: 'graceful_movement',
        skillName: 'Graceful Movement',
        trustRequired: 35,
        energyCost: 12,
        goldCost: 120,
        description: 'Learn graceful movement that improves agility and dodging',
        effect: {
          stat: 'dodge_chance',
          modifier: 10,
          permanent: true
        }
      }
    ],
    gossipAccess: ['ROMANCE', 'BUSINESS', 'CRIMINAL', 'PERSONAL', 'RUMOR'],
    trustLevel: 0,
    specialAbilities: [
      'Information network across all venues',
      'Can provide leads on various NPCs',
      'Access to high-society and low-life gossip'
    ]
  },

  // ============================================
  // 6. "HARMONICA" JOE
  // ============================================
  {
    id: 'entertainer_harmonica_joe',
    name: 'Joe',
    title: 'Harmonica Joe',
    performanceType: PerformanceType.HARMONICA,
    description: 'A melancholic blues harmonica player who appears wherever there is sorrow. Can sense supernatural disturbances.',
    personality: PersonalityType.MELANCHOLIC,
    baseMood: MoodType.SAD,
    route: [
      {
        locationId: 'wherever_sorrow_is',
        locationName: 'Anywhere There\'s Sorrow',
        arrivalDay: 0,
        stayDuration: 7,
        performanceVenue: 'funerals_tragedies_loss'
      }
    ],
    schedule: {
      npcId: 'entertainer_harmonica_joe',
      npcName: 'Harmonica Joe',
      homeLocation: 'no_fixed_home',
      personality: 'Melancholic, empathetic, wise',
      faction: 'neutral',
      defaultSchedule: [
        {
          hour: 0,
          endHour: 6,
          activity: NPCActivity.RESTING,
          interruptible: true,
          dialogue: 'Can\'t sleep. Too many sorrows in the wind.'
        },
        {
          hour: 6,
          endHour: 10,
          activity: NPCActivity.TRAVELING,
          interruptible: true,
          dialogue: 'Following the sadness. It calls to me.'
        },
        {
          hour: 10,
          endHour: 12,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'A simple meal. Simple needs.'
        },
        {
          hour: 12,
          endHour: 18,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Playing mournful blues)'
        },
        {
          hour: 18,
          endHour: 20,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'Sharing sorrows lightens the load.'
        },
        {
          hour: 20,
          endHour: 24,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Harmonica wails in the night)'
        }
      ]
    },
    performances: [
      {
        id: 'blues_lament',
        name: 'Blues Lament',
        description: 'Mournful harmonica blues that speaks to the soul',
        performanceType: PerformanceType.HARMONICA,
        duration: 30,
        energyCost: 4,
        moodEffect: {
          mood: 'melancholic',
          duration: 90,
          intensity: 3
        },
        rewards: {
          experience: 60,
          buff: {
            stat: 'emotional_resilience',
            modifier: 15,
            duration: 180
          }
        }
      },
      {
        id: 'funeral_dirge',
        name: 'Funeral Dirge',
        description: 'Solemn music for laying the dead to rest',
        performanceType: PerformanceType.HARMONICA,
        duration: 20,
        energyCost: 3,
        moodEffect: {
          mood: 'solemn',
          duration: 60,
          intensity: 2
        }
      }
    ],
    dialogue: {
      greeting: [
        "I felt the sorrow here. That's why I came.",
        "Grief is a heavy burden. Music helps carry it.",
        "You look like you've known loss. Me too."
      ],
      aboutPerformance: [
        "The harmonica understands sadness. Each note is a tear.",
        "I play at funerals, tragedies, and in the dark hours. That's my calling.",
        "Some say my music is too sad. But the sad need music most."
      ],
      sharingGossip: [
        "Sorrow tells me things. Deaths, losses, tragic secrets.",
        "I sense disturbances in the natural order. Supernatural things.",
        "The grieving tell me their stories. I keep their secrets."
      ],
      teachingSkill: [
        "Want to learn the harmonica? It's an outlet for pain.",
        "I could teach you to sense things. Feelings on the wind.",
        "Music is healing. I could show you how."
      ],
      farewell: [
        "May your sorrows be few and your joys many.",
        "I'll be around. Sorrow always finds me.",
        "Play the blues, friend. It helps."
      ],
      duringPerformance: [
        "(Harmonica wails mournfully)",
        "(Lost in the music)",
        "(Eyes closed, feeling every note)"
      ]
    },
    teachableSkills: [
      {
        skillId: 'supernatural_sense',
        skillName: 'Supernatural Sense',
        trustRequired: 55,
        energyCost: 18,
        goldCost: 180,
        description: 'Develop the ability to sense supernatural disturbances',
        effect: {
          stat: 'supernatural_detection',
          modifier: 25,
          permanent: true
        }
      },
      {
        skillId: 'emotional_resilience',
        skillName: 'Emotional Resilience',
        trustRequired: 40,
        energyCost: 15,
        goldCost: 125,
        description: 'Build resilience against fear and sorrow',
        effect: {
          stat: 'fear_resistance',
          modifier: 20,
          permanent: true
        }
      }
    ],
    gossipAccess: ['SUPERNATURAL', 'SECRET', 'PERSONAL', 'NEWS'],
    trustLevel: 0,
    specialAbilities: [
      'Can sense supernatural disturbances',
      'Plays at funerals and tragedies',
      'Access to grief-related information'
    ]
  },

  // ============================================
  // 7. BUFFALO BILL'S WILD WEST SHOW
  // ============================================
  {
    id: 'entertainer_buffalo_bill',
    name: 'William "Buffalo Bill" Cody',
    title: 'Wild West Showman',
    performanceType: PerformanceType.WILD_WEST_SHOW,
    description: 'Legendary Wild West show with trick shooting, riding demonstrations, and historical reenactments. Can teach advanced combat skills.',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.EXCITED,
    route: [
      {
        locationId: 'red_gulch_fairgrounds',
        locationName: 'Red Gulch Fairgrounds',
        arrivalDay: 0,
        stayDuration: 3,
        performanceVenue: 'outdoor_arena'
      },
      {
        locationId: 'whiskey_bend_showgrounds',
        locationName: 'Whiskey Bend Showgrounds',
        arrivalDay: 3,
        stayDuration: 3,
        performanceVenue: 'main_arena'
      },
      {
        locationId: 'settlers_festival',
        locationName: 'Settler Festival Grounds',
        arrivalDay: 6,
        stayDuration: 1,
        performanceVenue: 'special_events'
      }
    ],
    schedule: {
      npcId: 'entertainer_buffalo_bill',
      npcName: 'Buffalo Bill Cody',
      homeLocation: 'traveling_caravan',
      personality: 'Showman, exaggerator, genuine talent',
      faction: 'settler',
      defaultSchedule: [
        {
          hour: 0,
          endHour: 7,
          activity: NPCActivity.SLEEPING,
          interruptible: false,
          dialogue: '(Resting in the caravan)'
        },
        {
          hour: 7,
          endHour: 9,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Breakfast with the troupe. Howdy, partner!'
        },
        {
          hour: 9,
          endHour: 12,
          activity: NPCActivity.WORKING,
          interruptible: true,
          dialogue: 'Practice! Even legends need to stay sharp!'
        },
        {
          hour: 12,
          endHour: 13,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Lunch break. Want to hear about my adventures?'
        },
        {
          hour: 13,
          endHour: 14,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'Meet and greet! Get your tickets for the afternoon show!'
        },
        {
          hour: 14,
          endHour: 17,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Performing the Wild West Show)'
        },
        {
          hour: 17,
          endHour: 18,
          activity: NPCActivity.RESTING,
          interruptible: true,
          dialogue: 'Between shows. That was a doozy!'
        },
        {
          hour: 18,
          endHour: 19,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Supper. Need energy for the evening show!'
        },
        {
          hour: 19,
          endHour: 22,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Grand evening performance)'
        },
        {
          hour: 22,
          endHour: 24,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'After-show socializing. Meet the stars!'
        }
      ]
    },
    performances: [
      {
        id: 'wild_west_spectacular',
        name: 'Wild West Spectacular',
        description: 'Full show with trick shooting, bronco riding, lasso demonstrations, and historical reenactments',
        performanceType: PerformanceType.WILD_WEST_SHOW,
        duration: 90,
        energyCost: 10,
        moodEffect: {
          mood: 'thrilled',
          duration: 180,
          intensity: 4
        },
        rewards: {
          experience: 150,
          gold: 20,
          buff: {
            stat: 'combat_skill',
            modifier: 15,
            duration: 240
          }
        }
      },
      {
        id: 'sharpshooter_demo',
        name: 'Sharpshooter Demonstration',
        description: 'Incredible displays of marksmanship and gun handling',
        performanceType: PerformanceType.WILD_WEST_SHOW,
        duration: 30,
        energyCost: 5,
        moodEffect: {
          mood: 'impressed',
          duration: 90,
          intensity: 2
        },
        rewards: {
          experience: 80,
          buff: {
            stat: 'accuracy',
            modifier: 10,
            duration: 120
          }
        }
      }
    ],
    dialogue: {
      greeting: [
        "Howdy partner! Buffalo Bill at your service!",
        "Welcome to the greatest show in the West!",
        "Step right up! You're about to witness history!"
      ],
      aboutPerformance: [
        "I've fought Indians, hunted buffalo, and ridden with legends!",
        "Every story is true! Well, mostly true. The spirit is true!",
        "We bring the Wild West to life! Education and entertainment!"
      ],
      sharingGossip: [
        "I know all the famous folks. Everyone comes to see the show!",
        "Hear stories from across the territories. People tell Buffalo Bill everything!",
        "I've met presidents and outlaws. Got stories about all of them!"
      ],
      teachingSkill: [
        "Want to learn real shooting skills? I can teach you!",
        "My sharpshooters are the best. They could show you a thing or two.",
        "Combat skills, riding, roping - we teach it all!"
      ],
      farewell: [
        "Come see the show! You won't believe your eyes!",
        "Safe trails, partner! Remember Buffalo Bill!",
        "Spread the word! Greatest show in the West!"
      ],
      duringPerformance: [
        "(Performing incredible trick shots)",
        "(Too focused on the show)",
        "(Showmanship at its finest)"
      ]
    },
    teachableSkills: [
      {
        skillId: 'trick_shooting',
        skillName: 'Trick Shooting',
        trustRequired: 60,
        energyCost: 25,
        goldCost: 300,
        description: 'Learn advanced shooting techniques from the best',
        effect: {
          stat: 'accuracy',
          modifier: 20,
          permanent: true
        }
      },
      {
        skillId: 'showmanship',
        skillName: 'Showmanship',
        trustRequired: 40,
        energyCost: 15,
        goldCost: 150,
        description: 'Learn to perform with flair and confidence',
        effect: {
          stat: 'charisma',
          modifier: 15,
          permanent: true
        }
      },
      {
        skillId: 'horseback_combat',
        skillName: 'Horseback Combat',
        trustRequired: 70,
        energyCost: 30,
        goldCost: 350,
        description: 'Master the art of fighting from horseback',
        effect: {
          stat: 'mounted_combat',
          modifier: 25,
          permanent: true
        }
      }
    ],
    gossipAccess: ['NEWS', 'POLITICAL', 'PERSONAL', 'BUSINESS'],
    trustLevel: 0,
    specialAbilities: [
      'Can teach advanced combat skills',
      'Connections with famous people',
      'Access to historical knowledge'
    ]
  },

  // ============================================
  // 8. MADAME FORTUNA (FORTUNE TELLER)
  // ============================================
  {
    id: 'entertainer_madame_fortuna',
    name: 'Fortuna',
    title: 'Madame Fortuna',
    performanceType: PerformanceType.FORTUNE_TELLING,
    description: 'Mysterious fortune teller with tarot cards and palm reading. Predictions can hint at upcoming events and quests. May be genuinely psychic.',
    personality: PersonalityType.VOLATILE,
    baseMood: MoodType.SUSPICIOUS,
    route: [
      {
        locationId: 'red_gulch_town_square',
        locationName: 'Red Gulch Town Square',
        arrivalDay: 0,
        stayDuration: 2,
        performanceVenue: 'fortune_tent'
      },
      {
        locationId: 'whiskey_bend_market',
        locationName: 'Whiskey Bend Market',
        arrivalDay: 2,
        stayDuration: 2,
        performanceVenue: 'mystic_booth'
      },
      {
        locationId: 'frontera_plaza',
        locationName: 'Frontera Plaza',
        arrivalDay: 4,
        stayDuration: 2,
        performanceVenue: 'corner_tent'
      },
      {
        locationId: 'saloons',
        locationName: 'Various Saloons',
        arrivalDay: 6,
        stayDuration: 1,
        performanceVenue: 'back_room'
      }
    ],
    schedule: {
      npcId: 'entertainer_madame_fortuna',
      npcName: 'Madame Fortuna',
      homeLocation: 'traveling_wagon',
      personality: 'Mysterious, possibly genuine psychic',
      faction: 'neutral',
      defaultSchedule: [
        {
          hour: 0,
          endHour: 3,
          activity: NPCActivity.PERFORMING,
          interruptible: true,
          dialogue: 'The cards speak clearest at night. Cross my palm...'
        },
        {
          hour: 3,
          endHour: 9,
          activity: NPCActivity.SLEEPING,
          interruptible: false,
          dialogue: '(Communing with the spirits)'
        },
        {
          hour: 9,
          endHour: 11,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Breakfast. The cards foretold your arrival.'
        },
        {
          hour: 11,
          endHour: 13,
          activity: NPCActivity.WORKING,
          interruptible: true,
          dialogue: 'Reading the cards. So much to learn...'
        },
        {
          hour: 13,
          endHour: 18,
          activity: NPCActivity.PERFORMING,
          interruptible: true,
          dialogue: 'Come, let me see your future.'
        },
        {
          hour: 18,
          endHour: 19,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'A simple meal. The spirits require little.'
        },
        {
          hour: 19,
          endHour: 24,
          activity: NPCActivity.PERFORMING,
          interruptible: true,
          dialogue: 'The veil is thin tonight. I can see much.'
        }
      ]
    },
    performances: [
      {
        id: 'tarot_reading',
        name: 'Tarot Reading',
        description: 'Complete tarot spread revealing past, present, and future',
        performanceType: PerformanceType.FORTUNE_TELLING,
        duration: 20,
        energyCost: 8,
        moodEffect: {
          mood: 'intrigued',
          duration: 120,
          intensity: 2
        },
        rewards: {
          experience: 75,
          buff: {
            stat: 'luck',
            modifier: 15,
            duration: 240
          }
        }
      },
      {
        id: 'palm_reading',
        name: 'Palm Reading',
        description: 'Reading the lines of your hand to reveal your destiny',
        performanceType: PerformanceType.FORTUNE_TELLING,
        duration: 15,
        energyCost: 5,
        moodEffect: {
          mood: 'contemplative',
          duration: 90,
          intensity: 1
        },
        rewards: {
          experience: 50,
          buff: {
            stat: 'duel_instinct',
            modifier: 10,
            duration: 180
          }
        }
      },
      {
        id: 'crystal_visions',
        name: 'Crystal Visions',
        description: 'Gazing into the crystal ball to see what may come',
        performanceType: PerformanceType.FORTUNE_TELLING,
        duration: 25,
        energyCost: 10,
        moodEffect: {
          mood: 'uneasy',
          duration: 150,
          intensity: 3
        },
        rewards: {
          experience: 100,
          gold: 15,
          buff: {
            stat: 'quest_hint',
            modifier: 1,
            duration: 360
          }
        }
      }
    ],
    dialogue: {
      greeting: [
        "Ahh, I sensed your approach. The cards never lie.",
        "Welcome, seeker. Your aura is... interesting.",
        "Cross my palm, and I shall reveal what is hidden."
      ],
      aboutPerformance: [
        "I see things others cannot. Whether gift or curse, I cannot say.",
        "The tarot shows truth to those brave enough to look.",
        "Some call me charlatan. But those who know... they return."
      ],
      sharingGossip: [
        "The cards reveal many secrets. Some I may share.",
        "I know things before they happen. Useful information, no?",
        "The future whispers to me. Sometimes of others."
      ],
      teachingSkill: [
        "Want to learn the cards? It requires... openness.",
        "I could teach you to see beyond the veil.",
        "Intuition can be developed. I could show you."
      ],
      farewell: [
        "Your path is your own. But I have seen where it may lead.",
        "Until the cards bring us together again.",
        "May the spirits guide your steps."
      ],
      duringPerformance: [
        "(Laying out cards with mystic precision)",
        "(Gazing deep into the crystal)",
        "(In a trance-like state)"
      ]
    },
    teachableSkills: [
      {
        skillId: 'fortune_telling',
        skillName: 'Fortune Telling',
        trustRequired: 65,
        energyCost: 20,
        goldCost: 250,
        description: 'Learn basic fortune telling to gain hints about future events',
        effect: {
          stat: 'prophecy_access',
          modifier: 1,
          permanent: true
        }
      },
      {
        skillId: 'heightened_intuition',
        skillName: 'Heightened Intuition',
        trustRequired: 45,
        energyCost: 15,
        goldCost: 175,
        description: 'Develop intuition to better predict outcomes',
        effect: {
          stat: 'luck',
          modifier: 12,
          permanent: true
        }
      }
    ],
    gossipAccess: ['SECRET', 'SUPERNATURAL', 'RUMOR', 'NEWS', 'POLITICAL'],
    trustLevel: 0,
    specialAbilities: [
      'Predictions can hint at upcoming events/quests',
      'Can provide cryptic but accurate information',
      'May reveal hidden quest objectives'
    ]
  },

  // ============================================
  // 9. THE PREACHER'S CHOIR (GOSPEL GROUP)
  // ============================================
  {
    id: 'entertainer_preachers_choir',
    name: 'The Preacher\'s Choir',
    title: 'Gospel Singers',
    performanceType: PerformanceType.GOSPEL,
    description: 'Traveling gospel singers performing hymns and spirituals. Devout but not judgmental. Can provide spiritual healing and buffs.',
    personality: PersonalityType.STOIC,
    baseMood: MoodType.CONTENT,
    route: [
      {
        locationId: 'red_gulch_church',
        locationName: 'Red Gulch Church',
        arrivalDay: 0,
        stayDuration: 2,
        performanceVenue: 'sanctuary'
      },
      {
        locationId: 'whiskey_bend_chapel',
        locationName: 'Whiskey Bend Chapel',
        arrivalDay: 2,
        stayDuration: 2,
        performanceVenue: 'main_hall'
      },
      {
        locationId: 'settlers_camp_meeting',
        locationName: 'Settler Camp Meeting',
        arrivalDay: 4,
        stayDuration: 2,
        performanceVenue: 'outdoor_revival'
      },
      {
        locationId: 'frontier_missions',
        locationName: 'Frontier Missions',
        arrivalDay: 6,
        stayDuration: 1,
        performanceVenue: 'chapel'
      }
    ],
    schedule: {
      npcId: 'entertainer_preachers_choir',
      npcName: 'The Preacher\'s Choir',
      homeLocation: 'traveling_gospel_wagon',
      personality: 'Devout but not judgmental',
      faction: 'settler',
      defaultSchedule: [
        {
          hour: 0,
          endHour: 6,
          activity: NPCActivity.SLEEPING,
          interruptible: false,
          dialogue: '(Resting)'
        },
        {
          hour: 6,
          endHour: 7,
          activity: NPCActivity.PRAYING,
          interruptible: false,
          dialogue: '(Morning prayers)'
        },
        {
          hour: 7,
          endHour: 8,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Breaking bread together. Join us, friend.'
        },
        {
          hour: 8,
          endHour: 10,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Singing morning hymns)'
        },
        {
          hour: 10,
          endHour: 12,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'Spreading the good word. How may we help?'
        },
        {
          hour: 12,
          endHour: 13,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Midday meal. All are welcome at our table.'
        },
        {
          hour: 13,
          endHour: 17,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'Visiting the needy. Walk with us?'
        },
        {
          hour: 17,
          endHour: 18,
          activity: NPCActivity.PRAYING,
          interruptible: false,
          dialogue: '(Evening prayers)'
        },
        {
          hour: 18,
          endHour: 19,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Supper. Simple food, grateful hearts.'
        },
        {
          hour: 19,
          endHour: 22,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Evening revival singing)'
        },
        {
          hour: 22,
          endHour: 24,
          activity: NPCActivity.RESTING,
          interruptible: true,
          dialogue: 'Quiet reflection before sleep.'
        }
      ]
    },
    performances: [
      {
        id: 'gospel_revival',
        name: 'Gospel Revival',
        description: 'Powerful gospel hymns that lift the spirit and cleanse the soul',
        performanceType: PerformanceType.GOSPEL,
        duration: 50,
        energyCost: 6,
        moodEffect: {
          mood: 'inspired',
          duration: 180,
          intensity: 3
        },
        rewards: {
          experience: 90,
          buff: {
            stat: 'spiritual_healing',
            modifier: 30,
            duration: 240
          }
        }
      },
      {
        id: 'traditional_hymn',
        name: 'Traditional Hymns',
        description: 'Classic hymns sung in beautiful harmony',
        performanceType: PerformanceType.GOSPEL,
        duration: 30,
        energyCost: 4,
        moodEffect: {
          mood: 'peaceful',
          duration: 120,
          intensity: 2
        },
        rewards: {
          experience: 60,
          buff: {
            stat: 'health_regen',
            modifier: 10,
            duration: 180
          }
        }
      },
      {
        id: 'spiritual_healing',
        name: 'Spiritual Healing Service',
        description: 'Special healing service with prayer and song',
        performanceType: PerformanceType.GOSPEL,
        duration: 40,
        energyCost: 8,
        moodEffect: {
          mood: 'blessed',
          duration: 240,
          intensity: 4
        },
        rewards: {
          experience: 100,
          gold: 10,
          buff: {
            stat: 'all_stats',
            modifier: 5,
            duration: 300
          }
        }
      }
    ],
    dialogue: {
      greeting: [
        "Blessings upon you, friend. Have you come to sing with us?",
        "Welcome! The Lord's house has room for all.",
        "Peace be with you. How can we serve?"
      ],
      aboutPerformance: [
        "We sing to glorify God and bring hope to the hopeless.",
        "Music is prayer. It reaches places words cannot.",
        "Every voice raised in song is a blessing."
      ],
      sharingGossip: [
        "We hear confessions and troubles. Some we may share to help others.",
        "The faithful tell us their burdens. We carry their secrets gently.",
        "We know of those in need. That's public knowledge, not gossip."
      ],
      teachingSkill: [
        "Want to learn to sing with us? All voices are welcome.",
        "We can teach you hymns that soothe the soul.",
        "Faith can be learned. Let us show you."
      ],
      farewell: [
        "May the Lord watch over your path.",
        "Go with God, friend.",
        "We'll keep you in our prayers."
      ],
      duringPerformance: [
        "(Singing in beautiful harmony)",
        "(Voices raised in praise)",
        "(Lost in the hymn)"
      ]
    },
    teachableSkills: [
      {
        skillId: 'spiritual_fortitude',
        skillName: 'Spiritual Fortitude',
        trustRequired: 30,
        energyCost: 12,
        goldCost: 100,
        description: 'Develop spiritual strength that provides ongoing protection',
        effect: {
          stat: 'damage_resistance',
          modifier: 10,
          permanent: true
        }
      },
      {
        skillId: 'hymn_of_healing',
        skillName: 'Hymn of Healing',
        trustRequired: 50,
        energyCost: 18,
        goldCost: 175,
        description: 'Learn a healing hymn that restores health over time',
        effect: {
          stat: 'health_regen_rate',
          modifier: 15,
          permanent: true
        }
      }
    ],
    gossipAccess: ['PERSONAL', 'NEWS', 'CONFLICT'],
    trustLevel: 0,
    specialAbilities: [
      'Can provide spiritual healing/buff',
      'Offers sanctuary services',
      'Access to community troubles and needs'
    ]
  },

  // ============================================
  // 10. "WHISKEY" WILLY THE COMEDIAN
  // ============================================
  {
    id: 'entertainer_whiskey_willy',
    name: 'William "Whiskey" Wilkins',
    title: 'Whiskey Willy',
    performanceType: PerformanceType.COMEDY,
    description: 'Quick-witted stand-up comedian with fearless political satire. His jokes can affect NPC moods and make them more favorable.',
    personality: PersonalityType.CHEERFUL,
    baseMood: MoodType.HAPPY,
    route: [
      {
        locationId: 'red_gulch_saloon',
        locationName: 'Red Gulch Saloon',
        arrivalDay: 0,
        stayDuration: 1,
        performanceVenue: 'stage'
      },
      {
        locationId: 'whiskey_bend_saloon',
        locationName: 'Whiskey Bend Saloon',
        arrivalDay: 1,
        stayDuration: 1,
        performanceVenue: 'corner_stage'
      },
      {
        locationId: 'frontera_cantina',
        locationName: 'La Frontera Cantina',
        arrivalDay: 2,
        stayDuration: 2,
        performanceVenue: 'bar'
      },
      {
        locationId: 'settlers_hall',
        locationName: 'Settlers Hall',
        arrivalDay: 4,
        stayDuration: 1,
        performanceVenue: 'entertainment_room'
      },
      {
        locationId: 'all_saloons',
        locationName: 'Various Saloons',
        arrivalDay: 5,
        stayDuration: 2,
        performanceVenue: 'anywhere_with_drinks'
      }
    ],
    schedule: {
      npcId: 'entertainer_whiskey_willy',
      npcName: 'Whiskey Willy',
      homeLocation: 'traveling',
      personality: 'Quick-witted, controversial, fearless',
      faction: 'neutral',
      defaultSchedule: [
        {
          hour: 0,
          endHour: 4,
          activity: NPCActivity.DRINKING,
          interruptible: true,
          dialogue: 'Buy me a drink and I\'ll tell you a joke!'
        },
        {
          hour: 4,
          endHour: 12,
          activity: NPCActivity.SLEEPING,
          interruptible: false,
          dialogue: '(Sleeping off the hangover)'
        },
        {
          hour: 12,
          endHour: 14,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Brunch and writing new material. Wanna hear one?'
        },
        {
          hour: 14,
          endHour: 18,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'Gathering material from the crowd. Got any funny stories?'
        },
        {
          hour: 18,
          endHour: 19,
          activity: NPCActivity.EATING,
          interruptible: true,
          dialogue: 'Pre-show meal. Can\'t perform on an empty stomach!'
        },
        {
          hour: 19,
          endHour: 20,
          activity: NPCActivity.DRINKING,
          interruptible: true,
          dialogue: 'Liquid courage before the show!'
        },
        {
          hour: 20,
          endHour: 23,
          activity: NPCActivity.PERFORMING,
          interruptible: false,
          dialogue: '(Telling jokes to a roaring crowd)'
        },
        {
          hour: 23,
          endHour: 24,
          activity: NPCActivity.SOCIALIZING,
          interruptible: true,
          dialogue: 'After-show meet-up! Thanks for laughing!'
        }
      ]
    },
    performances: [
      {
        id: 'political_satire',
        name: 'Political Satire',
        description: 'Fearless political comedy that skewers everyone equally',
        performanceType: PerformanceType.COMEDY,
        duration: 35,
        energyCost: 5,
        moodEffect: {
          mood: 'amused',
          duration: 120,
          intensity: 3
        },
        rewards: {
          experience: 70,
          buff: {
            stat: 'npc_disposition',
            modifier: 15,
            duration: 180
          }
        }
      },
      {
        id: 'frontier_humor',
        name: 'Frontier Humor',
        description: 'Jokes about life in the Wild West that everyone can relate to',
        performanceType: PerformanceType.COMEDY,
        duration: 25,
        energyCost: 3,
        moodEffect: {
          mood: 'happy',
          duration: 90,
          intensity: 2
        },
        rewards: {
          experience: 50,
          buff: {
            stat: 'charisma',
            modifier: 10,
            duration: 120
          }
        }
      },
      {
        id: 'impressions_show',
        name: 'Impressions Show',
        description: 'Hilarious impressions of famous people and local characters',
        performanceType: PerformanceType.COMEDY,
        duration: 30,
        energyCost: 4,
        moodEffect: {
          mood: 'delighted',
          duration: 100,
          intensity: 2
        },
        rewards: {
          experience: 60
        }
      }
    ],
    dialogue: {
      greeting: [
        "Hey there! Want to hear a joke?",
        "Welcome! I hope you came to laugh!",
        "Pull up a seat, I've got a good one for you!"
      ],
      aboutPerformance: [
        "I make people laugh. In times like these, that's more valuable than gold.",
        "Comedy is truth told through laughter. People need both.",
        "I roast everyone equally. That's how you know it's fair!"
      ],
      sharingGossip: [
        "I hear everything. Comedians are invisible when people are drinking.",
        "People tell me things. Then I make jokes about them. It's my job!",
        "The best material comes from real life. And people's secrets."
      ],
      teachingSkill: [
        "Want to learn to be funny? It's about timing and observation.",
        "I could teach you how to read a crowd and make them laugh.",
        "Humor is a skill. A valuable one at that."
      ],
      farewell: [
        "Keep laughing, friend! Life's too short for frowning!",
        "Come see the show! You'll laugh till it hurts!",
        "Stay funny, stay alive!"
      ],
      duringPerformance: [
        "(Delivering punchlines perfectly)",
        "(Working the crowd)",
        "(Too focused on the bit)"
      ]
    },
    teachableSkills: [
      {
        skillId: 'wit_and_charm',
        skillName: 'Wit and Charm',
        trustRequired: 35,
        energyCost: 12,
        goldCost: 125,
        description: 'Learn to use humor to improve social interactions',
        effect: {
          stat: 'charisma',
          modifier: 15,
          permanent: true
        }
      },
      {
        skillId: 'crowd_reading',
        skillName: 'Crowd Reading',
        trustRequired: 55,
        energyCost: 18,
        goldCost: 200,
        description: 'Learn to read crowds and manipulate group moods',
        effect: {
          stat: 'group_influence',
          modifier: 20,
          permanent: true
        }
      }
    ],
    gossipAccess: ['POLITICAL', 'PERSONAL', 'RUMOR', 'BUSINESS', 'NEWS'],
    trustLevel: 0,
    specialAbilities: [
      'His jokes can affect NPC moods (make them laugh = better disposition)',
      'Can defuse tense situations with humor',
      'Access to political and social gossip'
    ]
  }
];

/**
 * Get entertainer by ID
 */
export function getEntertainerById(id: string): WanderingEntertainer | undefined {
  return WANDERING_ENTERTAINERS.find(e => e.id === id);
}

/**
 * Get entertainers by performance type
 */
export function getEntertainersByType(type: PerformanceType): WanderingEntertainer[] {
  return WANDERING_ENTERTAINERS.filter(e => e.performanceType === type);
}

/**
 * Get entertainers currently at a location
 */
export function getEntertainersAtLocation(locationId: string, currentDay: number): WanderingEntertainer[] {
  return WANDERING_ENTERTAINERS.filter(entertainer => {
    return entertainer.route.some(stop => {
      const dayInCycle = currentDay % 7; // Weekly rotation
      return stop.locationId === locationId ||
             (stop.locationId.includes('all_locations') || stop.locationId.includes(locationId.split('_')[0]));
    });
  });
}

/**
 * Get available performances at a location
 */
export function getAvailablePerformances(locationId: string, currentDay: number): Performance[] {
  const entertainers = getEntertainersAtLocation(locationId, currentDay);
  return entertainers.flatMap(e => e.performances);
}
