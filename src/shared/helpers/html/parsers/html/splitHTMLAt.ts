import {isWordCharacter} from '../text';

/**
 * Splits HTML into two pars after certain length
 *
 * @export
 * @param {number} len
 * @param {string} text
 * @param {boolean} breakWord
 * @returns {string[]}
 */
export function splitHTMLAt(
  len: number,
  text: string,
  breakWord?: string,
): [string, string] {
  if (!text)
    return [text, null];

  let nesting = 0, textCharacters = 0;

  for (let i = 0; i < text.length; ++i, ++textCharacters) {
    const c = text[i];

    if (c === '<') {
      const closingTag = text[i + 1] === '/';
      nesting += (
        closingTag
          ? -1
          : 1
      );

      for (; i < text.length && text[i] !== '>'; ++i);

      const selfClosing = text[i - 1] === '/';
      if (selfClosing)
        nesting--;

      continue;
    }

    if (textCharacters > len && !nesting && (breakWord || !isWordCharacter(c))) {
      return [
        text.substr(0, i),
        text.substr(i),
      ];
    }
  }

  return [text, null];
}
