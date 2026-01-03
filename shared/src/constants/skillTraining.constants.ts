/**
 * Skill Training Activity Constants
 *
 * Defines dedicated training activities for all 26 skills.
 * Each skill has at least one activity that can be performed to gain XP.
 *
 * Design Philosophy:
 * - 20+ activities available at Level 1 (sandbox freedom)
 * - Each activity uses Destiny Deck for resolution
 * - Activities award: Skill XP + Character XP + Gold
 * - Higher risk activities = higher rewards
 */

import { SkillCategory } from '../types/skill.types';

// =============================================================================
// TYPES
// =============================================================================

export interface SkillTrainingActivity {
  /** Unique activity ID */
  id: string;
  /** Display name */
  name: string;
  /** Activity description */
  description: string;
  /** Which skill this trains */
  skillId: string;
  /** Skill category for grouping */
  category: SkillCategory;
  /** Energy cost to perform */
  energyCost: number;
  /** Cooldown in seconds between attempts */
  cooldownSeconds: number;
  /** Minimum skill level required (1 = available immediately) */
  minLevel: number;
  /** Location types where this activity is available */
  locationTypes: string[];
  /** Base skill XP awarded on success */
  baseSkillXP: number;
  /** Base character XP awarded */
  baseCharacterXP: number;
  /** Base gold reward range */
  baseGoldReward: { min: number; max: number };
  /** Risk level affects failure consequences */
  riskLevel: 'safe' | 'low' | 'medium' | 'high';
  /** Special requirements */
  requirements?: {
    /** Requires owning a horse */
    requiresHorse?: boolean;
    /** Requires gang membership */
    requiresGang?: boolean;
    /** Requires specific item in inventory */
    requiresItem?: string;
  };
  /** Flavor text for success */
  successMessages: string[];
  /** Flavor text for failure */
  failureMessages: string[];
  /**
   * PHASE 19: Moral reputation action to trigger on success
   * Uses MoralAction enum values (e.g., 'PATROL_DUTY', 'REPORT_CRIME')
   * Positive actions increase reputation (Lawman path)
   * Negative actions decrease reputation (Outlaw path)
   */
  moralReputationAction?: string;
}

// =============================================================================
// COMBAT SKILL ACTIVITIES (Clubs Suit)
// =============================================================================

