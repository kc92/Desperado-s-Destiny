/**
 * Starter Quests Database
 * Narrative-rich quest chains for new players (Levels 1-10)
 */

import { QuestSeedData } from '../../models/Quest.model';
import { NEWCOMERS_TRAIL_QUESTS, getNewcomersTrailQuest, hasCompletedNewcomersTrail } from './newcomers-trail';
import { ALL_GREENHORN_QUESTS } from './greenhorns-trail';
import { FRONTIER_JUSTICE_QUESTS } from './frontier-justice';
import { HEART_OF_TERRITORY_QUESTS } from './heart-of-territory';
import { LEGENDS_OF_WEST_QUESTS } from './legends-of-west';

/**
 * ========================================
 * TUTORIAL/INTRODUCTION QUESTS
 * ========================================
 */

export const FIRST_STEPS: QuestSeedData = {
  questId: 'tutorial:first-steps',
  name: 'First Steps in Red Gulch',
  description: `You've arrived in Red Gulch with nothing but the clothes on your back and empty pockets. Time to learn how this town works. Marshal Blackwood suggested starting with honest work - the stable needs a hand, and they pay in cash.`,
  type: 'main',
  levelRequired: 1,
  prerequisites: [],
  objectives: [
    {
      id: 'visit-stable',
      description: 'Find the Red Gulch Livery Stable',
      type: 'visit',
      target: 'location:red-gulch-stable',
      required: 1
    },
    {
      id: 'complete-job',
      description: 'Complete a job to earn your first dollars',
      type: 'gold',
      target: 'any',
      required: 10
    }
  ],
  rewards: [
    { type: 'xp', amount: 50 },
    { type: 'dollars', amount: 25 },
    { type: 'item', itemId: 'worn-hat' }
  ],
  repeatable: false,
  isActive: true
};

export const LEARNING_THE_ROPES: QuestSeedData = {
  questId: 'tutorial:learning-ropes',
  name: 'Learning the Ropes',
  description: `You've got a few coins now. Magnus O'Malley, the blacksmith, mentioned he could use someone with strong hands. More importantly, he can teach you about weapons and equipment. Worth visiting Whiskey Bend to meet him.`,
  type: 'main',
  levelRequired: 1,
  prerequisites: ['tutorial:first-steps'],
  objectives: [
    {
      id: 'travel-whiskey-bend',
      description: 'Travel to Whiskey Bend',
      type: 'visit',
      target: 'location:whiskey-bend',
      required: 1
    },
    {
      id: 'talk-blacksmith',
      description: 'Speak with Magnus O\'Malley the blacksmith',
      type: 'visit',
      target: 'npc:whiskey-bend-blacksmith',
      required: 1
    },
    {
      id: 'buy-weapon',
      description: 'Purchase your first weapon',
      type: 'collect',
      target: 'item:weapon',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 100 },
    { type: 'dollars', amount: 50 }
  ],
  repeatable: false,
  isActive: true
};

/**
 * ========================================
 * BLACKSMITH QUEST CHAIN (Magnus O'Malley)
 * ========================================
 */

export const RARE_ORE_RETRIEVAL: QuestSeedData = {
  questId: 'npc:blacksmith:rare-ore-retrieval',
  name: 'The Mountain\'s Secret',
  description: `Magnus takes you aside, voice low: "There's a vein of ore up in the mountains. Pure steel, the kind you can't buy. Problem is, it's in Kaiowa territory. They don't take kindly to trespassers. But if you're clever - or brave - you might bring back enough for both of us."`,
  type: 'side',
  levelRequired: 5,
  prerequisites: [],
  objectives: [
    {
      id: 'reach-mountain',
      description: 'Reach the mountain ore vein',
      type: 'visit',
      target: 'location:mountain-ore-vein',
      required: 1
    },
    {
      id: 'collect-ore',
      description: 'Collect pure steel ore samples',
      type: 'collect',
      target: 'item:steel-ore',
      required: 5
    },
    {
      id: 'return-blacksmith',
      description: 'Return to Magnus without being caught',
      type: 'deliver',
      target: 'npc:whiskey-bend-blacksmith',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 250 },
    { type: 'dollars', amount: 100 },
    { type: 'item', itemId: 'steel-ingot' },
    { type: 'reputation', faction: 'settler', amount: 10 }
  ],
  repeatable: false,
  isActive: true
};

