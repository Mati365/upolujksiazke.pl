import {Injectable, Logger} from '@nestjs/common';
import {SelectQueryBuilder} from 'typeorm';
import {plainToClass} from 'class-transformer';
// import {validate} from 'class-validator';
import * as R from 'ramda';

import {CreateBookReviewDto} from '@server/modules/book/modules/review/dto/CreateBookReview.dto';
import {ScrapperMetadataEntity} from '@scrapper/entity/ScrapperMetadata.entity';
import {BookEntity} from '@server/modules/book/Book.entity';

import {MetadataDbLoader} from '@db-loader/MetadataDbLoader.interface';
import {BookService} from '@server/modules/book/Book.service';
import {BookReviewService} from '@server/modules/book/modules/review/BookReview.service';
import {BookDbLoaderService} from './BookDbLoader.service';

@Injectable()
export class BookReviewDbLoaderService implements MetadataDbLoader {
  private readonly logger = new Logger(BookReviewDbLoaderService.name);

  constructor(
    private readonly bookDbLoader: BookDbLoaderService,
    private readonly bookService: BookService,
    private readonly bookReviewService: BookReviewService,
  ) {}

  /**
   * @inheritdoc
   */
  async extractMetadataToDb(metadata: ScrapperMetadataEntity) {
    const review = await this.parseAndAssignBook(metadata);
    if (!review)
      return;

    // const validatorErrors = await validate(
    //   new CreateBookReviewDto(R.omit(['book'], review)),
    // );

    // if (validatorErrors.length) {
    //   console.info(validatorErrors);
    //   logger.warn('Unable to load review due to missing fields!');
    // }

    console.info(metadata);
    await this.bookReviewService.upsert([review]);
  }

  /**
   * Converts json to review dto and search book attached to it
   *
   * @param {ScrapperMetadataEntity} metadata
   * @returns
   * @memberof BookReviewDbLoaderService
   */
  async parseAndAssignBook(metadata: ScrapperMetadataEntity) {
    const {bookDbLoader, logger} = this;
    let review = plainToClass(CreateBookReviewDto, metadata.content);
    let book = await this.findAlreadyCachedReviewBook(review);

    if (!book)
      book = await bookDbLoader.searchAndExtractToDb(review.book);

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
            releaseId: book.releases.find(R.propEq('isbn', 'isbn'))?.id,
          },
        );
      }
    }

    return new CreateBookReviewDto(
      {
        ...review,
        bookId: book.id,
        websiteId: metadata.websiteId ?? metadata.website?.id,
      },
    );
  }

  /**
   * Looks for book in database and tries to match it to review
   *
   * @param {CreateBookReviewDto} {book, bookId, releaseId}
   * @returns
   * @memberof BookReviewDbLoaderService
   */
  findAlreadyCachedReviewBook({book, bookId, releaseId}: CreateBookReviewDto) {
    const {bookService} = this;
    let query: SelectQueryBuilder<BookEntity> = null;

    if (R.isNil(releaseId) || !R.isNil(bookId)) {
      const id = bookId ?? book?.id;

      query = (
        R.isNil(id)
          ? bookService.createSimilarNamedQuery(book.title)
          : BookEntity.createQueryBuilder('book').where({id})
      );
    } else {
      query = (
        BookEntity
          .createQueryBuilder('book')
          .where('release.id = :id', {id: releaseId})
      );
    }

    return (
      query
        .innerJoinAndSelect('book.releases', 'release')
        .select(['release.id', 'release.isbn', 'book.id'])
        .getOne()
    );
  }
}
