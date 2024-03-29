import {extractTableRowsMap} from '@scrapper/helpers';
import {
  normalizeISBN,
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
import {WebsiteScrapperParser} from '../../modules/scrapper/service/shared';
import {BonitoBookParser} from '../bonito/BonitoBook.parser';

export class ArosBookParser
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
              remoteId: $('input[type="hidden"][name="dodaj"]').attr('value'),
              avgRating: (Number.parseFloat($('[itemprop="ratingValue"]').text()) / 6) * 10 || null,
              totalRatings: Number.parseInt($('[itemprop="ratingCount"]').text(), 10) || null,
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
        .find('[itemtype="https://schema.org/Offer"] > table > tbody > tr meta[itemprop="url"] + table tbody tr')
        .toArray(),
    );

    if (!basicProps['numer isbn'])
      return null;

    const title = $('h1').text();
    const authors = basicProps['autor']?.split(',').map(
      (name) => new CreateBookAuthorDto(
        {
          name: normalizeParsedText(name),
        },
      ),
    );

    const release = new CreateBookReleaseDto(
      {
        title,
        lang: Language.PL,
        description: normalizeParsedText($('[itemprop="description"]').html()),
        totalPages: +basicProps['liczba stron'] || null,
        format: basicProps['format'],
        publishDate: basicProps['data premiery'],
        isbn: normalizeISBN(basicProps['numer isbn']),
        binding: BINDING_TRANSLATION_MAPPINGS[basicProps['oprawa']?.toLowerCase()],
        availability: (await this.parseAvailability(bookPage)).result,
        publisher: new CreateBookPublisherDto(
          {
            name: basicProps['wydawnictwo'],
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: BonitoBookParser.normalizeImageURL($('a[title="Powiększ"] img').attr('src')),
          },
        ),
      },
    );

    return new CreateBookDto(
      {
        authors,
        defaultTitle: title,
        releases: [
          release,
        ],
        categories: (
          $('td[style="height: 26px; padding-left: 7px;"] a:not(:first-child):not(:last-child):gt(0)')
            .toArray()
            .map(
              (name) => new CreateBookCategoryDto(
                {
                  name: $(name).text(),
                },
              ),
            )
        ),
      },
    );
  }
  /* eslint-enable @typescript-eslint/dot-notation */
}
