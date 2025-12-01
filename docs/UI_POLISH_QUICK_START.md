# UI Polish - Quick Start Guide

**For Developers:** How to use the new Western-themed UI system

---

## 🚀 Getting Started

All new UI components are automatically available - just import and use!

```tsx
// Import individual components
import { WesternButton, WesternPanel, WesternLoadingScreen } from '@/components/ui';
import { CombatFeedback } from '@/components/combat';
import { useMobile } from '@/hooks/useMobile';

// Or use CSS classes directly
<div className="texture-wood glass-western animate-fade-in" />
```

---

## 📦 Quick Reference

### **1. Western Buttons**

Replace old buttons with themed versions:

```tsx
// Old
<button onClick={handleAction}>Attack</button>

// New
<WesternButton variant="primary" onClick={handleAction}>
  Attack
</WesternButton>

// With icon
<WesternButton
  variant="danger"
  icon={<span>🔫</span>}
  onClick={handleDuel}
>
  Draw!
</WesternButton>
```

**Variants:** `primary` (gold), `secondary` (wood), `danger` (blood), `ghost` (transparent)

---

### **2. Western Panels**

Wrap content in themed containers:

```tsx
<WesternPanel variant="wood" padding="lg">
  <h2>Saloon</h2>
  <p>Welcome to the Rusty Nail...</p>
</WesternPanel>
```

**Variants:** `wood`, `leather`, `parchment`, `glass`, `glass-western`

---

### **3. Loading Screens**

Show loading with Western flair:

```tsx
const [isLoading, setIsLoading] = useState(true);

<WesternLoadingScreen
  message="Riding into town..."
  isVisible={isLoading}
/>

// With progress
<WesternLoadingScreen
  message="Loading duel..."
  progress={loadProgress}
  isVisible={isLoading}
/>
```

---

### **4. Combat Feedback**

Add visual feedback to combat:

```tsx
import { CombatFeedback, CombatFeedbackHandle } from '@/components/combat';

const MyCombutPage = () => {
  const feedbackRef = useRef<CombatFeedbackHandle>(null);
  const enemyRef = useRef<HTMLDivElement>(null);

  const handleAttack = () => {
    const damage = rollDamage();
    const isCrit = Math.random() > 0.9;

    // Show damage number
    feedbackRef.current?.showDamage(damage, isCrit);

    // Trigger effects for big hits
    if (damage > 20 || isCrit) {
      feedbackRef.current?.shake();
    }
  };

  return (
    <>
      <div ref={enemyRef} className="enemy-sprite">
        {/* Enemy sprite */}
      </div>

      <button onClick={handleAttack}>Attack</button>

      <CombatFeedback
        ref={feedbackRef}
        targetRef={enemyRef}
      />
    </>
  );
};
```

**Methods:**
- `showDamage(amount, isCritical)` - Show damage number
- `showMiss()` - Show "MISS!" text
- `showHeal(amount)` - Show healing number
- `showFlash(type)` - Screen flash ('damage', 'critical', 'heal', 'death')
- `shake()` - Shake the screen

---

### **5. Mobile Detection**

Optimize for mobile users:

```tsx
import { useMobile } from '@/hooks/useMobile';

const MyComponent = () => {
  const { isMobile, isTouch, isLandscape } = useMobile();

  return (
    <div className={isMobile ? 'flex-col' : 'flex-row'}>
      {isMobile ? <MobileNav /> : <DesktopNav />}
      {isTouch && <p>Tap to interact</p>}
    </div>
  );
};
```

---

## 🎨 Using CSS Classes

### **Textures**

```tsx
<div className="texture-wood">Wood grain background</div>
<div className="texture-leather">Leather pattern</div>
<div className="texture-dust">Dust overlay</div>
```

### **Effects**

```tsx
<div className="glass">Glassmorphism</div>
<div className="glass-western">Western-tinted glass</div>
<div className="glow-gold">Gold aura</div>
<div className="glow-blood">Blood-red glow</div>
```

### **Animations**

```tsx
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-in-bottom">Slides up</div>
<div className="animate-shake">Shakes</div>
```

### **Mobile**

```tsx
<button className="touch-target">44x44px minimum</button>
<div className="hidden-mobile">Desktop only</div>
<div className="visible-mobile">Mobile only</div>
```

---

## 🎨 Using CSS Variables

All design tokens are available as CSS variables:

