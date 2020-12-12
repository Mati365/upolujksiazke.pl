import {SqlHighlighter} from '@mikro-orm/sql-highlighter';
import {MikroOrmModuleSyncOptions} from '@mikro-orm/nestjs';

import {Logger} from '@nestjs/common';

import {isDevMode} from '@shared/helpers';

import {ENV} from '@server/constants/env';
import {BookEntity} from '../../book/Book.entity';

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
    BookEntity,
  ],
  migrations: {
    path: './src/server/migrations',
  },
};
