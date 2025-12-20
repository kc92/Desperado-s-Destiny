/**
 * Sound Effect Usage Examples
 *
 * This file demonstrates how to integrate sound effects into any component.
 * Copy these patterns into your own components.
 */

import React from 'react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { logger } from '@/services/logger.service';

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

export const BasicSoundExample: React.FC = () => {
  const { playSound } = useSoundEffects();

  const handleClick = () => {
    // Play a sound effect
    playSound('button_click');

    // Do other stuff
    logger.info('Button clicked!', { context: 'BasicSoundExample' });
  };

  return (
    <button onClick={handleClick}>
      Click Me (plays sound)
    </button>
  );
};

// ============================================================================
// Example 2: Multiple Sounds with Delays
// ============================================================================

export const MultiSoundExample: React.FC = () => {
  const { playSound } = useSoundEffects();

  const handlePurchase = () => {
    // Play success sound immediately
    playSound('success');

    // Play gold sound after a short delay
    setTimeout(() => playSound('gold_spent'), 300);

    // Play item pickup sound after another delay
    setTimeout(() => playSound('item_pickup'), 600);
  };

  return (
    <button onClick={handlePurchase}>
      Buy Item (plays 3 sounds)
    </button>
  );
};

// ============================================================================
// Example 3: Conditional Sounds (Success vs Failure)
// ============================================================================

export const ConditionalSoundExample: React.FC = () => {
  const { playSound } = useSoundEffects();

  const attemptAction = async () => {
    try {
      const success = Math.random() > 0.5; // Simulate 50% success rate

      if (success) {
        playSound('success');
        playSound('gold_gained'); // Bonus sound
      } else {
        playSound('failure');
      }

    } catch (error) {
      playSound('failure');
    }
  };

  return (
    <button onClick={attemptAction}>
      Attempt Action (random success/failure)
    </button>
  );
};

// ============================================================================
// Example 4: Combat Sounds
// ============================================================================

export const CombatSoundExample: React.FC = () => {
  const { playSound } = useSoundEffects();

  const attack = () => {
    const damage = Math.floor(Math.random() * 100);

    if (damage === 0) {
      playSound('combat_miss');
    } else if (damage >= 75) {
      playSound('combat_critical');
    } else {
      playSound('combat_hit');
    }
  };

  return (
    <button onClick={attack}>
      Attack Enemy
    </button>
  );
};

// ============================================================================
// Example 5: UI Feedback Sounds
// ============================================================================

export const UIFeedbackExample: React.FC = () => {
  const { playSound } = useSoundEffects();

  return (
    <div>
      <button
        onClick={() => playSound('menu_open')}
        className="btn"
      >
        Open Menu
      </button>

      <button
        onClick={() => playSound('menu_close')}
        className="btn"
      >
        Close Menu
      </button>

      <button
        onClick={() => playSound('ui_click')}
        className="btn"
      >
        Generic Click
      </button>
    </div>
  );
};

// ============================================================================
// Example 6: Notification Sounds
// ============================================================================

export const NotificationSoundExample: React.FC = () => {
  const { playSound } = useSoundEffects();

  const sendMessage = () => {
    playSound('message');
    logger.info('Message sent!', { context: 'NotificationSoundExample' });
  };

  const sendWhisper = () => {
    playSound('whisper');
    logger.info('Private message sent!', { context: 'NotificationSoundExample' });
  };

  const mention = () => {
    playSound('mention');
    logger.info('User mentioned!', { context: 'NotificationSoundExample' });
  };

  return (
    <div>
      <button onClick={sendMessage}>Send Message</button>
      <button onClick={sendWhisper}>Send Whisper</button>
      <button onClick={mention}>Mention User</button>
    </div>
  );
};

// ============================================================================
// Example 7: Card Game Sounds
// ============================================================================

export const CardGameSoundExample: React.FC = () => {
  const { playSound } = useSoundEffects();

  const drawCard = () => {
    playSound('flip');
  };

  const selectCard = () => {
    playSound('select');
  };

  const discardCard = () => {
    playSound('discard');
  };

  const revealHand = (handStrength: 'weak' | 'good' | 'strong' | 'epic') => {
    const soundMap = {
      weak: 'reveal_weak',
      good: 'reveal_good',
      strong: 'reveal_strong',
      epic: 'reveal_epic',
    } as const;

    playSound(soundMap[handStrength]);
  };

  return (
    <div>
      <button onClick={drawCard}>Draw Card</button>
      <button onClick={selectCard}>Select Card</button>
      <button onClick={discardCard}>Discard Card</button>
      <button onClick={() => revealHand('epic')}>Reveal Epic Hand</button>
    </div>
  );
};

// ============================================================================
// Example 8: Achievement/Quest Sounds
// ============================================================================

export const AchievementSoundExample: React.FC = () => {
  const { playSound } = useSoundEffects();

  const completeQuest = () => {
    playSound('quest_complete');
    // Optionally play additional celebration sounds
    setTimeout(() => playSound('gold_gained'), 500);
  };

  const unlockAchievement = () => {
    playSound('achievement');
  };

  return (
    <div>
      <button onClick={completeQuest}>Complete Quest</button>
      <button onClick={unlockAchievement}>Unlock Achievement</button>
    </div>
  );
};

