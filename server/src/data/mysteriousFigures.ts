/**
 * Mysterious Figure NPCs Data
 *
 * Phase 4, Wave 4.2 - Mysterious Figure NPCs
 *
 * 10 wandering mysterious NPCs who add weird west elements,
 * provide cryptic quests, and serve as information brokers.
 * These strange, supernatural, or enigmatic characters make
 * the world feel alive with mystery and connect to The Scar.
 */

/**
 * Spawn conditions for mysterious figures
 */
export interface SpawnConditions {
  locations: string[];           // Location IDs where they can spawn
  timeOfDay?: string[];           // dawn, day, dusk, night
  weatherConditions?: string[];   // Clear, Stormy, Foggy, etc.
  playerConditions?: string[];    // High bounty, low health, etc.
  randomChance: number;           // 0-1, base chance to spawn
  questTrigger?: string;          // Specific quest that triggers appearance
  eventTrigger?: string;          // World event that triggers appearance
  minLevel?: number;              // Minimum player level
  maxLevel?: number;              // Maximum player level
  requiresDiscovery?: boolean;    // Must be discovered first
}

/**
 * Quest reward
 */
export interface QuestReward {
  type: 'gold' | 'xp' | 'item' | 'reputation' | 'lore' | 'special';
  amount?: number;
  itemId?: string;
  faction?: string;
  loreId?: string;
  specialEffect?: string;
}

/**
 * Mystery quest with cryptic elements
 */
export interface MysteryQuest {
  id: string;
  name: string;
  description: string;            // Cryptic description given to player
  actualObjective: string;        // What player actually needs to do
  objectives: Array<{
    id: string;
    description: string;
    type: string;
    target: string;
    required: number;
  }>;
  rewards: QuestReward[];
  consequences: string[];         // Good and bad potential outcomes
  loreRevealed: string[];        // Lore pieces revealed on completion
  moralWeight?: string;           // Describes the moral complexity
  multipleOutcomes?: boolean;     // Can end differently based on choices
}

/**
 * Dialogue system for mysterious figures
 */
export interface MysteriousDialogue {
  greeting: string[];             // Initial greeting
  crypticHints: string[];         // Random mysterious hints
  questDialogue: {
    [questId: string]: string[];
  };
  farewell: string[];             // Parting words
  refusal: string[];              // If player refuses quest
  information: {
    [topic: string]: string[];
  };
}

/**
 * Trade item for information brokers and collectors
 */
export interface TradeItem {
  itemId: string;
  name: string;
  description: string;
  price?: number;                 // Gold price if applicable
  barterItem?: string;            // Required item for barter
  cursed?: boolean;
  loreText?: string;
  requiresTrust?: number;
}

/**
 * Supernatural level enum
 */
export type SupernaturalLevel = 'mundane' | 'touched' | 'supernatural' | 'cosmic';

/**
 * Complete mysterious figure definition
 */
export interface MysteriousFigure {
  id: string;
  name: string;
  title: string;
  appearance: string;
  role: string;
  behavior: string;
  personality: string;
  backstory: string;
  spawnConditions: SpawnConditions;
  quests: MysteryQuest[];
  dialogue: MysteriousDialogue;
  supernaturalLevel: SupernaturalLevel;
  knowledgeAreas: string[];       // What info they can share
  tradeItems?: TradeItem[];       // Special items they deal in
  warnings?: string[];            // Hints about The Scar/dangers
  faction?: string;               // Loose affiliation if any
  scarConnection?: string;        // How they connect to The Scar
  discoveryMethod?: string;       // How players find them
}

// ========================================
// FIGURE #1: The Stranger
// ========================================
export const THE_STRANGER: MysteriousFigure = {
  id: 'mysterious_stranger',
  name: 'The Stranger',
  title: 'The Wanderer',
  appearance: 'Tall, gaunt figure always shrouded in shadow. Face never fully visible, features shifting. Wears a long duster coat darker than midnight. Eyes gleam with an otherworldly light.',
  role: 'Appears at critical moments to offer cryptic advice and moral tests',
  behavior: 'Never stays long, speaks in riddles, vanishes mysteriously. Always watching from the edges.',
  personality: 'Enigmatic, omniscient, morally ambiguous, speaks in metaphors',
  backstory: 'No one knows who or what The Stranger is. Some say he\'s been walking these lands since before the territory had a name. Others claim he\'s Death himself, or perhaps something older.',
  spawnConditions: {
    locations: ['any'], // Can appear anywhere
    timeOfDay: ['dusk', 'night'],
    randomChance: 0.05,
    playerConditions: ['critical_moment', 'moral_choice', 'near_death'],
    minLevel: 5
  },
  quests: [
    {
      id: 'stranger_crossroads',
      name: 'The Crossroads',
      description: 'The Stranger offers you a choice. Three paths lie before you. One leads to gold, one to blood, one to truth. Choose wisely, for the road taken cannot be untraveled.',
      actualObjective: 'Make a moral choice that affects your character\'s path',
      objectives: [
        {
          id: 'choose_path',
          description: 'Choose your path at the crossroads',
          type: 'choice',
          target: 'moral_decision',
          required: 1
        }
      ],
      rewards: [
        { type: 'special', specialEffect: 'path_chosen' },
        { type: 'lore', loreId: 'stranger_truth_1' }
      ],
      consequences: [
        'Path of Gold: Wealth but isolation',
        'Path of Blood: Power but enemies',
        'Path of Truth: Knowledge but burden'
      ],
      loreRevealed: [
        'The Stranger knows things no mortal should know.',
        'Some say The Stranger is testing people for something... or someone.'
      ],
      moralWeight: 'Each path has a price. There are no right answers.',
      multipleOutcomes: true
    },
    {
      id: 'stranger_debt',
      name: 'The Debt',
      description: 'The Stranger claims you owe him for something you haven\'t done yet. He asks for a favor to be repaid in the future. The terms are unclear.',
      actualObjective: 'Agree to The Stranger\'s terms and complete his future task',
      objectives: [
        {
          id: 'agree_to_terms',
          description: 'Agree to The Stranger\'s bargain',
          type: 'choice',
          target: 'stranger_pact',
          required: 1
        }
      ],
      rewards: [
        { type: 'item', itemId: 'stranger_token' },
        { type: 'special', specialEffect: 'stranger_pact' }
      ],
      consequences: [
        'The Stranger will call in this debt at the worst possible moment',
        'But he may also save your life when you need it most'
      ],
      loreRevealed: [
        'The Stranger\'s bargains always come with a price',
        'Those who refuse him often meet unfortunate ends'
      ],
      moralWeight: 'An undefined debt to an unknown entity. What could go wrong?'
    }
  ],
  dialogue: {
    greeting: [
      'We meet again... or is it for the first time? Hard to say.',
      'You\'ve been expected. Not by me, perhaps, but by the road itself.',
      'Curious. You can see me. Not everyone can.',
      'The hour grows late, and the shadows grow long. Walk with me.'
    ],
    crypticHints: [
      'The Scar hungers. It has always hungered.',
      'Three factions dance, but they don\'t know the tune was written long ago.',
      'Gold will not save you from what\'s coming.',
      'The dead walk, but it\'s the living you should fear.',
      'Watch the stars. When they start disappearing, run.',
      'There\'s a fourth faction no one speaks of. For good reason.',
      'The old gods are not dead. They\'re sleeping. Pray they stay that way.'
    ],
    questDialogue: {
      stranger_crossroads: [
        'Three paths. The first leads to comfort and coin. The second to strength and slaughter. The third to wisdom and woe.',
        'Choose carefully. The road remembers.',
        'There are no right choices. Only choices.'
      ],
      stranger_debt: [
        'You will owe me a debt. Not now, but soon.',
        'I ask for your word, nothing more. But your word will bind you.',
        'When I call, you will come. That is the bargain.'
      ]
    },
    farewell: [
      'We\'ll meet again. We always do.',
      'The road is long. Walk carefully.',
      'Remember: nothing is inevitable until it happens.',
      '*The Stranger fades into shadow, leaving only the smell of smoke and sage*'
    ],
    refusal: [
      'A choice in itself. Let\'s hope it\'s the right one.',
      'So be it. But the offer won\'t come again.',
      'The road goes on without you, then.'
    ],
    information: {
      the_scar: [
        'Something sleeps beneath The Scar. Best let it sleep.',
        'They say it\'s a canyon. It\'s not. It\'s a wound.'
      ],
      factions: [
        'They fight over land. The land doesn\'t care who wins.',
        'Three armies marching toward the same cliff.'
      ],
      future: [
        'The storm is coming. Not a storm of rain, but of blood and shadow.',
        'This territory has maybe five years. Maybe less.'
      ]
    }
  },
  supernaturalLevel: 'cosmic',
  knowledgeAreas: ['The Scar', 'Cosmic Horror', 'Future Events', 'Ancient History', 'Moral Philosophy', 'Death'],
  warnings: [
    'Stay away from The Scar at night',
    'When you hear singing from below, run',
    'The stars are going out, one by one',
    'Something old is waking up'
  ],
  scarConnection: 'The Stranger seems to know what lies beneath The Scar. He speaks of it with familiarity and dread.',
  discoveryMethod: 'Appears spontaneously at critical character moments'
};

