# CSRF Protection Production Readiness Audit

**Audit Date:** 2025-12-16
**Auditor:** Claude Code Assistant
**Application:** Desperados Destiny (Western MMO)
**Production Readiness Grade:** F (15%)

---

## Executive Summary

The CSRF protection system is **critically incomplete and poses a severe security vulnerability**. While a sophisticated CSRF middleware has been implemented (`server/src/middleware/csrf.middleware.ts`), **it is not integrated anywhere in the application**. This represents a **production blocker** - the application is completely vulnerable to CSRF attacks despite having the protection code ready.

### Critical Findings
- **ZERO endpoints protected** - No routes use CSRF middleware
- **No CSRF token distribution** - No endpoint to issue tokens to clients
- **Client has no CSRF implementation** - No token storage or header injection
- **Cookie configuration issues** - SameSite=Lax instead of Strict in production
- **Socket.io bypass vulnerability** - WebSocket connections may bypass CSRF entirely

---

## 1. Top 5 Strengths

Despite lack of integration, the CSRF middleware implementation shows good security practices:

### 1.1 Excellent Token Management Architecture ✓
**File:** `server/src/middleware/csrf.middleware.ts:41-451`

- **Redis-backed storage** with in-memory fallback for horizontal scaling
- **Cryptographically secure tokens** using `crypto.randomBytes(32)` (64-character hex)
- **User binding** prevents token theft/reuse across users
- **Automatic expiry** (1 hour) with cleanup mechanisms
- **Token rotation support** for sensitive operations

```typescript
// Lines 73-80: Secure token generation
async generateAsync(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenData: CSRFToken = {
    token,
    createdAt: Date.now(),
    userId,
    useCount: 0,
  };
```

### 1.2 Dual Storage Strategy ✓
**File:** `server/src/middleware/csrf.middleware.ts:50-52, 82-112`

- Hybrid Redis + memory approach ensures resilience
- Graceful degradation if Redis fails
- TTL management via Redis native expiry
- Manual cleanup for memory store (5-minute intervals)

### 1.3 Comprehensive Validation ✓
**File:** `server/src/middleware/csrf.middleware.ts:192-235`

- User ID binding verification (line 213)
- Expiry checking with double-validation (line 206)
- Usage tracking (use count, last used timestamp)
- Detailed logging for security events

### 1.4 Multiple Protection Levels ✓
**File:** `server/src/middleware/csrf.middleware.ts:502-594`

Three middleware variants provided:
- `requireCsrfToken` - Standard protection
- `requireCsrfTokenWithRotation` - For sensitive operations (password change, gold transfer)
- `optionalCsrfToken` - Migration/testing support

### 1.5 Smart Token Rotation ✓
**File:** `server/src/middleware/csrf.middleware.ts:546-594`

- Automatic token refresh after sensitive operations
- New token returned via `X-CSRF-Token` response header
- Prevents replay attacks on high-value endpoints

---

## 2. Critical Issues (Production Blockers)

### 2.1 ZERO INTEGRATION - CSRF Middleware Not Used ❌❌❌
**Severity:** CRITICAL
**Files Affected:** ALL route files (91 routes total)

**Issue:** The CSRF middleware exists but is **never imported or applied** to any routes.

**Evidence:**
```bash
# Search results show ZERO usage across all routes
grep -r "requireCsrfToken\|optionalCsrfToken\|requireCsrfTokenWithRotation" server/src/routes
# Result: No matches found
```

**Vulnerable Endpoints (Sample):**
- `server/src/routes/bank.routes.ts:32-33` - POST /bank/deposit, /bank/withdraw (NO CSRF)
- `server/src/routes/marketplace.routes.ts:125-160` - ALL mutation endpoints (NO CSRF)
- `server/src/routes/gang.routes.ts:25-65` - Gang creation, bank operations, etc. (NO CSRF)
- `server/src/routes/character.routes.ts:51-63` - Character creation/deletion (NO CSRF)
- `server/src/routes/admin.routes.ts:51-123` - Admin operations including user bans, gold adjustments (NO CSRF)

