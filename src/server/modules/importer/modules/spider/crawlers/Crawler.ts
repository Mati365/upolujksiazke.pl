import {Observable} from 'rxjs';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';

export interface CrawlerUrlQueueDriver {
  push(paths: string[]): Promise<void>,
  pop(): Promise<string>,
}

export interface CrawlerPageResult {
  parseResult: AsyncURLParseResult,
  followPaths: string[],
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
