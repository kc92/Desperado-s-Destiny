# Desperados Destiny - Database Schema Reference

Complete reference for all MongoDB collections (Mongoose models).

**Database**: MongoDB with Replica Set
**ODM**: Mongoose 8.x
**Total Collections**: ~148 models

---

## Table of Contents

1. [Core Collections](#core-collections)
2. [Character & Progression](#character--progression)
3. [Combat & Encounters](#combat--encounters)
4. [Currency & Economy](#currency--economy)
5. [Gangs & Territory](#gangs--territory)
6. [Social Systems](#social-systems)
7. [World & Locations](#world--locations)
8. [Activities & Adventures](#activities--adventures)
9. [Properties & Production](#properties--production)
10. [Crime & Law](#crime--law)
11. [Special Systems](#special-systems)
12. [Session & Tracking](#session--tracking)

---

## Core Collections

### User
Primary user account.

```typescript
{
  _id: ObjectId,
  email: String (unique, indexed),
  username: String (unique, indexed),
  password: String (hashed),
  role: 'user' | 'admin' | 'moderator',
  status: 'active' | 'banned' | 'suspended',
  createdAt: Date,
  lastLogin: Date,
  settings: {
    notifications: Boolean,
    sound: Boolean,
    theme: String
  }
}
```
**Indexes**: `email`, `username`

### RefreshToken
JWT refresh token storage.

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  token: String (unique),
  expiresAt: Date,
  createdAt: Date
}
```
**Indexes**: `token`, `userId`, `expiresAt` (TTL)

---

## Character & Progression

### Character
Player character data.

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  name: String (unique, indexed),
  level: Number (default: 1),
  xp: Number (default: 0),

  // Currency
  dollars: Number (default: 0),
  gold: Number (default: 0),
  silver: Number (default: 0),

  // Stats
  health: Number,
  maxHealth: Number,
  energy: Number,
  maxEnergy: Number,

  // Background
  background: 'settler' | 'drifter' | 'outlaw' | 'native_scout',
  faction: String,

  // Location
  currentLocationId: ObjectId (ref: Location),

  // Skills (embedded)
  skills: Map<SkillId, {
    level: Number,
    xp: Number,
    specialization: String?
  }>,

  // Status
  isInCombat: Boolean,
  isInJail: Boolean,
  isDead: Boolean,
  gangId: ObjectId? (ref: Gang),

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastActive: Date
}
```
**Indexes**: `userId`, `name`, `gangId`, `currentLocationId`, `level`

### Achievement
Achievement definitions (static data).

```typescript
{
  _id: String (achievement code),
  name: String,
  description: String,
  category: String,
  tier: 'bronze' | 'silver' | 'gold' | 'legendary',
  requirements: Mixed,
  rewards: {
    gold: Number,
    xp: Number,
    items: [ObjectId]
  }
}
```

### CharacterAchievement
Character achievement progress.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, indexed),
  achievementId: String (ref: Achievement),
  progress: Number,
  completed: Boolean,
  claimedAt: Date?,
  unlockedAt: Date?
}
```
**Indexes**: `characterId`, `[characterId, achievementId]` (compound unique)

### LegacyProfile
Prestige/legacy progression.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, unique),
  prestigeRank: Number (0-5),
  prestigeCount: Number,
  bonuses: {
    xpBonus: Number,
    goldBonus: Number,
    skillCapBonus: Number,
    startingGold: Number
  },
  lastPrestigeAt: Date
}
```

### AccountUnlocks
Permanent account-wide unlocks.

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  unlocks: [String],
  purchasedAt: Map<String, Date>
}
```

---

## Combat & Encounters

### CombatEncounter
Active combat sessions.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, indexed),
  type: 'npc' | 'boss' | 'player' | 'world_boss',
  status: 'active' | 'victory' | 'defeat' | 'fled',

  // Participants
  player: {
    health: Number,
    cards: [Card],
    hand: [Card],
    abilities: Object
  },
  enemy: {
    npcId: String?,
    name: String,
    health: Number,
    maxHealth: Number,
    deck: [Card]
  },

  // State
  round: Number,
  turn: 'player' | 'enemy',

  // Rewards
  rewards: {
    xp: Number,
    gold: Number,
    items: [ObjectId]
  },

  createdAt: Date,
  expiresAt: Date
}
```
**Indexes**: `characterId`, `status`, `expiresAt` (TTL)

### BossEncounter
Multi-phase boss fights.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, indexed),
  bossId: String,
  status: 'active' | 'victory' | 'defeat',

  currentPhase: Number,
  totalPhases: Number,

  bossHealth: Number,
  bossMaxHealth: Number,

  activeEffects: [{
    type: String,
    stacks: Number,
    duration: Number
  }],

  minions: [{
    id: String,
    health: Number
  }],

  environmentalHazards: [String],

  createdAt: Date
}
```

### Duel
Player vs player duels.

```typescript
{
  _id: ObjectId,
  challengerId: ObjectId (ref: Character, indexed),
  defenderId: ObjectId (ref: Character, indexed),

  status: 'pending' | 'accepted' | 'active' | 'complete' | 'declined',
  winnerId: ObjectId?,

  wager: Number,

  // Real-time state (synced via Redis)
  phase: String,

  createdAt: Date,
  expiresAt: Date
}
```
**Indexes**: `challengerId`, `defenderId`, `status`

### DuelSession
Active duel WebSocket state.

```typescript
{
  _id: ObjectId,
  duelId: ObjectId (ref: Duel),
  state: Mixed, // Real-time game state
  lastHeartbeat: Date
}
```

### Tournament
Tournament events.

```typescript
{
  _id: ObjectId,
  name: String,
  type: 'individual' | 'gang',
  status: 'registration' | 'active' | 'complete',

  entryFee: Number,
  prizePool: Number,

  participants: [ObjectId],
  bracket: Mixed,

  startsAt: Date,
  endsAt: Date
}
```

### TournamentMatch
Individual tournament matches.

```typescript
{
  _id: ObjectId,
  tournamentId: ObjectId (ref: Tournament),
  round: Number,
  matchNumber: Number,

  player1Id: ObjectId,
  player2Id: ObjectId,
  winnerId: ObjectId?,

  status: 'pending' | 'active' | 'complete'
}
```

### WorldBossSession
World boss participation.

```typescript
{
  _id: ObjectId,
  bossId: String,
  characterId: ObjectId (ref: Character),

  damageDealt: Number,
  contributionPercent: Number,

  joinedAt: Date,
  lastAction: Date
}
```
**Indexes**: `bossId`, `characterId`

### LegendaryHunt
Legendary creature hunts.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, indexed),
  creatureId: String,

  discoveryStage: 'unknown' | 'rumored' | 'tracked' | 'located',
  cluesFound: [String],

  hunted: Boolean,
  defeatedAt: Date?,

  rewards: {
    trophy: Boolean,
    permanentBonus: Mixed
  }
}
```

### LegendaryCombatSession
Active legendary hunt combat.

```typescript
{
  _id: ObjectId,
  huntId: ObjectId (ref: LegendaryHunt),
  characterId: ObjectId,
  combatState: Mixed,
  createdAt: Date
}
```

---

## Currency & Economy

### GoldTransaction
Transaction audit log.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, indexed),

  type: 'earn' | 'spend' | 'transfer' | 'tax',
  currency: 'dollars' | 'gold' | 'silver',
  amount: Number,

  source: String,
  reference: ObjectId?,

  balanceBefore: Number,
  balanceAfter: Number,

  createdAt: Date
}
```
**Indexes**: `characterId`, `createdAt`, `type`

### MarketListing
Player marketplace listings.

```typescript
{
  _id: ObjectId,
  sellerId: ObjectId (ref: Character, indexed),

  itemId: ObjectId (ref: Item),
  quantity: Number,

  price: Number,
  isAuction: Boolean,

  bids: [{
    bidderId: ObjectId,
    amount: Number,
    at: Date
  }],

  status: 'active' | 'sold' | 'cancelled' | 'expired',

  expiresAt: Date,
  createdAt: Date
}
```
**Indexes**: `sellerId`, `status`, `expiresAt`

### PropertyLoan
Bank loans secured by property.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, indexed),
  propertyId: ObjectId (ref: Property),

  principal: Number,
  interestRate: Number,
  remainingBalance: Number,

  monthlyPayment: Number,
  paymentsRemaining: Number,

  status: 'active' | 'paid' | 'defaulted',

  createdAt: Date,
  nextPaymentDue: Date
}
```

### Investment
Investment product holdings.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, indexed),

  productType: String,
  principal: Number,
  interestRate: Number,

  purchasedAt: Date,
  maturesAt: Date,

  status: 'active' | 'matured' | 'redeemed'
}
```

### PriceHistory
Dynamic pricing history.

```typescript
{
  _id: ObjectId,
  itemId: String,
  locationId: ObjectId?,

  price: Number,
  supply: Number,
  demand: Number,

  recordedAt: Date
}
```
**Indexes**: `itemId`, `recordedAt`

### ResourceExchangeRate
Gold/Silver exchange rates.

```typescript
{
  _id: ObjectId,
  currency: 'gold' | 'silver',
  ratePerDollar: Number,
  effectiveAt: Date
}
```

---

## Gangs & Territory

### Gang
Gang organization.

```typescript
{
  _id: ObjectId,
  name: String (unique, indexed),
  tag: String (unique, 3-5 chars),

  leaderId: ObjectId (ref: Character),
  officers: [ObjectId],
  members: [ObjectId],

  level: Number,
  treasury: Number,

  reputation: Number,
  faction: String,

  baseId: ObjectId? (ref: GangBase),

  settings: {
    recruiting: Boolean,
    minLevel: Number
  },

  createdAt: Date
}
```
**Indexes**: `name`, `tag`, `leaderId`

### GangMember
Gang membership details.

```typescript
{
  _id: ObjectId,
  gangId: ObjectId (ref: Gang, indexed),
  characterId: ObjectId (ref: Character, indexed),

  role: 'leader' | 'officer' | 'enforcer' | 'member' | 'prospect',
  joinedAt: Date,

  contributions: {
    treasury: Number,
    wars: Number,
    territory: Number
  }
}
```
**Indexes**: `gangId`, `characterId` (unique compound)

### GangInvitation
Gang invites.

```typescript
{
  _id: ObjectId,
  gangId: ObjectId (ref: Gang),
  characterId: ObjectId (ref: Character),
  invitedBy: ObjectId,

  status: 'pending' | 'accepted' | 'declined' | 'expired',

  createdAt: Date,
  expiresAt: Date
}
```

### GangWar
Gang war events.

```typescript
{
  _id: ObjectId,
  attackerGangId: ObjectId (ref: Gang),
  defenderGangId: ObjectId (ref: Gang),

  status: 'declared' | 'active' | 'resolved',

  attackerScore: Number,
  defenderScore: Number,

  winnerId: ObjectId?,
  territoryStake: ObjectId?,

  startsAt: Date,
  endsAt: Date
}
```
**Indexes**: `attackerGangId`, `defenderGangId`, `status`

### GangWarSession
Active war battle state.

```typescript
{
  _id: ObjectId,
  warId: ObjectId (ref: GangWar),
  roundNumber: Number,
  battleState: Mixed,
  createdAt: Date
}
```

### GangBase
Gang headquarters.

```typescript
{
  _id: ObjectId,
  gangId: ObjectId (ref: Gang, unique),
  locationId: ObjectId (ref: Location),

  level: Number,
  upgrades: [String],

  defenses: Number,
  storage: Number,

  lastRaidedAt: Date?
}
```

### GangEconomy
Gang economic tracking.

```typescript
{
  _id: ObjectId,
  gangId: ObjectId (ref: Gang, unique),

  weeklyIncome: Number,
  weeklyExpenses: Number,

  businesses: [ObjectId],
  territories: [ObjectId],

  lastCalculatedAt: Date
}
```

### GangBankTransaction
Gang treasury transactions.

```typescript
{
  _id: ObjectId,
  gangId: ObjectId (ref: Gang, indexed),
  characterId: ObjectId?,

  type: 'deposit' | 'withdraw' | 'income' | 'expense',
  amount: Number,
  description: String,

  createdAt: Date
}
```

### GangBusiness
Gang-owned businesses.

```typescript
{
  _id: ObjectId,
  gangId: ObjectId (ref: Gang, indexed),
  businessType: String,
  locationId: ObjectId,

  level: Number,
  revenue: Number,

  lastCollectedAt: Date
}
```

### GangInvestment
Gang investment holdings.

```typescript
{
  _id: ObjectId,
  gangId: ObjectId (ref: Gang),
  investmentType: String,
  amount: Number,

  purchasedAt: Date,
  maturesAt: Date
}
```

### GangHeist
Gang heist operations.

```typescript
{
  _id: ObjectId,
  gangId: ObjectId (ref: Gang),
  heistType: String,

  participants: [ObjectId],
  roles: Map<ObjectId, String>,

  status: 'planning' | 'active' | 'success' | 'failed',

  loot: Mixed,

  createdAt: Date
}
```

### Territory
Territory zone data.

```typescript
{
  _id: ObjectId,
  name: String (indexed),
  zoneId: String (indexed),

  controllingGangId: ObjectId? (ref: Gang),
  controllingFaction: String?,

  influence: Map<ObjectId, Number>,

  bonuses: [String],
  resources: [String],

  dangerLevel: Number
}
```

### TerritoryZone
Territory zone definitions.

```typescript
{
  _id: ObjectId,
  zoneId: String (unique),
  name: String,
  regionId: String,

  type: String,
  size: 'small' | 'medium' | 'large',

  defaultBonuses: [String],
  maxInfluence: Number
}
```

### TerritoryInfluence
Faction influence tracking.

```typescript
{
  _id: ObjectId,
  territoryId: ObjectId (ref: Territory, indexed),
  factionId: String,

  influence: Number,

  lastDecay: Date,
  lastContribution: Date
}
```

### TerritoryConquestState
Active conquest/siege state.

```typescript
{
  _id: ObjectId,
  territoryId: ObjectId,
  attackerGangId: ObjectId,
  defenderGangId: ObjectId?,

  phase: 'challenge' | 'missions' | 'final_battle',
  progress: Number,

  startsAt: Date,
  expiresAt: Date
}
```

### ConquestAttempt
Conquest attempt records.

```typescript
{
  _id: ObjectId,
  territoryId: ObjectId,
  gangId: ObjectId,

  result: 'success' | 'failure',

  attemptedAt: Date
}
```

### InfluenceHistory
Historical influence tracking.

```typescript
{
  _id: ObjectId,
  territoryId: ObjectId,
  factionId: String,

  influenceChange: Number,
  reason: String,

  recordedAt: Date
}
```

### PlayerInfluenceContribution
Player influence contributions.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  territoryId: ObjectId,

  contribution: Number,
  activity: String,

  contributedAt: Date
}
```

### FactionWarEvent
Large-scale faction wars.

```typescript
{
  _id: ObjectId,
  name: String,

  eventType: 'skirmish' | 'battle' | 'campaign' | 'war',

  attackingFaction: String,
  defendingFaction: String,

  attackerScore: Number,
  defenderScore: Number,

  status: 'scheduled' | 'active' | 'resolution' | 'complete',
  currentPhase: String,

  objectives: [{
    id: String,
    type: String,
    target: Number,
    current: Number,
    completed: Boolean
  }],

  totalParticipants: Number,

  startsAt: Date,
  endsAt: Date
}
```
**Indexes**: `status`, `startsAt`

### WarParticipant
War participation tracking.

```typescript
{
  _id: ObjectId,
  warEventId: ObjectId (ref: FactionWarEvent),
  characterId: ObjectId (ref: Character),

  faction: String,

  combatScore: Number,
  objectiveScore: Number,
  supportScore: Number,
  totalScore: Number,

  mvpCandidate: Boolean,

  rewardsEarned: [Mixed],

  joinedAt: Date
}
```
**Indexes**: `warEventId`, `characterId`

### NPCGangRelationship
Relationship with NPC gangs.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),
  npcGangId: String,

  relationship: Number (-100 to 100),
  tributeStreak: Number,

  lastTributeAt: Date
}
```

### Raid
Raid operations.

```typescript
{
  _id: ObjectId,
  attackerGangId: ObjectId,
  targetType: 'property' | 'treasury' | 'influence' | 'production',
  targetId: ObjectId,

  participants: [ObjectId],

  status: 'planning' | 'active' | 'success' | 'failed',

  loot: Number,

  createdAt: Date
}
```

---

## Social Systems

### Friend
Friend relationships.

```typescript
{
  _id: ObjectId,
  requesterId: ObjectId (ref: Character),
  requesteeId: ObjectId (ref: Character),

  status: 'pending' | 'accepted' | 'blocked',

  createdAt: Date
}
```
**Indexes**: `[requesterId, requesteeId]` (compound unique)

### Mail
Player mail messages.

```typescript
{
  _id: ObjectId,
  senderId: ObjectId (ref: Character, indexed),
  recipientId: ObjectId (ref: Character, indexed),

  subject: String,
  body: String,

  isRead: Boolean,
  isDeleted: Boolean,

  attachments: [{
    type: 'gold' | 'item',
    value: Mixed
  }],

  sentAt: Date
}
```

### Message
Legacy message system (if used).

```typescript
{
  _id: ObjectId,
  channelId: String,
  authorId: ObjectId,

  content: String,

  createdAt: Date
}
```

### Notification
In-game notifications.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, indexed),

  type: String,
  title: String,
  message: String,

  isRead: Boolean,
  data: Mixed,

  createdAt: Date,
  expiresAt: Date
}
```
**Indexes**: `characterId`, `isRead`, `expiresAt` (TTL)

