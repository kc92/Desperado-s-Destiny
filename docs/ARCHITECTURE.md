# DESPERADOS DESTINY - ARCHITECTURE OVERVIEW

**Last Updated:** December 14, 2025
**Status:** Production Ready (97% Complete)

---

## Executive Summary

Desperados Destiny is a browser-based persistent MMORPG set in a Mythic Wild West (1875 Sangre Territory). The codebase consists of **~200,000 lines of TypeScript** across server, client, and shared packages, implementing 27 core game systems and 20+ advanced features.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Backend** | Node.js | 18+ LTS | Runtime |
| | Express.js | 4.x | REST API framework |
| | TypeScript | 5.x | Type safety |
| | MongoDB | 6.x | Primary database |
| | Redis | 7.x | Caching & sessions |
| | Socket.io | 4.x | Real-time communication |
| **Frontend** | React | 18.x | UI framework |
| | Vite | 5.x | Build tool |
| | TailwindCSS | 3.x | Styling |
| | Zustand | 4.x | State management |
| **Infrastructure** | Docker | Latest | Containerization |
| | Nginx | Latest | Reverse proxy |

---

## Codebase Statistics

### Backend (`server/src/`)
| Category | Count | Lines of Code |
|----------|-------|---------------|
| Services | 149+ | ~80,000 |
| Controllers | 91 | ~32,000 |
| Models | 101 | ~37,000 |
| Routes | 87 | ~5,000 |
| Socket Handlers | 2 | ~2,000 |
| Middleware | 21 | ~3,000 |
| Background Jobs | 16 | ~2,000 |
| **Total** | **467+** | **~160,000** |

### Frontend (`client/src/`)
| Category | Count |
|----------|-------|
| Pages | 52 |
| Zustand Stores | 23 |
| Custom Hooks | 50+ |
| Services | 15 |
| Component Directories | 28 |

### Shared (`shared/src/`)
| Category | Count |
|----------|-------|
| Type Files | 73 |
| Constant Files | 6 |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Pages     │  │   Stores    │  │     Components          │ │
│  │   (58)      │  │   (22)      │  │     (26 dirs)           │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
│  ┌──────┴────────────────┴──────────────────────┴─────────────┐ │
│  │              Services & Hooks (65+)                        │ │
│  └─────────────────────────┬──────────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │  HTTP/REST   │  WebSocket   │
              │   (Axios)    │  (Socket.io) │
              └──────────────┼──────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                       SERVER (Node.js)                          │
│  ┌─────────────────────────┴──────────────────────────────────┐ │
│  │                     Express + Socket.io                    │ │
│  └──────┬────────────────────────────────────────────┬────────┘ │
│         │                                            │          │
│  ┌──────┴──────┐  ┌────────────────┐  ┌─────────────┴────────┐ │
│  │  Routes     │  │  Controllers   │  │  Socket Handlers     │ │
│  │   (91)      │  │    (91)        │  │      (2)             │ │
│  └──────┬──────┘  └───────┬────────┘  └──────────┬───────────┘ │
│         │                 │                       │             │
│  ┌──────┴─────────────────┴───────────────────────┴───────────┐ │
│  │                    Services (145)                          │ │
│  └──────┬─────────────────┬───────────────────────┬───────────┘ │
│         │                 │                       │             │
│  ┌──────┴──────┐  ┌───────┴───────┐  ┌───────────┴───────────┐ │
│  │  Models     │  │  Middleware   │  │      Jobs             │ │
│  │   (101)     │  │    (15+)      │  │      (10+)            │ │
│  └──────┬──────┘  └───────────────┘  └───────────────────────┘ │
└─────────┼───────────────────────────────────────────────────────┘
          │
     ┌────┴────┐
     │         │
