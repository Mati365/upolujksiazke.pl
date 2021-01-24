import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import * as R from 'ramda';

import {
  forwardTransaction,
  upsert,
} from '@server/common/helpers/db';

import {TagService} from '../tag/Tag.service';
import {BookAuthorService} from './modules/author/BookAuthor.service';
import {BookReleaseService} from './modules/release/BookRelease.service';
import {BookCategoryService} from './modules/category';
import {BookAvailabilityService} from './modules/availability/BookAvailability.service';

import {CreateBookDto} from './dto/CreateBook.dto';
import {CreateBookReleaseDto} from './modules/release/dto/CreateBookRelease.dto';
import {CreateBookAvailabilityDto} from './modules/availability/dto/CreateBookAvailability.dto';
import {BookEntity} from './Book.entity';

@Injectable()
export class BookService {
  constructor(
    private readonly connection: Connection,
    private readonly tagService: TagService,
    private readonly authorService: BookAuthorService,
    private readonly releaseService: BookReleaseService,
    private readonly categoryService: BookCategoryService,
    private readonly availabilityService: BookAvailabilityService,
  ) {}

  /**
   * Remove single book release
   *
   * @param {number[]} ids
   * @param {EntityManager} [entityManager]
   * @memberof BookService
   */
  async delete(ids: number[], entityManager?: EntityManager) {
    const {
      connection,
      availabilityService,
      releaseService,
    } = this;

    const entities = await BookEntity.findByIds(
      ids,
      {
        select: ['id'],
        loadRelationIds: {
          relations: ['releases', 'availability'],
        },
      },
    );

    await forwardTransaction({connection, entityManager}, async (transaction) => {
      for await (const entity of entities) {
        await releaseService.delete(entity.releases as any[], transaction);
        await availabilityService.delete(entity.availability as any[], transaction);
      }

      await transaction.remove(entities);
    });
  }

  /**
   * Creates or updates single book
   *
   * @param {CreateBookDto} dto
   * @returns {Promise<BookEntity>}
   * @memberof BookService
   */
  async upsert(dto: CreateBookDto): Promise<BookEntity> {
    const {
      connection,
      availabilityService,
    } = this;

    return connection.transaction(async (transaction) => {
      const {
        tagService, authorService,
        releaseService, categoryService,
      } = this;

      const [
        authors,
        tags,
        categories,
      ] = (
        [
          await authorService.upsertList(dto.authors, transaction),
          await tagService.upsertList(dto.tags, transaction),
          await categoryService.upsertList(dto.categories, transaction),
        ]
      );

      let book: BookEntity = null;
      if (R.isNil(dto.id)) {
        book = await upsert(
          {
            connection,
            entityManager: transaction,
            primaryKey: 'defaultTitle',
            Entity: BookEntity,
            data: new BookEntity(
              {
                defaultTitle: dto.defaultTitle,
                originalTitle: dto.originalTitle,
                originalPublishDate: dto.originalPublishDate,
                authors,
                tags,
                categories,
              },
            ),
          },
        );
      } else {
        book = new BookEntity(
          {
            id: dto.id,
          },
        );
      }

      await availabilityService.upsertList(
        dto.availability.map(
          (availability) => new CreateBookAvailabilityDto(
            {
              ...availability,
              bookId: book.id,
            },
          ),
        ),
        transaction,
      );

      await releaseService.upsertList(
        dto.releases.map(
          (release) => new CreateBookReleaseDto(
            {
              ...release,
              bookId: book.id,
            },
          ),
        ),
        transaction,
      );

      return book;
    });
  }
}
