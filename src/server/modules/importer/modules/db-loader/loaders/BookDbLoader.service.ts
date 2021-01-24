import * as R from 'ramda';
import {In} from 'typeorm';
import {
  Inject, Injectable,
  Logger, forwardRef,
} from '@nestjs/common';

import {BookService} from '@server/modules/book/Book.service';
import {BookEntity, CreateBookDto} from '@server/modules/book';
import {CreateBookAvailabilityDto} from '@server/modules/book/modules/availability/dto/CreateBookAvailability.dto';
import {BookReleaseEntity} from '@server/modules/book/modules/release/BookRelease.entity';
import {ScrapperMetadataEntity, ScrapperMetadataKind} from '../../scrapper/entity';

import {MetadataDbLoader} from '../MetadataDbLoader.interface';
import {ScrapperMatcherService} from '../../scrapper/service/actions';
import {ScrapperService} from '../../scrapper/service/Scrapper.service';

@Injectable()
export class BookDbLoader implements MetadataDbLoader {
  private readonly logger = new Logger(BookDbLoader.name);

  constructor(
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
    private readonly scrapperMatcherService: ScrapperMatcherService,
    private readonly scrapperService: ScrapperService,
  ) {}

  /**
   * Checks if book should be matcher using matcher
   *
   * @todo
   *  Use validators!
   *
   * @static
   * @param {CreateBookDto} book
   * @returns
   * @memberof BookDbLoader
   */
  static isIncompleteBookScrapperDto(book: CreateBookDto) {
    return (
      !book.authors
        || !book.releases
        || !book.releases.length
        || !book.releases[0].description
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
      book: CreateBookDto,
    },
  ) {
    const {
      logger, bookService,
      scrapperMatcherService,
      scrapperService,
    } = this;

    if (!BookDbLoader.isIncompleteBookScrapperDto(book))
      return null; // dump cache?

    const matchedBook = await scrapperMatcherService.searchRemoteRecord<CreateBookDto>(
      {
        kind: ScrapperMetadataKind.BOOK,
        data: book,
      },
    );

    if (!matchedBook) {
      logger.warn(`Book ${JSON.stringify(book)} not matched!`);
      return null;
    }

    if (!matchedBook.cached) {
      const {result} = matchedBook;
      const releaseBook = (
        await BookReleaseEntity.findOne(
          {
            relations: ['book'],
            where: {
              title: In(R.pluck('title', result.releases)),
            },
          },
        )
      )?.book;

      const availability = await Promise.all(
        result.availability.map(
          async (release) => new CreateBookAvailabilityDto(
            {
              ...release,
              bookId: releaseBook?.id,
              websiteId: (
                await scrapperService.findOrCreateWebsiteByUrl(release.url)
              ).id,
            },
          ),
        ),
      );

      return bookService.upsert(
        new CreateBookDto(
          {
            id: releaseBook?.id,
            ...result,
            availability,
          },
        ),
      );
    }

    return BookEntity.findOne(matchedBook.result.id);
  }
}
