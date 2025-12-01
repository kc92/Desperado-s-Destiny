# DESPERADOS DESTINY - DEVELOPMENT GUIDE

## Quick Start

### Prerequisites

Before starting, ensure you have installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)
- A code editor (VS Code recommended)

### One-Command Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd desperados-destiny

# Run setup script (creates .env, generates secrets)
npm run setup

# Install dependencies
npm install

# Start all services with Docker
npm run dev
```

Visit:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/health

### Alternative: Run Locally Without Docker

```bash
# Start MongoDB and Redis with Docker only
docker-compose up mongodb redis

# Run backend and frontend locally
npm run dev:local
```

---

## Available Scripts

### Development

```bash
npm run dev              # Start all services with Docker (recommended)
npm run dev:local        # Run backend + frontend locally (requires MongoDB/Redis)
npm run dev:backend      # Run only backend locally
npm run dev:frontend     # Run only frontend locally
```

### Logs & Monitoring

```bash
npm run logs             # View all container logs
npm run logs:backend     # View backend logs only
npm run logs:frontend    # View frontend logs only
npm run logs:mongo       # View MongoDB logs
npm run logs:redis       # View Redis logs
npm run health           # Check if all services are healthy
```

### Stopping Services

```bash
npm run stop             # Stop all Docker containers
npm run stop:clean       # Stop containers and remove volumes
npm run clean            # Full cleanup (containers, volumes, images)
```

### Code Quality

```bash
npm run lint             # Lint backend + frontend
npm run lint:backend     # Lint backend only
npm run lint:frontend    # Lint frontend only
npm run format           # Format all code with Prettier
npm run format:check     # Check if code is formatted
```

### Testing

```bash
npm test                 # Run all tests
npm run test:backend     # Run backend tests
npm run test:frontend    # Run frontend tests
```

### Building

```bash
npm run build            # Build backend + frontend for production
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only
```

---

## Project Structure

```
desperados-destiny/
├── .claude/                  # Claude Code configuration
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page-level components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Zustand state management
│   │   ├── services/        # API communication
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   ├── docker/              # Frontend Docker configs
│   ├── Dockerfile           # Multi-stage Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB models
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration
│   ├── Dockerfile           # Multi-stage Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── shared/                   # Shared types/constants
│   └── types/               # TypeScript types used in both frontend & backend
├── docs/                     # Documentation
│   ├── game-design-document.md
│   ├── technical-stack.md
│   └── ...
├── scripts/                  # Development scripts
│   ├── setup.js             # Environment setup
│   └── health-check.js      # Service health check
├── docker/                   # Docker configuration
│   └── mongo-init/          # MongoDB initialization scripts
├── docker-compose.yml        # Docker Compose configuration
├── .env.example              # Environment variables template
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── .editorconfig            # Editor configuration
├── package.json             # Root package.json with workspace scripts
└── README.md                # Project overview
```

---

## Environment Configuration

### Initial Setup

The `npm run setup` script creates a `.env` file from `.env.example` and generates secure JWT secrets.

### Environment Variables

Edit `.env` to configure your local environment:

#### Application
```env
NODE_ENV=development
PORT=5000
```

#### Database
```env
MONGODB_URI=mongodb://admin:password@mongodb:27017/desperados-destiny?authSource=admin
MONGO_USERNAME=admin
MONGO_PASSWORD=password
```

#### Redis
```env
REDIS_URL=redis://:redispassword@redis:6379
REDIS_PASSWORD=redispassword
```

#### Authentication
```env
JWT_SECRET=<auto-generated>
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
```

#### Frontend
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

---

## Docker Services

### Service Overview

| Service  | Port  | Description                    |
|----------|-------|--------------------------------|
| frontend | 5173  | React development server       |
| backend  | 5000  | Node.js API server            |
| mongodb  | 27017 | MongoDB database              |
| redis    | 6379  | Redis cache                   |

### Health Checks

All services include health checks:
- **MongoDB:** Responds to ping command
- **Redis:** Responds to incr command
- **Backend:** `/health` endpoint returns 200
- **Frontend:** Responds to HTTP requests

### Data Persistence

Docker volumes ensure data persists between restarts:
- `mongodb_data` - MongoDB database files
- `redis_data` - Redis persistence
- `backend_logs` - Backend application logs

---

## Development Workflow

### 1. Start Services

```bash
npm run dev
```

Wait for all containers to start (30-60 seconds on first run).

### 2. Check Health

```bash
npm run health
```

All services should report as healthy.

### 3. Make Changes

- **Backend:** Edit files in `server/src/` - hot reload enabled
- **Frontend:** Edit files in `client/src/` - Vite HMR enabled

### 4. View Logs

```bash
npm run logs
```

Or watch specific service logs:
```bash
npm run logs:backend
```

### 5. Lint & Format

Before committing:
```bash
npm run format
npm run lint
```

### 6. Stop Services

```bash
npm run stop
```

---

## Troubleshooting

### Services Won't Start

**Check Docker is running:**
```bash
docker --version
docker-compose --version
```

**View container status:**
```bash
docker-compose ps
```

**View container logs:**
```bash
npm run logs
```

### Port Already in Use

If ports 5000, 5173, 27017, or 6379 are in use:

1. Stop conflicting services
2. Or change ports in `docker-compose.yml` and `.env`

### MongoDB Connection Failed

**Check MongoDB is running:**
```bash
docker-compose ps mongodb
```

**View MongoDB logs:**
```bash
npm run logs:mongo
```

**Verify connection string in `.env`:**
```env
MONGODB_URI=mongodb://admin:password@mongodb:27017/desperados-destiny?authSource=admin
```

### Frontend Can't Connect to Backend

**Verify VITE_API_URL in `.env`:**
```env
VITE_API_URL=http://localhost:5000
```

**Check backend is healthy:**
```bash
curl http://localhost:5000/health
```

### Hot Reload Not Working

**For backend:**
- Ensure volume mounts in `docker-compose.yml` are correct
- Restart container: `docker-compose restart backend`

**For frontend:**
- Clear Vite cache: `rm -rf client/node_modules/.vite`
- Restart container: `docker-compose restart frontend`

### Docker Volume Issues

**Clean up volumes and restart:**
```bash
npm run stop:clean
npm run dev
```

### Permission Issues (Linux/Mac)

If you get permission errors:
```bash
sudo chown -R $USER:$USER .
```

---

## Code Quality Tools

### ESLint

Rules based on Airbnb style guide with TypeScript support.

```bash
# Run linter
npm run lint

