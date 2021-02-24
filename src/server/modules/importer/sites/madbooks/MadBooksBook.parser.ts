import * as R from 'ramda';

import {
  normalizeISBN,
  normalizeParsedText,
  normalizePrice,
} from '@server/common/helpers';

import {Language} from '@server/constants/language';
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
  BookAvailabilityParser,
  matchBookTypeByTitle,
} from '@importer/kinds/scrappers/Book.scrapper';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';

export class MadBooksBookParser
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
              remoteId: $('#UserCartShowForm').data('productId'),
              price: normalizePrice($('.product-price [itemprop="price"]').attr('content'))?.price,
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
    const basicProps = MadBooksBookParser.extractBookProps($);
    const isbn = normalizeISBN(basicProps['isbn'] || basicProps['ean']);

    if (!isbn)
      return null;

    const title = normalizeParsedText($('h1 > [itemprop="name"]').text());
    const release = new CreateBookReleaseDto(
      {
        title,
        isbn,
        type: matchBookTypeByTitle(title),
        lang: LANGUAGE_TRANSLATION_MAPPINGS[basicProps['język']] ?? Language.PL,
        format: basicProps['format'],
        defaultPrice: normalizePrice(basicProps['cena katalogowa'])?.price,
        description: normalizeParsedText($('#opis [itemprop="description"]').text()),
        totalPages: +basicProps['ilość stron'] || null,
        publishDate: basicProps['rok wydania'],
        edition: basicProps['wydanie'],
        weight: Number.parseInt(basicProps['waga'], 10) || null,
        availability: (await this.parseAvailability(bookPage)).result,
        binding: BINDING_TRANSLATION_MAPPINGS[
          normalizeParsedText(basicProps['oprawa'])?.toLowerCase()
        ],
        translator: basicProps['tłumacze']?.split(',').map(normalizeParsedText).filter(Boolean),
        publisher: new CreateBookPublisherDto(
          {
            name: basicProps['wydawca'],
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: $('#ProductGallery img[itemprop="image"]').attr('src'),
          },
        ),
      },
    );

    return new CreateBookDto(
      {
        defaultTitle: title,
        originalPublishDate: basicProps['data premiery'],
        authors: (basicProps['autor'] || '').split(',').map((name) => (
          new CreateBookAuthorDto(
            {
              name: R.reverse(name.split(' ')).join(' '),
            },
          )
        )),
        releases: [release],
        categories: [
          new CreateBookCategoryDto(
            {
              name: $('ul.breadcrumb > li:nth-child(3) a').text(),
            },
          ),
        ],
      },
    );
  }
  /* eslint-enable @typescript-eslint/dot-notation */

  static extractBookProps($: cheerio.Root) {
    const rows = (
      $('#dane-techniczne table.product-specification-table > tbody > tr, .product-attributes > tbody > tr')
        .toArray()
        .filter((row) => $(row).children().length === 2)
    );

    return R.fromPairs(
      rows.map(
        (row) => {
          const $row = $(row);

          return [
            normalizeParsedText($row.children().first().text()).match(/^([^:]+)/)?.[1]?.toLowerCase(),
            normalizeParsedText($row.children().eq(1).text()),
          ];
        },
      ),
    );
  }
}
