# @desperados/shared

**Shared TypeScript Package for Desperados Destiny MMORPG**

This package contains shared types, constants, utilities, and mocks used by both the frontend (client) and backend (server) to ensure consistency and avoid duplication.

---

## Installation

The shared package is linked locally to both frontend and backend:

```json
{
  "dependencies": {
    "@desperados/shared": "file:../shared"
  }
}
```

To install in a new workspace:
```bash
cd server  # or client
npm install
```

---

## Package Structure

```
shared/
├── src/
│   ├── types/              # TypeScript type definitions
│   │   ├── user.types.ts
│   │   ├── character.types.ts
│   │   ├── destinyDeck.types.ts
│   │   ├── api.types.ts
│   │   └── error.types.ts
│   ├── constants/          # Shared constants
│   │   ├── game.constants.ts
│   │   └── validation.constants.ts
│   ├── utils/              # Utility functions
│   │   ├── destinyDeck.utils.ts
│   │   └── validation.utils.ts
│   ├── mocks/              # Mock data generators
│   │   ├── user.mocks.ts
│   │   ├── character.mocks.ts
│   │   └── card.mocks.ts
│   └── index.ts
├── dist/                   # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Building the Package

```bash
cd shared
npm install
npm run build
```

The package will be compiled to `dist/` directory.

---

## Usage

### Importing Types

```typescript
import {
  User,
  Character,
  Faction,
  Card,
  Suit,
  Rank,
  HandRank,
  ApiResponse,
  ErrorCode
} from '@desperados/shared';

// Or import from specific modules
import { User, SafeUser } from '@desperados/shared/types';
import { ENERGY, FACTIONS } from '@desperados/shared/constants';
import { evaluateHand, validateEmail } from '@desperados/shared/utils';
import { mockUser, mockCharacter } from '@desperados/shared/mocks';
```

### Example: Backend Usage

```typescript
// server/src/controllers/auth.controller.ts
import {
  UserRegistration,
  ApiResponse,
  validateEmail,
  validatePassword,
  createSuccessResponse,
  createErrorResponse
} from '@desperados/shared';

export async function register(req: Request, res: Response) {
  const { email, password }: UserRegistration = req.body;

  // Validate using shared validation
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', emailValidation.errors[0])
    );
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', passwordValidation.errors[0])
    );
  }

  // Create user...
  const user = await createUser(email, password);

  res.json(createSuccessResponse(user));
}
```

### Example: Frontend Usage

```typescript
// client/src/services/characterService.ts
import {
  Character,
  CharacterCreation,
  Faction,
  FACTIONS,
  validateCharacterName,
  createSuccessResponse
} from '@desperados/shared';

export async function createCharacter(
  name: string,
  faction: Faction
): Promise<Character> {
  // Validate using shared validation
  const nameValidation = validateCharacterName(name);
  if (!nameValidation.valid) {
    throw new Error(nameValidation.errors[0]);
  }

  const response = await fetch('/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, faction })
  });

  const data = await response.json();
  return data.data as Character;
}
```

### Example: Testing with Mocks

```typescript
// Backend test
import { mockUser, mockCharacter } from '@desperados/shared';

describe('User Service', () => {
  it('should create a user', async () => {
    const userData = mockUser({ email: 'test@example.com' });
    const user = await userService.create(userData);
    expect(user.email).toBe('test@example.com');
  });
});

// Frontend test
import { mockCharacter, Faction } from '@desperados/shared';

describe('Character Component', () => {
  it('should display character info', () => {
    const character = mockCharacter({
      name: 'Test Character',
      faction: Faction.SETTLER_ALLIANCE
    });

    render(<CharacterCard character={character} />);
    expect(screen.getByText('Test Character')).toBeInTheDocument();
  });
});
```

---

## Core Features

### 1. Type Definitions

Complete TypeScript types for all entities:

- **User Types**: `User`, `UserRegistration`, `UserLogin`, `SafeUser`, `TokenPayload`
- **Character Types**: `Character`, `CharacterCreation`, `SafeCharacter`, `Faction`
- **Destiny Deck Types**: `Card`, `Suit`, `Rank`, `HandRank`, `HandEvaluation`, `Challenge`
- **API Types**: `ApiResponse<T>`, `PaginatedResponse<T>`, `PaginationParams`
- **Error Types**: `ErrorCode`, `ApiError`, `ValidationError`

### 2. Game Constants

Centralized game configuration:

- **Energy System**: Regen rates, max values, costs
- **Progression**: Level caps, experience formulas
- **Factions**: Names, descriptions, starting locations
- **Validation Rules**: Min/max lengths, patterns, forbidden names

### 3. Utilities

#### Destiny Deck Utilities

Complete poker hand evaluation system:

```typescript
import { evaluateHand, compareHands, shuffleDeck } from '@desperados/shared';

