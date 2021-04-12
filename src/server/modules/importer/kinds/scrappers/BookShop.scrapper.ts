import {CreateRemoteWebsiteDto} from '@server/modules/remote/dto';
import {WebsiteInfoScrapper} from '@scrapper/service/scrappers/WebsiteInfoScrapper';
import {
  ScrappersGroupInitializer,
  WebsiteScrappersGroup,
} from '@scrapper/service/shared';

import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {SpiderQueueProxyScrapper} from './SpiderQueueProxy.scrapper';

export type BookShopUrlsConfig = {
  homepageURL?: string,
  searchURL?: string,
  apiURL?: string,
  logoURL?: string,
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
        scrappers: scrappers ?? SpiderQueueProxyScrapper.createKindProxy(),
        websiteInfoScrapper: websiteInfoScrapper ?? new WebsiteInfoScrapper(
          new CreateRemoteWebsiteDto(
            {
              url: config.homepageURL,
              logo: config.logoURL && new CreateImageAttachmentDto(
                {
                  originalUrl: config.logoURL,
                },
              ),
            },
          ),
        ),
      },
    );
  }
}
