# CONTRIBUTING TO DESPERADOS DESTINY

Thank you for your interest in contributing to Desperados Destiny! This document provides guidelines and standards for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guide](#code-style-guide)
- [Git Workflow](#git-workflow)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing opinions and experiences
- Accept responsibility for mistakes

### Unacceptable Behavior

- Harassment, trolling, or personal attacks
- Publishing private information without consent
- Spam or off-topic content
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

1. Read the [Game Design Document](docs/game-design-document.md)
2. Set up your development environment (see [DEVELOPMENT.md](DEVELOPMENT.md))
3. Join our community channels (Discord/forums - links TBD)

### First Time Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/desperados-destiny.git
cd desperados-destiny

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/desperados-destiny.git

# Run setup
npm run setup
npm install

# Start development environment
npm run dev
```

---

## Development Workflow

### 1. Pick an Issue

- Browse [open issues](../../issues)
- Look for `good-first-issue` or `help-wanted` labels
- Comment on the issue to claim it

### 2. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

- Write clean, documented code
- Follow the code style guide (below)
- Add tests for new features
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test

# Check health
npm run health
```

### 5. Commit Your Changes

Follow our commit message conventions (see Git Workflow below).

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Code Style Guide

### General Principles

1. **Clarity over cleverness** - Write code that's easy to understand
2. **DRY (Don't Repeat Yourself)** - Extract common logic into reusable functions
3. **KISS (Keep It Simple, Stupid)** - Avoid unnecessary complexity
4. **Document complex logic** - Add comments explaining "why", not "what"

### TypeScript/JavaScript

#### Naming Conventions

```typescript
// Variables and functions: camelCase
const energyPoints = 150;
const calculateDamage = (attack: number) => { };

// Classes and interfaces: PascalCase
class Character { }
interface DestinyCard { }

// Constants: UPPER_SNAKE_CASE
const MAX_ENERGY = 150;
const ENERGY_REGEN_RATE = 5;

// Private properties: prefix with underscore
class Service {
  private _connection: Connection;
}

// Boolean variables: prefix with is/has/can
const isAuthenticated = true;
const hasPermission = false;
const canAttack = true;
```

#### Function Guidelines

```typescript
// Use arrow functions for simple operations
const add = (a: number, b: number) => a + b;

// Use function declarations for complex logic
function evaluateDestinyHand(cards: Card[]): HandResult {
  // Complex logic here
}

// Use descriptive parameter names
function dealDamage(attacker: Character, defender: Character, amount: number) {
  // Not: dealDamage(a, d, x)
}
```

#### Type Safety

```typescript
// Always define types for function parameters and return values
function calculateEnergy(current: number, max: number): number {
  return Math.min(current + 5, max);
}

// Use interfaces for object shapes
interface Character {
  id: string;
  name: string;
  energy: number;
}

// Avoid 'any' - use 'unknown' if type is truly unknown
function parseData(input: unknown): Character {
  // Type guard here
}
```

#### Error Handling

```typescript
// Use try-catch for async operations
async function fetchCharacter(id: string): Promise<Character> {
  try {
    const character = await Character.findById(id);
    if (!character) {
      throw new Error(`Character ${id} not found`);
    }
    return character;
  } catch (error) {
    logger.error('Error fetching character', { id, error });
    throw error;
  }
}

// Create custom error classes
class InsufficientEnergyError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient energy: required ${required}, available ${available}`);
    this.name = 'InsufficientEnergyError';
  }
}
```

### React/Frontend

#### Component Structure

```tsx
// Use functional components with hooks
import { useState, useEffect } from 'react';

interface CharacterCardProps {
  character: Character;
  onSelect?: (character: Character) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onSelect
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="character-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3>{character.name}</h3>
      {onSelect && (
        <button onClick={() => onSelect(character)}>Select</button>
      )}
    </div>
  );
};
```

#### Hooks

```tsx
// Custom hooks start with 'use'
function useEnergy(characterId: string) {
  const [energy, setEnergy] = useState(0);

  useEffect(() => {
    // Setup energy tracking
    const interval = setInterval(() => {
      // Update energy
    }, 5000);

    return () => clearInterval(interval);
  }, [characterId]);

  return { energy };
}
```

#### State Management

```typescript
// Zustand store example
import create from 'zustand';

interface CharacterStore {
  character: Character | null;
  setCharacter: (character: Character) => void;
  updateEnergy: (energy: number) => void;
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  character: null,
  setCharacter: (character) => set({ character }),
  updateEnergy: (energy) => set((state) => ({
    character: state.character
      ? { ...state.character, energy }
      : null
  })),
}));
```

### Backend

#### Route Structure

```typescript
// routes/character.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import * as characterController from '../controllers/character.controller';

const router = Router();

router.get(
  '/profile',
  authenticate,
  characterController.getProfile
);

router.post(
  '/create',
  authenticate,
  validateRequest(characterSchema),
  characterController.createCharacter
);

export default router;
```

#### Controller Pattern

```typescript
// controllers/character.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as characterService from '../services/character.service';
import { AuthRequest } from '../types';

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const character = await characterService.getCharacterByUserId(req.user.id);

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    return res.json({ character });
  } catch (error) {
    next(error);
  }
};
```

#### Service Layer

```typescript
// services/character.service.ts
import Character from '../models/Character';
import { logger } from '../utils/logger';

