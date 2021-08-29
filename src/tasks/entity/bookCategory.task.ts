import {TaskFunction} from 'gulp';
import {NestFactory} from '@nestjs/core';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules';
import {ScrapperModule} from '@scrapper/Scrapper.module';
import {BookCategoryRankingService} from '@server/modules/book/modules/category';

export const refreshCategoriesRanking: TaskFunction = async () => {
  logger.log('Refreshing categories ranking...');

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  await app
    .select(ScrapperModule)
    .get(BookCategoryRankingService)
    .refreshCategoryRanking();

  await app.close();

  logger.log('All categories refreshed!');
};
