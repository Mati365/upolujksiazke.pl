import {Injectable} from '@nestjs/common';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {objPropsToPromise} from '@shared/helpers';

import {BookEntity} from '@server/modules/book';
import {BookTagsService} from '@server/modules/book/modules/tags/BookTags.service';
import {BookIndexEntity, EsBookIndex} from '@server/modules/book/modules/search/indices/EsBook.index';
import {BookGenreService} from '@server/modules/book/modules/genre';
import {BookEraService} from '@server/modules/book/modules/era';
import {BookCategoryService, BookParentCategoryService} from '@server/modules/book/modules/category';
import {CardBookSearchService} from '@server/modules/book/modules/search/service';

export type BookAlternativesAttrs = {
  source?: string[],
  limit?: number,
  book?: BookEntity,
  bookId?: number,
  minScore?: number,
};

export type BookAlternativesResults = {
  book: BookEntity,
  hits: BookIndexEntity[],
};

@Injectable()
export class BookSimilarityFilterService {
  constructor(
    private readonly bookEsIndex: EsBookIndex,
    private readonly categoryService: BookCategoryService,
    private readonly genreService: BookGenreService,
    private readonly eraService: BookEraService,
    private readonly bookTagService: BookTagsService,
    private readonly bookParentCategoryService: BookParentCategoryService,
    private readonly cardBookSearchService: CardBookSearchService,
  ) {}

  /**
   * Find recommended books alternatives in ES
   *
   * @private
   * @param {Object} attrs
   * @return {Promise<BookAlternativesResults>}
   * @memberof BookSimilarityFilterService
   */
  async findBookAlternativesHits(
    {
      source = [],
      limit = 15,
      minScore = 5.5,
      book,
      bookId,
    }: BookAlternativesAttrs,
  ): Promise<BookAlternativesResults> {
    const {
      bookTagService,
      eraService,
      genreService,
      categoryService,
      bookParentCategoryService,
      bookEsIndex,
    } = this;

    const defaultParentCategory = await bookParentCategoryService.findDefaultParentCategory();

    if (!book && bookId) {
      const result = await objPropsToPromise(
        {
          tags: bookTagService.findBookTags(bookId),
          genre: genreService.findBookGenre(bookId),
          era: eraService.findBookEra(bookId),
          categories: categoryService.findBookCategories(bookId),
          book: BookEntity.findOne(
            bookId,
            {
              select: ['id', 'primaryCategoryId', 'defaultTitle'],
            },
          ),
        },
      );

      book = new BookEntity(
        {
          ...result.book,
          genre: result.genre,
          era: result.era,
          tags: result.tags,
          categories: result.categories,
        },
      );
    }

    const self = BookSimilarityFilterService;
    const tieQueries: esb.Query[] = [
      esb
        .moreLikeThisQuery()
        .fields(['defaultTitle'])
        .like(book.defaultTitle)
        .minTermFreq(1)
        .boost(1.1),

      book.primaryCategoryId !== defaultParentCategory.id && (
        esb
          .boolQuery()
          .boost(4.5)
          .should(
            esb.nestedQuery(
              esb.termQuery('primaryCategory.id', book.primaryCategoryId),
              'primaryCategory',
            ),
          )
      ),

      self.createShouldTieQuery(
        {
          boost: 3.5,
          queries: (book.era || []).map((era) => esb.nestedQuery(
            esb.termQuery('era.id', era.id),
            'era',
          )),
        },
      ),

      self.createShouldTieQuery(
        {
          boost: 3,
          queries: (book.genre || []).map((genre) => esb.nestedQuery(
            esb.termQuery('genre.id', genre.id),
            'genre',
          )),
        },
      ),

      self.createShouldTieQuery(
        {
          boost: 1.5,
          queries: (book.categories || []).map((category) => esb.nestedQuery(
            esb.termQuery('categories.id', category.id),
            'categories',
          )),
        },
      ),

      self.createShouldTieQuery(
        {
          boost: 1.4,
          queries: R.pluck('id', (book.tags || [])).map((tag) => esb.nestedQuery(
            esb.termQuery('tags.id', tag),
            'tags',
          )),
        },
      ),
    ].filter(Boolean);

    if (R.isEmpty(tieQueries)) {
      return {
        hits: [],
        book,
      };
    }

    const mustQueries: esb.Query[] = [
      esb
        .disMaxQuery()
        .tieBreaker(0.7)
        .queries(tieQueries),
    ];

    if (minScore) {
      mustQueries.push(
        esb
          .rangeQuery('avgRating')
          .gte(minScore),
      );
    }

    const query = (
      esb
        .boolQuery()
        .mustNot(
          esb.termQuery('id', book.id),
        )
        .must(mustQueries)
    );

    return {
      book,
      hits: R.pluck('_source', await bookEsIndex.searchHits(
        esb
          .requestBodySearch()
          .query(query)
          .source(['id', ...source])
          .size(limit)
          .toJSON(),
      )),
    };
  }

  /**
   * Find book cards records
   *
   * @param {BookAlternativesAttrs} attrs
   * @return {Promise<BookEntity[]>}
   * @memberof BookSimilarityFilterService
   */
  async findBookAlternativesCards(attrs: BookAlternativesAttrs): Promise<BookEntity[]> {
    const {cardBookSearchService} = this;

    const {hits} = await this.findBookAlternativesHits(attrs);
    if (R.isEmpty(hits))
      return [];

    return cardBookSearchService.findBooksByIds(
      R.pluck('id', hits),
    );
  }

  /**
   * Create boosted should query
   *
   * @static
   * @param {Object} attrs
   * @return {esb.Query}
   * @memberof BookSimilarityFilterService
   */
  static createShouldTieQuery(
    {
      queries,
      boost,
      percentage,
    }: {
      percentage?: number | string,
      boost: number,
      queries: esb.Query[],
    },
  ): esb.Query {
    if (!queries || R.isEmpty(queries))
      return null;

    let query = esb.boolQuery();
    if (percentage)
      query = query.minimumShouldMatch(percentage);

    return (
      query
        .boost(boost)
        .should(queries)
    );
  }
}
