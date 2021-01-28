import {escapeIso88592} from '@server/common/helpers/encoding/escapeIso88592';
import {fuzzyFindBookAnchor} from '@scrapper/helpers';
import {
  normalizeISBN,
  normalizeParsedText,
  normalizePrice,
} from '@server/common/helpers';

import {Language} from '@server/constants/language';
import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';

import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';
import {
  BINDING_TRANSLATION_MAPPINGS,
  BookAvailabilityScrapperMatcher,
} from '@scrapper/service/scrappers/Book.scrapper';

import {BonitoBookMatcher} from '../bonito/BonitoBook.matcher';

export class ArosBookMatcher
  extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>
  implements BookAvailabilityScrapperMatcher<AsyncURLParseResult> {
  /**
   * Search all remote book urls
   *
   * @param {AsyncURLParseResult} {$, url}
   * @returns {Promise<CreateBookAvailabilityDto[]>}
   * @memberof ArosBookMatcher
   */
  searchAvailability({$, url}: AsyncURLParseResult): Promise<CreateBookAvailabilityDto[]> {
    return Promise.resolve([
      new CreateBookAvailabilityDto(
        {
          remoteId: $('input[type="hidden"][name="dodaj"]').attr('value'),
          price: normalizePrice($('[itemprop="offerDetails"] [itemprop="price"]').attr('content'))?.price,
          avgRating: (Number.parseFloat($('[itemprop="ratingValue"]').text()) / 6) * 10 || null,
          totalRatings: Number.parseInt($('[itemprop="ratingCount"]').text(), 10) || null,
          showOnlyAsQuote: false,
          url,
        },
      ),
    ]);
  }

  /**
   * @inheritdoc
   */
  /* eslint-disable @typescript-eslint/dot-notation */
  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const bookPage = await this.searchByPhrase(data);
    if (!bookPage)
      return null;

    const {$} = bookPage;
    const basicProps = BonitoBookMatcher.extractBookProps($);

    const title = $('h1').text();
    const authors = basicProps['autor'].split(',').map(
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
        description: normalizeParsedText($('[itemprop="description"]').text()),
        totalPages: +basicProps['liczba stron'] || null,
        format: basicProps['format'],
        publishDate: basicProps['data premiery'],
        isbn: normalizeISBN(basicProps['numer isbn']),
        binding: BINDING_TRANSLATION_MAPPINGS[basicProps['oprawa']?.toLowerCase()],
        publisher: new CreateBookPublisherDto(
          {
            name: basicProps['wydawnictwo'],
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: BonitoBookMatcher.normalizeImageURL($('a[title="Powiększ"] img').attr('src')),
          },
        ),
      },
    );

    return {
      result: new CreateBookDto(
        {
          defaultTitle: title,
          availability: await this.searchAvailability(bookPage),
          authors,
          releases: [release],
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
      ),
    };
  }
  /* eslint-enable @typescript-eslint/dot-notation */

  /**
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof ArosBookMatcher
   */
  private async searchByPhrase({authors, title}: CreateBookDto) {
    const $ = (await this.fetchPageByPath(
      `szukaj/${escapeIso88592(title)}/0?sortuj_wedlug=0&wyczysc_filtry=1`,
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('body > div > div.grid_right > table table[bgcolor="white"] td[width="100%"]'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('a[href*="/ksiazka/"]').text(),
          author: $(anchor).find('a[href*="/autor/"]').text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor)
        .find('a[href*="/ksiazka/"]')
        .attr('href'),
    );
  }
}