export const COMBAT_TRAINING_ACTIVITIES: SkillTrainingActivity[] = [
  // MELEE COMBAT - Brawling
  {
    id: 'brawling',
    name: 'Back Alley Brawling',
    description: 'Test your fists against local toughs in informal fights',
    skillId: 'melee_combat',
    category: SkillCategory.COMBAT,
    energyCost: 10,
    cooldownSeconds: 120,
    minLevel: 1,
    locationTypes: ['saloon', 'tavern', 'outlaw_camp'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 5, max: 15 },
    riskLevel: 'low',
    successMessages: [
      'You land a solid punch and your opponent backs down.',
      'The crowd cheers as you knock your opponent out cold.',
      'Your quick jab ends the fight before it really starts.'
    ],
    failureMessages: [
      'You take a hit to the jaw and see stars.',
      'Your opponent was faster than you expected.',
      'The fight goes badly and you retreat with bruises.'
    ]
  },

  // RANGED COMBAT - Target Practice
  {
    id: 'target_practice',
    name: 'Target Practice',
    description: 'Hone your aim at the local shooting range',
    skillId: 'ranged_combat',
    category: SkillCategory.COMBAT,
    energyCost: 10,
    cooldownSeconds: 120,
    minLevel: 1,
    locationTypes: ['shooting_range', 'fort', 'ranch'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 0, max: 10 },
    riskLevel: 'safe',
    successMessages: [
      'Bullseye! Your shot hits dead center.',
      'You put three rounds through the same hole.',
      'The range master nods approvingly at your grouping.'
    ],
    failureMessages: [
      'Your shots scatter wide of the target.',
      'A jam in your pistol throws off your rhythm.',
      'You hit everything except what you aimed at.'
    ]
  },

  // DEFENSIVE TACTICS - Sparring
  {
    id: 'sparring',
    name: 'Sparring Session',
    description: 'Practice defensive maneuvers with a training partner',
    skillId: 'defensive_tactics',
    category: SkillCategory.COMBAT,
    energyCost: 12,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['saloon', 'fort', 'gang_hideout'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 0, max: 5 },
    riskLevel: 'safe',
    successMessages: [
      'You dodge and weave through every attack.',
      'Your blocks are impenetrable today.',
      'Your partner concedes - you\'re untouchable.'
    ],
    failureMessages: [
      'You take more hits than you block.',
      'Your timing is off and you eat a few punches.',
      'Maybe tomorrow will be a better day for defense.'
    ]
  },

  // MOUNTED COMBAT - Cavalry Drills
  {
    id: 'cavalry_drills',
    name: 'Cavalry Drills',
    description: 'Practice combat maneuvers on horseback',
    skillId: 'mounted_combat',
    category: SkillCategory.COMBAT,
    energyCost: 15,
    cooldownSeconds: 300,
    minLevel: 1,
    locationTypes: ['stable', 'ranch', 'fort'],
    baseSkillXP: 30,
    baseCharacterXP: 20,
    baseGoldReward: { min: 10, max: 25 },
    riskLevel: 'low',
    requirements: {
      requiresHorse: true
    },
    successMessages: [
      'You and your horse move as one deadly unit.',
      'Your saber strikes hit every target at full gallop.',
      'The cavalry instructor salutes your horsemanship.'
    ],
    failureMessages: [
      'Your horse gets spooked and throws off your aim.',
      'You nearly fall off during a sharp turn.',
      'Man and beast are not in sync today.'
    ]
  },

  // EXPLOSIVES - Demolition Work
  {
    id: 'demolition_work',
    name: 'Demolition Work',
    description: 'Help clear rocks and obstacles with controlled explosives',
    skillId: 'explosives',
    category: SkillCategory.COMBAT,
    energyCost: 20,
    cooldownSeconds: 600,
    minLevel: 10,
    locationTypes: ['mine', 'quarry', 'construction'],
    baseSkillXP: 40,
    baseCharacterXP: 30,
    baseGoldReward: { min: 30, max: 60 },
    riskLevel: 'high',
    successMessages: [
      'BOOM! The rocks crumble exactly as planned.',
      'Perfect placement - the foreman is impressed.',
      'You time the fuse perfectly and clear the blockage.'
    ],
    failureMessages: [
      'The blast goes off too early - you dive for cover!',
      'Too much powder - debris flies everywhere.',
      'The dud fizzles out. Waste of good dynamite.'
    ]
  }
];

// =============================================================================
// CUNNING SKILL ACTIVITIES (Spades Suit)
// =============================================================================

