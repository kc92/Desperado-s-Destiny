# Game Mechanics Reference

**Last Updated:** 2025-12-31

Comprehensive reference for Desperados Destiny game systems.

---

## The Destiny Deck System

The core mechanic powering all actions in the game.

### How It Works

1. **Draw Phase:** System draws 5 cards from a standard 52-card deck
2. **Evaluation:** Hand is evaluated for poker combinations
3. **Suit Bonuses:** Player's relevant skills add bonuses based on suits
4. **Resolution:** Final score compared to action difficulty

### Card Values

| Card | Value |
|------|-------|
| 2-10 | Face value |
| Jack | 11 |
| Queen | 12 |
| King | 13 |
| Ace | 14 |

### Hand Rankings

| Hand | Multiplier |
|------|------------|
| High Card | 1.0x |
| Pair | 1.2x |
| Two Pair | 1.4x |
| Three of a Kind | 1.6x |
| Straight | 1.8x |
| Flush | 2.0x |
| Full House | 2.5x |
| Four of a Kind | 3.0x |
| Straight Flush | 4.0x |
| Royal Flush | 5.0x |

### Suit Bonuses

Each suit maps to a skill category:

| Suit | Category | Skills |
|------|----------|--------|
| Spades | Cunning | Lockpicking, Stealth, Trickery, Pickpocketing |
| Hearts | Spirit | Medicine, Charm, Survival, Morale |
| Clubs | Combat | Shooting, Fighting, Intimidation |
| Diamonds | Craft | Smithing, Leatherworking, Cooking, Mining |

**Formula:** Suit Bonus = (Skill Level / 50) * Sum of Suit Card Values

### Example Resolution

```
Action: Pick a Lock (Difficulty 100)
Player: Lockpicking Level 30

Draw: A♠ K♠ 7♣ 3♥ 3♦

Hand: Pair of 3s (1.2x multiplier)
Base Score: 14 + 13 + 7 + 3 + 3 = 40 × 1.2 = 48
Spade Bonus: (30/50) × (14 + 13) = 0.6 × 27 = 16.2
Final Score: 48 + 16.2 = 64.2

Result: FAILURE (64 < 100)
```

**Key File:** `server/src/services/actionDeck.service.ts`

---

## Action Types

### CRIME Actions (Spades)

Criminal activities with risk/reward mechanics.

| Property | Description |
|----------|-------------|
| `jailTimeOnFailure` | Minutes in jail if caught |
| `wantedLevelIncrease` | 0-5 scale increase |
| `witnessChance` | Probability of detection (0-100%) |
| `bailCost` | Gold to escape jail early |

**Crime Categories:**
- Pickpocketing (low risk, low reward)
- Burglary (medium risk)
- Robbery (high risk)
- Heisting (very high risk)
- Assassination (extreme risk)

**Criminal Skills Required:**
| Skill | Training Time | Category |
|-------|---------------|----------|
| Pickpocketing | 1 hour/level | Cunning |
| Burglary | 1.2 hours/level | Cunning |
| Robbery | 1.5 hours/level | Combat |
| Heisting | 2 hours/level | Cunning |
| Assassination | 2.5 hours/level | Combat |

**Key File:** `server/src/services/crime.service.ts`

### COMBAT Actions (Clubs)

Fighting and dueling mechanics.

| Type | Description |
|------|-------------|
| PvE | Combat against NPCs |
| PvP Duel | Player vs player |
| Boss | Special encounters |
| Tournament | Organized competitions |

**Key File:** `server/src/services/combat.service.ts`

### CRAFT Actions (Diamonds)

Item creation and production.

| Property | Description |
|----------|-------------|
| Materials | Required ingredients |
| Time | Crafting duration |
| Quality | Result quality (Common → Legendary) |

**Key File:** `server/src/services/crafting.service.ts`

### SOCIAL Actions (Hearts)

Interaction and negotiation.

| Type | Description |
|------|-------------|
| Persuasion | Convince NPCs |
| Gossip | Gather information |
| Trading | Better prices |

---

## Energy System

Resource limiting action frequency.

### Base Values

| Tier | Max Energy | Regen Rate |
|------|------------|------------|
| Free | 150 | 5/hour |
| Premium | 250 | 8/hour |

### Energy Costs

