# Economy Balance Documentation

**Desperados Destiny - Economic Design and Balance Guide**

Version: 1.0
Last Updated: 2025-11-26
Phase: 15, Wave 15.2

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Economic Systems Overview](#economic-systems-overview)
3. [Balance Targets](#balance-targets)
4. [Gold Economy](#gold-economy)
5. [XP and Progression](#xp-and-progression)
6. [Energy Economy](#energy-economy)
7. [Pricing Systems](#pricing-systems)
8. [Anti-Exploit Measures](#anti-exploit-measures)
9. [Monitoring and Reports](#monitoring-and-reports)
10. [Adjustment Procedures](#adjustment-procedures)
11. [Reference Tables](#reference-tables)

---

## Design Philosophy

### Core Principles

1. **Meaningful Choices**: Every economic decision should matter. Players should feel the weight of purchases, investments, and risks.

2. **Progressive Scaling**: Rewards and costs scale with level, ensuring content remains relevant at all tiers.

3. **Balanced Flow**: Gold earned should roughly equal gold spent over time (1:1 ratio) to prevent inflation or deflation.

4. **Risk vs Reward**: Higher risk activities (crimes, gambling) offer higher rewards but with real consequences.

5. **Time Respect**: Players investing time should feel rewarded. Target: 200-300 hours to max level through varied gameplay.

### Economic Goals

- **Stable Economy**: Gold maintains value across all level ranges
- **Fair Progression**: No pay-to-win, skill and time investment matter most
- **Diverse Income**: Multiple viable paths to earn gold (crimes, combat, crafting, jobs)
- **Meaningful Sinks**: Gold sinks feel worthwhile (property, equipment, services)
- **Anti-Exploitation**: Robust systems prevent duplication and farming exploits

---

## Economic Systems Overview

### Primary Systems

1. **Gold Economy**
   - Primary currency for transactions
   - Earned through: crimes, combat, quests, jobs, crafting, gambling
   - Spent on: equipment, property, services, gang operations, upgrades

2. **XP and Levels**
   - 50 levels total (1-50)
   - 5 tiers: Novice (1-10), Journeyman (11-20), Veteran (21-30), Expert (31-40), Master (41-50)
   - Exponential curve: XP = BASE_XP * (MULTIPLIER ^ (level - 1))

3. **Energy System**
   - Free players: 150 max, 30/hour regen
   - Premium players: 250 max, 31.25/hour regen
   - Actions cost 5-30 energy based on difficulty

4. **Item Economy**
   - 5 rarity tiers: Common, Uncommon, Rare, Epic, Legendary
   - Prices scale with rarity and level tier
   - Regional scarcity affects availability and cost

---

## Balance Targets

### Gold Flow Ratio

**Target: 1.0** (gold earned = gold spent)

- **Warning Range**: 0.8 - 1.2
- **Critical Range**: < 0.8 or > 1.2

**Interpretation**:
- < 0.8: Players spending more than earning (deflation risk)
- 1.0: Perfect balance
- > 1.2: Players earning more than spending (inflation risk)

### Wealth Inequality (Gini Coefficient)

**Target: 0.5**

- **Acceptable Range**: 0.3 - 0.8
- **Warning**: < 0.3 (too equal) or > 0.8 (too unequal)

**Interpretation**:
- 0.0: Perfect equality (unrealistic, lacks progression feel)
- 0.5: Healthy spread showing clear progression
- 1.0: Perfect inequality (broken economy)

### Gold Velocity

**Target: 50 transactions/player/day**

- **Minimum**: 20 (economy too stagnant)
- **Maximum**: 200 (possible exploit activity)

### Expected Gold per Hour (by tier)

| Tier | Target Gold/Hour |
|------|------------------|
| Novice | 300 |
| Journeyman | 1,500 |
| Veteran | 8,000 |
| Expert | 35,000 |
| Master | 120,000 |

---

## Gold Economy

### Gold Sources

#### 1. Crime Activities

**Petty Crimes** (Tier 1)
- Gold: 10-50 per success
- Success Rate: 70%
- Risk: Low (5-15min jail, 100-250 bail)
- Best for: Early game income

**Medium Crimes** (Tier 2-3)
- Gold: 50-800 per success
- Success Rate: 40-50%
- Risk: Medium (25-60min jail, 500-2000 bail)
- Best for: Mid-game income

**Major Crimes** (Tier 3-4)
- Gold: 150-10,000 per success
- Success Rate: 25-30%
- Risk: High (45-180min jail, 600-5000 bail)
- Best for: High risk/reward gameplay

**Epic Crimes** (Tier 4-5)
- Gold: 500-125,000 per success
- Success Rate: 8-15%
- Risk: Extreme (120-480min jail, 2000-30,000 bail)
- Best for: Endgame high-stakes play

#### 2. Combat Encounters

| Type | Gold Range | XP | Loot Chance |
|------|-----------|-----|------------|
| Wildlife | 10-2,500 | 25-1,000 | 50-70% |
| Bandits | 15-4,000 | 30-1,200 | 20-40% |
| Outlaws | 30-8,000 | 50-1,800 | 25-45% |
| Bosses | 200-50,000 | 350-12,000 | 80-100% |

#### 3. Quest Rewards

| Quest Type | Gold | XP | Item Rarity |
|-----------|------|-----|-------------|
| Story | 200-100,000 | 100-5,000 | Common-Legendary |
| Side | 100-50,000 | 50-2,500 | Common-Epic |
| Daily | 50-25,000 | 30-1,200 | Common-Rare |
| Repeatable | 25-12,000 | 20-750 | Common-Uncommon |

#### 4. Jobs (Honest Work)

| Job Type | Gold/Hour | Risk | Energy Cost |
|---------|----------|------|-------------|
| Mining | 20-5,000 | Low | 10-20 |
| Courier | 30-6,500 | Medium | 8-18 |
| Guard Duty | 40-10,000 | Medium | 12-25 |
| Hunting | 25-6,500 | Medium | 15-30 |

#### 5. Crafting Sales

- Profit margins: 100-250% of material cost
- Higher rarity = higher margins
- Skill level reduces material costs

### Gold Sinks

#### 1. Shop Items

| Rarity | Price Range |
|--------|------------|
| Common | 50 - 50,000 |
| Uncommon | 500 - 120,000 |
| Rare | 2,500 - 400,000 |
| Epic | 15,000 - 1,000,000 |
| Legendary | 75,000 - 5,000,000 |

#### 2. Property Ownership

| Property Type | Purchase | Daily Tax | Daily Income | ROI |
|--------------|---------|----------|-------------|-----|
| Shack | 1,000-500,000 | 10-5,000 | 50-25,000 | 25-30 days |
| House | 2,500-1,250,000 | 20-10,000 | 100-50,000 | 30-32 days |
| Mansion | 5,000-2,000,000 | 30-12,000 | 150-60,000 | 40-45 days |
| Business | 3,000-1,500,000 | 25-12,500 | 120-60,000 | 30-35 days |

#### 3. Travel Costs

- **On Foot**: 5 gold/distance unit
- **Horse**: 10 gold/distance unit (1.5x speed)
- **Stagecoach**: 25 gold/distance unit (2x speed)
- **Train**: 50 gold/distance unit (3x speed)

Regional scarcity multiplies costs by 1.0-2.0x.

#### 4. Crime Consequences

- **Bail**: 100 + (200 × wanted level)
- **Bribe**: 250 + (500 × wanted level)
- **Lay Low**: 500 gold flat rate

#### 5. Gang Operations

- **Creation**: 5,000 gold
- **Daily Upkeep**: 100 gold
- **Upgrades**: 10,000 - 250,000 gold
- **War Declaration**: 25,000 gold

#### 6. Bank Vault Upgrades

- **Bronze Tier**: 1,000 gold
- **Silver Tier**: 5,000 gold
- **Gold Tier**: 25,000 gold

---

## XP and Progression

### Level Curve

**Formula**: XP = 100 × (1.15 ^ (level - 1))

Total XP to reach level 50: **627,255 XP**

### Stat Points

- **2 stat points per level** (starting at level 2)
- Total at level 50: **98 stat points**
- Distribute to: Cunning, Spirit, Combat, Craft

### Milestone Bonuses

Every 5 levels (5, 10, 15, 20, 25, 30, 35, 40, 45, 50):
- Bonus gold rewards
- Special items
- Unique titles
- Content unlocks

### XP Sources

| Activity | XP Range |
|---------|---------|
| Crimes | 20-300 |
| Combat | 40-250 |
| Quests | 100-1,000 |
| Crafting | 35-150 |
| Social Actions | 30-100 |
| Exploration | 50-200 |
| Boss Defeats | 350-1,000 |

### Content Unlocks by Level

- **Level 3**: Lockpicking skill
- **Level 5**: Mail system, Friends list
- **Level 7**: Gambling
- **Level 10**: Gang creation/joining
- **Level 15**: Property ownership
- **Level 18**: Dueling
- **Level 20**: Gang wars, Stagecoach robbery
- **Level 25**: Tournaments, Master crafting
- **Level 30**: Train robbery, Bounty hunting
- **Level 35**: Legendary crafting
- **Level 40**: Bank heists, Endgame content

---

## Energy Economy

### Regeneration Rates

- **Free Players**: 30 energy/hour (150 max in 5 hours)
- **Premium Players**: 31.25 energy/hour (250 max in 8 hours)

### Action Costs

| Difficulty | Energy Cost | Examples |
|-----------|------------|---------|
| Trivial | 5 | Basic crimes, simple crafting |
| Standard | 10 | Medium crimes, jobs |
| Challenging | 15 | Combat, travel |
| Difficult | 20 | Major crimes, quests |
| Epic | 25 | Boss fights |
| Legendary | 30 | Endgame content |

### Recovery Items

| Item | Cost | Energy Restored |
|------|------|----------------|
| Coffee | 50 gold | +25 energy |
| Meal | 150 gold | +50 energy |
| Tonic | 500 gold | +100 energy |
| Elixir | 2,000 gold | Full restore |

### Energy Strategy

- **Free players**: ~15-30 actions per day (optimal play)
- **Premium players**: ~25-50 actions per day
- **With recovery items**: Additional 5-10 actions possible

---

## Pricing Systems

### Base Price Calculation

Prices are determined by:
1. **Item Type**: Weapon, armor, consumable, mount, material
2. **Rarity**: Common to Legendary
3. **Level Tier**: Novice to Master
4. **Base Recommendation**: From economy tables

### Price Modifiers

#### Faction Discount
- **Same Faction**: 0.9 (10% discount)
- **Allied Faction**: 1.0 (no change)
- **Hostile Faction**: 1.2 (20% markup)
- **Neutral**: 1.05 (5% markup)

#### Regional Scarcity
- **Urban Areas**: 0.95 - 1.05
- **Frontier**: 1.1 - 1.2
- **Remote/Ghost Towns**: 1.5 - 2.0

#### Merchant Reputation
- **0 Reputation**: 1.0 (no discount)
- **100 Reputation**: 0.85 (15% discount)
- Linear scaling based on reputation

#### Skill Discounts (Crafting)
- **Level 0**: 1.0 (no discount)
- **Level 50**: 0.75 (25% discount)
- Applies to material purchases

#### Bulk Discounts
- **10-24 items**: 5% off
- **25-49 items**: 10% off
- **50-99 items**: 15% off
- **100+ items**: 20% off

### Dynamic Pricing (Market)

Supply and demand affect prices:
- **High demand, low supply**: 1.5x price
- **Balanced**: 1.0x price
- **Low demand, high supply**: 0.7x price

---

## Anti-Exploit Measures

### Detection Thresholds

| Metric | Threshold | Action |
|--------|----------|--------|
| Gold per transaction | 1,000,000 | Flag & investigate |
| Gold per hour | 500,000 | Flag & investigate |
| Gold per day | 3,000,000 | Flag & investigate |
| XP per hour | 10,000 | Warn player |
| Trades per hour | 50 | Rate limit |
| Same item sold/hour | 200 | Flag duplication |

### Protection Mechanisms

1. **Gold Duplication Check**: Validates balance continuity in transaction chain
2. **Rate Limiting**: Limits transactions per hour to prevent spam
3. **Suspicious Pattern Detection**: Flags abnormal earning rates
4. **XP Farming Prevention**: Monitors XP gain rates
5. **Item Duplication Prevention**: Tracks crafting and selling patterns
6. **Trading Exploit Prevention**: Monitors excessive trading

### Audit Trail

All transactions are logged with:
- Character ID
- User ID
- Timestamp
- Amount
- Source/Reason
- Balance before/after
- Metadata (item IDs, target characters, etc.)

### Automatic Actions

- **Soft Warnings**: Log suspicious activity, continue monitoring
- **Rate Limiting**: Temporarily block excessive actions
- **Manual Review**: Flag critical issues for admin investigation
- **No Auto-Bans**: All serious actions require human review

---

## Monitoring and Reports

### Daily Reports

Generated automatically, includes:
- Total gold earned/spent
- Gold flow ratio
- Active players
- New characters
- Top gold sources and sinks
- Wealth distribution by tier
- Economic health metrics (Gini, velocity, inflation)

### Weekly Reports

Aggregates daily data, includes:
- Weekly totals
- Trends (increasing/stable/decreasing)
- Balance issues detected
- Recommended actions

### Real-Time Monitoring

Admin dashboard shows:
- Current gold flow ratio
- Active exploits detected
- Top earners (for investigation)
- Economy health indicators

### Alerts

System triggers alerts when:
- Gold flow ratio outside 0.8-1.2 range
- Gini coefficient outside 0.3-0.8 range
- Critical exploits detected
- Suspicious earning patterns

---

## Adjustment Procedures

### When to Adjust

Adjust economy when:
1. **Gold flow ratio** consistently outside target range for 7+ days
2. **Gini coefficient** shows unhealthy inequality for 14+ days
3. **Player feedback** indicates broken economics
4. **New content** requires rebalancing existing systems
5. **Exploits** discovered that threaten economy

### Adjustment Process

1. **Identify Issue**: Use reports to pinpoint problem area
2. **Analyze Impact**: Determine which players/tiers affected
3. **Propose Solution**: Draft changes to rewards/costs
4. **Test Changes**: Use economy simulator (if available) or test server
5. **Implement Gradually**: Roll out changes in phases
6. **Monitor Results**: Watch reports for 7 days
7. **Iterate**: Adjust further if needed

### Types of Adjustments

#### Reward Adjustments
- Increase/decrease gold rewards
- Adjust XP curves
- Modify drop rates
- Change quest rewards

#### Cost Adjustments
- Modify item prices
- Adjust property costs
- Change service fees
- Update crafting costs

#### System Adjustments
- Rebalance crime risk/reward
- Adjust energy costs
- Modify combat difficulty
- Update crafting margins

### Communication

Always communicate changes:
- **Patch Notes**: Detailed explanation of changes
- **In-Game Announcements**: Notify active players
- **Forum Posts**: Allow player discussion
- **Transparency**: Explain reasoning behind changes

---

## Reference Tables

### Quick Reference: Gold/Hour by Tier

| Tier | Jobs | Crimes | Combat | Quests | Crafting |
|------|------|--------|--------|--------|----------|
| Novice | 50-200 | 100-500 | 75-300 | 200-1,000 | 100-400 |
| Journeyman | 200-500 | 500-2,000 | 300-1,500 | 1,000-5,000 | 400-2,000 |
| Veteran | 500-2,000 | 2,000-10,000 | 1,500-8,000 | 5,000-25,000 | 2,000-12,000 |
| Expert | 2,000-10,000 | 10,000-50,000 | 8,000-40,000 | 25,000-100,000 | 12,000-60,000 |
| Master | 10,000-50,000 | 50,000-200,000 | 40,000-150,000 | 100,000-500,000 | 60,000-250,000 |

### Level Progression Quick Reference

| Level | XP Required | Total XP | Tier | Stat Points |
|-------|------------|----------|------|-------------|
| 1 | 0 | 0 | Novice | 0 |
| 10 | 306 | 1,678 | Novice | 18 |
| 20 | 1,237 | 8,824 | Journeyman | 38 |
| 30 | 5,004 | 37,705 | Veteran | 58 |
| 40 | 20,245 | 154,549 | Expert | 78 |
| 50 | 81,902 | 627,255 | Master | 98 |

### Property ROI Quick Reference

| Tier | Investment | Daily Profit | Days to ROI |
|------|-----------|-------------|-------------|
| Novice | 1,000-5,000 | 40-200 | 25-31 |
| Journeyman | 5,000-25,000 | 200-600 | 25-42 |
| Veteran | 25,000-100,000 | 1,000-2,400 | 25-42 |
| Expert | 100,000-500,000 | 4,000-12,000 | 25-42 |
| Master | 500,000-2,000,000 | 20,000-48,000 | 25-42 |

---

## Best Practices

### For Game Masters

1. **Review Daily Reports**: Check economic health each day
2. **Monitor Exploits**: Investigate flagged suspicious activity
3. **Respond to Feedback**: Listen to player concerns about economy
4. **Document Changes**: Keep detailed records of all adjustments
5. **Gradual Changes**: Never make massive changes all at once

### For Developers

1. **Test New Content**: Verify gold/XP rewards match tier expectations
2. **Use Price Normalization**: Always use pricing utilities, never hardcode
3. **Log Transactions**: Ensure all gold changes create transaction records
4. **Implement Limits**: Use rate limiting on exploitable endpoints
5. **Monitor Performance**: Watch for database performance issues with transactions

### For Players

1. **Diversify Income**: Don't rely on single gold source
2. **Invest Wisely**: Properties and equipment have long-term value
3. **Manage Energy**: Plan actions to maximize energy efficiency
4. **Join Gangs**: Gang benefits offset costs
5. **Report Exploits**: Help keep economy healthy by reporting bugs

---

## Conclusion

Desperados Destiny's economy is designed to be:
- **Fair**: No pay-to-win, skill and time investment matter
- **Balanced**: Gold earned ≈ gold spent
- **Engaging**: Meaningful choices at every level
- **Sustainable**: Built to last for years without inflation
- **Monitored**: Comprehensive reporting and alerts

This economy serves the core gameplay loop: **Outlaws making choices, taking risks, and building legends.**

For questions or concerns about economy balance, contact the development team through official channels.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Next Review**: 2025-12-26
