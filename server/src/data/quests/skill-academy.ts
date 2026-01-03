/**
 * Skill Academy Tutorial Quests
 *
 * 26 optional tutorial quests - one for each skill.
 * Each quest teaches the basics through hands-on practice and awards a unique item.
 */

import { QuestSeedData } from '../../models/Quest.model';

/**
 * ========================================
 * COMBAT SKILLS (Iron Jack Thornwood)
 * ========================================
 */

export const ACADEMY_MELEE_COMBAT: QuestSeedData = {
  questId: 'academy:melee_combat',
  name: 'Fists of Fury',
  description:
    '"Close combat is about knowing your body," Iron Jack says, cracking his knuckles. "Every punch, every block - your fists are weapons. Let me show you." He gestures toward the training dummies in the combat yard.',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-jack',
      description: 'Meet Iron Jack at the Combat Yard',
      type: 'visit',
      target: 'npc:iron-jack-thornwood',
      required: 1,
    },
    {
      id: 'melee-practice',
      description: 'Practice melee combat basics',
      type: 'skill',
      target: 'skill:melee_combat',
      required: 1,
    },
    {
      id: 'defeat-dummies',
      description: 'Defeat training dummies',
      type: 'kill',
      target: 'npc:training-dummy',
      required: 3,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-brass-knuckles' },
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    '"Combat ain\'t pretty. Combat ain\'t fair. Combat is survival. You ready to learn?"',
  dialogueComplete:
    '"Good. You hit hard and you recover quick. Here - these brass knuckles saw me through the war. Treat them right."',
};

export const ACADEMY_RANGED_COMBAT: QuestSeedData = {
  questId: 'academy:ranged_combat',
  name: 'Dead-Eye Basics',
  description:
    '"A gun is not a toy," Jack says, eyes narrowing. "It\'s not a threat. It\'s an extension of your will. Point, aim, breathe, squeeze. Let me show you at the firing range."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-jack',
      description: 'Meet Iron Jack at the firing range',
      type: 'visit',
      target: 'npc:iron-jack-thornwood',
      required: 1,
    },
    {
      id: 'shooting-practice',
      description: 'Practice shooting at targets',
      type: 'skill',
      target: 'skill:ranged_combat',
      required: 1,
    },
    {
      id: 'hit-targets',
      description: 'Hit the bullseye 5 times',
      type: 'collect',
      target: 'item:bullseye-hit',
      required: 5,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-practice-revolver' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_DEFENSIVE_TACTICS: QuestSeedData = {
  questId: 'academy:defensive_tactics',
  name: 'The Best Defense',
  description:
    '"Every scar on my body is a lesson I learned wrong," Jack admits. "Let me teach you how to avoid collecting your own. We\'ll run the gauntlet - dodge, block, survive."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-jack',
      description: 'Meet Iron Jack at the training gauntlet',
      type: 'visit',
      target: 'npc:iron-jack-thornwood',
      required: 1,
    },
    {
      id: 'dodge-training',
      description: 'Practice defensive maneuvers',
      type: 'skill',
      target: 'skill:defensive_tactics',
      required: 1,
    },
    {
      id: 'survive-gauntlet',
      description: 'Complete the training gauntlet',
      type: 'visit',
      target: 'location:combat-gauntlet',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-padded-vest' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_MOUNTED_COMBAT: QuestSeedData = {
  questId: 'academy:mounted_combat',
  name: 'Saddle Up',
  description:
    '"On a horse, you\'re not just a fighter - you\'re a weapon of war," Jack explains, patting a cavalry horse. "Speed, height, momentum. Learn to use them all. Let\'s hit the horse track."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-jack',
      description: 'Meet Iron Jack at the horse track',
      type: 'visit',
      target: 'npc:iron-jack-thornwood',
      required: 1,
    },
    {
      id: 'mount-practice',
      description: 'Practice mounted combat basics',
      type: 'skill',
      target: 'skill:mounted_combat',
      required: 1,
    },
    {
      id: 'cavalry-charge',
      description: 'Complete a cavalry charge drill',
      type: 'visit',
      target: 'location:horse-track',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 75 },
    { type: 'item', itemId: 'academy-cavalry-spurs' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_EXPLOSIVES: QuestSeedData = {
  questId: 'academy:explosives',
  name: 'Boom Town',
  description:
    '"Dynamite don\'t care about your intentions," Jack says gravely. "One wrong move and you\'re red mist. Respect the boom." He leads you to a safe distance from the demolition range.',
  type: 'side',
  levelRequired: 10,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-jack',
      description: 'Meet Iron Jack at the demolition range',
      type: 'visit',
      target: 'npc:iron-jack-thornwood',
      required: 1,
    },
    {
      id: 'learn-fuses',
      description: 'Learn fuse timing and placement',
      type: 'skill',
      target: 'skill:explosives',
      required: 1,
    },
    {
      id: 'controlled-blast',
      description: 'Execute a controlled demolition',
      type: 'skill',
      target: 'skill:explosives',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 100 },
    { type: 'item', itemId: 'academy-demolition-kit' },
  ],
  repeatable: false,
  isActive: true,
};

