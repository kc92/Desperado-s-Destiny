# SocialIntelligence System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SocialIntelligence System                    │
│                                                                  │
│  ┌────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ PersonalitySystem│ │  BotMemory     │  │  CharacterModel │ │
│  │                │  │                 │  │                 │ │
│  │ - Traits       │  │ - Action History│  │ - Faction       │ │
│  │ - Preferences  │  │ - Patterns      │  │ - Gang          │ │
│  │ - Archetype    │  │ - Learning      │  │ - Level         │ │
│  └────────┬───────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                   │                     │          │
│           └───────────────────┴─────────────────────┘          │
│                               ▼                                │
│                    ┌──────────────────────┐                    │
│                    │ SocialIntelligence   │                    │
│                    │                      │                    │
│                    │ Core Systems:        │                    │
│                    │ • Relationships      │                    │
│                    │ • Affinity           │                    │
│                    │ • Decisions          │                    │
│                    │ • Frequency          │                    │
│                    │ • Decay              │                    │
│                    └──────────┬───────────┘                    │
│                               │                                │
│           ┌───────────────────┼───────────────────┐            │
│           ▼                   ▼                   ▼            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │ Friend System  │  │  Gang System   │  │  Chat System   │  │
│  │                │  │                │  │                │  │
│  │ - Send Request │  │ - Join Gang    │  │ - Send Message │  │
│  │ - Accept/Reject│  │ - Leave Gang   │  │ - Frequency    │  │
│  │ - Manage List  │  │ - Activity     │  │ - Context      │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        Interaction Flow                          │
└──────────────────────────────────────────────────────────────────┘

1. ENCOUNTER
   ┌──────────────┐
   │ Bot meets    │
   │ Character    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Get/Create   │
   │ Relationship │
   └──────┬───────┘
          │
          ▼
2. CALCULATE INITIAL AFFINITY
   ┌────────────────────────────────────────┐
   │ Factors:                               │
   │ • Same Faction?         (+20/-10)      │
   │ • Same Gang?            (+30)          │
   │ • Level Proximity?      (+10)          │
   │ • Mutual Friends?       (+3 each)      │
   │ • Personality Match?    (+0 to +20)    │
   │ • Random Variance       (±5)           │
   └────────┬───────────────────────────────┘
            │
            ▼
3. RECORD INTERACTION
   ┌────────────────────────────────────────┐
   │ Interaction Type → Affinity Delta      │
   │ • Greeting           +2                │
   │ • Chat               +3                │
   │ • Quest Together     +8                │
   │ • Combat Together    +10               │
   │ • Gift               +12               │
   │ • Conflict           -15               │
   │                                        │
   │ Modified by:                           │
   │ • Personality (0.7-1.3x)               │
   │ • Diminishing Returns (0.6-1.0x)       │
   └────────┬───────────────────────────────┘
            │
            ▼
4. UPDATE RELATIONSHIP
   ┌────────────────────────────────────────┐
   │ • Affinity += Delta                    │
   │ • InteractionCount++                   │
   │ • Trust += 0.02 (if positive)          │
   │ • LastInteractionAt = now              │
   │ • RecentInteractions.push()            │
   │ • UpdateStage()                        │
   └────────┬───────────────────────────────┘
            │
            ▼
5. CHECK THRESHOLDS
   ┌────────────────────────────────────────┐
   │ Affinity Thresholds:                   │
   │ • 0-19:  STRANGER                      │
   │ • 20-49: ACQUAINTANCE                  │
   │ • 50-79: FRIEND                        │
   │ • 80+:   CLOSE_FRIEND                  │
   │ • <-50:  BLOCKED                       │
   └────────┬───────────────────────────────┘
            │
            ▼
6. DECISION MAKING
   ┌────────────────────────────────────────┐
   │ Should Send Friend Request?            │
   │ ✓ Affinity >= 30                       │
   │ ✓ Interactions >= 3                    │
   │ ✓ Not already friends                  │
   │ ✓ Personality check (random < P)       │
   │                                        │
   │ P = sociability                        │
   │     + compatibility * 0.3              │
   │     + (sameGang ? 0.2 : 0)             │
   └────────────────────────────────────────┘
