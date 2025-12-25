/**
 * Frontier Justice - Phase 19.3 Quests
 * 30 quests covering L16-25 content pack
 *
 * Quest Categories:
 * - Universal Arc (10 quests): Railroad War escalation + conspiracy reveal
 * - Settler Exclusive (7 quests): "The Price of Progress"
 * - Nahi Exclusive (7 quests): "The Five Tribes"
 * - Frontera Exclusive (6 quests): "Blood Money"
 *
 * Design Philosophy:
 * - Heavy branching with AAA-quality storylines
 * - Cross-cutting Marshal/Outlaw reputation (separate from faction)
 * - All narrative tones: moral ambiguity, heroism, revenge, political intrigue
 */

import { QuestSeedData } from '../../models/Quest.model';

// =============================================================================
// UNIVERSAL ARC - THE RAILROAD WAR ESCALATES (L16-18, 5 quests)
// All players experience these regardless of faction
// =============================================================================

export const JUSTICE_AFTERMATH_RED_CREEK: QuestSeedData = {
  questId: 'justice:aftermath-of-red-creek',
  name: 'Aftermath of Red Creek',
  description:
    `The Battle of Red Creek is over, but its scars remain. Survey the battlefield where friends ` +
    `and enemies alike fell. Among the dead and dying, you'll find stories that blur the lines ` +
    `between right and wrong. A Nahi child searches for her father. A Settler woman tends to ` +
    `wounded Frontera fighters. A Railroad surveyor calculates property values among the dead.`,
  type: 'main',
  levelRequired: 16,
  prerequisites: ['war-prologue:choosing-allegiances'],
  objectives: [
    {
      id: 'survey-battlefield',
      description: 'Survey the Red Creek battlefield',
      type: 'visit',
      target: 'location:red-creek-battlefield',
      required: 1
    },
    {
      id: 'help-nahi-child',
      description: 'Help the Nahi child find her father',
      type: 'visit',
      target: 'npc:nahi-child',
      required: 1
    },
    {
      id: 'help-settler-woman',
      description: 'Assist the Settler woman with the wounded',
      type: 'visit',
      target: 'npc:settler-nurse',
      required: 1
    },
    {
      id: 'confront-surveyor',
      description: 'Confront the Railroad surveyor',
      type: 'visit',
      target: 'npc:railroad-surveyor',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 800 },
    { type: 'dollars', amount: 400 },
    { type: 'reputation', faction: 'player_faction', amount: 15 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The smoke still rises from Red Creek. Bodies from all factions lie where they fell. ` +
    `This is what war looks like up close. What will you do in its aftermath?`,
  dialogueComplete:
    `You've seen the true cost of this conflict. The faces of the dead will stay with you. ` +
    `Perhaps that's the lesson - that every choice has consequences, every bullet a story.`
};

export const JUSTICE_PINKERTONS_ARRIVE: QuestSeedData = {
  questId: 'justice:the-pinkertons-arrive',
  name: 'The Pinkertons Arrive',
  description:
    `The Railroad Tycoons have called in reinforcements: the Pinkerton Detective Agency, ` +
    `America's most ruthless private army. Their leader, Agent Morrison, establishes ` +
    `martial law in contested territories. He's polite, professional, and utterly ruthless.`,
  type: 'main',
  levelRequired: 16,
  prerequisites: ['justice:aftermath-of-red-creek'],
  objectives: [
    {
      id: 'witness-arrival',
      description: 'Witness the Pinkerton arrival at Junction City',
      type: 'visit',
      target: 'location:junction-city',
      required: 1
    },
    {
      id: 'meet-morrison',
      description: 'Meet Agent Morrison',
      type: 'visit',
      target: 'npc:agent-morrison',
      required: 1
    },
    {
      id: 'gather-intel',
      description: 'Gather intelligence on Pinkerton operations',
      type: 'collect',
      target: 'item:pinkerton-intel',
      required: 3
    },
    {
      id: 'report-faction',
      description: 'Report your findings to your faction',
      type: 'deliver',
      target: 'npc:faction-leader',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 850 },
    { type: 'dollars', amount: 450 },
    { type: 'reputation', faction: 'player_faction', amount: 20 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Agent Morrison stands tall in his black coat, Pinkerton badge gleaming. "Ah, you must be ` +
    `the one they're talking about. The hero of Red Creek. I've heard... interesting things ` +
    `about you. We should talk."`,
  dialogueComplete:
    `Morrison knows more than he should. About the war. About your faction. About you. ` +
    `This man is dangerous - not because he's violent, but because he's patient.`
};

export const JUSTICE_LINES_REDRAWN: QuestSeedData = {
  questId: 'justice:lines-redrawn',
  name: 'Lines Redrawn',
  description:
    `Your faction needs you to secure a critical junction point. But refugees are fleeing ` +
    `through it - families, children, the elderly. Do you prioritize military victory ` +
    `or humanitarian aid? There may be no right answer.`,
  type: 'main',
  levelRequired: 17,
  prerequisites: ['justice:the-pinkertons-arrive'],
  objectives: [
    {
      id: 'reach-junction',
      description: 'Reach the contested junction point',
      type: 'visit',
      target: 'location:contested-junction',
      required: 1
    },
    {
      id: 'assess-situation',
      description: 'Assess the refugee situation',
      type: 'visit',
      target: 'npc:refugee-leader',
      required: 1
    },
    {
      id: 'make-choice',
      description: 'Choose: Secure the junction OR protect the refugees',
      type: 'visit',
      target: 'decision:junction-choice',
      required: 1
    },
    {
      id: 'face-consequences',
      description: 'Face the consequences of your choice',
      type: 'visit',
      target: 'npc:faction-commander',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 900 },
    { type: 'dollars', amount: 500 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Commander: "The junction is critical. We need it secured. But..." They look toward ` +
    `the fleeing families. "Sometimes war asks us to choose between duty and humanity."`,
  dialogueComplete:
    `Whatever you chose, someone paid the price. That's the nature of this conflict. ` +
    `There are no clean victories, only choices and consequences.`
};

export const JUSTICE_THE_OLD_TIMER: QuestSeedData = {
  questId: 'justice:the-old-timer',
  name: 'The Old-Timer',
  description:
    `An old gunslinger, retired for twenty years, asks for your help. The Railroad killed ` +
    `his son at Red Creek. He wants to ride one last time. But as you escort him, you'll ` +
    `learn he was once the most feared outlaw in the territory... who changed.`,
  type: 'main',
  levelRequired: 17,
  prerequisites: ['justice:lines-redrawn'],
  objectives: [
    {
      id: 'meet-old-timer',
      description: 'Meet the old gunslinger at Dusty Saloon',
      type: 'visit',
      target: 'npc:old-timer-jack',
      required: 1
    },
    {
      id: 'hear-story',
      description: 'Listen to his story',
      type: 'visit',
      target: 'npc:old-timer-jack',
      required: 1
    },
    {
      id: 'escort-ride',
      description: 'Escort him toward the Railroad camp',
      type: 'visit',
      target: 'npc:old-timer-jack',
      required: 1
    },
    {
      id: 'face-truth',
      description: 'Decide his fate at the Railroad camp',
      type: 'visit',
      target: 'decision:old-timer-fate',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 950 },
    { type: 'dollars', amount: 550 },
    { type: 'item', itemId: 'old-timers-revolver' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The old man's hands are weathered, but steady. "I was Bloody Jack McGraw. Killed ` +
    `thirty-seven men before I found peace. Now they've taken my boy. I need to ride ` +
    `one more time. Will you help an old sinner finish what he started?"`,
  dialogueComplete:
    `Whether he found his revenge or his redemption, Old Jack's ride is over. ` +
    `His story becomes part of yours now - a reminder that people can change.`
};

export const JUSTICE_FIRST_CONTRACT: QuestSeedData = {
  questId: 'justice:the-first-contract',
  name: 'The First Contract',
  description:
    `With the war escalating, new opportunities emerge. The bounty board offers legitimate ` +
    `work for those with skills. But the faction warfare contracts offer something else ` +
    `entirely - power, influence, and the chance to shape the conflict.`,
  type: 'main',
  levelRequired: 18,
  prerequisites: ['justice:the-old-timer'],
  objectives: [
    {
      id: 'visit-bounty-board',
      description: 'Visit the bounty board',
      type: 'visit',
      target: 'location:bounty-board',
      required: 1
    },
    {
      id: 'choose-path',
      description: 'Choose: Bounty hunting (Marshal) OR Sabotage (Outlaw)',
      type: 'visit',
      target: 'decision:contract-path',
      required: 1
    },
    {
      id: 'complete-contract',
      description: 'Complete your first contract',
      type: 'collect',
      target: 'contract:first-assignment',
      required: 1
    },
    {
      id: 'claim-rewards',
      description: 'Claim your rewards',
      type: 'deliver',
      target: 'npc:contract-giver',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1000 },
    { type: 'dollars', amount: 600 },
    { type: 'reputation', faction: 'player_faction', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The bounty board is packed with postings. Criminal wanted posters. Escort requests. ` +
    `But there's also a section for "special contracts" - the kind that don't ask questions ` +
    `about your methods. Which path will you choose?`,
  dialogueComplete:
    `Your first contract is complete. The contract board will remember your performance. ` +
    `More opportunities await - for those willing to take them.`
};

// =============================================================================
// UNIVERSAL ARC - THE CONSPIRACY REVEALED (L23-25, 5 quests)
// Pack climax - universal quests that hit differently based on faction
// =============================================================================

export const JUSTICE_WHISPERS_WIRE: QuestSeedData = {
  questId: 'justice:whispers-in-the-wire',
  name: 'Whispers in the Wire',
  description:
    `Intercept a telegraph message. The contents will shake everything you thought you ` +
    `knew. The Railroad Tycoons aren't just expanding - they're planning to eliminate ` +
    `ALL factions, including their own allies. Complete territorial control.`,
  type: 'main',
  levelRequired: 23,
  prerequisites: [],
  objectives: [
    {
      id: 'locate-telegraph',
      description: 'Locate the Railroad telegraph station',
      type: 'visit',
      target: 'location:telegraph-station',
      required: 1
    },
    {
      id: 'intercept-message',
      description: 'Intercept the encoded message',
      type: 'skill',
      target: 'skill:stealth',
      required: 1
    },
    {
      id: 'decode-message',
      description: 'Decode the message',
      type: 'skill',
      target: 'skill:cunning',
      required: 1
    },
    {
      id: 'share-revelation',
      description: 'Share the revelation with your faction',
      type: 'deliver',
      target: 'npc:faction-leader',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1500 },
    { type: 'dollars', amount: 800 },
    { type: 'reputation', faction: 'player_faction', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The telegraph wires hum with secrets. Tonight, you'll listen to what the Railroad ` +
    `doesn't want anyone to hear. The truth may be worse than you imagined.`,
  dialogueComplete:
    `The message is clear: Red Creek wasn't an accident. It was provoked. The war ` +
    `was manufactured. Every death, every betrayal - all part of a larger plan.`
};

export const JUSTICE_THE_TRAITOR: QuestSeedData = {
  questId: 'justice:the-traitor',
  name: 'The Traitor',
  description:
    `Someone in your faction is feeding information to the Railroad. You must find them. ` +
    `Three suspects. Compelling evidence against each. But the real traitor's story ` +
    `is more sympathetic than you expect - they were protecting their family.`,
  type: 'main',
  levelRequired: 23,
  prerequisites: ['justice:whispers-in-the-wire'],
  objectives: [
    {
      id: 'investigate-suspect-1',
      description: 'Investigate Suspect #1 - The Merchant',
      type: 'visit',
      target: 'npc:suspect-merchant',
      required: 1
    },
    {
      id: 'investigate-suspect-2',
      description: 'Investigate Suspect #2 - The Soldier',
      type: 'visit',
      target: 'npc:suspect-soldier',
      required: 1
    },
    {
      id: 'investigate-suspect-3',
      description: 'Investigate Suspect #3 - The Elder',
      type: 'visit',
      target: 'npc:suspect-elder',
      required: 1
    },
    {
      id: 'confront-traitor',
      description: 'Confront the true traitor',
      type: 'visit',
      target: 'decision:traitor-fate',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1600 },
    { type: 'dollars', amount: 850 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Three suspects. Three stories. Three reasons to be guilty. But only one is the ` +
    `traitor. Find them - but be prepared for what you discover.`,
  dialogueComplete:
    `The traitor is found. But were they truly evil, or just desperate? ` +
    `What would you do to protect the ones you love?`
};

export const JUSTICE_MORRISON_REVEALED: QuestSeedData = {
  questId: 'justice:morrison-revealed',
  name: 'Morrison Revealed',
  description:
    `Agent Morrison corners you. He reveals the "interesting thing" from your first ` +
    `meeting: your family history is tied to the Railroad. This is personal now.`,
  type: 'main',
  levelRequired: 24,
  prerequisites: ['justice:the-traitor'],
  objectives: [
    {
      id: 'morrison-summons',
      description: 'Answer Morrison\'s summons',
      type: 'visit',
      target: 'npc:agent-morrison',
      required: 1
    },
    {
      id: 'hear-revelation',
      description: 'Hear what Morrison knows about your past',
      type: 'visit',
      target: 'npc:agent-morrison',
      required: 1
    },
    {
      id: 'verify-claims',
      description: 'Verify Morrison\'s claims',
      type: 'visit',
      target: 'location:family-history',
      required: 1
    },
    {
      id: 'decide-response',
      description: 'Decide how to respond',
      type: 'visit',
      target: 'decision:morrison-response',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1700 },
    { type: 'dollars', amount: 900 },
    { type: 'item', itemId: 'family-heirloom' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Morrison smiles. "Did you really think I wouldn't find out? Your grandfather... ` +
    `your family's land... the Railroad's first survey. It's all connected. You're ` +
    `fighting a war that started before you were born."`,
  dialogueComplete:
    `Now you know. The Railroad didn't just take land - they took your family's ` +
    `history. This war is no longer just about factions. It's about you.`
};

export const JUSTICE_ALLIANCE_DESPERATION: QuestSeedData = {
  questId: 'justice:alliance-of-desperation',
  name: 'Alliance of Desperation',
  description:
    `With the conspiracy revealed, faction leaders consider the unthinkable: temporary ` +
    `alliance against the Railroad. You must convince your faction's rival to cooperate. ` +
    `Old wounds run deep. Can they be set aside for survival?`,
  type: 'main',
  levelRequired: 24,
  prerequisites: ['justice:morrison-revealed'],
  objectives: [
    {
      id: 'faction-council',
      description: 'Attend the emergency faction council',
      type: 'visit',
      target: 'location:faction-council',
      required: 1
    },
    {
      id: 'receive-mission',
      description: 'Accept the diplomatic mission',
      type: 'visit',
      target: 'npc:faction-leader',
      required: 1
    },
    {
      id: 'approach-rival',
      description: 'Approach the rival faction leader',
      type: 'visit',
      target: 'npc:rival-faction-leader',
      required: 1
    },
    {
      id: 'negotiate-alliance',
      description: 'Negotiate the alliance terms',
      type: 'skill',
      target: 'skill:persuasion',
      required: 1
    },
    {
      id: 'seal-deal',
      description: 'Seal the alliance',
      type: 'visit',
      target: 'decision:alliance-terms',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1800 },
    { type: 'dollars', amount: 1000 },
    { type: 'reputation', faction: 'all', amount: 20 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"We've been enemies. We've killed each other's people. But the Railroad wants ` +
    `us ALL dead. Can we set aside our hatred long enough to survive?"`,
  dialogueComplete:
    `The alliance is formed - fragile, temporary, but real. For the first time, ` +
    `the factions stand together. The Railroad has made a powerful enemy.`
};

export const JUSTICE_IRON_HORSE_GAMBIT: QuestSeedData = {
  questId: 'justice:the-iron-horse-gambit',
  name: 'The Iron Horse Gambit',
  description:
    `The pack climax. A united assault on the Railroad's armored command train - ` +
    `The Manifest. Board the train. Save the hostages or secure the telegraph room. ` +
    `Confront Colonel Blackwood. Multiple endings await.`,
  type: 'main',
  levelRequired: 25,
  prerequisites: ['justice:alliance-of-desperation'],
  objectives: [
    {
      id: 'prepare-assault',
      description: 'Prepare the assault team',
      type: 'visit',
      target: 'location:staging-point',
      required: 1
    },
    {
      id: 'board-train',
      description: 'Board The Manifest',
      type: 'kill',
      target: 'location:the-manifest',
      required: 1
    },
    {
      id: 'moral-choice',
      description: 'Choose: Save hostages OR secure telegraph room',
      type: 'visit',
      target: 'decision:manifest-priority',
      required: 1
    },
    {
      id: 'confront-blackwood',
      description: 'Confront Colonel Blackwood',
      type: 'kill',
      target: 'boss:colonel-blackwood',
      required: 1
    },
    {
      id: 'determine-ending',
      description: 'Determine the outcome',
      type: 'visit',
      target: 'decision:manifest-ending',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 3000 },
    { type: 'dollars', amount: 2000 },
    { type: 'item', itemId: 'blackwoods-saber' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The Manifest rolls across the frontier, unstoppable. Inside, Colonel Blackwood ` +
    `commands an empire. Tonight, the alliance strikes. Tonight, history changes.`,
  dialogueComplete:
    `The Manifest is stopped. Whether through capture, destruction, or negotiation, ` +
    `the Railroad's grip on the frontier is broken. A new era begins.`
};

// =============================================================================
// SETTLER ALLIANCE EXCLUSIVE (7 quests) - "The Price of Progress"
// Theme: Settlers believe in progress, but at what cost?
// =============================================================================

export const SETTLER_HOMESTEADER_CRISIS: QuestSeedData = {
  questId: 'settler:homesteader-crisis',
  name: 'Homesteader Crisis',
  description:
    `The Railroad claims "eminent domain" over homesteads. Families are being evicted ` +
    `at gunpoint with legal papers. The law is on their side. Justice is not.`,
  type: 'side',
  specialFlags: { factionRequired: 'settler_alliance' },
  levelRequired: 16,
  prerequisites: ['justice:aftermath-of-red-creek'],
  objectives: [
    {
      id: 'investigate-evictions',
      description: 'Investigate the homestead evictions',
      type: 'visit',
      target: 'location:threatened-homestead',
      required: 1
    },
    {
      id: 'defend-homestead-1',
      description: 'Defend the Miller homestead',
      type: 'kill',
      target: 'npc:pinkerton-eviction-crew',
      required: 1
    },
    {
      id: 'defend-homestead-2',
      description: 'Defend the Johnson homestead',
      type: 'kill',
      target: 'npc:pinkerton-eviction-crew',
      required: 1
    },
    {
      id: 'defend-homestead-3',
      description: 'Defend the O\'Brien homestead',
      type: 'kill',
      target: 'npc:pinkerton-eviction-crew',
      required: 1
    },
    {
      id: 'choose-method',
      description: 'Choose: Legal loophole OR Force them off',
      type: 'visit',
      target: 'decision:eviction-method',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1100 },
    { type: 'dollars', amount: 600 },
    { type: 'reputation', faction: 'settler_alliance', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"They've got papers. Legal papers. But the law that says they can take our homes ` +
    `is the same law that says we're free. Something's wrong here."`,
  dialogueComplete:
    `Three families keep their homes. For now. But how many more will the Railroad target?`
};

export const SETTLER_COMPANY_TOWN: QuestSeedData = {
  questId: 'settler:the-company-town',
  name: 'The Company Town',
  description:
    `The Railroad built a "model town" for workers. It's actually debt slavery. Workers ` +
    `are paid in company scrip, trapped in company housing, buying from company stores. ` +
    `They can never leave.`,
  type: 'side',
  specialFlags: { factionRequired: 'settler_alliance' },
  levelRequired: 17,
  prerequisites: ['settler:homesteader-crisis'],
  objectives: [
    {
      id: 'infiltrate-town',
      description: 'Infiltrate the company town',
      type: 'skill',
      target: 'skill:stealth',
      required: 1
    },
    {
      id: 'interview-workers',
      description: 'Interview trapped workers',
      type: 'visit',
      target: 'npc:company-workers',
      required: 3
    },
    {
      id: 'gather-evidence',
      description: 'Gather evidence of exploitation',
      type: 'collect',
      target: 'item:exploitation-evidence',
      required: 5
    },
    {
      id: 'choose-action',
      description: 'Choose: Organize strike OR Expose to newspapers',
      type: 'visit',
      target: 'decision:company-town-action',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1200 },
    { type: 'dollars', amount: 650 },
    { type: 'reputation', faction: 'settler_alliance', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Welcome to Progress, Kansas. Population: Enslaved. They call it employment. ` +
    `We call it chains made of paper instead of iron."`,
  dialogueComplete:
    `The truth about Progress is out. Whether through strike or scandal, ` +
    `the Railroad's "model town" is revealed for what it is.`
};

export const SETTLER_BLOOD_SOIL: QuestSeedData = {
  questId: 'settler:blood-and-soil',
  name: 'Blood and Soil',
  description:
    `A Settler veteran from Red Creek wants revenge on the Nahi. He claims they killed ` +
    `his brother. But investigation reveals the truth: his brother is alive, captured, ` +
    `not killed. Do you help rescue him, or let vengeance take its course?`,
  type: 'side',
  specialFlags: { factionRequired: 'settler_alliance' },
  levelRequired: 18,
  prerequisites: ['settler:the-company-town'],
  objectives: [
    {
      id: 'meet-veteran',
      description: 'Meet the vengeful veteran',
      type: 'visit',
      target: 'npc:veteran-james',
      required: 1
    },
    {
      id: 'investigate-claim',
      description: 'Investigate his claim about his brother',
      type: 'visit',
      target: 'location:red-creek-records',
      required: 1
    },
    {
      id: 'discover-truth',
      description: 'Discover the brother is alive',
      type: 'visit',
      target: 'npc:nahi-prisoner-keeper',
      required: 1
    },
    {
      id: 'choose-path',
      description: 'Choose: Rescue mission OR Allow revenge',
      type: 'visit',
      target: 'decision:blood-soil-choice',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1300 },
    { type: 'dollars', amount: 700 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"They killed my brother at Red Creek. I saw him fall. Now I'm going to make ` +
    `every last one of them pay. Will you help me, or get out of my way?"`,
  dialogueComplete:
    `The truth changes everything. Or does it? What matters more - facts or feelings?`
};

export const SETTLER_CATTLE_BARON: QuestSeedData = {
  questId: 'settler:the-cattle-baron',
  name: 'The Cattle Baron',
  description:
    `A powerful Settler cattle baron is secretly funding the Railroad. He's betrayed ` +
    `his own people for profit. Gather evidence of his treachery and expose him.`,
  type: 'side',
  specialFlags: { factionRequired: 'settler_alliance' },
  levelRequired: 19,
  prerequisites: ['settler:blood-and-soil'],
  objectives: [
    {
      id: 'investigate-baron',
      description: 'Investigate Baron Whitmore\'s finances',
      type: 'visit',
      target: 'location:whitmore-ranch',
      required: 1
    },
    {
      id: 'find-ledgers',
      description: 'Find the secret ledgers',
      type: 'skill',
      target: 'skill:stealth',
      required: 1
    },
    {
      id: 'copy-evidence',
      description: 'Copy the incriminating evidence',
      type: 'collect',
      target: 'item:baron-evidence',
      required: 1
    },
    {
      id: 'confront-barnes',
      description: 'Confront Sheriff Barnes (the Baron\'s enforcer)',
      type: 'kill',
      target: 'boss:sheriff-barnes',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1400 },
    { type: 'dollars', amount: 800 },
    { type: 'reputation', faction: 'settler_alliance', amount: 35 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Whitmore acts like he's one of us. Biggest ranch in the territory. But follow ` +
    `the money... follow where his cattle really go... and you'll find the Railroad."`,
  dialogueComplete:
    `The Baron is exposed. His enforcer defeated. The Settler Alliance purges the traitor ` +
    `from their ranks. But how deep does the corruption go?`
};

export const SETTLER_GHOST_FRONTIER: QuestSeedData = {
  questId: 'settler:ghost-of-the-frontier',
  name: 'Ghost of the Frontier',
  description:
    `Settlers speak of a "ghost" attacking Railroad camps at night. Investigation reveals ` +
    `a disguised Nahi warrior on a personal vendetta. Help him? Capture him? Recruit him?`,
  type: 'side',
  specialFlags: { factionRequired: 'settler_alliance' },
  levelRequired: 20,
  prerequisites: ['settler:the-cattle-baron'],
  objectives: [
    {
      id: 'investigate-attacks',
      description: 'Investigate the "ghost" attacks',
      type: 'visit',
      target: 'location:railroad-camp-ruins',
      required: 1
    },
    {
      id: 'track-ghost',
      description: 'Track the ghost to their hideout',
      type: 'skill',
      target: 'skill:tracking',
      required: 1
    },
    {
      id: 'confront-ghost',
      description: 'Confront the ghost - a Nahi warrior',
      type: 'visit',
      target: 'npc:ghost-warrior',
      required: 1
    },
    {
      id: 'choose-fate',
      description: 'Choose: Help, Capture, or Recruit the warrior',
      type: 'visit',
      target: 'decision:ghost-fate',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1500 },
    { type: 'dollars', amount: 850 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Something's hitting the Railroad camps. They say it's a ghost - moves like smoke, ` +
    `strikes like lightning, gone before dawn. But ghosts don't leave footprints..."`,
  dialogueComplete:
    `The ghost is revealed. A warrior fighting his own war. What you do with him ` +
    `could change the relationship between Settlers and Nahi forever.`
};

export const SETTLER_RAILROAD_WIVES: QuestSeedData = {
  questId: 'settler:the-railroad-wives',
  name: 'The Railroad Wives',
  description:
    `The wives of Railroad executives are secretly funding refugee aid. Help them ` +
    `smuggle supplies without exposing their conspiracy. But one of them is a spy.`,
  type: 'side',
  specialFlags: { factionRequired: 'settler_alliance' },
  levelRequired: 21,
  prerequisites: ['settler:ghost-of-the-frontier'],
  objectives: [
    {
      id: 'meet-wives',
      description: 'Meet the Railroad wives',
      type: 'visit',
      target: 'npc:railroad-wives',
      required: 1
    },
    {
      id: 'smuggle-supplies',
      description: 'Help smuggle supplies to refugees',
      type: 'skill',
      target: 'skill:stealth',
      required: 3
    },
    {
      id: 'identify-spy',
      description: 'Identify the spy among them',
      type: 'visit',
      target: 'npc:wife-spy',
      required: 1
    },
    {
      id: 'handle-spy',
      description: 'Decide how to handle the spy',
      type: 'visit',
      target: 'decision:wife-spy-fate',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1600 },
    { type: 'dollars', amount: 900 },
    { type: 'reputation', faction: 'settler_alliance', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"We married these men for their money. We never thought we'd be complicit in... this. ` +
    `We want to help. But we need someone we can trust."`,
  dialogueComplete:
    `Supplies reach the refugees. The spy is handled. But the Railroad wives must continue ` +
    `their dangerous game - hiding compassion behind smiles.`
};

export const SETTLER_MANIFEST_DESTINY: QuestSeedData = {
  questId: 'settler:manifest-destiny',
  name: 'Manifest Destiny',
  description:
    `The Settler Alliance must choose its future. A council vote will determine whether ` +
    `to ally with the Railroad or resist. Your vote counts. This shapes the faction's future.`,
  type: 'side',
  specialFlags: { factionRequired: 'settler_alliance' },
  levelRequired: 22,
  prerequisites: ['settler:the-railroad-wives'],
  objectives: [
    {
      id: 'attend-council',
      description: 'Attend the Settler Council',
      type: 'visit',
      target: 'location:settler-council',
      required: 1
    },
    {
      id: 'hear-arguments',
      description: 'Hear arguments from both sides',
      type: 'visit',
      target: 'npc:council-speakers',
      required: 2
    },
    {
      id: 'influence-votes',
      description: 'Influence council member votes',
      type: 'skill',
      target: 'skill:persuasion',
      required: 3
    },
    {
      id: 'cast-vote',
      description: 'Cast your vote',
      type: 'visit',
      target: 'decision:settler-future',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2000 },
    { type: 'dollars', amount: 1200 },
    { type: 'reputation', faction: 'settler_alliance', amount: 50 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"The future of the Settler Alliance is at stake. Do we ally with the Railroad and ` +
    `embrace 'progress'? Or do we resist and risk everything we've built?"`,
  dialogueComplete:
    `The vote is cast. The Settler Alliance has chosen its path. Whatever comes next, ` +
    `you played a part in shaping it.`
};

// =============================================================================
// NAHI COALITION EXCLUSIVE (7 quests) - "The Five Tribes"
// Theme: Coalition fracturing, internal politics as dangerous as external enemies
// =============================================================================

export const NAHI_COUNCIL_TRIBES: QuestSeedData = {
  questId: 'nahi:council-of-tribes',
  name: 'Council of Tribes',
  description:
    `Attend the first unified council since Red Creek. Five tribes with five philosophies ` +
    `must unite or fall. Kaiowa wants peace. The Raiders want war. Pueblo wants profit. ` +
    `Apache wants blood. The Hunters are divided.`,
  type: 'side',
  specialFlags: { factionRequired: 'nahi_coalition' },
  levelRequired: 16,
  prerequisites: ['justice:aftermath-of-red-creek'],
  objectives: [
    {
      id: 'attend-council',
      description: 'Attend the Council of Five Tribes',
      type: 'visit',
      target: 'location:sacred-council-grounds',
      required: 1
    },
    {
      id: 'hear-kaiowa',
      description: 'Hear the Kaiowa position (peace)',
      type: 'visit',
      target: 'npc:kaiowa-elder',
      required: 1
    },
    {
      id: 'hear-raiders',
      description: 'Hear the Raider position (war)',
      type: 'visit',
      target: 'npc:raider-chief',
      required: 1
    },
    {
      id: 'hear-pueblo',
      description: 'Hear the Pueblo position (profit)',
      type: 'visit',
      target: 'npc:pueblo-merchant',
      required: 1
    },
    {
      id: 'support-faction',
      description: 'Voice your support for a tribe\'s position',
      type: 'visit',
      target: 'decision:tribal-support',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1100 },
    { type: 'dollars', amount: 600 },
    { type: 'reputation', faction: 'nahi_coalition', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `The council fire burns. Five flags fly. Five voices speak. Five paths diverge. ` +
    `The Coalition's unity hangs by a thread.`,
  dialogueComplete:
    `The council has heard your voice. Not everyone agrees, but that is the way of ` +
    `the Coalition - we debate, we disagree, but we remain one.`
};

export const NAHI_SACRED_SITE: QuestSeedData = {
  questId: 'nahi:the-sacred-site',
  name: 'The Sacred Site',
  description:
    `The Railroad is excavating a sacred burial ground. Gold underneath. Stop the ` +
    `excavation using violence, sabotage, negotiation, or profit - each method ` +
    `reflects a different tribe's approach.`,
  type: 'side',
  specialFlags: { factionRequired: 'nahi_coalition' },
  levelRequired: 17,
  prerequisites: ['nahi:council-of-tribes'],
  objectives: [
    {
      id: 'investigate-site',
      description: 'Investigate the excavation site',
      type: 'visit',
      target: 'location:sacred-burial-ground',
      required: 1
    },
    {
      id: 'assess-threat',
      description: 'Assess the threat to the ancestors',
      type: 'visit',
      target: 'location:excavation-progress',
      required: 1
    },
    {
      id: 'choose-method',
      description: 'Choose your method: Violence, Sabotage, Negotiation, or Profit',
      type: 'visit',
      target: 'decision:sacred-site-method',
      required: 1
    },
    {
      id: 'execute-plan',
      description: 'Execute your chosen plan',
      type: 'skill',
      target: 'skill:chosen-method',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1200 },
    { type: 'dollars', amount: 700 },
    { type: 'reputation', faction: 'nahi_coalition', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"They dig where our ancestors sleep. They call it gold. We call it desecration. ` +
    `How you stop them will show which tribe's blood runs strongest in you."`,
  dialogueComplete:
    `The excavation is stopped. The ancestors rest in peace. But the method you chose ` +
    `has aligned you with one tribe's philosophy.`
};

export const NAHI_BROTHER_AGAINST_BROTHER: QuestSeedData = {
  questId: 'nahi:brother-against-brother',
  name: 'Brother Against Brother',
  description:
    `The Raiders attacked a Settler farm. The Apache want to finish them off. But this ` +
    `family saved a Nahi child during a flood years ago. Honor versus vengeance.`,
  type: 'side',
  specialFlags: { factionRequired: 'nahi_coalition' },
  levelRequired: 18,
  prerequisites: ['nahi:the-sacred-site'],
  objectives: [
    {
      id: 'reach-farm',
      description: 'Reach the besieged farm',
      type: 'visit',
      target: 'location:settler-farm',
      required: 1
    },
    {
      id: 'speak-raiders',
      description: 'Speak with the Raider war party',
      type: 'visit',
      target: 'npc:raider-leader',
      required: 1
    },
    {
      id: 'learn-history',
      description: 'Learn the farm\'s history with the Nahi',
      type: 'visit',
      target: 'npc:farm-family',
      required: 1
    },
    {
      id: 'make-choice',
      description: 'Choose: Defend the farm OR Honor tribal vengeance',
      type: 'visit',
      target: 'decision:farm-fate',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1300 },
    { type: 'dollars', amount: 750 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"They killed our people. Now we kill theirs." The Raider points at the farm. ` +
    `"But wait - that family. They saved little Moon Feather from the flood. ` +
    `The spirits are not clear on this."`,
  dialogueComplete:
    `The choice is made. Mercy or vengeance. Both have consequences. ` +
    `Both will be remembered.`
};

export const NAHI_OLD_WAYS: QuestSeedData = {
  questId: 'nahi:the-old-ways',
  name: 'The Old Ways',
  description:
    `Kaiowa elders want to perform a ritual to "cleanse the land" of the Railroad's ` +
    `corruption. Guard the ceremony from Pinkerton disruption. Something ancient awakens.`,
  type: 'side',
  specialFlags: { factionRequired: 'nahi_coalition' },
  levelRequired: 19,
  prerequisites: ['nahi:brother-against-brother'],
  objectives: [
    {
      id: 'meet-elders',
      description: 'Meet the Kaiowa elders at the ritual site',
      type: 'visit',
      target: 'npc:kaiowa-elders',
      required: 1
    },
    {
      id: 'prepare-site',
      description: 'Help prepare the ritual site',
      type: 'collect',
      target: 'item:ritual-components',
      required: 5
    },
    {
      id: 'defend-wave-1',
      description: 'Defend against Pinkerton assault (Wave 1)',
      type: 'kill',
      target: 'npc:pinkerton-assault',
      required: 1
    },
    {
      id: 'defend-wave-2',
      description: 'Defend against Pinkerton assault (Wave 2)',
      type: 'kill',
      target: 'npc:pinkerton-assault',
      required: 1
    },
    {
      id: 'witness-ritual',
      description: 'Witness the completion of the ritual',
      type: 'visit',
      target: 'event:ritual-completion',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1400 },
    { type: 'dollars', amount: 800 },
    { type: 'item', itemId: 'blessing-of-ancestors' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"The land is sick. The iron serpent poisons it. But the old ways have power still. ` +
    `We will call upon the ancestors. Guard us while we sing."`,
  dialogueComplete:
    `The ritual is complete. Something stirs in the land. The elders say the ancestors ` +
    `are pleased. The Pinkertons say it was "just weather." You're not so sure.`
};

export const NAHI_TRADER_GAMBIT: QuestSeedData = {
  questId: 'nahi:the-traders-gambit',
  name: 'The Trader\'s Gambit',
  description:
    `The Pueblo Traders are selling weapons to ALL sides - including the Railroad. ` +
    `Are they traitors, or playing a deeper game? Investigation reveals an intel network.`,
  type: 'side',
  specialFlags: { factionRequired: 'nahi_coalition' },
  levelRequired: 20,
  prerequisites: ['nahi:the-old-ways'],
  objectives: [
    {
      id: 'investigate-traders',
      description: 'Investigate Pueblo trading operations',
      type: 'visit',
      target: 'location:pueblo-trading-post',
      required: 1
    },
    {
      id: 'follow-shipment',
      description: 'Follow a weapons shipment',
      type: 'skill',
      target: 'skill:tracking',
      required: 1
    },
    {
      id: 'discover-truth',
      description: 'Discover the truth about their operations',
      type: 'visit',
      target: 'npc:pueblo-master-trader',
      required: 1
    },
    {
      id: 'decide-action',
      description: 'Choose: Expose them OR Use their intel network',
      type: 'visit',
      target: 'decision:trader-fate',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1500 },
    { type: 'dollars', amount: 900 },
    { type: 'reputation', faction: 'nahi_coalition', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"The Pueblo sell guns to the Railroad? To our enemies? This cannot stand!" ` +
    `But nothing is as simple as it seems. Perhaps they have their reasons.`,
  dialogueComplete:
    `The Pueblo's game is revealed. Every weapon sold was a conversation. Every ` +
    `transaction a transaction of information. Clever? Or treacherous?`
};

export const NAHI_WAR_CHIEF: QuestSeedData = {
  questId: 'nahi:the-war-chief',
  name: 'The War Chief',
  description:
    `The Apache War Band's chief challenges you. Not just combat - a series of trials. ` +
    `Hunt, Endure, Wisdom. Win his respect or the Coalition fractures forever.`,
  type: 'side',
  specialFlags: { factionRequired: 'nahi_coalition' },
  levelRequired: 21,
  prerequisites: ['nahi:the-traders-gambit'],
  objectives: [
    {
      id: 'accept-challenge',
      description: 'Accept the War Chief\'s challenge',
      type: 'visit',
      target: 'npc:apache-war-chief',
      required: 1
    },
    {
      id: 'trial-hunt',
      description: 'Trial of the Hunt: Track and kill a mountain lion',
      type: 'kill',
      target: 'npc:great-mountain-lion',
      required: 1
    },
    {
      id: 'trial-endurance',
      description: 'Trial of Endurance: Survive three days in the wilderness',
      type: 'skill',
      target: 'skill:survival',
      required: 3
    },
    {
      id: 'trial-wisdom',
      description: 'Trial of Wisdom: Solve the War Chief\'s moral dilemma',
      type: 'visit',
      target: 'decision:wisdom-trial',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1800 },
    { type: 'dollars', amount: 1000 },
    { type: 'reputation', faction: 'nahi_coalition', amount: 40 },
    { type: 'item', itemId: 'war-chiefs-tomahawk' }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"You speak of unity. You speak of fighting together. But are you WORTHY to stand ` +
    `beside the Apache? Prove yourself. Hunt. Endure. Think. Then we will see."`,
  dialogueComplete:
    `The War Chief nods. "You have earned my respect. Perhaps... you have earned the ` +
    `Coalition's unity. Perhaps we can fight as one after all."`
};

export const NAHI_LAST_BUFFALO: QuestSeedData = {
  questId: 'nahi:the-last-buffalo',
  name: 'The Last Buffalo',
  description:
    `The Railroad is deliberately killing buffalo to starve the tribes. Discover the ` +
    `conspiracy. Save a herd from slaughter. Confront the Railroad executive.`,
  type: 'side',
  specialFlags: { factionRequired: 'nahi_coalition' },
  levelRequired: 22,
  prerequisites: ['nahi:the-war-chief'],
  objectives: [
    {
      id: 'discover-conspiracy',
      description: 'Discover the buffalo slaughter conspiracy',
      type: 'visit',
      target: 'location:railroad-hunting-camp',
      required: 1
    },
    {
      id: 'find-herd',
      description: 'Find the last major buffalo herd',
      type: 'skill',
      target: 'skill:tracking',
      required: 1
    },
    {
      id: 'save-herd',
      description: 'Save the herd from the railroad hunters',
      type: 'kill',
      target: 'npc:railroad-hunters',
      required: 1
    },
    {
      id: 'confront-executive',
      description: 'Confront the Railroad executive (leads to boss)',
      type: 'visit',
      target: 'npc:railroad-executive',
      required: 1
    },
    {
      id: 'defeat-volkov',
      description: 'Defeat "The Hammer" Volkov',
      type: 'kill',
      target: 'boss:hammer-volkov',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2000 },
    { type: 'dollars', amount: 1200 },
    { type: 'reputation', faction: 'nahi_coalition', amount: 50 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"The buffalo are dying. Not from disease. Not from drought. From bullets. ` +
    `Railroad bullets. They're killing our food to kill us."`,
  dialogueComplete:
    `The herd is saved. The enforcer is defeated. The Coalition stands united against ` +
    `this atrocity. The Railroad has made a terrible enemy this day.`
};

// =============================================================================
// FRONTERA EXCLUSIVE (6 quests) - "Blood Money"
// Theme: Survival at any cost, but is your soul the price?
// =============================================================================

export const FRONTERA_SMUGGLERS_ROUTE: QuestSeedData = {
  questId: 'frontera:the-smugglers-route',
  name: 'The Smuggler\'s Route',
  description:
    `Establish a new smuggling route past Railroad checkpoints. What you smuggle ` +
    `determines your moral trajectory: medicine for refugees, weapons for Nahi, ` +
    `or opium for Railroad camps.`,
  type: 'side',
  specialFlags: { factionRequired: 'frontera' },
  levelRequired: 16,
  prerequisites: ['justice:aftermath-of-red-creek'],
  objectives: [
    {
      id: 'scout-routes',
      description: 'Scout potential smuggling routes',
      type: 'skill',
      target: 'skill:stealth',
      required: 3
    },
    {
      id: 'establish-route',
      description: 'Establish the safest route',
      type: 'visit',
      target: 'location:smuggling-route',
      required: 1
    },
    {
      id: 'choose-cargo',
      description: 'Choose your cargo: Medicine, Weapons, or Opium',
      type: 'visit',
      target: 'decision:smuggling-cargo',
      required: 1
    },
    {
      id: 'complete-run',
      description: 'Complete your first smuggling run',
      type: 'skill',
      target: 'skill:stealth',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1100 },
    { type: 'dollars', amount: 700 },
    { type: 'reputation', faction: 'frontera', amount: 25 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"The Railroad controls the roads. But they don't control the night. We need ` +
    `someone who can move in shadows. What you carry... that's your choice."`,
  dialogueComplete:
    `The route is established. The cargo delivered. Your reputation grows in the ` +
    `underground. But what kind of reputation depends on what you chose to carry.`
};

export const FRONTERA_CANTINA_NETWORK: QuestSeedData = {
  questId: 'frontera:the-cantina-network',
  name: 'The Cantina Network',
  description:
    `Frontera's cantinas are the information hubs of the frontier. Recruit cantina ` +
    `owners as informants. Every drink poured is a secret heard.`,
  type: 'side',
  specialFlags: { factionRequired: 'frontera' },
  levelRequired: 17,
  prerequisites: ['frontera:the-smugglers-route'],
  objectives: [
    {
      id: 'visit-cantinas',
      description: 'Visit three key cantinas',
      type: 'visit',
      target: 'location:cantinas',
      required: 3
    },
    {
      id: 'recruit-owners',
      description: 'Recruit cantina owners as informants',
      type: 'skill',
      target: 'skill:persuasion',
      required: 3
    },
    {
      id: 'establish-signals',
      description: 'Establish secret signal systems',
      type: 'skill',
      target: 'skill:cunning',
      required: 1
    },
    {
      id: 'test-network',
      description: 'Test the network with a message',
      type: 'deliver',
      target: 'npc:network-contact',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1200 },
    { type: 'dollars', amount: 750 },
    { type: 'reputation', faction: 'frontera', amount: 30 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"Information is worth more than gold on the frontier. Every cantina is a listening ` +
    `post. Every bartender a spy. Build me a network."`,
  dialogueComplete:
    `The cantina network is operational. Secrets flow like tequila. Intel contracts ` +
    `now pay 25% more. The frontier has no secrets from Frontera.`
};

export const FRONTERA_LOS_BANDIDOS: QuestSeedData = {
  questId: 'frontera:los-bandidos',
  name: 'Los Bandidos',
  description:
    `A legendary Frontera bandit gang offers alliance. Their leader, "El Coyote," ` +
    `is charismatic and has a code. Join them, use them, or betray them.`,
  type: 'side',
  specialFlags: { factionRequired: 'frontera' },
  levelRequired: 18,
  prerequisites: ['frontera:the-cantina-network'],
  objectives: [
    {
      id: 'meet-bandidos',
      description: 'Meet Los Bandidos at their hideout',
      type: 'visit',
      target: 'location:bandido-hideout',
      required: 1
    },
    {
      id: 'prove-worth',
      description: 'Prove your worth to El Coyote',
      type: 'kill',
      target: 'npc:bandido-test',
      required: 1
    },
    {
      id: 'learn-code',
      description: 'Learn El Coyote\'s code of honor',
      type: 'visit',
      target: 'npc:el-coyote',
      required: 1
    },
    {
      id: 'choose-alliance',
      description: 'Choose: Join, Use, or Betray Los Bandidos',
      type: 'visit',
      target: 'decision:bandido-alliance',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1300 },
    { type: 'dollars', amount: 800 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `El Coyote grins behind his mask. "So, the famous one comes to see the infamous ` +
    `ones. We're alike, you and I. The question is - are we partners, pawns, or enemies?"`,
  dialogueComplete:
    `Your relationship with Los Bandidos is established. Whether as allies, assets, ` +
    `or enemies - El Coyote will remember.`
};

export const FRONTERA_THE_PRIEST: QuestSeedData = {
  questId: 'frontera:the-priest',
  name: 'The Priest',
  description:
    `A Catholic priest is sheltering refugees in his church. The Railroad wants to ` +
    `burn it down. Defend the church and discover the priest's secret: a fortune in gold.`,
  type: 'side',
  specialFlags: { factionRequired: 'frontera' },
  levelRequired: 19,
  prerequisites: ['frontera:los-bandidos'],
  objectives: [
    {
      id: 'meet-priest',
      description: 'Meet Father Miguel at the church',
      type: 'visit',
      target: 'npc:father-miguel',
      required: 1
    },
    {
      id: 'defend-wave-1',
      description: 'Defend against the first Railroad assault',
      type: 'kill',
      target: 'npc:railroad-thugs',
      required: 1
    },
    {
      id: 'defend-wave-2',
      description: 'Defend against the second Railroad assault',
      type: 'kill',
      target: 'npc:railroad-thugs',
      required: 1
    },
    {
      id: 'defend-wave-3',
      description: 'Defend against the final Railroad assault',
      type: 'kill',
      target: 'npc:railroad-thugs',
      required: 1
    },
    {
      id: 'discover-secret',
      description: 'Discover the priest\'s hidden gold',
      type: 'visit',
      target: 'location:church-basement',
      required: 1
    },
    {
      id: 'choose-gold',
      description: 'Choose: Take the gold OR Leave it for refugees',
      type: 'visit',
      target: 'decision:priest-gold',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1500 },
    { type: 'dollars', amount: 900 },
    { type: 'reputation', faction: 'frontera', amount: 35 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `Father Miguel's hands are steady as he loads a shotgun. "The Lord helps those ` +
    `who help themselves. And today, we help ourselves to Railroad blood."`,
  dialogueComplete:
    `The church stands. The refugees are safe. The gold... that's between you and ` +
    `your conscience.`
};

export const FRONTERA_GOVERNORS_DAUGHTER: QuestSeedData = {
  questId: 'frontera:the-governors-daughter',
  name: 'The Governor\'s Daughter',
  description:
    `A Mexican governor's daughter has been kidnapped by Pinkertons. If she's harmed, ` +
    `Mexico might intervene militarily. But the truth is more complicated: she's eloping.`,
  type: 'side',
  specialFlags: { factionRequired: 'frontera' },
  levelRequired: 20,
  prerequisites: ['frontera:the-priest'],
  objectives: [
    {
      id: 'receive-mission',
      description: 'Receive the rescue mission from Mexican contacts',
      type: 'visit',
      target: 'npc:mexican-contact',
      required: 1
    },
    {
      id: 'locate-camp',
      description: 'Locate the Pinkerton camp',
      type: 'skill',
      target: 'skill:tracking',
      required: 1
    },
    {
      id: 'infiltrate-camp',
      description: 'Infiltrate the camp',
      type: 'skill',
      target: 'skill:stealth',
      required: 1
    },
    {
      id: 'discover-truth',
      description: 'Discover she\'s eloping, not kidnapped',
      type: 'visit',
      target: 'npc:governors-daughter',
      required: 1
    },
    {
      id: 'choose-outcome',
      description: 'Choose: Return her OR Help the lovers escape',
      type: 'visit',
      target: 'decision:daughter-fate',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 1600 },
    { type: 'dollars', amount: 1000 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"The governor's daughter. Taken by Pinkertons. If she dies, Mexico sends the army. ` +
    `Get her back. Whatever it takes." But nothing is ever simple on the frontier.`,
  dialogueComplete:
    `The situation is resolved. Whether through diplomacy, deception, or romance, ` +
    `the political crisis is averted. Mexico stays on their side of the border.`
};

export const FRONTERA_BLOOD_MONEY: QuestSeedData = {
  questId: 'frontera:blood-money',
  name: 'Blood Money',
  description:
    `The Railroad offers Frontera a deal: stop supporting the war, receive massive ` +
    `payment. You must advise the council. Accept, reject, or double-cross?`,
  type: 'side',
  specialFlags: { factionRequired: 'frontera' },
  levelRequired: 22,
  prerequisites: ['frontera:the-governors-daughter'],
  objectives: [
    {
      id: 'attend-council',
      description: 'Attend the Frontera council meeting',
      type: 'visit',
      target: 'location:frontera-council',
      required: 1
    },
    {
      id: 'hear-offer',
      description: 'Hear the Railroad\'s offer',
      type: 'visit',
      target: 'npc:railroad-negotiator',
      required: 1
    },
    {
      id: 'consult-leaders',
      description: 'Consult with Frontera leaders',
      type: 'visit',
      target: 'npc:frontera-leaders',
      required: 3
    },
    {
      id: 'give-advice',
      description: 'Give your advice to the council',
      type: 'visit',
      target: 'decision:blood-money-advice',
      required: 1
    },
    {
      id: 'implement-decision',
      description: 'Help implement the council\'s decision',
      type: 'skill',
      target: 'skill:chosen-path',
      required: 1
    }
  ],
  rewards: [
    { type: 'xp', amount: 2000 },
    { type: 'dollars', amount: 1500 },
    { type: 'reputation', faction: 'frontera', amount: 50 }
  ],
  repeatable: false,
  isActive: true,
  dialogueIntro:
    `"They're offering us a fortune. Enough to buy our way out of this war. ` +
    `But can we trust them? Should we? The decision will shape Frontera's future."`,
  dialogueComplete:
    `The council has decided. Frontera's path is set. Whether through acceptance, ` +
    `resistance, or cunning betrayal - the blood money question is answered.`
};

// =============================================================================
// EXPORTS
// =============================================================================

export const FRONTIER_JUSTICE_QUESTS: QuestSeedData[] = [
  // Universal Arc (10 quests)
  JUSTICE_AFTERMATH_RED_CREEK,
  JUSTICE_PINKERTONS_ARRIVE,
  JUSTICE_LINES_REDRAWN,
  JUSTICE_THE_OLD_TIMER,
  JUSTICE_FIRST_CONTRACT,
  JUSTICE_WHISPERS_WIRE,
  JUSTICE_THE_TRAITOR,
  JUSTICE_MORRISON_REVEALED,
  JUSTICE_ALLIANCE_DESPERATION,
  JUSTICE_IRON_HORSE_GAMBIT,

  // Settler Alliance Exclusive (7 quests)
  SETTLER_HOMESTEADER_CRISIS,
  SETTLER_COMPANY_TOWN,
  SETTLER_BLOOD_SOIL,
  SETTLER_CATTLE_BARON,
  SETTLER_GHOST_FRONTIER,
  SETTLER_RAILROAD_WIVES,
  SETTLER_MANIFEST_DESTINY,

  // Nahi Coalition Exclusive (7 quests)
  NAHI_COUNCIL_TRIBES,
  NAHI_SACRED_SITE,
  NAHI_BROTHER_AGAINST_BROTHER,
  NAHI_OLD_WAYS,
  NAHI_TRADER_GAMBIT,
  NAHI_WAR_CHIEF,
  NAHI_LAST_BUFFALO,

  // Frontera Exclusive (6 quests)
  FRONTERA_SMUGGLERS_ROUTE,
  FRONTERA_CANTINA_NETWORK,
  FRONTERA_LOS_BANDIDOS,
  FRONTERA_THE_PRIEST,
  FRONTERA_GOVERNORS_DAUGHTER,
  FRONTERA_BLOOD_MONEY,
];

/**
 * Get quest by ID
 */
export function getFrontierJusticeQuestById(questId: string): QuestSeedData | undefined {
  return FRONTIER_JUSTICE_QUESTS.find(q => q.questId === questId);
}

/**
 * Get quests by faction
 */
export function getFrontierJusticeQuestsByFaction(factionId: string): QuestSeedData[] {
  return FRONTIER_JUSTICE_QUESTS.filter(
    q => (q.specialFlags as { factionRequired?: string })?.factionRequired === factionId ||
         !(q.specialFlags as { factionRequired?: string })?.factionRequired
  );
}

/**
 * Get universal quests (available to all factions)
 */
export function getUniversalQuests(): QuestSeedData[] {
  return FRONTIER_JUSTICE_QUESTS.filter(
    q => !(q.specialFlags as { factionRequired?: string })?.factionRequired
  );
}

/**
 * Get quests by level range
 */
export function getFrontierJusticeQuestsByLevel(
  minLevel: number,
  maxLevel: number
): QuestSeedData[] {
  return FRONTIER_JUSTICE_QUESTS.filter(
    q => q.levelRequired >= minLevel && q.levelRequired <= maxLevel
  );
}
