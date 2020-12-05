import {APIClient} from '../utils/APIClient';
import {BooksRepo} from './base';

export class AppAPIRepo {
  public readonly books: BooksRepo;

  constructor(protected api: APIClient) {
    this.books = new BooksRepo(api);
  }
}
