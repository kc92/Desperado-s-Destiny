# DESPERADOS DESTINY - MONITORING & OBSERVABILITY PLAN
## Complete Metrics, Logs, Alerts, Dashboards

**Version:** 1.0
**Last Updated:** November 15, 2025
**Status:** Phase 0.75 - Foundation Planning

---

## OVERVIEW

This document defines the complete Monitoring and Observability strategy for Desperados Destiny, ensuring we can:

- **Detect issues** before players notice them
- **Debug problems** quickly with detailed logs
- **Measure performance** continuously
- **Alert on-call engineers** when critical issues occur
- **Track business metrics** (MAU, revenue, retention)

**Observability Stack:**
- **Metrics:** Prometheus + Grafana
- **Logs:** Loki + Grafana
- **Errors:** Sentry
- **Uptime:** UptimeRobot
- **Alerting:** PagerDuty + Slack

---

## TABLE OF CONTENTS

1. [Observability Principles](#observability-principles)
2. [Metrics Collection (Prometheus)](#metrics-collection-prometheus)
3. [Dashboards (Grafana)](#dashboards-grafana)
4. [Log Aggregation (Loki)](#log-aggregation-loki)
5. [Error Tracking (Sentry)](#error-tracking-sentry)
6. [Alerting Strategy](#alerting-strategy)
7. [Uptime Monitoring](#uptime-monitoring)
8. [Performance Monitoring (APM)](#performance-monitoring-apm)
9. [Business Metrics](#business-metrics)
10. [SLOs & SLIs](#slos--slis)
11. [On-Call Procedures](#on-call-procedures)

---

## OBSERVABILITY PRINCIPLES

### The Three Pillars

1. **Metrics** - Numerical time-series data (CPU, memory, request count)
2. **Logs** - Structured event records (errors, warnings, debug info)
3. **Traces** - Distributed request flows (for debugging complex issues)

### Key Metrics to Track

**System Health:**
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

**Application Performance:**
- Request rate (req/sec)
- Error rate (%)
- Response time (p50, p95, p99)
- Database query time

**Business Metrics:**
- Active players (CCU - Concurrent Users)
- New registrations
- Premium conversions
- Daily/Monthly Active Users (DAU/MAU)
- Revenue (MRR - Monthly Recurring Revenue)

---

## METRICS COLLECTION (PROMETHEUS)

### Prometheus Setup

**Install Prometheus:**
```bash
# Docker Compose
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
```

**Configuration (`prometheus.yml`):**
```yaml
global:
  scrape_interval: 15s  # Collect metrics every 15 seconds
  evaluation_interval: 15s

scrape_configs:
  # Scrape Node.js application metrics
  - job_name: 'desperados-api'
    static_configs:
      - targets: ['api:3000']

  # Scrape MongoDB metrics
  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

  # Scrape Redis metrics
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Scrape Node Exporter (system metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

---

### Application Metrics (Node.js)

**Install `prom-client`:**
```bash
npm install prom-client
```

**Instrument Application:**

```typescript
import { collectDefaultMetrics, Counter, Histogram, Gauge, register } from 'prom-client'
import express from 'express'

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ timeout: 5000 })

// Custom metrics

// Counter: Total HTTP requests
export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

// Histogram: Request duration
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]  // Response time buckets
})

// Gauge: Active WebSocket connections
export const activeWebSockets = new Gauge({
  name: 'active_websocket_connections',
  help: 'Number of active WebSocket connections'
})

// Counter: Total duels
export const duelsCounter = new Counter({
  name: 'duels_total',
  help: 'Total number of duels',
  labelNames: ['winner_faction', 'loser_faction']
})

// Counter: Energy spent
export const energySpentCounter = new Counter({
  name: 'energy_spent_total',
  help: 'Total energy spent by players',
  labelNames: ['action_type']
})

// Gauge: Active players (CCU)
export const activePlayersGauge = new Gauge({
  name: 'active_players',
  help: 'Number of currently active players'
})

// Expose metrics endpoint
const app = express()
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(register.metrics())
})
```

**Middleware to Track Requests:**

```typescript
app.use((req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000  // Convert to seconds

    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    })

    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    }, duration)
  })

  next()
})
```

**Track Custom Events:**

```typescript
// Track duel
async function performDuel(attacker, defender) {
  // ... duel logic ...

  // Record metric
  duelsCounter.inc({
    winner_faction: winner.faction,
    loser_faction: loser.faction
  })
}

// Track energy spent
async function spendEnergy(character, actionType, amount) {
  character.energy -= amount

  energySpentCounter.inc({ action_type: actionType }, amount)
}

