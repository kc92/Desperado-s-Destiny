# SERVER - Backend Application

**Node.js/Express/TypeScript Backend**

This directory contains the complete backend server for Desperados Destiny.

---

## Directory Structure

```
server/
├── src/                    # Source code
│   ├── routes/            # API route definitions
│   ├── controllers/       # Request handlers and business logic
│   ├── models/            # MongoDB/Mongoose models
│   ├── middleware/        # Express middleware (auth, validation, etc.)
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions and helpers
│   ├── config/            # Configuration files and environment setup
│   └── types/             # TypeScript type definitions
├── tests/                 # Test files (Jest)
├── package.json           # Dependencies and scripts (to be created)
├── tsconfig.json          # TypeScript configuration (to be created)
└── README.md              # This file
```

---

## Key Directories Explained

### `/src/routes`
API endpoint definitions. Each route file maps URLs to controller functions.

**Example files:**
- `auth.routes.ts` - Authentication endpoints (login, register, logout)
- `character.routes.ts` - Character management
- `combat.routes.ts` - Combat and dueling
- `crime.routes.ts` - Criminal activities
- `faction.routes.ts` - Faction and territory operations

### `/src/controllers`
Request handlers that process incoming requests, call services, and return responses.

**Example files:**
- `auth.controller.ts` - Handle auth requests
- `character.controller.ts` - Character CRUD operations
- `destinyDeck.controller.ts` - Destiny Deck resolution logic

### `/src/models`
Mongoose schemas defining database structure for MongoDB.

**Example files:**
- `Character.model.ts` - Player character schema
- `Gang.model.ts` - Gang/posse schema
- `Territory.model.ts` - Territory control schema

### `/src/middleware`
Express middleware for cross-cutting concerns.

**Example files:**
- `auth.middleware.ts` - JWT authentication verification
- `validation.middleware.ts` - Input validation
- `rateLimiter.middleware.ts` - API rate limiting
- `errorHandler.middleware.ts` - Global error handling

### `/src/services`
Business logic separated from controllers for reusability and testing.

**Example files:**
- `destinyDeck.service.ts` - Core Destiny Deck poker logic
- `energy.service.ts` - Energy regeneration calculations
- `combat.service.ts` - Combat resolution logic
- `skill.service.ts` - Skill training and progression

### `/src/utils`
Shared utility functions.

**Example files:**
- `logger.ts` - Winston logging setup
- `encryption.ts` - bcrypt helpers
- `validators.ts` - Common validation functions

### `/src/config`
Configuration and environment setup.

**Example files:**
- `database.ts` - MongoDB connection setup
- `redis.ts` - Redis connection setup
- `constants.ts` - Application constants

### `/tests`
Test files mirroring the `/src` structure.

**Example files:**
- `destinyDeck.service.test.ts` - Test Destiny Deck logic
- `combat.service.test.ts` - Test combat resolution
- `auth.controller.test.ts` - Test authentication endpoints

---

## Core Systems to Implement

1. **Authentication System** (JWT-based)
2. **Destiny Deck Engine** (Poker hand evaluation and suit bonuses)
3. **Character System** (Creation, progression, skills)
4. **Energy/Fatigue System** (Regeneration, spending, tracking)
5. **Combat System** (Dueling, gang wars, PvP)
6. **Crime System** (Criminal activities, jail, bounties)
7. **Faction System** (Reputation, territory control)
8. **Economy System** (Shops, trading, crafting)
9. **Real-Time System** (Socket.io for chat and live updates)

---

## Technologies

- **Runtime:** Node.js 18+ LTS
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x
- **Database:** MongoDB 6.x (via Mongoose)
- **Cache:** Redis 7.x
- **Real-Time:** Socket.io 4.x
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Validation:** express-validator
- **Testing:** Jest + Supertest

---

## Setup (Future)

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

---

## API Structure

```
/api/auth/register       - Create new account
/api/auth/login          - Login and get JWT
/api/auth/logout         - Invalidate session

/api/character/create    - Create character
/api/character/profile   - Get character data
/api/character/train     - Start skill training

/api/combat/duel         - Challenge player to duel
/api/combat/resolve      - Resolve combat with Destiny Deck

/api/crime/attempt       - Attempt criminal activity
/api/crime/jail          - Get jail status

/api/faction/join        - Join faction
/api/faction/territory   - Get territory control info

/api/gang/create         - Create gang
/api/gang/invite         - Invite player to gang
```

---

**Status:** Phase 0 - Structure created, implementation pending Phase 1
**Next Steps:** Initialize package.json, tsconfig.json, and begin Phase 1 development

---

*Built by Kaine & Hawk*
*Last Updated: November 15, 2025*
