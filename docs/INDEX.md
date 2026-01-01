# Desperados Destiny - Documentation Index

**Last Updated:** 2025-12-31
**Project Status:** ~95% Complete | Tutorial Refactor & Polish Phase

---

## Quick Links

| Need | Document |
|------|----------|
| New to the project? | [Developer Onboarding](guides/developer-onboarding.md) |
| System architecture? | [Architecture Overview](architecture/overview.md) |
| Tech stack details? | [Technical Stack](architecture/tech-stack.md) |
| Stuck on something? | [Troubleshooting Guide](guides/troubleshooting.md) |
| Game mechanics? | [Game Mechanics](game-design/mechanics.md) |

---

## Documentation Structure

```
docs/
├── INDEX.md                     # You are here
├── architecture/                # System design & technical specs
│   ├── overview.md              # High-level architecture
│   ├── tech-stack.md            # Technology decisions & rationale
│   ├── database-schemas.md      # MongoDB schema reference
│   └── api-reference.md         # API endpoint documentation
├── guides/                      # How-to guides
│   ├── developer-onboarding.md  # Getting started for new devs
│   ├── deployment.md            # Deployment procedures
│   └── troubleshooting.md       # Common issues & solutions
├── game-design/                 # Game systems documentation
│   ├── mechanics.md             # Core game mechanics
│   ├── economy.md               # Economy & trading systems
│   └── progression.md           # Skills, XP, leveling
├── lore/                        # World & story documentation
│   ├── world-history.md         # Sangre Territory history
│   ├── factions.md              # The three factions
│   └── mythology.md             # Supernatural elements
├── audits/                      # Quality & security audits
│   ├── CRITICAL-ISSUES.md       # Known critical issues
│   └── PRODUCTION_READINESS.md  # Production readiness checklist
└── archive/                     # Legacy documentation (reference only)
    ├── specifications/          # Original design specs
    ├── implementation-reports/  # Historical implementation reports
    ├── old-guides/              # Outdated guides
    └── quick-references/        # Quick reference cards
```

---

## By Topic

### Architecture & Technical

| Document | Description |
|----------|-------------|
| [Architecture Overview](architecture/overview.md) | System components, data flow, key directories |
| [Technical Stack](architecture/tech-stack.md) | Technology choices and rationale |
| [Database Schemas](architecture/database-schemas.md) | MongoDB model reference |
| [API Reference](architecture/api-reference.md) | REST API endpoints |

### Development Guides

| Document | Description |
|----------|-------------|
| [Developer Onboarding](guides/developer-onboarding.md) | New developer quick start |
| [Deployment Guide](guides/deployment.md) | Docker, staging, production |
| [Troubleshooting](guides/troubleshooting.md) | Common issues and solutions |

### Game Design

| Document | Description |
|----------|-------------|
| [Game Mechanics](game-design/mechanics.md) | Destiny Deck, combat, crime systems |
| [Economy](game-design/economy.md) | Gold, marketplace, property |
| [Progression](game-design/progression.md) | Skills, XP, levels |

### World & Lore

| Document | Description |
|----------|-------------|
| [World History](lore/world-history.md) | Sangre Territory timeline |
| [Factions](lore/factions.md) | Settler Alliance, Nahi Coalition, Frontera |
| [Mythology](lore/mythology.md) | Supernatural codex |

---

## TDD-RPI Workflow

This project uses the TDD-RPI (Test-Driven Development with Research-Plan-Implement) workflow.

### Workflow Files

| File | Purpose |
|------|---------|
| `.agent-session/feature_list.json` | Task backlog with status |
| `.agent-session/tdd_state.json` | Current TDD phase tracking |
| `.agent-session/context_summary.md` | Session context and learnings |
| `.agent-session/context_summaries/` | Compacted task summaries |

### Current Tasks

See `.agent-session/feature_list.json` for the current task backlog.

---

## Key Statistics

| Metric | Count |
|--------|-------|
| Total Lines of Code | 200,000+ |
| API Routes | 113+ |
| Services | 222+ |
| MongoDB Models | 217 |
| Client Pages | 73 |
| Component Categories | 41 |
| Zustand Stores | 36 |
| Test Files | 343+ |

---

## External Resources

- **Repository:** [GitHub](https://github.com/your-repo)
- **Project Board:** [GitHub Projects](https://github.com/your-repo/projects)
- **Issue Tracker:** [GitHub Issues](https://github.com/your-repo/issues)

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

---

*Built by Kaine & Hawk*