// ========================================
// FIGURE #2: Old Coyote
// ========================================
export const OLD_COYOTE: MysteriousFigure = {
  id: 'old_coyote',
  name: 'Old Coyote',
  title: 'The Trickster',
  appearance: 'Sometimes appears as an old Native American man with a coyote-fur cloak. Sometimes as an actual coyote. Sometimes something in between. His eyes are always golden and too intelligent.',
  role: 'Native American trickster spirit who tests worthiness and teaches lessons through pranks and challenges',
  behavior: 'Playful, mischievous, plays pranks, speaks in riddles, tests mortals',
  personality: 'Chaotic, wise, humorous, teaches through trickery, respects bravery and cleverness',
  backstory: 'Old Coyote is a spirit from before the white man came, from before the Nahi Coalition was formed. He walks the land, testing those he finds interesting, punishing the arrogant, and rewarding the clever.',
  spawnConditions: {
    locations: [
      '6501a0000000000000000004', // Kaiowa Mesa
      '6501a000000000000000000b', // Spirit Springs
      '6501a000000000000000000d'  // The Wastes
    ],
    timeOfDay: ['dawn', 'dusk'],
    randomChance: 0.08,
    playerConditions: ['worthy_deed', 'arrogant_action'],
    minLevel: 3
  },
  quests: [
    {
      id: 'coyote_riddle',
      name: 'The Trickster\'s Riddle',
      description: 'Old Coyote challenges you to answer his riddle correctly. Get it wrong, and he\'ll play a trick on you. Get it right, and he\'ll share ancient wisdom.',
      actualObjective: 'Answer Old Coyote\'s riddle correctly (or survive his trick)',
      objectives: [
        {
          id: 'answer_riddle',
          description: 'Solve Old Coyote\'s riddle',
          type: 'riddle',
          target: 'coyote_wisdom',
          required: 1
        }
      ],
      rewards: [
        { type: 'xp', amount: 300 },
        { type: 'lore', loreId: 'coyote_wisdom' },
        { type: 'item', itemId: 'coyote_tooth' }
      ],
      consequences: [
        'Answer correctly: Gain his respect and ancient knowledge',
        'Answer wrong: Suffer a harmless but embarrassing prank',
        'Refuse: Nothing happens, but he remembers'
      ],
      loreRevealed: [
        'Old Coyote has walked these lands since time began',
        'The Coalition shamans know him and respect his wisdom',
        'He once tricked Death itself, earning his immortality'
      ],
      moralWeight: 'Pride comes before a fall. Humility and cleverness are rewarded.'
    },
    {
      id: 'coyote_theft',
      name: 'The Sacred Theft',
      description: 'Old Coyote asks you to steal something sacred from a sacred place. He won\'t say why, but promises it\'s important. Trickster spirits don\'t usually lie... do they?',
      actualObjective: 'Steal the sacred item from the Coalition holy site',
      objectives: [
        {
          id: 'steal_totem',
          description: 'Steal the sacred totem from Spirit Springs',
          type: 'collect',
          target: 'sacred_totem',
          required: 1
        }
      ],
      rewards: [
        { type: 'gold', amount: 0 }, // No gold reward
        { type: 'reputation', faction: 'NAHI_COALITION', amount: -50 }, // Lose rep
        { type: 'item', itemId: 'trickster_blessing' },
        { type: 'lore', loreId: 'coyote_trick_truth' }
      ],
      consequences: [
        'The Coalition will be angry, but the totem is returned mysteriously',
        'Old Coyote was testing if you\'d blindly follow orders',
        'Those who refuse earn his true respect'
      ],
      loreRevealed: [
        'The best trick is the one where everyone learns something',
        'Sometimes the test is whether you\'ll take the test at all'
      ],
      moralWeight: 'When a trickster asks you to do something, question everything.',
      multipleOutcomes: true
    }
  ],
  dialogue: {
    greeting: [
      '*A coyote yips in the distance* Oh, you can hear me? How interesting.',
      'Ah, a new plaything! I mean... a new friend!',
      '*The old man grins with too many teeth* What brings you to Coyote\'s country?',
      'I was just telling a joke. Want to hear the punchline? You\'re standing in it.'
    ],
    crypticHints: [
      'The spirits are restless. Even I don\'t play pranks on spirits.',
      'The white men dig in the earth. They should stop digging.',
      'The Scar? Oh, that\'s not my jurisdiction. That belongs to... older things.',
      'Three factions, but only two are human. Can you guess which two?',
      'The mesa remembers everything. Every step, every word, every betrayal.'
    ],
    questDialogue: {
      coyote_riddle: [
        'Here\'s a riddle, little human: What walks on four legs in the morning, two legs at noon, and three legs in the evening?',
        'Wrong! The answer is me. I walk however I want. *coyote laughter*',
        'Alright, alright, one more: What\'s the difference between a wise man and a fool?',
        'The wise man knows he might be the fool.'
      ],
      coyote_theft: [
        'I need you to steal something for me. From a very sacred place.',
        'Will you do it? Or will you question the trickster?',
        'Smart choice. The real test was whether you\'d agree without thinking.'
      ]
    },
    farewell: [
      '*The old man becomes a coyote and trots away laughing*',
      'Until next time, clever one. Or foolish one. We\'ll see!',
      'Remember: the best trick is the truth no one believes.',
      '*He vanishes in a dust devil, leaving only pawprints*'
    ],
    refusal: [
      'Ha! Even better. You\'re learning.',
      'Now THAT\'S wisdom. You pass the test.',
      'Oh, you\'re no fun. But you\'re smart. I like you.'
    ],
    information: {
      coalition: [
        'The Coalition remembers the old ways. Good for them.',
        'The shamans still leave offerings for me. I appreciate that.'
      ],
      spirits: [
        'Spirits are everywhere. Some friendly, some not. I\'m friendly! Mostly.',
        'The land has a spirit. The canyon has a spirit. Even The Scar has a spirit. That one you should avoid.'
      ],
      wisdom: [
        'Want wisdom? Here: Don\'t anger things bigger than you.',
        'Second wisdom: Everything is bigger than you.'
      ]
    }
  },
  supernaturalLevel: 'supernatural',
  knowledgeAreas: ['Coalition History', 'Spirit World', 'Trickster Wisdom', 'Ancient Legends', 'Nature Magic'],
  faction: 'NAHI_COALITION',
  warnings: [
    'Never trust a coyote completely, even a spirit coyote',
    'The old gods walk these lands. Be respectful.',
    'Some places are sacred. Honor that.'
  ],
  scarConnection: 'Old Coyote avoids The Scar. He says it belongs to "older things" and won\'t elaborate.',
  discoveryMethod: 'Appears to players who show respect for Coalition lands or display cleverness'
};

