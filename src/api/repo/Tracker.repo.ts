import {TrackRecord} from '@api/types';
import {APIRepo} from '../APIRepo';

export interface TrackerRepo extends APIRepo<void> {
  trackViewsCount(record: TrackRecord): Promise<void>;
}
