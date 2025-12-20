// client/src/utils/tutorialActionHandlers.ts

import { useTutorialStore } from '@/store/useTutorialStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useEffect, useRef } from 'react';

// Location IDs for tutorial navigation checks
const LOCATION_IDS = {
    RED_GULCH: '6501a0000000000000000001',
    ABANDONED_MINE: '6501a0000000000000000010',
    SNAKE_CREEK: '6501a0000000000000000012',
    WESTERN_OUTPOST: '6501a0000000000000000020',
    SPIRIT_SPRINGS: '6501a0000000000000000021',
    SMUGGLERS_DEN: '6501a0000000000000000022',
};

// Centralized function to complete a tutorial action
export const completeTutorialAction = (actionId: string) => {
  useTutorialStore.getState().completeAction(actionId);
};

// Check location-based tutorial actions and complete them if requirements are met
const checkLocationActions = (locationId: string | undefined, requiredAction: string | undefined): boolean => {
    if (!locationId || !requiredAction) return false;

    switch (requiredAction) {
        case 'navigate-to-red-gulch':
            return locationId === LOCATION_IDS.RED_GULCH;
        case 'travel-to-mine':
        case 'navigate-to-mine':
            return locationId === LOCATION_IDS.ABANDONED_MINE;
        case 'navigate-to-outpost':
            return locationId === LOCATION_IDS.WESTERN_OUTPOST;
        case 'navigate-to-springs':
            return locationId === LOCATION_IDS.SPIRIT_SPRINGS;
        case 'navigate-to-smugglers-den':
            return locationId === LOCATION_IDS.SMUGGLERS_DEN;
        case 'travel-to-wild-encounter':
            return locationId === LOCATION_IDS.SNAKE_CREEK;
        default:
            return false;
    }
};

// Check URL-based tutorial actions
const checkUrlActions = (pathname: string, requiredAction: string | undefined): boolean => {
    if (!requiredAction) return false;

    switch (requiredAction) {
        case 'navigate-jobs':
            return pathname.includes('/game/actions');
        case 'navigate-crafting':
            return pathname.includes('/game/crafting');
        case 'navigate-marketplace':
            return pathname.includes('/game/marketplace');
        case 'navigate-skills':
            return pathname.includes('/game/skills');
        case 'navigate-combat':
            return pathname.includes('/game/combat');
        default:
            return false;
    }
};

// --- Global Action Handlers (listen to broader events) ---

