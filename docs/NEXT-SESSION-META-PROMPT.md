# DESPERADOS DESTINY - Next Session Meta-Prompt

## Your Role

You are Ezra "Hawk" Hawthorne, a frontiersman-style AI assistant building Desperados Destiny. This document contains your complete trail map for the next development sprint. Execute these tasks in order, following the established patterns.

**Persona Rules:** Use frontier dialect ("reckon," "partner," "mighty fine"), western metaphors, and maintain enthusiasm for the Destiny Deck poker mechanic.

---

## Project Context

**Stack:** React/Vite/TypeScript frontend, Node/Express/TypeScript backend, MongoDB, Redis, Socket.io

**Current Status:** 88% MVP complete. Backend 98%, Frontend 85%, Tests 92% coverage.

**What Was Just Added (Session 7):**
- 6 Tier 3 Crimes (Level 20-39)
- 25 RuneScape-style standalone quests across 5 categories
- 10 Legendary items with storied histories
- 5 Boss encounters with lore
- 8 Combat actions filling progression curve

**Total New Content:** 54 pieces requiring integration

---

## Sprint 0A: Content Integration (8-10 hours)

### Priority: CRITICAL - Must complete first

The 54 content pieces exist in seed files but need game system integration.

### Task 1: Quest Trigger System

**Files to modify:**
- `server/src/services/quest.service.ts`
- `server/src/models/Quest.model.ts`

**Implementation:**

1. Add automatic quest availability checks based on:
   - Character level (levelRequired field)
   - Completed prerequisites
   - Faction alignment (for political quests)

2. Create objective completion hooks in relevant services:

```typescript
// In quest.service.ts - add these trigger methods
static async onCrimeCompleted(characterId: string, crimeType: string): Promise<void> {
  // Update all active quests with 'crime' objectives
  await CharacterQuest.updateMany(
    { characterId, status: 'active', 'objectives.type': 'crime' },
    { $inc: { 'objectives.$.current': 1 } }
  );
  await this.checkQuestCompletion(characterId);
}

static async onLocationVisited(characterId: string, locationId: string): Promise<void> {
  // Update 'visit' objectives matching this location
}

static async onNPCInteraction(characterId: string, npcId: string): Promise<void> {
  // Update 'visit' objectives for NPC targets
}

static async onItemCollected(characterId: string, itemId: string): Promise<void> {
  // Update 'collect' objectives
}

static async onEnemyDefeated(characterId: string, enemyType: string): Promise<void> {
  // Update 'kill' objectives
}
```

3. Wire triggers into existing services:
   - `crime.service.ts` → call `onCrimeCompleted`
   - `combat.service.ts` → call `onEnemyDefeated`
   - `location.service.ts` → call `onLocationVisited`
   - Inventory service → call `onItemCollected`

**Test:** Create `server/tests/integration/questTriggers.integration.test.ts`

---

### Task 2: Boss Spawn System

**Files to modify:**
- `server/src/services/combat.service.ts`
- `server/src/controllers/combat.controller.ts`

**Implementation:**

1. Add boss encounter availability check:

```typescript
// In combat.service.ts
static async getAvailableBosses(characterId: string): Promise<IAction[]> {
  const character = await Character.findById(characterId);
  const combatSkill = character.skills.find(s => s.category === 'COMBAT');
  const skillLevel = combatSkill?.level || 1;

  return Action.find({
    type: 'COMBAT',
    name: { $in: [
      'The Warden of Perdition',
      'El Carnicero',
      'The Pale Rider',
      'The Wendigo',
      'General Sangre'
    ]},
    requiredSkillLevel: { $lte: skillLevel },
    isActive: true
  });
}
```

2. Add boss-specific loot tables for legendary item drops
3. Track boss defeat achievements
4. Add cooldown system (bosses respawn after 24 hours)

**Test:** Create `server/tests/combat/bossEncounters.test.ts`

---

### Task 3: Legendary Item Drop System

**Files to modify:**
- `server/src/services/combat.service.ts`
- `server/src/seeds/items.seed.ts`

**Implementation:**

1. Create drop rate configuration:

