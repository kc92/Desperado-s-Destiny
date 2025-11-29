/**
 * Quest Templates
 *
 * Procedural templates for generating dynamic quests.
 * Part of Phase D - Content Explosion System
 *
 * 30 base templates that create hundreds of unique quest variations
 * through variable substitution and dynamic objectives.
 */

// ============================================================================
// TYPES
// ============================================================================

export type QuestType =
  | 'fetch'
  | 'kill'
  | 'escort'
  | 'investigate'
  | 'delivery'
  | 'social'
  | 'heist'
  | 'bounty'
  | 'rescue'
  | 'sabotage';

export type ObjectiveType =
  | 'find_item'
  | 'kill_target'
  | 'visit_location'
  | 'talk_to_npc'
  | 'deliver_item'
  | 'collect_items'
  | 'protect_npc'
  | 'steal_item'
  | 'investigate_location'
  | 'escape_location'
  | 'gather_information'
  | 'defeat_gang'
  | 'earn_gold'
  | 'survive_time';

export interface ObjectiveTemplate {
  type: ObjectiveType;
  description: string;
  target?: string; // Variable like '{NPC}' or '{ITEM}'
  location?: string; // Variable like '{LOCATION}'
  count?: number | string; // Can be static or variable like '{COUNT}'
  optional?: boolean;
  hidden?: boolean; // Reveal only when previous objective complete
}

export interface RewardTemplate {
  gold?: string; // Can be formula like '{BASE_GOLD}' or '100-200'
  xp?: string;
  item?: string;
  reputation?: { faction: string; amount: string }[];
  unlock?: string; // Unlock ID
}

export interface QuestTemplate {
  id: string;
  type: QuestType;
  title: string; // Template with variables
  description: string; // Template with variables
  briefing?: string; // Extended template for quest giver dialogue
  objectives: ObjectiveTemplate[];
  rewards: RewardTemplate;
  prerequisites?: string[]; // Quest IDs or conditions
  levelRange?: { min: number; max: number };
  timeLimit?: string; // Minutes or 'none'
  repeatable?: boolean;
  failConditions?: string[];
  consequences?: any; // Quest consequences/outcomes
  tags?: string[]; // For filtering (e.g., 'violent', 'stealth', 'social')
  giverRoles?: string[]; // NPC roles that can give this quest
  factionAlignment?: string; // Which faction benefits
}

// ============================================================================
// FETCH QUESTS (5 templates)
// ============================================================================

export const FETCH_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'fetch_lost_item',
    type: 'fetch',
    title: "{NPC}'s Lost {ITEM}",
    description:
      "{NPC} has lost their precious {ITEM} somewhere near {LOCATION}. They last remember having it when they were {ACTIVITY}. Find it and return it for a reward.",
    briefing:
      "I've been searching everywhere for my {ITEM}! I had it just yesterday at {LOCATION}. I was {ACTIVITY} when I must have set it down. It has great sentimental value - belonged to my {FAMILY_MEMBER}. Please, can you find it?",
    objectives: [
      {
        type: 'visit_location',
        description: 'Search {LOCATION} for the {ITEM}',
        location: '{LOCATION}',
      },
      {
        type: 'find_item',
        description: 'Retrieve the {ITEM}',
        target: '{ITEM}',
      },
      {
        type: 'talk_to_npc',
        description: 'Return the {ITEM} to {NPC}',
        target: '{NPC}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '50',
      reputation: [{ faction: 'settlerAlliance', amount: '10' }],
    },
    levelRange: { min: 1, max: 10 },
    tags: ['non-violent', 'exploration'],
    giverRoles: ['merchant', 'rancher', 'doctor', 'preacher'],
  },
  {
    id: 'fetch_rare_ingredient',
    type: 'fetch',
    title: 'Rare {ITEM} for {NPC}',
    description:
      "{NPC} needs a rare {ITEM} that can only be found at {LOCATION}. It's dangerous territory, but the pay is good.",
    briefing:
      "I require a very specific {ITEM} for my work. It only grows at {LOCATION}, and I'm too old for such ventures. The {DANGER} there makes it treacherous, but I'll pay handsomely for your trouble.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Travel to {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'collect_items',
        description: 'Gather {COUNT} {ITEM}',
        target: '{ITEM}',
        count: '{COUNT}',
      },
      {
        type: 'talk_to_npc',
        description: 'Deliver the {ITEM} to {NPC}',
        target: '{NPC}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '75',
      item: '{BONUS_ITEM}',
    },
    levelRange: { min: 5, max: 20 },
    tags: ['exploration', 'danger'],
    giverRoles: ['doctor', 'merchant'],
  },
  {
    id: 'fetch_stolen_property',
    type: 'fetch',
    title: 'Recover {NPC}\'s Stolen {ITEM}',
    description:
      "{THIEF} stole {NPC}'s valuable {ITEM}. Track them to {LOCATION} and get it back - by any means necessary.",
    briefing:
      "That snake {THIEF} broke into my place and stole my {ITEM}! Word is they're hiding out at {LOCATION}. I don't care how you get it back, but I want that {ITEM}. And maybe teach {THIEF} a lesson while you're at it.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Track {THIEF} to {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'find_item',
        description: 'Recover the stolen {ITEM}',
        target: '{ITEM}',
      },
      {
        type: 'talk_to_npc',
        description: 'Return the {ITEM} to {NPC}',
        target: '{NPC}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '60',
      reputation: [{ faction: 'settlerAlliance', amount: '15' }],
    },
    levelRange: { min: 3, max: 15 },
    tags: ['confrontation', 'theft'],
    giverRoles: ['merchant', 'banker', 'rancher'],
  },
  {
    id: 'fetch_family_heirloom',
    type: 'fetch',
    title: 'The {FAMILY} Family Heirloom',
    description:
      "An ancient {ITEM} belonging to the {FAMILY} family was buried with their ancestor at {LOCATION}. The family needs it recovered for a {REASON}.",
    briefing:
      "This is a delicate matter. My {FAMILY_MEMBER} was buried at {LOCATION} with a {ITEM} that we desperately need now. For the {REASON}, we must have it. I know it sounds morbid, but please, our family's future depends on it.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Travel to {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'find_item',
        description: 'Locate the {ITEM} at the burial site',
        target: '{ITEM}',
      },
      {
        type: 'talk_to_npc',
        description: 'Return the heirloom to {NPC}',
        target: '{NPC}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '80',
      reputation: [{ faction: '{FACTION}', amount: '20' }],
    },
    levelRange: { min: 5, max: 25 },
    tags: ['grave_robbing', 'family'],
    giverRoles: ['merchant', 'banker', 'preacher'],
  },
  {
    id: 'fetch_supplies',
    type: 'fetch',
    title: 'Supply Run to {DESTINATION}',
    description:
      "{NPC} needs supplies delivered from {ORIGIN} to {DESTINATION}. Simple work, but the road has been dangerous lately.",
    briefing:
      "I've got an order of {ITEM} waiting at {ORIGIN} that needs to get to {DESTINATION}. The usual courier hasn't shown up - probably scared off by the {DANGER} on the road. I need someone reliable. You interested?",
    objectives: [
      {
        type: 'visit_location',
        description: 'Pick up supplies at {ORIGIN}',
        location: '{ORIGIN}',
      },
      {
        type: 'deliver_item',
        description: 'Deliver {ITEM} to {DESTINATION}',
        target: '{ITEM}',
        location: '{DESTINATION}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '40',
    },
    levelRange: { min: 1, max: 10 },
    repeatable: true,
    tags: ['delivery', 'travel'],
    giverRoles: ['merchant', 'bartender'],
  },
];

