import * as R from 'ramda';

import {concatUrls} from '@shared/helpers/concatUrls';
import {fuzzyFindBookAnchor} from '@scrapper/helpers/fuzzyFindBookAnchor';
import {
  normalizeISBN,
  normalizeParsedText,
  normalizeURL,
} from '@server/common/helpers';

import {ID} from '@shared/types';
import {Language} from '@server/constants/language';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookKindDto} from '@server/modules/book/modules/kind/dto/CreateBookKind.dto';
import {CreateBookPrizeDto} from '@server/modules/book/modules/prize/dto/CreateBookPrize.dto';

import {
  BookScrappedPropsMap,
  BookAvailabilityScrapperMatcher,
  PROTECTION_TRANSLATION_MAPPINGS,
  LANGUAGE_TRANSLATION_MAPPINGS,
} from '@scrapper/service/scrappers/Book.scrapper';

import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity/ScrapperMetadata.entity';
import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {BookType} from '@server/modules/book/modules/release/BookRelease.entity';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';
import {PublioBookPublisherMatcher} from './PublioBookPublisher.matcher';

type PublioAPIPrice = {
  currentPrice: number,
  originalPrice: number,
};

/**
 * @todo
 *  - Search for paper version if only ebook matched (and vice versa)
 *  - Handle multiple ISBN in single release
 *
 * @export
 * @class PublioBookMatcher
 * @extends {WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>}
 * @implements {BookAvailabilityScrapperMatcher<AsyncURLParseResult>}
 */
export class PublioBookMatcher
  extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>
  implements BookAvailabilityScrapperMatcher<AsyncURLParseResult, {price: PublioAPIPrice}> {
  /**
   * @inheritdoc
   */
  async searchAvailability({url}: AsyncURLParseResult) {
    const price = await this.searchPriceByID(
      PublioBookMatcher.extractBookIdFromURL(url),
    );

    return {
      meta: {
        price,
      },
      result: [
        new CreateBookAvailabilityDto(
          {
            showOnlyAsQuote: true,
            remoteId: PublioBookMatcher.extractBookIdFromURL(url),
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
  async extractFromFetchedPage(bookPage: AsyncURLParseResult): Promise<ScrapperMatcherResult<CreateBookDto>> {
    if (!bookPage)
      return null;

    const {$} = bookPage;
    const title = normalizeParsedText($('h1 > .title').text());
    const basicProps = PublioBookMatcher.extractBookProps($);
    const [parentIsbn, ...childIsbn] = basicProps['isbn']?.[0].split(',').map(normalizeISBN);

    const {
      result: availability,
      meta: {
        price,
      },
    } = await this.searchAvailability(bookPage);

    const prizes = (
      PublioBookMatcher
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
        type: BookType.EBOOK,
        isbn: parentIsbn,
        lang: (
          LANGUAGE_TRANSLATION_MAPPINGS[basicProps['język publikacji']?.[0].toLowerCase()]
            ?? Language.PL
        ),
        description: normalizeParsedText($('.product-description > .teaser-wrapper').text()),
        totalPages: +basicProps['format']?.[0]?.match(/w wersji papierowej (\d+) stron/)?.[1] || null,
        protection: PROTECTION_TRANSLATION_MAPPINGS[basicProps['zabezpieczenie']?.[0].toLowerCase()],
        translator: PublioBookMatcher.extractTitlesRow($, $(basicProps['tłumacz']?.[1])),
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
      },
    );

    const authors = (
      PublioBookMatcher
        .extractTitlesRow($, $(basicProps['autor'][1]))
        .map((name) => new CreateBookAuthorDto(
          {
            name,
          },
        ))
    );

    return {
      result: new CreateBookDto(
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
          categories: PublioBookMatcher.extractCategories($, basicProps),
          prizes,
          authors,
          availability,
        },
      ),
    };
  }
  /* eslint-enable @typescript-eslint/dot-notation */

  /**
   * @inheritdoc
   */
  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    return this.extractFromFetchedPage(
      await this.searchByPhrase(data),
    );
  }

  /**
   * Fetches publisher name from text
   *
   * @private
   * @param {cheerio.Cheerio} $element
   * @returns
   * @memberof PublioBookMatcher
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
   * Reads price from API
   *
   * @private
   * @param {ID} id
   * @returns {Promise<PublioAPIPrice>}
   * @memberof PublioBookMatcher
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
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof PublioBookMatcher
   */
  private async searchByPhrase({authors, title}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      {
        q: title,
      },
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('.product-tail .product-description'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('.title').eq(0).text(),
          author: $(anchor).find('.authors > a:first-child').eq(0).text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor)
        .find('.product-description > a')
        .attr('href'),
    );
  }

  /**
   * Converts categories elements to dtos
   *
   * @static
   * @param {cheerio.Root} $
   * @param {BookScrappedPropsMap} props
   * @returns
   * @memberof PublioBookMatcher
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
   * @memberof PublioBookMatcher
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
   * @memberof PublioBookMatcher
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
   * @memberof PublioBookMatcher
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
