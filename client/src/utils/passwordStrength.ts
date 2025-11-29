/**
 * Password Strength Utilities
 * Calculate password strength and provide feedback
 */

export interface PasswordStrength {
  score: number; // 0-3 (weak, medium, strong, very strong)
  label: string;
  color: string;
  feedback: string[];
}

/**
 * Calculate password strength
 * Returns a score from 0-3 based on password complexity
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Too weak',
      color: 'bg-blood-red',
      feedback: ['Password is required'],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Complexity checks
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const complexityCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;

  if (complexityCount >= 3) {
    score++;
  } else {
    if (!hasUpperCase) feedback.push('Include uppercase letters');
    if (!hasLowerCase) feedback.push('Include lowercase letters');
    if (!hasNumber) feedback.push('Include numbers');
  }

  // Length bonus
  if (password.length >= 12) {
    score++;
  }

  // Very strong password
  if (password.length >= 16 && complexityCount === 4) {
    score = 3;
  }

  // Determine label and color
  let label = '';
  let color = '';

  switch (score) {
    case 0:
      label = 'Too weak';
      color = 'bg-blood-red';
      break;
    case 1:
      label = 'Weak';
      color = 'bg-blood-red';
      break;
    case 2:
      label = 'Good';
      color = 'bg-gold-medium';
      break;
    case 3:
      label = 'Strong';
      color = 'bg-settler-blue';
      break;
  }

  return {
    score,
    label,
    color,
    feedback,
  };
}
