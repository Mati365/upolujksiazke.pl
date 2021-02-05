export type CrawlerConfig = {
  startPageURL: string,
  maxConcurrentRequests?: number,
  delay?: number,
};

export abstract class Crawler<T extends CrawlerConfig = CrawlerConfig> {
  constructor(
    protected readonly config: T,
  ) {}

  abstract run(): void;
}
