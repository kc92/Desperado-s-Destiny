/**
 * HawkDialogueBox Component
 *
 * Phase 16: Displays Hawk's dialogue with typewriter effect and western styling
 * Handles dialogue progression, choices, and contextual tips
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HawkAvatar, HAWK_PROFILE } from './HawkAvatar';
import { Button } from '@/components/ui';
import type { HawkExpression, HawkDialogue } from '@/services/tutorial.service';

// ============================================================================
// TYPEWRITER CONSTANTS
// ============================================================================

const CHAR_DELAY = 35; // ms per character
const PUNCTUATION_DELAY = 150; // extra delay after . ! ?
const COMMA_DELAY = 80; // extra delay after ,

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface HawkDialogueBoxProps {
  /** Dialogue content to display */
  dialogue: HawkDialogue | null;
  /** Whether the dialogue box is visible */
  isVisible?: boolean;
  /** Position on screen */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
  /** Whether this is a contextual tip (smaller styling) */
  isTip?: boolean;
  /** Callback when dialogue is dismissed */
  onDismiss?: () => void;
  /** Callback when dialogue completes typing */
  onComplete?: () => void;
  /** Callback when a choice is selected */
  onChoiceSelect?: (choiceId: string) => void;
  /** Player name for text substitution */
  playerName?: string;
  /** Whether to allow skipping typewriter */
  allowSkip?: boolean;
  /** Whether dialogue can be dismissed */
  dismissable?: boolean;
}

// ============================================================================
// POSITION CLASSES
// ============================================================================

type Position = HawkDialogueBoxProps['position'];

const POSITION_CLASSES: Record<NonNullable<Position>, string> = {
  'bottom-left': 'fixed bottom-4 left-4',
  'bottom-right': 'fixed bottom-4 right-4',
  'top-left': 'fixed top-20 left-4',
  'top-right': 'fixed top-20 right-4',
  'center': 'fixed inset-0 flex items-center justify-center p-4',
};

// ============================================================================
// COMPONENT
// ============================================================================

