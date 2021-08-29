import {APIRepo} from '@api/APIRepo';
import {SortMode} from '@shared/enums';
import {BrochureCardRecord, BrochureRecord} from '@api/types';
import {APIPaginationResult, BasicAPIPagination} from '@api/APIClient';

export type BrochuresPaginationResult = APIPaginationResult<BrochureCardRecord>;

export type BrochuresFilters = BasicAPIPagination & {
  sort?: SortMode,
  brandsIds?: number[],
  excludeIds?: number[],
};

export interface BrochuresRepo extends APIRepo<BrochureRecord, BrochuresFilters> {
  findRecentBrochures?(filters?: BrochuresFilters): Promise<BrochureCardRecord[]>;
}
