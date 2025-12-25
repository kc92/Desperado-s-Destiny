/**
 * Greenhorn's Trail - Phase 19.2 Quests
 * 25 quests covering L1-15 content pack
 *
 * Quest Categories:
 * - Skill Tutorials (6 quests, L3-8): Survival + Craft focused
 * - Faction War Prologue (15 quests, L11-15): Building toward faction conflict
 * - Side Quests (4 quests, L11-14): Optional variety
 *
 * Factions Involved:
 * - Settler Alliance
 * - Nahi Coalition (5 tribes)
 * - Frontera
 * - Railroad Tycoons (new antagonist)
 */

import { QuestSeedData } from '../../models/Quest.model';

// =============================================================================
// SKILL TUTORIAL QUESTS (6 quests, L3-8)
// Survival and Crafting focused introductions
// =============================================================================

export const TUTORIAL_HUNTING_BASICS: QuestSeedData = {
  questId: 'tutorial:hunting-basics',
  name: 'The Way of the Hunter',
  description:
    `Old Man Cody at the general store needs fresh meat to sell. He's offering to teach you the basics ` +
    `of hunting in exchange for bringing back your first kill. Learn to track, stalk, and take down prey.`,
  type: 'side',
  levelRequired: 3,
  prerequisites: ['newcomers-trail:02-three-roads'],
  objectives: [
    {
      id: 'learn-tracking',
      description: 'Learn tracking basics from Old Man Cody',
      type: 'visit',
      target: 'npc:old-man-cody',
      required: 1
    },
    {
      id: 'find-tracks',
      description: 'Find animal tracks near Red Gulch',
      type: 'skill',
      target: 'skill:tracking',
      required: 1
    },
    {
      id: 'hunt-deer',
      description: 'Successfully hunt a deer',
      type: 'kill',
      target: 'npc:wild-deer',
      required: 1
    },
    {
      id: 'deliver-meat',
      description: 'Deliver the venison to Old Man Cody',
      type: 'deliver',
      target: 'npc:old-man-cody',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 200 },
    { type: 'dollars', amount: 75 },
    { type: 'item', itemId: 'rusty-hunting-rifle' },
    { type: 'item', itemId: 'hunters-instinct-tea' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"You want to survive out here, you gotta learn to hunt. The land provides - if you know ` +
    `how to take. Let me show you the basics. First, we find tracks..."`,
  dialogueComplete:
    `"Not bad for a greenhorn! You've got the instinct. Keep at it and you'll be a proper ` +
    `frontiersman in no time. Here's your pay - and a little something extra."`
};

export const TUTORIAL_MINING_FUNDAMENTALS: QuestSeedData = {
  questId: 'tutorial:mining-fundamentals',
  name: 'Strike It Rich',
  description:
    `Prospector Jenkins has a mining claim that needs working. Help him extract ore and he'll ` +
    `teach you the fundamentals of mining - from finding veins to processing ore.`,
  type: 'side',
  levelRequired: 4,
  prerequisites: ['tutorial:hunting-basics'],
  objectives: [
    {
      id: 'meet-jenkins',
      description: 'Meet Prospector Jenkins at Copper Creek',
      type: 'visit',
      target: 'location:copper-creek-mine',
      required: 1
    },
    {
      id: 'learn-prospecting',
      description: 'Learn how to identify ore veins',
      type: 'skill',
      target: 'skill:prospecting',
      required: 1
    },
    {
      id: 'mine-copper',
      description: 'Mine copper ore (10 pieces)',
      type: 'collect',
      target: 'item:copper-ore',
      required: 10
    },
    {
      id: 'return-ore',
      description: 'Return the ore to Prospector Jenkins',
      type: 'deliver',
      target: 'npc:prospector-jenkins',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 225 },
    { type: 'dollars', amount: 85 },
    { type: 'item', itemId: 'miners-pickaxe' },
    { type: 'item', itemId: 'miners-tonic' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Mining ain't just swinging a pickaxe, boy. You gotta know where to dig. See that ` +
    `greenish tint in the rock? That's copper showing through. Let me show you..."`,
  dialogueComplete:
    `"You've got a good eye! Keep this pickaxe - she's served me well. Maybe you'll find ` +
    `your fortune in these hills. Lord knows I never did."`
};

export const TUTORIAL_COOKING_CAMPFIRE: QuestSeedData = {
  questId: 'tutorial:cooking-campfire',
  name: 'Trail Cooking',
  description:
    `Cookie McGee at the wagon train is looking for an assistant. Learn to cook over an open ` +
    `fire, prepare trail food, and keep a camp fed during long journeys.`,
  type: 'side',
  levelRequired: 5,
  prerequisites: ['tutorial:mining-fundamentals'],
  objectives: [
    {
      id: 'find-cookie',
      description: 'Find Cookie McGee at the wagon camp',
      type: 'visit',
      target: 'location:wagon-camp',
      required: 1
    },
    {
      id: 'gather-ingredients',
      description: 'Gather ingredients: venison, wild herbs, and water',
      type: 'collect',
      target: 'item:cooking-ingredients',
      required: 3
    },
    {
      id: 'cook-stew',
      description: 'Cook a proper camp stew',
      type: 'skill',
      target: 'skill:cooking',
      required: 1
    },
    {
      id: 'feed-wagon-train',
      description: 'Serve the stew to the wagon train crew',
      type: 'deliver',
      target: 'npc:wagon-train-crew',
      required: 5
    }
  ],
  rewards: [
    { type: 'xp', amount: 250 },
    { type: 'dollars', amount: 90 },
    { type: 'item', itemId: 'campfire-skillet' },
    { type: 'item', itemId: 'travelers-rations' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"A man who can cook is never hungry and never without friends! Let me teach you ` +
    `the secrets of the trail. First rule: hot food keeps morale up. Second rule: ` +
    `always season with a little whiskey."`,
  dialogueComplete:
    `"You've got the touch, kid! Take this skillet - treat her right and she'll never ` +
    `let you down. Now get out there and make sure no one goes hungry!"`
};

export const TUTORIAL_BLACKSMITHING_INTRO: QuestSeedData = {
  questId: 'tutorial:blacksmithing-intro',
  name: 'Hammer and Anvil',
  description:
    `Magnus O'Malley at the Whiskey Bend forge needs an apprentice for the day. Learn the ` +
    `basics of smithing - heating metal, shaping it, and creating tools and weapons.`,
  type: 'side',
  levelRequired: 6,
  prerequisites: ['tutorial:cooking-campfire'],
  objectives: [
    {
      id: 'report-magnus',
      description: "Report to Magnus at the Whiskey Bend forge",
      type: 'visit',
      target: 'npc:magnus-omalley',
      required: 1
    },
    {
      id: 'learn-forge',
      description: 'Learn to operate the forge safely',
      type: 'skill',
      target: 'skill:smithing',
      required: 1
    },
    {
      id: 'collect-iron',
      description: 'Collect iron ore for the lesson',
      type: 'collect',
      target: 'item:iron-ore',
      required: 5
    },
    {
      id: 'forge-horseshoes',
      description: 'Forge a set of horseshoes',
      type: 'skill',
      target: 'skill:smithing',
      required: 1
    },
    {
      id: 'repair-tools',
      description: 'Repair damaged farm tools for Magnus',
      type: 'skill',
      target: 'skill:smithing',
      required: 3
    }
  ],
  rewards: [
    { type: 'xp', amount: 300 },
    { type: 'dollars', amount: 100 },
    { type: 'item', itemId: 'apprentice-hammer' },
    { type: 'item', itemId: 'forge-fire-salve' },
    { type: 'reputation', faction: 'settler', amount: 15 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Magnus wipes soot from his face. "So you want to learn the trade? Good. The forge is ` +
    `the heart of civilization. Every tool, every weapon, every wheel - it all starts here. ` +
    `Now grab that bellows and let's get to work."`,
  dialogueComplete:
    `"You've done well, apprentice. The fire respects you. Take this hammer - it was mine ` +
    `when I was learning. May it serve you as well as it served me."`
};

export const TUTORIAL_HERBAL_MEDICINE: QuestSeedData = {
  questId: 'tutorial:herbal-medicine',
  name: 'Nature\'s Pharmacy',
  description:
    `Doc Whitfield is overwhelmed with patients and needs help gathering and preparing ` +
    `herbal remedies. Learn to identify medicinal plants and create basic treatments.`,
  type: 'side',
  levelRequired: 7,
  prerequisites: ['tutorial:blacksmithing-intro'],
  objectives: [
    {
      id: 'visit-doc',
      description: 'Visit Doc Whitfield at the Red Gulch clinic',
      type: 'visit',
      target: 'npc:doc-whitfield',
      required: 1
    },
    {
      id: 'gather-herbs',
      description: 'Gather wild herbs from the hills',
      type: 'collect',
      target: 'item:wild-herbs',
      required: 10
    },
    {
      id: 'find-rare-sage',
      description: 'Find rare sage for advanced remedies',
      type: 'collect',
      target: 'item:rare-sage',
      required: 3
    },
    {
      id: 'prepare-remedies',
      description: 'Prepare herbal remedies under Doc\'s guidance',
      type: 'skill',
      target: 'skill:medicine',
      required: 1
    },
    {
      id: 'treat-patient',
      description: 'Help treat a patient with your remedies',
      type: 'visit',
      target: 'npc:sick-settler',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 325 },
    { type: 'dollars', amount: 110 },
    { type: 'item', itemId: 'herbal-pouch-vest' },
    { type: 'item', itemId: 'herbal-remedy' },
    { type: 'reputation', faction: 'settler', amount: 20 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Doc Whitfield looks exhausted. "Thank God you're here. I've got patients coming out ` +
    `my ears and I'm low on supplies. Help me gather some herbs and I'll teach you how ` +
    `to save a life - no fancy medical degree required."`,
  dialogueComplete:
    `"You've got healing hands, friend. Take this vest - it'll keep your herbs fresh ` +
    `and close at hand. Remember: the best medicine is prevention, but failing that, ` +
    `a good remedy will do."`
};

export const TUTORIAL_ADVANCED_SURVIVAL: QuestSeedData = {
  questId: 'tutorial:advanced-survival',
  name: 'Frontier Survivor',
  description:
    `A mountain man named "Grizzly" Dan offers to teach you advanced survival techniques. ` +
    `Spend a day in the wilderness learning to handle weather, find water, and stay alive.`,
  type: 'side',
  levelRequired: 8,
  prerequisites: ['tutorial:herbal-medicine'],
  objectives: [
    {
      id: 'find-grizzly-dan',
      description: 'Find Grizzly Dan in the wilderness',
      type: 'visit',
      target: 'location:wilderness-camp',
      required: 1
    },
    {
      id: 'build-shelter',
      description: 'Build a survival shelter',
      type: 'skill',
      target: 'skill:survival',
      required: 1
    },
    {
      id: 'find-water',
      description: 'Find and purify water',
      type: 'skill',
      target: 'skill:survival',
      required: 1
    },
    {
      id: 'survive-storm',
      description: 'Survive a desert storm overnight',
      type: 'skill',
      target: 'skill:survival',
      required: 1
    },
    {
      id: 'return-town',
      description: 'Return to town to prove your survival',
      type: 'visit',
      target: 'location:red-gulch',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 400 },
    { type: 'dollars', amount: 125 },
    { type: 'item', itemId: 'survival-duster' },
    { type: 'item', itemId: 'frontier-feast' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Grizzly Dan eyes you up and down. "You want to learn survival? Real survival? ` +
    `Then follow me into the wild and don't complain. The frontier doesn't care about ` +
    `your comfort. But if you listen, you'll never fear it again."`,
  dialogueComplete:
    `"You made it. Most don't. Here - this duster saved my life more times than I can ` +
    `count. Now it's yours. Remember: the land isn't your enemy. Ignorance is."`
};

// =============================================================================
// FACTION WAR PROLOGUE - ARC 1: THE CALM BEFORE (L11-12)
// =============================================================================

export const WAR_PROLOGUE_RAILROAD_ARRIVES: QuestSeedData = {
  questId: 'war-prologue:railroad-arrives',
  name: 'Iron Horse Coming',
  description:
    `A delegation from the Pacific & Sangre Railroad has arrived in Red Gulch. Their ` +
    `representatives are meeting with local leaders. Everyone wants to know what this ` +
    `means for the territory's future.`,
  type: 'main',
  levelRequired: 11,
  prerequisites: ['newcomers-trail:10-path-forward'],
  objectives: [
    {
      id: 'attend-announcement',
      description: 'Attend the railroad announcement at Town Hall',
      type: 'visit',
      target: 'location:red-gulch-town-hall',
      required: 1
    },
    {
      id: 'talk-settlers',
      description: 'Gauge settler reaction to the railroad',
      type: 'visit',
      target: 'npc:settler-representative',
      required: 1
    },
    {
      id: 'talk-railroad',
      description: 'Speak with Railroad representative Henry Blackwood',
      type: 'visit',
      target: 'npc:henry-blackwood',
      required: 1
    },
    {
      id: 'report-sheriff',
      description: 'Report your observations to Sheriff Thornton',
      type: 'deliver',
      target: 'npc:sheriff-clay-thornton',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 450 },
    { type: 'dollars', amount: 150 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The railroad men came in on the morning coach - expensive suits, gold watches, and ` +
    `smiles that don't reach their eyes. They're promising jobs, progress, and prosperity. ` +
    `But something about Henry Blackwood's handshake feels wrong.`,
  dialogueComplete:
    `Sheriff Thornton listens carefully. "The railroad brings money and trouble in equal ` +
    `measure. We'll need level heads to navigate what's coming. Keep your eyes open."`
};

export const WAR_PROLOGUE_NATIVE_CONCERNS: QuestSeedData = {
  questId: 'war-prologue:native-concerns',
  name: 'Voices of the Land',
  description:
    `The Nahi Coalition tribes are alarmed by railroad surveying parties crossing sacred ` +
    `lands. Running Fox has called a meeting to hear concerns from all five tribes.`,
  type: 'main',
  levelRequired: 11,
  prerequisites: ['war-prologue:railroad-arrives'],
  objectives: [
    {
      id: 'visit-kaiowa',
      description: 'Hear the Kaiowa elders\' concerns at the mesa',
      type: 'visit',
      target: 'npc:soaring-eagle',
      required: 1
    },
    {
      id: 'observe-raiders',
      description: 'Observe a Comanche Raider war council',
      type: 'visit',
      target: 'npc:iron-horse',
      required: 1
    },
    {
      id: 'visit-traders',
      description: 'Speak with Pueblo Traders about economic concerns',
      type: 'visit',
      target: 'npc:walking-between',
      required: 1
    },
    {
      id: 'witness-warband',
      description: 'Witness Apache War Band demands for action',
      type: 'visit',
      target: 'npc:burning-sky',
      required: 1
    },
    {
      id: 'talk-hunters',
      description: 'Hear the Plains Hunters\' perspective',
      type: 'visit',
      target: 'npc:gray-buffalo',
      required: 1
    },
    {
      id: 'report-running-fox',
      description: 'Report to Running Fox with observations',
      type: 'deliver',
      target: 'npc:running-fox',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 500 },
    { type: 'dollars', amount: 125 },
    { type: 'reputation', faction: 'nahi', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Five tribes, five perspectives. The Kaiowa pray for peace. The Raiders sharpen their ` +
    `weapons. The Traders seek compromise. The War Band demands blood. The Hunters just ` +
    `want to be left alone. Can the Coalition hold together?`,
  dialogueComplete:
    `Running Fox's face is troubled. "The Coalition is cracking. We must find common ground ` +
    `or we will fall separately. Thank you for bearing witness. Your words carry weight."`
};

export const WAR_PROLOGUE_SETTLER_EXPANSION: QuestSeedData = {
  questId: 'war-prologue:settler-expansion',
  name: 'Manifest Destiny',
  description:
    `The Settler Alliance is pushing new homesteaders into disputed territories. Help ` +
    `escort a wagon train while learning about settler ambitions and fears.`,
  type: 'main',
  levelRequired: 11,
  prerequisites: ['war-prologue:railroad-arrives'],
  objectives: [
    {
      id: 'meet-wagon-master',
      description: 'Meet the wagon master at Red Gulch',
      type: 'visit',
      target: 'npc:wagon-master',
      required: 1
    },
    {
      id: 'escort-wagons',
      description: 'Escort the wagon train through dangerous territory',
      type: 'visit',
      target: 'location:disputed-territory',
      required: 1
    },
    {
      id: 'defend-attack',
      description: 'Defend against raider attacks',
      type: 'kill',
      target: 'npc:hostile-raider',
      required: 5
    },
    {
      id: 'talk-homesteaders',
      description: 'Learn about the homesteaders\' hopes and fears',
      type: 'visit',
      target: 'npc:homesteader-family',
      required: 3
    },
    {
      id: 'reach-destination',
      description: 'Reach the new settlement site',
      type: 'visit',
      target: 'location:new-settlement',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 475 },
    { type: 'dollars', amount: 175 },
    { type: 'reputation', faction: 'settler', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The homesteaders are full of hope - land of their own, a fresh start, the American ` +
    `dream. They don't talk much about who lived here before, or what "manifest destiny" ` +
    `really means for those in the way.`,
  dialogueComplete:
    `The wagon master shakes your hand. "Couldn't have done it without you. These folks ` +
    `deserve a chance at a new life. I just hope they can keep what they're building."`
};

export const WAR_PROLOGUE_FRONTERA_OPPORTUNITY: QuestSeedData = {
  questId: 'war-prologue:frontera-opportunity',
  name: 'Opportunity Knocks',
  description:
    `Don Esteban sees profit in the coming conflict. He's positioning the Frontera to ` +
    `supply all sides with goods, information, and... other services. Help him set up ` +
    `his network and learn how the Frontera really operates.`,
  type: 'main',
  levelRequired: 12,
  prerequisites: ['war-prologue:native-concerns', 'war-prologue:settler-expansion'],
  objectives: [
    {
      id: 'meet-don',
      description: 'Meet Don Esteban at the Frontera cantina',
      type: 'visit',
      target: 'npc:don-esteban',
      required: 1
    },
    {
      id: 'establish-contact-settler',
      description: 'Establish a secret contact with settler merchants',
      type: 'visit',
      target: 'npc:settler-merchant',
      required: 1
    },
    {
      id: 'establish-contact-native',
      description: 'Establish a secret contact with Pueblo traders',
      type: 'visit',
      target: 'npc:pueblo-trader',
      required: 1
    },
    {
      id: 'deliver-weapons',
      description: 'Deliver "agricultural tools" to a mysterious buyer',
      type: 'deliver',
      target: 'npc:mysterious-buyer',
      required: 1
    },
    {
      id: 'return-don',
      description: 'Return to Don Esteban with the profits',
      type: 'deliver',
      target: 'npc:don-esteban',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 500 },
    { type: 'dollars', amount: 250 },
    { type: 'reputation', faction: 'frontera', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Don Esteban pours two glasses of fine tequila. "War is coming, amigo. I can smell it. ` +
    `And in war, the smart survive by selling to everyone. Help me build my network, and ` +
    `we'll both profit handsomely."`,
  dialogueComplete:
    `"Excellent work! You have a gift for this. The Frontera will be ready when the storm ` +
    `breaks. And our friends - on all sides - will remember who helped them."`
};

export const WAR_PROLOGUE_FIRST_TENSIONS: QuestSeedData = {
  questId: 'war-prologue:first-tensions',
  name: 'First Spark',
  description:
    `A minor dispute at the water crossing has escalated. Railroad surveyors and Nahi ` +
    `hunters are facing off, and settlers are taking sides. Someone needs to defuse ` +
    `the situation before it explodes.`,
  type: 'main',
  levelRequired: 12,
  prerequisites: ['war-prologue:frontera-opportunity'],
  objectives: [
    {
      id: 'reach-crossing',
      description: 'Reach Dusty Crossing before violence erupts',
      type: 'visit',
      target: 'location:dusty-crossing',
      required: 1
    },
    {
      id: 'assess-situation',
      description: 'Assess the situation from both sides',
      type: 'visit',
      target: 'npc:standoff-participants',
      required: 2
    },
    {
      id: 'negotiate',
      description: 'Attempt to negotiate a peaceful resolution',
      type: 'skill',
      target: 'skill:persuasion',
      required: 1
    },
    {
      id: 'resolve-conflict',
      description: 'Resolve the conflict (peacefully or by force)',
      type: 'skill',
      target: 'choice:resolution',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 550 },
    { type: 'dollars', amount: 175 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Shouts echo across the water. The railroad surveyor claims he has legal rights. ` +
    `The Nahi hunter says this is sacred fishing ground. Both have drawn weapons. ` +
    `This could be the spark that ignites everything.`,
  dialogueComplete:
    `The crisis is averted - for now. But the tension remains. Everyone knows this ` +
    `was just the first of many confrontations to come.`
};

// =============================================================================
// FACTION WAR PROLOGUE - ARC 2: LINES IN THE SAND (L12-13)
// =============================================================================

export const WAR_PROLOGUE_RAILROAD_DEMANDS: QuestSeedData = {
  questId: 'war-prologue:railroad-demands',
  name: 'Terms and Conditions',
  description:
    `The Railroad Tycoons have issued demands: all land within ten miles of the proposed ` +
    `route must be surrendered. They're offering compensation, but at insultingly low prices.`,
  type: 'main',
  levelRequired: 12,
  prerequisites: ['war-prologue:first-tensions'],
  objectives: [
    {
      id: 'receive-notice',
      description: 'Receive the railroad\'s formal notice at Town Hall',
      type: 'visit',
      target: 'location:red-gulch-town-hall',
      required: 1
    },
    {
      id: 'interview-affected',
      description: 'Interview affected landowners',
      type: 'visit',
      target: 'npc:affected-landowner',
      required: 3
    },
    {
      id: 'investigate-railroad',
      description: 'Investigate railroad methods in other territories',
      type: 'skill',
      target: 'skill:investigation',
      required: 1
    },
    {
      id: 'report-findings',
      description: 'Report your findings to community leaders',
      type: 'deliver',
      target: 'npc:community-leader',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 500 },
    { type: 'dollars', amount: 150 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The railroad's demands are posted on every door. The compensation offered is a ` +
    `fraction of true value. Those who refuse will be "legally compelled." The message ` +
    `is clear: sell or be destroyed.`,
  dialogueComplete:
    `The evidence is damning. In three other territories, the railroad used force when ` +
    `legal pressure failed. Burned homesteads. Missing people. But proving it is another ` +
    `matter entirely.`
};

export const WAR_PROLOGUE_SACRED_GROUND: QuestSeedData = {
  questId: 'war-prologue:sacred-ground',
  name: 'Where Ancestors Sleep',
  description:
    `The railroad route passes directly through Kaiowa burial grounds. The tribe has ` +
    `declared they will die before allowing desecration. Help negotiate or witness ` +
    `the beginning of open conflict.`,
  type: 'main',
  levelRequired: 13,
  prerequisites: ['war-prologue:railroad-demands'],
  objectives: [
    {
      id: 'visit-burial-ground',
      description: 'Visit the sacred burial grounds',
      type: 'visit',
      target: 'location:kaiowa-burial-ground',
      required: 1
    },
    {
      id: 'speak-elders',
      description: 'Speak with Kaiowa elders about the situation',
      type: 'visit',
      target: 'npc:soaring-eagle',
      required: 1
    },
    {
      id: 'propose-alternative',
      description: 'Research and propose an alternative route',
      type: 'skill',
      target: 'skill:surveying',
      required: 1
    },
    {
      id: 'present-railroad',
      description: 'Present the alternative to railroad officials',
      type: 'visit',
      target: 'npc:henry-blackwood',
      required: 1
    },
    {
      id: 'witness-response',
      description: 'Witness the railroad\'s response',
      type: 'visit',
      target: 'location:railroad-camp',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 550 },
    { type: 'dollars', amount: 125 },
    { type: 'reputation', faction: 'nahi', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The burial ground is peaceful, ancient. Generations of Kaiowa rest here. Soaring ` +
    `Eagle's voice shakes with emotion: "They want us to dig up our grandfathers so ` +
    `they can lay their iron road. We will not."`,
  dialogueComplete:
    `Henry Blackwood barely glances at your alternative route proposal before dismissing ` +
    `it. "The current route is most efficient. The dead don't vote." His smile is cold.`
};

export const WAR_PROLOGUE_SETTLER_DILEMMA: QuestSeedData = {
  questId: 'war-prologue:settler-dilemma',
  name: 'Caught in the Middle',
  description:
    `Settler homesteaders are being pressured from all sides. The railroad wants their ` +
    `land. Native groups want them gone. Help a family navigate impossible choices.`,
  type: 'main',
  levelRequired: 13,
  prerequisites: ['war-prologue:sacred-ground'],
  objectives: [
    {
      id: 'visit-homestead',
      description: 'Visit the Jennings homestead',
      type: 'visit',
      target: 'location:jennings-homestead',
      required: 1
    },
    {
      id: 'hear-railroad-threat',
      description: 'Witness railroad enforcers\' threats',
      type: 'visit',
      target: 'npc:railroad-enforcer',
      required: 1
    },
    {
      id: 'hear-native-warning',
      description: 'Receive warning from Apache scouts',
      type: 'visit',
      target: 'npc:apache-scout',
      required: 1
    },
    {
      id: 'help-family-decide',
      description: 'Help the Jennings family decide their future',
      type: 'skill',
      target: 'choice:family-decision',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 525 },
    { type: 'dollars', amount: 150 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The Jennings family has worked this land for ten years. Built their cabin with ` +
    `their own hands. Now the railroad says sell or burn. The Apache say leave or die. ` +
    `They came here for a fresh start. This isn't the dream they imagined.`,
  dialogueComplete:
    `Whatever the Jennings choose, their peace is shattered. They're just one family ` +
    `among hundreds facing the same impossible choice. The frontier is eating its own.`
};

export const WAR_PROLOGUE_SMUGGLING_ROUTES: QuestSeedData = {
  questId: 'war-prologue:smuggling-routes',
  name: 'Arms Race',
  description:
    `Don Esteban's network is now arming all sides of the coming conflict. Discover ` +
    `the extent of Frontera weapons smuggling and decide whether to report, join, ` +
    `or stop it.`,
  type: 'main',
  levelRequired: 13,
  prerequisites: ['war-prologue:settler-dilemma'],
  objectives: [
    {
      id: 'follow-shipment',
      description: 'Follow a suspicious weapons shipment',
      type: 'skill',
      target: 'skill:stealth',
      required: 1
    },
    {
      id: 'discover-routes',
      description: 'Map the smuggling routes',
      type: 'visit',
      target: 'location:smuggling-waypoint',
      required: 3
    },
    {
      id: 'witness-sales',
      description: 'Witness weapons sales to multiple factions',
      type: 'visit',
      target: 'npc:weapons-buyer',
      required: 2
    },
    {
      id: 'make-choice',
      description: 'Decide what to do with this information',
      type: 'skill',
      target: 'choice:smuggling-response',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 575 },
    { type: 'dollars', amount: 200 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The Frontera isn't just selling to one side - they're arming everyone. Rifles ` +
    `to the settlers, ammunition to the raiders, explosives to the railroad. Don ` +
    `Esteban plays all sides, and the body count is just beginning.`,
  dialogueComplete:
    `The arms flow continues regardless of your choice. There's too much money in ` +
    `war, and the Frontera knows how to profit. The only question is whose side ` +
    `you'll be on when the shooting starts.`
};

export const WAR_PROLOGUE_THE_CONFERENCE: QuestSeedData = {
  questId: 'war-prologue:the-conference',
  name: 'Last Hope for Peace',
  description:
    `A peace conference has been called at Dusty Springs. All factions will attend. ` +
    `This may be the last chance to prevent open warfare.`,
  type: 'main',
  levelRequired: 13,
  prerequisites: ['war-prologue:smuggling-routes'],
  objectives: [
    {
      id: 'attend-conference',
      description: 'Attend the peace conference at Dusty Springs',
      type: 'visit',
      target: 'location:dusty-springs-conference',
      required: 1
    },
    {
      id: 'observe-negotiations',
      description: 'Observe all faction leaders\' positions',
      type: 'visit',
      target: 'npc:faction-leader',
      required: 4
    },
    {
      id: 'prevent-assassination',
      description: 'Prevent an assassination attempt',
      type: 'kill',
      target: 'npc:assassin',
      required: 1
    },
    {
      id: 'witness-collapse',
      description: 'Witness the conference collapse',
      type: 'visit',
      target: 'location:dusty-springs-conference',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 600 },
    { type: 'dollars', amount: 200 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The conference room is tense. Cornelius Vandermeer sits with cold superiority. ` +
    `Running Fox speaks of ancient rights. Mayor Whitmore tries to find middle ground. ` +
    `Don Esteban watches everything. And in the shadows, someone is loading a gun...`,
  dialogueComplete:
    `The assassination attempt failed, but the conference is dead. Accusations fly. ` +
    `Chairs are thrown. The railroad delegation walks out. War is now inevitable.`
};

// =============================================================================
// FACTION WAR PROLOGUE - ARC 3: SPARKS IGNITE (L14-15)
// =============================================================================

export const WAR_PROLOGUE_FIRST_BLOOD: QuestSeedData = {
  questId: 'war-prologue:first-blood',
  name: 'The Shot Heard Across the Territory',
  description:
    `Violence has erupted. A railroad camp was attacked, settlers were killed, and ` +
    `blame is being cast in every direction. Choose a side in the first battle of ` +
    `the coming war.`,
  type: 'main',
  levelRequired: 14,
  prerequisites: ['war-prologue:the-conference'],
  objectives: [
    {
      id: 'investigate-attack',
      description: 'Investigate the railroad camp attack',
      type: 'visit',
      target: 'location:attacked-railroad-camp',
      required: 1
    },
    {
      id: 'gather-evidence',
      description: 'Gather evidence about the attackers',
      type: 'collect',
      target: 'item:attack-evidence',
      required: 3
    },
    {
      id: 'choose-side',
      description: 'Choose which faction to report to',
      type: 'skill',
      target: 'choice:faction-report',
      required: 1
    },
    {
      id: 'participate-battle',
      description: 'Participate in the retaliatory battle',
      type: 'kill',
      target: 'npc:enemy-combatant',
      required: 5
    }
  ],
  rewards: [
    { type: 'xp', amount: 650 },
    { type: 'dollars', amount: 225 },
    { type: 'reputation', faction: 'chosen', amount: 40 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The smoke rises from the burned camp. Bodies lie in the dust. Everyone claims ` +
    `innocence. Everyone demands vengeance. The first blood has been spilled, and ` +
    `there's no going back now.`,
  dialogueComplete:
    `The battle is won, but at terrible cost. Lines have been drawn. Neutrality is ` +
    `no longer an option. The war has begun.`
};

export const WAR_PROLOGUE_RAILROAD_RETALIATION: QuestSeedData = {
  questId: 'war-prologue:railroad-retaliation',
  name: 'Pinkerton Justice',
  description:
    `The Railroad Tycoons have hired Pinkerton agents to "restore order." These ` +
    `professional mercenaries are conducting brutal reprisals against suspected ` +
    `attackers - guilty or not.`,
  type: 'main',
  levelRequired: 14,
  prerequisites: ['war-prologue:first-blood'],
  objectives: [
    {
      id: 'witness-reprisal',
      description: 'Witness Pinkerton "justice" in action',
      type: 'visit',
      target: 'location:pinkerton-raid',
      required: 1
    },
    {
      id: 'save-innocents',
      description: 'Attempt to save innocent victims',
      type: 'kill',
      target: 'npc:pinkerton-agent',
      required: 3
    },
    {
      id: 'document-crimes',
      description: 'Document Pinkerton war crimes',
      type: 'collect',
      target: 'item:evidence-document',
      required: 2
    },
    {
      id: 'escape-pursuit',
      description: 'Escape Pinkerton pursuit',
      type: 'skill',
      target: 'skill:escape',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 675 },
    { type: 'dollars', amount: 200 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The Pinkertons don't ask questions. They burn homesteads, shoot first, and ` +
    `call everyone a "rebel." Captain Miles Sterling leads the purge with cold ` +
    `efficiency. This isn't law enforcement - it's terrorism.`,
  dialogueComplete:
    `You've saved some innocents, but many more died. The Pinkertons have made ` +
    `enemies of everyone. Even some settlers are turning against the railroad now.`
};

export const WAR_PROLOGUE_TRIBAL_COUNCIL: QuestSeedData = {
  questId: 'war-prologue:tribal-council',
  name: 'Council of War',
  description:
    `The five Nahi tribes have called a war council. Old grievances are set aside ` +
    `(mostly) as they face the common threat. Witness the birth of unified native ` +
    `resistance - or its final fracture.`,
  type: 'main',
  levelRequired: 14,
  prerequisites: ['war-prologue:railroad-retaliation'],
  objectives: [
    {
      id: 'attend-council',
      description: 'Attend the tribal war council',
      type: 'visit',
      target: 'location:tribal-council-grounds',
      required: 1
    },
    {
      id: 'hear-kaiowa',
      description: 'Hear the Kaiowa plea for measured response',
      type: 'visit',
      target: 'npc:soaring-eagle',
      required: 1
    },
    {
      id: 'hear-warband',
      description: 'Hear the Apache War Band demand for blood',
      type: 'visit',
      target: 'npc:burning-sky',
      required: 1
    },
    {
      id: 'witness-vote',
      description: 'Witness the final vote on war or peace',
      type: 'visit',
      target: 'location:tribal-council-grounds',
      required: 1
    },
    {
      id: 'report-outcome',
      description: 'Report the outcome to your faction',
      type: 'deliver',
      target: 'npc:faction-leader',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 700 },
    { type: 'dollars', amount: 175 },
    { type: 'reputation', faction: 'nahi', amount: 35 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The council fire burns high. Five chiefs sit in a circle that hasn't convened ` +
    `in fifty years. The debate is fierce - the Kaiowa counsel patience while ` +
    `Burning Sky demands immediate attack. The Coalition's fate hangs in the balance.`,
  dialogueComplete:
    `The vote is cast. War has been declared. But it's a fragile alliance - the ` +
    `tribes are united by hate of a common enemy, not love of each other.`
};

export const WAR_PROLOGUE_CHOOSING_ALLEGIANCES: QuestSeedData = {
  questId: 'war-prologue:choosing-allegiances',
  name: 'No Turning Back',
  description:
    `The time for fence-sitting is over. Every faction is demanding a declaration ` +
    `of loyalty. Choose your side in the coming war, and prepare for the consequences.`,
  type: 'main',
  levelRequired: 15,
  prerequisites: ['war-prologue:tribal-council'],
  objectives: [
    {
      id: 'receive-demands',
      description: 'Receive loyalty demands from all factions',
      type: 'visit',
      target: 'npc:faction-emissary',
      required: 4
    },
    {
      id: 'consider-options',
      description: 'Consider the benefits and costs of each alliance',
      type: 'visit',
      target: 'location:quiet-reflection',
      required: 1
    },
    {
      id: 'make-declaration',
      description: 'Make your formal declaration of allegiance',
      type: 'skill',
      target: 'choice:war-allegiance',
      required: 1
    },
    {
      id: 'receive-orders',
      description: 'Receive your first orders from your chosen faction',
      type: 'visit',
      target: 'npc:faction-commander',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 750 },
    { type: 'dollars', amount: 300 },
    { type: 'reputation', faction: 'chosen', amount: 50 },
    { type: 'item', itemId: 'faction-armband' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Every faction wants you. The settlers offer land and legitimacy. The Coalition ` +
    `offers kinship and ancient knowledge. The Frontera offers gold and power. Even ` +
    `the railroad makes veiled promises. But you can only choose one. Choose wisely.`,
  dialogueComplete:
    `Your allegiance is sworn. There's no going back now. Your chosen faction ` +
    `welcomes you with open arms - and hands you a weapon. The war begins tomorrow.`
};

export const WAR_PROLOGUE_BATTLE_RED_CREEK: QuestSeedData = {
  questId: 'war-prologue:the-battle-of-red-creek',
  name: 'The Battle of Red Creek',
  description:
    `The first major battle of the war erupts at Red Creek crossing. All factions ` +
    `converge for a decisive confrontation. Fight for your chosen side in the ` +
    `bloodiest day the territory has ever seen.`,
  type: 'main',
  levelRequired: 15,
  prerequisites: ['war-prologue:choosing-allegiances'],
  objectives: [
    {
      id: 'reach-battlefield',
      description: 'Reach Red Creek battlefield before dawn',
      type: 'visit',
      target: 'location:red-creek-battlefield',
      required: 1
    },
    {
      id: 'defend-position',
      description: 'Help defend your faction\'s position',
      type: 'kill',
      target: 'npc:enemy-soldier',
      required: 10
    },
    {
      id: 'complete-objective',
      description: 'Complete your faction\'s tactical objective',
      type: 'skill',
      target: 'objective:faction-tactical',
      required: 1
    },
    {
      id: 'survive-battle',
      description: 'Survive the day-long battle',
      type: 'skill',
      target: 'skill:combat',
      required: 1
    },
    {
      id: 'witness-outcome',
      description: 'Witness the battle\'s outcome',
      type: 'visit',
      target: 'location:red-creek-aftermath',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1000 },
    { type: 'dollars', amount: 500 },
    { type: 'reputation', faction: 'chosen', amount: 75 },
    { type: 'item', itemId: 'battle-veteran-badge' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The sun rises red over Red Creek. Hundreds of fighters from every faction ` +
    `face each other across the water. This is it - the moment that will define ` +
    `the territory's future. Today, legends are born and heroes die.`,
  dialogueComplete:
    `The battle ends at sunset. The creek runs red with blood. No side won ` +
    `decisively, but the war is now fully engaged. There will be more battles, ` +
    `more death, more choices. This was just the beginning.`
};

// =============================================================================
// SIDE QUESTS (L11-14)
// =============================================================================

export const SIDE_PROSPECTOR_RESCUE: QuestSeedData = {
  questId: 'side:prospector-rescue',
  name: 'Trapped Below',
  description:
    `A cave-in has trapped prospectors in the old Copper Creek mine. Time is running ` +
    `out to rescue them before the air runs out.`,
  type: 'side',
  levelRequired: 11,
  prerequisites: ['newcomers-trail:10-path-forward'],
  objectives: [
    {
      id: 'reach-mine',
      description: 'Reach the collapsed Copper Creek mine',
      type: 'visit',
      target: 'location:copper-creek-collapse',
      required: 1
    },
    {
      id: 'assess-damage',
      description: 'Assess the cave-in damage',
      type: 'skill',
      target: 'skill:mining',
      required: 1
    },
    {
      id: 'clear-rubble',
      description: 'Clear rubble to reach trapped miners',
      type: 'skill',
      target: 'skill:strength',
      required: 3
    },
    {
      id: 'rescue-miners',
      description: 'Rescue the trapped miners',
      type: 'deliver',
      target: 'npc:trapped-miner',
      required: 4
    }
  ],
  rewards: [
    { type: 'xp', amount: 400 },
    { type: 'dollars', amount: 175 },
    { type: 'reputation', faction: 'settler', amount: 20 }
  ],
  repeatable: false,
  isActive: true
};

export const SIDE_CATTLE_DRIVE: QuestSeedData = {
  questId: 'side:cattle-drive',
  name: 'Moving the Herd',
  description:
    `A rancher needs help driving cattle through dangerous territory. Rustlers, ` +
    `predators, and bad weather all threaten the herd.`,
  type: 'side',
  levelRequired: 12,
  prerequisites: ['newcomers-trail:10-path-forward'],
  objectives: [
    {
      id: 'meet-rancher',
      description: 'Meet the rancher at the starting point',
      type: 'visit',
      target: 'npc:cattle-rancher',
      required: 1
    },
    {
      id: 'drive-cattle',
      description: 'Keep the herd moving for 5 miles',
      type: 'skill',
      target: 'skill:animal-handling',
      required: 1
    },
    {
      id: 'fight-rustlers',
      description: 'Fight off rustler attacks',
      type: 'kill',
      target: 'npc:cattle-rustler',
      required: 4
    },
    {
      id: 'deliver-herd',
      description: 'Deliver the herd to the destination',
      type: 'deliver',
      target: 'location:cattle-destination',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 425 },
    { type: 'dollars', amount: 200 },
    { type: 'reputation', faction: 'settler', amount: 15 }
  ],
  repeatable: false,
  isActive: true
};

export const SIDE_TRAIN_HEIST_PREP: QuestSeedData = {
  questId: 'side:train-heist-prep',
  name: 'Planning the Big Score',
  description:
    `The Frontera is planning something big - a train heist that will strike at the ` +
    `Railroad Tycoons' profits. Help with reconnaissance and preparation.`,
  type: 'side',
  levelRequired: 13,
  prerequisites: ['war-prologue:frontera-opportunity'],
  objectives: [
    {
      id: 'meet-planner',
      description: 'Meet the heist planner at the Frontera hideout',
      type: 'visit',
      target: 'npc:heist-planner',
      required: 1
    },
    {
      id: 'scout-route',
      description: 'Scout the train route for ambush points',
      type: 'visit',
      target: 'location:train-route',
      required: 3
    },
    {
      id: 'steal-schedule',
      description: 'Steal the train schedule from the railroad office',
      type: 'skill',
      target: 'skill:stealth',
      required: 1
    },
    {
      id: 'report-findings',
      description: 'Report your findings to the planner',
      type: 'deliver',
      target: 'npc:heist-planner',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 475 },
    { type: 'dollars', amount: 250 },
    { type: 'reputation', faction: 'frontera', amount: 25 }
  ],
  repeatable: false,
  isActive: true
};

export const SIDE_NATIVE_ARTIFACT: QuestSeedData = {
  questId: 'side:native-artifact',
  name: 'What Was Taken',
  description:
    `A sacred Kaiowa artifact was stolen by treasure hunters. The tribe needs it ` +
    `back before it's sold to eastern collectors.`,
  type: 'side',
  levelRequired: 14,
  prerequisites: ['war-prologue:native-concerns'],
  objectives: [
    {
      id: 'learn-theft',
      description: 'Learn about the artifact theft from Soaring Eagle',
      type: 'visit',
      target: 'npc:soaring-eagle',
      required: 1
    },
    {
      id: 'track-thieves',
      description: 'Track the treasure hunters',
      type: 'skill',
      target: 'skill:tracking',
      required: 1
    },
    {
      id: 'confront-thieves',
      description: 'Confront the treasure hunters at their camp',
      type: 'visit',
      target: 'location:treasure-hunter-camp',
      required: 1
    },
    {
      id: 'recover-artifact',
      description: 'Recover the sacred artifact (combat or negotiation)',
      type: 'collect',
      target: 'item:sacred-artifact',
      required: 1
    },
    {
      id: 'return-artifact',
      description: 'Return the artifact to Soaring Eagle',
      type: 'deliver',
      target: 'npc:soaring-eagle',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 500 },
    { type: 'dollars', amount: 150 },
    { type: 'reputation', faction: 'nahi', amount: 35 },
    { type: 'item', itemId: 'spirit-blessing' }
  ],
  repeatable: false,
  isActive: true
};

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * All skill tutorial quests (L3-8)
 */
export const SKILL_TUTORIAL_QUESTS: QuestSeedData[] = [
  TUTORIAL_HUNTING_BASICS,
  TUTORIAL_MINING_FUNDAMENTALS,
  TUTORIAL_COOKING_CAMPFIRE,
  TUTORIAL_BLACKSMITHING_INTRO,
  TUTORIAL_HERBAL_MEDICINE,
  TUTORIAL_ADVANCED_SURVIVAL
];

/**
 * All faction war prologue quests (L11-15)
 */
export const WAR_PROLOGUE_QUESTS: QuestSeedData[] = [
  // Arc 1: The Calm Before
  WAR_PROLOGUE_RAILROAD_ARRIVES,
  WAR_PROLOGUE_NATIVE_CONCERNS,
  WAR_PROLOGUE_SETTLER_EXPANSION,
  WAR_PROLOGUE_FRONTERA_OPPORTUNITY,
  WAR_PROLOGUE_FIRST_TENSIONS,
  // Arc 2: Lines in the Sand
  WAR_PROLOGUE_RAILROAD_DEMANDS,
  WAR_PROLOGUE_SACRED_GROUND,
  WAR_PROLOGUE_SETTLER_DILEMMA,
  WAR_PROLOGUE_SMUGGLING_ROUTES,
  WAR_PROLOGUE_THE_CONFERENCE,
  // Arc 3: Sparks Ignite
  WAR_PROLOGUE_FIRST_BLOOD,
  WAR_PROLOGUE_RAILROAD_RETALIATION,
  WAR_PROLOGUE_TRIBAL_COUNCIL,
  WAR_PROLOGUE_CHOOSING_ALLEGIANCES,
  WAR_PROLOGUE_BATTLE_RED_CREEK
];

/**
 * All side quests (L11-14)
 */
export const GREENHORN_SIDE_QUESTS: QuestSeedData[] = [
  SIDE_PROSPECTOR_RESCUE,
  SIDE_CATTLE_DRIVE,
  SIDE_TRAIN_HEIST_PREP,
  SIDE_NATIVE_ARTIFACT
];

/**
 * All Greenhorn's Trail quests (25 total)
 */
export const ALL_GREENHORN_QUESTS: QuestSeedData[] = [
  ...SKILL_TUTORIAL_QUESTS,
  ...WAR_PROLOGUE_QUESTS,
  ...GREENHORN_SIDE_QUESTS
];

/**
 * Get quest by ID
 */
export function getGreenhornQuestById(questId: string): QuestSeedData | undefined {
  return ALL_GREENHORN_QUESTS.find(q => q.questId === questId);
}

/**
 * Get quests by level range
 */
export function getGreenhornQuestsByLevel(
  minLevel: number,
  maxLevel: number
): QuestSeedData[] {
  return ALL_GREENHORN_QUESTS.filter(
    q => q.levelRequired >= minLevel && q.levelRequired <= maxLevel
  );
}

/**
 * Get war prologue quests by arc
 */
export function getWarPrologueArc(arc: 1 | 2 | 3): QuestSeedData[] {
  switch (arc) {
    case 1:
      return WAR_PROLOGUE_QUESTS.slice(0, 5);
    case 2:
      return WAR_PROLOGUE_QUESTS.slice(5, 10);
    case 3:
      return WAR_PROLOGUE_QUESTS.slice(10, 15);
    default:
      return [];
  }
}