**Impact:**
An attacker can execute ANY state-changing operation by:
1. Hosting a malicious site (evil.com)
2. Embedding a form that POSTs to `https://desperados-destiny.com/api/bank/withdraw`
3. User visits evil.com while logged into the game
4. Browser sends authentication cookie automatically
5. **Attack succeeds** - funds transferred, character deleted, etc.

**Attack Vector Example:**
```html
<!-- Hosted on evil.com -->
<html>
<body onload="document.forms[0].submit()">
  <form action="https://desperados-destiny.com/api/bank/withdraw" method="POST">
    <input type="hidden" name="amount" value="1000000">
  </form>
</body>
</html>
```

### 2.2 No CSRF Token Distribution Endpoint ❌❌
**Severity:** CRITICAL
**File:** `server/src/middleware/csrf.middleware.ts:620-637`

**Issue:** The `getCsrfToken` function exists but is **not exposed via any route**.

**Evidence:**
```bash
# No route registered for CSRF token retrieval
grep -r "getCsrfToken" server/src/routes
# Result: No matches found (only in csrf.middleware.ts)
```

**Impact:**
- Client cannot obtain CSRF tokens
- Even if middleware was applied, all requests would fail
- No token refresh mechanism available

**Required Fix:**
```typescript
// server/src/routes/auth.routes.ts (missing)
import { getCsrfToken } from '../middleware/csrf.middleware';

// Should have:
router.get('/csrf-token', requireAuth, getCsrfToken);
```

### 2.3 Client-Side CSRF Implementation Missing ❌❌
**Severity:** CRITICAL
**Files:** `client/src/services/api.ts`, All client service files

**Issue:** Client has **zero CSRF token handling**.

**Evidence:**
```bash
# No CSRF references in client code
grep -r "csrf\|CSRF" client/src
# Result: No files found
```

**Missing Client Implementation:**
1. **No token storage** - Should store token after login
2. **No header injection** - Should add `X-CSRF-Token` to mutations
3. **No token refresh** - Should update token from response headers
4. **No error handling** - No retry logic for expired tokens

**Required Client Code (Currently Missing):**
```typescript
// client/src/services/api.ts (should have)
import { getCsrfToken, setCsrfToken } from '@/utils/csrf';

apiClient.interceptors.request.use((config) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
    const csrfToken = getCsrfToken();
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

apiClient.interceptors.response.use((response) => {
  const newToken = response.headers['x-csrf-token'];
  if (newToken) {
    setCsrfToken(newToken);
  }
  return response;
});
```

### 2.4 Cookie SameSite Configuration Weakness ⚠️
**Severity:** HIGH
**File:** `server/src/controllers/auth.controller.ts:92-98, 295-299`

**Issue:** Authentication cookies use `sameSite: 'lax'` instead of `'strict'` in production.

**Evidence:**
```typescript
// Line 298: auth.controller.ts
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', // ❌ Should be 'strict' in production
  maxAge: 60 * 60 * 1000,
  path: '/'
});
```

**Impact:**
- `SameSite=Lax` allows cookies on TOP-LEVEL GET navigations
- Attacker can use `<a href>` links to execute GET requests with cookies
- Combined with GET-based mutations (if any exist), this is exploitable
- **Partial CSRF protection** - does NOT protect against:
  - Link-based attacks (user clicks malicious link)
  - Form GET submissions
  - Navigation via `window.location`

**SameSite Comparison:**
| Value  | Protection Level | GET Navigation | POST Forms | AJAX Requests |
|--------|------------------|----------------|------------|---------------|
| None   | ❌ No protection  | ✓ Cookie sent  | ✓ Cookie sent | ✓ Cookie sent |
| Lax    | ⚠️ Partial        | ✓ Cookie sent  | ❌ No cookie | ❌ No cookie |
| Strict | ✅ Full          | ❌ No cookie   | ❌ No cookie | ❌ No cookie |

**Recommendation:** Use `'strict'` for production, keep `'lax'` for development:
```typescript
sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
```

### 2.5 Socket.io CSRF Bypass Vulnerability ⚠️
**Severity:** MEDIUM-HIGH
**File:** `server/src/config/socket.ts:41-126`

