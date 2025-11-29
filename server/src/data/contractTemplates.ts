/**
 * Contract Templates
 *
 * 67 procedurally generated contract templates across 6 categories
 * Part of the Competitor Parity Plan - Phase B
 */

import { ContractType, ContractDifficulty, ContractTarget, ContractRequirements, ContractRewards } from '../models/DailyContract.model';

/**
 * Contract template definition
 */
export interface ContractTemplate {
  id: string;
  type: ContractType;
  titleTemplate: string;      // Template with {PLACEHOLDERS}
  descriptionTemplate: string;
  targetType: string;         // What kind of target this uses
  difficulty: ContractDifficulty;
  baseProgressMax: number;    // Base completion target
  levelScaling: boolean;      // Whether to scale with level
  baseRewards: {
    gold: number;
    xp: number;
  };
  reputationReward?: {
    faction: string;
    amount: number;
  };
  itemReward?: string;
  requirements?: Partial<ContractRequirements>;
}

/**
 * Placeholder data for template generation
 */
export const PLACEHOLDER_DATA = {
  // NPCs for various interactions
  NPCS: [
    { id: 'sheriff_mcgraw', name: 'Sheriff McGraw', location: 'town_jail' },
    { id: 'doc_holiday', name: 'Doc Holiday', location: 'saloon' },
    { id: 'belle_starr', name: 'Belle Starr', location: 'outlaw_hideout' },
    { id: 'wong_li', name: 'Wong Li', location: 'chinese_quarter' },
    { id: 'padre_miguel', name: 'Padre Miguel', location: 'mission' },
    { id: 'running_elk', name: 'Running Elk', location: 'nahi_camp' },
    { id: 'banker_jones', name: 'Banker Jones', location: 'bank' },
    { id: 'blacksmith_kurt', name: 'Blacksmith Kurt', location: 'smithy' },
    { id: 'madame_rose', name: 'Madame Rose', location: 'saloon' },
    { id: 'prospector_pete', name: 'Prospector Pete', location: 'mine' },
    { id: 'general_store_mary', name: 'Mary Thompson', location: 'general_store' },
    { id: 'undertaker_graves', name: 'Mortimer Graves', location: 'undertaker' }
  ],

  // Locations for visits and deliveries
  LOCATIONS: [
    { id: 'saloon', name: 'The Dusty Rose Saloon' },
    { id: 'bank', name: 'First Frontier Bank' },
    { id: 'general_store', name: 'Thompson\'s General Store' },
    { id: 'sheriff_office', name: 'Sheriff\'s Office' },
    { id: 'mine', name: 'Silver Creek Mine' },
    { id: 'outlaw_hideout', name: 'Devil\'s Canyon Hideout' },
    { id: 'chinese_quarter', name: 'Chinatown District' },
    { id: 'mission', name: 'San Miguel Mission' },
    { id: 'nahi_camp', name: 'Nahi Tribal Grounds' },
    { id: 'stable', name: 'Frontier Stables' },
    { id: 'train_station', name: 'Dusty Junction Station' },
    { id: 'cemetery', name: 'Boot Hill Cemetery' }
  ],

  // Items for collection, delivery, and crafting
  ITEMS: [
    { id: 'whiskey_bottle', name: 'Fine Whiskey' },
    { id: 'gold_nugget', name: 'Gold Nugget' },
    { id: 'dynamite', name: 'Dynamite Stick' },
    { id: 'medicine_pouch', name: 'Medicine Pouch' },
    { id: 'wanted_poster', name: 'Wanted Poster' },
    { id: 'horse_shoe', name: 'Lucky Horseshoe' },
    { id: 'ammunition', name: 'Box of Ammunition' },
    { id: 'tobacco', name: 'Premium Tobacco' },
    { id: 'silver_ore', name: 'Silver Ore' },
    { id: 'leather_hide', name: 'Tanned Leather' },
    { id: 'herbal_remedy', name: 'Herbal Remedy' },
    { id: 'lockpick_set', name: 'Lockpick Set' }
  ],

  // Enemy types for combat
  ENEMIES: [
    { id: 'bandit', name: 'Bandits', location: 'wasteland' },
    { id: 'outlaw', name: 'Outlaws', location: 'outlaw_hideout' },
    { id: 'desperado', name: 'Desperados', location: 'canyon' },
    { id: 'rustler', name: 'Cattle Rustlers', location: 'ranch' },
    { id: 'coyote', name: 'Coyotes', location: 'desert' },
    { id: 'snake', name: 'Rattlesnakes', location: 'rocks' },
    { id: 'wolf', name: 'Wolves', location: 'mountains' },
    { id: 'thug', name: 'Street Thugs', location: 'town' }
  ],

  // Factions for reputation
  FACTIONS: [
    { id: 'settlerAlliance', name: 'Settler Alliance' },
    { id: 'nahiCoalition', name: 'Nahi Coalition' },
    { id: 'frontera', name: 'Frontera' }
  ],

  // Buildings for crimes
  BUILDINGS: [
    { id: 'bank', name: 'First Frontier Bank' },
    { id: 'general_store', name: 'General Store' },
    { id: 'saloon', name: 'Saloon' },
    { id: 'train_station', name: 'Train Station' },
    { id: 'post_office', name: 'Post Office' },
    { id: 'assay_office', name: 'Assay Office' }
  ],

  // Crafting items
  CRAFTABLE_ITEMS: [
    { id: 'bandage', name: 'Bandage' },
    { id: 'lockpick', name: 'Lockpick' },
    { id: 'ammunition', name: 'Ammunition' },
    { id: 'poison', name: 'Poison' },
    { id: 'smoke_bomb', name: 'Smoke Bomb' },
    { id: 'healing_salve', name: 'Healing Salve' }
  ]
};

