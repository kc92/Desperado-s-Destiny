/**
 * Chinese Diaspora Types
 *
 * Types for the Chinese immigrant NPC network - a hidden sub-faction
 * with trust-based access, cultural authenticity, and historical respect.
 *
 * Historical Context: 1880s Chinese immigrants faced severe discrimination
 * (Chinese Exclusion Act 1882) but maintained tight-knit communities with
 * underground networks for mutual protection and aid.
 */

/**
 * Network role of a Chinese NPC
 */
export type ChineseNetworkRole =
  | 'contact'      // First point of contact, basic services
  | 'informant'    // Gathers and shares information
  | 'elder'        // Network leader, high-level access
  | 'protector'    // Guards network safety
  | 'specialist';  // Unique skills (healer, demolitions, etc.)

/**
 * Trust level names (Chinese cultural hierarchy)
 */
export type ChineseTrustName =
  | 'Outsider'        // Level 0: No trust, cover identity only
  | 'Acquaintance'    // Level 1: Basic trust, some services
  | 'Friend'          // Level 2: Good trust, better prices
  | 'Brother/Sister'  // Level 3: Deep trust, family connections
  | 'Family';         // Level 4: Complete trust, inner circle

/**
 * Service categories offered by Chinese NPCs
 */
export type ChineseServiceCategory =
  | 'medicine'        // Herbal medicine, acupuncture
  | 'information'     // Intelligence, messages, secrets
  | 'goods'           // Silk, tea, rare imports
  | 'explosives'      // From railroad/mining expertise
  | 'tunnels'         // Secret routes, construction knowledge
  | 'healing'         // Superior to Western medicine
  | 'martial_arts'    // Rare, high trust only
  | 'safe_house'      // Shelter, protection
  | 'smuggling'       // Contraband, opium
  | 'laundry';        // Cover business, information gathering

/**
 * Discovery method for finding Chinese NPCs
 */
export type DiscoveryMethod =
  | 'visible'         // Openly accessible
  | 'rumor'           // Learn through dialogue
  | 'quest'           // Quest requirement
  | 'trust'           // Referred by trusted NPC
  | 'exploration'     // Find by visiting locations
  | 'item';           // Requires specific item

/**
 * Trust level with requirements and unlocks
 */
export interface ChineseTrustLevel {
  level: number;                    // 0-4
  name: ChineseTrustName;
  description: string;
  requirements: {
    quests?: string[];              // Quest IDs to complete
    goldSpent?: number;             // Minimum gold spent with network
    referrals?: string[];           // NPCs who must vouch for you
    items?: string[];               // Items to gift
    timeKnown?: number;             // Days since first meeting
  };
  unlocks: {
    services?: string[];            // Service IDs unlocked
    npcs?: string[];                // NPC IDs revealed
    quests?: string[];              // Quest IDs available
    dialogue?: string[];            // Dialogue tree IDs
    items?: string[];               // Item IDs unlocked/granted
    prices?: {
      discount: number;             // Percentage discount (0.1 = 10% off)
    };
  };
}

/**
 * Service offered by Chinese NPC
 */
export interface ChineseService {
  id: string;
  name: string;
  chineseName?: string;             // Name in Chinese characters (for flavor)
  description: string;
  category: ChineseServiceCategory;
  minTrustLevel: number;            // Minimum trust to access
  cost: {
    gold?: number;
    items?: Array<{ itemId: string; quantity: number }>;
    favor?: boolean;                // Owes you a favor after
  };
  cooldown?: number;                // Minutes between uses
  effects?: {
    health?: number;                // HP restoration
    energy?: number;                // Energy restoration
    removePoison?: boolean;
    removeCurse?: boolean;
    buffDuration?: number;          // Minutes
    buffEffect?: string;            // Buff ID
  };
  items?: Array<{
    itemId: string;
    quantity: number;
    chance: number;
  }>;
}

/**
 * Quest offered by Chinese NPC
 */
export interface ChineseQuest {
  id: string;
  name: string;
  description: string;
  backstory: string;                // Cultural/historical context
  minTrustLevel: number;
  objectives: Array<{
    type: 'deliver' | 'find' | 'protect' | 'retrieve' | 'speak';
    target: string;
    quantity?: number;
    location?: string;
  }>;
  rewards: {
    gold?: number;
    xp?: number;
    items?: string[];
    trustIncrease?: number;         // Trust points gained
    networkAccess?: string[];       // New NPCs revealed
  };
  timeLimit?: number;               // Hours to complete
  failureConsequences?: {
    trustDecrease?: number;
    bannedFrom?: string[];          // NPC IDs
  };
}

/**
 * Dialogue tree for Chinese NPC
 */