// ============================================================================
// KILL/BOUNTY QUESTS (5 templates)
// ============================================================================

export const KILL_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'bounty_outlaw',
    type: 'bounty',
    title: 'Wanted: {TARGET}',
    description:
      "{TARGET} is wanted dead or alive for {CRIME}. Last seen near {LOCATION}. Bounty: {BOUNTY} gold.",
    briefing:
      "{TARGET} has been terrorizing this territory long enough. The crimes include {CRIME}, and the law wants them brought to justice. They run with {GANG_COUNT} associates and were last spotted near {LOCATION}. Dead or alive pays the same. Just bring proof.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Track {TARGET} to {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'kill_target',
        description: 'Neutralize {TARGET}',
        target: '{TARGET}',
      },
      {
        type: 'talk_to_npc',
        description: 'Collect bounty from {SHERIFF}',
        target: '{SHERIFF}',
      },
    ],
    rewards: {
      gold: '{BOUNTY}',
      xp: '100',
      reputation: [{ faction: 'settlerAlliance', amount: '25' }],
    },
    levelRange: { min: 10, max: 30 },
    tags: ['violent', 'bounty_hunting'],
    giverRoles: ['sheriff'],
    factionAlignment: 'settlerAlliance',
  },
  {
    id: 'kill_predator',
    type: 'kill',
    title: 'Hunt the {PREDATOR}',
    description:
      "A dangerous {PREDATOR} has been killing livestock near {LOCATION}. The ranchers are offering a reward to whoever puts it down.",
    briefing:
      "We've lost {COUNT} head of cattle to this beast already. It's a big {PREDATOR}, meaner than anything I've seen. Tracks lead toward {LOCATION}. We need it dead before it gets bolder and goes after people. The ranchers' association is offering good money.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Track the {PREDATOR} to {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'kill_target',
        description: 'Kill the {PREDATOR}',
        target: '{PREDATOR}',
      },
      {
        type: 'talk_to_npc',
        description: 'Report to {NPC}',
        target: '{NPC}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '80',
      item: '{TROPHY}',
    },
    levelRange: { min: 5, max: 20 },
    tags: ['hunting', 'animal'],
    giverRoles: ['rancher', 'sheriff'],
  },
  {
    id: 'kill_gang_members',
    type: 'kill',
    title: 'Clear Out {GANG}',
    description:
      "{GANG} has set up camp at {LOCATION}. The law needs someone to clear them out before they cause more trouble.",
    briefing:
      "{GANG} has been bold lately. They've set up at {LOCATION} and have been {CRIME} anyone who passes by. We don't have the manpower for a frontal assault, but one skilled individual could slip in and take care of the problem. Interested?",
    objectives: [
      {
        type: 'visit_location',
        description: 'Infiltrate {GANG} camp at {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'defeat_gang',
        description: 'Eliminate {COUNT} {GANG} members',
        target: '{GANG}',
        count: '{COUNT}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '120',
      reputation: [{ faction: 'settlerAlliance', amount: '30' }],
    },
    levelRange: { min: 10, max: 25 },
    tags: ['violent', 'gang'],
    giverRoles: ['sheriff'],
    factionAlignment: 'settlerAlliance',
  },
  {
    id: 'kill_rival',
    type: 'kill',
    title: '{NPC}\'s Revenge',
    description:
      "{NPC} wants {TARGET} dead for {REASON}. No questions asked, payment on completion.",
    briefing:
      "{TARGET} wronged me in ways you don't need to know. Let's just say {REASON}. I want them dead. I don't care how, and I don't want to know the details. {GOLD} gold when you bring proof. This stays between us.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Find {TARGET}',
        location: '{LOCATION}',
      },
      {
        type: 'kill_target',
        description: 'Eliminate {TARGET}',
        target: '{TARGET}',
      },
      {
        type: 'talk_to_npc',
        description: 'Report to {NPC}',
        target: '{NPC}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '90',
      reputation: [{ faction: 'frontera', amount: '15' }],
    },
    consequences: {
      reputation: [{ faction: 'settlerAlliance', amount: '-20' }],
    },
    levelRange: { min: 8, max: 25 },
    tags: ['murder', 'dark'],
    giverRoles: ['outlaw', 'merchant'],
    factionAlignment: 'frontera',
  },
  {
    id: 'bounty_gang_leader',
    type: 'bounty',
    title: 'The Head of {GANG}',
    description:
      "The leader of {GANG}, known as {TARGET}, has a massive bounty. They're holed up at {LOCATION} with their crew.",
    briefing:
      "{TARGET} is the most wanted criminal in the territory. They lead {GANG} and are responsible for {CRIME}. The bounty is substantial - {BOUNTY} gold. But they won't go down easy. They've got a small army at {LOCATION}. This is not for the faint of heart.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Assault {GANG} stronghold at {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'kill_target',
        description: 'Eliminate {TARGET}',
        target: '{TARGET}',
      },
      {
        type: 'talk_to_npc',
        description: 'Claim bounty from {SHERIFF}',
        target: '{SHERIFF}',
      },
    ],
    rewards: {
      gold: '{BOUNTY}',
      xp: '200',
      reputation: [{ faction: 'settlerAlliance', amount: '50' }],
    },
    levelRange: { min: 20, max: 40 },
    tags: ['violent', 'major', 'bounty_hunting'],
    giverRoles: ['sheriff'],
    factionAlignment: 'settlerAlliance',
  },
];

