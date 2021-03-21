import {extractTableRowsMap} from '@scrapper/helpers';
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
  BookAvailabilityParser,
} from '@importer/kinds/scrappers/Book.scrapper';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {WebsiteScrapperParser} from '@scrapper/service/shared';

export class BonitoBookParser
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
              remoteId: url.match(/k-([^-]*)-/)[1],
              url,
              price: normalizePrice(
                $('[itemtype="https://schema.org/Product"] [itemprop="price"]').attr('content'),
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

    const {$} = bookPage;
    const $details = $('[itemtype="https://schema.org/Product"]');

    const basicProps = extractTableRowsMap(
      $,
      $details
        .find('[itemtype="https://schema.org/Offer"] + table > tbody > tr')
        .toArray(),
    );

    if (!basicProps['numer isbn'])
      return null;

    const title = $('h1 > span[itemprop="name"]').text();
    const release = new CreateBookReleaseDto(
      {
        title,
        lang: Language.PL,
        format: basicProps['format'],
        defaultPrice: normalizePrice(basicProps['cena rynkowa'])?.price,
        description: normalizeParsedText($details.find('[itemprop="description"]').html()),
        totalPages: +basicProps['liczba stron'] || null,
        publishDate: basicProps['rok wydania'],
        isbn: normalizeISBN(basicProps['numer isbn']),
        weight: Number.parseInt(basicProps['waga'], 10) || null,
        availability: (await this.parseAvailability(bookPage)).result,
        binding: BINDING_TRANSLATION_MAPPINGS[
          normalizeParsedText(basicProps['oprawa'])?.toLowerCase()
        ],
        publisher: new CreateBookPublisherDto(
          {
            name: basicProps['wydawnictwo'],
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: BonitoBookParser.normalizeImageURL($('a[title="Powiększ..."] img').attr('src')),
          },
        ),
      },
    );

    return new CreateBookDto(
      {
        defaultTitle: title,
        authors: $details.find('h2 a[href^="/autor/"]').toArray().map((author) => (
          new CreateBookAuthorDto(
            {
              name: $(author).text(),
            },
          )
        )),
        releases: [
          release,
        ],
        categories: (
          $details.find('[itemprop="category"] > a:not(:first-child)').toArray().map(
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
   * Picks full version of image
   *
   * @see
   *  Used in ArosBooks!
   *
   * @static
   * @param {string} url
   * @returns
   * @memberof BonitoBookMatcher
   */
  static normalizeImageURL(url: string) {
    if (!url)
      return null;

    return (
      normalizeURL(
        url
          .replace('cache/', 'zdjecia/')
          .replace('_200.', '.'),
      )
    );
  }
}
