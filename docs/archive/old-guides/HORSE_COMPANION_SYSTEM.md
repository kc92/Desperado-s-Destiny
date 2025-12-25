# Horse Companion System - Complete Implementation

**Phase 9, Wave 9.2 - Desperados Destiny**

## Overview

A comprehensive horse ownership, breeding, bonding, and competition system for the Western-themed browser game. Horses are essential companions providing travel bonuses, combat advantages, and prestige.

---

## System Architecture

### Files Created

#### Type Definitions
- `shared/src/types/horse.types.ts` - Complete TypeScript interfaces and enums

#### Data Files
- `server/src/data/horseBreeds.ts` - 15 horse breed definitions with stats
- `server/src/data/horseEquipment.ts` - Saddles, saddlebags, horseshoes, barding, and food
- `server/src/data/horseSkills.ts` - 8 trainable skills with requirements and effects

#### Models
- `server/src/models/Horse.model.ts` - MongoDB schema for horses
- `server/src/models/Stable.model.ts` - MongoDB schema for stables

#### Services
- `server/src/services/horse.service.ts` - Core horse management
- `server/src/services/horseBreeding.service.ts` - Breeding genetics and lineage
- `server/src/services/horseBond.service.ts` - Bond level progression and loyalty
- `server/src/services/horseRacing.service.ts` - Racing, shows, and competitions

---

## Horse Breeds (15 Total)

### Common Breeds (5)
1. **Quarter Horse** - All-around workhorse, $250
2. **Mustang** - Wild caught, high stamina, must be tamed
3. **Paint Horse** - Flashy appearance, +10 charisma when mounted
4. **Morgan** - Beginner-friendly, 20% faster training
5. **Appaloosa** - Native breed, night vision ability

### Quality Breeds (5)
6. **Tennessee Walker** - Smooth gait, 30% reduced rider fatigue
7. **American Standardbred** - Racing specialist, 20% slower stamina drain
8. **Missouri Fox Trotter** - Mountain expert, 50% reduced rough terrain injury
9. **Thoroughbred** - Speed champion, +20% race performance
10. **Arabian** - Desert bred, 50% reduced heat/thirst effects

### Rare Breeds (5)
11. **Andalusian** - War horse, never flees, +20% mounted combat
12. **Friesian** - Majestic black stallion, -10% enemy morale
13. **Akhal-Teke** - Golden coat, can travel 50% longer without rest
14. **Percheron** - Draft horse, +100% carry capacity
15. **Legendary Wild Stallion** - Cannot be purchased, extremely rare encounter, 90-100 in all stats

---

## Core Horse Stats

Each horse has five core stats (1-100):

- **Speed** - Travel speed and racing performance
- **Stamina** - Endurance and distance capability
- **Health** - Durability and injury resistance
- **Bravery** - Combat performance and fear resistance
- **Temperament** - Ease of handling and training

### Derived Stats
- **Carry Capacity** - How much the horse can carry
- **Travel Speed Bonus** - Overland movement improvement
- **Combat Bonus** - Mounted combat effectiveness

---

## Bond System

### Bond Levels (0-100)

| Level | Range | Name | Benefits |
|-------|-------|------|----------|
| 1 | 0-20 | Stranger | Basic commands only, may refuse, will flee |
| 2 | 21-40 | Acquaintance | More responsive, +5% travel speed |
| 3 | 41-60 | Partner | Whistle recall, +10% travel, +5% combat |
| 4 | 61-80 | Companion | Combat bonuses, warns of danger, +15% travel |
| 5 | 81-100 | Bonded | Never flees, maximum loyalty, +20% all bonuses |

### Bond Activities

| Activity | Bond Change | Trust Change |
|----------|-------------|--------------|
| Feed (basic) | +2 | +1 |
| Feed (quality) | +5 | +2 |
| Feed (premium) | +8 | +3 |
| Groom | +5 | +2 |
| Ride (short) | +1 | - |
| Ride (long) | +3 | - |
| Train together | +5 | +3 |
| Combat victory | +5 | +2 |
| Save from danger | +15 | +10 |
| Neglect (minor) | -5 | -2 |
| Neglect (major) | -10 | -5 |
| Abuse | -20 | -15 |

### Special Bond Features

