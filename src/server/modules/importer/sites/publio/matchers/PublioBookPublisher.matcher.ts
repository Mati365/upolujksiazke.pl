import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {DefaultUrlsConfig} from '@scrapper/service/shared/DefaultWebsiteScrappersGroup';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {ScrapperMetadataKind} from '@scrapper/entity';

export class PublioBookPublisherMatcher
  extends WebsiteScrapperMatcher<CreateBookPublisherDto, DefaultUrlsConfig> {
  /**
   * @inheritdoc
   */
  async searchRemoteRecord(
    _: MatchRecordAttrs<CreateBookPublisherDto>,
    attrs?: {
      path: string,
    },
  ): Promise<ScrapperMatcherResult<CreateBookPublisherDto>> {
    return attrs && {
      result: await this.parsers[ScrapperMetadataKind.BOOK_PUBLISHER].parse(
        await this.fetchPageByPath(attrs.path),
      ),
    };
  }
}
