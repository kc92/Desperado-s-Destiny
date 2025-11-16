# SHARED - Common Code

**Shared TypeScript Types, Constants, and Utilities**

This directory contains code shared between the frontend (client) and backend (server) to ensure consistency and avoid duplication.

---

## Directory Structure

```
shared/
├── types/               # TypeScript type definitions
├── constants/           # Shared constants and enums
├── utils/               # Shared utility functions
└── README.md            # This file
```

---

## Purpose

The `shared/` directory eliminates duplication and ensures the client and server:
- Use the **same type definitions** for API requests/responses
- Reference the **same game constants** (skill names, faction IDs, etc.)
- Share **validation logic** and utility functions

---

## Key Directories Explained

### `/types`
TypeScript interfaces and types used by both client and server.

**Example files:**

**`character.types.ts`**
```typescript
export interface Character {
  id: string;
  userId: string;
  name: string;
  faction: Faction;
  level: number;
  experience: number;
  energy: {
    current: number;
    max: number;
    regenRate: number;
  };
  skills: Record<SkillId, number>;
  inventory: InventoryItem[];
  location: LocationId;
  createdAt: Date;
  updatedAt: Date;
}

export type Faction = 'settler' | 'nahi' | 'frontera';
```

**`destinyDeck.types.ts`**
```typescript
export type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type HandRank =
  | 'High Card'
  | 'Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export interface DestinyDeckResult {
  hand: Card[];
  handRank: HandRank;
  suitBonuses: Record<Suit, number>;
  totalScore: number;
  success: boolean;
  outcome: string;
}
```

**`api.types.ts`**
```typescript
// API Request/Response types ensure client and server agree

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  character?: Character;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
```

---

### `/constants`
Game constants, configuration values, and enums.

**Example files:**

**`skills.constants.ts`**
```typescript
export enum SkillCategory {
  Combat = 'combat',
  Criminal = 'criminal',
  Economic = 'economic',
  Social = 'social',
}

export const SKILLS = {
  // Combat
  GUNSLINGING: { id: 'gunslinging', name: 'Gunslinging', category: SkillCategory.Combat, suit: 'clubs' },
  BRAWLING: { id: 'brawling', name: 'Brawling', category: SkillCategory.Combat, suit: 'clubs' },
  TRACKING: { id: 'tracking', name: 'Tracking', category: SkillCategory.Combat, suit: 'spades' },

  // Criminal
  LOCKPICKING: { id: 'lockpicking', name: 'Lockpicking', category: SkillCategory.Criminal, suit: 'spades' },
  STEALTH: { id: 'stealth', name: 'Stealth', category: SkillCategory.Criminal, suit: 'spades' },
  SAFECRACKING: { id: 'safecracking', name: 'Safecracking', category: SkillCategory.Criminal, suit: 'spades' },

  // Economic
  PROSPECTING: { id: 'prospecting', name: 'Prospecting', category: SkillCategory.Economic, suit: 'diamonds' },
  CRAFTING: { id: 'crafting', name: 'Crafting', category: SkillCategory.Economic, suit: 'diamonds' },
  TRADING: { id: 'trading', name: 'Trading', category: SkillCategory.Economic, suit: 'diamonds' },

  // Social
  PERSUASION: { id: 'persuasion', name: 'Persuasion', category: SkillCategory.Social, suit: 'hearts' },
  MEDICINE: { id: 'medicine', name: 'Medicine', category: SkillCategory.Social, suit: 'hearts' },
  SPIRITUALITY: { id: 'spirituality', name: 'Spirituality', category: SkillCategory.Social, suit: 'hearts' },
} as const;

export type SkillId = keyof typeof SKILLS;
```