export const CUNNING_TRAINING_ACTIVITIES: SkillTrainingActivity[] = [
  // LOCKPICKING - Lock Challenges
  {
    id: 'lock_challenge',
    name: 'Lock Challenge',
    description: 'Practice picking locks on training sets',
    skillId: 'lockpicking',
    category: SkillCategory.CUNNING,
    energyCost: 10,
    cooldownSeconds: 120,
    minLevel: 1,
    locationTypes: ['locksmith', 'thieves_guild', 'outlaw_camp'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 5, max: 15 },
    riskLevel: 'safe',
    successMessages: [
      'Click! The lock springs open smoothly.',
      'Your picks dance through the mechanism.',
      'Even the tricky warded lock yields to your skill.'
    ],
    failureMessages: [
      'Your pick snaps inside the lock.',
      'The pins won\'t cooperate today.',
      'This lock defeats you... for now.'
    ]
  },

  // STEALTH - Sneaking Practice
  {
    id: 'sneaking_practice',
    name: 'Shadow Walking',
    description: 'Practice moving unseen through crowded areas',
    skillId: 'stealth',
    category: SkillCategory.CUNNING,
    energyCost: 10,
    cooldownSeconds: 120,
    minLevel: 1,
    locationTypes: ['town', 'market', 'camp'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 5, max: 15 },
    riskLevel: 'low',
    successMessages: [
      'You slip through the crowd like a ghost.',
      'Nobody notices you pass right by.',
      'You reach the goal completely undetected.'
    ],
    failureMessages: [
      'A dog barks and gives you away.',
      'You step on a creaky board at the worst moment.',
      'Someone spots you and asks what you\'re doing.'
    ]
  },

  // PICKPOCKET - Finger Practice
  {
    id: 'finger_practice',
    name: 'Finger Practice',
    description: 'Practice sleight of hand on mannequins and dummies',
    skillId: 'pickpocket',
    category: SkillCategory.CUNNING,
    energyCost: 10,
    cooldownSeconds: 120,
    minLevel: 1,
    locationTypes: ['thieves_guild', 'outlaw_camp', 'market'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 5, max: 20 },
    riskLevel: 'safe',
    successMessages: [
      'The coin vanishes from the dummy\'s pocket.',
      'Your fingers are quick and sure.',
      'You lift the wallet without triggering the bells.'
    ],
    failureMessages: [
      'The bells on the dummy jingle loudly.',
      'Your fingers fumble the grab.',
      'Too slow - a real mark would have noticed.'
    ]
  },

  // TRACKING - Wildlife Tracking
  {
    id: 'wildlife_tracking',
    name: 'Track Wildlife',
    description: 'Follow animal trails through the wilderness',
    skillId: 'tracking',
    category: SkillCategory.CUNNING,
    energyCost: 12,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['wilderness', 'forest', 'plains', 'mountains'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 10, max: 25 },
    riskLevel: 'low',
    successMessages: [
      'You find fresh tracks and follow them to prey.',
      'The broken twigs tell you exactly where they went.',
      'Your quarry never knew you were following.'
    ],
    failureMessages: [
      'The trail goes cold at a rocky creek.',
      'Rain has washed away the tracks.',
      'You follow the wrong set of prints.'
    ]
  },

  // DECEPTION - Con Games
  {
    id: 'con_games',
    name: 'Run a Con',
    description: 'Practice confidence tricks on willing participants',
    skillId: 'deception',
    category: SkillCategory.CUNNING,
    energyCost: 15,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['saloon', 'market', 'town'],
    baseSkillXP: 30,
    baseCharacterXP: 20,
    baseGoldReward: { min: 15, max: 40 },
    riskLevel: 'medium',
    successMessages: [
      'They never suspected a thing.',
      'Your story is so convincing even you believe it.',
      'The mark thanks you as you walk away with their money.'
    ],
    failureMessages: [
      'They see through your act immediately.',
      'Your story has too many holes.',
      'The mark gets suspicious and walks away.'
    ]
  },

  // GAMBLING - Card Games (already exists in tavern, but adding training version)
  {
    id: 'card_practice',
    name: 'Card Practice',
    description: 'Practice card games against the house',
    skillId: 'gambling',
    category: SkillCategory.CUNNING,
    energyCost: 10,
    cooldownSeconds: 120,
    minLevel: 1,
    locationTypes: ['saloon', 'casino', 'riverboat'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 0, max: 30 },
    riskLevel: 'medium',
    successMessages: [
      'Lady Luck smiles on you today.',
      'You read your opponents perfectly.',
      'A winning hand seals your victory.'
    ],
    failureMessages: [
      'The cards just aren\'t falling your way.',
      'You misread the tells completely.',
      'The house wins this round.'
    ]
  },

  // DUEL INSTINCT - Duel Practice
  {
    id: 'duel_practice',
    name: 'Duel Practice',
    description: 'Spar with practice dueling partners to sharpen your instincts',
    skillId: 'duel_instinct',
    category: SkillCategory.CUNNING,
    energyCost: 15,
    cooldownSeconds: 300,
    minLevel: 5,
    locationTypes: ['dueling_grounds', 'saloon', 'fort'],
    baseSkillXP: 35,
    baseCharacterXP: 25,
    baseGoldReward: { min: 10, max: 30 },
    riskLevel: 'low',
    successMessages: [
      'You read every tell perfectly.',
      'Your stone face gives nothing away.',
      'Your opponent concedes - they can\'t read you at all.'
    ],
    failureMessages: [
      'Your tells were obvious today.',
      'You misread their intentions completely.',
      'Practice makes perfect... eventually.'
    ]
  }
];

