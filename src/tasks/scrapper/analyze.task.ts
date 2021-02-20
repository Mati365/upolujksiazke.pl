import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';
import minimist from 'minimist';

import {logger} from '@tasks/utils/logger';
import {safeToNumber, safeToString} from '@shared/helpers';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '@scrapper/Scrapper.module';
import {ScrapperReanalyzerService} from '@scrapper/service/actions';
import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';
import {ScrapperService} from '@server/modules/importer/modules/scrapper/service';

/**
 * Iterates over all records and parses them again,
 * it can remove reviews!
 *
 * @exports
 */
export const reanalyzeAllTask: TaskFunction = async () => {
  logger.log('Reanalyzing all items...');

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const {removed, updated} = await (
    app
      .select(ScrapperModule)
      .get(ScrapperReanalyzerService)
      .reanalyze()
  );
  await app.close();

  logger.log(`Items reanalyzed (removed: ${removed}, updated: ${updated})!`);
};

/**
 * Reanalyzes single item
 *
 * @exports
 */
export const reanalyzeSingleTask: TaskFunction = async () => {
  const {remoteId, website, kind} = minimist(process.argv.slice(2));

  logger.log('Reanalyzing item...');

  const app = await NestFactory.create(AppModule);
  const scrapperMod = app.select(ScrapperModule);
  app.enableShutdownHooks();

  await (
    app
      .select(ScrapperModule)
      .get(ScrapperReanalyzerService)
      .reanalyzeSingle(
        {
          kind: safeToNumber(ScrapperMetadataKind[kind]),
          remoteId: safeToString(remoteId),
          scrappersGroup: scrapperMod.get(ScrapperService).getScrappersGroupByWebsiteURL(website),
        },
      )
  );

  await app.close();
  logger.log('Item reanalyzed!');
};