export const GUILD_SECRETS: QuestSeedData = {
  questId: 'npc:blacksmith:guild-secrets',
  name: 'Iron Secrets',
  description: `Magnus shows you a letter with a broken wax seal - the mark of the Eastern Smithing Guild. His face darkens. "They want me dead. I left the Guild knowing too much about their... methods. They're not just making weapons. They're making something worse. I need proof before they send someone for me."`,
  type: 'side',
  levelRequired: 8,
  prerequisites: ['npc:blacksmith:rare-ore-retrieval'],
  objectives: [
    {
      id: 'investigate-shipment',
      description: 'Investigate the suspicious weapon shipment at Fort Ashford',
      type: 'visit',
      target: 'location:fort-ashford-armory',
      required: 1
    },
    {
      id: 'collect-evidence',
      description: 'Collect evidence of the Guild\'s illegal activities',
      type: 'collect',
      target: 'item:guild-documents',
      required: 1
    },
    {
      id: 'survive-assassin',
      description: 'Defeat the Guild assassin sent after you',
      type: 'kill',
      target: 'npc:guild-assassin',
      required: 1
    },
    {
      id: 'return-evidence',
      description: 'Bring the evidence to Magnus',
      type: 'deliver',
      target: 'npc:whiskey-bend-blacksmith',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 500 },
    { type: 'dollars', amount: 200 },
    { type: 'item', itemId: 'guild-weapon-schematic' },
    { type: 'reputation', faction: 'settler', amount: 25 }
  ],
  repeatable: false,
  isActive: true
};

export const MASTERWORK_WEAPON: QuestSeedData = {
  questId: 'npc:blacksmith:masterwork-weapon',
  name: 'The Last Hammer Falls',
  description: `Magnus grips your shoulder with hands like iron. "I've been smithing for forty years. Made a thousand weapons, maybe more. But there's one I never made - the perfect weapon. My masterwork. I'm too old to do it alone. Help me, and I'll forge something the world ain't never seen. Something with your name on it."`,
  type: 'side',
  levelRequired: 12,
  prerequisites: ['npc:blacksmith:guild-secrets'],
  objectives: [
    {
      id: 'gather-perfect-steel',
      description: 'Gather five perfect steel ingots',
      type: 'collect',
      target: 'item:perfect-steel-ingot',
      required: 5
    },
    {
      id: 'gather-legendary-grip',
      description: 'Acquire legendary buffalo leather for the grip',
      type: 'collect',
      target: 'item:legendary-buffalo-hide',
      required: 1
    },
    {
      id: 'gather-silver-inlay',
      description: 'Collect silver for decorative inlay',
      type: 'collect',
      target: 'item:pure-silver',
      required: 3
    },
    {
      id: 'assist-forging',
      description: 'Assist Magnus in the three-day forging process',
      type: 'skill',
      target: 'skill:smithing',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1000 },
    { type: 'dollars', amount: 500 },
    { type: 'item', itemId: 'custom-masterwork-weapon' },
    { type: 'reputation', faction: 'settler', amount: 50 }
  ],
  repeatable: false,
  isActive: true
};

/**
 * ========================================
 * KAIOWA ELDER QUEST CHAIN (Soaring Eagle)
 * ========================================
 */

