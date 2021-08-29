import {Inject, Injectable, forwardRef} from '@nestjs/common';
import {plainToClass} from 'class-transformer';
import esb from 'elastic-builder';
import * as R from 'ramda';

import {SortMode} from '@shared/enums';
import {BrochureCardRecord} from '@api/types';
import {BrochuresFilters, BrochuresPaginationResult} from '@api/repo';
import {BrochureSerializer} from '@server/modules/api/serializers/Brochure.serializer';
import {EsBrochureIndex, EsBrochureKeys} from '../../indices/EsBrochure.index';

@Injectable()
export class EsCardBrochureSearchService {
  static readonly BROCHURE_ES_SOURCE_FIELDS: EsBrochureKeys = [
    'id', 'createdAt', 'title', 'parameterizedName',
    'valid', 'brand', 'cover',
  ];

  constructor(
    @Inject(forwardRef(() => EsBrochureIndex))
    private readonly brochureEsIndex: EsBrochureIndex,
  ) {}

  /**
   * Returns single brochure from ES index
   *
   * @param {Object} attrs
   * @return {Promise<BrochureSerializer>}
   * @memberof EsCardBrochureSearchService
   */
  async findFullCard(
    {
      id,
    }: {
      id: number,
    },
  ): Promise<BrochureSerializer> {
    const brochure = await this.brochureEsIndex.getByID(id);
    if (!brochure)
      return null;

    return plainToClass(
      BrochureSerializer,
      brochure,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  /**
   * Returns recently added brochures
   *
   * @param {Omit<BrochuresFilters, 'sort'>} [pagination={}]
   * @memberof EsCardBrochureSearchService
   */
  findRecentBrochures(pagination: Omit<BrochuresFilters, 'sort'> = {}) {
    return this.findBrochures(
      {
        ...pagination,
        sort: SortMode.RECENTLY_ADDED,
      },
    );
  }

  /**
   * Returns newest brochures cards from ES index
   *
   * @param {BrochuresFilters} filters
   * @memberof EsCardBrochureSearchService
   */
  async findBrochures(filters: BrochuresFilters = {}): Promise<BrochuresPaginationResult> {
    const {brochureEsIndex} = this;
    const {
      sort,
      offset = 0,
      limit = 10,
    } = filters;

    const query = (
      esb
        .boolQuery()
        .must(EsCardBrochureSearchService.createBrochuresCardsFilters(filters))
    );

    const hits = await brochureEsIndex.searchHits(
      esb
        .requestBodySearch()
        .source(EsCardBrochureSearchService.BROCHURE_ES_SOURCE_FIELDS)
        .sorts(EsCardBrochureSearchService.createSortQuery(sort))
        .from(offset ?? 0)
        .size(limit ?? 20)
        .query(query)
        .toJSON(),
    );

    return {
      items: hits.map(EsCardBrochureSearchService.hitToBrochureCard),
      meta: {
        limit,
        offset,
      },
    };
  }

  /**
   * Create list of filters for cards search
   *
   * @private
   * @static
   * @param {BrochuresFilters} {excludeIds}
   * @return {esb.Query[]}
   * @memberof EsCardBrochureSearchService
   */
  private static createBrochuresCardsFilters(
    {
      excludeIds,
      brandsIds,
    }: BrochuresFilters,
  ): esb.Query[] {
    const filters: esb.Query[] = [
      EsCardBrochureSearchService.createOnlyActiveBrochuresFilter(),
    ];

    if (brandsIds?.length) {
      filters.push(
        esb.nestedQuery(
          esb.termsQuery('brand.id', brandsIds),
          'brand',
        ),
      );
    }

    if (excludeIds?.length) {
      filters.push(
        esb.boolQuery().mustNot(
          esb.termsQuery('_id', excludeIds),
        ),
      );
    }

    return filters;
  }

  /**
   * Map elasticsearch hit to brochure card
   *
   * @private
   * @static
   * @param {any} hit
   * @return {BrochureCardRecord}
   * @memberof EsCardBrochureSearchService
   */
  private static hitToBrochureCard({_source: source}: any): BrochureCardRecord {
    return R.pickAll(
      EsCardBrochureSearchService.BROCHURE_ES_SOURCE_FIELDS,
      source,
    );
  }

  /**
   * Creates ES query to filter only active brochures
   *
   * @private
   * @static
   * @param {Date} [date=new Date]
   * @return {esb.NestedQuery}
   * @memberof EsCardBrochureSearchService
   */
  private static createOnlyActiveBrochuresFilter(date: Date = new Date): esb.NestedQuery {
    const normalizedDate = date.toISOString();
    const query = esb.boolQuery().must(
      [
        esb.rangeQuery('valid.from').lte(normalizedDate),
        esb.rangeQuery('valid.to').gte(normalizedDate),
      ],
    );

    return esb.nestedQuery(query, 'valid');
  }

  /**
   * Create sort es
   *
   * @private
   * @static
   * @param {SortMode} mode
   * @return {esb.Sort[]}
   * @memberof EsCardBrochureSearchService
   */
  private static createSortQuery(mode: SortMode): esb.Sort[] {
    switch (mode) {
      case SortMode.RECENTLY_ADDED:
        return [esb.sort('createdAt', 'desc')];

      case SortMode.ALPHABETIC:
        return [esb.sort('title.raw', 'asc')];

      default:
        return [esb.sort('id', 'desc')];
    }
  }
}
