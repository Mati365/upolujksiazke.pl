import {CanBePromise} from '@shared/types';
import {ScrapperGroupChild} from './Scrapper';
import {MatchRecordAttrs, WebsiteScrappersGroup} from './WebsiteScrappersGroup';

export type ScrapperMatcherResult<T> = {
  cached?: boolean,
  result: T,
};

export interface ScrapperMatchable<Type> {
  searchRemoteRecord(attrs: MatchRecordAttrs<Type>): CanBePromise<ScrapperMatcherResult<Type>>;
}

export abstract class ScrapperMatcher<Type> implements ScrapperGroupChild, ScrapperMatchable<Type> {
  protected group: WebsiteScrappersGroup<any>;

  setParentGroup?(group: WebsiteScrappersGroup<any>): void {
    this.group = group;
  }

  get matchers() {
    return this.group.matchers;
  }

  abstract searchRemoteRecord(attrs: MatchRecordAttrs<Type>): CanBePromise<ScrapperMatcherResult<Type>>;
}