### Gossip
Gossip items.

```typescript
{
  _id: ObjectId,
  content: String,
  category: String,

  originCharacterId: ObjectId?,
  aboutCharacterId: ObjectId?,

  truthfulness: Number (0-100),
  version: Number,

  spreadCount: Number,

  createdAt: Date
}
```

### GossipItem
Gossip instance at location.

```typescript
{
  _id: ObjectId,
  gossipId: ObjectId (ref: Gossip),
  locationId: ObjectId,

  heardBy: [ObjectId],

  degradedContent: String,
  currentTruthfulness: Number
}
```

### ReputationEvent
Reputation-affecting events.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),
  factionId: String,

  change: Number,
  reason: String,

  occurredAt: Date
}
```

### ReputationHistory
Historical reputation tracking.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  factionId: String,

  reputation: Number,
  recordedAt: Date
}
```

---

## World & Locations

### Location
Game locations.

```typescript
{
  _id: ObjectId,
  locationId: String (unique, indexed),
  name: String,

  type: String (42 types),
  regionId: String,
  zoneId: String,

  description: String,

  buildings: [String],
  npcs: [String],
  jobs: [String],
  shops: [String],

  dangerLevel: Number,
  travelCost: Number,

  isSecret: Boolean,
  discoverRequirements: Mixed,

  operatingHours: {
    open: Number,
    close: Number
  }
}
```
**Indexes**: `locationId`, `regionId`, `zoneId`, `type`

