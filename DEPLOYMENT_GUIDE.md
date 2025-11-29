# Desperados Destiny - Deployment Guide
## Sprint 5 Social Features

**Version:** 1.0.0
**Last Updated:** 2025-11-16
**Status:** ⚠️ Infrastructure Setup Required

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [MongoDB Configuration](#mongodb-configuration)
4. [Redis Configuration](#redis-configuration)
5. [Application Deployment](#application-deployment)
6. [CRON Jobs](#cron-jobs)
7. [Health Checks](#health-checks)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Server:**
- Node.js 18+ LTS
- MongoDB 6.0+ (with replica set)
- Redis 7+
- 4GB RAM minimum (8GB recommended)
- 20GB disk space

**Network:**
- Port 5000 (API server)
- Port 5173 (Client dev server)
- Port 27017 (MongoDB)
- Port 6379 (Redis)

### Required Tools
```bash
node --version  # v18.x.x or higher
npm --version   # 9.x.x or higher
docker --version  # 24.x.x or higher (recommended)
docker-compose --version  # 2.x.x or higher (recommended)
```

---

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd desperados-destiny
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### 3. Create Environment Files

**Server `.env`:**
```env
# Environment
NODE_ENV=production

# Server
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# Database
MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/desperados-destiny?replicaSet=rs0
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password  # Optional

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=30d
SESSION_SECRET=your-session-secret-key
SESSION_MAX_AGE=86400000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Game Configuration
MAX_PLAYERS_PER_LOBBY=100
GAME_TICK_RATE=30
```

**Client `.env`:**
```env
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com
VITE_ENV=production
```

---

## MongoDB Configuration

### ⚠️ CRITICAL: Replica Set Required

Sprint 5 uses MongoDB transactions for:
- Gang bank operations
- Mail gold attachments
- Territory war contributions
- Gold transfers

**Transactions require a replica set. Standalone MongoDB will not work.**

### Option 1: Docker Compose (Recommended for Development)

**`docker-compose.yml`:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: desperados-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=desperados-destiny
    command: ["--replSet", "rs0", "--bind_ip_all"]
    volumes:
      - mongodb_data:/data/db
    networks:
      - desperados-network

  mongodb-init:
    image: mongo:7
    depends_on:
      - mongodb
    restart: "no"
    entrypoint: >
      mongosh --host mongodb:27017 --eval "
      rs.initiate({
        _id: 'rs0',
        members: [
          { _id: 0, host: 'mongodb:27017' }
        ]
      })
      "
    networks:
      - desperados-network

  redis:
    image: redis:7-alpine
    container_name: desperados-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --requirepass your-redis-password
    volumes:
      - redis_data:/data
    networks:
      - desperados-network

volumes:
  mongodb_data:
  redis_data:

networks:
  desperados-network:
    driver: bridge
```

**Start Services:**
```bash
docker-compose up -d
```

### Option 2: Manual MongoDB Replica Set Setup

**1. Create directories:**
```bash
mkdir -p /data/mongodb/rs0
```

**2. Start MongoDB with replica set:**
```bash
mongod --replSet rs0 --port 27017 --dbpath /data/mongodb/rs0 --bind_ip 0.0.0.0
```

**3. Initialize replica set:**
```bash
mongosh --eval "rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'localhost:27017' }
  ]
})"
```

**4. Verify replica set:**
```bash
mongosh --eval "rs.status()"
```

You should see `"stateStr" : "PRIMARY"`.

### Option 3: MongoDB Atlas (Recommended for Production)

1. Create cluster at https://cloud.mongodb.com
2. Enable replica set (enabled by default)
3. Add IP whitelist
4. Create database user
5. Get connection string:
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/desperados-destiny?retryWrites=true&w=majority
```

### Database Indexes

**Create required indexes:**
```javascript
// Run this in mongosh or through migration script
use desperados-destiny;

// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

// Character indexes
db.characters.createIndex({ userId: 1 });
db.characters.createIndex({ name: 1 }, { unique: true });
db.characters.createIndex({ faction: 1 });

// Gang indexes
db.gangs.createIndex({ name: 1 }, { unique: true });
db.gangs.createIndex({ "members.characterId": 1 });

// Territory indexes
db.territories.createIndex({ name: 1 }, { unique: true });
db.territories.createIndex({ ownerGangId: 1 });

// War indexes
db.gangwars.createIndex({ status: 1 });
db.gangwars.createIndex({ territoryId: 1 });
db.gangwars.createIndex({ endTime: 1 });

// Mail indexes
db.mails.createIndex({ recipientId: 1, recipientDeleted: 1 });
db.mails.createIndex({ senderId: 1, senderDeleted: 1 });
db.mails.createIndex({ createdAt: -1 });

// Friend indexes
db.friends.createIndex({ userId: 1, friendId: 1 }, { unique: true });
db.friends.createIndex({ status: 1 });

// Notification indexes
db.notifications.createIndex({ characterId: 1, isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });

// Message indexes (Chat)
db.messages.createIndex({ roomType: 1, roomId: 1, timestamp: -1 });
db.messages.createIndex({ senderId: 1 });
```

---

## Redis Configuration

### Option 1: Docker (Recommended)

Already included in `docker-compose.yml` above.

### Option 2: Manual Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Configure password:**
```bash
sudo nano /etc/redis/redis.conf
# Add or uncomment:
requirepass your-redis-password

sudo systemctl restart redis-server
```

**Test connection:**
```bash
redis-cli
AUTH your-redis-password
PING  # Should return PONG
```

### Redis Configuration for Production

**`/etc/redis/redis.conf`:**
```conf
# Bind to localhost only (if on same server)
bind 127.0.0.1

# Set password
requirepass your-redis-password

# Enable persistence
save 900 1
save 300 10
save 60 10000

# AOF persistence
appendonly yes
appendfsync everysec

# Max memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
```

---

## Application Deployment

### 1. Build Applications

**Build Server:**
```bash
cd server
npm run build
```

This creates `server/dist/` directory.

**Build Client:**
```bash
cd client
npm run build
```

This creates `client/dist/` directory.

### 2. Seed Database

**Seed territories (required for Sprint 5):**
```bash
cd server
npm run seed:territories
```

This creates 12 territories:
- El Paso
- Tombstone
- Santa Fe
- Deadwood
- Dodge City
- Abilene
- Wichita
- Laredo
- Fort Worth
- San Antonio
- Tucson
- Phoenix

### 3. Start Server

**Development:**
```bash
cd server
npm run dev
```

**Production (with PM2):**
```bash
# Install PM2
npm install -g pm2

# Start server
cd server
pm2 start dist/server.js --name desperados-api

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**Production (with systemd):**

Create `/etc/systemd/system/desperados-api.service`:
```ini
[Unit]
Description=Desperados Destiny API Server
After=network.target mongodb.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/desperados-destiny/server
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Start service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable desperados-api
sudo systemctl start desperados-api
sudo systemctl status desperados-api
```

### 4. Start Client

**Development:**
```bash
cd client
npm run dev
```

**Production (with nginx):**

**`/etc/nginx/sites-available/desperados`:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Client static files
    root /var/www/desperados-destiny/client/dist;
    index index.html;

    # Client routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io (WebSocket)
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/desperados /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## CRON Jobs

### War Resolution Job

Sprint 5 includes a CRON job that resolves territory wars every hour.

**With PM2:**
```bash
cd server
pm2 start src/jobs/warResolution.ts --name desperados-cron --cron-restart="0 * * * *"
```

**With systemd timer:**

Create `/etc/systemd/system/desperados-war-resolution.service`:
```ini
[Unit]
Description=Desperados War Resolution
After=network.target mongodb.service

[Service]
Type=oneshot
User=www-data
WorkingDirectory=/var/www/desperados-destiny/server
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node -r ts-node/register src/jobs/warResolution.ts
```

Create `/etc/systemd/system/desperados-war-resolution.timer`:
```ini
[Unit]
Description=Run Desperados War Resolution every hour

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
```

**Enable timer:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable desperados-war-resolution.timer
sudo systemctl start desperados-war-resolution.timer
sudo systemctl list-timers
```

---

## Health Checks

### API Health Endpoint

**Check server health:**
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-16T20:00:00.000Z",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "connected",
      "latency": 5
    },
    "redis": {
      "status": "connected",
      "latency": 2
    }
  },
  "version": "1.0.0",
  "environment": "production"
}
```

### Database Health

**Check MongoDB:**
```bash
mongosh --eval "db.adminCommand('ping')"
```

**Check Redis:**
```bash
redis-cli -a your-redis-password PING
```

### Socket.io Health

**Check WebSocket connection:**
```javascript
// In browser console
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (err) => console.error('Error:', err));
```

---

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs desperados-api

# Monitor resources
pm2 monit

# View process info
pm2 info desperados-api

# Restart on high memory
pm2 start desperados-api --max-memory-restart 500M
```