// ========================================
// FIGURE #3: The Mourning Widow
// ========================================
export const MOURNING_WIDOW: MysteriousFigure = {
  id: 'mourning_widow',
  name: 'The Mourning Widow',
  title: 'La Llorona',
  appearance: 'A woman in a black Victorian mourning dress, face hidden behind a black veil. When the veil lifts, her face is tear-streaked and pale as death. She weeps constantly, soundlessly.',
  role: 'Ghost who appears near sites of death and tragedy, warns of danger, seeks justice for the murdered',
  behavior: 'Weeps silently, whispers warnings, points toward danger, mourns the dead',
  personality: 'Tragic, sorrowful, protective of innocents, vengeful toward murderers',
  backstory: 'Maria Delgado was murdered along with her husband and children by bandits in 1862. Unable to pass on, she wanders the territory, appearing at sites of tragedy to warn others and seeking those who killed her family.',
  spawnConditions: {
    locations: [
      '6501a0000000000000000005', // Sangre Canyon (named for blood)
      'any_death_site'
    ],
    timeOfDay: ['night'],
    weatherConditions: ['Foggy', 'Stormy'],
    randomChance: 0.06,
    playerConditions: ['near_death', 'recent_combat'],
    minLevel: 5
  },
  quests: [
    {
      id: 'widow_justice',
      name: 'A Mother\'s Vengeance',
      description: 'The Mourning Widow speaks for the first time, her voice like wind through graves. She tells you of the men who murdered her family. They still live. They still kill. She asks for justice.',
      actualObjective: 'Find and bring justice to the bandits who killed the Widow\'s family',
      objectives: [
        {
          id: 'find_killers',
          description: 'Track down the Delgado family killers',
          type: 'kill',
          target: 'delgado_killers',
          required: 3
        },
        {
          id: 'find_graves',
          description: 'Find the unmarked graves of the Delgado family',
          type: 'visit',
          target: 'delgado_graves',
          required: 1
        }
      ],
      rewards: [
        { type: 'xp', amount: 500 },
        { type: 'item', itemId: 'widow_blessing' },
        { type: 'lore', loreId: 'widow_story' },
        { type: 'special', specialEffect: 'widow_protection' }
      ],
      consequences: [
        'The Widow finds peace and blesses you with protection',
        'The bandits were connected to larger criminal network',
        'You\'ve made powerful enemies'
      ],
      loreRevealed: [
        'The Mourning Widow\'s real name was Maria Delgado',
        'She and her family were killed during the Territory Wars of 1862',
        'Her killers became founders of the Bloodhand Gang',
        'She protects those who cannot protect themselves'
      ],
      moralWeight: 'Justice or mercy? The bandits are old men now, but their crimes remain.'
    },
    {
      id: 'widow_warning',
      name: 'The Widow\'s Warning',
      description: 'The Widow appears before you, pointing frantically toward the canyon. Something terrible is coming. She cannot speak, but her terror is palpable.',
      actualObjective: 'Investigate the danger the Widow warns about',
      objectives: [
        {
          id: 'investigate_canyon',
          description: 'Investigate Sangre Canyon',
          type: 'visit',
          target: 'sangre_canyon_danger',
          required: 1
        }
      ],
      rewards: [
        { type: 'xp', amount: 200 },
        { type: 'special', specialEffect: 'widow_warning_heeded' }
      ],
      consequences: [
        'You avoid a deadly ambush thanks to the warning',
        'Or you discover something worse than bandits',
        'The Widow saved your life'
      ],
      loreRevealed: [
        'The Widow can sense death before it happens',
        'She tries to save those she can',
        'Not all ghosts are malevolent'
      ],
      moralWeight: 'Trust a ghost, or ignore the warning?'
    }
  ],
  dialogue: {
    greeting: [
      '*Soundless weeping. She points toward danger.*',
      '*A whisper like wind*: "Beware... beware..."',
      '*She lifts her veil slightly, revealing tear-stained eyes*',
      '*The temperature drops. You see your breath. She appears.*'
    ],
    crypticHints: [
      '*Whispers*: "They took everything... they take still..."',
      '"The canyon runs red. Always red. Forever red."',
      '"Death comes in the night. I know. I am death."',
      '"Three... three men... still alive... still killing..."'
    ],
    questDialogue: {
      widow_justice: [
        '*Her voice is clearer now*: "Three men. Scar-faced. One laughs. One drinks. One prays. All guilty."',
        '"They killed us. Killed my babies. Find them. Please."',
        '"Give me peace. Give my children peace."'
      ],
      widow_warning: [
        '*Points frantically toward canyon*',
        '*Shakes her head violently, warning you away*',
        '*Gestures: turn back, turn back*'
      ]
    },
    farewell: [
      '*Fades into mist, still weeping*',
      '*Whispers*: "Be careful, living one. The dead are watching."',
      '*She touches your hand. It\'s ice cold. Then she\'s gone.*',
      '*One last tear falls. It sizzles on the ground like acid.*'
    ],
    refusal: [
      '*Her weeping intensifies, heartbreaking*',
      '*She fades away, disappointment in her eyes*',
      '*Whispers*: "Then I wait... as I always wait..."'
    ],
    information: {
      death: [
        '"Death is not the end. I know this. I am this."',
        '"The dead remember. Everything."'
      ],
      tragedy: [
        '"This land is soaked in blood. Can you not feel it?"',
        '"So many ghosts. So much pain."'
      ],
      family: [
        '"I had three children. Beautiful children. They would be grown now."',
        '"I cannot rest while they remain unavenged."'
      ]
    }
  },
  supernaturalLevel: 'supernatural',
  knowledgeAreas: ['Death', 'Tragedy Sites', 'Bandits', 'Hidden Graves', 'Danger Sense'],
  warnings: [
    'Heed her warnings - she can sense death',
    'She appears before tragedies',
    'Her tears burn like acid'
  ],
  scarConnection: 'She fears The Scar more than anything. Says "something worse than death" dwells there.',
  discoveryMethod: 'Appears near death sites or to warn of danger'
};

// ========================================
// FIGURE #4: "Doc" Prometheus
// ========================================
export const DOC_PROMETHEUS: MysteriousFigure = {
  id: 'doc_prometheus',
  name: '"Doc" Prometheus',
  title: 'Mad Scientist',
  appearance: 'Wild gray hair standing on end, brass goggles perpetually perched on forehead, stained lab coat covered in burns and chemical stains. Carries bizarre contraptions that hum and spark.',
  role: 'Inventor of impossible things, creates weird science devices that shouldn\'t work but do',
  behavior: 'Rambles about experiments, constantly taking notes, oblivious to danger, obsessed with progress',
  personality: 'Brilliant, manic, ethically questionable, genuinely means well, terrible at social interaction',
  backstory: 'Dr. Emmett Prometheus was expelled from every university on the East Coast for "dangerous experimentation." He came to the frontier where nobody asks questions. His inventions defy known physics, leading some to believe he\'s discovered something unnatural.',
  spawnConditions: {
    locations: [
      '6501a0000000000000000006', // Goldfinger\'s Mine (labs there)
      '6501a0000000000000000001', // Red Gulch
      '6501a000000000000000000d'  // The Wastes (tests inventions)
    ],
    timeOfDay: ['any'],
    randomChance: 0.07,
    minLevel: 8,
    requiresDiscovery: true
  },
  quests: [
    {
      id: 'prometheus_materials',
      name: 'Unconventional Components',
      description: 'Doc Prometheus needs materials for his latest invention. The list is... unusual. He needs ghost rock, coyote teeth, and "the fear of a dying man." He assures you it\'s perfectly safe.',
      actualObjective: 'Gather strange materials for Doc\'s experiment',
      objectives: [
        {
          id: 'ghost_rock',
          description: 'Collect ghost rock from The Scar region',
          type: 'collect',
          target: 'ghost_rock',
          required: 5
        },
        {
          id: 'coyote_teeth',
          description: 'Collect coyote teeth',
          type: 'collect',
          target: 'coyote_tooth',
          required: 3
        },
        {
          id: 'dying_fear',
          description: 'Capture "emotional essence" near death site',
          type: 'collect',
          target: 'fear_essence',
          required: 1
        }
      ],
      rewards: [
        { type: 'gold', amount: 200 },
        { type: 'item', itemId: 'prometheus_device' },
        { type: 'xp', amount: 400 }
      ],
      consequences: [
        'The device works, but causes a small explosion',
        'Doc learns something important about ghost rock',
        'You witness something that shouldn\'t be scientifically possible'
      ],
      loreRevealed: [
        'Ghost rock contains unusual energy properties',
        'Doc Prometheus may have discovered something about The Scar',
        'His devices work on principles that violate physics'
      ],
      moralWeight: 'Is progress worth the risk? Doc\'s experiments are dangerous.'
    },
    {
      id: 'prometheus_test',
      name: 'Voluntary Test Subject',
      description: 'Doc needs someone to test his latest invention: a device that supposedly enhances human abilities. He promises it\'s "mostly safe" and "probably won\'t cause permanent damage." His confidence is not inspiring.',
      actualObjective: 'Test Doc\'s experimental device',
      objectives: [
        {
          id: 'test_device',
          description: 'Use Prometheus Device',
          type: 'use_item',
          target: 'prometheus_test_device',
          required: 1
        }
      ],
      rewards: [
        { type: 'special', specialEffect: 'prometheus_enhancement' },
        { type: 'gold', amount: 150 },
        { type: 'xp', amount: 300 }
      ],
      consequences: [
        'The device works, granting temporary enhanced abilities',
        'Side effects include strange visions of The Scar',
        'You see things invisible to normal eyes'
      ],
      loreRevealed: [
        'Doc\'s devices tap into supernatural energy',
        'He may be using ghost rock in dangerous ways',
        'His "science" might actually be something else entirely'
      ],
      moralWeight: 'Some knowledge comes at a cost. Doc may be playing with forces beyond science.',
      multipleOutcomes: true
    }
  ],
  dialogue: {
    greeting: [
      '*adjusts goggles excitedly* Oh! A visitor! Or are you a hallucination? No matter!',
      'Excellent timing! I need someone with opposable thumbs and questionable judgment!',
      '*scribbling in notebook* Yes, yes, the variable coefficient of... oh, hello!',
      'Quick question: how do you feel about experimental science?'
    ],
    crypticHints: [
      'The ghost rock from The Scar isn\'t just rock. It\'s... alive? Responsive? Aware?',
      'My devices shouldn\'t work according to conventional physics. So I\'m using unconventional physics!',
      'I\'ve measured energy readings from The Scar that are... impossible. Fascinatingly impossible!',
      'The locals say the land is "cursed." I say it\'s "scientifically anomalous." Totally different.',
      'Something about The Scar\'s geometry doesn\'t obey Euclidean principles. Non-Euclidean space, perhaps?'
    ],
    questDialogue: {
      prometheus_materials: [
        'I need materials for my greatest invention yet! Well, greatest this week.',
        'Ghost rock, definitely. Coyote teeth, for the piezoelectric properties. And fear. I need fear.',
        'Fear has a measurable electromagnetic signature! Probably!'
      ],
      prometheus_test: [
        'I need a test subject. That\'s you! Congratulations!',
        'The device is perfectly safe. Well, 60% safe. Okay, 40% safe. But progress demands risk!',
        'If anything goes wrong, try not to explode. It\'s terrible for the data.'
      ]
    },
    farewell: [
      'Must return to the lab! Science waits for no man!',
      '*something explodes in the distance* That\'s probably fine!',
      'Remember: if my device starts glowing purple, run! Purple is bad!',
      '*muttering equations as he wanders away*'
    ],
    refusal: [
      'No experimental curiosity? How disappointing!',
      'Fine, fine. I\'ll find someone else with fewer survival instincts.',
      'Your loss! This could have been groundbreaking! Or ground-cratering. One of those!'
    ],
    information: {
      ghost_rock: [
        'Ghost rock is remarkable! It shouldn\'t exist! But it does! Therefore science!',
        'The energy signature is like nothing I\'ve ever seen. And I\'ve seen some things!'
      ],
      inventions: [
        'My devices work on principles I don\'t fully understand yet. But they work!',
        'Some say it\'s magic. I say it\'s undiscovered science. Probably.'
      ],
      the_scar: [
        'The Scar is a treasure trove of anomalous readings!',
        'I tried to set up a lab there. My equipment went haywire. Then it melted. Fascinating!'
      ]
    }
  },
  supernaturalLevel: 'touched',
  knowledgeAreas: ['Weird Science', 'Ghost Rock', 'The Scar Anomalies', 'Experimental Technology', 'Dangerous Knowledge'],
  tradeItems: [
    {
      itemId: 'prometheus_goggles',
      name: 'Prometheus Goggles',
      description: 'Goggles that let you see energy fields. Causes headaches.',
      price: 500,
      cursed: false,
      loreText: 'You can see things you shouldn\'t be able to see'
    },
    {
      itemId: 'ghost_rock_detector',
      name: 'Ghost Rock Detector',
      description: 'Beeps near ghost rock. Also beeps near ghosts. Hard to tell the difference.',
      price: 300
    }
  ],
  warnings: [
    'Don\'t use Doc\'s inventions near flammable materials',
    'Purple glowing is bad. Red glowing is worse.',
    'If a device talks to you, stop using it immediately'
  ],
  scarConnection: 'Doc is obsessed with The Scar\'s anomalous properties. His devices work better near it, which terrifies and excites him.',
  discoveryMethod: 'Find his hidden laboratory in Goldfinger\'s Mine or encounter him during experiments in The Wastes'
};