- **Whistle Recall** (Partner+): Call horse from distance
  - Partner: 1 mile range
  - Companion: 3 mile range
  - Bonded: 10 mile range

- **Loyalty** (Bonded): Horse will never flee, even in mortal danger

- **Death Trauma** (Bonded): If horse dies, -50% effectiveness for 7 days

---

## Training System

### 8 Trainable Skills

1. **Speed Burst**
   - Requirement: Bond 20, Speed 60
   - Effect: +30% speed for 30 seconds (1 hour cooldown)
   - Training: 24 hours, $100

2. **Sure-Footed**
   - Requirement: Bond 30, Stamina 50
   - Effect: 70% reduced trip chance, no rough terrain penalty
   - Training: 36 hours, $150

3. **War Horse**
   - Requirement: Bond 50, Bravery 70
   - Effect: Never flees, immune to intimidation, +20% mounted combat
   - Training: 48 hours, $200

4. **Trick Horse**
   - Requirement: Bond 40, Temperament 60
   - Effect: Performs tricks, +15 charisma, bonus in shows
   - Training: 30 hours, $120

5. **Draft Training**
   - Requirement: Bond 20, Health 60
   - Effect: +50% carry capacity, can pull wagons
   - Training: 24 hours, $100

6. **Racing Form**
   - Requirement: Bond 35, Speed 70, Speed Burst skill
   - Effect: +25% race effectiveness, optimal pacing
   - Training: 40 hours, $180

7. **Stealth**
   - Requirement: Bond 45, Temperament 65
   - Effect: 60% quieter, -40% detection range
   - Training: 32 hours, $140

8. **Endurance**
   - Requirement: Bond 40, Stamina 75
   - Effect: +50% stamina duration, +30% regen, +25% daily travel
   - Training: 48 hours, $160

### Skill Synergies

- **Champion Racer** (Speed Burst + Racing Form): +10% additional race score
- **Cavalry Mount** (War Horse + Endurance): No stamina penalty in extended combat
- **Ghost Rider** (Stealth + Sure-Footed): Silent movement through any terrain
- **Show Star** (Trick Horse + Endurance): +15% bonus in skill shows
- **Long Hauler** (Draft Training + Endurance): No speed penalty for heavy loads

---

## Equipment System

### Saddles
- **Basic Saddle** - $50, no bonuses
- **Racing Saddle** - $200, +5 speed, -5 stamina
- **Endurance Saddle** - $250, +8 stamina
- **Cavalry Saddle** - $300, +10 combat, +3 bravery
- **Vaquero Saddle** (Rare) - $500, +3 speed, +5 stamina, +15 carry
- **War Saddle** (Rare) - $600, +20 combat, +5 bravery, -3 speed
- **Legendary Saddle** - $2000, +5 speed, +10 stamina, +5 health, +15 combat, +20 carry

### Saddlebags
- **Small Saddlebags** - $20, +10 carry
- **Leather Saddlebags** - $45, +20 carry
- **Reinforced Saddlebags** - $100, +35 carry
- **Expedition Saddlebags** - $150, +50 carry, -2 stamina
- **Merchant's Saddlebags** (Rare) - $350, +75 carry, -1 stamina

### Horseshoes
- **Basic Horseshoes** - $15, +2 health
- **Steel Horseshoes** - $40, +3 health, +2 speed
- **Mountain Horseshoes** - $60, +5 health, +3 stamina
- **Racing Horseshoes** (Rare) - $150, +5 speed, +1 health
- **Enchanted Horseshoes** (Legendary) - $800, +5 speed, +10 stamina, +5 health

### Barding (Armor)
- **Leather Barding** - $200, +10 health, +5 combat, -3 speed
- **Chainmail Barding** (Rare) - $500, +20 health, +5 bravery, +10 combat, -5 speed
- **Plate Barding** (Rare) - $800, +30 health, +10 bravery, +20 combat, -8 speed
- **Conquistador Barding** (Legendary) - $2500, +25 health, +15 bravery, +30 combat, -5 speed
- **Spirit Barding** (Legendary) - $3000, +20 health, +10 bravery, +25 combat, +5 speed, +5 stamina

