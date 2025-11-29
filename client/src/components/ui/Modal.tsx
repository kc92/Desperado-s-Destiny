/**
 * Modal Component
 * Western-themed modal dialog with focus trapping
 */

import React, { useEffect, useRef } from 'react';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  /** Optional className to override styles (e.g., z-index for tutorial overlays) */
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/**
 * Western-themed modal dialog with backdrop, animations, and focus trapping
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in ${className || ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className={`w-full ${sizeStyles[size]} animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <Card variant="wood" padding="none">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-wood-dark">
            <h2
              id="modal-title"
              className="text-2xl font-western text-desert-sand text-shadow-dark"
            >
              {title}
            </h2>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-desert-sand hover:text-gold-light transition-colors p-2"
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
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div id="modal-description" className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Modal;
