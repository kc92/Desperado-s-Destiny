/**
 * SocialIntelligence.example.ts
 *
 * Comprehensive examples demonstrating realistic social behavior emergence
 * using the SocialIntelligence system.
 */

import { PersonalitySystem } from '../intelligence/PersonalitySystem';
import {
  SocialIntelligence,
  InteractionType,
  RelationshipStage,
  CharacterSocialProfile,
  GangInfo
} from './SocialIntelligence';

// ============================================================================
// EXAMPLE 1: GRADUAL FRIENDSHIP FORMATION
// ============================================================================

console.log('=== EXAMPLE 1: GRADUAL FRIENDSHIP FORMATION ===\n');

// Create a social-oriented bot
const socialPersonality = PersonalitySystem.createPersonality('social');
const alice = new SocialIntelligence('alice-123', 'settler', socialPersonality);

// Alice meets Bob (same faction)
console.log('Day 1: Alice meets Bob at the saloon...');
alice.recordInteraction('bob-456', 'Bob', InteractionType.GREETING, true, 'First meeting at saloon');

const bobProfile: CharacterSocialProfile = {
  characterId: 'bob-456',
  characterName: 'Bob',
  faction: 'settler',
  level: 5
};

let relationship = alice.getRelationship('bob-456', 'Bob', 'settler');
console.log(`Affinity: ${relationship.affinity}, Stage: ${relationship.stage}`);
console.log(`Should send friend request? ${alice.shouldSendFriendRequest(bobProfile)}\n`);

// Day 2: Chat conversation
console.log('Day 2: Alice and Bob chat...');
alice.recordInteraction('bob-456', 'Bob', InteractionType.CHAT, true, 'Talked about local rumors');
alice.recordInteraction('bob-456', 'Bob', InteractionType.CHAT, true, 'Discussed quests');

relationship = alice.getRelationship('bob-456', 'Bob', 'settler');
console.log(`Affinity: ${relationship.affinity}, Stage: ${relationship.stage}`);
console.log(`Should send friend request? ${alice.shouldSendFriendRequest(bobProfile)}\n`);

// Day 3: Help each other
console.log('Day 3: Alice helps Bob with a quest...');
alice.recordInteraction('bob-456', 'Bob', InteractionType.QUEST_TOGETHER, true, 'Completed bandit quest together');

relationship = alice.getRelationship('bob-456', 'Bob', 'settler');
console.log(`Affinity: ${relationship.affinity}, Stage: ${relationship.stage}`);
console.log(`Should send friend request? ${alice.shouldSendFriendRequest(bobProfile)}\n`);

// Day 4: More interactions
console.log('Day 4: Trading and more quests...');
alice.recordInteraction('bob-456', 'Bob', InteractionType.TRADE, true, 'Traded supplies');
alice.recordInteraction('bob-456', 'Bob', InteractionType.HELP, true, 'Helped defend against outlaws');

relationship = alice.getRelationship('bob-456', 'Bob', 'settler');
console.log(`Affinity: ${relationship.affinity}, Stage: ${relationship.stage}`);
console.log(`Should send friend request? ${alice.shouldSendFriendRequest(bobProfile)} ← NOW READY!\n`);

// Send friend request and become friends
console.log('Alice sends friend request!');
relationship.friendRequestPending = true;
relationship.stage = RelationshipStage.FRIEND; // Accepted

console.log('Day 5: Now friends, continuing to bond...');
alice.recordInteraction('bob-456', 'Bob', InteractionType.MAIL, true, 'Sent friendly letter');
alice.recordInteraction('bob-456', 'Bob', InteractionType.COMBAT_TOGETHER, true, 'Fought bandits together');
alice.recordInteraction('bob-456', 'Bob', InteractionType.GIFT, true, 'Gave Bob a rare item');

relationship = alice.getRelationship('bob-456', 'Bob', 'settler');
console.log(`Affinity: ${relationship.affinity}, Stage: ${relationship.stage}`);
console.log(`Interaction count: ${relationship.interactionCount}`);
console.log(`Trust level: ${relationship.trust.toFixed(2)}\n`);

// ============================================================================
// EXAMPLE 2: FACTION-BASED BEHAVIOR
// ============================================================================

console.log('\n=== EXAMPLE 2: FACTION-BASED BEHAVIOR ===\n');

