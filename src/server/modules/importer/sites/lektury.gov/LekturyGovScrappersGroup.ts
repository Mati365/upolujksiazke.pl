import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  BookShopScrappersGroup,
  BookShopScrappersGroupConfig,
} from '@importer/kinds/scrappers/BookShop.scrapper';

import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {JwtAPIClient} from '@api/jwt';
import {LekturyGovBookScrapper} from './LekturyGovBook.scrapper';

export class LekturyGovScrappersGroup extends BookShopScrappersGroup {
  public readonly api: JwtAPIClient;

  constructor(options: BookShopScrappersGroupConfig) {
    super(
      {
        ...options,
        scrappers: {
          [ScrapperMetadataKind.BOOK]: new LekturyGovBookScrapper,
        },
      },
    );

    this.api = new JwtAPIClient(
      {
        tokenIsAlwaysRequired: true,
        url: options.apiURL,
        customTokensRefreshFn: async () => {
          const result = await parseAsyncURLIfOK(options.homepageURL);

          return {
            token: result?.$('#security').data('value'),
          };
        },
      },
    );
  }
}
