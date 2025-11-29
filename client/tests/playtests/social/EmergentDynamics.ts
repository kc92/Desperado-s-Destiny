/**
 * EmergentDynamics.ts - Week 5-6: Emergent Social Dynamics Architect
 *
 * Creates systems that enable emergent social behavior: organic gang formation,
 * friendship networks, reputation cascades, and social clustering.
 *
 * Features:
 * - OrganicGangFormation: Bots with high mutual affinity auto-form gangs
 * - FriendshipNetworks: Social graph visualization and analysis
 * - ReputationCascades: Actions affect standing with connected NPCs/players
 * - SocialClustering: Natural clustering by personality/faction
 * - InfluenceSpreading: Popular bots affect others' behavior
 * - GangCoordination: Gang members coordinate wars/missions
 * - SocialMemory: Bots remember interactions and adjust behavior
 */

import { PersonalityProfile, PersonalityTraits } from '../intelligence/PersonalitySystem.js';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Social relationship between two bots
 */
export interface SocialRelationship {
  bot1Id: string;
  bot2Id: string;
  affinity: number; // -1 to 1 (enemy to friend)
  trust: number; // 0 to 1
  interactions: number;
  lastInteraction: Date;
  relationshipType: 'stranger' | 'acquaintance' | 'friend' | 'rival' | 'enemy' | 'ally';
  sharedGang?: string;
  sharedFaction?: string;
  history: InteractionRecord[];
}

/**
 * Record of a single interaction
 */
export interface InteractionRecord {
  timestamp: Date;
  type: 'chat' | 'trade' | 'combat' | 'cooperation' | 'betrayal' | 'gift' | 'help';
  outcome: 'positive' | 'negative' | 'neutral';
  affinityChange: number;
  trustChange: number;
  context?: string;
}

/**
 * Bot's social profile
 */
export interface SocialProfile {
  botId: string;
  name: string;
  personality: PersonalityProfile;
  reputation: ReputationScores;
  influence: number; // 0-100, how much this bot affects others
  popularity: number; // 0-100, how liked they are
  trustworthiness: number; // 0-100, based on history
  relationships: Map<string, SocialRelationship>;
  gangAffiliation?: string;
  faction?: string;
  socialMemory: SocialMemory;
}

/**
 * Reputation scores with different groups
 */
export interface ReputationScores {
  global: number; // Overall reputation
  factionScores: Map<string, number>; // Rep with each faction
  gangScores: Map<string, number>; // Rep with each gang
  npcScores: Map<string, number>; // Rep with individual NPCs
  lawEnforcement: number; // -100 (outlaw) to 100 (lawman)
  categories: {
    combat: number;
    trade: number;
    social: number;
    reliability: number;
  };
}

/**
 * Social memory system - bots remember past interactions
 */
export interface SocialMemory {
  positiveInteractions: Map<string, InteractionRecord[]>;
  negativeInteractions: Map<string, InteractionRecord[]>;
  favors: Map<string, { given: number; received: number }>;
  betrayals: string[]; // IDs of bots who betrayed this bot
  allies: string[]; // Trusted allies
  grudges: Map<string, { reason: string; severity: number; timestamp: Date }>;
}

/**
 * Gang formation proposal
 */
export interface GangFormationProposal {
  proposerId: string;
  memberIds: string[];
  avgAffinity: number;
  commonPersonalityTraits: string[];
  suggestedName: string;
  suggestedTag: string;
  formationReason: string;
  timestamp: Date;
}

/**
 * Social network cluster
 */
export interface SocialCluster {
  clusterId: string;
  memberIds: string[];
  centerOfMass: { // Average personality traits
    riskTolerance: number;
    sociability: number;
    aggression: number;
    loyalty: number;
  };
  dominantPersonality: string;
  cohesion: number; // 0-1, how tightly clustered
  avgInfluence: number;
  clusterType: 'combat' | 'social' | 'economic' | 'criminal' | 'mixed';
}

/**
 * Influence propagation event
 */
export interface InfluenceEvent {
  sourceId: string;
  targetIds: string[];
  influenceType: 'behavior' | 'opinion' | 'action' | 'emotion';
  strength: number; // 0-1
  message: string;
  timestamp: Date;
  propagationDepth: number; // How many hops from source
}

/**
 * Gang coordination action
 */
export interface GangCoordinationAction {
  gangId: string;
  actionType: 'war' | 'raid' | 'defense' | 'recruitment' | 'mission';
  coordinatorId: string;
  participantIds: string[];
  targetGang?: string;
  targetLocation?: string;
  scheduledTime: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'active' | 'completed' | 'failed' | 'cancelled';
}

/**
 * Reputation cascade - how actions affect reputation through network
 */
export interface ReputationCascade {
  sourceAction: {
    botId: string;
    actionType: string;
    target?: string;
    outcome: 'positive' | 'negative' | 'neutral';
  };
  cascadeNodes: CascadeNode[];
  totalReach: number;
  avgImpact: number;
  timestamp: Date;
}

/**
 * Single node in reputation cascade
 */
export interface CascadeNode {
  botId: string;
  depth: number; // Degrees of separation from source
  reputationChange: number;
  relationshipChange: number;
  influenced: boolean; // Did this affect their behavior?
}

// ============================================================================
// SOCIAL AFFINITY SYSTEM
// ============================================================================

/**
 * Calculates affinity between two bots based on personality compatibility
 */
export class AffinityCalculator {
  /**
   * Calculate base affinity from personality traits
   * Returns value from -1 (incompatible) to 1 (highly compatible)
   */
  static calculateBaseAffinity(
    personality1: PersonalityProfile,
    personality2: PersonalityProfile
  ): number {
    const traits1 = personality1.traits;
    const traits2 = personality2.traits;

    let affinity = 0;
    let weightSum = 0;

    // Similar sociability creates bonds
    const sociabilityDiff = Math.abs(traits1.sociability - traits2.sociability);
    affinity += (1 - sociabilityDiff) * 3; // High weight
    weightSum += 3;

    // Similar aggression levels get along (or both peaceful)
    const aggressionDiff = Math.abs(traits1.aggression - traits2.aggression);
    affinity += (1 - aggressionDiff) * 2;
    weightSum += 2;

    // Loyalty compatibility
    const loyaltyDiff = Math.abs(traits1.loyalty - traits2.loyalty);
    affinity += (1 - loyaltyDiff) * 2;
    weightSum += 2;

    // Risk tolerance compatibility
    const riskDiff = Math.abs(traits1.riskTolerance - traits2.riskTolerance);
    affinity += (1 - riskDiff) * 1.5;
    weightSum += 1.5;

    // Patience compatibility (impatient people annoy patient people)
    const patienceDiff = Math.abs(traits1.patience - traits2.patience);
    affinity += (1 - patienceDiff) * 1;
    weightSum += 1;

    // Greed compatibility (both greedy = rivalry, one greedy + one generous = conflict)
    const greedDiff = Math.abs(traits1.greed - traits2.greed);
    if (traits1.greed > 0.7 && traits2.greed > 0.7) {
      affinity -= 1; // Both greedy = rivalry
    } else {
      affinity += (1 - greedDiff) * 1;
    }
    weightSum += 1;

    // Normalize to -1 to 1
    const normalized = (affinity / weightSum - 0.5) * 2;

    return Math.max(-1, Math.min(1, normalized));
  }

  /**
   * Modify affinity based on faction alignment
   */
  static applyFactionModifier(baseAffinity: number, faction1?: string, faction2?: string): number {
    if (!faction1 || !faction2) return baseAffinity;

    if (faction1 === faction2) {
      return baseAffinity + 0.2; // Same faction bonus
    }

    // Rival factions (could be expanded with faction rivalry matrix)
    const rivalries: Record<string, string[]> = {
      'frontera': ['nahi'],
      'nahi': ['settlers', 'frontera'],
      'settlers': ['nahi'],
    };

    if (rivalries[faction1]?.includes(faction2)) {
      return baseAffinity - 0.3; // Faction rivalry penalty
    }

    return baseAffinity;
  }

