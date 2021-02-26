/**
 * Drops unecessary characters at start and end of string
 *
 * @example
 *  - - + jest w pyta - i już - -
 *  => jest w pyta - i już
 *
 * @export
 * @param {string} text
 * @param {RegExp} [trimCharsRegex=/[\s()+-/:!.,]/i]
 * @returns
 */
export function trimBorderSpecialCharacters(
  text: string,
  trimCharsRegex: RegExp = /[\s()+-/:!.,]/i,
) {
  if (!text)
    return null;

  // trim start
  let startOutput: string = null;
  for (let i = 0; i < text.length; ++i) {
    const char = text.charAt(i);
    if (startOutput === null && trimCharsRegex.test(char))
      continue;

    startOutput = (startOutput || '') + char;
  }

  let endOutput: string = null;
  for (let i = startOutput.length - 1; i >= 0; --i) {
    const char = startOutput.charAt(i);
    if (endOutput === null && trimCharsRegex.test(char))
      continue;

    endOutput = char + (endOutput || '');
  }

  return endOutput;
}
