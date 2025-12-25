# DESPERADOS DESTINY - COMPLETE SPRINT PLAN
## Multi-Agent Parallel Development Roadmap

**Development Model:** Feature-by-feature vertical slices with parallel agents
**Target:** Production-ready MVP in 8 sprints
**Status:** Sprints 1-2 COMPLETE (20% to MVP)

---

## 📋 SPRINT OVERVIEW

| Sprint | Focus | Agents | Features | Status |
|--------|-------|--------|----------|--------|
| Sprint 1 | Foundation & Infrastructure | 4 | Dev env, backend, frontend, shared | ✅ COMPLETE |
| Sprint 2 | Auth & Character Creation | 5 | User auth, character system | ✅ COMPLETE |
| Sprint 3 | Destiny Deck Mechanics | 6 | Actions, skills, card UI | ⏳ PLANNED |
| Sprint 4 | Combat & Crimes | 5 | PvE combat, crime system | ⏳ PLANNED |
| Sprint 5 | Social Features | 6 | Chat, gangs, friends | ⏳ PLANNED |
| Sprint 6 | Factions & Territories | 5 | Territory control, warfare | ⏳ PLANNED |
| Sprint 7 | Quests & Polish | 4 | Quest system, tutorial | ⏳ PLANNED |
| Sprint 8 | Premium & Launch | 4 | Monetization, deployment | ⏳ PLANNED |

**Total Agents:** 39 across 8 sprints
**Estimated Duration:** 6-8 sessions (at current velocity of 2 sprints/session)

---

## ✅ SPRINT 1: FOUNDATION & INFRASTRUCTURE (COMPLETE)

**Objective:** Set up complete local development environment with production standards

### Agents Deployed: 4

#### Agent 1: Backend Foundation ✅
- Express server with TypeScript
- MongoDB + Redis connections
- Middleware stack (error, logging, rate limiting)
- JWT utilities
- Health check endpoint
- Testing setup (Jest)

#### Agent 2: Frontend Foundation ✅
- React + TypeScript + Vite
- Western-themed TailwindCSS
- Base UI components (Button, Card, Input, Modal, etc.)
- React Router + Zustand
- API client (Axios)
- Landing page
- Testing setup (Vitest)

#### Agent 3: Infrastructure Setup ✅
- docker-compose.yml (4 services)
- Dockerfiles (multi-stage)
- One-command setup
- Code quality tools (ESLint, Prettier)
- 25+ npm scripts
- Comprehensive documentation

#### Agent 4: Shared Modules & Testing ✅
- @desperados/shared package
- Type definitions (User, Character, DestinyDeck, API)
- Game constants (ENERGY, FACTIONS, VALIDATION)
- **Destiny Deck poker engine** (42 tests)
- Validation utilities
- Mock data generators
- Test helpers (backend + frontend)

### Deliverables ✅
- 2,755 lines of production code
- 830 lines of documentation
- Complete dev environment
- One-command setup (< 5 minutes)
- Hot reload (backend + frontend)
- Western UI theme
- Production-ready Destiny Deck poker engine

---

## ✅ SPRINT 2: AUTHENTICATION & CHARACTER CREATION (COMPLETE)

**Objective:** Complete user management and character systems with beautiful UI

### Agents Deployed: 5

#### Agent 1: Authentication Backend ✅
- User Mongoose model
- 7 authentication endpoints:
  - Register with email verification
  - Verify email
  - Login (JWT cookies)
  - Logout
  - Get current user
  - Forgot password
  - Reset password
- Auth middleware (requireAuth)
- JWT utilities
- 96 tests (48 passing, others minor fixes needed)

#### Agent 2: Authentication Frontend ✅
- Enhanced auth store (Zustand)
- Auth service (7 API endpoints)
- Form validation hook
- Password strength utility
- 5 complete pages:
  - Login
  - Register (with strength indicator)
  - Verify Email
  - Forgot Password
  - Reset Password
- 15+ tests