export interface ChineseDialogue {
  greeting: {
    outsider: string[];             // Trust level 0
    acquaintance: string[];         // Trust level 1
    friend: string[];               // Trust level 2
    brotherSister: string[];        // Trust level 3
    family: string[];               // Trust level 4
  };
  coverStory: string[];             // What they say to outsiders
  suspicion: string[];              // When not trusted
  trust: string[];                  // When trusted
  farewell: string[];
  questHints?: string[];            // Hints about available quests
  networkReferences?: string[];     // Mentions of other NPCs
}

/**
 * Chinese NPC with full network integration
 */
export interface ChineseNPC {
  id: string;
  name: string;                     // Western name
  chineseName: string;              // Chinese name (Pinyin)
  chineseCharacters?: string;       // Chinese characters (for flavor)
  coverRole: string;                // Apparent occupation
  hiddenRole: string;               // True network role
  location: string;                 // Location ID
  description: string;              // Physical description
  personality: string;              // Personality traits
  backstory: string;                // Migration story
  networkRole: ChineseNetworkRole;

  // Trust system
  trustLevels: ChineseTrustLevel[];
  defaultTrust: number;             // Starting trust level

  // Services and quests
  services: ChineseService[];
  quests: ChineseQuest[];

  // Dialogue
  dialogue: ChineseDialogue;

  // Discovery
  discoveryMethod: DiscoveryMethod;
  discoveryCondition?: {
    questRequired?: string;
    npcReferral?: string;           // Must meet this NPC first
    minReputation?: number;
    itemRequired?: string;
    locationVisits?: number;        // Times visited location
  };

  // Network connections
  networkConnections: {
    trusts: string[];               // NPC IDs they trust
    distrusts: string[];            // NPC IDs they distrust
    canRefer: string[];             // NPCs they can introduce you to
    family?: string[];              // Family member NPC IDs
  };

  // Schedule
  schedule?: Array<{
    hour: number;                   // 0-23
    location?: string;              // If different from main location
    available: boolean;             // Can interact?
    activity: string;               // What they're doing
  }>;

  // Cultural items
  culturalNotes?: string[];         // Historical/cultural context
}

/**
 * Player's relationship with the Chinese network
 */
export interface ChineseNetworkReputation {
  playerId: string;
  overallTrust: number;             // 0-100 (affects all interactions)
  npcTrust: Map<string, number>;    // Individual NPC trust levels
  questsCompleted: string[];
  questsFailed: string[];
  goldSpent: number;
  firstContact?: Date;
  bannedFrom: string[];             // NPC IDs player is banned from
  discoveries: string[];            // NPC IDs discovered
  networkTier: number;              // 0-4 (unlocks deeper network)
}

/**
 * Chinese items and goods
 */
export interface ChineseItem {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  category: 'medicine' | 'tea' | 'silk' | 'tool' | 'weapon' | 'explosive' | 'ingredient';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  effects?: {
    health?: number;
    energy?: number;
    duration?: number;
    buffType?: string;
  };
  source: 'import' | 'crafted' | 'found';
  culturalSignificance?: string;
}

/**
 * Network quest chain
 */
export interface NetworkQuestChain {
  id: string;
  name: string;
  description: string;
  requiredTrustTier: number;
  quests: string[];                 // Quest IDs in order
  finalReward: {
    gold?: number;
    xp?: number;
    items?: string[];
    trustBonus?: number;
    title?: string;                 // Honorary title
    networkAccess?: string[];       // Unlocked areas/NPCs
  };
}

/**
 * ============================================================================
 * REPUTATION SYSTEM (Phase 5, Wave 5.1)
 * ============================================================================
 * Separate, hidden reputation system for Chinese Diaspora discovery and trust
 */

/**
 * Trust levels with Chinese naming (5 levels total)
 */
export enum DiasporaTrustLevel {
  OUTSIDER = 1,      // 外人 (Wài Rén) - 0-99 rep
  FRIEND = 2,        // 朋友 (Péng Yǒu) - 100-299 rep
  SIBLING = 3,       // 兄弟/姐妹 (Xiōng Dì/Jiě Mèi) - 300-599 rep
  FAMILY = 4,        // 家人 (Jiā Rén) - 600-899 rep
  DRAGON = 5         // 龙 (Lóng) - 900+ rep
}

/**
 * Network standing - overall relationship status
 */
export enum NetworkStanding {
  UNKNOWN = 'unknown',         // Haven't discovered network yet
  SUSPICIOUS = 'suspicious',   // Did something questionable
  NEUTRAL = 'neutral',         // Recently discovered
  TRUSTED = 'trusted',         // Proven trustworthy
  HONORED = 'honored',         // Highly respected
  EXILED = 'exiled'           // Betrayed the network (permanent)
}

/**
 * Discovery methods for the network
 */