**Issue:** WebSocket connections bypass HTTP-based CSRF protection entirely.

**Evidence:**
```typescript
// Lines 106-112: Only JWT authentication, no CSRF check
io.use(socketAuthMiddleware); // Only checks JWT token

io.on('connection', (socket: Socket) => {
  handleConnection(socket as AuthenticatedSocket);
});
```

**Impact:**
- Any authenticated WebSocket can perform state changes
- Chat handlers, duel handlers, etc. may allow mutations
- Attacker can open WebSocket from their site to the game server
- Browser will include authentication cookies automatically

**Vulnerable Socket Handlers:**
- `server/src/sockets/chatHandlers.ts` - Chat message sending
- `server/src/sockets/duelHandlers.ts` - Duel actions, betting

**Attack Scenario:**
1. User authenticated to Desperados Destiny
2. User visits attacker's site (evil.com)
3. Evil.com opens WebSocket: `io('https://desperados-destiny.com')`
4. Browser includes auth cookies automatically
5. Evil.com sends socket events: `socket.emit('sendChatMessage', { spam })`
6. **Attack succeeds** - spam sent, duels manipulated, etc.

**Required Fix:**
Add CSRF token validation to socket connections:
```typescript
// Should validate CSRF token in socket handshake
io.use(async (socket, next) => {
  const csrfToken = socket.handshake.auth.csrfToken;
  const userId = socket.data.userId;

  if (!csrfManager.validate(csrfToken, userId)) {
    return next(new Error('Invalid CSRF token'));
  }
  next();
});
```

### 2.6 CORS Configuration Allows Origin-less Requests ⚠️
**Severity:** MEDIUM
**File:** `server/src/server.ts:123-136, server/src/config/socket.ts:56-57`

**Issue:** Server allows requests without `Origin` header in development/test.

**Evidence:**
```typescript
// Lines 124-136: server.ts
origin: (origin, callback) => {
  if (!origin) {
    if (config.isTest) {
      return callback(null, true); // ❌ Allows no-origin requests
    }
    if (config.isDevelopment) {
      return callback(null, true); // ❌ Allows no-origin requests
    }
    // Production correctly rejects
    return callback(new Error('CORS: Origin header required'), false);
  }
```

**Impact:**
- Development/test environments vulnerable to CSRF
- Attackers can bypass CORS by removing Origin header
- Server-side request forgery (SSRF) possible from backend tools

**Risk:** Low in production (correctly rejects), but increases attack surface in staging/dev.

### 2.7 No CSRF Exemptions Documented ⚠️
**Severity:** LOW-MEDIUM
**File:** `server/src/middleware/csrf.middleware.ts:502-540`

**Issue:** No clear policy on which endpoints should be exempt from CSRF.

**Current Behavior:**
- Middleware checks HTTP method: GET/HEAD/OPTIONS exempt (line 508)
- No authentication check - unauthenticated requests exempt (line 515-518)

**Problem:**
- Idempotent mutations (e.g., favoriting an item multiple times) may need exemptions
- Public webhooks (if any) should be exempt
- No documented exemption list or policy

**Missing:**
```typescript
// Should have exemption list
const CSRF_EXEMPT_PATHS = [
  '/api/webhooks/*',     // External integrations
  '/api/health',         // Health checks
  '/api/public/*',       // Public read endpoints
];
```

---

## 3. Integration Gaps

### 3.1 Missing CSRF Middleware Application

**Routes Requiring CSRF Protection (91 total routes, 0 protected):**

**High Priority (Financial/Admin):**
- `/api/bank/*` - All POST endpoints (deposit, withdraw, upgrade)
- `/api/marketplace/*` - Listing creation, bidding, purchases
- `/api/admin/*` - User bans, gold adjustments, character deletions
- `/api/gang/*/bank/*` - Gang bank operations
- `/api/gold/*` - Gold transfers (if any POST endpoints)

**Medium Priority (Character/Progression):**
- `/api/characters/*` - Character creation, deletion, selection
- `/api/actions/*` - Action execution (crimes, combat, etc.)
- `/api/skills/*` - Skill upgrades
- `/api/crafting/*` - Item crafting
- `/api/shop/*` - Item purchases