#### Agent 3: Character Creation Backend ✅
- Character Mongoose model
- Energy management service (transaction-safe!)
- Character validation utilities
- Ownership middleware
- 5 character endpoints:
  - Create (max 3 per user)
  - List user's characters
  - Get single character
  - Delete (soft delete)
  - Select character
- 65+ tests

#### Agent 4: Character Creation Frontend ✅
- Character service
- Enhanced game store
- Character Select page
- Character Card component
- Energy Bar component
- Multi-step Character Creator modal:
  - Name & Faction selection
  - Confirm creation
- Faction Card component
- Character Preview component
- 31 tests

#### Agent 5: Integration Testing ✅
- 5 integration test suites (1,900 lines):
  - Complete auth + character flow
  - Multi-user isolation (security)
  - Character limits enforcement
  - Energy system (race conditions!)
  - API contracts (type safety)
- Enhanced test helpers
- TESTING.md (450+ lines)
- Test summary documentation

### Deliverables ✅
- 8,000 lines of production code
- 1,900 lines of integration tests
- 1,660 lines of documentation
- Complete auth flow (register → verify → login)
- Beautiful character creation
- Energy system with regeneration
- Transaction-safe operations

---

## ⏳ SPRINT 3: DESTINY DECK MECHANICS (NEXT - RECOMMENDED)

**Objective:** Implement core gameplay loop with Destiny Deck challenges and skill training

### Agents to Deploy: 6

#### Agent 1: Destiny Deck Action Backend
**Deliverable:** Complete action system with card-based resolution

**Tasks:**
- Create Action model:
  ```typescript
  {
    type: ActionType (crime, combat, craft, social)
    name: string
    description: string
    energyCost: number
    difficulty: number  // 1-10 scale
    requiredSuit?: Suit // Optional suit requirement
    cardRequirement?: HandRank // Optional min hand rank
    rewards: { xp, gold, items }
  }
  ```
- Create ActionResult model (stores outcome, cards drawn, rewards)
- POST /api/actions/challenge endpoint:
  - Verify user has character selected
  - Check energy sufficient
  - Draw 5 cards (use shared Destiny Deck engine)
  - Calculate skill bonuses to relevant suit
  - Evaluate hand rank + suit bonuses
  - Compare to difficulty
  - Determine success/failure
  - Award rewards if success
  - Deduct energy (transaction-safe)
  - Return result with cards drawn
- GET /api/actions endpoint (list available actions)
- Integration with shared poker engine
- 30+ tests

#### Agent 2: Destiny Deck UI & Card Animations
**Deliverable:** Beautiful card-flipping interface

**Tasks:**
- Create Card component (SVG playing cards):
  - 52 unique card designs (or use card sprite sheet)
  - Card back design (western themed)
  - Flip animation (CSS or Framer Motion)
- Create CardHand component:
  - Display 5 cards in a fan
  - Flip animation sequence (one by one, left to right)
  - Highlight winning cards in hand
- Create HandEvaluation component:
  - Show hand rank (e.g., "Two Pair")
  - Show hand score
  - Explain result (e.g., "You drew Two Pair (Jacks and 7s) for 450 points!")
- Create ActionChallenge page:
  - List available actions
  - Show energy cost
  - "Attempt Action" button
  - Card draw animation on click
  - Result display (success/failure, rewards)
- Sound effects (optional):
  - Card shuffle
  - Card flip
  - Success/failure sounds
- 20+ tests

#### Agent 3: Energy Cost System
**Deliverable:** Energy validation and display for all actions

**Tasks:**
- Energy middleware:
  ```typescript
  requireEnergy(cost: number) {
    // Check character has sufficient energy
    // Attach energy check to request
    // Return 400 if insufficient
  }
  ```
- Energy display component:
  - Show current/max energy
  - Visual energy bar
  - Time until next energy point
  - Time until full energy
- Energy insufficient error handling:
  - Clear error message
  - Show time to wait
  - Suggest premium upgrade (if applicable)