export enum DiscoveryMethodRep {
  WONG_CHEN = 'wong_chen',                    // Found the traveling merchant
  HELPED_NPC = 'helped_npc',                  // Helped Chinese NPC unprompted
  VOUCHED_FOR = 'vouched_for',                // Another character vouched for you
  QUEST_CHAIN = 'quest_chain',                // Followed quest hints
  WITNESSED_VIOLENCE = 'witnessed_violence'   // Witnessed anti-Chinese violence, helped
}

/**
 * Available services based on trust level
 */
export enum DiasporaService {
  // Level 2 (Friend)
  HERBAL_MEDICINE = 'herbal_medicine',
  TRADITIONAL_HEALING = 'traditional_healing',
  INFORMATION_TRADING = 'information_trading',

  // Level 3 (Sibling)
  SAFE_PASSAGE = 'safe_passage',
  MESSAGE_RELAY = 'message_relay',
  HIDDEN_CACHE = 'hidden_cache',
  EXPLOSIVES_KNOWLEDGE = 'explosives_knowledge',
  POISON_CRAFTING = 'poison_crafting',

  // Level 4 (Family)
  SAFE_HOUSE = 'safe_house',
  UNDERGROUND_RAILROAD = 'underground_railroad',
  MARTIAL_ARTS_BASIC = 'martial_arts_basic',
  RARE_WEAPONS = 'rare_weapons',
  INTELLIGENCE_NETWORK = 'intelligence_network',

  // Level 5 (Dragon)
  WONG_LI_MENTORSHIP = 'wong_li_mentorship',
  DRAGONS_BREATH = 'dragons_breath',
  NETWORK_MOBILIZATION = 'network_mobilization',
  PERMANENT_SAFE_HOUSE = 'permanent_safe_house',
  LEGENDARY_SILK_ARMOR = 'legendary_silk_armor',
  ANCIENT_SCROLLS = 'ancient_scrolls'
}

/**
 * Trust level configuration with Chinese names
 */
export interface TrustLevelConfig {
  level: DiasporaTrustLevel;
  nameEnglish: string;
  nameChinese: string;
  namePinyin: string;
  minRep: number;
  maxRep: number;
  description: string;
  services: DiasporaService[];
}

/**
 * Trust level configurations
 */
export const TRUST_LEVELS: Record<DiasporaTrustLevel, TrustLevelConfig> = {
  [DiasporaTrustLevel.OUTSIDER]: {
    level: DiasporaTrustLevel.OUTSIDER,
    nameEnglish: 'Outsider',
    nameChinese: '外人',
    namePinyin: 'Wài Rén',
    minRep: 0,
    maxRep: 99,
    description: 'Just discovered network exists. Can access basic laundry/restaurant services.',
    services: []
  },
  [DiasporaTrustLevel.FRIEND]: {
    level: DiasporaTrustLevel.FRIEND,
    nameEnglish: 'Friend',
    nameChinese: '朋友',
    namePinyin: 'Péng Yǒu',
    minRep: 100,
    maxRep: 299,
    description: 'Have helped the community. Access to herbal medicines and limited information.',
    services: [
      DiasporaService.HERBAL_MEDICINE,
      DiasporaService.TRADITIONAL_HEALING,
      DiasporaService.INFORMATION_TRADING
    ]
  },
  [DiasporaTrustLevel.SIBLING]: {
    level: DiasporaTrustLevel.SIBLING,
    nameEnglish: 'Brother/Sister',
    nameChinese: '兄弟/姐妹',
    namePinyin: 'Xiōng Dì/Jiě Mèi',
    minRep: 300,
    maxRep: 599,
    description: 'Proven trustworthy. Network actively helps you with hidden services.',
    services: [
      DiasporaService.HERBAL_MEDICINE,
      DiasporaService.TRADITIONAL_HEALING,
      DiasporaService.INFORMATION_TRADING,
      DiasporaService.SAFE_PASSAGE,
      DiasporaService.MESSAGE_RELAY,
      DiasporaService.HIDDEN_CACHE,
      DiasporaService.EXPLOSIVES_KNOWLEDGE,
      DiasporaService.POISON_CRAFTING
    ]
  },
  [DiasporaTrustLevel.FAMILY]: {
    level: DiasporaTrustLevel.FAMILY,
    nameEnglish: 'Family',
    nameChinese: '家人',
    namePinyin: 'Jiā Rén',
    minRep: 600,
    maxRep: 899,
    description: 'Considered part of the community. Full network access and martial training.',
    services: [
      DiasporaService.HERBAL_MEDICINE,
      DiasporaService.TRADITIONAL_HEALING,
      DiasporaService.INFORMATION_TRADING,
      DiasporaService.SAFE_PASSAGE,
      DiasporaService.MESSAGE_RELAY,
      DiasporaService.HIDDEN_CACHE,
      DiasporaService.EXPLOSIVES_KNOWLEDGE,
      DiasporaService.POISON_CRAFTING,
      DiasporaService.SAFE_HOUSE,
      DiasporaService.UNDERGROUND_RAILROAD,
      DiasporaService.MARTIAL_ARTS_BASIC,
      DiasporaService.RARE_WEAPONS,
      DiasporaService.INTELLIGENCE_NETWORK
    ]
  },
  [DiasporaTrustLevel.DRAGON]: {
    level: DiasporaTrustLevel.DRAGON,
    nameEnglish: 'Dragon',
    nameChinese: '龙',
    namePinyin: 'Lóng',
    minRep: 900,
    maxRep: 1000,
    description: 'Highest honor. The community will sacrifice to help you.',
    services: [
      DiasporaService.HERBAL_MEDICINE,
      DiasporaService.TRADITIONAL_HEALING,
      DiasporaService.INFORMATION_TRADING,
      DiasporaService.SAFE_PASSAGE,
      DiasporaService.MESSAGE_RELAY,
      DiasporaService.HIDDEN_CACHE,
      DiasporaService.EXPLOSIVES_KNOWLEDGE,
      DiasporaService.POISON_CRAFTING,
      DiasporaService.SAFE_HOUSE,
      DiasporaService.UNDERGROUND_RAILROAD,
      DiasporaService.MARTIAL_ARTS_BASIC,
      DiasporaService.RARE_WEAPONS,
      DiasporaService.INTELLIGENCE_NETWORK,
      DiasporaService.WONG_LI_MENTORSHIP,
      DiasporaService.DRAGONS_BREATH,
      DiasporaService.NETWORK_MOBILIZATION,
      DiasporaService.PERMANENT_SAFE_HOUSE,
      DiasporaService.LEGENDARY_SILK_ARMOR,
      DiasporaService.ANCIENT_SCROLLS
    ]
  }
};

