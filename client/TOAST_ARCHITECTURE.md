# Toast Notification System - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                   App.tsx                            │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │          <ToastContainer />                   │  │  │
│  │  │  (Renders at top-right, z-index: 50)        │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Any Component                          │  │
│  │                                                      │  │
│  │  const toast = useToast();                          │  │
│  │  toast.success('Gold Earned!', 'You got 50 gold'); │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               Zustand Store (useToastStore)                 │
│                                                             │
│  State:                                                     │
│  ├─ toasts: Toast[]                                        │
│                                                             │
│  Actions:                                                   │
│  ├─ addToast(toast)    → Add toast & start timer          │
│  ├─ removeToast(id)    → Remove specific toast            │
│  ├─ clearAll()         → Clear all toasts                 │
│  ├─ success(title, msg)                                    │
│  ├─ error(title, msg)                                      │
│  ├─ warning(title, msg)                                    │
│  └─ info(title, msg)                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ToastContainer                           │
│  (Fixed position: top-4 right-4, z-50)                     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │  Toast 1 (Success)  [★ Gold Earned!]         [X]  │    │
│  └───────────────────────────────────────────────────┘    │
│        ▲ Slide in from right (translate-x-full → 0)       │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │  Toast 2 (Error)    [✗ Action Failed]        [X]  │    │
│  └───────────────────────────────────────────────────┘    │
│        ▲ Stacked with 12px gap                            │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │  Toast 3 (Warning)  [⚡ Low Energy]          [X]  │    │
│  └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

```
client/src/
├── store/
│   └── useToastStore.ts           ← Zustand store (state management)
│       ├── Toast interface
│       ├── ToastType type
│       ├── useToastStore hook     ← Full store access
│       └── useToast hook          ← Convenience hook
│
├── components/
│   └── ui/
│       ├── Toast.tsx              ← Toast component
│       │   ├── ToastItem          ← Individual toast item
│       │   └── ToastContainer     ← Container for all toasts
│       │
│       ├── Toast.examples.tsx     ← Interactive demo page
│       ├── Toast.README.md        ← Full documentation
│       └── index.ts               ← Exports ToastContainer
│
└── App.tsx                        ← ToastContainer rendered here
```

## Data Flow

### Adding a Toast

```
Component
   │
   │ toast.success('Title', 'Message')
   │
   ▼
useToast hook
   │
   │ Calls useToastStore.success()
   │
   ▼
useToastStore
   │
   │ 1. Generate unique ID
   │ 2. Add defaults (icon, duration)
   │ 3. Add to toasts array
   │ 4. Start auto-dismiss timer
   │
   ▼
Store State Updated
   │
   │ toasts: [..., newToast]
   │
   ▼
ToastContainer Re-renders
   │
   │ Maps over toasts array
   │
   ▼
ToastItem Rendered
   │
   │ 1. Entrance animation (50ms delay)
   │ 2. Display toast content
   │ 3. Start exit timer (duration - 300ms)
   │ 4. Exit animation + remove
   │
   ▼
Toast Displayed & Auto-dismissed
```

### Removing a Toast

```
User Action
   │
   │ Clicks [X] button OR auto-dismiss timer fires
   │
   ▼
ToastItem.handleRemove()
   │
   │ 1. Set isExiting = true
   │ 2. Wait 300ms for exit animation
   │ 3. Call onRemove()
   │
   ▼
useToastStore.removeToast(id)
   │
   │ Filter out toast by ID
   │
   ▼
Store State Updated
   │
   │ toasts: toasts.filter(t => t.id !== id)
   │
   ▼
ToastContainer Re-renders
   │
   │ Toast no longer in array
   │
   ▼
ToastItem Unmounted
```

## Toast Lifecycle

```
1. CREATED
   │ addToast() called
   │ → Generate ID
   │ → Add defaults
   │ → Add to store
   │
   ▼
2. ENTERING (0-50ms)
   │ isEntering = true
   │ → translate-x-full (off-screen right)
   │ → opacity-0
   │
   ▼
3. VISIBLE (50ms - duration-300ms)
   │ isEntering = false
   │ → translate-x-0 (on-screen)
   │ → opacity-100
   │ → User can read & interact
   │
   ▼
4. EXITING (duration-300ms - duration)
   │ isExiting = true
   │ → translate-x-full (off-screen right)
   │ → opacity-0
   │ → scale-95
   │
   ▼
5. REMOVED (at duration)
   │ removeToast(id) called
   │ → Filter from toasts array
   │ → Component unmounted
```

## State Management (Zustand)

### Store Schema

```typescript
interface ToastStore {
  // State
  toasts: Toast[];

  // Actions
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;

  // Convenience methods
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}
```

### Toast Schema

```typescript
interface Toast {
  id: string;               // Unique: toast-{timestamp}-{random}
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;            // Required: Main message
  message?: string;         // Optional: Secondary text
  icon?: string;            // Optional: Custom icon (defaults: ★ ✗ ⚡ ◆)
  duration?: number;        // Optional: ms (default: 5000, 0 = no dismiss)
  action?: {
    label: string;          // Action button text
    onClick: () => void;    // Action callback
  };
}
```

