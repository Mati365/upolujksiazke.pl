import {BookType} from '@shared/enums';
import {APIRecord} from '../APIRecord';
import {BookAuthorRecord} from './BookAuthor.record';
import {BookCardReleaseRecord} from './BookCardRelease.record';
import {BookVolumeRecord} from './BookVolume.record';

export interface BookCardRecord extends APIRecord {
  defaultTitle: string;
  parameterizedSlug: string;
  avgRating: number;
  totalRatings: number;
  lowestPrice: number;
  highestPrice: number;
  volume: BookVolumeRecord,
  authors: BookAuthorRecord[];
  primaryRelease: BookCardReleaseRecord,
  allTypes: BookType[],
}
