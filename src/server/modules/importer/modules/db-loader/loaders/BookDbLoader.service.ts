import * as R from 'ramda';
import {In} from 'typeorm';
import {
  Inject, Injectable,
  Logger, forwardRef,
} from '@nestjs/common';

import {mergeWithoutNulls} from '@shared/helpers/mergeWithoutNulls';

import {BookService} from '@server/modules/book/Book.service';
import {CreateBookDto} from '@server/modules/book';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
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
   * @todo
   *  - Pick only title with lowest length!
   *  - Merge properties
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

    const matchedBooks = R.pluck(
      'result',
      await scrapperMatcherService.searchRemoteRecord<CreateBookDto>(
        {
          kind: ScrapperMetadataKind.BOOK,
          data: book,
        },
      ),
    );

    if (R.isEmpty(matchedBooks)) {
      logger.warn(`Book ${JSON.stringify(book)} not matched!`);
      return null;
    }

    const allReleases = R.unnest(R.pluck('releases', matchedBooks));
    const releaseBook = (
      await BookReleaseEntity.findOne(
        {
          select: ['bookId'],
          where: [
            {
              title: In(R.pluck('title', allReleases)),
            },
            {
              isbn: In(R.pluck('isbn', allReleases)),
            },
          ],
        },
      )
    );

    const websites = await scrapperService.findOrCreateWebsitesByUrls(
      R.pluck(
        'url',
        R.unnest(R.pluck('availability', allReleases)),
      ),
    );

    const releases = (
      allReleases
        .filter(({isbn}) => !!isbn)
        .map((release) => new CreateBookReleaseDto(
          {
            ...release,
            availability: release.availability.map(
              (availability) => new CreateBookAvailabilityDto(
                {
                  ...availability,
                  bookId: releaseBook?.id,
                  websiteId: websites[
                    scrapperService.getScrappersGroupByWebsiteURL(availability.url).websiteURL
                  ].id,
                },
              ),
            ),
          },
        ))
    );

    return bookService.upsert(
      new CreateBookDto(
        {
          id: releaseBook?.id,
          ...mergeWithoutNulls(matchedBooks),
          releases,
        },
      ),
    );
  }
}
