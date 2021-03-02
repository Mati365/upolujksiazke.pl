import * as R from 'ramda';

import {trimBorderSpecialCharacters} from '@server/common/helpers/text/trimBorderSpecialCharacters';
import {parameterize} from '@shared/helpers/parameterize';
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
import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {CreateBookSeriesDto} from '@server/modules/book/modules/series/dto/CreateBookSeries.dto';
import {CreateBookReviewerDto} from '@server/modules/book/modules/reviewer/dto/CreateBookReviewer.dto';

import {BookProtection, BookType} from '@server/modules/book/modules/release/BookRelease.entity';
import {
  BookAvailabilityParser,
  LANGUAGE_TRANSLATION_MAPPINGS,
  BINDING_TRANSLATION_MAPPINGS,
  BOOK_TYPE_TRANSLATION_MAPPINGS,
} from '@importer/kinds/scrappers/Book.scrapper';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';

export class TaniaksiazkaBookParser
  extends WebsiteScrapperParser<CreateBookDto>
  implements BookAvailabilityParser<AsyncURLParseResult> {
  /**
   * @inheritdoc
   */
  parseAvailability({$, url}: AsyncURLParseResult) {
    const remoteId = TaniaksiazkaBookParser.extractID($);

    return Promise.resolve(
      {
        result: [
          new CreateBookAvailabilityDto(
            {
              remoteId,
              url,
              totalRatings: +TaniaksiazkaBookParser.extractProp($, 'product:reviews_cnt') || null,
              avgRating: +TaniaksiazkaBookParser.extractProp($, 'product:reviews_avg') || null,
              price: normalizePrice(TaniaksiazkaBookParser.extractProp($, 'product:price:amount'))?.price,
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
    const basicProps = TaniaksiazkaBookParser.extractBookProps($);
    if (!basicProps['isbn'])
      return null;

    const title = normalizeParsedText(
      $('#content .product-info h1 > span')
        .contents()
        .filter((_, el) => el.type === 'text')
        .text(),
    );

    const type = $('.product-info h1 .products-title-prefix').text()?.toLowerCase();
    const release = new CreateBookReleaseDto(
      {
        title,
        defaultPrice: normalizePrice(
          TaniaksiazkaBookParser.extractProp($, 'product:original_price:amount'),
        )?.price,

        lang: LANGUAGE_TRANSLATION_MAPPINGS[basicProps['język']?.text],
        type: BOOK_TYPE_TRANSLATION_MAPPINGS[type] ?? BookType.PAPER,
        binding: BINDING_TRANSLATION_MAPPINGS[basicProps['oprawa']?.text.toLowerCase()],
        format: (basicProps['format'] || basicProps['rodzaj pliku'])?.text,
        description: normalizeParsedText($('#product-description').text()),
        totalPages: +basicProps['ilość stron']?.text || null,
        publishDate: basicProps['rok wydania']?.text,
        availability: (await this.parseAvailability(bookPage)).result,
        isbn: normalizeISBN(basicProps['isbn'].text),
        protection: (
          basicProps['licencja']?.text === 'znak wodny'
            ? BookProtection.WATERMARK
            : null
        ),
        publisher: basicProps['wydawnictwo'] && new CreateBookPublisherDto(
          {
            name: basicProps['wydawnictwo'].text,
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: $('#product-gallery-main ul li.active img[data-zoom-image]').data('zoomImage'),
          },
        ),
        reviews: TaniaksiazkaBookParser.extractReviews(bookPage),
      },
    );

    return new CreateBookDto(
      {
        defaultTitle: release.title,
        series: basicProps['seria'] && [
          new CreateBookSeriesDto(
            {
              name: basicProps['seria']?.text,
            },
          ),
        ],
        authors: basicProps['autor']?.el.find('a').toArray().map((author: cheerio.Element) => (
          new CreateBookAuthorDto(
            {
              name: $(author).text(),
            },
          )
        )),
        tags: (
          basicProps['powiązane tematy']
            ?.el
            .find('a')
            .toArray()
            .map((tag: cheerio.Element) => $(tag).text().trim())
        ),
        releases: [release],
        categories: (
          $('#path li[itemscope]:not(:first-child):not(:last-child) span[itemprop="name"]').toArray().map(
            (item) => new CreateBookCategoryDto(
              {
                name: $(item).text(),
              },
            ),
          )
        ),
      },
    );
  }
  /* eslint-enable @typescript-eslint/dot-notation */

  /**
   * Extract all comments from page
   *
   * @static
   * @param {AsyncURLParseResult} {$, url}
   * @returns
   * @memberof TaniaksiazkaBookParser
   */
  static extractReviews({$, url}: AsyncURLParseResult) {
    const remoteId = TaniaksiazkaBookParser.extractID($);

    return $('#ProductReviews .panel-content .book-comments > li').toArray().map(
      (review) => {
        const authorName = $(review).find('[itemprop="author"]').text();
        const creationTime = $(review).find('[itemprop="datePublished"]').text();
        const content = $(review).find('[itemprop="reviewBody"]').text();
        const rating = $(review).find('.review-top .review-star-active').length * 2;

        return new CreateBookReviewDto(
          {
            url,
            rating,
            remoteId: parameterize(`${remoteId}-${authorName}-${creationTime}`),
            description: normalizeParsedText(content),
            publishDate: new Date(creationTime),
            reviewer: new CreateBookReviewerDto(
              {
                name: authorName || 'Anonimowy',
              },
            ),
          },
        );
      },
    );
  }

  /**
   * Parses book info from table below page
   *
   * @static
   * @param {cheerio.Root} $
   * @returns
   * @memberof TaniaksiazkaBookParser
   */
  static extractBookProps($: cheerio.Root) {
    const $list: [string, {text: string, el: cheerio.Cheerio}][] = (
      $('#DetailsModule > ul > li')
        .toArray()
        .map((item) => {
          const $item = $(item);
          let childs = $item.contents();

          if (childs.length === 1)
            childs = $item.children().eq(0).children();

          return [
            trimBorderSpecialCharacters(childs.eq(0).text())?.toLowerCase(),
            {
              text: normalizeParsedText(childs.eq(1).text()),
              el: childs.eq(1),
            },
          ];
        })
    );

    return R.fromPairs($list);
  }

  /**
   * Extract book id
   *
   * @static
   * @param {cheerio.Root} $
   * @returns
   * @memberof TaniaksiazkaBookParser
   */
  static extractID($: cheerio.Root) {
    return this.extractProp($, 'product:retailer_part_no');
  }

  /**
   * Extract single head property
   *
   * @static
   * @param {cheerio.Root} $
   * @param {string} name
   * @returns
   * @memberof TaniaksiazkaBookParser
   */
  static extractProp($: cheerio.Root, name: string) {
    return $(`head > meta[property="${name}"]`).attr('content');
  }
}