export const HawkDialogueBox: React.FC<HawkDialogueBoxProps> = ({
  dialogue,
  isVisible = true,
  position = 'bottom-left',
  isTip = false,
  onDismiss,
  onComplete,
  onChoiceSelect,
  playerName = 'partner',
  allowSkip = true,
  dismissable = true,
}) => {
  // Local state
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  // Refs for cleanup
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  const charIndexRef = useRef(0);
  const completedRef = useRef(false);

  // Escape HTML entities
  const escapeHtml = useCallback((str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }, []);

  // Process text with placeholders
  const processText = useCallback(
    (text: string): string => {
      const safePlayerName = escapeHtml(playerName);
      return text
        .replace(/\[player_name\]/g, safePlayerName)
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold-light">$1</strong>');
    },
    [playerName, escapeHtml]
  );

  // Typewriter effect
  const startTypewriter = useCallback(
    (text: string) => {
      if (!text) return;

      setIsTyping(true);
      setDisplayedText('');
      setShowChoices(false);
      charIndexRef.current = 0;
      completedRef.current = false;

      const processedText = processText(text);
      const plainText = processedText.replace(/<[^>]+>/g, ''); // Strip HTML for timing

      const typeChar = () => {
        if (charIndexRef.current < plainText.length) {
          const char = plainText[charIndexRef.current];
          charIndexRef.current++;

          // Build displayed text (simplified approach)
          setDisplayedText(processedText.substring(0, charIndexRef.current + (processedText.length - plainText.length)));

          // Calculate delay for next character
          let delay = CHAR_DELAY;
          if (['.', '!', '?'].includes(char)) {
            delay = PUNCTUATION_DELAY;
          } else if (char === ',') {
            delay = COMMA_DELAY;
          }

          typewriterRef.current = setTimeout(typeChar, delay);
        } else {
          setIsTyping(false);
          completedRef.current = true;
          setShowChoices(true);
          onComplete?.();
        }
      };

      typeChar();
    },
    [processText, onComplete]
  );

  // Skip typewriter
  const skipTypewriter = useCallback(() => {
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current);
    }
    if (dialogue?.text) {
      setDisplayedText(processText(dialogue.text));
    }
    setIsTyping(false);
    completedRef.current = true;
    setShowChoices(true);
    onComplete?.();
  }, [dialogue, processText, onComplete]);

  // Handle click/continue
  const handleContinue = useCallback(() => {
    if (isTyping && allowSkip) {
      skipTypewriter();
    } else if (!isTyping && dismissable && !dialogue?.hasChoice) {
      onDismiss?.();
    }
  }, [isTyping, allowSkip, skipTypewriter, dismissable, dialogue, onDismiss]);

  // Handle choice selection
  const handleChoiceSelect = useCallback(
    (choiceId: string) => {
      onChoiceSelect?.(choiceId);
      onDismiss?.();
    },
    [onChoiceSelect, onDismiss]
  );

  // Start typewriter when dialogue changes
  useEffect(() => {
    if (dialogue?.text && isVisible) {
      startTypewriter(dialogue.text);
    }

    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [dialogue, isVisible, startTypewriter]);

  // Handle keyboard
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleContinue();
      } else if (e.key === 'Escape' && dismissable) {
        onDismiss?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleContinue, dismissable, onDismiss]);

  // Don't render if no dialogue or not visible
  if (!dialogue || !isVisible) {
    return null;
  }

  // Tip styling (compact)
  if (isTip) {
    return (
      <TipBox
        dialogue={dialogue}
        displayedText={displayedText}
        isTyping={isTyping}
        position={position}
        onDismiss={onDismiss}
        dismissable={dismissable}
      />
    );
  }

  // Full dialogue box
  const isCenter = position === 'center';

  return (
    <div
      className={`${POSITION_CLASSES[position]} z-[9998] pointer-events-none`}
      role="dialog"
      aria-label="Hawk dialogue"
    >
      <div
        className={`${
          isCenter ? 'max-w-2xl w-full' : 'max-w-md w-full'
        } pointer-events-auto`}
      >
        {/* Main dialogue container */}
        <div className="bg-gradient-to-b from-leather-brown to-leather-dark border-4 border-gold-dark rounded-lg shadow-2xl overflow-hidden">
          {/* Wood frame corners */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-3 h-3 bg-gold-dark/50 rounded-full translate-x-1 translate-y-1" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-gold-dark/50 rounded-full -translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 left-0 w-3 h-3 bg-gold-dark/50 rounded-full translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-gold-dark/50 rounded-full -translate-x-1 -translate-y-1" />
          </div>

          {/* Header with avatar and name */}
          <div className="flex items-start gap-4 p-4 pb-2 relative">
            {/* Avatar */}
            <HawkAvatar
              expression={dialogue.expression}
              size="medium"
              isActive={true}
              isSpeaking={isTyping}
            />

            {/* Name and dismiss button */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-western text-gold-light">
                    {HAWK_PROFILE.name}
                  </h3>
                  <p className="text-xs text-desert-stone">{HAWK_PROFILE.title}</p>
                </div>
                {dismissable && (
                  <button
                    onClick={onDismiss}
                    className="text-xs text-desert-stone/70 hover:text-desert-sand transition-colors px-2 py-1"
                    aria-label="Dismiss dialogue"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dialogue text */}
          <div className="px-4 pb-3 min-h-[60px]">
            <div
              className="text-desert-sand font-serif text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: displayedText }}
            />
            {/* Typing cursor */}
            {isTyping && (
              <span className="inline-block w-2 h-4 bg-gold-light/70 ml-1 animate-pulse" />
            )}
          </div>

          {/* Choices (if any) */}
          {showChoices && dialogue.hasChoice && dialogue.choices && (
            <div className="px-4 pb-3 space-y-2">
              {dialogue.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelect(choice.id)}
                  className="w-full text-left px-3 py-2 bg-wood-dark/50 hover:bg-wood-grain/30 border border-gold-dark/50 hover:border-gold-medium rounded transition-colors text-desert-sand text-sm"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end px-4 py-3 bg-wood-dark/50 border-t border-gold-dark/30">
            {!dialogue.hasChoice && (
              <Button variant="primary" size="sm" onClick={handleContinue}>
                {isTyping ? 'Skip' : 'Continue'}
              </Button>
            )}
          </div>
        </div>

        {/* Hint text */}
        <p className="text-center text-xs text-desert-stone/70 mt-2">
          Press Enter or click to {isTyping ? 'skip' : 'continue'}
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// TIP BOX (Compact contextual tip)
// ============================================================================

interface TipBoxProps {
  dialogue: HawkDialogue;
  displayedText: string;
  isTyping: boolean;
  position: NonNullable<Position>;
  onDismiss?: () => void;
  dismissable?: boolean;
}

const TipBox: React.FC<TipBoxProps> = ({
  dialogue,
  displayedText,
  isTyping,
  position,
  onDismiss,
  dismissable = true,
}) => {
  return (
    <div className={`${POSITION_CLASSES[position]} z-[9997]`}>
      <div className="max-w-xs w-full">
        <div className="bg-leather-dark/95 border-2 border-gold-dark rounded-lg shadow-lg overflow-hidden">
          {/* Compact header */}
          <div className="flex items-center gap-2 p-2 border-b border-gold-dark/30">
            <HawkAvatar expression={dialogue.expression} size="small" isSpeaking={isTyping} />
            <span className="text-sm font-semibold text-gold-light">{HAWK_PROFILE.name}</span>
            {dismissable && (
              <button
                onClick={onDismiss}
                className="ml-auto text-desert-stone/70 hover:text-desert-sand transition-colors text-lg leading-none"
                aria-label="Dismiss tip"
              >
                &times;
              </button>
            )}
          </div>

          {/* Tip text */}
          <div className="p-3">
            <div
              className="text-desert-sand text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: displayedText }}
            />
            {isTyping && (
              <span className="inline-block w-1.5 h-3 bg-gold-light/70 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FLOATING TIP INDICATOR
// ============================================================================

export interface FloatingTipIndicatorProps {
  /** Whether a tip is available */
  hasNewTip?: boolean;
  /** Current expression for avatar */
  expression?: HawkExpression;
  /** Click handler to show tip */
  onClick?: () => void;
}

export const FloatingTipIndicator: React.FC<FloatingTipIndicatorProps> = ({
  hasNewTip = false,
  expression = 'neutral',
  onClick,
}) => {
  if (!hasNewTip) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-4 z-[9996] group"
      aria-label="View Hawk's tip"
    >
      <div className="relative">
        <HawkAvatar
          expression={expression}
          size="medium"
          isActive={true}
          clickable
        />
        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-light rounded-full flex items-center justify-center text-xs font-bold text-leather-dark animate-bounce">
          !
        </span>
        {/* Hover tooltip */}
        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-leather-dark border border-gold-dark rounded px-2 py-1 text-xs text-desert-sand whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Hawk has a tip for you
        </span>
      </div>
    </button>
  );
};

// Display names
HawkDialogueBox.displayName = 'HawkDialogueBox';
FloatingTipIndicator.displayName = 'FloatingTipIndicator';

export default HawkDialogueBox;
