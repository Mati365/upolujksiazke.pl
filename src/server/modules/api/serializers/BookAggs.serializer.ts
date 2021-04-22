import {Expose} from 'class-transformer';

import {BookAggs} from '@api/repo';
import {APICountedRecord} from '@api/APIRecord';
import {BookType} from '@shared/enums';
import {CountedRecordType} from './CountedRecord.serializer';

import {BookCategorySerializer} from './BookCategory.serializer';
import {BookAuthorSerializer} from './BookAuthor.serializer';
import {BookPrizeSerializer} from './BookPrize.serializer';
import {BookGenreSerializer} from './BookGenre.serializer';
import {BookEraSerializer} from './BookEra.serializer';
import {BookPublisherSerializer} from './BookPublisher.serializer';

export class BookAggsSerializer implements Required<BookAggs> {
  @Expose()
  @CountedRecordType(() => BookCategorySerializer)
  categories: APICountedRecord<BookCategorySerializer>[];

  @Expose()
  @CountedRecordType(() => BookAuthorSerializer)
  authors: APICountedRecord<BookAuthorSerializer>[];

  @Expose()
  @CountedRecordType(() => BookType)
  types: APICountedRecord<BookType>[];

  @Expose()
  @CountedRecordType(() => BookPrizeSerializer)
  prizes: APICountedRecord<BookPrizeSerializer>[];

  @Expose()
  @CountedRecordType(() => BookGenreSerializer)
  genre: APICountedRecord<BookGenreSerializer>[];

  @Expose()
  @CountedRecordType(() => BookEraSerializer)
  era: APICountedRecord<BookEraSerializer>[];

  @Expose()
  @CountedRecordType(() => BookPublisherSerializer)
  publishers: APICountedRecord<BookPublisherSerializer>[];

  @Expose()
  @CountedRecordType(() => Boolean)
  schoolBook: APICountedRecord<boolean>[];
}
