# Day/Night Cycle Implementation

## Overview

The Day/Night cycle system provides visual time-of-day feedback to players through a persistent clock display and subtle atmospheric overlays that change based on game time.

## Architecture

### Backend Components

#### 1. WorldState Model (`server/src/models/WorldState.model.ts`)
- Already exists - tracks `gameHour` (0-23)
- Includes `TimeOfDay` enum with periods: DAWN, MORNING, NOON, AFTERNOON, DUSK, EVENING, NIGHT
- Helper method `calculateTimeOfDay()` determines period from hour

#### 2. World Controller (`server/src/controllers/world.controller.ts`)
**New file** providing three endpoints:

- **GET /api/world/state** - Full world state (time, weather, factions, news)
- **GET /api/world/time** - Lightweight time-only endpoint
- **GET /api/world/weather** - Weather-only endpoint

#### 3. World Routes (`server/src/routes/world.routes.ts`)
**New file** registered in `server/src/routes/index.ts` at `/api/world`

### Frontend Components

#### 1. useGameTime Hook (`client/src/hooks/useGameTime.ts`)
**Purpose:** Centralized hook for accessing game time with computed values

**Returns:**
```typescript
interface GameTimeState {
  hour: number;           // 0-23
  period: string;         // "Dawn", "Morning", "Noon", etc.
  isDay: boolean;         // 6-18
  isNight: boolean;       // 18-6
  timeString: string;     // "2:00 PM"
  nextPeriodIn: number;   // minutes until next period
  icon: string;           // Emoji icon (☀️, 🌙, 🌅, 🌑)
}
```

**Features:**
- Fetches world state from `/api/world/state`
- Polls every 30 seconds for updates
- Computes derived values (period, isDay, timeString, icon)
- Uses `useWorldStore` for state management

**Time Periods:**
- **Midnight** (0-1): 🌑 Darkest period
- **Night** (1-5, 22-24): 🌙 Dark blue atmosphere
- **Dawn** (5-7): 🌅 Warm orange-pink sunrise
- **Morning** (7-12): ☀️ Bright daylight
- **Noon** (12-14): ☀️ Peak brightness
- **Afternoon** (14-18): ☀️ Daylight continues
- **Dusk** (18-20): 🌅 Orange-purple sunset
- **Evening** (20-22): 🌙 Blue tint begins

#### 2. GameClock Component (`client/src/components/ui/GameClock.tsx`)
**Purpose:** Visual clock widget showing current game time

**Props:**
```typescript
interface GameClockProps {
  className?: string;     // Custom styling
  showIcon?: boolean;     // Display sun/moon icon (default: true)
  compact?: boolean;      // Compact mode hides period name (default: false)
}
```

**Features:**
- Displays time as "6:00 AM", "2:00 PM" format
- Shows period icon (☀️, 🌙, 🌅, 🌑)
- Period name in non-compact mode
- Tooltip with period and day/night status
- Western-themed styling (wood background, desert colors)
- Accessibility: screen reader support

**Styling:**
- Background: `bg-wood-medium/80`
- Border: `border-wood-light`
- Text: `text-desert-sand` and `text-desert-stone`
- Shadow: `shadow-wood`

#### 3. DayNightOverlay Component (`client/src/components/ui/DayNightOverlay.tsx`)
**Purpose:** Full-screen atmospheric overlay that tints based on time

**Props:**
```typescript
interface DayNightOverlayProps {
  enabled?: boolean;      // Toggle overlay on/off (default: true)
}
```

**Features:**
- Fixed full-screen overlay (`fixed inset-0`)
- Non-interactive (`pointer-events-none`)
- Smooth transitions (`duration-[3000ms]` = 3 seconds)
- Subtle opacity (0.05-0.15 max)
- High z-index (`z-50`) to appear above content

**Time-Based Overlays:**

