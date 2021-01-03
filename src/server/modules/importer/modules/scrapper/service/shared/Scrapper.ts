import {WebsiteScrappersGroup} from './WebsiteScrappersGroup';

export interface ScrapperGroupChild {
  setParentGroup?(group: WebsiteScrappersGroup<any>): void;
}

export interface Scrapper<Result, Page = any> extends ScrapperGroupChild {
  collect(pages?: number): Promise<Result[]>,
  filterResult(result: Result): Result | Promise<Result>,
  iterator(attrs: {maxIterations?: number, page?: Page}): AsyncGenerator<Result>,
}