```

## Relationship Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Relationship Stages                          │
└─────────────────────────────────────────────────────────────────┘

STRANGER (0-19 affinity)
│ • First meeting
│ • Minimal interaction (0.2x frequency)
│ • High caution
│ • ~5 hour interaction delay
│
│ [3-5 positive interactions]
│
▼
ACQUAINTANCE (20-49 affinity)
│ • Regular interactions (0.5x frequency)
│ • Building trust
│ • ~2 hour interaction delay
│ • Starting to learn about each other
│
│ [8-12 positive interactions]
│ [Meet friend request criteria]
│
▼
FRIEND (50-79 affinity)
│ • Frequent interactions (1.5x frequency)
│ • High trust
│ • ~40 minute interaction delay
│ • Share quests, help each other
│ • Mail correspondence
│
│ [20+ close interactions]
│ [Deep bonding experiences]
│
▼
CLOSE_FRIEND (80-100 affinity)
│ • Very frequent interactions (3.0x frequency)
│ • Maximum trust
│ • ~20 minute interaction delay
│ • Gift giving
│ • Priority for group activities
│ • Defend each other
│
│ [If no interaction for 30+ days]
│
▼
DECAY
│ • -2 affinity per day
│ • Can drop back to FRIEND
│ • Can drop to ACQUAINTANCE
│ • Eventually back to STRANGER
│
│ [If severe conflict or betrayal]
│
▼
BLOCKED (<-50 affinity)
│ • No interactions (0x frequency)
│ • Avoided in social actions
│ • Cannot send friend requests
│ • Relationship terminated
```

## Decision Making Process

```
┌─────────────────────────────────────────────────────────────────┐
│                Friend Request Decision Tree                      │
└─────────────────────────────────────────────────────────────────┘

                    [Character Encountered]
                            │
                            ▼
              ┌─────────────────────────┐
              │ Already Friends/Blocked?│
              └──────┬────────┬─────────┘
               YES   │        │   NO
                     ▼        ▼
                  [Skip]  ┌──────────────────┐
                          │ Affinity >= 30?   │
                          └──────┬─────┬─────┘
                           YES   │     │  NO
                                 ▼     ▼
                          ┌──────────────┐ [Skip]
                          │ Interact >= 3?│
                          └──────┬────┬──┘
                           YES   │    │  NO
                                 ▼    ▼
                          ┌──────────────┐ [Skip]
                          │ Calc Prob    │
                          │ P = base     │
                          │   + compat   │
                          │   + gang     │
                          └──────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │ Random < P?  │
                          └──────┬────┬──┘
                           YES   │    │  NO
                                 ▼    ▼
                          [SEND REQUEST] [Skip]
```

```
┌─────────────────────────────────────────────────────────────────┐
│                  Gang Join Decision Tree                         │
└─────────────────────────────────────────────────────────────────┘

                    [Gang Encountered]
                            │
                            ▼
              ┌─────────────────────────┐
              │ Already in Gang?        │
              └──────┬────────┬─────────┘
               YES   │        │   NO
                     ▼        ▼
                  [Skip]  ┌──────────────────┐
                          │ Calculate Score: │
                          │                  │
                          │ Base Score:      │
                          │ loyalty*0.4      │
                          │ +sociability*0.3 │
                          │                  │
                          │ Modifiers:       │
                          │ +reputation*0.2  │
                          │ +sameFaction*0.3 │
                          │ +goodSize*0.15   │
                          │ +highLevel*0.1   │
                          │ +personality     │
                          │                  │
                          └──────┬───────────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │ Random < P?  │
                          └──────┬────┬──┘
                           YES   │    │  NO
                                 ▼    ▼
                          [JOIN GANG] [Skip]
```

## Personality Impact Matrix

