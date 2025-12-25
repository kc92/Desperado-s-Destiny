/**
 * Legends of the West Types - Phase 19.5
 *
 * Type definitions for:
 * - Ghost Town Exploration system
 * - Artifact Hunting system
 * - Reputation Prestige system
 * - Legendary Bounty Board system
 * - Faction Representatives
 */

// =============================================================================
// MORAL CHOICE TYPES (Phase 19.5)
// =============================================================================

/**
 * Moral choice option definition
 */
export interface IMoralChoiceOption {
  id: string;
  label: string;
  description: string;
  requirements?: {
    skill?: string;
    skillLevel?: number;
    item?: string;
    reputation?: {
      faction: string;
      minimum: number;
    };
  };
  consequences: {
    bossModifier?: number;        // Power multiplier (0.5 = 50%, 1.3 = 130%)
    factionChange?: {
      faction: string;
      amount: number;
      duration?: number;          // Days, undefined = permanent
    }[];
    reward?: {
      gold?: number;
      item?: string;
      title?: string;
    };
    debuff?: {
      id: string;
      duration: number;           // Hours
    };
    unlocks?: string[];           // Quest IDs, vendor IDs, etc.
    specialEffect?: string;       // Custom effect ID
  };
}

/**
 * Moral choice definition for quest encounters
 */
export interface IMoralChoice {
  id: string;
  name: string;
  description: string;
  context: string;                // Narrative context for the choice
  options: IMoralChoiceOption[];
  defaultOption?: string;         // Option selected on timeout
  timeLimit?: number;             // Seconds to decide, undefined = no limit
}

/**
 * Player's moral choice record
 */
export interface IMoralChoiceRecord {
  characterId: string;
  choiceId: string;
  selectedOption: string;
  selectedAt: Date;
  consequencesApplied: boolean;
  location: string;
  questId?: string;
}

/**
 * Ghost Town moral choices registry
 */
