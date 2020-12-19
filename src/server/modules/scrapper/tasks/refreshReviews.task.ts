import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '../Scrapper.module';
import {ScrapperService} from '../service/Scrapper.service';

async function refreshReviews(config: Parameters<ScrapperService['refreshLatest']>[0]) {
  const app = await NestFactory.create(AppModule);

  await app
    .select(ScrapperModule)
    .get(ScrapperService)
    .refreshLatest(config);

  app.close();
}

/**
 * Fetches latest (single website page) reviews
 *
 * @export
 */
export const refreshLatestReviewsTask: TaskFunction = async () => {
  logger.log('Refreshing latest reviews...');
  await refreshReviews(
    {
      maxIterations: 1,
    },
  );
  logger.log('Latest reviews refreshed!');
};

/**
 * Fetches latest (all website pages) reviews
 *
 * @export
 */
export const refreshAllReviewsTask: TaskFunction = async () => {
  logger.log('Refreshing all reviews...');
  await refreshReviews(
    {
      maxIterations: null,
    },
  );
  logger.log('Latest all refreshed!');
};
