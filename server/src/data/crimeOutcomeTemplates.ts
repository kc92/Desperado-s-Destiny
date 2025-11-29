/**
 * Crime Outcome Templates
 *
 * Procedural templates for generating thousands of unique crime outcomes.
 * Part of Phase D - Content Explosion System
 *
 * Base templates expand to 33,000+ unique combinations through:
 * - Variable substitution (NPC, LOCATION, ITEM, etc.)
 * - Dynamic reward/consequence scaling
 * - Contextual narrative elements
 */

// ============================================================================
// TYPES
// ============================================================================

export type CrimeOutcome = 'success' | 'partial' | 'failure' | 'caught';

export interface CrimeOutcomeTemplate {
  id: string;
  crimeType: string;
  outcome: CrimeOutcome;
  template: string; // Template with {VARIABLES}
  variables: string[]; // Variables used in template
  rewards?: {
    gold?: string; // Can be formula like '{BASE_GOLD}' or '50-100'
    xp?: string;
    item?: string;
    reputation?: { faction: string; amount: string };
  };
  consequences?: {
    wanted?: string; // Wanted level increase
    reputation?: { faction: string; amount: string };
    jailTime?: string; // Minutes
    bounty?: string;
  };
  rarity?: 'common' | 'uncommon' | 'rare'; // Template selection weight
  flavorTags?: string[]; // For filtering by context
}

// ============================================================================
// WITNESS OUTCOME FRAGMENTS
// ============================================================================

export const WITNESS_OUTCOMES = {
  none: [
    'Nobody saw a thing.',
    'The darkness was your ally tonight.',
    'You slipped away like a ghost in the night.',
    'The townsfolk were none the wiser.',
    'Clean getaway, no witnesses.',
    'You vanished before anyone could raise the alarm.',
    'The deed is done, and your secret is safe.',
  ],
  partial: [
    'A passing stranger might have caught a glimpse, but they hurried on.',
    'An old-timer watched from the shadows, but he knows when to keep quiet.',
    'A child saw you from a window, but who would believe them?',
    'Someone heard the commotion, but by the time they looked, you were gone.',
    'A drunk stumbled past but was too far gone to remember anything.',
  ],
  witnessed: [
    'A sharp-eyed deputy spotted you from across the street.',
    'The town gossip saw everything and is already spreading the word.',
    'A merchant witnessed the whole affair and is pointing fingers.',
    'The sheriff himself caught you red-handed.',
    'Multiple witnesses can place you at the scene.',
    'A bounty hunter took note of your face.',
    'The bank teller will never forget your face.',
  ],
};

// ============================================================================
// ROBBERY TEMPLATES (12 templates)
// ============================================================================

export const ROBBERY_TEMPLATES: CrimeOutcomeTemplate[] = [
  // SUCCESS TEMPLATES (5)
  {
    id: 'robbery_success_1',
    crimeType: 'robbery',
    outcome: 'success',
    template:
      'You cornered {NPC} in {LOCATION} and relieved them of {GOLD} gold. {WITNESS_OUTCOME} The look of fear in their eyes told you they would not be reporting this to the sheriff anytime soon.',
    variables: ['NPC', 'LOCATION', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '50' },
    rarity: 'common',
    flavorTags: ['intimidation', 'gold'],
  },
  {
    id: 'robbery_success_2',
    crimeType: 'robbery',
    outcome: 'success',
    template:
      'The stagecoach from {ORIGIN_TOWN} never saw you coming. You made off with {GOLD} gold in strongboxes and a fine {ITEM} to boot. {WITNESS_OUTCOME} The desert swallowed your tracks.',
    variables: ['ORIGIN_TOWN', 'GOLD', 'ITEM', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '75', item: '{ITEM}' },
    rarity: 'uncommon',
    flavorTags: ['stagecoach', 'loot'],
  },
  {
    id: 'robbery_success_3',
    crimeType: 'robbery',
    outcome: 'success',
    template:
      'With your bandana pulled high and your revolver gleaming in the {TIME_OF_DAY} light, you held up {NPC} outside {LOCATION}. They handed over {GOLD} gold without a word. {WITNESS_OUTCOME}',
    variables: ['TIME_OF_DAY', 'NPC', 'LOCATION', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '60' },
    rarity: 'common',
    flavorTags: ['holdup', 'dramatic'],
  },
  {
    id: 'robbery_success_4',
    crimeType: 'robbery',
    outcome: 'success',
    template:
      'The {BUSINESS_TYPE} was an easy mark. While {NPC} was distracted, you cleaned out the cash box - {GOLD} gold, crisp and ready. {WITNESS_OUTCOME} You tipped your hat on the way out.',
    variables: ['BUSINESS_TYPE', 'NPC', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '55' },
    rarity: 'common',
    flavorTags: ['business', 'stealth'],
  },
  {
    id: 'robbery_success_5',
    crimeType: 'robbery',
    outcome: 'success',
    template:
      'You waited until {NPC} left the {LOCATION}, then followed them into the alley. A quick word and a flash of steel, and they surrendered {GOLD} gold, a {ITEM}, and their dignity. {WITNESS_OUTCOME}',
    variables: ['NPC', 'LOCATION', 'GOLD', 'ITEM', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '65', item: '{ITEM}' },
    rarity: 'uncommon',
    flavorTags: ['alley', 'intimidation'],
  },

  // PARTIAL SUCCESS TEMPLATES (3)
  {
    id: 'robbery_partial_1',
    crimeType: 'robbery',
    outcome: 'partial',
    template:
      '{NPC} put up more of a fight than expected. You got away with only {GOLD} gold before backup arrived. {WITNESS_OUTCOME} Still, something is better than nothing.',
    variables: ['NPC', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '30' },
    consequences: { wanted: '1', reputation: { faction: 'settlerAlliance', amount: '-5' } },
    rarity: 'common',
    flavorTags: ['resistance', 'escape'],
  },
  {
    id: 'robbery_partial_2',
    crimeType: 'robbery',
    outcome: 'partial',
    template:
      'The job at {LOCATION} went sideways when {NPC} reached for a hidden derringer. You grabbed what you could - {GOLD} gold - and bolted. {WITNESS_OUTCOME} Your heart is still pounding.',
    variables: ['LOCATION', 'NPC', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '35' },
    consequences: { wanted: '1' },
    rarity: 'common',
    flavorTags: ['dangerous', 'close_call'],
  },
  {
    id: 'robbery_partial_3',
    crimeType: 'robbery',
    outcome: 'partial',
    template:
      'The strongbox was heavier than you thought. You had to leave half the take behind when {COMPLICATION} forced you to flee. You escaped with {GOLD} gold. {WITNESS_OUTCOME}',
    variables: ['COMPLICATION', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '25' },
    consequences: { wanted: '1' },
    rarity: 'uncommon',
    flavorTags: ['heist', 'complications'],
  },

  // FAILURE TEMPLATES (2)
  {
    id: 'robbery_failure_1',
    crimeType: 'robbery',
    outcome: 'failure',
    template:
      '{NPC} saw through your bluff and called it. Before you could react, they had a shotgun leveled at your chest. You backed off empty-handed, pride wounded but still breathing.',
    variables: ['NPC'],
    consequences: { reputation: { faction: 'frontera', amount: '-5' } },
    rarity: 'common',
    flavorTags: ['humiliation', 'standoff'],
  },
  {
    id: 'robbery_failure_2',
    crimeType: 'robbery',
    outcome: 'failure',
    template:
      'The safe at {LOCATION} was tougher than expected. You spent all night trying to crack it, only to hear the {TIME_OF_DAY} roosters crow. You slipped away with nothing but sore hands and a bruised ego.',
    variables: ['LOCATION', 'TIME_OF_DAY'],
    consequences: { reputation: { faction: 'frontera', amount: '-3' } },
    rarity: 'uncommon',
    flavorTags: ['safecracking', 'failure'],
  },

  // CAUGHT TEMPLATES (2)
  {
    id: 'robbery_caught_1',
    crimeType: 'robbery',
    outcome: 'caught',
    template:
      'The sheriff was waiting for you at {LOCATION}. Seems {NPC} had already tipped them off. "You\'re coming with me, outlaw," the lawman growled as the cold steel of handcuffs clicked around your wrists.',
    variables: ['LOCATION', 'NPC'],
    consequences: { wanted: '2', jailTime: '30', bounty: '50' },
    rarity: 'common',
    flavorTags: ['arrest', 'betrayal'],
  },
  {
    id: 'robbery_caught_2',
    crimeType: 'robbery',
    outcome: 'caught',
    template:
      'A posse was forming before you even cleared {LOCATION}. They ran you down like a dog in the {TERRAIN}. Now you are staring at the inside of a jail cell, counting the days until your release.',
    variables: ['LOCATION', 'TERRAIN'],
    consequences: { wanted: '3', jailTime: '60', bounty: '100' },
    rarity: 'uncommon',
    flavorTags: ['chase', 'posse'],
  },
];

