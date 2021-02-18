import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import pMap from 'p-map';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {CreateBookReviewDto} from './dto/CreateBookReview.dto';
import {BookReviewEntity} from './BookReview.entity';
import {BookReviewerService} from '../reviewer/BookReviewer.service';

@Injectable()
export class BookReviewService {
  constructor(
    private readonly connection: Connection,
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
   * Creates or updates record
   *
   * @param {CreateBookReviewDto[]} dtos
   * @param {UpsertResourceAttrs} [attrs={}]
   * @returns {Promise<BookReviewEntity[]>}
   * @memberof BookReviewService
   */
  async upsert(
    dtos: CreateBookReviewDto[],
    attrs: UpsertResourceAttrs = {},
  ): Promise<BookReviewEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection, bookReviewerService} = this;
    const {
      upsertResources = false,
      entityManager,
    } = attrs;

    const executor = async (transaction: EntityManager) => {
      const reviewEntities = await pMap(
        dtos,
        async ({reviewer, reviewerId, book, ...dto}) => new BookReviewEntity(
          {
            ...dto,
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
        },
      );
    };

    return forwardTransaction(
      {
        connection,
        entityManager,
      },
      executor,
    );
  }
}
