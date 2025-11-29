/**
 * Express type extensions
 * Extends Express Request interface with custom properties
 */

import { ICharacter } from '../models/Character.model';
import { IUser } from '../models/User.model';
import { SafeUser } from '@desperados/shared';

declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user from JWT middleware
       * Note: characterId is part of SafeUser when a character is selected
       */
      user?: SafeUser & { _id: string };

      /**
       * User ID extracted from JWT (convenience property)
       */
      userId?: string;

      /**
       * Active character from character middleware
       */
      character?: ICharacter & {
        _id: any;
      };

      /**
       * Character ID set by characterOwnership middleware
       */
      characterId?: string;

      /**
       * Full user object (when needed)
       */
      userDoc?: IUser;
    }
  }
}

export {};
