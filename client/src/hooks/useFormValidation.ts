/**
 * Form Validation Hook
 * Reusable hook for form validation logic
 */

import { useState, useCallback } from 'react';

export type ValidationRule<T> = (value: T[keyof T], allValues: T) => string | null;

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>;
};

export interface UseFormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  handleChange: (name: keyof T, value: T[keyof T]) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  validateField: (name: keyof T) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
  setFieldValue: (name: keyof T, value: T[keyof T]) => void;
  setFieldError: (name: keyof T, error: string) => void;
}

/**
 * Reusable form validation hook
 *
 * @param initialValues - Initial form values
 * @param validationRules - Validation rules for each field
 * @returns Form state and handlers
 *
 * @example
 * ```tsx
 * const { values, errors, handleChange, handleBlur, handleSubmit } = useFormValidation(
 *   { email: '', password: '' },
 *   {
 *     email: (value) => {
 *       if (!value) return 'Email is required';
 *       if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
 *       return null;
 *     },
 *     password: (value) => {
 *       if (!value) return 'Password is required';
 *       if (value.length < 8) return 'Password must be at least 8 characters';
 *       return null;
 *     }
 *   }
 * );
 * ```
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T> = {}
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (name: keyof T): boolean => {
      const rule = validationRules[name];
      if (!rule) return true;

      const error = rule(values[name], values);
      setErrors((prev) => ({
        ...prev,
        [name]: error || undefined,
      }));

      return !error;
    },
    [values, validationRules]
  );

  /**
   * Validate all fields
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const name = key as keyof T;
      const rule = validationRules[name];
      if (rule) {
        const error = rule(values[name], values);
        if (error) {
          newErrors[name] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  /**
   * Handle input change
   */
  const handleChange = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  }, []);

  /**
   * Handle input blur
   */
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate field on blur
      validateField(name);
    },
    [validateField]
  );

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) =>
      async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Partial<Record<keyof T, boolean>>
        );
        setTouched(allTouched);

        // Validate form
        const isValid = validateForm();

        if (isValid) {
          await onSubmit(values);
        }
      },
    [values, validateForm]
  );

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Set a field value directly
   */
  const setFieldValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Set a field error directly
   */
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  /**
   * Check if form is valid
   */
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateForm,
    resetForm,
    setFieldValue,
    setFieldError,
  };
}

export default useFormValidation;
