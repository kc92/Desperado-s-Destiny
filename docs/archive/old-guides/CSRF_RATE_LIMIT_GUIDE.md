# CSRF & Rate Limiting Developer Guide

## Quick Reference for Developers

### CSRF Protection

#### When to Use CSRF Protection

**Standard CSRF (requireCsrfToken)**
Use for all state-changing operations:
```typescript
router.post('/update-profile', requireAuth, requireCsrfToken, updateProfile);
```

**CSRF with Rotation (requireCsrfTokenWithRotation)**
Use for sensitive operations:
```typescript
router.post('/change-password', requireAuth, requireCsrfTokenWithRotation, changePassword);
router.post('/transfer-gold', requireAuth, requireCsrfTokenWithRotation, transferGold);
router.delete('/account', requireAuth, requireCsrfTokenWithRotation, deleteAccount);
```

#### Client-Side CSRF Token Handling

**Getting a Token**
```javascript
// After login, get CSRF token
const response = await fetch('/api/auth/csrf-token', {
  credentials: 'include'
});
const { csrfToken } = await response.json();

// Store in memory (not localStorage for security)
let csrfToken = data.csrfToken;
```

**Sending Token with Requests**
```javascript
// Option 1: Header (recommended)
fetch('/api/some-endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  credentials: 'include',
  body: JSON.stringify(data)
});

// Option 2: Body
fetch('/api/some-endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    ...data,
    _csrf: csrfToken
  })
});
```

**Handling Token Rotation**
```javascript
// For endpoints with rotation, update token from response
const response = await fetch('/api/sensitive-operation', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  },
  credentials: 'include',
  body: JSON.stringify(data)
});

// Get new token from response header
const newToken = response.headers.get('X-CSRF-Token');
if (newToken) {
  csrfToken = newToken; // Update stored token
}
```

**Handling Expired Tokens**
```javascript
async function makeRequest(url, options) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken
    }
  });

  // If CSRF token expired, get new one and retry
  if (response.status === 403) {
    const error = await response.json();
    if (error.message.includes('CSRF')) {
      // Get new token
      const tokenResponse = await fetch('/api/auth/csrf-token', {
        credentials: 'include'
      });
      const { csrfToken: newToken } = await tokenResponse.json();
      csrfToken = newToken;

      // Retry original request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-CSRF-Token': csrfToken
        }
      });
    }
  }

  return response;
}
```

---

### Rate Limiting

#### Available Rate Limiters

| Limiter | Window | Max | Use Case | Key |
|---------|--------|-----|----------|-----|
| `loginRateLimiter` | 15 min | 5 | Login attempts | IP |
| `registrationRateLimiter` | 1 hour | 3 | Account registration | IP |
| `passwordResetRateLimiter` | 1 hour | 3 | Password reset | IP |
| `goldTransferRateLimiter` | 1 hour | 10 | Gold transfers | User ID |
| `shopRateLimiter` | 1 hour | 30 | Shop purchases | User ID |
| `characterCreationRateLimiter` | 15 min | 5 | Character creation | IP |
| `gangOperationRateLimiter` | 10 min | 20 | Gang operations | IP |
| `apiRateLimiter` | 15 min | 200 | General API | IP |

#### Applying Rate Limiters

**Single Limiter**
```typescript
import { shopRateLimiter } from '../middleware/rateLimiter';

router.post('/buy', requireAuth, shopRateLimiter, buyItem);
```

**Multiple Limiters**
```typescript
// Apply both general API limit and specific shop limit
router.post('/buy',
  apiRateLimiter,      // General protection
  requireAuth,
  shopRateLimiter,     // Specific shop protection
  buyItem
);
```

**Custom Rate Limiter**
```typescript
import rateLimit from 'express-rate-limit';

const customLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max requests per window
  keyGenerator: (req) => {
    // Rate limit by user ID if available, otherwise IP
    return (req as any).user?._id?.toString() || req.ip || 'unknown';
  },
  handler: (req, _res) => {
    logger.warn(`Custom rate limit exceeded for ${req.ip}`);
    throw new AppError(
      'Too many requests, please try again later',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
  skip: () => {
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  },
});
```

#### Client-Side Rate Limit Handling

