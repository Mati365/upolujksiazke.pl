import {Injectable} from '@nestjs/common';
import {Brackets, SelectQueryBuilder} from 'typeorm';
import * as R from 'ramda';

import {BookEntity} from '../../entity/Book.entity';
import {BookVolumeEntity} from '../../modules/volume/BookVolume.entity';

import {CreateBookDto} from '../../dto/CreateBook.dto';
import {CreateBookReviewDto} from '../../modules/review/dto/CreateBookReview.dto';
import {CreateBookReleaseDto} from '../../modules/release/dto/CreateBookRelease.dto';

@Injectable()
export class FuzzyBookSearchService {
  /**
   * Find book based on multiple dtos
   *
   * @param {CreateBookDto[]} books
   * @param {CreateBookReleaseDto[]} [allReleases]
   * @param {number} similarity
   * @returns
   * @memberof FuzzyBookSearchService
   */
  async findAlreadyCachedSimilarToBooks(
    books: CreateBookDto[],
    allReleases?: CreateBookReleaseDto[],
    similarity?: number,
  ) {
    allReleases ??= R.unnest(R.pluck('releases', books)) || [];

    if (!similarity) {
      similarity = (
        R
          .pluck('defaultTitle', books)
          .filter(Boolean)
          .reduce(
            (acc, item) => Math.max(
              Math.ceil(item.length * 0.3),
              acc,
            ),
            0,
          )
      );
    }

    const [bookIds, volumes, isbns, releasesIds] = [
      R.pluck('id', books),
      R.pluck('volume', books),
      R.pluck('isbn', allReleases),
      R.pluck('id', allReleases),
    ]
      .map((array: any[]) => array.filter(Boolean));

    let query: SelectQueryBuilder<BookEntity> = BookEntity.createQueryBuilder('book');

    // check slugs
    if (bookIds.length)
      query = query.where('book.id in (:...bookIds)', {bookIds});
    else {
      query.andWhere(
        new Brackets((qb) => {
          // search by isbn
          if (isbns.length)
            qb = qb.orWhere('release.isbn in (:...isbns)', {isbns});
          else {
            // find redirected slugs
            const slugs = R.uniqBy(
              R.identity,
              books.flatMap((book) => book.genSlugPermutations()),
            );

            // some websites migth contain book with single author
            // but there can be also multiple authors
            // just ignore author part when checking slugs
            const nonPrefixedSlugs = R.uniqBy(
              R.identity,
              books.flatMap((book) => book.genSlugPermutations('')),
            );

            // find matching book slug
            slugs.forEach((slug) => {
              qb = qb.orWhere(
                'levenshtein(book.parameterizedSlug, :slug) <= :similarity',
                {
                  slug,
                  similarity,
                },
              );

              // find book slug by release slug + book author slug
              nonPrefixedSlugs.forEach((bookSlugPostfix) => {
                qb = qb.orWhere(
                  'levenshtein('
                    + ':slug,'
                    + 'CONCAT(release.parameterizedSlug, :bookSlugPostfix::text)'
                  + ') <= :similarity',
                  {
                    slug,
                    similarity,
                    bookSlugPostfix,
                  },
                );
              });
            });
          }

          // search by release id
          if (releasesIds.length)
            qb = qb.orWhere('release.id in (:...releasesIds)', {releasesIds});
        }),
      );

      if (volumes.length) {
        query = query.andWhere(
          (qb) => {
            const subQuery = (
              qb
                .createQueryBuilder()
                .select('volume.id')
                .from(BookVolumeEntity, 'volume')
                .where('volume.name in (:...volumeNames)')
                .getQuery()
            );

            return `book.volumeId in (${subQuery})`;
          },
          {
            volumeNames: R.pluck('name', volumes),
          },
        );
      }
    }

    return (
      query
        .innerJoinAndSelect('book.releases', 'release')
        .select(['release.id', 'release.isbn', 'book.id'])
        .limit(1)
        .getOne()
    );
  }

  /**
   * Looks for book in database and tries to match it to review
   *
   * @param {(Pick<CreateBookReviewDto, 'book'|'bookId'|'releaseId'>)} {book, bookId, releaseId}
   * @returns
   * @memberof BookService
   */
  findAlreadyCachedReviewBook({book, bookId, releaseId}: Pick<CreateBookReviewDto, 'book'|'bookId'|'releaseId'>) {
    return this.findAlreadyCachedSimilarToBooks(
      [
        new CreateBookDto(
          {
            id: bookId ?? book?.id,
            ...book,
            ...!R.isNil(releaseId) && {
              releases: [
                new CreateBookReleaseDto(
                  {
                    id: releaseId,
                  },
                ),
              ],
            },
          },
        ),
      ],
    );
  }
}