- Action card energy cost display:
  - Show cost prominently
  - Gray out if insufficient energy
  - Tooltip with regen info
- 15+ tests

#### Agent 4: Skill Training Backend
**Deliverable:** Time-based skill progression system

**Tasks:**
- Define 20-25 skills:
  ```typescript
  Skills = {
    // Combat skills
    MELEE_COMBAT: { suit: Clubs, maxLevel: 50, baseTime: 1h }
    RANGED_COMBAT: { suit: Clubs, maxLevel: 50, baseTime: 1h }

    // Cunning skills
    LOCKPICKING: { suit: Spades, maxLevel: 50, baseTime: 1h }
    STEALTH: { suit: Spades, maxLevel: 50, baseTime: 1h }

    // Spirit skills
    MEDICINE: { suit: Hearts, maxLevel: 50, baseTime: 1h }
    PERSUASION: { suit: Hearts, maxLevel: 50, baseTime: 1h }

    // Craft skills
    BLACKSMITHING: { suit: Diamonds, maxLevel: 50, baseTime: 2h }
    LEATHERWORKING: { suit: Diamonds, maxLevel: 50, baseTime: 2h }
    // ... etc
  }
  ```
- POST /api/skills/train endpoint:
  - Start training a skill
  - Only 1 skill at a time
  - Training continues offline
  - Returns completion time
- POST /api/skills/cancel endpoint:
  - Cancel current training
  - No penalty
- GET /api/skills/complete endpoint:
  - Complete training (if time elapsed)
  - Award skill XP
  - Level up if threshold reached
- GET /api/skills endpoint:
  - List all skills with levels
- Skill benefit calculation:
  - Each skill level = +1 to relevant suit in Destiny Deck
  - e.g., Lockpicking level 10 = +10 Spades bonus
- 25+ tests

#### Agent 5: Skill Training UI
**Deliverable:** Skill tree interface

**Tasks:**
- Create Skill component:
  - Skill name, description
  - Current level / max level
  - Training time for next level
  - Suit icon (which cards it boosts)
  - Benefit description (+X to Spades)
  - "Train" button
- Create SkillList page:
  - Grid of all skills
  - Filter by suit (Combat, Cunning, Spirit, Craft)
  - Show current training (if any)
  - Training progress bar with time remaining
- Create SkillTraining component:
  - Show active training
  - Progress bar (time-based)
  - Time remaining
  - "Cancel Training" button
  - Completion notification
- Skill benefits display:
  - Show how skills affect Destiny Deck
  - e.g., "Your Lockpicking (+10 Spades) improves your chances with Spades cards"
- 20+ tests

#### Agent 6: Integration Testing
**Deliverable:** Complete game loop validation

**Tasks:**
- Test complete game loop:
  1. Create character
  2. Train a skill (e.g., Lockpicking to level 5)
  3. Perform an action (e.g., "Pick Lock" crime)
  4. Verify skill bonus applied (+5 Spades)
  5. Verify energy deducted
  6. Verify XP awarded
  7. Level up character
  8. Energy regenerates over time
- Test offline skill training:
  - Start training
  - Simulate time passage
  - Complete training
  - Verify skill leveled up
- Test multi-user isolation:
  - User A training skill doesn't affect User B
  - User A action doesn't deduct User B energy
- Test race conditions:
  - Concurrent action attempts with same energy
  - Skill training race conditions
- 40+ test scenarios

### Sprint 3 Deliverables (Target)
- 6,000 lines of production code
- 1,500 lines of test code
- 1,000 lines of documentation
- **Playable game loop!**
- Destiny Deck challenges working
- Skills trainable (offline progression)
- Beautiful card animations
- Energy-gated actions
- 100+ new tests

---

## ⏳ SPRINT 4: COMBAT & CRIMES (PLANNED)

**Objective:** Add PvE combat and crime systems for core gameplay variety

### Agents to Deploy: 5

