/**
 * Secret Model
 * Manages hidden content and secret discoveries in Desperados Destiny
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Secret types enumeration
 */
export enum SecretType {
  LOCATION_SECRET = 'location_secret',
  NPC_SECRET = 'npc_secret',
  ITEM_SECRET = 'item_secret',
  QUEST_SECRET = 'quest_secret',
  LORE_SECRET = 'lore_secret',
  TREASURE_SECRET = 'treasure_secret'
}

/**
 * Requirement types for unlocking secrets
 */
export type SecretRequirementType =
  | 'npc_trust'
  | 'quest_complete'
  | 'item_owned'
  | 'level'
  | 'faction_standing'
  | 'time'
  | 'secret_known'
  | 'achievement'
  | 'skill_level'
  | 'location_visit';

/**
 * Faction standing levels
 */
export type FactionStanding = 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'honored';

/**
 * Individual requirement structure
 */
export interface SecretRequirement {
  type: SecretRequirementType;
  description: string;

  // NPC Trust requirement
  npcId?: string;
  trustLevel?: number;

  // Quest requirement
  questId?: string;

  // Item requirement
  itemId?: string;

  // Level requirement
  minLevel?: number;

  // Faction requirement
  faction?: 'settlerAlliance' | 'nahiCoalition' | 'frontera';
  standing?: FactionStanding;
  minReputation?: number;

  // Time requirement (in-game hours, 0-23)
  startHour?: number;
  endHour?: number;

  // Secret chain requirement
  secretId?: string;

  // Achievement requirement
  achievementType?: string;

  // Skill requirement
  skillId?: string;
  skillLevel?: number;

  // Location requirement
  locationId?: string;
  visitCount?: number;
}

/**
 * Reward types
 */
export type RewardType = 'dollars' | 'xp' | 'item' | 'quest_unlock' | 'location_access' | 'npc_dialogue' | 'lore_entry' | 'achievement';

/**
 * Secret reward structure
 */
export interface SecretReward {
  type: RewardType;

  // Gold/XP rewards
  amount?: number;

  // Item reward
  itemId?: string;
  itemName?: string;

  // Quest unlock
  questId?: string;
  questName?: string;

  // Location access
  locationId?: string;
  locationName?: string;

  // NPC dialogue
  npcId?: string;
  dialogueKey?: string;

  // Lore entry
  loreId?: string;
  loreTitle?: string;
  loreContent?: string;

  // Achievement
  achievementType?: string;
  achievementName?: string;

  // General description
  description?: string;
}

/**
 * Secret definition (template/blueprint)
 */
export interface ISecretDefinition extends Document {
  secretId: string;
  name: string;
  description: string;
  type: SecretType;

  // Location-specific (optional)
  locationId?: string;

  // NPC-specific (optional)
  npcId?: string;

  // Requirements to unlock
  requirements: SecretRequirement[];

  // Reward for discovering
  rewards: SecretReward[];

  // Can this be discovered multiple times?
  isRepeatable: boolean;

  // Cooldown between discoveries (minutes, for repeatable secrets)
  cooldownMinutes?: number;

  // Hidden hint (shown before discovery)
  hint?: string;

  // Active/inactive status
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Character's discovered secret (instance)
 */
export interface ICharacterSecret extends Document {
  characterId: mongoose.Types.ObjectId;
  secretId: string;
  discoveredAt: Date;
  rewardClaimed: boolean;

