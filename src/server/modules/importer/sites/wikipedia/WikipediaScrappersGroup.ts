import {ScrapperMetadataKind} from '@scrapper/entity';
import {WebsiteInfoScrapper, WebsiteScrappersGroup} from '@scrapper/service/shared';
import {CreateRemoteWebsiteDto} from '@server/modules/remote/dto';
import {
  WikipediaAPIOptions,
  WikipediaBookMatcher,
} from './WikipediaBook.matcher';

export type WikipediaScrappersGroupConfig = {
  homepageURL: string,
  clientOptions: WikipediaAPIOptions,
};

export class WikipediaScrappersGroup extends WebsiteScrappersGroup {
  constructor({clientOptions, homepageURL}: WikipediaScrappersGroupConfig) {
    super(
      {
        websiteInfoScrapper: new WebsiteInfoScrapper(
          new CreateRemoteWebsiteDto(
            {
              url: homepageURL,
            },
          ),
        ),
        matchers: {
          [ScrapperMetadataKind.BOOK]: new WikipediaBookMatcher(clientOptions),
        },
      },
    );
  }
}
