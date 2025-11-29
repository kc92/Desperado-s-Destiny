# Toast Notification System

A western-themed toast notification system for Desperados Destiny featuring leather textures, gold borders, and smooth slide-in animations.

## Features

- **4 Variants**: Success, Error, Warning, and Info with distinct western color schemes
- **Western Styling**: Leather/wood backgrounds with gold borders and texture overlays
- **Smooth Animations**: Slide-in from top-right with fade effects
- **Auto-dismiss**: Configurable duration (default 5s) with manual dismiss option
- **Stacking Support**: Multiple toasts can display simultaneously
- **Action Buttons**: Optional action button for direct user response
- **Accessibility**: ARIA labels, screen reader support, keyboard navigation
- **Custom Icons**: Override default icons per toast

## Installation

The toast system is already integrated into the application. The `ToastContainer` is rendered in `App.tsx`.

## Basic Usage

### Import the Hook

```typescript
import { useToast } from '@/store/useToastStore';
```

### Simple Toasts

```typescript
function MyComponent() {
  const toast = useToast();

  // Success toast
  const handleSuccess = () => {
    toast.success('Gold Earned!', 'You earned 50 gold coins.');
  };

  // Error toast
  const handleError = () => {
    toast.error('Action Failed', 'Not enough energy.');
  };

  // Warning toast
  const handleWarning = () => {
    toast.warning('Low Health!', 'Your health is below 25%.');
  };

  // Info toast
  const handleInfo = () => {
    toast.info('Quest Available', 'Talk to the Sheriff.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

## Advanced Usage

### Custom Toast with All Options

```typescript
import { useToastStore } from '@/store/useToastStore';

