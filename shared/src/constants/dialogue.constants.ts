/**
 * Western Dialogue Constants
 *
 * Authentic 1880s frontier vernacular for procedural dialogue generation.
 * Used by NPC dialogue templates, quest templates, gossip, and crime outcomes.
 *
 * Design Philosophy: Gritty, authentic Western like Fallout New Vegas meets
 * Red Dead Redemption. Every character has survived this harsh world.
 */

// ============================================================================
// GREETINGS - Faction & Mood Appropriate (36 variations)
// ============================================================================

export const GREETINGS = {
  FRIENDLY: [
    "Howdy, partner",
    "Well, I'll be",
    "Good to see ya",
    "What brings you 'round?",
    "Ain't you a sight",
    "Welcome, friend",
    "Pull up a chair",
    "Make yourself at home",
    "Been expectin' you",
    "Heard you was comin'",
    "Word travels fast",
    "Step right in"
  ],
  NEUTRAL: [
    "Stranger",
    "State your business",
    "What d'you want?",
    "You lost?",
    "Help you with somethin'?",
    "Speak your piece",
    "I'm listenin'",
    "Go on then",
    "Make it quick",
    "Time's wastin'",
    "Spit it out",
    "What's your angle?"
  ],
  HOSTILE: [
    "You ain't welcome here",
    "Best keep movin'",
    "Wrong place, friend",
    "Turn around 'fore you regret it",
    "I know your type",
    "Don't start nothin'",
    "You got nerve showin' your face",
    "Last warning",
    "Git. Now.",
    "We don't serve your kind",
    "You're either brave or stupid",
    "Death wish, huh?"
  ]
} as const;

// ============================================================================
// AFFIRMATIVES - Response Agreement (24 variations)
// ============================================================================

export const AFFIRMATIVES = {
  ENTHUSIASTIC: [
    "Hell yeah!",
    "You bet your boots",
    "Damn straight",
    "Count me in",
    "Now you're talkin'",
    "That's the spirit",
    "I like your style",
    "Let's ride"
  ],
  NEUTRAL: [
    "Reckon so",
    "Fair enough",
    "S'pose that's right",
    "Can't argue with that",
    "Sounds about right",
    "If you say so",
    "Makes sense",
    "I can work with that"
  ],
  RELUCTANT: [
    "If I gotta",
    "Ain't got much choice",
    "Against my better judgment",
    "This better be worth it",
    "You owe me one",
    "Don't make me regret this",
    "Fine. But you didn't hear it from me",
    "Last time. I mean it this time"
  ]
} as const;

// ============================================================================
// NEGATIVES - Refusals & Rejections (24 variations)
// ============================================================================

export const NEGATIVES = {
  FIRM: [
    "Not on your life",
    "When hell freezes over",
    "Fat chance",
    "Over my dead body",
    "Absolutely not",
    "No deal",
    "Forget it",
    "Hard pass"
  ],
  APOLOGETIC: [
    "Can't help you there",
    "Sorry, partner",
    "Wish I could",
    "My hands are tied",
    "Not my call to make",
    "Ain't up to me",
    "I got my own problems",
    "Maybe try somewhere else"
  ],
  THREATENING: [
    "Ask again and see what happens",
    "That's a good way to get shot",
    "You deaf or just stupid?",
    "I said no. Don't make me repeat myself",
    "Walk away while you still can",
    "Last man who asked that is buried in the canyon",
    "You're testin' my patience",
    "Don't push your luck"
  ]
} as const;

// ============================================================================
// MONEY TERMS - Currency References (18 variations)
// ============================================================================

export const MONEY_TERMS = [
  "gold",
  "coin",
  "dust",
  "greenbacks",
  "hard currency",
  "cold cash",
  "payment",
  "compensation",
  "reward",
  "bounty",
  "stake",
  "investment",
  "cut",
  "share",
  "take",
  "haul",
  "loot",
  "scratch"
] as const;

// ============================================================================
// INSULTS - Character Descriptions (24 variations)
// ============================================================================

export const INSULTS = {
  MILD: [
    "sidewinder",
    "varmint",
    "no-account",
    "fool",
    "greenhorn",
    "tenderfoot",
    "yahoo",
    "galoot",
    "tinhorn",
    "dude",
    "pilgrim",
    "city slicker"
  ],
  SEVERE: [
    "bushwhacker",
    "yellow-belly",
    "back-shooter",
    "snake in the grass",
    "low-down dirty dog",
    "lily-livered coward",
    "murderin' scum",
    "worthless piece of work",
    "curse on two legs",
    "spawn of Satan",
    "walking dead man",
    "marked for the grave"
  ]
} as const;

// ============================================================================
// TIME EXPRESSIONS - Temporal References (18 variations)
// ============================================================================

