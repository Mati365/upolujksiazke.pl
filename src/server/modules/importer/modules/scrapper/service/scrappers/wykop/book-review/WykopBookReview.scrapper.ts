import * as R from 'ramda';
import chalk from 'chalk';
import {Logger} from '@nestjs/common';

import {Gender, RemoteID} from '@shared/types';
import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';
import {AsyncScrapper, ScrapperBasicPagination} from '@server/modules/importer/modules/scrapper/service/shared';

import {
  BookReviewScrapperInfo,
  BookReviewProcessResult,
} from '../../BookReview.scrapper';

import {
  WykopAPI,
  WykopAPIAuthParams,
  WykopAPIResponse,
} from '../api/WykopAPI';

import {
  WykopEntryContentParser,
  WykopEntryLatestParser,
} from './content-parsers';

export type WykopBookReviewScrapperConfig = {
  authConfig: WykopAPIAuthParams,
};

/**
 * @see
 * Special cases:
 * https://www.wykop.pl/wpis/53839505/506-1-507-tytul-rhythm-of-war-autor-brandon-sander/
 * https://www.wykop.pl/wpis/51756185/143-1-144-tytul-portret-doriana-graya-autor-oscar-/
 * https://www.wykop.pl/wpis/51740461/142-1-143-tytul-problem-trzech-cial-autor-liu-cixi/
 * https://www.wykop.pl/wpis/51668249/133-1-134-tytul-piter-bitwa-blizniakow-autor-szymu/
 * https://www.wykop.pl/wpis/51623383/122-1-123-tytul-zabic-drozda-autor-harper-lee-gatu/
 * https://www.wykop.pl/wpis/11633869/8-185-5-8-180-8185-1-8184-tytul-nowa-rebelia-autor/
 */
export class WykopBookReviewScrapper extends AsyncScrapper<BookReviewScrapperInfo[]> {
  protected readonly logger = new Logger(WykopBookReviewScrapper.name);
  protected readonly api: WykopAPI;

  static contentParsers: Readonly<WykopEntryContentParser[]> = Object.freeze(
    [
      new WykopEntryLatestParser,
    ],
  );

  constructor(
    {
      authConfig,
    }: WykopBookReviewScrapperConfig,
  ) {
    super(
      {
        pageProcessDelay: 13000,
      },
    );

    this.api = new WykopAPI(authConfig);
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
    return !!R.match(/(<strong>)?Tytuł:(<\/strong>)?\s/, content)?.length;
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

    if (R.isEmpty(properties) || !description)
      return null;

    const {author} = post;
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

    return {
      kind: ScrapperMetadataKind.BOOK_REVIEW,
      parserSource: JSON.stringify(post),
      url: `https://www.wykop.pl/wpis/${post.id}`,
      id: post.id,
      date: new Date(post.date),
      stats: {
        votes: post.vote_count,
        comments: post.comments_count,
      },
      author: {
        name: author.login,
        avatar: author.avatar,
        gender,
      },
      score: properties.score,
      content: description,
      book: {
        title: properties.title,
        isbn: properties.isbn,
        authors: properties.authors,
        category: properties.category,
        description: null,
        cover: embed && {
          nsfw: embed.plus18,
          ratio: embed.ratio,
          source: embed.preview,
          image: embed.source,
        },
      },
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
   * @param {ScrapperBasicPagination} pagination
   * @returns {Promise<BookReviewProcessResult>}
   * @memberof WykopScrapper
   */
  protected async processPage(pagination: ScrapperBasicPagination): Promise<BookReviewProcessResult> {
    const {logger, api} = this;
    const page = pagination?.page ?? 1;
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
            ? {
              page: page + 1,
            }
            : null
        ),
      },
    };
  }
}
