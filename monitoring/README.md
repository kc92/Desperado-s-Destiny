# Desperados Destiny - Monitoring Stack

**CRITICAL**: This monitoring stack is **REQUIRED** for production deployments. Without it, you will have ZERO visibility into production errors, performance issues, and system health.

## Overview

This directory contains the complete monitoring infrastructure for Desperados Destiny:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization dashboards and alerting
- **Loki**: Log aggregation and querying
- **Node Exporter**: System-level metrics (CPU, memory, disk, network)

## Quick Start

### Development

```bash
# Start the monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# View logs
docker-compose -f docker-compose.monitoring.yml logs -f

# Stop the stack
docker-compose -f docker-compose.monitoring.yml down
```

### Production

```bash
# Start with production configuration
docker-compose -f docker-compose.monitoring.yml up -d

# Check status
docker-compose -f docker-compose.monitoring.yml ps
```

## Access URLs

Once the stack is running, you can access:

- **Grafana**: http://localhost:3001
  - Default credentials: `admin` / `admin`
  - **IMPORTANT**: Change this password immediately in production!

- **Prometheus**: http://localhost:9090
  - Query metrics directly
  - View alert rules and targets

- **Loki**: http://localhost:3100
  - API endpoint for log queries
  - Access via Grafana datasource

## Configuration Files

### Prometheus (`prometheus/`)

- `prometheus.yml` - Main Prometheus configuration
  - **ACTION REQUIRED**: Update `host.docker.internal:5001` to your production server address
  - Scrape interval: 15 seconds
  - Retention: 30 days

- `rules.yml` - Alert rules
  - Critical: Error rate > 1%, Service down, High memory/CPU
  - Warning: Slow responses, Low disk space
  - Business: Transaction failures, No active players

### Grafana (`grafana/`)

- `provisioning/datasources/datasources.yml` - Auto-configures Prometheus and Loki
- `provisioning/dashboards/dashboards.yml` - Auto-loads dashboards
- `dashboards/` - Place custom Grafana dashboard JSONs here

### Loki (`loki/`)

- `loki-config.yml` - Log aggregation configuration
  - Retention: 30 days
  - Storage: Filesystem-based

## Connecting to Your Application

### 1. Ensure Metrics Endpoint is Running

Your application must expose metrics at `/metrics`:

```bash
curl http://localhost:5001/metrics
```

You should see Prometheus-formatted metrics.

### 2. Update Prometheus Target

In `prometheus/prometheus.yml`, update the target:

```yaml
scrape_configs:
  - job_name: 'desperados-server'
    static_configs:
      - targets:
          # Development
          - 'host.docker.internal:5001'

          # Production (same Docker network)
          # - 'server:5001'

          # Production (external server)
          # - 'your-server.com:5001'
```

### 3. Configure Winston to Send Logs to Loki (Optional)

Install Winston Loki transport:

```bash
npm install winston-loki
```

Update `server/src/utils/logger.ts`:

```typescript
import LokiTransport from 'winston-loki';

const transports: winston.transport[] = [
  // ... existing transports
];

if (config.isProduction) {
  transports.push(
    new LokiTransport({
      host: 'http://localhost:3100',
      labels: { app: 'desperados-destiny' },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error('Loki connection error:', err),
    })
  );
}
```

## Production Deployment Checklist

### Before Going Live

- [ ] Change Grafana admin password (default: admin/admin)
- [ ] Update Prometheus scrape target to production server
- [ ] Configure alert notification channels (Discord, email, PagerDuty)
- [ ] Test all alert rules trigger correctly
- [ ] Verify metrics are being scraped (check Prometheus targets page)
- [ ] Import or create custom Grafana dashboards
- [ ] Set up Grafana user accounts with appropriate permissions
- [ ] Enable HTTPS for Grafana (use reverse proxy like Nginx)
- [ ] Configure data retention policies for your needs
- [ ] Set up automated backups for Grafana dashboards and Prometheus data

### Alert Notification Setup

1. **Grafana Alerting** (Recommended):
   - Go to Grafana → Alerting → Contact points
   - Add Discord webhook, email, or PagerDuty
   - Create notification policies

2. **Prometheus Alertmanager** (Advanced):
   - Deploy Alertmanager container
   - Configure `alerting` section in `prometheus.yml`
   - Set up routing and receivers

## Viewing Metrics and Logs

### Grafana Dashboards

1. Log in to Grafana (http://localhost:3001)
2. Navigate to Dashboards
3. Pre-configured dashboards will appear automatically

### Prometheus Queries

Common queries to run in Prometheus UI (http://localhost:9090):

```promql
# Request rate per endpoint
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# P95 response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Active players
active_players_total

# Memory usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

### Loki Log Queries

In Grafana, switch to Loki datasource and use LogQL:

```logql
# All logs from the app
{app="desperados-destiny"}

# Error logs only
{app="desperados-destiny"} |= "ERROR"

# Logs containing "payment"
{app="desperados-destiny"} |~ "payment"

# Parsed JSON logs
{app="desperados-destiny"} | json
```

## Troubleshooting

### Prometheus Not Scraping Metrics

1. Check Prometheus targets: http://localhost:9090/targets
2. Verify your app is exposing `/metrics`
3. Check firewall rules
4. Verify Docker network connectivity

```bash
# Test from Prometheus container
docker exec desperados-prometheus wget -O- http://host.docker.internal:5001/metrics
```

### Grafana Can't Connect to Prometheus

1. Check datasource configuration in Grafana
2. Verify containers are on the same network:

```bash
docker network inspect desperados-destiny_monitoring
```

### Loki Not Receiving Logs

1. Check Loki is running: http://localhost:3100/ready
2. Verify Winston-Loki transport is configured
3. Check Loki logs for errors:

```bash
docker logs desperados-loki
```

## Data Retention and Storage

### Default Retention Periods

- **Prometheus**: 30 days of metrics
- **Loki**: 30 days of logs
- **Grafana**: Dashboards persist indefinitely

### Adjusting Retention

**Prometheus** (`prometheus.yml`):
```yaml
command:
  - '--storage.tsdb.retention.time=90d'  # Keep 90 days
```

**Loki** (`loki-config.yml`):
```yaml
limits_config:
  retention_period: 2160h  # 90 days
```

### Storage Requirements

Estimated storage for 1000 concurrent users:

- Prometheus: ~500 MB/day (15 GB/month)
- Loki: ~1 GB/day (30 GB/month) depending on log volume
- Grafana: ~100 MB (dashboards)

## Security Considerations

### Production Hardening

1. **Change all default passwords**
2. **Enable authentication** for all services
3. **Use HTTPS** with valid SSL certificates
4. **Restrict network access** (firewall, security groups)
5. **Enable RBAC** in Grafana
6. **Disable anonymous access** in Grafana
7. **Secure metrics endpoint** (optional API key auth)

### Example Nginx Reverse Proxy for Grafana

```nginx
server {
    listen 443 ssl http2;
    server_name monitoring.desperados-destiny.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Support and Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [LogQL Guide](https://grafana.com/docs/loki/latest/logql/)

## License

This monitoring configuration is part of Desperados Destiny and follows the same license as the main project.
