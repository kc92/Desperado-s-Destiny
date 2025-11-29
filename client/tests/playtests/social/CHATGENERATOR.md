# ChatGenerator - Human-like Chat Message Generation

**Agent 11 - Week 5-6 Deliverable**

## Overview

The ChatGenerator creates context-aware, personality-driven chat messages that feel genuinely human and authentic, not robotic. It's designed to power realistic bot conversations in the Desperados Destiny playtest environment.

## Features

### ✅ 8 Personality Archetypes

Each personality has unique speech patterns, topics, and behaviors:

1. **Grinder** - Talks about XP, optimization, efficiency, meta builds
2. **Social** - Focused on making friends, community, group activities
3. **Roleplayer** - Heavy western roleplay with emotes and character flavor
4. **Competitive** - Rankings, being the best, challenges, domination
5. **Merchant** - Trading, economics, deals, market analysis
6. **Loremaster** - Deep lore, story, world knowledge, historical context
7. **Casual** - Relaxed, simple chat, friendly, laid-back
8. **Helper** - Offers advice, helps newbies, shares knowledge

### ✅ Context-Aware Messaging

Messages adapt based on:
- **Location** - Different messages for saloons vs wilderness
- **Time of Day** - Morning greetings vs evening chat
- **Recent Events** - Combat wins/losses, level ups, arrests
- **Player Level** - References appropriate content
- **Faction** - Settler, Nahi, or Frontera flavor
- **Activity** - Idle, fighting, trading, exploring
- **Gang Status** - Gang-related messaging when appropriate

### ✅ 50+ Greeting Variations

Each personality has 15+ unique greeting patterns:
- Time-aware greetings
- Location-specific greetings
- Context-sensitive variations
- Never feels repetitive

### ✅ Topic Generation

Intelligent topic selection based on personality and context:
- **Quests** - Missions, storylines, completions
- **Combat** - Battles, duels, strategies
- **Trading** - Buying, selling, market talk
- **Gang** - Gang activities, wars, loyalty
- **Lore** - History, mythology, stories
- **Complaints** - Constructive feedback, issues
- **Achievements** - Unlocks, milestones, progress
- **Location** - Area descriptions, exploration
- **Strategy** - Builds, optimization, tactics
- **Social** - Community, friendships, events

### ✅ Response Generation

Contextual responses to other players' messages:
- Detects message intent (help, quest, trade, combat, gang)
- Generates personality-appropriate responses
- Maintains character consistency
- Feels like natural conversation

### ✅ Roleplay Templates with Western Flavor

Special emote system for roleplayers:
- 25+ western-themed emotes
- *tips hat*, *draws weapon*, *holsters gun*
- *spits tobacco*, *lights cigar*, *pours whiskey*
- Authentic frontier atmosphere
- 30% chance to add emotes to messages

### ✅ Message Length Variation

Three natural length categories:
- **Short**: 1-5 words (quick responses)
- **Medium**: 5-15 words (typical chat)
- **Long**: 15-30 words (detailed messages)

### ✅ Realistic Typo Simulation

Human-like mistakes at 3-5% rate:
- **Letter Swaps** - "the" → "teh"
- **Double Letters** - "good" → "goood"
- **Omissions** - "fighting" → "fightng"
- **Wrong Keys** - "time" → "tine" (nearby key)
- Feels authentically human

## Usage

### Basic Example

```typescript
import { ChatGenerator } from './ChatGenerator.js';

// Create a roleplayer
const generator = new ChatGenerator({
  personality: 'roleplayer',
  characterName: 'Black Jack McCoy',
  enableEmotes: true,
  typoRate: 0.04
});

// Generate a greeting
const greeting = generator.generateGreeting({
  context: {
    location: 'Red Gulch Saloon',
    timeOfDay: 18
  }
});
// Output: "*tips hat* Evenin' folks, name's Black Jack McCoy"

// Generate a contextual message
const message = generator.generateMessage({
  length: 'medium',
  context: {
    location: 'Kaiowa Mesa',
    recentEvent: 'combat_win',
    level: 15
  }
});
// Output: "*holsters smoking revolver* They didn't stand a chance"

// Respond to another player
const response = generator.generateResponse(
  'Anyone want to help with this quest?',
  { location: 'The Frontera' }
);
// Output: "*nods* A noble quest indeed"
```

