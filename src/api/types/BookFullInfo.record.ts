import {BookCardRecord} from './BookCard.record';
import {BookCategoryRecord} from './BookCategory.record';
import {BookFullInfoReleaseRecord} from './BookFullInfoRelease.record';
import {BookPrizeRecord} from './BookPrize.record';
import {TagRecord} from './Tag.record';

export interface BookFullInfoRecord extends BookCardRecord {
  originalPublishDate: string;
  primaryRelease: BookFullInfoReleaseRecord;
  tags: TagRecord[],
  categories: BookCategoryRecord[],
  releases: BookFullInfoReleaseRecord[],
  prizes: BookPrizeRecord[],
}
