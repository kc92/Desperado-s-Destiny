# Desperados Destiny - Architecture Overview

Comprehensive technical architecture documentation for the Desperados Destiny game platform.

---

## System Overview

Desperados Destiny is a full-stack web-based MMORPG built on a modern TypeScript stack with real-time capabilities.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Browser   │  │   Mobile    │  │   Desktop   │              │
│  │  (React)    │  │  (Future)   │  │  (Future)   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER                               │
│                    (nginx / Cloudflare)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   API Server 1   │ │   API Server 2   │ │   API Server N   │
│  (Express.js)    │ │  (Express.js)    │ │  (Express.js)    │
│  + Socket.io     │ │  + Socket.io     │ │  + Socket.io     │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│    MongoDB       │ │     Redis        │ │   Bull Queues    │
│  (Replica Set)   │ │ (Cache/Pub-Sub)  │ │  (Background)    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## Tech Stack

### Frontend (Client)

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.x |
| **TypeScript** | Type Safety | 5.x |
| **Vite** | Build Tool | 5.x |
| **Zustand** | State Management | 4.x |
| **Tailwind CSS** | Styling | 3.x |
| **Framer Motion** | Animations | 10.x |
| **Socket.io Client** | Real-time | 4.x |
| **Sentry** | Error Tracking | Latest |

### Backend (Server)

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime | 20.x LTS |
| **Express** | HTTP Framework | 4.x |
| **TypeScript** | Type Safety | 5.x |
| **Socket.io** | WebSockets | 4.x |
| **Mongoose** | ODM | 8.x |
| **Bull** | Job Queues | 4.x |
| **Sentry** | Error Tracking | Latest |
| **Helmet** | Security | 7.x |

### Data Layer

| Technology | Purpose | Configuration |
|------------|---------|---------------|
| **MongoDB** | Primary Database | Replica Set (3 nodes) |
| **Redis** | Cache, Sessions, Pub/Sub | Cluster mode |

### DevOps

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **GitHub Actions** | CI/CD |
| **Sentry** | Monitoring |
| **Cloudflare** | CDN/DDoS Protection |

---

## Directory Structure

```
desperados-destiny/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components (212+)
│   │   │   ├── game/       # Game-specific components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── ui/         # Reusable UI components
│   │   │   └── ...
│   │   ├── pages/          # Route pages (80+)
│   │   ├── hooks/          # Custom hooks (50+)
│   │   ├── store/          # Zustand stores (36)
│   │   ├── services/       # API service layer (95+)
│   │   ├── lib/            # Utility libraries
│   │   └── styles/         # Global styles
│   ├── tests/              # Frontend tests
│   └── vite.config.ts
│
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers (108)
│   │   ├── services/       # Business logic (207)
│   │   ├── models/         # Mongoose models (148)
│   │   ├── routes/         # Express routes (106)
│   │   ├── middleware/     # Express middleware
│   │   ├── jobs/           # Bull queue jobs (34)
│   │   ├── sockets/        # Socket.io handlers
│   │   ├── data/           # Static game data
│   │   ├── seeds/          # Database seeds
│   │   ├── utils/          # Utility functions
│   │   └── validation/     # Input validation schemas
│   └── tests/              # Backend tests
│
├── shared/                 # Shared code between client/server
│   └── src/
│       ├── types/          # TypeScript type definitions
│       └── constants/      # Game constants
│
└── docs/                   # Documentation
    ├── architecture/       # Architecture docs
    ├── guides/             # Player guides
    └── ...
```

---

## Core Patterns

### 1. Service Layer Pattern

All business logic resides in service classes, keeping controllers thin.

```typescript
// Controller (thin)
export class CombatController {
  async startCombat(req: Request, res: Response) {
    const result = await CombatService.startCombat(
      req.character._id,
      req.body.enemyId
    );
    res.json({ success: true, data: result });
  }
}

// Service (business logic)
export class CombatService {
  static async startCombat(characterId: ObjectId, enemyId: string) {
    // Validate energy
    // Create encounter
    // Initialize combat state
    // Return encounter
  }
}
```

### 2. Transaction Safety

MongoDB sessions ensure atomic operations.

