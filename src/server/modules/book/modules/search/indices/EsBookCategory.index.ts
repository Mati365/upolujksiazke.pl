import {Inject, Injectable, forwardRef} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';

import {
  EntityIndex,
  EsMappedDoc,
  PredefinedProperties,
} from '@server/modules/elasticsearch/classes/EntityIndex';

import {BookCategoryEntity} from '../../category/BookCategory.entity';
import {BookCategoryService} from '../../category/services/BookCategory.service';

export type BookCategoryIndexEntity = Pick<
/* eslint-disable @typescript-eslint/indent */
  BookCategoryEntity,
  'id'|'name'|'parameterizedName'
  | 'createdAt'|'parentCategory'|'promotion'
/* eslint-enable @typescript-eslint/indent */
>;

@Injectable()
export class EsBookCategoryIndex extends EntityIndex<BookCategoryEntity, BookCategoryIndexEntity> {
  static readonly INDEX_NAME = 'books_categories';

  static readonly BOOK_CATEGORY_INDEX_MAPPING: Record<keyof BookCategoryIndexEntity, any> = {
    id: {type: 'integer'},
    createdAt: {type: 'date'},
    promotion: {type: 'integer'},
    parameterizedName: {type: 'keyword'},
    name: {
      type: 'text',
      fields: {
        raw: {type: 'keyword'},
        autocomplete: {type: 'search_as_you_type'},
      },
    },
    parentCategory: PredefinedProperties.idNamePair,
  };

  constructor(
    esService: ElasticsearchService,

    @Inject(forwardRef(() => BookCategoryService))
    private readonly bookCategoryService: BookCategoryService,
  ) {
    super(
      esService,
      {
        name: EsBookCategoryIndex.INDEX_NAME,
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
            properties: EsBookCategoryIndex.BOOK_CATEGORY_INDEX_MAPPING,
          },
        },
      },
    );
  }

  /**
   * @inheritdoc
   */
  protected findEntities(ids: number[]): Promise<BookCategoryEntity[]> {
    return BookCategoryEntity.findByIds(
      ids,
      {
        select: [
          'id', 'name', 'createdAt',
          'promotion', 'parameterizedName',
        ],
        relations: [
          'parentCategory',
        ],
      },
    );
  }

  /**
   * @inheritdoc
   */
  protected async* findEntitiesIds(): AsyncGenerator<number[]> {
    const it = this.bookCategoryService.createIdsIteratedQuery(
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
      id,
      createdAt,
      name,
      parameterizedName,
      promotion,
      parentCategory,
    }: BookCategoryEntity,
  ): EsMappedDoc<BookCategoryIndexEntity> {
    return {
      _id: id,
      id,
      createdAt,
      name,
      parameterizedName,
      promotion,
      parentCategory,
    };
  }
}