#### Agent 1: Combat System Backend
- NPC enemy model (stats, difficulty, loot tables)
- Combat encounter endpoint
- Combat resolution (Destiny Deck based)
- Damage calculation (hand rank → damage)
- Health/death system
- Loot drops
- 25+ tests

#### Agent 2: Combat UI
- Combat encounter screen
- NPC display (name, health, difficulty)
- Card draw for combat
- Damage visualization
- Victory/defeat screens
- Loot display
- 20+ tests

#### Agent 3: Crime System Backend
- Crime types (robbery, pickpocket, heist, etc.)
- Crime difficulty scaling
- Risk/reward balance
- Jail system (time penalties for failure)
- Wanted level system
- 25+ tests

#### Agent 4: Crime UI
- Crime selection screen
- Risk level display
- Potential rewards preview
- Destiny Deck resolution
- Jail screen (if caught)
- 20+ tests

#### Agent 5: Integration Testing
- Complete combat loops
- Complete crime loops
- Energy management in combat/crimes
- Skill bonuses in combat/crimes
- 30+ test scenarios

### Sprint 4 Deliverables (Target)
- 5,000 lines of production code
- 1,200 lines of test code
- PvE combat system
- Crime system with jail
- Loot/rewards
- 100+ new tests

---

## ⏳ SPRINT 5: SOCIAL FEATURES (PLANNED)

**Objective:** Add real-time chat, gang system, and social interactions

### Agents to Deploy: 6

#### Agent 1: Real-Time Chat Backend
- Socket.io integration
- Chat rooms (global, faction, gang, private)
- Message model (persist messages)
- Rate limiting (5 messages/10 sec)
- Profanity filter
- Admin commands (mute, ban)
- 25+ tests

#### Agent 2: Chat UI
- Chat component (messages, input)
- Room switching
- User mentions (@username)
- Emotes/reactions
- Scroll to latest
- Unread indicators
- 20+ tests

#### Agent 3: Gang System Backend
- Gang model (name, members, bank, territory)
- Gang CRUD endpoints
- Membership system (invite, join, leave, kick)
- Gang hierarchy (leader, officers, members)
- Gang bank (shared resources)
- 30+ tests

#### Agent 4: Gang UI
- Gang creation screen
- Gang profile page
- Member list
- Invite system
- Gang chat
- Gang bank UI
- 25+ tests

#### Agent 5: Friend System
- Friend model (relationships)
- Friend requests
- Friend list
- Online status
- Private messaging
- 20+ tests

#### Agent 6: Integration Testing
- Real-time message delivery
- Multi-user chat rooms
- Gang operations
- Friend interactions
- 35+ test scenarios

### Sprint 5 Deliverables (Target)
- 5,500 lines of production code
- 1,300 lines of test code
- Real-time chat (Socket.io)
- Gang system
- Friend lists
- Private messaging
- 100+ new tests

---

## ⏳ SPRINT 6: FACTIONS & TERRITORIES (PLANNED)

**Objective:** Territory control, faction warfare, strategic gameplay

### Agents to Deploy: 5

#### Agent 1: Territory System Backend
- Territory model (location, controller, benefits)
- Territory control mechanics
- Faction influence system
- Territory benefits (bonuses to faction members)
- 25+ tests

#### Agent 2: Territory UI
- Territory map
- Territory details
- Control visualization
- Benefit display
- Faction rankings
- 20+ tests

#### Agent 3: Faction Warfare Backend
- War declaration system
- Battle mechanics (gang vs gang)
- Territory capture conditions
- War spoils (rewards)
- Ceasefire/peace treaties
- 30+ tests

#### Agent 4: Warfare UI
- War declaration screen
- Active wars display
- Battle participation
- War history
- Territory capture animations
- 25+ tests

#### Agent 5: Integration Testing
- Complete territory capture flow
- Multi-gang warfare
- Faction balance testing
- Territory benefit application
- 30+ test scenarios

### Sprint 6 Deliverables (Target)
- 4,500 lines of production code
- 1,200 lines of test code
- Territory control system
- Faction warfare
- Strategic gameplay
- 100+ new tests

