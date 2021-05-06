import {TaskFunction} from 'gulp';
import {NestFactory} from '@nestjs/core';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules';
import {ScrapperModule} from '@scrapper/Scrapper.module';
import {ScrapperRefreshService} from '@scrapper/service/actions';

export const fetchMissingLogosTask: TaskFunction = async () => {
  logger.log('Refreshing missing logos...');

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  await app
    .select(ScrapperModule)
    .get(ScrapperRefreshService)
    .refreshWebsites();

  await app.close();

  logger.log('All logos refreshed!');
};