**Low Priority (Social/Non-Critical):**
- `/api/chat/*` - Chat messages
- `/api/friends/*` - Friend requests
- `/api/mail/*` - Mail sending
- `/api/preferences/*` - Settings updates

### 3.2 Missing Token Lifecycle Management

**Required Endpoints (Currently Missing):**
1. `GET /api/auth/csrf-token` - Issue initial token after login
2. `POST /api/auth/refresh-csrf` - Refresh expired token
3. `DELETE /api/auth/csrf-token` - Invalidate on logout

**Login Flow Gap:**
```typescript
// server/src/controllers/auth.controller.ts:183-299
export async function login(req: Request, res: Response): Promise<void> {
  // ... authentication logic ...

  // Sets JWT cookie (line 295)
  res.cookie('token', token, { /* ... */ });

  // ❌ MISSING: Generate and return CSRF token
  // Should add:
  // const csrfToken = generateCsrfToken(user._id.toString());
  // res.setHeader('X-CSRF-Token', csrfToken);

  sendSuccess(res, { user: user.toSafeObject() }, 'Login successful');
}
```

**Logout Flow Gap:**
```typescript
// server/src/controllers/auth.controller.ts (logout function)
// ❌ MISSING: Invalidate CSRF token on logout
// Should add:
// invalidateCsrfToken(userId);
```

### 3.3 No Double-Submit Cookie Implementation

**Current Approach:** Synchronizer token pattern (token in Redis/memory)

**Missing Alternative:** Double-submit cookie pattern
- Would reduce server memory usage
- Better for stateless APIs
- No Redis dependency for CSRF tokens

**Double-Submit Implementation (Not Present):**
```typescript
// Alternative approach (could be added)
function generateDoubleSubmitToken(): string {
  const token = crypto.randomBytes(32).toString('hex');

  // Set CSRF cookie (signed, httpOnly=false so JS can read)
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,  // Client must read and send in header
    secure: true,
    sameSite: 'strict',
    signed: true,     // Prevent tampering
  });

  return token;
}

// Client sends same token in both:
// 1. Cookie (automatic)
// 2. Header: X-XSRF-TOKEN (manual)
// Server validates they match
```

**Trade-off:** Current synchronizer token is more secure (server-side validation), but requires storage.

---

## 4. Production Readiness Assessment

### Overall Grade: F (15%)

| Component | Grade | Completion | Blockers |
|-----------|-------|------------|----------|
| **Token Generation** | A | 100% | None |
| **Token Validation** | A | 100% | None |
| **Token Storage** | A | 100% | None |
| **Middleware Implementation** | A | 100% | None |
| **Route Integration** | F | 0% | ❌ ZERO routes protected |
| **Client Integration** | F | 0% | ❌ No client code |
| **Token Distribution** | F | 0% | ❌ No endpoint |
| **Cookie Security** | C | 60% | ⚠️ SameSite=Lax |
| **Socket.io Protection** | F | 0% | ❌ Full bypass |
| **Documentation** | D | 30% | ⚠️ No integration docs |

### Specific Production Blockers

#### Blocker 1: Zero Route Protection ❌
**Status:** CRITICAL - Must fix before production
**Effort:** 2-3 days
**Files:** All 91 route files

**Required Actions:**
1. Import CSRF middleware in each route file
2. Apply to all POST/PUT/DELETE/PATCH endpoints
3. Identify safe exemptions (webhooks, public APIs)
4. Add rotation middleware to sensitive endpoints:
   - Password changes
   - Email changes
   - Gold transfers
   - Admin actions

#### Blocker 2: Client Implementation ❌
**Status:** CRITICAL - Must fix before production
**Effort:** 1-2 days
**Files:** `client/src/services/api.ts`, new utility files

**Required Actions:**
1. Create CSRF token utility (`client/src/utils/csrf.ts`)
2. Add token storage (localStorage or memory)
3. Add request interceptor to inject `X-CSRF-Token` header
4. Add response interceptor to capture token rotations
5. Handle 403 CSRF errors with token refresh retry

