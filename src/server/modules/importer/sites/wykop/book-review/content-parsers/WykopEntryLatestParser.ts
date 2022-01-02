import * as R from 'ramda';

import {normalizeISBN} from '@server/common/helpers';
import {getHTMLInnerText} from '@shared/helpers/html';
import {removeNullValues} from '@shared/helpers';
import {
  dropTagAnchors,
  countStars,
} from './helpers';

import {
  WykopBookReviewHeader,
  WykopEntryContentParser,
} from './WykopEntryContentParser';

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
      R.mapObjIndexed(
        (item) => {
          if (R.is(Array, item))
            return item.map(getHTMLInnerText);

          return getHTMLInnerText(item);
        },
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
      WykopEntryLatestParser
        .normalizeBody(body)
        // eslint-disable-next-line max-len
        .match(/(?:[☆★]+|\d+\s*\/\s*\d+(?:(?:<br \/>)+[☆★]+)?)\s*(?:<br\s\/>)+(.*?)(?<!<a)(?:<br \/>)*(?:Wpis dodano za pomocą stron|#bookmeter|$).*/mi)
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

  /**
   * Prevent body to contain magic tag inside comment. It prevents
   * accidential match content from review
   *
   * @example
   *  https://www.wykop.pl/wpis/60320891/1715-1-1716-tytul-nowy-wspanialy-swiat-autor-aldou/
   *
   * @static
   * @param {string} body
   * @return {string}
   * @memberof WykopEntryLatestParser
   */
  static normalizeBody(body: string): string {
    const html = {
      current: dropTagAnchors(body.replaceAll('\n', '')),
    };

    const totalMagicTags: number[] = [
      ...html.current.matchAll(new RegExp('#bookmeter', 'gi')),
    ].map(R.prop('index') as any);

    if (totalMagicTags.length > 1) {
      // drops hashtag, except last
      for (let i = 0; i < totalMagicTags.length - 1; ++i) {
        const index = totalMagicTags[i];

        html.current = `${html.current.substring(0, index - i)}${html.current.substring(index - i + 1)}`;
      }
    }

    return html.current;
  }
}
