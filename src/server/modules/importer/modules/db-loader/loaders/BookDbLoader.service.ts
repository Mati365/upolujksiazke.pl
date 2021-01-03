import {
  Inject, Injectable,
  Logger, forwardRef,
} from '@nestjs/common';

import {BookService} from '@server/modules/book/Book.service';
import {BookEntity, CreateBookDto} from '@server/modules/book';
import {CreateBookAuthorDto} from '@server/modules/book/modules/author/dto/CreateBookAuthor.dto';
import {ScrapperMetadataEntity, ScrapperMetadataKind} from '../../scrapper/entity';

import {BookScrapperInfo} from '../../scrapper/service/scrappers/Book.scrapper';
import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {ScrapperMatcherService} from '../../scrapper/service/actions';

@Injectable()
export class BookDbLoader implements MetadataDbLoader {
  private readonly logger = new Logger(BookDbLoader.name);

  constructor(
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
    private readonly scrapperMatcherService: ScrapperMatcherService,
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
    const {logger, bookService, scrapperMatcherService} = this;

    if (BookDbLoader.isIncompleteBookScrapperInfo(book)) {
      const matchedBook = await scrapperMatcherService.matchSingle<CreateBookDto>(
        {
          kind: ScrapperMetadataKind.BOOK,
          data: book,
        },
      );

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
          description: book.description,
          tags: book.tags,
          title: book.title,
          authors: book.authors.map(
            (author) => new CreateBookAuthorDto(author),
          ),
        },
      ),
    );
  }
}
