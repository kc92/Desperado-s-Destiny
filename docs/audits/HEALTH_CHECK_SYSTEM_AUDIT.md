# HEALTH CHECK SYSTEM PRODUCTION READINESS AUDIT

**Audit Date:** 2025-12-16
**System Version:** 1.0.0
**Auditor:** Claude (Production Hardening Phase)
**Scope:** Health check endpoints, liveness/readiness probes, dependency monitoring

---

## EXECUTIVE SUMMARY

**Overall Grade: D+ (48%)**

The health check system provides basic functionality but has **critical gaps** that make it unsuitable for production deployment, especially in containerized environments (Docker/Kubernetes). While basic MongoDB and Redis checks exist, the system lacks proper HTTP status codes for unhealthy states, separate liveness/readiness endpoints, response time monitoring, and critical dependency checks (Bull queues, Socket.IO).

**PRODUCTION BLOCKERS:** 5 Critical Issues
**RECOMMENDATION:** DO NOT DEPLOY until critical issues are resolved.

---

## 1. TOP 5 STRENGTHS

### ✅ 1.1 Basic Dependency Checks Present
**Location:** `server/src/controllers/health.controller.ts:18-23`
```typescript
const mongoConnected = isMongoDBConnected();
const mongoState = getMongoDBConnectionState();
const redisConnected = isRedisConnected();
const redisHealthy = await redisHealthCheck();
```
- Checks both MongoDB and Redis connectivity
- Uses active PING for Redis (not just connection state)
- Distinguishes between connection state and actual health

### ✅ 1.2 Three-State Health Status
**Location:** `server/src/controllers/health.controller.ts:29-35`
```typescript
let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
if (!mongoConnected || !redisHealthy) {
  status = 'unhealthy';
} else if (mongoState !== 'connected') {
  status = 'degraded';
}
```
- Properly distinguishes healthy/degraded/unhealthy states
- Good granularity for monitoring systems

### ✅ 1.3 Docker Healthcheck Configuration
**Location:** `docker-compose.yml:92-97`
```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:5001/health'...)"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```
- Proper healthcheck configuration in Docker
- Reasonable timing parameters
- Accounts for startup time with `start_period`

### ✅ 1.4 Railway Platform Integration
**Location:** `railway.json:9-12`
```json
"healthcheckPath": "/api/health",
"healthcheckTimeout": 30,
"restartPolicyType": "ON_FAILURE",
"restartPolicyMaxRetries": 3
```
- Configured for Railway deployment platform
- Uses standard `/api/health` endpoint
- Automatic restart on failure

### ✅ 1.5 Graceful Shutdown Handlers
**Location:** `server/src/server.ts:336-413`
```typescript
async function shutdown(signal: string): Promise<void> {
  // Shutdown Bull job system
  await shutdownJobSystem();
  // Close Socket.io connections
  await shutdownSocketIO();
  // Close HTTP server
  await server?.close();
  // Disconnect from databases
  await Promise.all([disconnectMongoDB(), disconnectRedis()]);
}
```
- Proper shutdown sequence (jobs → sockets → server → databases)
- Handles SIGTERM and SIGINT signals
- Prevents data corruption during shutdown

---

## 2. CRITICAL ISSUES (Production Blockers)

### 🚨 CRITICAL #1: Always Returns HTTP 200 Even When Unhealthy
**Severity:** CRITICAL
**File:** `server/src/controllers/health.controller.ts:55`
**Impact:** Load balancers and orchestrators cannot detect failures

**Problem:**
```typescript
return sendSuccess(res, healthCheck); // ALWAYS returns 200 OK
```

The health endpoint returns HTTP 200 even when `status === 'unhealthy'`. This completely breaks:
- **Kubernetes liveness/readiness probes** (expect non-200 for failure)
- **Docker healthchecks** (rely on exit codes from HTTP status)
- **Load balancers** (route traffic to unhealthy instances)
- **Monitoring systems** (cannot trigger alerts)

