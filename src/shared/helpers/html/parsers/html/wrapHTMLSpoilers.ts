import {createHTMLTag} from '../../createHTMLTag';

/**
 * Appends spoilers buttons to HTML
 *
 * @export
 * @param {Object} attrs
 * @returns
 */
export function wrapHTMLSpoilers(
  {
    text,
    buttonTitle,
    spoilerTag = 'spoiler',
  }: {
    text: string,
    buttonTitle: string,
    spoilerTag?: string,
  },
) {
  let acc = '';
  const nesting: string[] = [];

  for (let i = 0; i < text.length; ++i) {
    const c = text[i];
    acc += c;

    if (c === '<') {
      let tagContent = '';
      const pop = text[i + 1] === '/';
      if (pop) {
        const lastTag = nesting.pop();

        if (lastTag === spoilerTag)
          acc = `${acc.substring(0, acc.length - 1)}</span>${acc.substring(acc.length - 1)}`;
      }

      for (; i < text.length && text[i] !== '>';) {
        ++i;

        const nC = text[i];
        acc += nC;
        if (nC !== '>')
          tagContent += nC;
      }

      if (!pop) {
        const tagName = tagContent.split(' ')[0];
        nesting.push(tagName);

        if (tagName === spoilerTag) {
          acc += (
            createHTMLTag('button', {class: 'c-spoiler__btn'}, buttonTitle)
              + createHTMLTag('span', {class: 'c-spoiler__content'}, null, false)
          );
        }
      }
    }
  }

  return acc;
}
