# Bounty Hunter System - Quick Reference

## Hunter Stats at a Glance

| Hunter | Level | HP | DMG | Accuracy | Min Bounty | Hireable | Cost |
|--------|-------|----|----|----------|------------|----------|------|
| Iron Jack | 35 | 350 | 45 | 95% | 5000g | ❌ | - |
| Hellhound | 38 | 400 | 55 | 90% | 0 (supernatural) | ❌ | - |
| Old Grandfather | 32 | 250 | 40 | 85% | 400g | ✅ Coalition | 400g |
| Bloody Mary | 30 | 180 | 60 | 98% | 300g | ✅ Lawful | 200g |
| Comanche Twins | 28 | 200 ea | 30 | 90% | 500g | ✅ Coalition | 300g |
| El Cazador | 25 | 200 | 35 | 80% | 100g | ✅ Anyone | 250g |
| Copper Kate | 22 | 180 | 20 | 85% | 100g | ✅ Anyone | 150g |
| Marshal's Men | 20 | 150 ea | 25 | 75% | 200g | ❌ | - |
| Gentleman James | 18 | 120 | 15 | 60% | 500g | ✅ Lawful | 500g |
| The Kid | 15 | 150 | 25 | 65% | 50g | ✅ Anyone | 50g |

## Spawn Rates by Wanted Level

| Wanted Rank | Total Bounty | Spawn Chance | Hunters Available |
|-------------|--------------|--------------|-------------------|
| Unknown | 0-99g | 0% | None |
| Petty Criminal | 100-499g | 0% | None |
| Outlaw | 500-1499g | 5% | Most (except Iron Jack/Hellhound) |
| Notorious | 1500-4999g | 15% | All (except Iron Jack) |
| Most Wanted | 5000+g | 30% | All |

## Hunter Territories

| Territory Type | Hunters |
|----------------|---------|
| **Everywhere** | Iron Jack, The Kid |
| **Wilderness** | Comanche Twins |
| **Open Plains/Canyons** | Bloody Mary |
| **Towns/Settlements** | Copper Kate, Marshal's Men, Gentleman James |
| **Frontera Lands** | El Cazador |
| **Coalition Lands** | Comanche Twins, Old Grandfather |
| **The Scar** | Hellhound (only) |

## Hunter Specialties

### Best Trackers
1. Iron Jack (10/10)
2. Comanche Twins (10/10)
3. Old Grandfather (9/10 - spirit tracking)
4. Bloody Mary (7/10)

### Fastest Response
1. Hellhound (4 hours)
2. Old Grandfather (6 hours)
3. Comanche Twins (8 hours)
4. Iron Jack (12 hours)

### Most Lethal
1. Bloody Mary (50% kill rate)
2. Hellhound (territorial defense)
3. Iron Jack (when necessary)

### Most Negotiable
1. Copper Kate (always accepts fair offers)
2. El Cazador (can be bribed)
3. The Kid (can be reasoned with)

### Best for Hire
- **Best Success Rate:** Comanche Twins (85%)
- **Best Value:** Copper Kate (75% success, 150g base)
- **Cheapest:** The Kid (50g, but 30% success)
- **Against Wealthy:** Gentleman James (social pressure)

## Payoff Calculations

**Formula:** `payoff = totalBounty * 1.5`

**Can Be Paid Off:**
- ✅ Copper Kate (always)
- ✅ El Cazador (business decision)
- ✅ The Kid (easily convinced)
- ✅ Comanche Twins (sometimes)
- ❌ Iron Jack (never)
- ❌ Bloody Mary (revenge driven)
- ❌ Marshal's Men (lawful duty)
- ❌ Old Grandfather (spiritual duty)
- ❌ Hellhound (not human)
- ❌ Gentleman James (too proud)

## Special Abilities Quick Reference

**Iron Jack:**
- Perfect Shot (first shot = critical)
- Tactical Superiority (+20% damage with advantage)
- Unbreakable Will (immune to intimidation)