/**
 * ========================================
 * CUNNING SKILLS (Silk Viola Marchetti)
 * ========================================
 */

export const ACADEMY_LOCKPICKING: QuestSeedData = {
  questId: 'academy:lockpicking',
  name: 'Open Sesame',
  description:
    '"Every lock has a story to tell," Viola says, her fingers dancing over a row of practice locks. "The question is, can you listen closely enough to hear it?" She slides a set of picks across the table.',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-viola',
      description: 'Meet Viola in the Back Room',
      type: 'visit',
      target: 'npc:silk-viola-marchetti',
      required: 1,
    },
    {
      id: 'practice-lock',
      description: 'Practice on the training locks',
      type: 'skill',
      target: 'skill:lockpicking',
      required: 1,
    },
    {
      id: 'open-locks',
      description: 'Successfully pick 3 practice locks',
      type: 'collect',
      target: 'item:opened-lock',
      required: 3,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-lockpick-set' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_STEALTH: QuestSeedData = {
  questId: 'academy:stealth',
  name: 'Shadow Walk',
  description:
    '"The best thief is the one nobody ever sees," Viola whispers from the shadows. "Light feet, calm breath, and the confidence to walk through walls. Let me teach you to become invisible."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-viola',
      description: 'Find Viola in the shadows',
      type: 'visit',
      target: 'npc:silk-viola-marchetti',
      required: 1,
    },
    {
      id: 'sneak-training',
      description: 'Practice moving silently',
      type: 'skill',
      target: 'skill:stealth',
      required: 1,
    },
    {
      id: 'complete-course',
      description: 'Complete the stealth obstacle course',
      type: 'visit',
      target: 'location:stealth-course',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-soft-boots' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_PICKPOCKET: QuestSeedData = {
  questId: 'academy:pickpocket',
  name: 'Light Fingers',
  description:
    '"Pickpocketing is not theft - it\'s an art," Viola says with a smile. "The mark should thank you for the experience, if they ever notice." She gestures to a row of mannequins with jingling pockets.',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-viola',
      description: 'Meet Viola at the practice area',
      type: 'visit',
      target: 'npc:silk-viola-marchetti',
      required: 1,
    },
    {
      id: 'distraction',
      description: 'Learn the distraction technique',
      type: 'skill',
      target: 'skill:pickpocket',
      required: 1,
    },
    {
      id: 'lift-wallets',
      description: 'Lift 3 practice wallets without ringing the bells',
      type: 'collect',
      target: 'item:practice-wallet',
      required: 3,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-fingerless-gloves' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_TRACKING: QuestSeedData = {
  questId: 'academy:tracking',
  name: 'Follow the Trail',
  description:
    '"Every step leaves a mark. Every breath leaves a clue," Viola says, crouching near faint footprints in the dust. "Learn to see what others ignore."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-viola',
      description: 'Meet Viola outside the Academy',
      type: 'visit',
      target: 'npc:silk-viola-marchetti',
      required: 1,
    },
    {
      id: 'read-tracks',
      description: 'Learn to read tracks and signs',
      type: 'skill',
      target: 'skill:tracking',
      required: 1,
    },
    {
      id: 'find-target',
      description: 'Track and find the hidden training target',
      type: 'visit',
      target: 'npc:hidden-training-target',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-tracking-compass' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_DECEPTION: QuestSeedData = {
  questId: 'academy:deception',
  name: 'Smoke and Mirrors',
  description:
    '"The best lie is one the mark tells themselves," Viola explains. "You just... help them along." She arranges a scenario with a suspicious-looking practice mark.',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-viola',
      description: 'Meet Viola in the Back Room',
      type: 'visit',
      target: 'npc:silk-viola-marchetti',
      required: 1,
    },
    {
      id: 'lying-lesson',
      description: 'Learn the art of misdirection',
      type: 'skill',
      target: 'skill:deception',
      required: 1,
    },
    {
      id: 'fool-mark',
      description: 'Successfully deceive the practice mark',
      type: 'visit',
      target: 'npc:practice-mark',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-disguise-kit' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_GAMBLING: QuestSeedData = {
  questId: 'academy:gambling',
  name: 'Roll the Bones',
  description:
    '"Gambling isn\'t about luck - it\'s about reading people and controlling odds," Viola says, shuffling a deck with practiced ease. "Let me teach you both."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-viola',
      description: 'Meet Viola at the card table',
      type: 'visit',
      target: 'npc:silk-viola-marchetti',
      required: 1,
    },
    {
      id: 'poker-basics',
      description: 'Learn poker fundamentals',
      type: 'skill',
      target: 'skill:gambling',
      required: 1,
    },
    {
      id: 'win-hand',
      description: 'Win a practice hand',
      type: 'gold',
      target: 'any',
      required: 25,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 75 },
    { type: 'item', itemId: 'academy-lucky-dice' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_DUEL_INSTINCT: QuestSeedData = {
  questId: 'academy:duel_instinct',
  name: 'Reading the Room',
  description:
    '"A duel is won or lost before the first shot," Viola says quietly. "The hand twitch, the breathing pattern, the tell in their eyes... Learn to see what others miss."',
  type: 'side',
  levelRequired: 5,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-viola',
      description: 'Meet Viola at the dueling grounds',
      type: 'visit',
      target: 'npc:silk-viola-marchetti',
      required: 1,
    },
    {
      id: 'read-opponent',
      description: 'Learn to read opponent tells',
      type: 'skill',
      target: 'skill:duel_instinct',
      required: 1,
    },
    {
      id: 'practice-standoff',
      description: 'Complete a practice standoff',
      type: 'visit',
      target: 'location:duel-practice',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 75 },
    { type: 'item', itemId: 'academy-dark-glasses' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_SLEIGHT_OF_HAND: QuestSeedData = {
  questId: 'academy:sleight_of_hand',
  name: 'Now You See It',
  description:
    '"The hand is quicker than the eye - but only if the hand knows what it\'s doing," Viola says, making a coin appear and disappear between her fingers.',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-viola',
      description: 'Meet Viola at the card table',
      type: 'visit',
      target: 'npc:silk-viola-marchetti',
      required: 1,
    },
    {
      id: 'card-tricks',
      description: 'Learn basic card manipulation',
      type: 'skill',
      target: 'skill:sleight_of_hand',
      required: 1,
    },
    {
      id: 'palm-ace',
      description: 'Successfully palm the ace 3 times',
      type: 'skill',
      target: 'skill:sleight_of_hand',
      required: 3,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-marked-deck' },
  ],
  repeatable: false,
  isActive: true,
};

/**
 * ========================================
 * SPIRIT SKILLS (Walking Moon)
 * ========================================
 */

export const ACADEMY_MEDICINE: QuestSeedData = {
  questId: 'academy:medicine',
  name: 'Healing Hands',
  description:
    '"The earth provides everything we need to heal," Walking Moon says, kneeling beside a patch of medicinal herbs. "You must learn to see her gifts."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-moon',
      description: 'Meet Walking Moon at the Sacred Circle',
      type: 'visit',
      target: 'npc:walking-moon',
      required: 1,
    },
    {
      id: 'gather-herbs',
      description: 'Gather medicinal herbs',
      type: 'collect',
      target: 'item:medicine-herbs',
      required: 3,
    },
    {
      id: 'create-remedy',
      description: 'Create a healing remedy',
      type: 'skill',
      target: 'skill:medicine',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-medicine-pouch' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_PERSUASION: QuestSeedData = {
  questId: 'academy:persuasion',
  name: 'Silver Tongue',
  description:
    '"True persuasion begins with understanding," Walking Moon explains. "First, listen with your whole heart. Then, speak truth." They gesture to a stubborn-looking practice partner.',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-moon',
      description: 'Meet Walking Moon at the Sacred Circle',
      type: 'visit',
      target: 'npc:walking-moon',
      required: 1,
    },
    {
      id: 'listening',
      description: 'Complete the listening exercise',
      type: 'skill',
      target: 'skill:persuasion',
      required: 1,
    },
    {
      id: 'convince-skeptic',
      description: 'Convince the skeptic',
      type: 'visit',
      target: 'npc:practice-skeptic',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-peace-pipe' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_ANIMAL_HANDLING: QuestSeedData = {
  questId: 'academy:animal_handling',
  name: 'The Beast Whisperer',
  description:
    '"Animals do not speak with words, but their language is just as rich," Walking Moon says, approaching a nervous wild horse. "Open your heart to hear them."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-moon',
      description: 'Meet Walking Moon at the training corral',
      type: 'visit',
      target: 'npc:walking-moon',
      required: 1,
    },
    {
      id: 'calm-horse',
      description: 'Calm the wild horse',
      type: 'skill',
      target: 'skill:animal_handling',
      required: 1,
    },
    {
      id: 'bond-animal',
      description: 'Form a bond with the training animal',
      type: 'visit',
      target: 'npc:wild-training-animal',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-beast-token' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_LEADERSHIP: QuestSeedData = {
  questId: 'academy:leadership',
  name: 'Voice of the People',
  description:
    '"A leader does not demand obedience," Walking Moon says. "A leader inspires it. Show them who you are." A group of uncertain recruits waits nearby.',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-moon',
      description: 'Meet Walking Moon at the gathering area',
      type: 'visit',
      target: 'npc:walking-moon',
      required: 1,
    },
    {
      id: 'leadership-lesson',
      description: 'Learn the principles of leadership',
      type: 'skill',
      target: 'skill:leadership',
      required: 1,
    },
    {
      id: 'lead-group',
      description: 'Successfully lead the practice group',
      type: 'visit',
      target: 'npc:practice-followers',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-chiefs-medallion' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_RITUAL_KNOWLEDGE: QuestSeedData = {
  questId: 'academy:ritual_knowledge',
  name: 'Beyond the Veil',
  description:
    '"The spirit world is not separate from ours," Walking Moon says, their eyes distant. "It is here, always. You must learn to open your eyes." The fire pit flickers with an otherworldly light.',
  type: 'side',
  levelRequired: 10,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-moon',
      description: 'Meet Walking Moon at the Sacred Circle',
      type: 'visit',
      target: 'npc:walking-moon',
      required: 1,
    },
    {
      id: 'prepare-circle',
      description: 'Prepare the sacred circle',
      type: 'skill',
      target: 'skill:ritual_knowledge',
      required: 1,
    },
    {
      id: 'complete-ritual',
      description: 'Complete your first ritual',
      type: 'skill',
      target: 'skill:ritual_knowledge',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 100 },
    { type: 'item', itemId: 'academy-spirit-drum' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_PERFORMANCE: QuestSeedData = {
  questId: 'academy:performance',
  name: 'Stage Presence',
  description:
    '"Every person carries stories inside them," Walking Moon says. "The performer helps those stories take flight." A small crowd of onlookers gathers expectantly.',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-moon',
      description: 'Meet Walking Moon at the performance area',
      type: 'visit',
      target: 'npc:walking-moon',
      required: 1,
    },
    {
      id: 'storytelling',
      description: 'Learn the art of storytelling',
      type: 'skill',
      target: 'skill:performance',
      required: 1,
    },
    {
      id: 'perform',
      description: 'Perform for the practice audience',
      type: 'visit',
      target: 'npc:practice-audience',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-storyteller-blanket' },
  ],
  repeatable: false,
  isActive: true,
};

/**
 * ========================================
 * CRAFT SKILLS (Augustus "Gus" Hornsby)
 * ========================================
 */

export const ACADEMY_BLACKSMITHING: QuestSeedData = {
  questId: 'academy:blacksmithing',
  name: 'Strike While Hot',
  description:
    '"Every great thing starts with knowing your materials," Gus says, the forge roaring behind him. "You want to make miracles? First, learn what iron wants to be."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-gus',
      description: 'Meet Gus at the Workshop forge',
      type: 'visit',
      target: 'npc:augustus-hornsby',
      required: 1,
    },
    {
      id: 'forge-lesson',
      description: 'Learn the basics of metalworking',
      type: 'skill',
      target: 'skill:blacksmithing',
      required: 1,
    },
    {
      id: 'make-horseshoe',
      description: 'Forge your first horseshoe',
      type: 'collect',
      target: 'item:practice-horseshoe',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-smithing-hammer' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_LEATHERWORKING: QuestSeedData = {
  questId: 'academy:leatherworking',
  name: 'Hide and Seek',
  description:
    '"Leather breathes, leather bends, leather protects," Gus explains, handling a supple piece of tanned hide. "Learn to work with it, not against it."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-gus',
      description: 'Meet Gus at the tanning station',
      type: 'visit',
      target: 'npc:augustus-hornsby',
      required: 1,
    },
    {
      id: 'tanning-lesson',
      description: 'Learn basic leatherworking',
      type: 'skill',
      target: 'skill:leatherworking',
      required: 1,
    },
    {
      id: 'make-belt',
      description: 'Craft a practice belt',
      type: 'collect',
      target: 'item:practice-belt',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-leather-toolkit' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_COOKING: QuestSeedData = {
  questId: 'academy:cooking',
  name: 'Fire and Food',
  description:
    '"A hungry man makes bad decisions," Gus says, tending a pot over the fire. "Good food keeps you alive and thinking clear. Let me teach you the basics."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-gus',
      description: 'Meet Gus at the camp kitchen',
      type: 'visit',
      target: 'npc:augustus-hornsby',
      required: 1,
    },
    {
      id: 'cooking-lesson',
      description: 'Learn frontier cooking basics',
      type: 'skill',
      target: 'skill:cooking',
      required: 1,
    },
    {
      id: 'make-stew',
      description: 'Prepare a hearty stew',
      type: 'collect',
      target: 'item:practice-stew',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-cast-iron-skillet' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_ALCHEMY: QuestSeedData = {
  questId: 'academy:alchemy',
  name: 'Mixing Potions',
  description:
    '"Alchemy is science and art combined," Gus says, measuring ingredients carefully. "Get it right, you heal. Get it wrong, you poison."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-gus',
      description: 'Meet Gus at the alchemy station',
      type: 'visit',
      target: 'npc:augustus-hornsby',
      required: 1,
    },
    {
      id: 'alchemy-lesson',
      description: 'Learn basic alchemy principles',
      type: 'skill',
      target: 'skill:alchemy',
      required: 1,
    },
    {
      id: 'brew-tonic',
      description: 'Brew a simple healing tonic',
      type: 'collect',
      target: 'item:practice-tonic',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-alchemy-set' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_ENGINEERING: QuestSeedData = {
  questId: 'academy:engineering',
  name: 'Gears and Gadgets',
  description:
    '"Engineering is making the impossible possible," Gus says, flexing his mechanical hand. "See this? Lost the original to carelessness. Built this one with patience. Which would you prefer to learn from?"',
  type: 'side',
  levelRequired: 5,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-gus',
      description: 'Meet Gus at the engineering bench',
      type: 'visit',
      target: 'npc:augustus-hornsby',
      required: 1,
    },
    {
      id: 'engineering-lesson',
      description: 'Learn mechanical principles',
      type: 'skill',
      target: 'skill:engineering',
      required: 1,
    },
    {
      id: 'build-trap',
      description: 'Build a simple mechanical trap',
      type: 'collect',
      target: 'item:practice-trap',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 75 },
    { type: 'item', itemId: 'academy-engineering-tools' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_MINING: QuestSeedData = {
  questId: 'academy:mining',
  name: 'Strike It Rich',
  description:
    '"The earth hides her treasures, but she leaves clues," Gus says, examining a rock sample. "Learn to read the rock."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-gus',
      description: 'Meet Gus at the practice mine',
      type: 'visit',
      target: 'npc:augustus-hornsby',
      required: 1,
    },
    {
      id: 'prospecting-lesson',
      description: 'Learn prospecting and mining basics',
      type: 'skill',
      target: 'skill:mining',
      required: 1,
    },
    {
      id: 'extract-ore',
      description: 'Extract ore samples',
      type: 'collect',
      target: 'item:practice-ore',
      required: 3,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-mining-pick' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_CARPENTRY: QuestSeedData = {
  questId: 'academy:carpentry',
  name: 'Wood and Nails',
  description:
    '"Wood has grain, has memory, has character," Gus says, running his hand along a plank. "Work with it and it serves forever."',
  type: 'side',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-gus',
      description: 'Meet Gus at the carpentry bench',
      type: 'visit',
      target: 'npc:augustus-hornsby',
      required: 1,
    },
    {
      id: 'woodwork-lesson',
      description: 'Learn basic carpentry',
      type: 'skill',
      target: 'skill:carpentry',
      required: 1,
    },
    {
      id: 'build-box',
      description: 'Build a sturdy storage box',
      type: 'collect',
      target: 'item:practice-box',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'academy-saw-set' },
  ],
  repeatable: false,
  isActive: true,
};