// ============================================================================
// PICKPOCKET TEMPLATES (10 templates)
// ============================================================================

export const PICKPOCKET_TEMPLATES: CrimeOutcomeTemplate[] = [
  // SUCCESS TEMPLATES (4)
  {
    id: 'pickpocket_success_1',
    crimeType: 'pickpocket',
    outcome: 'success',
    template:
      'Your nimble fingers found {NPC}\'s wallet in the crowd at {LOCATION}. {GOLD} gold richer, you melted into the masses. {WITNESS_OUTCOME} The mark never felt a thing.',
    variables: ['NPC', 'LOCATION', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '25' },
    rarity: 'common',
    flavorTags: ['crowd', 'stealth'],
  },
  {
    id: 'pickpocket_success_2',
    crimeType: 'pickpocket',
    outcome: 'success',
    template:
      'The distraction you created worked perfectly. While everyone was looking at {DISTRACTION}, you liberated {GOLD} gold and a fine {ITEM} from {NPC}. {WITNESS_OUTCOME}',
    variables: ['DISTRACTION', 'GOLD', 'ITEM', 'NPC', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '35', item: '{ITEM}' },
    rarity: 'uncommon',
    flavorTags: ['distraction', 'planning'],
  },
  {
    id: 'pickpocket_success_3',
    crimeType: 'pickpocket',
    outcome: 'success',
    template:
      'You bumped into {NPC} outside {LOCATION}, apologized profusely, and walked away with their coin purse. {GOLD} gold for a few seconds of work. {WITNESS_OUTCOME}',
    variables: ['NPC', 'LOCATION', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '20' },
    rarity: 'common',
    flavorTags: ['bump', 'quick'],
  },
  {
    id: 'pickpocket_success_4',
    crimeType: 'pickpocket',
    outcome: 'success',
    template:
      'The {EVENT} at {LOCATION} provided perfect cover. You worked the crowd, taking a little here, a little there. Total haul: {GOLD} gold. {WITNESS_OUTCOME} Just another face in the crowd.',
    variables: ['EVENT', 'LOCATION', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '40' },
    rarity: 'uncommon',
    flavorTags: ['event', 'crowd_work'],
  },

  // PARTIAL SUCCESS TEMPLATES (2)
  {
    id: 'pickpocket_partial_1',
    crimeType: 'pickpocket',
    outcome: 'partial',
    template:
      '{NPC} shifted just as your hand entered their pocket. You managed to grab only {GOLD} gold before pulling back. They looked around suspiciously but did not see you.',
    variables: ['NPC', 'GOLD'],
    rewards: { gold: '{GOLD}', xp: '15' },
    rarity: 'common',
    flavorTags: ['close_call', 'partial'],
  },
  {
    id: 'pickpocket_partial_2',
    crimeType: 'pickpocket',
    outcome: 'partial',
    template:
      'Your mark\'s pocket was nearly empty. You got away with only {GOLD} gold - barely worth the risk. Better luck with your next target.',
    variables: ['GOLD'],
    rewards: { gold: '{GOLD}', xp: '10' },
    rarity: 'common',
    flavorTags: ['poor_mark', 'disappointment'],
  },

  // FAILURE TEMPLATES (2)
  {
    id: 'pickpocket_failure_1',
    crimeType: 'pickpocket',
    outcome: 'failure',
    template:
      '{NPC} caught your wrist in an iron grip. "Looking for something?" they growled. You stammered an excuse and they let you go with a warning and a hard look. Empty-handed again.',
    variables: ['NPC'],
    consequences: { reputation: { faction: 'settlerAlliance', amount: '-3' } },
    rarity: 'common',
    flavorTags: ['caught_in_act', 'warning'],
  },
  {
    id: 'pickpocket_failure_2',
    crimeType: 'pickpocket',
    outcome: 'failure',
    template:
      'The pocket was a trap - a small bell sewn inside. {NPC} spun around at the sound, and you had to run before they could grab you. Today was not your day.',
    variables: ['NPC'],
    consequences: { reputation: { faction: 'settlerAlliance', amount: '-2' } },
    rarity: 'uncommon',
    flavorTags: ['trap', 'escape'],
  },

  // CAUGHT TEMPLATES (2)
  {
    id: 'pickpocket_caught_1',
    crimeType: 'pickpocket',
    outcome: 'caught',
    template:
      'A deputy saw the whole thing. Before you could run, he had you by the collar. "Another pickpocket," he sighed. "Third one this week." Off to jail you go.',
    variables: [],
    consequences: { wanted: '1', jailTime: '15', bounty: '25' },
    rarity: 'common',
    flavorTags: ['deputy', 'caught'],
  },
  {
    id: 'pickpocket_caught_2',
    crimeType: 'pickpocket',
    outcome: 'caught',
    template:
      '{NPC} grabbed your arm and shouted for the law. A mob formed before you could break free. The sheriff arrived to find you surrounded by angry citizens demanding justice.',
    variables: ['NPC'],
    consequences: { wanted: '2', jailTime: '20', bounty: '30' },
    rarity: 'uncommon',
    flavorTags: ['mob', 'public'],
  },
];

