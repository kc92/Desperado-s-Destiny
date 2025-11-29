# Shooting Contest System - Phase 13, Wave 13.2

## Implementation Complete

A comprehensive Western marksmanship competition system has been successfully implemented for Desperados Destiny.

---

## Files Created

### Type Definitions
- **`shared/src/types/shooting.types.ts`** (584 lines)
  - Complete type system for shooting contests
  - 6 contest types with full definitions
  - Comprehensive scoring mechanics
  - Weather and accuracy factors
  - Leaderboard and record types

### Data Files
- **`server/src/data/shootingTargets.ts`** (287 lines)
  - 20+ predefined targets
  - Target sets for each contest type
  - Hit zone definitions
  - Size and movement modifiers

- **`server/src/data/shootingContests.ts`** (597 lines)
  - 10 contest templates (daily, weekly, monthly, annual)
  - Prize structures for all contest sizes
  - Prestigious events configuration
  - Recurring contest scheduling logic

### Models
- **`server/src/models/ShootingContest.model.ts`** (366 lines)
  - Complete contest state tracking
  - Round management
  - Participant tracking
  - Weather conditions
  - Mongoose schema with indexes

- **`server/src/models/ShootingRecord.model.ts`** (290 lines)
  - Personal best tracking per contest type
  - Win/loss records
  - Win streak tracking
  - Title management
  - Leaderboard support

### Services
- **`server/src/services/shootingMechanics.service.ts`** (421 lines)
  - Shot resolution with skill-based accuracy
  - Complex accuracy factor calculations
  - Bonus multiplier system
  - Weather penalty system
  - Fatigue mechanics
  - Scoring algorithms

- **`server/src/services/shootingContest.service.ts`** (558 lines)
  - Contest lifecycle management
  - Registration and validation
  - Round progression
  - Prize distribution
  - Leaderboard generation
  - Recurring contest scheduling

---

## Contest Types Implemented

### 1. TARGET SHOOTING
**Standard bullseye shooting competition**
- Fixed targets at 50-200 feet
- Multiple rounds with increasing difficulty
- Score based on hit zones (bullseye, inner, middle, outer)
- Ideal for: Pistols and rifles

**Weekly Event: Red Gulch Shootout**
- Entry fee: 100 gold
- Prize pool: 2,400+ gold
- 24 max participants
- Mixed pistol and rifle competition

### 2. QUICK DRAW
**Speed-based gunslinger competition**
- Draw and fire at signal
- Silhouette targets at 25-30 feet
- Time-based scoring (fastest accurate shot wins)
- Bracket elimination format

**Weekly Event: Quick Draw Showdown**
- Entry fee: 200 gold
- Prize: 3,200+ gold + "Fastest Gun" title
- Pure speed competition
- 1.5 second time limit in finals

### 3. TRICK SHOOTING
**Spectacular showmanship shooting**
- Coins, bottles, playing cards
- Moving targets and pendulums
- Showmanship scoring with crowd bonuses
- Most diverse target set

**Monthly Event: Trick Shot Spectacular**
- Entry fee: 250 gold
- Prize: 4,000+ gold + "Trick Shot Artist" title
- 15 difficult shots in finals

**Annual Event: Annie Oakley Memorial**
- Entry fee: 1,000 gold
- Prize: 12,000+ gold + legendary weapon
- Invitation only (3+ wins required)
- Most prestigious trick shooting event

### 4. SKEET SHOOTING
**Clay pigeon shooting**
- Flying clay disks
- Multiple trajectories (straight, crossing, high)
- Shotgun only
- Timing and reflexes critical

**Weekly Event: Skeet Shooting Challenge**
- Entry fee: 75 gold
- Prize pool: 1,500+ gold
- 20 targets in finals
- 3-second time limit

### 5. LONG RANGE
**Extreme distance rifle shooting**
- 500-1000 feet targets
- Wind and weather heavily impact shots
- Rifle only (Winchester, Sharps, competition rifles)
- Single shot per round

**Monthly Event: Long Range Rifle Competition**
- Entry fee: 300 gold
- Prize: 6,000+ gold + "Long Range Specialist" title
- 30-second shot timer
- 1000-foot championship distance

