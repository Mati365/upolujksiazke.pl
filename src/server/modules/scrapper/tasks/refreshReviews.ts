import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '../Scrapper.module';
import {ScrapperService} from '../service/Scrapper.service';

/**
 * Fetches new reviews
 *
 * @export
 */
export const refreshReviews: TaskFunction = async () => {
  logger.log('Refreshing reviews...');

  const app = await NestFactory.create(AppModule);

  await app
    .select(ScrapperModule)
    .get(ScrapperService)
    .refreshLatest();

  app.close();
};
