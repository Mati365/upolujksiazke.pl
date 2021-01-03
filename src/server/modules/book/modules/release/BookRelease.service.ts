import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';

import {upsert} from '@server/common/helpers/db';
import {CreateBookReleaseDto} from './dto/CreateBookRelease.dto';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookPublisherService} from '../publisher/BookPublisher.service';

@Injectable()
export class BookReleaseService {
  constructor(
    private readonly connection: Connection,
    private readonly publisherService: BookPublisherService,
  ) {}

  /**
   * Creates signle book category
   *
   * @param {CreateBookCategoryDto} dto
   * @returns {Promise<BookReleaseEntity>}
   * @memberof BookReleaseService
   */
  create(dto: CreateBookReleaseDto): Promise<BookReleaseEntity> {
    return BookReleaseEntity.save(
      BookReleaseEntity.create(dto),
    );
  }

  /**
   * Inserts or updates remote entity
   *
   * @param {CreateRemoteRecordDto} dto
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookReleaseEntity>}
   * @memberof BookReleaseService
   */
  async upsert(dto: CreateBookReleaseDto, entityManager?: EntityManager): Promise<BookReleaseEntity> {
    const {connection, publisherService} = this;

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookReleaseEntity,
        constraint: 'unique_publisher_isbn',
        data: new BookReleaseEntity(
          {
            ...dto,
            publisher: await publisherService.upsert(dto.publisher),
          },
        ),
      },
    );
  }
}
