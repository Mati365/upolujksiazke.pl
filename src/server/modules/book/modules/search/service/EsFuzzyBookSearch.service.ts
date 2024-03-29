import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {Brackets, SelectQueryBuilder} from 'typeorm';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {parameterize} from '@shared/helpers';

import {BookEntity} from '../../../entity/Book.entity';
import {BookVolumeEntity} from '../../volume/BookVolume.entity';
import {BookAuthorEntity} from '../../author/BookAuthor.entity';
import {EsBookIndex} from '../indices/EsBook.index';

import {CreateBookDto} from '../../../dto/CreateBook.dto';
import {CreateBookReviewDto} from '../../review/dto/CreateBookReview.dto';
import {CreateBookReleaseDto} from '../../release/dto/CreateBookRelease.dto';

/**
 * Instead of EsCardBookSearchService it performs search
 * primarly based only on names (instead of ids)
 *
 * @export
 * @class EsFuzzyBookSearchService
 */
@Injectable()
export class EsFuzzyBookSearchService {
  constructor(
    @Inject(forwardRef(() => EsBookIndex))
    private readonly bookEsIndex: EsBookIndex,
  ) {}

  /**
   * Find book based on multiple dtos
   *
   * @param {CreateBookDto[]} books
   * @param {CreateBookReleaseDto[]} [allReleases]
   * @param {number} similarity
   * @returns
   * @memberof EsFuzzyBookSearchService
   */
  async findAlreadyCachedSimilarToBooks(
    books: CreateBookDto[],
    allReleases?: CreateBookReleaseDto[],
    similarity?: number,
  ) {
    allReleases ??= R.unnest(R.pluck('releases', books)) || [];

    const [
      bookIds,
      volumes,
      isbns,
      releasesIds,
    ] = [
      R.pluck('id', books),
      R.pluck('volume', books),
      R.pluck('isbn', allReleases),
      R.pluck('id', allReleases),
    ]
      .map((array: any[]) => array.filter(Boolean));

    const esBookId = await this.findBookByNames(
      {
        isbns,
        names: R.pluck('defaultTitle', books),
        volumes: R.pluck('name', volumes),
        authors: R.unnest(
          R.map(
            ({authors}) => R.pluck('name', authors),
            books,
          ),
        ),
      },
    );

    let query: SelectQueryBuilder<BookEntity> = BookEntity.createQueryBuilder('book');
    if (!R.isNil(esBookId)) {
      // lookup in ElasticSearch
      query = query.andWhere('book.id = :id', {id: esBookId});
    } else {
      // lookup in DB
      if (!similarity) {
        similarity = R.clamp(
          0,
          3,
          Math.floor(
            R
              .pluck('defaultTitle', books)
              .filter(Boolean)
              .reduce(R.minBy(R.length), Infinity),
          ),
        );
      }

      const authorsIds = await (async () => {
        const allAuthors = R.flatten(R.pluck('authors', books)) || [];
        if (R.isEmpty(allAuthors))
          return null;

        let nestedQuery = BookAuthorEntity.createQueryBuilder('a');
        allAuthors.forEach(({name}) => {
          nestedQuery = nestedQuery.andWhere(
            'levenshtein(a."parameterizedName", :slug) <= :similarity',
            {
              slug: parameterize(name),
              similarity: Math.ceil(name.length * 0.3),
            },
          );
        });

        return R.pluck('id', await nestedQuery.getMany());
      })();

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
              const nonPrefixedSlugs = (
                authorsIds?.length
                  ? R.uniqBy(
                    R.identity,
                    books.flatMap((book) => book.genSlugPermutations('')),
                  )
                  : null
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
                if (nonPrefixedSlugs) {
                  nonPrefixedSlugs.forEach((bookSlugPostfix) => {
                    qb = qb.orWhere(
                      'levenshtein('
                        + ':slug,'
                        + 'CONCAT(release.parameterizedSlug, :bookSlugPostfix::text)'
                      + ') <= :similarity'
                      + ' and authors."id" in (:...authorsIds)',
                      {
                        slug,
                        similarity,
                        bookSlugPostfix,
                        authorsIds,
                      },
                    );
                  });
                }
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
    }

    return (
      query
        .leftJoin('book.authors', 'authors')
        .innerJoin('book.releases', 'release')
        .select(['release.id', 'release.isbn', 'book.parameterizedSlug', 'book.id'])
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
  findAlreadyCachedReviewBook({book, bookId, releaseId}: Pick<CreateBookReviewDto, 'book' | 'bookId' | 'releaseId'>) {
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

  /**
   * Search all author books that maybe create series
   *
   * @param {Object} attrs
   * @returns
   * @memberof EsFuzzyBookSearchService
   */
  async findSimilarAuthorSeriesBook(
    {
      bookId,
      source = [],
    }: {
      bookId: number,
      source?: string[],
    },
  ) {
    const {bookEsIndex} = this;
    const book = await BookEntity.findOne(
      bookId,
      {
        select: ['id', 'originalTitle', 'defaultTitle'],
        relations: ['authors'],
      },
    );

    if (!book?.authors?.length)
      return [];

    const query = (
      esb
        .boolQuery()
        .filter(
          esb.nestedQuery().path('authors').query(
            esb
              .boolQuery()
              .minimumShouldMatch(1)
              .should(book.authors.map(
                (author) => esb.termQuery('authors.id', author.id),
              )),
          ),
        )
        .must([
          esb.disMaxQuery().tieBreaker(0.7).queries(
            [
              EsFuzzyBookSearchService.createSimilarBookTitleEsQuery(
                {
                  title: book.defaultTitle,
                  field: 'defaultTitle',
                  operator: 'or',
                },
              ),
              book.originalTitle
                ? EsFuzzyBookSearchService.createSimilarBookTitleEsQuery(
                  {
                    title: book.originalTitle,
                    field: 'originalTitle',
                    operator: 'or',
                  },
                )
                : null,
            ].filter(Boolean),
          ),
        ])
        .mustNot(
          esb.termQuery('id', book.id),
        )
    );

    const results = await bookEsIndex.searchHits(
      esb
        .requestBodySearch()
        .minScore(5)
        .query(query)
        .source(['id', ...source])
        .toJSON(),
    );

    return R.map(
      R.pick(
        [
          'id',
          ...source,
        ],
      ),
      R.pluck('_source', results || []),
    ) as any[];
  }

  /**
   * Lookups using ES book by names
   *
   * @private
   * @param {Object} attrs
   * @returns {Promise<BookEntity>}
   * @memberof EsFuzzyBookSearchService
   */
  async findBookByNames(
    {
      names,
      volumes,
      isbns,
      authors,
    }: {
      names?: string[],
      volumes?: string[],
      isbns?: string[],
      authors?: string[],
    },
  ): Promise<BookEntity> {
    const {bookEsIndex} = this;
    const shouldQueries: esb.Query[] = [
      ...!isbns?.length ? [] : [
        esb.termsQuery('isbns', isbns),
      ],
      ...(() => {
        const mustFields = [
          ...!volumes?.length ? [] : [
            esb.termsQuery('volumeName', volumes),
          ],
          ...(
            !names?.length
              ? []
              : names.map((title) => EsFuzzyBookSearchService.createSimilarBookTitleEsQuery(
                {
                  title,
                },
              ))
          ),
          ...(
            !authors?.length
              ? []
              : [
                esb.nestedQuery().path('authors').query(
                  esb
                    .boolQuery()
                    .minimumShouldMatch(1)
                    .should(authors.map(
                      (author) => (
                        esb
                          .multiMatchQuery(
                            ['authors.name', 'authors.nameAliases'],
                            author,
                          )
                          .fuzziness(0.75)
                          .operator('and')
                      ),
                    )),
                ),
              ]
          ),
        ];

        return !mustFields.length ? [] : [
          esb
            .boolQuery()
            .must(mustFields),
        ];
      })(),
    ];

    if (!shouldQueries.length)
      return null;

    const result = await bookEsIndex.searchHits(
      esb
        .requestBodySearch()
        .source(['id'])
        .query(
          esb
            .boolQuery()
            .should(shouldQueries)
            .minimumShouldMatch(1),
        )
        .sort(esb.sort('_score', 'desc'))
        .size(1)
        .toJSON(),
    );

    return result?.[0]?._id ?? null;
  }

  /**
   * Create fuzzy search query
   *
   * @static
   * @param {Object} attrs
   * @return {esb.Query}
   * @memberof EsFuzzyBookSearchService
   */
  static createSimilarBookTitleEsQuery(
    {
      title,
      field = 'defaultTitle',
      operator = 'and',
    }: {
      title: string,
      field?: string,
      operator?: 'and' | 'or',
    },
  ): esb.Query {
    return (
      esb
        .boolQuery()
        .minimumShouldMatch(1)
        .should([
          esb
            .matchPhraseQuery(field, title)
            .boost(2),

          esb
            .matchQuery(field, title)
            .operator(operator)
            .fuzziness(0.9),
        ])
    );
  }
}