export const GHOST_TOWN_MORAL_CHOICES: Record<string, IMoralChoice> = {
  foremans_legacy: {
    id: 'foremans_legacy',
    name: "The Foreman's Legacy",
    description: 'Evidence reveals Foreman Blackwood was covering up the mining company\'s negligence.',
    context: 'The company ledger shows cut safety costs. The foreman\'s journal shows his desperate pleas ignored.',
    options: [
      {
        id: 'expose_truth',
        label: 'Expose the Truth',
        description: 'Reveal the company\'s negligence and clear Blackwood\'s name.',
        consequences: {
          bossModifier: 0, // Peaceful resolution
          factionChange: [{ faction: 'settler', amount: -30, duration: 7 }],
          reward: { title: 'Whistleblower' },
          specialEffect: 'mining_contract_bonus', // +15% mining contracts
        },
      },
      {
        id: 'take_bribe',
        label: 'Take the Bribe',
        description: 'Accept gold to bury the evidence.',
        consequences: {
          bossModifier: 1.0, // Full power fight
          reward: { gold: 5000 },
          factionChange: [
            { faction: 'settler', amount: 20 },
            { faction: 'nahi', amount: -10 },
          ],
        },
      },
      {
        id: 'let_rest',
        label: 'Let the Dead Rest',
        description: 'Leave the past buried with the miners.',
        consequences: {
          bossModifier: 0.7, // 70% power fight
        },
      },
    ],
  },
  wild_bills_wager: {
    id: 'wild_bills_wager',
    name: "Wild Bill's Wager",
    description: 'Wild Bill can be freed by combat OR by beating him at poker.',
    context: 'Winning poker means someone takes his place in the eternal game.',
    options: [
      {
        id: 'play_hand',
        label: 'Play the Hand',
        description: 'Challenge Wild Bill to a poker duel.',
        consequences: {
          specialEffect: 'poker_duel_mechanic',
          debuff: { id: 'dead_mans_hand', duration: 24 },
          unlocks: ['ancestor_ally:wild_bill'],
          reward: { title: 'Dead Man\'s Hand' },
        },
      },
      {
        id: 'destroy_echo',
        label: 'Destroy the Echo',
        description: 'Standard combat to destroy Wild Bill.',
        consequences: {
          bossModifier: 1.0,
          debuff: { id: 'touched_by_gold', duration: 168 }, // 7 days on future visits
        },
      },
      {
        id: 'walk_away',
        label: 'Walk Away',
        description: 'Leave Deadwood\'s Shadow for now.',
        consequences: {
          debuff: { id: 'cowards_mark', duration: 168 }, // -20% damage in ghost towns
          specialEffect: 'half_rewards',
        },
      },
    ],
  },
  hollows_reckoning: {
    id: 'hollows_reckoning',
    name: "The Hollow's Reckoning",
    description: 'The Avenger shows your character\'s worst deed.',
    context: 'Face your guilt and choose how to resolve it.',
    options: [
      {
        id: 'seek_redemption',
        label: 'Seek Redemption',
        description: 'Sacrifice an Epic+ item to prove your change of heart.',
        requirements: { item: 'any_epic_or_better' },
        consequences: {
          bossModifier: 0.5, // 50% power
          factionChange: [{ faction: 'nahi', amount: 10 }], // Permanent
          unlocks: ['hidden_treasure:wraths_hollow'],
        },
      },
      {
        id: 'embrace_destruction',
        label: 'Embrace Destruction',
        description: 'Fight with full fury.',
        consequences: {
          bossModifier: 1.0,
          specialEffect: 'boss_enrage',
          factionChange: [{ faction: 'nahi', amount: -15 }],
          debuff: { id: 'consumed_by_rage', duration: 168 }, // +25% dmg, -10% def
        },
      },
      {
        id: 'offer_trade',
        label: 'Offer a Trade',
        description: 'Negotiate with the spirits using cunning.',
        requirements: { skill: 'cunning', skillLevel: 50 },
        consequences: {
          specialEffect: 'spirit_arbiter_quest',
          reward: { title: 'Spirit Arbiter' },
        },
      },
    ],
  },
  priests_absolution: {
    id: 'priests_absolution',
    name: "The Priest's Absolution",
    description: 'Father Maldonado was bound by the Conquistador against his will.',
    context: 'His soul yearns for freedom. How will you resolve his fate?',
    options: [
      {
        id: 'grant_absolution',
        label: 'Grant Absolution',
        description: 'Use holy items to free his soul.',
        requirements: { item: 'holy_item' }, // san-muerte-rosary or the-first-bible
        consequences: {
          specialEffect: 'priest_ally_final_boss',
          unlocks: ['vendor:holy_vendor_san_muerte'],
        },
      },
      {
        id: 'seal_darkness',
        label: 'Seal the Darkness',
        description: 'Trap the priest forever to weaken the Conquistador.',
        consequences: {
          specialEffect: 'final_boss_easier',
          reward: { item: 'seal_of_san_muerte' },
          unlocks: ['location_locked:san_muerte'], // Permanently inaccessible
        },
      },
      {
        id: 'destroy_corrupted',
        label: 'Destroy the Corrupted',
        description: 'Fight both priest AND Conquistador at full power.',
        consequences: {
          specialEffect: 'dual_boss_fight',
          factionChange: [
            { faction: 'settler', amount: -10 },
            { faction: 'nahi', amount: -10 },
            { faction: 'frontera', amount: -10 },
          ],
        },
      },
    ],
  },
};

/**
 * Artifact Hunting moral choices registry
 */
export const ARTIFACT_MORAL_CHOICES: Record<string, IMoralChoice> = {
  cursed_collector: {
    id: 'cursed_collector',
    name: 'The Cursed Collector',
    description: 'The artifact collector reveals he plans to sell cursed items to dangerous buyers.',
    context: 'The collector wants to sell The Noose and Forever-Loaded Gun to a Settler mining baron - the same family that caused the Prosperity disaster.',
    options: [
      {
        id: 'destroy_artifacts',
        label: 'Destroy the Artifacts',
        description: 'Shatter the cursed items and end their dark influence forever.',
        consequences: {
          specialEffect: 'cursed_items_destroyed',
          factionChange: [{ faction: 'nahi', amount: 15 }],
          reward: { title: 'Curse Breaker' },
        },
      },
      {
        id: 'take_for_self',
        label: 'Take for Yourself',
        description: 'Keep the cursed artifacts for your own use.',
        consequences: {
          factionChange: [{ faction: 'nahi', amount: -10 }],
          debuff: { id: 'touched_by_darkness', duration: -1 }, // Permanent: triggers on death
          specialEffect: 'cursed_items_equipped',
        },
      },
      {
        id: 'expose_collector',
        label: 'Expose the Collector',
        description: 'Turn the collector in to the authorities.',
        consequences: {
          factionChange: [{ faction: 'settler', amount: 10 }],
          specialEffect: 'collector_becomes_enemy',
          unlocks: ['bounty:cursed_collector'],
        },
      },
    ],
  },
};