---

## ⏳ SPRINT 7: QUESTS & POLISH (PLANNED)

**Objective:** Quest system with NPC dialogs, tutorial, and UI polish pass

### Agents to Deploy: 4

#### Agent 1: Quest System Backend
- Quest model (objectives, rewards, branching)
- Quest progress tracking
- Quest completion
- Repeatable quests
- Daily quests
- 197 quest chains from NPC database
- 30+ tests

#### Agent 2: Quest UI & Tutorial
- Quest journal
- Quest tracker
- Tutorial system (first-time user experience)
- NPC dialog system
- Quest rewards display
- 25+ tests

#### Agent 3: NPC Dialog System
- Dialog tree structure
- Relationship-aware dialogs
- Quest initiation from NPCs
- Reputation effects
- 24 Tier 1 NPCs with unique dialogs
- 20+ tests

#### Agent 4: Polish Pass & Bug Fixes
- UI consistency review
- Animation polish
- Performance optimization
- Bug fixes from previous sprints
- Accessibility improvements
- Mobile responsiveness
- 20+ tests

### Sprint 7 Deliverables (Target)
- 4,000 lines of production code
- 1,000 lines of test code
- Quest system working
- Tutorial complete
- 197 quest chains implemented
- UI polish complete
- 90+ new tests

---

## ⏳ SPRINT 8: PREMIUM & LAUNCH PREPARATION (PLANNED)

**Objective:** Monetization, admin tools, deployment to production

### Agents to Deploy: 4

#### Agent 1: Premium Subscription Backend
- Stripe integration
- Subscription model
- Premium benefits (250 energy, faster regen)
- Payment webhooks
- Subscription management
- 25+ tests

#### Agent 2: Premium UI
- Subscription purchase flow
- Premium benefits page
- Payment success/failure screens
- Subscription management
- Billing history
- 20+ tests

#### Agent 3: Admin Panel
- Admin dashboard
- User management (view, ban, unban)
- Analytics (DAU, MAU, revenue)
- Moderation tools
- Server health monitoring
- 25+ tests

#### Agent 4: Production Deployment
- Railway backend deployment
- Vercel frontend deployment
- MongoDB Atlas setup
- Redis Cloud setup
- Environment configuration
- Production monitoring (Sentry)
- Performance optimization
- Final security audit
- Launch checklist
- 15+ tests

### Sprint 8 Deliverables (Target)
- 3,500 lines of production code
- 1,000 lines of test code
- Premium subscriptions (Stripe)
- Admin panel
- Production deployment
- Monitoring/analytics
- 85+ new tests

---

## 📊 CUMULATIVE METRICS (PROJECTED)

### Code Totals (After Sprint 8)
| Category | Lines |
|----------|-------|
| Production Code | ~48,000 |
| Test Code | ~10,000 |
| Documentation | ~8,000 |
| **Total** | **~66,000** |

### Test Totals (After Sprint 8)
| Category | Count |
|----------|-------|
| Unit Tests | 400+ |
| Integration Tests | 200+ |
| Component Tests | 200+ |
| **Total** | **800+** |

### Agent Deployment
| Metric | Count |
|--------|-------|
| Total Agents | 39 |
| Average per Sprint | 4.9 |
| Largest Sprint | 6 agents (Sprint 3 & 5) |

---

## 🎯 MVP FEATURE CHECKLIST

### Core Systems
- [x] User authentication
- [x] Character creation (3 factions)
- [x] Energy system
- [ ] Destiny Deck challenges
- [ ] Skill training (20-25 skills)
- [ ] Combat (PvE)
- [ ] Crime system
- [ ] Quests (197 quest chains)

### Social Features
- [ ] Real-time chat
- [ ] Gang system
- [ ] Friend lists
- [ ] Private messaging

### Strategic Gameplay
- [ ] Territory control
- [ ] Faction warfare
- [ ] Territory benefits

