import {Injectable} from '@nestjs/common';
import {Connection} from 'typeorm';

import {upsert} from '@server/common/helpers/db';

import {BookCategoryEntity} from '@server/modules/book-category/BookCategory.entity';
import {ScrapperMetadataEntity} from '../../scrapper/entity';

import {BookScrapperInfo} from '../../scrapper/service/scrappers/Book.scrapper';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';

@Injectable()
export class BookDbLoader implements MetadataDbLoader {
  constructor(
    private readonly connection: Connection,
  ) {}

  /* eslint-disable @typescript-eslint/no-unused-vars */
  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    throw new Error('Not implemented!');
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  /**
   * Finds or creates book record in DB
   *
   * @param {Object} attrs
   * @memberof BookDbLoader
   */
  async extractBookToDb(
    {
      book,
      // websiteId,
    }: {
      book: BookScrapperInfo,
      websiteId: number,
    },
  ) {
    return this.extractCategoriesIntoDB(book.categories);
  }

  /**
   * Finds or crates book categories categories in DB
   *
   * @param {string[]} names
   * @memberof BookDbLoader
   */
  async extractCategoriesIntoDB(names: string[]) {
    if (!names?.length)
      return;

    const {connection} = this;
    await upsert(
      {
        connection,
        Entity: BookCategoryEntity,
        primaryKey: 'name',
        data: names.map((name) => new BookCategoryEntity(
          {
            name,
          },
        )),
      },
    );
  }
}
