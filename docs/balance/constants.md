# Desperados Destiny - Balance Constants Reference

Comprehensive reference for all game balance values and configuration constants.

---

## Table of Contents

1. [Energy System](#energy-system)
2. [Character Progression](#character-progression)
3. [Currency & Economy](#currency--economy)
4. [Combat System](#combat-system)
5. [Skills System](#skills-system)
6. [Gangs & Territory](#gangs--territory)
7. [Properties & Income](#properties--income)
8. [Activities](#activities)
9. [Rate Limits & Security](#rate-limits--security)

---

## Energy System

### Energy Capacities

| Player Type | Max Energy | Regen Time | Regen/Hour |
|-------------|------------|------------|------------|
| Free | 150 | 5 hours | 30/hour |
| Premium | 250 | 3.33 hours | 75/hour |

**Premium Advantage**: 2.5x faster regeneration rate.

### Energy Costs

| Action Type | Base Cost |
|-------------|-----------|
| Rest | 0 |
| Social | 5 |
| Explore | 10 |
| Challenge | 10 |
| Craft | 10 |
| Travel | 15 |
| Combat | 15 |
| Quest | 20 |

### Level-Scaled Energy Costs

Energy costs scale with character level to prevent high-level grinding abuse:

| Level Range | Multiplier | Example (Combat 15) |
|-------------|------------|---------------------|
| 1-10 | 1.0x | 15 energy |
| 11-25 | 1.25x | 18.75 → 19 energy |
| 26-40 | 1.5x | 22.5 → 23 energy |
| 41-50 | 2.0x | 30 energy |

---

## Character Progression

### Level System

| Parameter | Value |
|-----------|-------|
| Minimum Level | 1 |
| Maximum Level | 50 |
| Base XP for Level 2 | 100 |
| XP Multiplier per Level | 1.15x |

### XP Requirements by Level

| Level | XP Required | Cumulative XP |
|-------|-------------|---------------|
| 10 | ~357 | ~2,261 |
| 20 | ~1,423 | ~14,232 |
| 30 | ~5,672 | ~89,653 |
| 40 | ~22,612 | ~564,808 |
| 50 | ~90,132 | ~3,560,000 |

**Design Note**: XP multiplier reduced from 1.5 to 1.15 (Phase 19) to make level 50 achievable in 2-3 months of active play rather than being mathematically impossible.

### Level Tiers

| Tier | Levels | Title | Color |
|------|--------|-------|-------|
| 1 | 1-5 | Greenhorn | Gray |
| 2 | 6-10 | Tenderfoot | Green |
| 3 | 11-20 | Frontier Hand | Blue |
| 4 | 21-30 | Trailblazer | Purple |
| 5 | 31-40 | Frontier Veteran | Gold |
| 6 | 41-50 | Legend of the West | Orange |

### Milestone Levels
Levels 10, 20, 30, 40, and 50 grant special bonuses.

### Account Limits

| Limit | Value |
|-------|-------|
| Max Characters per Account | 3 |
| Character Name Min Length | 3 |
| Character Name Max Length | 20 |
| Name Pattern | `[a-zA-Z0-9_-]+` |

---

## Currency & Economy

### Currency Types

| Currency | Symbol | Max Amount | Purpose |
|----------|--------|------------|---------|
| Dollars | $ | 2,147,483,647 | Primary currency |
| Gold | g | 100,000 | Valuable resource |
| Silver | s | 1,000,000 | Common resource |

### Exchange Rates

| Resource | Base Rate | Min Rate | Max Rate | Volatility |
|----------|-----------|----------|----------|------------|
| Gold | $100/unit | $50 | $200 | ±20% |
| Silver | $10/unit | $5 | $25 | ±15% |

**Exchange Fee**: 5% on all resource conversions

### Wealth Tax (Progressive)

Designed to prevent extreme wealth hoarding:

| Wealth Tier | Tax Rate | Daily Tax at Tier Max |
|-------------|----------|----------------------|
| $0 - $100K | 0% | $0 (exempt) |
| $100K - $1M | 0.1% | ~$900/day |
| $1M - $10M | 0.25% | ~$22,500/day |
| $10M - $50M | 0.5% | ~$200,000/day |
| $50M - $100M | 0.8% | ~$400,000/day |
| $100M+ | 1.2% | Scales with wealth |

**Max Daily Tax**: $1,200,000 (absolute cap)
**New Player Grace Period**: 7 days (no tax)

### Newcomer Stake

New players receive bonuses for first 2 hours:
- **Gold Multiplier**: 1.5x (+50%)
- **XP Multiplier**: 1.0x (no bonus)
- **Applies to Premium**: Yes (stacks)

### Marketplace

| Parameter | Value |
|-----------|-------|
| Transaction Tax | 5% |
| Min Listing Duration | 1 hour |
| Max Listing Duration | 168 hours (7 days) |
| Max Active Listings | 20 per character |
| Featured Listing Cost | $100 |
| Auction Extension | 300 seconds (5 min) |
| Price History Retention | 30 days |

---

## Combat System

### Base Combat Values

| Parameter | Value |
|-----------|-------|
| Base Energy Cost | 5 |
| Flee Energy Cost | 3 |
| Max Encounter Duration | 30 minutes |
| Turn Timeout | 60 seconds |
| Max Damage per Hit | 999 |
| Critical Hit Multiplier | 2.0x |
| Flee Base Chance | 30% |

### Poker Hand Damage Multipliers

| Hand | Multiplier |
|------|------------|
| High Card | 1.0x |
| Pair | 1.25x |
| Two Pair | 1.5x |
| Three of a Kind | 1.75x |
| Straight | 2.0x |
| Flush | 2.25x |
| Full House | 2.5x |
| Four of a Kind | 3.0x |
| Straight Flush | 4.0x |
| Royal Flush | 5.0x |

### Combat Ability Thresholds

| Ability | Required Level |
|---------|----------------|
| Reroll | 30+ |
| Peek | 50 |
| Quick Draw | 60+ |
| Deadly Aim | 75+ |

### Skill Damage Bonus (Diminishing Returns)

| Skill Levels | Bonus per Level | Total Bonus |
|--------------|-----------------|-------------|
| 1-10 | +1.0 | +10 |
| 11-25 | +0.5 | +7.5 |
| 26-50 | +0.25 | +6.25 |

**Max per Skill**: +24 damage
**Max Total (all skills)**: +120 damage

### Duel System

| Parameter | Value |
|-----------|-------|
| Minimum Wager | $0 |
| Maximum Wager | $100,000 |
| Turn Timeout | 30 seconds |
| Reconnect Grace | 60 seconds |
| Max Rounds | 5 |
| Challenge Expiration | 5 minutes |
| Ranked Win Points | +25 |
| Ranked Loss Points | -15 |

**Wager Limits**:
- Per Level: Level × $1,000
- Max % of Gold: 10%
- Max Level Difference: 10 levels
- Absolute Minimum: $100

---

## Skills System

### Skill Categories

| Category | Skills | Focus |
|----------|--------|-------|
| Combat | 5 | Fighting prowess |
| Cunning | 9 | Trickery & stealth |
| Spirit | 6 | Social & mystical |
| Craft | 9 | Creating & gathering |

**Total Skills**: 29

### Skill Levels

| Tier | Levels | Title |
|------|--------|-------|
| Novice | 1-10 | Just learning |
| Apprentice | 11-25 | Building competence |
| Journeyman | 26-40 | Skilled practitioner |
| Expert | 41-49 | Near mastery |
| Master | 50 | Peak ability |

### Training Formula

XP required per level: `Level² × 50`

**Time to Max**: ~283 hours to reach level 50 in one skill.

---

## Gangs & Territory

### Gang Creation & Limits

| Parameter | Value |
|-----------|-------|
| Creation Cost | $5,000 |
| Max Members | 50 |
| Max Bank Capacity | $10,000,000 |
| War Declaration Cost | $1,000 |
| Max Concurrent Wars | 3 |
| War Duration | 48 hours |

### Gang Name Limits

| Parameter | Value |
|-----------|-------|
| Min Name Length | 3 |
| Max Name Length | 50 |
| Min Tag Length | 2 |
| Max Tag Length | 4 |

### Raids

| Parameter | Value |
|-----------|-------|
| Energy Cost | 10 |
| Cooldown | 5 minutes |

---

## Properties & Income

### Property Limits

| Parameter | Value |
|-----------|-------|
| Max Properties per Character | 5 |
| Tax Collection Interval | 7 days |
| Tax Grace Period | 3 days |
| Abandonment After Unpaid | 14 days |

### Income Caps (Anti-Inflation)

| Parameter | Value |
|-----------|-------|
| Base Daily Cap | $5,000 |
| Per-Level Bonus | +$100 |
| Multi-Property Diminishing | 0.8x per extra |
| Absolute Max Daily | $25,000 |

**Example**: Level 30 character with 3 properties:
- Property 1: $5,000 + (30 × $100) = $8,000
- Property 2: $8,000 × 0.8 = $6,400
- Property 3: $6,400 × 0.8 = $5,120
- **Total**: $19,520/day (under $25K cap)

---

## Activities

### Hunting

| Parameter | Value |
|-----------|-------|
| Energy Cost | 15 total |
| Max Duration | 60 minutes |
| Tracking Phase | 5 energy, 300s timeout |
| Stalking Phase | 5 energy |
| Shooting Phase | 10 energy, 30s timeout |
| Harvesting | 5 energy |

**Weapon Damage**:
| Weapon | Base Damage |
|--------|-------------|
| Knife | 15 |
| Pistol | 25 |
| Bow | 30 |
| Shotgun | 45 |
| Rifle | 50 |

**Shot Placement Multipliers**:
| Placement | Multiplier |
|-----------|------------|
| Miss | 0x |
| Limb | 0.5x |
| Body | 1.0x |
| Lungs | 1.5x |
| Heart | 1.75x |
| Head | 2.0x |

**Quality Multipliers**:
| Quality | Multiplier |
|---------|------------|
| Poor | 0.5x |
| Common | 1.0x |
| Good | 1.25x |
| Excellent | 1.5x |
| Legendary | 2.0x |

### Gambling

| Parameter | Value |
|-----------|-------|
| Min Bet | $1 |
| Max Bet | $100,000 |
| Max Games per Day | 10 |
| Max Daily Wager | $50,000 |
| House Edge | 5% |
| Session Timeout | 30 minutes |
| Game Cooldown | 5 seconds |
| Max Payout Multiplier | 10x |

**Game House Edges**:
| Game | House Edge |
|------|------------|
| Blackjack | 0.5% |
| Craps | 1.4% |
| Faro | 2% |
| Roulette (European) | 2.7% |
| Roulette (American) | 5.3% |
| Poker | 5% rake |
| Monte | 25% |

### Quests

| Parameter | Value |
|-----------|-------|
| Max Active Quests | 10 |
| Max Daily Quests | 3 |
| Timed Quest Duration | 24 hours |
| Repeatable Cooldown | 24 hours |

---

## Rate Limits & Security

### API Rate Limits

| Endpoint | Max Requests | Window |
|----------|--------------|--------|
| Login | 5 | 15 minutes |
| Registration | 3 | 1 hour |
| Password Reset | 3 | 1 hour |
| Marketplace | 60 | 1 hour |
| Shop | 100 | 1 hour |
| Gold Transfer | 20 | 1 hour |
| Chat | 30 | 1 minute |
| Friend Request | 20 | 1 hour |
| Mail | 30 | 1 hour |
| Admin | 100 | 1 minute |

### Challenge Difficulty Scale

| Difficulty | Value |
|------------|-------|
| Trivial | 1 |
| Easy | 2 |
| Moderate | 3 |
| Challenging | 4 |
| Hard | 5 |
| Very Hard | 6 |
| Extreme | 7 |
| Legendary | 8 |
| Mythic | 9 |
| Impossible | 10 |

---

## Special Systems

### Sanity System

| Parameter | Value |
|-----------|-------|
| Max Sanity | 100 |
| Regen Rate (safe areas) | 5/hour |
| Safe Towns | dusty-springs, frontier-falls, red-rock |

**Sanity States**:
| State | Range | Debuff |
|-------|-------|--------|
| Stable | 80-100 | 0% |
| Rattled | 60-79 | 5% |
| Shaken | 40-59 | 10% |
| Breaking | 20-39 | 20% |
| Shattered | 0-19 | 35% |

### Cosmic Horror

| Parameter | Value |
|-----------|-------|
| Max Corruption | 100 |
| Corruption Decay | 1/hour |
| Hallucination Threshold | 50 |
| Max Encounters per Day | 5 |
| Session Timeout | 30 minutes |

### Destiny Deck

| Parameter | Value |
|-----------|-------|
| Deck Size | 52 cards |
| Hand Size | 5 cards |
| Challenge Draw | 5 cards |
| Max Hand Size | 7 cards |

---

## Faction Starting Stats

| Faction | Cunning | Spirit | Combat | Craft |
|---------|---------|--------|--------|-------|
| Settler Alliance | 10 | 10 | 10 | **15** |
| Nahi Coalition | 10 | **15** | 10 | 10 |
| Frontera | **15** | 10 | 10 | 10 |

---

## Time Constants

| Unit | Milliseconds |
|------|--------------|
| Second | 1,000 |
| Minute | 60,000 |
| Hour | 3,600,000 |
| Day | 86,400,000 |
| Week | 604,800,000 |

---

## Location Configuration

| Parameter | Value |
|-----------|-------|
| Default Spawn | dusty-springs |
| Max Inventory Slots | 100 |
| Max Bank Slots | 200 |

---

*Last updated: December 2024*