/**
 * Crime Contracts (15 templates)
 */
export const CRIME_CONTRACTS: ContractTemplate[] = [
  {
    id: 'crime_rob_npc',
    type: 'crime',
    titleTemplate: 'Rob {NPC}',
    descriptionTemplate: 'Waylay {NPC} on the road and relieve them of their valuables. Be careful not to get caught by the law.',
    targetType: 'npc',
    difficulty: 'easy',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 75, xp: 40 }
  },
  {
    id: 'crime_steal_item',
    type: 'crime',
    titleTemplate: 'Steal {ITEM} from {BUILDING}',
    descriptionTemplate: 'Break into {BUILDING} under cover of darkness and steal the {ITEM}. Don\'t leave any evidence.',
    targetType: 'item',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 120, xp: 65 }
  },
  {
    id: 'crime_pickpocket_multiple',
    type: 'crime',
    titleTemplate: 'Pickpocket {COUNT} Townsfolk',
    descriptionTemplate: 'Use your nimble fingers to lift valuables from unsuspecting citizens. Blend into the crowd.',
    targetType: 'count',
    difficulty: 'easy',
    baseProgressMax: 3,
    levelScaling: true,
    baseRewards: { gold: 60, xp: 35 }
  },
  {
    id: 'crime_break_into_safe',
    type: 'crime',
    titleTemplate: 'Crack the Safe at {BUILDING}',
    descriptionTemplate: 'The {BUILDING} has a well-protected safe. Get in, crack it, and get out before anyone notices.',
    targetType: 'building',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 200, xp: 100 },
    itemReward: 'gold_nugget'
  },
  {
    id: 'crime_forge_documents',
    type: 'crime',
    titleTemplate: 'Forge Travel Documents',
    descriptionTemplate: 'Create convincing fake travel papers to help smuggle goods across the border.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 2,
    levelScaling: false,
    baseRewards: { gold: 100, xp: 55 }
  },
  {
    id: 'crime_run_contraband',
    type: 'crime',
    titleTemplate: 'Smuggle {ITEM} to {LOCATION}',
    descriptionTemplate: 'Transport illegal goods without alerting the authorities. Use back roads and stay vigilant.',
    targetType: 'location',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 150, xp: 75 }
  },
  {
    id: 'crime_cattle_rustling',
    type: 'crime',
    titleTemplate: 'Rustle {COUNT} Head of Cattle',
    descriptionTemplate: 'Sneak onto the ranch under moonlight and drive off some cattle. The ranchers won\'t be happy.',
    targetType: 'count',
    difficulty: 'hard',
    baseProgressMax: 5,
    levelScaling: true,
    baseRewards: { gold: 180, xp: 90 }
  },
  {
    id: 'crime_collect_protection',
    type: 'crime',
    titleTemplate: 'Collect Protection Money',
    descriptionTemplate: 'Visit the local businesses and remind them why they pay for "insurance." Be persuasive.',
    targetType: 'count',
    difficulty: 'easy',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 90, xp: 45 }
  },
  {
    id: 'crime_sabotage_equipment',
    type: 'crime',
    titleTemplate: 'Sabotage Mining Equipment',
    descriptionTemplate: 'A rival mining operation needs to have an "accident." Disable their equipment discreetly.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 130, xp: 70 },
    reputationReward: { faction: 'frontera', amount: 5 }
  },
  {
    id: 'crime_plant_evidence',
    type: 'crime',
    titleTemplate: 'Plant Evidence Against {NPC}',
    descriptionTemplate: 'Someone wants {NPC} out of the picture. Plant incriminating evidence in their belongings.',
    targetType: 'npc',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 110, xp: 60 }
  },
  {
    id: 'crime_train_heist_scout',
    type: 'crime',
    titleTemplate: 'Scout the Train Schedule',
    descriptionTemplate: 'Gather intelligence on train arrivals, guards, and cargo. Information is power.',
    targetType: 'none',
    difficulty: 'easy',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 70, xp: 40 }
  },
  {
    id: 'crime_bribe_official',
    type: 'crime',
    titleTemplate: 'Bribe a Town Official',
    descriptionTemplate: 'Grease some palms to look the other way. Everyone has a price.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 85, xp: 50 }
  },
  {
    id: 'crime_eliminate_witness',
    type: 'crime',
    titleTemplate: 'Silence a Witness',
    descriptionTemplate: 'Someone saw too much. Convince them to keep quiet... one way or another.',
    targetType: 'npc',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 175, xp: 85 }
  },
  {
    id: 'crime_steal_horse',
    type: 'crime',
    titleTemplate: 'Steal a Prize Horse',
    descriptionTemplate: 'A wealthy rancher has a beautiful stallion. It\'d look better in your stable.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 220, xp: 110 }
  },
  {
    id: 'crime_intercept_mail',
    type: 'crime',
    titleTemplate: 'Intercept Mail Delivery',
    descriptionTemplate: 'The Pony Express carries more than letters. Waylay the rider and check the saddlebags.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 95, xp: 55 }
  }
];

