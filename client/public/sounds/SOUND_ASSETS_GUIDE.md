# Desperados Destiny - Sound Assets Guide

This guide documents all sound effects needed for the Desperados Destiny game. The sound system is fully implemented and ready to use once audio files are added to this directory.

## 🎵 Sound System Features

- **Volume Control**: Global volume setting (0-1) via settings store
- **Enable/Disable**: Toggle sound effects on/off
- **Audio Caching**: Sounds are preloaded and cached for performance
- **Sound Overlap**: Multiple sounds can play simultaneously
- **Western Theme**: All sounds should match the Wild West aesthetic

## 📁 Required Sound Files

### 🎴 Destiny Deck Card Sounds

| File | Purpose | Duration | Western Theme Suggestion |
|------|---------|----------|--------------------------|
| `card-flip.mp3` | Card flipping/drawing | 0.3-0.5s | Quick snap sound, like a card being dealt |
| `card-deal.mp3` | Card being dealt | 0.2-0.4s | Softer card slide sound |
| `card-discard.mp3` | Card discarded | 0.3-0.5s | Light flick sound |
| `card-select.mp3` | Card selected/held | 0.2-0.3s | Subtle click or tap |
| `reveal-weak.mp3` | Weak hand revealed | 0.5-0.8s | Disappointed sigh or low note |
| `reveal-good.mp3` | Good hand revealed | 0.6-0.9s | Positive harmonica note |
| `reveal-strong.mp3` | Strong hand revealed | 0.7-1.0s | Triumphant guitar chord |
| `reveal-epic.mp3` | Epic hand revealed | 1.0-1.5s | Victory trumpet or full chord |

### 💰 Game Actions

| File | Purpose | Duration | Western Theme Suggestion |
|------|---------|----------|--------------------------|
| `success.mp3` | Action succeeded | 0.5-0.8s | Success chime or positive ding |
| `failure.mp3` | Action failed | 0.5-0.8s | Failure buzzer or negative note |
| `coins.mp3` | Gold gained/spent | 0.4-0.7s | **Coin clink/jingle sound** |
| `xp.mp3` | XP gained | 0.5-0.8s | Leveling up sound (bright ping) |
| `level-up.mp3` | Character leveled up | 1.0-2.0s | **Fanfare or special achievement sound** |
| `suit-bonus.mp3` | Suit bonus activated | 0.5-0.7s | Special power-up sound |

### ⚔️ Combat Sounds

| File | Purpose | Duration | Western Theme Suggestion |
|------|---------|----------|--------------------------|
| `hit.mp3` | Successful attack | 0.3-0.6s | **Punch impact or gunshot** |
| `miss.mp3` | Attack missed | 0.3-0.5s | Whoosh sound |
| `critical.mp3` | Critical hit | 0.5-0.8s | Heavy impact with emphasis |
| `combat-start.mp3` | Combat initiated | 0.7-1.0s | Showdown music sting or drum roll |
| `victory.mp3` | Combat won | 1.0-2.0s | **Victory fanfare** |
| `defeat.mp3` | Combat lost | 1.0-1.5s | Defeat sound or sad music sting |
| `damage.mp3` | Player takes damage | 0.4-0.6s | Hurt sound or grunt |

### 🔔 Notifications

| File | Purpose | Duration | Western Theme Suggestion |
|------|---------|----------|--------------------------|
| `notification.mp3` | General notification | 0.3-0.5s | **Subtle bell or ding** |
| `message.mp3` | Chat message | 0.3-0.5s | Spur jingle or light tap |
| `whisper.mp3` | Private message | 0.3-0.5s | Quiet whistle or soft chime |
| `mention.mp3` | User mentioned | 0.4-0.7s | Louder bell or distinctive alert |

### 🖱️ UI Sounds

| File | Purpose | Duration | Western Theme Suggestion |
|------|---------|----------|--------------------------|
| `click.mp3` | Button click | 0.1-0.2s | **Quick click or tap** |
| `ui-click.mp3` | General UI click | 0.1-0.2s | Subtle click |
| `ui-hover.mp3` | UI hover | 0.1-0.2s | Very soft hover sound (optional) |
| `menu-open.mp3` | Menu opened | 0.3-0.5s | Swoosh or door creak |
| `menu-close.mp3` | Menu closed | 0.3-0.5s | Swoosh or door close |

### 🎯 Other Game Events

