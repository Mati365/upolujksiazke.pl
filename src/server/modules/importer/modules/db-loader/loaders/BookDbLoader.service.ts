import {
  Inject, Injectable,
  Logger, forwardRef,
} from '@nestjs/common';

import {BookService} from '@server/modules/book/Book.service';
import {BookEntity, CreateBookDto} from '@server/modules/book';
import {ScrapperMetadataEntity} from '../../scrapper/entity';

import {BookScrapperInfo} from '../../scrapper/service/scrappers/Book.scrapper';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {BookMatcherService} from '../../book-matcher/BookMatcher.service';

@Injectable()
export class BookDbLoader implements MetadataDbLoader {
  private readonly logger = new Logger(BookDbLoader.name);

  constructor(
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
    private readonly bookMatcherService: BookMatcherService,
  ) {}

  /**
   * Checks if book should be matcher using matcher
   *
   * @static
   * @param {BookScrapperInfo} book
   * @returns
   * @memberof BookDbLoader
   */
  static isIncompleteBookScrapperInfo(book: BookScrapperInfo) {
    return (
      !book.authors
        || !book.description
        || !book.isbn
        || !book.title
    );
  }

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
    const {logger, bookService, bookMatcherService} = this;

    if (BookDbLoader.isIncompleteBookScrapperInfo(book)) {
      const matchedBook = await bookMatcherService.matchBook(book);
      if (!matchedBook) {
        logger.warn(`Book ${JSON.stringify(book)} not matched!`);
        return null;
      }

      if (!matchedBook.cached)
        return bookService.upsert(matchedBook.result);

      return BookEntity.findOne(matchedBook.result.id);
    }

    return bookService.upsert(
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