const deck = shuffleDeck();
const hand = deck.slice(0, 5);
const evaluation = evaluateHand(hand);

console.log(evaluation.rank);        // HandRank.FULL_HOUSE
console.log(evaluation.score);       // 7001312 (numeric score)
console.log(evaluation.description); // "Full House, Kings over Queens"
```

Supported hand ranks:
- Royal Flush (10)
- Straight Flush (9)
- Four of a Kind (8)
- Full House (7)
- Flush (6)
- Straight (5)
- Three of a Kind (4)
- Two Pair (3)
- Pair (2)
- High Card (1)

#### Validation Utilities

Input validation with detailed error messages:

```typescript
import { validateEmail, validatePassword, validateCharacterName } from '@desperados/shared';

const emailResult = validateEmail('user@example.com');
// { valid: true, errors: [] }

const passwordResult = validatePassword('weak');
// { valid: false, errors: ['Password must be at least 8 characters', ...] }

const nameResult = validateCharacterName('My Hero');
// { valid: true, errors: [] }
```

### 4. Mock Data Generators

Realistic test data generation:

```typescript
import {
  mockUser,
  mockCharacter,
  mockCard,
  mockRoyalFlush,
  mockFullHouse,
  generateMockEmail
} from '@desperados/shared';

// Generate single entities
const user = mockUser();
const character = mockCharacter({ level: 10, faction: Faction.FRONTERA });

// Generate specific poker hands
const royalFlush = mockRoyalFlush(Suit.SPADES);
const fullHouse = mockFullHouse(Rank.KING, Rank.SEVEN);

// Generate multiple entities
const users = mockUsers(10); // Array of 10 users
const characters = mockCharacters(5, { faction: Faction.NAHI_COALITION });
```

---

## Testing

The shared package includes comprehensive unit tests:

```bash
cd shared
npm test              # Run tests
npm run test:watch    # Watch mode
```

Tests cover:
- All poker hand rankings
- Hand comparison logic
- Straight detection (including Ace-low straights)
- Validation functions
- Mock data generators

---

## Development

### Adding New Types

1. Create type file in `src/types/`
2. Export from `src/types/index.ts`
3. Rebuild package: `npm run build`

### Adding New Constants

1. Create constant file in `src/constants/`
2. Export from `src/constants/index.ts`
3. Rebuild package: `npm run build`

### Adding New Utilities

1. Create utility file in `src/utils/`
2. Add corresponding test file (`*.test.ts`)
3. Export from `src/utils/index.ts`
4. Rebuild package: `npm run build`

---

## Benefits

✅ **Type Safety**: Compile-time checking across frontend and backend
✅ **Single Source of Truth**: Game rules defined once, used everywhere
✅ **Consistency**: Validation and calculations produce identical results
✅ **Testability**: Comprehensive mocks make testing trivial
✅ **Refactoring Safety**: Change types once, TypeScript catches all usages
✅ **Reduced Bugs**: Mismatched API contracts caught at compile time

---

## API

### Type Exports

- `types` - All type definitions
- `constants` - All game constants
- `utils` - All utility functions
- `mocks` - All mock generators

### Individual Module Exports

```typescript
// Specific imports for tree-shaking
import { User } from '@desperados/shared/types';
import { ENERGY } from '@desperados/shared/constants';
import { evaluateHand } from '@desperados/shared/utils';
import { mockUser } from '@desperados/shared/mocks';
```

---

## Version

**1.0.0** - Sprint 1 Complete

---

## License

UNLICENSED - Private project

---

**Built by Agent 4 - Sprint 1**
**Last Updated: November 16, 2025**
