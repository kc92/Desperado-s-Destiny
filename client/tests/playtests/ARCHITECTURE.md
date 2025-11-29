# Page Object Pattern Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BOT LAYER                                 │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  CombatBot   │  │  EconomyBot  │  │  SocialBot   │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                     │
│         └──────────────────┼──────────────────┘                     │
│                            │                                        │
│                            ↓                                        │
│                   ┌────────────────┐                               │
│                   │   BotBase      │                               │
│                   └────────┬───────┘                               │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────────┐
│                   PAGE OBJECT LAYER                                │
│                             │                                       │
│      ┌──────────────────────┼──────────────────────┐               │
│      │                      │                      │               │
│      ↓                      ↓                      ↓               │
│  ┌─────────┐          ┌──────────┐          ┌──────────┐          │
│  │ Combat  │          │   Shop   │          │   Gang   │          │
│  │  Page   │          │   Page   │          │   Page   │          │
│  └────┬────┘          └────┬─────┘          └────┬─────┘          │
│       │                    │                     │                 │
│  ┌─────────┐          ┌──────────┐          ┌──────────┐          │
│  │  Skills │          │Inventory │          │   Mail   │          │
│  │  Page   │          │   Page   │          │   Page   │          │
│  └────┬────┘          └────┬─────┘          └────┬─────┘          │
│       │                    │                     │                 │
│       └────────────────────┼─────────────────────┘                 │
│                            │                                       │
│                            ↓                                       │
│                    ┌───────────────┐                              │
│                    │   BasePage    │                              │
│                    └───────┬───────┘                              │
└────────────────────────────┼──────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                   SELECTOR LAYER                                  │
│                            │                                       │
│                            ↓                                       │
│              ┌─────────────────────────┐                          │
│              │    BotSelectors.ts      │                          │
│              │                         │                          │
│              │  • clickButtonByText    │                          │
│              │  • typeByPlaceholder    │                          │
│              │  • hasElementWithText   │                          │
│              │  • getElementCount      │                          │
│              │  • navigateByHref       │                          │
│              └────────┬────────────────┘                          │
│                       │                                            │
│              ┌────────┴────────────────┐                          │
│              │  PuppeteerHelpers.ts    │                          │
│              │                         │                          │
│              │  • findButtonByText     │                          │
│              │  • findButtonsByText    │                          │
│              │  • waitAndClickButton   │                          │
│              └────────┬────────────────┘                          │
└──────────────────────┼───────────────────────────────────────────┘
                       │
                       ↓
              ┌────────────────┐
              │   Puppeteer    │
              │   Browser      │
              └────────────────┘
```

## Data Flow

### Before Page Objects (Direct Selector Access)

```
Bot Method
    ↓
BotSelectors.clickButtonByText(page, 'Fight', 'Attack')
    ↓
Puppeteer page.evaluate()
    ↓
DOM Manipulation
```

**Problems:**
- Selectors scattered across bot files
- Duplicate selector definitions
- Hard to maintain

### After Page Objects (Abstracted Selector Access)

```
Bot Method
    ↓
combatPage.attack()
    ↓
BotSelectors.clickButtonByText(page, ...selectors.attackButton)
    ↓
Puppeteer page.evaluate()
    ↓
DOM Manipulation
```

**Benefits:**
- Selectors centralized in PageObjects
- Single source of truth
- Easy to maintain

## Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                      Import Chain                           │
└─────────────────────────────────────────────────────────────┘

Bot File (CombatBot.ts)
    ↓ imports
utils/index.ts
    ↓ exports
PageObjects.ts + BotSelectors.ts + BotBase.ts
    ↓ imports
Puppeteer Types
```

## Usage Pattern

```typescript
// 1. Initialize Page Objects (Once in Constructor)
class MyBot extends BotBase {
  private combatPage: CombatPage;

  constructor(config: BotConfig) {
    super(config);
    this.combatPage = new CombatPage(this.page!);
  }

  // 2. Use Page Objects (Throughout Bot Methods)
  async runBehaviorLoop() {
    // Clean, self-documenting code
    await this.combatPage.startCombat();
    await this.combatPage.attack();

    if (await this.combatPage.checkVictory()) {
      await this.combatPage.closeCombat();
    }
  }
}
```

## Page Object Structure

```
BasePage (Abstract Base)
├── Common functionality
│   ├── waitRandom()
│   ├── isActive()
│   └── screenshot()
│
CombatPage extends BasePage
├── Selectors (Private)
│   ├── attackButton: ['Fight', 'Attack', 'Strike']
│   ├── defendButton: ['Defend', 'Block']
│   └── victoryText: ['Victory', 'Won']
│
└── Methods (Public)
    ├── startCombat(): boolean
    ├── attack(): boolean
    ├── defend(): boolean
    ├── checkVictory(): boolean
    └── closeCombat(): boolean
```

## Integration Points

