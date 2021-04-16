import * as R from 'ramda';

import {buildURL} from '@shared/helpers/urlEncoder';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {CanBePromise} from '@shared/types';
import {ScrapperGroupChild, MatchRecordAttrs} from './WebsiteScrappersGroup';

export type ScrapperMatcherResult<T> = {
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

    if (!path)
      return null;

    return parseAsyncURLIfOK(
      R.unless(
        R.startsWith(homepageURL),
        R.partial(concatUrls, [homepageURL]),
      )(path),
    );
  }

  /**
   * Fetches result of search
   *
   * @param {object|string} queryParams
   * @returns
   * @memberof WebsiteScrapperMatcher
   */
  async fetchPageBySearch(queryParams: object|string) {
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