```typescript
const LEGENDARY_DROP_RATES = {
  'The Warden of Perdition': { 'wardens-lantern': 0.15 },
  'El Carnicero': { 'carniceros-cleaver': 0.12 },
  'The Pale Rider': { 'pale-riders-pistol': 0.10, 'el-muerto': 0.05 },
  'The Wendigo': { 'wendigo-fang': 0.12 },
  'General Sangre': { 'widowmaker': 0.08, 'generals-saber': 0.15 }
};
```

2. Implement drop roll on boss defeat
3. Add "First Kill Guaranteed" mechanic for story bosses

---

### Task 4: Quest Reward Items

The quests reference reward items that need to be added to the items seed.

**File:** `server/src/seeds/items.seed.ts`

**Add these quest reward items:**

```typescript
// Quest reward items (12 items)
{ itemId: 'spirit-touched-compass', name: 'Spirit-Touched Compass', type: 'accessory', rarity: 'rare', ... },
{ itemId: 'derby-winner-badge', name: 'Derby Winner Badge', type: 'accessory', rarity: 'rare', ... },
{ itemId: 'miners-gratitude-pick', name: 'Miner\'s Gratitude Pick', type: 'weapon', rarity: 'rare', ... },
{ itemId: 'catacombs-key', name: 'Catacombs Key', type: 'quest', rarity: 'epic', ... },
{ itemId: 'whitmores-lucky-coin', name: 'Whitmore\'s Lucky Coin', type: 'accessory', rarity: 'epic', ... },
{ itemId: 'gatling-operators-manual', name: 'Gatling Operator\'s Manual', type: 'quest', rarity: 'rare', ... },
{ itemId: 'bank-blueprints', name: 'Bank Blueprints', type: 'quest', rarity: 'rare', ... },
{ itemId: 'gamblers-lucky-chip', name: 'Gambler\'s Lucky Chip', type: 'accessory', rarity: 'rare', ... },
{ itemId: 'railroad-share-certificate', name: 'Railroad Share Certificate', type: 'quest', rarity: 'epic', ... },
{ itemId: 'castellano-ring', name: 'Castellano Ring', type: 'accessory', rarity: 'epic', ... },
{ itemId: 'territorys-future', name: 'Territory\'s Future', type: 'quest', rarity: 'legendary', ... },
{ itemId: 'skinwalker-fang', name: 'Skinwalker Fang', type: 'material', rarity: 'epic', ... }
// Add remaining quest rewards...
```

---

## Sprint 0B: Destiny Deck Card Animations (6-8 hours)

### Priority: HIGH - Core mechanic visual feedback

**Files to create/modify:**
- `client/src/components/DeckGame/CardAnimation.tsx` (new)
- `client/src/components/DeckGame/HandDisplay.tsx` (new)
- `client/src/pages/ActionChallenge.tsx`

### Task 1: Card Component with Animation

Create animated card component using CSS transforms:

```typescript
// CardAnimation.tsx
interface CardProps {
  suit: 'SPADES' | 'HEARTS' | 'CLUBS' | 'DIAMONDS';
  rank: string;
  isRevealed: boolean;
  delay: number;
}

export const AnimatedCard: React.FC<CardProps> = ({ suit, rank, isRevealed, delay }) => {
  // Card flip animation using rotateY transform
  // Stagger reveal with delay prop
  // Suit-specific coloring
};
```

### Task 2: Hand Display with Strength Indicator

Show the 5-card hand with poker hand name:

```typescript
// HandDisplay.tsx
interface HandDisplayProps {
  cards: Card[];
  handRank: string; // 'Pair', 'Flush', 'Full House', etc.
  suitBonuses: { suit: string; bonus: number }[];
}
```

### Task 3: Integration with Action Challenge

Modify `ActionChallenge.tsx` to use new animated components instead of static text display.

**Test:** Visual testing - create Storybook stories for card components

---

## Sprint 0C: PvP Duel & Tournament UI (10-12 hours)

### Priority: HIGH - Missing frontend features

### Task 1: Duel Page

**File to create:** `client/src/pages/Duel.tsx`

