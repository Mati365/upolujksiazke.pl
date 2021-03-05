import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';
import minimist from 'minimist';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '@scrapper/Scrapper.module';
import {ScrapperService} from '@scrapper/service';
import {SpiderService} from '@importer/modules/spider/service/Spider.service';

/**
 * Loads single item
 *
 * @export
 */
export const runSpiderTask: TaskFunction = async () => {
  const {website} = minimist(process.argv.slice(2));
  const app = await NestFactory.create(AppModule);
  const scrapperMod = app.select(ScrapperModule);

  app.enableShutdownHooks();

  await (
    scrapperMod
      .get(SpiderService)
      .runForScrappersGroup(
        scrapperMod.get(ScrapperService).getScrappersGroupByWebsiteURL(website),
      )
  );

  await app.close();
};
