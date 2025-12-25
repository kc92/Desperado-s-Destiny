# Desperados Destiny - Documentation Index

Master index of all game documentation.

---

## Quick Links

| Document | Audience | Description |
|----------|----------|-------------|
| [Game Design Document](./game-design-document.md) | All | Core game vision and mechanics |
| [Player Getting Started](./player-getting-started.md) | Players | New player onboarding guide |
| [API Reference](./api-reference.md) | Developers | Complete REST API documentation |
| [Database Schema](./database-schema.md) | Developers | MongoDB collections reference |
| [Architecture Overview](./architecture/overview.md) | Developers | System architecture |
| [Balance Constants](./balance/constants.md) | Designers | Game balance values |

---

## Documentation Structure

```
docs/
├── game-design-document.md          # Core design document
├── player-getting-started.md        # New player guide
├── energy-system-specification.md   # Energy mechanics
├── onboarding-tutorial-specification.md  # Tutorial flow
├── player-experience-gameplay-loops.md   # Gameplay design
├── decisions-tracker.md             # Design decisions log
│
├── guides/                          # Player-facing guides
│   ├── gang-warfare-guide.md        # Gang wars & territory
│   ├── boss-encounters-guide.md     # Boss fights
│   └── deity-karma-guide.md         # Karma & divine systems
│
├── architecture/                    # Technical architecture
│   └── overview.md                  # System overview
│
├── balance/                         # Game balance
│   └── constants.md                 # Balance constants reference
│
├── api-reference.md                 # REST API documentation
├── database-schema.md               # MongoDB schema reference
│
├── admin-handbook.md                # Server operations
├── deployment-checklist.md          # DevOps procedures
└── ui-design-improvement-plan.md    # UI roadmap
```

---

## Player Documentation

### Existing Guides

| Guide | Status | Description |
|-------|--------|-------------|
| [Getting Started](./player-getting-started.md) | Complete | New player introduction |
| [Gang Warfare](./guides/gang-warfare-guide.md) | Complete | War mechanics and strategy |
| [Boss Encounters](./guides/boss-encounters-guide.md) | Complete | Boss fight guide |
| [Deity & Karma](./guides/deity-karma-guide.md) | Complete | Divine systems guide |

### Planned Guides

| Guide | Priority | Topics |
|-------|----------|--------|
| Crime & Law | High | Crime chains, jail, bounties |
| Mining | High | Claims, deep mining, prospecting |
| Gambling | Medium | All gambling games, strategy |
| Crafting | Medium | Recipes, materials, workshops |
| Horse Racing | Medium | Breeding, racing, betting |
| Properties | Medium | Purchase, upgrades, income |
| Fishing & Hunting | Low | Mechanics, trophies |
| Prestige | Low | Endgame progression |

---

## Developer Documentation

### Core References

| Document | Status | Description |
|----------|--------|-------------|
| [API Reference](./api-reference.md) | Complete | 106 route modules documented |
| [Database Schema](./database-schema.md) | Complete | 148 models documented |
| [Architecture](./architecture/overview.md) | Complete | System diagrams and patterns |
| [Balance Constants](./balance/constants.md) | Complete | All balance values |

### Planned Technical Docs

| Document | Priority | Topics |
|----------|----------|--------|
| Job Queue Reference | High | All 34 Bull jobs |
| Socket.io Events | High | WebSocket event catalog |
| Service Patterns | Medium | Common code patterns |
| Testing Guide | Medium | Test setup and examples |
| Contributing Guide | Low | Development workflow |

---

## Design Documentation

### Existing Design Docs

| Document | Status | Description |
|----------|--------|-------------|
| [Game Design Document](./game-design-document.md) | Updated | Core vision (Dec 2024) |
| [Energy System](./energy-system-specification.md) | Complete | Full specification |
| [Tutorial System](./onboarding-tutorial-specification.md) | Complete | Hawk companion flow |
| [Gameplay Loops](./player-experience-gameplay-loops.md) | Complete | Loop design |
| [Decisions Tracker](./decisions-tracker.md) | Ongoing | 25+ decisions logged |

### Planned Design Docs

