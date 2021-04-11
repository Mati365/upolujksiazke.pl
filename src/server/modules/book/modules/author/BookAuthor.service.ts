import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {groupRawMany, upsert} from '@server/common/helpers/db';
import {BookAuthorEntity} from './BookAuthor.entity';
import {CreateBookAuthorDto} from './dto/CreateBookAuthor.dto';

@Injectable()
export class BookAuthorService {
  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Find authors for multiple books
   *
   * @param {number[]} bookIds
   * @returns
   * @memberof BookEraService
   */
  async findBooksAuthors(bookIds: number[]) {
    const items = await (
      BookAuthorEntity
        .createQueryBuilder('b')
        .innerJoin(
          'book_authors_book_author',
          'ba',
          'ba.bookId in (:...bookIds) and ba.bookAuthorId = b.id',
          {
            bookIds,
          },
        )
        .select(
          [
            'b.id as "id"',
            'b.name as "name"',
            'b.parameterizedName as "parameterizedName"',
            'ba.bookId as "bookId"',
          ],
        )
        .getRawMany()
    );

    return groupRawMany(
      {
        items,
        key: 'bookId',
        mapperFn: (item) => new BookAuthorEntity(item),
      },
    );
  }

  /**
   * Find authors for books
   *
   * @param {number} bookId
   * @returns
   * @memberof BookCategoryService
   */
  async findBookAuthors(bookId: number) {
    return (await this.findBooksAuthors([bookId]))[bookId] || [];
  }

  /**
   * Create single book author
   *
   * @param {CreateBookAuthorDto} dto
   * @returns {Promise<BookAuthorEntity>}
   * @memberof BookAuthorService
   */
  create(dto: CreateBookAuthorDto): Promise<BookAuthorEntity> {
    return BookAuthorEntity.save(
      BookAuthorEntity.create(dto),
    );
  }

  /**
   * Create or update array of books authors
   *
   * @param {CreateBookAuthorDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookAuthorEntity[]>}
   * @memberof BookAuthorService
   */
  async upsert(dtos: CreateBookAuthorDto[], entityManager?: EntityManager): Promise<BookAuthorEntity[]> {
    if (!dtos?.length)
      return [];

    const {connection} = this;
    return upsert(
      {
        connection,
        entityManager,
        Entity: BookAuthorEntity,
        primaryKey: 'parameterizedName',
        data: dtos.map((dto) => new BookAuthorEntity(dto)),
      },
    );
  }
}
