# Desperados Destiny - Production Deployment Checklist

## Overview
This checklist ensures safe, reliable deployments to production. Follow each section in order.

---

## Pre-Deployment Verification

### Code Quality
- [ ] All TypeScript compiles without errors
  ```bash
  cd client && npm run typecheck
  cd server && npm run typecheck
  cd shared && npm run build
  ```
- [ ] ESLint passes with no errors
  ```bash
  npm run lint
  ```
- [ ] All unit tests pass
  ```bash
  cd server && npm test
  cd client && npm test
  ```
- [ ] Comprehensive tests pass
  ```bash
  cd server && npm run test:comprehensive
  ```

### Version Control
- [ ] All changes committed to feature branch
- [ ] Pull request created and reviewed
- [ ] CI/CD pipeline passes (GitHub Actions)
- [ ] Branch merged to `main`/`master`
- [ ] Git tag created for release
  ```bash
  git tag -a v1.x.x -m "Release v1.x.x - [description]"
  git push origin v1.x.x
  ```

### Documentation
- [ ] CHANGELOG.md updated with new features/fixes
- [ ] API documentation updated if endpoints changed
- [ ] Breaking changes documented

---

## Environment Preparation

### Secrets & Configuration
- [ ] Production environment variables verified
  - `MONGODB_URI` - Points to production database
  - `REDIS_URL` - Points to production Redis
  - `JWT_SECRET` - Unique, cryptographically secure
  - `SENTRY_DSN` - Error tracking configured
  - `FRONTEND_URL` - Correct production domain
- [ ] SSL certificates valid (not expiring within 30 days)
- [ ] DNS records configured correctly

### Infrastructure
- [ ] Sufficient disk space (>20% free)
  ```bash
  df -h
  ```
- [ ] Memory availability (>30% free)
  ```bash
  free -m
  ```
- [ ] Database backup completed
  ```bash
  mongodump --uri="$MONGODB_URI" --out=/backups/mongodb/$(date +%Y-%m-%d)/
  ```
- [ ] Redis backup completed (if persistent data)
  ```bash
  redis-cli -a $REDIS_PASSWORD BGSAVE
  ```

---

## Deployment Steps

### 1. Notify Team
- [ ] Post in team channel: "Starting production deployment v1.x.x"
- [ ] Confirm no other deployments in progress

### 2. Enable Maintenance Mode (Optional)
For major releases or database migrations:
```bash
curl -X POST https://[domain]/api/admin/system/maintenance \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"enabled": true, "message": "Upgrading to v1.x.x - back shortly!"}'
```

### 3. Pull Latest Images
```bash
# If using Docker Hub/GHCR
docker pull ghcr.io/[org]/desperados-server:prod
docker pull ghcr.io/[org]/desperados-client:prod
```

### 4. Run Database Migrations (If Any)
```bash
# Connect to production server
ssh prod-server

# Run migrations
cd /app/server
npm run migrate:up
```

### 5. Deploy with Zero-Downtime
```bash
# Rolling update
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# Wait for health check
sleep 30

# Verify health
curl -f http://localhost:5001/health || echo "HEALTH CHECK FAILED"
```

### 6. Deploy Frontend
```bash
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
```

### 7. Disable Maintenance Mode
```bash
curl -X POST https://[domain]/api/admin/system/maintenance \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"enabled": false}'
```

---

## Post-Deployment Verification

### Immediate Checks (First 5 Minutes)
- [ ] Health endpoint returns 200
  ```bash
  curl https://[domain]/health
  ```
- [ ] Database connectivity confirmed
  ```bash
  curl https://[domain]/health/db
  ```
- [ ] Redis connectivity confirmed
  ```bash
  curl https://[domain]/health/redis
  ```
- [ ] Frontend loads correctly
  - Open https://[domain] in browser
  - Check console for errors
  - Verify login works

### Functional Checks (First 15 Minutes)
- [ ] User can log in
- [ ] Character data loads
- [ ] Combat initiates successfully
- [ ] Socket connections establish
- [ ] Marketplace loads
- [ ] Gang features work

### Monitoring Checks
- [ ] Error rate in Sentry is normal (<1%)
- [ ] Response times are normal (p95 <500ms)
- [ ] No unusual spikes in resource usage
- [ ] Job queues are processing normally
  ```bash
  # Check queue depths
  curl https://[domain]/api/admin/queues/stats
  ```

---

## Rollback Procedures

### When to Rollback
- Health checks failing after 5 minutes
- Error rate >5%
- Critical functionality broken
- Database corruption detected

### Quick Rollback (Same Images Available)
```bash
# Rollback to previous image
docker-compose -f docker-compose.prod.yml down backend
docker-compose -f docker-compose.prod.yml up -d backend --pull never
```

### Full Rollback (Previous Version)
```bash
# 1. Revert to previous git tag
git checkout v1.x.previous

# 2. Rebuild and deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 3. Restore database if migrations ran
mongorestore --uri="$MONGODB_URI" --drop /backups/mongodb/[backup-date]/
```

### Post-Rollback
- [ ] Notify team of rollback
- [ ] Create incident report
- [ ] Identify root cause
- [ ] Plan hotfix

---

## Deployment Schedule

### Recommended Windows
| Type | Best Time | Avoid |
|------|-----------|-------|
| Major Release | Tuesday-Thursday, 10am-2pm | Friday, Weekends |
| Hotfix | Anytime (urgent) | - |
| Database Migration | Tuesday-Wednesday, 6am | Peak hours |

### Peak Hours (Avoid Deployments)
- Friday 6pm - Sunday 10pm (Weekend gaming)
- Major events/tournaments

---

## Checklist Summary

### Before Deployment
```
[ ] Code passes all tests
[ ] CI/CD pipeline green
[ ] Database backed up
[ ] Team notified
[ ] Environment variables verified
```

### During Deployment
```
[ ] Maintenance mode (if needed)
[ ] Images pulled
[ ] Migrations run
[ ] Services deployed
[ ] Health checks pass
```

### After Deployment
```
[ ] Functional tests pass
[ ] Error rates normal
[ ] Performance normal
[ ] Queues processing
[ ] Team notified of success
```

---

## Emergency Contacts

| Role | Contact | When to Call |
|------|---------|--------------|
| Lead Developer | [Phone/Slack] | Critical bugs |
| DevOps | [Phone/Slack] | Infrastructure issues |
| DBA | [Phone/Slack] | Database problems |

---

*Last Updated: December 2024*
*Version: 1.0*
