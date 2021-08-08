import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {CarrefourBrochuresScrapper} from './CarrefourBrochures.scrapper';

export class CarrefourScrappersGroup extends DefaultWebsiteScrappersGroup {
  constructor(config: DefaultScrappersGroupConfig) {
    super(
      {
        ...config,
        scrappers: {
          [ScrapperMetadataKind.BROCHURE]: new CarrefourBrochuresScrapper(
            {
              latestBrochuresPath: 'promocje/gazetka-promocyjna',
            },
          ),
        },
      },
    );
  }
}
