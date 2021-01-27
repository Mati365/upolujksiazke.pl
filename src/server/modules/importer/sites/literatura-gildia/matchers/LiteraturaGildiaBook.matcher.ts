import * as R from 'ramda';

import {escapeDiacritics} from '@shared/helpers/escapeDiacritics';
import {underscoreParameterize} from '@shared/helpers/parameterize';
import {fuzzyFindBookAnchor} from '@scrapper/helpers/fuzzyFindBookAnchor';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {
  normalizeISBN,
  normalizeParsedText,
  normalizeParsedTitle,
  normalizeURL,
} from '@server/common/helpers';

import {Language} from '@server/constants/language';

import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';

import {
  BINDING_TRANSLATION_MAPPINGS,
  BookAvailabilityScrapperMatcher,
} from '@scrapper/service/scrappers/Book.scrapper';

import {ScrapperMatcherResult, WebsiteScrapperMatcher} from '@scrapper/service/shared/ScrapperMatcher';
import {MatchRecordAttrs} from '@scrapper/service/shared/WebsiteScrappersGroup';
import {ScrapperMetadataKind} from '@scrapper/entity/ScrapperMetadata.entity';
import {BookShopScrappersGroupConfig} from '@scrapper/service/scrappers/BookShopScrappersGroup';
import {LiteraturaGildiaBookAuthorMatcher} from './LiteraturaGildiaBookAuthor.matcher';
import {LiteraturaGildiaBookPublisherMatcher} from './LiteraturaGildiaBookPublisher.matcher';

export class LiteraturaGildiaBookMatcher
  extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>
  implements BookAvailabilityScrapperMatcher<AsyncURLParseResult> {
  /**
   * Search all remote book urls
   *
   * @param {AsyncURLParseResult} {url}
   * @returns {Promise<CreateBookAvailabilityDto[]>}
   * @memberof LiteraturaGildiaBookMatcher
   */
  searchAvailability({url}: AsyncURLParseResult): Promise<CreateBookAvailabilityDto[]> {
    return Promise.resolve([
      new CreateBookAvailabilityDto(
        {
          showOnlyAsQuote: false,
          remoteId: url.split('/').slice(-2).join('/'),
          url,
        },
      ),
    ]);
  }

  /**
   * @inheritdoc
   */
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

    return {
      result: new CreateBookDto(
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
      ),
    };
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
    const {$} = bookPage;
    const $wideText = $('#yui-main .content .widetext');

    const publisher = await this.extractPublisher($wideText);
    const text = $wideText.text();
    const $coverImage = $wideText.find('img.main-article-image');

    return new CreateBookReleaseDto(
      {
        publisher,
        lang: Language.PL,
        title: normalizeParsedTitle($('h1').text()),
        description: normalizeParsedText($wideText.find('div > p').text()),
        edition: normalizeParsedText(text.match(/Wydanie: ([\S]+)/)?.[1]),
        isbn: normalizeISBN(text.match(/ISBN: ([\w-]+)/)?.[1]),
        totalPages: (+text.match(/Liczba stron: (\d+)/)?.[1]) || null,
        format: normalizeParsedText(text.match(/Format: ([\S]+)/)?.[1]),
        binding: BINDING_TRANSLATION_MAPPINGS[
          normalizeParsedText(text.match(/Oprawa: ([\S]+)/)?.[1])?.toLowerCase()
        ],
        cover: $coverImage && new CreateImageAttachmentDto(
          {
            originalUrl: normalizeURL($coverImage.attr('src')),
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
    const $authorAnchor = $parent.find('> a[href^="/tworcy/"]').first();

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
  private directSearch({authors, title}: CreateBookDto) {
    return this.fetchPageByPath(
      `tworcy/${underscoreParameterize(authors[0].name)}/${underscoreParameterize(title)}`,
    );
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
    const $ = (
      await this.fetchPageByPath(`ksiazki,${LiteraturaGildiaBookMatcher.getFilterFirstLetter(title)}`)
    )?.$;

    if (!$)
      return null;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('#yui-main .content ul.long-list > li > a'),
        book: {
          title,
        },
        anchorSelector: (anchor) => ({
          title: $(anchor).text(),
        }),
      },
    );

    return matchedAnchor && this.fetchPageByPath(
      $(matchedAnchor).attr('href'),
    );
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
