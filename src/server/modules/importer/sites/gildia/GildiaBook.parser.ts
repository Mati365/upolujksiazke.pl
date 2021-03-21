import * as R from 'ramda';

import {countLetter} from '@shared/helpers';

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
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';

import {
  BINDING_TRANSLATION_MAPPINGS,
  BookAvailabilityParser,
} from '@importer/kinds/scrappers/Book.scrapper';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';

export class GildiaBookParser
  extends WebsiteScrapperParser<CreateBookDto>
  implements BookAvailabilityParser<AsyncURLParseResult> {
  /**
   * @inheritdoc
   */
  parseAvailability({$, url}: AsyncURLParseResult) {
    const $basicProductInfo = $('.basic-product-info');

    return Promise.resolve(
      {
        result: [
          new CreateBookAvailabilityDto(
            {
              url,
              remoteId: GildiaBookParser.extractID($),
              totalRatings: 1,
              avgRating: (
                countLetter(
                  '',
                  $('.product-page-description .rating-stars[data-content]').data('content'),
                ) * 2
              ) || null,

              prevPrice: normalizePrice(
                $basicProductInfo.find('.previous-price').text(),
              )?.price,

              price: normalizePrice(
                $basicProductInfo.find('.current-price').text(),
              )?.price,
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

    const release = await this.parseRelease(bookPage);
    return new CreateBookDto(
      {
        authors: GildiaBookParser.parseAuthors(bookPage.$),
        defaultTitle: release.title,
        releases: [
          release,
        ],
      },
    );
  }
  /* eslint-enable @typescript-eslint/dot-notation */

  /**
   * Extracts multiple book authors from page
   *
   * @static
   * @param {cheerio.Root} $
   * @memberof GildiaBookMatcher
   */
  static parseAuthors($: cheerio.Root) {
    return $('.basic-product-info > a[href^="/szukaj/osoba/"]').toArray().map(
      (el) => new CreateBookAuthorDto(
        {
          name: $(el).text(),
        },
      ),
    );
  }

  /**
   * Pick release info from fetched page
   *
   * @param {AsyncURLParseResult} bookPage
   * @returns
   * @memberof GildiaBookParser
   */
  async parseRelease(bookPage: AsyncURLParseResult) {
    const {$} = bookPage;
    const basicProps = R.fromPairs(
      $('.basic-product-info > li')
        .toArray()
        .map(
          (el) => {
            const childs = $(el).children();
            const title = childs.first().text();

            return [
              R.toLower(R.init(title)),
              $(el).text().substr(title.length),
            ];
          },
        ),
    );

    /* eslint-disable @typescript-eslint/dot-notation */
    return new CreateBookReleaseDto(
      {
        lang: Language.PL,
        title: $('.product-page-description .product-page-title').text(),
        description: normalizeParsedText($('.product-page-description-details > p').html()),
        isbn: normalizeISBN(basicProps['isbn-13'] ?? basicProps['isbn']),
        totalPages: +basicProps['liczba stron'] || null,
        format: normalizeParsedText(basicProps['format']),
        publishDate: normalizeParsedText(basicProps['data wydania']),
        translator: basicProps['tłumacz']?.split(',').map((str) => normalizeParsedText(str)),
        availability: (await this.parseAvailability(bookPage)).result,
        binding: BINDING_TRANSLATION_MAPPINGS[
          normalizeParsedText(basicProps['oprawa'])?.toLowerCase()
        ],
        publisher: new CreateBookPublisherDto(
          {
            name: normalizeParsedText(basicProps['wydawnictwo']),
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: normalizeURL(
              $('[data-gallery="product"] .img-responsive.product-page-cover').attr('src'),
            ),
          },
        ),
      },
    );
    /* eslint-enable @typescript-eslint/dot-notation */
  }

  /**
   * Extracts id from page
   *
   * @static
   * @param {cheerio.Root} $
   * @returns
   * @memberof GildiaBookParser
   */
  static extractID($: cheerio.Root) {
    return $('.product-page-description [data-add-product]').data('addProduct');
  }
}