/**
 * Legendary Bounty moral choices registry
 */
export const BOUNTY_MORAL_CHOICES: Record<string, IMoralChoice> = {
  outlaws_code: {
    id: 'outlaws_code',
    name: "The Outlaw's Code",
    description: 'Jesse James waits in his canyon hideout. How will you resolve this bounty?',
    context: 'Jesse is neither fully ghost nor fully alive - sustained by the power of his own legend.',
    options: [
      {
        id: 'bring_to_justice',
        label: 'Bring to Justice',
        description: 'Fight Jesse and collect the full bounty.',
        consequences: {
          bossModifier: 1.0,
          factionChange: [{ faction: 'settler', amount: 25 }],
          reward: { gold: 500, title: 'Lawman' },
        },
      },
      {
        id: 'join_the_ride',
        label: 'Join the Ride',
        description: 'Become part of Jesse\'s new gang.',
        consequences: {
          factionChange: [
            { faction: 'settler', amount: -30 },
            { faction: 'frontera', amount: 20 },
          ],
          specialEffect: 'robbery_skill_unlock',
          unlocks: ['gang_invite:james_gang'],
        },
      },
      {
        id: 'fake_the_death',
        label: 'Fake the Death',
        description: 'Help Jesse disappear in exchange for ongoing information.',
        requirements: { skill: 'cunning', skillLevel: 40 },
        consequences: {
          specialEffect: 'jesse_informant_contact',
          reward: { gold: 100 }, // Recurring monthly gold
          unlocks: ['contact:jesse_james_informant'],
        },
      },
    ],
  },
  the_final_hand: {
    id: 'the_final_hand',
    name: 'The Final Hand',
    description: 'Doc Holliday sits at his poker table, offering you a choice.',
    context: 'Doc is dying again - tuberculosis never left him, even in death. He has wisdom to share.',
    options: [
      {
        id: 'beat_at_cards',
        label: 'Beat at Cards',
        description: 'Challenge Doc to a high-stakes poker showdown.',
        consequences: {
          specialEffect: 'high_stakes_showdown_mechanic',
          factionChange: [{ faction: 'frontera', amount: 15 }],
          reward: { item: 'docs-legendary-deck' },
        },
      },
      {
        id: 'fight_to_death',
        label: 'Fight to the Death',
        description: 'Draw on a dying man for the bounty.',
        consequences: {
          bossModifier: 1.0,
          factionChange: [
            { faction: 'settler', amount: -10 },
            { faction: 'nahi', amount: -10 },
            { faction: 'frontera', amount: -10 },
          ],
          reward: { item: 'docs-guns' },
        },
      },
      {
        id: 'offer_mercy',
        label: 'Offer Mercy',
        description: 'Let Doc live out his remaining days in peace.',
        consequences: {
          factionChange: [
            { faction: 'settler', amount: 20 },
            { faction: 'nahi', amount: 20 },
            { faction: 'frontera', amount: 20 },
          ],
          reward: { title: 'Merciful' },
          unlocks: ['ally:doc_holliday_saloon'],
          specialEffect: 'doc_healing_ally',
        },
      },
    ],
  },
  wronged_spirit: {
    id: 'wronged_spirit',
    name: 'The Wronged Spirit',
    description: 'Rising Moon, the Ghost Rider, was a victim seeking justice for atrocities.',
    context: 'His village was massacred. He died seeking revenge. His remains were disturbed, preventing rest.',
    options: [
      {
        id: 'grant_peace',
        label: 'Grant Peace',
        description: 'Help Rising Moon find rest through a proper burial.',
        consequences: {
          factionChange: [{ faction: 'nahi', amount: 35 }],
          debuff: { id: 'ancestral_blessing', duration: -1 }, // Permanent buff
          unlocks: ['location:sacred_ground_rising_moon'],
        },
      },
      {
        id: 'destroy_spirit',
        label: 'Destroy Spirit',
        description: 'Put down the ghost by force.',
        consequences: {
          bossModifier: 1.0,
          debuff: { id: 'haunted', duration: 336 }, // 14 days - random encounters
        },
      },
      {
        id: 'become_the_voice',
        label: 'Become the Voice',
        description: 'Channel Rising Moon\'s spirit, becoming his avatar.',
        requirements: { skill: 'spirit', skillLevel: 60 },
        consequences: {
          specialEffect: 'spirit_avatar_transformation',
          reward: { title: 'Spirit Champion' },
          unlocks: ['path:nahi_faction_leader'],
        },
      },
    ],
  },
};

