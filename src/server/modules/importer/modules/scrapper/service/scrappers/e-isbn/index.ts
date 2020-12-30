import {ScrapperMetadataKind} from '../../../entity';
import {WebsiteInfoScrapper, WebsiteScrappersGroup} from '../../shared';
import {EIsbnBookScrapper, EIsbnBookScrapperConfig} from './Books.scrapper';

export class EIsbnScrappersGroup extends WebsiteScrappersGroup {
  constructor(config: EIsbnBookScrapperConfig) {
    super(
      {
        websiteInfoScrapper: new WebsiteInfoScrapper('https://e-isbn.pl'),
        scrappers: {
          [ScrapperMetadataKind.BOOK]: new EIsbnBookScrapper(config),
        },
      },
    );
  }
}
