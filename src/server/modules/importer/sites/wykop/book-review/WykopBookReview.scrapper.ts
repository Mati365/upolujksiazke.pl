import * as R from 'ramda';
import chalk from 'chalk';
import {Logger} from '@nestjs/common';

import {normalizeURL} from '@server/common/helpers';

import {Gender, RemoteID} from '@shared/types';
import {ScrapperMetadataKind} from '@scrapper/entity';
import {VotingStatsEmbeddable} from '@server/modules/reactions';
import {AsyncScrapper} from '@scrapper/service/shared';

import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {CreateBookReviewerDto} from '@server/modules/book/modules/reviewer/dto/CreateBookReviewer.dto';
import {CreateImageAttachmentDto} from '@server/modules/attachment/dto';
import {CreateBookDto} from '@server/modules/book/dto/CreateBook.dto';
import {CreateBookCategoryDto} from '@server/modules/book/modules/category/dto/CreateBookCategory.dto';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';

import {
  BookReviewScrapperInfo,
  BookReviewProcessResult,
} from '@importer/kinds/scrappers/BookReview.scrapper';

import {
  WykopAPI,
  WykopAPIResponse,
} from '../api/WykopAPI';

import {
  WykopEntryContentParser,
  WykopEntryLatestParser,
} from './content-parsers';

export type WykopBookReviewScrapperConfig = {
  api: WykopAPI,
};

/**
 * @see
 * Special cases:
 * https://www.wykop.pl/wpis/14255263/6-684-1-6-683-tytul-badacze-czasu-odkupienie-krzys/
 * https://www.wykop.pl/wpis/53839505/506-1-507-tytul-rhythm-of-war-autor-brandon-sander/
 * https://www.wykop.pl/wpis/51756185/143-1-144-tytul-portret-doriana-graya-autor-oscar-/
 * https://www.wykop.pl/wpis/51740461/142-1-143-tytul-problem-trzech-cial-autor-liu-cixi/
 * https://www.wykop.pl/wpis/51668249/133-1-134-tytul-piter-bitwa-blizniakow-autor-szymu/
 * https://www.wykop.pl/wpis/51623383/122-1-123-tytul-zabic-drozda-autor-harper-lee-gatu/
 * https://www.wykop.pl/wpis/11633869/8-185-5-8-180-8185-1-8184-tytul-nowa-rebelia-autor/
 * https://www.wykop.pl/wpis/60320891/1715-1-1716-tytul-nowy-wspanialy-swiat-autor-aldou/
 */
export class WykopBookReviewScrapper extends AsyncScrapper<BookReviewScrapperInfo[]> {
  private readonly logger = new Logger(WykopBookReviewScrapper.name);
  protected readonly api: WykopAPI;

  static readonly contentParsers: Readonly<WykopEntryContentParser[]> = Object.freeze(
    [
      new WykopEntryLatestParser,
    ],
  );

  constructor({api}: WykopBookReviewScrapperConfig) {
    super(
      {
        pageProcessDelay: 13000,
      },
    );

    this.api = api;
  }

  /**
   * Checks if post is using default bookmeter template
   *
   * @static
   * @param {string} content
   * @returns {boolean}
   * @memberof WykopScrapper
   */
  static isTemplatePost(content: string): boolean {
    return !!R.match(/(<strong>)?Tytuł[:]?(<\/strong>)?[\s:]/, content)?.length;
  }