  /**
   * Calculate affinity change from an interaction
   */
  static calculateAffinityChange(
    interaction: InteractionRecord,
    currentAffinity: number,
    currentTrust: number
  ): { affinityDelta: number; trustDelta: number } {
    let affinityDelta = 0;
    let trustDelta = 0;

    switch (interaction.type) {
      case 'chat':
        affinityDelta = interaction.outcome === 'positive' ? 0.02 : -0.01;
        break;

      case 'trade':
        affinityDelta = interaction.outcome === 'positive' ? 0.05 : -0.1;
        trustDelta = interaction.outcome === 'positive' ? 0.03 : -0.15;
        break;

      case 'cooperation':
        affinityDelta = 0.08;
        trustDelta = 0.1;
        break;

      case 'combat':
        affinityDelta = interaction.outcome === 'positive' ? 0.05 : -0.2;
        trustDelta = -0.05; // Combat always reduces trust a bit
        break;

      case 'betrayal':
        affinityDelta = -0.5;
        trustDelta = -0.7;
        break;

      case 'gift':
        affinityDelta = 0.1;
        trustDelta = 0.05;
        break;

      case 'help':
        affinityDelta = 0.07;
        trustDelta = 0.08;
        break;
    }

    // Diminishing returns - harder to increase already high affinity
    if (affinityDelta > 0 && currentAffinity > 0.5) {
      affinityDelta *= (1 - currentAffinity * 0.5);
    }

    return { affinityDelta, trustDelta };
  }

  /**
   * Determine relationship type from affinity and trust
   */
  static getRelationshipType(
    affinity: number,
    trust: number
  ): 'stranger' | 'acquaintance' | 'friend' | 'rival' | 'enemy' | 'ally' {
    if (affinity < -0.5) return 'enemy';
    if (affinity < -0.2) return 'rival';
    if (affinity > 0.5 && trust > 0.6) return 'ally';
    if (affinity > 0.3) return 'friend';
    if (affinity > -0.2 && trust < 0.3) return 'acquaintance';
    return 'stranger';
  }
}

// ============================================================================
// ORGANIC GANG FORMATION
// ============================================================================

/**
 * Detects and facilitates organic gang formation based on bot affinities
 */
export class OrganicGangFormation {
  private relationships: Map<string, SocialProfile>;
  private minAffinityThreshold: number = 0.75;
  private minGroupSize: number = 3;
  private maxGroupSize: number = 8;

  constructor(relationships: Map<string, SocialProfile>) {
    this.relationships = relationships;
  }

  /**
   * Scan all relationships and identify potential gang formations
   */
  identifyPotentialGangs(): GangFormationProposal[] {
    const proposals: GangFormationProposal[] = [];
    const processed = new Set<string>();

    for (const [botId, profile] of this.relationships.entries()) {
      if (processed.has(botId)) continue;
      if (profile.gangAffiliation) continue; // Already in a gang

      const highAffinityBots = this.findHighAffinityGroup(botId);

      if (highAffinityBots.length >= this.minGroupSize) {
        const proposal = this.createGangProposal(botId, highAffinityBots);
        proposals.push(proposal);

        // Mark as processed
        processed.add(botId);
        highAffinityBots.forEach(id => processed.add(id));
      }
    }

    return proposals.sort((a, b) => b.avgAffinity - a.avgAffinity);
  }

  /**
   * Find all bots with high mutual affinity to the given bot
   */
  private findHighAffinityGroup(botId: string): string[] {
    const profile = this.relationships.get(botId);
    if (!profile) return [];

    const group: string[] = [];
    const candidates = new Map<string, number>();

    // Find all bots with high affinity to this bot
    for (const [otherId, relationship] of profile.relationships.entries()) {
      if (relationship.affinity >= this.minAffinityThreshold) {
        candidates.set(otherId, relationship.affinity);
      }
    }

    // Check mutual affinity - all members must like each other
    for (const [candidateId, affinity] of candidates.entries()) {
      if (this.hasMutualAffinity(botId, candidateId, Array.from(candidates.keys()))) {
        group.push(candidateId);
      }
    }

    return group.slice(0, this.maxGroupSize);
  }

  /**
   * Check if candidate has mutual high affinity with all group members
   */
  private hasMutualAffinity(botId: string, candidateId: string, groupIds: string[]): boolean {
    const candidateProfile = this.relationships.get(candidateId);
    if (!candidateProfile || candidateProfile.gangAffiliation) return false;

    for (const memberId of [botId, ...groupIds]) {
      if (memberId === candidateId) continue;

      const relationship = candidateProfile.relationships.get(memberId);
      if (!relationship || relationship.affinity < this.minAffinityThreshold) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create a gang formation proposal
   */
  private createGangProposal(proposerId: string, memberIds: string[]): GangFormationProposal {
    const allMembers = [proposerId, ...memberIds];
    const profiles = allMembers.map(id => this.relationships.get(id)!).filter(Boolean);

    // Calculate average affinity
    let totalAffinity = 0;
    let affinityCount = 0;
    for (let i = 0; i < allMembers.length; i++) {
      for (let j = i + 1; j < allMembers.length; j++) {
        const rel = profiles[i].relationships.get(allMembers[j]);
        if (rel) {
          totalAffinity += rel.affinity;
          affinityCount++;
        }
      }
    }
    const avgAffinity = affinityCount > 0 ? totalAffinity / affinityCount : 0;

    // Analyze common personality traits
    const commonTraits = this.analyzeCommonTraits(profiles);

    // Generate gang name based on dominant traits
    const { name, tag } = this.generateGangIdentity(profiles, commonTraits);

    // Determine formation reason
    const reason = this.determineFormationReason(profiles, commonTraits);

    return {
      proposerId,
      memberIds: allMembers,
      avgAffinity,
      commonPersonalityTraits: commonTraits,
      suggestedName: name,
      suggestedTag: tag,
      formationReason: reason,
      timestamp: new Date(),
    };
  }

  /**
   * Analyze common personality traits among group
   */
  private analyzeCommonTraits(profiles: SocialProfile[]): string[] {
    const traits: string[] = [];

    // Average traits
    const avgTraits = {
      riskTolerance: 0,
      sociability: 0,
      aggression: 0,
      greed: 0,
      loyalty: 0,
      curiosity: 0,
      patience: 0,
    };

    for (const profile of profiles) {
      Object.keys(avgTraits).forEach(key => {
        avgTraits[key as keyof typeof avgTraits] +=
          profile.personality.traits[key as keyof PersonalityTraits];
      });
    }

    Object.keys(avgTraits).forEach(key => {
      avgTraits[key as keyof typeof avgTraits] /= profiles.length;
    });

    // Identify dominant traits
    if (avgTraits.aggression > 0.7) traits.push('combative');
    if (avgTraits.riskTolerance > 0.7) traits.push('daring');
    if (avgTraits.sociability > 0.7) traits.push('social');
    if (avgTraits.greed > 0.7) traits.push('ambitious');
    if (avgTraits.loyalty > 0.7) traits.push('loyal');
    if (avgTraits.curiosity > 0.7) traits.push('exploratory');
    if (avgTraits.patience > 0.7) traits.push('strategic');

    // Check archetype clustering
    const archetypes = profiles.map(p => p.personality.archetype);
    const dominantArchetype = this.getMostCommon(archetypes);
    if (dominantArchetype) {
      traits.push(dominantArchetype);
    }

    return traits;
  }

  /**
   * Generate gang name and tag based on personality
   */
  private generateGangIdentity(
    profiles: SocialProfile[],
    traits: string[]
  ): { name: string; tag: string } {
    const nameTemplates = {
      combative: ['Iron Fists', 'Thunder Riders', 'Crimson Blades', 'Steel Wolves'],
      daring: ['Risk Takers', 'Wild Cards', 'Fortune Seekers', 'Chaos Crew'],
      social: ['Brotherhood', 'United Front', 'Circle of Trust', 'Alliance'],
      ambitious: ['Gold Rush', 'Empire Builders', 'Destiny Seekers', 'Crown Chasers'],
      loyal: ['Sworn Brothers', 'Blood Pact', 'Faithful Few', 'Honor Guard'],
      exploratory: ['Wanderers', 'Trail Blazers', 'Horizon Riders', 'Pathfinders'],
      strategic: ['Masterminds', 'Grand Scheme', 'Long Game', 'Chess Masters'],
    };

    // Pick based on dominant trait
    const dominantTrait = traits[0] as keyof typeof nameTemplates || 'social';
    const templates = nameTemplates[dominantTrait] || nameTemplates.social;
    const name = templates[Math.floor(Math.random() * templates.length)];

    // Generate tag (3-4 letters)
    const tag = name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 4);

    return { name, tag };
  }

  /**
   * Determine why this gang is forming
   */
  private determineFormationReason(profiles: SocialProfile[], traits: string[]): string {
    if (traits.includes('combative')) {
      return 'Mutual combat prowess and desire for dominance';
    }
    if (traits.includes('ambitious')) {
      return 'Shared economic goals and wealth accumulation';
    }
    if (traits.includes('social')) {
      return 'Strong friendship bonds and community values';
    }
    if (traits.includes('daring')) {
      return 'Love of risk-taking and high-stakes ventures';
    }
    if (traits.includes('loyal')) {
      return 'Deep mutual trust and shared values';
    }
    if (traits.includes('exploratory')) {
      return 'Common interest in discovery and adventure';
    }

    return 'High mutual affinity and compatible personalities';
  }

  /**
   * Helper to find most common element
   */
  private getMostCommon<T>(arr: T[]): T | null {
    const counts = new Map<T, number>();
    for (const item of arr) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }

    let maxCount = 0;
    let mostCommon: T | null = null;
    for (const [item, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    }

    return mostCommon;
  }

  /**
   * Execute gang formation
   */
  async executeFormation(proposal: GangFormationProposal): Promise<boolean> {
    // This would integrate with actual gang creation API
    console.log(`[OrganicGangFormation] Forming gang: ${proposal.suggestedName} [${proposal.suggestedTag}]`);
    console.log(`  Members: ${proposal.memberIds.length}`);
    console.log(`  Avg Affinity: ${(proposal.avgAffinity * 100).toFixed(1)}%`);
    console.log(`  Reason: ${proposal.formationReason}`);
    console.log(`  Traits: ${proposal.commonPersonalityTraits.join(', ')}`);

    // Mark members as affiliated
    for (const memberId of proposal.memberIds) {
      const profile = this.relationships.get(memberId);
      if (profile) {
        profile.gangAffiliation = proposal.suggestedTag;
      }
    }

    return true;
  }
}

// ============================================================================
// FRIENDSHIP NETWORK ANALYSIS
// ============================================================================

/**
 * Social network graph node
 */
export interface NetworkNode {
  id: string;
  name: string;
  influence: number;
  popularity: number;
  degree: number; // Number of connections
  betweenness: number; // How often this node is on shortest paths
  eigenvector: number; // Connection to other well-connected nodes
  cluster?: string;
}

/**
 * Social network graph edge
 */
export interface NetworkEdge {
  source: string;
  target: string;
  weight: number; // Affinity strength
  type: 'friend' | 'ally' | 'rival' | 'enemy';
}

/**
 * Network analysis results
 */
export interface NetworkAnalysis {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  clusters: SocialCluster[];
  centralNodes: string[]; // Most influential
  bridges: string[]; // Connect different clusters
  isolates: string[]; // Few connections
  density: number; // Overall connectedness
  avgPathLength: number;
  clusteringCoefficient: number;
}

/**
 * Analyzes and visualizes friendship networks
 */
export class FriendshipNetworkAnalyzer {
  private profiles: Map<string, SocialProfile>;

