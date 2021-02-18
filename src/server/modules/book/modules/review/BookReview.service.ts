import {Injectable} from '@nestjs/common';
import {Connection} from 'typeorm';
import pMap from 'p-map';

import {forwardTransaction, upsert, UpsertResourceAttrs} from '@server/common/helpers/db';
import {CreateBookReviewDto} from './dto/CreateBookReview.dto';
import {BookReviewEntity} from './BookReview.entity';
import {BookReviewerService} from '../reviewer/BookReviewer.service';

@Injectable()
export class BookReviewService {
  constructor(
    private readonly connection: Connection,
    private readonly bookReviewerService: BookReviewerService,
  ) {}

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

    return forwardTransaction({connection, entityManager}, async (transaction) => {
      const reviewEntities = await pMap(
        dtos,
        async ({reviewer, reviewerId, book, ...dto}) => new BookReviewEntity(
          {
            ...dto,
            reviewerId: reviewerId ?? (await bookReviewerService.upsert(
              reviewer,
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
          entityManager: transaction,
          connection,
          Entity: BookReviewEntity,
          data: reviewEntities,
        },
      );
    });
  }
}