// ============================================================================
// BURGLARY TEMPLATES (10 templates)
// ============================================================================

export const BURGLARY_TEMPLATES: CrimeOutcomeTemplate[] = [
  // SUCCESS TEMPLATES (4)
  {
    id: 'burglary_success_1',
    crimeType: 'burglary',
    outcome: 'success',
    template:
      'You slipped through the back window of {BUILDING} while {NPC} slept. The safe practically opened itself. {GOLD} gold and a {ITEM} now rest in your saddlebags. {WITNESS_OUTCOME}',
    variables: ['BUILDING', 'NPC', 'GOLD', 'ITEM', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '60', item: '{ITEM}' },
    rarity: 'common',
    flavorTags: ['night', 'safe'],
  },
  {
    id: 'burglary_success_2',
    crimeType: 'burglary',
    outcome: 'success',
    template:
      'The {BUSINESS_TYPE} was empty during the {TIME_OF_DAY} siesta. You helped yourself to {GOLD} gold from the register and several valuable {ITEM}s from the display. {WITNESS_OUTCOME}',
    variables: ['BUSINESS_TYPE', 'TIME_OF_DAY', 'GOLD', 'ITEM', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '55', item: '{ITEM}' },
    rarity: 'common',
    flavorTags: ['business', 'daytime'],
  },
  {
    id: 'burglary_success_3',
    crimeType: 'burglary',
    outcome: 'success',
    template:
      '{NPC}\'s ranch house was an easy mark. While the hands were out on the range, you ransacked the place. {GOLD} gold, some jewelry worth another {BONUS_GOLD}, and a fine {ITEM}. {WITNESS_OUTCOME}',
    variables: ['NPC', 'GOLD', 'BONUS_GOLD', 'ITEM', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}+{BONUS_GOLD}', xp: '70', item: '{ITEM}' },
    rarity: 'uncommon',
    flavorTags: ['ranch', 'loot'],
  },
  {
    id: 'burglary_success_4',
    crimeType: 'burglary',
    outcome: 'success',
    template:
      'The locked chest in the back room of {LOCATION} contained more than you hoped - {GOLD} gold and documents that might be worth even more to the right buyer. {WITNESS_OUTCOME}',
    variables: ['LOCATION', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '65' },
    rarity: 'uncommon',
    flavorTags: ['documents', 'valuable'],
  },

  // PARTIAL SUCCESS TEMPLATES (2)
  {
    id: 'burglary_partial_1',
    crimeType: 'burglary',
    outcome: 'partial',
    template:
      'A dog started barking at {BUILDING} before you could finish. You grabbed {GOLD} gold and fled through the window, leaving behind the real prize - a strongbox you could not crack in time.',
    variables: ['BUILDING', 'GOLD'],
    rewards: { gold: '{GOLD}', xp: '30' },
    consequences: { wanted: '1' },
    rarity: 'common',
    flavorTags: ['dog', 'interrupted'],
  },
  {
    id: 'burglary_partial_2',
    crimeType: 'burglary',
    outcome: 'partial',
    template:
      '{NPC} returned early, forcing you to hide in the closet for an hour. When they finally fell asleep, you could only grab {GOLD} gold from the dresser before slipping out.',
    variables: ['NPC', 'GOLD'],
    rewards: { gold: '{GOLD}', xp: '25' },
    consequences: { wanted: '1' },
    rarity: 'uncommon',
    flavorTags: ['hiding', 'tense'],
  },

  // FAILURE TEMPLATES (2)
  {
    id: 'burglary_failure_1',
    crimeType: 'burglary',
    outcome: 'failure',
    template:
      'The lock on {BUILDING} defeated you. After an hour of trying, you gave up and skulked away empty-handed, your pride wounded and your lockpicks bent.',
    variables: ['BUILDING'],
    consequences: { reputation: { faction: 'frontera', amount: '-3' } },
    rarity: 'common',
    flavorTags: ['lock', 'failure'],
  },
  {
    id: 'burglary_failure_2',
    crimeType: 'burglary',
    outcome: 'failure',
    template:
      '{NPC} had installed a new alarm system - a string of tin cans that crashed to the floor the moment you opened the window. You barely escaped before the whole neighborhood came running.',
    variables: ['NPC'],
    consequences: { wanted: '1', reputation: { faction: 'settlerAlliance', amount: '-5' } },
    rarity: 'uncommon',
    flavorTags: ['alarm', 'escape'],
  },

  // CAUGHT TEMPLATES (2)
  {
    id: 'burglary_caught_1',
    crimeType: 'burglary',
    outcome: 'caught',
    template:
      'The sheriff was waiting inside {BUILDING} - a trap set after a string of burglaries in town. You walked right into it. "Well, well," he smiled. "Caught you red-handed."',
    variables: ['BUILDING'],
    consequences: { wanted: '3', jailTime: '45', bounty: '75' },
    rarity: 'common',
    flavorTags: ['trap', 'sheriff'],
  },
  {
    id: 'burglary_caught_2',
    crimeType: 'burglary',
    outcome: 'caught',
    template:
      '{NPC} woke to find you halfway out the window with their savings. Their scream brought half the town running. You did not get far before a posse ran you down.',
    variables: ['NPC'],
    consequences: { wanted: '2', jailTime: '60', bounty: '100' },
    rarity: 'uncommon',
    flavorTags: ['chase', 'caught'],
  },
];

