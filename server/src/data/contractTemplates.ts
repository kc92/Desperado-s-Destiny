/**
 * Contract Templates
 *
 * 67+ procedurally generated contract templates across 12 categories
 * Part of the Competitor Parity Plan - Phase B
 * Extended in Phase 3: Contract Expansion
 */

import {
  ContractType,
  ContractDifficulty,
  ContractUrgency,
  CombatTargetType,
  GangRankRequirement,
  ISkillRequirement as SkillRequirement,
  ISkillXpReward as SkillXpReward,
  IContractRequirements as ContractRequirements,
  IChainStep,
  CONTRACT_CONSTANTS,
  getContractTierForLevel,
  calculateContractReward,
} from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Contract template definition - Extended for Phase 3
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
  // Skill integration
  requiredSkills?: SkillRequirement[];  // Skills required to attempt
  skillXpRewards?: SkillXpReward[];     // Skill XP granted on completion

  // Phase 3: Combat-specific fields
  combatTargetType?: CombatTargetType;  // Type of NPC to defeat
  combatKillCount?: number;             // Number of kills required
  damageThreshold?: number;             // Minimum damage in one fight
  flawlessVictory?: boolean;            // Win without taking damage
  handRank?: string;                    // Required poker hand
  bossId?: string;                      // Specific boss ID

  // Phase 3: Gang-specific fields
  gangRequired?: boolean;               // Requires gang membership
  gangRankRequired?: GangRankRequirement;
  territoryZoneId?: string;

  // Phase 3: Urgency & Chain
  urgency?: ContractUrgency;
  chainSteps?: IChainStep[];
  rewardMultiplier?: number;            // Template-specific reward modifier
  levelRequirement?: number;            // Minimum character level
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
 * Primary skills: Lockpicking, Pickpocketing, Stealth, Deception
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
    baseRewards: { gold: 75, xp: 40 },
    requiredSkills: [{ skillId: 'intimidation', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'intimidation', amount: 15 }]
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
    baseRewards: { gold: 120, xp: 65 },
    requiredSkills: [{ skillId: 'lockpicking', minLevel: 5 }, { skillId: 'stealth', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'lockpicking', amount: 25 }, { skillId: 'stealth', amount: 15 }]
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
    baseRewards: { gold: 60, xp: 35 },
    requiredSkills: [{ skillId: 'pickpocketing', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'pickpocketing', amount: 20 }]
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
    itemReward: 'gold_nugget',
    requiredSkills: [{ skillId: 'lockpicking', minLevel: 10 }, { skillId: 'stealth', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'lockpicking', amount: 50 }, { skillId: 'stealth', amount: 30 }]
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
    baseRewards: { gold: 100, xp: 55 },
    requiredSkills: [{ skillId: 'deception', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'deception', amount: 25 }]
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
    baseRewards: { gold: 150, xp: 75 },
    requiredSkills: [{ skillId: 'stealth', minLevel: 5 }, { skillId: 'riding', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'stealth', amount: 20 }, { skillId: 'riding', amount: 15 }]
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
    baseRewards: { gold: 180, xp: 90 },
    requiredSkills: [{ skillId: 'stealth', minLevel: 8 }, { skillId: 'animal_handling', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'stealth', amount: 35 }, { skillId: 'animal_handling', amount: 25 }]
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
    baseRewards: { gold: 90, xp: 45 },
    requiredSkills: [{ skillId: 'intimidation', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'intimidation', amount: 15 }]
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
    reputationReward: { faction: 'frontera', amount: 5 },
    requiredSkills: [{ skillId: 'stealth', minLevel: 5 }, { skillId: 'tinkering', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'stealth', amount: 20 }, { skillId: 'tinkering', amount: 25 }]
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
    baseRewards: { gold: 110, xp: 60 },
    requiredSkills: [{ skillId: 'deception', minLevel: 5 }, { skillId: 'stealth', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'deception', amount: 25 }, { skillId: 'stealth', amount: 20 }]
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
    baseRewards: { gold: 70, xp: 40 },
    requiredSkills: [{ skillId: 'reconnaissance', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'reconnaissance', amount: 20 }]
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
    baseRewards: { gold: 85, xp: 50 },
    requiredSkills: [{ skillId: 'persuasion', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 25 }]
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
    baseRewards: { gold: 175, xp: 85 },
    requiredSkills: [{ skillId: 'intimidation', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'intimidation', amount: 40 }]
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
    baseRewards: { gold: 220, xp: 110 },
    requiredSkills: [{ skillId: 'stealth', minLevel: 10 }, { skillId: 'animal_handling', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'stealth', amount: 40 }, { skillId: 'animal_handling', amount: 35 }]
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
    baseRewards: { gold: 95, xp: 55 },
    requiredSkills: [{ skillId: 'riding', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'riding', amount: 25 }]
  }
];

