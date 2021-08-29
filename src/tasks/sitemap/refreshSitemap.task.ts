import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules/App.module';
import {SitemapService} from '@server/modules/sitemap';

export const refreshSitemapTask: TaskFunction = async () => {
  logger.log('Refreshing sitemap...');

  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  await (
    app
      .get(SitemapService)
      .refresh()
  );

  await app.close();
  logger.log('Sitemap refreshed!');
};
