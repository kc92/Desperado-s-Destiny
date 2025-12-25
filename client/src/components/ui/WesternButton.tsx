/**
 * WesternButton Component
 * @deprecated Use Button from '@/components/ui/Button' instead
 *
 * Phase 17: UI Polish - Component Consolidation
 * This file re-exports Button for backward compatibility.
 * All new code should import from Button directly.
 */

import { Button, type ButtonProps } from './Button';

// Re-export Button as WesternButton for backward compatibility
export { Button as WesternButton };

// Export types with legacy naming
export interface WesternButtonProps extends Omit<ButtonProps, 'isLoading'> {
  /** @deprecated Use isLoading instead */
  loading?: boolean;
}

export default Button;