// =============================================================================
// GHOST TOWN EXPLORATION TYPES
// =============================================================================

/**
 * Ghost town size/complexity tier
 */
export enum GhostTownTier {
  MEDIUM = 'medium',       // Single area, basic hazards, 1 loot table
  MAJOR = 'major',         // Multiple areas, unique mechanics, boss, 2+ quests
}

/**
 * Ghost town theme/origin
 */
export enum GhostTownTheme {
  DISASTER = 'disaster',     // Mine collapse, fire, etc.
  SIN = 'sin',               // Greed, wrath, etc. - cursed
  HISTORICAL = 'historical', // Based on real Western ghost towns
  COLONIAL = 'colonial',     // Spanish mission, conquistador
}

/**
 * Hazard types in ghost towns
 */
export enum GhostTownHazard {
  STRUCTURAL = 'structural',   // Collapsing buildings, unstable ground
  ENVIRONMENTAL = 'environmental', // Gas, dust, water
  SUPERNATURAL = 'supernatural',   // Spirits, curses
  TRAP = 'trap',               // Left by previous inhabitants
  MADNESS = 'madness',         // Sanity-affecting
}

/**
 * Ghost town area state
 */
export enum GhostTownAreaState {
  UNEXPLORED = 'unexplored',
  PARTIALLY_EXPLORED = 'partially_explored',
  EXPLORED = 'explored',
  CLEARED = 'cleared',       // All threats eliminated
  LOCKED = 'locked',         // Requires key/item
}

/**
 * Hazard definition
 */
export interface IGhostTownHazardDef {
  id: string;
  type: GhostTownHazard;
  name: string;
  description: string;
  damagePerTurn?: number;
  duration?: number;         // Turns, -1 = permanent
  statusEffect?: string;
  counterplay?: string;      // How to avoid/mitigate
  counterplaySkill?: string; // Skill that helps
  counterplayThreshold?: number; // Skill level needed
}

/**
 * Area within a ghost town
 */
export interface IGhostTownArea {
  id: string;
  name: string;
  description: string;
  state: GhostTownAreaState;
  hazards: IGhostTownHazardDef[];
  lootTable: string[];       // Item IDs available
  hasMiniBoss?: boolean;
  miniBossId?: string;
  requiredKey?: string;      // Item needed to access
  connectedAreas: string[];  // Adjacent area IDs
  supernaturalLevel: number; // 0-100, affects spawn rates
}

/**
 * Ghost town definition
 */
export interface IGhostTown {
  id: string;
  name: string;
  description: string;
  backstory: string;
  tier: GhostTownTier;
  theme: GhostTownTheme;
  levelRange: {
    min: number;
    max: number;
  };

  // Location
  parentLocation: string;
  mapCoordinates?: {
    x: number;
    y: number;
  };

  // Structure
  areas: IGhostTownArea[];
  entryAreaId: string;

  // Unique mechanics
  uniqueMechanic?: {
    id: string;
    name: string;
    description: string;
    rules: string;
  };

  // Content
  questIds: string[];
  miniBossIds: string[];
  artifactIds?: string[];    // Artifacts found here

  // Rewards
  completionRewards: {
    gold: number;
    xp: number;
    items?: string[];
    title?: string;
  };

  // Discovery
  discoveryMethod: 'quest' | 'exploration' | 'rumor' | 'artifact';
  discoveryQuestId?: string;
}

/**
 * Player's ghost town exploration progress
 */
export interface IGhostTownProgress {
  characterId: string;
  townId: string;
  discovered: boolean;
  discoveredAt?: Date;

  // Area progress
  areaStates: Record<string, GhostTownAreaState>;
  hazardsEncountered: string[];

