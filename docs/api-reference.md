# Desperados Destiny - API Reference

Complete reference for all REST API endpoints.

**Base URL**: `/api`
**Authentication**: JWT Bearer token (except public endpoints)
**Rate Limiting**: 100 requests/minute per IP (API routes)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Character & Profile](#character--profile)
3. [Skills & Progression](#skills--progression)
4. [Combat & Encounters](#combat--encounters)
5. [Currency & Economy](#currency--economy)
6. [Gangs & Territory](#gangs--territory)
7. [Social Systems](#social-systems)
8. [World & Locations](#world--locations)
9. [Activities & Adventures](#activities--adventures)
10. [Properties & Production](#properties--production)
11. [Crime & Law](#crime--law)
12. [Special Systems](#special-systems)
13. [Admin & Utilities](#admin--utilities)

---

## Authentication

### `POST /api/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "username": "string"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "jwt_token",
  "user": { "id": "...", "email": "...", "username": "..." }
}
```

### `POST /api/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "jwt_token",
  "user": { ... }
}
```

### `POST /api/auth/logout`
Invalidate current session.

### `POST /api/auth/refresh`
Refresh JWT token.

### `POST /api/auth/forgot-password`
Request password reset email.

### `POST /api/auth/reset-password`
Reset password with token.

---

## Character & Profile

### Characters `/api/characters`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List user's characters |
| `POST` | `/` | Create new character |
| `GET` | `/:id` | Get character details |
| `PATCH` | `/:id` | Update character |
| `DELETE` | `/:id` | Delete character |
| `GET` | `/:id/stats` | Get character stats |
| `POST` | `/:id/select` | Set as active character |

### Profiles `/api/profiles`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/:id` | Get public profile |
| `PATCH` | `/` | Update own profile |
| `GET` | `/:id/achievements` | Get player achievements |
| `GET` | `/:id/stats` | Get player statistics |

---

## Skills & Progression

### Skills `/api/skills`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all skills with character levels |
| `GET` | `/:skillId` | Get skill details |
| `POST` | `/:skillId/train` | Train skill (costs energy/gold) |
| `GET` | `/:skillId/progress` | Get XP progress |
| `GET` | `/bonuses` | Get active skill bonuses |

### Achievements `/api/achievements`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all achievements |
| `GET` | `/progress` | Get achievement progress |
| `POST` | `/:id/claim` | Claim achievement reward |
| `GET` | `/categories` | List achievement categories |

### Prestige `/api/prestige`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get prestige status |
| `POST` | `/reset` | Perform prestige reset |
| `GET` | `/bonuses` | Get prestige bonuses |
| `GET` | `/requirements` | Get prestige requirements |

### Legacy `/api/legacy`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get legacy status |
| `GET` | `/unlocks` | Get legacy unlocks |

---

## Combat & Encounters

### Combat `/api/combat`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/start` | Start combat encounter |
| `POST` | `/action` | Perform combat action |
| `POST` | `/hold` | Hold cards (keep for final hand) |
| `POST` | `/discard` | Discard cards (replace) |
| `POST` | `/ability` | Use combat ability |
| `POST` | `/flee` | Attempt to flee |
| `GET` | `/status` | Get current combat state |
| `POST` | `/end` | End combat (claim rewards) |

### Encounters `/api/encounters`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | Get available encounters |
| `POST` | `/random` | Trigger random encounter |
| `GET` | `/:id` | Get encounter details |

### Duels `/api/duels`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/challenge` | Challenge player to duel |
| `POST` | `/:id/accept` | Accept duel challenge |
| `POST` | `/:id/decline` | Decline duel challenge |
| `GET` | `/:id/status` | Get duel status |
| `GET` | `/history` | Get duel history |

### Tournaments `/api/tournaments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List active tournaments |
| `POST` | `/:id/enter` | Enter tournament |
| `GET` | `/:id/bracket` | Get tournament bracket |
| `GET` | `/:id/standings` | Get standings |

### Boss Encounters `/api/boss-encounters`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | List available boss fights |
| `POST` | `/:id/start` | Start boss encounter |
| `POST` | `/:id/action` | Perform boss combat action |
| `GET` | `/:id/status` | Get boss fight status |

### World Bosses `/api/world-bosses`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/active` | Get active world bosses |
| `POST` | `/:id/join` | Join world boss fight |
| `POST` | `/:id/attack` | Attack world boss |
| `GET` | `/:id/leaderboard` | Get contribution rankings |
| `GET` | `/:id/rewards` | Get reward tiers |

### Legendary Hunts `/api/legendary-hunts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/discovered` | List discovered creatures |
| `GET` | `/:id/status` | Get hunt status |
| `POST` | `/:id/track` | Progress tracking |
| `POST` | `/:id/hunt` | Start legendary hunt |

---

## Currency & Economy

### Currency `/api/currency`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/balance` | Get all currency balances |
| `POST` | `/transfer` | Transfer to another player |
| `GET` | `/history` | Get transaction history |

### Gold (Legacy) `/api/gold`
*Redirects to currency routes*

### Bank `/api/bank`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/account` | Get bank account status |
| `POST` | `/deposit` | Deposit dollars |
| `POST` | `/withdraw` | Withdraw dollars |
| `GET` | `/interest` | Get interest rates |
| `GET` | `/vault` | Get vault status |
| `POST` | `/vault/upgrade` | Upgrade vault tier |

### Investments `/api/investments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List investment products |
| `POST` | `/purchase` | Purchase investment |
| `GET` | `/portfolio` | Get current investments |
| `POST` | `/:id/redeem` | Redeem mature investment |

### Marketplace `/api/market`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/listings` | Browse market listings |
| `POST` | `/list` | Create listing |
| `POST` | `/:id/buy` | Purchase listing |
| `POST` | `/:id/bid` | Place bid (auctions) |
| `DELETE` | `/:id` | Cancel listing |
| `GET` | `/my-listings` | Get own listings |
| `GET` | `/history` | Get transaction history |

### Shop `/api/shop`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/items` | Browse shop items |
| `POST` | `/buy` | Purchase item |
| `POST` | `/sell` | Sell item |
| `GET` | `/prices` | Get current prices |

---

## Gangs & Territory

### Gangs `/api/gangs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all gangs |
| `POST` | `/` | Create gang |
| `GET` | `/:id` | Get gang details |
| `PATCH` | `/:id` | Update gang (leader only) |
| `DELETE` | `/:id` | Disband gang |
| `POST` | `/:id/join` | Request to join |
| `POST` | `/:id/leave` | Leave gang |
| `GET` | `/:id/members` | List members |
| `POST` | `/:id/invite` | Invite player |
| `POST` | `/:id/kick` | Kick member |
| `POST` | `/:id/promote` | Promote member |
| `POST` | `/:id/demote` | Demote member |

### Gang Economy `/api/gangs/:gangId/economy`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/treasury` | Get treasury balance |
| `POST` | `/deposit` | Deposit to treasury |
| `POST` | `/withdraw` | Withdraw (officers+) |
| `GET` | `/transactions` | Transaction history |

### Gang Wars `/api/wars`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/active` | List active wars |
| `GET` | `/:id` | Get war details |
| `POST` | `/:id/join` | Join war |
| `POST` | `/:id/contribute` | Contribute to objective |
| `GET` | `/:id/leaderboard` | War leaderboard |
| `GET` | `/:id/objectives` | List objectives |

### Territory `/api/territories`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all territories |
| `GET` | `/:id` | Get territory details |
| `GET` | `/:id/control` | Get control percentages |
| `GET` | `/:id/bonuses` | Get activity bonuses |

### Territory Control `/api/territory`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/influence` | Get influence status |
| `POST` | `/claim` | Claim territory |
| `POST` | `/challenge` | Challenge for control |

### Faction Wars `/api/faction-wars`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List faction wars |
| `GET` | `/:id` | Get war details |
| `POST` | `/:id/join` | Join faction war |
| `GET` | `/:id/stats` | Get war statistics |

### Conquest `/api/conquest`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/targets` | List conquest targets |
| `POST` | `/siege` | Start siege |
| `GET` | `/:id/status` | Get siege status |

### Gang Businesses `/api/gang-businesses`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List gang businesses |
| `POST` | `/purchase` | Purchase business |
| `GET` | `/:id` | Get business details |
| `POST` | `/:id/collect` | Collect revenue |

### Raids `/api/raids`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/targets` | List raid targets |
| `POST` | `/start` | Start raid |
| `GET` | `/:id/status` | Get raid status |
| `POST` | `/:id/action` | Perform raid action |

### NPC Gang Conflicts `/api/npc-gangs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List NPC gangs |
| `GET` | `/:id/relationship` | Get relationship |
| `POST` | `/:id/tribute` | Pay tribute |
| `POST` | `/:id/challenge` | Challenge NPC gang |

---

## Social Systems

### Friends `/api/friends`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List friends |
| `POST` | `/request` | Send friend request |
| `POST` | `/:id/accept` | Accept request |
| `POST` | `/:id/decline` | Decline request |
| `DELETE` | `/:id` | Remove friend |
| `GET` | `/pending` | Get pending requests |

### Mail `/api/mail`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List messages |
| `POST` | `/send` | Send message |
| `GET` | `/:id` | Read message |
| `DELETE` | `/:id` | Delete message |
| `POST` | `/:id/reply` | Reply to message |

### Chat `/api/chat`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/channels` | List available channels |
| `GET` | `/:channel/messages` | Get channel messages |
| `POST` | `/:channel/send` | Send chat message |

### Notifications `/api/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List notifications |
| `POST` | `/:id/read` | Mark as read |
| `POST` | `/read-all` | Mark all as read |
| `DELETE` | `/:id` | Delete notification |

### Leaderboard `/api/leaderboard`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get main leaderboard |
| `GET` | `/wealth` | Wealth rankings |
| `GET` | `/combat` | Combat rankings |
| `GET` | `/reputation` | Reputation rankings |
| `GET` | `/gangs` | Gang rankings |

---

## World & Locations

### Locations `/api/locations`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all locations |
| `GET` | `/:id` | Get location details |
| `POST` | `/:id/travel` | Travel to location |
| `GET` | `/:id/npcs` | List NPCs at location |
| `GET` | `/:id/shops` | List shops at location |
| `GET` | `/:id/jobs` | List available jobs |

### Geography `/api/geography`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/continents` | List continents |
| `GET` | `/regions` | List regions |
| `GET` | `/zones` | List world zones |
| `GET` | `/map` | Get map data |

### World `/api/world`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/events` | Get active world events |
| `GET` | `/status` | Get world status |

### Weather `/api/weather`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/current` | Get current weather |
| `GET` | `/forecast` | Get weather forecast |
| `GET` | `/effects` | Get weather effects |

### Time `/api/time`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/current` | Get game time |
| `GET` | `/period` | Get time period |

### Calendar `/api/calendar`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/today` | Get current date info |
| `GET` | `/season` | Get current season |
| `GET` | `/moon` | Get moon phase |
| `GET` | `/holidays` | List upcoming holidays |

### Frontier Zodiac `/api/zodiac`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/current` | Get current sign |
| `GET` | `/effects` | Get zodiac effects |
| `GET` | `/forecast` | Get celestial forecast |

### Newspaper `/api/newspapers`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List newspapers |
| `GET` | `/:id/latest` | Get latest edition |
| `POST` | `/:id/subscribe` | Subscribe |

---

## Activities & Adventures

### Actions `/api/actions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | List available actions |
| `POST` | `/perform` | Perform action |

### Quests `/api/quests`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | List available quests |
| `GET` | `/active` | List active quests |
| `POST` | `/:id/accept` | Accept quest |
| `POST` | `/:id/complete` | Complete quest |
| `POST` | `/:id/abandon` | Abandon quest |
| `GET` | `/:id/progress` | Get quest progress |

### Daily Contracts `/api/contracts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | List available contracts |
| `GET` | `/active` | List active contracts |
| `POST` | `/:id/accept` | Accept contract |
| `POST` | `/:id/complete` | Complete contract |
| `GET` | `/streak` | Get streak status |

### Hunting `/api/hunting`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/prey` | List available prey |
| `POST` | `/track` | Start tracking |
| `POST` | `/aim` | Aim at target |
| `POST` | `/shoot` | Take the shot |
| `GET` | `/trophies` | List hunting trophies |

### Fishing `/api/fishing`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/spots` | List fishing spots |
| `POST` | `/cast` | Cast line |
| `POST` | `/hook` | Set hook |
| `POST` | `/fight` | Fight fish |
| `POST` | `/land` | Land fish |
| `GET` | `/catches` | List catches |

### Mining `/api/mining`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/claims` | List mining claims |
| `POST` | `/claim` | Stake claim |
| `POST` | `/:id/prospect` | Prospect claim |
| `POST` | `/:id/mine` | Mine resources |
| `GET` | `/:id/yield` | Get yield status |

### Deep Mining `/api/deep-mining`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/shafts` | List shafts |
| `POST` | `/excavate` | Excavate new shaft |
| `POST` | `/:id/explore` | Explore shaft |
| `GET` | `/:id/resources` | Get vein resources |

### Horse Racing `/api/racing`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/events` | List racing events |
| `POST` | `/:id/enter` | Enter race |
| `POST` | `/:id/bet` | Place bet |
| `GET` | `/:id/results` | Get race results |

### Horses `/api/horses`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List owned horses |
| `POST` | `/buy` | Purchase horse |
| `GET` | `/:id` | Get horse details |
| `POST` | `/:id/train` | Train horse |
| `POST` | `/:id/breed` | Breed horses |
| `POST` | `/:id/care` | Care for horse |

### Gambling `/api/gambling`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/games` | List available games |
| `POST` | `/blackjack/start` | Start blackjack |
| `POST` | `/blackjack/hit` | Hit |
| `POST` | `/blackjack/stand` | Stand |
| `POST` | `/poker/start` | Start poker |
| `POST` | `/dice/roll` | Roll dice |
| `GET` | `/limits` | Get daily limits |

### Stagecoach `/api/stagecoach`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/routes` | List routes |
| `POST` | `/ticket` | Buy ticket |
| `POST` | `/ride` | Begin journey |
| `POST` | `/rob` | Attempt robbery |

### Train `/api/trains`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/schedule` | Get train schedule |
| `POST` | `/board` | Board train |
| `POST` | `/rob` | Rob train |

### Cattle Drives `/api/cattle-drives`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/routes` | List drive routes |
| `POST` | `/start` | Start cattle drive |
| `GET` | `/:id/status` | Get drive status |
| `POST` | `/:id/action` | Perform drive action |

### Heists `/api/heists`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | List available heists |
| `POST` | `/plan` | Plan heist |
| `POST` | `/:id/execute` | Execute heist |
| `GET` | `/:id/status` | Get heist status |

### Crafting `/api/crafting`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/recipes` | List known recipes |
| `POST` | `/craft` | Craft item |
| `GET` | `/materials` | List materials needed |

### Workshops `/api/workshops`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | List workshops |
| `POST` | `/:id/use` | Use workshop |
| `POST` | `/:id/repair` | Repair item |
| `POST` | `/:id/masterwork` | Create masterwork |

### Companions `/api/companions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List companions |
| `POST` | `/tame` | Tame animal |
| `POST` | `/:id/train` | Train companion |
| `POST` | `/:id/equip` | Equip companion |
| `GET` | `/:id/abilities` | Get abilities |

---

## Properties & Production

### Properties `/api/properties`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List owned properties |
| `GET` | `/available` | List for sale |
| `POST` | `/purchase` | Buy property |
| `GET` | `/:id` | Get property details |
| `POST` | `/:id/upgrade` | Upgrade property |
| `POST` | `/:id/collect` | Collect income |
| `POST` | `/:id/sell` | Sell property |

### Production `/api/production`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get production status |
| `POST` | `/start` | Start production |
| `POST` | `/collect` | Collect products |
| `GET` | `/queue` | Get production queue |

### Workers `/api/workers`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List workers |
| `POST` | `/hire` | Hire worker |
| `POST` | `/:id/assign` | Assign to property |
| `POST` | `/:id/train` | Train worker |
| `POST` | `/:id/fire` | Fire worker |
| `GET` | `/:id/morale` | Get morale |
| `POST` | `/:id/pay` | Pay wages |

### Tasks `/api/tasks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List tasks |
| `POST` | `/assign` | Assign task |
| `GET` | `/:id/status` | Get task status |
| `POST` | `/:id/complete` | Complete task |

### Businesses `/api/businesses`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List businesses |
| `POST` | `/purchase` | Purchase business |
| `GET` | `/:id` | Get business details |
| `POST` | `/:id/manage` | Manage business |
| `GET` | `/:id/revenue` | Get revenue |

### Property Tax `/api/property-tax`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/owed` | Get taxes owed |
| `POST` | `/pay` | Pay taxes |
| `POST` | `/auto-pay` | Enable auto-pay |

### Foreclosure `/api/foreclosure`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auctions` | List foreclosure auctions |
| `POST` | `/:id/bid` | Bid on property |

### Maintenance `/api/maintenance`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get maintenance status |
| `POST` | `/repair` | Repair property |
| `GET` | `/costs` | Get maintenance costs |

### Incidents `/api/incidents`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/active` | List active incidents |
| `POST` | `/:id/respond` | Respond to incident |
| `GET` | `/history` | Get incident history |

---

## Crime & Law

### Crimes `/api/crimes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | List available crimes |
| `POST` | `/commit` | Commit crime |
| `GET` | `/history` | Get crime history |
| `GET` | `/heat` | Get heat level |

### Bounty `/api/bounty`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get wanted status |
| `GET` | `/value` | Get bounty value |
| `POST` | `/clear` | Pay to clear bounty |

### Bounty Hunters `/api/bounty-hunters`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/pursuing` | List hunters after you |
| `POST` | `/evade` | Attempt evasion |

### Bounty Hunting `/api/bounty-hunting`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/targets` | List bounty targets |
| `POST` | `/hunt` | Hunt target |
| `POST` | `/:id/capture` | Capture target |
| `GET` | `/portfolio` | Get hunting portfolio |

### Jail `/api/jail`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get jail status |
| `POST` | `/escape` | Attempt escape |
| `POST` | `/bail` | Pay bail |
| `GET` | `/time` | Get remaining time |

### Bribe `/api/bribe`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/targets` | List bribable NPCs |
| `POST` | `/offer` | Offer bribe |
| `GET` | `/success-rate` | Get success rate |

### Disguise `/api/disguise`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | List disguises |
| `POST` | `/apply` | Apply disguise |
| `POST` | `/remove` | Remove disguise |
| `GET` | `/effectiveness` | Get effectiveness |

---

## Special Systems

### Energy `/api/energy`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get energy status |
| `POST` | `/restore` | Use item to restore |
| `GET` | `/regeneration` | Get regen rate |

### Death `/api/death`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get death status |
| `POST` | `/respawn` | Respawn |
| `GET` | `/penalties` | Get death penalties |

### Tutorial `/api/tutorial`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get tutorial progress |
| `POST` | `/advance` | Advance tutorial |
| `POST` | `/skip` | Skip tutorial |
| `POST` | `/:milestone/claim` | Claim milestone reward |

### Karma `/api/karma`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get karma status |
| `GET` | `/dimensions` | Get all dimensions |
| `GET` | `/effects` | Get karma effects |

### Deity Encounters `/api/deity`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/relationship` | Get deity relationships |
| `GET` | `/blessings` | List active blessings |
| `GET` | `/curses` | List active curses |
| `POST` | `/offering` | Make offering |
| `POST` | `/pray` | Pray at shrine |

### Cosmic `/api/cosmic`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/quest` | Get cosmic quest status |
| `POST` | `/investigate` | Investigate mystery |
| `GET` | `/endings` | Get available endings |

### Sanity `/api/sanity`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get sanity status |
| `GET` | `/effects` | Get madness effects |
| `POST` | `/rest` | Recover sanity |

### Rituals `/api/rituals`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | List available rituals |
| `POST` | `/perform` | Perform ritual |
| `GET` | `/requirements` | Get requirements |

### Secrets `/api/secrets`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/discovered` | List discovered secrets |
| `POST` | `/investigate` | Investigate secret |

### Reputation `/api/reputation`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get all faction standings |
| `GET` | `/:factionId` | Get specific faction rep |
| `GET` | `/effects` | Get reputation effects |

### Reputation Spreading `/api/reputation-spreading`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/rumors` | Get spreading rumors |
| `POST` | `/spread` | Spread rumor |

### NPCs `/api/npcs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/:id` | Get NPC details |
| `POST` | `/:id/talk` | Talk to NPC |
| `GET` | `/:id/services` | Get NPC services |

### Gossip `/api/gossip`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get local gossip |
| `POST` | `/spread` | Spread gossip |
| `GET` | `/about/:characterId` | Gossip about player |

### Mentors `/api/mentors`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List available mentors |
| `POST` | `/:id/train` | Train with mentor |
| `GET` | `/:id/bonuses` | Get mentor bonuses |

### Entertainers `/api/entertainers`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List entertainers |
| `POST` | `/:id/watch` | Watch performance |
| `POST` | `/:id/tip` | Tip entertainer |

### Wandering Merchants `/api/merchants`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/discovered` | List discovered merchants |
| `GET` | `/:id/inventory` | Get merchant inventory |
| `POST` | `/:id/buy` | Buy from merchant |
| `GET` | `/:id/trust` | Get trust level |

### Service Providers `/api/service-providers`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List service providers |
| `POST` | `/:id/use` | Use service |

### Chinese Diaspora `/api/diaspora`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/npcs` | List diaspora NPCs |
| `GET` | `/services` | List special services |

### Login Rewards `/api/login-rewards`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get login reward status |
| `POST` | `/claim` | Claim daily reward |
| `GET` | `/streak` | Get login streak |

### Permanent Unlocks `/api/unlocks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List available unlocks |
| `POST` | `/:id/purchase` | Purchase unlock |
| `GET` | `/owned` | List owned unlocks |

### Shooting Contests `/api/shooting`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/events` | List contests |
| `POST` | `/:id/enter` | Enter contest |
| `POST` | `/:id/shoot` | Take shot |

### Deck Game `/api/deck`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cards` | Get deck cards |
| `POST` | `/shuffle` | Shuffle deck |
| `POST` | `/draw` | Draw cards |

### Tracking `/api/tracking`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/start` | Start tracking |
| `GET` | `/trail` | Get current trail |
| `POST` | `/follow` | Follow tracks |

---

## Admin & Utilities

### Health `/api/health`
No authentication required.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Server health check |
| `GET` | `/db` | Database status |
| `GET` | `/redis` | Redis status |

### Admin `/api/admin`
Requires admin role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users |
| `PATCH` | `/users/:id` | Update user |
| `POST` | `/users/:id/ban` | Ban user |
| `GET` | `/stats` | Server statistics |
| `POST` | `/broadcast` | Broadcast message |
| `POST` | `/events/spawn` | Force spawn event |
| `POST` | `/maintenance` | Toggle maintenance |

### Schedule `/api/schedule`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/jobs` | List scheduled jobs |
| `GET` | `/status` | Get scheduler status |

### Mood `/api/moods`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Get character mood |
| `GET` | `/effects` | Get mood effects |

---

## Error Responses

All endpoints may return these error codes:

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Missing/invalid token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Action not allowed in current state |
| `422` | Unprocessable Entity - Business logic error |
| `429` | Too Many Requests - Rate limited |
| `500` | Internal Server Error |

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## WebSocket Events

Real-time communication uses Socket.io on the same server.

### Connection
```javascript
const socket = io('wss://server.com', {
  auth: { token: 'jwt_token' }
});
```

### Channels
- `combat:${encounterId}` - Combat updates
- `duel:${duelId}` - Duel events
- `gang:${gangId}` - Gang notifications
- `world` - World events
- `chat:${channel}` - Chat messages

---

## Rate Limits

| Route Type | Limit |
|------------|-------|
| Authentication | 5/minute per IP |
| API (general) | 100/minute per IP |
| Admin | No limit |
| Health | No limit |

---

*Last updated: December 2024*
