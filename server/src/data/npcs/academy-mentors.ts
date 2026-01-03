/**
 * Skill Academy Mentor NPCs
 *
 * Four master instructors who teach all 26 skills through tutorial quests.
 * Each mentor specializes in one skill category.
 */

import { LocationNPC } from '@desperados/shared';

/**
 * Combat Master - "Iron" Jack Thornwood
 * Teaches: melee_combat, ranged_combat, defensive_tactics, mounted_combat, explosives
 */
export const IRON_JACK_THORNWOOD: LocationNPC = {
  id: 'iron-jack-thornwood',
  name: '"Iron" Jack Thornwood',
  title: 'Combat Master',
  description:
    'A former Confederate cavalry officer who lost his right eye at the Battle of Glorieta Pass. After 20 years as a mercenary across Mexico, learning combat styles from Aztec warriors to Apache raiders, he now teaches combat as survival philosophy. His body is scarred, but his mind is razor-sharp.',
  personality:
    'Gruff and no-nonsense, but surprisingly philosophical. Respects effort over talent. Has a dry sense of humor about death. Never coddles students but never insults them - failure is just a lesson in disguise.',
  faction: undefined,
  dialogue: [
    // Stranger (0-19)
    "Combat ain't pretty. Combat ain't fair. Combat is survival. You ready to learn?",
    "I've killed men in seven different ways today. All of 'em training dummies.",
    "That stance? Pathetic. Let me show you how it's done.",
    // Acquaintance (20-39)
    "You're starting to move like you mean it. Good. Hesitation gets you killed.",
    "The grim reaper's tried to collect me seventeen times. He's getting tired.",
    "Pain is temporary. Death is forever. Which do you prefer?",
    // Friend (40-59)
    "I lost this eye underestimating an opponent. Lost three friends the same day. Don't repeat my mistakes.",
    "Every scar on my body is a lesson I learned the hard way. I'm trying to spare you the pain.",
    "You fight like someone who wants to live. That's the first step.",
    // Trusted (60-79)
    "There's a technique I learned from an Apache war chief. Most die trying it. But you... you might survive.",
    "I was cavalry. We rode into hell at Glorieta Pass. Only three of us rode out.",
    "I've been watching you. You've got the instinct. Now you need the discipline.",
    // Confidant (80-100)
    "You fight like someone worth dying for. I don't say that lightly.",
    "Take my saber - it's seen me through a hundred battles. It's time for new hands.",
    "If I had a son, I'd want him to fight like you. That's the highest compliment I know.",
  ],
  quests: [
    'academy:melee_combat',
    'academy:ranged_combat',
    'academy:defensive_tactics',
    'academy:mounted_combat',
    'academy:explosives',
  ],
  isVendor: false,
  defaultTrust: 10,
};

/**
 * Cunning Master - "Silk" Viola Marchetti
 * Teaches: lockpicking, stealth, pickpocket, tracking, deception, gambling, duel_instinct, sleight_of_hand
 */
export const SILK_VIOLA_MARCHETTI: LocationNPC = {
  id: 'silk-viola-marchetti',
  name: '"Silk" Viola Marchetti',
  title: 'Cunning Master',
  description:
    "Born to Italian immigrants in San Francisco, Viola was sold into a brothel at 14. By 20, she owned it. By 25, she owned half the city's underworld - through manipulation, not violence. When the earthquake of 1868 destroyed her empire, she headed West to start again. She believes cunning is the great equalizer.",
  personality:
    "Elegant and disarmingly friendly, with a sharp wit that cuts deeper than any knife. Speaks in riddles and half-truths but never lies outright - she just lets people deceive themselves. Has genuine affection for students who show cleverness, but despises laziness.",
  faction: undefined,
  dialogue: [
    // Stranger (0-19)
    'Brute force is for those who lack imagination. Tell me - do you have imagination?',
    'I once stole a fortune while looking the victim in the eye. They thanked me for the conversation.',
    "Every lock tells a story. Every pocket holds a secret. What story will you tell?",
    // Acquaintance (20-39)
    "You're learning to see what others miss. But seeing isn't enough. You must act before they know you've seen.",
    "Deception is an art form. Lies are for amateurs. The truth, properly framed, is far more devastating.",
    'A shadow that moves is a shadow that dies. Learn to be still.',
    // Friend (40-59)
    "I once stole the shirt off a man's back while he was wearing it. He thanked me for the lovely conversation.",
    "The greatest con isn't taking what they have. It's making them give it willingly.",
    "You have potential. Don't waste it on small ambitions.",
    // Trusted (60-79)
    "The greatest con I ever pulled? I made myself disappear from history. There are no records of Viola Marchetti anywhere.",
    "I'm teaching you the same skills that built and destroyed empires. Use them wisely.",
    'Trust is the most valuable currency. Spend it carefully.',
    // Confidant (80-100)
    "I've trusted three people in my life. Two tried to kill me. The third... was worth dying for.",
    "Don't make me regret adding you to that list.",
    "Everything I know is yours now. Make me proud.",
  ],
  quests: [
    'academy:lockpicking',
    'academy:stealth',
    'academy:pickpocket',
    'academy:tracking',
    'academy:deception',
    'academy:gambling',
    'academy:duel_instinct',
    'academy:sleight_of_hand',
  ],
  isVendor: false,
  defaultTrust: 10,
};

/**
 * Spirit Master - Walking Moon (Nahi name: Mani Noka)
 * Teaches: medicine, persuasion, animal_handling, leadership, ritual_knowledge, performance
 */
