# Leaderboards System Audit Report

## Overview
The leaderboard system provides read-only ranking endpoints for multiple categories including level, gold, reputation, combat, bounties, and gangs. The implementation separates concerns between client hooks (React) and server controllers, with basic support for time-range filtering and pagination through MongoDB queries.

## Files Analyzed
- Server: leaderboard.controller.ts, leaderboard.routes.ts
- Client: useLeaderboard.ts

## What's Done Well
- Clean separation of concerns with dedicated hook for client-side state management
- Proper use of asyncHandler middleware for error propagation
- Consistent response format across all leaderboard endpoints
- Good database indexing strategy with composite indexes for leaderboard queries
- Pagination support with limit parameter (capped at 100)
- Support for multiple time ranges (all, daily, weekly, monthly)
- Lean queries used for read-only operations (reduced memory footprint)
- Gang leaderboard uses aggregation pipeline for computed fields (memberCount, territoryCount)

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing input validation on range parameter | leaderboard.controller.ts:34,71,108,158,198,235 | `range` parameter accepted without whitelist validation - could accept arbitrary values | Implement enum validation: `['all', 'daily', 'weekly', 'monthly']` |
| No authentication on public endpoints | leaderboard.routes.ts:23-58 | All leaderboard endpoints are public with no auth checks - no rate limiting | Consider adding optional auth and rate limiting middleware |
| Race condition in date filtering | leaderboard.controller.ts:15-25 | `getDateFilter()` mutates Date object during calculations - could return inconsistent dates on concurrent calls | Use immutable date operations |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing error boundary for character fetch | leaderboard.controller.ts:43-46,80-84,167-171,206-210 | No try-catch or null checks for Character.find() calls - could crash endpoint if DB fails | Wrap queries in try-catch, return 500 with proper error message |
| Unsafe integer parsing | leaderboard.controller.ts:35,72,109,159,199,236 | `parseInt(req.query.limit as string)` without base parameter, no bounds validation on min | Use `Math.min(100, Math.max(1, parseInt(limit, 10) || 100))` |
| Gang aggregation pipeline vulnerability | leaderboard.controller.ts:244-256 | Direct string field references without validation - could fail silently if schema changes | Add error handler for aggregation pipeline |
| Reputation calculation not documented | leaderboard.controller.ts:117-132 | Complex aggregation formula has no validation that fields exist | Add explicit `$ifNull` fallback |
| Total count missing from responses | leaderboard.controller.ts:60,97,147,185,224,270 | Response includes leaderboard data but no `total` count for pagination context | Add `.countDocuments()` call and include in response |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Client doesn't validate API responses | useLeaderboard.ts:108-118,137-146 | No schema validation on API responses - assumes correct data structure | Add runtime validation (e.g., Zod) for response shape |
| Error handling discrepancies | useLeaderboard.ts:119-122,147-150 | Catches errors but treats all as generic string messages - loses error details | Differentiate HTTP vs network errors for better UX |
| Hardcoded limits in client | useLeaderboard.ts:96 | Default limit of 100 could exceed server's capped limit under edge conditions | Use shared constant from SDK |
| Missing lastUpdated timestamp | leaderboard.controller.ts: all endpoints | Client sets `lastUpdated` but server doesn't track actual update time | Add server-side `lastUpdated` field to response |
| No caching strategy | useLeaderboard.ts:93-126 | Every call re-fetches entire leaderboard without caching or stale-while-revalidate | Consider SWR pattern or React Query for automatic caching |

## Bug Fixes Needed
1. **leaderboard.controller.ts:15-25** - Rewrite getDateFilter() with immutable date logic
2. **leaderboard.controller.ts:35,72,109,159,199,236** - Add proper parseInt with base 10 and bounds checking
3. **leaderboard.controller.ts:34,71,108,158,198,235** - Add range parameter enum validation
4. **leaderboard.controller.ts:43-56** - Wrap Character.find() in try-catch block
5. **leaderboard.routes.ts** - Add rate limiting middleware
6. **useLeaderboard.ts:108-146** - Add response schema validation
7. **leaderboard.controller.ts** - Add `.countDocuments()` calls for total counts

## Incomplete Implementations
- No last-updated timestamp tracking (client generates fake timestamp)
- No player-specific rank endpoint implementation visible in routes
- No pagination cursor support (only offset-based)
- Missing character avatar URLs in response (interface defines avatarUrl but not populated)
- Gang leaderboard missing leader name/ID in response
- No rate limiting protection (public endpoints could be hammered)
- No cache headers (Cache-Control, ETag) for public endpoints

## Recommendations
1. **CRITICAL PRIORITY**: Add input validation middleware for all query parameters (range, limit)
2. **CRITICAL PRIORITY**: Implement rate limiting on public endpoints to prevent abuse
3. Add try-catch blocks around all database operations with proper error responses
4. Add server-side `lastUpdated` tracking for accurate cache invalidation
5. Implement response schema validation in client (Zod/ts-guard)
6. Add `.countDocuments()` to responses for pagination awareness
7. Consider Redis caching layer for leaderboard data (expensive aggregations)
8. Standardize on aggregation pipeline for consistency
9. Add `/leaderboard/:category/me` endpoint for authenticated players to fetch their rank
10. Add API documentation with proper error codes and response schemas

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 5 hours
- Medium fixes: 4 hours
- Total: 13 hours

**Overall Score: 5/10** (Good structure but missing input validation and rate limiting on public endpoints is a security risk)
