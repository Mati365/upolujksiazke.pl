import {Connection} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {upsert} from '@server/common/helpers/db';

import {BookReviewerEntity} from '@server/modules/book-reviewer/BookReviewer.entity';
import {
  ScrapperMetadataEntity,
  ScrapperRemoteEntity,
} from '../../scrapper/entity';

import {BookReviewAuthor, BookReviewScrapperInfo} from '../../scrapper/service/scrappers/BookReview.scrapper';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';

@Injectable()
export class BookReviewDbLoader implements MetadataDbLoader {
  constructor(
    private readonly connection: Connection,
  ) {}

  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const content = metadata.content as BookReviewScrapperInfo;
    const {websiteId} = metadata.remote;

    await Promise.all(
      [
        this.extractReviewerToDb(
          {
            author: content.author,
            websiteId,
          },
        ),
      ],
    );
  }

  /**
   * Finds or creates reviewer record in DB
   *
   * @private
   * @param {Object} attrs
   * @returns
   * @memberof BookReviewDbLoader
   */
  private async extractReviewerToDb(
    {
      author,
      websiteId,
    }: {
      author: BookReviewAuthor,
      websiteId: number,
    },
  ) {
    const {connection} = this;
    const id = author.id ?? author.name;

    const remoteEntity = await upsert(
      {
        connection,
        Entity: ScrapperRemoteEntity,
        constraint: 'unique_remote_entry',
        data: new ScrapperRemoteEntity(
          {
            remoteId: id,
            websiteId,
          },
        ),
      },
    );

    return upsert(
      {
        connection,
        Entity: BookReviewerEntity,
        primaryKey: 'remoteId',
        data: new BookReviewerEntity(
          {
            gender: author.gender,
            name: author.name,
            remote: remoteEntity,
          },
        ),
      },
    );
  }
}
