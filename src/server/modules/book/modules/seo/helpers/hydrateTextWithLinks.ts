import stringSimilarity from 'string-similarity';
import * as R from 'ramda';

import {createHTMLTag} from '@server/common/helpers/html/createHTMLTag';
import {filterAndMap} from '@shared/helpers';
import {isWordCharacter} from '@client/helpers/html';

export type LinkHydrateAttrs<T = any> = {
  text: string,
  items: Array<T & {name: string}>,
  linkGeneratorFn(item: T): {
    href: string,
    rel?: string,
    class?: string,
    target?: string,
  },
};

/**
 * Picks keywords that exists in text
 *
 * @export
 * @template T
 * @param {LinkHydrateAttrs<T>['items']} items
 * @param {string} text
 * @returns
 */
export function pickTextSimilarKeywords<T>(items: LinkHydrateAttrs<T>['items'], text: string) {
  const words = R.uniq(text.toLowerCase().split(' '));
  const similarKeywords: [string, typeof items[0]][] = filterAndMap(
    (item) => {
      const matches = stringSimilarity.findBestMatch(item.name.toLowerCase(), words);
      if (matches.bestMatch.rating > 0.7)
        return [matches.bestMatch.target, item];

      return null;
    },
    items,
  );

  return R.fromPairs(similarKeywords);
}

/**
 * Injects anchors into description
 *
 * @warn
 *  Do not nest for each!
 *
 * @export
 * @template T
 * @param {LinkHydrateAttrs<T>} attrs
 * @returns
 */
export function hydrateTextWithLinks<T>(
  {
    text,
    items,
    linkGeneratorFn,
  }: LinkHydrateAttrs<T>,
) {
  if (!items.length || !text)
    return text;

  const similarWords = pickTextSimilarKeywords(items, text);
  const nesting: string[] = [];
  let wordAcc = '', output = '';

  for (let i = 0; i < text.length; ++i) {
    const c = text[i];
    const wordCharacter = isWordCharacter(c);
    if (wordCharacter)
      wordAcc += c;

    // flush word queue
    if (wordAcc && (!wordCharacter || i + 1 >= text.length)) {
      // search if there is any anchor in nesting group
      let anchor = false;
      for (let j = 0; j < nesting.length; ++j) {
        if (nesting[j] === 'a') {
          anchor = true;
          break;
        }
      }

      // perform analyze
      if (!anchor) {
        const matchedWord = similarWords[wordAcc.toLowerCase()];
        if (matchedWord) {
          wordAcc = createHTMLTag(
            'a',
            linkGeneratorFn(matchedWord),
            wordAcc,
          );
        }
      }

      output += wordAcc;
      wordAcc = '';
    }

    if (!wordCharacter)
      output += c;

    // eat tags
    if (c === '<') {
      const pop = text[i + 1] === '/';
      if (pop)
        nesting.pop();

      let tagName = '';
      for (; i < text.length && text[i + 1] !== '>'; ++i, tagName += text[i]);

      output += tagName;
      if (!pop)
        nesting.push(tagName);
    }
  }

  return output;
}