### Horse Food
- **Hay** - $1, +30 hunger, +2 bond
- **Oats** - $2, +40 hunger, +3 bond, +5 stamina
- **Mixed Grain** - $5, +60 hunger, +5 bond, +10 stamina
- **Alfalfa** - $4, +50 hunger, +4 bond, +5 health
- **Premium Mix** - $10, +80 hunger, +8 bond, +15 stamina, +5 health
- **Apple Treats** - $8, +40 hunger, +10 bond
- **Champion Feed** - $15, +100 hunger, +10 bond, +20 stamina, +10 health

---

## Breeding System

### Mechanics

- **Requirements**: Stallion (3-20 years) + Mare (4-16 years)
- **Gestation**: 330 days (~11 months)
- **Cooldown**: 365 days between pregnancies
- **Success Rate**: 75% base, modified by health, bond, age, compatibility

### Genetics

Foal stats are calculated as:
```
Foal Stat = Average(Sire Stat, Dam Stat) ± 15% variance
```

Additional factors:
- 10% chance for minor mutation (±5 to one stat)
- 5% chance for exceptional foal (+3 to all stats, +1 max skill)
- Breed inherits from either parent (50/50)
- Color selected randomly from breed's color palette

### Exceptional Traits (5% chance)

When foals are exceptional, they can gain special traits:
- **Champion Bloodline**: +5% in all races
- **Natural Warrior**: +10% combat effectiveness
- **Iron Constitution**: +20 max health
- **Boundless Energy**: +15% stamina regeneration
- **Swift as Wind**: +10% travel speed
- **Fearless Heart**: Immune to intimidation
- **Quick Learner**: -25% training time
- **Hardy**: Immune to minor injuries
- **Elegant Gait**: +15 rider charisma
- **Eagle Eyes**: Enhanced perception

### Breeding Lineage

Full genealogy tracking:
- Parents (sire/dam)
- Grandparents (4 total)
- Offspring (all foals)
- Statistics on breeding success
- Compatibility recommendations

---

## Racing & Shows

### Racing

**Race Types**:
- Sprint (1-2 miles) - Speed focused
- Endurance (5-10 miles) - Stamina focused
- Cross-Country (varied terrain) - All-around

**Race Score Calculation**:
```
Score = (Speed × 4) + (Stamina × 3) + (Condition × 2) + (Bond × 1) + Equipment
Modifiers: Racing Form skill (+20%), Speed Burst (+10%), Randomness (±10%)
```

**Prizes**:
- 1st Place: 50% of prize pool
- 2nd Place: 30% of prize pool
- 3rd Place: 20% of prize pool

### Horse Shows

**Show Types**:

1. **Beauty Show**
   - Judges: Appearance, grooming, breed characteristics
   - Bonuses: Arabian, Friesian, Andalusian (+30%)
   - Requirements: Cleanliness >70%, Hunger >60%

2. **Skill Show**
   - Judges: Trained abilities and tricks
   - Bonuses: Trick Horse skill (+100 points)
   - Scores: Points per trained skill

3. **Obedience Show**
   - Judges: Responsiveness and discipline
   - Bonuses: War Horse skill (+80 points)
   - Scores: Temperament, Bond, Trust

**Prizes**: $200 / $100 / $50 for 1st/2nd/3rd

---

## Stable Management

### Stable Features

- **Capacity**: 3-20 horses
- **Location**: Tied to specific towns
- **Quality**: Basic / Standard / Premium
- **Daily Upkeep**: $5 base + services

### Facilities (Upgrades)

1. **Training Grounds** - +$5/day, enables on-site training
2. **Breeding Pen** - +$3/day, enables breeding
3. **Veterinarian** - +$10/day, auto-heal injuries

### Services

1. **Auto-Feed** - +$2 per horse per day
2. **Auto-Groom** - +$1 per horse per day
3. **Training Service** - +$3 per horse per day

### Stable Upgrades

- **Capacity Expansion**: Add 1-5 slots
- **Quality Upgrade**: Basic → Standard → Premium
- **Facility Construction**: Add facilities
- **Service Activation**: Enable automated care

---

## Horse Care & Condition

### Condition Metrics

- **Current Health**: Damaged in combat/accidents
- **Current Stamina**: Depleted by travel/races/combat
- **Hunger**: 0-100, decreases 2 per hour
- **Cleanliness**: 0-100, decreases 1 per hour
- **Mood**: Excellent / Good / Fair / Poor / Injured

