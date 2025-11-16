# SCRIPTS - Utility Scripts

**Automation and Utility Scripts**

This directory contains shell scripts and utilities to automate common development, deployment, and maintenance tasks.

---

## Purpose

Centralize automation scripts for:
- Development workflow
- Database management
- Deployment automation
- Testing and CI/CD
- Maintenance tasks

---

## Expected Scripts

### Development Scripts

**`dev.sh`** - Start development environment
```bash
#!/bin/bash
# Start all services in development mode

echo "Starting Desperados Destiny development environment..."

# Start Docker services
docker-compose -f docker-compose.dev.yml up -d

echo "✓ Services started"
echo "  → Backend: http://localhost:3000"
echo "  → Frontend: http://localhost:5173"
echo "  → MongoDB: localhost:27017"
echo "  → Redis: localhost:6379"
echo ""
echo "Run 'npm run logs' to view logs"
```

**`stop.sh`** - Stop development environment
```bash
#!/bin/bash
# Stop all Docker services

echo "Stopping Desperados Destiny services..."
docker-compose -f docker-compose.dev.yml down
echo "✓ Services stopped"
```

**`logs.sh`** - View service logs
```bash
#!/bin/bash
# View logs for a specific service

SERVICE=${1:-backend}

echo "Viewing logs for $SERVICE..."
docker-compose -f docker-compose.dev.yml logs -f $SERVICE
```

---

### Database Scripts

**`db-seed.sh`** - Seed database with test data
```bash
#!/bin/bash
# Seed database with test data for development

echo "Seeding database with test data..."

# Run seed script
docker exec -it dd-mongodb mongosh desperados-destiny --eval "load('/scripts/seed.js')"

echo "✓ Database seeded successfully"
```

**`db-backup.sh`** - Backup MongoDB database
```bash
#!/bin/bash
# Backup MongoDB database

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.gz"

mkdir -p $BACKUP_DIR

echo "Creating backup: $BACKUP_FILE"

docker exec dd-mongodb mongodump --archive=/tmp/backup.gz --gzip

docker cp dd-mongodb:/tmp/backup.gz $BACKUP_FILE

echo "✓ Backup created: $BACKUP_FILE"
```

**`db-restore.sh`** - Restore MongoDB database
```bash
#!/bin/bash
# Restore MongoDB from backup

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./db-restore.sh <backup-file>"
  exit 1
fi

echo "Restoring from: $BACKUP_FILE"

docker cp $BACKUP_FILE dd-mongodb:/tmp/restore.gz

docker exec dd-mongodb mongorestore --archive=/tmp/restore.gz --gzip

echo "✓ Database restored"
```

**`db-reset.sh`** - Reset database to clean state
```bash
#!/bin/bash
# WARNING: Destroys all data and resets to clean state

read -p "This will DELETE all data. Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted"
  exit 1
fi

echo "Resetting database..."

docker exec dd-mongodb mongosh desperados-destiny --eval "
  db.dropDatabase();
  db = db.getSiblingDB('desperados-destiny');
  db.createCollection('users');
  db.createCollection('characters');
"

echo "✓ Database reset complete"
```

---

### Testing Scripts

**`test.sh`** - Run all tests
```bash
#!/bin/bash
# Run all tests (unit + integration)

echo "Running tests..."

# Backend tests
echo "→ Running backend tests..."
cd server && npm test

# Frontend tests
echo "→ Running frontend tests..."
cd ../client && npm test

echo "✓ All tests passed"
```

**`test-coverage.sh`** - Generate test coverage report
```bash
#!/bin/bash
# Generate test coverage report

echo "Generating test coverage..."

cd server && npm run test:coverage
cd ../client && npm run test:coverage

echo "✓ Coverage reports generated"
echo "  → Server: server/coverage/index.html"
echo "  → Client: client/coverage/index.html"
```

---

### Deployment Scripts

**`deploy-staging.sh`** - Deploy to staging environment
```bash
#!/bin/bash
# Deploy to staging server

echo "Deploying to staging..."

# Build Docker images
docker-compose build

# Tag images
docker tag dd-backend:latest registry.example.com/dd-backend:staging
docker tag dd-frontend:latest registry.example.com/dd-frontend:staging

# Push to registry
docker push registry.example.com/dd-backend:staging
docker push registry.example.com/dd-frontend:staging

# SSH into staging server and deploy
ssh user@staging.example.com << 'EOF'
  cd /var/www/desperados-destiny
  docker-compose pull
  docker-compose up -d
  docker-compose exec backend npm run migrate
EOF

echo "✓ Deployed to staging"
echo "  → https://staging.desperados-destiny.com"
```

