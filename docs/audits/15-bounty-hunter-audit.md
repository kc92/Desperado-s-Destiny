# Bounty Hunter System Audit Report

## Overview
The Bounty Hunter System manages NPC bounty hunters that spawn to pursue wanted criminals, can be hired by players, and can be paid off or defeated in combat.

## Files Analyzed
- Server: bountyHunter.service.ts, bounty.service.ts, bountyHunter.controller.ts, bounty.controller.ts, bountyHunter.routes.ts

## What's Done Well
- Transaction safety with proper commit/abort
- Proper schema indexing for queries
- Wanted level integration with spawn rates
- Cooldown management for active hunters
- Flexible encounter types
- Dialogue integration for immersion

## Issues Found

### CRITICAL SECURITY
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No admin auth on cancel | bounty.controller.ts:277 | ANY user can cancel ANY bounties | Add requireAdmin middleware |

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No hunter validation race | bountyHunter.service.ts:161-212 | Hunter data could change | Add session-based locking |
| Territory false positives | bountyHunter.service.ts:595-604 | substring matching instead of exact | Use exact string match |
| Gold deduction not re-validated | bountyHunter.service.ts:359 | hasGold passes but deduct fails | Re-validate in transaction |
| Self-hiring abuse | bountyHunter.service.ts:307-436 | Can hire hunters against self | Add employerId !== targetId check |
| Active hunter race condition | bountyHunter.service.ts:389-410 | Updates not atomic with encounter | Move to transaction |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No encounter status validation | bountyHunter.service.ts:234-242 | canPayOff not validated against hunter | Validate hunter config |
| Fixed spawn rates | bountyHunter.service.ts:609-619 | No level-based scaling | Add difficulty scaling |
| No failed payoff logging | bountyHunter.service.ts:217-302 | Silent failures | Add logger.warn |

### LOW
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing faction validation | bounty.service.ts:97-182 | No faction membership check | Verify affiliation |

## Bug Fixes Needed
1. **CRITICAL SECURITY** - Add `requireAdmin` middleware to bounty cancel endpoint
2. **CRITICAL** - Add `if (employerId === targetId) throw` self-hire prevention
3. **CRITICAL** - Fix territory: `hunter.territory.includes(exactLocation)` not substring
4. **CRITICAL** - Re-validate gold in transaction before deduction
5. **HIGH** - Move encounter creation into transaction

## Incomplete Implementations
- Trust-Based Hiring (TODO at line 669) - NPC trust level not checked
- Bounty Claim Verification - no endpoint to claim rewards after hunter defeated
- Hunter Escape Mechanics - no pursuit system
- Bounty Expiration Sync - not tied to crime decay

## Integration Issues
- Bounty expiration uses fixed 7-day window vs crime decay
- No wanted level cleanup on character deletion

## Recommendations
1. **IMMEDIATE**: Add admin auth check to cancel endpoint
2. **IMMEDIATE**: Prevent self-hiring abuse
3. Fix territory matching to exact strings
4. Add difficulty scaling by character level
5. Implement trust-based hiring

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 2 hours
- Medium fixes: 2 hours
- Total: 8 hours

**Overall Score: 6/10** (Critical security issue with admin endpoint)
