# Sound System Quick Reference

One-page cheat sheet for the Desperados Destiny sound system.

## 🎵 Basic Usage

```typescript
import { useSoundEffects } from '@/hooks/useSoundEffects';

const MyComponent = () => {
  const { playSound } = useSoundEffects();

  return (
    <button onClick={() => playSound('button_click')}>
      Click Me
    </button>
  );
};
```

## 🔊 Available Sounds

### Most Common
```typescript
playSound('button_click');    // UI clicks
playSound('gold_gained');     // Earn gold
playSound('gold_spent');      // Spend gold
playSound('success');         // Success
playSound('failure');         // Failure
playSound('notification');    // Alert
playSound('level_up');        // Level up
```

### Combat
```typescript
playSound('combat_hit');      // Hit enemy
playSound('combat_miss');     // Miss attack
playSound('combat_critical'); // Critical hit
playSound('damage_taken');    // Take damage
playSound('combat_victory');  // Win fight
playSound('combat_defeat');   // Lose fight
```

### Cards
```typescript
playSound('flip');            // Card flip
playSound('reveal_weak');     // Weak hand
playSound('reveal_good');     // Good hand
playSound('reveal_strong');   // Strong hand
playSound('reveal_epic');     // Epic hand
```

### Notifications
```typescript
playSound('message');         // Chat message
playSound('whisper');         // Private msg
playSound('mention');         // Mentioned
```

## ⚙️ Settings

```typescript
import { useSettingsStore } from '@/store/useSettingsStore';

const {
  soundEnabled,      // boolean
  soundVolume,       // 0-1
  toggleSound,       // function
  setSoundVolume,    // function
} = useSettingsStore();

// Toggle sounds
toggleSound();

// Set volume to 50%
setSoundVolume(0.5);
```

## 🎯 Common Patterns

### Success/Failure
```typescript
if (success) {
  playSound('success');
  playSound('gold_gained');
} else {
  playSound('failure');
}
```

### Delayed Sounds
```typescript
playSound('success');
setTimeout(() => playSound('gold_gained'), 300);
setTimeout(() => playSound('xp_gained'), 600);
```

### Custom Volume
```typescript
playSound('button_click', 0.5); // 50% volume
```

### Preload
```typescript
const { preloadSounds } = useSoundEffects();

useEffect(() => {
  preloadSounds(['button_click', 'gold_gained']);
}, []);
```

## 🚀 Integration Steps

1. **Add to App.tsx:**
```typescript
import { SoundEffectManager } from '@/components/game/SoundEffectManager';
<SoundEffectManager />
```

2. **Add to Settings:**
```typescript
import { SoundSettings } from '@/components/settings/SoundSettings';
<SoundSettings />
```

3. **Add MP3 files to:** `client/public/sounds/`

## 📁 All Sound Files (33)

```
achievement.mp3, card-deal.mp3, card-discard.mp3, card-flip.mp3,
card-select.mp3, click.mp3, coins.mp3, combat-start.mp3,
critical.mp3, damage.mp3, defeat.mp3, energy.mp3,
failure.mp3, hit.mp3, item.mp3, level-up.mp3,
menu-close.mp3, menu-open.mp3, mention.mp3, message.mp3,
miss.mp3, notification.mp3, quest-complete.mp3, reveal-epic.mp3,
reveal-good.mp3, reveal-strong.mp3, reveal-weak.mp3, success.mp3,
suit-bonus.mp3, ui-click.mp3, ui-hover.mp3, victory.mp3,
whisper.mp3, xp.mp3
```

## 🔍 Troubleshooting

**No sound?**
- Check `soundEnabled` is `true`
- Check `soundVolume` > 0
- Check MP3 files exist
- Check browser console

**Some sounds missing?**
- Verify specific MP3 files exist
- Check exact filename (case-sensitive)

## 📚 Full Docs

- Implementation: `client/SOUND_SYSTEM_IMPLEMENTATION.md`
- Integration: `SOUND_INTEGRATION_CHECKLIST.md`
- Assets Guide: `client/public/sounds/SOUND_ASSETS_GUIDE.md`
- Examples: `client/src/components/examples/SoundEffectExamples.tsx`

---

**Quick Start:** Import hook → Use `playSound()` → Add MP3 files → Done!
