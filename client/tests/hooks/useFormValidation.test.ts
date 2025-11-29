/**
 * Form Validation Hook Tests
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '@/hooks/useFormValidation';

describe('useFormValidation', () => {
  it('should initialize with initial values', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: '', password: '' }, {})
    );

    expect(result.current.values).toEqual({ email: '', password: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('should handle change events', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: '' }, {})
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('should validate on blur', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '' },
        {
          email: (value) => (!value ? 'Email is required' : null),
        }
      )
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.touched.email).toBe(true);
    expect(result.current.errors.email).toBe('Email is required');
  });

  it('should clear errors when value changes', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '' },
        {
          email: (value) => (!value ? 'Email is required' : null),
        }
      )
    );

    // Trigger validation
    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Email is required');

    // Change value
    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it('should validate entire form on submit', async () => {
    const mockSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '', password: '' },
        {
          email: (value) => (!value ? 'Email is required' : null),
          password: (value) => (!value ? 'Password is required' : null),
        }
      )
    );

    await act(async () => {
      await result.current.handleSubmit(mockSubmit)();
    });

    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.password).toBe('Password is required');
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit if form is valid', async () => {
    const mockSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation(
        { email: 'test@example.com' },
        {
          email: (value) => (!value ? 'Email is required' : null),
        }
      )
    );

    await act(async () => {
      await result.current.handleSubmit(mockSubmit)();
    });

    expect(mockSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('should validate with dependent fields', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { password: 'Test123', confirmPassword: '' },
        {
          confirmPassword: (value, allValues) =>
            value !== allValues.password ? 'Passwords do not match' : null,
        }
      )
    );

    act(() => {
      result.current.handleChange('confirmPassword', 'Different');
      result.current.handleBlur('confirmPassword');
    });

    expect(result.current.errors.confirmPassword).toBe('Passwords do not match');

    act(() => {
      result.current.handleChange('confirmPassword', 'Test123');
      result.current.handleBlur('confirmPassword');
    });

    expect(result.current.errors.confirmPassword).toBeNull();
  });

  it('should reset form', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: '' }, {})
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
      result.current.handleBlur('email');
    });

    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.touched.email).toBe(true);

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values.email).toBe('');
    expect(result.current.touched).toEqual({});
  });

  it('should set field value directly', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: '' }, {})
    );

    act(() => {
      result.current.setFieldValue('email', 'direct@example.com');
    });

    expect(result.current.values.email).toBe('direct@example.com');
  });

  it('should set field error directly', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: '' }, {})
    );

    act(() => {
      result.current.setFieldError('email', 'Custom error');
    });

    expect(result.current.errors.email).toBe('Custom error');
  });

  it('should mark all fields as touched on submit', async () => {
    const mockSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '', password: '', username: '' },
        {
          email: (value) => (!value ? 'Email is required' : null),
          password: (value) => (!value ? 'Password is required' : null),
        }
      )
    );

    await act(async () => {
      await result.current.handleSubmit(mockSubmit)();
    });

    expect(result.current.touched.email).toBe(true);
    expect(result.current.touched.password).toBe(true);
    expect(result.current.touched.username).toBe(true);
  });
});