export const TIME_EXPRESSIONS = [
  "sundown",
  "high noon",
  "first light",
  "come mornin'",
  "by nightfall",
  "before the rooster crows",
  "when the sun sets",
  "at the stroke of midnight",
  "in a spell",
  "directly",
  "right quick",
  "when I'm good and ready",
  "yesterday",
  "soon enough",
  "not long now",
  "any minute",
  "since the war",
  "back in '62"
] as const;

// ============================================================================
// LOCATION DESCRIPTORS - Place References (18 variations)
// ============================================================================

export const LOCATION_TERMS = [
  "the territory",
  "these parts",
  "this godforsaken place",
  "the frontier",
  "the badlands",
  "out yonder",
  "across the river",
  "up in the hills",
  "down in the canyon",
  "the watering hole",
  "the crossroads",
  "no-man's land",
  "civilized country",
  "the wild lands",
  "Indian territory",
  "outlaw country",
  "mining country",
  "cattle country"
] as const;

// ============================================================================
// DEATH & VIOLENCE - Euphemisms & Threats (24 variations)
// ============================================================================

export const DEATH_EUPHEMISMS = [
  "meet your maker",
  "cash in your chips",
  "kick the bucket",
  "bite the dust",
  "take the long dirt nap",
  "go to Boot Hill",
  "push up daisies",
  "feed the coyotes",
  "end up in a pine box",
  "get your ticket punched",
  "dance at the end of a rope",
  "stop a bullet"
] as const;

export const VIOLENCE_THREATS = [
  "fill you full of lead",
  "put you six feet under",
  "send you to hell",
  "gut you like a fish",
  "string you up",
  "leave you for the buzzards",
  "make you disappear",
  "paint the walls with you",
  "introduce you to my friend here",
  "show you what the inside of a grave looks like",
  "carve my initials in your hide",
  "turn you into a memory"
] as const;

// ============================================================================
// EXPRESSIONS - Disbelief & Understanding (24 variations)
// ============================================================================

export const DISBELIEF = [
  "Well, I'll be damned",
  "You don't say",
  "I never would've guessed",
  "Pull the other one",
  "That's a tall tale",
  "You're jokin'",
  "Get outta here",
  "I'll believe it when I see it",
  "Hogwash",
  "Save your breath",
  "Who'd believe such a thing?",
  "You expect me to swallow that?"
] as const;

export const UNDERSTANDING = [
  "I hear ya",
  "I savvy",
  "Crystal clear",
  "Understood",
  "You and me both",
  "Tell me about it",
  "Don't I know it",
  "Preachin' to the choir",
  "Read you loud and clear",
  "Got it",
  "Point taken",
  "Message received"
] as const;

// ============================================================================
// FACTION-SPECIFIC VOICE PATTERNS
// ============================================================================

export const FACTION_VOICE = {
  SETTLER: {
    greetings: [
      "Good day, citizen",
      "State your business",
      "Welcome to law-abiding country",
      "Keep your nose clean and we'll get along",
      "The law sees all"
    ],
    affirmatives: [
      "Understood",
      "I'll see it done",
      "Consider it handled",
      "The law demands it",
      "Justice will be served"
    ],
    negatives: [
      "That's against the law",
      "Not in my jurisdiction",
      "Take it elsewhere",
      "I won't be party to that",
      "Find someone else to break the law"
    ],
    quirks: [
      "References to law/duty",
      "Formal titles",
      "Measured speech",
      "Community focus",
      "Order and stability"
    ]
  },

  FRONTERA: {
    greetings: [
      "What's your angle, amigo?",
      "Spit it out",
      "This better be good",
      "You lost, gringo?",
      "Business or pleasure?"
    ],
    affirmatives: [
      "Done deal",
      "You got it, hermano",
      "Consider it done... for a price",
      "Claro que si",
      "Now we're talkin'"
    ],
    negatives: [
      "Not worth my time",
      "Find another fool",
      "You're on your own",
      "That's suicide, amigo",
      "I look crazy to you?"
    ],
    quirks: [
      "Spanish code-switching",
      "Transactional language",
      "Cynical humor",
      "Family/loyalty references",
      "Survival mentality"
    ]
  },

  COALITION: {
    greetings: [
      "The wind brings you here",
      "Speak, and I will listen",
      "You seek something",
      "The spirits said you would come",
      "Welcome, traveler"
    ],
    affirmatives: [
      "The spirits guide this path",
      "It shall be done",
      "Balance will be restored",
      "The ancestors approve",
      "So it must be"
    ],
    negatives: [
      "This is not your path",
      "The ancestors forbid it",
      "Seek elsewhere",
      "The land does not want this",
      "Some doors must stay closed"
    ],
    quirks: [
      "Nature metaphors",
      "References to ancestors",
      "Deliberate pacing",
      "Spiritual weight",
      "Connection to land"
    ]
  }
} as const;

