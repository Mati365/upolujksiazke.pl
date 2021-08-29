import {Connection, EntityManager, In} from 'typeorm';
import {Injectable} from '@nestjs/common';
import * as R from 'ramda';

import {
  forwardTransaction,
  upsert,
  UpsertResourceAttrs,
} from '@server/common/helpers/db';

import {BookSummaryKind, ImageVersion} from '@shared/enums';
import {RemoteArticleService} from '@server/modules/remote/service/RemoteArticle.service';
import {CreateBookSummaryDto} from './dto';
import {BookSummaryEntity, BookSummaryHeaderEntity} from './entity';

@Injectable()
export class BookSummaryService {
  public static readonly BOOK_SUMMARY_CARD_FIELDS = [
    'summary.id', 'summary.kind',

    'article.title', 'article.publishDate', 'article.description',
    'cover.version', 'attachment.file',

    'websiteLogo.version', 'websiteAttachment.file',
    'website.id', 'website.hostname', 'website.url',
  ];

  constructor(
    private readonly connection: Connection,
    private readonly articleService: RemoteArticleService,
  ) {}

  /**
   * Fetches N summaries for book
   *
   * @todo
   *  Add card select fields! There is bug in selection!
   *
   * @param {Object} attrs
   * @memberof BookSummaryService
   */
  async findBookSummaries(
    {
      bookId,
      limit,
      kinds,
    }: {
      bookId: number,
      limit: number,
      kinds?: BookSummaryKind[],
    },
  ) {
    const summaries = await (
      BookSummaryEntity
        .createQueryBuilder('summary')
        .select(BookSummaryService.BOOK_SUMMARY_CARD_FIELDS)
        .where(
          {
            bookId,
            ...!R.isNil(kinds) && {
              kind: In(kinds),
            },
          },
        )

        .innerJoinAndSelect('summary.article', 'article')
        .leftJoinAndSelect('article.cover', 'cover', `cover.version = '${ImageVersion.PREVIEW}'`)
        .leftJoinAndSelect('cover.attachment', 'attachment')

        .innerJoinAndSelect('article.website', 'website')
        .leftJoinAndSelect('website.logo', 'websiteLogo', `websiteLogo.version = '${ImageVersion.SMALL_THUMB}'`)
        .leftJoinAndSelect('websiteLogo.attachment', 'websiteAttachment')

        .take(limit)
        .getMany()
    );

    const headers = R.groupBy(R.prop('summaryId') as any, await (
      BookSummaryHeaderEntity
        .createQueryBuilder('header')
        .where(
          {
            summaryId: In(R.pluck('id', summaries)),
          },
        )
        .getMany()
    ));

    summaries.forEach((summary) => {
      summary.headers = headers[summary.id] || [];
    });

    return summaries;
  }

  /**
   * Deletes multiple summaries
   *
   * @see
   *  There is no need to remove summary after remove article due to cascade
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookSummaryService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      articleService,
    } = this;

    const entities = await BookSummaryEntity.findByIds(
      ids,
      {
        select: ['articleId'],
      },
    );

    await forwardTransaction(
      {
        connection,
        entityManager,
      },
      (transaction) => articleService.delete(
        R.pluck('articleId', entities),
        transaction,
      ),
    );
  }

  /**
   * Create or update summary
   *
   * @param {CreateBookSummaryDto} dto
   * @param {UpsertResourceAttrs} [attrs={}]
   * @returns {Promise<BookSummaryEntity>}
   * @memberof BookSummaryService
   */
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

      const upsertedSummary = await upsert(
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

      if (headers?.length > 0) {
        upsertedSummary.headers = await upsert(
          {
            connection,
            constraint: 'book_summary_header_unique_slug_url',
            entityManager: transaction,
            Entity: BookSummaryHeaderEntity,
            data: headers.map(
              (header) => new BookSummaryHeaderEntity(
                {
                  ...header,
                  summaryId: upsertedSummary.id,
                },
              ),
            ),
          },
        );
      }

      return upsertedSummary;
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