// =============================================================================
// SPIRIT SKILL ACTIVITIES (Hearts Suit)
// =============================================================================

export const SPIRIT_TRAINING_ACTIVITIES: SkillTrainingActivity[] = [
  // MEDICINE - Doctoring
  {
    id: 'doctoring',
    name: 'Assist the Doctor',
    description: 'Help treat patients at the local clinic',
    skillId: 'medicine',
    category: SkillCategory.SPIRIT,
    energyCost: 10,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['hospital', 'clinic', 'camp'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 10, max: 25 },
    riskLevel: 'safe',
    successMessages: [
      'The patient recovers thanks to your care.',
      'You stitch the wound perfectly.',
      'The doctor commends your steady hands.'
    ],
    failureMessages: [
      'You mix up the medications.',
      'The patient groans as you fumble the bandage.',
      'Best leave this one to the professionals.'
    ]
  },

  // PERSUASION - Negotiations
  {
    id: 'negotiations',
    name: 'Mediate Disputes',
    description: 'Help settle conflicts between townsfolk',
    skillId: 'persuasion',
    category: SkillCategory.SPIRIT,
    energyCost: 12,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['town_hall', 'saloon', 'church'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 15, max: 35 },
    riskLevel: 'safe',
    successMessages: [
      'Both parties shake hands thanks to your silver tongue.',
      'You find a compromise everyone can live with.',
      'The dispute is settled peacefully.'
    ],
    failureMessages: [
      'Your words fall on deaf ears.',
      'Both sides storm off angrier than before.',
      'Maybe some conflicts can\'t be talked out.'
    ]
  },

  // ANIMAL HANDLING - Train Animals
  {
    id: 'animal_training',
    name: 'Train Animals',
    description: 'Work with horses, dogs, and other animals',
    skillId: 'animal_handling',
    category: SkillCategory.SPIRIT,
    energyCost: 12,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['stable', 'ranch', 'farm'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 10, max: 30 },
    riskLevel: 'low',
    successMessages: [
      'The horse responds perfectly to your commands.',
      'You\'ve earned the animal\'s trust.',
      'The rancher is impressed by your way with animals.'
    ],
    failureMessages: [
      'The horse refuses to cooperate.',
      'The dog won\'t stop barking at you.',
      'Animals can sense your uncertainty.'
    ]
  },

  // LEADERSHIP - Gang Leadership (requires gang)
  {
    id: 'gang_leadership',
    name: 'Lead Gang Activities',
    description: 'Organize and direct your gang members',
    skillId: 'leadership',
    category: SkillCategory.SPIRIT,
    energyCost: 15,
    cooldownSeconds: 600,
    minLevel: 1,
    locationTypes: ['gang_hideout'],
    baseSkillXP: 35,
    baseCharacterXP: 25,
    baseGoldReward: { min: 20, max: 50 },
    riskLevel: 'safe',
    requirements: {
      requiresGang: true
    },
    successMessages: [
      'Your gang executes the plan flawlessly.',
      'The members look up to you with respect.',
      'Under your leadership, morale soars.'
    ],
    failureMessages: [
      'Your orders are ignored.',
      'Infighting breaks out among the members.',
      'Leadership is earned, not demanded.'
    ]
  },

  // RITUAL KNOWLEDGE - Ritual Practice
  {
    id: 'ritual_practice',
    name: 'Study the Old Ways',
    description: 'Learn supernatural rituals at sacred sites',
    skillId: 'ritual_knowledge',
    category: SkillCategory.SPIRIT,
    energyCost: 15,
    cooldownSeconds: 600,
    minLevel: 10,
    locationTypes: ['sacred_site', 'temple', 'graveyard'],
    baseSkillXP: 40,
    baseCharacterXP: 30,
    baseGoldReward: { min: 0, max: 20 },
    riskLevel: 'medium',
    successMessages: [
      'The spirits whisper secrets to you.',
      'You complete the ritual successfully.',
      'Ancient knowledge flows into your mind.'
    ],
    failureMessages: [
      'The spirits are silent today.',
      'Something went wrong with the ritual.',
      'The old ways are not easily learned.'
    ]
  },

  // PERFORMANCE - Entertainment
  {
    id: 'entertainment',
    name: 'Perform for Crowds',
    description: 'Entertain patrons with music, stories, or tricks',
    skillId: 'performance',
    category: SkillCategory.SPIRIT,
    energyCost: 10,
    cooldownSeconds: 120,
    minLevel: 1,
    locationTypes: ['saloon', 'theater', 'town_square'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 10, max: 40 },
    riskLevel: 'safe',
    successMessages: [
      'The crowd erupts in applause!',
      'Tips rain down from appreciative patrons.',
      'You leave them wanting more.'
    ],
    failureMessages: [
      'The crowd loses interest quickly.',
      'Someone throws a rotten tomato.',
      'Tough crowd tonight.'
    ]
  }
];

