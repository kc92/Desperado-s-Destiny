/**
 * NavLink Component
 * Navigation link with active route indicator
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  /** Target route */
  to: string;
  /** Link text */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Match exact path only (default: false for prefix matching) */
  exact?: boolean;
  /** Icon to show before text */
  icon?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Navigation link that highlights when the route is active
 * Supports both exact and prefix matching
 */
export const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  className = '',
  exact = false,
  icon,
  onClick,
}) => {
  const location = useLocation();

  // Check if this link is active
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  const baseStyles = 'font-serif font-semibold transition-all duration-200 relative';
  const activeStyles = isActive
    ? 'text-gold-light scale-105'
    : 'text-desert-sand hover:text-gold-light';

  return (
    <Link
      to={to}
      className={`${baseStyles} ${activeStyles} ${className}`}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
    >
      <span className="flex items-center gap-1.5">
        {icon && <span className="text-lg">{icon}</span>}
        {children}
      </span>

      {/* Active indicator underline */}
      {isActive && (
        <span
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-light rounded-full"
          aria-hidden="true"
        />
      )}
    </Link>
  );
};

// Display name for React DevTools
NavLink.displayName = 'NavLink';

export default NavLink;
