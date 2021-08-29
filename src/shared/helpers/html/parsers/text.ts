/**
 * Check if is in word character
 *
 * @export
 * @param {string} c
 * @returns
 */
export function isWordCharacter(c: string) {
  if (!c)
    return false;

  return /[\wżźćńółęąś]/.test(c);
}

/**
 * Picks array of words from text
 *
 * @export
 * @param {string} text
 * @returns
 */
export function extractTextWords(text: string) {
  const words: string[] = [];
  let acc = '';

  for (let i = 0; i < text.length; ++i) {
    const c = text[i];

    if (isWordCharacter(c))
      acc += c;
    else {
      if (acc)
        words.push(acc);

      acc = '';
    }
  }

  if (acc)
    words.push(acc);

  return words;
}
