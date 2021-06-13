import {APIClient} from '@api/APIClient';
import {APIConfig, JwtAPIClient} from '@api/jwt';
import {
  BooksAjaxRepo,
  BooksReviewsAjaxRepo,
  TrackerAjaxRepo,
} from './repo';

export class AjaxAPIClient extends APIClient {
  public readonly asyncCaller: JwtAPIClient;

  constructor(config: APIConfig) {
    super(
      {
        books: new BooksAjaxRepo,
        booksReviews: new BooksReviewsAjaxRepo,
        tracker: new TrackerAjaxRepo,
        booksCategories: null,
        recentBooks: null,
        tags: null,
        authors: null,
      },
    );

    this.asyncCaller = new JwtAPIClient(config);
  }
}
