import {CanBePromise} from '@shared/types';
import {ScrapperGroupChild} from './Scrapper';
import {WebsiteScrappersGroup} from './WebsiteScrappersGroup';

export type ScrapperMatcherResult<T> = {
  cached?: boolean,
  result: T,
};

export abstract class ScrapperMatcher<Type> implements ScrapperGroupChild {
  protected group: WebsiteScrappersGroup<any>;

  setParentGroup?(group: WebsiteScrappersGroup<any>): void {
    this.group = group;
  }

  abstract matchRecord(scrapperInfo: Type): CanBePromise<ScrapperMatcherResult<Type>>;
}