// ============================================================================
// ESCORT QUESTS (4 templates)
// ============================================================================

export const ESCORT_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'escort_traveler',
    type: 'escort',
    title: 'Escort {NPC} to {DESTINATION}',
    description:
      "{NPC} needs safe passage to {DESTINATION}. The road is dangerous, and they're willing to pay for protection.",
    briefing:
      "I must get to {DESTINATION} for {REASON}, but the road isn't safe for someone traveling alone. {DANGER} have been hitting travelers regularly. I'll pay {GOLD} gold if you can get me there safely. I can leave whenever you're ready.",
    objectives: [
      {
        type: 'talk_to_npc',
        description: 'Meet {NPC}',
        target: '{NPC}',
      },
      {
        type: 'protect_npc',
        description: 'Escort {NPC} to {DESTINATION}',
        target: '{NPC}',
        location: '{DESTINATION}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '70',
      reputation: [{ faction: 'settlerAlliance', amount: '15' }],
    },
    failConditions: ['{NPC} dies'],
    levelRange: { min: 5, max: 20 },
    tags: ['escort', 'protection'],
    giverRoles: ['merchant', 'preacher', 'doctor'],
  },
  {
    id: 'escort_witness',
    type: 'escort',
    title: 'Protect the Witness',
    description:
      "{NPC} witnessed {CRIME} and needs to testify at {DESTINATION}. {GANG} wants them dead before they can talk.",
    briefing:
      "This person saw {TARGET} commit {CRIME}. Their testimony could put {TARGET} away for good. But {GANG} has put a price on their head. We need to get them to {DESTINATION} alive. The territory's counting on you.",
    objectives: [
      {
        type: 'talk_to_npc',
        description: 'Meet the witness at {ORIGIN}',
        target: '{NPC}',
        location: '{ORIGIN}',
      },
      {
        type: 'protect_npc',
        description: 'Get the witness safely to {DESTINATION}',
        target: '{NPC}',
        location: '{DESTINATION}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '100',
      reputation: [{ faction: 'settlerAlliance', amount: '30' }],
    },
    failConditions: ['{NPC} dies'],
    levelRange: { min: 10, max: 25 },
    tags: ['escort', 'danger', 'law'],
    giverRoles: ['sheriff'],
    factionAlignment: 'settlerAlliance',
  },
  {
    id: 'escort_payroll',
    type: 'escort',
    title: 'Payroll Guard',
    description:
      "Guard the payroll shipment from {ORIGIN} to {DESTINATION}. {GOLD} gold is at stake, and bandits will be watching.",
    briefing:
      "We've got {GOLD} gold in payroll that needs to get from {ORIGIN} to {DESTINATION}. Every outlaw in the territory knows about these shipments. I need armed guards who won't run at the first sign of trouble. You'll get a cut of the delivery bonus.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Secure the payroll at {ORIGIN}',
        location: '{ORIGIN}',
      },
      {
        type: 'deliver_item',
        description: 'Deliver payroll to {DESTINATION}',
        target: 'payroll',
        location: '{DESTINATION}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '85',
      reputation: [{ faction: 'settlerAlliance', amount: '20' }],
    },
    levelRange: { min: 8, max: 20 },
    tags: ['escort', 'valuable', 'danger'],
    giverRoles: ['banker', 'sheriff'],
  },
  {
    id: 'escort_prisoner',
    type: 'escort',
    title: 'Transport Prisoner to {DESTINATION}',
    description:
      "{TARGET} has been captured and needs to be transported to {DESTINATION} for trial. Their gang will try to free them.",
    briefing:
      "We finally caught {TARGET}, but we can't hold them here. They need to be transferred to {DESTINATION} where there's a proper facility. {GANG} will try to break them out, so we need someone who can handle trouble. This is official law business.",
    objectives: [
      {
        type: 'talk_to_npc',
        description: 'Collect prisoner from {SHERIFF}',
        target: '{SHERIFF}',
      },
      {
        type: 'deliver_item',
        description: 'Deliver {TARGET} to {DESTINATION}',
        target: '{TARGET}',
        location: '{DESTINATION}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '110',
      reputation: [{ faction: 'settlerAlliance', amount: '35' }],
    },
    failConditions: ['{TARGET} escapes'],
    levelRange: { min: 12, max: 28 },
    tags: ['escort', 'law', 'danger'],
    giverRoles: ['sheriff'],
    factionAlignment: 'settlerAlliance',
  },
];

