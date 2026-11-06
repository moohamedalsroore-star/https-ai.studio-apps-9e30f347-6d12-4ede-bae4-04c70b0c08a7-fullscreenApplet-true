/**
 * Utility functions for numeric parsing and Arabic numeral conversion.
 * Converts Eastern Arabic (٠-٩) and Persian (۰-۹) numerals to standard Latin digits (0-9).
 * Normalizes decimal separators (، ٫ , .) to standard dot (.).
 */

export function normalizeArabicNumerals(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  const str = String(input);
  
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const arIndex = arabicDigits.indexOf(char);
    if (arIndex !== -1) {
      result += arIndex;
      continue;
    }
    const faIndex = persianDigits.indexOf(char);
    if (faIndex !== -1) {
      result += faIndex;
      continue;
    }
    if (char === '،' || char === '٫' || char === ',') {
      result += '.';
      continue;
    }
    // Allow digits and single decimal dot, minus
    if ((char >= '0' && char <= '9') || char === '.' || char === '-') {
      result += char;
    }
  }
  return result;
}

/**
 * Parses any string with Arabic or English digits into a valid JavaScript number.
 * Returns 0 if empty or invalid.
 */
export function parseArabicNumber(input: string | number | undefined | null): number {
  if (input === undefined || input === null || input === '') return 0;
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  
  const normalized = normalizeArabicNumerals(input);
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a number for display in an input field.
 * If 0 or empty, returns '' so the user doesn't have to backspace a 0.
 */
export function formatInputNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '' || value === 0 || value === '0') {
    return '';
  }
  return String(value);
}