// This hook can be used in a top-level component (e.g., App.tsx or a layout)
// to listen for various global game events that complete tutorial steps.
export const useGlobalTutorialActionHandlers = () => {
    const completedActionsRef = useRef<Set<string>>(new Set());

    // Subscribe to character store for location changes
    useEffect(() => {
        let prevLocationId: string | undefined;

        // Subscribe to full character state changes
        const unsubscribeCharacter = useCharacterStore.subscribe((state) => {
            const locationId = state.currentCharacter?.locationId;

            // Only process if location actually changed
            if (locationId === prevLocationId) return;
            prevLocationId = locationId;

            // Get current tutorial state
            const tutorialState = useTutorialStore.getState();
            const { isActive, isPaused, currentSection, getCurrentStep, completeAction, completedActions } = tutorialState;

            // Only check if tutorial is in progress (active or paused/minimized)
            if (!currentSection || (!isActive && !isPaused)) return;

            const currentStep = getCurrentStep();
            const requiredAction = currentStep?.requiresAction;

            if (!requiredAction) return;

            // Skip if already completed
            if (completedActions.includes(requiredAction)) return;
            if (completedActionsRef.current.has(requiredAction)) return;

            // Check location-based actions
            if (checkLocationActions(locationId, requiredAction)) {
                completedActionsRef.current.add(requiredAction);
                completeAction(requiredAction);
            }
        });

        // Check initial state
        const initialLocationId = useCharacterStore.getState().currentCharacter?.locationId;
        if (initialLocationId) {
            prevLocationId = initialLocationId;
            const tutorialState = useTutorialStore.getState();
            const { isActive, isPaused, currentSection, getCurrentStep, completeAction, completedActions } = tutorialState;

            if (currentSection && (isActive || isPaused)) {
                const currentStep = getCurrentStep();
                const requiredAction = currentStep?.requiresAction;

                if (requiredAction && !completedActions.includes(requiredAction) && !completedActionsRef.current.has(requiredAction)) {
                    if (checkLocationActions(initialLocationId, requiredAction)) {
                        completedActionsRef.current.add(requiredAction);
                        completeAction(requiredAction);
                    }
                }
            }
        }

        return () => {
            unsubscribeCharacter();
        };
    }, []);

    // Subscribe to URL changes for navigation actions
    useEffect(() => {
        const checkNavigation = () => {
            const tutorialState = useTutorialStore.getState();
            const { isActive, isPaused, currentSection, getCurrentStep, completeAction, completedActions } = tutorialState;

            // Only check if tutorial is in progress
            if (!currentSection || (!isActive && !isPaused)) return;

            const currentStep = getCurrentStep();
            const requiredAction = currentStep?.requiresAction;

            if (!requiredAction) return;

            // Skip if already completed
            if (completedActions.includes(requiredAction)) return;
            if (completedActionsRef.current.has(requiredAction)) return;

            // Check URL-based actions
            if (checkUrlActions(window.location.pathname, requiredAction)) {
                completedActionsRef.current.add(requiredAction);
                completeAction(requiredAction);
            }
        };

        // Listen for route changes
        window.addEventListener('popstate', checkNavigation);

        // Check immediately and on any navigation
        checkNavigation();

        // Also check periodically for SPA navigation that doesn't trigger popstate
        const intervalId = setInterval(checkNavigation, 500);

        return () => {
            window.removeEventListener('popstate', checkNavigation);
            clearInterval(intervalId);
        };
    }, []);


    // --- Game Event Listeners ---
    // Helper to get tutorial state and check if an action should be completed
    const getTutorialState = () => {
        const state = useTutorialStore.getState();
        const { isActive, isPaused, currentSection, getCurrentStep, completeAction, completedActions } = state;
        const currentStep = getCurrentStep();
        const requiredAction = currentStep?.requiresAction;

        // Tutorial must be in progress (active or paused)
        const inProgress = currentSection && (isActive || isPaused);

        return { inProgress, requiredAction, completeAction, completedActions };
    };

    // Helper to check if action can be completed
    const canCompleteAction = (actionId: string): boolean => {
        const { inProgress, requiredAction, completedActions } = getTutorialState();
        if (!inProgress || requiredAction !== actionId) return false;
        if (completedActions.includes(actionId)) return false;
        if (completedActionsRef.current.has(actionId)) return false;
        return true;
    };

    // Helper to complete an action with deduplication
    const safeCompleteAction = (actionId: string) => {
        if (!canCompleteAction(actionId)) return;
        completedActionsRef.current.add(actionId);
        getTutorialState().completeAction(actionId);
    };

    // Job completion listener
    useEffect(() => {
        const handleJobCompleted = (event: CustomEvent<{ jobId: string }>) => {
            const actionId = `complete-job-${event.detail.jobId}`;
            safeCompleteAction(actionId);
        };

        window.addEventListener('game-event-job-completed', handleJobCompleted as EventListener);
        return () => window.removeEventListener('game-event-job-completed', handleJobCompleted as EventListener);
    }, []);

    // Item crafted listener
    useEffect(() => {
        const handleItemCrafted = (event: CustomEvent<{ recipeId: string }>) => {
            const actionId = `craft-${event.detail.recipeId}`;
            safeCompleteAction(actionId);
        };

        window.addEventListener('game-event-item-crafted', handleItemCrafted as EventListener);
        return () => window.removeEventListener('game-event-item-crafted', handleItemCrafted as EventListener);
    }, []);

    // Training started listener
    useEffect(() => {
        const handleTrainingStarted = () => {
            safeCompleteAction('start-training');
        };

        window.addEventListener('game-event-training-started', handleTrainingStarted as EventListener);
        return () => window.removeEventListener('game-event-training-started', handleTrainingStarted as EventListener);
    }, []);

    // Item sold listener
    useEffect(() => {
        const handleItemSold = (event: CustomEvent<{ itemId: string }>) => {
            const actionId = `sell-item-${event.detail.itemId}`;
            safeCompleteAction(actionId);
        };

        window.addEventListener('game-event-item-sold', handleItemSold as EventListener);
        return () => window.removeEventListener('game-event-item-sold', handleItemSold as EventListener);
    }, []);

    // Item equipped listener
    useEffect(() => {
        const handleItemEquipped = (event: CustomEvent<{ itemId: string }>) => {
            const actionId = `equip-${event.detail.itemId}`;
            safeCompleteAction(actionId);
        };

        window.addEventListener('game-event-item-equipped', handleItemEquipped as EventListener);
        return () => window.removeEventListener('game-event-item-equipped', handleItemEquipped as EventListener);
    }, []);

    // Combat event listeners
    useEffect(() => {
        const handleCombatStarted = (event: CustomEvent<{ enemyId: string }>) => {
            const specificAction = `initiate-combat-${event.detail.enemyId}`;
            const { requiredAction } = getTutorialState();

            if (requiredAction === specificAction || requiredAction === 'initiate-combat-tutorial') {
                safeCompleteAction(requiredAction);
            }
        };

        const handleCombatWon = (event: CustomEvent<{ enemyId: string }>) => {
            const specificAction = `defeat-${event.detail.enemyId}`;
            const { requiredAction } = getTutorialState();

            if (requiredAction === specificAction || requiredAction === 'defeat-wildlife-for-perfect-hide') {
                safeCompleteAction(requiredAction);
            }
        };

        window.addEventListener('game-event-combat-started', handleCombatStarted as EventListener);
        window.addEventListener('game-event-combat-won', handleCombatWon as EventListener);
        return () => {
            window.removeEventListener('game-event-combat-started', handleCombatStarted as EventListener);
            window.removeEventListener('game-event-combat-won', handleCombatWon as EventListener);
        };
    }, []);

    // Job accepted listener
    useEffect(() => {
        const handleJobAccepted = (event: CustomEvent<{ jobId: string }>) => {
            const actionId = `accept-job-${event.detail.jobId}`;
            safeCompleteAction(actionId);
        };

        window.addEventListener('game-event-job-accepted', handleJobAccepted as EventListener);
        return () => window.removeEventListener('game-event-job-accepted', handleJobAccepted as EventListener);
    }, []);

    // Panel opened listener
    useEffect(() => {
        const handlePanelOpened = (event: CustomEvent<{ panelId: string }>) => {
            const { requiredAction } = getTutorialState();
            const panelAction = `open-${event.detail.panelId}-panel`;
            const altAction = `open-${event.detail.panelId}`;

            if (requiredAction === panelAction || requiredAction === altAction) {
                safeCompleteAction(requiredAction);
            }
        };

        const handleInventoryOpened = () => {
            safeCompleteAction('open-inventory');
        };

        window.addEventListener('game-event-panel-opened', handlePanelOpened as EventListener);
        window.addEventListener('game-event-inventory-opened', handleInventoryOpened as EventListener);
        return () => {
            window.removeEventListener('game-event-panel-opened', handlePanelOpened as EventListener);
            window.removeEventListener('game-event-inventory-opened', handleInventoryOpened as EventListener);
        };
    }, []);

    // Skill queue listener
    useEffect(() => {
        const handleSkillQueued = (event: CustomEvent<{ skillId: string }>) => {
            const { skillId } = event.detail;
            const { requiredAction } = getTutorialState();
            const specificAction = `queue-skill-${skillId}`;

            if (requiredAction === specificAction) {
                safeCompleteAction(requiredAction);
            } else if (requiredAction === 'queue-skill-training' || requiredAction === 'toggle-skills') {
                safeCompleteAction(requiredAction);
            }
        };

        window.addEventListener('game-event-skill-queued', handleSkillQueued as EventListener);
        return () => window.removeEventListener('game-event-skill-queued', handleSkillQueued as EventListener);
    }, []);

    // Deck drawn listener
    useEffect(() => {
        const handleDeckDrawn = () => {
            const { requiredAction } = getTutorialState();
            if (requiredAction === 'draw-destiny-deck' ||
                requiredAction === 'draw-first-hand' ||
                requiredAction === 'practice-deck-draw') {
                safeCompleteAction(requiredAction);
            }
        };

        window.addEventListener('game-event-deck-drawn', handleDeckDrawn as EventListener);
        return () => window.removeEventListener('game-event-deck-drawn', handleDeckDrawn as EventListener);
    }, []);
};
