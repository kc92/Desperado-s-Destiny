# Chat Notification Sounds

This directory contains sound files for chat notifications.

## Required Sound Files

The following MP3 files are required for the chat notification system:

### 1. message.mp3
- **Purpose**: Played when a regular message is received
- **Recommended**: Subtle "ding" or "pop" sound
- **Duration**: 0.3-0.5 seconds
- **Volume**: Should be pleasant at 50% volume
- **Example sources**:
  - [FreeSound](https://freesound.org/search/?q=message+notification)
  - [Zapsplat](https://www.zapsplat.com/sound-effect-category/ui-and-alerts/)

### 2. whisper.mp3
- **Purpose**: Played when a whisper (private message) is received
- **Recommended**: Different tone than regular message (e.g., "ping", "bell")
- **Duration**: 0.3-0.5 seconds
- **Volume**: Should be pleasant at 50% volume
- **Example sources**:
  - [FreeSound](https://freesound.org/search/?q=whisper+notification)
  - [Notification Sounds](https://notificationsounds.com/)

### 3. mention.mp3
- **Purpose**: Played when user is @ mentioned in a message
- **Recommended**: More distinctive sound (e.g., "chime", "alert")
- **Duration**: 0.4-0.7 seconds
- **Volume**: Should be pleasant at 50% volume
- **Example sources**:
  - [FreeSound](https://freesound.org/search/?q=mention+alert)
  - [Sound Jay](https://www.soundjay.com/misc-sounds.html)

## Technical Requirements

- **Format**: MP3
- **Sample Rate**: 44.1kHz or higher
- **Bit Rate**: 128kbps minimum
- **Channels**: Mono or Stereo
- **Max File Size**: 50KB per file

## Western Theme Suggestions

For a more thematic experience matching the Desperados Destiny Western theme:

- **message.mp3**: Soft spur jingle, light gunshot click, or poker chip sound
- **whisper.mp3**: Quiet whistle, subtle harmonica note
- **mention.mp3**: Louder spur jingle, saloon bell, or distinctive Western chime

## Licensing

Ensure all sound files are:
- Royalty-free or properly licensed
- Permitted for commercial use if applicable
- Credited if required by the license

## Testing

After adding sound files, test them in the chat settings:
1. Open chat
2. Click settings icon
3. Enable sound notifications
4. Adjust volume slider
5. Test each notification type

## Fallback Behavior

If sound files are missing:
- Chat will function normally
- No sound will play
- Console warnings will indicate missing files
- No errors thrown to users
