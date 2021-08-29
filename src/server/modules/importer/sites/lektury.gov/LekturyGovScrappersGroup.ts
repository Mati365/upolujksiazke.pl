import {ScrapperMetadataKind} from '@scrapper/entity';
import {
  DefaultWebsiteScrappersGroup,
  DefaultScrappersGroupConfig,
} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';

import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {JwtAPIClient} from '@api/jwt';
import {LekturyGovBookScrapper} from './LekturyGovBook.scrapper';

export class LekturyGovScrappersGroup extends DefaultWebsiteScrappersGroup {
  public readonly api: JwtAPIClient;

  constructor(options: DefaultScrappersGroupConfig) {
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
        url: options.apiURL,
        tokenIsAlwaysRequired: true,
        withAuthorizationHeader: true,
        camelizeResponse: true,
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
