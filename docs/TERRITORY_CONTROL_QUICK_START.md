# Territory Control System - Quick Start Guide

## Overview
The Territory Control system allows gangs to compete for influence in zones across the game world, gaining economic and tactical benefits from controlled areas.

## For Developers

### Key Files
- **Model**: `server/src/models/TerritoryZone.model.ts`
- **Service**: `server/src/services/territoryControl.service.ts`
- **Controller**: `server/src/controllers/territoryControl.controller.ts`
- **Routes**: `server/src/routes/territoryControl.routes.ts`
- **Types**: `shared/src/types/territoryControl.types.ts`
- **Seed**: `server/src/seeds/territoryZones.seed.ts`
- **Cron**: `server/src/jobs/territoryMaintenance.ts`

### Quick Integration Examples

#### 1. Award Influence from Crime
```typescript
import { TerritoryControlService } from '../services/territoryControl.service';
import { InfluenceActivityType } from '@desperados/shared';

// After successful crime
await TerritoryControlService.recordInfluenceGain(
  'red-gulch-saloon-district',  // Zone ID
  character._id,                 // Character ID
  InfluenceActivityType.CRIME    // Activity type
);
```

#### 2. Award Influence from Combat
```typescript
// After winning a fight
await TerritoryControlService.recordInfluenceGain(
  currentZoneId,
  characterId,
  InfluenceActivityType.FIGHT
);
```

#### 3. Get Gang Territory Overview
```typescript
const territoryControl = await TerritoryControlService.getGangTerritoryControl(gangId);

console.log(`Gang controls ${territoryControl.zones.length} zones`);
console.log(`Daily income: ${territoryControl.totalIncome} gold`);
console.log(`Empire rating: ${territoryControl.empireRating}`);
```

#### 4. Check Zone Control
```typescript
const zone = await TerritoryControlService.getZone('canyon-bridge-toll');

if (zone.isControlled()) {
  console.log(`Controlled by: ${zone.controllingGangName}`);
}

if (zone.isContested()) {
  console.log('Zone is contested!');
}
```

### API Endpoints

#### Get All Zones
```bash
GET /api/territory/zones
```

#### Get Gang Territory
```bash
GET /api/territory/gang/:gangId
```

#### Record Influence Gain
```bash
POST /api/territory/influence
Content-Type: application/json

{
  "zoneId": "red-gulch-saloon-district",
  "activityType": "crime"
}
```

#### Contest a Zone
```bash
POST /api/territory/contest/:zoneId
Authorization: Bearer <token>
```

#### Get Territory Map
```bash
GET /api/territory/map
```

## For Game Designers

### Zone Types

**Town Districts** (45% of zones)
- High income (100-280 gold/day)
- Economic benefits (shop discounts, trade access)
- Tactical benefits (safe houses, information)
- Easier to capture but harder to defend

**Wilderness Areas** (31% of zones)
- Moderate income (50-150 gold/day)
- Tactical benefits (hideouts, escape routes)
- Lower defense rating
- Remote location advantages

**Strategic Points** (24% of zones)
- High income (80-280 gold/day)
- Critical choke points
- High defense rating
- Major tactical advantages

### Balance Considerations

**Starting Distribution**
- 12 zones controlled by NPC gangs (41%)
- 17 zones available for player gangs (59%)
- Total daily income pool: 4,060 gold

**Influence Economy**
- Crime gives 5-20 influence
- Combat gives 10-30 influence
- Bribes give 15-25 influence
- Business fronts give 20-40 influence
- Daily decay: -5 influence if inactive

**Control Requirements**
- Need >50 influence OR 20-point lead
- Contested zones earn 50% income
- Daily income ranges from 40 to 280 gold

### Progression Path

1. **Small Gang** (0-2 zones)
   - Start with easy uncontrolled zones
   - Focus on one district
   - Daily income: 0-400 gold

2. **Growing Empire** (3-7 zones)
   - Expand to multiple locations
   - Contest NPC gang territories
   - Daily income: 400-1,200 gold

