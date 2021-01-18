import {normalizeParsedText} from '@server/common/helpers';
import {underscoreParameterize} from '@shared/helpers/parameterize';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';

import {ScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {MatchRecordAttrs} from '../../../shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';

export class LiteraturaGildiaBookAuthorMatcher extends ScrapperMatcher<CreateBookAuthorDto> {
  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

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
          attrs?.path ?? `tworcy/${underscoreParameterize(name)}`,
        ),
      )
    )?.$;

    if (!$)
      return null;

    return {
      result: new CreateBookAuthorDto(
        {
          name: name ?? normalizeParsedText($('h1').text()),
          description: description ?? normalizeParsedText($('.widetext .visible-sentence')?.text()),
        },
      ),
    };
  }
}