// ============================================================================
// SMUGGLING TEMPLATES (8 templates)
// ============================================================================

export const SMUGGLING_TEMPLATES: CrimeOutcomeTemplate[] = [
  // SUCCESS TEMPLATES (3)
  {
    id: 'smuggling_success_1',
    crimeType: 'smuggling',
    outcome: 'success',
    template:
      'The {CONTRABAND} made it across the border without a hitch. {NPC} paid you {GOLD} gold as promised, plus a bonus for your discretion. {WITNESS_OUTCOME} Another successful run.',
    variables: ['CONTRABAND', 'NPC', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '80' },
    rarity: 'common',
    flavorTags: ['border', 'contraband'],
  },
  {
    id: 'smuggling_success_2',
    crimeType: 'smuggling',
    outcome: 'success',
    template:
      'Your hidden compartment worked perfectly. The customs inspectors at {LOCATION} never thought to check beneath the {COVER_STORY}. {GOLD} gold delivered, and nobody the wiser. {WITNESS_OUTCOME}',
    variables: ['LOCATION', 'COVER_STORY', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '90' },
    rarity: 'uncommon',
    flavorTags: ['customs', 'hidden'],
  },
  {
    id: 'smuggling_success_3',
    crimeType: 'smuggling',
    outcome: 'success',
    template:
      'The {WEATHER_CONDITION} provided perfect cover for moving the {CONTRABAND} through {TERRAIN}. You collected {GOLD} gold from {NPC} at the drop point. {WITNESS_OUTCOME} A good night\'s work.',
    variables: ['WEATHER_CONDITION', 'CONTRABAND', 'TERRAIN', 'GOLD', 'NPC', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '75' },
    rarity: 'uncommon',
    flavorTags: ['weather', 'terrain'],
  },

  // PARTIAL SUCCESS TEMPLATES (2)
  {
    id: 'smuggling_partial_1',
    crimeType: 'smuggling',
    outcome: 'partial',
    template:
      'A patrol forced you to dump half the {CONTRABAND} in the river. You delivered what remained and collected {GOLD} gold - half your expected pay. {NPC} was not happy, but at least the law did not catch you.',
    variables: ['CONTRABAND', 'GOLD', 'NPC'],
    rewards: { gold: '{GOLD}', xp: '40' },
    consequences: { reputation: { faction: 'frontera', amount: '-5' } },
    rarity: 'common',
    flavorTags: ['dumped', 'patrol'],
  },
  {
    id: 'smuggling_partial_2',
    crimeType: 'smuggling',
    outcome: 'partial',
    template:
      'Your contact {NPC} got cold feet and only took half the shipment. You are stuck with {CONTRABAND} worth {GOLD} gold that you will have to fence yourself. Annoying, but you will make it work.',
    variables: ['NPC', 'CONTRABAND', 'GOLD'],
    rewards: { gold: '{GOLD}', xp: '35' },
    rarity: 'uncommon',
    flavorTags: ['contact', 'leftovers'],
  },

  // FAILURE TEMPLATES (1)
  {
    id: 'smuggling_failure_1',
    crimeType: 'smuggling',
    outcome: 'failure',
    template:
      'The deal fell through. {NPC} never showed at {LOCATION}, and you are left holding worthless {CONTRABAND} that you cannot sell without their contacts. A wasted trip and a ruined reputation.',
    variables: ['NPC', 'LOCATION', 'CONTRABAND'],
    consequences: { reputation: { faction: 'frontera', amount: '-10' } },
    rarity: 'common',
    flavorTags: ['no_show', 'failure'],
  },

  // CAUGHT TEMPLATES (2)
  {
    id: 'smuggling_caught_1',
    crimeType: 'smuggling',
    outcome: 'caught',
    template:
      'Federal marshals were waiting at {LOCATION}. Someone talked. They found the {CONTRABAND} and you are looking at serious time. The territorial judge does not look kindly on smugglers.',
    variables: ['LOCATION', 'CONTRABAND'],
    consequences: { wanted: '4', jailTime: '90', bounty: '200' },
    rarity: 'common',
    flavorTags: ['marshals', 'betrayed'],
  },
  {
    id: 'smuggling_caught_2',
    crimeType: 'smuggling',
    outcome: 'caught',
    template:
      'The border patrol had dogs this time. They found the {CONTRABAND} hidden in your {HIDING_SPOT}. You are being escorted to the territorial prison in chains.',
    variables: ['CONTRABAND', 'HIDING_SPOT'],
    consequences: { wanted: '3', jailTime: '120', bounty: '250' },
    rarity: 'uncommon',
    flavorTags: ['dogs', 'prison'],
  },
];

// ============================================================================
// ASSAULT & BRAWL TEMPLATES (8 templates)
// ============================================================================

