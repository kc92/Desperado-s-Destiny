# Faction Reputation System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FACTION REPUTATION SYSTEM                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Three Factions:                                             │
│  • Settler Alliance (Law & Order)                            │
│  • Nahi Coalition (Spirituality & Tradition)                │
│  • Frontera (Outlaws & Rebels)                              │
│                                                               │
│  Five Standing Levels:                                       │
│  Hostile → Unfriendly → Neutral → Friendly → Honored        │
│  (-100 to -50) (-50 to 0) (0 to 25) (25 to 75) (75 to 100) │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                         PLAYER ACTIONS                        │
└────────────┬─────────────────┬──────────────────┬────────────┘
             │                 │                  │
             ▼                 ▼                  ▼
      ┌───────────┐     ┌───────────┐     ┌───────────┐
      │  QUESTS   │     │  CRIMES   │     │   SHOPS   │
      └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
            │                 │                  │
            │                 │                  │
            ▼                 ▼                  ▼
┌──────────────────────────────────────────────────────────────┐
│                    REPUTATION SERVICE                         │
│                                                               │
│  • modifyReputation()                                        │
│  • getStanding()                                             │
│  • getAllStandings()                                         │
│  • getPriceModifier()                                        │
│  • applyRivalPenalties()                                     │
│                                                               │
└───────────┬──────────────────────────┬───────────────────────┘
            │                          │
            ▼                          ▼
   ┌─────────────────┐        ┌─────────────────┐
   │    CHARACTER    │        │  REPUTATION     │
   │    MODEL        │        │  HISTORY        │
   │                 │        │                 │
   │ factionRep:     │        │ • characterId   │
   │  settler: 45    │        │ • faction       │
   │  nahi: 10       │        │ • change: +15   │
   │  frontera: -25  │        │ • reason        │
   │                 │        │ • timestamp     │
   └─────────────────┘        └─────────────────┘
```

## Quest Integration

```
┌─────────────────────────────────────────────────────────────┐
│                      QUEST COMPLETION                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Quest Rewards:  │
              │  • Gold: 100    │
              │  • XP: 150      │
              │  • Rep: +15     │
              │    (Settler)    │
              └────────┬────────┘
                       │
                       ▼
         ┌────────────────────────────┐
         │ ReputationService.modify() │
         └────────────────────────────┘
                       │
         ┌─────────────┴────────────┐
         │                          │
         ▼                          ▼
   Update Character          Create History
   settler: 30 → 45         "Quest: Help Sheriff"
```

## Crime Integration

```
┌─────────────────────────────────────────────────────────────┐
│                       CRIME ATTEMPT                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
       ┌──────────┐      ┌──────────┐
       │ SUCCESS  │      │  FAILED  │
       └─────┬────┘      └─────┬────┘
             │                 │
    ┌────────┴────────┐       │
    │                 │       │
    ▼                 ▼       ▼
┌──────────┐   ┌──────────┐ ┌──────────┐
│UNWITNESSED│   │WITNESSED │ │ CAUGHT  │
└─────┬────┘   └─────┬────┘ └─────┬────┘
      │              │            │
      ▼              ▼            ▼
  Settler -5     Settler -10  Settler -15
  Frontera +2
```

## Shop Integration

```
┌─────────────────────────────────────────────────────────────┐
│                      SHOP PURCHASE                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
         ┌──────────────────────────┐
         │  Get Faction Standing    │
         │  (settlerAlliance shop)  │
         └────────────┬─────────────┘
                      │
                      ▼
         ┌──────────────────────────┐
         │  Standing: Friendly      │
         │  Modifier: 0.9 (10% off) │
         └────────────┬─────────────┘
                      │
                      ▼
         ┌──────────────────────────┐
         │  Base Price: 100 gold    │
         │  Final Price: 90 gold    │
         └──────────────────────────┘
