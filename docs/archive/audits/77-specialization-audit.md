# Specialization System Audit Report

## Overview
The specialization system enables characters to choose one specialization per profession from 18 available paths (3 per profession). It tracks mastery progress, awards unique recipes, applies bonuses, and manages passive effects. Implementation uses transactions for data consistency and integrates with crafting system for mastery progression.

## Files Analyzed
- Server: specialization.service.ts
- Data: specializationPaths.ts
- Related: Character.model.ts (for specialization storage)

## What's Done Well
- Comprehensive specialization data with 18 paths, each with detailed bonuses and passive effects
- Uses MongoDB transactions for atomic choose-specialization operation
- Proper null-safety with `$ifNull` for optional character fields
- Mastery progress tracking with 100-point scale
- Reward system with legend recipes unlocked at mastery
- Bonus calculation supports context-aware matching (e.g., "crafting" vs "combat")
- Good code organization with static methods
- Proper separation between data (specializationPaths.ts) and logic (specialization.service.ts)
- Session cleanup in finally block

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Race condition in mastery progress updates | specialization.service.ts:219-267 | `updateMasteryProgress()` reads, modifies, and saves without transaction - concurrent crafting calls could lose progress | Wrap in transaction like chooseSpecialization() does |
| No transaction rollback on partial failure | specialization.service.ts:195-211 | Session ends but character could be left in inconsistent state if save() partially fails | Add explicit error handling in catch block |
| Unsafe specialization casting | specialization.service.ts:55-56,78-79,137-138 | Cast to `any` to access specializations array - no schema validation that field exists | Add specializations field to Character schema or use proper typing |
| Missing character existence validation | specialization.service.ts:219-227 | `updateMasteryProgress()` returns early if character not found but still tries to access character object | Add explicit check before accessing properties |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Gold deduction not validated | specialization.service.ts:173-181 | Deducts gold without checking integer overflow or negative values - could underflow | Add max bounds: `if (character.gold - goldCost < 0) throw error` |
| Missing authorisation check | specialization.service.ts:114-117 | No verification that characterId belongs to authenticated user - could choose specs for other players | Add user ownership check before modification |
| Specialization path validation weak | specialization.service.ts:127-129 | Only checks if path exists, not if it's valid for profession - mismatched data could be saved | Call `isValidSpecializationForProfession()` utility to verify |
| Recipe unlock logic inconsistent | specialization.service.ts:333-341 | `getUniqueRecipes()` adds both path.uniqueRecipes AND playerSpec.uniqueRecipesUnlocked - unclear when recipes actually unlock | Document when uniqueRecipesUnlocked array is populated |
| Incomplete mastery implementation | specialization.service.ts:408-409 | `awardMasteryProgressForCrafting()` hardcodes progress amounts with no difficulty scaling | Should scale with recipe level/quality |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Silent failure on invalid skill lookup | specialization.service.ts:81-82,160-163 | Looks up profession skill but doesn't validate skill actually exists in array | Add explicit check: `if (!professionSkill) throw new AppError(...)` |
| No duplicate specialization prevention at DB level | specialization.service.ts:141-146 | Checks duplicates in memory but no unique index on (character, path) in schema | Add MongoDB unique compound index |
| Response doesn't include mastery progress | specialization.service.ts:202-206 | `chooseSpecialization()` response omits masteryProgress field even though it's set | Include in response object |
| Missing profession existence validation | specialization.service.ts:71 | `getSpecializationsForProfession()` doesn't validate professionId is real before lookup | Add validation against PROFESSION_SKILLS array |
| No logging of specialization changes | specialization.service.ts:114-213 | Only logs at service level, no audit trail for who chose what | Add structured logging with timestamp and context |
| Passive effects never checked | specialization.service.ts:300-318 | `hasPassiveEffect()` exists but never called in any logic | Document where this method is consumed in game logic |

## Bug Fixes Needed
1. **specialization.service.ts:219-267** - Wrap updateMasteryProgress() in transaction
2. **specialization.service.ts:114-213** - Add user ownership validation before modifying character
3. **specialization.service.ts:127-129** - Call isValidSpecializationForProfession() validation
4. **specialization.service.ts:81-82,160-163** - Add explicit validation for profession skill existence
5. **specialization.service.ts:173-181** - Add bounds checking for gold deduction
6. **specialization.service.ts:408-409** - Add difficulty scaling for mastery progress awards
7. **specialization.service.ts:202-206** - Include masteryProgress in chooseSpecialization response
8. **Character.model.ts** - Add unique index for (userId, specializations.pathId) compound

## Incomplete Implementations
- Skill requirements not validated (only checks if level exists, not if meets minimum)
- No specialization reset/change mechanics (one-time choice only)
- Recipe unlock at mastery not fully implemented (uniqueRecipesUnlocked array never populated)
- No cosmetic rewards display in client response
- Bonus context matching is case-insensitive string includes (fragile implementation)
- No skill tree progression visualization data
- Missing specialization-specific stat bonuses (only crafting bonuses implemented)
- No PvP or combat-specific specialization bonuses in use

## Recommendations
1. **CRITICAL PRIORITY**: Add transaction wrapping around updateMasteryProgress()
2. **CRITICAL PRIORITY**: Add user ownership validation in chooseSpecialization()
3. Add unique compound index on Character schema for specialization constraints
4. Implement proper specializations field in Character schema instead of type `any` casting
5. Add detailed validation for profession level requirements
6. Implement recipe unlocking logic when mastery >= 100
7. Add difficulty-based scaling for mastery progress awards
8. Create specialization controller to expose service methods as endpoints
9. Add comprehensive logging/audit trail for specialization choices
10. Document where passive effects are consumed and validate they're actually applied

## Estimated Fix Effort
- Critical fixes: 5 hours
- High fixes: 6 hours
- Medium fixes: 5 hours
- Total: 16 hours

**Overall Score: 6/10** (Good transaction handling for main operation but missing transaction in mastery updates and no user authorization checks)
