# DESPERADOS DESTINY - CI/CD PIPELINE SPECIFICATION
## Automated Build, Test, Deploy

**Version:** 1.0
**Last Updated:** November 15, 2025
**Status:** Phase 0.75 - Foundation Planning

---

## OVERVIEW

This document defines the complete Continuous Integration/Continuous Deployment (CI/CD) pipeline for Desperados Destiny, automating:

- **Build** - Compile TypeScript, bundle assets
- **Test** - Run all test suites (unit, integration, E2E)
- **Security** - Scan for vulnerabilities
- **Deploy** - Push to dev → staging → production
- **Rollback** - Revert bad deployments instantly

**CI/CD Goals:**
- **Fast feedback** - Developers know within 10 minutes if code breaks
- **Zero-downtime deployments** - Blue-green strategy
- **Automated quality gates** - No manual approval for passing builds
- **Rollback in <2 minutes** - Quick recovery from bad deploys

---

## TABLE OF CONTENTS

1. [Pipeline Overview](#pipeline-overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Build Process](#build-process)
4. [Test Execution](#test-execution)
5. [Security Scanning](#security-scanning)
6. [Deployment Stages](#deployment-stages)
7. [Blue-Green Deployment](#blue-green-deployment)
8. [Rollback Procedures](#rollback-procedures)
9. [Environment Management](#environment-management)
10. [Secret Management](#secret-management)
11. [Monitoring Integration](#monitoring-integration)
12. [Release Process](#release-process)

---

## PIPELINE OVERVIEW

### Pipeline Trigger Points

| Trigger | Pipeline | Description |
|---------|----------|-------------|
| **Pull Request** | CI Pipeline | Run tests, security scans (no deploy) |
| **Merge to `develop`** | Deploy to Dev | Auto-deploy to development environment |
| **Merge to `staging`** | Deploy to Staging | Auto-deploy to staging environment |
| **Tag `v*.*.*`** | Deploy to Production | Deploy to production (manual approval) |
| **Manual Trigger** | Hotfix Deploy | Emergency deployment bypass |

### Pipeline Stages

```
┌─────────────┐
│   Commit    │
│   (Developer│
│   pushes)   │
└──────┬──────┘
       ↓
┌──────────────┐
│  CI Pipeline │
│  (GitHub     │
│   Actions)   │
├──────────────┤
│ 1. Checkout  │
│ 2. Install   │
│ 3. Build     │
│ 4. Lint      │
│ 5. Test      │
│ 6. Security  │
└──────┬───────┘
       ↓
  ┌────┴────┐
  │ Success?│
  └────┬────┘
    NO ↓  YES ↓
  ┌────┴────┐ ┌────────────┐
  │ Notify  │ │ Deploy to  │
  │Developer│ │ Environment│
  └─────────┘ └─────┬──────┘
                    ↓
             ┌──────────────┐
             │ Health Check │
             └──────┬───────┘
               OK ↓  FAIL ↓
          ┌────────┴──────┐
          │ Keep New      │ Auto-Rollback
          │ Deployment    │ to Previous
          └───────────────┘ Version
```

---

## GITHUB ACTIONS WORKFLOWS

### Workflow File Structure

```
.github/
└── workflows/
    ├── ci.yml              # Main CI pipeline (PR + push)
    ├── deploy-dev.yml      # Deploy to development
    ├── deploy-staging.yml  # Deploy to staging
    ├── deploy-production.yml  # Deploy to production
    ├── rollback.yml        # Manual rollback workflow
    └── cron-jobs.yml       # Scheduled tasks (backups, cleanup)
```

---

### CI Pipeline (`ci.yml`)

**Triggers:** Pull Request, Push to any branch

```yaml
name: CI Pipeline

on:
  pull_request:
    branches: ['**']
  push:
    branches: ['**']

env:
  NODE_VERSION: '18'
  MONGODB_VERSION: '6.0'
  REDIS_VERSION: '7'

jobs:
  # Job 1: Install Dependencies & Cache
  install:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cache node_modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}

  # Job 2: Lint & Format Check
  lint:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  # Job 3: Build
  build:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build:server
      - run: npm run build:client

      # Upload build artifacts
      - uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            server/dist
            client/build

  # Job 4: Unit Tests
  unit-tests:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage --ci

      # Upload coverage to Codecov
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unit-tests

  # Job 5: Integration Tests
  integration-tests:
    needs: install
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:${{ env.MONGODB_VERSION }}
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:${{ env.REDIS_VERSION }}
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          MONGO_URI: mongodb://localhost:27017/desperados_test
          REDIS_URL: redis://localhost:6379

  # Job 6: E2E Tests
  e2e-tests:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps

      # Start test server
      - run: npm run start:test &
      - run: npx wait-on http://localhost:3000

      # Run E2E tests
      - run: npm run test:e2e

      # Upload screenshots/videos on failure
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # Job 7: Security Scanning
  security:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci

      # Dependency vulnerabilities
      - run: npm audit --audit-level=moderate

      # Snyk scan
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      # Secret scanning
      - uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

  # Job 8: Code Coverage Enforcement
  coverage:
    needs: [unit-tests, integration-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:coverage-check

      # Fail if coverage below 80%
      - name: Check coverage thresholds
        run: |
          COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi

  # Final Job: Status Check
  ci-complete:
    needs: [lint, build, unit-tests, integration-tests, e2e-tests, security, coverage]
    runs-on: ubuntu-latest
    steps:
      - run: echo "CI Pipeline Passed ✓"
```

---

### Deploy to Development (`deploy-dev.yml`)

**Triggers:** Push to `develop` branch

```yaml
name: Deploy to Development

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: development
      url: https://dev.desperados-destiny.com

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      # Build application
      - run: npm ci
      - run: npm run build

      # Deploy to DigitalOcean App Platform (or AWS)
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_TOKEN }}

      - name: Deploy to Dev Server
        run: |
          doctl apps create-deployment ${{ secrets.DEV_APP_ID }} --wait

      # Health check
      - name: Health Check
        run: |
          sleep 30  # Wait for deployment
          curl -f https://dev.desperados-destiny.com/health || exit 1

      # Notify team
      - uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployed to Development'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

### Deploy to Production (`deploy-production.yml`)

**Triggers:** Git tag matching `v*.*.*`

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://desperados-destiny.com

    steps:
      - uses: actions/checkout@v4

      # Require manual approval (GitHub Environments setting)
      # Admin must approve in GitHub UI before this runs

      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

      # Run production-specific tests
      - run: npm run test:smoke

      # Blue-Green Deployment
      - name: Deploy to Green Environment
        run: |
          # Deploy to green server (inactive)
          ssh deploy@green.desperados-destiny.com "cd /var/www && ./deploy.sh"

      # Health check green environment
      - name: Health Check Green
        run: |
          curl -f https://green.desperados-destiny.com/health || exit 1

      # Switch traffic to green (now active)
      - name: Switch Traffic to Green
        run: |
          # Update load balancer to point to green
          doctl compute load-balancer update ${{ secrets.LB_ID }} \
            --forwarding-rules entry_protocol:https,target_protocol:http,target_port:3000

      # Monitor for 5 minutes
      - name: Monitor New Deployment
        run: |
          sleep 300
          ERROR_RATE=$(curl -s https://api.desperados-destiny.com/metrics/error-rate)
          if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
            echo "Error rate too high, rolling back"
            exit 1
          fi

      # If all good, mark old blue as standby
      - name: Mark Old Blue as Standby
        run: echo "Blue environment is now standby for rollback"

      # Notify team
      - uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Production Deployment Successful'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      # Rollback on failure
      - name: Rollback on Failure
        if: failure()
        run: |
          # Switch traffic back to blue
          doctl compute load-balancer update ${{ secrets.LB_ID }} \
            --forwarding-rules entry_protocol:https,target_protocol:http,target_port:3001
          echo "Rolled back to previous version"
```

---

## BUILD PROCESS

### Build Scripts (`package.json`)

```json
{
  "scripts": {
    "build": "npm run build:server && npm run build:client",
    "build:server": "tsc -p server/tsconfig.json",
    "build:client": "cd client && vite build",
    "build:production": "NODE_ENV=production npm run build",

    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "format:check": "prettier --check 'src/**/*.{ts,tsx}'",
    "format:fix": "prettier --write 'src/**/*.{ts,tsx}'",

    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration --runInBand",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:coverage-check": "jest --coverage --coverageThreshold='{\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}'",
    "test:smoke": "playwright test tests/smoke",

    "start": "node server/dist/index.js",
    "start:dev": "nodemon --watch server/src --exec ts-node server/src/index.ts",
    "start:test": "NODE_ENV=test node server/dist/index.js"
  }
}
```

### Build Optimization

**TypeScript Compilation:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true  // For debugging production issues
  }
}
```

**Vite Build (Frontend):**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'game-core': ['./src/core/destinyDeck', './src/core/energySystem']
        }
      }
    }
  }
})
```

---

## TEST EXECUTION

### Test Execution Order

1. **Lint** (fast, fail fast)
2. **Unit Tests** (parallel, fast)
3. **Build** (required for E2E)
4. **Integration Tests** (sequential, slower)
5. **E2E Tests** (slowest, critical paths only)
6. **Coverage Check** (enforce thresholds)

### Parallel Execution

```yaml
# Run unit tests in parallel across multiple jobs
unit-tests:
  strategy:
    matrix:
      shard: [1, 2, 3, 4]  # Split tests into 4 shards
  steps:
    - run: npm run test:unit -- --shard=${{ matrix.shard }}/4
```

### Test Result Reporting

```yaml
- name: Publish Test Results
  uses: dorny/test-reporter@v1
  if: always()
  with:
    name: Test Results
    path: 'test-results/**/*.xml'
    reporter: jest-junit
```

---

## SECURITY SCANNING

### Dependency Scanning

**npm audit:**
```yaml
- run: npm audit --audit-level=moderate
```

**Snyk:**
```yaml
- uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

### Secret Scanning

**TruffleHog:**
```yaml
- uses: trufflesecurity/trufflehog@main
  with:
    path: ./
    base: ${{ github.event.repository.default_branch }}
    head: HEAD
```

### SAST (Static Application Security Testing)

**CodeQL:**
```yaml
- uses: github/codeql-action/init@v2
  with:
    languages: javascript, typescript

- uses: github/codeql-action/analyze@v2
```

---

## DEPLOYMENT STAGES

### Environment Progression

```
Developer Laptop → Dev → Staging → Production
                    ↓      ↓          ↓
                   Auto   Auto     Manual Approval
```

### Environment Configuration

| Environment | URL | Auto-Deploy? | Purpose |
|-------------|-----|--------------|---------|
| **Development** | dev.desperados-destiny.com | ✓ (on push to `develop`) | Feature testing |
| **Staging** | staging.desperados-destiny.com | ✓ (on push to `staging`) | Pre-production testing |
| **Production** | desperados-destiny.com | Manual approval | Live game |

### Deployment Checklist

**Before Deploy:**
- [ ] All tests pass
- [ ] Security scans pass
- [ ] Code review approved
- [ ] Changelog updated
- [ ] Database migrations prepared

**After Deploy:**
- [ ] Health check passes
- [ ] Smoke tests pass
- [ ] Error rate <1%
- [ ] Response time <500ms
- [ ] Database migrations applied

---

## BLUE-GREEN DEPLOYMENT

### Architecture

```
           Load Balancer
                ↓
        ┌───────┴───────┐
        ↓               ↓
   BLUE (Active)    GREEN (Inactive)
   Port 3001        Port 3000
   Current Version  New Version
```

### Deployment Steps

1. **Deploy to Green (inactive)**
```bash
ssh deploy@green.desperados-destiny.com "cd /var/www && ./deploy.sh"
```

2. **Health Check Green**
```bash
curl -f https://green.desperados-destiny.com/health
```

3. **Switch Traffic**
```bash
# Update load balancer
nginx -s reload
```

4. **Monitor**
```bash
# Watch error rates for 5 minutes
watch -n 10 "curl -s https://api.desperados-destiny.com/metrics/error-rate"
```

5. **Rollback if Needed**
```bash
# Switch back to blue
nginx -s reload (with blue config)
```

---

## ROLLBACK PROCEDURES

### Manual Rollback Workflow (`rollback.yml`)

```yaml
name: Rollback Production

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to (e.g., v1.2.3)'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Confirm Rollback
        run: |
          echo "Rolling back to ${{ github.event.inputs.version }}"
          echo "This will revert production to a previous version."

      - name: Switch Traffic to Blue
        run: |
          # Switch load balancer back to blue (previous version)
          ssh deploy@lb.desperados-destiny.com "nginx -s reload -c /etc/nginx/blue.conf"

      - name: Verify Rollback
        run: |
          curl -f https://desperados-destiny.com/health
          echo "Rollback successful"

      - name: Notify Team
        uses: 8398a7/action-slack@v3
        with:
          status: warning
          text: 'Production rolled back to ${{ github.event.inputs.version }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Automatic Rollback on Failure

```yaml
# In production deploy workflow
- name: Monitor Deployment
  run: |
    sleep 300  # 5 minutes
    ERROR_RATE=$(curl -s https://api.desperados-destiny.com/metrics/error-rate)
    if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
      echo "Error rate $ERROR_RATE exceeds 5%, triggering rollback"
      exit 1
    fi

- name: Rollback on Failure
  if: failure()
  run: |
    ssh deploy@lb.desperados-destiny.com "nginx -s reload -c /etc/nginx/blue.conf"
    echo "Automatic rollback completed"
```

---

## ENVIRONMENT MANAGEMENT

### Environment Variables

**Stored in GitHub Secrets:**
- `MONGODB_URI` (production connection string)
- `REDIS_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `DIGITALOCEAN_TOKEN`
- `SLACK_WEBHOOK`

**Environment Files:**

```bash
# .env.development
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/desperados_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-not-for-production

# .env.production (never committed, set in CI/CD)
NODE_ENV=production
MONGODB_URI=<secret>
REDIS_URL=<secret>
JWT_SECRET=<secret>
```

### Secret Rotation

**Every 90 days, rotate:**
- [ ] JWT secret
- [ ] Database passwords
- [ ] API keys
- [ ] Encryption keys

**Process:**
1. Generate new secret
2. Update GitHub Secrets
3. Deploy with new secret
4. Old secret becomes fallback for 24 hours
5. Remove old secret

---

## MONITORING INTEGRATION

### Health Check Endpoint

```typescript
// /health endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabaseConnection(),
      redis: await checkRedisConnection(),
      diskSpace: await checkDiskSpace(),
      memory: process.memoryUsage()
    }
  }

  const allHealthy = Object.values(health.checks).every(check => check.status === 'ok')

  res.status(allHealthy ? 200 : 503).json(health)
})
```

### Prometheus Metrics

```typescript
import { collectDefaultMetrics, register } from 'prom-client'

collectDefaultMetrics()

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(register.metrics())
})
```

### Post-Deploy Monitoring

**After each deployment, monitor for 10 minutes:**
- Error rate (should be <1%)
- Response time (p95 should be <500ms)
- Memory usage (should be stable)
- Active connections (should be normal)

**Alerting Rules:**
```yaml
# Prometheus alert rules
groups:
  - name: deployment
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        annotations:
          summary: "High error rate detected after deployment"

      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 0.5
        annotations:
          summary: "Response time degraded after deployment"
```

---

## RELEASE PROCESS

### Versioning (SemVer)

**Format:** `v<MAJOR>.<MINOR>.<PATCH>`

- **MAJOR** - Breaking changes (e.g., v2.0.0)
- **MINOR** - New features, backwards-compatible (e.g., v1.5.0)
- **PATCH** - Bug fixes (e.g., v1.4.3)

### Release Steps

1. **Create Release Branch**
```bash
git checkout -b release/v1.5.0
```

2. **Update Version**
```bash
npm version minor  # Updates package.json, creates commit + tag
```

3. **Update Changelog**
```markdown
## [1.5.0] - 2025-11-15
### Added
- Gang vault system
- Territory control mechanics

### Fixed
- Energy regeneration rounding bug
- Chat message duplication issue
```

4. **Merge to `master`**
```bash
git checkout master
git merge release/v1.5.0
git push origin master --tags
```

5. **Deploy to Production** (GitHub Actions auto-triggers on tag)

6. **Post-Release**
- [ ] Announce in Discord
- [ ] Update documentation site
- [ ] Monitor for issues

---

## DISASTER RECOVERY

### Backup Automation

**Cron Job (`cron-jobs.yml`):**

```yaml
name: Scheduled Backups

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  backup-database:
    runs-on: ubuntu-latest
    steps:
      - name: Backup MongoDB
        run: |
          mongodump --uri="${{ secrets.MONGODB_URI }}" --archive | \
          openssl enc -aes-256-cbc -salt -pbkdf2 -pass file:/etc/backup-password | \
          aws s3 cp - s3://desperados-backups/mongodb/backup-$(date +%Y%m%d).enc

      - name: Cleanup Old Backups
        run: |
          # Delete backups older than 30 days
          aws s3 ls s3://desperados-backups/mongodb/ | \
          awk '{if ($1 < "'$(date -d '30 days ago' +%Y-%m-%d)'") print $4}' | \
          xargs -I {} aws s3 rm s3://desperados-backups/mongodb/{}
```

### Restore Process

```bash
# Download latest backup
aws s3 cp s3://desperados-backups/mongodb/backup-20251115.enc /tmp/backup.enc

# Decrypt
openssl enc -aes-256-cbc -d -pbkdf2 -pass file:/etc/backup-password < /tmp/backup.enc | \
mongorestore --uri="mongodb://localhost:27017/desperados_destiny" --archive

echo "Database restored successfully"
```

---

## CONCLUSION

This CI/CD Pipeline provides **automated, production-ready deployment** that:

1. **Ensures quality** with automated testing at every stage
2. **Enforces security** with vulnerability scanning
3. **Enables rapid deployment** with blue-green strategy
4. **Minimizes risk** with automatic rollback
5. **Maintains reliability** with health checks and monitoring

**No more manual deployments, no more downtime, no more deployment anxiety.**

---

**Document Status:** ✅ Complete
**Deployment Strategy:** Blue-Green with Auto-Rollback
**Zero-Downtime:** Yes
**Next Phase:** Monitoring & Observability Plan

*— Ezra "Hawk" Hawthorne*
*DevOps Architect*
*November 15, 2025*