| File | Purpose | Duration | Western Theme Suggestion |
|------|---------|----------|--------------------------|
| `quest-complete.mp3` | Quest completed | 1.0-2.0s | Achievement fanfare |
| `achievement.mp3` | Achievement unlocked | 1.0-2.0s | Special achievement sound |
| `item.mp3` | Item obtained | 0.4-0.6s | Item pickup sound |
| `energy.mp3` | Energy restored | 0.5-0.8s | Refreshing sound or power-up |

## 🎨 Western Theme Guidelines

### Instruments to Consider
- **Harmonica**: Short notes for reveals and notifications
- **Guitar**: Chords for victories and strong reveals
- **Piano**: Saloon-style jingles for UI sounds
- **Banjo**: Quick plucks for card actions
- **Trumpet/Brass**: Fanfares for achievements
- **Percussion**: Drums for combat and tension

### Sound Design Tips
1. **Keep it subtle**: UI sounds should be pleasant, not annoying
2. **Western flair**: Add subtle reverb for a "saloon" feel
3. **Variety**: Similar events (like card draws) can have slight variations
4. **Volume balance**: Combat sounds should be more prominent than UI clicks
5. **Quality over quantity**: Start with key sounds (gold, combat, notifications)

## 📊 Technical Specifications

### Audio Format
- **Format**: MP3 (best browser compatibility)
- **Sample Rate**: 44.1kHz minimum
- **Bit Rate**: 128kbps minimum (192kbps recommended)
- **Channels**: Mono or Stereo
- **Max File Size**: 100KB per file recommended

### File Naming
- Use lowercase
- Use hyphens for spaces
- Match exact filenames in this document
- Example: `card-flip.mp3`, not `CardFlip.mp3` or `card_flip.mp3`

## 🔊 Implementation Status

✅ **Sound System**: Fully implemented and functional
✅ **Settings Store**: Volume control and enable/disable working
✅ **Component Integration**: Sounds integrated into:
   - Combat Arena (hits, misses, damage)
   - Actions Page (success, failure, gold, XP)
   - Notifications (new notifications)
   - Character Store (level-up detection)

⏳ **Pending**: Sound asset files (this directory currently only has README files)

## 🎯 Priority Sound Files

If adding sounds incrementally, start with these **high-priority** files:

1. **`click.mp3`** - Most frequently used (all button clicks)
2. **`coins.mp3`** - Core game mechanic (gold transactions)
3. **`notification.mp3`** - Important for user feedback
4. **`hit.mp3`** & **`miss.mp3`** - Combat feedback
5. **`success.mp3`** & **`failure.mp3`** - Action feedback
6. **`level-up.mp3`** - Special celebration moment
7. **`card-flip.mp3`** - Destiny Deck core mechanic

## 🔗 Free Sound Resources

### Recommended Sources
- [FreeSound.org](https://freesound.org/) - Community sound library
- [ZapSplat](https://www.zapsplat.com/) - Free sound effects
- [SoundBible](http://soundbible.com/) - Public domain sounds
- [Notification Sounds](https://notificationsounds.com/) - UI alerts
- [Sonniss GameAudioGDC](https://sonniss.com/gameaudiogdc) - Annual free bundles

### Search Terms for Western Sounds
- "western music sting"
- "saloon piano"
- "coin clink"
- "gunshot"
- "harmonica note"
- "spur jingle"
- "poker chip"

## 📝 Licensing Notes

**Important**: Ensure all sound files are:
- ✅ Royalty-free or properly licensed
- ✅ Permitted for commercial use (if applicable)
- ✅ Credited if required by license
- ✅ Not copyrighted material

## 🧪 Testing Sounds

After adding sound files:

1. **Settings Test**:
   - Access settings (when settings UI is built)
   - Toggle sound on/off
   - Adjust volume slider

2. **In-Game Test**:
   - Perform actions → Should hear success/failure + coins + XP
   - Enter combat → Should hear combat sounds
   - Receive notification → Should hear notification sound
   - Click buttons → Should hear click sound

3. **Browser Console**:
   - Check for missing file warnings
   - Verify no audio errors

## 🚀 Quick Start

To add sounds:

1. Download/create MP3 files matching the filenames above
2. Place them in `client/public/sounds/` directory
3. Reload the game
4. Sounds will automatically play when triggered!

## 💡 Notes

- Sounds are **optional** - the game works without them
- Missing sounds fail silently (no errors)
- Sound system uses HTML5 Audio API
- Volume is controlled globally via settings store
- Sounds can overlap (multiple sounds at once)
- Audio is lazy-loaded and cached for performance

---

**Status**: 🟡 System ready, awaiting audio assets
**Last Updated**: 2025-11-25
**Total Sounds Needed**: 33 files
