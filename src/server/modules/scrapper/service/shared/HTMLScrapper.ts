import {HTMLElement, parse} from 'node-html-parser';
import * as R from 'ramda';

import {collectAsyncIterator} from '@shared/helpers';
import {Scrapper} from './Scrapper';

export type HTMLScrapperResult<T> = {
  result: T,
  ptr: {
    nextUrl: string,
  },
};

export type HTMLParserAttrs = {
  element: HTMLElement,
};

/**
 * Used for rejecting values
 *
 * @export
 * @param {*} result
 * @returns
 */
export function isValidScrappingResult(result: any) {
  return !(R.isNil(result) || (R.is(Array, result) && R.isEmpty(result)));
}

/**
 * Basic HTML scrapper, fetches HTML and parses it
 *
 * @export
 * @abstract
 * @class HTMLScrapper
 * @implements {Scrapper<T>}
 * @template T
 */
export abstract class HTMLScrapper<T> implements Scrapper<T> {
  constructor(
    public readonly url: string,
  ) {}

  /**
   * Transforms result, removes cached etc
   *
   * @param {T} result
   * @returns {Promise<T>}
   * @memberof HTMLScrapper
   */
  mapResult(result: T): Promise<T> {
    return Promise.resolve(result);
  }

  /**
   * Collects nth pages of results
   *
   * @param {number} [pages=1]
   * @returns {Promise<T[]>}
   * @memberof HTMLScrapper
   */
  async collect(pages: number = 1): Promise<T[]> {
    return collectAsyncIterator(
      this.iterator(pages),
    );
  }

  /**
   * Creates scrapper iterator
   *
   * @param {number} [maxIterations=1]
   * @param {string} [url=this.url]
   * @returns {AsyncGenerator<T>}
   * @memberof HTMLScrapper
   */
  async* iterator(
    maxIterations: number = 1,
    url: string = this.url,
  ): AsyncGenerator<T> {
    const it = {
      [Symbol.asyncIterator]: () => ({
        next: async () => {
          if (R.isNil(url) || maxIterations === 0) {
            return {
              done: true,
            };
          }

          const {result, ptr} = await this.process(url);
          url = ptr.nextUrl;
          maxIterations--;

          return {
            done: false,
            value: result,
          };
        },
      }),
    };

    for await (const result of it) {
      if (!isValidScrappingResult(result))
        continue;

      const mapped = await this.mapResult(result);
      if (!isValidScrappingResult(mapped))
        continue;

      yield mapped;
    }
  }

  /**
   * Fetches HTML, parses it and returns iterator
   *
   * @private
   * @param {string} url
   * @returns
   * @memberof HTMLScrapper
   */
  private async process(url: string) {
    const html = await fetch(url).then((r) => r.text());

    return this.parsePage(
      {
        element: parse(html),
      },
    );
  }

  /**
   * Parses fetched page
   *
   * @protected
   * @param {HTMLParserAttrs} attrs
   * @returns {AsyncIterator<T>}
   * @memberof HTMLScrapper
   */
  protected abstract parsePage(attrs: HTMLParserAttrs): Promise<HTMLScrapperResult<T>>;
}