export const SKINWALKER_HUNT: QuestSeedData = {
  questId: 'npc:kaiowa-elder:skinwalker-hunt',
  name: 'Shadow in the Night',
  description: `Soaring Eagle's eyes are grave. "Something walks the mesa at night. Not Kaiowa. Not human anymore. Skinwalker - a witch who takes animal form. Our warriors found tracks. Tracks that start as man and become beast. It kills our horses, frightens our children. You seek to prove yourself? Hunt this evil. Bring me its heart."`,
  type: 'side',
  levelRequired: 8,
  prerequisites: [],
  objectives: [
    {
      id: 'investigate-tracks',
      description: 'Investigate the skinwalker tracks around the mesa',
      type: 'visit',
      target: 'location:mesa-perimeter',
      required: 3
    },
    {
      id: 'gather-silver-bullets',
      description: 'Acquire silver bullets (skinwalkers are immune to lead)',
      type: 'collect',
      target: 'item:silver-bullets',
      required: 6
    },
    {
      id: 'hunt-skinwalker',
      description: 'Track and kill the skinwalker',
      type: 'kill',
      target: 'npc:skinwalker',
      required: 1
    },
    {
      id: 'retrieve-heart',
      description: 'Bring the skinwalker\'s heart to Soaring Eagle',
      type: 'deliver',
      target: 'npc:kaiowa-elder',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 600 },
    { type: 'dollars', amount: 150 },
    { type: 'item', itemId: 'skinwalker-charm' },
    { type: 'reputation', faction: 'kaiowa', amount: 50 }
  ],
  repeatable: false,
  isActive: true
};

export const SACRED_RITUAL: QuestSeedData = {
  questId: 'npc:kaiowa-elder:sacred-ritual',
  name: 'The Sacred Smoke',
  description: `"You proved yourself against the darkness. Now, if you wish to truly understand our ways, you must participate in the sacred ritual. We will build a sweat lodge, burn the sacred sage, and call upon the spirits. What you see there... will change you. The spirits do not lie, even when their truth burns like fire."`,
  type: 'side',
  levelRequired: 10,
  prerequisites: ['npc:kaiowa-elder:skinwalker-hunt'],
  objectives: [
    {
      id: 'gather-sacred-sage',
      description: 'Gather sacred sage from Spirit Springs',
      type: 'collect',
      target: 'item:sacred-sage',
      required: 5
    },
    {
      id: 'build-sweat-lodge',
      description: 'Help construct the sweat lodge',
      type: 'skill',
      target: 'skill:survival',
      required: 1
    },
    {
      id: 'complete-ritual',
      description: 'Complete the purification ritual',
      type: 'visit',
      target: 'location:kaiowa-sweat-lodge',
      required: 1
    },
    {
      id: 'receive-vision',
      description: 'Endure the vision quest',
      type: 'skill',
      target: 'skill:spirit',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 750 },
    { type: 'item', itemId: 'spirit-vision-token' },
    { type: 'item', itemId: 'sacred-war-paint' },
    { type: 'reputation', faction: 'kaiowa', amount: 75 }
  ],
  repeatable: false,
  isActive: true
};

export const BUFFALO_DANCE: QuestSeedData = {
  questId: 'npc:kaiowa-elder:buffalo-dance',
  name: 'Dance of the Buffalo Spirit',
  description: `Soaring Eagle speaks with the weight of generations: "The Buffalo Dance is our most sacred ceremony. It calls the buffalo spirits, connects us to the ancestors, reminds us who we are. No outsider has witnessed it in fifty years. But you... you have earned this. Learn the dance. Wear the sacred headdress. Become part of our story."`,
  type: 'side',
  levelRequired: 15,
  prerequisites: ['npc:kaiowa-elder:sacred-ritual'],
  objectives: [
    {
      id: 'earn-elder-trust',
      description: 'Achieve 80+ trust with Soaring Eagle',
      type: 'skill',
      target: 'trust:kaiowa-elder',
      required: 80
    },
    {
      id: 'learn-buffalo-steps',
      description: 'Learn the sacred dance steps from the elders',
      type: 'visit',
      target: 'location:kaiowa-kiva',
      required: 5
    },
    {
      id: 'craft-ceremonial-garb',
      description: 'Create your ceremonial dancing garb',
      type: 'collect',
      target: 'item:buffalo-dance-garb',
      required: 1
    },
    {
      id: 'perform-dance',
      description: 'Perform the Buffalo Dance at the summer ceremony',
      type: 'skill',
      target: 'skill:ritual-dance',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1500 },
    { type: 'item', itemId: 'buffalo-headdress' },
    { type: 'item', itemId: 'honorary-kaiowa-token' },
    { type: 'reputation', faction: 'kaiowa', amount: 100 }
  ],
  repeatable: false,
  isActive: true
};

/**
 * ========================================
 * SALOON SINGER QUEST CHAIN (Scarlett Rose)
 * ========================================
 */