### Region
Geographic regions.

```typescript
{
  _id: ObjectId,
  regionId: String (unique),
  name: String,
  continentId: String,

  description: String,
  weatherPattern: String,

  dangerModifier: Number
}
```

### Continent
Top-level geography.

```typescript
{
  _id: ObjectId,
  continentId: String (unique),
  name: String,
  description: String
}
```

### WorldZone
World zone definitions.

```typescript
{
  _id: ObjectId,
  zoneId: String (unique),
  name: String,
  regionId: String,

  levelRange: { min: Number, max: Number },
  unlockRequirements: Mixed
}
```

### WorldEvent
Active world events.

```typescript
{
  _id: ObjectId,
  eventType: String,

  name: String,
  description: String,

  locationId: ObjectId?,
  regionId: String?,

  effects: {
    priceModifier: Number?,
    dangerModifier: Number?,
    travelModifier: Number?,
    reputationModifier: Number?
  },

  status: 'active' | 'completed' | 'expired',

  startsAt: Date,
  endsAt: Date
}
```
**Indexes**: `status`, `startsAt`, `endsAt`

### WorldState
Global world state.

```typescript
{
  _id: ObjectId,
  stateKey: String (unique),
  value: Mixed,
  updatedAt: Date
}
```

### GameCalendar
In-game calendar state.

