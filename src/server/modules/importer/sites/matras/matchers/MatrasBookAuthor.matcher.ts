import {normalizeParsedText} from '@server/common/helpers';
import {underscoreParameterize} from '@shared/helpers/parameterize';
import {AsyncURLParseResult, parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';

import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';

export class MatrasBookAuthorMatcher extends WebsiteScrapperMatcher<CreateBookAuthorDto, BookShopScrappersGroupConfig> {
  /**
   * @inheritdoc
   */
  async extractFromFetchedPage(bookPage: AsyncURLParseResult): Promise<ScrapperMatcherResult<CreateBookAuthorDto>> {
    if (!bookPage)
      return null;

    const {$} = bookPage;
    const $section = $('.mainContainer.pageHome > section:first-child');
    return {
      result: new CreateBookAuthorDto(
        {
          name: normalizeParsedText($section.find('h2').text()),
          description: normalizeParsedText(
            $section
              .find('.col-lg-8.col-md-8.col-sm-8.col-xs-12.right')
              ?.text(),
          ),
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
          attrs?.path ?? `autor/${underscoreParameterize(data.name)}`,
        ),
      ),
    );
  }
}
