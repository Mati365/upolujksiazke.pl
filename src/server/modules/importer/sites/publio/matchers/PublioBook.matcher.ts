import * as R from 'ramda';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {fuzzyFindBookAnchor} from '@scrapper/helpers/fuzzyFindBookAnchor';
import {
  normalizeISBN,
  normalizeParsedText,
  normalizeURL,
} from '@server/common/helpers';

import {Language} from '@server/constants/language';

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
import {BookAvailabilityScrapperMatcher} from '@scrapper/service/scrappers/Book.scrapper';

/**
 * @todo
 *  - Search for paper version if only ebook matched (and vice versa)
 *  - Handle multiple ISBN in single release
 *
 * @export
 * @class PublioBookMatcher
 * @extends {WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>}
 * @implements {BookAvailabilityScrapperMatcher<AsyncURLParseResult>}
 */
export class PublioBookMatcher
  extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>
  implements BookAvailabilityScrapperMatcher<AsyncURLParseResult> {
  /**
   * Search all remote book urls
   *
   * @param {AsyncURLParseResult} {$, url}
   * @returns {Promise<CreateBookAvailabilityDto[]>}
   * @memberof PublioBookMatcher
   */
  searchAvailability({$, url}: AsyncURLParseResult): Promise<CreateBookAvailabilityDto[]> {
    const remoteId = $('#book_id.detailsbig').attr('book-id');

    return Promise.resolve([
      new CreateBookAvailabilityDto(
        {
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
  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const bookPage = await this.searchByPhrase(data);
    if (!bookPage)
      return null;

    const {$} = bookPage;
    const title = normalizeParsedText($('h1 > .title').text());
    const basicProps = PublioBookMatcher.extractBookProps($);
    const $details: any = {};

    console.info(basicProps);
    const categories = (
      $(basicProps['publikacja z kategorii'][1])
        .find('a')
        .toArray()
        .map((item) => new CreateBookCategoryDto(
          {
            name: normalizeParsedText($(item).text()),
          },
        ))
    );

    const authors = $details.find('[itemprop="author"]').text().split(',').map(
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
        description: normalizeParsedText($('.product-description > .teaser-wrapper').text()),
        totalPages: +$details.find('span[itemprop="numberOfPages"]').text() || null,
        publishDate: null,
        isbn: normalizeISBN(
          $details.find('isbn[itemprop="isbn"]').text(),
        ),
        publisher: new CreateBookPublisherDto(
          {
            name: normalizeParsedText($details.find('[itemprop="publisher"] > a').text()),
          },
        ),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: normalizeURL(
              $details.find('[itemprop="image"]').attr('src'),
            ),
          },
        ),
      },
    );

    return {
      result: new CreateBookDto(
        {
          defaultTitle: title,
          originalTitle: null,
          availability: await this.searchAvailability(bookPage),
          authors,
          releases: [release],
          categories,
        },
      ),
    };
  }

  /**
   * Extract info about book from table
   *
   * @static
   * @param {cheerio.Root} $
   * @returns
   * @memberof PublioBookMatcher
   */
  static extractBookProps($: cheerio.Root) {
    const rows = $('.details-element');

    return R.fromPairs(
      rows.toArray().map(
        (row) => {
          const $childs = $(row).children();

          return [
            normalizeParsedText($childs.eq(0).text()?.toLowerCase()),
            [
              normalizeParsedText($childs.eq(1).text()?.toLowerCase()),
              $childs.eq(1),
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
   * @memberof PublioBookMatcher
   */
  private async searchByPhrase({authors, title}: CreateBookDto) {
    const $ = (await this.fetchPageBySearch(
      {
        q: title,
      },
    ))?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('.product-tail .product-description'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('.title').eq(0).text(),
          author: $(anchor).find('.authors > a:first-child').eq(0).text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor)
        .find('.product-description > a')
        .attr('href'),
    );
  }
}