### 6. DUELING (Exhibition)
**Non-lethal exhibition dueling**
- Wax bullets
- First hit wins
- Reputation at stake
- Fast-paced elimination

**Weekly Event: Frontera Underground Exhibition**
- Entry fee: 150 gold
- Prize: 2,400+ gold + "Underground Champion" title
- No-rules underground arena
- 1-second time limit in finals

---

## Key Features

### Accuracy System
**Multi-factor skill calculation:**
- Base marksmanship skill (0-100)
- Weapon accuracy bonuses
- Distance penalties (pistol/rifle/shotgun tables)
- Weather conditions (wind, rain, dust storms)
- Fatigue from consecutive shots (-2% per shot, max -20%)
- Target size modifiers (small/medium/large)
- Movement penalties (stationary to random)
- Final hit chance clamped to 5-95%

### Scoring Systems
1. **Total Points** - Sum of all shot points with bonuses
2. **Average Accuracy** - Percentage-based scoring
3. **Time-Based** - Fastest accurate shots win
4. **Elimination** - Last shooter standing

### Bonus Multipliers
- **Perfect Accuracy**: +50% bonus (100% hits)
- **Fast Completion**: +25% (under 2 seconds), +10% (under 4 seconds)
- **Consecutive Hits**: +10% per consecutive hit (3+ streak)

### Weather System
**Dynamic conditions affect outdoor contests:**
- Wind speed (0-30 mph) with directional impact
- Temperature (70-100°F)
- Precipitation (clear, light rain, heavy rain, dust storm)
- Visibility (0-100%)
- Location-specific weather patterns

**Weather Penalties:**
- Wind: Up to -10% at extreme distances
- Light rain: -5%
- Heavy rain: -15%
- Dust storm: -25% + reduced visibility
- Low visibility: Up to -20%
- Max combined penalty: -40%

### Weapons Allowed

**Pistols:**
- **Revolver**: Standard (no modifiers)
- **Derringer**: Quick draw only (-10% accuracy, +25% speed)
- **Competition Pistol**: (+15% accuracy, -5% speed)

**Rifles:**
- **Winchester**: Medium range (+5% accuracy)
- **Sharps Rifle**: Long range specialist (+20% accuracy, -10% speed)
- **Competition Rifle**: Maximum accuracy (+25% accuracy, -10% speed)

**Shotguns:**
- **Shotgun**: Skeet only (-5% accuracy, +5% speed, scatter bonus)

### Distance Penalties

**Pistol Ranges:**
- Close (0-50 ft): No penalty
- Medium (51-100 ft): -15%
- Long (101-200 ft): -40%
- Extreme (201-500 ft): -80%

**Rifle Ranges:**
- Close (0-100 ft): No penalty
- Medium (101-300 ft): -10%
- Long (301-800 ft): -25%
- Extreme (801-1500 ft): -50%

**Shotgun Ranges:**
- Close (0-30 ft): No penalty
- Medium (31-60 ft): -20%
- Long (61-100 ft): -60%
- Extreme (101-150 ft): -95%

---

## Contest Lifecycle

### 1. Registration Phase
- Players join with entry fee
- Select allowed weapon
- Level requirement check
- Max participants limit
- Registration ends 30 minutes before start

### 2. Contest Start
- Minimum participants required
- Weather generated for outdoor events
- First round activated
- Participants seeded

### 3. Round Progression
- **Qualification**: All participants shoot
- **Elimination**: Bottom performers cut
- **Semifinals**: Top shooters advance
- **Finals**: Championship round
- **Shootoff**: Tiebreaker if needed

### 4. Shot Resolution
Each shot calculates:
- Accuracy factors (skill, weapon, distance, weather, fatigue)
- Hit/miss determination
- Hit zone selection (if hit)
- Points awarded
- Time recorded
- Fatigue applied

### 5. Round Completion
- Players ranked by score
- Eliminations processed
- Total scores updated
- Next round activated or contest ends

