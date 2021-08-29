import {BookCardRecord} from './BookCard.record';
import {BookCategoryRecord} from './BookCategory.record';

export interface CategoryBooksGroup {
  category: BookCategoryRecord,
  items: BookCardRecord[],
}