/**
 * Combat Contracts (12 templates)
 * Primary skills: Firearms, Brawling, Intimidation, Tactics
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
    baseRewards: { gold: 80, xp: 50 },
    requiredSkills: [{ skillId: 'firearms', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 20 }]
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
    baseRewards: { gold: 100, xp: 65 },
    requiredSkills: [{ skillId: 'firearms', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 35 }]
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
    baseRewards: { gold: 250, xp: 120 },
    requiredSkills: [{ skillId: 'firearms', minLevel: 12 }, { skillId: 'tactics', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 50 }, { skillId: 'tactics', amount: 35 }]
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
    reputationReward: { faction: 'frontera', amount: 10 },
    requiredSkills: [{ skillId: 'firearms', minLevel: 10 }, { skillId: 'tactics', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 40 }, { skillId: 'tactics', amount: 40 }]
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
    baseRewards: { gold: 140, xp: 80 },
    requiredSkills: [{ skillId: 'firearms', minLevel: 5 }, { skillId: 'riding', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 25 }, { skillId: 'riding', amount: 20 }]
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
    baseRewards: { gold: 200, xp: 110 },
    requiredSkills: [{ skillId: 'firearms', minLevel: 12 }, { skillId: 'tactics', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 45 }, { skillId: 'tactics', amount: 35 }]
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
    baseRewards: { gold: 120, xp: 70 },
    requiredSkills: [{ skillId: 'brawling', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'brawling', amount: 35 }]
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
    baseRewards: { gold: 70, xp: 45 },
    requiredSkills: [{ skillId: 'hunting', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'hunting', amount: 20 }]
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
    itemReward: 'championship_belt',
    requiredSkills: [{ skillId: 'firearms', minLevel: 15 }, { skillId: 'brawling', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 60 }, { skillId: 'brawling', amount: 40 }]
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
    reputationReward: { faction: 'settlerAlliance', amount: 15 },
    requiredSkills: [{ skillId: 'firearms', minLevel: 10 }, { skillId: 'tactics', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 40 }, { skillId: 'tactics', amount: 30 }]
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
    baseRewards: { gold: 50, xp: 35 },
    requiredSkills: [{ skillId: 'firearms', minLevel: 1 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 15 }]
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
    reputationReward: { faction: 'settlerAlliance', amount: 10 },
    requiredSkills: [{ skillId: 'firearms', minLevel: 8 }, { skillId: 'tactics', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 30 }, { skillId: 'tactics', amount: 25 }]
  },

  // =============================================
  // Phase 3: Combat-Integrated Templates
  // =============================================

  {
    id: 'combat_outlaw_hunt_5',
    type: 'combat',
    titleTemplate: 'Hunt 5 Outlaws',
    descriptionTemplate: 'Outlaws have been terrorizing the territory. Track down and eliminate 5 of these criminals.',
    targetType: 'enemy',
    difficulty: 'easy',
    baseProgressMax: 5,
    levelScaling: false,
    baseRewards: { gold: 100, xp: 60 },
    combatTargetType: 'outlaw',
    combatKillCount: 5,
    rewardMultiplier: 0.7,
    requiredSkills: [{ skillId: 'firearms', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 25 }]
  },
  {
    id: 'combat_outlaw_purge',
    type: 'combat',
    titleTemplate: 'Outlaw Purge',
    descriptionTemplate: 'A gang of outlaws has set up camp nearby. Clear them out - all 10 of them.',
    targetType: 'enemy',
    difficulty: 'medium',
    baseProgressMax: 10,
    levelScaling: false,
    baseRewards: { gold: 200, xp: 120 },
    combatTargetType: 'outlaw',
    combatKillCount: 10,
    rewardMultiplier: 1.0,
    requiredSkills: [{ skillId: 'firearms', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 45 }]
  },
  {
    id: 'combat_wildlife_control',
    type: 'combat',
    titleTemplate: 'Wildlife Control',
    descriptionTemplate: 'Predators are attacking livestock. Hunt down 8 dangerous animals to protect the ranches.',
    targetType: 'enemy',
    difficulty: 'easy',
    baseProgressMax: 8,
    levelScaling: false,
    baseRewards: { gold: 90, xp: 55 },
    combatTargetType: 'wildlife',
    combatKillCount: 8,
    rewardMultiplier: 0.7,
    requiredSkills: [{ skillId: 'hunting', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'hunting', amount: 25 }]
  },
  {
    id: 'combat_lawman_evade',
    type: 'combat',
    titleTemplate: 'Evade the Law',
    descriptionTemplate: 'The law is after you. Defeat 3 lawmen who stand in your way - but be prepared for consequences.',
    targetType: 'enemy',
    difficulty: 'hard',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 350, xp: 180 },
    combatTargetType: 'lawman',
    combatKillCount: 3,
    rewardMultiplier: 1.5,
    reputationReward: { faction: 'lawmen', amount: -20 },
    requiredSkills: [{ skillId: 'firearms', minLevel: 12 }, { skillId: 'tactics', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 50 }, { skillId: 'tactics', amount: 35 }]
  },
  {
    id: 'combat_damage_threshold',
    type: 'combat',
    titleTemplate: 'Prove Your Might',
    descriptionTemplate: 'Show your combat prowess by dealing at least 500 damage in a single encounter.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 180, xp: 100 },
    damageThreshold: 500,
    rewardMultiplier: 1.0,
    requiredSkills: [{ skillId: 'firearms', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 40 }]
  },
  {
    id: 'combat_flawless',
    type: 'combat',
    titleTemplate: 'Flawless Victory',
    descriptionTemplate: 'Defeat an opponent without taking any damage. Dodge, weave, and strike with precision.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 400, xp: 200 },
    flawlessVictory: true,
    rewardMultiplier: 2.0,
    requiredSkills: [{ skillId: 'firearms', minLevel: 12 }, { skillId: 'tactics', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 60 }, { skillId: 'tactics', amount: 50 }]
  },
  {
    id: 'combat_streak_3',
    type: 'combat',
    titleTemplate: 'Winning Streak',
    descriptionTemplate: 'Win 3 consecutive combats without losing. Build momentum and dominate.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 220, xp: 130 },
    rewardMultiplier: 1.2,
    requiredSkills: [{ skillId: 'firearms', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 45 }]
  },
  {
    id: 'combat_royal_flush',
    type: 'combat',
    titleTemplate: 'Royal Showdown',
    descriptionTemplate: 'Win a combat by playing a Royal Flush. The ultimate display of card mastery.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 500, xp: 250 },
    handRank: 'royal_flush',
    rewardMultiplier: 2.5,
    requiredSkills: [{ skillId: 'gambling', minLevel: 12 }],
    skillXpRewards: [{ skillId: 'gambling', amount: 75 }]
  },
  {
    id: 'combat_quick_victory',
    type: 'combat',
    titleTemplate: 'Quick Draw',
    descriptionTemplate: 'Win a combat in 3 rounds or less. Swift and decisive victory.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 200, xp: 110 },
    rewardMultiplier: 1.3,
    requiredSkills: [{ skillId: 'firearms', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 45 }]
  }
];

/**
 * Boss Combat Contracts (Phase 3)
 * High-level contracts requiring boss defeats
 */
