# Developer Onboarding Guide

**Last Updated:** 2025-12-31

Welcome to Desperados Destiny! This guide will get you up and running quickly.

---

## Prerequisites

Before starting, ensure you have:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ LTS | JavaScript runtime |
| npm | 9+ | Package manager |
| Docker | Latest | Containerization |
| Git | Latest | Version control |
| VS Code | Latest | Recommended IDE |

---

## Quick Start (5 Minutes)

```bash
# 1. Clone the repository
git clone <repo-url>
cd "Desperados Destiny Dev"

# 2. Run setup script (creates .env, generates secrets)
npm run setup

# 3. Install dependencies
npm install

# 4. Start all services
npm run dev
```

### Verify Setup

```bash
npm run health
```

All services should show "healthy" status.

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |
| MongoDB | mongodb://localhost:27017 |
| Redis | redis://localhost:6379 |

---

## Project Structure

```
Desperados Destiny Dev/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (Node.js + TypeScript)
├── shared/          # Shared types and constants
├── docs/            # Documentation
├── config/          # Configuration files
├── scripts/         # Utility scripts
└── docker-compose.yml
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `client/src/pages/` | React page components (73 pages) |
| `client/src/components/` | Reusable UI components (41 dirs) |
| `client/src/store/` | Zustand state stores (36 modules) |
| `server/src/routes/` | API route definitions (113+ files) |
| `server/src/services/` | Business logic (222 services) |
| `server/src/models/` | MongoDB schemas (217 models) |
| `shared/src/types/` | TypeScript interfaces |
| `shared/src/constants/` | Game constants |

---

## Development Workflow

### Running in Development

```bash
# Start everything (recommended)
npm run dev

# Or start services individually
npm run dev:client    # Frontend only
npm run dev:server    # Backend only
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:client   # Frontend tests
npm run test:server   # Backend tests
npm run test:e2e      # End-to-end tests
```

### Building

```bash
# Build for production
npm run build

# Build specific workspace
npm run build:client
npm run build:server
```

---

## Code Standards

### TypeScript

- Strict mode enabled
- All new code must be typed
- Use interfaces from `shared/src/types/`

### Formatting

- Prettier for formatting (auto on save)
- ESLint for linting
- 2-space indentation

### Commits

Use conventional commits:

```
feat(scope): add new feature
fix(scope): fix bug
refactor(scope): code improvement
test(scope): add tests
docs(scope): update documentation
```

---

## Key Concepts

### The Destiny Deck

Every action resolves through a poker hand:

1. System draws 5 cards
2. Hand strength determines base success
3. Four suits map to skill categories:
   - Spades = Cunning
   - Hearts = Spirit
   - Clubs = Combat
   - Diamonds = Craft

**Key File:** `server/src/services/actionDeck.service.ts`

### Energy System

- Free players: 150 max, 5/hour regen
- Premium: 250 max, 8/hour regen
- Every action costs energy

**Key File:** `server/src/services/energy.service.ts`

### Three Factions

1. **Settler Alliance** - Law & order
2. **Nahi Coalition** - Sacred lands
3. **Frontera** - Outlaw freedom

---

## Common Tasks

### Adding a New API Endpoint

1. Create route in `server/src/routes/`
2. Create controller in `server/src/controllers/`
3. Create service in `server/src/services/`
4. Add types to `shared/src/types/`

### Adding a New Page

1. Create page in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Create store if needed in `client/src/store/`

### Adding a New Model

1. Create model in `server/src/models/`
2. Add types to `shared/src/types/`
3. Create service for business logic

---

## Debugging

### Backend Logs

```bash
# View server logs
docker-compose logs -f backend

# Or if running locally
npm run dev:server
```

### MongoDB Access

```bash
# Connect to MongoDB shell
docker-compose exec mongodb mongosh
```

### Redis Access

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :5001

# Kill process (Windows)
taskkill /PID <pid> /F
```

### MongoDB Connection Failed

1. Check Docker is running
2. Run `docker-compose up mongodb`
3. Verify connection string in `.env`

### TypeScript Errors

```bash
# Rebuild shared types
npm run build:shared

# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

See [Troubleshooting Guide](troubleshooting.md) for more solutions.

---

## VS Code Setup

### Recommended Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- MongoDB for VS Code

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Getting Help

1. Check the [Troubleshooting Guide](troubleshooting.md)
2. Search existing GitHub issues
3. Ask in the team chat
4. Create a new GitHub issue

---

## Next Steps

1. Run through the game as a player
2. Read [Architecture Overview](../architecture/overview.md)
3. Explore [Game Mechanics](../game-design/mechanics.md)
4. Pick a task from the backlog

---

*Welcome to the frontier, partner!*
