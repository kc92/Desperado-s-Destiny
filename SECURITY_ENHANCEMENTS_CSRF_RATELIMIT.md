# Security Enhancements: CSRF Token & Rate Limiting

## Overview
Enhanced CSRF token handling and rate limiting for sensitive endpoints in the Desperados Destiny server to improve security posture and prevent abuse.

## Date
2025-11-25

## Changes Made

### 1. CSRF Middleware Enhancements (`server/src/middleware/csrf.middleware.ts`)

#### New Features

**Token Rotation**
- Implemented `CSRFManager` class with token rotation capability
- New `rotateCsrfToken()` function for sensitive operations
- New `requireCsrfTokenWithRotation` middleware that automatically rotates tokens
- Returns new token in `X-CSRF-Token` response header

**Enhanced Expiry Management**
- Reduced token expiry from 24 hours to 1 hour (more secure)
- Configurable expiry: `CSRF_EXPIRY_MS = 60 * 60 * 1000` (1 hour)
- Periodic cleanup every 5 minutes to prevent memory leaks
- Usage tracking: `lastUsed` and `useCount` fields

**User Binding**
- Tokens are now bound to specific user IDs
- Prevents token theft and reuse across accounts
- Validates user ID on every token check

**New Functions & Middleware**
- `rotateCsrfToken(oldToken, userId)` - Rotate token after use
- `invalidateCsrfToken(userId)` - Invalidate all user tokens
- `requireCsrfTokenWithRotation` - Middleware with automatic rotation
- `getCsrfToken(req, res)` - Endpoint handler to get fresh token

**Improved Logging**
- Better security event logging
- Tracks token mismatches and expiry events
- Debug mode for monitoring

#### Usage Example

```typescript
// For sensitive operations (password change, gold transfer)
router.post('/sensitive-operation',
  requireAuth,
  requireCsrfTokenWithRotation,
  handler
);

// Client receives new token in response header
// X-CSRF-Token: <new-token>
```

---

### 2. Rate Limiter Enhancements (`server/src/middleware/rateLimiter.ts`)

#### New Rate Limiters

**Login Rate Limiter**
- Window: 15 minutes
- Max requests: 5 per IP
- Purpose: Prevent brute force attacks
- Key: IP address

**Registration Rate Limiter** (NEW)
- Window: 1 hour
- Max requests: 3 per IP
- Purpose: Prevent account spam and bot registrations
- Key: IP address
- Much stricter than login to prevent mass account creation

**Enhanced Gold Transfer Rate Limiter**
- Window: 1 hour (increased from 5 minutes)
- Max requests: 10 per user
- Purpose: Prevent gold duplication exploits
- Key: User ID (not IP) - more secure
- Better error messages with limit information

**Enhanced Shop Purchase Rate Limiter**
- Window: 1 hour (increased from 1 minute)
- Max requests: 30 per user
- Purpose: Prevent automated shop abuse
- Key: User ID (not IP)
- Generous for normal gameplay but prevents bots

#### Key Improvements

1. **User-Based Limiting** (not just IP)
   - Gold transfers: Limited by user ID
   - Shop purchases: Limited by user ID
   - Prevents abuse via IP rotation/proxies

2. **Better Logging**
   - Includes user ID and IP in logs
   - Clear identification of rate limit violations

3. **Improved Error Messages**
   - Includes specific limits in error messages
   - Helps users understand why they're blocked

---

### 3. Route Updates

#### Authentication Routes (`server/src/routes/auth.routes.ts`)

**Before:**
```typescript
// Rate limiters commented out
router.post('/register', /* authRateLimiter, */ asyncHandler(register));
router.post('/login', /* authRateLimiter, */ asyncHandler(login));
```

**After:**
```typescript
// Specific rate limiters enabled
router.post('/register', registrationRateLimiter, asyncHandler(register));
router.post('/login', loginRateLimiter, asyncHandler(login));
router.post('/forgot-password', passwordResetRateLimiter, asyncHandler(forgotPassword));
router.post('/reset-password', passwordResetRateLimiter, asyncHandler(resetPassword));
```

**Impact:**
- Registration: Max 3 attempts per hour per IP
- Login: Max 5 attempts per 15 minutes per IP
- Password reset: Max 3 attempts per hour per IP

#### Shop Routes (`server/src/routes/shop.routes.ts`)

