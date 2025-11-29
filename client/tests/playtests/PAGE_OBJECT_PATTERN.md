# Page Object Pattern Implementation

## Overview

The Page Object Pattern is a design pattern that centralizes all selectors and actions for a specific page into a single class. This makes bot code more maintainable, reusable, and easier to update when the UI changes.

## Benefits

### Before (Scattered Selectors)
```typescript
// Selectors duplicated everywhere
await clickButtonByText(page, 'Attack', 'Strike', 'Shoot');
await hasElementWithText(page, 'Victory');
await clickButtonByText(page, 'Continue', 'Close', 'Done');
```

**Problems:**
- ❌ Selectors duplicated across files
- ❌ Hard to update when UI changes
- ❌ Unclear what each selector does
- ❌ No type safety

### After (Page Objects)
```typescript
const combatPage = new CombatPage(page);
await combatPage.attack();
await combatPage.checkVictory();
await combatPage.closeCombat();
```

**Benefits:**
- ✅ Selectors centralized in one place
- ✅ Update once, works everywhere
- ✅ Self-documenting code
- ✅ Type-safe methods
- ✅ Easy to test and mock

## Available Page Objects

### 1. LoginPage
**Purpose:** Handle login and registration navigation

**Key Methods:**
- `login(username, password)` - Login with credentials
- `goToRegister()` - Navigate to registration
- `isDisplayed()` - Check if login page is shown

**Example:**
```typescript
const loginPage = new LoginPage(page);
await loginPage.login('testuser', 'password123');
```

### 2. CharacterSelectionPage
**Purpose:** Handle character selection and creation

**Key Methods:**
- `selectCharacter()` - Select character and play
- `createCharacter(name)` - Create new character
- `getCharacterCount()` - Count available characters

**Example:**
```typescript
const charPage = new CharacterSelectionPage(page);
await charPage.createCharacter('Gunslinger Jake');
await charPage.selectCharacter();
```

### 3. GameDashboardPage
**Purpose:** Main navigation and stats display

**Key Methods:**
- `navigateTo(pageName)` - Navigate to any game page
- `getGold()` - Get current gold amount
- `getEnergy()` - Get current energy amount

**Example:**
```typescript
const dashboard = new GameDashboardPage(page);
await dashboard.navigateTo('combat');
const gold = await dashboard.getGold();
```

### 4. CombatPage
**Purpose:** Handle combat encounters and battles

**Key Methods:**
- `startCombat()` - Begin combat encounter
- `attack()` - Perform attack action
- `defend()` - Perform defend action
- `useSkill()` - Use special ability
- `checkVictory()` - Check if won
- `checkDefeat()` - Check if lost
- `isCombatActive()` - Check if in combat
- `closeCombat()` - Close combat screen

**Example:**
```typescript
const combat = new CombatPage(page);
await combat.startCombat();

while (await combat.isCombatActive()) {
  await combat.attack();

  if (await combat.checkVictory()) {
    console.log('Won!');
    break;
  }
}

await combat.closeCombat();
```

### 5. ShopPage
**Purpose:** Handle item browsing and purchases

**Key Methods:**
- `buyRandomItem()` - Buy random item
- `buyItem(itemName)` - Buy specific item
- `getItemCount()` - Count items in shop
- `canAfford(itemName, gold)` - Check if item is affordable

**Example:**
```typescript
const shop = new ShopPage(page);

if (await shop.canAfford('Revolver', 500)) {
  await shop.buyItem('Revolver');
} else {
  await shop.buyRandomItem();
}
```

### 6. InventoryPage
**Purpose:** Handle inventory management

**Key Methods:**
- `sellRandomItem()` - Sell random item
- `useItem(itemName)` - Use specific item
- `getItemCount()` - Count items in inventory
- `isFull()` - Check if inventory is full

**Example:**
```typescript
const inventory = new InventoryPage(page);

if (await inventory.isFull()) {
  await inventory.sellRandomItem();
}

await inventory.useItem('Health Potion');
```

### 7. GangPage
**Purpose:** Handle gang interactions and management

**Key Methods:**
- `joinGang()` - Join a gang
- `createGang(name)` - Create new gang
- `contribute(amount)` - Contribute gold to gang
- `sendChatMessage(message)` - Send gang chat
- `isInGang()` - Check if in a gang

**Example:**
```typescript
const gang = new GangPage(page);

if (!await gang.isInGang()) {
  await gang.joinGang();
} else {
  await gang.contribute(100);
  await gang.sendChatMessage('Ready for war!');
}
```

### 8. MailPage
**Purpose:** Handle mail composition and reading

