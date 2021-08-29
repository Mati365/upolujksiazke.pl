import {Expose, Type} from 'class-transformer';

import {CategoryBooksGroup} from '@api/types/CategoryBooksGroup.record';
import {BookCardSerializer} from './BookCard.serializer';
import {BookCategorySerializer} from './BookCategory.serializer';

export class BookCategoryGroupSerializer implements CategoryBooksGroup {
  @Expose()
  @Type(() => BookCategorySerializer)
  category: BookCategorySerializer;

  @Expose()
  @Type(() => BookCardSerializer)
  items: BookCardSerializer[];
}