### Care Needs

| Need | Trigger | Urgency |
|------|---------|---------|
| Feeding | Hunger <50 | Medium |
| Grooming | Cleanliness <50 | Low |
| Veterinary | Health <70% | High |
| Rest | Stamina <50% | Medium |
| CRITICAL | Hunger <20 OR Health <30% | CRITICAL |

### Neglect Penalties

- **24+ hours**: -1 bond per day
- **7+ days**: -2 bond per day, trust decay
- **30+ days**: -3 bond per day, loss of loyalty

---

## Combat Integration

### Mounted Combat Bonuses

Calculated based on horse stats and bond:

```typescript
Attack Bonus = (Speed / 10) × (1 + Bond/100) + Combat Equipment
Defense Bonus = (Health / 10) × (1 + Bond/100) + Combat Equipment
Initiative Bonus = Speed / 5
Intimidation Bonus = Bravery / 10
```

### War Horse Benefits

- **Never Flees**: Even at low health
- **Immune to Intimidation**: Enemy fear tactics ineffective
- **+20% Combat**: All mounted combat actions
- **Protects Owner**: Can shield rider from damage

### Flee Mechanics

| Bond Level | Flee Chance |
|------------|-------------|
| Stranger | 50 - Bravery |
| Acquaintance | 40 - Bravery |
| Partner | 30 - Bravery |
| Companion | 20 - Bravery |
| Bonded | 0% (never) |

---

## Travel Benefits

### Speed Bonuses

Base travel speed increased by:
- Bond Level: +0% to +20%
- Equipment: Varies by saddle/shoes
- Skills: Endurance (+25% distance)
- Breed: Special abilities (e.g., Akhal-Teke +50%)

### Stamina Management

Stamina cost per mile of travel:
- Base: 2 stamina per mile
- Modified by: Endurance skill, equipment, terrain
- Recovery: 5 stamina per hour of rest

### Special Travel Abilities

- **Appaloosa**: No night travel penalty
- **Missouri Fox Trotter**: No mountain penalty
- **Arabian**: No desert penalty
- **Mustang**: +10% wilderness stamina regen

---

## Leaderboards

### Racing Champions
Top 10 horses by:
- Total race wins
- Win rate (wins/races entered)
- Fastest times

### War Horses
Top 10 horses by:
- Combat victories
- Win rate (victories/combats)
- Mounted combat damage

### Distance Travelers
Top 10 horses by:
- Total miles traveled
- Longest single journey

---

## Economic Integration

### Purchase Prices

- Common: $200-$320
- Quality: $500-$1000
- Rare: $1200-$2000
- Legendary: Cannot be purchased (must be found/tamed)

### Ongoing Costs

- Feed: $1-$15 per feeding
- Grooming: Free (DIY) or $5 (professional)
- Training: $100-$200 per skill
- Equipment: $15-$3000
- Stable Upkeep: $5-50+ per day
- Veterinary: $10-100 per treatment

### Revenue Opportunities

- Race Prizes: $50-$500+ per race
- Show Prizes: $50-$200 per show
- Breeding: Sell foals for 50-150% of parent value
- Stud Fees: Rent out champion stallions

---

## Random Events

### Wild Horse Encounters

- **Common Breeds**: 5% chance in wilderness
- **Quality Breeds**: 1% chance in specific regions
- **Legendary Stallion**: 0.1% chance, requires Reputation 80+

### Taming Mechanics

Success based on:
- Character's Animal Handling skill
- Horse's temperament
- Multiple attempts possible
- Failed attempts: Horse flees, try again later

### Horse in Danger

Triggers bond events:
- **Predator Attack**: Mountain lion, wolves
- **Injury**: Broken leg, snake bite
- **Theft**: Horse rustlers
- **Natural Disaster**: Flash flood, stampede

Rescuing horse grants +15-25 bond

---

## Achievement Integration

### Horse Achievements

- **First Horse**: Purchase your first horse
- **Bonded**: Reach bond level 81+ with a horse
- **Breeder**: Successfully breed a foal
- **Exceptional Breeder**: Breed an exceptional foal
- **Champion Racer**: Win 10 races
- **War Veteran**: Win 20 mounted combats
- **Long Rider**: Travel 1000 miles on horseback
- **Master Trainer**: Train a horse to max skills
- **Legendary Tamer**: Successfully tame the Legendary Wild Stallion
- **Stable Master**: Own 10+ horses
- **Full Collection**: Own one of each breed