**Expected Behavior:**
- `healthy` → HTTP 200
- `degraded` → HTTP 200 (still operational)
- `unhealthy` → HTTP 503 Service Unavailable

**Evidence of Impact:**
- `docker-compose.yml:93` expects non-200 status for failures
- Railway expects proper status codes for auto-restart
- Current setup would keep routing traffic to dead databases

---

### 🚨 CRITICAL #2: No Separate Liveness vs Readiness Endpoints
**Severity:** CRITICAL
**File:** `server/src/routes/health.routes.ts:11`
**Impact:** Cannot distinguish between "needs restart" vs "needs time to recover"

**Problem:**
```typescript
router.get('/', getHealthStatus); // Single endpoint for everything
```

Kubernetes and modern orchestration requires two distinct probes:
- **Liveness:** "Is the process alive?" (deadlock detection, should restart if fails)
- **Readiness:** "Can it handle traffic?" (temporary issues, remove from load balancer)

**Current Single Endpoint Conflates Both:**
- MongoDB temporarily down → Restart entire pod (overkill)
- Application deadlock → Keep in load balancer (disaster)

**Required Endpoints:**
1. `GET /health/live` - Process alive check (minimal, fast)
2. `GET /health/ready` - Dependency health check (comprehensive)

**Example Kubernetes Config (Missing):**
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 5001
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /health/ready
    port: 5001
  initialDelaySeconds: 10
  periodSeconds: 5
```

---

### 🚨 CRITICAL #3: Missing Bull Queue Health Checks
**Severity:** CRITICAL
**File:** `server/src/controllers/health.controller.ts` (Missing)
**Impact:** Job system failures go undetected, causing silent data corruption

**Problem:**
The application uses Bull queues extensively for critical operations:
- `server/src/jobs/queues.ts:30-48` defines 17 different queues
- War resolution, territory maintenance, production ticks, marketplace
- **No health monitoring for any of these queues**

**Potential Failures:**
- Bull queue disconnects from Redis → Jobs never process
- Queue workers crash → Marketplace orders never expire
- Production tick fails → Players lose income silently

**Evidence:**
```typescript
// server/src/server.ts:274-284
async function initializeJobSystem(): Promise<void> {
  try {
    await initJobs();
  } catch (error) {
    logger.error('Failed to initialize Bull job system:', error);
    // Don't throw - jobs are important but not critical for server startup
    // ❌ THIS IS WRONG - jobs ARE critical
  }
}
```

**Required Check:**
```typescript
// Check Bull queue connection
const bullQueues = await getBullQueues();
for (const queue of bullQueues) {
  const isActive = await queue.isReady();
  const waitingCount = await queue.getWaitingCount();
  const failedCount = await queue.getFailedCount();
  // Add to health response
}
```

---

### 🚨 CRITICAL #4: Missing Socket.IO Health Monitoring
**Severity:** CRITICAL
**File:** `server/src/controllers/health.controller.ts` (Missing)
**Impact:** Real-time features fail silently, degraded user experience

**Problem:**
Socket.IO is essential for real-time gameplay:
- Chat system (`server/src/sockets/chatHandlers.ts`)
- Duel system (`server/src/sockets/duelHandlers.ts`)
- Presence tracking (`server/src/services/presence.service.ts`)

**No health checks for:**
- Socket.IO server status
- Redis adapter connectivity (for horizontal scaling)
- Connected client count
- WebSocket vs polling transport ratio

**Evidence of Risk:**
```typescript
// server/src/config/socket.ts:77-99
try {
  pubClient = createClient({ url: redisUrl });
  subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
} catch (redisError) {
  logger.error('Redis adapter failed, Socket.io will run in single-instance mode');
  // ❌ Silently continues - should be in health check
}
```

**Required Check:**
```typescript
// Check Socket.IO status
const socketIO = getSocketIOInstance();
const connectedClients = socketIO.sockets.sockets.size;
const redisAdapterConnected = await checkRedisAdapter();
```

---

### 🚨 CRITICAL #5: No Response Time / Latency Thresholds
**Severity:** HIGH
**File:** `server/src/controllers/health.controller.ts:25-26`
**Impact:** Slow dependencies cause cascading failures undetected

**Problem:**
```typescript
const mongoLatency = mongoConnected ? Date.now() - startTime : undefined;
const redisLatency = redisConnected ? Date.Now() - startTime : undefined;
```

**Issues:**
1. **Incorrect Measurement:** Both use same `startTime`, so latencies are cumulative
2. **No Thresholds:** 5000ms latency reports as "healthy"
3. **No Database Operation Test:** Just checks connection state, not actual query

**Example Failure Scenario:**
- MongoDB connection exists but queries take 10 seconds
- Health check reports `connected` with no latency threshold
- Application requests timeout, but health shows "healthy"

**Required Implementation:**
```typescript
// Test actual database operations with thresholds
const mongoStart = Date.now();
await mongoose.connection.db.admin().ping();
const mongoLatency = Date.now() - mongoStart;

