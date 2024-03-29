import {underscoreParameterize} from '@shared/helpers/parameterize';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';

import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {DefaultUrlsConfig} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';
import {ScrapperMetadataKind} from '@scrapper/entity';

export class LiteraturaGildiaBookAuthorMatcher
  extends WebsiteScrapperMatcher<CreateBookAuthorDto, DefaultUrlsConfig> {
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

    return {
      result: await this.parsers[ScrapperMetadataKind.BOOK_AUTHOR].parse(
        await parseAsyncURLIfOK(
          concatUrls(
            config.homepageURL,
            attrs?.path ?? `tworcy/${underscoreParameterize(data.name)}`,
          ),
        ),
      ),
    };
  }
}