/**
 * Combat Contracts (12 templates)
 */
export const COMBAT_CONTRACTS: ContractTemplate[] = [
  {
    id: 'combat_defeat_bandits',
    type: 'combat',
    titleTemplate: 'Defeat {COUNT} {ENEMY}',
    descriptionTemplate: 'Clear out the {ENEMY} that have been terrorizing travelers. Make the roads safe again.',
    targetType: 'enemy',
    difficulty: 'easy',
    baseProgressMax: 3,
    levelScaling: true,
    baseRewards: { gold: 80, xp: 50 }
  },
  {
    id: 'combat_win_duels',
    type: 'combat',
    titleTemplate: 'Win {COUNT} Duels',
    descriptionTemplate: 'Prove your quick-draw skills in honorable duels. Your reputation precedes you.',
    targetType: 'count',
    difficulty: 'medium',
    baseProgressMax: 2,
    levelScaling: true,
    baseRewards: { gold: 100, xp: 65 }
  },
  {
    id: 'combat_bounty_hunter',
    type: 'combat',
    titleTemplate: 'Claim Bounty on {NPC}',
    descriptionTemplate: 'There\'s a price on {NPC}\'s head. Bring them in dead or alive for the reward.',
    targetType: 'npc',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 250, xp: 120 }
  },
  {
    id: 'combat_gang_skirmish',
    type: 'combat',
    titleTemplate: 'Participate in Gang Skirmish',
    descriptionTemplate: 'Your gang needs you on the front lines. Fight for territory and honor.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 180, xp: 95 },
    reputationReward: { faction: 'frontera', amount: 10 }
  },
  {
    id: 'combat_protect_convoy',
    type: 'combat',
    titleTemplate: 'Defend Supply Convoy',
    descriptionTemplate: 'Bandits are targeting a supply convoy. Ride along and keep the cargo safe.',
    targetType: 'enemy',
    difficulty: 'medium',
    baseProgressMax: 5,
    levelScaling: false,
    baseRewards: { gold: 140, xp: 80 }
  },
  {
    id: 'combat_clear_hideout',
    type: 'combat',
    titleTemplate: 'Clear {LOCATION}',
    descriptionTemplate: 'An outlaw gang has set up shop at {LOCATION}. Smoke them out and clear the area.',
    targetType: 'location',
    difficulty: 'hard',
    baseProgressMax: 8,
    levelScaling: true,
    baseRewards: { gold: 200, xp: 110 }
  },
  {
    id: 'combat_fight_club',
    type: 'combat',
    titleTemplate: 'Win {COUNT} Bare-Knuckle Fights',
    descriptionTemplate: 'The underground fight club is looking for new blood. Show them what you\'re made of.',
    targetType: 'count',
    difficulty: 'medium',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 120, xp: 70 }
  },
  {
    id: 'combat_hunting_predators',
    type: 'combat',
    titleTemplate: 'Hunt {COUNT} {ENEMY}',
    descriptionTemplate: 'Predators have been attacking livestock. Track them down and end the threat.',
    targetType: 'enemy',
    difficulty: 'easy',
    baseProgressMax: 4,
    levelScaling: true,
    baseRewards: { gold: 70, xp: 45 }
  },
  {
    id: 'combat_arena_champion',
    type: 'combat',
    titleTemplate: 'Win Tournament Round',
    descriptionTemplate: 'The fighting tournament is in town. Enter and prove you\'re the best gunslinger around.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 300, xp: 150 },
    itemReward: 'championship_belt'
  },
  {
    id: 'combat_rescue_hostage',
    type: 'combat',
    titleTemplate: 'Rescue Hostage from {ENEMY}',
    descriptionTemplate: 'Innocent folks have been taken by {ENEMY}. Storm their camp and bring the hostages home.',
    targetType: 'enemy',
    difficulty: 'hard',
    baseProgressMax: 6,
    levelScaling: false,
    baseRewards: { gold: 175, xp: 90 },
    reputationReward: { faction: 'settlerAlliance', amount: 15 }
  },
  {
    id: 'combat_target_practice',
    type: 'combat',
    titleTemplate: 'Complete Shooting Drill',
    descriptionTemplate: 'Keep your skills sharp with target practice. Hit {COUNT} targets to complete the drill.',
    targetType: 'count',
    difficulty: 'easy',
    baseProgressMax: 10,
    levelScaling: false,
    baseRewards: { gold: 50, xp: 35 }
  },
  {
    id: 'combat_defend_town',
    type: 'combat',
    titleTemplate: 'Defend Town from Raiders',
    descriptionTemplate: 'Raiders are attacking the town! Man the barricades and drive them back.',
    targetType: 'enemy',
    difficulty: 'medium',
    baseProgressMax: 10,
    levelScaling: true,
    baseRewards: { gold: 160, xp: 85 },
    reputationReward: { faction: 'settlerAlliance', amount: 10 }
  }
];