// Update active players count (run every minute)
setInterval(async () => {
  const count = await getActivePlayerCount()
  activePlayersGauge.set(count)
}, 60000)
```

---

## DASHBOARDS (GRAFANA)

### Grafana Setup

**Install Grafana:**
```bash
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./dashboards:/etc/grafana/provisioning/dashboards
```

**Add Prometheus Data Source:**
```yaml
# provisioning/datasources/prometheus.yml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

---

### Dashboard 1: System Overview

**Panels:**

1. **Uptime**
   - Metric: `up{job="desperados-api"}`
   - Visualization: Stat (Green = 1, Red = 0)

2. **Request Rate**
   - Metric: `rate(http_requests_total[5m])`
   - Visualization: Graph
   - Y-axis: Requests per second

3. **Error Rate**
   - Metric: `rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])`
   - Visualization: Graph
   - Y-axis: Percentage

4. **Response Time (p95)**
   - Metric: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
   - Visualization: Graph
   - Y-axis: Seconds
   - Threshold: Red if >0.5s

5. **CPU Usage**
   - Metric: `rate(process_cpu_seconds_total[1m]) * 100`
   - Visualization: Gauge
   - Max: 100%

6. **Memory Usage**
   - Metric: `process_resident_memory_bytes`
   - Visualization: Graph
   - Y-axis: Bytes (formatted as MB/GB)

---

### Dashboard 2: Game Metrics

**Panels:**

1. **Active Players (CCU)**
   - Metric: `active_players`
   - Visualization: Graph + Stat
   - Shows current CCU and 24-hour trend

2. **New Registrations (Today)**
   - Metric: `increase(user_registrations_total[24h])`
   - Visualization: Stat

3. **Duels per Hour**
   - Metric: `rate(duels_total[1h]) * 3600`
   - Visualization: Graph
   - Breakdown by faction (stacked area chart)

4. **Energy Spent (by Action Type)**
   - Metric: `rate(energy_spent_total[1h]) * 3600`
   - Visualization: Pie chart
   - Breakdown by `action_type` label

5. **Premium Conversion Rate**
   - Metric: `premium_subscriptions_total / user_registrations_total`
   - Visualization: Stat (percentage)

6. **Average Session Duration**
   - Metric: `avg(session_duration_seconds)`
   - Visualization: Graph

---

### Dashboard 3: Database Performance

**Panels:**

1. **MongoDB Query Time (p95)**
   - Metric: `histogram_quantile(0.95, rate(mongodb_op_latencies_bucket[5m]))`
   - Visualization: Graph

2. **MongoDB Connections**
   - Metric: `mongodb_connections{state="current"}`
   - Visualization: Graph

3. **Redis Hit Rate**
   - Metric: `rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))`
   - Visualization: Gauge
   - Format: Percentage

4. **Database Operations per Second**
   - Metric: `rate(mongodb_op_counters_total[1m])`
   - Visualization: Graph
   - Breakdown by operation type (insert, query, update, delete)

---

### Dashboard 4: Business KPIs

**Panels:**

1. **Daily Active Users (DAU)**
   - Metric: Custom query from database
   - Visualization: Graph (7-day trend)

2. **Monthly Active Users (MAU)**
   - Metric: Custom query
   - Visualization: Stat

3. **Monthly Recurring Revenue (MRR)**
   - Metric: `sum(premium_subscription_value)`
   - Visualization: Graph + Stat
   - Format: Currency ($)

4. **Churn Rate**
   - Metric: `canceled_subscriptions_total / active_subscriptions_total`
   - Visualization: Graph
   - Format: Percentage

5. **Average Revenue Per User (ARPU)**
   - Metric: `total_revenue / active_users`
   - Visualization: Stat
   - Format: Currency

6. **Retention Cohorts**
   - Visualization: Heatmap
   - Shows % of users active N days after registration

---

## LOG AGGREGATION (LOKI)

### Loki Setup

**Install Grafana Loki:**
```bash
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki_data:/loki

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
```

**Loki Configuration (`loki-config.yml`):**
```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: true
  retention_period: 168h  # 7 days
```

---

### Structured Logging (Node.js)

**Install Winston + Loki Transport:**
```bash
npm install winston winston-loki
```

**Logger Configuration:**

```typescript
import winston from 'winston'
import LokiTransport from 'winston-loki'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'desperados-api' },
  transports: [
    // Console output (development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // Loki (production)
    new LokiTransport({
      host: 'http://loki:3100',
      labels: { app: 'desperados-api' },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err)
    })
  ]
})

export default logger
```

**Usage:**

```typescript
// Info logs
logger.info('User logged in', {
  userId: user._id,
  email: user.email,
  ipAddress: req.ip
})

// Warning logs
logger.warn('Suspicious activity detected', {
  userId: user._id,
  reason: 'Multiple failed login attempts',
  attempts: 5
})

// Error logs
logger.error('Database query failed', {
  error: err.message,
  stack: err.stack,
  query: 'findOne',
  collection: 'characters'
})

// Custom context
logger.info('Duel completed', {
  combatId: combat._id,
  winner: winner.name,
  loser: loser.name,
  duration: duelDuration
})
```

