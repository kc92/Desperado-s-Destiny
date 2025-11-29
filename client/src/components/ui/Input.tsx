/**
 * Input Component
 * Western-styled form input field
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Western-themed input component with label, error, and helper text support
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-wood-dark mb-2 font-serif"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`
          input-western
          ${hasError ? 'border-blood-red focus:ring-blood-red' : ''}
          ${className}
        `}
        aria-invalid={hasError}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-blood-red font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-wood-grain"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
