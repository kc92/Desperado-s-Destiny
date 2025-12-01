// client/src/utils/tutorialActionHandlers.ts

import { useTutorialStore } from '@/store/useTutorialStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useEffect, useRef } from 'react';

// Centralized function to complete a tutorial action
export const completeTutorialAction = (actionId: string) => {
  useTutorialStore.getState().completeAction(actionId);
};

// --- Global Action Handlers (listen to broader events) ---

// This hook can be used in a top-level component (e.g., App.tsx or a layout)
// to listen for various global game events that complete tutorial steps.
export const useGlobalTutorialActionHandlers = () => {
    const { isActive, currentSection, currentStep, getCurrentStep, completeAction } = useTutorialStore();
    const { currentCharacter } = useCharacterStore(); // For checking current location, inventory, etc.
    const hasNavigatedToRedGulch = useRef(false);

    const currentStepData = getCurrentStep();

    useEffect(() => {
        if (!isActive || !currentStepData?.requiresAction) return;

        // --- Navigation Actions ---
        const checkNavigation = () => {
            // Note: LOCATION_IDS is a server-side constant. Using its string representation.
            const RED_GULCH_ID = '6501a0000000000000000001';
            const ABANDONED_MINE_ID = '6501a0000000000000000010';
            const SNAKE_CREEK_ID = '6501a0000000000000000012'; // Using Snake Creek as a wild encounter zone

            switch (currentStepData.requiresAction) {
                case 'navigate-to-red-gulch':
                    if (currentCharacter?.locationId === RED_GULCH_ID && !hasNavigatedToRedGulch.current) {
                        hasNavigatedToRedGulch.current = true; // Prevent re-triggering
                        completeAction('navigate-to-red-gulch');
                    }
                    break;
                case 'travel-to-mine':
                    if (currentCharacter?.locationId === ABANDONED_MINE_ID) {
                        completeAction('travel-to-mine');
                    }
                    break;
                case 'travel-to-wild-encounter':
                    if (currentCharacter?.locationId === SNAKE_CREEK_ID) { // Or any designated wild encounter zone
                        completeAction('travel-to-wild-encounter');
                    }
                    break;
                case 'navigate-jobs':
                    if (window.location.pathname.includes('/game/actions')) { // "Actions" is where jobs are
                        completeAction('navigate-jobs');
                    }
                    break;
                case 'navigate-crafting':
                    if (window.location.pathname.includes('/game/crafting')) {
                        completeAction('navigate-crafting');
                    }
                    break;
                case 'navigate-marketplace':
                    if (window.location.pathname.includes('/game/marketplace')) {
                        completeAction('navigate-marketplace');
                    }
                    break;
                case 'navigate-skills':
                    if (window.location.pathname.includes('/game/skills')) {
                        completeAction('navigate-skills');
                    }
                    break;
                case 'navigate-combat':
                    if (window.location.pathname.includes('/game/combat')) {
                        completeAction('navigate-combat');
                    }
                    break;
                // Add more navigation/panel opening actions here as needed
            }
        };

        // Listen for route changes
        window.addEventListener('popstate', checkNavigation);
        checkNavigation(); // Check on mount/effect run
        return () => window.removeEventListener('popstate', checkNavigation);
    }, [isActive, currentStepData, currentCharacter, completeAction]);


    // --- Game Event Listeners (e.g., for job completion, item usage, crafting) ---
    // These would typically be handled by subscribing to a global event bus or
    // by modifying existing game service functions to call `completeTutorialAction`.

    // Example: Listening for a custom event when a job is completed
    useEffect(() => {
        if (!isActive || !currentStepData?.requiresAction) return;

        const handleJobCompleted = (event: CustomEvent<{ jobId: string }>) => {
            if (currentStepData.requiresAction === `complete-job-${event.detail.jobId}`) {
                completeAction(currentStepData.requiresAction);
            }
        };

        window.addEventListener('game-event-job-completed', handleJobCompleted as EventListener);
        return () => window.removeEventListener('game-event-job-completed', handleJobCompleted as EventListener);
    }, [isActive, currentStepData, completeAction]);

    // Example: Listening for a custom event when an item is crafted
    useEffect(() => {
        if (!isActive || !currentStepData?.requiresAction) return;

        const handleItemCrafted = (event: CustomEvent<{ recipeId: string }>) => {
            if (currentStepData.requiresAction === `craft-${event.detail.recipeId}`) {
                completeAction(currentStepData.requiresAction);
            }
        };

        window.addEventListener('game-event-item-crafted', handleItemCrafted as EventListener);
        return () => window.removeEventListener('game-event-item-crafted', handleItemCrafted as EventListener);
    }, [isActive, currentStepData, completeAction]);

    // Example: Listening for a custom event when item is sold
    useEffect(() => {
        if (!isActive || !currentStepData?.requiresAction) return;

        const handleItemSold = (event: CustomEvent<{ itemId: string }>) => {
            if (currentStepData.requiresAction === `sell-item-${event.detail.itemId}`) {
                completeAction(currentStepData.requiresAction);
            }
        };

        window.addEventListener('game-event-item-sold', handleItemSold as EventListener);
        return () => window.removeEventListener('game-event-item-sold', handleItemSold as EventListener);
    }, [isActive, currentStepData, completeAction]);

    // Example: Listening for specific item equipping
    useEffect(() => {
        if (!isActive || !currentStepData?.requiresAction) return;

        const handleItemEquipped = (event: CustomEvent<{ itemId: string }>) => {
            if (currentStepData.requiresAction === `equip-${event.detail.itemId}`) {
                completeAction(currentStepData.requiresAction);
            }
        };

        window.addEventListener('game-event-item-equipped', handleItemEquipped as EventListener);
        return () => window.removeEventListener('game-event-item-equipped', handleItemEquipped as EventListener);
    }, [isActive, currentStepData, completeAction]);


    // Placeholder for triggering combat
    useEffect(() => {
        if (!isActive || currentStepData?.requiresAction !== 'initiate-combat-coyote') return;
        // This would involve monitoring the combat state or an API call to start combat
        // For demonstration, we'll assume a direct call from a component.
    }, [isActive, currentStepData, completeAction]);
};
