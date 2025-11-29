/**
 * EmergentDynamics.example.ts
 *
 * Comprehensive examples demonstrating the Emergent Social Dynamics system
 */

import {
  EmergentDynamicsOrchestrator,
  OrganicGangFormation,
  FriendshipNetworkAnalyzer,
  ReputationCascadeManager,
  InfluenceSpreadingSystem,
  GangCoordinationSystem,
  AffinityCalculator,
  SocialProfile,
} from './EmergentDynamics.js';
import { PersonalitySystem } from '../intelligence/PersonalitySystem.js';

// ============================================================================
// EXAMPLE 1: Basic Social System Setup
// ============================================================================

async function example1_BasicSetup() {
  console.log('=== Example 1: Basic Social System Setup ===\n');

  // Create the orchestrator
  const orchestrator = new EmergentDynamicsOrchestrator();

  // Register 20 bots with diverse personalities
  const botNames = [
    'Red Wolf', 'Blue Hawk', 'Silver Fox', 'Gold Eagle', 'Black Bear',
    'White Owl', 'Green Snake', 'Purple Raven', 'Brown Bull', 'Yellow Tiger',
    'Grey Coyote', 'Pink Panther', 'Orange Lion', 'Teal Shark', 'Navy Whale',
    'Crimson Dragon', 'Jade Phoenix', 'Amber Leopard', 'Ruby Falcon', 'Pearl Dove',
  ];

  const archetypes = PersonalitySystem.getArchetypes();
  const factions = ['frontera', 'nahi', 'settlers', undefined];

  for (let i = 0; i < botNames.length; i++) {
    const archetype = archetypes[i % archetypes.length];
    const personality = PersonalitySystem.createVariant(archetype);
    const faction = factions[i % factions.length];

    orchestrator.registerBot(
      `bot-${i}`,
      botNames[i],
      personality,
      faction
    );

    console.log(`Registered: ${botNames[i]} (${archetype}, ${faction || 'no faction'})`);
  }

  console.log('\nInitial analytics:');
  const analytics = orchestrator.getAnalytics();
  console.log(`  Total bots: ${analytics.totalBots}`);
  console.log(`  Total relationships: ${analytics.totalRelationships}`);
  console.log(`  Average affinity: ${(analytics.avgAffinity * 100).toFixed(1)}%`);

  return orchestrator;
}

// ============================================================================
// EXAMPLE 2: Recording Interactions and Building Relationships
// ============================================================================

async function example2_Interactions(orchestrator: EmergentDynamicsOrchestrator) {
  console.log('\n=== Example 2: Recording Interactions ===\n');

  // Simulate various interactions
  const interactions = [
    // Positive interactions
    { bot1: 'bot-0', bot2: 'bot-1', type: 'chat' as const, outcome: 'positive' as const },
    { bot1: 'bot-0', bot2: 'bot-2', type: 'cooperation' as const, outcome: 'positive' as const },
    { bot1: 'bot-1', bot2: 'bot-2', type: 'trade' as const, outcome: 'positive' as const },
    { bot1: 'bot-0', bot2: 'bot-1', type: 'help' as const, outcome: 'positive' as const },
    { bot1: 'bot-2', bot2: 'bot-3', type: 'gift' as const, outcome: 'positive' as const },

    // Combat interactions
    { bot1: 'bot-4', bot2: 'bot-5', type: 'combat' as const, outcome: 'positive' as const },
    { bot1: 'bot-4', bot2: 'bot-6', type: 'combat' as const, outcome: 'negative' as const },

    // Negative interactions
    { bot1: 'bot-7', bot2: 'bot-8', type: 'trade' as const, outcome: 'negative' as const },
    { bot1: 'bot-9', bot2: 'bot-10', type: 'betrayal' as const, outcome: 'negative' as const },

    // More positive interactions to build strong groups
    { bot1: 'bot-0', bot2: 'bot-1', type: 'cooperation' as const, outcome: 'positive' as const },
    { bot1: 'bot-0', bot2: 'bot-2', type: 'cooperation' as const, outcome: 'positive' as const },
    { bot1: 'bot-1', bot2: 'bot-2', type: 'cooperation' as const, outcome: 'positive' as const },
    { bot1: 'bot-0', bot2: 'bot-3', type: 'help' as const, outcome: 'positive' as const },
    { bot1: 'bot-1', bot2: 'bot-3', type: 'gift' as const, outcome: 'positive' as const },
    { bot1: 'bot-2', bot2: 'bot-3', type: 'cooperation' as const, outcome: 'positive' as const },
  ];

  for (const interaction of interactions) {
    orchestrator.recordInteraction(
      interaction.bot1,
      interaction.bot2,
      interaction.type,
      interaction.outcome,
      `Example interaction: ${interaction.type}`
    );

    console.log(`Interaction: ${interaction.bot1} ${interaction.type} ${interaction.bot2} (${interaction.outcome})`);
  }

  console.log('\nUpdated analytics:');
  const analytics = orchestrator.getAnalytics();
  console.log(`  Friends: ${analytics.friendCount}`);
  console.log(`  Rivals: ${analytics.rivalCount}`);

  // Check specific bot's social context
  const context = orchestrator.getBotSocialContext('bot-0');
  if (context) {
    console.log('\nBot-0 social context:');
    console.log(`  Friends: ${context.friends.length}`);
    console.log(`  Allies: ${context.allies.length}`);
    console.log(`  Influence: ${context.influence}`);
    console.log(`  Reputation: ${context.reputation}`);
  }
}