// Alice meets Charlie (different faction - outlaw)
console.log('Alice (settler) meets Charlie (outlaw)...');
const charlieProfile: CharacterSocialProfile = {
  characterId: 'charlie-789',
  characterName: 'Charlie',
  faction: 'outlaw',
  level: 6
};

alice.recordInteraction('charlie-789', 'Charlie', InteractionType.GREETING, true, 'Cautious first meeting');

let charlieRelationship = alice.getRelationship('charlie-789', 'Charlie', 'outlaw');
console.log(`Initial affinity (different faction): ${charlieRelationship.affinity}`);
console.log(`Compare to Bob (same faction): ${relationship.affinity}\n`);

// Building trust across faction lines takes more effort
console.log('Multiple positive interactions needed to overcome faction difference...');
for (let i = 0; i < 5; i++) {
  alice.recordInteraction('charlie-789', 'Charlie', InteractionType.CHAT, true, `Building trust (${i + 1}/5)`);
}
alice.recordInteraction('charlie-789', 'Charlie', InteractionType.HELP, true, 'Helped despite faction');
alice.recordInteraction('charlie-789', 'Charlie', InteractionType.QUEST_TOGETHER, true, 'Common enemy quest');

charlieRelationship = alice.getRelationship('charlie-789', 'Charlie', 'outlaw');
console.log(`After many positive interactions: ${charlieRelationship.affinity}`);
console.log(`Stage: ${charlieRelationship.stage}`);
console.log(`Can overcome faction barriers with effort!\n`);

// ============================================================================
// EXAMPLE 3: PERSONALITY-DRIVEN DECISIONS
// ============================================================================

console.log('\n=== EXAMPLE 3: PERSONALITY-DRIVEN DECISIONS ===\n');

// Create different personality types
const grinderPersonality = PersonalitySystem.createPersonality('grinder');
const grinderBot = new SocialIntelligence('grinder-001', 'settler', grinderPersonality);

const explorerPersonality = PersonalitySystem.createPersonality('explorer');
const explorerBot = new SocialIntelligence('explorer-001', 'nahi', explorerPersonality);

const testProfile: CharacterSocialProfile = {
  characterId: 'test-999',
  characterName: 'Test Player',
  faction: 'settler',
  level: 5
};

// Simulate same interaction history for both
for (let i = 0; i < 5; i++) {
  grinderBot.recordInteraction('test-999', 'Test Player', InteractionType.CHAT, true);
  explorerBot.recordInteraction('test-999', 'Test Player', InteractionType.CHAT, true);
}

console.log('Same interaction history, different personalities:');
console.log(`Social bot (Alice) would send friend request: ${alice.shouldSendFriendRequest(testProfile)}`);
console.log(`Grinder bot would send friend request: ${grinderBot.shouldSendFriendRequest(testProfile)}`);
console.log(`Explorer bot would send friend request: ${explorerBot.shouldSendFriendRequest(testProfile)}`);
console.log('\nGrinder sees friends as time waste, Explorer is independent!\n');

// ============================================================================
// EXAMPLE 4: GANG DYNAMICS
// ============================================================================

console.log('\n=== EXAMPLE 4: GANG DYNAMICS ===\n');

const desertRiders: GangInfo = {
  gangId: 'gang-001',
  gangName: 'Desert Riders',
  gangTag: 'DSRT',
  memberCount: 15,
  level: 5,
  faction: 'settler',
  reputation: 0.75
};

const outlawCrew: GangInfo = {
  gangId: 'gang-002',
  gangName: 'Outlaw Crew',
  gangTag: 'OUTL',
  memberCount: 8,
  level: 3,
  faction: 'outlaw',
  reputation: 0.6
};

console.log('Alice evaluating gangs to join:');
console.log(`Should join Desert Riders (same faction, good rep): ${alice.shouldJoinGang(desertRiders)}`);
console.log(`Should join Outlaw Crew (different faction): ${alice.shouldJoinGang(outlawCrew)}\n`);

// Alice joins Desert Riders
console.log('Alice joins Desert Riders!');
const aliceWithGang = new SocialIntelligence('alice-123', 'settler', socialPersonality, 'gang-001');

// Meet a gang member
console.log('Alice meets Dave, a fellow gang member...');
const daveProfile: CharacterSocialProfile = {
  characterId: 'dave-555',
  characterName: 'Dave',
  faction: 'settler',
  level: 6,
  gangId: 'gang-001'
};

