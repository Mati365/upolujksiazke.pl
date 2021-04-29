import {APIClient} from '@api/APIClient';
import {APIConfig, JwtAPIClient} from '@api/jwt';

export class AjaxAPIClient extends APIClient {
  public readonly asyncCaller: JwtAPIClient;

  constructor(config: APIConfig) {
    super(
      {
        recentBooks: null,
        books: null,
        booksCategories: null,
        tags: null,
      },
    );

    this.asyncCaller = new JwtAPIClient(config);
  }
}