// ============================================================================
// EXAMPLE 3: Organic Gang Formation
// ============================================================================

async function example3_GangFormation(orchestrator: EmergentDynamicsOrchestrator) {
  console.log('\n=== Example 3: Organic Gang Formation ===\n');

  // Create more interactions to increase affinity
  const strongBonds = [
    ['bot-0', 'bot-1'],
    ['bot-0', 'bot-2'],
    ['bot-0', 'bot-3'],
    ['bot-1', 'bot-2'],
    ['bot-1', 'bot-3'],
    ['bot-2', 'bot-3'],
  ];

  for (const [bot1, bot2] of strongBonds) {
    for (let i = 0; i < 5; i++) {
      orchestrator.recordInteraction(
        bot1,
        bot2,
        'cooperation',
        'positive',
        'Building strong bonds'
      );
    }
  }

  // Run cycle to detect gang formations
  const result = orchestrator.runCycle();

  console.log(`Gang proposals found: ${result.gangProposals.length}\n`);

  for (const proposal of result.gangProposals) {
    console.log(`Gang Proposal:`);
    console.log(`  Name: ${proposal.suggestedName} [${proposal.suggestedTag}]`);
    console.log(`  Members: ${proposal.memberIds.length}`);
    console.log(`  Avg Affinity: ${(proposal.avgAffinity * 100).toFixed(1)}%`);
    console.log(`  Traits: ${proposal.commonPersonalityTraits.join(', ')}`);
    console.log(`  Reason: ${proposal.formationReason}\n`);
  }

  const analytics = orchestrator.getAnalytics();
  console.log(`Total gangs formed: ${analytics.gangCount}`);
}

// ============================================================================
// EXAMPLE 4: Friendship Network Analysis
// ============================================================================

async function example4_NetworkAnalysis(orchestrator: EmergentDynamicsOrchestrator) {
  console.log('\n=== Example 4: Friendship Network Analysis ===\n');

  const result = orchestrator.runCycle();
  const network = result.networkAnalysis;

  console.log('Network Metrics:');
  console.log(`  Nodes: ${network.nodes.length}`);
  console.log(`  Edges: ${network.edges.length}`);
  console.log(`  Density: ${(network.density * 100).toFixed(2)}%`);
  console.log(`  Avg Path Length: ${network.avgPathLength.toFixed(2)}`);
  console.log(`  Clustering Coefficient: ${(network.clusteringCoefficient * 100).toFixed(2)}%`);

  console.log(`\nClusters detected: ${network.clusters.length}`);
  for (const cluster of network.clusters) {
    console.log(`  ${cluster.clusterId}:`);
    console.log(`    Members: ${cluster.memberIds.length}`);
    console.log(`    Type: ${cluster.clusterType}`);
    console.log(`    Cohesion: ${(cluster.cohesion * 100).toFixed(1)}%`);
    console.log(`    Dominant Personality: ${cluster.dominantPersonality}`);
  }

  console.log(`\nCentral Nodes (influencers): ${network.centralNodes.length}`);
  console.log(`  ${network.centralNodes.slice(0, 5).join(', ')}`);

  console.log(`\nBridge Nodes (connectors): ${network.bridges.length}`);
  console.log(`  ${network.bridges.slice(0, 5).join(', ')}`);

  console.log(`\nIsolated Nodes: ${network.isolates.length}`);
  if (network.isolates.length > 0) {
    console.log(`  ${network.isolates.slice(0, 5).join(', ')}`);
  }

  // Get visualization data
  const visData = orchestrator.getVisualizationData();
  console.log(`\nVisualization ready: ${visData.nodes.length} nodes, ${visData.links.length} links`);
}

