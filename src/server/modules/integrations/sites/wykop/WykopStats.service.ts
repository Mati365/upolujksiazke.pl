import {Injectable} from '@nestjs/common';
import {Between, EntityManager} from 'typeorm';
import * as R from 'ramda';
import {plainToClass} from 'class-transformer';

import {
  objPropsToPromise,
  timeout,
  uniqFlatHashByProp,
} from '@shared/helpers';

import {Duration} from '@shared/types';
import {APIPaginationResult, BasicAPIPagination} from '@api/APIClient';
import {MemoizeMethod} from '@shared/helpers/decorators/MemoizeMethod';
import {ScrapperService, ScrapperMetadataService} from '@importer/modules/scrapper/service';
import {ScrapperRefreshService} from '@importer/modules/scrapper/service/actions';
import {ScrapperMetadataKind} from '@importer/modules/scrapper/entity';
import {RemoteWebsiteEntity} from '@server/modules/remote/entity';
import {BookReviewEntity} from '@server/modules/book/modules/review/entity';
import {CardBookSearchService} from '@server/modules/book/modules/search/service';
import {BookCardSerializer} from '@server/modules/api/serializers/BookCard.serializer';

import {WYKOP_ENV} from './constants/wykopEnv';
import {WykopOptionalMatchReview} from './constants/types';

export type DurationAttrs = {
  duration: Duration,
};

export type WykopRanking = {
  topUpvoted: APIPaginationResult<WykopOptionalMatchReview>,
};

@Injectable()
export class WykopStatsService {
  constructor(
    private readonly scrapperService: ScrapperService,
    private readonly scrapperRefreshService: ScrapperRefreshService,
    private readonly metadataService: ScrapperMetadataService,
    private readonly cardBookSearch: CardBookSearchService,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Fetches array of reviews again
   *
   * @param {Object} attrs
   * @memberof WykopRefreshStatsService
   */
  async refreshMetadataReviewsStats(
    {
      duration,
      delay = 1500,
    }: DurationAttrs & {
      delay?: number,
    },
  ) {
    const {
      metadataService,
      scrapperService,
      scrapperRefreshService,
    } = this;

    const website = await this.findWykopWebsite();
    if (!website)
      return null;

    const scrappersGroup = scrapperService.getScrappersGroupByWebsiteURL(website.url);
    if (!scrappersGroup)
      return null;

    let total = 0;
    const iterator = metadataService.createWebsiteMetadataIterator(
      {
        kind: ScrapperMetadataKind.BOOK_REVIEW,
        websiteId: website.id,
        duration,
      },
    );

    for await (const [, reviews] of iterator) {
      for await (const review of reviews) {
        await scrapperRefreshService.refreshSingle(
          {
            kind: ScrapperMetadataKind.BOOK_REVIEW,
            remoteId: review.remoteId,
            queued: false,
            scrappersGroup,
          },
        );

        await timeout(delay);
        total++;
      }
    }

    return {
      total,
    };
  }

  /**
   * Find all wykop reviews ranking
   *
   * @param {DurationAttrs} attrs
   * @returns {Promise<WykopRanking>}
   * @memberof WykopStatsService
   */
  async fetchRanking({duration}: DurationAttrs): Promise<WykopRanking> {
    return objPropsToPromise(
      {
        topUpvoted: this.findTopUpvotedReviews(
          {
            limit: 20,
            duration,
          },
        ),
      },
    );
  }

  /**
   * Iterates over all books and returns sorted by upvotes books
   *
   * @param {Object} attrs
   * @return {Promise<APIPaginationResult<WykopOptionalMatchReview>>}
   * @memberof WykopStatsService
   */
  async findTopUpvotedReviews(
    {
      duration,
      limit = 20,
      offset = 0,
    }: DurationAttrs & BasicAPIPagination,
  ): Promise<APIPaginationResult<WykopOptionalMatchReview>> {
    const {entityManager} = this;
    const where = {
      kind: ScrapperMetadataKind.BOOK_REVIEW,
      websiteId: (await this.findWykopWebsite()).id,
      createdAt: Between(duration.begin, duration.end),
    };

    const {totalItems, items} = await objPropsToPromise(
      {
        totalItems: (
          entityManager
            .createQueryBuilder()
            .from('scrapper_metadata', 'm')
            .andWhere(where)
            .getCount()
        ),
        items: (
          entityManager
            .createQueryBuilder()
            .from('scrapper_metadata', 'm')
            .select(
              [
                'm."id"',
                'm."createdAt"',
                'content->>\'url\' as "url"',
                'content->\'book\'->>\'defaultTitle\' as "defaultTitle"',
                'content->\'book\'->\'authors\'->0->>\'name\' as "author"',
                'content->\'reviewer\'->>\'name\' as "reviewer"',
                'cast(content->\'initialConstantStats\'->>\'upvotes\' as integer) as "upvotes"',
                'cast(content->\'rating\' as integer) as "rating"',
                'm."remoteId"',
              ],
            )
            .offset(offset)
            .limit(limit)
            .andWhere(where)
            .orderBy('upvotes', 'DESC', 'NULLS LAST')
            .getRawMany()
            .then(this.assignMatchedBooksToReviews.bind(this))
        ),
      },
    );

    return {
      items,
      meta: {
        totalItems,
        limit,
        offset,
      },
    };
  }

  /**
   * Iterates over all partial matched reviews and assigns them book
   *
   * @private
   * @param {WykopOptionalMatchReview[]} reviews
   * @return {Promise<WykopOptionalMatchReview[]>}
   * @memberof WykopStatsService
   */
  private async assignMatchedBooksToReviews(reviews: WykopOptionalMatchReview[]): Promise<WykopOptionalMatchReview[]> {
    const {
      entityManager,
      cardBookSearch,
    } = this;

    const remoteIds = R.pluck('remoteId', reviews);
    const remotesToBooksMapping: Record<string, string> = <any> R.mapObjIndexed(
      R.prop('bookId'),
      uniqFlatHashByProp(
        'remoteId',
        await (
          entityManager
            .createQueryBuilder()
            .from(BookReviewEntity, 'r')
            .andWhere('r."remoteId" IN (:...remoteIds)', {remoteIds})
            .select('r."bookId", r."remoteId"')
            .getRawMany()
        ),
      ),
    );

    const books = uniqFlatHashByProp(
      'id',
      await cardBookSearch
        .findBooksByIds(R.uniq(R.values(remotesToBooksMapping)))
        .then(R.map((item) => plainToClass(
          BookCardSerializer,
          item,
          {
            excludeExtraneousValues: true,
          },
        ))),
    );

    return R.map(
      (review) => ({
        ...review,
        matchedBook: books[remotesToBooksMapping[review.remoteId]],
      }),
      reviews,
    );
  }

  /**
   * Finds WebsiteEntity by book
   *
   * @return {Promise<RemoteWebsiteEntity>}
   * @memberof WykopRefreshStatsService
   */
  @MemoizeMethod
  async findWykopWebsite(): Promise<RemoteWebsiteEntity> {
    return this.scrapperService.findOrCreateWebsiteByUrl(WYKOP_ENV.homepageURL);
  }
}