**Detecting Rate Limits**
```javascript
try {
  const response = await fetch('/api/endpoint', options);

  if (response.status === 429) {
    const error = await response.json();
    console.error('Rate limited:', error.message);

    // Check rate limit headers
    const limit = response.headers.get('RateLimit-Limit');
    const remaining = response.headers.get('RateLimit-Remaining');
    const reset = response.headers.get('RateLimit-Reset');

    // Show user-friendly message
    showError(`Too many requests. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds`);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

**Implementing Exponential Backoff**
```javascript
async function requestWithBackoff(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    if (response.status !== 429) {
      return response;
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, i) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  throw new Error('Max retries exceeded');
}
```

---

### Best Practices

#### CSRF
1. ✅ Always use CSRF for state-changing operations (POST, PUT, DELETE)
2. ✅ Use rotation for highly sensitive operations
3. ✅ Store tokens in memory, not localStorage
4. ✅ Handle token expiry gracefully
5. ❌ Never skip CSRF in production
6. ❌ Don't send tokens in URL query parameters

#### Rate Limiting
1. ✅ Use user-based limiting for authenticated endpoints
2. ✅ Use IP-based limiting for public endpoints
3. ✅ Provide clear error messages with limits
4. ✅ Show remaining requests in UI when appropriate
5. ❌ Don't disable in production
6. ❌ Don't make limits too strict (bad UX)

---

### Testing

#### CSRF Tests
```typescript
describe('CSRF Protection', () => {
  it('should reject requests without CSRF token', async () => {
    const response = await request(app)
      .post('/api/protected')
      .send({ data: 'test' });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('CSRF');
  });

  it('should accept requests with valid CSRF token', async () => {
    // Get token
    const tokenRes = await request(app)
      .get('/api/auth/csrf-token')
      .set('Cookie', authCookie);

    const csrfToken = tokenRes.body.data.csrfToken;

    // Use token
    const response = await request(app)
      .post('/api/protected')
      .set('Cookie', authCookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ data: 'test' });

    expect(response.status).toBe(200);
  });

  it('should rotate token for sensitive operations', async () => {
    const response = await request(app)
      .post('/api/sensitive')
      .set('Cookie', authCookie)
      .set('X-CSRF-Token', oldToken)
      .send({ data: 'test' });

    expect(response.status).toBe(200);
    const newToken = response.headers['x-csrf-token'];
    expect(newToken).toBeDefined();
    expect(newToken).not.toBe(oldToken);
  });
});
```

#### Rate Limit Tests
```typescript
describe('Rate Limiting', () => {
  it('should enforce rate limits', async () => {
    const requests = [];

    // Make 6 requests (limit is 5)
    for (let i = 0; i < 6; i++) {
      requests.push(
        request(app).post('/api/auth/login').send(credentials)
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });

  it('should reset after window expires', async () => {
    // Hit rate limit
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/login').send(credentials);
    }

    // Wait for window to expire (use jest.useFakeTimers)
    jest.advanceTimersByTime(15 * 60 * 1000 + 1000);

    // Should work again
    const response = await request(app)
      .post('/api/auth/login')
      .send(credentials);

    expect(response.status).not.toBe(429);
  });
});
```

---

### Troubleshooting

#### "CSRF token required"
- Client forgot to include token in request
- Check request headers/body for token
- Ensure token is obtained after login

#### "Invalid or expired CSRF token"
- Token expired (1 hour limit)
- Token used by different user
- Token was invalidated (logout, password change)
- Solution: Get fresh token from `/api/auth/csrf-token`

#### "Too many requests"
- Rate limit exceeded
- Check RateLimit-* headers for details
- Implement exponential backoff
- Consider if limit is too strict

#### Rate limits not working
- Check environment (disabled in dev/test)
- Verify middleware order (should be early)
- Check Redis connection (if using Redis store)

---

### Migration Guide

#### Enabling CSRF for Existing Endpoints

**Step 1:** Add CSRF middleware
```typescript
// Before
router.post('/update', requireAuth, updateHandler);

// After
router.post('/update', requireAuth, requireCsrfToken, updateHandler);
```

**Step 2:** Update client code
```javascript
// Add CSRF token to all requests
const headers = {
  'Content-Type': 'application/json',
  'X-CSRF-Token': csrfToken  // Add this
};
```

**Step 3:** Test thoroughly
- Test with valid token
- Test with invalid token
- Test with expired token
- Test token rotation

#### Adding Rate Limiting

**Step 1:** Choose appropriate limiter
```typescript
import { shopRateLimiter } from '../middleware/rateLimiter';
```

**Step 2:** Apply to route
```typescript
router.post('/buy', requireAuth, shopRateLimiter, buyItem);
```

**Step 3:** Update client error handling
```javascript
if (response.status === 429) {
  showRateLimitError(response);
}
```

---

### Production Checklist

- [ ] CSRF tokens use Redis in production
- [ ] Rate limiters use Redis store
- [ ] All sensitive endpoints have CSRF protection
- [ ] All abuse-prone endpoints have rate limiting
- [ ] Client handles CSRF token expiry
- [ ] Client handles rate limit errors
- [ ] Monitoring for rate limit violations
- [ ] Alerts for unusual CSRF failures
- [ ] Rate limits are tuned based on real usage
- [ ] Documentation updated for new endpoints

---

## Additional Resources

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [express-rate-limit Documentation](https://github.com/nfriedly/express-rate-limit)