// ============================================================================
// INVESTIGATION QUESTS (4 templates)
// ============================================================================

export const INVESTIGATION_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'investigate_murder',
    type: 'investigate',
    title: 'The {VICTIM} Murder',
    description:
      "{VICTIM} was found dead at {LOCATION}. The sheriff needs someone to investigate and find the killer.",
    briefing:
      "{VICTIM} was a respected member of this community. Found them dead at {LOCATION} this morning. The scene was {DESCRIPTION}. I need someone with a keen eye to investigate. Talk to people, look for clues. Find who did this.",
    objectives: [
      {
        type: 'investigate_location',
        description: 'Examine the crime scene at {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'gather_information',
        description: 'Question {COUNT} witnesses',
        count: '{COUNT}',
      },
      {
        type: 'find_item',
        description: 'Find evidence',
        target: 'evidence',
      },
      {
        type: 'talk_to_npc',
        description: 'Report findings to {SHERIFF}',
        target: '{SHERIFF}',
        hidden: true,
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '100',
      reputation: [{ faction: 'settlerAlliance', amount: '25' }],
    },
    levelRange: { min: 8, max: 25 },
    tags: ['investigation', 'mystery'],
    giverRoles: ['sheriff'],
  },
  {
    id: 'investigate_disappearance',
    type: 'investigate',
    title: 'The Missing {RELATION}',
    description:
      "{NPC}'s {RELATION}, named {MISSING_NPC}, disappeared {TIME_PERIOD} ago. Find out what happened to them.",
    briefing:
      "My {RELATION} {MISSING_NPC} vanished {TIME_PERIOD} ago. Last seen near {LOCATION}. The sheriff says they probably just left, but I know better. Something's wrong. Please, find out what happened. I need to know, even if... even if it's bad news.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Search {LOCATION} for clues',
        location: '{LOCATION}',
      },
      {
        type: 'gather_information',
        description: 'Ask around about {MISSING_NPC}',
        target: '{MISSING_NPC}',
      },
      {
        type: 'talk_to_npc',
        description: 'Report to {NPC}',
        target: '{NPC}',
        hidden: true,
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '80',
      reputation: [{ faction: 'settlerAlliance', amount: '15' }],
    },
    levelRange: { min: 5, max: 20 },
    tags: ['investigation', 'missing_person'],
    giverRoles: ['merchant', 'rancher', 'preacher'],
  },
  {
    id: 'investigate_smuggling',
    type: 'investigate',
    title: 'The {CONTRABAND} Trail',
    description:
      "Someone's smuggling {CONTRABAND} through the territory. Find out who and where.",
    briefing:
      "We've been finding {CONTRABAND} in the area - illegal goods that shouldn't be here. Someone's running a smuggling operation, and I want it shut down. I need you to follow the trail. Find out who's behind it, where they're operating from. Be careful - smugglers don't like questions.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Investigate known drop points',
        location: '{LOCATION}',
      },
      {
        type: 'gather_information',
        description: 'Identify smuggling contacts',
        count: '{COUNT}',
      },
      {
        type: 'find_item',
        description: 'Find evidence of the operation',
        target: 'evidence',
        hidden: true,
      },
      {
        type: 'talk_to_npc',
        description: 'Report findings to {SHERIFF}',
        target: '{SHERIFF}',
        hidden: true,
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '90',
      reputation: [{ faction: 'settlerAlliance', amount: '20' }],
    },
    levelRange: { min: 10, max: 25 },
    tags: ['investigation', 'smuggling'],
    giverRoles: ['sheriff'],
    factionAlignment: 'settlerAlliance',
  },
  {
    id: 'investigate_haunting',
    type: 'investigate',
    title: 'The Haunting at {LOCATION}',
    description:
      "Strange occurrences have been reported at {LOCATION}. Some say it's haunted. Find out the truth.",
    briefing:
      "People have been seeing things at {LOCATION}. Strange lights, sounds, figures in the night. Some say it's the ghost of {DECEASED}. Others say it's just superstition. I want to know the truth. Go there, spend some time, and find out what's really happening.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Investigate {LOCATION} during the night',
        location: '{LOCATION}',
      },
      {
        type: 'investigate_location',
        description: 'Document the strange occurrences',
        location: '{LOCATION}',
      },
      {
        type: 'talk_to_npc',
        description: 'Report findings to {NPC}',
        target: '{NPC}',
        hidden: true,
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '70',
      reputation: [{ faction: 'settlerAlliance', amount: '10' }],
    },
    levelRange: { min: 5, max: 20 },
    tags: ['investigation', 'supernatural'],
    giverRoles: ['sheriff', 'preacher'],
  },
];

