import {NestFactory} from '@nestjs/core';
import {TaskFunction} from 'gulp';
import minimist from 'minimist';
import * as R from 'ramda';

import {logger} from '@tasks/utils/logger';

import {AppModule} from '@server/modules/App.module';
import {ScrapperModule} from '@server/modules/importer/modules/scrapper/Scrapper.module';
import {ScrapperRefreshService} from '@server/modules/importer/modules/scrapper/service/actions';
import {ScrapperService} from '@server/modules/importer/modules/scrapper/service';
import {ScrapperMetadataKind} from '@server/modules/importer/modules/scrapper/entity';

/**
 * Refreshes all latest entities
 *
 * @param {Parameters<ScrapperRefreshService['refreshLatest']>[0]} config
 */
async function refreshLatest(config: Parameters<ScrapperRefreshService['refreshLatest']>[0]) {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  await (
    app
      .select(ScrapperModule)
      .get(ScrapperRefreshService)
      .refreshLatest(config)
  );

  app.close();
}

/**
 * Refreshes all from single scrapper
 *
 * @param {Object} attrs
 */
async function refreshScrapper(
  {
    page,
    website,
    kind,
  }: {
    page: number,
    website: string,
    kind: ScrapperMetadataKind,
  },
) {
  const app = await NestFactory.create(AppModule);
  const scrapperMod = app.select(ScrapperModule);
  app.enableShutdownHooks();

  await (
    scrapperMod
      .get(ScrapperRefreshService)
      .execScrapper(
        {
          kind,
          scrappersGroup: scrapperMod.get(ScrapperService).getScrappersGroupByWebsiteURL(website),
          maxIterations: null,
          initialPage: {
            page,
          },
        },
      )
  );

  app.close();
}

/**
 * Fetches latest (single website page) reviews
 *
 * @export
 */
export const refreshLatestReviewsTask: TaskFunction = async () => {
  const {kind} = minimist(process.argv.slice(2));

  logger.log('Refreshing latest items...');
  await refreshLatest(
    {
      kind: +ScrapperMetadataKind[kind],
      maxIterations: 1,
    },
  );
  logger.log('Latest items refreshed!');
};

/**
 * Fetches latest (all website pages) reviews
 *
 * @export
 */
export const refreshAllReviewsTask: TaskFunction = async () => {
  const {initialPage, website, kind} = minimist(process.argv.slice(2));

  logger.log('Refreshing all items...');

  if (website) {
    await refreshScrapper(
      {
        kind: +ScrapperMetadataKind[kind],
        page: (+initialPage) || 1,
        website,
      },
    );
  } else {
    await refreshLatest(
      {
        kind: +ScrapperMetadataKind[kind],
        maxIterations: null,
      },
    );
  }

  logger.log('All items refreshed!');
};

/**
 * Loads single item
 *
 * @export
 */
export const refreshSingleTask: TaskFunction = async () => {
  const {remoteId, website, kind} = minimist(process.argv.slice(2));

  logger.log('Refresh item...');

  const app = await NestFactory.create(AppModule);
  const scrapperMod = app.select(ScrapperModule);
  app.enableShutdownHooks();

  await (
    scrapperMod
      .get(ScrapperRefreshService)
      .refreshSingle(
        {
          kind: +ScrapperMetadataKind[kind],
          remoteId: R.toString(remoteId),
          scrappersGroup: scrapperMod.get(ScrapperService).getScrappersGroupByWebsiteURL(website),
        },
      )
  );

  app.close();
  logger.log('Item refreshed!');
};
