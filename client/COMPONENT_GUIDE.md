# Component Guide - Desperados Destiny Frontend

Quick reference for all implemented components and their usage.

---

## UI Components (`src/components/ui/`)

### Button
Western-styled button with multiple variants and states.

```tsx
import { Button } from '@/components/ui';

// Variants: primary, secondary, danger, ghost
// Sizes: sm, md, lg

<Button variant="primary" size="lg" onClick={handleClick}>
  Enter the Territory
</Button>

<Button variant="secondary" isLoading>
  Loading...
</Button>

<Button variant="danger" disabled>
  Disabled
</Button>

<Button fullWidth>
  Full Width Button
</Button>
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'danger' | 'ghost'` - Button style (default: primary)
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: md)
- `isLoading?: boolean` - Show loading spinner
- `fullWidth?: boolean` - Make button full width
- `disabled?: boolean` - Disable button
- Plus all standard HTML button attributes

---

### Card
Western-themed card component with wood/leather/parchment variants.

```tsx
import { Card } from '@/components/ui';

// Variants: wood, leather, parchment
// Padding: none, sm, md, lg

<Card variant="wood" padding="md" hover>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

<Card variant="parchment">
  Parchment-style content
</Card>
```

**Props:**
- `variant?: 'wood' | 'leather' | 'parchment'` - Card style (default: wood)
- `padding?: 'none' | 'sm' | 'md' | 'lg'` - Internal padding (default: md)
- `hover?: boolean` - Add hover animation
- `className?: string` - Additional CSS classes
- `children: React.ReactNode` - Card content

---

### Input
Form input with label, error, and helper text support.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  name="email"
  placeholder="your@email.com"
  value={email}
  onChange={handleChange}
  error={errors.email}
  helperText="We'll never share your email"
  required
/>
```

**Props:**
- `label?: string` - Input label
- `error?: string` - Error message to display
- `helperText?: string` - Helper text below input
- Plus all standard HTML input attributes

---

### LoadingSpinner
Western-themed loading indicator with star decoration.

```tsx
import { LoadingSpinner } from '@/components/ui';

// Sizes: sm, md, lg

<LoadingSpinner size="lg" />

<LoadingSpinner fullScreen />
```

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Spinner size (default: md)
- `color?: string` - Border color class (default: border-gold-medium)
- `fullScreen?: boolean` - Show as full-screen overlay

---

### Modal
Western-themed modal dialog with backdrop.

```tsx
import { Modal } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="lg"
>
  <p>Modal content goes here</p>
</Modal>
```

**Props:**
- `isOpen: boolean` - Whether modal is visible
- `onClose: () => void` - Close handler
- `title: string` - Modal title
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Modal width (default: md)
- `showCloseButton?: boolean` - Show X button (default: true)
- `children: React.ReactNode` - Modal content

---

## Layout Components (`src/components/layout/`)

### Header
Main navigation header with auth state.

```tsx
import { Header } from '@/components/layout';

// Used in GameLayout, automatically shows login/register or user menu
<Header />
```

**Features:**
- Shows logo and game title
- Login/Register buttons for guests
- User menu with logout for authenticated users
- Responsive design

---

### Footer
Application footer with credits and links.

```tsx
import { Footer } from '@/components/layout';

<Footer />
```

**Features:**
- About section
- Quick links
- Credits
- Automatic year update

---

### GameLayout
Main layout wrapper for authenticated game pages.

```tsx
import { GameLayout } from '@/components/layout';
import { Outlet } from 'react-router-dom';

// In routes:
<Route path="/game" element={<GameLayout />}>
  <Route index element={<Game />} />
  {/* Nested routes render in the Outlet */}
</Route>
```

**Features:**
- Includes Header and Footer
- Responsive container for content
- Uses React Router Outlet for nested routes

---

## Pages (`src/pages/`)

### Landing
Beautiful western-themed landing page.

```tsx
import { Landing } from '@/pages';

