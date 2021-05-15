import {EntityManager} from 'typeorm';
import {Injectable, Inject, CACHE_MANAGER} from '@nestjs/common';
import {Cache} from 'cache-manager';

import {BookCategoryService} from '@server/modules/book/modules/category';
import {TagService} from '@server/modules/tag/Tag.service';
import {BookTagsStatsService} from '@server/modules/book/modules/stats/services/BookTagsStats.service';
import {BookTagsService} from '@server/modules/book/modules/tags/BookTags.service';
import {BookService} from '@server/modules/book/services/Book.service';
import {BookAuthorService} from '@server/modules/book/modules/author/BookAuthor.service';

import {
  CardBookSearchService,
  EsCardBookSearchService,
} from '@server/modules/book/modules/search/service';

import {ServerAPIClient} from '../client/ServerAPIClient';
@Injectable()
export class APIClientService {
  public readonly client = new ServerAPIClient(this);

  constructor(
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
    public readonly entityManager: EntityManager,
    public readonly bookService: BookService,
    public readonly bookCategoryService: BookCategoryService,
    public readonly cardBookSearchService: CardBookSearchService,
    public readonly esCardBookSearchService: EsCardBookSearchService,
    public readonly tagsService: TagService,
    public readonly bookTagsService: BookTagsService,
    public readonly bookTagsStatsService: BookTagsStatsService,
    public readonly bookAuthorService: BookAuthorService,
  ) {}
}