**Added:**
```typescript
import { shopRateLimiter } from '../middleware/rateLimiter';

// Rate-limited purchase endpoint (30 per hour per user)
router.post('/buy', shopRateLimiter, buyItem);
```

**Impact:**
- Shop purchases limited to 30 per hour per user
- Prevents rapid purchase exploits and race conditions

---

## Security Benefits

### CSRF Protection
1. **Token Rotation**: Prevents replay attacks on sensitive operations
2. **Shorter Expiry**: 1-hour window reduces attack surface
3. **User Binding**: Prevents token theft and cross-account abuse
4. **Better Tracking**: Usage metrics for security monitoring

### Rate Limiting
1. **Brute Force Prevention**: Login limited to 5 attempts per 15 min
2. **Account Spam Prevention**: Registration limited to 3 per hour
3. **Economic Exploit Prevention**: User-based limiting for gold/shop
4. **DDoS Mitigation**: Overall request limiting by IP

---

## Configuration

### CSRF Settings
```typescript
const CSRF_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
```

### Rate Limit Settings
```typescript
// Login: 5 per 15 minutes per IP
loginRateLimiter: { windowMs: 15 * 60 * 1000, max: 5 }

// Registration: 3 per hour per IP
registrationRateLimiter: { windowMs: 60 * 60 * 1000, max: 3 }

// Gold Transfer: 10 per hour per user
goldTransferRateLimiter: { windowMs: 60 * 60 * 1000, max: 10 }

// Shop Purchase: 30 per hour per user
shopRateLimiter: { windowMs: 60 * 60 * 1000, max: 30 }

// Password Reset: 3 per hour per IP
passwordResetRateLimiter: { windowMs: 60 * 60 * 1000, max: 3 }
```

---

## Production Considerations

### CSRF Token Storage
Current implementation uses in-memory Map storage. For production:

```typescript
// TODO: Replace with Redis-backed storage for distributed systems
const csrfManager = new CSRFManager();
// Should be: const csrfManager = new RedisCsrfManager(redisClient);
```

### Rate Limit Storage
Current implementation uses express-rate-limit with memory store.
For production with multiple servers:

```typescript
// TODO: Use Redis store for rate limiting
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:',
  }),
  // ... other options
});
```

---

## Testing

### CSRF Testing
- Test token expiry (should fail after 1 hour)
- Test token rotation (should return new token)
- Test user binding (token from user A shouldn't work for user B)
- Test invalid/missing tokens

### Rate Limit Testing
- Test registration limit (should block after 3 attempts)
- Test login limit (should block after 5 attempts)
- Test shop limit (should block after 30 purchases)
- Test that limits reset after window expires

### Environment Skipping
All rate limiters skip in development and test environments:
```typescript
skip: () => {
  return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
}
```

---

## Files Modified

1. `server/src/middleware/csrf.middleware.ts` - Enhanced CSRF protection
2. `server/src/middleware/rateLimiter.ts` - Enhanced rate limiting
3. `server/src/routes/auth.routes.ts` - Applied specific rate limiters
4. `server/src/routes/shop.routes.ts` - Applied shop rate limiter

---

## Next Steps

### Recommended Future Enhancements

1. **Redis Integration**
   - Implement Redis-backed CSRF token storage
   - Use Redis for distributed rate limiting
   - Enables horizontal scaling

2. **CSRF Token Endpoint**
   - Add route to expose `getCsrfToken` endpoint
   - Allow clients to refresh expired tokens
   - Example: `GET /api/auth/csrf-token`

3. **Gold Transfer Endpoint**
   - When implemented, apply `goldTransferRateLimiter`
   - Also apply `requireCsrfTokenWithRotation`
   - Example:
     ```typescript
     router.post('/transfer',
       requireAuth,
       goldTransferRateLimiter,
       requireCsrfTokenWithRotation,
       transferGold
     );
     ```

4. **Monitoring & Alerts**
   - Add metrics for rate limit violations
   - Alert on unusual patterns (many violations from same IP)
   - Track CSRF token usage statistics

5. **Additional Sensitive Endpoints**
   - Apply `requireCsrfTokenWithRotation` to:
     - Password changes
     - Email changes
     - Account deletion
     - Permission changes

---

## Notes

- All changes maintain backward compatibility
- Rate limiters can be disabled in development/test environments
- CSRF protection includes both strict and optional modes
- Legacy `authRateLimiter` maintained for backward compatibility (aliases `loginRateLimiter`)