┌────┴────┐ ┌──┴───┐
│ MongoDB │ │Redis │
│  (101   │ │      │
│ models) │ │      │
└─────────┘ └──────┘
```

---

## Directory Structure

```
desperados-destiny/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/          # 26 component directories
│   │   │   ├── CharacterCreator/
│   │   │   ├── chat/
│   │   │   ├── combat/
│   │   │   ├── duel/
│   │   │   ├── errors/
│   │   │   ├── game/
│   │   │   ├── gang/
│   │   │   ├── layout/
│   │   │   ├── marketplace/
│   │   │   ├── tutorial/
│   │   │   └── ui/
│   │   ├── hooks/               # 50+ custom hooks
│   │   ├── pages/               # 58 page components
│   │   ├── services/            # 15 API services
│   │   ├── store/               # 22 Zustand stores
│   │   └── utils/               # Utility functions
│   ├── tests/
│   │   ├── e2e/                 # End-to-end tests
│   │   └── playtests/           # Autonomous bots
│   └── package.json
│
├── server/                      # Node.js Backend
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── controllers/         # 91 request handlers
│   │   ├── data/                # Static game data
│   │   ├── jobs/                # Background jobs
│   │   ├── middleware/          # Express middleware
│   │   ├── models/              # 101 Mongoose models
│   │   ├── routes/              # 91 route files
│   │   ├── services/            # 145 business logic files
│   │   ├── sockets/             # Socket.io handlers
│   │   └── utils/               # Utility functions
│   ├── tests/                   # Backend tests
│   └── package.json
│
├── shared/                      # Shared TypeScript Package
│   └── src/
│       ├── types/               # 78 type definition files
│       └── constants/           # 5 constant files
│
├── docs/                        # Documentation (100+ files)
├── scripts/                     # Development scripts
├── docker/                      # Docker configuration
└── package.json                 # Root workspace
```

---

## Implemented Systems (90+ Total)

### Core Gameplay (30 systems)
| # | System | Description |
|---|--------|-------------|
| 1 | Authentication | JWT (1h) + refresh tokens (7d), email verification |
| 2 | Account Security | Brute-force protection, 10-attempt lockout |
| 3 | Character Management | 3 factions, multiple characters per user |
| 4 | Energy System | Regeneration, free/premium tiers |
| 5 | Destiny Deck Engine | Poker-based action resolution (2,305 LOC) |
| 6 | Skill Training | 28 skills in 4 categories, offline progression |
| 7 | Combat (PvE) | Turn-based with NPC AI, hand-based damage |
| 8 | PvP Duels | Real-time Socket.io, perception, abilities |
| 9 | Crime System | 10+ crime types, wanted levels |
| 10 | Jail/Bail/Bounty | Consequences, bounty hunting |
| 11 | Gang System | Hierarchy, bank, perks, upgrades |
| 12 | Territory Control | 12 territories, influence mechanics |
| 13 | Gang Wars | Contributions, deck-based resolution |
| 14 | Faction Wars | Large-scale conflicts |
| 15 | NPC Gang Conflicts | Tributes, challenges, boss fights |
| 16 | Real-time Chat | Socket.io, 4 room types |
| 17 | Mail System | Gold/item attachments |
| 18 | Friend System | Online presence tracking |
| 19 | Notifications | 8 notification types |
| 20 | Shop/Inventory | 6 equipment slots, item rarity |
| 21 | Marketplace | Auctions, buy-now listings |
| 22 | Property System | Ownership, taxes, foreclosure |
| 23 | Quest System | 14+ quests, procedural templates |
| 24 | Legendary Quests | Branching choices, world effects |
| 25 | Achievements | 6 categories, 4 tiers |
| 26 | Leaderboards | Multiple ranking categories |
| 27 | Weather System | Dynamic conditions |
| 28 | Day/Night Cycle | Time-based events, NPC schedules |
| 29 | Calendar/Events | Seasonal content, holidays |
| 30 | Tutorial System | Core + deep-dive modules |

### Economy & Production (15 systems)
- Gold Economy with transaction audit trail
- Banking System (loans, savings)
- Property Tax System (delinquency stages, foreclosure auctions)
- Crafting System (raw → refined → components)
- Production System (slots, batch processing)
- Workshop System (repairs, quality upgrades)
- Masterwork System (Shoddy → Legendary quality tiers)
- Specialization Paths (profession mastery)
- Wandering Merchants (schedules, trust progression)
- Gambling Games (Blackjack, Roulette, Craps, Faro, Monte, Wheel)
- High Stakes Events (gambling tournaments)
- Horse Racing (betting, breeding, equipment)
- Shooting Contests (competitions, rankings)
- Daily Contracts (streak bonuses, leaderboards)
- Login Rewards (daily calendar, monthly bonuses)

### Combat & Adventure (15 systems)
- Turn-based Combat with NPC AI
- Real-time PvP Duels (perception HUD, abilities, betting)
- World Boss Encounters (5 bosses: Warden, El Carnicero, Pale Rider, Wendigo, General Sangre)
- Boss Phase System (multi-phase mechanics)
- Legendary Hunts (rare creatures, trophies)
- Legendary Combat (specialized encounters)
- Bounty Hunter System (hourly tracking updates)
- Train Robbery (heist mechanics)
- Stagecoach Ambush (travel encounters)
- Heist System (gang heists with role assignments)
- Hunting System (tracking, skinning, trophies)
- Fishing System (fish fighting mechanics)
- Animal Companion System (combat support, bonding)
- Taming System (wild animal capture)
- Conquest System (territory siege and occupation)

### Social & World (20 systems)
- NPC Relationships (trust levels, mood system)
- NPC Gossip System (reputation spreading)
- NPC Reaction System (dynamic responses to player actions)
- Reputation System (10 faction standings)
- Mentor System (training, ability unlocking)
- Chinese Diaspora Network (secret quests, hidden trust)
- Newspaper System (dynamic headline generation)
- Secrets Discovery System
- Crowd System (crime witnesses)
- World Events (dynamic server-wide events)
- Frontier Zodiac (12 signs, peak days, stat bonuses)
- Holiday Events (seasonal rewards)
- Wandering Entertainers (performances, skill learning)
- Mysterious Figure Encounters
- Disguise System (stealth, detection avoidance)
- Bribe System (NPC manipulation)
- Sanity System (corruption effects, hallucinations)
- Ritual System (ceremonies, supernatural effects)
- Death & Resurrection System (penalties, respawn)
- Perception System (reading opponent tells in duels)

### End-Game Content (10 systems)
- Cosmic Horror Storyline (The Scar zone)
- Cosmic Quest System (multi-act, narrative endings)
- Cosmic Ending System (corruption-based story outcomes)
- Reality Distortion (spatial anomalies, warped time)
- Scar Content (elite enemies, daily/weekly challenges)
- Legacy Progression (cross-character unlocks)
- Permanent Unlocks (account-wide progression)
- Balance Validation (economic health monitoring, Gini coefficient)
- Content Validation (integrity checks, orphan detection)
- Cheating Detection (gambling security, exploit detection)

---

## Security Architecture

### Authentication
- JWT access tokens (1-hour expiry)
- Refresh tokens (7-day expiry)
- bcrypt password hashing (12 rounds)
- Account lockout after failed attempts
- Email verification flow

### Middleware Stack
```typescript
// Request processing order
app.use(helmet());           // Security headers
app.use(cors());             // CORS configuration
app.use(rateLimiter);        // Rate limiting
app.use(csrfProtection);     // CSRF protection
app.use(validateInput);      // Input validation
app.use(auditLog);           // Audit logging
```

### Input Validation
- Zod schemas on all endpoints
- Enum validation for known values
- Length limits on string inputs
- Sanitization of user content

### Rate Limiting
- Global: 100 requests/15 minutes
- Auth endpoints: 5 requests/minute
- Admin endpoints: 100 requests/minute
- Friend actions: 20 requests/minute

---

## Database Architecture

### MongoDB Collections (Key Models)

| Collection | Purpose | Indexes |
|------------|---------|---------|
| users | User accounts | email, username |
| characters | Player characters | userId, name, gangId |
| locations | World locations | type, parentId |
| npcs | Non-player characters | type, level |
| items | Item definitions | type, rarity |
| gangs | Gang organizations | name, leaderId |
| territories | Controlled areas | gangId, location |
| marketlistings | Player listings | sellerId, status |
| combatencounters | Fight records | characterId, npcId |
| chatmessages | Chat history | roomId, timestamp |

### Redis Usage

| Key Pattern | Purpose | TTL |
|-------------|---------|-----|
| `session:*` | User sessions | 24h |
| `refresh:*` | Refresh tokens | 7d |
| `ratelimit:*` | Rate limit counters | 15m |
| `csrf:*` | CSRF tokens | 1h |
| `leaderboard:*` | Sorted rankings | 5m |
| `energy:*` | Current energy | 1h |
| `cooldown:*` | Action cooldowns | varies |

---

## Real-Time Communication

### Socket.io Events

**Client → Server:**
```typescript
// Chat
'chat:message'     // Send message
'chat:typing'      // Typing indicator
'chat:joinRoom'    // Join chat room

