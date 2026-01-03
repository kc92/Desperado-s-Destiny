/**
 * Skill Academy Constants
 *
 * Constants for the Skill Academy tutorial system that teaches all 26 skills
 * through optional quests delivered by 4 Wild West mentor NPCs.
 */

/**
 * Academy Mentor IDs
 */
export const ACADEMY_MENTORS = {
  COMBAT: 'iron-jack-thornwood',
  CUNNING: 'silk-viola-marchetti',
  SPIRIT: 'walking-moon',
  CRAFT: 'augustus-hornsby',
} as const;

export type AcademyMentorId = (typeof ACADEMY_MENTORS)[keyof typeof ACADEMY_MENTORS];

/**
 * Skill category to mentor mapping
 */
export const SKILL_CATEGORY_MENTORS: Record<string, AcademyMentorId> = {
  COMBAT: ACADEMY_MENTORS.COMBAT,
  CUNNING: ACADEMY_MENTORS.CUNNING,
  SPIRIT: ACADEMY_MENTORS.SPIRIT,
  CRAFT: ACADEMY_MENTORS.CRAFT,
};

/**
 * Skills taught by each mentor
 */
export const MENTOR_SKILLS: Record<AcademyMentorId, string[]> = {
  [ACADEMY_MENTORS.COMBAT]: [
    'melee_combat',
    'ranged_combat',
    'defensive_tactics',
    'mounted_combat',
    'explosives',
  ],
  [ACADEMY_MENTORS.CUNNING]: [
    'lockpicking',
    'stealth',
    'pickpocket',
    'tracking',
    'deception',
    'gambling',
    'duel_instinct',
    'sleight_of_hand',
  ],
  [ACADEMY_MENTORS.SPIRIT]: [
    'medicine',
    'persuasion',
    'animal_handling',
    'leadership',
    'ritual_knowledge',
    'performance',
  ],
  [ACADEMY_MENTORS.CRAFT]: [
    'blacksmithing',
    'leatherworking',
    'cooking',
    'alchemy',
    'engineering',
    'mining',
    'carpentry',
    'gunsmithing',
  ],
};

/**
 * Get mentor for a skill
 */
export function getMentorForSkill(skillId: string): AcademyMentorId | null {
  for (const [mentorId, skills] of Object.entries(MENTOR_SKILLS)) {
    if (skills.includes(skillId)) {
      return mentorId as AcademyMentorId;
    }
  }
  return null;
}

/**
 * Level requirements for skill tutorial quests
 * Most are available at L1, some require higher levels
 */
export const SKILL_TUTORIAL_LEVEL_REQUIREMENTS: Record<string, number> = {
  // Combat (all L1 except explosives)
  melee_combat: 1,
  ranged_combat: 1,
  defensive_tactics: 1,
  mounted_combat: 1,
  explosives: 10,

  // Cunning (all L1 except duel_instinct)
  lockpicking: 1,
  stealth: 1,
  pickpocket: 1,
  tracking: 1,
  deception: 1,
  gambling: 1,
  duel_instinct: 5,
  sleight_of_hand: 1,

  // Spirit (all L1 except ritual_knowledge)
  medicine: 1,
  persuasion: 1,
  animal_handling: 1,
  leadership: 1,
  ritual_knowledge: 10,
  performance: 1,

  // Craft (all L1 except engineering and gunsmithing)
  blacksmithing: 1,
  leatherworking: 1,
  cooking: 1,
  alchemy: 1,
  engineering: 5,
  mining: 1,
  carpentry: 1,
  gunsmithing: 5,
};

/**
 * Academy quest ID prefix
 */
export const ACADEMY_QUEST_PREFIX = 'academy:';

/**
 * Academy reward item prefix
 */
export const ACADEMY_ITEM_PREFIX = 'academy-';

/**
 * Academy location ID
 */
export const ACADEMY_LOCATION_ID = 'desperados-academy';

/**
 * Academy building configuration
 */
export const ACADEMY_CONFIG = {
  locationId: ACADEMY_LOCATION_ID,
  name: 'Desperados Academy',
  region: 'town' as const,
  tier: 3 as const,
  operatingHours: {
    open: 6,
    close: 22,
  },
  minTotalLevel: 26, // All players qualify from start
};