```
┌──────────────────────────────────────────────────────────────────┐
│              Personality Archetype Behaviors                      │
└──────────────────────────────────────────────────────────────────┘

Trait          Social  Grinder Explorer Combat Economist Criminal Roleplayer
────────────────────────────────────────────────────────────────────────────
Sociability    0.95    0.20    0.50     0.40   0.30      0.40     0.80
Loyalty        0.80    0.50    0.20     0.60   0.40      0.20     0.80
────────────────────────────────────────────────────────────────────────────
Friend Req%    90%     20%     50%      60%    30%       40%      80%
Gang Join%     70%     30%     40%      60%    35%       50%      65%
Chat Freq      2.5x    0.2x    1.0x     0.8x   0.3x      0.5x     2.0x
Accept Req%    80%     40%     60%      55%    45%       50%      70%
────────────────────────────────────────────────────────────────────────────

Compatibility Matrix (Social with...):
  Social:      0.9  (best match)
  Roleplayer:  0.8  (very compatible)
  Explorer:    0.7  (compatible)
  Combat:      0.5  (neutral)
  Criminal:    0.4  (somewhat incompatible)
  Economist:   0.4  (somewhat incompatible)
  Grinder:     0.3  (incompatible)
```

## Time-Based Dynamics

```
┌──────────────────────────────────────────────────────────────────┐
│                 Relationship Timeline                             │
└──────────────────────────────────────────────────────────────────┘

Day 1: First Meeting
│ Affinity: 0 → 20 (same faction bonus)
│ Stage: STRANGER → ACQUAINTANCE
│ Actions: Greeting, Chat
│
Day 2-3: Getting to Know
│ Affinity: 20 → 35
│ Stage: ACQUAINTANCE
│ Actions: Multiple chats, maybe a trade
│
Day 4-5: Building Trust
│ Affinity: 35 → 50
│ Stage: ACQUAINTANCE → FRIEND
│ Actions: Quest together, combat together
│ Event: Friend request sent/accepted
│
Day 6-10: Friendship Solidifies
│ Affinity: 50 → 70
│ Stage: FRIEND
│ Actions: Mail, gifts, frequent interaction
│
Day 11-20: Deep Bond
│ Affinity: 70 → 85
│ Stage: FRIEND → CLOSE_FRIEND
│ Actions: Gang activities together, mutual help
│
Day 21-30: Maintenance Phase
│ Affinity: 85 (maintained)
│ Stage: CLOSE_FRIEND
│ Actions: Regular check-ins, shared activities
│
Day 31+ (No Interaction):
│ Affinity: 85 → 83 → 81 → 79 → 77...
│ Stage: CLOSE_FRIEND → FRIEND → ACQUAINTANCE
│ Effect: Decay at -2/day
│
Day 60 (Reunion after break):
│ Affinity: 77 (decayed) → 82 (bounce back faster)
│ Stage: FRIEND → CLOSE_FRIEND
│ Actions: Resumed activity, rekindled friendship
```

## Context-Aware Action Selection

```
┌──────────────────────────────────────────────────────────────────┐
│              Action Selection Algorithm                           │
└──────────────────────────────────────────────────────────────────┘

INPUT: Context {
  nearbyCharacters: [...]
  currentCharacter: {...}
  availableGangs: [...]
}

STEP 1: Evaluate Each Character
┌─────────────────────────────────────┐
│ For each character:                 │
│                                     │
│ 1. Get/Create relationship          │
│ 2. Check if blocked → skip          │
│ 3. Check interaction frequency      │
│ 4. If frequency = 0 → skip          │
│ 5. Score possible actions:          │
│                                     │
│    Friend Request:                  │
│    score = 60 + affinity            │
│    (if eligible)                    │
│                                     │
│    Chat:                            │
│    score = sociability*50           │
│          + affinity*0.5             │
│          + (sameGang?20:0)          │
│                                     │
│    Mail:                            │
│    score = 50 + affinity*0.8        │
│    (if friend+)                     │
│                                     │
│    Invite Quest:                    │
│    score = 70 + affinity            │
│    (if friend+)                     │
└─────────────────────────────────────┘

STEP 2: Evaluate Gangs
┌─────────────────────────────────────┐
│ For each gang (if not in gang):    │
│                                     │
│ If shouldJoinGang(gang):            │
│   score = 80 + reputation*20        │
│   action = join_gang                │
└─────────────────────────────────────┘

STEP 3: Sort and Select
┌─────────────────────────────────────┐
│ 1. Sort all actions by score DESC  │
│ 2. Return highest scored action     │
│ 3. If no actions, return null       │
└─────────────────────────────────────┘

OUTPUT: {
  type: 'send_friend_request',
  targetId: 'char-123',
  targetName: 'Bob',
  priority: 'medium'
}
```