export const ACADEMY_GUNSMITHING: QuestSeedData = {
  questId: 'academy:gunsmithing',
  name: 'Custom Firepower',
  description:
    '"A good gun is reliable. A great gun is custom-fit to its owner," Gus says, disassembling a revolver with practiced ease. "Let me teach you the difference."',
  type: 'side',
  levelRequired: 5,
  prerequisites: [],
  objectives: [
    {
      id: 'talk-gus',
      description: 'Meet Gus at the gunsmithing bench',
      type: 'visit',
      target: 'npc:augustus-hornsby',
      required: 1,
    },
    {
      id: 'gunsmith-lesson',
      description: 'Learn firearm mechanics',
      type: 'skill',
      target: 'skill:gunsmithing',
      required: 1,
    },
    {
      id: 'modify-weapon',
      description: 'Modify a practice weapon',
      type: 'skill',
      target: 'skill:gunsmithing',
      required: 1,
    },
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 75 },
    { type: 'item', itemId: 'academy-gunsmith-toolkit' },
  ],
  repeatable: false,
  isActive: true,
};

/**
 * All Skill Academy Quests
 */
export const SKILL_ACADEMY_QUESTS: QuestSeedData[] = [
  // Combat (Iron Jack)
  ACADEMY_MELEE_COMBAT,
  ACADEMY_RANGED_COMBAT,
  ACADEMY_DEFENSIVE_TACTICS,
  ACADEMY_MOUNTED_COMBAT,
  ACADEMY_EXPLOSIVES,
  // Cunning (Silk Viola)
  ACADEMY_LOCKPICKING,
  ACADEMY_STEALTH,
  ACADEMY_PICKPOCKET,
  ACADEMY_TRACKING,
  ACADEMY_DECEPTION,
  ACADEMY_GAMBLING,
  ACADEMY_DUEL_INSTINCT,
  ACADEMY_SLEIGHT_OF_HAND,
  // Spirit (Walking Moon)
  ACADEMY_MEDICINE,
  ACADEMY_PERSUASION,
  ACADEMY_ANIMAL_HANDLING,
  ACADEMY_LEADERSHIP,
  ACADEMY_RITUAL_KNOWLEDGE,
  ACADEMY_PERFORMANCE,
  // Craft (Gus Hornsby)
  ACADEMY_BLACKSMITHING,
  ACADEMY_LEATHERWORKING,
  ACADEMY_COOKING,
  ACADEMY_ALCHEMY,
  ACADEMY_ENGINEERING,
  ACADEMY_MINING,
  ACADEMY_CARPENTRY,
  ACADEMY_GUNSMITHING,
];

