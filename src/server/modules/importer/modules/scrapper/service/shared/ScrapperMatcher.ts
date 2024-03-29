import {buildURL, concatUrls} from '@shared/helpers';
import {
  parseAsyncURLIfOK,
  parseAsyncURLPathIfOK,
} from '@server/common/helpers/fetchAsyncHTML';

import {CanBePromise} from '@shared/types';
import {
  ScrapperGroupChild,
  MatchRecordAttrs,
  WebsiteScrappersGroup,
} from './WebsiteScrappersGroup';

export type ScrapperMatcherResult<T> = {
  scrappersGroup?: WebsiteScrappersGroup<any>,
  result: T,
  discovery?: any[],
};

export interface ScrapperMatchable<Type> {
  searchRemoteRecord(attrs: MatchRecordAttrs<Type>): CanBePromise<ScrapperMatcherResult<Type>>;
}

/**
 * Search over resource for book
 *
 * @export
 * @abstract
 * @class ScrapperMatcher
 * @implements {ScrapperGroupChild}
 * @implements {ScrapperMatchable<Type>}
 * @template Type
 */
export abstract class ScrapperMatcher<Type> extends ScrapperGroupChild implements ScrapperMatchable<Type> {
  abstract searchRemoteRecord(attrs: MatchRecordAttrs<Type>): CanBePromise<ScrapperMatcherResult<Type>>;
}

export type BaseWebsiteMatcherConfig = {
  homepageURL?: string,
  searchURL?: string,
};

/**
 * Search over website
 *
 * @export
 * @abstract
 * @class WebsiteScrapperMatcher
 * @extends {ScrapperMatcher<Type>}
 * @template Type
 * @template ConfigType
 */
export abstract class WebsiteScrapperMatcher<
  Type,
  ConfigType extends BaseWebsiteMatcherConfig = BaseWebsiteMatcherConfig,
> extends ScrapperMatcher<Type> {
  constructor(
    protected config: ConfigType,
  ) {
    super();
  }

  get homepageURL() {
    return this.config.homepageURL;
  }

  /**
   * Concats urls with root page url and fetches page
   *
   * @param {string} path
   * @returns
   * @memberof WebsiteScrapperMatcher
   */
  async fetchPageByPath(path: string) {
    const {config: {homepageURL}} = this;

    return parseAsyncURLPathIfOK(homepageURL, path);
  }

  /**
   * Fetches result of search
   *
   * @param {object|string} queryParams
   * @returns
   * @memberof WebsiteScrapperMatcher
   */
  async fetchPageBySearch(queryParams: object | string) {
    const {
      config: {
        searchURL,
        homepageURL,
      },
    } = this;

    const prependURL = searchURL ?? homepageURL;
    let url: string = null;

    if (typeof queryParams === 'string')
      url = concatUrls(prependURL, queryParams);
    else
      url = buildURL(prependURL, queryParams);

    return parseAsyncURLIfOK(url);
  }
}
