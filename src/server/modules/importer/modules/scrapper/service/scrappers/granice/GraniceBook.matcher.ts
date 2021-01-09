import {Logger} from '@nestjs/common';
import chalk from 'chalk';
import stringSimilarity from 'string-similarity';

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
        .map((name) => new CreateBookCategoryDto(
          {
            name: name.trim(),
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
            originalUrl: $details.find('[itemprop="image"').attr('src'),
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
        originalRelease,
        releases: [
          release,
        ],
      },
    );

    console.info(result);
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
    const url = concatUrls(
      config.searchURL,
      `${encodeURIComponent(`${scrapperInfo.title} ${scrapperInfo.authors[0].name}`)}/1`,
    );

    logger.log(`Searching book by phrase from ${chalk.bold(url)}!`);

    const {$} = await parseAsyncURLIfOK(url);
    const [lowerTitle, lowerAuthor] = [
      scrapperInfo.title.toLowerCase(),
      scrapperInfo.authors[0].name.toLowerCase(),
    ];

    const item = (
      $('[book-id]')
        .toArray()
        .find((el) => {
          const itemTitle = normalizeParsedText($(el).find('.cont > .title').text())?.toLowerCase();
          const similarity = stringSimilarity.compareTwoStrings(lowerTitle, itemTitle);

          if (similarity < 0.75)
            return false;

          const authorTitle = normalizeParsedText($(el).find('.cont > .details > .author').text())?.toLowerCase();
          return stringSimilarity.compareTwoStrings(lowerAuthor, authorTitle) > 0.7;
        })
    );

    if (!item)
      return null;

    return parseAsyncURLIfOK(
      concatUrls(
        config.homepageURL,
        $(item)
          .find('a.title[href^="/ksiazka/"]')
          .attr('href'),
      ),
    );
  }
}