export const BOSS_CONTRACTS: ContractTemplate[] = [
  {
    id: 'boss_hunt_any',
    type: 'boss',
    titleTemplate: 'Boss Bounty',
    descriptionTemplate: 'A dangerous boss has been spotted. Track them down and claim the bounty.',
    targetType: 'boss',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 500, xp: 250 },
    combatTargetType: 'boss',
    levelRequirement: 25,
    requiredSkills: [{ skillId: 'firearms', minLevel: 15 }, { skillId: 'tactics', minLevel: 12 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 75 }, { skillId: 'tactics', amount: 60 }]
  },
  {
    id: 'boss_hunt_specific',
    type: 'boss',
    titleTemplate: 'Hunt: {BOSS_NAME}',
    descriptionTemplate: '{BOSS_NAME} has been sighted in the territory. Take them down.',
    targetType: 'boss',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 750, xp: 375 },
    combatTargetType: 'boss',
    levelRequirement: 25,
    rewardMultiplier: 1.5,
    requiredSkills: [{ skillId: 'firearms', minLevel: 15 }, { skillId: 'tactics', minLevel: 12 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 100 }, { skillId: 'tactics', amount: 75 }]
  },
  {
    id: 'boss_first_kill',
    type: 'boss',
    titleTemplate: 'Legendary Hunt',
    descriptionTemplate: 'Be the first to defeat a legendary boss. Glory awaits the victor.',
    targetType: 'boss',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 1000, xp: 500 },
    combatTargetType: 'boss',
    levelRequirement: 25,
    rewardMultiplier: 2.0,
    itemReward: 'legendary_trophy',
    requiredSkills: [{ skillId: 'firearms', minLevel: 18 }, { skillId: 'tactics', minLevel: 15 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 150 }, { skillId: 'tactics', amount: 100 }]
  }
];

/**
 * Gang Contracts (8 templates) - Phase 3
 * Gang-member-only contracts with territory and war objectives
 * Primary skills: Leadership, Tactics, Intimidation
 */
export const GANG_CONTRACTS: ContractTemplate[] = [
  {
    id: 'gang_territory_patrol',
    type: 'gang',
    titleTemplate: 'Territory Patrol',
    descriptionTemplate: 'Patrol your gang\'s territory and engage any hostiles. Show them who controls these streets.',
    targetType: 'enemy',
    difficulty: 'medium',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 150, xp: 85 },
    gangRequired: true,
    gangRankRequired: 'member',
    rewardMultiplier: 1.25,
    combatTargetType: 'any',
    combatKillCount: 3,
    requiredSkills: [{ skillId: 'firearms', minLevel: 5 }, { skillId: 'tactics', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 30 }, { skillId: 'tactics', amount: 25 }]
  },
  {
    id: 'gang_recruitment_drive',
    type: 'gang',
    titleTemplate: 'Recruitment Drive',
    descriptionTemplate: 'The gang needs fresh blood. Complete social tasks to find and recruit promising prospects.',
    targetType: 'count',
    difficulty: 'easy',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 120, xp: 70 },
    gangRequired: true,
    gangRankRequired: 'member',
    rewardMultiplier: 1.0,
    requiredSkills: [{ skillId: 'persuasion', minLevel: 5 }, { skillId: 'leadership', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 25 }, { skillId: 'leadership', amount: 20 }]
  },
  {
    id: 'gang_resource_contribution',
    type: 'gang',
    titleTemplate: 'Gang Supplies',
    descriptionTemplate: 'The gang treasury needs funds. Contribute gold to support gang operations and upgrades.',
    targetType: 'none',
    difficulty: 'easy',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 75, xp: 50 },
    gangRequired: true,
    gangRankRequired: 'member',
    rewardMultiplier: 0.5,
    requirements: { amount: 500 },
    requiredSkills: [],
    skillXpRewards: [{ skillId: 'leadership', amount: 15 }]
  },
  {
    id: 'gang_war_participation',
    type: 'gang',
    titleTemplate: 'War Effort',
    descriptionTemplate: 'Your gang is at war! Participate in gang war battles to earn glory and rewards.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 200, xp: 120 },
    gangRequired: true,
    gangRankRequired: 'member',
    requiredSkills: [{ skillId: 'firearms', minLevel: 10 }, { skillId: 'tactics', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 45 }, { skillId: 'tactics', amount: 40 }]
  },
  {
    id: 'gang_raid_leader',
    type: 'gang',
    titleTemplate: 'Lead a Raid',
    descriptionTemplate: 'Take charge and lead your gang members on a successful raid against enemy territory.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 500, xp: 275 },
    gangRequired: true,
    gangRankRequired: 'officer',
    requiredSkills: [{ skillId: 'leadership', minLevel: 12 }, { skillId: 'tactics', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'leadership', amount: 60 }, { skillId: 'tactics', amount: 50 }]
  },
  {
    id: 'gang_influence_gain',
    type: 'territory',
    titleTemplate: 'Expand Influence',
    descriptionTemplate: 'Increase your gang\'s presence in a territory zone. Every bit of influence counts.',
    targetType: 'none',
    difficulty: 'medium',
    baseProgressMax: 20,
    levelScaling: false,
    baseRewards: { gold: 225, xp: 130 },
    gangRequired: true,
    gangRankRequired: 'member',
    rewardMultiplier: 1.5,
    requiredSkills: [{ skillId: 'intimidation', minLevel: 5 }, { skillId: 'leadership', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'intimidation', amount: 35 }, { skillId: 'leadership', amount: 30 }]
  },
  {
    id: 'gang_defend_territory',
    type: 'territory',
    titleTemplate: 'Hold the Line',
    descriptionTemplate: 'Enemy raiders are targeting your territory! Defend against their assault.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 300, xp: 175 },
    gangRequired: true,
    gangRankRequired: 'member',
    requiredSkills: [{ skillId: 'firearms', minLevel: 10 }, { skillId: 'tactics', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 50 }, { skillId: 'tactics', amount: 40 }]
  },
  {
    id: 'gang_officer_duties',
    type: 'gang',
    titleTemplate: 'Officer\'s Call',
    descriptionTemplate: 'As an officer, set an example. Complete contracts to inspire the rank and file.',
    targetType: 'count',
    difficulty: 'medium',
    baseProgressMax: 5,
    levelScaling: false,
    baseRewards: { gold: 275, xp: 160 },
    gangRequired: true,
    gangRankRequired: 'officer',
    rewardMultiplier: 1.5,
    requiredSkills: [{ skillId: 'leadership', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'leadership', amount: 45 }]
  }
];