// =============================================================================
// CRAFT SKILL ACTIVITIES (Diamonds Suit)
// =============================================================================

export const CRAFT_TRAINING_ACTIVITIES: SkillTrainingActivity[] = [
  // BLACKSMITHING - Forge Work
  {
    id: 'forge_work',
    name: 'Work the Forge',
    description: 'Hammer metal into useful shapes at the smithy',
    skillId: 'blacksmithing',
    category: SkillCategory.CRAFT,
    energyCost: 12,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['smithy', 'forge', 'workshop'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 10, max: 25 },
    riskLevel: 'safe',
    successMessages: [
      'The metal bends perfectly to your will.',
      'You forge a fine piece of metalwork.',
      'The smith nods approvingly at your work.'
    ],
    failureMessages: [
      'The metal cools before you finish shaping it.',
      'You hammer it too thin and it cracks.',
      'Back to the scrap pile with this one.'
    ]
  },

  // LEATHERWORKING - Tanning
  {
    id: 'tanning',
    name: 'Tan Hides',
    description: 'Process animal hides into usable leather',
    skillId: 'leatherworking',
    category: SkillCategory.CRAFT,
    energyCost: 12,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['tannery', 'workshop', 'camp'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 10, max: 25 },
    riskLevel: 'safe',
    successMessages: [
      'The leather comes out supple and strong.',
      'You produce a fine piece of tanned hide.',
      'This will make excellent gear.'
    ],
    failureMessages: [
      'The hide is ruined by improper treatment.',
      'You leave it in the solution too long.',
      'The leather comes out stiff and unusable.'
    ]
  },

  // COOKING - Cook Meals
  {
    id: 'cooking',
    name: 'Cook Meals',
    description: 'Prepare food for hungry customers',
    skillId: 'cooking',
    category: SkillCategory.CRAFT,
    energyCost: 10,
    cooldownSeconds: 120,
    minLevel: 1,
    locationTypes: ['kitchen', 'camp', 'saloon'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 10, max: 30 },
    riskLevel: 'safe',
    successMessages: [
      'Mmm! The customers clean their plates.',
      'Your stew is the talk of the town.',
      'Even the picky eater asks for seconds.'
    ],
    failureMessages: [
      'You burn the bottom of the pan.',
      'Too much salt ruins the dish.',
      'The customer pushes the plate away.'
    ]
  },

  // ALCHEMY - Brew Potions (supplements gathering)
  {
    id: 'brew_potions',
    name: 'Brew Potions',
    description: 'Mix herbs and ingredients into useful concoctions',
    skillId: 'alchemy',
    category: SkillCategory.CRAFT,
    energyCost: 12,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['apothecary', 'workshop', 'camp'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 15, max: 35 },
    riskLevel: 'low',
    successMessages: [
      'The potion bubbles with the right color.',
      'You\'ve created a potent mixture.',
      'The apothecary is impressed by your work.'
    ],
    failureMessages: [
      'The mixture explodes in a puff of smoke!',
      'Wrong proportions - it\'s useless.',
      'The brew smells terrible and does nothing.'
    ]
  },

  // ENGINEERING - Tinkering
  {
    id: 'tinkering',
    name: 'Tinker with Machines',
    description: 'Build and repair mechanical devices',
    skillId: 'engineering',
    category: SkillCategory.CRAFT,
    energyCost: 15,
    cooldownSeconds: 300,
    minLevel: 5,
    locationTypes: ['workshop', 'factory', 'mine'],
    baseSkillXP: 30,
    baseCharacterXP: 20,
    baseGoldReward: { min: 20, max: 45 },
    riskLevel: 'low',
    successMessages: [
      'The mechanism clicks into place perfectly.',
      'You repair the broken machine.',
      'Your contraption works exactly as designed.'
    ],
    failureMessages: [
      'Springs and gears fly everywhere.',
      'You can\'t figure out how it goes back together.',
      'The machine is more broken than before.'
    ]
  },

  // MINING - Mine Ore (supplements gathering)
  {
    id: 'mine_ore',
    name: 'Mine Ore',
    description: 'Extract valuable minerals from the earth',
    skillId: 'mining',
    category: SkillCategory.CRAFT,
    energyCost: 12,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['mine', 'quarry', 'cave'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 15, max: 35 },
    riskLevel: 'low',
    successMessages: [
      'You strike a rich vein of ore!',
      'The pickaxe bites deep and true.',
      'A good haul today.'
    ],
    failureMessages: [
      'Nothing but worthless rock.',
      'Your pickaxe breaks on a hard stone.',
      'The vein runs dry.'
    ]
  },

  // CARPENTRY - Woodworking (supplements gathering)
  {
    id: 'woodworking',
    name: 'Woodworking',
    description: 'Craft useful items from lumber',
    skillId: 'carpentry',
    category: SkillCategory.CRAFT,
    energyCost: 12,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['lumber_camp', 'workshop', 'construction'],
    baseSkillXP: 25,
    baseCharacterXP: 15,
    baseGoldReward: { min: 10, max: 30 },
    riskLevel: 'safe',
    successMessages: [
      'The joints fit together perfectly.',
      'You produce a fine piece of woodwork.',
      'Smooth as silk and sturdy as oak.'
    ],
    failureMessages: [
      'The wood splinters under your saw.',
      'The measurements were off.',
      'It\'s too crooked to use.'
    ]
  },

  // GUNSMITHING - Gun Maintenance
  {
    id: 'gun_maintenance',
    name: 'Gun Maintenance',
    description: 'Clean, repair, and modify firearms',
    skillId: 'gunsmithing',
    category: SkillCategory.CRAFT,
    energyCost: 15,
    cooldownSeconds: 300,
    minLevel: 5,
    locationTypes: ['gun_shop', 'workshop', 'fort'],
    baseSkillXP: 30,
    baseCharacterXP: 20,
    baseGoldReward: { min: 20, max: 50 },
    riskLevel: 'low',
    successMessages: [
      'The action is smooth as butter.',
      'You restore the gun to better than new.',
      'The gunsmith is impressed by your work.'
    ],
    failureMessages: [
      'You lose a tiny spring and can\'t find it.',
      'The mechanism jams after reassembly.',
      'Best leave this to a professional.'
    ]
  }
];

