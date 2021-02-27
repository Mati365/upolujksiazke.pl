import {Injectable, Logger} from '@nestjs/common';
import {plainToClass} from 'class-transformer';
import * as R from 'ramda';

import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {ScrapperMetadataEntity} from '@scrapper/entity/ScrapperMetadata.entity';
import {MetadataDbLoader} from '@db-loader/MetadataDbLoader.interface';
import {FuzzyBookSearchService} from '@server/modules/book/FuzzyBookSearch.service';
import {BookReviewService} from '@server/modules/book/modules/review/BookReview.service';
import {ScrapperService} from '../../modules/scrapper/service/Scrapper.service';
import {BookDbLoaderService} from './Book.loader';

@Injectable()
export class BookReviewDbLoaderService implements MetadataDbLoader {
  private readonly logger = new Logger(BookReviewDbLoaderService.name);

  constructor(
    private readonly scrapperService: ScrapperService,
    private readonly bookDbLoader: BookDbLoaderService,
    private readonly fuzzyBookSearchService: FuzzyBookSearchService,
    private readonly bookReviewService: BookReviewService,
  ) {}

  /**
   * @inheritdoc
   */
  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const {logger, bookReviewService} = this;

    if (!metadata?.content) {
      logger.warn('Missing metadata content!');
      return;
    }

    const review = await this.parseAndAssignBook(metadata);
    if (!review)
      return;

    await bookReviewService.upsert([review]);
  }

  /**
   * Converts json to review dto and search book attached to it
   *
   * @param {ScrapperMetadataEntity} metadata
   * @returns
   * @memberof BookReviewDbLoaderService
   */
  async parseAndAssignBook(metadata: ScrapperMetadataEntity) {
    const {
      // fuzzyBookSearchService,
      scrapperService,
      bookDbLoader,
      logger,
    } = this;

    let review = plainToClass(CreateBookReviewDto, metadata.content);
    let book = null; // await fuzzyBookSearchService.findAlreadyCachedReviewBook(review); fixme

    if (!book) {
      book = await bookDbLoader.searchAndExtractToDb(
        review.book,
        {
          skipIfAlreadyInDb: true,
          skipCacheLookup: true,
        },
      );
    }

    if (!book) {
      logger.warn(`Unable to match review book with title "${review.book.title}"!`);
      return null;
    }

    if (R.isNil(review.releaseId)) {
      const isbn = review.getReleaseISBN();
      if (!R.isNil(isbn)) {
        review = new CreateBookReviewDto(
          {
            ...review,
            releaseId: (
              book.releases?.find(R.propEq('isbn', isbn))?.id
            ),
          },
        );
      }
    }

    return new CreateBookReviewDto(
      {
        ...review,
        bookId: book.id,
        websiteId: (
          metadata.websiteId
            ?? metadata.website?.id
            ?? (await scrapperService.findOrCreateWebsiteByUrl(review.url))?.id
        ),
      },
    );
  }
}
