/**
 * Action Model
 *
 * Mongoose schema for game actions (crimes, combat, crafting, social)
 * that can be performed using the Destiny Deck system
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { Suit, HandRank, SkillCategory } from '@desperados/shared';

/**
 * Action types representing different categories of player actions
 */
export enum ActionType {
  CRIME = 'CRIME',
  COMBAT = 'COMBAT',
  CRAFT = 'CRAFT',
  SOCIAL = 'SOCIAL'
}

/**
 * Action rewards structure
 */
export interface ActionRewards {
  xp: number;
  gold: number;
  items?: string[];
}

/**
 * Crime-specific action properties
 */
export interface CrimeProperties {
  jailTimeOnFailure?: number; // Minutes in jail if caught (0 = no jail time)
  wantedLevelIncrease?: number; // 0-5, how much wanted level increases if caught
  witnessChance?: number; // 0-100%, probability of being witnessed/caught
  bailCost?: number; // Gold cost to escape jail early
}

/**
 * Action document interface
 */
export interface IAction extends Document {
  // Identity
  type: ActionType;
  name: string;
  description: string;

  // Requirements
  energyCost: number;
  difficulty: number; // 1-100 scale

  // Optional requirements
  requiredSuit?: Suit;
  minHandRank?: HandRank;

  // Skill requirements
  requiredSkillCategory?: SkillCategory;
  requiredSkillLevel?: number; // Minimum skill level to unlock this action
  tier?: number; // 1-4 content tier

  // Criminal skill requirements (for CRIME type actions)
  requiredCriminalSkill?: string; // e.g., 'pickpocketing', 'burglary', 'robbery', 'heisting', 'assassination'
  requiredCriminalSkillLevel?: number; // Minimum criminal skill level

  // Rewards
  rewards: ActionRewards;

  // Crime-specific properties (only for CRIME type actions)
  crimeProperties?: CrimeProperties;

  // Status
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  toSafeObject(): any;
}

/**
 * Action static methods interface
 */
export interface IActionModel extends Model<IAction> {
  findActiveActions(): Promise<IAction[]>;
  findActionsByType(type: ActionType): Promise<IAction[]>;
  seedStarterActions(): Promise<void>;
}

/**
 * Action schema definition
 */
