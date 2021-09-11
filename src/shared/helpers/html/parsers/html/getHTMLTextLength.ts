import {getHTMLInnerText} from './getHTMLInnerText';

/**
 * Counts all characters in HTML
 *
 * @export
 * @param {string} text
 * @returns
 */
export function getHTMLTextLength(text: string) {
  return getHTMLInnerText(text).length;
}