**Hellhound:**
- Shadow Form (reduced normal weapon damage)
- Terror Aura (reduces player accuracy)
- Supernatural Speed (multiple attacks)

**Comanche Twins:**
- Twin Coordination (fight as 2 enemies)
- Perfect Tracking (ignore weather)
- Flanking (attacks from both sides)

**Bloody Mary:**
- Sniper Shot (500 yard range)
- First Blood (opening shot = triple damage)
- Widow's Wrath (+20% vs males)

**Old Grandfather:**
- Spirit Vision (always knows location)
- Ancestral Protection (crit resistance)
- Nature's Wrath (summon animals)

**El Cazador:**
- Betrayal Strike (disguised attack = crit)
- Poison Master (DOT damage)
- Frontera Backup (calls reinforcements)

**Copper Kate:**
- Net Throw (immobilize)
- Knockout Shot (non-lethal)
- Trap Master (disabling traps)

**Marshal's Men:**
- Legal Authority (can reduce jail time)
- Four Against One (4 enemies)
- Surrender Option (peaceful capture)

**Gentleman James:**
- Social Ruin (reputation damage)
- Legal Freeze (locks gold temporarily)
- Guard Summon (calls backup)

**The Kid:**
- Beginner's Luck (random crits)
- Reckless Charge (high risk/reward)
- Retreat (flees at low HP)

## API Endpoints

### Public
```
GET  /api/bounty-hunters              - List all hunters
GET  /api/bounty-hunters/:id          - Hunter details
```

### Protected (Requires Auth)
```
POST /api/bounty-hunters/check-spawn  - Check if hunter spawns
GET  /api/bounty-hunters/available/list - Get hireable hunters
POST /api/bounty-hunters/hire         - Hire a hunter
GET  /api/bounty-hunters/encounters/active - Your encounters
POST /api/bounty-hunters/payoff       - Pay off hunter
POST /api/bounty-hunters/resolve      - Resolve encounter
```

## Hire Restrictions

| Hunter | Who Can Hire | Requirements |
|--------|--------------|--------------|
| Copper Kate | Anyone | None |
| The Kid | Anyone | None |
| El Cazador | Anyone | None |
| Bloody Mary | Lawful only | No active bounties |
| Comanche Twins | Coalition only | Faction membership |
| Old Grandfather | Coalition only | Faction + 75 trust |
| Gentleman James | Lawful only | No bounties, wealthy targets only |

## Encounter Outcomes

### Player Options
1. **Fight** - Combat with hunter
2. **Negotiate** - Try to talk (if allowed)
3. **Pay Off** - Bribe (if allowed, 150% bounty)
4. **Surrender** - Peaceful capture (some hunters)
5. **Flee** - Try to escape

### Resolutions
- **Escaped** - Player got away
- **Captured** - Hunter wins → jail
- **Hunter Defeated** - Player wins → rewards
- **Paid Off** - Successfully bribed

## Best Loot Drops

**Legendary Items:**
- Iron Jack's Rifle (10% drop)
- Scar-Touched Artifact from Hellhound (20%)
- Spirit-Blessed Staff from Old Grandfather (15%)
- Widow's Rifle from Bloody Mary (15%)

**Epic Items:**
- Master Hunter Badge (Iron Jack, 30%)
- Twin Tomahawks (Comanche Twins, 20%)
- Shadow Essence (Hellhound, 30%)

**First Defeat Bonuses:**
- Iron Jack: "Unbroken Record Trophy" (legendary)
- Hellhound: "Hellhound's Heart" (legendary)

## Rewards by Difficulty

| Difficulty | Gold | XP | Rep |
|------------|------|-----|-----|
| Legendary | 400-1000g | 5000-6000 | 100-150 |
| Master | 250-600g | 3000-4000 | 60-90 |
| Professional | 150-500g | 1800-3500 | 40-75 |
| Standard | 100-400g | 1200-2000 | 30-80 |
| Novice | 50-150g | 800 | 20 |