/**
 * Get academy quest by skill ID
 */
export function getAcademyQuestForSkill(skillId: string): QuestSeedData | undefined {
  const questId = `academy:${skillId}`;
  return SKILL_ACADEMY_QUESTS.find((q) => q.questId === questId);
}

/**
 * Get all academy quests for a mentor
 */
export function getAcademyQuestsForMentor(
  mentorId: string
): QuestSeedData[] {
  const mentorQuests: Record<string, string[]> = {
    'iron-jack-thornwood': [
      'academy:melee_combat',
      'academy:ranged_combat',
      'academy:defensive_tactics',
      'academy:mounted_combat',
      'academy:explosives',
    ],
    'silk-viola-marchetti': [
      'academy:lockpicking',
      'academy:stealth',
      'academy:pickpocket',
      'academy:tracking',
      'academy:deception',
      'academy:gambling',
      'academy:duel_instinct',
      'academy:sleight_of_hand',
    ],
    'walking-moon': [
      'academy:medicine',
      'academy:persuasion',
      'academy:animal_handling',
      'academy:leadership',
      'academy:ritual_knowledge',
      'academy:performance',
    ],
    'augustus-hornsby': [
      'academy:blacksmithing',
      'academy:leatherworking',
      'academy:cooking',
      'academy:alchemy',
      'academy:engineering',
      'academy:mining',
      'academy:carpentry',
      'academy:gunsmithing',
    ],
  };

  const questIds = mentorQuests[mentorId] || [];
  return SKILL_ACADEMY_QUESTS.filter((q) => questIds.includes(q.questId));
}