export const ASSAULT_TEMPLATES: CrimeOutcomeTemplate[] = [
  // SUCCESS TEMPLATES (3)
  {
    id: 'assault_success_1',
    crimeType: 'assault',
    outcome: 'success',
    template:
      'You caught {NPC} alone behind {LOCATION}. A few well-placed punches later, they handed over {GOLD} gold to make you stop. {WITNESS_OUTCOME} They will think twice before crossing you again.',
    variables: ['NPC', 'LOCATION', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '40' },
    consequences: { reputation: { faction: 'settlerAlliance', amount: '-10' } },
    rarity: 'common',
    flavorTags: ['beating', 'intimidation'],
  },
  {
    id: 'assault_success_2',
    crimeType: 'assault',
    outcome: 'success',
    template:
      'The barroom brawl was brief but decisive. You laid out {NPC} with a chair to the head, grabbed the pot from the poker table - {GOLD} gold - and walked out before anyone could stop you. {WITNESS_OUTCOME}',
    variables: ['NPC', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '50' },
    consequences: { wanted: '1' },
    rarity: 'uncommon',
    flavorTags: ['brawl', 'saloon'],
  },
  {
    id: 'assault_success_3',
    crimeType: 'assault',
    outcome: 'success',
    template:
      '{NPC} owed money to the wrong people, and you were sent to collect. After a convincing demonstration of your skills, they coughed up {GOLD} gold. {WITNESS_OUTCOME} Business concluded.',
    variables: ['NPC', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '45' },
    rarity: 'common',
    flavorTags: ['collection', 'enforcer'],
  },

  // PARTIAL SUCCESS TEMPLATES (2)
  {
    id: 'assault_partial_1',
    crimeType: 'assault',
    outcome: 'partial',
    template:
      '{NPC} put up more of a fight than expected. You won, but barely, and only managed to take {GOLD} gold before their friends showed up. Time to make yourself scarce.',
    variables: ['NPC', 'GOLD'],
    rewards: { gold: '{GOLD}', xp: '25' },
    consequences: { wanted: '1' },
    rarity: 'common',
    flavorTags: ['tough_fight', 'escape'],
  },
  {
    id: 'assault_partial_2',
    crimeType: 'assault',
    outcome: 'partial',
    template:
      'The fight went your way, but {NPC} managed to bloody your nose before going down. You took {GOLD} gold and a {ITEM} as compensation for your trouble.',
    variables: ['NPC', 'GOLD', 'ITEM'],
    rewards: { gold: '{GOLD}', xp: '30', item: '{ITEM}' },
    consequences: { wanted: '1' },
    rarity: 'uncommon',
    flavorTags: ['injury', 'compensation'],
  },

  // FAILURE TEMPLATES (1)
  {
    id: 'assault_failure_1',
    crimeType: 'assault',
    outcome: 'failure',
    template:
      '{NPC} was tougher than they looked. You ended up on the ground, nursing a black eye while they walked away laughing. Your reputation has taken a hit along with your face.',
    variables: ['NPC'],
    consequences: { reputation: { faction: 'frontera', amount: '-10' } },
    rarity: 'common',
    flavorTags: ['beaten', 'humiliation'],
  },

  // CAUGHT TEMPLATES (2)
  {
    id: 'assault_caught_1',
    crimeType: 'assault',
    outcome: 'caught',
    template:
      'The deputy saw the whole thing from across the street. You had barely finished with {NPC} when you felt the cold steel of a gun barrel against your neck. "You are under arrest."',
    variables: ['NPC'],
    consequences: { wanted: '2', jailTime: '30', bounty: '50' },
    rarity: 'common',
    flavorTags: ['deputy', 'arrest'],
  },
  {
    id: 'assault_caught_2',
    crimeType: 'assault',
    outcome: 'caught',
    template:
      '{NPC} turned out to be the mayor\'s {RELATION}. Within the hour, a posse had you surrounded. Now you are facing assault charges and a very angry town council.',
    variables: ['NPC', 'RELATION'],
    consequences: { wanted: '3', jailTime: '45', bounty: '100' },
    rarity: 'uncommon',
    flavorTags: ['important_victim', 'politics'],
  },
];

// ============================================================================
// CATTLE RUSTLING TEMPLATES (6 templates)
// ============================================================================

export const RUSTLING_TEMPLATES: CrimeOutcomeTemplate[] = [
  // SUCCESS TEMPLATES (2)
  {
    id: 'rustling_success_1',
    crimeType: 'rustling',
    outcome: 'success',
    template:
      'You cut {CATTLE_COUNT} head from {NPC}\'s herd under cover of darkness. {FENCE_NPC} at {LOCATION} gave you {GOLD} gold for the lot, no questions asked. {WITNESS_OUTCOME}',
    variables: ['CATTLE_COUNT', 'NPC', 'FENCE_NPC', 'LOCATION', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '100' },
    rarity: 'common',
    flavorTags: ['cattle', 'fence'],
  },
  {
    id: 'rustling_success_2',
    crimeType: 'rustling',
    outcome: 'success',
    template:
      'The thunderstorm scattered {NPC}\'s herd perfectly. You rounded up {CATTLE_COUNT} steers and drove them across the county line before dawn. {GOLD} gold profit and a clean getaway. {WITNESS_OUTCOME}',
    variables: ['NPC', 'CATTLE_COUNT', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '110' },
    rarity: 'uncommon',
    flavorTags: ['storm', 'opportunity'],
  },

  // PARTIAL SUCCESS TEMPLATES (2)
  {
    id: 'rustling_partial_1',
    crimeType: 'rustling',
    outcome: 'partial',
    template:
      'The ranch hands at {LOCATION} spotted you before you could take the whole herd. You escaped with only {CATTLE_COUNT} head, worth {GOLD} gold. Better than nothing, but {NPC} will be looking for you.',
    variables: ['LOCATION', 'CATTLE_COUNT', 'GOLD', 'NPC'],
    rewards: { gold: '{GOLD}', xp: '50' },
    consequences: { wanted: '2' },
    rarity: 'common',
    flavorTags: ['spotted', 'partial'],
  },
  {
    id: 'rustling_partial_2',
    crimeType: 'rustling',
    outcome: 'partial',
    template:
      'The cattle stampeded when a coyote spooked them. You managed to recover {CATTLE_COUNT} head for {GOLD} gold, but {NPC}\'s brand is well-known. You will need to lay low for a while.',
    variables: ['CATTLE_COUNT', 'GOLD', 'NPC'],
    rewards: { gold: '{GOLD}', xp: '45' },
    consequences: { wanted: '1' },
    rarity: 'uncommon',
    flavorTags: ['stampede', 'branded'],
  },

  // CAUGHT TEMPLATES (2)
  {
    id: 'rustling_caught_1',
    crimeType: 'rustling',
    outcome: 'caught',
    template:
      '{NPC}\'s ranch hands caught you red-handed with a running iron. In cattle country, that is a hanging offense. You are lucky they decided to hand you over to the law instead of stringing you up on the spot.',
    variables: ['NPC'],
    consequences: { wanted: '4', jailTime: '120', bounty: '300' },
    rarity: 'common',
    flavorTags: ['running_iron', 'serious'],
  },
  {
    id: 'rustling_caught_2',
    crimeType: 'rustling',
    outcome: 'caught',
    template:
      'The ranchers\' association had hired Pinkertons to patrol the territory. They tracked you down with {CATTLE_COUNT} stolen head and arrested you on the spot. Cattle rustling carries a heavy sentence.',
    variables: ['CATTLE_COUNT'],
    consequences: { wanted: '5', jailTime: '180', bounty: '500' },
    rarity: 'uncommon',
    flavorTags: ['pinkertons', 'association'],
  },
];

