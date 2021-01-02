import {TypeOrmModuleOptions} from '@nestjs/typeorm';

import {SERVER_ENV} from '@server/constants/env';
import {isDevMode} from '@shared/helpers';

import {TagEntity} from '@server/modules/tag/Tag.entity';

import {ScrapperMetadataEntity} from '../../importer/modules/scrapper/entity';
import {
  RemoteRecordEntity,
  RemoteWebsiteEntity,
} from '../../remote/entity';

import {AttachmentEntity} from '../../attachment/Attachment.entity';
import {BookEntity} from '../../book/Book.entity';
import {BookAuthorEntity} from '../../book/modules/author/BookAuthor.entity';
import {BookReviewEntity} from '../../book/modules/review/BookReview.entity';
import {BookCategoryEntity} from '../../book/modules/category/BookCategory.entity';
import {BookReviewerEntity} from '../../book/modules/reviewer/BookReviewer.entity';

export const DB_CONFIG: TypeOrmModuleOptions = {
  ...SERVER_ENV.dbConfig,
  type: 'postgres',
  logger: 'advanced-console',
  logging: (
    isDevMode()
      ? 'all'
      : false
  ),
  synchronize: false,
  entities: [
    RemoteWebsiteEntity,
    RemoteRecordEntity,
    AttachmentEntity,
    BookAuthorEntity,
    BookEntity,
    BookReviewEntity,
    BookCategoryEntity,
    BookReviewerEntity,
    ScrapperMetadataEntity,
    TagEntity,
  ],
};
