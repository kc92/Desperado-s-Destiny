# Production Deployment Checklist

**CRITICAL**: This checklist must be completed before deploying to production. Each item is required for a secure, stable, and observable production environment.

---

## 1. Environment Configuration

### Required Environment Variables

- [ ] **NODE_ENV** = `production`
- [ ] **PORT** - Production port (e.g., 5001)
- [ ] **MONGODB_URI** - Production MongoDB connection string
- [ ] **REDIS_URL** - Production Redis connection string
- [ ] **FRONTEND_URL** - Production frontend URL (must use HTTPS)

### Security Configuration

- [ ] **JWT_SECRET** - Strong random secret (min 64 characters)
  - Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  - **NEVER** use development secrets in production
- [ ] **JWT_REFRESH_SECRET** - Different from JWT_SECRET (min 64 characters)
- [ ] **SESSION_SECRET** - Strong random secret (min 64 characters)
- [ ] **REDIS_PASSWORD** - Set if Redis requires authentication

### Critical Monitoring

- [ ] **SENTRY_DSN** - **REQUIRED** for error tracking and monitoring
  - Create account at https://sentry.io
  - Create new Node.js project
  - Copy DSN from project settings
  - Format: `https://xxxxx@sentry.io/xxxxx`
  - **WITHOUT THIS**: Production errors will be invisible

---

## 2. Infrastructure Setup

### Database

- [ ] MongoDB production cluster deployed
- [ ] MongoDB authentication enabled
- [ ] MongoDB backup strategy configured
- [ ] Connection pooling configured (default 10 connections)
- [ ] Database indexes created (run migrations if needed)

### Redis

- [ ] Redis instance deployed (or Redis cluster for HA)
- [ ] Redis password authentication enabled
- [ ] Redis persistence configured (AOF or RDB)
- [ ] Redis maxmemory policy set (e.g., `allkeys-lru`)

### Monitoring Stack (CRITICAL - FIX #1)

- [ ] Prometheus deployed and configured
  - Scrapes `/metrics` endpoint
  - Retention configured (default 15 days)
- [ ] Grafana deployed and connected to Prometheus
  - Dashboards imported from `server/monitoring/dashboards/`
  - Alert rules configured
- [ ] Loki deployed for log aggregation (optional but recommended)
  - Winston configured to send logs to Loki
- [ ] Alert notifications configured (Discord, email, PagerDuty)

---

## 3. Security Hardening

### HTTPS Configuration

