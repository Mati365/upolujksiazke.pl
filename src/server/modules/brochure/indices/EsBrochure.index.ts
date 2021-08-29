import {Inject, Injectable, forwardRef} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import * as R from 'ramda';

import {objPropsToPromise, pickIdName} from '@shared/helpers';
import {createMapperListItemSelector} from '@server/modules/elasticsearch/helpers';

import {
  EntityIndex,
  EsImageAttachment,
  EsMappedDoc,
  PredefinedProperties,
} from '@server/modules/elasticsearch/classes/EntityIndex';

import {CardBrochureSearchService} from '../services/search/CardBrochureSearch.service';
import {BrochureTagsService} from '../services/BrochureTags.service';
import {BrochurePageService} from '../modules/brochure-page/BrochurePage.service';
import {BrochureEntity} from '../entity/Brochure.entity';
import {BrochureGroupedSelectAttrs} from '../shared/types';

export type BrochureIndexEntity = Pick<
/* eslint-disable @typescript-eslint/indent */
  BrochureEntity,
  'id' | 'createdAt' | 'updatedAt' | 'title' | 'nsfw'
  | 'parameterizedName' | 'totalPages' | 'tags' | 'brand'
  | 'pages' | 'url'
/* eslint-enable @typescript-eslint/indent */
> & {
  cover: EsImageAttachment[],
  valid: {
    from: Date,
    to: Date,
  }
};

export type EsBrochureKeys = (keyof typeof EsBrochureIndex.BROCHURE_INDEX_MAPPING)[];

@Injectable()
export class EsBrochureIndex extends EntityIndex<BrochureEntity, BrochureIndexEntity> {
  static readonly INDEX_NAME = 'brochures';

  static readonly BROCHURE_INDEX_MAPPING: Record<keyof BrochureIndexEntity, any> = {
    id: {type: 'integer'},
    createdAt: {type: 'date'},
    updatedAt: {type: 'date'},
    url: {type: 'keyword'},
    totalPages: {type: 'integer'},
    parameterizedName: {type: 'keyword'},
    nsfw: {type: 'boolean'},
    valid: {
      type: 'nested',
      properties: {
        from: {type: 'date'},
        to: {type: 'date'},
      },
    },
    tags: PredefinedProperties.idNamePair,
    brand: PredefinedProperties.customIdNamePair(
      {
        logo: PredefinedProperties.imageAttachment,
        website: {
          type: 'nested',
          properties: {
            id: {type: 'integer'},
            url: {type: 'keyword'},
          },
        },
      },
    ),
    title: {
      type: 'text',
      fields: {
        raw: {type: 'keyword'},
        autocomplete: {type: 'search_as_you_type'},
      },
    },
    cover: PredefinedProperties.imageAttachment,
    pages: {
      type: 'nested',
      properties: {
        id: {type: 'integer'},
        index: {type: 'integer'},
        ratio: {type: 'float'},
        image: PredefinedProperties.imageAttachment,
      },
    },
  };

  constructor(
    esService: ElasticsearchService,

    @Inject(forwardRef(() => CardBrochureSearchService))
    private readonly brochureSearchService: CardBrochureSearchService,

    @Inject(forwardRef(() => BrochureTagsService))
    private readonly brochureTagsService: BrochureTagsService,

    @Inject(forwardRef(() => BrochurePageService))
    private readonly brochurePageService: BrochurePageService,
  ) {
    super(
      esService,
      {
        name: EsBrochureIndex.INDEX_NAME,
      },
    );
  }

  static createBrochuresNestedListItemSelector(ids: number[], alias: string): BrochureGroupedSelectAttrs {
    return {
      brochuresIds: ids,
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
            properties: EsBrochureIndex.BROCHURE_INDEX_MAPPING,
          },
        },
      },
    );
  }

  /**
   * @inheritdoc
   */
  protected async findEntities(ids: number[]): Promise<BrochureEntity[]> {
    const {
      brochureTagsService,
      brochurePageService,
      brochureSearchService,
    } = this;

    const {
      pages,
      tags,
      brochures,
    } = await objPropsToPromise(
      {
        brochures: (
          brochureSearchService
            .createCardsQuery()
            .whereInIds(ids)
            .getMany()
        ),
        tags: brochureTagsService.findBrochuresTags(
          EsBrochureIndex.createBrochuresNestedListItemSelector(ids, 't'),
        ),
        pages: brochurePageService.findBrochuresPages(
          {
            brochuresIds: ids,
          },
        ),
      },
    );

    return brochures.map((entity) => new BrochureEntity(
      {
        ...entity,
        tags: tags[entity.id] || [],
        pages: pages[entity.id] || [],
      },
    ));
  }

  /**
   * @inheritdoc
   */
  protected async* findEntitiesIds(): AsyncGenerator<number[]> {
    const it = this.brochureSearchService.createIdsIteratedQuery(
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
  protected mapRecord({brand, pages, validFrom, validTo, ...item}: BrochureEntity): EsMappedDoc<BrochureIndexEntity> {
    return {
      _id: item.id,
      brand: {
        ...pickIdName(brand),
        website: brand.website,
        parameterizedName: brand.parameterizedName,
        logo: brand.logo,
      } as any,

      cover: pages[0].image,
      pages: pages.map((page) => ({
        id: page.id,
        index: page.index,
        image: page.image,
      })) as any,

      valid: {
        from: validFrom,
        to: validTo,
      },

      ...R.pick(
        [
          'id',
          'createdAt',
          'updatedAt',
          'title',
          'parameterizedName',
          'nsfw',
          'totalPages',
          'tags',
          'url',
        ],
        item,
      ),
    };
  }
}
