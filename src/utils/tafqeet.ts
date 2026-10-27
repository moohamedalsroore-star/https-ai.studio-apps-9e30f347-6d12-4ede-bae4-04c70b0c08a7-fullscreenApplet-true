/**
 * Tafqeet Utility - Convert numbers to written Arabic words with currency units
 * تفقيط الأرقام إلى كلمات عربية فصحى مع الكسور والعملة
 */

const ONES: string[] = [
  '',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
];

const TENS: string[] = [
  '',
  '',
  'عشرون',
  'ثلاثون',
  'أربعون',
  'خمسون',
  'ستون',
  'سبعون',
  'ثمانون',
  'تسعون',
];

const HUNDREDS: string[] = [
  '',
  'مائة',
  'مئتان',
  'ثلاثمائة',
  'أربعمائة',
  'خمسمائة',
  'ستمائة',
  'سبعمائة',
  'ثمانمائة',
  'تسعمائة',
];

function convertGroup(n: number): string {
  let output = '';
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;

  if (hundreds > 0) {
    output += HUNDREDS[hundreds];
  }

  if (remainder > 0) {
    if (output !== '') {
      output += ' و ';
    }
    if (remainder < 20) {
      output += ONES[remainder];
    } else {
      const tens = Math.floor(remainder / 10);
      const ones = remainder % 10;
      if (ones > 0) {
        output += ONES[ones] + ' و ' + TENS[tens];
      } else {
        output += TENS[tens];
      }
    }
  }

  return output;
}

export function tafqeet(
  amount: number,
  currencyName: string = 'ريال',
  fractionName: string = 'هللة'
): string {
  if (amount === 0) return 'صفر ' + currencyName;

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const integerPart = Math.floor(absAmount);
  const fractionPart = Math.round((absAmount - integerPart) * 100);

  if (integerPart === 0 && fractionPart === 0) return 'صفر ' + currencyName;

  const billions = Math.floor(integerPart / 1_000_000_000);
  const millions = Math.floor((integerPart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1_000);
  const units = integerPart % 1_000;

  const parts: string[] = [];

  if (billions > 0) {
    if (billions === 1) parts.push('مليار');
    else if (billions === 2) parts.push('ملياران');
    else if (billions >= 3 && billions <= 10) parts.push(convertGroup(billions) + ' مليارات');
    else parts.push(convertGroup(billions) + ' مليار');
  }

  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(convertGroup(millions) + ' ملايين');
    else parts.push(convertGroup(millions) + ' مليون');
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands >= 3 && thousands <= 10) parts.push(convertGroup(thousands) + ' آلاف');
    else parts.push(convertGroup(thousands) + ' ألف');
  }

  if (units > 0) {
    parts.push(convertGroup(units));
  }

  let textResult = parts.join(' و ');

  let result = 'فقط ' + (isNegative ? 'سالب ' : '') + textResult + ' ' + currencyName;

  if (fractionPart > 0) {
    result += ' و ' + convertGroup(fractionPart) + ' ' + fractionName;
  }

  result += ' لا غير';
  return result;
}
