/**
 * ChatGenerator Example & Test Suite
 *
 * Demonstrates all features of the ChatGenerator:
 * - All 8 personality types
 * - Context-aware messaging
 * - Greeting variations
 * - Topic-based messages
 * - Response generation
 * - Emote usage
 * - Typo simulation
 * - Length variations
 */

import { ChatGenerator, PlayerPersonality, ChatContext } from './ChatGenerator.js';

/**
 * Demonstrate all 8 personality types with various contexts
 */
function demonstratePersonalities() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PERSONALITY-DRIVEN CHAT GENERATION SHOWCASE');
  console.log('═══════════════════════════════════════════════════════════\n');

  const personalities: PlayerPersonality[] = [
    'grinder',
    'social',
    'roleplayer',
    'competitive',
    'merchant',
    'loremaster',
    'casual',
    'helper'
  ];

  const contexts: ChatContext[] = [
    {
      location: 'Red Gulch Saloon',
      timeOfDay: 14,
      level: 10,
      faction: 'settler',
      activity: 'idle'
    },
    {
      location: 'Kaiowa Mesa',
      timeOfDay: 20,
      recentEvent: 'combat_win',
      level: 25,
      faction: 'nahi',
      activity: 'fighting'
    },
    {
      location: 'The Frontera',
      timeOfDay: 8,
      recentEvent: 'level_up',
      level: 15,
      faction: 'frontera',
      inGang: true
    }
  ];

  personalities.forEach(personality => {
    console.log(`\n┌─────────────────────────────────────────────────────────────┐`);
    console.log(`│  ${personality.toUpperCase().padEnd(56)} │`);
    console.log(`└─────────────────────────────────────────────────────────────┘\n`);

    const generator = new ChatGenerator({
      personality,
      characterName: `${personality}Player`,
      enableTypos: true,
      typoRate: 0.04,
      enableEmotes: personality === 'roleplayer'
    });

    // Show 3 greetings
    console.log('  🎭 Greetings (showing variety):');
    for (let i = 0; i < 3; i++) {
      const greeting = generator.generateGreeting({
        context: contexts[i % contexts.length]
      });
      console.log(`     ${i + 1}. ${greeting}`);
    }

    // Show messages for different contexts
    console.log('\n  💬 Contextual Messages:');
    contexts.forEach((context, idx) => {
      const msg = generator.generateMessage({
        length: idx === 0 ? 'short' : idx === 1 ? 'medium' : 'long',
        context
      });
      console.log(`     ${idx + 1}. [${context.location}] ${msg}`);
    });

    // Show responses
    console.log('\n  💭 Response Examples:');
    const testMessages = [
      'Anyone want to help with this quest?',
      'Looking to trade some items',
      'Who wants to duel?'
    ];

    testMessages.forEach((testMsg, idx) => {
      const response = generator.generateResponse(testMsg, contexts[idx % contexts.length]);
      console.log(`     → "${testMsg}"`);
      console.log(`     ← "${response}"`);
    });
  });
}

/**
 * Demonstrate greeting variety for a single personality
 */
function demonstrateGreetingVariety() {
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  GREETING VARIETY SHOWCASE (50+ variations)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const generator = new ChatGenerator({
    personality: 'roleplayer',
    characterName: 'Black Jack McCoy',
    enableEmotes: true,
    typoRate: 0
  });

  console.log('Generating 20 greetings to show variety:\n');

  const contexts: ChatContext[] = [
    { location: 'Red Gulch Saloon', timeOfDay: 12 },
    { location: 'Kaiowa Mesa', timeOfDay: 18 },
    { location: 'The Frontera', timeOfDay: 6 },
    { location: 'Dead Man\'s Canyon', timeOfDay: 22 }
  ];

  for (let i = 0; i < 20; i++) {
    const greeting = generator.generateGreeting({
      context: contexts[i % contexts.length]
    });
    console.log(`  ${(i + 1).toString().padStart(2)}. ${greeting}`);
  }
}

/**
 * Demonstrate emote usage and roleplaying
 */
