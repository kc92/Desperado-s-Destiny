/**
 * SocialIntelligence.test.ts
 *
 * Test suite for SocialIntelligence system
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
// TEST UTILITIES
// ============================================================================

function assertApproxEqual(actual: number, expected: number, tolerance: number = 5, message?: string): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `${message || 'Assertion failed'}: Expected ${expected} (±${tolerance}), got ${actual}`
    );
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

let testsPassed = 0;
let testsFailed = 0;

function runTest(name: string, testFn: () => void): void {
  try {
    testFn();
    testsPassed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    testsFailed++;
    console.error(`✗ ${name}`);
    console.error(`  ${error}`);
  }
}

// ============================================================================
// TESTS: RELATIONSHIP MANAGEMENT
// ============================================================================

console.log('\n=== RELATIONSHIP MANAGEMENT TESTS ===\n');

runTest('Creates new relationships as strangers', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-1', 'settler', personality);

  const relationship = social.getRelationship('char-1', 'Character 1', 'settler');

  assert(relationship.stage === RelationshipStage.STRANGER, 'Should start as stranger');
  assert(relationship.affinity === 0, 'Should start with 0 affinity');
  assert(relationship.interactionCount === 0, 'Should start with 0 interactions');
  assert(relationship.trust === 0, 'Should start with 0 trust');
});

runTest('Records interactions correctly', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-2', 'settler', personality);

  social.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);

  const relationship = social.getRelationship('char-1', 'Character 1');

  assert(relationship.interactionCount === 1, 'Should have 1 interaction');
  assert(relationship.affinity > 0, 'Affinity should increase');
  assert(relationship.recentInteractions.length === 1, 'Should record interaction');
});

runTest('Progresses through relationship stages', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-3', 'settler', personality);

  // Start as stranger
  let relationship = social.getRelationship('char-1', 'Character 1');
  assert(relationship.stage === RelationshipStage.STRANGER, 'Should start as stranger');

  // Build to acquaintance
  for (let i = 0; i < 10; i++) {
    social.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);
  }
  relationship = social.getRelationship('char-1', 'Character 1');
  assert(relationship.stage === RelationshipStage.ACQUAINTANCE, 'Should become acquaintance');

  // Build to friend
  for (let i = 0; i < 15; i++) {
    social.recordInteraction('char-1', 'Character 1', InteractionType.QUEST_TOGETHER, true);
  }
  relationship = social.getRelationship('char-1', 'Character 1');
  assert(relationship.stage === RelationshipStage.FRIEND, 'Should become friend');
});

runTest('Builds trust over time', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-4', 'settler', personality);

  for (let i = 0; i < 20; i++) {
    social.recordInteraction('char-1', 'Character 1', InteractionType.HELP, true);
  }

  const relationship = social.getRelationship('char-1', 'Character 1');
  assert(relationship.trust > 0.3, `Trust should build over time (got ${relationship.trust})`);
});

runTest('Decreases trust on negative interactions', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-5', 'settler', personality);

  // Build trust
  for (let i = 0; i < 10; i++) {
    social.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);
  }

  const trustBefore = social.getRelationship('char-1', 'Character 1').trust;

  // Negative interaction
  social.recordInteraction('char-1', 'Character 1', InteractionType.CONFLICT, false);

  const trustAfter = social.getRelationship('char-1', 'Character 1').trust;
  assert(trustAfter < trustBefore, 'Trust should decrease on negative interaction');
});

runTest('Limits recent interactions to 20', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-6', 'settler', personality);

  for (let i = 0; i < 30; i++) {
    social.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);
  }

  const relationship = social.getRelationship('char-1', 'Character 1');
  assert(relationship.recentInteractions.length === 20, 'Should keep only 20 recent interactions');
});

// ============================================================================
// TESTS: AFFINITY CALCULATION
// ============================================================================

console.log('\n=== AFFINITY CALCULATION TESTS ===\n');

runTest('Same faction gives affinity bonus', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-7', 'settler', personality);

  const sameFactionAffinity = social.calculateInitialAffinity({
    characterId: 'char-1',
    characterName: 'Same Faction',
    faction: 'settler',
    level: 5
  });

  const diffFactionAffinity = social.calculateInitialAffinity({
    characterId: 'char-2',
    characterName: 'Diff Faction',
    faction: 'outlaw',
    level: 5
  });

  assert(sameFactionAffinity > diffFactionAffinity, 'Same faction should have higher initial affinity');
});

runTest('Same gang gives large affinity bonus', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-8', 'settler', personality, 'gang-123');

  const sameGangAffinity = social.calculateInitialAffinity({
    characterId: 'char-1',
    characterName: 'Gang Mate',
    faction: 'settler',
    level: 5,
    gangId: 'gang-123'
  });

  const noGangAffinity = social.calculateInitialAffinity({
    characterId: 'char-2',
    characterName: 'Solo Player',
    faction: 'settler',
    level: 5
  });

  assert(sameGangAffinity > noGangAffinity + 20, 'Same gang should give large bonus');
});

runTest('Different interaction types give different affinity gains', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-9', 'settler', personality);

  social.recordInteraction('char-1', 'Char 1', InteractionType.GREETING, true);
  const greetingAffinity = social.getRelationship('char-1', 'Char 1').affinity;

  social.recordInteraction('char-2', 'Char 2', InteractionType.GIFT, true);
  const giftAffinity = social.getRelationship('char-2', 'Char 2').affinity;

  assert(giftAffinity > greetingAffinity * 2, 'Gift should give more affinity than greeting');
});

runTest('Negative interactions decrease affinity', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-10', 'settler', personality);

  social.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);
  const affinityBefore = social.getRelationship('char-1', 'Character 1').affinity;

  social.recordInteraction('char-1', 'Character 1', InteractionType.CONFLICT, false);
  const affinityAfter = social.getRelationship('char-1', 'Character 1').affinity;

  assert(affinityAfter < affinityBefore, 'Conflict should decrease affinity');
});

// ============================================================================
// TESTS: FRIEND REQUEST LOGIC
// ============================================================================

console.log('\n=== FRIEND REQUEST LOGIC TESTS ===\n');

runTest('Requires minimum affinity for friend request', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-11', 'settler', personality);

  // Low affinity
  social.recordInteraction('char-1', 'Character 1', InteractionType.GREETING, true);

  const shouldRequest = social.shouldSendFriendRequest({
    characterId: 'char-1',
    characterName: 'Character 1',
    faction: 'settler',
    level: 5
  });

  assert(!shouldRequest, 'Should not send request with low affinity');
});

runTest('Requires minimum interactions for friend request', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-12', 'settler', personality);

  // Only 1 interaction but high affinity
  social.recordInteraction('char-1', 'Character 1', InteractionType.GIFT, true);
  social.recordInteraction('char-1', 'Character 1', InteractionType.GIFT, true);

  const relationship = social.getRelationship('char-1', 'Character 1');
  assert(relationship.affinity >= 30, 'Should have sufficient affinity');

  const shouldRequest = social.shouldSendFriendRequest({
    characterId: 'char-1',
    characterName: 'Character 1',
    faction: 'settler',
    level: 5
  });

  // With only 2 interactions, even high affinity shouldn't trigger (needs 3+)
  assert(!shouldRequest, 'Should require minimum 3 interactions');
});

runTest('Social personality more likely to send friend requests', () => {
  const socialPersonality = PersonalitySystem.createPersonality('social');
  const grinderPersonality = PersonalitySystem.createPersonality('grinder');

  const socialBot = new SocialIntelligence('social-bot', 'settler', socialPersonality);
  const grinderBot = new SocialIntelligence('grinder-bot', 'settler', grinderPersonality);

  // Same interactions for both
  for (let i = 0; i < 8; i++) {
    socialBot.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);
    grinderBot.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);
  }

  const profile: CharacterSocialProfile = {
    characterId: 'char-1',
    characterName: 'Character 1',
    faction: 'settler',
    level: 5
  };

  // Run multiple times to account for randomness
  let socialRequests = 0;
  let grinderRequests = 0;

  for (let i = 0; i < 100; i++) {
    if (socialBot.shouldSendFriendRequest(profile)) socialRequests++;
    if (grinderBot.shouldSendFriendRequest(profile)) grinderRequests++;
  }

  assert(socialRequests > grinderRequests, 'Social personality should send more friend requests');
});

runTest('Accepts friend requests based on affinity', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-13', 'settler', personality);

  // Build high affinity
  for (let i = 0; i < 15; i++) {
    social.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);
  }

  const highAffinityProfile: CharacterSocialProfile = {
    characterId: 'char-1',
    characterName: 'Character 1',
    faction: 'settler',
    level: 5
  };

  const lowAffinityProfile: CharacterSocialProfile = {
    characterId: 'char-2',
    characterName: 'Character 2',
    faction: 'settler',
    level: 5
  };

  // Test multiple times for probability
  let highAccepts = 0;
  let lowAccepts = 0;

  for (let i = 0; i < 100; i++) {
    if (social.shouldAcceptFriendRequest(highAffinityProfile)) highAccepts++;
    if (social.shouldAcceptFriendRequest(lowAffinityProfile)) lowAccepts++;
  }

  assert(highAccepts > lowAccepts, 'Should accept more high-affinity requests');
});

// ============================================================================
// TESTS: GANG LOGIC
// ============================================================================

console.log('\n=== GANG LOGIC TESTS ===\n');

runTest('Evaluates gang based on faction alignment', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-14', 'settler', personality);

  const sameFactionGang: GangInfo = {
    gangId: 'gang-1',
    gangName: 'Settler Gang',
    gangTag: 'STLR',
    memberCount: 15,
    level: 5,
    faction: 'settler',
    reputation: 0.7
  };

  const diffFactionGang: GangInfo = {
    gangId: 'gang-2',
    gangName: 'Outlaw Gang',
    gangTag: 'OUTL',
    memberCount: 15,
    level: 5,
    faction: 'outlaw',
    reputation: 0.7
  };

  // Test multiple times for probability
  let sameFactionJoins = 0;
  let diffFactionJoins = 0;

  for (let i = 0; i < 100; i++) {
    if (social.shouldJoinGang(sameFactionGang)) sameFactionJoins++;
    if (social.shouldJoinGang(diffFactionGang)) diffFactionJoins++;
  }

  assert(sameFactionJoins > diffFactionJoins, 'Should prefer same-faction gangs');
});

runTest('Social personality more likely to join gangs', () => {
  const socialPersonality = PersonalitySystem.createPersonality('social');
  const explorerPersonality = PersonalitySystem.createPersonality('explorer');

  const socialBot = new SocialIntelligence('social-bot', 'settler', socialPersonality);
  const explorerBot = new SocialIntelligence('explorer-bot', 'settler', explorerPersonality);

  const gang: GangInfo = {
    gangId: 'gang-1',
    gangName: 'Test Gang',
    gangTag: 'TEST',
    memberCount: 15,
    level: 5,
    faction: 'settler',
    reputation: 0.7
  };

  let socialJoins = 0;
  let explorerJoins = 0;

  for (let i = 0; i < 100; i++) {
    if (socialBot.shouldJoinGang(gang)) socialJoins++;
    if (explorerBot.shouldJoinGang(gang)) explorerJoins++;
  }

  assert(socialJoins > explorerJoins, 'Social personality should join gangs more often');
});

runTest('Does not join gang if already in one', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-15', 'settler', personality, 'existing-gang');

  const gang: GangInfo = {
    gangId: 'gang-1',
    gangName: 'New Gang',
    gangTag: 'NEW',
    memberCount: 15,
    level: 5,
    faction: 'settler',
    reputation: 0.9
  };

  const shouldJoin = social.shouldJoinGang(gang);
  assert(!shouldJoin, 'Should not join if already in a gang');
});

// ============================================================================
// TESTS: INTERACTION FREQUENCY
// ============================================================================

console.log('\n=== INTERACTION FREQUENCY TESTS ===\n');

runTest('Frequency increases with relationship stage', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-16', 'settler', personality);

  // Create relationships at different stages
  social.recordInteraction('stranger', 'Stranger', InteractionType.GREETING, true);

  for (let i = 0; i < 5; i++) {
    social.recordInteraction('acquaintance', 'Acquaintance', InteractionType.CHAT, true);
  }

  for (let i = 0; i < 20; i++) {
    social.recordInteraction('friend', 'Friend', InteractionType.CHAT, true);
  }
  social.getRelationship('friend', 'Friend').stage = RelationshipStage.FRIEND;

  const strangerFreq = social.getInteractionFrequency('stranger');
  const acquaintanceFreq = social.getInteractionFrequency('acquaintance');
  const friendFreq = social.getInteractionFrequency('friend');

  assert(acquaintanceFreq > strangerFreq, 'Acquaintance should have higher frequency');
  assert(friendFreq > acquaintanceFreq, 'Friend should have higher frequency');
});

runTest('Same gang increases interaction frequency', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-17', 'settler', personality, 'gang-123');

  social.recordInteraction('gang-mate', 'Gang Mate', InteractionType.GREETING, true);
  social.recordInteraction('non-gang', 'Non Gang', InteractionType.GREETING, true);

  social.getRelationship('gang-mate', 'Gang Mate').sameGang = true;

  const gangFreq = social.getInteractionFrequency('gang-mate');
  const nonGangFreq = social.getInteractionFrequency('non-gang');

  assert(gangFreq > nonGangFreq, 'Gang members should have higher interaction frequency');
});

runTest('Next interaction delay inversely proportional to frequency', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-18', 'settler', personality);

  for (let i = 0; i < 30; i++) {
    social.recordInteraction('close-friend', 'Close Friend', InteractionType.CHAT, true);
  }
  social.getRelationship('close-friend', 'Close Friend').stage = RelationshipStage.CLOSE_FRIEND;

  social.recordInteraction('stranger', 'Stranger', InteractionType.GREETING, true);

  const closeDelay = social.getNextInteractionDelay('close-friend');
  const strangerDelay = social.getNextInteractionDelay('stranger');

  assert(strangerDelay > closeDelay, 'Stranger should have longer delay');
});

// ============================================================================
// TESTS: RELATIONSHIP DECAY
// ============================================================================

console.log('\n=== RELATIONSHIP DECAY TESTS ===\n');

runTest('Relationships decay over time', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-19', 'settler', personality);

  // Build relationship
  for (let i = 0; i < 15; i++) {
    social.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);
  }

  const affinityBefore = social.getRelationship('char-1', 'Character 1').affinity;

  // Simulate time passing
  const relationship = social.getRelationship('char-1', 'Character 1');
  relationship.lastInteractionAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

  social.decayRelationships();

  const affinityAfter = social.getRelationship('char-1', 'Character 1').affinity;

  assert(affinityAfter < affinityBefore, 'Affinity should decay over time');
});

runTest('Can drop relationship stages due to decay', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-20', 'settler', personality);

  // Build to friend
  for (let i = 0; i < 25; i++) {
    social.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);
  }

  const relationship = social.getRelationship('char-1', 'Character 1');
  assert(relationship.stage === RelationshipStage.FRIEND, 'Should start as friend');

  // Simulate long time passing
  relationship.lastInteractionAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

  social.decayRelationships();

  const newStage = social.getRelationship('char-1', 'Character 1').stage;
  assert(newStage !== RelationshipStage.FRIEND, 'Should drop from friend stage');
});

// ============================================================================
// TESTS: STATISTICS
// ============================================================================

console.log('\n=== STATISTICS TESTS ===\n');

runTest('Calculates social stats correctly', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-21', 'settler', personality);

  // Create various relationships
  for (let i = 0; i < 3; i++) {
    social.recordInteraction(`stranger-${i}`, `Stranger ${i}`, InteractionType.GREETING, true);
  }

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      social.recordInteraction(`acquaintance-${i}`, `Acquaintance ${i}`, InteractionType.CHAT, true);
    }
  }

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 20; j++) {
      social.recordInteraction(`friend-${i}`, `Friend ${i}`, InteractionType.CHAT, true);
    }
    social.getRelationship(`friend-${i}`, `Friend ${i}`).stage = RelationshipStage.FRIEND;
  }

  const stats = social.getSocialStats();

  assert(stats.strangers === 3, `Should have 3 strangers (got ${stats.strangers})`);
  assert(stats.acquaintances === 5, `Should have 5 acquaintances (got ${stats.acquaintances})`);
  assert(stats.friends === 2, `Should have 2 friends (got ${stats.friends})`);
  assert(stats.totalRelationships === 10, `Should have 10 total (got ${stats.totalRelationships})`);
});

runTest('Generates social network report', () => {
  const personality = PersonalitySystem.createPersonality('social');
  const social = new SocialIntelligence('test-22', 'settler', personality);

  for (let i = 0; i < 5; i++) {
    social.recordInteraction('char-1', 'Character 1', InteractionType.CHAT, true);
  }

  const report = social.getSocialNetworkReport();

  assert(report.includes('SOCIAL NETWORK REPORT'), 'Should include report header');
  assert(report.includes('settler'), 'Should include faction');
  assert(report.includes('social'), 'Should include personality');
});

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log('\n=== TEST SUMMARY ===\n');
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All tests passed!');
} else {
  console.log(`\n✗ ${testsFailed} test(s) failed`);
  process.exit(1);
}
