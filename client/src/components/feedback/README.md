# Feedback Animations

Visual feedback animations for key game events in Desperados Destiny.

## Components

### SuccessAnimation
Green burst with checkmark for successful actions.

```tsx
import { SuccessAnimation } from '@/components/feedback';

<SuccessAnimation
  show={true}
  message="Mission accomplished!"
  onComplete={() => console.log('Animation done')}
/>
```

### FailureAnimation
Red shake with X mark for failed actions.

```tsx
import { FailureAnimation } from '@/components/feedback';

<FailureAnimation
  show={true}
  message="Mission failed!"
  onComplete={() => console.log('Animation done')}
/>
```

### LevelUpCelebration
Golden particles with fanfare for level up events.

```tsx
import { LevelUpCelebration } from '@/components/feedback';

<LevelUpCelebration
  show={true}
  newLevel={25}
  onComplete={() => console.log('Celebration dismissed')}
/>
```

### GoldAnimation
Floating +/- gold text for gold gain/loss.

```tsx
import { GoldAnimation } from '@/components/feedback';

<GoldAnimation
  amount={100}
  position={{ x: 500, y: 300 }}
  onComplete={() => console.log('Gold animation done')}
/>
```

### XPGain
Small XP popup near action location.

```tsx
import { XPGain } from '@/components/feedback';

<XPGain
  amount={25}
  position={{ x: 600, y: 200 }}
  onComplete={() => console.log('XP animation done')}
/>
```

## Usage

### Method 1: Using FeedbackContainer (Recommended)

The easiest way to use feedback animations is with the `FeedbackContainer` component and `useFeedbackAnimations` hook:

```tsx
import { FeedbackContainer, useFeedbackAnimations } from '@/components/feedback';

function MyGameComponent() {
  const feedback = useFeedbackAnimations();

  const handleAction = async () => {
    try {
      const result = await performAction();

      if (result.success) {
        feedback.showSuccess('Action successful!');
        feedback.addXPGain(result.xp);
        feedback.addGoldAnimation(result.gold, { x: 500, y: 300 });

        if (result.levelUp) {
          feedback.showLevelUp({ newLevel: result.newLevel });
        }
      } else {
        feedback.showFailure('Action failed!');
      }
    } catch (error) {
      feedback.showFailure('Something went wrong!');
    }
  };

  return (
    <div>
      <button onClick={handleAction}>Perform Action</button>
      <FeedbackContainer feedbackState={feedback} />
    </div>
  );
}
```

### Method 2: Individual Components

You can also use individual components directly:

```tsx
import { SuccessAnimation, GoldAnimation } from '@/components/feedback';

function MyComponent() {
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <>
      <button onClick={() => setShowSuccess(true)}>Success!</button>

      <SuccessAnimation
        show={showSuccess}
        onComplete={() => setShowSuccess(false)}
      />
    </>
  );
}
```

## Hook API: useFeedbackAnimations

### Methods

- `showSuccess(message?: string)` - Show success animation
- `showFailure(message?: string)` - Show failure animation
- `showLevelUp({ newLevel: number })` - Show level up celebration
- `addGoldAnimation(amount: number, position: { x, y })` - Add gold animation
- `addXPGain(amount: number, position?: { x, y })` - Add XP gain animation
- `clearSuccess()` - Clear success animation
- `clearFailure()` - Clear failure animation
- `clearLevelUp()` - Clear level up celebration
- `removeGoldAnimation(id: string)` - Remove gold animation
- `removeXPGain(id: string)` - Remove XP gain
- `clearAll()` - Clear all animations

### State

The hook returns a `state` object with current animation status:

```tsx
const feedback = useFeedbackAnimations();

console.log(feedback.state.success.show); // boolean
console.log(feedback.state.goldAnimations); // array
```

## Animation Preferences

All animations respect the `AnimationPreferencesContext`:

- **Full**: All animations with particles and effects
- **Reduced**: Simplified animations, faster durations
- **None**: Instant state changes, no animations

The user can control this in Settings.

## Examples

### Combat Success
```tsx
const handleCombatWin = (result) => {
  feedback.showSuccess('Victory!');
  feedback.addGoldAnimation(result.goldReward, getCenterPosition());
  feedback.addXPGain(result.xpReward);
};
```

### Crime Failure
```tsx
const handleCrimeFail = () => {
  feedback.showFailure('Caught by the law!');
};
```

### Level Up
```tsx
const handleLevelUp = (character) => {
  feedback.showLevelUp({ newLevel: character.level });
};
```

### Gold Transaction
```tsx
const handleShopPurchase = (item) => {
  const buttonPos = getButtonPosition();
  feedback.addGoldAnimation(-item.cost, buttonPos);
};
```

### Multiple XP Gains
```tsx
const handleMultipleActions = (actions) => {
  actions.forEach((action, index) => {
    // Stack XP gains vertically
    feedback.addXPGain(action.xp, {
      x: window.innerWidth / 2,
      y: 100 + (index * 60)
    });
  });
};
```

## Styling

All animations use Tailwind CSS classes and respect the Western theme:

- **Gold colors**: `gold-light`, `gold-dark`, `gold-medium`
- **Blood/danger**: `blood-red`, `blood-crimson`
- **Success**: Green tones
- **Fonts**: `font-western` for headings
- **Shadows**: Gold glows, dark shadows

## Accessibility

All animations include:

- `role="status"` or `role="dialog"` attributes
- `aria-live` regions for screen readers
- `aria-label` descriptions
- Keyboard navigation (for modal-style celebrations)
- Respect for reduced motion preferences

## Performance

- Animations use CSS transforms and opacity (GPU accelerated)
- Individual components render only when needed
- Automatic cleanup of completed animations
- Respects animation preferences to reduce load
