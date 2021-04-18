import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import * as R from 'ramda';

import {objPropsToPromise} from '@shared/helpers';

import {
  EntityIndex,
  EsMappedDoc,
  PredefinedProperties,
} from '@server/modules/elasticsearch/classes/EntityIndex';

import {CardBookSearchService} from '../search/CardBookSearch.service';
import {BookEntity} from '../../entity/Book.entity';
import {BookEraService} from '../../modules/era/BookEra.service';
import {BookGenreService} from '../../modules/genre/BookGenre.service';
import {BookTagsService} from '../BookTags.service';
import {BookCategoryService} from '../../modules/category/services/BookCategory.service';
import {BookPrizeService} from '../../modules/prize/BookPrize.service';
import {BookAuthorService} from '../../modules/author/BookAuthor.service';
import {BookReleaseService} from '../../modules/release/BookRelease.service';

export type BookIndexEntity = Pick<
/* eslint-disable @typescript-eslint/indent */
  BookEntity,
  'id'|'era'|'genre'|'tags'|'categories'|'prizes'|'authors'
  |'originalTitle'|'defaultTitle'|'lowestPrice' |'highestPrice'
  |'allTypes'|'schoolBook'
/* eslint-enable @typescript-eslint/indent */
> & {
  volumeName: string,
  isbns: string[],
};

@Injectable()
export class EsBookIndex extends EntityIndex<BookEntity, BookIndexEntity> {
  static readonly INDEX_NAME = 'books';

  static readonly BOOK_INDEX_MAPPING: Record<keyof BookIndexEntity, any> = {
    id: {type: 'integer'},
    originalTitle: {type: 'text'},
    defaultTitle: {type: 'text'},
    allTypes: {type: 'keyword'},
    lowestPrice: {type: 'float'},
    highestPrice: {type: 'float'},
    volumeName: {type: 'keyword'},
    isbns: {type: 'keyword'},
    authors: PredefinedProperties.idNamePair,
    tags: PredefinedProperties.idNamePair,
    categories: PredefinedProperties.idNamePair,
    era: PredefinedProperties.idNamePair,
    genre: PredefinedProperties.idNamePair,
    prizes: PredefinedProperties.idNamePair,
    schoolBook: {
      type: 'nested',
      properties: {
        classLevel: {type: 'integer'},
        obligatory: {type: 'boolean'},
      },
    },
  };

  constructor(
    esService: ElasticsearchService,

    @Inject(forwardRef(() => CardBookSearchService))
    private readonly bookSearchService: CardBookSearchService,
    private readonly bookEraService: BookEraService,
    private readonly bookGenreService: BookGenreService,
    private readonly bookTagsService: BookTagsService,
    private readonly bookCategoriesService: BookCategoryService,
    private readonly bookPrizeService: BookPrizeService,
    private readonly bookAuthorService: BookAuthorService,
    private readonly bookReleasesService: BookReleaseService,
  ) {
    super(
      esService,
      {
        name: EsBookIndex.INDEX_NAME,
      },
    );
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
            ],
            relations: [
              'schoolBook', 'volume',
            ],
          },
        ),
        eras: bookEraService.findBooksEras(ids),
        genres: bookGenreService.findBooksGenres(ids),
        tags: bookTagsService.findBooksTags(ids),
        categories: bookCategoriesService.findBooksCategories(ids),
        prizes: bookPrizeService.findBooksPrizes(ids),
        authors: bookAuthorService.findBooksAuthors(ids),
        releases: bookReleasesService.findBooksReleases(
          {
            booksIds: ids,
            select: ['id', 'isbn'],
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
  protected mapRecord({volume, releases, ...entity}: BookEntity): EsMappedDoc<BookIndexEntity> {
    return {
      _id: entity.id,
      volumeName: volume?.name,
      isbns: R.pluck('isbn', releases),
      ...entity,
    };
  }
}
