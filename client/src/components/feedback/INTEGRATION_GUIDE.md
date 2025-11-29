# Feedback Animations Integration Guide

## Quick Start

### 1. Import the Components

```tsx
import { FeedbackContainer, useFeedbackAnimations } from '@/components/feedback';
```

### 2. Add to Your Layout

The easiest way is to add the `FeedbackContainer` to your main game layout:

**Option A: In GameLayout (Recommended)**

```tsx
// client/src/components/layout/GameLayout.tsx
import { FeedbackContainer } from '@/components/feedback';

export const GameLayout = () => {
  return (
    <div>
      {/* Your existing layout */}

      {/* Add at the end, before closing div */}
      <FeedbackContainer />
    </div>
  );
};
```

**Option B: In Individual Pages**

```tsx
// In any page component
import { FeedbackContainer, useFeedbackAnimations } from '@/components/feedback';

export const MyPage = () => {
  const feedback = useFeedbackAnimations();

  return (
    <div>
      {/* Your page content */}

      <FeedbackContainer feedbackState={feedback} />
    </div>
  );
};
```

### 3. Use the Hook

```tsx
const feedback = useFeedbackAnimations();

// Trigger animations
feedback.showSuccess('Mission complete!');
feedback.addGoldAnimation(100, { x: 500, y: 300 });
feedback.addXPGain(50);
feedback.showLevelUp({ newLevel: 15 });
```

## Integration Examples by Feature

### Actions Page

```tsx
// client/src/pages/Actions.tsx
import { useFeedbackAnimations } from '@/components/feedback';

export const Actions = () => {
  const feedback = useFeedbackAnimations();

  const handleActionComplete = async (actionId: string) => {
    try {
      const result = await api.completeAction(actionId);

      if (result.success) {
        // Show success animation
        feedback.showSuccess(result.message || 'Action completed!');

        // Show rewards
        if (result.gold) {
          const buttonPos = getActionButtonPosition(actionId);
          feedback.addGoldAnimation(result.gold, buttonPos);
        }

        if (result.xp) {
          feedback.addXPGain(result.xp);
        }

        // Check for level up
        if (result.levelUp) {
          setTimeout(() => {
            feedback.showLevelUp({ newLevel: result.newLevel });
          }, 1000);
        }
      } else {
        feedback.showFailure(result.message || 'Action failed!');
      }
    } catch (error) {
      feedback.showFailure('Something went wrong!');
    }
  };

  return (
    <div>
      {/* Your actions UI */}
    </div>
  );
};
```

### Combat Page

```tsx
// client/src/pages/Combat.tsx
import { useFeedbackAnimations } from '@/components/feedback';

export const Combat = () => {
  const feedback = useFeedbackAnimations();

  const handleCombatEnd = (result: CombatResult) => {
    if (result.victory) {
      feedback.showSuccess('Victory!');

      // Show rewards after success animation
      setTimeout(() => {
        feedback.addGoldAnimation(result.goldReward, getCenterPosition());
        feedback.addXPGain(result.xpReward);
      }, 800);
    } else {
      feedback.showFailure('Defeated!');

      // Show losses
      if (result.goldLost > 0) {
        setTimeout(() => {
          feedback.addGoldAnimation(-result.goldLost, getCenterPosition());
        }, 800);
      }
    }
  };

  return (
    <div>
      {/* Your combat UI */}
    </div>
  );
};
```

### Crimes Page

```tsx
// client/src/pages/Crimes.tsx
import { useFeedbackAnimations } from '@/components/feedback';

export const Crimes = () => {
  const feedback = useFeedbackAnimations();

  const handleCrimeAttempt = async (crimeId: string) => {
    try {
      const result = await api.attemptCrime(crimeId);

      if (result.success) {
        feedback.showSuccess('Crime successful!');

        setTimeout(() => {
          feedback.addGoldAnimation(result.loot, getCrimeCardPosition(crimeId));
          feedback.addXPGain(result.xp);
        }, 800);

        if (result.levelUp) {
          setTimeout(() => {
            feedback.showLevelUp({ newLevel: result.newLevel });
          }, 1500);
        }
      } else {
        feedback.showFailure('Caught by the law!');

        if (result.fine > 0) {
          setTimeout(() => {
            feedback.addGoldAnimation(-result.fine, getCrimeCardPosition(crimeId));
          }, 800);
        }
      }
    } catch (error) {
      feedback.showFailure('Something went wrong!');
    }
  };

  return (
    <div>
      {/* Your crimes UI */}
    </div>
  );
};
```

### Shop Page

