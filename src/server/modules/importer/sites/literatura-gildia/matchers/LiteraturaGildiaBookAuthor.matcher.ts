import {normalizeParsedText} from '@server/common/helpers';
import {underscoreParameterize} from '@shared/helpers/parameterize';
import {AsyncURLParseResult, parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';

import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';

export class LiteraturaGildiaBookAuthorMatcher
  extends WebsiteScrapperMatcher<CreateBookAuthorDto, BookShopScrappersGroupConfig> {
  /**
   * @inheritdoc
   */
  async extractFromFetchedPage(page: AsyncURLParseResult): Promise<ScrapperMatcherResult<CreateBookAuthorDto>> {
    if (!page)
      return null;

    const {$} = page;
    return {
      result: new CreateBookAuthorDto(
        {
          name: normalizeParsedText($('h1').text()),
          description: normalizeParsedText($('.widetext .visible-sentence')?.text()),
        },
      ),
    };
  }

  /**
   * @inheritdoc
   */
  async searchRemoteRecord(
    {data}: MatchRecordAttrs<CreateBookAuthorDto>,
    attrs?: {
      path: string,
    },
  ): Promise<ScrapperMatcherResult<CreateBookAuthorDto>> {
    const {config} = this;

    return this.extractFromFetchedPage(
      await parseAsyncURLIfOK(
        concatUrls(
          config.homepageURL,
          attrs?.path ?? `tworcy/${underscoreParameterize(data.name)}`,
        ),
      ),
    );
  }
}