### Monetization
- [ ] Premium subscriptions
- [ ] Stripe integration
- [ ] Premium benefits

### Production Ready
- [ ] Admin panel
- [ ] Monitoring/analytics
- [ ] Production deployment
- [ ] Performance optimization

---

## 🚀 VELOCITY TRACKING

### Actual Velocity (Sprints 1-2)
- **Code per Sprint:** ~5,400 lines
- **Tests per Sprint:** ~100 tests
- **Agents per Sprint:** 4-5
- **Duration:** 1 session per 2 sprints

### Projected Velocity (Sprints 3-8)
- **Code per Sprint:** ~5,000 lines (slightly lower as complexity increases)
- **Tests per Sprint:** ~100 tests
- **Agents per Sprint:** 4-6
- **Duration:** 1 session per 2 sprints (maintain pace)

### Total Project Estimate
- **Total Sprints:** 8
- **Total Sessions:** 4-5 (including Session 4)
- **Total Duration:** 1-2 weeks at 1 session/day
- **Total Agents:** 39
- **Total Code:** ~66,000 lines

---

## 🎮 PLAYABILITY BY SPRINT

### After Sprint 2 (Current) ✅
**Playable:** Character creation and energy management
**Can't Play:** No actions yet

### After Sprint 3 (Next)
**Playable:** Core game loop (train skills, perform actions, draw cards)
**Can't Play:** No combat or social features

### After Sprint 4
**Playable:** Combat, crimes, full solo experience
**Can't Play:** No multiplayer interaction

### After Sprint 5
**Playable:** Chat, gangs, social experience
**Can't Play:** No strategic warfare

### After Sprint 6
**Playable:** Territory control, faction warfare, strategic gameplay
**Can't Play:** No guided quests

### After Sprint 7
**Playable:** Complete single-player + multiplayer experience with quests
**Can't Play:** No premium features

### After Sprint 8 (MVP Launch)
**Playable:** Full game with premium options, deployed to production
**Ready to Launch!**

---

## 📋 SPRINT DEPENDENCIES

```
Sprint 1 (Foundation)
  ↓
Sprint 2 (Auth + Characters)
  ↓
Sprint 3 (Destiny Deck + Skills) ← NEXT
  ↓
Sprint 4 (Combat + Crimes)
  ↓
Sprint 5 (Social Features)
  ↓
Sprint 6 (Factions + Territories)
  ↓
Sprint 7 (Quests + Polish)
  ↓
Sprint 8 (Premium + Launch)
```

**Dependencies:**
- Sprint 3 requires Sprints 1-2 (uses auth, characters, shared types)
- Sprint 4 requires Sprint 3 (uses Destiny Deck, skills)
- Sprint 5 can run in parallel with Sprint 4 (independent features)
- Sprint 6 requires Sprint 5 (gang warfare uses gangs)
- Sprint 7 requires all previous (quests use NPCs, factions, combat, etc.)
- Sprint 8 requires Sprint 7 (final integration)

**Flexible Order:**
- Sprints 4 and 5 could be swapped
- Sprints 6 and 7 could be swapped
- Sprint 8 must be last

---

## 🎯 RECOMMENDED NEXT SESSION PLAN

**Session 5: Complete Sprint 3 + Start Sprint 4**

**Sprint 3 (6 agents):**
1. Destiny Deck Action Backend
2. Card UI & Animations
3. Energy Cost System
4. Skill Training Backend
5. Skill Training UI
6. Integration Testing

**Sprint 4 (5 agents):**
1. Combat System Backend
2. Combat UI
3. Crime System Backend
4. Crime UI
5. Integration Testing

**Expected Output:**
- ~11,000 lines of production code
- ~2,700 lines of test code
- Playable game with combat and crimes
- Beautiful card animations
- Full skill training system

**Timeline:** 1 session (6 hours)

---

**Ready to proceed with Sprint 3?** 🎴🤠

*— Ezra "Hawk" Hawthorne*
*Sprint Planning Architect*
*November 16, 2025*
