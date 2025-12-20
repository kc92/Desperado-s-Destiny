/**
 * Gold Service (DEPRECATED - USE dollar.service.ts)
 *
 * This file is kept only to prevent import errors during migration.
 * All functionality has moved to DollarService.
 *
 * @deprecated Import from './dollar.service' instead
 */

// Re-export everything from dollar.service
export * from './dollar.service';

// For any remaining imports expecting GoldService, provide alias
import { DollarService } from './dollar.service';
export { DollarService as GoldService };