  /**
   * Picks basic review properties
   *
   * @param {any} post
   * @returns {BookReviewScrapperInfo}
   * @memberof WykopScrapper
   */
  mapSingleItemResponse(post: any): BookReviewScrapperInfo {
    if (typeof post === 'string')
      post = JSON.parse(post);

    if (!post)
      return null;

    const {embed, body} = post;
    if (!WykopBookReviewScrapper.isTemplatePost(body))
      return null;

    const {
      properties,
      description,
    } = WykopEntryContentParser.reduceContent(WykopBookReviewScrapper.contentParsers, body);

    if (R.isEmpty(properties) || (!description && R.isNil(properties.score)))
      return null;

    const {author, id: remoteId} = post;
    const gender = (() => {
      switch (author.sex) {
        case 'female':
          return Gender.FEMALE;

        case 'male':
          return Gender.MALE;

        default:
          return Gender.UNKNOWN;
      }
    })();

    const book = new CreateBookDto(
      {
        defaultTitle: properties.title,
        tags: properties.tags,
        releases: [
          new CreateBookReleaseDto(
            {
              title: properties.title,
              isbn: properties.isbn,
              cover: embed && new CreateImageAttachmentDto(
                {
                  nsfw: embed.plus18,
                  ratio: embed.ratio,
                  originalUrl: normalizeURL(embed.preview),
                },
              ),
            },
          ),
        ],

        authors: (properties.authors || []).map(
          (authorName) => new CreateBookAuthorDto(
            {
              name: authorName,
            },
          ),
        ),

        categories: (properties.categories || []).map(
          (categoryName) => new CreateBookCategoryDto(
            {
              name: categoryName,
            },
          ),
        ),
      },
    );

    // console.info(JSON.stringify({
    //   response: {data: post},
    //   description,
    //   properties,
    // }));

    return {
      remoteId,
      kind: ScrapperMetadataKind.BOOK_REVIEW,
      parserSource: JSON.stringify(post),
      dto: new CreateBookReviewDto(
        {
          description,
          book,
          remoteId,
          includeInStats: true,
          url: `https://www.wykop.pl/wpis/${remoteId}`,
          rating: properties.score,
          publishDate: new Date(post.date),
          initialConstantStats: new VotingStatsEmbeddable(
            {
              upvotes: post.vote_count,
            },
          ),
          reviewer: new CreateBookReviewerDto(
            {
              name: author.login,
              gender,
              avatar: new CreateImageAttachmentDto(
                {
                  originalUrl: normalizeURL(author.avatar),
                },
              ),
            },
          ),
        },
      ),
    };
  }

  /**
   * Fetches single post
   *
   * @param {RemoteID} remoteId
   * @returns {Promise<BookReviewScrapperInfo>}
   * @memberof WykopScrapper
   */
  async fetchSingle(remoteId: RemoteID): Promise<BookReviewScrapperInfo> {
    const {data: result} = await this.api.call(
      {
        path: `Entries/Entry/${remoteId}`,
      },
    );

    return this.mapSingleItemResponse(result);
  }

  /**
   * Loads array of reviews
   *
   * @protected
   * @param {number|string} pagination
   * @returns {Promise<BookReviewProcessResult>}
   * @memberof WykopScrapper
   */
  protected async processPage(pagination: number | string): Promise<BookReviewProcessResult> {
    const {logger, api} = this;
    const page = +pagination || 1;
    let result: WykopAPIResponse & {ignore?: boolean} = null;

    try {
      logger.warn(`Fetching ${chalk.white(`"Tags/Entries/bookmeter/page/${page}/"`)}!`);

      result = await api.call(
        {
          path: `Tags/Entries/bookmeter/page/${page}/`,
        },
      );
    } catch (e) {
      /**
       * Wykop API is a bit buggy.. sometimes it throws HTML
       * from pagination and stops parser, just ignore broken pages
       */
      if (e.type === 'invalid-json') {
        logger.warn(`Page no ${page} seems to be broken, skip!`);
        result = {
          ignore: true,
          data: [],
          pagination: {
            prev: null,
            next: true,
          },
        };
      } else
        throw e;
    }

    return {
      ignore: result?.ignore,
      result: (
        result
          .data
          .map(this.mapSingleItemResponse.bind(this))
          .filter(Boolean)
      ),
      ptr: {
        nextPage: (
          result
              && result.pagination.next
              && (result.data?.length > 0 || result.ignore)
            ? page + 1
            : null
        ),
      },
    };
  }
}