// =============================================================================
// LAWMAN TRAINING ACTIVITIES (Moral Reputation Path)
// These activities award positive moral reputation in addition to XP/gold
// Enables Lawman playstyle from Level 1
// =============================================================================

export const LAWMAN_TRAINING_ACTIVITIES: SkillTrainingActivity[] = [
  // PATROL DUTY - Uses tracking skill, awards +3 moral reputation
  {
    id: 'patrol_duty',
    name: 'Patrol Duty',
    description: 'Walk the streets keeping an eye out for trouble',
    skillId: 'tracking',
    category: SkillCategory.CUNNING,
    energyCost: 10,
    cooldownSeconds: 180,
    minLevel: 1,
    locationTypes: ['town', 'settlement', 'fort', 'outpost'],
    baseSkillXP: 20,
    baseCharacterXP: 15,
    baseGoldReward: { min: 5, max: 15 },
    riskLevel: 'safe',
    moralReputationAction: 'PATROL_DUTY',
    successMessages: [
      'Your watchful presence keeps the peace.',
      'Citizens feel safer with you on patrol.',
      'You spot and deter some would-be troublemakers.'
    ],
    failureMessages: [
      'A quiet day - nothing to report.',
      'You walked the beat but found nothing amiss.',
      'The town was peaceful during your watch.'
    ]
  },

  // REPORT CRIME - Uses persuasion skill, awards +2 moral reputation
  {
    id: 'report_crime',
    name: 'Report Suspicious Activity',
    description: 'Inform the sheriff about criminal activity you\'ve witnessed',
    skillId: 'persuasion',
    category: SkillCategory.SPIRIT,
    energyCost: 8,
    cooldownSeconds: 120,
    minLevel: 1,
    locationTypes: ['town', 'settlement', 'fort', 'sheriff_office'],
    baseSkillXP: 15,
    baseCharacterXP: 10,
    baseGoldReward: { min: 5, max: 20 },
    riskLevel: 'safe',
    moralReputationAction: 'REPORT_CRIME',
    successMessages: [
      'The sheriff thanks you for your civic duty.',
      'Your tip leads to an arrest!',
      'The lawmen appreciate your vigilance.'
    ],
    failureMessages: [
      'The sheriff says they\'re already on it.',
      'Your report is noted but nothing comes of it.',
      'Sometimes rumors are just rumors.'
    ]
  },

  // PROTECT CIVILIAN - Uses defensive_tactics, awards +5 moral reputation
  {
    id: 'protect_civilian',
    name: 'Protect the Innocent',
    description: 'Stand up for townsfolk being harassed or threatened',
    skillId: 'defensive_tactics',
    category: SkillCategory.COMBAT,
    energyCost: 12,
    cooldownSeconds: 240,
    minLevel: 1,
    locationTypes: ['town', 'settlement', 'saloon', 'market'],
    baseSkillXP: 25,
    baseCharacterXP: 20,
    baseGoldReward: { min: 10, max: 30 },
    riskLevel: 'low',
    moralReputationAction: 'PROTECT_CIVILIAN',
    successMessages: [
      'The grateful citizen thanks you profusely.',
      'You stand your ground and the bullies back off.',
      'Word spreads of your heroic intervention.'
    ],
    failureMessages: [
      'The situation resolved itself before you could help.',
      'You arrived too late - the threat had passed.',
      'The civilian didn\'t need help after all.'
    ]
  },

  // GUARD DUTY - Uses defensive_tactics, awards +3 moral reputation
  {
    id: 'guard_duty',
    name: 'Guard Duty',
    description: 'Help guard a business or public building',
    skillId: 'defensive_tactics',
    category: SkillCategory.COMBAT,
    energyCost: 12,
    cooldownSeconds: 300,
    minLevel: 1,
    locationTypes: ['town', 'bank', 'fort', 'jail'],
    baseSkillXP: 25,
    baseCharacterXP: 18,
    baseGoldReward: { min: 15, max: 35 },
    riskLevel: 'low',
    moralReputationAction: 'PATROL_DUTY',  // Uses patrol duty action value
    successMessages: [
      'Your vigilance kept the premises secure.',
      'The owner pays you for a job well done.',
      'Nothing got past you on your watch.'
    ],
    failureMessages: [
      'A quiet shift - nothing to guard against.',
      'You stood watch but no trouble came.',
      'The night passed uneventfully.'
    ]
  },

  // FIRST AID STATION - Uses medicine, awards +5 moral reputation
  {
    id: 'first_aid_station',
    name: 'Volunteer Medical Aid',
    description: 'Help treat injured townsfolk at the local clinic',
    skillId: 'medicine',
    category: SkillCategory.SPIRIT,
    energyCost: 12,
    cooldownSeconds: 240,
    minLevel: 1,
    locationTypes: ['clinic', 'hospital', 'church', 'camp'],
    baseSkillXP: 25,
    baseCharacterXP: 20,
    baseGoldReward: { min: 10, max: 25 },
    riskLevel: 'safe',
    moralReputationAction: 'PROTECT_CIVILIAN',  // Helping civilians
    successMessages: [
      'Your care helps the patient recover.',
      'The doctor commends your steady hands.',
      'Another life saved thanks to your help.'
    ],
    failureMessages: [
      'The patient was already on the mend.',
      'No serious injuries today, thankfully.',
      'Your help was appreciated but not needed.'
    ]
  },

  // DEPUTY TRAINING - Uses ranged_combat, awards +3 moral reputation
  {
    id: 'deputy_training',
    name: 'Deputy Training',
    description: 'Practice law enforcement techniques with the sheriff\'s deputies',
    skillId: 'ranged_combat',
    category: SkillCategory.COMBAT,
    energyCost: 15,
    cooldownSeconds: 300,
    minLevel: 1,
    locationTypes: ['sheriff_office', 'fort', 'shooting_range'],
    baseSkillXP: 30,
    baseCharacterXP: 20,
    baseGoldReward: { min: 10, max: 25 },
    riskLevel: 'safe',
    moralReputationAction: 'PATROL_DUTY',
    successMessages: [
      'The deputy says you\'ve got what it takes.',
      'Your aim and judgment impress the lawmen.',
      'You learn valuable peacekeeping techniques.'
    ],
    failureMessages: [
      'The training was harder than you expected.',
      'You\'ll get it next time, deputy says.',
      'Room for improvement, but you\'re learning.'
    ]
  }
];

