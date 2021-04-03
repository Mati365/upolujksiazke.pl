import {EntityManager} from 'typeorm';
import {Injectable, Inject, CACHE_MANAGER} from '@nestjs/common';
import {Cache} from 'cache-manager';

import {
  CardBookSearchService,
  BookService,
} from '@server/modules/book';

import {ServerAPIClient} from '../client/ServerAPIClient';

@Injectable()
export class APIClientService {
  public readonly client = new ServerAPIClient(this);

  constructor(
    public readonly entityManager: EntityManager,
    public readonly bookService: BookService,
    public readonly cardBookSearchService: CardBookSearchService,
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
  ) {}
}