| Document | Priority | Topics |
|----------|----------|--------|
| NPC Systems Design | Medium | Gossip, memory, merchants |
| Territory Control | Medium | Influence, conquest, bonuses |
| Quest Chain Design | Medium | All 5 chains detailed |
| Contract System | Low | 67+ templates documented |

---

## Operations Documentation

### Existing Ops Docs

| Document | Status | Description |
|----------|--------|-------------|
| [Admin Handbook](./admin-handbook.md) | Complete | Server management |
| [Deployment Checklist](./deployment-checklist.md) | Complete | Deploy procedures |

### Planned Ops Docs

| Document | Priority | Topics |
|----------|----------|--------|
| Monitoring Guide | High | Sentry, metrics, alerts |
| Scaling Playbook | Medium | Horizontal scaling steps |
| Incident Response | Medium | Emergency procedures |
| Backup & Recovery | Medium | Data protection |

---

## Game Systems Coverage

### Fully Documented (10 systems)
1. Energy System
2. Tutorial/Onboarding
3. Destiny Deck Combat
4. Gang Warfare
5. Boss Encounters
6. World Bosses
7. Legendary Hunts
8. Deity & Karma
9. Skill System
10. Currency Economy

### Partially Documented (8 systems)
1. Territory Control (concept, not mechanics)
2. Properties (basic, not income formulas)
3. Quests (mentioned, not detailed)
4. Contracts (templates exist, not documented)
5. Crime (basic flow, not chains)
6. Gambling (games listed, not strategy)
7. NPCs (types listed, not behaviors)
8. Weather (exists, effects not documented)

### Undocumented (25+ systems)
See Phase 2 review in [plan file](../SESSION_HANDOFF.md) for full list including:
- Mining (claims, deep mining, illegal)
- Cattle Drives
- Horse Racing & Breeding
- Fishing
- Stagecoach/Train systems
- Heists
- Gossip & Reputation Spreading
- NPC Memory & Relationships
- Incidents & Protection
- Business Ownership
- And more...

---

## Documentation Metrics

### Current State (December 2024)

| Category | Documents | Total Lines |
|----------|-----------|-------------|
| Design Docs | 5 | ~5,200 |
| Player Guides | 4 | ~1,800 |
| Developer Docs | 4 | ~4,000 |
| Operations | 2 | ~700 |
| **Total** | **15** | **~11,700** |

### Coverage

| Metric | Value |
|--------|-------|
| Systems Reviewed | 43 |
| Systems Documented | 10 (23%) |
| API Endpoints Documented | 106 (100%) |
| Database Models Documented | 148 (100%) |
| Balance Constants Documented | 100% |

---

## Recent Updates (December 2024)

### Phase A: Core Document Updates
- Updated skill count: 25 → 29 skills
- Updated currency: Gold Dollars → Dollars/Gold/Silver
- Added combat abilities section
- Added Hawk tutorial companion

### Phase B: Player Guides Created
- Gang Warfare Guide (new)
- Boss Encounters Guide (new)
- Deity & Karma Guide (new)
- Player Getting Started (expanded)

### Phase C: Developer Docs Created
- API Reference (new, 106 endpoints)
- Database Schema (new, 148 models)
- Architecture Overview (new)
- Balance Constants (new)

---

## Contributing to Documentation

### Style Guide
- Use Markdown with GitHub flavor
- Include code examples where applicable
- Use tables for structured data
- Keep player guides separate from technical docs
- Update this index when adding new documents

### Document Template
```markdown
# [System Name] - [Document Type]

Brief description of what this document covers.

---

## Overview

[1-2 paragraph introduction]

---

## [Section 1]

[Content]

---

## Related Documents

- [Link to related doc 1]
- [Link to related doc 2]

---

*Last updated: [Month Year]*
```

---

## Future Roadmap

### Q1 2025
- Complete all player guides
- Document remaining game systems
- Create system interaction diagrams

### Q2 2025
- Video tutorials for complex systems
- Interactive API explorer
- Localization framework

---

*Documentation maintained by the Desperados Destiny development team.*
*Last updated: December 2024*