// ============================================================================
// COUNTERFEITING TEMPLATES (4 templates)
// ============================================================================

export const COUNTERFEITING_TEMPLATES: CrimeOutcomeTemplate[] = [
  // SUCCESS TEMPLATES (2)
  {
    id: 'counterfeiting_success_1',
    crimeType: 'counterfeiting',
    outcome: 'success',
    template:
      'Your fake bills passed without suspicion at {LOCATION}. {NPC} accepted the worthless paper for {GOLD} gold in genuine merchandise. {WITNESS_OUTCOME} The perfect crime.',
    variables: ['LOCATION', 'NPC', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '70' },
    rarity: 'common',
    flavorTags: ['bills', 'merchant'],
  },
  {
    id: 'counterfeiting_success_2',
    crimeType: 'counterfeiting',
    outcome: 'success',
    template:
      'The {ITEM} you forged fooled even the experts. {NPC} paid {GOLD} gold for what they believed was a genuine antique. {WITNESS_OUTCOME} Art is all about perception.',
    variables: ['ITEM', 'NPC', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '85' },
    rarity: 'uncommon',
    flavorTags: ['forgery', 'art'],
  },

  // PARTIAL SUCCESS TEMPLATES (1)
  {
    id: 'counterfeiting_partial_1',
    crimeType: 'counterfeiting',
    outcome: 'partial',
    template:
      '{NPC} examined the bills closely and spotted something off with the serial numbers. They accepted them anyway, but only gave you {GOLD} gold at a steep discount. They know, and now they have leverage.',
    variables: ['NPC', 'GOLD'],
    rewards: { gold: '{GOLD}', xp: '35' },
    consequences: { reputation: { faction: 'settlerAlliance', amount: '-5' } },
    rarity: 'common',
    flavorTags: ['spotted', 'blackmail'],
  },

  // CAUGHT TEMPLATES (1)
  {
    id: 'counterfeiting_caught_1',
    crimeType: 'counterfeiting',
    outcome: 'caught',
    template:
      'A federal agent was conducting a routine inspection at {LOCATION} when he spotted your counterfeit bills. Counterfeiting is a federal offense - you are looking at hard time in a territorial prison.',
    variables: ['LOCATION'],
    consequences: { wanted: '4', jailTime: '150', bounty: '400' },
    rarity: 'common',
    flavorTags: ['federal', 'serious'],
  },
];

// ============================================================================
// TRAIN ROBBERY TEMPLATES (6 templates)
// ============================================================================

export const TRAIN_ROBBERY_TEMPLATES: CrimeOutcomeTemplate[] = [
  // SUCCESS TEMPLATES (2)
  {
    id: 'train_robbery_success_1',
    crimeType: 'train_robbery',
    outcome: 'success',
    template:
      'The express from {ORIGIN_TOWN} to {DESTINATION_TOWN} made an unscheduled stop when you blocked the tracks at {LOCATION}. The safe in the mail car yielded {GOLD} gold and a lockbox of {ITEM}s. {WITNESS_OUTCOME}',
    variables: ['ORIGIN_TOWN', 'DESTINATION_TOWN', 'LOCATION', 'GOLD', 'ITEM', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '150', item: '{ITEM}' },
    rarity: 'uncommon',
    flavorTags: ['express', 'mail_car'],
  },
  {
    id: 'train_robbery_success_2',
    crimeType: 'train_robbery',
    outcome: 'success',
    template:
      'You and your gang boarded at {LOCATION} disguised as passengers. When the train entered {TERRAIN}, you drew your weapons and relieved the passengers of {GOLD} gold. {WITNESS_OUTCOME} The train did not stop until the next town.',
    variables: ['LOCATION', 'TERRAIN', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '130' },
    rarity: 'rare',
    flavorTags: ['passengers', 'gang'],
  },

  // PARTIAL SUCCESS TEMPLATES (2)
  {
    id: 'train_robbery_partial_1',
    crimeType: 'train_robbery',
    outcome: 'partial',
    template:
      'The Pinkerton guard on the train put up a fierce fight. You got away with only {GOLD} gold from the passenger car before having to jump from the moving train. You are bruised but alive.',
    variables: ['GOLD'],
    rewards: { gold: '{GOLD}', xp: '70' },
    consequences: { wanted: '3' },
    rarity: 'common',
    flavorTags: ['pinkerton', 'escape'],
  },
  {
    id: 'train_robbery_partial_2',
    crimeType: 'train_robbery',
    outcome: 'partial',
    template:
      'The express safe had a time lock you could not crack. You made do with {GOLD} gold from the passengers and their valuables, but the real prize remained locked tight.',
    variables: ['GOLD'],
    rewards: { gold: '{GOLD}', xp: '60' },
    consequences: { wanted: '2' },
    rarity: 'uncommon',
    flavorTags: ['time_lock', 'passengers'],
  },

  // CAUGHT TEMPLATES (2)
  {
    id: 'train_robbery_caught_1',
    crimeType: 'train_robbery',
    outcome: 'caught',
    template:
      'The railroad had hired extra security after recent robberies. You found yourself surrounded by armed guards before you could touch the safe. Train robbery carries a life sentence in this territory.',
    variables: [],
    consequences: { wanted: '5', jailTime: '240', bounty: '1000' },
    rarity: 'common',
    flavorTags: ['guards', 'trapped'],
  },
  {
    id: 'train_robbery_caught_2',
    crimeType: 'train_robbery',
    outcome: 'caught',
    template:
      'An off-duty marshal was among the passengers. He organized a resistance that overwhelmed your gang. Now you are bound for the territorial prison - if the lynch mob does not get you first.',
    variables: [],
    consequences: { wanted: '5', jailTime: '300', bounty: '1500' },
    rarity: 'rare',
    flavorTags: ['marshal', 'resistance'],
  },
];

