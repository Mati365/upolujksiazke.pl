import {buildURL} from '@shared/helpers';
import {fuzzyFindBookAnchor} from '@scrapper/helpers/fuzzyFindBookAnchor';
import {
  normalizeISBN,
  normalizeParsedText,
  normalizePrice,
  normalizeURL,
} from '@server/common/helpers';

import {Language} from '@server/constants/language';
import {BookBindingKind} from '@server/modules/book/modules/release/BookRelease.entity';
import {AsyncURLParseResult, parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';

import {ScrapperMetadataKind} from '@scrapper/entity/ScrapperMetadata.entity';
import {BookAvailabilityScrapperMatcher} from '../../Book.scrapper';
import {MatchRecordAttrs} from '../../../shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';
import {MatrasBookAuthorMatcher} from './MatrasBookAuthor.matcher';

export class MatrasBookMatcher
  extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig>
  implements BookAvailabilityScrapperMatcher<AsyncURLParseResult> {
  static readonly bindingMappings = Object.freeze(
    {
      /* eslint-disable quote-props */
      'miękka': BookBindingKind.NOTEBOOK,
      'twarda': BookBindingKind.HARDCOVER,
      /* eslint-enable quote-props */
    },
  );

  searchAvailability({$, url}: AsyncURLParseResult): Promise<CreateBookAvailabilityDto[]> {
    return Promise.resolve([
      new CreateBookAvailabilityDto(
        {
          showOnlyAsQuote: true,
          remoteId: $('.buy[data-id]').data('id'),
          prevPrice: normalizePrice($('.lastPrice').text())?.price,
          price: $('[data-price-current]').data('priceCurrent'),
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

    const {
      detailsText,
      release,
    } = this.extractRelease(bookPage.$);

    return {
      result: new CreateBookDto(
        {
          authors: await this.extractAuthors(bookPage.$),
          defaultTitle: release.title,
          originalPublishDate: normalizeParsedText(detailsText.match(/Data pierwszego wydania:\s*(\S+)/)?.[1]),
          availability: await this.searchAvailability(bookPage),
          releases: [
            release,
          ],
        },
      ),
    };
  }

  /**
   * Pick release info from fetched page
   *
   * @private
   * @param {cheerio.Root} $
   * @returns
   * @memberof MatrasBookMatcher
   */
  private extractRelease($: cheerio.Root) {
    const detailsText = $('#con-notes > div.colsInfo').text();

    return {
      detailsText,
      release: new CreateBookReleaseDto(
        {
          lang: Language.PL,
          title: normalizeParsedText($('h1').text()),
          description: normalizeParsedText($('#con-notes > .text:first-child').text()),
          isbn: normalizeISBN(detailsText.match(/ISBN:\s*([\w-]+)/)?.[1]),
          totalPages: (+detailsText.match(/Liczba stron:\s*(\d+)/)?.[1]) || null,
          edition: normalizeParsedText(detailsText.match(/Wydanie:\s*(\S+)/)?.[1]),
          format: normalizeParsedText(detailsText.match(/Format:\s*(\S+)/)?.[1]),
          publishDate: normalizeParsedText(detailsText.match(/Rok wydania:\s*(\S+)/)?.[1]),
          defaultPrice: normalizePrice(detailsText.match(/Cena katalogowa:\s*(\S+\s\S+)/)?.[1])?.price,
          translator: normalizeParsedText(detailsText.match(/Tłumaczenie:\s*(\S+\s\S+)/)?.[1]),
          binding: MatrasBookMatcher.bindingMappings[
            normalizeParsedText(detailsText.match(/Oprawa\s*(\S+)/)?.[1])?.toLowerCase()
          ],
          publisher: this.extractPublisher($),
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
   * @private
   * @param {cheerio.Root} $
   * @returns
   * @memberof MatrasBookMatcher
   */
  private extractPublisher($: cheerio.Root) {
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
   * @returns
   * @memberof MatrasBookMatcher
   */
  private async extractAuthors($: cheerio.Root) {
    const authorMatcher = <MatrasBookAuthorMatcher> this.matchers[ScrapperMetadataKind.BOOK_AUTHOR];
    const $authorsAnchors = $('h2.authors > a[href^="/autor/"]').toArray();

    return Promise.all($authorsAnchors.map(
      (el) => {
        const $authorAnchor = $(el);

        return (
          authorMatcher
            .searchRemoteRecord(
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
            )
            .then((r) => r.result)
        );
      },
    ));
  }

  /**
   * Go to website search and pick matching item
   *
   * @private
   * @param {CreateBookDto} scrapperInfo
   * @memberof MatrasBookMatcher
   */
  private async searchByPhrase({title, authors}: CreateBookDto) {
    const {config} = this;
    const $ = (
      await parseAsyncURLIfOK(
        buildURL(
          config.searchURL,
          {
            szukaj: `${title} ${authors[0].name}`,
          },
        ),
      )
    )?.$;

    const matchedAnchor = fuzzyFindBookAnchor(
      {
        $: $('.mainContainer .booksBox .booksContainer .book'),
        book: {
          title,
          author: authors[0].name,
        },
        anchorSelector: (anchor) => {
          const $title = $(anchor).find('> .title');

          return {
            title: $title.find('.title h2').text(),
            author: $title.find('.title h3').text(),
          };
        },
      },
    );

    return matchedAnchor && this.searchByPath(
      $(matchedAnchor).find('a.show').attr('href'),
    );
  }
}
