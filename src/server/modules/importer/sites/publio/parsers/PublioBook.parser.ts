import * as R from 'ramda';

import {concatUrls} from '@shared/helpers/concatUrls';
import {
  normalizeISBN,
  normalizeParsedText,
  normalizeURL,
} from '@server/common/helpers';

import {ID} from '@shared/types';
import {Language} from '@server/constants/language';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookKindDto} from '@server/modules/book/modules/kind/dto/CreateBookKind.dto';
import {CreateBookPrizeDto} from '@server/modules/book/modules/prize/dto/CreateBookPrize.dto';
import {CreateBookVolumeDto} from '@server/modules/book/modules/volume/dto/CreateBookVolume.dto';

import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';
import {BookType} from '@server/modules/book/modules/release/BookRelease.entity';

import {
  BookScrappedPropsMap,
  BookAvailabilityParser,
  PROTECTION_TRANSLATION_MAPPINGS,
  LANGUAGE_TRANSLATION_MAPPINGS,
  BOOK_TYPE_TRANSLATION_MAPPINGS,
} from '@scrapper/service/scrappers/Book.scrapper';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '@server/modules/importer/modules/scrapper/service/shared';
import {PublioBookPublisherMatcher} from '../matchers/PublioBookPublisher.matcher';

type PublioAPIPrice = {
  currentPrice: number,
  originalPrice: number,
};