---

### Log Query Examples (Grafana)

**Find all errors in last hour:**
```logql
{app="desperados-api"} |= "level=error" | json | line_format "{{.timestamp}} {{.message}}"
```

**Find slow database queries:**
```logql
{app="desperados-api"} | json | duration > 1s
```

**Find failed login attempts by IP:**
```logql
{app="desperados-api"} |= "failed login" | json | line_format "{{.ipAddress}} - {{.message}}"
```

---

## ERROR TRACKING (SENTRY)

### Sentry Setup

**Install Sentry SDK:**
```bash
npm install @sentry/node @sentry/tracing
```

**Initialize Sentry:**

```typescript
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,  // Sample 10% of transactions
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app })
  ]
})

// Request handler (must be first middleware)
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())

// ... routes ...

// Error handler (must be last middleware)
app.use(Sentry.Handlers.errorHandler())
```

**Capture Custom Errors:**

```typescript
try {
  await performDuel(attacker, defender)
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      action: 'duel',
      attackerId: attacker._id,
      defenderId: defender._id
    },
    user: {
      id: attacker.userId,
      email: attacker.email
    }
  })

  throw error
}
```

---

## ALERTING STRATEGY

### Alert Severity Levels

| Severity | Response Time | Notification | Example |
|----------|---------------|--------------|---------|
| **P0 - Critical** | Immediate | PagerDuty (phone call) | API down, database crash |
| **P1 - High** | <15 min | PagerDuty (SMS) | Error rate >5%, slow responses |
| **P2 - Medium** | <1 hour | Slack | Error rate >1%, disk space low |
| **P3 - Low** | <4 hours | Slack | Minor warnings, info |

### Prometheus Alert Rules

**`alerts.yml`:**

```yaml
groups:
  - name: critical_alerts
    interval: 1m
    rules:
      # P0: API Down
      - alert: APIDown
        expr: up{job="desperados-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "API is down"
          description: "The Desperados API has been unreachable for 1 minute"

      # P0: High Error Rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate (>5%)"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # P1: Slow Response Time
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: high
        annotations:
          summary: "Slow response time (p95 >1s)"
          description: "p95 response time is {{ $value }}s"

      # P1: Database Down
      - alert: MongoDBDown
        expr: up{job="mongodb"} == 0
        for: 1m
        labels:
          severity: high
        annotations:
          summary: "MongoDB is down"

      # P2: High Memory Usage
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes > 2e9  # 2GB
        for: 10m
        labels:
          severity: medium
        annotations:
          summary: "High memory usage (>2GB)"
          description: "Memory usage is {{ $value | humanize }}B"

      # P2: Disk Space Low
      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes < 0.1
        for: 5m
        labels:
          severity: medium
        annotations:
          summary: "Disk space low (<10% free)"

      # P3: High Active Connections
      - alert: HighActiveConnections
        expr: active_websocket_connections > 10000
        for: 5m
        labels:
          severity: low
        annotations:
          summary: "High WebSocket connection count (>10k)"
```

### Alertmanager Configuration

**`alertmanager.yml`:**

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: 'default'
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

  routes:
    # Critical alerts → PagerDuty
    - match:
        severity: critical
      receiver: pagerduty
      continue: true

    # High alerts → Slack
    - match:
        severity: high
      receiver: slack

    # Medium/Low alerts → Slack (non-urgent channel)
    - match:
        severity: medium
      receiver: slack-ops

receivers:
  - name: 'default'
    slack_configs:
      - api_url: '{{ SLACK_WEBHOOK_URL }}'
        channel: '#alerts'

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '{{ PAGERDUTY_SERVICE_KEY }}'
        description: '{{ .GroupLabels.alertname }}'

  - name: 'slack'
    slack_configs:
      - api_url: '{{ SLACK_WEBHOOK_URL }}'
        channel: '#alerts-high'
        title: '[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}'
        text: '{{ .Annotations.description }}'

  - name: 'slack-ops'
    slack_configs:
      - api_url: '{{ SLACK_WEBHOOK_URL }}'
        channel: '#ops'