aliceWithGang.recordInteraction('dave-555', 'Dave', InteractionType.GREETING, true);
const daveRelationship = aliceWithGang.getRelationship('dave-555', 'Dave', 'settler');
daveRelationship.sameGang = true; // Mark as gang member

console.log(`Initial affinity with gang member: ${daveRelationship.affinity} (bonus from same gang!)`);

aliceWithGang.recordInteraction('dave-555', 'Dave', InteractionType.GANG_ACTIVITY, true, 'Gang war planning');
console.log(`After gang activity: ${daveRelationship.affinity}`);

const frequency = aliceWithGang.getInteractionFrequency('dave-555');
console.log(`Interaction frequency with gang member: ${frequency.toFixed(2)}x (more frequent!)\n`);

// ============================================================================
// EXAMPLE 5: RELATIONSHIP DECAY
// ============================================================================

console.log('\n=== EXAMPLE 5: RELATIONSHIP DECAY ===\n');

// Create a bot with a friend
const decayBot = new SocialIntelligence('decay-test', 'settler', socialPersonality);

// Build friendship
for (let i = 0; i < 10; i++) {
  decayBot.recordInteraction('old-friend', 'Old Friend', InteractionType.CHAT, true);
}

let oldFriend = decayBot.getRelationship('old-friend', 'Old Friend', 'settler');
console.log(`Initial relationship:`);
console.log(`Affinity: ${oldFriend.affinity}, Stage: ${oldFriend.stage}`);

// Simulate time passing without interaction
console.log('\nSimulating 30 days of no contact...');
for (let day = 1; day <= 30; day++) {
  // Manually set last interaction to be days ago
  oldFriend.lastInteractionAt = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
  decayBot.decayRelationships();

  if (day % 10 === 0) {
    oldFriend = decayBot.getRelationship('old-friend', 'Old Friend', 'settler');
    console.log(`Day ${day}: Affinity: ${oldFriend.affinity}, Stage: ${oldFriend.stage}`);
  }
}

console.log('\nFriendships require maintenance!\n');

// ============================================================================
// EXAMPLE 6: INTERACTION FREQUENCY MANAGEMENT
// ============================================================================

console.log('\n=== EXAMPLE 6: INTERACTION FREQUENCY MANAGEMENT ===\n');

const freqBot = new SocialIntelligence('freq-test', 'settler', socialPersonality);

// Create relationships at different stages
freqBot.recordInteraction('stranger-1', 'Stranger', InteractionType.GREETING, true);

for (let i = 0; i < 5; i++) {
  freqBot.recordInteraction('acquaintance-1', 'Acquaintance', InteractionType.CHAT, true);
}

for (let i = 0; i < 15; i++) {
  freqBot.recordInteraction('friend-1', 'Friend', InteractionType.CHAT, true);
}
freqBot.getRelationship('friend-1', 'Friend').stage = RelationshipStage.FRIEND;

for (let i = 0; i < 30; i++) {
  freqBot.recordInteraction('bestie-1', 'Best Friend', InteractionType.CHAT, true);
}
freqBot.getRelationship('bestie-1', 'Best Friend').stage = RelationshipStage.CLOSE_FRIEND;

console.log('Interaction frequency by relationship stage:');
console.log(`Stranger: ${freqBot.getInteractionFrequency('stranger-1').toFixed(2)}x`);
console.log(`Acquaintance: ${freqBot.getInteractionFrequency('acquaintance-1').toFixed(2)}x`);
console.log(`Friend: ${freqBot.getInteractionFrequency('friend-1').toFixed(2)}x`);
console.log(`Close Friend: ${freqBot.getInteractionFrequency('bestie-1').toFixed(2)}x\n`);

console.log('Recommended delay until next interaction:');
console.log(`Stranger: ${freqBot.getNextInteractionDelay('stranger-1').toFixed(0)} minutes`);
console.log(`Acquaintance: ${freqBot.getNextInteractionDelay('acquaintance-1').toFixed(0)} minutes`);
console.log(`Friend: ${freqBot.getNextInteractionDelay('friend-1').toFixed(0)} minutes`);
console.log(`Close Friend: ${freqBot.getNextInteractionDelay('bestie-1').toFixed(0)} minutes\n`);

// ============================================================================
// EXAMPLE 7: CONTEXT-AWARE ACTION SELECTION
// ============================================================================

