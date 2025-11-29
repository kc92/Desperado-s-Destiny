# Bug Fixes for Agent 4: Combat/Crime System Testing

## Bugs Identified

### Bug 1: Actions Not Loading - API Response Mismatch (P1)
**Location:** `client/src/store/useGameStore.ts` Line 428

**Problem:**
- Backend API returns actions grouped by type: `{ CRIME: [], COMBAT: [], SOCIAL: [], CRAFT: [] }`
- Frontend expects a flat array of actions: `Action[]`
- This causes actions not to display in the UI

**Root Cause:**
The `fetchActions` function at line 428 directly assigns `response.data.actions` to state, but the backend controller (`server/src/controllers/action.controller.ts` line 300-305) returns a grouped object, not an array.

**Fix:**
Update `useGameStore.ts` fetchActions to flatten the grouped response:

```typescript
fetchActions: async (locationId?: string) => {
  set({ isLoading: true, error: null });

  try {
    const filters = locationId ? { locationId } : undefined;
    const response = await actionService.getActions(filters);

    if (response.success && response.data) {
      // Backend returns actions grouped by type, flatten them to an array
      const groupedActions = response.data.actions as any;
      const flatActions: Action[] = [];

      // Flatten the grouped actions into a single array
      if (groupedActions && typeof groupedActions === 'object') {
        Object.values(groupedActions).forEach((actionArray: any) => {
          if (Array.isArray(actionArray)) {
            flatActions.push(...actionArray);
          }
        });
      }

      set({
        actions: flatActions,
        isLoading: false,
        error: null,
      });
    } else {
      throw new Error(response.error || 'Failed to load actions');
    }
  } catch (error: any) {
    console.error('Failed to fetch actions:', error);
    set({
      actions: [],
      isLoading: false,
      error: error.message || 'Failed to load actions',
    });
  }
},
```

### Bug 2: Auth Token Not Accessible (P1)
**Location:** `client/src/store/useAuthStore.ts`

**Problem:**
- The auth token is stored in the auth store but not exposed for API calls
- The game state cannot access the token to make authenticated API requests
- This prevents the agent from performing actions via API

**Root Cause:**
The `useAuthStore` persists the user object but doesn't expose the JWT token as a separate field.

**Recommended Fix Option 1: Add Token to User Object**
Ensure the token is part of the user object returned from login and accessible via `user.token` or store it separately in the auth store.

**Recommended Fix Option 2: Add getToken Method**
Add a method to retrieve the token from localStorage or the auth store:

```typescript
interface AuthStore {
  // ... existing fields
  token: string | null;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ... existing state
      token: null,

      getToken: () => {
        const state = get();
        return state.token || localStorage.getItem('auth-token') || null;
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const user = await authService.login(credentials);
          const token = user.token || null; // Assuming token comes from user object

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store token separately for easy access
          if (token) {
            localStorage.setItem('auth-token', token);
          }
        } catch (error: any) {
          // ... error handling
        }
      },

      logout: async () => {
        // ... existing logout logic
        localStorage.removeItem('auth-token');
        set({ token: null });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Bug 3: Action Type Definitions Mismatch (P2)
**Location:** `client/src/pages/Actions.tsx` Lines 44-77

**Problem:**
The UI defines action types that don't match the backend ActionType enum:
- UI has: `'work', 'crime', 'social', 'exploration', 'skill'`
- Backend has: `'CRIME', 'COMBAT', 'CRAFT', 'SOCIAL'` (from `server/src/models/Action.model.ts`)

**Fix:**
Update the categories array to match backend types:

```typescript
const categories: ActionCategory[] = [
  {
    type: 'CRIME' as ActionType,
    name: 'Criminal',
    icon: '🔫',
    description: 'Illegal activities with risk',
    color: 'bg-red-500'
  },
  {
    type: 'COMBAT' as ActionType,
    name: 'Combat',
    icon: '⚔️',
    description: 'Fight NPCs and enemies',
    color: 'bg-orange-500'
  },
  {
    type: 'SOCIAL' as ActionType,
    name: 'Social',
    icon: '🤝',
    description: 'Interact with others',
    color: 'bg-green-500'
  },
  {
    type: 'CRAFT' as ActionType,
    name: 'Crafting',
    icon: '🔨',
    description: 'Create and build items',
    color: 'bg-blue-500'
  }
];
```

## Testing Plan

1. **Fix Bug 1** - Flatten actions response
2. **Fix Bug 2** - Expose auth token properly
3. **Fix Bug 3** - Align action types
4. **Re-run Agent 4** - Verify actions display and can be performed
5. **Test Combat Flow** - Ensure combat encounters work end-to-end
6. **Test Crime Resolution** - Verify jail/wanted system works correctly

## Impact Assessment

- **P1 Bugs:** Block all action/crime testing - must be fixed immediately
- **P2 Bugs:** Cause UI/UX issues but don't block functionality
- **Estimated Fix Time:** 30 minutes
- **Re-test Time:** 10 minutes with Agent 4
