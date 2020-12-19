import * as R from 'ramda';

import {ENV} from '@server/constants/env';
import {removeNullValues} from '@shared/helpers';

import {
  fetchWebsiteInfo,
  ScrapperBasicPagination,
  ScrapperResult,
  WebsiteInfoScrapper,
} from '../../shared';

import {BookReviewAsyncScrapper, BookReviewScrapperInfo} from '../BookReviewScrapper';
import {WykopAPI} from './api/WykopAPI';
import {ScrapperWebsiteEntity} from '../../../entity';

type BookReviewProcessResult = ScrapperResult<BookReviewScrapperInfo[], ScrapperBasicPagination>;

type WykopBookReviewHeader = {
  title?: string,
  category?: string,
  isbn?: string,
  authors?: string[],
  score?: number,
};

/**
 * Matches using regex properties inside review
 */
const matchContentProperties: (str: string) => WykopBookReviewHeader = R.compose(
  R.evolve(
    {
      authors: (authors) => (
        authors
          .split(',')
          .map(R.trim)
          .filter(R.complement(R.isEmpty))
      ),
      score: (score) => R.countBy(
        (val) => (val === '★' ? 'filled' : 'notFilled'),
        score,
      ).filled || 0,
    },
  ),
  (obj): WykopBookReviewHeader => removeNullValues({
    /* eslint-disable @typescript-eslint/dot-notation */
    title: obj['tytuł'],
    category: obj['gatunek'],
    isbn: obj['isbn'],
    authors: obj['autor'],
    score: obj['ocena'],
    /* eslint-enable @typescript-eslint/dot-notation */
  }),
  (array) => R.reduce(
    (acc, [key, value]) => {
      acc[R.toLower(key)] = value;
      return acc;
    },
    {},
    array as any,
  ),
  R.reject(
    R.any(R.either(R.isNil, R.isEmpty)),
  ),
  R.map(
    (matches) => [matches[1], matches[2]],
  ),
  (str: string) => Array.from(str.matchAll(/<strong>(.+):<\/strong>\s(.+)<br\s\/>/g)),
) as any;

/**
 * Extract review text
 *
 * @param str
 */
const matchContentDescription = (str: string) => {
  const match = (
    str
      .replace(/\n/g, '')
      .match(/[☆★]<br\s\/><br\s\/>(.*)<br\s\/><br\s\/>Wpis dodano za pomocą strony/mi)
  )?.[1] ?? null;

  return match && R.trim(match);
};

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

  constructor() {
    super(
      {
        pageProcessDelay: 20000,
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
   * Loads array of reviews
   *
   * @protected
   * @param {ScrapperBasicPagination} pagination
   * @returns {Promise<BookReviewProcessResult>}
   * @memberof WykopScrapper
   */
  protected async process(pagination: ScrapperBasicPagination): Promise<BookReviewProcessResult> {
    const page = pagination?.page ?? 10;
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
              page: (+page) + 1,
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

    const properties = matchContentProperties(body);
    const content = matchContentDescription(body);
    if (!content)
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
      content,
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
