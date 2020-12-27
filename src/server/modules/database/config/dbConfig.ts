import {TypeOrmModuleOptions} from '@nestjs/typeorm';

import {ENV} from '@server/constants/env';
import {isDevMode} from '@shared/helpers';

import {AuthorEntity} from '../../author/Author.entity';
import {BookEntity} from '../../book/Book.entity';
import {BookReviewEntity} from '../../book-review/BookReview.entity';
import {BookCategoryEntity} from '../../book-category/BookCategory.entity';
import {BookReviewerEntity} from '../../book-reviewer/BookReviewer.entity';

import {
  ScrapperMetadataEntity,
  ScrapperRemoteEntity,
  ScrapperWebsiteEntity,
} from '../../importer/modules/scrapper/entity';

export const DB_CONFIG: TypeOrmModuleOptions = {
  ...ENV.server.dbConfig,
  type: 'postgres',
  logger: 'advanced-console',
  logging: (
    isDevMode()
      ? 'all'
      : false
  ),
  synchronize: true,
  entities: [
    AuthorEntity,
    BookEntity,
    BookReviewEntity,
    BookCategoryEntity,
    BookReviewerEntity,
    ScrapperMetadataEntity,
    ScrapperWebsiteEntity,
    ScrapperRemoteEntity,
  ],
};
