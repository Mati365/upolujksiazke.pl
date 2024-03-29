import * as R from 'ramda';

import {extractHostname} from '@shared/helpers';

import {PartialRecord} from '@shared/types';
import {ScrapperMetadataKind} from '../../entity/ScrapperMetadata.entity';
import {AsyncScrapper} from './AsyncScrapper';
import {WebsiteInfoScrapper} from '../scrappers/WebsiteInfoScrapper';
import {WebsiteScrapperSpider} from './WebsiteScrapperSpider';
import {ScrapperParser} from './ScrapperParser';
import {
  ScrapperMatchable,
  ScrapperMatcher,
  ScrapperMatcherResult,
} from './ScrapperMatcher';

export type WebsiteScrappersKindMap = PartialRecord<ScrapperMetadataKind, AsyncScrapper<any, any>>;
export type WebsiteScrappersMatchersKindMap = PartialRecord<ScrapperMetadataKind, ScrapperMatcher<any>>;
export type WebsiteParsersKindMap = PartialRecord<ScrapperMetadataKind, ScrapperParser<any, any, any>>;

export type ScrappersGroupInitializer<W extends WebsiteInfoScrapper = WebsiteInfoScrapper> = {
  id: number,
  websiteInfoScrapper?: W,
  spider?: WebsiteScrapperSpider,
  scrappers?: WebsiteScrappersKindMap,
  matchers?: WebsiteScrappersMatchersKindMap,
  parsers?: WebsiteParsersKindMap,
};

export type MatchRecordAttrs<T = any> = {
  data: T,
  kind?: ScrapperMetadataKind,
};

/**
 * Container of scrappers
 *
 * @export
 * @class WebsiteScrappersGroup
 * @implements {ScrapperMatchable<string>}
 * @template W
 */
export class WebsiteScrappersGroup<W extends WebsiteInfoScrapper = WebsiteInfoScrapper>
implements ScrapperMatchable<string> {
  public readonly id: number;
  public readonly websiteInfoScrapper: W;
  public readonly scrappers: WebsiteScrappersKindMap;
  public readonly matchers: WebsiteScrappersMatchersKindMap;
  public readonly parsers: WebsiteParsersKindMap;
  public readonly spider: WebsiteScrapperSpider;

  constructor(
    {
      id,
      websiteInfoScrapper,
      spider,
      scrappers = {},
      matchers = {},
      parsers = {},
    }: ScrappersGroupInitializer<W>,
  ) {
    this.id = id;
    this.websiteInfoScrapper = websiteInfoScrapper;
    this.scrappers = scrappers;
    this.matchers = matchers;
    this.parsers = parsers;
    this.spider = spider;

    R.forEach(
      (scrapper) => {
        if (scrapper?.setParentGroup)
          scrapper.setParentGroup(this);
      },
      [
        spider,
        ...R.values(scrappers),
        ...R.values(matchers),
        ...R.values(parsers),
      ],
    );
  }

  /**
   * Returns true if whole url matches scrapper
   *
   * @param {string} url
   * @return {boolean}
   * @memberof WebsiteScrappersGroup
   */
  isWebsiteURLMatching(url: string): boolean {
    const {withSubdomains, websiteURL} = this;

    return (
      extractHostname(url, {dropSubdomain: withSubdomains})
        === extractHostname(websiteURL, {dropSubdomain: withSubdomains})
    );
  }

  get withSubdomains() { return this.websiteInfoScrapper.withSubdomains; }
  get websiteURL() { return this.websiteInfoScrapper.websiteURL; }

  /**
   * Finds record in remote webiste using provided info
   *
   * @param {MatchRecordAttrs} attrs
   * @returns {Promise<ScrapperMatcherResult<any>>}
   * @memberof WebsiteScrappersGroup
   */
  async searchRemoteRecord(attrs: MatchRecordAttrs<any>): Promise<ScrapperMatcherResult<any>> {
    const matcher = this.matchers[attrs.kind];
    if (!matcher)
      return null;

    return matcher.searchRemoteRecord(attrs);
  }
}

/**
 * Child that cann access matchers, parsers, etc
 *
 * @export
 * @class ScrapperGroupChild
 */
export class ScrapperGroupChild {
  protected group: WebsiteScrappersGroup<any>;

  setParentGroup?(group: WebsiteScrappersGroup<any>): void {
    this.group = group;
  }

  get websiteURL() { return this.group.websiteURL; }
  get matchers() { return this.group.matchers; }
  get scrappers() { return this.group.scrappers; }
  get parsers() { return this.group.parsers; }
}
