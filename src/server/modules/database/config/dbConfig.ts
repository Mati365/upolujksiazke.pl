import {SqlHighlighter} from '@mikro-orm/sql-highlighter';
import {MikroOrmModuleSyncOptions} from '@mikro-orm/nestjs';
import {Logger} from '@nestjs/common';

import {ENV} from '@server/constants/env';
import {isDevMode} from '@shared/helpers';

import {AuthorEntity} from '../../author/Author.entity';
import {BookEntity} from '../../book/Book.entity';
import {BookReviewEntity} from '../../book-review/BookReview.entity';

import {
  ScrapperMetadataEntity,
  ScrapperWebsiteEntity,
} from '../../scrapper/entity';

const logger = new Logger('MikroORM');

export const DB_CONFIG: MikroOrmModuleSyncOptions = {
  ...ENV.server.dbConfig,
  type: 'postgresql',
  highlighter: new SqlHighlighter,
  logger: logger.log.bind(logger),
  debug: isDevMode(),
  discovery: {
    disableDynamicFileAccess: true,
  },
  entities: [
    AuthorEntity,
    BookEntity,
    BookReviewEntity,
    ScrapperMetadataEntity,
    ScrapperWebsiteEntity,
  ],
  migrations: {
    path: './src/server/migrations',
    pattern: /^\d+-[\w-]+\.migration\.ts$/,
    disableForeignKeys: false,
    transactional: true,
  },
};
