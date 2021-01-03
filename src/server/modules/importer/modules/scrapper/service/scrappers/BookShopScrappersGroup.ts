import {
  ScrappersGroupInitializer,
  WebsiteInfoScrapper,
  WebsiteScrappersGroup,
} from '../shared';

export type BookShopUrlsConfig = {
  homepageURL?: string,
  searchURL?: string,
};

export type BookShopScrappersGroupConfig = ScrappersGroupInitializer & BookShopUrlsConfig;

export class BookShopScrappersGroup extends WebsiteScrappersGroup {
  constructor(config: BookShopScrappersGroupConfig) {
    super(
      {
        websiteInfoScrapper: new WebsiteInfoScrapper(config.homepageURL),
        ...config,
      },
    );
  }
}
