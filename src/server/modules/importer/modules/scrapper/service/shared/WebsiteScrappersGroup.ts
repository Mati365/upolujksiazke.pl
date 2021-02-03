import * as R from 'ramda';

import {PartialRecord} from '@shared/types';

import {ScrapperMetadataKind} from '../../entity/ScrapperMetadata.entity';
import {AsyncScrapper} from './AsyncScrapper';
import {WebsiteInfoScrapper} from './WebsiteInfoScrapper';
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
  websiteInfoScrapper?: W,
  scrappers?: WebsiteScrappersKindMap,
  matchers?: WebsiteScrappersMatchersKindMap,
  parsers?: WebsiteParsersKindMap,
};

export type MatchRecordAttrs<T = any> = {
  data: T,
  kind?: ScrapperMetadataKind,
};

export interface URLPathMatcher {
  /**
   * Returns kind of type based on path - it is used primarly in spider
   *
   * @abstract
   * @param {string} path
   * @returns {ScrapperMetadataKind}
   * @memberof WebsiteScrappersGroup
   */
  matchResourceKindByPath(path: string): ScrapperMetadataKind;
}

export function isURLPathMatcher(obj: any): obj is URLPathMatcher {
  return !!obj && ('matchResourceKindByPath' in obj);
}

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
  public readonly websiteInfoScrapper: W;
  public readonly scrappers: WebsiteScrappersKindMap;
  public readonly matchers: WebsiteScrappersMatchersKindMap;
  public readonly parsers: WebsiteParsersKindMap;

  constructor(
    {
      websiteInfoScrapper,
      scrappers = {},
      matchers = {},
      parsers = {},
    }: ScrappersGroupInitializer<W>,
  ) {
    this.websiteInfoScrapper = websiteInfoScrapper;
    this.scrappers = scrappers;
    this.matchers = matchers;
    this.parsers = parsers;

    R.forEach(
      (scrapper) => {
        if (scrapper.setParentGroup)
          scrapper.setParentGroup(this);
      },
      [
        ...R.values(scrappers),
        ...R.values(matchers),
        ...R.values(parsers),
      ],
    );
  }

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