```typescript
{
  _id: ObjectId,
  gameDay: Number,
  gameMonth: Number,
  gameYear: Number,

  season: String,
  moonPhase: String,
  timePeriod: String,

  activeHoliday: String?,

  updatedAt: Date
}
```

### FrontierZodiac
Zodiac state.

```typescript
{
  _id: ObjectId,
  currentSign: String,
  effects: Mixed,

  changesAt: Date
}
```

### NewsArticle
Newspaper articles.

```typescript
{
  _id: ObjectId,
  newspaperId: String,

  headline: String,
  content: String,

  eventType: String,
  references: [ObjectId],

  publishedAt: Date
}
```

### NewsSubscription
Paper subscriptions.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  newspaperId: String,

  subscribedAt: Date,
  expiresAt: Date
}
```

### Secret
Discoverable secrets.

```typescript
{
  _id: ObjectId,
  secretId: String (unique),
  locationId: ObjectId,

  name: String,
  description: String,

  discoveryRequirements: Mixed,
  rewards: Mixed
}
```

---

## Activities & Adventures

### Quest
Quest definitions (static).

```typescript
{
  _id: String,
  name: String,
  description: String,

  chainId: String?,
  chainOrder: Number?,

  level: Number,

  objectives: [{
    type: String,
    target: String,
    count: Number
  }],

  rewards: {
    xp: Number,
    gold: Number,
    items: [String],
    reputation: Map<String, Number>
  },

  prerequisites: [String]
}
```

### CharacterQuest
Character quest progress.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, indexed),
  questId: String (ref: Quest),

  status: 'active' | 'completed' | 'abandoned',

  objectiveProgress: [{
    index: Number,
    current: Number,
    completed: Boolean
  }],

  startedAt: Date,
  completedAt: Date?
}
```
**Indexes**: `characterId`, `[characterId, questId]`

