/**
 * Typing Indicator Component
 *
 * Shows which users are currently typing in the active room
 */

import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  typingUsers: string[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typingUsers.length > 0) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [typingUsers]);

  if (!show || typingUsers.length === 0) {
    return null;
  }

  const getTypingText = (): string => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
    } else {
      return `${typingUsers[0]}, ${typingUsers[1]}, and ${typingUsers.length - 2} ${
        typingUsers.length - 2 === 1 ? 'other' : 'others'
      } are typing`;
    }
  };

  return (
    <div
      className="px-4 py-2 text-sm text-wood-grain italic animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label={getTypingText()}
    >
      <span>{getTypingText()}</span>
      <span className="inline-flex ml-1">
        <span className="animate-pulse" style={{ animationDelay: '0ms' }}>
          .
        </span>
        <span className="animate-pulse" style={{ animationDelay: '150ms' }}>
          .
        </span>
        <span className="animate-pulse" style={{ animationDelay: '300ms' }}>
          .
        </span>
      </span>
    </div>
  );
}