## Memory Management

```
┌──────────────────────────────────────────────────────────────────┐
│                   Relationship Storage                            │
└──────────────────────────────────────────────────────────────────┘

Map<characterId, Relationship> {
  characterId: string
  characterName: string
  faction: string

  stage: RelationshipStage        // Current stage
  affinity: number (-100 to 100)  // Affinity score

  firstMetAt: Date                // First encounter
  lastInteractionAt: Date         // Most recent interaction
  interactionCount: number        // Total interactions

  recentInteractions: [           // Last 20 interactions
    {
      timestamp: Date
      type: InteractionType
      affinityDelta: number
      positive: boolean
    },
    ...
  ]

  friendRequestPending: boolean   // Pending friend request
  sameGang: boolean              // Same gang member
  trust: number (0-1)            // Trust level
  compatibility: number (0-1)     // Personality match

  notes: string[]                // Relationship events
}

┌─────────────────────────────────────┐
│ Automatic Pruning:                  │
│                                     │
│ When relationships > 100:           │
│                                     │
│ 1. Keep all non-strangers           │
│ 2. Keep strangers with 5+ interact  │
│ 3. Keep pending friend requests     │
│ 4. Sort remaining by affinity       │
│ 5. Keep top 100                     │
│ 6. Discard rest                     │
└─────────────────────────────────────┘
```

## Integration Points

```
┌──────────────────────────────────────────────────────────────────┐
│                    System Integration                             │
└──────────────────────────────────────────────────────────────────┘

┌────────────────────┐
│   SocialBot        │
│                    │
│   runCycle() {     │
│     1. getNearby() │ ─┐
│     2. evaluate()  │  │
│     3. decide()    │  │
│     4. execute()   │  │
│   }                │  │
└──────────┬─────────┘  │
           │            │
           ▼            │
┌────────────────────┐  │
│ SocialIntelligence │  │
│                    │  │
│ selectAction(ctx)  │ ◀┘
│ {                  │
│   // Analyze       │
│   // Score         │
│   // Recommend     │
│   return action    │
│ }                  │
└──────────┬─────────┘
           │
           ▼
┌────────────────────┐
│   Game API         │
│                    │
│ - sendFriendReq()  │
│ - sendChat()       │
│ - sendMail()       │
│ - joinGang()       │
└────────────────────┘
```

## Performance Characteristics

```
┌──────────────────────────────────────────────────────────────────┐
│                  Complexity Analysis                              │
└──────────────────────────────────────────────────────────────────┘

Operation               Time        Space       Notes
────────────────────────────────────────────────────────────────────
recordInteraction()     O(1)        O(1)        Constant append
getRelationship()       O(1)        O(1)        Map lookup
calculateAffinity()     O(1)        O(1)        Simple math
shouldSendRequest()     O(1)        O(1)        Probability calc
shouldJoinGang()        O(1)        O(1)        Score calculation
getFrequency()          O(1)        O(1)        Simple lookup
decayRelationships()    O(n)        O(1)        n = relationships
selectSocialAction()    O(m)        O(m)        m = nearby chars
pruneRelationships()    O(n log n)  O(n)        Sorting required
getSocialStats()        O(n)        O(1)        Aggregate calc

Memory per Bot:
- Base SocialIntelligence: ~5KB
- Per Relationship: ~2KB (with 20 interactions)
- Max 100 relationships: ~205KB total
- Acceptable for 100+ concurrent bots
```

---

## Summary

The SocialIntelligence system provides a **comprehensive, realistic social behavior framework** for bot players through:

1. **Multi-stage relationship progression** from stranger to close friend
2. **Intelligent affinity calculation** based on faction, gang, personality, and interactions
3. **Context-aware decision making** for friend requests, gang membership, and social actions
4. **Dynamic interaction frequency** that adapts to relationship strength
5. **Natural relationship decay** over time without maintenance
6. **Performance-optimized design** supporting 100+ bots with active social networks

The architecture is modular, well-tested, and ready for integration into the existing bot framework.