### Log Files

**Server logs:**
```bash
# PM2 logs
tail -f ~/.pm2/logs/desperados-api-out.log
tail -f ~/.pm2/logs/desperados-api-error.log

# Systemd logs
sudo journalctl -u desperados-api -f

# Application logs (if file logging enabled)
tail -f /var/log/desperados/app.log
```

**MongoDB logs:**
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

**Redis logs:**
```bash
sudo tail -f /var/log/redis/redis-server.log
```

**Nginx logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Recommended Monitoring Tools

1. **Application Performance Monitoring (APM):**
   - New Relic
   - DataDog
   - Elastic APM

2. **Error Tracking:**
   - Sentry
   - Rollbar
   - Bugsnag

3. **Log Aggregation:**
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Grafana Loki
   - Splunk

4. **Uptime Monitoring:**
   - UptimeRobot
   - Pingdom
   - StatusCake

---

## Troubleshooting

### MongoDB Transaction Errors

**Error:** `Transaction numbers are only allowed on a replica set member`

**Solution:**
1. Verify replica set:
```bash
mongosh --eval "rs.status()"
```

2. If not initialized, initialize:
```bash
mongosh --eval "rs.initiate()"
```

3. Update connection string to include `?replicaSet=rs0`

### Redis Connection Errors

**Error:** `Redis client is not connected`