console.log('\n=== EXAMPLE 7: CONTEXT-AWARE ACTION SELECTION ===\n');

// Build up some relationships
const actionBot = new SocialIntelligence('action-test', 'settler', socialPersonality);

// Low affinity stranger
actionBot.recordInteraction('stranger-x', 'Stranger X', InteractionType.GREETING, true);

// High affinity potential friend
for (let i = 0; i < 8; i++) {
  actionBot.recordInteraction('potential-friend', 'Potential Friend', InteractionType.CHAT, true);
}

// Existing friend
for (let i = 0; i < 20; i++) {
  actionBot.recordInteraction('existing-friend', 'Existing Friend', InteractionType.CHAT, true);
}
actionBot.getRelationship('existing-friend', 'Existing Friend').stage = RelationshipStage.FRIEND;

const context = {
  nearbyCharacters: [
    {
      characterId: 'stranger-x',
      characterName: 'Stranger X',
      faction: 'settler',
      level: 5
    },
    {
      characterId: 'potential-friend',
      characterName: 'Potential Friend',
      faction: 'settler',
      level: 6,
      mutualFriends: 2
    },
    {
      characterId: 'existing-friend',
      characterName: 'Existing Friend',
      faction: 'settler',
      level: 7
    }
  ],
  currentCharacter: {
    characterId: 'action-test',
    faction: 'settler',
    level: 6,
    energy: 80,
    gold: 500
  },
  availableGangs: [desertRiders]
};

const recommendedAction = actionBot.selectSocialAction(context);
console.log('Given multiple characters nearby, bot recommends:');
console.log(`Action: ${recommendedAction?.type}`);
console.log(`Target: ${recommendedAction?.targetName}`);
console.log(`Priority: ${recommendedAction?.priority}\n`);

// ============================================================================
// EXAMPLE 8: SOCIAL STATISTICS AND REPORTING
// ============================================================================

console.log('\n=== EXAMPLE 8: SOCIAL STATISTICS AND REPORTING ===\n');

// Create a bot with diverse relationships
const statsBot = new SocialIntelligence('stats-test', 'settler', socialPersonality, 'gang-001');

// Create various relationships
const characters = [
  { id: 'char-1', name: 'Alice', interactions: 5, positive: true },
  { id: 'char-2', name: 'Bob', interactions: 15, positive: true },
  { id: 'char-3', name: 'Charlie', interactions: 25, positive: true },
  { id: 'char-4', name: 'Dave', interactions: 40, positive: true },
  { id: 'char-5', name: 'Eve', interactions: 8, positive: true },
  { id: 'char-6', name: 'Frank', interactions: 3, positive: false },
  { id: 'char-7', name: 'Grace', interactions: 12, positive: true }
];

for (const char of characters) {
  for (let i = 0; i < char.interactions; i++) {
    statsBot.recordInteraction(
      char.id,
      char.name,
      i % 3 === 0 ? InteractionType.CHAT : InteractionType.QUEST_TOGETHER,
      char.positive
    );
  }
}

// Manually set stages for demonstration
statsBot.getRelationship('char-2', 'Bob').stage = RelationshipStage.ACQUAINTANCE;
statsBot.getRelationship('char-3', 'Charlie').stage = RelationshipStage.FRIEND;
statsBot.getRelationship('char-4', 'Dave').stage = RelationshipStage.CLOSE_FRIEND;
statsBot.getRelationship('char-6', 'Frank').stage = RelationshipStage.BLOCKED;

console.log(statsBot.getSocialNetworkReport());

// ============================================================================
// EXAMPLE 9: COMPLETE BOT SIMULATION
// ============================================================================

console.log('\n=== EXAMPLE 9: COMPLETE BOT SIMULATION ===\n');

