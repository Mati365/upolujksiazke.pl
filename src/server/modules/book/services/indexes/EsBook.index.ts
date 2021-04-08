import {Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import * as R from 'ramda';

import {paginatedAsyncIterator} from '@server/common/helpers/db';
import {objPropsToPromise, pickIdName} from '@shared/helpers';

import {
  EntityIndex,
  EsIdNamePair,
  EsMappedDoc,
  PredefinedProperties,
} from '@server/modules/elasticsearch/classes/EntityIndex';

import {BookEntity} from '../../entity/Book.entity';
import {BookCategoryService} from '../../modules/category';
import {BookTagsService} from '../BookTags.service';
import {BookReleaseEntity} from '../../modules/release/BookRelease.entity';
import {BookSeriesService} from '../../modules/series/services';

export interface BookIndexEntity {
  title: string;
  volumeId: number;
  volumeName: string;
  series: EsIdNamePair[];
  categories: EsIdNamePair[];
  authors: EsIdNamePair[];
  tags: EsIdNamePair[];
}

@Injectable()
export class EsBookIndex extends EntityIndex<BookEntity, BookIndexEntity> {
  static readonly INDEX_NAME = 'books';

  constructor(
    esService: ElasticsearchService,
    private readonly categoryService: BookCategoryService,
    private readonly seriesService: BookSeriesService,
    private readonly tagsService: BookTagsService,
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
          mappings: {
            properties: <Record<keyof BookIndexEntity, any>> {
              title: {type: 'text'},
              volumeId: {type: 'long'},
              volumeName: {type: 'keyword'},
              series: PredefinedProperties.idNamePair,
              authors: PredefinedProperties.idNamePair,
              tags: PredefinedProperties.idNamePair,
            },
          },
        },
      },
    );
  }

  /**
   * @inheritdoc
   * @todo Handle bulk search!
   */
  async findEntity(id: number): Promise<BookEntity> {
    const {
      categoryService,
      tagsService,
      seriesService,
    } = this;

    const {book, ...attrs} = await objPropsToPromise(
      {
        book: await BookEntity.findOne(
          id,
          {
            select: ['id'],
            relations: ['volume', 'authors'],
          },
        ),
        categories: await categoryService.findBookCategories(id),
        tags: await tagsService.findBookTags(id),
        series: await seriesService.findBookSeries(id),
        releases: await BookReleaseEntity.find(
          {
            select: ['title'],
            where: {
              bookId: id,
            },
          },
        ),
      },
    );

    return new BookEntity(
      {
        ...book,
        ...attrs,
      },
    );
  }

  /**
   * @inheritdoc
   */
  async* findEntitiesIds(): AsyncGenerator<number[]> {
    const it = paginatedAsyncIterator(
      {
        limit: 30,
        queryExecutor: ({limit, offset}) => (
          BookEntity
            .createQueryBuilder('b')
            .select('b.id')
            .offset(offset)
            .limit(limit)
            .getMany()
        ),
      },
    );

    for await (const [, item] of it)
      yield R.pluck('id', item);
  }

  /**
   * @inheritdoc
   */
  mapRecord(entity: BookEntity): EsMappedDoc<BookIndexEntity> {
    const {
      volume, releases, series,
      authors, tags, categories,
      id,
    } = entity;

    return {
      _id: id,
      title: (
        R
          .pluck('title', releases)
          .reduce((a, b) => (a.length > b.length ? a : b), '')
      ),
      volumeId: volume?.id,
      volumeName: volume?.name,
      series: pickIdName(series),
      categories: pickIdName(categories),
      authors: pickIdName(authors),
      tags: pickIdName(tags),
    };
  }
}