  // Completion
  completionPercent: number;
  miniBossesDefeated: string[];
  artifactsFound: string[];
  secretsDiscovered: number;
  totalSecrets: number;

  // Stats
  visitCount: number;
  deathCount: number;
  lootCollected: string[];

  firstExploredAt?: Date;
  lastExploredAt?: Date;
  completedAt?: Date;
}

// =============================================================================
// ARTIFACT HUNTING TYPES
// =============================================================================

/**
 * Artifact category
 */
export enum ArtifactCategory {
  OUTLAW_LEGEND = 'outlaw_legend',     // Famous outlaw gear
  CURSED_OBJECT = 'cursed_object',     // Dark power items
  NATIVE_RELIC = 'native_relic',       // Spiritual items
  COLONIAL = 'colonial',               // Spanish/Mexican era
}

/**
 * Artifact rarity/power tier
 */
export enum ArtifactTier {
  NOTABLE = 'notable',       // Minor historical significance
  LEGENDARY = 'legendary',   // Major historical significance
  MYTHIC = 'mythic',         // Supernatural power
}

/**
 * Artifact fragment (for multi-part artifacts)
 */
export interface IArtifactFragment {
  id: string;
  name: string;
  description: string;
  sourceLocation: string;
  sourceMethod: 'quest' | 'boss' | 'exploration' | 'purchase';
  sourceId?: string;         // Quest/boss/location ID
}

/**
 * Artifact definition
 */
export interface IArtifact {
  id: string;
  name: string;
  title: string;             // e.g., "The Fastest Draw"
  description: string;
  lore: string;              // Historical/fictional backstory

  category: ArtifactCategory;
  tier: ArtifactTier;

  // Associated item
  itemId: string;            // Links to actual equipment item

  // Acquisition
  fragments?: IArtifactFragment[]; // If assembled from pieces
  acquisitionMethod: 'single' | 'fragmented' | 'quest_chain';
  questChainId?: string;

  // Location hints
  locationHints: string[];
  discoveredLocations?: string[]; // Revealed after finding hints

  // Set bonus (if part of collection)
  setId?: string;
  setPosition?: number;

  // Effects when owned (passive)
  passiveEffects?: {
    stat: string;
    value: number;
    description: string;
  }[];

  // Visual
  iconUrl?: string;
  displayInMuseum: boolean;  // Can be displayed in player's collection
}

/**
 * Artifact set definition
 */
export interface IArtifactSet {
  id: string;
  name: string;
  description: string;
  category: ArtifactCategory;

  artifacts: string[];       // Artifact IDs in set

  // Set bonuses at different completion levels
  bonuses: Array<{
    requiredCount: number;
    effects: {
      stat: string;
      value: number;
      description: string;
    }[];
  }>;

  // Full set completion
  completionTitle?: string;
  completionReward?: {
    gold: number;
    xp: number;
    item?: string;
  };
}

/**
 * Player's artifact collection progress
 */
export interface IArtifactCollectionProgress {
  characterId: string;

  // Discovered artifacts (know they exist)
  discovered: string[];
  discoveredAt: Record<string, Date>;

  // Owned artifacts
  owned: string[];
  acquiredAt: Record<string, Date>;

  // Fragment progress
  fragments: Record<string, string[]>; // artifactId -> fragmentIds owned

  // Set progress
  setProgress: Record<string, number>; // setId -> count owned
  completedSets: string[];

  // Display preferences
  displayedArtifacts: string[]; // Which to show in museum
}

// =============================================================================
// REPUTATION PRESTIGE TYPES
// =============================================================================

/**
 * Prestige tier for Marshal path
 */
export enum MarshalPrestigeTier {
  DEPUTY = 'deputy',                   // 30-59
  MARSHAL = 'marshal',                 // 60-79
  LEGENDARY_MARSHAL = 'legendary_marshal', // 80-99
  THE_LAW = 'the_law',                 // 100 (ultimate)
}

/**
 * Prestige tier for Outlaw path
 */
export enum OutlawPrestigeTier {
  PETTY_CROOK = 'petty_crook',         // -30 to -59
  WANTED = 'wanted',                   // -60 to -79
  NOTORIOUS = 'notorious',             // -80 to -99
  THE_LEGEND = 'the_legend',           // -100 (ultimate)
}

/**
 * Prestige ability definition
 */
