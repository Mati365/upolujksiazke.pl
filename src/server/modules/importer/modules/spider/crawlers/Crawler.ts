import {Observable} from 'rxjs';

import {CanBePromise} from '@shared/types';
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

export abstract class Crawler<
  T extends CrawlerConfig = CrawlerConfig,
  A = {},
> {
  static readonly DEFAULT_CONFIG: Partial<CrawlerConfig> = {
    concurrency: 1,
    preMapLink: (link: string) => new CrawlerLink(link, 0),
  };

  constructor(
    protected readonly config: T,
  ) {
    Object.assign(config, Crawler.DEFAULT_CONFIG);
  }

  abstract run$(attrs?: A): CanBePromise<Observable<CrawlerPageResult>>;
}