**Key Methods:**
- `sendMail(recipient, subject, message)` - Send mail
- `getUnreadCount()` - Count unread mail
- `deleteMail()` - Delete a mail

**Example:**
```typescript
const mail = new MailPage(page);
await mail.sendMail(
  'PlayerName',
  'Trade Request',
  'Want to trade items?'
);

const unread = await mail.getUnreadCount();
console.log(`${unread} unread messages`);
```

### 9. FriendsPage
**Purpose:** Handle friend management

**Key Methods:**
- `addFriend(username)` - Add friend by username
- `acceptRequest()` - Accept friend request
- `getRequestCount()` - Count pending requests
- `getFriendCount()` - Count friends

**Example:**
```typescript
const friends = new FriendsPage(page);
await friends.addFriend('CoolPlayer123');
await friends.acceptRequest();

const count = await friends.getFriendCount();
console.log(`${count} friends`);
```

### 10. ChatPage
**Purpose:** Handle chat interactions

**Key Methods:**
- `sendMessage(message)` - Send chat message
- `getMessageCount()` - Count messages
- `switchChannel(channelName)` - Switch chat channel

**Example:**
```typescript
const chat = new ChatPage(page);
await chat.sendMessage('Howdy partners!');
await chat.switchChannel('Trade');
```

### 11. SkillsPage
**Purpose:** Handle skill training and progression

**Key Methods:**
- `trainSkill(skillName)` - Train specific skill
- `trainRandomSkill()` - Train random skill
- `getSkillCount()` - Count available skills
- `getTrainableCount()` - Count trainable skills

**Example:**
```typescript
const skills = new SkillsPage(page);
await skills.trainSkill('Combat Mastery');

if (!await skills.trainSkill('Stealth')) {
  // Fallback to random
  await skills.trainRandomSkill();
}
```

### 12. QuestPage
**Purpose:** Handle quest browsing and acceptance

**Key Methods:**
- `acceptQuest()` - Accept a quest
- `startQuest()` - Start a quest
- `completeQuest()` - Complete a quest
- `getAvailableQuestCount()` - Count available quests
- `getActiveQuestCount()` - Count active quests
- `hasQuest(questName)` - Check if quest exists

**Example:**
```typescript
const quests = new QuestPage(page);

if (await quests.getAvailableQuestCount() > 0) {
  await quests.acceptQuest();
  await quests.startQuest();
}
```

### 13. LocationPage
**Purpose:** Handle location navigation and travel

**Key Methods:**
- `travelTo(locationName)` - Travel to specific location
- `travelRandom()` - Travel to random location
- `explore()` - Explore current location
- `getLocationCount()` - Count available locations
- `isAtLocation(locationName)` - Check current location

**Example:**
```typescript
const location = new LocationPage(page);
await location.travelTo('Dusty Gulch');
await location.explore();

if (!await location.isAtLocation('Saloon')) {
  await location.travelRandom();
}
```

### 14. LeaderboardPage
**Purpose:** Handle leaderboard viewing

**Key Methods:**
- `filterBy(category)` - Filter by category
- `getPlayerRank(username)` - Get player rank
- `getPlayerCount()` - Count players

**Example:**
```typescript
const leaderboard = new LeaderboardPage(page);
await leaderboard.filterBy('Combat');

const rank = await leaderboard.getPlayerRank('TestUser');
console.log(`Rank: ${rank}`);
```

### 15. ActionsPage
**Purpose:** Handle action/activity selection

**Key Methods:**
- `performAction(actionName)` - Perform specific action
- `getActionCount()` - Count available actions
- `isActionAvailable(actionName)` - Check action availability

**Example:**
```typescript
const actions = new ActionsPage(page);

if (await actions.isActionAvailable('Rob Bank')) {
  await actions.performAction('Rob Bank');
}
```

## Usage in Bots

### Simple Usage
```typescript
import { CombatPage } from '../utils/PageObjects.js';

class MyBot extends BotBase {
  async runBehaviorLoop() {
    const combatPage = new CombatPage(this.page);
    await combatPage.startCombat();
    await combatPage.attack();
  }
}
```

### Advanced Usage (Initialize Once)
```typescript
import {
  CombatPage,
  ShopPage,
  SkillsPage,
  GangPage
} from '../utils/PageObjects.js';

class MyBot extends BotBase {
  private combatPage: CombatPage;
  private shopPage: ShopPage;
  private skillsPage: SkillsPage;
  private gangPage: GangPage;

  constructor(config: BotConfig) {
    super(config);

    // Initialize page objects once
    this.combatPage = new CombatPage(this.page!);
    this.shopPage = new ShopPage(this.page!);
    this.skillsPage = new SkillsPage(this.page!);
    this.gangPage = new GangPage(this.page!);
  }

  async runBehaviorLoop() {
    // Use page objects throughout bot
    await this.combatPage.startCombat();
    await this.shopPage.buyRandomItem();
    await this.skillsPage.trainRandomSkill();
    await this.gangPage.contribute(100);
  }
}
```

