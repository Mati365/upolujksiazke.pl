import {
  extractTableRowsMap,
  extractJsonLD,
} from '@scrapper/helpers';

import {concatWithAnchor} from '@spider/helpers/concatWithAnchor';
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
  LANGUAGE_TRANSLATION_MAPPINGS,
  BOOK_TYPE_TRANSLATION_MAPPINGS,
  BookAvailabilityParser,
} from '@importer/kinds/scrappers/Book.scrapper';

import {BookType} from '@server/modules/book/modules/release/BookRelease.entity';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';

export class GandalfBookParser
  extends WebsiteScrapperParser<CreateBookDto>
  implements BookAvailabilityParser<AsyncURLParseResult> {
  /**
   * @inheritdoc
   */
  parseAvailability({$, url}: AsyncURLParseResult) {
    const $reviewsCard = $('#reviews-card');
    const $avgRating = $($reviewsCard.find('.average-rating'));

    return Promise.resolve(
      {
        result: [
          new CreateBookAvailabilityDto(
            {
              totalRatings: +$avgRating.find('.rating-counted').text().match(/(\d+) ocen/)?.[1] || null,
              avgRating: Number.parseFloat($avgRating.find('.rating-label').text().split('/')[0]) * 2.0,
              remoteId: $reviewsCard.find('.form.form-rating').data('prodid'),
              price: normalizePrice($('#right-sidebar .current-price').text())?.price,
              prevPrice: normalizePrice($('#right-sidebar .old-price').text())?.price,
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

    const {$, url} = bookPage;
    const {
      schemas: {
        Book: [bookSchema],
      },
    } = extractJsonLD($);

    const isbn = normalizeISBN(bookSchema['isbn']);
    if (!isbn)
      return null;

    const title = normalizeParsedText(bookSchema['name']).split(' - ')[0].match(/([^()]+)/)?.[1];
    if (!title)
      return null;

    const basicProps = extractTableRowsMap($, '#product-details > ul li, .product-more-info > ul.table');
    const $leftContent = $('#left-content');
    const type = BOOK_TYPE_TRANSLATION_MAPPINGS[
      $leftContent
        .find('.product-info-internal > p.category')
        .text()
        ?.toLowerCase()
    ] ?? BookType.EBOOK;

    const release = new CreateBookReleaseDto(
      {
        title,
        isbn,
        type,
        lang: LANGUAGE_TRANSLATION_MAPPINGS[bookSchema['inLanguage']],
        format: basicProps['wymiary'],
        description: normalizeParsedText(bookSchema['description']),
        totalPages: +bookSchema['numberOfPages'] || null,
        publishDate: basicProps['rok publikacji'],
        edition: basicProps['wydanie'],
        weight: Number.parseInt(basicProps['waga'], 10) || null,
        availability: (await this.parseAvailability(bookPage)).result,
        binding: BINDING_TRANSLATION_MAPPINGS[
          normalizeParsedText(basicProps['okładka'] || basicProps['oprawa'])?.toLowerCase()
        ],
        translator: basicProps['tłumacze']?.split(',').map(normalizeParsedText).filter(Boolean),
        publisher: new CreateBookPublisherDto(
          {
            name: bookSchema['publisher']['name'],
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: concatWithAnchor(
              url,
              $('.gallery-top a[href="#popup-product-gallery"] .product-image-box').data('src'),
            ),
          },
        ),
      },
    );

    return new CreateBookDto(
      {
        defaultTitle: title,
        releases: [release],
        authors: bookSchema['author'].map(({name}: {name: string}) => (
          new CreateBookAuthorDto(
            {
              name,
            },
          )
        )),
        categories: (basicProps['kategoria'] || '').split(',').map(
          (name) => new CreateBookCategoryDto(
            {
              name: normalizeParsedText(name),
            },
          ),
        ),
      },
    );
  }
  /* eslint-enable @typescript-eslint/dot-notation */
}
