# Secrets Discovery System Audit Report

## Overview
The Secrets Discovery System manages hidden content unlocking with sophisticated requirement checking (NPC trust, quests, items, level, faction standing, time-based, etc.). Secrets can be one-time discoveries or repeatable with cooldowns, and unlock rewards including gold, XP, items, quests, and achievements.

## Files Analyzed
- Server: secrets.service.ts, secrets.controller.ts, secrets.routes.ts, Secret.model.ts

## What's Done Well
- Comprehensive requirement checking system supporting 10 requirement types with clear descriptions
- Transactional unlock mechanism using MongoDB sessions to ensure consistency
- Well-designed reward system with 8 reward types covering all major reward categories
- Good separation between secret definitions and character discoveries
- Proper compound indexing on characterId+secretId for quick lookups
- Excellent controller input validation with AppError error handling
- Location-based secrets retrieval with hint system based on progress
- Repeatable secrets with cooldown support
- Statistics tracking and progress checking
- Type-safe enums for secret types and requirement types

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| NPC trust requirement not implemented | secrets.service.ts:143-147 | npc_trust type returns hardcoded true; never checks actual NPC trust | Implement NPC trust system integration |
| Location visit tracking not implemented | secrets.service.ts:204-208 | location_visit type returns hardcoded true; never checks visit count | Implement location visit tracking |
| Achievement service missing | secrets.service.ts:356-369 | Dynamic import commented out; achievement grant silently fails | Implement achievement service integration |
| Session parameter ignored in some calls | secrets.service.ts:246,264 | CharacterSecret.create() and save() calls don't consistently use session | Use session parameter consistently |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No validation of secret existence before unlock | secrets.service.ts:218-243 | unlockSecret() doesn't verify secret was actually found after transaction | Add verification that secretDef exists |
| Inventory structure assumption | secrets.service.ts:160 | Assumes character.inventory is array of {itemId, quantity}; not validated | Verify inventory structure matches Character model |
| Race condition in discovery count | secrets.service.ts:262 | discoveryCount updated after loaded; another process could race | Use atomic $inc operator instead of read-modify-write |
| Missing quest completion validation | secrets.service.ts:150-156 | Assumes CharacterQuest model exists and has status field | Add validation or type checking |
| Skill level method not validated | secrets.service.ts:201 | Calls character.getSkillLevel() without checking it exists | Add method existence check |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No cooldown validation in unlock | secrets.service.ts:227 | canUnlockSecret() checks cooldown, but unlockSecret() doesn't | Add final cooldown check in unlockSecret() |
| XP reward not validated | secrets.service.ts:314-316 | Calls character.addExperience() without validation | Validate method exists |
| Inventory push without validation | secrets.service.ts:325-330 | Directly modifies character.inventory without type validation | Add type checking for inventory structure |
| Progress calculation could divide by zero | secrets.service.ts:122-124 | If requirements empty, returns 100 progress | Document why empty requirements = 100% |
| No logging in critical paths | secrets.service.ts:218-288 | Unlock transaction lacks logging for debugging | Add logger calls at key decision points |
| Repeatable secret without explicit check | secrets.service.ts:246 | Doesn't verify isRepeatable flag before creating first discovery | Verify isRepeatable flag first |

## Bug Fixes Needed
1. **secrets.service.ts:143-147** - Implement NPC trust checking or clearly document stub
2. **secrets.service.ts:204-208** - Implement location visit tracking or clearly document stub
3. **secrets.service.ts:356-369** - Uncomment and implement achievement service integration
4. **secrets.service.ts:262** - Use atomic $inc for discoveryCount instead of read-modify-write
5. **secrets.service.ts:246-257** - Add session parameter to all CharacterSecret operations
6. **secrets.service.ts:227** - Add final cooldown check in unlockSecret()
7. **secrets.service.ts:539-541** - Check for unlockCheck.progress before accessing

## Incomplete Implementations
- NPC Trust System: Returns hardcoded true; needs integration with NPC trust tracking
- Location Visit Tracking: Returns hardcoded true; needs location visit counter implementation
- Achievement Grant Integration: Achievement service import is commented out; granting is skipped
- Character Model Integration: Code assumes specific methods without validation

## Recommendations
1. **IMMEDIATE**: Implement or clearly stub NPC trust requirement checking
2. Implement or clearly stub location visit tracking
3. Fix race condition: use $inc for atomic discovery count increment
4. Add session parameter consistently to all DB operations
5. Verify Achievement service integration and uncomment code
6. Add final cooldown check in unlockSecret()
7. Validate Character model methods exist before calling
8. Add logging to critical unlock path for debugging

## Estimated Fix Effort
- Critical fixes: 5 hours
- High fixes: 6 hours
- Medium fixes: 4 hours
- Total: 15 hours

**Overall Score: 7/10** (Well-designed architecture with comprehensive feature set, but critical integrations are stubbed and there are race condition bugs)
