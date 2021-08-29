export const ROMAN_SYMBOLS = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

/**
 * Checks if number is romand number
 *
 * @export
 * @param {string} str
 * @returns
 */
export function isRomanNumber(str: string) {
  return str.match(/^M{0,4}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/);
}

/**
 * Check if roman number and if so parses it
 *
 * @export
 * @param {string} str
 */
export function parseIfRomanNumber(str: string): string | number {
  if (!isRomanNumber(str))
    return str;

  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const cur = ROMAN_SYMBOLS[str[i]];
    const next = ROMAN_SYMBOLS[str[i + 1]];

    if (cur < next) {
      result += next - cur;
      i++;
    } else
      result += cur;
  }
  return result;
}
