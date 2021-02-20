import * as R from 'ramda';
import {safeJsonParse} from '@shared/helpers/safeJsonParse';

/**
 * Performs query on page and collects all json+ld
 *
 * @export
 * @class JsonLdExtractor
 */
export class JsonLdExtractor {
  public readonly schemas: Record<string, any[]>;

  constructor(schemas: object[]) {
    this.schemas = R.groupBy(
      R.prop('@type'),
      schemas,
    );
  }

  /**
   * Extracts json+ld from cheerio website
   *
   * @static
   * @param {cheerio.Root} $
   * @returns
   * @memberof JsonLdExtractor
   */
  static fromDocument($: cheerio.Root) {
    const schemas: JSON[] = (
      $('script[type="application/ld+json"]')
        .toArray()
        .map((script) => {
          const text = $(script).get()[0].children[0].data;
          if (!text)
            return null;

          return safeJsonParse(text.replace(/[\n\t]/g, ''));
        })
        .filter(Boolean)
    );

    return new JsonLdExtractor(schemas);
  }
}
export function extractJsonLD($: cheerio.Root) {
  return JsonLdExtractor.fromDocument($);
}