### DailyContract
Daily contract definitions and active contracts.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),

  templateId: String,
  contractType: String,

  objectives: [{
    type: String,
    target: Mixed,
    progress: Number,
    required: Number
  }],

  rewards: Mixed,

  status: 'active' | 'completed' | 'expired',

  generatedAt: Date,
  expiresAt: Date,
  completedAt: Date?
}
```

### HuntingTrip
Active hunting sessions.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),
  locationId: ObjectId,

  prey: String,

  phase: 'tracking' | 'aiming' | 'shooting' | 'complete',

  quality: String?,

  createdAt: Date
}
```

### FishingTrip
Active fishing sessions.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),
  spotId: ObjectId,

  phase: 'casting' | 'waiting' | 'bite' | 'hooking' | 'fighting' | 'landing',

  fishType: String?,
  fishSize: Number?,

  createdAt: Date
}
```

### MiningClaim
Mining claim ownership.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),
  locationId: ObjectId,

  tier: Number (1-5),

  richness: Number,
  remainingYield: Number,

  lastMined: Date,
  claimedAt: Date
}
```

### MiningShaft
Deep mining shafts.

```typescript
{
  _id: ObjectId,
  claimId: ObjectId (ref: MiningClaim),
  depth: Number,

  veins: [{
    resourceType: String,
    richness: Number,
    remaining: Number
  }],

  excavatedAt: Date
}
```

### IllegalClaim
Illegal mining operations.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  claimId: ObjectId,

  suspicion: Number (0-100),

  lastInspection: Date
}
```

### ResourceVein
Resource vein data.

```typescript
{
  _id: ObjectId,
  locationId: ObjectId,
  resourceType: String,

  richness: Number,
  totalYield: Number,
  remainingYield: Number
}
```

### CattleDrive
Cattle drive operations.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),

  routeId: String,

  herdSize: Number,
  herdHealth: Number,
  herdMorale: Number,
  herdFatigue: Number,

  companions: [ObjectId],

  currentPhase: Number,

  status: 'active' | 'completed' | 'failed',

  createdAt: Date
}
```

### Horse
Horse ownership.

```typescript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: Character, indexed),

  name: String,
  breed: String,

  stats: {
    speed: Number,
    stamina: Number,
    handling: Number
  },

  level: Number,
  xp: Number,

  health: Number,

  createdAt: Date
}
```

### Stable
Stable ownership.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique),

  capacity: Number,
  level: Number,

  horses: [ObjectId]
}
```

### HorseRace
Race events.

```typescript
{
  _id: ObjectId,
  raceId: String,

  entries: [{
    horseId: ObjectId,
    ownerId: ObjectId,
    odds: Number
  }],

  results: [{
    position: Number,
    horseId: ObjectId
  }],

  status: 'open' | 'running' | 'finished',

  scheduledAt: Date
}
```

### RaceBet
Race bets.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  raceId: ObjectId,

  betType: 'win' | 'place' | 'show' | 'exacta' | 'trifecta' | 'quinella',
  selections: [ObjectId],
  amount: Number,

  payout: Number?,

  placedAt: Date
}
```

### GamblingSession
Active gambling sessions.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),

  gameType: String,

  state: Mixed,

  wagered: Number,
  won: Number,

  createdAt: Date
}
```

### GamblingHistory
Gambling history.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),

  gameType: String,
  wagered: Number,
  result: Number,

  recordedAt: Date
}
```

### StagecoachTicket
Stagecoach tickets.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  routeId: String,

  departure: ObjectId,
  destination: ObjectId,

  status: 'purchased' | 'boarded' | 'arrived' | 'robbed',

  purchasedAt: Date
}
```

### TrainTicket
Train tickets.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  scheduleId: String,

  departure: ObjectId,
  destination: ObjectId,

  status: 'purchased' | 'boarded' | 'arrived',

  purchasedAt: Date
}
```