// ============================================================================
// DELIVERY QUESTS (3 templates)
// ============================================================================

export const DELIVERY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'delivery_message',
    type: 'delivery',
    title: 'Urgent Message for {RECIPIENT}',
    description:
      "{NPC} needs an urgent message delivered to {RECIPIENT} at {DESTINATION}. Time is of the essence.",
    briefing:
      "This message must reach {RECIPIENT} at {DESTINATION} as quickly as possible. It's a matter of {URGENCY}. I'll pay extra if you get it there fast. Don't read it, don't lose it, and don't let anyone else get their hands on it.",
    objectives: [
      {
        type: 'deliver_item',
        description: 'Deliver the message to {RECIPIENT}',
        target: 'message',
        location: '{DESTINATION}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '30',
    },
    timeLimit: '60',
    levelRange: { min: 1, max: 10 },
    repeatable: true,
    tags: ['delivery', 'time_sensitive'],
    giverRoles: ['merchant', 'banker', 'sheriff'],
  },
  {
    id: 'delivery_dangerous_cargo',
    type: 'delivery',
    title: 'Deliver {CARGO} to {DESTINATION}',
    description:
      "A crate of {CARGO} needs to get to {DESTINATION}. It's dangerous cargo - handle with extreme care.",
    briefing:
      "This {CARGO} is... sensitive. Very volatile. One wrong bump and... well, let's just say be careful. {RECIPIENT} at {DESTINATION} is expecting it. Don't open it, don't drop it, and for the love of all that's holy, don't let it get wet.",
    objectives: [
      {
        type: 'deliver_item',
        description: 'Safely transport {CARGO} to {DESTINATION}',
        target: '{CARGO}',
        location: '{DESTINATION}',
      },
      {
        type: 'talk_to_npc',
        description: 'Hand over {CARGO} to {RECIPIENT}',
        target: '{RECIPIENT}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '60',
    },
    failConditions: ['{CARGO} damaged'],
    levelRange: { min: 5, max: 15 },
    tags: ['delivery', 'dangerous'],
    giverRoles: ['merchant', 'blacksmith'],
  },
  {
    id: 'delivery_secret_package',
    type: 'delivery',
    title: 'The Package',
    description:
      "Deliver a mysterious package to {RECIPIENT}. No questions. Big pay.",
    briefing:
      "I need this package delivered to {RECIPIENT} at {DESTINATION}. What's in it? None of your business. Who's it for? I told you - {RECIPIENT}. Why me? Because I'm paying well. Questions answered? Good. Now, are you in or out?",
    objectives: [
      {
        type: 'deliver_item',
        description: 'Deliver the package to {RECIPIENT}',
        target: 'package',
        location: '{DESTINATION}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '50',
      reputation: [{ faction: 'frontera', amount: '10' }],
    },
    levelRange: { min: 3, max: 15 },
    tags: ['delivery', 'mysterious', 'shady'],
    giverRoles: ['outlaw', 'bartender'],
  },
];

// ============================================================================
// SOCIAL QUESTS (3 templates)
// ============================================================================

export const SOCIAL_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'social_convince',
    type: 'social',
    title: 'Persuade {TARGET}',
    description:
      "{NPC} needs you to convince {TARGET} to {ACTION}. Diplomacy is key - no violence.",
    briefing:
      "{TARGET} has been {PROBLEM}. I've tried talking to them, but they won't listen to me. Maybe they'll listen to a stranger. I need you to convince them to {ACTION}. Use charm, use logic, use whatever works. But no violence - that'll only make things worse.",
    objectives: [
      {
        type: 'talk_to_npc',
        description: 'Talk to {TARGET}',
        target: '{TARGET}',
      },
      {
        type: 'gather_information',
        description: 'Find leverage or common ground',
        optional: true,
      },
      {
        type: 'talk_to_npc',
        description: 'Convince {TARGET} to {ACTION}',
        target: '{TARGET}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '50',
      reputation: [{ faction: 'settlerAlliance', amount: '10' }],
    },
    levelRange: { min: 1, max: 15 },
    tags: ['social', 'non-violent', 'diplomacy'],
    giverRoles: ['merchant', 'preacher', 'sheriff'],
  },
  {
    id: 'social_gather_intel',
    type: 'social',
    title: 'Ears in {LOCATION}',
    description:
      "{NPC} needs information about {TARGET}. Spend time in {LOCATION} and learn what you can.",
    briefing:
      "I need to know what {TARGET} is planning. They spend time at {LOCATION} - go there, buy some drinks, make some friends, and listen. I need specifics: who they're meeting, what they're saying, where they're going. Don't get caught snooping.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Spend time at {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'gather_information',
        description: 'Learn about {TARGET}\'s activities',
        target: '{TARGET}',
      },
      {
        type: 'talk_to_npc',
        description: 'Report to {NPC}',
        target: '{NPC}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '60',
    },
    levelRange: { min: 3, max: 20 },
    tags: ['social', 'spy', 'information'],
    giverRoles: ['sheriff', 'merchant', 'banker'],
  },
  {
    id: 'social_mediate',
    type: 'social',
    title: 'Peace Between {NPC1} and {NPC2}',
    description:
      "{NPC1} and {NPC2} are feuding over {DISPUTE}. Someone needs to mediate before it turns violent.",
    briefing:
      "{NPC1} and {NPC2} have been at each other's throats over {DISPUTE}. It's getting worse. If someone doesn't step in soon, there'll be blood. Neither will back down - they both think they're right. We need an outside party to mediate. Think you can talk sense into them?",
    objectives: [
      {
        type: 'talk_to_npc',
        description: 'Hear {NPC1}\'s side',
        target: '{NPC1}',
      },
      {
        type: 'talk_to_npc',
        description: 'Hear {NPC2}\'s side',
        target: '{NPC2}',
      },
      {
        type: 'talk_to_npc',
        description: 'Negotiate a settlement',
        target: '{NPC1}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '70',
      reputation: [{ faction: 'settlerAlliance', amount: '20' }],
    },
    levelRange: { min: 5, max: 20 },
    tags: ['social', 'diplomacy', 'conflict_resolution'],
    giverRoles: ['sheriff', 'preacher'],
  },
];

