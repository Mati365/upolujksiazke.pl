import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

// import {RemoteRecordDto} from '../remote/dto/RemoteRecord.dto';
// import {RemoteRecordService} from '../remote/service/RemoteRecord.service';

import {BookAuthorService} from './modules/author/BookAuthor.service';
import {TagService} from '../tag/Tag.service';

import {CreateTagDto} from '../tag/dto/CreateTag.dto';
import {CreateBookDto} from './dto/CreateBook.dto';
import {CreateBookAuthorDto} from './modules/author/dto/CreateBookAuthor.dto';

import {BookEntity} from './Book.entity';

@Injectable()
export class BookService {
  constructor(
    private readonly connection: Connection,
    private tagService: TagService,
    private authorService: BookAuthorService,
  ) {}

  async createBookEntityFromDTO(dto: CreateBookDto, entityManager?: EntityManager) {
    const {tagService, authorService} = this;
    const authors = await authorService.upsertList(
      (dto.authors || []).map((author) => new CreateBookAuthorDto(author)),
      entityManager,
    );

    const tags = await tagService.upsertList(
      (dto.tags || []).map((tag) => new CreateTagDto(
        {
          name: tag,
        },
      )),
      entityManager,
    );

    const releases = [];

    return new BookEntity(
      {
        title: dto.title,
        description: dto.description,
        authors,
        releases,
        tags,
      },
    );
  }

  /**
   * Creates or updates single book
   *
   * @param {CreateBookDto} dto
   * @returns {Promise<BookEntity>}
   * @memberof BookService
   */
  async upsert(dto: CreateBookDto): Promise<BookEntity> {
    const {connection} = this;

    return connection.transaction(
      async (transaction) => upsert(
        {
          connection,
          entityManager: transaction,
          Entity: BookEntity,
          primaryKey: 'title',
          data: await this.createBookEntityFromDTO(dto, transaction),
        },
      ),
    );
  }
}
