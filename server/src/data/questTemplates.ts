/**
 * Quest Templates
 *
 * Procedural templates for generating dynamic quests.
 * Part of Phase D - Content Explosion System
 *
 * 30 base templates that create hundreds of unique quest variations
 * through variable substitution and dynamic objectives.
 */

import { SecureRNG } from '../services/base/SecureRNG';

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
    title: "{NPC}'s Missin' {ITEM}",
    description:
      "{NPC}'s gone and lost their precious {ITEM} somewhere 'round {LOCATION}. Last they recollect, they was {ACTIVITY} when they set it down. Finder gets a reward - simple as that.",
    briefing:
      "I been tearin' this town apart lookin' for my {ITEM}! Had it just yesterday over at {LOCATION}. I was {ACTIVITY}, set the damn thing down for one minute, and poof - gone like smoke. It ain't worth much to nobody but me - belonged to my {FAMILY_MEMBER}, God rest 'em. Please, stranger, can you help an old fool find it?",
    objectives: [
      {
        type: 'visit_location',
        description: "Poke around {LOCATION} for the {ITEM}",
        location: '{LOCATION}',
      },
      {
        type: 'find_item',
        description: "Get yer hands on the {ITEM}",
        target: '{ITEM}',
      },
      {
        type: 'talk_to_npc',
        description: "Bring the {ITEM} back to {NPC}",
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
    title: "Rare {ITEM} for {NPC}",
    description:
      "{NPC}'s got a hankerin' for some rare {ITEM} that only grows out at {LOCATION}. Mean country out there, but the pay's worth the trouble.",
    briefing:
      "Listen here, I need me a particular {ITEM} for my work. Ain't nothin' else'll do. Only place it grows is out at {LOCATION}, and these old bones ain't up for that journey no more. The {DANGER} out that way's enough to make a man think twice. But I'll pay you proper - more'n fair for your trouble.",
    objectives: [
      {
        type: 'visit_location',
        description: "Make yer way to {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'collect_items',
        description: "Rustle up {COUNT} {ITEM}",
        target: '{ITEM}',
        count: '{COUNT}',
      },
      {
        type: 'talk_to_npc',
        description: "Bring the {ITEM} to {NPC}",
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
    title: "Get Back {NPC}'s Stolen {ITEM}",
    description:
      "That low-down snake {THIEF} done stole {NPC}'s {ITEM}. Word is they're holed up at {LOCATION}. Reckon it's time someone taught 'em what happens to thieves in these parts.",
    briefing:
      "*spits* That good-for-nothin' {THIEF} broke into my place in the dead of night and made off with my {ITEM}! Word on the street says the yellow-belly's hidin' out at {LOCATION}. I don't give a damn HOW you get it back, stranger - just bring me my {ITEM}. And if {THIEF} happens to catch a beatin' in the process? Well, that's between you and the Almighty.",
    objectives: [
      {
        type: 'visit_location',
        description: "Track that snake {THIEF} to {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'find_item',
        description: "Take back the stolen {ITEM}",
        target: '{ITEM}',
      },
      {
        type: 'talk_to_npc',
        description: "Return the {ITEM} to {NPC}",
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
    title: "The {FAMILY} Family Heirloom",
    description:
      "The {FAMILY} clan's got an old {ITEM} buried with their kin at {LOCATION}. They need it dug up for {REASON}. Grave work ain't pretty, but gold spends the same.",
    briefing:
      "*lowers voice* This here's a delicate matter, stranger. Not somethin' I'd share with just anybody. My {FAMILY_MEMBER} was laid to rest at {LOCATION} with a {ITEM} - family tradition and all. But now, with {REASON} comin' up, we need that {ITEM} somethin' fierce. I know what I'm askin'. Disturbin' the dead ain't Christian, but... *sighs* ...our family's whole future's ridin' on this. I wouldn't ask if there was another way.",
    objectives: [
      {
        type: 'visit_location',
        description: "Head to the burial grounds at {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'find_item',
        description: "Dig up the {ITEM} from the grave",
        target: '{ITEM}',
      },
      {
        type: 'talk_to_npc',
        description: "Deliver the heirloom to {NPC}",
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
    title: "Supply Run to {DESTINATION}",
    description:
      "{NPC}'s got goods waitin' at {ORIGIN} that need haulin' to {DESTINATION}. Honest work for honest pay - long as the {DANGER} don't catch wind of ya.",
    briefing:
      "Got me a shipment of {ITEM} sittin' at {ORIGIN} that ain't gonna move itself to {DESTINATION}. My regular man ain't showed - reckon the {DANGER} on that road finally spooked him good. Can't say I blame the fool, but I still need them goods moved. You look like you got more sand than most. Interested in earnin' some coin?",
    objectives: [
      {
        type: 'visit_location',
        description: "Collect the supplies at {ORIGIN}",
        location: '{ORIGIN}',
      },
      {
        type: 'deliver_item',
        description: "Haul {ITEM} to {DESTINATION}",
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
    title: "Wanted: {TARGET}",
    description:
      "{TARGET}'s wanted dead or alive for {CRIME}. Last spotted skulkin' around {LOCATION}. The law's put {BOUNTY} gold on their head - plenty enough to make the risk worth it.",
    briefing:
      "*slaps wanted poster on the bar* {TARGET}'s been raisin' hell in this territory long enough. {CRIME}, among other sins. They run with {GANG_COUNT} lowlifes and was last seen near {LOCATION}. *leans in* Now, the law says 'dead or alive' - pays the same either way. Personally? I sleep better when scum like that don't wake up. Bring me proof, you get paid. Simple as that.",
    objectives: [
      {
        type: 'visit_location',
        description: "Hunt down {TARGET} at {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'kill_target',
        description: "Put {TARGET} in the ground - or bring 'em in breathin'",
        target: '{TARGET}',
      },
      {
        type: 'talk_to_npc',
        description: "Collect yer blood money from {SHERIFF}",
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
    title: "Hunt the {PREDATOR}",
    description:
      "Somethin' mean's been tearin' through livestock out near {LOCATION}. Ranchers want this {PREDATOR} dead 'fore it gets a taste for human flesh.",
    briefing:
      "*pulls off hat, wipes brow* We done lost {COUNT} head of cattle to this damn beast already. Big {PREDATOR}, meaner than a rattlesnake with a toothache. Tracks lead toward {LOCATION}. We need it dead, stranger. Dead before it gets bolder - 'fore it starts eyein' the children instead of the calves. The ranchers' association's pooled together good money. You look like you know which end of a rifle does the talkin'.",
    objectives: [
      {
        type: 'visit_location',
        description: "Track the {PREDATOR} to its territory at {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'kill_target',
        description: "Put down the {PREDATOR}",
        target: '{PREDATOR}',
      },
      {
        type: 'talk_to_npc',
        description: "Bring the proof to {NPC}",
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
    title: "Clear Out {GANG}",
    description:
      "{GANG}'s gone and set up camp at {LOCATION}, bold as brass. The law wants 'em cleared out - permanent-like - before they cause more trouble than they already have.",
    briefing:
      "*exhales smoke* {GANG}'s been gettin' real cocky lately. Set up right there at {LOCATION} like they own the damn place, been {CRIME} anyone fool enough to pass by. We ain't got the manpower for a straight-up fight - not without losin' good men. But one person, skilled and quiet-like? Could slip in there and clean house 'fore they knew what hit 'em. You interested in doin' some housekeepin'?",
    objectives: [
      {
        type: 'visit_location',
        description: "Slip into {GANG}'s camp at {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'defeat_gang',
        description: "Send {COUNT} of them {GANG} boys to meet their maker",
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
    title: "{NPC}'s Reckoning",
    description:
      "{NPC}'s got a powerful need to see {TARGET} dead. {REASON}'s reason enough. No questions asked, payment on delivery of proof.",
    briefing:
      "*locks eyes with you* {TARGET} wronged me. How ain't your concern. Let's just say {REASON}. I want 'em dead. Not hurt, not scared - DEAD. I don't care if you shoot 'em, stab 'em, or push 'em off a cliff. And I don't wanna hear the details after. {GOLD} gold when you bring me somethin' to prove the deed's done. This conversation? Never happened. We clear?",
    objectives: [
      {
        type: 'visit_location',
        description: "Track {TARGET} to {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'kill_target',
        description: "End {TARGET}",
        target: '{TARGET}',
      },
      {
        type: 'talk_to_npc',
        description: "Return to {NPC} with proof",
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
    title: "The Head of {GANG}",
    description:
      "The law wants the head of {GANG} - a sidewinder called {TARGET}. Massive bounty, but they're holed up at {LOCATION} with a small army. This ain't work for the faint of heart.",
    briefing:
      "*slides a thick stack of wanted posters across the desk* {TARGET}. Most wanted outlaw in the whole damn territory. Runs {GANG} - responsible for {CRIME} and God knows what else. The bounty's {BOUNTY} gold - enough to set a man up for life. *pauses* But I ain't gonna lie to you, friend. {TARGET} ain't gonna come quiet, and they sure as hell ain't gonna come alone. Got themselves a small army camped at {LOCATION}. This here's a job for someone who's already made peace with meetin' their maker. You that kind of fool?",
    objectives: [
      {
        type: 'visit_location',
        description: "Storm {GANG}'s stronghold at {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'kill_target',
        description: "Kill {TARGET} or drag 'em back in irons",
        target: '{TARGET}',
      },
      {
        type: 'talk_to_npc',
        description: "Collect yer reward from {SHERIFF}",
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
    title: "Get {NPC} to {DESTINATION} Alive",
    description:
      "{NPC} needs safe passage to {DESTINATION}, but the roads ain't no place for folk travelin' alone. They're payin' good coin for a gun at their side.",
    briefing:
      "I gotta get to {DESTINATION} for {REASON}, but I ain't fool enough to try that road alone. {DANGER} been hittin' travelers regular - robbin' 'em blind if they're lucky, leavin' 'em for the buzzards if they ain't. I'll pay {GOLD} gold to anyone who can get me there with my scalp still attached. We leave when you say.",
    objectives: [
      {
        type: 'talk_to_npc',
        description: "Meet up with {NPC}",
        target: '{NPC}',
      },
      {
        type: 'protect_npc',
        description: "Keep {NPC} breathin' all the way to {DESTINATION}",
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
    title: "Guard the Witness",
    description:
      "{NPC} saw {TARGET} commit {CRIME} and needs to live long enough to testify at {DESTINATION}. Problem is, {GANG}'s put a price on their head. Keep 'em alive, and justice gets done.",
    briefing:
      "*taps badge nervously* This here witness saw {TARGET} commit {CRIME}. Their testimony could put that snake away for good - or swing 'em from a rope, if there's any justice left in this territory. But {GANG}'s caught wind, and they've put a price on this poor soul's head. We gotta get 'em to {DESTINATION} alive. Whole territory's countin' on it. You fail, {TARGET} walks free, and everything folks died for was for nothin'.",
    objectives: [
      {
        type: 'talk_to_npc',
        description: "Pick up the witness at {ORIGIN}",
        target: '{NPC}',
        location: '{ORIGIN}',
      },
      {
        type: 'protect_npc',
        description: "Deliver the witness to {DESTINATION} - alive",
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
    title: "Payroll Run",
    description:
      "Guard the mine payroll from {ORIGIN} to {DESTINATION}. {GOLD} in gold - every outlaw with a horse and a gun'll be watchin' for it.",
    briefing:
      "*counts out coins nervously* We got {GOLD} gold in payroll sittin' at {ORIGIN} that needs gettin' to {DESTINATION}. Problem is, every no-good sidewinder in the territory knows about these shipments. It's like ringin' a dinner bell for bandits. I need guards - real guards, not the kind that run at the first gunshot. You'll get a cut of the delivery bonus - generous cut, considerin' the risk. What do you say?",
    objectives: [
      {
        type: 'visit_location',
        description: "Lock down the payroll at {ORIGIN}",
        location: '{ORIGIN}',
      },
      {
        type: 'deliver_item',
        description: "Get that gold to {DESTINATION} in one piece",
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
    title: "Prisoner Transport to {DESTINATION}",
    description:
      "That ornery bastard {TARGET} finally got caught, but needs movin' to {DESTINATION} for proper trial. Their gang'll be comin' hard to spring 'em loose.",
    briefing:
      "*jangles keys* We finally got {TARGET} in irons, but this jailhouse ain't gonna hold 'em - and their boys know it. Need to transfer the prisoner to {DESTINATION} where they got a real lockup. *leans in* {GANG} WILL come for 'em. They got no choice - if {TARGET} hangs, the whole operation falls apart. I need someone who can put down a rescue attempt without lettin' the prisoner slip away in the chaos. This is official law business, so yer covered if things get bloody.",
    objectives: [
      {
        type: 'talk_to_npc',
        description: "Collect the prisoner from {SHERIFF}",
        target: '{SHERIFF}',
      },
      {
        type: 'deliver_item',
        description: "Drag {TARGET} to {DESTINATION} - alive for trial",
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
    title: "The {VICTIM} Killin'",
    description:
      "Someone done murdered {VICTIM} at {LOCATION}. Sheriff needs a sharp eye to piece together what happened and who's responsible. The dead deserve justice - or at least revenge.",
    briefing:
      "*removes hat solemnly* {VICTIM} was a good soul - respected 'round these parts. Found 'em dead at {LOCATION} this mornin'. The scene was {DESCRIPTION}. *spits* Whoever done this didn't just kill someone - they spit in the face of this whole community. I need someone with a sharp eye and a sharper mind to investigate. Talk to folks, look for clues, figure out who had reason to do this. Then you tell me, and we'll see that justice gets done.",
    objectives: [
      {
        type: 'investigate_location',
        description: "Pick through the crime scene at {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'gather_information',
        description: "Shake down {COUNT} witnesses for what they know",
        count: '{COUNT}',
      },
      {
        type: 'find_item',
        description: "Turn up some evidence",
        target: 'evidence',
      },
      {
        type: 'talk_to_npc',
        description: "Bring yer findings to {SHERIFF}",
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
    title: "The Vanished {RELATION}",
    description:
      "{NPC}'s {RELATION} - goes by {MISSING_NPC} - up and vanished {TIME_PERIOD} back. Could be they ran off, could be somethin' worse. Either way, someone's gotta find the truth.",
    briefing:
      "*wringing hands* My {RELATION} {MISSING_NPC} disappeared {TIME_PERIOD} ago. Just... gone. Last anybody saw 'em was near {LOCATION}. The sheriff says they probably just lit out for greener pastures, but I KNOW my {RELATION}. They wouldn't leave without a word. *voice breaks* Somethin' happened. Please, stranger, find out what. I need to know the truth, even if... even if it ain't the news I'm prayin' for.",
    objectives: [
      {
        type: 'visit_location',
        description: "Nose around {LOCATION} for any sign of {MISSING_NPC}",
        location: '{LOCATION}',
      },
      {
        type: 'gather_information',
        description: "Ask folks about {MISSING_NPC} - somebody saw somethin'",
        target: '{MISSING_NPC}',
      },
      {
        type: 'talk_to_npc',
        description: "Break the news to {NPC}",
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
    title: "The {CONTRABAND} Trail",
    description:
      "Someone's runnin' {CONTRABAND} through the territory bold as daylight. The law wants to know who's behind it and where they're operatin' from.",
    briefing:
      "*slides evidence across desk* We keep findin' {CONTRABAND} around the territory - goods that got no business bein' here. Someone's runnin' a smugglin' operation right under our noses, and I aim to shut it down hard. I need you to follow the trail. Find out who's pullin' the strings, where they're stashin' the goods, how they're movin' it. *lowers voice* Word of warnin' - smugglers don't take kindly to questions. You go pokin' around, you'd best watch yer back.",
    objectives: [
      {
        type: 'visit_location',
        description: "Scout the known drop points near {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'gather_information',
        description: "Identify who's mixed up in this operation",
        count: '{COUNT}',
      },
      {
        type: 'find_item',
        description: "Dig up hard evidence of the smugglin' ring",
        target: 'evidence',
        hidden: true,
      },
      {
        type: 'talk_to_npc',
        description: "Report back to {SHERIFF}",
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
    title: "The Hauntin' at {LOCATION}",
    description:
      "Folks been seein' things at {LOCATION} - strange lights, sounds that ain't natural, figures movin' in the dark. Some say it's haunted. Some say it's hogwash. Only one way to find out.",
    briefing:
      "*crosses self nervously* People been seein' things at {LOCATION}. Strange lights flickerin' where no lights should be. Sounds - like whispers, like screams - in the dead of night. Some folks swear they seen figures movin' in the shadows. Old {DECEASED}'s ghost, they say. Others reckon it's just superstitious nonsense, desert heat gettin' to people's heads. *meets your eyes* I want to know the truth. Go there, spend some time - especially after dark. Find out what's really goin' on. Whatever it is.",
    objectives: [
      {
        type: 'visit_location',
        description: "Stake out {LOCATION} after the sun goes down",
        location: '{LOCATION}',
      },
      {
        type: 'investigate_location',
        description: "Keep yer eyes peeled for anythin' unnatural",
        location: '{LOCATION}',
      },
      {
        type: 'talk_to_npc',
        description: "Tell {NPC} what you found - or didn't",
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
    title: "Get This to {RECIPIENT} - Fast",
    description:
      "{NPC}'s got an urgent message that needs to reach {RECIPIENT} at {DESTINATION}. Time's wastin' and every minute counts.",
    briefing:
      "Listen here - this message needs to be in {RECIPIENT}'s hands at {DESTINATION} FAST. It's a matter of {URGENCY}, and I ain't exaggeratin'. I'll throw in extra coin if you make good time. But listen careful: don't read it, don't lose it, and whatever you do, don't let nobody else lay eyes on it. You get stopped on the road? Swallow the damn thing if you gotta. Now git!",
    objectives: [
      {
        type: 'deliver_item',
        description: "Get this message to {RECIPIENT}'s hands - nobody else's",
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
    title: "Handle With Care: {CARGO} to {DESTINATION}",
    description:
      "This crate of {CARGO} needs gettin' to {DESTINATION}, but one wrong move and you'll be meetin' yer maker. Handle it like yer holdin' a rattlesnake.",
    briefing:
      "*leans in close* This {CARGO} is... sensitive. The kind of sensitive that goes BOOM if you look at it wrong. One bad bump, one hard jostle, and... *makes explosion gesture* ...well, they'll be scrapin' what's left of you off the canyon walls. {RECIPIENT} at {DESTINATION} is expectin' it. Don't open it - you don't wanna know what's inside. Don't drop it - obvious reasons. And for the love of all that's holy, don't let it get wet. You still want the job?",
    objectives: [
      {
        type: 'deliver_item',
        description: "Carry {CARGO} to {DESTINATION} without blowin' yerself up",
        target: '{CARGO}',
        location: '{DESTINATION}',
      },
      {
        type: 'talk_to_npc',
        description: "Hand over {CARGO} to {RECIPIENT} - carefully",
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
    title: "The Package",
    description:
      "Somebody needs a mysterious package delivered to {RECIPIENT}. What's inside ain't yer concern. The gold is.",
    briefing:
      "*slides a wrapped package across the table* This goes to {RECIPIENT} at {DESTINATION}. *you start to ask a question* Ah-ah. *holds up hand* What's in it? None of yer damn business. Who's it for? I already told you - {RECIPIENT}. Why you? 'Cause I'm payin' good money and you look like you can keep yer mouth shut. Questions answered? *stares* Good. Now, you in or out? I ain't got all night.",
    objectives: [
      {
        type: 'deliver_item',
        description: "Get the package to {RECIPIENT} - no questions asked",
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
    title: "Talk Some Sense Into {TARGET}",
    description:
      "{NPC} needs {TARGET} convinced to {ACTION}. It's gonna take a silver tongue, not a quick draw - violence'll only make things worse.",
    briefing:
      "*sighs heavily* {TARGET}'s been {PROBLEM}, and it's causin' no end of grief. I've tried talkin' to 'em myself, but they won't hear it from me - too much bad blood, I reckon. But a stranger? They might listen. I need you to convince 'em to {ACTION}. Use charm, use logic, use whatever works - hell, lie through yer teeth if you gotta. But no guns, no fists. Violence'll only make a bad situation worse, and then we'll ALL be in a fix.",
    objectives: [
      {
        type: 'talk_to_npc',
        description: "Feel out {TARGET} - see what makes 'em tick",
        target: '{TARGET}',
      },
      {
        type: 'gather_information',
        description: "Find some leverage or common ground to work with",
        optional: true,
      },
      {
        type: 'talk_to_npc',
        description: "Talk {TARGET} into {ACTION}",
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
    title: "Keep Yer Ears Open at {LOCATION}",
    description:
      "{NPC} needs information on {TARGET}. Head to {LOCATION}, blend in, buy some drinks, and listen for loose lips.",
    briefing:
      "I need to know what {TARGET}'s plannin'. Word is they spend their evenings at {LOCATION} - go there, buy yourself some drinks, make some friends, and keep yer ears open. Folks talk when they've had a few. I need specifics: who they're meetin' with, what they're jawin' about, where they're headin' next. *grabs your arm* But listen - don't get caught snoopin'. {TARGET}'s got eyes everywhere. You get made, you didn't hear nothin' from me.",
    objectives: [
      {
        type: 'visit_location',
        description: "Sidle up to the bar at {LOCATION} and settle in",
        location: '{LOCATION}',
      },
      {
        type: 'gather_information',
        description: "Piece together what {TARGET}'s been up to",
        target: '{TARGET}',
      },
      {
        type: 'talk_to_npc',
        description: "Bring what you learned back to {NPC}",
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
    title: "Stop {NPC1} and {NPC2} From Killin' Each Other",
    description:
      "{NPC1} and {NPC2}'s feud over {DISPUTE} is about to turn bloody. Someone needs to step in 'fore bullets start flyin'.",
    briefing:
      "*rubs temples* {NPC1} and {NPC2} been at each other's throats over {DISPUTE}. Started as harsh words, now they're both wearin' iron everywhere they go. If somebody don't step in soon, there's gonna be blood in the street. Problem is, neither one'll back down - they both think they're in the right, stubborn as mules the both of 'em. I need an outsider - someone with no stake in the fight - to knock some sense into 'em. Reckon you can talk two mule-headed fools down from killin' each other?",
    objectives: [
      {
        type: 'talk_to_npc',
        description: "Let {NPC1} tell their side of it",
        target: '{NPC1}',
      },
      {
        type: 'talk_to_npc',
        description: "Hear {NPC2}'s grievances",
        target: '{NPC2}',
      },
      {
        type: 'talk_to_npc',
        description: "Hammer out some kind of peace",
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
    title: "The {DOCUMENT} Job",
    description:
      "{NPC}'s got their eye on a {DOCUMENT} locked up tight in {TARGET}'s office at {LOCATION}. Gonna take a light touch and lighter feet to get in and out without raisin' hell.",
    briefing:
      "*checks over shoulder, lowers voice* {TARGET}'s got a {DOCUMENT} that I need. Bad. It's locked up tight in their office at {LOCATION} - guards, locks, the whole nine yards. I need someone who can slip in quiet-like, get their hands on that {DOCUMENT}, and ghost out without nobody bein' the wiser. *meets your eyes* This ain't the kind of work for folks with shaky hands or loose lips. You the type that can handle a job like this, or should I keep lookin'?",
    objectives: [
      {
        type: 'visit_location',
        description: "Slip into {LOCATION} without bein' seen",
        location: '{LOCATION}',
      },
      {
        type: 'steal_item',
        description: "Get yer hands on that {DOCUMENT}",
        target: '{DOCUMENT}',
      },
      {
        type: 'escape_location',
        description: "Ghost out without raisin' any alarms",
        location: '{LOCATION}',
      },
      {
        type: 'talk_to_npc',
        description: "Bring the {DOCUMENT} to {NPC}",
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
    title: "Wreck {TARGET}'s {OPERATION}",
    description:
      "{NPC}'s gettin' run out of business by {TARGET}'s {OPERATION} at {LOCATION}. They want it sabotaged - and they want it to look like bad luck.",
    briefing:
      "*grits teeth* {TARGET}'s {OPERATION} at {LOCATION} is killin' me. Takin' food outta my family's mouths. I need it... stopped. Equipment busted, supplies ruined, workers scared off - I don't much care how. BUT - *grabs your arm* - it's gotta look natural. An accident. Bad luck. Divine intervention, if you're feelin' creative. If this leads back to me, we're both swingin' from the same rope. Make it look good, make it stick, and I'll make it worth yer while.",
    objectives: [
      {
        type: 'visit_location',
        description: "Scout {LOCATION} for weak points",
        location: '{LOCATION}',
      },
      {
        type: 'investigate_location',
        description: "Figure out how to bring down the {OPERATION}",
        location: '{LOCATION}',
      },
      {
        type: 'steal_item',
        description: "Sabotage the {OPERATION} good and proper",
        target: '{OPERATION}',
      },
      {
        type: 'escape_location',
        description: "Clear out before anyone gets suspicious",
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
    title: "Hit the {TOWN} Stage",
    description:
      "The {TOWN} stagecoach rolls through {LOCATION} every {DAY}, heavy with {CARGO}. {NPC}'s got a plan to relieve 'em of that burden - just needs another gun.",
    briefing:
      "*spreads a crude map on the table* The {TOWN} stagecoach - she carries {CARGO} worth a king's ransom. Rolls through {LOCATION} every {DAY}, regular as clockwork. The guards are {GUARD_STATUS} - ain't gonna be easy, but it ain't gonna be impossible neither. I got me a plan, but I need another gun I can trust. *taps the map* We hit 'em here, where the road narrows. Split the take {SPLIT}. *looks up* Well? You got the stones for some highway work, or you just another yellow-belly pretendin' to be an outlaw?",
    objectives: [
      {
        type: 'visit_location',
        description: "Get into position at {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'defeat_gang',
        description: "Take down the stagecoach guards",
        target: 'guards',
        count: '{GUARD_COUNT}',
      },
      {
        type: 'steal_item',
        description: "Grab the {CARGO} before anyone gets brave",
        target: '{CARGO}',
      },
      {
        type: 'escape_location',
        description: "Ride out fast before the posse comes",
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
    title: "Get {VICTIM} Back From {GANG}",
    description:
      "{GANG}'s snatched {VICTIM} and they're holdin' 'em at {LOCATION}. Time to kick down some doors and get 'em out alive - or die tryin'.",
    briefing:
      "*grabbing your arm desperately* They took my {RELATION} {VICTIM}! {GANG} - those animals - they're demandin' {RANSOM} gold in ransom. But even if I pay, who knows if those snakes'll keep their word? They might just take the money and... *voice breaks* Please, stranger, rescue {VICTIM} from {LOCATION}. I'll pay you {REWARD} gold - every cent I got in this world. Just bring my {RELATION} back breathin'. That's all I ask.",
    objectives: [
      {
        type: 'visit_location',
        description: "Break into {GANG}'s hideout at {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'find_item',
        description: "Find where they're keepin' {VICTIM}",
        target: '{VICTIM}',
      },
      {
        type: 'protect_npc',
        description: "Get {VICTIM} loose and keep 'em breathin'",
        target: '{VICTIM}',
      },
      {
        type: 'escape_location',
        description: "Fight yer way out with {VICTIM}",
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
    title: "Mine Collapse at {LOCATION}",
    description:
      "The mine at {LOCATION}'s caved in with {COUNT} souls trapped inside. Air's runnin' out fast - every minute counts.",
    briefing:
      "*covered in dust, wild-eyed* The mine at {LOCATION} - she collapsed! {COUNT} men trapped down there in the dark. We been diggin' but it's slow goin' and they're runnin' outta air. You can hear 'em tappin' on the walls - three taps, pause, three taps. The signal for 'we're alive.' But them taps is gettin' weaker. We need help, stranger - strong backs and folks who ain't afraid of tight spaces. Every minute we stand here jawin' is another minute them boys got less air to breathe!",
    objectives: [
      {
        type: 'visit_location',
        description: "Get to the collapsed mine at {LOCATION} - fast",
        location: '{LOCATION}',
      },
      {
        type: 'investigate_location',
        description: "Find a way through that won't bring the whole thing down",
        location: '{LOCATION}',
      },
      {
        type: 'collect_items',
        description: "Dig through the rubble - them boys is countin' on you",
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
    title: "Stranded Souls in the {TERRAIN}",
    description:
      "Wagon party's stuck out in the {TERRAIN} near {LOCATION}. {WEATHER}'s rollin' in fast. If nobody reaches 'em soon, the desert'll claim 'em all.",
    briefing:
      "*points toward the horizon* There's a wagon party stranded out in the {TERRAIN} near {LOCATION}. {OBSTACLE}'s got 'em pinned down good, and you see them clouds? {WEATHER}'s comin' in hard and fast. If somebody don't reach 'em 'fore that storm hits, they're dead. Men, women, children - all of 'em. Buzzard food. *grabs saddle* I need a volunteer who knows these lands, someone who can ride fast and shoot straight. This ain't gonna be easy, but them folk's only hope is someone with enough guts to try. You that someone?",
    objectives: [
      {
        type: 'visit_location',
        description: "Push through to the stranded travelers at {LOCATION}",
        location: '{LOCATION}',
      },
      {
        type: 'protect_npc',
        description: "Lead them folks back to safety",
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
// GHOST RIDERS QUEST CHAIN - AAA SUPERNATURAL STORYLINE
// 5 connected quests with morally grey choices (Fallout New Vegas style)
// The Ghost Riders are condemned cavalry who refuse to stay dead
// ============================================================================

export const GHOST_RIDERS_QUEST_CHAIN: QuestTemplate[] = [
  // QUEST 1: STRANGE HOOFBEATS
  {
    id: 'ghost_riders_1_strange_hoofbeats',
    type: 'investigate',
    title: 'Strange Hoofbeats',
    description:
      "Folks in Whiskey Bend have been hearin' hoofbeats at midnight - dozens of horses ridin' hard across the desert. But come mornin', there ain't no tracks. The preacher says it's just the wind. The drunk at the saloon says it's the Devil's cavalry. Either way, someone needs to find out.",
    briefing:
      "Listen, stranger - I ain't one for ghost stories. Been livin' out here thirty years and seen everything this desert's got to offer. But these last few nights... *lowers voice* ...I heard 'em. Horses, dozens of 'em, ridin' like hell itself was chasin' 'em. Came from the direction of Dead Man's Canyon. I went to look at dawn - nothin'. Not a single hoofprint. The Kaiowa call that place cursed, say the spirits of soldiers ride there still. I need someone with sand to go out there at midnight and see what's what. You look like you ain't afraid of the dark.",
    objectives: [
      {
        type: 'visit_location',
        description: "Wait at Dead Man's Canyon after midnight",
        location: "Dead Man's Canyon",
      },
      {
        type: 'investigate_location',
        description: 'Witness the phenomenon',
        location: "Dead Man's Canyon",
      },
      {
        type: 'gather_information',
        description: 'Survive the encounter',
      },
      {
        type: 'talk_to_npc',
        description: "Report to the old-timer at Whiskey Bend",
        target: 'old-timer',
        hidden: true,
      },
    ],
    rewards: {
      gold: '150',
      xp: '200',
      reputation: [{ faction: 'settlerAlliance', amount: '15' }],
    },
    levelRange: { min: 15, max: 35 },
    tags: ['supernatural', 'investigation', 'ghost_riders_chain'],
    giverRoles: ['rancher'],
  },

  // QUEST 2: THE CAPTAIN'S JOURNAL
  {
    id: 'ghost_riders_2_captains_journal',
    type: 'fetch',
    title: "The Captain's Journal",
    description:
      "You saw them - the Ghost Riders. A cavalry unit, maybe fifty strong, ridin' hard through the night on horses that leave no tracks and make no sound until they're almost on top of you. Their uniforms were Confederate gray, torn and bloodied. The lead rider turned to look at you with eyes like burnin' coals. Now you need answers. The Kaiowa elder might know somethin'. So might that journal buried with Captain Ezra Holloway at the old cemetery.",
    briefing:
      "So you saw 'em too. *exhales slowly* Ain't many who see the Riders and live to tell it. Means they want somethin' from you. I've been diggin' through old records - turns out that canyon's got history. Confederate cavalry unit, got caught in a ambush back in '64. Captain Ezra Holloway and his boys. Never found the bodies. But someone found his journal, buried it with an empty coffin in the old cemetery outside town. That journal might tell us what happened - and why they won't stay dead. There's also an old Kaiowa who knows stories about that canyon. Might be worth askin' both.",
    objectives: [
      {
        type: 'visit_location',
        description: "Dig up Captain Holloway's grave at the old cemetery",
        location: 'old cemetery',
      },
      {
        type: 'find_item',
        description: "Retrieve Captain Holloway's journal",
        target: "captain's journal",
      },
      {
        type: 'talk_to_npc',
        description: "Speak with the Kaiowa elder about Dead Man's Canyon",
        target: 'Kaiowa elder',
        optional: true,
      },
      {
        type: 'gather_information',
        description: 'Piece together what happened in 1864',
      },
    ],
    rewards: {
      gold: '200',
      xp: '300',
      reputation: [
        { faction: 'settlerAlliance', amount: '20' },
        { faction: 'kaiowa', amount: '10' },
      ],
      item: "captain's-journal",
    },
    prerequisites: ['ghost_riders_1_strange_hoofbeats'],
    levelRange: { min: 18, max: 38 },
    tags: ['supernatural', 'fetch', 'ghost_riders_chain', 'graverobbing'],
    giverRoles: ['rancher', 'preacher'],
  },

  // QUEST 3: THE MASSACRE AT COLD SPRING
  {
    id: 'ghost_riders_3_massacre_at_cold_spring',
    type: 'investigate',
    title: 'The Massacre at Cold Spring',
    description:
      "The journal tells a dark tale. Captain Holloway's company wasn't ambushed - they were the ambushers. Attacked a Kaiowa village at Cold Spring, killed everyone: men, women, children. But a medicine man cursed them with his dying breath. 'Ride forever,' he said. 'Ride until you undo what was done.' The Kaiowa elder says the curse can be broken, but it requires finding what remains of the village and performin' a ritual. Question is - do these murderers deserve release?",
    briefing:
      "*reads from journal* 'God forgive me for what we did at Cold Spring. The men had gone mad with bloodlust. I tried to stop them, but...' *closes book* These weren't soldiers, they were butchers. The Kaiowa elder says the curse bound them to ride until they make amends - but the dead can't bring back the dead. There's a way to end it, though. The village at Cold Spring - or what's left of it - still stands. The bones of the murdered are still there, unburied. Give them proper burial, perform the Kaiowa death rites, and the spirits might rest. But partner... *leans in* ...part of me thinks maybe they deserve to ride forever.",
    objectives: [
      {
        type: 'visit_location',
        description: "Travel to the ruins of Cold Spring village",
        location: 'Cold Spring',
      },
      {
        type: 'investigate_location',
        description: 'Find the remains of the massacre victims',
        location: 'Cold Spring',
      },
      {
        type: 'talk_to_npc',
        description: 'Learn the Kaiowa death rites from the elder',
        target: 'Kaiowa elder',
      },
      {
        type: 'collect_items',
        description: 'Gather sacred herbs for the ritual',
        target: 'sacred-herbs',
        count: '7',
      },
    ],
    rewards: {
      gold: '250',
      xp: '400',
      reputation: [{ faction: 'kaiowa', amount: '30' }],
    },
    prerequisites: ['ghost_riders_2_captains_journal'],
    levelRange: { min: 20, max: 40 },
    tags: ['supernatural', 'investigation', 'ghost_riders_chain', 'kaiowa', 'morally_grey'],
    giverRoles: ['preacher'],
  },

  // QUEST 4: THE CHOICE - MORALLY GREY BRANCHING
  {
    id: 'ghost_riders_4_the_reckoning',
    type: 'social',
    title: 'The Reckoning',
    description:
      "You stand at Cold Spring, bones of the innocent at your feet, herbs for the ritual in your pack. The Kaiowa death rites could end this. But Captain Holloway's ghost appeared to you in the night. He claims his men went mad because they found something in that canyon - a darkness older than man - and the massacre was its work, not theirs. He begs you to find this darkness and destroy it instead. The Kaiowa elder says this is a trick, that the captain just wants freedom without atonement. Someone's lying. Or maybe no one is.",
    briefing:
      "*The ghost of Captain Holloway speaks* 'Please... listen. We found something in that canyon. An old mine, older than any white man should've built. There was writing on the walls - not English, not Spanish, not any language I knew. And sounds... whisperin' from deep below. My men changed after we went in there. Their eyes went dark. They did things... things I couldn't stop 'em from. We weren't ourselves. The darkness used us.' *The Kaiowa elder speaks* 'The white soldier lies. His guilt seeks escape. Evil men always blame spirits for what they choose to do. Perform the rites. Give peace to my ancestors. Let these murderers ride forever.'",
    objectives: [
      {
        type: 'talk_to_npc',
        description: "Listen to Captain Holloway's ghost",
        target: "Captain Holloway's ghost",
      },
      {
        type: 'talk_to_npc',
        description: "Hear the Kaiowa elder's counsel",
        target: 'Kaiowa elder',
      },
      {
        type: 'investigate_location',
        description: 'CHOICE: Investigate the old mine in the canyon',
        location: "Dead Man's Canyon mine",
        optional: true,
      },
      {
        type: 'visit_location',
        description: 'CHOICE: Perform the death rites at Cold Spring',
        location: 'Cold Spring',
        optional: true,
      },
    ],
    rewards: {
      gold: '300',
      xp: '500',
      reputation: [{ faction: 'kaiowa', amount: '-20' }], // OR +40 depending on choice
    },
    consequences: {
      choice_mine: {
        description: 'Investigate the mine to find the truth',
        leads_to: 'ghost_riders_5a_into_darkness',
        reputation_change: { kaiowa: -20, settlerAlliance: 20 },
      },
      choice_ritual: {
        description: 'Perform the death rites, damn the cavalry forever',
        leads_to: 'ghost_riders_5b_eternal_ride',
        reputation_change: { kaiowa: 40, settlerAlliance: -10 },
      },
    },
    prerequisites: ['ghost_riders_3_massacre_at_cold_spring'],
    levelRange: { min: 22, max: 42 },
    tags: ['supernatural', 'social', 'ghost_riders_chain', 'morally_grey', 'branching'],
    giverRoles: ['preacher'],
  },

  // QUEST 5A: INTO DARKNESS (Investigate the Mine)
  {
    id: 'ghost_riders_5a_into_darkness',
    type: 'investigate',
    title: 'Into Darkness',
    description:
      "You chose to investigate the mine. The captain's ghost leads you to an entrance hidden by a century of desert dust. Inside, the walls are carved with symbols that hurt to look at. Something old and hungry waits in the deep. The Kaiowa elder refuses to help you now - 'You've chosen the murderer's lie,' he says. 'Face what waits alone.' But maybe what waits down there was the real monster all along.",
    briefing:
      "*Descending into the mine, Captain Holloway's ghost walks beside you* 'I came down here once before, in life. What I saw... it broke somethin' in me. Broke somethin' in all of us. It's old, whatever it is. Older than the Kaiowa, older than the land itself. It whispered to us, showed us visions of blood and fire. My men... they couldn't resist. I couldn't resist. The massacre wasn't just murder - it was a sacrifice. The thing fed on it.' *The tunnel opens into a vast chamber* 'It's still here. It's been waiting. Destroy it, and maybe... maybe we can finally rest.'",
    objectives: [
      {
        type: 'visit_location',
        description: 'Descend into the ancient mine',
        location: "Dead Man's Canyon mine",
      },
      {
        type: 'investigate_location',
        description: 'Navigate the tunnels carved with forbidden symbols',
        location: 'mine depths',
      },
      {
        type: 'find_item',
        description: 'Find the source of the darkness',
        target: 'eldritch-artifact',
      },
      {
        type: 'kill_target',
        description: 'Destroy the ancient hunger',
        target: 'The Whispering Dark',
      },
      {
        type: 'escape_location',
        description: 'Escape the collapsing mine',
        location: "Dead Man's Canyon mine",
      },
    ],
    rewards: {
      gold: '500',
      xp: '1000',
      item: 'ghost-riders-cavalry-saber',
      reputation: [
        { faction: 'settlerAlliance', amount: '50' },
        { faction: 'kaiowa', amount: '-30' },
      ],
      unlock: 'GHOST_RIDERS_FREED',
    },
    prerequisites: ['ghost_riders_4_the_reckoning'],
    levelRange: { min: 25, max: 45 },
    tags: ['supernatural', 'combat', 'ghost_riders_chain', 'cosmic_horror', 'ending_a'],
    giverRoles: ['preacher'],
    failConditions: ['player death in mine'],
  },

  // QUEST 5B: ETERNAL RIDE (Perform the Death Rites)
  {
    id: 'ghost_riders_5b_eternal_ride',
    type: 'social',
    title: 'Eternal Ride',
    description:
      "You chose to honor the dead at Cold Spring. The captain's ghost screams as you begin the ritual, begging you to stop. 'We didn't know! It wasn't our fault!' But wrong is wrong, and fifty innocent souls deserve rest more than fifty murderers deserve freedom. The Kaiowa elder guides you through the death rites. As dawn breaks, the ghosts of Cold Spring rise - and so do the Ghost Riders, one final time, to face the judgment they've been fleeing for a hundred years.",
    briefing:
      "*The Kaiowa elder chants as you prepare the ritual* 'The bones must be washed in sacred water. The herbs must be burned at the cardinal points. And the names - you must speak the names of the dead, each one, so they know they are remembered.' *Captain Holloway's ghost appears, desperate* 'Please! We were possessed! The darkness made us do it!' *The elder continues, unmoved* 'Speak the names. There are forty-seven souls who died that day. Women. Children. They deserve peace. These soldiers deserve to ride forever with their guilt.'",
    objectives: [
      {
        type: 'collect_items',
        description: 'Gather sacred water from the spring',
        target: 'sacred-water',
        count: '1',
      },
      {
        type: 'visit_location',
        description: 'Burn the herbs at the four cardinal points',
        location: 'Cold Spring',
      },
      {
        type: 'talk_to_npc',
        description: 'Speak the names of the forty-seven dead',
        target: 'massacre victims',
      },
      {
        type: 'survive_time',
        description: 'Complete the ritual while the Ghost Riders attack',
        count: '5', // minutes
      },
      {
        type: 'talk_to_npc',
        description: 'Watch the Ghost Riders face their judgment',
        target: 'Kaiowa spirits',
        hidden: true,
      },
    ],
    rewards: {
      gold: '400',
      xp: '1000',
      item: 'kaiowa-blessing-amulet',
      reputation: [
        { faction: 'kaiowa', amount: '75' },
        { faction: 'settlerAlliance', amount: '-20' },
      ],
      unlock: 'GHOST_RIDERS_DAMNED',
    },
    prerequisites: ['ghost_riders_4_the_reckoning'],
    levelRange: { min: 25, max: 45 },
    tags: ['supernatural', 'ritual', 'ghost_riders_chain', 'kaiowa', 'ending_b'],
    giverRoles: ['preacher'],
    consequences: {
      outcome: "The Ghost Riders are condemned to ride forever, but the massacre victims finally rest. Captain Holloway's screams echo through the canyon as his company is dragged into the spirit world. The Kaiowa elder thanks you - 'Justice is done. The ancestors are at peace.' Some in town call you a hero. Others whisper that you condemned souls who might have been innocent. The truth? Maybe there never was one.",
    },
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
  ...GHOST_RIDERS_QUEST_CHAIN,
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
  return SecureRNG.select(pool);
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
