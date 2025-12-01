# Dynamic Crowds System - Test Examples

## Sample Crowd States

### Saloon at Different Times

**Dawn (5:00 AM) - Empty**
- Base Pattern: 0.1 (10% capacity)
- Estimated Count: 8/80 people
- Level: EMPTY
- Atmosphere: "The empty saloon echoes with your footsteps. A lone bartender polishes glasses in silence."
- Crime Detection: 0.2x (20% of base chance)

**Evening (9:00 PM) - Crowded**
- Base Pattern: 0.9 (90% capacity)
- Estimated Count: 72/80 people
- Level: CROWDED
- Atmosphere: "The saloon is packed shoulder to shoulder. Noise fills every corner."
- Crime Detection: 1.3x (130% of base chance)
- Pickpocketing: Available, 1.5x bonus

### Church on Sunday Morning - Packed
- Base Pattern: 1.0 (100% capacity)
- Day Modifier: Weekend
- Estimated Count: 100/100 people
- Level: PACKED
- Atmosphere: "The congregation spills out onto the steps. Everyone comes to worship today."
- Crime Detection: 1.5x (very risky)

### Bank on Weekday Afternoon - Busy
- Base Pattern: 0.7 (70% capacity)
- Estimated Count: 21/30 people
- Level: BUSY
- Atmosphere: "Busy day at the bank. Miners cashing in their gold dust."
- Crime Detection: 1.0x (baseline)

## Weather Impact Examples

### Town Square during Dust Storm
- Base Pattern (Afternoon): 0.9
- Outdoor Location: true
- Weather Modifier: 0.2 (dust storm)
- Final Count: ~36/200 people (instead of 180)
- Level: SPARSE
- Atmosphere: "A few townsfolk go about their business, heads down."

### Saloon during Rain
- Base Pattern (Evening): 0.9
- Indoor Location: true
- Weather Modifier: 1.1 (people take shelter)
- Final Count: ~79/80 people (instead of 72)
- Level: PACKED
- Atmosphere: "Bodies press against each other at the bar. The noise is deafening."

## Event Impact Examples

### Town Festival Effect
- Saloon during Festival (Evening): 1.5x modifier
- Base: 72 people → Festival: 108 people (capped at 80)
- Level: PACKED
- Multiple venues affected

## Crime Detection Scenarios

### Pickpocketing Success Rates

**Empty Saloon (Dawn)**
- Base Witness Chance: 40%
- Time Modifier: 0.8 (dawn)
- Crowd Modifier: 0.2 (empty)
- Final Chance: 40% × 0.8 × 0.2 = 6.4%
- Pickpocketing: Not available (no targets)

**Crowded Saloon (Evening)**
- Base Witness Chance: 40%
- Time Modifier: 1.0 (evening)
- Crowd Modifier: 1.3 (crowded)
- Final Chance: 40% × 1.0 × 1.3 = 52%
- Pickpocketing: Available, 1.5x gold bonus

**Packed Town Square (Market Day)**
- Base Witness Chance: 30%
- Time Modifier: 0.6 (noon)
- Crowd Modifier: 1.5 (packed)
- Final Chance: 30% × 0.6 × 1.5 = 27%
- Pickpocketing: Available, 1.8x gold bonus

## Crowd Factor Breakdown Example

### Saloon at 9 PM on Saturday during Clear Weather

**Factors:**
1. Time: Evening (0.9) - "EVENING (21:00)"
2. Weather: Clear (1.0) - Not shown (no modifier)
3. Event: None (1.0) - Not shown
4. Day: Weekend (1.3) - "Day of week effect"
5. Random: 0.95 - "Natural variation"

**Calculation:**
- Raw: 0.9
- Final: 0.9 × 1.0 × 1.0 × 1.3 × 0.95 = 1.11
- Count: 80 × 1.11 = 89 people (capped at 80)
- Level: PACKED

## Integration with Other Systems

### Crime System
```typescript
// Before
witnessChance = baseChance × timeModifier × weatherModifier

// After
witnessChance = baseChance × timeModifier × weatherModifier × crowdModifier
```

### Location Responses
```json
{
  "location": {
    "name": "Red Gulch Saloon",
    "crowdState": {
      "currentLevel": "crowded",
      "estimatedCount": 72,
      "baseCapacity": 80,
      "percentFull": 90,
      "factors": [...],
      "atmosphereDescription": "The saloon is packed shoulder to shoulder..."
    },
    "crowdEffects": {
      "crimeDetectionModifier": 1.3,
      "pickpocketingAvailable": true,
      "pickpocketingBonus": 1.5,
      "atmosphereBonus": "Dense crowd - many potential marks"
    }
  }
}
```

## Building Type Patterns

### Entertainment Venues
- Saloon: Peaks at night (1.0)
- Fighting Pit: Peaks at night (1.0)
- Cantina: Peaks in evening (1.0)

### Religious Sites
- Church: Peaks in morning (1.0)
- Spirit Lodge: Peaks at dawn and dusk
- Shrine: Peaks at dawn

### Commercial
- General Store: Peaks in afternoon (0.9)
- Bank: Peaks in afternoon (0.7)
- Trading Post: Peaks in afternoon (1.0)

### Government
- Sheriff Office: Steady throughout day
- Government Office: Business hours only
- Town Square: Varies throughout day

## Performance Considerations

The crowd system is designed to be lightweight:

1. **Calculation Speed**: ~5-10ms per location
2. **Caching**: Results can be cached for 5-10 minutes
3. **Batch Updates**: Background job updates all locations periodically
4. **On-Demand**: Calculated when player enters location

## Future Enhancements

1. **NPC Schedules**: NPCs appear based on crowd levels
2. **Dynamic Pricing**: Shop prices vary with crowd density
3. **Queue Systems**: Wait times for busy services
4. **Crowd Events**: Flash mobs, stampedes, etc.
5. **Reputation Impact**: Famous players draw crowds
