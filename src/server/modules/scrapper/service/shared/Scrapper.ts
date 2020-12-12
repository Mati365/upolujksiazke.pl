export interface Scrapper<T> {
  collect(pages?: number): Promise<T[]>,
  mapResult(result: T): T | Promise<T>,
  iterator(
    maxIterations?: number,
    url?: string,
  ): AsyncGenerator<T>,
}
