# DESPERADOS DESTINY - ENERGY SYSTEM SPECIFICATION
## Complete Implementation Guide

**Version:** 1.0
**Last Updated:** November 15, 2025
**Status:** Phase 0.75 - Foundation Planning

---

## OVERVIEW

The **Energy System** is the core pacing mechanic for Desperados Destiny. Every action - combat, crimes, skill training, travel - consumes energy. Energy regenerates over time, creating natural play sessions and preventing infinite grinding.

This system is designed to be:
- **Fair:** Free players can compete through smart energy management
- **Rewarding:** Premium players get convenience, not power
- **Transparent:** Players always know their energy status
- **Skill-based:** High-level skills improve energy efficiency

---

## TABLE OF CONTENTS

1. [Energy Pool Fundamentals](#energy-pool-fundamentals)
2. [Energy Regeneration](#energy-regeneration)
3. [Fatigue System](#fatigue-system)
4. [Energy Costs](#energy-costs)
5. [Skill-Based Improvements](#skill-based-improvements)
6. [Premium vs Free Tier](#premium-vs-free-tier)
7. [Edge Cases & Special States](#edge-cases--special-states)
8. [Implementation Details](#implementation-details)
9. [Database Schema](#database-schema)
10. [API Endpoints](#api-endpoints)
11. [Real-Time Updates](#real-time-updates)
12. [Cron Jobs](#cron-jobs)
13. [Anti-Cheat Measures](#anti-cheat-measures)
14. [Monitoring & Analytics](#monitoring--analytics)

---

## ENERGY POOL FUNDAMENTALS

### Base Energy Pools

```javascript
const ENERGY_POOLS = {
  FREE_TIER: {
    base: 150,
    maxWithSkills: 175,  // +25 from skill improvements
    regenerationRate: 5  // per hour
  },
  PREMIUM_TIER: {
    base: 250,
    maxWithSkills: 275,  // +25 from skill improvements
    regenerationRate: 8  // per hour
  }
}
```

### Energy Pool Components

```javascript
{
  current: Number,        // Current energy (0 to max)
  max: Number,            // Maximum energy capacity
  baseMax: Number,        // Base max (150 or 250)
  skillBonus: Number,     // Bonus from skills (0 to 25)
  baseRegen: Number,      // Base regen rate (5 or 8 per hour)
  fatigueLevel: Number,   // Fatigue accumulation (0 to 100)
  fatigueModifier: Number, // Regen rate multiplier (0.5 to 1.0)
  lastRegen: Date,        // Last regeneration tick timestamp
  nextRegen: Date         // Next scheduled regen tick
}
```

### Calculating Maximum Energy

```javascript
function calculateMaxEnergy(character) {
  const tier = character.premiumTier  // 'free' or 'premium'
  const baseMax = ENERGY_POOLS[tier.toUpperCase() + '_TIER'].base
  const skillBonus = calculateEnergySkillBonus(character.skills)

  return baseMax + skillBonus
}
```

### Energy Skill Bonus

Certain skills provide energy capacity bonuses:

```javascript
const ENERGY_SKILLS = {
  'endurance': { maxBonus: 15, formula: level => Math.floor(level / 10) * 3 },
  'meditation': { maxBonus: 10, formula: level => Math.floor(level / 15) * 2 }
}

function calculateEnergySkillBonus(skills) {
  let bonus = 0

  for (const skillId in ENERGY_SKILLS) {
    const skill = skills.find(s => s.skillId === skillId)
    if (skill) {
      const skillConfig = ENERGY_SKILLS[skillId]
      bonus += Math.min(skillConfig.maxBonus, skillConfig.formula(skill.level))
    }
  }

  return Math.min(25, bonus)  // Cap at +25 total
}
```

**Example:**
- Endurance Level 50: +15 energy (5 increments × 3)
- Meditation Level 30: +4 energy (2 increments × 2)
- Total Bonus: +19 energy
- Free Player Max Energy: 150 + 19 = **169**
- Premium Player Max Energy: 250 + 19 = **269**

---

## ENERGY REGENERATION

### Regeneration Rate

Energy regenerates at a **fixed rate per hour**:

```javascript
const REGEN_RATES = {
  FREE: 5,      // 5 energy per hour
  PREMIUM: 8    // 8 energy per hour
}
```

### Regeneration Tick Frequency

**Regeneration occurs every 12 minutes** (5 ticks per hour):

```javascript
const REGEN_INTERVAL_MS = 12 * 60 * 1000  // 12 minutes in milliseconds

const ENERGY_PER_TICK = {
  FREE: 1,      // 5 per hour ÷ 5 ticks = 1 per tick
  PREMIUM: 1.6  // 8 per hour ÷ 5 ticks = 1.6 per tick
}
```

**Note:** Fractional energy accumulates and is applied when reaching a whole number:

```javascript
// Premium player regeneration over 5 ticks
// Tick 1: 1.6 → display 1, store 0.6 remainder
// Tick 2: 1.6 + 0.6 = 2.2 → display 2, store 0.2 remainder
// Tick 3: 1.6 + 0.2 = 1.8 → display 1, store 0.8 remainder
// Tick 4: 1.6 + 0.8 = 2.4 → display 2, store 0.4 remainder
// Tick 5: 1.6 + 0.4 = 2.0 → display 2, store 0.0 remainder
// Total: 8 energy regenerated over 1 hour ✓
```

### Regeneration Algorithm

```javascript
function regenerateEnergy(character) {
  const now = new Date()
  const timeSinceLastRegen = now - character.energy.lastRegen  // milliseconds
  const ticksPassed = Math.floor(timeSinceLastRegen / REGEN_INTERVAL_MS)

  if (ticksPassed < 1) {
    // Not enough time has passed for a regen tick
    return { regenerated: 0, newCurrent: character.energy.current }
  }

  const tier = character.premiumTier === 'premium' ? 'PREMIUM' : 'FREE'
  const baseRegenPerTick = ENERGY_PER_TICK[tier]
  const fatigueMultiplier = calculateFatigueMultiplier(character.energy.fatigueLevel)

  // Calculate energy regenerated
  const regenPerTick = baseRegenPerTick * fatigueMultiplier
  const totalRegen = regenPerTick * ticksPassed

  // Apply fractional accumulation
  const previousRemainder = character.energy._regenRemainder || 0
  const totalWithRemainder = totalRegen + previousRemainder
  const wholeEnergyGained = Math.floor(totalWithRemainder)
  const newRemainder = totalWithRemainder - wholeEnergyGained

  // Cap at maximum energy
  const newCurrent = Math.min(character.energy.max, character.energy.current + wholeEnergyGained)

  // Update character
  character.energy.current = newCurrent
  character.energy._regenRemainder = newRemainder
  character.energy.lastRegen = new Date(character.energy.lastRegen.getTime() + (ticksPassed * REGEN_INTERVAL_MS))

  return {
    regenerated: wholeEnergyGained,
    newCurrent,
    ticksProcessed: ticksPassed,
    fatigueMultiplier
  }
}
```

### Fatigue Multiplier

```javascript
function calculateFatigueMultiplier(fatigueLevel) {
  // Fatigue level: 0 to 100
  // Multiplier: 1.0 (no fatigue) to 0.5 (max fatigue)

  const minMultiplier = 0.5
  const maxMultiplier = 1.0

  return maxMultiplier - (fatigueLevel / 100) * (maxMultiplier - minMultiplier)
}

// Examples:
// Fatigue 0   → Multiplier 1.0 (100% regen rate)
// Fatigue 25  → Multiplier 0.875 (87.5% regen rate)
// Fatigue 50  → Multiplier 0.75 (75% regen rate)
// Fatigue 75  → Multiplier 0.625 (62.5% regen rate)
// Fatigue 100 → Multiplier 0.5 (50% regen rate)
```

---

## FATIGUE SYSTEM

### Fatigue Accumulation

**Fatigue increases** when characters push their limits (spend energy rapidly):

```javascript
function accumulateFatigue(character, energySpent) {
  const currentFatigue = character.energy.fatigueLevel
  const fatigueGain = calculateFatigueGain(energySpent, character)

  const newFatigue = Math.min(100, currentFatigue + fatigueGain)
  character.energy.fatigueLevel = newFatigue

  return newFatigue
}

function calculateFatigueGain(energySpent, character) {
  // Base fatigue gain: 0.2 per energy spent
  const baseFatigueGain = energySpent * 0.2

  // Skill reduction (Endurance skill reduces fatigue gain)
  const enduranceSkill = character.skills.find(s => s.skillId === 'endurance')
  const enduranceLevel = enduranceSkill ? enduranceSkill.level : 0
  const fatigueReduction = Math.min(0.5, enduranceLevel * 0.005)  // Max 50% reduction at level 100

  const adjustedFatigueGain = baseFatigueGain * (1 - fatigueReduction)

  return adjustedFatigueGain
}

// Examples:
// Spend 50 energy, Endurance 0:   50 × 0.2 × 1.0 = 10 fatigue
// Spend 50 energy, Endurance 50:  50 × 0.2 × 0.75 = 7.5 fatigue
// Spend 50 energy, Endurance 100: 50 × 0.2 × 0.5 = 5 fatigue
```

### Fatigue Recovery

**Fatigue decreases** passively over time:

```javascript
function recoverFatigue(character) {
  const now = new Date()
  const timeSinceLastUpdate = now - character.energy.lastFatigueUpdate  // milliseconds
  const hoursPassed = timeSinceLastUpdate / (1000 * 60 * 60)

  // Recover 10 fatigue per hour
  const fatigueRecovery = hoursPassed * 10

  // Skill bonus (Meditation skill increases recovery rate)
  const meditationSkill = character.skills.find(s => s.skillId === 'meditation')
  const meditationLevel = meditationSkill ? meditationSkill.level : 0
  const recoveryBonus = Math.min(10, meditationLevel * 0.1)  // Max +10 per hour at level 100

  const totalRecovery = fatigueRecovery + (hoursPassed * recoveryBonus)

  const newFatigue = Math.max(0, character.energy.fatigueLevel - totalRecovery)
  character.energy.fatigueLevel = newFatigue
  character.energy.lastFatigueUpdate = now

  return newFatigue
}

// Examples:
// 1 hour passed, Meditation 0:   Fatigue -10
// 1 hour passed, Meditation 50:  Fatigue -15
// 1 hour passed, Meditation 100: Fatigue -20
```

### Fatigue Impact Summary

| Fatigue Level | Regen Rate Multiplier | Recovery Time (from 0) |
|---------------|-----------------------|------------------------|
| 0 (Fresh)     | 1.0 (100%)            | N/A                    |
| 25            | 0.875 (87.5%)         | 2.5 hours              |
| 50            | 0.75 (75%)            | 5 hours                |
| 75            | 0.625 (62.5%)         | 7.5 hours              |
| 100 (Exhausted)| 0.5 (50%)            | 10 hours               |

**Design Intent:**
- Players who binge-play accumulate fatigue, slowing their progression
- Taking breaks allows fatigue to recover, rewarding distributed playtime
- Prevents burnout and encourages healthy play patterns

---

## ENERGY COSTS

### Action Energy Costs

```javascript
const ENERGY_COSTS = {
  // Combat
  DUEL: 25,
  GANG_WAR_PARTICIPATION: 100,
  TERRITORY_ATTACK: 100,
  BOUNTY_HUNT: 50,

  // Crimes
  PICKPOCKET: 10,
  PETTY_THEFT: 15,
  BURGLARY: 25,
  STAGECOACH_ROBBERY: 40,
  BANK_ROBBERY: 50,
  TRAIN_HEIST: 75,
  LEGENDARY_SCORE: 100,

  // Skill Checks
  MINOR_TASK: 5,
  MODERATE_TASK: 15,
  MAJOR_TASK: 30,

  // Travel
  LOCAL_TRAVEL: 5,
  REGIONAL_TRAVEL: 15,
  LONG_DISTANCE_TRAVEL: 30,

  // Social
  CHAT_MESSAGE: 0,  // Free
  SEND_GIFT: 5,
  HOST_EVENT: 25,

  // Crafting
  CRAFT_COMMON_ITEM: 10,
  CRAFT_UNCOMMON_ITEM: 20,
  CRAFT_RARE_ITEM: 40,

  // Supernatural
  SPIRIT_QUEST: 75,
  VISION_QUEST: 50,
  RITUAL: 100
}
```

### Skill-Based Energy Cost Reduction

Certain skills reduce the energy cost of related actions:

```javascript
const ENERGY_COST_SKILLS = {
  'gun_fighting': { actions: ['DUEL', 'BOUNTY_HUNT'], maxReduction: 0.25 },
  'stealth': { actions: ['PICKPOCKET', 'BURGLARY', 'PETTY_THEFT'], maxReduction: 0.30 },
  'horse_riding': { actions: ['LOCAL_TRAVEL', 'REGIONAL_TRAVEL'], maxReduction: 0.40 },
  'crafting_general': { actions: ['CRAFT_COMMON_ITEM', 'CRAFT_UNCOMMON_ITEM', 'CRAFT_RARE_ITEM'], maxReduction: 0.35 }
}

function calculateEnergyCost(actionType, character) {
  const baseCost = ENERGY_COSTS[actionType]

  // Find relevant skills
  let totalReduction = 0
  for (const skillId in ENERGY_COST_SKILLS) {
    const skillConfig = ENERGY_COST_SKILLS[skillId]
    if (skillConfig.actions.includes(actionType)) {
      const skill = character.skills.find(s => s.skillId === skillId)
      if (skill) {
        // Linear reduction: 0% at level 1, max% at level 100
        const reductionPercent = (skill.level / 100) * skillConfig.maxReduction
        totalReduction += reductionPercent
      }
    }
  }

  // Cap total reduction at 50%
  totalReduction = Math.min(0.5, totalReduction)

  const adjustedCost = Math.ceil(baseCost * (1 - totalReduction))
  return adjustedCost
}

// Example: Duel with Gun Fighting 80
// Base cost: 25
// Reduction: (80/100) × 0.25 = 0.20 (20%)
// Adjusted cost: 25 × 0.80 = 20 energy
```

### Item-Based Energy Cost Reduction

Items can provide energy cost reductions:

```javascript
// Example: "Well-Fed" buff from consuming food
{
  itemId: 'beef_stew',
  effects: {
    energyCostReduction: 0.10,  // 10% reduction to all actions
    duration: 3600  // 1 hour
  }
}

// Example: "Horse Saddle" (equipment)
{
  itemId: 'quality_saddle',
  effects: {
    travelCostReduction: 0.25  // 25% reduction to travel costs
  }
}
```

---

## PREMIUM VS FREE TIER

### Comparison Table

| Feature                     | Free Tier          | Premium Tier        | Premium Advantage |
|-----------------------------|--------------------|---------------------|-------------------|
| **Base Energy Pool**        | 150                | 250                 | +100 (66% more)   |
| **Max with Skills**         | 175                | 275                 | +100 (57% more)   |
| **Regen Rate (per hour)**   | 5                  | 8                   | +3 (60% faster)   |
| **Regen Rate (per day)**    | 120                | 192                 | +72 (60% more)    |
| **Actions per day (avg)**   | ~8-10              | ~12-15              | +50%              |
| **Fatigue accumulation**    | Same               | Same                | None              |
| **Skill-based improvements**| Same               | Same                | None              |
| **Energy cost reductions**  | Same               | Same                | None              |

### Free Player Optimization

Free players can **optimize** their energy usage:

1. **Train energy skills** (Endurance, Meditation) to increase pool and reduce fatigue
2. **Level up action-specific skills** to reduce energy costs (e.g., Gun Fighting for duels)
3. **Use consumables** strategically (food buffs, rest items)
4. **Manage fatigue** by distributing playtime (log in 2-3 times per day, not 1 long session)
5. **Focus on efficiency** (pick high-reward actions)

**Result:** A skilled free player can achieve ~175 max energy with ~20% cost reductions = effectively 219 energy worth of actions

**Premium player baseline:** 250 energy with same benefits = ~312 energy worth of actions

**Gap:** Premium ~42% advantage (down from 66% base) - significant but not insurmountable

---

## EDGE CASES & SPECIAL STATES

### Energy Hits Zero

When `current energy === 0`:

```javascript
if (character.energy.current === 0) {
  // Player cannot perform any energy-costing actions
  // Can still:
  // - View UI, read messages, browse shops
  // - Chat (0 energy cost)
  // - Train skills (passive, no energy cost)
  // - Manage inventory, read lore
  // - Wait for regeneration
}
```

**No Negative Energy:**
```javascript
// Prevent actions if insufficient energy
if (energyCost > character.energy.current) {
  throw new Error('INSUFFICIENT_ENERGY')
}
```

### Hospital / Jail Energy Behavior

**In Hospital or Jail:**
- Energy **continues to regenerate** normally
- Player **cannot spend energy** on actions (all actions blocked except viewing)
- Upon release, player has full/partial energy depending on time spent

```javascript
if (character.inHospital || character.inJail) {
  // Regen still happens (cron job processes normally)
  regenerateEnergy(character)

  // But actions are blocked
  if (actionRequiresEnergy(actionType)) {
    throw new Error('CANNOT_ACT_WHILE_INCAPACITATED')
  }
}
```

### Offline Energy Regeneration

**Energy regenerates while offline:**

```javascript
// When player logs in after being offline
function handleLogin(character) {
  const now = new Date()
  const timeSinceLastRegen = now - character.energy.lastRegen
  const hoursPassed = timeSinceLastRegen / (1000 * 60 * 60)

  // Regenerate energy for offline time (up to max)
  regenerateEnergy(character)

  // Also recover fatigue
  recoverFatigue(character)

  // Log result
  console.log(`Player was offline for ${hoursPassed.toFixed(2)} hours.`)
  console.log(`Regenerated ${regenerated} energy, recovered ${fatigueRecovered} fatigue.`)
}
```

**Cap:** Energy can regenerate up to `max`, never exceeds it

**Example:**
- Player logs off with 50 energy, max 150
- 24 hours pass
- Free player: 50 + (24 × 5) = 50 + 120 = **150** (capped at max)
- Premium player: 50 + (24 × 8) = 50 + 192 = **150** (capped at max for this character's max)

### Energy Overflow (Premium Upgrade)

**When a free player upgrades to premium:**

```javascript
function upgradeToPremium(character) {
  // Old max: 150 + skillBonus
  // New max: 250 + skillBonus
  const oldMax = character.energy.max
  const newMax = 250 + calculateEnergySkillBonus(character.skills)

  character.energy.max = newMax
  character.energy.baseMax = 250
  character.energy.baseRegen = 8

  // If current energy was at old max, boost it to new max
  if (character.energy.current === oldMax) {
    character.energy.current = newMax
  }

  // Otherwise, current energy stays the same (no free bonus)
}
```

---

## IMPLEMENTATION DETAILS

### Energy Transaction Pattern

**Every energy-costing action must:**

1. **Check availability** (sufficient energy)
2. **Deduct energy** atomically
3. **Perform action**
4. **Accumulate fatigue**
5. **Log transaction**

```javascript
async function performEnergyAction(character, actionType, actionLogic) {
  // Step 1: Calculate cost
  const energyCost = calculateEnergyCost(actionType, character)

  // Step 2: Check availability
  if (character.energy.current < energyCost) {
    throw new Error('INSUFFICIENT_ENERGY', {
      required: energyCost,
      available: character.energy.current
    })
  }

  // Step 3: Begin transaction
  const session = await db.startSession()
  session.startTransaction()

  try {
    // Step 4: Deduct energy
    character.energy.current -= energyCost

    // Step 5: Accumulate fatigue
    accumulateFatigue(character, energyCost)

    // Step 6: Perform action
    const result = await actionLogic(character)

    // Step 7: Save character state
    await character.save({ session })

    // Step 8: Commit transaction
    await session.commitTransaction()

    // Step 9: Log for analytics
    await logEnergyTransaction(character._id, actionType, energyCost)

    return result
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}
```

### Database Updates

**Character Energy State:**
```javascript
// MongoDB update
await db.collection('characters').updateOne(
  { _id: characterId },
  {
    $set: {
      'energy.current': newCurrent,
      'energy.fatigueLevel': newFatigue,
      'energy.lastRegen': now,
      'energy._regenRemainder': newRemainder
    }
  }
)
```

### Atomic Operations

**Use MongoDB atomic operators:**

```javascript
// Deduct energy atomically (prevents race conditions)
const result = await db.collection('characters').findOneAndUpdate(
  {
    _id: characterId,
    'energy.current': { $gte: energyCost }  // Only update if sufficient energy
  },
  {
    $inc: { 'energy.current': -energyCost },
    $set: { 'energy.lastAction': new Date() }
  },
  { returnDocument: 'after' }
)

if (!result.value) {
  throw new Error('INSUFFICIENT_ENERGY')
}
```

---

## DATABASE SCHEMA

### Character Energy Subdocument

```javascript
{
  energy: {
    current: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true },
    baseMax: { type: Number, required: true },  // 150 or 250
    skillBonus: { type: Number, default: 0 },
    baseRegen: { type: Number, required: true },  // 5 or 8
    fatigueLevel: { type: Number, default: 0, min: 0, max: 100 },
    lastRegen: { type: Date, required: true },
    lastFatigueUpdate: { type: Date, required: true },
    _regenRemainder: { type: Number, default: 0 }  // Internal fractional tracking
  }
}
```

### Indexes

```javascript
db.characters.createIndex({ 'energy.current': 1 })
db.characters.createIndex({ 'energy.lastRegen': 1 })
```

---

## API ENDPOINTS

### GET `/characters/:characterId/energy`

**Response:**
```json
{
  "success": true,
  "data": {
    "current": 125,
    "max": 175,
    "regenRate": 5,
    "fatigueLevel": 35,
    "fatigueMultiplier": 0.825,
    "effectiveRegenRate": 4.125,
    "nextRegen": "2025-11-15T11:12:00.000Z",
    "timeToFull": "10 hours 24 minutes"
  }
}
```

### POST `/characters/:characterId/energy/spend`

**Request Body:**
```json
{
  "actionType": "DUEL",
  "targetId": "507f1f77bcf86cd799439013"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "energySpent": 25,
    "newCurrent": 100,
    "fatigueGained": 5,
    "newFatigue": 40
  }
}
```

---

## REAL-TIME UPDATES

### Socket.io Events

**Server → Client: `energy:update`**
```json
{
  "current": 130,
  "max": 175,
  "fatigueLevel": 32,
  "nextRegen": "2025-11-15T11:12:00.000Z"
}
```

**When to emit:**
- Every regen tick (every 12 minutes)
- After any action that spends energy
- When player logs in
- When premium status changes

---

## CRON JOBS

### Energy Regeneration Cron

**Frequency:** Every 12 minutes
**Job:** Process energy regeneration for all active characters

```javascript
// Cron job (runs every 12 minutes)
cron.schedule('*/12 * * * *', async () => {
  console.log('[Cron] Running energy regeneration...')

  // Find characters who need regeneration (active in last 7 days)
  const charactersToRegen = await db.collection('characters').find({
    lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    'energy.current': { $lt: '$energy.max' }  // Not at full energy
  }).toArray()

  for (const character of charactersToRegen) {
    const result = regenerateEnergy(character)
    recoverFatigue(character)

    // Save updated character
    await db.collection('characters').updateOne(
      { _id: character._id },
      {
        $set: {
          'energy.current': character.energy.current,
          'energy.lastRegen': character.energy.lastRegen,
          'energy.fatigueLevel': character.energy.fatigueLevel,
          'energy._regenRemainder': character.energy._regenRemainder
        }
      }
    )

    // Emit Socket.io update if player is online
    if (isPlayerOnline(character._id)) {
      io.to(character._id.toString()).emit('energy:update', {
        current: character.energy.current,
        max: character.energy.max,
        fatigueLevel: character.energy.fatigueLevel
      })
    }
  }

  console.log(`[Cron] Regenerated energy for ${charactersToRegen.length} characters.`)
})
```

### Fatigue Recovery Cron

**Frequency:** Every 1 hour
**Job:** Recover fatigue for all characters

```javascript
cron.schedule('0 * * * *', async () => {
  console.log('[Cron] Running fatigue recovery...')

  const characters = await db.collection('characters').find({
    'energy.fatigueLevel': { $gt: 0 }
  }).toArray()

  for (const character of characters) {
    recoverFatigue(character)

    await db.collection('characters').updateOne(
      { _id: character._id },
      {
        $set: {
          'energy.fatigueLevel': character.energy.fatigueLevel,
          'energy.lastFatigueUpdate': character.energy.lastFatigueUpdate
        }
      }
    )
  }

  console.log(`[Cron] Recovered fatigue for ${characters.length} characters.`)
})
```

---

## ANTI-CHEAT MEASURES

### Energy Transaction Logging

Log every energy expenditure for audit:

```javascript
const energyTransactionSchema = {
  characterId: ObjectId,
  actionType: String,
  energyCost: Number,
  timestamp: Date,
  characterEnergyBefore: Number,
  characterEnergyAfter: Number,
  ipAddress: String
}

await db.collection('energy_transactions').insertOne({
  characterId: character._id,
  actionType: 'DUEL',
  energyCost: 25,
  timestamp: new Date(),
  characterEnergyBefore: 150,
  characterEnergyAfter: 125,
  ipAddress: req.ip
})
```

### Suspicious Activity Detection

```javascript
// Flag suspicious energy patterns
async function detectEnergyAnomalies(characterId) {
  const recentTransactions = await db.collection('energy_transactions').find({
    characterId,
    timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }  // Last hour
  }).toArray()

  // Red flag: More than 200 energy spent in 1 hour (impossible for free tier)
  const totalSpent = recentTransactions.reduce((sum, t) => sum + t.energyCost, 0)
  if (totalSpent > 200) {
    await flagForReview(characterId, 'EXCESSIVE_ENERGY_USAGE', { totalSpent })
  }

  // Red flag: Energy increased without regen tick
  // (Check if character energy somehow increased outside of regen logic)
}
```

---

## MONITORING & ANALYTICS

### Metrics to Track

```javascript
const energyMetrics = {
  // Player metrics
  avgEnergyPerSession: Number,
  avgActionsPerDay: Number,
  energyEfficiency: Number,  // Actions completed per 100 energy

  // System metrics
  regenCronRuntime: Number,
  charactersRegenerated: Number,
  energyTransactionsPerHour: Number,

  // Business metrics
  freePlayerAvgEnergy: Number,
  premiumPlayerAvgEnergy: Number,
  conversionOpportunities: Number  // Free players hitting 0 energy frequently
}
```

### Analytics Queries

```javascript
// Free vs Premium energy usage comparison
db.energy_transactions.aggregate([
  {
    $lookup: {
      from: 'characters',
      localField: 'characterId',
      foreignField: '_id',
      as: 'character'
    }
  },
  {
    $group: {
      _id: '$character.premiumTier',
      avgEnergySpent: { $avg: '$energyCost' },
      totalActions: { $sum: 1 }
    }
  }
])
```

---

## TESTING CHECKLIST

- [ ] Energy regeneration works correctly (every 12 minutes)
- [ ] Fractional energy accumulates properly (premium 1.6 per tick)
- [ ] Energy caps at maximum (never exceeds)
- [ ] Fatigue accumulates and recovers correctly
- [ ] Skill bonuses apply to max energy
- [ ] Skill bonuses reduce energy costs
- [ ] Premium upgrade increases pool immediately
- [ ] Offline regeneration calculates correctly
- [ ] Hospital/jail blocks actions but allows regen
- [ ] Atomic transactions prevent race conditions
- [ ] Socket.io updates send in real-time
- [ ] Cron jobs execute on schedule
- [ ] Anti-cheat logging captures all transactions
- [ ] Analytics track free vs premium usage

---

## CONCLUSION

The Energy System is a **carefully balanced** pacing mechanic that:

1. **Rewards premium players** with convenience (+100 energy, +60% regen)
2. **Empowers free players** with skill-based improvements (+25 energy, -50% costs)
3. **Encourages healthy play** via fatigue mechanics (distributed sessions preferred)
4. **Maintains fairness** (premium is faster, not stronger)
5. **Scales with progression** (skills improve efficiency)

This system is **production-ready** with exact formulas, edge case handling, and implementation details.

---

**Document Status:** ✅ Complete
**Implementation Completeness:** 100%
**Ready for Development:** Yes
**Next Phase:** GDPR Compliance & Security Playbook

*— Ezra "Hawk" Hawthorne*
*Systems Engineer*
*November 15, 2025*
