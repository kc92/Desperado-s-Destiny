/**
 * Newcomer's Trail - Main Storyline (L1-10)
 * Sprint 6: AAA Quality Introduction Questline
 *
 * A 10-quest main storyline that:
 * - Introduces all three factions (Settler Alliance, Nahi Coalition, Frontera)
 * - Teaches core game mechanics naturally through gameplay
 * - Culminates in an informed faction choice at Level 10
 * - Each quest ~15-20 minutes, taking player from L1 to L10
 */

import { QuestSeedData } from '../../models/Quest.model';

// ============================================================================
// QUEST 1: ARRIVAL IN RED GULCH (Level 1)
// The player arrives and learns basic combat
// ============================================================================

export const QUEST_1_ARRIVAL: QuestSeedData = {
  questId: 'newcomers-trail:01-arrival',
  name: 'Arrival in Red Gulch',
  description: `The stagecoach pulls into Red Gulch just as the sun begins to set. You're a stranger here, with nothing but the clothes on your back and a handful of coins. Before you can even dust yourself off, gunshots ring out - bandits are attacking the stagecoach station. Time to prove you're not just another tenderfoot.`,
  type: 'main',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'defend-stagecoach',
      description: 'Help defend the stagecoach station from bandits',
      type: 'kill',
      target: 'npc:tutorial-bandit',
      required: 3
    },
    {
      id: 'meet-sheriff',
      description: 'Speak with Sheriff Clay Thornton',
      type: 'visit',
      target: 'npc:sheriff-clay-thornton',
      required: 1
    },
    {
      id: 'collect-reward',
      description: 'Collect your reward from the Stagecoach Company',
      type: 'visit',
      target: 'location:stagecoach-office',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 },
    { type: 'item', itemId: 'worn-revolver' },
    { type: 'item', itemId: 'travelers-coffee' } // Energy restore for new players!
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro: `Sheriff Clay Thornton tips his hat as you holster your weapon. "Not bad, stranger. Not bad at all. Most folks who come off that stagecoach can barely hold a gun, let alone use one. You got skills. The territory's changing - railroad's coming, old ways dying. Three groups are vying for control of this land. Might want to learn about 'em before you pick a side. Or a bullet picks it for you."`,
  dialogueComplete: `"Here's your first honest pay in the territory. Don't spend it all on whiskey - though I wouldn't blame you if you did. Come see me when you're ready to learn more about how things work around here."`
};

// ============================================================================
// QUEST 2: THE THREE ROADS (Level 2)
// Introduction to all three factions
// ============================================================================