const redisStart = Date.now();
await redisClient.ping();
const redisLatency = Date.now() - redisStart;

// Apply thresholds
if (mongoLatency > 1000) status = 'degraded';
if (mongoLatency > 5000) status = 'unhealthy';
```

---

## 3. INTEGRATION GAPS

### ⚠️ 3.1 No MongoDB Connection Pool Metrics
**File:** `server/src/controllers/health.controller.ts` (Missing)
**Priority:** HIGH

**Current State:**
```typescript
// server/src/config/database.ts:8-14
const mongooseOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
};
```

Pool exists but no monitoring of:
- Active connections vs pool size
- Connection wait times
- Connection errors/rejections

**Impact:** Pool exhaustion causes 503 errors but health shows "connected"

**Required Addition:**
```typescript
const poolStats = mongoose.connection.db?.stats();
services.database.poolSize = poolStats?.connections || 0;
services.database.poolMax = 10;
services.database.poolUtilization = (poolStats?.connections / 10) * 100;
```

---

### ⚠️ 3.2 No Admin Health Endpoint Duplication
**File:** `server/src/controllers/admin.controller.ts:621-661`
**Priority:** MEDIUM

**Issue:** Admin endpoint duplicates health logic but adds system metrics:
- CPU load average
- Memory usage (heap + RSS)
- System memory

This creates **two sources of truth** for health status:
- `GET /api/health` - Limited info
- `GET /api/admin/server/health` - Extended info (admin-only)

**Problem:** Public health endpoint doesn't expose metrics needed for:
- Prometheus/Grafana monitoring
- Auto-scaling decisions
- Capacity planning

**Recommendation:**
- Keep `/health` minimal (liveness)
- Add `/health/ready` comprehensive (readiness)
- Make `/health/metrics` public for monitoring systems

---

### ⚠️ 3.3 No Environment Variable Validation
**File:** `server/src/config/index.ts` (Implicit)
**Priority:** MEDIUM

**Missing Checks:**
- JWT_SECRET presence/strength
- MONGODB_URI format validation
- REDIS_URL reachability
- Required env vars for environment

**Risk:** Server starts with invalid config, fails later in production

**Example Missing Check:**
```typescript
if (config.isProduction && config.jwt.secret === 'change-this-in-production') {
  throw new Error('Production environment requires secure JWT_SECRET');
}
```

---

### ⚠️ 3.4 No Startup Dependency Verification
**File:** `server/src/server.ts:200-218`
**Priority:** HIGH

**Current Behavior:**
```typescript
async function initializeDatabases(): Promise<void> {
  await connectMongoDB();
  await connectRedis();
  await seedStarterData(); // ❌ Continues even if seeding fails
}
```

**Issues:**
1. **Seeding errors swallowed:** `logger.warn` instead of validating
2. **No verification:** Doesn't check if seed data exists
3. **Race conditions:** Health check might run before seeding completes

**Impact:** Application starts "healthy" but missing critical data

---

### ⚠️ 3.5 Health Endpoint Has Rate Limiting
**File:** `server/src/routes/index.ts:102`
**Priority:** LOW

**Current:**
```typescript
router.use('/health', healthRoutes); // No rate limiting ✅
```

**Good!** Health endpoint correctly bypasses rate limiting.

However, no documentation of this exception or why it exists.

---

## 4. PRODUCTION READINESS ASSESSMENT

### 4.1 Grading Breakdown

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| **Critical Functionality** | 40% | 30% | 12% |
| - HTTP Status Codes | - | 0% | - |
| - Liveness/Readiness | - | 0% | - |
| - Dependency Checks | - | 60% | - |
| **Integration** | 30% | 50% | 15% |
| - MongoDB Pool | - | 0% | - |
| - Redis Adapter | - | 0% | - |
| - Bull Queues | - | 0% | - |
| - Socket.IO | - | 0% | - |
| **Observability** | 20% | 70% | 14% |
| - Metrics Exposure | - | 50% | - |
| - Latency Tracking | - | 40% | - |
| - Logging | - | 90% | - |
| **Configuration** | 10% | 70% | 7% |
| - Docker/K8s Ready | - | 60% | - |
| - Security | - | 80% | - |
| **TOTAL** | **100%** | - | **48%** |

### 4.2 Production Readiness: ❌ NOT READY

**Must Fix Before Production:**
1. ✅ Implement HTTP 503 for unhealthy status
2. ✅ Add `/health/live` and `/health/ready` endpoints
3. ✅ Add Bull queue health monitoring
4. ✅ Add Socket.IO connection health
5. ✅ Implement latency thresholds and degraded state logic

**Should Fix (High Priority):**
6. Add MongoDB connection pool metrics
7. Add Redis pool/memory metrics
8. Implement startup dependency verification
9. Add response time monitoring per dependency
10. Create Kubernetes deployment manifests with proper probes

**Nice to Have (Medium Priority):**
11. Expose Prometheus-compatible metrics endpoint
12. Add disk space monitoring
13. Add network connectivity checks
14. Implement health check caching (avoid thundering herd)

---

## 5. SPECIFIC BLOCKERS BY DEPLOYMENT PLATFORM

### 5.1 Kubernetes Deployment: ❌ BLOCKED

**Missing Requirements:**
- ❌ Separate liveness probe endpoint
- ❌ Separate readiness probe endpoint
- ❌ Proper HTTP status codes (200 vs 503)
- ❌ Fast liveness check (<1s response time)
- ❌ Comprehensive readiness check

**Example K8s Manifest (Would Fail):**
```yaml
# This won't work with current implementation
livenessProbe:
  httpGet:
    path: /health  # Returns 200 even when dead
    port: 5001
  failureThreshold: 3
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health  # Same endpoint, can't distinguish issues
    port: 5001
  failureThreshold: 2
  periodSeconds: 5
