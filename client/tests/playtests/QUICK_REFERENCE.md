# Page Objects Quick Reference

## Import
```typescript
import {
  LoginPage,
  CharacterSelectionPage,
  GameDashboardPage,
  CombatPage,
  ShopPage,
  InventoryPage,
  GangPage,
  MailPage,
  FriendsPage,
  ChatPage,
  SkillsPage,
  QuestPage,
  LocationPage,
  LeaderboardPage,
  ActionsPage
} from '../utils/index.js';
```

## Quick Setup
```typescript
class MyBot extends BotBase {
  private combatPage: CombatPage;
  private shopPage: ShopPage;

  constructor(config: BotConfig) {
    super(config);
    this.combatPage = new CombatPage(this.page!);
    this.shopPage = new ShopPage(this.page!);
  }
}
```

## Common Patterns

### Login
```typescript
const loginPage = new LoginPage(page);
await loginPage.login('username', 'password');
```

### Combat
```typescript
const combat = new CombatPage(page);
await combat.startCombat();

while (await combat.isCombatActive()) {
  await combat.attack();
  if (await combat.checkVictory()) break;
}

await combat.closeCombat();
```

### Shopping
```typescript
const shop = new ShopPage(page);

if (await shop.canAfford('Revolver', gold)) {
  await shop.buyItem('Revolver');
} else {
  await shop.buyRandomItem();
}
```

### Skills
```typescript
const skills = new SkillsPage(page);
await skills.trainSkill('Combat Mastery');
// or
await skills.trainRandomSkill();
```

### Gang
```typescript
const gang = new GangPage(page);

if (await gang.isInGang()) {
  await gang.contribute(100);
  await gang.sendChatMessage('Hello!');
} else {
  await gang.joinGang();
}
```

### Mail
```typescript
const mail = new MailPage(page);
await mail.sendMail('PlayerName', 'Subject', 'Message text');
```

### Friends
```typescript
const friends = new FriendsPage(page);
await friends.addFriend('PlayerName');
await friends.acceptRequest();
```

### Chat
```typescript
const chat = new ChatPage(page);
await chat.sendMessage('Hello world!');
```

### Quests
```typescript
const quests = new QuestPage(page);

if (await quests.getAvailableQuestCount() > 0) {
  await quests.acceptQuest();
  await quests.startQuest();
}
```

### Location
```typescript
const location = new LocationPage(page);
await location.travelTo('Dusty Gulch');
await location.explore();
```

### Dashboard Navigation
```typescript
const dashboard = new GameDashboardPage(page);
await dashboard.navigateTo('combat');
await dashboard.navigateTo('shop');

const gold = await dashboard.getGold();
const energy = await dashboard.getEnergy();
```

## All Methods by Page

### LoginPage
- `login(username, password)` → boolean
- `goToRegister()` → boolean
- `goToForgotPassword()` → boolean
- `isDisplayed()` → boolean

### CharacterSelectionPage
- `selectCharacter()` → boolean
- `createCharacter(name)` → boolean
- `getCharacterCount()` → number
- `isDisplayed()` → boolean

### GameDashboardPage
- `navigateTo(pageName)` → boolean
- `getGold()` → number
- `getEnergy()` → number
- `isDisplayed()` → boolean

### CombatPage
- `startCombat()` → boolean
- `attack()` → boolean
- `defend()` → boolean
- `useSkill()` → boolean
- `flee()` → boolean
- `checkVictory()` → boolean
- `checkDefeat()` → boolean
- `isCombatActive()` → boolean
- `closeCombat()` → boolean

### ShopPage
- `buyRandomItem()` → boolean
- `buyItem(itemName)` → boolean
- `getItemCount()` → number
- `canAfford(itemName, gold)` → boolean

### InventoryPage
- `sellRandomItem()` → boolean
- `useItem(itemName)` → boolean
- `getItemCount()` → number
- `isFull()` → boolean

### GangPage
- `joinGang()` → boolean
- `createGang(name)` → boolean
- `contribute(amount)` → boolean
- `sendChatMessage(message)` → boolean
- `isInGang()` → boolean

### MailPage
- `sendMail(recipient, subject, message)` → boolean
- `getUnreadCount()` → number
- `deleteMail()` → boolean

### FriendsPage
- `addFriend(username)` → boolean
- `acceptRequest()` → boolean
- `getRequestCount()` → number
- `getFriendCount()` → number

### ChatPage
- `sendMessage(message)` → boolean
- `getMessageCount()` → number
- `switchChannel(channelName)` → boolean

### SkillsPage
- `trainSkill(skillName)` → boolean
- `trainRandomSkill()` → boolean
- `getSkillCount()` → number
- `getTrainableCount()` → number

### QuestPage
- `acceptQuest()` → boolean
- `startQuest()` → boolean
- `completeQuest()` → boolean
- `getAvailableQuestCount()` → number
- `getActiveQuestCount()` → number
- `hasQuest(questName)` → boolean

### LocationPage
- `travelTo(locationName)` → boolean
- `travelRandom()` → boolean
- `explore()` → boolean
- `getLocationCount()` → number
- `isAtLocation(locationName)` → boolean

### LeaderboardPage
- `filterBy(category)` → boolean
- `getPlayerRank(username)` → number
- `getPlayerCount()` → number

### ActionsPage
- `performAction(actionName)` → boolean
- `getActionCount()` → number
- `isActionAvailable(actionName)` → boolean
