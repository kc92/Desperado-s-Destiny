# Context Summaries

This directory contains compacted context summaries for completed tasks. Each summary preserves essential learnings while discarding exploration details to keep context clean for future sessions.

## Template

When completing a task, create a summary file using this format:

```markdown
## Task Summary: [task-id]

### Test Written
- File: `tests/path/to/test.ts:line`
- Test: `test_function_name`
- Assertions: [list of what's tested]

### Implementation
- File: `src/path/to/file.ts:line`
- Changes: [summary of modifications]
- Dependencies: [new dependencies if any]

### Refactoring Applied
- [list of refactoring changes]

### Git Commits
- `[hash]` test(scope): [message]
- `[hash]` feat(scope): [message]
- `[hash]` refactor(scope): [message]

### Learnings for Future Tasks
- [transferable insights]
- [patterns discovered]
- [constraints identified]
```

## What to Keep vs. Discard

### Keep (Compact)
- File paths and line numbers
- Test names and assertions
- Implementation summary
- Commit hashes
- Key learnings

### Discard
- Search exploration details
- Failed attempt reasoning
- Verbose code discussions
- Tool output logs
- Intermediate debugging

## Naming Convention

Files should be named: `task-XXX-summary.md`

Example: `task-001-summary.md`
