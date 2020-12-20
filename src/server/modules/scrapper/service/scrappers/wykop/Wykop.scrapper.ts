import * as R from 'ramda';

import {ENV} from '@server/constants/env';
import {ID} from '@shared/types';

import {
  fetchWebsiteInfo,
  ScrapperBasicPagination,
  WebsiteInfoScrapper,
} from '../../shared';

import {
  BookReviewAsyncScrapper,
  BookReviewScrapperInfo,
  BookReviewProcessResult,
} from '../BookReviewScrapper';

import {ScrapperWebsiteEntity} from '../../../entity';
import {WykopAPI} from './api/WykopAPI';
import {
  WykopEntryContentParser,
  WykopEntryLatestParser,
} from './content-parsers';

/**
 * @todo
 * https://www.wykop.pl/wpis/53839505/506-1-507-tytul-rhythm-of-war-autor-brandon-sander/
 * https://www.wykop.pl/wpis/51756185/143-1-144-tytul-portret-doriana-graya-autor-oscar-/
 * https://www.wykop.pl/wpis/51740461/142-1-143-tytul-problem-trzech-cial-autor-liu-cixi/
 * https://www.wykop.pl/wpis/51668249/133-1-134-tytul-piter-bitwa-blizniakow-autor-szymu/
 * https://www.wykop.pl/wpis/51623383/122-1-123-tytul-zabic-drozda-autor-harper-lee-gatu/
 */

/**
 * Picks data from wykop
 *
 * @export
 * @class WykopScrapper
 * @extends {BookReviewAsyncScrapper}
 */
export class WykopScrapper extends BookReviewAsyncScrapper implements WebsiteInfoScrapper {
  public readonly websiteURL: string = 'https://wykop.pl';

  private api = new WykopAPI(ENV.server.parsers.wykop);
  static contentParsers: Readonly<WykopEntryContentParser[]> = Object.freeze(
    [
      new WykopEntryLatestParser,
    ],
  );

  constructor() {
    super(
      {
        pageProcessDelay: 15000,
      },
    );
  }

  /**
   * Fetches website info
   *
   * @returns {Promise<ScrapperWebsiteEntity>}
   * @memberof WykopScrapper
   */
  async fetchWebsiteEntity(): Promise<ScrapperWebsiteEntity> {
    return fetchWebsiteInfo(this.websiteURL);
  }

  /**
   * Fetches single post
   *
   * @param {ID} remoteId
   * @returns {Promise<BookReviewScrapperInfo>}
   * @memberof WykopScrapper
   */
  async fetchSingle(remoteId: ID): Promise<BookReviewScrapperInfo> {
    const {data: result} = await this.api.call(
      {
        path: `Entries/Entry/${remoteId}`,
      },
    );

    return this.mapPost(result);
  }

  /**
   * Loads array of reviews
   *
   * @protected
   * @param {ScrapperBasicPagination} pagination
   * @returns {Promise<BookReviewProcessResult>}
   * @memberof WykopScrapper
   */
  protected async process(pagination: ScrapperBasicPagination): Promise<BookReviewProcessResult> {
    const page = pagination?.page ?? 1;
    const result = await this.api.call(
      {
        path: `Tags/Entries/bookmeter/page/${page}/`,
      },
    );

    return {
      result: (
        result
          .data
          .map(this.mapPost.bind(this))
          .filter(Boolean)
      ),
      ptr: {
        nextPage: (
          result.pagination.next
            ? {
              page: page + 1,
            }
            : null
        ),
      },
    };
  }

  /**
   * Picks basic review properties
   *
   * @private
   * @param {any} post
   * @returns {BookReviewScrapperInfo}
   * @memberof WykopScrapper
   */
  private mapPost(post: any): BookReviewScrapperInfo {
    if (!post)
      return null;

    const {embed, body} = post;
    if (!WykopScrapper.isTemplatePost(body))
      return null;

    const {
      properties,
      description,
    } = WykopEntryContentParser.reduceContent(WykopScrapper.contentParsers, body);

    if (!R.isEmpty(properties) && !description)
      return null;

    return {
      parserSource: JSON.stringify(post),
      url: `https://www.wykop.pl/wpis/${post.id}`,
      id: post.id,
      date: new Date(post.date),
      stats: {
        votes: post.vote_count,
        comments: post.comments_count,
      },
      author: {
        name: post.author.login,
        avatar: post.author.avatar,
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
   * Checks if post is using default bookmeter template
   *
   * @static
   * @param {string} content
   * @returns {boolean}
   * @memberof WykopScrapper
   */
  static isTemplatePost(content: string): boolean {
    return R.includes('<strong>Tytuł:</strong> ', content);
  }
}