**Solution:**
1. Verify Redis is running:
```bash
redis-cli ping
```

2. Check connection details in `.env`
3. Test connection:
```bash
redis-cli -h localhost -p 6379 -a your-password ping
```

### Socket.io Connection Errors

**Error:** `WebSocket connection failed`

**Solution:**
1. Check nginx WebSocket configuration
2. Verify CORS settings in server config
3. Check firewall rules for WebSocket port
4. Ensure `/socket.io` path is proxied correctly

### High Memory Usage

**Solution:**
1. Check for memory leaks:
```bash
pm2 monit
```

2. Restart with memory limit:
```bash
pm2 restart desperados-api --max-memory-restart 500M
```

3. Increase server resources
4. Check for unbounded arrays/collections

### Database Performance Issues

**Solution:**
1. Check slow queries:
```javascript
db.setProfilingLevel(1, 100); // Log queries > 100ms
db.system.profile.find().sort({ts:-1}).limit(5);
```

2. Verify indexes:
```javascript
db.collection.getIndexes();
```

3. Analyze query performance:
```javascript
db.collection.find({}).explain("executionStats");
```

---

## Security Checklist

- [ ] Change all default secrets in `.env`
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Configure firewall (ufw/iptables)
- [ ] Set MongoDB authentication
- [ ] Set Redis password
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Keep dependencies updated
- [ ] Regular security audits
- [ ] Backup database regularly

---

## Backup & Recovery

### MongoDB Backup

**Manual backup:**
```bash
mongodump --uri="mongodb://localhost:27017/desperados-destiny" --out=/backup/mongo/$(date +%Y%m%d)
```

**Automated backup script:**
```bash
#!/bin/bash
# /usr/local/bin/mongo-backup.sh

BACKUP_DIR="/backup/mongo"
DATE=$(date +%Y%m%d_%H%M%S)
MONGO_URI="mongodb://localhost:27017/desperados-destiny"

mkdir -p $BACKUP_DIR
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

**Add to cron:**
```bash
0 2 * * * /usr/local/bin/mongo-backup.sh
```

### Redis Backup

**Redis automatically saves snapshots (if configured).**

**Manual backup:**
```bash
redis-cli -a your-password BGSAVE
cp /var/lib/redis/dump.rdb /backup/redis/dump-$(date +%Y%m%d).rdb
```

### Restore from Backup

**MongoDB:**
```bash
mongorestore --uri="mongodb://localhost:27017" --drop /backup/mongo/20251116
```

**Redis:**
```bash
sudo systemctl stop redis
sudo cp /backup/redis/dump-20251116.rdb /var/lib/redis/dump.rdb
sudo systemctl start redis
```

---

## Support & Maintenance

**Log Rotation:**
```bash
# Create /etc/logrotate.d/desperados
/var/log/desperados/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

**Update Dependencies:**
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

**Database Maintenance:**
```javascript
// Compact database (reduces size)
db.runCommand({ compact: 'collection-name' });

// Rebuild indexes
db.collection.reIndex();

// Check database stats
db.stats();
```

---

## Additional Resources

- [MongoDB Replica Set Documentation](https://docs.mongodb.com/manual/replication/)
- [Redis Configuration Guide](https://redis.io/docs/management/config/)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [PM2 Process Manager](https://pm2.keymetrics.io/docs/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**Deployment Guide Version:** 1.0.0
**Last Updated:** 2025-11-16
**Maintained By:** Agent 7
