# Desperados Destiny - Admin & Moderator Handbook

## Table of Contents
1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [User Management](#user-management)
3. [Economy Monitoring](#economy-monitoring)
4. [Queue Management](#queue-management)
5. [Audit Log Interpretation](#audit-log-interpretation)
6. [Emergency Procedures](#emergency-procedures)
7. [Monitoring & Alerts](#monitoring--alerts)

---

## Admin Dashboard Overview

### Accessing the Admin Panel
- URL: `https://[domain]/admin`
- Required role: `admin` or `moderator`
- Authentication: Same as player login, role-checked on backend

### Admin Roles
| Role | Permissions |
|------|-------------|
| **admin** | Full access: user management, economy, queues, system config |
| **moderator** | Limited: user warnings, chat moderation, player support |
| **support** | Read-only: view logs, player data, no modifications |

---

## User Management

### Finding a Player
```bash
# Via MongoDB (server terminal)
mongosh desperados-destiny
db.users.findOne({ username: "playername" })
db.characters.findOne({ userId: ObjectId("...") })
```

### Banning a Player
**Via Admin API:**
```bash
POST /api/admin/users/:userId/ban
{
  "reason": "Exploit abuse - duplicated gold",
  "duration": 7,  // days, 0 = permanent
  "banType": "account"  // or "character"
}
```

**What happens:**
- Player immediately disconnected
- Login blocked with ban message
- All active sessions invalidated
- Ban logged in audit trail

### Unbanning a Player
```bash
POST /api/admin/users/:userId/unban
{
  "reason": "Appeal approved - first offense"
}
```

### Character Reset/Modification
```bash
# Reset character to level 1
POST /api/admin/characters/:characterId/reset
{
  "resetType": "full",  // or "skills", "inventory", "currency"
  "reason": "Player request - fresh start"
}

# Modify character stats (use sparingly!)
PATCH /api/admin/characters/:characterId
{
  "dollars": 1000,
  "gold": 50,
  "level": 10
}
```

### Warning System
```bash
# Issue warning (tracked, visible to player)
POST /api/admin/users/:userId/warn
{
  "reason": "Inappropriate chat behavior",
  "severity": 1  // 1-3, 3 = final warning before ban
}
```

---

## Economy Monitoring

### Key Metrics to Watch
| Metric | Healthy Range | Alert Threshold |
|--------|---------------|-----------------|
| Total Dollars in circulation | - | +20% week-over-week |
| Average player wealth | 5K-50K | >500K average |
| Daily dollar sink | >40% of faucet | <30% (inflation risk) |
| Marketplace volume | - | -50% from baseline |

### Checking Economy Health
```bash
# Get economy snapshot
GET /api/admin/economy/snapshot

# Response includes:
{
  "totalDollarsCirculating": 15234567,
  "totalGoldCirculating": 45678,
  "averagePlayerWealth": 12500,
  "medianPlayerWealth": 8000,
  "dollarsCreatedToday": 500000,
  "dollarsSunkToday": 350000,
  "inflationRate": 0.03,
  "topWealthyPlayers": [...]
}
```

### Gold/Dollar Adjustment (Emergency Only)
```bash
# Add currency (compensation, events)
POST /api/admin/economy/inject
{
  "targetType": "all",  // or "character", "gang"
  "targetId": null,
  "currencyType": "dollars",
  "amount": 1000,
  "reason": "Server outage compensation"
}

# Remove currency (exploit recovery)
POST /api/admin/economy/drain
{
  "targetType": "character",
  "targetId": "characterId",
  "currencyType": "dollars",
  "amount": 50000,
  "reason": "Exploit recovery - gold dupe bug"
}
```

### Price Manipulation Detection
Signs of market manipulation:
- Single player owns >50% of an item type
- Price spike >300% in 24 hours
- Coordinated buying from multiple accounts
- Wash trading (self-trades via alts)

```bash
# Get suspicious transactions
GET /api/admin/economy/suspicious?period=24h

# Check player trade history
GET /api/admin/players/:playerId/trades?period=7d
```

---

## Queue Management

### Bull Queue Dashboard
Access via: `https://[domain]/admin/queues` (Bull Board UI)

### Queue Types
| Queue | Purpose | Typical Volume |
|-------|---------|---------------|
| `combat` | Combat resolution, turn timeouts | 100-500/min |
| `economy` | Price updates, market events | 60/hour |
| `marketplace` | Auction processing, listings | 10-50/min |
| `notifications` | Push notifications, emails | 50-200/min |
| `events` | World event spawning | 10-30/hour |
| `decay` | Property/claim decay processing | 1/day |

### Common Issues

**Queue Backing Up:**
```bash
# Check queue stats
GET /api/admin/queues/stats

# If >1000 waiting jobs in any queue:
1. Check Redis memory (should be <80%)
2. Check worker health (may need restart)
3. Check for stuck jobs (failed repeatedly)
```

**Stuck/Failed Jobs:**
```bash
# Get failed jobs
GET /api/admin/queues/:queueName/failed?limit=100

# Retry all failed jobs
POST /api/admin/queues/:queueName/retry-all

# Clear failed jobs (after investigation)
DELETE /api/admin/queues/:queueName/failed
```

**Emergency Queue Clear:**
```bash
# CAUTION: Only if queue is corrupted
POST /api/admin/queues/:queueName/drain
```

### Redis Monitoring
```bash
# Connect to Redis CLI
redis-cli -a $REDIS_PASSWORD

# Check memory
INFO memory

# Check key count
DBSIZE

# Find large keys (if memory high)
redis-cli --bigkeys
```

---

## Audit Log Interpretation

### Log Locations
| Log Type | Location | Retention |
|----------|----------|-----------|
| Application | `/app/logs/app.log` | 30 days |
| Access | `/app/logs/access.log` | 90 days |
| Admin Actions | MongoDB `auditLogs` collection | Permanent |
| Economy | MongoDB `economyLogs` collection | 1 year |

### Reading Audit Logs
```bash
# Get recent admin actions
GET /api/admin/audit?period=24h

# Filter by action type
GET /api/admin/audit?action=ban&period=7d

# Filter by admin
GET /api/admin/audit?adminId=xxx&period=30d
```

### Audit Log Entry Format
```json
{
  "_id": "ObjectId",
  "timestamp": "2024-12-23T10:30:00Z",
  "adminId": "ObjectId",
  "adminUsername": "admin_user",
  "action": "USER_BAN",
  "targetType": "user",
  "targetId": "ObjectId",
  "details": {
    "reason": "Exploit abuse",
    "duration": 7,
    "previousState": { "isBanned": false }
  },
  "ipAddress": "192.168.1.1"
}
```

### Important Actions to Monitor
- `USER_BAN`, `USER_UNBAN` - Player discipline
- `ECONOMY_INJECT`, `ECONOMY_DRAIN` - Currency changes
- `CHARACTER_MODIFY` - Stat changes
- `QUEUE_CLEAR`, `QUEUE_RETRY` - Queue operations
- `CONFIG_CHANGE` - System configuration

---

## Emergency Procedures

### Maintenance Mode
Blocks new logins, shows maintenance message, keeps existing sessions.

```bash
# Enable maintenance mode
POST /api/admin/system/maintenance
{
  "enabled": true,
  "message": "Scheduled maintenance - back in 30 minutes",
  "allowAdmins": true
}

# Disable
POST /api/admin/system/maintenance
{
  "enabled": false
}
```

### Emergency Server Restart
```bash
# Via Docker
docker-compose -f docker-compose.prod.yml restart backend

# Via PM2 (if not Docker)
pm2 restart desperados-backend

# Graceful shutdown (waits for active requests)
kill -SIGTERM $(pgrep -f "node.*server")
```

### Database Rollback
**Prerequisite:** Backups must exist

```bash
# 1. Enable maintenance mode first!

# 2. Identify backup to restore
ls /backups/mongodb/

# 3. Stop backend
docker-compose -f docker-compose.prod.yml stop backend

# 4. Restore MongoDB
mongorestore --uri="$MONGODB_URI" --drop /backups/mongodb/2024-12-23/

# 5. Restart backend
docker-compose -f docker-compose.prod.yml start backend

# 6. Disable maintenance mode
```

### Exploit Discovered - Immediate Actions
1. **Assess severity** - Is it active? How many affected?
2. **Enable maintenance mode** if exploit is severe
3. **Identify affected players** via logs
4. **Hotfix if possible** without restart
5. **Document everything** in incident report
6. **Notify affected players** with compensation plan

### DDoS/High Load
```bash
# Check current connections
netstat -an | grep :5001 | wc -l

# Rate limit adjustment (nginx)
# Edit /etc/nginx/conf.d/rate-limit.conf
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Reload nginx
nginx -s reload
```

---

## Monitoring & Alerts

### Health Endpoints
| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/health` | Basic server health | `200 OK` |
| `/health/db` | Database connectivity | `200 OK` with latency |
| `/health/redis` | Redis connectivity | `200 OK` with latency |
| `/health/full` | Complete system check | JSON with all services |

### Key Metrics to Monitor
- **Response Time**: p95 < 500ms, p99 < 1000ms
- **Error Rate**: < 1% of requests
- **Database Connections**: < 80% of pool
- **Redis Memory**: < 80% of limit
- **CPU Usage**: < 70% average
- **Memory Usage**: < 80% of limit

### Setting Up Alerts (Example: Sentry)
```javascript
// Already integrated - check Sentry dashboard
// Alerts configured for:
// - Error rate spike
// - Slow transactions
// - Unhandled exceptions
```

### Log Aggregation
```bash
# View live logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Search logs for errors
docker-compose -f docker-compose.prod.yml logs backend | grep ERROR

# Export logs for analysis
docker-compose -f docker-compose.prod.yml logs backend > /tmp/backend-logs.txt
```

---

## Quick Reference

### Common Commands
```bash
# Check server status
docker-compose -f docker-compose.prod.yml ps

# View backend logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100 backend

# Restart single service
docker-compose -f docker-compose.prod.yml restart backend

# Check resource usage
docker stats

# MongoDB shell access
docker exec -it desperados-mongodb-prod mongosh

# Redis CLI access
docker exec -it desperados-redis-prod redis-cli -a $REDIS_PASSWORD
```

### Emergency Contacts
- **Lead Developer**: [Contact info]
- **DevOps/Infrastructure**: [Contact info]
- **Community Manager**: [Contact info]

---

*Last Updated: December 2024*
*Version: 1.0*