/**
 * Reputation gain/loss actions
 */
export enum DiasporaReputationAction {
  // Gains
  COMPLETE_QUEST = 'complete_quest',
  PROTECT_NPC = 'protect_npc',
  KEEP_SECRET = 'keep_secret',
  DONATE = 'donate',
  UNDERGROUND_RAILROAD_HELP = 'underground_railroad_help',
  LEARN_CUSTOMS = 'learn_customs',
  REFUSE_BRIBE = 'refuse_bribe',

  // Losses
  BETRAY_SECRET = 'betray_secret',
  HARM_NPC = 'harm_npc',
  WORK_WITH_EXCLUSION = 'work_with_exclusion',
  REVEAL_SAFE_HOUSE = 'reveal_safe_house',
  STEAL = 'steal',
  DISRESPECT_CUSTOMS = 'disrespect_customs'
}

/**
 * Reputation change amounts
 */
export const REPUTATION_CHANGES: Record<DiasporaReputationAction, number> = {
  // Gains
  [DiasporaReputationAction.COMPLETE_QUEST]: 30,
  [DiasporaReputationAction.PROTECT_NPC]: 50,
  [DiasporaReputationAction.KEEP_SECRET]: 5,
  [DiasporaReputationAction.DONATE]: 20,
  [DiasporaReputationAction.UNDERGROUND_RAILROAD_HELP]: 75,
  [DiasporaReputationAction.LEARN_CUSTOMS]: 15,
  [DiasporaReputationAction.REFUSE_BRIBE]: 50,

  // Losses
  [DiasporaReputationAction.BETRAY_SECRET]: -300,
  [DiasporaReputationAction.HARM_NPC]: -200,
  [DiasporaReputationAction.WORK_WITH_EXCLUSION]: -300,
  [DiasporaReputationAction.REVEAL_SAFE_HOUSE]: -500,
  [DiasporaReputationAction.STEAL]: -150,
  [DiasporaReputationAction.DISRESPECT_CUSTOMS]: -35
};

/**
 * Safe house protection duration by trust level (in hours)
 */
export const SAFE_HOUSE_DURATION: Record<DiasporaTrustLevel, number> = {
  [DiasporaTrustLevel.OUTSIDER]: 0,
  [DiasporaTrustLevel.FRIEND]: 0,
  [DiasporaTrustLevel.SIBLING]: 0,
  [DiasporaTrustLevel.FAMILY]: 6,
  [DiasporaTrustLevel.DRAGON]: 24
};

/**
 * Network NPC revelation by trust level
 */
export const NPC_REVELATION: Record<DiasporaTrustLevel, number> = {
  [DiasporaTrustLevel.OUTSIDER]: 1,  // Just the one who introduced you
  [DiasporaTrustLevel.FRIEND]: 3,    // Learn of 1-2 other contacts
  [DiasporaTrustLevel.SIBLING]: 8,   // Learn of local network hub
  [DiasporaTrustLevel.FAMILY]: 20,   // Learn full local network
  [DiasporaTrustLevel.DRAGON]: 50    // Know entire territory network
};