// ============================================================================
// Example 9: Custom Volume Override
// ============================================================================

export const CustomVolumeExample: React.FC = () => {
  const { playSound } = useSoundEffects();

  return (
    <div>
      <button onClick={() => playSound('button_click', 0.2)}>
        Quiet Click (20% volume)
      </button>
      <button onClick={() => playSound('button_click', 0.5)}>
        Medium Click (50% volume)
      </button>
      <button onClick={() => playSound('button_click', 1.0)}>
        Loud Click (100% volume)
      </button>
    </div>
  );
};

// ============================================================================
// Example 10: Preloading Sounds (Performance)
// ============================================================================

export const PreloadSoundsExample: React.FC = () => {
  const { playSound, preloadSounds } = useSoundEffects();

  // Preload sounds when component mounts
  React.useEffect(() => {
    // Preload the sounds this component will use
    preloadSounds([
      'button_click',
      'success',
      'failure',
      'gold_gained',
    ]);
  }, [preloadSounds]);

  return (
    <div>
      <button onClick={() => playSound('button_click')}>
        Click (preloaded - instant playback)
      </button>
    </div>
  );
};

// ============================================================================
// Example 11: Using with State Changes
// ============================================================================

export const StateChangeSoundExample: React.FC = () => {
  const { playSound } = useSoundEffects();
  const [gold, setGold] = React.useState(100);

  const previousGold = React.useRef(gold);

  // Play sound when gold changes
  React.useEffect(() => {
    if (gold > previousGold.current) {
      playSound('gold_gained');
    } else if (gold < previousGold.current) {
      playSound('gold_spent');
    }
    previousGold.current = gold;
  }, [gold, playSound]);

  return (
    <div>
      <p>Gold: {gold}</p>
      <button onClick={() => setGold(g => g + 10)}>Gain Gold</button>
      <button onClick={() => setGold(g => g - 10)}>Spend Gold</button>
    </div>
  );
};

// ============================================================================
// Example 12: Integration with Forms
// ============================================================================

export const FormSoundExample: React.FC = () => {
  const { playSound } = useSoundEffects();
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.includes('@')) {
      playSound('success');
      logger.info('Form submitted!', { context: 'FormSoundExample' });
    } else {
      playSound('failure');
      logger.info('Invalid email!', { context: 'FormSoundExample' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={() => playSound('ui_click')}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

// ============================================================================
// Example 13: Custom Events (Advanced)
// ============================================================================

export const CustomEventSoundExample: React.FC = () => {
  const { playSound } = useSoundEffects();

  React.useEffect(() => {
    // Listen for custom events
    const handleLevelUp = (event: CustomEvent) => {
      playSound('level_up');
      logger.info('Level up!', { context: 'CustomEventSoundExample', detail: event.detail });
    };

    window.addEventListener('character-level-up', handleLevelUp as EventListener);

    return () => {
      window.removeEventListener('character-level-up', handleLevelUp as EventListener);
    };
  }, [playSound]);

  // Trigger the custom event
  const triggerLevelUp = () => {
    window.dispatchEvent(new CustomEvent('character-level-up', {
      detail: { from: 5, to: 6 }
    }));
  };

  return (
    <button onClick={triggerLevelUp}>
      Trigger Level Up Event
    </button>
  );
};

// ============================================================================
// Example 14: Complete Combat Integration
// ============================================================================

export const CompleteCombatExample: React.FC = () => {
  const { playSound } = useSoundEffects();
  const [inCombat, setInCombat] = React.useState(false);

  const startCombat = () => {
    playSound('combat_start');
    setInCombat(true);
  };

  const attack = () => {
    const hit = Math.random() > 0.3;
    const critical = Math.random() > 0.9;

    if (!hit) {
      playSound('combat_miss');
    } else if (critical) {
      playSound('combat_critical');
    } else {
      playSound('combat_hit');
    }
  };

  const takeDamage = () => {
    playSound('damage_taken');
  };

  const flee = () => {
    playSound('combat_miss'); // Escape sound
    setInCombat(false);
  };

  const win = () => {
    playSound('combat_victory');
    setTimeout(() => playSound('gold_gained'), 500);
    setTimeout(() => playSound('xp_gained'), 1000);
    setInCombat(false);
  };

  const lose = () => {
    playSound('combat_defeat');
    setInCombat(false);
  };

  if (!inCombat) {
    return <button onClick={startCombat}>Start Combat</button>;
  }

  return (
    <div>
      <p>⚔️ In Combat!</p>
      <button onClick={attack}>Attack</button>
      <button onClick={takeDamage}>Take Damage</button>
      <button onClick={flee}>Flee</button>
      <button onClick={win}>Win Combat</button>
      <button onClick={lose}>Lose Combat</button>
    </div>
  );
};

// ============================================================================
// All Examples Export
// ============================================================================

export default {
  BasicSoundExample,
  MultiSoundExample,
  ConditionalSoundExample,
  CombatSoundExample,
  UIFeedbackExample,
  NotificationSoundExample,
  CardGameSoundExample,
  AchievementSoundExample,
  CustomVolumeExample,
  PreloadSoundsExample,
  StateChangeSoundExample,
  FormSoundExample,
  CustomEventSoundExample,
  CompleteCombatExample,
};