/**
 * Social Contracts (15 templates)
 */
export const SOCIAL_CONTRACTS: ContractTemplate[] = [
  {
    id: 'social_gather_gossip',
    type: 'social',
    titleTemplate: 'Gather Gossip About {NPC}',
    descriptionTemplate: 'Someone wants information on {NPC}. Visit the saloon and keep your ears open.',
    targetType: 'npc',
    difficulty: 'easy',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 60, xp: 35 }
  },
  {
    id: 'social_improve_reputation',
    type: 'social',
    titleTemplate: 'Improve Standing with {FACTION}',
    descriptionTemplate: 'Perform acts of goodwill to improve your reputation with the {FACTION}.',
    targetType: 'faction',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 80, xp: 50 },
    reputationReward: { faction: 'variable', amount: 15 }
  },
  {
    id: 'social_play_poker',
    type: 'social',
    titleTemplate: 'Play {COUNT} Poker Hands',
    descriptionTemplate: 'Hit the tables at the saloon and play some cards. Win or lose, it\'s all about the game.',
    targetType: 'count',
    difficulty: 'easy',
    baseProgressMax: 5,
    levelScaling: false,
    baseRewards: { gold: 50, xp: 30 }
  },
  {
    id: 'social_spread_rumor',
    type: 'social',
    titleTemplate: 'Spread a Rumor',
    descriptionTemplate: 'Someone needs a particular piece of "information" to make the rounds. Make it happen.',
    targetType: 'none',
    difficulty: 'easy',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 55, xp: 30 }
  },
  {
    id: 'social_attend_gathering',
    type: 'social',
    titleTemplate: 'Attend Town Gathering',
    descriptionTemplate: 'The town is holding a social event. Show up, mingle, and make some connections.',
    targetType: 'location',
    difficulty: 'easy',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 40, xp: 25 }
  },
  {
    id: 'social_recruit_gang_member',
    type: 'social',
    titleTemplate: 'Recruit for Your Gang',
    descriptionTemplate: 'Find promising outlaws and convince them to join your crew.',
    targetType: 'count',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 100, xp: 60 }
  },
  {
    id: 'social_make_contact',
    type: 'social',
    titleTemplate: 'Establish Contact with {NPC}',
    descriptionTemplate: 'Build a relationship with {NPC}. They might prove useful in the future.',
    targetType: 'npc',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 75, xp: 45 }
  },
  {
    id: 'social_negotiate_deal',
    type: 'social',
    titleTemplate: 'Negotiate a Business Deal',
    descriptionTemplate: 'Broker an agreement between two parties. Take your cut for the trouble.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 150, xp: 80 }
  },
  {
    id: 'social_buy_drinks',
    type: 'social',
    titleTemplate: 'Buy Rounds at the Saloon',
    descriptionTemplate: 'Generosity opens doors. Buy {COUNT} rounds and make some friends.',
    targetType: 'count',
    difficulty: 'easy',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 30, xp: 20 }
  },
  {
    id: 'social_settle_dispute',
    type: 'social',
    titleTemplate: 'Settle a Dispute',
    descriptionTemplate: 'Two townsfolk are feuding. Use your persuasion to broker peace.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 85, xp: 50 },
    reputationReward: { faction: 'settlerAlliance', amount: 5 }
  },
  {
    id: 'social_charm_bartender',
    type: 'social',
    titleTemplate: 'Charm the Bartender',
    descriptionTemplate: 'Get on the bartender\'s good side. They know everything that happens in town.',
    targetType: 'npc',
    difficulty: 'easy',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 45, xp: 25 }
  },
  {
    id: 'social_write_letters',
    type: 'social',
    titleTemplate: 'Send {COUNT} Letters',
    descriptionTemplate: 'Maintain your network by sending letters to contacts across the territory.',
    targetType: 'count',
    difficulty: 'easy',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 35, xp: 20 }
  },
  {
    id: 'social_entertain_crowd',
    type: 'social',
    titleTemplate: 'Entertain the Crowd',
    descriptionTemplate: 'Spin tall tales at the saloon. A good storyteller is always welcome.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 70, xp: 40 }
  },
  {
    id: 'social_attend_sermon',
    type: 'social',
    titleTemplate: 'Attend Sermon at Mission',
    descriptionTemplate: 'Show your face at the mission. Even outlaws need to keep up appearances.',
    targetType: 'location',
    difficulty: 'easy',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 25, xp: 15 },
    reputationReward: { faction: 'settlerAlliance', amount: 3 }
  },
  {
    id: 'social_tribal_council',
    type: 'social',
    titleTemplate: 'Meet with Tribal Council',
    descriptionTemplate: 'Attend a meeting with the Nahi leaders. Building bridges takes time and respect.',
    targetType: 'location',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 120, xp: 70 },
    reputationReward: { faction: 'nahiCoalition', amount: 20 }
  }
];

