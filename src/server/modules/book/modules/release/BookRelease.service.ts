import {Injectable} from '@nestjs/common';
import {Connection, EntityManager} from 'typeorm';
import sequential from 'promise-sequential';

import {upsert} from '@server/common/helpers/db';

import {RemoteRecordService} from '@server/modules/remote/service/RemoteRecord.service';
import {CreateBookReleaseDto} from './dto/CreateBookRelease.dto';
import {BookReleaseEntity} from './BookRelease.entity';
import {BookPublisherService} from '../publisher/BookPublisher.service';

@Injectable()
export class BookReleaseService {
  constructor(
    private readonly connection: Connection,
    private readonly publisherService: BookPublisherService,
    private readonly remoteRecordService: RemoteRecordService,
  ) {}

  /**
   * Creates signle book category
   *
   * @param {CreateBookCategoryDto} dto
   * @returns {Promise<BookReleaseEntity>}
   * @memberof BookReleaseService
   */
  create({cover, ...dto}: CreateBookReleaseDto): Promise<BookReleaseEntity> {
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
  async upsert(
    {
      cover, remoteDescription, publisher,
      remoteDescriptionId, publisherId,
      ...dto
    }: CreateBookReleaseDto, entityManager?: EntityManager,
  ): Promise<BookReleaseEntity> {
    const {connection, publisherService, remoteRecordService} = this;

    return upsert(
      {
        entityManager,
        connection,
        Entity: BookReleaseEntity,
        constraint: 'unique_publisher_edition',
        data: new BookReleaseEntity(
          {
            ...dto,

            remoteDescriptionId: remoteDescriptionId ?? (
              await (remoteDescription && remoteRecordService?.upsert(remoteDescription, entityManager))
            )?.id,

            publisherId: publisherId ?? (
              await (publisher && publisherService.upsert(publisher, entityManager))
            )?.id,
          },
        ),
      },
    );
  }

  /**
   * Create or update array of books releases
   *
   * @param {CreateBookReleaseDto[]} dtos
   * @param {EntityManager} [entityManager]
   * @returns {Promise<BookReleaseEntity[]>}
   * @memberof BookReleaseService
   */
  async upsertList(dtos: CreateBookReleaseDto[], entityManager?: EntityManager): Promise<BookReleaseEntity[]> {
    if (!dtos?.length)
      return [];

    // do not use Promise.all! It breaks typeorm!
    return sequential(
      dtos.map(
        (item) => () => Promise.resolve(
          this.upsert(item, entityManager),
        ),
      ),
    );
  }
}
