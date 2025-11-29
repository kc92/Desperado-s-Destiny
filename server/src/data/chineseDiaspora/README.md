# Chinese Diaspora NPC Network - Developer Guide

## Quick Reference

This directory contains the complete Chinese immigrant NPC network for Desperados Destiny.

## Files

- **npcs.ts** - Red Gulch (3) + Goldfinger's Mine (3) NPCs
- **npcs-continued.ts** - Fort Ashford (2) + Whiskey Bend (3) NPCs
- **npcs-final.ts** - The Frontera (2) + Dusty Trail (2) NPCs
- **quests.ts** - Underground Railroad quest definitions (17 quests)
- **questChains.ts** - Quest chain organization and moral choice system

## NPC Quick Reference

### By Location

| Location | NPCs | Roles |
|----------|------|-------|
| Red Gulch | Chen Wei, Mei Lin, Old Zhang | Info, Medicine, Tunnels |
| Goldfinger's Mine | Li Jian, Chen Tao, Silent Wu | Mining, Healing, Explosives |
| Fort Ashford | Wong Shu, Hu Feng | Military Intel, Underground Railroad |
| Whiskey Bend | Master Fang, Jade Flower, Chen Bo | Elder, Blackmail, Telegraph |
| The Frontera | Dragon Lee, Auntie Zhao | Smuggling, Child Protection |
| Dusty Trail | Railroad Chen, Dr. Huang | Tunnels (Master), Surgery |

### By Specialty

| Service Type | NPCs | Key Services |
|--------------|------|--------------|
| **Medicine** | Mei Lin, Chen Tao, Dr. Huang, Master Fang | Herbal medicine, Surgery, Curse removal |
| **Intelligence** | Chen Wei, Wong Shu, Jade Flower, Chen Bo | Military intel, Blackmail, Telegraph intercepts |
| **Tunnels** | Old Zhang, Li Jian, Railroad Chen, Dragon Lee | Territory maps, Mine routes, Railroad network |
| **Explosives** | Silent Wu | Demolitions, Sabotage |
| **Protection** | Hu Feng, Auntie Zhao | Underground railroad, Child rescue |
| **Trade** | Dragon Lee | Smuggling, Contraband |

## Discovery System

### Entry Points (Anyone can find)
- **Chen Wei** (Red Gulch) - Laundry shop
- **Master Fang** (Whiskey Bend) - Herb shop
- **Dragon Lee** (Frontera) - Gambling den
- **Auntie Zhao** (Frontera) - Cantina

### Network Referrals (Trust required)
```
Chen Wei → Mei Lin, Old Zhang, Wong Shu
Old Zhang → Li Jian, Silent Wu, Railroad Chen
Mei Lin → Dr. Huang
Li Jian → Chen Tao, Silent Wu
Master Fang → Jade Flower, Chen Bo
Wong Shu → Hu Feng
Dragon Lee → Auntie Zhao (and vice versa)
```

## Trust Level System

All NPCs use 5-level trust progression:

0. **Outsider** - Cover identity, basic services only
1. **Acquaintance** - Some trust, limited services (100-299 rep)
2. **Friend** - Good trust, unique services (300-599 rep)
3. **Brother/Sister** - Deep trust, dangerous knowledge (600-899 rep)
4. **Family** - Complete trust, legendary services (900+ rep)

## Integration Checklist

### Backend Integration

- [ ] Add Chinese NPCs to location seed files
- [ ] Implement trust tracking system (per player, per NPC)
- [ ] Create service delivery system (medicine, intel, etc.)
- [ ] Build quest system for 40+ unique quests
- [ ] Add dialogue system with trust-based responses
- [ ] Implement discovery/referral system
- [ ] Create cooldown tracking for services
- [ ] Add reputation gain/loss mechanics

### Database Schema

