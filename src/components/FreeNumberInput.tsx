import React from 'react';
import { normalizeArabicNumerals, parseArabicNumber } from '../utils/numberUtils';

interface FreeNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | string | undefined | null;
  onChange: (val: number, rawStr: string) => void;
  allowDecimals?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * FreeNumberInput:
 * 1. Shows empty when 0 or blank, so user never has to backspace a pre-existing 0.
 * 2. Accepts Arabic numerals (٠-٩) and English (0-9) transparently.
 * 3. Auto-selects text on focus.
 * 4. Compatible with mobile keyboards (inputMode="decimal").
 */
export const FreeNumberInput: React.FC<FreeNumberInputProps> = ({
  value,
  onChange,
  allowDecimals = true,
  placeholder = '0',
  className = '',
  ...rest
}) => {
  // Convert 0 to empty string for display so user has a free, clean box
  const displayValue = value === 0 || value === '0' || value === undefined || value === null ? '' : String(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const normalized = normalizeArabicNumerals(raw);

    // If user cleared the input
    if (normalized === '' || normalized === '-') {
      onChange(0, normalized);
      return;
    }

    const num = parseArabicNumber(normalized);
    onChange(num, normalized);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
    if (rest.onFocus) {
      rest.onFocus(e);
    }
  };

  return (
    <input
      type="text"
      inputMode={allowDecimals ? 'decimal' : 'numeric'}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={`font-mono-num ${className}`}
      {...rest}
    />
  );
};