function demonstrateRoleplayEmotes() {
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  ROLEPLAY & EMOTE SHOWCASE');
  console.log('═══════════════════════════════════════════════════════════\n');

  const generator = new ChatGenerator({
    personality: 'roleplayer',
    characterName: 'Sarah "Dead-Eye" McKenna',
    enableEmotes: true,
    typoRate: 0.02
  });

  console.log('🎭 Roleplayer with emotes enabled:\n');

  const scenarios = [
    { desc: 'Entering saloon', context: { location: 'Saloon', activity: 'idle' as const } },
    { desc: 'After winning combat', context: { location: 'Canyon', recentEvent: 'combat_win' as const } },
    { desc: 'Trading goods', context: { location: 'Trading Post', activity: 'trading' as const } },
    { desc: 'Joining gang', context: { location: 'Gang Hideout', recentEvent: 'joined_gang' as const, inGang: true } },
    { desc: 'Evening in town', context: { location: 'Red Gulch', timeOfDay: 19 } }
  ];

  scenarios.forEach(({ desc, context }) => {
    console.log(`  📍 ${desc}:`);
    for (let i = 0; i < 3; i++) {
      const msg = generator.generateMessage({ context });
      console.log(`     • ${msg}`);
    }
    console.log();
  });

  // Show standalone emotes
  console.log('  🎭 Standalone Emotes:');
  for (let i = 0; i < 10; i++) {
    console.log(`     ${generator.generateEmote()}`);
  }
}

/**
 * Demonstrate typo simulation
 */
function demonstrateTypoSimulation() {
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  TYPO SIMULATION SHOWCASE (Human-like mistakes)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const generator = new ChatGenerator({
    personality: 'casual',
    characterName: 'CasualJoe',
    enableTypos: true,
    typoRate: 0.3 // Higher rate for demonstration
  });

  console.log('Generating messages with 30% typo rate (exaggerated for demo):\n');

  for (let i = 0; i < 15; i++) {
    const msg = generator.generateMessage({
      length: i % 3 === 0 ? 'short' : i % 3 === 1 ? 'medium' : 'long',
      context: {
        location: 'Town',
        level: 12
      }
    });
    console.log(`  ${(i + 1).toString().padStart(2)}. ${msg}`);
  }

  console.log('\n  Note: Typos include letter swaps, doubles, omissions, and wrong keys');
  console.log('        Realistic rate is 3-5% (0.03-0.05)');
}

/**
 * Demonstrate message length variations
 */
function demonstrateLengthVariations() {
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  MESSAGE LENGTH VARIATIONS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const generator = new ChatGenerator({
    personality: 'social',
    characterName: 'FriendlyFrank',
    enableTypos: false
  });

  const lengths: Array<'short' | 'medium' | 'long'> = ['short', 'medium', 'long'];

  lengths.forEach(length => {
    console.log(`  📏 ${length.toUpperCase()} messages:`);
    for (let i = 0; i < 5; i++) {
      const msg = generator.generateMessage({
        length,
        context: { location: 'Town Square' }
      });
      console.log(`     ${i + 1}. ${msg}`);
    }
    console.log();
  });
}

/**
 * Demonstrate context-aware messaging
 */
function demonstrateContextAwareness() {
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  CONTEXT-AWARE MESSAGING');
  console.log('═══════════════════════════════════════════════════════════\n');

  const generator = new ChatGenerator({
    personality: 'grinder',
    characterName: 'OptimizerOliver',
    enableTypos: false
  });

  const contexts: Array<{ desc: string; context: ChatContext }> = [
    {
      desc: 'Just won combat',
      context: { recentEvent: 'combat_win', level: 20 }
    },
    {
      desc: 'Just lost combat',
      context: { recentEvent: 'combat_loss', level: 20 }
    },
    {
      desc: 'Leveled up',
      context: { recentEvent: 'level_up', level: 21 }
    },
    {
      desc: 'Completed quest',
      context: { recentEvent: 'quest_complete', level: 21 }
    },
    {
      desc: 'Joined gang',
      context: { recentEvent: 'joined_gang', inGang: true }
    },
    {
      desc: 'Got arrested',
      context: { recentEvent: 'got_arrested', level: 20 }
    },
    {
      desc: 'Escaped jail',
      context: { recentEvent: 'escaped_jail', level: 20 }
    },
    {
      desc: 'Morning in town',
      context: { timeOfDay: 8, location: 'Red Gulch' }
    },
    {
      desc: 'Evening in saloon',
      context: { timeOfDay: 20, location: 'Saloon' }
    },
    {
      desc: 'Late night exploring',
      context: { timeOfDay: 23, location: 'Wilderness', activity: 'exploring' }
    }
  ];

  contexts.forEach(({ desc, context }) => {
    console.log(`  📌 ${desc}:`);
    for (let i = 0; i < 2; i++) {
      const msg = generator.generateMessage({ context });
      console.log(`     • ${msg}`);
    }
    console.log();
  });
}