/**
 * Urgent Contracts (6 templates) - Phase 3
 * Time-limited contracts with increased rewards
 * Spawned dynamically throughout the day
 */
export const URGENT_CONTRACTS: ContractTemplate[] = [
  {
    id: 'urgent_bandit_attack',
    type: 'urgent',
    titleTemplate: 'Bandit Raid!',
    descriptionTemplate: 'A band of bandits is attacking travelers on the road! Defeat them quickly before they escape.',
    targetType: 'enemy',
    difficulty: 'medium',
    baseProgressMax: 5,
    levelScaling: false,
    baseRewards: { gold: 180, xp: 100 },
    urgency: 'urgent',
    rewardMultiplier: 1.5,
    combatTargetType: 'outlaw',
    combatKillCount: 5,
    requiredSkills: [{ skillId: 'firearms', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 35 }]
  },
  {
    id: 'urgent_delivery_express',
    type: 'urgent',
    titleTemplate: 'Express Delivery',
    descriptionTemplate: 'An urgent package needs to reach {LOCATION} within the hour. Time is of the essence!',
    targetType: 'location',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 150, xp: 85 },
    urgency: 'urgent',
    rewardMultiplier: 1.5,
    requiredSkills: [{ skillId: 'riding', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'riding', amount: 40 }]
  },
  {
    id: 'urgent_witness_silence',
    type: 'urgent',
    titleTemplate: 'Silence the Witness',
    descriptionTemplate: 'A witness is about to talk to the sheriff. Deal with them before it\'s too late!',
    targetType: 'npc',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 300, xp: 160 },
    urgency: 'critical',
    rewardMultiplier: 2.0,
    requiredSkills: [{ skillId: 'stealth', minLevel: 10 }, { skillId: 'intimidation', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'stealth', amount: 50 }, { skillId: 'intimidation', amount: 40 }]
  },
  {
    id: 'urgent_boss_spawned',
    type: 'urgent',
    titleTemplate: 'Boss Sighted!',
    descriptionTemplate: 'A notorious outlaw boss has been spotted nearby! Hunt them down before they disappear.',
    targetType: 'boss',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 600, xp: 300 },
    urgency: 'critical',
    rewardMultiplier: 2.0,
    combatTargetType: 'boss',
    levelRequirement: 25,
    requiredSkills: [{ skillId: 'firearms', minLevel: 15 }, { skillId: 'tactics', minLevel: 12 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 80 }, { skillId: 'tactics', amount: 60 }]
  },
  {
    id: 'urgent_gang_defense',
    type: 'urgent',
    titleTemplate: 'Territory Under Attack!',
    descriptionTemplate: 'Your gang\'s territory is being raided! Rush to defend it before you lose control.',
    targetType: 'none',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 250, xp: 140 },
    urgency: 'urgent',
    rewardMultiplier: 1.5,
    gangRequired: true,
    gangRankRequired: 'member',
    requiredSkills: [{ skillId: 'firearms', minLevel: 10 }, { skillId: 'tactics', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'firearms', amount: 45 }, { skillId: 'tactics', amount: 35 }]
  },
  {
    id: 'urgent_gold_rush',
    type: 'urgent',
    titleTemplate: 'Gold Rush!',
    descriptionTemplate: 'A rich gold vein has been discovered! Stake your claim before others beat you to it.',
    targetType: 'location',
    difficulty: 'medium',
    baseProgressMax: 3,
    levelScaling: false,
    baseRewards: { gold: 200, xp: 110 },
    urgency: 'urgent',
    rewardMultiplier: 1.5,
    requiredSkills: [{ skillId: 'mining', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'mining', amount: 45 }]
  }
];

