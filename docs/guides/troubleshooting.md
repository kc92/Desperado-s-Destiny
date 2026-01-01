# Troubleshooting Guide

**Last Updated:** 2025-12-31

Common issues and solutions for Desperados Destiny development.

---

## Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Services won't start | `docker-compose down && docker-compose up` |
| Type errors after pull | `npm run build:shared` |
| Stale data | Clear browser localStorage |
| Tests failing | `npm run test -- --clearCache` |

---

## Development Environment

### Docker Not Starting

**Symptoms:** `docker-compose up` fails

**Solutions:**
1. Ensure Docker Desktop is running
2. Check available disk space (Docker needs ~10GB)
3. Reset Docker: Settings → Reset to factory defaults
4. On Windows: Restart WSL2: `wsl --shutdown`

### Port Conflicts

**Symptoms:** "Address already in use" error

**Find Process (Windows):**
```bash
netstat -ano | findstr :5001
taskkill /PID <pid> /F
```

**Find Process (Linux/Mac):**
```bash
lsof -i :5001
kill -9 <pid>
```

**Common Ports:**
| Port | Service |
|------|---------|
| 5173 | Vite (Frontend) |
| 5001 | Express (Backend) |
| 27017 | MongoDB |
| 6379 | Redis |

### npm Install Fails

**Solutions:**
1. Delete `node_modules` and `package-lock.json`
2. Clear npm cache: `npm cache clean --force`
3. Run `npm install` again
4. Try with `--legacy-peer-deps` flag

---

## Database Issues

### MongoDB Connection Failed

**Symptoms:** "MongoNetworkError" or "ECONNREFUSED"

**Solutions:**
1. Check Docker is running: `docker ps`
2. Start MongoDB: `docker-compose up mongodb -d`
3. Verify connection string in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/desperados-destiny
   ```
4. Check MongoDB logs: `docker-compose logs mongodb`

### MongoDB Replica Set Issues

**Symptoms:** "not master" or transaction errors

**Solutions:**
1. Ensure replica set is initialized:
   ```bash
   docker-compose exec mongodb mongosh --eval "rs.status()"
   ```
2. If not initialized:
   ```bash
   docker-compose exec mongodb mongosh --eval "rs.initiate()"
   ```

### Redis Connection Failed

**Symptoms:** "ECONNREFUSED" to Redis

**Solutions:**
1. Check Redis is running: `docker ps | grep redis`
2. Start Redis: `docker-compose up redis -d`
3. Verify Redis config in `.env`:
   ```
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

---

## TypeScript Issues

### Type Errors After Git Pull

**Solution:**
```bash
# Rebuild shared types
npm run build:shared

# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Cannot Find Module '@desperados/shared'

**Solutions:**
1. Run `npm install` from root
2. Build shared: `npm run build:shared`
3. Check `tsconfig.json` paths are correct

### Implicit 'any' Type Errors

**Solutions:**
1. Add explicit types
2. Or add `// @ts-ignore` (not recommended)
3. Check `shared/src/types/` for existing interfaces

---

## Frontend Issues

### Blank Page / White Screen

**Solutions:**
1. Check browser console for errors (F12)
2. Clear localStorage: `localStorage.clear()`
3. Hard refresh: Ctrl+Shift+R
4. Check for JavaScript errors in terminal

### React Router Warnings

**Symptoms:** "Future flag warnings" in console

**Status:** Known issue, safe to ignore. Will be resolved in React Router v7 upgrade.

### Zustand State Not Updating

**Solutions:**
1. Check store subscription is correct
2. Use `useStore(state => state.property)` not `useStore().property`
3. Verify action is calling `set()` correctly

### Socket.io Not Connecting

**Solutions:**
1. Check backend is running
2. Verify Socket.io URL in client config
3. Check for CORS errors in browser console
4. Ensure user is authenticated (socket requires auth)

---

## Backend Issues

### API Returns 401 Unauthorized

**Solutions:**
1. Check JWT token in request headers
2. Verify token hasn't expired (7 days default)
3. Log in again to get fresh token
4. Check `auth.middleware.ts` for token validation logic

### API Returns 429 Too Many Requests

**Cause:** Rate limiting triggered

**Solutions:**
1. Wait 1 minute and retry
2. In development, temporarily increase limits:
   ```typescript
   // server/src/middleware/rateLimiter.ts
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 1000 // Increase for dev
   ```

### Background Jobs Not Running

**Solutions:**
1. Check Redis is running (Bull uses Redis)
2. Verify job registration in `server/src/jobs/`
3. Check Bull dashboard (if enabled)
4. Look for errors in server logs

---

## Playtest Issues (From Recent Sessions)

### P0: Gathering Items Not Added to Inventory

**Status:** Known bug, in backlog

**Workaround:** Use crime loot drops instead of gathering

**Debug:** Check `server/src/services/gathering.service.ts`

### P1: Skill Training Button No Feedback

**Status:** Known bug, in backlog

**Workaround:** Check Skills page later to verify training started

**Debug:** Check `client/src/pages/Skills.tsx`

### P2: Card onClick Not Working

**Status:** Known bug, in backlog

**Workaround:** Use keyboard Enter/Space to activate

**Debug:** Check `client/src/components/ui/Card.tsx`

---

## Testing Issues

### Tests Timeout

**Solutions:**
1. Increase timeout in test:
   ```typescript
   jest.setTimeout(30000);
   ```
2. Check for unhandled promises
3. Ensure test database is available

### Tests Pass Locally, Fail in CI

**Solutions:**
1. Check for timing-dependent tests
2. Ensure all env vars are set in CI
3. Use `jest --runInBand` for sequential execution

### E2E Tests Failing

**Solutions:**
1. Ensure all services are running
2. Reset test database: `npm run db:reset:test`
3. Check for selector changes in UI
4. Increase Playwright timeout for slow operations

---

## Performance Issues

### Slow API Responses

**Checklist:**
1. Check MongoDB indexes exist
2. Enable Redis caching
3. Check for N+1 queries
4. Profile with `console.time()`

### Memory Leaks

**Solutions:**
1. Check for uncleared timeouts/intervals
2. Verify Socket.io listeners are cleaned up
3. Check for large objects in Redis
4. Monitor with Node.js `--inspect` flag

---

## Getting More Help

1. Search GitHub issues
2. Check server logs: `docker-compose logs -f`
3. Check browser console: F12 → Console
4. Add debug logging and reproduce
5. Create a detailed GitHub issue with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Relevant logs

---

*If you found a solution not listed here, please add it!*
