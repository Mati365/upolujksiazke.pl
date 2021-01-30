import * as R from 'ramda';

import {normalizeParsedText} from '@server/common/helpers';
import {underscoreParameterize} from '@shared/helpers/parameterize';
import {AsyncURLParseResult, parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';

import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';

export class LiteraturaGildiaBookPublisherMatcher
  extends WebsiteScrapperMatcher<CreateBookPublisherDto, BookShopScrappersGroupConfig> {
  /**
   * @inheritdoc
   */
  async extractFromFetchedPage(page: AsyncURLParseResult): Promise<ScrapperMatcherResult<CreateBookPublisherDto>> {
    if (!page)
      return null;

    const {$} = page;
    const $content = $('#yui-main .widetext');
    const segments = $content.find('p').toArray().map((item) => $(item).text());
    const [
      descriptionSegments,
      propsSegments,
    ] = (
      R
        .splitWhen(
          (line: string) => (
            line.startsWith('ul.')
              || line.includes('Kontakt:')
              || line.includes('Dane teleadresowe')
          ),
          segments,
        )
        .map(
          (items) => items.join('\n'),
        )
    );

    return {
      result: new CreateBookPublisherDto(
        {
          name: normalizeParsedText($('h1').text()),
          description: descriptionSegments,
          address: propsSegments.match(/^\s*ul.\s*(.*)$/m)?.[1],
          email: propsSegments.match(/^\s*e-mail:\s*(.*)$/m)?.[1].trim(),
        },
      ),
    };
  }

  /**
   * @inheritdoc
   */
  async searchRemoteRecord(
    {data}: MatchRecordAttrs<CreateBookPublisherDto>,
    attrs?: {
      path: string,
    },
  ): Promise<ScrapperMatcherResult<CreateBookPublisherDto>> {
    const {config} = this;

    return this.extractFromFetchedPage(
      await parseAsyncURLIfOK(
        concatUrls(
          config.homepageURL,
          attrs?.path ?? `wydawnictwa/${underscoreParameterize(data.name)}`,
        ),
      ),
    );
  }
}
