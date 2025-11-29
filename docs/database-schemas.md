# DESPERADOS DESTINY - DATABASE SCHEMAS
## MongoDB Collection Specifications

**Version:** 1.0
**Last Updated:** November 15, 2025
**Status:** Phase 0.75 - Foundation Planning

---

## OVERVIEW

This document defines all MongoDB collections, field specifications, indexes, and relationships for Desperados Destiny. These schemas support the MVP scope defined in the Game Design Document.

**Database:** `desperados_destiny`
**MongoDB Version:** 6.x+
**Driver:** Node.js MongoDB Driver 5.x or Mongoose 7.x

---

## COLLECTIONS INDEX

1. [users](#1-users-collection) - User accounts and authentication
2. [characters](#2-characters-collection) - Player characters and core stats
3. [skills](#3-skills-collection) - Character skill levels and training
4. [gangs](#4-gangs-collection) - Gang/posse organizations
5. [territories](#5-territories-collection) - Territory control and resources
6. [combat_logs](#6-combat_logs-collection) - Combat history and results
7. [transactions](#7-transactions-collection) - Economic transactions and audit trail
8. [chat_messages](#8-chat_messages-collection) - Real-time chat history
9. [items](#9-items-collection) - Player inventory and equipment
10. [quests](#10-quests-collection) - Active and completed quests
11. [sessions](#11-sessions-collection) - Active user sessions (Redis primary, MongoDB backup)
12. [admin_logs](#12-admin_logs-collection) - Administrative actions audit trail

---

## 1. USERS COLLECTION

**Collection Name:** `users`
**Purpose:** User accounts, authentication, email verification, premium status

### Schema

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  email: String,                    // Unique, lowercase, required
  emailVerified: Boolean,           // Email verification status
  emailVerificationToken: String,   // Hashed verification token
  emailVerificationExpires: Date,   // Token expiration
  passwordHash: String,             // bcrypt hash (12+ rounds)
  twoFactorEnabled: Boolean,        // 2FA opt-in status
  twoFactorSecret: String,          // Encrypted TOTP secret
  twoFactorBackupCodes: [String],   // Encrypted backup codes

  // Account Status
  accountStatus: String,            // 'active' | 'suspended' | 'banned' | 'deleted'
  suspensionReason: String,         // Admin notes if suspended/banned
  suspensionExpires: Date,          // Temporary ban expiration

  // Premium & Monetization
  premiumTier: String,              // 'free' | 'premium'
  premiumExpires: Date,             // Premium subscription end date
  stripeCustomerId: String,         // Stripe customer ID
  subscriptionId: String,           // Active Stripe subscription ID

  // Account Metadata
  createdAt: Date,                  // Account creation timestamp
  lastLogin: Date,                  // Last successful login
  ipAddresses: [String],            // Last 10 login IPs (fraud detection)
  failedLoginAttempts: Number,      // Rate limiting counter
  lastFailedLogin: Date,            // Lockout timing

  // GDPR & Privacy
  gdprConsentDate: Date,            // Terms acceptance timestamp
  marketingConsent: Boolean,        // Email marketing opt-in
  dataRetentionUntil: Date,         // Soft delete scheduled date (if requested)
  deletionRequested: Boolean,       // User requested account deletion
  deletionRequestDate: Date,        // When deletion was requested

  // Security
  securityQuestions: [{             // Optional password recovery
    question: String,
    answerHash: String              // bcrypt hashed answer
  }],

  // Referral & Social
  referredBy: ObjectId,             // User who referred this account (ref: users)
  referralCode: String,             // This user's unique referral code
}
```

### Indexes

```javascript
// Primary indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ referralCode: 1 }, { unique: true, sparse: true })

// Query optimization
db.users.createIndex({ accountStatus: 1, premiumTier: 1 })
db.users.createIndex({ stripeCustomerId: 1 }, { sparse: true })
db.users.createIndex({ emailVerificationToken: 1 }, { sparse: true, expireAfterSeconds: 86400 })

// Cleanup automation
db.users.createIndex({ dataRetentionUntil: 1 }, { sparse: true, expireAfterSeconds: 0 })
```

### Validation Rules

- `email`: Must match regex `/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/`, max 255 chars
- `passwordHash`: Required, min 60 chars (bcrypt output)
- `accountStatus`: Enum validation
- `premiumTier`: Enum validation ('free', 'premium')
- `failedLoginAttempts`: Default 0, max 10

### Relationships

- `referredBy` → users._id (optional)
- Links to characters collection (one-to-one)

---

## 2. CHARACTERS COLLECTION

**Collection Name:** `characters`
**Purpose:** Player character data, stats, faction, location, energy/fatigue

### Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // ref: users._id (unique)

  // Character Identity
  name: String,                     // Globally unique, 3-20 chars
  faction: String,                  // 'settler' | 'nahi' | 'frontera'
  avatar: String,                   // URL or asset reference
  bio: String,                      // Player-written bio (max 1000 chars)
  title: String,                    // Earned or purchased title

  // Core Stats
  level: Number,                    // Character level (1-100)
  experience: Number,               // Total XP earned
  reputation: {                     // Faction standing
    settler: Number,                // -1000 to +1000
    nahi: Number,
    frontera: Number
  },

  // Energy & Fatigue System
  energy: {
    current: Number,                // Current energy pool
    max: Number,                    // Base max (150 free, 250 premium)
    baseRegen: Number,              // Per-hour regen (5 free, 8 premium)
    lastRegen: Date,                // Last regeneration tick
    fatigueLevel: Number,           // 0-100 (affects regen speed)
    fatigueRecoveryRate: Number     // Modified by skills
  },

  // Location & Status
  currentLocation: String,          // 'red_gulch' | 'frontera' | 'kaiowa_mesa' | 'sangre_canyon'
  inHospital: Boolean,              // Hospital recovery status
  hospitalUntil: Date,              // Hospital release time
  hospitalReason: String,           // What put them in hospital
  inJail: Boolean,                  // Incarceration status
  jailUntil: Date,                  // Release time
  jailLocation: String,             // Which jail

  // Combat Stats
  health: {
    current: Number,                // Current HP (0 = hospital)
    max: Number                     // Base 100, modified by skills
  },
  combatStats: {                    // Derived from skills, cached for performance
    clubsBonus: Number,             // Combat suit bonus
    spadesBonus: Number,            // Cunning suit bonus
    heartsBonus: Number,            // Spirit suit bonus
    diamondsBonus: Number           // Craft suit bonus
  },

  // Inventory & Economy
  goldDollars: Number,              // Primary currency
  inventorySlots: Number,           // Total inventory capacity
  equipmentSlots: {                 // Currently equipped items
    weapon: ObjectId,               // ref: items._id
    armor: ObjectId,
    accessory1: ObjectId,
    accessory2: ObjectId,
    horse: ObjectId
  },

  // Gang Membership
  gangId: ObjectId,                 // ref: gangs._id (null if no gang)
  gangRank: String,                 // 'member' | 'officer' | 'leader'
  gangJoinDate: Date,

  // Property & Assets (Post-MVP)
  propertyIds: [ObjectId],          // ref: properties._id (future feature)

  // Statistics & Achievements
  stats: {
    duelsWon: Number,
    duelsLost: Number,
    crimesSucceeded: Number,
    crimesFailed: Number,
    totalDamageDealt: Number,
    totalDamageTaken: Number,
    territoriesCaptured: Number,
    questsCompleted: Number,
    itemsCrafted: Number,
    spiritEncounters: Number
  },

  // Tutorial & Onboarding
  tutorialProgress: {
    completed: Boolean,
    currentStep: Number,            // 0-10 (tutorial stages)
    skipped: Boolean
  },

  // Skill Training State
  activeTraining: {                 // Only one skill trains at a time
    skillId: String,                // Skill identifier
    startedAt: Date,
    completesAt: Date,
    targetLevel: Number
  },

  // Respec System
  freeRespecsRemaining: Number,     // Default 1
  paidRespecsUsed: Number,
  lastRespecDate: Date,

  // Timestamps
  createdAt: Date,
  lastActive: Date,                 // For activity tracking
  lastDailyReset: Date              // Daily quest/bonus tracking
}
```

### Indexes

```javascript
// Primary indexes
db.characters.createIndex({ userId: 1 }, { unique: true })
db.characters.createIndex({ name: 1 }, { unique: true })

// Query optimization
db.characters.createIndex({ faction: 1, level: -1 })
db.characters.createIndex({ gangId: 1, gangRank: 1 })
db.characters.createIndex({ currentLocation: 1 })
db.characters.createIndex({ lastActive: -1 })

// Leaderboards
db.characters.createIndex({ level: -1, experience: -1 })
db.characters.createIndex({ 'stats.duelsWon': -1 })
db.characters.createIndex({ goldDollars: -1 })

// Hospital/Jail queries
db.characters.createIndex({ inHospital: 1, hospitalUntil: 1 })
db.characters.createIndex({ inJail: 1, jailUntil: 1 })

// Training queries
db.characters.createIndex({ 'activeTraining.completesAt': 1 }, { sparse: true })
```

### Validation Rules

- `name`: Unique, 3-20 chars, alphanumeric + spaces/hyphens only
- `faction`: Enum ('settler', 'nahi', 'frontera')
- `level`: Min 1, max 100
- `energy.current`: Min 0, max = energy.max
- `health.current`: Min 0, max = health.max
- `goldDollars`: Min 0
- `gangRank`: Enum ('member', 'officer', 'leader') if gangId present

### Relationships

- `userId` → users._id (required, unique)
- `gangId` → gangs._id (optional)
- `equipmentSlots.*` → items._id (optional)
- `activeTraining.skillId` → skills.skillId (optional)

---

## 3. SKILLS COLLECTION

**Collection Name:** `skills`
**Purpose:** Character skill levels and progression

### Schema

```javascript
{
  _id: ObjectId,
  characterId: ObjectId,            // ref: characters._id

  // Skill identifier and level
  skillId: String,                  // e.g. 'gun_fighting', 'lockpicking'
  skillName: String,                // Display name
  skillCategory: String,            // 'combat' | 'criminal' | 'craft' | 'social' | 'supernatural'
  level: Number,                    // 1-100
  experience: Number,               // Current XP in this skill

  // Progression tracking
  trainingHistory: [{
    startedAt: Date,
    completedAt: Date,
    fromLevel: Number,
    toLevel: Number
  }],

  // Metadata
  lastTrained: Date,
  totalTrainingTime: Number         // Total seconds spent training (for analytics)
}
```

### Indexes

```javascript
db.skills.createIndex({ characterId: 1, skillId: 1 }, { unique: true })
db.skills.createIndex({ characterId: 1, level: -1 })
db.skills.createIndex({ skillId: 1, level: -1 }) // Leaderboards per skill
```

### Validation Rules

- `skillId`: Must match valid skill from skill definitions
- `level`: Min 1, max 100
- `experience`: Min 0

### Relationships

- `characterId` → characters._id (required)

### Notes

Each character will have 20-25 skill documents (one per skill in the game). Skills start at level 1 with 0 XP.

**Skill Bonus Formula** (cached in characters.combatStats):
```
Bonus = (level - 1) * 0.75 + (level - 1)^1.1 * 0.05
```

---

## 4. GANGS COLLECTION

**Collection Name:** `gangs`
**Purpose:** Gang/posse organizations, membership, resources

### Schema

```javascript
{
  _id: ObjectId,

  // Gang Identity
  name: String,                     // Unique, 3-30 chars
  tag: String,                      // Unique, 2-5 chars (e.g., [GUNS])
  faction: String,                  // 'settler' | 'nahi' | 'frontera'
  description: String,              // Gang bio (max 2000 chars)
  banner: String,                   // URL or asset reference
  recruitmentOpen: Boolean,         // Accepting new members

  // Leadership
  leaderId: ObjectId,               // ref: characters._id
  officers: [ObjectId],             // ref: characters._id (max 3-5)

  // Membership
  memberCount: Number,              // Cached count (15-25 range)
  memberLimit: Number,              // Max members (25)

  // Resources
  vault: {
    goldDollars: Number,            // Shared gang treasury
    items: [{
      itemId: ObjectId,             // ref: items._id
      quantity: Number
    }]
  },

  // Territory Control
  controlledTerritories: [String],  // Array of territory IDs

  // War & Conflict
  atWarWith: [ObjectId],            // ref: gangs._id
  warHistory: [{
    opponentId: ObjectId,
    startedAt: Date,
    endedAt: Date,
    winner: ObjectId,               // Winning gang ID
    territoriesLost: [String],
    territoriesGained: [String]
  }],

  // Statistics
  stats: {
    totalWars: Number,
    warsWon: Number,
    warsLost: Number,
    territoriesConquered: Number,
    totalWealth: Number,            // Vault + member combined wealth
    averageMemberLevel: Number
  },

  // Gang Perks (Post-MVP expansion)
  perks: [String],                  // e.g., ['vault_expansion', 'territory_defense_bonus']

  // Timestamps
  createdAt: Date,
  lastActive: Date                  // Most recent member activity
}
```

### Indexes

```javascript
db.gangs.createIndex({ name: 1 }, { unique: true })
db.gangs.createIndex({ tag: 1 }, { unique: true })
db.gangs.createIndex({ faction: 1, memberCount: -1 })
db.gangs.createIndex({ leaderId: 1 })
db.gangs.createIndex({ 'stats.totalWealth': -1 }) // Richest gangs
db.gangs.createIndex({ lastActive: -1 })
```

### Validation Rules

- `name`: Unique, 3-30 chars
- `tag`: Unique, 2-5 chars, uppercase alphanumeric
- `faction`: Enum ('settler', 'nahi', 'frontera')
- `memberCount`: Min 1, max 25
- `memberLimit`: Default 25

### Relationships

- `leaderId` → characters._id (required)
- `officers[]` → characters._id
- `atWarWith[]` → gangs._id
- `vault.items[].itemId` → items._id

---

## 5. TERRITORIES COLLECTION

**Collection Name:** `territories`
**Purpose:** Territory ownership, resource generation, control status

### Schema

```javascript
{
  _id: ObjectId,

  // Territory Identity
  territoryId: String,              // Unique identifier (e.g., 'silver_mine_01')
  name: String,                     // Display name
  location: String,                 // Parent region ('red_gulch', 'sangre_canyon', etc.)
  territoryType: String,            // 'mine' | 'trading_post' | 'sacred_site' | 'outlaw_camp'

  // Control Status
  controlledBy: ObjectId,           // ref: gangs._id (null if neutral)
  previousOwner: ObjectId,          // ref: gangs._id
  capturedAt: Date,
  controlStrength: Number,          // 0-100 (defense rating)

  // Resource Generation
  resources: {
    goldPerDay: Number,             // Daily gold generation
    itemDrops: [{                   // Random item spawns
      itemType: String,
      dropChance: Number            // 0-1 probability
    }]
  },

  // Strategic Value
  strategicValue: Number,           // 1-10 importance rating
  defenseBonus: Number,             // Combat bonus for defenders
  adjacentTerritories: [String],    // Connected territory IDs (for expansion mechanics)

  // Combat History
  recentBattles: [{
    attackerId: ObjectId,           // ref: gangs._id
    defenderId: ObjectId,
    timestamp: Date,
    winner: ObjectId,
    participantCount: Number
  }],

  // Timestamps
  createdAt: Date,
  lastBattle: Date
}
```

### Indexes

```javascript
db.territories.createIndex({ territoryId: 1 }, { unique: true })
db.territories.createIndex({ controlledBy: 1 })
db.territories.createIndex({ location: 1, controlledBy: 1 })
db.territories.createIndex({ strategicValue: -1 })
```

### Validation Rules

- `territoryId`: Unique, lowercase_underscore format
- `territoryType`: Enum ('mine', 'trading_post', 'sacred_site', 'outlaw_camp')
- `controlStrength`: Min 0, max 100
- `strategicValue`: Min 1, max 10

### Relationships

- `controlledBy` → gangs._id (optional)
- `previousOwner` → gangs._id (optional)
- `recentBattles[].attackerId` → gangs._id
- `recentBattles[].defenderId` → gangs._id

---

## 6. COMBAT_LOGS COLLECTION

**Collection Name:** `combat_logs`
**Purpose:** Combat history, Destiny Deck results, damage calculations

### Schema

```javascript
{
  _id: ObjectId,

  // Combat Metadata
  combatType: String,               // 'duel' | 'gang_war' | 'territory_attack' | 'bounty_hunt'
  timestamp: Date,
  location: String,

  // Participants
  attacker: {
    characterId: ObjectId,          // ref: characters._id
    gangId: ObjectId,               // ref: gangs._id (if gang combat)
    initialHealth: Number,
    finalHealth: Number
  },
  defender: {
    characterId: ObjectId,
    gangId: ObjectId,
    initialHealth: Number,
    finalHealth: Number
  },

  // Destiny Deck Resolution
  destinyDeck: {
    attackerHand: [String],         // e.g., ['A♠', 'K♠', '7♣', '3♥', '3♦']
    defenderHand: [String],
    attackerHandRank: String,       // 'pair' | 'flush' | 'straight' | etc.
    defenderHandRank: String,
    attackerSuitBonuses: {
      clubs: Number,
      spades: Number,
      hearts: Number,
      diamonds: Number
    },
    defenderSuitBonuses: {
      clubs: Number,
      spades: Number,
      hearts: Number,
      diamonds: Number
    },
    attackerTotalScore: Number,
    defenderTotalScore: Number
  },

  // Combat Outcome
  winner: ObjectId,                 // ref: characters._id
  loser: ObjectId,
  damageDealt: Number,
  experienceGained: {
    winner: Number,
    loser: Number
  },
  lootTransferred: {
    goldDollars: Number,
    items: [ObjectId]               // ref: items._id
  },

  // Consequences
  loserToHospital: Boolean,
  hospitalDuration: Number,         // Minutes
  reputationChanges: {
    attackerChange: Number,
    defenderChange: Number
  },

  // Flags
  pvp: Boolean,                     // True if both players human
  gangInvolved: Boolean
}
```

### Indexes

```javascript
db.combat_logs.createIndex({ timestamp: -1 })
db.combat_logs.createIndex({ 'attacker.characterId': 1, timestamp: -1 })
db.combat_logs.createIndex({ 'defender.characterId': 1, timestamp: -1 })
db.combat_logs.createIndex({ combatType: 1, timestamp: -1 })
db.combat_logs.createIndex({ winner: 1 })

// TTL index - delete logs older than 90 days
db.combat_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 })
```

### Validation Rules

- `combatType`: Enum ('duel', 'gang_war', 'territory_attack', 'bounty_hunt')
- `destinyDeck.attackerHand`: Must be array of 5 valid card strings
- `winner`: Must be either attacker.characterId or defender.characterId

### Relationships

- `attacker.characterId` → characters._id
- `defender.characterId` → characters._id
- `attacker.gangId` → gangs._id (optional)
- `defender.gangId` → gangs._id (optional)
- `winner` → characters._id
- `loser` → characters._id

---

## 7. TRANSACTIONS COLLECTION

**Collection Name:** `transactions`
**Purpose:** Economic transactions, audit trail, anti-cheat monitoring

### Schema

```javascript
{
  _id: ObjectId,

  // Transaction Metadata
  transactionType: String,          // 'shop_purchase' | 'player_trade' | 'gang_vault_deposit' | 'gang_vault_withdrawal' | 'quest_reward' | 'crime_earnings' | 'combat_loot' | 'premium_purchase'
  timestamp: Date,

  // Participants
  fromCharacterId: ObjectId,        // ref: characters._id (null if NPC/system)
  toCharacterId: ObjectId,          // ref: characters._id (null if NPC/system)
  fromGangId: ObjectId,             // ref: gangs._id (if gang involved)
  toGangId: ObjectId,

  // Currency Transfer
  goldDollars: Number,              // Amount transferred

  // Items Transfer
  items: [{
    itemId: ObjectId,               // ref: items._id
    quantity: Number
  }],

  // Context
  relatedEntity: {
    entityType: String,             // 'combat' | 'quest' | 'crime' | 'shop' | 'trade'
    entityId: ObjectId              // ref to relevant collection
  },
  description: String,              // Human-readable description

  // Premium Transactions (Stripe)
  stripePaymentIntentId: String,    // For real-money transactions
  premiumAmount: Number,            // USD amount (cents)

  // Anti-Cheat Flags
  flagged: Boolean,                 // Suspicious activity flag
  flagReason: String,
  reviewed: Boolean,
  reviewedBy: ObjectId,             // ref: admin user
  reviewedAt: Date
}
```

### Indexes

```javascript
db.transactions.createIndex({ timestamp: -1 })
db.transactions.createIndex({ fromCharacterId: 1, timestamp: -1 })
db.transactions.createIndex({ toCharacterId: 1, timestamp: -1 })
db.transactions.createIndex({ transactionType: 1, timestamp: -1 })
db.transactions.createIndex({ flagged: 1, reviewed: 1 })
db.transactions.createIndex({ stripePaymentIntentId: 1 }, { sparse: true })

// Archive old transactions after 1 year (optional, or keep forever for audit)
// db.transactions.createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 })
```

### Validation Rules

- `transactionType`: Enum (see schema)
- `goldDollars`: Min 0
- At least one of: `fromCharacterId`, `toCharacterId`, `fromGangId`, `toGangId` must be present

### Relationships

- `fromCharacterId` → characters._id (optional)
- `toCharacterId` → characters._id (optional)
- `fromGangId` → gangs._id (optional)
- `toGangId` → gangs._id (optional)
- `items[].itemId` → items._id

---

## 8. CHAT_MESSAGES COLLECTION

**Collection Name:** `chat_messages`
**Purpose:** Real-time chat history, moderation, reporting

### Schema

```javascript
{
  _id: ObjectId,

  // Message Metadata
  channel: String,                  // 'global' | 'faction_settler' | 'faction_nahi' | 'faction_frontera' | 'gang_{gangId}' | 'location_{locationId}'
  timestamp: Date,

  // Author
  authorId: ObjectId,               // ref: characters._id
  authorName: String,               // Cached for performance
  authorGangTag: String,            // Cached gang tag (if member)

  // Content
  message: String,                  // Max 500 chars
  messageType: String,              // 'normal' | 'system' | 'combat_announcement' | 'gang_announcement'

  // Moderation
  deleted: Boolean,
  deletedBy: ObjectId,              // ref: admin/mod character
  deletedReason: String,

  reported: Boolean,
  reportedBy: [ObjectId],           // Array of characters who reported
  reportReason: [String],

  // Metadata
  edited: Boolean,
  editedAt: Date
}
```

### Indexes

```javascript
db.chat_messages.createIndex({ channel: 1, timestamp: -1 })
db.chat_messages.createIndex({ authorId: 1, timestamp: -1 })
db.chat_messages.createIndex({ reported: 1, deleted: 1 })

// TTL index - delete messages older than 30 days
db.chat_messages.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 })
```

### Validation Rules

- `channel`: Must match valid channel pattern
- `message`: Max 500 chars, min 1 char
- `messageType`: Enum ('normal', 'system', 'combat_announcement', 'gang_announcement')

### Relationships

- `authorId` → characters._id
- `deletedBy` → characters._id or admin users
- `reportedBy[]` → characters._id

---

## 9. ITEMS COLLECTION

**Collection Name:** `items`
**Purpose:** Player inventory, equipment, consumables

### Schema

```javascript
{
  _id: ObjectId,

  // Ownership
  ownerId: ObjectId,                // ref: characters._id
  ownerType: String,                // 'character' | 'gang' (for vault items)

  // Item Definition
  itemTemplateId: String,           // e.g., 'colt_45', 'leather_vest', 'healing_tonic'
  itemName: String,                 // Display name
  itemType: String,                 // 'weapon' | 'armor' | 'consumable' | 'material' | 'quest_item' | 'horse'
  itemRarity: String,               // 'common' | 'uncommon' | 'rare' | 'legendary'

  // Stats & Effects
  stats: {
    damage: Number,                 // Weapon damage bonus
    defense: Number,                // Armor defense bonus
    clubsBonus: Number,             // Suit bonuses
    spadesBonus: Number,
    heartsBonus: Number,
    diamondsBonus: Number,
    energyBonus: Number,            // Energy pool increase
    fatigueReduction: Number        // Fatigue reduction %
  },

  // Durability (for weapons/armor)
  durability: {
    current: Number,                // 0-100
    max: Number                     // 100
  },

  // Stackable Items
  stackable: Boolean,
  quantity: Number,                 // For stackable items (ammo, materials, etc.)

  // Status
  equipped: Boolean,                // Currently equipped
  equippedSlot: String,             // 'weapon' | 'armor' | 'accessory1' | 'accessory2' | 'horse'

  // Trade Status
  tradeable: Boolean,               // Can be traded to other players
  sellValue: Number,                // Gold value if sold to NPC

  // Timestamps
  acquiredAt: Date,
  acquiredFrom: String              // 'shop' | 'craft' | 'loot' | 'quest' | 'trade'
}
```

### Indexes

```javascript
db.items.createIndex({ ownerId: 1, ownerType: 1 })
db.items.createIndex({ ownerId: 1, equipped: 1 })
db.items.createIndex({ itemTemplateId: 1 })
db.items.createIndex({ itemType: 1, itemRarity: 1 })
```

### Validation Rules

- `ownerType`: Enum ('character', 'gang')
- `itemType`: Enum ('weapon', 'armor', 'consumable', 'material', 'quest_item', 'horse')
- `itemRarity`: Enum ('common', 'uncommon', 'rare', 'legendary')
- `durability.current`: Min 0, max = durability.max
- `quantity`: Min 1 for stackable items

### Relationships

- `ownerId` → characters._id or gangs._id (depending on ownerType)

### Notes

Item templates (definitions) will be stored in a separate static configuration file or `item_templates` collection. This collection stores individual item instances owned by players.

---

## 10. QUESTS COLLECTION

**Collection Name:** `quests`
**Purpose:** Active and completed quests, progression tracking

### Schema

```javascript
{
  _id: ObjectId,

  // Quest Assignment
  characterId: ObjectId,            // ref: characters._id

  // Quest Definition
  questTemplateId: String,          // e.g., 'tutorial_first_duel', 'spirit_quest_coyote'
  questName: String,                // Display name
  questGiver: String,               // NPC name or 'system'
  questType: String,                // 'tutorial' | 'main_story' | 'side_quest' | 'daily' | 'spirit_quest' | 'bounty'

  // Progress Tracking
  status: String,                   // 'active' | 'completed' | 'failed' | 'abandoned'
  objectives: [{
    objectiveId: String,
    description: String,
    required: Number,               // Target count (e.g., "Kill 5 bandits")
    current: Number,                // Current progress
    completed: Boolean
  }],

  // Rewards
  rewards: {
    goldDollars: Number,
    experience: Number,
    items: [String],                // Array of itemTemplateIds
    reputationChanges: {
      settler: Number,
      nahi: Number,
      frontera: Number
    },
    unlocks: [String]               // Unlocked features/areas
  },
  rewardsClaimed: Boolean,

  // Timing
  startedAt: Date,
  completedAt: Date,
  expiresAt: Date,                  // For daily/timed quests (null if no expiry)

  // Context
  location: String,                 // Where quest was acquired
  repeatable: Boolean,              // Can be repeated (dailies)
  nextRepeatAvailable: Date         // For repeatable quests
}
```

### Indexes

```javascript
db.quests.createIndex({ characterId: 1, status: 1 })
db.quests.createIndex({ characterId: 1, questType: 1, status: 1 })
db.quests.createIndex({ expiresAt: 1 }, { sparse: true })
db.quests.createIndex({ nextRepeatAvailable: 1 }, { sparse: true })
```

### Validation Rules

- `status`: Enum ('active', 'completed', 'failed', 'abandoned')
- `questType`: Enum ('tutorial', 'main_story', 'side_quest', 'daily', 'spirit_quest', 'bounty')

### Relationships

- `characterId` → characters._id (required)

---

## 11. SESSIONS COLLECTION

**Collection Name:** `sessions`
**Purpose:** Active user sessions (MongoDB backup for Redis)

### Schema

```javascript
{
  _id: String,                      // Session token (UUID)

  userId: ObjectId,                 // ref: users._id
  characterId: ObjectId,            // ref: characters._id

  // Session Data
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  lastActivity: Date,
  expiresAt: Date,

  // Security
  csrfToken: String,
  twoFactorVerified: Boolean
}
```

### Indexes

```javascript
db.sessions.createIndex({ _id: 1 }, { unique: true })
db.sessions.createIndex({ userId: 1 })
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

### Notes

Sessions are primarily stored in **Redis** for speed. This collection serves as:
1. Backup if Redis fails
2. Session history for security auditing
3. Multi-device session management

---

## 12. ADMIN_LOGS COLLECTION

**Collection Name:** `admin_logs`
**Purpose:** Administrative actions audit trail

### Schema

```javascript
{
  _id: ObjectId,

  // Admin Action
  adminId: ObjectId,                // ref: users._id (admin account)
  action: String,                   // 'ban_user' | 'suspend_user' | 'delete_chat' | 'adjust_balance' | 'grant_premium' | etc.
  timestamp: Date,

  // Target
  targetType: String,               // 'user' | 'character' | 'gang' | 'chat_message' | 'transaction'
  targetId: ObjectId,

  // Details
  reason: String,                   // Admin's justification
  changedFields: Object,            // Before/after snapshot
  ipAddress: String,

  // Reversible Actions
  reversible: Boolean,
  reversed: Boolean,
  reversedBy: ObjectId,
  reversedAt: Date
}
```

### Indexes

```javascript
db.admin_logs.createIndex({ timestamp: -1 })
db.admin_logs.createIndex({ adminId: 1, timestamp: -1 })
db.admin_logs.createIndex({ targetType: 1, targetId: 1, timestamp: -1 })
db.admin_logs.createIndex({ action: 1, timestamp: -1 })
```

### Validation Rules

- `action`: Enum (extensive list of admin actions)
- `targetType`: Enum ('user', 'character', 'gang', 'chat_message', 'transaction')

### Relationships

- `adminId` → users._id
- `targetId` → Varies by targetType

---

## DATA RELATIONSHIPS DIAGRAM

```
users (1) ──────── (1) characters
                        │
                        ├─── (many) skills
                        ├─── (many) items
                        ├─── (many) quests
                        ├─── (many) combat_logs (as attacker/defender)
                        ├─── (many) transactions (as from/to)
                        ├─── (many) chat_messages (as author)
                        └─── (1) gangs (via gangId)

gangs (1) ──────── (many) characters (members)
      │
      ├─── (many) territories (via controlledBy)
      ├─── (many) items (in vault)
      └─── (many) combat_logs (gang wars)

territories (1) ── (1) gangs (controller)

sessions (many) ── (1) users
```

---

## MIGRATION STRATEGY

### Phase 1: Foundation (Week 1)
- Create `users`, `characters`, `sessions` collections
- Implement authentication and character creation

### Phase 2: Core Gameplay (Week 2-3)
- Create `skills`, `items`, `quests` collections
- Implement skill training and basic economy

### Phase 3: Social (Week 4)
- Create `gangs`, `chat_messages` collections
- Implement gang system and real-time chat

### Phase 4: Combat & Territory (Week 5-6)
- Create `combat_logs`, `territories`, `transactions` collections
- Implement Destiny Deck combat and territory wars

### Phase 5: Administration (Week 7)
- Create `admin_logs` collection
- Implement admin panel and moderation tools

---

## BACKUP & RETENTION POLICY

### Daily Backups
- Full MongoDB dump to encrypted cloud storage (AWS S3 / DigitalOcean Spaces)
- Retain daily backups for 30 days
- Weekly snapshot retained for 90 days
- Monthly snapshot retained for 1 year

### Critical Collections (Never Auto-Delete)
- `users` - GDPR compliant deletion only
- `characters` - Preserve unless user requests deletion
- `transactions` - Permanent audit trail
- `admin_logs` - Permanent audit trail

### Auto-Cleanup Collections (TTL Indexes)
- `chat_messages` - 30 days retention
- `combat_logs` - 90 days retention
- `sessions` - Expires per session timeout (24 hours default)
- `email verification tokens` - 24 hours

### GDPR Compliance
- User requests account deletion → soft delete with 30-day grace period
- After 30 days → hard delete from `users`, `characters`, `skills`, `items`, `quests`
- Preserve anonymized data in `transactions`, `combat_logs` (replace characterId with null, but keep aggregated stats)
- `admin_logs` preserved (but anonymize target user)

---

## ENCRYPTION REQUIREMENTS

### Encrypted Fields (Application-Level Encryption)
- `users.twoFactorSecret` - AES-256 encryption
- `users.twoFactorBackupCodes` - AES-256 encryption
- `users.securityQuestions[].answerHash` - bcrypt hashing (not reversible)

### Encrypted at Rest (Database Level)
- Enable MongoDB encryption at rest for entire database
- Use AWS KMS or DigitalOcean encryption keys

### Encrypted in Transit
- Require TLS 1.2+ for all MongoDB connections
- Certificate validation enforced

---

## PERFORMANCE CONSIDERATIONS

### Connection Pooling
```javascript
// MongoDB connection pool settings
{
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 30000,
  socketTimeoutMS: 45000
}
```

### Read Preferences
- User authentication: `primary` (must be consistent)
- Character data: `primaryPreferred` (consistency priority)
- Leaderboards: `secondary` (read-heavy, eventual consistency acceptable)
- Chat history: `secondaryPreferred` (read-heavy)

### Write Concerns
- Critical operations (purchases, combat results): `{ w: 'majority', j: true }` (journaled, majority acknowledgment)
- Non-critical (chat messages, logs): `{ w: 1 }` (single node acknowledgment)

### Sharding Strategy (Post-MVP Scaling)
- Shard key for `characters`: `{ _id: 'hashed' }` (evenly distributed)
- Shard key for `combat_logs`: `{ timestamp: 1 }` (time-series data)
- Shard key for `chat_messages`: `{ channel: 'hashed', timestamp: 1 }`

---

## VALIDATION & CONSTRAINTS

All schemas will be enforced with **Mongoose** or **MongoDB JSON Schema Validation**. Example:

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "passwordHash", "accountStatus"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
        },
        accountStatus: {
          enum: ["active", "suspended", "banned", "deleted"]
        }
      }
    }
  }
})
```

---

## NEXT STEPS

- [ ] Create Mongoose models based on these schemas
- [ ] Implement database seed scripts for test data
- [ ] Set up MongoDB replica set for production
- [ ] Configure automated backup pipeline
- [ ] Implement GDPR-compliant deletion procedures
- [ ] Create database migration scripts
- [ ] Set up monitoring for slow queries
- [ ] Implement connection pooling and optimization
- [ ] Document database maintenance procedures

---

**Document Status:** ✅ Complete
**Ready for Implementation:** Yes
**Next Phase:** API Specifications

*— Ezra "Hawk" Hawthorne*
*Database Architect*
*November 15, 2025*