/**
 * Academy tutorial quest rewards (base values)
 */
export const ACADEMY_QUEST_REWARDS = {
  skillXp: 100,
  goldBase: 50,
  goldHighLevel: 100, // For L5+ and L10+ quests
};

/**
 * Mentor display names
 */
export const MENTOR_DISPLAY_NAMES: Record<AcademyMentorId, string> = {
  [ACADEMY_MENTORS.COMBAT]: '"Iron" Jack Thornwood',
  [ACADEMY_MENTORS.CUNNING]: '"Silk" Viola Marchetti',
  [ACADEMY_MENTORS.SPIRIT]: 'Walking Moon',
  [ACADEMY_MENTORS.CRAFT]: 'Augustus "Gus" Hornsby',
};

/**
 * Mentor titles
 */
export const MENTOR_TITLES: Record<AcademyMentorId, string> = {
  [ACADEMY_MENTORS.COMBAT]: 'Combat Master',
  [ACADEMY_MENTORS.CUNNING]: 'Cunning Master',
  [ACADEMY_MENTORS.SPIRIT]: 'Spirit Master',
  [ACADEMY_MENTORS.CRAFT]: 'Craft Master',
};

/**
 * Skill tutorial quest names
 */
export const SKILL_QUEST_NAMES: Record<string, string> = {
  // Combat
  melee_combat: 'Fists of Fury',
  ranged_combat: 'Dead-Eye Basics',
  defensive_tactics: 'The Best Defense',
  mounted_combat: 'Saddle Up',
  explosives: 'Boom Town',

  // Cunning
  lockpicking: 'Open Sesame',
  stealth: 'Shadow Walk',
  pickpocket: 'Light Fingers',
  tracking: 'Follow the Trail',
  deception: 'Smoke and Mirrors',
  gambling: 'Roll the Bones',
  duel_instinct: 'Reading the Room',
  sleight_of_hand: 'Now You See It',

  // Spirit
  medicine: 'Healing Hands',
  persuasion: 'Silver Tongue',
  animal_handling: 'The Beast Whisperer',
  leadership: 'Voice of the People',
  ritual_knowledge: 'Beyond the Veil',
  performance: 'Stage Presence',

  // Craft
  blacksmithing: 'Strike While Hot',
  leatherworking: 'Hide and Seek',
  cooking: 'Fire and Food',
  alchemy: 'Mixing Potions',
  engineering: 'Gears and Gadgets',
  mining: 'Strike It Rich',
  carpentry: 'Wood and Nails',
  gunsmithing: 'Custom Firepower',
};

/**
 * Academy reward item IDs for each skill
 */
export const SKILL_REWARD_ITEMS: Record<string, string> = {
  // Combat
  melee_combat: 'academy-brass-knuckles',
  ranged_combat: 'academy-practice-revolver',
  defensive_tactics: 'academy-padded-vest',
  mounted_combat: 'academy-cavalry-spurs',
  explosives: 'academy-demolition-kit',

  // Cunning
  lockpicking: 'academy-lockpick-set',
  stealth: 'academy-soft-boots',
  pickpocket: 'academy-fingerless-gloves',
  tracking: 'academy-tracking-compass',
  deception: 'academy-disguise-kit',
  gambling: 'academy-lucky-dice',
  duel_instinct: 'academy-dark-glasses',
  sleight_of_hand: 'academy-marked-deck',

  // Spirit
  medicine: 'academy-medicine-pouch',
  persuasion: 'academy-peace-pipe',
  animal_handling: 'academy-beast-token',
  leadership: 'academy-chiefs-medallion',
  ritual_knowledge: 'academy-spirit-drum',
  performance: 'academy-storyteller-blanket',

  // Craft
  blacksmithing: 'academy-smithing-hammer',
  leatherworking: 'academy-leather-toolkit',
  cooking: 'academy-cast-iron-skillet',
  alchemy: 'academy-alchemy-set',
  engineering: 'academy-engineering-tools',
  mining: 'academy-mining-pick',
  carpentry: 'academy-saw-set',
  gunsmithing: 'academy-gunsmith-toolkit',
};