# Auto-fix issues
cd server && npm run lint:fix
cd client && npm run lint:fix
```

### Prettier

Auto-formats code to consistent style.

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### EditorConfig

Ensures consistent settings across editors. Install the EditorConfig plugin for your editor.

### Pre-commit Hooks (Optional)

Install Husky to run lint and format on commit:
```bash
npm run prepare
```

This sets up pre-commit hooks via `lint-staged`.

---

## Testing

### Backend Tests

```bash
cd server
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

### Frontend Tests

```bash
cd client
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

---

## Building for Production

### Build All

```bash
npm run build
```

### Backend Production Build

```bash
cd server
npm run build
```

This compiles TypeScript to `server/dist/`.

### Frontend Production Build

```bash
cd client
npm run build
```

This creates optimized bundle in `client/dist/`.

### Run Production Build

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

---

## Database Management

### MongoDB Shell

```bash
# Connect to MongoDB container
docker-compose exec mongodb mongosh -u admin -p password --authenticationDatabase admin

# Use game database
use desperados-destiny

# List collections
show collections

# Query users
db.users.find()
```

### Redis CLI

```bash
# Connect to Redis container
docker-compose exec redis redis-cli -a redispassword

# Check keys
KEYS *

# Get value
GET key_name
```

### Backup Database

```bash
# Create MongoDB dump
docker-compose exec mongodb mongodump --username admin --password password --authenticationDatabase admin --out /data/backup

# Copy backup to host
docker cp desperados-mongodb:/data/backup ./backup
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backup desperados-mongodb:/data/backup

# Restore
docker-compose exec mongodb mongorestore --username admin --password password --authenticationDatabase admin /data/backup
```

---

## Additional Resources

- **[Game Design Document](docs/game-design-document.md)** - Complete game vision
- **[Technical Stack](docs/technical-stack.md)** - Technology decisions
- **[API Documentation](docs/api-specifications.md)** - API endpoints
- **[Database Schemas](docs/database-schemas.md)** - Data models
- **[Development Log](docs/development-log.md)** - Progress tracking

---

## Getting Help

1. Check this guide and troubleshooting section
2. Review container logs: `npm run logs`
3. Check service health: `npm run health`
4. Review documentation in `docs/`
5. Check GitHub issues (when repository is public)

---

**Happy coding, partner!**
