import {Inject, Injectable, forwardRef} from '@nestjs/common';

import {BookService} from '@server/modules/book/Book.service';
import {CreateBookDto} from '@server/modules/book';
import {ScrapperMetadataEntity} from '../../scrapper/entity';

import {BookScrapperInfo} from '../../scrapper/service/scrappers/Book.scrapper';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';

@Injectable()
export class BookDbLoader implements MetadataDbLoader {
  constructor(
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
  ) {}

  /* eslint-disable @typescript-eslint/no-unused-vars */
  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    throw new Error('Not implemented!');
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  /**
   * Load book into database
   *
   * @param {Object} attrs
   * @memberof BookDbLoader
   */
  async extractBookToDb(
    {
      book,
    }: {
      book: BookScrapperInfo,
    },
  ) {
    await this.bookService.upsert(
      new CreateBookDto(
        {
          authors: book.authors,
          description: book.description,
          isbn: book.isbn,
          tags: book.tags,
          title: book.title,
        },
      ),
    );
  }
}
