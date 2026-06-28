export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} => {
  const errors: string[] = [];

  // Length check
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  if (password.length > 128) {
    errors.push('La contraseña no puede exceder 128 caracteres');
  }

  // Character class checks
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  // Weak patterns
  const weakPatterns = [
    'password', '123456', 'qwerty', 'abc123', 'letmein', 'admin',
    'welcome', 'monkey', 'dragon', 'master', 'sunshine', 'princess'
  ];
  const lowerPassword = password.toLowerCase();
  if (weakPatterns.some(pattern => lowerPassword.includes(pattern))) {
    errors.push('La contraseña contiene patrones comunes débiles');
  }

  // Calculate entropy
  const entropy = calculateEntropy(password);
  const strength = entropy < 30 ? 'weak' : entropy < 50 ? 'medium' : 'strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

function calculateEntropy(password: string): number {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/\d/.test(password)) charsetSize += 10;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) charsetSize += 32;

  return Math.log2(charsetSize) * password.length;
}