export interface IPrestigeAbility {
  id: string;
  name: string;
  description: string;
  tier: MarshalPrestigeTier | OutlawPrestigeTier;

  type: 'passive' | 'active' | 'toggle';

  // Passive effects
  passiveEffects?: {
    stat: string;
    value: number;
  }[];

  // Active ability
  cooldown?: number;         // Minutes
  energyCost?: number;
  duration?: number;         // Turns/seconds

  // Requirements
  levelRequired?: number;
  questRequired?: string;
}

/**
 * Prestige tier definition
 */
export interface IPrestigeTierDef {
  tier: MarshalPrestigeTier | OutlawPrestigeTier;
  name: string;
  description: string;
  icon: string;

  reputationRange: {
    min: number;
    max: number;
  };

  abilities: IPrestigeAbility[];

  // Unlocks
  unlockedFeatures: string[];
  unlockedQuests: string[];

  // Cosmetics
  titlePrefix?: string;
  titleSuffix?: string;
  exclusiveCosmetics: string[];
}

/**
 * Player's prestige status
 */
export interface IPrestigeStatus {
  characterId: string;

  path: 'marshal' | 'outlaw' | 'neutral';
  currentTier: MarshalPrestigeTier | OutlawPrestigeTier | null;

  // Ultimate title status
  hasUltimateTitle: boolean;
  ultimateTitleEarnedAt?: Date;
  ultimateQuestCompleted: boolean;

  // Ability unlock tracking
  unlockedAbilities: string[];
  activeAbilities: string[];      // Currently slotted
  abilityCooldowns: Record<string, Date>;

  // Epilogue quest progress
  epilogueQuestStarted: boolean;
  epilogueQuestCompleted: boolean;
}

// =============================================================================
// LEGENDARY BOUNTY BOARD TYPES
// =============================================================================

/**
 * Legendary bounty phase
 */
export enum LegendaryBountyPhase {
  INVESTIGATION = 'investigation',
  TRACKING = 'tracking',
  CONFRONTATION = 'confrontation',
}

/**
 * Bounty clue/evidence type
 */
export enum BountyClueType {
  WITNESS = 'witness',
  PHYSICAL_EVIDENCE = 'physical_evidence',
  DOCUMENT = 'document',
  RUMOR = 'rumor',
  TRAIL = 'trail',
}

/**
 * Bounty clue definition
 */
export interface IBountyClue {
  id: string;
  type: BountyClueType;
  name: string;
  description: string;
  locationId: string;
  npcId?: string;            // If from an NPC
  skillRequired?: string;    // Skill to discover
  skillThreshold?: number;

  pointValue: number;        // Contributes to phase completion
  revealedAt?: Date;
}

/**
 * Legendary bounty definition
 */
export interface ILegendaryBounty {
  id: string;
  targetName: string;
  targetTitle: string;
  description: string;
  backstory: string;

  tier: 'rare' | 'epic' | 'legendary';
  levelRequired: number;

  // Access requirements
  reputationRequired?: {
    type: 'marshal' | 'outlaw';
    minimum: number;
  };
  prerequisiteQuests?: string[];
  prerequisiteBounties?: string[];

  // Cooperation
  requiresCooperation: boolean;
  factionRepresentatives?: string[]; // Faction IDs that send help

  // Investigation phase
  investigation: {
    requiredClues: number;
    totalClues: number;
    clues: IBountyClue[];
    rewards: {
      gold: number;
      xp: number;
    };
  };

  // Tracking phase
  tracking: {
    trackingLocations: string[];
    trackingSkillRequired: string;
    trackingDifficulty: number;
    timeLimitMinutes?: number;
    rewards: {
      gold: number;
      xp: number;
    };
  };

  // Confrontation phase
  confrontation: {
    bossId: string;
    location: string;
    canCapture: boolean;     // Non-lethal option
    canRecruit: boolean;     // Some targets become allies
    rewards: {
      gold: number;
      xp: number;
      items: string[];
    };
  };

  // Total rewards
  totalGoldReward: number;
  totalXpReward: number;

  // Outcomes
  outcomes: {
    kill: {
      description: string;
      rewards: string[];
    };
    capture?: {
      description: string;
      rewards: string[];
    };
    recruit?: {
      description: string;
      rewards: string[];
      unlocks: string[];     // What recruiting unlocks
    };
  };
}