const ActionSchema = new Schema<IAction>(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(ActionType),
      index: true
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500
    },
    energyCost: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    requiredSuit: {
      type: String,
      enum: Object.values(Suit),
      required: false
    },
    minHandRank: {
      type: Number,
      enum: Object.values(HandRank).filter(v => typeof v === 'number'),
      required: false
    },
    requiredSkillCategory: {
      type: String,
      enum: Object.values(SkillCategory),
      required: false
    },
    requiredSkillLevel: {
      type: Number,
      min: 1,
      max: 50,
      default: 1,
      required: false
    },
    tier: {
      type: Number,
      min: 1,
      max: 4,
      default: 1,
      required: false
    },
    requiredCriminalSkill: {
      type: String,
      enum: ['pickpocketing', 'burglary', 'robbery', 'heisting', 'assassination'],
      required: false
    },
    requiredCriminalSkillLevel: {
      type: Number,
      min: 1,
      max: 50,
      default: 1,
      required: false
    },
    rewards: {
      xp: {
        type: Number,
        required: true,
        min: 0
      },
      gold: {
        type: Number,
        required: true,
        min: 0
      },
      items: [{
        type: String
      }]
    },
    crimeProperties: {
      jailTimeOnFailure: {
        type: Number,
        min: 0,
        required: false
      },
      wantedLevelIncrease: {
        type: Number,
        min: 0,
        max: 5,
        required: false
      },
      witnessChance: {
        type: Number,
        min: 0,
        max: 100,
        required: false
      },
      bailCost: {
        type: Number,
        min: 0,
        required: false
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
ActionSchema.index({ type: 1, isActive: 1 });
ActionSchema.index({ difficulty: 1 });
ActionSchema.index({ energyCost: 1 });
ActionSchema.index({ tier: 1 });
ActionSchema.index({ requiredSkillLevel: 1 });

/**
 * Instance method: Return safe action object
 */
ActionSchema.methods.toSafeObject = function(this: IAction) {
  const id = this._id.toString();
  return {
    id,
    _id: id,
    type: this.type,
    name: this.name,
    description: this.description,
    energyCost: this.energyCost,
    difficulty: this.difficulty,
    targetScore: this.difficulty * 100, // Target score for DeckGame display
    requiredSuit: this.requiredSuit,
    minHandRank: this.minHandRank,
    requiredSkillCategory: this.requiredSkillCategory,
    requiredSkillLevel: this.requiredSkillLevel || 1,
    tier: this.tier || 1,
    rewards: this.rewards,
    crimeProperties: this.crimeProperties,
    isActive: this.isActive
  };
};

/**
 * Static method: Find all active actions
 */
ActionSchema.statics.findActiveActions = async function(): Promise<IAction[]> {
  return this.find({ isActive: true }).sort({ type: 1, difficulty: 1 });
};

/**
 * Static method: Find actions by type
 */
ActionSchema.statics.findActionsByType = async function(type: ActionType): Promise<IAction[]> {
  return this.find({ type, isActive: true }).sort({ difficulty: 1 });
};

/**
 * Static method: Seed starter actions into the database
 */
ActionSchema.statics.seedStarterActions = async function(): Promise<void> {
  const starterActions = [
    // Crime Actions (Spades - Cunning)
    // Petty Crimes (Tier 1 - Level 1)
    {
      type: ActionType.CRIME,
      name: 'Pickpocket Drunk',
      description: 'Target an inebriated patron stumbling from the saloon. Quick hands make for easy coin.',
      energyCost: 10,
      difficulty: 25,
      requiredSuit: Suit.SPADES,
      requiredSkillCategory: SkillCategory.CUNNING,
      requiredSkillLevel: 1,
      requiredCriminalSkill: 'pickpocketing',
      requiredCriminalSkillLevel: 1,
      tier: 1,
      rewards: { xp: 10, gold: 10, items: [] },
      crimeProperties: {
        jailTimeOnFailure: 5,
        wantedLevelIncrease: 1,
        witnessChance: 30,
        bailCost: 50
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Steal from Market',
      description: 'Swipe goods from the bustling market stalls. Keep your head down and blend in.',
      energyCost: 15,
      difficulty: 30,
      requiredSuit: Suit.SPADES,
      requiredSkillCategory: SkillCategory.CUNNING,
      requiredSkillLevel: 1,
      requiredCriminalSkill: 'burglary',
      requiredCriminalSkillLevel: 1,
      tier: 1,
      rewards: { xp: 15, gold: 20, items: ['market_goods'] },
      crimeProperties: {
        jailTimeOnFailure: 10,
        wantedLevelIncrease: 1,
        witnessChance: 40,
        bailCost: 75
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Forge Documents',
      description: 'Create convincing forged documents. A skilled criminal always has the right papers.',
      energyCost: 20,
      difficulty: 35,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'pickpocketing',
      requiredCriminalSkillLevel: 10,
      rewards: { xp: 25, gold: 35, items: ['forged_deed'] },
      crimeProperties: {
        jailTimeOnFailure: 15,
        wantedLevelIncrease: 1,
        witnessChance: 20,
        bailCost: 100
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Pick Lock',
      description: 'Use your cunning to pick a simple lock. Practice makes perfect in the art of breaking and entering.',
      energyCost: 12,
      difficulty: 28,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'pickpocketing',
      requiredCriminalSkillLevel: 5,
      rewards: { xp: 12, gold: 15, items: [] },
      crimeProperties: {
        jailTimeOnFailure: 8,
        wantedLevelIncrease: 1,
        witnessChance: 25,
        bailCost: 60
      },
      isActive: true
    },

    // Medium Crimes (Tier 2 - Level 10)
    {
      type: ActionType.CRIME,
      name: 'Burglarize Store',
      description: 'Break into a general store after hours. The sheriff patrols nearby, so timing is everything.',
      energyCost: 25,
      difficulty: 50,
      requiredSuit: Suit.SPADES,
      requiredSkillCategory: SkillCategory.CUNNING,
      requiredSkillLevel: 10,
      requiredCriminalSkill: 'burglary',
      requiredCriminalSkillLevel: 10,
      tier: 2,
      rewards: { xp: 40, gold: 60, items: ['stolen_goods'] },
      crimeProperties: {
        jailTimeOnFailure: 30,
        wantedLevelIncrease: 2,
        witnessChance: 50,
        bailCost: 200
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Cattle Rustling',
      description: 'Steal cattle from a nearby ranch under cover of darkness. Ranchers protect their herds fiercely.',
      energyCost: 30,
      difficulty: 55,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'robbery',
      requiredCriminalSkillLevel: 5,
      rewards: { xp: 50, gold: 80, items: ['cattle'] },
      crimeProperties: {
        jailTimeOnFailure: 45,
        wantedLevelIncrease: 2,
        witnessChance: 60,
        bailCost: 250
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Stage Coach Robbery',
      description: 'Ambush a stagecoach on the frontier road. Rich passengers mean rich rewards, but armed guards mean danger.',
      energyCost: 35,
      difficulty: 60,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'robbery',
      requiredCriminalSkillLevel: 10,
      rewards: { xp: 60, gold: 100, items: ['jewelry', 'pocket_watch'] },
      crimeProperties: {
        jailTimeOnFailure: 60,
        wantedLevelIncrease: 3,
        witnessChance: 70,
        bailCost: 300
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Rob Saloon',
      description: 'Plan and execute a daring saloon robbery. High risk, high reward, and plenty of witnesses.',
      energyCost: 28,
      difficulty: 58,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'burglary',
      requiredCriminalSkillLevel: 15,
      rewards: { xp: 55, gold: 85, items: ['whiskey_bottle', 'cash'] },
      crimeProperties: {
        jailTimeOnFailure: 40,
        wantedLevelIncrease: 2,
        witnessChance: 65,
        bailCost: 280
      },
      isActive: true
    },

    // Serious Crimes (Tier 3 - Level 20-39)
    {
      type: ActionType.CRIME,
      name: "The Preacher's Ledger",
      description: "The church treasurer has been skimming from the orphan fund. Steal his ledger and the evidence. You're stealing from a thief, but the church won't see it that way.",
      energyCost: 28,
      difficulty: 55,
      requiredSuit: Suit.SPADES,
      requiredSkillCategory: SkillCategory.CUNNING,
      requiredSkillLevel: 20,
      requiredCriminalSkill: 'heisting',
      requiredCriminalSkillLevel: 15,
      tier: 3,
      rewards: { xp: 65, gold: 95, items: ['incriminating_ledger'] },
      crimeProperties: {
        jailTimeOnFailure: 50,
        wantedLevelIncrease: 2,
        witnessChance: 45,
        bailCost: 320
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Territorial Extortion',
      description: "Small ranchers are being pressured by the railroad. You can 'protect' them for a fee, or shake down the railroad instead. Someone's paying - you decide who.",
      energyCost: 32,
      difficulty: 58,
      requiredSuit: Suit.SPADES,
      requiredSkillCategory: SkillCategory.CUNNING,
      requiredSkillLevel: 23,
      requiredCriminalSkill: 'heisting',
      requiredCriminalSkillLevel: 18,
      tier: 3,
      rewards: { xp: 72, gold: 110, items: ['protection_payment'] },
      crimeProperties: {
        jailTimeOnFailure: 55,
        wantedLevelIncrease: 2,
        witnessChance: 50,
        bailCost: 350
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'The Counterfeit Ring',
      description: "Intercept a US Mint shipment of blank coin plates and flood Sangre Territory with fake currency. When you print money, everyone pays the price.",
      energyCost: 35,
      difficulty: 62,
      requiredSuit: Suit.SPADES,
      requiredSkillCategory: SkillCategory.CUNNING,
      requiredSkillLevel: 26,
      requiredCriminalSkill: 'heisting',
      requiredCriminalSkillLevel: 22,
      tier: 3,
      rewards: { xp: 80, gold: 140, items: ['counterfeit_plates', 'fake_coins'] },
      crimeProperties: {
        jailTimeOnFailure: 70,
        wantedLevelIncrease: 3,
        witnessChance: 35,
        bailCost: 400
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Ghost Town Heist',
      description: "Perdition Gulch was abandoned after a mine collapse. The gold's still in the vault. So are the men who died for it. Previous crews never returned.",
      energyCost: 38,
      difficulty: 65,
      requiredSuit: Suit.SPADES,
      requiredSkillCategory: SkillCategory.CUNNING,
      requiredSkillLevel: 30,
      requiredCriminalSkill: 'heisting',
      requiredCriminalSkillLevel: 28,
      tier: 3,
      rewards: { xp: 90, gold: 175, items: ['cursed_gold', 'miners_remains'] },
      crimeProperties: {
        jailTimeOnFailure: 75,
        wantedLevelIncrease: 2,
        witnessChance: 15,
        bailCost: 420
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: "The Judge's Pocket",
      description: "Territorial Judge Whitmore keeps blackmail files on every powerful figure in Sangre. Break into his office and take them. Information is the most valuable currency.",
      energyCost: 40,
      difficulty: 68,
      requiredSuit: Suit.SPADES,
      requiredSkillCategory: SkillCategory.CUNNING,
      requiredSkillLevel: 34,
      requiredCriminalSkill: 'heisting',
      requiredCriminalSkillLevel: 32,
      tier: 3,
      rewards: { xp: 100, gold: 160, items: ['blackmail_files', 'judges_seal'] },
      crimeProperties: {
        jailTimeOnFailure: 85,
        wantedLevelIncrease: 3,
        witnessChance: 30,
        bailCost: 480
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'The Iron Horse',
      description: "The railroad payroll train. The biggest score in the territory. After this, they'll either sing songs about you or hang you from the nearest tree.",
      energyCost: 45,
      difficulty: 72,
      requiredSuit: Suit.SPADES,
      requiredSkillCategory: SkillCategory.CUNNING,
      requiredSkillLevel: 38,
      requiredCriminalSkill: 'robbery',
      requiredCriminalSkillLevel: 30,
      tier: 3,
      rewards: { xp: 110, gold: 280, items: ['railroad_payroll', 'iron_horse_bounty'] },
      crimeProperties: {
        jailTimeOnFailure: 100,
        wantedLevelIncrease: 4,
        witnessChance: 75,
        bailCost: 550
      },
      isActive: true
    },

    // Major Crimes (Tier 4 - Level 40)
    {
      type: ActionType.CRIME,
      name: 'Bank Heist',
      description: 'The ultimate score - rob the town bank. Careful planning required, and lawmen will respond fast.',
      energyCost: 40,
      difficulty: 75,
      requiredSuit: Suit.SPADES,
      requiredSkillCategory: SkillCategory.CUNNING,
      requiredSkillLevel: 40,
      requiredCriminalSkill: 'heisting',
      requiredCriminalSkillLevel: 35,
      tier: 4,
      rewards: { xp: 100, gold: 250, items: ['gold_bars', 'bonds'] },
      crimeProperties: {
        jailTimeOnFailure: 120,
        wantedLevelIncrease: 4,
        witnessChance: 80,
        bailCost: 500
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Train Robbery',
      description: 'Stop and rob a passenger train. The payoff is legendary, but so is the danger.',
      energyCost: 45,
      difficulty: 80,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'robbery',
      requiredCriminalSkillLevel: 25,
      rewards: { xp: 125, gold: 300, items: ['gold_bars', 'luxury_goods'] },
      crimeProperties: {
        jailTimeOnFailure: 180,
        wantedLevelIncrease: 4,
        witnessChance: 85,
        bailCost: 600
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Murder for Hire',
      description: 'Accept a contract to eliminate a target. The darkest deed, with the harshest consequences.',
      energyCost: 50,
      difficulty: 85,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'assassination',
      requiredCriminalSkillLevel: 30,
      rewards: { xp: 150, gold: 400, items: ['blood_money'] },
      crimeProperties: {
        jailTimeOnFailure: 240,
        wantedLevelIncrease: 5,
        witnessChance: 90,
        bailCost: 800
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Steal Horse',
      description: 'Steal a prized horse from a stable. Horse theft is a hanging offense in these parts.',
      energyCost: 38,
      difficulty: 70,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'robbery',
      requiredCriminalSkillLevel: 15,
      rewards: { xp: 75, gold: 150, items: ['stolen_horse'] },
      crimeProperties: {
        jailTimeOnFailure: 90,
        wantedLevelIncrease: 3,
        witnessChance: 75,
        bailCost: 400
      },
      isActive: true
    },

    // Special Crimes
    {
      type: ActionType.CRIME,
      name: 'Smuggling Run',
      description: 'Transport illegal goods across the border. Avoid customs agents and nosy lawmen.',
      energyCost: 30,
      difficulty: 52,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'robbery',
      requiredCriminalSkillLevel: 8,
      rewards: { xp: 45, gold: 70, items: ['contraband'] },
      crimeProperties: {
        jailTimeOnFailure: 60,
        wantedLevelIncrease: 2,
        witnessChance: 40,
        bailCost: 220
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Bootlegging',
      description: 'Brew and sell illegal moonshine. The temperance movement has made this quite profitable.',
      energyCost: 25,
      difficulty: 45,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'burglary',
      requiredCriminalSkillLevel: 8,
      rewards: { xp: 35, gold: 55, items: ['moonshine'] },
      crimeProperties: {
        jailTimeOnFailure: 30,
        wantedLevelIncrease: 2,
        witnessChance: 35,
        bailCost: 180
      },
      isActive: true
    },
    {
      type: ActionType.CRIME,
      name: 'Arson',
      description: 'Set fire to a rival establishment. Flames attract attention quickly, and evidence is hard to hide.',
      energyCost: 40,
      difficulty: 72,
      requiredSuit: Suit.SPADES,
      requiredCriminalSkill: 'assassination',
      requiredCriminalSkillLevel: 25,
      rewards: { xp: 90, gold: 120, items: [] },
      crimeProperties: {
        jailTimeOnFailure: 120,
        wantedLevelIncrease: 4,
        witnessChance: 95,
        bailCost: 550
      },
      isActive: true
    },

    // Combat Actions (Clubs - Combat)
    {
      type: ActionType.COMBAT,
      name: 'Bar Brawl',
      description: 'Throw down in a classic Western bar fight. Chairs will be broken, bottles will fly.',
      energyCost: 15,
      difficulty: 40,
      requiredSuit: Suit.CLUBS,
      rewards: { xp: 40, gold: 20, items: [] },
      isActive: true
    },
    {
      type: ActionType.COMBAT,
      name: 'Duel Outlaw',
      description: 'Face off against a dangerous outlaw in a high-noon duel. Only one of you walks away.',
      energyCost: 30,
      difficulty: 70,
      requiredSuit: Suit.CLUBS,
      rewards: { xp: 125, gold: 80, items: ['outlaw_bounty'] },
      isActive: true
    },
    {
      type: ActionType.COMBAT,
      name: 'Hunt Wildlife',
      description: 'Track and hunt wild game in the frontier. Bring back meat and pelts for profit.',
      energyCost: 20,
      difficulty: 45,
      requiredSuit: Suit.CLUBS,
      rewards: { xp: 60, gold: 40, items: ['deer_pelt'] },
      isActive: true
    },
    {
      type: ActionType.COMBAT,
      name: 'Defend Homestead',
      description: 'Protect a settler homestead from raiders. Your combat skills will be tested.',
      energyCost: 25,
      difficulty: 55,
      requiredSuit: Suit.CLUBS,
      rewards: { xp: 90, gold: 60, items: ['settler_thanks'] },
      isActive: true
    },

    // Additional Combat Actions (Tier Progression)
    // Tier 1 Combat (Level 1-9)
    {
      type: ActionType.COMBAT,
      name: 'Clear Rat Nest',
      description: 'The general store has a vermin problem in the cellar. Simple work, but it pays and builds your reputation.',
      energyCost: 8,
      difficulty: 20,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 1,
      tier: 1,
      rewards: { xp: 15, gold: 8, items: [] },
      isActive: true
    },
    {
      type: ActionType.COMBAT,
      name: 'Run Off Coyotes',
      description: 'Ranchers need someone to scare off the coyotes stalking their livestock. Noisy work, but honest.',
      energyCost: 12,
      difficulty: 30,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 3,
      tier: 1,
      rewards: { xp: 25, gold: 15, items: ['coyote_pelt'] },
      isActive: true
    },

    // Tier 2 Combat (Level 10-19)
    {
      type: ActionType.COMBAT,
      name: 'Bounty: Cattle Rustlers',
      description: 'A small gang of rustlers has been hitting ranches. The Cattlemen\'s Association is paying for their capture - dead or alive.',
      energyCost: 22,
      difficulty: 48,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 10,
      tier: 2,
      rewards: { xp: 75, gold: 50, items: ['rustler_bounty'] },
      isActive: true
    },
    {
      type: ActionType.COMBAT,
      name: 'Clear Bandit Camp',
      description: 'Highway bandits have set up camp near the trade routes. Merchants are pooling reward money for someone to clean them out.',
      energyCost: 28,
      difficulty: 58,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 14,
      tier: 2,
      rewards: { xp: 100, gold: 75, items: ['bandit_loot'] },
      isActive: true
    },
    {
      type: ActionType.COMBAT,
      name: 'Hunt Mountain Lion',
      description: 'A mountain lion has been taking livestock and spooked a child. Track it to its den and put it down before it kills someone.',
      energyCost: 26,
      difficulty: 52,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 12,
      tier: 2,
      rewards: { xp: 85, gold: 60, items: ['mountain_lion_pelt'] },
      isActive: true
    },

    // Tier 3 Combat (Level 20-24)
    {
      type: ActionType.COMBAT,
      name: 'Bounty: Mad Dog McGraw',
      description: 'McGraw went crazy after his family died of fever. Now he shoots anyone who rides near his land. The territory wants him stopped, but some say he deserves mercy.',
      energyCost: 32,
      difficulty: 65,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 20,
      tier: 3,
      rewards: { xp: 150, gold: 120, items: ['mcgraw_bounty'] },
      isActive: true
    },
    {
      type: ActionType.COMBAT,
      name: 'Raid Smuggler Den',
      description: 'Smugglers are running guns to hostile parties. The Army can\'t act officially, but they\'ll pay well for someone to shut down the operation.',
      energyCost: 34,
      difficulty: 68,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 22,
      tier: 3,
      rewards: { xp: 175, gold: 140, items: ['smuggled_weapons', 'army_commendation'] },
      isActive: true
    },
    {
      type: ActionType.COMBAT,
      name: 'Escort Prisoner Transport',
      description: 'Help transport a dangerous prisoner to the territorial prison. His gang will try to break him out. Every gun helps.',
      energyCost: 30,
      difficulty: 62,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 18,
      tier: 3,
      rewards: { xp: 130, gold: 100, items: ['marshals_thanks'] },
      isActive: true
    },

    // ========================================
    // BOSS ENCOUNTERS
    // Legendary foes with dread and history
    // ========================================

    // Boss 1: The Warden of Perdition (Level 25)
    {
      type: ActionType.COMBAT,
      name: 'The Warden of Perdition',
      description: 'Mine Foreman Josiah Crane locked his workers in during the collapse and took the payroll. They say he still patrols the tunnels, lantern in hand, counting souls instead of gold. The miners\' widows want closure. The Warden wants company.',
      energyCost: 35,
      difficulty: 72,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 25,
      tier: 3,
      rewards: { xp: 350, gold: 200, items: ['wardens-lantern', 'perdition-gold'] },
      isActive: true
    },

    // Boss 2: El Carnicero (Level 30)
    {
      type: ActionType.COMBAT,
      name: 'El Carnicero',
      description: 'The Butcher of Frontera earned his name during the border wars. They say he\'s killed a hundred men and eaten their hearts to steal their courage. Now he runs a crew in Sangre Canyon, and travelers who enter don\'t leave. The bounty\'s been raised three times. No one\'s collected.',
      energyCost: 40,
      difficulty: 78,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 30,
      tier: 3,
      rewards: { xp: 450, gold: 280, items: ['carniceros-cleaver', 'bloody-trophy'] },
      isActive: true
    },

    // Boss 3: The Pale Rider (Level 35)
    {
      type: ActionType.COMBAT,
      name: 'The Pale Rider',
      description: 'A gunslinger on a white horse who appears when blood feuds reach their end. No one knows whose side he\'s on - he just appears and everyone dies. The Nahi call him a spirit of vengeance. The settlers call him death itself. He\'s been sighted near Red Gulch. Someone\'s debt is coming due.',
      energyCost: 45,
      difficulty: 85,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 35,
      tier: 4,
      rewards: { xp: 600, gold: 350, items: ['pale-riders-pistol', 'death-coin'] },
      isActive: true
    },

    // Boss 4: The Wendigo (Level 38)
    {
      type: ActionType.COMBAT,
      name: 'The Wendigo',
      description: 'In the winter of \'67, the Donovan expedition got lost in the mountains. They found shelter. They ran out of food. Only one came back, and he wasn\'t Donovan anymore. The Nahi sealed the cave, but something\'s broken out. It\'s still hungry, and it remembers how people taste.',
      energyCost: 48,
      difficulty: 88,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 38,
      tier: 4,
      rewards: { xp: 700, gold: 400, items: ['wendigo-fang', 'frozen-heart'] },
      isActive: true
    },

    // Boss 5: General Sangre (Level 40)
    {
      type: ActionType.COMBAT,
      name: 'General Sangre',
      description: 'Confederate General Ezekiel Blood refused to surrender in \'65. He took his regiment into the canyons and declared his own nation. Thirty years later, his army of deserters, outlaws, and the damned still hold the deepest territory. The General awaits challengers on his throne of bones. No one has defeated him. No one has escaped.',
      energyCost: 50,
      difficulty: 92,
      requiredSuit: Suit.CLUBS,
      requiredSkillCategory: SkillCategory.COMBAT,
      requiredSkillLevel: 40,
      tier: 4,
      rewards: { xp: 1000, gold: 600, items: ['generals-saber', 'blood-banner', 'widowmaker'] },
      isActive: true
    },

    // Craft Actions (Diamonds - Craft)
    {
      type: ActionType.CRAFT,
      name: 'Craft Bullets',
      description: 'Carefully craft ammunition for your firearms. Quality bullets can save your life.',
      energyCost: 20,
      difficulty: 35,
      requiredSuit: Suit.DIAMONDS,
      rewards: { xp: 50, gold: 25, items: ['bullets_20'] },
      isActive: true
    },
    {
      type: ActionType.CRAFT,
      name: 'Forge Horseshoe',
      description: 'Work the forge to create a sturdy horseshoe. Blacksmithing is an essential frontier skill.',
      energyCost: 15,
      difficulty: 30,
      requiredSuit: Suit.DIAMONDS,
      rewards: { xp: 35, gold: 20, items: ['horseshoe'] },
      isActive: true
    },
    {
      type: ActionType.CRAFT,
      name: 'Brew Medicine',
      description: 'Mix herbs and ingredients to create healing medicine. Knowledge of remedies is valuable.',
      energyCost: 25,
      difficulty: 50,
      requiredSuit: Suit.DIAMONDS,
      rewards: { xp: 80, gold: 45, items: ['health_tonic'] },
      isActive: true
    },
    {
      type: ActionType.CRAFT,
      name: 'Build Wagon Wheel',
      description: 'Construct a replacement wagon wheel. Broken wheels leave travelers stranded.',
      energyCost: 30,
      difficulty: 60,
      requiredSuit: Suit.DIAMONDS,
      rewards: { xp: 110, gold: 70, items: ['wagon_wheel'] },
      isActive: true
    },

    // Social Actions (Hearts - Spirit)
    {
      type: ActionType.SOCIAL,
      name: 'Charm Bartender',
      description: 'Use your silver tongue to win over the local bartender. Information flows with whiskey.',
      energyCost: 10,
      difficulty: 25,
      requiredSuit: Suit.HEARTS,
      rewards: { xp: 30, gold: 10, items: [] },
      isActive: true
    },
    {
      type: ActionType.SOCIAL,
      name: 'Negotiate Trade',
      description: 'Broker a trade deal between parties. Good negotiation skills turn profit.',
      energyCost: 20,
      difficulty: 50,
      requiredSuit: Suit.HEARTS,
      rewards: { xp: 85, gold: 55, items: [] },
      isActive: true
    },
    {
      type: ActionType.SOCIAL,
      name: 'Perform Music',
      description: 'Entertain the saloon with a musical performance. A good show earns tips and fame.',
      energyCost: 15,
      difficulty: 35,
      requiredSuit: Suit.HEARTS,
      rewards: { xp: 45, gold: 30, items: [] },
      isActive: true
    },
    {
      type: ActionType.SOCIAL,
      name: 'Convince Sheriff',
      description: 'Persuade the sheriff to see things your way. Sometimes words work better than bullets.',
      energyCost: 25,
      difficulty: 65,
      requiredSuit: Suit.HEARTS,
      rewards: { xp: 115, gold: 65, items: ['sheriff_favor'] },
      isActive: true
    }
  ];

  // Upsert actions by name - use $set to update existing actions with new fields
  // This ensures requiredCriminalSkill and other new fields get added to existing actions
  for (const actionData of starterActions) {
    await this.updateOne(
      { name: actionData.name },
      { $set: actionData },
      { upsert: true }
    );
  }
};

/**
 * Action model
 */
export const Action = mongoose.model<IAction, IActionModel>('Action', ActionSchema);
