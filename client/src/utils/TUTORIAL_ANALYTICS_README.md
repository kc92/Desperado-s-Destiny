# Tutorial Analytics System

## Overview

The tutorial analytics system tracks user behavior during the tutorial/onboarding experience to identify pain points and areas for improvement. It captures skip events, completion times, and user progress to help optimize the tutorial flow.

## Features

### Automatic Tracking

The system automatically tracks:

- **Skip Events**: When users skip sections or the entire tutorial
  - Which section was skipped
  - Which step they were on when skipping
  - Tutorial progress percentage at skip time
  - Time spent in the section before skipping

- **Completion Events**: When users complete tutorial sections
  - Section completion timestamp
  - Time spent completing the section

- **Section Start Times**: Tracks when each section begins
  - Used to calculate time spent in sections

### Data Stored

All analytics data is persisted to localStorage alongside tutorial progress:

```typescript
interface TutorialAnalytics {
  skipEvents: TutorialSkipEvent[];
  completionEvents: TutorialCompletionEvent[];
  sectionStartTimes: Record<string, number>;
}
```

## Developer Tools

### Console Functions

In development mode, analytics tools are exposed on the window object. Access them via:

```javascript
window.tutorialAnalytics
```

Available methods:

#### `getReport()`
Returns the full analytics report including summary and detailed events.

```javascript
const report = window.tutorialAnalytics.getReport();
console.log(report);
```

#### `log()`
Logs a formatted, color-coded summary to the console.

```javascript
window.tutorialAnalytics.log();
```

Output includes:
- Total skips
- Completed sections count
- Average progress at skip
- Average time before skip
- Skips by section (table)
- Section completion times (table)
- Detailed skip events (table)

#### `painPoints()`
Analyzes analytics data and logs identified pain points.

```javascript
window.tutorialAnalytics.painPoints();
```

Identifies:
- Sections with high skip rates (3+ skips = high priority, 2+ = medium)
- Sections with long completion times (>5 min = high, >3 min = medium)
- Early tutorial abandonment (skips at <20% progress)
- Quick skips (<30 seconds in section)

#### `identify()`
Returns an array of pain point objects without logging.

```javascript
const issues = window.tutorialAnalytics.identify();
issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.section} - ${issue.reason}`);
});
```

#### `export()`
Downloads analytics data as a JSON file.

```javascript
window.tutorialAnalytics.export();
```

File format: `tutorial-analytics-YYYY-MM-DD.json`

## Usage Examples

### Basic Monitoring

During development, the system automatically logs skip events:

```
[Tutorial Analytics] Skip: {
  sectionId: "destiny_deck",
  stepId: "deck-3",
  timestamp: "2025-11-25T10:30:45.123Z",
  progress: 35,
  timeSpentMs: 45000
}
  Section: destiny_deck, Step: deck-3
  Progress: 35%, Time spent: 45s
```

### Viewing Summary After Testing

After testing the tutorial:

```javascript
// View formatted summary
window.tutorialAnalytics.log();

// Check for issues
window.tutorialAnalytics.painPoints();

// Export for analysis
window.tutorialAnalytics.export();
```

### Identifying Specific Issues

```javascript
const report = window.tutorialAnalytics.getReport();

// Find sections users skip most
console.log(report.summary.skipsBySection);
// { destiny_deck: 3, combat: 2, ... }

// Check completion times
console.log(report.summary.sectionCompletionTimes);
// { welcome: 120000, energy: 90000, ... } (milliseconds)