  constructor(profiles: Map<string, SocialProfile>) {
    this.profiles = profiles;
  }

  /**
   * Build network graph from relationships
   */
  buildNetworkGraph(): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];
    const processed = new Set<string>();

    for (const [botId, profile] of this.profiles.entries()) {
      // Create node
      nodes.push({
        id: botId,
        name: profile.name,
        influence: profile.influence,
        popularity: profile.popularity,
        degree: profile.relationships.size,
        betweenness: 0, // Calculated later
        eigenvector: 0, // Calculated later
      });

      // Create edges
      for (const [otherId, relationship] of profile.relationships.entries()) {
        const edgeKey = [botId, otherId].sort().join('-');
        if (processed.has(edgeKey)) continue;

        edges.push({
          source: botId,
          target: otherId,
          weight: Math.abs(relationship.affinity),
          type: relationship.relationshipType as any,
        });

        processed.add(edgeKey);
      }
    }

    return { nodes, edges };
  }

  /**
   * Calculate betweenness centrality using Brandes algorithm
   */
  calculateBetweenness(nodes: NetworkNode[], edges: NetworkEdge[]): Map<string, number> {
    const betweenness = new Map<string, number>();
    nodes.forEach(n => betweenness.set(n.id, 0));

    // Build adjacency list
    const adj = new Map<string, Set<string>>();
    nodes.forEach(n => adj.set(n.id, new Set()));
    edges.forEach(e => {
      adj.get(e.source)?.add(e.target);
      adj.get(e.target)?.add(e.source);
    });

    // For each node as source
    for (const source of nodes) {
      const stack: string[] = [];
      const predecessors = new Map<string, string[]>();
      const distance = new Map<string, number>();
      const sigma = new Map<string, number>();
      const delta = new Map<string, number>();

      nodes.forEach(n => {
        predecessors.set(n.id, []);
        distance.set(n.id, -1);
        sigma.set(n.id, 0);
        delta.set(n.id, 0);
      });

      distance.set(source.id, 0);
      sigma.set(source.id, 1);

      const queue: string[] = [source.id];

      // BFS
      while (queue.length > 0) {
        const v = queue.shift()!;
        stack.push(v);

        for (const w of adj.get(v) || []) {
          // First time visiting w?
          if (distance.get(w) === -1) {
            distance.set(w, distance.get(v)! + 1);
            queue.push(w);
          }

          // Shortest path to w via v?
          if (distance.get(w) === distance.get(v)! + 1) {
            sigma.set(w, sigma.get(w)! + sigma.get(v)!);
            predecessors.get(w)?.push(v);
          }
        }
      }

      // Accumulate dependencies
      while (stack.length > 0) {
        const w = stack.pop()!;
        for (const v of predecessors.get(w) || []) {
          const contribution = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
          delta.set(v, delta.get(v)! + contribution);
        }
        if (w !== source.id) {
          betweenness.set(w, betweenness.get(w)! + delta.get(w)!);
        }
      }
    }

    // Normalize
    const n = nodes.length;
    betweenness.forEach((value, key) => {
      betweenness.set(key, value / ((n - 1) * (n - 2)));
    });

    return betweenness;
  }

  /**
   * Calculate eigenvector centrality (power iteration method)
   */
  calculateEigenvector(nodes: NetworkNode[], edges: NetworkEdge[]): Map<string, number> {
    const eigenvector = new Map<string, number>();
    nodes.forEach(n => eigenvector.set(n.id, 1 / nodes.length));

    // Build adjacency matrix
    const adj = new Map<string, Map<string, number>>();
    nodes.forEach(n => adj.set(n.id, new Map()));
    edges.forEach(e => {
      adj.get(e.source)?.set(e.target, e.weight);
      adj.get(e.target)?.set(e.source, e.weight);
    });

    // Power iteration
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let iter = 0; iter < maxIterations; iter++) {
      const newEigenvector = new Map<string, number>();
      let norm = 0;

      for (const node of nodes) {
        let sum = 0;
        for (const [neighbor, weight] of adj.get(node.id) || []) {
          sum += weight * (eigenvector.get(neighbor) || 0);
        }
        newEigenvector.set(node.id, sum);
        norm += sum * sum;
      }

      // Normalize
      norm = Math.sqrt(norm);
      if (norm > 0) {
        newEigenvector.forEach((value, key) => {
          newEigenvector.set(key, value / norm);
        });
      }

      // Check convergence
      let maxDiff = 0;
      nodes.forEach(n => {
        const diff = Math.abs((newEigenvector.get(n.id) || 0) - (eigenvector.get(n.id) || 0));
        maxDiff = Math.max(maxDiff, diff);
      });

      eigenvector.clear();
      newEigenvector.forEach((value, key) => eigenvector.set(key, value));

      if (maxDiff < tolerance) break;
    }

    return eigenvector;
  }

  /**
   * Detect communities using label propagation
   */
  detectCommunities(nodes: NetworkNode[], edges: NetworkEdge[]): SocialCluster[] {
    // Initialize each node with unique label
    const labels = new Map<string, string>();
    nodes.forEach(n => labels.set(n.id, n.id));

    // Build adjacency list with weights
    const adj = new Map<string, Map<string, number>>();
    nodes.forEach(n => adj.set(n.id, new Map()));
    edges.forEach(e => {
      adj.get(e.source)?.set(e.target, e.weight);
      adj.get(e.target)?.set(e.source, e.weight);
    });

    // Iteratively update labels
    const maxIterations = 50;
    for (let iter = 0; iter < maxIterations; iter++) {
      let changed = false;

      // Randomize node order
      const shuffled = [...nodes].sort(() => Math.random() - 0.5);

      for (const node of shuffled) {
        // Count weighted labels of neighbors
        const labelCounts = new Map<string, number>();

        for (const [neighbor, weight] of adj.get(node.id) || []) {
          const label = labels.get(neighbor)!;
          labelCounts.set(label, (labelCounts.get(label) || 0) + weight);
        }

        // Find most common label
        let maxCount = 0;
        let bestLabel = labels.get(node.id)!;
        for (const [label, count] of labelCounts.entries()) {
          if (count > maxCount) {
            maxCount = count;
            bestLabel = label;
          }
        }

        if (bestLabel !== labels.get(node.id)) {
          labels.set(node.id, bestLabel);
          changed = true;
        }
      }

      if (!changed) break;
    }

    // Group nodes by label
    const communities = new Map<string, string[]>();
    labels.forEach((label, nodeId) => {
      if (!communities.has(label)) {
        communities.set(label, []);
      }
      communities.get(label)?.push(nodeId);
    });

    // Convert to clusters
    const clusters: SocialCluster[] = [];
    let clusterId = 0;

    for (const [label, memberIds] of communities.entries()) {
      if (memberIds.length < 2) continue; // Skip single-node clusters

      const cluster = this.createCluster(clusterId++, memberIds);
      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * Create cluster from member IDs
   */
  private createCluster(clusterId: number, memberIds: string[]): SocialCluster {
    const profiles = memberIds.map(id => this.profiles.get(id)!).filter(Boolean);

    // Calculate center of mass (average personality)
    const centerOfMass = {
      riskTolerance: 0,
      sociability: 0,
      aggression: 0,
      loyalty: 0,
    };

    for (const profile of profiles) {
      centerOfMass.riskTolerance += profile.personality.traits.riskTolerance;
      centerOfMass.sociability += profile.personality.traits.sociability;
      centerOfMass.aggression += profile.personality.traits.aggression;
      centerOfMass.loyalty += profile.personality.traits.loyalty;
    }

    Object.keys(centerOfMass).forEach(key => {
      centerOfMass[key as keyof typeof centerOfMass] /= profiles.length;
    });

    // Determine dominant personality
    const archetypes = profiles.map(p => p.personality.archetype);
    const dominantPersonality = this.getMostCommon(archetypes) || 'mixed';

    // Calculate cohesion (avg pairwise affinity)
    let totalAffinity = 0;
    let affinityCount = 0;
    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const rel = profiles[i].relationships.get(memberIds[j]);
        if (rel) {
          totalAffinity += Math.abs(rel.affinity);
          affinityCount++;
        }
      }
    }
    const cohesion = affinityCount > 0 ? totalAffinity / affinityCount : 0;

    // Average influence
    const avgInfluence = profiles.reduce((sum, p) => sum + p.influence, 0) / profiles.length;

    // Determine cluster type
    let clusterType: 'combat' | 'social' | 'economic' | 'criminal' | 'mixed' = 'mixed';
    if (centerOfMass.aggression > 0.6) clusterType = 'combat';
    else if (centerOfMass.sociability > 0.6) clusterType = 'social';
    else if (dominantPersonality === 'economist') clusterType = 'economic';
    else if (dominantPersonality === 'criminal') clusterType = 'criminal';

    return {
      clusterId: `cluster-${clusterId}`,
      memberIds,
      centerOfMass,
      dominantPersonality,
      cohesion,
      avgInfluence,
      clusterType,
    };
  }

  /**
   * Perform full network analysis
   */
  analyzeNetwork(): NetworkAnalysis {
    const { nodes, edges } = this.buildNetworkGraph();

    // Calculate centrality measures
    const betweenness = this.calculateBetweenness(nodes, edges);
    const eigenvector = this.calculateEigenvector(nodes, edges);

    // Update node metrics
    nodes.forEach(node => {
      node.betweenness = betweenness.get(node.id) || 0;
      node.eigenvector = eigenvector.get(node.id) || 0;
    });

    // Detect communities
    const clusters = this.detectCommunities(nodes, edges);

    // Assign clusters to nodes
    clusters.forEach(cluster => {
      cluster.memberIds.forEach(id => {
        const node = nodes.find(n => n.id === id);
        if (node) node.cluster = cluster.clusterId;
      });
    });

    // Identify central nodes (high eigenvector centrality)
    const centralNodes = [...nodes]
      .sort((a, b) => b.eigenvector - a.eigenvector)
      .slice(0, Math.ceil(nodes.length * 0.1))
      .map(n => n.id);

    // Identify bridges (high betweenness centrality)
    const bridges = [...nodes]
      .sort((a, b) => b.betweenness - a.betweenness)
      .slice(0, Math.ceil(nodes.length * 0.1))
      .map(n => n.id);

    // Identify isolates (low degree)
    const isolates = nodes.filter(n => n.degree < 2).map(n => n.id);

    // Calculate network density
    const maxPossibleEdges = (nodes.length * (nodes.length - 1)) / 2;
    const density = maxPossibleEdges > 0 ? edges.length / maxPossibleEdges : 0;

    // Calculate average path length (simplified - sample based)
    const avgPathLength = this.calculateAvgPathLength(nodes, edges);

    // Calculate clustering coefficient
    const clusteringCoefficient = this.calculateClusteringCoefficient(nodes, edges);

    return {
      nodes,
      edges,
      clusters,
      centralNodes,
      bridges,
      isolates,
      density,
      avgPathLength,
      clusteringCoefficient,
    };
  }

  /**
   * Calculate average shortest path length (sampling for performance)
   */
  private calculateAvgPathLength(nodes: NetworkNode[], edges: NetworkEdge[]): number {
    // Build adjacency list
    const adj = new Map<string, Set<string>>();
    nodes.forEach(n => adj.set(n.id, new Set()));
    edges.forEach(e => {
      adj.get(e.source)?.add(e.target);
      adj.get(e.target)?.add(e.source);
    });

    // Sample 100 random pairs (or all if fewer)
    const sampleSize = Math.min(100, nodes.length * (nodes.length - 1) / 2);
    let totalLength = 0;
    let pathCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const source = nodes[Math.floor(Math.random() * nodes.length)];
      const target = nodes[Math.floor(Math.random() * nodes.length)];
      if (source.id === target.id) continue;

      const length = this.bfsShortestPath(source.id, target.id, adj);
      if (length > 0) {
        totalLength += length;
        pathCount++;
      }
    }

    return pathCount > 0 ? totalLength / pathCount : 0;
  }

  /**
   * BFS shortest path
   */
  private bfsShortestPath(
    source: string,
    target: string,
    adj: Map<string, Set<string>>
  ): number {
    const visited = new Set<string>();
    const queue: [string, number][] = [[source, 0]];

    while (queue.length > 0) {
      const [node, dist] = queue.shift()!;
      if (node === target) return dist;
      if (visited.has(node)) continue;

      visited.add(node);

      for (const neighbor of adj.get(node) || []) {
        if (!visited.has(neighbor)) {
          queue.push([neighbor, dist + 1]);
        }
      }
    }

    return -1; // Not connected
  }

  /**
   * Calculate clustering coefficient
   */
  private calculateClusteringCoefficient(nodes: NetworkNode[], edges: NetworkEdge[]): number {
    // Build adjacency list
    const adj = new Map<string, Set<string>>();
    nodes.forEach(n => adj.set(n.id, new Set()));
    edges.forEach(e => {
      adj.get(e.source)?.add(e.target);
      adj.get(e.target)?.add(e.source);
    });

    let totalCoefficient = 0;
    let nodeCount = 0;

    for (const node of nodes) {
      const neighbors = Array.from(adj.get(node.id) || []);
      const k = neighbors.length;

      if (k < 2) continue; // Need at least 2 neighbors

      // Count triangles
      let triangles = 0;
      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          if (adj.get(neighbors[i])?.has(neighbors[j])) {
            triangles++;
          }
        }
      }

      const maxPossibleTriangles = (k * (k - 1)) / 2;
      const coefficient = maxPossibleTriangles > 0 ? triangles / maxPossibleTriangles : 0;

      totalCoefficient += coefficient;
      nodeCount++;
    }

    return nodeCount > 0 ? totalCoefficient / nodeCount : 0;
  }

  /**
   * Helper to find most common element
   */
  private getMostCommon<T>(arr: T[]): T | null {
    const counts = new Map<T, number>();
    for (const item of arr) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }

    let maxCount = 0;
    let mostCommon: T | null = null;
    for (const [item, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    }

    return mostCommon;
  }

  /**
   * Generate network visualization data (for D3.js or similar)
   */
  generateVisualizationData(): {
    nodes: Array<{ id: string; label: string; size: number; color: string; group?: string }>;
    links: Array<{ source: string; target: string; value: number; color: string }>;
  } {
    const { nodes, edges } = this.buildNetworkGraph();

    const visNodes = nodes.map(n => ({
      id: n.id,
      label: n.name,
      size: 10 + n.influence * 2,
      color: this.getNodeColor(n),
      group: n.cluster,
    }));

    const visLinks = edges.map(e => ({
      source: e.source,
      target: e.target,
      value: e.weight * 10,
      color: this.getEdgeColor(e.type),
    }));

    return { nodes: visNodes, links: visLinks };
  }

  /**
   * Get node color based on personality
   */
  private getNodeColor(node: NetworkNode): string {
    const profile = this.profiles.get(node.id);
    if (!profile) return '#999999';

    const archetype = profile.personality.archetype;
    const colors = {
      grinder: '#FFA500', // Orange
      social: '#00CED1', // Turquoise
      explorer: '#32CD32', // Lime green
      combat: '#DC143C', // Crimson
      economist: '#FFD700', // Gold
      criminal: '#8B0000', // Dark red
      roleplayer: '#9370DB', // Purple
      chaos: '#FF1493', // Hot pink
    };

    return colors[archetype] || '#999999';
  }

  /**
   * Get edge color based on relationship type
   */
  private getEdgeColor(type: string): string {
    const colors = {
      friend: '#00FF00', // Green
      ally: '#0000FF', // Blue
      rival: '#FFA500', // Orange
      enemy: '#FF0000', // Red
    };

    return colors[type as keyof typeof colors] || '#CCCCCC';
  }
}