/**
 * Social Contracts (15 templates)
 * Primary skills: Persuasion, Gambling, Deception, Leadership
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
    baseRewards: { gold: 60, xp: 35 },
    requiredSkills: [{ skillId: 'duel_instinct', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'duel_instinct', amount: 15 }]
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
    reputationReward: { faction: 'variable', amount: 15 },
    requiredSkills: [{ skillId: 'persuasion', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 25 }]
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
    baseRewards: { gold: 50, xp: 30 },
    requiredSkills: [{ skillId: 'gambling', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'gambling', amount: 20 }]
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
    baseRewards: { gold: 55, xp: 30 },
    requiredSkills: [{ skillId: 'deception', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'deception', amount: 15 }]
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
    baseRewards: { gold: 40, xp: 25 },
    requiredSkills: [{ skillId: 'persuasion', minLevel: 1 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 10 }]
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
    baseRewards: { gold: 100, xp: 60 },
    requiredSkills: [{ skillId: 'leadership', minLevel: 5 }, { skillId: 'persuasion', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'leadership', amount: 25 }, { skillId: 'persuasion', amount: 20 }]
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
    baseRewards: { gold: 75, xp: 45 },
    requiredSkills: [{ skillId: 'persuasion', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 25 }]
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
    baseRewards: { gold: 150, xp: 80 },
    requiredSkills: [{ skillId: 'persuasion', minLevel: 10 }, { skillId: 'deception', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 40 }, { skillId: 'deception', amount: 25 }]
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
    baseRewards: { gold: 30, xp: 20 },
    requiredSkills: [{ skillId: 'persuasion', minLevel: 1 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 10 }]
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
    reputationReward: { faction: 'settlerAlliance', amount: 5 },
    requiredSkills: [{ skillId: 'persuasion', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 30 }]
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
    baseRewards: { gold: 45, xp: 25 },
    requiredSkills: [{ skillId: 'persuasion', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 15 }]
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
    baseRewards: { gold: 35, xp: 20 },
    requiredSkills: [{ skillId: 'deception', minLevel: 1 }],
    skillXpRewards: [{ skillId: 'deception', amount: 10 }]
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
    baseRewards: { gold: 70, xp: 40 },
    requiredSkills: [{ skillId: 'persuasion', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 25 }]
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
    reputationReward: { faction: 'settlerAlliance', amount: 3 },
    requiredSkills: [{ skillId: 'willpower', minLevel: 1 }],
    skillXpRewards: [{ skillId: 'willpower', amount: 10 }]
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
    reputationReward: { faction: 'nahiCoalition', amount: 20 },
    requiredSkills: [{ skillId: 'persuasion', minLevel: 10 }, { skillId: 'leadership', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'persuasion', amount: 35 }, { skillId: 'leadership', amount: 30 }]
  }
];

/**
 * Delivery Contracts (10 templates)
 * Primary skills: Riding, Survival, Animal Handling
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
    baseRewards: { gold: 50, xp: 30 },
    requiredSkills: [{ skillId: 'riding', minLevel: 1 }],
    skillXpRewards: [{ skillId: 'riding', amount: 15 }]
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
    reputationReward: { faction: 'settlerAlliance', amount: 8 },
    requiredSkills: [{ skillId: 'riding', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'riding', amount: 30 }]
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
    baseRewards: { gold: 90, xp: 50 },
    requiredSkills: [{ skillId: 'riding', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'riding', amount: 25 }]
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
    baseRewards: { gold: 80, xp: 45 },
    requiredSkills: [{ skillId: 'stealth', minLevel: 5 }, { skillId: 'riding', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'stealth', amount: 20 }, { skillId: 'riding', amount: 15 }]
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
    baseRewards: { gold: 180, xp: 90 },
    requiredSkills: [{ skillId: 'riding', minLevel: 10 }, { skillId: 'firearms', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'riding', amount: 40 }, { skillId: 'firearms', amount: 20 }]
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
    baseRewards: { gold: 60, xp: 35 },
    requiredSkills: [{ skillId: 'survival', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'survival', amount: 15 }]
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
    baseRewards: { gold: 110, xp: 60 },
    requiredSkills: [{ skillId: 'riding', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'riding', amount: 35 }]
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
    baseRewards: { gold: 150, xp: 80 },
    requiredSkills: [{ skillId: 'riding', minLevel: 10 }, { skillId: 'firearms', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'riding', amount: 35 }, { skillId: 'firearms', amount: 25 }]
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
    reputationReward: { faction: 'variable', amount: 10 },
    requiredSkills: [{ skillId: 'riding', minLevel: 5 }, { skillId: 'persuasion', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'riding', amount: 25 }, { skillId: 'persuasion', amount: 15 }]
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
    baseRewards: { gold: 200, xp: 100 },
    requiredSkills: [{ skillId: 'riding', minLevel: 8 }, { skillId: 'explosives', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'riding', amount: 35 }, { skillId: 'explosives', amount: 30 }]
  }
];

/**
 * Investigation Contracts (10 templates)
 * Primary skills: Perception, Reconnaissance, Stealth
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
    baseRewards: { gold: 100, xp: 60 },
    requiredSkills: [{ skillId: 'duel_instinct', minLevel: 5 }, { skillId: 'reconnaissance', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'duel_instinct', amount: 25 }, { skillId: 'reconnaissance', amount: 20 }]
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
    baseRewards: { gold: 85, xp: 50 },
    requiredSkills: [{ skillId: 'duel_instinct', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'duel_instinct', amount: 25 }]
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
    baseRewards: { gold: 150, xp: 85 },
    requiredSkills: [{ skillId: 'duel_instinct', minLevel: 10 }, { skillId: 'reconnaissance', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'duel_instinct', amount: 40 }, { skillId: 'reconnaissance', amount: 35 }]
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
    baseRewards: { gold: 70, xp: 40 },
    requiredSkills: [{ skillId: 'duel_instinct', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'duel_instinct', amount: 15 }]
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
    baseRewards: { gold: 175, xp: 95 },
    requiredSkills: [{ skillId: 'reconnaissance', minLevel: 10 }, { skillId: 'stealth', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'reconnaissance', amount: 40 }, { skillId: 'stealth', amount: 30 }]
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
    baseRewards: { gold: 200, xp: 110 },
    requiredSkills: [{ skillId: 'duel_instinct', minLevel: 12 }, { skillId: 'deception', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'duel_instinct', amount: 45 }, { skillId: 'deception', amount: 30 }]
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
    baseRewards: { gold: 120, xp: 65 },
    requiredSkills: [{ skillId: 'duel_instinct', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'duel_instinct', amount: 25 }]
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
    baseRewards: { gold: 65, xp: 35 },
    requiredSkills: [{ skillId: 'willpower', minLevel: 5 }, { skillId: 'duel_instinct', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'willpower', amount: 20 }, { skillId: 'duel_instinct', amount: 15 }]
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
    reputationReward: { faction: 'frontera', amount: 8 },
    requiredSkills: [{ skillId: 'reconnaissance', minLevel: 8 }, { skillId: 'stealth', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'reconnaissance', amount: 30 }, { skillId: 'stealth', amount: 20 }]
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
    itemReward: 'gold_nugget',
    requiredSkills: [{ skillId: 'duel_instinct', minLevel: 12 }, { skillId: 'survival', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'duel_instinct', amount: 50 }, { skillId: 'survival', amount: 40 }]
  }
];

/**
 * Crafting Contracts (5 templates)
 * Primary skills: Blacksmithing, Leatherworking, Gunsmithing, Cooking, Medicine, Herbalism
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
    baseRewards: { gold: 70, xp: 40 },
    requiredSkills: [{ skillId: 'blacksmithing', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'blacksmithing', amount: 20 }]
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
    baseRewards: { gold: 50, xp: 45 },
    requiredSkills: [{ skillId: 'leatherworking', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'leatherworking', amount: 25 }]
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
    baseRewards: { gold: 150, xp: 80 },
    requiredSkills: [{ skillId: 'gunsmithing', minLevel: 10 }],
    skillXpRewards: [{ skillId: 'gunsmithing', amount: 40 }]
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
    baseRewards: { gold: 40, xp: 30 },
    requiredSkills: [{ skillId: 'alchemy', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'alchemy', amount: 15 }]
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
    baseRewards: { gold: 100, xp: 70 },
    requiredSkills: [{ skillId: 'medicine', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'medicine', amount: 35 }]
  }
];

/**
 * Phase 3: Chain Contracts - Multi-step sequential objectives with escalating rewards
 * Chain contracts require completing multiple steps in sequence
 * Reward is distributed across steps with a completion bonus at the end
 */