## Strategic Tips

### Avoiding Hunters
1. Keep bounty below 500g (no spawns)
2. Stay in territories without hunters
3. Pay off bounties regularly
4. Hire hunters to protect you (future)

### Defeating Hunters
1. Target weakest first (The Kid, Gentleman James)
2. Prepare for multi-enemy fights (Twins, Marshal's Men)
3. Stock healing items for tough fights
4. Use environmental advantages

### Hiring Hunters
1. **Best Value:** Copper Kate (cheap, good success)
2. **High Stakes:** Comanche Twins (expensive, reliable)
3. **Experiment:** The Kid (cheap, risky)
4. **Social Targets:** Gentleman James (wealthy criminals)

### Payoff Strategy
- Calculate: Is payoff cheaper than jail time?
- Copper Kate: Always negotiable
- El Cazador: Sometimes accepts
- The Kid: Easily convinced
- Others: Save your gold

## Integration Checklist

- [ ] Add `startHunterTrackingJob()` to server startup
- [ ] Create frontend encounter UI
- [ ] Integrate with combat system
- [ ] Create notification system for hunter spawns
- [ ] Add hunter positions to map (optional)
- [ ] Implement The Kid quest line (future)
- [ ] Test all hunter types
- [ ] Monitor spawn rates
- [ ] Balance economy impact

## Common Use Cases

### Player with High Bounty
```typescript
// Check for hunter spawn after crime
const spawn = await checkHunterSpawn(characterId, location);
if (spawn.shouldSpawn) {
  // Create encounter, notify player
  const encounter = await createEncounter(...);
}
```

### Hiring a Hunter
```typescript
// Player wants revenge
const result = await hireHunter(
  'hunter_copper_kate',
  enemyCharacterId,
  playerId
);
// Copper Kate tracks enemy for 24 hours
```

### Encountering a Hunter
```typescript
// Player encounters Iron Jack
const encounter = getActiveEncounters(characterId);
// Options: fight, negotiate (no), payoff (no), surrender
// Player must fight or flee
```

### Paying Off a Hunter
```typescript
// Player encounters Copper Kate
const bounty = 1000; // gold
const payoff = bounty * 1.5; // 1500 gold
const result = await payOffHunter(encounterId, characterId);
// Kate accepts, player pays 1500g, encounter ends
```

## Hunter Personalities

**Professional:**
- Iron Jack: Cold, respectful
- Copper Kate: Business-like, fair

**Spiritual:**
- Old Grandfather: Wise, prophetic
- Comanche Twins: Silent, coordinated

**Vengeful:**
- Bloody Mary: Angry, traumatized

**Charismatic:**
- El Cazador: Charming, duplicitous
- Gentleman James: Sophisticated, condescending

**Dutiful:**
- Marshal's Men: By-the-book, honorable

**Mysterious:**
- Hellhound: Inhuman, terrifying

**Naive:**
- The Kid: Enthusiastic, learning

## When Each Hunter Shines

**Iron Jack:** End-game challenge, 5000+ bounties
**Hellhound:** The Scar exploration, supernatural crimes
**Old Grandfather:** Coalition storylines, spiritual quests
**Bloody Mary:** Open terrain combat, moral dilemmas
**Comanche Twins:** Wilderness hunts, tracking challenges
**El Cazador:** Frontera politics, intrigue
**Copper Kate:** Player favorite, reasonable difficulty
**Marshal's Men:** Lawful encounters, proper trials
**Gentleman James:** High society, white-collar crimes
**The Kid:** Early game, mentorship potential

---

**Quick Access:**
- Full Report: `BOUNTY_HUNTER_IMPLEMENTATION_REPORT.md`
- Data File: `server/src/data/bountyHunters.ts`
- Service: `server/src/services/bountyHunter.service.ts`
- Types: `shared/src/types/bountyHunter.types.ts`
