import {Injectable} from '@nestjs/common';
import {Connection} from 'typeorm';
import sequential from 'promise-sequential';
import * as R from 'ramda';

import {upsert} from '@server/common/helpers/db';

import {TagService} from '../tag/Tag.service';
import {BookAuthorService} from './modules/author/BookAuthor.service';
import {BookReleaseService} from './modules/release/BookRelease.service';
import {BookCategoryService} from './modules/category';

import {CreateBookDto} from './dto/CreateBook.dto';
import {CreateBookReleaseDto} from './modules/release/dto/CreateBookRelease.dto';
import {BookEntity} from './Book.entity';

@Injectable()
export class BookService {
  constructor(
    private readonly connection: Connection,
    private readonly tagService: TagService,
    private readonly authorService: BookAuthorService,
    private readonly releaseService: BookReleaseService,
    private readonly categoryService: BookCategoryService,
  ) {}

  /**
   * Creates or updates single book
   *
   * @param {CreateBookDto} dto
   * @returns {Promise<BookEntity>}
   * @memberof BookService
   */
  async upsert(dto: CreateBookDto): Promise<BookEntity> {
    const {connection} = this;

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
            conflictKeys: '(lower("defaultTitle"))',
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

      await releaseService.upsertList(
        await sequential(
          dto.releases.map(
            (release) => async () => new CreateBookReleaseDto(
              {
                ...release,
                bookId: book.id,
              },
            ),
          ),
        ),
        transaction,
      );

      return book;
    });
  }
}