### Import All at Once
```typescript
// Import everything from utils
import {
  BotBase,
  BotConfig,
  CombatPage,
  ShopPage,
  SkillsPage,
  GangPage,
  MailPage,
  FriendsPage
} from '../utils/index.js';
```

## Maintenance

### Updating Selectors
When UI changes, update selectors in ONE place:

**Before:** Update selectors in every bot file (10+ files)
```typescript
// CombatBot.ts
await clickButtonByText(page, 'Fight', 'Attack');

// EconomyBot.ts
await clickButtonByText(page, 'Fight', 'Attack');

// SocialBot.ts
await clickButtonByText(page, 'Fight', 'Attack');
```

**After:** Update selector in PageObjects.ts (1 file)
```typescript
// PageObjects.ts - CombatPage
private selectors = {
  attackButton: ['Fight', 'Attack', 'Strike'], // Add 'Strike'
}
```

### Adding New Methods
Add new methods to page objects as needed:

```typescript
export class CombatPage extends BasePage {
  // Existing methods...

  /**
   * NEW: Use item during combat
   */
  async useItem(itemName: string): Promise<boolean> {
    // Implementation
  }
}
```

## Best Practices

### 1. Initialize Page Objects Once
```typescript
// ✅ Good - Initialize once
constructor() {
  this.combatPage = new CombatPage(this.page);
}

async fight() {
  await this.combatPage.attack();
}

// ❌ Bad - Creating new instances repeatedly
async fight() {
  const combatPage = new CombatPage(this.page); // Wasteful
  await combatPage.attack();
}
```

### 2. Use Descriptive Method Names
```typescript
// ✅ Good
await combatPage.checkVictory();
await shopPage.buyRandomItem();

// ❌ Bad
await combatPage.check();
await shopPage.buy();
```

### 3. Return Meaningful Values
```typescript
// ✅ Good - Returns boolean for success/failure
const success = await loginPage.login('user', 'pass');
if (!success) {
  console.log('Login failed');
}

// ❌ Bad - No return value
await loginPage.login('user', 'pass');
// Did it work? Who knows!
```

### 4. Add Error Handling
```typescript
async attack(): Promise<boolean> {
  try {
    return await clickButtonByText(this.page, ...this.selectors.attackButton);
  } catch (error) {
    console.error('Attack error:', error);
    return false;
  }
}
```

## Testing

Page Objects make testing easier:

```typescript
// Mock a page object for testing
const mockCombatPage = {
  attack: jest.fn().mockResolvedValue(true),
  checkVictory: jest.fn().mockResolvedValue(true),
  closeCombat: jest.fn().mockResolvedValue(true)
};

// Test bot logic without real browser
const result = await mockCombatPage.attack();
expect(result).toBe(true);
```

## File Structure

```
client/tests/playtests/
├── utils/
│   ├── PageObjects.ts        # All page objects (this file)
│   ├── BotSelectors.ts        # Helper functions
│   ├── BotBase.ts            # Base bot class
│   └── index.ts              # Exports everything
├── bots/
│   ├── CombatBot.ts          # Uses page objects
│   ├── EconomyBot.ts         # Uses page objects
│   └── SocialBot.ts          # Uses page objects
└── examples/
    └── PageObjectExample.ts  # Usage examples
```

## Migration Guide

### Step 1: Import Page Objects
```typescript
import {
  CombatPage,
  ShopPage,
  SkillsPage
} from '../utils/PageObjects.js';
```

### Step 2: Initialize in Constructor
```typescript
constructor(config: BotConfig) {
  super(config);
  this.combatPage = new CombatPage(this.page!);
}
```

### Step 3: Replace Scattered Selectors
**Before:**
```typescript
await clickButtonByText(this.page, 'Fight', 'Attack');
const hasVictory = await hasElementWithText(this.page, 'Victory');
```

**After:**
```typescript
await this.combatPage.attack();
const hasVictory = await this.combatPage.checkVictory();
```

## Summary

The Page Object Pattern provides:

✅ **Maintainability** - Update selectors in one place
✅ **Reusability** - Use page objects across all bots
✅ **Readability** - Self-documenting method names
✅ **Type Safety** - TypeScript ensures correct usage
✅ **Testability** - Easy to mock and test

Start using page objects today to make your bot code cleaner and more maintainable!
