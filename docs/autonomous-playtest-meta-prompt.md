# Autonomous Playtest Meta Prompt

## Purpose
This document provides instructions for conducting comprehensive autonomous playtests of Desperados Destiny using Chrome MCP DevTools. The goal is to simulate a new player experience, discover bugs, verify features, and stress-test the game systems.

## Prerequisites
- Server running at `http://localhost:5173`
- Chrome browser with DevTools MCP server connected
- Fresh test account (or create new one)

## Playtest Account Convention
```
Email: playtest{YYYY}{MMM}{DD}_{N}@example.com
Password: TestPass123!
```
Example: `playtest2026jan04_2@example.com`

## Core MCP Tools to Use

### Navigation & Interaction
- `mcp__chrome-devtools__navigate_page` - Navigate to URLs
- `mcp__chrome-devtools__take_snapshot` - Get page state (preferred over screenshots)
- `mcp__chrome-devtools__click` - Click elements by uid
- `mcp__chrome-devtools__fill` / `mcp__chrome-devtools__fill_form` - Fill inputs
- `mcp__chrome-devtools__wait_for` - Wait for text to appear

### Debugging
- `mcp__chrome-devtools__list_console_messages` - Check for JS errors
- `mcp__chrome-devtools__list_network_requests` - Check API calls
- `mcp__chrome-devtools__get_network_request` - Inspect specific requests

## Playtest Phases

### Phase 1: Account & Character Creation
1. Navigate to `http://localhost:5173/register`
2. Create new account with convention above
3. Create character with unique name (e.g., "AutoTest_{timestamp}")
4. Select faction (rotate between: Settler Alliance, Outlaw Confederacy, Native Coalition)
5. Verify character appears in selection screen
6. Enter game

### Phase 2: Tutorial & Onboarding
1. Check if tutorial auto-triggers for new players
2. Follow tutorial prompts if present
3. Note any tutorial bugs or UX issues
4. Verify mentor dialogue displays correctly

### Phase 3: Core Gameplay Loop
Test these systems in order of energy efficiency:

#### 3.1 Location Exploration
- Check current location details
- Visit buildings/NPCs
- Test travel to nearby locations
- Verify energy costs display correctly

#### 3.2 Actions & Skills
- Navigate to Actions page
- Attempt low-energy actions first
- Check skill XP gains
- Verify action cooldowns

#### 3.3 Crimes (Criminal Path)
- Navigate to Crimes page
- Start with "Pickpocket Drunk" (lowest risk)
- Play the Destiny Deck mini-game
- If jailed: note bail cost, wait or test prison activities
- Track wanted level increases

#### 3.4 Gathering
- Navigate to Gathering page
- Check available gathering nodes
- Attempt gathering if unlocked
- Verify materials received

#### 3.5 Crafting
- Navigate to Crafting page
- Check available recipes
- Attempt crafting if materials available
- Verify item creation

#### 3.6 Shop & Inventory
- Visit Shop, check prices display ($X format)
- Purchase affordable item
- Check Inventory, verify item appears
- Test equip/use/sell functions

#### 3.7 Skills Academy
- Navigate to Skill Academy
- Check available training courses
- Start a training if affordable
- Verify timer/completion

### Phase 4: Social Systems
- Check Gang page (join or view options)
- Check Mail system
- Check Leaderboard
- Check Quests

### Phase 5: Advanced Features (if accessible)
- Bounty Hunting
- Legendary Hunts
- Territory control
- Expeditions

## Bug Detection Checklist

### Currency Display
- [ ] All prices show "$X" not "Xg"
- [ ] Sidebar shows "$" prefix for dollars
- [ ] Bail costs match between display and actual charge

### Energy System
- [ ] Energy displays correctly in sidebar
- [ ] Energy costs shown on actions
- [ ] Energy regenerates over time
- [ ] Energy deducted correctly after actions

### Combat/Crime Mini-games
- [ ] Destiny Deck cards display properly
- [ ] Score calculations correct
- [ ] Rewards granted on success
- [ ] Jail triggered on failure/witness

### UI/UX Issues
- [ ] All modals open/close properly
- [ ] Loading states display correctly
- [ ] Error messages are clear
- [ ] Navigation works between pages

### Console Errors
- Check for JavaScript errors after each major action
- Note any 4xx/5xx API responses
- Flag unhandled promise rejections

## Reporting Format

When documenting issues, use this format:
```
**BUG**: [Brief description]
- **Location**: [Page/Component]
- **Steps**: [How to reproduce]
- **Expected**: [What should happen]
- **Actual**: [What happened]
- **Severity**: [Critical/High/Medium/Low]
```

## Session Logging

Track throughout the session:
- Character name and faction
- Current stats (energy, dollars, level)
- Locations visited
- Actions completed
- Bugs found
- Features verified working

## Autonomous Decision Making

When choosing next action:
1. Prioritize unexplored features
2. Choose actions that cost less energy
3. If stuck (low energy/jailed), check console and wait
4. If blocked by level requirements, find lower-level activities
5. If error occurs, document and try alternative path

## Energy Management Strategy

- Start with low-energy actions (5-15 energy)
- Reserve 50+ energy for crime mini-games
- Use rest/consumables if available
- Check energy regen rate and plan around it

## Time Management

- Actions are instant or have timers
- Jail has countdown (10-60 minutes typically)
- Skill training has longer timers (hours)
- Check current game time for time-locked content

## End Conditions

Stop playtest when:
1. Energy completely depleted AND no regen available
2. All accessible features tested
3. Blocked by level/progression gate
4. Critical bug prevents further play
5. Session time limit reached

## Post-Playtest

1. Summarize all bugs found
2. List features verified working
3. Note any UX improvements needed
4. Document character final state
5. Recommend fixes for critical issues
