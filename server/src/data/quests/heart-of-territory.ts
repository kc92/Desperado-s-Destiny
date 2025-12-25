/**
 * Heart of the Territory - Phase 19.4 Quests
 * 25 quests covering L26-35 content pack
 *
 * Quest Categories:
 * - Universal Main Arc (12 quests): The Silverado Strike narrative
 * - Territory Tutorial Quests (5 quests): Territory system mechanics
 * - Faction-Specific Side Quests (8 quests): Settler (3), Nahi (3), Frontera (2)
 *
 * Design Philosophy:
 * - Silver rush narrative following Railroad's defeat
 * - Territory control as central mechanic
 * - Less faction branching, more universal content
 * - Gang warfare and claim politics
 */

import { QuestSeedData } from '../../models/Quest.model';

// =============================================================================
// UNIVERSAL MAIN ARC - THE SILVERADO STRIKE (L26-35)
// All players experience these quests
// =============================================================================

// --- ACT 1: SILVER RUSH (L26-28) ---

export const TERRITORY_SILVERADO_STRIKE: QuestSeedData = {
  questId: 'territory:silverado-strike',
  name: 'The Silverado Strike',
  description:
    `With Colonel Blackwood defeated and the Railroad in disarray, prospectors have uncovered ` +
    `something extraordinary in the mountains: the Silverado Strike - the biggest silver ` +
    `deposit since the Comstock Lode. Fortune-seekers flood the valley. Chaos follows them.`,
  type: 'main',
  levelRequired: 26,
  prerequisites: ['justice:the-iron-horse-gambit'],
  objectives: [
    {
      id: 'hear-news',
      description: 'Hear rumors of the silver strike in town',
      type: 'visit',
      target: 'npc:excited-prospector',
      required: 1
    },
    {
      id: 'travel-silverado',
      description: 'Travel to Silverado Valley',
      type: 'visit',
      target: 'location:silverado-valley',
      required: 1
    },
    {
      id: 'stake-claim',
      description: 'Stake your first claim in the valley',
      type: 'visit',
      target: 'location:silverado-claims-office',
      required: 1
    },
    {
      id: 'mine-silver',
      description: 'Extract your first silver ore',
      type: 'collect',
      target: 'item:silver-ore',
      required: 10
    }
  ],
  rewards: [
    { type: 'xp', amount: 1800 },
    { type: 'dollars', amount: 800 },
    { type: 'item', itemId: 'prospectors-pickaxe' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Did you hear? They found SILVER in the mountains! Pure veins, thick as your arm! ` +
    `The Railroad was sitting on it the whole time. Now that Blackwood's gone, it's a ` +
    `free-for-all! Get to Silverado Valley before it's all claimed!"`,
  dialogueComplete:
    `You've staked your claim in Silverado Valley. Silver ore gleams in your pack. ` +
    `But you're not the only one who sees opportunity here. The real challenge is keeping ` +
    `what you've found.`
};

export const TERRITORY_CLAIM_JUMPERS_PARADISE: QuestSeedData = {
  questId: 'territory:claim-jumpers-paradise',
  name: 'Claim Jumpers\' Paradise',
  description:
    `The chaos of the silver rush has attracted predators. Claim jumpers are systematically ` +
    `targeting successful prospectors - those who strike silver find themselves jumped ` +
    `within days. Someone is organizing these attacks. Track down the jumper network.`,
  type: 'main',
  levelRequired: 26,
  prerequisites: ['territory:silverado-strike'],
  objectives: [
    {
      id: 'investigate-victims',
      description: 'Interview claim jump victims',
      type: 'visit',
      target: 'npc:claim-jump-victim',
      required: 3
    },
    {
      id: 'find-pattern',
      description: 'Identify the pattern in the attacks',
      type: 'collect',
      target: 'item:attack-report',
      required: 5
    },
    {
      id: 'track-jumpers',
      description: 'Track the jumpers to their base of operations',
      type: 'visit',
      target: 'location:jumper-trail',
      required: 1
    },
    {
      id: 'scout-hideout',
      description: 'Scout the jumper hideout',
      type: 'visit',
      target: 'location:jumper-hideout-entrance',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1900 },
    { type: 'dollars', amount: 850 },
    { type: 'reputation', faction: 'settler', amount: 15 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A miner approaches you, bruised and shaken. "They took everything. My claim, my equipment, ` +
    `my partner's life. And when I reported it, the sheriff said his hands were tied. ` +
    `Someone's paying him off. Someone's behind all of this."`,
  dialogueComplete:
    `You've found the jumper hideout in an abandoned mine. But this is no ordinary gang - ` +
    `it's a well-organized operation with a leader called "Dutch McCready." ` +
    `Taking them down won't be easy.`
};

export const TERRITORY_THE_JUMPER_KING: QuestSeedData = {
  questId: 'territory:the-jumper-king',
  name: 'The Jumper King',
  description:
    `Dutch McCready leads the most successful claim jumping operation in the territory. ` +
    `From his fortified hideout in an abandoned mine, he controls a network of informants ` +
    `and enforcers. It's time to end his reign of terror.`,
  type: 'main',
  levelRequired: 27,
  prerequisites: ['territory:claim-jumpers-paradise'],
  objectives: [
    {
      id: 'gather-forces',
      description: 'Gather allies willing to assault the hideout',
      type: 'collect',
      target: 'npc:willing-miners',
      required: 5
    },
    {
      id: 'infiltrate-hideout',
      description: 'Infiltrate the jumper hideout',
      type: 'visit',
      target: 'location:jumper-hideout',
      required: 1
    },
    {
      id: 'defeat-dutch',
      description: 'Defeat Dutch McCready and his gang',
      type: 'kill',
      target: 'boss:boss_claim_jumper_gang',
      required: 1
    },
    {
      id: 'free-prisoners',
      description: 'Free any captured miners',
      type: 'visit',
      target: 'npc:captured-miners',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2200 },
    { type: 'dollars', amount: 1000 },
    { type: 'item', itemId: 'dutchs-dual-pistols' },
    { type: 'reputation', faction: 'settler', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The abandoned mine looms before you. Inside, Dutch McCready and his gang wait. ` +
    `They've had it easy too long - preying on hardworking prospectors. Today, ` +
    `the hunters become the hunted.`,
  dialogueComplete:
    `Dutch McCready is down. The Claim Jumper Gang is broken. Captured miners ` +
    `stream out of the tunnels, blinking in the sunlight. But you've also uncovered ` +
    `something troubling: Dutch was selling information to someone called "The Baron."`
};

export const TERRITORY_A_BARON_RISES: QuestSeedData = {
  questId: 'territory:a-baron-rises',
  name: 'A Baron Rises',
  description:
    `Dutch McCready's interrogation reveals a bigger threat: Cornelius Whitmore, ` +
    `an Eastern tycoon buying up claims and consolidating power. The "Silver Baron" ` +
    `now controls the processing facility - meaning all silver must go through him.`,
  type: 'main',
  levelRequired: 28,
  prerequisites: ['territory:the-jumper-king'],
  objectives: [
    {
      id: 'investigate-baron',
      description: 'Investigate Cornelius Whitmore',
      type: 'collect',
      target: 'item:whitmore-dossier',
      required: 3
    },
    {
      id: 'visit-facility',
      description: 'Visit the Silver Processing Facility',
      type: 'visit',
      target: 'location:silverado-processing-facility',
      required: 1
    },
    {
      id: 'witness-exploitation',
      description: 'Witness the Baron\'s business practices',
      type: 'visit',
      target: 'npc:indebted-miner',
      required: 1
    },
    {
      id: 'gather-evidence',
      description: 'Gather evidence of his corruption',
      type: 'collect',
      target: 'item:corruption-evidence',
      required: 5
    }
  ],
  rewards: [
    { type: 'xp', amount: 2000 },
    { type: 'dollars', amount: 900 },
    { type: 'reputation', faction: 'settler', amount: 20 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Dutch spits blood and laughs. "You think I was the problem? I was just a dog. ` +
    `Whitmore is the master. He owns the processing facility, the supply stores, ` +
    `half the town council. You want to free Silverado? You'll have to go through him."`,
  dialogueComplete:
    `The evidence is damning. Cornelius Whitmore uses debt slavery to control miners, ` +
    `bribes officials to look the other way, and has people who complain "disappeared." ` +
    `But exposing him won't be easy - he has powerful friends.`
};

export const TERRITORY_THE_BARONS_OFFER: QuestSeedData = {
  questId: 'territory:the-barons-offer',
  name: 'The Baron\'s Offer',
  description:
    `Word of your investigation reaches Cornelius Whitmore. Rather than silence you, ` +
    `he invites you to his mansion for a "business discussion." ` +
    `The Silver Baron wants to make you an offer you can't refuse.`,
  type: 'main',
  levelRequired: 28,
  prerequisites: ['territory:a-baron-rises'],
  objectives: [
    {
      id: 'receive-invitation',
      description: 'Receive Whitmore\'s invitation',
      type: 'collect',
      target: 'item:whitmore-invitation',
      required: 1
    },
    {
      id: 'visit-mansion',
      description: 'Visit the Whitmore Mansion',
      type: 'visit',
      target: 'location:whitmore-mansion',
      required: 1
    },
    {
      id: 'hear-offer',
      description: 'Listen to the Baron\'s offer',
      type: 'visit',
      target: 'npc:cornelius-whitmore',
      required: 1
    },
    {
      id: 'make-decision',
      description: 'Accept or refuse the Baron\'s partnership',
      type: 'visit',
      target: 'decision:baron-partnership',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2100 },
    { type: 'dollars', amount: 950 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A courier delivers an envelope sealed with gold wax. Inside, elegant script: ` +
    `"I admire initiative. Come to dinner at my estate. Let us discuss how we might ` +
    `help each other. - C. Whitmore"`,
  dialogueComplete:
    `The Baron's offer was tempting: partnership, wealth, power. Whether you accepted ` +
    `or refused, you now understand who you're dealing with. Cornelius Whitmore ` +
    `doesn't make enemies - he acquires them.`
};

// --- ACT 2: CONSOLIDATION (L29-31) ---

export const TERRITORY_UNDERGROUND_ECONOMY: QuestSeedData = {
  questId: 'territory:underground-economy',
  name: 'The Underground Economy',
  description:
    `Not all silver flows through Whitmore's facility. A black market has emerged - ` +
    `miners smuggling ore past his checkpoints, fences buying silver at night. ` +
    `Investigate this underground economy and decide: help it thrive or shut it down.`,
  type: 'main',
  levelRequired: 29,
  prerequisites: ['territory:the-barons-offer'],
  objectives: [
    {
      id: 'find-smugglers',
      description: 'Find the silver smuggling operation',
      type: 'visit',
      target: 'location:smuggler-camp',
      required: 1
    },
    {
      id: 'meet-fence',
      description: 'Meet the black market fence',
      type: 'visit',
      target: 'npc:silver-fence',
      required: 1
    },
    {
      id: 'choose-path',
      description: 'Decide: Support smugglers OR report to authorities',
      type: 'visit',
      target: 'decision:smuggler-fate',
      required: 1
    },
    {
      id: 'complete-transaction',
      description: 'Complete a transaction (either way)',
      type: 'collect',
      target: 'item:silver-transaction',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2200 },
    { type: 'dollars', amount: 1000 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A miner whispers to you in the saloon: "There's a way to sell silver without ` +
    `going through Whitmore. Dangerous, but it pays triple. Meet me behind the ` +
    `livery stable at midnight if you're interested."`,
  dialogueComplete:
    `The underground economy exists because people are desperate. Whether you ` +
    `helped it flourish or brought it crashing down, you've made powerful friends ` +
    `and enemies. The silver flows - the only question is who controls it.`
};

export const TERRITORY_SACRED_SILVER: QuestSeedData = {
  questId: 'territory:sacred-silver',
  name: 'Sacred Silver',
  description:
    `The silver rush has reached Sacred Mountain - ancestral Nahi territory. ` +
    `Miners are desecrating burial grounds, and the Apache War Band under Iron Wolf ` +
    `has issued an ultimatum: leave the mountain or face war. The tribes unite.`,
  type: 'main',
  levelRequired: 29,
  prerequisites: ['territory:underground-economy'],
  objectives: [
    {
      id: 'hear-ultimatum',
      description: 'Hear Iron Wolf\'s ultimatum',
      type: 'visit',
      target: 'npc:iron-wolf-messenger',
      required: 1
    },
    {
      id: 'visit-sacred-site',
      description: 'Visit the desecrated sacred site',
      type: 'visit',
      target: 'location:sacred-mountain-approach',
      required: 1
    },
    {
      id: 'witness-desecration',
      description: 'Witness what the miners have done',
      type: 'visit',
      target: 'location:desecrated-burial-ground',
      required: 1
    },
    {
      id: 'make-choice',
      description: 'Choose: Support miners OR support tribes',
      type: 'visit',
      target: 'decision:sacred-ground',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2300 },
    { type: 'dollars', amount: 1050 },
    { type: 'reputation', faction: 'nahi', amount: 20 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A Nahi warrior stands in the town square, voice ringing: "You dig in the bones ` +
    `of our ancestors! You take silver that was never yours! War Chief Iron Wolf ` +
    `has spoken - leave Sacred Mountain or face the consequences!"`,
  dialogueComplete:
    `The sacred sites desecration has united the Nahi tribes against the miners. ` +
    `Iron Wolf's war band grows stronger daily. Unless someone finds a way to ` +
    `balance silver hunger with sacred ground, blood will flow.`
};

export const TERRITORY_SILVER_BARONS_EMPIRE: QuestSeedData = {
  questId: 'territory:silver-barons-empire',
  name: 'The Silver Baron\'s Empire',
  description:
    `Cornelius Whitmore has consolidated his power. He controls the processing facility, ` +
    `owns most claims through debt, and has the sheriff in his pocket. ` +
    `It's time to bring down the Silver Baron and free Silverado Valley.`,
  type: 'main',
  levelRequired: 30,
  prerequisites: ['territory:sacred-silver'],
  objectives: [
    {
      id: 'rally-miners',
      description: 'Rally miners against the Baron',
      type: 'visit',
      target: 'npc:union-organizer',
      required: 1
    },
    {
      id: 'gather-evidence',
      description: 'Gather evidence of all his crimes',
      type: 'collect',
      target: 'item:baron-crimes-evidence',
      required: 5
    },
    {
      id: 'infiltrate-facility',
      description: 'Infiltrate the Processing Facility',
      type: 'visit',
      target: 'location:silverado-processing-facility',
      required: 1
    },
    {
      id: 'defeat-baron',
      description: 'Confront and defeat Cornelius Whitmore',
      type: 'kill',
      target: 'boss:boss_silver_baron',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2800 },
    { type: 'dollars', amount: 1500 },
    { type: 'item', itemId: 'silver-barons-cane' },
    { type: 'reputation', faction: 'settler', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The miners have had enough. They're willing to rise up - but they need a leader. ` +
    `Someone to storm the facility, free the contract workers, and bring down Whitmore. ` +
    `Someone like you.`,
  dialogueComplete:
    `Cornelius Whitmore's empire crumbles. Contracts are burned, debt is forgiven, ` +
    `and miners finally own their claims. But the power vacuum left behind won't ` +
    `stay empty for long. Someone will try to fill it.`
};

export const TERRITORY_WAR_CHIEFS_WARNING: QuestSeedData = {
  questId: 'territory:war-chiefs-warning',
  name: 'War Chief\'s Warning',
  description:
    `With Whitmore fallen, Iron Wolf sees opportunity. He issues a final warning: ` +
    `all mining must cease on Sacred Mountain, or he will take it by force. ` +
    `The miners refuse to leave. War is coming.`,
  type: 'main',
  levelRequired: 31,
  prerequisites: ['territory:silver-barons-empire'],
  objectives: [
    {
      id: 'receive-warning',
      description: 'Receive Iron Wolf\'s warning',
      type: 'visit',
      target: 'npc:iron-wolf-herald',
      required: 1
    },
    {
      id: 'speak-miners',
      description: 'Speak with the mining leaders',
      type: 'visit',
      target: 'npc:mining-leader',
      required: 1
    },
    {
      id: 'attempt-diplomacy',
      description: 'Attempt to negotiate with Iron Wolf',
      type: 'visit',
      target: 'npc:iron-wolf',
      required: 1
    },
    {
      id: 'prepare-conflict',
      description: 'Prepare for the inevitable conflict',
      type: 'collect',
      target: 'item:war-preparation',
      required: 3
    }
  ],
  rewards: [
    { type: 'xp', amount: 2500 },
    { type: 'dollars', amount: 1200 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A war party arrives at dawn. Iron Wolf himself leads them, his eyes like fire. ` +
    `"You have defeated our enemy's enemy. That earns you words before arrows. ` +
    `Leave Sacred Mountain. This is your only warning."`,
  dialogueComplete:
    `Diplomacy has failed. Iron Wolf will not yield, and the miners will not leave. ` +
    `The sacred mountain will see blood. The only question is how much.`
};

export const TERRITORY_THE_TRIBES_UNITE: QuestSeedData = {
  questId: 'territory:the-tribes-unite',
  name: 'The Tribes Unite',
  description:
    `Iron Wolf has done what no chief has done in a generation: united all five ` +
    `Nahi tribes under one war banner. The Apache War Band, the Comanche Raiders, ` +
    `the Pueblo Traders, the Plains Hunters, even the peaceful Kaiowa - all ride with him.`,
  type: 'main',
  levelRequired: 31,
  prerequisites: ['territory:war-chiefs-warning'],
  objectives: [
    {
      id: 'scout-forces',
      description: 'Scout the united tribal forces',
      type: 'visit',
      target: 'location:tribal-war-camp',
      required: 1
    },
    {
      id: 'estimate-strength',
      description: 'Estimate their military strength',
      type: 'collect',
      target: 'item:tribal-intel',
      required: 3
    },
    {
      id: 'find-allies',
      description: 'Find potential allies among the tribes',
      type: 'visit',
      target: 'npc:moderate-tribal-elder',
      required: 1
    },
    {
      id: 'report-findings',
      description: 'Report your findings',
      type: 'deliver',
      target: 'npc:silverado-council',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2600 },
    { type: 'dollars', amount: 1300 },
    { type: 'reputation', faction: 'nahi', amount: 15 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Reports flood in: tribes that haven't spoken in years now ride together. ` +
    `Iron Wolf's war camp grows daily. Smoke signals pass between mountains. ` +
    `The Nahi Coalition is preparing for total war.`,
  dialogueComplete:
    `The tribal alliance is formidable. But you've also found cracks - some elders ` +
    `who prefer peace, some warriors who respect you. When the battle comes, ` +
    `these connections might mean the difference between victory and annihilation.`
};

// --- ACT 3: TERRITORIAL BATTLE (L32-35) ---

export const TERRITORY_BLOOD_FOR_SILVER: QuestSeedData = {
  questId: 'territory:blood-for-silver',
  name: 'Blood for Silver',
  description:
    `The negotiations have failed. Iron Wolf's warriors descend from Sacred Mountain, ` +
    `and the miners take up arms to defend their claims. You must choose a side ` +
    `and face the War Chief in battle.`,
  type: 'main',
  levelRequired: 32,
  prerequisites: ['territory:the-tribes-unite'],
  objectives: [
    {
      id: 'choose-side',
      description: 'Choose: Fight with miners OR fight with tribes',
      type: 'visit',
      target: 'decision:blood-silver-allegiance',
      required: 1
    },
    {
      id: 'reach-battlefield',
      description: 'Reach the Sacred Mountain battlefield',
      type: 'visit',
      target: 'location:sacred-mountain-approach',
      required: 1
    },
    {
      id: 'confront-iron-wolf',
      description: 'Confront War Chief Iron Wolf',
      type: 'kill',
      target: 'boss:boss_war_chief_iron_wolf',
      required: 1
    },
    {
      id: 'determine-outcome',
      description: 'Determine the fate of Sacred Mountain',
      type: 'visit',
      target: 'decision:sacred-mountain-fate',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3200 },
    { type: 'dollars', amount: 1800 },
    { type: 'item', itemId: 'spirit-tomahawk' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The war drums echo through the valley. From Sacred Mountain, war cries descend. ` +
    `From the claims, gunfire answers. Today, silver will flow with blood. ` +
    `Where will you stand when the fighting starts?`,
  dialogueComplete:
    `Iron Wolf falls - or yields. Sacred Mountain's fate is decided. But the power ` +
    `vacuum in Silverado Valley grows ever larger. Someone will rise to fill it. ` +
    `Perhaps someone already has.`
};

export const TERRITORY_HEART_OF_TERRITORY: QuestSeedData = {
  questId: 'territory:heart-of-territory',
  name: 'Heart of the Territory',
  description:
    `The claim jumpers are broken. The Silver Baron has fallen. Iron Wolf is defeated. ` +
    `But from the chaos, a new power has risen: The Claim King. From a throne of pure ` +
    `silver, they control what remains of Silverado Valley. It's time for a final reckoning.`,
  type: 'main',
  levelRequired: 33,
  prerequisites: ['territory:blood-for-silver'],
  objectives: [
    {
      id: 'learn-king',
      description: 'Learn about the Claim King',
      type: 'collect',
      target: 'item:claim-king-intel',
      required: 5
    },
    {
      id: 'rally-forces',
      description: 'Rally forces for the final assault',
      type: 'visit',
      target: 'npc:allied-faction-leaders',
      required: 1
    },
    {
      id: 'breach-fortress',
      description: 'Breach the Heart of Silverado fortress',
      type: 'visit',
      target: 'location:heart-of-silverado',
      required: 1
    },
    {
      id: 'defeat-king',
      description: 'Defeat the Claim King',
      type: 'kill',
      target: 'boss:boss_claim_king',
      required: 1
    },
    {
      id: 'claim-throne',
      description: 'Decide the fate of the Silver Throne',
      type: 'visit',
      target: 'decision:throne-fate',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 4500 },
    { type: 'dollars', amount: 3000 },
    { type: 'item', itemId: 'claim-kings-revolver' },
    { type: 'item', itemId: 'crown-of-silverado' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The Claim King sits on a throne of pure silver, surrounded by an army of ` +
    `loyal gang members. They've taken everything you fought for. The valley, ` +
    `the claims, the people. One final battle will decide who truly rules Silverado.`,
  dialogueComplete:
    `The Claim King falls. The Silver Throne stands empty - or occupied by you. ` +
    `Silverado Valley is free, conquered, or something in between. ` +
    `Your choices have shaped this territory. Now live with the consequences.`
};

// =============================================================================
// TERRITORY TUTORIAL QUESTS (L26-32)
// Teach territory control mechanics
// =============================================================================

export const TUTORIAL_STAKING_CLAIM: QuestSeedData = {
  questId: 'tutorial:staking-your-claim',
  name: 'Staking Your Claim',
  description:
    `The territory system allows gangs and players to control zones across the frontier. ` +
    `Learn how to gain influence in a zone and what benefits control provides.`,
  type: 'side',
  levelRequired: 26,
  prerequisites: ['territory:silverado-strike'],
  objectives: [
    {
      id: 'visit-territory-map',
      description: 'View the Territory Control map',
      type: 'visit',
      target: 'location:territory-map-board',
      required: 1
    },
    {
      id: 'gain-influence',
      description: 'Gain 10 influence in any zone',
      type: 'collect',
      target: 'resource:influence',
      required: 10
    },
    {
      id: 'check-benefits',
      description: 'Check the zone benefit panel',
      type: 'visit',
      target: 'location:zone-benefits-panel',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 800 },
    { type: 'dollars', amount: 400 },
    { type: 'item', itemId: 'territory-claim-stake' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"See that map on the wall? Shows who controls what around here. Mining zones, ` +
    `trade routes, hideouts. Control a zone, get its benefits. Simple as that. ` +
    `Want to learn how it works?"`,
  dialogueComplete:
    `You understand the basics of territorial control. Influence determines who ` +
    `controls a zone, and control grants benefits. Now you can start building ` +
    `your own territorial power base.`
};

export const TUTORIAL_GANG_TERRITORY: QuestSeedData = {
  questId: 'tutorial:gang-territory',
  name: 'Gang Territory',
  description:
    `Gangs can control territory collectively, pooling influence and sharing benefits. ` +
    `Learn how gang ownership works and how to contribute to your gang's territorial goals.`,
  type: 'side',
  levelRequired: 27,
  prerequisites: ['tutorial:staking-your-claim'],
  objectives: [
    {
      id: 'view-gang-territory',
      description: 'View your gang\'s territorial holdings',
      type: 'visit',
      target: 'location:gang-territory-panel',
      required: 1
    },
    {
      id: 'contribute-influence',
      description: 'Contribute 20 influence to a gang-controlled zone',
      type: 'collect',
      target: 'resource:gang-influence',
      required: 20
    },
    {
      id: 'view-gang-benefits',
      description: 'View the benefits your gang provides',
      type: 'visit',
      target: 'location:gang-benefits-panel',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 900 },
    { type: 'dollars', amount: 450 },
    { type: 'item', itemId: 'gang-officers-badge' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Running with a gang ain't just about having backup in a fight. It's about ` +
    `territory. Your gang controls zones, you get a cut of the benefits. ` +
    `Let me show you how it works."`,
  dialogueComplete:
    `You understand gang territory now. Your contributions help your gang control ` +
    `more territory, and everyone shares in the benefits. A strong gang means ` +
    `strong territory - and strong territory means wealth and power.`
};

export const TUTORIAL_CONTESTED_GROUND: QuestSeedData = {
  questId: 'tutorial:contested-ground',
  name: 'Contested Ground',
  description:
    `Zones don't stay controlled forever. Other gangs and factions can contest your ` +
    `territory, leading to influence battles. Learn how contestation works.`,
  type: 'side',
  levelRequired: 28,
  prerequisites: ['tutorial:gang-territory'],
  objectives: [
    {
      id: 'find-contested-zone',
      description: 'Find a contested zone',
      type: 'visit',
      target: 'location:contested-zone',
      required: 1
    },
    {
      id: 'participate-contest',
      description: 'Participate in a territorial contest',
      type: 'kill',
      target: 'enemy:rival-gang-member',
      required: 3
    },
    {
      id: 'tip-balance',
      description: 'Tip the influence balance in your favor',
      type: 'collect',
      target: 'resource:contested-influence',
      required: 15
    }
  ],
  rewards: [
    { type: 'xp', amount: 1000 },
    { type: 'dollars', amount: 500 },
    { type: 'item', itemId: 'claim-defenders-rifle' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"See that zone there? Red marker means it's contested. Multiple gangs fighting ` +
    `for control. You want it, you gotta fight for it. Every point of influence ` +
    `matters when the battle's close."`,
  dialogueComplete:
    `You've experienced contested territory firsthand. When zones are contested, ` +
    `every action matters - combat, activities, even presence. Stay active in ` +
    `contested zones or watch them slip away.`
};

export const TUTORIAL_DECLARATION_OF_WAR: QuestSeedData = {
  questId: 'tutorial:declaration-of-war',
  name: 'Declaration of War',
  description:
    `When territorial disputes can't be settled by influence alone, gangs can declare ` +
    `formal war. Learn how the Gang War system works and what's at stake.`,
  type: 'side',
  levelRequired: 30,
  prerequisites: ['tutorial:contested-ground'],
  objectives: [
    {
      id: 'learn-war-system',
      description: 'Learn about the Gang War system',
      type: 'visit',
      target: 'npc:war-veteran',
      required: 1
    },
    {
      id: 'view-war-board',
      description: 'View the Gang War board',
      type: 'visit',
      target: 'location:gang-war-board',
      required: 1
    },
    {
      id: 'participate-war',
      description: 'Participate in a gang war (if available)',
      type: 'kill',
      target: 'gangwar:any',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1200 },
    { type: 'dollars', amount: 600 },
    { type: 'item', itemId: 'gang-war-armor' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Sometimes talking and scrapping in the streets ain't enough. Sometimes you ` +
    `gotta go to war. Full-on gang war - scheduled battles, territory at stake, ` +
    `the whole shebang. It's dangerous, but the rewards..."`,
  dialogueComplete:
    `You understand gang warfare now. Wars are declared, preparation phases begin, ` +
    `then battles determine the outcome. Territory changes hands. Wealth flows. ` +
    `And the frontier reshapes itself around the victors.`
};

export const TUTORIAL_EMPIRE_BUILDER: QuestSeedData = {
  questId: 'tutorial:empire-builder',
  name: 'Empire Builder',
  description:
    `Advanced territory control involves managing multiple zones, optimizing bonuses, ` +
    `and building a territorial empire. Learn the strategies of the territory masters.`,
  type: 'side',
  levelRequired: 32,
  prerequisites: ['tutorial:declaration-of-war'],
  objectives: [
    {
      id: 'control-three-zones',
      description: 'Help control at least 3 zones',
      type: 'collect',
      target: 'achievement:three-zones',
      required: 1
    },
    {
      id: 'optimize-bonuses',
      description: 'Stack complementary zone bonuses',
      type: 'visit',
      target: 'location:bonus-optimization-panel',
      required: 1
    },
    {
      id: 'strategic-expansion',
      description: 'Identify strategic expansion targets',
      type: 'collect',
      target: 'item:expansion-targets',
      required: 3
    }
  ],
  rewards: [
    { type: 'xp', amount: 1500 },
    { type: 'dollars', amount: 800 },
    { type: 'item', itemId: 'empire-builders-compass' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"You want to be more than a gang member. You want to build an empire. ` +
    `Control the right zones, stack the right bonuses, expand strategically. ` +
    `That's how you become a territorial power."`,
  dialogueComplete:
    `You've learned the art of territorial empire-building. Multiple zones, ` +
    `complementary bonuses, strategic expansion. The frontier is yours to shape - ` +
    `if you have the strength to hold what you claim.`
};

// =============================================================================
// FACTION-SPECIFIC SIDE QUESTS
// =============================================================================

// --- SETTLER SIDE QUESTS (3) ---

export const SETTLER_THE_MINING_COMPANY: QuestSeedData = {
  questId: 'settler:the-mining-company',
  name: 'The Mining Company',
  description:
    `The Settler Alliance wants to establish a legitimate mining company in Silverado - ` +
    `one that pays fair wages and respects claims. Help them navigate the chaos ` +
    `and establish order in the valley.`,
  type: 'side',
  levelRequired: 27,
  prerequisites: ['territory:silverado-strike'],
  objectives: [
    {
      id: 'meet-company-rep',
      description: 'Meet the Settler mining company representative',
      type: 'visit',
      target: 'npc:settler-company-rep',
      required: 1
    },
    {
      id: 'secure-claims',
      description: 'Help secure legitimate mining claims',
      type: 'collect',
      target: 'item:legitimate-claim-deed',
      required: 3
    },
    {
      id: 'establish-office',
      description: 'Establish a company office in Silverado',
      type: 'visit',
      target: 'location:settler-company-office',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1600 },
    { type: 'dollars', amount: 700 },
    { type: 'reputation', faction: 'settler', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A Settler representative approaches you. "The Alliance wants order in Silverado. ` +
    `Fair wages, legitimate claims, rule of law. Will you help us establish ` +
    `a proper mining company?"`,
  dialogueComplete:
    `The Settler Mining Company is established. Not everyone is happy - the chaos ` +
    `was profitable for some - but order brings stability. And stability brings ` +
    `prosperity.`
};

export const SETTLER_WORKERS_RIGHTS: QuestSeedData = {
  questId: 'settler:workers-rights',
  name: 'Workers\' Rights',
  description:
    `The miners are organizing for better conditions. The Baron's gone, but his ` +
    `legacy of exploitation remains. Help the workers establish their rights ` +
    `and form a proper miners' union.`,
  type: 'side',
  levelRequired: 29,
  prerequisites: ['territory:silver-barons-empire'],
  objectives: [
    {
      id: 'meet-organizer',
      description: 'Meet the union organizer',
      type: 'visit',
      target: 'npc:union-organizer',
      required: 1
    },
    {
      id: 'gather-signatures',
      description: 'Gather miner signatures for the union charter',
      type: 'collect',
      target: 'item:union-signature',
      required: 20
    },
    {
      id: 'negotiate-terms',
      description: 'Negotiate terms with mine owners',
      type: 'visit',
      target: 'npc:mine-owner-council',
      required: 1
    },
    {
      id: 'establish-union',
      description: 'Establish the Miners\' Union',
      type: 'visit',
      target: 'location:union-hall',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2000 },
    { type: 'dollars', amount: 900 },
    { type: 'reputation', faction: 'settler', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Whitmore's gone, but nothing's changed for us. Twelve-hour shifts, dangerous ` +
    `conditions, pay that barely covers the company store. We need a union. ` +
    `We need rights. Will you help us?"`,
  dialogueComplete:
    `The Miners' Union stands. Workers have rights now - fair pay, safe conditions, ` +
    `proper equipment. It wasn't easy, but labor organized is labor empowered.`
};

export const SETTLER_RAILROADS_LEGACY: QuestSeedData = {
  questId: 'settler:railroads-legacy',
  name: 'The Railroad\'s Legacy',
  description:
    `With the Railroad Tycoons defeated, their assets remain unclaimed. The Settler ` +
    `Alliance wants to repurpose the railroad infrastructure for the people. ` +
    `Help them claim and restore the abandoned rail lines.`,
  type: 'side',
  levelRequired: 31,
  prerequisites: ['territory:the-tribes-unite'],
  objectives: [
    {
      id: 'survey-railroads',
      description: 'Survey the abandoned railroad assets',
      type: 'visit',
      target: 'location:abandoned-rail-depot',
      required: 1
    },
    {
      id: 'clear-obstacles',
      description: 'Clear obstacles from rail lines',
      type: 'kill',
      target: 'enemy:rail-squatters',
      required: 5
    },
    {
      id: 'restore-depot',
      description: 'Help restore the main depot',
      type: 'collect',
      target: 'item:railroad-supplies',
      required: 10
    },
    {
      id: 'establish-service',
      description: 'Establish passenger and freight service',
      type: 'visit',
      target: 'npc:railroad-manager',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2400 },
    { type: 'dollars', amount: 1200 },
    { type: 'reputation', faction: 'settler', amount: 35 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Blackwood's gone, but his trains still sit rusting in the yard. That infrastructure ` +
    `could serve the people instead of exploiting them. Help us restore the railroad ` +
    `as a public service."`,
  dialogueComplete:
    `The railroad runs again - this time for the people. Freight and passengers ` +
    `flow through Silverado Valley, connecting communities instead of exploiting them. ` +
    `Blackwood would be furious. That's how you know it's right.`
};

// --- NAHI SIDE QUESTS (3) ---

export const NAHI_ANCESTRAL_SILVER: QuestSeedData = {
  questId: 'nahi:ancestral-silver',
  name: 'Ancestral Silver',
  description:
    `The Nahi knew about the silver long before the settlers. Their ancestors mined ` +
    `it carefully, taking only what they needed. Help the tribes reclaim their ` +
    `ancestral mining rights and traditional methods.`,
  type: 'side',
  levelRequired: 27,
  prerequisites: ['territory:silverado-strike'],
  objectives: [
    {
      id: 'meet-elder',
      description: 'Meet the Nahi mining elder',
      type: 'visit',
      target: 'npc:nahi-mining-elder',
      required: 1
    },
    {
      id: 'find-ancestral-sites',
      description: 'Find ancestral mining sites',
      type: 'visit',
      target: 'location:ancestral-mine',
      required: 3
    },
    {
      id: 'learn-methods',
      description: 'Learn traditional mining methods',
      type: 'collect',
      target: 'item:traditional-mining-knowledge',
      required: 5
    },
    {
      id: 'establish-claim',
      description: 'Establish Nahi mining claims',
      type: 'visit',
      target: 'location:nahi-claim-office',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1600 },
    { type: 'dollars', amount: 700 },
    { type: 'reputation', faction: 'nahi', amount: 25 },
    { type: 'item', itemId: 'sacred-silver-ore' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `An elder speaks: "Our ancestors knew these mountains. They took silver with ` +
    `respect, leaving gifts for the mountain spirits. We will show you the old ways - ` +
    `if you help us reclaim what is ours."`,
  dialogueComplete:
    `The ancestral mining sites are reclaimed. The Nahi mine silver the old way - ` +
    `sustainably, respectfully. It's slower, but the silver they produce is purer, ` +
    `and the mountain spirits are appeased.`
};

export const NAHI_FIVE_TRIBES_COUNCIL: QuestSeedData = {
  questId: 'nahi:five-tribes-council',
  name: 'The Five Tribes Council',
  description:
    `Iron Wolf has united the tribes for war, but some elders question his methods. ` +
    `Attend the Five Tribes Council and help shape the Nahi Coalition's future - ` +
    `whether that means war, peace, or something in between.`,
  type: 'side',
  levelRequired: 29,
  prerequisites: ['territory:sacred-silver'],
  objectives: [
    {
      id: 'receive-invitation',
      description: 'Receive an invitation to the Council',
      type: 'collect',
      target: 'item:council-invitation',
      required: 1
    },
    {
      id: 'attend-council',
      description: 'Attend the Five Tribes Council',
      type: 'visit',
      target: 'location:five-tribes-council',
      required: 1
    },
    {
      id: 'speak-to-tribes',
      description: 'Speak with representatives of each tribe',
      type: 'visit',
      target: 'npc:tribal-representatives',
      required: 5
    },
    {
      id: 'influence-outcome',
      description: 'Influence the Council\'s decision',
      type: 'visit',
      target: 'decision:council-outcome',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2000 },
    { type: 'dollars', amount: 900 },
    { type: 'reputation', faction: 'nahi', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `A peace pipe is passed around the fire. Five tribes sit in council - Kaiowa, ` +
    `Comanche, Pueblo, Apache, and Plains Hunters. Iron Wolf argues for war. ` +
    `Others call for peace. Your voice might tip the balance.`,
  dialogueComplete:
    `The Council has spoken. Whether they chose war, peace, or a path between, ` +
    `your influence shaped their decision. The Nahi Coalition moves forward - ` +
    `united or divided by the choice made here.`
};

export const NAHI_IRON_WOLFS_PATH: QuestSeedData = {
  questId: 'nahi:iron-wolfs-path',
  name: 'Iron Wolf\'s Path',
  description:
    `Learn the story of Iron Wolf - how he became the fierce war chief, what ` +
    `drives his rage, and whether there's any path to peace with him. ` +
    `Walk in his footsteps and understand the man behind the legend.`,
  type: 'side',
  levelRequired: 31,
  prerequisites: ['territory:war-chiefs-warning'],
  objectives: [
    {
      id: 'learn-history',
      description: 'Learn Iron Wolf\'s history',
      type: 'visit',
      target: 'npc:iron-wolf-historian',
      required: 1
    },
    {
      id: 'visit-fathers-grave',
      description: 'Visit his father\'s grave on Sacred Mountain',
      type: 'visit',
      target: 'location:wolf-fathers-grave',
      required: 1
    },
    {
      id: 'understand-oath',
      description: 'Understand his blood oath',
      type: 'collect',
      target: 'item:blood-oath-knowledge',
      required: 1
    },
    {
      id: 'find-peace-path',
      description: 'Find a path to peace (if one exists)',
      type: 'visit',
      target: 'decision:iron-wolf-peace',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2400 },
    { type: 'dollars', amount: 1100 },
    { type: 'reputation', faction: 'nahi', amount: 35 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"You want to understand Iron Wolf? Then walk his path. See the grave where ` +
    `his father fell. Hear the oath he swore in blood. Only then might you ` +
    `find a way to reach him."`,
  dialogueComplete:
    `You understand Iron Wolf now. His rage is born of grief, his war of love. ` +
    `Whether peace is possible... that depends on what you're willing to offer, ` +
    `and what he's willing to accept.`
};

// --- FRONTERA SIDE QUESTS (2) ---

export const FRONTERA_EL_COYOTES_CUT: QuestSeedData = {
  questId: 'frontera:el-coyotes-cut',
  name: 'El Coyote\'s Cut',
  description:
    `El Coyote and his bandidos see opportunity in the Silverado chaos. They're ` +
    `moving silver across the border, cutting out both the Baron and the law. ` +
    `Work with them to establish a smuggling operation - for a cut, of course.`,
  type: 'side',
  levelRequired: 28,
  prerequisites: ['territory:the-barons-offer'],
  objectives: [
    {
      id: 'meet-el-coyote',
      description: 'Meet El Coyote at the border',
      type: 'visit',
      target: 'npc:el-coyote',
      required: 1
    },
    {
      id: 'establish-route',
      description: 'Establish a smuggling route',
      type: 'visit',
      target: 'location:smuggling-route',
      required: 1
    },
    {
      id: 'complete-run',
      description: 'Complete a smuggling run',
      type: 'deliver',
      target: 'npc:mexican-buyer',
      required: 1
    },
    {
      id: 'collect-payment',
      description: 'Collect your cut',
      type: 'collect',
      target: 'item:smuggling-payment',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1800 },
    { type: 'dollars', amount: 1000 },
    { type: 'reputation', faction: 'frontera', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `El Coyote grins through his mustache. "The gringos fight over silver while ` +
    `we move it south. The Baron wants his cut? The law wants their taxes? ` +
    `We give them nothing. You want in, amigo?"`,
  dialogueComplete:
    `The smuggling route is established. Silver flows south, gold flows north. ` +
    `El Coyote takes his cut, you take yours. It's not legal, but it's profitable. ` +
    `And in Silverado, profit is king.`
};

export const FRONTERA_SMUGGLERS_NETWORK: QuestSeedData = {
  questId: 'frontera:smugglers-network',
  name: 'The Smuggler\'s Network',
  description:
    `El Coyote's operation has grown. He's building a network of safe houses, ` +
    `bribes, and connections throughout the territory. Help expand the network ` +
    `and become a key player in the border trade.`,
  type: 'side',
  levelRequired: 30,
  prerequisites: ['frontera:el-coyotes-cut'],
  objectives: [
    {
      id: 'establish-safe-houses',
      description: 'Establish safe houses along the route',
      type: 'visit',
      target: 'location:safe-house-locations',
      required: 3
    },
    {
      id: 'bribe-officials',
      description: 'Bribe key officials to look the other way',
      type: 'collect',
      target: 'item:official-bribe',
      required: 5
    },
    {
      id: 'recruit-mules',
      description: 'Recruit reliable mules for the runs',
      type: 'visit',
      target: 'npc:potential-mules',
      required: 5
    },
    {
      id: 'test-network',
      description: 'Test the full network with a major shipment',
      type: 'deliver',
      target: 'npc:network-test-buyer',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2200 },
    { type: 'dollars', amount: 1500 },
    { type: 'reputation', faction: 'frontera', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `El Coyote unfolds a map. "One route is good. A network is better. Safe houses, ` +
    `friendly officials, reliable people. Help me build this, and you become ` +
    `more than a runner. You become a partner."`,
  dialogueComplete:
    `The network is complete. Silver, gold, information - anything can flow through ` +
    `these channels. You've become a key player in the border trade, with all ` +
    `the risks and rewards that entails.`
};

// =============================================================================
// EXPORTS
// =============================================================================

export const HEART_OF_TERRITORY_QUESTS: QuestSeedData[] = [
  // Universal Main Arc
  TERRITORY_SILVERADO_STRIKE,
  TERRITORY_CLAIM_JUMPERS_PARADISE,
  TERRITORY_THE_JUMPER_KING,
  TERRITORY_A_BARON_RISES,
  TERRITORY_THE_BARONS_OFFER,
  TERRITORY_UNDERGROUND_ECONOMY,
  TERRITORY_SACRED_SILVER,
  TERRITORY_SILVER_BARONS_EMPIRE,
  TERRITORY_WAR_CHIEFS_WARNING,
  TERRITORY_THE_TRIBES_UNITE,
  TERRITORY_BLOOD_FOR_SILVER,
  TERRITORY_HEART_OF_TERRITORY,
  // Territory Tutorials
  TUTORIAL_STAKING_CLAIM,
  TUTORIAL_GANG_TERRITORY,
  TUTORIAL_CONTESTED_GROUND,
  TUTORIAL_DECLARATION_OF_WAR,
  TUTORIAL_EMPIRE_BUILDER,
  // Settler Side Quests
  SETTLER_THE_MINING_COMPANY,
  SETTLER_WORKERS_RIGHTS,
  SETTLER_RAILROADS_LEGACY,
  // Nahi Side Quests
  NAHI_ANCESTRAL_SILVER,
  NAHI_FIVE_TRIBES_COUNCIL,
  NAHI_IRON_WOLFS_PATH,
  // Frontera Side Quests
  FRONTERA_EL_COYOTES_CUT,
  FRONTERA_SMUGGLERS_NETWORK
];

/**
 * Get Heart of Territory quest by ID
 */
export function getHeartOfTerritoryQuest(questId: string): QuestSeedData | undefined {
  return HEART_OF_TERRITORY_QUESTS.find(q => q.questId === questId);
}

/**
 * Get Heart of Territory quests by level range
 */
export function getHeartOfTerritoryQuestsByLevel(
  minLevel: number,
  maxLevel: number
): QuestSeedData[] {
  return HEART_OF_TERRITORY_QUESTS.filter(
    q => q.levelRequired >= minLevel && q.levelRequired <= maxLevel
  );
}

/**
 * Get Heart of Territory quests by type
 */
export function getHeartOfTerritoryQuestsByType(type: 'main' | 'side'): QuestSeedData[] {
  return HEART_OF_TERRITORY_QUESTS.filter(q => q.type === type);
}

/**
 * Get faction-specific quests
 */
export function getHeartOfTerritoryFactionQuests(faction: string): QuestSeedData[] {
  const prefix = `${faction}:`;
  return HEART_OF_TERRITORY_QUESTS.filter(q => q.questId.startsWith(prefix));
}