### AmbushPlan
Robbery plans.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  gangId: ObjectId?,

  targetType: 'stagecoach' | 'train',
  targetId: ObjectId,

  participants: [ObjectId],

  status: 'planning' | 'active' | 'success' | 'failed',

  createdAt: Date
}
```

### AnimalCompanion
Companion animals.

```typescript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: Character, indexed),

  species: String,
  name: String,

  level: Number,
  xp: Number,

  stats: {
    combat: Number,
    tracking: Number,
    loyalty: Number
  },

  abilities: [String],

  isActive: Boolean,

  createdAt: Date
}
```

### TamingAttempt
Active taming attempts.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  creatureType: String,

  progress: Number,
  difficulty: Number,

  status: 'active' | 'success' | 'failed',

  createdAt: Date
}
```

### CraftingProfile
Crafting progression.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique),

  knownRecipes: [String],

  craftingXP: Map<String, Number>,

  masterworkCount: Number
}
```

### Recipe
Recipe definitions (static).

```typescript
{
  _id: String,
  name: String,

  skillRequired: String,
  levelRequired: Number,

  materials: [{
    itemId: String,
    quantity: Number
  }],

  output: {
    itemId: String,
    quantity: Number
  },

  time: Number
}
```

### CraftedItem
Crafted item with maker info.

```typescript
{
  _id: ObjectId,
  baseItemId: String,
  crafterId: ObjectId,

  quality: String,
  isMasterwork: Boolean,

  bonuses: Mixed,

  craftedAt: Date
}
```

---

## Properties & Production

### Property
Player-owned properties.

```typescript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: Character, indexed),
  locationId: ObjectId,

  propertyType: String,
  tier: Number (1-5),

  level: Number,
  upgrades: [String],

  condition: Number (0-100),

  workers: [{
    workerId: ObjectId,
    role: String
  }],

  income: Number,
  lastCollected: Date,

  purchasedAt: Date
}
```
**Indexes**: `ownerId`, `locationId`

### PropertyWorker
Worker assignments.

```typescript
{
  _id: ObjectId,
  propertyId: ObjectId (ref: Property, indexed),

  name: String,
  skill: Number,
  morale: Number,

  wage: Number,

  assignedAt: Date
}
```

### ProductionSlot
Production queue slots.

```typescript
{
  _id: ObjectId,
  propertyId: ObjectId (indexed),

  recipeId: String,
  quantity: Number,

  progress: Number,
  completesAt: Date,

  status: 'active' | 'complete' | 'cancelled'
}
```

### PropertyTax
Tax records.

```typescript
{
  _id: ObjectId,
  propertyId: ObjectId (indexed),

  taxOwed: Number,
  dueDate: Date,

  status: 'pending' | 'paid' | 'overdue' | 'delinquent'
}
```

### TaxDelinquency
Delinquent tax tracking.

```typescript
{
  _id: ObjectId,
  propertyId: ObjectId,

  totalOwed: Number,
  missedPayments: Number,

  scheduledForeclosure: Date?
}
```

### PropertyAuction
Foreclosure auctions.

```typescript
{
  _id: ObjectId,
  propertyId: ObjectId,

  startingBid: Number,
  currentBid: Number,
  currentBidderId: ObjectId?,

  bids: [{
    bidderId: ObjectId,
    amount: Number,
    at: Date
  }],

  startsAt: Date,
  endsAt: Date,

  status: 'scheduled' | 'active' | 'sold' | 'cancelled'
}
```

### WorkerTask
Worker task assignments.

```typescript
{
  _id: ObjectId,
  workerId: ObjectId,
  propertyId: ObjectId,

  taskType: String,

  progress: Number,
  completesAt: Date,

  status: 'assigned' | 'active' | 'complete'
}
```

### Business
Player-owned businesses.

```typescript
{
  _id: ObjectId,
  ownerId: ObjectId (indexed),
  locationId: ObjectId,

  businessType: String,

  level: Number,
  reputation: Number,

  revenue: Number,
  expenses: Number,

  employees: Number,

  lastRevenueAt: Date
}
```

### NPCBusiness
NPC-owned competing businesses.

```typescript
{
  _id: ObjectId,
  locationId: ObjectId,

  businessType: String,
  npcOwnerId: String,

  personality: 'passive' | 'balanced' | 'aggressive' | 'quality_focused',

  quality: Number,
  price: Number,

  weeklyRevenue: Number
}
```

### Incident
Property/business incidents.

```typescript
{
  _id: ObjectId,
  targetType: 'property' | 'business' | 'mining',
  targetId: ObjectId,

  incidentType: String,
  severity: 'minor' | 'moderate' | 'major' | 'severe' | 'catastrophic',

  damage: Number,
  response: String?,

  occurredAt: Date,
  resolvedAt: Date?
}
```

### ProtectionContract
Gang protection contracts.

```typescript
{
  _id: ObjectId,
  businessId: ObjectId,
  gangId: ObjectId,

  fee: Number,
  paymentSchedule: String,

  missedPayments: Number,

  status: 'active' | 'suspended' | 'terminated',

  createdAt: Date
}
```

---

## Crime & Law

### Bounty
Active bounties.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (ref: Character, indexed),

  amount: Number,
  reason: String,

  wantedRank: 'unknown' | 'petty' | 'wanted' | 'notorious' | 'most_wanted',

  lastCrimeAt: Date,
  expiresAt: Date?
}
```

