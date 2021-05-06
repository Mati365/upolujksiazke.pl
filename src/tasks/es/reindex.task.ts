import chalk from 'chalk';
import {TaskFunction} from 'gulp';
import {NestFactory} from '@nestjs/core';

import {ES_INDICES} from '@server/modules/database/config/esConfig';

import {logger} from '@tasks/utils/logger';
import {AppModule} from '@server/modules';

export const reindexAllTask: TaskFunction = async () => {
  logger.log('Reindexing...');

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  for await (const index of ES_INDICES) {
    const service = app.get(index);

    try {
      logger.log(`Reindexing ${chalk.white.bold(service.indexName)}...`);
      await service.reindexAllEntities();
    } catch (e) {
      logger.error(e);
    }
  }

  await app.close();

  logger.log('Reindexed!');
};
