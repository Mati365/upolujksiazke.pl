import {IsOptional} from 'class-validator';

import {APIBasicPaginationFilters} from '@server/modules/api/dto';
import {TransformBoolean} from '@server/common/transformers';

export class BooksRankingQueryFiltersDto extends APIBasicPaginationFilters {
  @IsOptional()
  @TransformBoolean()
  readonly selectDescription: boolean;
}
