import {buildURL} from '@shared/helpers';
import {parseAsyncURLIfOK} from '@server/common/helpers/fetchAsyncHTML';
import {fuzzyFindBookAnchor} from '@scrapper/helpers/fuzzyFindBookAnchor';
import {
  normalizeISBN,
  normalizeParsedText,
} from '@server/common/helpers';

import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateBookPublisherDto} from '@server/modules/book/modules/publisher/dto/BookPublisher.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';

import {Language} from '@server/constants/language';
import {ScrapperMetadataKind} from '@scrapper/entity/ScrapperMetadata.entity';
import {MatchRecordAttrs} from '../../../shared/WebsiteScrappersGroup';
import {WebsiteScrapperMatcher, ScrapperMatcherResult} from '../../../shared/ScrapperMatcher';
import {BookShopScrappersGroupConfig} from '../../BookShopScrappersGroup';
import {MatrasBookAuthorMatcher} from './MatrasBookAuthor.matcher';

export class MatrasBookMatcher extends WebsiteScrapperMatcher<CreateBookDto, BookShopScrappersGroupConfig> {
  /**
   * @inheritdoc
   */
  async searchRemoteRecord({data}: MatchRecordAttrs<CreateBookDto>): Promise<ScrapperMatcherResult<CreateBookDto>> {
    const bookPage = await this.searchByPhrase(data);
    if (!bookPage)
      return null;

    const {$, url} = bookPage;
    const detailsText = $('#con-notes > div.colsInfo').text();

    const authors = await this.extractAuthors($);
    const release = new CreateBookReleaseDto(
      {
        lang: Language.PL,
        title: normalizeParsedText($('h1').text()),
        description: normalizeParsedText($('#con-notes > .text:first-child').text()),
        isbn: normalizeISBN(detailsText.match(/ISBN: ([\w-]+)/)?.[1]),
        totalPages: (+detailsText.match(/Liczba stron: (\d+)/)?.[1]) || null,
        format: normalizeParsedText(detailsText.match(/Format: ([\S]+)/)?.[1]),
        publishDate: normalizeParsedText(detailsText.match(/Data wydania: ([\S]+)/)?.[1]),
        publisher: this.extractPublisher($),
        cover: new CreateImageAttachmentDto(
          {
            originalUrl: $('section.pageInfo .imgBox > .img-responsive').attr('src'),
          },
        ),
        remoteDescription: new CreateRemoteRecordDto(
          {
            showOnlyAsQuote: true,
            remoteId: $('.buy[data-id]').data('id'),
            url,
          },
        ),
      },
    );

    console.info(release, authors);
    return null;
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
    const logo = publisherContainer.find('img.img-responsive');

    return new CreateBookPublisherDto(
      {
        name: normalizeParsedText(
          logo.attr('alt') ?? publisherContainer.text(),
        ),

        logo: (
          logo.attr('src')
            ? new CreateImageAttachmentDto(
              {
                originalUrl: logo.attr('src'),
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
   * @memberof GraniceBookMatcher
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
