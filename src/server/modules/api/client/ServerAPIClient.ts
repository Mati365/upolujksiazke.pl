import {APIClient} from '@api/APIClient';
import {
  BooksCategoriesServerRepo,
  BooksServerRepo,
  RecentBooksServerRepo,
  TagsServerRepo,
} from './repo';

import type {APIClientService} from '../services/APIClient.service';

export class ServerAPIClient extends APIClient {
  constructor(
    public readonly services: APIClientService,
  ) {
    super(
      {
        recentBooks: new RecentBooksServerRepo,
        books: new BooksServerRepo,
        booksCategories: new BooksCategoriesServerRepo,
        tags: new TagsServerRepo,
      },
    );
  }
}
