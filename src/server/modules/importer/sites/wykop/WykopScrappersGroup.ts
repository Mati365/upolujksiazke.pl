import {ScrapperMetadataKind} from '@scrapper/entity';
import {CreateRemoteWebsiteDto} from '@server/modules/remote/dto';
import {WebsiteScrappersGroup} from '@scrapper/service/shared';
import {WebsiteInfoScrapper} from '@scrapper/service/scrappers';
import {WykopBookReviewScrapper, WykopBookReviewScrapperConfig} from './book-review/WykopBookReview.scrapper';

export type WykopScrappersGroupConfig = WykopBookReviewScrapperConfig & {
  id: number,
  homepageURL: string,
};

export class WykopScrappersGroup extends WebsiteScrappersGroup {
  constructor({id, api, homepageURL}: WykopScrappersGroupConfig) {
    super(
      {
        id,
        websiteInfoScrapper: new WebsiteInfoScrapper(
          new CreateRemoteWebsiteDto(
            {
              url: homepageURL,
            },
          ),
        ),
        scrappers: {
          [ScrapperMetadataKind.BOOK_REVIEW]: new WykopBookReviewScrapper(
            {
              api,
            },
          ),
        },
      },
    );
  }
}
