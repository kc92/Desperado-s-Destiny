# Desperados Destiny - Railway + Vercel Deployment Guide

Quick deployment guide for Railway (backend) and Vercel (frontend).

---

## Architecture

```
[Vercel - Frontend]  <-->  [Railway - Backend]  <-->  [Railway - MongoDB]
     (React/Vite)              (Node/Express)           [Railway - Redis]
```

---

## Step 1: Railway Backend Deployment

### 1.1 Create Railway Project

1. Go to [Railway.app](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Railway will auto-detect the `railway.json` configuration

### 1.2 Add Database Services

In your Railway project, add these services:

1. **MongoDB**: Click "New" → "Database" → "MongoDB"
2. **Redis**: Click "New" → "Database" → "Redis"

### 1.3 Configure Environment Variables

In Railway, go to your backend service → Variables tab. Add these:

```bash
# ===== REQUIRED =====

# Node environment
NODE_ENV=production

# Server
PORT=5001

# Database (Railway provides these automatically when you add MongoDB/Redis)
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Frontend URL (update after deploying to Vercel)
FRONTEND_URL=https://your-app.vercel.app

# Security - GENERATE NEW SECRETS FOR PRODUCTION!
# Use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-different-64-char-random-string>
SESSION_SECRET=<generate-another-64-char-random-string>

# ===== PLAYTEST MODE =====
# Set to 'true' to give everyone premium for free
PLAYTEST_MODE=true

# ===== OPTIONAL BUT RECOMMENDED =====

# Sentry error tracking
SENTRY_DSN=<your-sentry-dsn>

# Email (use Resend, SendGrid, or similar)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=<your-smtp-api-key>
EMAIL_FROM=noreply@yourdomain.com

# Rate limiting (set to 'false' in prod for security)
RATE_LIMIT_REQUIRE_REDIS=true
```

### 1.4 Deploy

Railway will auto-deploy when you push to your connected branch. The `railway.json` handles:
- Build: `cd server && npm ci && npm run build`
- Start: Creates indexes, then starts server
- Health check: `/api/health`

---

## Step 2: Vercel Frontend Deployment

### 2.1 Create Vercel Project

1. Go to [Vercel](https://vercel.com) and import your repository
2. Set the **Root Directory** to `client`
3. Vercel will auto-detect the `vercel.json` configuration

### 2.2 Configure Environment Variables

In Vercel, go to Settings → Environment Variables. Add:

```bash
# Backend API URL (your Railway backend URL)
VITE_API_URL=https://your-backend.railway.app

# Socket.io URL (same as API URL)
VITE_SOCKET_URL=https://your-backend.railway.app

# Sentry DSN (optional but recommended)
VITE_SENTRY_DSN=<your-sentry-dsn>
```

### 2.3 Update CSP Headers

After you have your Railway backend URL, update `client/vercel.json` to include it in the `connect-src` directive:

```json
"Content-Security-Policy": "... connect-src 'self' https://your-backend.railway.app wss://your-backend.railway.app; ..."
```

### 2.4 Deploy

Vercel will auto-deploy when you push. The `vercel.json` handles:
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites
- Security headers

---

## Step 3: Post-Deployment Configuration

### 3.1 Update CORS on Railway

Once you have your Vercel URL, update the `FRONTEND_URL` in Railway:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

### 3.2 Verify Deployment

1. Visit your Vercel URL - you should see the login page
2. Check Railway logs for any startup errors
3. Test registration and login flow
4. Verify WebSocket connection (check browser console)

---

## Environment Variables Reference

### Backend (Railway)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | Usually `5001` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `FRONTEND_URL` | Yes | Your Vercel frontend URL |
| `JWT_SECRET` | Yes | 64+ char random string |
| `JWT_REFRESH_SECRET` | Yes | Different 64+ char random string |
| `SESSION_SECRET` | Yes | Another 64+ char random string |
| `PLAYTEST_MODE` | No | Set to `true` for free premium |
| `SENTRY_DSN` | Recommended | Sentry error tracking |
| `SMTP_*` | Recommended | Email configuration |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Railway backend URL |
| `VITE_SOCKET_URL` | Yes | Railway backend URL (same) |
| `VITE_SENTRY_DSN` | Recommended | Sentry error tracking |

---

## Playtest Mode

For the playtest, `PLAYTEST_MODE=true` gives all players:
- **Premium benefits for free**
- 50% faster energy regeneration
- +50 max energy
- +10% gold and XP bonuses
- +25% skill training XP
- +50 bank slots
- 50% off fast travel

To disable after playtest, set `PLAYTEST_MODE=false` or remove the variable.

---

## Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Ensure MongoDB and Redis services are running
- Verify all required env vars are set

### CORS errors
- Update `FRONTEND_URL` in Railway to match your Vercel URL exactly
- Check vercel.json CSP headers include your backend URL

### WebSocket connection fails
- Ensure `VITE_SOCKET_URL` is set correctly in Vercel
- Check CSP headers allow `wss://` connections to backend

### 503 errors on Railway
- Check health endpoint `/api/health` is responding
- May need to increase `healthcheckTimeout` in railway.json

---

## Generating Secure Secrets

Run this command to generate secure secrets:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**IMPORTANT**: Each secret must be different!

---

*Last updated: December 2024*