| Period | Gradient | Effect |
|--------|----------|--------|
| **Midnight** | Dark blue (10,25,47 → 15,35,60) | 15% opacity - Darkest |
| **Night** | Blue (15,35,60 → 25,45,75) | 12% opacity - Dark |
| **Dawn** | Orange-pink (255,140,100 → 255,180,150) | 8% opacity - Warm sunrise |
| **Morning** | Pale yellow (255,250,240) | 2% opacity - Light tint |
| **Noon** | Transparent | 0% opacity - No tint |
| **Afternoon** | Warm beige (255,240,220 → 255,235,210) | 3% opacity - Slight warmth |
| **Dusk** | Orange-purple (255,130,80 → 160,100,180) | 8% opacity - Sunset |
| **Evening** | Blue (80,100,150 → 60,80,130) | 10% opacity - Twilight |

**Design Philosophy:**
- VERY SUBTLE - players should feel the atmosphere without being distracted
- Gradients create depth (lighter at top, slightly darker at bottom)
- Color psychology: warm tones during day transitions, cool blues at night
- Smooth 3-second transitions prevent jarring changes

#### 4. Integration with GameLayout (`client/src/components/layout/GameLayout.tsx`)
**Changes:**
- Added `DayNightOverlay` at root level with `enabled={true}`
- Overlay sits above all content but doesn't block interactions

#### 5. Integration with Header (`client/src/components/layout/Header.tsx`)
**Changes:**
- Added `GameClock` component to authenticated navigation
- Positioned before nav links for visibility
- Props: `showIcon={true}` and `compact={false}`

## Usage Examples

### Basic Usage (Automatic)
Once integrated, the system works automatically:
- Clock appears in header when user is authenticated
- Overlay is always active in game pages
- Updates every 30 seconds via polling

### Using the Hook in Custom Components
```tsx
import { useGameTime } from '@/hooks/useGameTime';

function MyComponent() {
  const gameTime = useGameTime();

  return (
    <div>
      {gameTime.isNight && <p>It's nighttime - danger increases!</p>}
      <p>Current time: {gameTime.timeString}</p>
      <p>Period: {gameTime.icon} {gameTime.period}</p>
    </div>
  );
}
```

### Customizing the Clock
```tsx
// Compact version without period name
<GameClock compact={true} />

// Without icon
<GameClock showIcon={false} />

// Custom styling
<GameClock className="scale-125 opacity-90" />
```

### Toggling the Overlay
```tsx
// Disable overlay (e.g., in character creation)
<DayNightOverlay enabled={false} />

// Re-enable in game
<DayNightOverlay enabled={true} />
```

## API Reference

### Endpoints

#### GET /api/world/state
Returns complete world state including time, weather, factions, and news.

**Response:**
```json
{
  "success": true,
  "data": {
    "worldState": {
      "gameHour": 14,
      "gameDay": 15,
      "gameMonth": 6,
      "gameYear": 1875,
      "timeOfDay": "AFTERNOON",
      "lastTimeUpdate": "2025-01-15T14:30:00Z",
      "currentWeather": "CLEAR",
      "weatherEffects": { ... },
      "currentHeadlines": [ ... ],
      "factionPower": [ ... ]
    }
  }
}
```

#### GET /api/world/time
Lightweight endpoint returning only time information.

**Response:**
```json
{
  "success": true,
  "data": {
    "gameHour": 14,
    "gameDay": 15,
    "gameMonth": 6,
    "gameYear": 1875,
    "timeOfDay": "AFTERNOON",
    "lastTimeUpdate": "2025-01-15T14:30:00Z"
  }
}
```

## Testing

### Debug Page
A comprehensive debug page is available at `client/src/pages/game/TimeDebug.tsx`:
- Large clock display
- Current time details (hour, period, day/night status)
- Time periods reference table
- Visual overlay preview
- Implementation notes

**To use:**
1. Add route in router configuration
2. Navigate to `/game/time-debug`
3. See all time periods and their visual effects

