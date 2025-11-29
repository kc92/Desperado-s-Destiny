# Toast System - Quick Reference

## TL;DR

```typescript
import { useToast } from '@/store/useToastStore';

function MyComponent() {
  const toast = useToast();

  // Simple usage
  toast.success('Title', 'Optional message');
  toast.error('Title', 'Optional message');
  toast.warning('Title', 'Optional message');
  toast.info('Title', 'Optional message');

  // Advanced usage
  toast.addToast({
    type: 'success',
    title: 'Achievement!',
    message: 'You earned a badge',
    icon: '🏆',
    duration: 8000,
    action: {
      label: 'View',
      onClick: () => navigate('/achievements'),
    },
  });
}
```

## Variants at a Glance

| Variant | Color | Icon | Use For |
|---------|-------|------|---------|
| **Success** | Gold/Wood | ★ | Rewards, achievements, successful actions |
| **Error** | Red/Leather | ✗ | Failures, errors, blocked actions |
| **Warning** | Amber/Leather | ⚡ | Low resources, danger alerts |
| **Info** | Blue/Wood | ◆ | Quest updates, tips, notifications |

## Common Patterns

### After API Call

```typescript
try {
  const result = await api.action();
  toast.success('Success!', result.message);
} catch (error) {
  toast.error('Failed', error.message);
}
```

### Resource Warning

```typescript
if (energy < 10) {
  toast.warning('Low Energy', 'Less than 10 energy remaining');
}
```

### With Action Button

```typescript
toast.addToast({
  type: 'info',
  title: 'Friend Request',
  message: 'Billy wants to be your friend',
  action: {
    label: 'View',
    onClick: () => navigate('/game/friends'),
  },
});
```

### Custom Duration

```typescript
toast.addToast({
  type: 'success',
  title: 'Level Up!',
  duration: 8000, // 8 seconds
});
```

### Persistent Toast

```typescript
toast.addToast({
  type: 'error',
  title: 'Connection Lost',
  duration: 0, // Won't auto-dismiss
});
```

## API Cheatsheet

### useToast Hook

```typescript
const toast = useToast();
```

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `success` | `title, message?` | `string` (ID) | Show success toast |
| `error` | `title, message?` | `string` (ID) | Show error toast |
| `warning` | `title, message?` | `string` (ID) | Show warning toast |
| `info` | `title, message?` | `string` (ID) | Show info toast |
| `addToast` | `Toast` object | `string` (ID) | Add custom toast |

### Toast Object

```typescript
interface Toast {
  type: 'success' | 'error' | 'warning' | 'info'; // Required
  title: string;                                  // Required
  message?: string;                               // Optional
  icon?: string;                                  // Optional (defaults: ★ ✗ ⚡ ◆)
  duration?: number;                              // Optional (default: 5000ms, 0 = no dismiss)
  action?: {                                      // Optional
    label: string;
    onClick: () => void;
  };
}
```

## Style Reference

### Colors by Variant

```typescript
success: {
  background: '#5D4037',  // wood-medium
  border: '#DAA520',      // gold-medium
  icon: '#FFD700',        // gold-light
  shadow: 'gold glow',
}

error: {
  background: '#6F4E37',  // leather-brown
  border: '#8B0000',      // blood-red
  icon: '#DC143C',        // blood-crimson
  shadow: 'standard',
}

warning: {
  background: '#8B4513',  // leather-saddle
  border: '#B8860B',      // gold-dark
  icon: '#FFD700',        // gold-light
  shadow: 'gold glow',
}

info: {
  background: '#3E2723',  // wood-dark
  border: '#4682B4',      // faction-settler
  icon: '#4682B4',        // faction-settler
  shadow: 'standard',
}
```

### Animation Timings

- **Entrance**: 300ms slide-in from right (50ms delay)
- **Exit**: 300ms slide-out to right + scale
- **Default Duration**: 5000ms (5 seconds)
- **Position**: Top-right corner

## Do's and Don'ts

### ✅ DO

- Keep titles short (1-4 words)
- Keep messages concise (1-2 sentences)
- Use appropriate variant for context
- Use action buttons for clear next steps
- Consider users need time to read (5+ seconds for errors)

### ❌ DON'T

- Don't spam multiple toasts rapidly
- Don't use for critical decisions (use Modal)
- Don't use for complex information (use pages)
- Don't make titles too long
- Don't add multiple action buttons (only one)

## Real-World Examples

### Gold Transaction

```typescript
const handlePurchase = async () => {
  if (gold < item.price) {
    toast.warning('Not Enough Gold', `You need ${item.price} gold`);
    return;
  }

  try {
    await api.purchase(item.id);
    toast.success('Purchase Complete!', `You bought ${item.name}`);
  } catch (error) {
    toast.error('Purchase Failed', error.message);
  }
};
```

### Energy Check

```typescript
const handleAction = () => {
  if (energy < action.cost) {
    toast.error('Not Enough Energy', `Need ${action.cost} energy`);
    return;
  }

  // Proceed with action
  performAction();
};
```

### Achievement Unlock

```typescript
const handleAchievement = (achievement) => {
  toast.addToast({
    type: 'success',
    title: 'Achievement Unlocked!',
    message: achievement.name,
    icon: '🏆',
    duration: 8000,
    action: {
      label: 'View All',
      onClick: () => navigate('/game/achievements'),
    },
  });
};
```

### Level Up

```typescript
const handleLevelUp = (newLevel) => {
  toast.success(
    `Level ${newLevel} Reached!`,
    'You unlocked new skills and locations'
  );
};
```

### Friend Request

```typescript
const handleFriendRequest = (friend) => {
  toast.addToast({
    type: 'info',
    title: 'Friend Request',
    message: `${friend.name} wants to be your friend`,
    action: {
      label: 'View Request',
      onClick: () => navigate('/game/friends'),
    },
  });
};
```

### Network Error

```typescript
const handleError = (error) => {
  if (error.code === 'NETWORK_ERROR') {
    toast.addToast({
      type: 'error',
      title: 'Connection Lost',
      message: 'Check your internet connection',
      duration: 0, // Persistent until user dismisses
    });
  }
};
```

## Troubleshooting

### Toast not appearing?
1. Check `<ToastContainer />` is in App.tsx
2. Verify z-index isn't being overridden
3. Check console for errors

### Animation not smooth?
1. Ensure Tailwind CSS is loaded
2. Check for conflicting CSS
3. Verify GPU acceleration is enabled

### Toast cut off on mobile?
1. Check viewport width
2. Adjust max-w-sm if needed
3. Ensure no overflow: hidden on parents

## Integration Checklist

- [x] ToastContainer in App.tsx
- [x] useToastStore in client/src/store/
- [x] Toast.tsx in client/src/components/ui/
- [x] ToastContainer exported from index.ts
- [x] Tailwind colors configured
- [x] Western fonts loaded

## Files to Know

| File | Purpose |
|------|---------|
| `store/useToastStore.ts` | State management |
| `components/ui/Toast.tsx` | UI component |
| `components/ui/Toast.examples.tsx` | Interactive demo |
| `components/ui/Toast.README.md` | Full documentation |
| `App.tsx` | Container rendered here |

## Need Help?

1. **Examples**: See `Toast.examples.tsx`
2. **Full Docs**: See `Toast.README.md`
3. **Architecture**: See `TOAST_ARCHITECTURE.md` in client/
4. **Test It**: Navigate to `/toast-demo` route

## Version

Current Version: **1.0.0**

Last Updated: 2025-11-25

---

*For complete documentation, see `Toast.README.md`*
