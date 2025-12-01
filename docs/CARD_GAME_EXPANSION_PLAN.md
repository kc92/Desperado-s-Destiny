# Card Game Expansion Plan - Destiny Deck System

## Executive Summary

Expand the existing destiny deck system with 8+ new card game types to provide variety across the 950+ actions in the game. Use a hybrid approach where action types have default games, but special/thematic actions can override to use specific games that match their narrative.

**User Requirements:**
- **Scope:** Expand - Add new card game types for more action variety
- **Granularity:** Hybrid - Types have default games, but special actions can override
- **Priority:** Variety to prevent repetition

## Current State Analysis

### Existing Game Types (5)
1. **Poker Hold/Draw** - Default for COMBAT actions
2. **Blackjack** - Default for SOCIAL actions
3. **Press Your Luck** - Default for CRIME actions
4. **Deckbuilder** - Default for CRAFT actions
5. **Combat Duel** - Special override for combat duels

### Current Architecture
- **Core Engine:** `server/src/services/deckGames.ts` (2,190 lines)
  - Handles all 5 game types
  - Suit-to-stat mapping (Spades=Cunning, Hearts=Spirit, Clubs=Combat, Diamonds=Craft)
  - Hand evaluation, scoring, skill modifiers

- **Action Integration:** `server/src/services/actionDeck.service.ts`
  - Maps action types to game types
  - Processes results and applies rewards/penalties

- **Actions Database:** `server/src/models/Action.model.ts`
  - 950+ actions defined
  - Each has type, difficulty, suit requirements, min hand rank

### Problem Statement
With 950+ actions, using only 5 game types means:
- COMBAT actions (200+) always play Poker Hold/Draw → repetitive
- CRIME actions (250+) always play Press Your Luck → monotonous
- SOCIAL actions (200+) always play Blackjack → predictable
- CRAFT actions (300+) always play Deckbuilder → boring

## Proposed Solution

### Phase 1: Add 8 New Card Game Types

#### 1. **Faro** (Western Historical Game)
- **Use Case:** High-stakes crimes, gambling actions
- **Mechanics:** Simple betting on card order, low skill ceiling
- **Theme:** Classic Old West saloon game
- **Difficulty:** Easy to learn
- **Override Examples:** Casino heists, gambling dens

#### 2. **Three-Card Monte** (Con Game)
- **Use Case:** Deception crimes, trickery actions
- **Mechanics:** Track the card, perception vs sleight of hand
- **Theme:** Street hustler, confidence games
- **Difficulty:** Medium
- **Override Examples:** Pickpocketing, shell games, cons

#### 3. **Solitaire Race** (Time-based Puzzle)
- **Use Case:** Solo craft actions, lockpicking, safecracking
- **Mechanics:** Clear cards in sequence against time limit
- **Theme:** Methodical problem-solving
- **Difficulty:** Medium
- **Override Examples:** Crafting complex items, lock picking

#### 4. **Texas Hold'em Tournament** (Strategic Poker Variant)
- **Use Case:** High-stakes social negotiations, gang diplomacy
- **Mechanics:** Community cards, bluffing, position play
- **Theme:** Strategic negotiations, reading opponents
- **Difficulty:** Hard
- **Override Examples:** Gang treaties, political negotiations

#### 5. **Rummy** (Set Collection)
- **Use Case:** Investigation crimes, gathering intel
- **Mechanics:** Collect sets/runs, discard pile strategy
- **Theme:** Piecing together clues
- **Difficulty:** Medium
- **Override Examples:** Detective work, research, espionage

#### 6. **War of Attrition** (Endurance Contest)
- **Use Case:** Extended combat, sieges, endurance challenges
- **Mechanics:** Card comparison over multiple rounds, stamina matters
- **Theme:** Grinding warfare, outlasting opponents
- **Difficulty:** Easy mechanics, hard strategy
- **Override Examples:** Gang wars, territory sieges, marathons

#### 7. **Euchre** (Team Partnership Game)
- **Use Case:** Gang activities, team crimes/combat
- **Mechanics:** Trump suits, partner cooperation
- **Theme:** Coordinated team efforts
- **Difficulty:** Medium-Hard
- **Override Examples:** Bank heists, gang raids, coordinated attacks

#### 8. **Cribbage** (Counting/Math Game)
- **Use Case:** Mercantile, banking, economic actions
- **Mechanics:** Point counting, pegging board advancement
- **Theme:** Precise calculations, economic strategy
- **Difficulty:** Medium
- **Override Examples:** Trading, banking, economic manipulation

