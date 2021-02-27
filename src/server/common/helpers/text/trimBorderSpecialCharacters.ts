/**
 * Drops unecessary characters at start and end of string
 *
 * @example
 *  - - + jest w pyta - i już - -
 *  => jest w pyta - i już
 *
 * @export
 * @param {string} text
 * @param {Object} attrs
 * @returns
 */
export function trimBorderSpecialCharacters(
  text: string,
  {
    trimBrackets = true,
    trimCharsRegex = /[\s+-/:!.,()]/i,
  }: {
    trimBrackets?: boolean,
    trimCharsRegex?: RegExp,
  } = {},
) {
  if (!text)
    return null;

  // trim start
  let startOutput: string = null;
  for (let i = 0; i < text.length; ++i) {
    const char = text.charAt(i);
    if (startOutput === null) {
      // transforms: "(dupa) str" => "str"
      if (trimBrackets && char === '(') {
        let nesting = 1;

        for (; i < text.length && nesting > 0; ++i) {
          if (text.charAt(i) === ')')
            nesting--;
        }

        continue;
      } else if (trimCharsRegex.test(char))
        continue;
    }

    startOutput = (startOutput || '') + char;
  }

  let endOutput: string = null;
  for (let i = startOutput.length - 1; i >= 0; --i) {
    const char = startOutput.charAt(i);
    if (endOutput === null) {
      // transforms: "str (dupa)" => "str"
      if (trimBrackets && char === ')') {
        let nesting = 1;

        for (; i >= 0 && nesting > 0; --i) {
          if (startOutput.charAt(i) === '(')
            nesting--;
        }

        continue;
      } else if (trimCharsRegex.test(char))
        continue;
    }

    endOutput = char + (endOutput || '');
  }

  return endOutput;
}