```

---

### 5.2 Docker Swarm: ⚠️ PARTIALLY WORKING

**Current Status:**
- ✅ Basic healthcheck configured
- ⚠️ Will detect complete failures (connection refused)
- ❌ Won't detect degraded state (HTTP 200 always returned)
- ❌ Won't detect database slowness

**Risk:** Containers stay in swarm even when database is down

---

### 5.3 Railway: ✅ WORKING (Limited)

**Current Status:**
- ✅ Healthcheck path configured
- ✅ Timeout set appropriately
- ✅ Restart policy configured

**Limitation:** Railway only checks for HTTP 200, so degraded states go undetected

---

### 5.4 Traditional VPS/Server: ✅ ACCEPTABLE

**Current Status:**
- ✅ Basic health endpoint works
- ✅ Manual monitoring possible
- ⚠️ Requires external monitoring setup (Pingdom, UptimeRobot)

---

## 6. SECURITY CONSIDERATIONS

### ✅ 6.1 No Authentication Required (Correct)
**File:** `server/src/routes/index.ts:102`

Health endpoints should be public for load balancers. Current implementation is correct.

### ✅ 6.2 No Sensitive Data Exposure
**File:** `server/src/controllers/health.controller.ts:37-53`

Response doesn't leak:
- Connection strings
- Passwords
- Internal IPs
- Database names

Good security posture.

### ⚠️ 6.3 Potential Information Disclosure
**File:** `server/src/controllers/health.controller.ts:51-52`

```typescript
version: packageJson.version,
environment: config.env as 'development' | 'production' | 'test',
```

**Risk:** Reveals exact version (helps attackers find known vulnerabilities)

**Recommendation:** Make version optional via config flag for production

---

## 7. COMPARISON: INTEGRATION HEALTH VS ENDPOINT HEALTH

The codebase has TWO health systems:

### 7.1 Endpoint Health (Public)
**File:** `server/src/controllers/health.controller.ts`
- Basic MongoDB/Redis checks
- Used by load balancers
- Public endpoint `/api/health`

### 7.2 Integration Health (Internal)
**File:** `server/src/utils/integrationHealth.ts`
- Comprehensive system dependency graph
- Tests data flows between systems
- Verifies character→gold, quest→gold flows
- **NOT exposed via endpoint**

**Recommendation:** Merge these or expose integration health via `/health/integration` for ops teams

---

## 8. RECOMMENDED IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (1-2 days)
1. **Add HTTP status code logic**
   ```typescript
   const statusCode = status === 'unhealthy' ? 503 : 200;
   return res.status(statusCode).json(healthCheck);
   ```

2. **Split liveness/readiness**
   - `GET /health/live` - Fast, minimal checks
   - `GET /health/ready` - Comprehensive dependency checks

3. **Add latency thresholds**
   - Degrade at 1s, unhealthy at 5s

### Phase 2: Dependency Monitoring (2-3 days)
4. **Bull queue health**
   - Check all 17 queues
   - Monitor waiting/failed job counts

5. **Socket.IO health**
   - Connection count
   - Redis adapter status

6. **MongoDB pool metrics**
   - Active connections
   - Pool utilization

### Phase 3: Production Polish (1-2 days)
7. **Kubernetes manifests**
   - Proper probe configuration
   - Resource limits
   - Auto-scaling triggers

8. **Monitoring integration**
   - Prometheus metrics endpoint
   - Grafana dashboard templates

9. **Documentation**
   - Health check response format
   - Troubleshooting guide
   - Runbook for ops

---

## 9. SAMPLE IMPROVED IMPLEMENTATION

```typescript
// GET /health/live - Liveness Probe
export const getLiveness = asyncHandler(async (_req: Request, res: Response) => {
  // Fast check - just verify process is responsive
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  // Basic sanity checks
  const isAlive = uptime > 0 && memoryUsage.heapUsed > 0;

  if (!isAlive) {
    return res.status(503).json({
      status: 'dead',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(200).json({
    status: 'alive',
    uptime,
    timestamp: new Date().toISOString()
  });
});

// GET /health/ready - Readiness Probe
export const getReadiness = asyncHandler(async (_req: Request, res: Response) => {
  const startTime = Date.now();
  const checks: Record<string, HealthCheck> = {};

  // Check MongoDB with actual query + latency
  try {
    const mongoStart = Date.now();
    await mongoose.connection.db.admin().ping();
    const mongoLatency = Date.now() - mongoStart;

    checks.mongodb = {
      status: 'healthy',
      latency: mongoLatency,
      degraded: mongoLatency > 1000
    };
  } catch (error) {
    checks.mongodb = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check Redis with actual operation + latency
  try {
    const redisStart = Date.now();
    const redisClient = getRedisClient();
    await redisClient.ping();
    const redisLatency = Date.now() - redisStart;

    checks.redis = {
      status: 'healthy',
      latency: redisLatency,
      degraded: redisLatency > 500
    };
  } catch (error) {
    checks.redis = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check Bull queues
  try {
    const criticalQueues = await getCriticalQueues();
    const unhealthyQueues = [];

    for (const queue of criticalQueues) {
      const waitingCount = await queue.getWaitingCount();
      const failedCount = await queue.getFailedCount();

      if (failedCount > 100 || waitingCount > 1000) {
        unhealthyQueues.push(queue.name);
      }
    }

    checks.queues = {
      status: unhealthyQueues.length > 0 ? 'degraded' : 'healthy',
      totalQueues: criticalQueues.length,
      unhealthyQueues
    };
  } catch (error) {
    checks.queues = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check Socket.IO
  try {
    const io = getSocketIOInstance();
    const connectedClients = io.sockets.sockets.size;
    const redisAdapterHealthy = await checkSocketIORedisAdapter();

    checks.socketio = {
      status: redisAdapterHealthy ? 'healthy' : 'degraded',
      connectedClients,
      redisAdapter: redisAdapterHealthy
    };
  } catch (error) {
    checks.socketio = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Determine overall status
  const hasUnhealthy = Object.values(checks).some(c => c.status === 'unhealthy');
  const hasDegraded = Object.values(checks).some(c => c.status === 'degraded' || c.degraded);

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (hasUnhealthy) {
    overallStatus = 'unhealthy';
  } else if (hasDegraded) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;
  const responseTime = Date.now() - startTime;

  return res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime,
    checks,
    version: config.isProduction ? undefined : packageJson.version,
    environment: config.env
  });
});
```

---

## 10. TESTING RECOMMENDATIONS

### 10.1 Unit Tests Needed
- ✅ Test HTTP 200 for healthy state
- ✅ Test HTTP 503 for unhealthy state
- ✅ Test degraded state logic
- ✅ Test latency threshold triggering

### 10.2 Integration Tests Needed
- ✅ Test MongoDB disconnect scenario
- ✅ Test Redis disconnect scenario
- ✅ Test slow database response
- ✅ Test Bull queue failure

### 10.3 Load Tests Needed
- ✅ Health endpoint under 1000 req/s
- ✅ Response time under load
- ✅ No impact on main application

---

## 11. MONITORING & ALERTING

### 11.1 Recommended Alerts
1. **Critical:** `/health/ready` returns 503 for >2 minutes
2. **Critical:** `/health/live` returns 503 for >30 seconds
3. **Warning:** `/health/ready` returns degraded for >5 minutes
4. **Warning:** Health check response time >1 second
5. **Info:** Health check latency trend upward

### 11.2 Dashboards
- Real-time health status
- Dependency latency graphs
- Database pool utilization
- Queue depth over time
- Socket.IO connection count

---

## 12. CONCLUSION

The current health check implementation provides **basic functionality** but has **critical gaps** that prevent production deployment in modern containerized environments. The most severe issue is the lack of proper HTTP status codes, which completely breaks orchestration platforms like Kubernetes.

**Primary Issues:**
1. Always returns HTTP 200 (even when dead)
2. No liveness vs readiness separation
3. Missing Bull queue monitoring
4. Missing Socket.IO monitoring
5. No latency thresholds

**Estimated Effort to Fix:**
- Critical fixes: 2-3 days
- Full production-ready: 5-7 days

**Recommendation:** Implement Critical Fixes immediately before any production deployment.

---

## APPENDIX A: FILE REFERENCE INDEX

### Health Check System Files
- `server/src/controllers/health.controller.ts` - Main health endpoint
- `server/src/routes/health.routes.ts` - Health route configuration
- `server/src/utils/integrationHealth.ts` - Internal system health checker
- `server/src/config/database.ts` - MongoDB connection management
- `server/src/config/redis.ts` - Redis connection management
- `server/src/config/socket.ts` - Socket.IO configuration
- `server/src/server.ts` - Server initialization and shutdown
- `server/src/jobs/queues.ts` - Bull queue registry

### Deployment Configuration Files
- `docker-compose.yml` - Docker healthcheck config
- `railway.json` - Railway platform config
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `scripts/health-check.js` - Manual health check script

### Related Admin/Monitoring Files
- `server/src/controllers/admin.controller.ts:621-661` - Admin health endpoint
- `client/src/pages/admin/ServerHealth.tsx` - Admin UI for health
- `client/src/services/health.service.ts` - Client health service

---

**END OF AUDIT**