### BountyHunt
Player bounty hunting.

```typescript
{
  _id: ObjectId,
  hunterId: ObjectId (ref: Character, indexed),
  targetId: ObjectId (ref: Character),

  status: 'active' | 'captured' | 'killed' | 'escaped' | 'expired',

  reward: Number,

  startedAt: Date,
  completedAt: Date?
}
```

### WitnessAccount
Crime witnesses.

```typescript
{
  _id: ObjectId,
  crimeId: String,
  characterId: ObjectId,

  witnessNpcId: String?,
  witnessCharacterId: ObjectId?,

  description: String,

  reportedToLaw: Boolean,

  occurredAt: Date
}
```

### JailSentence
Jail sentences (embedded in character or separate).

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),

  reason: String,
  sentenceMinutes: Number,
  remainingMinutes: Number,

  escapeAttempts: Number,

  startedAt: Date,
  endsAt: Date
}
```

---

## Special Systems

### CharacterKarma
Karma tracking.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique, indexed),

  dimensions: {
    justice: Number,
    mercy: Number,
    honesty: Number,
    generosity: Number,
    loyalty: Number,
    honor: Number,
    courage: Number,
    wisdom: Number,
    temperance: Number,
    piety: Number
  },

  moralReputation: Number (-100 to 100),

  updatedAt: Date
}
```

### DeityAttention
Divine attention tracking.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique),

  gambler: {
    relationship: Number,
    attention: Number,
    mood: String
  },

  outlawKing: {
    relationship: Number,
    attention: Number,
    mood: String
  },

  lastInteraction: Date
}
```

### DeityStranger
Active deity manifestations.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,

  deityId: String,
  manifestationType: String,

  npcId: String?,
  message: String,

  blessing: String?,
  curse: String?,

  expiresAt: Date
}
```

### DeityAgent
Deity agent (avatar) encounters.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  deityId: String,

  agentType: String,

  encounteredAt: Date
}
```

### SanityTracker
Sanity/corruption tracking.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique),

  sanity: Number (0-100),
  corruption: Number (0-100),

  madnessEffects: [String],

  lastEvent: Date
}
```

### CharacterCorruption
Cosmic corruption tracking.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique),

  corruptionLevel: Number,
  corruptionType: String?,

  symptoms: [String]
}
```

### CosmicProgress
Cosmic quest progression.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique),

  questStage: Number,
  cluesDiscovered: [String],

  endingUnlocked: String?,

  updatedAt: Date
}
```

### RitualSession
Active ritual sessions.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,

  ritualType: String,

  progress: Number,
  components: [String],

  status: 'preparing' | 'active' | 'complete' | 'failed',

  createdAt: Date
}
```

### TutorialProgress
Tutorial progression (may be in HawkCompanion).

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique),

  currentPhase: Number,
  completedMilestones: [String],

  hawkRelationship: Number,

  isComplete: Boolean,
  skippedAt: Date?
}
```

### HawkCompanion
Hawk tutorial companion state.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique),

  relationship: Number,
  mood: String,
  expression: String,

  dialogueHistory: [String],

  lastInteraction: Date
}
```

### LoginReward
Login reward tracking.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique),

  currentStreak: Number,
  longestStreak: Number,

  lastClaimedAt: Date,
  nextReward: Mixed
}
```

### HolidayProgress
Holiday event progress.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  holidayId: String,

  progress: Mixed,
  rewardsClaimed: [String],

  year: Number
}
```

### PendingReward
Unclaimed rewards.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),

  rewardType: String,
  rewards: Mixed,

  source: String,

  createdAt: Date,
  expiresAt: Date?
}
```

---

## Session & Tracking

### ActionDeckSession
Action deck game sessions.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,

  deck: [Mixed],
  hand: [Mixed],

  createdAt: Date
}
```

### Action
Action definitions (static).

```typescript
{
  _id: String,
  name: String,

  type: String,
  energyCost: Number,

  requirements: Mixed,
  effects: Mixed
}
```

### ActionResult
Action result logging.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  actionId: String,

  result: Mixed,

  performedAt: Date
}
```

### Encounter
Encounter definitions (static).

```typescript
{
  _id: String,
  name: String,

  type: String,
  locationTypes: [String],

  difficulty: Number,

  rewards: Mixed
}
```

### NPC
NPC definitions.

```typescript
{
  _id: String,
  name: String,

  type: String,
  locationId: ObjectId?,

  dialogue: Mixed,
  services: [String],

  schedule: Mixed
}
```

### NPCKnowledge
NPC knowledge of characters.

```typescript
{
  _id: ObjectId,
  npcId: String,
  characterId: ObjectId,

  opinion: Number,
  trust: Number,
  fear: Number,
  respect: Number,

  knownFacts: [String],

  lastInteraction: Date
}
```

### NPCTrust
NPC trust levels.

```typescript
{
  _id: ObjectId,
  npcId: String,
  characterId: ObjectId,

  trustLevel: Number,

  updatedAt: Date
}
```

