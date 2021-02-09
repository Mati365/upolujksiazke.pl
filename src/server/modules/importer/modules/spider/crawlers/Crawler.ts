import {Observable} from 'rxjs';

import {CanBePromise} from '@shared/types';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';

export class CrawlerLink {
  constructor(
    public readonly url: string,
    public readonly priority: number,
  ) {}
}

export interface CrawlerUrlQueueDriver {
  push(urls: CrawlerLink[]): Promise<void>,
  pop(): Promise<CrawlerLink>,
}

export type CrawlerLinksMapperAttrs = {
  link: CrawlerLink,
  links: CrawlerLink[],
  parseResult: AsyncURLParseResult,
};

export type CrawlerTickResult = {
  queueItem: CrawlerLink,
  collectorResult: CrawlerPageResult,
};

export type CrawlerPageResult = {
  parseResult: AsyncURLParseResult,
  followLinks: CrawlerLink[],
};

export type CrawlerConfig = {
  queueDriver: CrawlerUrlQueueDriver,
  concurrentRequests?: number,
  delay?: number,
  storeOnlyPaths?: boolean,
  preMapLink?(url: string): CrawlerLink,
  postMapLinks?(attrs: CrawlerLinksMapperAttrs): (CanBePromise<CrawlerLink[]> | void);
  shouldBe: {
    collected?(url: string): boolean,
    analyzed?(tickResult: CrawlerTickResult): boolean,
  },
};

export abstract class Crawler<
  T extends CrawlerConfig = CrawlerConfig,
  A = {},
> {
  constructor(
    protected readonly config: T,
  ) {}

  abstract run$(attrs?: A): CanBePromise<Observable<CrawlerPageResult>>;
}
