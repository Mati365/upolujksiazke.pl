import {CreateRemoteWebsiteDto} from '@server/modules/remote/dto/CreateRemoteWebsite.dto';
import {WebsiteInfoScrapper} from '@scrapper/service/scrappers/WebsiteInfoScrapper';
import {
  ScrappersGroupInitializer,
  WebsiteScrappersGroup,
} from '@scrapper/service/shared/WebsiteScrappersGroup';

import {CreateImageAttachmentDto} from '@server/modules/attachment/dto/CreateImageAttachment.dto';
import {SpiderQueueProxyScrapper} from '../../../../kinds/scrappers/SpiderQueueProxy.scrapper';

export type DefaultUrlsConfig = {
  id: number,
  withSubdomains?: boolean,
  homepageURL?: string,
  searchURL?: string,
  apiURL?: string,
  logoURL?: string,
};

export type DefaultScrappersGroupConfig = ScrappersGroupInitializer & DefaultUrlsConfig;

/**
 * Object that groups matchers, scrappers and parsers
 *
 * @export
 * @abstract
 * @class DefaultWebsiteScrappersGroup
 * @extends {WebsiteScrappersGroup}
 * @implements {URLPathMatcher}
 */
export abstract class DefaultWebsiteScrappersGroup extends WebsiteScrappersGroup {
  constructor({scrappers, websiteInfoScrapper, ...config}: DefaultScrappersGroupConfig) {
    super(
      {
        ...config,
        scrappers: scrappers ?? SpiderQueueProxyScrapper.createKindProxy(),
        websiteInfoScrapper: websiteInfoScrapper ?? new WebsiteInfoScrapper(
          new CreateRemoteWebsiteDto(
            {
              url: config.homepageURL,
              withSubdomains: config.withSubdomains,
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
