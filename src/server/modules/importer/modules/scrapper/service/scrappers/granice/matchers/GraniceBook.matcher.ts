import stringSimilarity from 'string-similarity';
import * as R from 'ramda';

import {escapeIso88592} from '@server/common/helpers/encoding/escapeIso88592';
import {concatUrls} from '@shared/helpers/concatUrls';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {
  normalizeISBN,
  normalizeParsedText,
} from '@server/common/helpers';

import {Language} from '@server/constants/language';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';

import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';
import {ScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {MatchRecordAttrs} from '../../../shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';

export class GraniceBookMatcher extends ScrapperMatcher<CreateBookDto> {
  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const bookPage = await this.searchByPhrase(data);
    if (!bookPage)
      return null;

    const {$, url} = bookPage;
    const $content = $('.web > .sub > .column1');
    const $details = $content.find('#book_id.detailsbig');
    const [detailsText, detailsHTML] = [$details.text(), $details.html()];

    const remoteId = $details.attr('book-id');
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
            originalUrl: $details.find('[itemprop="image"]').attr('src'),
          },
        ),
        remoteDescription: new CreateRemoteRecordDto(
          {
            showOnlyAsQuote: true,
            remoteId,
            url,
          },
        ),
      },
    );

    const result = new CreateBookDto(
      {
        defaultTitle: title,
        originalTitle: normalizeParsedText(detailsHTML.match(/Tytuł oryginału: ([^\n<>]+)/)?.[1]),
        authors: [author],
        releases: [
          release,
        ],
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

    const [lowerTitle, lowerAuthor] = [
      title.toLowerCase(),
      authors[0].name.toLowerCase(),
    ];

    const item = R.head(R.sort(
      (a, b) => b[0] - a[0],
      $('[book-id]')
        .toArray()
        .map((el): [number, cheerio.Element] => {
          const itemTitle = normalizeParsedText($(el).find('.cont > .title').text())?.toLowerCase();
          const similarity = stringSimilarity.compareTwoStrings(lowerTitle, itemTitle);

          if (similarity < 0.5)
            return null;

          const authorTitle = normalizeParsedText($(el).find('.cont > .details > .author').text())?.toLowerCase();
          return [
            stringSimilarity.compareTwoStrings(lowerAuthor, authorTitle),
            el,
          ];
        })
        .filter(Boolean),
    ));

    if (!item || item[0] < 0.5)
      return null;

    return this.searchByPath(
      $(item[1])
        .find('a.title[href^="/ksiazka/"]')
        .attr('href'),
    );
  }

  /**
   * Concats urls with root page url and fetches page
   *
   * @private
   * @param {string} path
   * @returns
   * @memberof GraniceBookMatcher
   */
  private async searchByPath(path: string) {
    const {config} = this;

    return parseAsyncURLIfOK(
      concatUrls(config.homepageURL, path),
    );
  }
}
