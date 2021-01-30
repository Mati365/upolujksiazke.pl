import {normalizeURL} from '@server/common/helpers';
import {concatUrls} from '@shared/helpers/concatUrls';
import {decodeEscapedUnicode} from '@server/common/helpers/encoding/decodeEscapedUnicode';

import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto/CreateImageAttachment.dto';

import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';

export class PublioBookPublisherMatcher
  extends WebsiteScrapperMatcher<CreateBookPublisherDto, BookShopScrappersGroupConfig> {
  /**
   * @inheritdoc
   */
  async searchRemoteRecord(
    {data}: MatchRecordAttrs<CreateBookPublisherDto>,
    attrs?: {
      path: string,
    },
  ): Promise<ScrapperMatcherResult<CreateBookPublisherDto>> {
    if (!attrs)
      return null;

    const {config} = this;
    const {name, description} = data;
    const $ = (await this.fetchPageByPath(attrs.path))?.$;
    if (!$)
      return null;

    const logoUrl = (
      $
        .html()
        .match(/imagePath:"(\\u002Ffiles\\u002Fcompany[^"]*)"/)?.[1]
    );

    return $ && {
      result: new CreateBookPublisherDto(
        {
          name,
          description: description ?? $('.listing-details .expandable.--open').text(),
          logo: logoUrl && new CreateImageAttachmentDto(
            {
              originalUrl: concatUrls(
                config.homepageURL,
                normalizeURL(decodeEscapedUnicode(logoUrl)),
              ),
            },
          ),
        },
      ),
    };
  }
}
