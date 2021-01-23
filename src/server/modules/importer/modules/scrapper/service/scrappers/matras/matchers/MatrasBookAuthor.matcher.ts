import {normalizeParsedText} from '@server/common/helpers';
import {underscoreParameterize} from '@shared/helpers/parameterize';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';

import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {MatchRecordAttrs} from '../../../shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';

export class MatrasBookAuthorMatcher extends WebsiteScrapperMatcher<CreateBookAuthorDto, BookShopScrappersGroupConfig> {
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
    const {name, description} = data;
    const $ = (
      await parseAsyncURLIfOK(
        concatUrls(
          config.homepageURL,
          attrs?.path ?? `autor/${underscoreParameterize(name)}`,
        ),
      )
    )?.$;

    if (!$)
      return null;

    const $section = $('.mainContainer.pageHome > section:first-child');
    return {
      result: new CreateBookAuthorDto(
        {
          name: name ?? normalizeParsedText($section.find('h2').text()),
          description: description ?? normalizeParsedText(
            $section
              .find('.col-lg-8.col-md-8.col-sm-8.col-xs-12.right')
              ?.text(),
          ),
        },
      ),
    };
  }
}