// ============================================================================
// HEIST/SABOTAGE QUESTS (3 templates)
// ============================================================================

export const HEIST_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'heist_steal_document',
    type: 'heist',
    title: 'The {DOCUMENT} Job',
    description:
      "{NPC} needs a {DOCUMENT} stolen from {TARGET}'s office at {LOCATION}. Stealth required.",
    briefing:
      "{TARGET} has a {DOCUMENT} that I need. It's locked up in their office at {LOCATION}. Guards, locks, the works. I need someone who can get in, get the {DOCUMENT}, and get out without being seen. Can you handle that kind of work?",
    objectives: [
      {
        type: 'visit_location',
        description: 'Infiltrate {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'steal_item',
        description: 'Steal the {DOCUMENT}',
        target: '{DOCUMENT}',
      },
      {
        type: 'escape_location',
        description: 'Escape without being detected',
        location: '{LOCATION}',
      },
      {
        type: 'talk_to_npc',
        description: 'Deliver {DOCUMENT} to {NPC}',
        target: '{NPC}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '100',
      reputation: [{ faction: 'frontera', amount: '20' }],
    },
    consequences: {
      reputation: [{ faction: 'settlerAlliance', amount: '-15' }],
    },
    levelRange: { min: 10, max: 25 },
    tags: ['stealth', 'theft', 'heist'],
    giverRoles: ['outlaw', 'merchant'],
    factionAlignment: 'frontera',
  },
  {
    id: 'sabotage_operation',
    type: 'sabotage',
    title: 'Sabotage the {OPERATION}',
    description:
      "{NPC} wants {TARGET}'s {OPERATION} at {LOCATION} sabotaged. Make it look like an accident.",
    briefing:
      "{TARGET}'s {OPERATION} at {LOCATION} is putting me out of business. I need it... stopped. Equipment broken, supplies ruined, whatever it takes. But make it look natural - an accident, bad luck. If this leads back to me, we both lose.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Scout {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'investigate_location',
        description: 'Find vulnerabilities in the {OPERATION}',
        location: '{LOCATION}',
      },
      {
        type: 'steal_item',
        description: 'Sabotage the {OPERATION}',
        target: '{OPERATION}',
      },
      {
        type: 'escape_location',
        description: 'Leave without suspicion',
        location: '{LOCATION}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '90',
      reputation: [{ faction: 'frontera', amount: '15' }],
    },
    consequences: {
      reputation: [{ faction: 'settlerAlliance', amount: '-20' }],
    },
    levelRange: { min: 8, max: 22 },
    tags: ['sabotage', 'stealth', 'dark'],
    giverRoles: ['merchant', 'outlaw'],
    factionAlignment: 'frontera',
  },
  {
    id: 'heist_rob_stagecoach',
    type: 'heist',
    title: 'The {TOWN} Stagecoach',
    description:
      "A stagecoach carrying {CARGO} passes through {LOCATION} every {DAY}. {NPC} has a plan.",
    briefing:
      "The {TOWN} stagecoach carries {CARGO} worth a fortune. It passes through {LOCATION} every {DAY}. The guards are {GUARD_STATUS}. I've got a plan, but I need another gun. We split the take {SPLIT}. You in?",
    objectives: [
      {
        type: 'visit_location',
        description: 'Set up ambush at {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'defeat_gang',
        description: 'Neutralize stagecoach guards',
        target: 'guards',
        count: '{GUARD_COUNT}',
      },
      {
        type: 'steal_item',
        description: 'Secure the {CARGO}',
        target: '{CARGO}',
      },
      {
        type: 'escape_location',
        description: 'Escape before reinforcements arrive',
        location: '{LOCATION}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '120',
      reputation: [{ faction: 'frontera', amount: '25' }],
    },
    consequences: {
      reputation: [{ faction: 'settlerAlliance', amount: '-30' }],
    },
    levelRange: { min: 12, max: 28 },
    tags: ['heist', 'robbery', 'violent'],
    giverRoles: ['outlaw'],
    factionAlignment: 'frontera',
  },
];

