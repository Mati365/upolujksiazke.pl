import {escapeIso88592} from '@server/common/helpers/encoding/escapeIso88592';
import {concatUrls} from '@shared/helpers/concatUrls';
import {AsyncURLParseResult, parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
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

import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '../../../shared/ScrapperMatcher';
import {MatchRecordAttrs} from '../../../shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';
import {BookAvailabilityScrapperMatcher} from '../../Book.scrapper';

export class GraniceBookMatcher
  extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>
  implements BookAvailabilityScrapperMatcher<AsyncURLParseResult> {
  /**
   * Search all remote book urls
   *
   * @param {AsyncURLParseResult} {$, url}
   * @returns {Promise<CreateBookAvailabilityDto[]>}
   * @memberof GraniceBookMatcher
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
    const $content = $('.web > .sub > .column1');
    const $details = $content.find('#book_id.detailsbig');
    const [detailsText, detailsHTML] = [$details.text(), $details.html()];

    const title = normalizeParsedText($content.find('h1 > [itemprop="name"]').text());

    const categories = (
      (normalizeParsedText(detailsText.match(/Kategoria: ([\S]+)/)?.[1]) || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((name) => new CreateBookCategoryDto(
          {
            name,
          },
        ))
    );

    const author = new CreateBookAuthorDto(
      {
        name: normalizeParsedText($details.find('[itemprop="author"]').text()),
      },
    );

    const release = new CreateBookReleaseDto(
      {
        title,
        lang: Language.PL,
        description: normalizeParsedText($content.find('> .desc > p:not(:empty):not(.tags)').text()),
        totalPages: +$details.find('span[itemprop="numberOfPages"]').text() || null,
        publishDate: normalizeParsedText(detailsText.match(/Data wydania: ([\S]+)/)?.[1]),
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

    const result = new CreateBookDto(
      {
        defaultTitle: title,
        originalTitle: normalizeParsedText(detailsHTML.match(/Tytuł oryginału: ([^\n<>]+)/)?.[1]),
        availability: await this.searchAvailability(bookPage),
        authors: [author],
        releases: [release],
        categories,
      },
    );

    return {
      result,
    };
  }

  /**
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof GraniceBookMatcher
   */
  private async searchByPhrase({authors, title}: CreateBookDto) {
    const {config} = this;
    const $ = (
      await parseAsyncURLIfOK(
        concatUrls(
          config.searchURL,
          `?search=${escapeIso88592(`${title} ${authors[0].name}`)}`,
        ),
      )
    )?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('[book-id]'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).find('.cont > .title').text(),
          author: $(anchor).find('.cont > .details > .author').text(),
        }),
      },
    );

    return matchedAnchor && this.searchByPath(
      $(matchedAnchor)
        .find('a.title[href^="/ksiazka/"]')
        .attr('href'),
    );
  }
}
