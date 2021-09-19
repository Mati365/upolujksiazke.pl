import {TaskFunction} from 'gulp';
import {NestFactory} from '@nestjs/core';
import minimist from 'minimist';
import * as R from 'ramda';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '@scrapper/Scrapper.module';
import {BookScrapperTaskRunner} from '@server/modules/importer/kinds/tasks-runners';

export const fetchAvailabilityForScrapper: TaskFunction = async () => {
  const {scrapperGroupId} = minimist(process.argv.slice(2));
  if (R.isNil(scrapperGroupId)) {
    logger.error('Missing scrapper group id param!');
    return;
  }

  console.info(scrapperGroupId);

  const app = await NestFactory.create(AppModule);
  const scrapperMod = app.select(ScrapperModule);
  app.enableShutdownHooks();

  logger.log(`Loading availability for scrapper group(ID: ${scrapperGroupId})!`);
  await (
    scrapperMod
      .get(BookScrapperTaskRunner)
      .fetchAvailabilityForScrapper(
        {
          scrapperGroupId: +scrapperGroupId,
        },
      )
  );
  logger.log('Availability loaded!');

  await app.close();
};