export const INFORMATION_NETWORK: QuestSeedData = {
  questId: 'npc:saloon-singer:information-network',
  name: 'Whispers in the Dark',
  description: `Scarlett leans close, voice barely audible over the piano. "I sell information, darling. But I need collectors. People who can blend in, listen, and report back. You've got the look - nondescript, forgettable. Perfect for this work. Interested in becoming one of my little birds?"`,
  type: 'side',
  levelRequired: 6,
  prerequisites: [],
  objectives: [
    {
      id: 'gather-intel-sheriff',
      description: 'Eavesdrop on the sheriff\'s private conversations',
      type: 'visit',
      target: 'location:red-gulch-sheriffs-office',
      required: 3
    },
    {
      id: 'gather-intel-merchant',
      description: 'Befriend the merchant and learn his secrets',
      type: 'skill',
      target: 'trust:merchant',
      required: 40
    },
    {
      id: 'gather-intel-outlaw',
      description: 'Infiltrate the outlaw meeting at The Frontera',
      type: 'visit',
      target: 'location:frontera-back-room',
      required: 1
    },
    {
      id: 'report-findings',
      description: 'Report your findings to Scarlett',
      type: 'deliver',
      target: 'npc:saloon-singer',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 400 },
    { type: 'dollars', amount: 200 },
    { type: 'item', itemId: 'information-brokers-mark' },
    { type: 'reputation', faction: 'neutral', amount: 25 }
  ],
  repeatable: false,
  isActive: true
};

export const SECRET_IDENTITY: QuestSeedData = {
  questId: 'npc:saloon-singer:secret-identity',
  name: 'The Woman Behind the Song',
  description: `Scarlett's mask slips for just a moment. "You want to know who I really am? Fine. I'll tell you. But first, you help me tie up a loose end from my past. There's a man coming to Red Gulch. A Pinkerton detective. He's looking for someone - me. He cannot find me. Make sure he doesn't."`,
  type: 'side',
  levelRequired: 10,
  prerequisites: ['npc:saloon-singer:information-network'],
  objectives: [
    {
      id: 'identify-pinkerton',
      description: 'Identify the Pinkerton detective in Red Gulch',
      type: 'visit',
      target: 'location:red-gulch-hotel',
      required: 1
    },
    {
      id: 'mislead-detective',
      description: 'Feed false information to the detective',
      type: 'crime',
      target: 'crime:deception',
      required: 1
    },
    {
      id: 'optional-kill',
      description: 'Eliminate the detective (optional - affects story)',
      type: 'kill',
      target: 'npc:pinkerton-detective',
      required: 0
    },
    {
      id: 'report-outcome',
      description: 'Report the outcome to Scarlett',
      type: 'deliver',
      target: 'npc:saloon-singer',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 800 },
    { type: 'dollars', amount: 350 },
    { type: 'item', itemId: 'scarletts-secret-journal' }
  ],
  repeatable: false,
  isActive: true
};

export const COMING_WAR: QuestSeedData = {
  questId: 'npc:saloon-singer:coming-war',
  name: 'Storm on the Horizon',
  description: `Scarlett pulls you aside, eyes deadly serious. "I told you I work for powerful people. They're coming. The railroad, the government, the Kaiowa, the outlaws - everyone's positioning for war. Territory this rich won't stay peaceful. I can get you on the winning side, but you need to choose. Soon. Because when the storm breaks, neutrality will be death."`,
  type: 'main',
  levelRequired: 15,
  prerequisites: ['npc:saloon-singer:secret-identity'],
  objectives: [
    {
      id: 'gather-war-intel',
      description: 'Gather intelligence on all factions\' military strength',
      type: 'collect',
      target: 'item:faction-intelligence',
      required: 4
    },
    {
      id: 'meet-power-players',
      description: 'Meet with the territory\'s major power players',
      type: 'visit',
      target: 'npc:power-player',
      required: 5
    },
    {
      id: 'make-alliance',
      description: 'Choose your allegiance (major story decision)',
      type: 'skill',
      target: 'choice:faction-alliance',
      required: 1
    },
    {
      id: 'first-strike',
      description: 'Participate in your faction\'s first major operation',
      type: 'skill',
      target: 'event:first-strike',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2000 },
    { type: 'dollars', amount: 500 },
    { type: 'item', itemId: 'faction-war-token' },
    { type: 'reputation', faction: 'chosen', amount: 100 }
  ],
  repeatable: false,
  isActive: true
};