// ============================================================================
// REPUTATION CASCADE SYSTEM
// ============================================================================

/**
 * Manages reputation changes that cascade through social networks
 */
export class ReputationCascadeManager {
  private profiles: Map<string, SocialProfile>;

  constructor(profiles: Map<string, SocialProfile>) {
    this.profiles = profiles;
  }

  /**
   * Trigger a reputation cascade from an action
   */
  triggerCascade(
    botId: string,
    actionType: string,
    target: string | undefined,
    outcome: 'positive' | 'negative' | 'neutral'
  ): ReputationCascade {
    const cascadeNodes: CascadeNode[] = [];

    // BFS to propagate reputation change through network
    const visited = new Set<string>([botId]);
    const queue: Array<{ id: string; depth: number; strength: number }> = [
      { id: botId, depth: 0, strength: 1.0 }
    ];

    while (queue.length > 0) {
      const { id, depth, strength } = queue.shift()!;
      if (depth > 3) continue; // Limit cascade depth

      const profile = this.profiles.get(id);
      if (!profile) continue;

      // Calculate reputation impact
      const impact = this.calculateImpact(actionType, outcome, depth, strength);

      // Apply cascade to connected bots
      for (const [neighborId, relationship] of profile.relationships.entries()) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);

        const neighborProfile = this.profiles.get(neighborId);
        if (!neighborProfile) continue;

        // Cascade strength diminishes with distance and negative affinity
        const cascadeStrength = strength * relationship.affinity * 0.5;
        if (Math.abs(cascadeStrength) < 0.1) continue; // Too weak to matter

        // Apply reputation change
        const reputationChange = impact * cascadeStrength;
        this.applyReputationChange(neighborProfile, botId, reputationChange, actionType);

        // Track cascade node
        cascadeNodes.push({
          botId: neighborId,
          depth: depth + 1,
          reputationChange,
          relationshipChange: this.calculateRelationshipChange(actionType, outcome) * cascadeStrength,
          influenced: Math.abs(reputationChange) > 5, // Significant impact
        });

        // Propagate further if strong enough
        if (Math.abs(cascadeStrength) > 0.2) {
          queue.push({
            id: neighborId,
            depth: depth + 1,
            strength: cascadeStrength,
          });
        }
      }
    }

    const totalReach = cascadeNodes.length;
    const avgImpact = totalReach > 0
      ? cascadeNodes.reduce((sum, n) => sum + Math.abs(n.reputationChange), 0) / totalReach
      : 0;

    return {
      sourceAction: { botId, actionType, target, outcome },
      cascadeNodes,
      totalReach,
      avgImpact,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate base impact of an action
   */
  private calculateImpact(
    actionType: string,
    outcome: 'positive' | 'negative' | 'neutral',
    depth: number,
    strength: number
  ): number {
    let baseImpact = 0;

    // Different actions have different reputation impacts
    const impactValues = {
      combat: outcome === 'positive' ? 10 : -5,
      trade: outcome === 'positive' ? 5 : -10,
      help: 15,
      betrayal: -30,
      cooperation: 10,
      crime: -15,
      gift: 8,
    };

    baseImpact = impactValues[actionType as keyof typeof impactValues] || 0;

    // Diminish with depth
    const depthMultiplier = Math.pow(0.6, depth);

    return baseImpact * depthMultiplier * strength;
  }

  /**
   * Calculate how relationship changes from action
   */
  private calculateRelationshipChange(
    actionType: string,
    outcome: 'positive' | 'negative' | 'neutral'
  ): number {
    if (outcome === 'neutral') return 0;

    const changeValues = {
      combat: outcome === 'positive' ? 0.05 : -0.1,
      trade: outcome === 'positive' ? 0.03 : -0.08,
      help: 0.1,
      betrayal: -0.3,
      cooperation: 0.12,
      crime: -0.05,
      gift: 0.07,
    };

    return changeValues[actionType as keyof typeof changeValues] || 0;
  }

  /**
   * Apply reputation change to a profile
   */
  private applyReputationChange(
    profile: SocialProfile,
    sourceBot: string,
    change: number,
    category: string
  ): void {
    // Update global reputation
    profile.reputation.global += change;
    profile.reputation.global = Math.max(-100, Math.min(100, profile.reputation.global));

    // Update category-specific reputation
    const categoryMap: Record<string, keyof typeof profile.reputation.categories> = {
      combat: 'combat',
      trade: 'trade',
      help: 'social',
      cooperation: 'social',
      betrayal: 'reliability',
    };

    const repCategory = categoryMap[category];
    if (repCategory) {
      profile.reputation.categories[repCategory] += change;
      profile.reputation.categories[repCategory] = Math.max(-100, Math.min(100,
        profile.reputation.categories[repCategory]
      ));
    }

    // Update relationship if exists
    const relationship = profile.relationships.get(sourceBot);
    if (relationship) {
      const affinityChange = change * 0.01; // Small affinity change
      relationship.affinity += affinityChange;
      relationship.affinity = Math.max(-1, Math.min(1, relationship.affinity));
    }
  }

  /**
   * Get reputation summary for a bot
   */
  getReputationSummary(botId: string): {
    global: number;
    categories: typeof profile.reputation.categories;
    topFactionsRep: Array<{ faction: string; rep: number }>;
    topGangsRep: Array<{ gang: string; rep: number }>;
  } | null {
    const profile = this.profiles.get(botId);
    if (!profile) return null;

    const topFactionsRep = Array.from(profile.reputation.factionScores.entries())
      .map(([faction, rep]) => ({ faction, rep }))
      .sort((a, b) => b.rep - a.rep)
      .slice(0, 5);

    const topGangsRep = Array.from(profile.reputation.gangScores.entries())
      .map(([gang, rep]) => ({ gang, rep }))
      .sort((a, b) => b.rep - a.rep)
      .slice(0, 5);

    return {
      global: profile.reputation.global,
      categories: profile.reputation.categories,
      topFactionsRep,
      topGangsRep,
    };
  }
}

