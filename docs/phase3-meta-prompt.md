# Phase 3: Missing Pages - Priority 1 | Meta Prompt

Use this prompt to start a new Claude Code session for Phase 3 implementation.

---

## META PROMPT

```
You are continuing the UI Polish Overhaul for Desperados Destiny, a Western-themed browser MMO built with React/TypeScript (Vite) frontend and Node.js/Express/MongoDB backend.

## COMPLETED PHASES

### Phase 1: Foundation (COMPLETE)
- Standardized UX patterns with shared hooks and components
- Navigation enhancement with hub-based structure

### Phase 2: Page Decomposition (COMPLETE)
- Gambling.tsx (1,830 LOC) → GamblingHub + 8 game pages
- Gang.tsx (1,056 LOC) → GangHub + 6 section components
- Location.tsx (1,597 LOC) → LocationHub + 8 section components
- All pages now use centralized Zustand stores

## CURRENT TASK: Phase 3 - Missing Frontend Pages

You need to create frontend pages for 4 fully-implemented backend systems. The backends are production-ready with models, services, controllers, and routes.

### IMPLEMENTATION STATUS

| Feature | Backend | Store/Hook | Services | Page | Priority |
|---------|---------|------------|----------|------|----------|
| Expeditions | ✅ | ❌ MISSING | ❌ MISSING | ❌ MISSING | P0 |
| Bounty Hunting | ✅ | ✅ useBountyStore | ✅ Complete | ❌ MISSING | P1 |
| Legendary Hunts | ✅ | ✅ useLegendaryHunt | ✅ Complete | ❌ MISSING | P1 |
| Territory Wars | ✅ | ✅ useTerritoryStore | ✅ Complete | ⚠️ PARTIAL | P2 |

---

## TASK 1: EXPEDITIONS SYSTEM (Highest Priority)

**What it is:** Offline progression where players send characters on timed expeditions (hunting, prospecting, trading, scouting) and return later to claim rewards.

### Backend Reference
- Model: `server/src/models/Expedition.model.ts`
- Service: `server/src/services/expedition.service.ts`
- Controller: `server/src/controllers/expedition.controller.ts`
- Routes: `/api/expeditions/*`

### API Endpoints
```
GET  /api/expeditions/types        - Get expedition type configs
GET  /api/expeditions/availability - Check available at location
GET  /api/expeditions/active       - Get active expedition
GET  /api/expeditions/history      - Get expedition history
POST /api/expeditions/start        - Start new expedition
POST /api/expeditions/:id/cancel   - Cancel active expedition
```

### Files to Create
```
client/src/
  services/
    expedition.service.ts          # API client
  store/
    useExpeditionStore.ts          # Zustand store
  pages/
    Expeditions.tsx                # Main page (or pages/expeditions/ExpeditionsHub.tsx)
  components/expedition/
    ExpeditionCard.tsx             # Single expedition display
    ExpeditionTypeSelector.tsx     # Type/duration selection
    ExpeditionProgress.tsx         # Active expedition progress bar
    ExpeditionResults.tsx          # Results modal after completion
    ExpeditionHistory.tsx          # Past expeditions table
```

### Expedition Types (from backend)
- `hunting_trip` - Hunt wildlife for pelts/meat
- `prospecting_run` - Search for gold/minerals
- `trade_caravan` - Trade goods between locations
- `scouting_mission` - Explore and gather intel

### Duration Tiers
- Quick: ~1 hour, lower rewards
- Standard: ~4 hours, medium rewards
- Extended: ~12 hours, high rewards

---

## TASK 2: BOUNTY HUNTING PAGE

**What it is:** View bounty board, see wanted players, place bounties, track bounty hunters.

### Existing Frontend
- Store: `client/src/store/useBountyStore.ts` (COMPLETE)
- Services: `client/src/services/bounty*.service.ts` (COMPLETE)

### Files to Create
```
client/src/
  pages/
    BountyHunting.tsx              # Main bounty hunting page
  components/bounty/
    BountyBoard.tsx                # Available bounties grid
    BountyCard.tsx                 # Single bounty display
    WantedLevelDisplay.tsx         # Player's wanted level
    MostWantedList.tsx             # Leaderboard of most wanted
    PlaceBountyModal.tsx           # Modal to place bounty on player
    BountyHunterAlert.tsx          # Alert when hunter spawns
```

### Key Features
- View bounty board (available targets)
- See your own wanted level
- Place bounties on other players
- Collect bounties you've earned
- Most wanted leaderboard
- Bounty hunter encounter warnings

---

## TASK 3: LEGENDARY HUNTS PAGE

**What it is:** Track and hunt 12 legendary animals across the frontier. Discovery system with clues, combat encounters, trophies.

### Existing Frontend
- Hook: `client/src/hooks/useLegendaryHunt.ts` (COMPLETE)
- Service: `client/src/services/legendaryHunt.service.ts` (COMPLETE)

### Backend Data
- 12 legendary animals in 4 categories: Predators, Herbivores, Avians, Mythical
- Discovery through clues and NPC rumors
- Multi-turn combat system
- Trophies and unique drops

### Files to Create
```
client/src/
  pages/
    LegendaryHunts.tsx             # Main legendary hunts page
  components/legendary/
    LegendaryAnimalCard.tsx        # Animal with discovery progress
    LegendaryEncyclopedia.tsx      # All animals grid view
    DiscoveryProgress.tsx          # Clue/rumor progress tracker
    LegendaryBattle.tsx            # Combat interface
    TrophyCase.tsx                 # Display earned trophies
    LegendaryLeaderboard.tsx       # Kill leaderboard per animal
```

### Discovery States
- Unknown (no clues)
- Rumored (heard rumors)
- Tracked (found clues)
- Located (ready to hunt)
- Defeated (trophy earned)

---

## TASK 4: TERRITORY WARFARE ENHANCEMENT

**What it is:** Enhance existing Territory.tsx with gang war mechanics, influence contributions, and conquest UI.

### Existing Frontend
- Page: `client/src/pages/Territory.tsx` (PARTIAL)
- Store: `client/src/store/useTerritoryStore.ts` (COMPLETE)
- Services: `client/src/services/territory*.service.ts` (COMPLETE)

### Files to Create/Modify
```
client/src/
  components/territory/
    TerritoryWarStatus.tsx         # Active war progress
    InfluenceContribution.tsx      # Contribute to faction influence
    ConquestBattle.tsx             # Territory conquest interface
    FactionAlignmentUI.tsx         # Show faction benefits
    TerritoryMapEnhanced.tsx       # Visual territory map
```

---

## IMPLEMENTATION PATTERNS

### Store Pattern (follow useGamblingStore)
```typescript
import { create } from 'zustand';
import { expeditionService } from '@/services/expedition.service';

interface ExpeditionState {
  // Data
  expeditionTypes: ExpeditionType[];
  activeExpedition: Expedition | null;
  history: Expedition[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTypes: () => Promise<void>;
  fetchActive: () => Promise<void>;
  startExpedition: (typeId: string, duration: string) => Promise<boolean>;
  cancelExpedition: () => Promise<boolean>;
}
```

### Service Pattern (follow existing services)
```typescript
import { api } from './api';

export const expeditionService = {
  getTypes: () => api.get('/expeditions/types'),
  getAvailability: () => api.get('/expeditions/availability'),
  getActive: () => api.get('/expeditions/active'),
  getHistory: () => api.get('/expeditions/history'),
  start: (typeId: string, duration: string) =>
    api.post('/expeditions/start', { typeId, duration }),
  cancel: (id: string) => api.post(`/expeditions/${id}/cancel`),
};
```

### Page Pattern (follow LocationHub)
```typescript
export const Expeditions: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const { activeExpedition, fetchActive } = useExpeditionStore();

  useEffect(() => {
    if (currentCharacter) {
      fetchActive();
    }
  }, [currentCharacter]);

  // Render based on state
};
```

---

## ROUTING

Add to `client/src/App.tsx`:
```typescript
// Lazy imports
const Expeditions = lazy(() => import('@/pages/Expeditions'));
const BountyHunting = lazy(() => import('@/pages/BountyHunting'));
const LegendaryHunts = lazy(() => import('@/pages/LegendaryHunts'));

// Routes (inside game routes)
<Route path="expeditions" element={<Expeditions />} />
<Route path="bounty-hunting" element={<BountyHunting />} />
<Route path="legendary-hunts" element={<LegendaryHunts />} />
```

---

## STYLING

Use existing Tailwind classes with Western theme:
- Cards: `Card` component with variants (leather, wood, parchment)
- Colors: amber, gold, desert-sand, blood-red for accents
- Fonts: font-western for headers
- Follow existing component patterns in `client/src/components/ui/`

---

## SUCCESS CRITERIA

1. [ ] Expeditions page functional with start/cancel/claim
2. [ ] Bounty Hunting page shows board and wanted levels
3. [ ] Legendary Hunts page shows animals and discovery progress
4. [ ] Territory page enhanced with war mechanics
5. [ ] All pages use TypeScript with proper types
6. [ ] Build passes with no new errors
7. [ ] Pages accessible from navigation

---

## START HERE

Begin with Expeditions as it has no frontend at all. Create in this order:
1. expedition.service.ts
2. useExpeditionStore.ts
3. Expeditions.tsx page
4. Supporting components

Then move to Bounty Hunting (store exists, just needs page), then Legendary Hunts (hook exists, just needs page), then Territory enhancements.
```

---

## QUICK REFERENCE

### Key Directories
```
client/src/
  pages/           # Page components
  components/      # Reusable components by domain
  store/           # Zustand stores
  services/        # API client services
  hooks/           # Custom React hooks

server/src/
  controllers/     # API endpoint handlers
  services/        # Business logic
  models/          # Mongoose models
  routes/          # Express route definitions
```

### Existing Stores to Reference
- `useGamblingStore.ts` - Good template for new stores
- `useLocationStore.ts` - Complex store with many features
- `useBountyStore.ts` - Already exists for bounty feature
- `useTerritoryStore.ts` - Already exists for territory feature

### Existing Hooks to Reference
- `useLegendaryHunt.ts` - Already exists for legendary hunts
- `useGangWars.ts` - Good pattern for warfare features
