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
      user?: SafeUser & { _id: string; characterId?: string };

      /**
       * User ID extracted from JWT (convenience property)
       */
      userId?: string;

      /**
       * Active character from character middleware
       * Note: Use String(character._id) for service calls that expect string
       */
      character?: ICharacter;

      /**
       * Character ID set by characterOwnership middleware
       * Always a string for easy comparison
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
