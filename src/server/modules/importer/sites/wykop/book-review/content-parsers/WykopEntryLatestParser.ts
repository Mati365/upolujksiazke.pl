import * as R from 'ramda';

import {normalizeISBN} from '@server/common/helpers';
import {removeNullValues} from '@shared/helpers';
import {
  WykopBookReviewHeader,
  WykopEntryContentParser,
} from './WykopEntryContentParser';

/**
 * Count all star characters
 *
 * @export
 * @param {string} str
 * @returns
 */
export function countStars(str: string) {
  return R.countBy(
    (val) => (val === '★' ? 'filled' : 'notFilled'),
    str as any,
  ).filled || 0;
}

/**
 * Primarly parses result of:
 * {@link https://bookmeter.ct8.pl/}
 *
 * @export
 * @class WykopEntryLatestParser
 * @extends {WykopEntryContentParser}
 */
export class WykopEntryLatestParser extends WykopEntryContentParser {
  static readonly propertiesExtractor = R.compose(
    R.evolve(
      {
        isbn: normalizeISBN,
        tags: R.compose(
          R.filter(Boolean),
          R.map(
            R.pipe(
              // rejects special characters such as (?) from tags
              R.trim,
              R.match(/^([a-zA-ZżźćńółęąśŻŹĆĄŚĘŁÓŃ\-\s]+)$/),
              R.nth(1),
              R.unless(
                R.isNil,
                R.pipe(R.trim, R.toLower),
              ),
            ),
          ),
          R.split(/,|\si\s|\//),
        ) as any,

        authors: (authors) => (
          authors
            .split(/,|\si\s|\//)
            .map(R.trim)
            .filter(R.complement(R.isEmpty))
        ),
        score: (score) => {
          // count using numbers
          const match = R.match(/(\d+)\s*\/\s*(\d+)/, score);
          if (match && match[1] && match[2])
            return ((+match[1]) / (+match[2])) * 10;

          // count using stars
          return countStars(score);
        },
      },
    ),
    (obj): WykopBookReviewHeader => removeNullValues(
      {
        /* eslint-disable @typescript-eslint/dot-notation */
        title: obj['tytuł'],
        tags: obj['gatunek'] || '',
        isbn: obj['isbn'],
        authors: obj['autor'],
        score: obj['ocena'],
        /* eslint-enable @typescript-eslint/dot-notation */
      },
    ),
    (array) => R.reduce(
      (acc, [key, value]) => {
        acc[R.toLower(key)] = R.trim(value);
        return acc;
      },
      {},
      array as any,
    ),
    R.reject(
      R.any(R.either(R.isNil, R.isEmpty)),
    ),
    R.map(
      (matches) => [matches[1], matches[2]],
    ),
    (str: string) => {
      // matches new posts with strong tags
      const matches = [...str.matchAll(/(?:<strong>([^<>]+)(?::<\/strong>|<\/strong>:))\s(.+)<br\s\/>/g)];

      if (matches.length)
        return matches;

      // matches posts without strong tags
      return [...str.matchAll(/(\S+):\s*(?:#<a href="#psychologia">)?([^<>]+)(?:<\/a>)?\s*<br\s\/>/g)];
    },
  ) as any;

  /**
   * Fetch user rate / stars
   *
   * @protected
   * @param {string} body
   * @returns {WykopBookReviewHeader}
   * @memberof WykopEntryLatestParser
   */
  protected matchProperties(body: string): WykopBookReviewHeader {
    const properties: WykopBookReviewHeader = WykopEntryLatestParser.propertiesExtractor(body);

    if (R.isNil(properties.score) && /[☆★]/.test(body))
      properties.score = countStars(body);

    return properties;
  }

  /**
   * Fetch review content
   *
   * @protected
   * @param {string} body
   * @returns {string}
   * @memberof WykopEntryLatestParser
   */
  protected matchDescription(body: string): string {
    let match = (
      body
        .replaceAll('\n', '')
        // eslint-disable-next-line max-len
        .match(/(?:[☆★]|\d+\s*\/\s*\d+(?:<br \/><br \/>[☆★]+)?)(?:<br\s\/>)+(.*?)(?<!<a)(?:<br \/>)*(?:Wpis dodano za pomocą stron|#?<a href="#bookmeter).*/mi)
    )?.[1] ?? null;

    if (!match)
      return null;

    if (/[☆★]/.test(match))
      match = match.match(/[☆★]+(?:<br\s\/>)*(.*)/)?.[1] || match;

    return (
      R
        .trim(match)
        .replace(
          /<a href="spoiler:([^"]+)">\[[^[<]+\]<\/a>/g,
          (_, p1) => `<spoiler>${decodeURIComponent(p1).replace(/\+/g, ' ')}</spoiler>`,
        )
        .replaceAll('&quot;', '"')
        .replace(/(Wpis dodany za pomocą <.*$)/, '')
    );
  }
}
