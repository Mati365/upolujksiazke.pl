import * as R from 'ramda';

import {normalizeISBN, normalizeParsedText, normalizePrice, normalizeURL} from '@server/common/helpers';
import {fuzzyFindBookAnchor} from '@scrapper/helpers';

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
import {BookBindingKind} from '@server/modules/book/modules/release/BookRelease.entity';

/**
 * @todo
 *  Add book reviews to content discovery
 *
 * @export
 * @class BonitoBookMatcher
 * @extends {WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>}
 * @implements {BookAvailabilityScrapperMatcher<AsyncURLParseResult>}
 */
export class BonitoBookMatcher
  extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>
  implements BookAvailabilityScrapperMatcher<AsyncURLParseResult> {
  static readonly bindingMappings = Object.freeze(
    {
      /* eslint-disable quote-props */
      'miękka': BookBindingKind.NOTEBOOK,
      'twarda': BookBindingKind.HARDCOVER,
      /* eslint-enable quote-props */
    },
  );

  searchAvailability({$, url}: AsyncURLParseResult): Promise<CreateBookAvailabilityDto[]> {
    return Promise.resolve(
      [
        new CreateBookAvailabilityDto(
          {
            showOnlyAsQuote: false,
            remoteId: url.match(/k-([^-]*)-/)[1],
            price: normalizePrice($('[itemprop="offerDetails"] [itemprop="price"]').attr('content'))?.price,
            url,
          },
        ),
      ],
    );
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
    const title = $('h1 > span[itemprop="name"]').text();

    const release = new CreateBookReleaseDto(
      {
        title,
        lang: Language.PL,
        format: basicProps['format'],
        defaultPrice: normalizePrice(basicProps['cena rynkowa'])?.price,
        description: normalizeParsedText($('span[itemprop="productDetails"] [itemprop="description"]').text()),
        totalPages: +basicProps['liczba stron'] || null,
        publishDate: basicProps['rok wydania'],
        isbn: normalizeISBN(basicProps['numer isbn']),
        weight: Number.parseInt(basicProps['waga'], 10),
        binding: BonitoBookMatcher.bindingMappings[
          normalizeParsedText(basicProps['oprawa'])?.toLowerCase()
        ],
        publisher: new CreateBookPublisherDto(
          {
            name: basicProps['wydawnictwo'],
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: normalizeURL(
              $('a[title="Powiększ..."] img')
                .attr('src')
                ?.replace('cache/', 'zdjecia/')
                .replace('_200.', '.'),
            ),
          },
        ),
      },
    );

    return {
      result: new CreateBookDto(
        {
          defaultTitle: title,
          availability: await this.searchAvailability(bookPage),
          authors: $('span[itemprop="productDetails"] h2 a[href^="/autor/"]').toArray().map((author) => (
            new CreateBookAuthorDto(
              {
                name: $(author).text(),
              },
            )
          )),
          releases: [release],
          categories: (
            $('[itemprop="productDetails"] [itemprop="category"] > a:not(:first-child)').toArray().map(
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
  /* eslint-enable @typescript-eslint/dot-notation */

  /**
   * Extract info about book from table
   *
   * @static
   * @param {cheerio.Root} $
   * @returns
   * @memberof BonitoBookMatcher
   */
  static extractBookProps($: cheerio.Root) {
    const rows = (
      $('span[itemprop="productDetails"] span[itemprop="offerDetails"] > table > tbody > tr')
        .toArray()
        .filter((row) => $(row).children().length === 2)
    );

    return R.fromPairs(
      rows.map(
        (row) => {
          const $row = $(row);

          return [
            normalizeParsedText($row.children().first().text()).match(/^([^:]+)/)[1]?.toLowerCase(),
            normalizeParsedText($row.children().eq(1).text()),
          ];
        },
      ),
    );
  }

  /**
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof BonitoBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const $ = (await this.fetchPageByPath(`szukaj/${encodeURIComponent(title)}/0,0,1/0`))?.$;
    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('table[style="background-color: #FFFFFF; border-width: 0px; width: 100%; height: 50px;"]'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => {
          const $anchor = $(anchor);

          return {
            title: $anchor.find('a[href^="/k-"]').text(),
            author: $anchor.find('a[href^="/autor/"]').text(),
          };
        },
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).find('a[href^="/k-"]').attr('href'),
    );
  }
}