- [ ] **HTTPS redirect enabled** (automatic in production)
- [ ] SSL/TLS certificates configured on load balancer or reverse proxy
- [ ] HTTP Strict Transport Security (HSTS) enabled (automatic via Helmet)
- [ ] Certificate auto-renewal configured (e.g., Let's Encrypt)

### Secrets Management

- [ ] All secrets stored in environment variables (never in code)
- [ ] `.env` file NOT committed to git (check `.gitignore`)
- [ ] Production secrets stored in secure vault (Railway Secrets, AWS Secrets Manager, etc.)
- [ ] Secrets rotation policy defined

### Rate Limiting

- [ ] Global rate limiting enabled (default: 100 requests/15min)
- [ ] Token refresh endpoint rate limited (prevent brute force)
- [ ] Authentication endpoints rate limited
- [ ] API-specific rate limits configured where needed

### CORS Configuration

- [ ] **FRONTEND_URL** set to production domain (HTTPS only)
- [ ] No wildcard origins (`*`) allowed
- [ ] Credentials enabled only for trusted origins

---

## 4. Performance Optimization

### Caching (CRITICAL - FIX #3)

- [ ] Redis caching enabled for:
  - Balance validation (Gini coefficient)
  - Leaderboards
  - Expensive aggregations
- [ ] Cache TTLs configured appropriately
- [ ] Cache invalidation strategy defined

### Database Optimization

- [ ] Indexes created for frequently queried fields
- [ ] `.lean()` used for read-only queries
- [ ] Aggregation pipelines optimized
- [ ] Connection pooling configured
- [ ] Query timeouts configured (prevent long-running queries)

### Race Condition Fixes (CRITICAL - FIX #5)

- [ ] Gang operations wrapped in transactions
- [ ] Shop purchases use atomic operations
- [ ] Inventory updates use `findOneAndUpdate` with conditions
- [ ] Currency transactions use `DollarService` with sessions

---

## 5. Code Quality & Testing

### Production Fixes Applied

- [ ] HTTPS redirect middleware enabled ✓ (Fix #3)
- [ ] Sentry DSN configured ✓ (Fix #4)
- [ ] BalanceValidation performance optimized (Fix #2)
- [ ] Race conditions fixed (Fix #5)
- [ ] Monitoring stack deployed (Fix #1)

### Testing

- [ ] All unit tests passing (`npm test`)
- [ ] Integration tests passing
- [ ] Payment system tests passing (critical for revenue)
- [ ] Load testing completed (simulate expected traffic)
- [ ] Smoke tests defined for critical paths

---

## 6. Logging & Observability

### Logging

- [ ] Winston logger configured for production
- [ ] Log level set to `info` or `warn` (not `debug`)
- [ ] Structured logging enabled (JSON format)
- [ ] Sensitive data redacted from logs
- [ ] Log aggregation configured (Loki, CloudWatch, etc.)

### Metrics

- [ ] Prometheus metrics exposed at `/metrics`
- [ ] Custom business metrics tracked:
  - Active users
  - Transactions per minute
  - API response times
  - Error rates
- [ ] Grafana dashboards created and tested

### Alerts

- [ ] Critical alerts configured:
  - Error rate > 1%
  - Response time > 2s (p95)
  - Database connection failures
  - Redis connection failures
  - Memory usage > 85%
  - CPU usage > 80%
- [ ] Alert notification channels configured
- [ ] On-call rotation defined

---

## 7. Deployment Process

### Pre-Deployment

- [ ] Create production branch or tag
- [ ] Run full test suite
- [ ] Build production assets (`npm run build`)
- [ ] Review recent code changes
- [ ] Database migrations tested in staging
- [ ] Rollback plan documented

### Deployment

- [ ] Deploy during low-traffic window (if possible)
- [ ] Enable maintenance mode (if downtime expected)
- [ ] Run database migrations (if any)
- [ ] Deploy new code
- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] Monitor logs for errors (first 30 minutes critical)

### Post-Deployment

- [ ] Health checks passing (`/api/health`)
- [ ] Integration health checks passing (`/api/health/integrations`)
- [ ] Error rate normal (< 0.1%)
- [ ] Response times normal (< 500ms p95)
- [ ] No critical alerts triggered
- [ ] User-facing features tested
- [ ] Disable maintenance mode (if enabled)

---

## 8. Disaster Recovery

### Backups

- [ ] MongoDB automated backups enabled
- [ ] Backup retention policy defined (e.g., 30 days)
- [ ] Backup restoration tested (critical!)
- [ ] Redis snapshots configured (if persistence needed)

### Rollback Plan

- [ ] Previous version tagged and deployable
- [ ] Rollback procedure documented
- [ ] Database migration rollback scripts ready
- [ ] Rollback tested in staging

---

## 9. Documentation

- [ ] Production deployment guide updated
- [ ] Environment variables documented
- [ ] Architecture diagram updated
- [ ] API documentation current
- [ ] Runbook for common issues created
- [ ] On-call procedures documented

---

## 10. Final Verification

### Critical Endpoints

- [ ] `GET /` - Server info (should return 200)
- [ ] `GET /api/health` - Health check (should return healthy)
- [ ] `GET /api/health/integrations` - Integration health (MongoDB, Redis healthy)
- [ ] `GET /metrics` - Prometheus metrics (should return metrics)
- [ ] `POST /api/v1/auth/register` - User registration (test flow)
- [ ] `POST /api/v1/auth/login` - User login (test flow)

### Security Verification

- [ ] HTTP requests redirect to HTTPS
- [ ] CORS only allows configured origins
- [ ] Rate limiting working (test by hitting limits)
- [ ] Authentication required for protected endpoints
- [ ] Weak secrets rejected (test with development secrets)

### Monitoring Verification

- [ ] Sentry receiving test errors
- [ ] Prometheus scraping metrics
- [ ] Grafana dashboards showing data
- [ ] Alerts triggering correctly (test alert rules)
- [ ] Logs flowing to aggregation system

---

## Completion Sign-Off

**Deployment Date**: _______________

**Deployed By**: _______________

**Reviewed By**: _______________

**Production Score**: ___ / 10

**Critical Issues Remaining**: _______________

**Sign-Off**: [ ] All critical items completed, production ready

---

## Emergency Contacts

- **On-Call Engineer**: _______________
- **Database Admin**: _______________
- **DevOps Lead**: _______________
- **Product Owner**: _______________

---

## Notes

Add any deployment-specific notes or exceptions here:

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________
