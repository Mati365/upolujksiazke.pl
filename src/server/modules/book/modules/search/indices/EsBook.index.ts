import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import * as R from 'ramda';

import {objPropsToPromise, pickIdName} from '@shared/helpers';
import {createMapperListItemSelector} from '@server/modules/elasticsearch/helpers';

import {ListItem} from '@shared/types';
import {
  EntityIndex,
  EsMappedDoc,
  PredefinedProperties,
} from '@server/modules/elasticsearch/classes/EntityIndex';

import {CardBookSearchService} from '../service/CardBookSearch.service';
import {BookEntity} from '../../../entity/Book.entity';
import {BookTagsService} from '../../tags/BookTags.service';
import {BookEraService} from '../../era/BookEra.service';
import {BookGenreService} from '../../genre/BookGenre.service';
import {BookCategoryService} from '../../category/services/BookCategory.service';
import {BookPrizeService} from '../../prize/BookPrize.service';
import {BookAuthorService} from '../../author/BookAuthor.service';
import {BookReleaseService} from '../../release/BookRelease.service';

export type BookIndexEntity = Pick<
/* eslint-disable @typescript-eslint/indent */
  BookEntity,
  'id' | 'era' | 'genre' | 'tags' | 'categories' | 'prizes' | 'authors'
  | 'originalTitle' | 'defaultTitle' | 'lowestPrice' | 'highestPrice'
  | 'allTypes' | 'schoolBook' | 'totalRatings' | 'createdAt'
/* eslint-enable @typescript-eslint/indent */
> & {
  volumeName: string,
  isbns: string[],
  publishers: ListItem[],
  primaryCategory: ListItem,
};

@Injectable()
export class EsBookIndex extends EntityIndex<BookEntity, BookIndexEntity> {
  static readonly INDEX_NAME = 'books';

  static readonly BOOK_INDEX_NESTED_AUTOCOMPLETE = {
    fields: {
      autocomplete: {
        type: 'keyword',
        normalizer: 'lowercase_normalizer',
      },
    },
  };

  static readonly BOOK_INDEX_MAPPING: Record<keyof BookIndexEntity, any> = {
    id: {type: 'integer'},
    createdAt: {type: 'date'},
    originalTitle: {type: 'text'},
    defaultTitle: {
      type: 'text',
      fields: {
        raw: {type: 'keyword'},
        autocomplete: {type: 'search_as_you_type'},
      },
    },
    allTypes: {type: 'keyword'},
    lowestPrice: {type: 'float'},
    highestPrice: {type: 'float'},
    totalRatings: {type: 'integer'},
    volumeName: {type: 'keyword'},
    isbns: {type: 'keyword'},
    primaryCategory: PredefinedProperties.idNamePair,
    prizes: PredefinedProperties.customIdNamePair(
      {
        name: EsBookIndex.BOOK_INDEX_NESTED_AUTOCOMPLETE,
      },
    ),
    publishers: PredefinedProperties.customIdNamePair(
      {
        name: EsBookIndex.BOOK_INDEX_NESTED_AUTOCOMPLETE,
      },
    ),
    categories: PredefinedProperties.customIdNamePair(
      {
        name: EsBookIndex.BOOK_INDEX_NESTED_AUTOCOMPLETE,
        promotion: {type: 'integer'},
        parentCategoryId: {type: 'integer'},
      },
    ),
    authors: {
      type: 'nested',
      properties: {
        id: {type: 'keyword'},
        parameterizedName: {type: 'keyword'},
        name: {
          type: 'keyword',
          ...EsBookIndex.BOOK_INDEX_NESTED_AUTOCOMPLETE,
        },
      },
    },
    tags: PredefinedProperties.idNamePair,
    era: PredefinedProperties.idNamePair,
    genre: PredefinedProperties.idNamePair,
    schoolBook: {
      type: 'nested',
      properties: {
        id: {type: 'integer'},
        classLevel: {type: 'integer'},
        obligatory: {type: 'boolean'},
      },
    },
  };

  constructor(
    esService: ElasticsearchService,

    @Inject(forwardRef(() => CardBookSearchService))
    private readonly bookSearchService: CardBookSearchService,
    @Inject(forwardRef(() => BookReleaseService))
    private readonly bookReleasesService: BookReleaseService,
    @Inject(forwardRef(() => BookAuthorService))
    private readonly bookAuthorService: BookAuthorService,
    private readonly bookEraService: BookEraService,
    private readonly bookGenreService: BookGenreService,
    private readonly bookTagsService: BookTagsService,
    private readonly bookCategoriesService: BookCategoryService,
    private readonly bookPrizeService: BookPrizeService,
  ) {
    super(
      esService,
      {
        name: EsBookIndex.INDEX_NAME,
      },
    );
  }

