import {Logger} from '@nestjs/common';
import chalk from 'chalk';
import stringSimilarity from 'string-similarity';
import * as R from 'ramda';

import {concatUrls} from '@shared/helpers/concatUrls';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {
  normalizeISBN,
  normalizeParsedText,
} from '@server/common/helpers';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateAttachmentDto} from '@server/modules/attachment/dto';

import {ScrapperMatcher, ScrapperMatcherResult} from '../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../BookShopScrappersGroup';

export class GraniceBookMatcher extends ScrapperMatcher<CreateBookDto> {
  private readonly logger = new Logger(GraniceBookMatcher.name);

  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async matchRecord(scrapperInfo: CreateBookDto): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const bookPage = await this.searchByPhrase(scrapperInfo);
    if (!bookPage)
      return null;

    const {$} = bookPage;
    const $content = $('.web > .sub > .column1');
    const $details = $content.find('#book_id.detailsbig');
    const [detailsText, detailsHTML] = [$details.text(), $details.html()];

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

    const originalRelease = new CreateBookReleaseDto(
      {
        title: normalizeParsedText(detailsHTML.match(/Tytuł oryginału: ([^\n<>]+)/)?.[1]),
      },
    );

    const release = new CreateBookReleaseDto(
      {
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
        cover: new CreateAttachmentDto(
          {
            originalUrl: $details.find('[itemprop="image"]').attr('src'),
          },
        ),
      },
    );

    const result = new CreateBookDto(
      {
        title: normalizeParsedText($content.find('h1 > [itemprop="name"]').text()),
        description: normalizeParsedText($content.find('> .desc > p:not(:empty):not(.tags)').text()),
        categories,
        authors: [author],
        originalRelease: (
          originalRelease.title
            ? originalRelease
            : null
        ),
        releases: [
          release,
        ],
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
  private async searchByPhrase(scrapperInfo: CreateBookDto) {
    const {config, logger} = this;
    const searchParams = {
      search: `${scrapperInfo.title} ${scrapperInfo.authors[0].name}`,
    };

    const url = concatUrls(
      config.searchURL,
      `?${new URLSearchParams(searchParams).toString()}`,
    );

    logger.log(`Searching book by phrase from ${chalk.bold(url)}!`);

    const {$} = await parseAsyncURLIfOK(url);
    const [lowerTitle, lowerAuthor] = [
      scrapperInfo.title.toLowerCase(),
      scrapperInfo.authors[0].name.toLowerCase(),
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
    const {config, logger} = this;
    const url = concatUrls(config.homepageURL, path);

    logger.log(`Direct search book ${chalk.bold(url)}!`);

    return parseAsyncURLIfOK(url);
  }
}
