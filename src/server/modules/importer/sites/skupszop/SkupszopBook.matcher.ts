import {normalizeISBN, normalizeParsedText, normalizePrice} from '@server/common/helpers';
import {
  fuzzyFindBookAnchor,
  extractJsonLD,
} from '@scrapper/helpers';

import {Language} from '@server/constants/language';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';

import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '@scrapper/service/shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {BookAvailabilityScrapperMatcher} from '@scrapper/service/scrappers/Book.scrapper';

export class SkupszopBookMatcher
  extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>
  implements BookAvailabilityScrapperMatcher<AsyncURLParseResult> {
  /**
   * @inheritdoc
   */
  searchAvailability({$, url}: AsyncURLParseResult) {
    return Promise.resolve(
      {
        result: [
          new CreateBookAvailabilityDto(
            {
              showOnlyAsQuote: false,
              remoteId: $('body > div.wrapper.product.microdata > div.product-container').data('id'),
              price: normalizePrice($('.condition-box-head-text > .price').text())?.price,
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
  async extractFromFetchedPage(bookPage: AsyncURLParseResult): Promise<ScrapperMatcherResult<CreateBookDto>> {
    if (!bookPage)
      return null;

    const {$} = bookPage;
    const detailsText = $('.product-details > .product-details-body > .bookDetails').text();
    const {
      schemas: {
        Product: [productSchema],
        Book: [bookSchema],
      },
    } = extractJsonLD($);

    const release = new CreateBookReleaseDto(
      {
        lang: Language.PL,
        format: normalizeParsedText(detailsText.match(/Rozmiar: ([\S]+)/)?.[1]),
        defaultPrice: normalizePrice($('.market-price > span').text())?.price,
        title: productSchema.name,
        description: productSchema.description,
        totalPages: +bookSchema.numberOfPages || null,
        publishDate: bookSchema.copyrightYear,
        isbn: normalizeISBN(productSchema.sku),
        publisher: new CreateBookPublisherDto(
          {
            name: productSchema.brand.name,
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: bookSchema.image[0]?.replace('thumb_books', 'books'),
          },
        ),
      },
    );

    return {
      result: new CreateBookDto(
        {
          defaultTitle: productSchema.name,
          availability: (await this.searchAvailability(bookPage)).result,
          authors: bookSchema.author.map((author: any) => (
            new CreateBookAuthorDto(
              {
                name: author.name,
              },
            )
          )),
          releases: [release],
          categories: (
            $('.breadcrumb-item[itemscope]:not(:first-child):not(:last-child) span[itemprop="name"]').toArray().map(
              (item) => new CreateBookCategoryDto(
                {
                  name: $(item).text(),
                },
              ),
            )
          ),
        },
      ),
    };
  }

  /**
   * @inheritdoc
   */
  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    return this.extractFromFetchedPage(
      await this.searchByPhrase(data),
    );
  }

  /**
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof SkupszopBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      {
        word: title, // it works a bit better without author
      },
    ))?.$;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('.product-content-list > .product-content-list-ul > li.product-grid-item'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => {
          const $anchor = $(anchor);

          return {
            title: $anchor.find('.product-variant-link').text(),
            author: $anchor.find('.product-list-author-box > a:first-child').text(),
          };
        },
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).find('.product-variant-link').attr('href'),
    );
  }
}
