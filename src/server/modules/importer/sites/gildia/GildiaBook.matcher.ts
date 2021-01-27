import * as R from 'ramda';

import {countLetter} from '@shared/helpers';
import {fuzzyFindBookAnchor} from '@scrapper/helpers/fuzzyFindBookAnchor';

import {
  normalizeISBN,
  normalizeParsedText,
  normalizeParsedTitle,
  normalizePrice,
  normalizeURL,
} from '@server/common/helpers';

import {Language} from '@server/constants/language';
import {BookBindingKind} from '@server/modules/book/modules/release/BookRelease.entity';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto/CreateImageAttachment.dto';

import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';

import {BookAvailabilityScrapperMatcher} from '@scrapper/service/scrappers/Book.scrapper';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';

export class GildiaBookMatcher
  extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>
  implements BookAvailabilityScrapperMatcher<AsyncURLParseResult> {
  static readonly bindingMappings = Object.freeze(
    {
      /* eslint-disable quote-props */
      'miękka ze skrzydełkami': BookBindingKind.NOTEBOOK,
      'miękka': BookBindingKind.NOTEBOOK,
      'twarda': BookBindingKind.HARDCOVER,
      /* eslint-enable quote-props */
    },
  );

  searchAvailability({$, url}: AsyncURLParseResult): Promise<CreateBookAvailabilityDto[]> {
    const $basicProductInfo = $('.basic-product-info');

    return Promise.resolve([
      new CreateBookAvailabilityDto(
        {
          url,
          showOnlyAsQuote: false,
          remoteId: $('.product-page-description [data-add-product]').data('addProduct'),
          totalRatings: null,
          avgRating: countLetter(
            '',
            $('.product-page-description .rating-stars').data('content'),
          ) * 2,

          prevPrice: normalizePrice(
            $basicProductInfo.find('.previous-price').text(),
          )?.price,

          price: normalizePrice(
            $basicProductInfo.find('.current-price').text(),
          )?.price,
        },
      ),
    ]);
  }

  /**
   * @inheritdoc
   */
  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const bookPage = await this.searchByPhrase(data);
    if (!bookPage)
      return null;

    const release = GildiaBookMatcher.extractRelease(bookPage.$);
    return {
      result: new CreateBookDto(
        {
          authors: GildiaBookMatcher.extractAuthors(bookPage.$),
          defaultTitle: release.title,
          availability: await this.searchAvailability(bookPage),
          releases: [
            release,
          ],
        },
      ),
    };
  }

  /**
   * Extracts multiple book authors from page
   *
   * @static
   * @param {cheerio.Root} $
   * @memberof GildiaBookMatcher
   */
  static extractAuthors($: cheerio.Root) {
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
   * @static
   * @param {cheerio.Root} $
   * @returns
   * @memberof GildiaBookMatcher
   */
  static extractRelease($: cheerio.Root) {
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
        title: normalizeParsedTitle($('.product-page-description .product-page-title').text()),
        description: normalizeParsedText($('.product-page-description-details > p').text()),
        isbn: normalizeISBN(basicProps['isbn-13'] ?? basicProps['isbn']),
        totalPages: +basicProps['liczba stron'] || null,
        format: normalizeParsedText(basicProps['format']),
        publishDate: normalizeParsedText(basicProps['data wydania']),
        translator: normalizeParsedText(basicProps['tłumacz']),
        binding: GildiaBookMatcher.bindingMappings[
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
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof GildiaBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      {
        q: title, // it works a bit better without author
      },
    ))?.$;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('.products-row > .product-row'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => {
          const $title = $(anchor).find('> .author-and-title');

          return {
            title: $title.find('.title .pjax').text(),
            author: $title.find('.authir .pjax').text(),
          };
        },
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).find('.title .pjax').attr('href'),
    );
  }
}
