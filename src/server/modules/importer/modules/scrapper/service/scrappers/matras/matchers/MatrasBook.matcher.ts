import {buildURL} from '@shared/helpers';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {MatchRecordAttrs} from '../../../shared/WebsiteScrappersGroup';
import {ScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';

export class MatrasBookMatcher extends ScrapperMatcher<CreateBookDto> {
  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    await this.searchByPhrase(data);
    return Promise.resolve(null);
  }

  /**
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof GraniceBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const {config} = this;
    const $ = await parseAsyncURLIfOK(
      buildURL(
        config.searchURL,
        {
          szukaj: `${title} ${authors[0].name}`,
        },
      ),
    );

    console.info($);
  }
}
