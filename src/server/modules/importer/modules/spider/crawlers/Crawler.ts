import {Observable} from 'rxjs';
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

export interface CrawlerPageResult {
  parseResult: AsyncURLParseResult,
  followLinks: CrawlerLink[],
}

export type CrawlerStartAttrs = {
  defaultUrl: string,
};

export type CrawlerConfig = {
  queueDriver: CrawlerUrlQueueDriver,
  concurrentRequests?: number,
  delay?: number,
  storeOnlyPaths?: boolean,
};

export abstract class Crawler<T extends CrawlerConfig = CrawlerConfig> {
  constructor(
    protected readonly config: T,
  ) {}

  abstract run$(attrs: CrawlerStartAttrs): Observable<CrawlerPageResult>;
}