### 6. Contest Completion
- Final rankings determined
- Prizes distributed (gold, titles, items, reputation)
- Records updated (personal bests, win streaks)
- Leaderboards updated

---

## Records & Leaderboards

### Personal Records
**Tracked per contest type:**
- Best score
- Best accuracy percentage
- Fastest time
- Contest where achieved
- Date achieved

### Statistics
- Total contests entered
- Total contests won
- Total prize money earned
- Current win streak
- Best win streak
- Titles earned

### Leaderboards
**Multiple leaderboard types:**
1. **Most Wins** - Overall champions
2. **Prize Money** - Biggest earners
3. **Contest Type** - Best per discipline
4. **Accuracy** - Most precise shooters
5. **Win Streak** - Hottest shooters

---

## Prestigious Events

### Weekly Prestigous
1. **Red Gulch Shootout** (Saturday 3pm)
   - Mixed events, all skill levels
   - 100 gold entry, 500+ gold prize pool

2. **Quick Draw Showdown** (Sunday noon)
   - "Fastest Gun" title
   - 200 gold entry, 800+ gold for winner

### Monthly Championships
1. **Frontier Marksmanship Championship** (15th, noon)
   - All disciplines
   - 500 gold entry
   - 5,000 gold + championship rifle + "Frontier Marksman" title

2. **Long Range Rifle Competition** (1st, 10am)
   - Extreme distance specialty
   - 300 gold entry
   - "Long Range Specialist" title

3. **Trick Shot Spectacular** (20th, 2pm)
   - Showmanship focus
   - "Trick Shot Artist" title

### Annual Special Events
1. **Annie Oakley Memorial** (Mid-year)
   - **Invitation Only** - Requires 3+ wins
   - 1,000 gold entry
   - 5,000 gold + legendary trick pistol
   - "Legendary Sharpshooter" title
   - Most prestigious event in the territory

---

## Shooting Locations

1. **Red Gulch Shooting Range**
   - Standard outdoor range
   - Daily practice contests
   - Moderate weather conditions

2. **Fort Ashford Military Range**
   - Professional military facility
   - Long range rifle focus
   - Often windy conditions
   - Monthly championships

3. **Whiskey Bend Exhibition Grounds**
   - Showmanship venue
   - Trick shooting specialty
   - Optimal weather conditions
   - Crowd favorite bonuses

4. **The Frontera Underground Arena**
   - No-rules underground venue
   - Exhibition dueling
   - No weather (indoor)
   - Dim lighting conditions

5. **Silver Creek Outdoor Range**
   - Community range
   - Quick draw events
   - Variable conditions

6. **Desperado Valley Competition Grounds**
   - Premium championship venue
   - Annual special events
   - Best facilities

---

## Target Variety

### Fixed Targets
- **Bullseye**: 4 hit zones (bullseye to outer ring)
- **Silhouette**: 3 zones (head, torso, limbs)
- **Bottle**: Single hit, small target
- **Apple**: Small target on post
- **Card Edge**: Extreme difficulty (200 points)

### Moving Targets
- **Linear**: Straight-line movement (-15% penalty)
- **Pendulum**: Swinging motion (-25% penalty)
- **Random**: Unpredictable (-35% penalty)

### Flying Targets
- **Clay Pigeon**: Various trajectories (-15% to -30%)
- **Coin Toss**: Arcing trajectory (150 points)

### Distance Ranges
- Close: 20-50 feet
- Medium: 50-100 feet
- Long: 100-300 feet
- Extreme: 500-1000 feet

---

## Prize Structures

### Small Contests (4-9 players)
1st: 300 gold + 15 reputation
2nd: 150 gold + 8 reputation
3rd: 50 gold + 3 reputation

### Medium Contests (10-20 players)
1st: 600 gold + 25 reputation
2nd: 350 gold + 15 reputation
3rd: 200 gold + 8 reputation
4th: 100 gold + 4 reputation
5th: 50 gold + 2 reputation

### Large Contests (21+ players)
1st: 1,000 gold + 40 reputation
2nd: 600 gold + 25 reputation
3rd: 350 gold + 15 reputation
Plus 3 more paid positions

