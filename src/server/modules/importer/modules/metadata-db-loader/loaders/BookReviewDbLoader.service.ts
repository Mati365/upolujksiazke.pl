import {Connection} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {upsert} from '@server/common/helpers/db';

import {BookReviewerEntity} from '@server/modules/book-reviewer/BookReviewer.entity';
import {
  ScrapperMetadataEntity,
  ScrapperWebsiteEntity,
} from '../../scrapper/entity';

import {BookReviewAuthor, BookReviewScrapperInfo} from '../../scrapper/service/scrappers/BookReviewScrapper';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';

@Injectable()
export class BookReviewDbLoader implements MetadataDbLoader {
  constructor(
    private readonly connection: Connection,
  ) {}

  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const content = metadata.content as BookReviewScrapperInfo;
    const {website} = metadata;

    await Promise.all(
      [
        this.extractReviewerToDb(
          {
            author: content.author,
            website,
          },
        ),

        this.extractBookToDb(),
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
  private extractReviewerToDb(
    {
      author, // eslint-disable-line
      website, // eslint-disable-line
    }: {
      author: BookReviewAuthor,
      website: ScrapperWebsiteEntity,
    },
  ) {
    const {connection} = this;
    const id = author.id ?? author.name;

    return upsert(
      {
        connection,
        Entity: BookReviewerEntity,
        constraint: 'unique_remote_entry',
        data: new BookReviewerEntity(
          {
            gender: author.gender,
            name: author.name,
            remoteId: id,
            website,
          },
        ),
      },
    );
  }

  /**
   * Finds or creates book record in db
   *
   * @private
   * @returns
   * @memberof BookReviewDbLoader
   */
  private extractBookToDb() {
    return null;
  }
}
