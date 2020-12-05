import {APIClient} from '@client/modules/api/utils/APIClient';
import {ListItem} from '@shared/types';
import {PaginationFilters} from '../BaseAPIRepo';
import {BaseCrudEntity, CrudAPIRepo} from '../CrudAPIRepo';

export type Author = BaseCrudEntity & ListItem;

export type Book = BaseCrudEntity & {
  title: string,
  isbn: string,
  author: Author,
};

export type BooksOnlyFilters = Pick<Book, 'id' | 'isbn' | 'title'>;

export type BooksFilters = PaginationFilters<Partial<Book>>;

/**
 * Books repository
 *
 * @export
 * @class BooksRepo
 * @extends {CrudAPIRepo<Book, BooksFilters>}
 */
export class BooksRepo extends CrudAPIRepo<Book, BooksFilters> {
  constructor(api: APIClient) {
    super(
      {
        api,
        resourceName: 'books',
      },
    );
  }
}
