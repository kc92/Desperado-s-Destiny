/**
 * Modal Component
 * Western-themed modal dialog with focus trapping and ARIA support
 *
 * Phase 1: Foundation - Enhanced with variants and footer support
 */

import React, { useEffect, useRef, useId } from 'react';
import { Card } from './Card';

export type ModalVariant = 'default' | 'danger' | 'success';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  /** Optional className to override styles (e.g., z-index for tutorial overlays) */
  className?: string;
  /** Optional footer content (usually action buttons) */
  footer?: React.ReactNode;
  /** Modal variant for different contexts */
  variant?: ModalVariant;
  /** Optional description for screen readers */
  description?: string;
  /** Allow closing by clicking backdrop (default: true) */
  closeOnBackdrop?: boolean;
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const variantStyles: Record<ModalVariant, { headerBorder: string; titleColor: string }> = {
  default: {
    headerBorder: 'border-wood-dark',
    titleColor: 'text-desert-sand',
  },
  danger: {
    headerBorder: 'border-blood-red',
    titleColor: 'text-blood-crimson',
  },
  success: {
    headerBorder: 'border-gold-medium',
    titleColor: 'text-gold-light',
  },
};

/**
 * Western-themed modal dialog with backdrop, animations, and focus trapping
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Confirm Action"
 *   variant="danger"
 *   footer={
 *     <>
 *       <Button variant="ghost" onClick={handleClose}>Cancel</Button>
 *       <Button variant="danger" onClick={handleConfirm}>Delete</Button>
 *     </>
 *   }
 * >
 *   Are you sure you want to delete this item?
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className,
  footer,
  variant = 'default',
  description,
  closeOnBackdrop = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const variantStyle = variantStyles[variant];

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus management and trapping
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Save the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal container
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Focus first element
      if (firstElement) {
        firstElement.focus();
      }

      // Trap focus within modal
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      modalRef.current.addEventListener('keydown', handleTab as any);
      const currentModalRef = modalRef.current;

      return () => {
        currentModalRef?.removeEventListener('keydown', handleTab as any);
        // Restore focus to previous element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in ${className || ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div
        ref={modalRef}
        className={`w-full ${sizeStyles[size]} animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <Card variant="wood" padding="none">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b-2 ${variantStyle.headerBorder}`}>
            <h2
              id={titleId}
              className={`text-2xl font-western ${variantStyle.titleColor} text-shadow-dark`}
            >
              {title}
            </h2>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-desert-sand hover:text-gold-light transition-colors p-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-medium focus-visible:ring-offset-2 focus-visible:ring-offset-wood-dark"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Description for screen readers (if provided) */}
          {description && (
            <p id={descriptionId} className="sr-only">
              {description}
            </p>
          )}

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer (if provided) */}
          {footer && (
            <div className={`flex items-center justify-end gap-3 p-6 border-t-2 ${variantStyle.headerBorder} bg-wood-darker/30`}>
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Modal;