### Manual Testing Checklist
- [ ] Clock appears in header when authenticated
- [ ] Clock disappears when logged out
- [ ] Icon changes based on time of day
- [ ] Time string displays correctly (12-hour format)
- [ ] Period name matches current hour
- [ ] Overlay tint is visible but subtle
- [ ] Overlay doesn't block clicks/interactions
- [ ] Transitions are smooth (3 seconds)
- [ ] Updates occur every ~30 seconds
- [ ] Tooltip shows correct information

### Backend Testing
```bash
# Test world state endpoint
curl http://localhost:5000/api/world/state

# Test time endpoint
curl http://localhost:5000/api/world/time

# Update game hour (admin console or script)
# Then verify frontend updates within 30 seconds
```

## Configuration

### Polling Interval
Current: 30 seconds (in `useGameTime.ts`)

To change:
```typescript
// In useGameTime.ts, line ~126
const interval = setInterval(() => {
  fetchWorldState();
}, 60000); // Change to 60 seconds
```

### Overlay Opacity
To adjust tint strength, edit `DayNightOverlay.tsx`:
```typescript
const TIME_OVERLAYS: Record<string, { gradient: string; opacity: number }> = {
  Night: {
    gradient: 'linear-gradient(...)',
    opacity: 0.20, // Increase from 0.12 for stronger effect
  },
  // ...
};
```

### Transition Speed
To adjust overlay transition speed, edit `DayNightOverlay.tsx`:
```typescript
<div
  className="
    fixed inset-0 pointer-events-none z-50
    transition-all duration-[5000ms] ease-in-out  // Change from 3000ms to 5000ms
  "
  // ...
/>
```

## Future Enhancements

### Potential Improvements
1. **Socket Integration** - Real-time updates instead of polling
2. **Weather Effects** - Combine with weather for rain/dust storm overlays
3. **Time Acceleration** - Fast-forward time in certain situations
4. **Moon Phases** - Different moon icons based on game day
5. **Seasonal Changes** - Adjust colors based on game month/season
6. **Location-Based Time** - Different time zones for different territories
7. **Night Vision Mode** - Accessibility option to reduce night tinting
8. **Performance Mode** - Disable overlay on low-end devices
9. **Custom Themes** - Player-selectable color schemes
10. **Animation Effects** - Stars twinkling at night, sun rays at dawn

### Performance Considerations
- Polling every 30 seconds is lightweight (single API call)
- Overlay uses pure CSS (no JS animations)
- Hook memoization prevents unnecessary recalculations
- Component is optimized with useMemo and useCallback

## Troubleshooting

### Clock Not Updating
1. Check browser console for API errors
2. Verify `/api/world/state` endpoint is accessible
3. Confirm `useWorldStore.fetchWorldState()` is being called
4. Check polling interval is active

### Overlay Not Visible
1. Verify `enabled={true}` prop is set
2. Check z-index isn't being overridden
3. Inspect element to see if styles are applied
4. Try increasing opacity values for testing

### Wrong Time Period
1. Check server `WorldState` model has correct `gameHour`
2. Verify `getTimePeriod()` logic in `useGameTime.ts`
3. Confirm time periods match server `TimeOfDay` enum

### Performance Issues
1. Reduce polling frequency (e.g., 60 seconds)
2. Disable overlay with `enabled={false}`
3. Check for memory leaks in polling interval cleanup

## File Reference

### New Files Created
```
server/src/controllers/world.controller.ts
server/src/routes/world.routes.ts
client/src/hooks/useGameTime.ts
client/src/hooks/index.ts
client/src/components/ui/GameClock.tsx
client/src/components/ui/DayNightOverlay.tsx
client/src/pages/game/TimeDebug.tsx
docs/DAY_NIGHT_CYCLE_IMPLEMENTATION.md
```

### Modified Files
```
server/src/routes/index.ts
client/src/components/ui/index.ts
client/src/components/layout/Header.tsx
client/src/components/layout/GameLayout.tsx
```

## Credits

**Design:** Western-themed UI components matching existing game aesthetic
**Implementation:** Client/server architecture with REST API
**Inspiration:** Classic MMORPGs with day/night cycles (Ultima Online, RuneScape)