### Phase 2: Implement Hybrid Mapping System

#### Default Mappings (By Action Type)
```typescript
const DEFAULT_GAME_MAPPINGS = {
  COMBAT: ['pokerHoldDraw', 'combatDuel', 'warOfAttrition'],
  CRIME: ['pressYourLuck', 'threeCardMonte', 'rummy'],
  SOCIAL: ['blackjack', 'texasHoldem', 'euchre'],
  CRAFT: ['deckbuilder', 'solitaireRace', 'cribbage']
};
```

Each action type gets **3 game types** that rotate based on:
- Action difficulty (easy/medium/hard)
- Action context (solo/team/competitive)
- Random variation (30% chance to use alternate)

#### Override System (By Special Actions)
```typescript
const SPECIAL_ACTION_OVERRIDES = {
  'bank-heist': 'texasHoldem',           // High-stakes poker
  'pickpocket': 'threeCardMonte',        // Sleight of hand
  'safecracking': 'solitaireRace',       // Methodical puzzle
  'gang-treaty': 'texasHoldem',          // Strategic negotiation
  'territory-siege': 'warOfAttrition',   // Endurance warfare
  'gang-raid': 'euchre',                 // Team coordination
  'espionage': 'rummy',                  // Gathering intelligence
  'stock-trading': 'cribbage',           // Economic calculation
  // ... 50+ special overrides
};
```

### Phase 3: Variety Algorithm

**Selection Logic:**
```typescript
function selectGameType(action: IAction): GameType {
  // 1. Check for special override first
  if (SPECIAL_ACTION_OVERRIDES[action.id]) {
    return SPECIAL_ACTION_OVERRIDES[action.id];
  }

  // 2. Get default pool for action type
  const gamePool = DEFAULT_GAME_MAPPINGS[action.type];

  // 3. Filter by difficulty
  const suitableGames = gamePool.filter(game =>
    matchesDifficulty(game, action.difficulty)
  );

  // 4. Apply weighted randomness (favor variety)
  return weightedRandom(suitableGames, recentGamesPlayed);
}
```

**Variety Tracking:**
- Track last 10 games played by user
- Reduce weight of recently played games by 50%
- Ensure no game repeats more than 2x in a row
- Reset tracking every 24 hours

## Implementation Plan

### Step 1: Design Game Mechanics (Week 1)
**Files to Create:**
- `docs/CARD_GAME_MECHANICS.md` - Detailed rules for each new game
- `server/src/types/gameTypes.ts` - TypeScript interfaces for new games

**Tasks:**
- [ ] Write complete rules for all 8 new games
- [ ] Define scoring algorithms
- [ ] Specify skill modifier impacts
- [ ] Create difficulty curves

### Step 2: Implement Core Game Engine Extensions (Week 2-3)
**Files to Modify:**
- `server/src/services/deckGames.ts` - Add 8 new game type handlers

**Tasks:**
- [ ] Implement `playFaro()` function
- [ ] Implement `playThreeCardMonte()` function
- [ ] Implement `playSolitaireRace()` function
- [ ] Implement `playTexasHoldem()` function
- [ ] Implement `playRummy()` function
- [ ] Implement `playWarOfAttrition()` function
- [ ] Implement `playEuchre()` function
- [ ] Implement `playCribbage()` function
- [ ] Update `GameType` union type to include new games
- [ ] Add game-specific interfaces (FaroResult, RummyResult, etc.)

### Step 3: Implement Hybrid Mapping System (Week 3)
**Files to Modify:**
- `server/src/services/actionDeck.service.ts` - Add game selection logic

**New Functions:**
```typescript
selectGameType(action: IAction, recentGames: GameType[]): GameType
getDefaultGamePool(actionType: ActionType): GameType[]
applyVarietyWeighting(games: GameType[], recentGames: GameType[]): GameType[]
```

**Tasks:**
- [ ] Create `DEFAULT_GAME_MAPPINGS` constant
- [ ] Create `SPECIAL_ACTION_OVERRIDES` map
- [ ] Implement `selectGameType()` with variety algorithm
- [ ] Add recent games tracking to character schema
- [ ] Update `playActionWithDeck()` to use new selection logic

### Step 4: Update Action Definitions (Week 4)
**Files to Modify:**
- `server/src/models/Action.model.ts` - Add override fields to 50+ special actions

**Tasks:**
- [ ] Add optional `gameTypeOverride?: GameType` field to IAction
- [ ] Identify 50+ thematic actions for overrides
- [ ] Assign appropriate game types to each override
- [ ] Document override rationale

