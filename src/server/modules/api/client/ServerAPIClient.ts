import {APIClient} from '@api/APIClient';
import {RecentBooksServerRepo} from './repo';
import type {APIClientService} from '../services/APIClient.service';

export class ServerAPIClient extends APIClient {
  constructor(
    public readonly services: APIClientService,
  ) {
    super(
      {
        recentBooks: new RecentBooksServerRepo,
      },
    );
  }
}
