import {Logger} from '@nestjs/common';
import chalk from 'chalk';
import stringSimilarity from 'string-similarity';
import * as R from 'ramda';

import {underscoreParameterize} from '@shared/helpers/parameterize';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';
import {
  normalizeISBN,
  normalizeParsedText,
} from '@server/common/helpers';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';

import {ScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';
import {ScrapperMetadataKind} from '../../../../entity';
import {LiteraturaGildiaBookAuthorMatcher} from './LiteraturaGildiaBookAuthor.matcher';
import {LiteraturaGildiaBookPublisherMatcher} from './LiteraturaGildiaBookPublisher.matcher';

export class LiteraturaGildiaBookMatcher extends ScrapperMatcher<CreateBookDto> {
  private readonly logger = new Logger(LiteraturaGildiaBookMatcher.name);

  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async matchRecord(scrapperInfo: CreateBookDto): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const bookPage = (
      (await this.directSearch(scrapperInfo))
        || (await this.searchByFirstLetter(scrapperInfo))
    );

    if (!bookPage)
      return null;

    const {$} = bookPage;
    const $wideText = $('#yui-main .content .widetext');

    const [
      publisher,
      author,
    ] = await Promise.all(
      [
        this.extractPublisher($wideText),
        this.extractAuthor($wideText),
      ],
    );

    const text = $wideText.text();
    const result = new CreateBookDto(
      {
        title: $('h1').text().trim(),
        description: $wideText.find('p[align="justify"]').text().trim(),
        authors: [
          author,
        ],
        releases: [
          new CreateBookReleaseDto(
            {
              isbn: normalizeISBN(text.match(/ISBN: ([\w-]+)/)?.[1]),
              totalPages: (+text.match(/Liczba stron: (\d+)/)?.[1]) || 0,
              publisher,
            },
          ),
        ],
      },
    );

    return {
      result,
    };
  }

  /**
   * Extracts single author
   *
   * @private
   * @param {cheerio.Cheerio} $parent
   * @returns
   * @memberof LiteraturaGildiaBookMatcher
   */
  private async extractAuthor($parent: cheerio.Cheerio) {
    const authorMatcher = <LiteraturaGildiaBookAuthorMatcher> this.matchers[ScrapperMetadataKind.BOOK_AUTHOR];
    const $authorAnchor = $parent.find('> a[href^="/tworcy/"]');

    return (await authorMatcher.matchRecord(
      new CreateBookAuthorDto(
        {
          name: normalizeParsedText($authorAnchor.text()),
        },
      ),
      {
        path: $authorAnchor.attr('href'),
      },
    )).result;
  }

  /**
   * Fetches publisher name from text
   *
   * @private
   * @param {cheerio.Cheerio} $parent
   * @returns
   * @memberof LiteraturaGildiaBookMatcher
   */
  private async extractPublisher($parent: cheerio.Cheerio) {
    const publisherMatcher = <LiteraturaGildiaBookPublisherMatcher> this.matchers[ScrapperMetadataKind.BOOK_PUBLISHER];
    const $publisherAnchor = $parent.find('a[href^="/wydawnictwa/"]');

    return (await publisherMatcher.matchRecord(
      new CreateBookPublisherDto(
        {
          name: normalizeParsedText($publisherAnchor.text()),
        },
      ),
      {
        path: $publisherAnchor.attr('href'),
      },
    )).result;
  }

  /**
   * Skips search phrase and try to build that links directly to book
   *
   * @private
   * @param {CreateBookDto} {authors, title}
   * @returns
   * @memberof LiteraturaGildiaBookMatcher
   */
  private async directSearch({authors, title}: CreateBookDto) {
    const {config, logger} = this;
    const url = concatUrls(
      config.homepageURL,
      `tworcy/${underscoreParameterize(authors[0].name)}/${underscoreParameterize(title)}`,
    );

    logger.log(`Direct fetching book from ${chalk.bold(url)}!`);
    return parseAsyncURLIfOK(url);
  }

  /**
   * Tries to find book using internal website search engine
   *
   * @private
   * @param {CreateBookDto} {title}
   * @memberof LiteraturaGildiaBookMatcher
   */
  private async searchByFirstLetter({title}: CreateBookDto) {
    const {config, logger} = this;
    const url = concatUrls(
      config.homepageURL,
      `ksiazki,${LiteraturaGildiaBookMatcher.getFilterFirstLetter(title)}`,
    );

    logger.log(`Searching book by first letter from ${chalk.bold(url)}!`);

    const {$} = await parseAsyncURLIfOK(url);
    const lowerTitle = R.toLower(title);
    const bestMatch = R.head(R.sort(
      (a, b) => b[0] - a[0],
      $('#yui-main .content ul.long-list > li > a')
        .toArray()
        .map(
          (element): [number, string] => {
            const $element = $(element);
            const similarity = stringSimilarity.compareTwoStrings(
              lowerTitle,
              R.toLower($element.text().trim()),
            );

            if (!similarity)
              return null;

            return [
              similarity,
              $element.attr('href'),
            ];
          },
        )
        .filter(Boolean),
    ));

    if (bestMatch?.[0] > 0.8) {
      return parseAsyncURLIfOK(
        concatUrls(
          config.homepageURL,
          bestMatch[1],
        ),
      );
    }

    return null;
  }

  /**
   * Generates link for letter based search
   *
   * @see {@link https://www.literatura.gildia.pl/ksiazki,L1}
   *
   * @static
   * @param {string} title
   * @returns
   * @memberof LiteraturaGildiaBookMatcher
   */
  public static getFilterFirstLetter(title: string) {
    const letter = R.toUpper(title[0]);
    switch (letter) {
      case 'N': case 'E': case 'A': case 'C': case 'L': case 'O': case 'S': case 'Z':
        return `${letter}0`;

      case 'Ń': case 'Ę': case 'Ą': case 'Ć': case 'Ł': case 'Ó': case 'Ś': case 'Ż':
        return `${letter}1`;

      case 'Ź':
        return `${letter}2`;

      default:
        return Number.isNaN(+letter) ? letter : '0';
    }
  }
}