/**
 * Delivery Contracts (10 templates)
 */
export const DELIVERY_CONTRACTS: ContractTemplate[] = [
  {
    id: 'delivery_basic_package',
    type: 'delivery',
    titleTemplate: 'Deliver Package to {NPC}',
    descriptionTemplate: 'A simple delivery job. Get this package to {NPC} at {LOCATION} without delay.',
    targetType: 'npc',
    difficulty: 'easy',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 50, xp: 30 }
  },
  {
    id: 'delivery_urgent_medicine',
    type: 'delivery',
    titleTemplate: 'Rush Medicine to {LOCATION}',
    descriptionTemplate: 'Someone\'s life depends on this medicine reaching {LOCATION} quickly. Ride fast!',
    targetType: 'location',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 100, xp: 55 },
    reputationReward: { faction: 'settlerAlliance', amount: 8 }
  },
  {
    id: 'delivery_multiple_stops',
    type: 'delivery',
    titleTemplate: 'Complete {COUNT} Deliveries',
    descriptionTemplate: 'Multiple packages need delivering around town. Efficient route planning is key.',
    targetType: 'count',
    difficulty: 'medium',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 90, xp: 50 }
  },
  {
    id: 'delivery_secret_message',
    type: 'delivery',
    titleTemplate: 'Deliver Secret Message to {NPC}',
    descriptionTemplate: 'This coded message must reach {NPC} without interception. Be discreet.',
    targetType: 'npc',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 80, xp: 45 }
  },
  {
    id: 'delivery_valuable_cargo',
    type: 'delivery',
    titleTemplate: 'Transport Valuable Cargo',
    descriptionTemplate: 'This shipment is worth a fortune. Guard it well and deliver it safely.',
    targetType: 'location',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 180, xp: 90 }
  },
  {
    id: 'delivery_supplies_to_camp',
    type: 'delivery',
    titleTemplate: 'Bring Supplies to {LOCATION}',
    descriptionTemplate: 'The camp at {LOCATION} needs supplies. Load up and head out.',
    targetType: 'location',
    difficulty: 'easy',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 60, xp: 35 }
  },
  {
    id: 'delivery_mail_run',
    type: 'delivery',
    titleTemplate: 'Pony Express Run',
    descriptionTemplate: 'Ride the mail route and deliver letters to {COUNT} waypoints.',
    targetType: 'count',
    difficulty: 'medium',
    baseProgressMax: 4,
    levelScaling: false,
    baseRewards: { gold: 110, xp: 60 }
  },
  {
    id: 'delivery_escort_wagon',
    type: 'delivery',
    titleTemplate: 'Escort Supply Wagon',
    descriptionTemplate: 'A wagon train needs an escort through dangerous territory. See them safely through.',
    targetType: 'location',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 150, xp: 80 }
  },
  {
    id: 'delivery_trade_goods',
    type: 'delivery',
    titleTemplate: 'Deliver Trade Goods to {FACTION}',
    descriptionTemplate: 'Establish trade relations by delivering goods to the {FACTION}.',
    targetType: 'faction',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 95, xp: 55 },
    reputationReward: { faction: 'variable', amount: 10 }
  },
  {
    id: 'delivery_dangerous_cargo',
    type: 'delivery',
    titleTemplate: 'Transport Dynamite',
    descriptionTemplate: 'Handle with care! This load of dynamite needs to reach the mining camp.',
    targetType: 'location',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 200, xp: 100 }
  }
];