## Styling Architecture

### Variant Styles

```typescript
const variantStyles = {
  success: {
    bg: 'bg-wood-medium',           // #5D4037 (wood brown)
    border: 'border-gold-medium',   // #DAA520 (goldenrod)
    icon: 'text-gold-light',        // #FFD700 (gold)
    shadow: 'shadow-gold',          // Gold glow
    iconBg: 'bg-gold-dark/20',      // Translucent gold
  },
  error: {
    bg: 'bg-leather-brown',         // #6F4E37 (leather)
    border: 'border-blood-red',     // #8B0000 (dark red)
    icon: 'text-blood-crimson',     // #DC143C (crimson)
    shadow: 'shadow-lg',            // Standard shadow
    iconBg: 'bg-blood-dark/20',     // Translucent red
  },
  warning: {
    bg: 'bg-leather-saddle',        // #8B4513 (saddle brown)
    border: 'border-gold-dark',     // #B8860B (dark gold)
    icon: 'text-gold-light',        // #FFD700 (gold)
    shadow: 'shadow-gold',          // Gold glow
    iconBg: 'bg-gold-dark/30',      // Translucent gold
  },
  info: {
    bg: 'bg-wood-dark',             // #3E2723 (dark wood)
    border: 'border-faction-settler', // #4682B4 (steel blue)
    icon: 'text-faction-settler',   // #4682B4 (steel blue)
    shadow: 'shadow-lg',            // Standard shadow
    iconBg: 'bg-faction-settler/20', // Translucent blue
  },
};
```

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ ToastItem (min-w-[320px] max-w-sm)                  │
│ ├─ Padding: 16px (p-4)                              │
│ ├─ Border: 3px solid variant color                  │
│ ├─ Border Radius: 8px (rounded-lg)                  │
│ ├─ Background: variant color + texture overlay      │
│ └─ Shadow: variant shadow                           │
│                                                      │
│  ┌──────────┬────────────────────────┬──────────┐  │
│  │  Icon    │  Content               │  Close   │  │
│  │  Badge   │                        │  Button  │  │
│  │          │  ┌──────────────────┐  │          │  │
│  │  ┌────┐  │  │ Title (Western)  │  │    X     │  │
│  │  │ ★  │  │  └──────────────────┘  │          │  │
│  │  └────┘  │  ┌──────────────────┐  │          │  │
│  │          │  │ Message (Serif)  │  │          │  │
│  │  40x40   │  └──────────────────┘  │   24x24  │  │
│  │  circle  │  ┌──────────────────┐  │          │  │
│  │          │  │ [Action Button]  │  │          │  │
│  │          │  └──────────────────┘  │          │  │
│  └──────────┴────────────────────────┴──────────┘  │
│     Flex Gap: 12px                                  │
└─────────────────────────────────────────────────────┘
```

## Animation Details

### Entrance Animation (50ms → 350ms)

```
Initial State (0ms):
  - transform: translateX(100%)  ← Off-screen right
  - opacity: 0
  - isEntering: true

After 50ms delay:
  - isEntering: false

Final State (350ms):
  - transform: translateX(0)     ← On-screen
  - opacity: 1
  - transition: all 300ms ease-out
```

### Exit Animation (duration-300ms → duration)

```
Initial State:
  - transform: translateX(0)     ← On-screen
  - opacity: 1
  - scale: 1

Trigger Exit (duration - 300ms):
  - isExiting: true

Final State (300ms later):
  - transform: translateX(100%)  ← Off-screen right
  - opacity: 0
  - scale: 0.95                  ← Slight shrink
  - transition: all 300ms ease-out

After animation complete:
  - Component removed from DOM
```

## Performance Considerations

### Optimization Strategies

1. **Zustand Store**: Minimal re-renders
   - Only ToastContainer subscribes to store
   - Individual components don't re-render on toast changes

2. **Conditional Rendering**:
   - ToastContainer returns null when toasts.length === 0
   - No DOM nodes rendered when no toasts

3. **Hardware Acceleration**:
   - Uses CSS transforms (translate) for animations
   - GPU-accelerated, not CPU-bound

4. **Auto-cleanup**:
   - Timers automatically clean up toasts
   - No memory leaks from persistent toasts

5. **Pointer Events**:
   - Container has pointer-events-none
   - Individual toasts have pointer-events-auto
   - No interference with page interactions

## Accessibility Features

### ARIA Attributes

```html
<!-- Container -->
<div
  aria-label="Notifications"
  aria-live="polite"
  role="region"
>
  <!-- Toast Item -->
  <div
    role="alert"
    aria-live="polite"
  >
    <!-- Icon (decorative) -->
    <span aria-hidden="true">★</span>

    <!-- Content (read by screen readers) -->
    <div>
      <h4>Gold Earned!</h4>
      <p>You earned 50 gold coins.</p>
    </div>

    <!-- Close Button -->
    <button aria-label="Dismiss notification">
      X
    </button>
  </div>
