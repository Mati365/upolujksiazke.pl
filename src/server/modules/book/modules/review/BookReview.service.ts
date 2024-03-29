import {Inject, Injectable, forwardRef} from '@nestjs/common';
import {Connection, EntityManager, IsNull, Not, SelectQueryBuilder} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

import {uniqFlatHashByProp} from '@shared/helpers';
import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {WithUserID} from '@shared/types';
import {VoteStatsRecord} from '@api/types';
import {RecentCommentedBooksFilters} from '@api/repo';

import {
  ImageVersion,
  UserReactionRecordType,
  UserReactionType,
} from '@shared/enums';

import {VotingStatsEmbeddable} from '@server/modules/reactions';
import {RemoteWebsiteService} from '@server/modules/remote/service/RemoteWebsite.service';
import {BookReviewEntity} from './entity/BookReview.entity';
import {BookReviewerService} from '../reviewer/BookReviewer.service';
import {BookStatsService} from '../stats/services/BookStats.service';
import {CardBookSearchService} from '../search/service/CardBookSearch.service';
import {BookReviewReactionEntity} from './entity/BookReviewReaction.entity';
import {
  CreateBookReviewDto,
  BookReviewReactionDto,
} from './dto';

export type UpdateBookReviewAttrs = UpsertResourceAttrs & {
  reindexBook?: boolean,
};

@Injectable()
export class BookReviewService {
  public static readonly REVIEW_WEBSITE_FIELDS = [
    'websiteLogo.version', 'websiteAttachment.file',
    'website.id', 'website.hostname', 'website.url',
  ];

  public static readonly REVIEW_CARD_FIELDS = [
    'review',
    'reviewer.name', 'reviewer.gender', 'reviewer.hidden',
    'avatar.version', 'attachment.file',
  ];

  constructor(
    private readonly connection: Connection,
    private readonly entityManager: EntityManager,

    @Inject(forwardRef(() => BookStatsService))
    private readonly bookStatsService: BookStatsService,
    private readonly bookReviewerService: BookReviewerService,
    private readonly cardBookSearchService: CardBookSearchService,
    private readonly remoteWebsiteService: RemoteWebsiteService,
  ) {}

  /**
   * Create basic query
   *
   * @param {Object} attrs
   * @return {SelectQueryBuilder<BookReviewEntity>}
   * @memberof BookReviewService
   */
  createCardsQuery(
    {
      select = BookReviewService.REVIEW_CARD_FIELDS,
      withWebsite = true,
      hiddenContent = false,
    }: {
      select?: string[],
      withWebsite?: boolean,
      hiddenContent?: boolean,
    } = {},
  ): SelectQueryBuilder<BookReviewEntity> {
    let query = (
      BookReviewEntity
        .createQueryBuilder('review')
        .select(
          [
            ...select,
            ...(withWebsite ? BookReviewService.REVIEW_WEBSITE_FIELDS : []),
          ],
        )
        .leftJoin('review.reviewer', 'reviewer')
        .leftJoin('reviewer.avatar', 'avatar', `avatar.version = '${ImageVersion.SMALL_THUMB}'`)
        .leftJoin('avatar.attachment', 'attachment')
        .andWhere('reviewer.hidden <> true')
        .andWhere(
          {
            description: Not(IsNull()),
          },
        )
    );

    if (withWebsite) {
      query = (
        query
          .innerJoin('review.website', 'website')
          .leftJoin('website.logo', 'websiteLogo', `websiteLogo.version = '${ImageVersion.SMALL_THUMB}'`)
          .leftJoin('websiteLogo.attachment', 'websiteAttachment')
      );
    }

    if (!R.isNil(hiddenContent))
      query = query.andWhere('review."hiddenContent" = :hiddenContent', {hiddenContent});

    return query;
  }

  /**
   * Remove multiple book reviews
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookReviewService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {connection} = this;

    await forwardTransaction(
      {
        connection,
        entityManager,
      },
      async (transaction) => {
        await transaction.remove(
          ids.map((id) => new BookReviewEntity(
            {
              id,
            },
          )),
        );
      },
    );
  }

  /**
   * Find single review by id
   *
   * @param {number} id
   * @returns
   * @memberof BookReviewService
   */
  findOne(id: number) {
    return BookReviewEntity.findOne(id);
  }

  /**
   * Find nth book reviews including books
   *
   * @param {RecentCommentedBooksFilters} {limit}
   * @return {Promise<BookReviewEntity[]>}
   * @memberof BookReviewService
   */
  async findRecentBooksComments(
    {
      limit,
      hiddenContent = false,
    }: RecentCommentedBooksFilters & {
      hiddenContent?: boolean,
    },
  ): Promise<BookReviewEntity[]> {
    const {
      cardBookSearchService,
      remoteWebsiteService,
    } = this;

    const reviews = await remoteWebsiteService.preloadWebsitesToEntities(
      await this
        .createCardsQuery(
          {
            hiddenContent,
            withWebsite: false,
          },
        )
        .orderBy('review.publishDate', 'DESC')
        .take(limit)
        .getMany(),
    );

    const books = uniqFlatHashByProp(
      'id',
      await cardBookSearchService.findBooksByIds(
        R.pluck('bookId', reviews),
      ),
    );

    return reviews.map(
      (item) => new BookReviewEntity(
        {
          ...item,
          book: books[item.bookId],
        },
      ),
    );
  }