### Championship Events
- Top prizes: 5,000+ gold
- Legendary weapons
- Exclusive titles
- 100+ reputation

---

## Title System

### Earned Titles
- **"Fastest Gun"** - Quick Draw champion
- **"Frontier Marksman"** - Championship winner
- **"Master Shooter"** - Championship runner-up
- **"Expert Marksman"** - Championship 3rd place
- **"Trick Shot Artist"** - Trick shooting champion
- **"Long Range Specialist"** - Long range champion
- **"Legendary Sharpshooter"** - Annie Oakley Memorial winner
- **"Master of the Impossible"** - Annie Oakley 2nd place
- **"Underground Champion"** - Frontera dueling winner

### Title Benefits
- Displayed on character profile
- Reputation bonuses
- Social prestige
- Event invitation requirements

---

## Integration Points

### Character System
- Marksmanship skill determines base accuracy
- Level requirements for contests
- Character records tracking

### Economy System
- Entry fees collected
- Prize pools distributed
- Gold transactions logged

### Reputation System
- Contest wins award reputation
- Titles boost standing
- Leaderboard rankings

### Item System
- Weapon selection impacts performance
- Championship weapons awarded
- Equipment bonuses applied

### Social System
- Leaderboards create competition
- Titles provide prestige
- Community events

---

## Technical Architecture

### Models
- **ShootingContest**: Contest instances with rounds and scores
- **ShootingRecord**: Player statistics and records
- Mongoose schemas with proper indexing
- TypeScript interfaces for type safety

### Services
- **ShootingContestService**: Contest lifecycle management
- **ShootingMechanicsService**: Shot resolution and calculations
- Separation of concerns
- Reusable calculation methods

### Data Files
- **Contest templates**: Reusable event configurations
- **Target definitions**: Pre-built target sets
- **Prize structures**: Scalable reward systems

---

## Future Enhancements

### Potential Additions
1. **Team Competitions**: Gang vs gang shooting contests
2. **Tournament Brackets**: Single/double elimination
3. **Spectator Mode**: Watch contests in progress
4. **Betting System**: Wager on contest outcomes
5. **Special Ammunition**: Different bullet types
6. **Custom Contests**: Player-created events
7. **Achievement System**: Special shooting achievements
8. **Training Grounds**: Practice mode
9. **Historical Records**: All-time leaderboards
10. **Seasonal Championships**: Quarterly mega-events

### Gameplay Variations
- **Moving Shooter**: Shoot while riding/running
- **Dual Wielding**: Two-gun contests
- **Night Shooting**: Low visibility challenges
- **Mounted Shooting**: Horse-mounted targets
- **Extreme Weather**: Storm shooting challenges

---

## Code Quality

### TypeScript Compilation
✅ All shooting types compile successfully
✅ No naming conflicts (renamed ShotResult → ShootingShotResult)
✅ Proper type exports in shared package
✅ Server-side models and services type-safe

### Best Practices
- Clear separation of concerns
- Reusable service methods
- Comprehensive type definitions
- Proper error handling
- Scalable architecture

### Documentation
- Inline code comments
- JSDoc documentation
- Type definitions with descriptions
- Clear naming conventions

---

## Summary

The Shooting Contest System brings authentic Western marksmanship competitions to Desperados Destiny with:

- **6 distinct contest types** with unique mechanics
- **10 recurring events** from daily to annual
- **Complex accuracy system** with 8+ factors
- **20+ target varieties** across all disciplines
- **Dynamic weather** affecting outdoor contests
- **Comprehensive records** and leaderboards
- **Prestigious titles** and legendary rewards
- **Complete lifecycle management** from registration to prizes

Players can compete in:
- Daily practice contests (25-50 gold entry)
- Weekly showdowns (100-200 gold entry)
- Monthly championships (250-500 gold entry)
- Annual special events (1,000+ gold entry)

With realistic shooting mechanics, skill-based gameplay, and thrilling Western competition, the system captures the spirit of Old West marksmanship while providing engaging multiplayer content.

**The fastest guns in the territory are ready to prove their worth!**