export const CHAIN_CONTRACTS: ContractTemplate[] = [
  // Chain 1: The Outlaw Trail (3 steps) - Investigation → Tracking → Combat
  {
    id: 'chain_outlaw_investigation',
    type: 'chain',
    titleTemplate: 'The Outlaw Trail',
    descriptionTemplate: 'Hunt down a notorious outlaw gang. Follow their trail, track their hideout, and bring them to justice.',
    targetType: 'chain',
    difficulty: 'medium',
    baseProgressMax: 1, // Total chain is "1" completion
    levelScaling: true,
    baseRewards: { gold: 200, xp: 150 },
    rewardMultiplier: 3.0, // 3x base rewards for completing full chain
    levelRequirement: 10,
    chainSteps: [
      {
        stepNumber: 1,
        title: 'Gather Intelligence',
        description: 'Talk to townsfolk and gather information about the outlaw gang\'s recent activities.',
        targetType: 'npc',
        progressRequired: 3,
        rewardMultiplier: 0.2  // 20% of total reward
      },
      {
        stepNumber: 2,
        title: 'Track the Outlaws',
        description: 'Follow the trail to their hideout. Look for signs of their passage.',
        targetType: 'location',
        progressRequired: 1,
        rewardMultiplier: 0.3  // 30% of total reward
      },
      {
        stepNumber: 3,
        title: 'Eliminate the Gang',
        description: 'Storm the hideout and take down the outlaws.',
        targetType: 'enemy',
        progressRequired: 5,
        rewardMultiplier: 0.5  // 50% of total reward + completion bonus
      }
    ]
  },

  // Chain 2: The Big Score (4 steps) - Gang heist requiring planning and execution
  {
    id: 'chain_gang_heist',
    type: 'chain',
    titleTemplate: 'The Big Score',
    descriptionTemplate: 'Plan and execute a major heist with your gang. This will require careful planning and precise execution.',
    targetType: 'chain',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: true,
    baseRewards: { gold: 400, xp: 300 },
    rewardMultiplier: 5.0, // 5x base for full chain
    levelRequirement: 20,
    gangRequired: true,
    gangRankRequired: 'member',
    chainSteps: [
      {
        stepNumber: 1,
        title: 'Scout the Target',
        description: 'Survey the target location and identify security weaknesses.',
        targetType: 'location',
        progressRequired: 1,
        rewardMultiplier: 0.15
      },
      {
        stepNumber: 2,
        title: 'Recruit Crew',
        description: 'Gather enough gang members to pull off the heist.',
        targetType: 'npc',
        progressRequired: 3,
        rewardMultiplier: 0.15
      },
      {
        stepNumber: 3,
        title: 'Execute the Heist',
        description: 'It\'s go time. Break in and secure the valuables.',
        targetType: 'crime',
        progressRequired: 1,
        rewardMultiplier: 0.40
      },
      {
        stepNumber: 4,
        title: 'Make Your Escape',
        description: 'Get away clean before the law catches up.',
        targetType: 'escape',
        progressRequired: 1,
        rewardMultiplier: 0.30
      }
    ]
  },

  // Chain 3: Wanted Dead or Alive (3 steps) - Bounty hunting chain
  {
    id: 'chain_bounty_hunt',
    type: 'chain',
    titleTemplate: 'Wanted: Dead or Alive',
    descriptionTemplate: 'A dangerous fugitive has a price on their head. Track them down and collect the bounty.',
    targetType: 'chain',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: true,
    baseRewards: { gold: 250, xp: 200 },
    rewardMultiplier: 3.5,
    levelRequirement: 15,
    chainSteps: [
      {
        stepNumber: 1,
        title: 'Gather Intel',
        description: 'Visit the sheriff\'s office and learn about the fugitive\'s last known whereabouts.',
        targetType: 'npc',
        progressRequired: 2,
        rewardMultiplier: 0.20
      },
      {
        stepNumber: 2,
        title: 'Hunt the Fugitive',
        description: 'Track the fugitive across the territory. Follow any leads you find.',
        targetType: 'location',
        progressRequired: 3,
        rewardMultiplier: 0.30
      },
      {
        stepNumber: 3,
        title: 'Capture or Kill',
        description: 'Confront the fugitive. Bring them in dead or alive.',
        targetType: 'enemy',
        progressRequired: 1,
        rewardMultiplier: 0.50
      }
    ]
  },

  // Chain 4: Hostile Takeover (4 steps) - Territory control chain for gangs
  {
    id: 'chain_territory_takeover',
    type: 'chain',
    titleTemplate: 'Hostile Takeover',
    descriptionTemplate: 'Lead your gang in taking control of a new territory. Weaken the opposition, then strike.',
    targetType: 'chain',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: true,
    baseRewards: { gold: 350, xp: 280 },
    rewardMultiplier: 4.0,
    levelRequirement: 25,
    gangRequired: true,
    gangRankRequired: 'officer',
    chainSteps: [
      {
        stepNumber: 1,
        title: 'Weaken Control',
        description: 'Sabotage the controlling gang\'s operations. Hit their businesses and supply lines.',
        targetType: 'crime',
        progressRequired: 3,
        rewardMultiplier: 0.15
      },
      {
        stepNumber: 2,
        title: 'Assault Forces',
        description: 'Engage their fighters directly. Reduce their numbers.',
        targetType: 'enemy',
        progressRequired: 5,
        rewardMultiplier: 0.25
      },
      {
        stepNumber: 3,
        title: 'Capture Territory',
        description: 'Move in and claim the territory for your gang.',
        targetType: 'territory',
        progressRequired: 1,
        rewardMultiplier: 0.35
      },
      {
        stepNumber: 4,
        title: 'Fortify Position',
        description: 'Establish your gang\'s presence. Set up defenses and patrols.',
        targetType: 'count',
        progressRequired: 2,
        rewardMultiplier: 0.25
      }
    ]
  },

  // Chain 5: Boss Preparation (3 steps) - Prepare for and defeat a boss
  {
    id: 'chain_boss_preparation',
    type: 'chain',
    titleTemplate: 'Boss Preparation',
    descriptionTemplate: 'A legendary outlaw has been spotted in the territory. Prepare yourself, then face them in combat.',
    targetType: 'chain',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false, // Flat rewards for boss prep
    baseRewards: { gold: 2000, xp: 1000 },
    rewardMultiplier: 1.0, // Already high base
    levelRequirement: 25,
    chainSteps: [
      {
        stepNumber: 1,
        title: 'Gather Intel on the Boss',
        description: 'Learn about the boss\'s fighting style, weaknesses, and habits.',
        targetType: 'npc',
        progressRequired: 3,
        rewardMultiplier: 0.20
      },
      {
        stepNumber: 2,
        title: 'Prepare Equipment',
        description: 'Craft or acquire special gear to use against the boss.',
        targetType: 'item',
        progressRequired: 2,
        rewardMultiplier: 0.25
      },
      {
        stepNumber: 3,
        title: 'Face the Boss',
        description: 'Confront and defeat the legendary outlaw in combat.',
        targetType: 'boss',
        progressRequired: 1,
        rewardMultiplier: 0.55
      }
    ]
  },

  // Chain 6: Rise to Fame (5 steps) - Reputation building chain
  {
    id: 'chain_reputation_climb',
    type: 'chain',
    titleTemplate: 'Rise to Fame',
    descriptionTemplate: 'Build your reputation from unknown drifter to legendary desperado through a series of increasingly daring deeds.',
    targetType: 'chain',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: true,
    baseRewards: { gold: 150, xp: 120 },
    rewardMultiplier: 6.0, // 6x for 5-step chain
    levelRequirement: 5,
    chainSteps: [
      {
        stepNumber: 1,
        title: 'Make Your Name Known',
        description: 'Complete simple jobs around town to get noticed.',
        targetType: 'count',
        progressRequired: 3,
        rewardMultiplier: 0.10
      },
      {
        stepNumber: 2,
        title: 'Prove Your Worth',
        description: 'Take on more dangerous work. Show you\'re not to be trifled with.',
        targetType: 'enemy',
        progressRequired: 5,
        rewardMultiplier: 0.15
      },
      {
        stepNumber: 3,
        title: 'Gain Allies',
        description: 'Build relationships with important figures in the territory.',
        targetType: 'npc',
        progressRequired: 4,
        rewardMultiplier: 0.20
      },
      {
        stepNumber: 4,
        title: 'Undertake a Grand Job',
        description: 'Pull off something that will make the newspapers.',
        targetType: 'crime',
        progressRequired: 1,
        rewardMultiplier: 0.25
      },
      {
        stepNumber: 5,
        title: 'Cement Your Legend',
        description: 'Complete a feat that will be remembered for generations.',
        targetType: 'boss',
        progressRequired: 1,
        rewardMultiplier: 0.30
      }
    ]
  }
];