// Duel
'duel:challenge'   // Issue challenge
'duel:accept'      // Accept challenge
'duel:action'      // Submit action
```

**Server → Client:**
```typescript
// Chat
'chat:message'     // Receive message
'chat:typing'      // Typing indicator
'chat:userJoined'  // User joined room

// Notifications
'notification:new' // New notification
'energy:update'    // Energy changed
'combat:result'    // Combat outcome
```

### Room Structure
- `global` - All connected users
- `faction:{id}` - Faction members
- `gang:{id}` - Gang members
- `location:{id}` - Players at location
- `duel:{id}` - Active duel participants

---

## API Design

### Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
```

### Endpoint Organization
```
/api/v1/
├── auth/           # Authentication (7 endpoints)
├── characters/     # Character management
├── actions/        # Game actions
├── combat/         # Combat system
├── crimes/         # Crime system
├── gangs/          # Gang system
├── chat/           # Chat system
├── marketplace/    # Trading
├── quests/         # Quest system
├── skills/         # Skill training
└── admin/          # Admin operations
```

---

## Error Handling

### Error Response Format
```typescript
{
  success: false,
  error: "Human-readable message",
  code: "ERROR_CODE",
  meta: {
    timestamp: "2025-12-14T10:00:00Z",
    requestId: "req_abc123"
  }
}
```