// ============================================================================
// EXAMPLE 5: Reputation Cascades
// ============================================================================

async function example5_ReputationCascades(orchestrator: EmergentDynamicsOrchestrator) {
  console.log('\n=== Example 5: Reputation Cascades ===\n');

  // Simulate a significant action
  console.log('Bot-0 performs a heroic action...');

  orchestrator.recordInteraction('bot-0', 'bot-1', 'help', 'positive', 'Heroic rescue');

  // The cascade will automatically propagate through recordInteraction
  // Let's check reputation changes

  const analytics = orchestrator.getAnalytics();
  console.log('\nTop influencers after cascade:');
  for (const influencer of analytics.topInfluencers.slice(0, 5)) {
    console.log(`  ${influencer.botId}: Influence ${influencer.influence.toFixed(1)}`);
  }

  // Simulate a betrayal cascade
  console.log('\nBot-5 betrays Bot-6...');
  orchestrator.recordInteraction('bot-5', 'bot-6', 'betrayal', 'negative', 'Trust broken');

  const context5 = orchestrator.getBotSocialContext('bot-5');
  const context6 = orchestrator.getBotSocialContext('bot-6');

  if (context5 && context6) {
    console.log(`\nBot-5 reputation: ${context5.reputation}`);
    console.log(`Bot-6 reputation: ${context6.reputation}`);
    console.log(`Bot-5 enemies: ${context5.enemies.length}`);
    console.log(`Bot-6 enemies: ${context6.enemies.length}`);
  }
}

// ============================================================================
// EXAMPLE 6: Influence Spreading
// ============================================================================

async function example6_InfluenceSpreading(orchestrator: EmergentDynamicsOrchestrator) {
  console.log('\n=== Example 6: Influence Spreading ===\n');

  // Build a network first
  for (let i = 0; i < 15; i++) {
    for (let j = i + 1; j < Math.min(i + 4, 15); j++) {
      orchestrator.recordInteraction(
        `bot-${i}`,
        `bot-${j}`,
        'chat',
        'positive',
        'Building connections'
      );
    }
  }

  const result = orchestrator.runCycle();

  console.log(`Influence events propagated: ${result.influenceEvents.length}\n`);

  for (const event of result.influenceEvents) {
    console.log(`Influence Event:`);
    console.log(`  Source: ${event.sourceId}`);
    console.log(`  Type: ${event.influenceType}`);
    console.log(`  Message: "${event.message}"`);
    console.log(`  Targets reached: ${event.targetIds.length}`);
    console.log(`  Strength: ${(event.strength * 100).toFixed(1)}%`);
    console.log(`  Depth: ${event.propagationDepth}\n`);
  }
}

// ============================================================================
// EXAMPLE 7: Gang Coordination
// ============================================================================

async function example7_GangCoordination(orchestrator: EmergentDynamicsOrchestrator) {
  console.log('\n=== Example 7: Gang Coordination ===\n');

  // First, ensure we have gangs
  const result = orchestrator.runCycle();

  if (result.gangProposals.length === 0) {
    console.log('No gangs formed yet, creating strong bonds first...\n');

    // Create tight-knit groups
    for (let group = 0; group < 3; group++) {
      const start = group * 4;
      const members = [start, start + 1, start + 2, start + 3];

      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          for (let k = 0; k < 8; k++) {
            orchestrator.recordInteraction(
              `bot-${members[i]}`,
              `bot-${members[j]}`,
              'cooperation',
              'positive',
              'Gang formation'
            );
          }
        }
      }
    }

    orchestrator.runCycle();
  }

  // Note: Full gang coordination would integrate with actual gang API
  console.log('Gang coordination system ready for integration with gang warfare system');
  console.log('Gang coordination actions would be triggered by:');
  console.log('  - Territory disputes');
  console.log('  - Resource competition');
  console.log('  - Revenge for attacks');
  console.log('  - Strategic alliances');
}

// ============================================================================
// EXAMPLE 8: Social Memory and Learning
// ============================================================================

