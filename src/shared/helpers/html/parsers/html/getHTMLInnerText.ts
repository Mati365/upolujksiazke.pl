/**
 * Get HTML text between tags
 *
 * @export
 * @param {string} text
 * @returns
 */
export function getHTMLInnerText(text: string) {
  if (!text)
    return '';

  let acc = '';
  for (let i = 0; i < text.length; ++i) {
    const c = text[i];

    if (c === '<') {
      for (; i < text.length && text[i] !== '>'; ++i);
      continue;
    } else
      acc += c;
  }

  return acc;
}
