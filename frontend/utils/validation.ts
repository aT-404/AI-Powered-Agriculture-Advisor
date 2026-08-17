/**
 * Form and Input Validation Utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true };
};

export const isNumeric = (value: string): boolean => {
  if (!value || value.trim() === '') return false;
  return !isNaN(Number(value));
};

export const isValidSoilParam = (
  value: string,
  min: number,
  max: number
): { isValid: boolean; message?: string } => {
  if (!isNumeric(value)) {
    return { isValid: false, message: 'Value must be a valid number' };
  }
  const num = parseFloat(value);
  if (num < min || num > max) {
    return { isValid: false, message: `Value must be between ${min} and ${max}` };
  }
  return { isValid: true };
};

export const isNonEmpty = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};
