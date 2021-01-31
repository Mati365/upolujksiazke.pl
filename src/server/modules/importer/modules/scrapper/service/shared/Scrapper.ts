import {ScrapperGroupChild} from './WebsiteScrappersGroup';

export abstract class Scrapper<Result, Page = any> extends ScrapperGroupChild {
  abstract collect(pages?: number): Promise<Result[]>;
  abstract filterResult(result: Result): Result | Promise<Result>;
  abstract iterator(attrs: {maxIterations?: number, page?: Page}): AsyncGenerator<Result>;
}
