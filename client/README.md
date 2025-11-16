# CLIENT - Frontend Application

**React/TypeScript Frontend**

This directory contains the complete frontend application for Desperados Destiny.

---

## Directory Structure

```
client/
├── src/                   # Source code
│   ├── components/       # Reusable React components
│   ├── pages/            # Page-level components (routes)
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   ├── services/         # API communication services
│   ├── utils/            # Utility functions
│   ├── assets/           # Images, icons, fonts
│   ├── styles/           # Global CSS and Tailwind config
│   └── types/            # TypeScript type definitions
├── public/               # Static files (index.html, favicon, etc.)
├── tests/                # Test files (React Testing Library)
├── package.json          # Dependencies and scripts (to be created)
├── tsconfig.json         # TypeScript configuration (to be created)
├── tailwind.config.js    # TailwindCSS configuration (to be created)
└── README.md             # This file
```

---

## Key Directories Explained

### `/src/components`
Reusable UI components organized by feature or type.

**Example organization:**
```
components/
├── common/               # Shared components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── Loading.tsx
├── character/            # Character-related components
│   ├── CharacterSheet.tsx
│   ├── SkillBar.tsx
│   └── EnergyDisplay.tsx
├── combat/               # Combat UI components
│   ├── DuelInterface.tsx
│   ├── CombatLog.tsx
│   └── HandDisplay.tsx
├── chat/                 # Chat system components
│   ├── ChatWindow.tsx
│   ├── MessageList.tsx
│   └── ChannelSelector.tsx
└── map/                  # Map and territory components
    ├── TerritoryMap.tsx
    └── LocationCard.tsx
```

### `/src/pages`
Top-level page components mapped to routes.

**Example files:**
- `HomePage.tsx` - Landing page
- `CharacterCreationPage.tsx` - Character creation flow
- `GameDashboard.tsx` - Main game interface
- `ProfilePage.tsx` - Player profile
- `MapPage.tsx` - Territory map view
- `CombatPage.tsx` - Duel/combat interface

### `/src/hooks`
Custom React hooks for reusable logic.

**Example files:**
- `useAuth.ts` - Authentication state and actions
- `useCharacter.ts` - Current character data
- `useEnergy.ts` - Energy tracking and regeneration
- `useSocket.ts` - Socket.io connection management
- `useDestinyDeck.ts` - Destiny Deck draw visualization

### `/src/store`
Zustand stores for global state management.

**Example files:**
- `authStore.ts` - User authentication state
- `characterStore.ts` - Current character state
- `uiStore.ts` - UI state (modals, notifications, etc.)
- `chatStore.ts` - Chat messages and channels

### `/src/services`
API communication layer (fetch/axios wrappers).

**Example files:**
- `api.ts` - Base API configuration
- `authService.ts` - Auth API calls (login, register)
- `characterService.ts` - Character API calls
- `combatService.ts` - Combat API calls
- `socketService.ts` - Socket.io event handlers

### `/src/utils`
Utility functions and helpers.

**Example files:**
- `formatters.ts` - Date, number, currency formatting
- `validators.ts` - Form validation helpers
- `constants.ts` - Frontend constants

### `/src/assets`
Static assets (images, icons, fonts).

**Example organization:**
```
assets/
├── images/
│   ├── cards/           # Playing card graphics
│   ├── icons/           # UI icons
│   └── backgrounds/     # Background images
└── fonts/
    └── western/         # Western-themed fonts
```

### `/src/styles`
Global styles and Tailwind configuration.

**Example files:**
- `index.css` - Global CSS and Tailwind imports
- `tailwind.css` - Tailwind utilities
- `variables.css` - CSS custom properties

---

## Core Features to Implement