/**
 * Investigation Contracts (10 templates)
 */
export const INVESTIGATION_CONTRACTS: ContractTemplate[] = [
  {
    id: 'investigate_npc_secret',
    type: 'investigation',
    titleTemplate: 'Uncover {NPC}\'s Secret',
    descriptionTemplate: 'Someone wants to know what {NPC} is hiding. Dig deep and find the truth.',
    targetType: 'npc',
    difficulty: 'medium',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 100, xp: 60 }
  },
  {
    id: 'investigate_location',
    type: 'investigation',
    titleTemplate: 'Investigate {LOCATION}',
    descriptionTemplate: 'Strange things are happening at {LOCATION}. Look around and report your findings.',
    targetType: 'location',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 85, xp: 50 }
  },
  {
    id: 'investigate_missing_person',
    type: 'investigation',
    titleTemplate: 'Find Missing Person',
    descriptionTemplate: 'Someone\'s gone missing. Follow the trail and find out what happened to them.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 4,
    levelScaling: false,
    baseRewards: { gold: 150, xp: 85 }
  },
  {
    id: 'investigate_crime_scene',
    type: 'investigation',
    titleTemplate: 'Examine Crime Scene',
    descriptionTemplate: 'A crime was committed here. Look for clues and piece together what happened.',
    targetType: 'location',
    difficulty: 'easy',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 70, xp: 40 }
  },
  {
    id: 'investigate_smuggling_route',
    type: 'investigation',
    titleTemplate: 'Map Smuggling Route',
    descriptionTemplate: 'Contraband is flowing through the territory. Find out how and where.',
    targetType: 'count',
    difficulty: 'hard',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 175, xp: 95 }
  },
  {
    id: 'investigate_spy',
    type: 'investigation',
    titleTemplate: 'Identify the Spy',
    descriptionTemplate: 'There\'s a mole in the organization. Find out who\'s been leaking information.',
    targetType: 'npc',
    difficulty: 'hard',
    baseProgressMax: 5,
    levelScaling: false,
    baseRewards: { gold: 200, xp: 110 }
  },
  {
    id: 'investigate_counterfeit',
    type: 'investigation',
    titleTemplate: 'Track Counterfeit Bills',
    descriptionTemplate: 'Fake money is circulating. Trace it back to the source.',
    targetType: 'count',
    difficulty: 'medium',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 120, xp: 65 }
  },
  {
    id: 'investigate_haunted_site',
    type: 'investigation',
    titleTemplate: 'Investigate Ghost Sightings',
    descriptionTemplate: 'Locals report seeing spirits at {LOCATION}. Find out what\'s really going on.',
    targetType: 'location',
    difficulty: 'easy',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 65, xp: 35 }
  },
  {
    id: 'investigate_rival_gang',
    type: 'investigation',
    titleTemplate: 'Gather Intelligence on Rivals',
    descriptionTemplate: 'The enemy gang is planning something. Find out their numbers and positions.',
    targetType: 'count',
    difficulty: 'medium',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 110, xp: 60 },
    reputationReward: { faction: 'frontera', amount: 8 }
  },
  {
    id: 'investigate_treasure_map',
    type: 'investigation',
    titleTemplate: 'Decipher Treasure Map',
    descriptionTemplate: 'An old map hints at buried treasure. Follow the clues and find the X.',
    targetType: 'count',
    difficulty: 'hard',
    baseProgressMax: 5,
    levelScaling: false,
    baseRewards: { gold: 250, xp: 125 },
    itemReward: 'gold_nugget'
  }
];

