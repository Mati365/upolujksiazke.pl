import * as R from 'ramda';

import {collectAsyncIterator, timeout} from '@shared/helpers';
import {Scrapper} from './Scrapper';

export type ScrapperResult<T, P> = {
  result: T,
  ptr: {
    nextPage: P,
  },
};

export type ScrapperBasicPagination = {
  page: number,
};

export type AsyncScrapperConfig = {
  pageProcessDelay?: number,
};

/**
 * Used for rejecting values
 *
 * @export
 * @param {T} result
 * @returns
 */
export function isValidScrappingResult<T>(result: T) {
  return !(R.isNil(result) || (R.is(Array, result) && R.isEmpty(result)));
}

/**
 * Scrapper that iterates over pages and collects data
 *
 * @export
 * @abstract
 * @class AsyncScrapper
 * @implements {Scrapper<Result, Page>}
 * @template Result
 * @template Page
 */
export abstract class AsyncScrapper<Result, Page = ScrapperBasicPagination> implements Scrapper<Result, Page> {
  private pageProcessDelay: number = null;

  constructor(
    {
      pageProcessDelay,
    }: AsyncScrapperConfig = {},
  ) {
    this.pageProcessDelay = pageProcessDelay;
  }

  setPageProcessDelay(delay: number) {
    this.pageProcessDelay = delay;
  }

  /**
   * Rejects items
   *
   * @param {Result} result
   * @returns {Promise<Result>}
   * @memberof AsyncScrapper
   */
  filterResult(result: Result): Promise<Result> {
    return Promise.resolve(result);
  }

  /**
   * Lodas nth pages of data
   *
   * @param {number} [pages=1]
   * @returns {Promise<Result[]>}
   * @memberof AsyncScrapper
   */
  async collect(pages: number = 1): Promise<Result[]> {
    return collectAsyncIterator(
      this.iterator(pages),
    );
  }

  /**
   * Iterates every page of fetched data
   *
   * @param {number} [maxIterations=1]
   * @param {Page} [page]
   * @returns {AsyncGenerator<Result>}
   * @memberof AsyncScrapper
   */
  async* iterator(maxIterations: number = 1, page?: Page): AsyncGenerator<Result> {
    const {pageProcessDelay} = this;
    let currentIterations = maxIterations;

    const it = {
      [Symbol.asyncIterator]: () => ({
        next: async () => {
          if (page === null || currentIterations === 0) {
            return {
              done: true,
            };
          }

          const {result, ptr} = await this.process(page);
          page = ptr.nextPage ?? null;
          if (!Number.isNaN(currentIterations))
            currentIterations--;

          return {
            done: false,
            value: result,
          };
        },
      }),
    };

    for await (const result of it) {
      if (pageProcessDelay && maxIterations !== 1)
        await timeout(pageProcessDelay);

      if (!isValidScrappingResult(result))
        continue;

      const mapped = await this.filterResult(result);
      if (!isValidScrappingResult(mapped))
        continue;

      yield mapped;
    }
  }

  /**
   * Fetches single page
   *
   * @protected
   * @abstract
   * @param {Page} page
   * @returns {Promise<ScrapperResult<Result, Page>>}
   * @memberof AsyncScrapper
   */
  protected abstract process(page: Page): Promise<ScrapperResult<Result, Page>>;
}