// ============================================================================
// RESCUE QUESTS (3 templates)
// ============================================================================

export const RESCUE_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'rescue_kidnapped',
    type: 'rescue',
    title: 'Rescue {VICTIM} from {GANG}',
    description:
      "{GANG} has kidnapped {VICTIM}. They're being held at {LOCATION}. Get them out alive.",
    briefing:
      "They took my {RELATION} {VICTIM}! {GANG} is demanding {RANSOM} gold, but even if I pay, who knows if they'll keep their word. Please, rescue {VICTIM} from {LOCATION}. I'll pay you {REWARD} gold - everything I have. Just bring them back safe.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Infiltrate {GANG} hideout at {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'find_item',
        description: 'Locate {VICTIM}',
        target: '{VICTIM}',
      },
      {
        type: 'protect_npc',
        description: 'Rescue {VICTIM}',
        target: '{VICTIM}',
      },
      {
        type: 'escape_location',
        description: 'Escape with {VICTIM}',
        location: '{LOCATION}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '120',
      reputation: [{ faction: 'settlerAlliance', amount: '30' }],
    },
    failConditions: ['{VICTIM} dies'],
    levelRange: { min: 10, max: 25 },
    tags: ['rescue', 'violent', 'heroic'],
    giverRoles: ['merchant', 'rancher', 'banker'],
  },
  {
    id: 'rescue_trapped_miners',
    type: 'rescue',
    title: 'Mine Collapse at {LOCATION}',
    description:
      "A mine collapse has trapped {COUNT} miners at {LOCATION}. Time is running out to dig them out.",
    briefing:
      "The mine at {LOCATION} collapsed! There are {COUNT} miners trapped inside. We've been digging, but it's slow going and they're running out of air. We need help - strong backs and brave hearts. Every minute counts!",
    objectives: [
      {
        type: 'visit_location',
        description: 'Reach the mine at {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'investigate_location',
        description: 'Find the safest rescue route',
        location: '{LOCATION}',
      },
      {
        type: 'collect_items',
        description: 'Clear debris blocking the tunnel',
        target: 'debris',
        count: '{COUNT}',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '100',
      reputation: [{ faction: 'settlerAlliance', amount: '35' }],
    },
    timeLimit: '90',
    levelRange: { min: 5, max: 20 },
    tags: ['rescue', 'heroic', 'time_sensitive'],
    giverRoles: ['merchant', 'sheriff'],
  },
  {
    id: 'rescue_stranded_travelers',
    type: 'rescue',
    title: 'Stranded in the {TERRAIN}',
    description:
      "A group of travelers is stranded in the {TERRAIN} near {LOCATION}. Bad weather is closing in.",
    briefing:
      "There's a wagon party stuck in the {TERRAIN} near {LOCATION}. {OBSTACLE} has them pinned down, and a {WEATHER} is rolling in. If someone doesn't reach them soon, they won't make it. We need a volunteer for the rescue party.",
    objectives: [
      {
        type: 'visit_location',
        description: 'Navigate to the travelers at {LOCATION}',
        location: '{LOCATION}',
      },
      {
        type: 'protect_npc',
        description: 'Guide the travelers to safety',
        target: 'travelers',
      },
    ],
    rewards: {
      gold: '{BASE_GOLD}',
      xp: '80',
      reputation: [{ faction: 'settlerAlliance', amount: '25' }],
    },
    levelRange: { min: 3, max: 15 },
    tags: ['rescue', 'heroic', 'exploration'],
    giverRoles: ['sheriff', 'merchant'],
  },
];

// ============================================================================
// CONSOLIDATED TEMPLATES EXPORT
// ============================================================================

export const ALL_QUEST_TEMPLATES: QuestTemplate[] = [
  ...FETCH_QUEST_TEMPLATES,
  ...KILL_QUEST_TEMPLATES,
  ...ESCORT_QUEST_TEMPLATES,
  ...INVESTIGATION_QUEST_TEMPLATES,
  ...DELIVERY_QUEST_TEMPLATES,
  ...SOCIAL_QUEST_TEMPLATES,
  ...HEIST_QUEST_TEMPLATES,
  ...RESCUE_QUEST_TEMPLATES,
];

// ============================================================================
// QUEST VARIABLE POOLS
// ============================================================================

