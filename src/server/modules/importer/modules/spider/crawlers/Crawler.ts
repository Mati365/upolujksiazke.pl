import {from, merge} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import * as R from 'ramda';

import {asyncIteratorToObservable} from '@server/common/helpers/rx/asyncIteratorToObservable';
import {timeout} from '@shared/helpers';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';

export class CrawlerLink {
  constructor(
    public url: string,
    public priority: number,
    public processed: boolean = false,
  ) {}
}

export interface CrawlerUrlQueueDriver {
  push(urls: CrawlerLink[]): Promise<void>,
  pop(): Promise<CrawlerLink>,
}

export type CrawlerTickResult = {
  queueItem: CrawlerLink,
  collectorResult: CrawlerPageResult,
};

export type CrawlerPageResult = {
  parseResult: AsyncURLParseResult,
  followLinks?: CrawlerLink[],
};

export type CrawlerConfig = {
  queueDriver: CrawlerUrlQueueDriver,
  concurrency?: number,
  delay?: number,
  storeOnlyPaths?: boolean,
  preMapLink?(url: string): CrawlerLink,
  shouldBe: {
    collected?(url: string): boolean,
    analyzed?(tickResult: CrawlerTickResult): boolean,
  },
};

export abstract class Crawler<T extends CrawlerConfig = CrawlerConfig> {
  static readonly DEFAULT_CONFIG: Partial<CrawlerConfig> = {
    concurrency: 1,
    preMapLink: (link: string) => new CrawlerLink(link, 0),
  };

  protected readonly config: T;

  constructor(config: T) {
    this.config = {
      ...Crawler.DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Runs crawler, parallel pops link from stack and processes it
   *
   * @returns
   * @memberof Crawler
   */
  async run$() {
    const {
      config: {
        concurrency,
      },
    } = this;

    const $stream = from(this.tick());
    return $stream.pipe(
      mergeMap(
        () => merge(...R.times(
          () => this.fork(),
          concurrency,
        )),
      ),
    );
  }

  /**
   * Run new crawler stream
   *
   * @returns
   * @memberof SpiderCrawler
   */
  fork() {
    const self = this;
    const {
      config: {
        delay,
        shouldBe,
      },
    } = this;

    const iterator = async function* generator() {
      for (;;) {
        const tickResult = await self.tick();
        if (!tickResult)
          break;

        const {collectorResult} = tickResult;
        if (shouldBe.analyzed(tickResult))
          yield collectorResult;

        if (delay)
          await timeout(delay);
      }
    };

    return asyncIteratorToObservable(iterator());
  }

  /**
   * Pops link from stack
   *
   * @abstract
   * @returns {Promise<CrawlerTickResult>}
   * @memberof Crawler
   */
  abstract tick(): Promise<CrawlerTickResult>;
}
