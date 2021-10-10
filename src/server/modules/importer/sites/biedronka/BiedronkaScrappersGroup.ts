import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {BiedronkaBrochuresScrapper} from './BiedronkaBrochures.scrapper';

export class BiedronkaScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(config: DefaultScrappersGroupConfig) {
    super(
      {
        ...config,
        scrappers: {
          [ScrapperMetadataKind.BROCHURE]: new BiedronkaBrochuresScrapper(
            {
              latestBrochuresPath: '/pl/gazetki',
              apiPath: '/flexpaper/view',
              logoURL: config.logoURL,
            },
          ),
        },
      },
    );
  }
}