```

## Standing Impact Matrix

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  STANDING    │ PRICE IMPACT │   ACCESS     │   BENEFITS   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│  HOSTILE     │  +30% markup │   BLOCKED    │   NONE       │
│  (-100/-50)  │              │  Attacked    │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ UNFRIENDLY   │  +15% markup │   LIMITED    │  Basic Only  │
│  (-50/0)     │              │  Cold NPCs   │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│  NEUTRAL     │    NORMAL    │   STANDARD   │  All Common  │
│  (0/25)      │              │  Normal NPCs │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│  FRIENDLY    │ -10% discount│   FULL       │  + Special   │
│  (25/75)     │              │  Helpful NPCs│    Quests    │
├──────────────┼──────────────┼──────────────┼──────────────┤
│  HONORED     │ -20% discount│   CHAMPION   │  + Exclusive │
│  (75/100)    │              │  Reverent    │    Items     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## Faction-Specific Benefits

```
┌────────────────────────────────────────────────────────────┐
│                   SETTLER ALLIANCE                          │
│  Values: Law, Commerce, Civilization                       │
│  Benefits:                                                  │
│   • Railroad fast travel                                   │
│   • Bank vault access                                      │
│   • Sheriff cooperation                                    │
│   • Town discounts                                         │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   NAHI COALITION                            │
│  Values: Spirituality, Tradition, Honor                    │
│  Benefits:                                                  │
│   • Spirit guide assistance                                │
│   • Sacred site access                                     │
│   • Traditional medicines                                  │
│   • Nature knowledge                                       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                      FRONTERA                               │
│  Values: Freedom, Profit, Defiance                         │
│  Benefits:                                                  │
│   • Black market access                                    │
│   • Smuggler networks                                      │
│   • Hideout locations                                      │
│   • Outlaw information                                     │
└────────────────────────────────────────────────────────────┘
```

## Rival Faction System

```
                    SETTLER ALLIANCE
                           │
                           │ RIVALS
                           │
                           ▼
                       FRONTERA
                    (Outlaws vs Law)

                    NAHI COALITION
                      (Neutral)
                    No rivals, balanced
```

When you help Settler Alliance:
- Settler +15
- Frontera -5 (30% penalty)

When you help Frontera:
- Frontera +15
- Settler -5 (30% penalty)

When you help Nahi Coalition:
- Nahi +15
- No rival penalties

## API Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT: GET /api/reputation                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  ROUTE: reputation.routes.ts                                │
│  • Requires authentication                                  │
│  • Wraps with asyncHandler                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  CONTROLLER: reputation.controller.ts                       │
│  • Extract characterId from req.character                   │
│  • Call service                                             │
│  • Format response                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  SERVICE: reputation.service.ts                             │
│  • Query Character model                                    │
│  • Calculate standings                                      │
│  • Get faction benefits                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE: Character collection                             │
│  factionReputation: {                                       │
│    settlerAlliance: 45,                                     │
│    nahiCoalition: 10,                                       │
│    frontera: -25                                            │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  RESPONSE: JSON                                             │
│  {                                                           │
│    "settlerAlliance": {                                     │
│      "rep": 45,                                             │
│      "standing": "friendly",                                │
│      "priceModifier": 0.9,                                  │
│      "benefits": [...]                                      │
│    }                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## History Tracking

```
Every reputation change creates a history record:

┌─────────────────────────────────────────────────────────────┐
│  ReputationHistory Record                                   │
├─────────────────────────────────────────────────────────────┤
│  characterId: ObjectId("...")                               │
│  faction: "settlerAlliance"                                 │
│  change: +15                                                │
│  reason: "Quest: Help the Sheriff"                          │
│  previousValue: 30                                          │
│  newValue: 45                                               │
│  timestamp: 2025-01-15T10:30:00Z                            │
└─────────────────────────────────────────────────────────────┘

Players can view their complete history:
GET /api/reputation/history

Benefits:
• Full transparency
• Debugging support
• Player accountability
• Audit trail
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Parent Operation (Quest/Crime/Shop)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  try {                │
         │    ReputationService  │
         │  }                    │
         └───────────┬───────────┘
                     │
        ┌────────────┴──────────────┐
        │                           │
        ▼                           ▼
┌──────────────┐           ┌──────────────┐
│   SUCCESS    │           │    ERROR     │
│              │           │              │
│ Update char  │           │ Log error    │
│ Create hist  │           │ Continue op  │
│ Return data  │           │ No failure   │
└──────────────┘           └──────────────┘
        │                           │
        └─────────┬─────────────────┘
                  │
                  ▼
         Parent operation
         completes normally
```

## Key Design Decisions

1. **Non-Blocking Updates**: Reputation failures don't break parent operations
2. **Audit Trail**: Every change is logged for transparency
3. **Cached Values**: Reputation stored in Character model for fast access
4. **Transaction Safety**: All updates wrapped in MongoDB transactions
5. **Rival System**: Optional penalties create meaningful choices
6. **Price Impact**: Immediate economic consequences for standing
7. **Progressive Benefits**: Each standing tier unlocks new features
8. **Faction Identity**: Each faction has unique personality and rewards

## Performance Characteristics

- **Read Performance**: O(1) - reputation cached in Character
- **Write Performance**: O(1) - indexed history inserts
- **History Queries**: O(log n) - compound indexes
- **Standing Calculation**: O(1) - simple arithmetic
- **Price Calculation**: O(1) - direct multiplication

## Future Expansion Points

1. NPC dialogue based on standing
2. Quest gating by reputation requirements
3. Territory access restrictions
4. Faction-specific equipment
5. Dynamic faction events
6. Reputation decay system
7. Faction disguises
8. Achievement integration
