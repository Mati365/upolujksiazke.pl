import {BookReviewRecord} from './BookReview.record';
import {BookCardRecord} from './BookCard.record';
import {BookCategoryRecord} from './BookCategory.record';
import {BookFullInfoReleaseRecord} from './BookFullInfoRelease.record';
import {BookPrizeRecord} from './BookPrize.record';
import {BookEraRecord} from './BookEra.record';
import {BookGenreRecord} from './BookGenre.record';
import {BookSummaryRecord} from './BookSummary.record';
import {TagRecord} from './Tag.record';
import {SeriesBookRecord} from './SeriesBook.record';
import {SchoolBookRecord} from './SchoolBook.record';

export interface BookFullInfoRecord extends BookCardRecord {
  taggedDescription: string;
  originalPublishYear: number;
  schoolBook: SchoolBookRecord;
  primaryRelease: BookFullInfoReleaseRecord;
  tags: TagRecord[];
  categories: BookCategoryRecord[];
  primaryCategory: BookCategoryRecord;
  releases: BookFullInfoReleaseRecord[];
  prizes: BookPrizeRecord[];
  reviews: BookReviewRecord[];
  summaries: BookSummaryRecord[];
  hierarchy: SeriesBookRecord[];
  genre: BookGenreRecord[];
  era: BookEraRecord[];
}