/**
 * Bounty Hunting Contracts (6 templates)
 * Primary skills: Tracking, Firearms, Tactics
 * Phase 5.1: Bounty Hunting Integration
 */
export const BOUNTY_CONTRACTS: ContractTemplate[] = [
  {
    id: 'bounty_hunter_novice',
    type: 'bounty',
    titleTemplate: 'Hunt Small-Time Outlaw',
    descriptionTemplate: 'Track down a petty criminal with a small bounty. Good practice for new bounty hunters.',
    targetType: 'bounty',
    difficulty: 'easy',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 100, xp: 60 },
    levelRequirement: 20,
    requiredSkills: [{ skillId: 'tracking', minLevel: 3 }],
    skillXpRewards: [{ skillId: 'tracking', amount: 25 }, { skillId: 'firearms', amount: 15 }]
  },
  {
    id: 'bounty_hunter_medium',
    type: 'bounty',
    titleTemplate: 'Capture Wanted Fugitive',
    descriptionTemplate: 'A dangerous criminal is on the run. Track them down and bring them to justice for a substantial reward.',
    targetType: 'bounty',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 200, xp: 100 },
    levelRequirement: 25,
    requiredSkills: [{ skillId: 'tracking', minLevel: 8 }, { skillId: 'firearms', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'tracking', amount: 40 }, { skillId: 'firearms', amount: 30 }]
  },
  {
    id: 'bounty_hunter_elite',
    type: 'bounty',
    titleTemplate: 'Hunt Notorious Desperado',
    descriptionTemplate: 'An infamous outlaw with a massive bounty has been spotted in the territory. This is a job for expert hunters only.',
    targetType: 'bounty',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 350, xp: 180 },
    levelRequirement: 30,
    requiredSkills: [{ skillId: 'tracking', minLevel: 12 }, { skillId: 'firearms', minLevel: 10 }, { skillId: 'tactics', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'tracking', amount: 60 }, { skillId: 'firearms', amount: 50 }, { skillId: 'tactics', amount: 40 }]
  },
  {
    id: 'bounty_multiple_targets',
    type: 'bounty',
    titleTemplate: 'Hunt {COUNT} Outlaws',
    descriptionTemplate: 'Multiple bounties have been posted. Track down and capture several wanted criminals.',
    targetType: 'count',
    difficulty: 'medium',
    baseProgressMax: 3,
    levelScaling: true,
    baseRewards: { gold: 180, xp: 90 },
    levelRequirement: 22,
    requiredSkills: [{ skillId: 'tracking', minLevel: 6 }],
    skillXpRewards: [{ skillId: 'tracking', amount: 35 }, { skillId: 'firearms', amount: 25 }]
  }
];

