import {APIClient} from '@api/APIClient';
import {APIConfig, JwtAPIClient} from '@api/jwt';
import {BooksAjaxRepo} from './repo';

export class AjaxAPIClient extends APIClient {
  public readonly asyncCaller: JwtAPIClient;

  constructor(config: APIConfig) {
    super(
      {
        books: new BooksAjaxRepo,
        booksCategories: null,
        recentBooks: null,
        tags: null,
      },
    );

    this.asyncCaller = new JwtAPIClient(config);
  }
}