export const getCharacterByUserId = async (userId: string) => {
  try {
    const character = await Character.findOne({ userId }).lean();
    return character;
  } catch (error) {
    logger.error('Error fetching character', { userId, error });
    throw error;
  }
};
```

### Comments and Documentation

```typescript
/**
 * Evaluates a Destiny Deck poker hand and calculates total outcome
 *
 * @param cards - Array of 5 cards drawn from deck
 * @param skills - Character's relevant skill levels
 * @returns Hand result with base value and suit bonuses
 *
 * @example
 * const result = evaluateHand(
 *   [ace_spades, king_spades, queen_hearts, jack_hearts, ten_diamonds],
 *   { lockpicking: 45, stealth: 30 }
 * );
 */
function evaluateHand(cards: Card[], skills: Skills): HandResult {
  // Implementation
}

// Use inline comments for complex logic
function calculateSuitBonus(suit: Suit, skillLevel: number): number {
  // Suit bonus = (skill level / 2) * 0.64
  // Cap at 50% to prevent over-optimization
  return Math.min(skillLevel * 0.32, 50);
}
```

---

## Git Workflow

### Branch Naming

```
feature/destiny-deck-evaluation
fix/energy-regeneration-bug
docs/api-documentation
refactor/character-service
test/combat-system
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples

```bash
feat(destiny-deck): implement hand evaluation algorithm

- Add poker hand ranking system
- Calculate suit bonuses based on skills
- Return detailed hand result with breakdown

Closes #42

---

fix(energy): correct regeneration timing

Energy was regenerating too quickly due to incorrect interval calculation.
Changed from 1 minute to 5 minutes as per game design.

Fixes #67

---

docs(api): add authentication endpoint documentation

Added detailed examples for login and register endpoints,
including request/response schemas and error codes.
```

### Commit Best Practices

- Keep commits atomic (one logical change per commit)
- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Don't commit generated files (build outputs, logs, etc.)

---

## Testing Requirements

### Test Coverage

- All new features must include tests
- Bug fixes should include regression tests
- Aim for >80% code coverage on critical paths

### Backend Testing

```typescript
// __tests__/services/destinyDeck.service.test.ts
import { evaluateHand } from '../services/destinyDeck.service';
import { Card, Suit, Rank } from '../types';

describe('Destiny Deck Service', () => {
  describe('evaluateHand', () => {
    it('should identify a royal flush', () => {
      const cards: Card[] = [
        { suit: Suit.Spades, rank: Rank.Ace },
        { suit: Suit.Spades, rank: Rank.King },
        { suit: Suit.Spades, rank: Rank.Queen },
        { suit: Suit.Spades, rank: Rank.Jack },
        { suit: Suit.Spades, rank: Rank.Ten },
      ];

      const result = evaluateHand(cards, {});

      expect(result.handName).toBe('Royal Flush');
      expect(result.baseValue).toBe(100);
    });

    it('should apply skill bonuses correctly', () => {
      const cards: Card[] = createPairOfAces(); // Helper function
      const skills = { lockpicking: 50 };

      const result = evaluateHand(cards, skills);

      expect(result.suitBonuses.spades).toBeGreaterThan(0);
    });
  });
});
```

### Frontend Testing

```tsx
// __tests__/components/CharacterCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCard } from '../components/CharacterCard';

describe('CharacterCard', () => {
  const mockCharacter = {
    id: '1',
    name: 'Jesse McCree',
    energy: 120,
    faction: 'frontera',
  };

  it('renders character name', () => {
    render(<CharacterCard character={mockCharacter} />);
    expect(screen.getByText('Jesse McCree')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<CharacterCard character={mockCharacter} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(mockCharacter);
  });
});
```

---

## Pull Request Process

### Before Submitting

1. **Update your branch with latest main**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run all checks**
   ```bash
   npm run lint
   npm run format
   npm test
   npm run build
   ```

3. **Update documentation** if needed

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Changes Made
- Implemented X
- Fixed Y
- Updated Z

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. Automated checks must pass (linting, tests, build)
2. At least one maintainer approval required
3. Address all review comments
4. Squash commits if requested
5. Maintainer will merge when approved

---

## Project Structure

### Adding New Features

#### Backend Feature

1. Create route in `server/src/routes/`
2. Create controller in `server/src/controllers/`
3. Create service in `server/src/services/`
4. Add model in `server/src/models/` if needed
5. Add tests in `server/__tests__/`

#### Frontend Feature

1. Create component in `client/src/components/`
2. Add page in `client/src/pages/` if needed
3. Create hook in `client/src/hooks/` if needed
4. Update store in `client/src/store/` if needed
5. Add tests in `client/__tests__/`

#### Shared Types

Put shared types in `shared/types/` so both frontend and backend can use them.

---

## Questions?

- Check [DEVELOPMENT.md](DEVELOPMENT.md) for setup help
- Review existing code for examples
- Ask in community channels (Discord/forums)
- Comment on relevant issues

---

**Thank you for contributing to Desperados Destiny! Every contribution helps build a better frontier.**

*Happy trails, partner!*