### 1. Bot Base Integration
```
BotBase
├── page: Page (Puppeteer)
├── logger: BotLogger
├── metrics: BotMetrics
└── helpers (navigateTo, getGold, getEnergy)

Page Objects receive the same `page` instance
└── All page objects share the same browser page
```

### 2. Selector Integration
```
PageObjects use BotSelectors utilities
├── clickButtonByText()
├── typeByPlaceholder()
├── hasElementWithText()
└── getElementCount()

No duplicate selector logic
└── Reuses tested utility functions
```

### 3. Type Safety
```
TypeScript Compiler
├── Validates page object usage
├── Provides autocomplete
├── Catches errors at compile time
└── Enforces return types
```

## Selector Management

### Centralized Selectors
```typescript
// In PageObjects.ts
export class CombatPage extends BasePage {
  private selectors = {
    attackButton: ['Fight', 'Attack', 'Strike'],
    defendButton: ['Defend', 'Block', 'Guard'],
    victoryText: ['Victory', 'Won', 'Defeated']
  };

  async attack(): Promise<boolean> {
    return await clickButtonByText(
      this.page,
      ...this.selectors.attackButton  // Spread array
    );
  }
}
```

### Updating Selectors
```
UI Change: Button text changes from "Fight" to "Battle"

1. Update in ONE place:
   PageObjects.ts → CombatPage → selectors.attackButton

2. Change:
   attackButton: ['Fight', 'Attack', 'Strike', 'Battle']

3. Result:
   All bots using combatPage.attack() now work with new text
```

## Testing Architecture

```
Unit Tests
├── Test individual page object methods
├── Mock Puppeteer Page
└── Verify selector logic

Integration Tests
├── Test page objects with real browser
├── Verify actual DOM interactions
└── Test full user flows

Bot Tests
├── Test bots using page objects
├── Verify bot behavior
└── Test metrics and logging
```

## File Organization

```
client/tests/playtests/
│
├── utils/                    # Shared utilities
│   ├── BotBase.ts           # Base bot class
│   ├── BotLogger.ts         # Logging
│   ├── BotMetrics.ts        # Metrics
│   ├── BotSelectors.ts      # Selector helpers
│   ├── PuppeteerHelpers.ts  # Puppeteer utilities
│   ├── PageObjects.ts       # ⭐ Page Objects (NEW)
│   └── index.ts             # ⭐ Central exports (NEW)
│
├── bots/                    # Bot implementations
│   ├── CombatBot.ts        # Uses page objects
│   ├── EconomyBot.ts       # Uses page objects
│   └── SocialBot.ts        # Uses page objects
│
├── examples/                # Example code
│   └── PageObjectExample.ts # ⭐ Usage examples (NEW)
│
└── Documentation           # Documentation files
    ├── PAGE_OBJECT_PATTERN.md
    ├── QUICK_REFERENCE.md
    ├── FILE_STRUCTURE.md
    └── ARCHITECTURE.md     # ⭐ This file
```

## Benefits Visualization

```
┌─────────────────────────────────────────────────────────┐
│                 BEFORE (Scattered)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CombatBot.ts                                          │
│    ↓ clickButtonByText(page, 'Fight', 'Attack')       │
│    ↓ hasElementWithText(page, 'Victory')              │
│                                                         │
│  EconomyBot.ts                                         │
│    ↓ clickButtonByText(page, 'Fight', 'Attack')       │
│    ↓ hasElementWithText(page, 'Victory')              │
│                                                         │
│  SocialBot.ts                                          │
│    ↓ clickButtonByText(page, 'Fight', 'Attack')       │
│    ↓ hasElementWithText(page, 'Victory')              │
│                                                         │
│  Problem: Selectors duplicated 3+ times                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 AFTER (Centralized)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PageObjects.ts                                        │
│    ↓ CombatPage.attack()                              │
│      └─ selectors.attackButton: ['Fight', 'Attack']   │
│    ↓ CombatPage.checkVictory()                        │
│      └─ selectors.victoryText: ['Victory']            │
│                                                         │
│  CombatBot.ts    → combatPage.attack()                │
│  EconomyBot.ts   → combatPage.attack()                │
│  SocialBot.ts    → combatPage.attack()                │
│                                                         │
│  Solution: Selectors defined once, used everywhere     │
└─────────────────────────────────────────────────────────┘
```

## Evolution Path

```
Phase 1 (Current): Page Objects Created
├── 15 page object classes
├── 100+ methods
└── Full documentation

Phase 2 (Next): Bot Migration
├── CombatBot uses page objects
├── EconomyBot uses page objects
└── SocialBot uses page objects

Phase 3 (Future): Expansion
├── New page objects as needed
├── Additional helper methods
└── Enhanced testing
```

## Summary

The Page Object Pattern provides:

✅ **Clear Architecture** - Separation of concerns
✅ **Maintainability** - Single source of truth
✅ **Reusability** - Use across all bots
✅ **Type Safety** - Full TypeScript support
✅ **Testability** - Easy to mock and test
✅ **Scalability** - Easy to add new pages

The architecture is production-ready and follows industry best practices for UI automation frameworks.