### Integration with Bots

```typescript
import { SocialBot } from '../bots/SocialBot.js';
import { ChatGenerator } from './ChatGenerator.js';

class EnhancedSocialBot extends SocialBot {
  private chatGen: ChatGenerator;

  constructor(config: BotConfig) {
    super(config);

    this.chatGen = new ChatGenerator({
      personality: 'social',
      characterName: config.characterName,
      enableTypos: true,
      typoRate: 0.04
    });
  }

  async sendChatMessage(): Promise<void> {
    // Generate context from bot state
    const context = {
      location: await this.getCurrentLocation(),
      level: await this.getCharacterLevel(),
      recentEvent: this.getRecentEvent(),
      timeOfDay: new Date().getHours()
    };

    // Generate contextual message
    const message = this.chatGen.generateMessage({ context });

    // Send to chat
    await this.typeAndSendMessage(message);
  }

  async respondToChat(incomingMessage: string): Promise<void> {
    const context = {
      location: await this.getCurrentLocation()
    };

    const response = this.chatGen.generateResponse(
      incomingMessage,
      context
    );

    await this.typeAndSendMessage(response);
  }
}
```

### All 8 Personalities Example

```typescript
const personalities = [
  'grinder',
  'social',
  'roleplayer',
  'competitive',
  'merchant',
  'loremaster',
  'casual',
  'helper'
];

const generators = personalities.map(p =>
  new ChatGenerator({
    personality: p,
    characterName: `${p}Bot`,
    enableTypos: true
  })
);

// Simulate a chat room
generators.forEach(gen => {
  const greeting = gen.generateGreeting({
    context: { location: 'Town Square' }
  });
  console.log(`[${gen.config.characterName}]: ${greeting}`);
});
```

## API Reference

### ChatGenerator Constructor

```typescript
new ChatGenerator(config: ChatGeneratorConfig)
```

**Config Options:**
- `personality`: PlayerPersonality - One of 8 archetypes
- `characterName`: string - Character's name
- `enableTypos?`: boolean - Enable typo simulation (default: true)
- `typoRate?`: number - Typo rate 0-1 (default: 0.04)
- `enableEmotes?`: boolean - Enable emote usage (default: true for roleplayer)
- `verbose?`: boolean - Enable logging (default: false)

### Methods

#### generateGreeting(options?)

Generate a greeting message.

```typescript
generateGreeting(options?: MessageOptions): string
```

**Options:**
- `context?`: ChatContext - Game context
- `length?`: 'short' | 'medium' | 'long' - Preferred length

#### generateMessage(options?)

Generate a contextual message.

```typescript
generateMessage(options?: MessageOptions): string
```

**Options:**
- `length?`: 'short' | 'medium' | 'long' - Preferred length
- `topic?`: string - Force specific topic
- `context?`: ChatContext - Game context

#### generateResponse(message, context?)

Generate a response to another player's message.

```typescript
generateResponse(originalMessage: string, context?: ChatContext): string
```

#### generateEmote()

Generate a random western-themed emote.

```typescript
generateEmote(): string
```

Returns: `'*tips hat*'`, `'*draws weapon*'`, etc.

#### getStatistics()

Get generator statistics.

```typescript
getStatistics(): {
  totalMessages: number;
  personality: PlayerPersonality;
  characterName: string;
  typosEnabled: boolean;
  emotesEnabled: boolean;
}
```

#### reset()

Reset message counter and state.

```typescript
reset(): void
```

## Chat Context Interface

```typescript
interface ChatContext {
  location?: string;           // 'Red Gulch Saloon'
  timeOfDay?: number;          // 0-23 hours
  recentEvent?: EventType;     // 'combat_win', 'level_up', etc.
  level?: number;              // Character level
  faction?: FactionType;       // 'settler', 'nahi', 'frontera'
  activity?: ActivityType;     // 'idle', 'fighting', 'trading'
  inGang?: boolean;           // Is player in a gang?
  messageToRespondTo?: string; // Message to respond to
}
```

## Event Types

```typescript
type EventType =
  | 'combat_win'
  | 'combat_loss'
  | 'level_up'
  | 'quest_complete'
  | 'joined_gang'
  | 'found_treasure'
  | 'got_arrested'
  | 'escaped_jail';
```

