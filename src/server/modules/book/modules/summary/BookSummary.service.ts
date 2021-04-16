import {Connection, EntityManager} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {RemoteArticleService} from '@server/modules/remote/service/RemoteArticle.service';
import {CreateBookSummaryDto} from './dto';
import {BookSummaryEntity} from './entity';

@Injectable()
export class BookSummaryService {
  constructor(
    private readonly connection: Connection,
    private readonly articleService: RemoteArticleService,
  ) {}

  async upsert(
    {article, headers, book, ...params}: CreateBookSummaryDto,
    attrs: UpsertResourceAttrs = {},
  ): Promise<BookSummaryEntity> {
    const {
      upsertResources = false,
      entityManager,
    } = attrs;

    const {
      articleService,
      connection,
    } = this;

    const executor = async (transaction: EntityManager) => {
      const upsertedArticle = await articleService.upsert(
        article,
        {
          upsertResources,
          entityManager: transaction,
        },
      );

      return upsert(
        {
          connection,
          primaryKey: 'articleId',
          entityManager: transaction,
          Entity: BookSummaryEntity,
          data: new BookSummaryEntity(
            {
              ...params,
              bookId: params.bookId ?? book?.id,
              articleId: upsertedArticle.id,
            },
          ),
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
