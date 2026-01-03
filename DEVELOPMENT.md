# Desperados Destiny - Development Guide

## Quick Start (Recommended)

This setup mirrors **Railway + Vercel production** as closely as possible:
- MongoDB with replica set (transactions enabled)
- Redis with password authentication
- Hot reload for fast iteration

### 1. Create Environment File

Create a `.env` file in the project root with these values:

```bash
# Application
NODE_ENV=development
PORT=5001

# MongoDB - Replica Set Mode (transactions enabled)
MONGODB_URI=mongodb://localhost:27017/desperados-destiny?replicaSet=rs0&directConnection=true

# Redis - Password Protected
REDIS_URL=redis://:devpassword@localhost:6379
REDIS_PASSWORD=devpassword

# Transactions ENABLED (matches production)
DISABLE_TRANSACTIONS=false

# JWT (dev secrets - change for production!)
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_REFRESH_EXPIRE=30d

# Security
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
SESSION_SECRET=dev-session-secret

# URLs
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:5001
VITE_WS_URL=http://localhost:5001

# Logging
LOG_LEVEL=debug

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_CHAT=true
ENABLE_PVP=true
MAINTENANCE_MODE=false

# Email (auto-verify for dev convenience)
EMAIL_VERIFICATION_REQUIRED=false
DEV_AUTO_VERIFY_EMAIL=true
```

### 2. Start Databases

```bash
docker-compose -f docker-compose.local.yml up -d
```

Wait for MongoDB replica set to initialize (health check will verify):
```bash
docker-compose -f docker-compose.local.yml ps
# Both services should show "healthy"
```

### 3. Run Backend (Hot Reload)

```bash
cd server
npm install  # First time only
npm run dev
```

### 4. Run Frontend (Hot Reload)

```bash
cd client
npm install  # First time only
npm run dev
```

### 5. Access the Game

- **Frontend**: http://localhost:5173
- **API**: http://localhost:5001
- **API Health**: http://localhost:5001/api/health

---

## Alternative: Full Docker Mode

Run everything in Docker (no hot reload, but simpler):

```bash
# Requires .env with REDIS_PASSWORD and JWT_SECRET set
docker-compose up -d

# View logs
docker-compose logs -f

# Access: http://localhost:5173
```

---

## Docker Compose Files

| File | Purpose | Use When |
|------|---------|----------|
| `docker-compose.local.yml` | Databases only (MongoDB + Redis) | **Recommended** for development |
| `docker-compose.yml` | Full stack (all services) | Quick testing without hot reload |
| `docker-compose.prod.yml` | Production with auth | CI/CD and staging |

---

## MongoDB Replica Set

**Why replica set?** Transactions require it. Critical operations like gold transfers, combat, and bank operations use transactions to ensure data consistency.

### Verify Replica Set Status

```bash
docker exec desperados-mongodb mongosh --eval "rs.status()"
```

Should show `"stateStr": "PRIMARY"`.

### Reinitialize if Needed

```bash
docker exec desperados-mongodb mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

### Full Reset

```bash
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up -d
```

---

## Common Issues

### "ReplicaSetNoPrimary" Error

**Cause**: Replica set not initialized or lost election.

```bash
# Check status
docker exec desperados-mongodb mongosh --eval "rs.status()"

# If not initialized
docker exec desperados-mongodb mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

### "ECONNREFUSED" on localhost:27017

**Cause**: MongoDB container not running.

```bash
docker-compose -f docker-compose.local.yml up -d mongodb
docker-compose -f docker-compose.local.yml ps
```

### Redis Authentication Failed

**Cause**: Password mismatch between .env and docker-compose.

Ensure `.env` has:
```bash
REDIS_URL=redis://:devpassword@localhost:6379
REDIS_PASSWORD=devpassword
```

### Transaction Errors in Tests

**Cause**: Tests run with `DISABLE_TRANSACTIONS=true` by default.

This is intentional - tests use in-memory MongoDB which doesn't support replica sets. Production code should still work because the transaction helper gracefully falls back.

---

## Production Deployment

### Railway (Backend)

1. Connect GitHub repo to Railway
2. Add MongoDB and Redis plugins
3. Set environment variables (Railway injects database URLs automatically)
4. Deploy triggers on push to main

### Vercel (Frontend)

1. Connect GitHub repo to Vercel
2. Set `VITE_API_URL` to your Railway backend URL
3. Deploy triggers on push to main

### Environment Variables for Production

**Railway** (backend):
```
NODE_ENV=production
JWT_SECRET=<generate-with-crypto>
JWT_REFRESH_SECRET=<generate-with-crypto>
SESSION_SECRET=<generate-with-crypto>
FRONTEND_URL=https://your-vercel-app.vercel.app
# MONGODB_URI and REDIS_URL are auto-injected by Railway plugins
```

**Vercel** (frontend):
```
VITE_API_URL=https://your-railway-app.railway.app
VITE_WS_URL=https://your-railway-app.railway.app
```

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend API | 5001 | http://localhost:5001 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis | 6379 | redis://localhost:6379 |

---

## Useful Commands

### NPM Scripts (from root)

```bash
# Start databases only (recommended workflow)
npm run dev:db

# Start backend + frontend with hot reload
npm run dev:local

# Stop databases
npm run stop:db

# Reset databases (deletes all data)
npm run stop:clean

# View database logs
npm run logs:db

# Run all tests
npm test

# Build for production
npm run build
```

### Direct Docker Commands

```bash
# Start databases
docker-compose -f docker-compose.local.yml up -d

# Stop databases
docker-compose -f docker-compose.local.yml down

# View database logs
docker-compose -f docker-compose.local.yml logs -f

# Reset databases (deletes all data)
docker-compose -f docker-compose.local.yml down -v
```

### Testing

```bash
# Run server tests
cd server && npm test

# Run specific test file
cd server && npm test -- --testPathPattern="combat"

# Type check
cd server && npm run typecheck
```
