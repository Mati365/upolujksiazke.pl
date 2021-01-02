import {ScrapperMetadataKind} from '../../../entity';
import {WebsiteInfoScrapper, WebsiteScrappersGroup} from '../../shared';
import {EIsbnBookScrapper, EIsbnBookScrapperConfig} from './EIsbnBooks.scrapper';

export type EIsbnScrappersGroupConfig = EIsbnBookScrapperConfig & {
  homepageURL: string,
};

export class EIsbnScrappersGroup extends WebsiteScrappersGroup {
  constructor({homepageURL, ...config}: EIsbnScrappersGroupConfig) {
    super(
      {
        websiteInfoScrapper: new WebsiteInfoScrapper(homepageURL),
        scrappers: {
          [ScrapperMetadataKind.BOOK]: new EIsbnBookScrapper(config),
        },
      },
    );
  }
}