| Action Type | Cost Range |
|-------------|------------|
| Basic Crime | 10 |
| Complex Crime | 15-25 |
| Combat | 15-30 |
| Crafting | 5-15 |
| Gathering | 5-15 |
| Travel | 10-20 |

**Key File:** `server/src/services/energy.service.ts`

---

## Skill System

Long-term progression through time-based training.

### Skill Categories

| Category | Skills | Primary Suit |
|----------|--------|--------------|
| Combat | Shooting, Fighting, Intimidation, Tactics | Clubs |
| Cunning | Lockpicking, Stealth, Trickery, Pickpocketing | Spades |
| Spirit | Medicine, Charm, Survival, Morale, Tracking | Hearts |
| Craft | Smithing, Leatherworking, Cooking, Mining | Diamonds |

### Training Mechanics

- **Real-time:** Training continues when logged out
- **Time per level:** 1-2.5 hours depending on skill
- **Max level:** 50
- **Benefits:** Increases Destiny Deck suit bonuses

### XP Progression

| Level | Total XP Required |
|-------|-------------------|
| 1 | 0 |
| 10 | ~10,000 |
| 25 | ~250,000 |
| 50 | ~3,560,000 |

**Formula:** XP = BaseXP * (1.15 ^ Level)

**Key File:** `server/src/services/skill.service.ts`

---

## Gang System

Player organizations with shared resources.

### Hierarchy

| Role | Permissions |
|------|-------------|
| Leader | All permissions, transfer leadership |
| Officer | Invite, kick, access bank |
| Member | Access gang features, participate in wars |

### Gang Upgrades

| Upgrade | Effect |
|---------|--------|
| Vault | Increase bank capacity |
| Barracks | Increase member slots |
| War Chest | Increase war funding |
| Perks | Various bonuses |

### Gang Wars

Territory control through organized PvP.

**Phases:**
1. Declaration (24 hours)
2. Preparation (12 hours)
3. War (48 hours)
4. Resolution

**Key Files:**
- `server/src/services/gang.service.ts`
- `server/src/services/gangWar.service.ts`

---

## Territory Control

Faction warfare for map control.

### Influence System

| Source | Influence Gain |
|--------|---------------|
| Actions in territory | +1-5 |
| NPC interactions | +2-10 |
| Control point capture | +50 |
| Gang presence | +10/hour |

### Control Levels

| Level | Effect |
|-------|--------|
| 0-25% | Neutral |
| 25-50% | Contested |
| 50-75% | Majority |
| 75-100% | Controlled |

**Key File:** `server/src/services/territory.service.ts`

---

## Economy

Gold and marketplace systems.

### Income Sources

| Source | Amount |
|--------|--------|
| Crime rewards | 10-500 gold |
| Quest rewards | 50-1000 gold |
| Selling items | Market value |
| Property income | Passive generation |

### Marketplace

| Feature | Description |
|---------|-------------|
| Auctions | Time-limited bidding |
| Buy-now | Instant purchase |
| Price history | 30-day tracking |

**Key File:** `server/src/services/marketplace.service.ts`

---

## Property System

Real estate ownership and management.

### Property Types

| Type | Features |
|------|----------|
| Urban | Business, housing |
| Ranch | Livestock, farming |
| Mining | Resource extraction |
| Wilderness | Hunting, foraging |

### Management

- Workers generate production
- Tax payments required
- Foreclosure on missed payments

**Key File:** `server/src/services/property.service.ts`

---

## Professions

Gathering and production activities.

### Gathering

| Profession | Resources | Locations |
|------------|-----------|-----------|
| Mining | Ore, gems | Mines, mountains |
| Herbalism | Plants, herbs | Forests, meadows |
| Fishing | Fish | Rivers, lakes |
| Hunting | Meat, pelts | Wilderness |

### Crafting

| Category | Products |
|----------|----------|
| Smithing | Weapons, tools |
| Leatherworking | Armor, bags |
| Cooking | Food, buffs |
| Alchemy | Potions, poisons |

---

## Known Issues (From Playtest)

| Priority | Issue | Status |
|----------|-------|--------|
| P0 | Gathering items not added to inventory | In backlog |
| P1 | Skill training button no feedback | In backlog |
| P1 | XP pacing too fast | In backlog |
| P2 | Card onClick accessibility | In backlog |

See `.agent-session/feature_list.json` for full task backlog.

---

## Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [Economy Systems](economy.md)
- [Progression Systems](progression.md)

---

*All mechanics subject to balance adjustments.*
