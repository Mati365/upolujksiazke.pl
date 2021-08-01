import {underscoreParameterize} from '@shared/helpers/parameterize';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';

import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';

import {ScrapperMetadataKind} from '@scrapper/entity';
import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {DefaultUrlsConfig} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';

export class LiteraturaGildiaBookPublisherMatcher
  extends WebsiteScrapperMatcher<CreateBookPublisherDto, DefaultUrlsConfig> {
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

    return {
      result: await this.parsers[ScrapperMetadataKind.BOOK_PUBLISHER].parse(
        await parseAsyncURLIfOK(
          concatUrls(
            config.homepageURL,
            attrs?.path ?? `wydawnictwa/${underscoreParameterize(data.name)}`,
          ),
        ),
      ),
    };
  }
}
