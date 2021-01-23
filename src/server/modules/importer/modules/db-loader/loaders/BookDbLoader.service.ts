import * as R from 'ramda';
import {In} from 'typeorm';
import {
  Inject, Injectable,
  Logger, forwardRef,
} from '@nestjs/common';

import {BookService} from '@server/modules/book/Book.service';
import {BookEntity, CreateBookDto} from '@server/modules/book';
import {CreateBookReleaseDto} from '@server/modules/book/modules/release/dto/CreateBookRelease.dto';
import {CreateRemoteRecordDto} from '@server/modules/remote/dto/CreateRemoteRecord.dto';
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
      const releases = await Promise.all(
        result.releases.map(
          async (release) => new CreateBookReleaseDto(
            {
              ...release,
              remoteDescription: new CreateRemoteRecordDto(
                {
                  ...release.remoteDescription,
                  websiteId: (
                    await scrapperService.findOrCreateWebsiteByUrl(release.remoteDescription.url)
                  ).id,
                },
              ),
            },
          ),
        ),
      );

      // todo: It seems to be slow, optimize
      const releaseBook = (
        await BookReleaseEntity.findOne(
          {
            relations: ['book'],
            where: {
              title: In(R.pluck('title', releases)),
            },
          },
        )
      )?.book;

      return bookService.upsert(
        new CreateBookDto(
          {
            id: releaseBook?.id,
            ...result,
            releases,
          },
        ),
      );
    }

    return BookEntity.findOne(matchedBook.result.id);
  }
}