export const QUEST_2_THREE_ROADS: QuestSeedData = {
  questId: 'newcomers-trail:02-three-roads',
  name: 'The Three Roads',
  description: `Sheriff Thornton has arranged introductions with representatives from the three major powers in the territory. Each has their own vision for the frontier's future. Visit them all, listen to what they have to say, and start forming your own opinions.`,
  type: 'main',
  levelRequired: 2,
  prerequisites: ['newcomers-trail:01-arrival'],
  objectives: [
    {
      id: 'meet-settlers',
      description: 'Meet Mayor Edmund Whitmore at the Settler Alliance Town Hall',
      type: 'visit',
      target: 'npc:mayor-whitmore',
      required: 1
    },
    {
      id: 'meet-coalition',
      description: 'Meet Running Fox at the Nahi Coalition Camp',
      type: 'visit',
      target: 'npc:running-fox',
      required: 1
    },
    {
      id: 'meet-frontera',
      description: 'Meet Don Esteban at The Frontera cantina',
      type: 'visit',
      target: 'npc:don-esteban',
      required: 1
    },
    {
      id: 'return-sheriff',
      description: 'Report back to Sheriff Thornton',
      type: 'visit',
      target: 'npc:sheriff-clay-thornton',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 150 },
    { type: 'dollars', amount: 75 },
    { type: 'item', itemId: 'faction-introduction-notes' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro: `Mayor Whitmore speaks of progress, industry, and manifest destiny. Running Fox speaks of sacred land, ancient traditions, and the balance that must be preserved. Don Esteban speaks of power, opportunity, and those clever enough to seize it. Three very different visions. Three very different paths.`,
  dialogueComplete: `Sheriff Thornton listens to your report. "Good. You've met the players. Now you need to understand how they play. Each faction has work that needs doing. Help them out, see their methods, learn their secrets. Then you can make an informed choice about your future."`
};

// ============================================================================
// QUEST 3: SETTLER WAYS (Level 3)
// Experience the Settler Alliance philosophy
// ============================================================================

export const QUEST_3_SETTLER_WAYS: QuestSeedData = {
  questId: 'newcomers-trail:03-settler-ways',
  name: 'Settler Ways',
  description: `Mayor Whitmore has asked for your help with a "small matter" - claim jumpers are harassing honest settlers trying to build their homesteads. Help protect the settlers and see firsthand how the Alliance operates.`,
  type: 'main',
  levelRequired: 3,
  prerequisites: ['newcomers-trail:02-three-roads'],
  objectives: [
    {
      id: 'visit-homestead',
      description: 'Visit the Patterson Homestead',
      type: 'visit',
      target: 'location:patterson-homestead',
      required: 1
    },
    {
      id: 'help-fortify',
      description: 'Help the settlers build defensive barriers',
      type: 'skill',
      target: 'skill:craft',
      required: 1
    },
    {
      id: 'confront-jumpers',
      description: 'Confront the claim jumpers',
      type: 'visit',
      target: 'npc:claim-jumper-boss',
      required: 1
    },
    {
      id: 'resolve-conflict',
      description: 'Resolve the conflict (combat or diplomacy)',
      type: 'kill',
      target: 'npc:claim-jumper',
      required: 2
    }
  ],
  rewards: [
    { type: 'xp', amount: 200 },
    { type: 'dollars', amount: 100 },
    { type: 'reputation', faction: 'settler', amount: 20 },
    { type: 'item', itemId: 'lockpick-set' } // Unlocks lockpicking skill
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro: `The Pattersons are good, hardworking folk. Built their cabin with their own hands, plowed their own fields. Now some thugs think they can just take it because they have guns. That's not how civilization works. We protect our own.`,
  dialogueComplete: `"You handled that well. The Settler Alliance stands for law, order, and the right of honest folks to build a life. We're bringing civilization to the wilderness. Some call it progress. Some call it conquest. We call it destiny."`
};

// ============================================================================
// QUEST 4: THE OLD WAYS (Level 4)
// Experience the Nahi Coalition philosophy
// ============================================================================

export const QUEST_4_OLD_WAYS: QuestSeedData = {
  questId: 'newcomers-trail:04-old-ways',
  name: 'The Old Ways',
  description: `Running Fox has a request - a sacred animal, a white-tailed deer of unusual size, has been spotted near Spirit Springs. The Coalition needs it tracked and blessed, not killed. Meanwhile, a mining company is dangerously close to desecrating sacred ground.`,
  type: 'main',
  levelRequired: 4,
  prerequisites: ['newcomers-trail:03-settler-ways'],
  objectives: [
    {
      id: 'track-deer',
      description: 'Track the sacred white-tailed deer',
      type: 'skill',
      target: 'skill:hunting',
      required: 1
    },
    {
      id: 'observe-blessing',
      description: 'Observe the blessing ceremony (do not interfere)',
      type: 'visit',
      target: 'location:spirit-springs',
      required: 1
    },
    {
      id: 'gather-herbs',
      description: 'Gather ceremonial herbs for the shaman',
      type: 'collect',
      target: 'item:sacred-herbs',
      required: 5
    },
    {
      id: 'confront-miners',
      description: 'Confront the mining company representatives',
      type: 'visit',
      target: 'npc:mining-foreman',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 200 },
    { type: 'dollars', amount: 100 },
    { type: 'reputation', faction: 'nahi', amount: 20 },
    { type: 'item', itemId: 'tracking-charm' } // Unlocks hunting skill bonus
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro: `Running Fox speaks softly but with iron conviction. "The land is not ours to own. We are its guardians. Our ancestors walked these paths for a thousand generations. The deer knows this. The river knows this. Only the newcomers have forgotten."`,
  dialogueComplete: `"You showed respect today. That is rare among outsiders. The Coalition does not seek war, but we will not surrender our sacred places. The land has memory. It will remember what you choose."`
};

// ============================================================================
// QUEST 5: BLOOD AND GOLD (Level 5)
// Experience the Frontera philosophy
// ============================================================================

export const QUEST_5_BLOOD_GOLD: QuestSeedData = {
  questId: 'newcomers-trail:05-blood-gold',
  name: 'Blood and Gold',
  description: `Don Esteban has a job for you - a smuggling run across the border, a debtor who needs convincing, and lawmen who need avoiding. Welcome to how things really work in the frontier.`,
  type: 'main',
  levelRequired: 5,
  prerequisites: ['newcomers-trail:04-old-ways'],
  objectives: [
    {
      id: 'smuggling-run',
      description: 'Complete a smuggling run from The Frontera to Red Gulch',
      type: 'crime',
      target: 'crime:smuggling',
      required: 1
    },
    {
      id: 'collect-debt',
      description: 'Convince "Lucky" Pete to pay his debts',
      type: 'visit',
      target: 'npc:lucky-pete',
      required: 1
    },
    {
      id: 'avoid-lawmen',
      description: 'Complete the run without alerting lawmen',
      type: 'skill',
      target: 'skill:cunning',
      required: 1
    },
    {
      id: 'return-don',
      description: 'Return to Don Esteban with the proceeds',
      type: 'deliver',
      target: 'npc:don-esteban',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 200 },
    { type: 'dollars', amount: 150 },
    { type: 'reputation', faction: 'frontera', amount: 20 },
    { type: 'item', itemId: 'marked-cards' } // Unlocks card counting skill
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro: `Don Esteban pours two glasses of tequila. "In this territory, there are those who make the rules and those who follow them. The smart ones? They learn which rules can be bent, which can be broken, and which will break you. Power respects only power. Gold opens any door. Blood seals any deal."`,
  dialogueComplete: `"You have potential, amigo. The Frontera is not just a faction - it is a family. We take care of our own. Cross us, and you will find that family has long arms and longer memories. But serve us well, and the territory is yours to take."`
};

// ============================================================================
// QUEST 6: THE CROSSROADS (Level 6)
// Witness faction conflict firsthand
// ============================================================================

export const QUEST_6_CROSSROADS: QuestSeedData = {
  questId: 'newcomers-trail:06-crossroads',
  name: 'The Crossroads',
  description: `All three factions have gathered at Dusty Springs for a water rights dispute. The Sheriff has asked you to observe and keep the peace. But each faction has privately asked you to gather intelligence on the others. What you see here will reveal the true nature of each group.`,
  type: 'main',
  levelRequired: 6,
  prerequisites: ['newcomers-trail:05-blood-gold'],
  objectives: [
    {
      id: 'attend-meeting',
      description: 'Attend the Water Rights Council meeting',
      type: 'visit',
      target: 'location:dusty-springs-council',
      required: 1
    },
    {
      id: 'observe-settlers',
      description: 'Observe the Settler Alliance delegation',
      type: 'skill',
      target: 'skill:cunning',
      required: 1
    },
    {
      id: 'observe-coalition',
      description: 'Observe the Nahi Coalition delegation',
      type: 'skill',
      target: 'skill:spirit',
      required: 1
    },
    {
      id: 'observe-frontera',
      description: 'Observe the Frontera delegation',
      type: 'skill',
      target: 'skill:cunning',
      required: 1
    },
    {
      id: 'prevent-violence',
      description: 'Prevent the meeting from escalating to violence',
      type: 'skill',
      target: 'skill:combat',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 250 },
    { type: 'dollars', amount: 150 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro: `The tension is thick enough to cut with a knife. Mayor Whitmore demands "civilized" water management. Running Fox insists on traditional rights. Don Esteban suggests a "business arrangement" with implied threats. Each faction has asked you to spy on the others. What you learn here will shape your understanding of who these people really are.`,
  dialogueComplete: `The meeting ends without bloodshed - barely. But you've seen the truth beneath the diplomatic smiles. Each faction believes they are right. Each faction believes they deserve to control the territory's future. And each faction has shown you their darker side.`
};

// ============================================================================
// QUEST 7: DIRTY SECRETS (Level 7)
// Discover the dark side of each faction
// ============================================================================

export const QUEST_7_DIRTY_SECRETS: QuestSeedData = {
  questId: 'newcomers-trail:07-dirty-secrets',
  name: 'Dirty Secrets',
  description: `After the council meeting, an anonymous source has offered to show you the truth about each faction - the secrets they don't want newcomers to see. Follow the trail and discover what lies beneath the surface of the Settler Alliance, the Nahi Coalition, and the Frontera.`,
  type: 'main',
  levelRequired: 7,
  prerequisites: ['newcomers-trail:06-crossroads'],
  objectives: [
    {
      id: 'settler-secret',
      description: 'Investigate the Settler Alliance displacement camps',
      type: 'visit',
      target: 'location:settler-displacement-camp',
      required: 1
    },
    {
      id: 'coalition-secret',
      description: 'Discover the Coalition\'s warrior society initiation',
      type: 'visit',
      target: 'location:warrior-society-grounds',
      required: 1
    },
    {
      id: 'frontera-secret',
      description: 'Witness the Frontera\'s protection racket in action',
      type: 'visit',
      target: 'location:frontera-collection',
      required: 1
    },
    {
      id: 'meet-informant',
      description: 'Meet your anonymous informant',
      type: 'visit',
      target: 'npc:mysterious-informant',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 250 },
    { type: 'dollars', amount: 150 },
    { type: 'item', itemId: 'territory-journal' } // Contains faction notes
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro: `The truth is never pretty. The Settlers are driving native families from their homes. The Coalition's warrior society demands blood oaths and has radical elements. The Frontera runs protection rackets that crush small businesses. No faction is purely good. No faction is purely evil. They are all human - with human ambitions and human failings.`,
  dialogueComplete: `Your mysterious informant reveals themselves: an old timer who has seen this cycle play out before. "Every generation thinks they're different. They're not. Power corrupts. Ideals compromise. Dreams die. But you still have to choose a side. Just go in with your eyes open."`
};

// ============================================================================
// QUEST 8: THE GANG'S ALL HERE (Level 8)
// Introduction to gang system
// ============================================================================

export const QUEST_8_GANGS_ALL_HERE: QuestSeedData = {
  questId: 'newcomers-trail:08-gangs-all-here',
  name: 'The Gang\'s All Here',
  description: `A mysterious gang called the "Tutorial Outlaws" has invited you to join their ranks. It's a perfect opportunity to learn how gangs work in the territory - territory control, raids, and the bonds between outlaws. You'll leave automatically at Level 10, but the lessons will stay with you.`,
  type: 'main',
  levelRequired: 8,
  prerequisites: ['newcomers-trail:07-dirty-secrets'],
  objectives: [
    {
      id: 'meet-gang',
      description: 'Meet the Tutorial Outlaws at their hideout',
      type: 'visit',
      target: 'location:tutorial-gang-hideout',
      required: 1
    },
    {
      id: 'join-gang',
      description: 'Accept membership in the Tutorial Outlaws',
      type: 'skill',
      target: 'gang:join',
      required: 1
    },
    {
      id: 'territory-defense',
      description: 'Participate in a territory defense',
      type: 'kill',
      target: 'npc:rival-gang-member',
      required: 3
    },
    {
      id: 'gang-coordination',
      description: 'Learn about gang coordination and tactics',
      type: 'visit',
      target: 'location:gang-war-room',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 300 },
    { type: 'dollars', amount: 200 },
    { type: 'item', itemId: 'gang-bandana' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro: `"Lone wolves don't last long in this territory," says the gang leader. "You need people watching your back. We're not the biggest gang, but we take care of our own. Learn from us, and when you're ready to move on, you'll know how to build something of your own."`,
  dialogueComplete: `"You've got the instincts, kid. When you hit Level 10 and graduate to the real game, you'll have the knowledge to join any gang in the territory - or start your own. The bonds you form now will echo through your whole career."`
};

// ============================================================================
// QUEST 9: STORM CLOUDS (Level 9)
// Faction conflict escalates - player must choose a side for a battle
// ============================================================================

export const QUEST_9_STORM_CLOUDS: QuestSeedData = {
  questId: 'newcomers-trail:09-storm-clouds',
  name: 'Storm Clouds',
  description: `The uneasy peace has shattered. A valuable gold shipment has gone missing, and each faction blames the others. Violence has erupted at the Copper Creek crossing. Sheriff Thornton has called you in - someone needs to pick a side and help end this before it becomes a full-scale war.`,
  type: 'main',
  levelRequired: 9,
  prerequisites: ['newcomers-trail:08-gangs-all-here'],
  objectives: [
    {
      id: 'assess-situation',
      description: 'Travel to Copper Creek and assess the situation',
      type: 'visit',
      target: 'location:copper-creek-crossing',
      required: 1
    },
    {
      id: 'choose-side',
      description: 'Choose which faction to support in the skirmish',
      type: 'skill',
      target: 'choice:faction-support',
      required: 1
    },
    {
      id: 'fight-skirmish',
      description: 'Help your chosen faction win the skirmish',
      type: 'kill',
      target: 'npc:opposing-faction-fighter',
      required: 5
    },
    {
      id: 'secure-gold',
      description: 'Help secure (or steal) the gold shipment',
      type: 'collect',
      target: 'item:gold-shipment',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 350 },
    { type: 'dollars', amount: 250 },
    { type: 'reputation', faction: 'chosen', amount: 30 },
    { type: 'item', itemId: 'faction-combat-gear' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro: `The Sheriff's face is grim. "I've kept the peace for twenty years. But this... this is beyond me. The factions are mobilizing. Blood will be spilled. You've learned about all of them - now you have to pick a side. Not forever, just for this fight. Show them what you're made of."`,
  dialogueComplete: `The smoke clears. Bodies lie in the dust. Your chosen faction has prevailed - for now. But this is just the beginning. The other factions will remember your choice. Allies have been made. Enemies too. Welcome to the real frontier.`
};

// ============================================================================
// QUEST 10: THE PATH FORWARD (Level 10)
// Final faction choice - permanent decision with grace period
// ============================================================================

export const QUEST_10_PATH_FORWARD: QuestSeedData = {
  questId: 'newcomers-trail:10-path-forward',
  name: 'The Path Forward',
  description: `You've reached Level 10. The Tutorial Outlaws bid you farewell as you graduate to the real game. Sheriff Thornton has arranged a final meeting. It's time to make your choice - which faction will you pledge your loyalty to? This decision will shape your entire future in the territory.`,
  type: 'main',
  levelRequired: 10,
  prerequisites: ['newcomers-trail:09-storm-clouds'],
  objectives: [
    {
      id: 'leave-tutorial-gang',
      description: 'Leave the Tutorial Outlaws with their blessing',
      type: 'visit',
      target: 'location:tutorial-gang-hideout',
      required: 1
    },
    {
      id: 'final-reflection',
      description: 'Meet with Sheriff Thornton for final counsel',
      type: 'visit',
      target: 'npc:sheriff-clay-thornton',
      required: 1
    },
    {
      id: 'faction-choice',
      description: 'Choose your faction (PERMANENT DECISION)',
      type: 'skill',
      target: 'choice:faction-permanent',
      required: 1
    },
    {
      id: 'receive-gear',
      description: 'Receive your faction gear and welcome',
      type: 'visit',
      target: 'npc:faction-leader',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 500 },
    { type: 'dollars', amount: 500 },
    { type: 'reputation', faction: 'chosen', amount: 100 },
    { type: 'item', itemId: 'faction-gear-set' },
    { type: 'item', itemId: 'faction-title-scroll' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro: `Sheriff Thornton pours two glasses of whiskey. "You've come a long way from that tenderfoot who stepped off the stagecoach. You've seen the Settlers' ambition, the Coalition's traditions, the Frontera's cunning. Each has their virtues. Each has their sins. Now it's time to choose. Who are you? What do you believe in? What kind of legend will you become?"`,
  dialogueComplete: `"The choice is made. There's no going back now - well, there's a 24-hour grace period if you change your mind, but after that, your path is set. Your faction will open new quests, new allies, new enemies. The real game begins now. Go make your mark on the frontier."`,
  specialFlags: {
    factionChoiceQuest: true,
    gracePeriodHours: 24,
    permanentDecision: true
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All Newcomer's Trail quests in order
 */
export const NEWCOMERS_TRAIL_QUESTS: QuestSeedData[] = [
  QUEST_1_ARRIVAL,
  QUEST_2_THREE_ROADS,
  QUEST_3_SETTLER_WAYS,
  QUEST_4_OLD_WAYS,
  QUEST_5_BLOOD_GOLD,
  QUEST_6_CROSSROADS,
  QUEST_7_DIRTY_SECRETS,
  QUEST_8_GANGS_ALL_HERE,
  QUEST_9_STORM_CLOUDS,
  QUEST_10_PATH_FORWARD,
];

/**
 * Total XP from completing the Newcomer's Trail
 * Should bring a player from L1 to L10
 */
export const NEWCOMERS_TRAIL_TOTAL_XP = NEWCOMERS_TRAIL_QUESTS.reduce((sum, quest) => {
  const xpReward = quest.rewards.find(r => r.type === 'xp');
  return sum + (xpReward?.amount || 0);
}, 0); // 2,300 XP total

/**
 * Total gold from completing the Newcomer's Trail
 */
export const NEWCOMERS_TRAIL_TOTAL_GOLD = NEWCOMERS_TRAIL_QUESTS.reduce((sum, quest) => {
  const goldReward = quest.rewards.find(r => r.type === 'dollars');
  return sum + (goldReward?.amount || 0);
}, 0); // 1,575 gold total

/**
 * Get quest by number (1-10)
 */
export function getNewcomersTrailQuest(questNumber: number): QuestSeedData | undefined {
  if (questNumber < 1 || questNumber > 10) return undefined;
  return NEWCOMERS_TRAIL_QUESTS[questNumber - 1];
}

/**
 * Check if a player has completed the Newcomer's Trail
 */
export function hasCompletedNewcomersTrail(completedQuests: string[]): boolean {
  return completedQuests.includes('newcomers-trail:10-path-forward');
}