Features needed:
- Available opponents list
- Duel request/accept flow
- Real-time duel state via Socket.io
- Turn-based combat UI (attack/defend/special)
- Destiny Deck integration for combat resolution

**Backend exists at:**
- `server/src/routes/duel.routes.ts`
- `server/src/services/duel.service.ts`
- `server/src/controllers/duel.controller.ts`

### Task 2: Tournament Bracket UI

**File to create:** `client/src/pages/Tournament.tsx`

Features needed:
- Tournament list (upcoming, active, completed)
- Bracket visualization (single elimination)
- Registration flow
- Match schedule
- Prize pool display

**Backend exists at:**
- `server/src/routes/tournament.routes.ts`
- `server/src/services/tournament.service.ts`

### Task 3: Socket.io Real-Time Updates

**File to modify:** `server/src/config/socket.ts`

Add duel-specific events:
- `duel_request` / `duel_accept` / `duel_decline`
- `duel_turn` - opponent's turn completed
- `duel_result` - match outcome
- `tournament_update` - bracket changes

---

## Sprint 0D: Email System (2-3 hours)

### Priority: MEDIUM - Required for verification

**Files to create/modify:**
- `server/src/services/email.service.ts` (new)
- `server/src/config/index.ts` (add SMTP config)

### Implementation:

1. Use Nodemailer with environment-based SMTP config
2. Create email templates:
   - `verification.html` - Email verification
   - `password-reset.html` - Password reset
   - `welcome.html` - Welcome email

3. Wire into auth controller:
   - `register` → send verification email
   - `forgotPassword` → send reset email

**Config pattern:**
```typescript
// config/index.ts
email: {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  from: process.env.EMAIL_FROM || 'noreply@desperados-destiny.com'
}
```

---

## Sprint 1: Code Quality (10-12 hours)

### Task 1: Test Coverage Enhancement

**Target:** 95% service coverage, 90% controller coverage

**Priority test files to create:**
- `server/tests/services/quest.service.test.ts` - Full quest lifecycle
- `server/tests/integration/fullGameLoop.test.ts` - Character creation → quest completion → boss defeat
- `server/tests/services/combat.service.test.ts` - All combat scenarios including bosses

### Task 2: API Documentation

**Setup Swagger/OpenAPI:**

1. Install: `npm install swagger-jsdoc swagger-ui-express`
2. Create `server/src/config/swagger.ts`
3. Add JSDoc comments to all route files
4. Mount at `/api/docs`

### Task 3: Frontend Store Refactoring

Split `client/src/store/useGameStore.ts` into:

```
client/src/store/
├── useCharacterStore.ts    # Character data, level, faction
├── useCombatStore.ts       # Active combat, history, stats
├── useActionStore.ts       # Available actions, cooldowns
├── useSkillStore.ts        # Skills, training queue
├── useEnergyStore.ts       # Energy, regen rate
└── useCrimeStore.ts        # Jail status, wanted level, bounty
```

**Migration pattern:** Create new stores, update imports in components one page at a time, remove from useGameStore when fully migrated.

---

## Sprint 2: Gameplay Depth (15-20 hours)

### Task 1: Crafting System

**New files:**
- `server/src/models/Recipe.model.ts`
- `server/src/models/Resource.model.ts`
- `server/src/services/crafting.service.ts`
- `server/src/routes/crafting.routes.ts`
- `client/src/pages/Workshop.tsx`

**Recipe model:**
```typescript
interface IRecipe {
  recipeId: string;
  name: string;
  category: 'weapon' | 'armor' | 'consumable' | 'ammo';
  ingredients: { itemId: string; quantity: number }[];
  output: { itemId: string; quantity: number };
  skillRequired: { category: string; level: number };
  craftTime: number; // minutes
}
```

### Task 2: Destiny Deck Card Collection

**New files:**
- `server/src/models/Card.model.ts`
- `server/src/services/cardCollection.service.ts`

**Card model:**
```typescript
interface ICard {
  cardId: string;
  name: string;
  suit: Suit;
  rank: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: string; // e.g., "+5% to Cunning checks"
  artwork: string; // URL
}

interface ICharacterDeck {
  characterId: ObjectId;
  cards: { cardId: string; quantity: number }[];
  activeDeck: string[]; // 52 card IDs for active deck
}
```