  /**
   * Create nested books relations filters
   *
   * @static
   * @param {number[]} ids
   * @param {string} alias
   * @returns
   * @memberof EsBookIndex
   */
  static createBooksNestedListItemSelector(ids: number[], alias: string) {
    return {
      booksIds: ids,
      select: createMapperListItemSelector(alias),
    };
  }

  /**
   * @inheritdoc
   */
  async createIndex(): Promise<void> {
    const {es, indexName} = this;

    await es.indices.create(
      {
        index: indexName,
        body: {
          settings: {
            'index.number_of_replicas': 0,
            analysis: {
              normalizer: {
                lowercase_normalizer: {
                  type: 'custom',
                  char_filter: [],
                  filter: ['lowercase', 'asciifolding'],
                },
              },
            },
          },
          mappings: {
            dynamic: false,
            properties: EsBookIndex.BOOK_INDEX_MAPPING,
          },
        },
      },
    );
  }

  /**
   * @inheritdoc
   */
  protected async findEntities(ids: number[]): Promise<BookEntity[]> {
    const {
      bookEraService,
      bookGenreService,
      bookTagsService,
      bookCategoriesService,
      bookPrizeService,
      bookAuthorService,
      bookReleasesService,
    } = this;

    const {
      books, eras, genres, tags,
      categories, prizes, authors,
      releases,
    } = await objPropsToPromise(
      {
        books: BookEntity.findByIds(
          ids,
          {
            select: [
              'id', 'originalTitle', 'defaultTitle',
              'lowestPrice', 'highestPrice', 'allTypes',
              'totalRatings', 'createdAt',
            ],
            relations: [
              'schoolBook', 'volume', 'primaryCategory',
            ],
          },
        ),
        eras: bookEraService.findBooksEras(
          EsBookIndex.createBooksNestedListItemSelector(ids, 'e'),
        ),
        genres: bookGenreService.findBooksGenres(
          EsBookIndex.createBooksNestedListItemSelector(ids, 'g'),
        ),
        tags: bookTagsService.findBooksTags(
          EsBookIndex.createBooksNestedListItemSelector(ids, 't'),
        ),
        prizes: bookPrizeService.findBooksPrizes(
          EsBookIndex.createBooksNestedListItemSelector(ids, 'b'),
        ),
        authors: bookAuthorService.findBooksAuthors(
          EsBookIndex.createBooksNestedListItemSelector(ids, 'b'),
        ),
        categories: bookCategoriesService.findBooksCategories(
          {
            booksIds: ids,
            select: [
              ...createMapperListItemSelector('c'),
              'c.promotion as "promotion"',
              'c.parentCategoryId as "parentCategoryId"',
            ],
          },
        ),
        releases: bookReleasesService.findBooksReleases(
          {
            booksIds: ids,
            select: [
              'r.id as "id"',
              'r.isbn as "isbn"',
              'p.id as "p_id"',
              'p.name as "p_name"',
              'p."parameterizedName" as "p_parameterizedName"',
            ],
            queryMapperFn: (qb) => qb.leftJoin('r.publisher', 'p'),
          },
        ),
      },
    );

    return books.map((entity) => new BookEntity(
      {
        ...entity,
        era: eras[entity.id],
        genre: genres[entity.id],
        tags: tags[entity.id],
        categories: categories[entity.id],
        prizes: prizes[entity.id],
        authors: authors[entity.id],
        releases: releases[entity.id],
      },
    ));
  }

  /**
   * @inheritdoc
   */
  protected async* findEntitiesIds(): AsyncGenerator<number[]> {
    const it = this.bookSearchService.createIdsIteratedQuery(
      {
        pageLimit: 40,
      },
    );

    for await (const [, ids] of it)
      yield ids;
  }

  /**
   * @inheritdoc
   */
  protected mapRecord(
    {
      volume,
      releases,
      primaryCategory,
      ...entity
    }: BookEntity,
  ): EsMappedDoc<BookIndexEntity> {
    return {
      _id: entity.id,
      volumeName: volume?.name,
      isbns: R.pluck('isbn', releases || []),
      publishers: R.pluck('publisher', releases || []),
      primaryCategory: pickIdName(primaryCategory),
      ...entity,
    };
  }
}