// ============================================================================
// INFLUENCE SPREADING SYSTEM
// ============================================================================

/**
 * Manages how influential bots affect others' behavior
 */
export class InfluenceSpreadingSystem {
  private profiles: Map<string, SocialProfile>;

  constructor(profiles: Map<string, SocialProfile>) {
    this.profiles = profiles;
  }

  /**
   * Spread influence from a highly influential bot
   */
  spreadInfluence(
    sourceId: string,
    influenceType: 'behavior' | 'opinion' | 'action' | 'emotion',
    message: string,
    initialStrength: number = 1.0
  ): InfluenceEvent {
    const source = this.profiles.get(sourceId);
    if (!source) {
      throw new Error(`Source bot ${sourceId} not found`);
    }

    const affected: string[] = [];

    // Calculate influence range based on source's influence score
    const maxDepth = Math.ceil(source.influence / 30); // Higher influence = deeper reach

    // BFS propagation
    const visited = new Set<string>([sourceId]);
    const queue: Array<{ id: string; depth: number; strength: number }> = [
      { id: sourceId, depth: 0, strength: initialStrength }
    ];

    while (queue.length > 0) {
      const { id, depth, strength } = queue.shift()!;
      if (depth >= maxDepth) continue;

      const profile = this.profiles.get(id);
      if (!profile) continue;

      for (const [neighborId, relationship] of profile.relationships.entries()) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);

        const neighborProfile = this.profiles.get(neighborId);
        if (!neighborProfile) continue;

        // Influence strength based on relationship and personalities
        const propagationStrength = this.calculatePropagationStrength(
          profile,
          neighborProfile,
          relationship,
          influenceType,
          strength
        );

        if (propagationStrength > 0.1) {
          // Apply influence
          this.applyInfluence(neighborProfile, sourceId, influenceType, message, propagationStrength);
          affected.push(neighborId);

          // Propagate further
          queue.push({
            id: neighborId,
            depth: depth + 1,
            strength: propagationStrength,
          });
        }
      }
    }

    return {
      sourceId,
      targetIds: affected,
      influenceType,
      strength: initialStrength,
      message,
      timestamp: new Date(),
      propagationDepth: maxDepth,
    };
  }

  /**
   * Calculate how much influence propagates
   */
  private calculatePropagationStrength(
    source: SocialProfile,
    target: SocialProfile,
    relationship: SocialRelationship,
    influenceType: string,
    currentStrength: number
  ): number {
    let strength = currentStrength;

    // Relationship quality affects propagation
    strength *= (relationship.affinity + 1) / 2; // Convert -1..1 to 0..1
    strength *= relationship.trust;

    // Source influence matters
    strength *= source.influence / 100;

    // Target's susceptibility to influence
    const susceptibility = this.calculateSusceptibility(target, influenceType);
    strength *= susceptibility;

    // Decay factor
    strength *= 0.7;

    return Math.max(0, Math.min(1, strength));
  }

  /**
   * Calculate how susceptible a bot is to influence
   */
  private calculateSusceptibility(profile: SocialProfile, influenceType: string): number {
    const traits = profile.personality.traits;

    switch (influenceType) {
      case 'behavior':
        // Low loyalty = more susceptible to behavior change
        return 1 - traits.loyalty * 0.5;

      case 'opinion':
        // High sociability = more swayed by others' opinions
        return traits.sociability * 0.7 + (1 - traits.loyalty) * 0.3;

      case 'action':
        // Impulsive (low patience) = more likely to copy actions
        return (1 - traits.patience) * 0.6 + traits.sociability * 0.4;

      case 'emotion':
        // High sociability and low patience = emotional contagion
        return traits.sociability * 0.5 + (1 - traits.patience) * 0.5;

      default:
        return 0.5;
    }
  }

  /**
   * Apply influence to target bot
   */
  private applyInfluence(
    target: SocialProfile,
    sourceId: string,
    influenceType: string,
    message: string,
    strength: number
  ): void {
    // This would modify bot behavior in actual implementation
    console.log(
      `[Influence] ${target.name} influenced by ${sourceId} (${influenceType}): ${message} [strength: ${(strength * 100).toFixed(1)}%]`
    );

    // Increase influencer's influence score
    const source = this.profiles.get(sourceId);
    if (source) {
      source.influence = Math.min(100, source.influence + 0.1);
    }
  }

  /**
   * Identify the most influential bots
   */
  getInfluencers(count: number = 10): Array<{ botId: string; influence: number; reach: number }> {
    const influencers = Array.from(this.profiles.values())
      .map(profile => ({
        botId: profile.botId,
        influence: profile.influence,
        reach: profile.relationships.size,
      }))
      .sort((a, b) => b.influence - a.influence)
      .slice(0, count);

    return influencers;
  }

  /**
   * Simulate influence cascade (opinion spreading)
   */
  simulateOpinionCascade(
    sourceId: string,
    opinion: string,
    initialAdoption: number = 0.8
  ): {
    adopters: string[];
    resisters: string[];
    undecided: string[];
    finalAdoption: number;
  } {
    const adopters: string[] = [sourceId];
    const resisters: string[] = [];
    const undecided: string[] = [];

    const visited = new Set<string>([sourceId]);
    const queue: Array<{ id: string; strength: number }> = [
      { id: sourceId, strength: initialAdoption }
    ];

    while (queue.length > 0) {
      const { id, strength } = queue.shift()!;
      const profile = this.profiles.get(id);
      if (!profile) continue;

      for (const [neighborId, relationship] of profile.relationships.entries()) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);

        const neighborProfile = this.profiles.get(neighborId);
        if (!neighborProfile) continue;

        const propagationStrength = this.calculatePropagationStrength(
          profile,
          neighborProfile,
          relationship,
          'opinion',
          strength
        );

        // Decision threshold
        const threshold = 0.5 + (neighborProfile.personality.traits.loyalty * 0.3);

        if (propagationStrength >= threshold) {
          adopters.push(neighborId);
          queue.push({ id: neighborId, strength: propagationStrength });
        } else if (propagationStrength < threshold * 0.5) {
          resisters.push(neighborId);
        } else {
          undecided.push(neighborId);
        }
      }
    }

    const total = this.profiles.size;
    const finalAdoption = adopters.length / total;

    return { adopters, resisters, undecided, finalAdoption };
  }
}

