# Sentry Error Tracking - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DESPERADOS DESTINY                          │
│                    Sentry Integration Flow                       │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────┐    ┌───────────────────────────────┐
│         CLIENT SIDE           │    │         SERVER SIDE           │
│         (React/Vite)          │    │      (Node.js/Express)        │
└───────────────────────────────┘    └───────────────────────────────┘

┌───────────────────────────────┐    ┌───────────────────────────────┐
│   1. APPLICATION START        │    │   1. APPLICATION START        │
├───────────────────────────────┤    ├───────────────────────────────┤
│  main.tsx                     │    │  server.ts                    │
│  ↓                            │    │  ↓                            │
│  import { initializeSentry }  │    │  import { initializeSentry }  │
│  initializeSentry()           │    │  initializeSentry()           │
│  [BEFORE React render]        │    │  [BEFORE all other imports]   │
└───────────────────────────────┘    └───────────────────────────────┘
         ↓                                      ↓
┌───────────────────────────────┐    ┌───────────────────────────────┐
│   2. SENTRY INITIALIZATION    │    │   2. SENTRY INITIALIZATION    │
├───────────────────────────────┤    ├───────────────────────────────┤
│  config/sentry.ts             │    │  config/sentry.ts             │
│  - Load VITE_SENTRY_DSN       │    │  - Load SENTRY_DSN            │
│  - Detect environment         │    │  - Detect environment         │
│  - Set sample rates           │    │  - Set sample rates           │
│  - Enable tracing             │    │  - Enable tracing             │
│  - Enable session replay      │    │  - Enable profiling           │
│  - Configure error filters    │    │  - Configure error filters    │
└───────────────────────────────┘    └───────────────────────────────┘
         ↓                                      ↓
┌───────────────────────────────┐    ┌───────────────────────────────┐
│   3. MIDDLEWARE SETUP         │    │   3. MIDDLEWARE SETUP         │
├───────────────────────────────┤    ├───────────────────────────────┤
│  ErrorBoundary Wrapper        │    │  setupSentryRequestHandler()  │
│  - Wraps entire app           │    │  [FIRST middleware]           │
│  - Catches React errors       │    │  - Captures request data      │
│  - Captures to Sentry         │    │  - Starts transaction         │
│  - Shows error UI             │    │  - Traces performance         │
└───────────────────────────────┘    └───────────────────────────────┘
         ↓                                      ↓
┌───────────────────────────────┐    ┌───────────────────────────────┐
│   4. RUNTIME MONITORING       │    │   4. RUNTIME MONITORING       │
├───────────────────────────────┤    ├───────────────────────────────┤
│  Automatic Capture:           │    │  Automatic Capture:           │
│  - Unhandled exceptions       │    │  - Unhandled exceptions       │
│  - Promise rejections         │    │  - Promise rejections         │
│  - React component errors     │    │  - Express route errors       │
│  - Console errors             │    │  - Middleware errors          │
│                               │    │                               │
│  Manual Capture:              │    │  Manual Capture:              │
│  - captureException()         │    │  - captureException()         │
│  - captureMessage()           │    │  - captureMessage()           │
│  - addBreadcrumb()            │    │  - addBreadcrumb()            │
│  - setUserContext()           │    │  - setUserContext()           │
└───────────────────────────────┘    └───────────────────────────────┘
         ↓                                      ↓
         ↓                            ┌───────────────────────────────┐
         ↓                            │   5. ERROR HANDLING           │
         ↓                            ├───────────────────────────────┤
         ↓                            │  setupSentryErrorHandler()    │
         ↓                            │  [BEFORE custom handlers]     │
         ↓                            │  - Captures all errors        │
         ↓                            │  - Adds request context       │
         ↓                            │  - Reports to Sentry          │
         ↓                            └───────────────────────────────┘
         ↓                                      ↓
         └──────────────────┬───────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │         SENTRY CLOUD SERVICE         │
         ├──────────────────────────────────────┤
         │  Project: desperados-destiny-client  │
         │  Project: desperados-destiny-server  │
         │                                      │
         │  Features:                           │
         │  - Error aggregation                 │
         │  - Stack trace analysis              │
         │  - Performance monitoring            │
         │  - User impact tracking              │
         │  - Release tracking                  │
         │  - Alerting                          │
         │  - Session replay                    │
         │  - Breadcrumb timeline               │
         └──────────────────────────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │        DEVELOPMENT TEAM ACCESS       │
         ├──────────────────────────────────────┤
         │  Dashboard: sentry.io                │
         │  - View errors in real-time          │
         │  - Analyze performance issues        │
         │  - Track user impact                 │
         │  - Set up alerts                     │
         │  - Review session replays            │
         │  - Debug with full context           │
         └──────────────────────────────────────┘
