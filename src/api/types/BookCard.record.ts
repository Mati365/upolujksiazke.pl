import {BookType} from '@shared/enums';
import {BookAuthorRecord} from './BookAuthor.record';
import {BookCardReleaseRecord} from './BookCardRelease.record';
import {SeriesBookRecord} from './SeriesBook.record';

export interface BookCardRecord extends SeriesBookRecord {
  lowestPrice: number;
  highestPrice: number;
  authors: BookAuthorRecord[];
  primaryRelease: BookCardReleaseRecord,
  allTypes: BookType[];
  schoolBookId: number;
}