// ========================================
// FIGURE #5: The Prophet
// ========================================
export const THE_PROPHET: MysteriousFigure = {
  id: 'the_prophet',
  name: 'The Prophet',
  title: 'Doomsayer of The Scar',
  appearance: 'Gaunt, wild-eyed man covered in strange symbols carved into his own skin. Ragged clothes, bare feet bleeding from walking. Hair matted, beard long. Eyes see things not present.',
  role: 'Warns about What-Waits-Below, the cosmic horror sleeping beneath The Scar',
  behavior: 'Screams prophecies, scratches symbols in dirt, mostly dismissed as mad',
  personality: 'Terrified, urgent, desperate to be believed, genuinely trying to save people',
  backstory: 'Jeremiah Black was a miner who dug too deep in The Scar. He saw something down there that broke his mind... or opened it. Now he wanders, warning anyone who\'ll listen about the thing that sleeps below.',
  spawnConditions: {
    locations: [
      '6501a0000000000000000008', // The Scar
      '6501a0000000000000000006', // Goldfinger\'s Mine
      'near_the_scar'
    ],
    timeOfDay: ['dusk', 'night'],
    weatherConditions: ['Stormy'],
    randomChance: 0.09,
    minLevel: 10
  },
  quests: [
    {
      id: 'prophet_symbols',
      name: 'The Warning Signs',
      description: 'The Prophet frantically draws symbols in the dirt, screaming that they must be placed around The Scar to "keep it sleeping." He begs you to help place them before it\'s too late.',
      actualObjective: 'Place warning symbols at key points around The Scar',
      objectives: [
        {
          id: 'place_symbols',
          description: 'Place Prophet\'s symbols around The Scar',
          type: 'visit',
          target: 'scar_seal_points',
          required: 5
        }
      ],
      rewards: [
        { type: 'xp', amount: 600 },
        { type: 'lore', loreId: 'scar_truth_1' },
        { type: 'item', itemId: 'prophet_charm' }
      ],
      consequences: [
        'The symbols glow faintly when placed - they\'re doing something',
        'You hear something from below the canyon - something huge',
        'The Prophet was telling the truth'
      ],
      loreRevealed: [
        'Something sleeps beneath The Scar',
        'The Prophet saw it when he was mining',
        'The symbols are ancient Coalition wards',
        'What-Waits-Below is older than human civilization'
      ],
      moralWeight: 'He seems mad, but what if he\'s right?'
    },
    {
      id: 'prophet_vision',
      name: 'The Dark Vision',
      description: 'The Prophet grabs your arm with surprising strength. "You need to see," he whispers. "You need to understand." He offers you a strange fungus from The Scar. "Eat this. See the truth."',
      actualObjective: 'Experience The Prophet\'s vision by consuming the fungus',
      objectives: [
        {
          id: 'consume_fungus',
          description: 'Eat the Scar fungus',
          type: 'use_item',
          target: 'scar_fungus',
          required: 1
        }
      ],
      rewards: [
        { type: 'lore', loreId: 'scar_vision' },
        { type: 'special', specialEffect: 'prophet_sight' },
        { type: 'xp', amount: 500 }
      ],
      consequences: [
        'You see a vision of what lies beneath The Scar',
        'The knowledge is terrible and wonderful',
        'You understand why The Prophet is terrified',
        'Some things cannot be unseen'
      ],
      loreRevealed: [
        'What-Waits-Below is vast beyond comprehension',
        'It dreams of the surface world',
        'When it wakes, everything ends',
        'The Scar is not a canyon - it\'s a wound in reality',
        'The Prophet is the sanest person in the territory'
      ],
      moralWeight: 'Some knowledge destroys innocence. Are you sure you want to know?',
      multipleOutcomes: true
    }
  ],
  dialogue: {
    greeting: [
      '*grabs your arm* IT STIRS! IT DREAMS! CAN\'T YOU FEEL IT?',
      '*scratching symbols in the dirt frantically* The signs... the signs are everywhere...',
      'You... you\'ve been near it. I can smell The Scar on you. BE CAREFUL.',
      '*whispers urgently* They all think I\'m mad. I wish they were right.'
    ],
    crypticHints: [
      'IT WAITS BELOW! SLEEPING BUT DREAMING! DREAMS BLEED INTO REALITY!',
      'The stars are wrong. Look up! COUNT THEM! There are fewer than yesterday!',
      'The Scar grows wider each year. Slowly. So slowly. But it grows.',
      'The old tribes knew. They called it Tzitzimitl. The Star Demon. They sealed it.',
      'When you hear the singing from below, RUN. Don\'t listen. Never listen.',
      'The end comes from below. Always below. Why does everyone keep digging?'
    ],
    questDialogue: {
      prophet_symbols: [
        'These symbols! Ancient! Powerful! They keep it SLEEPING!',
        'Place them! Five points! The pentagram seal! HURRY!',
        'If the seal breaks... if IT wakes... *gibbers in terror*'
      ],
      prophet_vision: [
        'You don\'t believe me. No one believes me. But I can SHOW you.',
        'Eat this. See what I saw. Then you\'ll understand.',
        'But be warned - some knowledge cannot be forgotten.'
      ]
    },
    farewell: [
      '*returns to scratching symbols, muttering*',
      'STAY AWAY FROM THE SCAR! STAY AWAY!',
      '*looks at you with sudden clarity* You\'ve been warned. I can do no more.',
      '*wanders off, weeping*'
    ],
    refusal: [
      'Fool! FOOL! You\'ll see! You\'ll ALL see!',
      'Then join the rest of the blind and ignorant!',
      '*collapses, sobbing* I tried... I tried to warn them...'
    ],
    information: {
      the_scar: [
        'Not a canyon. A WOUND. A tear in the world.',
        'Something vast. Ancient. HUNGRY. It sleeps there.',
        'The Mexicans called it La Cicatriz. The scar where reality died.'
      ],
      what_waits_below: [
        'Older than humanity. Older than earth. From beyond the stars.',
        'It dreams. Its dreams become real. Nightmares walking.',
        'When it wakes... *cannot continue, sobbing*'
      ],
      mining: [
        'I was a miner. We dug deep. Too deep. We found... something.',
        'The others died. Or worse than died. Only I escaped.',
        'STOP DIGGING! STOP DIGGING! STOP DIGGING!'
      ]
    }
  },
  supernaturalLevel: 'cosmic',
  knowledgeAreas: ['The Scar', 'What-Waits-Below', 'Cosmic Horror', 'Ancient Seals', 'Apocalyptic Knowledge'],
  warnings: [
    'THE SCAR WILL CONSUME EVERYTHING',
    'Don\'t dig deep in Scar territory',
    'When you hear singing from below, run',
    'The stars are disappearing',
    'It\'s waking up'
  ],
  scarConnection: 'The Prophet is the only human who has seen What-Waits-Below and survived. The knowledge has broken him, but his warnings are true.',
  discoveryMethod: 'Encountered near The Scar, especially at night or during storms'
};