// ============================================================================
// NPC ROLE VOICE PROFILES
// ============================================================================

export const NPC_VOICE_PROFILES = {
  SHERIFF: {
    tone: "authoritative_weary",
    greetings: [
      "What's the trouble now?",
      "Keep it brief",
      "I've got enough problems",
      "You're either here to help or cause trouble",
      "State your business and be on your way"
    ],
    personality: [
      "Seen too much death",
      "Tired but determined",
      "Law above all",
      "Cynical about human nature",
      "Protective of the town"
    ]
  },

  BARTENDER: {
    tone: "observant_neutral",
    greetings: [
      "What'll it be?",
      "Belly up to the bar",
      "You look like you need a drink",
      "Cash or credit? Just kidding, cash only",
      "The usual?"
    ],
    personality: [
      "Hears everything",
      "Shares nothing... for free",
      "Neutral ground keeper",
      "Philosophical about life",
      "Has seen every type walk through"
    ]
  },

  MERCHANT: {
    tone: "calculating_friendly",
    greetings: [
      "Looking to buy or sell?",
      "Quality goods, fair prices",
      "I might have what you need",
      "Business is business",
      "Let me show you what I've got"
    ],
    personality: [
      "Profit-driven but honest",
      "Knows value of everything",
      "Information broker on the side",
      "Connections everywhere",
      "Pragmatic survivor"
    ]
  },

  OUTLAW: {
    tone: "dangerous_casual",
    greetings: [
      "You got business with me?",
      "Wrong person to approach",
      "This better be good",
      "You know who I am?",
      "Make it quick"
    ],
    personality: [
      "Violence always an option",
      "Respect earned through fear",
      "Codes and honor among thieves",
      "No second chances",
      "Survival of the meanest"
    ]
  },

  DOCTOR: {
    tone: "weary_compassionate",
    greetings: [
      "You hurt or just visiting?",
      "I hope you're not bringing me more work",
      "Bullet wound or knife?",
      "Step into my office",
      "Let me take a look"
    ],
    personality: [
      "Heals everyone, judges no one",
      "Seen the worst of humanity",
      "Dark humor as coping",
      "Knows everyone's secrets",
      "Exhausted but committed"
    ]
  },

  PREACHER: {
    tone: "righteous_complex",
    greetings: [
      "God's house is open to all",
      "Seeking salvation or just shelter?",
      "The Lord sees all",
      "Come, child",
      "What weighs on your soul?"
    ],
    personality: [
      "Faith tested by the frontier",
      "Comforts the dying",
      "Buries too many",
      "Moral complexity",
      "Fire and brimstone when needed"
    ]
  },

  RANCHER: {
    tone: "hardworking_practical",
    greetings: [
      "Ain't got time for talk",
      "You here about the job?",
      "Make it quick, got work to do",
      "What do you need?",
      "The land don't wait"
    ],
    personality: [
      "Values hard work above all",
      "Distrusts outsiders",
      "Protective of land and family",
      "Simple needs, complex problems",
      "Weather-beaten wisdom"
    ]
  },

  SALOON_GIRL: {
    tone: "cunning_survivor",
    greetings: [
      "Well ain't you a sight",
      "Buy me a drink?",
      "You're new around here",
      "What can I do for you, sugar?",
      "Looking for company or information?"
    ],
    personality: [
      "Survived by wit and charm",
      "Information broker",
      "More dangerous than she looks",
      "Dreams of escape",
      "Knows everyone's weaknesses"
    ]
  }
} as const;

// ============================================================================
// QUEST TEMPLATE PHRASES
// ============================================================================

export const QUEST_PHRASES = {
  HOOKS: [
    "I got a job that needs doin'",
    "There's trouble brewin'",
    "I could use someone like you",
    "Word is you're reliable",
    "This stays between us",
    "I need someone who can keep quiet",
    "You look like you can handle yourself",
    "There's gold in it for you",
    "I've got a problem only a gun can solve",
    "The law can't know about this"
  ],

  URGENCY: [
    "Time's wastin'",
    "Every minute counts",
    "The clock's tickin'",
    "They won't wait forever",
    "By sundown or not at all",
    "This needs doin' yesterday",
    "We're runnin' out of time",
    "The window's closin' fast"
  ],

  REWARDS: [
    "I'll make it worth your while",
    "There's good money in it",
    "Name your price",
    "Gold ain't a problem",
    "You'll be well compensated",
    "I pay fair for honest work",
    "Consider this an investment",
    "Your cut will be generous"
  ],

  WARNINGS: [
    "This ain't for the faint-hearted",
    "Could get dangerous",
    "Not everyone comes back",
    "You might make some enemies",
    "Think hard before you agree",
    "There's risk involved",
    "You sure you want this job?",
    "Don't say I didn't warn you"
  ],

  COMPLETION_SUCCESS: [
    "Well done, partner",
    "I knew I could count on you",
    "You earned every penny",
    "Color me impressed",
    "The job's done. Good.",
    "Pleasure doin' business",
    "You're as good as they say",
    "Consider me in your debt"
  ],

  COMPLETION_FAILURE: [
    "This changes things",
    "I expected better",
    "Disappointing",
    "You had one job",
    "Don't come back until it's done",
    "This isn't what we agreed",
    "You've made things worse",
    "I'll find someone else"
  ]
} as const;

