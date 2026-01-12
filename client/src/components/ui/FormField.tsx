/**
 * FormField Component
 * Unified form field component with validation integration
 *
 * Phase 1: UI Polish - Foundation & Design System
 *
 * @example
 * ```tsx
 * // Basic text input
 * <FormField
 *   name="email"
 *   label="Email Address"
 *   type="email"
 *   value={values.email}
 *   onChange={(value) => handleChange('email', value)}
 *   error={errors.email}
 *   required
 * />
 *
 * // Select field
 * <FormField
 *   name="role"
 *   label="Select Role"
 *   type="select"
 *   value={values.role}
 *   onChange={(value) => handleChange('role', value)}
 *   options={[
 *     { value: 'member', label: 'Member' },
 *     { value: 'officer', label: 'Officer' },
 *   ]}
 * />
 *
 * // Textarea
 * <FormField
 *   name="description"
 *   label="Description"
 *   type="textarea"
 *   value={values.description}
 *   onChange={(value) => handleChange('description', value)}
 *   rows={4}
 * />
 * ```
 */

import React, { useId } from 'react';

// =============================================================================
// TYPES
// =============================================================================

type FieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'select' | 'textarea' | 'checkbox';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface BaseFieldProps {
  /** Field name (used for id generation) */
  name: string;
  /** Field label */
  label: string;
  /** Field type */
  type?: FieldType;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Additional CSS classes for container */
  className?: string;
  /** Whether to show character count (for text/textarea) */
  showCharCount?: boolean;
  /** Maximum character length */
  maxLength?: number;
}

interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  type: 'select';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
}

interface TextareaFieldProps extends BaseFieldProps {
  type: 'textarea';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

interface CheckboxFieldProps extends BaseFieldProps {
  type: 'checkbox';
  checked: boolean;
  onChange: (checked: boolean) => void;
  onBlur?: () => void;
}

export type FormFieldProps =
  | TextFieldProps
  | SelectFieldProps
  | TextareaFieldProps
  | CheckboxFieldProps;

// =============================================================================
// STYLE CONSTANTS
// =============================================================================

const baseInputClasses = `
  w-full px-4 py-3 rounded-lg
  bg-wood-light/50 border-2 border-wood-grain/40
  text-wood-darker placeholder:text-wood-grain/60
  font-serif
  transition-all duration-200
  focus:outline-none focus:border-gold-medium focus:ring-2 focus:ring-gold-medium/30
  disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-wood-grain/20
`;

const errorInputClasses = 'border-blood-red focus:border-blood-red focus:ring-blood-red/30';

const labelClasses = 'block text-sm font-semibold text-wood-dark mb-2 font-serif';
const requiredClasses = 'text-blood-red ml-1';
const errorTextClasses = 'mt-1.5 text-sm text-blood-red font-medium';
const helperTextClasses = 'mt-1.5 text-sm text-wood-grain';
const charCountClasses = 'text-xs text-wood-grain mt-1 text-right';

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

interface LabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
}

const Label: React.FC<LabelProps> = ({ htmlFor, label, required }) => (
  <label htmlFor={htmlFor} className={labelClasses}>
    {label}
    {required && <span className={requiredClasses}>*</span>}
  </label>
);

interface FieldMessageProps {
  id: string;
  error?: string;
  helperText?: string;
}

const FieldMessage: React.FC<FieldMessageProps> = ({ id, error, helperText }) => {
  if (error) {
    return (
      <p id={`${id}-error`} className={errorTextClasses} role="alert">
        {error}
      </p>
    );
  }

  if (helperText) {
    return (
      <p id={`${id}-helper`} className={helperTextClasses}>
        {helperText}
      </p>
    );
  }

  return null;
};

interface CharCountProps {
  current: number;
  max: number;
}

const CharCount: React.FC<CharCountProps> = ({ current, max }) => (
  <p className={charCountClasses}>
    {current} / {max}
  </p>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Unified form field component with consistent styling and validation
 */
export const FormField: React.FC<FormFieldProps> = (props) => {
  const generatedId = useId();
  const fieldId = `field-${props.name}-${generatedId}`;
  const hasError = Boolean(props.error);

  const describedBy = [
    hasError ? `${fieldId}-error` : null,
    props.helperText ? `${fieldId}-helper` : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const inputClasses = `${baseInputClasses} ${hasError ? errorInputClasses : ''}`;

  // Render based on type
  if (props.type === 'checkbox') {
    const { name, label, checked, onChange, onBlur, disabled, error, helperText, className } =
      props as CheckboxFieldProps;

    return (
      <div className={`flex items-start gap-3 ${className || ''}`}>
        <input
          id={fieldId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            mt-1 h-5 w-5 rounded
            border-2 border-wood-grain/40
            text-gold-medium
            focus:ring-2 focus:ring-gold-medium/30
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-invalid={hasError}
          aria-describedby={describedBy}
        />
        <div className="flex-1">
          <label htmlFor={fieldId} className="text-sm font-medium text-wood-dark cursor-pointer">
            {label}
          </label>
          <FieldMessage id={fieldId} error={error} helperText={helperText} />
        </div>
      </div>
    );
  }

  if (props.type === 'select') {
    const {
      name,
      label,
      value,
      onChange,
      onBlur,
      options,
      placeholder,
      required,
      disabled,
      error,
      helperText,
      className,
    } = props as SelectFieldProps;

    return (
      <div className={`w-full ${className || ''}`}>
        <Label htmlFor={fieldId} label={label} required={required} />
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`${inputClasses} appearance-none cursor-pointer bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b5b47' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem_1.25rem] pr-10`}
          aria-invalid={hasError}
          aria-describedby={describedBy}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldMessage id={fieldId} error={error} helperText={helperText} />
      </div>
    );
  }

  if (props.type === 'textarea') {
    const {
      name,
      label,
      value,
      onChange,
      onBlur,
      placeholder,
      required,
      disabled,
      error,
      helperText,
      className,
      rows = 4,
      resize = 'vertical',
      showCharCount,
      maxLength,
    } = props as TextareaFieldProps;

    const resizeClass = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }[resize];

    return (
      <div className={`w-full ${className || ''}`}>
        <Label htmlFor={fieldId} label={label} required={required} />
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={`${inputClasses} ${resizeClass}`}
          aria-invalid={hasError}
          aria-describedby={describedBy}
        />
        {showCharCount && maxLength && <CharCount current={value.length} max={maxLength} />}
        <FieldMessage id={fieldId} error={error} helperText={helperText} />
      </div>
    );
  }

  // Default: text, email, password, number, tel, url
  const {
    name,
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    required,
    disabled,
    error,
    helperText,
    className,
    autoComplete,
    showCharCount,
    maxLength,
    min,
    max,
    step,
  } = props as TextFieldProps;

  return (
    <div className={`w-full ${className || ''}`}>
      <Label htmlFor={fieldId} label={label} required={required} />
      <input
        id={fieldId}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        className={inputClasses}
        aria-invalid={hasError}
        aria-describedby={describedBy}
      />
      {showCharCount && maxLength && <CharCount current={value.length} max={maxLength} />}
      <FieldMessage id={fieldId} error={error} helperText={helperText} />
    </div>
  );
};

FormField.displayName = 'FormField';

export default FormField;
