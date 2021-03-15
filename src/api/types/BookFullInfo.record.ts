import {BookCardRecord} from './BookCard.record';
import {BookCategoryRecord} from './BookCategory.record';
import {BookFullInfoReleaseRecord} from './BookFullInfoRelease.record';
import {BookTagRecord} from './BookTag.record';

export interface BookFullInfoRecord extends BookCardRecord {
  primaryRelease: BookFullInfoReleaseRecord;
  tags: BookTagRecord[],
  categories: BookCategoryRecord[],
  releases: BookFullInfoReleaseRecord[],
}
