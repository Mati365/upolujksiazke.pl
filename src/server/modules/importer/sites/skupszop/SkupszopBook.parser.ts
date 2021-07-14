import {extractJsonLD} from '@scrapper/helpers';

import {
  normalizeISBN,
  normalizeParsedText,
  normalizePrice,
} from '@server/common/helpers';

import {Language} from '@shared/enums/language';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';

import {BookAvailabilityParser} from '@importer/kinds/scrappers/Book.scrapper';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';

export class SkupszopBookParser
  extends WebsiteScrapperParser<CreateBookDto>
  implements BookAvailabilityParser<AsyncURLParseResult> {
  /**
   * @inheritdoc
   */
  parseAvailability({$, url}: AsyncURLParseResult) {
    return Promise.resolve(
      {
        result: [
          new CreateBookAvailabilityDto(
            {
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
  async parse(bookPage: AsyncURLParseResult) {
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

    const {brand: publisher} = productSchema;
    const release = new CreateBookReleaseDto(
      {
        title: productSchema.name,
        lang: Language.PL,
        format: normalizeParsedText(detailsText.match(/Rozmiar: ([\S]+)/)?.[1]),
        defaultPrice: normalizePrice($('.market-price > span').text())?.price,
        description: normalizeParsedText(
          $('.product-container[data-id] .product-description .desc-box').html(),
        ),
        totalPages: +bookSchema.numberOfPages || null,
        publishDate: bookSchema.copyrightYear,
        availability: (await this.parseAvailability(bookPage)).result,
        isbn: normalizeISBN(productSchema.sku),
        publisher: publisher?.name && new CreateBookPublisherDto(
          {
            name: publisher.name,
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: bookSchema.image[0]?.replace('thumb_books', 'books'),
          },
        ),
      },
    );

    const authors = $('.product-author-box .authors .authors-item').toArray().map((element) => (
      new CreateBookAuthorDto(
        {
          name: $(element).text(),
        },
      )
    ));

    return new CreateBookDto(
      {
        defaultTitle: productSchema.name,
        releases: [release],
        authors,
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
    );
  }
}