```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Character.updateOne({ _id }, { $inc: { gold: -100 } }, { session });
  await Property.create([{ ownerId: _id, ... }], { session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 3. Distributed Locking

Redis-based locks prevent race conditions.

```typescript
import Redlock from 'redlock';

const lock = await redlock.acquire([`lock:character:${characterId}`], 5000);
try {
  // Critical section
} finally {
  await lock.release();
}
```

### 4. Event-Driven Updates

Socket.io broadcasts real-time state changes.

```typescript
// Server emits
io.to(`gang:${gangId}`).emit('treasury:updated', { balance });

// Client listens
socket.on('treasury:updated', (data) => {
  useGangStore.getState().setTreasury(data.balance);
});
```

---

## Data Flow

### Request Flow

```
1. HTTP Request
   └─> nginx (rate limit, SSL)
       └─> Express Router
           └─> Middleware Stack
               ├─> Auth Middleware (JWT validation)
               ├─> Character Middleware (load active character)
               ├─> Rate Limiter
               └─> Validation Middleware
                   └─> Controller
                       └─> Service Layer
                           ├─> MongoDB (data)
                           ├─> Redis (cache)
                           └─> Socket.io (broadcast)
                               └─> Response
```

### Real-Time Flow (WebSocket)

```
1. Socket Connection
   └─> Socket.io Server
       └─> Auth Handler (verify JWT)
           └─> Join Rooms (character, gang, location)
               └─> Event Handlers
                   ├─> Combat Updates
                   ├─> Duel Actions
                   ├─> Chat Messages
                   └─> World Events
```

### Background Job Flow

```
1. Job Enqueued
   └─> Bull Queue (Redis-backed)
       └─> Worker Process
           └─> Job Handler
               ├─> Database Updates
               └─> Socket Broadcasts
```

---

## Security Architecture

### Authentication

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───>│   Express   │───>│   MongoDB   │
│  (Browser)  │    │   Server    │    │   (Users)   │
└──────┬──────┘    └──────┬──────┘    └─────────────┘
       │                  │
       │  1. Login        │
       │─────────────────>│
       │                  │
       │  2. JWT Token    │
       │<─────────────────│
       │                  │
       │  3. API Request  │
       │  (Bearer Token)  │
       │─────────────────>│
       │                  │
       │  4. Validated    │
       │  Response        │
       │<─────────────────│
```

### Security Layers

| Layer | Protection |
|-------|------------|
| **Network** | Cloudflare DDoS, WAF |
| **Transport** | HTTPS/TLS 1.3 |
| **Application** | Helmet headers, CORS |
| **Authentication** | JWT with refresh tokens |
| **Authorization** | Role-based (user/admin/mod) |
| **Input** | Zod validation schemas |
| **Database** | Parameterized queries, indexes |
| **Session** | Redis-backed, secure cookies |

### Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 5/min per IP |
| API (general) | 100/min per IP |
| WebSocket | 100 messages/min |
| Admin | No limit (protected by role) |

---

## Scalability Design

### Horizontal Scaling

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  API Server 1   │ │  API Server 2   │ │  API Server N   │
│  (Stateless)    │ │  (Stateless)    │ │  (Stateless)    │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  MongoDB RS     │ │     Redis       │ │  Bull Workers   │
│  (Primary)      │ │   (Cluster)     │ │  (Scalable)     │
│  (Secondary x2) │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Socket.io Scaling

```typescript
// Redis adapter for cross-server pub/sub
import { createAdapter } from '@socket.io/redis-adapter';

const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### Caching Strategy

| Data Type | Cache TTL | Invalidation |
|-----------|-----------|--------------|
| User Session | 24 hours | On logout |
| Character Data | 5 minutes | On update |
| Location Data | 1 hour | Rarely changes |
| Leaderboards | 5 minutes | Scheduled refresh |
| World State | 1 minute | On event |
| Prices | 5 minutes | On transaction |

---

## Background Jobs

### Job Types

| Job | Schedule | Purpose |
|-----|----------|---------|
| `eventSpawner` | Every hour | Spawn world events |
| `warSchedulePhase` | Thursday 23:30 UTC | Auto-tournaments |
| `economyTick` | Every 15 min | Economic updates |
| `decayProcessor` | Every hour | Property decay |
| `combatTimeout` | Every minute | Expire stale combats |
| `customerTraffic` | Every 30 min | Business simulation |
| `protectionPayment` | Weekly | Gang protection |

### Job Queue Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Bull Queues                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ eventQueue   │  │ economyQueue │  │ combatQueue  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │             │
│         ▼                 ▼                 ▼             │
│  ┌──────────────────────────────────────────────────┐    │
│  │              Redis (Job Storage)                  │    │
│  └──────────────────────────────────────────────────┘    │
│         │                 │                 │             │
│         ▼                 ▼                 ▼             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Worker 1    │  │  Worker 2    │  │  Worker N    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## Error Handling

### Error Flow

```
1. Error Thrown
   └─> Express Error Handler
       ├─> Log to Console
       ├─> Report to Sentry
       └─> Return JSON Response
           {
             "success": false,
             "error": {
               "code": "INSUFFICIENT_FUNDS",
               "message": "Not enough gold"
             }
           }