// ============================================================================
// BANK ROBBERY TEMPLATES (6 templates)
// ============================================================================

export const BANK_ROBBERY_TEMPLATES: CrimeOutcomeTemplate[] = [
  // SUCCESS TEMPLATES (2)
  {
    id: 'bank_robbery_success_1',
    crimeType: 'bank_robbery',
    outcome: 'success',
    template:
      'The {LOCATION} First National Bank never stood a chance. You cleaned out the vault - {GOLD} gold - and were across the county line before the sheriff even formed a posse. {WITNESS_OUTCOME} A legendary heist.',
    variables: ['LOCATION', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '200' },
    rarity: 'rare',
    flavorTags: ['vault', 'legendary'],
  },
  {
    id: 'bank_robbery_success_2',
    crimeType: 'bank_robbery',
    outcome: 'success',
    template:
      'Your inside man {NPC} left the back door unlocked as promised. You walked out with {GOLD} gold from the safety deposit boxes while the guards napped out front. {WITNESS_OUTCOME} Easiest money you ever made.',
    variables: ['NPC', 'GOLD', 'WITNESS_OUTCOME'],
    rewards: { gold: '{GOLD}', xp: '180' },
    rarity: 'uncommon',
    flavorTags: ['inside_job', 'deposit_boxes'],
  },

  // PARTIAL SUCCESS TEMPLATES (2)
  {
    id: 'bank_robbery_partial_1',
    crimeType: 'bank_robbery',
    outcome: 'partial',
    template:
      'The alarm triggered faster than expected. You grabbed {GOLD} gold from the teller drawers and bolted. The vault with the real money remains untouched, taunting you from behind its steel door.',
    variables: ['GOLD'],
    rewards: { gold: '{GOLD}', xp: '80' },
    consequences: { wanted: '4' },
    rarity: 'common',
    flavorTags: ['alarm', 'tellers'],
  },
  {
    id: 'bank_robbery_partial_2',
    crimeType: 'bank_robbery',
    outcome: 'partial',
    template:
      'A teller managed to hit the silent alarm while you were working on the vault. You escaped with only {GOLD} gold as sirens began wailing across town. Half a victory is still a victory.',
    variables: ['GOLD'],
    rewards: { gold: '{GOLD}', xp: '90' },
    consequences: { wanted: '3' },
    rarity: 'uncommon',
    flavorTags: ['silent_alarm', 'escape'],
  },

  // CAUGHT TEMPLATES (2)
  {
    id: 'bank_robbery_caught_1',
    crimeType: 'bank_robbery',
    outcome: 'caught',
    template:
      'The bank manager had a shotgun under his desk. While you were focused on the tellers, he drew down on you. Now you are face-first on the marble floor, hands behind your head, as the sheriff arrives.',
    variables: [],
    consequences: { wanted: '5', jailTime: '300', bounty: '2000' },
    rarity: 'common',
    flavorTags: ['manager', 'shotgun'],
  },
  {
    id: 'bank_robbery_caught_2',
    crimeType: 'bank_robbery',
    outcome: 'caught',
    template:
      'Federal marshals were staking out the bank after a tip-off. You never even made it through the front door before they had you surrounded. Bank robbery is a federal crime - you are looking at twenty years.',
    variables: [],
    consequences: { wanted: '5', jailTime: '360', bounty: '3000' },
    rarity: 'rare',
    flavorTags: ['marshals', 'stakeout'],
  },
];

// ============================================================================
// CONSOLIDATED TEMPLATES EXPORT
// ============================================================================

export const ALL_CRIME_TEMPLATES: CrimeOutcomeTemplate[] = [
  ...ROBBERY_TEMPLATES,
  ...PICKPOCKET_TEMPLATES,
  ...BURGLARY_TEMPLATES,
  ...SMUGGLING_TEMPLATES,
  ...ASSAULT_TEMPLATES,
  ...RUSTLING_TEMPLATES,
  ...COUNTERFEITING_TEMPLATES,
  ...TRAIN_ROBBERY_TEMPLATES,
  ...BANK_ROBBERY_TEMPLATES,
];

// ============================================================================
// VARIABLE POOLS FOR EXPANSION
// ============================================================================

