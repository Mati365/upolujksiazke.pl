import * as R from 'ramda';

import {fuzzyFindBookAnchor} from '@scrapper/helpers';
import {
  normalizeISBN,
  normalizeParsedText,
  normalizePrice,
  normalizeURL,
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

export class DadadaBookMatcher
  extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>
  implements BookAvailabilityScrapperMatcher<AsyncURLParseResult> {
  /**
   * Search all remote book urls
   *
   * @param {AsyncURLParseResult} {$, url}
   * @returns {Promise<CreateBookAvailabilityDto[]>}
   * @memberof DadadaBookMatcher
   */
  searchAvailability({$, url}: AsyncURLParseResult): Promise<CreateBookAvailabilityDto[]> {
    const remoteId = $('form#FormaRate > input[name="Id"]').val();

    return Promise.resolve([
      new CreateBookAvailabilityDto(
        {
          price: normalizePrice($('.productPromo .productFinalPrice').text())?.price,
          prevPrice: normalizePrice($('.productPromo .productBasePrice').text())?.price,
          avgRating: Number.parseFloat($('[data-rateit-value]').attr('rateitValue')) || null,
          totalRatings: +$('.reviewCount[onclick]').text()?.match(/\(\d+\)/)[1] || null,
          showOnlyAsQuote: true,
          remoteId,
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
    const basicProps = DadadaBookMatcher.extractBookProps($);

    const title = normalizeParsedText($('h1.productName').text());
    const authors = $(basicProps['liczba stron'][1]).find('a').toArray().map(
      (author) => new CreateBookAuthorDto(
        {
          name: normalizeParsedText($(author).text()),
        },
      ),
    );

    const release = new CreateBookReleaseDto(
      {
        title,
        lang: Language.PL,
        description: normalizeParsedText($('.productDescriptionContent').text()),
        totalPages: +basicProps['liczba stron'][0] || null,
        format: basicProps['format'][0],
        publishDate: basicProps['rok wydania'][0],
        isbn: normalizeISBN(basicProps['isbn'][0]),
        binding: BINDING_TRANSLATION_MAPPINGS[basicProps['oprawa']?.[0]?.toLowerCase()],
        publisher: new CreateBookPublisherDto(
          {
            name: basicProps['wydawca'][0],
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: normalizeURL(
              $('.productPhoto > #imgSmall').attr('originalphotopath'),
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
          authors,
          releases: [release],
          categories: $('#breadCrumbs > .breadCrumbsItem:not(:first-child) > a .name').toArray().map(
            (name) => new CreateBookCategoryDto(
              {
                name: $(name).text(),
              },
            ),
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
   * @returns {Record<string, [string, cheerio.Cheerio]>}
   * @memberof DadadaBookMatcher
   */
  static extractBookProps($: cheerio.Root): Record<string, [string, cheerio.Cheerio]> {
    const rows = (
      $('.productDataDetails > .productDataItem')
        .toArray()
    );

    return R.fromPairs(
      rows.map(
        (row) => {
          const $row = $(row);
          const $value = $row.children().eq(0);

          return [
            normalizeParsedText($row.text()).match(/^([^:]+)/)[1]?.toLowerCase(),
            [
              normalizeParsedText($value.text()),
              $value,
            ],
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
   * @memberof DadadaBookMatcher
   */
  private async searchByPhrase({authors, title}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      {
        filter: title,
      },
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('#productList > .productContainer'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('.productContainerDataValues > a > .productContainerDataName').text(),
          author: $(anchor).find('.productContainerDataAuthor a:first-child').text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor)
        .find('.productContainerDataValues > a')
        .attr('href'),
    );
  }
}