```

### Error Categories

| Code Range | Category |
|------------|----------|
| 400-499 | Client errors (validation, auth) |
| 500-599 | Server errors (bugs, outages) |

### Sentry Integration

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new Sentry.Integrations.Mongo()
  ]
});
```

---

## Monitoring & Observability

### Metrics Tracked

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| API Response Time | Sentry | > 2s |
| Error Rate | Sentry | > 1% |
| Database Query Time | Mongoose | > 500ms |
| Memory Usage | Node.js | > 80% |
| Queue Depth | Bull Dashboard | > 1000 |
| WebSocket Connections | Socket.io | > 10,000 |

### Logging

```typescript
// Structured logging
logger.info('Combat started', {
  characterId,
  enemyId,
  combatId,
  timestamp: new Date()
});
```

### Health Checks

```
GET /api/health
{
  "status": "healthy",
  "uptime": 12345,
  "memory": { ... },
  "database": "connected",
  "redis": "connected"
}
```

---

## Testing Strategy

### Test Layers

```
┌─────────────────────────────────────────┐
│          End-to-End Tests               │  <- Few, slow
│    (Playwright / Cypress)               │
├─────────────────────────────────────────┤
│        Integration Tests                │  <- Some, medium
│    (Supertest + Test DB)                │
├─────────────────────────────────────────┤
│          Unit Tests                     │  <- Many, fast
│    (Jest + Mocks)                       │
└─────────────────────────────────────────┘
```

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['./tests/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70
    }
  }
};
```

---

## Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Actions                               │
│                                                                   │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌─────────┐ │
│  │   Lint    │───>│   Test    │───>│   Build   │───>│  Deploy │ │
│  └───────────┘    └───────────┘    └───────────┘    └─────────┘ │
│       │                │                │                │       │
│       ▼                ▼                ▼                ▼       │
│  ESLint/TSC       Jest Tests      Docker Build    Push to       │
│  Prettier         Coverage        Tag Image       Registry      │
│                   Report                          Update K8s    │
└─────────────────────────────────────────────────────────────────┘
```

### Environments

| Environment | Purpose | Database |
|-------------|---------|----------|
| Development | Local dev | Local MongoDB |
| Staging | Pre-production | Staging DB (anonymized) |
| Production | Live game | Production RS |

---

## Performance Optimizations

### Database

- **Indexes**: All frequently queried fields indexed
- **Read Replicas**: Read operations distributed
- **Connection Pooling**: Mongoose connection pool
- **Query Optimization**: Lean queries, projections

### Caching

- **Redis**: Session, character data, prices
- **In-Memory**: Static game data, constants
- **CDN**: Static assets via Cloudflare

### Frontend

- **Code Splitting**: Route-based lazy loading
- **Asset Optimization**: Vite bundling
- **Service Worker**: Offline capability (future)

---

## Future Considerations

### Planned Improvements

1. **Microservices**: Split into domain services
2. **GraphQL**: API gateway for flexible queries
3. **Kubernetes**: Container orchestration
4. **Event Sourcing**: For critical financial data
5. **Mobile Apps**: React Native clients

### Scalability Targets

| Metric | Current | Target |
|--------|---------|--------|
| Concurrent Users | 1,000 | 10,000 |
| API Requests/sec | 500 | 5,000 |
| Database Size | 10GB | 100GB |
| WebSocket Connections | 5,000 | 50,000 |

---

*Last updated: December 2024*
