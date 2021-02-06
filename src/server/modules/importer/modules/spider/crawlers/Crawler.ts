import {Observable} from 'rxjs';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';

export interface CrawlerUrlQueueDriver {
  push(url: string): Promise<void>,
  pop(): Promise<string>,
}

export type CrawlerConfig = {
  queueDriver: CrawlerUrlQueueDriver,
  concurrentRequests?: number,
  delay?: number,
};

export abstract class Crawler<T extends CrawlerConfig = CrawlerConfig> {
  constructor(
    protected readonly config: T,
  ) {}

  abstract run$(): Observable<AsyncURLParseResult>;
}
