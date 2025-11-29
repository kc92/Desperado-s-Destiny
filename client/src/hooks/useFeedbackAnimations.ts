/**
 * useFeedbackAnimations Hook
 * Central hook to manage all feedback animations in the game
 */

import { useState, useCallback } from 'react';

interface GoldAnimationData {
  id: string;
  amount: number;
  position: { x: number; y: number };
}

interface XPGainData {
  id: string;
  amount: number;
  position?: { x: number; y: number };
}

interface LevelUpData {
  newLevel: number;
}

interface FeedbackState {
  success: {
    show: boolean;
    message?: string;
  };
  failure: {
    show: boolean;
    message?: string;
  };
  levelUp: {
    show: boolean;
    newLevel: number;
  } | null;
  goldAnimations: GoldAnimationData[];
  xpGains: XPGainData[];
}

interface UseFeedbackAnimationsReturn {
  /** Current feedback state */
  state: FeedbackState;

  /** Show success animation */
  showSuccess: (message?: string) => void;

  /** Show failure animation */
  showFailure: (message?: string) => void;

  /** Show level up celebration */
  showLevelUp: (data: LevelUpData) => void;

  /** Add gold animation */
  addGoldAnimation: (amount: number, position: { x: number; y: number }) => void;

  /** Add XP gain animation */
  addXPGain: (amount: number, position?: { x: number; y: number }) => void;

  /** Clear success animation */
  clearSuccess: () => void;

  /** Clear failure animation */
  clearFailure: () => void;

  /** Clear level up celebration */
  clearLevelUp: () => void;

  /** Remove gold animation by ID */
  removeGoldAnimation: (id: string) => void;

  /** Remove XP gain by ID */
  removeXPGain: (id: string) => void;

  /** Clear all animations */
  clearAll: () => void;
}

/**
 * Hook to manage feedback animations
 * Provides a centralized way to trigger and manage all game feedback animations
 */
export function useFeedbackAnimations(): UseFeedbackAnimationsReturn {
  const [state, setState] = useState<FeedbackState>({
    success: { show: false },
    failure: { show: false },
    levelUp: null,
    goldAnimations: [],
    xpGains: [],
  });

  // Generate unique ID for animations
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Success animation
  const showSuccess = useCallback((message?: string) => {
    setState(prev => ({
      ...prev,
      success: { show: true, message },
      failure: { show: false }, // Clear failure if showing
    }));
  }, []);

  const clearSuccess = useCallback(() => {
    setState(prev => ({
      ...prev,
      success: { show: false },
    }));
  }, []);

  // Failure animation
  const showFailure = useCallback((message?: string) => {
    setState(prev => ({
      ...prev,
      failure: { show: true, message },
      success: { show: false }, // Clear success if showing
    }));
  }, []);

  const clearFailure = useCallback(() => {
    setState(prev => ({
      ...prev,
      failure: { show: false },
    }));
  }, []);

  // Level up celebration
  const showLevelUp = useCallback((data: LevelUpData) => {
    setState(prev => ({
      ...prev,
      levelUp: {
        show: true,
        newLevel: data.newLevel,
      },
    }));
  }, []);

  const clearLevelUp = useCallback(() => {
    setState(prev => ({
      ...prev,
      levelUp: null,
    }));
  }, []);

  // Gold animations
  const addGoldAnimation = useCallback((amount: number, position: { x: number; y: number }) => {
    const id = generateId();
    setState(prev => ({
      ...prev,
      goldAnimations: [
        ...prev.goldAnimations,
        { id, amount, position },
      ],
    }));
  }, [generateId]);

  const removeGoldAnimation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      goldAnimations: prev.goldAnimations.filter(anim => anim.id !== id),
    }));
  }, []);

  // XP gain animations
  const addXPGain = useCallback((amount: number, position?: { x: number; y: number }) => {
    const id = generateId();
    setState(prev => ({
      ...prev,
      xpGains: [
        ...prev.xpGains,
        { id, amount, position },
      ],
    }));
  }, [generateId]);

  const removeXPGain = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      xpGains: prev.xpGains.filter(gain => gain.id !== id),
    }));
  }, []);

  // Clear all animations
  const clearAll = useCallback(() => {
    setState({
      success: { show: false },
      failure: { show: false },
      levelUp: null,
      goldAnimations: [],
      xpGains: [],
    });
  }, []);

  return {
    state,
    showSuccess,
    showFailure,
    showLevelUp,
    addGoldAnimation,
    addXPGain,
    clearSuccess,
    clearFailure,
    clearLevelUp,
    removeGoldAnimation,
    removeXPGain,
    clearAll,
  };
}

export default useFeedbackAnimations;