function MyComponent() {
  const { addToast } = useToastStore();

  const handleCustomToast = () => {
    addToast({
      type: 'success',
      title: 'Achievement Unlocked!',
      message: 'You earned the "Quick Draw" achievement.',
      icon: '🏆',
      duration: 8000, // 8 seconds
      action: {
        label: 'View Achievements',
        onClick: () => {
          // Navigate to achievements page
          console.log('Navigating to achievements...');
        },
      },
    });
  };

  return <button onClick={handleCustomToast}>Show Custom Toast</button>;
}
```

### Persistent Toast (No Auto-Dismiss)

```typescript
const handlePersistentToast = () => {
  toast.addToast({
    type: 'error',
    title: 'Connection Lost',
    message: 'Please check your internet connection.',
    duration: 0, // Will not auto-dismiss
  });
};
```

### Toast with Custom Icon

```typescript
const handleCustomIcon = () => {
  toast.addToast({
    type: 'warning',
    title: 'Gang War!',
    message: 'Your gang is under attack!',
    icon: '⚔️',
  });
};
```

## API Reference

### `useToast()` Hook

Convenience hook that provides quick access to toast methods.

```typescript
const toast = useToast();
```

**Returns:**
- `success(title, message?)` - Show success toast
- `error(title, message?)` - Show error toast
- `warning(title, message?)` - Show warning toast
- `info(title, message?)` - Show info toast
- `addToast(toast)` - Add custom toast with all options

### `useToastStore()` Hook

Full Zustand store access for advanced usage.

```typescript
const { toasts, addToast, removeToast, clearAll } = useToastStore();
```

**Store State:**
- `toasts: Toast[]` - Array of active toasts
- `addToast(toast: Omit<Toast, 'id'>): string` - Add toast, returns ID
- `removeToast(id: string): void` - Remove specific toast
- `clearAll(): void` - Clear all toasts

### Toast Object

```typescript
interface Toast {
  id: string;               // Auto-generated unique ID
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;            // Main toast title (required)
  message?: string;         // Optional description
  icon?: string;            // Custom icon (default icons provided)
  duration?: number;        // Duration in ms (default: 5000, 0 = no auto-dismiss)
  action?: {
    label: string;          // Action button text
    onClick: () => void;    // Action button callback
  };
}
```

## Variants

### Success
- **Theme**: Wood background with gold borders
- **Icon**: ★ (star)
- **Use Cases**: Achievements, rewards, successful actions
- **Example**: "Gold Earned! You received 100 gold coins."

### Error
- **Theme**: Leather brown with red borders
- **Icon**: ✗ (X mark)
- **Use Cases**: Failed actions, errors, blocked attempts
- **Example**: "Action Failed. You don't have enough energy."

### Warning
- **Theme**: Saddle leather with gold borders
- **Icon**: ⚡ (lightning)
- **Use Cases**: Low resources, danger alerts, cautionary messages
- **Example**: "Low Health! Your health is below 25%."

### Info
- **Theme**: Dark wood with blue borders
- **Icon**: ◆ (diamond)
- **Use Cases**: Quest updates, tips, general information
- **Example**: "New Quest Available. Talk to the Sheriff."

## Design System

### Colors
- **Success**: `wood-medium` + `gold-medium` border + `gold-light` icon
- **Error**: `leather-brown` + `blood-red` border + `blood-crimson` icon
- **Warning**: `leather-saddle` + `gold-dark` border + `gold-light` icon
- **Info**: `wood-dark` + `faction-settler` border + `faction-settler` icon

### Typography
- **Title**: `font-western` (Rye serif) - For authentic western feel
- **Message**: `font-serif` (Merriweather) - For readability

### Animations
- **Entrance**: Slide-in from right with fade (300ms)
- **Exit**: Slide-out to right with fade and scale down (300ms)
- **Position**: Top-right, stacked vertically with 12px gap

### Accessibility
- `role="alert"` for screen readers
- `aria-live="polite"` on container
- `aria-label` on dismiss button
- Keyboard accessible dismiss button
- Color is not the only indicator (icons + text)

## Best Practices

### When to Use Toasts

✅ **DO USE for:**
- Success confirmations (item purchased, quest complete)
- Error messages (action failed, validation errors)
- Warnings (low resources, danger alerts)
- Info notifications (quest available, friend online)
- Transient feedback that doesn't require user action

❌ **DON'T USE for:**
- Critical decisions (use Modal/ConfirmDialog)
- Complex information (use dedicated pages/modals)
- Permanent status displays (use status bars)
- Multiple rapid toasts (overwhelming for users)

### Content Guidelines

**Titles:**
- Keep short: 1-4 words
- Action-oriented: "Gold Earned!", "Quest Complete!"
- Clear and specific

**Messages:**
- Keep concise: 1-2 sentences max
- Provide context: "You earned 50 gold from the bank heist"
- Avoid technical jargon

**Action Buttons:**
- Use sparingly
- Clear next action: "View Quest", "Accept Request"
- Single action only (not multiple buttons)

### Duration Guidelines

- **Success**: 5 seconds (default) - Positive feedback
- **Error**: 5-8 seconds - Users need time to read
- **Warning**: 5-8 seconds - Important to notice
- **Info**: 5 seconds (default) - General information
- **Critical**: 0 seconds (persistent) - Requires acknowledgment

## Examples in Context

### After Completing an Action

```typescript
const handleCompleteHeist = async () => {
  try {
    const result = await api.completeHeist();
    toast.success(
      'Heist Complete!',
      `You earned ${result.goldEarned} gold and ${result.xp} XP.`
    );
  } catch (error) {
    toast.error(
      'Heist Failed',
      'You were caught by the Sheriff. Try again later.'
    );
  }
};
```

### Energy System Warning

```typescript
const handleAction = () => {
  if (energy < 10) {
    toast.warning(
      'Low Energy',
      'You have less than 10 energy remaining. Consider resting.'
    );
  }
  // Continue with action...
};
```

### Level Up Notification

```typescript
const handleLevelUp = (newLevel: number) => {
  toast.addToast({
    type: 'success',
    title: `Level ${newLevel} Reached!`,
    message: 'You unlocked new skills and locations.',
    icon: '⭐',
    duration: 8000,
    action: {
      label: 'View Skills',
      onClick: () => navigate('/game/skills'),
    },
  });
};
```

### Friend Request

```typescript
const handleFriendRequest = (friendName: string) => {
  toast.addToast({
    type: 'info',
    title: 'Friend Request',
    message: `${friendName} wants to be your friend.`,
    action: {
      label: 'View Request',
      onClick: () => navigate('/game/friends'),
    },
  });
};
```

## Testing

To test the toast system, you can:

1. Import the examples component:
   ```typescript
   import { ToastExamples } from '@/components/ui/Toast.examples';
   ```

2. Add a test route in your app:
   ```typescript
   <Route path="/toast-demo" element={<ToastExamples />} />
   ```

3. Navigate to `/toast-demo` to see all variants and examples

## Troubleshooting

### Toasts not appearing
- Check that `<ToastContainer />` is rendered in `App.tsx`
- Verify the container has proper z-index (`z-50`)
- Check browser console for errors

### Toasts appearing in wrong position
- Ensure no conflicting fixed/absolute positioning
- Check that parent elements don't have `overflow: hidden`

### Animations not smooth
- Verify Tailwind CSS is properly configured
- Check that transition classes are not being overridden

### Multiple toasts overlapping
- This is expected behavior for stacked toasts
- Gap between toasts is 12px (`gap-3`)

## Related Components

- **Modal**: For critical decisions requiring user confirmation
- **ConfirmDialog**: For yes/no confirmations
- **NotificationToastContainer**: For server-pushed notifications

## Future Enhancements

Potential improvements for future versions:

- Progress bar showing time until auto-dismiss
- Sound effects for different toast types
- Position variants (top-left, bottom-right, etc.)
- Swipe-to-dismiss on mobile
- Queue system with max visible toasts
- Rich content support (images, custom components)