/**
 * Crafting Contracts (5 templates)
 */
export const CRAFTING_CONTRACTS: ContractTemplate[] = [
  {
    id: 'craft_items',
    type: 'crafting',
    titleTemplate: 'Craft {COUNT} {ITEM}',
    descriptionTemplate: 'The town needs supplies. Craft {COUNT} {ITEM} and deliver them.',
    targetType: 'item',
    difficulty: 'easy',
    baseProgressMax: 3,
    levelScaling: true,
    baseRewards: { gold: 70, xp: 40 }
  },
  {
    id: 'craft_sell_items',
    type: 'crafting',
    titleTemplate: 'Sell {COUNT} Crafted Items',
    descriptionTemplate: 'Make items and sell them at the market. Profit and progress.',
    targetType: 'count',
    difficulty: 'medium',
    baseProgressMax: 5,
    levelScaling: true,
    baseRewards: { gold: 50, xp: 45 }
  },
  {
    id: 'craft_special_order',
    type: 'crafting',
    titleTemplate: 'Complete Special Order for {NPC}',
    descriptionTemplate: '{NPC} has placed a custom order. Create exactly what they need.',
    targetType: 'npc',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 150, xp: 80 }
  },
  {
    id: 'craft_gather_materials',
    type: 'crafting',
    titleTemplate: 'Gather {COUNT} {ITEM}',
    descriptionTemplate: 'Collect raw materials from the wilderness for crafting projects.',
    targetType: 'item',
    difficulty: 'easy',
    baseProgressMax: 5,
    levelScaling: true,
    baseRewards: { gold: 40, xp: 30 }
  },
  {
    id: 'craft_master_recipe',
    type: 'crafting',
    titleTemplate: 'Master a New Recipe',
    descriptionTemplate: 'Learn and successfully craft a new recipe. Expand your skills.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 100, xp: 70 }
  }
];

