import {BookReviewRecord} from './BookReview.record';
import {BookCardRecord} from './BookCard.record';
import {BookCategoryRecord} from './BookCategory.record';
import {BookFullInfoReleaseRecord} from './BookFullInfoRelease.record';
import {BookPrizeRecord} from './BookPrize.record';
import {TagRecord} from './Tag.record';
import {SeriesBookRecord} from './SeriesBook.record';
import {SchoolBookRecord} from './SchoolBook.record';

export interface BookFullInfoRecord extends BookCardRecord {
  description: string;
  taggedDescription: string;
  originalPublishDate: string;
  schoolBook: SchoolBookRecord;
  primaryRelease: BookFullInfoReleaseRecord;
  tags: TagRecord[];
  categories: BookCategoryRecord[];
  releases: BookFullInfoReleaseRecord[];
  prizes: BookPrizeRecord[];
  reviews: BookReviewRecord[];
  hierarchy: SeriesBookRecord[];
}
