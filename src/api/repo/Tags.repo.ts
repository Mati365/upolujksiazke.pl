import {CanBePromise} from '@shared/types';

import {APIRepo} from '../APIRepo';
import {TagRecord} from '../types/Tag.record';

export type MostPopularTagsFilters = {
  limit: number,
};

export interface TagsRepo extends APIRepo<TagRecord> {
  findMostPopularBooksTags(filters: MostPopularTagsFilters): CanBePromise<TagRecord[]>;
}
