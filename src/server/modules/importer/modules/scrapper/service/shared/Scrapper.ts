import {WebsiteScrappersGroup} from './WebsiteScrappersGroup';

export interface Scrapper<Result, Page = any> {
  setParentGroup?(group: WebsiteScrappersGroup<any>): void;
  collect(pages?: number): Promise<Result[]>,
  filterResult(result: Result): Result | Promise<Result>,
  iterator(attrs: {maxIterations?: number, page?: Page}): AsyncGenerator<Result>,
}