3. **Major Power** (8-14 zones)
   - Multi-town presence
   - Defend against rivals
   - Daily income: 1,200-2,400 gold

4. **Dominant Force** (15+ zones)
   - Near-total control
   - Legendary status
   - Daily income: 2,400+ gold

## For Players

### How to Gain Influence

**1. Commit Crimes** (+5-20 influence)
- Pickpocket in the zone
- Rob NPCs
- Complete crime jobs

**2. Win Fights** (+10-30 influence)
- PvP in the zone
- Defeat NPCs
- Gang war battles

**3. Bribe NPCs** (+15-25 influence)
- Pay local officials
- Buy NPC loyalty
- Establish contacts

**4. Business Fronts** (+20-40 influence)
- One-time large investment
- Permanent presence
- Highest single gain

**5. Passive Presence** (+1/hour)
- Gang members active in zone
- Requires sustained presence
- Gradual but reliable

### Tips for Territory Control

**Early Game**
- Target uncontrolled zones first
- Focus on one zone until >50 influence
- Choose zones near your base

**Mid Game**
- Expand to 3-5 zones for "Growing" rating
- Contest weak NPC territories
- Defend your core zones

**Late Game**
- Challenge Railroad Barons for high-income zones
- Secure strategic points (bridges, water sources)
- Form alliances to share territory

**Defense Strategy**
- Visit your zones daily to prevent decay
- Station members in important zones
- React quickly to rival activity

**Offense Strategy**
- Scout enemy zones for weak influence
- Coordinate gang attacks on contested zones
- Use bribes for quick gains

### Best Zones for Each Strategy

**Income Focus**
1. Smuggler's Alley (280g/day)
2. Border Crossing (280g/day)
3. Whiskey Bend Docks (250g/day)
4. Railroad Depot (240g/day)
5. Trade Route Junction (220g/day)

**Combat Focus**
1. Outlaw's Rest (+15% combat)
2. Canyon Hideout Network (defensive positions)
3. Mesa Lookout (high ground)
4. Hideout Valley (ambush opportunities)
5. Sacred Lands Border (+10% defense)

**Tactical Focus**
1. Chinatown (hidden passages)
2. Hideout Valley (escape routes)
3. Desert Springs (supply control)
4. Theater District (information network)
5. Canyon Bridge (chokepoint control)

**Easy Starter Zones**
1. Red Gulch Residential (low defense: 30)
2. Ghost Town Remnants (low defense: 35)
3. Ranch Territories (low defense: 40)
4. Dusty Trail Checkpoints (low defense: 45)

## Troubleshooting

### Zone won't flip to our control
- Need >50 influence total
- OR need 20+ point lead over rivals
- Check if contested by another gang

### Losing influence daily
- Gang members must be active in zone
- Visit zone within 24 hours to prevent decay
- -5 influence per day if no activity

### Not getting daily income
- Server runs cron job at midnight
- Zone must be controlled (not just influenced)
- Contested zones only give 50% income
- Check gang bank transaction history

### Can't contest a zone
- Need at least 10 influence first
- Must be Officer or Leader rank
- Gang must be active

## Development Roadmap

### Phase 1 (Current)
✅ Basic zone control
✅ Influence mechanics
✅ Daily income
✅ Contestation system
✅ NPC gang territories

### Phase 2 (Planned)
- Visual territory map UI
- Zone upgrade system
- Alliance mechanics
- Territory war declarations
- Zone events

### Phase 3 (Future)
- Historical control charts
- Zone specialization
- Gang territory quests
- Faction reputation effects
- Special unique zones

## Support

For questions or issues:
1. Check the main implementation doc: `GANG_TERRITORY_CONTROL_IMPLEMENTATION.md`
2. Review API documentation in controller files
3. Check seed data for zone examples
4. Test with manual API calls
5. Review cron job logs for daily operations

## Credits

**System**: Gang Territory Control
**Phase**: 6, Wave 6.1
**Implementation**: Complete
**Status**: Production Ready
**Last Updated**: 2025-11-26