  // For repeatable secrets
  lastDiscoveredAt?: Date;
  discoveryCount?: number;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Secret Definition Schema
 */
const SecretRequirementSchema = new Schema<SecretRequirement>(
  {
    type: {
      type: String,
      required: true,
      enum: ['npc_trust', 'quest_complete', 'item_owned', 'level', 'faction_standing', 'time', 'secret_known', 'achievement', 'skill_level', 'location_visit']
    },
    description: {
      type: String,
      required: true
    },
    npcId: String,
    trustLevel: Number,
    questId: String,
    itemId: String,
    minLevel: Number,
    faction: {
      type: String,
      enum: ['settlerAlliance', 'nahiCoalition', 'frontera']
    },
    standing: {
      type: String,
      enum: ['hostile', 'unfriendly', 'neutral', 'friendly', 'honored']
    },
    minReputation: Number,
    startHour: {
      type: Number,
      min: 0,
      max: 23
    },
    endHour: {
      type: Number,
      min: 0,
      max: 23
    },
    secretId: String,
    achievementType: String,
    skillId: String,
    skillLevel: Number,
    locationId: String,
    visitCount: Number
  },
  { _id: false }
);

const SecretRewardSchema = new Schema<SecretReward>(
  {
    type: {
      type: String,
      required: true,
      enum: ['gold', 'xp', 'item', 'quest_unlock', 'location_access', 'npc_dialogue', 'lore_entry', 'achievement']
    },
    amount: Number,
    itemId: String,
    itemName: String,
    questId: String,
    questName: String,
    locationId: String,
    locationName: String,
    npcId: String,
    dialogueKey: String,
    loreId: String,
    loreTitle: String,
    loreContent: String,
    achievementType: String,
    achievementName: String,
    description: String
  },
  { _id: false }
);

const SecretDefinitionSchema = new Schema<ISecretDefinition>(
  {
    secretId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(SecretType)
    },
    locationId: {
      type: String,
      index: true
    },
    npcId: {
      type: String,
      index: true
    },
    requirements: [SecretRequirementSchema],
    rewards: [SecretRewardSchema],
    isRepeatable: {
      type: Boolean,
      default: false
    },
    cooldownMinutes: Number,
    hint: String,
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
 * Character Secret Schema
 */
const CharacterSecretSchema = new Schema<ICharacterSecret>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    secretId: {
      type: String,
      required: true,
      index: true
    },
    discoveredAt: {
      type: Date,
      default: Date.now
    },
    rewardClaimed: {
      type: Boolean,
      default: false
    },
    lastDiscoveredAt: Date,
    discoveryCount: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
CharacterSecretSchema.index({ characterId: 1, secretId: 1 }, { unique: true });
CharacterSecretSchema.index({ characterId: 1, discoveredAt: -1 });
SecretDefinitionSchema.index({ locationId: 1, isActive: 1 });
SecretDefinitionSchema.index({ npcId: 1, isActive: 1 });
SecretDefinitionSchema.index({ type: 1, isActive: 1 });

export const SecretDefinition = mongoose.model<ISecretDefinition>('SecretDefinition', SecretDefinitionSchema);
export const CharacterSecret = mongoose.model<ICharacterSecret>('CharacterSecret', CharacterSecretSchema);

/**
 * Starter secrets for the game
 */
export const STARTER_SECRETS: Partial<ISecretDefinition>[] = [
  // Location Secrets
  {
    secretId: 'saloon_backroom',
    name: 'Saloon Backroom',
    description: 'A hidden poker room where high-stakes games are played. Access granted only to trusted patrons.',
    type: SecretType.LOCATION_SECRET,
    locationId: 'dusty_saloon',
    requirements: [
      {
        type: 'npc_trust',
        description: 'Earn the trust of the Saloon Owner',
        npcId: 'saloon_owner',
        trustLevel: 50
      }
    ],
    rewards: [
      {
        type: 'location_access',
        locationId: 'saloon_backroom',
        locationName: 'Saloon Backroom',
        description: 'Access to exclusive high-stakes poker games'
      },
      {
        type: 'xp',
        amount: 200
      }
    ],
    isRepeatable: false,
    hint: 'The saloon owner seems to be sizing you up...',
    isActive: true
  },
  {
    secretId: 'sheriff_armory',
    name: 'Sheriff\'s Hidden Armory',
    description: 'A secret weapons cache hidden beneath the sheriff\'s office.',
    type: SecretType.LOCATION_SECRET,
    locationId: 'sheriff_office',
    requirements: [
      {
        type: 'faction_standing',
        description: 'Be friendly with the Settler Alliance',
        faction: 'settlerAlliance',
        standing: 'friendly'
      },
      {
        type: 'quest_complete',
        description: 'Complete the "Lawman\'s Trust" quest',
        questId: 'lawman_trust'
      }
    ],
    rewards: [
      {
        type: 'item',
        itemId: 'legendary_badge',
        itemName: 'Deputy\'s Badge',
        description: 'A rare deputy\'s badge granting special privileges'
      },
      {
        type: 'dollars',
        amount: 500
      }
    ],
    isRepeatable: false,
    hint: 'The sheriff seems to respect you more each day...',
    isActive: true
  },

  // NPC Secrets
  {
    secretId: 'bartender_past',
    name: 'The Bartender\'s Secret Past',
    description: 'The friendly bartender was once a notorious outlaw. He reveals his story to those he trusts.',
    type: SecretType.NPC_SECRET,
    npcId: 'saloon_bartender',
    locationId: 'dusty_saloon',
    requirements: [
      {
        type: 'npc_trust',
        description: 'Build deep trust with the Bartender',
        npcId: 'saloon_bartender',
        trustLevel: 75
      },
      {
        type: 'time',
        description: 'Visit late at night',
        startHour: 22,
        endHour: 2
      }
    ],
    rewards: [
      {
        type: 'npc_dialogue',
        npcId: 'saloon_bartender',
        dialogueKey: 'secret_past',
        description: 'Unlock special dialogue revealing the bartender\'s history'
      },
      {
        type: 'quest_unlock',
        questId: 'redemption_trail',
        questName: 'The Redemption Trail',
        description: 'A special quest to help the bartender find peace'
      },
      {
        type: 'xp',
        amount: 300
      }
    ],
    isRepeatable: false,
    hint: 'The bartender has a faraway look in his eyes when he thinks no one is watching...',
    isActive: true
  },

  // Item Secrets
  {
    secretId: 'legendary_sixshooter_location',
    name: 'Location of the Legendary Six-Shooter',
    description: 'An old prospector knows where the legendary gunslinger "Dead-Eye Dan" buried his famous revolver.',
    type: SecretType.ITEM_SECRET,
    requirements: [
      {
        type: 'npc_trust',
        description: 'Win the trust of Old Prospector Pete',
        npcId: 'old_prospector',
        trustLevel: 60
      },
      {
        type: 'item_owned',
        description: 'Find the Ancient Map Fragment',
        itemId: 'ancient_map_fragment'
      },
      {
        type: 'level',
        description: 'Reach character level 10',
        minLevel: 10
      }
    ],
    rewards: [
      {
        type: 'quest_unlock',
        questId: 'dead_eye_treasure',
        questName: 'Dead-Eye\'s Treasure',
        description: 'A treasure hunt to find the legendary six-shooter'
      },
      {
        type: 'lore_entry',
        loreId: 'dead_eye_dan',
        loreTitle: 'The Legend of Dead-Eye Dan',
        loreContent: 'The story of the fastest gun in the West and his mysterious disappearance.',
        description: 'Learn the legend of Dead-Eye Dan'
      }
    ],
    isRepeatable: false,
    hint: 'Old Pete keeps muttering about a map and a gunslinger from the old days...',
    isActive: true
  },

  // Quest Secrets
  {
    secretId: 'hidden_quest_midnight_rider',
    name: 'The Midnight Rider',
    description: 'A mysterious figure appears only at midnight, offering a dangerous quest to brave souls.',
    type: SecretType.QUEST_SECRET,
    locationId: 'town_square',
    requirements: [
      {
        type: 'time',
        description: 'Be in the town square at midnight',
        startHour: 0,
        endHour: 1
      },
      {
        type: 'level',
        description: 'Reach character level 8',
        minLevel: 8
      },
      {
        type: 'location_visit',
        description: 'Visit the town square at least 5 times',
        locationId: 'town_square',
        visitCount: 5
      }
    ],
    rewards: [
      {
        type: 'quest_unlock',
        questId: 'midnight_rider_quest',
        questName: 'The Midnight Rider\'s Request',
        description: 'A dangerous quest with legendary rewards'
      },
      {
        type: 'xp',
        amount: 400
      }
    ],
    isRepeatable: false,
    hint: 'Strange hoofbeats echo in the town square when the clock strikes twelve...',
    isActive: true
  },

  // Lore Secrets
  {
    secretId: 'ancient_spirits_lore',
    name: 'The Tale of the Ancient Spirits',
    description: 'The tribal elder shares sacred stories of the spirits that watch over the land.',
    type: SecretType.LORE_SECRET,
    npcId: 'tribal_elder',
    requirements: [
      {
        type: 'faction_standing',
        description: 'Be honored by the Nahi Coalition',
        faction: 'nahiCoalition',
        standing: 'honored'
      },
      {
        type: 'skill_level',
        description: 'Have Spirit skill at level 5',
        skillId: 'spirit',
        skillLevel: 5
      }
    ],
    rewards: [
      {
        type: 'lore_entry',
        loreId: 'ancient_spirits',
        loreTitle: 'The Ancient Spirits of the Land',
        loreContent: 'Sacred knowledge of the spirits that inhabit the frontier, passed down through generations.',
        description: 'Unlock deep lore about the spiritual world'
      },
      {
        type: 'xp',
        amount: 500
      },
      {
        type: 'achievement',
        achievementType: 'lore_keeper',
        achievementName: 'Keeper of Sacred Knowledge'
      }
    ],
    isRepeatable: false,
    hint: 'The tribal elder watches you with knowing eyes, as if judging your spirit...',
    isActive: true
  },

  // Treasure Secrets
  {
    secretId: 'canyon_hidden_stash',
    name: 'Canyon Outlaw Cache',
    description: 'A hidden stash of gold and weapons left by outlaws who never returned.',
    type: SecretType.TREASURE_SECRET,
    locationId: 'devils_canyon',
    requirements: [
      {
        type: 'item_owned',
        description: 'Possess the Rusty Key',
        itemId: 'rusty_key'
      },
      {
        type: 'time',
        description: 'Search at dawn',
        startHour: 5,
        endHour: 7
      },
      {
        type: 'secret_known',
        description: 'First discover the "Outlaw\'s Map" secret',
        secretId: 'outlaw_map_secret'
      }
    ],
    rewards: [
      {
        type: 'dollars',
        amount: 1000
      },
      {
        type: 'item',
        itemId: 'outlaw_rifle',
        itemName: 'Outlaw\'s Rifle',
        description: 'A well-maintained rifle from the cache'
      },
      {
        type: 'xp',
        amount: 350
      }
    ],
    isRepeatable: false,
    hint: 'Strange markings on the canyon wall seem to point somewhere...',
    isActive: true
  },

  // Chain Secret (requires another secret)
  {
    secretId: 'outlaw_map_secret',
    name: 'The Outlaw\'s Map',
    description: 'A hand-drawn map showing secret locations throughout the territory.',
    type: SecretType.ITEM_SECRET,
    requirements: [
      {
        type: 'quest_complete',
        description: 'Complete the "Bandit\'s Trail" quest',
        questId: 'bandit_trail'
      },
      {
        type: 'level',
        description: 'Reach character level 6',
        minLevel: 6
      }
    ],
    rewards: [
      {
        type: 'item',
        itemId: 'outlaw_map',
        itemName: 'Outlaw\'s Map',
        description: 'A map revealing hidden locations'
      },
      {
        type: 'xp',
        amount: 200
      },
      {
        type: 'lore_entry',
        loreId: 'outlaw_network',
        loreTitle: 'The Outlaw Network',
        loreContent: 'Information about the secret network of outlaws operating across the frontier.'
      }
    ],
    isRepeatable: false,
    hint: 'The defeated bandit dropped something that looks important...',
    isActive: true
  },

  // Repeatable Secret
  {
    secretId: 'moonshine_runner',
    name: 'Moonshine Runner',
    description: 'Help the moonshiner move illegal goods under cover of darkness.',
    type: SecretType.LOCATION_SECRET,
    locationId: 'hideout_camp',
    requirements: [
      {
        type: 'npc_trust',
        description: 'Be trusted by the Moonshiner',
        npcId: 'moonshiner',
        trustLevel: 40
      },
      {
        type: 'time',
        description: 'Only available at night',
        startHour: 20,
        endHour: 4
      }
    ],
    rewards: [
      {
        type: 'dollars',
        amount: 150
      },
      {
        type: 'xp',
        amount: 100
      }
    ],
    isRepeatable: true,
    cooldownMinutes: 240, // 4 hours
    hint: 'The moonshiner gives you a knowing nod when you pass by at night...',
    isActive: true
  }
];