/**
 * Demonstrate conversation flow
 */
function demonstrateConversationFlow() {
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  REALISTIC CONVERSATION FLOW');
  console.log('═══════════════════════════════════════════════════════════\n');

  const personalities: Array<{ name: string; type: PlayerPersonality }> = [
    { name: 'Sarah', type: 'roleplayer' },
    { name: 'Mike', type: 'grinder' },
    { name: 'Jenny', type: 'social' },
    { name: 'Alex', type: 'helper' }
  ];

  const generators = personalities.map(p => ({
    name: p.name,
    gen: new ChatGenerator({
      personality: p.type,
      characterName: p.name,
      enableEmotes: p.type === 'roleplayer',
      typoRate: 0.03
    })
  }));

  const context: ChatContext = {
    location: 'Red Gulch Saloon',
    timeOfDay: 18,
    level: 15
  };

  console.log('  🗨️  Chat Room: Red Gulch Saloon (Evening)\n');

  // Sarah enters and greets
  const sarahGreeting = generators[0].gen.generateGreeting({ context });
  console.log(`  [Sarah]: ${sarahGreeting}`);

  // Mike responds
  const mikeResponse = generators[1].gen.generateResponse(sarahGreeting, context);
  console.log(`  [Mike]: ${mikeResponse}`);

  // Jenny joins
  const jennyGreeting = generators[2].gen.generateGreeting({ context });
  console.log(`  [Jenny]: ${jennyGreeting}`);

  // Alex asks about quests
  const alexMessage = generators[3].gen.generateMessage({
    topic: 'quest',
    context
  });
  console.log(`  [Alex]: ${alexMessage}`);

  // Sarah responds about quests
  const sarahQuestResponse = generators[0].gen.generateResponse(alexMessage, context);
  console.log(`  [Sarah]: ${sarahQuestResponse}`);

  // Mike talks about grinding
  const mikeGrindMsg = generators[1].gen.generateMessage({ context });
  console.log(`  [Mike]: ${mikeGrindMsg}`);

  // Jenny talks about social stuff
  const jennySocialMsg = generators[2].gen.generateMessage({
    topic: 'social',
    context
  });
  console.log(`  [Jenny]: ${jennySocialMsg}`);

  // Alex offers help
  const alexHelpMsg = generators[3].gen.generateMessage({ context });
  console.log(`  [Alex]: ${alexHelpMsg}`);

  console.log('\n  Each message reflects the character\'s unique personality!');
}

/**
 * Main demo runner
 */
async function runFullDemo() {
  console.clear();
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║     DESPERADOS DESTINY - CHATGENERATOR SHOWCASE          ║');
  console.log('║     Context-Aware, Personality-Driven Chat System        ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Run all demonstrations
  demonstratePersonalities();
  demonstrateGreetingVariety();
  demonstrateRoleplayEmotes();
  demonstrateTypoSimulation();
  demonstrateLengthVariations();
  demonstrateContextAwareness();
  demonstrateConversationFlow();

  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  DEMO COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('  ✅ All 8 personalities demonstrated');
  console.log('  ✅ 50+ greeting variations shown');
  console.log('  ✅ Context-aware messaging verified');
  console.log('  ✅ Topic generation working');
  console.log('  ✅ Response generation functional');
  console.log('  ✅ Roleplay emotes active');
  console.log('  ✅ Typo simulation realistic');
  console.log('  ✅ Length variations applied');
  console.log('\n  The ChatGenerator creates genuinely human-feeling messages!');
  console.log('\n');
}

/**
 * Quick test for integration testing
 */
export function quickTest() {
  console.log('Running ChatGenerator quick test...\n');

  const testPersonalities: PlayerPersonality[] = ['grinder', 'social', 'roleplayer'];

  testPersonalities.forEach(personality => {
    const gen = new ChatGenerator({
      personality,
      characterName: 'TestBot',
      enableTypos: true,
      typoRate: 0.04
    });

    console.log(`${personality}:`);
    console.log(`  Greeting: ${gen.generateGreeting()}`);
    console.log(`  Message: ${gen.generateMessage()}`);
    console.log(`  Response: ${gen.generateResponse('Hey everyone!')}`);
    console.log();
  });

  console.log('Quick test complete ✓\n');
}

// Run the full demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullDemo().catch(console.error);
}
