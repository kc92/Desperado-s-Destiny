# DESPERADOS DESTINY - TECHNICAL STACK
## *Detailed Technology Decisions and Rationale*

**Document Purpose:** Explain WHY we chose each technology, not just WHAT we're using
**Author:** Ezra "Hawk" Hawthorne
**Last Updated:** November 15, 2025

---

## OVERVIEW

Desperados Destiny is built on a modern JavaScript stack optimized for real-time browser-based MMORPGs. Every technology choice balances:
- **Performance** - Handle 100+ concurrent users with real-time updates
- **Scalability** - Grow from MVP to thousands of players
- **Developer Experience** - Fast iteration and maintainability
- **Cost** - Reasonable hosting costs for an indie project

---

## BACKEND STACK

### Node.js 18+ LTS

**What It Is:** JavaScript runtime built on Chrome's V8 engine
**Why We Chose It:**

✅ **Real-Time Native:** Event-driven, non-blocking I/O perfect for MMO real-time requirements
✅ **Single Language:** JavaScript/TypeScript on both frontend and backend reduces context switching
✅ **Socket.io Integration:** Seamless WebSocket support for real-time features (chat, live updates)
✅ **Large Ecosystem:** npm has packages for everything we need (authentication, database drivers, etc.)
✅ **Performance:** V8 engine is fast enough for game logic, handles concurrency well
✅ **Async/Await:** Modern async patterns make complex game logic readable

**Alternatives Considered:**
- **PHP (like Torn):** More traditional for browser MMOs, but weaker real-time support and older ecosystem
- **Python (Django/Flask):** Great for complex logic, but slower and less ideal for WebSockets
- **Go:** Excellent performance, but smaller ecosystem and steeper learning curve

**Trade-offs:**
- ❌ Not as fast as compiled languages (Go, Rust) but fast enough for our needs
- ❌ Single-threaded (mitigated by worker threads for heavy computations)

**Verdict:** Best balance of real-time capability, ecosystem, and development speed.

---

### Express.js 4.x

**What It Is:** Minimal web framework for Node.js
**Why We Chose It:**

✅ **Lightweight:** Doesn't impose structure, lets us architect as needed
✅ **Middleware Ecosystem:** Huge selection of middleware for auth, validation, logging, etc.
✅ **REST API:** Simple routing for game API endpoints
✅ **Industry Standard:** Well-documented, huge community, battle-tested
✅ **Flexible:** Can add complexity as needed without fighting framework

**Alternatives Considered:**
- **NestJS:** More opinionated, TypeScript-first, but adds complexity for simpler MVP
- **Fastify:** Faster, but smaller ecosystem
- **Koa:** Modern, but Express is more proven

**Trade-offs:**
- ❌ Minimal = more setup required (but gives us control)
- ❌ Callback-heavy patterns (mitigated by async/await)

**Verdict:** Proven, flexible, doesn't get in our way.

---

### TypeScript 5.x

**What It Is:** Typed superset of JavaScript
**Why We Chose It:**

✅ **Type Safety:** Catch bugs at compile time, not runtime
✅ **Intellisense:** Better developer experience with autocomplete and inline docs
✅ **Refactoring:** Safer large-scale refactors as codebase grows
✅ **Game Logic Clarity:** Complex Destiny Deck calculations benefit from strong typing
✅ **Shared Types:** Define game types once, use in frontend and backend
✅ **Modern Features:** Latest JavaScript features with backward compatibility

**Alternatives Considered:**
- **Plain JavaScript:** Faster to write, but loses type safety
- **Flow:** Facebook's type system, but less popular than TypeScript

**Trade-offs:**
- ❌ Extra build step (minor, handled by tooling)
- ❌ Learning curve for advanced types (but basics are easy)

**Verdict:** Essential for production-quality game with complex logic.

---

### MongoDB 6.x

**What It Is:** NoSQL document database
**Why We Chose It:**