// ========================================
// FIGURE #6: Mama Laveau
// ========================================
export const MAMA_LAVEAU: MysteriousFigure = {
  id: 'mama_laveau',
  name: 'Mama Laveau',
  title: 'Voodoo Queen',
  appearance: 'Elegant Black woman who appears ageless - could be 30 or 300. Wears colorful fabrics and gold jewelry. Surrounded by a faint shimmer, as if spirits hover near her. Eyes like dark water, seeing everything.',
  role: 'Practices real voodoo magic, communicates with spirits, makes deals',
  behavior: 'Graceful, powerful, demands respect, helps those who pay proper respect',
  personality: 'Wise, powerful, fair but strict, protective of her people, dangerous when crossed',
  backstory: 'Mama Laveau came from New Orleans decades ago, bringing her power with her. She\'s a genuine voodoo practitioner with real magical ability. The spirits obey her, the dead speak to her, and even The Scar respects her boundaries.',
  spawnConditions: {
    locations: [
      '6501a0000000000000000002', // The Frontera
      '6501a0000000000000000005', // Sangre Canyon
      'crossroads'
    ],
    timeOfDay: ['night'],
    weatherConditions: ['any'],
    randomChance: 0.06,
    minLevel: 7,
    requiresDiscovery: true
  },
  quests: [
    {
      id: 'laveau_spirits',
      name: 'Communion with the Dead',
      description: 'Mama Laveau offers to help you speak with a dead person - for a price. She needs offerings for the Loa, and you must participate in the ritual. "The dead remember," she says. "They can tell you things."',
      actualObjective: 'Gather ritual materials and participate in spirit communion',
      objectives: [
        {
          id: 'gather_offerings',
          description: 'Collect ritual offerings',
          type: 'collect',
          target: 'ritual_offerings',
          required: 5
        },
        {
          id: 'attend_ritual',
          description: 'Participate in voodoo ritual',
          type: 'visit',
          target: 'ritual_site',
          required: 1
        }
      ],
      rewards: [
        { type: 'lore', loreId: 'spirit_knowledge' },
        { type: 'special', specialEffect: 'spirit_contact' },
        { type: 'xp', amount: 450 }
      ],
      consequences: [
        'You speak with a dead person who gives you information',
        'The spirits take notice of you',
        'Mama Laveau owes you a small favor'
      ],
      loreRevealed: [
        'Mama Laveau\'s magic is genuine and powerful',
        'The dead can be contacted with proper rituals',
        'The Loa spirits are real and active in this territory'
      ],
      moralWeight: 'Dealing with spirits always has a price. Are you prepared to pay it?'
    },
    {
      id: 'laveau_curse',
      name: 'The Curse',
      description: 'Someone has placed a voodoo curse on you. Mama Laveau can sense it and offers to remove it - but she wants to know who placed it and why. She demands truth for aid.',
      actualObjective: 'Confess your sins to Mama Laveau and receive cleansing',
      objectives: [
        {
          id: 'confession',
          description: 'Confess to Mama Laveau',
          type: 'dialogue',
          target: 'mama_confession',
          required: 1
        },
        {
          id: 'cleansing_ritual',
          description: 'Undergo cleansing ritual',
          type: 'ritual',
          target: 'curse_removal',
          required: 1
        }
      ],
      rewards: [
        { type: 'special', specialEffect: 'curse_removed' },
        { type: 'item', itemId: 'laveau_gris_gris' },
        { type: 'xp', amount: 350 }
      ],
      consequences: [
        'The curse is lifted',
        'Mama Laveau knows your secrets',
        'You owe her a debt'
      ],
      loreRevealed: [
        'Voodoo curses are real and dangerous',
        'Mama Laveau can break almost any curse',
        'But she always demands truth in payment'
      ],
      moralWeight: 'She will know if you lie. And lying to Mama Laveau is a very bad idea.'
    },
    {
      id: 'laveau_zombie',
      name: 'The Walking Dead',
      description: 'Mama Laveau asks for your help dealing with a zombie - a real one, created by a rival practitioner. "I need someone who won\'t panic," she says. "The dead walk sometimes. That\'s just the way it is."',
      actualObjective: 'Help Mama Laveau put down a zombie',
      objectives: [
        {
          id: 'find_zombie',
          description: 'Track down the walking dead',
          type: 'visit',
          target: 'zombie_location',
          required: 1
        },
        {
          id: 'lay_to_rest',
          description: 'Help put the zombie to rest',
          type: 'combat',
          target: 'zombie',
          required: 1
        }
      ],
      rewards: [
        { type: 'gold', amount: 300 },
        { type: 'item', itemId: 'protection_gris_gris' },
        { type: 'xp', amount: 500 },
        { type: 'reputation', faction: 'FRONTERA', amount: 50 }
      ],
      consequences: [
        'The zombie is laid to rest properly',
        'Mama Laveau respects your courage',
        'You\'ve seen the impossible'
      ],
      loreRevealed: [
        'Zombies are real in this world',
        'Created by voodoo practitioners',
        'Mama Laveau uses her power responsibly - not everyone does'
      ],
      moralWeight: 'The supernatural is real. How does that change your worldview?'
    }
  ],
  dialogue: {
    greeting: [
      '*smiles knowingly* The spirits told me you were coming, cher.',
      'You carry darkness with you. Not evil, just... shadows. Sit. We talk.',
      '*studying you* The Loa have marked you. Whether blessing or curse, time will tell.',
      'Come, child. Mama knows what troubles you.'
    ],
    crypticHints: [
      'The Loa walk these lands. The old spirits and the new.',
      'The Scar? Even the spirits fear it. They won\'t go near.',
      'Death is not the end. I speak with the dead every day.',
      'Three factions fight over land. But the land belongs to older powers.',
      'Someone tries to wake what sleeps. This is foolish. This is death.',
      'The spirits whisper of a great darkness coming. From below.'
    ],
    questDialogue: {
      laveau_spirits: [
        'You want to speak with the dead? This can be done. For a price.',
        'Bring me offerings for the Loa. Rum, cigars, coins. The spirits are not greedy, but they require respect.',
        'When we call, you must be respectful. The dead do not like rudeness.'
      ],
      laveau_curse: [
        'Someone has cursed you, cher. I can feel it.',
        'I can remove it. But you must tell me true - what did you do to earn this curse?',
        'Do not lie to Mama. The spirits tell me everything anyway.'
      ],
      laveau_zombie: [
        'One of my... competitors has raised the dead. This is forbidden.',
        'We must put the poor soul to rest properly.',
        'You will see things tonight. Strange things. Do not be afraid.'
      ]
    },
    farewell: [
      'Go with the Loa\'s blessing, cher.',
      '*presses a gris-gris bag into your hand* For protection.',
      'We will meet again. The spirits say so.',
      'Remember: respect the spirits, and they will respect you.'
    ],
    refusal: [
      'As you wish. But the offer stands, should you change your mind.',
      'The spirits do not force. Neither does Mama.',
      '*shrugs elegantly* Your choice. But you\'ll be back.'
    ],
    information: {
      voodoo: [
        'Voodoo is not evil. It is power. How it is used, that determines good or evil.',
        'I speak with the Loa, the spirits. They guide me.'
      ],
      spirits: [
        'Spirits are everywhere. In the rocks, the trees, the water. The dead walk among us.',
        'Some spirits are kind. Some are not. Treat all with respect.'
      ],
      the_scar: [
        'Even I do not approach The Scar. What dwells there is beyond the Loa.',
        'The spirits fear it. When spirits fear something, wise people fear it too.'
      ],
      death: [
        'Death is a door, not a wall. The dead can return, if called properly.',
        'I have walked in the land of the dead. It is not so different from here.'
      ]
    }
  },
  supernaturalLevel: 'supernatural',
  knowledgeAreas: ['Voodoo Magic', 'Spirit World', 'Death', 'Curses', 'Zombies', 'Loa Spirits', 'Frontera Culture'],
  tradeItems: [
    {
      itemId: 'protection_gris_gris',
      name: 'Protection Gris-Gris',
      description: 'A charm bag filled with herbs and blessed items. Protects against curses.',
      price: 200,
      cursed: false,
      loreText: 'Mama Laveau\'s blessings are powerful'
    },
    {
      itemId: 'spirit_candle',
      name: 'Spirit Candle',
      description: 'Burn this to call upon spirits. Use carefully.',
      price: 100,
      cursed: false
    },
    {
      itemId: 'zombie_powder',
      name: 'Zombie Powder',
      description: 'Mama Laveau refuses to sell this. Some powers are too dangerous.',
      price: undefined,
      cursed: true,
      loreText: 'Not for sale at any price'
    }
  ],
  faction: 'FRONTERA',
  warnings: [
    'Never lie to Mama Laveau',
    'Respect the spirits or face consequences',
    'Voodoo is real and powerful',
    'Some curses cannot be broken'
  ],
  scarConnection: 'Even Mama Laveau, with all her power, fears The Scar. The Loa spirits won\'t go near it, which terrifies her.',
  discoveryMethod: 'Find her through Frontera contacts or at crossroads at night. She finds those who need her.'
};