#### Blocker 3: Token Distribution ❌
**Status:** CRITICAL - Must fix before production
**Effort:** 0.5 days
**Files:** `server/src/routes/auth.routes.ts`, `server/src/controllers/auth.controller.ts`

**Required Actions:**
1. Add `GET /api/auth/csrf-token` endpoint
2. Include CSRF token in login response
3. Add CSRF token to session restore
4. Invalidate token on logout

#### Blocker 4: Socket.io CSRF ⚠️
**Status:** HIGH PRIORITY - Should fix before production
**Effort:** 1 day
**Files:** `server/src/config/socket.ts`, `server/src/middleware/socketAuth.ts`

**Required Actions:**
1. Add CSRF token to socket handshake authentication
2. Validate CSRF in socket middleware
3. Update client to send CSRF in socket connection
4. Document socket CSRF requirements

### Production Readiness Checklist

**Before Production Launch:**
- [ ] Apply CSRF middleware to all mutation endpoints
- [ ] Implement client-side CSRF token handling
- [ ] Create token distribution endpoints
- [ ] Add token lifecycle management (login/logout)
- [ ] Implement Socket.io CSRF validation
- [ ] Change SameSite to 'strict' in production
- [ ] Create CSRF exemption whitelist
- [ ] Add comprehensive error handling for 403 CSRF failures
- [ ] Write integration tests for CSRF flows
- [ ] Document CSRF implementation for developers
- [ ] Add monitoring/alerting for CSRF failures
- [ ] Conduct penetration testing for CSRF vulnerabilities

**Security Testing Required:**
- [ ] Automated CSRF attack simulation
- [ ] Cross-origin request testing
- [ ] Token expiry and rotation testing
- [ ] Socket.io CSRF bypass testing
- [ ] SameSite cookie behavior validation
- [ ] Load testing with CSRF tokens (Redis scaling)

---

## 5. Recommended Implementation Plan

### Phase 1: Critical Path (Week 1)
**Goal:** Basic CSRF protection operational

1. **Day 1-2: Server Integration**
   - Add `GET /api/auth/csrf-token` endpoint
   - Modify login to return CSRF token
   - Apply `requireCsrfToken` to high-value routes:
     - Bank operations
     - Marketplace
     - Admin panel
     - Character creation/deletion

2. **Day 3-4: Client Integration**
   - Create CSRF utility module
   - Add request/response interceptors
   - Test with existing endpoints
   - Handle errors gracefully

3. **Day 5: Testing & Validation**
   - Manual CSRF attack testing
   - Automated test suite
   - Fix bugs and edge cases

### Phase 2: Comprehensive Protection (Week 2)
**Goal:** All endpoints protected, Socket.io secured

1. **Day 1-2: Remaining Routes**
   - Apply CSRF to all mutation endpoints
   - Identify and whitelist exemptions
   - Add rotation middleware to sensitive ops

2. **Day 3-4: Socket.io Protection**
   - Implement socket CSRF validation
   - Update client socket connection
   - Test WebSocket CSRF attacks

3. **Day 5: Cookie Hardening**
   - Update SameSite configuration
   - Add environment-based cookie settings
   - Test cross-site behavior

### Phase 3: Production Hardening (Week 3)
**Goal:** Production-ready with monitoring

1. **Day 1-2: Monitoring & Logging**
   - Add CSRF failure metrics
   - Set up alerting for attack patterns
   - Create admin dashboard for CSRF stats

2. **Day 3-4: Documentation**
   - Developer integration guide
   - API documentation updates
   - Security policy documentation

3. **Day 5: Penetration Testing**
   - Third-party security audit
   - Bug bounty program launch
   - Final vulnerability assessment

---

## 6. Code Examples for Fixes

### 6.1 Server: Apply CSRF Middleware

