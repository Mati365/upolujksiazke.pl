import {normalizeURL} from '@server/common/helpers';
import {concatUrls} from '@shared/helpers/concatUrls';
import {decodeEscapedUnicode} from '@server/common/helpers/encoding/decodeEscapedUnicode';

import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto/CreateImageAttachment.dto';

import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';

export class PublioBookPublisherMatcher
  extends WebsiteScrapperMatcher<CreateBookPublisherDto, BookShopScrappersGroupConfig> {
  /**
   * @inheritdoc
   */
  async extractFromFetchedPage(page: AsyncURLParseResult): Promise<ScrapperMatcherResult<CreateBookPublisherDto>> {
    if (!page)
      return null;

    const {config} = this;
    const {$} = page;
    const logoUrl = (
      $
        .html()
        .match(/imagePath:"(\\u002Ffiles\\u002Fcompany[^"]*)"/)?.[1]
    );

    return {
      result: new CreateBookPublisherDto(
        {
          name: $('h1').text().match(/(.*)\s-\s/)[1],
          description: $('.listing-details .expandable.--open').text(),
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

  /**
   * @inheritdoc
   */
  async searchRemoteRecord(
    _: MatchRecordAttrs<CreateBookPublisherDto>,
    attrs?: {
      path: string,
    },
  ): Promise<ScrapperMatcherResult<CreateBookPublisherDto>> {
    if (!attrs)
      return null;

    return this.extractFromFetchedPage(
      await this.fetchPageByPath(attrs.path),
    );
  }
}
