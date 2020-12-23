export interface Scrapper<Result, Page = any> {
  collect(pages?: number): Promise<Result[]>,
  filterResult(result: Result): Result | Promise<Result>,
  iterator(attrs: {maxIterations?: number, page?: Page}): AsyncGenerator<Result>,
}