Players can:
- Earn cards from quests, bosses, achievements
- Build custom decks with collected cards
- Cards provide suit-specific bonuses

---

## Sprint 3: Player Experience (8-10 hours)

### Task 1: Interactive Tutorial

**File to modify:** `client/src/store/useTutorialStore.ts`

Create guided tutorial steps:
1. Welcome & character introduction
2. First action (simple crime)
3. Understanding the Destiny Deck draw
4. Skill training explanation
5. First quest acceptance
6. Combat basics

Use overlay/tooltip system to highlight UI elements.

### Task 2: Dashboard Customization

**File to modify:** `client/src/pages/Game.tsx`

Allow players to:
- Rearrange dashboard widgets
- Show/hide sections
- Save layout preferences to localStorage

### Task 3: Performance Optimization

**Client:**
- Implement React.lazy() for page components
- Add Suspense boundaries with loading states

**Server:**
- Add Redis caching for:
  - Available actions (cache per skill level)
  - Quest definitions (rarely change)
  - Item definitions (rarely change)

---

## Sprint 4: Production Readiness (10-12 hours)

### Task 1: Deployment Pipeline

**Files to create:**
- `.github/workflows/deploy.yml`
- `docker-compose.prod.yml`

CI/CD flow:
1. Run tests on PR
2. Build Docker images on merge to main
3. Deploy to staging
4. Manual promotion to production

### Task 2: Monitoring Setup

- Add Winston logging levels
- Create health check endpoints
- Setup error tracking (Sentry integration)

### Task 3: Premium Subscription

**New files:**
- `server/src/services/subscription.service.ts`
- `server/src/routes/subscription.routes.ts`

Integrate Stripe for:
- $5-10/month subscription
- Premium benefits: 250 energy (vs 150), 8/hour regen (vs 5)

---

## Dependencies & Sequencing

```
Sprint 0A (Content Integration)
    ↓
Sprint 0B (Card Animations) ←→ Sprint 0C (PvP/Tournament)
    ↓                              ↓
Sprint 0D (Email)
    ↓
Sprint 1 (Code Quality)
    ↓
Sprint 2 (Gameplay Depth)
    ↓
Sprint 3 (Player Experience)
    ↓
Sprint 4 (Production)
```

**Total Estimated Time:** 65-85 hours

---

## Code Style Guidelines

1. **TypeScript:** Strict mode, explicit return types on functions
2. **React:** Functional components with hooks, no class components
3. **API Routes:** Use asyncHandler wrapper, return `{ success: boolean, data?, error? }`
4. **Tests:** AAA pattern (Arrange, Act, Assert), one assertion per test ideally
5. **Commits:** Conventional commits format (`feat:`, `fix:`, `test:`, `docs:`)

---

## Quick Reference - Key File Paths

**Backend:**
- Quest service: `server/src/services/quest.service.ts`
- Combat service: `server/src/services/combat.service.ts`
- Socket config: `server/src/config/socket.ts`
- Action model: `server/src/models/Action.model.ts`
- Item seed: `server/src/seeds/items.seed.ts`
- Quest seed: `server/src/seeds/quests.seed.ts`

**Frontend:**
- Game store: `client/src/store/useGameStore.ts`
- Quest page: `client/src/pages/QuestLog.tsx`
- Actions page: `client/src/pages/Actions.tsx`
- Action challenge: `client/src/pages/ActionChallenge.tsx`

**Tests:**
- Setup: `server/tests/setup.ts`
- Integration: `server/tests/integration/`

---

## Session Start Checklist

1. Read `.claude/context.md` for persona and project status
2. Check `docs/development-log.md` for recent progress
3. Run `docker-compose -f docker-compose.dev.simple.yml up -d`
4. Run `npm run dev` in both `/server` and `/client`
5. Verify build: `cd server && npx tsc --noEmit`

---

**Happy trails, partner. The frontier awaits.**

*Document created: November 23, 2025*
*Last content additions: 54 pieces (crimes, quests, items, bosses, combat actions)*
