import {Logger} from '@nestjs/common';
import chalk from 'chalk';
import stringSimilarity from 'string-similarity';
import * as R from 'ramda';

import {escapeDiacritics} from '@shared/helpers/escapeDiacritics';
import {underscoreParameterize} from '@shared/helpers/parameterize';

import {AsyncURLParseResult, parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {concatUrls} from '@shared/helpers/concatUrls';
import {
  normalizeISBN,
  normalizeParsedText,
} from '@server/common/helpers';

import {Language} from '@server/constants/language';
import {BookBindingKind} from '@server/modules/book/modules/release/BookRelease.entity';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';

import {ScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {MatchRecordAttrs} from '../../../shared/WebsiteScrappersGroup';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';
import {ScrapperMetadataKind} from '../../../../entity';
import {LiteraturaGildiaBookAuthorMatcher} from './LiteraturaGildiaBookAuthor.matcher';
import {LiteraturaGildiaBookPublisherMatcher} from './LiteraturaGildiaBookPublisher.matcher';

export class LiteraturaGildiaBookMatcher extends ScrapperMatcher<CreateBookDto> {
  private readonly logger = new Logger(LiteraturaGildiaBookMatcher.name);

  static readonly bindingMappings = Object.freeze({
    /* eslint-disable quote-props */
    'miękka': BookBindingKind.NOTEBOOK,
    'twarda': BookBindingKind.HARDCOVER,
    /* eslint-enable quote-props */
  });

  constructor(
    private readonly config: BookShopScrappersGroupConfig,
  ) {
    super();
  }

  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const bookPage = (
      (await this.directSearch(data))
        || (await this.searchByFirstLetter(data))
    );

    if (!bookPage)
      return null;

    const {$} = bookPage;
    const $wideText = $('#yui-main .content .widetext');
    const text = $wideText.text();

    const [author, release] = await Promise.all(
      [
        this.extractAuthor($wideText),
        this.extractRelease(bookPage),
      ],
    );

    const result = new CreateBookDto(
      {
        defaultTitle: release.title,
        originalPublishDate: normalizeParsedText(text.match(/Rok wydania oryginału: ([\S]+)/)?.[1]),
        authors: [
          author,
        ],
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
   * Picks title of book but removes hash
   *
   * @private
   * @static
   * @param {string} title
   * @memberof LiteraturaGildiaBookMatcher
   */
  private static parseTitle(title: string) {
    const normalizedText = normalizeParsedText(title);

    return normalizedText.match(/#\d+\s-\s*(.*)/)?.[1] ?? normalizedText;
  }

  /**
   * Extracts info about release from book page
   *
   * @private
   * @param {AsyncURLParseResult} bookPage
   * @returns
   * @memberof LiteraturaGildiaBookMatcher
   */
  private async extractRelease(bookPage: AsyncURLParseResult) {
    const {$, url} = bookPage;
    const $wideText = $('#yui-main .content .widetext');

    const publisher = await this.extractPublisher($wideText);
    const text = $wideText.text();
    const $coverImage = $wideText.find('img.main-article-image');

    return new CreateBookReleaseDto(
      {
        publisher,
        lang: Language.PL,
        title: LiteraturaGildiaBookMatcher.parseTitle($('h1').text()),
        description: normalizeParsedText($wideText.find('div > p').text()),
        edition: normalizeParsedText(text.match(/Wydanie: ([\S]+)/)?.[1]), // todo: Support it!
        isbn: normalizeISBN(text.match(/ISBN: ([\w-]+)/)?.[1]),
        totalPages: (+text.match(/Liczba stron: (\d+)/)?.[1]) || null,
        format: normalizeParsedText(text.match(/Format: ([\S]+)/)?.[1]),
        binding: LiteraturaGildiaBookMatcher.bindingMappings[
          normalizeParsedText(text.match(/Oprawa: ([\S]+)/)?.[1])?.toLowerCase()
        ],
        cover: $coverImage && new CreateImageAttachmentDto(
          {
            originalUrl: $coverImage.attr('src'),
          },
        ),
        remoteDescription: new CreateRemoteRecordDto(
          {
            showOnlyAsQuote: false,
            remoteId: url.split('/').slice(-2).join('/'),
            url,
          },
        ),
      },
    );
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

    return (await authorMatcher.searchRemoteRecord(
      {
        data: new CreateBookAuthorDto(
          {
            name: normalizeParsedText($authorAnchor.text()),
          },
        ),
      },
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

    return (await publisherMatcher.searchRemoteRecord(
      {
        data: new CreateBookPublisherDto(
          {
            name: normalizeParsedText($publisherAnchor.text()),
          },
        ),
      },
      {
        path: $publisherAnchor.attr('href'),
      },
    )).result;
  }

  /**
   * Skips search phrase and try to build that links directly to book
   *
   * @private
   * @param {CreateBookDto} {authors, releases}
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
   * @returns
   * @memberof LiteraturaGildiaBookMatcher
   */
  private async searchByFirstLetter({title}: CreateBookDto) {
    const {config, logger} = this;
    const url = concatUrls(
      config.homepageURL,
      `ksiazki,${LiteraturaGildiaBookMatcher.getFilterFirstLetter(title)}`,
    );

    logger.log(`Searching book by first letter from ${chalk.bold(url)}!`);

    const result = await parseAsyncURLIfOK(url);
    if (!result)
      return null;

    const {$} = result;
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
        return `${escapeDiacritics(letter)}1`;

      case 'Ź':
        return `${letter}2`;

      default:
        return Number.isNaN(+letter) ? letter : '0';
    }
  }
}
