import {normalizeURL} from '@server/common/helpers';
import {concatUrls} from '@shared/helpers/concatUrls';
import {decodeEscapedUnicode} from '@server/common/helpers/encoding/decodeEscapedUnicode';

import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto/CreateImageAttachment.dto';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '@server/modules/importer/modules/scrapper/service/shared';

export class PublioPublisherParser extends WebsiteScrapperParser<CreateBookPublisherDto> {
  /**
   * @inheritdoc
   */
  parse(page: AsyncURLParseResult): CreateBookPublisherDto {
    if (!page)
      return null;

    const {config} = this;
    const {$} = page;
    const logoUrl = (
      $
        .html()
        .match(/imagePath:"(\\u002Ffiles\\u002Fcompany[^"]*)"/)?.[1]
    );

    return new CreateBookPublisherDto(
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
    );
  }
}