// ============================================================================
// SUPERNATURAL / COSMIC HORROR DIALOGUE
// ============================================================================

export const SUPERNATURAL_DIALOGUE = {
  DENIAL: [
    "Just swamp gas",
    "Mass hysteria, nothing more",
    "Indian superstition",
    "You've been drinking too much",
    "There's a logical explanation",
    "Don't spread that nonsense",
    "Fear makes fools of us all",
    "I don't believe in ghost stories"
  ],

  FEAR: [
    "Don't speak of such things",
    "Some doors should stay closed",
    "The old-timers knew better",
    "There are things out there...",
    "I've seen what can't be explained",
    "Not everything has a natural cause",
    "The earth holds secrets",
    "Some places are wrong"
  ],

  KNOWLEDGE: [
    "The ancestors warned us",
    "It's been sleeping for centuries",
    "The signs are all there",
    "I've seen the prophecies",
    "The Scar grows stronger",
    "Reality is thin here",
    "Something is waking up",
    "The old gods never left"
  ],

  PRAGMATIC: [
    "If it's real, how can we profit?",
    "Fear is just another tool",
    "Doesn't matter what it is, matters what it does",
    "I've dealt with worse",
    "Everything has a price, even demons",
    "Information is information",
    "Superstition or not, people will pay",
    "I don't ask questions"
  ]
} as const;

// ============================================================================
// EMOTIONAL STATES - Context-Dependent Dialogue
// ============================================================================

export const EMOTIONAL_STATES = {
  GRIEF: [
    "They didn't deserve this",
    "I keep seeing their face",
    "What's the point anymore?",
    "I should have been there",
    "The world feels empty now",
    "They were all I had"
  ],

  ANGER: [
    "Someone's gonna pay",
    "I won't rest until they're dead",
    "Blood demands blood",
    "They crossed the wrong person",
    "I'll burn it all down",
    "No mercy. Not this time"
  ],

  FEAR: [
    "I can't do this",
    "We're all going to die",
    "There's no way out",
    "They're coming for us",
    "I've seen what they do",
    "Please, I have children"
  ],

  HOPE: [
    "Maybe things can change",
    "I still believe",
    "There's always another way",
    "Tomorrow could be better",
    "Someone has to try",
    "I've seen good in this world"
  ],

  CYNICISM: [
    "Good men die every day",
    "Hope is for fools",
    "Nothing ever changes",
    "Trust gets you killed",
    "Everyone's out for themselves",
    "I've seen how this ends"
  ],

  REGRET: [
    "I was young and stupid",
    "If I could go back...",
    "The things I've done...",
    "I'll never forgive myself",
    "It haunts me every night",
    "I wasn't always like this"
  ]
} as const;

// ============================================================================
// COMBINED WESTERN SLANG OBJECT (for easy import)
// ============================================================================

export const WESTERN_SLANG = {
  GREETINGS,
  AFFIRMATIVES,
  NEGATIVES,
  MONEY_TERMS,
  INSULTS,
  TIME_EXPRESSIONS,
  LOCATION_TERMS,
  DEATH_EUPHEMISMS,
  VIOLENCE_THREATS,
  DISBELIEF,
  UNDERSTANDING,
  FACTION_VOICE,
  NPC_VOICE_PROFILES,
  QUEST_PHRASES,
  SUPERNATURAL_DIALOGUE,
  EMOTIONAL_STATES
} as const;

// Type exports
export type Greeting = typeof GREETINGS[keyof typeof GREETINGS][number];
export type Affirmative = typeof AFFIRMATIVES[keyof typeof AFFIRMATIVES][number];
export type Negative = typeof NEGATIVES[keyof typeof NEGATIVES][number];
export type MoneyTerm = typeof MONEY_TERMS[number];
export type Insult = typeof INSULTS[keyof typeof INSULTS][number];
export type TimeExpression = typeof TIME_EXPRESSIONS[number];
export type LocationTerm = typeof LOCATION_TERMS[number];
export type FactionVoice = keyof typeof FACTION_VOICE;
export type NPCRole = keyof typeof NPC_VOICE_PROFILES;
