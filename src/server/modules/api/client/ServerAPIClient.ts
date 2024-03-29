import {APIClient} from '@api/APIClient';
import {
  BooksCategoriesServerRepo,
  BooksServerRepo,
  BooksAuthorsServerRepo,
  BooksReviewsServerRepo,
  RecentBooksServerRepo,
  TagsServerRepo,
  UsersServerRepo,
  BrochuresServerRepo,
  BrandsServerRepo,
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
        booksReviews: new BooksReviewsServerRepo,
        authors: new BooksAuthorsServerRepo,
        tags: new TagsServerRepo,
        users: new UsersServerRepo,
        brochures: new BrochuresServerRepo,
        brands: new BrandsServerRepo,
        tracker: null,
      },
    );
  }
}