```typescript
// server/src/routes/bank.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware'; // ✅ ADD THIS
import {
  getVaultInfo,
  upgradeVault,
  deposit,
  withdraw,
} from '../controllers/bank.controller';

const router = Router();

// Protected routes
router.use(requireAuth);
router.use(requireCharacter);

// GET endpoint - no CSRF needed
router.get('/vault', getVaultInfo);

// POST endpoints - ADD CSRF PROTECTION
router.post('/upgrade', requireCsrfToken, upgradeVault);    // ✅ ADD
router.post('/deposit', requireCsrfToken, deposit);         // ✅ ADD
router.post('/withdraw', requireCsrfToken, withdraw);       // ✅ ADD

export default router;
```

### 6.2 Server: Token Distribution

```typescript
// server/src/routes/auth.routes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getCsrfToken } from '../middleware/csrf.middleware'; // ✅ ADD THIS

const router = Router();

// ✅ ADD: CSRF token endpoint
router.get('/csrf-token', requireAuth, getCsrfToken);

export default router;
```

```typescript
// server/src/controllers/auth.controller.ts
import { generateCsrfToken, invalidateCsrfToken } from '../middleware/csrf.middleware';

// ✅ MODIFY: login function
export async function login(req: Request, res: Response): Promise<void> {
  // ... existing authentication logic ...

  const token = generateToken({ userId: user._id.toString(), email: user.email });

  // ✅ ADD: Generate CSRF token
  const csrfToken = generateCsrfToken(user._id.toString());

  res.cookie('token', token, { /* ... */ });

  // ✅ ADD: Return CSRF token in response
  res.setHeader('X-CSRF-Token', csrfToken);

  sendSuccess(res, {
    user: user.toSafeObject(),
    csrfToken // ✅ ADD: Include in response body too
  }, 'Login successful');
}

// ✅ MODIFY: logout function
export async function logout(req: Request, res: Response): Promise<void> {
  const userId = (req as any).user?._id?.toString();

  // ✅ ADD: Invalidate CSRF token
  if (userId) {
    invalidateCsrfToken(userId);
  }

  res.clearCookie('token');
  sendSuccess(res, {}, 'Logout successful');
}
```

### 6.3 Client: CSRF Token Management

```typescript
// ✅ CREATE: client/src/utils/csrf.ts
let csrfToken: string | null = null;

export function getCsrfToken(): string | null {
  return csrfToken;
}

export function setCsrfToken(token: string): void {
  csrfToken = token;
}

export function clearCsrfToken(): void {
  csrfToken = null;
}
```

```typescript
// ✅ MODIFY: client/src/services/api.ts
import { getCsrfToken, setCsrfToken } from '@/utils/csrf';

// ✅ ADD: Request interceptor for CSRF
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add CSRF token to mutation requests
    const method = config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    logger.error('[API Request Error]', error as Error);
    return Promise.reject(error);
  }
);

// ✅ ADD: Response interceptor for token rotation
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Capture rotated CSRF token
    const newToken = response.headers['x-csrf-token'];
    if (newToken) {
      setCsrfToken(newToken);
      logger.debug('[CSRF] Token rotated');
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Handle CSRF token errors
    if (error.response?.status === 403) {
      const message = error.response.data?.message || '';
      if (message.includes('CSRF')) {
        logger.warn('[CSRF] Token invalid, fetching new token...');

        try {
          // Fetch new CSRF token
          const csrfResponse = await axios.get('/api/auth/csrf-token', {
            withCredentials: true
          });
          const newToken = csrfResponse.data.data.csrfToken;
          setCsrfToken(newToken);

          // Retry original request with new token
          if (error.config) {
            error.config.headers['X-CSRF-Token'] = newToken;
            return apiClient.request(error.config);
          }
        } catch (csrfError) {
          logger.error('[CSRF] Failed to refresh token:', csrfError as Error);
          // Redirect to login
          useAuthStore.getState().setUser(null);
        }
      }
    }

    // ... existing error handling ...
    return Promise.reject(error);
  }
);
```

### 6.4 Client: Update Login Flow