/**
 * All contract templates combined (67 total)
 */
export const ALL_CONTRACT_TEMPLATES: ContractTemplate[] = [
  ...CRIME_CONTRACTS,        // 15
  ...COMBAT_CONTRACTS,       // 12
  ...SOCIAL_CONTRACTS,       // 15
  ...DELIVERY_CONTRACTS,     // 10
  ...INVESTIGATION_CONTRACTS, // 10
  ...CRAFTING_CONTRACTS      // 5
];

/**
 * Get templates by type
 */
export function getTemplatesByType(type: ContractType): ContractTemplate[] {
  return ALL_CONTRACT_TEMPLATES.filter(t => t.type === type);
}

/**
 * Get templates by difficulty
 */
export function getTemplatesByDifficulty(difficulty: ContractDifficulty): ContractTemplate[] {
  return ALL_CONTRACT_TEMPLATES.filter(t => t.difficulty === difficulty);
}

/**
 * Get random element from array
 */
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get seeded random element (deterministic based on seed)
 */
export function getSeededRandomElement<T>(array: T[], seed: number): T {
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index];
}

/**
 * Seeded pseudo-random number generator
 * Uses a simple LCG algorithm for deterministic results
 */
export function seededRandom(seed: number): number {
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  const next = (a * seed + c) % m;
  return next / m;
}

/**
 * Generate seed from character ID and date
 */
export function generateSeed(characterId: string, date: Date): number {
  const dateStr = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
  let hash = 0;
  const combined = characterId + dateStr;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Difficulty distribution based on character level
 */
export function getDifficultyDistribution(level: number): { easy: number; medium: number; hard: number } {
  if (level < 5) {
    return { easy: 3, medium: 1, hard: 0 };
  } else if (level < 10) {
    return { easy: 2, medium: 2, hard: 1 };
  } else if (level < 20) {
    return { easy: 1, medium: 2, hard: 2 };
  } else {
    return { easy: 1, medium: 2, hard: 2 };
  }
}

/**
 * Scale progress requirement by level
 */
export function scaleProgressByLevel(baseProgress: number, level: number): number {
  const scaleFactor = 1 + (level - 1) * 0.1;
  return Math.ceil(baseProgress * scaleFactor);
}

/**
 * Scale rewards by difficulty and level
 */
export function scaleRewards(
  baseRewards: { gold: number; xp: number },
  difficulty: ContractDifficulty,
  level: number
): { gold: number; xp: number } {
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2.5
  };

  const levelMultiplier = 1 + (level - 1) * 0.05;

  return {
    gold: Math.floor(baseRewards.gold * difficultyMultiplier[difficulty] * levelMultiplier),
    xp: Math.floor(baseRewards.xp * difficultyMultiplier[difficulty] * levelMultiplier)
  };
}

// Export template count for verification
export const TEMPLATE_COUNT = ALL_CONTRACT_TEMPLATES.length;
console.log(`Contract Templates Loaded: ${TEMPLATE_COUNT} templates (Expected: 67)`);
