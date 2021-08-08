import {Injectable} from '@nestjs/common';
import {Connection, EntityTarget} from 'typeorm';
import * as R from 'ramda';

import {
  createDbIteratedQuery,
  IdMappedEntityDbIterator,
  PredefinedEntityDbIterator,
} from '@server/common/helpers/db';

import {ImageVersion} from '@shared/enums';
import {BrochureEntity} from '../../entity/Brochure.entity';

@Injectable()
export class CardBrochureSearchService {
  public static readonly BROCHURE_CARD_FIELDS = [
    'brochure.id', 'brochure.title',
    'brochure.createdAt', 'brochure.parameterizedName',
    'brochure.validFrom', 'brochure.validTo',
    'brochure.nsfw', 'brochure.totalPages',
    'brand.id', 'brand.name', 'brand.parameterizedName',
    'brandLogo.version', 'brandAttachment.file',
  ];

  constructor(
    private readonly connection: Connection,
  ) {}

  /**
   * Creates basic query for cards
   *
   * @param {string[]} [selectFields=CardBrochureSearchService.BROCHURE_CARD_FIELDS]
   * @param {EntityTarget<BrochureEntity>} [from=BrochureEntity]
   * @memberof CardBrochureSearchService
   */
  createCardsQuery(
    selectFields: string[] = CardBrochureSearchService.BROCHURE_CARD_FIELDS,
    from: EntityTarget<BrochureEntity> = BrochureEntity,
  ) {
    const query = (
      this
        .connection
        .createQueryBuilder()
        .from(from, 'brochure')
    );

    query.expressionMap.mainAlias.metadata = query.connection.getMetadata(BrochureEntity);

    return (
      query
        .select(selectFields)
        .innerJoinAndSelect('brochure.brand', 'brand')
        .leftJoin('brand.logo', 'brandLogo', `brandLogo.version = '${ImageVersion.THUMB}'`)
        .leftJoin('brandLogo.attachment', 'brandAttachment')
    );
  }

  /**
   * Creates iterator that walks over Brochures table
   *
   * @template R
   * @param {PredefinedEntityDbIterator<BrochureEntity, R>} attrs
   * @memberof CardBrochureSearchService
   */
  createIteratedQuery<R>(attrs: PredefinedEntityDbIterator<BrochureEntity, R>) {
    return createDbIteratedQuery(
      {
        prefix: 'b',
        query: (
          BrochureEntity.createQueryBuilder('b')
        ),
        ...attrs,
      },
    );
  }

  /**
   * Create query that iterates over all brochures
   *
   * @param {IdMappedEntityDbIterator<BrochureEntity>} attrs
   * @memberof CardBrochureSearchService
   */
  createIdsIteratedQuery(attrs: IdMappedEntityDbIterator<BrochureEntity>) {
    return this.createIteratedQuery(
      {
        ...attrs,
        mapperFn: (result) => R.pluck('id', result),
      },
    );
  }
}