### Step 5: Frontend Integration (Week 5)
**Files to Create/Modify:**
- `client/src/components/games/FaroGame.tsx`
- `client/src/components/games/ThreeCardMonteGame.tsx`
- `client/src/components/games/SolitaireRaceGame.tsx`
- `client/src/components/games/TexasHoldemGame.tsx`
- `client/src/components/games/RummyGame.tsx`
- `client/src/components/games/WarOfAttritionGame.tsx`
- `client/src/components/games/EuchreGame.tsx`
- `client/src/components/games/CribbageGame.tsx`
- `client/src/pages/ActionChallenge.tsx` - Update to render new games

**Tasks:**
- [ ] Create React components for each game with visual UI
- [ ] Add animations and feedback
- [ ] Update ActionChallenge page to route to correct game component
- [ ] Add tutorial overlays for each new game type

### Step 6: Testing & Balancing (Week 6)
**Files to Create:**
- `server/tests/integration/cardGames.test.ts`
- `server/tests/integration/gameVariety.test.ts`

**Tasks:**
- [ ] Test each game type with various character builds
- [ ] Verify variety algorithm prevents repetition
- [ ] Balance difficulty curves for all games
- [ ] Test special overrides work correctly
- [ ] Verify skill modifiers apply correctly
- [ ] Load test with 1000 sequential actions

## Critical Files to Modify

### Backend (7 files)
1. **`server/src/services/deckGames.ts`** - Core game engine (~2,500 lines after expansion)
2. **`server/src/services/actionDeck.service.ts`** - Game selection logic
3. **`server/src/services/handEvaluator.service.ts`** - May need extensions for new games
4. **`server/src/models/Action.model.ts`** - Add override field
5. **`server/src/models/Character.model.ts`** - Track recent games played
6. **`server/src/types/index.ts`** - Update GameType union
7. **`server/src/controllers/action.controller.ts`** - Return game type to frontend

### Frontend (10 files)
1. **`client/src/components/games/FaroGame.tsx`** - NEW
2. **`client/src/components/games/ThreeCardMonteGame.tsx`** - NEW
3. **`client/src/components/games/SolitaireRaceGame.tsx`** - NEW
4. **`client/src/components/games/TexasHoldemGame.tsx`** - NEW
5. **`client/src/components/games/RummyGame.tsx`** - NEW
6. **`client/src/components/games/WarOfAttritionGame.tsx`** - NEW
7. **`client/src/components/games/EuchreGame.tsx`** - NEW
8. **`client/src/components/games/CribbageGame.tsx`** - NEW
9. **`client/src/pages/ActionChallenge.tsx`** - Update routing
10. **`client/src/types/index.ts`** - Update GameType union

## Success Metrics

### Variety Metrics
- **Goal:** No player experiences same game type more than 2x in a row
- **Measurement:** Track game type sequences in analytics
- **Target:** 95% of sessions have 3+ different games in first 10 actions

### Engagement Metrics
- **Goal:** Increased action completion rates
- **Measurement:** Compare action abandonment before/after
- **Target:** 20% reduction in action abandonment

### Balance Metrics
- **Goal:** All game types have similar success rates for equal difficulty
- **Measurement:** Win rate by game type and character level
- **Target:** All games within 10% win rate of each other at same difficulty

## Risk Assessment

### High Risk
- **Complexity Creep:** 8 new games = significant code volume
  - *Mitigation:* Reuse existing card/hand evaluation code, create shared utilities

- **Balance Difficulty:** Each game needs proper difficulty tuning
  - *Mitigation:* Start with simple mechanics, iterate based on playtest data

### Medium Risk
- **Frontend Performance:** 8 new game UIs with animations
  - *Mitigation:* Lazy load game components, optimize animations

- **Testing Coverage:** Need to test 13 total game types
  - *Mitigation:* Create game type test factory, parameterized tests

### Low Risk
- **Player Confusion:** Learning 8 new game types
  - *Mitigation:* Tutorial overlays, help screens, gradual introduction

## Timeline

- **Week 1:** Design all game mechanics
- **Week 2-3:** Implement backend game engine extensions
- **Week 3:** Implement hybrid mapping system
- **Week 4:** Update action definitions with overrides
- **Week 5:** Build frontend components
- **Week 6:** Testing, balancing, polish

**Total:** 6 weeks for complete implementation

## Next Steps

1. Review and approve this plan
2. Decide which game types to implement first (recommend starting with 3)
3. Begin with detailed game mechanics design document
4. Create implementation branch: `feature/card-game-expansion`
5. Start backend implementation with unit tests
