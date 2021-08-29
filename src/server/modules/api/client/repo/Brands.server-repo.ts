import {plainToClass} from 'class-transformer';

import {BrandsRepo} from '@api/repo';
import {BrandRecord} from '@api/types';
import {MeasureCallDuration} from '@server/common/helpers/decorators';

import {RedisMemoize} from '../../helpers';
import {BrandSerializer} from '../../serializers';
import {ServerAPIClientChild} from '../ServerAPIClientChild';

export class BrandsServerRepo extends ServerAPIClientChild implements BrandsRepo {
  get brandsService() {
    return this.services.brandsService;
  }

  @MeasureCallDuration('findOne')
  @RedisMemoize(
    {
      keyFn: (id: number) => ({
        key: `brand-${id}`,
      }),
    },
  )
  async findOne(id: number): Promise<BrandRecord> {
    return plainToClass(
      BrandSerializer,
      await this.brandsService.findOne(id),
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