/**
 * Gang Bounty Contracts (2 templates)
 * Phase 5.1: Gang-specific bounty missions
 */
export const GANG_BOUNTY_CONTRACTS: ContractTemplate[] = [
  {
    id: 'gang_bounty_hunt',
    type: 'bounty',
    titleTemplate: 'Hunt Rival Gang Member',
    descriptionTemplate: 'A member of a rival gang has a bounty. Track them down and collect the reward for your gang.',
    targetType: 'bounty',
    difficulty: 'medium',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 220, xp: 110 },
    levelRequirement: 20,
    gangRequired: true,
    gangRankRequired: 'member',
    requiredSkills: [{ skillId: 'tracking', minLevel: 5 }, { skillId: 'firearms', minLevel: 5 }],
    skillXpRewards: [{ skillId: 'tracking', amount: 40 }, { skillId: 'firearms', amount: 35 }]
  },
  {
    id: 'gang_bounty_leader',
    type: 'bounty',
    titleTemplate: 'Hunt Enemy Gang Officer',
    descriptionTemplate: 'An officer from a rival gang has a high-value bounty. This requires strategic planning and skilled execution.',
    targetType: 'bounty',
    difficulty: 'hard',
    baseProgressMax: 1,
    levelScaling: false,
    baseRewards: { gold: 400, xp: 200 },
    levelRequirement: 25,
    gangRequired: true,
    gangRankRequired: 'officer',
    requiredSkills: [{ skillId: 'tracking', minLevel: 10 }, { skillId: 'firearms', minLevel: 10 }, { skillId: 'tactics', minLevel: 8 }],
    skillXpRewards: [{ skillId: 'tracking', amount: 60 }, { skillId: 'firearms', amount: 55 }, { skillId: 'tactics', amount: 45 }]
  }
];

/**
 * All contract templates combined (105 total)
 */
export const ALL_CONTRACT_TEMPLATES: ContractTemplate[] = [
  ...CRIME_CONTRACTS,        // 15
  ...COMBAT_CONTRACTS,       // 21 (12 base + 9 Phase 3)
  ...BOSS_CONTRACTS,         // 3
  ...GANG_CONTRACTS,         // 8
  ...URGENT_CONTRACTS,       // 6
  ...CHAIN_CONTRACTS,        // 6
  ...BOUNTY_CONTRACTS,       // 4 (Phase 5.1)
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
  return SecureRNG.select(array);
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
 * Scale rewards using the tier-based system
 *
 * Phase 3: Overhauled to use tier-based rewards for 70% target gold/hour
 * - Uses character tier (NOVICE, JOURNEYMAN, VETERAN, EXPERT, MASTER)
 * - Applies difficulty multipliers (easy: 0.7, medium: 1.0, hard: 1.5)
 * - Template base rewards are used as multipliers on top of tier base
 */
export function scaleRewards(
  baseRewards: { gold: number; xp: number },
  difficulty: ContractDifficulty,
  level: number,
  urgency: ContractUrgency = 'standard',
  templateMultiplier: number = 1.0
): { gold: number; xp: number } {
  // Get tier-based rewards using the centralized calculation
  const tierReward = calculateContractReward(level, difficulty, urgency, templateMultiplier);

  // If template has custom base rewards that differ significantly from defaults,
  // we use them as an additional modifier (for special/boss contracts)
  // Default base is assumed to be ~100g, ~50xp
  const goldModifier = baseRewards.gold > 0 ? (baseRewards.gold / 100) : 1.0;
  const xpModifier = baseRewards.xp > 0 ? (baseRewards.xp / 50) : 1.0;

  // Cap modifiers to prevent extreme values (0.5x to 5x)
  const cappedGoldMod = Math.max(0.5, Math.min(5.0, goldModifier));
  const cappedXpMod = Math.max(0.5, Math.min(5.0, xpModifier));

  return {
    gold: Math.floor(tierReward.gold * cappedGoldMod),
    xp: Math.floor(tierReward.xp * cappedXpMod)
  };
}

/**
 * Legacy scale rewards function for backward compatibility
 * Uses the old linear scaling method
 */
export function scaleRewardsLegacy(
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
logger.info(`Contract Templates Loaded: ${TEMPLATE_COUNT} templates (Expected: 99)`);