```typescript
// ✅ MODIFY: client/src/services/auth.service.ts (or wherever login is)
import { setCsrfToken, clearCsrfToken } from '@/utils/csrf';

export async function login(email: string, password: string) {
  const response = await apiClient.post('/auth/login', { email, password });

  // ✅ ADD: Store CSRF token
  const csrfToken = response.headers['x-csrf-token'] || response.data.data?.csrfToken;
  if (csrfToken) {
    setCsrfToken(csrfToken);
  }

  return response.data;
}

export async function logout() {
  await apiClient.post('/auth/logout');

  // ✅ ADD: Clear CSRF token
  clearCsrfToken();
}
```

### 6.5 Server: Socket.io CSRF Protection

```typescript
// ✅ MODIFY: server/src/config/socket.ts
import { verifyCsrfToken } from '../middleware/csrf.middleware';

export async function initializeSocketIO(httpServer: HTTPServer): Promise<SocketIOServer> {
  // ... existing setup ...

  io.use(socketAuthMiddleware);

  // ✅ ADD: CSRF validation middleware
  io.use(async (socket: Socket, next) => {
    const csrfToken = socket.handshake.auth.csrfToken as string;
    const userId = (socket as AuthenticatedSocket).data.userId;

    if (!csrfToken) {
      logger.warn('[Socket.io] Missing CSRF token in handshake');
      return next(new Error('CSRF token required'));
    }

    if (!verifyCsrfToken(userId, csrfToken)) {
      logger.warn(`[Socket.io] Invalid CSRF token for user ${userId}`);
      return next(new Error('Invalid CSRF token'));
    }

    next();
  });

  // ... rest of setup ...
}
```

```typescript
// ✅ MODIFY: client socket connection
import { getCsrfToken } from '@/utils/csrf';

const socket = io(WS_URL, {
  withCredentials: true,
  auth: {
    csrfToken: getCsrfToken() // ✅ ADD: Send CSRF token in handshake
  }
});
```

### 6.6 Server: Cookie SameSite Fix

```typescript
// ✅ MODIFY: server/src/controllers/auth.controller.ts
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // ✅ FIX
  maxAge: 60 * 60 * 1000,
  path: '/'
});
```

---

## 7. Testing Recommendations

### 7.1 Manual CSRF Attack Tests

**Test 1: Basic CSRF Attack**
```html
<!-- Host this on http://evil-site.com/attack.html -->
<!DOCTYPE html>
<html>
<body onload="document.forms[0].submit()">
  <h1>You won a prize! Claiming...</h1>
  <form action="https://desperados-destiny.com/api/bank/withdraw" method="POST">
    <input type="hidden" name="amount" value="1000000">
  </form>
</body>
</html>
```
**Expected Result:** Should FAIL with 403 Forbidden after CSRF implementation.

**Test 2: Cross-Origin AJAX Attack**
```javascript
// Run from browser console on evil-site.com
fetch('https://desperados-destiny.com/api/bank/withdraw', {
  method: 'POST',
  credentials: 'include', // Include cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1000000 })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```
**Expected Result:** Should FAIL with CORS error or 403 CSRF error.

**Test 3: Socket.io Attack**
```javascript
// Run from evil-site.com
const socket = io('https://desperados-destiny.com', {
  withCredentials: true
});

socket.on('connect', () => {
  socket.emit('sendChatMessage', { message: 'SPAM' });
});
```
**Expected Result:** Should FAIL to connect due to missing CSRF token.

### 7.2 Automated Test Suite