// =============================================================================
// COMBINED EXPORTS
// =============================================================================

/** All skill training activities */
export const ALL_SKILL_TRAINING_ACTIVITIES: SkillTrainingActivity[] = [
  ...COMBAT_TRAINING_ACTIVITIES,
  ...CUNNING_TRAINING_ACTIVITIES,
  ...SPIRIT_TRAINING_ACTIVITIES,
  ...CRAFT_TRAINING_ACTIVITIES,
  ...LAWMAN_TRAINING_ACTIVITIES
];

/** Get activities available at a given location type */
export function getActivitiesForLocation(locationType: string): SkillTrainingActivity[] {
  return ALL_SKILL_TRAINING_ACTIVITIES.filter(
    activity => activity.locationTypes.includes(locationType)
  );
}

/** Get activities for a specific skill */
export function getActivitiesForSkill(skillId: string): SkillTrainingActivity[] {
  return ALL_SKILL_TRAINING_ACTIVITIES.filter(
    activity => activity.skillId === skillId
  );
}

/** Get activities available at level 1 */
export function getLevel1Activities(): SkillTrainingActivity[] {
  return ALL_SKILL_TRAINING_ACTIVITIES.filter(
    activity => activity.minLevel === 1 && !activity.requirements
  );
}

/** Get activities that award moral reputation */
export function getMoralReputationActivities(): SkillTrainingActivity[] {
  return ALL_SKILL_TRAINING_ACTIVITIES.filter(
    activity => activity.moralReputationAction !== undefined
  );
}

/** Count of activities by category */
export const ACTIVITY_COUNTS = {
  combat: COMBAT_TRAINING_ACTIVITIES.length,
  cunning: CUNNING_TRAINING_ACTIVITIES.length,
  spirit: SPIRIT_TRAINING_ACTIVITIES.length,
  craft: CRAFT_TRAINING_ACTIVITIES.length,
  lawman: LAWMAN_TRAINING_ACTIVITIES.length,
  total: ALL_SKILL_TRAINING_ACTIVITIES.length,
  level1Available: getLevel1Activities().length,
  moralReputationActivities: getMoralReputationActivities().length
};
