import {CanBePromise} from '@shared/types';

export type ScrapperMatcherResult<T> = {
  cached?: boolean,
  result: T,
};

export interface ScrapperMatcher<Input = any, Output = any> {
  matchRecord(scrapperInfo: Input): CanBePromise<ScrapperMatcherResult<Output>>,
}