```tsx
// client/src/pages/Shop.tsx
import { useFeedbackAnimations } from '@/components/feedback';

export const Shop = () => {
  const feedback = useFeedbackAnimations();

  const handlePurchase = async (itemId: string, cost: number) => {
    try {
      const result = await api.purchaseItem(itemId);

      if (result.success) {
        feedback.showSuccess('Purchase successful!');

        // Show gold deduction from button position
        const buttonPos = getItemButtonPosition(itemId);
        feedback.addGoldAnimation(-cost, buttonPos);
      } else {
        feedback.showFailure(result.message || 'Purchase failed!');
      }
    } catch (error) {
      feedback.showFailure('Purchase failed!');
    }
  };

  const handleSale = async (itemId: string, value: number) => {
    try {
      const result = await api.sellItem(itemId);

      if (result.success) {
        feedback.showSuccess('Item sold!');

        // Show gold gain
        const buttonPos = getItemButtonPosition(itemId);
        feedback.addGoldAnimation(value, buttonPos);
      }
    } catch (error) {
      feedback.showFailure('Sale failed!');
    }
  };

  return (
    <div>
      {/* Your shop UI */}
    </div>
  );
};
```

### Skills Page

```tsx
// client/src/pages/Skills.tsx
import { useFeedbackAnimations } from '@/components/feedback';

export const Skills = () => {
  const feedback = useFeedbackAnimations();

  const handleSkillTrain = async (skillId: string) => {
    try {
      const result = await api.trainSkill(skillId);

      if (result.success) {
        feedback.showSuccess('Skill improved!');
        feedback.addXPGain(result.xp);

        if (result.levelUp) {
          setTimeout(() => {
            feedback.showLevelUp({ newLevel: result.newLevel });
          }, 1000);
        }
      }
    } catch (error) {
      feedback.showFailure('Training failed!');
    }
  };

  return (
    <div>
      {/* Your skills UI */}
    </div>
  );
};
```

## Helper Functions

### Get Element Position

```tsx
/**
 * Get center position of an element for animations
 */
const getElementPosition = (elementId: string): { x: number; y: number } => {
  const element = document.getElementById(elementId);
  if (!element) {
    return getCenterPosition(); // Fallback to center
  }

  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

/**
 * Get center of screen
 */
const getCenterPosition = (): { x: number; y: number } => {
  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
};

/**
 * Get button position from event
 */
const getButtonPositionFromEvent = (e: React.MouseEvent): { x: number; y: number } => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};
```

### Usage with Helper

```tsx
<button
  id={`action-${action.id}`}
  onClick={(e) => {
    handleAction(action.id);
    // Store position for later use
    const pos = getButtonPositionFromEvent(e);
    // Use pos when showing gold animation
  }}
>
  Perform Action
</button>
```

## Best Practices

### 1. Timing

Use setTimeout to stagger animations for better UX:

```tsx
// Show success first
feedback.showSuccess('Action complete!');

// Then show rewards
setTimeout(() => {
  feedback.addGoldAnimation(100, position);
  feedback.addXPGain(50);
}, 800);

// Level up last
if (levelUp) {
  setTimeout(() => {
    feedback.showLevelUp({ newLevel: 15 });
  }, 1500);
}
```

### 2. Positioning

Always use element positions for gold animations:

```tsx
// Good - gold comes from action button
const buttonPos = getElementPosition('action-button');
feedback.addGoldAnimation(100, buttonPos);

// Bad - random position
feedback.addGoldAnimation(100, { x: 500, y: 300 });
```

### 3. Error Handling

Always wrap in try-catch and show feedback:

```tsx
try {
  const result = await api.performAction();
  feedback.showSuccess('Success!');
} catch (error) {
  feedback.showFailure('Something went wrong!');
}
```

### 4. Cleanup

The hook handles cleanup automatically, but you can manually clear:

```tsx
// Clear specific animation
feedback.clearSuccess();

// Clear everything
feedback.clearAll();

// Usually not needed - animations auto-dismiss
```

### 5. Multiple Animations

You can show multiple of the same type:

```tsx
// Multiple XP gains stack vertically
feedback.addXPGain(25);
feedback.addXPGain(50);
feedback.addXPGain(75);

// Multiple gold animations at different positions
feedback.addGoldAnimation(100, pos1);
feedback.addGoldAnimation(200, pos2);
```

## Testing

Test your integration using the demo page:

1. Create a route for the demo: `/feedback-demo`
2. Import and render `FeedbackAnimationsDemo`
3. Click through all the examples
4. Verify animations work with your theme
5. Test with different animation preferences (Settings page)

## Troubleshooting

### Animations not showing

1. Check that `FeedbackContainer` is rendered
2. Verify `AnimationPreferencesProvider` wraps your app (already in App.tsx)
3. Check browser console for errors
4. Verify animation preference is not set to "none"

### Animations look wrong

1. Check Tailwind classes are compiling (run dev server)
2. Verify custom animations in tailwind.config.js
3. Check for CSS conflicts

### Position incorrect

1. Use helper functions for positioning
2. Consider scroll offset for fixed elements
3. Use getBoundingClientRect() for accurate positions

## Migration Guide

If you're already using toast notifications:

```tsx
// Old
toast.success('Action complete!');

// New - keep both!
toast.success('Action complete!'); // Still show toast
feedback.showSuccess('Action complete!'); // Add animation

// Or use just feedback for major events
feedback.showSuccess('Action complete!');
```

Feedback animations complement toasts:
- **Toasts**: Persistent notifications, messages
- **Feedback animations**: Visual celebration, immediate feedback
