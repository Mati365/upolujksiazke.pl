import {Expose} from 'class-transformer';

import {BookCountedAggs} from '@api/repo';
import {APICountedBucket} from '@api/APIRecord';
import {BookSchoolLevel, BookType} from '@shared/enums';
import {BucketType} from './AggsBucket.serializer';

import {BookCategorySerializer} from './BookCategory.serializer';
import {BookAuthorSerializer} from './BookAuthor.serializer';
import {BookPrizeSerializer} from './BookPrize.serializer';
import {BookGenreSerializer} from './BookGenre.serializer';
import {BookEraSerializer} from './BookEra.serializer';
import {BookPublisherSerializer} from './BookPublisher.serializer';

export class BookAggsSerializer implements Required<BookCountedAggs> {
  @Expose()
  @BucketType(() => BookCategorySerializer)
  categories: APICountedBucket<BookCategorySerializer>;

  @Expose()
  @BucketType(() => BookAuthorSerializer)
  authors: APICountedBucket<BookAuthorSerializer>;

  @Expose()
  @BucketType(() => BookType)
  types: APICountedBucket<BookType>;

  @Expose()
  @BucketType(() => BookPrizeSerializer)
  prizes: APICountedBucket<BookPrizeSerializer>;

  @Expose()
  @BucketType(() => BookGenreSerializer)
  genre: APICountedBucket<BookGenreSerializer>;

  @Expose()
  @BucketType(() => BookEraSerializer)
  era: APICountedBucket<BookEraSerializer>;

  @Expose()
  @BucketType(() => BookPublisherSerializer)
  publishers: APICountedBucket<BookPublisherSerializer>;

  @Expose()
  @BucketType(() => BookSchoolLevel)
  schoolLevels: APICountedBucket<BookSchoolLevel>;
}
