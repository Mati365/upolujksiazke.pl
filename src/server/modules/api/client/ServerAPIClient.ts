import {APIClient} from '@api/APIClient';
import {BooksServerRepo} from './repo';

export class ServerAPIClient extends APIClient {
  constructor() {
    super(
      {
        books: new BooksServerRepo,
      },
    );
  }
}
