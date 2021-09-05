import {Injectable} from '@nestjs/common';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {objPropsToPromise} from '@shared/helpers';

import {BookEntity} from '@server/modules/book';
import {BookTagsService} from '@server/modules/book/modules/tags/BookTags.service';
import {BookIndexEntity, EsBookIndex} from '@server/modules/book/modules/search/indices/EsBook.index';
import {BookGenreService} from '@server/modules/book/modules/genre';
import {BookEraService} from '@server/modules/book/modules/era';
import {BookCategoryService} from '@server/modules/book/modules/category';
import {CardBookSearchService} from '@server/modules/book/modules/search/service';

export type BookAlternativesAttrs = {
  source?: string[],
  limit?: number,
  book?: BookEntity,
  bookId?: number,
};

@Injectable()
export class BookRecommendationService {
  constructor(
    private readonly bookEsIndex: EsBookIndex,
    private readonly categoryService: BookCategoryService,
    private readonly genreService: BookGenreService,
    private readonly eraService: BookEraService,
    private readonly bookTagService: BookTagsService,
    private readonly cardBookSearchService: CardBookSearchService,
  ) {}

  /**
   * Find recommended books alternatives in ES
   *
   * @private
   * @param {Object} attrs
   * @return {Promise<BookIndexEntity[]>}
   * @memberof BookRecommendationService
   */
  async findBookAlternativesHits(
    {
      source = [],
      limit = 15,
      book,
      bookId,
    }: BookAlternativesAttrs,
  ): Promise<BookIndexEntity[]> {
    const {
      bookTagService,
      eraService,
      genreService,
      categoryService,
      bookEsIndex,
    } = this;

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
              select: ['id', 'primaryCategoryId'],
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

    const tieQueries: esb.Query[] = [
      esb.nestedQuery(
        esb
          .termQuery('primaryCategory.id', book.primaryCategoryId)
          .boost(2.5),
        'primaryCategory',
      ),

      BookRecommendationService.createShouldTieQuery(
        {
          boost: 2.5,
          queries: (book.era || []).map((era) => esb.nestedQuery(
            esb.termQuery('era.id', era.id),
            'era',
          )),
        },
      ),

      BookRecommendationService.createShouldTieQuery(
        {
          boost: 2,
          queries: (book.genre || []).map((genre) => esb.nestedQuery(
            esb.termQuery('genre.id', genre.id),
            'genre',
          )),
        },
      ),

      BookRecommendationService.createShouldTieQuery(
        {
          percentage: '20%',
          boost: 1.25,
          queries: (book.categories || []).map((category) => esb.nestedQuery(
            esb.termQuery('categories.id', category.id),
            'categories',
          )),
        },
      ),

      BookRecommendationService.createShouldTieQuery(
        {
          percentage: '30%',
          boost: 1.0,
          queries: (book.tags || []).map((tag) => esb.nestedQuery(
            esb.termQuery('tags.id', tag.id),
            'tags',
          )),
        },
      ),
    ];

    const query = (
      esb
        .boolQuery()
        .mustNot(
          esb.termQuery('id', book.id),
        )
        .must(
          esb
            .disMaxQuery()
            .tieBreaker(0.7)
            .queries(tieQueries),
        )
    );

    return R.pluck('_source', await bookEsIndex.searchHits(
      esb
        .requestBodySearch()
        .query(query)
        .source(['id', ...source])
        .size(limit)
        .toJSON(),
    ));
  }

  /**
   * Find book cards records
   *
   * @param {BookAlternativesAttrs} attrs
   * @return {Promise<BookEntity[]>}
   * @memberof BookRecommendationService
   */
  async findBookAlternativesCards(attrs: BookAlternativesAttrs): Promise<BookEntity[]> {
    const {cardBookSearchService} = this;

    const hits = await this.findBookAlternativesHits(attrs);
    if (R.isEmpty(hits))
      return [];

    return cardBookSearchService.findBooksByIds(
      R.pluck('id', hits),
    );
  }

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
  ) {
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