```

---

## UPTIME MONITORING

### UptimeRobot Setup

**Monitor Endpoints:**

| Endpoint | Check Interval | Alert After | Method |
|----------|----------------|-------------|--------|
| https://desperados-destiny.com | 1 minute | 2 failures | GET |
| https://api.desperados-destiny.com/health | 1 minute | 2 failures | GET |
| https://desperados-destiny.com/login | 5 minutes | 2 failures | GET |

**Alert Contacts:**
- Email: ops@desperados-destiny.com
- Slack webhook
- PagerDuty (for critical endpoints)

**Status Page:**
- Public status page: status.desperados-destiny.com
- Shows uptime %, incident history

---

## PERFORMANCE MONITORING (APM)

### Node.js Performance Monitoring

**Install New Relic APM:**
```bash
npm install newrelic
```

**Configuration (`newrelic.js`):**
```javascript
exports.config = {
  app_name: ['Desperados Destiny'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization'
    ]
  }
}
```

**Track Custom Transactions:**
```typescript
const newrelic = require('newrelic')

async function performDuel(attacker, defender) {
  return newrelic.startBackgroundTransaction('duel', async () => {
    // ... duel logic ...
    return result
  })
}
```

---

## BUSINESS METRICS

### Custom Metrics Collection

**Track Business Events:**

```typescript
// User registration
await trackEvent('user_registered', {
  userId: user._id,
  email: user.email,
  timestamp: new Date()
})

// Premium subscription
await trackEvent('subscription_created', {
  userId: user._id,
  plan: 'premium',
  revenue: 10.00,
  timestamp: new Date()
})

// First duel
await trackEvent('first_duel', {
  userId: user._id,
  characterId: character._id,
  timestamp: new Date()
})
```

**Analytics Dashboard (Internal):**

- **DAU/MAU** - Daily/Monthly Active Users
- **Retention Cohorts** - % of users active after N days
- **ARPU** - Average Revenue Per User
- **LTV** - Lifetime Value (projected)
- **Churn Rate** - % of subscriptions canceled
- **Conversion Funnel** - Registration → Character Creation → First Duel → Premium

---

## SLOs & SLIs

### Service Level Objectives

**Availability SLO:**
- **Target:** 99.5% uptime
- **Measurement Window:** 30 days
- **Error Budget:** 3.6 hours of downtime per month

**Performance SLO:**
- **Target:** 95% of requests complete in <500ms (p95)
- **Measurement Window:** 7 days

**Error Rate SLO:**
- **Target:** <1% error rate
- **Measurement Window:** 24 hours

### Service Level Indicators (SLIs)

```promql
# Availability SLI
sum(up{job="desperados-api"}) / count(up{job="desperados-api"})

# Performance SLI
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error Rate SLI
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])
```

### Error Budget Tracking

```typescript
// Calculate remaining error budget
const uptimeTarget = 0.995  // 99.5%
const measurementWindow = 30 * 24 * 60 * 60 * 1000  // 30 days in ms
const allowedDowntime = measurementWindow * (1 - uptimeTarget)

const actualDowntime = await calculateDowntime(30)  // Last 30 days
const remainingBudget = allowedDowntime - actualDowntime

console.log(`Error budget remaining: ${remainingBudget / (60 * 60 * 1000)} hours`)
```

---

## ON-CALL PROCEDURES

### On-Call Rotation

**Schedule:**
- Primary on-call: 7-day rotation
- Secondary on-call: Backup
- Escalation: CTO after 30 minutes

**On-Call Tool:** PagerDuty

### Incident Response Playbook

**When Paged:**

1. **Acknowledge** within 5 minutes
2. **Assess Severity**
   - P0: All hands on deck
   - P1: Notify team lead
   - P2: Handle solo, update team
3. **Mitigate** - Stop the bleeding (rollback, restart, etc.)
4. **Communicate** - Update status page, notify users if needed
5. **Resolve** - Fix root cause
6. **Post-Mortem** - Document what happened and how to prevent

**Common Issues & Fixes:**

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| API Down | `curl https://api.desperados-destiny.com/health` fails | Restart server: `pm2 restart all` |
| High Error Rate | Check Sentry for error spike | Rollback last deployment |
| Slow Responses | Check Grafana dashboard | Scale up servers or optimize queries |
| Database Down | MongoDB connection timeout | Check MongoDB status, restart if needed |
| Disk Full | `df -h` shows 100% | Delete old logs: `journalctl --vacuum-time=7d` |

---

## CONCLUSION

This Monitoring & Observability Plan provides **complete visibility** into:

1. **System Health** - CPU, memory, disk, network
2. **Application Performance** - Request rate, errors, response time
3. **Business Metrics** - DAU, revenue, retention
4. **Debugging** - Structured logs, error tracking, distributed tracing
5. **Alerting** - Proactive notification before users complain

**No more flying blind. Every metric tracked, every error caught, every issue alerted.**

---

**Document Status:** ✅ Complete
**Observability Stack:** Prometheus + Grafana + Loki + Sentry
**Uptime Target:** 99.5%
**Next Phase:** Business Model & Monetization Document

*— Ezra "Hawk" Hawthorne*
*Observability Architect*
*November 15, 2025*