**`game.constants.ts`**
```typescript
export const ENERGY = {
  FREE_BASE: 150,
  FREE_REGEN: 5,
  PREMIUM_BASE: 250,
  PREMIUM_REGEN: 8,
  REGEN_INTERVAL_MS: 3600000, // 1 hour
} as const;

export const SKILL_TRAINING = {
  BASE_TIME_HOURS: 1,
  MAX_LEVEL: 100,
  BONUS_PER_LEVEL: 0.5, // +0.5 suit bonus per level
} as const;

export const FACTIONS = {
  SETTLER: { id: 'settler', name: 'Settler Alliance', color: '#4682B4' },
  NAHI: { id: 'nahi', name: 'Nahi Coalition', color: '#40E0D0' },
  FRONTERA: { id: 'frontera', name: 'Frontera', color: '#DC143C' },
} as const;
```

**`locations.constants.ts`**
```typescript
export const LOCATIONS = {
  RED_GULCH: { id: 'red-gulch', name: 'Red Gulch', faction: 'settler' },
  FRONTERA_HAVEN: { id: 'frontera-haven', name: 'The Frontera', faction: 'frontera' },
  KAIOWA_MESA: { id: 'kaiowa-mesa', name: 'Kaiowa Mesa', faction: 'nahi' },
  SANGRE_CANYON: { id: 'sangre-canyon', name: 'Sangre Canyon', faction: null },
} as const;

export type LocationId = keyof typeof LOCATIONS;
```

---

### `/utils`
Shared utility functions used by both client and server.

**Example files:**

**`validation.utils.ts`**
```typescript
// Shared validation ensures client and server agree on valid data

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const PASSWORD_MIN_LENGTH = 8;

export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

export function isValidFaction(faction: string): faction is Faction {
  return ['settler', 'nahi', 'frontera'].includes(faction);
}
```

**`calculations.utils.ts`**
```typescript
// Shared game calculations ensure consistency

export function calculateSuitBonus(skillLevel: number): number {
  return skillLevel * 0.5; // +0.5 per level
}

export function calculateEnergyRegen(isPremium: boolean): number {
  return isPremium ? 8 : 5;
}

export function calculateSkillTrainingTime(currentLevel: number): number {
  // Exponential growth: Level 1 = 1 hour, Level 50 = 50 hours, etc.
  return currentLevel * 3600000; // milliseconds
}
```

---

## How to Use Shared Code

### In Server (Backend)
```typescript
// server/src/controllers/character.controller.ts
import { Character, Faction } from '../../../shared/types/character.types';
import { SKILLS } from '../../../shared/constants/skills.constants';
import { isValidFaction } from '../../../shared/utils/validation.utils';

export async function createCharacter(req: Request, res: Response) {
  const { name, faction } = req.body;

  if (!isValidFaction(faction)) {
    return res.status(400).json({ error: 'Invalid faction' });
  }

  const character: Character = {
    // ... use shared types
  };
}
```

### In Client (Frontend)
```typescript
// client/src/services/characterService.ts
import { Character, Faction } from '../../../shared/types/character.types';
import { FACTIONS } from '../../../shared/constants/game.constants';
import { isValidFaction } from '../../../shared/utils/validation.utils';

export async function createCharacter(name: string, faction: Faction): Promise<Character> {
  if (!isValidFaction(faction)) {
    throw new Error('Invalid faction');
  }

  const response = await fetch('/api/character/create', {
    method: 'POST',
    body: JSON.stringify({ name, faction }),
  });

  return response.json();
}
```

---

## Benefits of Shared Code

✅ **Type Safety:** Client and server use identical type definitions
✅ **Single Source of Truth:** Game constants defined once, used everywhere
✅ **Consistency:** Validation and calculations produce same results on both sides
✅ **Refactoring Safety:** Change a type once, TypeScript catches all usages
✅ **Reduced Bugs:** Mismatched API contracts caught at compile time

---

## Build Configuration

Both client and server need to reference the shared directory in their `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

This allows clean imports:
```typescript
import { Character } from '@shared/types/character.types';
import { SKILLS } from '@shared/constants/skills.constants';
```

---

**Status:** Phase 0 - Structure created, types/constants to be defined in Phase 1
**Next Steps:** Create initial type definitions and constants during Phase 1 development

---

*Built by Kaine & Hawk*
*Last Updated: November 15, 2025*
