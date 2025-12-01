# Card Game Expansion - Implementation Progress

## Session Summary
**Date:** 2025-11-29
**Task:** Expand Destiny Deck system with 8 new card games for variety

## Completed Work

### 1. TypeScript Type System ✅
**File:** `server/src/services/deckGames.ts`

Updated the `GameType` union to include 8 new game types:
```typescript
export type GameType =
  // Original 5 games
  | 'pokerHoldDraw'
  | 'pressYourLuck'
  | 'blackjack'
  | 'deckbuilder'
  | 'combatDuel'
  // New card game expansion (8 games)
  | 'faro'                  // Simple betting on card order
  | 'threeCardMonte'        // Track the card, perception vs sleight of hand
  | 'solitaireRace'         // Time-based puzzle, clear cards in sequence
  | 'texasHoldem'           // Strategic poker variant with community cards
  | 'rummy'                 // Set collection for investigation
  | 'warOfAttrition'        // Endurance contest, card comparison
  | 'euchre'                // Team partnership game
  | 'cribbage';             // Counting/math game
```

### 2. Game Name Mapping ✅
Updated `getGameTypeName()` function to return human-readable names for all 13 game types.

### 3. Proof of Concept: Faro Game ✅
**File:** `server/src/services/deckGames.ts` (lines 1663-1730)

Implemented complete **Faro** game resolver as proof of concept:

**Faro Rules:**
- Classic Old West saloon game
- Simple betting on card order
- Score based on card values (Ace=14, King=13, ..., 2=2)
- Difficulty-based thresholds (Easy: 35, Medium: 50, Hard: 65, Very Hard: 80, Extreme: 95)
- Skill modifiers affect both threshold and score
- Suit matches provide bonus multipliers

**Key Features:**
- ✅ Follows existing architectural patterns
- ✅ Integrates with skill modifier system
- ✅ Provides detailed feedback to players
- ✅ Includes mitigation on failure
- ✅ Compatible with existing game state system

### 4. Resolver Integration ✅
Updated `resolveGame()` switch statement:
- Added case for `'faro'` pointing to `resolveFaroGame()`
- Added temporary fallback for remaining 7 games (uses Faro logic as placeholder)
- Maintains type safety with exhaustive switch

## Current Game Type Distribution

| Action Type | Default Game (Before) | After Expansion (Target) |
|-------------|----------------------|--------------------------|
| COMBAT | Poker Hold/Draw | 3 games (Poker, War of Attrition, Texas Hold'em) |
| CRIME | Press Your Luck | 3 games (Press Your Luck, Three-Card Monte, Faro) |
| SOCIAL | Blackjack | 3 games (Blackjack, Texas Hold'em, Euchre) |
| CRAFT | Deckbuilder | 3 games (Deckbuilder, Solitaire Race, Cribbage) |

**Variety Increase:** 1 game per type → 3 games per type = **200% more variety**

## Next Steps

### Immediate (Next Session)
1. **Implement Remaining 7 Game Resolvers**
   - Three-Card Monte (perception vs sleight of hand)
   - Solitaire Race (time-based puzzle)
   - Texas Hold'em (community cards, strategic)
   - Rummy (set collection)
   - War of Attrition (endurance, card comparison)
   - Euchre (team partnership)
   - Cribbage (counting/math)

2. **Hybrid Game Selection System**
   - **File:** `server/src/services/actionDeck.service.ts`
   - Create `selectGameType()` function
   - Implement default mappings (3 games per action type)
   - Implement special action overrides (50+ thematic actions)
   - Add variety algorithm (track last 10 games, avoid repeats)

3. **Character Model Updates**
   - **File:** `server/src/models/Character.model.ts`
   - Add `recentGamesPlayed: GameType[]` field (tracks last 10 games)
   - Add update logic to rotate array

### Medium Term
4. **Frontend Components**
   - Create React components for each new game
   - Update ActionChallenge page routing
   - Add tutorial overlays for new games

5. **Testing & Balancing**
   - Test each game with various character builds
   - Verify variety algorithm prevents repetition
   - Balance difficulty curves

## Technical Decisions

### ✅ Architectural Choices
1. **Reuse Existing Patterns:** All new games follow the same resolver pattern as existing games
2. **Skill Integration:** Each game uses `calculateSkillModifiers()` for progression
3. **Backward Compatible:** Existing games unchanged, new games additive
4. **Type Safety:** Full TypeScript support prevents runtime errors

### ✅ Variety Strategy
1. **Hybrid Mapping:** Action types have default pools (3 games each)
2. **Special Overrides:** Thematic actions (e.g., "bank heist") override to specific games
3. **Anti-Repeat Algorithm:** Track last 10 games, reduce weight of recent games by 50%
4. **Random Variation:** 30% chance to use alternate game from pool

## Implementation Timeline

- **Session 1 (Today):** ✅ Type system, Faro proof of concept
- **Session 2:** Implement remaining 7 games
- **Session 3:** Hybrid selection system + variety tracking
- **Session 4:** Frontend components
- **Session 5:** Testing & balancing

**Estimated Total:** 5 sessions / ~20 hours

## File Modifications

### Modified Files
1. `server/src/services/deckGames.ts` - Added 8 game types, Faro resolver, updated switch (+73 lines)
2. `CARD_GAME_EXPANSION_PLAN.md` - Comprehensive design document
3. `CARD_GAME_IMPLEMENTATION_PROGRESS.md` - This file

### Files to Modify (Next)
1. `server/src/services/deckGames.ts` - 7 more game resolvers (~500 lines)
2. `server/src/services/actionDeck.service.ts` - Selection system (~200 lines)
3. `server/src/models/Character.model.ts` - Game tracking field (~5 lines)
4. `client/src/components/games/*` - 8 new game components (~2000 lines)
5. `client/src/pages/ActionChallenge.tsx` - Routing updates (~50 lines)

## Success Criteria

### ✅ Completed
- [x] Type system supports 13 game types
- [x] At least 1 new game fully implemented
- [x] TypeScript compiles without errors
- [x] Follows existing architectural patterns

### 🔄 In Progress
- [ ] All 8 games implemented
- [ ] Hybrid selection system
- [ ] Variety tracking

### ⏳ Pending
- [ ] Frontend components
- [ ] Testing & balancing
- [ ] No game repeats >2x in a row (95% of sessions)

## Notes

**Why Start with Faro?**
- Simplest game mechanically (good proof of concept)
- Classic Old West theme (fits game setting)
- Tests the full integration pipeline
- Easy to verify correctness

**Design Philosophy:**
- **Simple games first** (Faro, Three-Card Monte) → Complex later (Texas Hold'em, Euchre)
- **Thematic fit** (all games fit Old West setting)
- **Mechanical diversity** (betting, puzzle, strategy, luck, skill)
- **Progressive complexity** (new players see simple games, experienced players see all)

## Next Session Handoff

**Resume from:** `resolveFaroGame()` is complete and working
**Next task:** Implement `resolveThreeCardMonteGame()` following same pattern
**Reference:** Lines 1663-1730 in `server/src/services/deckGames.ts`

**Pattern to follow:**
```typescript
function resolveNewGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  // 1. Calculate game-specific score
  // 2. Get skill modifiers
  // 3. Calculate threshold
  // 4. Adjust score and threshold
  // 5. Determine success
  // 6. Build feedback string
  // 7. Return GameResult
}
```