/**
 * Player's legendary bounty progress
 */
export interface ILegendaryBountyProgress {
  characterId: string;
  bountyId: string;

  // Status
  accepted: boolean;
  acceptedAt?: Date;
  currentPhase: LegendaryBountyPhase;

  // Investigation progress
  cluesFound: string[];
  cluePoints: number;
  investigationComplete: boolean;

  // Tracking progress
  tracksFollowed: number;
  locationsPursued: string[];
  trackingComplete: boolean;
  trackingStartedAt?: Date;

  // Confrontation
  confrontationAttempts: number;
  confrontationComplete: boolean;
  outcome?: 'kill' | 'capture' | 'recruit' | 'escaped';

  // Faction helpers used
  factionHelpUsed: string[];

  completedAt?: Date;
  rewardsCollected: boolean;
}

// =============================================================================
// FACTION REPRESENTATIVE TYPES
// =============================================================================

/**
 * Faction representative/champion
 */
export interface IFactionRepresentative {
  id: string;
  name: string;
  title: string;
  faction: string;           // Faction ID

  description: string;
  backstory: string;

  // Combat role
  role: 'dps' | 'tank' | 'support' | 'specialist';
  specialization: string;    // e.g., "Rifle Specialist"

  // Stats (when assisting)
  level: number;
  health: number;
  damage: number;
  defense: number;

  // Abilities they bring
  abilities: Array<{
    id: string;
    name: string;
    description: string;
    type: 'damage' | 'buff' | 'debuff' | 'heal' | 'utility';
    cooldown: number;
  }>;

  // Summoning requirements
  summonCost: {
    gold?: number;
    factionReputation?: number;
    questRequired?: string;
  };

  // Dialogue
  greetingDialogue: string;
  combatDialogue: string[];
  victoryDialogue: string;
  defeatDialogue: string;

  // Visual
  portraitUrl?: string;
}

/**
 * Active faction representative session
 */
export interface IFactionRepresentativeSession {
  characterId: string;
  representativeId: string;

  // Current state
  health: number;
  maxHealth: number;

  // Ability usage
  abilityCooldowns: Record<string, Date>;

  // Session info
  summonedAt: Date;
  bountyId?: string;         // If summoned for a bounty
  bossId?: string;           // If summoned for a boss

  // Performance
  damageDealt: number;
  healingDone: number;
  abilitiesUsed: number;
}

// =============================================================================
// API TYPES
// =============================================================================

// Ghost Town API
export interface IExploreGhostTownRequest {
  townId: string;
  areaId: string;
}

export interface IExploreGhostTownResponse {
  success: boolean;
  exploration?: {
    areaState: GhostTownAreaState;
    hazardsEncountered: IGhostTownHazardDef[];
    lootFound: string[];
    secretFound: boolean;
    miniBossTriggered: boolean;
  };
  progress?: IGhostTownProgress;
  error?: string;
}

// Artifact API
export interface IGetArtifactsRequest {
  category?: ArtifactCategory;
  owned?: boolean;
}

export interface IGetArtifactsResponse {
  success: boolean;
  artifacts: IArtifact[];
  progress: IArtifactCollectionProgress;
}

// Legendary Bounty API
export interface IAcceptLegendaryBountyRequest {
  bountyId: string;
}

export interface IAcceptLegendaryBountyResponse {
  success: boolean;
  bounty?: ILegendaryBounty;
  progress?: ILegendaryBountyProgress;
  error?: string;
}

export interface ISummonRepresentativeRequest {
  representativeId: string;
  bountyId?: string;
  bossId?: string;
}

export interface ISummonRepresentativeResponse {
  success: boolean;
  representative?: IFactionRepresentative;
  session?: IFactionRepresentativeSession;
  error?: string;
}

// Prestige API
export interface IGetPrestigeStatusResponse {
  success: boolean;
  status: IPrestigeStatus;
  currentTierDef?: IPrestigeTierDef;
  nextTierDef?: IPrestigeTierDef;
  progressToNext: number;    // 0-100%
}

export interface IActivatePrestigeAbilityRequest {
  abilityId: string;
  targetId?: string;
}

export interface IActivatePrestigeAbilityResponse {
  success: boolean;
  ability?: IPrestigeAbility;
  cooldownEnds?: Date;
  effects?: string[];
  error?: string;
}
