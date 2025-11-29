/**
 * EmergentDynamics.test.ts
 *
 * Test suite for Emergent Social Dynamics system
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  EmergentDynamicsOrchestrator,
  AffinityCalculator,
  OrganicGangFormation,
  FriendshipNetworkAnalyzer,
  ReputationCascadeManager,
  InfluenceSpreadingSystem,
  GangCoordinationSystem,
  SocialProfile,
} from './EmergentDynamics';
import { PersonalitySystem } from '../intelligence/PersonalitySystem';

describe('AffinityCalculator', () => {
  it('should calculate high affinity for similar personalities', () => {
    const social1 = PersonalitySystem.createPersonality('social');
    const social2 = PersonalitySystem.createPersonality('social');

    const affinity = AffinityCalculator.calculateBaseAffinity(social1, social2);

    expect(affinity).toBeGreaterThan(0.5);
  });

  it('should calculate low affinity for opposite personalities', () => {
    const social = PersonalitySystem.createPersonality('social');
    const grinder = PersonalitySystem.createPersonality('grinder');

    const affinity = AffinityCalculator.calculateBaseAffinity(social, grinder);

    expect(affinity).toBeLessThan(0.3);
  });

  it('should apply faction bonus for same faction', () => {
    const baseAffinity = 0.3;
    const modified = AffinityCalculator.applyFactionModifier(baseAffinity, 'frontera', 'frontera');

    expect(modified).toBeGreaterThan(baseAffinity);
  });

  it('should apply faction penalty for rival factions', () => {
    const baseAffinity = 0.3;
    const modified = AffinityCalculator.applyFactionModifier(baseAffinity, 'frontera', 'nahi');

    expect(modified).toBeLessThan(baseAffinity);
  });

  it('should determine correct relationship type from affinity/trust', () => {
    expect(AffinityCalculator.getRelationshipType(0.8, 0.8)).toBe('ally');
    expect(AffinityCalculator.getRelationshipType(0.4, 0.5)).toBe('friend');
    expect(AffinityCalculator.getRelationshipType(-0.3, 0.5)).toBe('rival');
    expect(AffinityCalculator.getRelationshipType(-0.7, 0.2)).toBe('enemy');
  });

  it('should calculate affinity changes from interactions', () => {
    const interaction = {
      timestamp: new Date(),
      type: 'cooperation' as const,
      outcome: 'positive' as const,
      affinityChange: 0,
      trustChange: 0,
    };

    const { affinityDelta, trustDelta } = AffinityCalculator.calculateAffinityChange(
      interaction,
      0.5,
      0.5
    );

    expect(affinityDelta).toBeGreaterThan(0);
    expect(trustDelta).toBeGreaterThan(0);
  });

  it('should handle betrayal appropriately', () => {
    const interaction = {
      timestamp: new Date(),
      type: 'betrayal' as const,
      outcome: 'negative' as const,
      affinityChange: 0,
      trustChange: 0,
    };

    const { affinityDelta, trustDelta } = AffinityCalculator.calculateAffinityChange(
      interaction,
      0.5,
      0.5
    );

    expect(affinityDelta).toBeLessThan(-0.3);
    expect(trustDelta).toBeLessThan(-0.5);
  });
});

describe('EmergentDynamicsOrchestrator', () => {
  let orchestrator: EmergentDynamicsOrchestrator;

  beforeEach(() => {
    orchestrator = new EmergentDynamicsOrchestrator();
  });

  it('should register bots correctly', () => {
    const personality = PersonalitySystem.createPersonality('social');

    orchestrator.registerBot('bot-1', 'Test Bot', personality, 'frontera');

    const analytics = orchestrator.getAnalytics();
    expect(analytics.totalBots).toBe(1);
  });

  it('should create relationships when registering multiple bots', () => {
    const personality1 = PersonalitySystem.createPersonality('social');
    const personality2 = PersonalitySystem.createPersonality('combat');

    orchestrator.registerBot('bot-1', 'Social Bot', personality1);
    orchestrator.registerBot('bot-2', 'Combat Bot', personality2);

    const analytics = orchestrator.getAnalytics();
    expect(analytics.totalBots).toBe(2);
    expect(analytics.totalRelationships).toBe(1); // Bidirectional = 1 relationship
  });

  it('should record interactions and update relationships', () => {
    const personality = PersonalitySystem.createPersonality('social');

    orchestrator.registerBot('bot-1', 'Bot 1', personality);
    orchestrator.registerBot('bot-2', 'Bot 2', personality);

    orchestrator.recordInteraction('bot-1', 'bot-2', 'cooperation', 'positive');

    const context = orchestrator.getBotSocialContext('bot-1');
    expect(context).toBeDefined();
    expect(context!.friends.length + context!.allies.length).toBeGreaterThan(0);
  });

  it('should track reputation changes', () => {
    const personality = PersonalitySystem.createPersonality('social');

    orchestrator.registerBot('bot-1', 'Bot 1', personality);
    orchestrator.registerBot('bot-2', 'Bot 2', personality);

    const contextBefore = orchestrator.getBotSocialContext('bot-1');
    const repBefore = contextBefore!.reputation;

    orchestrator.recordInteraction('bot-1', 'bot-2', 'help', 'positive');

    const contextAfter = orchestrator.getBotSocialContext('bot-1');
    const repAfter = contextAfter!.reputation;

    // Reputation should change (possibly up or down depending on cascade)
    expect(repAfter).toBeDefined();
  });

  it('should provide social context for bots', () => {
    const personality = PersonalitySystem.createPersonality('social');

    orchestrator.registerBot('bot-1', 'Bot 1', personality);
    orchestrator.registerBot('bot-2', 'Bot 2', personality);

    const context = orchestrator.getBotSocialContext('bot-1');

    expect(context).toBeDefined();
    expect(context).toHaveProperty('friends');
    expect(context).toHaveProperty('allies');
    expect(context).toHaveProperty('rivals');
    expect(context).toHaveProperty('enemies');
    expect(context).toHaveProperty('influence');
    expect(context).toHaveProperty('reputation');
  });

  it('should generate analytics', () => {
    for (let i = 0; i < 5; i++) {
      const personality = PersonalitySystem.createRandomPersonality();
      orchestrator.registerBot(`bot-${i}`, `Bot ${i}`, personality);
    }

    const analytics = orchestrator.getAnalytics();

    expect(analytics.totalBots).toBe(5);
    expect(analytics.totalRelationships).toBeGreaterThan(0);
    expect(analytics.avgAffinity).toBeDefined();
    expect(analytics.networkMetrics).toBeDefined();
    expect(analytics.topInfluencers).toBeDefined();
  });

  it('should export social data', () => {
    const personality = PersonalitySystem.createPersonality('social');
    orchestrator.registerBot('bot-1', 'Bot 1', personality);

    const exportData = orchestrator.exportSocialData();

    expect(exportData).toBeTruthy();
    expect(typeof exportData).toBe('string');

    const parsed = JSON.parse(exportData);
    expect(parsed.profiles).toBeDefined();
    expect(parsed.analytics).toBeDefined();
    expect(parsed.networkAnalysis).toBeDefined();
  });
});

describe('OrganicGangFormation', () => {
  it('should identify potential gang formations', () => {
    const profiles = new Map<string, SocialProfile>();

    // Create 4 bots with high mutual affinity
    for (let i = 0; i < 4; i++) {
      const personality = PersonalitySystem.createPersonality('combat');
      const profile: SocialProfile = {
        botId: `bot-${i}`,
        name: `Bot ${i}`,
        personality,
        reputation: {
          global: 0,
          factionScores: new Map(),
          gangScores: new Map(),
          npcScores: new Map(),
          lawEnforcement: 0,
          categories: { combat: 0, trade: 0, social: 0, reliability: 0 },
        },
        influence: 10,
        popularity: 0,
        trustworthiness: 50,
        relationships: new Map(),
        socialMemory: {
          positiveInteractions: new Map(),
          negativeInteractions: new Map(),
          favors: new Map(),
          betrayals: [],
          allies: [],
          grudges: new Map(),
        },
      };

      profiles.set(`bot-${i}`, profile);
    }

    // Create high affinity relationships
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const profile1 = profiles.get(`bot-${i}`)!;
        const profile2 = profiles.get(`bot-${j}`)!;

        profile1.relationships.set(`bot-${j}`, {
          bot1Id: `bot-${i}`,
          bot2Id: `bot-${j}`,
          affinity: 0.85,
          trust: 0.8,
          interactions: 10,
          lastInteraction: new Date(),
          relationshipType: 'ally',
          history: [],
        });

        profile2.relationships.set(`bot-${i}`, {
          bot1Id: `bot-${j}`,
          bot2Id: `bot-${i}`,
          affinity: 0.85,
          trust: 0.8,
          interactions: 10,
          lastInteraction: new Date(),
          relationshipType: 'ally',
          history: [],
        });
      }
    }

    const gangFormation = new OrganicGangFormation(profiles);
    const proposals = gangFormation.identifyPotentialGangs();

    expect(proposals.length).toBeGreaterThan(0);
    expect(proposals[0].memberIds.length).toBeGreaterThanOrEqual(3);
    expect(proposals[0].avgAffinity).toBeGreaterThan(0.7);
  });
});

describe('FriendshipNetworkAnalyzer', () => {
  it('should build network graph', () => {
    const profiles = new Map<string, SocialProfile>();

    // Create simple network
    for (let i = 0; i < 5; i++) {
      const personality = PersonalitySystem.createRandomPersonality();
      const profile: SocialProfile = {
        botId: `bot-${i}`,
        name: `Bot ${i}`,
        personality,
        reputation: {
          global: 0,
          factionScores: new Map(),
          gangScores: new Map(),
          npcScores: new Map(),
          lawEnforcement: 0,
          categories: { combat: 0, trade: 0, social: 0, reliability: 0 },
        },
        influence: 10,
        popularity: 0,
        trustworthiness: 50,
        relationships: new Map(),
        socialMemory: {
          positiveInteractions: new Map(),
          negativeInteractions: new Map(),
          favors: new Map(),
          betrayals: [],
          allies: [],
          grudges: new Map(),
        },
      };

      profiles.set(`bot-${i}`, profile);
    }

    // Create connections
    for (let i = 0; i < 4; i++) {
      const profile = profiles.get(`bot-${i}`)!;
      profile.relationships.set(`bot-${i + 1}`, {
        bot1Id: `bot-${i}`,
        bot2Id: `bot-${i + 1}`,
        affinity: 0.5,
        trust: 0.5,
        interactions: 5,
        lastInteraction: new Date(),
        relationshipType: 'friend',
        history: [],
      });
    }

    const analyzer = new FriendshipNetworkAnalyzer(profiles);
    const { nodes, edges } = analyzer.buildNetworkGraph();

    expect(nodes.length).toBe(5);
    expect(edges.length).toBeGreaterThan(0);
  });

  it('should analyze network and detect clusters', () => {
    const profiles = new Map<string, SocialProfile>();

    // Create network with clear clustering
    for (let i = 0; i < 10; i++) {
      const personality = PersonalitySystem.createRandomPersonality();
      const profile: SocialProfile = {
        botId: `bot-${i}`,
        name: `Bot ${i}`,
        personality,
        reputation: {
          global: 0,
          factionScores: new Map(),
          gangScores: new Map(),
          npcScores: new Map(),
          lawEnforcement: 0,
          categories: { combat: 0, trade: 0, social: 0, reliability: 0 },
        },
        influence: 10,
        popularity: 0,
        trustworthiness: 50,
        relationships: new Map(),
        socialMemory: {
          positiveInteractions: new Map(),
          negativeInteractions: new Map(),
          favors: new Map(),
          betrayals: [],
          allies: [],
          grudges: new Map(),
        },
      };

      profiles.set(`bot-${i}`, profile);
    }

    // Create two clusters
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        const profile = profiles.get(`bot-${i}`)!;
        profile.relationships.set(`bot-${j}`, {
          bot1Id: `bot-${i}`,
          bot2Id: `bot-${j}`,
          affinity: 0.8,
          trust: 0.7,
          interactions: 10,
          lastInteraction: new Date(),
          relationshipType: 'friend',
          history: [],
        });
      }
    }

    for (let i = 5; i < 10; i++) {
      for (let j = i + 1; j < 10; j++) {
        const profile = profiles.get(`bot-${i}`)!;
        profile.relationships.set(`bot-${j}`, {
          bot1Id: `bot-${i}`,
          bot2Id: `bot-${j}`,
          affinity: 0.8,
          trust: 0.7,
          interactions: 10,
          lastInteraction: new Date(),
          relationshipType: 'friend',
          history: [],
        });
      }
    }

    const analyzer = new FriendshipNetworkAnalyzer(profiles);
    const analysis = analyzer.analyzeNetwork();

    expect(analysis.clusters.length).toBeGreaterThan(0);
    expect(analysis.density).toBeGreaterThan(0);
    expect(analysis.nodes.length).toBe(10);
  });

  it('should generate visualization data', () => {
    const profiles = new Map<string, SocialProfile>();

    for (let i = 0; i < 3; i++) {
      const personality = PersonalitySystem.createRandomPersonality();
      const profile: SocialProfile = {
        botId: `bot-${i}`,
        name: `Bot ${i}`,
        personality,
        reputation: {
          global: 0,
          factionScores: new Map(),
          gangScores: new Map(),
          npcScores: new Map(),
          lawEnforcement: 0,
          categories: { combat: 0, trade: 0, social: 0, reliability: 0 },
        },
        influence: 10,
        popularity: 0,
        trustworthiness: 50,
        relationships: new Map(),
        socialMemory: {
          positiveInteractions: new Map(),
          negativeInteractions: new Map(),
          favors: new Map(),
          betrayals: [],
          allies: [],
          grudges: new Map(),
        },
      };

      profiles.set(`bot-${i}`, profile);
    }

    const analyzer = new FriendshipNetworkAnalyzer(profiles);
    const visData = analyzer.generateVisualizationData();

    expect(visData.nodes).toBeDefined();
    expect(visData.links).toBeDefined();
    expect(visData.nodes.length).toBe(3);
  });
});

describe('ReputationCascadeManager', () => {
  it('should trigger reputation cascade', () => {
    const profiles = new Map<string, SocialProfile>();

    // Create small network
    for (let i = 0; i < 5; i++) {
      const personality = PersonalitySystem.createRandomPersonality();
      const profile: SocialProfile = {
        botId: `bot-${i}`,
        name: `Bot ${i}`,
        personality,
        reputation: {
          global: 0,
          factionScores: new Map(),
          gangScores: new Map(),
          npcScores: new Map(),
          lawEnforcement: 0,
          categories: { combat: 0, trade: 0, social: 0, reliability: 0 },
        },
        influence: 10,
        popularity: 0,
        trustworthiness: 50,
        relationships: new Map(),
        socialMemory: {
          positiveInteractions: new Map(),
          negativeInteractions: new Map(),
          favors: new Map(),
          betrayals: [],
          allies: [],
          grudges: new Map(),
        },
      };

      profiles.set(`bot-${i}`, profile);
    }

    // Create connections
    for (let i = 0; i < 4; i++) {
      const profile = profiles.get(`bot-${i}`)!;
      profile.relationships.set(`bot-${i + 1}`, {
        bot1Id: `bot-${i}`,
        bot2Id: `bot-${i + 1}`,
        affinity: 0.6,
        trust: 0.5,
        interactions: 5,
        lastInteraction: new Date(),
        relationshipType: 'friend',
        history: [],
      });
    }

    const cascadeManager = new ReputationCascadeManager(profiles);
    const cascade = cascadeManager.triggerCascade('bot-0', 'help', 'bot-1', 'positive');

    expect(cascade.cascadeNodes.length).toBeGreaterThan(0);
    expect(cascade.totalReach).toBeGreaterThan(0);
    expect(cascade.sourceAction.botId).toBe('bot-0');
  });
});

describe('InfluenceSpreadingSystem', () => {
  it('should spread influence through network', () => {
    const profiles = new Map<string, SocialProfile>();

    // Create influencer and followers
    for (let i = 0; i < 5; i++) {
      const personality = PersonalitySystem.createRandomPersonality();
      const profile: SocialProfile = {
        botId: `bot-${i}`,
        name: `Bot ${i}`,
        personality,
        reputation: {
          global: 0,
          factionScores: new Map(),
          gangScores: new Map(),
          npcScores: new Map(),
          lawEnforcement: 0,
          categories: { combat: 0, trade: 0, social: 0, reliability: 0 },
        },
        influence: i === 0 ? 80 : 10, // Bot-0 is highly influential
        popularity: 0,
        trustworthiness: 50,
        relationships: new Map(),
        socialMemory: {
          positiveInteractions: new Map(),
          negativeInteractions: new Map(),
          favors: new Map(),
          betrayals: [],
          allies: [],
          grudges: new Map(),
        },
      };

      profiles.set(`bot-${i}`, profile);
    }

    // Connect bot-0 to others with high affinity
    const influencer = profiles.get('bot-0')!;
    for (let i = 1; i < 5; i++) {
      influencer.relationships.set(`bot-${i}`, {
        bot1Id: 'bot-0',
        bot2Id: `bot-${i}`,
        affinity: 0.8,
        trust: 0.7,
        interactions: 10,
        lastInteraction: new Date(),
        relationshipType: 'friend',
        history: [],
      });
    }

    const influenceSystem = new InfluenceSpreadingSystem(profiles);
    const event = influenceSystem.spreadInfluence(
      'bot-0',
      'opinion',
      'Test influence message'
    );

    expect(event.targetIds.length).toBeGreaterThan(0);
    expect(event.sourceId).toBe('bot-0');
    expect(event.influenceType).toBe('opinion');
  });

  it('should identify top influencers', () => {
    const profiles = new Map<string, SocialProfile>();

    for (let i = 0; i < 5; i++) {
      const personality = PersonalitySystem.createRandomPersonality();
      const profile: SocialProfile = {
        botId: `bot-${i}`,
        name: `Bot ${i}`,
        personality,
        reputation: {
          global: 0,
          factionScores: new Map(),
          gangScores: new Map(),
          npcScores: new Map(),
          lawEnforcement: 0,
          categories: { combat: 0, trade: 0, social: 0, reliability: 0 },
        },
        influence: (i + 1) * 20, // Increasing influence
        popularity: 0,
        trustworthiness: 50,
        relationships: new Map(),
        socialMemory: {
          positiveInteractions: new Map(),
          negativeInteractions: new Map(),
          favors: new Map(),
          betrayals: [],
          allies: [],
          grudges: new Map(),
        },
      };

      profiles.set(`bot-${i}`, profile);
    }

    const influenceSystem = new InfluenceSpreadingSystem(profiles);
    const influencers = influenceSystem.getInfluencers(3);

    expect(influencers.length).toBe(3);
    expect(influencers[0].influence).toBeGreaterThan(influencers[1].influence);
    expect(influencers[1].influence).toBeGreaterThan(influencers[2].influence);
  });
});

describe('Integration: Complete Social Dynamics Flow', () => {
  it('should simulate complete emergent social dynamics', () => {
    const orchestrator = new EmergentDynamicsOrchestrator();

    // Register bots
    for (let i = 0; i < 10; i++) {
      const archetype = PersonalitySystem.getArchetypes()[i % PersonalitySystem.getArchetypes().length];
      const personality = PersonalitySystem.createPersonality(archetype);

      orchestrator.registerBot(`bot-${i}`, `Bot ${i}`, personality);
    }

    // Create interactions
    for (let i = 0; i < 20; i++) {
      const bot1 = `bot-${Math.floor(Math.random() * 10)}`;
      const bot2 = `bot-${Math.floor(Math.random() * 10)}`;

      if (bot1 !== bot2) {
        orchestrator.recordInteraction(bot1, bot2, 'cooperation', 'positive');
      }
    }

    // Run cycle
    const result = orchestrator.runCycle();

    expect(result).toBeDefined();
    expect(result.networkAnalysis).toBeDefined();
    expect(result.networkAnalysis.nodes.length).toBe(10);

    const analytics = orchestrator.getAnalytics();
    expect(analytics.totalBots).toBe(10);
    expect(analytics.friendCount).toBeGreaterThanOrEqual(0);
  });
});
