import {Inject, Injectable, forwardRef} from '@nestjs/common';
import {Connection, EntityManager, IsNull, Not} from 'typeorm';
import pMap from 'p-map';
import * as R from 'ramda';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {ImageVersion} from '@shared/enums';
import {CreateBookReviewDto} from './dto/CreateBookReview.dto';
import {BookReviewEntity} from './BookReview.entity';
import {BookReviewerService} from '../reviewer/BookReviewer.service';
import {BookStatsService} from '../stats/services/BookStats.service';

export type UpdateBookReviewAttrs = UpsertResourceAttrs & {
  reindexBook?: boolean,
};

@Injectable()
export class BookReviewService {
  public static readonly REVIEW_CARD_FIELDS = [
    'review',
    'reviewer.name', 'reviewer.gender',
    'avatar.version', 'attachment.file',
    'websiteLogo.version', 'websiteAttachment.file',
    'website.id', 'website.hostname', 'website.url',
  ];

  constructor(
    private readonly connection: Connection,

    @Inject(forwardRef(() => BookStatsService))
    private readonly bookStatsService: BookStatsService,
    private readonly bookReviewerService: BookReviewerService,
  ) {}

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
   * Fetches N comments for book
   *
   * @param {Object} attrs
   * @memberof BookReviewService
   */
  async findBookReviews(
    {
      bookId,
      limit,
    }: {
      bookId: number,
      limit: number,
    },
  ) {
    return (
      BookReviewEntity
        .createQueryBuilder('review')
        .select(BookReviewService.REVIEW_CARD_FIELDS)
        .where(
          {
            description: Not(IsNull()),
            bookId,
          },
        )
        .leftJoin('review.reviewer', 'reviewer')
        .leftJoin('reviewer.avatar', 'avatar', `avatar.version = '${ImageVersion.SMALL_THUMB}'`)
        .leftJoin('avatar.attachment', 'attachment')

        .innerJoin('review.website', 'website')
        .leftJoin('website.logo', 'websiteLogo', `websiteLogo.version = '${ImageVersion.SMALL_THUMB}'`)
        .leftJoin('websiteLogo.attachment', 'websiteAttachment')

        .limit(limit)
        .orderBy('review.publishDate', 'DESC')
        .getMany()
    );
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
}
