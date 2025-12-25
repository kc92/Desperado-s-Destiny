# Mail System Audit Report

## Overview
The Mail System handles player-to-player communication with optional gold attachments using MongoDB transactions for consistency. Features include soft-delete, unread tracking, mail search, and Socket.io notifications. Transaction-safe gold handling prevents duplication; permission checks enforce recipient-only claims.

## Files Analyzed
- Server: mail.service.ts, mail.controller.ts, mail.routes.ts, mailRateLimiter.ts
- Client: None found (basic HTTP API only)

## What's Done Well
- Transaction-safe gold handling with proper session management
- Character existence validation before mail operations
- Self-mail prevention
- Permission checks on all operations (recipient verification for claims/deletes)
- Soft-delete implementation with permanent cleanup when both parties delete
- Proper pagination with unread count tracking
- Integration with NotificationService for recipient alerts
- Socket.io room-based delivery notifications
- Lean queries for performance optimization
- Comprehensive error handling with detailed messages

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No maximum gold attachment limit | mail.service.ts:31-44 | goldAttachment parameter unchecked for upper bounds | Add max gold attachment validation (e.g., 1M gold per mail) |
| Race condition in gold claim | mail.service.ts:312 | mail.claimGoldAttachment() concurrent request could claim same gold twice | Use MongoDB findByIdAndUpdate with $set to make claim atomic |
| Mail rate limiter not enforced in controller | mail.controller.ts:15-43 | sendMail endpoint has no rate limit check | Add MailRateLimiter.checkRateLimit() call before mail.create |
| Missing input sanitization | mail.service.ts:33-39 | subject/body lengths validated but no HTML/script injection check | Sanitize with DOMPurify like chat system |
| No mailbox size limit | mail.service.ts:166-204 | Recipient can accumulate unlimited mails; DoS vector | Implement mailbox size limit (e.g., 500 mails) |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Sender name denormalization vulnerability | mail.service.ts:84-97 | senderName stored as-is at send time; orphaned if sender deleted | Use ObjectId references, resolve names on read |
| No mail attachment inventory sync | mail.service.ts:320 | Claimed gold added but no inventory lock | Use single transaction spanning claim, gold add, and character update |
| Missing permission check on getMail | mail.service.ts:249-272 | Request replayed after character deleted has no validation | Check character still exists when fetching mail |
| Concurrent delete race condition | mail.service.ts:370-378 | Concurrent deletes could skip permanent deletion | Use atomic update: findByIdAndUpdate |
| Report mail function incomplete | mail.service.ts:413-418 | reportMail only logs, doesn't create Report model | Implement complete report workflow |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No pagination validation | mail.controller.ts:56-57 | limit/offset parsed but no maximum enforced at service | Pass validation through to service |
| Missing database indexes | mail.service.ts:186-191 | Queries on recipientId, senderId without compound indexes | Create indexes: {recipientId, isRead, sentAt} |
| Mail search not implemented | mail.service.ts | No search endpoint for mail by subject/content | Implement searchMails() with regex escaping |
| Socket.io notification unconditional | mail.service.ts:143-152 | Emits mail:received without checking if recipient socket connected | Add presence check, queue for offline delivery |

## Bug Fixes Needed
1. **mail.service.ts:31** - Add validation: goldAttachment <= MAX_ATTACHMENT_GOLD (e.g., 1000000)
2. **mail.service.ts:312** - Replace mail.claimGoldAttachment() with atomic MongoDB findByIdAndUpdate
3. **mail.controller.ts:15** - Add: const rateLimit = await MailRateLimiter.checkRateLimit(req.user._id)
4. **mail.service.ts:33-39** - Add DOMPurify.sanitize(subject/body, {ALLOWED_TAGS: []})
5. **mail.service.ts:166** - Add mailbox size check and oldest auto-delete if limit exceeded
6. **mail.service.ts:370** - Use findByIdAndUpdate with $set: {deletedBySender/Recipient: true}

## Incomplete Implementations
- Mail Search: No search endpoint for subject/content filtering
- Mail Report Workflow: Only logs, no Report model or moderator queue
- Attachment History: No audit log of gold claims
- Offline Mail Queue: Socket.io notifications lost if recipient offline
- Mail Templates: System-generated mails use ad-hoc strings, no template engine

## Recommendations
1. **IMMEDIATE**: Add maximum gold attachment limit and validate before transaction
2. Convert mail.claimGoldAttachment() to atomic MongoDB operation
3. Enforce MailRateLimiter on sendMail endpoint
4. Add DOMPurify sanitization to subject/body fields
5. Implement mailbox size limit with auto-deletion of oldest
6. Denormalize sender/recipient names from Character objects on read

## Estimated Fix Effort
- Critical fixes: 10 hours
- High fixes: 8 hours
- Medium fixes: 6 hours
- Total: 24 hours

**Overall Score: 6/10** (Solid transaction safety for gold handling but critical gaps including missing rate limits, unbounded attachments, and incomplete reporting)
