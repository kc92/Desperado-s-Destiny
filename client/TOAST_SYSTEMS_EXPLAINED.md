# Two Toast Systems - Explained

Desperados Destiny has **two separate toast notification systems** serving different purposes. This is intentional and follows best practices for separating concerns.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Application                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Top-Right Corner (z-index: 50)                    │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  UI Toast Container (useToastStore)          │  │    │
│  │  │  ★ Gold Earned!                         [X]  │  │    │
│  │  │  ✗ Action Failed                        [X]  │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  CLIENT-SIDE: Immediate UI feedback                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Bottom-Right Corner (z-index: 50)                 │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  Notification Toast Container                │  │    │
│  │  │  📨 New Mail from Sheriff            [X]      │  │    │
│  │  │  🤝 Friend Request from Billy        [X]      │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │  SERVER-SIDE: WebSocket/Polling notifications     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## System 1: UI Toast Container (Top-Right)

### Purpose
**Client-side UI feedback** for immediate user actions and local state changes.

### Location
- **File**: `client/src/components/ui/Toast.tsx`
- **Store**: `client/src/store/useToastStore.ts`
- **Position**: Top-right corner
- **Use**: `import { useToast } from '@/store/useToastStore'`

### Characteristics
- **Trigger**: Manual by developer calling `toast.success()`, etc.
- **Data Source**: Local client state (no server communication)
- **Styling**: Western theme (leather, wood, gold)
- **Variants**: Success, Error, Warning, Info
- **Duration**: 5 seconds default (configurable)
- **Position**: Top-right (doesn't interfere with game UI)

### Use Cases
```typescript
// ✓ User completes an action
toast.success('Heist Complete!', 'You earned 100 gold');

// ✓ Validation error
toast.error('Invalid Input', 'Name must be 3-20 characters');

// ✓ Low resources
toast.warning('Low Energy', 'Less than 10 energy remaining');

// ✓ Tutorial tips
toast.info('New Feature', 'You can now craft items!');

// ✓ Client-side state changes
toast.success('Settings Saved', 'Your preferences have been updated');
```

### When to Use
- ✓ Immediate feedback for user actions
- ✓ Client-side validation errors
- ✓ Local state changes
- ✓ Tutorial/onboarding tips
- ✓ Success confirmations
- ✓ Resource warnings

### When NOT to Use
- ✗ Server-pushed events (use Notification system)
- ✗ Real-time multiplayer events (use Notification system)
- ✗ Background updates (use Notification system)

---

## System 2: Notification Toast Container (Bottom-Right)

### Purpose
**Server-pushed notifications** for real-time events happening in the game world.

### Location
- **File**: `client/src/components/notifications/ToastContainer.tsx`
- **Store**: `client/src/store/useNotificationStore.ts`
- **Position**: Bottom-right corner
- **Trigger**: WebSocket or polling from server

### Characteristics
- **Trigger**: Automatic from server via WebSocket/polling
- **Data Source**: Server-sent events
- **Styling**: Wood-dark background with gold accents
- **Types**: MAIL_RECEIVED, FRIEND_REQUEST, GANG_INVITATION, etc.
- **Duration**: 5 seconds (auto-dismiss)
- **Position**: Bottom-right (near game chat/controls)
- **Progress Bar**: Visual countdown timer

### Use Cases
```typescript
// ✓ New mail received (server event)
// → Automatically shown when server sends notification

// ✓ Friend request (server event)
// → Automatically shown when another player sends request

// ✓ Gang invitation (server event)
// → Automatically shown when gang leader invites

// ✓ Combat defeat (server event)
// → Automatically shown after combat resolves

// ✓ Jail release (server event)
// → Automatically shown after jail time expires
```

### When to Use
- ✓ Real-time server events
- ✓ Multiplayer interactions (friend requests, duels, etc.)
- ✓ Async background events (mail, combat results, etc.)
- ✓ World events (gang wars, territory changes, etc.)
- ✓ Time-based triggers (jail release, energy restore, etc.)

### When NOT to Use
- ✗ Immediate UI feedback (use UI Toast system)
- ✗ Client-side validation (use UI Toast system)
- ✗ Local state changes (use UI Toast system)

---

## Side-by-Side Comparison

| Feature | UI Toast (Top-Right) | Notification Toast (Bottom-Right) |
|---------|---------------------|-----------------------------------|
| **Purpose** | Client UI feedback | Server-pushed events |
| **Trigger** | Manual (`toast.success()`) | Automatic (server sends) |
| **Position** | Top-right | Bottom-right |
| **Store** | `useToastStore` | `useNotificationStore` |
| **Variants** | Success, Error, Warning, Info | Notification types (mail, friend, etc.) |
| **Icons** | ★ ✗ ⚡ ◆ | 📨 🤝 ⚔️ 💀 etc. |
| **Duration** | 5s (configurable) | 5s (fixed) |
| **Progress Bar** | No | Yes (shrinking bar) |
| **Action Button** | Optional | "View details" link |
| **Background** | Leather/wood variants | Wood-dark |
| **Border** | Gold variants | Gold-light |
| **Use Case** | "You earned gold!" | "You received mail!" |
| **Data Source** | Client state | Server events |
| **Real-time** | No | Yes |

---

## Why Two Systems?

### Separation of Concerns
1. **Different Data Sources**:
   - UI Toasts: Client-side state
   - Notifications: Server-side events

2. **Different Timing**:
   - UI Toasts: Immediate (synchronous)
   - Notifications: Async (could arrive anytime)

3. **Different User Expectations**:
   - UI Toasts: Expected response to action
   - Notifications: Unexpected events

4. **Different Visual Treatment**:
   - UI Toasts: Feedback (top where action happened)
   - Notifications: Information (bottom near chat/social)

5. **Different Priorities**:
   - UI Toasts: Higher priority (user just acted)
   - Notifications: Lower priority (background event)

### Best Practices
This pattern is common in modern applications:
- **Discord**: Local toasts (top) + notifications (bottom-right)
- **Slack**: Action feedback (top) + message notifications (bottom)
- **GitHub**: UI feedback (top) + review notifications (bottom)

---

## Integration in App.tsx

```typescript
// client/src/App.tsx

import { ToastContainer as NotificationToastContainer } from '@/components/notifications/ToastContainer';
import { ToastContainer as UIToastContainer } from '@/components/ui/Toast';

function App() {
  return (
    <BrowserRouter>
      {/* ... routes ... */}

      {/* Toast Notifications - Server notifications */}
      <NotificationToastContainer />

      {/* UI Toasts - Action feedback toasts */}
      <UIToastContainer />
    </BrowserRouter>
  );
}
```

### Why This Order?
1. NotificationToastContainer (bottom-right, z-50)
2. UIToastContainer (top-right, z-50)

Both have same z-index but different positions, so no conflicts.

---

## Usage Guidelines

### Use UI Toast (Top-Right) for:

```typescript
import { useToast } from '@/store/useToastStore';

// ✓ User completes purchase
const handlePurchase = async () => {
  await api.purchase(itemId);
  toast.success('Purchase Complete!', 'Item added to inventory');
};

// ✓ Form validation
const handleSubmit = () => {
  if (!isValid) {
    toast.error('Invalid Form', 'Please fill all required fields');
    return;
  }
};

// ✓ Local state change
const handleToggleSetting = () => {
  setSetting(!setting);
  toast.success('Setting Updated', 'Preferences saved locally');
};
```

### Notification System (Bottom-Right) handles automatically:

```typescript
// ✗ DON'T manually create these - server sends them automatically

// Server sends via WebSocket:
{
  type: 'MAIL_RECEIVED',
  title: 'New Mail',
  message: 'You received a letter from the Sheriff',
  link: '/game/mail'
}

// Frontend automatically shows notification toast
// No developer action needed!
```

---

## Migration Guide

If you're unsure which system to use:

### Step 1: Ask yourself

**Question**: "Is this triggered by a user action happening RIGHT NOW?"
- **YES** → Use UI Toast (top-right)
- **NO** → It's probably a notification (bottom-right)

**Question**: "Does this come from the server via WebSocket/polling?"
- **YES** → Use Notification Toast (bottom-right)
- **NO** → Use UI Toast (top-right)

**Question**: "Would this interrupt the user's current task?"
- **YES (high priority)** → Use UI Toast (top-right)
- **NO (can wait)** → Use Notification Toast (bottom-right)

### Step 2: Examples

| Scenario | System | Reason |
|----------|--------|--------|
| User clicks "Buy Item" → Success | UI Toast | Immediate feedback |
| User enters invalid email → Error | UI Toast | Immediate validation |
| Friend sends request (you're offline) | Notification | Async server event |
| Combat resolves (you weren't watching) | Notification | Background event |
| User unlocks achievement | UI Toast | Immediate reward feedback |
| Mail arrives (you're in another page) | Notification | Async delivery |
| User completes quest | UI Toast | Action completion |
| Gang war starts (you're invited) | Notification | Real-time event |

---

## Technical Details

### UI Toast Store (useToastStore)

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  icon?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

// Usage
const toast = useToast();
toast.success(title, message);
toast.error(title, message);
toast.warning(title, message);
toast.info(title, message);
```

### Notification Store (useNotificationStore)

```typescript
interface NotificationToast {
  toastId: string;
  type: NotificationType; // 'MAIL_RECEIVED' | 'FRIEND_REQUEST' | ...
  title: string;
  message: string;
  link?: string;
}

// Automatically managed by WebSocket/polling
// No manual usage needed
```

---

## Visual Position Guide

```
┌──────────────────────────────────────────────────────┐
│  Navigation Bar                                      │
├──────────────────────────────────────────────────────┤
│                                              ┌─────┐ │
│  Main Content Area                           │ UI  │ │ ← UI Toasts (top-right)
│                                              │Toast│ │   Action feedback
│                                              └─────┘ │
│                                                       │
│  [Your action buttons and forms here]                │
│                                                       │
│                                                       │
│                                                       │
│                                                       │
│                                              ┌─────┐ │
│                                              │Notif│ │ ← Notifications (bottom-right)
│                                              │Toast│ │   Server events
└──────────────────────────────────────────────└─────┘─┘
```

---

## Testing Both Systems

### Test UI Toast System

```typescript
// Navigate to any page with a button
import { useToast } from '@/store/useToastStore';

const TestButton = () => {
  const toast = useToast();

  return (
    <button onClick={() => toast.success('Test', 'UI Toast works!')}>
      Test UI Toast
    </button>
  );
};
```

### Test Notification System

```typescript
// Notifications are triggered by server
// To test: Send yourself mail, friend request, etc.
// Or use the notification store directly for testing:

import { useNotificationStore } from '@/store/useNotificationStore';

const TestButton = () => {
  const { addToast } = useNotificationStore();

  return (
    <button onClick={() => addToast({
      type: 'MAIL_RECEIVED',
      title: 'Test Notification',
      message: 'This is a test notification',
    })}>
      Test Notification Toast
    </button>
  );
};
```

---

## Summary

| What do you need? | Use this system |
|-------------------|-----------------|
| Immediate feedback for user action | **UI Toast** (top-right) |
| Server-pushed real-time event | **Notification Toast** (bottom-right) |
| Validation error | **UI Toast** |
| Friend request notification | **Notification Toast** |
| Purchase confirmation | **UI Toast** |
| Mail received | **Notification Toast** |
| Settings saved | **UI Toast** |
| Gang war started | **Notification Toast** |

**Remember**:
- **Top-Right (UI)** = "You just did something"
- **Bottom-Right (Notification)** = "Something happened in the game"

---

## Documentation References

- **UI Toast System**: See `client/src/components/ui/Toast.README.md`
- **UI Toast Quick Reference**: See `client/src/components/ui/TOAST_QUICK_REFERENCE.md`
- **UI Toast Architecture**: See `client/TOAST_ARCHITECTURE.md`
- **UI Toast Examples**: See `client/src/components/ui/Toast.examples.tsx`

---

*Both systems work together seamlessly to provide comprehensive feedback to users without overwhelming them.*