// ============================================================================
// GANG COORDINATION SYSTEM
// ============================================================================

/**
 * Coordinates gang activities and enables emergent cooperation
 */
export class GangCoordinationSystem {
  private profiles: Map<string, SocialProfile>;
  private gangs: Map<string, Set<string>>; // gang ID -> member IDs

  constructor(profiles: Map<string, SocialProfile>) {
    this.profiles = profiles;
    this.gangs = this.buildGangMap();
  }

  /**
   * Build map of gangs and their members
   */
  private buildGangMap(): Map<string, Set<string>> {
    const gangs = new Map<string, Set<string>>();

    for (const [botId, profile] of this.profiles.entries()) {
      if (profile.gangAffiliation) {
        if (!gangs.has(profile.gangAffiliation)) {
          gangs.set(profile.gangAffiliation, new Set());
        }
        gangs.get(profile.gangAffiliation)?.add(botId);
      }
    }

    return gangs;
  }

  /**
   * Plan coordinated gang action
   */
  planCoordinatedAction(
    gangId: string,
    actionType: 'war' | 'raid' | 'defense' | 'recruitment' | 'mission',
    coordinatorId: string,
    options?: {
      targetGang?: string;
      targetLocation?: string;
      minParticipants?: number;
    }
  ): GangCoordinationAction | null {
    const members = this.gangs.get(gangId);
    if (!members || !members.has(coordinatorId)) {
      return null; // Invalid gang or coordinator
    }

    // Find willing participants
    const participants = this.findWillingParticipants(
      gangId,
      coordinatorId,
      actionType,
      options?.minParticipants || 2
    );

    if (participants.length < (options?.minParticipants || 2)) {
      return null; // Not enough participants
    }

    // Determine priority based on gang cohesion and action type
    const priority = this.calculateActionPriority(gangId, actionType);

    // Schedule action
    const scheduledTime = new Date(Date.now() + 60000); // 1 minute from now

    return {
      gangId,
      actionType,
      coordinatorId,
      participantIds: participants,
      targetGang: options?.targetGang,
      targetLocation: options?.targetLocation,
      scheduledTime,
      priority,
      status: 'planned',
    };
  }

  /**
   * Find gang members willing to participate
   */
  private findWillingParticipants(
    gangId: string,
    coordinatorId: string,
    actionType: string,
    minCount: number
  ): string[] {
    const members = this.gangs.get(gangId);
    if (!members) return [];

    const coordinator = this.profiles.get(coordinatorId);
    if (!coordinator) return [];

    const participants: Array<{ id: string; willingness: number }> = [];

    for (const memberId of members) {
      if (memberId === coordinatorId) {
        participants.push({ id: memberId, willingness: 1.0 });
        continue;
      }

      const member = this.profiles.get(memberId);
      if (!member) continue;

      // Calculate willingness based on multiple factors
      const willingness = this.calculateWillingness(member, coordinator, actionType);

      if (willingness > 0.3) {
        participants.push({ id: memberId, willingness });
      }
    }

    // Sort by willingness and return top participants
    return participants
      .sort((a, b) => b.willingness - a.willingness)
      .map(p => p.id);
  }