### NPCRelationship
General NPC relationships.

```typescript
{
  _id: ObjectId,
  npcId: String,
  characterId: ObjectId,

  relationship: Number,
  interactionCount: Number,

  lastInteraction: Date
}
```

### CharacterMerchantDiscovery
Wandering merchant discoveries.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (indexed),
  merchantId: String,

  discovered: Boolean,
  trustLevel: Number,

  discoveredAt: Date
}
```

### MerchantStock
Merchant inventory tracking.

```typescript
{
  _id: ObjectId,
  merchantId: String,
  itemId: String,

  quantity: Number,
  restocksAt: Date
}
```

### ServiceProviderRelationship
Service provider relationships.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  providerId: String,

  usageCount: Number,
  discount: Number,

  lastUsed: Date
}
```

### ServiceUsageRecord
Service usage tracking.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  providerId: String,

  serviceType: String,
  cost: Number,

  usedAt: Date
}
```

### ChineseDiasporaRep
Chinese Diaspora reputation.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId (unique),

  reputation: Number,
  accessLevel: Number
}
```

### Mentorship
Mentor relationships.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  mentorNpcId: String,

  skillFocus: String,
  sessionsCompleted: Number,

  bonuses: Mixed
}
```

### ShootingContest
Shooting contests.

```typescript
{
  _id: ObjectId,
  locationId: ObjectId,

  participants: [ObjectId],

  status: 'registration' | 'active' | 'complete',

  startsAt: Date
}
```

### ShootingRecord
Shooting performance.

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,
  contestId: ObjectId,

  score: Number,
  placement: Number
}
```

### PokerTournament
Poker tournament state.

```typescript
{
  _id: ObjectId,
  locationId: ObjectId,

  buyIn: Number,
  prizePool: Number,

  players: [ObjectId],

  status: String,

  startsAt: Date
}
```

### PokerHand
Poker hand history.

```typescript
{
  _id: ObjectId,
  tournamentId: ObjectId?,
  characterId: ObjectId,

  hand: [Mixed],
  result: String,

  playedAt: Date
}
```

### Card
Card definitions (static).

```typescript
{
  _id: String,
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs',
  rank: String,
  value: Number,

  effects: Mixed
}
```

### Item
Item definitions.

```typescript
{
  _id: ObjectId,
  itemId: String (indexed),

  name: String,
  type: String,
  subtype: String?,

  rarity: String,

  stats: Mixed,
  effects: Mixed,

  stackable: Boolean,
  maxStack: Number,

  value: Number
}
```

### Mount
Mount ownership.

```typescript
{
  _id: ObjectId,
  ownerId: ObjectId (indexed),

  type: String,
  name: String,

  stats: Mixed,

  isActive: Boolean
}
```

### GroundItem
Dropped items in world.

```typescript
{
  _id: ObjectId,
  locationId: ObjectId (indexed),

  itemId: ObjectId,
  quantity: Number,

  droppedAt: Date,
  expiresAt: Date
}
```
**Indexes**: `locationId`, `expiresAt` (TTL)

### ScarProgress
Scar tracking (cosmetic wounds).

```typescript
{
  _id: ObjectId,
  characterId: ObjectId,

  scars: [{
    type: String,
    location: String,
    source: String,
    receivedAt: Date
  }]
}
```

### AuditLog
Administrative audit logging.

```typescript
{
  _id: ObjectId,
  userId: ObjectId?,
  characterId: ObjectId?,

  action: String,
  details: Mixed,

  ipAddress: String?,

  createdAt: Date
}
```
**Indexes**: `userId`, `characterId`, `action`, `createdAt`

---

## Indexes Summary

### Performance-Critical Indexes
- `Character`: userId, name, gangId, currentLocationId, level
- `GoldTransaction`: characterId + createdAt
- `CombatEncounter`: characterId + status
- `Quest`: characterId + questId
- `Notification`: characterId + isRead
- `WorldEvent`: status + startsAt
- `MarketListing`: sellerId + status

### TTL Indexes (Auto-Expiration)
- `RefreshToken.expiresAt`
- `CombatEncounter.expiresAt`
- `Notification.expiresAt`
- `WorldEvent.endsAt`
- `GroundItem.expiresAt`
- `GangInvitation.expiresAt`

### Unique Compound Indexes
- `[requesterId, requesteeId]` on Friend
- `[characterId, questId]` on CharacterQuest
- `[characterId, achievementId]` on CharacterAchievement
- `[gangId, characterId]` on GangMember

---

## Data Relationships

```
User (1) ──────────< Character (many)
                          │
                          ├──────< CharacterQuest
                          ├──────< CharacterAchievement
                          ├──────< CombatEncounter
                          ├──────< Property
                          ├──────< Item (inventory)
                          ├──────< GoldTransaction
                          ├──────< Friend
                          ├──────< Mail
                          └──────< Notification

Gang (1) ──────────< GangMember (many)
    │               │
    ├──────< GangWar      └── Character
    ├──────< GangBusiness
    ├──────< GangBase
    ├──────< GangBankTransaction
    └──────< Territory (control)

Location (1) ──────< Character (current)
         │
         ├──────< Property
         ├──────< NPC
         ├──────< Shop
         └──────< WorldEvent
```

---

*Last updated: December 2024*
