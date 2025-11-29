/**
 * ConfirmDialog Component
 * Western-themed confirmation dialog to replace browser confirm()
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Card } from './Card';
import { Button } from './Button';

type ConfirmVariant = 'primary' | 'danger' | 'success';

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Text for confirm button */
  confirmText?: string;
  /** Text for cancel button */
  cancelText?: string;
  /** Visual variant for confirm button */
  confirmVariant?: ConfirmVariant;
  /** Callback when user confirms */
  onConfirm: () => void | Promise<void>;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Show loading state on confirm button */
  isLoading?: boolean;
  /** Icon to display (emoji or text) */
  icon?: string;
}

const variantToButtonVariant: Record<ConfirmVariant, 'primary' | 'secondary' | 'danger'> = {
  primary: 'primary',
  danger: 'danger',
  success: 'secondary',
};

/**
 * Western-themed confirmation dialog component
 * Use this instead of browser confirm() for consistent, themed UI
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
  icon,
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onCancel]);

  // Prevent body scroll when dialog is open
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

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      // Focus cancel button by default (safer option)
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle confirm with async support
  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('ConfirmDialog: Error during confirm action:', error);
    }
  }, [onConfirm]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    if (!isLoading) {
      onCancel();
    }
  }, [isLoading, onCancel]);

  // Handle tab key for focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = [cancelButtonRef.current, confirmButtonRef.current].filter(Boolean);

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

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
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div
        className="w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <Card variant="parchment" padding="lg">
          {/* Icon */}
          {icon && (
            <div className="text-6xl text-center mb-4" role="img" aria-hidden="true">
              {icon}
            </div>
          )}

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            className="text-2xl font-western text-wood-dark text-center mb-4"
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="confirm-dialog-description"
            className="text-wood-grain text-center mb-6 leading-relaxed"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button
              ref={cancelButtonRef}
              variant="ghost"
              size="md"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              ref={confirmButtonRef}
              variant={variantToButtonVariant[confirmVariant]}
              size="md"
              onClick={handleConfirm}
              disabled={isLoading}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Display name for React DevTools
ConfirmDialog.displayName = 'ConfirmDialog';

export default ConfirmDialog;