export class PublioBookParser
  extends WebsiteScrapperParser<CreateBookDto>
  implements BookAvailabilityParser<AsyncURLParseResult, {price: PublioAPIPrice}> {
  /**
   * Reads price from API
   *
   * @private
   * @param {ID} id
   * @returns {Promise<PublioAPIPrice>}
   * @memberof PublioBookParser
   */
  private async searchPriceByID(id: ID): Promise<PublioAPIPrice> {
    const {config} = this;
    const {price} = (
      await fetch(
        concatUrls(
          config.homepageURL,
          `rest/v3/catalog/product/${id}/purchase-options`,
        ),
      )
        .then((r) => r.json())
    );

    return price;
  }

  /**
   * @inheritdoc
   */
  async parseAvailability({url}: AsyncURLParseResult) {
    const price = await this.searchPriceByID(
      PublioBookParser.extractBookIdFromURL(url),
    );

    return {
      meta: {
        price,
      },
      result: [
        new CreateBookAvailabilityDto(
          {
            showOnlyAsQuote: true,
            remoteId: PublioBookParser.extractBookIdFromURL(url),
            price: price.currentPrice,
            url,
          },
        ),
      ],
    };
  }

  /**
   * @inheritdoc
   */
  /* eslint-disable @typescript-eslint/dot-notation */
  async parse(bookPage: AsyncURLParseResult): Promise<CreateBookDto> {
    if (!bookPage)
      return null;

    const {$} = bookPage;
    const [title, volumeName] = PublioBookParser.extractTitle($);
    const basicProps = PublioBookParser.extractBookProps($);
    const [parentIsbn, ...childIsbn] = basicProps['isbn']?.[0].split(',').map(normalizeISBN);

    const {
      result: availability,
      meta: {
        price,
      },
    } = await this.parseAvailability(bookPage);

    const prizes = (
      PublioBookParser
        .extractTitlesRow($, $(basicProps['nagroda']?.[1]))
        .map((name) => new CreateBookPrizeDto(
          {
            name,
          },
        ))
    );

    const parentRelease = new CreateBookReleaseDto(
      {
        title,
        defaultPrice: price.originalPrice,
        isbn: parentIsbn,
        type: BOOK_TYPE_TRANSLATION_MAPPINGS[
          $('.basic-info-wrapper .info > .section').text()?.toLowerCase()
        ] ?? BookType.EBOOK,
        lang: (
          LANGUAGE_TRANSLATION_MAPPINGS[basicProps['język publikacji']?.[0].toLowerCase()]
            ?? Language.PL
        ),
        description: normalizeParsedText($('.product-description > .teaser-wrapper').text()),
        totalPages: +basicProps['format']?.[0]?.match(/w wersji papierowej (\d+) stron/)?.[1] || null,
        protection: PROTECTION_TRANSLATION_MAPPINGS[basicProps['zabezpieczenie']?.[0].toLowerCase()],
        translator: PublioBookParser.extractTitlesRow($, $(basicProps['tłumacz']?.[1])),
        publishDate: (
          basicProps['rok pierwszej publikacji książkowej']?.[0]
            ?? basicProps['miejsce i rok wydania']?.[0].match(/(\d{4})/)?.[1]
        ),
        publisher: await this.extractPublisher($(basicProps['wydawca']?.[1])),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: (
              normalizeURL($('meta[name="og:image"]')
                .attr('content'))
                ?.replace('card/', 'product_w450/')
            ),
          },
        ),
        childReleases: childIsbn.map(
          (isbn) => new CreateBookReleaseDto(
            {
              isbn,
            },
          ),
        ),
        availability,
      },
    );

    const authors = (
      PublioBookParser
        .extractTitlesRow($, $(basicProps['autor'][1]))
        .map((name) => new CreateBookAuthorDto(
          {
            name,
          },
        ))
    );

    return new CreateBookDto(
      {
        defaultTitle: title,
        kind: new CreateBookKindDto(
          {
            name: basicProps['rodzaj publikacji']?.[0],
          },
        ),
        tags: basicProps['tematy i słowa kluczowe']?.[1]?.find('.link-label').toArray().map(
          (item) => $(item).text().match(/([^,]+)/)[1],
        ),
        originalLang: LANGUAGE_TRANSLATION_MAPPINGS[
          basicProps['język oryginalny publikacji']?.[0].toLowerCase()
        ],
        releases: [parentRelease],
        categories: PublioBookParser.extractCategories($, basicProps),
        prizes,
        authors,
        ...volumeName && {
          volume: new CreateBookVolumeDto(
            {
              name: volumeName,
            },
          ),
        },
      },
    );
  }
  /* eslint-enable @typescript-eslint/dot-notation */

  /**
   * Extract title and volume name
   *
   * @static
   * @param {cheerio.Root} $
   * @memberof PublioBookParser
   */
  static extractTitle($: cheerio.Root) {
    const title = normalizeParsedText($('h1 > .title').text());
    if (R.contains('. Tom', title))
      return title.match(/^(.*)\.\sTom\s(\d+)$/).splice(1, 2);

    return [title, null];
  }

  /**
   * Fetches publisher name from text
   *
   * @private
   * @param {cheerio.Cheerio} $element
   * @returns
   * @memberof PublioBookParser
   */
  private async extractPublisher($element: cheerio.Cheerio) {
    const publisherMatcher = <PublioBookPublisherMatcher> this.matchers[ScrapperMetadataKind.BOOK_PUBLISHER];

    return (await publisherMatcher.searchRemoteRecord(
      {
        data: new CreateBookPublisherDto(
          {
            name: normalizeParsedText($element.text()),
          },
        ),
      },
      {
        path: $element.find('.detail-link').attr('href'),
      },
    )).result;
  }

  /**
   * Converts categories elements to dtos
   *
   * @static
   * @param {cheerio.Root} $
   * @param {BookScrappedPropsMap} props
   * @returns
   * @memberof PublioBookParser
   */
  static extractCategories($: cheerio.Root, props: BookScrappedPropsMap) {
    const names = R.uniq(
      R.unnest(
        $(props['publikacja z kategorii'][1])
          .find('a')
          .toArray()
          .map((item) => $(item).text().split(',')),
      )
        .map(
          R.pipe(R.toLower, normalizeParsedText),
        ),
    );

    return names.map((name) => new CreateBookCategoryDto(
      {
        name: normalizeParsedText(name),
      },
    ));
  }

  /**
   * Converts titles elements to dtos
   *
   * @static
   * @param {cheerio.Root} $
   * @param {cheerio.Cheerio} $element
   * @returns
   * @memberof PublioBookParser
   */
  static extractTitlesRow($: cheerio.Root, $element: cheerio.Cheerio) {
    if (!$element)
      return [];

    return (
      $element
        .find('a')
        .toArray()
        .map(
          (name) => normalizeParsedText(
            $(name).text().match(/([^,]+)/)[1],
          ),
        )
    );
  }

  /**
   * Picks book URL from url using regex
   *
   * @static
   * @param {string} url
   * @returns
   * @memberof PublioBookParser
   */
  static extractBookIdFromURL(url: string) {
    return url.match(/p(\w+).html/)[1];
  }

  /**
   * Extract info about book from table
   *
   * @static
   * @param {cheerio.Root} $
   * @returns {BookScrappedPropsMap}
   * @memberof PublioBookParser
   */
  static extractBookProps($: cheerio.Root): BookScrappedPropsMap {
    const rows = $('.details-element');

    return R.fromPairs(
      rows.toArray().map(
        (row) => {
          const $childs = $(row).children();

          return [
            normalizeParsedText($childs.eq(0).text()?.toLowerCase()),
            [
              normalizeParsedText($childs.eq(1).text()?.toLowerCase()),
              $childs.eq(1),
            ],
          ];
        },
      ),
    );
  }
}
