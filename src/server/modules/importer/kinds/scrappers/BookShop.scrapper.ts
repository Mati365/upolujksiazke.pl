import {
  ScrappersGroupInitializer,
  WebsiteInfoScrapper,
  WebsiteScrappersGroup,
} from '@scrapper/service/shared';

import {SpiderQueueProxyScrapper} from './SpiderQueueProxy.scrapper';

export type BookShopUrlsConfig = {
  homepageURL?: string,
  searchURL?: string,
};

export type BookShopScrappersGroupConfig = ScrappersGroupInitializer & BookShopUrlsConfig;

/**
 * Object that groups matchers, scrappers and parsers
 *
 * @export
 * @abstract
 * @class BookShopScrappersGroup
 * @extends {WebsiteScrappersGroup}
 * @implements {URLPathMatcher}
 */
export abstract class BookShopScrappersGroup extends WebsiteScrappersGroup {
  constructor({scrappers, websiteInfoScrapper, ...config}: BookShopScrappersGroupConfig) {
    super(
      {
        ...config,
        websiteInfoScrapper: websiteInfoScrapper ?? new WebsiteInfoScrapper(config.homepageURL),
        scrappers: scrappers ?? SpiderQueueProxyScrapper.createKindProxy(),
      },
    );
  }
}