✅ **Flexible Schema:** Character data evolves (new skills, items, features) without migrations
✅ **Document Model:** Store entire character state in one document = fast reads
✅ **JSON-like:** Natural fit for JavaScript/TypeScript codebase
✅ **Horizontal Scaling:** Sharding for future growth if needed
✅ **Geospatial Queries:** Useful for map/territory features (if we expand)
✅ **Embedded Documents:** Inventory, skills, reputation stored with character (fewer joins)

**Why It Fits Our Use Case:**
- **Game State Reads:** Most actions need one player's full state → single document read (fast)
- **Evolving Features:** Adding new character properties post-MVP doesn't require migrations
- **Nested Data:** Character has inventory, skills, cooldowns, etc. → documents handle this naturally

**Alternatives Considered:**
- **PostgreSQL:** Excellent for relational data, ACID guarantees, but:
  - Rigid schema (migrations for every feature)
  - Joins expensive for complex character state
  - Better if we needed complex cross-player analytics (which we don't for MVP)
- **MySQL:** Similar to PostgreSQL, more traditional for browser MMOs like Torn
  - Same trade-offs as PostgreSQL
  - Could work, but less modern

**Trade-offs:**
- ❌ No ACID transactions across documents (okay for our use case)
- ❌ Weaker for complex relational queries (we can add PostgreSQL later for analytics if needed)

**Migration Path:**
If we later need strong relational data (complex guild hierarchies, faction alliances), we can:
- Keep MongoDB for character state (hot data)
- Add PostgreSQL for relational data and analytics (cold data)

**Verdict:** Perfect for flexible, fast character state. Can complement with PostgreSQL later if needed.

---

### Redis 7.x

**What It Is:** In-memory data store (caching and session management)
**Why We Chose It:**

✅ **Blazing Fast:** Microsecond latency for frequently accessed data
✅ **Session Storage:** User sessions and JWT tokens
✅ **Leaderboards:** Sorted sets perfect for rankings (top duelists, wealthiest players)
✅ **Caching:** Cache expensive computations (territory control calculations, gang aggregates)
✅ **Rate Limiting:** Track API request limits per user
✅ **Pub/Sub:** Real-time event broadcasting for Socket.io (multi-server scaling)
✅ **Energy Tracking:** Cache current energy levels for fast reads

**Use Cases in Our Game:**
- **Active Users:** Who's online, where they are (expires after logout)
- **Leaderboards:** Top 100 gunslingers, richest players, etc.
- **Cooldowns:** Combat cooldowns, crime cooldowns (TTL auto-expiry)
- **Session Management:** JWT blacklist for logout, session data
- **Socket.io Adapter:** Allows multiple servers to share real-time state

**Alternatives Considered:**
- **Memcached:** Simpler caching, but Redis has more features (pub/sub, sorted sets)
- **In-Memory Only (no cache):** Simpler, but slower for hot data

**Trade-offs:**
- ❌ In-memory = limited by RAM (but we won't cache everything, just hot data)
- ❌ Data volatile (if Redis crashes, cache is lost → rebuild from MongoDB)

**Verdict:** Essential for performance and real-time features.

---

### Socket.io 4.x

**What It Is:** Real-time bidirectional event-based communication library
**Why We Chose It:**

✅ **Real-Time Chat:** Instant message delivery without polling
✅ **Live Updates:** Energy regen, combat results, territory changes pushed to clients
✅ **WebSocket Abstraction:** Handles fallbacks if WebSockets blocked
✅ **Room Support:** Easy channel management (gang chat, faction chat, location chat)
✅ **Event-Based:** Clean API for game events (onDuel, onCrime, onTerritoryAttack)
✅ **Reconnection Handling:** Auto-reconnect on connection loss
✅ **Redis Adapter:** Scales across multiple servers

**Use Cases in Our Game:**
- **Chat System:** All channels (global, faction, gang, whisper)
- **Live Combat:** Real-time duel updates
- **Notifications:** "You've been attacked!" alerts
- **Energy Updates:** Real-time energy regen updates
- **Territory Alerts:** "Your gang's territory is under attack!"

**Alternatives Considered:**
- **Server-Sent Events (SSE):** One-way server → client, not bidirectional
- **Long Polling:** Old approach, less efficient
- **WebSockets (raw):** Socket.io provides better abstraction and fallbacks

**Trade-offs:**
- ❌ Slightly heavier than raw WebSockets (but worth it for features)
- ❌ Requires careful event handling to avoid memory leaks

**Verdict:** Industry standard for browser-based real-time games.

---

## FRONTEND STACK

### React 18+

**What It Is:** Component-based UI library
**Why We Chose It:**

✅ **Component Reusability:** Card displays, player profiles, skill bars → reusable components
✅ **Virtual DOM:** Efficient re-renders for frequent updates (energy changes, chat messages)
✅ **Large Ecosystem:** Huge library of components and tools
✅ **Hooks:** Clean state management with useState, useEffect, custom hooks
✅ **Developer Tools:** Excellent debugging and dev experience
✅ **Community:** Massive community, easy to find solutions and libraries

**Game-Specific Benefits:**
- **Complex UI:** Character sheet, map view, combat screen → component composition shines
- **Frequent Updates:** Energy ticking, chat messages → React handles efficiently
- **State Management:** Zustand/Redux for game state, React for UI state

**Alternatives Considered:**
- **Vue 3:** Simpler learning curve, but smaller ecosystem
- **Svelte:** Faster, compiles away framework, but less mature ecosystem
- **Vanilla JS:** Maximum control, but would take much longer to build complex UI

**Trade-offs:**
- ❌ Bundle size larger than Svelte (but acceptable for our needs)
- ❌ Requires understanding of component lifecycle (but well-documented)

**Verdict:** Best ecosystem and developer experience for complex game UI.

---

### TypeScript 5.x (Frontend)

**Why We Chose It:** Same reasons as backend
✅ **Shared Types:** Define game types (Character, Skill, Item) once, use everywhere
✅ **Type Safety:** Prevent bugs when passing data between components
✅ **API Contracts:** Frontend knows exact API response structure

**Example:**
```typescript
// shared/types/character.ts
export interface Character {
  id: string;
  name: string;
  faction: 'settler' | 'nahi' | 'frontera';
  skills: { [key: string]: number };
  energy: { current: number; max: number };
}

// Used in both frontend and backend!
```

---

### TailwindCSS 3.x

**What It Is:** Utility-first CSS framework
**Why We Chose It:**

✅ **Fast Styling:** Build custom designs without writing CSS from scratch
✅ **Consistency:** Predefined spacing, colors, fonts keep design consistent
✅ **Responsive:** Mobile-first, easy breakpoints
✅ **Custom Theme:** Can define western color palette, custom fonts
✅ **Tree-Shaking:** Only includes CSS you actually use (small bundle)
✅ **No Naming Conflicts:** Utility classes eliminate CSS naming issues

**Western Theme Example:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'dusty-brown': '#8B7355',
        'canyon-red': '#A0522D',
        'settler-blue': '#4682B4',
        'nahi-turquoise': '#40E0D0',
        'frontera-crimson': '#DC143C',
      },
      fontFamily: {
        'western': ['Clarendon', 'Rockwell', 'serif'],
      }
    }
  }
}
```

**Alternatives Considered:**
- **Bootstrap:** Component library, but less customizable and heavier
- **Styled Components:** CSS-in-JS, but adds runtime overhead
- **Plain CSS/SCSS:** Maximum control, but slower development

**Trade-offs:**
- ❌ HTML can get cluttered with many classes (mitigated by component extraction)
- ❌ Learning curve for utility-first approach (but fast once learned)

**Verdict:** Fastest way to build custom western-themed UI.

---

### Zustand (State Management)

**What It Is:** Lightweight React state management
**Why We Chose It:**

✅ **Simple API:** Easier than Redux, less boilerplate
✅ **No Context Wrapper:** Cleaner than React Context for complex state
✅ **TypeScript Support:** Excellent typing out of the box
✅ **Middleware:** Persistence, dev tools available
✅ **Performance:** Minimal re-renders, fine-grained subscriptions

**Use Cases in Our Game:**
- **User State:** Current logged-in character, authentication status
- **Game State:** Current location, energy, active cooldowns
- **UI State:** Open modals, active chat channel, map zoom level

**Alternatives Considered:**
- **Redux:** More powerful, but way more boilerplate for our needs
- **React Context:** Built-in, but can cause unnecessary re-renders
- **MobX:** Powerful, but steeper learning curve

**Trade-offs:**
- ❌ Less "proven" than Redux for massive apps (but our app isn't that massive for MVP)

**Verdict:** Perfect for MVP. Can migrate to Redux later if complexity demands it.

---

### Socket.io-client 4.x

**What It Is:** Client-side Socket.io library
**Why We Chose It:** Pairs with server-side Socket.io, same benefits

✅ **Auto-Reconnect:** Handles disconnections gracefully
✅ **Event Listeners:** React hooks can subscribe to Socket.io events cleanly
✅ **Room Awareness:** Client knows which chat channels it's in

**Example Usage:**
```typescript
// Custom hook for real-time chat
function useChat(channel: string) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit('joinChannel', channel);
    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.emit('leaveChannel', channel);
  }, [channel]);

  return { messages };
}
```

---

## INFRASTRUCTURE & DEVOPS

### Docker

**What It Is:** Containerization platform
**Why We Chose It:**

✅ **Consistent Environments:** Dev, staging, production all identical
✅ **Easy Setup:** New developer just runs `docker-compose up`
✅ **Isolated Services:** MongoDB, Redis, Node, Nginx each in own container
✅ **Scalability:** Easy to add more backend containers with load balancer
✅ **Deployment:** Most hosting platforms support Docker

**Docker Compose Services:**
- **app:** Node.js backend
- **client:** React frontend (build step)
- **mongodb:** Database
- **redis:** Cache
- **nginx:** Reverse proxy

---

### Nginx

**What It Is:** Web server and reverse proxy
**Why We Chose It:**

✅ **Reverse Proxy:** Route requests to backend API and frontend
✅ **Load Balancing:** Distribute traffic across multiple backend instances
✅ **Static Files:** Serve React build efficiently
✅ **HTTPS Termination:** Handle SSL certificates
✅ **Rate Limiting:** Protect against abuse

**Configuration Example:**
```nginx
# Route /api/* to Node.js backend
location /api/ {
  proxy_pass http://backend:3000;
}

