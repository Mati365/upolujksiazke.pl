import {Inject, Injectable, forwardRef} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import * as R from 'ramda';

import {
  EntityIndex,
  EsMappedDoc,
} from '@server/modules/elasticsearch/classes/EntityIndex';

import {BookAuthorEntity} from '../BookAuthor.entity';
import {BookAuthorService} from '../BookAuthor.service';

export type BookAuthorIndexEntity = Pick<
/* eslint-disable @typescript-eslint/indent */
  BookAuthorEntity,
  'id'|'name'|'nameAliases'|'parameterizedName'| 'createdAt'
/* eslint-enable @typescript-eslint/indent */
>;

@Injectable()
export class EsBookAuthorIndex extends EntityIndex<BookAuthorEntity, BookAuthorIndexEntity> {
  static readonly INDEX_NAME = 'books_authors';

  static readonly BOOK_CATEGORY_INDEX_MAPPING: Record<keyof BookAuthorIndexEntity, any> = {
    id: {type: 'integer'},
    createdAt: {type: 'date'},
    parameterizedName: {type: 'keyword'},
    nameAliases: {type: 'text'},
    name: {
      type: 'text',
      fields: {
        raw: {type: 'keyword'},
        autocomplete: {type: 'search_as_you_type'},
      },
    },
  };

  constructor(
    esService: ElasticsearchService,

    @Inject(forwardRef(() => BookAuthorService))
    private readonly bookAuthorService: BookAuthorService,
  ) {
    super(
      esService,
      {
        name: EsBookAuthorIndex.INDEX_NAME,
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
            properties: EsBookAuthorIndex.BOOK_CATEGORY_INDEX_MAPPING,
          },
        },
      },
    );
  }

  /**
   * @inheritdoc
   */
  protected findEntities(ids: number[]): Promise<BookAuthorEntity[]> {
    return BookAuthorEntity.findByIds(
      ids,
      {
        select: [
          'id', 'name', 'createdAt',
          'parameterizedName', 'nameAliases',
        ],
      },
    );
  }

  /**
   * @inheritdoc
   */
  protected async* findEntitiesIds(): AsyncGenerator<number[]> {
    const it = this.bookAuthorService.createIdsIteratedQuery(
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
  protected mapRecord(item: BookAuthorEntity): EsMappedDoc<BookAuthorIndexEntity> {
    return {
      _id: item.id,
      ...R.pick(
        [
          'id',
          'createdAt',
          'name',
          'parameterizedName',
          'nameAliases',
        ],
        item,
      ),
    };
  }
}