<Route path="/" element={<Landing />} />
```

**Features:**
- Hero section with game title
- Features showcase (3 cards)
- Game mechanics preview
- Multiple CTAs
- Fully responsive

---

### Login
User authentication page with form validation.

```tsx
import { Login } from '@/pages';

<Route path="/login" element={<Login />} />
```

**Features:**
- Email and password fields
- Client-side validation
- Error display
- Link to register
- Redirects to /game on success

---

### Register
New user registration with comprehensive validation.

```tsx
import { Register } from '@/pages';

<Route path="/register" element={<Register />} />
```

**Features:**
- Username, email, password, confirm password
- Comprehensive validation rules
- Error display
- Link to login
- Redirects to /game on success

---

### Game
Main game dashboard (placeholder for future features).

```tsx
import { Game } from '@/pages';

<Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
```

**Features:**
- Welcome banner with username
- Feature card grid (6 placeholder features)
- Ready for expansion

---

### NotFound
404 error page with western theme.

```tsx
import { NotFound } from '@/pages';

<Route path="*" element={<NotFound />} />
```

**Features:**
- Wanted poster style
- Links back to home and game
- Western aesthetic

---

## Protected Route

Wrapper component for authenticated routes.

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route
  path="/game"
  element={
    <ProtectedRoute>
      <GameLayout />
    </ProtectedRoute>
  }
/>
```

**Props:**
- `children: React.ReactNode` - Protected content
- `redirectTo?: string` - Where to redirect if not authenticated (default: /login)

---

## Zustand Stores

### useAuthStore
Authentication state management.

```tsx
import { useAuthStore } from '@/store/useAuthStore';

const {
  user,
  isAuthenticated,
  isLoading,
  error,
  login,
  register,
  logout,
  checkAuth,
  clearError
} = useAuthStore();

// Login
await login({ email, password });

// Register
await register({ username, email, password, confirmPassword });

// Logout
await logout();

// Check auth on app load
useEffect(() => {
  checkAuth();
}, []);
```

---

### useGameStore
Game state management.

```tsx
import { useGameStore } from '@/store/useGameStore';

const {
  character,
  currentLocation,
  isLoading,
  error,
  setCharacter,
  updateCharacter,
  setLocation,
  clearGameState
} = useGameStore();

// Set character
setCharacter(characterData);

// Update character
updateCharacter({ level: 5 });

// Clear on logout
clearGameState();
```

---

### useUIStore
UI state (modals, notifications).

```tsx
import { useUIStore } from '@/store/useUIStore';

const {
  notifications,
  isModalOpen,
  addNotification,
  openModal,
  closeModal
} = useUIStore();

// Add notification
addNotification({
  type: 'success',
  message: 'Action completed!',
  duration: 5000
});

// Open modal
openModal('Title', <div>Content</div>);

// Close modal
closeModal();
```

---

## Styling

### Tailwind Theme Colors

```tsx
// Desert tones
'desert-sand', 'desert-stone', 'desert-clay', 'desert-dust'

// Wood tones
'wood-dark', 'wood-medium', 'wood-light', 'wood-grain'

// Leather tones
'leather-brown', 'leather-tan', 'leather-saddle'

// Gold
'gold-dark', 'gold-medium', 'gold-light', 'gold-pale'

// Blood/danger
'blood-red', 'blood-dark', 'blood-crimson'

// Faction colors
'faction-settler', 'faction-nahi', 'faction-frontera'

// Western utility
'western-primary', 'western-secondary', 'western-accent', 'western-bg'
```

### Custom CSS Classes

```tsx
// Panel styles
className="wood-panel"      // Wood texture panel
className="leather-panel"   // Leather texture panel
className="parchment"       // Paper/parchment style

// Button style
className="btn-western"     // Western button base

// Input style
className="input-western"   // Form input

// Utility
className="text-shadow-gold"
className="text-shadow-dark"
className="divider-western"
```

### Fonts

```tsx
font-western    // Rye (headings)
font-serif      // Merriweather (body serif)
font-sans       // Inter (clean sans)
font-handwritten // Permanent Marker (accents)
```

---

**Last Updated:** November 16, 2025