async function example8_SocialMemory(orchestrator: EmergentDynamicsOrchestrator) {
  console.log('\n=== Example 8: Social Memory ===\n');

  // Create varied interaction history
  const bot0Context = orchestrator.getBotSocialContext('bot-0');
  const bot1Context = orchestrator.getBotSocialContext('bot-1');

  console.log('Bot-0 Social Memory:');
  if (bot0Context) {
    console.log(`  Friends: ${bot0Context.friends.join(', ')}`);
    console.log(`  Allies: ${bot0Context.allies.join(', ')}`);
    console.log(`  Rivals: ${bot0Context.rivals.join(', ')}`);
    console.log(`  Gang members: ${bot0Context.gangMembers.join(', ')}`);
  }

  // Demonstrate memory-based behavior
  console.log('\nMemory-based decision example:');
  console.log('Bot-0 deciding whether to trust Bot-1...');

  const context = orchestrator.getBotSocialContext('bot-0');
  if (context && context.friends.includes('bot-1')) {
    console.log('  Decision: TRUST (Bot-1 is a friend with positive history)');
  } else if (context && context.rivals.includes('bot-1')) {
    console.log('  Decision: DISTRUST (Bot-1 is a rival)');
  } else {
    console.log('  Decision: NEUTRAL (Limited history with Bot-1)');
  }
}

// ============================================================================
// EXAMPLE 9: Affinity Calculation
// ============================================================================

async function example9_AffinityCalculation() {
  console.log('\n=== Example 9: Affinity Calculation ===\n');

  // Create different personality types
  const combatBot = PersonalitySystem.createPersonality('combat');
  const socialBot = PersonalitySystem.createPersonality('social');
  const economistBot = PersonalitySystem.createPersonality('economist');
  const criminalBot = PersonalitySystem.createPersonality('criminal');

  console.log('Affinity Matrix:\n');

  const bots = [
    { name: 'Combat', profile: combatBot },
    { name: 'Social', profile: socialBot },
    { name: 'Economist', profile: economistBot },
    { name: 'Criminal', profile: criminalBot },
  ];

  // Calculate all pairwise affinities
  for (let i = 0; i < bots.length; i++) {
    for (let j = 0; j < bots.length; j++) {
      if (i === j) {
        console.log(`  ${bots[i].name} ↔ ${bots[j].name}: N/A`);
      } else {
        const affinity = AffinityCalculator.calculateBaseAffinity(
          bots[i].profile,
          bots[j].profile
        );
        const percentage = (affinity * 100).toFixed(0);
        const emoji = affinity > 0.5 ? '💚' : affinity > 0 ? '💛' : affinity > -0.5 ? '🧡' : '❤️';
        console.log(`  ${bots[i].name} ↔ ${bots[j].name}: ${percentage}% ${emoji}`);
      }
    }
  }

  // Faction modifiers
  console.log('\nFaction Modifier Examples:');
  const baseAffinity = 0.3;

  const sameFaction = AffinityCalculator.applyFactionModifier(baseAffinity, 'frontera', 'frontera');
  console.log(`  Same faction (Frontera): ${baseAffinity} → ${sameFaction.toFixed(2)}`);

  const rivalFaction = AffinityCalculator.applyFactionModifier(baseAffinity, 'frontera', 'nahi');
  console.log(`  Rival factions (Frontera vs Nahi): ${baseAffinity} → ${rivalFaction.toFixed(2)}`);

  const neutral = AffinityCalculator.applyFactionModifier(baseAffinity, 'frontera', 'settlers');
  console.log(`  Neutral factions (Frontera vs Settlers): ${baseAffinity} → ${neutral.toFixed(2)}`);
}

// ============================================================================
// EXAMPLE 10: Complete Simulation
// ============================================================================