// Find early skips
const earlySkips = report.details.skipEvents.filter(e => e.progress < 20);
console.log(`${earlySkips.length} users skipped early`);
```

## Integration with API (Future)

The tracking functions include TODO placeholders for API integration:

```typescript
// In trackSkip() and trackCompletion()
// TODO: Optionally send to API endpoint
// apiClient.post('/api/analytics/tutorial-skip', event);
```

To enable API tracking:

1. Implement the API endpoint (e.g., `/api/analytics/tutorial-skip`)
2. Uncomment and update the API call in `useTutorialStore.ts`
3. Consider batching events to reduce API calls
4. Add error handling for failed submissions

Example API implementation:

```typescript
// In trackSkip()
try {
  await fetch('/api/analytics/tutorial-skip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
} catch (error) {
  console.error('Failed to send analytics:', error);
  // Analytics tracking failure should not block user experience
}
```

## Pain Point Analysis Guide

### High Priority Issues

**High Skip Count (3+ skips)**
- Indicates confusing or frustrating content
- Action: Review section content and clarity
- Action: Simplify instructions or add visuals

**Very Long Completion (>5 minutes)**
- Section may be too complex or unclear
- Action: Break into smaller steps
- Action: Add clearer guidance

**Early Skips (<20% progress)**
- Users abandoning tutorial quickly
- Action: Review welcome section engagement
- Action: Ensure value is communicated early

### Medium Priority Issues

**Moderate Skip Count (2 skips)**
- Potential friction point
- Action: Monitor and gather user feedback

**Long Completion (3-5 minutes)**
- Section may be slightly too long
- Action: Consider optimization

**Quick Skips (<30 seconds)**
- Users may not be reading content
- Action: Review pacing and engagement

## Testing the Analytics

### Manual Testing Workflow

1. Reset tutorial progress (or use new browser profile)
2. Start tutorial: `useTutorialStore.getState().startTutorial()`
3. Navigate through some sections
4. Skip a section: Click "Skip Section" button
5. View analytics: `window.tutorialAnalytics.log()`
6. Check pain points: `window.tutorialAnalytics.painPoints()`

### Test Scenarios

**Scenario 1: Early Skip**
- Start tutorial
- Skip on first or second section
- Expected: Analytics shows early skip with low progress %

**Scenario 2: Section Completion**
- Complete entire section normally
- Expected: Completion event logged with time spent

**Scenario 3: Multiple Skips**
- Skip several sections in sequence
- Expected: Multiple skip events, pain point analysis shows high skip rate

**Scenario 4: Full Tutorial Skip**
- Click "Skip Tutorial" in modal
- Expected: Final skip event logged, summary available

## File Structure

```
client/src/
├── store/
│   └── useTutorialStore.ts         # Analytics state and tracking
├── components/tutorial/
│   ├── TutorialOverlay.tsx         # Skip confirmation with logging
│   └── MentorDialogue.tsx          # Skip section button with logging
└── utils/
    ├── tutorialAnalytics.ts        # Analysis and export utilities
    └── TUTORIAL_ANALYTICS_README.md # This file
```

## Analytics Data Schema

### Skip Event
```typescript
interface TutorialSkipEvent {
  sectionId: string;       // e.g., "destiny_deck"
  stepId: string;          // e.g., "deck-3"
  timestamp: string;       // ISO 8601 timestamp
  progress: number;        // 0-100 (percentage)
  timeSpentMs: number;     // Time in section before skip
}
```

### Completion Event
```typescript
interface TutorialCompletionEvent {
  sectionId: string;       // Section that was completed
  timestamp: string;       // ISO 8601 timestamp
  timeSpentMs: number;     // Time to complete section
}
```

### Analytics Summary
```typescript
interface AnalyticsSummary {
  totalSkips: number;
  skipsBySection: Record<string, number>;
  completedSections: string[];
  averageProgressAtSkip: number;
  averageTimeBeforeSkipMs: number;
  sectionCompletionTimes: Record<string, number>;
}
```

## Privacy Considerations

- All analytics are stored locally in browser localStorage
- No personal information is collected
- No automatic transmission to servers
- User can clear data by clearing browser storage
- Export function allows user to review exact data collected

## Future Enhancements

### Potential Additions

1. **Heatmap Visualization**
   - Visual representation of skip points
   - Color-coded sections by difficulty

2. **A/B Testing Support**
   - Track different tutorial variants
   - Compare metrics between versions

3. **Session Recording**
   - Detailed interaction timeline
   - Mouse/click tracking on tutorial elements

4. **Feedback Integration**
   - Combine analytics with user feedback
   - Prompt for feedback after skips

5. **Real-time Dashboard**
   - Live analytics viewing in dev tools
   - Auto-refresh during testing

6. **Aggregated Metrics**
   - API endpoint to collect anonymized data
   - View trends across all users

## Troubleshooting

### Analytics Not Appearing

**Check console logs:**
```javascript
// Verify tracking is working
useTutorialStore.getState().analytics
```

**Verify dev mode:**
```javascript
// Should be true in development
import.meta.env.DEV
```

**Clear storage and retry:**
```javascript
localStorage.removeItem('tutorial-storage');
window.location.reload();
```

### Missing Skip Events

**Ensure tracking is called:**
- Check `skipSection()` calls `trackSkip()`
- Check `skipTutorial()` calls `trackSkip()`
- Verify section and step IDs are valid

### Inaccurate Time Tracking

**Verify section start times:**
```javascript
const state = useTutorialStore.getState();
console.log(state.analytics.sectionStartTimes);
```

**Check for missing start time initialization:**
- Start times should be set in `startTutorial()`, `skipSection()`, and `completeSection()`

## Questions or Issues?

For questions about the analytics system:
1. Review this documentation
2. Check console logs for errors
3. Use `window.tutorialAnalytics.getReport()` to inspect state
4. Test with fresh browser session

## Summary

The tutorial analytics system provides comprehensive tracking of user behavior during onboarding. Use the developer tools to identify pain points, optimize content, and improve the tutorial experience. All data is stored locally and can be exported for analysis.

**Quick Start:**
```javascript
// After testing the tutorial:
window.tutorialAnalytics.log();        // View summary
window.tutorialAnalytics.painPoints(); // See issues
window.tutorialAnalytics.export();     // Download data
```
