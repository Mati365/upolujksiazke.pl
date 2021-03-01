import {
  extractTableRowsMap,
  extractJsonLD,
} from '@scrapper/helpers';

import {
  normalizeISBN,
  normalizeParsedText,
  normalizePrice,
} from '@server/common/helpers';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';

import {
  BINDING_TRANSLATION_MAPPINGS,
  BookAvailabilityParser,
  BOOK_TYPE_TRANSLATION_MAPPINGS,
} from '@importer/kinds/scrappers/Book.scrapper';

import {BookType} from '@server/modules/book/modules/release/BookRelease.entity';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';

export class WoblinkBookParser
  extends WebsiteScrapperParser<CreateBookDto>
  implements BookAvailabilityParser<AsyncURLParseResult, {bookSchema: object}> {
  /**
   * @inheritdoc
   */
  parseAvailability({$, url}: AsyncURLParseResult) {
    const {
      schemas: {
        Product: [bookSchema],
      },
    } = extractJsonLD($);

    const {aggregateRating, offers} = bookSchema;
    const remoteId = url.match(/(\d+)$/)[1];

    return Promise.resolve(
      {
        bookSchema,
        result: [
          new CreateBookAvailabilityDto(
            {
              remoteId,
              totalRatings: aggregateRating.ratingCount || null,
              avgRating: aggregateRating.ratingValue || null,
              prevPrice: normalizePrice(offers.highPrice)?.price,
              price: normalizePrice(offers.lowPrice)?.price,
              url,
            },
          ),
        ],
      },
    );
  }

  /**
   * @inheritdoc
   */
  /* eslint-disable @typescript-eslint/dot-notation */
  async parse(bookPage: AsyncURLParseResult) {
    if (!bookPage)
      return null;

    const {$} = bookPage;
    const {
      bookSchema,
      result: availability,
    } = await this.parseAvailability(bookPage);

    const isbn = normalizeISBN(bookSchema['productID'].match('isbn:(.*)$')?.[1]);
    if (!isbn)
      return null;

    const {groups: {type, binding}} = (
      $('#woblink-items > a.woblink-redirect__highlighted > .format')
        .text()
        .match(/^(?<type>książka|ebook|audiobook)(?:\s*-?\s*Oprawa\s*)?(?<binding>.*)$/i)
    );

    const tableProps = extractTableRowsMap(
      $,
      $('#product-card-details table.list > tbody > tr').toArray(),
    );

    const release = new CreateBookReleaseDto(
      {
        isbn,
        availability,
        type: BOOK_TYPE_TRANSLATION_MAPPINGS[type.toLowerCase()] ?? BookType.EBOOK,
        binding: binding && BINDING_TRANSLATION_MAPPINGS[binding.toLowerCase()],
        title: bookSchema['name'],
        description: normalizeParsedText(bookSchema['description']),
        totalPages: +tableProps['liczba stron'] || null,
        publishDate: bookSchema['releaseDate'],
        publisher: new CreateBookPublisherDto(
          {
            name: bookSchema['brand'],
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: bookSchema['image'],
          },
        ),
      },
    );

    return new CreateBookDto(
      {
        defaultTitle: bookSchema['name'],
        releases: [release],
        authors: $('#cart-data .author-single').toArray().map(
          (item) => new CreateBookAuthorDto(
            {
              name: normalizeParsedText($(item).text()),
            },
          ),
        ),
        categories: $('#book-card .breadcrumbs__list > li:nth-child(n+3):not(:last-child) > a').toArray().map(
          (item) => new CreateBookCategoryDto(
            {
              name: normalizeParsedText($(item).text()),
            },
          ),
        ),
      },
    );
  }
  /* eslint-enable @typescript-eslint/dot-notation */
}
