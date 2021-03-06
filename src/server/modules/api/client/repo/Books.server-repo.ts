import {APIClientChild} from '@api/APIClient';
import {BooksRepo, CategoryGroupedBooks} from '@api/repo';

import type {ServerAPIClient} from '../ServerAPIClient';

export class BooksServerRepo extends APIClientChild<ServerAPIClient> implements BooksRepo {
  findRecentCategoriesBooks(): CategoryGroupedBooks {
    return [];
  }
}
