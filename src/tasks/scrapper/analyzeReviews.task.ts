import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '@server/modules/importer/modules/scrapper/Scrapper.module';
import {ScrapperReanalyzerService} from '@server/modules/importer/modules/scrapper/service/actions';

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
  app.close();

  logger.log(`Reviews reanalyzed (removed: ${removed}, updated: ${updated})!`);
};