import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '@scrapper/Scrapper.module';
import {SpiderService} from '@importer/modules/spider/service/Spider.service';

/**
 * Loads single item
 *
 * @export
 */
export const runSpiderTask: TaskFunction = async () => {
  const app = await NestFactory.create(AppModule);
  const scrapperMod = app.select(ScrapperModule);
  app.enableShutdownHooks();

  await (
    scrapperMod
      .get(SpiderService)
      .run()
  );

  await app.close();
};