  /**
   * Fetches N comments for book
   *
   * @param {Object} attrs
   * @memberof BookReviewService
   */
  async findBookReviews(
    {
      ids,
      bookId,
      booksIds,
      hiddenContent = false,
      pagination = true,
      offset = 0,
      limit = 15,
    }: {
      ids?: number[],
      bookId?: number,
      booksIds?: number[],
      offset?: number,
      pagination?: boolean,
      limit?: number,
      hiddenContent?: boolean,
    },
  ) {
    const {remoteWebsiteService} = this;
    let query = (
      this
        .createCardsQuery(
          {
            hiddenContent,
            withWebsite: false,
          },
        )
        .skip(offset)
        .take(limit)
        .orderBy('review.publishDate', 'DESC')
    );

    if (!R.isNil(ids))
      query = query.andWhere('review."id" in (:...ids)', {ids});

    if (!R.isNil(booksIds))
      query = query.andWhere('review."bookId" in (:...booksIds)', {booksIds});
    else if (!R.isNil(bookId))
      query = query.andWhere('review."bookId" = :bookId', {bookId});

    const [items, totalItems] = (
      pagination
        ? await query.getManyAndCount()
        : [await query.getMany(), null]
    );

    return {
      items: await remoteWebsiteService.preloadWebsitesToEntities(items),
      meta: {
        limit,
        offset,
        totalItems,
      },
    };
  }

  /**
   * Creates or updates record
   *
   * @param {CreateBookReviewDto[]} dtos
   * @param {UpdateBookReviewAttrs} [attrs={}]
   * @returns {Promise<BookReviewEntity[]>}
   * @memberof BookReviewService
   */
  async upsert(
    dtos: CreateBookReviewDto[],
    attrs: UpdateBookReviewAttrs = {},
  ): Promise<BookReviewEntity[]> {
    if (!dtos?.length)
      return [];

    const {
      connection,
      bookReviewerService,
      bookStatsService,
    } = this;

    const {
      upsertResources = false,
      reindexBook = true,
      entityManager,
    } = attrs;

    const executor = async (transaction: EntityManager) => {
      const reviewEntities = await pMap(
        dtos,
        async ({reviewer, reviewerId, book, ...dto}) => new BookReviewEntity(
          {
            ...dto,
            bookId: dto.bookId ?? book?.id,
            reviewerId: reviewerId ?? (await bookReviewerService.upsert(
              {
                ...reviewer,
                websiteId: dto.websiteId,
              },
              {
                upsertResources,
                entityManager: transaction,
              },
            ))?.id,
          },
        ),
        {
          concurrency: 1,
        },
      );

      return upsert(
        {
          connection,
          constraint: 'book_review_unique_remote',
          entityManager: transaction,
          Entity: BookReviewEntity,
          data: reviewEntities,
          coalesce: false,
        },
      );
    };

    const reviews = await forwardTransaction(
      {
        connection,
        entityManager,
      },
      executor,
    );

    // prevents refreshing book stats inside transaction
    if (reindexBook) {
      await pMap(
        R.uniq(R.pluck('bookId', reviews)),
        (id) => bookStatsService.refreshBookStats(id),
        {
          concurrency: 3,
        },
      );
    }

    return reviews;
  }

  /**
   * Calc upvotes / downvotes for post
   *
   * @param {number} id
   * @return {Promise<VoteStatsRecord>}
   * @memberof BookReviewService
   */
  async refreshStats(id: number): Promise<VoteStatsRecord> {
    const {entityManager} = this;
    const [stats]: [VoteStatsRecord] = await entityManager.query(
      /* sql */ `
        with reaction_stats as (
          select
            count(case when ur."reaction" = '${UserReactionType.LIKE}' then 1 else null end)::int as "upvotes",
            count(case when ur."reaction" = '${UserReactionType.DISLIKE}' then 1 else null end)::int as "downvotes"
          from user_reaction ur
          where
            ur."type" = '${UserReactionRecordType.BOOK_REVIEW}' and ur."reviewId" = $1
        )
        select
          (br."initialConstantStatsUpvotes" + r."upvotes") as "upvotes",
          (br."initialConstantStatsDownvotes" + r."downvotes") as "downvotes"
        from book_review br
        cross join reaction_stats r
        where br.id = $1;
      `,
      [id],
    );

    await BookReviewEntity.update(
      id,
      {
        stats: new VotingStatsEmbeddable(stats),
      },
    );

    return stats;
  }

  /**
   * Saves user like / dislike of review
   *
   * @param {WithUserID<BookReviewReactionDto>} reaction
   * @return {Promise<VoteStatsRecord>}
   * @memberof BookReviewService
   */
  async react(
    {
      userId,
      id,
      reaction,
    }: WithUserID<BookReviewReactionDto>,
  ): Promise<VoteStatsRecord> {
    const {connection} = this;

    await connection.transaction(async (transaction) => {
      await transaction.delete(
        BookReviewReactionEntity,
        {
          reviewId: id,
          userId,
        },
      );

      await transaction.save(
        new BookReviewReactionEntity(
          {
            reviewId: id,
            userId,
            reaction,
          },
        ),
      );
    });

    return this.refreshStats(id);
  }
}