  /**
   * Calculate bot's willingness to participate in action
   */
  private calculateWillingness(
    member: SocialProfile,
    coordinator: SocialProfile,
    actionType: string
  ): number {
    let willingness = 0.5; // Base willingness

    // Relationship with coordinator
    const relationship = member.relationships.get(coordinator.botId);
    if (relationship) {
      willingness += relationship.affinity * 0.3;
      willingness += relationship.trust * 0.2;
    }

    // Personality alignment with action type
    const traits = member.personality.traits;
    const actionModifiers: Record<string, number> = {
      war: traits.aggression * 0.3 + traits.loyalty * 0.2,
      raid: traits.riskTolerance * 0.3 + traits.aggression * 0.2,
      defense: traits.loyalty * 0.4 + traits.patience * 0.1,
      recruitment: traits.sociability * 0.3 + traits.loyalty * 0.2,
      mission: traits.curiosity * 0.2 + traits.loyalty * 0.3,
    };

    willingness += actionModifiers[actionType] || 0;

    // Gang loyalty
    willingness += traits.loyalty * 0.2;

    return Math.max(0, Math.min(1, willingness));
  }

  /**
   * Calculate priority of gang action
   */
  private calculateActionPriority(
    gangId: string,
    actionType: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const members = this.gangs.get(gangId);
    if (!members) return 'low';

    // Calculate gang cohesion
    let totalAffinity = 0;
    let affinityCount = 0;

    const memberProfiles = Array.from(members)
      .map(id => this.profiles.get(id))
      .filter((p): p is SocialProfile => p !== undefined);

    for (let i = 0; i < memberProfiles.length; i++) {
      for (let j = i + 1; j < memberProfiles.length; j++) {
        const rel = memberProfiles[i].relationships.get(memberProfiles[j].botId);
        if (rel) {
          totalAffinity += rel.affinity;
          affinityCount++;
        }
      }
    }

    const cohesion = affinityCount > 0 ? totalAffinity / affinityCount : 0;

    // Base priority on action type
    const typePriorities: Record<string, number> = {
      defense: 4,
      war: 3,
      raid: 2,
      mission: 2,
      recruitment: 1,
    };

    const basePriority = typePriorities[actionType] || 1;

    // Adjust by cohesion
    const adjustedPriority = basePriority + cohesion * 2;

    if (adjustedPriority >= 4) return 'critical';
    if (adjustedPriority >= 3) return 'high';
    if (adjustedPriority >= 2) return 'medium';
    return 'low';
  }

  /**
   * Execute coordinated action
   */
  executeCoordinatedAction(action: GangCoordinationAction): {
    success: boolean;
    participants: string[];
    outcome: string;
  } {
    console.log(`[GangCoordination] Executing ${action.actionType} for gang ${action.gangId}`);
    console.log(`  Coordinator: ${action.coordinatorId}`);
    console.log(`  Participants: ${action.participantIds.length}`);
    console.log(`  Priority: ${action.priority}`);

    // Simulate action outcome based on participants and cohesion
    const success = Math.random() < 0.6 + (action.participantIds.length * 0.05);

    const outcome = success
      ? `${action.actionType} successful! Gang cohesion strengthened.`
      : `${action.actionType} failed. Gang morale affected.`;

    // Update action status
    action.status = success ? 'completed' : 'failed';

    // Apply reputation changes
    if (success) {
      for (const participantId of action.participantIds) {
        const profile = this.profiles.get(participantId);
        if (profile) {
          profile.reputation.global += 5;
          profile.reputation.categories.reliability += 3;

          // Strengthen bonds between participants
          for (const otherId of action.participantIds) {
            if (otherId === participantId) continue;
            const relationship = profile.relationships.get(otherId);
            if (relationship) {
              relationship.affinity = Math.min(1, relationship.affinity + 0.05);
              relationship.trust = Math.min(1, relationship.trust + 0.03);
            }
          }
        }
      }
    }

    return {
      success,
      participants: action.participantIds,
      outcome,
    };
  }

  /**
   * Get gang statistics
   */
  getGangStats(gangId: string): {
    memberCount: number;
    avgCohesion: number;
    avgInfluence: number;
    dominantPersonality: string | null;
    activityLevel: 'low' | 'medium' | 'high';
  } | null {
    const members = this.gangs.get(gangId);
    if (!members) return null;

    const profiles = Array.from(members)
      .map(id => this.profiles.get(id))
      .filter((p): p is SocialProfile => p !== undefined);

    // Calculate cohesion
    let totalAffinity = 0;
    let affinityCount = 0;

    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const rel = profiles[i].relationships.get(profiles[j].botId);
        if (rel) {
          totalAffinity += rel.affinity;
          affinityCount++;
        }
      }
    }

    const avgCohesion = affinityCount > 0 ? totalAffinity / affinityCount : 0;

    // Calculate average influence
    const avgInfluence = profiles.reduce((sum, p) => sum + p.influence, 0) / profiles.length;

    // Find dominant personality
    const archetypes = profiles.map(p => p.personality.archetype);
    const dominantPersonality = this.getMostCommon(archetypes);

    // Estimate activity level based on personalities
    const avgAggression = profiles.reduce((sum, p) => sum + p.personality.traits.aggression, 0) / profiles.length;
    const avgRisk = profiles.reduce((sum, p) => sum + p.personality.traits.riskTolerance, 0) / profiles.length;
    const activityScore = avgAggression * 0.5 + avgRisk * 0.5;

    let activityLevel: 'low' | 'medium' | 'high' = 'medium';
    if (activityScore > 0.6) activityLevel = 'high';
    else if (activityScore < 0.4) activityLevel = 'low';

    return {
      memberCount: members.size,
      avgCohesion,
      avgInfluence,
      dominantPersonality,
      activityLevel,
    };
  }

  /**
   * Helper to find most common element
   */
  private getMostCommon<T>(arr: T[]): T | null {
    const counts = new Map<T, number>();
    for (const item of arr) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }

    let maxCount = 0;
    let mostCommon: T | null = null;
    for (const [item, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    }

    return mostCommon;
  }
}

// ============================================================================
// EMERGENT DYNAMICS ORCHESTRATOR
// ============================================================================

/**
 * Main orchestrator that coordinates all emergent social systems
 */
export class EmergentDynamicsOrchestrator {
  private profiles: Map<string, SocialProfile>;
  private affinityCalculator: typeof AffinityCalculator;
  private gangFormation: OrganicGangFormation;
  private networkAnalyzer: FriendshipNetworkAnalyzer;
  private reputationCascade: ReputationCascadeManager;
  private influenceSystem: InfluenceSpreadingSystem;
  private gangCoordination: GangCoordinationSystem;

  constructor() {
    this.profiles = new Map();
    this.affinityCalculator = AffinityCalculator;
    this.gangFormation = new OrganicGangFormation(this.profiles);
    this.networkAnalyzer = new FriendshipNetworkAnalyzer(this.profiles);
    this.reputationCascade = new ReputationCascadeManager(this.profiles);
    this.influenceSystem = new InfluenceSpreadingSystem(this.profiles);
    this.gangCoordination = new GangCoordinationSystem(this.profiles);
  }

  /**
   * Register a bot in the social system
   */
  registerBot(
    botId: string,
    name: string,
    personality: PersonalityProfile,
    faction?: string
  ): SocialProfile {
    const profile: SocialProfile = {
      botId,
      name,
      personality,
      reputation: {
        global: 0,
        factionScores: new Map(),
        gangScores: new Map(),
        npcScores: new Map(),
        lawEnforcement: 0,
        categories: {
          combat: 0,
          trade: 0,
          social: 0,
          reliability: 0,
        },
      },
      influence: 10, // Base influence
      popularity: 0,
      trustworthiness: 50, // Neutral start
      relationships: new Map(),
      faction,
      socialMemory: {
        positiveInteractions: new Map(),
        negativeInteractions: new Map(),
        favors: new Map(),
        betrayals: [],
        allies: [],
        grudges: new Map(),
      },
    };

    this.profiles.set(botId, profile);

    // Calculate initial affinities with existing bots
    for (const [otherId, otherProfile] of this.profiles.entries()) {
      if (otherId === botId) continue;

      const baseAffinity = this.affinityCalculator.calculateBaseAffinity(
        personality,
        otherProfile.personality
      );

      const finalAffinity = this.affinityCalculator.applyFactionModifier(
        baseAffinity,
        faction,
        otherProfile.faction
      );

      // Create bidirectional relationship
      const relationship: SocialRelationship = {
        bot1Id: botId,
        bot2Id: otherId,
        affinity: finalAffinity,
        trust: 0.5, // Neutral trust initially
        interactions: 0,
        lastInteraction: new Date(),
        relationshipType: 'stranger',
        sharedFaction: faction === otherProfile.faction ? faction : undefined,
        history: [],
      };

      profile.relationships.set(otherId, relationship);
      otherProfile.relationships.set(botId, { ...relationship, bot1Id: otherId, bot2Id: botId });
    }

    return profile;
  }

