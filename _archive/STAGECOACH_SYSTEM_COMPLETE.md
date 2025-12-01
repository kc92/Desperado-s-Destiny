# Stagecoach System Implementation - Complete

## Overview
Comprehensive stagecoach transportation and ambush system for Desperados Destiny. Provides authentic Western travel experience with booking, journeys, random encounters, and ambush mechanics (both attack and defense).

## Files Created

### Type Definitions
**Location:** `shared/src/types/stagecoach.types.ts`
- 30+ TypeScript interfaces for complete stagecoach system
- All stagecoach types, routes, passengers, cargo, ambushes
- Renamed types to avoid collisions: `StagecoachCargoItem`, `StagecoachRouteStop`, `StagecoachCargoManifest`
- API response types for all endpoints

### Data Files

#### 1. **Stagecoach Routes** (`server/src/data/stagecoachRoutes.ts`)
**9 Complete Routes:**
1. Red Gulch - Longhorn Ranch Line (danger 4)
2. Longhorn Ranch - Kaiowa Mesa Line (danger 5)
3. Whiskey Bend - Spirit Springs Express (danger 6)
4. Frontera - Wastes Line **DANGEROUS** (danger 9)
5. Fort Ashford Military Circuit (danger 5)
6. Sacred Path to Thunderbird's Perch **Coalition Only** (danger 7)
7. Goldfinger's Mining Circuit (danger 8)
8. The Death Route (Wastes to Scar) **EXTREMELY DANGEROUS** (danger 10)
9. Silver City Express **Luxury** (danger 3)

**Each route includes:**
- Multiple stops with detailed information
- Distance, duration, terrain types
- Dynamic fares (base + per mile)
- Weather effects
- Scheduled departures
- Danger levels affecting encounters

#### 2. **Way Stations** (`server/src/data/wayStations.ts`)
**11 Way Stations:**
1. Copper Trail Way Station (respectable, safe)
2. Canyon Rest Stop (minimal facilities)
3. Grassland Crossing (border station)
4. Dead Man's Gulch (outlaw territory, dangerous)
5. Settler's Rest Post (military-adjacent, very safe)
6. Ancient Oak Grove (Nahi Coalition sacred site)
7. Bone Valley (abandoned, cursed)
8. Silver Creek Station (mining hub, busy)
9. Dusty Diggings Rest (cheap, rough)
10. Scar Edge Camp (desperate, expensive)
11. Paradise Springs Resort (luxury, hot springs)

**Each station includes:**
- Facilities (stables, rooms, saloon, blacksmith)
- Services (horse changes, repairs, food, lodging)
- Prices
- NPCs present
- Danger level and reputation
- Regional location

#### 3. **Random Encounters** (`server/src/data/stagecoachEncounters.ts`)
**15+ Random Encounters** organized by danger level:

**Low Danger (1-3):**
- Lone traveler (might be bandit scout)
- Wildlife crossing
- Weather delays

**Medium Danger (4-6):**
- Bandit sightings on ridge
- Wheel breakdown
- Coordinated ambush
- Fake lawmen inspection

**High Danger (7-10):**
- Professional outlaw ambush
- Comanche Twins bounty hunters
- Catastrophic crash
- Violent dust storm

**Each encounter includes:**
- Multiple choice options
- Skill checks (cunning, spirit, gunslinger, craft)
- Success/failure consequences
- Rewards (gold, XP, reputation)

### Models

#### **StagecoachTicket Model** (`server/src/models/StagecoachTicket.model.ts`)
- Mongoose schema for ticket management
- Status tracking (booked → boarding → traveling → completed)
- Refund system (80% refund up to 1 hour before departure)
- Passenger details (luggage, weapons declared)
- Virtual properties: progress%, duration, refundable status
- Static methods for querying active tickets

### Services