// ========================================
// FIGURE #7: The Collector
// ========================================
export const THE_COLLECTOR: MysteriousFigure = {
  id: 'the_collector',
  name: 'The Collector',
  title: 'Antiquarian of the Obscure',
  appearance: 'Impeccably dressed gentleman in Victorian attire that never gets dusty. Carries an impossibly large bag that seems to hold more than it should. Wears white gloves. Speaks with cultured accent.',
  role: 'Buys and sells rare, cursed, and magical artifacts. Obsessed with collecting specific items.',
  behavior: 'Polite, charming, obsessive about particular items, will pay any price for what he seeks',
  personality: 'Cultured, obsessive, mysterious, knows more than he reveals, never refuses a deal',
  backstory: 'No one knows where The Collector came from or how old he is. He appears periodically, seeking specific artifacts with single-minded determination. He pays well, never cheats, but the artifacts he collects are usually cursed or dangerous.',
  spawnConditions: {
    locations: ['any'],
    timeOfDay: ['any'],
    randomChance: 0.05,
    playerConditions: ['has_rare_item', 'found_artifact'],
    minLevel: 10,
    questTrigger: 'artifact_discovered'
  },
  quests: [
    {
      id: 'collector_dagger',
      name: 'The Obsidian Dagger',
      description: 'The Collector is seeking an ancient obsidian dagger used in Coalition rituals. He\'s willing to pay handsomely for it. "I simply must have it for my collection," he insists. His eyes gleam with unnatural interest.',
      actualObjective: 'Find the obsidian ritual dagger and deliver it to The Collector',
      objectives: [
        {
          id: 'find_dagger',
          description: 'Find the ancient obsidian dagger',
          type: 'collect',
          target: 'obsidian_dagger',
          required: 1
        },
        {
          id: 'deliver_dagger',
          description: 'Deliver the dagger to The Collector',
          type: 'give_item',
          target: 'collector',
          required: 1
        }
      ],
      rewards: [
        { type: 'gold', amount: 1000 },
        { type: 'item', itemId: 'collectors_token' },
        { type: 'xp', amount: 500 }
      ],
      consequences: [
        'The Collector is pleased and offers future deals',
        'The Coalition shamans sense the dagger is gone and are angry',
        'You wonder what The Collector wants with such items'
      ],
      loreRevealed: [
        'The Collector seeks artifacts related to The Scar',
        'He has been collecting for decades, possibly longer',
        'His collection may be connected to preventing something terrible'
      ],
      moralWeight: 'Stealing sacred artifacts for money. But The Collector\'s motives are unclear.'
    },
    {
      id: 'collector_trade',
      name: 'The Strange Trade',
      description: 'The Collector has an item you need - something that could save lives. But he wants a trade: an item of equal strangeness. "I deal only in the extraordinary," he says.',
      actualObjective: 'Find a strange artifact to trade with The Collector',
      objectives: [
        {
          id: 'find_strange_item',
          description: 'Find an artifact strange enough to interest The Collector',
          type: 'collect',
          target: 'strange_artifact',
          required: 1
        }
      ],
      rewards: [
        { type: 'item', itemId: 'collectors_choice' },
        { type: 'lore', loreId: 'collector_knowledge' },
        { type: 'xp', amount: 400 }
      ],
      consequences: [
        'You receive a powerful item from The Collector',
        'He reveals a small piece of information about his true purpose',
        'You\'re now part of his network of artifact hunters'
      ],
      loreRevealed: [
        'The Collector is trying to gather items that contain or control supernatural power',
        'He may be trying to prevent catastrophe',
        'Or he may be planning something terrible'
      ],
      moralWeight: 'Trading in cursed artifacts. What could go wrong?',
      multipleOutcomes: true
    }
  ],
  dialogue: {
    greeting: [
      '*tips hat politely* Good day. I am The Collector. And you are... interesting.',
      'Ah, perfect timing. I was hoping to run into someone of your... capabilities.',
      '*adjusts white gloves* I have a proposition that may interest you.',
      '*examining you with keen eyes* You carry something unusual. I can sense it.'
    ],
    crypticHints: [
      'The artifacts of this land hold great power. And great danger.',
      'I collect for a purpose. A very important purpose.',
      'The Scar has scattered artifacts throughout this territory. I seek them all.',
      'Some items should not exist. Yet they do. Someone must keep them safe.',
      'My collection is nearly complete. Soon, I will have everything I need.',
      'Do you know what happens when reality breaks? I do. I\'m preventing it.'
    ],
    questDialogue: {
      collector_dagger: [
        'I am seeking an obsidian dagger. Ancient Coalition work. Do you know of it?',
        'I will pay handsomely. Money is no object for items of power.',
        'The dagger contains a fragment of star-stone. I simply must have it.'
      ],
      collector_trade: [
        'I have something you need. And you have something I want.',
        'A fair trade, between collectors. What do you say?',
        'I deal only in the extraordinary. Show me something strange.'
      ]
    },
    farewell: [
      '*tips hat* Until we meet again. And we will meet again.',
      'A pleasure doing business. You know how to contact me.',
      '*picks up his bag, which clinks with a thousand strange objects*',
      'Remember: if you find anything unusual, I\'m interested.'
    ],
    refusal: [
      'A pity. The offer stands, should you reconsider.',
      'I understand. These decisions should not be made lightly.',
      'As you wish. But time is running short, you know.'
    ],
    information: {
      collection: [
        'I collect artifacts of power. Particularly those connected to The Scar.',
        'My collection is the finest in the world. Or the most dangerous. Depending on perspective.'
      ],
      purpose: [
        'Why do I collect? Let\'s just say... insurance.',
        'When reality itself is at stake, one must take precautions.',
        'I am preventing a catastrophe. Or preparing for one. Perhaps both.'
      ],
      artifacts: [
        'Every artifact tells a story. Usually a disturbing one.',
        'The items I seek are not toys. They are fragments of cosmic power.'
      ],
      the_scar: [
        'The Scar is the source of many artifacts. Pieces break off from... below.',
        'I\'ve been collecting Scar-related items for a very long time.',
        'When I have them all, perhaps I can seal what should not be opened.'
      ]
    }
  },
  supernaturalLevel: 'touched',
  knowledgeAreas: ['Artifacts', 'Curses', 'The Scar Items', 'Ancient History', 'Supernatural Objects', 'Cosmic Threats'],
  tradeItems: [
    {
      itemId: 'cursed_coin',
      name: 'Cursed Spanish Doubloon',
      description: 'Always returns to your pocket. Also brings bad luck.',
      price: 500,
      cursed: true,
      loreText: 'Stolen from a Spanish galleon. The crew all died.'
    },
    {
      itemId: 'scar_fragment',
      name: 'Scar Fragment',
      description: 'A piece of strange rock from The Scar. Warm to the touch. Whispers at night.',
      price: 1000,
      cursed: true,
      loreText: 'Contains a fragment of something vast'
    },
    {
      itemId: 'protective_amulet',
      name: 'Protective Amulet',
      description: 'Wards off minor curses and spirits.',
      price: 300,
      cursed: false,
      loreText: 'One of the few non-cursed items The Collector carries'
    }
  ],
  warnings: [
    'Never steal from The Collector - his retribution is subtle but terrible',
    'All his items come with stories. Usually bad ones.',
    'He never lies, but he doesn\'t tell the whole truth'
  ],
  scarConnection: 'The Collector is obsessed with gathering Scar-related artifacts. He may be trying to seal The Scar or prepare for what\'s coming.',
  discoveryMethod: 'Appears when players find rare artifacts or at random in towns'
};

// ========================================
// FIGURE #8: The Burned Man
// ========================================
export const BURNED_MAN: MysteriousFigure = {
  id: 'burned_man',
  name: 'The Burned Man',
  title: 'The Revenant',
  appearance: 'Horribly burned, skin charred and cracked. Should be dead but walks anyway. Face is a blackened skull with burning eyes. Wears the tattered remains of settler clothes. Smells of smoke and char.',
  role: 'Undead revenant seeking revenge on those who burned him alive',
  behavior: 'Single-minded pursuit of justice/vengeance, speaks rarely, relentless',
  personality: 'Focused, grim, powered by pure rage and willpower, surprisingly moral',
  backstory: 'Thomas Ashford was wrongfully accused of a crime he didn\'t commit and burned alive by a mob in 1869. His rage was so great that death couldn\'t take him. Now he walks, hunting those responsible and protecting others from injustice.',
  spawnConditions: {
    locations: [
      '6501a0000000000000000003', // Fort Ashford (named after his family)
      '6501a0000000000000000001', // Red Gulch
      'any_settlement'
    ],
    timeOfDay: ['night'],
    weatherConditions: ['any'],
    randomChance: 0.07,
    playerConditions: ['high_bounty', 'innocent_accused'],
    minLevel: 12
  },
  quests: [
    {
      id: 'burned_man_vengeance',
      name: 'The List',
      description: 'The Burned Man shows you a charred piece of paper with five names. Four are crossed out. One remains. "Help me," he rasps. "Or stay out of my way."',
      actualObjective: 'Help The Burned Man find his final killer or stop his rampage',
      objectives: [
        {
          id: 'find_final_killer',
          description: 'Track down the last man who burned Thomas Ashford',
          type: 'visit',
          target: 'final_killer_location',
          required: 1
        },
        {
          id: 'deliver_justice',
          description: 'Deliver justice (or mercy)',
          type: 'choice',
          target: 'burned_man_finale',
          required: 1
        }
      ],
      rewards: [
        { type: 'xp', amount: 700 },
        { type: 'item', itemId: 'burned_mans_token' },
        { type: 'lore', loreId: 'ashford_tragedy' }
      ],
      consequences: [
        'Help him kill: He finally finds peace and fades',
        'Show mercy: He\'s freed from vengeance, becomes protector instead',
        'Stop him: You must fight an unkillable revenant'
      ],
      loreRevealed: [
        'Thomas Ashford was innocent of the crime he was accused of',
        'He was burned alive by a mob in Red Gulch',
        'His rage kept him from dying',
        'Fort Ashford was built by his brother to honor him'
      ],
      moralWeight: 'Is vengeance justice? The man who burned him is old and regretful now.',
      multipleOutcomes: true
    },
    {
      id: 'burned_man_protection',
      name: 'Burn the Guilty',
      description: 'The Burned Man appears at your camp. He knows you\'re being hunted by men who want you dead for something you didn\'t do. "I know injustice," he rasps. "I will help you."',
      actualObjective: 'Accept The Burned Man\'s protection from false accusers',
      objectives: [
        {
          id: 'accept_help',
          description: 'Accept The Burned Man\'s offer',
          type: 'dialogue',
          target: 'burned_man_alliance',
          required: 1
        }
      ],
      rewards: [
        { type: 'special', specialEffect: 'burned_man_protection' },
        { type: 'xp', amount: 400 }
      ],
      consequences: [
        'Your enemies are found burned to death',
        'Your name is cleared, but people fear you now',
        'The Burned Man owes you nothing more'
      ],
      loreRevealed: [
        'The Burned Man protects the falsely accused',
        'His vengeance is terrible but just',
        'He remembers his own injustice in others\' suffering'
      ],
      moralWeight: 'Is murder acceptable if the victims deserved it?'
    }
  ],
  dialogue: {
    greeting: [
      '*A voice like crackling flames* You... can see me.',
      '*Steps from shadows, reeking of smoke* I am... what injustice makes.',
      '*Burning eyes fix on you* Are you guilty?',
      '*A charred hand extends a list* Five names. One remains.'
    ],
    crypticHints: [
      'I burned. But I did not die. Rage... stronger than death.',
      'The innocent do not fear me. The guilty... should.',
      'I was Thomas Ashford. Once. Before they made me... this.',
      'Justice delayed is not justice denied. I am proof.',
      'The mob took my life. I took theirs. Fair... trade.'
    ],
    questDialogue: {
      burned_man_vengeance: [
        'One man remains. The one who struck the match.',
        'Help me find him. Or do not interfere.',
        'I do not... enjoy this. But I must finish it.'
      ],
      burned_man_protection: [
        'You are... hunted. Falsely accused. I know this pain.',
        'I will protect you. As no one... protected me.',
        'They will burn. Like I burned.'
      ]
    },
    farewell: [
      '*Fades into smoke and shadow*',
      'Remember... Thomas Ashford. Remember injustice.',
      '*A whisper* Thank you. Finally... peace.',
      '*Burns away like paper, leaving only ash*'
    ],
    refusal: [
      'So be it. I walk... alone. As always.',
      'Do not... interfere. This is not your fight.',
      '*Silent, burning stare, then turns away*'
    ],
    information: {
      death: [
        'Death is... relative. I should know.',
        'I am... dead. But also... not. Rage sustains me.'
      ],
      injustice: [
        'They accused me of murder. I was... innocent.',
        'The mob did not care about truth. Only fear.',
        'So I give them... something to truly fear.'
      ],
      revenge: [
        'Call it revenge. Call it justice. Same fire.',
        'I will have satisfaction. Then... perhaps rest.'
      ]
    }
  },
  supernaturalLevel: 'supernatural',
  knowledgeAreas: ['Revenge', 'Injustice', 'Undeath', 'Mob Violence', 'Red Gulch History'],
  warnings: [
    'The Burned Man cannot be killed - he\'s already dead',
    'Do not stand between him and his vengeance',
    'He protects the innocent but destroys the guilty',
    'His touch burns'
  ],
  scarConnection: 'No direct connection to The Scar. The Burned Man is a product of human evil, not cosmic horror.',
  discoveryMethod: 'Appears to the falsely accused or at night in settlements where his killers lived'
};

