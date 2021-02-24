import {Injectable} from '@nestjs/common';
import {FindOneOptions, In, SelectQueryBuilder} from 'typeorm';
import * as R from 'ramda';

import {parameterize} from '@shared/helpers/parameterize';

import {CreateBookDto} from './dto/CreateBook.dto';
import {CreateBookReviewDto} from './modules/review/dto/CreateBookReview.dto';
import {BookEntity} from './Book.entity';
import {BookReleaseEntity} from './modules/release/BookRelease.entity';

@Injectable()
export class FuzzyBookSearchService {
  /**
   * Finds book with similar title
   *
   * @param {string} title
   * @param {number} [similarity=2]
   * @returns
   * @memberof FuzzyBookSearchService
   */
  createSimilarNamedQuery(title: string, similarity: number = 2) {
    return (
      BookEntity
        .createQueryBuilder('book')
        .where(
          'levenshtein("parameterizedSlug", :title) <= :similarity',
          {
            title: parameterize(title),
            similarity,
          },
        )
    );
  }

  /**
   * Find book based on multiple dtos
   *
   * @param {CreateBookDto[]} books
   * @returns
   * @memberof FuzzyBookSearchService
   */
  async findAlreadyCachedSimilarToBooks(books: CreateBookDto[]) {
    const allReleases = R.unnest(R.pluck('releases', books));
    let book = (await BookReleaseEntity.findOne(
      {
        relations: ['book'],
        where: [
          {
            title: In(R.pluck('title', allReleases)),
          },
          {
            isbn: In(R.pluck('isbn', allReleases)),
          },
        ],
      },
    ))?.book;

    if (R.isNil(book)) {
      book = (await BookEntity.findOne(
        {
          where: R.chain(
            (dto): FindOneOptions<BookEntity>['where'][] => [
              {
                parameterizedSlug: In(
                  [
                    dto.genSlug(),
                    ...R.map(
                      (author) => dto.genSlug(author.name),
                      dto.authors || [],
                    ),
                  ],
                ),
              },
            ],
            books,
          ),
        },
      ));
    }

    return {
      allReleases,
      book,
    };
  }

  /**
   * Looks for book in database and tries to match it to review
   *
   * @param {(Pick<CreateBookReviewDto, 'book'|'bookId'|'releaseId'>)} {book, bookId, releaseId}
   * @returns
   * @memberof BookService
   */
  findAlreadyCachedReviewBook({book, bookId, releaseId}: Pick<CreateBookReviewDto, 'book'|'bookId'|'releaseId'>) {
    let query: SelectQueryBuilder<BookEntity> = null;

    if (R.isNil(releaseId) || !R.isNil(bookId)) {
      const id = bookId ?? book?.id;

      query = (
        R.isNil(id)
          ? this.createSimilarNamedQuery(book.title)
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
