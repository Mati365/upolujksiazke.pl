import * as R from 'ramda';

import {
  normalizeISBN,
  normalizeURL,
  normalizeParsedText,
  normalizePrice,
} from '@server/common/helpers';

import {Language} from '@shared/enums/language';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';

import {
  BINDING_TRANSLATION_MAPPINGS,
  BOOK_TYPE_TRANSLATION_MAPPINGS,
  BookAvailabilityParser,
} from '@importer/kinds/scrappers/Book.scrapper';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';

export class DadadaBookParser
  extends WebsiteScrapperParser<CreateBookDto>
  implements BookAvailabilityParser<AsyncURLParseResult> {
  /**
   * @inheritdoc
   */
  parseAvailability({$, url}: AsyncURLParseResult) {
    const remoteId = $('form#FormaRate > input[name="Id"]').val();

    return Promise.resolve(
      {
        result: [
          new CreateBookAvailabilityDto(
            {
              price: normalizePrice($('.productPromo .productFinalPrice').text())?.price,
              prevPrice: normalizePrice($('.productPromo .productBasePrice').text())?.price,
              avgRating: Number.parseFloat($('[data-rateit-value]').attr('rateitValue')) * 2 || null,
              totalRatings: +$('.reviewCount[onclick]').text()?.match(/\(\d+\)/)?.[1] || null,
              remoteId,
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
    const basicProps = DadadaBookParser.extractBookProps($);
    if (!basicProps['isbn'])
      return null;

    const title = normalizeParsedText($('h1.productName').text());
    const authors = basicProps['autor'] && $(basicProps['autor'][1]).find('a').toArray().map(
      (author) => new CreateBookAuthorDto(
        {
          name: normalizeParsedText($(author).text()),
        },
      ),
    );

    const release = new CreateBookReleaseDto(
      {
        title,
        type: BOOK_TYPE_TRANSLATION_MAPPINGS[$('.productFlagTag').text()?.toLowerCase()],
        lang: Language.PL,
        description: normalizeParsedText($('.productDescriptionContent').text()),
        totalPages: +basicProps['liczba stron']?.[0] || null,
        format: basicProps['format']?.[0],
        publishDate: basicProps['rok wydania']?.[0],
        isbn: normalizeISBN(basicProps['isbn'][0]),
        binding: BINDING_TRANSLATION_MAPPINGS[basicProps['oprawa']?.[0]?.toLowerCase()],
        availability: (await this.parseAvailability(bookPage)).result,
        publisher: new CreateBookPublisherDto(
          {
            name: basicProps['wydawca'][0],
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: normalizeURL(
              $('.productPhoto > #imgSmall').attr('originalphotopath'),
            ),
          },
        ),
      },
    );

    return new CreateBookDto(
      {
        authors,
        defaultTitle: title,
        releases: [release],
        categories: $('#breadCrumbs > .breadCrumbsItem:not(:first-child) > a .name').toArray().map(
          (name) => new CreateBookCategoryDto(
            {
              name: $(name).text(),
            },
          ),
        ),
      },
    );
  }
  /* eslint-enable @typescript-eslint/dot-notation */

  /**
   * Extract info about book from table
   *
   * @static
   * @param {cheerio.Root} $
   * @returns {Record<string, [string, cheerio.Cheerio]>}
   * @memberof DadadaBookParser
   */
  static extractBookProps($: cheerio.Root): Record<string, [string, cheerio.Cheerio]> {
    const rows = $('.productDataDetails > .productDataItem').toArray();

    return R.fromPairs(
      R.reject(R.isNil, rows.map(
        (row) => {
          const $row = $(row);
          const $value = $row.children().eq(0);
          const key = normalizeParsedText($row.text()).match(/^([^:]+)/)?.[1]?.toLowerCase();
          if (!key)
            return null;

          return [
            key,
            [
              normalizeParsedText($value.text()),
              $value,
            ],
          ];
        },
      )),
    );
  }
}
