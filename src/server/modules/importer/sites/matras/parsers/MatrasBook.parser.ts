import {
  normalizeISBN,
  normalizeURL,
  normalizeParsedTitle,
  normalizeParsedText,
  normalizePrice,
} from '@server/common/helpers';

import {Language} from '@server/constants/language';
import {ScrapperMetadataKind} from '@scrapper/entity';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';

import {AsyncURLParseResult} from '@server/common/helpers/fetchAsyncHTML';
import {
  BINDING_TRANSLATION_MAPPINGS,
  BookAvailabilityParser,
} from '@importer/kinds/scrappers/Book.scrapper';

import {MatrasBookAuthorMatcher} from '../matchers/MatrasBookAuthor.matcher';
import {BasicParseAttrs, WebsiteScrapperParser} from '../../../modules/scrapper/service/shared';

export class MatrasBookParser
  extends WebsiteScrapperParser<CreateBookDto>
  implements BookAvailabilityParser<AsyncURLParseResult> {
  /**
   * @inheritdoc
   */
  parseAvailability({$, url}: AsyncURLParseResult) {
    return Promise.resolve(
      {
        result: [
          new CreateBookAvailabilityDto(
            {
              showOnlyAsQuote: false,
              remoteId: $('.buy[data-id]').data('id'),
              prevPrice: normalizePrice($('.lastPrice').text())?.price,
              price: $('[data-price-current]').data('priceCurrent'),
              url,
            },
          ),
        ],
      },
    );
  }

  /**
   * @inheritdoc
   */
  async parse(bookPage: AsyncURLParseResult, {shallowParse}: BasicParseAttrs = {}) {
    if (!bookPage)
      return null;

    const {
      detailsText,
      release,
    } = await this.extractRelease(bookPage);

    return new CreateBookDto(
      {
        authors: await this.extractAuthors(bookPage.$, shallowParse),
        defaultTitle: release.title,
        originalTitle: normalizeParsedText(detailsText.match(/Tytuł oryginalny:\s*([^\n]+)/)?.[1]),
        originalPublishDate: normalizeParsedText(detailsText.match(/Data pierwszego wydania:\s*(\S+)/)?.[1]),
        releases: [
          release,
        ],
      },
    );
  }

  /**
   * Pick release info from fetched page
   *
   * @param {AsyncURLParseResult} bookPage
   * @returns
   * @memberof MatrasBookParser
   */
  private async extractRelease(bookPage: AsyncURLParseResult) {
    const {$} = bookPage;
    const detailsText = $('#con-notes > div.colsInfo').text();

    return {
      detailsText,
      release: new CreateBookReleaseDto(
        {
          lang: Language.PL,
          title: normalizeParsedTitle($('h1').text()),
          description: normalizeParsedText($('#con-notes > .text:first-child').text()),
          isbn: normalizeISBN(detailsText.match(/ISBN:\s*([\w-]+)/)?.[1]),
          totalPages: (+detailsText.match(/Liczba stron:\s*(\d+)/)?.[1]) || null,
          edition: normalizeParsedText(detailsText.match(/Wydanie:\s*(\S+)/)?.[1]),
          format: normalizeParsedText(detailsText.match(/Format:\s*(\S+)/)?.[1]),
          publishDate: normalizeParsedText(detailsText.match(/Rok wydania:\s*(\S+)/)?.[1]),
          defaultPrice: normalizePrice(detailsText.match(/Cena katalogowa:\s*(\S+)/)?.[1])?.price,
          availability: (await this.parseAvailability(bookPage)).result,
          translator: (
            detailsText
              .match(/Tłumaczenie:\s*(\S+\s\S+)/)?.[1]
              ?.split(',')
              .map((str) => normalizeParsedText(str))
          ),
          binding: BINDING_TRANSLATION_MAPPINGS[
            normalizeParsedText(detailsText.match(/Oprawa\s*(\S+)/)?.[1])?.toLowerCase()
          ],
          publisher: MatrasBookParser.extractPublisher($),
          cover: new CreateImageAttachmentDto(
            {
              originalUrl: normalizeURL(
                $('section.pageInfo .imgBox > .img-responsive').attr('src'),
              ),
            },
          ),
        },
      ),
    };
  }

  /**
   * Reads publisher name and logo
   *
   * @static
   * @param {cheerio.Root} $
   * @returns
   * @memberof MatrasBookParser
   */
  static extractPublisher($: cheerio.Root) {
    const publisherContainer = $('#con-notes > div.colsInfo > div.col-lg-2.col-md-2.col-sm-4.col-xs-12.col-1');
    const logo = publisherContainer.find('img');

    return new CreateBookPublisherDto(
      {
        name: normalizeParsedText(
          logo.attr('alt') ?? publisherContainer.text(),
        ),

        logo: (
          logo.attr('src')
            ? new CreateImageAttachmentDto(
              {
                originalUrl: normalizeURL(logo.attr('src')),
              },
            )
            : null
        ),
      },
    );
  }

  /**
   * Extract single author from book page and finds it
   *
   * @private
   * @param {cheerio.Root} $
   * @param {boolean} [shallow]
   * @returns
   * @memberof MatrasBookParser
   */
  private async extractAuthors($: cheerio.Root, shallow?: boolean) {
    const authorMatcher = <MatrasBookAuthorMatcher> this.matchers[ScrapperMetadataKind.BOOK_AUTHOR];
    const $authorsAnchors = $('h2.authors > a[href^="/autor/"]').toArray();

    return Promise.all($authorsAnchors.map(
      (el) => {
        const $authorAnchor = $(el);
        const dto = new CreateBookAuthorDto(
          {
            name: normalizeParsedText($authorAnchor.text()),
          },
        );

        if (shallow)
          return dto;

        return (
          authorMatcher
            .searchRemoteRecord(
              {
                data: dto,
              },
              {
                path: $authorAnchor.attr('href'),
              },
            )
            .then((r) => r.result)
        );
      },
    ));
  }
}
