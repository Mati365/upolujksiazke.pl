import {plainToClass} from 'class-transformer';

import {BrochuresFilters, BrochuresRepo} from '@api/repo';
import {BrochureRecord} from '@api/types';
import {MeasureCallDuration} from '@server/common/helpers/decorators';

import {RedisMemoize} from '../../helpers';
import {ServerAPIClientChild} from '../ServerAPIClientChild';
import {BrochureCardSerializer} from '../../serializers';

export class BrochuresServerRepo extends ServerAPIClientChild implements BrochuresRepo {
  get esBrochuresService() {
    return this.services.esBrochureSearchService;
  }

  /**
   * Finds single brochure
   *
   * @param {number} id
   * @return {Promise<BrochureRecord>}
   * @memberof BrochureServerRepo
   */
  @MeasureCallDuration('findOne')
  @RedisMemoize(
    {
      keyFn: (id: number) => ({
        key: `brochure-${id}`,
      }),
    },
  )
  findOne(id: number): Promise<BrochureRecord> {
    return this.esBrochuresService.findFullCard(
      {
        id,
      },
    );
  }

  /**
   * Picks newest brochures
   *
   * @param {BrochuresFilters} filters
   * @returns
   * @memberof BrochuresServerRepo
   */
  @MeasureCallDuration('findRecentBrochures')
  @RedisMemoize(
    {
      keyFn: (filters) => ({
        key: `recent-brochures-${JSON.stringify(filters)}`,
      }),
    },
  )
  async findRecentBrochures(attrs: BrochuresFilters = {}) {
    const {items} = await this.esBrochuresService.findRecentBrochures(attrs);

    return plainToClass(
      BrochureCardSerializer,
      items,
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