```typescript
// PlayerChineseReputation
{
  playerId: string,
  overallTrust: number,  // 0-1000
  npcTrust: {
    [npcId]: number      // Individual NPC trust
  },
  discoveries: string[], // Discovered NPC IDs
  bannedFrom: string[],  // Exiled from NPC IDs
  questsCompleted: string[],
  goldSpent: number,
  firstContact: Date
}
```

## Service Categories

| Category | NPCs | Price Range |
|----------|------|-------------|
| Medicine | 4 NPCs | 10-1500 gold |
| Intelligence | 5 NPCs | 25-2000 gold |
| Tunnels | 4 NPCs | 75-5000 gold |
| Explosives | 1 NPC | 50-1000 gold |
| Protection | 2 NPCs | 25-2000 gold |
| Smuggling | 1 NPC | 100-5000 gold |

## Quest Summary

### Underground Railroad Quests (17 quests - IMPLEMENTED)

**Quest Chains**:
1. **The Iron Road to Freedom** (5 quests, Epic) - Free workers from labor camp
2. **The Jade Passage** (3 quests, Medium) - Smuggle immigrants into territory
3. **Ongoing Rescue Operations** (3 quests, Repeatable) - Individual rescues
4. **The Hardest Choices** (4 quests, Dramatic) - Impossible moral decisions

**Total Rewards Available**:
- Gold: 9,100g
- XP: 22,350 XP
- Reputation: 2,875 rep
- Unique Items: 12

**Time-Limited Quests**:
- The Long March (8 hours) - Epic escape with Pinkerton pursuit
- Crossing the Wire (6 hours) - Night border crossing
- Escaping the Mines (6 hours, repeatable) - Mine worker rescue

**Major Moral Choices** (8 total):
- Breaking Chains: Stealth vs Bribery vs Force
- The Long March: Sophie's Choice - who to save?
- New Lives: Expose, Duel, or Deal with railroad boss
- The Informer: Exile, Execute, or Redeem the traitor
- The Debt Collector: Pay, Expose, or Kill Lucky Lou
- The Testimony: Public testimony vs Silence

See `UNDERGROUND_RAILROAD_QUESTS_REPORT.md` for full details.

### NPC-Specific Quests (40+ quests - TO BE IMPLEMENTED)

**Time-Limited Quests** (Urgent):
- Emergency Surgery (2 hours)
- Cave-In Rescue (6 hours)
- The Deserter (12 hours)
- Secret Messages (12 hours)
- Mountain Herbs (8 hours)
- Save the Orphan (12 hours)
- Rescue the Girl (12 hours)

**Epic Quests** (High reward):
- The Great Escape (Liberate 40 people!)
- The Liberation (Free all forced prostitutes)
- Auntie's Legacy (Build orphanage)
- The Golden Legacy (Become network elder)
- The Network Map (Map all power)

## Cultural Notes for Developers

### Historical Context
- Chinese Exclusion Act (1882) - first major immigration ban
- ~1,200 Chinese workers died building transcontinental railroad
- Chinese workers systematically erased from historical records
- Barred from many professions (medicine, law, etc.)
- Faced violence and persecution
- Built underground mutual aid networks

### Respectful Implementation
✅ Complex, individual characters (not stereotypes)
✅ Characters have agency and power
✅ Historical struggles shown with dignity
✅ Real contributions acknowledged
✅ Cultural elements are authentic
✅ Educational about real history

### What to Avoid
❌ "Kung Fu Master" stereotypes
❌ Broken English as comedy
❌ Submissive or weak characterizations
❌ Opium addict stereotypes
❌ Dragon Lady tropes
❌ Model minority myths

## Testing Considerations

### Trust System Testing
- Verify trust gains from quests
- Test trust loss from betrayals
- Confirm referral unlock mechanics
- Test exile/ban system

### Service Testing
- Verify cost calculations
- Test cooldown enforcement
- Confirm effect applications
- Test legendary service requirements