1. **Authentication UI** (Login, Register, Password Reset)
2. **Character Creation** (Faction selection, name, appearance)
3. **Game Dashboard** (Main hub with navigation)
4. **Character Sheet** (Stats, skills, inventory)
5. **Energy Display** (Current/max energy with regen timer)
6. **Destiny Deck UI** (Card draw animation and results)
7. **Combat Interface** (Duel initiation and resolution)
8. **Crime Interface** (Criminal activities menu)
9. **Map View** (Territory control visualization)
10. **Chat System** (Real-time chat with multiple channels)
11. **Gang Management** (Create, invite, manage gang)
12. **Player Profile** (Bio, stats, achievements)

---

## Technologies

- **Framework:** React 18+ with Hooks
- **Language:** TypeScript 5.x
- **Styling:** TailwindCSS 3.x
- **State Management:** Zustand
- **Real-Time:** Socket.io-client 4.x
- **HTTP Client:** Fetch API (or Axios)
- **Routing:** React Router 6.x
- **Testing:** Jest + React Testing Library
- **Build Tool:** Vite (or Create React App)

---

## Design System

### Color Palette (Western Theme)
```css
/* Tailwind config example */
colors: {
  'dusty-brown': '#8B7355',
  'canyon-red': '#A0522D',
  'sunset-orange': '#CD853F',
  'settler-blue': '#4682B4',
  'nahi-turquoise': '#40E0D0',
  'frontera-crimson': '#DC143C',
  'gold': '#FFD700',
  'leather': '#8B4513',
}
```

### Typography
- **Headings:** Western serif fonts (Clarendon, Rockwell)
- **Body:** Readable sans-serif (Inter, Roboto)
- **Accents:** Hand-drawn style for flavor text

### UI Style
- Weathered wood textures
- Leather-bound panels
- Wanted poster aesthetics
- Playing card motifs
- Dusty, muted tones with vibrant accents

---

## Component Patterns

### Example: Destiny Deck Card Display
```tsx
interface CardProps {
  suit: 'spades' | 'hearts' | 'clubs' | 'diamonds';
  rank: string;
  highlighted?: boolean;
}

export const PlayingCard: React.FC<CardProps> = ({ suit, rank, highlighted }) => {
  const suitColor = suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';

  return (
    <div className={`
      w-20 h-28 bg-white border-2 rounded-lg shadow-lg
      flex flex-col items-center justify-center
      ${highlighted ? 'ring-4 ring-gold' : ''}
    `}>
      <span className={`text-2xl font-bold ${suitColor}`}>{rank}</span>
      <span className={`text-3xl ${suitColor}`}>{getSuitSymbol(suit)}</span>
    </div>
  );
};
```

---

## Routing Structure

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* Protected routes (require authentication) */}
  <Route path="/game" element={<ProtectedRoute><GameLayout /></ProtectedRoute>}>
    <Route index element={<Dashboard />} />
    <Route path="character" element={<CharacterSheet />} />
    <Route path="combat" element={<CombatPage />} />
    <Route path="crime" element={<CrimePage />} />
    <Route path="map" element={<MapPage />} />
    <Route path="gang" element={<GangPage />} />
    <Route path="profile/:userId" element={<ProfilePage />} />
  </Route>
</Routes>
```

---

## Setup (Future)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## State Management Example

```typescript
// characterStore.ts
import create from 'zustand';

interface CharacterState {
  character: Character | null;
  energy: { current: number; max: number };
  isTraining: boolean;

  setCharacter: (character: Character) => void;
  updateEnergy: (energy: { current: number; max: number }) => void;
  startTraining: (skillId: string) => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  character: null,
  energy: { current: 150, max: 150 },
  isTraining: false,

  setCharacter: (character) => set({ character }),
  updateEnergy: (energy) => set({ energy }),
  startTraining: (skillId) => set({ isTraining: true }),
}));
```

---

**Status:** Phase 0 - Structure created, implementation pending Phase 1
**Next Steps:** Initialize package.json, tsconfig.json, Tailwind config, and begin Phase 1 development

---

*Built by Kaine & Hawk*
*Last Updated: November 15, 2025*