async function example10_CompleteSimulation() {
  console.log('\n=== Example 10: Complete Emergent Social Simulation ===\n');

  const orchestrator = new EmergentDynamicsOrchestrator();

  // Setup phase
  console.log('PHASE 1: Setup (20 bots)');
  const botNames = [
    'Red Wolf', 'Blue Hawk', 'Silver Fox', 'Gold Eagle', 'Black Bear',
    'White Owl', 'Green Snake', 'Purple Raven', 'Brown Bull', 'Yellow Tiger',
    'Grey Coyote', 'Pink Panther', 'Orange Lion', 'Teal Shark', 'Navy Whale',
    'Crimson Dragon', 'Jade Phoenix', 'Amber Leopard', 'Ruby Falcon', 'Pearl Dove',
  ];

  const archetypes = PersonalitySystem.getArchetypes();
  const factions = ['frontera', 'nahi', 'settlers'];

  for (let i = 0; i < 20; i++) {
    const archetype = archetypes[i % archetypes.length];
    const personality = PersonalitySystem.createVariant(archetype);
    const faction = factions[i % factions.length];

    orchestrator.registerBot(`bot-${i}`, botNames[i], personality, faction);
  }

  // Interaction phase
  console.log('\nPHASE 2: Organic Interactions (100 random interactions)');
  for (let i = 0; i < 100; i++) {
    const bot1 = `bot-${Math.floor(Math.random() * 20)}`;
    const bot2 = `bot-${Math.floor(Math.random() * 20)}`;

    if (bot1 === bot2) continue;

    const types: Array<'chat' | 'trade' | 'combat' | 'cooperation' | 'help' | 'gift'> = [
      'chat', 'trade', 'combat', 'cooperation', 'help', 'gift'
    ];
    const outcomes: Array<'positive' | 'negative' | 'neutral'> = [
      'positive', 'positive', 'positive', 'negative', 'neutral'
    ]; // Weighted toward positive

    const type = types[Math.floor(Math.random() * types.length)];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    orchestrator.recordInteraction(bot1, bot2, type, outcome);
  }

  // Analysis phase
  console.log('\nPHASE 3: Running Emergent Dynamics');
  const result = orchestrator.runCycle();

  console.log('\nRESULTS:');
  console.log('--------');

  const analytics = orchestrator.getAnalytics();
  console.log(`\nSocial Network:`);
  console.log(`  Total Bots: ${analytics.totalBots}`);
  console.log(`  Total Relationships: ${analytics.totalRelationships}`);
  console.log(`  Friends: ${analytics.friendCount}`);
  console.log(`  Rivals: ${analytics.rivalCount}`);
  console.log(`  Average Affinity: ${(analytics.avgAffinity * 100).toFixed(1)}%`);

  console.log(`\nNetwork Topology:`);
  console.log(`  Density: ${(analytics.networkMetrics.density * 100).toFixed(2)}%`);
  console.log(`  Avg Path Length: ${analytics.networkMetrics.avgPathLength.toFixed(2)}`);
  console.log(`  Clustering Coeff: ${(analytics.networkMetrics.clusteringCoefficient * 100).toFixed(2)}%`);

  console.log(`\nEmergent Structures:`);
  console.log(`  Gangs Formed: ${analytics.gangCount}`);
  console.log(`  Social Clusters: ${result.networkAnalysis.clusters.length}`);

  console.log(`\nTop Influencers:`);
  for (const influencer of analytics.topInfluencers.slice(0, 5)) {
    console.log(`  ${influencer.botId}: ${influencer.influence.toFixed(1)} influence`);
  }

  console.log(`\nGang Proposals:`);
  for (const proposal of result.gangProposals.slice(0, 3)) {
    console.log(`  ${proposal.suggestedName} [${proposal.suggestedTag}]:`);
    console.log(`    Members: ${proposal.memberIds.length}`);
    console.log(`    Affinity: ${(proposal.avgAffinity * 100).toFixed(1)}%`);
    console.log(`    Type: ${proposal.commonPersonalityTraits.join(', ')}`);
  }

  console.log(`\nInfluence Events: ${result.influenceEvents.length}`);
  if (result.influenceEvents.length > 0) {
    const event = result.influenceEvents[0];
    console.log(`  Example: ${event.sourceId} reached ${event.targetIds.length} bots`);
  }

  // Export data
  console.log('\nPHASE 4: Export Data');
  const exportData = orchestrator.exportSocialData();
  console.log(`Exported ${exportData.length} characters of social data`);
  console.log('(Data includes profiles, analytics, and network topology)');

  console.log('\n=== Simulation Complete ===');
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   EMERGENT SOCIAL DYNAMICS - COMPREHENSIVE EXAMPLES        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Example 1-8: Step by step
    const orchestrator = await example1_BasicSetup();
    await example2_Interactions(orchestrator);
    await example3_GangFormation(orchestrator);
    await example4_NetworkAnalysis(orchestrator);
    await example5_ReputationCascades(orchestrator);
    await example6_InfluenceSpreading(orchestrator);
    await example7_GangCoordination(orchestrator);
    await example8_SocialMemory(orchestrator);

    // Example 9: Standalone affinity demo
    await example9_AffinityCalculation();

    // Example 10: Full simulation
    await example10_CompleteSimulation();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   ALL EXAMPLES COMPLETED SUCCESSFULLY                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export {
  example1_BasicSetup,
  example2_Interactions,
  example3_GangFormation,
  example4_NetworkAnalysis,
  example5_ReputationCascades,
  example6_InfluenceSpreading,
  example7_GangCoordination,
  example8_SocialMemory,
  example9_AffinityCalculation,
  example10_CompleteSimulation,
  runAllExamples,
};