# Serve React frontend
location / {
  root /var/www/client/build;
  try_files $uri /index.html;
}

# WebSocket upgrade for Socket.io
location /socket.io/ {
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_pass http://backend:3000;
}
```

---

### PM2

**What It Is:** Node.js process manager
**Why We Chose It:**

✅ **Auto-Restart:** If backend crashes, PM2 restarts it
✅ **Clustering:** Run multiple Node.js instances for CPU utilization
✅ **Zero-Downtime Reload:** Update code without stopping server
✅ **Logging:** Centralized log management
✅ **Monitoring:** Basic performance metrics

**Alternatives Considered:**
- **Systemd:** Linux native, but less Node.js-specific features
- **Forever:** Simpler, but less features

---

### GitHub Actions (CI/CD)

**What It Is:** GitHub's automation platform
**Why We Chose It:**

✅ **Integrated:** Built into GitHub, no external service needed
✅ **Free:** Generous free tier for private repos
✅ **Automated Testing:** Run tests on every push
✅ **Deployment:** Auto-deploy to staging/production on merge
✅ **Docker Support:** Build and push Docker images

**Example Workflow:**
1. Push code to GitHub
2. GitHub Actions runs:
   - Linting (ESLint, Prettier)
   - Unit tests (Jest)
   - Build TypeScript
   - Build Docker image
3. If tests pass and branch is `main`, deploy to staging
4. Manual approval → deploy to production

---

### DigitalOcean (Initial Hosting)

**What It Is:** Cloud hosting provider
**Why We Chose It (for MVP):**

✅ **Simple Pricing:** Flat-rate droplets, no surprise bills
✅ **Managed Databases:** Managed MongoDB and Redis available
✅ **Docker Support:** App Platform supports Docker deployments
✅ **Cost-Effective:** Cheaper than AWS for small-scale projects
✅ **Good DX:** Easier setup than AWS

**Estimated MVP Costs:**
- **Backend Droplet:** $12-24/month (2-4GB RAM)
- **MongoDB Managed:** $15-30/month
- **Redis Managed:** $10-15/month
- **Total:** ~$40-70/month for MVP

**Migration Path to AWS:**
If we grow beyond DigitalOcean's capacity:
- **AWS EC2:** Backend instances
- **AWS RDS:** Managed databases
- **AWS ElastiCache:** Managed Redis
- **AWS CloudFront:** CDN for static assets
- **Cost:** Higher but scales better

---

### Cloudflare (CDN & Security)

**What It Is:** CDN and security platform
**Why We Chose It:**

✅ **Free Tier:** Generous free CDN and DDoS protection
✅ **Fast Global Delivery:** Cache static assets (images, CSS, JS) worldwide
✅ **DDoS Protection:** Essential for online games (salty players attack servers)
✅ **SSL:** Free SSL certificates
✅ **Analytics:** Basic traffic analytics

**What We Cache:**
- React build files (hashed, cache forever)
- Images and icons
- Fonts

**What We Don't Cache:**
- API requests (dynamic data)
- Socket.io connections (real-time)

---

## DEVELOPMENT TOOLS

### ESLint + Prettier

**What They Are:** Code linting and formatting tools
**Why We Use Them:**

✅ **Consistent Code Style:** Auto-format code, no style debates
✅ **Catch Bugs:** ESLint catches common JavaScript mistakes
✅ **TypeScript Integration:** Works with TypeScript for type errors

**Configuration:**
- **ESLint:** Airbnb config + TypeScript rules
- **Prettier:** 2-space indents, single quotes, trailing commas

---

### Jest (Testing)

**What It Is:** JavaScript testing framework
**Why We Chose It:**

✅ **Unit Testing:** Test Destiny Deck logic, skill calculations, game rules
✅ **TypeScript Support:** Works seamlessly with TS
✅ **Mocking:** Mock database calls for isolated tests
✅ **Snapshot Testing:** Test React components

**What We Test:**
- **Critical Logic:** Destiny Deck hand evaluation, suit bonus calculations
- **Game Rules:** Energy costs, combat outcomes, skill training
- **API Endpoints:** Integration tests for API routes
- **Components:** UI component snapshots

---

### Postman / Insomnia

**What They Are:** API testing tools
**Why We Use Them:**

✅ **Manual API Testing:** Test endpoints during development
✅ **Saved Collections:** Share API examples with team
✅ **Environment Variables:** Switch between dev/staging/prod easily

---

## SECURITY MEASURES

### Authentication

- **bcrypt** (12 rounds): Password hashing
- **jsonwebtoken:** JWT tokens for sessions
- **express-rate-limit:** Rate limiting (prevent brute force)

### Validation

- **express-validator:** Input sanitization and validation
- **mongoose schemas:** Database-level validation

### Protection

- **helmet.js:** Security headers (XSS, clickjacking, etc.)
- **cors:** Controlled cross-origin requests
- **hpp:** HTTP parameter pollution prevention

### Anti-Cheat

- **Server-Side Authority:** All Destiny Deck draws happen on server
- **Transaction Logging:** Every action logged for auditing
- **Cooldown Enforcement:** Server validates timing, not client
- **Impossible Action Detection:** Flag speed hacks, teleporting, etc.

---

## SCALING STRATEGY

### Phase 1: Single Server (MVP)
- 1 backend instance (PM2 clustering for CPU cores)
- 1 MongoDB instance
- 1 Redis instance
- Nginx load balancer

**Capacity:** ~100-500 concurrent users

### Phase 2: Horizontal Backend Scaling
- Multiple backend instances behind Nginx load balancer
- Socket.io Redis adapter (share state across instances)
- MongoDB replica set (read scaling)

**Capacity:** ~500-2000 concurrent users

### Phase 3: Database Sharding
- Shard MongoDB by user ID (distribute load)
- Read replicas for MongoDB
- Redis cluster

**Capacity:** ~2000-10000+ concurrent users

### Phase 4: Microservices (If Needed)
- Separate services: Auth, Chat, Combat, Territory
- Message queue (RabbitMQ) for inter-service communication
- API Gateway

**Capacity:** Tens of thousands of concurrent users

---

## MONITORING & OBSERVABILITY

### Logging
- **Winston:** Structured logging (JSON format)
- **Log Levels:** Error, warn, info, debug
- **Log Aggregation:** Centralized logging (TBD: Loggly, Papertrail, or self-hosted)

### Error Tracking
- **Sentry:** Real-time error tracking and alerts
- **Source Maps:** Debug TypeScript errors in production

### Performance
- **New Relic** or **DataDog:** APM (application performance monitoring)
- **MongoDB Atlas Metrics:** Database performance

### Uptime
- **UptimeRobot:** Free uptime monitoring, alerts if server down

---

## PAYMENT PROCESSING

### Stripe

**What It Is:** Payment processing platform
**Why We Chose It:**

✅ **PCI Compliance:** We don't handle credit cards directly
✅ **Subscriptions:** Built-in recurring billing for premium
✅ **Webhooks:** Server notified when payment succeeds/fails
✅ **Testing Mode:** Test payments without real money
✅ **International:** Supports many countries and currencies

**What We Use It For:**
- Premium subscriptions ($5-10/month)
- Premium token purchases (one-time payments)

**Security:**
- No credit card data stored in our database
- Stripe handles all sensitive data
- Webhook signatures verified to prevent fraud

---

## SUMMARY: WHY THIS STACK?

| Requirement | Technology | Justification |
|-------------|------------|---------------|
| Real-time updates | Node.js + Socket.io | Event-driven, non-blocking, native WebSocket support |
| Complex game logic | TypeScript | Type safety for Destiny Deck calculations, shared types |
| Flexible character data | MongoDB | Document model, no migrations, fast single-document reads |
| Fast hot data | Redis | In-memory cache for leaderboards, sessions, cooldowns |
| Dynamic UI | React + TailwindCSS | Component reusability, fast custom theming |
| Payments | Stripe | PCI compliance, subscription support, secure |
| Deployment | Docker + Nginx | Consistent environments, easy scaling |
| Hosting | DigitalOcean → AWS | Cost-effective start, migration path to scale |

---

## ALTERNATIVE STACKS CONSIDERED

### Option A: Traditional LAMP (Like Torn)
- **PHP, MySQL, Apache, jQuery**
- **Pros:** Proven for browser MMOs, simple
- **Cons:** Weaker real-time, older patterns, harder to scale

### Option B: Python Full-Stack
- **Django/Flask, PostgreSQL, React**
- **Pros:** Great for complex logic, strong ORM
- **Cons:** Slower, less ideal for WebSockets, smaller JS ecosystem

### Option C: Bleeding Edge
- **Rust/Go backend, Svelte frontend, PostgreSQL**
- **Pros:** Maximum performance, modern
- **Cons:** Smaller ecosystem, steeper learning curve, slower development

**Verdict:** Our stack (Node.js/React/MongoDB) offers the best balance of:
- Real-time capability
- Development speed
- Ecosystem maturity
- Scalability
- Cost-effectiveness

---

## FUTURE TECHNOLOGY ADDITIONS

**When We Might Add:**
- **PostgreSQL:** If we need complex analytics or relational data
- **RabbitMQ:** If we move to microservices architecture
- **GraphQL:** If REST API becomes too chatty
- **Kubernetes:** If we need more advanced container orchestration
- **Elasticsearch:** If we need advanced search (player search, item search)

**But for MVP:** Current stack is sufficient and proven.

---

*This stack gives us the foundation to build fast, scale smart, and iterate quickly. Every technology chosen fits our specific needs as a real-time browser MMO with complex game logic.*

**— Ezra "Hawk" Hawthorne**
*Digital Frontiersman*
*November 15, 2025*
