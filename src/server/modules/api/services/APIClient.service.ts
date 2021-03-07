import {EntityManager} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {BookService} from '@server/modules/book';
import {ServerAPIClient} from '../client/ServerAPIClient';

@Injectable()
export class APIClientService {
  public readonly client = new ServerAPIClient(this);

  constructor(
    public readonly entityManager: EntityManager,
    public readonly bookService: BookService,
  ) {}
}
