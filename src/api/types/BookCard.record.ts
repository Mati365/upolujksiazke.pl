import {BookType} from '@shared/enums';
import {APIRecord} from '../APIRecord';
import {BookAuthorRecord} from './BookAuthor.record';
import {BookCardReleaseRecord} from './BookCardRelease.record';

export interface BookCardRecord extends APIRecord {
  parameterizedSlug: string;
  avgRating: number;
  totalRatings: number;
  lowestPrice: number;
  highestPrice: number;
  authors: BookAuthorRecord[];
  primaryRelease: BookCardReleaseRecord,
  allTypes: BookType[],
}