### Quest Testing
- Test time-limited quest failures
- Verify quest chain progression
- Test failure consequences
- Confirm reward delivery

### Dialogue Testing
- Verify trust-based dialogue changes
- Test discovery dialogue triggers
- Confirm cover story maintenance
- Test suspicion responses

## Import Examples

```typescript
// Import types
import type { ChineseNPC, ChineseTrustLevel } from '@desperados/shared';

// Import NPCs
import { CHEN_WEI, MEI_LIN, OLD_ZHANG } from './chineseDiaspora/npcs';
import { MASTER_FANG, WONG_SHU } from './chineseDiaspora/npcs-continued';
import { DRAGON_LEE, DR_HUANG } from './chineseDiaspora/npcs-final';

// Get all NPCs
import { CHINESE_NPCS } from './chineseDiaspora/npcs';
import { CHINESE_NPCS_CONTINUED } from './chineseDiaspora/npcs-continued';
import { CHINESE_NPCS_FINAL } from './chineseDiaspora/npcs-final';

const allChineseNPCs = [
  ...CHINESE_NPCS,
  ...CHINESE_NPCS_CONTINUED,
  ...CHINESE_NPCS_FINAL
];

// Import Quests
import {
  ALL_UNDERGROUND_RAILROAD_QUESTS,
  IRON_ROAD_QUEST_CHAIN,
  JADE_PASSAGE_QUEST_CHAIN,
  RESCUE_QUESTS,
  DRAMATIC_QUESTS
} from './chineseDiaspora/quests';

// Import Quest Chains and Choices
import {
  ALL_QUEST_CHAINS,
  ALL_MORAL_CHOICES,
  IRON_ROAD_CHAIN,
  JADE_PASSAGE_CHAIN
} from './chineseDiaspora/questChains';
```

## API Endpoints (Suggested)

```
GET    /api/chinese-network/npcs              - List discovered NPCs
GET    /api/chinese-network/npc/:id           - Get NPC details
GET    /api/chinese-network/trust             - Get trust levels
POST   /api/chinese-network/service/:id       - Use service
GET    /api/chinese-network/quests            - Available quests
POST   /api/chinese-network/quest/:id/start   - Start quest
POST   /api/chinese-network/quest/:id/complete - Complete quest
GET    /api/chinese-network/reputation        - Get rep details
```

## Performance Considerations

- **NPC Data**: Static, can be cached
- **Trust Levels**: Per-player, needs DB tracking
- **Quests**: State tracking required
- **Services**: Cooldown tracking needed
- **Dialogue**: Can be client-side rendered

## Implementation Status

### Phase 5, Wave 5.1 ✅ COMPLETE
- 13 Chinese Diaspora NPCs
- Trust-based progression system
- 40+ unique services
- Discovery and referral system
- Historical accuracy and respectful representation

### Phase 5, Wave 5.2 ✅ COMPLETE
- Underground Railroad quest chains (17 quests)
- Moral choice system (8 major choices)
- Quest chain organization
- Long-term consequence system
- Time-limited rescue missions

### Phase 5, Wave 5.3 (Planned)
- NPC-specific quest implementation (40+ quests)
- Chinese Quarter buildings
- Network events system
- Cultural items & equipment
- Network conflict system
- Trust tracking backend implementation
- Service delivery mechanics

## Support & Questions

For questions about:
- **Historical accuracy**: See PHASE_5_WAVE_5.1_CHINESE_DIASPORA_COMPLETE.md
- **Underground Railroad Quests**: See UNDERGROUND_RAILROAD_QUESTS_REPORT.md
- **Quest Integration**: See quests.ts and questChains.ts
- **NPC Implementation**: See individual NPC files (npcs.ts, npcs-continued.ts, npcs-final.ts)
- **Type definitions**: See shared/src/types/chineseDiaspora.types.ts
- **Integration Guide**: See this README

---

**Remember**: This network represents real people who faced real discrimination and built real communities. Implement with respect and care.
