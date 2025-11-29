/**
 * Tooltip Component
 * Western-themed tooltip with hover/focus support and positioning
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** Content to display in the tooltip */
  content: React.ReactNode;
  /** Element that triggers the tooltip */
  children: React.ReactElement;
  /** Preferred position (will flip if not enough space) */
  position?: TooltipPosition;
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /** Maximum width of tooltip */
  maxWidth?: number;
  /** Additional className for tooltip container */
  className?: string;
}

interface TooltipState {
  visible: boolean;
  position: { top: number; left: number };
  actualPosition: TooltipPosition;
}

const ARROW_SIZE = 6;
const OFFSET = 8;

/**
 * Western-themed tooltip component
 *
 * @example
 * <Tooltip content="Click to perform action">
 *   <Button>Perform Action</Button>
 * </Tooltip>
 *
 * @example
 * <Tooltip content={<span>Rich <strong>content</strong></span>} position="right">
 *   <InfoIcon />
 * </Tooltip>
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  disabled = false,
  maxWidth = 250,
  className = '',
}) => {
  const [state, setState] = useState<TooltipState>({
    visible: false,
    position: { top: 0, left: 0 },
    actualPosition: position,
  });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;
    let actualPosition = position;

    // Calculate initial position
    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - OFFSET;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + OFFSET;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - OFFSET;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + OFFSET;
        break;
    }

    // Flip if outside viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (position === 'top' && triggerRect.top - tooltipRect.height - OFFSET < 0) {
      top = triggerRect.bottom + scrollY + OFFSET;
      actualPosition = 'bottom';
    } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height + OFFSET > viewportHeight) {
      top = triggerRect.top + scrollY - tooltipRect.height - OFFSET;
      actualPosition = 'top';
    } else if (position === 'left' && triggerRect.left - tooltipRect.width - OFFSET < 0) {
      left = triggerRect.right + scrollX + OFFSET;
      actualPosition = 'right';
    } else if (position === 'right' && triggerRect.right + tooltipRect.width + OFFSET > viewportWidth) {
      left = triggerRect.left + scrollX - tooltipRect.width - OFFSET;
      actualPosition = 'left';
    }

    // Keep within horizontal bounds
    left = Math.max(OFFSET, Math.min(left, viewportWidth - tooltipRect.width - OFFSET));

    setState(prev => ({
      ...prev,
      position: { top, left },
      actualPosition,
    }));
  }, [position]);

  const showTooltip = useCallback(() => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, visible: true }));
    }, delay);
  }, [delay, disabled]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState(prev => ({ ...prev, visible: false }));
  }, []);

  // Calculate position after tooltip becomes visible
  useEffect(() => {
    if (state.visible) {
      // Use requestAnimationFrame to ensure tooltip is rendered
      requestAnimationFrame(calculatePosition);
    }
  }, [state.visible, calculatePosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Arrow position styles
  const arrowStyles: Record<TooltipPosition, string> = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-transparent border-t-leather-dark',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-transparent border-b-leather-dark',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-r-transparent border-l-leather-dark',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-transparent border-b-transparent border-l-transparent border-r-leather-dark',
  };

  // Clone child element with event handlers and ref
  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      children.props.onBlur?.(e);
    },
    'aria-describedby': state.visible ? 'tooltip' : undefined,
  });

  const tooltipContent = state.visible && createPortal(
    <div
      ref={tooltipRef}
      id="tooltip"
      role="tooltip"
      className={`
        fixed z-[10000] px-3 py-2 text-sm
        bg-leather-dark text-desert-sand
        border border-gold-dark/50 rounded-lg shadow-xl
        animate-in fade-in-0 zoom-in-95 duration-150
        ${className}
      `}
      style={{
        top: state.position.top,
        left: state.position.left,
        maxWidth,
      }}
    >
      {content}
      {/* Arrow */}
      <div
        className={`
          absolute w-0 h-0
          border-[${ARROW_SIZE}px] border-solid
          ${arrowStyles[state.actualPosition]}
        `}
        style={{
          borderWidth: ARROW_SIZE,
        }}
      />
    </div>,
    document.body
  );

  return (
    <>
      {trigger}
      {tooltipContent}
    </>
  );
};

/**
 * Simple tooltip wrapper for text-only tooltips
 */
export const SimpleTooltip: React.FC<{
  text: string;
  children: React.ReactElement;
  position?: TooltipPosition;
}> = ({ text, children, position = 'top' }) => (
  <Tooltip content={text} position={position}>
    {children}
  </Tooltip>
);

/**
 * Info icon with tooltip - common pattern for help text
 */
export const InfoTooltip: React.FC<{
  content: React.ReactNode;
  position?: TooltipPosition;
}> = ({ content, position = 'top' }) => (
  <Tooltip content={content} position={position}>
    <button
      type="button"
      className="inline-flex items-center justify-center w-4 h-4 text-desert-stone hover:text-gold-light transition-colors"
      aria-label="More information"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  </Tooltip>
);

// Display names for React DevTools
Tooltip.displayName = 'Tooltip';
SimpleTooltip.displayName = 'SimpleTooltip';
InfoTooltip.displayName = 'InfoTooltip';

export default Tooltip;