## Examples & Testing

### Run Full Demo

```bash
cd client/tests/playtests/social
node --loader ts-node/esm ChatGenerator.example.ts
```

This demonstrates:
- All 8 personality types
- Greeting variety (50+ variations)
- Roleplay with emotes
- Typo simulation
- Length variations
- Context awareness
- Realistic conversation flow

### Quick Test

```typescript
import { quickTest } from './ChatGenerator.example.js';
quickTest();
```

## Design Philosophy

### Human-First Design

The ChatGenerator is designed to feel genuinely human:

1. **Personality Consistency** - Each archetype has distinct speech patterns
2. **Context Awareness** - Messages adapt to situation
3. **Natural Variation** - Never repetitive, always fresh
4. **Realistic Mistakes** - Typos make it feel human
5. **Emotional Range** - Reactions to wins, losses, events
6. **Social Intelligence** - Appropriate responses to others

### Western Flavor

Special attention to western/frontier atmosphere:
- Authentic frontier language
- Period-appropriate emotes
- Location-aware messaging
- Faction cultural differences
- Historical lore integration

### Bot Integration

Designed for seamless bot integration:
- Simple API
- Context from game state
- Minimal configuration
- High performance
- Type-safe interfaces

## Message Examples by Personality

### Grinder
- "Best quest for XP at my level?"
- "Combat XP looking good!"
- "Optimizing my quest route today"
- "Energy efficiency is key, folks"

### Social
- "Hey everyone! Hope you're all having a great day!"
- "Anyone want to team up?"
- "Love chatting with you all"
- "This community is amazing"

### Roleplayer
- "*tips hat* Evenin' folks, name's {name}"
- "*holsters smoking revolver* They didn't stand a chance"
- "*shares tales by the fire*"
- "The frontier is lonely without friends"

### Competitive
- "Ready to dominate today's leaderboards"
- "Who wants to test their skills?"
- "Another victory for the books!"
- "I'm coming for that #1 spot"

### Merchant
- "Open for business! What do you need?"
- "Trading post is open!"
- "Fair prices, quality goods!"
- "WTS: Rare items, PM offers"

### Loremaster
- "Fascinating lore in this territory"
- "The Sangre Territory mythology is incredible"
- "Did you know about the ancient prophecy?"
- "Historical records reveal so much"

### Casual
- "Hey what's up"
- "This quest is pretty cool"
- "Just hanging out"
- "Combat is pretty fun"

### Helper
- "Hi! Happy to answer any questions"
- "Quest tips: take your time and read carefully"
- "Combat tip: watch your positioning"
- "Happy to help with that! Here's how:"

## Performance

- **Fast Generation**: < 1ms per message
- **Low Memory**: Minimal state tracking
- **No External Dependencies**: Pure TypeScript
- **Type Safe**: Full TypeScript support
- **Scalable**: Handle hundreds of bots

## Future Enhancements

Potential additions:
- [ ] Slang/dialect variations
- [ ] Relationship tracking (remembers past interactions)
- [ ] Emotion system (happy, angry, tired)
- [ ] Learning from player chat
- [ ] Multi-language support
- [ ] Voice/tone modulation
- [ ] Conversation memory
- [ ] Group chat dynamics

## Credits

**Agent 11 - ChatGenerator Architect**
Week 5-6 Deliverable for Desperados Destiny Playtest Framework

Created: November 27, 2025
Version: 1.0.0

---

## Quick Reference

```typescript
// Create generator
const gen = new ChatGenerator({
  personality: 'roleplayer',
  characterName: 'Sarah',
  enableEmotes: true,
  typoRate: 0.04
});

// Generate greeting
const greeting = gen.generateGreeting({
  context: { location: 'Saloon', timeOfDay: 18 }
});

// Generate message
const msg = gen.generateMessage({
  length: 'medium',
  context: { recentEvent: 'combat_win', level: 20 }
});

// Generate response
const reply = gen.generateResponse('Anyone trading?', {
  location: 'Trading Post'
});

// Get emote
const emote = gen.generateEmote();
```

**Result**: Authentic, human-like chat that brings bots to life! 🤠
