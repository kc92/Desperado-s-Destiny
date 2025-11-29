# Emergent Social Dynamics System

**Agent 13 - Week 5-6: Emergent Social Dynamics Architect**

A comprehensive system that enables emergent social behavior in bot testing, creating realistic friendship networks, organic gang formations, reputation cascades, and social clustering patterns.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [Usage Examples](#usage-examples)
- [Integration Guide](#integration-guide)
- [Analytics & Visualization](#analytics--visualization)
- [API Reference](#api-reference)

---

## Overview

The Emergent Social Dynamics system simulates realistic social behavior in multi-agent environments. Bots form relationships organically based on personality compatibility, interaction history, and shared experiences. The system models complex social phenomena including:

- **Affinity-based relationships** that evolve over time
- **Organic gang formations** when mutual affinity exceeds thresholds
- **Reputation cascades** that propagate through social networks
- **Social clustering** by personality and faction alignment
- **Influence spreading** from popular/influential bots to their networks
- **Gang coordination** for wars, missions, and collective actions
- **Social memory** that affects future decision-making

### Key Innovations

1. **Graph Theory-Based Network Analysis**: Uses betweenness centrality, eigenvector centrality, and community detection algorithms
2. **Multi-Dimensional Affinity**: Considers personality traits, faction alignment, and interaction history
3. **Cascade Propagation**: Reputation changes ripple through networks with diminishing strength
4. **Emergent Gang Formation**: Groups form naturally without top-down orchestration
5. **Influence Modeling**: Popular bots affect behavior of connected bots

---

## Features

### Organic Gang Formation

Bots with high mutual affinity (0.75+) automatically form gangs:

```typescript
const proposals = orchestrator.runCycle().gangProposals;
// Returns gang proposals with:
// - Suggested name/tag based on personality
// - Member list with mutual high affinity
// - Formation reason (combat prowess, shared goals, etc.)
```

**Gang Formation Logic:**
- Scans all relationships for high-affinity clusters
- Ensures mutual affinity between all members (not just star topology)
- Analyzes common personality traits
- Generates thematic names based on dominant traits
- Auto-forms gangs above 0.8 average affinity

### Friendship Network Analysis

Comprehensive social graph analysis with advanced metrics:

```typescript
const analysis = orchestrator.runCycle().networkAnalysis;

console.log(analysis.density); // Network connectedness (0-1)
console.log(analysis.avgPathLength); // Degrees of separation
console.log(analysis.clusteringCoefficient); // Local clustering
console.log(analysis.clusters); // Detected communities
console.log(analysis.centralNodes); // Most influential nodes
console.log(analysis.bridges); // Nodes connecting different clusters
```

**Network Metrics:**
- **Density**: Ratio of actual to possible connections
- **Path Length**: Average shortest path between nodes
- **Clustering Coefficient**: Tendency to form triangles
- **Betweenness Centrality**: How often nodes appear on shortest paths
- **Eigenvector Centrality**: Connection to other well-connected nodes

### Reputation Cascades

Actions affect standing with connected NPCs/players through network propagation:

```typescript
// Bot-0 helps Bot-1 (heroic action)
orchestrator.recordInteraction('bot-0', 'bot-1', 'help', 'positive');

// Reputation cascade automatically propagates:
// - Direct connection: +15 reputation
// - 1 degree out: +7.5 reputation (50% decay)
// - 2 degrees out: +3.75 reputation (25% of original)
// - 3 degrees out: +1.875 reputation (12.5% of original)
```

**Cascade Factors:**
- Relationship affinity (higher affinity = stronger cascade)
- Relationship trust (higher trust = more impact)
- Network distance (exponential decay with distance)
- Action type (betrayal cascades strongly negative)

---

## Architecture

### System Layers

```
┌─────────────────────────────────────────────┐
│   EmergentDynamicsOrchestrator              │
│   (Coordinates all social systems)          │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Affinity     │ │ Gang         │ │ Network      │
│ Calculator   │ │ Formation    │ │ Analyzer     │
└──────────────┘ └──────────────┘ └──────────────┘
        │           │           │
        ▼           ▼           ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Reputation   │ │ Influence    │ │ Gang         │
│ Cascade      │ │ Spreading    │ │ Coordination │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Core Components

### 1. AffinityCalculator

Calculates relationship affinity based on personality compatibility.

### 2. OrganicGangFormation

Identifies and creates gangs from high-affinity groups.

### 3. FriendshipNetworkAnalyzer

Analyzes social graph structure using graph theory algorithms.

### 4. ReputationCascadeManager

Propagates reputation changes through social networks.

### 5. InfluenceSpreadingSystem

Models how influential bots affect others' behavior.

### 6. GangCoordinationSystem

Coordinates gang activities and collective actions.

---

## Usage Examples

### Basic Setup

```typescript
import { EmergentDynamicsOrchestrator } from './EmergentDynamics.js';
import { PersonalitySystem } from '../intelligence/PersonalitySystem.js';

const orchestrator = new EmergentDynamicsOrchestrator();

// Register bots
for (let i = 0; i < 20; i++) {
  const personality = PersonalitySystem.createRandomPersonality();
  orchestrator.registerBot(`bot-${i}`, `Bot ${i}`, personality);
}
```

### Recording Interactions

```typescript
orchestrator.recordInteraction('bot-0', 'bot-1', 'cooperation', 'positive');
orchestrator.recordInteraction('bot-2', 'bot-3', 'combat', 'negative');
orchestrator.recordInteraction('bot-4', 'bot-5', 'betrayal', 'negative');
```

### Running Analysis

```typescript
const result = orchestrator.runCycle();

console.log(`Gang proposals: ${result.gangProposals.length}`);
console.log(`Network density: ${(result.networkAnalysis.density * 100).toFixed(2)}%`);
console.log(`Influence events: ${result.influenceEvents.length}`);
```

---

## Integration Guide

See `EmergentDynamics.example.ts` for comprehensive integration examples.

---

## API Reference

### EmergentDynamicsOrchestrator

Main orchestrator class that coordinates all social systems.

#### Key Methods

- `registerBot(botId, name, personality, faction?)` - Register a bot
- `recordInteraction(bot1Id, bot2Id, type, outcome, context?)` - Record interaction
- `runCycle()` - Run full analysis cycle
- `getAnalytics()` - Get comprehensive analytics
- `getBotSocialContext(botId)` - Get bot's social context
- `getVisualizationData()` - Get D3.js-compatible visualization data
- `exportSocialData()` - Export all data as JSON

---

## Testing

```bash
npm test client/tests/playtests/social/EmergentDynamics.test.ts
```

Run examples:

```bash
npx tsx client/tests/playtests/social/EmergentDynamics.example.ts
```

---

## Files

- `EmergentDynamics.ts` - Main implementation (2,800+ lines)
- `EmergentDynamics.example.ts` - Comprehensive examples
- `EmergentDynamics.test.ts` - Test suite
- `README.md` - This file

---

## Credits

**Author:** Agent 13 - Emergent Social Dynamics Architect
**Week:** 5-6
**Mission:** Create systems that enable emergent social behavior