**`deploy-production.sh`** - Deploy to production
```bash
#!/bin/bash
# Deploy to production (with safety checks)

read -p "Deploy to PRODUCTION? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted"
  exit 1
fi

echo "Deploying to production..."

# Run tests first
npm run test || exit 1

# Build and tag
docker-compose build
docker tag dd-backend:latest registry.example.com/dd-backend:production
docker tag dd-frontend:latest registry.example.com/dd-frontend:production

# Push
docker push registry.example.com/dd-backend:production
docker push registry.example.com/dd-frontend:production

# Deploy with zero-downtime rolling update
ssh user@production.example.com << 'EOF'
  cd /var/www/desperados-destiny
  docker-compose pull
  docker-compose up -d --no-deps --build backend
  docker-compose exec backend npm run migrate
  docker-compose up -d --no-deps --build frontend
EOF

echo "✓ Deployed to production"
echo "  → https://desperados-destiny.com"
```

---

### Maintenance Scripts

**`clean.sh`** - Clean build artifacts and dependencies
```bash
#!/bin/bash
# Clean all build artifacts and node_modules

echo "Cleaning project..."

rm -rf server/node_modules
rm -rf server/dist
rm -rf client/node_modules
rm -rf client/build
rm -rf shared/node_modules

echo "✓ Project cleaned"
echo "Run 'npm install' in server/ and client/ to reinstall dependencies"
```

**`install.sh`** - Install all dependencies
```bash
#!/bin/bash
# Install dependencies for all packages

echo "Installing dependencies..."

echo "→ Installing server dependencies..."
cd server && npm install

echo "→ Installing client dependencies..."
cd ../client && npm install

echo "→ Installing shared dependencies..."
cd ../shared && npm install

echo "✓ All dependencies installed"
```

**`lint.sh`** - Run linters and formatters
```bash
#!/bin/bash
# Run ESLint and Prettier on all code

echo "Linting code..."

# Backend
echo "→ Linting server..."
cd server && npm run lint

# Frontend
echo "→ Linting client..."
cd ../client && npm run lint

# Shared
echo "→ Linting shared..."
cd ../shared && npm run lint

echo "✓ Linting complete"
```

**`format.sh`** - Format all code with Prettier
```bash
#!/bin/bash
# Auto-format all code with Prettier

echo "Formatting code..."

npx prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}"

echo "✓ Code formatted"
```

---

### Git Hooks

**`pre-commit.sh`** - Git pre-commit hook
```bash
#!/bin/bash
# Run before every commit

echo "Running pre-commit checks..."

# Lint staged files
npx lint-staged

# Run quick tests
npm run test:quick

echo "✓ Pre-commit checks passed"
```

**`pre-push.sh`** - Git pre-push hook
```bash
#!/bin/bash
# Run before pushing to remote

echo "Running pre-push checks..."

# Run all tests
npm run test

# Check TypeScript compilation
cd server && npm run build
cd ../client && npm run build

echo "✓ Pre-push checks passed"
```

---

### Monitoring Scripts

**`health-check.sh`** - Check service health
```bash
#!/bin/bash
# Check health of all services

echo "Checking service health..."

# Backend API
curl -f http://localhost:3000/health || echo "✗ Backend unhealthy"

# MongoDB
docker exec dd-mongodb mongosh --eval "db.adminCommand('ping')" || echo "✗ MongoDB unhealthy"

# Redis
docker exec dd-redis redis-cli ping || echo "✗ Redis unhealthy"

echo "✓ Health check complete"
```

**`monitor.sh`** - Monitor resource usage
```bash
#!/bin/bash
# Monitor Docker container resource usage

watch -n 1 'docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"'
```

---

## Usage

### Make Scripts Executable
```bash
chmod +x scripts/*.sh
```

### Run Scripts
```bash
# Development
./scripts/dev.sh
./scripts/logs.sh backend

# Database
./scripts/db-seed.sh
./scripts/db-backup.sh

# Testing
./scripts/test.sh
./scripts/test-coverage.sh

# Deployment
./scripts/deploy-staging.sh
./scripts/deploy-production.sh

# Maintenance
./scripts/clean.sh
./scripts/install.sh
./scripts/lint.sh
```

---

## Adding npm Scripts

Add shortcuts to root `package.json`:

```json
{
  "scripts": {
    "dev": "./scripts/dev.sh",
    "stop": "./scripts/stop.sh",
    "logs": "./scripts/logs.sh",
    "test": "./scripts/test.sh",
    "db:seed": "./scripts/db-seed.sh",
    "db:backup": "./scripts/db-backup.sh",
    "deploy:staging": "./scripts/deploy-staging.sh",
    "clean": "./scripts/clean.sh",
    "lint": "./scripts/lint.sh",
    "format": "./scripts/format.sh"
  }
}
```

Then run: `npm run dev`, `npm run test`, etc.

---

**Status:** Phase 0 - Structure created, scripts to be added during Phase 1+
**Next Steps:** Create utility scripts as needed during development

---

*Built by Kaine & Hawk*
*Last Updated: November 15, 2025*