### Error Boundaries (Client)
- `GameErrorFallback` - Game page errors
- `CombatErrorFallback` - Combat errors
- `DuelErrorFallback` - Duel errors
- `ChatErrorFallback` - Chat errors

### Logging
- Server: Winston with structured JSON
- Client: Custom logger service
- No console.log in production code

---

## Development Environment

### Quick Start
```bash
# Start databases
docker-compose -f docker-compose.dev.simple.yml up -d

# Start application
npm run dev:local
```

### Service URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5001 |
| MongoDB | mongodb://localhost:27017 |
| Redis | redis://localhost:6379 |

### Test Credentials
```
Email:    test@test.com
Password: Test123!
```

---

## Testing Strategy

### Test Types
| Type | Framework | Location |
|------|-----------|----------|
| Unit | Jest | `server/tests/unit/` |
| Integration | Jest + Supertest | `server/tests/integration/` |
| E2E | Playwright | `client/tests/e2e/` |
| Playtest | Custom bots | `client/tests/playtests/` |

### Coverage Targets
- Critical paths: 92%
- Destiny Deck engine: 100%
- Authentication: 100%
- Combat logic: 90%

---

## Monitoring & Observability

### Error Tracking
- Sentry integration (server + client)
- Source maps for production debugging
- User context attached to errors

### Logging
- Winston (server) with log levels
- Custom logger service (client)
- Structured JSON format

### Health Checks
- `/health` endpoint for load balancers
- MongoDB connection status
- Redis connection status

---

## Deployment

### Docker Compose Files
| File | Purpose |
|------|---------|
| `docker-compose.yml` | Base configuration |
| `docker-compose.dev.simple.yml` | Local development |
| `docker-compose.staging.yml` | Staging (planned) |
| `docker-compose.prod.yml` | Production (planned) |

### Environment Variables
See `server/.env.example` and `client/.env.example` for complete configuration.

---

## Performance Optimizations

### Database
- Indexed queries on all patterns
- `.lean()` for read-only operations
- Pagination on list endpoints
- Batch operations where possible

### Caching
- Redis for hot data
- Leaderboard caching (5m TTL)
- Session data caching
- Rate limit counters

### Frontend
- React.memo for expensive components
- Zustand selective subscriptions
- Lazy loading for pages
- Virtual scrolling for long lists

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [PROJECT-STATUS.md](./PROJECT-STATUS.md) | Current progress and metrics |
| [SESSION-HANDOFF.md](./SESSION-HANDOFF.md) | Session continuity notes |
| [technical-stack.md](./technical-stack.md) | Technology decision rationale |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Development workflow |
| [api-specifications.md](./api-specifications.md) | API endpoint details |
| [database-schemas.md](./database-schemas.md) | Data model definitions |
| [game-design-document.md](./game-design-document.md) | Game mechanics |

---

## Quality Metrics

| Metric | Current Status |
|--------|----------------|
| TypeScript Errors | 0 |
| ESLint Errors | 0 |
| Console Statements | 4 (logger only) |
| Circular Dependencies | 0 |
| Security Vulnerabilities | 0 |
| Test Coverage (critical) | 92% |

---

*Architecture documented December 14, 2025*
*Total Codebase: ~200,000 lines of TypeScript*