// ========================================
// FIGURE #9: Sister Agnes
// ========================================
export const SISTER_AGNES: MysteriousFigure = {
  id: 'sister_agnes',
  name: 'Sister Agnes',
  title: 'The Fallen Nun',
  appearance: 'Wears a nun\'s habit, but it\'s stained and torn. Carries a silver crucifix in one hand, a knife in the other. Face is beautiful but eyes are wrong - too bright, too knowing. Speaks in both prayer and profanity.',
  role: 'Hunts demons and evil spirits, but her methods are questionable and her motives unclear',
  behavior: 'Speaks of holy missions, uses violent methods, quotes scripture while killing',
  personality: 'Zealous, possibly mad, genuinely believes she fights evil, morally ambiguous',
  backstory: 'Sister Agnes was a missionary nun who encountered something demonic at The Scar. She fought it and won, but something changed in her. Now she hunts evil with fanatical zeal, but some question whether she serves God or something darker.',
  spawnConditions: {
    locations: [
      '6501a0000000000000000008', // The Scar
      'any_church',
      'sites_of_evil'
    ],
    timeOfDay: ['dusk', 'night'],
    randomChance: 0.06,
    playerConditions: ['demon_encounter', 'cursed'],
    minLevel: 10,
    requiresDiscovery: true
  },
  quests: [
    {
      id: 'agnes_exorcism',
      name: 'The Exorcism',
      description: 'Sister Agnes claims a settler is possessed by a demon. She intends to perform an exorcism. "The devil has many faces," she says, eyes gleaming. "This one must be cast out."',
      actualObjective: 'Assist Sister Agnes with the exorcism or investigate her claims',
      objectives: [
        {
          id: 'investigate_possession',
          description: 'Investigate the alleged possession',
          type: 'visit',
          target: 'possessed_settler',
          required: 1
        },
        {
          id: 'perform_exorcism',
          description: 'Assist with exorcism or stop it',
          type: 'choice',
          target: 'exorcism_choice',
          required: 1
        }
      ],
      rewards: [
        { type: 'xp', amount: 500 },
        { type: 'lore', loreId: 'agnes_truth' },
        { type: 'item', itemId: 'blessed_cross' }
      ],
      consequences: [
        'Help her: The "demon" is cast out, but was the person truly possessed?',
        'Stop her: You discover she might be right about demons',
        'Investigate: The truth is more complicated than either option'
      ],
      loreRevealed: [
        'Sister Agnes has genuine power against evil',
        'But her methods are brutal',
        'She may be possessed herself, or blessed, hard to tell',
        'Something at The Scar changed her fundamentally'
      ],
      moralWeight: 'Does the end justify the means? Is she a holy warrior or a mad zealot?',
      multipleOutcomes: true
    },
    {
      id: 'agnes_forbidden',
      name: 'Forbidden Knowledge',
      description: 'Sister Agnes has a book - the Codex Maleficorum, a tome of demon lore. "I took it from a warlock," she says. "Now I use his weapons against him. Would you learn from the darkness to fight the darkness?"',
      actualObjective: 'Study the forbidden book with Sister Agnes',
      objectives: [
        {
          id: 'study_codex',
          description: 'Study the Codex Maleficorum',
          type: 'study',
          target: 'demon_codex',
          required: 1
        }
      ],
      rewards: [
        { type: 'lore', loreId: 'demon_knowledge' },
        { type: 'special', specialEffect: 'demon_sight' },
        { type: 'xp', amount: 600 }
      ],
      consequences: [
        'You learn to see demons hidden in human form',
        'But the knowledge weighs on your soul',
        'Some things cannot be unlearned'
      ],
      loreRevealed: [
        'Demons are real and walk among humans',
        'The Scar attracts them',
        'Sister Agnes hunts them with forbidden knowledge',
        'She may be damned for her methods, but she saves lives'
      ],
      moralWeight: 'Fighting monsters can make you monstrous. Is it worth it?'
    }
  ],
  dialogue: {
    greeting: [
      '*Crosses herself* The Lord has sent you to me. Or the Devil. We shall see which.',
      'Do you believe in demons? You should. I\'ve killed three this week.',
      '*Clutches crucifix* "Put on the whole armor of God." Ephesians 6:11. Are you armored?',
      'Evil walks this land. I hunt it. Will you help, or hinder?'
    ],
    crypticHints: [
      'The Scar is a gateway. Demons crawl through like maggots from a wound.',
      'I once served God with pure heart. Now... now I serve with bloody hands.',
      'The Church cast me out. Called me mad. But I see what they refuse to see.',
      'Some demons wear human faces so well. But I know them. I always know.',
      'The Devil makes no deals he does not win. Remember that.',
      'They say I fell. Perhaps I did. But I took demons with me.'
    ],
    questDialogue: {
      agnes_exorcism: [
        'This man is possessed. I have seen the signs.',
        'The exorcism will be painful. For him. For me. Perhaps for you.',
        '"And he cast out the demons with a word." Matthew 8:16. I am that word.'
      ],
      agnes_forbidden: [
        'This book contains names and binding spells. Dark knowledge.',
        'I stole it from a warlock before I killed him. Now his weapons are mine.',
        'Would you learn? The knowledge is dangerous. But so is ignorance.'
      ]
    },
    farewell: [
      '*Crosses herself* Go with God. Or don\'t. But go carefully.',
      'The devil is patient. Be more patient still.',
      '*Kisses her crucifix* Until evil rises again. Then I will return.',
      'Remember: "Resist the devil and he will flee." James 4:7. Usually after a fight.'
    ],
    refusal: [
      'Then remain ignorant. Ignorance is a kind of bliss, they say.',
      'Fear is wisdom. Perhaps you are wiser than I.',
      'So be it. I walk this path alone. As I have for years.'
    ],
    information: {
      demons: [
        'Demons are real. I have fought them. Killed them. Been wounded by them.',
        'They hide in human form. But I can see them. God granted me that gift. Or curse.'
      ],
      the_scar: [
        'The Scar is Hell\'s doorway. Or close enough.',
        'Something vast and terrible dwells there. Demon? Worse than demon.',
        'I tried to seal it once. I failed. But I will not stop trying.'
      ],
      faith: [
        'I was devout once. Pure. Then I saw true evil.',
        'Now my faith is... different. Harder. Bloodier. But still faith.',
        'God forgives all sins, they say. I hope so. Mine are numerous.'
      ]
    }
  },
  supernaturalLevel: 'touched',
  knowledgeAreas: ['Demons', 'Exorcism', 'Forbidden Knowledge', 'The Scar\'s Evil', 'Holy Warfare'],
  tradeItems: [
    {
      itemId: 'holy_water',
      name: 'Blessed Holy Water',
      description: 'Burns demons and evil spirits. Also burns the possessed.',
      price: 50,
      cursed: false,
      loreText: 'Sister Agnes blessed it herself'
    },
    {
      itemId: 'silver_crucifix',
      name: 'Silver Crucifix',
      description: 'Protection against demons. If you believe.',
      price: 200,
      cursed: false
    }
  ],
  warnings: [
    'Sister Agnes is dangerous, even to allies',
    'Her exorcisms are violent and sometimes fatal',
    'She sees demons everywhere - some real, some not',
    'Don\'t stand between her and her prey'
  ],
  scarConnection: 'Sister Agnes encountered a demon at The Scar. She defeated it but was forever changed. Now she hunts what crawls from that place.',
  discoveryMethod: 'Find her at churches or encounter her during demon-related events'
};