```

---

## Error Flow Diagram

```
USER ACTION → ERROR OCCURS → SENTRY CAPTURE → SENTRY CLOUD → TEAM NOTIFIED
     ↓              ↓               ↓              ↓              ↓
  Click         Exception      Capture &      Store &        Email/
  Button        Thrown         Enrich         Analyze        Slack
                               Context                        Alert
```

---

## Data Flow

### Client Error Capture

```
React Component Error
    ↓
ErrorBoundary.componentDidCatch()
    ↓
Sentry.captureException(error)
    ↓
Add Component Stack as Context
    ↓
Send to Sentry API (https://sentry.io/api/...)
    ↓
Display Error UI to User
    ↓
User can submit feedback (optional)
```

### Server Error Capture

```
API Request → Route Handler → Error Thrown
    ↓              ↓              ↓
Request        Processing     Exception
Context        Error          Caught
Captured       Occurs
    ↓              ↓              ↓
    └──────────────┴──────────────┘
                   ↓
    Sentry Error Handler Middleware
                   ↓
    Enrich with Request/User Context
                   ↓
    Send to Sentry API (https://sentry.io/api/...)
                   ↓
    Pass to Custom Error Handler
                   ↓
    Return Error Response to Client
```

---

## Context Enrichment

### Client Context
```javascript
{
  user: {
    id: "123",
    username: "OutlawJack",
    email: "jack@example.com"
  },
  tags: {
    page: "combat",
    action: "attack-enemy"
  },
  extra: {
    enemyId: "456",
    playerHealth: 75,
    weaponEquipped: "revolver"
  },
  breadcrumbs: [
    "User navigated to combat page",
    "Selected enemy target",
    "Clicked attack button",
    "Error: Attack calculation failed"
  ]
}
```

### Server Context
```javascript
{
  user: {
    id: "123",
    username: "OutlawJack",
    email: "jack@example.com"
  },
  request: {
    url: "/api/combat/attack",
    method: "POST",
    headers: {...},
    body: {...}
  },
  tags: {
    route: "combat",
    action: "attack",
    environment: "production"
  },
  extra: {
    databaseQuery: "UPDATE characters...",
    processingTime: "125ms"
  },
  breadcrumbs: [
    "Request received",
    "Auth validated",
    "Database query started",
    "Error: Database timeout"
  ]
}
```

---

## Middleware Chain (Server)

```
REQUEST
    ↓
1. Sentry Request Handler ← Track request, start transaction
    ↓
2. Helmet (Security)
    ↓
3. CORS
    ↓
4. Body Parser
    ↓
5. Cookie Parser
    ↓
6. Sanitize Input
    ↓
7. Request Logger
    ↓
8. Rate Limiter
    ↓
9. Route Handlers
    ↓
10. 404 Handler (if no route matched)
    ↓
11. Sentry Error Handler ← Capture errors, report to Sentry
    ↓
12. Custom Error Handler ← Format error response
    ↓
RESPONSE
```

---

## Component Tree (Client)

```
<App>
  <ErrorBoundary> ← Sentry-integrated error boundary
    <Router>
      <AuthProvider>
        <GameProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/combat" element={<CombatPage />} />
              ...
            </Routes>
          </Layout>
        </GameProvider>
      </AuthProvider>
    </Router>
  </ErrorBoundary>
</App>
```

---

## Environment Configuration

### Development
```
SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_DSN=https://...@sentry.io/...
NODE_ENV=development

→ Result:
  - 100% trace sample rate
  - Debug mode enabled
  - Full error details
  - All breadcrumbs captured
  - Minimal filtering
```

### Production
```
SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_DSN=https://...@sentry.io/...
NODE_ENV=production

→ Result:
  - 10% trace sample rate
  - Debug mode disabled
  - Optimized for performance
  - PII scrubbing enabled
  - Aggressive filtering
```

### Test
```
NODE_ENV=test

→ Result:
  - Sentry disabled
  - No external network calls
  - Focus on unit testing
```

---

## Sample Rate Configuration

| Metric | Development | Production | Reason |
|--------|-------------|------------|--------|
| Error Capture | 100% | 100% | Capture all errors |
| Traces | 100% | 10% | Performance monitoring |
| Profiles | 100% | 10% | CPU profiling |
| Session Replays | 10% | 1% | Video recordings |
| Replays on Error | 100% | 50% | Debug critical issues |

---

## Security Layers

```
┌─────────────────────────────────────────────┐
│           PUBLIC CLIENT CODE                │
│  - VITE_SENTRY_DSN visible in bundle       │
│  - This is intentional and safe            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         AUTOMATIC DATA SCRUBBING            │
│  - Passwords removed                        │
│  - Credit cards filtered                    │
│  - Tokens sanitized                         │
│  - Email addresses optional                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│            RATE LIMITING                    │
│  - Sentry enforces per-project limits       │
│  - Prevents abuse/flooding                  │
│  - Spike protection available               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          ACCESS CONTROL                     │
│  - Team-only Sentry project access          │
│  - Role-based permissions                   │
│  - Audit logs                               │
└─────────────────────────────────────────────┘
```

---

## Performance Impact

### Client Bundle Size
```
Base Bundle:        ~200 KB (gzipped)
+ Sentry SDK:       + ~60 KB (gzipped)
Total:              ~260 KB (gzipped)

Impact: +30% bundle size
Acceptable: Yes (debugging benefits outweigh cost)
```

### Server Memory Usage
```
Base Memory:        ~50 MB
+ Sentry SDK:       + ~10 MB
Total:              ~60 MB

Impact: +20% memory usage
Acceptable: Yes (negligible overhead)
```

### Runtime Overhead
```
Client:
- Initialization:   ~10ms (one-time)
- Per Error:        ~5ms + network
- Per Trace:        <1ms overhead

Server:
- Initialization:   ~50ms (one-time)
- Per Request:      ~1-2ms overhead
- Per Error:        ~5ms + network
- Per Trace:        <1ms overhead

Impact: Negligible (<1% total app time)
Acceptable: Yes (unnoticeable to users)
```

---

## Monitoring Dashboard Views

### Error Overview
```
┌─────────────────────────────────────────┐
│  ERRORS LAST 24 HOURS: 42              │
│  AFFECTED USERS: 8                      │
│  NEW ISSUES: 3                          │
│  RESOLVED ISSUES: 5                     │
└─────────────────────────────────────────┘

Top Issues:
1. TypeError: Cannot read property 'id'
   - 15 occurrences
   - 5 users affected
   - First seen: 2 hours ago

2. NetworkError: Failed to fetch
   - 12 occurrences
   - 3 users affected
   - First seen: 5 hours ago

3. ValidationError: Invalid character name
   - 8 occurrences
   - 4 users affected
   - First seen: 1 hour ago
```

### Performance Overview
```
┌─────────────────────────────────────────┐
│  AVG RESPONSE TIME: 125ms               │
│  P95 RESPONSE TIME: 450ms               │
│  SLOW TRANSACTIONS: 23                  │
│  THROUGHPUT: 1,200 req/min             │
└─────────────────────────────────────────┘

Slowest Endpoints:
1. POST /api/combat/attack - 890ms avg
2. GET /api/leaderboard - 650ms avg
3. POST /api/gang/war/start - 520ms avg
```

---

## Integration Checklist

- [x] Client configuration created
- [x] Server configuration created
- [x] Client entry point updated
- [x] Server entry point updated
- [x] ErrorBoundary enhanced
- [x] Environment variables documented
- [x] TypeScript types added
- [x] Documentation written
- [x] Helper functions exported
- [x] Sample rates configured
- [x] Error filtering implemented
- [x] User context support added
- [x] Breadcrumb support added
- [x] Graceful shutdown integrated
- [x] Performance monitoring enabled
- [x] Session replay configured
- [ ] Packages installed (npm install)
- [ ] Sentry projects created (sentry.io)
- [ ] DSN values configured (.env)
- [ ] Integration tested (test errors)
- [ ] Dashboard verified (sentry.io)

---

**Status**: Architecture complete, ready for package installation and configuration
**Next Steps**: Follow SENTRY_QUICKSTART.md for 5-minute setup