export const WALKING_MOON: LocationNPC = {
  id: 'walking-moon',
  name: 'Walking Moon',
  title: 'Spirit Master',
  description:
    'A two-spirit medicine person from a now-scattered Plains tribe. Trained from childhood to walk between worlds - both the physical and spiritual, and both genders. When their people were displaced, Walking Moon chose to remain on the land as a guardian of the old knowledge. The Academy is their way of preserving wisdom that would otherwise be lost.',
  personality:
    "Serene but not passive, patient but not weak. Speaks in metaphors and stories but has a surprisingly sharp sense of humor. Takes students' problems seriously but helps them see the bigger picture. Non-judgmental about moral choices but deeply invested in spiritual growth.",
  faction: 'kaiowa',
  dialogue: [
    // Stranger (0-19)
    'The animals know your heart before you speak. The spirits see your truth. Show me who you really are.',
    'You walk with heavy steps. The earth feels your burden. Let me teach you to walk lightly.',
    'Words are wind. Actions are stone. Which will you build with?',
    // Acquaintance (20-39)
    'Your spirit is like a fire still learning to burn. Tend it well, and it will light your path.',
    'The hawk sees the mouse, but also sees the eagle above. Perspective is everything.',
    'You begin to hear the whispers. Good. Now learn to understand them.',
    // Friend (40-59)
    'When my people walked this land, we sang songs to the buffalo. Now I teach strangers their melody. The circle continues.',
    'The spirits speak of you. They are... curious. That is rare.',
    'Pain teaches. Joy teaches. Both are medicine for the soul.',
    // Trusted (60-79)
    'There is a vision I had of you. Fire and water, life and death. You stand at a crossroads that will shape many lives.',
    'My ancestors watch through my eyes. They approve of you.',
    'The old ways are not dead. They sleep, waiting for those who will carry them forward.',
    // Confidant (80-100)
    'You have walked far on the spirit road. Few can see what you now see.',
    'Protect these gifts - they are sacred.',
    'You are now a keeper of the old knowledge. The responsibility is heavy, but so is the honor.',
  ],
  quests: [
    'academy:medicine',
    'academy:persuasion',
    'academy:animal_handling',
    'academy:leadership',
    'academy:ritual_knowledge',
    'academy:performance',
  ],
  isVendor: false,
  defaultTrust: 10,
};

/**
 * Craft Master - Augustus "Gus" Hornsby
 * Teaches: blacksmithing, leatherworking, cooking, alchemy, engineering, mining, carpentry, gunsmithing
 */
export const AUGUSTUS_HORNSBY: LocationNPC = {
  id: 'augustus-hornsby',
  name: 'Augustus "Gus" Hornsby',
  title: 'Craft Master',
  description:
    "A self-taught genius who worked as a blacksmith's apprentice, railroad engineer, and gold mine foreman before arriving in the territory. Gus has an almost supernatural ability to understand how things work and how to make them better. He lost his left hand in a mining accident and built himself a mechanical prosthetic that works almost as well. He believes craft is the foundation of civilization.",
  personality:
    'Enthusiastic and hands-on, prone to going off on tangents about metallurgy or engineering principles. Has no patience for shortcuts or shoddy work but endless patience for honest effort. Talks to his tools. Genuinely excited when students create something good.',
  faction: 'settler',
  dialogue: [
    // Stranger (0-19)
    "Every great thing starts with knowing your materials. You want to make miracles? First, learn what iron wants to be.",
    "See this hand? Lost the original to carelessness. Built this one with patience. Which would you prefer to learn from?",
    "The forge doesn't care about your excuses. Neither do I. But I'll teach you anyway.",
    // Acquaintance (20-39)
    "Not bad! See how the metal tells you when it's ready? It's got a voice if you listen.",
    'Measure twice, cut once. Measure once, curse forever.',
    "You're getting the feel for it. The materials are starting to respect you.",
    // Friend (40-59)
    "I lost this hand being stupid. Built a new one being smart. Failure's the best teacher - if you survive.",
    'Every tool I own has a name. This hammer is Margaret. She was my first.',
    "You've got the maker's instinct. Can't teach that. Can only nurture it.",
    // Trusted (60-79)
    "There's techniques in my head that exist nowhere else. Steam-powered, clockwork, alchemical... I've been saving them for the right student.",
    "The railroad wanted my designs. The military wanted my weapons. I said no to both. Knowledge this powerful needs the right hands.",
    "I see a master craftsman in you. Just need to polish off the rough edges.",
    // Confidant (80-100)
    'Everything I know is yours now. Build something that changes the world.',
    'Make me proud.',
    "When I'm gone, this workshop is yours. Keep the forge lit, keep the craft alive.",
  ],
  quests: [
    'academy:blacksmithing',
    'academy:leatherworking',
    'academy:cooking',
    'academy:alchemy',
    'academy:engineering',
    'academy:mining',
    'academy:carpentry',
    'academy:gunsmithing',
  ],
  isVendor: false,
  defaultTrust: 10,
};

/**
 * All Academy Mentors
 */
export const ACADEMY_MENTORS: LocationNPC[] = [
  IRON_JACK_THORNWOOD,
  SILK_VIOLA_MARCHETTI,
  WALKING_MOON,
  AUGUSTUS_HORNSBY,
];

/**
 * Get mentor by ID
 */
export function getAcademyMentor(mentorId: string): LocationNPC | undefined {
  return ACADEMY_MENTORS.find((m) => m.id === mentorId);
}

/**
 * Get mentor by skill category
 */
export function getMentorByCategory(
  category: 'COMBAT' | 'CUNNING' | 'SPIRIT' | 'CRAFT'
): LocationNPC {
  switch (category) {
    case 'COMBAT':
      return IRON_JACK_THORNWOOD;
    case 'CUNNING':
      return SILK_VIOLA_MARCHETTI;
    case 'SPIRIT':
      return WALKING_MOON;
    case 'CRAFT':
      return AUGUSTUS_HORNSBY;
  }
}