```tsx
<div style={{
  background: 'var(--color-wood)',
  color: 'var(--color-gold)',
  padding: 'var(--space-lg)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-western)'
}}>
  Custom styled element
</div>
```

**Common Variables:**
- Colors: `--color-gold`, `--color-wood`, `--color-leather`, `--color-blood`
- Spacing: `--space-sm`, `--space-md`, `--space-lg`
- Typography: `--font-size-lg`, `--font-family-western`
- Effects: `--shadow-gold`, `--shadow-western`

Full list in `docs/UI_POLISH_IMPLEMENTATION_COMPLETE.md`

---

## 💡 Common Patterns

### **Action Card**

```tsx
<WesternPanel variant="wood" padding="md" className="hover:glow-gold transition-smooth">
  <h3>Rob the Bank</h3>
  <p>High risk, high reward...</p>
  <WesternButton variant="danger" fullWidth>
    Attempt Heist
  </WesternButton>
</WesternPanel>
```

### **Mobile-Optimized Form**

```tsx
const { isMobile } = useMobile();

<form className={isMobile ? 'mobile-stack' : 'flex gap-4'}>
  <input className="mobile-input" placeholder="Username" />
  <WesternButton
    variant="primary"
    fullWidth={isMobile}
  >
    Submit
  </WesternButton>
</form>
```

### **Loading State**

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await performAction();
  } finally {
    setIsLoading(false);
  }
};

return (
  <>
    <WesternButton
      onClick={handleAction}
      loading={isLoading}
      disabled={isLoading}
    >
      Perform Action
    </WesternButton>

    <WesternLoadingScreen
      isVisible={isLoading}
      message="Processing..."
    />
  </>
);
```

### **Combat Sequence**

```tsx
const feedbackRef = useRef<CombatFeedbackHandle>(null);

const executeCombatTurn = async () => {
  // Player attacks
  const playerDamage = rollDice();
  feedbackRef.current?.showDamage(playerDamage, playerDamage > 20);
  await delay(1000);

  // Enemy attacks
  const enemyDamage = rollDice();
  feedbackRef.current?.showDamage(enemyDamage, false);
  feedbackRef.current?.showFlash('damage');
  await delay(1000);

  // Check for victory
  if (enemyDefeated) {
    feedbackRef.current?.showFlash('critical');
  }
};
```

---

## 🎯 Best Practices

### **✅ DO**

- Use `WesternButton` for all action buttons
- Wrap content in `WesternPanel` for thematic consistency
- Check `useMobile()` for responsive layouts
- Use CSS variables for consistency
- Apply textures to backgrounds, not text containers
- Respect `loading` and `disabled` states

### **❌ DON'T**

- Don't mix old buttons with WesternButtons in the same view
- Don't override CSS variables inline (use theme)
- Don't nest textures (performance impact)
- Don't ignore mobile optimization
- Don't disable animations globally (use reduced motion)
- Don't create custom loading spinners (use SheriffStarSpinner)

---

## 🔧 Troubleshooting

### **Textures not showing?**

Make sure CSS imports are loaded:

```tsx
// In main.tsx or App.tsx
import './styles/index.css'; // Should import all styles
```

### **Animations not working?**

Check if user has reduced motion enabled:

```tsx
import { useReducedMotion } from '@/hooks/useMobile';

const prefersReducedMotion = useReducedMotion();

if (prefersReducedMotion) {
  // Skip or simplify animations
}
```

### **Mobile styles not applying?**

Verify viewport meta tag in `index.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### **Touch targets too small?**

Use `.touch-target` class or `WesternButton`:

```tsx
<button className="touch-target">Guaranteed 44x44px</button>
<WesternButton>Automatically touch-optimized</WesternButton>
```

---

## 📚 Further Reading

- **Full Documentation:** `docs/UI_POLISH_IMPLEMENTATION_COMPLETE.md`
- **Design Mockups:** `mockups/UI_MOCKUPS_GUIDE.md`
- **Animation Reference:** `client/src/styles/animations.css`
- **Theme Reference:** `client/src/styles/theme.css`

---

## 🎉 You're Ready!

Start integrating Western-themed UI into your pages:

1. Replace buttons with `WesternButton`
2. Wrap sections in `WesternPanel`
3. Add combat feedback to Combat page
4. Use loading screens for async actions
5. Optimize for mobile with `useMobile()`

Happy coding! 🤠