/**
 * ========================================
 * DAILY/REPEATABLE QUESTS
 * ========================================
 */

export const DAILY_HUNTING: QuestSeedData = {
  questId: 'daily:hunting',
  name: 'Daily Hunt',
  description: 'The general store pays good money for fresh game. Head into the wilderness and bring back some meat.',
  type: 'daily',
  levelRequired: 3,
  prerequisites: [],
  objectives: [
    {
      id: 'hunt-animals',
      description: 'Hunt and kill wild animals',
      type: 'kill',
      target: 'npc:wildlife',
      required: 5
    },
    {
      id: 'collect-meat',
      description: 'Collect animal meat',
      type: 'collect',
      target: 'item:raw-meat',
      required: 10
    }
  ],
  rewards: [
    { type: 'xp', amount: 150 },
    { type: 'dollars', amount: 75 }
  ],
  repeatable: true,
  isActive: true
};

export const DAILY_LAW_WORK: QuestSeedData = {
  questId: 'daily:law-work',
  name: 'Deputy for a Day',
  description: 'Marshal Blackwood needs help keeping order. Patrol the streets and deal with any troublemakers.',
  type: 'daily',
  levelRequired: 5,
  prerequisites: [],
  objectives: [
    {
      id: 'patrol-town',
      description: 'Patrol Red Gulch streets',
      type: 'visit',
      target: 'location:red-gulch-streets',
      required: 3
    },
    {
      id: 'stop-crimes',
      description: 'Stop crimes in progress',
      type: 'crime',
      target: 'crime:prevent',
      required: 2
    }
  ],
  rewards: [
    { type: 'xp', amount: 200 },
    { type: 'dollars', amount: 100 },
    { type: 'reputation', faction: 'settler', amount: 10 }
  ],
  repeatable: true,
  isActive: true
};

/**
 * All starter quests
 */
export const ALL_STARTER_QUESTS: QuestSeedData[] = [
  // Newcomer's Trail (L1-10) - Main storyline introducing all factions
  ...NEWCOMERS_TRAIL_QUESTS,

  // Legacy Tutorial quests (now optional side content)
  FIRST_STEPS,
  LEARNING_THE_ROPES,

  // Blacksmith chain
  RARE_ORE_RETRIEVAL,
  GUILD_SECRETS,
  MASTERWORK_WEAPON,

  // Kaiowa Elder chain
  SKINWALKER_HUNT,
  SACRED_RITUAL,
  BUFFALO_DANCE,

  // Saloon Singer chain
  INFORMATION_NETWORK,
  SECRET_IDENTITY,
  COMING_WAR,

  // Daily quests
  DAILY_HUNTING,
  DAILY_LAW_WORK,

  // Greenhorn's Trail (Phase 19.2) - Skill tutorials + Faction War Prologue
  ...ALL_GREENHORN_QUESTS,

  // Frontier Justice (Phase 19.3) - L16-25 Marshal/Outlaw + Faction War
  ...FRONTIER_JUSTICE_QUESTS,

  // Heart of the Territory (Phase 19.4) - L26-35 Territory Control + Silverado Strike
  ...HEART_OF_TERRITORY_QUESTS,

  // Legends of the West (Phase 19.5) - L36-45 Ghost Towns + Supernatural
  ...LEGENDS_OF_WEST_QUESTS,
];

// Re-export Newcomer's Trail utilities for convenience
export { NEWCOMERS_TRAIL_QUESTS, getNewcomersTrailQuest, hasCompletedNewcomersTrail };

/**
 * Get quests by type
 */
export function getQuestsByType(type: string): QuestSeedData[] {
  return ALL_STARTER_QUESTS.filter(quest => quest.type === type);
}

/**
 * Get quests by level range
 */
export function getQuestsByLevelRange(minLevel: number, maxLevel: number): QuestSeedData[] {
  return ALL_STARTER_QUESTS.filter(
    quest => quest.levelRequired >= minLevel && quest.levelRequired <= maxLevel
  );
}