---

## Technical Implementation

### Database Schema

**Horse Model**: 27 fields tracking stats, condition, history, breeding
**Stable Model**: 10 fields for stable management
**Indexes**: ownerId, breed, bond level, pregnancy status

### Service Architecture

1. **horse.service.ts** (450 lines)
   - Purchase and taming
   - Care activities (feed, groom, rest)
   - Condition updates
   - Combat and travel integration

2. **horseBreeding.service.ts** (420 lines)
   - Breeding mechanics
   - Genetics calculation
   - Pregnancy and birth
   - Lineage tracking
   - Breeding recommendations

3. **horseBond.service.ts** (380 lines)
   - Bond level progression
   - Activity tracking
   - Bond decay
   - Special events
   - Whistle recall

4. **horseRacing.service.ts** (320 lines)
   - Race simulation
   - Show judging
   - Leaderboards
   - Prize distribution

### Data Files

- **15 Horse Breeds** with detailed stats and abilities
- **35+ Equipment Items** across 4 slots
- **7 Food Types** with varying benefits
- **8 Trainable Skills** with requirements and effects
- **5 Skill Synergies** for advanced combinations

---

## Player Experience

### New Player Journey

1. **First Horse**: Purchase affordable Quarter Horse or Morgan ($250-275)
2. **Learn Care**: Feed, groom, build bond to level 20
3. **First Skill**: Train Speed Burst or Draft Training
4. **Travel Bonus**: Notice improved travel speed
5. **First Race**: Enter local race, learn competition
6. **Bond Growth**: Reach Partner level (41+), unlock whistle
7. **Equipment**: Purchase better saddle and saddlebags
8. **Advanced Training**: Learn War Horse or Endurance

### Mid-Game Goals

- Build stable with 5+ horses
- Breed first foal
- Win 10 races
- Reach Companion bond (61+)
- Collect rare breed (Arabian, Andalusian)
- Train horse to 4+ skills

### End-Game Content

- Hunt for Legendary Wild Stallion
- Breed exceptional bloodlines
- Win championships
- Max out Bonded horse (100 bond)
- Complete breed collection
- Build premium stable with all facilities

---

## Balancing Considerations

### Power Scaling

- Early horses: 45-65 average stats
- Mid-game: 60-80 average stats
- End-game: 75-90 average stats
- Legendary: 90-100 all stats

### Economic Balance

- Entry level: $250-500 total investment
- Competitive: $1500-3000 investment
- Elite: $5000+ investment (rare breeds, legendary equipment)

### Time Investment

- Basic care: 5-10 minutes per day
- Active training: 20-30 minutes per day
- Breeding program: Long-term (11+ months per foal)
- Competition: Event-based (races/shows scheduled)

---

## Future Expansion Possibilities

### Phase 10+ Features

1. **Horse Caravans**: Multi-horse pack trains
2. **Wild Herds**: Dynamic wild horse populations
3. **Ranch Management**: Own and operate horse ranch
4. **Advanced Breeding**: Selective breeding programs
5. **Horse Ailments**: Disease system requiring care
6. **Mounted Duels**: PvP mounted combat
7. **Territory Control**: Cavalry units in gang wars
8. **Horse Market**: Player-to-player horse trading
9. **Legendary Quests**: Special quest chains for unique horses
10. **Photo Mode**: Screenshot your magnificent steed

---

## Summary

The Horse Companion System adds deep, engaging gameplay centered on:

- **15 unique breeds** with distinct characteristics
- **Progressive bond system** with meaningful rewards
- **Genetics-based breeding** for long-term goals
- **Competitive racing and shows** for prestige
- **8 trainable skills** with strategic combinations
- **Full equipment system** for customization
- **Stable management** for collections
- **Economic integration** with costs and revenue

This system creates emotional attachment to horses while providing mechanical benefits, encouraging long-term player investment and creating memorable stories of partnership between desperado and steed.

**Total Lines of Code**: ~2,200
**Files Created**: 9
**TypeScript Compilation**: ✓ Clean
