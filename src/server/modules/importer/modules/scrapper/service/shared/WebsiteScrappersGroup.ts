import * as R from 'ramda';

import {PartialRecord} from '@shared/types';

import {ScrapperMetadataKind} from '../../entity/ScrapperMetadata.entity';
import {AsyncScrapper} from './AsyncScrapper';
import {ScrapperMatcher, ScrapperMatcherResult} from './ScrapperMatcher';
import {WebsiteInfoScrapper} from './WebsiteInfoScrapper';

export type WebsiteScrappersKindMap = PartialRecord<ScrapperMetadataKind, AsyncScrapper<any, any>>;

export type WebsiteScrappersMatchersKindMap = PartialRecord<ScrapperMetadataKind, ScrapperMatcher<any>>;

export type ScrappersGroupInitializer<W extends WebsiteInfoScrapper = WebsiteInfoScrapper> = {
  websiteInfoScrapper?: W,
  scrappers?: WebsiteScrappersKindMap,
  matchers?: WebsiteScrappersMatchersKindMap,
};

export type MatchRecordAttrs = {
  data: any,
  kind: ScrapperMetadataKind,
};

export class WebsiteScrappersGroup<W extends WebsiteInfoScrapper = WebsiteInfoScrapper> {
  public readonly websiteInfoScrapper: W;
  public readonly scrappers: WebsiteScrappersKindMap;
  public readonly matchers: WebsiteScrappersMatchersKindMap;

  constructor(
    {
      websiteInfoScrapper,
      scrappers = {},
      matchers = {},
    }: ScrappersGroupInitializer<W>,
  ) {
    this.websiteInfoScrapper = websiteInfoScrapper;
    this.scrappers = scrappers;
    this.matchers = matchers;

    R.forEach(
      (scrapper) => {
        if (scrapper.setParentGroup)
          scrapper.setParentGroup(this);
      },
      [
        ...R.values(scrappers),
        ...R.values(matchers),
      ],
    );
  }

  get websiteURL() {
    return this.websiteInfoScrapper.websiteURL;
  }

  /**
   * Finds record in remote webiste using provided info
   *
   * @param {MatchRecordAttrs} attrs
   * @returns {Promise<ScrapperMatcherResult<any>>}
   * @memberof WebsiteScrappersGroup
   */
  async matchRecord(
    {
      data,
      kind,
    }: MatchRecordAttrs,
  ): Promise<ScrapperMatcherResult<any>> {
    const matcher = this.matchers[kind];
    if (!matcher)
      return null;

    return matcher.matchRecord(data);
  }
}