function simulateBotDay(bot: SocialIntelligence, dayNumber: number) {
  console.log(`--- Day ${dayNumber} ---`);

  // Morning: Check relationships and decay
  bot.decayRelationships();

  // Simulate encounters throughout the day
  const encounters = [
    { id: 'regular-1', name: 'Regular Joe', faction: 'settler' },
    { id: 'regular-2', name: 'Sally', faction: 'settler' },
    { id: 'stranger-new', name: `Stranger ${dayNumber}`, faction: 'outlaw' }
  ];

  for (const encounter of encounters) {
    // Decide whether to interact
    const frequency = bot.getInteractionFrequency(encounter.id);

    if (Math.random() < frequency * 0.3) { // 30% chance scaled by frequency
      const interactionTypes = [
        InteractionType.GREETING,
        InteractionType.CHAT,
        InteractionType.HELP
      ];

      const type = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
      bot.recordInteraction(encounter.id, encounter.name, type, true);

      console.log(`  Interacted with ${encounter.name} (${type})`);

      // Check if should send friend request
      if (bot.shouldSendFriendRequest({
        characterId: encounter.id,
        characterName: encounter.name,
        faction: encounter.faction,
        level: 5
      })) {
        console.log(`  → Sent friend request to ${encounter.name}!`);
        bot.getRelationship(encounter.id, encounter.name).friendRequestPending = true;
      }
    }
  }

  const stats = bot.getSocialStats();
  console.log(`  Friends: ${stats.friends}, Acquaintances: ${stats.acquaintances}`);
  console.log('');
}

const simBot = new SocialIntelligence('sim-bot', 'settler', socialPersonality);

// Simulate 7 days
for (let day = 1; day <= 7; day++) {
  simulateBotDay(simBot, day);
}

console.log('Final social network:');
console.log(simBot.getSocialNetworkReport());

// ============================================================================
// EXAMPLE 10: PERSONALITY IMPACT ON SOCIAL BEHAVIOR
// ============================================================================

console.log('\n=== EXAMPLE 10: PERSONALITY IMPACT ON SOCIAL BEHAVIOR ===\n');

const archetypes = ['social', 'grinder', 'explorer', 'combat', 'roleplayer'];
const socialBehaviors: Record<string, any> = {};

for (const archetype of archetypes) {
  const personality = PersonalitySystem.createPersonality(archetype);
  const bot = new SocialIntelligence(`${archetype}-bot`, 'settler', personality);

  // Simulate 10 interactions with same character
  for (let i = 0; i < 10; i++) {
    bot.recordInteraction('test-char', 'Test Character', InteractionType.CHAT, true);
  }

  const testProfile: CharacterSocialProfile = {
    characterId: 'test-char',
    characterName: 'Test Character',
    faction: 'settler',
    level: 5
  };

  const gangTestProfile: GangInfo = {
    gangId: 'test-gang',
    gangName: 'Test Gang',
    gangTag: 'TEST',
    memberCount: 15,
    level: 5,
    faction: 'settler',
    reputation: 0.7
  };

  socialBehaviors[archetype] = {
    sendFriendRequest: bot.shouldSendFriendRequest(testProfile),
    joinGang: bot.shouldJoinGang(gangTestProfile),
    chatFrequency: bot.getInteractionFrequency('test-char')
  };
}

console.log('Personality Impact on Social Decisions:');
console.log('(After 10 identical interactions with same character)\n');

console.log('Archetype      | Friend Request | Join Gang | Chat Frequency');
console.log('---------------|----------------|-----------|---------------');
for (const [archetype, behavior] of Object.entries(socialBehaviors)) {
  const padded = archetype.padEnd(14);
  const request = behavior.sendFriendRequest ? 'YES' : 'NO ';
  const gang = behavior.joinGang ? 'YES' : 'NO ';
  const freq = behavior.chatFrequency.toFixed(2);
  console.log(`${padded} | ${request}            | ${gang}       | ${freq}x`);
}

console.log('\nObservations:');
console.log('- Social: Most likely to send requests and join gangs');
console.log('- Grinder: Least social, sees friends as time waste');
console.log('- Explorer: Independent, lower gang interest');
console.log('- Combat: Moderate social, values combat bonds');
console.log('- Roleplayer: High social for immersion\n');

console.log('=== ALL EXAMPLES COMPLETE ===');
console.log('\nKey Takeaways:');
console.log('1. Relationships progress naturally through stages');
console.log('2. Faction alignment affects initial affinity');
console.log('3. Personality drives social decision-making');
console.log('4. Gang membership creates stronger bonds');
console.log('5. Relationships decay without interaction');
console.log('6. Interaction frequency varies by relationship stage');
console.log('7. Context-aware action selection feels intelligent');
console.log('8. Statistics enable social network analysis');
console.log('9. Complete bot simulation shows emergent behavior');
console.log('10. Different personalities create diverse social patterns\n');