  /**
   * Record an interaction between bots
   */
  recordInteraction(
    bot1Id: string,
    bot2Id: string,
    type: InteractionRecord['type'],
    outcome: InteractionRecord['outcome'],
    context?: string
  ): void {
    const profile1 = this.profiles.get(bot1Id);
    const profile2 = this.profiles.get(bot2Id);

    if (!profile1 || !profile2) return;

    const relationship = profile1.relationships.get(bot2Id);
    if (!relationship) return;

    // Calculate changes
    const { affinityDelta, trustDelta } = this.affinityCalculator.calculateAffinityChange(
      { timestamp: new Date(), type, outcome, affinityChange: 0, trustChange: 0, context },
      relationship.affinity,
      relationship.trust
    );

    // Update relationship
    relationship.affinity = Math.max(-1, Math.min(1, relationship.affinity + affinityDelta));
    relationship.trust = Math.max(0, Math.min(1, relationship.trust + trustDelta));
    relationship.interactions++;
    relationship.lastInteraction = new Date();
    relationship.relationshipType = this.affinityCalculator.getRelationshipType(
      relationship.affinity,
      relationship.trust
    );

    // Record interaction
    const record: InteractionRecord = {
      timestamp: new Date(),
      type,
      outcome,
      affinityChange: affinityDelta,
      trustChange: trustDelta,
      context,
    };

    relationship.history.push(record);

    // Update social memory
    if (outcome === 'positive') {
      if (!profile1.socialMemory.positiveInteractions.has(bot2Id)) {
        profile1.socialMemory.positiveInteractions.set(bot2Id, []);
      }
      profile1.socialMemory.positiveInteractions.get(bot2Id)?.push(record);
    } else if (outcome === 'negative') {
      if (!profile1.socialMemory.negativeInteractions.has(bot2Id)) {
        profile1.socialMemory.negativeInteractions.set(bot2Id, []);
      }
      profile1.socialMemory.negativeInteractions.get(bot2Id)?.push(record);

      if (type === 'betrayal') {
        profile1.socialMemory.betrayals.push(bot2Id);
      }
    }

    // Sync bidirectional relationship
    const relationship2 = profile2.relationships.get(bot1Id);
    if (relationship2) {
      relationship2.affinity = relationship.affinity;
      relationship2.trust = relationship.trust;
      relationship2.interactions = relationship.interactions;
      relationship2.lastInteraction = relationship.lastInteraction;
      relationship2.relationshipType = relationship.relationshipType;
    }

    // Trigger reputation cascade if significant
    if (Math.abs(affinityDelta) > 0.1) {
      this.reputationCascade.triggerCascade(bot1Id, type, bot2Id, outcome);
    }
  }

  /**
   * Run emergent dynamics simulation cycle
   */
  runCycle(): {
    gangProposals: GangFormationProposal[];
    networkAnalysis: NetworkAnalysis;
    influenceEvents: InfluenceEvent[];
    coordinatedActions: GangCoordinationAction[];
  } {
    console.log('[EmergentDynamics] Running simulation cycle...');

    // 1. Check for organic gang formations
    const gangProposals = this.gangFormation.identifyPotentialGangs();
    console.log(`  Found ${gangProposals.length} potential gang formations`);

    // Auto-form top proposals (high affinity groups)
    for (const proposal of gangProposals.slice(0, 3)) {
      if (proposal.avgAffinity > 0.8) {
        this.gangFormation.executeFormation(proposal);
      }
    }

    // 2. Analyze friendship network
    const networkAnalysis = this.networkAnalyzer.analyzeNetwork();
    console.log(`  Network: ${networkAnalysis.nodes.length} nodes, ${networkAnalysis.edges.length} edges`);
    console.log(`  Clusters: ${networkAnalysis.clusters.length}`);
    console.log(`  Density: ${(networkAnalysis.density * 100).toFixed(1)}%`);

    // 3. Spread influence from central nodes
    const influenceEvents: InfluenceEvent[] = [];
    for (const centralNodeId of networkAnalysis.centralNodes.slice(0, 5)) {
      const messages = [
        'Let\'s coordinate our next move',
        'I found a great opportunity',
        'We should watch out for that gang',
        'Anyone want to team up?',
      ];
      const event = this.influenceSystem.spreadInfluence(
        centralNodeId,
        'opinion',
        messages[Math.floor(Math.random() * messages.length)]
      );
      influenceEvents.push(event);
    }
    console.log(`  Influence events: ${influenceEvents.length}`);

    // 4. Plan gang coordination
    const coordinatedActions: GangCoordinationAction[] = [];
    // This would be triggered by game events in practice

    return {
      gangProposals,
      networkAnalysis,
      influenceEvents,
      coordinatedActions,
    };
  }

  /**
   * Get comprehensive analytics
   */
  getAnalytics(): {
    totalBots: number;
    totalRelationships: number;
    avgAffinity: number;
    friendCount: number;
    rivalCount: number;
    gangCount: number;
    topInfluencers: Array<{ botId: string; influence: number }>;
    networkMetrics: {
      density: number;
      avgPathLength: number;
      clusteringCoefficient: number;
    };
  } {
    let totalAffinity = 0;
    let relationshipCount = 0;
    let friendCount = 0;
    let rivalCount = 0;

    for (const profile of this.profiles.values()) {
      for (const relationship of profile.relationships.values()) {
        totalAffinity += relationship.affinity;
        relationshipCount++;

        if (relationship.relationshipType === 'friend' || relationship.relationshipType === 'ally') {
          friendCount++;
        } else if (relationship.relationshipType === 'rival' || relationship.relationshipType === 'enemy') {
          rivalCount++;
        }
      }
    }

    const avgAffinity = relationshipCount > 0 ? totalAffinity / relationshipCount : 0;

    const topInfluencers = this.influenceSystem.getInfluencers(10);

    const networkAnalysis = this.networkAnalyzer.analyzeNetwork();

    const gangCount = new Set(
      Array.from(this.profiles.values())
        .map(p => p.gangAffiliation)
        .filter(Boolean)
    ).size;

    return {
      totalBots: this.profiles.size,
      totalRelationships: relationshipCount / 2, // Bidirectional
      avgAffinity,
      friendCount: friendCount / 2,
      rivalCount: rivalCount / 2,
      gangCount,
      topInfluencers,
      networkMetrics: {
        density: networkAnalysis.density,
        avgPathLength: networkAnalysis.avgPathLength,
        clusteringCoefficient: networkAnalysis.clusteringCoefficient,
      },
    };
  }

  /**
   * Generate visualization data for social network
   */
  getVisualizationData() {
    return this.networkAnalyzer.generateVisualizationData();
  }

  /**
   * Get bot's social context (for decision-making)
   */
  getBotSocialContext(botId: string): {
    friends: string[];
    allies: string[];
    rivals: string[];
    enemies: string[];
    gangMembers: string[];
    influence: number;
    reputation: number;
  } | null {
    const profile = this.profiles.get(botId);
    if (!profile) return null;

    const friends: string[] = [];
    const allies: string[] = [];
    const rivals: string[] = [];
    const enemies: string[] = [];

    for (const [otherId, relationship] of profile.relationships.entries()) {
      switch (relationship.relationshipType) {
        case 'friend':
          friends.push(otherId);
          break;
        case 'ally':
          allies.push(otherId);
          break;
        case 'rival':
          rivals.push(otherId);
          break;
        case 'enemy':
          enemies.push(otherId);
          break;
      }
    }

    const gangMembers: string[] = [];
    if (profile.gangAffiliation) {
      for (const [otherId, otherProfile] of this.profiles.entries()) {
        if (otherProfile.gangAffiliation === profile.gangAffiliation && otherId !== botId) {
          gangMembers.push(otherId);
        }
      }
    }

    return {
      friends,
      allies,
      rivals,
      enemies,
      gangMembers,
      influence: profile.influence,
      reputation: profile.reputation.global,
    };
  }

  /**
   * Export all social data for analysis
   */
  exportSocialData(): string {
    const data = {
      profiles: Array.from(this.profiles.entries()).map(([id, profile]) => ({
        id,
        name: profile.name,
        personality: profile.personality.archetype,
        influence: profile.influence,
        popularity: profile.popularity,
        reputation: profile.reputation.global,
        gang: profile.gangAffiliation,
        faction: profile.faction,
        relationshipCount: profile.relationships.size,
      })),
      analytics: this.getAnalytics(),
      networkAnalysis: this.networkAnalyzer.analyzeNetwork(),
    };

    return JSON.stringify(data, null, 2);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default EmergentDynamicsOrchestrator;
