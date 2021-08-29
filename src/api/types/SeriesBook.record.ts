import {APIRecord} from '@api/APIRecord';
import {BookVolumeRecord} from './BookVolume.record';

export interface SeriesBookRecord extends APIRecord {
  defaultTitle: string;
  parameterizedSlug: string;
  avgRating: number;
  totalRatings: number;
  volume: BookVolumeRecord;
}
