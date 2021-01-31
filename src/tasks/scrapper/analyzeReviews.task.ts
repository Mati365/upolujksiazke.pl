import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '@scrapper/Scrapper.module';
import {ScrapperReanalyzerService} from '@scrapper/service/actions';

/**
 * Iterates over all records and parses them again,
 * it can remove reviews!
 *
 * @exports
 */
export const reanalyzeAllReviewsTask: TaskFunction = async () => {
  logger.log('Reanalyzing all reviews...');

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const {removed, updated} = await (
    app
      .select(ScrapperModule)
      .get(ScrapperReanalyzerService)
      .reanalyze()
  );
  await app.close();

  logger.log(`Reviews reanalyzed (removed: ${removed}, updated: ${updated})!`);
};
