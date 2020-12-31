import * as R from 'ramda';
import {mergeNonNullProperties} from '@shared/helpers';

export const WYKOP_POST_PROPS_KEYS: Readonly<(keyof WykopBookReviewHeader)[]> = Object.freeze(
  [
    'title', 'categories', 'isbn', 'authors', 'score',
  ],
);

export type WykopBookReviewHeader = {
  title?: string,
  categories?: string[],
  isbn?: string,
  authors?: string[],
  score?: number,
};

export type WykopContentParserResult = {
  properties: WykopBookReviewHeader,
  description: string,
};

/**
 * Single parser that extracts info from post
 *
 * @export
 * @abstract
 * @class WykopEntryContentParser
 */
export abstract class WykopEntryContentParser {
  protected abstract matchProperties(body: string): WykopBookReviewHeader;
  protected abstract matchDescription(body: string): string;

  process(body: string): WykopContentParserResult {
    return {
      properties: this.matchProperties(body),
      description: this.matchDescription(body),
    };
  }

  /**
   * Iterates over all parsers and tries to fill content
   *
   * @static
   * @param {Readonly<WykopEntryContentParser[]>} parsers
   * @param {string} content
   * @returns {WykopContentParserResult}
   * @memberof WykopEntryContentParser
   */
  static reduceContent(
    parsers: Readonly<WykopEntryContentParser[]>,
    content: string,
  ): WykopContentParserResult {
    const result: WykopContentParserResult = {
      description: null,
      properties: null,
    };

    for (let i = 0; i < parsers.length; ++i) {
      const parser = parsers[i];
      const hasMissingProps = !result.properties || (
        WykopEntryContentParser.hasUnfilledProperties(result.properties)
      );

      if (!hasMissingProps && result.description)
        break;

      const currentResult = parser.process(content);
      result.description ??= currentResult.description;

      if (hasMissingProps) {
        result.properties = mergeNonNullProperties(
          result.properties ?? {},
          currentResult.properties,
        );
      }
    }

    return result;
  }

  /**
   * Checks if any post property has null value
   *
   * @static
   * @param {WykopBookReviewHeader} header
   * @returns {boolean}
   * @memberof WykopEntryContentParser
   */
  static hasUnfilledProperties(header: WykopBookReviewHeader): boolean {
    const values = R.values(
      R.pickAll(WYKOP_POST_PROPS_KEYS, header) as object,
    );

    return R.any(R.isNil, values);
  }
}
