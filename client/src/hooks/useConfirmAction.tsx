/**
 * useConfirmAction Hook
 * Programmatic confirmation dialog management with consistent UX
 *
 * Phase 1: UI Polish - Foundation & Design System
 *
 * @example
 * ```tsx
 * const { confirm, ConfirmDialogComponent, isConfirming } = useConfirmAction();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item? This cannot be undone.',
 *     confirmText: 'Delete',
 *     confirmVariant: 'danger',
 *   });
 *
 *   if (confirmed) {
 *     await deleteItem(id);
 *   }
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleDelete}>Delete</Button>
 *     <ConfirmDialogComponent />
 *   </>
 * );
 * ```
 */

import React, { useState, useCallback, useRef } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// =============================================================================
// TYPES
// =============================================================================

type ConfirmVariant = 'primary' | 'danger' | 'success';

export interface ConfirmOptions {
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
  /** Icon to display (emoji or text) */
  icon?: string;
}

export interface UseConfirmActionReturn {
  /** Show confirmation dialog and return promise that resolves to boolean */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** The ConfirmDialog component to render (must be included in JSX) */
  ConfirmDialogComponent: React.FC;
  /** Whether a confirmation is currently being shown */
  isConfirming: boolean;
  /** Programmatically close the dialog (cancels) */
  close: () => void;
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

/**
 * Common confirmation presets for consistent UX
 */
export const confirmPresets = {
  /** Delete action preset */
  delete: (itemName = 'item'): ConfirmOptions => ({
    title: `Delete ${itemName}`,
    message: `Are you sure you want to delete this ${itemName.toLowerCase()}? This action cannot be undone.`,
    confirmText: 'Delete',
    confirmVariant: 'danger',
    icon: '🗑️',
  }),

  /** Dangerous action preset */
  danger: (action: string, details: string): ConfirmOptions => ({
    title: `Confirm ${action}`,
    message: details,
    confirmText: action,
    confirmVariant: 'danger',
    icon: '⚠️',
  }),

  /** Leave/abandon action preset */
  leave: (context: string): ConfirmOptions => ({
    title: 'Unsaved Changes',
    message: `You have unsaved changes in ${context}. Are you sure you want to leave?`,
    confirmText: 'Leave',
    cancelText: 'Stay',
    confirmVariant: 'danger',
    icon: '📝',
  }),

  /** Success/completion action preset */
  complete: (action: string): ConfirmOptions => ({
    title: `Complete ${action}`,
    message: `Are you ready to complete ${action.toLowerCase()}?`,
    confirmText: 'Complete',
    confirmVariant: 'success',
    icon: '✓',
  }),

  /** Standard confirmation preset */
  standard: (title: string, message: string): ConfirmOptions => ({
    title,
    message,
    confirmText: 'Confirm',
    confirmVariant: 'primary',
  }),
};

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Hook for programmatic confirmation dialogs
 *
 * @returns Object containing confirm function and dialog component
 */
export function useConfirmAction(): UseConfirmActionReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  // Use ref to store the resolve function for the promise
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  /**
   * Show confirmation dialog and return promise
   */
  const confirm = useCallback((confirmOptions: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setOptions(confirmOptions);
      setIsOpen(true);
    });
  }, []);

  /**
   * Handle user confirming
   */
  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      // Small delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 100));
      resolveRef.current?.(true);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      setOptions(null);
      resolveRef.current = null;
    }
  }, []);

  /**
   * Handle user canceling
   */
  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setIsOpen(false);
    setOptions(null);
    resolveRef.current = null;
  }, []);

  /**
   * Programmatically close the dialog
   */
  const close = useCallback(() => {
    handleCancel();
  }, [handleCancel]);

  /**
   * The dialog component to render
   */
  const ConfirmDialogComponent: React.FC = useCallback(() => {
    if (!options) return null;

    return (
      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        confirmVariant={options.confirmVariant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={isLoading}
        icon={options.icon}
      />
    );
  }, [isOpen, options, handleConfirm, handleCancel, isLoading]);

  return {
    confirm,
    ConfirmDialogComponent,
    isConfirming: isOpen,
    close,
  };
}

// =============================================================================
// CONVENIENCE HOOK WITH ASYNC ACTION
// =============================================================================

/**
 * Convenience hook that combines confirmation with async action
 *
 * @example
 * ```tsx
 * const { executeWithConfirm, ConfirmDialogComponent, isLoading } = useConfirmAndExecute(
 *   async (id: string) => await api.deleteItem(id),
 *   {
 *     confirmOptions: confirmPresets.delete('Item'),
 *     onSuccess: () => toast.success('Deleted!'),
 *   }
 * );
 *
 * return (
 *   <>
 *     <Button onClick={() => executeWithConfirm('123')} isLoading={isLoading}>
 *       Delete
 *     </Button>
 *     <ConfirmDialogComponent />
 *   </>
 * );
 * ```
 */
export function useConfirmAndExecute<TData, TArgs extends unknown[]>(
  asyncFn: (...args: TArgs) => Promise<TData>,
  options: {
    confirmOptions: ConfirmOptions | ((...args: TArgs) => ConfirmOptions);
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    onCancel?: () => void;
  }
): {
  executeWithConfirm: (...args: TArgs) => Promise<TData | undefined>;
  ConfirmDialogComponent: React.FC;
  isLoading: boolean;
  isConfirming: boolean;
} {
  const { confirm, ConfirmDialogComponent, isConfirming } = useConfirmAction();
  const [isLoading, setIsLoading] = useState(false);

  const executeWithConfirm = useCallback(
    async (...args: TArgs): Promise<TData | undefined> => {
      const confirmOpts =
        typeof options.confirmOptions === 'function'
          ? options.confirmOptions(...args)
          : options.confirmOptions;

      const confirmed = await confirm(confirmOpts);

      if (!confirmed) {
        options.onCancel?.();
        return undefined;
      }

      setIsLoading(true);
      try {
        const result = await asyncFn(...args);
        options.onSuccess?.(result);
        return result;
      } catch (error) {
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFn, confirm, options]
  );

  return {
    executeWithConfirm,
    ConfirmDialogComponent,
    isLoading,
    isConfirming,
  };
}

export default useConfirmAction;