```typescript
// ✅ CREATE: server/tests/security/csrf.test.ts
import request from 'supertest';
import app from '../../src/server';
import { generateCsrfToken } from '../../src/middleware/csrf.middleware';

describe('CSRF Protection', () => {
  let authCookie: string;
  let userId: string;
  let csrfToken: string;

  beforeAll(async () => {
    // Login to get auth cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    authCookie = loginRes.headers['set-cookie'][0];
    userId = loginRes.body.data.user._id;
    csrfToken = loginRes.headers['x-csrf-token'];
  });

  describe('POST /api/bank/deposit', () => {
    it('should reject request without CSRF token', async () => {
      const res = await request(app)
        .post('/api/bank/deposit')
        .set('Cookie', authCookie)
        .send({ amount: 100 });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('CSRF');
    });

    it('should reject request with invalid CSRF token', async () => {
      const res = await request(app)
        .post('/api/bank/deposit')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', 'invalid-token')
        .send({ amount: 100 });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('CSRF');
    });

    it('should accept request with valid CSRF token', async () => {
      const res = await request(app)
        .post('/api/bank/deposit')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ amount: 100 });

      expect(res.status).toBe(200);
    });

    it('should reject expired CSRF token', async () => {
      // Wait for token to expire (or mock time)
      jest.useFakeTimers();
      jest.advanceTimersByTime(60 * 60 * 1000 + 1); // 1 hour + 1ms

      const res = await request(app)
        .post('/api/bank/deposit')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ amount: 100 });

      expect(res.status).toBe(403);

      jest.useRealTimers();
    });
  });

  describe('Token Rotation', () => {
    it('should rotate CSRF token on sensitive operation', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Cookie', authCookie)
        .set('X-CSRF-Token', csrfToken)
        .send({ oldPassword: 'old', newPassword: 'new' });

      const newToken = res.headers['x-csrf-token'];
      expect(newToken).toBeDefined();
      expect(newToken).not.toBe(csrfToken);
    });
  });
});
```

---

## 8. Summary & Recommendations

### Current State
- **Excellent CSRF middleware** exists but is **completely unused**
- Application is **100% vulnerable** to CSRF attacks
- **Production deployment is blocked** until CSRF is integrated

### Immediate Actions Required (Next 48 Hours)
1. Apply `requireCsrfToken` to critical financial endpoints
2. Create `/api/auth/csrf-token` endpoint
3. Implement basic client-side CSRF token handling
4. Test with manual CSRF attack simulations

### Production Deployment Blockers
1. ❌ **CRITICAL:** Zero route protection
2. ❌ **CRITICAL:** No client implementation
3. ❌ **CRITICAL:** No token distribution
4. ⚠️ **HIGH:** Socket.io bypass vulnerability
5. ⚠️ **MEDIUM:** SameSite=Lax weakness

### Final Grade Justification

**F (15%)** - Despite having production-quality CSRF middleware code:
- **0% integration** = Cannot defend against attacks
- **0% client support** = Cannot function even if integrated
- **0% endpoints protected** = Complete vulnerability
- **15% credit** for having the infrastructure ready to deploy

**To reach production readiness (Grade A):**
- Integrate CSRF on all mutation endpoints (+40%)
- Implement client-side token handling (+30%)
- Protect Socket.io connections (+15%)
- Fix SameSite configuration (+5%)
- Complete testing & documentation (+10%)

**Estimated effort to Grade A:** 2-3 weeks with dedicated focus

---

## Appendix: Attack Scenarios

### Scenario 1: Bank Robbery via CSRF
**Attacker Goal:** Drain victim's bank account

**Attack Steps:**
1. Victim logs into Desperados Destiny
2. Victim visits attacker's blog (evil-blog.com)
3. Blog contains hidden iframe:
```html
<iframe style="display:none" src="data:text/html,
  <form action='https://desperados-destiny.com/api/bank/withdraw' method='POST'>
    <input name='amount' value='999999'>
  </form>
  <script>document.forms[0].submit()</script>
"></iframe>
```
4. Browser automatically includes victim's session cookie
5. **Result:** Victim's gold transferred to... wait, where's the recipient?

**Note:** This specific attack needs recipient field, but demonstrates the vulnerability.

### Scenario 2: Character Deletion
**Attacker Goal:** Delete victim's character

**Attack Steps:**
1. Attacker sends victim a link: `https://evil-site.com/free-gold`
2. Page auto-submits form to delete character
3. **Result:** Character deleted, victim loses all progress

### Scenario 3: Admin Account Takeover
**Attacker Goal:** Compromise admin account

**Attack Steps:**
1. Admin logs into game admin panel
2. Admin checks email, clicks link to "security update"
3. Link opens page that submits form to `/api/admin/users/{attacker-id}/promote-to-admin`
4. **Result:** Attacker gains admin privileges

---

**End of Audit**
**Recommendation:** Address critical blockers before any production deployment.