#### 1. **Stagecoach Service** (`server/src/services/stagecoach.service.ts`)
**Main Features:**
- Get available routes and schedules
- Book tickets with validation
- Dynamic seat availability
- Fare calculation
- Create stagecoach instances
- NPC driver generation (skill-based)
- NPC guard generation (danger-based)
- Cargo manifest generation
- Cancel tickets with refunds
- Travel progress tracking
- Journey completion
- Travel history

**Booking System:**
- Check character location
- Validate route and stops
- Calculate fares dynamically
- Assign seat numbers
- Deduct gold via GoldService
- Create ticket and stagecoach instance

**Stagecoach Types:**
- Passenger (standard transport)
- Mail (Wells Fargo, protected)
- Treasure (armored, heavy guards)
- Private (charter, luxury)

#### 2. **Stagecoach Ambush Service** (`server/src/services/stagecoachAmbush.service.ts`)
**Ambush Spots:**
- 10 pre-defined ambush locations across routes
- Location types: canyon_pass, river_crossing, hill_road, bridge, way_station, forest_path
- Cover quality ratings (1-10)
- Visibility ranges
- Escape route counts
- Terrain advantages

**Attack Mechanics:**
- Plan ambush with gang members
- Setup time based on strategy
- Success calculation:
  - Cover quality
  - Attacker level and numbers
  - Route danger (guard strength)
  - Location bonuses
- Loot generation:
  - Mail (always present)
  - Parcels (random)
  - Strongbox (high danger routes)
  - Total values: 200-3000+ gold
- Consequences:
  - Bounty increases
  - Witness tracking
  - Heat level (law response)
  - Criminal reputation gains

**Defense Mechanics:**
- Player as passenger can defend
- Combat skill checks
- Rewards for successful defense
- Casualties and damage tracking
- Gold and XP rewards

**Gang Loot Distribution:**
- Leader gets 15% bonus
- Even split among members
- Automatic gold distribution
- Item allocation

### Data Constants

**Driver Names:**
- Old Pete, Quick Draw McGraw, Steady Eddie, Iron Will Johnson, Cautious Carl, Daredevil Dan

**Guard Names:**
- Shotgun Sam, Rifle Rick, Quick-Eye Quinn, Steady Steve, Dead-Eye Dave

**Ambush Strategies:**
- Roadblock (30 min setup)
- Canyon Trap (45 min setup)
- Bridge Sabotage (60 min setup)
- Surprise Attack (20 min setup)

## Gameplay Features

### 1. Passenger Experience
- Book tickets at stagecoach stations
- Choose departure times
- Declare weapons (required)
- Luggage weight limits
- Seat assignments
- Real-time travel progress
- Random encounters during journey
- Way station stops
- Defend against ambushes

### 2. Outlaw Opportunities
- Scout routes for ambush spots
- Plan solo or gang ambushes
- Setup time requirements
- Strategic location selection
- Escape routes
- Loot strongboxes for big scores
- Risk vs reward (danger levels)
- Bounty and heat management

### 3. Economic Impact
- Ticket prices: $25-150+
- Way station services: meals ($5-25), rooms ($10-75), horse changes ($15-40)
- Ambush profits: $200-3000+ per successful robbery
- Refund system for cancellations

### 4. Authentic Western Elements
- Wells Fargo protection
- US Marshal inspections
- Dust storms and weather
- Horse changes at way stations
- Mechanical breakdowns
- Wildlife encounters
- Bounty hunter intercepts
- Outlaw territory danger

## Integration Points

### With Existing Systems
1. **Gold System** - Ticket purchases, refunds, loot
2. **Energy System** - Travel energy costs, weather modifiers
3. **Crime System** - Wanted levels, bounties, heat
4. **Gang System** - Group ambushes, loot distribution
5. **Combat System** - Defend/attack encounters
6. **Skill System** - Skill checks in encounters
7. **Location System** - Station locations, travel between
8. **Weather System** - Travel delays, energy cost modifiers
9. **Quest System** - Travel objectives, delivery quests

