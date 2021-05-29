import * as R from 'ramda';
import pMap from 'p-map';

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

import {mergeBooks} from '@importer/kinds/scrappers/helpers';
import {
  BookAvailabilityParser,
  LANGUAGE_TRANSLATION_MAPPINGS,
  BINDING_TRANSLATION_MAPPINGS,
  BOOK_TYPE_TRANSLATION_MAPPINGS,
} from '@importer/kinds/scrappers/Book.scrapper';

import {BookProtection, BookType} from '@server/modules/book/modules/release/BookRelease.entity';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';
import {ScrapperMetadataKind} from '../../modules/scrapper/entity';

import type {WoblinkBookMatcher} from './WoblinkBook.matcher';

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
    const remoteId = url.match(/-([^-]+)$/)[1];

    return Promise.resolve(
      {
        bookSchema,
        result: [
          new CreateBookAvailabilityDto(
            {
              remoteId,
              url,
              inStock: $('#book-card > .header > .container > .prices > .price-options').data('inStock') !== false,
              totalRatings: aggregateRating?.ratingCount || null,
              avgRating: aggregateRating?.ratingValue || null,
              prevPrice: normalizePrice(offers.highPrice)?.price,
              price: normalizePrice(offers.lowPrice ?? offers.price)?.price,
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
    const parsed = await this.parseType(bookPage);
    if (!parsed)
      return null;

    const {book, otherTypesLinks} = parsed;
    const matcher = <WoblinkBookMatcher> this.matchers[ScrapperMetadataKind.BOOK];
    const otherFormatsBooks = await pMap(
      otherTypesLinks,
      async (link) => {
        const result = await this.parseType(
          await matcher.fetchPageByPath(link),
        );

        return result?.book;
      },
      {
        concurrency: 2,
      },
    );

    return mergeBooks(
      [
        book,
        ...otherFormatsBooks.filter(Boolean),
      ],
    );
  }
  /* eslint-enable @typescript-eslint/dot-notation */

  /* eslint-disable @typescript-eslint/dot-notation */
  /**
   * Parses and returns other formats links
   *
   * @private
   * @param {AsyncURLParseResult} bookPage
   * @memberof WoblinkBookParser
   */
  private async parseType(bookPage: AsyncURLParseResult) {
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

    const {type, binding} = (
      $('#woblink-items > a.woblink-redirect__highlighted > .format')
        .text()
        .match(/^(?<type>książka|ebook|audiobook)(?:\s*-?\s*Oprawa\s*)?(?<binding>.*)$/i)
    )?.groups || {};

    const tableProps = extractTableRowsMap(
      $,
      $('#product-card-details table.list > tbody > tr').toArray(),
    );

    const release = new CreateBookReleaseDto(
      {
        isbn,
        availability,
        protection: (
          tableProps['typ zabezpieczenia'] === 'Watermak'
            ? BookProtection.WATERMARK
            : null
        ),
        lang: LANGUAGE_TRANSLATION_MAPPINGS[tableProps['język ebooka'] || tableProps['język audiobooka']],
        type: BOOK_TYPE_TRANSLATION_MAPPINGS[type?.toLowerCase()] ?? BookType.EBOOK,
        binding: binding && BINDING_TRANSLATION_MAPPINGS[binding.toLowerCase()],
        title: bookSchema['name'],
        format: tableProps['format'],
        recordingLength: WoblinkBookParser.extractRecordingLength(tableProps['czas słuchania']),
        description: (
          $('#product-card-description > .description > [itemprop="about"] > *:not(.heading)').html()
            || normalizeParsedText(bookSchema['description'])
        ),
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

    const book = new CreateBookDto(
      {
        defaultTitle: bookSchema['name'],
        releases: [release],
        authors: $('#cart-data .author-single').eq(0).toArray().map(
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

    return {
      book,
      otherTypesLinks: R.uniq(
        R.map(
          (el) => $(el).attr('href'),
          $('#woblink-items .woblink-redirect:not(.woblink-redirect__highlighted)').toArray(),
        ),
      ),
    };
  }
  /* eslint-enable @typescript-eslint/dot-notation */

  /**
   * Transforms duration length title into seconds
   *
   * @static
   * @param {string} text
   * @returns
   * @memberof WoblinkBookParser
   */
  static extractRecordingLength(text: string) {
    if (!text)
      return null;

    const match = text.match(
      /(?:(?<hours>[.\d]+)\s*godzin)?\s*(?:(?<minutes>[.\d]+)\s*minut)?\s*(?:(?<seconds>[.\d]+)\s*sekund)?/i,
    );

    if (!match?.groups)
      return null;

    const {
      groups: {
        hours,
        minutes,
        seconds,
      },
    } = match;

    return (+hours || 0) * 3600 + (+minutes || 0) * 60 + (+seconds || 0);
  }
}