// ========================================
// FIGURE #10: The Cartographer
// ========================================
export const CARTOGRAPHER: MysteriousFigure = {
  id: 'the_cartographer',
  name: 'The Cartographer',
  title: 'Mapper of Impossible Places',
  appearance: 'Covered in maps - literally. Maps tattooed on skin, maps pinned to clothes, maps rolled in bags. Some maps show normal places. Others show locations that don\'t exist. Or don\'t exist yet. Wild eyes constantly scanning terrain.',
  role: 'Maps locations that don\'t exist, finds hidden places, reveals thin places where reality is weak',
  behavior: 'Draws constantly, talks about geography obsessively, sees dimensions others don\'t',
  personality: 'Obsessive, genius-level spatial intelligence, sees through dimensions, confused by social interaction',
  backstory: 'No one knows the Cartographer\'s real name. He appeared in the territory five years ago, mapping impossible places. His maps are always accurate, even for places that "don\'t exist." Those who follow his maps find locations that shouldn\'t be there - and sometimes can\'t find their way back.',
  spawnConditions: {
    locations: ['any'],
    timeOfDay: ['any'],
    randomChance: 0.08,
    playerConditions: ['exploring', 'lost'],
    minLevel: 8
  },
  quests: [
    {
      id: 'cartographer_thin_places',
      name: 'The Thin Places',
      description: 'The Cartographer hands you a map of locations marked with strange symbols. "These are thin places," he mutters, still drawing. "Reality is weak there. You can see through. Don\'t stay long."',
      actualObjective: 'Visit the thin places marked on the Cartographer\'s map',
      objectives: [
        {
          id: 'visit_thin_places',
          description: 'Visit all five thin places',
          type: 'visit',
          target: 'thin_places',
          required: 5
        }
      ],
      rewards: [
        { type: 'xp', amount: 550 },
        { type: 'lore', loreId: 'thin_places_knowledge' },
        { type: 'special', specialEffect: 'dimensional_awareness' }
      ],
      consequences: [
        'You experience visions at each thin place',
        'Reality feels less stable afterward',
        'You can now sense thin places naturally'
      ],
      loreRevealed: [
        'Reality has weak points in this territory',
        'The Scar is the thinnest place of all',
        'Other dimensions bleed through at thin places',
        'The Cartographer can see into multiple dimensions'
      ],
      moralWeight: 'Some places shouldn\'t be visited. Some doors shouldn\'t be opened.'
    },
    {
      id: 'cartographer_lost_city',
      name: 'The City That Wasn\'t',
      description: 'The Cartographer shows you a detailed map of a city. "It was here," he insists. "Last week it was here. Now it\'s not. But it was. I mapped it. Find it. Prove I\'m not mad."',
      actualObjective: 'Find the disappeared city on the Cartographer\'s map',
      objectives: [
        {
          id: 'locate_city',
          description: 'Find the location where the city should be',
          type: 'visit',
          target: 'impossible_city_location',
          required: 1
        },
        {
          id: 'prove_existence',
          description: 'Find evidence the city existed',
          type: 'collect',
          target: 'city_artifact',
          required: 1
        }
      ],
      rewards: [
        { type: 'xp', amount: 700 },
        { type: 'item', itemId: 'impossible_map' },
        { type: 'lore', loreId: 'dimensional_cities' }
      ],
      consequences: [
        'You find ruins that shouldn\'t exist',
        'The city phases in and out of reality',
        'The Cartographer was right - reality is breaking'
      ],
      loreRevealed: [
        'Places can disappear from reality',
        'The Scar\'s influence is spreading',
        'Geography itself is becoming unstable',
        'The Cartographer maps places across dimensions'
      ],
      moralWeight: 'Reality is more fragile than people realize.',
      multipleOutcomes: true
    }
  ],
  dialogue: {
    greeting: [
      '*Still drawing* Longitude 104.32, Latitude 31.19. No, that\'s wrong. It moved.',
      'Do you see it? The way space bends here? No? Pity.',
      '*Looks up briefly* Oh. A person. Real person? Yes. Real. Hello.',
      'This map is wrong. All maps are wrong. But mine are less wrong.'
    ],
    crypticHints: [
      'The territory is larger on the inside than the outside. Impossible. Yet true.',
      'Some places exist only on Tuesdays. Others never exist but are always there.',
      'The Scar bends space around it. Like a black hole. But not a hole. A wound.',
      'I\'ve mapped seventeen dimensions. This one is the most stable. Barely.',
      'There are cities here that aren\'t here. I\'ve been to three of them.',
      'Geography is a lie. A comforting lie. My maps tell the truth.'
    ],
    questDialogue: {
      cartographer_thin_places: [
        'These five locations. Reality is thin there. You\'ll see.',
        'Don\'t stay too long. Things leak through. Bad things.',
        'If you see the city with backward doors, run. That\'s important. Run.'
      ],
      cartographer_lost_city: [
        'There was a city here! I mapped every street! Now it\'s gone!',
        'Find it. Find proof. I\'m not mad. I\'m not.',
        'It phases. In and out. Like breathing. Reality breathing.'
      ]
    },
    farewell: [
      '*Already drawing again* Goodbye. Or hello. Time is confusing.',
      'Be careful with my maps. They show true things. True things are dangerous.',
      '*Mutters* North is not north. North is... somewhere else.',
      '*Wanders off, measuring angles in the air*'
    ],
    refusal: [
      'You don\'t believe me. No one believes me. The maps don\'t lie though.',
      'Fine. Stay in your three dimensions. See if I care.',
      '*Shrugs and continues drawing*'
    ],
    information: {
      maps: [
        'My maps show what\'s really there. Not what should be there.',
        'I map across dimensions. That\'s why they look wrong to you.'
      ],
      thin_places: [
        'Places where reality is weak. You can see through to other places.',
        'The Scar is the thinnest place. You can see all the way to... below.'
      ],
      the_scar: [
        'The Scar isn\'t a place. It\'s an anti-place. A hole in geography.',
        'I tried to map it. My maps caught fire. All of them. Simultaneously.',
        'Something vast exists there in more dimensions than I can count.'
      ],
      dimensions: [
        'There are at least seventeen dimensions overlapping here.',
        'Most people only see three. Four if you count time. I see more.'
      ]
    }
  },
  supernaturalLevel: 'touched',
  knowledgeAreas: ['Impossible Geography', 'Thin Places', 'Dimensional Rifts', 'The Scar Geometry', 'Hidden Locations'],
  tradeItems: [
    {
      itemId: 'impossible_map',
      name: 'Impossible Map',
      description: 'A map that shows places that don\'t exist. Yet it\'s always accurate.',
      price: 500,
      cursed: false,
      loreText: 'Follow this map at your own risk'
    },
    {
      itemId: 'dimensional_compass',
      name: 'Dimensional Compass',
      description: 'Points to the nearest thin place. Useful or terrifying.',
      price: 400,
      cursed: false
    }
  ],
  warnings: [
    'Following the Cartographer\'s maps can lead to places you can\'t leave',
    'Some of his maps show the future',
    'Don\'t visit thin places during eclipses',
    'If a place doesn\'t feel real, it probably isn\'t'
  ],
  scarConnection: 'The Cartographer is obsessed with mapping The Scar but says it exists in too many dimensions to map fully. He\'s seen what\'s below.',
  discoveryMethod: 'Encounter while exploring or when lost. He finds those who are looking for hidden places.'
};

// ========================================
// EXPORTS
// ========================================

/**
 * All mysterious figures
 */
export const MYSTERIOUS_FIGURES: MysteriousFigure[] = [
  THE_STRANGER,
  OLD_COYOTE,
  MOURNING_WIDOW,
  DOC_PROMETHEUS,
  THE_PROPHET,
  MAMA_LAVEAU,
  THE_COLLECTOR,
  BURNED_MAN,
  SISTER_AGNES,
  CARTOGRAPHER
];

/**
 * Get mysterious figure by ID
 */
export function getMysteriousFigure(id: string): MysteriousFigure | undefined {
  return MYSTERIOUS_FIGURES.find(figure => figure.id === id);
}

/**
 * Get mysterious figures by supernatural level
 */
export function getMysteriousFiguresByLevel(level: SupernaturalLevel): MysteriousFigure[] {
  return MYSTERIOUS_FIGURES.filter(figure => figure.supernaturalLevel === level);
}

/**
 * Get mysterious figures that can spawn at location
 */
export function getMysteriousFiguresByLocation(locationId: string): MysteriousFigure[] {
  return MYSTERIOUS_FIGURES.filter(figure =>
    figure.spawnConditions.locations.includes('any') ||
    figure.spawnConditions.locations.includes(locationId)
  );
}

/**
 * Get mysterious figures connected to The Scar
 */
export function getScarConnectedFigures(): MysteriousFigure[] {
  return MYSTERIOUS_FIGURES.filter(figure => figure.scarConnection);
}
