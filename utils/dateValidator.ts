export const validateYear = (year: number): boolean => {
  return year >= 1900 && year <= new Date().getFullYear() + 10;
};

export const validateMonth = (month: number): boolean => {
  return month >= 1 && month <= 12;
};

export const getYearValidationError = (year: number): string | null => {
  if (year < 1900) {
    return `El año debe ser mayor a 1900`;
  }
  if (year > new Date().getFullYear() + 10) {
    return `El año no puede ser mayor a ${new Date().getFullYear() + 10}`;
  }
  return null;
};
