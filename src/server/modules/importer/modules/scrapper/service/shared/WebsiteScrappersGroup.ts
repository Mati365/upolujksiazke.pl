import * as R from 'ramda';

import {PartialRecord} from '@shared/types';

import {ScrapperMetadataKind} from '../../entity/ScrapperMetadata.entity';
import {AsyncScrapper} from './AsyncScrapper';
import {WebsiteInfoScrapper} from './WebsiteInfoScrapper';

export type WebsiteScrappersKindMap = PartialRecord<ScrapperMetadataKind, AsyncScrapper<any, any>>;

export type ScrappersGroupInitializer<W extends WebsiteInfoScrapper> = {
  websiteInfoScrapper?: W,
  scrappers: WebsiteScrappersKindMap,
};

export class WebsiteScrappersGroup<W extends WebsiteInfoScrapper = WebsiteInfoScrapper> {
  public readonly websiteInfoScrapper: W;
  public readonly scrappers: WebsiteScrappersKindMap;

  constructor(
    {
      websiteInfoScrapper,
      scrappers,
    }: ScrappersGroupInitializer<W>,
  ) {
    this.websiteInfoScrapper = websiteInfoScrapper;
    this.scrappers = scrappers;

    R.forEachObjIndexed(
      (scrapper) => {
        if (scrapper.setParentGroup)
          scrapper.setParentGroup(this);
      },
      scrappers,
    );
  }

  get websiteURL() {
    return this.websiteInfoScrapper.websiteURL;
  }
}