export const QUEST_VARIABLE_POOLS = {
  NPC: [
    'Mayor Thompson', 'Sheriff Cole', 'Doc Morrison', 'Banker Whitfield',
    'Rancher Calhoun', 'Merchant Wang', 'Reverend Black', 'Widow Jenkins',
    'Bartender McGraw', 'Blacksmith Gruff', 'Saloon Girl Ruby', 'Madame Rose',
  ],
  LOCATION: [
    'Dead Man\'s Gulch', 'the abandoned mine', 'Coyote Pass', 'the old mill',
    'Snake Ridge', 'the trading post', 'Ghost Canyon', 'the river crossing',
    'Devil\'s Butte', 'the desert ruins', 'Hangman\'s Tree', 'the railroad camp',
  ],
  ITEM: [
    'gold pocket watch', 'family bible', 'deed to the ranch', 'medicine bag',
    'grandfather\'s revolver', 'wedding ring', 'silver locket', 'treasure map',
    'secret documents', 'rare herbs', 'mining claim', 'valuable gemstone',
  ],
  GANG: [
    'the Desperados', 'the Red River Gang', 'the Comancheros', 'Black Jack\'s Boys',
    'the Night Riders', 'the Hole-in-the-Wall Gang', 'the Border Bandits',
  ],
  TARGET: [
    'Black Jack Cassidy', 'One-Eye Morgan', 'Snake Williams', 'Red Hand Martinez',
    'the Preacher', 'Silent Cal', 'the German', 'Mad Dog Murphy',
  ],
  PREDATOR: [
    'mountain lion', 'pack of wolves', 'rogue bear', 'giant rattlesnake',
  ],
  CRIME: [
    'murder', 'robbery', 'cattle rustling', 'train robbery', 'kidnapping',
    'extortion', 'arson', 'horse theft', 'bank robbery', 'stagecoach robbery',
  ],
  DESTINATION: [
    'Red Gulch', 'Silver City', 'Dry Creek', 'Tombstone', 'Dodge City',
    'Santa Fe', 'El Paso', 'Fort Sumner', 'Tucson', 'Phoenix',
  ],
  RELATION: [
    'wife', 'husband', 'daughter', 'son', 'brother', 'sister', 'mother',
    'father', 'cousin', 'uncle', 'aunt', 'nephew', 'niece',
  ],
  REASON: [
    'a wedding', 'a funeral', 'business matters', 'legal proceedings',
    'medical treatment', 'a family emergency', 'political meeting',
  ],
  DANGER: [
    'bandits', 'hostile tribes', 'wild animals', 'flash floods', 'outlaws',
    'the desert heat', 'claim jumpers', 'road agents',
  ],
  CARGO: [
    'dynamite', 'gold bullion', 'medical supplies', 'weapons',
    'mining equipment', 'cattle', 'whiskey', 'valuable documents',
  ],
  CONTRABAND: [
    'opium', 'illegal weapons', 'counterfeit money', 'stolen goods',
    'unlicensed whiskey', 'dynamite', 'stolen cattle',
  ],
  TERRAIN: [
    'desert', 'canyon', 'mountains', 'badlands', 'prairie', 'river valley',
  ],
  ACTIVITY: [
    'having a drink', 'playing cards', 'talking to a stranger', 'doing business',
    'visiting the church', 'watching the sunset', 'meeting a friend',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get templates by quest type
 */
export function getQuestTemplatesByType(type: QuestType): QuestTemplate[] {
  return ALL_QUEST_TEMPLATES.filter((t) => t.type === type);
}

/**
 * Get templates suitable for a character level
 */
export function getQuestTemplatesForLevel(level: number): QuestTemplate[] {
  return ALL_QUEST_TEMPLATES.filter(
    (t) =>
      !t.levelRange ||
      (level >= t.levelRange.min && level <= t.levelRange.max)
  );
}

/**
 * Get templates that can be given by a specific NPC role
 */
export function getQuestTemplatesForGiver(role: string): QuestTemplate[] {
  return ALL_QUEST_TEMPLATES.filter(
    (t) => !t.giverRoles || t.giverRoles.includes(role)
  );
}

/**
 * Get templates by tag
 */
export function getQuestTemplatesByTag(tag: string): QuestTemplate[] {
  return ALL_QUEST_TEMPLATES.filter((t) => t.tags && t.tags.includes(tag));
}

/**
 * Get random item from a quest variable pool
 */
export function getRandomQuestVariable(
  poolName: keyof typeof QUEST_VARIABLE_POOLS
): string {
  const pool = QUEST_VARIABLE_POOLS[poolName];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Calculate total quest combinations
 */
export function calculateQuestCombinations(): number {
  let total = 0;

  for (const template of ALL_QUEST_TEMPLATES) {
    let combinations = 1;
    const variablesInTemplate = new Set<string>();

    // Extract variables from title and description
    const regex = /\{([A-Z_]+)\}/g;
    let match;
    while ((match = regex.exec(template.title + template.description)) !== null) {
      variablesInTemplate.add(match[1]);
    }

    for (const variable of variablesInTemplate) {
      const poolName = variable as keyof typeof QUEST_VARIABLE_POOLS;
      if (QUEST_VARIABLE_POOLS[poolName]) {
        combinations *= QUEST_VARIABLE_POOLS[poolName].length;
      } else {
        combinations *= 5; // Default for non-pooled variables
      }
    }

    total += combinations;
  }

  return total;
}

// Export count
export const TOTAL_QUEST_COMBINATIONS = calculateQuestCombinations();