</div>
```

### Keyboard Navigation

- **Tab**: Focus close button
- **Enter/Space**: Dismiss toast
- **Escape**: (future enhancement) Dismiss focused toast

### Screen Reader Behavior

1. Toast appears → Announced as "Alert: Gold Earned! You earned 50 gold coins"
2. User can navigate to close button
3. Closing toast is announced
4. Focus returns to previous element

## Integration Points

### Current Integration

```typescript
// App.tsx
import { ToastContainer } from '@/components/ui/Toast';

function App() {
  return (
    <BrowserRouter>
      {/* ... routes ... */}

      {/* Toast Container - Always rendered */}
      <ToastContainer />
    </BrowserRouter>
  );
}
```

### Usage in Components

```typescript
// Any component
import { useToast } from '@/store/useToastStore';

function MyComponent() {
  const toast = useToast();

  const handleAction = async () => {
    try {
      await performAction();
      toast.success('Action Complete!');
    } catch (error) {
      toast.error('Action Failed', error.message);
    }
  };

  return <button onClick={handleAction}>Do Action</button>;
}
```

## Dependencies

### External Dependencies
- **zustand**: State management (already in project)
- **react**: Core library (already in project)

### Internal Dependencies
- **Tailwind CSS**: Styling (already configured)
- **Custom colors**: Western theme colors (defined in tailwind.config.js)
- **Custom fonts**: Western, Serif fonts (defined in index.css)

### No Additional Installation Required
All dependencies are already present in the project. No new packages needed.

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Transforms | ✓ | ✓ | ✓ | ✓ |
| CSS Transitions | ✓ | ✓ | ✓ | ✓ |
| Flexbox | ✓ | ✓ | ✓ | ✓ |
| ARIA | ✓ | ✓ | ✓ | ✓ |
| ES6+ (transpiled) | ✓ | ✓ | ✓ | ✓ |

**Minimum Versions:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancement Ideas

### Phase 2 Enhancements
1. **Progress Bar**: Visual countdown until auto-dismiss
2. **Sound Effects**: Optional audio feedback per variant
3. **Swipe to Dismiss**: Mobile gesture support
4. **Queue System**: Max visible toasts with queue
5. **Position Options**: Top-left, bottom-right, etc.

### Phase 3 Enhancements
1. **Rich Content**: Images, custom React components
2. **Toast Groups**: Related toasts grouped together
3. **Persistent History**: View dismissed toasts
4. **Toast Templates**: Pre-defined toast configurations
5. **Analytics**: Track toast engagement metrics

## Testing Recommendations

### Unit Tests
```typescript
// useToastStore.test.ts
describe('useToastStore', () => {
  it('should add toast with unique ID', () => {
    const id = useToastStore.getState().success('Title');
    expect(id).toBeTruthy();
  });

  it('should remove toast by ID', () => {
    const id = useToastStore.getState().success('Title');
    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should apply default duration', () => {
    useToastStore.getState().success('Title');
    const toast = useToastStore.getState().toasts[0];
    expect(toast.duration).toBe(5000);
  });
});
```

### Integration Tests
```typescript
// Toast.test.tsx
describe('ToastContainer', () => {
  it('should render toast when added', () => {
    render(<ToastContainer />);
    act(() => useToastStore.getState().success('Test'));
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should dismiss toast on close button click', () => {
    render(<ToastContainer />);
    act(() => useToastStore.getState().success('Test'));
    fireEvent.click(screen.getByLabelText('Dismiss notification'));
    waitFor(() => {
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });
  });
});
```

### E2E Tests
```typescript
// toast.e2e.test.ts
describe('Toast System E2E', () => {
  it('should show success toast after completing action', async () => {
    await page.click('[data-testid="complete-heist"]');
    await page.waitForSelector('[role="alert"]');
    const toast = await page.textContent('[role="alert"]');
    expect(toast).toContain('Heist Complete!');
  });
});
```

## Maintenance & Support

### File Ownership
- **Store**: `client/src/store/useToastStore.ts`
- **Component**: `client/src/components/ui/Toast.tsx`
- **Documentation**: `client/src/components/ui/Toast.README.md`
- **Examples**: `client/src/components/ui/Toast.examples.tsx`

### Version History
- **v1.0.0** (Current): Initial implementation with western theme
  - 4 variants with distinct styling
  - Slide-in animations from top-right
  - Auto-dismiss with manual override
  - Action button support
  - Full accessibility

### Breaking Changes
None - This is the initial version

### Deprecation Policy
No deprecated features at this time

## Summary

The Toast Notification System is a production-ready, fully-featured notification system with:
- Western theme styling matching the game aesthetic
- Smooth animations and transitions
- Full accessibility support
- Comprehensive documentation
- Zero additional dependencies
- Excellent performance characteristics
- Easy-to-use API
- Extensible architecture for future enhancements

The system is ready for immediate use throughout the Desperados Destiny application.