## Technical Features

### Type Safety
- Comprehensive TypeScript interfaces
- No `any` types
- Proper enums for all categories
- Collision-free type names

### Data Validation
- Character location verification
- Route validation
- Seat availability checks
- Gold balance verification
- Gang membership validation
- Skill level requirements

### Transaction Safety
- Mongoose sessions for atomic operations
- Rollback on failures
- Consistent gold tracking
- Transaction logging

### Scalability
- In-memory stagecoach instances (can be migrated to Redis)
- Efficient query patterns
- Indexed ticket lookups
- Cached route data

## Route Statistics

### Safety Levels
- **Safe (1-3):** Silver Express, Copper Trail, Fort Ashford
- **Moderate (4-6):** Red Gulch-Longhorn, Whiskey-Spirit, Kaiowa Mesa
- **Dangerous (7-8):** Spirit-Thunderbird, Goldfinger Circuit
- **Deadly (9-10):** Frontera-Wastes, Wastes-Scar

### Total Routes: 9
- 3 Main settler routes
- 2 Wilderness routes
- 2 Mining routes
- 1 Outlaw route
- 1 Luxury route

### Total Ambush Spots: 10
Across all major routes, covering all location types

### Total Way Stations: 11
From safe resorts to deadly outposts

## Random Encounter System

### Encounter Rates by Danger
- Danger 1: 5%
- Danger 3: 12%
- Danger 5: 20%
- Danger 7: 30%
- Danger 10: 50%

### Encounter Types
- Ambush (combat)
- Breakdown (mechanical)
- Weather (delays)
- Wildlife (animals)
- Bandit sighting (avoidable)
- Lawmen (inspection)
- Traveler (interaction)

### Skill Checks
- **Cunning:** Detect lies, negotiations, fast-talk
- **Spirit:** Brave actions, rally passengers, endurance
- **Gunslinger:** Combat, shooting, intimidation
- **Craft:** Repairs, improvisation, survival

## Rewards & Consequences

### Positive
- Gold from ambushes: 200-3000+
- XP from encounters: 50-1000
- Reputation gains: 5-100
- Item drops from successful ambushes
- Defensive bonuses

### Negative
- Bounty increases: 100-1000+ gold
- Wanted level increases: +1 to +3
- Criminal reputation increases
- Witness problems
- Heat level (law pursuit)
- Travel delays (hours)
- Stagecoach damage
- Passenger casualties

## Future Expansion Possibilities
1. Scheduled treasure coach runs (special events)
2. Stagecoach company reputation system
3. Player-owned stagecoach lines
4. Contract deliveries (mail/parcel jobs)
5. VIP passenger protection missions
6. Stagecoach racing events
7. Custom charter routes
8. Faction-specific routes
9. Seasonal route changes
10. Historical event ambushes

## Notes

### Code Quality
- All TypeScript compiles successfully
- No linting errors in new files
- Consistent naming conventions
- Comprehensive JSDoc comments
- Error handling throughout

### Balance Considerations
- High risk = high reward
- Luxury routes safe but expensive
- Outlaw routes dangerous but profitable
- Weather adds unpredictability
- Skill checks provide player agency

### Western Authenticity
- Wells Fargo references
- Period-appropriate locations
- Realistic travel times
- Authentic dangers (bandits, weather, breakdown)
- Historical route types
- Proper terminology

## Testing Recommendations
1. Test ticket booking and cancellation
2. Test travel completion
3. Test ambush mechanics
4. Test encounter system
5. Test gang loot distribution
6. Test refund calculations
7. Test seat availability
8. Test fare calculations
9. Integration test with gold system
10. Integration test with gang system

---

**Implementation Status:** COMPLETE
**Files Created:** 7
**Lines of Code:** ~3,000+
**TypeScript Compilation:** SUCCESS
**Integration:** Ready for API endpoints