export const VARIABLE_POOLS = {
  NPC: [
    'the banker', 'a traveling merchant', 'the saloon owner', 'a railroad worker',
    'the general store keeper', 'a wealthy rancher', 'the hotel manager', 'a Chinese laborer',
    'a Mexican vaquero', 'the local drunk', 'a cattle buyer', 'the town doctor',
    'a visiting businessman', 'the stagecoach driver', 'a gambler', 'the blacksmith',
    'a mine foreman', 'the newspaper editor', 'a church deacon', 'a retired gunfighter',
  ],
  LOCATION: [
    'the saloon', 'the general store', 'the bank', 'the hotel', 'the train station',
    'the livery stable', 'the church', 'the sheriff\'s office', 'the assay office',
    'the telegraph office', 'the barbershop', 'the bathhouse', 'the gambling hall',
    'the brothel', 'the gunsmith', 'the apothecary', 'the feed store', 'the jail',
    'the undertaker', 'the mining office',
  ],
  ITEM: [
    'a gold pocket watch', 'a silver flask', 'a pearl-handled revolver', 'a leather wallet',
    'a fine cigar case', 'a diamond ring', 'a silk handkerchief', 'a bowie knife',
    'a derringer pistol', 'a gold chain', 'a sapphire brooch', 'a compass',
    'a silver snuff box', 'a ivory-handled cane', 'a sterling money clip',
  ],
  TIME_OF_DAY: [
    'early morning', 'midday', 'afternoon', 'evening', 'midnight', 'dusk', 'dawn',
  ],
  TERRAIN: [
    'the desert', 'the canyon', 'the foothills', 'the mesa', 'the riverbank',
    'the badlands', 'the scrubland', 'the prairie', 'the mountain pass', 'the arroyo',
  ],
  BUSINESS_TYPE: [
    'general store', 'saloon', 'hotel', 'bank', 'assay office', 'telegraph office',
    'barbershop', 'gun shop', 'pharmacy', 'gambling hall',
  ],
  COMPLICATION: [
    'a barking dog', 'a night watchman', 'a returning owner', 'a curious deputy',
    'a passing stranger', 'a spooked horse', 'a broken window', 'a jammed lock',
  ],
  CONTRABAND: [
    'whiskey', 'opium', 'guns', 'dynamite', 'stolen cattle', 'counterfeit bills',
    'Chinese immigrants', 'military supplies', 'stolen gold', 'forged documents',
  ],
  WEATHER_CONDITION: [
    'moonless night', 'heavy fog', 'dust storm', 'thunderstorm', 'blizzard', 'scorching heat',
  ],
  DISTRACTION: [
    'a fight in the street', 'a runaway horse', 'a fire alarm', 'a public hanging',
    'a traveling circus', 'a political speech', 'a shootout', 'a church service',
  ],
  EVENT: [
    'the cattle auction', 'the Independence Day celebration', 'the town meeting',
    'the traveling medicine show', 'the harvest festival', 'the railroad opening',
  ],
  ORIGIN_TOWN: [
    'Red Gulch', 'Dry Creek', 'Silver City', 'Tombstone', 'Dodge City', 'Deadwood',
    'Santa Fe', 'El Paso', 'Tucson', 'Phoenix', 'Flagstaff', 'Albuquerque',
  ],
  DESTINATION_TOWN: [
    'San Francisco', 'Denver', 'St. Louis', 'Kansas City', 'New Orleans', 'Chicago',
  ],
  COVER_STORY: [
    'crates of mining equipment', 'barrels of flour', 'bolts of fabric',
    'a wagon of hay', 'church supplies', 'medical supplies',
  ],
  HIDING_SPOT: [
    'false wagon bottom', 'hollowed-out logs', 'burial caskets', 'grain sacks',
    'water barrels', 'horse blankets',
  ],
  RELATION: [
    'nephew', 'niece', 'cousin', 'brother-in-law', 'business partner', 'close friend',
  ],
  FENCE_NPC: [
    'a disreputable buyer', 'a corrupt rancher', 'a border contact', 'a meat packer',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get templates by crime type
 */
export function getTemplatesByCrimeType(crimeType: string): CrimeOutcomeTemplate[] {
  return ALL_CRIME_TEMPLATES.filter((t) => t.crimeType === crimeType);
}

/**
 * Get templates by outcome
 */
export function getTemplatesByOutcome(outcome: CrimeOutcome): CrimeOutcomeTemplate[] {
  return ALL_CRIME_TEMPLATES.filter((t) => t.outcome === outcome);
}

/**
 * Get templates by crime type and outcome
 */
export function getTemplates(
  crimeType: string,
  outcome: CrimeOutcome
): CrimeOutcomeTemplate[] {
  return ALL_CRIME_TEMPLATES.filter(
    (t) => t.crimeType === crimeType && t.outcome === outcome
  );
}

/**
 * Get a random item from a variable pool
 */
export function getRandomFromPool(poolName: keyof typeof VARIABLE_POOLS): string {
  const pool = VARIABLE_POOLS[poolName];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get a random witness outcome based on success
 */
export function getWitnessOutcome(wasWitnessed: boolean, partial?: boolean): string {
  if (!wasWitnessed) {
    return WITNESS_OUTCOMES.none[Math.floor(Math.random() * WITNESS_OUTCOMES.none.length)];
  }
  if (partial) {
    return WITNESS_OUTCOMES.partial[Math.floor(Math.random() * WITNESS_OUTCOMES.partial.length)];
  }
  return WITNESS_OUTCOMES.witnessed[Math.floor(Math.random() * WITNESS_OUTCOMES.witnessed.length)];
}

/**
 * Calculate total possible combinations
 * This shows how 70+ base templates expand to 33,000+ combinations
 */
export function calculateTotalCombinations(): number {
  let total = 0;

  for (const template of ALL_CRIME_TEMPLATES) {
    let combinations = 1;
    for (const variable of template.variables) {
      const poolName = variable as keyof typeof VARIABLE_POOLS;
      if (VARIABLE_POOLS[poolName]) {
        combinations *= VARIABLE_POOLS[poolName].length;
      } else if (variable === 'WITNESS_OUTCOME') {
        // 3 witness states, each with multiple options
        combinations *= 7; // Average options per category
      } else if (variable === 'GOLD') {
        combinations *= 50; // Assume 50 gold value variations
      } else if (variable === 'CATTLE_COUNT') {
        combinations *= 20; // 1-20 cattle
      }
    }
    total += combinations;
  }

  return total;
}

// Export the count for documentation
export const TOTAL_COMBINATIONS = calculateTotalCombinations();
