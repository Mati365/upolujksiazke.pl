import * as R from 'ramda';

import {
  RemoteID,
  ArrayElement,
  CanBePromise,
} from '@shared/types';

import {collectAsyncIterator, timeout} from '@shared/helpers';
import {Scrapper} from './Scrapper';
import {WebsiteScrappersGroup} from './WebsiteScrappersGroup';

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

export type AsyncScrapperListenerAttrs = {
  bulk: boolean,
  reloadsAllRecords: boolean,
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
export abstract class AsyncScrapper<
    Result extends readonly unknown[],
    Page = ScrapperBasicPagination> implements Scrapper<Result, Page> {
  private pageProcessDelay: number;
  protected group: WebsiteScrappersGroup;

  constructor(
    {
      pageProcessDelay,
    }: AsyncScrapperConfig = {},
  ) {
    this.pageProcessDelay = pageProcessDelay;
  }

  setParentGroup(group: WebsiteScrappersGroup): this {
    this.group = group;
    return this;
  }

  setPageProcessDelay(delay: number): this {
    this.pageProcessDelay = delay;
    return this;
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
      this.iterator(
        {
          maxIterations: pages,
        },
      ),
    );
  }

  /**
   * Iterates every page of fetched data
   *
   * @param {Object} attrs
   * @returns {AsyncGenerator<Result>}
   * @memberof AsyncScrapper
   */
  async* iterator(
    {
      maxIterations = 1,
      initialPage,
    }: {
      maxIterations?: number,
      initialPage?: Page,
    } = {},
  ): AsyncGenerator<Result> {
    const {pageProcessDelay} = this;
    let currentIterations = maxIterations;
    const it = {
      [Symbol.asyncIterator]: () => ({
        next: async () => {
          if (initialPage === null || currentIterations === 0) {
            return {
              done: true,
            };
          }

          if (pageProcessDelay && maxIterations !== 1)
            await timeout(pageProcessDelay);

          const processedPage = await this.processPage(initialPage);
          if (!processedPage) {
            return {
              done: true,
            };
          }

          const {result, ptr} = processedPage;
          initialPage = ptr.nextPage ?? null;
          if (!Number.isNaN(currentIterations))
            currentIterations--;

          return {
            done: !result?.length,
            value: result,
          };
        },
      }),
    };

    // start scrapping
    for await (const result of it) {
      if (!isValidScrappingResult(result))
        continue;

      const mapped = await this.filterResult(result);
      if (!isValidScrappingResult(mapped))
        continue;

      yield mapped;
    }
  }

  /**
   * Transforms single item into format stored in database
   *
   * @abstract
   * @param {any} item
   * @returns {ArrayElement<Result>}
   */
  abstract mapSingleItemResponse(item: any): ArrayElement<Result>;

  /**
   * Fetches single item
   *
   * @abstract
   * @param {RemoteID} remoteId
   * @returns {CanBePromise<ArrayElement<Result>>}
   * @memberof AsyncScrapper
   */
  abstract fetchSingle(remoteId: RemoteID): CanBePromise<ArrayElement<Result>>;

  /**
   * Fetches single page
   *
   * @protected
   * @abstract
   * @param {Page} page
   * @returns {CanBePromise<ScrapperResult<Result, Page>>}
   * @memberof AsyncScrapper
   */
  protected abstract processPage(page: Page): CanBePromise<ScrapperResult<Result, Page>>;
}
