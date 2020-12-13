export interface Scrapper<Result, Page = any> {
  collect(pages?: number): Promise<Result[]>,
  filterResult(result: Result): Result | Promise<Result>,
  iterator(maxIterations?: number, page?: Page): AsyncGenerator<Result>,
}
